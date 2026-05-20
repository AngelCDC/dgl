import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

// ── GET — buscar productos en el catálogo ─────────────────────────────────────
// ?q=texto&rubro=X&proveedor=Y&categoria=Z&subcategoria=W&page=1&limit=30
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q            = searchParams.get('q')?.trim() ?? ''
  const rubro        = searchParams.get('rubro')        ?? ''
  const proveedor    = searchParams.get('proveedor')    ?? ''
  const categoria    = searchParams.get('categoria')    ?? ''
  const subcategoria = searchParams.get('subcategoria') ?? ''
  const page         = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit        = Math.min(100, parseInt(searchParams.get('limit') ?? '30'))
  const skip         = (page - 1) * limit

  const where = {
    ...(rubro        ? { rubro:        { equals: rubro,        mode: 'insensitive' } } : {}),
    ...(proveedor    ? { proveedor:    { equals: proveedor,    mode: 'insensitive' } } : {}),
    ...(categoria    ? { categoria:    { equals: categoria,    mode: 'insensitive' } } : {}),
    ...(subcategoria ? { subcategoria: { equals: subcategoria, mode: 'insensitive' } } : {}),
    ...(q ? {
      OR: [
        // nombre: solo coincide si la query está al inicio del nombre
        // o al inicio de una palabra dentro del nombre (separada por espacio o guión)
        { nombre: { startsWith: q,        mode: 'insensitive' } },
        { nombre: { contains:   ` ${q}`,  mode: 'insensitive' } },
        { nombre: { contains:   `-${q}`,  mode: 'insensitive' } },
        // resto de campos: contains libre (código, descripción, etc.)
        { codigo:      { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
        { material:    { contains: q, mode: 'insensitive' } },
        { medidas:     { contains: q, mode: 'insensitive' } },
        { proveedor:   { contains: q, mode: 'insensitive' } },
        { rubro:       { contains: q, mode: 'insensitive' } },
        { categoria:   { contains: q, mode: 'insensitive' } },
        { subcategoria:{ contains: q, mode: 'insensitive' } },
      ],
    } : {}),
  }

  const [total, productos] = await Promise.all([
    prisma.productoCatalogo.count({ where }),
    prisma.productoCatalogo.findMany({
      where,
      orderBy: [{ rubro: 'asc' }, { proveedor: 'asc' }, { nombre: 'asc' }],
      skip,
      take: limit,
    }),
  ])

  return NextResponse.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    productos,
  })
}

// ── DELETE — eliminar un producto por id ──────────────────────────────────────
export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  await prisma.productoCatalogo.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
