// src/contexts/AuthContext.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import api from '@/services/api'
import authService from '@/services/authService'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  user: any
  loading: boolean
  checkAuth: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = (path: string) => {
    return path?.includes('/sign-in') || 
           path?.includes('/sign-up') || 
           path?.includes('/check-email');
  }

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (error) {
      setIsAuthenticated(false)
      setUser(null)
      // Only clear cookie if we're not on an auth page
      if (!isAuthPage(pathname)) {
        document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setIsAuthenticated(false)
      setUser(null)
      // Clear the cookie
      document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      router.replace('/sign-in')
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }
 
  useEffect(() => {
    // Only check auth if we're not on an auth page
    if (!isAuthPage(pathname)) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [pathname])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, checkAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
