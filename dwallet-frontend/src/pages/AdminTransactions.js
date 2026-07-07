import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminTransactions() {

   const [transactions, setTransactions] = useState([]);

const [dashboard, setDashboard] = useState({

    totalTransactions: 0,

    analysedTransactions: 0,

    normalTransactions: 0,

    suspiciousTransactions: 0,

    fraudTransactions: 0,

    averageScore: 0

});
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {

    loadTransactions();

    loadDashboard();

}, []);

    async function loadTransactions() {

    try {

        const response = await API.get("/admin/transactions");

        console.log("Backend Response");
        console.log(response.data);

        setTransactions(response.data);

    }

    catch(error){

        console.log(error);

    }

}

async function loadDashboard() {

    try {

        const response = await API.get("/admin/ai-dashboard");

        setDashboard(response.data);

    }

    catch (error) {

        console.log(error);

    }

}

    const filtered = transactions.filter(tx => {

        const matchesSearch =

            tx.upiTransactionId?.toLowerCase().includes(search.toLowerCase())

            ||

            tx.senderName?.toLowerCase().includes(search.toLowerCase())

            ||

            tx.receiverName?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =

            statusFilter === "ALL"

            ||

            tx.transactionStatus === statusFilter;

        return matchesSearch && matchesStatus;

    });

    const totalAmount = filtered.reduce(

        (sum, tx) => sum + Number(tx.amount),

        0

    );

    const suspiciousCount =

        filtered.filter(

            tx => tx.aiPrediction === "Suspicious"

        ).length;

    const normalCount =

        filtered.filter(

            tx => tx.aiPrediction === "Normal"

        ).length;

    return (

        <AdminLayout>

            <h1
                style={{
                    color:"#1e293b"
                }}
            >
                💳 Transaction Monitoring
            </h1>

            <p
                style={{
                    color:"#64748b",
                    marginBottom:"30px"
                }}
            >
                Monitor every transaction processed by WalletPay AI.
            </p>

            <div
                style={{
                    display:"grid",
                    gridTemplateColumns:"repeat(4,1fr)",
                    gap:"20px",
                    marginBottom:"30px"
                }}
            >

                <SummaryCard

title="Transactions"

value={dashboard.totalTransactions}

color="#4f46e5"

/>

                <SummaryCard

title="AI Analysed"

value={dashboard.analysedTransactions}

color="#0891b2"

/>

                <SummaryCard

title="Normal"

value={dashboard.normalTransactions}

color="#22c55e"

/>

               <SummaryCard

title="Suspicious"

value={dashboard.suspiciousTransactions}

color="#f97316"

/>

<SummaryCard

title="Average Score"

value={dashboard.averageScore.toFixed(2)+"%"}

color="#9333ea"

/>

            </div>

            <div
                style={{
                    display:"flex",
                    gap:"20px",
                    marginBottom:"25px"
                }}
            >

                <input

                    placeholder="Search Transaction / User"

                    value={search}

                    onChange={(e)=>setSearch(e.target.value)}

                    style={{

                        flex:1,

                        padding:"15px",

                        borderRadius:"12px",

                        border:"1px solid #ddd"

                    }}

                />

                <select

                    value={statusFilter}

                    onChange={(e)=>setStatusFilter(e.target.value)}

                    style={{

                        width:"180px",

                        borderRadius:"12px",

                        padding:"15px"

                    }}

                >

                    <option value="ALL">All Status</option>

                    <option value="SUCCESS">SUCCESS</option>

                    <option value="FAILED">FAILED</option>

                    <option value="PENDING">PENDING</option>

                </select>

            </div>

            <div
                style={{

                    background:"white",

                    borderRadius:"20px",

                    overflow:"hidden",

                    boxShadow:"0 10px 25px rgba(0,0,0,.08)"

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

                            <th style={th}>Txn ID</th>

                            <th style={th}>Sender</th>

                            <th style={th}>Receiver</th>

                            <th style={th}>Amount</th>

                            <th style={th}>Status</th>

                            <th style={th}>AI Result</th>

                            <th style={th}>Confidence</th>

                            <th style={th}>Reason</th>

                            <th style={th}>Date</th>

                        </tr>

                    </thead>

                    <tbody>

                    {

                        filtered.map(tx=>(

                        <tr key={tx.transactionId}>

                            <td style={td}>
                                {tx.upiTransactionId}
                            </td>

                            <td style={td}>
                                {tx.senderName}
                            </td>

                            <td style={td}>
                                {tx.receiverName}
                            </td>

                            <td
                                style={{
                                    ...td,
                                    color:"#10b981",
                                    fontWeight:"bold"
                                }}
                            >
                                ₹{tx.amount}
                            </td>

                            <td style={td}>
                                <StatusBadge
                                    status={tx.transactionStatus}
                                />
                            </td>

                            <td style={td}>
                                <RiskBadge
                                    risk={tx.aiPrediction}
                                />
                            </td>

                            <td style={td}>
                                <ConfidenceBar
                                    score={tx.aiScore}
                                />
                            </td>

                            <td
                                style={{
                                    ...td,
                                    maxWidth:"250px"
                                }}
                                title={tx.aiReason}
                            >
                                {tx.aiReason || "-"}
                            </td>

                            <td style={td}>
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
function SummaryCard({ title, value, color }) {

    return (

        <div
            style={{
                background: "white",
                padding: "25px",
                borderRadius: "18px",
                boxShadow: "0 8px 20px rgba(0,0,0,.08)"
            }}
        >

            <h3
                style={{
                    color: "#64748b",
                    marginBottom: "10px"
                }}
            >
                {title}
            </h3>

            <h1
                style={{
                    color: color,
                    fontSize: "32px",
                    margin: 0
                }}
            >
                {value}
            </h1>

        </div>

    );

}

function RiskBadge({ risk }) {

    if (!risk) {

        return (

            <span
                style={{
                    background: "#e5e7eb",
                    color: "#374151",
                    padding: "8px 16px",
                    borderRadius: "30px",
                    fontWeight: "bold"
                }}
            >
                Not Analysed
            </span>

        );

    }

    let background = "#dcfce7";
    let color = "#15803d";

    if (risk === "Suspicious") {

        background = "#fef3c7";
        color = "#b45309";

    }

    if (risk === "Fraud") {

        background = "#fee2e2";
        color = "#dc2626";

    }

    return (

        <span
            style={{
                background,
                color,
                padding: "8px 16px",
                borderRadius: "30px",
                fontWeight: "bold"
            }}
        >
            {risk}
        </span>

    );

}

function ConfidenceBar({ score }) {

    if (score == null) {

        return (
            <span style={{ color: "#64748b" }}>
                -
            </span>
        );

    }

    let color = "#16a34a";

    if (score < 90)
        color = "#f59e0b";

    if (score < 70)
        color = "#dc2626";

    return (

        <div style={{ width: "120px" }}>

            <div
                style={{
                    height: "10px",
                    background: "#e5e7eb",
                    borderRadius: "20px",
                    overflow: "hidden"
                }}
            >

                <div
                    style={{
                        width: score + "%",
                        height: "100%",
                        background: color,
                        borderRadius: "20px"
                    }}
                />

            </div>

            <div
                style={{
                    marginTop: "5px",
                    fontWeight: "bold",
                    color
                }}
            >
                {score.toFixed(2)}%
            </div>

        </div>

    );

}

function StatusBadge({ status }) {

    let background = "#e0f2fe";
    let color = "#0369a1";

    if (status === "SUCCESS") {

        background = "#dcfce7";
        color = "#15803d";

    }

    if (status === "FAILED") {

        background = "#fee2e2";
        color = "#dc2626";

    }

    if (status === "PENDING") {

        background = "#fef3c7";
        color = "#b45309";

    }

    return (

        <span
            style={{
                background,
                color,
                padding: "8px 14px",
                borderRadius: "25px",
                fontWeight: "bold"
            }}
        >
            {status}
        </span>

    );

}

const th = {

    padding: "18px",
    textAlign: "left"

};

const td = {

    padding: "18px",
    borderBottom: "1px solid #eee",
    verticalAlign: "middle"

};

export default AdminTransactions;