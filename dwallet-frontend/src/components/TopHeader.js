import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { WalletIcon, BellIcon, ProfileIcon, LogOutIcon } from "./AppIcons";

function TopHeader({ wallet }) {
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    API.get(`/notifications/unread-count/${userId}`)
      .then(res => setUnreadCount(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <header style={{
      background: "white",
      padding: "0 32px",
      height: "72px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #f1f5f9",
      boxShadow: "0 2px 16px rgba(99,102,241,0.06)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>

      {/* BRAND */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        onClick={() => navigate("/dashboard")}>
        <div style={{ width: "38px", height: "38px", borderRadius: "11px",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}><WalletIcon size={22} color="white" /></div>
        <span style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>WalletPay</span>
      </div>

      {/* NAV LINKS */}
      <nav style={{ display: "flex", gap: "4px" }}>
        {[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Banks", path: "/bank-accounts" },
          { label: "Wallet", path: "/wallet" },
          { label: "History", path: "/history" },
          { label: "Transfer", path: "/transfer" },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            padding: "8px 16px", borderRadius: "10px", border: "none",
            background: window.location.pathname === item.path ? "#eef2ff" : "transparent",
            color: window.location.pathname === item.path ? "#6366f1" : "#64748b",
            fontWeight: 600, fontSize: "14px", cursor: "pointer",
            transition: "all 0.2s ease"
          }}>{item.label}</button>
        ))}
      </nav>

      {/* RIGHT ACTIONS */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

        {/* Notification Bell */}
        <div onClick={() => navigate("/notifications")} style={{ position: "relative", cursor: "pointer",
          width: "40px", height: "40px", borderRadius: "12px", background: "#f8fafc",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid #e2e8f0", transition: "all 0.2s" }}>
          <BellIcon size={20} color="#64748b" />
          {unreadCount > 0 && (
            <span style={{ position: "absolute", top: "-5px", right: "-5px",
              background: "linear-gradient(135deg,#ef4444,#f87171)", color: "white",
              width: "20px", height: "20px", borderRadius: "50%",
              display: "flex", justifyContent: "center", alignItems: "center",
              fontSize: "11px", fontWeight: 700, boxShadow: "0 2px 8px rgba(239,68,68,0.4)" }}>
              {unreadCount}
            </span>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer",
            padding: "6px 12px 6px 6px", borderRadius: "40px", border: "1px solid #e2e8f0",
            background: "#f8fafc", transition: "all 0.2s" }}
            onClick={() => setShowProfile(!showProfile)}>
            <img src={wallet?.user?.profileImage && wallet.user.profileImage !== "null"
                ? (wallet.user.profileImage.startsWith("http") || wallet.user.profileImage.startsWith("data:") ? wallet.user.profileImage : `http://localhost:8080/profile-images/${wallet.user.profileImage}`)
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="profile"
              style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover",
                border: "2px solid #6366f1" }}
              onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }} />
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", maxWidth: "100px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {wallet?.user?.fullName?.split(" ")[0] || "User"}
            </span>
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>▼</span>
          </div>

          {showProfile && (
            <div style={{ position: "absolute", right: 0, top: "52px", background: "white",
              width: "220px", borderRadius: "18px", padding: "8px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)", zIndex: 999,
              border: "1px solid #f1f5f9" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", marginBottom: "6px" }}>
                <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>{wallet?.user?.fullName}</p>
                <p style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>{wallet?.user?.upiId}</p>
              </div>
              {[
                { label: <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><ProfileIcon size={16} /> View Profile</span>, path: "/profile", color: "#6366f1" },
                { label: <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>🏦 Bank Accounts</span>, path: "/bank-accounts", color: "#4f46e5" },
                { label: <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><BellIcon size={16} /> Notifications</span>, path: "/notifications", color: "#f59e0b" },
              ].map(item => (
                <button key={item.path} onClick={() => { navigate(item.path); setShowProfile(false); }}
                  style={{ width: "100%", textAlign: "left", padding: "11px 16px", borderRadius: "12px",
                    border: "none", background: "transparent", color: "#0f172a", fontWeight: 600,
                    fontSize: "14px", cursor: "pointer", marginBottom: "2px" }}>
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "6px", paddingTop: "6px" }}>
                <button onClick={() => { localStorage.clear(); navigate("/login"); }}
                  style={{ width: "100%", textAlign: "left", padding: "11px 16px", borderRadius: "12px",
                    border: "none", background: "transparent", color: "#ef4444", fontWeight: 700,
                    fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                  <LogOutIcon size={16} color="#ef4444" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopHeader;
