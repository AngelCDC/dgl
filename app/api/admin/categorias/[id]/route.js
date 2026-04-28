import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const { name, slug, type, color } = await req.json()
    if (!name || !slug) return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })

    const cat = await prisma.category.update({ where: { id }, data: { name: name.trim(), slug: slug.trim(), type, color: color || null } })
    return NextResponse.json(cat)
  } catch (err) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Ya existe una categoría con ese slug' }, { status: 409 })
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err.code === 'P2003') return NextResponse.json({ error: 'No se puede eliminar: hay artículos o proveedores usando esta categoría' }, { status: 409 })
    return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 })
  }
}
