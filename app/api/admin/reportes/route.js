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
        grupoId: true,
        grupo: { select: { id: true, nombre: true } },
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

    // ── Sugerencia de grupo: si el nombre o el representante legal coincide
    //    con un informe que ya pertenece a un grupo, sugerir ese grupo ──
    const nuevoNombre   = (n.company.nombreEs || '').toLowerCase().trim()
    const nuevoNombreZh = (n.company.nombreZh || '').toLowerCase().trim()
    const nuevoRep      = (n.company.representanteLegal || '').toLowerCase().trim()

    const miembros = await prisma.reporteVerificacion.findMany({
      where: { grupoId: { not: null } },
      select: {
        id: true,
        nombreEmpresa: true,
        nombreEmpresaZh: true,
        data: true,
        grupo: { select: { id: true, nombre: true } },
      },
    })

    let sugerencia = null
    for (const m of miembros) {
      // Representante legal del miembro (desde su JSON original)
      let repMiembro = ''
      try { repMiembro = (normalizeReporte(m.data).company.representanteLegal || '').toLowerCase().trim() } catch { /* datos antiguos */ }

      const mismoNombre = (nuevoNombre && m.nombreEmpresa.toLowerCase().trim() === nuevoNombre)
        || (nuevoNombreZh && (m.nombreEmpresaZh || '').toLowerCase().trim() === nuevoNombreZh)
      const mismoRep = nuevoRep && repMiembro && repMiembro === nuevoRep

      if (mismoNombre || mismoRep) {
        sugerencia = {
          grupoId: m.grupo.id,
          grupoNombre: m.grupo.nombre,
          motivo: mismoNombre ? 'nombre de empresa' : 'representante legal',
          empresaCoincidente: m.nombreEmpresa,
        }
        break
      }
    }

    return NextResponse.json({ ...reporte, sugerencia }, { status: 201 })
  } catch (err) {
    console.error('Error al crear reporte:', err)
    return NextResponse.json({ error: 'Error al crear reporte' }, { status: 500 })
  }
}
