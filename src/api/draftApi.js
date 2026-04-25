import API from "@/api/api";

/* ===========================
   GET LATEST DRAFT
=========================== */
export const getLatestDraft = async (productId) => {
  try {
    const res = await API.get("/draft/latest", {
      params: { product_id: productId },
    });

    return res.data;
  } catch (error) {
    console.error("❌ getLatestDraft failed:", error?.response?.data || error.message);
    throw error;
  }
};

/* ===========================
   CREATE OR GET DRAFT
=========================== */
export const createOrGetDraft = async (payload) => {
  try {
    const res = await API.post("/draft", payload);

    return res.data;
  } catch (error) {
    console.error("❌ createOrGetDraft failed:", error?.response?.data || error.message);
    throw error;
  }
};

/* ===========================
   UPDATE DRAFT
=========================== */
export const updateDraft = async (draftId, payload) => {
  try {
    const res = await API.patch(`/draft/${draftId}`, payload);

    return res.data;
  } catch (error) {
    console.error("❌ updateDraft failed:", error?.response?.data || error.message);
    throw error;
  }
};