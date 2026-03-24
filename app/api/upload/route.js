import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file')

  if (!file) return Response.json({ error: 'No se recibió archivo' }, { status: 400 })

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return Response.json({ error: 'Tipo de archivo no válido' }, { status: 400 })
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return Response.json({ error: 'El archivo no puede pesar más de 5MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
  })

  return Response.json({ url: blob.url })
}