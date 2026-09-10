import prisma from '../../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { syncImagenEspejo } from '../../../../../lib/imagenesCatalogo'
import { del } from '@vercel/blob'

// ── Guarda para escrituras: solo el administrador puede modificar imágenes ────
async function authWrite() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user?.role !== 'admin') return NextResponse.json({ error: 'Solo el administrador puede modificar imágenes' }, { status: 403 })
  return null
}

// Renormaliza `orden` de las imágenes restantes (0..n-1 contiguos)
async function renormalizarOrden(productoId) {
  const restantes = await prisma.productoImagen.findMany({
    where: { productoId },
    orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
    select: { id: true },
  })
  await prisma.$transaction(
    restantes.map((img, i) => prisma.productoImagen.update({ where: { id: img.id }, data: { orden: i } }))
  )
}

// ── POST — agregar una imagen (URL ya subida vía /api/upload) ──────────────────
export async function POST(req, { params }) {
  const err = await authWrite()
  if (err) return err

  const { id } = await params
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { url } = body ?? {}
  if (typeof url !== 'string' || !url.trim().startsWith('https://')) {
    return NextResponse.json({ error: 'La url de la imagen es inválida' }, { status: 400 })
  }

  const producto = await prisma.productoCatalogo.findUnique({ where: { id }, select: { id: true } })
  if (!producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

  const last = await prisma.productoImagen.findFirst({
    where: { productoId: id },
    orderBy: { orden: 'desc' },
    select: { orden: true },
  })
  const imagen = await prisma.productoImagen.create({
    data: { productoId: id, url: url.trim(), orden: (last?.orden ?? -1) + 1 },
  })

  await syncImagenEspejo(id)
  return NextResponse.json(imagen, { status: 201 })
}

// ── DELETE — quitar una imagen (?imagenId=X) ───────────────────────────────────
export async function DELETE(req, { params }) {
  const err = await authWrite()
  if (err) return err

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const imagenId = searchParams.get('imagenId')
  if (!imagenId) return NextResponse.json({ error: 'Falta imagenId' }, { status: 400 })

  const borrada = await prisma.productoImagen.findUnique({ where: { id: imagenId }, select: { url: true } })

  const res = await prisma.productoImagen.deleteMany({ where: { id: imagenId, productoId: id } })
  if (res.count === 0) return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })

  // Best-effort: eliminar el blob huérfano de Vercel
  if (borrada?.url) {
    try { await del(borrada.url) } catch { /* ignorar: el blob pudo ya no existir */ }
  }

  await renormalizarOrden(id)
  await syncImagenEspejo(id)
  return NextResponse.json({ ok: true })
}

// ── PUT — reordenar / hacer principal ({ orden: [id1, id2, ...] }) ─────────────
export async function PUT(req, { params }) {
  const err = await authWrite()
  if (err) return err

  const { id } = await params
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const orden = body?.orden
  if (!Array.isArray(orden) || orden.some(o => typeof o !== 'string')) {
    return NextResponse.json({ error: 'Se espera un array de ids en "orden"' }, { status: 400 })
  }

  const actuales = await prisma.productoImagen.findMany({
    where: { productoId: id },
    select: { id: true },
  })
  const idsActuales = actuales.map(a => a.id)
  if (orden.length !== idsActuales.length || !orden.every(o => idsActuales.includes(o))) {
    return NextResponse.json({ error: 'El orden no coincide con las imágenes del producto' }, { status: 400 })
  }

  await prisma.$transaction(
    orden.map((imgId, i) => prisma.productoImagen.update({ where: { id: imgId }, data: { orden: i } }))
  )

  await syncImagenEspejo(id)
  return NextResponse.json({ ok: true })
}
