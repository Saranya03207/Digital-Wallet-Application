import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyOtp() {
    setLoading(true);
    try {
      const response = await API.post("/users/verify-otp", { email, otp });
      if (response.data === "VERIFIED") { alert("Email Verified Successfully"); navigate("/login"); }
      else if (response.data === "INVALID_OTP") alert("Invalid OTP");
      else if (response.data === "OTP_EXPIRED") alert("OTP Expired");
    } catch (error) { console.log(error); alert("Verification Failed"); }
    finally { setLoading(false); }
  }

  async function resendOtp() {
    try {
      await API.post(`/users/resend-otp?email=${email}`);
      alert("New OTP Sent To Email");
    } catch (error) { console.log(error); alert("Failed To Send OTP"); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }}>

      {/* LEFT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "80px 70px", color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px",
          borderRadius: "50%", background: "rgba(99,102,241,0.12)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>💳</div>
          <span style={{ fontSize: "24px", fontWeight: 800 }}>WalletPay</span>
        </div>

        <h1 style={{ fontSize: "42px", fontWeight: 800, lineHeight: 1.2, marginBottom: "16px",
          background: "linear-gradient(135deg,#ffffff,#c7d2fe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Verify Your Email
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "40px", maxWidth: "380px" }}>
          We sent a 6-digit OTP to your email address. Enter it to activate your account.
        </p>

        {[
          { icon: "🔐", text: "Secure Account Creation" },
          { icon: "📧", text: "OTP-Based Verification" },
          { icon: "🚫", text: "Prevent Fake Registrations" },
          { icon: "✅", text: "Safe Wallet Access" },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "9px",
              background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {f.icon}
            </div>
            <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
        <div style={{ width: "100%", maxWidth: "460px" }}>
          <div style={{ background: "white", borderRadius: "28px", padding: "52px 48px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}>

            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "20px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>📧</div>
              <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Enter OTP</h2>
              <p style={{ color: "#64748b", fontSize: "14px" }}>
                Code sent to <strong style={{ color: "#0f172a" }}>{email}</strong>
              </p>
            </div>

            <input type="text" placeholder="• • • • • •" value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} maxLength={6}
              style={{ width: "100%", padding: "18px", borderRadius: "16px", border: "2px solid #e2e8f0",
                fontSize: "32px", textAlign: "center", letterSpacing: "16px", fontWeight: 800,
                background: "#f8fafc", color: "#0f172a", marginBottom: "24px" }} />

            <button onClick={verifyOtp} disabled={loading || otp.length !== 6}
              style={{ width: "100%", padding: "15px", borderRadius: "14px",
                background: otp.length !== 6 ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "white", border: "none", fontSize: "16px", fontWeight: 700,
                boxShadow: otp.length === 6 ? "0 8px 24px rgba(99,102,241,0.35)" : "none",
                cursor: otp.length !== 6 ? "not-allowed" : "pointer",
                opacity: loading ? 0.8 : 1, marginBottom: "12px" }}>
              {loading ? "Verifying..." : "✅ Verify Email"}
            </button>

            <button onClick={resendOtp} style={{ width: "100%", padding: "14px", borderRadius: "14px",
              background: "#fff7ed", color: "#f97316", border: "1px solid #fed7aa",
              fontSize: "15px", fontWeight: 700 }}>
              🔁 Resend OTP
            </button>

            <p style={{ textAlign: "center", marginTop: "24px", color: "#94a3b8", fontSize: "13px" }}>
              OTP expires in 10 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
