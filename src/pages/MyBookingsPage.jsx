import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import SkeletonCard from '../components/SkeletonCard'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [bookings, setBookings] = useState([])
  const [negotiations, setNegotiations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetch(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setBookings(data)
        setLoading(false)
      })
      .catch(() => {
        addToast('Erreur chargement réservations', 'error')
        setLoading(false)
      })

    fetch(`${API_URL}/api/negotiations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setNegotiations(Array.isArray(data) ? data.filter(n => n.status === 'pending') : []))
      .catch(() => {})
  }, [user, navigate, addToast])

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
        addToast(data.error || 'Impossible de créer la session de paiement.', 'error')
      }
    } catch {
      addToast('Erreur réseau.', 'error')
    }
  }

  if (!user) return null

  const toPayBookings = bookings.filter(b => b.status === 'awaiting_payment')
  const otherBookings = bookings.filter(b => b.status !== 'awaiting_payment')

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 pb-32 md:pb-8"></div>
        <main className="max-w-4xl mx-auto px-4 py-6 md:py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Mes réservations</h2>

          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="space-y-6">
              {negotiations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                    🤝 Négociations en cours ({negotiations.length})
                  </h3>
                  <div className="space-y-3">
                    {negotiations.map(n => (
                      <Link
                        key={n._id}
                        to={`/negotiation/${n._id}`}
                        className="card-hover p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-sm">{n.serviceTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {n.initiatorId === user.id ? `Avec ${n.recipientName}` : `Avec ${n.initiatorName}`}
                          </p>
                        </div>
                        <span className="text-primary text-sm font-bold">{n.price} € →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {toPayBookings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    ⚠️ À payer ({toPayBookings.length})
                  </h3>
                  <div className="space-y-4">
                    {toPayBookings.map(booking => (
                      <div key={booking._id} className="card-hover p-5 border-yellow-400/30 border-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                          <div>
                            <h3 className="text-lg font-bold">{booking.serviceTitle}</h3>
                            <p className="text-sm text-muted-foreground">Prestataire : {booking.providerName}</p>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full font-medium self-start bg-yellow-400/20 text-yellow-400">
                            À payer
                          </span>
                        </div>
                        {booking.date && (
                          <div className="text-sm text-muted-foreground mb-2">
                            📅 {booking.date} · 🕒 {booking.timeSlot}
                          </div>
                        )}
                        {booking.location && (
                          <div className="text-sm text-muted-foreground mb-2">
                            📍 {booking.location}
                          </div>
                        )}
                        {booking.message && (
                          <p className="text-sm text-muted-foreground mb-3">💬 {booking.message}</p>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-border/40">
                          <span className="text-primary font-bold text-lg">
                            {booking.price ? `${booking.price} €` : '—'}
                          </span>
                          <button
                            onClick={() => handlePay(booking.serviceId, booking._id)}
                            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition text-sm"
                          >
                            Payer maintenant
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {otherBookings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Historique ({otherBookings.length})
                  </h3>
                  <div className="space-y-4">
                    {otherBookings.map(booking => (
                      <div key={booking._id} className="card-hover p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <h3 className="text-lg font-bold">{booking.serviceTitle}</h3>
                            <p className="text-sm text-muted-foreground">{booking.serviceCategory || ''} – par {booking.providerName}</p>
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
                        {booking.date && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            📅 {booking.date} · 🕒 {booking.timeSlot}
                          </div>
                        )}
                        {booking.location && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            📍 {booking.location}
                          </div>
                        )}
                        {booking.message && (
                          <p className="mt-2 text-sm text-muted-foreground">💬 {booking.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bookings.length === 0 && negotiations.length === 0 && (
                <EmptyState
                  title="Aucune réservation"
                  description="Vous n'avez pas encore réservé de service."
                  actionLabel="Voir les services"
                  onAction={() => navigate('/')}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  )
}