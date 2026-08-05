import React from "react";
import CategoryCard from "./CategoryCard";
import styles from "./category.module.css";

const categories = [
  { title: "Fashion & textiles", slug: "men's clothing", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85" },
  { title: "Beauty & care", slug: "jewelery", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=85" },
  { title: "Home & living", slug: "home-living", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85" },
  { title: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85" },
  { title: "Groceries", slug: "groceries", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=85" },
  { title: "Crafts & gifts", slug: "crafts-gifts", image: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?auto=format&fit=crop&w=700&q=85" },
  { title: "Books & learning", slug: "books-learning", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=700&q=85" },
  { title: "Kids & family", slug: "kids-family", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=700&q=85" },
];

const Category = () => (
  <section className={styles.categorySection} aria-labelledby="category-heading">
    <div className={styles.sectionIntro}>
      <p className={styles.eyebrow}>Find your next favourite</p>
      <h2 id="category-heading">Shop by category</h2>
      <p>From Accra makers to everyday essentials, discover something made for your life.</p>
    </div>
    <div className={styles.categoryWrapper}>
      {categories.map((cat) => (
        <CategoryCard key={cat.slug} {...cat} />
      ))}
    </div>
  </section>
);

export default Category;
