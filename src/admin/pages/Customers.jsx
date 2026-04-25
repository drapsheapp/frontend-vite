import { useEffect, useState } from "react";
import { customersAPI } from "@/features/customers/api/customers.api";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Download, 
  Users, 
  Trophy, 
  Ruler, 
  ChevronRight, 
  ExternalLink,
  PhoneCall
} from "lucide-react";

const Customers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadCustomers(page);
  }, [page]);

  const loadCustomers = async (pageNo = 1) => {
    setLoading(true);
    try {
      const res = await customersAPI.getCustomers(pageNo, 25);
      setCustomers(res.data);
    } catch (err) {
      console.error("Customers load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await customersAPI.getCustomers(1, 1000);
      const data = res.data; 

      const csv = [
        ["Name", "Phone", "Email", "Orders", "Measurements"],
        ...data.map(c => [
          c.name || "",
          c.phone || "",
          c.email || "",
          c.orders_count || 0,
          c.has_measurements ? "Yes" : "No"
        ])
      ]
        .map(row => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers_report_${new Date().toLocaleDateString()}.csv`;
      a.click();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const filteredCustomers = (customers || []).filter((c) => {
    const matchSearch =
      c.phone?.includes(search) ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.id?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "loyal" && c.orders_count > 2) ||
      (filter === "new" && c.orders_count <= 2) ||
      (filter === "missing" && !c.has_measurements);

    return matchSearch && matchFilter;
  });

  // Stats calculation
  const total = customers?.length || 0;
  const loyal = (customers || []).filter(c => c.orders_count > 2).length;
  const missing = (customers || []).filter(c => !c.has_measurements).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 space-y-8">
      
      {/* --- TOP HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customers</h1>
          <p className="text-sm font-medium text-gray-500">
            {total} total users registered in your database
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input
              placeholder="Search by name, phone or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl w-full md:w-80 bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl text-sm hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users size={24} /></div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Base</p>
            <p className="text-2xl font-black text-gray-900">{total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Trophy size={24} /></div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Loyal Users</p>
            <p className="text-2xl font-black text-purple-600">{loyal}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Ruler size={24} /></div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Incomplete Profiles</p>
            <p className="text-2xl font-black text-gray-900">{missing}</p>
          </div>
        </div>
      </div>

      {/* --- FILTERS --- */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {["all", "loyal", "new", "missing"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              filter === f
                ? "bg-black text-white shadow-lg shadow-black/20"
                : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300 shadow-sm"
            }`}
          >
            {f === "all" && "All Customers"}
            {f === "loyal" && "💎 Loyal"}
            {f === "new" && "🌱 New Joinees"}
            {f === "missing" && "📏 Missing Data"}
          </button>
        ))}
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-black/[0.02] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Sr.</th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer Profile</th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Orders</th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Measurements</th>
                <th className="text-left px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Tag</th>
                <th className="text-right px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="7" className="p-20 text-center text-gray-400 animate-pulse font-bold">Fetching Customer Records...</td></tr>
              ) : filteredCustomers.map((customer, index) => (
                <tr 
                  key={customer.id} 
                  className="group hover:bg-gray-50/80 transition-all cursor-default"
                >
                  <td className="px-6 py-5 text-xs font-bold text-gray-400">
                    {(page - 1) * 25 + index + 1}
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">
                        {customer.name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-black">{customer.name || "Unknown User"}</p>
                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-tighter">ID: {customer.id?.slice(-8)}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                      <PhoneCall size={14} className="text-gray-300" />
                      {customer.phone || "No Phone"}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className="inline-block px-3 py-1 bg-gray-100 rounded-lg font-bold text-gray-700 text-xs">
                      {customer.orders_count}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    {customer.has_measurements ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Recorded
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-400 font-bold text-xs bg-gray-50 w-fit px-3 py-1 rounded-full border border-gray-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span> Pending
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    {customer.orders_count > 2 ? (
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Loyal</span>
                    ) : (
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">New</span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => navigate(`/admin/customers/${customer.id}`)}
                      className="p-2 hover:bg-black hover:text-white rounded-xl transition-all inline-flex items-center gap-2 text-xs font-bold text-gray-400"
                    >
                      View Profile <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="flex justify-between items-center p-6 bg-gray-50/30 border-t border-gray-100">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-white transition-all shadow-sm"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Page</span>
            <span className="h-8 w-8 flex items-center justify-center bg-black text-white rounded-lg text-xs font-bold">{page}</span>
          </div>
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold hover:bg-white transition-all shadow-sm"
          >
            Next
          </button>
        </div>

        {!loading && filteredCustomers.length === 0 && (
          <div className="p-20 text-center">
            <div className="inline-block p-6 bg-gray-50 rounded-full mb-4 text-gray-300"><Search size={40} /></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No customer matches your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;