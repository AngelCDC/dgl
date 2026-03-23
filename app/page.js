import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const prisma = new PrismaClient()

export default async function HomePage() {
  const [articulos, proveedores] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      include: { category: true, author: { select: { name: true } } },
    }),
    prisma.supplier.findMany({
      where: { status: 'active' },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 4,
      include: { category: true, plan: true },
    }),
  ])

  const hero = articulos[0]
  const grid = articulos.slice(1, 4)
  const resto = articulos.slice(4)

  return (
    <>
      <Navbar active="/" />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 32px 80px' }}>

        {/* Hero */}
        {hero && (
          <Link href={`/articulos/${hero.slug}`}>
            <div style={{ background: 'var(--navy)', padding: '56px 48px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '140px', color: 'rgba(255,255,255,0.03)', letterSpacing: '-0.05em', lineHeight: '1', pointerEvents: 'none', userSelect: 'none' }}>DG</div>
              <div style={{ position: 'relative' }}>
                <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '500', background: 'var(--accent)', color: '#fff', padding: '4px 12px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px', display: 'inline-block' }}>
                  {hero.category?.name ?? 'Artículo'}
                </span>
                <h1 style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '36px', color: '#fff', lineHeight: '1.2', letterSpacing: '-0.02em', maxWidth: '620px', marginBottom: '14px' }}>
                  {hero.title}
                </h1>
                {hero.excerpt && (
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px', maxWidth: '540px', lineHeight: '1.7' }}>
                    {hero.excerpt}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{hero.author?.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>·</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(hero.publishedAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid 2/3 + 1/3 */}
        {grid.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', marginBottom: '28px' }}>
            <ArticleCardLarge article={grid[0]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {grid[1] && <ArticleCardSmall article={grid[1]} />}
              {grid[2] && <ArticleCardSmall article={grid[2]} />}
            </div>
          </div>
        )}

        {/* Proveedores destacados */}
        {proveedores.length > 0 && (
          <section style={{ marginBottom: '48px' }}>
            <SectionTitle label="Proveedores Globales" href="/proveedores" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {proveedores.map(p => <SupplierCard key={p.id} supplier={p} />)}
            </div>
          </section>
        )}

        {/* Más artículos */}
        {resto.length > 0 && (
          <section>
            <SectionTitle label="Más artículos" href="/articulos" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {resto.map(a => <ArticleCardSmall key={a.id} article={a} />)}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  )
}

function SectionTitle({ label, href }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--navy)', paddingBottom: '10px', marginBottom: '20px' }}>
      <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '500', color: 'var(--navy)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <Link href={href} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>Ver todos →</Link>
    </div>
  )
}

function ArticleCardLarge({ article }) {
  return (
    <Link href={`/articulos/${article.slug}`}>
      <div style={{ background: '#fff', border: '1px solid var(--border)', height: '100%' }}>
        <div style={{ background: 'var(--bg)', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '40px', color: 'var(--border)' }}>DG</span>
        </div>
        <div style={{ padding: '24px' }}>
          <CategoryPill category={article.category} />
          <h2 style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '22px', color: 'var(--ink)', lineHeight: '1.3', letterSpacing: '-0.01em', margin: '10px 0' }}>{article.title}</h2>
          {article.excerpt && <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'var(--steel)', lineHeight: '1.7', marginBottom: '14px' }}>{article.excerpt}</p>}
          <Meta article={article} />
        </div>
      </div>
    </Link>
  )
}

function ArticleCardSmall({ article }) {
  return (
    <Link href={`/articulos/${article.slug}`}>
      <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '20px', height: '100%' }}>
        <CategoryPill category={article.category} />
        <h3 style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '16px', color: 'var(--ink)', lineHeight: '1.4', margin: '10px 0 8px' }}>{article.title}</h3>
        {article.excerpt && <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)', lineHeight: '1.6', marginBottom: '12px' }}>{article.excerpt}</p>}
        <Meta article={article} />
      </div>
    </Link>
  )
}

function SupplierCard({ supplier }) {
  return (
    <Link href={`/proveedores/${supplier.slug}`}>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderLeft: '4px solid var(--accent)', padding: '20px', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '16px', color: 'var(--navy)', marginBottom: '2px' }}>{supplier.name}</div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)' }}>{supplier.country}{supplier.city ? `, ${supplier.city}` : ''}</div>
          </div>
          {supplier.verified && (
            <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', fontWeight: '500', letterSpacing: '0.04em' }}>Verificado</span>
          )}
        </div>
        {supplier.description && (
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)', lineHeight: '1.6', marginBottom: '14px' }}>{supplier.description.slice(0, 100)}...</p>
        )}
        <div style={{ display: 'flex', gap: '16px' }}>
          {supplier.plan?.badgeLabel && (
            <div>
              <div style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', color: 'var(--steel)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Plan</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent)' }}>{supplier.plan.badgeLabel}</div>
            </div>
          )}
          {supplier.category && (
            <div>
              <div style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', color: 'var(--steel)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Categoría</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--ink)' }}>{supplier.category.name}</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function CategoryPill({ category }) {
  if (!category) return null
  return (
    <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '500', background: 'var(--bg)', color: 'var(--accent)', padding: '3px 10px', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block' }}>
      {category.name}
    </span>
  )
}

function Meta({ article }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>{article.author?.name}</span>
      <span style={{ color: 'var(--border)', fontSize: '12px' }}>·</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>
        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
      </span>
    </div>
  )
}