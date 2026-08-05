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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    stripeConfigured: Boolean(stripe),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    firebaseConfigured: Boolean(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
        (process.env.FIREBASE_PROJECT_ID &&
          process.env.FIREBASE_CLIENT_EMAIL &&
          process.env.FIREBASE_PRIVATE_KEY)
    ),
  });
});

app.use("/api", ordersApi);

app.post("/api/payment/create-checkout-session", async (req, res) => {
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
