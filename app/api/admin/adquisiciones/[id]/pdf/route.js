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
    const s = await prisma.solicitudAdquisicion.findUnique({
      where: { id },
      include: {
        cotizantes: { orderBy: { sortOrder: 'asc' } },
        riesgos:    { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!s) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

    const data = {
      fecha:             parseFecha(s.fecha),
      tipoDocumento:     s.tipoDocumento,
      tipoDocumentoOtro: s.tipoDocumentoOtro,
      solicitante:       s.solicitante,
      ccNit:             s.ccNit,
      telCel:            s.telCel,
      ext:               s.ext,
      email:             s.email,

      descripcionNecesidad: s.descripcionNecesidad,
      pertinencia:          s.pertinencia,

      descripcionObjeto: s.descripcionObjeto,
      especificaciones:  s.especificaciones,
      requierePermisos:  s.requierePermisos,

      obligaciones: s.obligaciones ?? [],

      modalidad:              s.modalidad,
      justificacionModalidad: s.justificacionModalidad,

      // ← fix: incluir productoNombre para que el PDF agrupe por producto
      cotizantes: s.cotizantes.map(c => ({
        productoNombre: c.productoNombre ?? null,
        nombre:         c.nombre,
        valor:          c.valor,
      })),
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

      garantias:        [],
      plazo:            s.plazo,
      comiteEvaluador:  s.comiteEvaluador ?? [],
      documentosSoporte: [],

      elaboradoPor: {
        nombre: s.elaboradoPorNombre,
        cargo:  s.elaboradoPorCargo,
        fecha:  s.elaboradoPorFecha,
      },
      responsableContratacion: {
        nombre: s.contratanteNombre,
        cargo:  s.contratanteCargo,
        fecha:  s.contratanteFecha,
      },
    }

    const buffer = await renderToBuffer(
      createElement(SolicitudPDF, { data })
    )

    const nombre = s.solicitante?.trim().replace(/\s+/g, '_') || 'cliente'
    const fecha  = s.fecha?.replace(/\//g, '-') || 'sin-fecha'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="adquisicion-${nombre}_${fecha}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error generando PDF adquisición:', error)
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }
}

function parseFecha(fechaStr) {
  if (!fechaStr) return { dd: '--', mm: '--', aaaa: '----' }
  const [dd, mm, aaaa] = fechaStr.split('/')
  return { dd: dd ?? '--', mm: mm ?? '--', aaaa: aaaa ?? '----' }
}