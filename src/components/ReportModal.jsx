import { useState } from 'react'
import { X, Flag } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import API_URL from '../config'

const REASONS = [
  'Contenu inapproprié',
  'Arnaque ou fraude',
  'Comportement irrespectueux',
  'Spam',
  'Autre'
]

export default function ReportModal({ targetType, targetId, targetName, onClose }) {
  const { addToast } = useToast()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) {
      addToast('Veuillez sélectionner un motif.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ targetType, targetId, targetName, reason, details })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur')
      }
      addToast('Signalement envoyé. Merci pour votre vigilance.', 'success')
      onClose()
    } catch (err) {
      addToast(err.message || 'Impossible d\'envoyer le signalement.', 'error')
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
            <Flag size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Signaler</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[240px]">{targetName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Motif du signalement *</label>
            <div className="space-y-1.5">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition border ${
                    reason === r
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 text-muted-foreground hover:border-border hover:bg-white/5'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Détails (optionnel)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Décrivez ce qui s'est passé..."
              className="w-full bg-white/5 border border-border rounded-xl py-3 px-4 text-sm outline-none focus:border-primary transition resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1 text-right">{details.length}/500</p>
          </div>

          <button
            type="submit"
            disabled={submitting || !reason}
            className="w-full bg-red-500 text-white font-semibold py-3 rounded-full hover:bg-red-600 transition disabled:opacity-40"
          >
            {submitting ? 'Envoi...' : 'Envoyer le signalement'}
          </button>
        </form>
      </div>
    </div>
  )
}