import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { TransactionsIcon, AnalyticsIcon, CheckCircleIcon, ShieldAlertIcon, SearchIcon, WalletIcon } from "../components/AdminIcons";
import { AlertTriangleIcon, CheckIcon, CloseIcon, RefundIcon } from "../components/AppIcons";

function StatusBadge({ status, disputeStatus }) {
  if (disputeStatus === "RAISED" || status === "DISPUTED") {
    return (
      <span style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a",
        padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <AlertTriangleIcon size={14} color="#b45309" /> DISPUTED
      </span>
    );
  }
  if (disputeStatus === "REFUNDED" || status === "REFUNDED") {
    return (
      <span style={{ background: "#e0e7ff", color: "#4338ca", border: "1px solid #c7d2fe",
        padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <RefundIcon size={14} color="#4338ca" /> REFUNDED
      </span>
    );
  }
  const map = {
    SUCCESS: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    FAILED: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    PENDING: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
      {status || "—"}
    </span>
  );
}

function RiskBadge({ risk }) {
  if (!risk) return <span style={{ color: "#94a3b8", fontSize: "13px" }}>Not Analysed</span>;
  const map = {
    Normal: { bg: "#f0fdf4", color: "#15803d", dot: "#10b981" },
    Suspicious: { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
    Fraud: { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  };
  const s = map[risk] || { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "5px 12px",
      borderRadius: "20px", fontSize: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.dot }} /> {risk}
    </span>
  );
}

function ConfidenceBar({ score }) {
  if (score == null) return <span style={{ color: "#94a3b8" }}>—</span>;
  const color = score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ width: "110px" }}>
      <div style={{ height: "7px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "4px" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: "10px", transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: "12px", fontWeight: 700, color }}>{score.toFixed(1)}%</span>
    </div>
  );
}

function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [dashboard, setDashboard] = useState({ totalTransactions: 0, analysedTransactions: 0, normalTransactions: 0, suspiciousTransactions: 0, fraudTransactions: 0, averageScore: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchAll = () => {
    API.get("/admin/transactions").then(res => setTransactions(res.data)).catch(console.log);
    API.get("/admin/ai-dashboard").then(res => setDashboard(res.data)).catch(console.log);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDisputeAction = async (transactionId, actionType) => {
    const remark = prompt(`Enter admin remark for ${actionType}:`, actionType === "REFUND" ? "Refund approved after security verification" : "Claim rejected after investigation");
    if (remark === null) return;

    setLoadingAction(true);
    try {
      const res = await API.post("/wallet/dispute/resolve", {
        transactionId,
        action: actionType,
        adminRemark: remark || actionType
      });
      alert(res.data || "Dispute resolved successfully");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to resolve dispute");
    } finally {
      setLoadingAction(false);
    }
  };

  const filtered = transactions.filter(tx => {
    const matchSearch = tx.upiTransactionId?.toLowerCase().includes(search.toLowerCase()) ||
      tx.senderName?.toLowerCase().includes(search.toLowerCase()) ||
      tx.receiverName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || tx.transactionStatus === statusFilter || (statusFilter === "DISPUTED" && tx.disputeStatus === "RAISED");
    return matchSearch && matchStatus;
  });

  const summaryCards = [
    { label: "Total", value: dashboard.totalTransactions, color: "#6366f1", icon: <TransactionsIcon size={24} color="#6366f1" /> },
    { label: "AI Analysed", value: dashboard.analysedTransactions, color: "#0ea5e9", icon: <ShieldAlertIcon size={24} color="#0ea5e9" /> },
    { label: "Normal", value: dashboard.normalTransactions, color: "#10b981", icon: <CheckCircleIcon size={24} color="#10b981" /> },
    { label: "Suspicious", value: dashboard.suspiciousTransactions, color: "#f97316", icon: <AlertTriangleIcon size={24} color="#f97316" /> },
    { label: "Avg Score", value: (dashboard.averageScore || 0).toFixed(1) + "%", color: "#8b5cf6", icon: <AnalyticsIcon size={24} color="#8b5cf6" /> },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <TransactionsIcon size={28} color="#0f172a" />
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Transaction Monitoring</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "14px" }}>Monitor every transaction processed by WalletPay AI and resolve disputes</p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "14px", marginBottom: "24px" }}>
        {summaryCards.map((c, i) => (
          <div key={i} style={{ background: "white", borderRadius: "18px", padding: "18px 20px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
            <div style={{ marginBottom: "8px" }}>{c.icon}</div>
            <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 500, marginBottom: "4px" }}>{c.label}</p>
            <h2 style={{ color: c.color, fontSize: "22px", fontWeight: 800 }}>{c.value}</h2>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}><SearchIcon size={18} color="#94a3b8" /></span>
          <input placeholder="Search by transaction ID, sender or receiver..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "13px 18px 13px 40px", borderRadius: "12px",
              border: "2px solid #e2e8f0", fontSize: "14px", background: "white", color: "#0f172a", outline: "none" }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "13px 18px", borderRadius: "12px", border: "2px solid #e2e8f0",
            fontSize: "14px", background: "white", color: "#0f172a", fontWeight: 600, minWidth: "160px", outline: "none" }}>
          <option value="ALL">All Status</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
          <option value="PENDING">PENDING</option>
          <option value="DISPUTED">DISPUTED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "20px", overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1100px" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
                {["Txn ID", "Sender", "Receiver", "Amount", "Status", "AI Result", "Confidence", "Reason", "Date", "Dispute Action"].map(h => (
                  <th key={h} style={{ padding: "15px 16px", textAlign: "left", color: "white", fontSize: "12px", fontWeight: 700, letterSpacing: "0.3px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, idx) => (
                <tr key={tx.transactionId} style={{ background: idx % 2 === 0 ? "#f8fafc" : "white" }}>
                  <td style={td}><code style={{ fontSize: "11px", color: "#6366f1", background: "#eef2ff", padding: "3px 8px", borderRadius: "6px" }}>{tx.upiTransactionId?.substring(0, 12)}...</code></td>
                  <td style={td}><span style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{tx.senderName}</span></td>
                  <td style={td}><span style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{tx.receiverName}</span></td>
                  <td style={{ ...td, fontWeight: 800, color: "#10b981", fontSize: "14px" }}>₹{tx.amount}</td>
                  <td style={td}><StatusBadge status={tx.transactionStatus} disputeStatus={tx.disputeStatus} /></td>
                  <td style={td}><RiskBadge risk={tx.aiPrediction} /></td>
                  <td style={td}><ConfidenceBar score={tx.aiScore} /></td>
                  <td style={{ ...td, maxWidth: "180px", color: "#475569", fontSize: "12px" }}>{tx.aiReason || "—"}</td>
                  <td style={{ ...td, color: "#64748b", fontSize: "12px", whiteSpace: "nowrap" }}>
                    {new Date(tx.transactionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                  </td>
                  <td style={td}>
                    {tx.disputeStatus === "RAISED" ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button disabled={loadingAction} onClick={() => handleDisputeAction(tx.transactionId, "REFUND")}
                          style={{ padding: "6px 10px", borderRadius: "8px", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontWeight: 700, fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckIcon size={14} color="#15803d" /> Refund
                        </button>
                        <button disabled={loadingAction} onClick={() => handleDisputeAction(tx.transactionId, "REJECT")}
                          style={{ padding: "6px 10px", borderRadius: "8px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", fontWeight: 700, fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                          <CloseIcon size={14} color="#dc2626" /> Reject
                        </button>
                      </div>
                    ) : tx.disputeStatus === "REFUNDED" ? (
                      <span style={{ fontSize: "11px", color: "#15803d", fontWeight: 600 }}>Refunded</span>
                    ) : tx.disputeStatus === "REJECTED" ? (
                      <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600 }}>Rejected</span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>No Dispute</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}><TransactionsIcon size={40} color="#94a3b8" /></div>
                  <p style={{ fontWeight: 600 }}>No transactions found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

const td = { padding: "14px 16px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" };

export default AdminTransactions;
