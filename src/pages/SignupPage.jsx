import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_URL from '../config'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (res.ok) {
        navigate('/login')
      } else {
        setError(data.error || 'Erreur inscription')
      }
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center page-enter">
      <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md border border-border rounded-2xl p-8 w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Inscription</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input type="text" placeholder="Nom" required value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary" />
        <input type="email" placeholder="Email" required value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary" />
        <input type="password" placeholder="Mot de passe" required value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary" />
        <button type="submit" disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-70">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Inscription...' : 'Créer mon compte'}
        </button>
        <p className="text-sm text-center text-muted-foreground">
          Déjà un compte ? <Link to="/login" className="text-primary hover:underline">Se connecter</Link>
        </p>
      </form>
    </div>
  )
}