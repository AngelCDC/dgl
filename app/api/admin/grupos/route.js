import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const grupos = await prisma.grupoEmpresarial.findMany({
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { reportes: true, clientes: true } } },
    })
    return NextResponse.json(grupos)
  } catch {
    return NextResponse.json({ error: 'Error al obtener grupos' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Acceso restringido' }, { status: 403 })

  try {
    const body = await req.json()
    const nombre = String(body.nombre ?? '').trim()
    const empresaPrincipal = String(body.empresaPrincipal ?? '').trim()

    if (!nombre || !empresaPrincipal) {
      return NextResponse.json({ error: 'El nombre del grupo y la empresa principal son obligatorios' }, { status: 400 })
    }

    const grupo = await prisma.grupoEmpresarial.create({
      data: {
        nombre,
        nombreZh: body.nombreZh ? String(body.nombreZh).trim() : null,
        empresaPrincipal,
        descripcion: body.descripcion ? String(body.descripcion).trim() : null,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(grupo, { status: 201 })
  } catch (err) {
    console.error('Error al crear grupo:', err)
    return NextResponse.json({ error: 'Error al crear grupo' }, { status: 500 })
  }
}
