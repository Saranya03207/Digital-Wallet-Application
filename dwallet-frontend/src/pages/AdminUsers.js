import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {

        loadUsers();

    }, []);

    async function loadUsers() {

        try {

            const response =
                await API.get("/users/all");

            setUsers(response.data);

        }

        catch (error) {

            console.log(error);

        }

    }

    async function blockUser(id) {

        try {

            await API.put(`/users/block/${id}`);

            alert("User Blocked Successfully");

            loadUsers();

        }

        catch (error) {

            console.log(error);

        }

    }

    async function activateUser(id) {

        try {

            await API.put(`/users/activate/${id}`);

            alert("User Activated Successfully");

            loadUsers();

        }

        catch (error) {

            console.log(error);

        }

    }

    const filteredUsers =
        users.filter(user =>

            user.fullName
                .toLowerCase()
                .includes(search.toLowerCase())

            ||

            user.email
                .toLowerCase()
                .includes(search.toLowerCase())

            ||

            user.upiId
                .toLowerCase()
                .includes(search.toLowerCase())

        );

    return (

        <AdminLayout>

            <h1
                style={{
                    color: "#312e81",
                    marginBottom: "30px"
                }}
            >
                User Management
            </h1>

            <input

                type="text"

                placeholder="Search Name, Email or UPI"

                value={search}

                onChange={(e) =>
                    setSearch(e.target.value)
                }

                style={{

                    width: "100%",

                    padding: "15px",

                    borderRadius: "12px",

                    border: "1px solid #ddd",

                    marginBottom: "30px",

                    fontSize: "16px"

                }}

            />

            <div
                style={{

                    background: "white",

                    borderRadius: "20px",

                    overflow: "hidden",

                    boxShadow:
                        "0 10px 25px rgba(0,0,0,.08)"

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

                            <th style={thStyle}>Role</th>

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
                                        {user.role}
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

                                                padding: "8px 15px",

                                                borderRadius: "30px",

                                                fontWeight: "bold"

                                            }}
                                        >

                                            {user.status}

                                        </span>

                                    </td>

                                    <td style={tdStyle}>

                                        {

                                            user.role === "ADMIN"

                                                ?

                                                <span
                                                    style={{
                                                        color: "#64748b",
                                                        fontWeight: "bold"
                                                    }}
                                                >
                                                    Protected
                                                </span>

                                                :

                                                user.status === "ACTIVE"

                                                    ?

                                                    <button

                                                        onClick={() =>
                                                            blockUser(user.id)
                                                        }

                                                        style={{

                                                            background: "#dc2626",

                                                            color: "white",

                                                            border: "none",

                                                            padding: "10px 18px",

                                                            borderRadius: "10px",

                                                            cursor: "pointer"

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

                                                            background: "#16a34a",

                                                            color: "white",

                                                            border: "none",

                                                            padding: "10px 18px",

                                                            borderRadius: "10px",

                                                            cursor: "pointer"

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

        </AdminLayout>

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

export default AdminUsers;