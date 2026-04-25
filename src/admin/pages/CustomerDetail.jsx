import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  ShoppingBag, 
  TrendingUp, 
  Ruler, 
  X,
  CheckCircle2,
  Layers,
  Calculator
} from "lucide-react";
import { customersAPI } from "@/features/customers/api/customers.api";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // NEW: Category State for Measurements
  const [selectedCategory, setSelectedCategory] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const detail = await customersAPI.getCustomerDetail(id);
      const stats = await customersAPI.getCustomerAnalytics(id);
      setCustomer(detail);
      setAnalytics(stats);
    } catch (err) {
      console.error("Load failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-purple-600 animate-pulse">Loading Premium Profile...</div>;
  if (!customer) return <div className="p-10 text-red-500">Customer not found</div>;

  const paginatedOrders = customer?.orders?.slice((page - 1) * limit, page * limit) || [];
  const totalPages = Math.ceil((customer?.orders?.length || 0) / limit);

  // LOGIC: Check what to show based on category
  const showTop = ["Blouse", "Kurta Set", "Salwar Kameez"].includes(selectedCategory);
  const showBottom = ["Pant", "Kurta Set", "Salwar Kameez"].includes(selectedCategory);

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 md:p-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50 transition-all border border-gray-100 text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Intelligence</h1>
            <p className="text-sm font-bold text-purple-600 uppercase tracking-widest">ID: {customer.id?.slice(-8)}</p>
          </div>
        </div>

        <button 
          onClick={() => {
            setSelectedCategory(""); // Reset category on open
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Ruler size={18} /> Update Measurements
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: PROFILE CARD */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <div className="w-24 h-24 bg-gradient-to-tr from-purple-100 to-blue-50 rounded-full flex items-center justify-center text-3xl font-black text-purple-600 border-4 border-white shadow-xl">
                {customer.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">{customer.name}</h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">Verified Customer</span>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Phone size={18} /></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Contact</p><p className="font-bold text-gray-800">{customer.phone}</p></div>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Mail size={18} /></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Email</p><p className="font-bold text-gray-800">{customer.email || "Not Provided"}</p></div>
              </div>
              <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl mt-1"><MapPin size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Default Address</p>
                  <p className="font-semibold text-gray-700 text-sm leading-snug">
                    {customer.addresses?.[0] ? `${customer.addresses[0].address_line1}, ${customer.addresses[0].city}` : "No address saved"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ANALYTICS MINI WIDGETS */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <ShoppingBag className="text-blue-500 mb-2" size={20} />
                <p className="text-2xl font-black text-gray-900">{analytics?.total_orders || 0}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Orders</p>
             </div>
             <div className="bg-[#111827] p-5 rounded-3xl shadow-xl shadow-black/10">
                <TrendingUp className="text-green-400 mb-2" size={20} />
                <p className="text-2xl font-black text-white">₹{analytics?.lifetime_value || 0}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">LTV (Revenue)</p>
             </div>
             {/* 🔥 NEW: AVERAGE ORDER VALUE */}
             <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm col-span-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Calculator size={20}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Avg. Order Value (AOV)</p>
                    <p className="text-xl font-black text-gray-900">₹{analytics?.total_orders > 0 ? (analytics.lifetime_value / analytics.total_orders).toFixed(0) : 0}</p>
                  </div>
                </div>
                <div className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">PROFITABLE</div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ORDERS TABLE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
            <h3 className="text-xl font-black text-gray-900 mb-6">Order History</h3>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Order ID</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Status</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Amount</th>
                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50/80 transition-all group">
                      <td className="py-5 px-4"><span className="font-bold text-gray-800 tracking-tight">#{o._id.slice(-6)}</span></td>
                      <td className="py-5 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${o.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-5 px-4 font-black text-gray-900">₹{o.total_amount}</td>
                      <td className="py-5 px-4 text-xs font-bold text-gray-400">{new Date(o.createdAt || Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
               <button 
                 disabled={page === 1}
                 onClick={() => setPage(prev => prev - 1)}
                 className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold disabled:opacity-30 hover:bg-gray-50"
               >Prev</button>
               <span className="text-xs font-black text-gray-400 uppercase">Page {page} of {totalPages}</span>
               <button 
                 disabled={page >= totalPages}
                 onClick={() => setPage(prev => prev + 1)}
                 className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold disabled:opacity-30 hover:bg-gray-50"
               >Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MEASUREMENT MODAL (SIDE OVER) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-all">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white z-20 p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900">Personalized Measurements</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Update specs for {customer.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:rotate-90 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-10 pb-32">
              
              {/* STEP 1: CATEGORY SELECTION */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                   <div className="h-6 w-1 bg-black rounded-full"></div>
                   <h4 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">Step 1: Select Category</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Blouse", "Salwar Kameez", "Kurta Set", "Pant"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`py-3 px-2 rounded-xl border-2 text-[11px] font-black uppercase transition-all ${
                        selectedCategory === cat 
                        ? "border-black bg-black text-white shadow-lg" 
                        : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>

              {selectedCategory ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                  
                  {/* 🧵 TOP CUSTOMIZATION (Conditional) */}
                  {showTop && (
                    <section className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                         <div className="h-6 w-1 bg-purple-600 rounded-full"></div>
                         <h4 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">Top Customization ({selectedCategory})</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                         <CustomSelect label="Front Neck Style" options={['Round', 'V-Neck', 'Deep V', 'Boat', 'Collar', 'Sweetheart']} />
                         <CustomSelect label="Sleeve Style" options={['Sleeveless', 'Short', 'Elbow', '3/4 Sleeve', 'Full']} />
                         <CustomSelect label="Kameez Length" options={['Knee Length', 'Calf Length', 'Ankle Length', 'Floor Length']} />
                         <CustomSelect label="Side Slit" options={['Normal Slit', 'High Slit', 'Front Slit', 'No Slit']} />
                      </div>

                      <div className="bg-purple-50/50 p-6 rounded-[2rem] border border-purple-100">
                        <p className="text-[10px] font-black text-purple-400 uppercase mb-4 tracking-widest">Top Measurements (Inches)</p>
                        <div className="grid grid-cols-3 gap-4">
                           {['bust', 'underbust', 'shoulder', 'armhole', 'waist top', 'length top'].map(m => (
                             <MeasurementInput key={m} name={m} />
                           ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* 👖 BOTTOM CUSTOMIZATION (Conditional) */}
                  {showBottom && (
                    <section className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                         <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
                         <h4 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">Bottom Customization</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <CustomSelect label="Bottom Type" options={['Straight Pant', 'Cigarette Pant', 'Palazzo', 'Churidar', 'Sharara', 'Tulip Pant']} />
                         <CustomSelect label="Waist Style" options={['Full Elastic', 'Back Elastic + Belt', 'Drawstring (Nada)']} />
                         <CustomSelect label="Pockets" options={['No Pocket', 'One Side', 'Both Sides']} />
                         <CustomSelect label="Dupatta Style" options={['No Dupatta', 'Plain', 'Lace Border', 'Heavy Work']} />
                      </div>

                      <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-widest">Bottom Measurements (Inches)</p>
                        <div className="grid grid-cols-3 gap-4">
                           {['waist bottom', 'hip', 'thigh', 'knee', 'calf', 'ankle', 'crotch rise', 'length bottom'].map(m => (
                             <MeasurementInput key={m} name={m} />
                           ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* PREFERENCES */}
                  <section className="space-y-6 pt-4">
                    <div className="flex items-center gap-2">
                         <div className="h-6 w-1 bg-emerald-600 rounded-full"></div>
                         <h4 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">Fitting Preferences</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <CustomSelect label="Body Type" options={['Slim', 'Regular', 'Plus']} />
                       <CustomSelect label="Fitting Preference" options={['Tight', 'Regular', 'Loose']} />
                    </div>
                  </section>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                  <Layers className="text-gray-200" size={48} />
                  <p className="text-gray-400 font-bold text-sm">Please select a category above <br/> to see specific measurements</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="fixed bottom-0 w-full max-w-2xl bg-white p-6 border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold text-gray-500 rounded-2xl border hover:bg-gray-50 transition-all"
                >Cancel</button>
                <button 
                  disabled={!selectedCategory}
                  className="flex-[2] py-4 font-bold text-white bg-black rounded-2xl shadow-xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={18} /> Save {selectedCategory} Specs
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// Reusable UI Components
const CustomSelect = ({ label, options }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{label}</label>
    <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm text-gray-800 focus:ring-4 focus:ring-purple-50 outline-none transition-all appearance-none">
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const MeasurementInput = ({ name }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-gray-500 capitalize">{name} *</label>
    <input 
      type="number" 
      placeholder="0.0"
      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-sm text-gray-800 focus:border-black outline-none transition-all"
    />
  </div>
);

export default CustomerDetail;