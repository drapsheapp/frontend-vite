// CATEGORY → MEASUREMENT TYPE MAP
export const CATEGORY_PROFILE_MAP = {
  blouse: "blouse",
  kurta: "top",
  kurta_set: "top",
  salwar_kameez: "top",
  pant: "bottom",
  lehenga: "lehenga"
};

// SMART PROFILE FINDER
export const findBestProfile = (productCategory, profiles) => {
  if (!profiles || profiles.length === 0) return null;

  const requiredType = CATEGORY_PROFILE_MAP[productCategory];

  // 1️⃣ Exact category match
  const exactMatch = profiles.find(
    p => p.measurement_type === requiredType
  );

  if (exactMatch) return exactMatch;

  // 2️⃣ fallback default profile
  const defaultProfile = profiles.find(p => p.is_default);

  return defaultProfile || null;
};