import { Link, useLocation, useNavigate } from "react-router-dom";
import { UsersIcon, TransactionsIcon, AnalyticsIcon, FraudMonitorIcon, WalletIcon } from "./AdminIcons";
import { HomeIcon, LockIcon, LogOutIcon } from "./AppIcons";

const menuItems = [
  { icon: <HomeIcon size={18} color="currentColor" />, label: "Dashboard", path: "/admin" },
  { icon: <UsersIcon size={18} color="currentColor" />, label: "Users", path: "/admin/users" },
  { icon: <TransactionsIcon size={18} color="currentColor" />, label: "Transactions", path: "/admin/transactions" },
  { icon: <AnalyticsIcon size={18} color="currentColor" />, label: "Analytics", path: "/admin/analytics" },
  { icon: <LockIcon size={18} color="currentColor" />, label: "KYC Review", path: "/admin/kyc" },
  { icon: <FraudMonitorIcon size={18} color="currentColor" />, label: "AI Monitor", path: "/admin/fraud" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>, label: "Support Queries", path: "/admin/support" },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8faff" }}>

      {/* SIDEBAR */}
      <aside style={{ width: "260px", background: "linear-gradient(180deg,#0f0c29 0%,#302b63 60%,#24243e 100%)",
        display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0,
        boxShadow: "4px 0 24px rgba(0,0,0,0.15)", zIndex: 50 }}>

        {/* Brand */}
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "13px",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 16px rgba(99,102,241,0.4)" }}><WalletIcon size={24} color="white" /></div>
            <div>
              <p style={{ color: "white", fontWeight: 800, fontSize: "17px", letterSpacing: "-0.3px" }}>WalletPay</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", fontWeight: 500 }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "20px 14px", overflowY: "auto" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontWeight: 600,
            letterSpacing: "0.8px", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "12px" }}>
            Navigation
          </p>
          {menuItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ display: "flex", alignItems: "center", gap: "12px",
                textDecoration: "none", padding: "12px 14px", borderRadius: "14px", marginBottom: "4px",
                background: active ? "rgba(99,102,241,0.25)" : "transparent",
                border: active ? "1px solid rgba(99,102,241,0.35)" : "1px solid transparent",
                transition: "all 0.2s ease", boxShadow: active ? "0 4px 12px rgba(99,102,241,0.15)" : "none" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "10px",
                  background: active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
                  flexShrink: 0 }}>{item.icon}</div>
                <span style={{ color: active ? "white" : "rgba(255,255,255,0.65)",
                  fontWeight: active ? 700 : 500, fontSize: "14px" }}>{item.label}</span>
                {active && <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>●</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 14px 24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={logout} style={{ width: "100%", padding: "13px", borderRadius: "14px",
            background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)",
            fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            transition: "all 0.2s ease", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}>
            <LogOutIcon size={18} color="#f87171" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: "260px", flex: 1, padding: "36px 40px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
