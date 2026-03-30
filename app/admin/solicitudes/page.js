import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function SolicitudesPage() {
  const solicitudes = await prisma.solicitudProcura.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { productos: true, necesidades: true } },
    },
  })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '4px' }}>Solicitudes de Adquisición</h1>
          <p style={{ fontSize: '13px', color: '#888' }}>{solicitudes.length} solicitudes registradas</p>
        </div>
        <Link href="/admin/solicitudes/Inicial" style={{ background: '#111', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>
          + Nueva solicitud
        </Link>
      </div>

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
        {solicitudes.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
            No hay solicitudes todavía.
          </div>
        )}

        {solicitudes.map(s => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f5f5f5' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{s.empresaCliente}</span>
                {s.nombreComercial && <span style={{ fontSize: '12px', color: '#888' }}>({s.nombreComercial})</span>}
                <StatusBadge status={s.status} />
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }}>
                <span>📅 {s.fecha}</span>
                {s.ciudad && <span>📍 {s.ciudad}</span>}
                <span>📦 {s._count.productos} productos</span>
                <span>🔍 {s._count.necesidades} necesidades</span>
                <span>👤 {s.elaboradoPorNombre}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link href={`/admin/solicitudes/${s.id}`} style={{ fontSize: '13px', color: '#555', padding: '6px 12px', border: '1px solid #eee', borderRadius: '6px' }}>
                Ver
              </Link>
              <Link href={`/admin/solicitudes/${s.id}/editar`} style={{ fontSize: '13px', color: '#555', padding: '6px 12px', border: '1px solid #eee', borderRadius: '6px' }}>
                Editar
              </Link>
              <a href={`/api/admin/solicitudes/inicial/${s.id}/pdf`} target="_blank" style={{ fontSize: '13px', color: '#2563eb', padding: '6px 12px', border: '1px solid #2563eb', borderRadius: '6px' }}>
                PDF
              </a>
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