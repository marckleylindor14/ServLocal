import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StarRating from '../components/StarRating'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'

export default function ProviderPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pro, setPro] = useState(null)
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [newRating, setNewRating] = useState(0)
  const [comment, setComment] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  // Champs réservation
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/services/${id}`)
      .then(res => res.json())
      .then(data => setPro(data))
      .catch(err => console.error('Erreur chargement prestataire:', err))

    fetch(`${API_URL}/api/services/${id}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
      })
      .catch(err => console.error('Erreur chargement avis:', err))
  }, [id])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    if (!user) {
      navigate('/login')
      return
    }
    if (newRating === 0) {
      setErrorMessage('Veuillez sélectionner une note.')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/services/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: newRating, comment })
      })
      const data = await res.json()
      if (res.ok) {
        setReviews(prev => [...prev, data.review])
        setAverageRating(data.averageRating)
        setNewRating(0)
        setComment('')
        setSuccessMessage('Merci pour votre avis !')
      } else {
        setErrorMessage(data.error || 'Erreur lors de l\'envoi.')
      }
    } catch (error) {
      setErrorMessage('Impossible de contacter le serveur.')
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setBookingError('')
    setBookingSuccess('')
    if (!user) {
      navigate('/login')
      return
    }
    if (!bookingDate || !bookingTime) {
      setBookingError('Veuillez choisir une date et un créneau.')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/services/${id}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date: bookingDate,
          timeSlot: bookingTime,
          message: bookingMessage
        })
      })
      const data = await res.json()
      if (res.ok) {
        setBookingSuccess('Réservation effectuée avec succès !')
        setBookingDate('')
        setBookingTime('')
        setBookingMessage('')
      } else {
        setBookingError(data.error || 'Erreur lors de la réservation.')
      }
    } catch (error) {
      setBookingError('Impossible de contacter le serveur.')
    }
  }

  if (!pro) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        Chargement...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <div className="pt-20"></div>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={pro.image || 'https://i.pravatar.cc/100?img=4'}
              alt={pro.title}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <h2 className="text-2xl font-bold">{pro.title}</h2>
              <p className="text-primary font-semibold">{pro.category}</p>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={averageRating} readonly />
                <span className="text-sm text-muted-foreground">
                  ({averageRating})
                </span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">{pro.description}</p>
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Tarif</h3>
            <p className="text-primary font-medium">{pro.price || 'Non spécifié'}</p>
          </div>
          <button className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-full hover:bg-primary/90 transition">
            Contacter le prestataire
          </button>
        </div>

        {/* Réservation */}
        <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-4">Réserver ce service</h3>
          {user ? (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Créneau horaire</label>
                <select
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground outline-none focus:border-primary transition"
                >
                  <option value="">Sélectionnez un créneau</option>
                  <option value="08:00-10:00">08:00 - 10:00</option>
                  <option value="10:00-12:00">10:00 - 12:00</option>
                  <option value="14:00-16:00">14:00 - 16:00</option>
                  <option value="16:00-18:00">16:00 - 18:00</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message (optionnel)</label>
                <textarea
                  rows={3}
                  placeholder="Décrivez votre besoin..."
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground placeholder-muted-foreground outline-none focus:border-primary transition resize-none"
                />
              </div>
              {bookingError && <p className="text-red-400 text-sm">{bookingError}</p>}
              {bookingSuccess && <p className="text-green-400 text-sm">{bookingSuccess}</p>}
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-full hover:bg-primary/90 transition"
              >
                Réserver
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">Connectez-vous</Link> pour réserver ce service.
            </p>
          )}
        </div>

        {/* Avis */}
        <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-4">Avis</h3>
          {reviews.length === 0 && (
            <p className="text-muted-foreground mb-6">Aucun avis pour le moment. Soyez le premier !</p>
          )}
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-border py-4 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={review.rating} readonly />
                <span className="text-sm font-medium">{review.userName}</span>
              </div>
              {review.comment && (
                <p className="text-muted-foreground text-sm mt-1">{review.comment}</p>
              )}
            </div>
          ))}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="mt-6 pt-6 border-t border-border space-y-4">
              <h4 className="font-semibold">Laisser un avis</h4>
              <div>
                <p className="text-sm mb-1">Votre note</p>
                <StarRating rating={newRating} onRate={setNewRating} />
              </div>
              <textarea
                placeholder="Partagez votre expérience (optionnel)..."
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground placeholder-muted-foreground outline-none focus:border-primary transition resize-none"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
              {successMessage && <p className="text-green-400 text-sm">{successMessage}</p>}
              <button
                type="submit"
                className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-full hover:bg-primary/90 transition"
              >
                Publier l'avis
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground mt-6 pt-6 border-t border-border">
              <Link to="/login" className="text-primary hover:underline">Connectez-vous</Link> pour laisser un avis.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}