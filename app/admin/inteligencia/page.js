import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import SupplierDashboard from '../../components/SupplierDashboard'

export default async function InteligenciaPage() {
  const session = await getServerSession(authOptions)
  // Módulo exclusivo del administrador (trabajador y cliente → /admin)
  if (session?.user?.role !== 'admin') redirect('/admin')

  // El JSON lo carga el propio usuario en la página (archivo o pegado);
  // el componente lo procesa en el navegador.
  return <SupplierDashboard />
}
