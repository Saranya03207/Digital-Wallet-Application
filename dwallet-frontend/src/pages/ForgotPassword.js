import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ForgotPassword() {

  const [email,setEmail] = useState("");

  const navigate = useNavigate();

  async function sendOtp(e){

    e.preventDefault();

    try{

      const response =
        await API.post(
          "/users/forgot-password",
          {
            email
          }
        );

      if(response.data === "OTP_SENT"){

        alert(
          "OTP Sent To Email"
        );

        navigate(
          "/reset-password",
          {
            state:{ email }
          }
        );
      }

    }catch(error){

      console.log(error);

      alert(
        "Email Not Found"
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

      <form
        onSubmit={sendOtp}
        style={{
          width:"450px",
          background:"white",
          padding:"40px",
          borderRadius:"20px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.1)"
        }}
      >

        <h1
          style={{
            textAlign:"center",
            marginBottom:"30px"
          }}
        >
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e)=>
            setEmail(e.target.value)
          }
          required
          style={{
            width:"100%",
            padding:"15px",
            borderRadius:"10px",
            border:"1px solid #ddd"
          }}
        />

        <button
          type="submit"
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
          Send OTP
        </button>

      </form>

    </div>
  );
}

export default ForgotPassword;