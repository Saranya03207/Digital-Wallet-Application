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

        await API.put(`/users/block/${id}`);

        loadUsers();

    }

    async function activateUser(id) {

        await API.put(`/users/activate/${id}`);

        loadUsers();

    }

    const filteredUsers = users.filter(user =>

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
                    color:"#1e293b",
                    marginBottom:"10px"
                }}
            >
                👥 User Management
            </h1>

            <p
                style={{
                    color:"#64748b",
                    marginBottom:"30px"
                }}
            >
                Manage WalletPay customers and administrators.
            </p>

            {/* SUMMARY */}

            <div
                style={{

                    background:"white",

                    padding:"25px",

                    borderRadius:"18px",

                    boxShadow:"0 8px 25px rgba(0,0,0,.08)",

                    marginBottom:"30px",

                    display:"flex",

                    justifyContent:"space-between",

                    alignItems:"center"

                }}
            >

                <div>

                    <h3
                        style={{
                            margin:0,
                            color:"#64748b"
                        }}
                    >
                        Total Registered Users
                    </h3>

                    <h1
                        style={{
                            marginTop:"10px",
                            color:"#4f46e5"
                        }}
                    >
                        {users.length}
                    </h1>

                </div>

            </div>

            {/* SEARCH */}

            <input

                placeholder="Search Name, Email or UPI"

                value={search}

                onChange={(e)=>setSearch(e.target.value)}

                style={{

                    width:"100%",

                    padding:"15px",

                    borderRadius:"12px",

                    border:"1px solid #ddd",

                    marginBottom:"25px",

                    fontSize:"16px"

                }}

            />

            {/* TABLE */}

            <div
                style={{

                    background:"white",

                    borderRadius:"20px",

                    overflow:"hidden",

                    boxShadow:"0 8px 25px rgba(0,0,0,.08)"

                }}
            >

                <table
                    style={{
                        width:"100%",
                        borderCollapse:"collapse"
                    }}
                >

                    <thead
                        style={{
                            background:"#4f46e5",
                            color:"white"
                        }}
                    >

                        <tr>

                            <th style={th}>User</th>

                            <th style={th}>Email</th>

                            <th style={th}>UPI</th>

                            <th style={th}>Role</th>

                            <th style={th}>Status</th>

                            <th style={th}>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            filteredUsers.map(user=>(

                                <tr key={user.id}>

                                    {/* USER */}

                                    <td style={td}>

                                        <div
                                            style={{

                                                display:"flex",

                                                alignItems:"center",

                                                gap:"15px"

                                            }}
                                        >

                                            <div
                                                style={{

                                                    width:"45px",

                                                    height:"45px",

                                                    borderRadius:"50%",

                                                    background:"#4f46e5",

                                                    color:"white",

                                                    display:"flex",

                                                    justifyContent:"center",

                                                    alignItems:"center",

                                                    fontWeight:"bold",

                                                    fontSize:"20px"

                                                }}
                                            >

                                                {user.fullName.charAt(0)}

                                            </div>

                                            <div>

                                                <b>{user.fullName}</b>

                                            </div>

                                        </div>

                                    </td>

                                    <td style={td}>{user.email}</td>

                                    <td style={td}>{user.upiId}</td>

                                    <td style={td}>

                                        <span
                                            style={{

                                                background:

                                                user.role==="ADMIN"

                                                ?

                                                "#dbeafe"

                                                :

                                                "#ede9fe",

                                                color:

                                                user.role==="ADMIN"

                                                ?

                                                "#2563eb"

                                                :

                                                "#4f46e5",

                                                padding:"8px 14px",

                                                borderRadius:"30px",

                                                fontWeight:"bold"

                                            }}
                                        >

                                            {user.role}

                                        </span>

                                    </td>

                                    <td style={td}>

                                        <span
                                            style={{

                                                background:

                                                user.status==="ACTIVE"

                                                ?

                                                "#dcfce7"

                                                :

                                                "#fee2e2",

                                                color:

                                                user.status==="ACTIVE"

                                                ?

                                                "#16a34a"

                                                :

                                                "#dc2626",

                                                padding:"8px 14px",

                                                borderRadius:"30px",

                                                fontWeight:"bold"

                                            }}
                                        >

                                            {user.status}

                                        </span>

                                    </td>

                                    <td style={td}>

                                        {

                                            user.role==="ADMIN"

                                            ?

                                            <button
                                                disabled
                                                style={{

                                                    background:"#94a3b8",

                                                    color:"white",

                                                    border:"none",

                                                    padding:"10px 16px",

                                                    borderRadius:"10px"

                                                }}
                                            >

                                                Protected

                                            </button>

                                            :

                                            user.status==="ACTIVE"

                                            ?

                                            <button

                                                onClick={()=>blockUser(user.id)}

                                                style={{

                                                    background:"#ef4444",

                                                    color:"white",

                                                    border:"none",

                                                    padding:"10px 18px",

                                                    borderRadius:"10px",

                                                    cursor:"pointer"

                                                }}

                                            >

                                                Block

                                            </button>

                                            :

                                            <button

                                                onClick={()=>activateUser(user.id)}

                                                style={{

                                                    background:"#16a34a",

                                                    color:"white",

                                                    border:"none",

                                                    padding:"10px 18px",

                                                    borderRadius:"10px",

                                                    cursor:"pointer"

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

const th={

    padding:"18px",

    textAlign:"left"

};

const td={

    padding:"18px",

    borderBottom:"1px solid #eee"

};

export default AdminUsers;