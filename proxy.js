import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { puedeAcceder } from './app/lib/permisos'

export async function proxy(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    // 1. Sin sesión → redirigir al login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // 2. Verificar acceso según rol
    const role = token.role || 'cliente'
    if (!puedeAcceder(role, pathname)) {
      // Redirigir al dashboard si no tiene acceso
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
