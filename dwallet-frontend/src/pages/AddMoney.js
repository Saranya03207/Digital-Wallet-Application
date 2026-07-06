import { useState, useEffect } from "react";
import API from "../services/api";
import TopHeader from "../components/TopHeader";

function AddMoney() {

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

  async function handleAddMoney(e) {

    e.preventDefault();

    try {

      const userId =
        localStorage.getItem("userId");

      const response =
        await API.post(
          "/wallet/add-money",
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

      alert("Failed To Add Money");
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
                "linear-gradient(135deg,#4f46e5,#7c3aed)",
              color: "white",
              borderRadius: "25px",
              padding: "35px",
              boxShadow:
                "0px 20px 40px rgba(124,58,237,0.25)"
            }}
          >
            <h3
              style={{
                marginBottom: "10px"
              }}
            >
              Current Balance
            </h3>

            <h1
              style={{
                fontSize: "45px",
                margin: 0
              }}
            >
              ₹{wallet?.balance || 0}
            </h1>
          </div>

          {/* Add Money Form */}

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
            <h1
              style={{
                color: "#1e293b",
                marginBottom: "10px"
              }}
            >
              💰 Add Money
            </h1>

            <p
              style={{
                color: "#64748b",
                marginBottom: "25px"
              }}
            >
              Add funds instantly to your wallet.
            </p>

            <form
              onSubmit={handleAddMoney}
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

              {/* Quick Amount Buttons */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                  flexWrap: "wrap"
                }}
              >
                {[500, 1000, 2000, 5000]
                  .map((value) => (

                  <button
                    type="button"
                    key={value}
                    onClick={() =>
                      setAmount(value)
                    }
                    style={{
                      border: "none",
                      padding:
                        "10px 20px",
                      borderRadius:
                        "12px",
                      background:
                        "#eef2ff",
                      color:
                        "#4f46e5",
                      fontWeight:
                        "bold",
                      cursor:
                        "pointer"
                    }}
                  >
                    ₹{value}
                  </button>

                ))}
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  marginTop: "30px",
                  padding: "18px",
                  border: "none",
                  borderRadius: "15px",
                  background:
                    "linear-gradient(135deg,#2563eb,#60a5fa)",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Add Money
              </button>

            </form>

          </div>

        </div>
      </div>
    </>
  );
}

export default AddMoney;