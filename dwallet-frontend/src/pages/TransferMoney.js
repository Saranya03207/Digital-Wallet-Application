import { useState, useEffect } from "react";
import API from "../services/api";
import TopHeader from "../components/TopHeader";

function TransferMoney() {
  const [receiverUserId, setReceiverUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactionPin,setTransactionPin] =useState("");
  const [showPinModal, setShowPinModal] =useState(false);
  const [pinError, setPinError] =useState("");
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    API.get(`/wallet/details/${userId}`)
      .then((response) => {
        setWallet(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {

  if(keyword.length < 1){
      setUsers([]);
      return;
  }

  const currentUserId =
      localStorage.getItem("userId");

  API.get(
      `/users/search-name?keyword=${keyword}&currentUserId=${currentUserId}`
  )
  .then((response)=>{
      setUsers(response.data);
  })
  .catch(console.log);

},[keyword]);

  async function searchUsers() {

  try {

    const currentUserId =
      localStorage.getItem("userId");

    const response =
      await API.get(
 `/users/search-upi?upiId=${keyword}`
);

    setUsers(response.data);

  } catch(error) {

    console.log(error);

  }
}

  async function handleTransfer(e) {
    e.preventDefault();

    try {
      const senderUserId =
        localStorage.getItem("userId");

      const response =
  await API.post("/wallet/transfer", {
    senderUserId,
    receiverUserId,
    amount,
    transactionPin
  });

      alert(response.data);
      setShowPinModal(false);

setTransactionPin("");

alert(
  "✅ PIN Verified\nTransfer Successful"
);

      setAmount("");
      setReceiverUserId("");
      setSelectedUser(null);
      setKeyword("");
      setUsers([]);

      const updatedWallet =
        await API.get(
          `/wallet/details/${senderUserId}`
        );

      setWallet(updatedWallet.data);

    } catch(error){

  console.log(error);

  if(
    error.response?.data ===
    "Invalid Transaction PIN"
  ){
    setPinError(
      "❌ Enter Correct PIN"
    );
    return;
  }

  alert("Transfer Failed");
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
      <h2>💳 WalletPay</h2>

      <TopHeader wallet={wallet} />

      <div style={{ padding: "30px" }}>

        {/* Balance Card */}

        <div
          style={{
            maxWidth: "900px",
            margin: "auto",
            background:
              "linear-gradient(135deg,#f97316,#fb923c)",
            color: "white",
            borderRadius: "25px",
            padding: "35px",
            boxShadow:
              "0 20px 40px rgba(249,115,22,0.25)"
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

        {/* Transfer Card */}

        <div
          style={{
            maxWidth: "900px",
            margin: "30px auto",
            background: "white",
            borderRadius: "25px",
            padding: "40px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)"
          }}
        >
          <h1>🔄 Transfer Money</h1>

          <p
            style={{
              color: "#64748b",
              marginBottom: "25px"
            }}
          >
            Search user and transfer money instantly.
          </p>

          {/* Search User */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px"
            }}
          >
            <input
              type="text"
              placeholder="Enter Receiver UPI ID"
              value={keyword}
              onChange={(e) =>
                setKeyword(e.target.value)
              }
              style={{
                flex: 1,
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid #ddd",
                fontSize: "16px"
              }}
            />

            <button
              onClick={searchUsers}
              style={{
                padding: "15px 25px",
                border: "none",
                borderRadius: "12px",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Search
            </button>
          </div>

          {/* Search Results */}

          {Array.isArray(users) &&
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                setSelectedUser(user);
                setReceiverUserId(user.id);
                setUsers([]);
              }}
              style={{
                background: "#f8fafc",
                borderRadius: "15px",
                padding: "15px",
                marginBottom: "10px",
                cursor: "pointer",
                border:
                  "1px solid #e2e8f0"
              }}
            >
              <h4>{user.fullName}</h4>

              <p>UPI ID : {user.upiId}</p>
              <p>{user.email}</p>
            </div>
          ))}

          {/* Selected User */}

          {selectedUser && (
            <div
              style={{
                background: "#dcfce7",
                padding: "18px",
                borderRadius: "15px",
                marginBottom: "20px"
              }}
            >
              <strong>
                Receiver :
              </strong>{" "}
              {selectedUser.fullName}

              <br />

              UPI ID : {selectedUser.upiId}
            </div>
          )}

          <form onSubmit={handleTransfer}>

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
  type="button"
  disabled={
    Number(amount) >
      Number(wallet?.balance) ||
    !selectedUser
  }
  onClick={() => {
    setPinError("");
    setShowPinModal(true);
  }}
  style={{
    width: "100%",
    marginTop: "25px",
    padding: "18px",
    border: "none",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg,#f97316,#fb923c)",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer"
  }}
>
  Transfer Money
</button>

          </form>
        </div>
      </div>
      {
showPinModal && (

<div
  style={{
    position:"fixed",
    top:0,
    left:0,
    width:"100%",
    height:"100%",
    background:
      "rgba(0,0,0,0.5)",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    zIndex:9999
  }}
>

  <div
    style={{
      background:"white",
      padding:"30px",
      borderRadius:"20px",
      width:"400px"
    }}
  >

    <h2>
      Enter UPI PIN
    </h2>

    <input
      type="password"
      maxLength="4"
      value={transactionPin}
      onChange={(e)=>{
        setTransactionPin(
          e.target.value
        );
        setPinError("");
      }}
      placeholder="4 Digit PIN"
      style={{
        width:"100%",
        padding:"15px",
        marginTop:"15px",
        borderRadius:"10px",
        border:
          "1px solid #cbd5e1"
      }}
    />

    {
      pinError &&
      (
        <p
          style={{
            color:"red",
            marginTop:"10px",
            fontWeight:"bold"
          }}
        >
          {pinError}
        </p>
      )
    }

    <div
      style={{
        display:"flex",
        gap:"10px",
        marginTop:"20px"
      }}
    >

      <button
        onClick={handleTransfer}
        style={{
          flex:1,
          background:"#10b981",
          color:"white",
          border:"none",
          padding:"12px",
          borderRadius:"10px"
        }}
      >
        Verify & Transfer
      </button>

      <button
        onClick={()=>{
          setShowPinModal(false);
          setPinError("");
          setTransactionPin("");
        }}
        style={{
          flex:1,
          background:"#ef4444",
          color:"white",
          border:"none",
          padding:"12px",
          borderRadius:"10px"
        }}
      >
        Cancel
      </button>

    </div>

  </div>

</div>

)}
    </div>
  );
}

export default TransferMoney;