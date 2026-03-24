import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const data = await req.json()

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
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
      logoUrl: data.logoUrl || null,
      coverUrl: data.coverUrl || null,
      updatedAt: new Date(),
    },
  })

  return Response.json(supplier)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.supplier.delete({ where: { id } })
  return Response.json({ ok: true })
}