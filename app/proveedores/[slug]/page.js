import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Sidebar from '../../components/Sidebar'

const prisma = new PrismaClient()

export async function generateMetadata({ params }) {
  const { slug } = await params
  const proveedor = await prisma.supplier.findUnique({
    where: { slug },
    include: { category: { select: { name: true } } },
  })

  if (!proveedor) return { title: 'Proveedor no encontrado — DUBOIS' }

  return {
    title: `${proveedor.name} — Proveedor verificado · DUBOIS`,
    description: proveedor.description ?? `${proveedor.name} es un proveedor de ${proveedor.category?.name ?? 'comercio internacional'} con base en ${proveedor.country}.`,
    openGraph: {
      title: `${proveedor.name} — DUBOIS`,
      description: proveedor.description ?? '',
      type: 'website',
      siteName: 'DUBOIS — Global Trade Intelligence',
      ...(proveedor.logoUrl ? { images: [{ url: proveedor.logoUrl }] } : {}),
    },
  }
}

export default async function ProveedorPage({ params }) {
  const { slug } = await params
  const proveedor = await prisma.supplier.findUnique({
    where: { slug },
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
      <main className="proveedores-main" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div className="articulos-layout">

          <article style={{ minWidth: 0 }}>

            
            {/* Cover image */}
            {proveedor.coverUrl && (
              <div style={{ aspectRatio: '16/9', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '28px' }}>
                <img src={proveedor.coverUrl} alt={proveedor.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}

            {/* Header proveedor */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderLeft: '4px solid var(--accent)', padding: '28px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
                <div style={{ width: '72px', height: '72px', background: 'var(--navy)', borderRadius: '0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {proveedor.logoUrl
                    ? <img src={proveedor.logoUrl} alt={proveedor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '28px', color: '#fff' }}>{proveedor.name.charAt(0)}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <h1 style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '28px', color: 'var(--navy)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                      {proveedor.name}
                    </h1>
                    {proveedor.verified && (
                      <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', fontWeight: '500', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        Verificado
                      </span>
                    )}
                    {proveedor.plan?.badgeLabel && (
                      <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', background: '#fef3e2', color: '#92400e', padding: '3px 10px', fontWeight: '500', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        {proveedor.plan.badgeLabel}
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--steel)' }}>
                    {proveedor.country}{proveedor.city ? `, ${proveedor.city}` : ''}{proveedor.category ? ` · ${proveedor.category.name}` : ''}
                  </p>
                </div>
              </div>

              {proveedor.description && (
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: 'var(--steel)', lineHeight: '1.7', marginBottom: '24px' }}>
                  {proveedor.description}
                </p>
              )}

              {/* Contacto */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {proveedor.website && (
                  <a href={proveedor.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '500', padding: '8px 16px', border: '1px solid var(--border)', color: 'var(--ink)', letterSpacing: '0.04em' }}>
                    Sitio web →
                  </a>
                )}
                {proveedor.email && (
                  <a href={`mailto:${proveedor.email}`} style={{ fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '500', padding: '8px 16px', border: '1px solid var(--border)', color: 'var(--ink)', letterSpacing: '0.04em' }}>
                    {proveedor.email}
                  </a>
                )}
                {proveedor.phone && (
                  <a href={`tel:${proveedor.phone}`} style={{ fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '500', padding: '8px 16px', border: '1px solid var(--border)', color: 'var(--ink)', letterSpacing: '0.04em' }}>
                    {proveedor.phone}
                  </a>
                )}
                {proveedor.whatsapp && (
                  <a href={`https://wa.me/${proveedor.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '500', padding: '8px 16px', background: '#25d366', color: '#fff', border: 'none', letterSpacing: '0.04em' }}>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Ficha técnica */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px', marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '500', color: 'var(--navy)', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '2px solid var(--navy)', paddingBottom: '10px', marginBottom: '20px' }}>
                Ficha Técnica
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: 'País', value: proveedor.country },
                  { label: 'Ciudad', value: proveedor.city },
                  { label: 'Categoría', value: proveedor.category?.name },
                  { label: 'Plan', value: proveedor.plan?.name },
                  { label: 'Estado', value: proveedor.status === 'active' ? 'Activo' : proveedor.status },
                  { label: 'Verificado', value: proveedor.verified ? 'Sí' : 'No' },
                  { label: 'Plan inicio', value: proveedor.planStart ? new Date(proveedor.planStart).toLocaleDateString('es-VE') : null },
                  { label: 'Plan vence', value: proveedor.planEnd ? new Date(proveedor.planEnd).toLocaleDateString('es-VE') : null },
                ].filter(item => item.value).map(item => (
                  <div key={item.label} style={{ background: 'var(--bg)', padding: '12px 16px' }}>
                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', color: 'var(--steel)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--ink)', fontWeight: '500' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Productos y servicios */}
            {proveedor.products.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px' }}>
                <div style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '500', color: 'var(--navy)', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '2px solid var(--navy)', paddingBottom: '10px', marginBottom: '20px' }}>
                  Productos y Servicios
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                  {proveedor.products.map(prod => (
                    <div key={prod.id} style={{ border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', padding: '16px' }}>
                      {prod.imageUrl && (
                        <div style={{ aspectRatio: '4/3', overflow: 'hidden', marginBottom: '12px', background: 'var(--bg)' }}>
                          <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '14px', color: 'var(--ink)', marginBottom: '6px' }}>{prod.name}</div>
                      {prod.description && (
                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)', lineHeight: '1.5', marginBottom: '10px' }}>{prod.description}</p>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {prod.moq && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>
                            MOQ: <span style={{ color: 'var(--accent)' }}>{prod.moq}</span>
                          </div>
                        )}
                        {prod.priceRange && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>
                            Precio: <span style={{ color: 'var(--accent)' }}>{prod.priceRange}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </article>

          {/* Sidebar */}
          <Sidebar />

        </div>
      </main>
      <Footer />
    </>
  )
}