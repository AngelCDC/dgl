import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const data = await req.json()

  const supplier = await prisma.supplier.create({
    data: {
      name:          data.name,
      slug:          data.slug,
      description:   data.description,
      country:       data.country,
      city:          data.city,
      website:       data.website,
      email:         data.email,
      phone:         data.phone,
      whatsapp:      data.whatsapp,
      categoryId:    data.categoryId,
      planId:        data.planId,
      status:        data.status,
      verified:      data.verified,
      featured:      data.featured,
      internalNotes: data.internalNotes,
    },
  })

  return Response.json(supplier)
}