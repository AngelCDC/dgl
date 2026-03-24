import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const data = await req.json()

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      coverUrl: data.coverUrl || null,
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

  const { id } = await params
  await prisma.article.delete({ where: { id } })
  return Response.json({ ok: true })
}