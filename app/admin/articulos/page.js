import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function ArticulosPage() {
  const articulos = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } }, category: { select: { name: true } } },
  })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600' }}>Artículos</h1>
        <Link href="/admin/articulos/nuevo" style={{ background: '#111', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none' }}>
          + Nuevo artículo
        </Link>
      </div>

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
        {articulos.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
            No hay artículos todavía. ¡Crea el primero!
          </div>
        )}
        {articulos.map(a => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f5f5f5' }}>
            <div>
              <div style={{ fontWeight: '500', fontSize: '14px' }}>{a.title}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                {a.author?.name} · {a.category?.name ?? 'Sin categoría'} · {new Date(a.createdAt).toLocaleDateString('es-VE')}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <StatusBadge status={a.status} />
              <Link href={`/admin/articulos/${a.id}`} style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>Editar</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    draft: { label: 'Borrador', color: '#888', bg: '#f5f5f5' },
    published: { label: 'Publicado', color: '#1D9E75', bg: '#e6f7f1' },
    archived: { label: 'Archivado', color: '#BA7517', bg: '#fef3e2' },
  }
  const s = map[status] ?? map.draft
  return (
    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: s.bg, color: s.color, fontWeight: '500' }}>
      {s.label}
    </span>
  )
}