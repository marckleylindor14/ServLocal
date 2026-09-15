import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import { MessageSquare, CheckCircle, XCircle, Euro, User } from 'lucide-react'

export default function MyDemandsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetch(`${API_URL}/api/proposals/my-demands`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setProposals(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        addToast('Impossible de charger les propositions.', 'error')
        setLoading(false)
      })
  }, [user, navigate, addToast])

  const handleUpdateStatus = async (proposalId, status) => {
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
        setProposals(prev => prev.map(p => p._id === proposalId ? { ...p, status } : p))
        addToast(status === 'accepted' ? 'Proposition acceptée.' : 'Proposition refusée.', 'success')
      } else {
        addToast('Erreur lors de la mise à jour.', 'error')
      }
    } catch {
      addToast('Impossible de contacter le serveur.', 'error')
    }
  }

  const startConversation = async (proposal) => {
    try {
      const res = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientId: proposal.proposerId,
          recipientName: proposal.proposerName,
          serviceId: proposal.serviceId,
          serviceTitle: proposal.serviceTitle
        })
      })
      const data = await res.json()
      if (data._id) navigate('/messages')
    } catch {
      addToast('Impossible de démarrer la conversation.', 'error')
    }
  }

  if (!user) return null

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 pb-32 md:pb-8"></div>
        <main className="max-w-4xl mx-auto px-4 py-6 md:py-12">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-6">Propositions reçues</h2>

          {loading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : proposals.length === 0 ? (
            <EmptyState
              title="Aucune proposition"
              description="Vous n'avez pas encore reçu de propositions sur vos demandes."
              actionLabel="Voir mes demandes"
              onAction={() => navigate('/my-services')}
            />
          ) : (
            <div className="space-y-4">
              {proposals.map(proposal => (
                <div key={proposal._id} className="card-hover p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Pour la demande</p>
                      <Link to={`/provider/${proposal.serviceId}`} className="font-bold text-base hover:text-primary transition">
                        {proposal.serviceTitle}
                      </Link>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${
                      proposal.status === 'accepted' ? 'bg-green-400/20 text-green-400' :
                      proposal.status === 'refused' ? 'bg-red-400/20 text-red-400' :
                      'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {proposal.status === 'accepted' ? 'Acceptée' : proposal.status === 'refused' ? 'Refusée' : 'En attente'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{proposal.proposerName}</p>
                      <p className="text-xs text-muted-foreground">A proposé un prix</p>
                    </div>
                    <span className="ml-auto flex items-center gap-1 text-primary font-bold text-lg">
                      <Euro size={16} />
                      {proposal.price}
                    </span>
                  </div>

                  {proposal.message && (
                    <p className="text-sm text-muted-foreground bg-white/5 rounded-xl p-3 mb-4">
                      💬 {proposal.message}
                    </p>
                  )}

                  {proposal.status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateStatus(proposal._id, 'accepted')}
                        className="flex items-center gap-1.5 bg-green-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-500 transition"
                      >
                        <CheckCircle size={14} />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(proposal._id, 'refused')}
                        className="flex items-center gap-1.5 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-500 transition"
                      >
                        <XCircle size={14} />
                        Refuser
                      </button>
                      <button
                        onClick={() => startConversation(proposal)}
                        className="flex items-center gap-1.5 border border-primary text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition"
                      >
                        <MessageSquare size={14} />
                        Discuter
                      </button>
                    </div>
                  )}

                  {proposal.status === 'accepted' && (
                    <button
                      onClick={() => startConversation(proposal)}
                      className="flex items-center gap-1.5 border border-primary text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition"
                    >
                      <MessageSquare size={14} />
                      Contacter
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  )
}