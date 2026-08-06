import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import styles from "./vendor.module.css";
import PriceFormat from "../../components/Product/PriceFormat";
import {
  deleteVendorProduct,
  getVendorProducts,
} from "../../API/productService";
import { getCategoryTitle } from "../../data/categories";
import { toast } from "react-toastify";

const VendorDashboard = ({ vendor }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    setLoading(true);
    getVendorProducts()
      .then(setProducts)
      .catch(() => toast.error("Unable to load your listings."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (product) => {
    const result = await Swal.fire({
      title: "Remove listing?",
      text: `"${product.title}" will be removed from the marketplace.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
      confirmButtonColor: "#aa4635",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteVendorProduct(product.id);
      toast.success("Listing removed.");
      loadProducts();
    } catch {
      toast.error("Unable to remove listing.");
    }
  };

  return (
    <Layout>
      <div className={styles.vendorPage}>
        <div className={styles.pageHeader}>
          <div>
            <h1>{vendor?.shopName || "Seller dashboard"}</h1>
            <p>
              Manage your listings from {vendor?.location}. Add products, upload images, and update details anytime.
            </p>
          </div>
          <Link to="/vendor/products/new" className={styles.primaryBtn}>
            + Add product
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <div className={`${styles.card} ${styles.emptyState}`}>
            <p>You have no listings yet.</p>
            <Link to="/vendor/products/new" className={styles.primaryBtn}>
              List your first product
            </Link>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {products.map((product) => (
              <article key={product.id} className={`${styles.card} ${styles.productCard}`}>
                <img src={product.image} alt={product.title} />
                <div className={styles.productMeta}>
                  <h3>{product.title}</h3>
                  <p>{getCategoryTitle(product.category)}</p>
                  <p>{product.location}</p>
                  <p>
                    <PriceFormat value={product.price} />
                  </p>
                </div>
                <div className={styles.productActions}>
                  <Link
                    to={`/vendor/products/${product.id}/edit`}
                    className={styles.secondaryBtn}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => handleDelete(product)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VendorDashboard;
