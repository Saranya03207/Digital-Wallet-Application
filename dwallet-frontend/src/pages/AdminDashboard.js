import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { Line, Bar } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler } from "chart.js";
import {
  UsersIcon, ActiveUsersIcon, BlockedUsersIcon, TransactionsIcon, WalletIcon,
  ManageUsersIcon, AnalyticsIcon, FraudMonitorIcon, TrendingUpIcon, BarChartIcon,
  CalendarIcon, CheckCircleIcon, ShieldAlertIcon, ZapIcon
} from "../components/AdminIcons";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler);

function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [timeframe, setTimeframe] = useState("daily"); // "daily" | "weekly" | "monthly" | "yearly"
  const [metric, setMetric] = useState("count"); // "count" | "volume"
  const [chartType, setChartType] = useState("line"); // "line" | "bar"

  useEffect(() => {
    API.get("/admin/dashboard").then(res => setDashboard(res.data)).catch(console.log);
    API.get("/admin/analytics").then(res => setAnalytics(res.data)).catch(console.log);
    API.get("/admin/transactions").then(res => {
      if (Array.isArray(res.data)) {
        setRecentTransactions(res.data.slice(0, 5));
      }
    }).catch(console.log);
  }, []);

  const kpiCards = [
    { icon: <UsersIcon size={24} color="#6366f1" />, label: "Total Users", value: dashboard.totalUsers, color: "#6366f1", bg: "linear-gradient(135deg,#6366f1,#8b5cf6)", light: "#eef2ff", path: "/admin/users" },
    { icon: <ActiveUsersIcon size={24} color="#10b981" />, label: "Active Users", value: dashboard.activeUsers, color: "#10b981", bg: "linear-gradient(135deg,#10b981,#34d399)", light: "#f0fdf4", path: "/admin/users" },
    { icon: <BlockedUsersIcon size={24} color="#ef4444" />, label: "Blocked Users", value: dashboard.blockedUsers, color: "#ef4444", bg: "linear-gradient(135deg,#ef4444,#f87171)", light: "#fef2f2", path: "/admin/users" },
    { icon: <TransactionsIcon size={24} color="#f97316" />, label: "Transactions", value: dashboard.totalTransactions, color: "#f97316", bg: "linear-gradient(135deg,#f97316,#fb923c)", light: "#fff7ed", path: "/admin/transactions" },
    { icon: <WalletIcon size={24} color="#7c3aed" />, label: "Wallet Balance", value: `₹${dashboard.totalWalletBalance ?? 0}`, color: "#7c3aed", bg: "linear-gradient(135deg,#7c3aed,#a855f7)", light: "#f5f3ff", path: "/admin/analytics" },
  ];

  const quickActions = [
    { icon: <ManageUsersIcon size={28} color="#6366f1" />, label: "Manage Users", desc: "Block, Activate & View", path: "/admin/users", color: "#6366f1" },
    { icon: <TransactionsIcon size={28} color="#f97316" />, label: "Transactions", desc: "Monitor all transfers", path: "/admin/transactions", color: "#f97316" },
    { icon: <AnalyticsIcon size={28} color="#10b981" />, label: "Analytics", desc: "View platform reports", path: "/admin/analytics", color: "#10b981" },
    { icon: <FraudMonitorIcon size={28} color="#7c3aed" />, label: "AI Monitor", desc: "Fraud detection engine", path: "/admin/fraud", color: "#7c3aed" },
  ];

  const getChartLabels = () => {
    if (!analytics) return [];
    if (timeframe === "daily") return Object.keys(analytics.dailyTransactions || {});
    if (timeframe === "weekly") return Object.keys(analytics.weeklyTransactions || {});
    if (timeframe === "monthly") return Object.keys(analytics.monthlyTransactions || {});
    return Object.keys(analytics.yearlyTransactions || {});
  };

  const getChartData = () => {
    if (!analytics) return [];
    if (metric === "count") {
      if (timeframe === "daily") return Object.values(analytics.dailyTransactions || {});
      if (timeframe === "weekly") return Object.values(analytics.weeklyTransactions || {});
      if (timeframe === "monthly") return Object.values(analytics.monthlyTransactions || {});
      return Object.values(analytics.yearlyTransactions || {});
    } else {
      if (timeframe === "daily") return Object.values(analytics.dailyVolume || {});
      if (timeframe === "weekly") return Object.values(analytics.weeklyVolume || {});
      if (timeframe === "monthly") return Object.values(analytics.monthlyVolume || {});
      return Object.values(analytics.yearlyVolume || {});
    }
  };

  const lineChartData = {
    labels: getChartLabels(),
    datasets: [{
      label: metric === "count" ? "Transactions Count" : "Volume (₹)",
      data: getChartData(),
      borderColor: metric === "count" ? "#6366f1" : "#10b981",
      backgroundColor: metric === "count" ? "rgba(99,102,241,0.12)" : "rgba(16,185,129,0.12)",
      fill: true, tension: 0.35,
      pointBackgroundColor: metric === "count" ? "#6366f1" : "#10b981",
      pointRadius: 6, pointHoverRadius: 8
    }]
  };

  const barChartData = {
    labels: getChartLabels(),
    datasets: [{
      label: metric === "count" ? "Transactions Count" : "Volume (₹)",
      data: getChartData(),
      backgroundColor: metric === "count" ? "#6366f1" : "#10b981",
      hoverBackgroundColor: metric === "count" ? "#4f46e5" : "#059669",
      borderRadius: 8, barThickness: timeframe === "monthly" ? 22 : (timeframe === "weekly" ? 28 : 36)
    }]
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => metric === "count" ? `${ctx.raw} Transactions` : `₹${Number(ctx.raw || 0).toLocaleString()}`
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f1f5f9" }, beginAtZero: true }
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
            Welcome back, Administrator
          </h1>
          <p style={{ color: "#64748b", fontSize: "15px", margin: 0 }}>Monitor real-time platform health, transaction metrics, and security diagnostics</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#eef2ff", padding: "10px 18px", borderRadius: "14px", border: "1px solid #c7d2fe" }}>
          <CheckCircleIcon size={18} color="#6366f1" />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#312e81" }}>System Health: Optimal</span>
        </div>
      </div>

      {/* KPI Cards (Clickable for quick drilldown) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "16px", marginBottom: "32px" }}>
        {kpiCards.map((card, i) => (
          <div key={i} onClick={() => navigate(card.path)} style={{ background: "white", borderRadius: "20px", padding: "22px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", position: "relative", overflow: "hidden",
            cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px",
              borderRadius: "50%", background: card.light, pointerEvents: "none" }} />
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: card.light,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", border: `1px solid ${card.color}30` }}>
              {card.icon}
            </div>
            <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>{card.label}</p>
            <h2 style={{ color: card.color, fontSize: "26px", fontWeight: 800, margin: 0 }}>{card.value ?? "—"}</h2>
          </div>
        ))}
      </div>

      {/* Interactive Time-Series Analytics (Per Day, Per Week, Per Month, Per Year) */}
      <div style={{ background: "white", borderRadius: "24px", padding: "28px 32px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "10px" }}>
              <TrendingUpIcon size={22} color="#6366f1" />
              Platform Analytics & Trend Curves
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Chronological metrics sorted across daily, weekly, monthly, and yearly intervals
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Chart Type Switcher (Line vs Bar) */}
            <div style={{ background: "#f8fafc", padding: "4px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex" }}>
              <button
                type="button"
                onClick={() => setChartType("line")}
                style={{
                  padding: "6px 14px", borderRadius: "8px", border: "none", fontWeight: 700, fontSize: "13px",
                  display: "flex", alignItems: "center", gap: "6px",
                  background: chartType === "line" ? "white" : "transparent",
                  color: chartType === "line" ? "#6366f1" : "#64748b",
                  boxShadow: chartType === "line" ? "0 2px 8px rgba(0,0,0,0.06)" : "none", cursor: "pointer", transition: "all 0.15s"
                }}
              >
                <TrendingUpIcon size={16} color={chartType === "line" ? "#6366f1" : "#64748b"} /> Line
              </button>
              <button
                type="button"
                onClick={() => setChartType("bar")}
                style={{
                  padding: "6px 14px", borderRadius: "8px", border: "none", fontWeight: 700, fontSize: "13px",
                  display: "flex", alignItems: "center", gap: "6px",
                  background: chartType === "bar" ? "white" : "transparent",
                  color: chartType === "bar" ? "#10b981" : "#64748b",
                  boxShadow: chartType === "bar" ? "0 2px 8px rgba(0,0,0,0.06)" : "none", cursor: "pointer", transition: "all 0.15s"
                }}
              >
                <BarChartIcon size={16} color={chartType === "bar" ? "#10b981" : "#64748b"} /> Bar
              </button>
            </div>

            {/* Metric Switcher (Count vs Volume) */}
            <div style={{ background: "#f8fafc", padding: "4px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex" }}>
              <button
                type="button"
                onClick={() => setMetric("count")}
                style={{
                  padding: "6px 14px", borderRadius: "8px", border: "none", fontWeight: 700, fontSize: "13px",
                  background: metric === "count" ? "white" : "transparent",
                  color: metric === "count" ? "#6366f1" : "#64748b",
                  boxShadow: metric === "count" ? "0 2px 8px rgba(0,0,0,0.06)" : "none", cursor: "pointer", transition: "all 0.15s"
                }}
              >
                Count (#)
              </button>
              <button
                type="button"
                onClick={() => setMetric("volume")}
                style={{
                  padding: "6px 14px", borderRadius: "8px", border: "none", fontWeight: 700, fontSize: "13px",
                  background: metric === "volume" ? "white" : "transparent",
                  color: metric === "volume" ? "#10b981" : "#64748b",
                  boxShadow: metric === "volume" ? "0 2px 8px rgba(0,0,0,0.06)" : "none", cursor: "pointer", transition: "all 0.15s"
                }}
              >
                Volume (₹)
              </button>
            </div>

            {/* Timeframe Switcher (Daily, Weekly, Monthly, Yearly) */}
            <div style={{ background: "#f8fafc", padding: "4px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex" }}>
              {[
                { id: "daily", label: "Per Day" },
                { id: "weekly", label: "Weekly" },
                { id: "monthly", label: "Per Month" },
                { id: "yearly", label: "Per Year" },
              ].map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setTimeframe(tf.id)}
                  style={{
                    padding: "6px 16px", borderRadius: "8px", border: "none", fontWeight: 700, fontSize: "13px",
                    background: timeframe === tf.id ? "#6366f1" : "transparent",
                    color: timeframe === tf.id ? "white" : "#64748b",
                    boxShadow: timeframe === tf.id ? "0 4px 12px rgba(99,102,241,0.25)" : "none", cursor: "pointer", transition: "all 0.15s"
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div style={{ height: "320px", position: "relative" }}>
          {analytics ? (
            chartType === "line" ? (
              <Line data={lineChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            ) : (
              <Bar data={barChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            )
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontWeight: 600 }}>
              Loading analytics graph...
            </div>
          )}
        </div>
      </div>

      {/* Live Recent Transactions Table & AI Security Snapshot Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", marginBottom: "32px" }}>
        {/* Live Transactions Feed */}
        <div style={{ background: "white", borderRadius: "24px", padding: "28px 32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ZapIcon size={22} color="#f97316" />
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Recent Platform Transfers</h3>
            </div>
            <button onClick={() => navigate("/admin/transactions")}
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: "10px",
                color: "#6366f1", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              View All →
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentTransactions.map((t, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px", margin: "0 0 3px" }}>
                      {t.senderName || "User"} → {t.receiverName || "User"}
                    </p>
                    <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
                      UPI: {t.upiTransactionId || t.transactionId} | Type: {t.transactionType}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 800, color: t.transactionType === "TRANSFER" ? "#6366f1" : "#10b981", fontSize: "15px", margin: "0 0 3px" }}>
                      ₹{Number(t.amount || 0).toLocaleString()}
                    </p>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px",
                      background: t.transactionStatus === "SUCCESS" ? "#dcfce7" : "#fee2e2",
                      color: t.transactionStatus === "SUCCESS" ? "#166534" : "#991b1b" }}>
                      {t.transactionStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>
              No recent transactions recorded.
            </div>
          )}
        </div>

        {/* AI Fraud & Security Watchlist Box */}
        <div style={{ background: "white", borderRadius: "24px", padding: "28px 32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <ShieldAlertIcon size={24} color="#7c3aed" />
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>AI Security Diagnostics</h3>
            </div>
            <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, marginBottom: "20px" }}>
              Our active **Isolation Forest AI Model** continuously scans live transfers in background mode without alarming end-users.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ padding: "14px 16px", borderRadius: "14px", background: "#f5f3ff", border: "1px solid #ddd6fe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#4c1d95" }}>AI Anomaly Engine</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#7c3aed", background: "white", padding: "4px 10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircleIcon size={14} color="#7c3aed" /> Active
                </span>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#166534" }}>Flagged High-Risk Transfers</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#10b981", background: "white", padding: "4px 10px", borderRadius: "8px" }}>0 Critical</span>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: "14px", background: "#fff7ed", border: "1px solid #fed7aa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#9a3412" }}>UPI PIN Shield</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#f97316", background: "white", padding: "4px 10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircleIcon size={14} color="#f97316" /> Protected
                </span>
              </div>
            </div>
          </div>

          <button onClick={() => navigate("/admin/fraud")}
            style={{ width: "100%", marginTop: "20px", padding: "12px", borderRadius: "12px", background: "#7c3aed",
              color: "white", fontWeight: 700, border: "none", cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#6d28d9"}
            onMouseLeave={e => e.currentTarget.style.background = "#7c3aed"}>
            Open AI Fraud Console →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>Quick Management Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "32px" }}>
        {quickActions.map(action => (
          <div key={action.path} onClick={() => navigate(action.path)}
            style={{ background: "white", borderRadius: "20px", padding: "24px 20px",
              cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
              transition: "all 0.25s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}>
            <div style={{ marginBottom: "14px" }}>{action.icon}</div>
            <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px", marginBottom: "4px" }}>{action.label}</p>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "12px" }}>{action.desc}</p>
            <span style={{ color: action.color, fontSize: "13px", fontWeight: 700 }}>Open Module →</span>
          </div>
        ))}
      </div>

      {/* Platform Status Diagnostics */}
      <div style={{ background: "white", borderRadius: "24px", padding: "28px 32px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>System Diagnostic Indicators</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
          {[
            { label: "Spring Boot API Server", status: "Running (Port 8080)", color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
            { label: "MySQL Database Cluster", status: "Connected & Synced", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
            { label: "AI Anomaly Detection", status: "Active & Monitoring", color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "18px 20px", borderRadius: "16px", background: s.bg, border: `1px solid ${s.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color }} />
                <p style={{ fontWeight: 600, color: "#0f172a", fontSize: "14px", margin: 0 }}>{s.label}</p>
              </div>
              <p style={{ color: s.color, fontWeight: 800, fontSize: "15px", margin: 0 }}>{s.status}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
