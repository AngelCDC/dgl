import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

const prisma = new PrismaClient()

export default async function ProveedorPage({ params }) {
  const proveedor = await prisma.supplier.findUnique({
    where: { slug: params.slug },
    include: {
      category: { select: { name: true } },
      plan: { select: { name: true, badgeLabel: true } },
      products: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!proveedor || proveedor.status !== 'active') notFound()

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ padding: '48px 0 32px' }}>
          <Link href="/proveedores" style={{ fontSize: '13px', color: '#888', marginBottom: '20px', display: 'block' }}>← Volver al directorio</Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '24px', color: '#888', flexShrink: 0 }}>
              {proveedor.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.02em' }}>{proveedor.name}</h1>
                {proveedor.verified && <span style={{ fontSize: '11px', background: '#e6f1fb', color: '#185FA5', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>Verificado</span>}
                {proveedor.plan?.badgeLabel && <span style={{ fontSize: '11px', background: '#fef3e2', color: '#854F0B', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>{proveedor.plan.badgeLabel}</span>}
              </div>
              <p style={{ fontSize: '14px', color: '#888' }}>
                {proveedor.country}{proveedor.city ? `, ${proveedor.city}` : ''}{proveedor.category ? ` · ${proveedor.category.name}` : ''}
              </p>
            </div>
          </div>

          {proveedor.description && (
            <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.7', marginBottom: '32px' }}>{proveedor.description}</p>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {proveedor.website && <a href={proveedor.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px', color: '#444' }}>Sitio web</a>}
            {proveedor.email && <a href={`mailto:${proveedor.email}`} style={{ fontSize: '13px', padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px', color: '#444' }}>{proveedor.email}</a>}
            {proveedor.whatsapp && <a href={`https://wa.me/${proveedor.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', padding: '8px 16px', background: '#111', color: 'white', borderRadius: '8px' }}>WhatsApp</a>}
          </div>
        </div>

        {proveedor.products.length > 0 && (
          <div style={{ borderTop: '1px solid #eee', paddingTop: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Productos y servicios</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {proveedor.products.map(prod => (
                <div key={prod.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '18px' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>{prod.name}</div>
                  {prod.description && <p style={{ fontSize: '13px', color: '#777', lineHeight: '1.5', marginBottom: '8px' }}>{prod.description}</p>}
                  {prod.moq && <p style={{ fontSize: '12px', color: '#aaa' }}>MOQ: {prod.moq}</p>}
                  {prod.priceRange && <p style={{ fontSize: '12px', color: '#aaa' }}>{prod.priceRange}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}