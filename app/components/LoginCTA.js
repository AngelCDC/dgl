import Link from 'next/link'

export default function LoginCTA({ callbackUrl, title, description, showContactLink = true }) {
  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderLeft: '4px solid var(--accent)',
      padding: '28px 32px',
      marginBottom: '20px',
      display: 'flex',
      gap: '20px',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    }}>
      {/* Icono candado */}
      <div style={{ width: '44px', height: '44px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="10" width="14" height="10" rx="1" stroke="#fff" strokeWidth="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: '220px' }}>
        <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '15px', color: 'var(--navy)', marginBottom: '6px' }}>
          {title}
        </div>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)', lineHeight: '1.6', marginBottom: '16px' }}>
          {description}
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link href={loginHref} style={{
            display: 'inline-block',
            background: 'var(--accent)',
            color: '#fff',
            padding: '10px 24px',
            fontFamily: 'var(--font-dm)',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Iniciar sesión →
          </Link>
          {showContactLink && (
            <Link href="/contacto" style={{ fontFamily: 'var(--font-dm)', fontSize: '12px', color: 'var(--steel)', textDecoration: 'underline' }}>
              ¿No tienes cuenta? Contacta al equipo DUBOIS
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
