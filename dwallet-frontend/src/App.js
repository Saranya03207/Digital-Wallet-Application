import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import TransferMoney from "./pages/TransferMoney";
import History from "./pages/History";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Notifications from "./pages/Notifications";
import AddMoney from "./pages/AddMoney";
import WithdrawMoney from "./pages/WithdrawMoney";
import BankAccounts from "./pages/BankAccounts";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTransactions from "./pages/AdminTransactions";
import AdminAnalytics from "./pages/AdminAnalytics";
import FraudMonitor from "./pages/FraudMonitor";
import KycVerification from "./pages/KycVerification";
import KycManagement from "./pages/KycManagement";
import AdminSupport from "./pages/AdminSupport";

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/"element={<Navigate to="/login" />}/>

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="/wallet"element={<ProtectedRoute><Wallet /></ProtectedRoute>}/>

        <Route path="/transfer"  element={<ProtectedRoute><TransferMoney /></ProtectedRoute>}/>

        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>}/>

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>

        <Route path="/notifications"element={<ProtectedRoute><Notifications /></ProtectedRoute>}/>

        <Route path="/add-money"element={<ProtectedRoute><AddMoney /></ProtectedRoute>}/>
        <Route path="/withdraw-money"element={<ProtectedRoute><WithdrawMoney /></ProtectedRoute>}/>
        <Route path="/bank-accounts"element={<ProtectedRoute><BankAccounts /></ProtectedRoute>}/>

        <Route path="/verify-otp"element={<VerifyOtp />}/>

        <Route path="/forgot-password"element={<ForgotPassword />}/>
        
        <Route path="/reset-password"element={<ResetPassword />}/>

        <Route path="/change-password"element={<ChangePassword />}/>

        <Route path="/kyc" element={<ProtectedRoute><KycVerification /></ProtectedRoute>} />

        <Route path="/admin" element={<AdminDashboard/>}/>

        <Route path="/admin/kyc" element={<KycManagement />} />

        <Route path="/admin/transactions" element={<AdminTransactions />}/>

        <Route path="/admin/users" element={<AdminUsers />} />

        <Route path="/admin/analytics"element={<AdminAnalytics/>}/>

        <Route path="/admin/fraud"element={<FraudMonitor />}/>
        <Route path="/admin/support" element={<AdminSupport />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;