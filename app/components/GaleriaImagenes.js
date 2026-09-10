'use client'

import { useState, useRef } from 'react'

// ─── Galería de imágenes de un producto del catálogo (admin) ─────────────────
// Sube a /api/upload (Vercel Blob) y registra la URL en
// /api/admin/catalogo/{productoId}/imagenes. La primera imagen es la principal.
export default function GaleriaImagenes({ productoId, imagenes, onChange }) {
  const [items,      setItems]      = useState(imagenes ?? [])
  const [uploading,  setUploading]  = useState(false)
  const [error,      setError]      = useState('')
  const fileRef = useRef(null)

  async function subirArchivo(file) {
    const formData = new FormData()
    formData.append('file', file)
    const r = await fetch('/api/upload', { method: 'POST', body: formData })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Error al subir la imagen')

    const r2 = await fetch(`/api/admin/catalogo/${productoId}/imagenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: d.url }),
    })
    const d2 = await r2.json()
    if (!r2.ok) throw new Error(d2.error || 'Error al registrar la imagen')
    return d2
  }

  async function handleFiles(files) {
    const lista = Array.from(files)
    if (lista.length === 0) return
    setError('')
    setUploading(true)
    const nuevos = [...items]
    try {
      for (const file of lista) {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          throw new Error(`Tipo de archivo no válido (${file.name})`)
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`El archivo ${file.name} no puede pesar más de 5MB`)
        }
        const img = await subirArchivo(file)
        nuevos.push(img)
        // Commit por archivo: si otro del lote falla, lo subido queda visible y consistente con la DB
        setItems(nuevos)
        onChange?.(nuevos)
      }
    } catch (e) {
      setError(e.message || 'Error al subir imágenes')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function hacerPrincipal(idx) {
    if (idx === 0) return
    const orden = [...items]
    const [moved] = orden.splice(idx, 1)
    orden.unshift(moved)
    const r = await fetch(`/api/admin/catalogo/${productoId}/imagenes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orden: orden.map(i => i.id) }),
    })
    const d = await r.json()
    if (!r.ok) { setError(d.error || 'Error al reordenar'); return }
    setItems(orden)
    onChange?.(orden)
  }

  async function eliminar(idx) {
    const img = items[idx]
    if (!window.confirm('¿Eliminar esta imagen?')) return
    const r = await fetch(`/api/admin/catalogo/${productoId}/imagenes?imagenId=${img.id}`, { method: 'DELETE' })
    const d = await r.json()
    if (!r.ok) { setError(d.error || 'Error al eliminar la imagen'); return }
    const nuevos = items.filter((_, i) => i !== idx)
    setItems(nuevos)
    onChange?.(nuevos)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            border: '1px solid #2563eb',
            background: 'white',
            color: '#2563eb',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: uploading ? 'default' : 'pointer',
            opacity: uploading ? 0.5 : 1,
            fontFamily: 'inherit',
          }}
        >
          {uploading ? 'Subiendo…' : 'Subir imagen'}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <span style={{ fontSize: '12px', color: '#888' }}>{items.length} {items.length === 1 ? 'imagen' : 'imágenes'}</span>
      </div>

      {error && (
        <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '10px' }}>{error}</div>
      )}

      {items.length > 0 ? (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {items.map((img, idx) => (
            <div
              key={img.id}
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                border: '1px solid #e8e8e8',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#fafafa',
              }}
            >
              <img src={img.url} alt={`Imagen ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {idx === 0 && (
                <span style={{
                  position: 'absolute', top: '4px', left: '4px',
                  background: '#2563eb', color: '#fff',
                  fontSize: '9px', fontWeight: '700',
                  padding: '2px 6px', borderRadius: '10px',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  Principal
                </span>
              )}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: '4px',
                padding: '3px', background: 'rgba(0,0,0,0.45)',
              }}>
                <button
                  onClick={() => hacerPrincipal(idx)}
                  title="Hacer principal"
                  style={{
                    border: 'none', background: 'white', color: '#111',
                    borderRadius: '4px', padding: '1px 6px',
                    fontSize: '10px', cursor: 'pointer', fontWeight: '600',
                  }}
                >
                  ★
                </button>
                <button
                  onClick={() => eliminar(idx)}
                  title="Eliminar"
                  style={{
                    border: 'none', background: 'white', color: '#dc2626',
                    borderRadius: '4px', padding: '1px 7px',
                    fontSize: '10px', cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Este producto aún no tiene imágenes.</p>
      )}
    </div>
  )
}
