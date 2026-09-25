import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import SkeletonCard from '../components/SkeletonCard'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import {
  Sparkles, Clock, CheckCircle, XCircle, Euro, User,
  Handshake, Calendar, MapPin, Pencil,
  Trash2, HelpCircle, PlusCircle, Eye, TrendingUp, Star, Award
} from 'lucide-react'

export default function ActivityPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [data, setData] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('totreat')
  const [publicationFilter, setPublicationFilter] = useState('offers')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '' })

  const load = async () => {
    try {
      const res = await fetch(`${API_URL}/api/activity`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const d = await res.json()
      setData(d)
      setLoading(false)
    } catch {
      addToast('Impossible de charger votre activité.', 'error')
      setLoading(false)
    }
  }

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/provider/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const d = await res.json()
      setStats(d)
    } catch {
      addToast('Impossible de charger vos revenus.', 'error')
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    load()
  }, [user, navigate])

  useEffect(() => {
    if (activeTab === 'revenue' && !stats) {
      loadStats()
    }
  }, [activeTab])

  useEffect(() => {
    if (!user) return
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [user])

  const handleProposalStatus = async (proposalId, status) => {
    try {
      const res = await fetch(`${API_URL}/api/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        const result = await res.json()
        addToast(status === 'accepted' ? 'Proposition acceptée 🤝' : 'Proposition refusée', 'success')
        if (status === 'accepted' && result.negotiationId) {
          navigate(`/negotiation/${result.negotiationId}`)
        } else {
          load()
        }
      } else {
        const err = await res.json()
        addToast(err.error || 'Erreur', 'error')
      }
    } catch {
      addToast('Impossible de contacter le serveur', 'error')
    }
  }

  const handleBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        addToast(status === 'confirmed' ? 'Réservation acceptée' : 'Réservation refusée', 'success')
        load()
      } else {
        const err = await res.json()
        addToast(err.error || 'Erreur', 'error')
      }
    } catch {
      addToast('Impossible de contacter le serveur', 'error')
    }
  }

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
      const result = await res.json()
      if (result.url) {
        window.location.href = result.url
      } else {
        addToast(result.error || 'Impossible de créer la session de paiement.', 'error')
      }
    } catch {
      addToast('Erreur réseau.', 'error')
    }
  }

  const handleDeletePublication = async (id) => {
    if (!confirm('Supprimer définitivement ?')) return
    try {
      await fetch(`${API_URL}/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      addToast('Publication supprimée', 'success')
      load()
    } catch {
      addToast('Erreur', 'error')
    }
  }

  const startEditing = (service) => {
    setEditing(service._id)
    setForm({
      title: service.title,
      category: service.category,
      description: service.description,
      price: service.price
    })
  }

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        addToast('Modifié', 'success')
        setEditing(null)
        load()
      } else {
        addToast('Erreur lors de la mise à jour', 'error')
      }
    } catch {
      addToast('Erreur', 'error')
    }
  }

  if (!user) return null

  if (loading || !data) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background text-foreground font-sans">
          <Header />
          <div className="pt-20 pb-32 md:pb-8"></div>
          <main className="max-w-4xl mx-auto px-4 py-6">
            <SkeletonCard />
            <div className="h-4"></div>
            <SkeletonCard />
          </main>
        </div>
      </PageTransition>
    )
  }

  const tabs = [
    { id: 'totreat', label: 'À traiter', emoji: '⚡', count: data.counts.toTreat },
    { id: 'inprogress', label: 'En cours', emoji: '🔄', count: data.counts.inProgress },
    { id: 'publications', label: 'Mes publications', emoji: '📝', count: data.counts.publications },
    { id: 'revenue', label: 'Revenus', emoji: '💰', count: 0 },
    { id: 'history', label: 'Historique', emoji: '📚', count: data.counts.history }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 pb-32 md:pb-8"></div>
        <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Mon activité</h1>
            <p className="text-sm text-muted-foreground">
              {data.counts.toTreat > 0
                ? `Vous avez ${data.counts.toTreat} action${data.counts.toTreat > 1 ? 's' : ''} en attente`
                : 'Tout est à jour ✓'}
            </p>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'glass text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                    activeTab === tab.id ? 'bg-white/25' : 'bg-primary/20 text-primary'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'totreat' && (
            <ToTreatTab
              data={data.toTreat}
              counts={data.counts}
              onProposalStatus={handleProposalStatus}
              onBookingStatus={handleBookingStatus}
              onPay={handlePay}
              onNavigate={navigate}
            />
          )}

          {activeTab === 'inprogress' && (
            <InProgressTab data={data.inProgress} onNavigate={navigate} />
          )}

          {activeTab === 'publications' && (
            <PublicationsTab
              data={data.publications}
              filter={publicationFilter}
              setFilter={setPublicationFilter}
              editing={editing}
              form={form}
              setForm={setForm}
              onStartEdit={startEditing}
              onCancelEdit={() => setEditing(null)}
              onUpdate={handleUpdate}
              onDelete={handleDeletePublication}
              onNavigate={navigate}
            />
          )}

          {activeTab === 'revenue' && (
            <RevenueTab stats={stats} loading={statsLoading} onRefresh={loadStats} />
          )}

          {activeTab === 'history' && (
            <HistoryTab data={data.history} />
          )}
        </main>
      </div>
    </PageTransition>
  )
}

function ToTreatTab({ data, counts, onProposalStatus, onBookingStatus, onPay, onNavigate }) {
  const isEmpty =
    data.proposals.length === 0 &&
    data.negotiations.length === 0 &&
    data.bookingsToAccept.length === 0 &&
    data.bookingsToPay.length === 0

  if (isEmpty) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="Tout est à jour ✨"
        description="Aucune action ne vous attend pour le moment."
      />
    )
  }

  return (
    <div className="space-y-6">
      {data.proposals.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Sparkles size={14} />
            Propositions à examiner
            <span className="text-[11px] bg-primary/20 px-2 py-0.5 rounded-full">{counts.proposalsToTreat}</span>
          </h2>
          <div className="space-y-3">
            {data.proposals.map(p => (
              <div key={p._id} className="card-hover p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{p.proposerName}</p>
                    <Link
                      to={`/provider/${p.serviceId}`}
                      className="text-xs text-muted-foreground hover:text-primary transition block truncate"
                    >
                      Pour : {p.serviceTitle}
                    </Link>
                  </div>
                  <span className="flex items-center gap-1 text-primary font-bold">
                    <Euro size={14} />
                    {p.price}
                  </span>
                </div>
                {p.message && (
                  <p className="text-xs text-muted-foreground bg-white/5 rounded-xl p-3 mb-3">
                    💬 {p.message}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => onProposalStatus(p._id, 'accepted')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/90 text-white px-3 py-2 rounded-full text-xs font-semibold hover:bg-green-500 transition"
                  >
                    <CheckCircle size={12} />
                    Accepter
                  </button>
                  <button
                    onClick={() => onProposalStatus(p._id, 'refused')}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-400 text-red-400 px-3 py-2 rounded-full text-xs font-semibold hover:bg-red-400 hover:text-white transition"
                  >
                    <XCircle size={12} />
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.negotiations.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Handshake size={14} />
            Négociations à valider
            <span className="text-[11px] bg-primary/20 px-2 py-0.5 rounded-full">{counts.negotiationsToTreat}</span>
          </h2>
          <div className="space-y-3">
            {data.negotiations.map(n => (
              <button
                key={n._id}
                onClick={() => onNavigate(`/negotiation/${n._id}`)}
                className="w-full card-hover p-4 text-left"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Handshake size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{n.serviceTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Proposé par {n.currentProposal?.proposedByName}
                    </p>
                  </div>
                  <span className="text-primary font-bold text-sm shrink-0">{n.price} €</span>
                </div>
                {n.currentProposal && (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {new Date(n.currentProposal.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {n.currentProposal.timeSlot}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin size={11} /> {n.currentProposal.location}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {data.bookingsToAccept.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Calendar size={14} />
            Réservations à accepter
            <span className="text-[11px] bg-primary/20 px-2 py-0.5 rounded-full">{counts.bookingsToAccept}</span>
          </h2>
          <div className="space-y-3">
            {data.bookingsToAccept.map(b => (
              <div key={b._id} className="card-hover p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-sm">{b.serviceTitle}</p>
                    <p className="text-xs text-muted-foreground">Réservé par {b.clientName}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-400">
                    En attente
                  </span>
                </div>
                {b.date && (
                  <p className="text-xs text-muted-foreground mb-3">
                    📅 {b.date} · 🕒 {b.timeSlot}
                  </p>
                )}
                {b.message && (
                  <p className="text-xs text-muted-foreground bg-white/5 rounded-xl p-2 mb-3">
                    💬 {b.message}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => onBookingStatus(b._id, 'confirmed')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/90 text-white px-3 py-2 rounded-full text-xs font-semibold hover:bg-green-500 transition"
                  >
                    <CheckCircle size={12} />
                    Accepter
                  </button>
                  <button
                    onClick={() => onBookingStatus(b._id, 'cancelled')}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-400 text-red-400 px-3 py-2 rounded-full text-xs font-semibold hover:bg-red-400 hover:text-white transition"
                  >
                    <XCircle size={12} />
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.bookingsToPay.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <Euro size={14} />
            Paiements à effectuer
            <span className="text-[11px] bg-primary/20 px-2 py-0.5 rounded-full">{counts.bookingsToPay}</span>
          </h2>
          <div className="space-y-3">
            {data.bookingsToPay.map(b => (
              <div key={b._id} className="card-hover p-4 border-yellow-400/30">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-sm">{b.serviceTitle}</p>
                    <p className="text-xs text-muted-foreground">Avec {b.providerName}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-400">
                    À payer
                  </span>
                </div>
                {b.date && (
                  <p className="text-xs text-muted-foreground mb-3">
                    📅 {b.date} · 🕒 {b.timeSlot}
                  </p>
                )}
                {b.location && (
                  <p className="text-xs text-muted-foreground mb-3">
                    📍 {b.location}
                  </p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <span className="text-primary font-bold">
                    {b.price ? `${b.price} €` : '—'}
                  </span>
                  <button
                    onClick={() => onPay(b.serviceId, b._id)}
                    className="bg-primary text-primary-foreground px-5 py-2 rounded-full font-semibold hover:bg-primary/90 transition text-xs"
                  >
                    Payer maintenant
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function InProgressTab({ data, onNavigate }) {
  const isEmpty =
    data.bookings.length === 0 &&
    data.negotiations.length === 0 &&
    data.proposals.length === 0

  if (isEmpty) {
    return (
      <EmptyState
        icon={Clock}
        title="Rien en cours"
        description="Vos activités en cours apparaîtront ici."
      />
    )
  }

  return (
    <div className="space-y-6">
      {data.negotiations.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Handshake size={14} />
            Négociations en attente
          </h2>
          <div className="space-y-3">
            {data.negotiations.map(n => (
              <button
                key={n._id}
                onClick={() => onNavigate(`/negotiation/${n._id}`)}
                className="w-full card-hover p-4 text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{n.serviceTitle}</p>
                  <p className="text-xs text-muted-foreground">En attente de réponse</p>
                </div>
                <span className="text-primary font-bold text-sm shrink-0">{n.price} €</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {data.proposals.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles size={14} />
            Propositions envoyées
          </h2>
          <div className="space-y-3">
            {data.proposals.map(p => (
              <div key={p._id} className="card-hover p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{p.serviceTitle}</p>
                    <p className="text-xs text-muted-foreground">À {p.demandOwnerName}</p>
                  </div>
                  <span className="flex items-center gap-1 text-primary font-bold text-sm shrink-0">
                    <Euro size={14} />
                    {p.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.bookings.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <CheckCircle size={14} />
            Réservations confirmées
          </h2>
          <div className="space-y-3">
            {data.bookings.map(b => (
              <div key={b._id} className="card-hover p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-sm">{b.serviceTitle}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-400/20 text-green-400">
                    Confirmé
                  </span>
                </div>
                {b.date && (
                  <p className="text-xs text-muted-foreground">
                    📅 {b.date} · 🕒 {b.timeSlot}
                  </p>
                )}
                {b.location && (
                  <p className="text-xs text-muted-foreground mt-1">📍 {b.location}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function PublicationsTab({ data, filter, setFilter, editing, form, setForm, onStartEdit, onCancelEdit, onUpdate, onDelete, onNavigate }) {
  const displayed = filter === 'offers' ? data.offers : data.demands

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('offers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            filter === 'offers'
              ? 'bg-primary text-primary-foreground'
              : 'glass text-muted-foreground hover:text-foreground'
          }`}
        >
          <PlusCircle size={14} />
          Mes offres
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${filter === 'offers' ? 'bg-white/20' : 'bg-white/10'}`}>
            {data.offers.length}
          </span>
        </button>
        <button
          onClick={() => setFilter('demands')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            filter === 'demands'
              ? 'bg-primary text-primary-foreground'
              : 'glass text-muted-foreground hover:text-foreground'
          }`}
        >
          <HelpCircle size={14} />
          Mes demandes
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${filter === 'demands' ? 'bg-white/20' : 'bg-white/10'}`}>
            {data.demands.length}
          </span>
        </button>
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          title={filter === 'offers' ? 'Aucune offre' : 'Aucune demande'}
          description={filter === 'offers' ? 'Créez votre premier service.' : 'Publiez votre premier besoin.'}
          actionLabel={filter === 'offers' ? 'Proposer' : 'Demander'}
          onAction={() => onNavigate(filter === 'offers' ? '/add-service' : '/request-service')}
        />
      ) : (
        <div className="space-y-3">
          {displayed.map(service => (
            <div key={service._id} className="card-hover p-4">
              {editing === service._id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Titre"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary"
                  />
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary"
                  >
                    <option value="" disabled>Catégorie</option>
                    {["Maison", "Bien-être", "Cours", "Tech & Réparation", "Événements", "Animaux"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <textarea
                    rows={3}
                    placeholder="Description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary resize-none"
                  />
                  <input
                    type="text"
                    placeholder="Prix"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdate(service._id)}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="border border-border text-muted-foreground px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm truncate">{service.title}</h3>
                        {service.type === 'demand' && (
                          <span className="text-[10px] font-semibold text-blue-400 bg-blue-400/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Demande
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{service.category}</p>
                      <p className="text-xs text-primary font-medium mt-1">
                        {service.price ? `${service.price} €` : service.type === 'demand' ? 'Budget libre' : 'Gratuit'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onStartEdit(service)}
                      className="flex items-center gap-1 text-xs border border-primary text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition"
                    >
                      <Pencil size={11} />
                      Modifier
                    </button>
                    {service.type === 'demand' && (
                      <button
                        onClick={() => onNavigate(`/provider/${service._id}`)}
                        className="flex items-center gap-1 text-xs border border-border text-foreground px-3 py-1.5 rounded-full hover:border-primary transition"
                      >
                        <Eye size={11} />
                        Voir les offres
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(service._id)}
                      className="flex items-center gap-1 text-xs border border-red-400 text-red-400 px-3 py-1.5 rounded-full hover:bg-red-400 hover:text-white transition"
                    >
                      <Trash2 size={11} />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RevenueTab({ stats, loading, onRefresh }) {
  if (loading || !stats || !stats.last6Months) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const totalEarnings = stats.totalEarnings ?? 0
  const currentMonthEarnings = stats.currentMonthEarnings ?? 0
  const lastMonthEarnings = stats.lastMonthEarnings ?? 0
  const months = stats.last6Months ?? []
  const maxEarnings = Math.max(...months.map(m => m.earnings), 1)
  const monthDelta = lastMonthEarnings > 0
    ? Math.round(((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
    : null

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card-hover p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div className="relative">
            <p className="text-xs text-muted-foreground mb-1">Revenus totaux</p>
            <p className="text-3xl font-extrabold text-primary">
              {totalEarnings.toFixed(2)} €
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats.completedBookings} prestation{stats.completedBookings > 1 ? 's' : ''} terminée{stats.completedBookings > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="card-hover p-5">
          <p className="text-xs text-muted-foreground mb-1">Ce mois-ci</p>
          <p className="text-3xl font-extrabold">
            {currentMonthEarnings.toFixed(2)} €
          </p>
          {monthDelta !== null && (
            <p className={`text-[11px] mt-1 flex items-center gap-1 ${monthDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <TrendingUp size={11} className={monthDelta < 0 ? 'rotate-180' : ''} />
              {monthDelta >= 0 ? '+' : ''}{monthDelta}% vs mois dernier
            </p>
          )}
        </div>
      </div>

      <div className="card-hover p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">6 derniers mois</h3>
          <button onClick={onRefresh} className="text-xs text-primary hover:underline">
            Rafraîchir
          </button>
        </div>
        <div className="flex items-end justify-between gap-2 h-40">
          {months.map(m => {
            const height = m.earnings > 0 ? Math.max((m.earnings / maxEarnings) * 100, 5) : 2
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      m.earnings > 0 ? 'bg-gradient-to-t from-primary/60 to-primary' : 'bg-white/5'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${m.earnings.toFixed(2)} €`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground capitalize">{m.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-hover p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-400/15 flex items-center justify-center">
              <CheckCircle size={18} className="text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">Taux d'acceptation</p>
          </div>
          <p className="text-2xl font-bold">{stats.acceptanceRate}%</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {stats.acceptedBookings} sur {stats.totalBookings} réservation{stats.totalBookings > 1 ? 's' : ''}
          </p>
        </div>

        <div className="card-hover p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/15 flex items-center justify-center">
              <Star size={18} className="text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">Note moyenne</p>
          </div>
          <p className="text-2xl font-bold">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {stats.totalReviews} avis
          </p>
        </div>

        <div className="card-hover p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-400/15 flex items-center justify-center">
              <Award size={18} className="text-purple-400" />
            </div>
            <p className="text-xs text-muted-foreground">Prestations</p>
          </div>
          <p className="text-2xl font-bold">{stats.completedBookings}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {stats.totalBookings} réservation{stats.totalBookings > 1 ? 's' : ''} reçue{stats.totalBookings > 1 ? 's' : ''}
          </p>
        </div>
      </div>

    </div>
  )
}

function HistoryTab({ data }) {
  const isEmpty =
    data.bookings.length === 0 &&
    data.negotiations.length === 0 &&
    data.proposals.length === 0

  if (isEmpty) {
    return (
      <EmptyState
        icon={Clock}
        title="Aucun historique"
        description="Vos activités passées apparaîtront ici."
      />
    )
  }

  return (
    <div className="space-y-6">
      {data.bookings.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Réservations terminées</h2>
          <div className="space-y-3">
            {data.bookings.map(b => (
              <div key={b._id} className="card-hover p-4 opacity-80">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{b.serviceTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    b.status === 'cancelled' ? 'bg-red-400/20 text-red-400' : 'bg-green-400/20 text-green-400'
                  }`}>
                    {b.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.negotiations.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Négociations terminées</h2>
          <div className="space-y-3">
            {data.negotiations.map(n => (
              <div key={n._id} className="card-hover p-4 opacity-80 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{n.serviceTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.status === 'accepted' ? 'Accord trouvé' : 'Refusée'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  n.status === 'accepted' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                }`}>
                  {n.status === 'accepted' ? 'Accord' : 'Refusée'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.proposals.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Propositions terminées</h2>
          <div className="space-y-3">
            {data.proposals.map(p => (
              <div key={p._id} className="card-hover p-4 opacity-80 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{p.serviceTitle}</p>
                  <p className="text-xs text-muted-foreground">{p.price} €</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  p.status === 'accepted' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                }`}>
                  {p.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}