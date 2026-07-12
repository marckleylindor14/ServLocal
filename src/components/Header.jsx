import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PlusCircle, ListChecks, LogOut, LogIn, Calendar, LayoutDashboard, MessageSquare, Shield, User, HelpCircle } from 'lucide-react'
import API_URL from '../config'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-6xl mx-auto px-5 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <img src="/LOGO MYRA.png" alt="Myra" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight">Myra</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/account" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
                  <User size={18} /> {user.name}
                </Link>
                <button onClick={handleLogout} aria-label="Se déconnecter" className="border border-primary/60 text-primary text-sm px-4 py-2 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition">
                  <LogOut size={16} className="md:mr-1" /> <span className="hidden md:inline">Déco</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-primary text-primary-foreground text-sm px-5 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                <LogIn size={16} className="md:mr-1" /> <span className="hidden md:inline">Connexion</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Barre de navigation inférieure (mobile uniquement) */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 md:hidden flex justify-around items-center py-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <Link to="/add-service" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition p-2">
            <PlusCircle size={22} />
            <span className="text-[10px] mt-0.5">Proposer</span>
          </Link>
          <Link to="/request-service" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition p-2">
            <HelpCircle size={22} />
            <span className="text-[10px] mt-0.5">Demander</span>
          </Link>
          <Link to="/my-services" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition p-2">
            <ListChecks size={22} />
            <span className="text-[10px] mt-0.5">Services</span>
          </Link>
          <Link to="/my-bookings" className="relative flex flex-col items-center text-muted-foreground hover:text-foreground transition p-2">
            <Calendar size={22} />
            <Badge count={notif.pendingBookings} />
            <span className="text-[10px] mt-0.5">Résas</span>
          </Link>
          <Link to="/dashboard" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition p-2">
            <LayoutDashboard size={22} />
            <span className="text-[10px] mt-0.5">Dashboard</span>
          </Link>
          <Link to="/messages" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition p-2">
            <MessageSquare size={22} />
            <span className="text-[10px] mt-0.5">Messages</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="flex flex-col items-center text-primary hover:text-primary/80 transition p-2">
              <Shield size={22} />
              <span className="text-[10px] mt-0.5">Admin</span>
            </Link>
          )}
        </nav>
      )}

      {/* Navigation desktop (liens classiques en haut) */}
      {user && (
        <nav className="hidden md:flex fixed top-14 left-0 right-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/30 justify-center gap-1 py-1.5">
          <Link to="/add-service" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition">
            <PlusCircle size={16} /> Proposer
          </Link>
          <Link to="/request-service" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-white/5 transition">
            <HelpCircle size={16} /> Demander
          </Link>
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
        </nav>
      )}
    </>
  )
}