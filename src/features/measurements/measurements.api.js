import API from "@/api/api";

/* =====================================================
   MEASUREMENTS API (PRODUCTION GRADE - FIXED)
===================================================== */

export const measurementsAPI = {

  /* ===========================
     GET MEASUREMENTS BY CATEGORY
  =========================== */
  getMeasurements: async (category) => {
    try {
      if (!category) {
        throw new Error("Category is required for measurements API");
      }

      const response = await API.get(
        `/user/measurement-record?category=${category}`
      );

      return response.data;
    } catch (error) {
      console.error("❌ getMeasurements error:", error);
      throw error;
    }
  },

  /* ===========================
     SAVE MEASUREMENTS
  =========================== */
  saveMeasurements: async (data) => {
    try {
      if (!data) {
        throw new Error("Measurement data is required");
      }

      const response = await API.post(
        "/user/measurement-record",
        data
      );

      return response.data;
    } catch (error) {
      console.error("❌ saveMeasurements error:", error);
      throw error;
    }
  }

};