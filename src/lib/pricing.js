// ======================================
// CENTRAL PRICING ENGINE (SINGLE SOURCE)
// ======================================

export const calculatePricing = (subtotal = 0) => {

  const tax = Math.round(subtotal * 0.05);

  const delivery = subtotal > 2000 ? 0 : 100;

  const total = subtotal + tax + delivery;

  return {
    subtotal,
    tax,
    delivery,
    total
  };
};