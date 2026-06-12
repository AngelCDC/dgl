import prisma from '../../../lib/prisma'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { checkRateLimit, getRateLimitKey } from '../../../lib/rate-limit'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const baseHandler = NextAuth(authOptions)

// Wrapper con rate limiting anti fuerza bruta
async function handler(req) {
  // Solo aplicar rate limit al POST (login)
  if (req.method === 'POST') {
    const rl = checkRateLimit({ windowMs: 60_000, max: 10, id: getRateLimitKey(req, 'auth') })
    if (!rl.ok) {
      return new Response(JSON.stringify({ error: 'Demasiados intentos. Espera un minuto.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
  return baseHandler(req)
}

export { handler as GET, handler as POST }