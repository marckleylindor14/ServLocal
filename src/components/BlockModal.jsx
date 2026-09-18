import { useState } from 'react'
import { X, Ban } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import API_URL from '../config'

export default function BlockModal({ userId, userName, onClose, onBlocked }) {
  const { addToast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const handleBlock = async () => {
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-red-500/15 flex items-center justify-center">
            <Ban size={20} className="text-red-400" />
          </div>
          <div>
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
            className="flex-1 border border-border text-muted-foreground py-3 rounded-full font-semibold hover:border-foreground transition"
          >
            Annuler
          </button>
          <button
            onClick={handleBlock}
            disabled={submitting}
            className="flex-1 bg-red-500 text-white py-3 rounded-full font-semibold hover:bg-red-600 transition disabled:opacity-50"
          >
            {submitting ? 'Blocage...' : 'Bloquer'}
          </button>
        </div>
      </div>
    </div>
  )
}