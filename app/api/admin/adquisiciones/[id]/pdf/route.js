// app/api/admin/adquisiciones/[id]/pdf/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import SolicitudPDF from '../../../../../components/SolicitudPDF'

const prisma = new PrismaClient()

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  try {
    // 1. Cargar adquisición completa desde DB
    const s = await prisma.solicitudAdquisicion.findUnique({
      where: { id },
      include: {
        cotizantes: { orderBy: { sortOrder: 'asc' } },
        riesgos:    { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!s) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

    // 2. Mapear al shape que espera SolicitudPDF
    const data = {
      fecha:            parseFecha(s.fecha),
      tipoDocumento:    s.tipoDocumento,
      tipoDocumentoOtro: s.tipoDocumentoOtro,
      solicitante:      s.solicitante,
      ccNit:            s.ccNit,
      telCel:           s.telCel,
      ext:              s.ext,
      email:            s.email,

      descripcionNecesidad: s.descripcionNecesidad,
      pertinencia:          s.pertinencia,

      descripcionObjeto: s.descripcionObjeto,
      especificaciones:  s.especificaciones,
      requierePermisos:  s.requierePermisos,

      obligaciones: s.obligaciones ?? [],

      modalidad:              s.modalidad,
      justificacionModalidad: s.justificacionModalidad,

      cotizantes:    s.cotizantes.map(c => ({ nombre: c.nombre, valor: c.valor })),
      valorEstimado: s.valorEstimado,

      formaPago:           s.formaPago,
      detallePago:         s.detallePago,
      criterioMenorPrecio: s.criterioMenorPrecio,
      criterioOtro:        s.criterioOtro,

      contratistaNombre:   s.contratistaNombre,
      contratistaCcNit:    s.contratistaCcNit,
      contratistaEmail:    s.contratistaEmail,
      contratistaCiudad:   s.contratistaCiudad,
      contratistaTelefono: s.contratistaTelefono,

      riesgos: s.riesgos.map(r => ({
        descripcion: r.descripcion,
        mitigacion:  r.mitigacion,
        asignacion:  r.asignacion,
      })),

      garantias:       [],
      plazo:           s.plazo,
      comiteEvaluador: s.comiteEvaluador ?? [],
      documentosSoporte: [],

      supervisorNombre:  null,
      supervisorCargo:   null,
      supervisorCorreo:  null,
      supervisorCelular: null,

      elaboradoPor: {
        nombre: s.elaboradoPorNombre,
        cargo:  s.elaboradoPorCargo,
        fecha:  s.elaboradoPorFecha,
      },
      ordenadorGasto: {
        nombre: s.contratanteNombre,
        cargo:  s.contratanteCargo,
        fecha:  s.contratanteFecha,
      },
    }

    // 3. Generar PDF
    const buffer = await renderToBuffer(
      createElement(SolicitudPDF, { data })
    )

    // 4. Nombre del archivo
    const nombre = s.solicitante?.trim().replace(/s+/g, '_') || 'cliente'
    const fecha  = s.fecha?.replace(/\//g, '-') || 'sin-fecha'
    const folio  = `${nombre}_${fecha}`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="adquisicion-${folio}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error generando PDF adquisición:', error)
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }
}

// ── Convierte "DD/MM/AAAA" → { dd, mm, aaaa } que espera SolicitudPDF ─────────
function parseFecha(fechaStr) {
  if (!fechaStr) return { dd: '--', mm: '--', aaaa: '----' }
  const [dd, mm, aaaa] = fechaStr.split('/')
  return { dd: dd ?? '--', mm: mm ?? '--', aaaa: aaaa ?? '----' }
}