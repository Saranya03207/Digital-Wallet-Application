import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";
import TopHeader from "../components/TopHeader";

function Profile() {
  const [wallet, setWallet] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [mobileNumber, setMobileNumber] = useState("");

  const [profileImage, setProfileImage] = useState(null);

  const navigate = useNavigate();
  const [showPinModal, setShowPinModal] =
  useState(false);

const [password, setPassword] =
  useState("");

const [transactionPin, setTransactionPin] =
  useState("");

useEffect(() => {
  const userId = localStorage.getItem("userId");

  API.get(`/wallet/details/${userId}`)
    .then((response) => {

      setWallet(response.data);

      setFullName(response.data.user.fullName);
      setEmail(response.data.user.email);
      setMobileNumber(response.data.user.mobileNumber);

      if (response.data.user.profileImage) {

        setProfileImage(
          `http://localhost:8080/profile-images/${response.data.user.profileImage}`
        );

      }

    })
    .catch((error) => {
      console.log(error);
    });

}, []);
  async function handleImageUpload(e) {

  const file = e.target.files[0];

  if (!file) return;

  const formData = new FormData();

  formData.append("file", file);

  try {

    const response =
      await API.post(
        `/users/upload-image/${wallet.user.id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

    setProfileImage(
      `http://localhost:8080/profile-images/${response.data.profileImage}`
    );

    alert("Image Uploaded");

  } catch(error){

  console.log(error);

  if(error.response){
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);
  }

  alert("Upload Failed");
}
}

  async function saveChanges() {


  if (mobileNumber.length !== 10) {
    alert("Enter Valid Mobile Number");
    return;
  }
  
  try {

    await API.put(
      `/users/update/${wallet.user.id}`,
      {
        fullName,
        email,
        mobileNumber
      }
    );

    alert("Profile Updated Successfully");

    setEditMode(false);

    navigate("/dashboard");

  } catch (error) {
  console.log(error);
  console.log(error.response);

  alert("Failed To Update Profile");
}
}
if (!wallet) {
  return (
    <h2 style={{ textAlign: "center", marginTop: "100px" }}>
      Loading...
    </h2>
  );
}

async function savePin() {

  const userId =
    localStorage.getItem("userId");

  if (transactionPin.length !== 4) {

    alert(
      "PIN must contain exactly 4 digits"
    );

    return;
  }

  try {

    const response =
      await API.put(
        `/users/set-pin/${userId}`,
        {
          password,
          transactionPin
        }
      );

    alert(response.data);

    setPassword("");
    setTransactionPin("");
    setShowPinModal(false);

  } catch(error) {

    console.log(error);

    alert("Failed To Update PIN");

  }

}

  return (
    
    <>

      <div
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
          background:
            "linear-gradient(to bottom,#f8fafc,#eef2ff)",
        }}
      >
        <TopHeader wallet={wallet} />

        <div
          style={{
            padding: "50px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "30px",
              maxWidth: "900px",
              width: "100%",
              margin: "auto",
              padding: "60px",
              boxShadow:
                "0px 15px 40px rgba(0,0,0,0.08)",
            }}
          >
            <h1
              style={{
                textAlign: "center",
                marginBottom: "40px",
                color: "#1e293b",
              }}
            >
              Profile
            </h1>

            <div
              style={{
                textAlign: "center",
              }}
            >
              <img
                src={
                  profileImage ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="profile"
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "5px solid #4f46e5",
                  padding: "5px",
                }}
              />

              <div style={{ marginTop: "20px" }}>
                {editMode ? (
                  <input
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    style={{
                      padding: "12px",
                      fontSize: "28px",
                      textAlign: "center",
                      width: "300px",
                    }}
                  />
                ) : (
                  <h2
                    style={{
                      fontSize: "34px",
                    }}
                  >
                    {fullName}
                  </h2>
                )}
              </div>
            </div>

            <hr style={{ margin: "30px 0" }} />

            <div>

              <div style={{ marginBottom: "25px" }}>
                <h3>Email</h3>

                {editMode ? (
                  <input
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "18px",
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: "18px",
                    }}
                  >
                    {email}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "25px" }}>
                <h3>Phone Number</h3>

                {editMode ? (
                  <input
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "18px",
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: "18px",
                    }}
                  >
                    {mobileNumber}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "25px" }}>
                <h3>User ID</h3>

                <p style={{ fontSize: "18px" }}>
                  {wallet?.user?.id}
                </p>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <h3>Wallet ID</h3>

                <p style={{ fontSize: "18px" }}>
                  {wallet?.walletId}
                </p>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <h3>Status</h3>

                <p
                  style={{
                    color: "#16a34a",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {wallet?.user?.status}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "15px",
                flexWrap: "wrap",
                marginTop: "30px",
              }}
            >
              <label
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "12px 25px",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                Upload Photo

                <input
                  type="file"
                  hidden
                  onChange={handleImageUpload}
                />
              </label>

              <button
                onClick={() =>
                  setEditMode(!editMode)
                }
                style={{
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  padding: "12px 25px",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                {editMode
                  ? "Cancel Edit"
                  : "Edit Details"}
              </button>

              <button
  onClick={saveChanges}
  style={{
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "12px",
    cursor: "pointer",
  }}
>
  Save Changes
</button>

<button
  onClick={() =>
    setShowPinModal(true)
  }
  style={{
    background: "#7c3aed",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "12px",
    cursor: "pointer",
  }}
>
  Set / Change PIN
</button>

<button
  onClick={() =>
    navigate("/change-password")
  }style={{
    background: "#ed3a99",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "12px",
    cursor: "pointer",
  }}

>
  Change Password
</button>
            </div>
          </div>
        </div>
      </div>
      {
showPinModal && (

<div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}
>

  <div
    style={{
      background: "white",
      width: "400px",
      padding: "30px",
      borderRadius: "20px"
    }}
  >

    <h2>
      Set Transaction PIN
    </h2>

    <input
      type="password"
      placeholder="Account Password"
      value={password}
      onChange={(e)=>
        setPassword(
          e.target.value
        )
      }
      style={{
        width:"100%",
        padding:"12px",
        marginTop:"15px"
      }}
    />

    <input
      type="password"
      placeholder="4 Digit PIN"
      maxLength="4"
      value={transactionPin}
      onChange={(e)=>
        setTransactionPin(
          e.target.value
        )
      }
      style={{
        width:"100%",
        padding:"12px",
        marginTop:"15px"
      }}
    />

    <div
      style={{
        display:"flex",
        gap:"10px",
        marginTop:"20px"
      }}
    >

      <button
        onClick={savePin}
        style={{
          flex:1,
          background:"#10b981",
          color:"white",
          border:"none",
          padding:"12px",
          borderRadius:"10px"
        }}
      >
        Save PIN
      </button>

      <button
        onClick={() =>
          setShowPinModal(false)
        }
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

)
}
    </>
  );
}

export default Profile;