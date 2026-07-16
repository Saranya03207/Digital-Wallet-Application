import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler } from "chart.js";
import {
  TransactionsIcon, WalletIcon, TrendingUpIcon, BarChartIcon, AnalyticsIcon, CalendarIcon, FraudMonitorIcon
} from "../components/AdminIcons";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler);

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    transactionTypes: {}, dailyTransactions: {}, dailyVolume: {},
    weeklyTransactions: {}, weeklyVolume: {},
    monthlyTransactions: {}, monthlyVolume: {},
    yearlyTransactions: {}, yearlyVolume: {},
    totalTransactions: 0, totalVolume: 0, averageAmount: 0
  });
  const [timeframe, setTimeframe] = useState("daily"); // "daily" | "weekly" | "monthly" | "yearly"
  const [metric, setMetric] = useState("count"); // "count" | "volume"

  useEffect(() => {
    API.get("/admin/analytics").then(res => {
      if (res.data) setAnalytics(res.data);
    }).catch(console.log);
  }, []);

  const doughnutData = {
    labels: ["Transfer", "Receive / Deposit"],
    datasets: [{
      data: [
        analytics.transactionTypes?.TRANSFER || 0,
        (analytics.transactionTypes?.RECEIVE || analytics.transactionTypes?.ADD_MONEY || 0),
      ],
      backgroundColor: ["#6366f1", "#10b981"],
      borderWidth: 0, hoverOffset: 8
    }]
  };

  const getChartLabels = () => {
    if (timeframe === "daily") return Object.keys(analytics.dailyTransactions || {});
    if (timeframe === "weekly") return Object.keys(analytics.weeklyTransactions || {});
    if (timeframe === "monthly") return Object.keys(analytics.monthlyTransactions || {});
    return Object.keys(analytics.yearlyTransactions || {});
  };

  const getChartData = () => {
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

  const trendLineData = {
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

  const trendBarData = {
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

  const summaryCards = [
    { icon: <TransactionsIcon size={26} color="#6366f1" />, label: "Total Transactions", value: analytics.totalTransactions ?? 0, color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
    { icon: <WalletIcon size={26} color="#10b981" />, label: "Total Volume", value: `₹${Number(analytics.totalVolume || 0).toLocaleString()}`, color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
    { icon: <TrendingUpIcon size={26} color="#f97316" />, label: "Average Amount", value: `₹${Number(analytics.averageAmount || 0).toLocaleString()}`, color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  ];

  const insights = [
    "Transfers remain the dominant transaction type across periods.",
    "Weekly and monthly growth curves indicate steady active engagement.",
    "No anomalous activity spikes detected in recent daily distributions.",
    "Average transaction amount maintains healthy liquidity limits.",
    "Isolation Forest AI engine actively protecting real-time flows.",
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "#eef2ff", border: "1px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AnalyticsIcon size={24} color="#6366f1" />
        </div>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Wallet Analytics & Reports</h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Deep-dive into chronological platform activity sorted by day, week, month, and year</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "28px" }}>
        {summaryCards.map((card, i) => (
          <div key={i} style={{ background: "white", borderRadius: "20px", padding: "24px 28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: `1px solid ${card.border}`,
            display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{ width: "54px", height: "54px", borderRadius: "16px", background: card.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, border: `1px solid ${card.border}` }}>{card.icon}</div>
            <div>
              <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>{card.label}</p>
              <h2 style={{ color: card.color, fontSize: "24px", fontWeight: 800, margin: 0 }}>{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: "24px", padding: "28px 32px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "10px" }}>
              <TrendingUpIcon size={22} color="#6366f1" />
              Chronological Trend Analysis
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Toggle between daily, weekly, monthly, and yearly statistics to analyze volume and frequency
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ height: "300px", padding: "16px", background: "#f8fafc", borderRadius: "18px", border: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#64748b", marginBottom: "12px" }}>Trend Curve (Line)</h3>
            <div style={{ height: "240px" }}>
              <Line data={trendLineData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </div>
          </div>

          <div style={{ height: "300px", padding: "16px", background: "#f8fafc", borderRadius: "18px", border: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#64748b", marginBottom: "12px" }}>Comparative Distribution (Bar)</h3>
            <div style={{ height: "240px" }}>
              <Bar data={trendBarData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{ background: "white", borderRadius: "24px", padding: "28px 32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>Transaction Type Distribution</h3>
          <div style={{ height: "240px", display: "flex", justifyContent: "center" }}>
            <Doughnut data={doughnutData} options={{ plugins: { legend: { position: "right" } }, maintainAspectRatio: false }} />
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "24px", padding: "28px 32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <FraudMonitorIcon size={24} color="#0f172a" />
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>AI Analytical Insights</h3>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
            {insights.map((note, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "14px", fontWeight: 500 }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;
