import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "@/api/api";

const statusStyles = {
  confirmed: "bg-green-100 text-green-700",
  in_production: "bg-purple-100 text-purple-700",
  stitching: "bg-indigo-100 text-indigo-700",
  qc: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusMessages = {
  confirmed: "Your order has been placed",
  in_production: "Your order is in production",
  stitching: "Your order is being stitched",
  qc: "Quality check in progress",
  shipped: "Your order is on the way",
  delivered: "Delivered successfully",
  cancelled: "Order has been cancelled",
};

const statusLabels = {
  confirmed: "Order Placed",
  in_production: "In Production",
  stitching: "Stitching",
  qc: "Quality Check",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const steps = [
  "confirmed",
  "in_production",
  "stitching",
  "qc",
  "shipped",
  "delivered",
];

const formatPrice = (amount = 0) =>
  Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function OrderTracking() {
  const { orderId: paramId } = useParams();
  const [searchParams] = useSearchParams();

  const orderId = paramId || searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        const res = await API.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        setError("Order not found");
      }
    };

    loadOrder();
  }, [orderId]);

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center text-gray-400">
        Fetching your order details...
      </div>
    );
  }

  const statusClass =
    statusStyles[order.status] ||
    "bg-gray-100 text-gray-700";

  const currentIndex = Math.max(
    0,
    steps.indexOf(order.status)
  );

  const address = order.delivery_address || order.address;

  // ✅ PAYMENT FIX
  const paymentMethod = (order?.payment_method || "").toLowerCase();
  const rawPaymentStatus = (order?.payment_status || "").toLowerCase();

  const paymentStatus =
    (paymentMethod === "cod" && order.status === "delivered") ||
    rawPaymentStatus === "paid" ||
    rawPaymentStatus === "success"
      ? "Paid"
      : "Pending";

  const tax = order.tax ?? order.tax_amount ?? 0;
  const delivery = order.delivery_charge ?? order.delivery_fee ?? 0;

  const getETA = () => {
    if (!order.created_at) return null;
    const date = new Date(order.created_at);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* ORDER HEADER */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">

          <div>
            <h1 className="text-xl font-bold">
              Order #{order.order_id}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {order.created_at
                ? new Date(order.created_at).toLocaleString("en-IN")
                : ""}
            </p>

            <p className="text-sm text-gray-600 mt-2">
              {paymentStatus === "Pending"
                ? "Waiting for payment confirmation"
                : statusMessages[order.status]}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Payment: {paymentStatus}
            </p>

            {order.status !== "delivered" && (
              <p className="text-sm text-green-600 mt-1">
                Expected delivery by {getETA()}
              </p>
            )}
          </div>

          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${statusClass}`}
          >
            {statusLabels[order.status] || order.status}
          </span>

        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex overflow-x-auto gap-5 sm:justify-between no-scrollbar">
          {steps.map((step, index) => {
            const active = index <= currentIndex;

            return (
              <div key={step} className="flex-1 text-center">
                <div
                  className={`h-3 w-3 mx-auto rounded-full ${
                    active ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <p className="text-[10px] sm:text-xs mt-1 leading-tight break-words">
                  {statusLabels[step]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRODUCTS */}
      {order.items?.map((item, i) => (
        <div
          key={i}
          className="bg-white border rounded-xl p-6 flex gap-4 shadow-sm"
        >
          <div className="w-24 h-28 bg-gray-50 border rounded-md overflow-hidden">
            <img
              src={
                item?.image_url ||
                item?.image ||
                item?.product_image ||
                "/placeholder-product.jpg"
              }
              alt={item?.name || "Product"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "/placeholder-product.jpg";
              }}
            />
          </div>

          <div className="flex-1">
            <div className="font-semibold text-gray-900">
              {item?.name || "Custom Outfit"}
            </div>

            <div className="text-sm text-gray-500 mt-1">
              Qty: {item?.quantity || 1}
            </div>

            <div className="mt-3 text-lg font-semibold">
              ₹{formatPrice(
                (item?.price || item?.unit_price || 0) *
                  (item?.quantity || 1)
              )}
            </div>
          </div>
        </div>
      ))}

      {/* ✅ FIXED ORDER TIMELINE */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">

        <h2 className="font-semibold mb-4">
          Order Progress
        </h2>

        <div className="space-y-4">
          {steps.slice(0, currentIndex + 1).map((step, i) => (
            <div key={i} className="flex items-start gap-3">

              <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>

              <div>
                <div className="font-medium text-gray-800">
                  {statusLabels[step]}
                </div>

                <div className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleString("en-IN")}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* DELIVERY ADDRESS */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold mb-3">
          Delivery Address
        </h2>

        {address ? (
          <div className="text-sm text-gray-700 space-y-1">
            <p>{address?.name}</p>
            <p className="text-gray-500">
              {address?.address || address?.address_line1}
            </p>

            {address?.address_line2 && (
              <p className="text-gray-500">
                {address.address_line2}
              </p>
            )}

            <p className="text-gray-500">
              {address?.city}, {address?.state} - {address?.pincode}
            </p>

            {address?.phone && (
              <p className="text-gray-500">
                {address.phone}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Address not available
          </p>
        )}
      </div>

      {/* PAYMENT SUMMARY */}
      <div className="bg-white border rounded-xl p-4 sm:p-6 shadow-sm">

        <h2 className="font-semibold mb-4">
          Payment Summary
        </h2>

        <div className="space-y-2 text-xs sm:text-sm">

          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span className="font-medium whitespace-nowrap">
              ₹{formatPrice(order.subtotal)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Tax</span>
            <span>₹{formatPrice(tax)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Delivery</span>
            <span>₹{formatPrice(delivery)}</span>
          </div>

          <div className="flex justify-between items-center font-semibold text-sm sm:text-base pt-2 border-t">
            <span>Total</span>
            <span>₹{formatPrice(order.total_amount)}</span>
          </div>

        </div>

      </div>

    </div>
  );
}