import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function changePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) { alert("Please Fill All Fields"); return; }
    if (newPassword !== confirmPassword) { alert("Passwords Do Not Match"); return; }
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const response = await API.post("/users/change-password", { userId, currentPassword, newPassword });
      if (response.data === "PASSWORD_CHANGED") { alert("Password Updated Successfully"); navigate("/profile"); }
      else if (response.data === "INVALID_PASSWORD") alert("Current Password Incorrect");
      else if (response.data === "SAME_PASSWORD") alert("New Password Must Be Different");
      else alert(response.data);
    } catch (error) { console.log(error); alert("Failed To Change Password"); }
    finally { setLoading(false); }
  }

  const PasswordInput = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} placeholder={placeholder} value={value} onChange={onChange}
          style={{ width: "100%", padding: "15px 50px 15px 18px", borderRadius: "14px",
            border: "2px solid #e2e8f0", fontSize: "15px", background: "#f8fafc", color: "#0f172a" }} />
        <button type="button" onClick={onToggle}
          style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}>
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8faff,#eef2ff)",
      display: "flex", justifyContent: "center", alignItems: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <div style={{ background: "white", borderRadius: "28px", padding: "48px 44px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)", border: "1px solid #f1f5f9" }}>

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>🔒</div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Change Password</h1>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Update your WalletPay account password securely</p>
          </div>

          <PasswordInput label="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
            show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} placeholder="Enter current password" />
          <PasswordInput label="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="Enter new password" />
          <PasswordInput label="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} placeholder="Repeat new password" />

          {confirmPassword && newPassword && (
            <div style={{ padding: "12px 16px", borderRadius: "12px", marginBottom: "20px",
              background: newPassword === confirmPassword ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${newPassword === confirmPassword ? "#bbf7d0" : "#fecaca"}` }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: newPassword === confirmPassword ? "#15803d" : "#dc2626" }}>
                {newPassword === confirmPassword ? "✔ Passwords match" : "✖ Passwords do not match"}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => navigate("/profile")} style={{ flex: 1, padding: "15px", borderRadius: "14px",
              background: "#f1f5f9", color: "#64748b", border: "none", fontWeight: 700, fontSize: "15px" }}>
              ← Back
            </button>
            <button onClick={changePassword} disabled={loading} style={{ flex: 2, padding: "15px", borderRadius: "14px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none",
              fontWeight: 700, fontSize: "15px", boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
              opacity: loading ? 0.8 : 1 }}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
