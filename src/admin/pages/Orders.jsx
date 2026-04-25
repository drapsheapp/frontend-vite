import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../api/admin.api";

const Orders = () => {
  // ✅ Status Mapping
  const statusColors = {
    confirmed: "bg-gray-100 text-gray-700",
    in_production: "bg-blue-100 text-blue-700",
    stitching: "bg-purple-100 text-purple-700",
    qc: "bg-yellow-100 text-yellow-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700"
  };

  const statusLabels = {
    confirmed: "Order Confirmed",
    in_production: "In Production",
    stitching: "Stitching",
    qc: "Quality Check",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 25;

  const lastOrderIdRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/order.mp3");
  }, []);

  useEffect(() => {
    loadOrders();

    // ✅ UPDATE: Auto refresh set to 30 seconds
    const interval = setInterval(() => {
      loadOrders();
    }, 30000); 

    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await adminAPI.getOrders();
      const list = Array.isArray(data) ? data : data.orders || [];

      if (list.length > 0) {
        const latestOrderId = list[0].order_id;
        if (lastOrderIdRef.current && latestOrderId !== lastOrderIdRef.current) {
          audioRef.current?.play().catch(() => {});
        }
        lastOrderIdRef.current = latestOrderId;
      }

      setOrders(list);
      setFilteredOrders(list);
    } catch (err) {
      console.error("Failed to load orders", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let list = [...orders];

    if (search) {
      list = list.filter(o =>
        o.order_id.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      list = list.filter(o => o.status === statusFilter);
    }

    setFilteredOrders(list);
    setCurrentPage(1); // Reset to page 1 on search/filter
  }, [search, statusFilter, orders]);

  // ✅ CALCULATION FOR PAGINATION
  const indexOfLast = currentPage * ORDERS_PER_PAGE;
  const indexOfFirst = indexOfLast - ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date + "Z").toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="🔎 Search Order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border rounded-lg px-4 py-2 w-80 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border rounded-lg px-3 py-2 shadow-sm"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Order Confirmed</option>
          <option value="in_production">In Production</option>
          <option value="stitching">Stitching</option>
          <option value="qc">Quality Check</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading orders...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Order ID</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Payment Type</th>
                  <th className="p-3 text-left">Payment Status</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((o, index) => {
                  const paymentMethod = (o?.payment_method || o?.payment_type || o?.payment || "").toLowerCase();
                  const paymentStatus = paymentMethod === "cod" && o.status === "delivered" ? "Paid" : o?.payment_status || "pending";

                  return (
                    <tr key={o._id} className="border-t hover:bg-gray-50">
                      {/* ✅ Serial Number Fix */}
                      <td className="p-3 font-medium">{indexOfFirst + index + 1}</td>
                      <td className="p-3 font-medium">{o.order_id}</td>
                      <td className="p-3">{formatDate(o.created_at)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[o.status] || "bg-gray-100"}`}>
                          {statusLabels[o.status] || o.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold ${paymentMethod === "cod" ? "bg-gray-200 text-gray-800" : "bg-blue-600 text-white"}`}>
                          {paymentMethod === "cod" ? "COD" : "ONLINE"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold ${paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">₹{o.total_amount}</td>
                      <td className="p-3">
                        <Link to={`/admin/orders/${o.order_id}`} className="text-blue-600 hover:underline">View</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ✅ PAGINATION UI */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 mb-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className={`px-4 py-2 border rounded-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                Previous
              </button>
              
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={`px-4 py-2 border rounded-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;