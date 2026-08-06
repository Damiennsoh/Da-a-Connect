import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useCart } from "../components/DataProvider/DataProvider";
import { getVendorProfile } from "../API/productService";
import Spinner from "../components/Spinner";

const VendorRoute = ({ children, requireProfile = true }) => {
  const { user } = useCart();
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setChecked(true);
      return;
    }

    getVendorProfile()
      .then((profile) => setVendor(profile))
      .catch(() => setVendor(null))
      .finally(() => {
        setLoading(false);
        setChecked(true);
      });
  }, [user]);

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (loading) {
    return (
      <div style={{ minHeight: "50vh", display: "grid", placeItems: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (requireProfile && checked && !vendor) {
    return <Navigate to="/vendor/setup" replace />;
  }

  return React.cloneElement(children, { vendor, setVendor });
};

export default VendorRoute;
