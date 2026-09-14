import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, LogOut, ListChecks, LayoutDashboard, Shield, Settings } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isAdmin = user?.isAdmin

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/40"
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

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/5 transition"
            >
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-border" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>

                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"
                >
                  <Settings size={16} className="text-muted-foreground" />
                  Mon compte
                </Link>

                <Link
                  to="/my-services"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"
                >
                  <ListChecks size={16} className="text-muted-foreground" />
                  Mes services
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition"
                >
                  <LayoutDashboard size={16} className="text-muted-foreground" />
                  Tableau de bord
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition"
                  >
                    <Shield size={16} />
                    Administration
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm w-full text-left text-red-400 hover:bg-red-500/10 transition border-t border-border"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/20"
          >
            Connexion
          </Link>
        )}
      </div>
    </header>
  )
}