// ==========================================
// 🔥 Drapshe SmartFit v3 Engine (FINAL PRODUCTION READY)
// ==========================================

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL"];

// ===============================
// 🧼 CLEAN DATA
// ===============================
export function cleanMeasurements(m) {
  return {
    bust: Number(m.bust) || 0,
    waist: Number(m.waist_bottom || m.waist_top || m.waist) || 0,
    hip: Number(m.hip) || 0,
    shoulder: Number(m.shoulder) || 0,
    underbust: Number(m.underbust) || 0,
  };
}

// ===============================
// 🎯 CONFIDENCE SCORE
// ===============================
export function getConfidence(m) {
  let score = 100;
  if (m.bust < 28 || m.bust > 60) score -= 30;
  if (m.shoulder < 12 || m.shoulder > 20) score -= 20;
  if (m.hip && m.waist && Math.abs(m.hip - m.waist) > 15) score -= 20;
  return Math.max(0, score);
}

// ===============================
// 👗 BODY SHAPE DETECTION
// ===============================
export function detectBodyShape(m) {
  const { bust, waist, hip } = m;
  if (!bust || !waist || !hip) return "unknown";

  if (Math.abs(bust - hip) < 2 && waist < bust * 0.75) return "hourglass";
  if (hip > bust + 2) return "pear";
  if (bust > hip + 2) return "apple";
  return "rectangle";
}

// ===============================
// 🧠 SMART SIZE CALCULATION
// ===============================
export function getSmartFitV3(m, bodyType, category, fitPreference) {

  if (!m || Object.keys(m).length === 0) {
    return { size: "M", fit: "Regular Fit", confidence: 0, bodyShape: "unknown" };
  }

  const clean = cleanMeasurements(m);
  const cat = category?.toLowerCase?.().replace?.(/_/g, "-") || "";

  const isBottom =
    cat.includes("pant") ||
    cat.includes("bottom") ||
    cat.includes("jeans") ||
    cat.includes("trouser") ||
    cat.includes("legging");

  if (!clean.bust || clean.bust === 0) {
    return {
      size: "M",
      fit: "Regular Fit",
      confidence: 0,
      bodyShape: "unknown",
      note: "Bust measurement required"
    };
  }

  let confidence = getConfidence(clean);

  if (!clean.waist || !clean.hip) {
    confidence -= 15;
  }

  confidence = Math.max(0, confidence);

  const shape = detectBodyShape(clean);

  // ✅ LOW CONFIDENCE PROTECTION
  if (confidence < 50) {
    return {
      size: "M",
      fit: "Regular Fit",
      confidence,
      bodyShape: shape,
      note: "Low confidence scan"
    };
  }

  // ✅ DYNAMIC SCORE (TOP vs BOTTOM)
  let score;

  if (isBottom) {
    score =
      (clean.waist * 0.4) +
      (clean.hip * 0.4) +
      (clean.shoulder * 0.1) +
      (clean.bust * 0.1);
  } else {
    score =
      (clean.bust * 0.5) +
      (clean.shoulder * 0.2) +
      (clean.waist * 0.15) +
      (clean.hip * 0.15);
  }

  // slight blouse bias
  if (cat.includes("blouse")) {
    score *= 0.98;
  }

  let baseSize = "M";

  const buffer = 0.3;

  if (score <= 34 + buffer) baseSize = "XS";
  else if (score <= 36 + buffer) baseSize = "S";
  else if (score <= 38 + buffer) baseSize = "M";
  else if (score <= 40 + buffer) baseSize = "L";
  else if (score <= 42 + buffer) baseSize = "XL";
  else if (score <= 44 + buffer) baseSize = "XXL";
  else if (score <= 46 + buffer) baseSize = "3XL";
  else if (score <= 48 + buffer) baseSize = "4XL";
  else if (score <= 50 + buffer) baseSize = "5XL";
  else baseSize = "6XL";

  let index = sizeOrder.indexOf(baseSize);
  if (index === -1) index = 2;

  // ===============================
  // 🚀 SMART ADJUSTMENTS
  // ===============================

  if ((shape === "pear" || shape === "apple") && isBottom) {
    index += 1;
  }

  const type = (bodyType || "").toLowerCase();
  if (type === "slim") index -= 1;
  if (type === "plus") index += 1;

  const fit = Number(fitPreference) || 0;

  if (fit <= -1) index -= 1;
  if (fit >= 1) index += 1;

  // ✅ FIXED DOUBLE REDUCTION
  if (cat.includes("blouse") && fit === 0) {
    index -= 1;
  }

  if (isBottom && clean.hip > clean.waist + 12) {
    return {
      size: "Custom",
      fit: "Tailored Fit",
      note: "High waist-hip difference",
      confidence: 100,
      bodyShape: shape
    };
  }

  index = Math.max(0, Math.min(index, sizeOrder.length - 1));

  const finalSize = sizeOrder[index];

  if (process.env.NODE_ENV === "development") {
    console.log("🚀 SmartFit V3 Debug:", {
      finalSize,
      shape,
      score,
      confidence
    });
  }

  return {
    size: finalSize,
    fit: fit <= -1 ? "Slim Fit" : fit >= 1 ? "Comfort Fit" : "Regular Fit",
    confidence,
    bodyShape: shape,
    baseSize,
    calculatedScore: score.toFixed(2)
  };
}