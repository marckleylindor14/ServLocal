import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import API_URL from '../config'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('confirming') // 'confirming' | 'paid' | 'error'
  const bookingId = searchParams.get('booking_id')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      // Appeler la route de confirmation
      fetch(`${API_URL}/api/booking/confirm?session_id=${sessionId}`)
        .then(() => setStatus('paid'))
        .catch(() => setStatus('error'))
    } else if (bookingId) {
      // Si on arrive déjà avec un booking_id et un statut (ex: redirect depuis /api/booking/confirm)
      const st = searchParams.get('status')
      if (st === 'paid') setStatus('paid')
      else setStatus('error')
    } else {
      setStatus('error')
    }
  }, [searchParams, bookingId])

  useEffect(() => {
    if (status === 'paid') {
      const timer = setTimeout(() => navigate('/my-bookings'), 5000)
      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans page-enter">
      <Header />
      <div className="pt-20 flex items-center justify-center">
        <div className="text-center bg-card backdrop-blur-md border border-border rounded-2xl p-8 max-w-md mx-4">
          {status === 'confirming' && (
            <>
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Confirmation en cours...</h2>
              <p className="text-muted-foreground">Nous vérifions votre paiement.</p>
            </>
          )}
          {status === 'paid' && (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Paiement effectué !</h2>
              <p className="text-muted-foreground mb-6">
                Votre réservation est maintenant payée. Vous allez être redirigé vers vos réservations.
              </p>
              <button
                onClick={() => navigate('/my-bookings')}
                className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-full hover:bg-primary/90 transition"
              >
                Voir mes réservations
              </button>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-2xl font-bold mb-2">Erreur de paiement</h2>
              <p className="text-muted-foreground mb-6">
                Une erreur est survenue lors de la confirmation. Contactez le support si le problème persiste.
              </p>
              <button
                onClick={() => navigate('/my-bookings')}
                className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-full hover:bg-primary/90 transition"
              >
                Retour à mes réservations
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}