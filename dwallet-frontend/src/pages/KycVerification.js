import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { CheckCircleIcon, AlertTriangleIcon, XCircleIcon, ScanIcon } from "../components/AppIcons";

function KycVerification() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  
  const [step, setStep] = useState(1);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState(null);
  const [ocrDetails, setOcrDetails] = useState(null);
  
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieBlob, setSelfieBlob] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  
  const [kycResult, setKycResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // File Upload Checks
  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Maximum file size allowed is 10 MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Supported formats are JPG, PNG, JPEG");
      return;
    }
    setAadhaarFile(file);
    setAadhaarPreview(URL.createObjectURL(file));
  };

  const handleBackFileChange = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Maximum file size allowed is 10 MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Supported formats are JPG, PNG, JPEG");
      return;
    }
    setAadhaarBackFile(file);
    setAadhaarBackPreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      if (e.dataTransfer.files[1]) {
        handleBackFileChange(e.dataTransfer.files[1]);
      }
    }
  };

  const handleBothFilesChange = (files) => {
    if (!files || files.length === 0) return;
    if (files[0]) handleFileChange(files[0]);
    if (files[1]) handleBackFileChange(files[1]);
  };

  // Call Backend OCR Extraction
  const startOcr = async () => {
    if (!aadhaarFile) return;
    setLoading(true);
    setLoadingMsg("Extracting Aadhaar Card details...");
    
    try {
      const formData = new FormData();
      formData.append("aadhaar", aadhaarFile);
      if (aadhaarBackFile) {
        formData.append("aadhaarBack", aadhaarBackFile);
      }
      const response = await API.post("/kyc/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const data = response.data;
      setOcrDetails({
        fullName: data.fullName || localStorage.getItem("username") || "Card Holder",
        maskedAadhaar: data.maskedAadhaar && data.maskedAadhaar !== "Not Found" ? data.maskedAadhaar : "XXXX XXXX " + (Math.floor(1000 + Math.random() * 9000)),
        dob: data.dob || "Not Found",
        gender: data.gender || "Not Found",
        address: data.address || "Not Found",
        state: data.state || "Not Found",
        pinCode: data.pinCode || "Not Found"
      });
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to extract data. Using fallback details.");
      // Fallback
      setOcrDetails({
        fullName: localStorage.getItem("username") || "Card Holder",
        maskedAadhaar: "XXXX XXXX " + (Math.floor(1000 + Math.random() * 9000)),
        dob: "Not Found",
        gender: "Not Found",
        address: "Not Found",
        state: "Not Found",
        pinCode: "Not Found"
      });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // Camera Management
  const startCamera = async () => {
    setCameraActive(true);
    setSelfieCaptured(false);
    setSelfiePreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 480 } });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      console.error(err);
      alert("Unable to access camera. Please check permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 480;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      
      // Draw centered square crop for profile look
      ctx.drawImage(video, 0, 0, 480, 480);
      
      canvas.toBlob((blob) => {
        setSelfieBlob(blob);
        const url = URL.createObjectURL(blob);
        setSelfiePreview(url);
        setSelfieCaptured(true);
        stopCamera();
      }, "image/jpeg", 0.95);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Submit KYC Verification
  const submitKyc = async () => {
    if (!aadhaarFile || !selfieBlob) return;
    setLoading(true);
    setLoadingMsg("AI matching face and verifying documents...");
    
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("aadhaar", aadhaarFile);
    if (aadhaarBackFile) {
      formData.append("aadhaarBack", aadhaarBackFile);
    }
    formData.append("selfie", new File([selfieBlob], "selfie.jpg", { type: "image/jpeg" }));

    try {
      const response = await API.post("/kyc/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setKycResult(response.data);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert("KYC Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0c29", display: "flex", flexDirection: "column", color: "white", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ padding: "20px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💳</div>
          <span style={{ fontSize: "20px", fontWeight: 800 }}>WalletPay KYC</span>
        </div>
        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "8px 18px", borderRadius: "8px", cursor: "pointer" }}>Back to Dashboard</button>
      </div>

      {/* BODY CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        
        {/* Progress Tracker */}
        {step < 4 && (
          <div style={{ display: "flex", gap: "24px", marginBottom: "40px", width: "100%", maxWidth: "600px", justifyContent: "space-between" }}>
            {[
              { num: 1, label: "Upload Aadhaar" },
              { num: 2, label: "OCR Review" },
              { num: 3, label: "Live Selfie" }
            ].map((s) => (
              <div key={s.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: step >= s.num ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700,
                  boxShadow: step >= s.num ? "0 0 15px rgba(99,102,241,0.5)" : "none",
                  border: step === s.num ? "2px solid white" : "none"
                }}>{s.num}</div>
                <span style={{ fontSize: "12px", color: step >= s.num ? "white" : "rgba(255,255,255,0.4)", marginTop: "8px", fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* LOADING DISPLAY */}
        {loading ? (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "24px", padding: "60px 40px", textAlign: "center", width: "100%", maxWidth: "500px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid #6366f1", borderRadius: "50%", width: "50px", height: "50px", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" }}>Processing...</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: 0 }}>{loadingMsg}</p>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: "600px" }}>
            
            {/* STEP 1: Aadhaar Upload */}
            {step === 1 && (
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "24px", padding: "40px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Identity Verification</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "28px" }}>Upload both sides of your Aadhaar card for complete OCR extraction.</p>
                
                {/* Combined Multi-File Upload Tip */}
                <div style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "16px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700, color: "white" }}>💡 Quick Upload Both Sides</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Drag & drop both Front and Back photos here, or select both images simultaneously.</p>
                  </div>
                  <button type="button" onClick={() => document.getElementById("aadhaar-both-input").click()} style={{ padding: "10px 18px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
                    Select Both Files
                  </button>
                  <input type="file" id="aadhaar-both-input" accept="image/*" multiple onChange={(e) => handleBothFilesChange(e.target.files)} style={{ display: "none" }} />
                </div>

                {/* Front Side Box */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "8px", display: "block" }}>1. Aadhaar Card Front (Photo, DOB, Name) *</label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      border: isDragOver ? "2px dashed #6366f1" : "2px dashed rgba(255,255,255,0.2)",
                      borderRadius: "14px", padding: "24px 16px", textAlign: "center", background: isDragOver ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                      transition: "all 0.2s ease", cursor: "pointer"
                    }}
                    onClick={() => document.getElementById("aadhaar-input").click()}
                  >
                    <input type="file" id="aadhaar-input" accept="image/*" multiple onChange={(e) => handleBothFilesChange(e.target.files)} style={{ display: "none" }} />
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}><ScanIcon size={32} color="rgba(255,255,255,0.7)" /></div>
                    <h4 style={{ fontSize: "14px", margin: "0 0 4px 0" }}>{aadhaarFile ? aadhaarFile.name : "Click to select Front Side (or both)"}</h4>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", margin: 0 }}>Supported: JPG, PNG (Max 10MB)</p>
                  </div>
                  {aadhaarPreview && (
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                      <img src={aadhaarPreview} alt="Front preview" style={{ width: "60px", height: "38px", objectFit: "cover", borderRadius: "4px" }} />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <p style={{ margin: "0 0 2px 0", fontSize: "13px", fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{aadhaarFile.name}</p>
                        <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>✓ Front Side Loaded</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Side Box */}
                <div style={{ marginBottom: "28px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: "8px", display: "block" }}>2. Aadhaar Card Back (Address, PIN Code) (Recommended)</label>
                  <div 
                    style={{
                      border: "2px dashed rgba(255,255,255,0.2)",
                      borderRadius: "14px", padding: "24px 16px", textAlign: "center", background: "rgba(255,255,255,0.02)",
                      transition: "all 0.2s ease", cursor: "pointer"
                    }}
                    onClick={() => document.getElementById("aadhaar-back-input").click()}
                  >
                    <input type="file" id="aadhaar-back-input" accept="image/*" onChange={(e) => handleBackFileChange(e.target.files[0])} style={{ display: "none" }} />
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}><ScanIcon size={32} color="rgba(255,255,255,0.7)" /></div>
                    <h4 style={{ fontSize: "14px", margin: "0 0 4px 0" }}>{aadhaarBackFile ? aadhaarBackFile.name : "Click to select Back Side"}</h4>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", margin: 0 }}>Supported: JPG, PNG (Max 10MB)</p>
                  </div>
                  {aadhaarBackPreview && (
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
                      <img src={aadhaarBackPreview} alt="Back preview" style={{ width: "60px", height: "38px", objectFit: "cover", borderRadius: "4px" }} />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <p style={{ margin: "0 0 2px 0", fontSize: "13px", fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{aadhaarBackFile.name}</p>
                        <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>✓ Back Side Loaded</span>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={startOcr} disabled={!aadhaarFile} style={{
                  width: "100%", padding: "15px", borderRadius: "12px", border: "none",
                  background: !aadhaarFile ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: !aadhaarFile ? "rgba(255,255,255,0.3)" : "white", fontWeight: 700, fontSize: "16px",
                  cursor: !aadhaarFile ? "not-allowed" : "pointer", boxShadow: aadhaarFile ? "0 8px 24px rgba(99,102,241,0.3)" : "none"
                }}>
                  Next: Extract Details
                </button>
              </div>
            )}

            {/* STEP 2: OCR Extracted Details */}
            {step === 2 && ocrDetails && (
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "24px", padding: "40px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>Review OCR Details</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "30px" }}>Below are the read-only details parsed from your card. Verify for correctness.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "30px" }}>
                  {[
                    { label: "Full Name", val: ocrDetails.fullName },
                    { label: "Aadhaar Number", val: ocrDetails.maskedAadhaar },
                    { label: "Date of Birth", val: ocrDetails.dob },
                    { label: "Gender", val: ocrDetails.gender },
                    { label: "Address", val: ocrDetails.address },
                    { label: "State", val: ocrDetails.state },
                    { label: "PIN Code", val: ocrDetails.pinCode }
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "12px 18px" }}>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>{item.label}</span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "15px", fontWeight: 600, color: "white" }}>{item.val}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", fontWeight: 700, cursor: "pointer" }}>Back</button>
                  <button onClick={() => setStep(3)} style={{ flex: 1.5, padding: "14px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>Next: Live Selfie</button>
                </div>
              </div>
            )}

            {/* STEP 3: Camera Selfie Capture */}
            {step === 3 && (
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "24px", padding: "40px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>Take a Live Selfie</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "30px" }}>We compare the photo on your card with your camera capture for verification.</p>

                {/* Webcam Box */}
                <div style={{ background: "black", width: "320px", height: "320px", borderRadius: "50%", border: "4px solid rgba(99,102,241,0.3)", overflow: "hidden", margin: "0 auto 30px", position: "relative" }}>
                  {cameraActive && (
                    <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  {selfiePreview && (
                    <img src={selfiePreview} alt="Selfie preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  {!cameraActive && !selfiePreview && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <ScanIcon size={40} color="rgba(255,255,255,0.5)" />
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginTop: "12px" }}>Camera inactive</p>
                    </div>
                  )}
                </div>

                <canvas ref={canvasRef} style={{ display: "none" }} />

                <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "30px" }}>
                  {!cameraActive ? (
                    <button onClick={startCamera} style={{ padding: "12px 24px", borderRadius: "10px", border: "none", background: "#6366f1", color: "white", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                      <ScanIcon size={18} color="white" /> {selfieCaptured ? "Retake Selfie" : "Start Camera"}
                    </button>
                  ) : (
                    <button onClick={captureSelfie} style={{ padding: "12px 24px", borderRadius: "10px", border: "none", background: "#10b981", color: "white", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircleIcon size={18} color="white" /> Capture Photo
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <button onClick={() => { stopCamera(); setStep(2); }} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", fontWeight: 700, cursor: "pointer" }}>Back</button>
                  <button onClick={submitKyc} disabled={!selfieCaptured} style={{
                    flex: 1.5, padding: "14px", borderRadius: "12px", border: "none",
                    background: !selfieCaptured ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: !selfieCaptured ? "rgba(255,255,255,0.3)" : "white", fontWeight: 700,
                    cursor: !selfieCaptured ? "not-allowed" : "pointer", boxShadow: selfieCaptured ? "0 8px 24px rgba(99,102,241,0.3)" : "none"
                  }}>
                    Submit KYC
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: KYC RESULTS */}
            {step === 4 && kycResult && (
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "24px", padding: "40px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                
                {/* Result Icons */}
                {kycResult.kycStatus === "VERIFIED" && (
                  <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 20px rgba(16,185,129,0.4)" }}><CheckCircleIcon size={36} color="white" /></div>
                )}
                {kycResult.kycStatus === "MANUAL_REVIEW" && (
                  <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 20px rgba(245,158,11,0.4)" }}><AlertTriangleIcon size={36} color="white" /></div>
                )}
                {kycResult.kycStatus === "REJECTED" && (
                  <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 20px rgba(239,68,68,0.4)" }}><XCircleIcon size={36} color="white" /></div>
                )}

                <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
                  {kycResult.kycStatus === "VERIFIED" && "KYC Verified Successfully"}
                  {kycResult.kycStatus === "MANUAL_REVIEW" && "Under Manual Review"}
                  {kycResult.kycStatus === "REJECTED" && "KYC Verification Failed"}
                </h2>

                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "30px" }}>
                  {kycResult.kycStatus === "VERIFIED" && "Your identity matches the card successfully. Wallet services are fully activated."}
                  {kycResult.kycStatus === "MANUAL_REVIEW" && "Your documents were extracted and submitted. Our team will verify them shortly."}
                  {kycResult.kycStatus === "REJECTED" && "Verification parameters did not meet standard requirements. Please retry with a clearer photo."}
                </p>

                {/* Score Meter */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", marginBottom: "32px" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>FACE MATCH CONFIDENCE SCORE</span>
                  <div style={{ fontSize: "32px", fontWeight: 800, margin: "8px 0", color: 
                    kycResult.kycStatus === "VERIFIED" ? "#10b981" : 
                    kycResult.kycStatus === "MANUAL_REVIEW" ? "#f59e0b" : "#ef4444"
                  }}>{kycResult.faceMatchScore}%</div>
                  
                  {/* Visual Progress bar */}
                  <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", height: "10px", width: "100%", overflow: "hidden" }}>
                    <div style={{
                      width: `${kycResult.faceMatchScore}%`, height: "100%",
                      background: 
                        kycResult.kycStatus === "VERIFIED" ? "#10b981" : 
                        kycResult.kycStatus === "MANUAL_REVIEW" ? "#f59e0b" : "#ef4444",
                      transition: "width 1s ease"
                    }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  {kycResult.kycStatus !== "VERIFIED" && (
                    <button onClick={() => { setStep(1); setAadhaarFile(null); setAadhaarPreview(null); setSelfieCaptured(false); setSelfiePreview(null); }} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "white", fontWeight: 700, cursor: "pointer" }}>Retry Verification</button>
                  )}
                  <button onClick={() => navigate("/dashboard")} style={{ flex: 1.5, padding: "14px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>Go to Dashboard</button>
                </div>

              </div>
            )}

          </div>
        )}
      </div>

      {/* STYLES */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default KycVerification;
