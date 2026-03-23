import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export default async function proxy(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}