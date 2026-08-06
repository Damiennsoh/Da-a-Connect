// Orders API for Amazon Clone using Prisma
const express = require("express");
const prisma = require("./prisma/client");
const router = express.Router();

// Create a new order (called from payment endpoint, requires auth)
const { authenticateToken } = require("./authMiddleware");
const { ensureUser } = require("./lib/users");

router.post("/orders", authenticateToken, async (req, res) => {
  console.log("Order endpoint hit. Body:", req.body);
  
  // Create a new Prisma client for this request to avoid prepared statement conflicts
  const { PrismaClient } = require("@prisma/client");
  const requestPrisma = new PrismaClient();
  
  try {
    const authId = req.authId;
    const {
      totalAmount,
      paymentStatus,
      shippingDetails,
      items,
      email,
      name,
      discount,
      subTotal,
      promoCode,
    } = req.body;
    
    if (!authId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing required order data." });
    }

    // Ensure user exists in DB
    let user;
    try {
      user = await requestPrisma.user.findUnique({
        where: { authId: authId },
      });
      if (!user) {
        user = await requestPrisma.user.create({
          data: {
            authId: authId,
            email: email || `${authId}@unknown.com`,
            name: name || null,
            password: "",
          },
        });
      }
    } catch (err) {
      console.error("User lookup/creation failed:", err);
      return res.status(500).json({ error: "Failed to process user data" });
    }

    // Store shippingDetails as JSON string in address field
    const order = await requestPrisma.order.create({
      data: {
        userId: user.id,
        total: totalAmount,
        status: paymentStatus,
        address: shippingDetails ? JSON.stringify(shippingDetails) : "",
        discount: discount ?? 0,
        subTotal: subTotal ?? 0,
        promoCode: promoCode ?? "",
        items: {
          create: items.map((item) => ({
            productId: String(item.productId),
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image || null,
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(order);
  } catch (err) {
    console.error("[ORDER CREATE ERROR]", err);
    res
      .status(500)
      .json({ error: "Failed to create order", details: err.message });
  } finally {
    // Clean up the request-specific Prisma client
    await requestPrisma.$disconnect();
  }
});

// Get all orders for the authenticated user
router.get("/orders", authenticateToken, async (req, res) => {
  try {
    const authId = req.authId;

    const user = await prisma.user.findUnique({ where: { authId } });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    console.error("[ORDER FETCH ERROR]", err);
    res
      .status(500)
      .json({ error: "Failed to fetch orders", details: err.message });
  }
});

module.exports = router;
