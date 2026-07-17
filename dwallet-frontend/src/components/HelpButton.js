import React, { useState, useEffect, useRef } from "react";
import API from "../services/api";

function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chatbot"); // chatbot, faq, contact
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! I am your Digital Wallet Assistant. How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [kycStatus, setKycStatus] = useState("NOT_STARTED");
  const [userProfile, setUserProfile] = useState(null);
  const chatEndRef = useRef(null);

  // Support ticket fields
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketMobile, setTicketMobile] = useState("");

  // Load user profile / KYC status from localStorage
  useEffect(() => {
    try {
      const uId = localStorage.getItem("userId");
      const uName = localStorage.getItem("username");
      if (uId && uName) {
        setUserProfile({
          id: uId,
          fullName: uName
        });
        if (!ticketName) setTicketName(uName);
        API.get(`/wallet/details/${uId}`).then(res => {
          if (res.data?.user) {
            if (!ticketEmail) setTicketEmail(res.data.user.email || "");
            if (!ticketMobile) setTicketMobile(res.data.user.mobileNumber || "");
          }
        }).catch(err => console.log(err));
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: "user", text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText("");

    // Simulate bot thinking
    setTimeout(() => {
      let botResponse = "";
      const query = text.toLowerCase();

      if (query.includes("kyc") || query.includes("verify") || query.includes("aadhaar")) {
        botResponse = "To verify your KYC, click the KYC Verification link in your sidebar menu and upload your Aadhaar document and selfie. Verification is processed instantly or reviewed by admins within 10-15 minutes.";
      } else if (query.includes("dispute") || query.includes("report") || query.includes("refund") || query.includes("wrong transaction")) {
        botResponse = "If you have an issue with a transaction (e.g., failed payment, double debit, unrecognized charges), go to the **History** tab, click on the transaction, and click **Report Issue**. The administrator will review it and process a refund if valid.";
      } else if (query.includes("limit") || query.includes("transfer limit") || query.includes("max")) {
        botResponse = "Daily transfer limits prevent fraudulent transaction velocity. You can view or adjust your daily transfer limits on the **Profile** page under security settings.";
      } else if (query.includes("send money") || query.includes("transfer") || query.includes("pay")) {
        botResponse = "To send money to a contact: \n1. Go to the **Transfer** page.\n2. Search your contact by Name, Mobile, or UPI ID.\n3. Enter the amount and your secure 4-digit Pin.\n\n*Note: Transactions to BLOCKED users are prohibited for security.*";
      } else if (query.includes("blocked") || query.includes("block")) {
        botResponse = "If your account is blocked, please submit an unblock request under the **Contact Support** tab with your registered email address and mobile number. The administrator will review your account and unblock it.";
      } else if (query.includes("hi") || query.includes("hello") || query.includes("hey")) {
        botResponse = `Hello! I'm here to assist with transactions, disputes, limits, or account block questions. What can I do for you?`;
      } else {
        botResponse = "I appreciate your question. If you need specific help, you can submit a support ticket under the **Contact Support** tab, or report a specific transaction in your **History** page.";
      }

      setMessages(prev => [...prev, { sender: "bot", text: botResponse }]);
    }, 800);
  };

  // Pre-configured FAQ items
  const faqData = [
    {
      q: "How long does KYC verification take?",
      a: "KYC approvals are processed by admins. It typically takes 10-15 minutes once you submit your Aadhaar details and live selfie snapshot."
    },
    {
      q: "Where do reported transaction issues go?",
      a: "When you raise a dispute from your Transaction History, it goes directly to the Admin Dashboard. The admin reviews the logs and can instantly reverse/refund the payment back to your wallet."
    },
    {
      q: "Why can't I send money to a contact?",
      a: "Make sure the recipient is not blocked. You also cannot send money if you exceed your daily transfer limit or do not have enough wallet balance."
    },
    {
      q: "My account is blocked. How do I unblock it?",
      a: "Accounts are blocked if flagged by AI or manually restricted. Submit a ticket under the 'Contact Support' tab with your email and mobile number, and the admin will review and unblock it."
    }
  ];

  const [activeFaq, setActiveFaq] = useState(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketName || !ticketEmail || !ticketMobile || !ticketSubject || !ticketDesc) {
      alert("Please fill in all support ticket fields.");
      return;
    }

    try {
      await API.post("/support/submit", {
        userId: userProfile ? userProfile.id : null,
        fullName: ticketName,
        email: ticketEmail,
        mobileNumber: ticketMobile,
        subject: ticketSubject,
        message: ticketDesc
      });

      setTicketSuccess(true);
      const submittedSubject = ticketSubject;
      setTicketSubject("");
      setTicketDesc("");
      
      // Add notification to bot chat
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: `🎟️ **Support Ticket Created Successfully!** \nSubject: *${submittedSubject}*\nOur support staff will review your case and reply within 24 hours.` 
      }]);
    } catch (err) {
      alert("Failed to submit support ticket. Please try again.");
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          color: "white",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 8px 28px rgba(99, 102, 241, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.1) rotate(10deg)";
          e.currentTarget.style.boxShadow = "0 12px 36px rgba(99, 102, 241, 0.6)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          e.currentTarget.style.boxShadow = "0 8px 28px rgba(99, 102, 241, 0.4)";
        }}
        title="Help & Support"
      >
        {isOpen ? (
          // Close Icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          // Help/Message Icon
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Slide-out Support Drawer */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "96px",
          right: "24px",
          width: "380px",
          height: "520px",
          borderRadius: "20px",
          background: "#ffffff",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 9998,
          animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            padding: "16px 20px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", letterSpacing: "-0.01em" }}>Customer Support</h3>
              <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "10px" }}>Active</span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", opacity: 0.85 }}>Ask us anything about your digital wallet</p>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc"
          }}>
            <button 
              onClick={() => { setActiveTab("chatbot"); setTicketSuccess(false); }}
              style={{
                flex: 1, padding: "12px", border: "none", background: "transparent",
                fontSize: "13px", fontWeight: activeTab === "chatbot" ? "600" : "500",
                color: activeTab === "chatbot" ? "#4f46e5" : "#64748b",
                borderBottom: activeTab === "chatbot" ? "2px solid #4f46e5" : "none",
                cursor: "pointer"
              }}
            >
              AI Assistant
            </button>
            <button 
              onClick={() => { setActiveTab("faq"); setTicketSuccess(false); }}
              style={{
                flex: 1, padding: "12px", border: "none", background: "transparent",
                fontSize: "13px", fontWeight: activeTab === "faq" ? "600" : "500",
                color: activeTab === "faq" ? "#4f46e5" : "#64748b",
                borderBottom: activeTab === "faq" ? "2px solid #4f46e5" : "none",
                cursor: "pointer"
              }}
            >
              FAQs
            </button>
            <button 
              onClick={() => { setActiveTab("contact"); setTicketSuccess(false); }}
              style={{
                flex: 1, padding: "12px", border: "none", background: "transparent",
                fontSize: "13px", fontWeight: activeTab === "contact" ? "600" : "500",
                color: activeTab === "contact" ? "#4f46e5" : "#64748b",
                borderBottom: activeTab === "contact" ? "2px solid #4f46e5" : "none",
                cursor: "pointer"
              }}
            >
              Contact Support
            </button>
          </div>

          {/* Body Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#f8fafc" }}>
            
            {/* Tab 1: AI Chatbot */}
            {activeTab === "chatbot" && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "12px" }}>
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        padding: "10px 14px",
                        borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                        background: msg.sender === "user" ? "#4f46e5" : "#ffffff",
                        color: msg.sender === "user" ? "white" : "#1e293b",
                        fontSize: "13px",
                        lineHeight: "1.4",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        border: msg.sender === "user" ? "none" : "1px solid #e2e8f0",
                        whiteSpace: "pre-line"
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "8px 0" }}>
                  <button 
                    onClick={() => handleSend("Check my KYC Status")}
                    style={{
                      background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "14px",
                      padding: "4px 10px", fontSize: "11px", color: "#4f46e5", cursor: "pointer"
                    }}
                  >
                    🔍 KYC Status
                  </button>
                  <button 
                    onClick={() => handleSend("How to raise a dispute for transaction?")}
                    style={{
                      background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "14px",
                      padding: "4px 10px", fontSize: "11px", color: "#4f46e5", cursor: "pointer"
                    }}
                  >
                    ⚠️ Raise Dispute
                  </button>
                  <button 
                    onClick={() => handleSend("What is my daily transfer limit?")}
                    style={{
                      background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "14px",
                      padding: "4px 10px", fontSize: "11px", color: "#4f46e5", cursor: "pointer"
                    }}
                  >
                    📊 Daily Limit
                  </button>
                </div>

                {/* Chat Input */}
                <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #e2e8f0", paddingTop: "12px", background: "#f8fafc" }}>
                  <input 
                    type="text"
                    placeholder="Type your question..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: "20px", border: "1px solid #cbd5e1",
                      fontSize: "13px", outline: "none", background: "#ffffff"
                    }}
                  />
                  <button 
                    onClick={() => handleSend()}
                    style={{
                      background: "#4f46e5", border: "none", color: "white", padding: "8px 14px",
                      borderRadius: "20px", fontSize: "13px", fontWeight: "600", cursor: "pointer"
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: FAQ accordion */}
            {activeTab === "faq" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1e293b" }}>Frequently Asked Questions</h4>
                {faqData.map((faq, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0",
                      overflow: "hidden", cursor: "pointer"
                    }}
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  >
                    <div style={{
                      padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center",
                      fontWeight: "500", fontSize: "13px", color: "#1e293b"
                    }}>
                      <span>{faq.q}</span>
                      <svg 
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        style={{ transform: activeFaq === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                    {activeFaq === idx && (
                      <div style={{
                        padding: "0 12px 12px 12px", fontSize: "12.5px", color: "#64748b", lineHeight: "1.5"
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Contact support form */}
            {activeTab === "contact" && (
              <div>
                {ticketSuccess ? (
                  <div style={{ textAlign: "center", padding: "24px 12px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <h4 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "15px" }}>Support Ticket Created!</h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>
                      We have submitted your ticket to the admin desk. Check the AI Assistant tab for details!
                    </p>
                    <button 
                      onClick={() => setTicketSuccess(false)}
                      style={{
                        marginTop: "16px", padding: "6px 16px", background: "#4f46e5", color: "white",
                        border: "none", borderRadius: "16px", fontSize: "12px", cursor: "pointer"
                      }}
                    >
                      Submit Another Ticket
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 style={{ margin: 0, fontSize: "14px", color: "#1e293b" }}>Open Support Ticket</h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                      Describe your problem and our support team will handle it immediately.
                    </p>
                    
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Your Full Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. John Doe"
                        required
                        value={ticketName}
                        onChange={e => setTicketName(e.target.value)}
                        style={{
                          width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1",
                          fontSize: "13px", outline: "none"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Your Email Address</label>
                      <input 
                        type="email"
                        placeholder="e.g. john@example.com"
                        required
                        value={ticketEmail}
                        onChange={e => setTicketEmail(e.target.value)}
                        style={{
                          width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1",
                          fontSize: "13px", outline: "none"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Your Mobile Number</label>
                      <input 
                        type="tel"
                        placeholder="e.g. +91 9876543210"
                        required
                        value={ticketMobile}
                        onChange={e => setTicketMobile(e.target.value)}
                        style={{
                          width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1",
                          fontSize: "13px", outline: "none"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Subject</label>
                      <input 
                        type="text"
                        placeholder="e.g. Transaction pin reset request"
                        required
                        value={ticketSubject}
                        onChange={e => setTicketSubject(e.target.value)}
                        style={{
                          width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1",
                          fontSize: "13px", outline: "none"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Description</label>
                      <textarea 
                        rows="4"
                        placeholder="Details about your issue..."
                        required
                        value={ticketDesc}
                        onChange={e => setTicketDesc(e.target.value)}
                        style={{
                          width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1",
                          fontSize: "13px", outline: "none", resize: "none"
                        }}
                      />
                    </div>
                    <button 
                      type="submit"
                      style={{
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)", border: "none", color: "white",
                        padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)"
                      }}
                    >
                      Submit Ticket
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Slide-in Animation Style */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

export default HelpButton;

