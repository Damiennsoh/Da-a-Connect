import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import styles from "./vendor.module.css";
import { useCart } from "../../components/DataProvider/DataProvider";
import { getVendorProfile, registerVendor } from "../../API/productService";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";

const VendorSetup = () => {
  const { user } = useCart();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("Greater Accra");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getVendorProfile()
      .then(() => navigate("/vendor/dashboard", { replace: true }))
      .catch(() => {})
      .finally(() => setCheckingProfile(false));
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!shopName.trim() || !location.trim()) {
      toast.error("Shop name and location are required.");
      return;
    }

    setLoading(true);
    try {
      await registerVendor({
        shopName,
        description,
        location,
        city,
        region,
        email: user?.email,
        name: user?.displayName,
      });
      toast.success("Vendor profile created!");
      navigate("/vendor/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Unable to create vendor profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {checkingProfile ? (
        <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
          <Spinner />
        </div>
      ) : (
      <div className={styles.vendorPage}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Become a seller</h1>
            <p>Set up your shop profile to start listing products on Da&apos;a Connect.</p>
          </div>
        </div>

        <form className={`${styles.card} ${styles.formGrid}`} onSubmit={handleSubmit}>
          <label>
            Shop name
            <input
              value={shopName}
              onChange={(event) => setShopName(event.target.value)}
              placeholder="e.g. Adwoa's Textiles"
              required
            />
          </label>

          <label>
            Shop description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell shoppers what makes your shop special."
            />
          </label>

          <div className={styles.formGridTwo}>
            <label>
              City
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Accra"
              />
            </label>
            <label>
              Region
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="Greater Accra"
              />
            </label>
          </div>

          <label>
            Product location / pickup area
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Osu, Accra"
              required
            />
          </label>

          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            {loading ? "Creating shop..." : "Create vendor account"}
          </button>
        </form>
      </div>
      )}
    </Layout>
  );
};

export default VendorSetup;
