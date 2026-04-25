import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import OrderDetailsPage from "../pages/OrderDetailsPage";

import ProfilePage from "../features/profile/ProfilePage";

import About from "../pages/company/About";
import BusinessEnquiry from "../pages/company/BusinessEnquiry";
import StoreLocator from "../pages/company/StoreLocator";

import Blog from "../pages/support/Blog";
import ContactUs from "../pages/support/Contact Us";
import FAQs from "../pages/support/FAQs";
import ReturnsCancellation from "../pages/support/Returns & Cancellation";

import PrivacyPolicy from "../pages/legal/PrivacyPolicy";
import ShippingPolicy from "../pages/legal/ShippingPolicy";
import TermsOfUse from "../pages/legal/Terms of Use";

export const customerRoutes = [

  { path: "/", element: <Home /> },

  { path: "/products", element: <Products /> },
  { path: "/products/:category", element: <Products /> },
  { path: "/product/:productId", element: <ProductDetail /> },

  { path: "/login", element: <Login /> },
  { path: "/cart", element: <Cart /> },
  { path: "/checkout", element: <Checkout /> },

  { path: "/profile", element: <ProfilePage /> },

  { path: "/order-success/:orderId", element: <OrderSuccessPage /> },
  { path: "/orders/:orderId", element: <OrderDetailsPage /> },

  { path: "/about", element: <About /> },
  { path: "/business", element: <BusinessEnquiry /> },
  { path: "/store-locator", element: <StoreLocator /> },

  { path: "/blog", element: <Blog /> },
  { path: "/contact", element: <ContactUs /> },
  { path: "/faq", element: <FAQs /> },
  { path: "/returns-refunds", element: <ReturnsCancellation /> },

  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/shipping-policy", element: <ShippingPolicy /> },
  { path: "/terms", element: <TermsOfUse /> }

];