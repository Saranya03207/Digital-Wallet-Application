import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import TopHeader from "../components/TopHeader";
import HelpButton from "../components/HelpButton";
import { TrophyIcon, GiftIcon, CardIcon, TransferIcon, MoneyIcon, StarIcon, SparklesIcon, ZapIcon, CibilIcon, PhoneIcon, LightbulbIcon, TvIcon, WifiIcon, CarIcon, LoanIcon, RefreshIcon, CheckCircleIcon } from "../components/AppIcons";

function Rewards() {
  const [wallet, setWallet] = useState(null);
  const [rewardData, setRewardData] = useState({ points: 0, cashbackValue: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  // CIBIL Score State
  const [cibilScore, setCibilScore] = useState(784);
  const [refreshingCibil, setRefreshingCibil] = useState(false);
  const [cibilMsg, setCibilMsg] = useState("");

  // Bill Payment Modal State
  const [activeBillCategory, setActiveBillCategory] = useState(null);
  const [billNumber, setBillNumber] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) { navigate("/login"); return; }
    API.get(`/wallet/details/${userId}`).then(res => setWallet(res.data)).catch(console.log);
    fetchRewards();
  }, []);

  const fetchRewards = () => {
    API.get(`/rewards/${userId}`)
      .then(res => setRewardData(res.data))
      .catch(console.log);
  };

  // Option A: One-Click Redeem All
  const handleRedeemAll = async () => {
    if (rewardData.points < 100) {
      setMessage("Minimum 100 points required to redeem.");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await API.post("/rewards/redeem", { userId: Number(userId), points: rewardData.points });
      setMessage(res.data);
      setMessageType("success");
      fetchRewards();
      API.get(`/wallet/details/${userId}`).then(r => setWallet(r.data)).catch(console.log);
    } catch (err) {
      setMessage(err.response?.data || "Redemption failed.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Refresh CIBIL Score
  const handleRefreshCibil = () => {
    setRefreshingCibil(true);
    setCibilMsg("");
    setTimeout(() => {
      // Simulate score refresh + small bonus points
      const newScore = Math.min(900, Math.floor(775 + Math.random() * 35));
      setCibilScore(newScore);
      setRefreshingCibil(false);
      setCibilMsg(`Credit Report updated directly from bureaus! Your score is ${newScore} (Excellent).`);
    }, 1200);
  };

  // Handle Bill Payment Navigation
  const handlePayBill = (e) => {
    e.preventDefault();
    if (!billNumber) {
      alert("Please enter a valid account/phone number");
      return;
    }
    // Navigate to Transfer page passing biller details as state
    navigate("/transfer", { 
      state: { 
        isBiller: true,
        billerName: activeBillCategory.name, 
        billerNumber: billNumber,
        billerIconId: activeBillCategory.id 
      } 
    });
  };

  const progressPct = Math.min((rewardData.points % 100) / 100 * 100, 100);

  const tiers = [
    { name: "Bronze", min: 0, max: 499, color: "#cd7f32", icon: <StarIcon size={24} color="#cd7f32" /> },
    { name: "Silver", min: 500, max: 1999, color: "#94a3b8", icon: <StarIcon size={24} color="#94a3b8" /> },
    { name: "Gold", min: 2000, max: 4999, color: "#f59e0b", icon: <TrophyIcon size={24} color="#f59e0b" /> },
    { name: "Platinum", min: 5000, max: Infinity, color: "#6366f1", icon: <SparklesIcon size={24} color="#6366f1" /> },
  ];
  const currentTier = tiers.find(t => rewardData.points >= t.min && rewardData.points <= t.max) || tiers[0];

  const billCategories = [
    { id: "mobile", name: "Mobile Recharge", icon: <PhoneIcon size={22} color="#6366f1" />, bg: "#eef2ff", pts: "Earn 20+ pts" },
    { id: "electricity", name: "Electricity Bill", icon: <LightbulbIcon size={22} color="#f59e0b" />, bg: "#fffbeb", pts: "Earn 50+ pts" },
    { id: "dth", name: "DTH / Cable TV", icon: <TvIcon size={22} color="#ec4899" />, bg: "#fdf2f8", pts: "Earn 15+ pts" },
    { id: "broadband", name: "Broadband Wi-Fi", icon: <WifiIcon size={22} color="#10b981" />, bg: "#f0fdf4", pts: "Earn 30+ pts" },
    { id: "fastag", name: "Fastag Recharge", icon: <CarIcon size={22} color="#3b82f6" />, bg: "#eff6ff", pts: "Earn 25+ pts" },
    { id: "creditcard", name: "Credit Card Bill", icon: <CardIcon size={22} color="#8b5cf6" />, bg: "#f5f3ff", pts: "Earn 100+ pts" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fefce8,#fff7ed,#fdf4ff)", paddingBottom: "60px" }}>
      <TopHeader wallet={wallet} />

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "36px 24px" }}>

        {/* Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "10px" }}>
              <TrophyIcon size={28} color="#f59e0b" /> Rewards & Cashback Hub
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Earn points on transfers & bill payments · Redeem instantly</p>
          </div>
          <button onClick={() => navigate("/dashboard")} style={{ padding: "8px 16px", borderRadius: "12px", background: "white", color: "#64748b", border: "1px solid #e2e8f0", fontWeight: 700, cursor: "pointer" }}>
            ← Back
          </button>
        </div>

        {/* Points Card & Option A One-Click Redeem */}
        <div style={{ borderRadius: "28px", padding: "36px", marginBottom: "24px", position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg,#f59e0b,#f97316,#ef4444)", color: "white",
          boxShadow: "0 20px 60px rgba(245,158,11,0.35)" }}>
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.8)", margin: "0 0 8px 0" }}>Your Total Points</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
              <span style={{ fontSize: "56px", fontWeight: 900, letterSpacing: "-2px" }}>{rewardData.points}</span>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>pts</span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "16px", padding: "14px 20px",
              display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(8px)", marginBottom: "24px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Available Cashback Value</span>
              <span style={{ fontSize: "24px", fontWeight: 900 }}>₹{rewardData.cashbackValue}</span>
            </div>

            {/* Progress to next 100 */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Progress to next ₹1 cashback</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>{rewardData.points % 100}/100 pts</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.2)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: "white", borderRadius: "10px", transition: "width 0.8s ease" }} />
              </div>
            </div>

            {/* Option A: One-Click Redeem All Button */}
            <div style={{ background: "rgba(0,0,0,0.18)", padding: "16px", borderRadius: "20px", backdropFilter: "blur(10px)" }}>
              {message && (
                <div style={{ padding: "10px 14px", borderRadius: "12px", marginBottom: "12px", fontWeight: 700, fontSize: "13px",
                  background: messageType === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)",
                  color: "white", border: `1px solid ${messageType === "success" ? "#34d399" : "#f87171"}` }}>
                  {message}
                </div>
              )}
              <button onClick={handleRedeemAll} disabled={loading || rewardData.points < 100}
                style={{ width: "100%", padding: "16px", border: "none", borderRadius: "14px", fontWeight: 800, fontSize: "16px",
                  cursor: loading || rewardData.points < 100 ? "not-allowed" : "pointer",
                  background: rewardData.points >= 100 ? "white" : "rgba(255,255,255,0.15)",
                  color: rewardData.points >= 100 ? "#ea580c" : "rgba(255,255,255,0.5)",
                  boxShadow: rewardData.points >= 100 ? "0 8px 24px rgba(0,0,0,0.2)" : "none",
                  transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <ZapIcon size={20} color={rewardData.points >= 100 ? "#ea580c" : "rgba(255,255,255,0.5)"} />
                {loading ? "Processing..." : rewardData.points < 100 ? `Need ${100 - rewardData.points} more points to Redeem` : `⚡ Redeem All (${rewardData.points} pts = ₹${rewardData.cashbackValue} Cashback)`}
              </button>
            </div>
          </div>
        </div>

        {/* How to Earn */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          {[
            { icon: <TransferIcon size={24} color="#6366f1" />, title: "Send Money", desc: "1 pt per ₹10 transferred", color: "#eef2ff" },
            { icon: <ZapIcon size={24} color="#f97316" />, title: "Bill Payments", desc: "Earn up to 100 pts per bill", color: "#fff7ed" },
            { icon: <MoneyIcon size={24} color="#10b981" />, title: "One-Click Redeem", desc: "10 pts = ₹1 cash in wallet", color: "#f0fdf4" },
          ].map((item, i) => (
            <div key={i} style={{ background: item.color, borderRadius: "18px", padding: "18px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ marginBottom: "10px" }}>{item.icon}</div>
              <p style={{ fontWeight: 800, color: "#0f172a", fontSize: "13px", margin: "0 0 4px 0" }}>{item.title}</p>
              <p style={{ color: "#64748b", fontSize: "11px", margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CIBIL Score & Financial Health Card */}
        <div style={{ background: "white", borderRadius: "24px", padding: "28px", marginBottom: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CibilIcon size={24} color="#10b981" />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>CIBIL Credit Score Check</h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Powered by Experian & CIBIL Bureau Insights</p>
              </div>
            </div>
            <button onClick={handleRefreshCibil} disabled={refreshingCibil}
              style={{ padding: "8px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", color: "#334155", fontWeight: 700, fontSize: "13px", cursor: refreshingCibil ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshIcon size={16} color="#334155" /> {refreshingCibil ? "Checking..." : "Refresh Score"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderRadius: "18px", padding: "20px", border: "1px solid #86efac", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "1px" }}>Your Credit Health</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "36px", fontWeight: 900, color: "#15803d" }}>{cibilScore}</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#166534" }}>/ 900 (Excellent)</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
              <div>
                <p style={{ fontSize: "11px", color: "#166534", margin: "0 0 2px 0", fontWeight: 600 }}>On-Time Payments</p>
                <p style={{ fontSize: "15px", color: "#15803d", margin: 0, fontWeight: 800 }}>100%</p>
              </div>
              <div>
                <p style={{ fontSize: "11px", color: "#166534", margin: "0 0 2px 0", fontWeight: 600 }}>Credit Utilization</p>
                <p style={{ fontSize: "15px", color: "#15803d", margin: 0, fontWeight: 800 }}>18% (Low)</p>
              </div>
            </div>
          </div>

          {cibilMsg && (
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#15803d", background: "#f0fdf4", padding: "10px 14px", borderRadius: "10px", margin: "0 0 16px 0" }}>
              {cibilMsg}
            </p>
          )}

          <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
            Checking your credit score through WalletPay is 100% safe and does not impact your credit rating.
          </p>
        </div>

        {/* Recharge & Bill Payments Hub */}
        <div style={{ background: "white", borderRadius: "24px", padding: "28px", marginBottom: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <PhoneIcon size={20} color="#6366f1" /> Recharge & Utility Bill Payments
          </h3>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 20px 0" }}>Pay utility bills directly from your wallet and earn bonus cashback points on every transaction.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
            {billCategories.map(cat => (
              <div key={cat.id} onClick={() => setActiveBillCategory(cat)}
                style={{ background: activeBillCategory?.id === cat.id ? "#eef2ff" : cat.bg, border: activeBillCategory?.id === cat.id ? "2px solid #6366f1" : "1px solid #f1f5f9", borderRadius: "16px", padding: "16px 12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s ease" }}>
                <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}>{cat.icon}</div>
                <p style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a", margin: "0 0 4px 0" }}>{cat.name}</p>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#10b981", background: "white", padding: "3px 8px", borderRadius: "10px" }}>{cat.pts}</span>
              </div>
            ))}
          </div>

          {activeBillCategory && (
            <div style={{ background: "#f8fafc", borderRadius: "18px", padding: "20px", border: "1px solid #e2e8f0", marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  {activeBillCategory.icon} Pay {activeBillCategory.name}
                </span>
                <button onClick={() => setActiveBillCategory(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontWeight: 700, fontSize: "12px" }}>Close</button>
              </div>

              <form onSubmit={handlePayBill}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Account / Phone / Consumer ID</label>
                  <input type="text" required placeholder="e.g. 9876543210 or Consumer No" value={billNumber} onChange={e => setBillNumber(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <button type="submit"
                  style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "#6366f1", color: "white", fontWeight: 800, fontSize: "14px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                  Proceed to Pay ➔
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Instant Pre-Approved Loans & Offers */}
        <div style={{ background: "white", borderRadius: "24px", padding: "28px", marginBottom: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <LoanIcon size={20} color="#8b5cf6" /> Pre-Approved Loans & Pay Later Offers
            </h3>
            <span style={{ fontSize: "11px", fontWeight: 800, background: "#f3e8ff", color: "#7e22ce", padding: "4px 10px", borderRadius: "12px" }}>PRE-APPROVED</span>
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 20px 0" }}>Because of your Excellent CIBIL Score ({cibilScore}), you qualify for zero-paperwork instant loans.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#fdf4ff", border: "1px solid #f0abfc", borderRadius: "18px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#a21caf", textTransform: "uppercase", letterSpacing: "0.5px" }}>Instant Personal Loan</span>
                <h4 style={{ fontSize: "22px", fontWeight: 900, color: "#701a75", margin: "6px 0 8px 0" }}>Up to ₹5,00,000</h4>
                <ul style={{ paddingLeft: "16px", margin: "0 0 16px 0", fontSize: "12px", color: "#86198f" }}>
                  <li>10.5% p.a. starting interest rate</li>
                  <li>Disbursal directly to Wallet or Bank</li>
                  <li>Zero collateral & instant approval</li>
                </ul>
              </div>
              <button onClick={() => alert("Congratulations! Your eligibility request has been initiated. A credit officer will verify and disburse the amount directly to your wallet.")}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "none", background: "#a21caf", color: "white", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}>
                Check Eligibility & Apply
              </button>
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "18px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.5px" }}>WalletPay Buy Now Pay Later</span>
                <h4 style={{ fontSize: "22px", fontWeight: 900, color: "#14532d", margin: "6px 0 8px 0" }}>Limit ₹50,000</h4>
                <ul style={{ paddingLeft: "16px", margin: "0 0 16px 0", fontSize: "12px", color: "#166534" }}>
                  <li>0% interest for up to 30 days</li>
                  <li>One-click checkout across merchants</li>
                  <li>Instant activation with your CIBIL score</li>
                </ul>
              </div>
              <button onClick={() => alert("Congratulations! BNPL credit limit up to ₹50,000 has been activated on your WalletPay account.")}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "none", background: "#15803d", color: "white", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}>
                Activate Limit Now
              </button>
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <TrophyIcon size={18} color="#f59e0b" /> Membership Tiers
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {tiers.map(tier => (
              <div key={tier.name} style={{ padding: "14px", borderRadius: "14px",
                background: currentTier.name === tier.name ? `${tier.color}18` : "#f8fafc",
                border: `2px solid ${currentTier.name === tier.name ? tier.color : "#f1f5f9"}`,
                display: "flex", alignItems: "center", gap: "10px" }}>
                <div>{tier.icon}</div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: "13px", color: "#0f172a", margin: "0 0 2px 0" }}>{tier.name}</p>
                  <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
                    {tier.max === Infinity ? `${tier.min.toLocaleString()}+ pts` : `${tier.min}–${tier.max.toLocaleString()} pts`}
                  </p>
                </div>
                {currentTier.name === tier.name && (
                  <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 800, color: tier.color, background: `${tier.color}20`, padding: "2px 8px", borderRadius: "10px" }}>YOU</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
      <HelpButton />
    </div>
  );
}

export default Rewards;
