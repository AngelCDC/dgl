import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'

const prisma = new PrismaClient()

export const metadata = {
  title: 'Directorio de Proveedores — DUBOIS Global Trade Intelligence',
  description: 'Directorio de proveedores internacionales verificados para importadores y compradores en Latinoamérica.',
}

export default async function ProveedoresPage({ searchParams }) {
  const { categoria, pais } = await searchParams

  const [proveedores, categorias, paises] = await Promise.all([
    prisma.supplier.findMany({
      where: {
        status: 'active',
        ...(categoria ? { category: { is: { slug: categoria } } } : {}),
        ...(pais ? { country: { contains: pais, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ featured: 'desc' }, { verified: 'desc' }, { createdAt: 'desc' }],
      include: { category: { select: { name: true, color: true } }, plan: { select: { name: true, badgeLabel: true } } },
    }),
    prisma.category.findMany({ where: { type: { in: ['supplier', 'both'] } }, orderBy: { name: 'asc' } }),
    prisma.supplier.findMany({
      where: { status: 'active' },
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    }),
  ])

  return (
    <>
      <Navbar />
      <main className="proveedores-main" style={{ paddingTop: '32px', paddingBottom: '80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '28px', color: 'var(--navy)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Directorio de Proveedores
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'var(--steel)' }}>
            {proveedores.length} {proveedores.length === 1 ? 'proveedor verificado' : 'proveedores verificados'} · DUBOIS Global Trade Intelligence
          </p>
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', fontWeight: '500', color: 'var(--steel)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: '4px' }}>Categoría:</span>
            <FilterPill label="Todas" href="/proveedores" active={!categoria} />
            {categorias.map(c => (
              <FilterPill key={c.id} label={c.name} href={`/proveedores?categoria=${c.slug}${pais ? `&pais=${pais}` : ''}`} active={categoria === c.slug} color={c.color} />
            ))}
          </div>
          {paises.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', fontWeight: '500', color: 'var(--steel)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: '4px' }}>País:</span>
              <FilterPill label="Todos" href="/proveedores" active={!pais} />
              {paises.map(p => (
                <FilterPill key={p.country} label={p.country} href={`/proveedores?${categoria ? `categoria=${categoria}&` : ''}pais=${p.country}`} active={pais === p.country} />
              ))}
            </div>
          )}
        </div>

        {/* Layout dos columnas */}
        <div className="articulos-layout">

          {/* Grid de proveedores */}
          <div style={{ minWidth: 0 }}>
            {proveedores.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--steel)', background: '#fff', border: '1px solid var(--border)' }}>
                No hay proveedores en esta selección todavía.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {proveedores.map(p => (
                <Link key={p.id} href={`/proveedores/${p.slug}`} style={{ display: 'block', height: '100%' }}>
                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderLeft: p.featured ? '4px solid var(--accent)' : '4px solid transparent', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Logo + badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: '48px', height: '48px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {p.logoUrl
                          ? <img src={p.logoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '16px', color: '#fff' }}>{p.name.charAt(0)}</span>
                        }
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {p.verified && (
                          <span style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', fontWeight: '500', letterSpacing: '0.04em' }}>Verificado</span>
                        )}
                        {p.plan?.badgeLabel && (
                          <span style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', background: '#fef3e2', color: '#92400e', padding: '2px 8px', fontWeight: '500', letterSpacing: '0.04em' }}>{p.plan.badgeLabel}</span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '15px', color: 'var(--navy)', marginBottom: '4px' }}>{p.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)', marginBottom: '10px' }}>
                        {p.country}{p.city ? `, ${p.city}` : ''}{p.category ? ` · ${p.category.name}` : ''}
                      </div>
                      {p.description && (
                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.description}
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: '12px', color: 'var(--accent)', fontWeight: '500', letterSpacing: '0.04em' }}>
                      Ver perfil →
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
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