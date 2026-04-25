import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from "react";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext(null);

const API_BASE = import.meta.env.VITE_BACKEND_URL + "/api";

/**
 * ✅ SINGLE SOURCE OF TRUTH TOKEN
 * Must match api.js interceptor
 */
const getToken = () => localStorage.getItem("access_token");

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ prevent duplicate parallel API calls (React StrictMode safe)
  const loadingRef = useRef(false);

  /* =====================================================
      LOAD CART (SERVER = SOURCE OF TRUTH)
  ===================================================== */
  const loadCart = useCallback(async () => {
    try {
      const token = getToken();

      // ✅ no auth → empty cart
      if (!token) {
        setCart([]);
        return;
      }

      // ✅ avoid double API calls
      if (loadingRef.current) return;
      loadingRef.current = true;

      setLoading(true);

      const res = await fetch(`${API_BASE}/cart/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        console.error("Cart API failed:", res.status);
        setCart([]);
        return;
      }

      const data = await res.json();
      const cartItems = data.items || [];

      /**
       * ✅ PRODUCTION-GRADE CART NORMALIZATION
       */
      const enrichedCart = cartItems.map((item) => ({
        // ✅ STEP 1: Unique Item ID (Backend se string format mein)
        _id: item._id, 
        cart_item_id: item._id, 

        product_id: item.product_id,

        // ✅ Root fields normalization
        name:
          item.product_name ||
          item.configuration?.product_name ||
          "Custom Product",

        product_name:
          item.product_name ||
          item.configuration?.product_name ||
          "Custom Product",

        category:
          item.category ||
          item.configuration?.category ||
          "",

        image:
          item.image_url ||
          item.configuration?.image_url ||
          "/placeholder-product.jpg",

        locked_price: Number(item.locked_price || 0),
        price: Number(item.locked_price || 0),
        quantity: Number(item.quantity || 1),

        configuration: item.configuration || {},

        // 🔥🔥 ADD THIS (MAIN FIX)
        size_mode: 
          item.size_mode || 
          item.configuration?.size_mode || 
          "measurement",

        sample_pickup: 
          item.sample_pickup || 
          item.configuration?.sample_pickup || 
          null,
    
        profile_name:
          item.configuration?.profile_name || "",

        fitting_preference:
          item.configuration?.fitting_preference || ""
      }));

      setCart(enrichedCart);
    } catch (err) {
      console.error("Cart load failed:", err);
      setCart([]);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  /* =====================================================
      ADD TO CART
  ===================================================== */
  const addToCart = async (cartPayload) => {
    try {
      const token = getToken();
      if (!token) throw new Error("User not authenticated");

      const res = await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cartPayload)
      });

      if (!res.ok) {
        console.error("Add cart failed:", res.status);
        return;
      }

      await loadCart();
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  /* =====================================================
      REMOVE ITEM (FIXED: REMOVES BY UNIQUE ITEM ID)
  ===================================================== */
  const removeFromCart = async (item_id) => {
    try {
      const token = getToken();
      if (!token) return;

      // ✅ STEP 2 & 3: API URL updated to match backend fix
      const res = await fetch(`${API_BASE}/cart/remove-item/${item_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        console.error("Remove cart failed:", res.status);
        return;
      }

      await loadCart();
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };

  /* =====================================================
      TOTAL CALCULATION (UI ONLY)
  ===================================================== */
  const getTotalAmount = () => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.locked_price || 0) *
          Number(item.quantity || 1),
      0
    );
  };

  /* =====================================================
      CLEAR CART
  ===================================================== */
  const clearCart = () => {
    setCart([]);
  };

  /* =====================================================
      AUTH SYNC
  ===================================================== */
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [user, loadCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        getTotalAmount,
        clearCart,
        loadCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};