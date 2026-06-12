import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const data = await req.json()

  // Verificar que el artículo existe y el usuario es el autor
  const existing = await prisma.article.findUnique({ where: { id }, select: { authorId: true } })
  if (!existing) return Response.json({ error: 'No encontrado' }, { status: 404 })
  if (existing.authorId !== session.user.id && session.user.role !== 'admin') {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  // Whitelist: solo estos campos se pueden actualizar
  const allowed = {}
  if (data.title !== undefined)      allowed.title      = data.title
  if (data.slug !== undefined)       allowed.slug       = data.slug
  if (data.excerpt !== undefined)    allowed.excerpt    = data.excerpt
  if (data.content !== undefined)    allowed.content    = data.content
  if (data.coverUrl !== undefined)   allowed.coverUrl   = data.coverUrl || null
  if (data.categoryId !== undefined) allowed.categoryId = data.categoryId || null
  if (data.status !== undefined)     allowed.status     = data.status
  if (data.status === 'published')   allowed.publishedAt = new Date()

  const article = await prisma.article.update({
    where: { id },
    data: { ...allowed, updatedAt: new Date() },
  })

  return Response.json(article)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  // Verificar que el artículo existe y el usuario es el autor (o admin)
  const existing = await prisma.article.findUnique({ where: { id }, select: { authorId: true } })
  if (!existing) return Response.json({ error: 'No encontrado' }, { status: 404 })
  if (existing.authorId !== session.user.id && session.user.role !== 'admin') {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  await prisma.article.delete({ where: { id } })
  return Response.json({ ok: true })
}