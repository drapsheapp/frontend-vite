import React, { useState, useEffect } from "react";
import { adminAPI } from "../api/admin.api";
import { useNavigate } from "react-router-dom";
import { 
  Search, Bell, ChevronDown, Download, Layout, DollarSign, 
  Package, Users, Shirt, LogOut, TrendingUp, Zap, Clock, 
  MapPin, ShoppingCart, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid, BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line
} from "recharts";

const COLORS = ["#564ab1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// ✅ NORMALIZE FUNCTION
const normalizeSales = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map(item => ({
    date: item.date || item._id,
    revenue: item.revenue || item.total || 0,
    orders: item.orders || Math.floor(Math.random() * 50) + 10 // Mocking orders for AOV calculation
  }));
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- REAL DATA STATE ---
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    aov: 0,
    retention: "0%"
  });
  
  const [sales, setSales] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [devices, setDevices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [gender, setGender] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAnalytics();
      const data = res?.data || {};

      // Calculate AOV (Average Order Value) - Blinkit/Zepto Key Metric
      const totalRev = data.total_sales || 0;
      const totalOrd = data.orders || 0;
      const calculatedAOV = totalOrd > 0 ? (totalRev / totalOrd).toFixed(2) : 0;

      setStats({
        revenue: totalRev,
        orders: totalOrd,
        customers: data.customers || 0,
        products: data.products || 0,
        aov: calculatedAOV,
        retention: "32.5%" // Zepto focuses heavily on repeat users
      });

      // Data fetching
      const [v, d, l, p, s, g] = await Promise.all([
        adminAPI.getVisitors(),
        adminAPI.getDevices(),
        adminAPI.getLocations(),
        adminAPI.getTopProducts(),
        adminAPI.getSales(),
        adminAPI.getGender()
      ]);

      setVisitors(v.data || []);
      setDevices(d.data || []);
      setLocations(l.data || []);
      setTopProducts(p.data || []);
      setSales(normalizeSales(s.data));
      setGender(g.data || []);
      
      // Mocking Order Status for Zepto Efficiency Tracking
      setOrderStatus([
        { name: 'Delivered', value: 400 },
        { name: 'In Transit', value: 120 },
        { name: 'Pending', value: 45 },
        { name: 'Cancelled', value: 25 },
      ]);

    } catch (e) {
      console.error("Dashboard upgrade error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-[#1E293B]">
      
      {/* 1. TOP NAVBAR (ZEPTO DARK STYLE) */}
      <header className="bg-[#111827] text-white border-b border-gray-800 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="bg-[#564ab1] p-1.5 rounded-lg">
               <Zap size={20} className="fill-white text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">DRAPSHE <span className="text-[#564ab1] text-xs font-bold bg-white/10 px-2 py-0.5 rounded ml-1">PRO</span></h1>
          </div>
          <nav className="hidden lg:flex gap-6 text-[12px] font-bold uppercase tracking-widest text-gray-400">
            <span className="text-white border-b-2 border-[#564ab1] pb-1 cursor-pointer">Operations</span>
            <span className="hover:text-white cursor-pointer transition-colors">Inventory</span>
            <span className="hover:text-white cursor-pointer transition-colors">Fleet Tracking</span>
            <span className="hover:text-white cursor-pointer transition-colors">Marketing</span>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <div className="bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-700">
            <Bell size={18} />
          </div>
          <div className="flex items-center gap-3 border-l border-gray-700 pl-5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">Platform Admin</p>
              <p className="text-[10px] text-gray-400">Super User</p>
            </div>
            <img src="https://ui-avatars.com/api/?name=Admin&background=564ab1&color=fff" className="w-9 h-9 rounded-xl border-2 border-gray-700" alt="admin" />
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
               <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto">
        
        {/* 2. HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2">Business Command Center <span className="animate-pulse bg-emerald-500 w-2 h-2 rounded-full"></span></h2>
            <p className="text-gray-500 text-sm">Monitoring Drapshe ecosystem: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 shadow-sm">
               <Clock size={16}/> Real-time
             </button>
             <button className="bg-[#564ab1] text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-[#564ab1]/30 hover:scale-105 transition-transform flex items-center gap-2">
               <Download size={16}/> Export Analytics
             </button>
          </div>
        </div>

        {/* 3. KPI GRID (ZEPTO METRICS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <KpiCard label="Gross Revenue" value={`₹${stats.revenue.toLocaleString()}`} trend="+12.5%" isPos={true} icon={<DollarSign size={20}/>} color="bg-blue-500" />
           <KpiCard label="Daily Orders" value={stats.orders} trend="+8.2%" isPos={true} icon={<ShoppingCart size={20}/>} color="bg-emerald-500" />
           <KpiCard label="Average Order Value" value={`₹${stats.aov}`} trend="-2.4%" isPos={false} icon={<TrendingUp size={20}/>} color="bg-orange-500" />
           <KpiCard label="User Retention" value={stats.retention} trend="+4.1%" isPos={true} icon={<Users size={20}/>} color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          {/* 4. REVENUE GROWTH AREA CHART */}
          <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg">Sales & Growth Trajectory</h3>
              <select className="bg-gray-50 border-none text-xs font-bold rounded-lg px-3 py-1 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer>
                <AreaChart data={sales}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#564ab1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#564ab1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    formatter={(val) => [`₹${val}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#564ab1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. DELIVERY & STATUS (ZEPTO STYLE) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Package size={18} className="text-gray-400"/> Order Lifecycle</h3>
              <div className="h-[240px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={orderStatus} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {orderStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                 {orderStatus.map((s, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                     <span className="text-[11px] font-bold text-gray-500 uppercase">{s.name}: {s.value}</span>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Operational Efficiency</p>
                  <h4 className="text-4xl font-black">98.2%</h4>
                  <p className="text-xs mt-2 text-emerald-400 flex items-center gap-1 font-bold">
                    <ArrowUpRight size={14}/> Top 5% in industry
                  </p>
                  <div className="mt-6 space-y-3">
                    <EfficiencyBar label="Pick-up Time" val={92} />
                    <EfficiencyBar label="Delivery Speed" val={85} />
                  </div>
               </div>
               <Zap className="absolute -right-6 -bottom-6 text-white/5" size={120} />
            </div>
          </div>

          {/* 6. LOCATIONS & TOP INVENTORY */}
          <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-gray-800">Demand Heatmap (Top Cities)</h3>
              <MapPin size={18} className="text-gray-400" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer>
                <BarChart data={locations}>
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px'}} />
                  <Bar dataKey="count" fill="#564ab1" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50 flex justify-between items-center">
               <h3 className="font-black text-gray-800">Inventory Velocity</h3>
               <span className="text-xs font-bold text-[#564ab1] bg-purple-50 px-3 py-1 rounded-full">High Moving</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                   <tr>
                     <th className="px-6 py-4">Product Unit</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Stock Velocity</th>
                     <th className="px-6 py-4 text-right">Revenue Cont.</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {topProducts.slice(0, 5).map((p, idx) => (
                     <tr key={idx} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4">
                         <p className="font-black text-sm text-[#111827]">{p._id}</p>
                         <p className="text-[10px] text-gray-400">SKU: DR-00{idx+1}</p>
                       </td>
                       <td className="px-6 py-4">
                         <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-md">IN STOCK</span>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <span className="text-xs font-bold">{p.views} views</span>
                            <div className="flex-1 bg-gray-100 h-1.5 w-24 rounded-full overflow-hidden">
                              <div className="bg-[#564ab1] h-full" style={{width: `${Math.min((p.views/10), 100)}%`}}></div>
                            </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-right font-black text-gray-900 text-sm">
                         ₹{(p.views * 12).toLocaleString()}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// --- MODERN SUB-COMPONENTS ---

const KpiCard = ({ label, value, trend, isPos, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`${color} bg-opacity-10 p-3 rounded-xl text-opacity-100`}>
        <div style={{color: 'inherit'}}>{icon}</div>
      </div>
      <div className={`flex items-center text-xs font-bold ${isPos ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPos ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {trend}
      </div>
    </div>
    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
  </div>
);

const EfficiencyBar = ({ label, val }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
      <span>{label}</span>
      <span>{val}%</span>
    </div>
    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
      <div className="bg-[#564ab1] h-full rounded-full" style={{width: `${val}%`}}></div>
    </div>
  </div>
);

export default AdminDashboard;