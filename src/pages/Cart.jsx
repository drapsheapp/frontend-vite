import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { calculatePricing } from "@/lib/pricing";
import { getMeasurementsByCategory } from "@/lib/measurementFilter";

const Cart = () => {
  const { cart, removeFromCart, getTotalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const pricing = calculatePricing(getTotalAmount());

  const subtotal = pricing.subtotal;
  const tax = pricing.tax;
  const delivery = pricing.delivery;
  const total = pricing.total;

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    navigate("/checkout");
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-raw-silk flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold text-royal-plum mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some beautiful pieces to your cart to get started
          </p>
          <Button
            onClick={() => navigate("/products")}
            className="bg-royal-plum hover:bg-royal-plum/90 text-white"
          >
            Browse Collections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-raw-silk py-8 pb-28 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-royal-plum mb-8">
          Shopping Cart ({cart.length})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            {cart.map((item, index) => {

              const config = item.configuration || {};
              const category = (config.category || "").toLowerCase();

              const isTop =
                category.includes("blouse") ||
                category.includes("salwar-kameez") ||
                category.includes("kurta-set");

              const isBottom =
                category.includes("pant") ||
                category.includes("salwar-kameez") ||
                category.includes("kurta-set");

              const { top, bottom } =
                getMeasurementsByCategory(category, config.measurements || {});

              const filteredMeasurements = [...top, ...bottom];

              return (
                <div
                  key={item.cart_item_id + "_" + index}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-100"
                >
                  <div className="flex flex-col sm:flex-row gap-5">

                    <div className="w-full sm:w-32 h-72 sm:h-40 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={config.image_url}
                        alt={config.product_name || "Product"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/300x400?text=No+Image";
                        }}
                      />
                    </div>

                    <div className="flex-1 relative">

                      <button
                        onClick={() => removeFromCart(item.cart_item_id)}
                        className="absolute right-0 top-0 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>

                      <h3 className="text-lg font-semibold text-royal-plum pr-6">
                        {item.product_name || "Product"}
                      </h3>

                      <p className="text-sm text-gray-500 mb-3">
                        {config.category?.replace("_", " ")}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">

                        {config.body_type && (
                          <span className="bg-gray-100 text-xs px-3 py-1 rounded-full">
                            Body: {config.body_type}
                          </span>
                        )}

                        {config.fitting_preference && (
                          <span className="bg-gray-100 text-xs px-3 py-1 rounded-full">
                            Fit: {config.fitting_preference}
                          </span>
                        )}

                        {config.profile_name && (
                          <span className="bg-gray-100 text-xs px-3 py-1 rounded-full">
                            Profile: {config.profile_name}
                          </span>
                        )}

                        {/* 🔥 ADD THIS */}
                        {config.recommended_size && (
                          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                            Size: {config.recommended_size}
                          </span>
                        )}

                        {config.smartfit_size && (
                          <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full">
                            AI Sized
                          </span>
                        )}

                      </div>

                      <details className="bg-gray-50 rounded-lg p-3 text-sm mt-2">
                        <summary className="cursor-pointer font-semibold text-royal-plum">
                          View Customization
                        </summary>

                        <div className="grid grid-cols-2 gap-3 mt-3 text-gray-600 text-xs">

                          {isTop && config.neck_type && (
                            <p>Neck: {config.neck_type}</p>
                          )}

                          {isTop && config.sleeve_type && (
                            <p>Sleeve: {config.sleeve_type}</p>
                          )}

                          {config.opening && (
                            <p>Opening: {config.opening}</p>
                          )}

                          {config.closure && (
                            <p>Closure: {config.closure}</p>
                          )}

                          {config.padding && (
                            <p>Padding: {config.padding}</p>
                          )}

                          {config.kameezLength && (
                            <p>Length: {config.kameezLength}</p>
                          )}

                          {config.sideSlit && (
                            <p>Side Slit: {config.sideSlit}</p>
                          )}

                          {isBottom && config.bottom_type && (
                            <p>Bottom: {config.bottom_type}</p>
                          )}

                          {isBottom && config.waistStyle && (
                            <p>Waist: {config.waistStyle}</p>
                          )}

                          {isBottom && config.pockets && (
                            <p>Pockets: {config.pockets}</p>
                          )}

                          {config.dupatta && (
                            <p>Dupatta: {config.dupatta}</p>
                          )}

                        </div>

                        {filteredMeasurements.length > 0 && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-royal-plum text-xs font-medium">
                              View Measurements
                            </summary>

                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                              {filteredMeasurements.map(([key, value]) => (
                                <p key={key}>
                                  {key.replace("_", " ")}: {value}"
                                </p>
                              ))}
                            </div>
                          </details>
                        )}

                      </details>

                      <p className="text-xl font-semibold text-royal-plum mt-4">
                        ₹{Number(
                          (item.price ?? 0) * (item.quantity ?? 1)
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block">

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 sticky top-24">

              <h2 className="text-xl font-semibold mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 border-t pt-4">

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
                </div>

                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total</span>
                  <span className="text-royal-plum">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mt-6 bg-royal-plum hover:bg-royal-plum/90 text-white py-6 text-lg font-semibold"
              >
                Proceed to Checkout
              </Button>

            </div>

          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg lg:hidden">

        <div className="flex justify-between font-semibold mb-2">
          <span>Total</span>
          <span className="text-royal-plum">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>

        <Button
          onClick={handleCheckout}
          className="w-full bg-royal-plum text-white py-5 text-lg"
        >
          Checkout
        </Button>

      </div>
    </div>
  );
};

export default Cart;