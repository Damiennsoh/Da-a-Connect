import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../components/Layout";
import styles from "./results.module.css";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../../components/Product/ProductCard";
import Spinner from "../../components/Spinner";
import { getCategoryApiSlug, getCategoryTitle } from "../../data/categories";
import { fetchMarketplaceCategory, fetchMarketplaceProducts } from "../../API/productService";

const Results = () => {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() ?? "";
  const [res, setRes] = useState([]);
  const [loading, setLoading] = useState(false);

  const pageTitle = categoryName
    ? getCategoryTitle(categoryName)
    : searchQuery
      ? `Results for "${searchQuery}"`
      : "All products";

  useEffect(() => {
    setLoading(true);

    const loadProducts = categoryName
      ? fetchMarketplaceCategory(categoryName, {
          q: searchQuery,
          apiSlug: getCategoryApiSlug(categoryName),
        })
      : fetchMarketplaceProducts({ q: searchQuery });

    loadProducts.then(setRes).finally(() => setLoading(false));
  }, [categoryName, searchQuery]);

  const productList = useMemo(
    () =>
      res && res.length > 0 ? (
        res.map((product) => (
          <ProductCard
            key={`${product.source}-${product.id}`}
            product={product}
          />
        ))
      ) : (
        <p>No products found in this category.</p>
      ),
    [res]
  );

  return (
    <Layout>
      <div className={styles.resultsWrapper}>
        <h2>{pageTitle}</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className={styles.productsGrid}>{productList}</div>
        )}
      </div>
    </Layout>
  );
};

export default Results;
