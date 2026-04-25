import axios from "axios";

/* =====================================================
   BASE CONFIG
===================================================== */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("VITE_BACKEND_URL is not defined");
}

/* =====================================================
   AXIOS INSTANCE
===================================================== */

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================================================
   REQUEST INTERCEPTOR
   Attach JWT token automatically
===================================================== */

API.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("access_token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (err) {
      console.error("Request interceptor error:", err);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

/* =====================================================
   RESPONSE INTERCEPTOR
   Handle auth + network errors
===================================================== */

API.interceptors.response.use(
  (response) => response,
  (error) => {

    // 🔴 NETWORK ERROR
    if (!error.response) {
      console.error("Network error:", error.message);
      error.customMessage = "Network error. Please check your connection.";
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 🔴 UNAUTHORIZED
    if (status === 401) {
      console.warn("Session expired. Logging out...");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      window.location.replace("/login");
    }

    // 🔴 SERVER ERROR
    if (status >= 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

/* =====================================================
   DOWNLOAD INVOICE (UTILITY)
===================================================== */

export const downloadInvoice = async (orderId) => {
  try {
    const response = await API.get(`/orders/${orderId}/invoice`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${orderId}.pdf`);

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Invoice download failed:", error);
    alert(error.response?.data?.message || "Invoice download failed");
  }
};

/* =====================================================
   EXPORT
===================================================== */

export default API;