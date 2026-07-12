import { Routes, Route } from 'react-router-dom'
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
import Onboarding from './pages/Onboarding'
import OfflineBanner from './components/OfflineBanner'
import RequestServicePage from './pages/RequestServicePage'

export default function App() {
  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
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
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/request-service" element={<RequestServicePage />} />
      </Routes>
    </>
  )
}