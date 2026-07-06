import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminDashboard() {

    const [dashboard, setDashboard] = useState({});
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {

        loadDashboard();
        loadUsers();

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

    async function loadUsers() {

        try {

            const response =
                await API.get("/users/all");

            setUsers(response.data);

        } catch (error) {

            console.log(error);

        }

    }

    async function blockUser(id) {

        try {

            await API.put(`/users/block/${id}`);

            loadUsers();
            loadDashboard();

        } catch (error) {

            console.log(error);

        }

    }

    async function activateUser(id) {

        try {

            await API.put(`/users/activate/${id}`);

            loadUsers();
            loadDashboard();

        } catch (error) {

            console.log(error);

        }

    }

    const filteredUsers = users.filter(user =>

        user.fullName.toLowerCase().includes(search.toLowerCase()) ||

        user.email.toLowerCase().includes(search.toLowerCase()) ||

        user.upiId.toLowerCase().includes(search.toLowerCase())

    );

    return (


<AdminLayout>
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                padding: "40px"
            }}
        >

            <h1
                style={{
                    color: "#312e81",
                    marginBottom: "35px"
                }}
            >
                WalletPay Admin Dashboard
            </h1>

            {/* DASHBOARD CARDS */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5,1fr)",
                    gap: "20px",
                    marginBottom: "40px"
                }}
            >

                <Card
                    title="Total Users"
                    value={dashboard.totalUsers}
                    color="#2563eb"
                />

                <Card
                    title="Active Users"
                    value={dashboard.activeUsers}
                    color="#16a34a"
                />

                <Card
                    title="Blocked Users"
                    value={dashboard.blockedUsers}
                    color="#dc2626"
                />

                <Card
                    title="Transactions"
                    value={dashboard.totalTransactions}
                    color="#ea580c"
                />

                <Card
                    title="Wallet Balance"
                    value={"₹" + dashboard.totalWalletBalance}
                    color="#7c3aed"
                />

            </div>

            {/* SEARCH */}

            <input

                type="text"

                placeholder="Search by Name, Email or UPI"

                value={search}

                onChange={(e) =>
                    setSearch(e.target.value)
                }

                style={{

                    width: "100%",

                    padding: "15px",

                    borderRadius: "12px",

                    border: "1px solid #ddd",

                    marginBottom: "25px",

                    fontSize: "16px"

                }}

            />

            {/* USER TABLE */}

            <div
                style={{
                    background: "white",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow:
                        "0 10px 30px rgba(0,0,0,.08)"
                }}
            >

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >

                    <thead
                        style={{
                            background: "#4f46e5",
                            color: "white"
                        }}
                    >

                        <tr>

                            <th style={thStyle}>Name</th>

                            <th style={thStyle}>Email</th>

                            <th style={thStyle}>UPI ID</th>

                            <th style={thStyle}>Status</th>

                            <th style={thStyle}>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            filteredUsers.map(user => (

                                <tr key={user.id}>

                                    <td style={tdStyle}>
                                        {user.fullName}
                                    </td>

                                    <td style={tdStyle}>
                                        {user.email}
                                    </td>

                                    <td style={tdStyle}>
                                        {user.upiId}
                                    </td>

                                    <td style={tdStyle}>

                                        <span
                                            style={{

                                                background:

                                                    user.status === "ACTIVE"

                                                        ? "#dcfce7"

                                                        : "#fee2e2",

                                                color:

                                                    user.status === "ACTIVE"

                                                        ? "#15803d"

                                                        : "#dc2626",

                                                padding:
                                                    "8px 14px",

                                                borderRadius:
                                                    "30px",

                                                fontWeight:
                                                    "bold"

                                            }}
                                        >

                                            {user.status}

                                        </span>

                                    </td>

                                    <td style={tdStyle}>

                                        {

                                            user.status === "ACTIVE"

                                                ?

                                                <button

                                                    onClick={() =>
                                                        blockUser(user.id)
                                                    }

                                                    style={{

                                                        background:
                                                            "#dc2626",

                                                        color:
                                                            "white",

                                                        border:
                                                            "none",

                                                        padding:
                                                            "10px 18px",

                                                        borderRadius:
                                                            "10px",

                                                        cursor:
                                                            "pointer"

                                                    }}

                                                >

                                                    Block

                                                </button>

                                                :

                                                <button

                                                    onClick={() =>
                                                        activateUser(user.id)
                                                    }

                                                    style={{

                                                        background:
                                                            "#16a34a",

                                                        color:
                                                            "white",

                                                        border:
                                                            "none",

                                                        padding:
                                                            "10px 18px",

                                                        borderRadius:
                                                            "10px",

                                                        cursor:
                                                            "pointer"

                                                    }}

                                                >

                                                    Activate

                                                </button>

                                        }

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

        </div>

        </AdminLayout>


    );

}

function Card({

    title,
    value,
    color

}) {

    return (

        <div

            style={{

                background: "white",

                padding: "30px",

                borderRadius: "20px",

                boxShadow:
                    "0 10px 25px rgba(0,0,0,.08)"

            }}

        >

            <h3
                style={{
                    color: "#64748b"
                }}
            >
                {title}
            </h3>

            <h1
                style={{
                    color: color,
                    marginTop: "20px"
                }}
            >
                {value}
            </h1>

        </div>

    );

}

const thStyle = {

    padding: "18px",

    textAlign: "left"

};

const tdStyle = {

    padding: "18px",

    borderBottom: "1px solid #eee"

};

export default AdminDashboard;