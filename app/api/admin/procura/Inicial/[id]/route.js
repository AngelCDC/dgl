import prisma from '../../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const solicitud = await prisma.solicitudProcura.findUnique({
    where: { id },
    include: {
      contactos: { orderBy: { esPrincipal: 'desc' } },
      productos: { orderBy: { sortOrder: 'asc' } },
      necesidades: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!solicitud) return Response.json({ error: 'No encontrada' }, { status: 404 })
  return Response.json(solicitud)
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const data = await req.json()

  // Borrar relaciones y recrear
  await prisma.contactoProcura.deleteMany({ where: { solicitudId: id } })
  await prisma.productoProcura.deleteMany({ where: { solicitudId: id } })
  await prisma.necesidadProcura.deleteMany({ where: { solicitudId: id } })

  const solicitud = await prisma.solicitudProcura.update({
    where: { id },
    data: {
      fecha: `${data.fecha.dd}/${data.fecha.mm}/${data.fecha.aaaa}`,
      empresaCliente: data.empresaCliente,
      nombreComercial: data.nombreComercial ?? null,
      ciudad: data.ciudad ?? null,
      direccion: data.direccion ?? null,
      objetivoReunion: data.objetivoReunion,
      resumenCliente: data.resumenCliente ?? null,
      sectorIndustria: data.sectorIndustria ?? null,
      canalComercializacion: data.canalComercializacion ?? null,
      fortalezasDetectadas: data.fortalezasDetectadas ?? [],
      restriccionesDetectadas: data.restriccionesDetectadas ?? [],
      comentariosFinales: data.comentariosFinales ?? null,
      proximosPasos: data.proximosPasos ?? [],
      elaboradoPorNombre: data.elaboradoPor.nombre,
      elaboradoPorCargo: data.elaboradoPor.cargo ?? null,
      elaboradoPorFecha: data.elaboradoPor.fecha,
      status: data.status ?? 'borrador',
      updatedAt: new Date(),
      contactos: {
        create: [
          {
            esPrincipal: true,
            nombre: data.contactoPrincipal.nombre,
            cargo: data.contactoPrincipal.cargo ?? null,
            telefono: data.contactoPrincipal.telefono ?? null,
            email: data.contactoPrincipal.email || null,
          },
          ...(data.otrosContactos ?? []).map(c => ({
            esPrincipal: false,
            nombre: c.nombre,
            cargo: c.cargo ?? null,
            telefono: c.telefono ?? null,
            email: c.email || null,
          })),
        ],
      },
      productos: {
        create: (data.productosCliente ?? []).map((p, i) => ({
          nombreProducto: p.nombreProducto,
          categoria: p.categoria ?? null,
          descripcionGeneral: p.descripcionGeneral,
          caracteristicasPrincipales: p.caracteristicasPrincipales ?? [],
          presentaciones: p.presentaciones ?? [],
          materiales: p.materiales ?? [],
          colores: p.colores ?? [],
          dimensiones: p.dimensiones ?? null,
          peso: p.peso ?? null,
          empaque: p.empaque ?? null,
          marca: p.marca ?? null,
          referenciaModelo: p.referenciaModelo ?? null,
          paisOrigen: p.paisOrigen ?? null,
          usosAplicaciones: p.usosAplicaciones ?? null,
          requerimientosEspeciales: p.requerimientosEspeciales ?? null,
          observaciones: p.observaciones ?? null,
          sortOrder: i,
        })),
      },
      necesidades: {
        create: (data.necesidadesProcura ?? []).map((n, i) => ({
          productoRelacionado: n.productoRelacionado,
          tipoNecesidad: n.tipoNecesidad,
          tipoNecesidadOtro: n.tipoNecesidadOtro ?? null,
          descripcion: n.descripcion,
          especificacionesMinimas: n.especificacionesMinimas ?? null,
          frecuenciaRequerida: n.frecuenciaRequerida ?? null,
          cantidadReferencial: n.cantidadReferencial ?? null,
          prioridad: n.prioridad ?? null,
          observaciones: n.observaciones ?? null,
          sortOrder: i,
        })),
      },
    },
  })

  return Response.json(solicitud)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.solicitudProcura.delete({ where: { id } })
  return Response.json({ ok: true })
}