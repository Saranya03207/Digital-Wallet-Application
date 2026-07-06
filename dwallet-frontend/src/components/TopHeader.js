import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function TopHeader({ wallet }) {

  const [showProfile, setShowProfile] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const navigate = useNavigate();

  useEffect(() => {

  const userId =
    localStorage.getItem("userId");

  if (!userId) return;

  API.get(
    `/notifications/unread-count/${userId}`
  )
    .then((response) => {

      setUnreadCount(response.data);

    })
    .catch((error) => {

      console.log(error);

    });

}, []);

  return (

    <div
      style={{
        background: "white",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.05)"
      }}
    >

      {/* LEFT SIDE */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#1e293b"
          }}
        >
          💳 WalletPay
        </h2>
      </div>

      {/* RIGHT SIDE */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "25px"
        }}
      >

        {/* Notification */}

        <div
  onClick={() =>
    navigate("/notifications")
  }
  style={{
    position: "relative",
    cursor: "pointer"
  }}
>

  <span
    style={{
      fontSize: "30px"
    }}
  >
    🔔
  </span>

  {unreadCount > 0 && (

    <span
      style={{
        position: "absolute",
        top: "-8px",
        right: "-10px",
        background: "#ef4444",
        color: "white",
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "12px",
        fontWeight: "bold"
      }}
    >
      {unreadCount}
    </span>

  )}

</div>

        {/* Profile */}

        <div
          style={{
            position: "relative"
          }}
        >

          <img
            src={
              wallet?.user?.profileImage
                ? `http://localhost:8080/profile-images/${wallet.user.profileImage}`
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="profile"
            style={{
              width: "55px",
              height: "55px",
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
              border:
                "2px solid #4f46e5"
            }}
            onClick={() =>
              setShowProfile(
                !showProfile
              )
            }
          />

          {showProfile && (

            <div
              style={{
                position: "absolute",
                right: 0,
                top: "65px",
                background: "white",
                width: "240px",
                borderRadius: "15px",
                padding: "20px",
                boxShadow:
                  "0px 10px 30px rgba(0,0,0,0.1)",
                zIndex: 999
              }}
            >

              <h3
                style={{
                  textAlign: "center"
                }}
              >
                User Profile
              </h3>

              <button
                onClick={() =>
                  navigate("/profile")
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  background:
                    "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  marginTop: "10px",
                  cursor: "pointer"
                }}
              >
                View Profile
              </button>

              <button
                onClick={() => {

                  localStorage.clear();

                  navigate("/login");

                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  background:
                    "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  marginTop: "10px",
                  cursor: "pointer"
                }}
              >
                Logout
              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default TopHeader;