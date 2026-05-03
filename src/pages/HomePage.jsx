import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import API_URL from '../config'

export default function HomePage() {
  const [allServices, setAllServices] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => setAllServices(data))
      .catch(err => console.error('Erreur chargement services:', err))
  }, [])

  const filteredServices = allServices.filter(service => {
    if (searchTerm.trim() === '') return true
    const term = searchTerm.toLowerCase()
    return (
      service.title?.toLowerCase().includes(term) ||
      service.category?.toLowerCase().includes(term) ||
      service.description?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <div className="pt-20"></div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          Quel service cherchez-vous ?
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Tous les services, en confiance, à deux pas
        </p>
        <div className="relative max-w-xl mx-auto">
          <div className="flex items-center bg-card backdrop-blur-md border border-border rounded-full shadow-lg shadow-primary/20 overflow-hidden">
            <span className="pl-5 text-muted-foreground">🔍</span>
            <input
              type="text"
              placeholder="Ex : coiffeur, réparation vélo, ménage..."
              className="w-full py-4 px-4 bg-transparent text-foreground placeholder-muted-foreground outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="hidden sm:block bg-primary text-primary-foreground font-semibold px-6 py-3 m-1 rounded-full hover:bg-primary/90 transition">
              Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { emoji: "🏠", label: "Maison", color: "from-blue-400 to-blue-500" },
            { emoji: "💆", label: "Bien-être", color: "from-pink-400 to-rose-500" },
            { emoji: "📚", label: "Cours", color: "from-yellow-400 to-amber-500" },
            { emoji: "🔧", label: "Tech & Réparation", color: "from-purple-400 to-violet-500" },
            { emoji: "🎉", label: "Événements", color: "from-green-400 to-emerald-500" },
            { emoji: "🐾", label: "Animaux", color: "from-orange-400 to-red-500" },
          ].map((cat) => (
            <div
              key={cat.label}
              className="bg-card backdrop-blur-sm rounded-2xl p-4 text-center hover:scale-105 transition cursor-pointer border border-border"
            >
              <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl`}>
                {cat.emoji}
              </div>
              <p className="font-semibold text-sm">{cat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prestataires dynamiques */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-6">
          <h3 className="text-2xl font-bold">Les services disponibles</h3>
          <div className="h-1 w-16 bg-primary mt-2 rounded-full"></div>
        </div>

        {filteredServices.length === 0 && (
          <p className="text-muted-foreground">Aucun service trouvé.</p>
        )}

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
          {filteredServices.map((service) => (
            <Link
              to={`/provider/${service._id}`}
              key={service._id}
              className="min-w-[260px] bg-card backdrop-blur-md border border-border rounded-2xl p-4 snap-start hover:scale-[1.02] transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={service.image || 'https://i.pravatar.cc/100?img=4'}
                  alt={service.title}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold">{service.title}</p>
                  <span className="flex items-center text-xs text-primary">
                    <span className="mr-1">🛡️</span> {service.verified ? 'Vérifié' : 'Non vérifié'}
                  </span>
                </div>
              </div>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary">⭐</span>
                ))}
                <span className="ml-2 text-muted-foreground text-sm">5.0</span>
              </div>
              <p className="text-muted-foreground text-sm">{service.category}</p>
              <p className="text-sm mt-1">{service.price || 'Gratuit'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground border-t border-border">
        ServLocal — La confiance au coin de votre rue
      </footer>
    </div>
  )
}