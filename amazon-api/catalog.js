const express = require("express");
const prisma = require("./prisma/client");
const { authenticateToken } = require("./authMiddleware");
const { ensureUser } = require("./lib/users");
const { serializeProduct } = require("./lib/products");

const router = express.Router();

async function getVendorForUser(userId) {
  return prisma.vendor.findUnique({
    where: { userId },
    include: { user: true },
  });
}

async function requireVendor(req, res, next) {
  try {
    const user = await ensureUser(req.authId, {
      email: req.authEmail || req.body?.email,
      name: req.authName || req.body?.name,
    });
    const vendor = await getVendorForUser(user.id);

    if (!vendor) {
      return res.status(403).json({ error: "Vendor profile required." });
    }

    req.dbUser = user;
    req.vendor = vendor;
    next();
  } catch (error) {
    console.error("[VENDOR AUTH ERROR]", error);
    res.status(500).json({ error: "Unable to verify vendor access." });
  }
}

router.get("/vendors/me", authenticateToken, async (req, res) => {
  try {
    const user = await ensureUser(req.authId, {
      email: req.authEmail,
      name: req.authName,
    });
    const vendor = await getVendorForUser(user.id);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor profile not found." });
    }

    res.json({
      id: vendor.id,
      shopName: vendor.shopName,
      description: vendor.description,
      location: vendor.location,
      city: vendor.city,
      region: vendor.region,
      verified: vendor.verified,
      role: user.role,
      createdAt: vendor.createdAt,
    });
  } catch (error) {
    console.error("[VENDOR ME ERROR]", error);
    res.status(500).json({ error: "Unable to fetch vendor profile." });
  }
});

router.post("/vendors/register", authenticateToken, async (req, res) => {
  try {
    const { shopName, description, location, city, region, email, name } =
      req.body;

    if (!shopName?.trim() || !location?.trim()) {
      return res
        .status(400)
        .json({ error: "Shop name and location are required." });
    }

    const user = await ensureUser(req.authId, {
      email: req.authEmail || email,
      name: req.authName || name,
    });
    const existingVendor = await getVendorForUser(user.id);

    if (existingVendor) {
      return res.status(409).json({ error: "Vendor profile already exists." });
    }

    const vendor = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { role: "VENDOR" },
      });

      return tx.vendor.create({
        data: {
          userId: user.id,
          shopName: shopName.trim(),
          description: description?.trim() || null,
          location: location.trim(),
          city: city?.trim() || null,
          region: region?.trim() || null,
        },
      });
    });

    res.status(201).json({
      id: vendor.id,
      shopName: vendor.shopName,
      description: vendor.description,
      location: vendor.location,
      city: vendor.city,
      region: vendor.region,
      verified: vendor.verified,
      role: "VENDOR",
      createdAt: vendor.createdAt,
    });
  } catch (error) {
    console.error("[VENDOR REGISTER ERROR]", error);
    res.status(500).json({ error: "Unable to create vendor profile." });
  }
});

router.patch("/vendors/me", authenticateToken, requireVendor, async (req, res) => {
  try {
    const { shopName, description, location, city, region } = req.body;
    const vendor = await prisma.vendor.update({
      where: { id: req.vendor.id },
      data: {
        ...(shopName !== undefined ? { shopName: shopName.trim() } : {}),
        ...(description !== undefined
          ? { description: description?.trim() || null }
          : {}),
        ...(location !== undefined ? { location: location.trim() } : {}),
        ...(city !== undefined ? { city: city?.trim() || null } : {}),
        ...(region !== undefined ? { region: region?.trim() || null } : {}),
      },
    });

    res.json({
      id: vendor.id,
      shopName: vendor.shopName,
      description: vendor.description,
      location: vendor.location,
      city: vendor.city,
      region: vendor.region,
      verified: vendor.verified,
      role: "VENDOR",
      createdAt: vendor.createdAt,
    });
  } catch (error) {
    console.error("[VENDOR UPDATE ERROR]", error);
    res.status(500).json({ error: "Unable to update vendor profile." });
  }
});

router.get("/vendors/me/products", authenticateToken, requireVendor, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { vendorId: req.vendor.id },
      orderBy: { updatedAt: "desc" },
      include: { vendor: true },
    });

    res.json(products.map(serializeProduct));
  } catch (error) {
    console.error("[VENDOR PRODUCTS ERROR]", error);
    res.status(500).json({ error: "Unable to fetch vendor products." });
  }
});

router.get("/products", async (req, res) => {
  try {
    const { category, q, vendorId } = req.query;
    const where = { status: "ACTIVE" };

    if (category) where.category = String(category);
    if (vendorId) where.vendorId = String(vendorId);

    let products = await prisma.product.findMany({
      where,
      include: { vendor: true },
      orderBy: { createdAt: "desc" },
    });

    if (q) {
      const query = String(q).toLowerCase();
      products = products.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.location.toLowerCase().includes(query)
      );
    }

    res.json(products.map(serializeProduct));
  } catch (error) {
    console.error("[PRODUCT LIST ERROR]", error);
    res.status(500).json({ error: "Unable to fetch products." });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, status: "ACTIVE" },
      include: { vendor: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.json(serializeProduct(product));
  } catch (error) {
    console.error("[PRODUCT DETAIL ERROR]", error);
    res.status(500).json({ error: "Unable to fetch product." });
  }
});

router.post("/products", authenticateToken, requireVendor, async (req, res) => {
  try {
    const { title, description, price, category, images, location } = req.body;

    if (!title?.trim() || !description?.trim() || !category?.trim()) {
      return res
        .status(400)
        .json({ error: "Title, description, and category are required." });
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: "Price must be greater than zero." });
    }

    const imageList = Array.isArray(images)
      ? images.filter(Boolean).slice(0, 5)
      : [];

    if (imageList.length === 0) {
      return res.status(400).json({ error: "At least one product image is required." });
    }

    const product = await prisma.product.create({
      data: {
        vendorId: req.vendor.id,
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        category: category.trim(),
        images: imageList,
        location: (location || req.vendor.location).trim(),
        status: "ACTIVE",
      },
      include: { vendor: true },
    });

    res.status(201).json(serializeProduct(product));
  } catch (error) {
    console.error("[PRODUCT CREATE ERROR]", error);
    res.status(500).json({ error: "Unable to create product." });
  }
});

router.patch("/products/:id", authenticateToken, requireVendor, async (req, res) => {
  try {
    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, vendorId: req.vendor.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Product not found." });
    }

    const { title, description, price, category, images, location, status } =
      req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description.trim();
    if (category !== undefined) data.category = category.trim();
    if (location !== undefined) data.location = location.trim();
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: "Price must be greater than zero." });
      }
      data.price = parsedPrice;
    }
    if (images !== undefined) {
      const imageList = Array.isArray(images)
        ? images.filter(Boolean).slice(0, 5)
        : [];
      if (imageList.length === 0) {
        return res.status(400).json({ error: "At least one product image is required." });
      }
      data.images = imageList;
    }
    if (status === "REMOVED" || status === "ACTIVE") {
      data.status = status;
    }

    const product = await prisma.product.update({
      where: { id: existing.id },
      data,
      include: { vendor: true },
    });

    res.json(serializeProduct(product));
  } catch (error) {
    console.error("[PRODUCT UPDATE ERROR]", error);
    res.status(500).json({ error: "Unable to update product." });
  }
});

router.delete("/products/:id", authenticateToken, requireVendor, async (req, res) => {
  try {
    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, vendorId: req.vendor.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Product not found." });
    }

    await prisma.product.update({
      where: { id: existing.id },
      data: { status: "REMOVED" },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("[PRODUCT DELETE ERROR]", error);
    res.status(500).json({ error: "Unable to remove product." });
  }
});

module.exports = router;
