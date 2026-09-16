import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Home, PlusCircle, HelpCircle, ClipboardList, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'

export default function BottomNav() {
  const { user } = useAuth()
  const [notif, setNotif] = useState({ toTreatCount: 0, unreadMessages: 0 })

  useEffect(() => {
    if (!user) return
    const fetchNotif = () => {
      fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setNotif({
          toTreatCount: data.toTreatCount || 0,
          unreadMessages: data.unreadMessages || 0
        }))
        .catch(() => {})
    }
    fetchNotif()
    const interval = setInterval(fetchNotif, 10000)
    return () => clearInterval(interval)
  }, [user])

  const Badge = ({ count }) => {
    if (!count || count === 0) return null
    return (
      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center border-2 border-background">
        {count > 9 ? '9+' : count}
      </span>
    )
  }

  const itemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${
      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
    }`

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch max-w-3xl mx-auto">
        <NavLink to="/" end className={itemClass}>
          <Home size={22} />
          <span className="text-[10px] font-medium">Accueil</span>
        </NavLink>

        <NavLink to="/add-service" className={itemClass}>
          <PlusCircle size={22} />
          <span className="text-[10px] font-medium">Proposer</span>
        </NavLink>

        <NavLink to="/request-service" className={itemClass}>
          <HelpCircle size={22} />
          <span className="text-[10px] font-medium">Demander</span>
        </NavLink>

        <NavLink to="/activity" className={itemClass}>
          <div className="relative">
            <ClipboardList size={22} />
            <Badge count={notif.toTreatCount} />
          </div>
          <span className="text-[10px] font-medium">Activité</span>
        </NavLink>

        <NavLink to="/messages" className={itemClass}>
          <div className="relative">
            <MessageSquare size={22} />
            <Badge count={notif.unreadMessages} />
          </div>
          <span className="text-[10px] font-medium">Messages</span>
        </NavLink>
      </div>
    </nav>
  )
}