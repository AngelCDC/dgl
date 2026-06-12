import prisma from '../../../lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from 'next/server'

// ── GET — listar proveedores (filtrado por rubro si es cliente) ─────────────────
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const where = {}

  // Cliente: filtrar por rubros asignados
  if (session.user?.role === 'cliente') {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { rubros: true },
    })
    const rubros = user?.rubros ?? []
    if (rubros.length === 0) return NextResponse.json([])
    where.rubro = { in: rubros, mode: 'insensitive' }
  }

  const proveedores = await prisma.supplier.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { name: true } }, plan: { select: { name: true } } },
  })

  return NextResponse.json(proveedores)
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();

  if (!data.name || !data.slug || !data.country) {
    return NextResponse.json({ error: 'Nombre, slug y país son requeridos' }, { status: 400 })
  }

  const supplier = await prisma.supplier.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      logoUrl: data.logoUrl || null,
      coverUrl: data.coverUrl || null,
      country: data.country,
      city: data.city,
      website: data.website,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      categoryId: data.categoryId,
      planId: data.planId,
      status: data.status,
      verified: data.verified,
      featured: data.featured,
      internalNotes: data.internalNotes,
    },
  });

  return Response.json(supplier);
}
