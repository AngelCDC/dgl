const fs = require('fs')
const path = require('path')

const files = [
  'app/page.js',
  'app/components/Sidebar.js',
  'app/articulos/page.js',
  'app/articulos/[slug]/page.js',
  'app/proveedores/page.js',
  'app/proveedores/[slug]/page.js',
  'app/directorio/page.js',
  'app/admin/page.js',
  'app/admin/adquisiciones/page.js',
  'app/admin/articulos/page.js',
  'app/admin/articulos/nuevo/page.js',
  'app/admin/articulos/[id]/page.js',
  'app/admin/proveedores/page.js',
  'app/admin/proveedores/nuevo/page.js',
  'app/admin/proveedores/[id]/page.js',
  'app/admin/solicitudes/page.js',
  'app/admin/solicitudes/[id]/page.js',
  'app/api/contacto/route.js',
  'app/api/search/route.js',
  'app/api/auth/[...nextauth]/route.js',
  'app/api/admin/articulos/route.js',
  'app/api/admin/articulos/[id]/route.js',
  'app/api/admin/adquisiciones/[id]/route.js',
  'app/api/admin/adquisiciones/[id]/pdf/route.js',
  'app/api/admin/procura/Inicial/route.js',
  'app/api/admin/procura/Inicial/[id]/route.js',
  'app/api/admin/proveedores/route.js',
  'app/api/admin/proveedores/[id]/route.js',
  'app/api/admin/solicitudes/adquisicion/route.js',
  'app/api/admin/solicitudes/inicial/route.js',
]

const root = path.join(__dirname, '..')
let changed = 0

for (const rel of files) {
  const fullPath = path.join(root, rel)
  if (!fs.existsSync(fullPath)) {
    console.log(`  SKIP (no existe): ${rel}`)
    continue
  }

  let src = fs.readFileSync(fullPath, 'utf8')
  const original = src

  // Quitar import de PrismaClient (import o require, con o sin llaves)
  src = src.replace(/^import\s*\{?\s*PrismaClient\s*\}?\s*from\s*['"]@prisma\/client['"]\s*\n/m, '')
  src = src.replace(/^const\s*\{\s*PrismaClient\s*\}\s*=\s*require\(['"]@prisma\/client['"]\)\s*\n/m, '')

  // Quitar const prisma = new PrismaClient(...)
  src = src.replace(/^const\s+prisma\s*=\s*new\s+PrismaClient\([^)]*\)\s*\n/m, '')

  // Añadir import del singleton al inicio (después de 'use client' si existe)
  const hasSingleton = src.includes("from '@/app/lib/prisma'")
  if (!hasSingleton && src !== original) {
    if (src.startsWith("'use client'")) {
      src = src.replace("'use client'\n", "'use client'\nimport prisma from '@/app/lib/prisma'\n")
    } else {
      src = 'import prisma from \'@/app/lib/prisma\'\n' + src
    }
  }

  if (src !== original) {
    fs.writeFileSync(fullPath, src, 'utf8')
    console.log(`  ✓ ${rel}`)
    changed++
  } else {
    console.log(`  — sin cambios: ${rel}`)
  }
}

console.log(`\nTotal modificados: ${changed}/${files.length}`)
