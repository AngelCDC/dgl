import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Navbar from '../components/Navbar'

const prisma = new PrismaClient()

export default async function ProveedoresPage() {
  const [proveedores, categorias] = await Promise.all([
    prisma.supplier.findMany({
      where: { status: 'active' },
      orderBy: [{ featured: 'desc' }, { verified: 'desc' }, { createdAt: 'desc' }],
      include: { category: { select: { name: true } }, plan: { select: { name: true, badgeLabel: true } } },
    }),
    prisma.category.findMany({ where: { type: { in: ['supplier', 'both'] } }, orderBy: { name: 'asc' } }),
  ])

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ padding: '48px 0 32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '8px' }}>Directorio de proveedores</h1>
          <p style={{ color: '#777', fontSize: '15px' }}>Proveedores internacionales verificados por DGL</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', paddingBottom: '80px' }}>
          {proveedores.length === 0 && (
            <p style={{ color: '#aaa', gridColumn: '1/-1', padding: '48px 0', textAlign: 'center' }}>Próximamente...</p>
          )}
          {proveedores.map(p => (
            <Link key={p.id} href={`/proveedores/${p.slug}`}>
              <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '24px', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ width: '44px', height: '44px', background: '#f5f5f5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', color: '#888' }}>
                    {p.name.charAt(0)}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {p.verified && <span style={{ fontSize: '11px', background: '#e6f1fb', color: '#185FA5', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>Verificado</span>}
                    {p.plan?.badgeLabel && <span style={{ fontSize: '11px', background: '#fef3e2', color: '#854F0B', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>{p.plan.badgeLabel}</span>}
                  </div>
                </div>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                  {p.country}{p.city ? `, ${p.city}` : ''}{p.category ? ` · ${p.category.name}` : ''}
                </div>
                {p.description && (
                  <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}