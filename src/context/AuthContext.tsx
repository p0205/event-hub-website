// src/contexts/AuthContext.tsx
'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

import authService from '@/services/authService'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@/types/user'

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false) // Track if auth has been initialized
  const router = useRouter()
  const pathname = usePathname()

  // Helper function to identify authentication-related pages
  const isAuthPage = useCallback((path: string) => {
    return path?.includes('/sign-in') ||
      path?.includes('/sign-up') ||
      path?.includes('/public') ||
      path?.includes('/check-email')
  }, [])

  /**
   * checkAuth Function
   * Verifies the user's authentication status by checking with the backend
   */
  const checkAuth = useCallback(async () => {
    // Don't check auth multiple times if already loading
    if (loading && initialized) {
      return
    }

    try {
      setLoading(true)

      console.log('Checking authentication...')
      const response = await authService.checkAuth()

      if (response) {
        setUser(response)
        setIsAuthenticated(true)
        console.log(`Auth check successful - User: ${response.email}`)
        console.log(`Auth check successful - User: ${response.mustChangePassword}`)
        console.log(`Auth check successful - User: ${response.role}`)
      
        // If user is authenticated and on auth page, redirect to home
        if (isAuthPage(pathname)) {
          if(response.role == 'ADMIN'){
            router.replace('/dashboard')
          }else{
            router.replace('/')
          }
          
        }
      } else {
        throw new Error('No user data received')
      }
    } catch (error) {
      console.log('Auth check failed:', error)
      setIsAuthenticated(false)
      setUser(null)

      // Only redirect to sign-in if we're on a protected page
      // and not already on an auth page
      if (!isAuthPage(pathname)) {
        // Clear the invalid cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        }
        router.replace('/sign-in')
      }
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [pathname, router, isAuthPage, loading, initialized])

  // src/contexts/AuthContext.tsx
  const signIn = async (email: string, password: string) => {


    try {
      console.log('Attempting sign in...');
      const response = await authService.signIn(email, password);
      if (response) {
        setUser(response);
        setIsAuthenticated(true);
        setInitialized(true);
        console.log(`Login successful - User: ${response.email}`);
        console.log(`Login successful - User: ${response.mustChangePassword}`);
        if(response.role == 'ADMIN'){
          router.replace('/dashboard'); // Navigate immediately (remove setTimeout)
        }else{
          router.replace('/'); // Navigate immediately (remove setTimeout)
        }
      } else {
        throw new Error('No user data received from login');
      }
    } catch (error) {
      console.error('AuthContext signIn error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true)
      await authService.signOut()
      setIsAuthenticated(false)
      setUser(null)
      setInitialized(true)

      // Clear the cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
      router.replace('/sign-in')
    } catch (error) {
      console.error('Error during sign out:', error)
      // Even if API call fails, clear local state
      setIsAuthenticated(false)
      setUser(null)
      setInitialized(true)
      if (typeof document !== 'undefined') {
        document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
      router.replace('/sign-in')
    } finally {
      setLoading(false)
    }
  }

  // Check auth only on initial mount
  useEffect(() => {
    if (!initialized) {
      checkAuth()
    }
  }, [checkAuth, initialized])

  // Handle pathname changes for authenticated users
  // useEffect(() => {
  //   if (initialized && isAuthenticated && isAuthPage(pathname)) {
  //     router.replace('/')
  //   }
  // }, [pathname, isAuthenticated, initialized, router, isAuthPage])

  // Debug logging
  useEffect(() => {
    console.log('Auth State:', { isAuthenticated, user: user?.email, loading, initialized })
  }, [isAuthenticated, user, loading, initialized])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      signIn,
      signOut,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}