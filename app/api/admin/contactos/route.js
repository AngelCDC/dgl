import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const contacts = await prisma.contactRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { supplier: { select: { name: true } } },
    })
    return NextResponse.json(contacts)
  } catch {
    return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 })
  }
}
