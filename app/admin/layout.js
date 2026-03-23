import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: '220px', background: 'white', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontWeight: '600', fontSize: '15px' }}>DGL</div>
          <div style={{ fontSize: '12px', color: '#888' }}>Back Office</div>
        </div>
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          <NavLink href="/admin">Dashboard</NavLink>
          <div style={{ fontSize: '10px', color: '#aaa', padding: '12px 8px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contenido</div>
          <NavLink href="/admin/articulos">Artículos</NavLink>
          <NavLink href="/admin/categorias">Categorías</NavLink>
          <div style={{ fontSize: '10px', color: '#aaa', padding: '12px 8px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Proveedores</div>
          <NavLink href="/admin/proveedores">Directorio</NavLink>
          <NavLink href="/admin/planes">Planes</NavLink>
          <div style={{ fontSize: '10px', color: '#aaa', padding: '12px 8px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sistema</div>
          <NavLink href="/admin/solicitudes">Solicitudes</NavLink>
          <NavLink href="/admin/equipo">Equipo</NavLink>
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid #eee', fontSize: '13px', color: '#888' }}>
          {session.user?.name}
        </div>
      </aside>
      <main style={{ flex: 1, background: '#f9f9f9', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }) {
  return (
    <Link href={href} style={{ display: 'block', padding: '7px 12px', fontSize: '13px', color: '#444', textDecoration: 'none', borderRadius: '6px', marginBottom: '2px' }}>
      {children}
    </Link>
  )
}