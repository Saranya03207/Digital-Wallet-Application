import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function passwordChecks(password) {
  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@#$%^&+=!]/.test(password),
  };
}

function getPasswordStrength(password) {
  if (!password) return "";
  const passed = Object.values(passwordChecks(password)).filter(Boolean).length;
  if (passed <= 2) return "Weak";
  if (passed <= 4) return "Medium";
  return "Strong";
}

const strengthColor = { Weak: "#ef4444", Medium: "#f59e0b", Strong: "#10b981" };
const strengthWidth = { Weak: "33%", Medium: "66%", Strong: "100%" };

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    if (password !== confirmPassword) { alert("Passwords do not match"); return; }
    setLoading(true);
    try {
      await API.post("/users/register", { fullName, email, mobileNumber, aadhaarNumber, password });
      alert("OTP Sent To Your Email");
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      const msg = error.response?.data;
      if (msg === "EMAIL_EXISTS") {
        if (window.confirm("Email already registered. Do you want to Login?")) navigate("/login");
        return;
      }
      if (msg === "MOBILE_EXISTS") { alert("Mobile number already registered"); return; }
      if (msg === "AADHAAR_EXISTS") { alert("Aadhaar already linked with another account"); return; }
      if (msg === "WEAK_PASSWORD") { alert("Password must contain uppercase, lowercase, number and special character"); return; }
      alert(msg || "Registration Failed");
    } finally {
      setLoading(false);
    }
  }

  const strength = getPasswordStrength(password);
  const checks = passwordChecks(password);

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }}>

      {/* LEFT */}
      <div style={{ flex: "0 0 420px", display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 50px", color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px",
          borderRadius: "50%", background: "rgba(99,102,241,0.12)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>💳</div>
          <span style={{ fontSize: "24px", fontWeight: 800 }}>WalletPay</span>
        </div>

        <h2 style={{ fontSize: "36px", fontWeight: 800, lineHeight: 1.2, marginBottom: "16px",
          background: "linear-gradient(135deg,#ffffff,#c7d2fe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Join Millions of Users
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "40px" }}>
          Create your free account and start managing your finances with confidence.
        </p>

        {[
          { icon: "🎁", text: "Zero Registration Fees" },
          { icon: "🔐", text: "Aadhaar-Verified Accounts" },
          { icon: "💸", text: "Instant Wallet Creation" },
          { icon: "📱", text: "Fast Mobile Transfers" },
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

      {/* RIGHT FORM */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: "30px 40px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "520px" }}>
          <div style={{ background: "white", borderRadius: "28px", padding: "48px 44px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}>

            <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Create Account</h2>
            <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "14px" }}>Fill in your details to get started</p>

            <form onSubmit={handleRegister}>
              {[
                { label: "Full Name", type: "text", placeholder: "John Doe", value: fullName, onChange: e => setFullName(e.target.value) },
                { label: "Email Address", type: "email", placeholder: "you@email.com", value: email, onChange: e => setEmail(e.target.value) },
                { label: "Mobile Number", type: "text", placeholder: "10-digit mobile", value: mobileNumber, onChange: e => setMobileNumber(e.target.value), maxLength: 10 },
                { label: "Aadhaar Number", type: "text", placeholder: "12-digit Aadhaar", value: aadhaarNumber, onChange: e => setAadhaarNumber(e.target.value), maxLength: 12 },
              ].map((field, i) => (
                <div key={i}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder} value={field.value}
                    onChange={field.onChange} required maxLength={field.maxLength}
                    style={{ width: "100%", padding: "13px 16px", borderRadius: "12px", border: "2px solid #e2e8f0",
                      fontSize: "15px", marginBottom: "16px", background: "#f8fafc", color: "#0f172a" }} />
                </div>
              ))}

              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Password</label>
              <input type="password" placeholder="Create strong password" value={password}
                onChange={e => setPassword(e.target.value)} required
                style={{ width: "100%", padding: "13px 16px", borderRadius: "12px", border: "2px solid #e2e8f0",
                  fontSize: "15px", marginBottom: "10px", background: "#f8fafc", color: "#0f172a" }} />

              {password && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>Password Strength</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: strengthColor[strength] }}>{strength}</span>
                  </div>
                  <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: strengthWidth[strength], background: strengthColor[strength],
                      borderRadius: "10px", transition: "width 0.3s ease" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "10px" }}>
                    {[
                      { key: "length", label: "8+ chars" },
                      { key: "lower", label: "Lowercase" },
                      { key: "upper", label: "Uppercase" },
                      { key: "number", label: "Number" },
                      { key: "special", label: "Special char" },
                    ].map(c => (
                      <span key={c.key} style={{ fontSize: "12px", color: checks[c.key] ? "#10b981" : "#94a3b8", fontWeight: 500 }}>
                        {checks[c.key] ? "✔" : "✖"} {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} required
                style={{ width: "100%", padding: "13px 16px", borderRadius: "12px",
                  border: `2px solid ${confirmPassword ? (password === confirmPassword ? "#10b981" : "#ef4444") : "#e2e8f0"}`,
                  fontSize: "15px", marginBottom: "6px", background: "#f8fafc", color: "#0f172a" }} />

              {confirmPassword && (
                <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "18px",
                  color: password === confirmPassword ? "#10b981" : "#ef4444" }}>
                  {password === confirmPassword ? "✔ Passwords Match" : "✖ Passwords Do Not Match"}
                </p>
              )}

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none",
                borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(99,102,241,0.3)", opacity: loading ? 0.8 : 1, marginTop: "4px" }}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "24px", color: "#64748b", fontSize: "14px" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#6366f1", fontWeight: 700 }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
