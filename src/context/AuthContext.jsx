import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import API_URL from '../config'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Token invalide')
        return res.json()
      })
      .then(data => {
        if (cancelled) return
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          photo: data.photo,
          isAdmin: data.isAdmin || false
        })
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        logout()
      })

    return () => { cancelled = true }
  }, [token, logout])

  const login = useCallback((userData, tokenData) => {
    const newToken = tokenData || userData?.token
    if (newToken) {
      localStorage.setItem('token', newToken)
      setToken(newToken)
    }
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      photo: userData.photo,
      isAdmin: userData.isAdmin || false
    })
    setLoading(false)
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}