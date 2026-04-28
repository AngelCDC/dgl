import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    if (!body.name) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })

    const plan = await prisma.supplierPlan.update({
      where: { id },
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        price: body.price ?? null,
        currency: body.currency || 'USD',
        durationDays: body.durationDays || 30,
        isFeatured: body.isFeatured ?? false,
        badgeLabel: body.badgeLabel?.trim() || null,
        maxProducts: body.maxProducts || 5,
        active: body.active ?? true,
      },
    })
    return NextResponse.json(plan)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar plan' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    await prisma.supplierPlan.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err.code === 'P2003') return NextResponse.json({ error: 'No se puede eliminar: hay proveedores usando este plan' }, { status: 409 })
    return NextResponse.json({ error: 'Error al eliminar plan' }, { status: 500 })
  }
}
