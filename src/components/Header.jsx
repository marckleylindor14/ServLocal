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

  const isAdmin = user?.isAdmin

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-2.5 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <img src="/LOGO MYRA.png" alt="Myra" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight">Myra</span>
        </Link>

        <button className="md:hidden text-muted-foreground hover:text-foreground transition" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className="hidden md:flex gap-1 items-center">
          <Link to="/add-service" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition">
            <PlusCircle size={16} /> Proposer
          </Link>
          {user && (
            <>
              <Link to="/my-services" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition">
                <ListChecks size={16} /> Mes services
              </Link>
              <Link to="/my-bookings" className="relative flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition">
                <Calendar size={16} />
                <Badge count={notif.pendingBookings} />
                Réservations
              </Link>
              <Link to="/dashboard" className="relative flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition">
                <LayoutDashboard size={16} />
                <Badge count={notif.pendingBookings} />
                Dashboard
              </Link>
              <Link to="/messages" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition">
                <MessageSquare size={16} /> Messages
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1.5 text-sm font-medium bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 transition">
                  <Shield size={16} /> Admin
                </Link>
              )}
            </>
          )}
          {user ? (
            <div className="flex gap-3 items-center ml-2">
              <Link to="/account" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition">
                <User size={16} /> Mon compte
              </Link>
              <span className="text-sm text-muted-foreground font-medium">{user.name}</span>
              <button onClick={handleLogout} aria-label="Se déconnecter" className="flex items-center gap-1.5 border border-primary/60 text-primary text-sm px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition">
                <LogOut size={16} /> Déco
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm px-5 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/20">
              <LogIn size={16} /> Connexion
            </Link>
          )}
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-4 flex flex-col gap-3">
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
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium bg-primary/20 text-primary px-3 py-1.5 rounded-full">
                  <Shield size={18} /> Admin
                </Link>
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