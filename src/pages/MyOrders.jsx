import { useEffect, useState } from "react";
import API from "@/api/api";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  confirmed: "bg-green-100 text-green-700",
  payment_pending: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const formatPrice = (amount = 0) =>
  Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function MyOrders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {

    const loadOrders = async () => {

      try {

        const res = await API.get("/orders/my-orders");
        setOrders(res.data || []);

      } catch (err) {

        console.error("Failed to load orders", err);

      } finally {
        setLoading(false);
      }

    };

    loadOrders();

  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading your orders...
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-10 text-center text-gray-500">
        No orders yet
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        My Orders
      </h1>

      <div className="space-y-4">

        {orders.map((order) => {

          const item = order.items?.[0];

          const statusClass =
            statusStyles[order.status] ||
            "bg-gray-100 text-gray-700";

          return (

            <div
              key={order.order_id}
              className="border bg-white rounded-xl p-4 flex gap-4 hover:shadow-md transition"
            >

              {/* PRODUCT IMAGE */}

              <div className="w-20 h-24 bg-gray-50 rounded-md overflow-hidden border">

                <img
                  src={
                    item?.image_url ||
                    item?.image ||
                    item?.product_image ||
                    "/placeholder-product.jpg"
                  }
                  alt={item?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-product.jpg";
                  }}
                />

              </div>

              {/* ORDER INFO */}

              <div className="flex-1">

                <div className="flex justify-between items-start">

                  <div>

                    <div className="font-semibold text-gray-900">
                      {item?.name || "Custom Outfit"}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      Order #{order.order_id}
                    </div>

                    <div className="text-xs text-gray-400 mt-1">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("en-IN")
                        : ""}
                    </div>

                  </div>

                  {/* STATUS BADGE */}

                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${statusClass}`}
                  >
                    {order.status?.replace("_", " ")}
                  </span>

                </div>

                {/* PRICE */}

                <div className="mt-3 font-semibold text-lg">
                  ₹{formatPrice(order.total_amount)}
                </div>

                {/* ACTION BUTTONS */}

                <div className="flex gap-2 mt-3">

                  <button
                    className="border px-3 py-1 text-sm rounded hover:bg-gray-50"
                    onClick={() =>
                      navigate(`/orders/${order.order_id}`)
                    }
                  >
                    View Details
                  </button>

                  <button
                    className="bg-green-600 text-white px-3 py-1 text-sm rounded"
                    onClick={() =>
                      navigate(`/order/${order.order_id}`)
                    }
                  >
                    Track Order
                  </button>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );

}