# 💳 WalletPay - Next-Gen Digital Wallet with AI Fraud Detection

![WalletPay Banner](https://img.shields.io/badge/Status-Active-brightgreen) ![React](https://img.shields.io/badge/Frontend-React.js-blue) ![Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot-green) ![Python](https://img.shields.io/badge/AI_Engine-Python_Flask-yellow)

WalletPay is a highly advanced, full-stack digital wallet application designed to deliver a seamless, Google Pay-style payment experience. Powered by a robust Spring Boot backend, a beautiful React frontend, and an intelligent Python AI engine, WalletPay redefines secure and rewarding digital transactions.

---

## ✨ Key Features

### 🚀 Seamless P2P Payments & Chat
- **Conversational UI**: Send and receive money directly within a chat interface, exactly like texting a friend.
- **QR Code Scanner**: Instantly find users and initiate payments by scanning their WalletPay QR codes.
- **Smart Contact Discovery**: Live search for users by Phone Number or UPI ID.

### 🛡️ AI-Powered Fraud Detection
- **Real-Time Risk Analysis**: Every transaction is analyzed by a custom Machine Learning model (`walletpay-ai`) before processing.
- **Anomaly Detection**: Flags suspicious behaviors, extreme transaction amounts, and unusual device usage.
- **Admin Review**: High-risk transactions are instantly blocked and flagged for Admin inspection.

### 💳 Utility Bill Payments & Recharges
- **Unified Payment Flow**: Pay Electricity, Mobile Recharge, DTH, and Credit Card bills.
- **GPay-Style Routing**: Entering a biller number instantly opens the Chat Interface with a "Biller Contact" to complete the payment securely using your 4-digit UPI PIN.

### 🏆 Loyalty Rewards & Cashback Hub
- **Earn as you Spend**: Earn reward points for every transaction and bill payment.
- **One-Click Redemption**: Instantly convert loyalty points directly into Wallet Balance cashback.
- **Membership Tiers**: Climb the ranks from Bronze to Platinum based on your spending.

### 🏦 CIBIL Score & Financial Health
- **Live Credit Check**: Check your simulated CIBIL score directly in the app.
- **Pre-Approved Loans**: Instant zero-paperwork personal loans and Buy Now Pay Later (BNPL) credit limits unlocked based on excellent credit scores.

### 📸 Advanced KYC & Admin Verification
- **Dual-Sided Aadhaar**: Drag-and-drop or upload both the Front and Back of an Aadhaar card alongside a live selfie.
- **Admin Inspection Grid**: Admins review KYC submissions in a beautiful 3-column photo comparison grid to approve or reject users.

---

## 🛠️ Technology Stack

### Frontend (User Interface)
- **Framework**: React.js
- **Styling**: Vanilla CSS with modern Glassmorphism, CSS Gradients, and custom SVG Vector Icons.
- **Routing**: React Router DOM

### Backend (Core Logic)
- **Framework**: Java 17 + Spring Boot
- **Database**: MySQL (Spring Data JPA)
- **Security**: Spring Security & BCrypt Password Encryption
- **API Documentation**: Swagger OpenAPI

### AI Engine (Risk & Fraud Analysis)
- **Language**: Python 3
- **Framework**: Flask / FastAPI
- **Machine Learning**: Scikit-Learn, Pandas, Numpy (Pre-trained `fraud_model.pkl`)

---

## ⚙️ Local Setup & Installation

### 1. Backend Setup (Spring Boot)
1. Ensure you have **Java 17** and **MySQL** installed.
2. Create a MySQL database named `digitalwallet`.
3. Open the `SpringBootWS/digitalwallet` directory in your IDE.
4. Update `application.properties` with your database credentials.
5. Run the Spring Boot application on `localhost:8080`.

### 2. Frontend Setup (React)
1. Open a terminal and navigate to the frontend directory: `cd dwallet-frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. The app will open at `localhost:3000`.

### 3. AI Server Setup (Python)
1. Navigate to the AI directory: `cd walletpay-ai`
2. Activate the virtual environment: `.\venv\Scripts\activate` (Windows)
3. Install requirements: `pip install -r requirements.txt`
4. Run the AI server: `python app.py`

---

## 🔒 Security Measures
- **4-Digit UPI PIN**: Required for every transaction and balance check.
- **Encrypted Passwords**: All user passwords are encrypted using BCrypt.
- **Account Blocking**: Admins can instantly freeze or block suspicious accounts.

---

## 👨‍💻 Developer
Developed and maintained by [Saranya03207](https://github.com/Saranya03207). 
Feel free to open issues or submit pull requests for improvements!

---
> *Disclaimer: WalletPay is a portfolio project and uses simulated financial endpoints, AI mock models, and mock CIBIL scores. It is not intended for real-world financial processing out of the box.*
