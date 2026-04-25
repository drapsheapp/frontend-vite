import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../api/admin.api";
import { 
  ArrowLeft, Plus, Pencil, Trash, Search, 
  MoreVertical, ExternalLink, RefreshCcw, 
  Layers, ChevronRight, Eye, AlertCircle,
  Ruler
} from "lucide-react";

export default function Categories() {
  const navigate = useNavigate();

  // --- States ---
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all"); // ✅ STEP 1: Status Filter State
  const [sortBy, setSortBy] = useState("latest");        // ✅ STEP 6: Sorting State
  const perPage = 10;

  /* ================= FETCH DATA ================= */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.listCategories();
      const data = res.data || [];
      setCategories(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ================= SEARCH, FILTER & SORT ================= */
  useEffect(() => {
    // 1. Search & Status Filter Logic
    let result = categories.filter(c => {
      const matchSearch =
        (c.display_name || c.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (c.slug || "").toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.is_active) ||
        (statusFilter === "inactive" && !c.is_active);

      return matchSearch && matchStatus;
    });

    // 2. Sorting Logic
    const sorted = [...result].sort((a, b) => {
      if (sortBy === "name") return (a.display_name || a.name).localeCompare(b.display_name || b.name);
      if (sortBy === "products") return (b.products_count || 0) - (a.products_count || 0);
      return 0; // Default latest (as per backend order)
    });

    setFiltered(sorted);
    setPage(1);
  }, [search, categories, statusFilter, sortBy]); // ✅ Updated Dependencies

  /* ================= QUICK TOGGLE STATUS ================= */
  const toggleStatus = async (id, currentStatus) => {
    try {
      setCategories(prev => prev.map(c => 
        c._id === id ? { ...c, is_active: !currentStatus } : c
      ));
      await adminAPI.updateCategory(id, { is_active: !currentStatus });
    } catch (err) {
      loadCategories();
      alert("Status update failed");
    }
  };

  /* ================= SMART DELETE ================= */
  const deleteCategory = async (cat) => {
    // ✅ STEP 4: Protection Check
    if (cat.products_count > 0) {
      alert(`Cannot delete "${cat.name}". Please move or delete the ${cat.products_count} products inside it first.`);
      return;
    }

    if (!window.confirm("Are you sure you want to delete this category?")) return;
    
    try {
      await adminAPI.deleteCategory(cat._id);
      setCategories(prev => prev.filter(c => c._id !== cat._id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const visible = filtered.slice(start, start + perPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate("/admin")}>Dashboard</span>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-semibold">Inventory Management</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              Catalog Categories
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full uppercase tracking-wider">
                {categories.length} Total
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Organize your Drapshe catalog with custom-fit logic.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={loadCategories}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all"
            >
              <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => navigate("/admin/categories/new")}
              className="flex items-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
            >
              <Plus size={18} /> Add New Category
            </button>
          </div>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {/* ✅ STEP 1: Status Filter UI */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-purple-500/10"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* ✅ STEP 6: Sorting UI */}
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-purple-500/10"
          >
            <option value="latest">Sort: Latest</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="products">Sort: Most Products</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Category Info</th>
                <th className="py-4 px-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">System Slug</th>
                <th className="py-4 px-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Stats & Type</th>
                <th className="py-4 px-6 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest">Visibility</th>
                <th className="py-4 px-6 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      Syncing catalog...
                    </div>
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <AlertCircle className="mx-auto opacity-20" size={40} />
                    <p className="mt-2 text-gray-500 font-bold">No results found.</p>
                  </td>
                </tr>
              ) : (
                visible.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={cat.image || "https://via.placeholder.com/100"}
                          className="w-12 h-12 rounded-2xl object-cover border border-gray-100 shadow-sm"
                          alt={cat.name}
                        />
                        <div>
                          <div className="font-black text-gray-900 text-sm flex items-center gap-2">
                            {cat.display_name || cat.name}
                            {/* ✅ STEP 3: Custom Fit Badge */}
                            {cat.requires_measurement && (
                              <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <Ruler size={10} /> CUSTOM
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-bold text-gray-400 tracking-tight uppercase">
                            UID: {cat._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                        /{cat.slug}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                          <Layers size={14} className="text-gray-400" /> 
                          {cat.products_count || 0} Products
                        </div>
                        {/* ✅ STEP 2: Category Type Tag */}
                        <div className="text-[10px] text-purple-600 font-black uppercase tracking-tighter">
                           {cat.type || "General"}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => toggleStatus(cat._id, cat.is_active)}
                          className={`relative w-11 h-6 flex items-center rounded-full transition-all shadow-inner ${
                            cat.is_active ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                        >
                          <div className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            cat.is_active ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {/* ✅ STEP 5: Quick View Button */}
                        <button
                          onClick={() => navigate(`/admin/products?category=${cat._id}`)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="View Products"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/categories/edit/${cat._id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION */}
        <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Showing {start + 1} - {Math.min(start + perPage, filtered.length)} of {filtered.length}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-all"
            >
              Prev
            </button>
            
            <div className="flex gap-1 px-2">
               {[...Array(totalPages)].map((_, i) => (
                 <button 
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    page === i + 1 ? "bg-purple-600 text-white shadow-lg" : "text-gray-500 hover:bg-gray-200"
                  }`}
                 >
                   {i + 1}
                 </button>
               ))}
            </div>

            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        <AlertCircle size={14} />
        System Note: Deleting categories with linked products is restricted to prevent data orphans.
      </div>
    </div>
  );
}