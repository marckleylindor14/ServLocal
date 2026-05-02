import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
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
    } catch (err) {
      setError('Impossible de contacter le serveur')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md border border-border rounded-2xl p-8 w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Connexion</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input type="email" placeholder="Email" required value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary" />
        <input type="password" placeholder="Mot de passe" required value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary" />
        <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:bg-primary/90">
          Se connecter
        </button>
        <p className="text-sm text-center text-muted-foreground">
          Pas encore de compte ? <Link to="/signup" className="text-primary hover:underline">S'inscrire</Link>
        </p>
      </form>
    </div>
  )
}