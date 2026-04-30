import prisma from '../../../../../lib/prisma'
// app/api/admin/adquisiciones/[id]/pdf/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import SolicitudPDF from '../../../../../components/SolicitudPDF'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  try {
    const s = await prisma.solicitudAdquisicion.findUnique({
      where: { id },
      include: {
        cotizantes:      { orderBy: { sortOrder: 'asc' } },
        riesgos:         { orderBy: { sortOrder: 'asc' } },
        solicitudProcura: { include: { productos: true } },
      },
    })

    if (!s) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

    const data = {
      // 1. General
      fecha:       parseFecha(s.fecha),
      solicitante: s.solicitante,
      ccNit:       s.ccNit,
      telCel:      s.telCel,
      ext:         s.ext,
      email:       s.email,

      // 2. Justificación (fusionada)
      justificacion: s.descripcionNecesidad,

      // 3. Objeto — descripción + productos especificados en la solicitud de procura
      descripcionObjeto:   s.descripcionObjeto,
      requierePermisos:    s.requierePermisos,
      productosVinculados: s.solicitudProcura?.productos ?? [],

      // 4. Obligaciones
      obligaciones: s.obligaciones ?? [],

      // 5. Plazo de Ejecución
      plazo: s.plazo || '4 Meses',

      // 6. Estudio de Mercado
      cotizantes: s.cotizantes.map(c => ({
        productoNombre: c.productoNombre ?? null,
        nombre:         c.nombre,
        valor:          c.valor,
      })),
      valorEstimado: s.valorEstimado,

      // 7. Riesgos
      riesgos: s.riesgos.map(r => ({
        descripcion: r.descripcion,
        mitigacion:  r.mitigacion,
        asignacion:  r.asignacion,
      })),

      // 8. Firmas
      elaboradoPor: {
        nombre: s.elaboradoPorNombre || 'Angel Dubois',
        cargo:  s.elaboradoPorCargo  || 'FOUNDER - CEO',
        fecha:  s.elaboradoPorFecha,
      },
      responsableContratacion: {
        nombre: s.contratanteNombre,
        cargo:  s.contratanteCargo,
        fecha:  s.contratanteFecha,
      },
    }

    const buffer = await renderToBuffer(
      createElement(SolicitudPDF, { data })
    )

    const nombre = s.solicitante?.trim().replace(/\s+/g, '_') || 'cliente'
    const fecha  = s.fecha?.replace(/\//g, '-') || 'sin-fecha'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="adquisicion-${nombre}_${fecha}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error generando PDF adquisición:', error)
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }
}

function parseFecha(fechaStr) {
  if (!fechaStr) return { dd: '--', mm: '--', aaaa: '----' }
  const [dd, mm, aaaa] = fechaStr.split('/')
  return { dd: dd ?? '--', mm: mm ?? '--', aaaa: aaaa ?? '----' }
}