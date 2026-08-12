import prisma from '../../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { ContratoPDF } from '../../../../../components/ContratoPDF'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user?.role === 'cliente') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params

  try {
    const contrato = await prisma.contratoCompra.findUnique({
      where: { id },
      include: {
        partidas: { orderBy: { sortOrder: 'asc' } },
        pagos:    { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!contrato) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    // ── Data para el componente PDF (guardas defensivas para Json/arrays) ──────
    const data = {
      ...contrato,
      partidas: Array.isArray(contrato.partidas) ? contrato.partidas : [],
      pagos:    Array.isArray(contrato.pagos)    ? contrato.pagos    : [],
      annexA:   contrato.annexA && typeof contrato.annexA === 'object' ? contrato.annexA : {},
      annexB:   Array.isArray(contrato.annexB) ? contrato.annexB : [],
      inspectionChecklist: Array.isArray(contrato.inspectionChecklist) ? contrato.inspectionChecklist : [],
      annexDDocs: Array.isArray(contrato.annexDDocs) ? contrato.annexDDocs : [],
    }

    const buffer = await renderToBuffer(createElement(ContratoPDF, { data }))

    const baseName = (contrato.numero || contrato.fecha || 'contrato').replace(/[^a-zA-Z0-9_-]/g, '-')

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contrato-${baseName}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generando PDF de contrato:', error)
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }
}
