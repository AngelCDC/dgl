import prisma from './prisma'

// Normaliza un nombre para comparar: trim + lowercase + colapsa espacios múltiples
export function normalizarNombre(n) {
  return (n ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

// Tras cualquier mutación de la galería de un ProductoCatalogo, refleja la
// imagen principal en los SupplierProduct equivalentes (mismo supplierId +
// mismo nombre normalizado). Es la vía para que /productos (que lee
// SupplierProduct) muestre la imagen sin CRUD propio de esa tabla.
export async function syncImagenEspejo(productoId) {
  const pc = await prisma.productoCatalogo.findUnique({
    where: { id: productoId },
    include: { imagenes: { orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }] } },
  })
  if (!pc || !pc.supplierId) return // sin proveedor vinculado no hay espejo

  const principal = pc.imagenes[0]?.url ?? null
  const nombre = normalizarNombre(pc.nombre)
  const matches = await prisma.supplierProduct.findMany({
    where: { supplierId: pc.supplierId },
    select: { id: true, name: true },
  })
  const ids = matches.filter(sp => normalizarNombre(sp.name) === nombre).map(sp => sp.id)
  if (ids.length > 0) {
    await prisma.supplierProduct.updateMany({
      where: { id: { in: ids } },
      data: { imageUrl: principal },
    })
  }
}
