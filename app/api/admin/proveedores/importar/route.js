import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import * as XLSX from 'xlsx'

// ── POST — importar proveedores desde un archivo Excel ──────────────────────────
// Body: FormData con campo "file" (xlsx)
// ?modo=reemplazar → borra todo antes de importar
// ?modo=agregar    → agrega sin borrar (default)
//
// El Excel debe tener una fila de encabezados con columnas como:
//   Nombre | Link | Provincia | Direccion | Encargado | Telefono | Fax | correo | Categoria | ...
// Se detectan por palabra clave (case-insensitive).
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const url  = new URL(req.url)
    const modo = url.searchParams.get('modo') ?? 'agregar'

    const formData = await req.formData()
    const file     = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }

    const buffer   = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })

    // Tomar la primera hoja
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return NextResponse.json({ error: 'El archivo no contiene hojas' }, { status: 400 })
    }

    const sheet    = workbook.Sheets[sheetName]
    const rows     = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })
    if (rows.length < 2) {
      return NextResponse.json({ error: 'El archivo está vacío o no tiene datos' }, { status: 400 })
    }

    // ── Detectar columnas ─────────────────────────────────────────────────────
    const headers = rows[0].map(h => (h ?? '').toString().trim().toLowerCase())

    const col = (...keywords) => {
      for (const kw of keywords) {
        const i = headers.findIndex(h => h.includes(kw))
        if (i !== -1) return i
      }
      return -1
    }

    const iNombre     = col('nombre')
    const iWebsite    = col('website', 'sitio', 'web')        // "Link" se omite a propósito
    const iProvincia  = col('provincia', 'estado', 'ciudad', 'city')
    const iDireccion  = col('direccion', 'dirección')
    const iZip        = col('zip', 'postal', 'cp')
    const iEncargado  = col('encargado', 'contacto')
    const iTelefono   = col('telefono', 'teléfono', 'tel', 'fono', 'telf', 'phone')
    const iFax        = col('fax')
    const iCorreo     = col('correo', 'email', 'mail', 'e-mail')
    const iDescripcion = col('descripcion', 'descripción')
    const iCategoria  = col('categor')

    if (iNombre === -1) {
      return NextResponse.json({
        error: 'No se encontró la columna "Nombre" en el archivo. Columnas detectadas: ' + headers.join(', '),
      }, { status: 400 })
    }

    // ── Pre-cargar categorías para hacer match por nombre ─────────────────────
    const categorias = await prisma.category.findMany({
      where: { type: { in: ['supplier', 'both'] } },
      select: { id: true, name: true },
    })
    const catMap = new Map()
    for (const c of categorias) {
      catMap.set(c.name.trim().toLowerCase(), c.id)
    }

    // ── Parsear proveedores ───────────────────────────────────────────────────
    const str = (v) => (v ?? '').toString().trim() || null

    const proveedores = rows.slice(1)
      .filter(r => str(r[iNombre]))  // debe tener al menos nombre
      .map(r => {
        // Agrupar info secundaria en internalNotes
        const notas = []
        if (iDireccion >= 0 && str(r[iDireccion])) notas.push(`Dirección: ${str(r[iDireccion])}`)
        if (iEncargado >= 0 && str(r[iEncargado])) notas.push(`Encargado: ${str(r[iEncargado])}`)
        if (iFax       >= 0 && str(r[iFax]))       notas.push(`Fax: ${str(r[iFax])}`)
        if (iZip       >= 0 && str(r[iZip]))       notas.push(`ZIP: ${str(r[iZip])}`)

        const catName = iCategoria >= 0 ? str(r[iCategoria]) : null
        const categoryId = catName ? (catMap.get(catName.toLowerCase()) ?? null) : null

        return {
          name:          str(r[iNombre]),
          website:       iWebsite    >= 0 ? str(r[iWebsite])    : null,
          city:          iProvincia  >= 0 ? str(r[iProvincia])  : null,
          email:         iCorreo     >= 0 ? str(r[iCorreo])     : null,
          phone:         iTelefono   >= 0 ? str(r[iTelefono])   : null,
          description:   iDescripcion >= 0 ? str(r[iDescripcion]) : null,
          categoryId,
          catName:       catName,
          catMatched:    catName ? catMap.has(catName.toLowerCase()) : null,
          internalNotes: notas.length > 0 ? notas.join(' | ') : null,
        }
      })

    if (proveedores.length === 0) {
      return NextResponse.json({ error: 'No se encontraron proveedores válidos en el archivo' }, { status: 400 })
    }

    // Slug helper
    function slugify(name) {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    // ── Insertar ──────────────────────────────────────────────────────────────
    let creados = 0
    await prisma.$transaction(async (tx) => {
      if (modo === 'reemplazar') {
        await tx.supplier.deleteMany()
      }

      for (const p of proveedores) {
        // Generar slug único
        let baseSlug = slugify(p.name)
        let slug = baseSlug
        let suffix = 1
        while (await tx.supplier.count({ where: { slug } }) > 0) {
          slug = `${baseSlug}-${suffix}`
          suffix++
        }

        await tx.supplier.create({
          data: {
            name:          p.name,
            slug,
            description:   p.description,
            website:       p.website,
            city:          p.city,
            email:         p.email,
            phone:         p.phone,
            country:       'China',
            categoryId:    p.categoryId,
            internalNotes: p.internalNotes,
            status:        'pending',
          },
        })
        creados++
      }
    }, { timeout: 60000 })

    const sinCategoria = proveedores.filter(p => p.catName && !p.catMatched).map(p => p.catName)

    return NextResponse.json({
      ok: true,
      modo,
      total: creados,
      sinCategoria: [...new Set(sinCategoria)],
    })

  } catch (err) {
    console.error('Error importando proveedores:', err)
    return NextResponse.json({ error: err.message ?? 'Error al importar' }, { status: 500 })
  }
}
