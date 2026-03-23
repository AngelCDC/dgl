import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Navbar from '../../components/Navbar'
import ArticuloContent from './ArticuloContent'

const prisma = new PrismaClient()

export async function generateMetadata({ params }) {
  const { slug } = await params
  const articulo = await prisma.article.findUnique({
    where: { slug },
    include: { category: { select: { name: true } }, author: { select: { name: true } } },
  })

  if (!articulo) return { title: 'Artículo no encontrado — DUBOIS' }

  return {
    title: `${articulo.title} — Grupo Dubois`,
    description: articulo.metaDesc || articulo.excerpt || '',
    openGraph: {
      title: articulo.metaTitle ?? articulo.title,
      description: articulo.metaDesc ?? articulo.excerpt ?? '',
      type: 'article',
      publishedTime: articulo.publishedAt?.toISOString(),
      authors: [articulo.author?.name ?? 'DUBOIS'],
      tags: [articulo.category?.name ?? ''],
      siteName: 'Grupo Dubois — Global Trade Intelligence',
      ...(articulo.coverUrl ? { images: [{ url: articulo.coverUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: articulo.metaTitle ?? articulo.title,
      description: articulo.metaDesc ?? articulo.excerpt ?? '',
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
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ padding: '48px 0 40px' }}>
          {articulo.category && (
            <span style={{ fontSize: '12px', fontWeight: '500', color: articulo.category.color ?? '#888', marginBottom: '12px', display: 'block' }}>
              {articulo.category.name}
            </span>
          )}
          <h1 style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '16px' }}>
            {articulo.title}
          </h1>
          {articulo.excerpt && <p style={{ fontSize: '17px', color: '#666', lineHeight: '1.7', marginBottom: '16px' }}>{articulo.excerpt}</p>}
          <p style={{ fontSize: '13px', color: '#aaa' }}>
            {articulo.author?.name} · {new Date(articulo.publishedAt).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ borderTop: '1px solid #eee', paddingTop: '40px', paddingBottom: '80px' }}>
          <ArticuloContent content={articulo.content} />
        </div>
      </main>
    </>
  )
}