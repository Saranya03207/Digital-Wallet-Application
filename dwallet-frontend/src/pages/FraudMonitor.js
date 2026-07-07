import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function FraudMonitor() {

    const [transactions, setTransactions] = useState([]);
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {

    loadData();

    const timer = setInterval(() => {

        loadData();

    }, 5000);

    return () => clearInterval(timer);

}, []);

    async function loadData() {

        try {

            const highRisk =
                await API.get("/admin/high-risk-transactions");

            setTransactions(highRisk.data);

            const ai =
                await API.get("/admin/ai-dashboard");

            setDashboard(ai.data);

        }

        catch (error) {

            console.log(error);

        }

    }

    return (

        <AdminLayout>

            <div>

                <h1
                    style={{
                        color: "#1e293b",
                        marginBottom: "8px"
                    }}
                >
                    🤖 AI Fraud Monitor
                </h1>

                <p
                    style={{
                        color: "#64748b",
                        marginBottom: "30px"
                    }}
                >
                    WalletPay AI continuously monitors suspicious and fraudulent transactions.
                </p>

                {/* SUMMARY CARDS */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                        gap: "20px",
                        marginBottom: "30px"
                    }}
                >

                    <Card
                        title="High Risk"
                        value={transactions.length}
                        color="#dc2626"
                    />

                    <Card
                        title="Suspicious"
                        value={dashboard?.suspiciousTransactions || 0}
                        color="#ea580c"
                    />

                    <Card
                        title="Fraud"
                        value={dashboard?.fraudTransactions || 0}
                        color="#991b1b"
                    />

                    <Card
                        title="Average Score"
                        value={(dashboard?.averageScore || 0).toFixed(2) + "%"}
                        color="#2563eb"
                    />

                </div>

                {/* ALERT */}

                {

                    transactions.length > 0 && (

                        <div
                            style={{
                                background: "#fee2e2",
                                color: "#b91c1c",
                                padding: "18px",
                                borderRadius: "12px",
                                marginBottom: "25px",
                                fontWeight: "bold",
                                border: "1px solid #fecaca"
                            }}
                        >

                            🚨 ALERT :
                            {" "}
                            {transactions.length}
                            {" "}
                            High Risk Transaction(s) detected.

                        </div>

                    )

                }

                {/* TABLE */}

                <div
                    style={{
                        overflowX: "auto",
                        background: "white",
                        borderRadius: "18px",
                        boxShadow: "0 8px 25px rgba(0,0,0,.08)"
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
                                background: "#4338ca",
                                color: "white"
                            }}
                        >

                            <tr>

                                <th style={th}>Txn ID</th>

                                <th style={th}>Sender</th>

                                <th style={th}>Receiver</th>

                                <th style={th}>Amount</th>

                                <th style={th}>AI Result</th>

                                <th style={th}>Confidence</th>

                                <th style={th}>Reason</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                transactions.length === 0 ?

                                    (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "50px",
                                                    color: "#64748b"
                                                }}
                                            >

                                                ✅ No Suspicious Transactions Found

                                            </td>

                                        </tr>

                                    )

                                    :

                                    (

                                        transactions.map(tx => (

                                            <tr
                                                key={tx.transactionId}
                                            >

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
                                                        fontWeight: "bold",
                                                        color: "#16a34a"
                                                    }}
                                                >
                                                    ₹{tx.amount}
                                                </td>

                                               <td style={td}>

    <span
        style={{
            background:
                tx.aiPrediction === "Fraud"
                    ? "#fee2e2"
                    : tx.aiPrediction === "Suspicious"
                        ? "#ffedd5"
                        : "#dcfce7",

            color:
                tx.aiPrediction === "Fraud"
                    ? "#dc2626"
                    : tx.aiPrediction === "Suspicious"
                        ? "#c2410c"
                        : "#15803d",

            padding: "8px 16px",

            borderRadius: "25px",

            fontWeight: "bold"
        }}
    >

        {

            tx.aiPrediction === "Fraud"

                ? "🔴 Fraud"

                : tx.aiPrediction === "Suspicious"

                    ? "🟠 Suspicious"

                    : "🟢 Normal"

        }

    </span>

</td>

<td style={td}>

    <div
        style={{
            width: "140px"
        }}
    >

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
                    width: `${tx.aiScore}%`,
                    height: "10px",

                    background:

                        tx.aiPrediction === "Fraud"

                            ? "#dc2626"

                            : tx.aiPrediction === "Suspicious"

                                ? "#f97316"

                                : "#22c55e",

                    borderRadius: "20px",

                    transition: ".5s"
                }}
            />

        </div>

        <div
            style={{
                marginTop: "8px",
                fontWeight: "bold",
                color: "#374151"
            }}
        >

            {tx.aiScore}%

        </div>

    </div>

</td>

<td style={td}>

    <div
        style={{
            maxWidth: "320px",
            color: "#475569",
            lineHeight: "22px"
        }}
    >

        {tx.aiReason}

    </div>

</td>
                                            </tr>

                                        ))

                                    )

                            }

                        </tbody>

                    </table>

                </div>

                {/* AI ENGINE STATUS */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: "25px",
                        marginTop: "35px"
                    }}
                >

                    {/* LEFT CARD */}

                    <div
                        style={{
                            background: "white",
                            padding: "25px",
                            borderRadius: "18px",
                            boxShadow: "0 8px 20px rgba(0,0,0,.08)"
                        }}
                    >

                        <h2>🧠 AI Engine Status</h2>

                        <hr
                            style={{
                                margin: "15px 0"
                            }}
                        />

                        <p>🟢 AI Model : Isolation Forest</p>

                        <p>🟢 FastAPI Service : Running</p>

                        <p>🟢 Spring Boot : Connected</p>

                        <p>🟢 Database : Connected</p>

                        <p>🟢 Auto Refresh : Every 5 Seconds</p>

                        <p>

                            Last Scan :

                            {" "}

                            {new Date().toLocaleTimeString()}

                        </p>

                    </div>

                    {/* RIGHT CARD */}

                    <div
                        style={{
                            background: "white",
                            padding: "25px",
                            borderRadius: "18px",
                            boxShadow: "0 8px 20px rgba(0,0,0,.08)"
                        }}
                    >

                        <h2>📌 AI Details</h2>

                        <hr
                            style={{
                                margin: "15px 0"
                            }}
                        />

                        <p>

                            <strong>Algorithm</strong>

                            <br />

                            Isolation Forest

                        </p>

                        <br />

                        <p>

                            <strong>Library</strong>

                            <br />

                            Scikit-Learn

                        </p>

                        <br />

                        <p>

                            <strong>Framework</strong>

                            <br />

                            FastAPI

                        </p>

                        <br />

                        <p>

                            <strong>Accuracy</strong>

                            <br />

                            {(dashboard?.averageScore || 0).toFixed(2)}%

                        </p>

                    </div>

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
                    color,
                    fontSize: "36px"
                }}
            >

                {value}

            </h1>

        </div>

    );

}

const th = {

    padding: "18px",

    textAlign: "left",

    fontWeight: "bold"

};

const td = {

    padding: "18px",

    borderBottom: "1px solid #e5e7eb"

};

export default FraudMonitor;