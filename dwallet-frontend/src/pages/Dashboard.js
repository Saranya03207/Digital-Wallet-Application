import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import TopHeader from "../components/TopHeader";
import HelpButton from "../components/HelpButton";
import { ScanIcon, TransferIcon, HistoryIcon, ProfileIcon, BellIcon, QrIcon, EyeIcon, EyeOffIcon, ShieldIcon, DownloadIcon, ShareIcon, WalletIcon, PlusIcon, CameraIcon } from "../components/AppIcons";
import { QRCodeSVG, getJsQR } from "../components/QRHelper";

function Dashboard() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showBalance, setShowBalance] = useState(false);
  const [showBalancePinModal, setShowBalancePinModal] = useState(false);
  const [balancePin, setBalancePin] = useState("");
  const [balancePinError, setBalancePinError] = useState("");
  const [totalTransfer, setTotalTransfer] = useState(0);
  const [kyc, setKyc] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [recentContacts, setRecentContacts] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const navigate = useNavigate();

  const handleToggleBalance = () => {
    if (showBalance) {
      setShowBalance(false);
    } else {
      setBalancePin("");
      setBalancePinError("");
      setShowBalancePinModal(true);
    }
  };

  const handleVerifyBalancePin = () => {
    if (!balancePin || balancePin.length < 4) {
      setBalancePinError("Please enter your 4-digit PIN");
      return;
    }
    if (wallet?.user?.transactionPin && balancePin !== wallet.user.transactionPin) {
      setBalancePinError("Incorrect UPI PIN. Please enter correct 4-digit PIN.");
      return;
    }
    setShowBalance(true);
    setShowBalancePinModal(false);
    setBalancePin("");
    setBalancePinError("");
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { navigate("/"); return; }

    API.get(`/wallet/details/${userId}`)
      .then(res => setWallet(res.data))
      .catch(err => console.log(err));

    API.get(`/wallet/history/${userId}`)
      .then(res => {
        const txns = Array.isArray(res.data) ? res.data : [];
        setTransactions(txns);
        let transferred = 0;
        txns.forEach(t => { if (t.transactionType === "TRANSFER") transferred += Number(t.amount); });
        setTotalTransfer(transferred);
      })
      .catch(err => console.log(err));

    API.get(`/kyc/status/${userId}`)
      .then(res => setKyc(res.data))
      .catch(err => console.log(err));

    API.get(`/wallet/contacts/recent?userId=${userId}`)
      .then(res => setRecentContacts(res.data || []))
      .catch(err => console.log(err));
  }, [navigate]);

  useEffect(() => {
    if (showScanModal) {
      startCameraScan();
    } else {
      stopCameraScan();
    }
    return () => stopCameraScan();
  }, [showScanModal]);

  const startCameraScan = async () => {
    setScanError("");
    setScanning(true);
    try {
      const jsQR = await getJsQR();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        videoRef.current.muted = true;
        await videoRef.current.play();
        
        let detector = null;
        if (window.BarcodeDetector) {
          try {
            detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          } catch (e) { detector = null; }
        }

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current) return;
          
          if (detector) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                stopCameraScan();
                handleQrDataDecoded(barcodes[0].rawValue);
                return;
              }
            } catch (e) {}
          }

          if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current && jsQR) {
            const canvas = canvasRef.current;
            canvas.width = videoRef.current.videoWidth || 300;
            canvas.height = videoRef.current.videoHeight || 300;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
            if (code && code.data) {
              stopCameraScan();
              handleQrDataDecoded(code.data);
            }
          }
        }, 150);
      }
    } catch (err) {
      console.log("Camera error:", err);
      setScanError("Unable to access camera. Please allow camera permission or upload a QR image from your device.");
      setScanning(false);
    }
  };

  const stopCameraScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleQrImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const jsQR = await getJsQR();
    if (!jsQR) {
      setScanError("QR Scanner utility failed to load.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
        if (code && code.data) {
          handleQrDataDecoded(code.data);
        } else {
          setScanError("No valid QR code found in this image. Please try uploading another QR code.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleQrDataDecoded = (qrText) => {
    setShowScanModal(false);
    stopCameraScan();
    let upiId = qrText;
    if (qrText.includes("pa=")) {
      try {
        const urlPart = qrText.includes("?") ? qrText.split("?")[1] : qrText;
        const params = new URLSearchParams(urlPart);
        upiId = params.get("pa") || qrText;
      } catch (e) {
        upiId = qrText;
      }
    } else if (qrText.startsWith("upi://")) {
      upiId = qrText.replace("upi://", "");
    }
    alert(`✅ QR Code Scanned Successfully!\nUPI ID: ${upiId}\nRedirecting to transfer...`);
    navigate("/transfer", { state: { scannedUpiId: upiId } });
  };

  const quickActions = [
    { icon: <ScanIcon size={26} color="white" />, label: "Scan QR", sub: "Scan & Pay", path: "ACTION_SCAN", color: "#0ea5e9", bg: "linear-gradient(135deg,#0ea5e9,#38bdf8)" },
    { icon: <TransferIcon size={26} color="white" />, label: "Transfer", sub: "Send to anyone", path: "/transfer", color: "#f97316", bg: "linear-gradient(135deg,#f97316,#fb923c)" },
    { icon: <HistoryIcon size={26} color="white" />, label: "History", sub: "All transactions", path: "/history", color: "#7c3aed", bg: "linear-gradient(135deg,#7c3aed,#a855f7)" },
    { icon: <ProfileIcon size={26} color="white" />, label: "Profile", sub: "Manage account", path: "/profile", color: "#6366f1", bg: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
    { icon: <BellIcon size={26} color="white" />, label: "Alerts", sub: "Notifications", path: "/notifications", color: "#10b981", bg: "linear-gradient(135deg,#10b981,#34d399)" },
  ];

  const handleActionClick = (path) => {
    if (path === "ACTION_SCAN") {
      if (!kyc || kyc.kycStatus !== "VERIFIED") {
        alert("KYC Verification is required to access Scan & Pay.");
        navigate("/kyc");
        return;
      }
      setShowScanModal(true);
      return;
    }
    if ((path === "/transfer" || path === "/add-money") && (!kyc || kyc.kycStatus !== "VERIFIED")) {
      alert("KYC Verification is required to access this feature.");
      navigate("/kyc");
      return;
    }
    navigate(path);
  };

  function getTxIcon(type) {
    if (type === "ADD_MONEY") return <WalletIcon size={20} color="#10b981" />;
    return <TransferIcon size={20} color="#6366f1" />;
  }

  function getTxColor(tx) {
    const uid = Number(localStorage.getItem("userId"));
    if (tx.transactionType === "ADD_MONEY") return "#10b981";
    if (tx.transactionType === "WITHDRAW") return "#ef4444";
    if (tx.transactionType === "TRANSFER") return tx.receiver?.id === uid ? "#10b981" : "#ef4444";
    return "#64748b";
  }

  function getTxAmount(tx) {
    const uid = Number(localStorage.getItem("userId"));
    if (tx.transactionType === "ADD_MONEY") return `+₹${tx.amount}`;
    if (tx.transactionType === "WITHDRAW") return `-₹${tx.amount}`;
    if (tx.transactionType === "TRANSFER") return tx.receiver?.id === uid ? `+₹${tx.amount}` : `-₹${tx.amount}`;
    return `₹${tx.amount}`;
  }

  return (
    <>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8faff,#eef2ff,#f0fdf4)" }}>
        <TopHeader wallet={wallet} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

          {/* KYC Status Warning Banner */}
          {kyc && kyc.kycStatus !== "VERIFIED" && (
            <div style={{
              background: kyc.kycStatus === "REJECTED" ? "linear-gradient(135deg,#fee2e2,#fecaca)" : "linear-gradient(135deg,#fef3c7,#fde68a)",
              borderLeft: kyc.kycStatus === "REJECTED" ? "6px solid #dc2626" : "6px solid #d97706",
              borderRadius: "16px", padding: "18px 24px", marginBottom: "28px", display: "flex", justifyContent: "space-between",
              alignItems: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.02)"
            }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", color: kyc.kycStatus === "REJECTED" ? "#991b1b" : "#92400e", fontSize: "16px", fontWeight: 800 }}>
                  {kyc.kycStatus === "REJECTED" ? "🔴 KYC Verification Failed" : kyc.kycStatus === "MANUAL_REVIEW" ? "🟡 KYC Under Review" : "🟡 KYC Verification Pending"}
                </h3>
                <p style={{ margin: 0, color: kyc.kycStatus === "REJECTED" ? "#7f1d1d" : "#78350f", fontSize: "14px", fontWeight: 500 }}>
                  {kyc.kycStatus === "REJECTED" ? "Identity validation failed. Please review your details and retry." : kyc.kycStatus === "MANUAL_REVIEW" ? "Your documents are uploaded and pending manual administrator approval." : "Please complete KYC verification to activate your wallet and start transferring money."}
                </p>
              </div>
              {kyc.kycStatus !== "MANUAL_REVIEW" && (
                <button onClick={() => navigate("/kyc")} style={{
                  background: kyc.kycStatus === "REJECTED" ? "#dc2626" : "#d97706", color: "white", border: "none",
                  padding: "10px 20px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  {kyc.kycStatus === "REJECTED" ? "Retry KYC" : "Verify KYC"}
                </button>
              )}
            </div>
          )}

          {/* Greeting */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {wallet?.user?.fullName?.split(" ")[0]} 👋
            </h1>
            <p style={{ color: "#64748b", fontSize: "15px" }}>Here's your wallet overview for today</p>
          </div>

          {/* Balance Hero Card */}
          <div style={{ borderRadius: "28px", padding: "36px 40px", marginBottom: "28px", position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg,#4f46e5,#7c3aed,#9333ea)",
            boxShadow: "0 20px 60px rgba(99,102,241,0.35)" }}>

            {/* Decorative Circles */}
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "220px", height: "220px",
              borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-60px", right: "80px", width: "180px", height: "180px",
              borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Available Balance</p>
                <h1 style={{ fontSize: "52px", fontWeight: 800, color: "white", marginBottom: "20px", letterSpacing: "-1px" }}>
                  {showBalance ? `₹${wallet?.balance ?? 0}` : "••••••••"}
                </h1>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={handleToggleBalance} style={{ padding: "9px 20px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)",
                    fontWeight: 600, fontSize: "13px", backdropFilter: "blur(10px)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    {showBalance ? <><EyeOffIcon size={16} /> Hide</> : <><EyeIcon size={16} /> Check Balance</>}
                  </button>
                  <button onClick={() => handleActionClick("/add-money")} style={{ padding: "9px 20px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)",
                    fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    <PlusIcon size={16} /> Add Money
                  </button>
                  <button onClick={() => setShowScanModal(true)} style={{ padding: "9px 20px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)",
                    fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    <ScanIcon size={16} /> Scan & Pay
                  </button>
                  <button onClick={() => setShowQrModal(true)} style={{ padding: "9px 20px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)",
                    fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    <QrIcon size={16} /> My QR Code
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right", color: "rgba(255,255,255,0.9)" }}>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "16px", padding: "16px 20px",
                  border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>UPI ID</p>
                  <p style={{ fontWeight: 700, fontSize: "15px" }}>{wallet?.user?.upiId}</p>
                  <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.15)", margin: "12px 0" }} />
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>Reward Points</p>
                  <p style={{ fontWeight: 700, fontSize: "18px", color: "#fbbf24" }}>★ {wallet?.user?.rewardPoints}</p>
                  <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.15)", margin: "12px 0" }} />
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>Daily Limit</p>
                  <p style={{ fontWeight: 700, fontSize: "15px" }}>₹{wallet?.user?.dailyTransferLimit}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: "white", borderRadius: "20px", padding: "24px 28px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "16px",
                background: "linear-gradient(135deg,#f97316,#fb923c)",
                display: "flex", alignItems: "center", justifyContent: "center" }}><TransferIcon size={26} color="white" /></div>
              <div>
                <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>Total Transferred</p>
                <p style={{ fontSize: "24px", fontWeight: 800, color: "#f97316" }}>₹{totalTransfer}</p>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: "20px", padding: "24px 28px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "16px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center" }}><HistoryIcon size={26} color="white" /></div>
              <div>
                <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>Transactions</p>
                <p style={{ fontSize: "24px", fontWeight: 800, color: "#6366f1" }}>{transactions.length}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "16px", marginBottom: "32px" }}>
            {quickActions.map(action => (
              <div key={action.path} onClick={() => handleActionClick(action.path)}
                style={{ background: "white", borderRadius: "20px", padding: "24px 20px",
                  cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid #f1f5f9", transition: "all 0.25s ease",
                  textAlign: "center" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: action.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                  margin: "0 auto 14px", boxShadow: `0 8px 20px ${action.color}30` }}>
                  {action.icon}
                </div>
                <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px", marginBottom: "4px" }}>{action.label}</p>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>{action.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent Transactions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Recent Activity</h2>
            <button onClick={() => navigate("/history")} style={{ padding: "8px 18px", borderRadius: "10px",
              background: "#eef2ff", color: "#6366f1", border: "none", fontWeight: 600, fontSize: "13px" }}>
              View All →
            </button>
          </div>

          <div style={{ background: "white", borderRadius: "20px", padding: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
            {transactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}><HistoryIcon size={48} color="#94a3b8" /></div>
                <p style={{ fontWeight: 600, fontSize: "15px" }}>No transactions yet</p>
                <p style={{ fontSize: "13px", marginTop: "6px" }}>Your recent activity will appear here</p>
              </div>
            ) : (
              transactions.slice(0, 5).map((txn, idx) => (
                <div key={txn.transactionId} style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "16px 20px", borderRadius: "14px",
                  background: idx % 2 === 0 ? "#f8fafc" : "white", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "14px",
                      background: "linear-gradient(135deg,#eef2ff,#e0e7ff)",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {getTxIcon(txn.transactionType)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>
                        {txn.transactionType === "ADD_MONEY" ? "Money Added" : "UPI Transfer"}
                      </p>
                      <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>
                        {new Date(txn.transactionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 800, fontSize: "16px", color: getTxColor(txn) }}>{getTxAmount(txn)}</p>
                    <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 600,
                      background: "#dcfce7", color: "#15803d" }}>
                      {txn.transactionStatus || "SUCCESS"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showBalancePinModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999,
          display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(6px)"
        }}>
          <div style={{
            background: "white", width: "420px", borderRadius: "32px", padding: "40px",
            boxShadow: "0 30px 90px rgba(0,0,0,0.3)", textAlign: "center"
          }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <ShieldIcon size={32} color="white" />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Check Bank Balance</h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px" }}>
              Enter your 4-digit UPI PIN to view your available bank balance
            </p>

            <input
              type="password"
              maxLength="4"
              autoFocus
              placeholder="• • • •"
              value={balancePin}
              onChange={(e) => { setBalancePin(e.target.value); setBalancePinError(""); }}
              style={{
                width: "100%", padding: "18px", borderRadius: "18px", border: `2px solid ${balancePinError ? "#ef4444" : "#e2e8f0"}`,
                fontSize: "32px", textAlign: "center", letterSpacing: "14px", background: "#f8fafc", color: "#0f172a", marginBottom: "12px", outline: "none"
              }}
            />

            {balancePinError && (
              <p style={{ color: "#ef4444", fontWeight: 600, fontSize: "13px", margin: "0 0 16px" }}>
                {balancePinError}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                type="button"
                onClick={handleVerifyBalancePin}
                style={{
                  flex: 1, padding: "16px", borderRadius: "16px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "white", border: "none", fontWeight: 800, fontSize: "15px", cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.3)"
                }}
              >
                View Balance
              </button>
              <button
                type="button"
                onClick={() => { setShowBalancePinModal(false); setBalancePinError(""); setBalancePin(""); }}
                style={{ flex: 1, padding: "16px", borderRadius: "16px", background: "#f1f5f9", color: "#64748b", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My QR Code Modal */}
      {showQrModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.85)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(8px)" }}>
          <div style={{ background: "white", width: "420px", borderRadius: "32px", padding: "36px", boxShadow: "0 30px 90px rgba(0,0,0,0.4)", textAlign: "center", position: "relative" }}>
            <button onClick={() => setShowQrModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "#f1f5f9", border: "none", width: "36px", height: "36px", borderRadius: "50%", fontSize: "16px", cursor: "pointer", color: "#64748b" }}>✕</button>
            
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: "24px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
              {wallet?.user?.fullName?.charAt(0) || "U"}
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>{wallet?.user?.fullName}</h2>
            <p style={{ color: "#6366f1", fontWeight: 700, fontSize: "14px", margin: "0 0 24px 0" }}>{wallet?.user?.upiId}</p>

            {/* Real Dynamic QR Code */}
            <div id="user-qr-code-box" style={{ background: "white", padding: "24px", borderRadius: "24px", display: "inline-block", boxShadow: "0 12px 36px rgba(15,23,42,0.12)", marginBottom: "24px", border: "4px solid #f8fafc" }}>
              <QRCodeSVG
                value={`upi://pay?pa=${wallet?.user?.upiId || ""}&pn=${encodeURIComponent(wallet?.user?.fullName || "")}&cu=INR`}
                size={180}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 24px 0" }}>Scan this QR code using WalletPay or any UPI app to send money instantly</p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => {
                const img = document.getElementById("user-qr-code-img");
                if (img) {
                  const canvas = document.createElement("canvas");
                  canvas.width = img.naturalWidth || 220;
                  canvas.height = img.naturalHeight || 220;
                  const ctx = canvas.getContext("2d");
                  ctx.fillStyle = "white";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  const pngFile = canvas.toDataURL("image/png");
                  const downloadLink = document.createElement("a");
                  downloadLink.download = `${wallet?.user?.fullName || "walletpay"}-QR.png`;
                  downloadLink.href = pngFile;
                  downloadLink.click();
                }
              }} style={{ flex: 1, padding: "14px", borderRadius: "14px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "0 6px 18px rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <DownloadIcon size={16} /> Download QR
              </button>
              <button onClick={() => {
                const upiLink = `upi://pay?pa=${wallet?.user?.upiId || ""}&pn=${encodeURIComponent(wallet?.user?.fullName || "")}&cu=INR`;
                if (navigator.share && window.location.protocol === "https:") {
                  navigator.share({ title: "My WalletPay QR", text: `Pay me instantly using WalletPay or UPI: ${upiLink}`, url: upiLink }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(upiLink);
                  alert("Payment link copied to clipboard!");
                }
              }} style={{ flex: 1, padding: "14px", borderRadius: "14px", background: "#f1f5f9", color: "#0f172a", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <ShareIcon size={16} /> Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scan & Pay Camera Modal */}
      {showScanModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.9)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(10px)" }}>
          <div style={{ background: "#1e293b", width: "480px", borderRadius: "32px", padding: "32px", color: "white", boxShadow: "0 30px 90px rgba(0,0,0,0.5)", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowScanModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", width: "36px", height: "36px", borderRadius: "50%", fontSize: "16px", cursor: "pointer", color: "white" }}>✕</button>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "0 0 6px 0" }}>
              <ScanIcon size={24} color="#38bdf8" />
              <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>Scan QR Code</h2>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", margin: "0 0 20px 0" }}>Align any UPI or WalletPay QR within the frame, or upload an image</p>

            {/* Camera Viewfinder & Canvas */}
            <div style={{ height: "260px", background: "#0f172a", borderRadius: "24px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #38bdf8", marginBottom: "16px" }}>
              <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover", display: scanning && !scanError ? "block" : "none" }} />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              
              {(!scanning || scanError) && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <p style={{ color: "#f87171", fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>
                    {scanError || "Camera currently disabled or loading..."}
                  </p>
                  <button onClick={startCameraScan} style={{ background: "#38bdf8", border: "none", padding: "8px 16px", borderRadius: "10px", color: "#0f172a", fontWeight: 700, cursor: "pointer" }}>
                    Retry Camera
                  </button>
                </div>
              )}
              {scanning && !scanError && (
                <div style={{ position: "absolute", inset: "40px", border: "3px solid rgba(56,189,248,0.6)", borderRadius: "20px", pointerEvents: "none" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg,transparent,#38bdf8,#10b981,transparent)", boxShadow: "0 0 14px #38bdf8", animation: "pulse 1.5s infinite" }} />
                </div>
              )}
            </div>

            {/* Upload from gallery option */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: "14px", cursor: "pointer", fontSize: "13px", fontWeight: 700, transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
                <CameraIcon size={16} color="#38bdf8" /> Upload QR from Gallery
                <input type="file" accept="image/*" hidden onChange={handleQrImageUpload} />
              </label>
            </div>

            {/* Real Contacts from Database */}
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#cbd5e1", marginBottom: "12px", textAlign: "center" }}>Quick Select Contact to Pay</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto" }}>
              {recentContacts.filter(contact => contact.status !== "BLOCKED" && contact.trustBadge !== "Blocked").length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center", margin: "12px 0" }}>No recent contacts yet. Scan a QR code or upload an image to pay!</p>
              ) : (
                recentContacts.filter(contact => contact.status !== "BLOCKED" && contact.trustBadge !== "Blocked").map(contact => (
                  <div key={contact.userId || contact.upiId} onClick={() => { setShowScanModal(false); navigate("/transfer", { state: { scannedUpiId: contact.upiId } }); }}
                    style={{ background: "rgba(255,255,255,0.08)", padding: "12px 16px", borderRadius: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(255,255,255,0.1)", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {contact.profileImage && contact.profileImage !== "null" ? (
                        <img src={contact.profileImage.startsWith("http") || contact.profileImage.startsWith("data:") ? contact.profileImage : `http://localhost:8080/profile-images/${contact.profileImage}`} alt="" style={{ width: "40px", height: "40px", borderRadius: "12px", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = 'none'; if(e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                      ) : null}
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: contact.profileImage && contact.profileImage !== "null" ? "none" : "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px", color: "white" }}>
                        {contact.fullName ? contact.fullName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>{contact.fullName}</p>
                        <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>{contact.upiId}</p>
                      </div>
                    </div>
                    <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: "13px" }}>Pay →</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <HelpButton />
    </>
  );
}

export default Dashboard;
