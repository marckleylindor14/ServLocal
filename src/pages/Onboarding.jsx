import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, CheckCircle } from 'lucide-react'

const slides = [
  {
    icon: Search,
    title: "Trouvez le service qu'il vous faut",
    description: "Des centaines de prestataires près de chez vous.",
    color: "text-blue-400",
  },
  {
    icon: UserPlus,
    title: "Proposez vos talents",
    description: "Créez votre annonce en quelques minutes.",
    color: "text-green-400",
  },
  {
    icon: CheckCircle,
    title: "Réservez en toute confiance",
    description: "Paiement sécurisé et avis vérifiés.",
    color: "text-primary",
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  const handleFinish = () => {
    localStorage.setItem('onboardingDone', 'true')
    navigate('/')
  }

  const slide = slides[step]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 page-enter">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <slide.icon size={80} className={slide.color} />
        <h2 className="text-3xl font-bold text-center">{slide.title}</h2>
        <p className="text-muted-foreground text-center text-lg">{slide.description}</p>
      </div>

      <div className="w-full max-w-xs space-y-4 pb-12">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
        {step < slides.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold">
            Suivant
          </button>
        ) : (
          <button onClick={handleFinish} className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold">
            Commencer
          </button>
        )}
      </div>
    </div>
  )
}