import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const data = await req.json()

  // Validar campos requeridos
  if (!data.title || !data.slug) {
    return Response.json({ error: 'Título y slug son requeridos' }, { status: 400 })
  }

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: data.content || null,
      coverUrl: data.coverUrl || null,
      categoryId: data.categoryId || null,
      authorId: session.user.id,  // ← forzar el autor real, ignorar lo que envíe el cliente
      status: data.status || 'draft',
      publishedAt: data.status === 'published' ? new Date() : null,
    },
  })

  return Response.json(article)
}