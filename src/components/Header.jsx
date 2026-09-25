import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { User, LogOut, Shield, Settings } from 'lucide-react'
import * as haptics from '../utils/haptics'

function triggerHaptic() {
  try {
    const fn = haptics.light || haptics.tap || haptics.impact || haptics.haptic || haptics.default
    if (typeof fn === 'function') fn()
  } catch {}
}

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    window.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    triggerHaptic()
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isAdmin = user?.isAdmin

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? 'bg-card/95 backdrop-blur-2xl border-border/60'
          : 'bg-card/60 backdrop-blur-xl border-border/20'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5 group press">
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
              onClick={() => { triggerHaptic(); setMenuOpen(!menuOpen) }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-white/5 transition press no-select"
              aria-label="Menu du compte"
              aria-expanded={menuOpen}
            >
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
              )}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden origin-top-right"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition press no-select"
                  >
                    <Settings size={16} className="text-muted-foreground" />
                    Mon compte
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition press no-select"
                    >
                      <Shield size={16} />
                      Administration
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-sm w-full text-left text-red-400 hover:bg-red-500/10 transition border-t border-border press no-select"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/20 press"
          >
            Connexion
          </Link>
        )}
      </div>
    </header>
  )
}