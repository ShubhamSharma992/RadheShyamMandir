import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'temple_session'

/**
 * First gate on /admin. Verifies the session JWT at the edge so an
 * unauthenticated visitor never reaches admin code or data. Every admin
 * page and server action re-checks independently.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') return NextResponse.next()

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const secret = process.env.AUTH_SECRET

  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] })
      return NextResponse.next()
    } catch {
      // fall through to redirect
    }
  }

  const loginUrl = new URL('/admin/login', request.url)
  loginUrl.searchParams.set('next', pathname)
  const response = NextResponse.redirect(loginUrl)
  response.cookies.delete(SESSION_COOKIE)
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
