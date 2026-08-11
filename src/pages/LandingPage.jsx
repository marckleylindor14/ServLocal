import { Link } from 'react-router-dom'
import { Search, UserPlus } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center px-6 text-center page-enter">
      <div className="space-y-10 max-w-md">
        {/* Logo et nom */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center">
            <img src="/LOGO MYRA.png" alt="Myra" className="h-12 w-12 object-contain" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Myra
          </h1>
          <p className="text-muted-foreground text-lg">
            Tous les services du quotidien, <br />
            <span className="text-primary font-medium">à deux pas de chez vous.</span>
          </p>
        </div>

        {/* Description rapide */}
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-card/50 border border-border/50">
            <Search size={20} className="text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Recherchez</h3>
              <p className="text-xs text-muted-foreground">Trouvez un prestataire près de chez vous.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-card/50 border border-border/50">
            <UserPlus size={20} className="text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Proposez</h3>
              <p className="text-xs text-muted-foreground">Vendez vos services simplement.</p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3">
          <Link
            to="/signup"
            className="block w-full bg-primary text-primary-foreground font-semibold py-4 rounded-full text-lg hover:bg-primary/90 transition"
          >
            S'inscrire
          </Link>
          <Link
            to="/login"
            className="block w-full border border-primary text-primary font-semibold py-4 rounded-full text-lg hover:bg-primary hover:text-primary-foreground transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}