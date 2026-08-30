import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

// ── GET — buscar cliente por cédula/RIF o listar todos ────────────────────────
// ?cedula=X   → lookup exacto (para el auto-completado del formulario)
// ?q=texto    → búsqueda parcial
// ?page=1&limit=30
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cedula = searchParams.get('cedula')?.trim()
  const q      = searchParams.get('q')?.trim()
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = Math.min(100, parseInt(searchParams.get('limit') ?? '30'))

  // Lookup exacto por cédula — para el auto-completado
  if (cedula) {
    const cliente = await prisma.cliente.findUnique({
      where: { cedulaRif: cedula },
      include: {
        grupo: { select: { id: true, nombre: true } },
        _count: { select: { solicitudes: true, contratos: true } },
      },
    })
    return NextResponse.json({ cliente: cliente ?? null })
  }

  // Listado / búsqueda general
  const where = q ? {
    OR: [
      { cedulaRif:    { contains: q, mode: 'insensitive' } },
      { razonSocial:  { contains: q, mode: 'insensitive' } },
      { ciudad:       { contains: q, mode: 'insensitive' } },
      { contactoEmail:{ contains: q, mode: 'insensitive' } },
    ],
  } : {}

  const [total, clientes] = await Promise.all([
    prisma.cliente.count({ where }),
    prisma.cliente.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip:  (page - 1) * limit,
      take:  limit,
      include: {
        grupo: { select: { id: true, nombre: true } },
        _count: { select: { solicitudes: true, contratos: true } },
      },
    }),
  ])

  return NextResponse.json({ total, page, pages: Math.ceil(total / limit), clientes })
}

// ── POST — crear / actualizar cliente (upsert por cédula/RIF) ─────────────────
// Whitelist de campos editables (previene mass assignment)
const CAMPOS_CLIENTE = [
  'razonSocial', 'nombreComercial', 'ciudad', 'direccion', 'pais',
  'sectorIndustria', 'canalComercializacion',
  'contactoNombre', 'contactoCargo', 'contactoTelefono', 'contactoEmail',
  'representanteLegal', 'representanteCargo',
  'grupoId', // grupo empresarial al que pertenece (null lo desvincula)
]

function pickCampos(body) {
  const out = {}
  for (const k of CAMPOS_CLIENTE) {
    if (body[k] === undefined) continue
    out[k] = body[k] === '' ? null : body[k]
  }
  return out
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { cedulaRif } = body

    if (!cedulaRif?.trim()) return NextResponse.json({ error: 'Cédula/RIF es requerido' }, { status: 400 })
    if (!body.razonSocial?.trim()) return NextResponse.json({ error: 'Razón social es requerida' }, { status: 400 })

    const datos = pickCampos(body)

    // Si se asigna a un grupo empresarial, validar que exista
    if (datos.grupoId) {
      const grupo = await prisma.grupoEmpresarial.findUnique({ where: { id: datos.grupoId } })
      if (!grupo) return NextResponse.json({ error: 'Grupo empresarial no encontrado' }, { status: 404 })
    }

    const cliente = await prisma.cliente.upsert({
      where:  { cedulaRif: cedulaRif.trim() },
      update: { ...datos, updatedAt: new Date() },
      create: { cedulaRif: cedulaRif.trim(), ...datos },
    })

    return NextResponse.json({ ok: true, cliente })
  } catch (err) {
    console.error('Error creando cliente:', err)
    return NextResponse.json({ error: err.message ?? 'Error al crear cliente' }, { status: 500 })
  }
}
