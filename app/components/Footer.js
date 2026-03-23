import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy)', padding: '48px 32px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '48px', paddingBottom: '32px', borderBottom: '1px solid var(--corp)' }}>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--corp)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '12px', color: '#fff' }}>DG</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '20px', color: '#fff', letterSpacing: '-0.02em', lineHeight: '1' }}>DUBOIS</div>
                <div style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', fontStyle: 'italic', color: 'var(--accent)' }}>Global Trade Intelligence</div>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', maxWidth: '280px' }}>
              Inteligencia de comercio internacional para gerentes de importación, compradores y directivos de supply chain en Latinoamérica.
            </p>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Secciones</div>
            {['Proveedores Globales', 'Logística Internacional', 'Auditorías', 'Directorio', 'Eventos'].map(item => (
              <div key={item} style={{ marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>{item}</span>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Empresa</div>
            {['Nosotros', 'Directorio', 'Contacto', 'Política Editorial'].map(item => (
              <div key={item} style={{ marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>{item}</span>
              </div>
            ))}
          </div>

        </div>
        <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
            © 2026 Dubois Grupo Logístico · Global Trade Intelligence
          </span>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['LinkedIn', 'X', 'WhatsApp'].map(r => (
              <span key={r} style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>{r}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}