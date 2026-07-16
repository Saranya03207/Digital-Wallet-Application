import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import HelpButton from "../components/HelpButton";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function doLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post("/users/login", { email, password });
      if (!response.data || !response.data.userId) throw new Error("Invalid Login Response");
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("username", response.data.fullName);
      if (response.data.role === "ADMIN") navigate("/admin");
      else navigate("/dashboard");
    } catch (error) {
      const errMsg = error.response?.data;
      if (errMsg === "EMAIL_NOT_VERIFIED") {
        if (window.confirm("Your email is not verified yet. Would you like to verify it now? We will send an OTP code to your email.")) {
          try {
            await API.post(`/users/resend-otp?email=${email}`);
            alert("A verification code has been sent to " + email);
            navigate("/verify-otp", { state: { email } });
          } catch (otpErr) {
            alert("Failed to send verification code. Please try again.");
          }
        }
        return;
      }
      if (errMsg === "Account Blocked") {
        alert("🚫 Your account has been blocked by administrative or AI security policy. Please click the Support widget at the bottom right corner to submit an unblock request.");
      } else if (errMsg === "INVALID_CREDENTIALS") {
        alert("Invalid email address or password.");
      } else {
        alert(errMsg || error.message || "Invalid Email or Password");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }}>

      {/* LEFT HERO */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "80px 70px", color: "white", position: "relative", overflow: "hidden"
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "360px", height: "360px",
          borderRadius: "50%", background: "rgba(99,102,241,0.15)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "280px", height: "280px",
          borderRadius: "50%", background: "rgba(139,92,246,0.12)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "40px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "16px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px",
              boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>💳</div>
            <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>WalletPay</span>
          </div>

          <h1 style={{ fontSize: "52px", fontWeight: 800, lineHeight: 1.15, marginBottom: "20px",
            background: "linear-gradient(135deg,#ffffff,#c7d2fe)", WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent" }}>
            Your Digital<br />Wallet, Reimagined
          </h1>

          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: "50px", maxWidth: "400px" }}>
            Send money instantly, manage your finances, and track every transaction — all in one secure place.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: "⚡", text: "Instant Money Transfers" },
              { icon: "🔒", text: "Bank-Grade Security" },
              { icon: "📊", text: "Real-Time Analytics" },
              { icon: "🤖", text: "AI Fraud Detection" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "18px" }}>{f.icon}</div>
                <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
        <div style={{ width: "100%", maxWidth: "460px" }}>
          <div style={{ background: "white", borderRadius: "28px", padding: "52px 48px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}>

            <h2 style={{ fontSize: "30px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>Welcome back 👋</h2>
            <p style={{ color: "#64748b", marginBottom: "36px", fontSize: "15px" }}>Sign in to your WalletPay account</p>

            <form onSubmit={doLogin}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Email Address</label>
              <input type="email" placeholder="you@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required
                style={{ width: "100%", padding: "15px 18px", borderRadius: "14px", border: "2px solid #e2e8f0",
                  fontSize: "15px", marginBottom: "20px", background: "#f8fafc", color: "#0f172a" }} />

              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  style={{ width: "100%", padding: "15px 50px 15px 18px", borderRadius: "14px", border: "2px solid #e2e8f0",
                    fontSize: "15px", background: "#f8fafc", color: "#0f172a" }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#94a3b8" }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>

              <div style={{ textAlign: "right", marginBottom: "28px" }}>
                <Link to="/forgot-password" style={{ color: "#6366f1", fontWeight: 600, fontSize: "14px" }}>
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "16px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none",
                borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(99,102,241,0.35)", opacity: loading ? 0.8 : 1 }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "28px", color: "#64748b", fontSize: "14px" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#6366f1", fontWeight: 700 }}>Create Account</Link>
            </p>
          </div>
        </div>
      </div>
      <HelpButton />
    </div>
  );
}

export default Login;
