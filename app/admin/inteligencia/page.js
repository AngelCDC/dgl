import fs from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import SupplierDashboard from '../../components/SupplierDashboard'
import './inteligencia.css'

export default async function InteligenciaPage() {
  const session = await getServerSession(authOptions)
  // Módulo exclusivo del administrador (trabajador y cliente → /admin)
  if (session?.user?.role !== 'admin') redirect('/admin')

  // El JSON se lee del disco en cada petición: al reemplazar el archivo,
  // el dashboard se actualiza sin rebuild.
  let data = null
  let error = null
  try {
    const file = path.join(process.cwd(), 'data', 'inteligencia-proveedores.json')
    data = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    error = 'No se pudo cargar el archivo de inteligencia de proveedores: ' + e.message
  }

  return <SupplierDashboard data={data} error={error} />
}
