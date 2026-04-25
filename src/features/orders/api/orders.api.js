/**
 * =====================================================
 * ORDERS API LAYER (FEATURE LEVEL - PRODUCTION GRADE)
 * -----------------------------------------------------
 * Uses global axios client from lib/api.js
 * Keeps all order related endpoints in one place
 * =====================================================
 */

import API from "@/api/api";

/* =====================================================
   ORDER API
===================================================== */

export const orderAPI = {
  /**
   * Create new order
   */
  createOrder: (payload) => {
    return API.post("/orders/create", payload);
  },

  /**
   * Verify payment after Razorpay success
   */
  verifyPayment: (payload) => {
    return API.post("/orders/verify-payment", payload);
  },

  /**
   * Fetch logged-in user's orders list
   */
  getMyOrders: () => {
    return API.get("/orders/my-orders");
  },

  /**
   * Fetch single order details
   * Used for OrderDetailsPage
   */
  getOrderById: (orderId) => {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    return API.get(`/orders/${encodeURIComponent(orderId)}`);
  },

  /**
   * Cancel order (future ready)
   */
  cancelOrder: (orderId) => {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    return API.post(
      `/orders/${encodeURIComponent(orderId)}/cancel`
    );
  },

  /**
   * Download invoice (future ready)
   */
  downloadInvoice: (orderId) => {
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    return API.get(
      `/orders/${encodeURIComponent(orderId)}/invoice`,
      {
        responseType: "blob",
      }
    );
  },
};