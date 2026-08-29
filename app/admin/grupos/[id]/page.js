import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import prisma from '../../../lib/prisma'
import GrupoDetalle from '../GrupoDetalle'

export default async function GrupoPage({ params }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'admin') redirect('/admin')

  const { id } = await params

  const [grupo, todosLosReportes] = await Promise.all([
    prisma.grupoEmpresarial.findUnique({
      where: { id },
      include: {
        reportes: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            nombreEmpresa: true,
            nombreEmpresaZh: true,
            codigoCreditoSocial: true,
            puntajeTotal: true,
            visible: true,
            createdAt: true,
            contratos: {
              select: { id: true, numero: true, fecha: true, status: true, totalContractValue: true },
            },
          },
        },
      },
    }),
    prisma.reporteVerificacion.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, nombreEmpresa: true, nombreEmpresaZh: true, grupoId: true },
    }),
  ])

  if (!grupo) notFound()

  return <GrupoDetalle grupo={grupo} todosLosReportes={todosLosReportes} />
}
