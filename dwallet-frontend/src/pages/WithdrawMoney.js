import { useState, useEffect } from "react";
import API from "../services/api";
import TopHeader from "../components/TopHeader";

function WithdrawMoney() {

  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(null);

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

  }, []);

  async function handleWithdraw(e) {

    e.preventDefault();

    try {

      const userId =
        localStorage.getItem("userId");

      const response =
        await API.post(
          "/wallet/withdraw",
          {
            userId,
            amount
          }
        );

      alert(response.data);

      setAmount("");

      const updatedWallet =
        await API.get(
          `/wallet/details/${userId}`
        );

      setWallet(updatedWallet.data);

    } catch (error) {

      console.log(error);

      alert("Withdrawal Failed");
    }
  }

  return (
    <>
      <div
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
          background:
            "linear-gradient(to bottom,#f8fafc,#eef2ff)"
        }}
      >
        <TopHeader wallet={wallet} />

        <div style={{ padding: "40px" }}>

          {/* Balance Card */}

          <div
            style={{
              maxWidth: "800px",
              margin: "auto",
              background:
                "linear-gradient(135deg,#10b981,#34d399)",
              color: "white",
              borderRadius: "25px",
              padding: "35px",
              boxShadow:
                "0px 20px 40px rgba(16,185,129,0.25)"
            }}
          >
            <h3>Available Balance</h3>

            <h1
              style={{
                fontSize: "45px",
                margin: 0
              }}
            >
              ₹{wallet?.balance || 0}
            </h1>
          </div>

          {/* Withdraw Form */}

          <div
            style={{
              maxWidth: "800px",
              margin: "30px auto",
              background: "white",
              borderRadius: "25px",
              padding: "40px",
              boxShadow:
                "0px 10px 30px rgba(0,0,0,0.08)"
            }}
          >
            <h1>🏦 Withdraw Money</h1>

            <p
              style={{
                color: "#64748b",
                marginBottom: "25px"
              }}
            >
              Withdraw funds from your wallet.
            </p>

            <form
              onSubmit={handleWithdraw}
            >

              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                required
                style={{
                  width: "100%",
                  padding: "18px",
                  borderRadius: "15px",
                  border:
                    "1px solid #cbd5e1",
                  fontSize: "18px"
                }}
              />

              {Number(amount) >
                Number(wallet?.balance) &&
                amount !== "" && (

                <p
                  style={{
                    color: "red",
                    marginTop: "10px",
                    fontWeight: "bold"
                  }}
                >
                  Insufficient Balance
                </p>

              )}

              <button
                type="submit"
                disabled={
                  Number(amount) >
                  Number(wallet?.balance)
                }
                style={{
                  width: "100%",
                  marginTop: "30px",
                  padding: "18px",
                  border: "none",
                  borderRadius: "15px",
                  background:
                    "linear-gradient(135deg,#10b981,#34d399)",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Withdraw Money
              </button>

            </form>

          </div>

        </div>
      </div>
    </>
  );
}

export default WithdrawMoney;