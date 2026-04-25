import { useEffect, useState } from "react";
import API from "@/api/api";

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // FETCH ORDERS
  // ===============================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/my-orders");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ===============================
  // LOADING STATE
  // ===============================
  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Loading orders...
      </div>
    );
  }

  // ===============================
  // EMPTY STATE
  // ===============================
  if (!orders.length) {
    return (
      <div className="py-14 text-center text-gray-500">
        <p className="text-lg">No orders yet</p>
        <p className="text-sm mt-2">
          Start customizing your first outfit ✨
        </p>
      </div>
    );
  }

  // ===============================
  // ORDERS LIST
  // ===============================
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.order_id}
          className="border rounded-xl p-5 bg-white shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">
              Order #{order.order_id}
            </h3>

            <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">
              {order.status}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Date: {new Date(order.created_at).toLocaleDateString()}
          </p>

          <p className="mt-2 font-medium">
            Total: ₹{order.total_amount}
          </p>

          <p className="text-sm text-gray-500">
            Payment: {order.payment_method}
          </p>
        </div>
      ))}
    </div>
  );
};

export default OrdersTab;