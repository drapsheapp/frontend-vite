import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/api";
import { 
  ArrowLeft, Upload, Globe, CheckCircle, 
  Package, IndianRupee, Image as ImageIcon, 
  Sparkles, Save, XCircle, Info 
} from "lucide-react";

export default function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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
    is_active: true
  });

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Category load failed", err);
      }
    };
    fetchCategories();
  }, []);

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const updatedForm = {
        ...prev,
        [name]: type === "checkbox" ? checked : value
      };

      // Real-time Slug Generation like Zepto
      if (name === "name") {
        updatedForm.slug = value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");
      }
      return updatedForm;
    });
  };

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (file) => {
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));

    try {
      const sig = await API.get("/cloudinary/signature");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.data.api_key);
      formData.append("timestamp", sig.data.timestamp);
      formData.append("signature", sig.data.signature);

      const upload = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.data.cloud_name}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await upload.json();
      setForm((prev) => ({ ...prev, image_url: data.secure_url }));
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  /* ================= CREATE PRODUCT ================= */
  const createProduct = async () => {
    if (!form.name || !form.category || !form.base_price) {
      return alert("Please fill all required fields marked with *");
    }

    try {
      setLoading(true);
      await API.post("/admin/products", {
        ...form,
        base_price: Number(form.base_price),
        seo: {
          meta_title: form.meta_title || form.name,
          meta_description: form.meta_description || form.description?.slice(0, 160)
        }
      });
      navigate("/admin/products");
    } catch (err) {
      console.error("Create product failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP ACTION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/admin/products")}
              className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Launch New Product <Sparkles className="text-purple-500" size={20} />
              </h1>
              <p className="text-gray-500 text-xs font-medium">Add a fresh item to your catalog across all regions.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/admin/products")}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              Discard
            </button>
            <button 
              onClick={createProduct}
              disabled={loading}
              className="px-8 py-2.5 bg-[#111827] text-white rounded-xl text-xs font-black shadow-xl shadow-gray-300 hover:scale-105 transition-all flex items-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16}/>}
              Publish Product
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: CORE PRODUCT DETAILS */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* CONTENT CARD */}
            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <Package size={18} className="text-purple-600" />
                <h3 className="font-black text-gray-800 uppercase tracking-widest text-[10px]">Product Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Public Title (H1 Tag)*</label>
                  <input
                    name="h1"
                    value={form.h1}
                    onChange={handleChange}
                    placeholder="E.g. Premium Silk Saree - Midnight Blue"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Internal Name*</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Slug (Auto-generated)</label>
                  <input
                    name="slug"
                    value={form.slug}
                    readOnly
                    className="w-full bg-purple-50/50 border border-purple-100 text-purple-700 rounded-2xl px-5 py-3.5 text-sm font-mono font-bold"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Taxonomy Category*</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none"
                  >
                    <option value="">Select a Category</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.display_name || c.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Listing Price (INR)*</label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      name="base_price"
                      value={form.base_price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-10 pr-5 py-3.5 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 outline-none"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 block">Rich Description</label>
                  <textarea
                    name="description"
                    rows="5"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the product materials, fit, and care instructions..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:bg-white"
                  />
                </div>
              </div>
            </section>

            {/* SEO ENGINE (ZEPTO STYLE) */}
            <section className="bg-[#111827] p-8 rounded-[2rem] text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-blue-400" />
                  <h3 className="font-black uppercase tracking-widest text-[10px]">Google Preview Engine</h3>
                </div>
                <div className="text-[10px] font-bold text-gray-500">REAL-TIME SIMULATION</div>
              </div>

              <div className="bg-white p-5 rounded-xl mb-6">
                <p className="text-[#1a0dab] text-xs mb-1">drapshe.com › catalog › {form.slug || "new-item"}</p>
                <h4 className="text-lg text-[#1a0dab] font-medium truncate mb-1">
                  {form.meta_title || form.name || "Enter Product Meta Title"}
                </h4>
                <p className="text-xs text-[#4d5156] line-clamp-2">
                  {form.meta_description || "Search engine description will appear here after you type."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-500 uppercase mb-2 block">SEO Meta Title</label>
                  <input
                    name="meta_title"
                    value={form.meta_title}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-500 uppercase mb-2 block">SEO Meta Description</label>
                  <textarea
                    name="meta_description"
                    value={form.meta_description}
                    onChange={handleChange}
                    rows="1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: SIDEBAR */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* MEDIA ASSET CARD */}
            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <div className="flex items-center gap-2 mb-6 text-left">
                <ImageIcon size={16} className="text-purple-600" />
                <h3 className="font-black text-gray-800 uppercase tracking-widest text-[10px]">Product Hero Image</h3>
              </div>

              <div className="relative group">
                <div className="aspect-square w-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center relative transition-all group-hover:border-purple-300 overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover p-2 rounded-3xl" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <div className="p-4 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                        <Upload size={24} className="text-purple-600" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-tighter">Click to Upload</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    onChange={(e) => uploadImage(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
            </section>

            {/* STATUS & VISIBILITY */}
            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Status</span>
                  <span className={`text-xs font-black ${form.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {form.is_active ? 'ACTIVE ON STORE' : 'SAVE AS DRAFT'}
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </section>

            {/* QUICK GUIDANCE */}
            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-3">
              <Info size={20} className="text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Best Practice</p>
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium mt-1">
                  Ensure the **H1 Tag** contains keywords like color or material for better in-app search performance.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}