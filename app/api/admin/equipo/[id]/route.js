import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    if (id === session.user.id) return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err.code === 'P2003') return NextResponse.json({ error: 'No se puede eliminar: el usuario tiene artículos publicados' }, { status: 409 })
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { name, email, role, avatarUrl, password, rubros } = body

    // Construir el objeto de actualizacion solo con los campos provistos
    const data = {}
    if (name !== undefined) data.name = name.trim()
    if (email !== undefined) data.email = email.trim().toLowerCase()
    if (role !== undefined) data.role = role
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl || null
    if (rubros !== undefined) data.rubros = rubros || []
    if (password !== undefined && password.length > 0) {
      if (password.length < 8) return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
      data.password = await bcrypt.hash(password, 10)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, rubros: true, createdAt: true, updatedAt: true },
    })

    return NextResponse.json(user)
  } catch (err) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 409 })
    if (err.code === 'P2025') return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}
