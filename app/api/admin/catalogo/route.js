import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

// ── Helpers para construir el where ────────────────────────────────────────────
function buildTextFilter(q) {
  if (!q) return {}
  return {
    OR: [
      { nombre: { startsWith: q,        mode: 'insensitive' } },
      { nombre: { contains:   ` ${q}`,  mode: 'insensitive' } },
      { nombre: { contains:   `-${q}`,  mode: 'insensitive' } },
      { descripcion: { contains: q, mode: 'insensitive' } },
      { material:    { contains: q, mode: 'insensitive' } },
      { proveedor:   { contains: q, mode: 'insensitive' } },
      { rubro:       { contains: q, mode: 'insensitive' } },
      { categoria:   { contains: q, mode: 'insensitive' } },
      { subcategoria:{ contains: q, mode: 'insensitive' } },
      { variantes: { some: { codigo:  { contains: q, mode: 'insensitive' } } } },
      { variantes: { some: { medidas: { contains: q, mode: 'insensitive' } } } },
      { variantes: { some: { precio:  { contains: q, mode: 'insensitive' } } } },
    ],
  }
}

function buildWhere({ q, rubro, proveedor, categoria, subcategoria, excludeField }) {
  const filters = {}
  if (rubro        && excludeField !== 'rubro')        filters.rubro        = { equals: rubro,        mode: 'insensitive' }
  if (proveedor    && excludeField !== 'proveedor')    filters.proveedor    = { equals: proveedor,    mode: 'insensitive' }
  if (categoria    && excludeField !== 'categoria')    filters.categoria    = { equals: categoria,    mode: 'insensitive' }
  if (subcategoria && excludeField !== 'subcategoria') filters.subcategoria = { equals: subcategoria, mode: 'insensitive' }
  return { ...filters, ...buildTextFilter(q) }
}

// ── GET — buscar productos en el catálogo (con variantes) ──────────────────────
// ?q=texto&rubro=X&proveedor=Y&categoria=Z&subcategoria=W&page=1&limit=30&facets=1
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // ── Cliente: filtrar por los rubros asignados al usuario ──────────────────
  let rubrosCliente = null
  if (session.user?.role === 'cliente') {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { rubros: true },
    })
    rubrosCliente = user?.rubros ?? []
  }

  const { searchParams } = new URL(req.url)
  const q            = searchParams.get('q')?.trim() ?? ''
  const rubro        = rubrosCliente ? '' : (searchParams.get('rubro') ?? '')  // ignorar filtro manual si es cliente
  const proveedor    = searchParams.get('proveedor')    ?? ''
  const categoria    = searchParams.get('categoria')    ?? ''
  const subcategoria = searchParams.get('subcategoria') ?? ''
  const page         = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit        = Math.min(100, parseInt(searchParams.get('limit') ?? '30'))
  const skip         = (page - 1) * limit
  const facets       = searchParams.get('facets') === '1'

  const ctx = { q, rubro, proveedor, categoria, subcategoria }
  const where = buildWhere(ctx)

  // Si es cliente, forzar filtro por sus rubros asignados
  if (rubrosCliente !== null) {
    if (rubrosCliente.length === 0) {
      // Sin rubros asignados → no ve nada
      return NextResponse.json({ total: 0, page: 1, pages: 0, productos: [], facets: facets ? { rubros: [], proveedores: [], categorias: [], subcategorias: [] } : undefined })
    }
    where.rubro = { in: rubrosCliente, mode: 'insensitive' }
  }

  const queries = [
    prisma.productoCatalogo.count({ where }),
    prisma.productoCatalogo.findMany({
      where,
      orderBy: [{ rubro: 'asc' }, { proveedor: 'asc' }, { nombre: 'asc' }],
      skip,
      take: limit,
      include: {
        variantes: {
          orderBy: { createdAt: 'asc' },
        },
        supplier: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
  ]

  // Si se piden facets, agregamos groupBy para cada campo
  if (facets) {
    // proveedor es requerido (NOT NULL); rubro/categoria/subcategoria son nullable
    const facetFields = [
      { field: 'rubro',        nullable: true },
      { field: 'proveedor',    nullable: false },
      { field: 'categoria',    nullable: true },
      { field: 'subcategoria', nullable: true },
    ]
    for (const { field, nullable } of facetFields) {
      const facetWhere = buildWhere({ ...ctx, excludeField: field })
      queries.push(
        prisma.productoCatalogo.groupBy({
          by: [field],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          where: nullable
            ? { ...facetWhere, [field]: { not: null } }
            : facetWhere,
        })
      )
    }
  }

  const results = await Promise.all(queries)
  const total = results[0]
  const productos = results[1]

  const resp = { total, page, pages: Math.ceil(total / limit), productos }

  if (facets) {
    const [rubros, proveedores, categorias, subcategorias] = results.slice(2)
    resp.facets = { rubros, proveedores, categorias, subcategorias }
  }

  return NextResponse.json(resp)
}

// ── DELETE — eliminar un producto por id (cascade elimina variantes) ───────────
export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  await prisma.productoCatalogo.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
