import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import API_URL from '../config'
import {
  Home, Smile, BookOpen, Wrench, PartyPopper, Dog, ShieldCheck,
  Search, UserPlus, Star, MapPin, CheckCircle, ChevronDown
} from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
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
    <div className="min-h-screen bg-background text-foreground font-sans scroll-smooth">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Tous les services du quotidien, <br />
            <span className="text-primary">à deux pas de chez vous</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Myra vous connecte avec des prestataires locaux de confiance. Coiffure, bricolage, jardinage… trouvez l&apos;aide qu&apos;il vous faut en quelques clics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#search-section" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full hover:bg-primary/90 transition">
              <Search size={20} />
              Trouver un service
              <ChevronDown size={16} className="ml-1 animate-bounce" />
            </a>
            {!user ? (
              <Link to="/signup" className="inline-flex items-center gap-2 border border-primary text-primary font-semibold px-6 py-3 rounded-full hover:bg-primary hover:text-primary-foreground transition">
                <UserPlus size={20} />
                Devenir prestataire
              </Link>
            ) : (
              <Link to="/add-service" className="inline-flex items-center gap-2 border border-primary text-primary font-semibold px-6 py-3 rounded-full hover:bg-primary hover:text-primary-foreground transition">
                <UserPlus size={20} />
                Proposer un service
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ===== COMMENT ÇA MARCHE ===== */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Comment ça marche ?</h2>
          <p className="text-muted-foreground">Trois étapes simples pour trouver le prestataire idéal.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: "Recherchez", desc: "Dites-nous de quel service vous avez besoin, près de chez vous." },
            { icon: UserPlus, title: "Comparez", desc: "Consultez les profils vérifiés, les avis et les tarifs." },
            { icon: CheckCircle, title: "Réservez", desc: "Prenez contact et planifiez votre prestation en toute sécurité." },
          ].map((step, i) => {
            const IconComponent = step.icon
            return (
              <div key={i} className="text-center bg-card backdrop-blur-md border border-border rounded-2xl p-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconComponent size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== POURQUOI MYRA ===== */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Pourquoi choisir Myra ?</h2>
          <p className="text-muted-foreground">La plateforme locale qui place la confiance au cœur de chaque échange.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Profils vérifiés", desc: "Tous nos prestataires passent par un contrôle d'identité." },
            { icon: MapPin, title: "Ultra local", desc: "Des services disponibles dans votre quartier, en quelques minutes." },
            { icon: Star, title: "Avis clients", desc: "Des notes et commentaires transparents pour vous aider à choisir." },
          ].map((item, i) => {
            const IconComponent = item.icon
            return (
              <div key={i} className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <IconComponent size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== RECHERCHE & SERVICES (section existante) ===== */}
      <div id="search-section" className="pt-8">
        <section className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
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
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Home, label: "Maison", color: "from-blue-400 to-blue-500" },
              { icon: Smile, label: "Bien-être", color: "from-pink-400 to-rose-500" },
              { icon: BookOpen, label: "Cours", color: "from-yellow-400 to-amber-500" },
              { icon: Wrench, label: "Tech & Réparation", color: "from-purple-400 to-violet-500" },
              { icon: PartyPopper, label: "Événements", color: "from-green-400 to-emerald-500" },
              { icon: Dog, label: "Animaux", color: "from-orange-400 to-red-500" },
            ].map((cat) => {
              const Icon = cat.icon
              return (
                <div
                  key={cat.label}
                  className="bg-card backdrop-blur-sm rounded-2xl p-4 text-center hover:scale-105 transition cursor-pointer border border-border"
                >
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <p className="font-semibold text-sm">{cat.label}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Services disponibles */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-6">
            <h3 className="text-2xl font-bold">Les services disponibles</h3>
            <div className="h-1 w-16 bg-primary mt-2 rounded-full"></div>
          </div>

          {filteredServices.length === 0 && (
            <p className="text-muted-foreground">Aucun service pour le moment.</p>
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
                      <ShieldCheck size={14} className="mr-1" /> {service.verified ? 'Vérifié' : 'Non vérifié'}
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
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 text-center text-muted-foreground border-t border-border">
        Myra — La confiance au coin de votre rue
      </footer>
    </div>
  )
}