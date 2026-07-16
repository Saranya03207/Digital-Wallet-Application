import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import TopHeader from "../components/TopHeader";
import { PlusIcon, TransferIcon, HistoryIcon, ProfileIcon, DownloadIcon, EyeIcon, EyeOffIcon, ShieldIcon, WalletIcon } from "../components/AppIcons";

function Wallet() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [showBalancePinModal, setShowBalancePinModal] = useState(false);
  const [balancePin, setBalancePin] = useState("");
  const [balancePinError, setBalancePinError] = useState("");

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
    API.get(`/wallet/details/${userId}`).then(res => setWallet(res.data)).catch(console.log);
  }, []);

  const services = [
    { icon: <PlusIcon size={28} color="white" />, label: "Add Money", desc: "Top up your wallet", path: "/add-money",
      bg: "linear-gradient(135deg,#6366f1,#8b5cf6)", shadow: "rgba(99,102,241,0.3)" },
    { icon: <TransferIcon size={28} color="white" />, label: "Transfer", desc: "Send via UPI", path: "/transfer",
      bg: "linear-gradient(135deg,#f97316,#fb923c)", shadow: "rgba(249,115,22,0.3)" },
    { icon: <HistoryIcon size={28} color="white" />, label: "History", desc: "View all transactions", path: "/history",
      bg: "linear-gradient(135deg,#7c3aed,#a855f7)", shadow: "rgba(124,58,237,0.3)" },
    { icon: <ProfileIcon size={28} color="white" />, label: "Profile", desc: "Account settings", path: "/profile",
      bg: "linear-gradient(135deg,#10b981,#34d399)", shadow: "rgba(16,185,129,0.3)" },
  ];

  const handleDownloadStatement = (type) => {
    const userId = localStorage.getItem("userId");
    const endpoint = type === "PDF" ? `/wallet/statement/${userId}` : `/wallet/statement-csv/${userId}`;
    const filename = type === "PDF" ? "WalletPayStatement.pdf" : "WalletPayStatement.csv";

    API.get(endpoint, { responseType: "blob" })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => {
        console.error("Error downloading statement:", err);
        alert("Failed to download statement.");
      });
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8faff,#eef2ff,#f0fdf4)" }}>
      <TopHeader wallet={wallet} />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <WalletIcon size={28} color="#4f46e5" />
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Wallet Services</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Manage your digital wallet & account exports</p>
        </div>

        {/* Balance Mini Card */}
        <div style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: "20px", padding: "24px 28px",
          color: "white", marginBottom: "28px", boxShadow: "0 12px 36px rgba(99,102,241,0.3)", display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginBottom: "4px" }}>Wallet Balance</p>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <h2 style={{ fontSize: "32px", fontWeight: 800, margin: 0 }}>
                {showBalance ? `₹${wallet?.balance ?? 0}` : "••••••••"}
              </h2>
              <button onClick={handleToggleBalance} style={{ padding: "8px 16px", borderRadius: "10px",
                background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.3)",
                fontWeight: 600, fontSize: "13px", backdropFilter: "blur(10px)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                {showBalance ? <><EyeOffIcon size={16} /> Hide</> : <><EyeIcon size={16} /> Check Balance</>}
              </button>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginBottom: "4px" }}>UPI ID</p>
            <p style={{ fontWeight: 700, fontSize: "15px", margin: 0 }}>{wallet?.user?.upiId}</p>
          </div>
        </div>

        {/* Service Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
          {services.map(s => (
            <div key={s.path} onClick={() => navigate(s.path)}
              style={{ background: "white", borderRadius: "22px", padding: "28px 24px",
                cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
                transition: "all 0.25s ease", display: "flex", flexDirection: "column", gap: "14px" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 36px ${s.shadow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: s.bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px",
                boxShadow: `0 8px 20px ${s.shadow}` }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontWeight: 800, color: "#0f172a", fontSize: "17px", marginBottom: "4px" }}>{s.label}</p>
                <p style={{ color: "#94a3b8", fontSize: "13px" }}>{s.desc}</p>
              </div>
              <span style={{ color: "#6366f1", fontSize: "13px", fontWeight: 600 }}>Tap to continue →</span>
            </div>
          ))}
        </div>

        {/* Statement Export Card */}
        <div style={{ background: "white", borderRadius: "24px", padding: "28px 32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "54px", height: "54px", borderRadius: "16px", background: "linear-gradient(135deg,#0ea5e9,#2563eb)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(14,165,233,0.3)" }}>
              <DownloadIcon size={26} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>Account Statements & Reports</h3>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Download official transaction history in PDF or CSV format</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => handleDownloadStatement("PDF")}
              style={{ padding: "12px 20px", borderRadius: "14px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <DownloadIcon size={16} /> Download PDF
            </button>
            <button onClick={() => handleDownloadStatement("CSV")}
              style={{ padding: "12px 20px", borderRadius: "14px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <DownloadIcon size={16} /> Download CSV
            </button>
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
    </div>
  );
}

export default Wallet;
