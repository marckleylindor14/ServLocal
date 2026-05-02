import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'

export default function MyServicesPage() {

  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [editing, setEditing] = useState(null) // ID du service en cours d'édition
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '' })

  // Redirection si non connecté
  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  // Charger les services de l'utilisateur
  useEffect(() => {
    if (!user) return
    fetch('http://localhost:3001/api/services')
      .then(res => res.json())
      .then(data => {
        const myServices = data.filter(s => s.providerName === user.name)
        setServices(myServices)
      })
      .catch(err => console.error('Erreur chargement services:', err))
  }, [user])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce service ?')) return
    await fetch(`http://localhost:3001/api/services/${id}`, { method: 'DELETE' })
    setServices(prev => prev.filter(s => s._id !== id))
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

  const cancelEditing = () => {
    setEditing(null)
  }

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description,
          price: form.price
        })
      })
      if (res.ok) {
        const updated = await res.json()
        setServices(prev => prev.map(s => (s._id === id ? updated : s)))
        setEditing(null)
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (err) {
      alert('Impossible de contacter le serveur')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header (similaire à HomePage) */}
      <Header />

      <div className="pt-20"></div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-extrabold mb-6">Mes services</h2>

        {services.length === 0 && (
          <p className="text-muted-foreground">Vous n'avez aucun service pour le moment.</p>
        )}

        <div className="space-y-4">
          {services.map(service => (
            <div key={service._id} className="bg-card backdrop-blur-md border border-border rounded-2xl p-4">
              {editing === service._id ? (
                // Formulaire d'édition inline
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Titre"
                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                  <select
                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="" disabled>Catégorie</option>
                    {["Maison", "Bien-être", "Cours", "Tech & Réparation", "Événements", "Animaux"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Description"
                    rows={3}
                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary resize-none"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Prix"
                    className="w-full bg-white/5 border border-border rounded-lg py-2 px-3 outline-none focus:border-primary"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(service._id)}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold hover:bg-primary/90 transition"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="border border-border text-muted-foreground px-4 py-2 rounded-full font-semibold hover:border-primary transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                // Affichage normal
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.category}</p>
                      <p className="text-sm mt-1">{service.price || 'Gratuit'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(service)}
                        className="text-sm border border-primary text-primary px-3 py-1 rounded-full hover:bg-primary hover:text-primary-foreground transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="text-sm border border-red-400 text-red-400 px-3 py-1 rounded-full hover:bg-red-400 hover:text-white transition"
                      >
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
      </main>
    </div>
  )
}