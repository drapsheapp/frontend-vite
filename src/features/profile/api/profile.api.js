import API from "@/api/api";

/* =====================================================
   PROFILE API MODULE (PRODUCTION GRADE)
===================================================== */

export const profileAPI = {

  /* ===========================
     ORDERS
  =========================== */
  getOrders: () =>
    API.get("/orders/my-orders/"),

  /* ===========================
     MEASUREMENTS (UPDATED)
  =========================== */
  getMeasurements: (category) =>
    API.get(`/user/measurement-record?category=${category}`),

  saveMeasurements: (data) =>
    API.post("/user/measurement-record", data),

  /* ===========================
     ADDRESSES
  =========================== */
  getAddresses: () =>
    API.get("/addresses/"),

  addAddress: (data) =>
    API.post("/addresses/", data),

  updateAddress: (id, data) =>
    API.put(`/addresses/${id}/`, data),

  deleteAddress: (id) =>
    API.delete(`/addresses/${id}/`),

  /* ===========================
     DEFAULT ADDRESS
  =========================== */
  setDefaultAddress: (id) =>
    API.put(`/addresses/set-default/${id}/`),
};