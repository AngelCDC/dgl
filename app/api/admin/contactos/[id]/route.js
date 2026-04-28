import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const { status } = await req.json()
    const allowed = ['new', 'read', 'attended']
    if (!allowed.includes(status)) return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })

    const contact = await prisma.contactRequest.update({ where: { id }, data: { status } })
    return NextResponse.json(contact)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar mensaje' }, { status: 500 })
  }
}
