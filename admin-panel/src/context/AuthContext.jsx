import { createContext, useContext, useState, useEffect } from 'react'
import { loginWithCredentials, logout as apiLogout, getStoredUser, isAuthenticated } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    if (isAuthenticated()) {
      const stored = getStoredUser()
      if (stored) setUser(stored)
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const { user: adminUser } = await loginWithCredentials(email, password)
    setUser(adminUser)
    return adminUser
  }

  function logout() {
    apiLogout()
    setUser(null)
  }

  function updateUser(patch) {
    setUser(prev => {
      const next = { ...prev, ...patch }
      localStorage.setItem('admin_user', JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
