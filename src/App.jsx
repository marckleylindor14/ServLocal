import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import ProviderPage from './pages/ProviderPage'
import AddServicePage from './pages/AddServicePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MyServicesPage from './pages/MyServicesPage'
import MyBookingsPage from './pages/MyBookingsPage'
import ProviderDashboardPage from './pages/ProviderDashboardPage'
import MessagesPage from './pages/MessagesPage'
import AdminPage from './pages/AdminPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import AccountPage from './pages/AccountPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import LandingPage from './pages/LandingPage'
import OfflineBanner from './components/OfflineBanner'

export default function App() {
  const { user } = useAuth()

  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <LandingPage />} />
        <Route path="/provider/:id" element={<ProviderPage />} />
        <Route path="/add-service" element={<AddServicePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/my-services" element={<MyServicesPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/dashboard" element={<ProviderDashboardPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </>
  )
}