import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import { Calendar, Clock, MapPin, Check, X, Send, PartyPopper, Coffee, Smile, ArrowLeft } from 'lucide-react'

export default function NegotiationPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [neg, setNeg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadNegotiation = () => {
    fetch(`${API_URL}/api/negotiations/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setNeg(data)
        setLoading(false)
      })
      .catch(() => {
        addToast('Impossible de charger la négociation.', 'error')
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadNegotiation()
  }, [id, user, navigate])

  useEffect(() => {
    if (!neg) return
    const interval = setInterval(loadNegotiation, 5000)
    return () => clearInterval(interval)
  }, [neg])

  const handlePropose = async (e) => {
    e.preventDefault()
    if (!date || !timeSlot || !location.trim()) {
      addToast('Remplis tous les champs 😊', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/api/negotiations/${id}/propose`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ date, timeSlot, location })
      })
      if (res.ok) {
        const data = await res.json()
        setNeg(data)
        setDate('')
        setTimeSlot('')
        setLocation('')
        addToast('Proposition envoyée 🎉', 'success')
      } else {
        const err = await res.json()
        addToast(err.error || 'Erreur', 'error')
      }
    } catch {
      addToast('Impossible de contacter le serveur', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAccept = async () => {
    if (!confirm('Tu confirmes ce rendez-vous ?')) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/api/negotiations/${id}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        addToast('Accord trouvé ! Direction le paiement 💳', 'success')
        setTimeout(() => navigate('/my-bookings'), 1000)
      } else {
        const err = await res.json()
        addToast(err.error || 'Erreur', 'error')
      }
    } catch {
      addToast('Impossible de contacter le serveur', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRefuse = async () => {
    if (!confirm('Tu veux vraiment annuler cette négociation ?')) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/api/negotiations/${id}/refuse`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        addToast('Négociation annulée', 'success')
        setTimeout(() => navigate('/my-bookings'), 1000)
      }
    } catch {
      addToast('Impossible de contacter le serveur', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  if (loading) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Chargement…</div>
  if (!neg) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Négociation introuvable</div>

  const otherName = neg.initiatorId === user.id ? neg.recipientName : neg.initiatorName
  const isMyTurn = !neg.currentProposal || neg.currentProposal.proposedById !== user.id
  const waitingForOther = neg.currentProposal && neg.currentProposal.proposedById === user.id
  const finished = neg.status !== 'pending'

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 pb-32 md:pb-8"></div>
        <main className="max-w-2xl mx-auto px-4 py-6 md:py-10">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          <div className="text-center mb-8">
            <div className="text-5xl mb-4">
              {finished ? (neg.status === 'accepted' ? '🎉' : '😕') : '🤝'}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
              {finished
                ? neg.status === 'accepted' ? 'Accord trouvé !' : 'Négociation terminée'
                : 'On cale un rendez-vous ?'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {finished
                ? neg.status === 'accepted'
                  ? 'Vous allez pouvoir passer au paiement.'
                  : 'Aucun accord n\'a été trouvé.'
                : `Avec ${otherName} — pour « ${neg.serviceTitle} »`}
            </p>
          </div>

          <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-5 md:p-6 mb-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Prix convenu</p>
              <span className="text-primary font-bold text-2xl">{neg.price} €</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Une commission de 10 % sera ajoutée au moment du paiement.
            </p>
          </div>

          {neg.currentProposal && (
            <div className={`rounded-3xl p-5 md:p-6 mb-5 border-2 ${
              waitingForOther
                ? 'bg-primary/5 border-primary/30'
                : 'bg-green-500/5 border-green-500/30'
            }`}>
              <p className="text-sm font-medium mb-4 flex items-center gap-2">
                {waitingForOther ? (
                  <>
                    <Coffee size={16} className="text-primary" />
                    En attente de {otherName}…
                  </>
                ) : (
                  <>
                    <Smile size={16} className="text-green-400" />
                    {neg.currentProposal.proposedByName} propose :
                  </>
                )}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(neg.currentProposal.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Créneau</p>
                    <p className="font-medium">{neg.currentProposal.timeSlot}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Lieu</p>
                    <p className="font-medium break-words">{neg.currentProposal.location}</p>
                  </div>
                </div>
              </div>

              {!finished && !waitingForOther && (
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleAccept}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-full hover:bg-green-600 transition disabled:opacity-50"
                  >
                    <Check size={18} />
                    J'accepte
                  </button>
                  <button
                    onClick={() => {
                      setDate(neg.currentProposal.date)
                      setTimeSlot(neg.currentProposal.timeSlot)
                      setLocation(neg.currentProposal.location)
                      document.getElementById('propose-section')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 border border-primary text-primary font-semibold py-3 rounded-full hover:bg-primary/10 transition disabled:opacity-50"
                  >
                    <X size={18} />
                    Je préfère autre chose
                  </button>
                </div>
              )}
            </div>
          )}

          {neg.history.length > 0 && (
            <details className="bg-card/50 border border-border/40 rounded-2xl p-4 mb-5">
              <summary className="text-sm cursor-pointer text-muted-foreground">
                Voir l'historique ({neg.history.length})
              </summary>
              <div className="mt-3 space-y-2 text-xs">
                {neg.history.map((h, i) => (
                  <div key={i} className="border-l-2 border-border pl-3 py-1">
                    <p className="font-medium">{h.proposedByName}</p>
                    <p className="text-muted-foreground">
                      {formatDate(h.date)} · {h.timeSlot} · {h.location}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}

          {!finished && isMyTurn && (
            <div id="propose-section" className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-5 md:p-6">
              <h2 className="font-bold mb-1 flex items-center gap-2">
                <PartyPopper size={18} className="text-primary" />
                {neg.currentProposal ? 'À toi de proposer' : 'Ta proposition'}
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                {neg.currentProposal
                  ? 'Ajuste les champs et envoie ta contre-proposition.'
                  : 'Remplis les infos pour proposer un rendez-vous.'}
              </p>

              <form onSubmit={handlePropose} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">📅 Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-border rounded-xl py-3 px-4 outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">🕒 Créneau</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-white/5 border border-border rounded-xl py-3 px-4 outline-none focus:border-primary transition"
                  >
                    <option value="">Choisir un créneau</option>
                    <option value="Matin (8h-12h)">Matin (8h-12h)</option>
                    <option value="Midi (12h-14h)">Midi (12h-14h)</option>
                    <option value="Après-midi (14h-18h)">Après-midi (14h-18h)</option>
                    <option value="Soir (18h-20h)">Soir (18h-20h)</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">📍 Lieu</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex : Chez moi, 12 rue de la Paix, Bruxelles"
                    className="w-full bg-white/5 border border-border rounded-xl py-3 px-4 outline-none focus:border-primary transition"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Écris ce que tu veux : adresse, en visio, devant la gare…
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <Send size={18} />
                  {submitting ? 'Envoi…' : 'Envoyer ma proposition'}
                </button>
              </form>
            </div>
          )}

          {!finished && (
            <button
              onClick={handleRefuse}
              disabled={submitting}
              className="w-full text-sm text-muted-foreground hover:text-red-400 transition mt-6 disabled:opacity-50"
            >
              Annuler la négociation
            </button>
          )}

        </main>
      </div>
    </PageTransition>
  )
}