import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { buildAccessWhere } from '../../lib/access'
import prisma from '../../lib/prisma'
import Link from 'next/link'
import DeleteButton from '../../components/admin/DeleteButton'

export default async function ContratosPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role === 'cliente') redirect('/admin')

  const where = await buildAccessWhere(session)

  const contratos = await prisma.contratoCompra.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { partidas: true, pagos: true } },
      supplier: { select: { name: true } },
    },
  })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '4px' }}>Contratos de Compra</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{contratos.length} contratos registrados</p>
        </div>
        <Link href="/admin/contratos/nuevo" style={{ background: '#111', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none' }}>
          + Nuevo contrato
        </Link>
      </div>

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
        {contratos.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
            No hay contratos todavía.
          </div>
        )}
        {contratos.map(c => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f5f5f5' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{c.buyerLegalName || 'Contrato sin nombre'}</span>
                {c.numero && (
                  <span style={{ fontSize: '11px', background: '#f4f6f9', color: '#5a6478', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {c.numero}
                  </span>
                )}
                <StatusBadge status={c.status} />
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888', flexWrap: 'wrap' }}>
                <span>📅 {c.fecha}</span>
                <span>🏭 {c.supplier?.name ?? c.supplierLegalName}</span>
                {c.totalContractValue && <span>💰 {c.totalContractValue} {c.currency}</span>}
                <span>📦 {c._count.partidas} partidas</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link href={`/admin/contratos/${c.id}`} style={{ fontSize: '13px', color: '#555', padding: '6px 12px', border: '1px solid #eee', borderRadius: '6px', textDecoration: 'none' }}>
                Ver
              </Link>
              <a href={`/api/admin/contratos/${c.id}/pdf`} target="_blank" style={{ fontSize: '13px', color: '#2563eb', padding: '6px 12px', border: '1px solid #2563eb', borderRadius: '6px', textDecoration: 'none' }}>
                PDF
              </a>
              {session?.user?.role !== 'cliente' && (
                <DeleteButton
                  apiPath={`/api/admin/contratos/${c.id}`}
                  confirmMsg={`¿Eliminar el contrato de compra de "${c.supplierLegalName}"? Esta acción no se puede deshacer.`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    borrador: { label: 'Borrador', color: '#888', bg: '#f5f5f5' },
    finalizado: { label: 'Finalizado', color: '#1D9E75', bg: '#e6f7f1' },
  }
  const s = map[status] ?? map.borrador
  return (
    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: s.bg, color: s.color, fontWeight: '500' }}>
      {s.label}
    </span>
  )
}
