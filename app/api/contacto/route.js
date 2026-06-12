import prisma from '../../lib/prisma'
import { NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitKey } from '../../lib/rate-limit'

export async function POST(request) {
  // Rate limit: 5 contactos por IP cada 60 segundos
  const rl = checkRateLimit({ windowMs: 60_000, max: 5, id: getRateLimitKey(request, 'contacto') })
  if (!rl.ok) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.' }, { status: 429 })
  }

  try {
    const { name, email, company, message, type } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (name.length > 200 || email.length > 254 || message.length > 2000 || (company && company.length > 200)) {
      return NextResponse.json({ error: 'Campos demasiado largos' }, { status: 400 })
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
