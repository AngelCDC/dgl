import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { buildAccessWhere } from '../../../../lib/access'

// ── Helpers ────────────────────────────────────────────────────────────────────
async function canWrite(session) {
  if (!session?.user) return false
  if (session.user.role === 'admin') return true
  if (session.user.role === 'trabajador') return true
  // cliente → no puede escribir
  return false
}

// ── GET — cargar adquisición completa ─────────────────────────────────────────
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  // Construir filtro de acceso
  const accessWhere = await buildAccessWhere(session, { id })

  const adquisicion = await prisma.solicitudAdquisicion.findFirst({
    where: accessWhere,
    include: {
      cotizantes:       { orderBy: { sortOrder: 'asc' } },
      riesgos:          { orderBy: { sortOrder: 'asc' } },
      solicitudProcura: { include: { productos: true } },
    },
  })

  if (!adquisicion) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  return NextResponse.json(adquisicion)
}

// ── PATCH — actualizar campos + cotizantes + riesgos ─────────────────────────
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!(await canWrite(session))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params

  try {
    const body = await req.json()
    const { cotizantes, riesgos, ...campos } = body

    // ── Whitelist de campos permitidos (previene mass assignment) ─────────
    const ALLOWED_SCALAR = [
      'fecha', 'tipoDocumento', 'tipoDocumentoOtro', 'solicitante', 'ccNit',
      'telCel', 'ext', 'email', 'descripcionNecesidad', 'pertinencia',
      'descripcionObjeto', 'especificaciones', 'requierePermisos', 'obligaciones',
      'modalidad', 'justificacionModalidad', 'valorEstimado', 'formaPago',
      'detallePago', 'criterioMenorPrecio', 'criterioOtro', 'contratistaNombre',
      'contratistaCcNit', 'contratistaEmail', 'contratistaCiudad',
      'contratistaTelefono', 'plazo', 'cronogramaChina', 'comiteEvaluador',
      'elaboradoPorNombre', 'elaboradoPorCargo', 'elaboradoPorFecha',
      'contratanteNombre', 'contratanteCargo', 'contratanteFecha',
    ]
    const safeData = {}
    for (const key of ALLOWED_SCALAR) {
      if (campos[key] !== undefined) safeData[key] = campos[key]
    }

    const adquisicion = await prisma.$transaction(async (tx) => {

      // 1. Actualizar campos escalares
      const updated = await tx.solicitudAdquisicion.update({
        where: { id },
        data: {
          ...safeData,
          updatedAt: new Date(),
        },
      })

      // 2. Reemplazar cotizantes si vienen en el payload
      if (Array.isArray(cotizantes)) {
        await tx.cotizanteAdquisicion.deleteMany({ where: { solicitudId: id } })
        if (cotizantes.length > 0) {
          await tx.cotizanteAdquisicion.createMany({
            data: cotizantes.map((c, i) => ({
              solicitudId:    id,
              productoNombre: c.productoNombre ?? null, // ← fix
              nombre:         c.nombre,
              valor:          c.valor,
              sortOrder:      i,
            })),
          })
        }
      }

      // 3. Reemplazar riesgos si vienen en el payload
      if (Array.isArray(riesgos)) {
        await tx.riesgoAdquisicion.deleteMany({ where: { solicitudId: id } })
        if (riesgos.length > 0) {
          await tx.riesgoAdquisicion.createMany({
            data: riesgos.map((r, i) => ({
              solicitudId: id,
              descripcion: r.descripcion,
              mitigacion:  r.mitigacion ?? null,
              asignacion:  r.asignacion ?? 'Contratante',
              sortOrder:   i,
            })),
          })
        }
      }

      return updated
    })

    return NextResponse.json({ ok: true, id: adquisicion.id })

  } catch (error) {
    console.error('Error actualizando adquisición:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}

// ── DELETE — eliminar adquisición ────────────────────────────────────────────
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!(await canWrite(session))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params

  try {
    await prisma.solicitudAdquisicion.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error eliminando adquisición:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
}

// ── POST /emitir — cambiar status a finalizado ────────────────────────────────
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!(await canWrite(session))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params

  try {
    const { action } = await req.json()

    if (action === 'emitir') {
      const hoy = new Date().toISOString().split('T')[0]
      const current = await prisma.solicitudAdquisicion.findUnique({ where: { id }, select: { elaboradoPorFecha: true, contratanteFecha: true } })
      await prisma.solicitudAdquisicion.update({
        where: { id },
        data: {
          status: 'finalizado',
          updatedAt: new Date(),
          elaboradoPorNombre: 'Angel Dubois',
          elaboradoPorCargo:  'FOUNDER - CEO',
          ...(!current?.elaboradoPorFecha && { elaboradoPorFecha: hoy }),
          ...(!current?.contratanteFecha  && { contratanteFecha:  hoy }),
        },
      })
      return NextResponse.json({ ok: true, status: 'finalizado' })
    }

    if (action === 'reabrir') {
      await prisma.solicitudAdquisicion.update({
        where: { id },
        data: { status: 'borrador', updatedAt: new Date() },
      })
      return NextResponse.json({ ok: true, status: 'borrador' })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })

  } catch (error) {
    console.error('Error emitiendo adquisición:', error)
    return NextResponse.json({ error: 'Error al emitir' }, { status: 500 })
  }
}