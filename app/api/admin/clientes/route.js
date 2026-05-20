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
        _count: { select: { solicitudes: true } },
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
      include: { _count: { select: { solicitudes: true } } },
    }),
  ])

  return NextResponse.json({ total, page, pages: Math.ceil(total / limit), clientes })
}

// ── POST — crear cliente manualmente ──────────────────────────────────────────
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { cedulaRif, razonSocial, ...rest } = body

    if (!cedulaRif?.trim()) return NextResponse.json({ error: 'Cédula/RIF es requerido' }, { status: 400 })
    if (!razonSocial?.trim()) return NextResponse.json({ error: 'Razón social es requerida' }, { status: 400 })

    const cliente = await prisma.cliente.upsert({
      where:  { cedulaRif: cedulaRif.trim() },
      update: { razonSocial: razonSocial.trim(), ...rest, updatedAt: new Date() },
      create: { cedulaRif: cedulaRif.trim(), razonSocial: razonSocial.trim(), ...rest },
    })

    return NextResponse.json({ ok: true, cliente })
  } catch (err) {
    console.error('Error creando cliente:', err)
    return NextResponse.json({ error: err.message ?? 'Error al crear cliente' }, { status: 500 })
  }
}
