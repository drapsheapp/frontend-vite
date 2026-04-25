export function generateMeasurements(category, data = {}) {
  const cat = (category || "").toLowerCase().replace(/_/g, "-");

  // ===============================
  // 🧼 SAFE EXTRACTION (VERY IMPORTANT)
  // ===============================
  const bust = Number(data.bust) || 0;
  const waist_top = Number(data.waist_top) || 0;
  const waist_bottom = Number(data.waist_bottom) || waist_top;
  const hip = Number(data.hip) || 0;
  const shoulder = Number(data.shoulder) || 0;
  const length_bottom = Number(data.length_bottom) || 38;

  // fallback if hip missing
  const safeHip = hip || waist_bottom * 1.08;

  // ===============================
  // 🥻 BLOUSE
  // ===============================
  if (cat === "blouse") {
    return {
      bust,
      shoulder,
      waist_top,

      underbust: +(bust * 0.86).toFixed(1),
      armhole: +(bust * 0.5).toFixed(1),
      length_top: Number(data.length_top) || 14
    };
  }

  // ===============================
  // 👗 KURTA / SUIT
  // ===============================
  if (
    cat === "kurta-set" ||
    cat === "salwar-kameez" ||
    cat === "kurta"
  ) {
    return {
      // TOP
      bust,
      waist_top,
      hip: safeHip,
      shoulder,
      length_top: Number(data.length_top) || 40,

      // BOTTOM
      waist_bottom,
      thigh: +(safeHip * 0.6).toFixed(1),
      knee: +(safeHip * 0.45).toFixed(1),
      calf: +(safeHip * 0.35).toFixed(1),
      crotch_rise: +(safeHip * 0.25).toFixed(1),
      length_bottom
    };
  }

  // ===============================
  // 👖 PANT / BOTTOM WEAR
  // ===============================
  if (cat.includes("pant") || cat.includes("bottom")) {
    return {
      waist_bottom,
      hip: safeHip,

      thigh: +(safeHip * 0.6).toFixed(1),
      knee: +(safeHip * 0.45).toFixed(1),
      calf: +(safeHip * 0.35).toFixed(1),
      crotch_rise: +(safeHip * 0.25).toFixed(1),
      length_bottom
    };
  }

  // ===============================
  // 🛡️ DEFAULT FALLBACK (IMPORTANT)
  // ===============================
  return {
    bust,
    waist_top,
    waist_bottom,
    hip: safeHip,
    shoulder
  };
}