import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cats = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true, suppliers: true } } },
    })
    return NextResponse.json(cats)
  } catch {
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { name, slug, type, color } = await req.json()
    if (!name || !slug) return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })

    const cat = await prisma.category.create({ data: { name: name.trim(), slug: slug.trim(), type: type || 'both', color: color || null } })
    return NextResponse.json(cat, { status: 201 })
  } catch (err) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Ya existe una categoría con ese slug' }, { status: 409 })
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
  }
}
