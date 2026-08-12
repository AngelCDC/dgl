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
  // cliente → sin acceso al módulo
  return false
}

// Whitelist de campos escalares (previene mass assignment)
const ALLOWED_SCALAR = [
  'fecha', 'numero', 'status',
  'buyerLegalName', 'buyerTradeName', 'buyerAddress', 'buyerCountry',
  'buyerTaxId', 'buyerRepresentative', 'buyerPosition', 'buyerEmail',
  'supplierId', 'supplierLegalName', 'supplierTradeName', 'supplierAddress',
  'supplierCountry', 'supplierUscc', 'supplierLegalRepresentative',
  'supplierPosition', 'supplierEmail',
  'totalContractValue', 'currency', 'incoterm', 'incotermOther', 'namedPlace',
  'paymentMethod', 'paymentMethodOther',
  'productionDays', 'productionStart', 'productionStartDate', 'estimatedReadyToShipDate',
  'warrantyMonths', 'warrantyStart', 'warrantyResponseDays', 'warrantyCorrectiveDays',
  'delayPercent', 'delayPeriod', 'delayCapPercent', 'delayTerminationDays',
  'ncDurationYears', 'ncTerritory',
  'governingLaw', 'negotiationDays', 'arbitrationInstitution', 'arbitrationSeat',
  'arbitrationLanguage', 'arbitrationLanguageOther', 'executedIn', 'controllingLanguage',
  'buyerNoticeName', 'buyerNoticeEmail', 'buyerNoticeAddress',
  'supplierNoticeName', 'supplierNoticeEmail', 'supplierNoticeAddress',
  'buyerSigner', 'buyerSignerPosition', 'buyerSignDate',
  'supplierSigner', 'supplierSignerPosition', 'supplierSignDate',
  'annexA', 'annexB',
  'inspectionCompany', 'inspectionLocation', 'inspectionDate',
  'inspectionChecklist', 'inspectionStandard', 'inspectionStandardOther',
  'annexDDocs', 'annexDOther',
]

function pickScalars(body) {
  const out = {}
  for (const key of ALLOWED_SCALAR) {
    if (body[key] === undefined) continue
    let v = body[key]
    if (v === '' && key !== 'fecha') v = null
    if ((key === 'inspectionChecklist' || key === 'annexDDocs') && v === null) continue
    out[key] = v
  }
  return out
}

// ── GET — cargar contrato completo ─────────────────────────────────────────────
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user?.role === 'cliente') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params

  const accessWhere = await buildAccessWhere(session, { id })

  const contrato = await prisma.contratoCompra.findFirst({
    where: accessWhere,
    include: {
      partidas: { orderBy: { sortOrder: 'asc' } },
      pagos:    { orderBy: { sortOrder: 'asc' } },
      supplier: { select: { name: true, city: true, country: true, email: true } },
    },
  })

  if (!contrato) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json(contrato)
}

// ── PUT — actualizar campos + partidas + pagos ────────────────────────────────
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!(await canWrite(session))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params

  try {
    const body = await req.json()
    const { partidas, pagos, ...campos } = body

    const safeData = pickScalars(campos)

    // Verificar que el proveedor del Directorio exista (si viene vinculado)
    if (safeData.supplierId) {
      const exists = await prisma.supplier.findUnique({ where: { id: safeData.supplierId }, select: { id: true } })
      if (!exists) safeData.supplierId = null
    }

    const contrato = await prisma.$transaction(async (tx) => {

      // 1. Actualizar campos escalares
      const updated = await tx.contratoCompra.update({
        where: { id },
        data: { ...safeData, updatedAt: new Date() },
      })

      // 2. Reemplazar partidas si vienen en el payload
      if (Array.isArray(partidas)) {
        await tx.contratoPartida.deleteMany({ where: { contratoId: id } })
        if (partidas.length > 0) {
          await tx.contratoPartida.createMany({
            data: partidas.map((p, i) => ({
              contratoId:     id,
              producto:       p.producto,
              especificacion: p.especificacion ?? null,
              cantidad:       p.cantidad,
              precioUnitario: p.precioUnitario,
              total:          p.total ?? null,
              sortOrder:      i,
            })),
          })
        }
      }

      // 3. Reemplazar pagos si vienen en el payload
      if (Array.isArray(pagos)) {
        await tx.contratoPago.deleteMany({ where: { contratoId: id } })
        if (pagos.length > 0) {
          await tx.contratoPago.createMany({
            data: pagos.map((pg, i) => ({
              contratoId: id,
              concepto:   pg.concepto,
              porcentaje: pg.porcentaje,
              monto:      pg.monto,
              sortOrder:  i,
            })),
          })
        }
      }

      return updated
    })

    return NextResponse.json({ ok: true, id: contrato.id })

  } catch (error) {
    console.error('Error actualizando contrato:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// ── DELETE — eliminar contrato (cascada partidas/pagos) ───────────────────────
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!(await canWrite(session))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params

  try {
    await prisma.contratoCompra.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error eliminando contrato:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}

// ── POST /emitir — finalizar el documento ─────────────────────────────────────
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!(await canWrite(session))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params

  try {
    const { action } = await req.json()

    if (action === 'emitir') {
      const hoy = new Date().toISOString().split('T')[0]
      const current = await prisma.contratoCompra.findUnique({
        where: { id },
        select: { buyerSignDate: true, supplierSignDate: true },
      })
      await prisma.contratoCompra.update({
        where: { id },
        data: {
          status: 'finalizado',
          updatedAt: new Date(),
          ...(!current?.buyerSignDate    && { buyerSignDate:    hoy }),
          ...(!current?.supplierSignDate && { supplierSignDate: hoy }),
        },
      })
      return NextResponse.json({ ok: true, status: 'finalizado' })
    }

    if (action === 'reabrir') {
      await prisma.contratoCompra.update({
        where: { id },
        data: { status: 'borrador', updatedAt: new Date() },
      })
      return NextResponse.json({ ok: true, status: 'borrador' })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })

  } catch (error) {
    console.error('Error emitiendo contrato:', error)
    return NextResponse.json({ error: 'Error al emitir' }, { status: 500 })
  }
}
