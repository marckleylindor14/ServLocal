import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_URL from '../config'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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
    } catch (err) {
      setError('Impossible de contacter le serveur')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center">
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
        <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:bg-primary/90">
          Créer mon compte
        </button>
        <p className="text-sm text-center text-muted-foreground">
          Déjà un compte ? <Link to="/login" className="text-primary hover:underline">Se connecter</Link>
        </p>
      </form>
    </div>
  )
}