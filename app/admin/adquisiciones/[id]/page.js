'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── PALETA DUBOIS ────────────────────────────────────────────────────────────
const C = {
  navy:     '#0a1628',
  corp:     '#1a3a6b',
  electric: '#2563eb',
  white:    '#ffffff',
  bgSoft:   '#f4f6f9',
  carbon:   '#0d0d0d',
  steel:    '#5a6478',
  border:   '#dce3ed',
  amber:    '#d97706',
  green:    '#1d9e75',
}

// ─── HELPERS UI ───────────────────────────────────────────────────────────────
function SectionHeader({ title }) {
  return (
    <div style={{
      fontWeight: 700, fontSize: 11, color: C.white,
      background: C.corp, padding: '6px 12px',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      marginBottom: 12,
    }}>
      {title}
    </div>
  )
}

function ReadField({ label, value }) {
  if (!value && value !== false) return null
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: C.steel, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: C.carbon, lineHeight: 1.5 }}>{String(value)}</div>
    </div>
  )
}

function Inp({ value, onChange, placeholder, type = 'text', rows }) {
  const base = {
    width: '100%', boxSizing: 'border-box',
    border: `1px solid ${C.border}`, borderRadius: 6,
    padding: '7px 10px', fontSize: 13, color: C.carbon,
    background: C.white, outline: 'none',
    fontFamily: 'inherit',
  }
  if (rows) return (
    <textarea
      rows={rows}
      style={{ ...base, resize: 'vertical' }}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  )
  return (
    <input
      type={type}
      style={base}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  )
}

function Label({ children }) {
  return (
    <div style={{ fontSize: 11, color: C.steel, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
      {children}
    </div>
  )
}

function Grid2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>{children}</div>
}

function Grid3({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>{children}</div>
}

function BtnEdit({ onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11, padding: '4px 12px', border: `1px solid ${C.border}`,
      borderRadius: 6, background: C.white, color: C.steel,
      cursor: 'pointer', fontFamily: 'inherit',
    }}>
      Editar
    </button>
  )
}

function BtnSave({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      fontSize: 11, padding: '4px 14px', border: 'none',
      borderRadius: 6, background: C.electric, color: C.white,
      cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
    }}>
      {loading ? 'Guardando...' : 'Guardar'}
    </button>
  )
}

function BtnCancel({ onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11, padding: '4px 12px', border: `1px solid ${C.border}`,
      borderRadius: 6, background: C.white, color: C.steel,
      cursor: 'pointer', fontFamily: 'inherit',
    }}>
      Cancelar
    </button>
  )
}

function SectionCard({ title, editing, onEdit, onSave, onCancel, saving, finalizado, children }) {
  return (
    <div style={{ marginBottom: 20, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.corp, padding: '6px 12px' }}>
        <span style={{ fontWeight: 700, fontSize: 11, color: C.white, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {title}
        </span>
        {!finalizado && (
          <div style={{ display: 'flex', gap: 6 }}>
            {editing
              ? <><BtnSave onClick={onSave} loading={saving} /><BtnCancel onClick={onCancel} /></>
              : <BtnEdit onClick={onEdit} />
            }
          </div>
        )}
      </div>
      <div style={{ padding: '16px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function AdquisicionDetallePage({ params }) {
  const router = useRouter()
  const [id, setId] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [emitting, setEmitting] = useState(false)

  // Secciones editando
  const [editing, setEditing] = useState({})
  const [saving, setSaving] = useState({})

  // Drafts locales por sección
  const [drafts, setDrafts] = useState({})

  useEffect(() => {
    params.then ? params.then(p => setId(p.id)) : setId(params.id)
  }, [params])

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/adquisiciones/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [id])

  if (loading) return <div style={{ padding: 32, color: C.steel }}>Cargando...</div>
  if (!data) return <div style={{ padding: 32, color: C.steel }}>No encontrado.</div>

  const finalizado = data.status === 'finalizado'

  // ── Edición inline ──────────────────────────────────────────────────────────
  const startEdit = (section, initialDraft) => {
    setDrafts(prev => ({ ...prev, [section]: initialDraft }))
    setEditing(prev => ({ ...prev, [section]: true }))
  }

  const cancelEdit = (section) => {
    setEditing(prev => ({ ...prev, [section]: false }))
    setDrafts(prev => ({ ...prev, [section]: undefined }))
  }

  const saveSection = async (section, payload) => {
    setSaving(prev => ({ ...prev, [section]: true }))
    try {
      const res = await fetch(`/api/admin/adquisiciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      // Recargar datos
      const updated = await fetch(`/api/admin/adquisiciones/${id}`).then(r => r.json())
      setData(updated)
      setEditing(prev => ({ ...prev, [section]: false }))
    } catch {
      alert('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(prev => ({ ...prev, [section]: false }))
    }
  }

  const setDraft = (section, key, value) => {
    setDrafts(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }))
  }

  // ── Emitir / Reabrir ────────────────────────────────────────────────────────
  const handleEmitir = async () => {
    if (!confirm('¿Emitir este documento como finalizado? No podrá editarse.')) return
    setEmitting(true)
    try {
      await fetch(`/api/admin/adquisiciones/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'emitir' }),
      })
      setData(prev => ({ ...prev, status: 'finalizado' }))
    } catch {
      alert('Error al emitir.')
    } finally {
      setEmitting(false)
    }
  }

  const handleReabrir = async () => {
    setEmitting(true)
    try {
      await fetch(`/api/admin/adquisiciones/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reabrir' }),
      })
      setData(prev => ({ ...prev, status: 'borrador' }))
    } catch {
      alert('Error al reabrir.')
    } finally {
      setEmitting(false)
    }
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  const d = drafts

  return (
    <div style={{ padding: 32, maxWidth: 860, fontFamily: 'inherit' }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <Link href="/admin/adquisiciones" style={{ fontSize: 12, color: C.steel, display: 'block', marginBottom: 6 }}>
            ← Volver
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 4 }}>
            {data.solicitante || 'Sin nombre'}
          </h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: C.steel }}>{data.fecha}</span>
            <StatusBadge status={data.status} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* PDF */}
          <a
            href={`/api/admin/adquisiciones/${id}/pdf`}
            target="_blank"
            style={{ fontSize: 12, padding: '8px 16px', border: `1px solid ${C.electric}`, borderRadius: 8, color: C.electric, textDecoration: 'none' }}
          >
            ↓ PDF
          </a>

          {/* Emitir / Reabrir */}
          {finalizado ? (
            <button
              onClick={handleReabrir}
              disabled={emitting}
              style={{ fontSize: 12, padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.steel, cursor: 'pointer' }}
            >
              {emitting ? '...' : 'Reabrir'}
            </button>
          ) : (
            <button
              onClick={handleEmitir}
              disabled={emitting}
              style={{ fontSize: 12, padding: '8px 16px', border: 'none', borderRadius: 8, background: C.navy, color: C.white, cursor: 'pointer', fontWeight: 600 }}
            >
              {emitting ? 'Emitiendo...' : '✓ Emitir documento'}
            </button>
          )}
        </div>
      </div>

      {finalizado && (
        <div style={{ background: '#e6f7f1', border: '1px solid #1d9e75', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#1d9e75', fontWeight: 500 }}>
          ✓ Documento finalizado — solo lectura. Puedes reabrirlo para editar.
        </div>
      )}

      {/* ── 1. INFORMACIÓN GENERAL ── */}
      <SectionCard
        title="1. Información General"
        editing={editing.general}
        onEdit={() => startEdit('general', {
          fecha: data.fecha, tipoDocumento: data.tipoDocumento,
          tipoDocumentoOtro: data.tipoDocumentoOtro, solicitante: data.solicitante,
          ccNit: data.ccNit, telCel: data.telCel, ext: data.ext, email: data.email,
        })}
        onSave={() => saveSection('general', d.general)}
        onCancel={() => cancelEdit('general')}
        saving={saving.general}
        finalizado={finalizado}
      >
        {editing.general ? (
          <>
            <Grid2>
              <div><Label>Solicitante</Label><Inp value={d.general?.solicitante} onChange={v => setDraft('general', 'solicitante', v)} /></div>
              <div><Label>Tipo de Documento</Label>
                <select
                  value={d.general?.tipoDocumento ?? ''}
                  onChange={e => setDraft('general', 'tipoDocumento', e.target.value)}
                  style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit' }}
                >
                  <option value="">Seleccionar...</option>
                  <option value="SC1">SC1</option>
                  <option value="SCP">SCP</option>
                  <option value="SDS">SDS</option>
                  <option value="SDC">SDC</option>
                  <option value="SCM">SCM</option>
                  <option value="SDV">SDV</option>
                  <option value="otro">Otro</option>
                </select>
                {d.general?.tipoDocumento === 'otro' && (
                  <Inp style={{ marginTop: 6 }} value={d.general?.tipoDocumentoOtro} placeholder="Especifique..." onChange={v => setDraft('general', 'tipoDocumentoOtro', v)} />
                )}
              </div>
            </Grid2>
            <Grid2>
              <div><Label>C.C. / NIT</Label><Inp value={d.general?.ccNit} onChange={v => setDraft('general', 'ccNit', v)} /></div>
              <div><Label>Email</Label><Inp value={d.general?.email} type="email" onChange={v => setDraft('general', 'email', v)} /></div>
            </Grid2>
            <Grid3>
              <div><Label>Teléfono / Celular</Label><Inp value={d.general?.telCel} onChange={v => setDraft('general', 'telCel', v)} /></div>
              <div><Label>Ext.</Label><Inp value={d.general?.ext} onChange={v => setDraft('general', 'ext', v)} /></div>
              <div><Label>Fecha</Label><Inp value={d.general?.fecha} onChange={v => setDraft('general', 'fecha', v)} /></div>
            </Grid3>
          </>
        ) : (
          <Grid2>
            <ReadField label="Solicitante" value={data.solicitante} />
            <ReadField label="Tipo de Documento" value={data.tipoDocumento === 'otro' ? data.tipoDocumentoOtro : data.tipoDocumento} />
            <ReadField label="C.C. / NIT" value={data.ccNit} />
            <ReadField label="Email" value={data.email} />
            <ReadField label="Teléfono" value={data.telCel} />
            <ReadField label="Fecha" value={data.fecha} />
          </Grid2>
        )}
      </SectionCard>

      {/* ── 2. JUSTIFICACIÓN ── */}
      <SectionCard
        title="2. Justificación"
        editing={editing.justificacion}
        onEdit={() => startEdit('justificacion', { descripcionNecesidad: data.descripcionNecesidad, pertinencia: data.pertinencia })}
        onSave={() => saveSection('justificacion', d.justificacion)}
        onCancel={() => cancelEdit('justificacion')}
        saving={saving.justificacion}
        finalizado={finalizado}
      >
        {editing.justificacion ? (
          <>
            <div style={{ marginBottom: 10 }}><Label>Descripción de la Necesidad</Label><Inp rows={4} value={d.justificacion?.descripcionNecesidad} onChange={v => setDraft('justificacion', 'descripcionNecesidad', v)} /></div>
            <div><Label>Pertinencia</Label><Inp rows={3} value={d.justificacion?.pertinencia} onChange={v => setDraft('justificacion', 'pertinencia', v)} /></div>
          </>
        ) : (
          <>
            <ReadField label="Descripción de la Necesidad" value={data.descripcionNecesidad} />
            <ReadField label="Pertinencia" value={data.pertinencia} />
          </>
        )}
      </SectionCard>

      {/* ── 3. OBJETO ── */}
      <SectionCard
        title="3. Objeto a Contratar"
        editing={editing.objeto}
        onEdit={() => startEdit('objeto', { descripcionObjeto: data.descripcionObjeto, especificaciones: data.especificaciones, requierePermisos: data.requierePermisos })}
        onSave={() => saveSection('objeto', d.objeto)}
        onCancel={() => cancelEdit('objeto')}
        saving={saving.objeto}
        finalizado={finalizado}
      >
        {editing.objeto ? (
          <>
            <div style={{ marginBottom: 10 }}><Label>Descripción del Objeto</Label><Inp rows={3} value={d.objeto?.descripcionObjeto} onChange={v => setDraft('objeto', 'descripcionObjeto', v)} /></div>
            <div style={{ marginBottom: 10 }}><Label>Especificaciones</Label><Inp rows={3} value={d.objeto?.especificaciones} onChange={v => setDraft('objeto', 'especificaciones', v)} /></div>
            <div>
              <Label>¿Requiere Permisos?</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['SÍ', 'NO'].map(op => (
                  <button key={op} type="button"
                    onClick={() => setDraft('objeto', 'requierePermisos', op)}
                    style={{ padding: '6px 18px', border: `1px solid ${d.objeto?.requierePermisos === op ? C.electric : C.border}`, borderRadius: 6, background: d.objeto?.requierePermisos === op ? C.electric : C.white, color: d.objeto?.requierePermisos === op ? C.white : C.steel, cursor: 'pointer', fontSize: 12 }}
                  >{op}</button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <ReadField label="Descripción" value={data.descripcionObjeto} />
            <ReadField label="Especificaciones" value={data.especificaciones} />
            <ReadField label="Requiere Permisos" value={data.requierePermisos} />
          </>
        )}
      </SectionCard>

      {/* ── 4. OBLIGACIONES ── */}
      <SectionCard
        title="4. Obligaciones del Contratista"
        editing={editing.obligaciones}
        onEdit={() => startEdit('obligaciones', { obligaciones: data.obligaciones?.length ? [...data.obligaciones] : [''] })}
        onSave={() => saveSection('obligaciones', { obligaciones: d.obligaciones?.obligaciones.filter(o => o.trim()) })}
        onCancel={() => cancelEdit('obligaciones')}
        saving={saving.obligaciones}
        finalizado={finalizado}
      >
        {editing.obligaciones ? (
          <>
            {d.obligaciones?.obligaciones.map((ob, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: C.electric, fontWeight: 700, minWidth: 20 }}>{String.fromCharCode(97 + i)})</span>
                <Inp value={ob} onChange={v => {
                  const arr = [...d.obligaciones.obligaciones]
                  arr[i] = v
                  setDraft('obligaciones', 'obligaciones', arr)
                }} />
                {d.obligaciones.obligaciones.length > 1 && (
                  <button onClick={() => {
                    const arr = d.obligaciones.obligaciones.filter((_, j) => j !== i)
                    setDraft('obligaciones', 'obligaciones', arr)
                  }} style={{ color: C.steel, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
                )}
              </div>
            ))}
            <button
              onClick={() => setDraft('obligaciones', 'obligaciones', [...d.obligaciones.obligaciones, ''])}
              style={{ fontSize: 12, color: C.electric, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >+ Agregar obligación</button>
          </>
        ) : (
          data.obligaciones?.length > 0
            ? data.obligaciones.map((ob, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.electric, fontWeight: 700, minWidth: 20 }}>{String.fromCharCode(97 + i)})</span>
                <span style={{ fontSize: 13, color: C.carbon }}>{ob}</span>
              </div>
            ))
            : <span style={{ fontSize: 13, color: C.steel }}>Sin obligaciones registradas.</span>
        )}
      </SectionCard>

      {/* ── 5. MODALIDAD ── */}
      <SectionCard
        title="5. Modalidad de Selección"
        editing={editing.modalidad}
        onEdit={() => startEdit('modalidad', { modalidad: data.modalidad, justificacionModalidad: data.justificacionModalidad, plazo: data.plazo })}
        onSave={() => saveSection('modalidad', d.modalidad)}
        onCancel={() => cancelEdit('modalidad')}
        saving={saving.modalidad}
        finalizado={finalizado}
      >
        {editing.modalidad ? (
          <>
            <div style={{ marginBottom: 10 }}>
              <Label>Modalidad</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ v: 'directa', l: 'Contratación Directa' }, { v: 'publica', l: 'Convocatoria Pública' }].map(op => (
                  <button key={op.v} type="button"
                    onClick={() => setDraft('modalidad', 'modalidad', op.v)}
                    style={{ padding: '6px 14px', border: `1px solid ${d.modalidad?.modalidad === op.v ? C.electric : C.border}`, borderRadius: 6, background: d.modalidad?.modalidad === op.v ? C.electric : C.white, color: d.modalidad?.modalidad === op.v ? C.white : C.steel, cursor: 'pointer', fontSize: 12 }}
                  >{op.l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}><Label>Justificación</Label><Inp rows={3} value={d.modalidad?.justificacionModalidad} onChange={v => setDraft('modalidad', 'justificacionModalidad', v)} /></div>
            <div><Label>Plazo</Label><Inp value={d.modalidad?.plazo} placeholder="Ej: 3 meses" onChange={v => setDraft('modalidad', 'plazo', v)} /></div>
          </>
        ) : (
          <>
            <ReadField label="Modalidad" value={data.modalidad === 'directa' ? 'Contratación Directa' : 'Convocatoria Pública'} />
            <ReadField label="Justificación" value={data.justificacionModalidad} />
            <ReadField label="Plazo" value={data.plazo} />
          </>
        )}
      </SectionCard>

      {/* ── 6. ESTUDIO DE MERCADO ── */}
      <SectionCard
        title="6. Estudio de Mercado"
        editing={editing.mercado}
        onEdit={() => startEdit('mercado', {
          cotizantes: data.cotizantes?.length ? data.cotizantes.map(c => ({ nombre: c.nombre, valor: c.valor })) : [{ nombre: '', valor: '' }],
          valorEstimado: data.valorEstimado,
        })}
        onSave={() => saveSection('mercado', { cotizantes: d.mercado?.cotizantes.filter(c => c.nombre.trim()), valorEstimado: d.mercado?.valorEstimado })}
        onCancel={() => cancelEdit('mercado')}
        saving={saving.mercado}
        finalizado={finalizado}
      >
        {editing.mercado ? (
          <>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: 8, marginBottom: 6 }}>
                <Label>Cotizante / Proveedor</Label>
                <Label>Valor</Label>
                <span />
              </div>
              {d.mercado?.cotizantes.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <Inp value={c.nombre} placeholder="Nombre del proveedor" onChange={v => {
                    const arr = [...d.mercado.cotizantes]; arr[i] = { ...arr[i], nombre: v }
                    setDraft('mercado', 'cotizantes', arr)
                  }} />
                  <Inp value={c.valor} placeholder="$ 0" onChange={v => {
                    const arr = [...d.mercado.cotizantes]; arr[i] = { ...arr[i], valor: v }
                    setDraft('mercado', 'cotizantes', arr)
                  }} />
                  {d.mercado.cotizantes.length > 1 && (
                    <button onClick={() => setDraft('mercado', 'cotizantes', d.mercado.cotizantes.filter((_, j) => j !== i))}
                      style={{ color: C.steel, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setDraft('mercado', 'cotizantes', [...d.mercado.cotizantes, { nombre: '', valor: '' }])}
                style={{ fontSize: 12, color: C.electric, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
              >+ Agregar cotizante</button>
            </div>
            <div><Label>Valor Estimado</Label><Inp value={d.mercado?.valorEstimado} placeholder="$ 0" onChange={v => setDraft('mercado', 'valorEstimado', v)} /></div>
          </>
        ) : (
          <>
            {data.cotizantes?.length > 0 && (
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', background: C.navy, padding: '7px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.white, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cotizante</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.white, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Valor</span>
                </div>
                {data.cotizantes.map((c, i) => (
                  <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px', padding: '8px 14px', borderTop: `1px solid ${C.border}`, background: i % 2 === 1 ? C.bgSoft : C.white }}>
                    <span style={{ fontSize: 13 }}>{c.nombre}</span>
                    <span style={{ fontSize: 13, color: C.electric, textAlign: 'right', fontFamily: 'monospace' }}>{c.valor}</span>
                  </div>
                ))}
              </div>
            )}
            <ReadField label="Valor Estimado" value={data.valorEstimado} />
          </>
        )}
      </SectionCard>

      {/* ── 7. FORMA DE PAGO ── */}
      <SectionCard
        title="7. Forma de Pago"
        editing={editing.pago}
        onEdit={() => startEdit('pago', { formaPago: data.formaPago, detallePago: data.detallePago, criterioMenorPrecio: data.criterioMenorPrecio, criterioOtro: data.criterioOtro })}
        onSave={() => saveSection('pago', d.pago)}
        onCancel={() => cancelEdit('pago')}
        saving={saving.pago}
        finalizado={finalizado}
      >
        {editing.pago ? (
          <>
            <div style={{ marginBottom: 10 }}>
              <Label>Forma de Pago</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ v: 'unico', l: 'Pago Único' }, { v: 'parciales', l: 'Pagos Parciales' }].map(op => (
                  <button key={op.v} type="button"
                    onClick={() => setDraft('pago', 'formaPago', op.v)}
                    style={{ padding: '6px 14px', border: `1px solid ${d.pago?.formaPago === op.v ? C.electric : C.border}`, borderRadius: 6, background: d.pago?.formaPago === op.v ? C.electric : C.white, color: d.pago?.formaPago === op.v ? C.white : C.steel, cursor: 'pointer', fontSize: 12 }}
                  >{op.l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}><Label>Detalle de Pago</Label><Inp rows={2} value={d.pago?.detallePago} onChange={v => setDraft('pago', 'detallePago', v)} /></div>
            <div>
              <Label>Criterio de Selección</Label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button type="button"
                  onClick={() => setDraft('pago', 'criterioMenorPrecio', true)}
                  style={{ padding: '6px 14px', border: `1px solid ${d.pago?.criterioMenorPrecio ? C.electric : C.border}`, borderRadius: 6, background: d.pago?.criterioMenorPrecio ? C.electric : C.white, color: d.pago?.criterioMenorPrecio ? C.white : C.steel, cursor: 'pointer', fontSize: 12 }}
                >Menor Precio</button>
                <button type="button"
                  onClick={() => setDraft('pago', 'criterioMenorPrecio', false)}
                  style={{ padding: '6px 14px', border: `1px solid ${!d.pago?.criterioMenorPrecio ? C.electric : C.border}`, borderRadius: 6, background: !d.pago?.criterioMenorPrecio ? C.electric : C.white, color: !d.pago?.criterioMenorPrecio ? C.white : C.steel, cursor: 'pointer', fontSize: 12 }}
                >Otro</button>
              </div>
              {!d.pago?.criterioMenorPrecio && <Inp value={d.pago?.criterioOtro} placeholder="Especifique el criterio..." onChange={v => setDraft('pago', 'criterioOtro', v)} />}
            </div>
          </>
        ) : (
          <>
            <ReadField label="Forma de Pago" value={data.formaPago === 'unico' ? 'Pago Único' : data.formaPago === 'parciales' ? 'Pagos Parciales' : data.formaPago} />
            <ReadField label="Detalle" value={data.detallePago} />
            <ReadField label="Criterio de Selección" value={data.criterioMenorPrecio ? 'Menor Precio' : data.criterioOtro} />
          </>
        )}
      </SectionCard>

      {/* ── 8. CONTRATISTA ── */}
      <SectionCard
        title="8. Contratista Propuesto"
        editing={editing.contratista}
        onEdit={() => startEdit('contratista', {
          contratistaNombre: data.contratistaNombre, contratistaCcNit: data.contratistaCcNit,
          contratistaEmail: data.contratistaEmail, contratistaCiudad: data.contratistaCiudad,
          contratistaTelefono: data.contratistaTelefono,
        })}
        onSave={() => saveSection('contratista', d.contratista)}
        onCancel={() => cancelEdit('contratista')}
        saving={saving.contratista}
        finalizado={finalizado}
      >
        {editing.contratista ? (
          <>
            <Grid2>
              <div><Label>Nombre / Razón Social</Label><Inp value={d.contratista?.contratistaNombre} onChange={v => setDraft('contratista', 'contratistaNombre', v)} /></div>
              <div><Label>C.C. / NIT</Label><Inp value={d.contratista?.contratistaCcNit} onChange={v => setDraft('contratista', 'contratistaCcNit', v)} /></div>
              <div><Label>Email</Label><Inp value={d.contratista?.contratistaEmail} type="email" onChange={v => setDraft('contratista', 'contratistaEmail', v)} /></div>
              <div><Label>Ciudad</Label><Inp value={d.contratista?.contratistaCiudad} onChange={v => setDraft('contratista', 'contratistaCiudad', v)} /></div>
              <div><Label>Teléfono</Label><Inp value={d.contratista?.contratistaTelefono} onChange={v => setDraft('contratista', 'contratistaTelefono', v)} /></div>
            </Grid2>
          </>
        ) : (
          <Grid2>
            <ReadField label="Nombre / Razón Social" value={data.contratistaNombre} />
            <ReadField label="C.C. / NIT" value={data.contratistaCcNit} />
            <ReadField label="Email" value={data.contratistaEmail} />
            <ReadField label="Ciudad" value={data.contratistaCiudad} />
            <ReadField label="Teléfono" value={data.contratistaTelefono} />
          </Grid2>
        )}
      </SectionCard>

      {/* ── 9. RIESGOS ── */}
      <SectionCard
        title="9. Análisis de Riesgos"
        editing={editing.riesgos}
        onEdit={() => startEdit('riesgos', {
          riesgos: data.riesgos?.length
            ? data.riesgos.map(r => ({ descripcion: r.descripcion, mitigacion: r.mitigacion ?? '', asignacion: r.asignacion ?? 'Contratante' }))
            : [{ descripcion: '', mitigacion: '', asignacion: 'Contratante' }]
        })}
        onSave={() => saveSection('riesgos', { riesgos: d.riesgos?.riesgos.filter(r => r.descripcion.trim()) })}
        onCancel={() => cancelEdit('riesgos')}
        saving={saving.riesgos}
        finalizado={finalizado}
      >
        {editing.riesgos ? (
          <>
            {d.riesgos?.riesgos.map((r, i) => (
              <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.corp }}>Riesgo {i + 1}</span>
                  {d.riesgos.riesgos.length > 1 && (
                    <button onClick={() => setDraft('riesgos', 'riesgos', d.riesgos.riesgos.filter((_, j) => j !== i))}
                      style={{ color: C.steel, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  )}
                </div>
                <div style={{ marginBottom: 8 }}><Label>Descripción</Label><Inp value={r.descripcion} onChange={v => { const arr = [...d.riesgos.riesgos]; arr[i] = { ...arr[i], descripcion: v }; setDraft('riesgos', 'riesgos', arr) }} /></div>
                <div style={{ marginBottom: 8 }}><Label>Mitigación</Label><Inp value={r.mitigacion} onChange={v => { const arr = [...d.riesgos.riesgos]; arr[i] = { ...arr[i], mitigacion: v }; setDraft('riesgos', 'riesgos', arr) }} /></div>
                <div>
                  <Label>Asignación</Label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Contratante', 'Contratista'].map(op => (
                      <button key={op} type="button"
                        onClick={() => { const arr = [...d.riesgos.riesgos]; arr[i] = { ...arr[i], asignacion: op }; setDraft('riesgos', 'riesgos', arr) }}
                        style={{ padding: '5px 12px', border: `1px solid ${r.asignacion === op ? C.electric : C.border}`, borderRadius: 6, background: r.asignacion === op ? C.electric : C.white, color: r.asignacion === op ? C.white : C.steel, cursor: 'pointer', fontSize: 12 }}
                      >{op}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setDraft('riesgos', 'riesgos', [...d.riesgos.riesgos, { descripcion: '', mitigacion: '', asignacion: 'Contratante' }])}
              style={{ fontSize: 12, color: C.electric, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >+ Agregar riesgo</button>
          </>
        ) : (
          data.riesgos?.length > 0 ? (
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', background: C.navy, padding: '7px 14px' }}>
                {['Descripción', 'Mitigación', 'Asignación'].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.white, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              {data.riesgos.map((r, i) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', padding: '8px 14px', borderTop: `1px solid ${C.border}`, background: i % 2 === 1 ? C.bgSoft : C.white, fontSize: 13 }}>
                  <span>{r.descripcion}</span>
                  <span style={{ color: C.steel }}>{r.mitigacion}</span>
                  <span style={{ fontWeight: 600, color: r.asignacion === 'Contratante' ? C.electric : C.amber }}>{r.asignacion}</span>
                </div>
              ))}
            </div>
          ) : <span style={{ fontSize: 13, color: C.steel }}>Sin riesgos registrados.</span>
        )}
      </SectionCard>

      {/* ── 10. FIRMAS ── */}
      <SectionCard
        title="10. Firmas y Aprobaciones"
        editing={editing.firmas}
        onEdit={() => startEdit('firmas', {
          elaboradoPorNombre: data.elaboradoPorNombre, elaboradoPorCargo: data.elaboradoPorCargo, elaboradoPorFecha: data.elaboradoPorFecha,
          contratanteNombre: data.contratanteNombre, contratanteCargo: data.contratanteCargo, contratanteFecha: data.contratanteFecha,
        })}
        onSave={() => saveSection('firmas', d.firmas)}
        onCancel={() => cancelEdit('firmas')}
        saving={saving.firmas}
        finalizado={finalizado}
      >
        {editing.firmas ? (
          <Grid2>
            <div style={{ background: C.bgSoft, padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.corp, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Elaborado por</div>
              <div style={{ marginBottom: 8 }}><Label>Nombre</Label><Inp value={d.firmas?.elaboradoPorNombre} onChange={v => setDraft('firmas', 'elaboradoPorNombre', v)} /></div>
              <div style={{ marginBottom: 8 }}><Label>Cargo</Label><Inp value={d.firmas?.elaboradoPorCargo} onChange={v => setDraft('firmas', 'elaboradoPorCargo', v)} /></div>
              <div><Label>Fecha</Label><Inp value={d.firmas?.elaboradoPorFecha} type="date" onChange={v => setDraft('firmas', 'elaboradoPorFecha', v)} /></div>
            </div>
            <div style={{ background: C.bgSoft, padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.corp, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Contratante</div>
              <div style={{ marginBottom: 8 }}><Label>Nombre</Label><Inp value={d.firmas?.contratanteNombre} onChange={v => setDraft('firmas', 'contratanteNombre', v)} /></div>
              <div style={{ marginBottom: 8 }}><Label>Cargo</Label><Inp value={d.firmas?.contratanteCargo} onChange={v => setDraft('firmas', 'contratanteCargo', v)} /></div>
              <div><Label>Fecha</Label><Inp value={d.firmas?.contratanteFecha} type="date" onChange={v => setDraft('firmas', 'contratanteFecha', v)} /></div>
            </div>
          </Grid2>
        ) : (
          <Grid2>
            <div style={{ background: C.bgSoft, padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.corp, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Elaborado por</div>
              <ReadField label="Nombre" value={data.elaboradoPorNombre} />
              <ReadField label="Cargo" value={data.elaboradoPorCargo} />
              <ReadField label="Fecha" value={data.elaboradoPorFecha} />
            </div>
            <div style={{ background: C.bgSoft, padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.corp, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Contratante</div>
              <ReadField label="Nombre" value={data.contratanteNombre} />
              <ReadField label="Cargo" value={data.contratanteCargo} />
              <ReadField label="Fecha" value={data.contratanteFecha} />
            </div>
          </Grid2>
        )}
      </SectionCard>

    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    borrador:   { label: 'Borrador',   color: '#888',    bg: '#f5f5f5' },
    finalizado: { label: 'Finalizado', color: '#1d9e75', bg: '#e6f7f1' },
  }
  const s = map[status] ?? map.borrador
  return (
    <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 600 }}>
      {s.label}
    </span>
  )
}