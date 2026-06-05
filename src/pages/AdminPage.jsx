import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [verificationRequests, setVerificationRequests] = useState([])

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login')
      return
    }
    fetch(`${API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (res.status === 403) { setError('Accès refusé.'); return null }
        return res.json()
      })
      .then(data => data && setStats(data))
      .catch(() => setError('Impossible de charger les statistiques.'))

    fetch(`${API_URL}/api/admin/verification-requests`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setVerificationRequests(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [user, navigate])

  // ... (les fonctions handleVerifyService, handleDeleteService, handleDeleteUser, handleVerifyUser, handleRejectUser restent inchangées) ...

  if (!user || !user.isAdmin) return null

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-16 md:pt-20"></div>
        <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Administration Myra</h2>
          <p className="text-sm text-muted-foreground mb-6 md:mb-8">Supervision globale de la plateforme</p>
          {error && <p className="text-red-400 mb-4">{error}</p>}

          {/* ... (le reste du JSX reste identique) ... */}
        </main>
      </div>
    </PageTransition>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-3 md:p-4 text-center card-hover">
      <p className="text-2xl md:text-3xl font-bold">{value}</p>
      <p className="text-xs md:text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  )
}