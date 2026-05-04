import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import API_URL from '../config'

export default function ProviderDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetch(`${API_URL}/api/bookings/provider`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => setError('Impossible de charger les réservations.'))
  }, [user, navigate])

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        const updated = await res.json()
        setBookings(prev => prev.map(b => b._id === bookingId ? updated : b))
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la mise à jour.')
      }
    } catch (err) {
      alert('Impossible de contacter le serveur.')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <div className="pt-20"></div>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-extrabold mb-6">Tableau de bord prestataire</h2>
        <p className="text-muted-foreground mb-8">Gérez les réservations pour vos services.</p>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {bookings.length === 0 && !error && (
          <p className="text-muted-foreground">Aucune réservation reçue pour le moment.</p>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-card backdrop-blur-md border border-border rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{booking.serviceTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    Réservé par <span className="font-medium text-foreground">{booking.clientName}</span> pour le {booking.date} de {booking.timeSlot}
                  </p>
                  {booking.message && (
                    <p className="mt-1 text-sm text-muted-foreground">💬 {booking.message}</p>
                  )}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  booking.status === 'confirmed' ? 'bg-green-400/20 text-green-400' :
                  booking.status === 'cancelled' ? 'bg-red-400/20 text-red-400' :
                  'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {booking.status === 'pending' ? 'En attente' : booking.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                </span>
              </div>

              {booking.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleStatusChange(booking._id, 'confirmed')}
                    className="bg-green-500/80 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-500 transition"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleStatusChange(booking._id, 'cancelled')}
                    className="bg-red-500/80 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-500 transition"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}