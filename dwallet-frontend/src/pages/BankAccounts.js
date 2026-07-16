import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import TopHeader from "../components/TopHeader";

function BankAccounts() {
  const [banks, setBanks] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const navigate = useNavigate();

  // Form Fields
  const [bankName, setBankName] = useState("State Bank of India");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const bankOptions = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Punjab National Bank",
    "Canara Bank",
    "Bank of Baroda"
  ];

  // Fetch linked bank accounts
  const fetchBanks = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await API.get(`/bank/list/${userId}`);
      if (Array.isArray(res.data)) {
        setBanks(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    API.get(`/wallet/details/${userId}`)
      .then(res => setWallet(res.data))
      .catch(err => console.log(err));

    fetchBanks();
  }, []);

  const handleLinkBank = async (e) => {
    e.preventDefault();
    if (!accountNumber || !confirmAccountNumber || !ifscCode || !accountHolderName) {
      alert("Please fill in all input fields.");
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      alert("❌ Account Numbers do not match!");
      return;
    }
    if (accountNumber.length < 9 || accountNumber.length > 18) {
      alert("❌ Account Number must be between 9 and 18 digits.");
      return;
    }
    // IFSC Regex validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      alert("❌ Invalid IFSC Code format. E.g. SBIN0001234");
      return;
    }

    setSubmitting(true);
    try {
      const userId = localStorage.getItem("userId");
      await API.post("/bank/link", {
        userId: Number(userId),
        bankName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        accountHolderName
      });

      alert("🎉 Bank Account linked successfully!");
      // Reset form
      setAccountNumber("");
      setConfirmAccountNumber("");
      setIfscCode("");
      setAccountHolderName("");
      setShowLinkForm(false);
      fetchBanks();
    } catch (err) {
      alert(err.response?.data || "Failed to link bank account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlinkBank = async (id) => {
    if (!window.confirm("Are you sure you want to unlink this bank account?")) return;
    try {
      await API.delete(`/bank/unlink/${id}`);
      alert("🗑️ Bank Account unlinked successfully!");
      fetchBanks();
    } catch (err) {
      alert("Failed to unlink bank account. Please try again.");
    }
  };

  const getBankGradient = (name) => {
    switch (name) {
      case "State Bank of India":
        return "linear-gradient(135deg, #1e3a8a, #3b82f6)";
      case "ICICI Bank":
        return "linear-gradient(135deg, #ea580c, #f97316)";
      case "HDFC Bank":
        return "linear-gradient(135deg, #1e1b4b, #4338ca)";
      case "Axis Bank":
        return "linear-gradient(135deg, #881337, #db2777)";
      default:
        return "linear-gradient(135deg, #1e293b, #475569)";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8faff,#eef2ff,#f0fdf4)" }}>
      <TopHeader wallet={wallet} />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "36px 24px" }}>
        
        {/* Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>🏦 Bank Accounts</h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Link and manage your bank accounts for deposits and withdrawals</p>
          </div>
          <button 
            onClick={() => setShowLinkForm(!showLinkForm)} 
            style={{ 
              padding: "10px 20px", 
              borderRadius: "12px", 
              background: "linear-gradient(135deg,#4f46e5,#7c3aed)", 
              color: "white", 
              border: "none", 
              fontWeight: 700, 
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)"
            }}
          >
            {showLinkForm ? "✕ Cancel" : "+ Link Bank"}
          </button>
        </div>

        {showLinkForm && (
          <div style={{ background: "white", borderRadius: "24px", padding: "28px", marginBottom: "28px", boxShadow: "0 8px 32px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#0f172a", fontWeight: "800" }}>Link New Bank Account</h3>
            
            <form onSubmit={handleLinkBank} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Select Bank</label>
                  <select 
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                  >
                    {bankOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Account Holder Name</label>
                  <input 
                    type="text" 
                    placeholder="As shown in passbook"
                    required
                    value={accountHolderName}
                    onChange={e => setAccountHolderName(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Account Number</label>
                  <input 
                    type="password" 
                    placeholder="Enter Account Number"
                    required
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>Confirm Account Number</label>
                  <input 
                    type="text" 
                    placeholder="Re-enter Account Number"
                    required
                    value={confirmAccountNumber}
                    onChange={e => setConfirmAccountNumber(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>IFSC Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. SBIN0001234"
                  required
                  value={ifscCode}
                  onChange={e => setIfscCode(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                style={{ 
                  padding: "12px", 
                  borderRadius: "10px", 
                  border: "none", 
                  background: "linear-gradient(135deg, #10b981, #059669)", 
                  color: "white", 
                  fontWeight: "700", 
                  cursor: "pointer", 
                  marginTop: "10px",
                  fontSize: "14px"
                }}
              >
                {submitting ? "Linking..." : "🔗 Securely Link Bank Account"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#64748b" }}>Loading linked bank accounts...</p>
          </div>
        ) : banks.length === 0 ? (
          <div style={{ background: "white", borderRadius: "24px", padding: "48px 24px", textAlign: "center", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>🏦</span>
            <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "18px" }}>No Linked Bank Accounts</h3>
            <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "14px" }}>
              Link your bank account to add money to your wallet or withdraw funds seamlessly.
            </p>
            <button 
              onClick={() => setShowLinkForm(true)} 
              style={{ 
                padding: "10px 24px", 
                borderRadius: "12px", 
                border: "none", 
                background: "#4f46e5", 
                color: "white", 
                fontWeight: "700", 
                cursor: "pointer" 
              }}
            >
              + Link Now
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {banks.map(bank => {
              const last4 = bank.accountNumber.slice(-4);
              return (
                <div 
                  key={bank.id} 
                  style={{
                    background: getBankGradient(bank.bankName),
                    borderRadius: "20px",
                    padding: "24px",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "180px",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>{bank.bankName}</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.5px" }}>SAVINGS ACCOUNT</p>
                    </div>
                    <span style={{ fontSize: "24px" }}>🏦</span>
                  </div>

                  <div>
                    <p style={{ margin: 0, fontSize: "18px", letterSpacing: "3px", fontWeight: "700" }}>•••• •••• {last4}</p>
                    <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "rgba(255,255,255,0.8)" }}>IFSC: {bank.ifscCode}</p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "12px", marginTop: "8px" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>ACCOUNT HOLDER</p>
                      <p style={{ margin: 0, fontSize: "12px", fontWeight: "600" }}>{bank.accountHolderName}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleUnlinkBank(bank.id)}
                      style={{ 
                        background: "rgba(255, 68, 68, 0.2)", 
                        color: "#ff8888", 
                        border: "1px solid rgba(255,68,68,0.3)", 
                        borderRadius: "8px", 
                        padding: "4px 10px", 
                        fontSize: "11px", 
                        fontWeight: "700", 
                        cursor: "pointer" 
                      }}
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default BankAccounts;
