import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import { buildAccessWhere } from '../../../lib/access'
import prisma from '../../../lib/prisma'
import ContratoForm from '../ContratoForm'

export default async function EditarContratoPage({ params }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role === 'cliente') redirect('/admin')

  const { id } = await params

  const [contrato, suppliers] = await Promise.all([
    prisma.contratoCompra.findFirst({
      where: await buildAccessWhere(session, { id }),
      include: {
        partidas: { orderBy: { sortOrder: 'asc' } },
        pagos:    { orderBy: { sortOrder: 'asc' } },
      },
    }),
    prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, city: true, country: true, email: true },
    }),
  ])

  if (!contrato) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
        Contrato no encontrado o sin acceso.
      </div>
    )
  }

  return <ContratoForm contrato={contrato} suppliers={suppliers} />
}
