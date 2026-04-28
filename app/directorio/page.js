import prisma from '../lib/prisma'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Directorio de Proveedores — DUBOIS Global Trade Intelligence',
  description: 'Directorio completo de proveedores globales verificados en la plataforma DUBOIS.',
}

export default async function DirectorioPage() {
  const [proveedores, categorias] = await Promise.all([
    prisma.supplier.findMany({
      where: { status: 'active' },
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
      include: { category: true, plan: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const porCategoria = categorias.map(cat => ({
    ...cat,
    items: proveedores.filter(p => p.categoryId === cat.id),
  })).filter(c => c.items.length > 0)

  const sinCategoria = proveedores.filter(p => !p.categoryId)

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 80px' }}>

        {/* Encabezado */}
        <div style={{ paddingTop: '48px', paddingBottom: '40px', borderBottom: '1px solid var(--border)', marginBottom: '48px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>Directorio</span>
          <h1 style={{
            fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '36px',
            color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: '1.1',
            marginTop: '12px', marginBottom: '14px',
          }}>Proveedores Globales</h1>
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '15px',
            color: 'var(--steel)', maxWidth: '580px', lineHeight: '1.7',
          }}>
            Directorio de empresas verificadas en nuestra plataforma. Cada proveedor ha sido
            revisado por nuestro equipo editorial antes de su publicación.
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>
                {proveedores.length} proveedores activos
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>
                {categorias.length} categorías
              </span>
            </div>
          </div>
        </div>

        {/* Índice de categorías */}
        {categorias.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '48px',
          }}>
            {porCategoria.map(cat => (
              <a key={cat.id} href={`#cat-${cat.id}`} style={{
                fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '500',
                padding: '6px 14px', border: '1px solid var(--border)',
                background: '#fff', color: 'var(--steel)',
                letterSpacing: '0.02em',
              }}>{cat.name} ({cat.items.length})</a>
            ))}
          </div>
        )}

        {/* Listado por categoría */}
        {porCategoria.map(cat => (
          <section key={cat.id} id={`cat-${cat.id}`} style={{ marginBottom: '48px' }}>
            <div style={{
              fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '11px',
              color: 'var(--steel)', letterSpacing: '0.1em', textTransform: 'uppercase',
              borderBottom: '2px solid var(--navy)', paddingBottom: '10px', marginBottom: '20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            }}>
              <span>{cat.name}</span>
              <span style={{ fontWeight: '400', fontSize: '11px', color: 'var(--steel)', fontFamily: 'var(--font-mono)' }}>
                {cat.items.length} empresa{cat.items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {cat.items.map(p => (
                <ProveedorRow key={p.id} proveedor={p} />
              ))}
            </div>
          </section>
        ))}

        {sinCategoria.length > 0 && (
          <section style={{ marginBottom: '48px' }}>
            <div style={{
              fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '11px',
              color: 'var(--steel)', letterSpacing: '0.1em', textTransform: 'uppercase',
              borderBottom: '2px solid var(--navy)', paddingBottom: '10px', marginBottom: '20px',
            }}>Otros</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {sinCategoria.map(p => (
                <ProveedorRow key={p.id} proveedor={p} />
              ))}
            </div>
          </section>
        )}

        {proveedores.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '80px',
              color: 'var(--border)', letterSpacing: '-0.05em', lineHeight: '1', marginBottom: '24px',
            }}>DG</div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: 'var(--steel)' }}>
              El directorio estará disponible próximamente.
            </p>
          </div>
        )}

      </main>
      <Footer />
    </>
  )
}

function ProveedorRow({ proveedor: p }) {
  return (
    <Link href={`/proveedores/${p.slug}`}>
      <div style={{
        background: '#fff', border: '1px solid var(--border)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px',
        transition: 'border-color 0.15s',
        borderLeft: p.featured ? '3px solid var(--accent)' : '1px solid var(--border)',
      }}>
        {/* Logo o inicial */}
        <div style={{
          width: '44px', height: '44px', flexShrink: 0,
          background: 'var(--bg)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {p.logoUrl
            ? <img src={p.logoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '13px', color: 'var(--navy)' }}>
                {p.name.charAt(0)}
              </span>
          }
        </div>

        {/* Nombre y descripción */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{
              fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '14px', color: 'var(--navy)',
            }}>{p.name}</span>
            {p.verified && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: '500',
                color: '#16a34a', letterSpacing: '0.08em', textTransform: 'uppercase',
                border: '1px solid #16a34a', padding: '1px 6px',
              }}>Verificado</span>
            )}
            {p.featured && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: '500',
                color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase',
                border: '1px solid var(--accent)', padding: '1px 6px',
              }}>Destacado</span>
            )}
          </div>
          {p.description && (
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '520px',
            }}>{p.description}</p>
          )}
        </div>

        {/* Metadatos */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
          {p.country && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)',
            }}>{p.country}</span>
          )}
          {p.category && (
            <span style={{
              fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '500',
              color: 'var(--accent)', padding: '3px 10px', background: 'rgba(37,99,235,0.07)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>{p.category.name}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
