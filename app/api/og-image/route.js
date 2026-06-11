import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new NextResponse('Missing url', { status: 400 })
  }

  // Solo permitir imágenes del blob de Vercel
  if (!imageUrl.startsWith('https://3rantjnwa32byngj.public.blob.vercel-storage.com/')) {
    return new NextResponse('URL not allowed', { status: 403 })
  }

  try {
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000', // 30 días
      },
    })
  } catch (error) {
    return new NextResponse('Error fetching image', { status: 500 })
  }
}