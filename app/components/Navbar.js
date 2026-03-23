import Link from 'next/link'

export default function Navbar() {
  return (
    <nav style={{ borderBottom: '1px solid #eee', padding: '0 32px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
      <Link href="/" style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '-0.02em' }}>
        DGL <span style={{ fontWeight: '400', color: '#888' }}>Dubois Grupo Logístico</span>
      </Link>
      <div style={{ display: 'flex', gap: '28px', fontSize: '14px', color: '#444' }}>
        <Link href="/articulos">Artículos</Link>
        <Link href="/proveedores">Proveedores</Link>
        <Link href="/contacto">Contacto</Link>
      </div>
    </nav>
  )
}