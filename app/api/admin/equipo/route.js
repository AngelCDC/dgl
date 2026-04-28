import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true, avatarUrl: true },
    })
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { name, email, password, role } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), password: hashed, role: role || 'editor' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 409 })
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
