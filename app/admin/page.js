import prisma from '../lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [
    totalArticulos,
    totalProveedores,
    totalMensajesNuevos,
    totalSolicitudes,
    solicitudes,
    mensajes,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.supplier.count(),
    prisma.contactRequest.count({ where: { status: 'new' } }),
    prisma.solicitudAdquisicion.count(),
    prisma.solicitudAdquisicion.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        solicitante: true,
        descripcionObjeto: true,
        fecha: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.contactRequest.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        message: true,
        type: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  const statusSolicitud = {
    borrador:   { label: 'Borrador',    color: '#888',    bg: '#f5f5f5' },
    finalizado: { label: 'Finalizado',  color: '#1D9E75', bg: '#e6f7f1' },
  }

  const statusMensaje = {
    new:      { label: 'Nuevo',    color: '#2563eb', bg: '#eff6ff' },
    read:     { label: 'Leído',    color: '#888',    bg: '#f5f5f5' },
    attended: { label: 'Atendido', color: '#16a34a', bg: '#dcfce7' },
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1300px' }}>

      {/* Título */}
      <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Dashboard</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Artículos publicados" value={totalArticulos} href="/admin/articulos" />
        <StatCard label="Proveedores activos"  value={totalProveedores} href="/admin/proveedores" />
        <StatCard label="Estudios de Mercado"   value={totalSolicitudes} href="/admin/adquisiciones" />
        <StatCard label="Mensajes nuevos"      value={totalMensajesNuevos} href="/admin/contactos" accent={totalMensajesNuevos > 0} />
      </div>

      {/* Dos columnas principales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

        {/* Últimas solicitudes de adquisición */}
        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Últimos estudios de mercado</span>
            <Link href="/admin/adquisiciones" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}>Ver todos →</Link>
          </div>

          {solicitudes.length === 0
            ? <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>No hay solicitudes todavía.</div>
            : solicitudes.map((s, i) => {
                const st = statusSolicitud[s.status] ?? statusSolicitud.borrador
                return (
                  <Link key={s.id} href={`/admin/adquisiciones/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 20px', borderBottom: '1px solid #f5f5f5', transition: 'background 0.1s' }}>
                      {/* Número */}
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f4f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', color: '#888', fontWeight: '600' }}>{i + 1}</span>
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.descripcionObjeto}
                        </div>
                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                          {s.solicitante} · {s.fecha}
                        </div>
                      </div>
                      {/* Status */}
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500', background: st.bg, color: st.color, flexShrink: 0 }}>
                        {st.label}
                      </span>
                    </div>
                  </Link>
                )
              })
          }
        </div>

        {/* Últimos mensajes */}
        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Mensajes recientes</span>
            <Link href="/admin/contactos" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}>Ver todos →</Link>
          </div>

          {mensajes.length === 0
            ? <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>No hay mensajes todavía.</div>
            : mensajes.map(m => {
                const st = statusMensaje[m.status] ?? statusMensaje.new
                return (
                  <Link key={m.id} href="/admin/contactos" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ padding: '13px 20px', borderBottom: '1px solid #f5f5f5', background: m.status === 'new' ? '#fafbff' : 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>{m.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: m.status === 'new' ? '600' : '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500', background: st.bg, color: st.color, flexShrink: 0 }}>
                          {st.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#888', margin: '0 0 0 36px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.message}
                      </p>
                      <div style={{ fontSize: '11px', color: '#ccc', marginTop: '4px', marginLeft: '36px' }}>
                        {new Date(m.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {m.company && ` · ${m.company}`}
                      </div>
                    </div>
                  </Link>
                )
              })
          }
        </div>

      </div>
    </div>
  )
}

function StatCard({ label, value, href, accent }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', border: `1px solid ${accent ? '#bfdbfe' : '#eee'}`,
        borderRadius: '10px', padding: '20px', cursor: 'pointer',
        borderLeft: accent ? '4px solid #2563eb' : '1px solid #eee',
      }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontSize: '28px', fontWeight: '700', lineHeight: 1.1, color: accent ? '#2563eb' : '#111' }}>{value}</div>
      </div>
    </Link>
  )
}
