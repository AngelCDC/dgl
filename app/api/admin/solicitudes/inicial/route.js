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

    // Zod valida la estructura nueva del formulario
    const v = solicitudProcuraSimpleSchema.parse(data)

    // ── Desajuste 1: fechaReunion → string fecha ──────────────────────────────
    const fechaStr = `${v.fechaReunion.dd}/${v.fechaReunion.mm}/${v.fechaReunion.aaaa}`

    // ── Desajuste 1: cliente.razonSocial → empresaCliente ────────────────────
    const empresaCliente  = v.cliente.razonSocial
    const nombreComercial = v.cliente.nombreComercial ?? null
    const ciudad          = v.cliente.ciudad          ?? null
    const direccion       = v.cliente.direccion       ?? null
    const sectorIndustria = v.cliente.sectorIndustria ?? null
    const canalComercializacion = v.cliente.canalComercializacion ?? null

    // ── Desajuste 1: contactos[] unificado → contactoPrincipal + otrosContactos
    // El primer contacto del array es el principal
    const [contactoPrincipal, ...otrosContactos] = v.contactos

    // ── Desajuste 2: campos de procura ahora viven dentro de cada producto ────
    // Los extraemos de cada producto para crear las necesidades por separado
    const necesidades = v.productosCliente.map((p, i) => ({
      productoRelacionado:  p.nombreProducto,
      tipoNecesidad:        p.tipoNecesidad,
      tipoNecesidadOtro:    p.tipoNecesidadOtro    ?? null,
      frecuenciaRequerida:  p.frecuenciaRequerida  ?? null,
      cantidadReferencial:  p.cantidadReferencial  ?? null,
      prioridad:            p.prioridad            ?? null,
      // descripcion es requerida en Prisma — usamos notasProducto o fallback
      descripcion:          p.notasProducto?.trim() || p.nombreProducto,
      sortOrder: i,
    }))

    // ── Desajuste 3: campos eliminados del formulario → defaults en Prisma ────
    // objetivoReunion es requerido en Prisma — usamos un fallback descriptivo
    const objetivoReunion = v.proximosPasos.join(' | ') || 'Levantamiento de procura'

    const [solicitud, adquisicion] = await prisma.$transaction(async (tx) => {

      // 1. Crear SolicitudProcura
      const sol = await tx.solicitudProcura.create({
        data: {
          fecha:                fechaStr,
          empresaCliente,
          nombreComercial,
          ciudad,
          direccion,
          sectorIndustria,
          canalComercializacion,

          // Desajuste 3: campos que ya no vienen del form → defaults vacíos
          objetivoReunion,
          resumenCliente:          null,
          fortalezasDetectadas:    [],
          restriccionesDetectadas: [],
          comentariosFinales:      null,

          proximosPasos:      v.proximosPasos,
          elaboradoPorNombre: v.elaboradoPor.nombre,
          elaboradoPorCargo:  v.elaboradoPor.cargo  ?? null,
          elaboradoPorFecha:  fechaStr, // el form ya no pide fecha de elaboración

          // Desajuste 1: contactos[] unificado
          contactos: {
            create: [
              {
                esPrincipal: true,
                nombre:   contactoPrincipal.nombre,
                cargo:    contactoPrincipal.cargo    ?? null,
                telefono: contactoPrincipal.telefono ?? null,
                email:    contactoPrincipal.email    || null,
              },
              ...otrosContactos.map((c) => ({
                esPrincipal: false,
                nombre:   c.nombre,
                cargo:    c.cargo    ?? null,
                telefono: c.telefono ?? null,
                email:    c.email    || null,
              })),
            ],
          },

          // Desajuste 2: productos — solo los campos de ProductoProcura
          productos: {
            create: v.productosCliente.map((p, i) => ({
              nombreProducto:             p.nombreProducto,
              categoria:                  p.categoria          ?? null,
              // descripcionGeneral es requerida en Prisma
              descripcionGeneral:         p.descripcionTecnica?.trim() || p.nombreProducto,
              caracteristicasPrincipales: p.caracteristicasPrincipales ?? [],
              presentaciones:             [],
              materiales:                 p.materiales         ?? [],
              colores:                    [],
              dimensiones:                p.dimensiones        ?? null,
              peso:                       null,
              empaque:                    p.empaque            ?? null,
              marca:                      p.marca              ?? null,
              referenciaModelo:           p.referenciaModelo   ?? null,
              paisOrigen:                 p.paisOrigen         ?? null,
              usosAplicaciones:           null,
              requerimientosEspeciales:   null,
              observaciones:              p.notasProducto      ?? null,
              sortOrder: i,
            })),
          },

          // Desajuste 2: necesidades extraídas de cada producto
          necesidades: {
            create: necesidades,
          },
        },
      })

      // 2. Crear borrador de SolicitudAdquisicion vinculado
      const adq = await tx.solicitudAdquisicion.create({
        data: {
          solicitudProcuraId:   sol.id,
          status:               'borrador',
          fecha:                fechaStr,
          solicitante:          empresaCliente,
          ccNit:                '',
          email:                contactoPrincipal.email || '',
          telCel:               contactoPrincipal.telefono ?? null,
          descripcionNecesidad: objetivoReunion,
          pertinencia:          null,
          descripcionObjeto:    '',
          obligaciones:         [],
          modalidad:            'directa',
          justificacionModalidad: '',
          valorEstimado:        '',
          plazo:                '',
          comiteEvaluador:      [],
          elaboradoPorNombre:   v.elaboradoPor.nombre,
          elaboradoPorCargo:    v.elaboradoPor.cargo ?? null,
          elaboradoPorFecha:    fechaStr,
        },
      })

      return [sol, adq]
    })

    return NextResponse.json({
      ok:            true,
      id:            solicitud.id,
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