import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value
  const { pathname } = request.nextUrl
  
  // Define protected routes
  const protectedPaths = ['/', '/budget', '/role', '/events']
  const isProtectedPath = protectedPaths.includes(pathname) ||
    protectedPaths.some(path => path !== '/' && pathname.startsWith(path + '/'))
  

    
  // If accessing protected route without token, redirect to sign-in
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  
  // If signed in and trying to access sign-in page, redirect to home
  if (token && pathname === '/sign-in') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}