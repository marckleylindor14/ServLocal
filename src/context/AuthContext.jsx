import { createContext, useContext, useState, useEffect } from 'react'
import API_URL from '../config'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          // Si l'admin est reconnu, le serveur renvoie 200 ; sinon, on déconnecte
          if (!res.ok) throw new Error('Token invalide')
          return res.json()
        })
        .then(data => {
          if (data.id !== undefined) setUser(data)
          else logout()
        })
        .catch(() => logout())
    }
  }, [token])

  const login = (userData, tokenData) => {
    localStorage.setItem('token', tokenData)
    setToken(tokenData)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}