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
      <main className="main-content">

        {hero && (
          <Link href={`/articulos/${hero.slug}`}>
            <div className="hero-block">
              <div className="hero-watermark">DGL</div>
              <div style={{ position: 'relative' }}>
                <span className="category-pill-accent">
                  {hero.category?.name ?? 'Artículo'}
                </span>
                <h1 className="hero-title">{hero.title}</h1>
                {hero.excerpt && <p className="hero-excerpt">{hero.excerpt}</p>}
                <div className="meta-row">
                  <span className="mono-sm">{hero.author?.name}</span>
                  <span className="meta-dot">·</span>
                  <span className="mono-sm">
                    {new Date(hero.publishedAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {grid.length > 0 && (
          <div className="grid-main">
            <ArticleCardLarge article={grid[0]} />
            <div className="grid-side">
              {grid[1] && <ArticleCardSmall article={grid[1]} />}
              {grid[2] && <ArticleCardSmall article={grid[2]} />}
            </div>
          </div>
        )}

        {proveedores.length > 0 && (
          <section className="section-block">
            <SectionTitle label="Proveedores Globales" href="/proveedores" />
            <div className="grid-two">
              {proveedores.map(p => <SupplierCard key={p.id} supplier={p} />)}
            </div>
          </section>
        )}

        {resto.length > 0 && (
          <section className="section-block">
            <SectionTitle label="Más artículos" href="/articulos" />
            <div className="grid-two">
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
    <div className="section-title-row">
      <span className="section-title-text">{label}</span>
      <Link href={href} className="section-title-link">Ver todos →</Link>
    </div>
  )
}

function ArticleCardLarge({ article }) {
  return (
    <Link href={`/articulos/${article.slug}`} className="card-link">
      <div className="card-large">
        <div className="card-image-placeholder">
          <span className="card-placeholder-text">DGL</span>
        </div>
        <div className="card-body">
          <CategoryPill category={article.category} />
          <h2 className="card-title-lg">{article.title}</h2>
          {article.excerpt && <p className="card-excerpt">{article.excerpt}</p>}
          <Meta article={article} />
        </div>
      </div>
    </Link>
  )
}

function ArticleCardSmall({ article }) {
  return (
    <Link href={`/articulos/${article.slug}`} className="card-link">
      <div className="card-small">
        <CategoryPill category={article.category} />
        <h3 className="card-title-sm">{article.title}</h3>
        {article.excerpt && <p className="card-excerpt-sm">{article.excerpt}</p>}
        <Meta article={article} />
      </div>
    </Link>
  )
}

function SupplierCard({ supplier }) {
  return (
    <Link href={`/proveedores/${supplier.slug}`} className="card-link">
      <div className="supplier-card">
        <div className="supplier-card-header">
          <div>
            <div className="supplier-name">{supplier.name}</div>
            <div className="supplier-location">{supplier.country}{supplier.city ? `, ${supplier.city}` : ''}</div>
          </div>
          {supplier.verified && <span className="badge-verified">Verificado</span>}
        </div>
        {supplier.description && (
          <p className="supplier-desc">{supplier.description.slice(0, 100)}...</p>
        )}
        <div className="supplier-meta">
          {supplier.plan?.badgeLabel && (
            <div>
              <div className="meta-label">Plan</div>
              <div className="mono-accent">{supplier.plan.badgeLabel}</div>
            </div>
          )}
          {supplier.category && (
            <div>
              <div className="meta-label">Categoría</div>
              <div className="mono-ink">{supplier.category.name}</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function CategoryPill({ category }) {
  if (!category) return null
  return <span className="category-pill">{category.name}</span>
}

function Meta({ article }) {
  return (
    <div className="meta-row">
      <span className="mono-sm">{article.author?.name}</span>
      <span className="meta-dot">·</span>
      <span className="mono-sm">
        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
      </span>
    </div>
  )
}