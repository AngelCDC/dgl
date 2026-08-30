import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const grupo = await prisma.grupoEmpresarial.findUnique({
      where: { id },
      include: {
        reportes: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            nombreEmpresa: true,
            nombreEmpresaZh: true,
            codigoCreditoSocial: true,
            puntajeTotal: true,
            visible: true,
            createdAt: true,
            contratos: {
              select: { id: true, numero: true, fecha: true, status: true, totalContractValue: true },
            },
          },
        },
        clientes: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            cedulaRif: true,
            razonSocial: true,
            nombreComercial: true,
            ciudad: true,
            sectorIndustria: true,
            representanteLegal: true,
            createdAt: true,
          },
        },
      },
    })
    if (!grupo) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })
    return NextResponse.json(grupo)
  } catch {
    return NextResponse.json({ error: 'Error al obtener grupo' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Acceso restringido' }, { status: 403 })

  try {
    const { id } = await params
    const body = await req.json()

    const existente = await prisma.grupoEmpresarial.findUnique({ where: { id } })
    if (!existente) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })

    const data = {}
    if (body.nombre !== undefined) data.nombre = String(body.nombre).trim()
    if (body.nombreZh !== undefined) data.nombreZh = body.nombreZh ? String(body.nombreZh).trim() : null
    if (body.empresaPrincipal !== undefined) data.empresaPrincipal = String(body.empresaPrincipal).trim()
    if (body.descripcion !== undefined) data.descripcion = body.descripcion ? String(body.descripcion).trim() : null

    if (!data.nombre && !existente.nombre) {
      return NextResponse.json({ error: 'El nombre del grupo no puede quedar vacío' }, { status: 400 })
    }

    const grupo = await prisma.grupoEmpresarial.update({ where: { id }, data })
    return NextResponse.json(grupo)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar grupo' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Acceso restringido' }, { status: 403 })

  try {
    const { id } = await params
    const existente = await prisma.grupoEmpresarial.findUnique({ where: { id } })
    if (!existente) return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 })

    // Los informes del grupo no se borran: quedan sin grupo (ON DELETE SET NULL)
    await prisma.grupoEmpresarial.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar grupo' }, { status: 500 })
  }
}
