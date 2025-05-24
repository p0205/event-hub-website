// src/contexts/AuthContext.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import api from '@/services/api'
import authService from '@/services/authService'
import { useRouter, usePathname } from 'next/navigation'

/**
 * AuthContext Type Definition
 * Defines the shape of our authentication context with:
 * - isAuthenticated: boolean flag for auth state
 * - user: current user data
 * - loading: loading state during auth checks
 * - checkAuth: function to verify authentication
 * - signOut: function to handle user logout
 */
interface AuthContextType {
  isAuthenticated: boolean
  user: any
  loading: boolean
  checkAuth: () => Promise<void>
  signOut: () => Promise<void>
}

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * AuthProvider Component
 * 
 * This is the main authentication provider that:
 * 1. Manages authentication state
 * 2. Provides authentication methods
 * 3. Handles automatic auth checks
 * 4. Manages user session
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Helper function to identify authentication-related pages
  const isAuthPage = (path: string) => {
    return path?.includes('/sign-in') || 
           path?.includes('/sign-up') || 
           path?.includes('/check-email');
  }

  /**
   * checkAuth Function
   * Verifies the user's authentication status by:
   * 1. Making an API call to /auth/me
   * 2. Setting user data if authenticated
   * 3. Clearing auth state if not authenticated
   * 4. Managing loading state
   */
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

  /**
   * signOut Function
   * Handles user logout by:
   * 1. Calling backend logout endpoint
   * 2. Clearing local auth state
   * 3. Removing JWT cookie
   * 4. Redirecting to sign-in page
   */
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
 
  // Effect: Check authentication status on mount and route changes
  useEffect(() => {
    // Only check auth if we're not on an auth page
    if (!isAuthPage(pathname)) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [pathname])

  // Provide authentication context to children
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, checkAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth Hook
 * Custom hook to access authentication context
 * Throws error if used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
