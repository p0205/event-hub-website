// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('jwt')?.value
//   const { pathname } = request.nextUrl

//   // Define protected routes
//   const protectedPaths = ['/', '/budget', '/role', '/my-events']
//   const isProtectedPath = protectedPaths.includes(pathname) ||
//     protectedPaths.some(path => path !== '/' && pathname.startsWith(path + '/'))

//   // Define auth pages
//   const authPaths = ['/sign-in', '/sign-up', '/check-email']
//   const isAuthPath = authPaths.some(path => pathname.startsWith(path))

//   // If accessing protected route without token, redirect to sign-in
//   // if (isProtectedPath && !token) {
//   //   return NextResponse.redirect(new URL('/sign-in', request.url))
//   // }

//   // If signed in and trying to access auth pages, redirect to home
//   if (token && isAuthPath) {
//     return NextResponse.redirect(new URL('/', request.url))
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ]
// }