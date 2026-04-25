import API from "@/api/api";

/* =====================================================
   LIB API WRAPPER
   (Reuses main API instance)
===================================================== */

// 👉 अगर future में specific helpers बनाना हो तो यहाँ लिख सकते हो

export const libAPI = {
  // example (optional)
  // getSomething: () => API.get("/something"),
};

/* =====================================================
   EXPORT MAIN API
===================================================== */

export default API;