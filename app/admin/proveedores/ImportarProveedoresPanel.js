'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportarProveedoresPanel() {
  const [open,    setOpen]    = useState(false)
  const [file,    setFile]    = useState(null)
  const [modo,    setModo]    = useState('agregar')
  const [status,  setStatus]  = useState(null)
  const fileRef = useRef()
  const router = useRouter()

  async function handleImport() {
    if (!file) return
    setStatus('loading')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r  = await fetch(`/api/admin/proveedores/importar?modo=${modo}`, { method: 'POST', body: fd })
      const d  = await r.json()
      if (!r.ok) { setStatus({ ok: false, msg: d.error ?? 'Error al importar' }); return }

      let msg = `✅ ${d.total} proveedores importados (modo: ${d.modo}).`
      if (d.sinCategoria?.length > 0) {
        msg += ` Categorías no encontradas: ${d.sinCategoria.join(', ')}`
      }
      setStatus({ ok: true, msg })
      router.refresh()
    } catch (e) {
      setStatus({ ok: false, msg: e.message })
    }
  }

  return (
    <>
      {/* Botón toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          height: '36px',
          padding: '0 16px',
          background: open ? '#f4f4f5' : '#111',
          color: open ? '#555' : 'white',
          border: open ? '1px solid #e0e0e0' : 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
        }}
      >
        {open ? '✕ Cerrar importador' : '📥 Importar Excel'}
      </button>

      {/* Panel de importación */}
      {open && (
        <div style={{
          background: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '12px',
          overflow: 'hidden',
          marginTop: '16px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          {/* Header */}
          <div style={{
            background: '#0b1628',
            color: 'white',
            padding: '14px 20px',
            borderRadius: '10px 10px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '16px' }}>📥</span>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>Importar proveedores desde Excel</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Columnas esperadas: <strong>Nombre</strong> · Link · Provincia · Dirección · Encargado · Teléfono · Fax · correo · Categoría
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {/* Selector de archivo */}
              <div>
                <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Archivo (.xlsx)
                </div>
                <button
                  onClick={() => fileRef.current.click()}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    border: `1px solid ${file ? '#86efac' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    background: file ? '#f0fdf4' : 'white',
                    color: file ? '#166534' : '#555',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {file ? `📄 ${file.name}` : 'Seleccionar archivo…'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={e => setFile(e.target.files[0] || null)}
                />
              </div>

              {/* Modo */}
              <div>
                <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Modo
                </div>
                <select
                  value={modo}
                  onChange={e => setModo(e.target.value)}
                  style={{
                    height: '36px',
                    padding: '0 12px',
                    fontSize: '13px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    background: 'white',
                    color: '#111',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="agregar">Agregar (mantiene existentes)</option>
                  <option value="reemplazar">Reemplazar (borra todo primero)</option>
                </select>
              </div>

              {/* Botón importar */}
              <button
                onClick={handleImport}
                disabled={!file || status === 'loading'}
                style={{
                  height: '36px',
                  padding: '0 18px',
                  background: '#111',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: !file || status === 'loading' ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: !file || status === 'loading' ? 0.5 : 1,
                }}
              >
                {status === 'loading' ? 'Importando…' : 'Importar ahora'}
              </button>
            </div>

            {/* Status message */}
            {status && status !== 'loading' && (
              <div style={{
                marginTop: '14px',
                fontSize: '13px',
                color: status.ok ? '#166534' : '#dc2626',
                background: status.ok ? '#f0fdf4' : '#fef2f2',
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${status.ok ? '#86efac' : '#fca5a5'}`,
              }}>
                {status.msg}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
