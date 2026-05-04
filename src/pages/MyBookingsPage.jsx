import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import API_URL from '../config'

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetch(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error('Erreur chargement réservations:', err))
  }, [user, navigate])

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <div className="pt-20"></div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-extrabold mb-6">Mes réservations</h2>
        {bookings.length === 0 && (
          <p className="text-muted-foreground">Vous n'avez aucune réservation pour le moment.</p>
        )}
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-card backdrop-blur-md border border-border rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{booking.serviceTitle}</h3>
                  <p className="text-sm text-muted-foreground">{booking.serviceCategory} – par {booking.providerName}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  booking.status === 'confirmed' ? 'bg-green-400/20 text-green-400' :
                  booking.status === 'cancelled' ? 'bg-red-400/20 text-red-400' :
                  'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {booking.status === 'pending' ? 'En attente' : booking.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                📅 {booking.date} · 🕒 {booking.timeSlot}
              </div>
              {booking.message && (
                <p className="mt-2 text-sm text-muted-foreground">💬 {booking.message}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}