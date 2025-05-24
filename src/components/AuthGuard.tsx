// src/components/AuthGuard.tsx
'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = (path: string) => {
    return path?.includes('/sign-in') || 
           path?.includes('/sign-up') || 
           path?.includes('/check-email');
  }

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !isAuthPage(pathname)) {
        router.replace('/sign-in')
      } else if (isAuthenticated && isAuthPage(pathname)) {
        router.replace('/')
      }
    }
  }, [loading, isAuthenticated, pathname, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
}