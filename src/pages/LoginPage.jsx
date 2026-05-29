import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API_URL from '../config'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        login(data.user, data.token)
        navigate('/')
      } else {
        setError(data.error || 'Erreur de connexion')
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
        <h2 className="text-2xl font-bold text-center">Connexion</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input type="email" placeholder="Email" required value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary" />
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" required value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-lg py-3 pl-4 pr-12 outline-none focus:border-primary" />
          <button type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-70">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <p className="text-sm text-center text-muted-foreground">
          Pas encore de compte ? <Link to="/signup" className="text-primary hover:underline">S'inscrire</Link>
        </p>
      </form>
    </div>
  )
}