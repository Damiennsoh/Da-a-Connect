import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Landing from "./Pages/Landing/";
import { Signin } from "./Pages/Auth/";
import { Signup } from "./Pages/Auth/";
import Cart from "./Pages/Cart/";
import Orders from "./Pages/Orders/";
import Payment from "./Pages/Payment/";
import ProductDetail from "./Pages/ProductDetail";
import Results from "./Pages/Results/";
import Account from "./Pages/Account/";
import Shipping from "./Pages/Shipping/";
import ProtectedRoute from "./components/ProtectedRoute";
import VendorRoute from "./components/VendorRoute";
import {
  VendorHub,
  VendorSetup,
  VendorDashboard,
  VendorProductForm,
} from "./Pages/Vendor/";
import { ToastContainer } from "react-toastify";

function AppRouter() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/auth/signin" element={<Signin />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:categoryName" element={<Results />} />
          <Route path="/results" element={<Results />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute>
                <VendorHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/setup"
            element={
              <ProtectedRoute>
                <VendorSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <VendorRoute>
                <VendorDashboard />
              </VendorRoute>
            }
          />
          <Route
            path="/vendor/products/new"
            element={
              <VendorRoute>
                <VendorProductForm />
              </VendorRoute>
            }
          />
          <Route
            path="/vendor/products/:id/edit"
            element={
              <VendorRoute>
                <VendorProductForm />
              </VendorRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
      />
    </>
  );
}

export default AppRouter;
