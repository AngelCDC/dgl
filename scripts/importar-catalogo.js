/**
 * Script de importación inicial del catálogo de productos (formato 2 hojas).
 *
 * El archivo Excel debe tener 2 hojas:
 *   "Productos": ID_Producto | Proveedor | Archivo_PDF | Nombre_Producto | Rubro | Categoría | Subcategoría | Descripción | Material
 *   "Variantes": ID_Variante | ID_Producto | Código | Medidas | Unidad | Precio
 *
 * Uso:
 *   node scripts/importar-catalogo.js <ruta-al-excel> [reemplazar]
 *
 * Ejemplos:
 *   node scripts/importar-catalogo.js "C:/Users/itach/Downloads/VEHICULOS/base_datos_productos.xlsx"
 *   node scripts/importar-catalogo.js "C:/Users/itach/Downloads/VEHICULOS/base_datos_productos.xlsx" reemplazar
 */

require('dotenv').config()
const XLSX   = require('xlsx')
const path   = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const filePath = process.argv[2]
  const modo     = process.argv[3] === 'reemplazar' ? 'reemplazar' : 'agregar'

  if (!filePath) {
    console.error('❌  Debes indicar la ruta al archivo Excel.')
    console.error('    Uso: node scripts/importar-catalogo.js <ruta-excel> [reemplazar]')
    process.exit(1)
  }

  const absPath = path.resolve(filePath)
  console.log(`\n📂  Leyendo: ${absPath}`)
  console.log(`🔧  Modo: ${modo}`)

  // ── Leer Excel ──────────────────────────────────────────────────────────────
  const wb = XLSX.readFile(absPath)

  // Validar hojas
  if (!wb.SheetNames.includes('Productos')) {
    console.error('❌  No se encontró la hoja "Productos" en el archivo.')
    process.exit(1)
  }
  if (!wb.SheetNames.includes('Variantes')) {
    console.error('❌  No se encontró la hoja "Variantes" en el archivo.')
    process.exit(1)
  }

  // Leer hoja Productos
  const wsProd  = wb.Sheets['Productos']
  const rowsProd = XLSX.utils.sheet_to_json(wsProd, { header: 1, defval: null })

  // Leer hoja Variantes
  const wsVar   = wb.Sheets['Variantes']
  const rowsVar = XLSX.utils.sheet_to_json(wsVar, { header: 1, defval: null })

  if (rowsProd.length < 2) {
    console.error('❌  La hoja "Productos" no contiene datos.')
    process.exit(1)
  }
  if (rowsVar.length < 2) {
    console.error('❌  La hoja "Variantes" no contiene datos.')
    process.exit(1)
  }

  // ── Detectar columnas en Productos ─────────────────────────────────────────
  const hProd = rowsProd[0].map(h => (h ?? '').toString().trim().toLowerCase())
  console.log(`\n📋  Encabezados "Productos" (${hProd.length}):`, hProd)

  const colProd = (...nombres) => {
    for (const n of nombres) {
      const i = hProd.findIndex(h => h.includes(n))
      if (i !== -1) return i
    }
    return -1
  }

  const iPId        = colProd('id_producto')
  const iPProveedor = colProd('proveedor')
  const iPPdf       = colProd('pdf', 'archivo')
  const iPNombre    = colProd('nombre_producto', 'nombre')
  const iPRubro     = colProd('rubro')
  const iPCategoria = colProd('categor')
  const iPSubcat    = colProd('subcategor')
  const iPDesc      = colProd('descrip')
  const iPMaterial  = colProd('material')

  if (iPNombre === -1 || iPProveedor === -1) {
    console.error('\n❌  No se encontraron las columnas obligatorias en "Productos": Proveedor y Nombre_Producto.')
    process.exit(1)
  }

  // ── Detectar columnas en Variantes ─────────────────────────────────────────
  const hVar = rowsVar[0].map(h => (h ?? '').toString().trim().toLowerCase())
  console.log(`\n📋  Encabezados "Variantes" (${hVar.length}):`, hVar)

  const colVar = (...nombres) => {
    for (const n of nombres) {
      const i = hVar.findIndex(h => h.includes(n))
      if (i !== -1) return i
    }
    return -1
  }

  const iVIdProd  = colVar('id_producto')
  const iVCodigo  = colVar('código', 'codigo', 'code')
  const iVMedidas = colVar('medidas', 'dimension', 'size')
  const iVUnidad  = colVar('unidad', 'unit')
  const iVPrecio  = colVar('precio', 'price')

  if (iVIdProd === -1) {
    console.error('\n❌  No se encontró la columna "ID_Producto" en "Variantes".')
    process.exit(1)
  }

  // ── Mostrar mapeo ──────────────────────────────────────────────────────────
  console.log('\n🗺️  Mapeo de columnas (Productos):')
  const colMapP = { ID_Producto: iPId, Proveedor: iPProveedor, PDF: iPPdf, Nombre: iPNombre,
                    Rubro: iPRubro, Categoría: iPCategoria, Subcategoría: iPSubcat,
                    Descripción: iPDesc, Material: iPMaterial }
  Object.entries(colMapP).forEach(([k, v]) => console.log(`   ${k}: columna ${v >= 0 ? v + 1 : 'no encontrada'}`))

  console.log('\n🗺️  Mapeo de columnas (Variantes):')
  const colMapV = { ID_Producto: iVIdProd, Código: iVCodigo, Medidas: iVMedidas,
                    Unidad: iVUnidad, Precio: iVPrecio }
  Object.entries(colMapV).forEach(([k, v]) => console.log(`   ${k}: columna ${v >= 0 ? v + 1 : 'no encontrada'}`))

  // ── Parsear productos ──────────────────────────────────────────────────────
  const str = (v) => (v ?? '').toString().trim() || null

  const productos = rowsProd.slice(1)
    .filter(r => r[iPProveedor] || r[iPNombre])
    .map(r => ({
      idExcel:     iPId >= 0 ? parseInt(r[iPId]) : null,
      proveedor:   (r[iPProveedor] ?? '').toString().trim(),
      archivoPdf:  iPPdf       >= 0 ? str(r[iPPdf])       : null,
      nombre:      (r[iPNombre] ?? '').toString().trim(),
      rubro:       iPRubro     >= 0 ? str(r[iPRubro])     : null,
      categoria:   iPCategoria >= 0 ? str(r[iPCategoria]) : null,
      subcategoria:iPSubcat    >= 0 ? str(r[iPSubcat])    : null,
      descripcion: iPDesc      >= 0 ? str(r[iPDesc])      : null,
      material:    iPMaterial  >= 0 ? str(r[iPMaterial])  : null,
    }))
    .filter(p => p.nombre && p.proveedor)

  console.log(`\n✅  Productos válidos: ${productos.length} de ${rowsProd.length - 1}`)

  // ── Parsear variantes y agrupar ────────────────────────────────────────────
  const variantesRaw = rowsVar.slice(1)
    .filter(r => r[iVIdProd] != null)
    .map(r => ({
      idProductoExcel: parseInt(r[iVIdProd]),
      codigo:          iVCodigo  >= 0 ? str(r[iVCodigo])  : null,
      medidas:         iVMedidas >= 0 ? str(r[iVMedidas]) : null,
      unidad:          iVUnidad  >= 0 ? str(r[iVUnidad])  : null,
      precio:          iVPrecio  >= 0 ? str(r[iVPrecio])  : null,
    }))

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

  console.log(`✅  Variantes totales: ${variantesRaw.length}`)
  console.log(`✅  Productos con variantes: ${variantesPorProducto.size}`)

  // ── Proveedores únicos ────────────────────────────────────────────────────
  const proveedores = [...new Set(productos.map(r => r.proveedor))]
  console.log(`\n🏭  Proveedores (${proveedores.length}):`)
  proveedores.forEach(p => console.log(`   · ${p}`))

  // ── Importar ───────────────────────────────────────────────────────────────
  console.log('\n💾  Iniciando importación (puede tardar unos segundos)...')

  let totalInsertados = 0
  let totalVariantes  = 0

  await prisma.$transaction(async (tx) => {
    if (modo === 'reemplazar') {
      const del = await tx.productoCatalogo.deleteMany()
      console.log(`   🗑️  Eliminados ${del.count} productos existentes (y sus variantes en cascada)`)
    }

    // Insertar productos uno por uno para obtener el UUID
    const idMap = new Map()
    for (const p of productos) {
      const created = await tx.productoCatalogo.create({
        data: {
          proveedor:    p.proveedor,
          archivoPdf:   p.archivoPdf,
          nombre:       p.nombre,
          rubro:        p.rubro,
          categoria:    p.categoria,
          subcategoria: p.subcategoria,
          descripcion:  p.descripcion,
          material:     p.material,
        },
      })
      totalInsertados++
      if (p.idExcel != null) {
        idMap.set(p.idExcel, created.id)
      }
      process.stdout.write(`\r   ⏳ ${totalInsertados}/${productos.length} productos...`)
    }

    console.log('')

    // Insertar variantes en batch
    const variantesDb = []
    for (const [idExcel, variantes] of variantesPorProducto) {
      const productoId = idMap.get(idExcel)
      if (!productoId) continue
      for (const v of variantes) {
        variantesDb.push({ productoId, ...v })
      }
    }

    const BATCH = 500
    for (let i = 0; i < variantesDb.length; i += BATCH) {
      const lote = variantesDb.slice(i, i + BATCH)
      const res  = await tx.varianteCatalogo.createMany({ data: lote })
      totalVariantes += res.count
      process.stdout.write(`\r   ⏳ ${totalVariantes}/${variantesDb.length} variantes...`)
    }
  }, { timeout: 120000 })

  console.log(`\n\n🎉  Importación completada:`)
  console.log(`    📦 ${totalInsertados} productos insertados`)
  console.log(`    🔀 ${totalVariantes} variantes insertadas`)
  console.log(`    🏭 ${proveedores.length} proveedores\n`)
}

main()
  .catch(e => { console.error('\n❌  Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
