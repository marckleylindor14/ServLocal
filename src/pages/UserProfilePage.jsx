import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import PageTransition from '../components/PageTransition'
import BlockModal from '../components/BlockModal'
import ReportModal from '../components/ReportModal'
import API_URL from '../config'
import {
  ArrowLeft, User, ShieldCheck, Calendar, Star, MapPin,
  HelpCircle, PlusCircle, Ban, Flag, MessageSquare, Sparkles
} from 'lucide-react'

export default function UserProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('offers')
  const [showBlock, setShowBlock] = useState(false)
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetch(`${API_URL}/api/users/${id}/public`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Profil inaccessible')
        return res.json()
      })
      .then(data => {
        setProfile(data)
        setLoading(false)
      })
      .catch(() => {
        addToast('Impossible de charger ce profil.', 'error')
        setLoading(false)
      })
  }, [id, user, navigate, addToast])

  const startConversation = async () => {
    if (!profile) return
    const firstService = profile.offers[0] || profile.demands[0]
    if (!firstService) {
      addToast('Cet utilisateur n\'a aucune publication active.', 'error')
      return
    }
    try {
      const res = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientId: profile.id,
          recipientName: profile.name,
          serviceId: firstService._id,
          serviceTitle: firstService.title
        })
      })
      const data = await res.json()
      if (data._id) navigate('/messages')
      else addToast(data.error || 'Impossible de démarrer la conversation.', 'error')
    } catch {
      addToast('Impossible de contacter le serveur.', 'error')
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background text-foreground font-sans">
          <Header />
          <div className="pt-20 pb-32 md:pb-8"></div>
          <div className="max-w-2xl mx-auto px-4 py-12 text-center text-muted-foreground">
            Chargement du profil…
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!profile) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background text-foreground font-sans">
          <Header />
          <div className="pt-20 pb-32 md:pb-8"></div>
          <EmptyState
            title="Profil introuvable"
            description="Cet utilisateur n'est pas accessible."
            actionLabel="Retour à l'accueil"
            onAction={() => navigate('/')}
          />
        </div>
      </PageTransition>
    )
  }

  const displayed = activeTab === 'offers' ? profile.offers : profile.demands
  const memberSince = new Date(profile.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 pb-32 md:pb-8"></div>
        <main className="max-w-2xl mx-auto px-4 py-6 md:py-8">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          <div className="card-hover p-6 mb-6">
            <div className="flex items-start gap-4">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User size={32} className="text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold truncate">{profile.name}</h1>
                  {profile.verified && (
                    <ShieldCheck size={18} className="text-green-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Calendar size={12} />
                  Membre depuis {memberSince}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                    {profile.offers.length} offre{profile.offers.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-400/15 text-blue-400 font-medium">
                    {profile.demands.length} demande{profile.demands.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {!profile.isSelf && (
              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border/40">
                <button
                  onClick={startConversation}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition"
                >
                  <MessageSquare size={16} />
                  Envoyer un message
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-2 border border-border text-muted-foreground px-4 py-2.5 rounded-full font-medium text-sm hover:border-primary hover:text-primary transition"
                >
                  <Flag size={14} />
                  Signaler
                </button>
                <button
                  onClick={() => setShowBlock(true)}
                  className="flex items-center gap-2 border border-red-400/60 text-red-400 px-4 py-2.5 rounded-full font-medium text-sm hover:bg-red-400 hover:text-white transition"
                >
                  <Ban size={14} />
                  Bloquer
                </button>
              </div>
            )}

            {profile.isSelf && (
              <div className="mt-5 pt-5 border-t border-border/40">
                <Link
                  to="/activity"
                  className="inline-flex items-center gap-2 bg-primary/15 text-primary px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/25 transition"
                >
                  <Sparkles size={16} />
                  Gérer mes publications
                </Link>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setActiveTab('offers')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'offers'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              <PlusCircle size={15} />
              Ses offres
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'offers' ? 'bg-white/20' : 'bg-white/10'}`}>
                {profile.offers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('demands')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'demands'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              <HelpCircle size={15} />
              Ses demandes
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'demands' ? 'bg-white/20' : 'bg-white/10'}`}>
                {profile.demands.length}
              </span>
            </button>
          </div>

          {displayed.length === 0 ? (
            <EmptyState
              title={activeTab === 'offers' ? 'Aucune offre' : 'Aucune demande'}
              description={
                activeTab === 'offers'
                  ? "Cet utilisateur n'a pas encore proposé de service."
                  : "Cet utilisateur n'a pas encore publié de demande."
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayed.map(service => (
                <Link
                  to={`/provider/${service._id}`}
                  key={service._id}
                  className="card-hover p-4 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={service.image || 'https://i.pravatar.cc/100?img=4'}
                      alt={service.title}
                      className="w-11 h-11 rounded-xl object-cover border border-border/60"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{service.title}</p>
                      <p className="text-xs text-muted-foreground">{service.category}</p>
                    </div>
                  </div>

                  {service.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full self-start mb-2">
                      <ShieldCheck size={10} /> Vérifié
                    </span>
                  )}

                  {service.type !== 'demand' && (
                    <div className="flex items-center gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className="fill-primary text-primary" />
                      ))}
                      <span className="ml-1 text-[11px] text-muted-foreground">5.0</span>
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0">
                      {service.city && (
                        <>
                          <MapPin size={11} />
                          <span className="truncate">{service.city}</span>
                        </>
                      )}
                    </div>
                    <span className="text-primary font-bold text-xs whitespace-nowrap">
                      {service.price ? `${service.price} €` : service.type === 'demand' ? 'Budget libre' : 'Gratuit'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        {showBlock && (
          <BlockModal
            userId={profile.id}
            userName={profile.name}
            onClose={() => setShowBlock(false)}
            onBlocked={() => navigate('/')}
          />
        )}

        {showReport && (
          <ReportModal
            targetType="user"
            targetId={profile.id}
            targetName={profile.name}
            onClose={() => setShowReport(false)}
          />
        )}
      </div>
    </PageTransition>
  )
}