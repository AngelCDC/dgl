import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { buildAccessWhere } from '../../../../lib/access'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const where = await buildAccessWhere(session)

  const solicitudes = await prisma.solicitudAdquisicion.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      solicitante: true,
      tipoDocumento: true,
      fecha: true,
      modalidad: true,
      valorEstimado: true,
      status: true,
      createdAt: true,
      _count: { select: { cotizantes: true, riesgos: true } },
    },
  })

  return NextResponse.json(solicitudes)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const data = await req.json()

    const solicitud = await prisma.solicitudAdquisicion.create({
      data: {
        createdById:            session.user.id,
        fecha:                  `${data.fecha.dd}/${data.fecha.mm}/${data.fecha.aaaa}`,
        tipoDocumento:          data.tipoDocumento || null,
        tipoDocumentoOtro:      data.tipoDocumentoOtro || null,
        solicitante:            data.solicitante,
        ccNit:                  data.ccNit,
        telCel:                 data.telCel || null,
        ext:                    data.ext || null,
        email:                  data.email,
        descripcionNecesidad:   data.descripcionNecesidad,
        pertinencia:            data.pertinencia || null,
        descripcionObjeto:      data.descripcionObjeto,
        especificaciones:       data.especificaciones || null,
        requierePermisos:       data.requierePermisos || null,
        obligaciones:           data.obligaciones?.filter(o => o.trim()) ?? [],
        modalidad:              data.modalidad,
        justificacionModalidad: data.justificacionModalidad,
        valorEstimado:          data.valorEstimado,
        formaPago:              data.formaPago || null,
        detallePago:            data.detallePago || null,
        criterioMenorPrecio:    data.criterioMenorPrecio ?? true,
        criterioOtro:           data.criterioOtro || null,
        contratistaNombre:      data.contratistaNombre || null,
        contratistaCcNit:       data.contratistaCcNit || null,
        contratistaEmail:       data.contratistaEmail || null,
        contratistaCiudad:      data.contratistaCiudad || null,
        contratistaTelefono:    data.contratistaTelefono || null,
        plazo:                  data.plazo,
        comiteEvaluador:        data.comiteEvaluador?.filter(m => m.trim()) ?? [],
        elaboradoPorNombre:     data.elaboradoPor?.nombre || null,
        elaboradoPorCargo:      data.elaboradoPor?.cargo || null,
        elaboradoPorFecha:      data.elaboradoPor?.fecha || null,
        contratanteNombre:      data.responsableContratacion?.nombre || null,
        contratanteCargo:       data.responsableContratacion?.cargo || null,
        contratanteFecha:       data.responsableContratacion?.fecha || null,

        cotizantes: {
          create: (data.cotizantes ?? [])
            .filter(c => c.nombre.trim())
            .map((c, i) => ({ nombre: c.nombre, valor: c.valor, sortOrder: i })),
        },

        riesgos: {
          create: (data.riesgos ?? [])
            .filter(r => r.descripcion.trim())
            .map((r, i) => ({ descripcion: r.descripcion, mitigacion: r.mitigacion || null, asignacion: r.asignacion, sortOrder: i })),
        },
      },
    })

    return NextResponse.json({ ok: true, id: solicitud.id })
  } catch (error) {
    console.error('Error guardando solicitud de adquisición:', error)
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}