'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── helpers ─────────────────────────────────────────────────────────────────
function groupCotizantesByProducto(cotizantes = []) {
  const map = {}, order = []
  for (const c of cotizantes) {
    const key = c.productoNombre || 'Sin producto'
    if (!map[key]) { map[key] = []; order.push(key) }
    map[key].push(c)
  }
  return order.map(key => ({ productoNombre: key, cotizantes: map[key] }))
}
function flattenGrupos(grupos) {
  return grupos.flatMap(g =>
    g.cotizantes.map(c => ({ productoNombre: g.productoNombre, nombre: c.nombre, valor: c.valor }))
  )
}
const defaultCotizante = () => ({ nombre: '', valor: '' })
const defaultGrupo     = (n = '') => ({ productoNombre: n, cotizantes: [defaultCotizante(), defaultCotizante(), defaultCotizante()] })

// ─── primitivas UI ────────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>
      {children}
    </div>
  )
}

function FieldValue({ children, mono }) {
  if (!children && children !== 0) return <div style={{ fontSize: 13, color: '#cbd5e1' }}>—</div>
  return (
    <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.55, fontFamily: mono ? 'monospace' : 'inherit' }}>
      {children}
    </div>
  )
}

function ReadField({ label, value, mono, span2 }) {
  return (
    <div style={span2 ? { gridColumn: 'span 2' } : {}}>
      <FieldLabel>{label}</FieldLabel>
      <FieldValue mono={mono}>{value}</FieldValue>
    </div>
  )
}

function Inp({ value, onChange, placeholder, type = 'text', rows }) {
  const base = {
    width: '100%', boxSizing: 'border-box',
    border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, color: '#1e293b',
    background: '#fff', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color .15s',
  }
  if (rows) return (
    <textarea rows={rows} style={{ ...base, resize: 'vertical' }}
      value={value ?? ''} placeholder={placeholder}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      onChange={e => onChange(e.target.value)} />
  )
  return (
    <input type={type} style={base} value={value ?? ''} placeholder={placeholder}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      onChange={e => onChange(e.target.value)} />
  )
}

function FieldWrap({ label, children, span2 }) {
  return (
    <div style={span2 ? { gridColumn: 'span 2' } : {}}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  )
}

function ReadGrid({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px 24px' }}>
      {children}
    </div>
  )
}

function EditGrid({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px 16px' }}>
      {children}
    </div>
  )
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
function SectionCard({ n, title, editing, onEdit, onSave, onCancel, saving, finalizado, children, accent = '#3b82f6' }) {
  return (
    <div style={{
      background: '#fff',
      border: editing ? `1px solid ${accent}` : '1px solid #e2e8f0',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: editing ? `0 0 0 3px ${accent}22` : '0 1px 4px rgba(0,0,0,.05)',
      transition: 'border-color .2s, box-shadow .2s',
    }}>
      {/* header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid #f1f5f9',
        background: editing ? `${accent}08` : '#fafbfc',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {n && (
            <span style={{
              width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, background: editing ? accent : '#e2e8f0', color: editing ? '#fff' : '#64748b',
              flexShrink: 0, transition: 'all .2s',
            }}>{n}</span>
          )}
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        </div>
        {!finalizado && (
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? (
              <>
                <button onClick={onCancel} style={{
                  fontSize: 12, padding: '5px 14px', border: '1px solid #e2e8f0',
                  borderRadius: 7, background: '#fff', color: '#64748b', cursor: 'pointer',
                }}>Cancelar</button>
                <button onClick={onSave} disabled={saving} style={{
                  fontSize: 12, padding: '5px 16px', border: 'none',
                  borderRadius: 7, background: accent, color: '#fff',
                  cursor: 'pointer', fontWeight: 600, opacity: saving ? .7 : 1,
                }}>{saving ? 'Guardando…' : 'Guardar'}</button>
              </>
            ) : (
              <button onClick={onEdit} style={{
                fontSize: 12, padding: '5px 14px',
                border: '1px solid #e2e8f0', borderRadius: 7,
                background: '#fff', color: '#64748b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar
              </button>
            )}
          </div>
        )}
      </div>
      {/* body */}
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────
export default function AdquisicionDetallePage({ params }) {
  const router = useRouter()
  const [id,       setId]       = useState(null)
  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [emitting, setEmitting] = useState(false)

  const [editing, setEditing] = useState({})
  const [saving,  setSaving]  = useState({})
  const [drafts,  setDrafts]  = useState({})

  useEffect(() => {
    params.then ? params.then(p => setId(p.id)) : setId(params.id)
  }, [params])

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/adquisiciones/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8', fontSize: 14 }}>
      Cargando estudio de mercado…
    </div>
  )
  if (!data) return (
    <div style={{ padding: 32, color: '#94a3b8' }}>No encontrado.</div>
  )

  const finalizado = data.status === 'finalizado'

  const startEdit  = (s, draft) => { setDrafts(p => ({ ...p, [s]: draft })); setEditing(p => ({ ...p, [s]: true })) }
  const cancelEdit = (s) => { setEditing(p => ({ ...p, [s]: false })); setDrafts(p => ({ ...p, [s]: undefined })) }

  const saveSection = async (s, payload) => {
    setSaving(p => ({ ...p, [s]: true }))
    try {
      const res = await fetch(`/api/admin/adquisiciones/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      const updated = await fetch(`/api/admin/adquisiciones/${id}`).then(r => r.json())
      setData(updated)
      setEditing(p => ({ ...p, [s]: false }))
    } catch { alert('Error al guardar.') }
    finally { setSaving(p => ({ ...p, [s]: false })) }
  }

  const setDraft = (s, k, v) => setDrafts(p => ({ ...p, [s]: { ...p[s], [k]: v } }))

  // cotizantes helpers
  const setGrupoNombre = (gi, nombre) => setDrafts(p => {
    const g = [...p.mercado.grupos]; g[gi] = { ...g[gi], productoNombre: nombre }
    return { ...p, mercado: { ...p.mercado, grupos: g } }
  })
  const setGrupoCotizante = (gi, ci, key, value) => setDrafts(p => {
    const g = [...p.mercado.grupos]
    const c = [...g[gi].cotizantes]; c[ci] = { ...c[ci], [key]: value }
    g[gi] = { ...g[gi], cotizantes: c }
    return { ...p, mercado: { ...p.mercado, grupos: g } }
  })
  const addCotizanteAGrupo = (gi) => setDrafts(p => {
    const g = [...p.mercado.grupos]; g[gi] = { ...g[gi], cotizantes: [...g[gi].cotizantes, defaultCotizante()] }
    return { ...p, mercado: { ...p.mercado, grupos: g } }
  })
  const removeCotizanteDeGrupo = (gi, ci) => setDrafts(p => {
    const g = [...p.mercado.grupos]
    const c = g[gi].cotizantes.filter((_, i) => i !== ci)
    g[gi] = { ...g[gi], cotizantes: c.length ? c : [defaultCotizante()] }
    return { ...p, mercado: { ...p.mercado, grupos: g } }
  })
  const addGrupo    = () => setDrafts(p => ({ ...p, mercado: { ...p.mercado, grupos: [...p.mercado.grupos, defaultGrupo()] } }))
  const removeGrupo = (gi) => setDrafts(p => ({
    ...p,
    mercado: { ...p.mercado, grupos: p.mercado.grupos.length > 1 ? p.mercado.grupos.filter((_, i) => i !== gi) : p.mercado.grupos }
  }))

  const handleEmitir = async () => {
    if (!confirm('¿Emitir este documento como finalizado? No podrá editarse.')) return
    setEmitting(true)
    try {
      await fetch(`/api/admin/adquisiciones/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'emitir' }) })
      const updated = await fetch(`/api/admin/adquisiciones/${id}`).then(r => r.json())
      setData(updated)
    } catch { alert('Error al emitir.') }
    finally { setEmitting(false) }
  }
  const handleReabrir = async () => {
    setEmitting(true)
    try {
      await fetch(`/api/admin/adquisiciones/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reabrir' }) })
      setData(p => ({ ...p, status: 'borrador' }))
    } catch { alert('Error.') }
    finally { setEmitting(false) }
  }

  const d = drafts
  const grupos = groupCotizantesByProducto(data.cotizantes ?? [])

  // stats para sidebar
  const totalCotizantes   = (data.cotizantes ?? []).filter(c => c.nombre).length
  const totalProductos    = grupos.length
  const totalRiesgos      = (data.riesgos ?? []).length
  const totalObligaciones = (data.obligaciones ?? []).length

  return (
    <div style={{ padding: '24px 32px', width: '100%', fontFamily: 'inherit' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin/adquisiciones" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          ← Estudio de Mercado
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {data.solicitante || 'Sin nombre'}
            </h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{data.fecha}</span>
              <StatusBadge status={data.status} />
              {data.solicitudProcura && (
                <Link href={`/admin/solicitudes/${data.solicitudProcuraId}`}
                  style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', padding: '2px 10px', borderRadius: 20, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  ↗ Ver solicitud de procura
                </Link>
              )}
            </div>
          </div>
          {/* Acciones principales */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a href={`/api/admin/adquisiciones/${id}/pdf`} target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 9, color: '#475569', textDecoration: 'none', background: '#fff', fontWeight: 500 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              PDF
            </a>
            {finalizado ? (
              <button onClick={handleReabrir} disabled={emitting} style={{
                fontSize: 13, padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 9,
                background: '#fff', color: '#64748b', cursor: 'pointer', fontWeight: 500,
              }}>{emitting ? '…' : 'Reabrir borrador'}</button>
            ) : (
              <button onClick={handleEmitir} disabled={emitting} style={{
                fontSize: 13, padding: '8px 22px', border: 'none', borderRadius: 9,
                background: '#0a1628', color: '#fff', cursor: 'pointer', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {emitting ? 'Emitiendo…' : 'Emitir documento'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Banner finalizado */}
      {finalizado && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10,
          padding: '12px 18px', marginBottom: 24, fontSize: 13, color: '#166534',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span><strong>Documento finalizado</strong> — Solo lectura. Usa "Reabrir borrador" para editar.</span>
        </div>
      )}

      {/* ── LAYOUT DOS COLUMNAS ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 272px', gap: 24, alignItems: 'start' }}>

        {/* ── COLUMNA PRINCIPAL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 1. INFORMACIÓN GENERAL */}
          <SectionCard n="1" title="Información General" finalizado={finalizado}
            editing={editing.general}
            onEdit={() => startEdit('general', { fecha: data.fecha, solicitante: data.solicitante, telCel: data.telCel, ext: data.ext, email: data.email })}
            onSave={() => saveSection('general', d.general)}
            onCancel={() => cancelEdit('general')}
            saving={saving.general}
          >
            {editing.general ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <EditGrid>
                  <FieldWrap label="Solicitante"><Inp value={d.general?.solicitante} onChange={v => setDraft('general', 'solicitante', v)} /></FieldWrap>
                  <FieldWrap label="Email"><Inp value={d.general?.email} type="email" onChange={v => setDraft('general', 'email', v)} /></FieldWrap>
                  <FieldWrap label="Teléfono / Celular"><Inp value={d.general?.telCel} onChange={v => setDraft('general', 'telCel', v)} /></FieldWrap>
                  <FieldWrap label="Ext."><Inp value={d.general?.ext} onChange={v => setDraft('general', 'ext', v)} /></FieldWrap>
                </EditGrid>
                <EditGrid cols={3}>
                  <FieldWrap label="Fecha"><Inp value={d.general?.fecha} onChange={v => setDraft('general', 'fecha', v)} /></FieldWrap>
                </EditGrid>
              </div>
            ) : (
              <ReadGrid>
                <ReadField label="Solicitante"  value={data.solicitante} />
                <ReadField label="Cédula / RIF" value={data.solicitudProcura?.cedulaRif || data.ccNit} />
                <ReadField label="Email"        value={data.email} />
                <ReadField label="Teléfono"     value={data.telCel} />
                <ReadField label="Ext."         value={data.ext} />
                <ReadField label="Fecha"        value={data.fecha} />
              </ReadGrid>
            )}
          </SectionCard>

          {/* 2. JUSTIFICACIÓN */}
          <SectionCard n="2" title="Justificación" finalizado={finalizado}
            editing={editing.justificacion}
            onEdit={() => startEdit('justificacion', { descripcionNecesidad: [data.descripcionNecesidad, data.pertinencia].filter(Boolean).join('\n\n') })}
            onSave={() => saveSection('justificacion', { descripcionNecesidad: d.justificacion?.descripcionNecesidad, pertinencia: '' })}
            onCancel={() => cancelEdit('justificacion')}
            saving={saving.justificacion}
          >
            {editing.justificacion ? (
              <FieldWrap label="Justificación de la necesidad">
                <Inp rows={5} value={d.justificacion?.descripcionNecesidad} onChange={v => setDraft('justificacion', 'descripcionNecesidad', v)} />
              </FieldWrap>
            ) : (
              <div style={{ fontSize: 13, color: data.descripcionNecesidad ? '#1e293b' : '#cbd5e1', lineHeight: 1.65 }}>
                {data.descripcionNecesidad || 'Sin justificación registrada.'}
              </div>
            )}
          </SectionCard>

          {/* 3. OBJETO A CONTRATAR */}
          <SectionCard n="3" title="Objeto a Contratar" finalizado={finalizado}
            editing={editing.objeto}
            onEdit={() => startEdit('objeto', { descripcionObjeto: data.descripcionObjeto, requierePermisos: data.requierePermisos })}
            onSave={() => saveSection('objeto', d.objeto)}
            onCancel={() => cancelEdit('objeto')}
            saving={saving.objeto}
          >
            {/* Productos vinculados — siempre visibles */}
            {data.solicitudProcura?.productos?.length > 0 && (
              <div style={{ marginBottom: 16, borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  Especificaciones — Solicitud de Procura
                </div>
                {data.solicitudProcura.productos.map((p, i) => (
                  <div key={p.id} style={{ padding: '10px 14px', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{p.nombreProducto}</div>
                    {(p.descripcionGeneral || p.descripcion) && (
                      <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.55 }}>{p.descripcionGeneral || p.descripcion}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {editing.objeto ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FieldWrap label="Descripción del Objeto">
                  <Inp rows={3} value={d.objeto?.descripcionObjeto} onChange={v => setDraft('objeto', 'descripcionObjeto', v)} />
                </FieldWrap>
                <div>
                  <FieldLabel>¿Requiere permisos especiales?</FieldLabel>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['SÍ', 'NO'].map(op => (
                      <button key={op} type="button" onClick={() => setDraft('objeto', 'requierePermisos', op)} style={{
                        padding: '7px 22px', border: `1px solid ${d.objeto?.requierePermisos === op ? '#3b82f6' : '#e2e8f0'}`,
                        borderRadius: 8, background: d.objeto?.requierePermisos === op ? '#3b82f6' : '#fff',
                        color: d.objeto?.requierePermisos === op ? '#fff' : '#64748b',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      }}>{op}</button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <ReadGrid>
                <ReadField label="Descripción" value={data.descripcionObjeto} span2={!!data.descripcionObjeto} />
                <ReadField label="Requiere Permisos" value={data.requierePermisos} />
              </ReadGrid>
            )}
          </SectionCard>

          {/* 4. OBLIGACIONES */}
          <SectionCard n="4" title="Obligaciones del Contratista" finalizado={finalizado}
            editing={editing.obligaciones}
            onEdit={() => startEdit('obligaciones', { obligaciones: data.obligaciones?.length ? [...data.obligaciones] : [''] })}
            onSave={() => saveSection('obligaciones', { obligaciones: d.obligaciones?.obligaciones.filter(o => o.trim()) })}
            onCancel={() => cancelEdit('obligaciones')}
            saving={saving.obligaciones}
          >
            {editing.obligaciones ? (
              <div>
                {d.obligaciones?.obligaciones.map((ob, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 700, width: 22, flexShrink: 0 }}>{String.fromCharCode(97 + i)})</span>
                    <Inp value={ob} placeholder={`Obligación ${i + 1}`}
                      onChange={v => { const a = [...d.obligaciones.obligaciones]; a[i] = v; setDraft('obligaciones', 'obligaciones', a) }} />
                    {d.obligaciones.obligaciones.length > 1 && (
                      <button onClick={() => setDraft('obligaciones', 'obligaciones', d.obligaciones.obligaciones.filter((_, j) => j !== i))}
                        style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, flexShrink: 0, lineHeight: 1 }}>✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setDraft('obligaciones', 'obligaciones', [...d.obligaciones.obligaciones, ''])}
                  style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: 4 }}>
                  + Agregar obligación
                </button>
              </div>
            ) : data.obligaciones?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.obligaciones.map((ob, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 700, minWidth: 22 }}>{String.fromCharCode(97 + i)})</span>
                    <span style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.55 }}>{ob}</span>
                  </div>
                ))}
              </div>
            ) : <span style={{ fontSize: 13, color: '#94a3b8' }}>Sin obligaciones registradas.</span>}
          </SectionCard>

          {/* 5. PLAZO + CRONOGRAMA CHINA */}
          <SectionCard n="5" title="Plazo de Ejecución" finalizado={finalizado}
            editing={editing.plazo}
            onEdit={() => startEdit('plazo', {
              plazo: data.plazo || '',
              cronogramaChina: Array.isArray(data.cronogramaChina) && data.cronogramaChina.length
                ? data.cronogramaChina.map(r => ({ etapa: r.etapa || '', tiempo: r.tiempo || '', observaciones: r.observaciones || '' }))
                : [
                    { etapa: 'Negociación y confirmación del pedido', tiempo: '',  observaciones: '' },
                    { etapa: 'Producción / fabricación',              tiempo: '',  observaciones: '' },
                    { etapa: 'Control de calidad',                    tiempo: '',  observaciones: '' },
                    { etapa: 'Exportación y carga',                   tiempo: '',  observaciones: '' },
                    { etapa: 'Tránsito marítimo',                     tiempo: '',  observaciones: '' },
                    { etapa: 'Aduana y nacionalización',              tiempo: '',  observaciones: '' },
                    { etapa: 'Entrega final',                         tiempo: '',  observaciones: '' },
                  ],
            })}
            onSave={() => saveSection('plazo', { plazo: d.plazo?.plazo, cronogramaChina: d.plazo?.cronogramaChina?.filter(r => r.etapa.trim()) })}
            onCancel={() => cancelEdit('plazo')}
            saving={saving.plazo}
          >
            {editing.plazo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Plazo general */}
                <div style={{ maxWidth: 300 }}>
                  <FieldWrap label="Plazo estimado total">
                    <Inp value={d.plazo?.plazo} placeholder="Ej: 90 días / 4 meses" onChange={v => setDraft('plazo', 'plazo', v)} />
                  </FieldWrap>
                </div>

                {/* Tabla cronograma */}
                <div>
                  <FieldLabel>Cronograma de compra en China</FieldLabel>
                  <div style={{ marginTop: 8, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                    {/* thead */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 1fr', background: '#f8fafc', padding: '8px 14px', borderBottom: '1px solid #e2e8f0', gap: 10 }}>
                      <FieldLabel>Etapa / Actividad</FieldLabel>
                      <FieldLabel>Tiempo Est.</FieldLabel>
                      <FieldLabel>Observaciones</FieldLabel>
                    </div>
                    {/* rows */}
                    {d.plazo?.cronogramaChina?.map((row, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 1fr 36px', gap: 8, padding: '8px 14px', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
                        <Inp value={row.etapa} placeholder="Ej: Producción" onChange={v => {
                          const rows = [...d.plazo.cronogramaChina]; rows[i] = { ...rows[i], etapa: v }
                          setDraft('plazo', 'cronogramaChina', rows)
                        }} />
                        <Inp value={row.tiempo} placeholder="Ej: 30 días" onChange={v => {
                          const rows = [...d.plazo.cronogramaChina]; rows[i] = { ...rows[i], tiempo: v }
                          setDraft('plazo', 'cronogramaChina', rows)
                        }} />
                        <Inp value={row.observaciones} placeholder="Notas opcionales…" onChange={v => {
                          const rows = [...d.plazo.cronogramaChina]; rows[i] = { ...rows[i], observaciones: v }
                          setDraft('plazo', 'cronogramaChina', rows)
                        }} />
                        <button
                          onClick={() => setDraft('plazo', 'cronogramaChina', d.plazo.cronogramaChina.filter((_, j) => j !== i))}
                          style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1, padding: 0, flexShrink: 0 }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setDraft('plazo', 'cronogramaChina', [...(d.plazo?.cronogramaChina ?? []), { etapa: '', tiempo: '', observaciones: '' }])}
                    style={{ marginTop: 8, fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                  >+ Agregar etapa</button>
                </div>
              </div>
            ) : (
              /* MODO LECTURA */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.plazo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{data.plazo}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Plazo estimado total</div>
                    </div>
                  </div>
                )}

                {/* Tabla cronograma lectura */}
                {Array.isArray(data.cronogramaChina) && data.cronogramaChina.length > 0 && (
                  <div>
                    <FieldLabel>Cronograma de compra en China</FieldLabel>
                    <div style={{ marginTop: 8, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 1fr', background: '#f8fafc', padding: '8px 16px', borderBottom: '1px solid #e2e8f0', gap: 10 }}>
                        <FieldLabel>Etapa / Actividad</FieldLabel>
                        <FieldLabel>Tiempo Est.</FieldLabel>
                        <FieldLabel>Observaciones</FieldLabel>
                      </div>
                      {data.cronogramaChina.map((row, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 1fr', gap: 10, padding: '10px 16px', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', fontSize: 13 }}>
                          <span style={{ color: '#1e293b', fontWeight: 500 }}>{row.etapa || '—'}</span>
                          <span style={{ color: '#3b82f6', fontWeight: 700, fontFamily: 'monospace' }}>{row.tiempo || '—'}</span>
                          <span style={{ color: '#64748b' }}>{row.observaciones || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!data.plazo && (!data.cronogramaChina || data.cronogramaChina.length === 0) && (
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>Sin plazo definido. Haz clic en Editar para configurarlo.</span>
                )}
              </div>
            )}
          </SectionCard>

          {/* 6. ESTUDIO DE MERCADO */}
          <SectionCard n="6" title="Estudio de Mercado" finalizado={finalizado} accent="#0a1628"
            editing={editing.mercado}
            onEdit={() => {
              const gs = grupos.length
                ? grupos.map(g => ({ productoNombre: g.productoNombre, cotizantes: g.cotizantes.map(c => ({ nombre: c.nombre, valor: c.valor })) }))
                : [defaultGrupo()]
              startEdit('mercado', { grupos: gs, valorEstimado: data.valorEstimado })
            }}
            onSave={() => saveSection('mercado', {
              cotizantes: flattenGrupos(d.mercado?.grupos ?? []).filter(c => c.nombre.trim()),
              valorEstimado: d.mercado?.valorEstimado,
            })}
            onCancel={() => cancelEdit('mercado')}
            saving={saving.mercado}
          >
            {editing.mercado ? (
              /* EDICIÓN */
              <div>
                {d.mercado?.grupos.map((grupo, gi) => (
                  <div key={gi} style={{ border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
                    {/* cabecera grupo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                      <input value={grupo.productoNombre} placeholder="Nombre del producto / ítem…"
                        onChange={e => setGrupoNombre(gi, e.target.value)}
                        style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 11px', fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'inherit', outline: 'none' }}
                      />
                      {d.mercado.grupos.length > 1 && (
                        <button onClick={() => removeGrupo(gi)}
                          style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1 }}>✕</button>
                      )}
                    </div>
                    {/* filas cotizantes */}
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 36px', gap: '6px 10px', marginBottom: 8 }}>
                        <FieldLabel>Proveedor / Cotizante</FieldLabel>
                        <FieldLabel>Valor</FieldLabel>
                        <span />
                      </div>
                      {grupo.cotizantes.map((c, ci) => (
                        <div key={ci} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 36px', gap: '6px 10px', marginBottom: 8, alignItems: 'center' }}>
                          <Inp value={c.nombre} placeholder="Nombre del proveedor" onChange={v => setGrupoCotizante(gi, ci, 'nombre', v)} />
                          <Inp value={c.valor} placeholder="0.00" onChange={v => setGrupoCotizante(gi, ci, 'valor', v)} />
                          {grupo.cotizantes.length > 1 && (
                            <button onClick={() => removeCotizanteDeGrupo(gi, ci)}
                              style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1, padding: 0 }}>✕</button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addCotizanteAGrupo(gi)}
                        style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                        + Agregar cotizante
                      </button>
                    </div>
                  </div>
                ))}

                <button onClick={addGrupo} style={{
                  width: '100%', padding: '10px', fontSize: 13, color: '#3b82f6',
                  background: '#eff6ff', border: '1px dashed #93c5fd', borderRadius: 9,
                  cursor: 'pointer', marginBottom: 16, fontWeight: 500,
                }}>+ Agregar producto</button>

                <div style={{ maxWidth: 260 }}>
                  <FieldWrap label="Valor Estimado Total">
                    <Inp value={d.mercado?.valorEstimado} placeholder="0.00" onChange={v => setDraft('mercado', 'valorEstimado', v)} />
                  </FieldWrap>
                </div>
              </div>
            ) : (
              /* LECTURA */
              <div>
                {grupos.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Sin cotizantes registrados.</p>
                ) : grupos.map((grupo, gi) => (
                  <div key={gi} style={{ marginBottom: 20 }}>
                    {/* cabecera del grupo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
                      <div style={{ height: 3, width: 3, borderRadius: '50%', background: '#3b82f6' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{grupo.productoNombre}</span>
                    </div>

                    {/* tabla */}
                    <div style={{ marginTop: 8, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                      {/* thead */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', background: '#f8fafc', padding: '8px 16px', borderBottom: '1px solid #e2e8f0' }}>
                        <FieldLabel>Proveedor / Cotizante</FieldLabel>
                        <FieldLabel style={{ textAlign: 'right' }}>Valor</FieldLabel>
                      </div>
                      {/* rows */}
                      {grupo.cotizantes.map((c, ci) => {
                        const vacío = !c.nombre && (!c.valor || c.valor === '0')
                        return (
                          <div key={c.id ?? ci} style={{
                            display: 'grid', gridTemplateColumns: '1fr 160px',
                            padding: '10px 16px',
                            borderTop: ci > 0 ? '1px solid #f1f5f9' : 'none',
                            background: vacío ? '#fafafa' : '#fff',
                          }}>
                            <span style={{ fontSize: 13, color: c.nombre ? '#1e293b' : '#cbd5e1' }}>
                              {c.nombre || '—'}
                            </span>
                            <span style={{ fontSize: 13, textAlign: 'right', fontFamily: 'monospace', fontWeight: c.valor && c.valor !== '0' ? 600 : 400, color: c.valor && c.valor !== '0' ? '#1e293b' : '#cbd5e1' }}>
                              {c.valor && c.valor !== '0' ? c.valor : '—'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {data.valorEstimado && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ textAlign: 'right' }}>
                      <FieldLabel>Valor Estimado Total</FieldLabel>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                        {data.valorEstimado}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* 7. RIESGOS */}
          <SectionCard n="7" title="Análisis de Riesgos" finalizado={finalizado} accent="#d97706"
            editing={editing.riesgos}
            onEdit={() => startEdit('riesgos', {
              riesgos: data.riesgos?.length
                ? data.riesgos.map(r => ({ descripcion: r.descripcion, mitigacion: r.mitigacion ?? '', asignacion: r.asignacion ?? 'Contratante' }))
                : [{ descripcion: '', mitigacion: '', asignacion: 'Contratante' }]
            })}
            onSave={() => saveSection('riesgos', { riesgos: d.riesgos?.riesgos.filter(r => r.descripcion.trim()) })}
            onCancel={() => cancelEdit('riesgos')}
            saving={saving.riesgos}
          >
            {editing.riesgos ? (
              <div>
                {d.riesgos?.riesgos.map((r, i) => (
                  <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '.06em' }}>Riesgo {i + 1}</span>
                      {d.riesgos.riesgos.length > 1 && (
                        <button onClick={() => setDraft('riesgos', 'riesgos', d.riesgos.riesgos.filter((_, j) => j !== i))}
                          style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1 }}>✕</button>
                      )}
                    </div>
                    <EditGrid>
                      <FieldWrap label="Descripción">
                        <Inp value={r.descripcion} onChange={v => { const a = [...d.riesgos.riesgos]; a[i] = { ...a[i], descripcion: v }; setDraft('riesgos', 'riesgos', a) }} />
                      </FieldWrap>
                      <FieldWrap label="Mitigación">
                        <Inp value={r.mitigacion} onChange={v => { const a = [...d.riesgos.riesgos]; a[i] = { ...a[i], mitigacion: v }; setDraft('riesgos', 'riesgos', a) }} />
                      </FieldWrap>
                    </EditGrid>
                    <div style={{ marginTop: 10 }}>
                      <FieldLabel>Asignación</FieldLabel>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {['Contratante', 'Contratista'].map(op => (
                          <button key={op} type="button"
                            onClick={() => { const a = [...d.riesgos.riesgos]; a[i] = { ...a[i], asignacion: op }; setDraft('riesgos', 'riesgos', a) }}
                            style={{ padding: '6px 16px', border: `1px solid ${r.asignacion === op ? '#d97706' : '#e2e8f0'}`, borderRadius: 7, background: r.asignacion === op ? '#d97706' : '#fff', color: r.asignacion === op ? '#fff' : '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setDraft('riesgos', 'riesgos', [...d.riesgos.riesgos, { descripcion: '', mitigacion: '', asignacion: 'Contratante' }])}
                  style={{ fontSize: 12, color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                  + Agregar riesgo
                </button>
              </div>
            ) : data.riesgos?.length > 0 ? (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 130px', background: '#f8fafc', padding: '8px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  {['Descripción', 'Mitigación', 'Asignación'].map(h => <FieldLabel key={h}>{h}</FieldLabel>)}
                </div>
                {data.riesgos.map((r, i) => (
                  <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 130px', padding: '10px 16px', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', fontSize: 13 }}>
                    <span style={{ color: '#1e293b' }}>{r.descripcion}</span>
                    <span style={{ color: '#64748b' }}>{r.mitigacion || '—'}</span>
                    <span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: r.asignacion === 'Contratante' ? '#eff6ff' : '#fffbeb',
                        color: r.asignacion === 'Contratante' ? '#1d4ed8' : '#b45309',
                      }}>{r.asignacion}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : <span style={{ fontSize: 13, color: '#94a3b8' }}>Sin riesgos registrados.</span>}
          </SectionCard>

          {/* 8. FIRMAS */}
          <SectionCard n="8" title="Firmas y Aprobaciones" finalizado={finalizado}
            editing={editing.firmas}
            onEdit={() => startEdit('firmas', { elaboradoPorFecha: data.elaboradoPorFecha, contratanteNombre: data.contratanteNombre, contratanteCargo: data.contratanteCargo, contratanteFecha: data.contratanteFecha })}
            onSave={() => saveSection('firmas', { ...d.firmas, elaboradoPorNombre: 'Angel Dubois', elaboradoPorCargo: 'FOUNDER - CEO' })}
            onCancel={() => cancelEdit('firmas')}
            saving={saving.firmas}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Elaborado por */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Elaborado por</div>
                {editing.firmas ? (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <FieldLabel>Nombre</FieldLabel>
                      <div style={{ fontSize: 13, color: '#1e293b', padding: '8px 12px', background: '#f0f0f0', borderRadius: 7, border: '1px solid #e2e8f0' }}>Angel Dubois</div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <FieldLabel>Cargo</FieldLabel>
                      <div style={{ fontSize: 13, color: '#1e293b', padding: '8px 12px', background: '#f0f0f0', borderRadius: 7, border: '1px solid #e2e8f0' }}>FOUNDER - CEO</div>
                    </div>
                    <FieldWrap label="Fecha"><Inp value={d.firmas?.elaboradoPorFecha} type="date" onChange={v => setDraft('firmas', 'elaboradoPorFecha', v)} /></FieldWrap>
                  </>
                ) : (
                  <>
                    <ReadField label="Nombre" value={data.elaboradoPorNombre || 'Angel Dubois'} />
                    <div style={{ marginTop: 10 }}><ReadField label="Cargo" value={data.elaboradoPorCargo || 'FOUNDER - CEO'} /></div>
                    <div style={{ marginTop: 10 }}><ReadField label="Fecha" value={data.elaboradoPorFecha} /></div>
                  </>
                )}
              </div>
              {/* Contratante */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Contratante</div>
                {editing.firmas ? (
                  <>
                    <div style={{ marginBottom: 8 }}><FieldWrap label="Nombre"><Inp value={d.firmas?.contratanteNombre} onChange={v => setDraft('firmas', 'contratanteNombre', v)} /></FieldWrap></div>
                    <div style={{ marginBottom: 8 }}><FieldWrap label="Cargo"><Inp value={d.firmas?.contratanteCargo} onChange={v => setDraft('firmas', 'contratanteCargo', v)} /></FieldWrap></div>
                    <FieldWrap label="Fecha"><Inp value={d.firmas?.contratanteFecha} type="date" onChange={v => setDraft('firmas', 'contratanteFecha', v)} /></FieldWrap>
                  </>
                ) : (
                  <>
                    <ReadField label="Nombre" value={data.contratanteNombre} />
                    <div style={{ marginTop: 10 }}><ReadField label="Cargo" value={data.contratanteCargo} /></div>
                    <div style={{ marginTop: 10 }}><ReadField label="Fecha" value={data.contratanteFecha} /></div>
                  </>
                )}
              </div>
            </div>
          </SectionCard>

        </div>{/* fin columna principal */}

        {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 }}>

          {/* Estado del documento */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Estado
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <StatusBadge status={data.status} large />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{data.fecha}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href={`/api/admin/adquisiciones/${id}/pdf`} target="_blank" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '9px', border: '1px solid #e2e8f0', borderRadius: 9,
                  color: '#475569', textDecoration: 'none', fontSize: 13, fontWeight: 500, background: '#fff',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Descargar PDF
                </a>
                {finalizado ? (
                  <button onClick={handleReabrir} disabled={emitting} style={{
                    padding: '9px', border: '1px solid #e2e8f0', borderRadius: 9,
                    background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  }}>{emitting ? '…' : 'Reabrir borrador'}</button>
                ) : (
                  <button onClick={handleEmitir} disabled={emitting} style={{
                    padding: '9px', border: 'none', borderRadius: 9,
                    background: '#0a1628', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {emitting ? 'Emitiendo…' : 'Emitir documento'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Resumen
            </div>
            <div style={{ padding: '6px 0' }}>
              {[
                { label: 'Productos',     value: totalProductos,    color: '#3b82f6' },
                { label: 'Cotizantes',    value: totalCotizantes,   color: '#8b5cf6' },
                { label: 'Obligaciones',  value: totalObligaciones, color: '#10b981' },
                { label: 'Riesgos',       value: totalRiesgos,      color: '#f59e0b' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 18px', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color, background: `${color}15`, padding: '2px 10px', borderRadius: 20 }}>{value}</span>
                </div>
              ))}
              {data.valorEstimado && (
                <div style={{ padding: '12px 18px' }}>
                  <FieldLabel>Valor Estimado</FieldLabel>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', marginTop: 2 }}>{data.valorEstimado}</div>
                </div>
              )}
            </div>
          </div>

          {/* Solicitud vinculada */}
          {data.solicitudProcura && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                Solicitud de Procura
              </div>
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                  {data.solicitudProcura.empresaCliente}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>{data.solicitudProcura.fecha}</div>
                <Link href={`/admin/solicitudes/${data.solicitudProcuraId}`} style={{
                  display: 'block', textAlign: 'center', padding: '8px', borderRadius: 9,
                  border: '1px solid #e2e8f0', color: '#3b82f6', textDecoration: 'none',
                  fontSize: 12, fontWeight: 600,
                }}>Ver solicitud →</Link>
              </div>
            </div>
          )}

        </div>{/* fin sidebar */}

      </div>{/* fin layout */}
    </div>
  )
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, large }) {
  const map = {
    borrador:   { label: 'Borrador',   color: '#64748b', bg: '#f1f5f9' },
    finalizado: { label: 'Finalizado', color: '#166534', bg: '#dcfce7' },
  }
  const s = map[status] ?? map.borrador
  return (
    <span style={{
      fontSize: large ? 13 : 11, padding: large ? '5px 14px' : '3px 10px',
      borderRadius: 20, background: s.bg, color: s.color, fontWeight: 700,
    }}>{s.label}</span>
  )
}
