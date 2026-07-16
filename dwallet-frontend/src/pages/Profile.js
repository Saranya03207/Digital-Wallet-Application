import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import TopHeader from "../components/TopHeader";
import { ProfileIcon, QrIcon, CameraIcon, StarIcon } from "../components/AppIcons";

function Profile() {
  const [wallet, setWallet] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [password, setPassword] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    API.get(`/wallet/details/${userId}`)
      .then(res => {
        setWallet(res.data);
        setFullName(res.data.user.fullName);
        setEmail(res.data.user.email);
        setMobileNumber(res.data.user.mobileNumber);
        if (res.data.user.profileImage)
          setProfileImage(`http://localhost:8080/profile-images/${res.data.user.profileImage}`);
      })
      .catch(console.log);
  }, []);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await API.post(`/users/upload-image/${wallet.user.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setProfileImage(`http://localhost:8080/profile-images/${res.data.profileImage}`);
      alert("Image Uploaded");
    } catch (error) { console.log(error); alert("Upload Failed"); }
  }

  async function saveChanges() {
    if (mobileNumber.length !== 10) { alert("Enter Valid Mobile Number"); return; }
    try {
      await API.put(`/users/update/${wallet.user.id}`, { fullName, email, mobileNumber });
      alert("Profile Updated Successfully");
      setEditMode(false);
      navigate("/dashboard");
    } catch (error) { console.log(error); alert("Failed To Update Profile"); }
  }

  async function savePin() {
    const userId = localStorage.getItem("userId");
    if (transactionPin.length !== 4) { alert("PIN must contain exactly 4 digits"); return; }
    try {
      const res = await API.put(`/users/set-pin/${userId}`, { password, transactionPin });
      alert(res.data);
      setPassword(""); setTransactionPin(""); setShowPinModal(false);
    } catch (error) { console.log(error); alert("Failed To Update PIN"); }
  }

  if (!wallet) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#f8faff,#eef2ff)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid #6366f1",
          borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading Profile...</p>
      </div>
    </div>
  );

  const infoRows = [
    { label: "Email", value: email, editable: true, setter: setEmail, type: "email" },
    { label: "Phone", value: mobileNumber, editable: true, setter: setMobileNumber, type: "tel" },
    { label: "User ID", value: wallet?.user?.id, editable: false },
    { label: "Wallet ID", value: wallet?.walletId, editable: false },
    { label: "UPI ID", value: wallet?.user?.upiId, editable: false },
    { label: "Status", value: wallet?.user?.status, editable: false, isStatus: true },
  ];

  return (
    <>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8faff,#eef2ff,#f0fdf4)" }}>
        <TopHeader wallet={wallet} />

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 24px" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <ProfileIcon size={26} color="#0f172a" />
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>My Profile</h1>
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px" }}>Manage your personal information and account settings</p>

          {/* Profile Header Card */}
          <div style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: "24px", padding: "32px 36px",
            marginBottom: "24px", display: "flex", alignItems: "center", gap: "24px", position: "relative", overflow: "hidden",
            boxShadow: "0 16px 48px rgba(99,102,241,0.3)" }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px",
              borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <img src={profileImage && profileImage !== "null" ? (profileImage.startsWith("http") || profileImage.startsWith("data:") ? profileImage : `http://localhost:8080/profile-images/${profileImage}`) : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="profile"
                style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover",
                  border: "4px solid rgba(255,255,255,0.4)" }}
                onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }} />
              <label style={{ position: "absolute", bottom: 0, right: 0, width: "28px", height: "28px",
                borderRadius: "50%", background: "white", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                <CameraIcon size={16} color="#4f46e5" />
                <input type="file" hidden onChange={handleImageUpload} />
              </label>
            </div>
            <div style={{ color: "white" }}>
              {editMode ? (
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  style={{ fontSize: "24px", fontWeight: 800, background: "rgba(255,255,255,0.15)",
                    border: "2px solid rgba(255,255,255,0.3)", borderRadius: "12px",
                    color: "white", padding: "8px 16px", marginBottom: "8px" }} />
              ) : (
                <h2 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "6px" }}>{fullName}</h2>
              )}
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px" }}>{wallet?.user?.upiId}</p>
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 14px",
                  borderRadius: "20px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <StarIcon size={14} color="#fcd34d" /> {wallet?.user?.rewardPoints || 0} Points
                </span>
                <span style={{ background: "#22c55e33", border: "1px solid rgba(34,197,94,0.5)",
                  padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                  ✅ {wallet?.user?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div style={{ background: "white", borderRadius: "24px", padding: "32px 36px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "24px" }}>Account Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {infoRows.map((row, i) => (
                <div key={i} style={{ padding: "16px 20px", borderRadius: "16px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{row.label}</p>
                  {editMode && row.editable ? (
                    <input value={row.value} type={row.type || "text"} onChange={e => row.setter(e.target.value)}
                      style={{ width: "100%", background: "white", border: "2px solid #e2e8f0",
                        borderRadius: "10px", padding: "8px 12px", fontSize: "15px", fontWeight: 600, color: "#0f172a" }} />
                  ) : (
                    <p style={{ fontSize: "15px", fontWeight: 600,
                      color: row.isStatus ? "#15803d" : "#0f172a" }}>
                      {row.isStatus ? "✅ " : ""}{row.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {editMode ? (
              <>
                <button onClick={saveChanges} style={{ padding: "13px 24px", borderRadius: "14px",
                  background: "linear-gradient(135deg,#10b981,#34d399)", color: "white", border: "none",
                  fontWeight: 700, fontSize: "14px", boxShadow: "0 6px 18px rgba(16,185,129,0.3)" }}>
                  💾 Save Changes
                </button>
                <button onClick={() => setEditMode(false)} style={{ padding: "13px 24px", borderRadius: "14px",
                  background: "#f1f5f9", color: "#64748b", border: "none", fontWeight: 700, fontSize: "14px" }}>
                  ✕ Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} style={{ padding: "13px 24px", borderRadius: "14px",
                background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "white", border: "none",
                fontWeight: 700, fontSize: "14px", boxShadow: "0 6px 18px rgba(245,158,11,0.3)" }}>
                ✏️ Edit Profile
              </button>
            )}

            <button onClick={() => setShowPinModal(true)} style={{ padding: "13px 24px", borderRadius: "14px",
              background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "white", border: "none",
              fontWeight: 700, fontSize: "14px", boxShadow: "0 6px 18px rgba(124,58,237,0.3)" }}>
              🔐 Set / Change PIN
            </button>

            <button onClick={() => navigate("/change-password")} style={{ padding: "13px 24px", borderRadius: "14px",
              background: "linear-gradient(135deg,#ec4899,#f472b6)", color: "white", border: "none",
              fontWeight: 700, fontSize: "14px", boxShadow: "0 6px 18px rgba(236,72,153,0.3)" }}>
              🔒 Change Password
            </button>
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,12,41,0.7)", backdropFilter: "blur(6px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "white", width: "420px", borderRadius: "28px", padding: "40px",
            boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "18px",
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "26px", margin: "0 auto 14px" }}>🔐</div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>Set Transaction PIN</h2>
              <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>Enter your account password to set a new UPI PIN</p>
            </div>

            {[
              { label: "Account Password", type: "password", placeholder: "Enter password", value: password, onChange: e => setPassword(e.target.value) },
              { label: "New 4-Digit PIN", type: "password", placeholder: "• • • •", value: transactionPin, onChange: e => setTransactionPin(e.target.value), maxLength: 4, style: { textAlign: "center", letterSpacing: "10px", fontSize: "22px" } },
            ].map((field, i) => (
              <div key={i} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} value={field.value}
                  onChange={field.onChange} maxLength={field.maxLength}
                  style={{ width: "100%", padding: "14px 18px", borderRadius: "14px", border: "2px solid #e2e8f0",
                    fontSize: field.style?.fontSize || "15px", background: "#f8fafc", color: "#0f172a",
                    ...(field.style || {}) }} />
              </div>
            ))}

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button onClick={savePin} style={{ flex: 1, padding: "14px", borderRadius: "14px",
                background: "linear-gradient(135deg,#10b981,#34d399)", color: "white",
                border: "none", fontWeight: 700, fontSize: "15px" }}>Save PIN</button>
              <button onClick={() => setShowPinModal(false)} style={{ flex: 1, padding: "14px", borderRadius: "14px",
                background: "#fee2e2", color: "#ef4444", border: "none", fontWeight: 700, fontSize: "15px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
