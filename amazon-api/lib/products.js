function serializeProduct(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    image: images[0] || "",
    images,
    location: product.location,
    status: product.status,
    source: "catalog",
    rating: { rate: 0, count: 0 },
    vendor: product.vendor
      ? {
          id: product.vendor.id,
          shopName: product.vendor.shopName,
          location: product.vendor.location,
          city: product.vendor.city,
          region: product.vendor.region,
        }
      : null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

module.exports = { serializeProduct };
