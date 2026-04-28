import prisma from '../../lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { name, email, company, message, type } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Correo electrónico inválido' }, { status: 400 })
    }

    const contacto = await prisma.contactRequest.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() || null,
        message: message.trim(),
        type: type || 'general',
        status: 'new',
      },
    })

    return NextResponse.json({ ok: true, id: contacto.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
