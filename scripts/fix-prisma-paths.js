const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

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

const prismaLib = path.join(root, 'app', 'lib', 'prisma')

for (const rel of files) {
  const fullPath = path.join(root, rel)
  if (!fs.existsSync(fullPath)) { console.log('SKIP:', rel); continue }

  let src = fs.readFileSync(fullPath, 'utf8')
  if (!src.includes('@/app/lib/prisma')) { console.log(' —', rel); continue }

  const relToLib = path.relative(path.dirname(fullPath), prismaLib).split(path.sep).join('/')
  const relImport = relToLib.startsWith('.') ? relToLib : './' + relToLib

  src = src.replace("import prisma from '@/app/lib/prisma'", "import prisma from '" + relImport + "'")
  fs.writeFileSync(fullPath, src, 'utf8')
  console.log(' ✓', rel, '->', relImport)
}

console.log('\nDone.')
