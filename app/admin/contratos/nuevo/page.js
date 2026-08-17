import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import prisma from '../../../lib/prisma'
import { normalizeReporte } from '../../../lib/reportes/verificacion'
import { proximoNumeroContrato } from '../../../lib/contratos'
import ContratoForm from '../ContratoForm'

export default async function NuevoContratoPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role === 'cliente') redirect('/admin')

  const [reportesRaw, siguienteNumero, clientes] = await Promise.all([
    prisma.reporteVerificacion.findMany({
      where: { visible: true },
      orderBy: { createdAt: 'desc' },
    }),
    proximoNumeroContrato(prisma, new Date().getFullYear()),
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

  // Lista slim para el selector: datos de identificación del informe
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

  return <ContratoForm reportes={reportes} clientes={clientes} siguienteNumero={siguienteNumero} />
}
