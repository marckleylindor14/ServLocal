import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PlusCircle, ListChecks, LogOut, LogIn, Calendar, LayoutDashboard, MessageSquare } from 'lucide-react'

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
        <Link to="/" className="flex items-center gap-2">
          <img src="/LOGO MYRA.png" alt="Myra" className="h-10 w-auto" />
          <span className="text-2xl font-extrabold tracking-tight">Myra</span>
        </Link>
        <div className="flex gap-3 items-center">
          <Link to="/add-service" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
            <PlusCircle size={16} />
            Proposer un service
          </Link>
          {user && (
            <>
              <Link to="/my-services" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <ListChecks size={16} />
                Mes services
              </Link>
              <Link to="/my-bookings" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <Calendar size={16} />
                Mes réservations
              </Link>
              <Link to="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link to="/messages" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <MessageSquare size={16} />
                Messages
              </Link>
            </>
          )}
          {user ? (
            <div className="flex gap-3 items-center">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 border border-primary text-primary px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 border border-primary text-primary px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition"
            >
              <LogIn size={16} />
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}