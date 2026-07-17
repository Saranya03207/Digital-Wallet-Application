import React, { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { LockIcon, CheckCircleIcon, SearchIcon, AnalyticsIcon } from "../components/AdminIcons";
import { AlertTriangleIcon, CloseIcon } from "../components/AppIcons";

function KycManagement() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedKyc, setSelectedKyc] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const res = await API.get("/kyc/admin/all");
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load KYC requests", err);
    }
  }

  async function handleAction(kycId, status) {
    try {
      let reason = "";
      if (status === "REJECTED") {
        reason = prompt("Enter rejection reason to email the user (optional):", "Documents unclear or details mismatched. Please upload clear front and back images.");
        if (reason === null) return; // User canceled
      }
      await API.post(`/kyc/admin/action?kycId=${kycId}&status=${status}&reason=${encodeURIComponent(reason || "")}`);
      alert(`KYC Status successfully updated to: ${status} ${status === "VERIFIED" || status === "REJECTED" ? "(Email notification sent to user!)" : ""}`);
      setSelectedKyc(null);
      loadRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to update KYC status");
    }
  }

  const filtered = requests.filter(r =>
    r.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    r.kycStatus.toLowerCase().includes(search.toLowerCase())
  );

  const pending = requests.filter(r => r.kycStatus === "PENDING").length;
  const review = requests.filter(r => r.kycStatus === "MANUAL_REVIEW").length;
  const verified = requests.filter(r => r.kycStatus === "VERIFIED").length;

  return (
    <AdminLayout>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <LockIcon size={28} color="#0f172a" />
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>KYC Management</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "14px" }}>Verify customer identities, check OCR records, and match selfies</p>
      </div>

      {/* Stats Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Pending KYC", value: pending, color: "#f59e0b", bg: "#fffbeb", icon: <AlertTriangleIcon size={24} color="#f59e0b" /> },
          { label: "Manual Review", value: review, color: "#6366f1", bg: "#eef2ff", icon: <AnalyticsIcon size={24} color="#6366f1" /> },
          { label: "Verified Users", value: verified, color: "#10b981", bg: "#f0fdf4", icon: <CheckCircleIcon size={24} color="#10b981" /> },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: "18px", padding: "20px 24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
            display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: s.bg,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{s.icon}</div>
            <div>
              <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>{s.label}</p>
              <h2 style={{ color: s.color, fontSize: "24px", fontWeight: 800 }}>{s.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Layout wrapper */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        
        {/* REQUESTS LIST */}
        <div style={{ flex: selectedKyc ? 1 : 2, background: "white", borderRadius: "20px", padding: "24px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}><SearchIcon size={18} color="#94a3b8" /></span>
            <input placeholder="Search by name, email or status..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "14px 18px 14px 44px", borderRadius: "14px", border: "2px solid #e2e8f0", fontSize: "14px", outline: "none" }} />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 16px" }}>User</th>
                  <th style={{ padding: "12px 16px" }}>Match Score</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <tr key={req.kycId} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                    <td style={{ padding: "16px" }}>
                      <p style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>{req.fullName}</p>
                      <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>{req.user?.email}</p>
                    </td>
                    <td style={{ padding: "16px", fontWeight: 700, color: req.faceMatchScore >= 90 ? "#10b981" : "#f59e0b" }}>
                      {req.faceMatchScore}%
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                        background: 
                          req.kycStatus === "VERIFIED" ? "#dcfce7" : 
                          req.kycStatus === "PENDING" ? "#fef3c7" : 
                          req.kycStatus === "MANUAL_REVIEW" ? "#eef2ff" : "#fee2e2",
                        color: 
                          req.kycStatus === "VERIFIED" ? "#15803d" : 
                          req.kycStatus === "PENDING" ? "#b45309" : 
                          req.kycStatus === "MANUAL_REVIEW" ? "#4f46e5" : "#b91c1c"
                      }}>{req.kycStatus}</span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <button onClick={() => setSelectedKyc(req)} style={{
                        padding: "8px 14px", borderRadius: "10px", border: "1px solid #6366f1",
                        background: "#eef2ff", color: "#6366f1", fontWeight: 600, cursor: "pointer", fontSize: "12px"
                      }}>Inspect</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILED INSPECTION PANEL */}
        {selectedKyc && (
          <div style={{ flex: 1, background: "white", borderRadius: "20px", padding: "28px", border: "1px solid #f1f5f9", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", position: "sticky", top: "20px" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>KYC Document Inspect</h2>
              <button onClick={() => setSelectedKyc(null)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}><CloseIcon size={20} color="#94a3b8" /></button>
            </div>

            {/* Side-by-side photo comparison */}
            <div style={{ display: "grid", gridTemplateColumns: selectedKyc.aadhaarBackImagePath ? "1fr 1fr 1fr" : "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", margin: "0 0 6px 0", textTransform: "uppercase" }}>Aadhaar Front</p>
                <div style={{ height: "130px", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#f8fafc" }}>
                  <img src={`http://localhost:8080/kyc-images/${selectedKyc.aadhaarImagePath}`} alt="Aadhaar Front" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
              {selectedKyc.aadhaarBackImagePath && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", margin: "0 0 6px 0", textTransform: "uppercase" }}>Aadhaar Back</p>
                  <div style={{ height: "130px", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#f8fafc" }}>
                    <img src={`http://localhost:8080/kyc-images/${selectedKyc.aadhaarBackImagePath}`} alt="Aadhaar Back" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </div>
              )}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", margin: "0 0 6px 0", textTransform: "uppercase" }}>Captured Selfie</p>
                <div style={{ height: "130px", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#f8fafc" }}>
                  <img src={`http://localhost:8080/kyc-images/${selectedKyc.selfieImagePath}`} alt="Selfie Capture" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            </div>

            {/* Confidence Score Panel */}
            <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Face Match Score</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: selectedKyc.faceMatchScore >= 90 ? "#10b981" : "#d97706" }}>{selectedKyc.faceMatchScore}%</span>
              </div>
              <div style={{ background: "#e2e8f0", height: "8px", borderRadius: "10px", marginTop: "8px", overflow: "hidden" }}>
                <div style={{ width: `${selectedKyc.faceMatchScore}%`, height: "100%", background: selectedKyc.faceMatchScore >= 90 ? "#10b981" : "#f59e0b" }} />
              </div>
            </div>

            {/* Extracted Card Metadata */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {[
                { label: "Full Name", val: selectedKyc.fullName },
                { label: "Masked Aadhaar", val: selectedKyc.maskedAadhaarNumber },
                { label: "DOB", val: selectedKyc.dob },
                { label: "Gender", val: selectedKyc.gender },
                { label: "Address", val: selectedKyc.address },
                { label: "State", val: selectedKyc.state },
                { label: "PIN Code", val: selectedKyc.pinCode }
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b" }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{item.val || "Not Found"}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleAction(selectedKyc.kycId, "VERIFIED")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#10b981", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Approve</button>
                <button onClick={() => handleAction(selectedKyc.kycId, "REJECTED")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#ef4444", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Reject</button>
              </div>
              <button onClick={() => handleAction(selectedKyc.kycId, "MANUAL_REVIEW")} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #6366f1", background: "white", color: "#6366f1", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>Mark Under Manual Review</button>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default KycManagement;
