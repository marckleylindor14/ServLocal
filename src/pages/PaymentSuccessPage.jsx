import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import PageTransition from '../components/PageTransition'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/my-bookings')
    }, 5000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center bg-card backdrop-blur-md border border-border rounded-2xl p-8 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Paiement effectué !</h2>
            <p className="text-muted-foreground mb-6">Votre réservation est maintenant payée. Vous allez être redirigé vers vos réservations.</p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}