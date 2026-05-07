import prisma from '../lib/prisma'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'

export const metadata = {
  title: 'Productos en Tendencia — DUBOIS Global Trade Intelligence',
  description: 'Descubre los productos en tendencia del comercio internacional verificados por DUBOIS. Fuentes globales, especificaciones y proveedores.',
}

export default async function ProductosPage({ searchParams }) {
  const { categoria } = await searchParams

  const [productos, categorias] = await Promise.all([
    prisma.supplierProduct.findMany({
      where: {
        supplier: {
          status: 'active',
          ...(categoria ? { category: { slug: categoria } } : {}),
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        supplier: {
          select: {
            name: true,
            slug: true,
            country: true,
            logoUrl: true,
            verified: true,
            featured: true,
            category: { select: { name: true, color: true } },
          },
        },
      },
      take: 60,
    }),
    prisma.category.findMany({
      where: { type: { in: ['supplier', 'both'] } },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <>
      <Navbar />
      <main className="main-content" style={{ paddingTop: '32px', paddingBottom: '80px' }}>

        {/* Header */}
        <div className="hero-block" style={{ marginBottom: '32px' }}>
          <div className="hero-watermark">TREND</div>
          <span className="category-pill-accent" style={{ marginBottom: '16px' }}>Productos en Tendencia</span>
          <h1 className="hero-title">Catálogo Global de Productos</h1>
          <p className="hero-excerpt">
            Productos verificados de proveedores internacionales activos en nuestra red. Encuentra especificaciones, rangos de precio y contacto directo con el proveedor.
          </p>
          <div style={{ display: 'flex', gap: '24px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            <span>{productos.length} productos disponibles</span>
            <span>·</span>
            <span>Proveedores verificados</span>
            <span>·</span>
            <span>Actualizado continuamente</span>
          </div>
        </div>

        <div className="articulos-layout">
          <div style={{ minWidth: 0 }}>

            {/* Filtros de categoría */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <span style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', fontWeight: '500', color: 'var(--steel)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: '4px' }}>
                Categoría:
              </span>
              <FilterPill label="Todos" href="/productos" active={!categoria} />
              {categorias.map(c => (
                <FilterPill
                  key={c.id}
                  label={c.name}
                  href={`/productos?categoria=${c.slug}`}
                  active={categoria === c.slug}
                  color={c.color}
                />
              ))}
            </div>

            {/* Grid de productos */}
            {productos.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center', background: '#fff', border: '1px solid var(--border)', color: 'var(--steel)' }}>
                <div style={{ fontFamily: 'var(--font-dm)', fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>
                  No hay productos en esta categoría todavía
                </div>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px' }}>
                  Estamos incorporando proveedores continuamente. Prueba otra categoría o{' '}
                  <Link href="/proveedores" style={{ color: 'var(--accent)' }}>explora el directorio de proveedores</Link>.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {productos.map(p => (
                  <Link key={p.id} href={`/proveedores/${p.supplier.slug}`} style={{ display: 'block', height: '100%' }}>
                    <div style={{
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderTop: p.supplier.featured ? '3px solid var(--accent)' : '3px solid transparent',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>

                      {/* Imagen del producto */}
                      <div style={{ background: 'var(--bg)', aspectRatio: '4/3', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '36px', color: 'var(--border)' }}>
                            {p.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Info del producto */}
                      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '14px', color: 'var(--ink)', lineHeight: '1.4' }}>
                          {p.name}
                        </div>

                        {p.description && (
                          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--steel)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                            {p.description}
                          </p>
                        )}

                        {/* Meta: MOQ / Precio */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {p.moq && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: 'var(--bg)', color: 'var(--steel)', padding: '2px 8px', border: '1px solid var(--border)' }}>
                              MOQ {p.moq}
                            </span>
                          )}
                          {p.priceRange && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', border: '1px solid #bae6fd' }}>
                              {p.priceRange}
                            </span>
                          )}
                        </div>

                        {/* Proveedor */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                          <div style={{ width: '24px', height: '24px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            {p.supplier.logoUrl
                              ? <img src={p.supplier.logoUrl} alt={p.supplier.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '10px', color: '#fff' }}>{p.supplier.name.charAt(0)}</span>
                            }
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600', color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.supplier.name}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--steel)' }}>
                              {p.supplier.country}
                            </div>
                          </div>
                          {p.supplier.verified && (
                            <span style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', fontWeight: '500', flexShrink: 0 }}>✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* CTA hacia directorio */}
            <div style={{ marginTop: '40px', padding: '32px', background: 'var(--navy)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '20px', color: '#fff', marginBottom: '8px' }}>
                ¿Eres proveedor internacional?
              </div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '20px' }}>
                Publica tus productos en nuestra plataforma y conecta con importadores de toda Latinoamérica.
              </p>
              <Link href="/contacto" style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', padding: '10px 24px', fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Contactar
              </Link>
            </div>

          </div>

          <Sidebar />
        </div>
      </main>
      <Footer />
    </>
  )
}

function FilterPill({ label, href, active, color }) {
  return (
    <Link href={href} style={{
      fontFamily: 'var(--font-dm)',
      fontSize: '12px',
      fontWeight: '500',
      padding: '5px 12px',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      border: active ? `1.5px solid ${color ?? 'var(--accent)'}` : '1.5px solid var(--border)',
      color: active ? (color ?? 'var(--accent)') : 'var(--steel)',
      background: active ? `${color ?? 'var(--accent)'}11` : '#fff',
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {label}
    </Link>
  )
}
