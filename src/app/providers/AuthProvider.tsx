import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/store'

interface AuthContextType {
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  const [isAuthenticated, setIsAuthenticated] = useState(!!user)

  useEffect(() => {
    setIsAuthenticated(!!user)
  }, [user])

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

