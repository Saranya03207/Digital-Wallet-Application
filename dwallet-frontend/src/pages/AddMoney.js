import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import TopHeader from "../components/TopHeader";

function AddMoney() {
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [wallet, setWallet] = useState(null);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    API.get(`/wallet/details/${userId}`)
      .then(res => setWallet(res.data))
      .catch(err => console.log(err));

    API.get(`/bank/list/${userId}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setBanks(res.data);
          if (res.data.length > 0) {
            const first = res.data[0];
            setSelectedBank(`${first.bankName} •••• ${first.accountNumber.slice(-4)}`);
          }
        }
      })
      .catch(err => console.log(err));
  }, []);

  async function handleAddMoney(e) {
    e.preventDefault();
    if (banks.length === 0) {
      alert("Please link a bank account first");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount greater than zero");
      return;
    }
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const response = await API.post("/wallet/add-money", {
        userId: Number(userId),
        amount: Number(amount),
        selectedBank,
        transactionPin: transactionPin || null
      });
      alert(response.data);
      if (response.data && response.data.includes("Successfully")) {
        setAmount("");
        setTransactionPin("");
        const updated = await API.get(`/wallet/details/${userId}`);
        setWallet(updated.data);
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data || "Failed To Add Money");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8faff,#eef2ff,#f0fdf4)" }}>
      <TopHeader wallet={wallet} />

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "36px 24px" }}>

        {/* Page Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>💰 Add Money</h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Top up your wallet instantly from your linked bank account</p>
          </div>
          <button onClick={() => navigate("/dashboard")} style={{ padding: "8px 16px", borderRadius: "12px", background: "white", color: "#64748b", border: "1px solid #e2e8f0", fontWeight: 700, cursor: "pointer" }}>
            ← Back
          </button>
        </div>

        {/* Balance Card */}
        <div style={{ borderRadius: "24px", padding: "28px 32px", marginBottom: "24px", position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "white",
          boxShadow: "0 16px 48px rgba(99,102,241,0.3)" }}>
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "140px", height: "140px",
            borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>Current Balance</p>
          <h2 style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-1px", margin: 0 }}>₹{wallet?.balance ?? 0}</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginTop: "10px", margin: 0 }}>{wallet?.user?.upiId}</p>
        </div>

        {/* Form Card */}
        <div style={{ background: "white", borderRadius: "24px", padding: "36px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" }}>

          <form onSubmit={handleAddMoney}>
            
            {/* Bank Grid */}
            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
              Select Source Bank Account
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {banks.length === 0 ? (
                <div style={{ background: "#fff5f5", border: "1px solid #fee2e2", borderRadius: "16px", padding: "20px", textAlign: "center", gridColumn: "1 / -1" }}>
                  <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: "700", margin: "0 0 12px 0" }}>No linked bank accounts found</p>
                  <button onClick={() => navigate("/bank-accounts")} type="button" 
                    style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "white", padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "13px", boxShadow: "0 4px 12px rgba(99,102,241,0.2)" }}>
                    + Link Bank Account Now
                  </button>
                </div>
              ) : (
                banks.map(bank => {
                  const last4 = bank.accountNumber.slice(-4);
                  const id = `${bank.bankName} •••• ${last4}`;
                  return (
                    <div key={bank.id} onClick={() => setSelectedBank(id)}
                      style={{
                        padding: "16px", borderRadius: "16px", cursor: "pointer",
                        border: selectedBank === id ? "2px solid #6366f1" : "2px solid #f1f5f9",
                        background: selectedBank === id ? "#eef2ff" : "#f8fafc",
                        transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: "12px"
                      }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        🏦
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", margin: "0 0 2px 0" }}>{bank.bankName}</p>
                        <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>•••• {last4}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
              Enter Amount (₹)
            </label>

            <div style={{ position: "relative", marginBottom: "16px" }}>
              <span style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)",
                fontSize: "22px", fontWeight: 700, color: "#6366f1" }}>₹</span>
              <input type="number" placeholder="0.00" value={amount}
                onChange={e => setAmount(e.target.value)} required min="1"
                style={{ width: "100%", padding: "16px 18px 16px 44px", borderRadius: "14px",
                  border: "2px solid #e2e8f0", fontSize: "22px", fontWeight: 700,
                  background: "#f8fafc", color: "#0f172a", outline: "none" }} />
            </div>

            {/* Quick Amounts */}
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", marginBottom: "10px" }}>Quick Select</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
              {quickAmounts.map(val => (
                <button type="button" key={val} onClick={() => setAmount(val)}
                  style={{ padding: "8px 16px", borderRadius: "10px", border: "none",
                    background: Number(amount) === val ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#eef2ff",
                    color: Number(amount) === val ? "white" : "#6366f1",
                    fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 0.2s ease" }}>
                  ₹{val.toLocaleString()}
                </button>
              ))}
            </div>

            {/* UPI PIN verification (Optional if required by bank) */}
            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
              UPI PIN (Optional for verified deposits)
            </label>
            <input
              type="password"
              maxLength="4"
              placeholder="• • • •"
              value={transactionPin}
              onChange={e => setTransactionPin(e.target.value)}
              style={{
                width: "100%", padding: "16px", borderRadius: "14px", border: "2px solid #e2e8f0",
                fontSize: "20px", fontWeight: 700, letterSpacing: "8px", textAlign: "center",
                background: "#f8fafc", color: "#0f172a", marginBottom: "28px", outline: "none"
              }}
            />

            <button type="submit" disabled={loading || banks.length === 0}
              style={{ width: "100%", padding: "18px", border: "none", borderRadius: "16px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
                fontSize: "16px", fontWeight: 800, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(99,102,241,0.35)", opacity: (loading || banks.length === 0) ? 0.6 : 1 }}>
              {loading ? "Processing Deposit..." : "💰 Confirm & Deposit Funds"}
            </button>
          </form>

          {/* Info Note */}
          <div style={{ marginTop: "20px", padding: "14px 18px", borderRadius: "12px",
            background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "16px" }}>ℹ️</span>
            <p style={{ color: "#15803d", fontSize: "13px", fontWeight: 500 }}>
              Money is added instantly to your wallet. No additional charges apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddMoney;
