import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import API_URL from '../config'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetch(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error('Erreur chargement réservations:', err))
  }, [user, navigate])

  const handlePay = async (serviceId, bookingId) => {
    try {
      const res = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ serviceId, bookingId })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Impossible de créer la session de paiement.')
      }
    } catch (error) {
      alert('Erreur réseau.')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground font-sans page-enter">
      <Header />
      <div className="pt-16 md:pt-20"></div>
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-12">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-2 md:mb-6">Mes réservations</h2>
        {bookings.length === 0 && (
          <p className="text-muted-foreground text-sm md:text-base">Vous n'avez aucune réservation pour le moment.</p>
        )}
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-card backdrop-blur-md border border-border rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <h3 className="text-lg md:text-xl font-bold">{booking.serviceTitle}</h3>
                  <p className="text-sm text-muted-foreground">{booking.serviceCategory} – par {booking.providerName}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium self-start ${
                  booking.paymentStatus === 'paid' ? 'bg-green-400/20 text-green-400' :
                  booking.status === 'confirmed' ? 'bg-blue-400/20 text-blue-400' :
                  booking.status === 'cancelled' ? 'bg-red-400/20 text-red-400' :
                  'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {booking.paymentStatus === 'paid' ? 'Payé' : booking.status === 'pending' ? 'En attente' : booking.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                📅 {booking.date} · 🕒 {booking.timeSlot}
              </div>
              {booking.message && (
                <p className="mt-2 text-sm text-muted-foreground">💬 {booking.message}</p>
              )}
              {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (
                <button
                  onClick={() => handlePay(booking.serviceId, booking._id)}
                  className="mt-4 w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition text-sm"
                >
                  Payer
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}