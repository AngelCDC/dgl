import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const reporte = await prisma.reporteVerificacion.findUnique({ where: { id } })
    if (!reporte) return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })
    return NextResponse.json(reporte)
  } catch {
    return NextResponse.json({ error: 'Error al obtener reporte' }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Acceso restringido' }, { status: 403 })

  try {
    const { id } = await params
    const body = await req.json()

    // Verificar que existe
    const existente = await prisma.reporteVerificacion.findUnique({ where: { id } })
    if (!existente) return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })

    const updateData = {}
    if (typeof body.visible === 'boolean') updateData.visible = body.visible

    // Asignación a grupo empresarial (null = quitar del grupo)
    if (body.grupoId !== undefined) {
      if (body.grupoId === null) {
        updateData.grupoId = null
      } else {
        const grupo = await prisma.grupoEmpresarial.findUnique({ where: { id: body.grupoId } })
        if (!grupo) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })
        updateData.grupoId = body.grupoId
      }
    }

    const reporte = await prisma.reporteVerificacion.update({ where: { id }, data: updateData })
    return NextResponse.json(reporte)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar reporte' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Acceso restringido' }, { status: 403 })

  try {
    const { id } = await params
    const existente = await prisma.reporteVerificacion.findUnique({ where: { id } })
    if (!existente) return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })

    await prisma.reporteVerificacion.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar reporte' }, { status: 500 })
  }
}
