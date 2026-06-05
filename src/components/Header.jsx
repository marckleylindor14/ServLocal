import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PlusCircle, ListChecks, LogOut, LogIn, Calendar, LayoutDashboard, MessageSquare, Menu, X, Shield, User } from 'lucide-react'
import API_URL from '../config'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notif, setNotif] = useState({ pendingBookings: 0 })

  useEffect(() => {
    if (!user) return
    const fetchNotif = () => {
      fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setNotif(data))
        .catch(() => {})
    }
    fetchNotif()
    const interval = setInterval(fetchNotif, 10000)
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const Badge = ({ count }) => {
    if (!count || count === 0) return null
    return (
      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
        {count > 9 ? '9+' : count}
      </span>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/LOGO MYRA.png" alt="Myra" className="h-8 md:h-10 w-auto" />
          <span className="text-xl md:text-2xl font-extrabold tracking-tight">Myra</span>
        </Link>

        <button className="md:hidden text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className="hidden md:flex gap-3 items-center">
          <Link to="/add-service" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
            <PlusCircle size={16} /> Proposer
          </Link>
          {user && (
            <>
              <Link to="/my-services" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <ListChecks size={16} /> Mes services
              </Link>
              <Link to="/my-bookings" className="relative flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <Calendar size={16} />
                <Badge count={notif.pendingBookings} />
                Réservations
              </Link>
              <Link to="/dashboard" className="relative flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <LayoutDashboard size={16} />
                <Badge count={notif.pendingBookings} />
                Dashboard
              </Link>
              <Link to="/messages" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <MessageSquare size={16} /> Messages
              </Link>
              {user.isAdmin && (
                <Link to="/admin" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                  <Shield size={16} /> Admin
                </Link>
              )}
            </>
          )}
          {user ? (
            <div className="flex gap-3 items-center">
              <Link to="/account" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <User size={16} /> Mon compte
              </Link>
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <button onClick={handleLogout} aria-label="Se déconnecter" className="flex items-center gap-1 border border-primary text-primary px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition">
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 border border-primary text-primary px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition">
              <LogIn size={16} /> Connexion
            </Link>
          )}
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border px-4 py-4 flex flex-col gap-3">
          <Link to="/add-service" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground"><PlusCircle size={18} /> Proposer un service</Link>
          {user && (
            <>
              <Link to="/my-services" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground"><ListChecks size={18} /> Mes services</Link>
              <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className="relative flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={18} />
                <Badge count={notif.pendingBookings} />
                Mes réservations
              </Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="relative flex items-center gap-2 text-sm text-muted-foreground">
                <LayoutDashboard size={18} />
                <Badge count={notif.pendingBookings} />
                Dashboard
              </Link>
              <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground"><MessageSquare size={18} /> Messages</Link>
              {user.isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground"><Shield size={18} /> Admin</Link>
              )}
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground"><User size={18} /> Mon compte</Link>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <button onClick={handleLogout} className="text-primary text-sm font-semibold">Déconnexion</button>
              </div>
            </>
          )}
          {!user && (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="border border-primary text-primary px-4 py-2 rounded-full text-center text-sm font-semibold">Connexion</Link>
          )}
        </div>
      )}
    </header>
  )
}