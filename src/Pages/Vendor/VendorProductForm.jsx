import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import styles from "./vendor.module.css";
import { CATEGORIES } from "../../data/categories";
import { useCart } from "../../components/DataProvider/DataProvider";
import { uploadProductImage } from "../../Utility/uploadImage";
import {
  createVendorProduct,
  fetchCatalogProduct,
  updateVendorProduct,
} from "../../API/productService";
import { toast } from "react-toastify";

const VendorProductForm = ({ vendor }) => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useCart();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]?.slug || "");
  const [location, setLocation] = useState(vendor?.location || "");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    fetchCatalogProduct(id)
      .then((product) => {
        if (!product) {
          toast.error("Product not found.");
          navigate("/vendor/dashboard");
          return;
        }
        setTitle(product.title);
        setDescription(product.description);
        setPrice(String(product.price));
        setCategory(product.category);
        setLocation(product.location);
        setImages(product.images?.length ? product.images : [product.image].filter(Boolean));
      })
      .catch(() => toast.error("Unable to load product."))
      .finally(() => setLoading(false));
  }, [id, isEditing, navigate]);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      toast.error("You can upload up to 5 images per product.");
      return;
    }

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const url = await uploadProductImage(file, user.uid);
        uploaded.push(url);
      }
      setImages((current) => [...current, ...uploaded].slice(0, 5));
      toast.success("Image uploaded.");
    } catch (error) {
      toast.error(error.message || "Image upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = (index) => {
    setImages((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !category || !location.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (images.length === 0) {
      toast.error("Upload at least one product image.");
      return;
    }

    const payload = {
      title,
      description,
      price: Number(price),
      category,
      location,
      images,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await updateVendorProduct(id, payload);
        toast.success("Listing updated.");
      } else {
        await createVendorProduct(payload);
        toast.success("Product listed successfully.");
      }
      navigate("/vendor/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
          <Spinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.vendorPage}>
        <div className={styles.pageHeader}>
          <div>
            <h1>{isEditing ? "Edit listing" : "Add a product"}</h1>
            <p>Upload photos, set your price, and tell shoppers where the item is located.</p>
          </div>
        </div>

        <form className={`${styles.card} ${styles.formGrid}`} onSubmit={handleSubmit}>
          <label>
            Product title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Handwoven kente clutch"
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe materials, size, and what makes this item special."
              required
            />
          </label>

          <div className={styles.formGridTwo}>
            <label>
              Price (USD)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </label>
            <label>
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Product location
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Where shoppers can collect or expect delivery from"
              required
            />
          </label>

          <div>
            <label htmlFor="product-images">Product images (up to 5)</label>
            <input
              id="product-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading || images.length >= 5}
            />
            {uploading && <p className={styles.errorText}>Uploading image…</p>}
            {images.length > 0 && (
              <div className={styles.imagePreviewGrid}>
                {images.map((image, index) => (
                  <div key={image} className={styles.imagePreview}>
                    <img src={image} alt={`Product ${index + 1}`} />
                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={() => removeImage(index)}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className={styles.primaryBtn}
            type="submit"
            disabled={saving || uploading}
          >
            {saving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Publish listing"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default VendorProductForm;
