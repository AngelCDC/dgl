import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const data = await req.json()

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      coverUrl: data.coverUrl || null,
      categoryId: data.categoryId,
      authorId: data.authorId,
      status: data.status,
      publishedAt: data.status === 'published' ? new Date() : null,
    },
  })

  return Response.json(article)
}