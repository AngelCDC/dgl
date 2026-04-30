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
    background: C.white, outline: 'none', fontFamily: 'inherit',
  }
  if (rows) return (
    <textarea rows={rows} style={{ ...base, resize: 'vertical' }}
      value={value ?? ''} placeholder={placeholder}
      onChange={e => onChange(e.target.value)} />
  )
  return (
    <input type={type} style={base} value={value ?? ''} placeholder={placeholder}
      onChange={e => onChange(e.target.value)} />
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
      borderRadius: 6, background: C.white, color: C.steel, cursor: 'pointer', fontFamily: 'inherit',
    }}>Editar</button>
  )
}

function BtnSave({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      fontSize: 11, padding: '4px 14px', border: 'none',
      borderRadius: 6, background: C.electric, color: C.white,
      cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
    }}>{loading ? 'Guardando...' : 'Guardar'}</button>
  )
}

function BtnCancel({ onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11, padding: '4px 12px', border: `1px solid ${C.border}`,
      borderRadius: 6, background: C.white, color: C.steel, cursor: 'pointer', fontFamily: 'inherit',
    }}>Cancelar</button>
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
      <div style={{ padding: '16px' }}>{children}</div>
    </div>
  )
}

// ─── HELPERS ESTUDIO DE MERCADO ───────────────────────────────────────────────

// Agrupa array plano de cotizantes por productoNombre
// [{productoNombre, nombre, valor}] → [{productoNombre, cotizantes:[...]}]
function groupCotizantesByProducto(cotizantes = []) {
  const map = {}
  const order = []
  for (const c of cotizantes) {
    const key = c.productoNombre || 'Sin producto'
    if (!map[key]) { map[key] = []; order.push(key) }
    map[key].push(c)
  }
  return order.map(key => ({ productoNombre: key, cotizantes: map[key] }))
}

// Convierte grupos de vuelta a array plano para el PATCH
function flattenGrupos(grupos) {
  return grupos.flatMap(g =>
    g.cotizantes.map(c => ({ productoNombre: g.productoNombre, nombre: c.nombre, valor: c.valor }))
  )
}

const defaultCotizante = () => ({ nombre: '', valor: '' })
const defaultGrupo     = (productoNombre = '') => ({ productoNombre, cotizantes: [defaultCotizante(), defaultCotizante(), defaultCotizante()] })

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function AdquisicionDetallePage({ params }) {
  const router = useRouter()
  const [id, setId] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
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

  if (loading) return <div style={{ padding: 32, color: C.steel }}>Cargando...</div>
  if (!data)   return <div style={{ padding: 32, color: C.steel }}>No encontrado.</div>

  const finalizado = data.status === 'finalizado'

  const startEdit  = (section, initialDraft) => {
    setDrafts(prev  => ({ ...prev,  [section]: initialDraft }))
    setEditing(prev => ({ ...prev, [section]: true }))
  }
  const cancelEdit = (section) => {
    setEditing(prev => ({ ...prev, [section]: false }))
    setDrafts(prev  => ({ ...prev, [section]: undefined }))
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
      const updated = await fetch(`/api/admin/adquisiciones/${id}`).then(r => r.json())
      setData(updated)
      setEditing(prev => ({ ...prev, [section]: false }))
    } catch {
      alert('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(prev => ({ ...prev, [section]: false }))
    }
  }
  const setDraft = (section, key, value) =>
    setDrafts(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }))

  // ── Helpers específicos para edición de grupos de cotizantes ────────────────
  const setGrupoNombre = (gi, nombre) =>
    setDrafts(prev => {
      const grupos = [...prev.mercado.grupos]
      grupos[gi] = { ...grupos[gi], productoNombre: nombre }
      return { ...prev, mercado: { ...prev.mercado, grupos } }
    })

  const setGrupoCotizante = (gi, ci, key, value) =>
    setDrafts(prev => {
      const grupos = [...prev.mercado.grupos]
      const cotizantes = [...grupos[gi].cotizantes]
      cotizantes[ci] = { ...cotizantes[ci], [key]: value }
      grupos[gi] = { ...grupos[gi], cotizantes }
      return { ...prev, mercado: { ...prev.mercado, grupos } }
    })

  const addCotizanteAGrupo = (gi) =>
    setDrafts(prev => {
      const grupos = [...prev.mercado.grupos]
      grupos[gi] = { ...grupos[gi], cotizantes: [...grupos[gi].cotizantes, defaultCotizante()] }
      return { ...prev, mercado: { ...prev.mercado, grupos } }
    })

  const removeCotizanteDeGrupo = (gi, ci) =>
    setDrafts(prev => {
      const grupos = [...prev.mercado.grupos]
      const cotizantes = grupos[gi].cotizantes.filter((_, i) => i !== ci)
      grupos[gi] = { ...grupos[gi], cotizantes: cotizantes.length ? cotizantes : [defaultCotizante()] }
      return { ...prev, mercado: { ...prev.mercado, grupos } }
    })

  const addGrupo = () =>
    setDrafts(prev => ({
      ...prev,
      mercado: { ...prev.mercado, grupos: [...prev.mercado.grupos, defaultGrupo()] }
    }))

  const removeGrupo = (gi) =>
    setDrafts(prev => ({
      ...prev,
      mercado: {
        ...prev.mercado,
        grupos: prev.mercado.grupos.length > 1
          ? prev.mercado.grupos.filter((_, i) => i !== gi)
          : prev.mercado.grupos,
      }
    }))

  const handleEmitir = async () => {
    if (!confirm('¿Emitir este documento como finalizado? No podrá editarse.')) return
    setEmitting(true)
    try {
      await fetch(`/api/admin/adquisiciones/${id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'emitir' }),
      })
      // Refrescar para obtener fechas y datos auto-poblados
      const updated = await fetch(`/api/admin/adquisiciones/${id}`).then(r => r.json())
      setData(updated)
    } catch { alert('Error al emitir.') }
    finally { setEmitting(false) }
  }

  const handleReabrir = async () => {
    setEmitting(true)
    try {
      await fetch(`/api/admin/adquisiciones/${id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reabrir' }),
      })
      setData(prev => ({ ...prev, status: 'borrador' }))
    } catch { alert('Error al reabrir.') }
    finally { setEmitting(false) }
  }

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
          <a href={`/api/admin/adquisiciones/${id}/pdf`} target="_blank"
            style={{ fontSize: 12, padding: '8px 16px', border: `1px solid ${C.electric}`, borderRadius: 8, color: C.electric, textDecoration: 'none' }}>
            ↓ PDF
          </a>
          {finalizado ? (
            <button onClick={handleReabrir} disabled={emitting}
              style={{ fontSize: 12, padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.steel, cursor: 'pointer' }}>
              {emitting ? '...' : 'Reabrir'}
            </button>
          ) : (
            <button onClick={handleEmitir} disabled={emitting}
              style={{ fontSize: 12, padding: '8px 16px', border: 'none', borderRadius: 8, background: C.navy, color: C.white, cursor: 'pointer', fontWeight: 600 }}>
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
          fecha: data.fecha, solicitante: data.solicitante,
          ccNit: data.ccNit, telCel: data.telCel, ext: data.ext, email: data.email,
        })}
        onSave={() => saveSection('general', d.general)}
        onCancel={() => cancelEdit('general')}
        saving={saving.general} finalizado={finalizado}
      >
        {editing.general ? (
          <>
            <Grid2>
              <div><Label>Solicitante</Label><Inp value={d.general?.solicitante} onChange={v => setDraft('general', 'solicitante', v)} /></div>
              <div><Label>Email</Label><Inp value={d.general?.email} type="email" onChange={v => setDraft('general', 'email', v)} /></div>
            </Grid2>
            <Grid3>
              <div><Label>C.C. / NIT</Label><Inp value={d.general?.ccNit} onChange={v => setDraft('general', 'ccNit', v)} /></div>
              <div><Label>Teléfono / Celular</Label><Inp value={d.general?.telCel} onChange={v => setDraft('general', 'telCel', v)} /></div>
              <div><Label>Ext.</Label><Inp value={d.general?.ext} onChange={v => setDraft('general', 'ext', v)} /></div>
            </Grid3>
            <div style={{ maxWidth: 200 }}><Label>Fecha</Label><Inp value={d.general?.fecha} onChange={v => setDraft('general', 'fecha', v)} /></div>
          </>
        ) : (
          <Grid2>
            <ReadField label="Solicitante"      value={data.solicitante} />
            <ReadField label="Email"            value={data.email} />
            <ReadField label="C.C. / NIT"       value={data.ccNit} />
            <ReadField label="Teléfono"         value={data.telCel} />
            <ReadField label="Ext."             value={data.ext} />
            <ReadField label="Fecha"            value={data.fecha} />
          </Grid2>
        )}
      </SectionCard>

      {/* ── 2. JUSTIFICACIÓN ── */}
      <SectionCard title="2. Justificación" editing={editing.justificacion}
        onEdit={() => startEdit('justificacion', {
          descripcionNecesidad: [data.descripcionNecesidad, data.pertinencia].filter(Boolean).join('\n\n'),
        })}
        onSave={() => saveSection('justificacion', { descripcionNecesidad: d.justificacion?.descripcionNecesidad, pertinencia: '' })}
        onCancel={() => cancelEdit('justificacion')}
        saving={saving.justificacion} finalizado={finalizado}
      >
        {editing.justificacion ? (
          <div><Label>Justificación</Label><Inp rows={5} value={d.justificacion?.descripcionNecesidad} onChange={v => setDraft('justificacion', 'descripcionNecesidad', v)} /></div>
        ) : (
          <ReadField label="Justificación" value={data.descripcionNecesidad} />
        )}
      </SectionCard>

      {/* ── 3. OBJETO ── */}
      <SectionCard title="3. Objeto a Contratar" editing={editing.objeto}
        onEdit={() => startEdit('objeto', { descripcionObjeto: data.descripcionObjeto, requierePermisos: data.requierePermisos })}
        onSave={() => saveSection('objeto', d.objeto)}
        onCancel={() => cancelEdit('objeto')}
        saving={saving.objeto} finalizado={finalizado}
      >
        {/* Productos de la solicitud de procura vinculada — siempre visible, solo lectura */}
        {data.solicitudProcura?.productos?.length > 0 && (
          <div style={{ marginBottom: 14, background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, color: C.steel, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, fontWeight: 700 }}>
              Especificaciones — Solicitud de Procura vinculada
            </div>
            {data.solicitudProcura.productos.map((p, i) => (
              <div key={p.id} style={{ paddingTop: i > 0 ? 8 : 0, marginTop: i > 0 ? 8 : 0, borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 2 }}>{p.nombreProducto}</div>
                {(p.descripcionGeneral || p.descripcion) && (
                  <div style={{ fontSize: 12, color: C.steel, lineHeight: 1.55 }}>{p.descripcionGeneral || p.descripcion}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {editing.objeto ? (
          <>
            <div style={{ marginBottom: 10 }}><Label>Descripción del Objeto</Label><Inp rows={3} value={d.objeto?.descripcionObjeto} onChange={v => setDraft('objeto', 'descripcionObjeto', v)} /></div>
            <div>
              <Label>¿Requiere Permisos?</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['SÍ', 'NO'].map(op => (
                  <button key={op} type="button" onClick={() => setDraft('objeto', 'requierePermisos', op)}
                    style={{ padding: '6px 18px', border: `1px solid ${d.objeto?.requierePermisos === op ? C.electric : C.border}`, borderRadius: 6, background: d.objeto?.requierePermisos === op ? C.electric : C.white, color: d.objeto?.requierePermisos === op ? C.white : C.steel, cursor: 'pointer', fontSize: 12 }}>
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <ReadField label="Descripción" value={data.descripcionObjeto} />
            <ReadField label="Requiere Permisos" value={data.requierePermisos} />
          </>
        )}
      </SectionCard>

      {/* ── 4. OBLIGACIONES ── */}
      <SectionCard title="4. Obligaciones del Contratista" editing={editing.obligaciones}
        onEdit={() => startEdit('obligaciones', { obligaciones: data.obligaciones?.length ? [...data.obligaciones] : [''] })}
        onSave={() => saveSection('obligaciones', { obligaciones: d.obligaciones?.obligaciones.filter(o => o.trim()) })}
        onCancel={() => cancelEdit('obligaciones')}
        saving={saving.obligaciones} finalizado={finalizado}
      >
        {editing.obligaciones ? (
          <>
            {d.obligaciones?.obligaciones.map((ob, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: C.electric, fontWeight: 700, minWidth: 20 }}>{String.fromCharCode(97 + i)})</span>
                <Inp value={ob} onChange={v => { const arr = [...d.obligaciones.obligaciones]; arr[i] = v; setDraft('obligaciones', 'obligaciones', arr) }} />
                {d.obligaciones.obligaciones.length > 1 && (
                  <button onClick={() => setDraft('obligaciones', 'obligaciones', d.obligaciones.obligaciones.filter((_, j) => j !== i))}
                    style={{ color: C.steel, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setDraft('obligaciones', 'obligaciones', [...d.obligaciones.obligaciones, ''])}
              style={{ fontSize: 12, color: C.electric, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
              + Agregar obligación
            </button>
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

      {/* ── 5. PLAZO DE EJECUCIÓN ── */}
      <SectionCard title="5. Plazo de Ejecución" editing={editing.modalidad}
        onEdit={() => startEdit('modalidad', { plazo: data.plazo || '4 Meses' })}
        onSave={() => saveSection('modalidad', { plazo: d.modalidad?.plazo })}
        onCancel={() => cancelEdit('modalidad')}
        saving={saving.modalidad} finalizado={finalizado}
      >
        {editing.modalidad ? (
          <div style={{ maxWidth: 240 }}>
            <Label>Plazo</Label>
            <Inp value={d.modalidad?.plazo} placeholder="Ej: 4 Meses" onChange={v => setDraft('modalidad', 'plazo', v)} />
          </div>
        ) : (
          <ReadField label="Plazo" value={data.plazo || '4 Meses'} />
        )}
      </SectionCard>

      {/* ── 6. ESTUDIO DE MERCADO — tablas por producto ── */}
      <SectionCard
        title="6. Estudio de Mercado"
        editing={editing.mercado}
        onEdit={() => {
          // Convierte el array plano de la BD en grupos para edición
          const grupos = groupCotizantesByProducto(data.cotizantes ?? [])
          startEdit('mercado', {
            grupos: grupos.length ? grupos.map(g => ({
              productoNombre: g.productoNombre,
              cotizantes: g.cotizantes.map(c => ({ nombre: c.nombre, valor: c.valor })),
            })) : [defaultGrupo()],
            valorEstimado: data.valorEstimado,
          })
        }}
        onSave={() => saveSection('mercado', {
          // Aplana grupos → array plano para el PATCH
          cotizantes: flattenGrupos(d.mercado?.grupos ?? []).filter(c => c.nombre.trim()),
          valorEstimado: d.mercado?.valorEstimado,
        })}
        onCancel={() => cancelEdit('mercado')}
        saving={saving.mercado} finalizado={finalizado}
      >
        {editing.mercado ? (
          /* ── MODO EDICIÓN: grupos dinámicos ── */
          <>
            {d.mercado?.grupos.map((grupo, gi) => (
              <div key={gi} style={{ border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 14, overflow: 'hidden' }}>

                {/* Cabecera del grupo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.bgSoft, padding: '8px 12px', borderBottom: `1px solid ${C.border}` }}>
                  <input
                    value={grupo.productoNombre}
                    placeholder="Nombre del producto / ítem..."
                    onChange={e => setGrupoNombre(gi, e.target.value)}
                    style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', fontSize: 13, fontFamily: 'inherit', fontWeight: 600, color: C.navy }}
                  />
                  {d.mercado.grupos.length > 1 && (
                    <button onClick={() => removeGrupo(gi)}
                      style={{ color: C.steel, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✕</button>
                  )}
                </div>

                {/* Filas de cotizantes */}
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: 8, marginBottom: 6 }}>
                    <Label>Cotizante / Proveedor</Label>
                    <Label>Valor</Label>
                    <span />
                  </div>
                  {grupo.cotizantes.map((c, ci) => (
                    <div key={ci} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <Inp value={c.nombre} placeholder="Nombre del proveedor"
                        onChange={v => setGrupoCotizante(gi, ci, 'nombre', v)} />
                      <Inp value={c.valor} placeholder="$ 0"
                        onChange={v => setGrupoCotizante(gi, ci, 'valor', v)} />
                      {grupo.cotizantes.length > 1 && (
                        <button onClick={() => removeCotizanteDeGrupo(gi, ci)}
                          style={{ color: C.steel, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addCotizanteAGrupo(gi)}
                    style={{ fontSize: 12, color: C.electric, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                    + Agregar cotizante
                  </button>
                </div>
              </div>
            ))}

            {/* Agregar producto */}
            <button onClick={addGrupo}
              style={{ fontSize: 12, color: C.electric, background: 'none', border: `1px dashed ${C.electric}`, borderRadius: 6, cursor: 'pointer', padding: '6px 16px', marginBottom: 12, width: '100%' }}>
              + Agregar producto
            </button>

            <div><Label>Valor Estimado Total</Label><Inp value={d.mercado?.valorEstimado} placeholder="$ 0" onChange={v => setDraft('mercado', 'valorEstimado', v)} /></div>
          </>
        ) : (
          /* ── MODO LECTURA: una tabla por producto ── */
          <>
            {groupCotizantesByProducto(data.cotizantes ?? []).map((grupo, gi) => (
              <div key={gi} style={{ marginBottom: 16 }}>
                {/* Nombre del producto */}
                <div style={{
                  fontSize: 11, fontWeight: 700, color: C.navy,
                  background: C.bgSoft, borderLeft: `3px solid ${C.electric}`,
                  padding: '5px 10px', marginBottom: 0,
                }}>
                  {grupo.productoNombre}
                </div>

                {/* Tabla de cotizantes */}
                <div style={{ border: `1px solid ${C.border}`, borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', background: C.navy, padding: '7px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.white, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cotizante / Proveedor</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.white, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Valor</span>
                  </div>
                  {grupo.cotizantes.map((c, ci) => (
                    <div key={c.id ?? ci} style={{
                      display: 'grid', gridTemplateColumns: '1fr 140px',
                      padding: '8px 14px', borderTop: `1px solid ${C.border}`,
                      background: ci % 2 === 1 ? C.bgSoft : C.white,
                    }}>
                      <span style={{ fontSize: 13, color: c.nombre ? C.carbon : C.steel }}>
                        {c.nombre || '—'}
                      </span>
                      <span style={{ fontSize: 13, color: C.electric, textAlign: 'right', fontFamily: 'monospace' }}>
                        {c.valor && c.valor !== '0' ? c.valor : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {(!data.cotizantes || data.cotizantes.length === 0) && (
              <span style={{ fontSize: 13, color: C.steel }}>Sin cotizantes registrados.</span>
            )}

            <div style={{ marginTop: 8 }}>
              <ReadField label="Valor Estimado Total" value={data.valorEstimado} />
            </div>
          </>
        )}
      </SectionCard>



      {/* ── 7. RIESGOS ── */}
      <SectionCard title="7. Análisis de Riesgos" editing={editing.riesgos}
        onEdit={() => startEdit('riesgos', {
          riesgos: data.riesgos?.length
            ? data.riesgos.map(r => ({ descripcion: r.descripcion, mitigacion: r.mitigacion ?? '', asignacion: r.asignacion ?? 'Contratante' }))
            : [{ descripcion: '', mitigacion: '', asignacion: 'Contratante' }]
        })}
        onSave={() => saveSection('riesgos', { riesgos: d.riesgos?.riesgos.filter(r => r.descripcion.trim()) })}
        onCancel={() => cancelEdit('riesgos')}
        saving={saving.riesgos} finalizado={finalizado}
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
                        style={{ padding: '5px 12px', border: `1px solid ${r.asignacion === op ? C.electric : C.border}`, borderRadius: 6, background: r.asignacion === op ? C.electric : C.white, color: r.asignacion === op ? C.white : C.steel, cursor: 'pointer', fontSize: 12 }}>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setDraft('riesgos', 'riesgos', [...d.riesgos.riesgos, { descripcion: '', mitigacion: '', asignacion: 'Contratante' }])}
              style={{ fontSize: 12, color: C.electric, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
              + Agregar riesgo
            </button>
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

      {/* ── 8. FIRMAS ── */}
      <SectionCard title="8. Firmas y Aprobaciones" editing={editing.firmas}
        onEdit={() => startEdit('firmas', {
          elaboradoPorFecha: data.elaboradoPorFecha,
          contratanteNombre: data.contratanteNombre, contratanteCargo: data.contratanteCargo, contratanteFecha: data.contratanteFecha,
        })}
        onSave={() => saveSection('firmas', {
          ...d.firmas,
          elaboradoPorNombre: 'Angel Dubois',
          elaboradoPorCargo:  'FOUNDER - CEO',
        })}
        onCancel={() => cancelEdit('firmas')}
        saving={saving.firmas} finalizado={finalizado}
      >
        {editing.firmas ? (
          <Grid2>
            {/* Elaborado por — solo lectura */}
            <div style={{ background: C.bgSoft, padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.corp, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Elaborado por</div>
              <div style={{ marginBottom: 8 }}>
                <Label>Nombre</Label>
                <div style={{ fontSize: 13, color: C.carbon, padding: '7px 10px', background: '#f0f0f0', borderRadius: 6, border: `1px solid ${C.border}` }}>Angel Dubois</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Label>Cargo</Label>
                <div style={{ fontSize: 13, color: C.carbon, padding: '7px 10px', background: '#f0f0f0', borderRadius: 6, border: `1px solid ${C.border}` }}>FOUNDER - CEO</div>
              </div>
              <div><Label>Fecha</Label><Inp value={d.firmas?.elaboradoPorFecha} type="date" onChange={v => setDraft('firmas', 'elaboradoPorFecha', v)} /></div>
            </div>
            {/* Contratante — editable */}
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
              <ReadField label="Nombre" value={data.elaboradoPorNombre || 'Angel Dubois'} />
              <ReadField label="Cargo"  value={data.elaboradoPorCargo  || 'FOUNDER - CEO'} />
              <ReadField label="Fecha"  value={data.elaboradoPorFecha} />
            </div>
            <div style={{ background: C.bgSoft, padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.corp, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Contratante</div>
              <ReadField label="Nombre" value={data.contratanteNombre} />
              <ReadField label="Cargo"  value={data.contratanteCargo} />
              <ReadField label="Fecha"  value={data.contratanteFecha} />
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