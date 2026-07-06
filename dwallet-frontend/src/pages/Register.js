import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  function passwordChecks(password) {

  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@#$%^&+=!]/.test(password)
  };
}
 function getPasswordStrength(password) {

  if (!password)
    return "";

  const checks =
    passwordChecks(password);

  const passed =
    Object.values(checks)
      .filter(Boolean)
      .length;

  if (passed <= 2)
    return "Weak";

  if (passed <= 4)
    return "Medium";

  return "Strong";
}

  async function handleRegister(e) {

  e.preventDefault();

  if(password !== confirmPassword){

    alert("Passwords do not match");
    return;
  }

  try {

    await API.post("/users/register", {

      fullName,
      email,
      mobileNumber,
      aadhaarNumber,
      password

    });

    alert("OTP Sent To Your Email");

    navigate("/verify-otp",{state:{email}});

  } catch (error) {

    const msg =
      error.response?.data;

    if(msg === "EMAIL_EXISTS"){

      const login =
        window.confirm(
          "Email already registered.\n\nDo you want to Login?"
        );

      if(login){
        navigate("/login");
      }

      return;
    }

    if(msg === "MOBILE_EXISTS"){

      alert(
        "Mobile number already registered"
      );

      return;
    }

    if(msg === "AADHAAR_EXISTS"){

      alert(
        "Aadhaar already linked with another account"
      );

      return;
    }

    if(msg === "WEAK_PASSWORD"){

      alert(
        "Password must contain uppercase, lowercase, number and special character"
      );

      return;
    }

    alert(msg || "Registration Failed");
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
          Create Your Wallet Account
        </h2>

        <div
          style={{
            fontSize: "22px",
            lineHeight: "2"
          }}
        >
          <p>✔ Zero Registration Fees</p>
          <p>✔ Secure User Accounts</p>
          <p>✔ Instant Wallet Creation</p>
          <p>✔ Fast Money Transfers</p>
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
          onSubmit={handleRegister}
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
            Register
          </h1>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            required
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            style={inputStyle}
          />

          <input
                type="text"
                placeholder="Mobile Number"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(e.target.value)
                }
                required
                style={inputStyle}
              />

          <input
              type="text"
              placeholder="Aadhaar Number"
              value={aadhaarNumber}
              maxLength={12}
              onChange={(e) =>
                setAadhaarNumber(e.target.value)
              }
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              style={inputStyle}
              />
              {password && (

  <div
    style={{
      marginTop: "-10px",
      marginBottom: "15px",
      fontSize: "14px"
    }}
  >

    <p
      style={{
        fontWeight: "bold",
        color:
          getPasswordStrength(password)
            === "Strong"
            ? "green"
            : getPasswordStrength(password)
            === "Medium"
            ? "orange"
            : "red"
      }}
    >
      Password Strength :
      {getPasswordStrength(password)}
    </p>

    <p
      style={{
        color:
          passwordChecks(password).length
            ? "green"
            : "red"
      }}
    >
      {passwordChecks(password).length
        ? "✔"
        : "✖"} Minimum 8 characters
    </p>

    <p
      style={{
        color:
          passwordChecks(password).lower
            ? "green"
            : "red"
      }}
    >
      {passwordChecks(password).lower
        ? "✔"
        : "✖"} Lowercase letter (a-z)
    </p>

    <p
      style={{
        color:
          passwordChecks(password).upper
            ? "green"
            : "red"
      }}
    >
      {passwordChecks(password).upper
        ? "✔"
        : "✖"} Uppercase letter (A-Z)
    </p>

    <p
      style={{
        color:
          passwordChecks(password).number
            ? "green"
            : "red"
      }}
    >
      {passwordChecks(password).number
        ? "✔"
        : "✖"} Number (0-9)
    </p>

    <p
      style={{
        color:
          passwordChecks(password).special
            ? "green"
            : "red"
      }}
    >
      {passwordChecks(password).special
        ? "✔"
        : "✖"} Special Character (@#$%^&+=!)
    </p>

  </div>

)}
            
              <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    required
                    style={inputStyle}
                    />
                    {confirmPassword && (

  <p
    style={{
      marginTop: "-10px",
      marginBottom: "15px",
      fontWeight: "bold",
      color:
        password === confirmPassword
          ? "green"
          : "red"
    }}
  >
    {password === confirmPassword
      ? "✔ Passwords Match"
      : "✖ Passwords Do Not Match"}
  </p>

)}
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
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Create Account
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "25px"
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#4f46e5",
                fontWeight: "bold"
              }}
            >
              Login Here
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "15px",
  marginBottom: "18px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  fontSize: "16px",
  outline: "none"
};

export default Register;