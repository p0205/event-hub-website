// src/components/AuthGuard.tsx
'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const isAuthPage = (path: string) => {
    return path?.includes('/sign-in') || 
           path?.includes('/sign-up') || 
           path?.includes('/check-email');
  }

  // Handle countdown
  useEffect(() => {
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

  // Handle navigation
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !isAuthPage(pathname)) {
        if (countdown === 0) {
          router.push('/sign-in')
        }
      } else if (isAuthenticated && isAuthPage(pathname)) {
        router.push('/')
      } else {
        setShouldRender(true)
      }
    }
  }, [loading, isAuthenticated, pathname, countdown, router])

  // Show loading state while checking authentication
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
          <p className="text-gray-500">Redirecting to login page in {countdown} seconds...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}