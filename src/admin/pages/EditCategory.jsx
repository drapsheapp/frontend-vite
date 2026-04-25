import React, { useState, useEffect } from "react";
import { adminAPI } from "../api/admin.api";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Upload, 
  Globe, 
  Eye, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- States ---
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    meta_title: "",
    meta_description: "",
    is_active: true,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const loadCategory = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCategory(id);
      const cat = res.data?.data || res.data;

      if (cat) {
        setFormData({
          name: cat.display_name || cat.name || "",
          slug: cat.slug || "",
          description: cat.description || "",
          image: cat.image || "",
          meta_title: cat.seo?.meta_title || "",
          meta_description: cat.seo?.meta_description || "",
          is_active: cat.is_active ?? true,
        });
        setImagePreview(cat.image);
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Failed to fetch category data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadCategory();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    if (name === "name") {
      const generatedSlug = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      // Note: Backend expectation (File or S3 URL) depends on your API logic
      setFormData(prev => ({ ...prev, imageFile: file })); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: "", text: "" });

    try {
      await adminAPI.updateCategory(id, {
        name: formData.name.toLowerCase(),
        display_name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image: formData.image, // Replace with uploaded URL if necessary
        seo: {
          meta_title: formData.meta_title,
          meta_description: formData.meta_description,
        },
        is_active: formData.is_active,
      });

      setStatusMsg({ type: "success", text: "Category synchronized successfully!" });
      setTimeout(() => navigate("/admin/categories"), 1500);
    } catch (err) {
      setStatusMsg({ type: "error", text: "Sync failed. Check API constraints." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-10 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/admin/categories")}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Modify Category</h1>
              <p className="text-gray-500 text-sm font-medium">Drafting updates for: <span className="text-purple-600">{formData.name}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/admin/categories")}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Discard Changes
            </button>
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-2.5 bg-[#111827] text-white rounded-xl text-sm font-bold shadow-xl shadow-gray-200 hover:scale-105 transition-all flex items-center gap-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={18}/>}
              Sync Changes
            </button>
          </div>
        </div>

        {statusMsg.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {statusMsg.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
            {statusMsg.text}
          </div>
        )}

        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: CORE INFO */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <Settings size={18} className="text-purple-600" />
                <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">General Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Display Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Traditional Wear"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">System Slug</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">/</span>
                    <input
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-8 pr-5 py-3.5 text-sm font-mono font-bold text-purple-700 outline-none cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Write a compelling category story..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:bg-white focus:border-purple-500 outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* SEO ENGINE PREVIEW */}
            <section className="bg-[#111827] p-8 rounded-[2rem] text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-blue-400" />
                  <h3 className="font-black uppercase tracking-widest text-xs">Search Engine Optimization</h3>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md font-bold">GOOGLE PREVIEW</span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Meta Title (SEO Title)</label>
                  <input
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                {/* REAL TIME GOOGLE PREVIEW BOX */}
                <div className="bg-white p-5 rounded-xl text-[#1a0dab] font-sans shadow-inner">
                  <p className="text-sm truncate mb-1">drapshe.com › category › {formData.slug}</p>
                  <h4 className="text-xl font-medium mb-1 hover:underline cursor-pointer">
                    {formData.meta_title || formData.name || "Enter SEO Title"}
                  </h4>
                  <p className="text-sm text-[#4d5156] line-clamp-2">
                    {formData.meta_description || "Add a meta description to see how this page will appear in Google search results."}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Meta Description</label>
                  <textarea
                    name="meta_description"
                    rows="3"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: ASSETS & STATUS */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* IMAGE ASSET BOX */}
            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <div className="flex items-center gap-2 mb-6 text-left">
                <ImageIcon size={18} className="text-purple-600" />
                <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Category Asset</h3>
              </div>

              <div className="relative group">
                <div className="aspect-square w-full rounded-[1.5rem] overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center relative transition-all group-hover:border-purple-300">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover p-2 rounded-[1.8rem]" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Upload size={32} />
                      <p className="text-[10px] font-bold mt-2 uppercase tracking-tighter">Click to Upload</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-4 tracking-widest">Format: PNG, JPG (Max 2MB)</p>
            </section>

            {/* STATUS BOX */}
            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-400 uppercase">Visibility Status</span>
                  <span className={`text-sm font-black ${formData.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formData.is_active ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="is_active"
                    checked={formData.is_active} 
                    onChange={handleInputChange}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Draft categories won't be visible to users on the mobile app storefront.</p>
            </section>

            {/* QUICK ACTIONS SECTION */}
            <div className="p-4 bg-purple-50 rounded-2xl flex items-start gap-3">
              <AlertCircle size={20} className="text-purple-600 mt-1" />
              <div>
                <p className="text-xs font-black text-purple-900 uppercase tracking-tight">Audit Trail</p>
                <p className="text-[11px] text-purple-700/80 leading-relaxed font-medium">Last updated by Admin <br/> today at {new Date().toLocaleTimeString()}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;