/** Shared category definitions — slug is the URL segment; apiSlug maps to FakeStore API. */
export const CATEGORIES = [
  {
    title: "Fashion & textiles",
    slug: "fashion-textiles",
    apiSlug: "men's clothing",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Beauty & care",
    slug: "beauty-care",
    apiSlug: "jewelery",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Home & living",
    slug: "home-living",
    apiSlug: "electronics",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Electronics",
    slug: "electronics",
    apiSlug: "electronics",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Groceries",
    slug: "groceries",
    apiSlug: "jewelery",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Crafts & gifts",
    slug: "crafts-gifts",
    apiSlug: "jewelery",
    image:
      "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Books & learning",
    slug: "books-learning",
    apiSlug: "electronics",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Kids & family",
    slug: "kids-family",
    apiSlug: "women's clothing",
    image:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=700&q=85",
  },
];

export const getCategoryBySlug = (slug) =>
  CATEGORIES.find((cat) => cat.slug === slug);

export const getCategoryApiSlug = (slug) =>
  getCategoryBySlug(slug)?.apiSlug ?? slug;

export const getCategoryTitle = (slug) =>
  getCategoryBySlug(slug)?.title ??
  slug?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
