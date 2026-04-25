import { useEffect, useState } from "react";
import { adminAPI } from "../api/admin.api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
  ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_customers: 0,
    total_products: 0,
    aov: 0, // Average Order Value
    retention_rate: 0,
    delivery_efficiency: "94%" // Mock for Zepto-style
  });

  const [categorySales, setCategorySales] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data } = await adminAPI.getAnalytics();

      setStats({
        total_revenue: data?.total_sales || 0,
        total_orders: data?.orders || 0,
        total_customers: data?.customers || 0,
        total_products: data?.products || 0,
        aov: data?.orders > 0 ? (data?.total_sales / data?.orders).toFixed(0) : 0,
        retention_rate: data?.retention_rate || "24%",
        delivery_efficiency: "92.4%"
      });

      // Format Category Sales
      setCategorySales(Object.entries(data?.sales_by_category || {}).map(([category, sales]) => ({ category, sales })));

      // Format Order Status
      setStatusData(Object.entries(data?.order_status || {}).map(([status, value]) => ({ status, value })));

      // Mock Trend Data for Zepto-style Line Chart
      setRevenueTrend([
        { day: 'Mon', revenue: 4500 }, { day: 'Tue', revenue: 5200 },
        { day: 'Wed', revenue: 4800 }, { day: 'Thu', revenue: 6100 },
        { day: 'Fri', revenue: 5900 }, { day: 'Sat', revenue: 8500 },
        { day: 'Sun', revenue: 9200 },
      ]);

    } catch (e) {
      console.error("Analytics load error", e);
    }
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Zap className="text-yellow-500 fill-yellow-500" size={28} />
            Drapshe Command Center
          </h1>
          <p className="text-gray-500 text-sm">Real-time business health & performance</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Last 7 Days</button>
          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">Download Report</button>
        </div>
      </div>

      {/* ===== ADVANCED KPI CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Net Revenue" 
          value={`₹${stats.total_revenue.toLocaleString()}`} 
          trend="+12.5%" 
          isPositive={true} 
          icon={<IndianRupee className="text-blue-600" />} 
          bgColor="bg-blue-50"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.total_orders} 
          trend="+8.2%" 
          isPositive={true} 
          icon={<ShoppingBag className="text-emerald-600" />} 
          bgColor="bg-emerald-50"
        />
        <StatCard 
          title="Avg. Order Value (AOV)" 
          value={`₹${stats.aov}`} 
          trend="-2.1%" 
          isPositive={false} 
          icon={<TrendingUp className="text-orange-600" />} 
          bgColor="bg-orange-50"
        />
        <StatCard 
          title="Retention Rate" 
          value={stats.retention_rate} 
          trend="+4.3%" 
          isPositive={true} 
          icon={<Users className="text-purple-600" />} 
          bgColor="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ===== REVENUE TREND LINE CHART (MAIN) ===== */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-800 text-lg">Growth Trajectory</h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">LIVE UPDATES</span>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ===== PERFORMANCE & EFFICIENCY ===== */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            Operational Health
          </h2>
          <div className="space-y-6">
            <EfficiencyProgress label="Delivery Success" value={98} color="bg-emerald-500" />
            <EfficiencyProgress label="On-Time Pickups" value={92} color="bg-blue-500" />
            <EfficiencyProgress label="Customer Satisfaction" value={88} color="bg-yellow-500" />
            <EfficiencyProgress label="Return Rate" value={12} color="bg-red-500" />
          </div>

          <div className="mt-10 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Top Selling Category</p>
             <p className="text-lg font-black text-gray-800">
               {categorySales[0]?.category || "Blouse"} 
               <span className="ml-2 text-sm font-normal text-emerald-600">🔥 Trend High</span>
             </p>
          </div>
        </div>

        {/* ===== SALES BY CATEGORY ===== */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-6">Inventory Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categorySales} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="sales" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ===== ORDER STATUS PIE CHART ===== */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-6">Order Lifecycle</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="status"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

// Reusable Advance Components
const StatCard = ({ title, value, trend, isPositive, icon, bgColor }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl ${bgColor}`}>{icon}</div>
      <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
    <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
  </div>
);

const EfficiencyProgress = ({ label, value, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{value}%</span>
    </div>
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div className={`${color} h-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default AdminAnalytics;