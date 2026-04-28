import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    if (id === session.user.id) return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err.code === 'P2003') return NextResponse.json({ error: 'No se puede eliminar: el usuario tiene artículos publicados' }, { status: 409 })
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}
