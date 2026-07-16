import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { UsersIcon, ActiveUsersIcon, BlockedUsersIcon, CheckCircleIcon, BanIcon, SearchIcon, ShieldAlertIcon } from "../components/AdminIcons";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try { const res = await API.get("/users/all"); setUsers(res.data); }
    catch (err) { console.log(err); }
  }

  async function blockUser(id) { await API.put(`/users/block/${id}`); loadUsers(); }
  async function activateUser(id) { await API.put(`/users/activate/${id}`); loadUsers(); }

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.upiId.toLowerCase().includes(search.toLowerCase())
  );

  const active = users.filter(u => u.status === "ACTIVE").length;
  const blocked = users.filter(u => u.status !== "ACTIVE").length;

  return (
    <AdminLayout>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <UsersIcon size={28} color="#0f172a" />
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>User Management</h1>
        </div>
        <p style={{ color: "#64748b", fontSize: "14px" }}>Manage WalletPay customers and administrators</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Users", value: users.length, color: "#6366f1", bg: "#eef2ff", icon: <UsersIcon size={24} color="#6366f1" /> },
          { label: "Active", value: active, color: "#10b981", bg: "#f0fdf4", icon: <ActiveUsersIcon size={24} color="#10b981" /> },
          { label: "Blocked", value: blocked, color: "#ef4444", bg: "#fef2f2", icon: <BlockedUsersIcon size={24} color="#ef4444" /> },
        ].map((s, i) => (
          <div key={i} style={{ background: "white", borderRadius: "18px", padding: "20px 24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
            display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: s.bg,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{s.icon}</div>
            <div>
              <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>{s.label}</p>
              <h2 style={{ color: s.color, fontSize: "24px", fontWeight: 800 }}>{s.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}><SearchIcon size={18} color="#94a3b8" /></span>
        <input placeholder="Search by name, email or UPI ID..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "14px 18px 14px 44px", borderRadius: "14px",
            border: "2px solid #e2e8f0", fontSize: "15px", background: "white", color: "#0f172a", outline: "none" }} />
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "20px", overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
                {["User", "Email", "UPI ID", "Role", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "16px 20px", textAlign: "left", color: "white",
                    fontWeight: 700, fontSize: "13px", letterSpacing: "0.3px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr key={user.id} style={{ background: idx % 2 === 0 ? "#f8fafc" : "white" }}>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "13px",
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 800, fontSize: "16px", flexShrink: 0 }}>
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>{user.fullName}</p>
                        <p style={{ color: "#94a3b8", fontSize: "12px" }}>ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", color: "#475569", fontSize: "14px" }}>{user.email}</td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <code style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px", fontSize: "13px", color: "#6366f1", fontWeight: 600 }}>{user.upiId}</code>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ background: user.role === "ADMIN" ? "#dbeafe" : "#ede9fe",
                      color: user.role === "ADMIN" ? "#1d4ed8" : "#6d28d9",
                      padding: "5px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%",
                        background: user.status === "ACTIVE" ? "#10b981" : "#ef4444" }} />
                      <span style={{ background: user.status === "ACTIVE" ? "#f0fdf4" : "#fef2f2",
                        color: user.status === "ACTIVE" ? "#15803d" : "#dc2626",
                        padding: "5px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    {user.role === "ADMIN" ? (
                      <span style={{ background: "#f1f5f9", color: "#94a3b8", padding: "8px 14px",
                        borderRadius: "10px", fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}><ShieldAlertIcon size={16} color="#94a3b8" /> Protected</span>
                    ) : user.status === "ACTIVE" ? (
                      <button onClick={() => blockUser(user.id)} style={{ padding: "8px 18px", borderRadius: "10px",
                        background: "linear-gradient(135deg,#ef4444,#f87171)", color: "white", border: "none",
                        fontWeight: 700, fontSize: "13px", boxShadow: "0 4px 12px rgba(239,68,68,0.25)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        <BanIcon size={16} color="white" /> Block
                      </button>
                    ) : (
                      <button onClick={() => activateUser(user.id)} style={{ padding: "8px 18px", borderRadius: "10px",
                        background: "linear-gradient(135deg,#10b981,#34d399)", color: "white", border: "none",
                        fontWeight: 700, fontSize: "13px", boxShadow: "0 4px 12px rgba(16,185,129,0.25)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircleIcon size={16} color="white" /> Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}><SearchIcon size={40} color="#94a3b8" /></div>
                    <p style={{ fontWeight: 600 }}>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;
