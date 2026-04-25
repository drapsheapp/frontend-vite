import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/api";
import { 
  ArrowLeft, Upload, Globe, CheckCircle, 
  AlertCircle, Package, IndianRupee, 
  Eye, Save, Image as ImageIcon, Sparkles 
} from "lucide-react";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("general"); // Tab based editing

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    h1: "",
    description: "",
    base_price: "",
    image_url: "",
    meta_title: "",
    meta_description: "",
    is_active: true,
  });

  /* ================= FETCH INITIAL DATA ================= */
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchProduct(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get("/admin/products");
      const product = res.data.find((p) => p._id === id);
      if (product) {
        setForm({
          name: product.name || "",
          slug: product.slug || "",
          category: product.category || "",
          h1: product.h1 || "",
          description: product.description || "",
          base_price: product.base_price || "",
          image_url: product.image_url || "",
          meta_title: product.seo?.meta_title || "",
          meta_description: product.seo?.meta_description || "",
          is_active: product.is_active,
        });
        setImagePreview(product.image_url);
      }
    } catch (err) {
      console.error("Product load failed", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Categories load failed", err);
    }
  };

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: type === "checkbox" ? checked : value };
      
      // Auto slug generation if name changes
      if (name === "name") {
        newForm.slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
      }
      return newForm;
    });
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setSaving(true);
    try {
      const sig = await API.get("/cloudinary/signature");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.data.api_key);
      formData.append("timestamp", sig.data.timestamp);
      formData.append("signature", sig.data.signature);

      const upload = await fetch(`https://api.cloudinary.com/v1_1/${sig.data.cloud_name}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await upload.json();
      setForm((prev) => ({ ...prev, image_url: data.secure_url }));
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await API.put(`/admin/products/${id}`, {
        ...form,
        base_price: Number(form.base_price),
        seo: { meta_title: form.meta_title, meta_description: form.meta_description },
      });
      navigate("/admin/products");
    } catch (err) {
      alert("Error updating product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP BAR / NAVIGATION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/admin/products")}
              className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Edit Product <Sparkles className="text-purple-500" size={24} />
              </h1>
              <p className="text-gray-500 text-sm font-medium italic">Internal Product ID: {id.slice(-8)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/admin/products")}
              className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdate}
              disabled={saving}
              className="px-8 py-3 bg-[#111827] text-white rounded-2xl text-sm font-black shadow-xl shadow-gray-200 hover:scale-105 transition-all flex items-center gap-2"
            >
              {saving ? "Synchronizing..." : <><Save size={18}/> Update Product</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT: MAIN FORM AREA */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* CONTENT CARD */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-8 border-b border-gray-50 pb-4">
                <Package size={20} className="text-purple-600" />
                <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Essential Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Product Heading (H1 Tag)</label>
                  <input
                    name="h1"
                    value={form.h1}
                    onChange={handleChange}
                    placeholder="E.g. Men's Slim Fit Cotton Shirt"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Internal Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Slug</label>
                  <input
                    name="slug"
                    value={form.slug}
                    readOnly
                    className="w-full bg-purple-50/50 border border-purple-100 text-purple-700 rounded-2xl px-5 py-4 text-sm font-mono font-bold outline-none"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold appearance-none outline-none focus:ring-4 focus:ring-purple-500/10"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.display_name || c.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Sale Price (INR)</label>
                  <div className="relative">
                    <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      name="base_price"
                      value={form.base_price}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-10 pr-5 py-4 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Product Description</label>
                  <textarea
                    name="description"
                    rows="6"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-purple-500/10"
                  />
                </div>
              </div>
            </section>

            {/* SEO ENGINE PREVIEW (ZEPTO STYLE) */}
            <section className="bg-[#111827] p-8 rounded-[2.5rem] text-white shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-blue-400" />
                  <h3 className="font-black uppercase tracking-widest text-[10px]">Google Search Preview</h3>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">SEO OPTIMIZED</div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl">
                  <p className="text-[#1a0dab] text-sm font-sans mb-1 truncate">yourstore.com › products › {form.slug || "url-path"}</p>
                  <h4 className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer mb-2">
                    {form.meta_title || form.name || "Add a SEO Title"}
                  </h4>
                  <p className="text-sm text-[#4d5156] line-clamp-2">
                    {form.meta_description || "Start writing a description to see how this product will be seen by users on Google."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Meta Title</label>
                    <input
                      name="meta_title"
                      value={form.meta_title}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Meta Description</label>
                    <textarea
                      name="meta_description"
                      value={form.meta_description}
                      onChange={handleChange}
                      rows="2"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: SIDEBAR AREA */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* ASSET MANAGEMENT */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon size={18} className="text-purple-600" />
                <h3 className="font-black text-gray-800 uppercase tracking-widest text-[10px]">Product Media</h3>
              </div>

              <div className="relative group overflow-hidden">
                <div className="aspect-square w-full rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center relative transition-all group-hover:border-purple-300">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover rounded-[1.8rem] p-2" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Upload size={32} />
                      <p className="text-[10px] font-black mt-2 uppercase">Update Photo</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
              <p className="text-[9px] text-gray-400 text-center font-bold uppercase mt-4 tracking-tighter">Square images (1080x1080) work best</p>
            </section>

            {/* STATUS CONTROL */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibility</span>
                  <span className={`text-xs font-black ${form.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {form.is_active ? 'PUBLISHED & LIVE' : 'HIDDEN FROM STORE'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="is_active"
                    checked={form.is_active} 
                    onChange={handleChange}
                    className="sr-only peer" 
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl flex gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                  Disabling this product will immediately remove it from the consumer app and website search results.
                </p>
              </div>
            </section>

            {/* QUICK AUDIT */}
            <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100">
               <div className="flex items-center gap-2 mb-2 text-purple-900 font-black text-xs uppercase tracking-tighter">
                  <Sparkles size={16} /> Optimization Tip
               </div>
               <p className="text-[11px] text-purple-700 leading-relaxed font-medium">
                  Products with H1 tags that match Search Queries have a 45% higher conversion rate on Blinkit.
               </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}