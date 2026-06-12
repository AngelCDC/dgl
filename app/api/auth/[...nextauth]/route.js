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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate limiting anti fuerza bruta (10 intentos/min por IP)
        // En App Router, NextAuth pasa { query, body, headers, method } como 2º arg
        // donde headers es un objeto plano, no un Headers nativo
        try {
          if (req?.headers) {
            const rl = checkRateLimit({ windowMs: 60_000, max: 10, id: getRateLimitKey(req, 'auth') })
            if (!rl.ok) return null
          }
        } catch { /* si falla el rate limiter, continuamos sin él */ }

        try {
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
        } catch (err) {
          console.error('Error en authorize:', err)
          return null
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }