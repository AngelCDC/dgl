import prisma from '../../lib/prisma'
import Link from 'next/link'
import DeleteButton from '../../components/admin/DeleteButton'

export default async function AdquisicionesPage() {
  const solicitudes = await prisma.solicitudAdquisicion.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { cotizantes: true, riesgos: true } },
    },
  })

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '4px' }}>Estudio de Mercado</h1>
          <p style={{ fontSize: '13px', color: '#888' }}>{solicitudes.length} solicitudes registradas</p>
        </div>
        <Link href="/admin/solicitudes/nueva" style={{ background: '#111', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>
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
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{s.solicitante}</span>
                {s.tipoDocumento && (
                  <span style={{ fontSize: '11px', background: '#f4f6f9', color: '#5a6478', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {s.tipoDocumento === 'otro' ? s.tipoDocumentoOtro : s.tipoDocumento}
                  </span>
                )}
                <StatusBadge status={s.status} />
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }}>
                <span>📅 {s.fecha}</span>
                <span>💰 {s.valorEstimado}</span>
                <span>🏷 {s.modalidad === 'directa' ? 'Contratación Directa' : 'Convocatoria Pública'}</span>
                <span>🏢 {s._count.cotizantes} cotizantes</span>
                <span>⚠️ {s._count.riesgos} riesgos</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link href={`/admin/adquisiciones/${s.id}`} style={{ fontSize: '13px', color: '#555', padding: '6px 12px', border: '1px solid #eee', borderRadius: '6px' }}>
                Ver
              </Link>
              <a href={`/api/admin/adquisiciones/${s.id}/pdf`} target="_blank" style={{ fontSize: '13px', color: '#2563eb', padding: '6px 12px', border: '1px solid #2563eb', borderRadius: '6px' }}>
                PDF
              </a>
              <DeleteButton
                apiPath={`/api/admin/adquisiciones/${s.id}`}
                confirmMsg={`¿Eliminar el estudio de mercado de "${s.solicitante}"? Esta acción no se puede deshacer.`}
              />
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