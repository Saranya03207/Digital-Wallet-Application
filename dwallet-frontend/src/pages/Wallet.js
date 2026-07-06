import React from "react";
import { useNavigate } from "react-router-dom";

function Wallet() {

  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px" }}>
      <h1>Wallet Services</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
          flexWrap: "wrap",
        }}
      >
        <button
  onClick={() => navigate("/add-money")}
  style={{
    width: "200px",
    height: "100px",
    fontSize: "18px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
  }}
>
  Add Money
</button>

        <button
    onClick={()=>navigate ("/withdraw")}
          style={{
            width: "200px",
            height: "100px",
            fontSize: "18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#16a34a",
            color: "white",
            cursor: "pointer",
          }}
        >
          Withdraw
        </button>

        <button
    onClick={()=>navigate("/transfer")}
          style={{
            width: "200px",
            height: "100px",
            fontSize: "18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#ea580c",
            color: "white",
            cursor: "pointer",
          }}
        >
          Transfer
        </button>

        <button
    onClick={()=>navigate("/history")}
          style={{
            width: "200px",
            height: "100px",
            fontSize: "18px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#7c3aed",
            color: "white",
            cursor: "pointer",
          }}
        >
          History
        </button>
      </div>
    </div>
  );
}

export default Wallet;