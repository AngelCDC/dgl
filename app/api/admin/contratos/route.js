import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { buildAccessWhere } from '../../../lib/access'
import { proximoNumeroContrato, yearFromFecha } from '../../../lib/contratos'

// ── Helpers ────────────────────────────────────────────────────────────────────
async function canWrite(session) {
  if (!session?.user) return false
  if (session.user.role === 'admin') return true
  if (session.user.role === 'trabajador') return true
  // cliente → sin acceso al módulo
  return false
}

// Whitelist de campos escalares (previene mass assignment)
// Nota: 'numero' NO se acepta del cliente — se asigna secuencialmente en el servidor.
const ALLOWED_SCALAR = [
  'fecha', 'status',
  'buyerLegalName', 'buyerTradeName', 'buyerAddress', 'buyerCountry',
  'buyerTaxId', 'buyerRepresentative', 'buyerPosition', 'buyerEmail',
  'verificacionId', 'supplierLegalName', 'supplierTradeName', 'supplierAddress',
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

// ── GET — listar contratos ─────────────────────────────────────────────────────
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user?.role === 'cliente') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const where = await buildAccessWhere(session)

  const contratos = await prisma.contratoCompra.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { partidas: true, pagos: true } },
    },
  })

  return NextResponse.json(contratos)
}

// ── POST — crear contrato con partidas y pagos ────────────────────────────────
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!(await canWrite(session))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  try {
    const body = await req.json()
    const { partidas, pagos, ...campos } = body

    if (!campos.fecha || !campos.buyerLegalName || !campos.supplierLegalName) {
      return NextResponse.json({ error: 'Fecha, comprador y proveedor son requeridos' }, { status: 400 })
    }

    const safeData = pickScalars(campos)

    // Verificar que el informe de verificación exista y sea visible (si viene vinculado)
    if (safeData.verificacionId) {
      const exists = await prisma.reporteVerificacion.findUnique({ where: { id: safeData.verificacionId, visible: true }, select: { id: true } })
      if (!exists) safeData.verificacionId = null
    }

    // Número secuencial: DGL-<año de la fecha>-NNN según lo almacenado en BD.
    // Se re-verifica existencia para evitar colisiones con creaciones concurrentes.
    const year = yearFromFecha(safeData.fecha) ?? new Date().getFullYear()
    let numero = await proximoNumeroContrato(prisma, year)
    for (let i = 0; i < 10; i++) {
      const existente = await prisma.contratoCompra.findFirst({ where: { numero }, select: { id: true } })
      if (!existente) break
      numero = await proximoNumeroContrato(prisma, year)
    }

    const contrato = await prisma.contratoCompra.create({
      data: {
        ...safeData,
        numero,
        createdById: session.user.id,
        ...(Array.isArray(partidas) && partidas.length > 0
          ? {
              partidas: {
                create: partidas.map((p, i) => ({
                  producto:       p.producto,
                  especificacion: p.especificacion ?? null,
                  cantidad:       p.cantidad,
                  precioUnitario: p.precioUnitario,
                  total:          p.total ?? null,
                  sortOrder:      i,
                })),
              },
            }
          : {}),
        ...(Array.isArray(pagos) && pagos.length > 0
          ? {
              pagos: {
                create: pagos.map((pg, i) => ({
                  concepto:   pg.concepto,
                  porcentaje: pg.porcentaje,
                  monto:      pg.monto,
                  sortOrder:  i,
                })),
              },
            }
          : {}),
      },
    })

    return NextResponse.json({ ok: true, id: contrato.id })
  } catch (error) {
    console.error('Error creando contrato:', error)
    return NextResponse.json({ error: 'Error al crear' }, { status: 500 })
  }
}
