import React, { useRef, useEffect, useState } from "react";
import { getCorrection, getLastSize } from "@/utils/aiLearning";

import { useAuth } from "@/context/AuthContext";

// Globals from MediaPipe scripts in index.html
const POSE_CONNECTIONS = window.POSE_CONNECTIONS;
const drawConnectors = window.drawConnectors;
const drawLandmarks = window.drawLandmarks;

export default function SmartFit() {

  const { user } = useAuth();

  const [feedbackGiven, setFeedbackGiven] = useState(false);

  // Refs for persistent instances
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const stableRef = useRef(0);
  const smoothRef = useRef(null);
  const autoScanRef = useRef(false); 

  // States
  const [landmarks, setLandmarks] = useState(null);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState("");
  const [bodyType, setBodyType] = useState("regular"); // 🔥 New: slim, regular, curvy
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [lastShoulder, setLastShoulder] = useState(null);
  const [frames, setFrames] = useState([]);
  const [stableFrames, setStableFrames] = useState(0);
  const [autoScanning, setAutoScanning] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [distanceStatus, setDistanceStatus] = useState("perfect");
  const [facingMode, setFacingMode] = useState("environment");
  
  // 🔥 PHASE 2 & 3 NEW STATES
  const [isA4Detected, setIsA4Detected] = useState(false);
  const [fitPreference, setFitPreference] = useState(0); 
  const [learningAdjust, setLearningAdjust] = useState(0);
  const [showInputPopup, setShowInputPopup] = useState(true); // Popup State
  const [scanMode, setScanMode] = useState("front");
  const [frontData, setFrontData] = useState(null);
  const [estimatedWeight, setEstimatedWeight] = useState(null);
  // 🔥 RETURN USER SYSTEM
  const [lastSize, setLastSize] = useState(null);

  // --- LOGIC FUNCTIONS ---
  const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const scrollYRef = useRef(0);

  const handleFeedback = async (type) => {
    if (feedbackGiven) return;
    setFeedbackGiven(true);

    scrollYRef.current = window.scrollY;

    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user?._id,
          order_id: null,
          fit_feedback: type,
          area: "waist",
          correction_value:
            type === "tight" ? -2 :
            type === "loose" ? +2 : 0
        })
      });
    } catch (err) {
      console.error("Feedback failed", err);
    }

    setTimeout(() => {
      window.scrollTo(0, scrollYRef.current);
    }, 0);
  };

  // 🔥 SIDE POSE DETECTION
  const isSidePose = (pts) => {
    if (!pts) return false;
    const shoulderWidth = Math.abs(pts[11].x - pts[12].x);
    return shoulderWidth < 0.08 && shoulderWidth > 0.015;
  };

  // 🔥 DEPTH MEASURE
  const getBodyDepth = (pts, canvas) => {
    const leftHip = pts[23];
    const rightHip = pts[24];

    const x1 = leftHip.x * canvas.width;
    const x2 = rightHip.x * canvas.width;

    return Math.abs(x1 - x2);
  };

  const handleStartScan = () => {
    if (!height && !isA4Detected) {
      setStatus("⚠️ Please enter height");
      alert("Please enter height");
      return;
    }

    setShowInputPopup(false);
  };

  const skipBodyType = () => {
    setBodyType("regular");
    handleStartScan();
  };

  const checkA4Presence = (pts) => {
    if (!pts) return false;
    const leftHand = pts[15];
    const rightHand = pts[16];
    if (leftHand.visibility > 0.6 && rightHand.visibility > 0.6) {
      const handDist = distance(leftHand, rightHand);
      return handDist > 0.08 && handDist < 0.25; 
    }
    return false;
  };

  const applyCorrections = (data) => {
    let { shoulder, bust, waist_top, hip, armhole, length_top, thigh } = data;

    shoulder += fitPreference;
    bust += fitPreference;
    waist_top += fitPreference + learningAdjust;
    hip += fitPreference;
    
    // ✅ FIXED THIGH
    thigh = (thigh || waist_top * 0.6) + fitPreference;

    shoulder = Math.max(30, Math.min(shoulder, 55));
    bust = Math.max(70, Math.min(bust, 130));
    waist_top = Math.max(55, Math.min(waist_top, 120));
    if (bust < shoulder * 2.1) bust = shoulder * 2.2;
    if (waist_top > bust) waist_top = bust * 0.82;
    if (hip < waist_top) hip = waist_top * 1.05;
    return {
      ...data,
      shoulder: Math.round(shoulder),
      bust: Math.round(bust),
      waist_top: Math.round(waist_top),
      hip: Math.round(hip),
      thigh: Math.round(thigh),

      // 🔥 ADD THIS
      armhole: Math.round(armhole || bust * 0.5),
      length_top: Math.round(length_top || (height || 170) * 0.15),
    };
  };

  // 🔥 AUTO BODY TYPE AI
  const detectBodyType = (shoulder, waist, depth) => {
    const ratio = shoulder / waist;
    const depthFactor = depth / waist;

    let type = "regular";

    if (ratio > 1.45) type = "slim";
    else if (ratio < 1.2) type = "curvy";

    // Belly override
    if (depthFactor > 0.75) type = "curvy";

    return type;
  };

  // 🔥 HYBRID AI WEIGHT
  const estimateWeight = (shoulder, waist, height) => {
    const base = (waist * 0.7 + shoulder * 0.3);
    const heightFactor = height / 170;
    return Math.round(base * heightFactor * 0.9);
  };

  // 🔥 UPDATED: DEPTH CALCULATION WITH BODY TYPE MULTIPLIER
  const estimateDepth = (width, shoulder, waist) => {
    let base = 0.7;
    const safeHeight = height || 170;
    const heightM = safeHeight / 100;
    let effectiveWeight = weight;

    if (!weight || weight === 0) {
      effectiveWeight = estimateWeight(shoulder, waist, height);
    }

    const bmi = effectiveWeight / (heightM * heightM);
    const bodyFactor = shoulder / waist;

    if (bmi < 18.5) base = 0.6;
    else if (bmi < 23) base = 0.7;
    else if (bmi < 27) base = 0.78;
    else base = 0.85;

    if (bodyFactor > 1.5) base += 0.05;
    if (bodyFactor < 1.2) base -= 0.05;

    // 🔥 Body Type Calibration
    if (bodyType === "slim") base -= 0.04;
    if (bodyType === "curvy") base += 0.07;

    return width * base;
  };

  const calculateEllipse = (width, depth) => {
    const a = width / 2;
    const b = depth / 2;
    return Math.PI * Math.sqrt(2 * (a * a + b * b));
  };

  const processFinalMeasurement = async (fullData) => {
    try {
      await fetch("/api/ai/save-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData)
      });

      const calibratedRes = await fetch("/api/ai/calibrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?._id,
          raw_measurements: fullData,
          height: fullData.height,
          weight: fullData.weight,
          device_type: /iPhone/i.test(navigator.userAgent) ? "iphone" : "android"
        })
      });

      const calibrated = await calibratedRes.json();

      const saveRes = await fetch("/api/user/measurement-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          measurements: calibrated.measurements,
          body_type: calibrated.body_type || "regular",
          fitting_preference: "regular",
          source: "ai",
          measurement_type: "top",
          category: "blouse",

          // ✅ सही जगह
          confidence_score: calibrated.confidence_score || 85
        })
      });

      const savedData = await saveRes.json();

      if (savedData?.measurement_id || savedData?.id) {
        localStorage.setItem(
          "measurement_id",
          savedData.measurement_id || savedData.id
        );
      }

      localStorage.setItem("smartfitData", JSON.stringify(calibrated));

      setResult(calibrated);
      setFeedbackGiven(false);
      setScanMode("done");
      setStatus("🎉 Scan Completed Successfully!");

    } catch (err) {
      console.error("AI pipeline error", err);
    }
  };

  const calculate = async () => {
    if (result !== null) return;

    if (!landmarks) return;

    // 🔥 VISIBILITY SCORE (NEW)
    const requiredPoints = [11, 12, 23, 24, 27, 28];
    const visiblePoints = requiredPoints.filter(
      i => landmarks[i] && landmarks[i].visibility > 0.7
    ).length;

    const visibilityScore = visiblePoints / requiredPoints.length;

    if (visibilityScore < 0.6) {
      setStatus("⚠️ Body not fully visible");
      return;
    }

    // 🔥 ADVANCED CONFIDENCE (UPDATED)
    let confidenceScore = 0;

    // Stability (0–1 → 40)
    confidenceScore += Math.min(stableFrames / 15, 1) * 40;

    // Alignment (0 or 1 → 30)
    confidenceScore += aligned ? 30 : 0;

    // Distance (0 or 1 → 20)
    confidenceScore += distanceStatus === "perfect" ? 20 : 0;

    // Visibility (0–1 → 10)
    confidenceScore += visibilityScore * 10;

    if (confidenceScore < 60) {
      setStatus("❌ Low confidence. Hold still.");
      return;
    }

    const leftS = landmarks[11];
    const rightS = landmarks[12];
    const tiltAngle = Math.atan2(rightS.y - leftS.y, rightS.x - leftS.x);
    if (Math.abs(tiltAngle) > 0.1) {
      setStatus("⚠️ Keep shoulders straight");
      return;
    }

    const required = [11, 12, 23, 24, 27, 28];
    if (!required.every(i => landmarks[i]?.visibility > 0.75)) return setStatus("⚠️ Body not clear");

    setStatus("🔍 Analyzing body measurements...");
    setLoading(true);

    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    let ratio;
    const isA4 = checkA4Presence(landmarks);
    if (isA4) {
      const leftHand = landmarks[15];
      const rightHand = landmarks[16];
      const handDistPx = distance(
        { x: leftHand.x * canvas.width, y: leftHand.y * canvas.height },
        { x: rightHand.x * canvas.width, y: rightHand.y * canvas.height }
      );
      ratio = 21.0 / handDistPx; 
      console.log("Using A4 Scaling");
    } else {
      const ankleY = (landmarks[27].y + landmarks[28].y) / 2;
      const headToAnklePx = Math.abs(ankleY - landmarks[0].y) / 0.93;
      ratio = height / (headToAnklePx * canvas.height);
      console.log("Using Height Scaling");
    }

    const p11 = { x: landmarks[11].x * canvas.width, y: landmarks[11].y * canvas.height };
    const p12 = { x: landmarks[12].x * canvas.width, y: landmarks[12].y * canvas.height };
    const p23 = { x: landmarks[23].x * canvas.width, y: landmarks[23].y * canvas.height };
    const p24 = { x: landmarks[24].x * canvas.width, y: landmarks[24].y * canvas.height };

    const newFrame = { shoulder: distance(p11, p12), waist: distance(p23, p24) };

    setFrames(prev => {
      const updated = [...prev, newFrame].slice(-7);
      if (updated.length >= 5) {
        const shoulderVals = updated.map(f => f.shoulder);
        const variation = Math.max(...shoulderVals) - Math.min(...shoulderVals);

        // 🔥 ONLY reject when movement high
        if (variation > 35) {
          setStatus("⚠️ Too much movement, hold still");
          setLoading(false);
          return updated; // ❗ frames को preserve करो
        }

        // ✅ proceed if stable
        const avgS = updated.reduce((s, f) => s + f.shoulder, 0) / updated.length;
        const avgW = updated.reduce((s, f) => s + f.waist, 0) / updated.length;

        // 🔥 FRONT → SIDE FLOW

        // FRONT SCAN
        if (scanMode === "front") {
          setFrontData({ shoulder: avgS, waist: avgW, ratio });
          setScanMode("side");
          setStatus("✅ Front scan complete");

          setTimeout(() => {
          setStatus("➡️ Now turn sideways and hold still");
          }, 800);

          setTimeout(() => {
            setStatus("📸 Side scan starting...");
          }, 1200);

          setFrames([]);
          setLoading(false);

          // 👉 RESET SCAN (IMPORTANT)
          setAutoScanning(false);
          autoScanRef.current = false;

          // 🔥 FORCE RE-TRIGGER HELPER
          stableRef.current = 0;
          setStableFrames(0);

          return [];
        }

        // SIDE SCAN
        if (scanMode === "side") {

          // 🔥 SAFETY CHECK
          if (!frontData) {
            setStatus("⚠️ Restart scan");
            setScanMode("front");
            setAutoScanning(false);
            autoScanRef.current = false;
            return [];
          }

          if (!isSidePose(landmarks)) {
            setStatus("➡️ Turn your body sideways (Left/Right)");
            setLoading(false);
            return updated;
          }

          setStatus("📸 Scanning side... Hold still");

          const depthPx = getBodyDepth(landmarks, canvasRef.current);

          const widthCm = frontData.waist * frontData.ratio;
          const depthCm = depthPx * frontData.ratio;

          // 🔥 AI DEPTH (NEW)
          const shoulderCm = frontData.shoulder * frontData.ratio;
 
          // 🔥 AUTO WEIGHT DETECT
          let finalWeight = weight;

          if (!weight || weight === 0) {
            const autoW = estimateWeight(shoulderCm, widthCm, height);
            setEstimatedWeight(autoW);
            finalWeight = autoW;
          } else {
            setEstimatedWeight(null);
          }
          const aiDepth = estimateDepth(widthCm, shoulderCm, widthCm);

          // 🔥 FUSION (NEW)
          const fusedDepth = depthCm * 0.7 + aiDepth * 0.3;

          // 🔥 FINAL SAFE DEPTH (UPDATED)
          const safeDepth = Math.max(
            fusedDepth,
            widthCm * (finalWeight > 100 ? 0.60 : finalWeight > 85 ? 0.55 : 0.45)
          );

          // 🔥 AUTO BODY TYPE DETECTION
          const autoType = detectBodyType(
            frontData.shoulder * frontData.ratio,
            widthCm,
            safeDepth
          );

          // override body type
          setBodyType(autoType);

          // ✅ ADD THIS (MISSING FIX)
          const finalBodyType = autoType;

          const a = widthCm / 2;
          const b = safeDepth / 2;

          const waistFinal = Math.PI * Math.sqrt(2 * (a * a + b * b));

          const finalData = {
            shoulder: frontData.shoulder * frontData.ratio,
            bust: (frontData.shoulder * frontData.ratio) * 1.35,
            waist_top: waistFinal,
            hip: waistFinal * 1.1,

            // 🔥 ADD THESE (IMPORTANT)
            armhole: (frontData.shoulder * frontData.ratio) * 0.5,

            length_top: height * 0.15, // torso estimate

            // optional future safe
            thigh: waistFinal * 0.6,
          };

          const corrected = applyCorrections(finalData);

          // 🔥 FINAL FIX (MANDATORY)
          const fullData = {
            ...corrected,

            // 🔥 TOP
            armhole: corrected.armhole || finalData.armhole,
            length_top: corrected.length_top || finalData.length_top,

            // 🔥 BOTTOM (CRITICAL ADD)
            waist_bottom: waistFinal * 0.95,   // 👈 same waist for now
            thigh: corrected.thigh,
            length_bottom: height * 0.45,

            // 🔥 META
            height,
            weight: finalWeight,
            bodyType: finalBodyType
          };

          // 🔒 STOP LOOP IMMEDIATELY
          setScanMode("done");
          autoScanRef.current = false;
          setAutoScanning(false);

          processFinalMeasurement(fullData);

          setLoading(false);
          setFrames([]);

          return [];  
                  
        } 
      } 
      return updated; 
    });
  };

  // --- ENGINE SETUP ---
  useEffect(() => {
    if (!window.Pose || !window.Camera) return;
    if (showInputPopup) return; // 🔥 Stop camera if popup is active

    poseRef.current = new window.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    poseRef.current.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    poseRef.current.onResults((res) => {
      if (!canvasRef.current || !videoRef.current || !res.poseLandmarks) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const alpha = stableRef.current > 10 ? 0.8 : 0.6;
      if (!smoothRef.current) {
        smoothRef.current = res.poseLandmarks;
      } else {
        smoothRef.current = res.poseLandmarks.map((p, i) => ({
          x: p.x * alpha + (smoothRef.current[i]?.x || p.x) * (1 - alpha),
          y: p.y * alpha + (smoothRef.current[i]?.y || p.y) * (1 - alpha),
          visibility: p.visibility
        }));
      }

      setLandmarks(smoothRef.current);
      const cur = smoothRef.current;

      setIsA4Detected(checkA4Presence(cur));

      const nose = cur[0];
      const centerX = (cur[27].x + cur[28].x) / 2;
      setAligned(Math.abs(nose.x - centerX) < 0.05);

      const sWidth = Math.abs(cur[11].x - cur[12].x);
      const bHeight = Math.abs(cur[27].y - cur[0].y);
      const bodyRatio = sWidth / bHeight;
      const dStatus = bodyRatio < 0.12 ? "far" : bodyRatio > 0.25 ? "close" : "perfect";
      setDistanceStatus(dStatus);

      if (lastShoulder && Math.abs(lastShoulder - sWidth) < 0.05) {
        stableRef.current += 1;
        setStableFrames(stableRef.current);
      } else {
        stableRef.current = 0;
        setStableFrames(0);
      }
      setLastShoulder(sWidth);

      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawConnectors(ctx, cur, POSE_CONNECTIONS, { color: "#9333ea", lineWidth: 2 });
      drawLandmarks(ctx, cur, { color: "#ffffff", radius: 2 });
      ctx.restore();

      if (scanMode === "front") {
        if (Math.abs(nose.x - centerX) >= 0.05) setStatus("🔴 Center your body");
        else if (dStatus !== "perfect") setStatus(dStatus === "far" ? "📏 Move Closer" : "📏 Move Back");
        else if (checkA4Presence(cur)) {
          setStatus("📄 A4 Detected! Hold still");

          if (stableRef.current > 5 && aligned && !autoScanning) {
            setAutoScanning(true);
            autoScanRef.current = true;

            setStatus("📸 Scanning started (A4 Mode)...");

            setTimeout(() => {
              setStatus("🔄 Capturing... hold still");
            }, 800);

            const tryCapture = () => {
               if (scanMode === "done") return;
               if (!autoScanRef.current) return;

               calculate();

               setTimeout(() => {
                 if (autoScanRef.current && scanMode !== "done") {
                   tryCapture();
                 }
               }, 700);
            };

            tryCapture();
          }
        }

        else setStatus("🟢 Perfect position - Hold still for scan");
      }
    });

    const isLowEnd = window.innerWidth < 450;
    cameraRef.current = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (poseRef.current) await poseRef.current.send({ image: videoRef.current });
      },
      width: isLowEnd ? 720 : 1280,
      height: isLowEnd ? 1280 : 1920,
      facingMode: facingMode
    });
    cameraRef.current.start();
    setTimeout(() => {
      setStatus("🧍 Stand straight & fit full body in frame");
    }, 1500);

    return () => {
      cameraRef.current?.stop();
      poseRef.current?.close();
    };
  }, [facingMode, showInputPopup]); 

  // 🔥 LOAD AI LEARNING (MISSING FIX)
  useEffect(() => {
    if (!user?._id) return;

    getCorrection(user?._id).then(setLearningAdjust);
  }, [user]);

  // 🔥 LOAD LAST SIZE
  useEffect(() => {
    if (!user?._id || result) return;

    getLastSize(user?._id).then((res) => {
      if (res.found) {
        setLastSize(res.data);
        setResult(res.data);
        setStatus("⚡ Loaded previous size");
        setShowInputPopup(false);
      }
    });
  }, [user]); // ✅ FIX

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "sans-serif" }}>
      
      {/* 🔥 ENHANCED MANDATORY POPUP WITH BODY TYPE IMAGES */}
      {showInputPopup && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.98)", zIndex: 999, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto" }}>
          <div style={{ width: "90%", maxWidth: "380px", background: "white", borderRadius: "28px", padding: "25px", textAlign: "center", color: "#1e293b", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <h2 style={{ marginBottom: "10px", fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>Measurement Details</h2>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>Enter details for 95%+ accuracy</p>
            <p style={{ fontSize: "12px", marginBottom: "15px", color: "#475569" }}>
            🚀 For best accuracy:
            <br /><br />
            ✔ Option 1 (BEST): Hold A4 paper  
            <br />
            ✔ Option 2: Enter height  
            <br />
            ✔ Optional: Enter weight (improves fit)
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
              <div style={{ textAlign: "left" }}>
                <label style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold" }}>WEIGHT (KG)</label>
                <input type="number" placeholder="Optional" value={weight} onChange={(e) => setWeight(Number(e.target.value))} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #f1f5f9", marginTop: "5px", outline: "none", fontSize: "16px", fontWeight: "bold" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <label style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold" }}>HEIGHT (CM)</label>
                <input type="number" placeholder="Optional" value={height} onChange={(e) => setHeight(Number(e.target.value))} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #f1f5f9", marginTop: "5px", outline: "none", fontSize: "16px", fontWeight: "bold" }} />
              </div>
            </div>

            <p style={{ fontSize: "13px", fontWeight: "bold", color: "#475569", marginBottom: "15px", lineHeight: "1.4" }}>
              IF YOU WANT SIZE ACCURACY, SELECT YOUR BODY TYPE:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
              {[
                { id: "slim", label: "Slim", img: "https://cdn-icons-png.flaticon.com/512/11514/11514064.png" },
                { id: "regular", label: "Regular", img: "https://cdn-icons-png.flaticon.com/512/11514/11514059.png" },
                { id: "curvy", label: "Curvy", img: "https://cdn-icons-png.flaticon.com/512/11514/11514070.png" }
              ].map((type) => (
                <div 
                  key={type.id} 
                  onClick={() => setBodyType(type.id)}
                  style={{ cursor: "pointer", padding: "10px", borderRadius: "16px", border: bodyType === type.id ? "2px solid #9333ea" : "2px solid #f1f5f9", background: bodyType === type.id ? "#f5f3ff" : "white", transition: "0.2s" }}
                >
                  <img src={type.img} alt={type.label} style={{ width: "100%", height: "50px", objectFit: "contain", marginBottom: "5px" }} />
                  <span style={{ fontSize: "10px", fontWeight: "bold", color: bodyType === type.id ? "#9333ea" : "#64748b" }}>{type.label.toUpperCase()}</span>
                </div>
              ))}
            </div>

            <button onClick={handleStartScan} style={{ width: "100%", padding: "16px", background: "#9333ea", color: "white", border: "none", borderRadius: "15px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(147, 51, 234, 0.4)" }}>
              START SCANNING
            </button>

            <button onClick={skipBodyType} style={{ width: "100%", padding: "10px", background: "none", border: "none", color: "#94a3b8", fontSize: "12px", marginTop: "10px", cursor: "pointer", textDecoration: "underline" }}>
              I'm not interested (Use default)
            </button>
          </div>
        </div>
      )}

      <header style={{ textAlign: "center", padding: "12px" }}>
        <h1 style={{ fontSize: "16px", fontWeight: "900", letterSpacing: "1px" }}>DRAPSHE SMART FIT PRO</h1>
      </header>

      {lastSize && (
        <div style={{
          textAlign: "center",
          background: "#22c55e",
          padding: "6px",
          fontSize: "12px"
        }}>
          ⚡ Previous size loaded automatically
        </div>
      )}

      <div style={{ position: "relative", width: "92%", maxWidth: "480px", height: "65vh", margin: "0 auto", borderRadius: "24px", overflow: "hidden", border: "2px solid #334155" }}>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
        {scanMode === "side" && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.7)",
            padding: "12px 20px",
            borderRadius: "12px",
            fontSize: "14px"
          }}>
            Turn your body sideways 📏
          </div>
        )}
        
        {isA4Detected && (
           <div style={{ position: "absolute", top: "15px", right: "15px", background: "#22c55e", padding: "4px 8px", borderRadius: "8px", fontSize: "10px", fontWeight: "bold" }}>
             A4 ACTIVE
           </div>
        )}

        <div style={{ position: "absolute", top: "15px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", zIndex: 10, width: "max-content" }}>
          {status}
        </div>
        <button onClick={() => setFacingMode(p => p === "user" ? "environment" : "user")} style={{ position: "absolute", bottom: "15px", right: "15px", padding: "8px", borderRadius: "50%", background: "white", border: "none", cursor: "pointer", zIndex: 11 }}>🔄</button>
      </div>

      <div style={{ position: "fixed", bottom: 0, width: "100%", background: "white", color: "#1e293b", borderTopLeftRadius: "28px", borderTopRightRadius: "28px", padding: "15px 0", boxShadow: "0 -8px 20px rgba(0,0,0,0.2)" }}>
        
        <div style={{ width: "90%", margin: "0 auto 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>FIT STYLE:</span>
          <div style={{ display: "flex", gap: "8px" }}>
            {[{l: "Tight", v: -2}, {l: "Slim", v: 0}, {l: "Relax", v: 2}].map(opt => (
               <button 
                key={opt.l}
                onClick={() => setFitPreference(opt.v)}
                style={{ padding: "4px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: fitPreference === opt.v ? "#9333ea" : "white", color: fitPreference === opt.v ? "white" : "#64748b", fontSize: "10px", transition: "0.3s" }}
               >
                 {opt.l}
               </button>
            ))}
          </div>
        </div>

        <div style={{ width: "90%", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: "14px" }}>
            <span style={{ fontSize: "10px", color: "#64748b" }}>TYPE: {bodyType.toUpperCase()} (AUTO)</span>
          </div>
          <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: "14px" }}>
            <span style={{ fontSize: "10px", color: "#64748b" }}>
              WEIGHT: {weight ? `${weight} KG` : estimatedWeight ? `${estimatedWeight} KG (Auto)` : "--"}
            </span>
          </div>
          </div>
        </div>

        {result && (
          <>
            <div style={{ width: "90%", margin: "10px auto", textAlign: "center" }}>
              <p style={{ fontSize: "12px", marginBottom: "8px" }}>
                Was the fit correct?
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <button disabled={feedbackGiven} onClick={() => handleFeedback("perfect")}>👍 Perfect</button>
                <button disabled={feedbackGiven} onClick={() => handleFeedback("tight")}>😬 Tight</button>
                <button disabled={feedbackGiven} onClick={(e) => {e.preventDefault(); e.stopPropagation(); handleFeedback("loose");}}>😐 Loose</button>
              </div>
            </div>
            
          <div style={{ width: "90%", margin: "15px auto 0", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
            {[{ l: "Shld", v: result.shoulder }, { l: "Bust", v: result.bust }, { l: "Waist", v: result.waist_top }, { l: "Hip", v: result.hip }, { l: "Thigh", v: result.thigh }].map(i => (
              <div key={i.l} style={{ textAlign: "center", border: "1px solid #e2e8f0", padding: "6px 2px", borderRadius: "10px", background: "#fafafa" }}>
                <p style={{ margin: 0, fontSize: "8px", color: "#64748b", textTransform: "uppercase" }}>{i.l}</p>
                <b style={{ fontSize: "12px", color: "#0f172a" }}>{i.v} cm</b>
              </div>
            ))}
          </div>
        </>
        )}
    </div>
  );
}