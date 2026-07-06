import { useEffect, useState } from "react";
import API from "../services/api";
import TopHeader from "../components/TopHeader";

function Notifications() {

  const [notifications,
    setNotifications] =
    useState([]);

  useEffect(() => {

  const userId =
    localStorage.getItem("userId");

  API.get(`/notifications/${userId}`)
    .then(async (response) => {

      setNotifications(
        response.data
      );

      for (const notification
           of response.data) {

        await API.put(
          `/notifications/read/${notification.notificationId}`
        );
      }

    })
    .catch((error) => {

      console.log(error);

    });

}, []);

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

      <TopHeader />

      <h1
        style={{
          marginTop: "30px",
          color: "#1e293b"
        }}
      >
        🔔 Notifications
      </h1>

      {notifications.length === 0 ? (

        <div
          style={{
            marginTop: "30px",
            background: "white",
            padding: "30px",
            borderRadius: "20px"
          }}
        >
          No Notifications Found
        </div>

      ) : (

        notifications.map(
          (notification) => (

          <div
            key={
              notification.notificationId
            }
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "18px",
              marginTop: "20px",
              boxShadow:
                "0 10px 25px rgba(0,0,0,0.06)",
              borderLeft:
                "6px solid #4f46e5"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center"
              }}
            >

              <h3
                style={{
                  margin: 0,
                  color:
                    "#1e293b"
                }}
              >
                {notification.message}
              </h3>

            </div>

            <div
              style={{
                marginTop: "12px",
                color: "#64748b"
              }}
            >
              {new Date(
                notification.createdAt
              ).toLocaleString()}
            </div>

          </div>

        ))

      )}

    </div>

  );
}

export default Notifications;