import prisma from '../../lib/prisma'
import { checkRateLimit, getRateLimitKey } from '../../lib/rate-limit'

export async function GET(req) {
  // Rate limit: 30 búsquedas por IP cada 60 segundos
  const rl = checkRateLimit({ windowMs: 60_000, max: 30, id: getRateLimitKey(req, 'search') })
  if (!rl.ok) {
    return Response.json({ error: 'Demasiadas búsquedas. Intenta de nuevo en unos segundos.' }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2 || q.length > 200) return Response.json({ articulos: [], proveedores: [] })

  const [articulos, proveedores] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: { title: true, slug: true, excerpt: true, category: { select: { name: true, color: true } } },
    }),
    prisma.supplier.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { country: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: { name: true, slug: true, country: true, city: true, category: { select: { name: true } }, logoUrl: true, verified: true },
    }),
  ])

  return Response.json({ articulos, proveedores })
}