import { useState } from "react";
import { useLocation,useNavigate }
from "react-router-dom";

import API from "../services/api";

function VerifyOtp() {

  const location =useLocation();

  const navigate =useNavigate();

  const email =location.state?.email;

  const [otp,setOtp] = useState("");

  async function verifyOtp() {

    try {

      const response =
        await API.post(
          "/users/verify-otp",
          {
            email,
            otp
          }
        );

      if(
        response.data ===
        "VERIFIED"
      ){

        alert(
          "Email Verified Successfully"
        );

        navigate("/login");
      }

      else if(
        response.data ===
        "INVALID_OTP"
      ){

        alert("Invalid OTP");
      }

      else if(
        response.data ===
        "OTP_EXPIRED"
      ){

        alert("OTP Expired");
      }

    } catch(error){

      console.log(error);

      alert(
        "Verification Failed"
      );
    }
  }

  async function resendOtp() {

  try {

    await API.post(
      `/users/resend-otp?email=${email}`
    );

    alert(
      "New OTP Sent To Email"
    );

  } catch(error){

    console.log(error);

    alert(
      "Failed To Send OTP"
    );
  }
}

  return (

  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      background:
        "linear-gradient(135deg,#eef2ff,#f8fafc)"
    }}
  >

    {/* LEFT SECTION */}

    <div
      style={{
        flex: 1,
        background:
          "linear-gradient(135deg,#4f46e5,#7c3aed)",
        color: "white",
        padding: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}
    >

      <h1
        style={{
          fontSize: "60px",
          marginBottom: "20px"
        }}
      >
        💳 WalletPay
      </h1>

      <h2
        style={{
          marginBottom: "30px"
        }}
      >
        Verify Your Email
      </h2>

      <div
        style={{
          fontSize: "22px",
          lineHeight: "2"
        }}
      >
        <p>✔ Secure Account Creation</p>
        <p>✔ OTP Based Verification</p>
        <p>✔ Prevent Fake Registrations</p>
        <p>✔ Safe Wallet Access</p>
      </div>

    </div>

    {/* RIGHT SECTION */}

    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >

      <div
        style={{
          width: "500px",
          background: "white",
          padding: "50px",
          borderRadius: "25px",
          boxShadow:
            "0px 15px 40px rgba(0,0,0,0.1)"
        }}
      >

        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#1e293b"
          }}
        >
          Verify OTP
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b"
          }}
        >
          OTP sent to
        </p>

        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "25px"
          }}
        >
          {email}
        </p>

        <input
          type="text"
          pla
          
          
          ceholder="Enter 6 Digit OTP"
          value={otp}
          onChange={(e) =>
  setOtp(
    e.target.value.replace(/\D/g,"")
  )
}
          maxLength={6}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            fontSize: "18px",
            textAlign: "center",
            letterSpacing: "4px",
            marginBottom: "20px"
          }}
        />

        <button
          onClick={verifyOtp}
          style={{
            width: "100%",
            padding: "15px",
            border: "none",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg,#4f46e5,#7c3aed)",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Verify OTP
        </button>

        <button
          onClick={resendOtp}
          style={{
            width: "100%",
            padding: "15px",
            marginTop: "15px",
            border: "none",
            borderRadius: "12px",
            background: "#f59e0b",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Resend OTP
        </button>

      </div>

    </div>

  </div>

);
}

export default VerifyOtp;