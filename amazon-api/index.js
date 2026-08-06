const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Aurora's integration exposes POSTGRES_PRISMA_URL/POSTGRES_URL rather than DATABASE_URL.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

const app = express();
const Stripe = require("stripe");
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = (process.env.CORS_ORIGINS || clientUrl)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const ordersApi = require("./orders");
const catalogApi = require("./catalog");
const { authenticateToken } = require("./authMiddleware");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any localhost origin (e.g. 5173, 5174, etc.)
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const prisma = require("./prisma/client");

app.post("/api/payment/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send("Stripe Webhook is not configured.");
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[WEBHOOK ERROR]", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    try {
      const authId = session.metadata?.authId;
      
      if (authId) {
        // Find user by authId
        let user = await prisma.user.findUnique({
          where: { authId }
        });
        
        if (user) {
          // In a real app you'd fetch the line items from Stripe to get the actual cart contents.
          // For now, we record a top-level order with the total amount.
          await prisma.order.create({
            data: {
              userId: user.id,
              total: session.amount_total / 100,
              status: "PAID",
              address: session.shipping_details?.address?.line1 || "No address provided"
            }
          });
        }
      }
    } catch (dbError) {
      console.error("[WEBHOOK DB ERROR]", dbError);
    }
  }

  res.json({ received: true });
});

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    stripeConfigured: Boolean(stripe),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    supabaseConfigured: Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_JWT_SECRET
    ),
  });
});

app.use("/api", ordersApi);
app.use("/api", catalogApi);

app.post("/api/payment/create-checkout-session", authenticateToken, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: "Stripe is not configured on the backend." });
  }

  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ error: "Invalid items array." });
  }

  for (const item of items) {
    const amount = item?.price_data?.unit_amount;
    const quantity = item?.quantity;
    if (
      !Number.isInteger(amount) ||
      amount <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > 99 ||
      !item.price_data.product_data?.name
    ) {
      return res.status(400).json({ error: "Invalid checkout item." });
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: items,
      mode: "payment",
      success_url: `${clientUrl}/success`,
      cancel_url: `${clientUrl}/cancel`,
      metadata: {
        authId: req.authId
      }
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("[STRIPE CHECKOUT ERROR]", error);
    return res.status(502).json({ error: "Unable to start Stripe Checkout." });
  }
});

app.post("/api/payment/create-payment-intent", async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: "Stripe is not configured on the backend." });
  }

  const { amount } = req.body;
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999.99) {
    return res.status(400).json({ error: "Invalid payment amount." });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("[STRIPE PAYMENT INTENT ERROR]", error);
    return res.status(502).json({ error: "Unable to create payment intent." });
  }
});

app.use((error, _req, res, _next) => {
  if (error?.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ error: error.message });
  }
  console.error("[API ERROR]", error);
  return res.status(500).json({ error: "Internal Server Error" });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
