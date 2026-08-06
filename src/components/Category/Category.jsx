import React from "react";
import CategoryCard from "./CategoryCard";
import styles from "./category.module.css";
import { CATEGORIES } from "../../data/categories";

const Category = () => (
  <section className={styles.categorySection} aria-labelledby="category-heading">
    <div className={styles.sectionIntro}>
      <p className={styles.eyebrow}>Find your next favourite</p>
      <h2 id="category-heading">Shop by category</h2>
      <p>From Accra makers to everyday essentials, discover something made for your life.</p>
    </div>
    <div className={styles.categoryWrapper}>
      {CATEGORIES.map((cat) => (
        <CategoryCard key={cat.slug} {...cat} />
      ))}
    </div>
  </section>
);

export default Category;
