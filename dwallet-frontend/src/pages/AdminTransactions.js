import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminTransactions() {

    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {

        loadTransactions();

    }, []);

    async function loadTransactions() {

        try {

            const response =
                await API.get("/admin/all-transactions");

            setTransactions(response.data);

        }

        catch(error){

            console.log(error);

        }

    }

    const filtered = transactions.filter(tx =>

        tx.upiTransactionId
        ?.toLowerCase()
        .includes(search.toLowerCase())

    );

    return(

        <AdminLayout>

        <div
            style={{
                padding:"40px",
                background:"#f5f7fb",
                minHeight:"100vh"
            }}
        >

            <h1
                style={{
                    color:"#312e81",
                    marginBottom:"30px"
                }}
            >
                Transaction Monitoring
            </h1>

            <input

                placeholder="Search Transaction ID"

                value={search}

                onChange={(e)=>
                    setSearch(e.target.value)
                }

                style={{

                    width:"100%",

                    padding:"15px",

                    borderRadius:"10px",

                    marginBottom:"25px",

                    border:"1px solid #ddd"

                }}

            />

            <table
                style={{
                    width:"100%",
                    background:"white",
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

                        <th>Txn ID</th>

                        <th>Sender</th>

                        <th>Receiver</th>

                        <th>Amount</th>

                        <th>Status</th>

                        <th>Date</th>

                    </tr>

                </thead>

                <tbody>

                {

                    filtered.map(tx=>(

                        <tr key={tx.transactionId}>

                            <td>{tx.upiTransactionId}</td>

                            <td>{tx.sender?.fullName}</td>

                            <td>{tx.receiver?.fullName}</td>

                            <td>₹{tx.amount}</td>

                            <td>{tx.transactionStatus}</td>

                            <td>

                                {

                                    new Date(
                                        tx.transactionDate
                                    ).toLocaleString()

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

export default AdminTransactions;