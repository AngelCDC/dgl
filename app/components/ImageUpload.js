'use client'
import { useState } from 'react'

export default function ImageUpload({ value, onChange, label = 'Imagen', aspectRatio = '16/9' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setUploading(false)

    if (!res.ok) {
      setError(data.error ?? 'Error al subir imagen')
      return
    }

    onChange(data.url)
  }

  function handleRemove() {
    onChange('')
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', color: 'var(--steel)', marginBottom: '8px' }}>{label}</label>

      {value ? (
        <div style={{ position: 'relative', aspectRatio, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg)', marginBottom: '8px' }}>
          <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <button
            onClick={handleRemove}
            style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(10,22,40,0.8)', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '12px', fontFamily: 'var(--font-dm)', cursor: 'pointer', borderRadius: '2px' }}
          >
            Quitar
          </button>
        </div>
      ) : (
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio, border: '1.5px dashed var(--border)', background: 'var(--bg)', cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: '8px', gap: '8px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--steel)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', color: 'var(--steel)' }}>
            {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--border)' }}>JPG, PNG, WEBP — máx 5MB</span>
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
        </label>
      )}

      {error && <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}