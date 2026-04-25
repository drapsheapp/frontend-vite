import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { orderAPI } from "@/features/orders/api/orders.api";
import { getMeasurementsByCategory } from "@/lib/measurementFilter";
import { downloadInvoice } from "@/api/api";

const statusColors = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_production: "bg-blue-50 text-blue-700 border-blue-200",
  stitching: "bg-purple-50 text-purple-700 border-purple-200",
  qc: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-800 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const productionSteps = [
  "confirmed",
  "in_production",
  "stitching",
  "qc",
  "shipped",
  "delivered",
];

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getOrderById(orderId);
        setOrder(res.data);
      } catch (error) {
        console.error("Failed to load order details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading)
    return <p className="text-center py-20 text-gray-500">Loading order...</p>;

  if (!order)
    return (
      <p className="text-center py-20 text-red-500">
        Order not found
      </p>
    );

  // Logic for calculations
  const currentStepIndex = productionSteps.indexOf(order.status);
  const subtotal =
    order.subtotal ||
    order.items?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ) ||
    0;

  const gst = subtotal * 0.05;
  const deliveryFee = order.delivery_fee || 0;
  const totalAmount = subtotal + gst + deliveryFee;

  const address =
    order.address_snapshot ||
    order.address ||
    order.shipping_address ||
    {};

  // --- UPDATED PAYMENT LOGIC START ---
  const paymentMethod = (order?.payment_method || "").toLowerCase();
  const rawPaymentStatus = (order?.payment_status || "").toLowerCase();

const paymentStatus =
  (paymentMethod === "cod" && order.status === "delivered") ||
   rawPaymentStatus === "paid" ||
   rawPaymentStatus === "success"
     ? "Paid"
     : "Pending";
  // --- UPDATED PAYMENT LOGIC END ---

  return (
    <div className="bg-[#faf9f7] min-h-screen py-8 md:py-14 px-3 md:px-4">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 p-4 md:p-8 flex flex-col md:flex-row justify-between gap-5 md:gap-8">

          <div>
            <h1 className="text-lg md:text-3xl font-display font-bold text-royal-plum mb-2">
              Order #{order.order_id}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
            <p className="mt-3 md:mt-4 text-xl md:text-2xl font-semibold text-gray-900">
              ₹{totalAmount.toFixed(2)}
            </p>
            
            {/* UPDATED UI BLOCK */}
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Payment:{" "}
              <span
                className={
                  paymentStatus === "Paid"
                    ? "text-green-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                {paymentStatus}
              </span>
            </p>

            {/* ✅ BUTTON OUTSIDE */}
            <div className="mt-4">
              <button
                onClick={() => downloadInvoice(order._id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download Invoice
              </button>
            </div>
            
          </div>

          <div className="flex flex-col items-start md:items-end gap-4 md:gap-6">
            <span
              className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium border ${
                statusColors[order.status] ||
                "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {order.status.replace("_", " ")}
            </span>

            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {productionSteps.map((step, index) => (
                <div
                  key={step}
                  className={`px-2.5 md:px-4 py-1 text-[11px] md:text-xs rounded-full border transition ${
                    index <= currentStepIndex
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-400 border-gray-200"
                  }`}
                >
                  {step.replace("_", " ")}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 p-4 md:p-8 space-y-6 md:space-y-8">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Items in this order
          </h2>

          {order.items?.map((item, index) => {
            const image =
              item.image ||
              item.image_url ||
              "https://via.placeholder.com/200";

            const customization =
              item.customization_snapshot ||
              item.configuration ||
              {};

            const itemMeasurements =
              item.measurement_snapshot ||
              customization.measurements ||
              {};

            const category = (
              customization.category ||
              item.category ||
              ""
            ).toLowerCase();

            const { top, bottom } =
              getMeasurementsByCategory(category, itemMeasurements);

            const filteredMeasurements = [...top, ...bottom];

            return (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-4 md:gap-8 border border-gray-100 rounded-2xl p-4 md:p-6 hover:shadow-md transition"
              >
                <img
                  src={image}
                  alt={item.name}
                  className="w-full md:w-40 h-48 md:h-40 object-cover rounded-xl shadow-sm"
                />

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Price: ₹{item.price}
                    </p>

                    {/* 🔥 ADD THIS */}
                    {customization?.recommended_size && (
                      <p className="text-green-600 text-sm mt-1">
                        ⚡ Size: {customization.recommended_size}
                      </p>
                    )}

                    {customization?.smartfit_size && (
                    <p className="text-green-500 text-xs">
                      🤖 SmartFit Applied
                    </p>
                    )}
                  </div>

                  {Object.keys(customization).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {Object.entries(customization).map(([key, value]) => {
                        if (
                          key === "measurements" ||
                          key === "image_url" ||
                          key === "product_name" ||
                          !value
                        )
                          return null;

                        return (
                          <div
                            key={key}
                            className="bg-[#f8f7f4] rounded-lg px-3 py-2 border border-gray-100"
                          >
                            <p className="text-gray-500 text-xs capitalize">
                              {key.replace("_", " ")}
                            </p>
                            <p className="font-medium text-gray-800">
                              {value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {filteredMeasurements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Measurements
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                        {filteredMeasurements.map(([key, value]) => (
                          <div
                            key={key}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                          >
                            <p className="text-gray-500 capitalize">
                              {key.replace("_", " ")}
                            </p>
                            <p className="font-semibold text-gray-800">
                              {value}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          {address && Object.keys(address).length > 0 && (
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Delivery Address
              </h2>
              <p className="font-medium">{address.name}</p>
              <p className="text-sm text-gray-600">{address.phone}</p>
              <p className="text-sm text-gray-600">
                {address.address_line1}
              </p>
              <p className="text-sm text-gray-600">
                {address.city}, {address.state} - {address.pincode}
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Price Details
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">GST (5%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>

              <div className="border-t pt-4 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-royal-plum">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailsPage;