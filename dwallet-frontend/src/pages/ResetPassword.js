import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function resetPassword() {
    if (newPassword !== confirmPassword) { alert("Passwords Do Not Match"); return; }
    setLoading(true);
    try {
      const response = await API.post("/users/reset-password", { email, otp, newPassword });
      if (response.data === "PASSWORD_RESET_SUCCESS") { alert("Password Updated Successfully"); navigate("/login"); }
      else if (response.data === "INVALID_OTP") alert("Invalid OTP");
      else if (response.data === "OTP_EXPIRED") alert("OTP Expired");
    } catch (error) { console.log(error); alert("Password Reset Failed"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      display: "flex", justifyContent: "center", alignItems: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <div style={{ background: "white", borderRadius: "28px", padding: "52px 48px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}>

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px",
              background: "linear-gradient(135deg,#10b981,#34d399)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(16,185,129,0.3)" }}>🛡️</div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Reset Password</h1>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              OTP sent to <strong style={{ color: "#0f172a" }}>{email}</strong>
            </p>
          </div>

          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>
            OTP Code
          </label>
          <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)}
            maxLength={6}
            style={{ width: "100%", padding: "15px 18px", borderRadius: "14px", border: "2px solid #e2e8f0",
              fontSize: "20px", textAlign: "center", letterSpacing: "8px", marginBottom: "20px",
              background: "#f8fafc", color: "#0f172a", fontWeight: 700 }} />

          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>
            New Password
          </label>
          <input type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            style={{ width: "100%", padding: "15px 18px", borderRadius: "14px", border: "2px solid #e2e8f0",
              fontSize: "15px", marginBottom: "20px", background: "#f8fafc", color: "#0f172a" }} />

          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>
            Confirm Password
          </label>
          <input type="password" placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: "15px 18px", borderRadius: "14px",
              border: `2px solid ${confirmPassword ? (newPassword === confirmPassword ? "#10b981" : "#ef4444") : "#e2e8f0"}`,
              fontSize: "15px", marginBottom: "28px", background: "#f8fafc", color: "#0f172a" }} />

          <button onClick={resetPassword} disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: "14px",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none",
            fontSize: "16px", fontWeight: 700, boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            opacity: loading ? 0.8 : 1 }}>
            {loading ? "Resetting..." : "🔒 Reset Password"}
          </button>

          <p style={{ textAlign: "center", marginTop: "24px", color: "#64748b", fontSize: "14px" }}>
            Back to{" "}
            <Link to="/login" style={{ color: "#6366f1", fontWeight: 700 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
