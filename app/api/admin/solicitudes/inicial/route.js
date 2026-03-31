import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { solicitudProcuraSimpleSchema } from '../../../../lib/schemas/solicitud-levantamiento-procura'

const prisma = new PrismaClient()

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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

  return NextResponse.json(solicitudes)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const data = await req.json()
    const validatedData = solicitudProcuraSimpleSchema.parse(data)

    const fechaStr = `${validatedData.fecha.dd}/${validatedData.fecha.mm}/${validatedData.fecha.aaaa}`

    // ── Transacción: crea SolicitudProcura + borrador SolicitudAdquisicion ──
    const [solicitud, adquisicion] = await prisma.$transaction(async (tx) => {

      // 1. Crear la solicitud de procura (levantamiento inicial)
      const sol = await tx.solicitudProcura.create({
        data: {
          fecha: fechaStr,
          empresaCliente:       validatedData.empresaCliente,
          nombreComercial:      validatedData.nombreComercial ?? null,
          ciudad:               validatedData.ciudad ?? null,
          direccion:            validatedData.direccion ?? null,
          objetivoReunion:      validatedData.objetivoReunion,
          resumenCliente:       validatedData.resumenCliente ?? null,
          sectorIndustria:      validatedData.sectorIndustria ?? null,
          canalComercializacion: validatedData.canalComercializacion ?? null,
          fortalezasDetectadas:   validatedData.fortalezasDetectadas ?? [],
          restriccionesDetectadas: validatedData.restriccionesDetectadas ?? [],
          comentariosFinales:   validatedData.comentariosFinales ?? null,
          proximosPasos:        validatedData.proximosPasos ?? [],
          elaboradoPorNombre:   validatedData.elaboradoPor.nombre,
          elaboradoPorCargo:    validatedData.elaboradoPor.cargo ?? null,
          elaboradoPorFecha:    validatedData.elaboradoPor.fecha,

          contactos: {
            create: [
              {
                esPrincipal: true,
                nombre:   validatedData.contactoPrincipal.nombre,
                cargo:    validatedData.contactoPrincipal.cargo ?? null,
                telefono: validatedData.contactoPrincipal.telefono ?? null,
                email:    validatedData.contactoPrincipal.email || null,
              },
              ...(validatedData.otrosContactos ?? []).map((c) => ({
                esPrincipal: false,
                nombre:   c.nombre,
                cargo:    c.cargo ?? null,
                telefono: c.telefono ?? null,
                email:    c.email || null,
              })),
            ],
          },

          productos: {
            create: (validatedData.productosCliente ?? []).map((p, i) => ({
              nombreProducto:            p.nombreProducto,
              categoria:                 p.categoria ?? null,
              descripcionGeneral:        p.descripcionGeneral,
              caracteristicasPrincipales: p.caracteristicasPrincipales ?? [],
              presentaciones:            p.presentaciones ?? [],
              materiales:                p.materiales ?? [],
              colores:                   p.colores ?? [],
              dimensiones:               p.dimensiones ?? null,
              peso:                      p.peso ?? null,
              empaque:                   p.empaque ?? null,
              marca:                     p.marca ?? null,
              referenciaModelo:          p.referenciaModelo ?? null,
              paisOrigen:                p.paisOrigen ?? null,
              usosAplicaciones:          p.usosAplicaciones ?? null,
              requerimientosEspeciales:  p.requerimientosEspeciales ?? null,
              observaciones:             p.observaciones ?? null,
              sortOrder: i,
            })),
          },

          necesidades: {
            create: (validatedData.necesidadesProcura ?? []).map((n, i) => ({
              productoRelacionado:     n.productoRelacionado,
              tipoNecesidad:           n.tipoNecesidad,
              tipoNecesidadOtro:       n.tipoNecesidadOtro ?? null,
              descripcion:             n.descripcion,
              especificacionesMinimas: n.especificacionesMinimas ?? null,
              frecuenciaRequerida:     n.frecuenciaRequerida ?? null,
              cantidadReferencial:     n.cantidadReferencial ?? null,
              prioridad:               n.prioridad ?? null,
              observaciones:           n.observaciones ?? null,
              sortOrder: i,
            })),
          },
        },
      })

      // 2. Crear el borrador de adquisición vinculado
      //    Se pre-rellena con los datos disponibles del levantamiento.
      //    Los campos obligatorios del schema que aún no se conocen
      //    quedan como strings vacíos para que el usuario los complete.
      const adq = await tx.solicitudAdquisicion.create({
        data: {
          // Vínculo
          solicitudProcuraId: sol.id,

          // Estado
          status: 'borrador',

          // 1. General — tomado del levantamiento
          fecha:      fechaStr,
          solicitante: validatedData.empresaCliente,
          ccNit:      '',
          email:      validatedData.contactoPrincipal.email || '',
          telCel:     validatedData.contactoPrincipal.telefono ?? null,

          // 2. Justificación — pre-rellenada con el objetivo de la reunión
          descripcionNecesidad: validatedData.objetivoReunion,
          pertinencia:          validatedData.resumenCliente ?? null,

          // 3. Objeto — se deja vacío para que el usuario complete
          descripcionObjeto: '',

          // 4. Obligaciones
          obligaciones: [],

          // 5. Modalidad — defaults editables
          modalidad:              'directa',
          justificacionModalidad: '',

          // 7. Valor
          valorEstimado: '',

          // 13. Plazo
          plazo: '',

          // 14. Comité
          comiteEvaluador: [],

          // Firmas — tomadas del elaborador del levantamiento
          elaboradoPorNombre: validatedData.elaboradoPor.nombre,
          elaboradoPorCargo:  validatedData.elaboradoPor.cargo ?? null,
          elaboradoPorFecha:  validatedData.elaboradoPor.fecha,
        },
      })

      return [sol, adq]
    })

    return NextResponse.json({
      ok:           true,
      id:           solicitud.id,
      adquisicionId: adquisicion.id,
    })

  } catch (error) {
    console.error('Error guardando solicitud:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.errors.map((e) => ({
            path:    e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Error al guardar la solicitud' }, { status: 500 })
  }
}