import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const planes = await prisma.supplierPlan.findMany({
      orderBy: { price: 'asc' },
      include: { _count: { select: { suppliers: true } } },
    })
    return NextResponse.json(planes)
  } catch {
    return NextResponse.json({ error: 'Error al obtener planes' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    if (!body.name) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })

    const plan = await prisma.supplierPlan.create({
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
    return NextResponse.json(plan, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear plan' }, { status: 500 })
  }
}
