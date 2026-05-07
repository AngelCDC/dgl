import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import * as XLSX from 'xlsx'

// ── POST — importar productos desde un archivo Excel ──────────────────────────
// Body: FormData con campo "file" (xlsx)
// ?modo=reemplazar → borra todo antes de importar
// ?modo=agregar    → agrega sin borrar (default)
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const url  = new URL(req.url)
    const modo = url.searchParams.get('modo') ?? 'agregar'

    const formData = await req.formData()
    const file     = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }

    const buffer    = Buffer.from(await file.arrayBuffer())
    const workbook  = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet     = workbook.Sheets[sheetName]
    const rows      = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

    if (rows.length < 2) {
      return NextResponse.json({ error: 'El archivo está vacío o no tiene datos' }, { status: 400 })
    }

    // Detectar columnas por encabezado (tolerante a variaciones de nombre)
    const headers = rows[0].map(h => (h ?? '').toString().trim().toLowerCase())

    const col = (...nombres) => {
      for (const n of nombres) {
        const i = headers.findIndex(h => h.includes(n))
        if (i !== -1) return i
      }
      return -1
    }

    const iProveedor    = col('proveedor')
    const iPdf          = col('pdf', 'archivo')
    const iNombre       = col('nombre_producto', 'nombre')
    const iRubro        = col('rubro')                            // ← NUEVO (nivel 1)
    const iCategoria    = col('categor')                          // nivel 2
    const iSubcategoria = col('subcategor')                       // nivel 3
    const iDescripcion  = col('descrip')
    const iCodigo       = col('código', 'codigo', 'code')
    const iUnidad       = col('unidad', 'unit')
    const iPrecio       = col('precio', 'price')
    const iMaterial     = col('material')
    const iMedidas      = col('medidas', 'dimension', 'size')

    if (iNombre === -1 || iProveedor === -1) {
      return NextResponse.json({
        error: 'No se encontraron las columnas obligatorias: Proveedor y Nombre_Producto',
      }, { status: 400 })
    }

    const str = (v) => (v ?? '').toString().trim() || null

    const registros = rows.slice(1)
      .filter(r => r[iProveedor] || r[iNombre])
      .map(r => ({
        proveedor:    (r[iProveedor] ?? '').toString().trim(),
        archivoPdf:   iPdf          >= 0 ? str(r[iPdf])          : null,
        nombre:       (r[iNombre]   ?? '').toString().trim(),
        rubro:        iRubro        >= 0 ? str(r[iRubro])        : null,
        categoria:    iCategoria    >= 0 ? str(r[iCategoria])    : null,
        subcategoria: iSubcategoria >= 0 ? str(r[iSubcategoria]) : null,
        descripcion:  iDescripcion  >= 0 ? str(r[iDescripcion])  : null,
        codigo:       iCodigo       >= 0 ? str(r[iCodigo])       : null,
        unidad:       iUnidad       >= 0 ? str(r[iUnidad])       : null,
        precio:       iPrecio       >= 0 ? str(r[iPrecio])       : null,
        material:     iMaterial     >= 0 ? str(r[iMaterial])     : null,
        medidas:      iMedidas      >= 0 ? str(r[iMedidas])      : null,
      }))
      .filter(r => r.nombre && r.proveedor)

    if (registros.length === 0) {
      return NextResponse.json({ error: 'No se encontraron filas válidas en el archivo' }, { status: 400 })
    }

    // Detectar si el archivo tiene columna Rubro para informar al usuario
    const tieneRubro = iRubro >= 0

    let insertados = 0
    await prisma.$transaction(async (tx) => {
      if (modo === 'reemplazar') {
        await tx.productoCatalogo.deleteMany()
      }
      const BATCH = 500
      for (let i = 0; i < registros.length; i += BATCH) {
        const lote = registros.slice(i, i + BATCH)
        const res  = await tx.productoCatalogo.createMany({ data: lote, skipDuplicates: false })
        insertados += res.count
      }
    }, { timeout: 60000 })

    return NextResponse.json({
      ok: true,
      modo,
      total:      registros.length,
      insertados,
      tieneRubro,   // indica al cliente si el archivo tenía columna Rubro
    })

  } catch (err) {
    console.error('Error importando catálogo:', err)
    return NextResponse.json({ error: err.message ?? 'Error al importar' }, { status: 500 })
  }
}

// ── GET — estadísticas del catálogo ───────────────────────────────────────────
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [total, porRubro, porProveedor, porCategoria] = await Promise.all([
    prisma.productoCatalogo.count(),
    prisma.productoCatalogo.groupBy({
      by: ['rubro'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      where: { rubro: { not: null } },
    }),
    prisma.productoCatalogo.groupBy({
      by: ['proveedor'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.productoCatalogo.groupBy({
      by: ['categoria'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      where: { categoria: { not: null } },
    }),
  ])

  return NextResponse.json({ total, porRubro, porProveedor, porCategoria })
}
