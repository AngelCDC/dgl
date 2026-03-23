import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const prisma = new PrismaClient()

export default async function ArticulosPage() {
  const articulos = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    include: { category: { select: { name: true, color: true } }, author: { select: { name: true } } },
  })

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ padding: '48px 0 32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '8px' }}>Artículos</h1>
          <p style={{ color: '#777', fontSize: '15px' }}>Experiencias y guías de comercio internacional</p>
        </div>

        <div style={{ display: 'grid', gap: '1px', background: '#eee', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
          {articulos.length === 0 && (
            <div style={{ background: 'white', padding: '48px', textAlign: 'center', color: '#aaa' }}>Próximamente...</div>
          )}
          {articulos.map(a => (
            <Link key={a.id} href={`/articulos/${a.slug}`}>
              <div style={{ background: 'white', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  {a.category && (
                    <span style={{ fontSize: '11px', fontWeight: '500', color: a.category.color ?? '#888', marginBottom: '6px', display: 'block' }}>
                      {a.category.name}
                    </span>
                  )}
                  <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px', lineHeight: '1.4' }}>{a.title}</h2>
                  {a.excerpt && <p style={{ fontSize: '13px', color: '#777', lineHeight: '1.6' }}>{a.excerpt}</p>}
                  <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
                    {a.author?.name} · {new Date(a.publishedAt).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}