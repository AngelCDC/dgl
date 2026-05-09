import prisma from '../lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [
    totalArticulos,
    totalProveedores,
    totalMensajesNuevos,
    totalSolicitudes,
    totalCatalogo,
    solicitudes,
    mensajes,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.supplier.count(),
    prisma.contactRequest.count({ where: { status: 'new' } }),
    prisma.solicitudAdquisicion.count(),
    prisma.productoCatalogo.count().catch(() => 0),
    prisma.solicitudAdquisicion.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: { id: true, solicitante: true, descripcionObjeto: true, fecha: true, status: true, createdAt: true },
    }),
    prisma.contactRequest.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, company: true, message: true, type: true, status: true, createdAt: true },
    }),
  ])

  return (
    <div className="dash-page">

      {/* Bienvenida */}
      <div className="dash-welcome">
        <div>
          <h1 className="dash-welcome-title">Panel de Control</h1>
          <p className="dash-welcome-sub">
            {new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/admin/solicitudes/Inicial" className="dash-cta-btn">
          + Nueva solicitud
        </Link>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <StatCard label="Artículos"            value={totalArticulos}              href="/admin/articulos"     icon="📝" color="#2563eb" />
        <StatCard label="Proveedores"          value={totalProveedores}            href="/admin/proveedores"   icon="🏭" color="#0891b2" />
        <StatCard label="Estudios de Mercado"  value={totalSolicitudes}            href="/admin/adquisiciones" icon="📊" color="#7c3aed" />
        <StatCard label="Productos catálogo"   value={totalCatalogo.toLocaleString()} href="/admin/catalogo"   icon="📦" color="#0d9488" />
        <StatCard label="Mensajes nuevos"      value={totalMensajesNuevos}         href="/admin/contactos"     icon="✉️" color="#dc2626" highlight={totalMensajesNuevos > 0} />
      </div>

      {/* Dos columnas */}
      <div className="dash-grid">

        {/* Últimos estudios */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Últimos estudios de mercado</span>
            <Link href="/admin/adquisiciones" className="dash-card-link">Ver todos →</Link>
          </div>
          {solicitudes.length === 0
            ? <div className="dash-empty">No hay estudios todavía.</div>
            : solicitudes.map((s, i) => {
                const ok = s.status === 'finalizado'
                return (
                  <Link key={s.id} href={`/admin/adquisiciones/${s.id}`} className="dash-row">
                    <div className="dash-row-num">{i + 1}</div>
                    <div className="dash-row-body">
                      <div className="dash-row-title">{s.descripcionObjeto}</div>
                      <div className="dash-row-meta">{s.solicitante} · {s.fecha}</div>
                    </div>
                    <span className={`dash-badge ${ok ? 'dash-badge-green' : 'dash-badge-gray'}`}>
                      {ok ? 'Finalizado' : 'Borrador'}
                    </span>
                  </Link>
                )
              })
          }
        </div>

        {/* Mensajes */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Mensajes recientes</span>
            <Link href="/admin/contactos" className="dash-card-link">Ver todos →</Link>
          </div>
          {mensajes.length === 0
            ? <div className="dash-empty">No hay mensajes todavía.</div>
            : mensajes.map(m => {
                const isNew = m.status === 'new'
                return (
                  <Link key={m.id} href="/admin/contactos" className={`dash-msg${isNew ? ' dash-msg-new' : ''}`}>
                    <div className="dash-msg-avatar">{m.name.charAt(0).toUpperCase()}</div>
                    <div className="dash-row-body">
                      <div className={`dash-row-title${isNew ? ' dash-row-title-bold' : ''}`}>{m.name}</div>
                      <div className="dash-msg-preview">{m.message}</div>
                      <div className="dash-row-meta">
                        {new Date(m.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })}
                        {m.company ? ` · ${m.company}` : ''}
                      </div>
                    </div>
                    {isNew && <span className="dash-dot-new" />}
                  </Link>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}

// StatCard — Server-safe (sin event handlers JS, el hover lo maneja CSS)
function StatCard({ label, value, href, icon, color, highlight }) {
  return (
    <Link href={href} className={`dash-stat-card${highlight ? ' dash-stat-card-hl' : ''}`}
      style={{ '--stat-color': color }}>
      <div className="dash-stat-top">
        <span className="dash-stat-icon">{icon}</span>
        {highlight && <span className="dash-stat-dot" />}
      </div>
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-label">{label}</div>
    </Link>
  )
}
