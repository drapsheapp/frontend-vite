import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import { Toaster } from "./components/ui/sonner";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import BackToTop from "./components/BackToTop";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import SmartFit from "./pages/SmartFit";

/* ✅ CHECKOUT PAGE */
import Checkout from "./pages/Checkout";

/* ✅ ORDER SUCCESS PAGE */
import OrderSuccessPage from "./pages/OrderSuccessPage";

/* ✅ ORDER DETAILS PAGE */
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";

/* ✅ PROFILE PAGE */
import ProfilePage from "@/features/profile/ProfilePage";

/* ================= COMPANY PAGES ================= */

import About from "./pages/company/About";
import BusinessEnquiry from "./pages/company/BusinessEnquiry";
import StoreLocator from "./pages/company/StoreLocator";
import HowItWorks from "./pages/info/HowItWorks";

/* ================= SUPPORT PAGES ================= */

import Blog from "./pages/support/Blog";
import ContactUs from "./pages/support/Contact Us";
import FAQs from "./pages/support/FAQs";
import ReturnsCancellation from "./pages/support/Returns & Cancellation";

/* ================= LEGAL PAGES ================= */

import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import ShippingPolicy from "./pages/legal/ShippingPolicy";
import TermsOfUse from "./pages/legal/Terms of Use";

/* ================= ADMIN IMPORTS ================= */

import SampleOrders from "@/admin/pages/SampleOrders";
import SampleOrderDetail from "@/admin/pages/SampleOrderDetail";
import AdminLogin from "@/admin/pages/AdminLogin";
import Dashboard from "@/admin/pages/Dashboard";
import Orders from "@/admin/pages/Orders";
import OrderDetail from "@/admin/pages/OrderDetail";
import AdminProducts from "@/admin/pages/Products";
import Customers from "@/admin/pages/Customers";
import CustomerDetail from "@/admin/pages/CustomerDetail";
import AddProduct from "@/admin/pages/AddProduct";
import EditProduct from "@/admin/pages/EditProduct";

import AdminAnalytics from "@/admin/pages/AdminAnalytics";
import Categories from "@/admin/pages/Categories";
import AdminCollections from "@/admin/pages/AdminCollections";
import AddCollection from "@/admin/pages/AddCollection";
import EditCollection from "@/admin/pages/EditCollection";
import AddCategory from "@/admin/pages/AddCategory";
import EditCategory from "@/admin/pages/EditCategory";

import AdminRoute from "@/admin/AdminRoute";
import AdminLayout from "@/admin/layout/AdminLayout";

/* ================= CUSTOMER LAYOUT ================= */

const CustomerLayout = ({ children }) => {
  return (
    <div className="App flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      <BackToTop />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>

      <ScrollToTop />

      <AuthProvider>
        <CartProvider>

          <Routes>

            {/* ================= ADMIN LOGIN ================= */}

            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ================= ADMIN PANEL ================= */}

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/new" element={<AddCategory />} />
              <Route path="categories/edit/:id" element={<EditCategory />} />
              <Route path="collections" element={<AdminCollections />} />
              <Route path="collections/new" element={<AddCollection />} />
              <Route path="collections/edit/:id" element={<EditCollection />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="sample-orders" element={<SampleOrders />} />
              <Route path="sample-orders/:id" element={<SampleOrderDetail />} />
            </Route>

            {/* ================= CUSTOMER WEBSITE ================= */}

            <Route
              path="/"
              element={
                <CustomerLayout>
                  <Home />
                </CustomerLayout>
              }
            />

            {/* ================= PRODUCTS ================= */}

            <Route
              path="/products"
              element={
                <CustomerLayout>
                  <Products />
                </CustomerLayout>
              }
            />

            <Route
              path="/products/:category"
              element={
                <CustomerLayout>
                  <Products />
                </CustomerLayout>
              }
            />

            {/* ================= PRODUCT DETAIL ================= */}

            <Route
              path="/product/:productId"
              element={
                <CustomerLayout>
                  <ProductDetail />
                </CustomerLayout>
              }
            />

            {/* ================= SMART FIT ================= */}

            <Route
              path="/smartfit"
              element={
                <CustomerLayout>
                  <SmartFit />
                </CustomerLayout>
              }
            />
            
            {/* ================= AUTH ================= */}

            <Route
              path="/login"
              element={
                <CustomerLayout>
                  <Login />
                </CustomerLayout>
              }
            />

            {/* ================= CART ================= */}

            <Route
              path="/cart"
              element={
                <CustomerLayout>
                  <Cart />
                </CustomerLayout>
              }
            />

            {/* ================= CHECKOUT ================= */}

            <Route
              path="/checkout"
              element={
                <CustomerLayout>
                  <Checkout />
                </CustomerLayout>
              }
            />

            {/* ================= ORDER SUCCESS ================= */}

            <Route
              path="/order-success/:orderId"
              element={
                <CustomerLayout>
                  <OrderSuccessPage />
                </CustomerLayout>
              }
            />

            <Route
              path="/order/:orderId"
              element={
                <CustomerLayout>
                  <OrderTracking />
                </CustomerLayout>
              }
            />    

            {/* ================= MY ORDERS ================= */}

            <Route
              path="/orders"
              element={
                <CustomerLayout>
                  <MyOrders />
                </CustomerLayout>
              }
            />      

            {/* ================= ORDER DETAILS ================= */}

            <Route
              path="/orders/:orderId"
              element={
                <CustomerLayout>
                  <OrderDetailsPage />
                </CustomerLayout>
              }
            />

            {/* ================= PROFILE ================= */}

            <Route
              path="/profile"
              element={
                <CustomerLayout>
                  <ProfilePage />
                </CustomerLayout>
              }
            />

            {/* ================= COMPANY ================= */}

            <Route
              path="/how-it-works"
              element={
                <CustomerLayout>
                  <HowItWorks />
                </CustomerLayout>
              }
            />    
            
            <Route
              path="/about"
              element={
                <CustomerLayout>
                  <About />
                </CustomerLayout>
              }
            />

            <Route
              path="/business"
              element={
                <CustomerLayout>
                  <BusinessEnquiry />
                </CustomerLayout>
              }
            />

            <Route
              path="/store-locator"
              element={
                <CustomerLayout>
                  <StoreLocator />
                </CustomerLayout>
              }
            />

            {/* ================= SUPPORT ================= */}

            <Route
              path="/blog"
              element={
                <CustomerLayout>
                  <Blog />
                </CustomerLayout>
              }
            />

            <Route
              path="/contact"
              element={
                <CustomerLayout>
                  <ContactUs />
                </CustomerLayout>
              }
            />

            <Route
              path="/faq"
              element={
                <CustomerLayout>
                  <FAQs />
                </CustomerLayout>
              }
            />

            <Route
              path="/returns-refunds"
              element={
                <CustomerLayout>
                  <ReturnsCancellation />
                </CustomerLayout>
              }
            />

            {/* ================= LEGAL ================= */}

            <Route
              path="/privacy-policy"
              element={
                <CustomerLayout>
                  <PrivacyPolicy />
                </CustomerLayout>
              }
            />

            <Route
              path="/shipping-policy"
              element={
                <CustomerLayout>
                  <ShippingPolicy />
                </CustomerLayout>
              }
            />

            <Route
              path="/terms"
              element={
                <CustomerLayout>
                  <TermsOfUse />
                </CustomerLayout>
              }
            />

            {/* ================= 404 ================= */}

            <Route
              path="*"
              element={
                <CustomerLayout>
                  <div className="min-h-screen flex items-center justify-center">
                    <h1 className="text-2xl font-display text-royal-plum">
                      Page Not Found
                    </h1>
                  </div>
                </CustomerLayout>
              }
            />

          </Routes>

          <Toaster position="top-right" />

          <WhatsAppButton />

        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;