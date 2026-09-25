import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Home, PlusCircle, HelpCircle, ClipboardList, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'
import * as haptics from '../utils/haptics'

const NAV_ITEMS = [
  { to: '/', end: true, icon: Home, label: 'Accueil' },
  { to: '/add-service', icon: PlusCircle, label: 'Proposer' },
  { to: '/request-service', icon: HelpCircle, label: 'Demander' },
  { to: '/activity', icon: ClipboardList, label: 'Activité', badgeKey: 'toTreatCount' },
  { to: '/messages', icon: MessageSquare, label: 'Messages', badgeKey: 'unreadMessages' }
]

function triggerHaptic() {
  try {
    const fn = haptics.light || haptics.tap || haptics.impact || haptics.haptic || haptics.default
    if (typeof fn === 'function') fn()
  } catch {}
}

function Badge({ count }) {
  if (!count || count === 0) return null
  return (
    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border-2 border-background">
      {count > 9 ? '9+' : count}
    </span>
  )
}

export default function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()
  const [notif, setNotif] = useState({ toTreatCount: 0, unreadMessages: 0 })
  const [hidden, setHidden] = useState(false)
  const lastScrollRef = useRef(0)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const fetchNotif = () => {
      fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (cancelled) return
          setNotif({
            toTreatCount: data.toTreatCount || 0,
            unreadMessages: data.unreadMessages || 0
          })
        })
        .catch(() => {})
    }

    fetchNotif()
    const interval = setInterval(fetchNotif, 10000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const last = lastScrollRef.current
      if (y > last && y > 100) setHidden(true)
      else if (y < last - 5) setHidden(false)
      lastScrollRef.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (to, end) => {
    if (end) return location.pathname === to
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40 transition-transform duration-300 ${
        hidden ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch max-w-3xl mx-auto">
        {NAV_ITEMS.map(item => {
          const active = isActive(item.to, item.end)
          const Icon = item.icon
          const badgeCount = item.badgeKey ? notif[item.badgeKey] : 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={triggerHaptic}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 no-select transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                <Badge count={badgeCount} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && (
                <motion.span
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}