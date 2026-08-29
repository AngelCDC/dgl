'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Modal de nuevo grupo (a nivel de módulo: evita perder el foco al teclear) ──
function NuevoGrupoModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ nombre: '', nombreZh: '', empresaPrincipal: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function guardar() {
    if (!form.nombre.trim() || !form.empresaPrincipal.trim()) {
      setError('El nombre del grupo y la empresa principal son obligatorios.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/grupos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Error al crear el grupo'); return }
      onCreated(json)
    } catch {
      setError('Error de conexión al crear el grupo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>Nuevo Grupo Empresarial</div>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 18 }}>
          Agrupa empresas relacionadas (matriz, filiales, asociadas) para ver su panorama completo.
        </p>

        <ModalField label="Nombre del grupo *" placeholder="Grupo Huawei">
          <input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inputStyle} />
        </ModalField>
        <ModalField label="Nombre en chino" placeholder="华为集团">
          <input value={form.nombreZh} onChange={e => set('nombreZh', e.target.value)} style={inputStyle} />
        </ModalField>
        <ModalField label="Empresa principal *" placeholder="Huawei Technologies Co., Ltd.">
          <input value={form.empresaPrincipal} onChange={e => set('empresaPrincipal', e.target.value)} style={inputStyle} />
        </ModalField>
        <ModalField label="Notas internas">
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-inter)' }} />
        </ModalField>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 12.5, borderRadius: 8, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={saving} style={secBtnStyle}>Cancelar</button>
          <button onClick={guardar} disabled={saving} style={priBtnStyle}>
            {saving ? 'Guardando...' : 'Crear grupo'}
          </button>
        </div>
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

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  padding: '80px 16px', zIndex: 100, backdropFilter: 'blur(2px)',
}
const modalStyle = {
  background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 480,
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

// ─── Página ─────────────────────────────────────────────────────────────────────
export default function GruposAdminPage() {
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [nuevo, setNuevo] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/grupos')
      if (res.ok) setGrupos(await res.json())
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(g) {
    if (!confirm(`¿Eliminar el grupo "${g.nombre}"?\n\nLos informes que pertenecen al grupo NO se eliminan: quedan sin grupo.`)) return
    try {
      const res = await fetch(`/api/admin/grupos/${g.id}`, { method: 'DELETE' })
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Grupo eliminado' })
        load()
      } else {
        const json = await res.json()
        setMsg({ type: 'error', text: json.error || 'Error al eliminar' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Error de conexión' })
    }
  }

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111', letterSpacing: '-0.01em', marginBottom: '3px' }}>
            Grupos Empresariales
          </h1>
          <p style={{ fontSize: '13px', color: '#888' }}>
            Relaciona empresas vinculadas entre sí para tener una vista general del panorama de cada conglomerado
          </p>
        </div>
        <button onClick={() => setNuevo(true)} style={priBtnStyle}>✚ Nuevo Grupo</button>
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

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Grupos ({grupos.length})</span>
        </div>

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>Cargando...</div>
        ) : grupos.length === 0 ? (
          <div style={{ padding: '48px 36px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
            No hay grupos todavía. Crea el primero con el botón «Nuevo Grupo» y luego añade sus informes.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #eee' }}>
                  <th style={thStyle}>Grupo</th>
                  <th style={thStyle}>Empresa principal</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Informes</th>
                  <th style={thStyle}>Creado</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '500', color: '#111' }}>{g.nombre}</div>
                      {g.nombreZh && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#aaa' }}>{g.nombreZh}</div>
                      )}
                      {g.descripcion && (
                        <div style={{ fontSize: 11.5, color: '#999', marginTop: 2 }}>{g.descripcion}</div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: '#555' }}>{g.empresaPrincipal}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11.5, fontWeight: 600,
                        background: '#eff6ff', color: '#1d4ed8',
                      }}>
                        {g._count?.reportes ?? 0}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12, color: '#aaa' }}>
                      {new Date(g.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link href={`/admin/grupos/${g.id}`}
                          style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 11, color: '#2563eb', textDecoration: 'none', fontFamily: 'var(--font-dm)' }}>
                          Ver panorama
                        </Link>
                        <button onClick={() => handleDelete(g)}
                          style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, fontSize: 11, color: '#dc2626', background: '#fff', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>
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

      {nuevo && (
        <NuevoGrupoModal
          onClose={() => setNuevo(false)}
          onCreated={g => { setNuevo(false); setMsg({ type: 'ok', text: `Grupo "${g.nombre}" creado` }); load() }}
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
