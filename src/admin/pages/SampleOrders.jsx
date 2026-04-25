import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../api/admin.api";
import { Eye, RefreshCw, Package, Truck, CheckCircle2, Clock, MapPin, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

const normalizeStatus = (status) => {
  return status
    ?.toLowerCase()
    .replace("in_", "")
    .replace(/\s+/g, "")
    .trim();
};

export default function SampleOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 25;
  const navigate = useNavigate();

  // Updated Status List with Production included
  const statusSteps = [
    { id: "pickup_pending", label: "Pickup", color: "bg-amber-500" },
    { id: "picked", label: "Picked", color: "bg-blue-500" },
    { id: "production", label: "Production", color: "bg-rose-500" }, // New Step
    { id: "stitching", label: "Stitching", color: "bg-purple-500" },
    { id: "qc", label: "QC Pass", color: "bg-indigo-500" },
    { id: "shipped", label: "Shipped", color: "bg-orange-500" },
    { id: "delivered", label: "Delivered", color: "bg-emerald-500" },
  ];

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSampleOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching sample orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await adminAPI.updateSampleOrderStatus(id, status);
      fetchOrders();
    } catch (err) { console.error("Status update failed", err); }
  };

  const getTimeDiff = (createdAt) => {
    if (!createdAt) return "-";

    const now = new Date(); // ✅ सही तरीका

    // 🔥 FIX: force UTC handling like Orders page
    const created = new Date(createdAt + "Z");

    const diffMs = now - created;

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h ${minutes % 60}m`;

    return `${days}d`;
  };

  // Logic for Filtering and Pagination
  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter((o) => normalizeStatus(o.status) === statusFilter);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="p-8 bg-[#F8F9FB] min-h-screen font-sans">
      
      {/* --- PREMIUM HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sample Management</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
            <Clock size={14} /> Real-time order monitoring active
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-all active:scale-95"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh Dashboard
        </button>
      </div>

      {/* --- QUICK STATS --- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {['all', 'pickup_pending', 'production', 'stitching', 'delivered'].map((stat) => (
          <div key={stat} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">{stat.replace('_', ' ')}</p>
            <p className="text-2xl font-bold text-slate-800">
              {stat === 'all' ? orders.length : orders.filter(o => normalizeStatus(o.status) === stat).length}
            </p>
          </div>
        ))}
      </div>

      {/* --- FILTERS --- */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["all", ...statusSteps.map(s => s.id)].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              statusFilter === s
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* --- MAIN TABLE --- */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Order Details</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Customer</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Time Slot</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Payment</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase text-center">Workflow Status</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr><td colSpan="6" className="p-20 text-center text-slate-400 animate-pulse">Fetching latest data...</td></tr>
              ) : currentOrders.length === 0 ? (
                <tr><td colSpan="6" className="p-20 text-center text-slate-400">No orders found in this category.</td></tr>
              ) : (
                currentOrders.map((o) => (
                  <>

                  {o.status === "pickup_pending" && (
                    <tr>
                      <td colSpan="6" className="px-5 pt-4 pb-0">
                        <div className="bg-amber-100 border border-amber-200 p-2 rounded-lg flex items-center justify-between animate-pulse">
                          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                            <AlertTriangle size={14} className="text-amber-600" />
                            Pickup Pending - Action Required
                          </div>
                          <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded">
                            URGENT
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}

                  <tr key={o.order_id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    <td className="p-5">
                      <div className="font-bold text-slate-800">#{o.order_id.slice(-6)}</div>
                      <div className="text-sm text-slate-600 font-medium mt-1">{o.items?.[0]?.product_name || "Premium Sample"}</div>
                      <div className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <Clock size={10}/> {getTimeDiff(o.created_at)} ago
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="font-semibold text-slate-800 text-sm">{o.sample_pickup?.name || "Guest User"}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={10} /> {o.sample_pickup?.phone}
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="text-sm font-medium text-slate-700">{o.sample_pickup?.pickup_date}</div>
                      <div className="text-xs text-slate-400 italic">{o.sample_pickup?.time_slot}</div>
                    </td>

                    <td className="p-5">
                      <div className="text-sm font-bold text-slate-800">₹{o.total_amount}</div>

                      {(() => {
                        const paymentMethod = (o?.payment_method || o?.payment_type || o?.payment || "").toLowerCase();

                        const paymentStatus =
                          paymentMethod === "cod" && normalizeStatus(o.status) === "delivered"
                            ? "paid"
                            : o?.payment_status || "pending";

                        return (
                          <span
                            className={`text-[10px] uppercase tracking-widest font-extrabold ${
                              paymentStatus === "paid" ? "text-emerald-500" : "text-amber-500"
                            }`}
                          >
                            {paymentStatus}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="p-5">
                      <div className="flex flex-col items-center gap-2">
                         <div className="flex items-center w-full max-w-[220px]">
                            {statusSteps.map((step, idx) => {
                                const currentStatus = normalizeStatus(o.status);
                                const currentIndex = statusSteps.findIndex(s => s.id === currentStatus);
                                const isCompleted = currentIndex >= idx;

                                return (
                                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                        <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${isCompleted ? step.color : 'bg-slate-200'}`} />
                                        {idx !== statusSteps.length - 1 && (
                                            <div className={`h-[2px] w-full ${isCompleted ? 'bg-slate-400' : 'bg-slate-100'}`} />
                                        )}
                                    </div>
                                );
                            })}
                         </div>
                         <span className="text-[10px] font-bold uppercase text-slate-500 tracking-tight bg-slate-100 px-2 py-0.5 rounded">
                            {normalizeStatus(o.status).replace("_", " ")}
                         </span>
                      </div>
                    </td>

                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => updateStatus(o.order_id, "production")}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors" title="Move to Production">
                          <Package size={16} />
                        </button>
                        <button 
                          onClick={() => updateStatus(o.order_id, "shipped")}
                          className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-colors" title="Ship Now">
                          <Truck size={16} />
                        </button>
                        <button 
                          onClick={() => updateStatus(o.order_id, "delivered")}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors" title="Mark Delivered">
                          <CheckCircle2 size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/sample-orders/${o.order_id}`)}
                          className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-md">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>

                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-900">{indexOfFirstOrder + 1}</span> to <span className="text-slate-900">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> of <span className="text-slate-900">{filteredOrders.length}</span> orders
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}