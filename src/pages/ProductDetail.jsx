import { findBestProfile } from "@/features/profile/utils/profileMatcher";
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from "@/api/api";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ShoppingCart, Ruler, Scissors, Truck, Clock, CheckCircle2 } from 'lucide-react';
import { profileAPI } from "@/features/profile/api/profile.api";
import { useLocation } from "react-router-dom";
import { useProductCustomization } from "@/context/ProductCustomizationContext";
import { getLastSize } from "@/utils/aiLearning";
import { useMemo } from "react";

const ProductDetail = () => {
  const [sizeMode, setSizeMode] = useState('measurement'); // 'measurement' or 'sample'
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const initRef = useRef(false);
  const measurementInitRef = useRef(false);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    if (initRef.current) return;

    if (location.state?.sizeMode) {
      setSizeMode(location.state.sizeMode);
      window.history.replaceState({}, document.title);
    }

    initRef.current = true;
  }, []);

  // Updated Pickup details state with Time Slot
  const [pickupDetails, setPickupDetails] = useState(() => {
    try {
      const saved = localStorage.getItem("samplePickup");
      return saved
        ? JSON.parse(saved)
        : {
            name: "",
            phone: "",
            address: "",
            pincode: "",
            pickupDate: "",
            timeSlot: "morning",
          };
    } catch {
      return {
        name: "",
        phone: "",
        address: "",
        pincode: "",
        pickupDate: "",
        timeSlot: "morning",
      };
    }
  });

  const {
    measurements, setMeasurements,
    bodyType, setBodyType,
    fittingPreference, setFittingPreference,
    selectedSleeve, setSelectedSleeve,
    selectedNeck, setSelectedNeck,
    selectedBottom, setSelectedBottom,
    padding, setPadding,
    opening, setOpening,
    closure, setClosure,
    pantType, setPantType,
    waistStyle, setWaistStyle,
    pockets, setPockets,
    kameezLength, setKameezLength,
    sideSlit, setSideSlit,
    dupatta, setDupatta,
    notes, setNotes,
    isDraftLoaded,
  } = useProductCustomization();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState('Self');
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [autoSize, setAutoSize] = useState(null);

  // 🔥 LOAD SMARTFIT DATA
  const smartfitData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("smartfitData"));
    } catch {
      return null;
    }
  }, []);

  const recommendedSize = useMemo(() => {

    if (!smartfitData && !autoSize) return null;

    if (autoSize) {
      return {
        size: autoSize.size || "M",
        fit: "Auto",
        confidence: 100,
        bodyShape: autoSize.bodyType || "AI"
      };
    }

    return smartfitData;

  }, [autoSize, smartfitData]);

  useEffect(() => {
    if (!productId) return;
    fetchProduct();
  }, [productId]);

  // 🔥 AUTO SIZE LOAD (RETURN USER)
  useEffect(() => {
    if (!user?.id) return;

    const currentScroll = window.scrollY;

    getLastSize(user.id).then((res) => {
      if (res?.found) {
        setAutoSize(res.data);

        // 🔥 scroll restore
        setTimeout(() => {
          window.scrollTo(0, currentScroll);
        }, 0);
      }
    });
  }, [user]);

  // 🔥 AI SIZE PREDICTION (FINAL ADD)
  useEffect(() => {
    if (!user?.id) return;

    API.get(`/api/ai/predict-size/${user.id}`)
      .then(res => {
        if (res?.data) {
          setAutoSize(res.data);
        }
      })
      .catch(err => {
        console.log("AI prediction failed", err);
      });

  }, [user]);

  useEffect(() => {
    localStorage.setItem("samplePickup", JSON.stringify(pickupDetails));
  }, [pickupDetails]);

  useEffect(() => {
    if (sizeMode === "measurement") {
      measurementInitRef.current = false;
    }
  }, [sizeMode]);

  useEffect(() => {
    if (measurementInitRef.current) return;

    if (!product?.category || !isDraftLoaded || sizeMode !== "measurement") return;

    const isEmpty = !measurements || Object.values(measurements).every(v => !v);

    const hasMeasurements = measurements && Object.keys(measurements).length > 0;
    
    if (!hasMeasurements) {
      loadMeasurementProfiles();
    }  

    measurementInitRef.current = true;
  
}, [product?.category, isDraftLoaded, sizeMode]);

// 🔥 FIXED (PRODUCTION GRADE)
useEffect(() => {
  if (!measurements?.bust || sizeMode !== "scan") return;

  setMeasurements(prev => {
    const newUnderbust = +(prev.bust * 0.86).toFixed(1);
    const newArmhole = +(prev.bust * 0.5).toFixed(1);

    // ❗ infinite loop avoid
    if (
      prev.underbust === newUnderbust &&
      prev.armhole === newArmhole
    ) return prev;

    return {
      ...prev,
      underbust: newUnderbust,
      armhole: newArmhole,
    };
  });
}, [measurements?.bust]);

  const fetchProduct = async () => {
    try {
      const response = await API.get(`/products/${productId}`);
      const prodData = response.data;
      setProduct(prodData);
      if (selectedSleeve === "" && prodData.sleeve_options?.length > 0) setSelectedSleeve(String(prodData.sleeve_options[0].id));
      if (selectedNeck === "" && prodData.neck_options?.length > 0) setSelectedNeck(String(prodData.neck_options[0].id));
      if (selectedBottom === "" && prodData.bottom_options?.length > 0) setSelectedBottom(String(prodData.bottom_options[0].id));
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const loadMeasurementProfiles = async () => {
    try {
      const res = await profileAPI.getMeasurements();
      const profiles = res.data || [];
      setSavedProfiles(profiles);
      if (!profiles.length || !product) return;
      const bestProfile = findBestProfile(product.category, profiles);
      if (bestProfile && isDraftLoaded && (!measurements || Object.keys(measurements).length === 0)) {
        applyMeasurementProfile(bestProfile);
      }
    } catch (e) {
      if (e?.response?.status !== 404) console.error("Profile load failed", e);
    }
  };

  const applyMeasurementProfile = (profile) => {
    if (!profile) return;
    const categoryMeasurements = profile.measurements || {};
    setMeasurements(categoryMeasurements);
    setBodyType(profile.body_type || "regular");
    setFittingPreference(profile.fitting_preference || "regular");
    setProfileName(profile.profile_name || "Self");
  };

  const normalizeMeasurements = (data) => {
    const normalized = {};
    Object.keys(data || {}).forEach((key) => {
      const value = data[key];
      if (value !== "" && value !== null && value !== undefined) normalized[key] = Number(value);
    });
    return normalized;
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    let total = Number(product.base_price || 0);
    const sleeveObj = product.sleeve_options?.find(o => String(o.id) === String(selectedSleeve));
    const neckObj = product.neck_options?.find(o => String(o.id) === String(selectedNeck));
    const bottomObj = product.bottom_options?.find(o => String(o.id) === String(selectedBottom));
    total += Number(sleeveObj?.price_modifier || 0);
    total += Number(neckObj?.price_modifier || 0);
    total += Number(bottomObj?.price_modifier || 0);
    return total;
  };

  const getRequiredMeasurements = () => {
    if (!product || sizeMode === 'sample') return [];
    let fields = [];
    const cat = product.category.toLowerCase().replace(/_/g, "-");
    if (cat !== 'pant') fields.push('bust', 'shoulder', 'length_top', 'waist_top');
    if (['pant', 'salwar-kameez', 'kurta-set'].includes(cat)) {
      fields.push('length_bottom', 'hip', 'thigh', 'knee', 'waist_bottom');
    }
    return fields;
  };

  const handleAddToCart = async () => {
    if (!product) { toast.error("Product not ready"); return; }
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate("/login", { 
        state: { 
          from: location.pathname,
           productId: productId,
           sizeMode: sizeMode
        } 
      });
      return;
    }

    if (sizeMode === 'measurement') {
      const requiredFields = getRequiredMeasurements();
      const missingFields = requiredFields.filter(f => !measurements[f]);
      if (missingFields.length > 0) {
        toast.error('Please fill all required measurements');
        return;
      }
    }

    if (sizeMode === 'sample') {
      if (!pickupDetails.name.trim()) { toast.error("Please enter contact name"); return; }
      if (!/^[6-9]\d{9}$/.test(pickupDetails.phone)) { toast.error("Enter valid 10-digit mobile number"); return; }
      if (!pickupDetails.address.trim()) { toast.error("Please enter full pickup address"); return; }
      if (!/^\d{6}$/.test(pickupDetails.pincode)) { toast.error("Enter valid 6-digit pincode"); return; }
      if (!pickupDetails.pickupDate) { toast.error("Please select a pickup date"); return; }
    }

    try {
      const configuration = {
        size_mode: sizeMode,
        product_name: product.name,
        category: product.category,

        recommended_size: (autoSize || smartfitData) ? recommendedSize?.size : null,
        recommended_fit: (autoSize || smartfitData) ? recommendedSize?.fit : null,

        smartfit_size: autoSize || smartfitData || null,

        image_url: product.image_url,
        measurements: sizeMode === 'sample' ? {} : normalizeMeasurements(measurements),
        sample_pickup: sizeMode === 'sample'
          ? {
             name: pickupDetails.name,
             phone: pickupDetails.phone,
             address: pickupDetails.address,
             pincode: pickupDetails.pincode,
             pickup_date: pickupDetails.pickupDate,
             time_slot: pickupDetails.timeSlot,
            }
          : null,
        profile_name: sizeMode === 'sample' ? "Sample Provided" : profileName,

        // ✅ FINAL FIX
        body_type: autoSize?.bodyType || bodyType,

        fitting_preference: fittingPreference,
        special_notes: notes || null,
      };

      if (isBlouse || isKurtaSet) {
        configuration.neck_type = selectedNeck || null;
        configuration.sleeve_type = selectedSleeve || null;
      }
      if (isBlouse) {
        configuration.opening = opening; configuration.closure = closure; configuration.padding = padding;
      }
      if (isKurtaSet) {
        configuration.kameezLength = kameezLength; configuration.sideSlit = sideSlit; configuration.dupatta = dupatta;
      }
      if (isPant || isKurtaSet) {
        configuration.bottom_type = pantType; configuration.waistStyle = waistStyle; configuration.pockets = pockets;
      }

      let finalMeasurementId = null;

      // 🔥 STEP 1: measurement_id generate (MUST BEFORE PAYLOAD)
      if (sizeMode === 'measurement') {
        try {

          const res = await API.post("/user/measurement-record", {
            measurements: normalizeMeasurements(measurements),

            body_type: bodyType,
            fitting_preference: fittingPreference,

            source: "manual",

            measurement_type: isBlouse ? "top" : isPant ? "bottom" : "full",
            category: product.category
          });

          finalMeasurementId = res.data.measurement_id;

        } catch (e) {
          console.error("❌ Measurement save failed FULL:", e?.response?.data || e);
          return; // 🚨 STOP ORDER
        }
      }

      const payload = {
        product_id: String(product._id),
        quantity: 1,
        locked_price: calculateTotalPrice(),

        measurement_id: finalMeasurementId,

        // ✅ ADD THIS
        size_mode: sizeMode,

        // ✅ ADD THIS
        sample_pickup: sizeMode === "sample" ? {
          name: pickupDetails.name,
          phone: pickupDetails.phone.replace(/\D/g, ''),
          address: pickupDetails.address,
          pincode: pickupDetails.pincode.replace(/\D/g, ''),
          pickup_date: pickupDetails.pickupDate,
          time_slot: pickupDetails.timeSlot
        } : null,

        configuration
      };

      await addToCart(payload);
      toast.success("Added to cart successfully!");
      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add to cart");
    }
  };

  if (!isDraftLoaded || loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-plum"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const isBlouse = product.category.toLowerCase().includes('blouse');
  const isPant = product.category.toLowerCase().includes('pant');
  const isKurtaSet = ['salwar-kameez', 'kurta-set', 'kurta'].some(c => product.category.toLowerCase().includes(c));

  const CustomOptionGroup = ({ title, options, current, onChange }) => {
    const groupName = title.replace(/\s+/g, "-").toLowerCase();

    return (
      <div
        className="mb-6"
      >
        <Label className="text-sm font-bold text-royal-plum mb-3 block">
          {title}
        </Label>

        <RadioGroup
          value={String(current || "")}
          onValueChange={(val) => {
            const currentScroll = window.scrollY; // 🔥 capture BEFORE change

            onChange(String(val));

            setTimeout(() => {
              window.scrollTo(0, currentScroll);
            }, 0);
          }}
          className="grid grid-cols-2 md:grid-cols-3 gap-2"
        >
          {options.map((opt) => {
            const value = String(opt.id ?? opt.name ?? "");
            const uniqueId = `${groupName}-${value}`;

            return (
              <div key={uniqueId}>
                <RadioGroupItem
                  value={value}
                  id={uniqueId}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={uniqueId}
                  className="flex flex-col items-center p-3 border rounded-md cursor-pointer transition-all duration-200 
                  peer-data-[state=checked]:border-royal-plum 
                  peer-data-[state=checked]:bg-royal-plum/10 
                  peer-data-[state=checked]:text-royal-plum 
                  peer-data-[state=checked]:ring-1 
                  peer-data-[state=checked]:ring-royal-plum 
                  text-center text-xs hover:bg-gray-50 font-medium"
                >
                  {opt.label || opt.name || opt.id}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-raw-silk py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="lg:sticky lg:top-24 self-start">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white shadow-card border border-silk-border">
              <img src={product.image_url || "/placeholder-product.jpg"} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">{product.category.replace('_', ' ')}</p>
              <h1 className="text-4xl font-display font-bold text-royal-plum mb-4">{product.name}</h1>
              <div className="text-3xl font-semibold text-royal-plum">₹{calculateTotalPrice().toLocaleString('en-IN')}</div>
              
              <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-6 w-full">

                {/* 🤖 Scan AI */}
                <button
                  onClick={() => navigate("/smartfit")}
                  className="flex-1 min-w-[30%] px-2 py-2 text-[11px] sm:text-sm rounded-lg font-medium bg-white text-black border border-gray-300 hover:bg-gray-100"
                >
                  🤖 Scan AI
                </button>

                {/* 📏 Enter Measurement */}
                <button
                  onClick={() => {const y = window.scrollY; setSizeMode("measurement"); setTimeout(() => {window.scrollTo(0, y); }, 0); }}
                  className={`flex-1 min-w-[30%] px-2 py-2 text-[11px] sm:text-sm rounded-lg font-medium transition border ${
                    sizeMode === "measurement"
                      ? "bg-royal-plum text-white border-royal-plum"
                      : "bg-white text-black border-gray-300 hover:bg-gray-100"
                  }`}  
                >
                  Enter Measurement
                </button>

                {/* 📦 Send Sample */}
                <button
                  onClick={() => {const y = window.scrollY; setSizeMode("sample"); setTimeout(() => {window.scrollTo(0, y); }, 0); }}
                  className={`flex-1 min-w-[30%] px-2 py-2 text-[11px] sm:text-sm rounded-lg font-medium transition border ${
                    sizeMode === "sample"
                      ? "bg-royal-plum text-white border-royal-plum"
                      : "bg-white text-black border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Send Sample
                </button>

              </div>

              <p className="mt-3 text-[13px] text-gray-600 italic font-medium bg-white p-3 rounded-lg border border-gray-200 shadow-sm leading-relaxed">
                {sizeMode === 'sample' 
                  ? "Note: Our executive will pick up your sample garment for the perfect measurement."
                  : "Kindly provide your best-fitting measurements to help us deliver the perfect comfort."}
              </p>
            </div>

            {(isBlouse || isKurtaSet) && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-silk-border">
                <h3 className="text-lg font-bold text-royal-plum mb-4 flex items-center gap-2"><Scissors size={18}/> 🧵 Top Customization</h3>
                <CustomOptionGroup title="Front Neck Style" current={selectedNeck} onChange={setSelectedNeck} options={product.neck_options || []} />
                <CustomOptionGroup title="Sleeve Style" current={selectedSleeve} onChange={setSelectedSleeve} options={product.sleeve_options || []} />
                {isBlouse && (
                  <>
                    <CustomOptionGroup title="Opening Side" current={opening} onChange={setOpening} options={[{id:'front', label:'Front Open'}, {id:'back', label:'Back Open'}, {id:'side', label:'Side Open'}]} />
                    <CustomOptionGroup title="Closed By" current={closure} onChange={setClosure} options={[{id:'hook', label:'Hook'}, {id:'zipper', label:'Concealed Zipper'}, {id:'button', label:'Button'}]} />
                    <CustomOptionGroup title="Padding" current={padding} onChange={setPadding} options={[{id:'with_padd', label:'With Padding'}, {id:'no_padd', label:'No Padding'}]} />
                  </>
                )}
                {isKurtaSet && (
                  <>
                    <CustomOptionGroup title="Kameez Length" current={kameezLength} onChange={setKameezLength} options={[{id:'knee', label:'Knee Length'}, {id:'calf', label:'Calf Length'}, {id:'ankle', label:'Ankle Length'}, {id:'floor', label:'Anarkali/Floor'}]} />
                    <CustomOptionGroup title="Side Slit" current={sideSlit} onChange={setSideSlit} options={[{id:'normal', label:'Normal Slit'}, {id:'high', label:'High Slit'}, {id:'front', label:'Front Slit'}, {id:'no_slit', label:'No Slit'}]} />
                  </>
                )}
              </div>
            )}

            {(isPant || isKurtaSet) && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-silk-border">
                <h3 className="text-lg font-bold text-royal-plum mb-4 flex items-center gap-2"><Scissors size={18}/> 👖 Bottom Customization</h3>
                <CustomOptionGroup title="Bottom Type" current={pantType} onChange={setPantType} options={[{id:'straight', label:'Straight Pant'}, {id:'cigarette', label:'Cigarette Pant'}, {id:'palazzo', label:'Palazzo'}, {id:'churidar', label:'Churidar'}, {id:'sharara', label:'Sharara'}, {id:'tulip', label:'Tulip Pant'}]} />
                <CustomOptionGroup title="Waist Style" current={waistStyle} onChange={setWaistStyle} options={[{id:'full_elastic', label:'Full Elastic'}, {id:'back_elastic', label:'Back Elastic + Front Belt'}, {id:'nada', label:'Drawstring (Nada)'}]} />
                <CustomOptionGroup title="Pockets" current={pockets} onChange={setPockets} options={[{id:'none', label:'No Pocket'}, {id:'one_side', label:'One Side Pocket'}, {id:'both_side', label:'Both Side Pockets'}]} />
                {isKurtaSet && <CustomOptionGroup title="Dupatta Style" current={dupatta} onChange={setDupatta} options={[{id:'none', label:'No Dupatta'}, {id:'plain', label:'Plain Dupatta'}, {id:'lace', label:'Lace Border'}, {id:'heavy', label:'Heavy Work'}]} />}
              </div>
            )}

            {(autoSize || smartfitData) && (
              <div style={{
                marginTop: 16,
                padding: 14,
                background: "#dcfce7",
                borderRadius: 10
              }}>
                <p style={{ fontSize: 13, color: "#166534", marginBottom: 6 }}>
                  {autoSize?.source === "ai" ? "🤖 AI Recommended Size" : autoSize? "⚡ Auto Size (Last Order)": "⚡ SmartFit Applied"} – Size: {recommendedSize?.size}
                </p>

                <p style={{ fontSize: 11, color: "#166534" }}>
                  Fit: {recommendedSize?.fit} • Confidence: {autoSize?.confidence || recommendedSize?.confidence || 88}%
                </p>

                {smartfitData && !autoSize && (
                  <button
                    onClick={() => {
                      localStorage.removeItem("smartfitData");
                      window.location.reload();
                    }}
                    style={{
                      fontSize: 12,
                      padding: "5px 10px",
                      background: "#fff",
                      border: "1px solid #166534",
                      borderRadius: 6,
                      marginTop: 6
                    }}
                  >
                    Change Person
                  </button>
                )}
              </div>
            )}

            {sizeMode === 'measurement' && (
              <div className="border-t border-silk-border pt-6 bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <Ruler className="h-5 w-5 text-zari-gold" />
                  <h3 className="text-lg font-semibold text-royal-plum">Enter Measurements (Inches)</h3>
                </div>

                {false && recommendedSize && (
                  <div style={{
                    marginTop: 20,
                    marginBottom: 10,
                    padding: 14,
                    background: "#f3e8ff",
                    borderRadius: 12
                  }}>
                    <p style={{ fontWeight: "bold", color: "#6b21a8" }}>
                      Recommended Size: {recommendedSize.size}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b21a8" }}>
                      Fit: {recommendedSize.fit}
                    </p>
                    <p style={{ fontSize: 12, color: "#6b21a8" }}>
                      Confidence: {recommendedSize.confidence || "Safe Mode"}%
                    </p>

                    <p style={{ fontSize: 12, color: "#6b21a8" }}>
                      Body Shape: {recommendedSize.bodyShape || "Standard"}
                    </p>
                  </div>
                )}

                <div className="space-y-8">
                  {(isBlouse || isKurtaSet) && (
                    <div className="bg-blue-50/50 p-4 rounded-lg">
                      <p className="text-sm font-bold text-blue-800 mb-3 underline">Top Measurements</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['bust', 'underbust', 'shoulder', 'armhole', 'waist_top', 'length_top'].map(field => (
                          <div key={field}>
                            <Label className="text-[10px] uppercase font-bold text-gray-500">{field === "armhole" ? "Armhole (Round)" : field.replace('_', ' ')} *</Label>
                            <Input type="number" step="0.5" value={measurements[field] || ''} onChange={(e) => setMeasurements({ ...measurements, [field]: e.target.value === "" ? "" : parseFloat(e.target.value) })} placeholder="0.0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(isPant || isKurtaSet) && (
                    <div className="bg-orange-50/50 p-4 rounded-lg">
                      <p className="text-sm font-bold text-orange-800 mb-3 underline">Bottom Measurements</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['waist_bottom', 'hip', 'thigh', 'knee', 'calf', 'ankle', 'crotch_rise', 'length_bottom'].map(field => (
                          <div key={field}>
                            <Label className="text-[10px] uppercase font-bold text-gray-500">{field === "armhole" ? "Armhole (Round)" : field.replace('_', ' ')} *</Label>
                            <Input type="number" step="0.5" value={measurements[field] || ''} onChange={(e) => setMeasurements({ ...measurements, [field]: e.target.value === "" ? "" : parseFloat(e.target.value) })} placeholder="0.0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-silk-border">
                    <div>
                      <Label className="font-bold text-royal-plum">Body Type</Label>
                      <RadioGroup value={bodyType} onValueChange={setBodyType} className="flex gap-2 mt-2">
                        {['slim', 'regular', 'plus'].map(t => (
                          <div key={t}>
                            <RadioGroupItem value={t} id={t} className="peer sr-only" />
                            <Label htmlFor={t} className="text-xs capitalize px-3 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-royal-plum peer-data-[state=checked]:text-white transition-colors">{t}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="font-bold text-royal-plum">Fitting Preference</Label>
                      <RadioGroup value={fittingPreference} onValueChange={setFittingPreference} className="flex gap-2 mt-2">
                        {['tight', 'regular', 'loose'].map(f => (
                          <div key={f}>
                            <RadioGroupItem value={f} id={`f-${f}`} className="peer sr-only" />
                            <Label htmlFor={`f-${f}`} className="text-xs capitalize px-3 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-royal-plum peer-data-[state=checked]:text-white transition-colors">{f}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sizeMode === 'sample' && (
              <div className="border-t border-silk-border pt-6 bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-royal-plum/20">
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-6 text-[13px] text-green-800 flex items-center gap-2">
                  <div className="bg-green-500 text-white rounded-full p-1"><CheckCircle2 size={14}/></div>
                  <span>🚚 <strong>Free pickup available.</strong> Your sample will be returned safely after stitching.</span>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                  <Truck className="h-5 w-5 text-royal-plum" />
                  <h3 className="text-lg font-semibold text-royal-plum">Schedule Sample Pickup</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Contact Name *</Label>
                    <Input 
                      placeholder="Enter full name" 
                      value={pickupDetails.name}
                      onChange={(e) => setPickupDetails({...pickupDetails, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Phone Number *</Label>
                    <Input 
                      placeholder="10-digit mobile" 
                      maxLength={10}
                      value={pickupDetails.phone}
                      onChange={(e) => setPickupDetails({...pickupDetails, phone: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Pickup Address *</Label>
                    <Textarea 
                      placeholder="House No, Street, Landmark..." 
                      rows={2}
                      value={pickupDetails.address}
                      onChange={(e) => setPickupDetails({...pickupDetails, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Pincode *</Label>
                    <Input 
                      placeholder="6-digit pincode" 
                      maxLength={6}
                      value={pickupDetails.pincode}
                      onChange={(e) => setPickupDetails({...pickupDetails, pincode: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Pickup Date *</Label>
                    <Input 
                      type="date" 
                      className="cursor-pointer"
                      min={new Date().toISOString().split('T')[0]} 
                      value={pickupDetails.pickupDate}
                      onChange={(e) => setPickupDetails({...pickupDetails, pickupDate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">Preferred Time Slot *</Label>
                    <div className="relative">
                       <select
                        className="w-full h-10 px-3 py-2 text-sm bg-white border rounded-md border-input ring-offset-background focus:outline-none focus:ring-2 focus:ring-royal-plum appearance-none cursor-pointer"
                        value={pickupDetails.timeSlot}
                        onChange={(e) => setPickupDetails({...pickupDetails, timeSlot: e.target.value})}
                      >
                        <option value="morning">Morning (10 AM - 1 PM)</option>
                        <option value="afternoon">Afternoon (1 PM - 5 PM)</option>
                        <option value="evening">Evening (5 PM - 8 PM)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <Clock size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes" className="font-bold text-royal-plum">Special Instructions</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="E.g., Deep back neck, extra margin, etc..." rows={3} className="bg-white" />
              </div>

              <Button onClick={handleAddToCart} className="w-full bg-royal-plum hover:bg-royal-plum/90 text-white py-8 text-xl font-bold shadow-lg transition-transform active:scale-[0.98]">
                <ShoppingCart className="mr-2" /> 
                {sizeMode === 'sample' ? 'Schedule Pickup & Order' : 'Add Custom Order'} - ₹{calculateTotalPrice().toLocaleString('en-IN')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;