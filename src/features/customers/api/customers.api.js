import API from "@/api/api";

/**
 * ===============================
 * ADMIN CUSTOMERS API
 * ===============================
 */

export const customersAPI = {

  getCustomers: async (page = 1, limit = 20) => {
    const response = await API.get(
      `/admin/customers?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getCustomerDetail: async (customerId) => {
    const response = await API.get(
      `/admin/customers/${customerId}`
    );
    return response.data;
  },

  getCustomerAnalytics: async (customerId) => {
    const response = await API.get(
      `/admin/customers/${customerId}/analytics`
    );
    return response.data;
  }

};