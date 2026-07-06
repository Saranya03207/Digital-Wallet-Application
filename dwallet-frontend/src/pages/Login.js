import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function doLogin(e) {

    e.preventDefault();

    try {

      const response = await API.post(
        "/users/login",
        {
          email,
          password
        }
      );
      console.log(typeof response.data);
      console.log(response.data);
      console.log("LOGIN RESPONSE");
      if(
  !response.data ||
  !response.data.userId
){

  throw new Error(
    "Invalid Login Response"
  );
}

localStorage.setItem(
  "userId",
  response.data.userId
);

      localStorage.setItem(
        "username",
        response.data.fullName
      );

      if(response.data.role==="ADMIN"){

    navigate("/admin");

}else{

    navigate("/dashboard");

}

    } catch (error) {

      if(error.response?.data ==="EMAIL_NOT_VERIFIED")
        { alert("Please Verify Your Email First");
          return;
        }

        console.log(error);

    alert(error.response?.data || error.message);
      alert("Invalid Email or Password");
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
          Secure Digital Wallet
        </h2>

        <div
          style={{
            fontSize: "22px",
            lineHeight: "2"
          }}
        >
          <p>✔ Instant Transfers</p>
          <p>✔ Secure Payments</p>
          <p>✔ Wallet Management</p>
          <p>✔ Transaction History</p>
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
        <form
          onSubmit={doLogin}
          style={{
            width: "450px",
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
            Login
          </h1>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              fontSize: "16px"
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "15px",
              marginBottom: "25px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              fontSize: "16px"
            }}
          />

          <button
            type="submit"
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
            Login
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "25px"
            }}
          >
            New User?{" "}
            <Link
              to="/register"
              style={{
                color: "#4f46e5",
                fontWeight: "bold"
              }}
            >
              Register Here
            </Link>
          </p>
          <p
  style={{
    textAlign:"center",
    marginTop:"10px"
  }}
>
  <Link
    to="/forgot-password"
    style={{
      color:"#ef4444",
      fontWeight:"bold"
    }}
  >
    Forgot Password?
  </Link>
</p>

        </form>
      </div>

    </div>
  );
}

export default Login;