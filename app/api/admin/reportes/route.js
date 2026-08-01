import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { parseReporte } from '../../../lib/schemas/reporte-verificacion'
import { normalizeReporte } from '../../../lib/reportes/verificacion'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const reportes = await prisma.reporteVerificacion.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nombreEmpresa: true,
        nombreEmpresaZh: true,
        estadoEmpresa: true,
        codigoCreditoSocial: true,
        puntajeTotal: true,
        registrosTotales: true,
        visible: true,
        createdAt: true,
      },
    })
    return NextResponse.json(reportes)
  } catch {
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Acceso restringido' }, { status: 403 })

  try {
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'El cuerpo debe ser JSON válido' }, { status: 400 })
    }

    // Aceptar { data: {...} } o el JSON directo
    const raw = body.data || body

    // Validar envelope
    const parsed = parseReporte(raw)
    if (!parsed.ok) {
      return NextResponse.json({ error: 'Formato de reporte inválido', details: parsed.errors }, { status: 400 })
    }

    // Normalizar
    const n = normalizeReporte(raw)

    // Guardar
    const reporte = await prisma.reporteVerificacion.create({
      data: {
        nombreEmpresa: n.company.nombreEs,
        nombreEmpresaZh: n.company.nombreZh,
        estadoEmpresa: n.company.estado,
        codigoCreditoSocial: n.company.codigoCreditoSocial,
        puntajeTotal: n.totalScore,
        registrosTotales: n.totalRecords,
        data: raw,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(reporte, { status: 201 })
  } catch (err) {
    console.error('Error al crear reporte:', err)
    return NextResponse.json({ error: 'Error al crear reporte' }, { status: 500 })
  }
}
