import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function ProveedoresPage() {
  const proveedores = await prisma.supplier.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { name: true } }, plan: { select: { name: true } } },
  })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600' }}>Proveedores</h1>
        <Link href="/admin/proveedores/nuevo" style={{ background: '#111', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none' }}>
          + Nuevo proveedor
        </Link>
      </div>

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
        {proveedores.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
            No hay proveedores todavía.
          </div>
        )}
        {proveedores.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f5f5f5' }}>
            <div>
              <div style={{ fontWeight: '500', fontSize: '14px' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                {p.country}{p.city ? `, ${p.city}` : ''} · {p.category?.name ?? 'Sin categoría'} · {p.plan?.name ?? 'Sin plan'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <StatusBadge status={p.status} verified={p.verified} />
              <Link href={`/admin/proveedores/${p.id}`} style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>Editar</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status, verified }) {
  const map = {
    pending:  { label: 'Pendiente', color: '#BA7517', bg: '#fef3e2' },
    active:   { label: 'Activo',    color: '#1D9E75', bg: '#e6f7f1' },
    inactive: { label: 'Inactivo',  color: '#888',    bg: '#f5f5f5' },
    expired:  { label: 'Expirado',  color: '#D85A30', bg: '#fdeee8' },
  }
  const s = map[status] ?? map.pending
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {verified && (
        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: '#e6f1fb', color: '#185FA5', fontWeight: '500' }}>
          Verificado
        </span>
      )}
      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: s.bg, color: s.color, fontWeight: '500' }}>
        {s.label}
      </span>
    </div>
  )
}