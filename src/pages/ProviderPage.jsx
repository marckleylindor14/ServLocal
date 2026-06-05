import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StarRating from '../components/StarRating'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import { X, ImageOff } from 'lucide-react'

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
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')
  const [lightboxImage, setLightboxImage] = useState(null)

  // État pour le chargement progressif des images de la galerie
  const [loadedImages, setLoadedImages] = useState({})

  useEffect(() => {
    fetch(`${API_URL}/api/services/${id}`)
      .then(res => res.json())
      .then(data => setPro(data))
      .catch(() => setPro(null))

    fetch(`${API_URL}/api/services/${id}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(Array.isArray(data.reviews) ? data.reviews : [])
        setAverageRating(data.averageRating || 0)
      })
      .catch(() => {
        setReviews([])
        setAverageRating(0)
      })
  }, [id])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) return setErrorMessage('Vous devez être connecté.')
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
        setSuccessMessage('Avis publié !')
        setErrorMessage('')
        setNewRating(0)
        setComment('')
        setReviews(prev => [...prev, data.review])
        setAverageRating(data.averageRating)
      } else {
        setErrorMessage(data.error || 'Erreur')
        setSuccessMessage('')
      }
    } catch {
      setErrorMessage('Impossible de contacter le serveur.')
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    if (!user) return setBookingError('Vous devez être connecté.')
    try {
      const res = await fetch(`${API_URL}/api/services/${id}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ date: bookingDate, timeSlot: bookingTime, message: bookingMessage })
      })
      const data = await res.json()
      if (res.ok) {
        setBookingSuccess('Réservation effectuée !')
        setBookingError('')
        setBookingDate('')
        setBookingTime('')
        setBookingMessage('')
      } else {
        setBookingError(data.error || 'Erreur')
        setBookingSuccess('')
      }
    } catch {
      setBookingError('Impossible de contacter le serveur.')
    }
  }

  const startConversation = async () => {
    if (!user) { navigate('/login'); return }
    try {
      const res = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientId: pro._id,
          recipientName: pro.providerName,
          serviceId: pro._id,
          serviceTitle: pro.title
        })
      })
      const data = await res.json()
      if (data._id) navigate('/messages')
    } catch {
      alert('Impossible de démarrer la conversation.')
    }
  }

  const handlePay = () => {
    if (!user) { navigate('/login'); return }
    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!pro) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Chargement...</div>

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-16 md:pt-20"></div>
        <main className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
          {/* Infos service */}
          <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <img src={pro.image || 'https://i.pravatar.cc/100?img=4'} alt={pro.title} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-primary" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold">{pro.title}</h2>
                <p className="text-primary font-semibold text-sm md:text-base">{pro.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={averageRating} readonly />
                  <span className="text-xs md:text-sm text-muted-foreground">({averageRating})</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm md:text-base mb-4">{pro.description}</p>
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-semibold">Tarif</h3>
              <p className="text-primary font-medium">{pro.price || 'Non spécifié'}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={startConversation} className="flex-1 bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-full hover:bg-primary/90 transition text-sm md:text-base">
                Envoyer un message
              </button>
              <button onClick={handlePay} className="flex-1 bg-green-600 text-white font-semibold py-3 px-6 rounded-full hover:bg-green-700 transition text-sm md:text-base">
                Payer ce service
              </button>
            </div>
          </div>

          {/* Galerie portfolio avec chargement progressif */}
          {Array.isArray(pro.gallery) && pro.gallery.length > 0 && (
            <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold mb-4">Galerie d'exemples</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {pro.gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden h-32 md:h-40 bg-muted group cursor-pointer"
                    onClick={() => loadedImages[idx] && setLightboxImage(imgUrl)}
                  >
                    {/* Image réelle */}
                    <img
                      src={imgUrl}
                      alt={`Exemple ${idx + 1}`}
                      className={`w-full h-full object-cover transition group-hover:scale-105 ${loadedImages[idx] ? 'block' : 'hidden'}`}
                      onLoad={() => setLoadedImages(prev => ({ ...prev, [idx]: true }))}
                      onError={() => setLoadedImages(prev => ({ ...prev, [idx]: false }))}
                    />
                    {/* Placeholder pendant le chargement */}
                    {!loadedImages[idx] && loadedImages[idx] !== false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                        <ImageOff size={32} className="text-muted-foreground" />
                      </div>
                    )}
                    {/* Image non chargée (erreur) */}
                    {loadedImages[idx] === false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <ImageOff size={32} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Réservation */}
          <div id="booking-section" className="bg-card backdrop-blur-md border border-border rounded-2xl p-4 md:p-6">
            <h3 className="text-lg md:text-2xl font-bold mb-4">Réserver ce service</h3>
            {user ? (
              <form onSubmit={handleBookingSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground outline-none focus:border-primary transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Créneau</label>
                  <select required value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground outline-none focus:border-primary transition text-sm">
                    <option value="">Sélectionnez un créneau</option>
                    <option value="08:00-10:00">08:00 - 10:00</option>
                    <option value="10:00-12:00">10:00 - 12:00</option>
                    <option value="14:00-16:00">14:00 - 16:00</option>
                    <option value="16:00-18:00">16:00 - 18:00</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message (optionnel)</label>
                  <textarea rows={3} placeholder="Décrivez votre besoin..." value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground placeholder-muted-foreground outline-none focus:border-primary transition resize-none text-sm" />
                </div>
                {bookingError && <p className="text-red-400 text-xs">{bookingError}</p>}
                {bookingSuccess && <p className="text-green-400 text-xs">{bookingSuccess}</p>}
                <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:bg-primary/90 transition text-sm">Réserver</button>
              </form>
            ) : (
              <p className="text-xs text-muted-foreground"><Link to="/login" className="text-primary hover:underline">Connectez-vous</Link> pour réserver.</p>
            )}
          </div>

          {/* Avis */}
          <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-4 md:p-6">
            <h3 className="text-lg md:text-2xl font-bold mb-4">Avis</h3>
            {reviews.length === 0 && <p className="text-muted-foreground text-sm">Aucun avis pour le moment.</p>}
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-border py-3 last:border-0">
                <div className="flex items-center gap-2 mb-1"><StarRating rating={review.rating} readonly /><span className="text-xs font-medium">{review.userName}</span></div>
                {review.comment && <p className="text-muted-foreground text-xs mt-1">{review.comment}</p>}
              </div>
            ))}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="mt-4 pt-4 border-t border-border space-y-3">
                <h4 className="font-semibold text-sm">Laisser un avis</h4>
                <div><p className="text-xs mb-1">Votre note</p><StarRating rating={newRating} onRate={setNewRating} /></div>
                <textarea placeholder="Partagez votre expérience..." className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 text-foreground placeholder-muted-foreground outline-none focus:border-primary transition resize-none text-xs" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
                {errorMessage && <p className="text-red-400 text-xs">{errorMessage}</p>}
                {successMessage && <p className="text-green-400 text-xs">{successMessage}</p>}
                <button type="submit" className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-full hover:bg-primary/90 transition text-sm">Publier</button>
              </form>
            ) : (
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border"><Link to="/login" className="text-primary hover:underline">Connectez-vous</Link> pour laisser un avis.</p>
            )}
          </div>
        </main>

        {/* Lightbox */}
        {lightboxImage && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
            <button className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2" onClick={() => setLightboxImage(null)}><X size={24} /></button>
            <img src={lightboxImage} alt="Vue agrandie" className="max-w-full max-h-full rounded-xl" onClick={(e) => e.stopPropagation()} />
          </div>
        )}
      </div>
    </PageTransition>
  )
}