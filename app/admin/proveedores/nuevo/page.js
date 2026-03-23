import { PrismaClient } from '@prisma/client'
import ProveedorForm from '../ProveedorForm'

const prisma = new PrismaClient()

export default async function NuevoProveedorPage() {
  const [categorias, planes] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplierPlan.findMany({ where: { active: true }, orderBy: { price: 'asc' } }),
  ])
  return <ProveedorForm categorias={categorias} planes={planes} />
}