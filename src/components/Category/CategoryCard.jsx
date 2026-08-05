import React from "react";
import { Link } from "react-router-dom";
import styles from "./category.module.css";

const CategoryCard = ({ title, image, slug }) => (
  <Link to={`/category/${slug}`} className={styles.card}>
    <img src={image} alt={title} className={styles.cardImage} width="300" height="220" loading="lazy" />
    <div className={styles.cardBody}>
      <h3>{title}</h3>
      <span>Explore collection <span aria-hidden="true">↗</span></span>
    </div>
  </Link>
);

export default CategoryCard;
