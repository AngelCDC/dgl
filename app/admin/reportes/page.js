'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { normalizeReporte, metricColor, scoreColor, scoreLabel, isEmpty } from '../../lib/reportes/verificacion'

// ─── Modal de grupo empresarial (a nivel de módulo: evita perder el foco al teclear) ──
// Flujo: 1) crear grupo nuevo (esta empresa como principal) o añadir a uno existente
//        2) escoger otras empresas para completar el grupo.
function GrupoModal({ reporte, grupos, reportesTodos, onClose, onDone }) {
  const [paso, setPaso] = useState('inicio') // inicio | completar
  const [modo, setModo] = useState('crear')   // crear | existente
  const [form, setForm] = useState({
    nombre: reporte.nombreEmpresa,
    nombreZh: reporte.nombreEmpresaZh ?? '',
    empresaPrincipal: reporte.nombreEmpresa,
    descripcion: '',
  })
  const [grupoIdExistente, setGrupoIdExistente] = useState('')
  const [grupoCreado, setGrupoCreado] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [seleccionados, setSeleccionados] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Otras empresas disponibles: sin grupo y distintas a la actual
  const disponibles = (reportesTodos || []).filter(r => !r.grupoId && r.id !== reporte.id)
  const listaFiltrada = disponibles.filter(r =>
    !filtro || (r.nombreEmpresa + ' ' + (r.nombreEmpresaZh || '')).toLowerCase().includes(filtro.toLowerCase())
  )

  function toggle(id) {
    setSeleccionados(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function asignarReporte(grupoId, reporteId) {
    const res = await fetch(`/api/admin/reportes/${reporteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grupoId }),
    })
    if (!res.ok) throw new Error('falló la asignación')
  }

  // ── Paso 1: definir el grupo y vincular esta empresa ──
  async function continuar() {
    setSaving(true)
    setError(null)
    try {
      let grupoId = null
      if (modo === 'crear') {
        if (!form.nombre.trim() || !form.empresaPrincipal.trim()) {
          setError('El nombre del grupo y la empresa principal son obligatorios.')
          return
        }
        const res = await fetch('/api/admin/grupos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const json = await res.json()
        if (!res.ok) { setError(json.error || 'Error al crear el grupo'); return }
        grupoId = json.id
        setGrupoCreado(json)
      } else {
        if (!grupoIdExistente) { setError('Selecciona un grupo.'); return }
        grupoId = grupoIdExistente
      }
      await asignarReporte(grupoId, reporte.id)
      setPaso('completar')
    } catch {
      setError('Error de conexión al crear el grupo')
    } finally {
      setSaving(false)
    }
  }

  // ── Paso 2: añadir las empresas escogidas y cerrar ──
  async function finalizar() {
    setSaving(true)
    setError(null)
    try {
      const grupoId = grupoCreado?.id || grupoIdExistente
      await Promise.all(seleccionados.map(id => asignarReporte(grupoId, id)))
      onDone(grupoId)
    } catch {
      setError('Error al añadir las empresas seleccionadas')
      setSaving(false)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {paso === 'inicio' ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>
              Grupo empresarial — {reporte.nombreEmpresa}
            </div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
              Agrupa empresas relacionadas (matriz, filiales, asociadas) para ver su panorama completo.
            </p>

            {/* Selector de modo */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <button onClick={() => setModo('crear')} style={modo === 'crear' ? modoOnStyle : modoOffStyle}>
                ✚ Crear grupo nuevo
              </button>
              <button onClick={() => setModo('existente')} style={modo === 'existente' ? modoOnStyle : modoOffStyle}>
                Añadir a grupo existente
              </button>
            </div>

            {modo === 'crear' ? (
              <>
                <ModalField label="Empresa principal (esta empresa) *">
                  <input value={form.empresaPrincipal} onChange={e => set('empresaPrincipal', e.target.value)} style={inputStyle} />
                </ModalField>
                <ModalField label="Nombre del grupo *">
                  <input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inputStyle} />
                </ModalField>
                <ModalField label="Nombre en chino">
                  <input value={form.nombreZh} onChange={e => set('nombreZh', e.target.value)} style={inputStyle} />
                </ModalField>
                <ModalField label="Notas internas">
                  <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                    rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-inter)' }} />
                </ModalField>
              </>
            ) : (
              <div style={{ marginBottom: 18 }}>
                <ModalField label="Grupo existente">
                  <select value={grupoIdExistente} onChange={e => setGrupoIdExistente(e.target.value)} style={inputStyle}>
                    <option value="">Seleccionar grupo...</option>
                    {grupos.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.nombre} ({g._count?.reportes ?? 0} informe(s))
                      </option>
                    ))}
                  </select>
                </ModalField>
              </div>
            )}

            {error && <ErrorBox text={error} />}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={onClose} disabled={saving} style={secBtnStyle}>Cancelar</button>
              <button onClick={continuar} disabled={saving} style={priBtnStyle}>
                {saving ? 'Guardando...' : 'Continuar'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>
              Añadir más empresas al grupo
            </div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
              {reporte.nombreEmpresa} ya está en el grupo. Escoge otras empresas relacionadas (opcional).
            </p>

            <input
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Buscar por nombre de empresa..."
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
              {listaFiltrada.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', fontSize: 12.5 }}>
                  {disponibles.length === 0 ? 'No hay más informes sin grupo disponibles.' : 'Sin coincidencias.'}
                </div>
              ) : (
                listaFiltrada.map(r => (
                  <label key={r.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                    cursor: 'pointer', borderBottom: '1px solid #f5f5f5', fontSize: 13, color: '#333',
                    background: seleccionados.includes(r.id) ? '#eff6ff' : '#fff',
                  }}>
                    <input type="checkbox" checked={seleccionados.includes(r.id)} onChange={() => toggle(r.id)} />
                    <span style={{ flex: 1 }}>{r.nombreEmpresa}</span>
                    {r.nombreEmpresaZh && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#aaa' }}>{r.nombreEmpresaZh}</span>
                    )}
                  </label>
                ))
              )}
            </div>

            {error && <ErrorBox text={error} />}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 12, color: '#888' }}>{seleccionados.length} seleccionada(s)</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={finalizar} disabled={saving} style={secBtnStyle}>
                  {seleccionados.length === 0 ? 'Finalizar sin añadir' : 'Saltar este paso'}
                </button>
                <button onClick={finalizar} disabled={saving || seleccionados.length === 0} style={priBtnStyle}>
                  {saving ? 'Añadiendo...' : `Añadir ${seleccionados.length || ''} al grupo`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ModalField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, fontFamily: 'var(--font-dm)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function ErrorBox({ text }) {
  return (
    <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 12.5, borderRadius: 8, marginBottom: 14 }}>
      {text}
    </div>
  )
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  padding: '80px 16px', zIndex: 100, backdropFilter: 'blur(2px)',
}
const modalStyle = {
  background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 520,
  boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
}
const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8,
  fontSize: 13, color: '#111', fontFamily: 'var(--font-inter)', background: '#fff', boxSizing: 'border-box',
}
const priBtnStyle = {
  padding: '9px 20px', background: '#2563eb', color: '#fff', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 500,
}
const secBtnStyle = {
  padding: '9px 16px', background: '#fff', color: '#888', border: '1px solid #ddd',
  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13,
}
const modoOnStyle = {
  padding: '8px 14px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12.5, fontWeight: 600,
}
const modoOffStyle = {
  padding: '8px 14px', background: '#fff', color: '#888', border: '1px solid #ddd',
  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12.5,
}

export default function ReportesAdminPage() {
  const [reportes, setReportes] = useState([])
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [grupoModal, setGrupoModal] = useState(null) // reporte sobre el que se abre el modal

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
      const [resReportes, resGrupos] = await Promise.all([
        fetch('/api/admin/reportes'),
        fetch('/api/admin/grupos'),
      ])
      if (resReportes.ok) setReportes(await resReportes.json())
      if (resGrupos.ok) setGrupos(await resGrupos.json())
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
              <PreviewField label="Nivel de Riesgo">
                <span style={{ fontWeight: '700', fontSize: '16px', color: scoreColor(preview.riskScore?.level || preview.totalScore) }}>
                  {preview.riskScore?.level || scoreLabel(preview.totalScore)}
                  {preview.riskScore?.numericScore != null ? ` (${preview.riskScore.numericScore})` : ''}
                </span>
              </PreviewField>
              <PreviewField label="Registros totales" value={preview.totalRecords} />
              {preview.taxCredit?.classification && (
                <PreviewField label="Credito Fiscal" value={`${preview.taxCredit.classification} (${preview.taxCredit.evaluationYear || '--'})`} />
              )}
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
                  <th style={thStyle}>Riesgo</th>
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
                      {(() => {
                        const level = r.data?.risk_score?.level
                        const numericScore = r.data?.risk_score?.numeric_score ?? r.puntajeTotal
                        return (
                          <span style={{ fontWeight: '700', color: scoreColor(level || numericScore) }}>
                            {level || numericScore || '—'}
                          </span>
                        )
                      })()}
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
                        {r.grupo ? (
                          <Link href={`/admin/grupos/${r.grupo.id}`}
                            style={{
                              padding: '5px 10px', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '11px',
                              background: '#eff6ff', color: '#1d4ed8', textDecoration: 'none', fontFamily: 'var(--font-dm)', fontWeight: 500,
                            }}>
                            Grupo: {r.grupo.nombre}
                          </Link>
                        ) : (
                          <button onClick={() => setGrupoModal(r)}
                            style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '11px', color: '#2563eb', background: '#fff', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>
                            Grupo
                          </button>
                        )}
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

      {/* ── Modal grupo empresarial ─────────────────────────────────────────── */}
      {grupoModal && (
        <GrupoModal
          reporte={grupoModal}
          grupos={grupos}
          reportesTodos={reportes}
          onClose={() => setGrupoModal(null)}
          onDone={() => {
            setGrupoModal(null)
            setMsg({ type: 'ok', text: 'Grupo empresarial actualizado' })
            load()
          }}
        />
      )}
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
