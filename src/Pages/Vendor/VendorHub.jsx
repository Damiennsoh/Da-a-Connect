import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Spinner from "../../components/Spinner";
import { useCart } from "../../components/DataProvider/DataProvider";
import { getVendorProfile } from "../../API/productService";

const VendorHub = () => {
  const { user } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth/signin");
      return;
    }

    getVendorProfile()
      .then(() => navigate("/vendor/dashboard", { replace: true }))
      .catch(() => navigate("/vendor/setup", { replace: true }))
      .finally(() => setLoading(false));
  }, [user, navigate]);

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
      <p>
        Redirecting… <Link to="/vendor/setup">Continue</Link>
      </p>
    </Layout>
  );
};

export default VendorHub;
