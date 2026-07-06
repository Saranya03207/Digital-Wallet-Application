import { useState } from "react";
import { useLocation,useNavigate }
from "react-router-dom";

import API from "../services/api";

function ResetPassword(){

  const location = useLocation();

  const navigate = useNavigate();

  const email =
    location.state?.email;

  const [otp,setOtp] =
    useState("");

  const [newPassword,
    setNewPassword] =
      useState("");

  const [confirmPassword,
    setConfirmPassword] =
      useState("");

  async function resetPassword(){

    if(
      newPassword !==
      confirmPassword
    ){
      alert(
        "Passwords Do Not Match"
      );
      return;
    }

    try{

      const response =
        await API.post(
          "/users/reset-password",
          {
            email,
            otp,
            newPassword
          }
        );

      if(
        response.data ===
        "PASSWORD_RESET_SUCCESS"
      ){

        alert(
          "Password Updated Successfully"
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

    }catch(error){

      console.log(error);

      alert(
        "Password Reset Failed"
      );
    }
  }

  return(

    <div
      style={{
        minHeight:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        background:
          "linear-gradient(135deg,#eef2ff,#f8fafc)"
      }}
    >

      <div
        style={{
          width:"500px",
          background:"white",
          padding:"40px",
          borderRadius:"20px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.1)"
        }}
      >

        <h1
          style={{
            textAlign:"center"
          }}
        >
          Reset Password
        </h1>

        <p>
          OTP sent to:
        </p>

        <b>{email}</b>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e)=>
            setOtp(e.target.value)
          }
          style={{
            width:"100%",
            padding:"15px",
            marginTop:"20px"
          }}
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e)=>
            setNewPassword(
              e.target.value
            )
          }
          style={{
            width:"100%",
            padding:"15px",
            marginTop:"15px"
          }}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e)=>
            setConfirmPassword(
              e.target.value
            )
          }
          style={{
            width:"100%",
            padding:"15px",
            marginTop:"15px"
          }}
        />

        <button
          onClick={resetPassword}
          style={{
            width:"100%",
            padding:"15px",
            marginTop:"20px",
            border:"none",
            borderRadius:"10px",
            background:
              "linear-gradient(135deg,#4f46e5,#7c3aed)",
            color:"white",
            fontWeight:"bold"
          }}
        >
          Reset Password
        </button>

      </div>

    </div>
  );
}

export default ResetPassword;