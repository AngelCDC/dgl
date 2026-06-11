import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { solicitudProcuraSimpleSchema } from '../../../../lib/schemas/solicitud-levantamiento-procura'
import { buildAccessWhere } from '../../../../lib/access'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const where = await buildAccessWhere(session)

  const solicitudes = await prisma.solicitudProcura.findMany({
    where,
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
    const v = solicitudProcuraSimpleSchema.parse(data)

    // ── Fecha ─────────────────────────────────────────────────────────────────
    const fechaStr = `${v.fechaReunion.dd}/${v.fechaReunion.mm}/${v.fechaReunion.aaaa}`

    // ── Cliente ───────────────────────────────────────────────────────────────
    const cedulaRif             = v.cliente.cedulaRif?.trim()     || null
    const empresaCliente        = v.cliente.razonSocial
    const nombreComercial       = null   // eliminado del formulario simplificado
    const ciudad                = v.cliente.ciudad                ?? null
    const direccion             = v.cliente.direccion             ?? null
    const sectorIndustria       = v.cliente.sectorIndustria       ?? null
    const canalComercializacion = v.cliente.canalComercializacion ?? null

    // ── Contactos ─────────────────────────────────────────────────────────────
    const [contactoPrincipal, ...otrosContactos] = v.contactos

    // ── Objetivo (requerido en Prisma) ────────────────────────────────────────
    const objetivoReunion = v.proximosPasos.join(' | ') || 'Levantamiento de procura'

    // ── Necesidades extraídas de cada producto ────────────────────────────────
    const necesidades = v.productosCliente.map((p, i) => ({
      productoRelacionado:     p.nombreProducto,
      tipoNecesidad:           p.tipoNecesidad,
      tipoNecesidadOtro:       p.tipoNecesidadOtro   ?? null,
      frecuenciaRequerida:     p.frecuenciaRequerida ?? null,
      cantidadReferencial:     p.cantidadReferencial ?? null,
      prioridad:               p.prioridad           ?? null,
      descripcion:             p.descripcion?.trim() || p.nombreProducto,
      sortOrder: i,
    }))

    // ── Cotizantes: 3 filas vacías por cada producto ──────────────────────────
    // productoNombre agrupa las cotizaciones — el usuario completa
    // proveedor y valor en el formulario de adquisición
    const cotizantes = v.productosCliente.flatMap((p, pi) =>
      [0, 1, 2].map((ci) => ({
        productoNombre: p.nombreProducto,
        nombre:         '',       // el usuario ingresa el proveedor
        valor:          '0',
        sortOrder:      pi * 3 + ci,
      }))
    )

    // ── 1. Upsert Cliente (fuera de transaction — Neon pooler no soporta tx interactivas largas) ──
    let clienteId = null
    if (cedulaRif) {
      const cli = await prisma.cliente.upsert({
        where:  { cedulaRif },
        update: {
          razonSocial:           empresaCliente,
          ciudad,
          direccion,
          sectorIndustria,
          canalComercializacion,
          contactoNombre:   contactoPrincipal.nombre   ?? null,
          contactoCargo:    contactoPrincipal.cargo    ?? null,
          contactoTelefono: contactoPrincipal.telefono ?? null,
          contactoEmail:    contactoPrincipal.email    || null,
          updatedAt:        new Date(),
        },
        create: {
          cedulaRif,
          razonSocial:           empresaCliente,
          ciudad,
          direccion,
          sectorIndustria,
          canalComercializacion,
          contactoNombre:   contactoPrincipal.nombre   ?? null,
          contactoCargo:    contactoPrincipal.cargo    ?? null,
          contactoTelefono: contactoPrincipal.telefono ?? null,
          contactoEmail:    contactoPrincipal.email    || null,
        },
      })
      clienteId = cli.id
    }

    // ── 2. Crear SolicitudProcura con sus relaciones anidadas ────────────────
    const solicitud = await prisma.solicitudProcura.create({
      data: {
        createdById:          session.user.id,
        fecha:                fechaStr,
        cedulaRif,
        clienteId,
        empresaCliente,
        nombreComercial,
        ciudad,
        direccion,
        sectorIndustria,
        canalComercializacion,
        objetivoReunion,
        resumenCliente:          null,
        fortalezasDetectadas:    [],
        restriccionesDetectadas: [],
        comentariosFinales:      null,
        proximosPasos:           v.proximosPasos,
        elaboradoPorNombre:      v.elaboradoPor.nombre,
        elaboradoPorCargo:       v.elaboradoPor.cargo ?? null,
        elaboradoPorFecha:       fechaStr,

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

        productos: {
          create: v.productosCliente.map((p, i) => ({
            nombreProducto:             p.nombreProducto,
            categoria:                  p.categoria        ?? null,
            descripcionGeneral:         p.descripcion?.trim() || p.nombreProducto,
            caracteristicasPrincipales: [],
            presentaciones:             [],
            materiales:                 [],
            colores:                    [],
            dimensiones:                p.dimensiones      ?? null,
            peso:                       null,
            empaque:                    p.empaque          ?? null,
            marca:                      p.marca            ?? null,
            referenciaModelo:           p.referenciaModelo ?? null,
            paisOrigen:                 p.paisOrigen       ?? null,
            usosAplicaciones:           null,
            requerimientosEspeciales:   null,
            observaciones:              p.descripcion      ?? null,
            sortOrder: i,
          })),
        },

        necesidades: { create: necesidades },
      },
    })

    // ── 3. Crear SolicitudAdquisicion vinculada ──────────────────────────────
    const adquisicion = await prisma.solicitudAdquisicion.create({
      data: {
        solicitudProcuraId:     solicitud.id,
        status:                 'borrador',
        fecha:                  fechaStr,
        solicitante:            empresaCliente,
        ccNit:                  '',
        email:                  contactoPrincipal.email    || '',
        telCel:                 contactoPrincipal.telefono ?? null,
        descripcionNecesidad:   objetivoReunion,
        pertinencia:            null,
        descripcionObjeto:      '',
        obligaciones:           [],
        modalidad:              'directa',
        justificacionModalidad: '',
        valorEstimado:          '',
        plazo:                  '',
        comiteEvaluador:        [],

        elaboradoPorNombre: v.elaboradoPor.nombre,
        elaboradoPorCargo:  v.elaboradoPor.cargo ?? null,
        elaboradoPorFecha:  fechaStr,

        contratanteNombre: contactoPrincipal.nombre,
        contratanteCargo:  contactoPrincipal.cargo ?? null,
        contratanteFecha:  fechaStr,

        cotizantes: { create: cotizantes },
      },
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
          details: (error.issues ?? error.errors ?? []).map((e) => ({
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