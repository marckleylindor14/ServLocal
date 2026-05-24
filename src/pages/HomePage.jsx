import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import API_URL from '../config'
import {
  Home, Smile, BookOpen, Wrench, PartyPopper, Dog, ShieldCheck,
  Search, UserPlus, Star, MapPin, CheckCircle, ChevronDown, X
} from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const [allServices, setAllServices] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => setAllServices(data))
      .catch(err => console.error('Erreur chargement services:', err))
  }, [])

  // Fermer les suggestions quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredServices = searchTerm.trim() === ''
    ? []
    : allServices.filter(service =>
        service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6) // max 6 suggestions

  // Mise en surbrillance du texte recherché dans les suggestions
  const highlightMatch = (text) => {
    if (!searchTerm.trim()) return text
    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} className="text-primary font-semibold">{part}</span>
        : part
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans scroll-smooth page-enter">
      <Header />

      {/* HERO */}
      <section className="relative pt-20 md:pt-28 pb-12 md:pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 md:mb-6 leading-tight">
            Tous les services du quotidien, <br />
            <span className="text-primary">à deux pas de chez vous</span>
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground mb-6 md:mb-10 max-w-xl mx-auto px-2">
            Myra vous connecte avec des prestataires locaux de confiance. Coiffure, bricolage, jardinage… trouvez l&apos;aide qu&apos;il vous faut en quelques clics.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a href="#search-section" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full hover:bg-primary/90 transition text-sm md:text-base">
              <Search size={18} />
              Trouver un service
              <ChevronDown size={16} className="ml-1 animate-bounce hidden sm:block" />
            </a>
            {!user ? (
              <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-primary text-primary font-semibold px-6 py-3 rounded-full hover:bg-primary hover:text-primary-foreground transition text-sm md:text-base">
                <UserPlus size={18} />
                Devenir prestataire
              </Link>
            ) : (
              <Link to="/add-service" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-primary text-primary font-semibold px-6 py-3 rounded-full hover:bg-primary hover:text-primary-foreground transition text-sm md:text-base">
                <UserPlus size={18} />
                Proposer un service
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-10 md:py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Comment ça marche ?</h2>
          <p className="text-sm md:text-base text-muted-foreground">Trois étapes simples pour trouver le prestataire idéal.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {[
            { icon: Search, title: "Recherchez", desc: "Dites-nous de quel service vous avez besoin, près de chez vous." },
            { icon: UserPlus, title: "Comparez", desc: "Consultez les profils vérifiés, les avis et les tarifs." },
            { icon: CheckCircle, title: "Réservez", desc: "Prenez contact et planifiez votre prestation en toute sécurité." },
          ].map((step, i) => {
            const IconComponent = step.icon
            return (
              <div key={i} className="text-center bg-card backdrop-blur-md border border-border rounded-2xl p-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconComponent size={24} className="text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* POURQUOI MYRA */}
      <section className="py-10 md:py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Pourquoi choisir Myra ?</h2>
          <p className="text-sm md:text-base text-muted-foreground">La plateforme locale qui place la confiance au cœur de chaque échange.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {[
            { icon: ShieldCheck, title: "Profils vérifiés", desc: "Tous nos prestataires passent par un contrôle d'identité." },
            { icon: MapPin, title: "Ultra local", desc: "Des services disponibles dans votre quartier, en quelques minutes." },
            { icon: Star, title: "Avis clients", desc: "Des notes et commentaires transparents pour vous aider à choisir." },
          ].map((item, i) => {
            const IconComponent = item.icon
            return (
              <div key={i} className="bg-card backdrop-blur-md border border-border rounded-2xl p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <IconComponent size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* RECHERCHE AVEC SUGGESTIONS */}
      <div id="search-section" className="pt-4 md:pt-8">
        <section className="max-w-4xl mx-auto px-4 py-8 md:py-12 text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4">
            Quel service cherchez-vous ?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
            Tous les services, en confiance, à deux pas
          </p>
          <div ref={searchRef} className="relative max-w-xl mx-auto">
            <div className="flex items-center bg-card backdrop-blur-md border border-border rounded-full shadow-lg shadow-primary/20 overflow-hidden">
              <span className="pl-4 md:pl-5 text-muted-foreground">🔍</span>
              <input
                type="text"
                placeholder="Ex : coiffeur, réparation vélo..."
                className="w-full py-3 md:py-4 px-3 md:px-4 bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => {
                  if (searchTerm.trim()) setShowSuggestions(true)
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setShowSuggestions(false) }}
                  className="pr-3 text-muted-foreground hover:text-foreground transition"
                >
                  <X size={18} />
                </button>
              )}
              <button className="hidden sm:block bg-primary text-primary-foreground font-semibold px-5 py-2 m-1 rounded-full hover:bg-primary/90 transition text-sm">
                Rechercher
              </button>
            </div>

            {/* Panneau de suggestions */}
            {showSuggestions && searchTerm.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
                {filteredServices.length > 0 ? (
                  filteredServices.map(service => (
                    <Link
                      key={service._id}
                      to={`/provider/${service._id}`}
                      onClick={() => { setShowSuggestions(false); setSearchTerm('') }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition border-b border-border last:border-0"
                    >
                      <img
                        src={service.image || 'https://i.pravatar.cc/100?img=4'}
                        alt={service.title}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-medium truncate">{highlightMatch(service.title)}</p>
                        <p className="text-xs text-muted-foreground">{service.category}</p>
                      </div>
                      <span className="ml-auto text-xs text-primary font-medium whitespace-nowrap">{service.price || 'Gratuit'}</span>
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-muted-foreground text-center">
                    Aucun service trouvé pour "{searchTerm}"
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Catégories */}
        <section className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
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
                  onClick={() => { setSearchTerm(cat.label); setShowSuggestions(true) }}
                  className="bg-card backdrop-blur-sm rounded-2xl p-3 md:p-4 text-center hover:scale-105 transition cursor-pointer border border-border"
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <p className="font-semibold text-xs md:text-sm">{cat.label}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Services disponibles */}
        <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-bold">Les services disponibles</h3>
            <div className="h-1 w-16 bg-primary mt-2 rounded-full"></div>
          </div>

          {allServices.length === 0 && (
            <p className="text-muted-foreground text-sm md:text-base">Aucun service pour le moment.</p>
          )}

          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {allServices.map((service) => (
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
                    <p className="font-bold text-sm md:text-base">{service.title}</p>
                    <span className="flex items-center text-xs text-primary">
                      <ShieldCheck size={14} className="mr-1" /> {service.verified ? 'Vérifié' : 'Non vérifié'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-primary text-sm">⭐</span>
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

      <footer className="py-8 text-center text-muted-foreground border-t border-border text-sm">
        Myra — La confiance au coin de votre rue
      </footer>
    </div>
  )
}