import { useEffect, useState } from "react";
import API from "../services/api";
import TopHeader from "../components/TopHeader";
import { HistoryIcon, TransferIcon, ReceiveIcon, DownloadIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, WalletIcon } from "../components/AppIcons";

function History() {
  const [transactions, setTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    API.get(`/wallet/details/${userId}`).then(res => setWallet(res.data)).catch(console.log);
    API.get(`/wallet/history/${userId}`)
      .then(res => setTransactions(Array.isArray(res.data) ? res.data : []))
      .catch(console.log);
  }, []);

  function getAmountDisplay(tx) {
    const uid = Number(localStorage.getItem("userId"));
    if (tx.transactionType === "ADD_MONEY") return `+₹${tx.amount}`;
    if (tx.transactionType === "TRANSFER") return tx.receiver?.id === uid ? `+₹${tx.amount}` : `-₹${tx.amount}`;
    return `₹${tx.amount}`;
  }

  function getAmountColor(tx) {
    const uid = Number(localStorage.getItem("userId"));
    if (tx.transactionType === "ADD_MONEY") return "#10b981";
    if (tx.transactionType === "TRANSFER") return tx.receiver?.id === uid ? "#10b981" : "#ef4444";
    return "#64748b";
  }

  function getTxIcon(type, tx) {
    const uid = Number(localStorage.getItem("userId"));
    if (type === "ADD_MONEY") return { icon: <WalletIcon size={22} color="white" />, bg: "linear-gradient(135deg,#6366f1,#8b5cf6)" };
    if (type === "TRANSFER" && tx?.receiver?.id === uid) return { icon: <ReceiveIcon size={22} color="white" />, bg: "linear-gradient(135deg,#10b981,#34d399)" };
    return { icon: <TransferIcon size={22} color="white" />, bg: "linear-gradient(135deg,#f97316,#fb923c)" };
  }

  function getTxLabel(tx) {
    if (tx.transactionType === "ADD_MONEY") return "Money Added";
    const uid = Number(localStorage.getItem("userId"));
    if (tx.transactionType === "TRANSFER") return tx.receiver?.id === uid ? "Received" : "Sent";
    return "Transaction";
  }

  async function downloadStatement() {
    try {
      const userId = localStorage.getItem("userId");
      const response = await API.get(`/wallet/statement/${userId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "WalletPay_Statement.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log(error);
      alert("Unable to download statement");
    }
  }

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedTxForDispute, setSelectedTxForDispute] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);

  const uid = Number(localStorage.getItem("userId"));
  const filtered = filter === "ALL" 
    ? transactions 
    : filter === "RECEIVE" 
      ? transactions.filter(t => t.transactionType === "TRANSFER" && t.receiver?.id === uid)
      : filter === "TRANSFER" 
        ? transactions.filter(t => t.transactionType === "TRANSFER" && t.sender?.id === uid)
        : transactions.filter(t => t.transactionType === filter);

  const filters = [
    { key: "ALL", label: "All" },
    { key: "RECEIVE", label: "Receive" },
    { key: "TRANSFER", label: "Transfer" },
  ];

  const handleDownload = (type) => {
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

  const handleRaiseDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeReason || !disputeReason.trim() || !selectedTxForDispute) return;
    setDisputeLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const res = await API.post("/wallet/dispute/raise", {
        transactionId: selectedTxForDispute.transactionId,
        userId: Number(userId),
        reason: disputeReason.trim()
      });
      alert(res.data || "Dispute raised successfully");
      setShowDisputeModal(false);
      setDisputeReason("");
      setSelectedTxForDispute(null);
      const updated = await API.get(`/wallet/history/${userId}`);
      setTransactions(Array.isArray(updated.data) ? updated.data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to raise dispute");
    } finally {
      setDisputeLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8faff,#eef2ff,#f0fdf4)" }}>
      <TopHeader wallet={wallet} />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "36px 24px" }}>

        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HistoryIcon size={26} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Transaction History</h1>
              <p style={{ color: "#64748b", fontSize: "14px" }}>{transactions.length} total transactions</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => handleDownload("PDF")} style={{ padding: "10px 18px", borderRadius: "14px",
              background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2",
              fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <DownloadIcon size={16} /> PDF Statement
            </button>
            <button onClick={() => handleDownload("CSV")} style={{ padding: "10px 18px", borderRadius: "14px",
              background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none",
              fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.3)", display: "flex", alignItems: "center", gap: "6px" }}>
              <DownloadIcon size={16} /> CSV Spreadsheet
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "9px 20px", borderRadius: "30px",
              border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer",
              background: filter === f.key ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "white",
              color: filter === f.key ? "white" : "#64748b",
              boxShadow: filter === f.key ? "0 4px 14px rgba(99,102,241,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.2s ease" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px", background: "white", borderRadius: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}><HistoryIcon size={52} color="#94a3b8" /></div>
            <p style={{ fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>No transactions found</p>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "6px" }}>Try a different filter</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map(tx => {
              const { icon, bg } = getTxIcon(tx.transactionType, tx);
              return (
                <div key={tx.transactionId} style={{ background: "white", borderRadius: "20px", padding: "20px 24px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
                  transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0 }}>{icon}</div>
                      <div>
                        <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px" }}>{getTxLabel(tx)}</p>
                        {tx.transactionType === "TRANSFER" && (
                          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "3px" }}>
                            {tx.sender?.fullName} → {tx.receiver?.fullName}
                          </p>
                        )}
                        <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
                          {new Date(tx.transactionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: 800, fontSize: "20px", color: getAmountColor(tx) }}>
                        {getAmountDisplay(tx)}
                      </p>
                      <span style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "20px", fontWeight: 600, marginTop: "6px", display: "inline-block",
                        background: tx.transactionStatus === "SUCCESS" ? "#dcfce7" : tx.transactionStatus === "DISPUTED" ? "#fef3c7" : tx.transactionStatus === "REFUNDED" ? "#e0e7ff" : "#fee2e2",
                        color: tx.transactionStatus === "SUCCESS" ? "#15803d" : tx.transactionStatus === "DISPUTED" ? "#b45309" : tx.transactionStatus === "REFUNDED" ? "#4338ca" : "#dc2626" }}>
                        {tx.transactionStatus || "SUCCESS"}
                      </span>
                    </div>
                  </div>

                  {tx.upiTransactionId && (
                    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f1f5f9",
                      display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>UPI Ref: <span style={{ color: "#64748b", fontWeight: 600 }}>{tx.upiTransactionId}</span></p>
                        {tx.remarks && <p style={{ color: "#64748b", fontSize: "12px", margin: "4px 0 0 0" }}>{tx.remarks}</p>}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {/* Download Receipt */}
                        <button
                          onClick={async () => {
                            try {
                              const userId = localStorage.getItem("userId");
                              const res = await fetch(`http://localhost:8080/wallet/receipt/${tx.transactionId}?userId=${userId}`);
                              if (!res.ok) throw new Error("Failed");
                              const blob = await res.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `Receipt_${tx.upiTransactionId || tx.transactionId}.pdf`;
                              a.click();
                              window.URL.revokeObjectURL(url);
                            } catch (e) { alert("Could not download receipt."); }
                          }}
                          style={{ padding: "6px 14px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", fontWeight: 700, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                          🧾 Receipt
                        </button>

                        {tx.disputeStatus && tx.disputeStatus !== "NONE" ? (
                          <span style={{
                            padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                            background: tx.disputeStatus === "RAISED" ? "#fef3c7" : tx.disputeStatus === "REFUNDED" ? "#dcfce7" : "#fee2e2",
                            color: tx.disputeStatus === "RAISED" ? "#b45309" : tx.disputeStatus === "REFUNDED" ? "#15803d" : "#dc2626",
                            display: "flex", alignItems: "center", gap: "6px"
                          }}>
                            {tx.disputeStatus === "RAISED" ? <><AlertTriangleIcon size={14} color="#b45309" /> Dispute Under Review</> : tx.disputeStatus === "REFUNDED" ? <><CheckCircleIcon size={14} color="#15803d" /> Refund Credited</> : <><XCircleIcon size={14} color="#dc2626" /> Claim Rejected</>}
                          </span>
                        ) : (
                          <button onClick={() => { setSelectedTxForDispute(tx); setShowDisputeModal(true); }}
                            style={{ padding: "6px 14px", borderRadius: "10px", background: "#fff1f2", color: "#e11d48", border: "1px solid #ffe4e6", fontWeight: 700, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                            <AlertTriangleIcon size={14} color="#e11d48" /> Report Issue
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Raise Dispute Modal */}
      {showDisputeModal && selectedTxForDispute && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(6px)" }}>
          <div style={{ background: "white", width: "450px", borderRadius: "28px", padding: "36px", boxShadow: "0 30px 90px rgba(0,0,0,0.3)" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <AlertTriangleIcon size={30} color="#e11d48" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", textAlign: "center", margin: "0 0 6px" }}>Raise Dispute & Ticket</h2>
            <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center", margin: "0 0 20px" }}>
              Report an issue with Transaction #{selectedTxForDispute.transactionId} ({getAmountDisplay(selectedTxForDispute)}). Our security & settlement team will investigate immediately.
            </p>

            <form onSubmit={handleRaiseDisputeSubmit}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                Select or Enter Reason for Dispute
              </label>
              <select value={disputeReason} onChange={e => setDisputeReason(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "14px", fontWeight: 600, background: "#f8fafc", color: "#0f172a", marginBottom: "12px", outline: "none" }}>
                <option value="">-- Choose Common Issue --</option>
                <option value="Money debited from bank but not credited to recipient">Money debited from bank but not credited to recipient</option>
                <option value="Duplicate charge detected for single transfer">Duplicate charge detected for single transfer</option>
                <option value="Wrong transfer amount charged">Wrong transfer amount charged</option>
                <option value="Suspicious / Unauthorized transaction">Suspicious / Unauthorized transaction</option>
                <option value="Other account / settlement issue">Other account / settlement issue</option>
              </select>

              <textarea placeholder="Or write specific details here..." value={disputeReason} onChange={e => setDisputeReason(e.target.value)} required rows="3"
                style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "13px", background: "#f8fafc", color: "#0f172a", marginBottom: "24px", resize: "none", outline: "none" }} />

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" disabled={disputeLoading}
                  style={{ flex: 1, padding: "14px", borderRadius: "14px", background: "linear-gradient(135deg,#e11d48,#be123c)", color: "white", border: "none", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "0 6px 18px rgba(225,29,72,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <AlertTriangleIcon size={16} color="white" /> {disputeLoading ? "Submitting..." : "Submit Dispute"}
                </button>
                <button type="button" onClick={() => { setShowDisputeModal(false); setSelectedTxForDispute(null); }}
                  style={{ flex: 1, padding: "14px", borderRadius: "14px", background: "#f1f5f9", color: "#64748b", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
