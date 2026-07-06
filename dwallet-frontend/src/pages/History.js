import { useEffect, useState } from "react";
import API from "../services/api";
import TopHeader from "../components/TopHeader";

function History() {

  const [transactions, setTransactions] =
    useState([]);

  const [wallet, setWallet] =
    useState(null);

  useEffect(() => {

    const userId =
      localStorage.getItem("userId");

    API.get(`/wallet/details/${userId}`)
      .then((response) => {
        setWallet(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    API.get(`/wallet/history/${userId}`)
      .then((response) => {

        setTransactions(
          Array.isArray(response.data)
            ? response.data
            : []
        );

      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  function getTransactionTitle(type) {

    if (type === "ADD_MONEY")
      return "💰 Add Money";

    if (type === "WITHDRAW")
      return "🏦 Withdraw";

    return "🔄 UPI Transfer";
  }

  function getAmountColor(type) {

    if (type === "ADD_MONEY")
      return "#10b981";

    if (type === "WITHDRAW")
      return "#ef4444";

    return "#f97316";
  }

  function getAmountDisplay(tx) {

  const currentUserId =
    Number(localStorage.getItem("userId"));

  if (tx.transactionType === "ADD_MONEY") {
    return `+₹${tx.amount}`;
  }

  if (tx.transactionType === "WITHDRAW") {
    return `-₹${tx.amount}`;
  }

  if (tx.transactionType === "TRANSFER") {

    if (tx.receiver?.id === currentUserId) {
      return `+₹${tx.amount}`;
    }

    return `-₹${tx.amount}`;
  }

  return `₹${tx.amount}`;
}

function getAmountColor(tx) {

  const currentUserId =
    Number(localStorage.getItem("userId"));

  if (tx.transactionType === "ADD_MONEY") {
    return "#10b981";
  }

  if (tx.transactionType === "WITHDRAW") {
    return "#ef4444";
  }

  if (tx.transactionType === "TRANSFER") {

    if (tx.receiver?.id === currentUserId) {
      return "#10b981";
    }

    return "#ef4444";
  }

  return "#64748b";
}

function getTransferLabel(tx) {

  const currentUserId =
    Number(localStorage.getItem("userId"));

  if (tx.transactionType !== "TRANSFER") {
    return null;
  }

  if (tx.receiver?.id === currentUserId) {
    return "📥 Money Received";
  }

  return "📤 Money Sent";
}


async function downloadStatement() {

  try {

    const userId =
      localStorage.getItem("userId");

    const response =
      await API.get(

        `/wallet/statement/${userId}`,

        {
          responseType: "blob"
        }

      );

    const url =
      window.URL.createObjectURL(
        new Blob([response.data])
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(

      "download",

      "WalletPay_Statement.pdf"

    );

    document.body.appendChild(link);

    link.click();

    link.remove();

  }

  catch(error){

    console.log(error);

    alert("Unable to download statement");

  }

}

  return (

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

      <div style={{ padding: "30px" }}>

        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
  }}
>

  <h1
    style={{
      color: "#1e293b",
      margin: 0
    }}
  >
    📜 Transaction History
  </h1>

  <button
    onClick={downloadStatement}
    style={{
      padding: "12px 22px",
      border: "none",
      borderRadius: "12px",
      background:
        "linear-gradient(135deg,#4f46e5,#7c3aed)",
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow:
        "0 8px 20px rgba(79,70,229,0.25)"
    }}
  >
    📄 Download Statement
  </button>

</div>

        {transactions.length === 0 ? (

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "20px",
              textAlign: "center",
              fontWeight: "bold"
            }}
          >
            No Transactions Found
          </div>

        ) : (

          transactions.map((tx) => (

            <div
              key={tx.transactionId}
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "20px",
                marginBottom: "20px",
                boxShadow:
                  "0 10px 25px rgba(0,0,0,0.08)"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}
              >

                {/* LEFT */}

                <div>
<h3
  style={{
    color: "#1e293b",
    marginBottom: "10px"
  }}
>
  {getTransactionTitle(
    tx.transactionType
  )}
</h3>

{tx.transactionType ===
  "TRANSFER" && (

  <p
    style={{
      color:
        tx.receiver?.id ===
        Number(
          localStorage.getItem(
            "userId"
          )
        )
          ? "#10b981"
          : "#ef4444",
      fontWeight: "bold"
    }}
  >
    {getTransferLabel(tx)}
  </p>

)}

                  {tx.transactionType ===
                    "TRANSFER" && (
                    <>
                      <p>
                        <strong>From :</strong>{" "}
                        {tx.sender?.upiId}
                      </p>

                      <p>
                        <strong>To :</strong>{" "}
                        {tx.receiver?.upiId}
                      </p>

                      <p>
                        <strong>Sender :</strong>{" "}
                        {tx.sender?.fullName}
                      </p>

                      <p>
                        <strong>Receiver :</strong>{" "}
                        {tx.receiver?.fullName}
                      </p>
                    </>
                  )}

                </div>

                {/* RIGHT */}

                <div
                  style={{
                    textAlign: "right"
                  }}
                >

                  <h2
  style={{
    color: getAmountColor(tx),
    marginBottom: "10px"
  }}
>
  {getAmountDisplay(tx)}
</h2>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginBottom: "5px"
                    }}
                  >
                    <strong>
                      UPI Txn ID
                    </strong>
                  </p>

                  <p
                    style={{
                      fontSize: "13px",
                      wordBreak: "break-all"
                    }}
                  >
                    {tx.upiTransactionId
                      ? tx.upiTransactionId
                      : "Not Available"}
                  </p>

                </div>

              </div>

              <hr
                style={{
                  margin: "15px 0"
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center"
                }}
              >

                <span
                  style={{
                    color:
                      tx.transactionStatus ===
                      "SUCCESS"
                        ? "#10b981"
                        : "#ef4444",
                    fontWeight: "bold"
                  }}
                >
                  {tx.transactionStatus ||
                    "SUCCESS"}
                </span>

                <span
                  style={{
                    color: "#64748b"
                  }}
                >
                  {new Date(
                    tx.transactionDate
                  ).toLocaleString()}
                </span>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );
}

export default History;