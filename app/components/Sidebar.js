import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function Sidebar() {
  const [recientes, proveedores] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: { category: { select: { name: true, color: true } } },
    }),
    prisma.supplier.findMany({
      where: { status: 'active' },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 4,
      include: { category: { select: { name: true } } },
    }),
  ])

  return (
    <div className="sidebar-desktop">
      <aside className="articulos-sidebar">

        {/* Artículos recientes */}
        <div className="sidebar-block">
          <div className="sidebar-title">Más recientes</div>
          {recientes.length === 0 && (
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)' }}>No hay artículos aún.</p>
          )}
          {recientes.map((a, i) => (
            <Link key={a.id} href={`/articulos/${a.slug}`}>
              <div className="sidebar-article-row">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: '500', color: 'var(--border)', minWidth: '28px' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  {a.category && (
                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', fontWeight: '500', color: a.category.color ?? 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
                      {a.category.name}
                    </div>
                  )}
                  <div style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600', color: 'var(--ink)', lineHeight: '1.4' }}>
                    {a.title}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Últimos proveedores */}
        {proveedores.length > 0 && (
          <div className="sidebar-block">
            <div className="sidebar-title">Últimos proveedores</div>
            {proveedores.map(p => (
              <Link key={p.id} href={`/proveedores/${p.slug}`}>
                <div className="sidebar-supplier-row">
                  <div style={{ width: '36px', height: '36px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {p.logoUrl
                      ? <img src={p.logoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '12px', color: '#fff' }}>{p.name.charAt(0)}</span>
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600', color: 'var(--navy)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>
                      {p.country}{p.category ? ` · ${p.category.name}` : ''}
                    </div>
                  </div>
                  {p.verified && (
                    <span style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', fontWeight: '500', flexShrink: 0 }}>✓</span>
                  )}
                </div>
              </Link>
            ))}
            <Link href="/proveedores" style={{ fontFamily: 'var(--font-dm)', fontSize: '12px', color: 'var(--accent)', display: 'block', marginTop: '12px' }}>
              Ver directorio completo →
            </Link>
          </div>
        )}

        {/* Newsletter */}
        <div className="sidebar-newsletter">
          <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '15px', color: '#fff', marginBottom: '8px' }}>
            Global Trade Intelligence
          </div>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '16px' }}>
            Recibe análisis semanales de comercio internacional, tendencias y proveedores verificados.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="email"
              placeholder="tu@email.com"
              style={{ padding: '9px 12px', fontFamily: 'var(--font-inter)', fontSize: '13px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', outline: 'none', width: '100%' }}
            />
            <button style={{ padding: '9px', background: 'var(--accent)', color: '#fff', border: 'none', fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', width: '100%' }}>
              Suscribirse
            </button>
          </div>
        </div>

      </aside>
    </div>
  )
}