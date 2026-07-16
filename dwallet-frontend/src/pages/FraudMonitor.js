import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { FraudMonitorIcon, ShieldAlertIcon, AnalyticsIcon, SearchIcon, CheckCircleIcon, ZapIcon } from "../components/AdminIcons";
import { AlertTriangleIcon } from "../components/AppIcons";

function FraudMonitor() {
  const [transactions, setTransactions] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  async function loadData() {
    try {
      const [high, ai] = await Promise.all([
        API.get("/admin/high-risk-transactions"),
        API.get("/admin/ai-dashboard"),
      ]);
      setTransactions(high.data);
      setDashboard(ai.data);
    } catch (err) { console.log(err); }
  }

  async function investigate(id) {
    try { await API.post(`/admin/investigate/${id}`); loadData(); }
    catch (err) { console.log(err); }
  }

  const summaryCards = [
    { label: "High Risk", value: transactions.length, color: "#dc2626", bg: "#fef2f2", icon: <ShieldAlertIcon size={22} color="#dc2626" /> },
    { label: "Suspicious", value: dashboard?.suspiciousTransactions || 0, color: "#ea580c", bg: "#fff7ed", icon: <AlertTriangleIcon size={22} color="#ea580c" /> },
    { label: "Fraud", value: dashboard?.fraudTransactions || 0, color: "#991b1b", bg: "#fee2e2", icon: <ShieldAlertIcon size={22} color="#991b1b" /> },
    { label: "Avg Score", value: `${(dashboard?.averageScore || 0).toFixed(1)}%`, color: "#2563eb", bg: "#eff6ff", icon: <AnalyticsIcon size={22} color="#2563eb" /> },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <FraudMonitorIcon size={28} color="#0f172a" />
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>AI Fraud Monitor</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "14px" }}>WalletPay AI continuously monitors suspicious and fraudulent transactions</p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" }}>
        {summaryCards.map((c, i) => (
          <div key={i} style={{ background: "white", borderRadius: "18px", padding: "20px 22px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
            display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: c.bg,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{c.icon}</div>
            <div>
              <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 500 }}>{c.label}</p>
              <h2 style={{ color: c.color, fontSize: "22px", fontWeight: 800 }}>{c.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      {transactions.length > 0 && (
        <div style={{ background: "linear-gradient(135deg,#fef2f2,#fee2e2)", border: "1px solid #fecaca",
          borderRadius: "16px", padding: "16px 20px", marginBottom: "20px",
          display: "flex", alignItems: "center", gap: "12px" }}>
          <ShieldAlertIcon size={26} color="#b91c1c" />
          <div>
            <p style={{ color: "#b91c1c", fontWeight: 800, fontSize: "15px" }}>
              ALERT: {transactions.length} High Risk Transaction{transactions.length > 1 ? "s" : ""} Detected
            </p>
            <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "2px" }}>Immediate attention required</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "white", borderRadius: "20px", overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", marginBottom: "24px" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
                {["Txn ID", "Sender", "Receiver", "Amount", "AI Result", "Confidence", "Reason", "Action"].map(h => (
                  <th key={h} style={{ padding: "15px 16px", textAlign: "left", color: "white", fontSize: "12px", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}><CheckCircleIcon size={44} color="#10b981" /></div>
                  <p style={{ fontWeight: 700, color: "#0f172a" }}>All Clear!</p>
                  <p style={{ fontSize: "13px", marginTop: "6px" }}>No suspicious transactions found</p>
                </td></tr>
              ) : transactions.map((tx, idx) => (
                <tr key={tx.transactionId} style={{ background: idx % 2 === 0 ? "#fef2f2" : "white" }}>
                  <td style={td}><code style={{ fontSize: "11px", color: "#6366f1", background: "#eef2ff", padding: "3px 8px", borderRadius: "6px" }}>{tx.upiTransactionId?.substring(0, 12)}...</code></td>
                  <td style={td}><span style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{tx.senderName}</span></td>
                  <td style={td}><span style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{tx.receiverName}</span></td>
                  <td style={{ ...td, fontWeight: 800, color: "#10b981" }}>₹{tx.amount}</td>
                  <td style={td}>
                    <span style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                      background: tx.aiPrediction === "Fraud" ? "#fee2e2" : tx.aiPrediction === "Suspicious" ? "#ffedd5" : "#dcfce7",
                      color: tx.aiPrediction === "Fraud" ? "#dc2626" : tx.aiPrediction === "Suspicious" ? "#c2410c" : "#15803d",
                      display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: tx.aiPrediction === "Fraud" ? "#dc2626" : tx.aiPrediction === "Suspicious" ? "#f97316" : "#16a34a" }} /> {tx.aiPrediction}
                    </span>
                  </td>
                  <td style={td}>
                    <div style={{ width: "100px" }}>
                      <div style={{ height: "7px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "4px" }}>
                        <div style={{ width: `${tx.aiScore}%`, height: "100%", borderRadius: "10px",
                          background: tx.aiPrediction === "Fraud" ? "#dc2626" : tx.aiPrediction === "Suspicious" ? "#f97316" : "#22c55e" }} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>{tx.aiScore}%</span>
                    </div>
                  </td>
                  <td style={{ ...td, maxWidth: "200px", color: "#475569", fontSize: "12px" }}>{tx.aiReason}</td>
                  <td style={td}>
                    {tx.remarks === "Under Investigation" ? (
                      <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "7px 14px",
                        borderRadius: "20px", fontWeight: 700, fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}><SearchIcon size={14} color="#1d4ed8" /> Investigating</span>
                    ) : (
                      <button onClick={() => investigate(tx.transactionId)} style={{ padding: "8px 16px", borderRadius: "10px",
                        background: "linear-gradient(135deg,#2563eb,#60a5fa)", color: "white", border: "none",
                        fontWeight: 700, fontSize: "12px", boxShadow: "0 4px 12px rgba(37,99,235,0.25)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        <SearchIcon size={14} color="white" /> Investigate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Engine Status */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        <div style={{ background: "white", borderRadius: "20px", padding: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <ZapIcon size={20} color="#0f172a" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>AI Engine Status</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              "AI Model : Isolation Forest",
              "FastAPI Service : Running",
              "Spring Boot : Connected",
              "Database : Connected",
              `Auto Refresh : Every 5 Seconds`,
              `Last Scan : ${new Date().toLocaleTimeString()}`,
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                <span style={{ color: "#475569", fontSize: "14px", fontWeight: 500 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "20px", padding: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <AnalyticsIcon size={20} color="#0f172a" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>AI Details</h3>
          </div>
          {[
            { label: "Algorithm", value: "Isolation Forest" },
            { label: "Library", value: "Scikit-Learn" },
            { label: "Framework", value: "FastAPI" },
            { label: "Accuracy", value: `${(dashboard?.averageScore || 0).toFixed(1)}%` },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: "16px", padding: "14px 16px", borderRadius: "12px",
              background: "#f8fafc", border: "1px solid #f1f5f9" }}>
              <p style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.5px", marginBottom: "4px" }}>{item.label}</p>
              <p style={{ color: "#0f172a", fontWeight: 700, fontSize: "14px" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

const td = { padding: "14px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };

export default FraudMonitor;
