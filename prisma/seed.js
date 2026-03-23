require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

async function main() {
  const password = await bcrypt.hash('admin123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'admin@dgl.com' },
    update: {},
    create: {
      name: 'Admin DGL',
      email: 'admin@dgl.com',
      password,
      role: 'admin',
    },
  })

  console.log('Usuario creado:', user.email)

  await prisma.category.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Electrónica', slug: 'electronica', type: 'both', color: '#378ADD' },
      { name: 'Textiles', slug: 'textiles', type: 'both', color: '#1D9E75' },
      { name: 'Metales', slug: 'metales', type: 'both', color: '#888780' },
      { name: 'Empaques', slug: 'empaques', type: 'both', color: '#BA7517' },
      { name: 'Maquinaria', slug: 'maquinaria', type: 'both', color: '#D85A30' },
      { name: 'Comercio Internacional', slug: 'comercio-internacional', type: 'article', color: '#7F77DD' },
    ],
  })

  console.log('Categorías creadas')

  await prisma.supplierPlan.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Básico', description: 'Perfil simple en el directorio', price: 0, durationDays: 30, maxProducts: 3 },
      { name: 'Destacado', description: 'Perfil destacado con badge', price: 49, durationDays: 30, isFeatured: true, maxProducts: 5, badgeLabel: 'Destacado' },
      { name: 'Premium', description: 'Máxima visibilidad + verificado', price: 99, durationDays: 30, isFeatured: true, maxProducts: 10, badgeLabel: 'Premium' },
    ],
  })

  console.log('Planes creados')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())