import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import styles from "./product.module.css";
import Spinner from "../Spinner";
import { fetchMarketplaceProducts } from "../../API/productService";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMarketplaceProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.grid}>
      {loading ? (
        <Spinner />
      ) : (
        products.map((product) => (
          <ProductCard key={`${product.source}-${product.id}`} product={product} />
        ))
      )}
    </div>
  );
};

export default Product;
