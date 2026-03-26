'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Search from './Search'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Proveedores Globales', href: '/proveedores' },
  { label: 'Productos en Tendencia', href: '/productos' },
  { label: 'Logística Internacional', href: '/articulos' },
  { label: 'Auditorías', href: '/auditorias' },
  { label: 'Directorio', href: '/directorio' },
]

export default function NavbarClient() {
  const pathname = usePathname()

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const today = new Date().toLocaleDateString('es-VE', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <header>
      <div className="navbar-top">
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {today} &nbsp;·&nbsp; LATAM · GLOBAL
        </span>
        <div className="navbar-redes">
          {['LinkedIn', 'X', 'WhatsApp', 'YouTube'].map(r => (
            <span key={r} style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>{r}</span>
          ))}
        </div>
      </div>

      <div className="navbar-logo-row">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--corp)', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '14px', color: '#fff', letterSpacing: '-0.02em' }}>DGL</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '26px', color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: '1' }}>DUBOIS</div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', color: 'var(--steel)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Grupo Logístico &nbsp;
              <span style={{ fontStyle: 'italic', color: 'var(--accent)', textTransform: 'none', letterSpacing: '0', fontWeight: '400' }}>Global Trade Intelligence</span>
            </div>
          </div>
        </Link>
        <Search />
      </div>

      <nav className="navbar-nav">
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} style={{
            fontFamily: 'var(--font-dm)',
            fontSize: '12px',
            fontWeight: '500',
            color: isActive(link.href) ? 'var(--accent)' : 'var(--steel)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '13px 20px',
            borderBottom: isActive(link.href) ? '2px solid var(--accent)' : '2px solid transparent',
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