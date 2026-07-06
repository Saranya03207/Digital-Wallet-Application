import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import TopHeader from "../components/TopHeader";
import HelpButton from "../components/HelpButton";

function Dashboard() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showBalance, setShowBalance] = useState(false);
  const [totalTransfer,setTotalTransfer]=useState(0);

  const navigate = useNavigate();
useEffect(() => {

  const userId = localStorage.getItem("userId");

if (!userId) {
  navigate("/");
  return;
}
  API.get(`/wallet/details/${userId}`)
    .then((response) => {
      setWallet(response.data);
    })
    .catch((error) => {
      console.log(error);
    });

  API.get(`/wallet/history/${userId}`)
    .then((response) => {

      console.log("History =", response.data);

      const txns = Array.isArray(response.data)
        ? response.data
        : [];

      setTransactions(txns);

        let transferred = 0;

      txns.forEach((txn) => {


        if (txn.transactionType === "TRANSFER") {
          transferred += Number(txn.amount);
        }

      });

      setTotalTransfer(transferred);

    })
    .catch((error) => {
      console.log(error);
    });

}, [navigate]);
  return (
    <>

      <div
  style={{
    maxWidth: "1400px",
    margin: "auto",
    padding: "30px",
    minHeight: "100vh",
    background:
      "linear-gradient(to bottom,#f8fafc,#eef2ff)"
  }}
>

        <TopHeader wallet={wallet} />
        

        <div style={{ padding: "35px" }}>
          <h1
            style={{
              color: "#1e293b",
              marginBottom: "5px",
            }}
          >
            Welcome {wallet?.user?.fullName} 👋
          </h1>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Manage your wallet securely and instantly.
          </p>

{/* Balance Card */}

<div
  style={{
    width: "100%",
    background:
      "linear-gradient(135deg,#4f46e5,#7c3aed,#9333ea)",
    color: "white",
    padding: "40px",
    borderRadius: "25px",
    boxShadow:
      "0 20px 40px rgba(124,58,237,0.25)",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >

    <div>

      <h3>Available Balance</h3>

      <h1
        style={{
          fontSize: "50px",
          marginTop: "15px"
        }}
      >
        {showBalance
          ? `₹${wallet?.balance}`
          : "••••••••"}
      </h1>

      <div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "15px"
  }}
>

  <button
    onClick={() =>
      setShowBalance(!showBalance)
    }
    style={{
      padding: "10px 20px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      color: "#4f46e5",
      fontWeight: "bold"
    }}
  >
    {showBalance
      ? "Hide Balance"
      : "Show Balance"}
  </button>

  <button
    onClick={() =>
      navigate("/add-money")
    }
    style={{
      padding: "10px 18px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      background: "#10b981",
      color: "white",
      fontWeight: "bold"
    }}
  >
    + Add Money
  </button>

</div>

    </div>

    <div
      style={{
        textAlign: "right"
      }}
    >

      <h3>UPI ID</h3>
      <h2>
        {wallet?.user?.upiId}
      </h2>

      <h3
        style={{
          marginTop: "20px"
        }}
      >
        Reward Points
      </h3>

      <h2>
        {wallet?.user?.rewardPoints}
      </h2>

      <h3
        style={{
          marginTop: "20px"
        }}
      >
        Daily Limit
      </h3>

      <h2>
        ₹{wallet?.user?.dailyTransferLimit}
      </h2>

    </div>

  </div>
</div>

{/* Wallet Statistics */}

<h2
  style={{
    marginTop: "40px",
    marginBottom: "20px"
  }}
>
  Wallet Statistics
</h2>

<div
  style={{
    background: "white",
    borderRadius: "20px",
    padding: "25px",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-around",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)"
  }}
>

  <div>
    <h3>🔄 Total Transfer</h3>
    <h1
      style={{
        color: "#f97316"
      }}
    >
      ₹{totalTransfer}
    </h1>
  </div>

  <div>
    <h3>📄 Transactions</h3>
    <h1
      style={{
        color: "#4f46e5"
      }}
    >
      {transactions.length}
    </h1>
  </div>

</div>

          {/* Quick Actions */}

          <h2
            style={{
              marginTop: "50px",
              marginBottom: "20px",
              transform: "translateY(-8px)",
              transition: "0.3s"
            }}
          >
            Quick Actions
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "25px",
            }}
          >
            
            <div
              onClick={() => navigate("/transfer")}
              style={cardStyle(
                "linear-gradient(135deg,#f97316,#fb923c)"
              )}
            >
              <h1>🔄</h1>
              <h2>Transfer</h2>
              <p>Send money instantly</p>
            </div>

            <div
              onClick={() => navigate("/history")}
              style={cardStyle(
                "linear-gradient(135deg,#7c3aed,#a855f7)"
              )}
            >
              <h1>📜</h1>
              <h2>History</h2>
              <p>View transactions</p>
            </div>
          </div>

          {/* Recent Activity */}
{/* Recent Activity */}

<h2
  style={{
    marginTop: "40px",
    marginBottom: "20px"
  }}
>
  Recent Activity
</h2>

<div
  style={{
    background: "white",
    borderRadius: "20px",
    padding: "25px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",
    marginTop: "15px",
  }}
>
  {Array.isArray(transactions) &&
  transactions.length > 0 ? (

    transactions.slice(0, 3).map((txn) => (

      <div
        key={txn.transactionId}
        style={{
          background: "#f8fafc",
          borderRadius: "18px",
          padding: "20px",
          marginBottom: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow:
            "0 5px 15px rgba(0,0,0,0.05)"
        }}
      >

        <div>

          <h3
            style={{
              margin: 0,
              color: "#1e293b"
            }}
          >
            🔄 UPI Transfer
          </h3>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b"
            }}
          >
            {new Date(
              txn.transactionDate
            ).toLocaleString()}
          </p>

          <p
            style={{
              color:"#64748b",
              fontSize:"13px"
            }}
          >
            Txn ID : {txn.upiTransactionId}
          </p>

        </div>

        <h2
          style={{
            color:"#f97316",
            margin:0
          }}
        >
          ₹{txn.amount}
        </h2>

      </div>

    ))

  ) : (

    <p>No Transactions Found</p>

  )}
</div>

</div>
</div>

<HelpButton />
</>
  );
}

function cardStyle(background) {
  return {
    background,
    color: "white",
    padding: "30px",
    borderRadius: "25px",
    cursor: "pointer",
    minHeight: "180px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
  };
}

export default Dashboard;