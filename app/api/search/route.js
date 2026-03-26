import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) return Response.json({ articulos: [], proveedores: [] })

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