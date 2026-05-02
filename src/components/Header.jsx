import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">ServLocal</Link>
        <div className="flex gap-3 items-center">
          <Link to="/add-service" className="text-sm text-muted-foreground hover:text-foreground transition">
            Proposer un service
          </Link>
          {user && (
            <Link to="/my-services" className="text-sm text-muted-foreground hover:text-foreground transition">
              Mes services
            </Link>
          )}
          {user ? (
            <div className="flex gap-3 items-center">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <button
                onClick={handleLogout}
                className="border border-primary text-primary px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="border border-primary text-primary px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}