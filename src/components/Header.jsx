import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
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
      <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
        {count > 9 ? '9+' : count}
      </span>
    )
  }

  const isAdmin = user?.isAdmin

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 ${
      isActive
        ? 'bg-primary/15 text-primary'
        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
    }`

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/LOGO MYRA.png"
              alt="Myra"
              className="h-9 w-9 object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold tracking-tight">Myra</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/add-service" className={navItemClass}>
              <PlusCircle size={16} />
              Proposer
            </NavLink>
            <NavLink to="/request-service" className={navItemClass}>
              <HelpCircle size={16} />
              Demander
            </NavLink>
            {user && (
              <>
                <NavLink to="/my-services" className={navItemClass}>
                  <ListChecks size={16} />
                  Mes services
                </NavLink>
                <NavLink to="/my-bookings" className={({ isActive }) => `${navItemClass({ isActive })} relative`}>
                  <Calendar size={16} />
                  Réservations
                  <Badge count={notif.pendingBookings} />
                </NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => `${navItemClass({ isActive })} relative`}>
                  <LayoutDashboard size={16} />
                  Dashboard
                  <Badge count={notif.pendingBookings} />
                </NavLink>
                <NavLink to="/messages" className={navItemClass}>
                  <MessageSquare size={16} />
                  Messages
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={({ isActive }) =>
                    `flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary hover:bg-primary/25'
                    }`
                  }>
                    <Shield size={16} />
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/account"
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/5 transition"
                >
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <User size={14} className="text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground hidden sm:block">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  aria-label="Se déconnecter"
                  className="p-2.5 rounded-full border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/50 transition"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/20"
              >
                <LogIn size={16} />
                Connexion
              </Link>
            )}
          </div>
        </div>
      </header>

      {user && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/40 md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex justify-around items-center py-2">
            <NavLink to="/add-service" className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }>
              <PlusCircle size={20} />
              <span className="text-[10px] font-medium">Proposer</span>
            </NavLink>
            <NavLink to="/request-service" className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }>
              <HelpCircle size={20} />
              <span className="text-[10px] font-medium">Demander</span>
            </NavLink>
            <NavLink to="/my-bookings" className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }>
              <Calendar size={20} />
              <Badge count={notif.pendingBookings} />
              <span className="text-[10px] font-medium">Résas</span>
            </NavLink>
            <NavLink to="/messages" className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }>
              <MessageSquare size={20} />
              <span className="text-[10px] font-medium">Messages</span>
            </NavLink>
            <NavLink to="/account" className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }>
              <User size={20} />
              <span className="text-[10px] font-medium">Compte</span>
            </NavLink>
          </div>
        </nav>
      )}
    </>
  )
}