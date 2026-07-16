import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function sendOtp(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post("/users/forgot-password", { email });
      if (response.data === "OTP_SENT") {
        alert("OTP Sent To Email");
        navigate("/reset-password", { state: { email } });
      }
    } catch (error) {
      console.log(error);
      alert("Email Not Found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      display: "flex", justifyContent: "center", alignItems: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>
        <div style={{ background: "white", borderRadius: "28px", padding: "52px 48px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}>

          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>🔑</div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Forgot Password?</h1>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
              No worries! Enter your registered email and we'll send you an OTP to reset your password.
            </p>
          </div>

          <form onSubmit={sendOtp}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>
              Email Address
            </label>
            <input type="email" placeholder="you@email.com" value={email}
              onChange={e => setEmail(e.target.value)} required
              style={{ width: "100%", padding: "15px 18px", borderRadius: "14px", border: "2px solid #e2e8f0",
                fontSize: "15px", marginBottom: "24px", background: "#f8fafc", color: "#0f172a" }} />

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: "14px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none",
              fontSize: "16px", fontWeight: 700, boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
              opacity: loading ? 0.8 : 1 }}>
              {loading ? "Sending OTP..." : "📨 Send OTP"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "28px", color: "#64748b", fontSize: "14px" }}>
            Remember your password?{" "}
            <Link to="/login" style={{ color: "#6366f1", fontWeight: 700 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
