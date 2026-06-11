import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

// PATCH — Cambiar contraseña del usuario autenticado
export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const userId = session.user.id

    // Para admins que cambian su propia contraseña, verificar la actual
    if (currentPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
      if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al cambiar la contraseña' }, { status: 500 })
  }
}
