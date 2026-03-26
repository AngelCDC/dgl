import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Sidebar from '../../components/Sidebar'
import ArticuloContent from './ArticuloContent'

const prisma = new PrismaClient()

export async function generateMetadata({ params }) {
  const { slug } = await params
  const articulo = await prisma.article.findUnique({
    where: { slug },
    include: { category: { select: { name: true } }, author: { select: { name: true } } },
  })

  if (!articulo) return { title: 'Artículo no encontrado — DUBOIS' }

  const description = articulo.metaDesc || articulo.excerpt || 'Artículo de comercio internacional publicado por DUBOIS — Global Trade Intelligence.'
  const title = articulo.metaTitle || articulo.title

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: articulo.publishedAt?.toISOString(),
      authors: [articulo.author?.name ?? 'DUBOIS'],
      tags: articulo.category?.name ? [articulo.category.name] : [],
      siteName: 'DUBOIS — Global Trade Intelligence',
      ...(articulo.coverUrl ? { images: [{ url: articulo.coverUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(articulo.coverUrl ? { images: [articulo.coverUrl] } : {}),
    },
  }
}

export default async function ArticuloPage({ params }) {
  const { slug } = await params
  const articulo = await prisma.article.findUnique({
    where: { slug },
    include: { author: { select: { name: true } }, category: { select: { name: true, color: true } } },
  })

  if (!articulo || articulo.status !== 'published') notFound()

  await prisma.article.update({ where: { id: articulo.id }, data: { views: { increment: 1 } } })

  return (
    <>
      <Navbar />
      <main className="proveedores-main" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div className="articulos-layout">

          {/* Contenido principal */}
          <article>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              {articulo.category && (
                <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '500', color: articulo.category.color ?? 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>
                  {articulo.category.name}
                </span>
              )}
              <h1 style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '36px', color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '16px' }}>
                {articulo.title}
              </h1>
              {articulo.excerpt && (
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '17px', color: 'var(--steel)', lineHeight: '1.7', marginBottom: '16px' }}>
                  {articulo.excerpt}
                </p>
              )}
              <div className="meta-row">
                <span className="mono-sm">{articulo.author?.name}</span>
                <span className="meta-dot">·</span>
                <span className="mono-sm">
                  {new Date(articulo.publishedAt).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="meta-dot">·</span>
                <span className="mono-sm">{articulo.views} vistas</span>
              </div>
            </div>

            {/* Imagen de portada */}
            {articulo.coverUrl && (
              <div style={{ marginBottom: '36px', aspectRatio: '16/9', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={articulo.coverUrl} alt={articulo.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}

            {/* Compartir */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', color: 'var(--steel)', textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'center' }}>Compartir:</span>
              {[
                { label: 'LinkedIn', color: '#0a66c2' },
                { label: 'X', color: '#000' },
                { label: 'WhatsApp', color: '#25d366' },
              ].map(r => (
                <span key={r.label} style={{ fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '500', padding: '5px 14px', border: `1px solid ${r.color}`, color: r.color, cursor: 'pointer', letterSpacing: '0.04em' }}>
                  {r.label}
                </span>
              ))}
            </div>

            {/* Contenido */}
            <div style={{ paddingBottom: '60px' }}>
              <ArticuloContent content={articulo.content} />
            </div>

          </article>

          {/* Sidebar */}
          <Sidebar />

        </div>
      </main>
      <Footer />
    </>
  )
}