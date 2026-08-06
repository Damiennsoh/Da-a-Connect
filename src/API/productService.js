import axios from "axios";
import productBaseURL, { backendBaseURL } from "./endPoints";
import { apiGet, apiPost, apiPatch, apiDelete } from "./apiClient";

export function normalizeCatalogProduct(product) {
  return {
    ...product,
    image: product.image || product.images?.[0] || "",
    rating: product.rating || { rate: 0, count: 0 },
    source: "catalog",
  };
}

export async function fetchCatalogProducts({ category, q } = {}) {
  try {
    const params = {};
    if (category) params.category = category;
    if (q) params.q = q;
    const { data } = await axios.get(`${backendBaseURL}/products`, { params });
    return Array.isArray(data) ? data.map(normalizeCatalogProduct) : [];
  } catch {
    return [];
  }
}

export async function fetchCatalogProduct(id) {
  try {
    const { data } = await axios.get(`${backendBaseURL}/products/${id}`);
    return normalizeCatalogProduct(data);
  } catch {
    return null;
  }
}

export async function fetchFakeStoreProducts() {
  try {
    const { data } = await axios.get(`${productBaseURL}/products`);
    return data.map((product) => ({ ...product, source: "fakestore" }));
  } catch {
    return [];
  }
}

export async function fetchFakeStoreProduct(id) {
  try {
    const { data } = await axios.get(`${productBaseURL}/products/${id}`);
    return { ...data, source: "fakestore" };
  } catch {
    return null;
  }
}

export async function fetchFakeStoreCategory(apiSlug) {
  try {
    const { data } = await axios.get(
      `${productBaseURL}/products/category/${encodeURIComponent(apiSlug)}`
    );
    return data.map((product) => ({ ...product, source: "fakestore" }));
  } catch {
    return [];
  }
}

export async function fetchMarketplaceProducts({ category, q } = {}) {
  const catalogProducts = await fetchCatalogProducts({ category, q });
  if (catalogProducts.length > 0) return catalogProducts;
  if (category) return [];

  const fakeProducts = await fetchFakeStoreProducts();
  if (!q) return fakeProducts;

  const query = q.toLowerCase();
  return fakeProducts.filter(
    (product) =>
      product.title?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
  );
}

export async function fetchMarketplaceProduct(id) {
  const catalogProduct = await fetchCatalogProduct(id);
  if (catalogProduct) return catalogProduct;
  return fetchFakeStoreProduct(id);
}

export async function fetchMarketplaceCategory(categorySlug, { q, apiSlug } = {}) {
  const catalogProducts = await fetchCatalogProducts({ category: categorySlug, q });
  if (catalogProducts.length > 0) return catalogProducts;
  if (apiSlug) {
    const fakeProducts = await fetchFakeStoreCategory(apiSlug);
    if (!q) return fakeProducts;
    const query = q.toLowerCase();
    return fakeProducts.filter(
      (product) =>
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
  }
  return [];
}

export async function getVendorProfile() {
  const { data } = await apiGet("/vendors/me");
  return data;
}

export async function registerVendor(payload) {
  const { data } = await apiPost("/vendors/register", payload);
  return data;
}

export async function updateVendorProfile(payload) {
  const { data } = await apiPatch("/vendors/me", payload);
  return data;
}

export async function getVendorProducts() {
  const { data } = await apiGet("/vendors/me/products");
  return data;
}

export async function createVendorProduct(payload) {
  const { data } = await apiPost("/products", payload);
  return data;
}

export async function updateVendorProduct(id, payload) {
  const { data } = await apiPatch(`/products/${id}`, payload);
  return data;
}

export async function deleteVendorProduct(id) {
  await apiDelete(`/products/${id}`);
}
