import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import { AlertTriangle } from 'lucide-react'

export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [verificationRequests, setVerificationRequests] = useState([])
  const [reports, setReports] = useState([])

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
      .catch(() => addToast('Impossible de charger les statistiques.', 'error'))

    fetch(`${API_URL}/api/admin/verification-requests`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setVerificationRequests(Array.isArray(data) ? data : []))
      .catch(() => {})

    fetch(`${API_URL}/api/admin/reports`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [user, navigate, addToast])

  const handleVerifyService = async (serviceId) => {
    await fetch(`${API_URL}/api/admin/services/${serviceId}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setStats(prev => ({
      ...prev,
      services: prev.services.map(s => s._id === serviceId ? { ...s, verified: true } : s)
    }))
    addToast('Service vérifié.', 'success')
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
    addToast('Service supprimé.', 'success')
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
    addToast('Utilisateur supprimé.', 'success')
  }

  const handleVerifyUser = async (userId) => {
    await fetch(`${API_URL}/api/admin/verify-user/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setVerificationRequests(prev => prev.filter(r => r._id !== userId))
    addToast('Utilisateur vérifié.', 'success')
  }

  const handleRejectUser = async (userId) => {
    await fetch(`${API_URL}/api/admin/reject-user/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setVerificationRequests(prev => prev.filter(r => r._id !== userId))
    addToast('Vérification refusée.', 'success')
  }

  const handleMarkReportTreated = async (reportId) => {
    await fetch(`${API_URL}/api/admin/reports/${reportId}/treated`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    setReports(prev => prev.filter(r => r._id !== reportId))
    addToast('Signalement marqué comme traité.', 'success')
  }

  if (!user || !user.isAdmin) return null

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 pb-32 md:pb-8"></div>
        <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Administration Myra</h2>
          <p className="text-sm text-muted-foreground mb-6 md:mb-8">Supervision globale de la plateforme</p>
          {error && <p className="text-red-400 mb-4">{error}</p>}

          {reports.length > 0 && (
            <div className="bg-card backdrop-blur-md border border-red-400/30 rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                <AlertTriangle size={20} />
                Signalements ({reports.length})
              </h3>
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report._id} className="border-b border-border pb-3 last:border-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {report.targetType === 'service' ? 'Service' : 'Utilisateur'} : <span className="text-primary">{report.targetName || `#${report.targetId}`}</span>
                        </p>
                        <p className="text-xs text-red-400 font-semibold mt-1">{report.reason}</p>
                        {report.details && <p className="text-xs text-muted-foreground mt-1">{report.details}</p>}
                        <p className="text-[11px] text-muted-foreground mt-2">
                          Signalé par {report.reporterName} · {new Date(report.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkReportTreated(report._id)}
                        className="text-xs border border-primary text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition self-start whitespace-nowrap"
                      >
                        Marquer traité
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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