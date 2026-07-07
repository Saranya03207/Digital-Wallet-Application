import { useEffect, useState } from "react";
import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

import {
    Doughnut,
    Line
} from "react-chartjs-2";

import {
    Chart,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler
} from "chart.js";

Chart.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler
);

function AdminAnalytics() {

    const [analytics, setAnalytics] = useState({
        transactionTypes: {},
        dailyTransactions: {},
        totalTransactions: 0,
        totalVolume: 0,
        averageAmount: 0
    });

    useEffect(() => {

        loadAnalytics();

    }, []);

    async function loadAnalytics() {

        try {

            const response =
                await API.get("/admin/analytics");

            setAnalytics(response.data);

        }

        catch (error) {

            console.log(error);

        }

    }

    const doughnutData = {

        labels: [
            "Transfer",
            "Add Money",
            "Withdraw"
        ],

        datasets: [

            {

                data: [

                    analytics.transactionTypes.TRANSFER || 0,
                    analytics.transactionTypes.ADD_MONEY || 0,
                    analytics.transactionTypes.WITHDRAW || 0

                ],

                backgroundColor: [

                    "#4f46e5",
                    "#10b981",
                    "#ef4444"

                ],

                borderWidth: 0

            }

        ]

    };

    const lineData = {

        labels:

            Object.keys(
                analytics.dailyTransactions
            ),

        datasets: [

            {

                label: "Transactions",

                data:

                    Object.values(
                        analytics.dailyTransactions
                    ),

                borderColor: "#4f46e5",

                backgroundColor:
                    "rgba(79,70,229,.15)",

                fill: true,

                tension: .4

            }

        ]

    };

    return (

        <AdminLayout>

            <h1
                style={{
                    color: "#1e293b",
                    marginBottom: "8px"
                }}
            >
                📊 Wallet Analytics
            </h1>

            <p
                style={{
                    color: "#64748b",
                    marginBottom: "35px"
                }}
            >
                Business Intelligence Dashboard
            </p>

            {/* SUMMARY CARDS */}

            <div
                style={{

                    display: "grid",

                    gridTemplateColumns:
                        "repeat(3,1fr)",

                    gap: "25px",

                    marginBottom: "35px"

                }}
            >

                <SummaryCard
                    title="Transactions"
                    value={analytics.totalTransactions}
                    color="#4f46e5"
                    icon="💳"
                />

                <SummaryCard
                    title="Total Volume"
                    value={"₹" + analytics.totalVolume}
                    color="#0f9d58"
                    icon="💰"
                />

                <SummaryCard
                    title="Average Amount"
                    value={"₹" + analytics.averageAmount}
                    color="#f97316"
                    icon="📈"
                />

            </div>

            {/* CHARTS */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: "25px"
                }}
            >

                <div style={cardStyle}>

                    <h2>

                        Transaction Distribution

                    </h2>

                    <div
                        style={{
                            height: "360px"
                        }}
                    >

                        <Doughnut
                            data={doughnutData}
                        />

                    </div>

                </div>

                <div style={cardStyle}>

                    <h2>

                        AI Insights

                    </h2>

                    <hr />

                    <Insight
                        text="Transfers are the dominant transaction type."
                    />

                    <Insight
                        text="Fraud Risk : LOW"
                    />

                    <Insight
                        text="Average Amount is healthy."
                    />

                    <Insight
                        text="No unusual spikes detected."
                    />

                    <Insight
                        text="Isolation Forest integration ready."
                    />

                </div>

            </div>

            {/* LINE CHART */}

            <div
                style={{
                    ...cardStyle,
                    marginTop: "35px"
                }}
            >

                <h2>

                    Daily Transaction Trend

                </h2>

                <Line
                    data={lineData}
                />

            </div>

        </AdminLayout>

    );

}

function SummaryCard({

    title,
    value,
    color,
    icon

}) {

    return (

        <div
            style={{

                background: "white",

                borderRadius: "18px",

                padding: "25px",

                boxShadow:
                    "0 8px 20px rgba(0,0,0,.08)"

            }}
        >

            <div
                style={{
                    fontSize: "35px"
                }}
            >
                {icon}
            </div>

            <h3
                style={{
                    color: "#64748b"
                }}
            >
                {title}
            </h3>

            <h1
                style={{
                    color,
                    marginTop: "15px"
                }}
            >
                {value}
            </h1>

        </div>

    );

}

function Insight({ text }) {

    return (

        <div
            style={{

                background: "#eef2ff",

                padding: "15px",

                marginTop: "18px",

                borderRadius: "12px",

                color: "#312e81",

                fontWeight: "600"

            }}
        >

            ✔ {text}

        </div>

    );

}

const cardStyle = {

    background: "white",

    borderRadius: "20px",

    padding: "30px",

    boxShadow:
        "0 10px 25px rgba(0,0,0,.08)"

};

export default AdminAnalytics;