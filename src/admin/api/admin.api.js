import API from "@/api/api";

const BASE = "/admin";

/*
========================================
ADMIN API CLIENT
Production Grade
Used by Admin Panel
========================================
*/

export const adminAPI = {

  /*
  ========================================
  AUTH
  ========================================
  */

  login: (data) =>
    API.post(`${BASE}/login`, data),



  /*
  ========================================
  DASHBOARD
  ========================================
  */

  getDashboard: () =>
    API.get(`${BASE}/dashboard`),

  getStats: () =>
    API.get(`${BASE}/stats`),



  /*
  ========================================
  ORDERS MANAGEMENT
  ========================================
  */

  // List Orders (with filters)
  listOrders: (params = {}) =>
    API.get(`${BASE}/orders`, { params }),

  // Fetch all orders
  getOrders: () =>
    API.get(`${BASE}/orders`),

  // 🔥 Primary Order Detail API (used in OrderDetail.jsx)
  getOrder: (orderId) =>
    API.get(`${BASE}/orders/${orderId}`),

  // Compatibility helper (same endpoint)
  getOrderDetail: (orderId) =>
    API.get(`${BASE}/orders/${orderId}`),

  // Compatibility helper (same endpoint)
  getOrderById: (id) =>
    API.get(`${BASE}/orders/${id}`),

  // Update Order Status
  updateOrderStatus: (id, status) =>
    API.put(`${BASE}/orders/${id}/status`, { status }),



  /*
  ========================================
  CUSTOMERS MANAGEMENT
  ========================================
  */

  // List Customers
  listCustomers: (params = {}) =>
    API.get(`${BASE}/customers`, { params }),

  // Get Customer Detail
  getCustomerDetail: (customerId) =>
    API.get(`${BASE}/customers/${customerId}`),



  /*
  ========================================
  PRODUCTS MANAGEMENT
  ========================================
  */

  // List Products
  listProducts: (params = {}) =>
    API.get(`${BASE}/products`, { params }),

  // Get Product Detail
  getProduct: (productId) =>
    API.get(`${BASE}/products/${productId}`),

  // Create Product
  createProduct: (data) =>
    API.post(`${BASE}/products`, data),

  // Update Product
  updateProduct: (productId, data) =>
    API.put(`${BASE}/products/${productId}`, data),

  // Delete Product
  deleteProduct: (productId) =>
    API.delete(`${BASE}/products/${productId}`),



  /*
  ========================================
  CATEGORIES MANAGEMENT
  ========================================
  */

  // List Categories
  listCategories: () =>
    API.get(`${BASE}/categories`),

  // Get Category Detail
  getCategory: (categoryId) =>
    API.get(`${BASE}/categories/${categoryId}`),

  // Create Category
  createCategory: (data) =>
    API.post(`${BASE}/categories`, data),

  // Update Category
  updateCategory: (categoryId, data) =>
    API.put(`${BASE}/categories/${categoryId}`, data),

  // Delete Category
  deleteCategory: (categoryId) =>
    API.delete(`${BASE}/categories/${categoryId}`),



  /*
  ========================================
  ANALYTICS
  ========================================
  */

  // 🔥 Main Analytics API (used by AdminAnalytics.jsx)
  getAnalytics: () =>
    API.get(`${BASE}/analytics`),

  getRevenueAnalytics: () =>
    API.get(`${BASE}/analytics/revenue`),

  getOrderAnalytics: () =>
    API.get(`${BASE}/analytics/orders`),


  
/*
========================================
ADVANCED ANALYTICS
========================================
*/

getVisitors: () =>
  API.get(`${BASE}/analytics/visitors`),

getTopProducts: () =>
  API.get(`${BASE}/analytics/top-products`),

getLocations: () =>
  API.get(`${BASE}/analytics/locations`),

getDevices: () =>
  API.get(`${BASE}/analytics/devices`),

getEngagement: () =>
  API.get(`${BASE}/analytics/engagement`),

// ✅ SALES (LAST 7 DAYS)
getSales: () =>
  API.get(`${BASE}/analytics/sales`),

// 🔥 ✅ FIXED (YAHI ADD KARNA THA ANDAR)
getVisitorGrowth: () =>
  API.get(`${BASE}/analytics/visitor-growth`),

getRevenueGrowth: () =>
  API.get(`${BASE}/analytics/revenue-growth`),

getGender: () =>
  API.get(`${BASE}/analytics/gender`),

/*
========================================
SAMPLE ORDERS (🔥 NEW SYSTEM)
========================================
*/

// Get sample orders (filtered)
getSampleOrders: async (params = {}) => {
  const res = await API.get(`${BASE}/orders`, { params });

  // 🔥 filter backend response
  return {
    ...res,
    data: res.data.filter(o => o.size_mode === "sample")
  };
},

// Update sample order status
updateSampleOrderStatus: (id, status) =>
  API.put(`${BASE}/orders/${id}/status`, { status }),

// Get single sample order
getSampleOrderById: (id) =>
  API.get(`${BASE}/orders/${id}`),

};