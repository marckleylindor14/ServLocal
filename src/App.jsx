import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProviderPage from './pages/ProviderPage'
import AddServicePage from './pages/AddServicePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MyServicesPage from './pages/MyServicesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/provider/:id" element={<ProviderPage />} />
      <Route path="/add-service" element={<AddServicePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/my-services" element={<MyServicesPage />} />
    </Routes>
  )
}