// src/components/AuthGuard.tsx
'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [countdown, setCountdown] = useState(3); // For redirect message

  const isAuthPage = (path: string | null) => { // Ensure path can be null
    return path?.includes('/sign-in') || 
           path?.includes('/sign-up') || 
      
           path?.includes('/check-email');
  };

  const isPublicPage = (path: string | null) => { // Ensure path can be null
    return  path?.includes('/public');
  };

  // Effect 1: Handle countdown timer for redirect message
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined = undefined; // Ensure timerId is typed
    if (!loading && !isAuthenticated && !isAuthPage(pathname)) {
      timerId = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerId) clearInterval(timerId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [loading, isAuthenticated, pathname]); // Removed isAuthPage from deps if it doesn't change

  // Effect 2: Handle navigation based on auth state
  useEffect(() => {
    // Don't make navigation decisions if AuthContext is still loading initially,
    // UNLESS we are trying to navigate an authenticated user away from an auth page.
    if (loading && !(isAuthenticated && isAuthPage(pathname))) {
      return;
    }

    if (isPublicPage(pathname)) {
      console.log("THis is public");
      return;
    } 
    else if (!isAuthenticated && !isAuthPage(pathname)) {
      console.log("sign-in");
      if (countdown === 0) {
        router.replace('/sign-in');
      }
    } else if (isAuthenticated && isAuthPage(pathname)) {

      console.log("isAuthenticated ");
      if(user?.role == 'ADMIN'){
        router.replace('/dashboard')
      }else{
        router.replace('/')
      }
    }
  }, [loading, isAuthenticated, pathname, countdown, router]); // Removed isAuthPage from deps

  // Conditional Rendering Logic:

  // 1. Show global loading spinner IF:
  //    - AuthContext's `loading` is true (e.g., initial `checkAuth`)
  //    - AND we are NOT on an authentication page.
  //    Auth pages should remain mounted to handle their own state, even if a global load is happening.
  if (loading && !isAuthPage(pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 2. Show redirect message for unauthenticated users IF:
  //    - AuthContext's `loading` is false (auth state is determined)
  //    - User is NOT authenticated
  //    - AND we are NOT on an auth page.
  if (!loading && !isAuthenticated && !isAuthPage(pathname)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">Redirecting to sign-in page in {countdown} seconds...</p>
        </div>
      </div>
    );
  }

  // 3. Otherwise, render children. This covers:
  //    - User is authenticated and on a protected page.
  //    - User is on an auth page (e.g., SignInPage), regardless of AuthContext.loading state
  //      (because SignInPage will manage its own loading UI).
  //    - This ensures SignInPage remains mounted during its own API calls.
  return <>{children}</>;
}