import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import { PlusCircle, HelpCircle } from 'lucide-react'

export default function MyServicesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [services, setServices] = useState([])
  const [activeTab, setActiveTab] = useState('offers')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '' })

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  useEffect(() => {
    if (!user) return
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        const myServices = data.filter(s => s.providerName === user.name)
        setServices(myServices)
      })
      .catch(() => addToast('Erreur chargement services', 'error'))
  }, [user, addToast])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return
    await fetch(`${API_URL}/api/services/${id}`, { method: 'DELETE' })
    setServices(prev => prev.filter(s => s._id !== id))
    addToast('Supprimé', 'success')
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

  const cancelEditing = () => setEditing(null)

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        const updated = await res.json()
        setServices(prev => prev.map(s => (s._id === id ? updated : s)))
        setEditing(null)
        addToast('Modifié', 'success')
      } else {
        addToast('Erreur lors de la mise à jour', 'error')
      }
    } catch {
      addToast('Impossible de contacter le serveur', 'error')
    }
  }

  if (!user) return null

  const offers = services.filter(s => s.type !== 'demand')
  const demands = services.filter(s => s.type === 'demand')
  const displayed = activeTab === 'offers' ? offers : demands

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 pb-32 md:pb-8"></div>
        <main className="max-w-4xl mx-auto px-4 py-6 md:py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold">Mes publications</h2>
            <Link
              to={activeTab === 'offers' ? '/add-service' : '/request-service'}
              className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary/90 transition"
            >
              <PlusCircle size={16} />
              {activeTab === 'offers' ? 'Proposer' : 'Demander'}
            </Link>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setActiveTab('offers')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'offers'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              <PlusCircle size={16} />
              Mes offres
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'offers' ? 'bg-white/20' : 'bg-white/10'}`}>
                {offers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('demands')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'demands'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              <HelpCircle size={16} />
              Mes demandes
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === 'demands' ? 'bg-white/20' : 'bg-white/10'}`}>
                {demands.length}
              </span>
            </button>
          </div>

          {displayed.length === 0 ? (
            <EmptyState
              title={activeTab === 'offers' ? 'Aucune offre' : 'Aucune demande'}
              description={
                activeTab === 'offers'
                  ? "Vous n'avez pas encore proposé de service."
                  : "Vous n'avez pas encore publié de demande."
              }
              actionLabel={activeTab === 'offers' ? 'Proposer un service' : 'Demander un service'}
              onAction={() => navigate(activeTab === 'offers' ? '/add-service' : '/request-service')}
            />
          ) : (
            <div className="space-y-4">
              {displayed.map(service => (
                <div key={service._id} className="card-hover p-4">
                  {editing === service._id ? (
                    <div className="space-y-3">
                      <input type="text" placeholder="Titre" className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary"
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                      <select className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary"
                        value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        <option value="" disabled>Catégorie</option>
                        {["Maison", "Bien-être", "Cours", "Tech & Réparation", "Événements", "Animaux"].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <textarea rows={3} placeholder="Description" className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary resize-none"
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                      <input type="text" placeholder="Prix" className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary"
                        value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(service._id)} className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold hover:bg-primary/90 transition">
                          Enregistrer
                        </button>
                        <button onClick={cancelEditing} className="border border-border text-muted-foreground px-4 py-2 rounded-full font-semibold hover:border-primary transition">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg md:text-xl font-bold truncate">{service.title}</h3>
                            {service.type === 'demand' && (
                              <span className="text-[10px] font-semibold text-blue-400 bg-blue-400/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                                Demande
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{service.category}</p>
                          <p className="text-sm mt-1">
                            {service.price ? `${service.price} €` : service.type === 'demand' ? 'Budget libre' : 'Gratuit'}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          {service.type === 'demand' && (
                            <Link
                              to="/my-demands"
                              className="text-sm border border-primary text-primary px-3 py-1 rounded-full hover:bg-primary hover:text-primary-foreground transition text-center"
                            >
                              Voir les offres
                            </Link>
                          )}
                          <button onClick={() => startEditing(service)} className="text-sm border border-primary text-primary px-3 py-1 rounded-full hover:bg-primary hover:text-primary-foreground transition">
                            Modifier
                          </button>
                          <button onClick={() => handleDelete(service._id)} className="text-sm border border-red-400 text-red-400 px-3 py-1 rounded-full hover:bg-red-400 hover:text-white transition">
                            Supprimer
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
                    </div>
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