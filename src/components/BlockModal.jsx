import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Ban } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import API_URL from '../config'
import * as haptics from '../utils/haptics'

function triggerHaptic() {
  try {
    const fn = haptics.light || haptics.tap || haptics.impact || haptics.haptic || haptics.default
    if (typeof fn === 'function') fn()
  } catch {}
}

export default function BlockModal({ userId, userName, onClose, onBlocked }) {
  const { addToast } = useToast()
  const [submitting, setSubmitting] = useState(false)

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

  const handleBlock = async () => {
    triggerHaptic()
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/api/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ blockedId: userId, blockedName: userName })
      })
      if (res.ok) {
        addToast(`${userName} a été bloqué.`, 'success')
        if (onBlocked) onBlocked()
        onClose()
      } else {
        const err = await res.json()
        addToast(err.error || 'Erreur', 'error')
      }
    } catch {
      addToast('Impossible de contacter le serveur.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Bloquer"
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

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition press"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-red-500/15 flex items-center justify-center">
            <Ban size={20} className="text-red-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold">Bloquer {userName} ?</h3>
            <p className="text-xs text-muted-foreground">Cette action est réversible.</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Vous ne pourrez plus échanger de messages, réserver ses services ou proposer un rendez-vous. Vous pouvez débloquer à tout moment depuis votre compte.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-border text-muted-foreground py-3 rounded-full font-semibold hover:border-foreground transition press"
          >
            Annuler
          </button>
          <button
            onClick={handleBlock}
            disabled={submitting}
            className="flex-1 bg-red-500 text-white py-3 rounded-full font-semibold hover:bg-red-600 transition disabled:opacity-50 press"
          >
            {submitting ? 'Blocage...' : 'Bloquer'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}