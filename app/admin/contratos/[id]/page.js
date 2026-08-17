import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import { buildAccessWhere } from '../../../lib/access'
import prisma from '../../../lib/prisma'
import { normalizeReporte } from '../../../lib/reportes/verificacion'
import ContratoForm from '../ContratoForm'

export default async function EditarContratoPage({ params }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role === 'cliente') redirect('/admin')

  const { id } = await params

  const [contrato, reportesRaw, clientes] = await Promise.all([
    prisma.contratoCompra.findFirst({
      where: await buildAccessWhere(session, { id }),
      include: {
        partidas: { orderBy: { sortOrder: 'asc' } },
        pagos:    { orderBy: { sortOrder: 'asc' } },
      },
    }),
    prisma.reporteVerificacion.findMany({
      where: { visible: true },
      orderBy: { createdAt: 'desc' },
    }),
    // Base de clientes para el autofill del Buyer por coincidencia exacta de TAX ID
    prisma.cliente.findMany({
      select: {
        id: true, cedulaRif: true, razonSocial: true, nombreComercial: true,
        direccion: true, pais: true,
        contactoNombre: true, contactoCargo: true, contactoEmail: true,
        representanteLegal: true, representanteCargo: true,
      },
      orderBy: { razonSocial: 'asc' },
    }),
  ])

  if (!contrato) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
        Contrato no encontrado o sin acceso.
      </div>
    )
  }

  const reportes = reportesRaw.map(r => {
    const n = normalizeReporte(r.data)
    return {
      id: r.id,
      nombreEmpresa: r.nombreEmpresa,
      nombreEmpresaZh: r.nombreEmpresaZh,
      codigoCreditoSocial: r.codigoCreditoSocial,
      legalRepresentative: n.company.representanteLegal,
      domicile: n.company.domicilio,
    }
  })

  return <ContratoForm contrato={contrato} reportes={reportes} clientes={clientes} />
}
