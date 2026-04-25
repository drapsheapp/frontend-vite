import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/api";
import { 
  ArrowLeft, Plus, Pencil, Trash, Search, 
  Package, TrendingUp, AlertTriangle, Filter,
  ExternalLink, MoreVertical, RefreshCw, Layers
} from "lucide-react";

export default function AdminProducts() {
  const navigate = useNavigate();

  // --- States ---
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  /* ================= FETCH DATA ================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/products");
      setProducts(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error("Products load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= SEARCH & ANALYTICS ================= */
  useEffect(() => {
    const result = products.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setPage(1);
  }, [search, products]);

  /* ================= DELETE ================= */
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product from the inventory?")) return;
    try {
      await API.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const visible = filtered.slice(start, start + perPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              <Package size={14} /> Catalog Management
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Products <span className="text-purple-600 font-normal">({products.length})</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchProducts}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 shadow-sm transition-all"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => navigate("/admin/products/new")}
              className="flex items-center gap-2 bg-[#111827] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-gray-200 transition-all active:scale-95"
            >
              <Plus size={18} /> New Product
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS (Zepto Style) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Live Products</p>
            <p className="text-xl font-black text-gray-800">{products.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Low Stock Items</p>
            <p className="text-xl font-black text-gray-800">04</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Categories</p>
            <p className="text-xl font-black text-gray-800">12</p>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, category or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all shadow-sm shadow-gray-100"
          />
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* 4. DATA TABLE */}
      <div className="max-w-7xl mx-auto bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Price</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-gray-500 tracking-tight">Syncing Inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : visible.map(p => (
                <tr key={p._id} className="hover:bg-gray-50/80 transition-all group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={p.image_url || "https://via.placeholder.com/100"}
                          className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
                          alt="product"
                        />
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-sm">{p.name}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-tight uppercase">
                          SKU: {p.sku || p._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-black">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-700">{p.stock || "45"} units</span>
                      <span className="text-[10px] font-bold text-emerald-500">In Stock</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="text-sm font-black text-gray-900 italic">₹{p.base_price}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. FOOTER / PAGINATION */}
        <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Showing {start + 1} - {Math.min(start + perPage, filtered.length)} <span className="text-gray-200 mx-2">|</span> Total {filtered.length} Items
          </div>
          
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-xs font-black text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                    page === i + 1 ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-xs font-black text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}