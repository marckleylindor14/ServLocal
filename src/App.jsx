import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import ProviderPage from './pages/ProviderPage'
import UserProfilePage from './pages/UserProfilePage'
import AddServicePage from './pages/AddServicePage'
import RequestServicePage from './pages/RequestServicePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ActivityPage from './pages/ActivityPage'
import NegotiationPage from './pages/NegotiationPage'
import MessagesPage from './pages/MessagesPage'
import AdminPage from './pages/AdminPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import AccountPage from './pages/AccountPage'
import SettingsPage from './pages/SettingsPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import LandingPage from './pages/LandingPage'
import Onboarding from './pages/Onboarding'
import OfflineBanner from './components/OfflineBanner'
import BottomNav from './components/BottomNav'

export default function App() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <>
      <OfflineBanner />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={user ? <HomePage /> : <LandingPage />} />
          <Route path="/provider/:id" element={<ProviderPage />} />
          <Route path="/user/:id" element={<UserProfilePage />} />
          <Route path="/add-service" element={<AddServicePage />} />
          <Route path="/request-service" element={<RequestServicePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/negotiation/:id" element={<NegotiationPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/my-services" element={<Navigate to="/activity" replace />} />
          <Route path="/my-bookings" element={<Navigate to="/activity" replace />} />
          <Route path="/my-demands" element={<Navigate to="/activity" replace />} />
          <Route path="/dashboard" element={<Navigate to="/activity" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      {user && <BottomNav />}
    </>
  )
}