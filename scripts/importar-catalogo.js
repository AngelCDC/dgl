/**
 * Script de importación inicial del catálogo de productos.
 *
 * Uso:
 *   node scripts/importar-catalogo.js <ruta-al-excel> [reemplazar]
 *
 * Ejemplos:
 *   node scripts/importar-catalogo.js "C:/Users/itach/Downloads/Muebleria/base_datos_Muebleria.xlsx"
 *   node scripts/importar-catalogo.js "C:/Users/itach/Downloads/Muebleria/base_datos_Muebleria.xlsx" reemplazar
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
  const wb        = XLSX.readFile(absPath)
  const sheetName = wb.SheetNames[0]
  const ws        = wb.Sheets[sheetName]
  const rows      = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  if (rows.length < 2) {
    console.error('❌  El archivo no contiene datos.')
    process.exit(1)
  }

  // ── Detectar columnas ────────────────────────────────────────────────────────
  const headers = rows[0].map(h => (h ?? '').toString().trim().toLowerCase())
  console.log(`\n📋  Encabezados detectados (${headers.length}):`, headers)

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
  const iRubro        = col('rubro')                           // ← nivel 1
  const iCategoria    = col('categor')                         // nivel 2
  const iSubcategoria = col('subcategor')                      // nivel 3
  const iDescripcion  = col('descrip')
  const iCodigo       = col('código', 'codigo', 'code')
  const iUnidad       = col('unidad', 'unit')
  const iPrecio       = col('precio', 'price')
  const iMaterial     = col('material')
  const iMedidas      = col('medidas', 'dimension', 'size')

  console.log('\n🗺️  Mapeo de columnas:')
  const colMap = { Proveedor: iProveedor, PDF: iPdf, Nombre: iNombre, Rubro: iRubro,
                   Categoría: iCategoria, Subcategoría: iSubcategoria, Descripción: iDescripcion,
                   Código: iCodigo, Unidad: iUnidad, Precio: iPrecio, Material: iMaterial, Medidas: iMedidas }
  Object.entries(colMap).forEach(([k, v]) => console.log(`   ${k}: columna ${v >= 0 ? v + 1 : 'no encontrada'}`))

  if (iProveedor === -1 || iNombre === -1) {
    console.error('\n❌  No se encontraron las columnas obligatorias: Proveedor y Nombre_Producto.')
    process.exit(1)
  }

  // ── Construir registros ──────────────────────────────────────────────────────
  const str = (v) => (v ?? '').toString().trim() || null

  const registros = rows.slice(1)
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

  console.log(`\n✅  Filas válidas: ${registros.length} de ${rows.length - 1} en el Excel`)

  // ── Proveedores únicos en el archivo ────────────────────────────────────────
  const proveedores = [...new Set(registros.map(r => r.proveedor))]
  console.log(`\n🏭  Proveedores (${proveedores.length}):`)
  proveedores.forEach(p => console.log(`   · ${p}`))

  // ── Insertar en la base de datos ─────────────────────────────────────────────
  console.log('\n💾  Iniciando importación...')

  if (modo === 'reemplazar') {
    const del = await prisma.productoCatalogo.deleteMany()
    console.log(`   🗑️  Eliminados ${del.count} productos existentes`)
  }

  const BATCH   = 500
  let insertados = 0
  for (let i = 0; i < registros.length; i += BATCH) {
    const lote = registros.slice(i, i + BATCH)
    const res  = await prisma.productoCatalogo.createMany({ data: lote })
    insertados += res.count
    process.stdout.write(`\r   ⏳ ${insertados}/${registros.length} importados...`)
  }

  console.log(`\n\n🎉  Importación completada: ${insertados} productos insertados.\n`)
}

main()
  .catch(e => { console.error('\n❌  Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
