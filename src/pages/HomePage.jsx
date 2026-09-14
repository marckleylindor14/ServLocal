import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import SkeletonCard from '../components/SkeletonCard'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import {
  Home, Smile, BookOpen, Wrench, PartyPopper, Dog, ShieldCheck,
  Search, UserPlus, Star, MapPin, CheckCircle, ChevronDown, X, Navigation, HelpCircle, Sparkles, TrendingUp, Zap
} from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [allServices, setAllServices] = useState([])
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [detectingCity, setDetectingCity] = useState(false)
  const [geoMessage, setGeoMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const searchRef = useRef(null)

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        setAllServices(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        addToast('Impossible de charger les services.', 'error')
        setAllServices([])
        setLoading(false)
      })

    fetch(`${API_URL}/api/cities`)
      .then(res => res.json())
      .then(data => setCities(Array.isArray(data) ? data : []))
      .catch(() => {
        addToast('Impossible de charger les villes.', 'error')
        setCities([])
      })
  }, [addToast])

  useEffect(() => {
    if (!navigator.geolocation || cities.length === 0) return
    setDetectingCity(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            { headers: { 'User-Agent': 'MyraApp/1.0' } }
          )
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.village || ''
          if (city && cities.includes(city)) {
            setSelectedCity(city)
            setGeoMessage('')
          } else if (city) {
            setGeoMessage(`📍 Votre ville (${city}) n'a pas encore de services.`)
          }
        } catch (err) {
          console.error('Géolocalisation échouée', err)
        } finally {
          setDetectingCity(false)
        }
      },
      () => setDetectingCity(false),
      { timeout: 5000 }
    )
  }, [cities])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredServices = Array.isArray(allServices) ? allServices.filter(service => {
    const matchesCity = !selectedCity || service.city === selectedCity
    const matchesSearch = !searchTerm.trim() ||
      service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCity && matchesSearch && service.type !== 'demand'
  }) : []

  const suggestionServices = searchTerm.trim() === ''
    ? []
    : (Array.isArray(allServices) ? allServices.filter(service =>
        service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6) : [])

  const highlightMatch = (text) => {
    if (!searchTerm.trim()) return text
    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <span key={i} className="text-primary font-semibold">{part}</span>
        : part
    )
  }

  const categories = [
    { icon: Home, label: "Maison", color: "from-blue-400 to-blue-600" },
    { icon: Smile, label: "Bien-être", color: "from-pink-400 to-rose-600" },
    { icon: BookOpen, label: "Cours", color: "from-yellow-400 to-amber-600" },
    { icon: Wrench, label: "Tech & Réparation", color: "from-purple-400 to-violet-600" },
    { icon: PartyPopper, label: "Événements", color: "from-green-400 to-emerald-600" },
    { icon: Dog, label: "Animaux", color: "from-orange-400 to-red-600" },
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans scroll-smooth">
        <Header />

        <section className="relative pt-24 md:pt-32 pb-8 md:pb-16 px-4 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <Sparkles size={14} />
              Services locaux, en confiance
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Trouvez l'aide <br />
              <span className="bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">
                à deux pas de chez vous
              </span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto px-2 leading-relaxed">
              Des milliers de prestataires locaux, vérifiés et notés, prêts à vous aider.
            </p>

            <div ref={searchRef} className="relative max-w-2xl mx-auto">
              <div className="flex items-center glass rounded-3xl shadow-2xl overflow-hidden p-1.5">
                <span className="pl-4 text-muted-foreground">
                  <Search size={20} />
                </span>
                <input
                  type="text"
                  placeholder="Coiffeur, plombier, cours de piano…"
                  className="w-full py-3.5 px-3 bg-transparent text-foreground placeholder-muted-foreground outline-none text-base"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => { if (searchTerm.trim()) setShowSuggestions(true) }}
                />
                {searchTerm && (
                  <button onClick={() => { setSearchTerm(''); setShowSuggestions(false) }} className="p-2 text-muted-foreground hover:text-foreground transition">
                    <X size={18} />
                  </button>
                )}
                <button className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-2xl hover:bg-primary/90 transition text-sm shadow-lg shadow-primary/30">
                  Rechercher
                </button>
              </div>

              {showSuggestions && searchTerm.trim() && (
                <div className="absolute top-full left-0 right-0 mt-3 glass-strong rounded-2xl shadow-2xl overflow-hidden z-50">
                  {suggestionServices.length > 0 ? (
                    suggestionServices.map(service => (
                      <Link
                        key={service._id}
                        to={`/provider/${service._id}`}
                        onClick={() => { setShowSuggestions(false); setSearchTerm('') }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition border-b border-border/40 last:border-0"
                      >
                        <img src={service.image || 'https://i.pravatar.cc/100?img=4'} alt={service.title} className="w-10 h-10 rounded-full object-cover" />
                        <div className="text-left min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{highlightMatch(service.title)}</p>
                          <p className="text-xs text-muted-foreground">{service.category}</p>
                        </div>
                        <span className="text-xs text-primary font-medium whitespace-nowrap">{service.price || 'Gratuit'}</span>
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-4 text-sm text-muted-foreground text-center">Aucun service pour "{searchTerm}"</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center items-center">
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setGeoMessage('') }}
                  className="appearance-none glass rounded-full py-2.5 pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary/50 transition"
                >
                  <option value="">Toutes les villes</option>
                  {Array.isArray(cities) && cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <button
                onClick={() => {
                  setDetectingCity(true)
                  setGeoMessage('')
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      try {
                        const { latitude, longitude } = position.coords
                        const res = await fetch(
                          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
                          { headers: { 'User-Agent': 'MyraApp/1.0' } }
                        )
                        const data = await res.json()
                        const city = data.address?.city || data.address?.town || data.address?.village || ''
                        if (city && cities.includes(city)) {
                          setSelectedCity(city)
                          setGeoMessage('')
                        } else if (city) {
                          setGeoMessage(`📍 Votre ville (${city}) n'a pas encore de services.`)
                        } else {
                          setGeoMessage('Impossible de déterminer votre ville.')
                        }
                      } catch (err) {
                        setGeoMessage('Erreur de géolocalisation.')
                      } finally {
                        setDetectingCity(false)
                      }
                    },
                    () => {
                      setDetectingCity(false)
                      setGeoMessage('Géolocalisation refusée.')
                    },
                    { timeout: 5000 }
                  )
                }}
                disabled={detectingCity}
                className="flex items-center gap-1.5 text-sm font-medium glass rounded-full px-4 py-2.5 text-primary hover:bg-primary/10 transition disabled:opacity-50"
              >
                <Navigation size={14} className={detectingCity ? 'animate-pulse' : ''} />
                {detectingCity ? 'Localisation…' : 'Autour de moi'}
              </button>
            </div>
            {geoMessage && <p className="text-xs text-muted-foreground mt-3">{geoMessage}</p>}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.label}
                  onClick={() => { setSearchTerm(cat.label); setShowSuggestions(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="group relative overflow-hidden rounded-2xl p-4 text-center transition-all hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent border border-border/40 rounded-2xl group-hover:border-primary/30 transition" />
                  <div className="relative">
                    <div className={`w-11 h-11 mx-auto mb-2 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <p className="font-semibold text-xs text-foreground">{cat.label}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8 md:py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Zap size={12} />
              Simple et rapide
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Comment ça marche</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Quatre étapes pour trouver ou proposer un service.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[200px]">
            <div className="md:col-span-2 md:row-span-2 card-hover p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-6">
                  <Search size={28} className="text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Cherchez près de chez vous</h3>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  Filtrez par ville, catégorie ou mot-clé. Des centaines de prestataires locaux à portée de main.
                </p>
              </div>
              <div className="relative flex gap-2 mt-6">
                {['Coiffeur', 'Plombier', 'Cours', 'Ménage'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-border/40 text-xs text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="card-hover p-6 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-green-400/15 flex items-center justify-center">
                <UserPlus size={22} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Proposez</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Vendez vos talents en quelques clics.</p>
              </div>
            </div>

            <div className="card-hover p-6 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-400/15 flex items-center justify-center">
                <HelpCircle size={22} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Demandez</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Exprimez votre besoin, on vous répond.</p>
              </div>
            </div>

            <div className="md:col-span-3 card-hover p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/5 rounded-full blur-3xl" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shrink-0">
                <CheckCircle size={28} className="text-white" />
              </div>
              <div className="relative flex-1">
                <h3 className="text-xl md:text-2xl font-bold mb-2">Réservez en toute confiance</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Paiement sécurisé, profils vérifiés, avis transparents. Une expérience sereine du début à la fin.
                </p>
              </div>
              <div className="relative flex items-center gap-3 shrink-0">
                <ShieldCheck size={24} className="text-green-400" />
                <Star size={24} className="text-yellow-400" />
                <MapPin size={24} className="text-blue-400" />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8 md:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <TrendingUp size={12} />
                Populaires
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                {selectedCity ? `À ${selectedCity}` : 'Les services disponibles'}
              </h2>
              <div className="title-bar" />
            </div>
            {filteredServices.length > 3 && (
              <button
                onClick={() => navigate('/add-service')}
                className="hidden md:flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Voir tout
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredServices.length === 0 ? (
            <EmptyState
              title="Aucun service trouvé"
              description="Il n'y a pas encore de service ici. Soyez le premier à proposer vos talents !"
              actionLabel="Proposer un service"
              onAction={() => navigate('/add-service')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <Link
                  to={`/provider/${service._id}`}
                  key={service._id}
                  className="card-hover p-5 flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={service.image || 'https://i.pravatar.cc/100?img=4'}
                      alt={service.title}
                      className="w-14 h-14 rounded-2xl object-cover border border-border/60"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base truncate">{service.title}</p>
                      <p className="text-xs text-muted-foreground">{service.category}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {service.verified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                            <ShieldCheck size={10} /> Vérifié
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Non vérifié</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-primary text-primary" />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">5.0</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {service.city && (
                        <>
                          <MapPin size={12} />
                          <span className="truncate">{service.city}</span>
                        </>
                      )}
                    </div>
                    <span className="text-primary font-bold text-sm">
                      {service.price ? `${service.price} €` : 'Gratuit'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Pourquoi Myra ?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">La confiance au cœur de chaque échange.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="col-span-2 md:col-span-2 md:row-span-2 card-hover p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-400/10 rounded-full blur-3xl" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg mb-6">
                <ShieldCheck size={26} className="text-white" />
              </div>
              <div className="relative">
                <h3 className="text-2xl font-bold mb-3">Profils vérifiés</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Chaque prestataire qui le souhaite passe par un contrôle d'identité pour garantir votre sécurité.
                </p>
              </div>
            </div>

            <div className="card-hover p-5 flex flex-col justify-between">
              <div className="w-11 h-11 rounded-xl bg-blue-400/15 flex items-center justify-center">
                <MapPin size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold mb-1 text-sm">Ultra local</h3>
                <p className="text-xs text-muted-foreground">Dans votre quartier.</p>
              </div>
            </div>

            <div className="card-hover p-5 flex flex-col justify-between">
              <div className="w-11 h-11 rounded-xl bg-yellow-400/15 flex items-center justify-center">
                <Star size={20} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold mb-1 text-sm">Avis vérifiés</h3>
                <p className="text-xs text-muted-foreground">Transparence totale.</p>
              </div>
            </div>

            <div className="card-hover p-5 flex flex-col justify-between">
              <div className="w-11 h-11 rounded-xl bg-purple-400/15 flex items-center justify-center">
                <Zap size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold mb-1 text-sm">Rapide</h3>
                <p className="text-xs text-muted-foreground">En quelques clics.</p>
              </div>
            </div>

            <div className="card-hover p-5 flex flex-col justify-between">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-1 text-sm">Gratuit</h3>
                <p className="text-xs text-muted-foreground">Sans frais cachés.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          <div className="card-hover p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl -top-40" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à <span className="text-primary">vous lancer</span> ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Rejoignez Myra gratuitement et découvrez une nouvelle façon de rendre service.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/add-service"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/30"
                >
                  <UserPlus size={18} />
                  Proposer un service
                </Link>
                <Link
                  to="/request-service"
                  className="inline-flex items-center justify-center gap-2 glass text-foreground font-semibold px-8 py-4 rounded-full hover:bg-white/5 transition"
                >
                  <HelpCircle size={18} />
                  Demander un service
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-10 text-center text-muted-foreground border-t border-border/40 text-xs">
          <p className="font-semibold text-foreground mb-1">Myra</p>
          <p>La confiance au coin de votre rue</p>
        </footer>
      </div>
    </PageTransition>
  )
}