'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { normalizeReporte, metricColor, scoreColor, scoreLabel, isEmpty } from '../../lib/reportes/verificacion'

export default function ReportesAdminPage() {
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  // Upload state
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [raw, setRaw] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [parseError, setParseError] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reportes')
      if (res.ok) setReportes(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── File selection ──────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const f = e.target.files?.[0]
    setFile(f || null)
    setPreview(null)
    setRaw(null)
    setParseError(null)
    setUploadResult(null)

    if (!f) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const normalized = normalizeReporte(parsed)
        setRaw(parsed)
        setPreview(normalized)
        setParseError(null)
      } catch (err) {
        setParseError('El archivo no contiene JSON válido. Verifica el formato.')
        setPreview(null)
        setRaw(null)
      }
    }
    reader.onerror = () => {
      setParseError('Error al leer el archivo.')
    }
    reader.readAsText(f)
  }

  // ── Upload ──────────────────────────────────────────────────────────────────
  async function handleUpload() {
    if (!raw) return
    setUploading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: raw }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMsg({ type: 'error', text: json.error || 'Error al subir el informe' })
        return
      }
      setUploadResult(json)
      setFile(null)
      setPreview(null)
      setRaw(null)
      setMsg({ type: 'ok', text: 'Informe creado correctamente' })
      load()
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión al subir el informe' })
    } finally {
      setUploading(false)
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!confirm('¿Eliminar este informe de verificación?')) return
    try {
      const res = await fetch(`/api/admin/reportes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Informe eliminado' })
        load()
      } else {
        const json = await res.json()
        setMsg({ type: 'error', text: json.error || 'Error al eliminar' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión' })
    }
  }

  // ── Toggle visible ──────────────────────────────────────────────────────────
  async function handleToggle(reporte) {
    try {
      const res = await fetch(`/api/admin/reportes/${reporte.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: !reporte.visible }),
      })
      if (res.ok) load()
    } catch { /* silent */ }
  }

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111', letterSpacing: '-0.01em', marginBottom: '3px' }}>
            Informes de Verificación
          </h1>
          <p style={{ fontSize: '13px', color: '#888' }}>
            Sube archivos JSON de due diligence para generar reportes formateados
          </p>
        </div>
      </div>

      {/* ── Mensaje ─────────────────────────────────────────────────────────── */}
      {msg && (
        <div style={{
          marginBottom: '20px', padding: '12px 16px',
          background: msg.type === 'ok' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${msg.type === 'ok' ? '#a7f3d0' : '#fecaca'}`,
          color: msg.type === 'ok' ? '#065f46' : '#dc2626',
          fontSize: '13px', fontFamily: 'var(--font-inter)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '16px' }}>×</button>
        </div>
      )}

      {/* ── Upload card ──────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '16px' }}>
          Subir nuevo informe
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'inline-block', padding: '10px 20px', background: '#0b1628', color: '#fff',
            fontSize: '13px', fontWeight: '500', cursor: 'pointer', borderRadius: '8px',
            fontFamily: 'var(--font-dm)',
          }}>
            {file ? file.name : 'Seleccionar archivo JSON'}
            <input type="file" accept=".json,application/json" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
          {file && (
            <button onClick={() => { setFile(null); setPreview(null); setRaw(null); setParseError(null) }}
              style={{ marginLeft: '10px', padding: '9px 16px', border: '1px solid #ddd', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#888' }}>
              Quitar
            </button>
          )}
        </div>

        {parseError && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
            {parseError}
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div style={{ background: '#f9fafb', border: '1px solid #eee', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
              Vista previa del informe
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <PreviewField label="Empresa" value={preview.company.nombreEs} />
              <PreviewField label="Nombre (ZH)" value={preview.company.nombreZh} mono />
              <PreviewField label="Código USCC" value={preview.company.codigoCreditoSocial} mono />
              <PreviewField label="Estado" value={preview.company.estado} />
              <PreviewField label="Representante legal" value={preview.company.representanteLegal} />
              <PreviewField label="Score total">
                <span style={{ fontWeight: '700', fontSize: '16px', color: scoreColor(preview.totalScore) }}>
                  {preview.totalScore} — {scoreLabel(preview.totalScore)}
                </span>
              </PreviewField>
              <PreviewField label="Registros totales" value={preview.totalRecords} />
              <PreviewField label="Permisos" value={preview.permits.total} />
              <PreviewField label="Sanciones" value={preview.sanctions.total} />
              <PreviewField label="Excepciones" value={preview.exceptions.total} />
              <PreviewField label="Blacklist" value={preview.blacklist.total} />
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {preview.metrics.map(m => (
                <span key={m.key} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  padding: '3px 8px', borderRadius: '12px',
                  background: m.value > 0 ? '#fef3c7' : '#ecfdf5',
                  color: m.value > 0 ? '#92400e' : '#065f46',
                  border: `1px solid ${m.value > 0 ? '#fcd34d' : '#a7f3d0'}`,
                }}>
                  {m.labelEs}: {m.value}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleUpload} disabled={!raw || uploading}
            style={{
              padding: '10px 24px', background: !raw || uploading ? '#ccc' : '#2563eb', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: !raw || uploading ? 'default' : 'pointer',
              fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '500',
            }}>
            {uploading ? 'Subiendo...' : 'Subir informe'}
          </button>
        </div>

        {uploadResult && (
          <div style={{ marginTop: '14px', padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px' }}>
            <div style={{ marginBottom: '8px', color: '#1d4ed8', fontWeight: '500' }}>✓ Informe creado</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href={`/auditorias/reporte/${uploadResult.id}`} style={{ color: '#2563eb', fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '500' }}>
                Ver informe →
              </Link>
              <a href={`/api/admin/reportes/${uploadResult.id}/pdf`} style={{ color: '#2563eb', fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '500' }}>
                Descargar PDF ↓
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Lista de reportes ────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Informes guardados ({reportes.length})</span>
        </div>

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Cargando...</div>
        ) : reportes.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
            No hay informes todavía. Sube tu primer archivo JSON.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #eee' }}>
                  <th style={thStyle}>Empresa</th>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Visible</th>
                  <th style={thStyle}>Fecha</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '500', color: '#111' }}>{r.nombreEmpresa}</div>
                      {r.nombreEmpresaZh && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#aaa' }}>{r.nombreEmpresaZh}</div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#888' }}>
                      {r.codigoCreditoSocial || '—'}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: '700', color: scoreColor(r.puntajeTotal) }}>
                        {r.puntajeTotal ?? '—'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => handleToggle(r)}
                        style={{
                          padding: '4px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                          fontSize: '11px', fontWeight: '500',
                          background: r.visible ? '#dcfce7' : '#f4f4f5',
                          color: r.visible ? '#15803d' : '#888',
                        }}>
                        {r.visible ? 'Visible' : 'Oculto'}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: '#aaa' }}>
                      {new Date(r.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <Link href={`/auditorias/reporte/${r.id}`}
                          style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '11px', color: '#2563eb', textDecoration: 'none', fontFamily: 'var(--font-dm)' }}>
                          Ver
                        </Link>
                        <a href={`/api/admin/reportes/${r.id}/pdf`}
                          style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '11px', color: '#888', textDecoration: 'none', fontFamily: 'var(--font-dm)' }}>
                          PDF
                        </a>
                        <button onClick={() => handleDelete(r.id)}
                          style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '11px', color: '#dc2626', background: '#fff', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '10px',
  fontWeight: '600',
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontFamily: 'var(--font-dm)',
}

const tdStyle = {
  padding: '12px 14px',
  fontSize: '13px',
  color: '#555',
}

// ─── Preview field ────────────────────────────────────────────────────────────
function PreviewField({ label, value, mono, children }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px', fontFamily: 'var(--font-dm)' }}>
        {label}
      </div>
      {children ? children : (
        <div style={{
          fontSize: '13px', color: '#333',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-inter)',
          wordBreak: 'break-all',
        }}>
          {value || '—'}
        </div>
      )}
    </div>
  )
}
