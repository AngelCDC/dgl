import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const data = await req.json()

  const article = await prisma.article.update({
    where: { id: params.id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      categoryId: data.categoryId,
      status: data.status,
      publishedAt: data.status === 'published' ? new Date() : null,
      updatedAt: new Date(),
    },
  })

  return Response.json(article)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  await prisma.article.delete({ where: { id: params.id } })
  return Response.json({ ok: true })
}