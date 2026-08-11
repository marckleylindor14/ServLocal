import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, CheckCircle, ArrowRight, ChevronRight } from 'lucide-react'

const slides = [
  {
    icon: Search,
    title: "Trouvez le service qu'il vous faut",
    description: "Des centaines de prestataires locaux à portée de main. Recherchez, comparez et choisissez en toute simplicité.",
    color: "text-blue-400",
    bg: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: UserPlus,
    title: "Proposez vos talents",
    description: "Vous avez un savoir-faire ? Créez votre annonce en quelques minutes et attirez de nouveaux clients.",
    color: "text-green-400",
    bg: "from-green-500/20 to-green-600/10",
  },
  {
    icon: CheckCircle,
    title: "Réservez en toute confiance",
    description: "Paiement sécurisé, profils vérifiés et avis transparents pour une expérience sereine.",
    color: "text-primary",
    bg: "from-primary/20 to-primary/10",
  },
]

export default function LandingPage() {
  const [step, setStep] = useState(0)

  const slide = slides[step]

  return (
    <div className={`min-h-screen bg-background text-foreground font-sans flex flex-col relative overflow-hidden ${step === 2 ? 'justify-start pt-24' : 'justify-center'}`}>
      {/* Fond décoratif */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} opacity-30 pointer-events-none`} />

      <div className="relative z-10 max-w-md mx-auto px-6 text-center flex flex-col items-center">
        {/* Icône animée */}
        <div className={`w-24 h-24 rounded-full bg-card flex items-center justify-center mb-8 shadow-2xl transition-transform duration-500 ${step === 0 ? 'scale-110' : 'scale-100'}`}>
          <slide.icon size={48} className={slide.color} />
        </div>

        {/* Texte */}
        <h2 className="text-3xl font-extrabold mb-4">{slide.title}</h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-10">{slide.description}</p>

        {/* Indicateurs de progression */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === step ? 'bg-primary scale-125' : 'bg-muted'}`}
            />
          ))}
        </div>

        {/* Bouton suivant ou action finale */}
        {step < slides.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-full text-lg hover:bg-primary/90 transition active:scale-95"
          >
            Suivant
            <ArrowRight size={20} />
          </button>
        ) : (
          <Link
            to="/signup"
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-10 py-4 rounded-full text-lg hover:bg-primary/90 transition active:scale-95 shadow-lg shadow-primary/30"
          >
            S'inscrire gratuitement
            <ChevronRight size={20} />
          </Link>
        )}

        {/* Lien connexion */}
        {step === slides.length - 1 && (
          <p className="mt-6 text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}