import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import ReporteVerificacionPDF from '../../../../../components/ReporteVerificacionPDF'
import { normalizeReporte } from '../../../../../lib/reportes/verificacion'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const reporte = await prisma.reporteVerificacion.findUnique({ where: { id } })
    if (!reporte) return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })

    const data = normalizeReporte(reporte.data)
    const buffer = await renderToBuffer(
      createElement(ReporteVerificacionPDF, { data })
    )

    const nombre = (reporte.nombreEmpresa || 'empresa')
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="informe-verificacion-${nombre}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Error al generar PDF de reporte:', err)
    return NextResponse.json({ error: 'Error al generar PDF' }, { status: 500 })
  }
}
