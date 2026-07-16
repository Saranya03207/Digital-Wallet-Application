import React, { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { CheckCircleIcon, ShieldIcon } from "../components/AppIcons";

function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch support tickets
  const fetchTickets = async () => {
    try {
      const res = await API.get("/support/tickets");
      if (Array.isArray(res.data)) {
        setTickets(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Resolve a ticket
  const handleResolve = async (ticketId) => {
    try {
      await API.post(`/support/resolve/${ticketId}`);
      alert("🎟️ Ticket successfully resolved!");
      fetchTickets();
    } catch (err) {
      alert("Failed to resolve ticket. Please try again.");
    }
  };

  // Unblock a user
  const handleUnblock = async (userId) => {
    try {
      const res = await API.post(`/support/unblock/${userId}`);
      alert(`🔓 User Account unblocked successfully: ${res.data}`);
      fetchTickets();
    } catch (err) {
      alert("Failed to unblock user account. Please try again.");
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
            Support Tickets
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Manage customer support queries and account unblock requests
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ padding: "10px 18px", borderRadius: "12px", background: "#f1f5f9", border: "1px solid #cbd5e1" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>
              Total: {tickets.length}
            </span>
          </div>
          <div style={{ padding: "10px 18px", borderRadius: "12px", background: "#fef2f2", border: "1px solid #fee2e2" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#ef4444" }}>
              Pending: {tickets.filter(t => t.status === "PENDING").length}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: "#64748b" }}>Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "48px 24px", textAlign: "center", border: "1px solid #e2e8f0" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <ShieldIcon size={28} color="#94a3b8" />
          </div>
          <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "18px" }}>No Tickets Found</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Everything is clean! All support queries have been resolved.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {tickets.map(ticket => {
            const isBlockedRequest = ticket.subject.includes("[Blocked Account Request]");
            const isPending = ticket.status === "PENDING";

            return (
              <div 
                key={ticket.id} 
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: isBlockedRequest && isPending ? "2px solid #ef4444" : "1px solid #e2e8f0",
                  padding: "20px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Visual indicator for high-priority unblock requests */}
                {isBlockedRequest && isPending && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, bottom: 0, width: "6px", background: "#ef4444"
                  }} />
                )}

                {/* Top header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <div>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "700",
                      marginBottom: "8px",
                      background: isBlockedRequest ? "#fef2f2" : "#f1f5f9",
                      color: isBlockedRequest ? "#ef4444" : "#475569",
                      border: isBlockedRequest ? "1px solid #fee2e2" : "1px solid #cbd5e1"
                    }}>
                      {isBlockedRequest ? "🚨 UNBLOCK REQUEST" : "💬 GENERAL QUERY"}
                    </span>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
                      {ticket.subject}
                    </h3>
                  </div>

                  <span style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: isPending ? "#fff7ed" : "#dcfce7",
                    color: isPending ? "#ea580c" : "#15803d",
                    border: isPending ? "1px solid #ffedd5" : "1px solid #bbf7d0"
                  }}>
                    {isPending ? "Pending Action" : "Resolved"}
                  </span>
                </div>

                {/* Ticket Description Message */}
                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                    {ticket.message}
                  </p>
                </div>

                {/* Footer details & Action Buttons */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "12px"
                }}>
                  <div style={{ display: "flex", gap: "16px", fontSize: "12.5px", color: "#64748b", flexWrap: "wrap" }}>
                    <span><strong>From:</strong> {ticket.fullName} ({ticket.email})</span>
                    <span><strong>Mobile:</strong> {ticket.mobileNumber || "N/A"}</span>
                    <span><strong>Date:</strong> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "Just Now"}</span>
                  </div>

                  {isPending && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      {ticket.userId && isBlockedRequest && (
                        <button
                          onClick={() => handleUnblock(ticket.userId)}
                          style={{
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          🔓 Unblock Account
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleResolve(ticket.id)}
                        style={{
                          background: "#ffffff",
                          color: "#4f46e5",
                          border: "1px solid #4f46e5",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <CheckCircleIcon size={16} color="#4f46e5" /> Resolve Ticket
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminSupport;
