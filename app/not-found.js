import Link from 'next/link'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flexDirection: 'column', gap: '24px', padding: '80px 0' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
            En construcción
          </div>
          <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '120px', color: 'var(--border)', lineHeight: '1', letterSpacing: '-0.05em' }}>
            DGL
          </div>
          <h1 style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '28px', color: 'var(--navy)', letterSpacing: '-0.02em', maxWidth: '480px', lineHeight: '1.3' }}>
            Esta sección está en desarrollo
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: 'var(--steel)', maxWidth: '400px', lineHeight: '1.7' }}>
            Estamos trabajando para traerte contenido de calidad sobre comercio internacional. Vuelve pronto.
          </p>
          <div style={{ width: '48px', height: '2px', background: 'var(--accent)' }} />
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/" style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '500', padding: '10px 24px', background: 'var(--navy)', color: '#fff', letterSpacing: '0.04em' }}>
              Volver al inicio
            </Link>
            <Link href="/articulos" style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '500', padding: '10px 24px', border: '1px solid var(--border)', color: 'var(--steel)', letterSpacing: '0.04em' }}>
              Ver artículos
            </Link>
            <Link href="/proveedores" style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '500', padding: '10px 24px', border: '1px solid var(--border)', color: 'var(--steel)', letterSpacing: '0.04em' }}>
              Ver proveedores
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}