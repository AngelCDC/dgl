'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { scoreColor, scoreLabel } from '../../lib/reportes/verificacion'

// ─── Modal "Añadir informes existentes" (a nivel de módulo) ────────────────────
function AnadirInformesModal({ disponibles, onClose, onAsignar }) {
  const [filtro, setFiltro] = useState('')
  const [seleccionados, setSeleccionados] = useState([])
  const [saving, setSaving] = useState(false)

  const lista = disponibles.filter(r =>
    !filtro || (r.nombreEmpresa + ' ' + (r.nombreEmpresaZh || '')).toLowerCase().includes(filtro.toLowerCase())
  )

  function toggle(id) {
    setSeleccionados(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function asignar() {
    if (seleccionados.length === 0) return
    setSaving(true)
    try {
      await onAsignar(seleccionados)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>Añadir informes existentes</div>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
          Selecciona los informes de verificación que pertenecen a este grupo.
        </p>

        <input
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          placeholder="Buscar por nombre de empresa..."
          style={{ ...inputStyle, marginBottom: 12 }}
        />

        <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
          {lista.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', fontSize: 12.5 }}>
              {disponibles.length === 0 ? 'Todos los informes ya pertenecen a un grupo.' : 'Sin coincidencias.'}
            </div>
          ) : (
            lista.map(r => (
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

        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: '#888' }}>{seleccionados.length} seleccionado(s)</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} disabled={saving} style={secBtnStyle}>Cancelar</button>
            <button onClick={asignar} disabled={saving || seleccionados.length === 0} style={priBtnStyle}>
              {saving ? 'Añadiendo...' : 'Añadir al grupo'}
            </button>
          </div>
        </div>
      </div>
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

// ─── Tarjeta de estadística ─────────────────────────────────────────────────────
function StatBox({ label, value, sub, color = '#111' }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color, letterSpacing: '-0.01em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: '#999', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ─── Componente principal ───────────────────────────────────────────────────────
export default function GrupoDetalle({ grupo: grupoInicial, todosLosReportes: reportesIniciales }) {
  const router = useRouter()

  const [grupo, setGrupo] = useState(grupoInicial)
  const [reportesTodos, setReportesTodos] = useState(reportesIniciales)
  const [msg, setMsg] = useState(null)
  const [editando, setEditando] = useState(false)
  const [editForm, setEditForm] = useState({
    nombre: grupoInicial.nombre, nombreZh: grupoInicial.nombreZh ?? '',
    empresaPrincipal: grupoInicial.empresaPrincipal, descripcion: grupoInicial.descripcion ?? '',
  })
  const [selOpen, setSelOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const recargar = useCallback(async () => {
    const [g, todos] = await Promise.all([
      fetch(`/api/admin/grupos/${grupoInicial.id}`).then(r => r.json()),
      fetch('/api/admin/reportes').then(r => r.json()),
    ])
    if (g && g.id) setGrupo(g)
    if (Array.isArray(todos)) setReportesTodos(todos)
  }, [grupoInicial.id])

  const reportes = Array.isArray(grupo.reportes) ? grupo.reportes : []

  // ── Resumen agregado ──
  const contratos = reportes.flatMap(r => r.contratos || [])
  const puntajes = reportes.map(r => r.puntajeTotal).filter(p => p != null)
  const riesgoMax = puntajes.length ? Math.max(...puntajes) : null
  const contratosFinalizados = contratos.filter(c => c.status === 'finalizado')
  const montoTotal = contratosFinalizados.reduce((s, c) => s + (parseFloat(c.totalContractValue) || 0), 0)

  // ── Acciones ──
  async function guardarEdicion() {
    if (!editForm.nombre.trim() || !editForm.empresaPrincipal.trim()) {
      setMsg({ type: 'error', text: 'El nombre y la empresa principal son obligatorios.' })
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/grupos/${grupo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const json = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: json.error || 'Error al guardar' }); return }
      setGrupo(g => ({ ...g, ...json }))
      setEditando(false)
      setMsg({ type: 'ok', text: 'Grupo actualizado' })
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión' })
    } finally {
      setBusy(false)
    }
  }

  async function asignarInformes(ids) {
    setBusy(true)
    try {
      const results = await Promise.all(ids.map(id =>
        fetch(`/api/admin/reportes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grupoId: grupo.id }),
        })
      ))
      if (results.some(r => !r.ok)) throw new Error('uno falló')
      setMsg({ type: 'ok', text: `${ids.length} informe(s) añadido(s) al grupo` })
      await recargar()
    } catch {
      setMsg({ type: 'error', text: 'Error al asignar los informes' })
    } finally {
      setBusy(false)
    }
  }

  async function quitarInforme(r) {
    if (!confirm(`¿Quitar "${r.nombreEmpresa}" del grupo? El informe no se elimina.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/reportes/${r.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupoId: null }),
      })
      if (!res.ok) throw new Error('falló')
      setMsg({ type: 'ok', text: 'Informe quitado del grupo' })
      await recargar()
    } catch {
      setMsg({ type: 'error', text: 'Error al quitar el informe' })
    } finally {
      setBusy(false)
    }
  }

  async function eliminarGrupo() {
    if (!confirm(`¿Eliminar el grupo "${grupo.nombre}"?\n\nLos informes del grupo NO se eliminan: quedan sin grupo.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/grupos/${grupo.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/reportes')
        return
      }
      const json = await res.json()
      setMsg({ type: 'error', text: json.error || 'Error al eliminar' })
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión' })
    } finally {
      setBusy(false)
    }
  }

  // Informes disponibles para añadir: los que no pertenecen a ningún grupo
  const disponibles = reportesTodos.filter(r => !r.grupoId)

  return (
    <div className="admin-page">
      {/* ── Cabecera ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <Link href="/admin/reportes" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontFamily: 'var(--font-dm)' }}>
            ← Informes de Verificación
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', letterSpacing: '-0.01em', margin: '6px 0 4px' }}>
            {grupo.nombre}
            {grupo.nombreZh && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: '#888', marginLeft: 10 }}>{grupo.nombreZh}</span>
            )}
          </h1>
          <p style={{ fontSize: 13.5, color: '#555', margin: 0 }}>
            Empresa principal: <strong>{grupo.empresaPrincipal}</strong>
          </p>
          {grupo.descripcion && <p style={{ fontSize: 12.5, color: '#888', margin: '6px 0 0' }}>{grupo.descripcion}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => { setEditando(!editando); setEditForm({
            nombre: grupo.nombre, nombreZh: grupo.nombreZh ?? '', empresaPrincipal: grupo.empresaPrincipal, descripcion: grupo.descripcion ?? '',
          }) }} style={secBtnStyle}>
            {editando ? 'Cancelar edición' : '✎ Editar'}
          </button>
          <button onClick={() => setSelOpen(true)} style={priBtnStyle}>＋ Añadir informes</button>
          <button onClick={eliminarGrupo} disabled={busy}
            style={{ ...secBtnStyle, color: '#dc2626', borderColor: '#fecaca' }}>
            Eliminar grupo
          </button>
        </div>
      </div>

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
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* ── Edición inline ── */}
      {editando && (
        <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 14 }}>Editar grupo</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Lbl>Nombre *</Lbl>
              <input value={editForm.nombre} onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <Lbl>Nombre en chino</Lbl>
              <input value={editForm.nombreZh} onChange={e => setEditForm(p => ({ ...p, nombreZh: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Lbl>Empresa principal *</Lbl>
              <input value={editForm.empresaPrincipal} onChange={e => setEditForm(p => ({ ...p, empresaPrincipal: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Lbl>Notas internas</Lbl>
              <textarea rows={2} value={editForm.descripcion} onChange={e => setEditForm(p => ({ ...p, descripcion: e.target.value }))}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-inter)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
            <button onClick={() => setEditando(false)} style={secBtnStyle}>Cancelar</button>
            <button onClick={guardarEdicion} disabled={busy} style={priBtnStyle}>{busy ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      )}

      {/* ── Resumen agregado ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatBox label="Empresas en el grupo" value={reportes.length} />
        <StatBox
          label="Riesgo máximo"
          value={riesgoMax == null ? '—' : scoreLabel(riesgoMax)}
          color={riesgoMax == null ? '#888' : scoreColor(riesgoMax)}
          sub={riesgoMax != null ? `Score más alto: ${riesgoMax}` : undefined}
        />
        <StatBox
          label="Contratos del grupo"
          value={contratos.length}
          sub={contratosFinalizados.length ? `${contratosFinalizados.length} finalizado(s)` : 'Ninguno finalizado'}
        />
        <StatBox
          label="Monto contratado"
          value={montoTotal ? `$${montoTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—'}
          sub={contratosFinalizados.length ? 'Contratos finalizados' : 'Sin contratos finalizados'}
        />
      </div>

      {/* ── Empresas miembro ── */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Empresas del grupo ({reportes.length})</span>
        </div>
        {reportes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
            Este grupo aún no tiene informes. Usa «Añadir informes» para vincular las empresas del conglomerado.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #eee' }}>
                  <th style={thStyle}>Empresa</th>
                  <th style={thStyle}>USCC</th>
                  <th style={thStyle}>Riesgo</th>
                  <th style={thStyle}>Contratos</th>
                  <th style={thStyle}>Informe</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '500', color: '#111' }}>{r.nombreEmpresa}</div>
                      {r.nombreEmpresaZh && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#aaa' }}>{r.nombreEmpresaZh}</div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888' }}>
                      {r.codigoCreditoSocial || '—'}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: scoreColor(r.puntajeTotal) }}>{scoreLabel(r.puntajeTotal)}</span>
                      {r.puntajeTotal != null && <span style={{ fontSize: 11, color: '#aaa', marginLeft: 6 }}>{r.puntajeTotal}</span>}
                    </td>
                    <td style={tdStyle}>
                      {(r.contratos || []).length === 0 ? (
                        <span style={{ color: '#bbb' }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {(r.contratos || []).map(c => (
                            <Link key={c.id} href={`/admin/contratos/${c.id}`}
                              style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontFamily: 'var(--font-dm)' }}>
                              {c.numero || c.id.slice(0, 8)}
                              <span style={{
                                marginLeft: 6, padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                                background: c.status === 'finalizado' ? '#dcfce7' : '#f4f4f5',
                                color: c.status === 'finalizado' ? '#15803d' : '#888',
                              }}>
                                {c.status === 'finalizado' ? 'Finalizado' : 'Borrador'}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12, color: '#aaa' }}>
                      {new Date(r.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link href={`/auditorias/reporte/${r.id}`}
                          style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 11, color: '#2563eb', textDecoration: 'none', fontFamily: 'var(--font-dm)' }}>
                          Ver informe
                        </Link>
                        <button onClick={() => quitarInforme(r)} disabled={busy}
                          style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, fontSize: 11, color: '#dc2626', background: '#fff', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>
                          Quitar
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

      {/* ── Línea de tiempo ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 12, fontWeight: 600, color: '#111' }}>
            📄 Informes de verificación
          </div>
          <div style={{ padding: '8px 20px 14px' }}>
            {reportes.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: 12.5, padding: '12px 0' }}>Sin informes.</div>
            ) : (
              reportes.map(r => (
                <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid #f7f7f7', fontSize: 12.5 }}>
                  <span style={{ color: '#aaa', flexShrink: 0, fontSize: 11.5 }}>
                    {new Date(r.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ color: '#333' }}>{r.nombreEmpresa}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 12, fontWeight: 600, color: '#111' }}>
            ✍️ Contratos de compra
          </div>
          <div style={{ padding: '8px 20px 14px' }}>
            {contratos.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: 12.5, padding: '12px 0' }}>Sin contratos vinculados.</div>
            ) : (
              contratos.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid #f7f7f7', fontSize: 12.5 }}>
                  <span style={{ color: '#aaa', flexShrink: 0, fontSize: 11.5 }}>{c.fecha || '—'}</span>
                  <span style={{ color: '#333', flex: 1 }}>{c.numero || c.id.slice(0, 8)}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: c.status === 'finalizado' ? '#15803d' : '#888',
                  }}>
                    {c.status === 'finalizado' ? 'Finalizado' : 'Borrador'}
                  </span>
                  {c.totalContractValue && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#555' }}>${parseFloat(c.totalContractValue).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Modal añadir informes ── */}
      {selOpen && (
        <AnadirInformesModal
          disponibles={disponibles}
          onClose={() => setSelOpen(false)}
          onAsignar={asignarInformes}
        />
      )}
    </div>
  )
}

function Lbl({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, fontFamily: 'var(--font-dm)' }}>
      {children}
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
