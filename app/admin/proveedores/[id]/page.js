import prisma from '../../../lib/prisma'
import ProveedorForm from '../ProveedorForm'

export default async function EditarProveedorPage({ params }) {
  const { id } = await params
  const [proveedor, categorias, planes] = await Promise.all([
    prisma.supplier.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.supplierPlan.findMany({ where: { active: true }, orderBy: { price: 'asc' } }),
  ])
  return <ProveedorForm proveedor={proveedor} categorias={categorias} planes={planes} />
}