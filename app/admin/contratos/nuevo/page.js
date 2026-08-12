import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import prisma from '../../../lib/prisma'
import ContratoForm from '../ContratoForm'

export default async function NuevoContratoPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role === 'cliente') redirect('/admin')

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, city: true, country: true, email: true },
  })

  return <ContratoForm suppliers={suppliers} />
}
