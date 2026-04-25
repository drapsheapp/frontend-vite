import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { adminAPI } from "../api/admin.api";
import {
  Phone,
  MessageCircle,
  MapPin,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

const normalizeStatus = (status) =>
  status?.toLowerCase().replace("in_", "").trim();

export default function SampleOrderDetail() {
  const { id } = useParams();
  const order_id = id;

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const statusSteps = [
    "pickup_pending",
    "picked",
    "production",
    "stitching",
    "qc",
    "shipped",
    "delivered",
  ];

  const fetchOrder = async () => {
    try {
      const res = await adminAPI.getOrderDetail(order_id);
      setOrder(res.data);
      setStatus(res.data?.status || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    try {
      setUpdating(true);
      await adminAPI.updateOrderStatus(order_id, status);
      await fetchOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [order_id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  );

  if (!order) return <div className="p-6 text-red-500 font-bold text-center">Order not found!</div>;

  const currentStatus = normalizeStatus(order.status);
  const currentIndex = statusSteps.indexOf(currentStatus);
  const isPending = currentStatus === "pickup_pending";

  const phone = order.sample_pickup?.phone || "";
  const address = order.sample_pickup?.address || "";
  const paymentMethod = (order?.payment_method || "").toLowerCase();
  const paymentStatus = paymentMethod === "cod" && currentStatus === "delivered" ? "paid" : order?.payment_status || "pending";

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24">
      {/* URGENCY NOTIFICATION (Blinkit Style) */}
      {isPending && (
        <div className="bg-amber-100 border-b border-amber-200 p-3 sticky top-0 z-50 animate-pulse">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertTriangle size={20} className="text-amber-600" />
              <span className="text-sm">ACTION REQUIRED: Sample Pickup Pending</span>
            </div>
            <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Urgent</span>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-2">
           <button onClick={() => window.history.back()} className="p-2 bg-white rounded-full shadow-sm">
              <ArrowLeft size={20} />
           </button>
           <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-tight">Order ID</p>
              <p className="text-lg font-black text-gray-900">#{order.order_id}</p>
           </div>
        </div>

        {/* PAYMENT & STATUS CHIP */}
        <div className="flex gap-2">
           <div className={`flex-1 p-3 rounded-2xl flex items-center justify-between ${paymentStatus === 'paid' ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-bold">Payment Status</p>
                <p className={`font-bold capitalize ${paymentStatus === 'paid' ? 'text-green-700' : 'text-orange-700'}`}>{paymentStatus}</p>
              </div>
              <CheckCircle2 size={24} className={paymentStatus === 'paid' ? 'text-green-500' : 'text-orange-300'} />
           </div>
           <div className="flex-1 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <p className="text-[10px] uppercase text-gray-500 font-bold">Method</p>
              <p className="font-bold uppercase text-gray-800">{paymentMethod || 'Online'}</p>
           </div>
        </div>

        {/* CUSTOMER PROFILE CARD */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-1">Customer Details</h3>
              <h2 className="text-xl font-bold text-gray-800">{order.sample_pickup?.name}</h2>
            </div>
            <div className="bg-gray-100 p-2 rounded-full">
              <Package className="text-gray-600" size={20} />
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed">{address}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">{phone || "-"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">{order.sample_pickup?.pickup_date} • {order.sample_pickup?.time_slot}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <a href={`tel:${phone}`} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 text-blue-700 transition-active active:scale-95">
              <Phone size={20} />
              <span className="text-[10px] font-bold mt-1">Call</span>
            </a>
            <a href={`https://wa.me/${phone}`} target="_blank" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-green-50 text-green-700 active:scale-95">
              <MessageCircle size={20} />
              <span className="text-[10px] font-bold mt-1">WhatsApp</span>
            </a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 text-gray-700 active:scale-95">
              <MapPin size={20} />
              <span className="text-[10px] font-bold mt-1">Locate</span>
            </a>
          </div>
        </div>

        {/* ORDER TIMELINE - ZEPT STYLE VERTICAL */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Live Tracking</h3>
          <div className="space-y-0">
            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-4 ${isCompleted ? 'bg-green-500 border-green-100' : 'bg-gray-200 border-transparent'} ${isCurrent ? 'ring-2 ring-green-500 ring-offset-2' : ''}`} />
                    {i !== statusSteps.length - 1 && <div className={`w-[2px] h-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-100'}`} />}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-bold capitalize ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.replace("_", " ")}
                    </p>
                    {isCurrent && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Active Now</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FIXED FOOTER UPDATE BAR (App-like feel) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)] max-w-2xl mx-auto rounded-t-3xl">
           <div className="flex gap-3">
              <div className="flex-[2]">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none text-sm font-bold focus:ring-2 focus:ring-purple-500 appearance-none"
                >
                  {statusSteps.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={updateStatus}
                disabled={updating}
                className={`flex-[3] h-12 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg ${updating ? 'bg-gray-400' : 'bg-black text-white active:scale-95 shadow-black/20'}`}
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}