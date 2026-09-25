import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import * as haptics from '../utils/haptics'
import {
  ChevronRight, Eye, EyeOff, Bell, Lock, Info, Trash2,
  Ban, User, Shield, FileText, Loader2, X
} from 'lucide-react'

function triggerHaptic() {
  try {
    const fn = haptics.light || haptics.tap || haptics.impact || haptics.haptic || haptics.default
    if (typeof fn === 'function') fn()
  } catch {}
}

const APP_VERSION = '1.0.0'

function Sheet({ children, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose()
        }}
        className="bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1 rounded-full bg-muted-foreground/40 mx-auto mb-4" />
        {children}
      </motion.div>
    </div>
  )
}

function Toggle({ on, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative w-12 h-7 rounded-full transition shrink-0 ${
        on ? 'bg-primary' : 'bg-white/10'
      } ${disabled ? 'opacity-50' : ''}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}

function SectionCard({ children }) {
  return (
    <div className="bg-card/50 backdrop-blur-md border border-border/40 rounded-2xl p-5 md:p-6">
      {children}
    </div>
  )
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="text-base md:text-lg font-bold flex items-center gap-2 mb-4">
      <Icon size={18} className="text-primary" />
      {children}
    </h3>
  )
}

function PasswordSheet({ onClose }) {
  const { addToast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      addToast('Veuillez remplir tous les champs.', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        addToast('Mot de passe modifié !', 'success')
        onClose()
      } else {
        addToast(data.error || 'Erreur', 'error')
      }
    } catch {
      addToast('Impossible de contacter le serveur.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet onClose={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition press"
        aria-label="Fermer"
      >
        <X size={20} />
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
          <Lock size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Changer le mot de passe</h3>
          <p className="text-xs text-muted-foreground">Choisissez un mot de passe fort.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
          <input
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-lg py-3 pl-4 pr-12 outline-none focus:border-primary transition"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition"
            aria-label={showCurrent ? 'Masquer' : 'Afficher'}
          >
            {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
          <input
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-lg py-3 pl-4 pr-12 outline-none focus:border-primary transition"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition"
            aria-label={showNew ? 'Masquer' : 'Afficher'}
          >
            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:bg-primary/90 transition disabled:opacity-50 press flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Modification...' : 'Modifier le mot de passe'}
        </button>
      </form>
    </Sheet>
  )
}

function DeleteSheet({ onClose, onDeleted }) {
  const { addToast } = useToast()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setError('')
    if (!password) {
      setError('Mot de passe requis.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/user/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password })
      })
      if (res.ok) {
        addToast('Compte supprimé.', 'success')
        onDeleted()
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur')
      }
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet onClose={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition press"
        aria-label="Fermer"
      >
        <X size={20} />
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-red-500/15 flex items-center justify-center">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Supprimer mon compte</h3>
          <p className="text-xs text-muted-foreground">Cette action est irréversible.</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Toutes vos publications, réservations, messages et avis seront <strong className="text-foreground">définitivement</strong> supprimés.
      </p>

      <div className="space-y-3">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Entrez votre mot de passe pour confirmer"
          className="w-full bg-white/5 border border-red-400/40 rounded-lg py-3 px-4 outline-none focus:border-red-400 transition"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-border text-muted-foreground py-2.5 rounded-full font-semibold hover:border-foreground transition press"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-500 text-white py-2.5 rounded-full font-semibold hover:bg-red-600 transition disabled:opacity-50 press flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Suppression...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

export default function SettingsPage() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [privacy, setPrivacy] = useState({
    hideEmail: user?.privacy?.hideEmail || false,
    hideName: user?.privacy?.hideName || false
  })
  const [privacySaving, setPrivacySaving] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState([])
  const [notifPush, setNotifPush] = useState(true)
  const [notifEmail, setNotifEmail] = useState(true)
  const [sheet, setSheet] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetch(`${API_URL}/api/blocks`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setBlockedUsers(Array.isArray(data) ? data : []))
      .catch(() => setBlockedUsers([]))
  }, [user, navigate])

  const togglePrivacy = async (key) => {
    triggerHaptic()
    const newValue = !privacy[key]
    const previous = privacy
    const newPrivacy = { ...privacy, [key]: newValue }
    setPrivacy(newPrivacy)
    setPrivacySaving(true)
    try {
      const res = await fetch(`${API_URL}/api/user/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newPrivacy)
      })
      if (res.ok) {
        const data = await res.json()
        login({ ...user, privacy: data.privacy }, localStorage.getItem('token'))
        addToast('Préférence enregistrée.', 'success')
      } else {
        setPrivacy(previous)
        addToast('Erreur', 'error')
      }
    } catch {
      setPrivacy(previous)
      addToast('Erreur', 'error')
    } finally {
      setPrivacySaving(false)
    }
  }

  const handleUnblock = async (blockId) => {
    triggerHaptic()
    if (!confirm('Débloquer cet utilisateur ?')) return
    try {
      await fetch(`${API_URL}/api/blocks/${blockId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setBlockedUsers(prev => prev.filter(b => b._id !== blockId))
      addToast('Utilisateur débloqué.', 'success')
    } catch {
      addToast('Erreur', 'error')
    }
  }

  const handleDeleted = () => {
    logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 pb-32 md:pb-8"></div>
        <main className="max-w-2xl mx-auto px-4 py-6 md:py-12 space-y-5">
          <div>
            <h2 className="text-3xl font-extrabold mb-1">Paramètres</h2>
            <p className="text-sm text-muted-foreground">Gérez votre compte et vos préférences.</p>
          </div>

          <Link
            to="/account"
            className="block bg-card/50 backdrop-blur-md border border-border/40 rounded-2xl p-5 press no-select hover:border-primary/40 transition"
          >
            <div className="flex items-center gap-4">
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="w-14 h-14 rounded-full object-cover border border-border" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <User size={22} className="text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground shrink-0" />
            </div>
          </Link>

          <SectionCard>
            <SectionTitle icon={Eye}>Confidentialité</SectionTitle>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Masquer mon nom</p>
                  <p className="text-xs text-muted-foreground">Votre nom n'apparaîtra plus publiquement.</p>
                </div>
                <Toggle on={privacy.hideName} onClick={() => togglePrivacy('hideName')} disabled={privacySaving} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Masquer mon email</p>
                  <p className="text-xs text-muted-foreground">Votre email ne sera jamais partagé.</p>
                </div>
                <Toggle on={privacy.hideEmail} onClick={() => togglePrivacy('hideEmail')} disabled={privacySaving} />
              </div>
            </div>

            {blockedUsers.length > 0 && (
              <div className="mt-5 pt-5 border-t border-border/40">
                <p className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Ban size={14} className="text-primary" />
                  Utilisateurs bloqués ({blockedUsers.length})
                </p>
                <div className="space-y-3">
                  {blockedUsers.map(b => (
                    <div key={b._id} className="flex items-center gap-3">
                      {b.blockedPhoto ? (
                        <img src={b.blockedPhoto} alt={b.blockedName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User size={16} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{b.blockedName}</p>
                        <p className="text-xs text-muted-foreground">
                          Bloqué le {new Date(b.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnblock(b._id)}
                        className="text-xs border border-primary text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition press shrink-0"
                      >
                        Débloquer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard>
            <SectionTitle icon={Bell}>Notifications</SectionTitle>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">Notifications push</p>
                    <span className="text-[10px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full">Bientôt</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Alertes en temps réel sur votre téléphone.</p>
                </div>
                <Toggle on={notifPush} onClick={() => { triggerHaptic(); setNotifPush(!notifPush) }} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Notifications email</p>
                  <p className="text-xs text-muted-foreground">Résumés et rappels par email.</p>
                </div>
                <Toggle on={notifEmail} onClick={() => { triggerHaptic(); setNotifEmail(!notifEmail) }} />
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle icon={Shield}>Sécurité</SectionTitle>
            <button
              onClick={() => { triggerHaptic(); setSheet('password') }}
              className="w-full flex items-center justify-between gap-3 py-2 press no-select"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Lock size={16} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Changer mon mot de passe</p>
                  <p className="text-xs text-muted-foreground">Dernière modification inconnue</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </SectionCard>

          <SectionCard>
            <SectionTitle icon={Info}>À propos</SectionTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <Info size={16} className="text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">Version de l'app</p>
                </div>
                <span className="text-sm text-muted-foreground">{APP_VERSION}</span>
              </div>
              <Link
                to="/cgu"
                className="w-full flex items-center justify-between gap-3 py-2 press no-select"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <FileText size={16} className="text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">Conditions Générales d'Utilisation</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </Link>
              <Link
                to="/privacy"
                className="w-full flex items-center justify-between gap-3 py-2 press no-select"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <Shield size={16} className="text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">Politique de confidentialité</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </Link>
            </div>
          </SectionCard>

          <div className="bg-red-500/5 border border-red-400/30 rounded-2xl p-5 md:p-6">
            <h3 className="text-base md:text-lg font-bold flex items-center gap-2 mb-2 text-red-400">
              <Trash2 size={18} /> Zone dangereuse
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              La suppression de votre compte est <strong className="text-foreground">définitive</strong> et efface toutes vos données.
            </p>
            <button
              onClick={() => { triggerHaptic(); setSheet('delete') }}
              className="border border-red-400 text-red-400 px-5 py-2.5 rounded-full font-semibold hover:bg-red-400 hover:text-white transition text-sm press"
            >
              Supprimer mon compte
            </button>
          </div>
        </main>

        <AnimatePresence>
          {sheet === 'password' && <PasswordSheet onClose={() => setSheet(null)} />}
          {sheet === 'delete' && (
            <DeleteSheet onClose={() => setSheet(null)} onDeleted={handleDeleted} />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}