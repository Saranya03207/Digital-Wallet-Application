import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ChangePassword() {

  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  async function changePassword() {

    if (!currentPassword ||
        !newPassword ||
        !confirmPassword) {

      alert("Please Fill All Fields");
      return;
    }

    if (newPassword !== confirmPassword) {

      alert("Passwords Do Not Match");
      return;
    }

    try {

      const userId =
        localStorage.getItem("userId");

      const response =
        await API.post(
          "/users/change-password",
          {
            userId,
            currentPassword,
            newPassword
          }
        );

      if (
        response.data ===
        "PASSWORD_CHANGED"
      ) {

        alert(
          "Password Updated Successfully"
        );

        navigate("/profile");
      }

      else if (
        response.data ===
        "INVALID_PASSWORD"
      ) {

        alert(
          "Current Password Incorrect"
        );
      }

      else if (
        response.data ===
        "SAME_PASSWORD"
      ) {

        alert(
          "New Password Must Be Different"
        );
      }

      else {

        alert(response.data);
      }

    }
    catch (error) {

      console.log(error);

      alert(
        "Failed To Change Password"
      );
    }
  }

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom,#f8fafc,#eef2ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px"
      }}
    >

      <div
        style={{
          width: "650px",
          background: "white",
          padding: "50px",
          borderRadius: "25px",
          boxShadow:
            "0 15px 40px rgba(0,0,0,0.08)"
        }}
      >

        <h1
          style={{
            textAlign: "center",
            color: "#1e293b",
            marginBottom: "10px"
          }}
        >
          🔒 Change Password
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "35px"
          }}
        >
          Update your WalletPay account password securely
        </p>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) =>
            setCurrentPassword(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            fontSize: "16px",
            marginBottom: "20px"
          }}
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            fontSize: "16px",
            marginBottom: "20px"
          }}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            fontSize: "16px",
            marginBottom: "30px"
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "15px"
          }}
        >

          <button
            onClick={() =>
              navigate("/profile")
            }
            style={{
              flex: 1,
              padding: "15px",
              border: "none",
              borderRadius: "12px",
              background: "#64748b",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Back
          </button>

          <button
            onClick={changePassword}
            style={{
              flex: 2,
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
            Update Password
          </button>

        </div>

      </div>

    </div>

  );
}

export default ChangePassword;