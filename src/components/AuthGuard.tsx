// src/components/AuthGuard.tsx
'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * AuthGuard Component
 * 
 * This component acts as a security wrapper around protected routes.
 * It ensures that:
 * 1. Unauthenticated users are redirected to sign-in
 * 2. Authenticated users can't access auth pages (sign-in, sign-up)
 * 3. Shows loading state while checking authentication
 * 4. Provides a countdown before redirecting unauthenticated users
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Get authentication state from AuthContext
  const { loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  // State to control when to render children
  const [shouldRender, setShouldRender] = useState(false)
  // Countdown state for redirect message
  const [countdown, setCountdown] = useState(3)

  // Helper function to check if current page is an authentication page
  const isAuthPage = (path: string) => {
    return path?.includes('/sign-in') || 
           path?.includes('/sign-up') || 
           path?.includes('/check-email');
  }

  // Effect 1: Handle countdown timer for redirect message
  useEffect(() => {
    // Only start countdown if:
    // - Not loading
    // - User is not authenticated
    // - Not on an auth page
    if (!loading && !isAuthenticated && !isAuthPage(pathname)) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [loading, isAuthenticated, pathname])

  // Effect 2: Handle navigation based on auth state
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !isAuthPage(pathname)) {
        // If user is not authenticated and not on auth page, redirect to sign-in
        if (countdown === 0) {
          router.replace('/sign-in')
        }
      } else if (isAuthenticated && isAuthPage(pathname)) {
        // If user is authenticated and on auth page, redirect to home
        router.push('/')
      } else {
        // Otherwise, allow rendering of protected content
        setShouldRender(true)
      }
    }
  }, [loading, isAuthenticated, pathname, countdown, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Show redirect message for unauthenticated users
  if (!isAuthenticated && !isAuthPage(pathname)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to access this page.</p>
          <p className="text-gray-500">Redirecting to sign-in page in {countdown} seconds...</p>
        </div>
      </div>
    )
  }

  // Render protected content if all checks pass
  return <>{children}</>
}