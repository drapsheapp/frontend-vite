import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Star,
  Scissors,
  ShieldCheck,
  PackageCheck
} from "lucide-react";
import { Button } from "../components/ui/button";

import API from "@/api/api";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  const pollingRef = useRef(null);

  /* ================= FETCH ORDER ================= */

  const fetchOrder = async () => {
    if (!orderId) {
      navigate("/orders");
      return;
    }

    try {
      const res = await API.get(`/orders/${orderId}`);
      const data = res.data;

      setOrder(data);

      if (data?.status === "delivered" || data?.status === "cancelled") {
        if (pollingRef.current) clearInterval(pollingRef.current);
      }

    } catch (err) {
      console.error("Order fetch failed", err);
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    fetchOrder();

    pollingRef.current = setInterval(fetchOrder, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderId]);

  /* ================= CANCEL ORDER ================= */

  const handleCancelOrder = async () => {
    try {
      setCancelLoading(true);
      await API.post(`/orders/${order._id}/cancel`);
      await fetchOrder();
    } catch (err) {
      console.error("Cancel failed", err);
    } finally {
      setCancelLoading(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6B0F1A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  /* ================= NORMALIZE DATA ================= */

  const items = (order?.items || []).map((item) => ({
    name:
      item.name ||
      item.product?.name ||
      item.title ||
      "Custom Outfit",

    quantity:
      item.quantity ||
      item.qty ||
      1,

    price:
      item.total_price ||
      item.line_total ||
      item.price ||
      item.product?.price ||
      0,
      
    // 🔥 ADD THIS
    size: item.configuration?.recommended_size,
    smartfit: item.configuration?.smartfit_size,

  }));

  const address = order?.address || {};

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}

      <div className="bg-[#6B0F1A] text-white py-14 text-center">

        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle size={52} className="text-green-600" />
        </div>

        <h1 className="text-3xl font-bold">
          Your Order is Confirmed ✨
        </h1>

        <p className="mt-2 text-white/80">
          Order #{order._id || order.order_id}
        </p>

        <p className="mt-4 text-white/70 text-sm">
          Our artisans have started preparing your custom outfit.
        </p>

      </div>

      {/* ================= MAIN GRID ================= */}

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-10 gap-8">

        {/* ================= LEFT SIDE ================= */}

        <div className="md:col-span-4 space-y-6">

          {/* ORDER SUMMARY */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="font-semibold text-lg mb-4">
              Order Summary
            </h2>

            {items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between py-3 text-sm border-b last:border-none"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-400 text-xs">
                    Qty: {item.quantity}
                  </p>

                  {/* 🔥 ADD THIS */}
                  {item.size && (
                    <p className="text-green-600 text-xs mt-1">
                      ⚡ Size: {item.size}
                    </p>
                  )}

                  {item.smartfit && (
                    <p className="text-green-500 text-[11px]">
                      🤖 SmartFit Applied
                    </p>
                  )}

                </div>

                <span className="font-semibold">
                  ₹{item.price}
                </span>
              </div>
            ))}

            {/* PRICE BREAKDOWN */}

            <div className="border-t mt-4 pt-4 space-y-2 text-sm">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal ?? 0}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{order.tax_amount ?? 0}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{order.delivery_fee ?? 0}</span>
              </div>

              {(order.discount_amount ?? 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount_amount}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span>₹{order.total_amount ?? 0}</span>
              </div>

            </div>

          </div>

          {/* ADDRESS */}

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <h2 className="font-semibold mb-3">
              Delivery Address
            </h2>

            <p className="font-medium">{address.name}</p>

            <p className="text-sm text-gray-500">
              {address.address_line1}, {address.city}
            </p>

            <p className="text-sm text-gray-500">
              {address.pincode}
            </p>

            <p className="text-sm text-gray-500">
              {address.phone}
            </p>

          </div>

          {/* CANCEL ORDER */}

          {order.can_cancel && (
            <Button
              variant="outline"
              className="w-full border-red-500 text-red-600 hover:bg-red-50"
              onClick={handleCancelOrder}
              disabled={cancelLoading}
            >
              {cancelLoading ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}

          {/* ACTION BUTTONS */}

          <div className="flex flex-col md:flex-row gap-4">

            <Button
              onClick={() => navigate("/")}
              className="flex-1 bg-[#6B0F1A] hover:bg-[#7f1421] text-white"
            >
              Continue Shopping
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/orders")}
              className="flex-1 border-[#6B0F1A] text-[#6B0F1A]"
            >
              View Orders
            </Button>

            <Button
              onClick={() => navigate(`/order/${order._id || order.order_id}`)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Track Order
            </Button>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="hidden md:col-span-6 md:flex flex-col gap-6">

          <div className="bg-white rounded-2xl p-8 shadow-sm">

            <h2 className="text-xl font-semibold mb-4">
              How was your ordering experience?
            </h2>

            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map((i)=>(
                <Star
                  key={i}
                  size={28}
                  className="text-[#6B0F1A] cursor-pointer"
                />
              ))}
            </div>

            <p className="text-gray-500">
              Your feedback helps us craft better experiences.
            </p>

          </div>

          <div className="bg-white rounded-2xl p-8 flex gap-10 shadow-sm">

            <div className="flex items-center gap-3">
              <Scissors className="text-[#6B0F1A]" />
              <span className="font-medium">Expert Tailoring</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#6B0F1A]" />
              <span className="font-medium">Secure Payments</span>
            </div>

            <div className="flex items-center gap-3">
              <PackageCheck className="text-[#6B0F1A]" />
              <span className="font-medium">Quality Checked</span>
            </div>

          </div>

          <div className="text-center text-lg font-semibold text-gray-700">
            StitchStudio — crafted perfectly for you ✨
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderSuccessPage;
