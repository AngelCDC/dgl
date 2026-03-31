import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const solicitudes = await prisma.solicitudProcura.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      empresaCliente: true,
      nombreComercial: true,
      fecha: true,
      ciudad: true,
      status: true,
      elaboradoPorNombre: true,
      createdAt: true,
      _count: { select: { productos: true, necesidades: true } },
    },
  })

  return Response.json(solicitudes)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const data = await req.json()

    const solicitud = await prisma.solicitudProcura.create({
      data: {
        // 1. Reunión
        fecha: `${data.fecha.dd}/${data.fecha.mm}/${data.fecha.aaaa}`,
        empresaCliente: data.empresaCliente,
        nombreComercial: data.nombreComercial ?? null,
        ciudad: data.ciudad ?? null,
        direccion: data.direccion ?? null,

        // 3. Contexto
        objetivoReunion: data.objetivoReunion,
        resumenCliente: data.resumenCliente ?? null,
        sectorIndustria: data.sectorIndustria ?? null,
        canalComercializacion: data.canalComercializacion ?? null,

        // 6. Observaciones
        fortalezasDetectadas: data.fortalezasDetectadas ?? [],
        restriccionesDetectadas: data.restriccionesDetectadas ?? [],
        comentariosFinales: data.comentariosFinales ?? null,

        // 7. Próximos pasos
        proximosPasos: data.proximosPasos ?? [],

        // 8. Elaborado por
        elaboradoPorNombre: data.elaboradoPor.nombre,
        elaboradoPorCargo: data.elaboradoPor.cargo ?? null,
        elaboradoPorFecha: data.elaboradoPor.fecha,

        // Contactos
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

        // Productos
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

        // Necesidades
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
  } catch (error) {
    console.error('Error guardando solicitud:', error)
    return Response.json({ error: 'Error al guardar la solicitud' }, { status: 500 })
  }
}