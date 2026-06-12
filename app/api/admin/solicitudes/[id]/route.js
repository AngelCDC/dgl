import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { buildAccessWhere } from '../../../../lib/access'

// ── Helpers ────────────────────────────────────────────────────────────────────
async function canWrite(session) {
  if (!session?.user) return false
  if (session.user.role === 'admin') return true
  if (session.user.role === 'trabajador') return true
  // cliente → no puede escribir
  return false
}

// ── DELETE — eliminar solicitud de procura y su adquisición vinculada ─────────
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!(await canWrite(session))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params

  try {
    // Verificar acceso al registro (cliente solo puede eliminar lo suyo)
    const accessWhere = await buildAccessWhere(session, { id })
    const existing = await prisma.solicitudProcura.findFirst({ where: accessWhere, select: { id: true } })
    if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      // 1. Eliminar la adquisición vinculada si existe
      //    (sus cotizantes y riesgos se eliminan por onDelete: Cascade)
      await tx.solicitudAdquisicion.deleteMany({ where: { solicitudProcuraId: id } })

      // 2. Eliminar la solicitud de procura
      //    (contactos, productos y necesidades se eliminan por onDelete: Cascade)
      await tx.solicitudProcura.delete({ where: { id } })
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error eliminando solicitud:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}
