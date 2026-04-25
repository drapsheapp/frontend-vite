/* =========================================
   LOCAL DRAFT STORAGE (SESSION SAFETY)
========================================= */

const STORAGE_KEY = "pendingCustomization";

/* ---------- SAVE ---------- */
export const saveLocalDraft = (draft) => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(draft)
    );
  } catch (e) {
    console.error("Local draft save failed", e);
  }
};

/* ---------- GET ---------- */
export const getLocalDraft = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Local draft read failed", e);
    return null;
  }
};

/* ---------- CLEAR ---------- */
export const clearLocalDraft = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Local draft clear failed", e);
  }
};