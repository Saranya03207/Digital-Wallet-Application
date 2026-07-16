import { useEffect, useState } from "react";
import API from "../services/api";
import TopHeader from "../components/TopHeader";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    API.get(`/notifications/${userId}`)
      .then(async res => {
        setNotifications(res.data);
        setLoading(false);
        for (const n of res.data) {
          await API.put(`/notifications/read/${n.notificationId}`);
        }
      })
      .catch(err => { console.log(err); setLoading(false); });
  }, []);

  function getNotifStyle(msg) {
    if (msg?.toLowerCase().includes("transfer") || msg?.toLowerCase().includes("sent")) return { icon: "🔄", bg: "linear-gradient(135deg,#f97316,#fb923c)", light: "#fff7ed", border: "#fed7aa" };
    if (msg?.toLowerCase().includes("add") || msg?.toLowerCase().includes("received") || msg?.toLowerCase().includes("credit")) return { icon: "💰", bg: "linear-gradient(135deg,#10b981,#34d399)", light: "#f0fdf4", border: "#bbf7d0" };
    if (msg?.toLowerCase().includes("withdraw") || msg?.toLowerCase().includes("debit")) return { icon: "🏦", bg: "linear-gradient(135deg,#ef4444,#f87171)", light: "#fef2f2", border: "#fecaca" };
    return { icon: "🔔", bg: "linear-gradient(135deg,#6366f1,#8b5cf6)", light: "#eef2ff", border: "#c7d2fe" };
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8faff,#eef2ff,#f0fdf4)" }}>
      <TopHeader />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>🔔 Notifications</h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px" }}>
            <p style={{ color: "#64748b", fontWeight: 600 }}>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px", background: "white", borderRadius: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: "56px", marginBottom: "18px" }}>📭</div>
            <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>All caught up!</h3>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>No new notifications at the moment</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notifications.map(n => {
              const style = getNotifStyle(n.message);
              return (
                <div key={n.notificationId} style={{ background: "white", borderRadius: "20px", padding: "20px 24px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: `1px solid ${style.border}`,
                  borderLeft: `4px solid`, borderLeftColor: "transparent",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  backgroundImage: `linear-gradient(white, white), linear-gradient(135deg,${style.border},transparent)`,
                  display: "flex", alignItems: "flex-start", gap: "16px" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: style.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                    {style.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: "#0f172a", fontSize: "15px", lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "6px" }}>
                      {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span style={{ background: style.light, color: style.border, padding: "4px 12px",
                    borderRadius: "20px", fontSize: "11px", fontWeight: 700, flexShrink: 0, border: `1px solid ${style.border}` }}>
                    New
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
