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
    if (!user || user.email !== 'Marckleylindor21@gmail.com') {
      navigate('/login')
      return
    }
    // Charger les stats
    fetch(`${API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (res.status === 403) { setError('Accès refusé.'); return null }
        return res.json()
      })
      .then(data => data && setStats(data))
      .catch(() => setError('Impossible de charger les statistiques.'))

    // Charger les demandes de vérification
    fetch(`${API_URL}/api/admin/verification-requests`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setVerificationRequests(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [user, navigate])

  const handleVerifyService = async (serviceId) => {
    await fetch(`${API_URL}/api/admin/services/${serviceId}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setStats(prev => ({
      ...prev,
      services: prev.services.map(s => s._id === serviceId ? { ...s, verified: true } : s)
    }))
  }

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Supprimer ce service ?')) return
    await fetch(`${API_URL}/api/admin/services/${serviceId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setStats(prev => ({
      ...prev,
      services: prev.services.filter(s => s._id !== serviceId),
      totalServices: prev.totalServices - 1
    }))
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setStats(prev => ({
      ...prev,
      users: prev.users.filter(u => u._id !== userId),
      totalUsers: prev.totalUsers - 1
    }))
  }

  const handleVerifyUser = async (userId) => {
    await fetch(`${API_URL}/api/admin/verify-user/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setVerificationRequests(prev => prev.filter(r => r._id !== userId))
    // Optionnel : rafraîchir les stats
  }

  const handleRejectUser = async (userId) => {
    await fetch(`${API_URL}/api/admin/reject-user/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setVerificationRequests(prev => prev.filter(r => r._id !== userId))
  }

  if (!user || user.email !== 'Marckley.lindor14@gmail.com') return null

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-16 md:pt-20"></div>
        <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Administration Myra</h2>
          <p className="text-sm text-muted-foreground mb-6 md:mb-8">Supervision globale de la plateforme</p>
          {error && <p className="text-red-400 mb-4">{error}</p>}

          {/* Vérifications en attente */}
          {verificationRequests.length > 0 && (
            <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold mb-4">Vérifications en attente</h3>
              <div className="space-y-4">
                {verificationRequests.map(req => (
                  <div key={req._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
                    <div>
                      <p className="font-medium">{req.name} ({req.email})</p>
                      <a href={req.verificationDocument} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline">Voir le document</a>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleVerifyUser(req._id)} className="bg-green-500/80 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-500 transition">Vérifier</button>
                      <button onClick={() => handleRejectUser(req._id)} className="bg-red-500/80 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-500 transition">Refuser</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                <StatCard label="Services" value={stats.totalServices} />
                <StatCard label="Utilisateurs" value={stats.totalUsers} />
                <StatCard label="Réservations" value={stats.totalBookings} />
                <StatCard label="Avis" value={stats.totalReviews} />
              </div>

              <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-bold mb-4">Services</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stats.services.map(service => (
                    <div key={service._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-border pb-2">
                      <div>
                        <p className="font-medium text-sm md:text-base">{service.title} <span className="text-xs text-muted-foreground">par {service.providerName}</span></p>
                        <span className={`text-xs ${service.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                          {service.verified ? 'Vérifié' : 'Non vérifié'}
                        </span>
                      </div>
                      <div className="flex gap-2 self-end sm:self-auto">
                        {!service.verified && (
                          <button onClick={() => handleVerifyService(service._id)} className="text-xs border border-primary text-primary px-3 py-1 rounded-full hover:bg-primary hover:text-primary-foreground transition">
                            Vérifier
                          </button>
                        )}
                        <button onClick={() => handleDeleteService(service._id)} className="text-xs border border-red-400 text-red-400 px-3 py-1 rounded-full hover:bg-red-400 hover:text-white transition">
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-4">Utilisateurs</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stats.users.map(u => (
                    <div key={u._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-border pb-2">
                      <div>
                        <p className="font-medium text-sm md:text-base">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <button onClick={() => handleDeleteUser(u._id)} className="text-xs border border-red-400 text-red-400 px-3 py-1 rounded-full hover:bg-red-400 hover:text-white transition self-end sm:self-auto">
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
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