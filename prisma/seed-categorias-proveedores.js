require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

const categorias = [
  // Fase 1
  { name: 'Electrónica y electrodomésticos', slug: 'electronica-electrodomesticos', color: '#378ADD' },
  { name: 'Fabricación industrial',          slug: 'fabricacion-industrial',         color: '#888780' },
  { name: 'Vehículos y vehículos de dos ruedas', slug: 'vehiculos-dos-ruedas',       color: '#D85A30' },
  { name: 'Iluminación y electricidad',      slug: 'iluminacion-electricidad',        color: '#F59E0B' },
  { name: 'Herramientas de ferretería',      slug: 'herramientas-ferreteria',         color: '#6B7280' },
  { name: 'Artículos del hogar',             slug: 'articulos-hogar',                 color: '#1D9E75' },
  // Fase 2
  { name: 'Regalos y decoraciones',          slug: 'regalos-decoraciones',            color: '#EC4899' },
  { name: 'Materiales de construcción y muebles', slug: 'construccion-muebles',      color: '#92400E' },
  { name: 'Juguetes y productos para bebés', slug: 'juguetes-bebes',                  color: '#8B5CF6' },
  // Fase 3
  { name: 'Moda',                            slug: 'moda',                            color: '#DB2777' },
  { name: 'Textiles para el hogar',          slug: 'textiles-hogar',                  color: '#059669' },
  { name: 'Papelería',                       slug: 'papeleria',                       color: '#2563EB' },
  { name: 'Salud y ocio',                    slug: 'salud-ocio',                      color: '#16A34A' },
]

async function main() {
  console.log('Insertando categorías de proveedores...\n')

  for (const cat of categorias) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, color: cat.color, type: 'supplier' },
      create: { ...cat, type: 'supplier' },
    })
    console.log(`  ✓ ${result.name}`)
  }

  console.log(`\n${categorias.length} categorías procesadas.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
