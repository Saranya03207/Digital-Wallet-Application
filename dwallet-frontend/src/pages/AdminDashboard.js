import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminDashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState({});

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {

        try {

            const response =
                await API.get("/admin/dashboard");

            setDashboard(response.data);

        } catch (error) {

            console.log(error);

        }

    }

    return (

        <AdminLayout>

            {/* HEADER */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "35px"
                }}
            >

                <div>

                    <h1
                        style={{
                            margin: 0,
                            color: "#1e293b"
                        }}
                    >
                        Welcome Administrator 👋
                    </h1>

                    <p
                        style={{
                            color: "#64748b",
                            marginTop: "8px"
                        }}
                    >
                        Monitor users, transactions and platform activity.
                    </p>

                </div>

            </div>

            {/* KPI */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "25px"
                }}
            >

                <DashboardCard
                    icon="👥"
                    title="Total Users"
                    value={dashboard.totalUsers}
                    color="#2563eb"
                />

                <DashboardCard
                    icon="🟢"
                    title="Active Users"
                    value={dashboard.activeUsers}
                    color="#16a34a"
                />

                <DashboardCard
                    icon="🚫"
                    title="Blocked Users"
                    value={dashboard.blockedUsers}
                    color="#dc2626"
                />

                <DashboardCard
                    icon="💳"
                    title="Transactions"
                    value={dashboard.totalTransactions}
                    color="#ea580c"
                />

                <DashboardCard
                    icon="💰"
                    title="Wallet Balance"
                    value={"₹" + dashboard.totalWalletBalance}
                    color="#7c3aed"
                />

            </div>

            {/* QUICK ACTIONS */}

            <h2
                style={{
                    marginTop: "45px",
                    marginBottom: "20px",
                    color: "#1e293b"
                }}
            >
                Quick Actions
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "25px"
                }}
            >

                <ActionCard
                    icon="👥"
                    title="Manage Users"
                    description="Block, Activate & View Users"
                    onClick={() => navigate("/admin/users")}
                />

                <ActionCard
                    icon="💳"
                    title="Transactions"
                    description="Monitor all transactions"
                    onClick={() => navigate("/admin/transactions")}
                />

                <ActionCard
                    icon="📊"
                    title="Analytics"
                    description="View platform statistics"
                    onClick={() => navigate("/admin/analytics")}
                />

                <ActionCard
                    icon="🤖"
                    title="AI Fraud Monitor"
                    description="Coming Soon"
                />

            </div>

            {/* SYSTEM STATUS */}

            <div
                style={{
                    marginTop: "45px",
                    background: "white",
                    borderRadius: "20px",
                    padding: "30px",
                    boxShadow: "0 10px 30px rgba(0,0,0,.08)"
                }}
            >

                <h2
                    style={{
                        marginTop: 0,
                        color: "#1e293b"
                    }}
                >
                    Platform Status
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: "25px",
                        marginTop: "25px"
                    }}
                >

                    <StatusBox
                        title="Server"
                        status="Running"
                        color="#16a34a"
                    />

                    <StatusBox
                        title="Database"
                        status="Connected"
                        color="#2563eb"
                    />

                    <StatusBox
                        title="AI Engine"
                        status="Coming Soon"
                        color="#f59e0b"
                    />

                </div>

            </div>

        </AdminLayout>

    );

}

function DashboardCard({

    icon,

    title,

    value,

    color

}) {

    return (

        <div
            style={{
                background: "white",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 10px 25px rgba(0,0,0,.08)"
            }}
        >

            <div
                style={{
                    fontSize: "38px"
                }}
            >
                {icon}
            </div>

            <h3
                style={{
                    color: "#64748b",
                    marginTop: "18px"
                }}
            >
                {title}
            </h3>

            <h1
                style={{
                    color,
                    marginTop: "12px"
                }}
            >
                {value}
            </h1>

        </div>

    );

}

function ActionCard({

    icon,

    title,

    description,

    onClick

}) {

    return (

        <div

            onClick={onClick}

            style={{

                cursor: "pointer",

                background: "white",

                borderRadius: "20px",

                padding: "30px",

                boxShadow: "0 10px 25px rgba(0,0,0,.08)",

                transition: ".3s"

            }}

        >

            <div
                style={{
                    fontSize: "40px"
                }}
            >
                {icon}
            </div>

            <h2
                style={{
                    marginTop: "18px",
                    color: "#1e293b"
                }}
            >
                {title}
            </h2>

            <p
                style={{
                    color: "#64748b"
                }}
            >
                {description}
            </p>

        </div>

    );

}

function StatusBox({

    title,

    status,

    color

}) {

    return (

        <div
            style={{
                background: "#f8fafc",
                borderRadius: "15px",
                padding: "20px",
                textAlign: "center"
            }}
        >

            <h3>{title}</h3>

            <h2
                style={{
                    color
                }}
            >
                {status}
            </h2>

        </div>

    );

}

export default AdminDashboard;