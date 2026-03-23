import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Proveedores Globales', href: '/proveedores' },
  { label: 'Productos en Tendencia', href: '/productos' },
  { label: 'Logística Internacional', href: '/articulos' },
  { label: 'Auditorías', href: '/auditorias' },
  { label: 'Directorio', href: '/directorio' },
]

export default function Navbar({ active = '/' }) {
  const today = new Date().toLocaleDateString('es-VE', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <header>
      {/* Barra superior */}
      <div style={{ background: 'var(--navy)', padding: '7px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {today} &nbsp;·&nbsp; LATAM · GLOBAL
        </span>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['LinkedIn', 'X', 'WhatsApp', 'YouTube'].map(r => (
            <span key={r} style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>{r}</span>
          ))}
        </div>
      </div>

      {/* Logo row */}
      <div style={{ background: '#fff', borderBottom: '2px solid var(--border)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--corp)', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '14px', color: '#fff', letterSpacing: '-0.02em' }}>DG</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '26px', color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: '1' }}>DUBOIS</div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', color: 'var(--steel)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Grupo Logístico &nbsp;
              <span style={{ fontStyle: 'italic', color: 'var(--accent)', textTransform: 'none', letterSpacing: '0', fontWeight: '400' }}>Global Trade Intelligence</span>
            </div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '2px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a6478" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', color: 'var(--steel)' }}>Buscar...</span>
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 32px', display: 'flex', gap: '0', overflowX: 'auto' }}>
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} style={{
            fontFamily: 'var(--font-dm)',
            fontSize: '12px',
            fontWeight: '500',
            color: active === link.href ? 'var(--accent)' : 'var(--steel)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '13px 20px',
            borderBottom: active === link.href ? '2px solid var(--accent)' : '2px solid transparent',
            whiteSpace: 'nowrap',
            display: 'block',
          }}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}