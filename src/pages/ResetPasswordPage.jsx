import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import API_URL from '../config'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!token) { setError('Token manquant.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Mot de passe modifié ! Redirection...')
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setError(data.error || 'Erreur')
      }
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center page-enter">
      <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md border border-border rounded-2xl p-8 w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Nouveau mot de passe</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} placeholder="Nouveau mot de passe" required value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-lg py-3 pl-4 pr-12 outline-none focus:border-primary" />
          <button type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit" disabled={loading || !token}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-70">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Modification...' : 'Modifier le mot de passe'}
        </button>
      </form>
    </div>
  )
}