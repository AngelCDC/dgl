import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Navbar from './components/Navbar'

const prisma = new PrismaClient()

export default async function HomePage() {
  const [articulos, proveedores] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: { category: { select: { name: true, color: true } } },
    }),
    prisma.supplier.findMany({
      where: { status: 'active' },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 6,
      include: { category: { select: { name: true } } },
    }),
  ])

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

        {/* Hero */}
        <section style={{ padding: '72px 0 56px', borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sourcing Agent · Venezuela</p>
          <h1 style={{ fontSize: '42px', fontWeight: '700', lineHeight: '1.15', letterSpacing: '-0.03em', maxWidth: '640px', marginBottom: '20px' }}>
            Conectamos empresas venezolanas con proveedores del mundo
          </h1>
          <p style={{ fontSize: '17px', color: '#555', maxWidth: '520px', marginBottom: '32px', lineHeight: '1.7' }}>
            Experiencias reales de importación, guías de comercio internacional y un directorio de proveedores verificados.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/proveedores" style={{ background: '#111', color: 'white', padding: '10px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
              Ver proveedores
            </Link>
            <Link href="/articulos" style={{ border: '1px solid #ddd', padding: '10px 22px', borderRadius: '8px', fontSize: '14px', color: '#444' }}>
              Leer artículos
            </Link>
          </div>
        </section>

        {/* Artículos recientes */}
        {articulos.length > 0 && (
          <section style={{ padding: '56px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Últimos artículos</h2>
              <Link href="/articulos" style={{ fontSize: '13px', color: '#888' }}>Ver todos →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {articulos.map(a => (
                <Link key={a.id} href={`/articulos/${a.slug}`}>
                  <div style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                    <div style={{ padding: '20px' }}>
                      {a.category && (
                        <span style={{ fontSize: '11px', fontWeight: '500', color: a.category.color ?? '#888', marginBottom: '8px', display: 'block' }}>
                          {a.category.name}
                        </span>
                      )}
                      <h3 style={{ fontSize: '15px', fontWeight: '600', lineHeight: '1.4', marginBottom: '8px' }}>{a.title}</h3>
                      {a.excerpt && <p style={{ fontSize: '13px', color: '#777', lineHeight: '1.6' }}>{a.excerpt}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Proveedores destacados */}
        {proveedores.length > 0 && (
          <section style={{ padding: '56px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Proveedores verificados</h2>
              <Link href="/proveedores" style={{ fontSize: '13px', color: '#888' }}>Ver directorio →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {proveedores.map(p => (
                <Link key={p.id} href={`/proveedores/${p.slug}`}>
                  <div style={{ border: '1px solid #eee', borderRadius: '10px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#888' }}>
                        {p.name.charAt(0)}
                      </div>
                      {p.verified && (
                        <span style={{ fontSize: '11px', background: '#e6f1fb', color: '#185FA5', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>
                          Verificado
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{p.country}{p.city ? `, ${p.city}` : ''} · {p.category?.name ?? ''}</div>
                    {p.description && <p style={{ fontSize: '13px', color: '#666', marginTop: '8px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </>
  )
}