import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import { Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(data.message)
        addToast(data.message, 'success')
      } else {
        setError(data.error || 'Erreur')
        addToast(data.error || 'Erreur', 'error')
      }
    } catch {
      setError('Impossible de contacter le serveur.')
      addToast('Impossible de contacter le serveur.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md border border-border rounded-2xl p-8 w-full max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-center">Mot de passe oublié</h2>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}
          <p className="text-sm text-muted-foreground">
            Entrez votre adresse email, nous vous enverrons un lien de réinitialisation.
          </p>
          <input type="email" placeholder="Email" required value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary" />
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-70">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
          <p className="text-sm text-center text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Retour à la connexion</Link>
          </p>
        </form>
      </div>
    </PageTransition>
  )
}