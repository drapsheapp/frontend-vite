import API from "@/api/api";

/* =====================================================
   CART API - Production Grade
   Handles all cart related server communication
===================================================== */

export const cartAPI = {

  /* ===============================
     GET USER CART
  =============================== */
  async fetchCart() {
    try {
      const res = await API.get("/cart");
      return res.data;
    } catch (error) {
      console.error("Cart fetch failed:", error);
      throw error;
    }
  },

  /* ===============================
     ADD PRODUCT TO CART
  =============================== */
  async addToCart(payload) {
    try {
      const res = await API.post("/cart/add", payload);
      return res.data;
    } catch (error) {
      console.error("Add to cart failed:", error);
      throw error;
    }
  },

  /* ===============================
     REMOVE PRODUCT FROM CART
  =============================== */
  async removeFromCart(productId) {
    try {
      const res = await API.delete(`/cart/remove/${productId}`);
      return res.data;
    } catch (error) {
      console.error("Remove from cart failed:", error);
      throw error;
    }
  },

  /* ===============================
     UPDATE CART ITEM
     (Future use)
  =============================== */
  async updateItem(productId, payload) {
    try {
      const res = await API.put(`/cart/update/${productId}`, payload);
      return res.data;
    } catch (error) {
      console.error("Cart update failed:", error);
      throw error;
    }
  },

  /* ===============================
     CLEAR CART
     (Future use)
  =============================== */
  async clearCart() {
    try {
      const res = await API.delete("/cart/clear");
      return res.data;
    } catch (error) {
      console.error("Clear cart failed:", error);
      throw error;
    }
  }

};