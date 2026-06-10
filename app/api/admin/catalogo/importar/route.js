import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import * as XLSX from 'xlsx'

// ── POST — importar productos y variantes desde un archivo Excel (2 hojas) ─────
// Body: FormData con campo "file" (xlsx)
// ?modo=reemplazar → borra todo antes de importar
// ?modo=agregar    → agrega sin borrar (default)
//
// El Excel debe tener 2 hojas:
//   "Productos": ID_Producto | Proveedor | Archivo_PDF | Nombre_Producto | Rubro | Categoría | Subcategoría | Descripción | Material
//   "Variantes": ID_Variante | ID_Producto | Código | Medidas | Unidad | Precio
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

    // ── Leer hoja "Productos" ──────────────────────────────────────────────────
    const sheetProd = workbook.Sheets['Productos']
    if (!sheetProd) {
      return NextResponse.json({ error: 'No se encontró la hoja "Productos" en el archivo' }, { status: 400 })
    }
    const rowsProd  = XLSX.utils.sheet_to_json(sheetProd, { header: 1, defval: null })
    if (rowsProd.length < 2) {
      return NextResponse.json({ error: 'La hoja "Productos" está vacía' }, { status: 400 })
    }

    // ── Leer hoja "Variantes" ──────────────────────────────────────────────────
    const sheetVar = workbook.Sheets['Variantes']
    if (!sheetVar) {
      return NextResponse.json({ error: 'No se encontró la hoja "Variantes" en el archivo' }, { status: 400 })
    }
    const rowsVar  = XLSX.utils.sheet_to_json(sheetVar, { header: 1, defval: null })
    if (rowsVar.length < 2) {
      return NextResponse.json({ error: 'La hoja "Variantes" está vacía' }, { status: 400 })
    }

    // ── Detectar columnas en Productos ─────────────────────────────────────────
    const hProd = rowsProd[0].map(h => (h ?? '').toString().trim().toLowerCase())

    const colProd = (...nombres) => {
      for (const n of nombres) {
        const i = hProd.findIndex(h => h.includes(n))
        if (i !== -1) return i
      }
      return -1
    }

    const iProdId        = colProd('id_producto')
    const iProdProveedor = colProd('proveedor')
    const iProdPdf       = colProd('pdf', 'archivo')
    const iProdNombre    = colProd('nombre_producto', 'nombre')
    const iProdRubro     = colProd('rubro')
    const iProdCategoria = colProd('categor')          // "categoría" o "categoria"
    const iProdSubcat    = colProd('subcategor')       // "subcategoría" o "subcategoria"
    const iProdDesc      = colProd('descrip')
    const iProdMaterial  = colProd('material')

    if (iProdNombre === -1 || iProdProveedor === -1) {
      return NextResponse.json({
        error: 'No se encontraron las columnas obligatorias en "Productos": Proveedor y Nombre_Producto',
      }, { status: 400 })
    }

    // ── Detectar columnas en Variantes ─────────────────────────────────────────
    const hVar = rowsVar[0].map(h => (h ?? '').toString().trim().toLowerCase())

    const colVar = (...nombres) => {
      for (const n of nombres) {
        const i = hVar.findIndex(h => h.includes(n))
        if (i !== -1) return i
      }
      return -1
    }

    const iVarIdProd  = colVar('id_producto')
    const iVarCodigo  = colVar('código', 'codigo', 'code')
    const iVarMedidas = colVar('medidas', 'dimension', 'size')
    const iVarUnidad  = colVar('unidad', 'unit')
    const iVarPrecio  = colVar('precio', 'price')

    if (iVarIdProd === -1) {
      return NextResponse.json({
        error: 'No se encontró la columna "ID_Producto" en la hoja "Variantes"',
      }, { status: 400 })
    }

    // ── Parsear productos ──────────────────────────────────────────────────────
    const str = (v) => (v ?? '').toString().trim() || null

    const productos = rowsProd.slice(1)
      .filter(r => r[iProdProveedor] || r[iProdNombre])
      .map(r => ({
        idExcel:     iProdId >= 0 ? parseInt(r[iProdId]) : null,  // ID original del Excel
        proveedor:   (r[iProdProveedor] ?? '').toString().trim(),
        archivoPdf:  iProdPdf       >= 0 ? str(r[iProdPdf])       : null,
        nombre:      (r[iProdNombre] ?? '').toString().trim(),
        rubro:       iProdRubro     >= 0 ? str(r[iProdRubro])     : null,
        categoria:   iProdCategoria >= 0 ? str(r[iProdCategoria]) : null,
        subcategoria:iProdSubcat    >= 0 ? str(r[iProdSubcat])    : null,
        descripcion: iProdDesc      >= 0 ? str(r[iProdDesc])      : null,
        material:    iProdMaterial  >= 0 ? str(r[iProdMaterial])  : null,
        // Reservamos espacio para el UUID que asignará la BD
        _variantes: [],
      }))
      .filter(p => p.nombre && p.proveedor)

    if (productos.length === 0) {
      return NextResponse.json({ error: 'No se encontraron productos válidos en el archivo' }, { status: 400 })
    }

    // ── Parsear variantes y agruparlas por ID_Producto ─────────────────────────
    const variantesRaw = rowsVar.slice(1)
      .filter(r => r[iVarIdProd] != null)
      .map(r => ({
        idProductoExcel: parseInt(r[iVarIdProd]),
        codigo:          iVarCodigo  >= 0 ? str(r[iVarCodigo])  : null,
        medidas:         iVarMedidas >= 0 ? str(r[iVarMedidas]) : null,
        unidad:          iVarUnidad  >= 0 ? str(r[iVarUnidad])  : null,
        precio:          iVarPrecio  >= 0 ? str(r[iVarPrecio])  : null,
      }))

    // Indexar variantes por ID_Producto del Excel
    const variantesPorProducto = new Map()
    for (const v of variantesRaw) {
      if (!variantesPorProducto.has(v.idProductoExcel)) {
        variantesPorProducto.set(v.idProductoExcel, [])
      }
      variantesPorProducto.get(v.idProductoExcel).push({
        codigo:  v.codigo,
        medidas: v.medidas,
        unidad:  v.unidad,
        precio:  v.precio,
      })
    }

    // Pre-cargar proveedores del directorio para vincular por nombre
    const suppliers = await prisma.supplier.findMany({ select: { id: true, name: true } })
    const supplierMap = new Map()
    for (const s of suppliers) {
      supplierMap.set(s.name.trim().toLowerCase(), s.id)
    }

    let totalVariantes = 0
    await prisma.$transaction(async (tx) => {
      if (modo === 'reemplazar') {
        // Cascade elimina variantes automáticamente
        await tx.productoCatalogo.deleteMany()
      }

      const BATCH = 500

      // Insertar productos en lotes, guardando el mapeo idExcel → uuid
      const idMap = new Map()  // idExcel → uuid de la BD
      for (let i = 0; i < productos.length; i += BATCH) {
        const lote = productos.slice(i, i + BATCH)
        for (const p of lote) {
          const normalizedName = p.proveedor.trim().toLowerCase()
          const created = await tx.productoCatalogo.create({
            data: {
              proveedor:    p.proveedor,
              supplierId:   supplierMap.get(normalizedName) ?? null,
              archivoPdf:   p.archivoPdf,
              nombre:       p.nombre,
              rubro:        p.rubro,
              categoria:    p.categoria,
              subcategoria: p.subcategoria,
              descripcion:  p.descripcion,
              material:     p.material,
            },
          })
          if (p.idExcel != null) {
            idMap.set(p.idExcel, created.id)
          }
        }
      }

      // Insertar variantes en lotes
      const variantesDb = []
      for (const [idExcel, variantes] of variantesPorProducto) {
        const productoId = idMap.get(idExcel)
        if (!productoId) continue  // variante huérfana, ignorar
        for (const v of variantes) {
          variantesDb.push({ productoId, ...v })
        }
      }

      for (let i = 0; i < variantesDb.length; i += BATCH) {
        const lote = variantesDb.slice(i, i + BATCH)
        const res   = await tx.varianteCatalogo.createMany({ data: lote })
        totalVariantes += res.count
      }
    }, { timeout: 120000 })

    return NextResponse.json({
      ok: true,
      modo,
      totalProductos:  productos.length,
      totalVariantes,
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

  const [total, totalVariantes, porRubro, porProveedor, porCategoria] = await Promise.all([
    prisma.productoCatalogo.count(),
    prisma.varianteCatalogo.count(),
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

  return NextResponse.json({ total, totalVariantes, porRubro, porProveedor, porCategoria })
}
