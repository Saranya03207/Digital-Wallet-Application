import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import TopHeader from "../components/TopHeader";

function TransferMoney() {
  const [wallet, setWallet] = useState(null);
  const [activeView, setActiveView] = useState("HUB"); // "HUB" | "CONVERSATION"
  const [keyword, setKeyword] = useState("");
  
  // Contact Lists
  const [recentContacts, setRecentContacts] = useState([]);
  const [frequentContacts, setFrequentContacts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  
  // Conversation State
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [textInput, setTextInput] = useState("");
  const chatBottomRef = useRef(null);

  // Payment Bottom Sheet & Modal
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [transactionPin, setTransactionPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE"); // "IDLE" | "ANALYSING" | "BEHAVIOUR" | "RECEIVER" | "RISK" | "SUCCESS"

  // Check Balance UPI PIN state
  const [showBalance, setShowBalance] = useState(false);
  const [showBalancePinModal, setShowBalancePinModal] = useState(false);
  const [balancePin, setBalancePin] = useState("");
  const [balancePinError, setBalancePinError] = useState("");

  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const navigate = useNavigate();

  // Load wallet, recent and frequent contacts on mount
  useEffect(() => {
    if (!userId) return;
    loadInitialData();
  }, [userId]);

  // Handle QR Code Scan redirection or Biller redirection
  useEffect(() => {
    if (location.state?.isBiller && userId) {
      const billerContact = {
        id: "biller",
        fullName: location.state.billerName,
        upiId: location.state.billerNumber,
        phone: location.state.billerNumber,
        isBiller: true
      };
      setSelectedContact(billerContact);
      setActiveView("CONVERSATION");
      setTimeout(() => setShowBottomSheet(true), 350);
    } else if (location.state?.scannedUpiId && userId) {
      const upi = location.state.scannedUpiId;
      API.get(`/wallet/contacts/search?keyword=${encodeURIComponent(upi)}&currentUserId=${userId}`)
        .then(res => {
          const results = res.data || [];
          if (results.length > 0) {
            openConversation(results[0]);
            setTimeout(() => setShowBottomSheet(true), 350);
          } else {
            if (wallet?.user?.upiId === upi) {
              alert(`⚠️ You scanned your own QR Code (${upi}). You cannot transfer money to yourself.`);
            } else {
              alert(`⚠️ No active WalletPay user found matching UPI ID: ${upi}`);
            }
          }
        })
        .catch(err => {
          console.log("Error searching scanned UPI ID:", err);
        });
    }
  }, [location.state, userId, wallet]);

  const loadInitialData = async () => {
    try {
      const [walletRes, recentRes, frequentRes] = await Promise.all([
        API.get(`/wallet/details/${userId}`),
        API.get(`/wallet/contacts/recent?userId=${userId}`),
        API.get(`/wallet/contacts/frequent?userId=${userId}`)
      ]);
      setWallet(walletRes.data);
      setRecentContacts(recentRes.data || []);
      setFrequentContacts(frequentRes.data || []);
    } catch (err) {
      console.log("Error loading initial contacts:", err);
    }
  };

  // Live search
  useEffect(() => {
    if (!keyword || keyword.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      API.get(`/wallet/contacts/search?keyword=${encodeURIComponent(keyword.trim())}&currentUserId=${userId}`)
        .then(res => setSearchResults(res.data || []))
        .catch(console.log);
    }, 250);
    return () => clearTimeout(timer);
  }, [keyword, userId]);

  // Scroll to bottom when conversation history updates
  useEffect(() => {
    if (activeView === "CONVERSATION") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationHistory, activeView]);

  // Open conversation with contact
  const openConversation = async (contact) => {
    if (contact?.status === "BLOCKED" || contact?.trustBadge === "Blocked") {
      alert(`🚫 Account Blocked: You cannot transfer money or message (${contact.fullName || contact.upiId}) because this account is currently blocked.`);
      return;
    }
    setSelectedContact(contact);
    setActiveView("CONVERSATION");
    setKeyword("");
    setSearchResults([]);
    try {
      const res = await API.get(`/wallet/contacts/conversation/${userId}/${contact.userId}`);
      if (res.data) {
        const loadedContact = res.data.contact || contact;
        if (loadedContact.status === "BLOCKED" || loadedContact.trustBadge === "Blocked") {
          alert(`🚫 Account Blocked: This user account (${loadedContact.fullName}) is blocked. Transactions and messaging are disabled.`);
          setActiveView("HUB");
          return;
        }
        setSelectedContact(loadedContact);
        setConversationHistory(res.data.history || []);
      }
    } catch (err) {
      console.log("Error loading conversation history:", err);
      if (err.response?.data && typeof err.response.data === "string" && err.response.data.toLowerCase().includes("blocked")) {
        alert(`🚫 ${err.response.data}`);
        setActiveView("HUB");
      }
    }
  };

  // Send lightweight chat message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!textInput || !textInput.trim() || !selectedContact) return;
    const msgText = textInput.trim();
    setTextInput("");
    try {
      const res = await API.post("/wallet/contacts/send-message", {
        senderId: userId,
        receiverId: selectedContact.userId,
        message: msgText
      });
      // Append bubble immediately
      setConversationHistory(prev => [...prev, res.data]);
      loadInitialData(); // Refresh recent contacts silently
    } catch (err) {
      console.log("Failed to send message:", err);
    }
  };

  // Handle Note Chips click
  const selectNoteChip = (chipText) => {
    setPaymentNote(chipText);
  };

  // Start Payment flow from bottom sheet -> PIN
  const handleProceedToPin = () => {
    if (!wallet?.user?.transactionPin) {
      if (window.confirm("⚠️ You have not set a UPI PIN yet. Would you like to go to your Profile to set up your 4-digit UPI PIN now?")) {
        navigate("/profile");
      }
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (Number(amount) > Number(wallet?.balance)) {
      alert("Insufficient wallet balance!");
      return;
    }
    setShowBottomSheet(false);
    setPinError("");
    setTransactionPin("");
    setAiStatus("IDLE");
    setShowPinModal(true);
  };

  // Execute Payment cleanly without exposing internal AI analysis to user
  const handleVerifyAndPay = async () => {
    if (!transactionPin || transactionPin.length < 4) {
      setPinError("Please enter your 4-digit PIN");
      return;
    }
    setLoading(true);
    setPinError("");
    setAiStatus("PROCESSING");

    setTimeout(async () => {
      try {
        if (selectedContact?.isBiller) {
          // Handle Bill Payment via Withdraw logic to deduct wallet balance securely
          const payload = {
            userId: Number(userId),
            amount: Number(amount),
            selectedBank: `Bill Pay: ${selectedContact.fullName}`,
            transactionPin: transactionPin
          };
          const res = await API.post("/wallet/withdraw", payload);
          if (res.data === "Withdrawal successful") {
            setAiStatus("SUCCESS");
            setTimeout(() => {
              const newMsg = {
                senderId: Number(userId),
                receiverId: "biller",
                message: paymentNote || `Paid for ${selectedContact.fullName}`,
                amount: Number(amount),
                timestamp: new Date().toISOString()
              };
              setConversationHistory([...conversationHistory, newMsg]);
              setAmount("");
              setPaymentNote("");
              setTransactionPin("");
              setShowPinModal(false);
              setShowBottomSheet(false);
              setAiStatus("IDLE");
              loadInitialData(); // Refresh wallet balance
            }, 1500);
          } else {
            setPinError(res.data);
            setAiStatus("IDLE");
            setLoading(false);
          }
        } else {
          // Regular P2P Transfer
          const response = await API.post("/wallet/transfer", {
            senderUserId: userId,
            receiverUserId: selectedContact.userId,
            amount: Number(amount),
            transactionPin: transactionPin,
            paymentNote: paymentNote || "UPI Transfer",
            conversationId: `conv_${Math.min(userId, selectedContact.userId)}_${Math.max(userId, selectedContact.userId)}`
          });

          if (response.data && typeof response.data === "string" && response.data !== "Transfer Successful" && !response.data.includes("Successful")) {
            setAiStatus("IDLE");
            setLoading(false);
            if (response.data.includes("Invalid Transaction PIN")) {
              setPinError("❌ Incorrect PIN. Please try again.");
            } else if (response.data.includes("KYC_NOT_VERIFIED")) {
              alert("❌ Your KYC verification is pending. Redirecting you to complete KYC Verification now!");
              setShowPinModal(false);
              window.location.href = "/kyc-verification";
            } else {
              setPinError(`❌ ${response.data}`);
              alert(`🚫 Transfer Rejected: ${response.data}`);
            }
            return;
          }

          setAiStatus("SUCCESS");
          setTimeout(async () => {
            setShowPinModal(false);
            setLoading(false);
            
            // Refresh conversation details & inject bubble automatically
            try {
              const res = await API.get(`/wallet/contacts/conversation/${userId}/${selectedContact.userId}`);
              if (res.data) {
                setConversationHistory(res.data.history || []);
                setSelectedContact(res.data.contact || selectedContact);
              }
            } catch (e) { console.log(e); }

            // Refresh wallet balance & contacts silently
            loadInitialData();
            setAmount("");
            setPaymentNote("");
            setTransactionPin("");
          }, 1000);
        }

      } catch (error) {
        console.log(error);
        setAiStatus("IDLE");
        setPinError("❌ Transfer Failed. Please verify balance and account status.");
        setLoading(false);
      }
    }, 800);
  };

  const handleCheckBalance = () => {
    if (!wallet?.user?.transactionPin) {
      if (window.confirm("⚠️ You have not set a UPI PIN yet. Would you like to go to your Profile to set up your 4-digit UPI PIN now?")) {
        navigate("/profile");
      }
      return;
    }
    if (showBalance) {
      setShowBalance(false);
    } else {
      setBalancePin("");
      setBalancePinError("");
      setShowBalancePinModal(true);
    }
  };

  const handleVerifyBalancePin = () => {
    if (!balancePin || balancePin.length < 4) {
      setBalancePinError("Please enter your 4-digit PIN");
      return;
    }
    if (wallet?.user?.transactionPin && balancePin !== wallet.user.transactionPin) {
      setBalancePinError("❌ Incorrect UPI PIN. Please enter correct 4-digit PIN.");
      return;
    }
    setShowBalance(true);
    setShowBalancePinModal(false);
    setBalancePin("");
    setBalancePinError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: "80px", fontFamily: "'Inter', sans-serif" }}>
      <TopHeader wallet={wallet} />

      <div style={{ maxWidth: "1350px", margin: "0 auto", padding: "32px 36px" }}>
        
        {/* VIEW 1: CONTACTS & DISCOVERY HUB */}
        {activeView === "HUB" && (
          <div>
            {/* Header Title & Check Bank Balance Banner */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                  💸 Pay & Chat
                </h1>
                <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                  Send money instantly via conversation, phone number, or UPI ID
                </p>
              </div>

              {/* Google Pay Style Check Bank Balance Button / Card */}
              <div style={{
                background: "white", padding: "12px 20px", borderRadius: "18px", border: "1px solid #e2e8f0",
                boxShadow: "0 4px 14px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "14px"
              }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                  🏦
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: 0, fontWeight: 600 }}>Available Balance</p>
                  <p style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "2px 0 0" }}>
                    {showBalance ? `₹${wallet?.balance ?? 0}` : "••••••••"}
                  </p>
                </div>
                <button
                  onClick={handleCheckBalance}
                  style={{
                    padding: "8px 16px", borderRadius: "12px", border: "none",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
                    fontWeight: 700, fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.2)"
                  }}
                >
                  {showBalance ? "🙈 Hide" : "🔐 Check Balance"}
                </button>
              </div>
            </div>

            {/* Google Pay Style Large Search Bar */}
            <div style={{ position: "relative", marginBottom: "32px" }}>
              <span style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", fontSize: "20px" }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by Name, Mobile Number or WalletPay ID..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "18px 20px 18px 56px",
                  borderRadius: "24px",
                  border: "2px solid #e2e8f0",
                  fontSize: "15px",
                  fontWeight: 500,
                  background: "white",
                  color: "#0f172a",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
              {keyword && (
                <button
                  onClick={() => setKeyword("")}
                  style={{
                    position: "absolute", right: "18px", top: "50%", transform: "translateY(-50%)",
                    background: "#f1f5f9", border: "none", width: "30px", height: "30px", borderRadius: "50%",
                    cursor: "pointer", fontWeight: 700, color: "#64748b"
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Results List */}
            {keyword && (
              <div style={{ background: "white", borderRadius: "24px", padding: "16px", marginBottom: "32px", boxShadow: "0 12px 40px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: "8px 12px 14px" }}>
                  Matching Users ({searchResults.length})
                </p>
                {searchResults.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "24px", color: "#94a3b8", fontSize: "14px" }}>No users found matching "{keyword}"</p>
                ) : (
                  searchResults.filter(user => user.status !== "BLOCKED" && user.trustBadge !== "Blocked").map((user, idx) => (
                    <div
                      key={user.userId}
                      onClick={() => openConversation(user)}
                      style={{
                        display: "flex", alignItems: "center", gap: "16px", padding: "14px 16px",
                        borderRadius: "16px", cursor: "pointer", transition: "background 0.15s",
                        borderBottom: idx < searchResults.length - 1 ? "1px solid #f8fafc" : "none"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      {user.profileImage && user.profileImage !== "null" ? (
                        <img src={user.profileImage.startsWith("http") || user.profileImage.startsWith("data:") ? user.profileImage : `http://localhost:8080/profile-images/${user.profileImage}`} alt="" style={{ width: "48px", height: "48px", borderRadius: "16px", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = 'none'; if(e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                      ) : null}
                      <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: user.profileImage && user.profileImage !== "null" ? "none" : "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "18px" }}>
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "15px", margin: 0 }}>{user.fullName}</p>
                          <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", background: "#ecfdf5", color: "#059669" }}>
                            Verified UPI ✅
                          </span>
                        </div>
                        <p style={{ color: "#64748b", fontSize: "13px", margin: "3px 0 0" }}>
                          {user.upiId} • <span style={{ color: "#94a3b8" }}>{user.maskedMobileNumber}</span>
                        </p>
                      </div>
                      <span style={{ color: "#6366f1", fontWeight: 700, fontSize: "18px" }}>→</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SECTION 1: RECENT CONTACTS (Horizontal Scrollable) */}
            {!keyword && (
              <div style={{ marginBottom: "36px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  🕒 Recent Contacts
                </p>
                {recentContacts.length === 0 ? (
                  <div style={{ background: "white", borderRadius: "20px", padding: "24px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
                    <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>No recent conversations yet. Search above to get started!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "18px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "thin" }}>
                    {recentContacts.filter(contact => contact.status !== "BLOCKED" && contact.trustBadge !== "Blocked").map((contact) => (
                      <div
                        key={contact.userId}
                        onClick={() => openConversation(contact)}
                        style={{
                          minWidth: "100px", maxWidth: "110px", background: "white", borderRadius: "22px",
                          padding: "16px 12px", textAlign: "center", cursor: "pointer",
                          boxShadow: "0 6px 24px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9",
                          transition: "transform 0.15s, box-shadow 0.15s", flexShrink: 0
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.12)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.04)"; }}
                      >
                        <div style={{ position: "relative", width: "54px", height: "54px", margin: "0 auto 10px" }}>
                          {contact.profileImage && contact.profileImage !== "null" ? (
                            <img src={contact.profileImage.startsWith("http") || contact.profileImage.startsWith("data:") ? contact.profileImage : `http://localhost:8080/profile-images/${contact.profileImage}`} alt="" style={{ width: "100%", height: "100%", borderRadius: "18px", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = 'none'; if(e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                          ) : null}
                          <div style={{ width: "100%", height: "100%", borderRadius: "18px", background: "linear-gradient(135deg,#6366f1,#a855f7)", display: contact.profileImage && contact.profileImage !== "null" ? "none" : "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "20px" }}>
                            {contact.fullName ? contact.fullName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "14px", height: "14px", background: "#10b981", borderRadius: "50%", border: "2px solid white" }} />
                        </div>
                        <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "0 0 4px" }}>
                          {contact.fullName.split(" ")[0]}
                        </p>
                        <p style={{ color: "#64748b", fontSize: "11px", fontWeight: 500, margin: 0 }}>
                          {contact.lastTransactionTime || "Yesterday"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: FREQUENTLY PAID CONTACTS */}
            {!keyword && (
              <div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#334155", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  ⭐ Frequently Paid
                </p>
                {frequentContacts.length === 0 ? (
                  <div style={{ background: "white", borderRadius: "20px", padding: "24px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
                    <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>Your most frequent contacts will show up here as you make payments.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                    {frequentContacts.filter(contact => contact.status !== "BLOCKED" && contact.trustBadge !== "Blocked").map((contact) => (
                      <div
                        key={contact.userId}
                        onClick={() => openConversation(contact)}
                        style={{
                          background: "white", borderRadius: "22px", padding: "18px", display: "flex",
                          alignItems: "center", gap: "14px", cursor: "pointer",
                          boxShadow: "0 6px 24px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9",
                          transition: "transform 0.15s, border-color 0.15s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "#6366f1"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
                      >
                        {contact.profileImage && contact.profileImage !== "null" ? (
                          <img src={contact.profileImage.startsWith("http") || contact.profileImage.startsWith("data:") ? contact.profileImage : `http://localhost:8080/profile-images/${contact.profileImage}`} alt="" style={{ width: "48px", height: "48px", borderRadius: "16px", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = 'none'; if(e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "linear-gradient(135deg,#f97316,#fb923c)", display: contact.profileImage && contact.profileImage !== "null" ? "none" : "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "18px" }}>
                          {contact.fullName ? contact.fullName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px", margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {contact.fullName}
                          </p>
                          <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", background: "#f1f5f9", color: "#475569" }}>
                            {contact.totalTransactions} {contact.totalTransactions === 1 ? "Payment" : "Payments"}
                          </span>
                        </div>
                        <span style={{ color: "#cbd5e1", fontSize: "16px" }}>›</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: CONVERSATION SCREEN (Google Pay / PhonePe Style) */}
        {activeView === "CONVERSATION" && selectedContact && (
          <div style={{ background: "white", borderRadius: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", overflow: "hidden", display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", minHeight: "720px" }}>
            
            {/* Conversation Header */}
            <div style={{ padding: "18px 24px", background: "linear-gradient(135deg,#1e1b4b,#312e81)", color: "white", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                onClick={() => { setActiveView("HUB"); setSelectedContact(null); }}
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: "38px", height: "38px", borderRadius: "12px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ←
              </button>
              
              <div style={{ position: "relative" }}>
                {selectedContact.profileImage && selectedContact.profileImage !== "null" ? (
                  <img src={selectedContact.profileImage.startsWith("http") || selectedContact.profileImage.startsWith("data:") ? selectedContact.profileImage : `http://localhost:8080/profile-images/${selectedContact.profileImage}`} alt="" style={{ width: "46px", height: "46px", borderRadius: "16px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }} onError={(e) => { e.currentTarget.style.display = 'none'; if(e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                ) : null}
                <div style={{ width: "46px", height: "46px", borderRadius: "16px", background: "linear-gradient(135deg,#f97316,#fb923c)", display: selectedContact.profileImage && selectedContact.profileImage !== "null" ? "none" : "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "18px", border: "2px solid rgba(255,255,255,0.2)" }}>
                  {selectedContact.fullName ? selectedContact.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <span style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "12px", height: "12px", background: "#10b981", borderRadius: "50%", border: "2px solid #1e1b4b" }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{selectedContact.fullName}</h3>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", background: "rgba(255,255,255,0.18)", color: "white" }}>
                    Verified UPI ✅
                  </span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", margin: "3px 0 0" }}>
                  {selectedContact.upiId} • <span style={{ color: "#4ade80", fontWeight: 600 }}>Online</span>
                </p>
              </div>

              {/* Header Floating Action Info */}
              <div style={{ textAlign: "right", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                End-to-End<br />Protected 🔒
              </div>
            </div>

            {/* Chronological Chat & Transaction History Bubbles */}
            <div style={{ flex: 1, padding: "24px", overflowY: "auto", background: "linear-gradient(180deg,#f8fafc,#f1f5f9)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ textAlign: "center", margin: "8px 0 16px" }}>
                <span style={{ background: "#e2e8f0", color: "#64748b", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "14px", textTransform: "uppercase" }}>
                  WalletPay Conversation Security Active
                </span>
              </div>

              {conversationHistory.length === 0 ? (
                <div style={{ textAlign: "center", margin: "auto", color: "#94a3b8", padding: "20px" }}>
                  <p style={{ fontSize: "32px", margin: "0 0 8px" }}>👋</p>
                  <p style={{ fontWeight: 600, margin: 0 }}>Say hello to {selectedContact.fullName.split(" ")[0]} or send your first payment!</p>
                </div>
              ) : (
                conversationHistory.map((item, idx) => {
                  const isSentByMe = String(item.sender?.id || item.sender) === String(userId);
                  const isTextMessage = item.isMessage === true || (item.messageType === "TEXT");
                  const timeStr = item.transactionDate ? new Date(item.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";
                  
                  return (
                    <div
                      key={item.transactionId || idx}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isSentByMe ? "flex-end" : "flex-start"
                      }}
                    >
                      {isTextMessage ? (
                        /* Text Message Bubble */
                        <div style={{
                          maxWidth: "72%",
                          padding: "12px 16px",
                          borderRadius: isSentByMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                          background: isSentByMe ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "white",
                          color: isSentByMe ? "white" : "#0f172a",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
                          border: isSentByMe ? "none" : "1px solid #e2e8f0"
                        }}>
                          <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.4" }}>{item.remarks || item.message}</p>
                          <span style={{ display: "block", fontSize: "10px", color: isSentByMe ? "rgba(255,255,255,0.75)" : "#94a3b8", textAlign: "right", marginTop: "4px" }}>
                            {timeStr}
                          </span>
                        </div>
                      ) : (
                        /* Payment Transaction Bubble */
                        <div style={{
                          width: "260px",
                          padding: "16px 18px",
                          borderRadius: isSentByMe ? "22px 22px 6px 22px" : "22px 22px 22px 6px",
                          background: isSentByMe ? "linear-gradient(135deg,#0f172a,#1e293b)" : "white",
                          color: isSentByMe ? "white" : "#0f172a",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                          border: isSentByMe ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                            <div>
                              <p style={{ margin: 0, fontSize: "12px", color: isSentByMe ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
                                {isSentByMe ? "You Paid" : "You Received"}
                              </p>
                              <h3 style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: 800, color: isSentByMe ? "#4ade80" : "#10b981" }}>
                                ₹{item.amount}
                              </h3>
                            </div>
                            <span style={{ fontSize: "20px" }}>{isSentByMe ? "↗️" : "↙️"}</span>
                          </div>

                          {(item.paymentNote || item.remarks) && (item.paymentNote !== "UPI Transfer" && item.remarks !== "UPI Transfer") && (
                            <div style={{ padding: "8px 12px", borderRadius: "12px", background: isSentByMe ? "rgba(255,255,255,0.08)" : "#f8fafc", marginBottom: "10px", fontSize: "13px", color: isSentByMe ? "#e2e8f0" : "#334155" }}>
                              💬 {item.paymentNote || item.remarks}
                            </div>
                          )}

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: isSentByMe ? "1px solid rgba(255,255,255,0.1)" : "1px solid #f1f5f9", paddingTop: "8px", fontSize: "11px" }}>
                            <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                              ✅ Success
                            </span>
                            <span style={{ color: isSentByMe ? "#94a3b8" : "#94a3b8" }}>
                              {timeStr}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Footer Bottom Chat Bar & Fixed Floating Pay Button */}
            <div style={{ padding: "16px 20px", background: "white", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "12px" }}>
              <form onSubmit={handleSendMessage} style={{ flex: 1, display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  style={{
                    flex: 1, padding: "14px 18px", borderRadius: "20px", border: "2px solid #e2e8f0",
                    fontSize: "14px", background: "#f8fafc", color: "#0f172a", outline: "none"
                  }}
                />
                {textInput.trim() && (
                  <button
                    type="submit"
                    style={{
                      padding: "0 20px", borderRadius: "20px", background: "#6366f1", color: "white",
                      border: "none", fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    Send
                  </button>
                )}
              </form>

              {/* Large Floating Pay Button */}
              <button
                onClick={() => { setShowBottomSheet(true); setAmount(""); setPaymentNote(""); }}
                style={{
                  padding: "14px 26px", borderRadius: "22px",
                  background: "linear-gradient(135deg,#f97316,#fb923c)", color: "white",
                  border: "none", fontWeight: 800, fontSize: "16px", cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(249,115,22,0.35)", display: "flex", alignItems: "center", gap: "6px",
                  transition: "transform 0.15s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <span>₹</span> Pay
              </button>
            </div>
          </div>
        )}

      </div>

      {/* VIEW 3: PAYMENT BOTTOM SHEET (Slide Up Keypad & Chips) */}
      {showBottomSheet && selectedContact && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", zIndex: 999,
          display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "white", width: "100%", maxWidth: "600px", borderRadius: "32px 32px 0 0",
            padding: "32px 28px", boxShadow: "0 -20px 60px rgba(0,0,0,0.2)", animation: "slideUp 0.25s ease-out"
          }}>
            <div style={{ width: "50px", height: "6px", background: "#e2e8f0", borderRadius: "3px", margin: "0 auto 20px" }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 600, margin: 0 }}>Paying to</p>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "2px 0 0" }}>{selectedContact.fullName}</h3>
                <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>{selectedContact.upiId}</p>
              </div>
              <button
                onClick={() => setShowBottomSheet(false)}
                style={{ background: "#f1f5f9", border: "none", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontSize: "16px", fontWeight: 700, color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {/* Large Numeric Amount Display */}
            <div style={{ textAlign: "center", margin: "24px 0" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "#f97316", marginRight: "6px" }}>₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  style={{
                    fontSize: "48px", fontWeight: 800, color: "#0f172a", border: "none", outline: "none",
                    width: "220px", textAlign: "left", background: "transparent"
                  }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "4px" }}>
                <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                  Balance: <strong style={{ color: "#0f172a" }}>{showBalance ? `₹${wallet?.balance ?? 0}` : "••••••••"}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleCheckBalance}
                  style={{
                    background: "#eef2ff", color: "#6366f1", border: "1px solid #c7d2fe",
                    borderRadius: "8px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, cursor: "pointer"
                  }}
                >
                  {showBalance ? "Hide" : "🔐 Check"}
                </button>
              </div>
            </div>

            {/* Note Suggestion Chips */}
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "10px" }}>Add Payment Note (Optional)</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
              {["Lunch 🍔", "Rent 🏠", "Recharge 📱", "Coffee ☕", "Movie 🍿", "Shopping 🛍️"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => selectNoteChip(chip)}
                  style={{
                    padding: "8px 14px", borderRadius: "16px", fontSize: "13px", fontWeight: 600,
                    background: paymentNote === chip ? "#6366f1" : "#f1f5f9",
                    color: paymentNote === chip ? "white" : "#475569",
                    border: "none", cursor: "pointer", transition: "all 0.15s"
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Custom Note Input */}
            <input
              type="text"
              placeholder="Or write custom note..."
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              style={{
                width: "100%", padding: "14px 18px", borderRadius: "16px", border: "2px solid #e2e8f0",
                fontSize: "14px", background: "#f8fafc", color: "#0f172a", marginBottom: "24px", outline: "none"
              }}
            />

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleProceedToPin}
              disabled={!amount || Number(amount) <= 0}
              style={{
                width: "100%", padding: "18px", borderRadius: "20px",
                background: !amount || Number(amount) <= 0 ? "#cbd5e1" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "white", fontSize: "16px", fontWeight: 800, border: "none",
                cursor: !amount || Number(amount) <= 0 ? "not-allowed" : "pointer",
                boxShadow: "0 10px 30px rgba(99,102,241,0.3)"
              }}
            >
              Continue to Pay ₹{amount || "0"} →
            </button>
          </div>
        </div>
      )}

      {/* VIEW 4: TRANSACTION PIN MODAL & AI VERIFICATION ANIMATION */}
      {showPinModal && selectedContact && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999,
          display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(6px)"
        }}>
          <div style={{
            background: "white", width: "420px", borderRadius: "32px", padding: "40px",
            boxShadow: "0 30px 90px rgba(0,0,0,0.3)", textAlign: "center"
          }}>
            {aiStatus === "IDLE" ? (
              <div>
                <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg,#f97316,#fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 16px" }}>
                  🔐
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Enter UPI PIN</h2>
                <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px" }}>
                  Sending <strong style={{ color: "#f97316" }}>₹{amount}</strong> to {selectedContact.fullName}
                </p>

                <input
                  type="password"
                  maxLength="4"
                  autoFocus
                  placeholder="• • • •"
                  value={transactionPin}
                  onChange={(e) => { setTransactionPin(e.target.value); setPinError(""); }}
                  style={{
                    width: "100%", padding: "18px", borderRadius: "18px", border: `2px solid ${pinError ? "#ef4444" : "#e2e8f0"}`,
                    fontSize: "32px", textAlign: "center", letterSpacing: "14px", background: "#f8fafc", color: "#0f172a", marginBottom: "12px", outline: "none"
                  }}
                />

                {pinError && (
                  <p style={{ color: "#ef4444", fontWeight: 600, fontSize: "13px", margin: "0 0 16px" }}>
                    {pinError}
                  </p>
                )}

                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <button
                    onClick={handleVerifyAndPay}
                    disabled={loading}
                    style={{
                      flex: 1, padding: "16px", borderRadius: "16px", background: "linear-gradient(135deg,#10b981,#34d399)",
                      color: "white", border: "none", fontWeight: 800, fontSize: "15px", cursor: "pointer",
                      boxShadow: "0 8px 24px rgba(16,185,129,0.3)"
                    }}
                  >
                    ✅ Verify & Pay
                  </button>
                  <button
                    onClick={() => { setShowPinModal(false); setPinError(""); setTransactionPin(""); }}
                    style={{ flex: 1, padding: "16px", borderRadius: "16px", background: "#f1f5f9", color: "#64748b", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Clean Professional Payment Processing & Success Screen */
              <div style={{ padding: "24px 12px" }}>
                <div style={{ width: "86px", height: "86px", borderRadius: "50%", background: aiStatus === "SUCCESS" ? "#ecfdf5" : "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", margin: "0 auto 24px", border: `4px solid ${aiStatus === "SUCCESS" ? "#10b981" : "#6366f1"}`, animation: aiStatus !== "SUCCESS" ? "pulse 1s infinite" : "none" }}>
                  {aiStatus === "SUCCESS" ? "✅" : "⏳"}
                </div>
                
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>
                  {aiStatus === "SUCCESS" ? "Payment Successful!" : "Processing UPI Payment..."}
                </h3>

                <p style={{ color: aiStatus === "SUCCESS" ? "#10b981" : "#64748b", fontWeight: 600, fontSize: "15px", margin: "0 0 24px", lineHeight: "1.5" }}>
                  {aiStatus !== "SUCCESS" && `Verifying security and transferring ₹${amount} to ${selectedContact.fullName}`}
                  {aiStatus === "SUCCESS" && `₹${amount} has been securely transferred to ${selectedContact.fullName}`}
                </p>

                {aiStatus === "SUCCESS" && (
                  <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: "16px", textAlign: "left", fontSize: "13px", color: "#475569", border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>Amount Paid:</span> <strong style={{ color: "#0f172a" }}>₹{amount}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>Paid To:</span> <strong style={{ color: "#0f172a" }}>{selectedContact.fullName}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Status:</span> <strong style={{ color: "#10b981" }}>Completed ✅</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: CHECK BALANCE UPI PIN MODAL */}
      {showBalancePinModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 9999,
          display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(6px)"
        }}>
          <div style={{
            background: "white", width: "420px", borderRadius: "32px", padding: "40px",
            boxShadow: "0 30px 90px rgba(0,0,0,0.3)", textAlign: "center"
          }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 16px" }}>
              🏦
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Check Bank Balance</h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px" }}>
              Enter your 4-digit UPI PIN to view your available bank balance
            </p>

            <input
              type="password"
              maxLength="4"
              autoFocus
              placeholder="• • • •"
              value={balancePin}
              onChange={(e) => { setBalancePin(e.target.value); setBalancePinError(""); }}
              style={{
                width: "100%", padding: "18px", borderRadius: "18px", border: `2px solid ${balancePinError ? "#ef4444" : "#e2e8f0"}`,
                fontSize: "32px", textAlign: "center", letterSpacing: "14px", background: "#f8fafc", color: "#0f172a", marginBottom: "12px", outline: "none"
              }}
            />

            {balancePinError && (
              <p style={{ color: "#ef4444", fontWeight: 600, fontSize: "13px", margin: "0 0 16px" }}>
                {balancePinError}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                type="button"
                onClick={handleVerifyBalancePin}
                style={{
                  flex: 1, padding: "16px", borderRadius: "16px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "white", border: "none", fontWeight: 800, fontSize: "15px", cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.3)"
                }}
              >
                ✅ View Balance
              </button>
              <button
                type="button"
                onClick={() => { setShowBalancePinModal(false); setBalancePinError(""); setBalancePin(""); }}
                style={{ flex: 1, padding: "16px", borderRadius: "16px", background: "#f1f5f9", color: "#64748b", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransferMoney;
