'use client'

import { useState, useEffect } from 'react'

const ROLES = ['admin', 'trabajador', 'cliente']
const emptyForm = { name: '', email: '', password: '', role: 'trabajador', clienteId: '' }

// ─── PRIMITIVAS UI (desde adquisiciones/[id]) ──────────────────────────────────
function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>
      {children}
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

function FieldWrap({ label, children }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
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

function SectionCard({ title, children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc',
      }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 36 }) {
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f97316']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  const bg = colors[idx]

  if (src) return (
    <img src={src} alt={name} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
      border: '2px solid #e2e8f0',
    }} />
  )
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, color: '#fff', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
      fontFamily: 'inherit',
    }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────
export default function EquipoPage() {
  const [users, setUsers]       = useState([])
  const [clients, setClients]   = useState([])
  const [form, setForm]         = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState(null)

  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving]     = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/admin/equipo')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch { setMsg({ type: 'error', text: 'Error al cargar usuarios' }) }
  }

  async function loadClients() {
    try {
      const res = await fetch('/api/admin/clientes?limit=500')
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch { /* no crítico */ }
  }

  useEffect(() => { load(); loadClients() }, [])

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  function clearMsg() { setMsg(null) }

  // ── Crear ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return
    setLoading(true)
    try {
      const payload = { ...form }
      if (payload.role !== 'cliente') delete payload.clienteId

      const res = await fetch('/api/admin/equipo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Error')
      setMsg({ type: 'success', text: `Usuario "${d.name}" creado correctamente.` })
      setForm(emptyForm); setShowForm(false); load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    finally { setLoading(false) }
  }

  // ── Abrir modal de edición ────────────────────────────────────────────────
  function openEdit(u) {
    setEditUser(u)
    setEditForm({ name: u.name, email: u.email, role: u.role, avatarUrl: u.avatarUrl || '', password: '', clienteId: u.clienteId || '' })
  }
  }

  function closeEdit() { setEditUser(null); setEditForm({}) }

  function setEdit(field, val) { setEditForm(ef => ({ ...ef, [field]: val })) }

  // ── Guardar edición ──────────────────────────────────────────────────────
  async function handleSaveEdit() {
    if (!editForm.name || !editForm.email) return
    setSaving(true)
    try {
      const body = { name: editForm.name, email: editForm.email, role: editForm.role, avatarUrl: editForm.avatarUrl }
      if (editForm.role === 'cliente') body.clienteId = editForm.clienteId || null
      if (editForm.password) body.password = editForm.password

      const res = await fetch(`/api/admin/equipo/${editUser.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Error')
      setMsg({ type: 'success', text: `Usuario "${d.name}" actualizado.` })
      closeEdit(); load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    finally { setSaving(false) }
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────
  async function handleDelete(id, name) {
    if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción es irreversible.`)) return
    try {
      const res = await fetch(`/api/admin/equipo/${id}`, { method: 'DELETE' })
      if (res.ok) { setMsg({ type: 'success', text: `Usuario "${name}" eliminado.` }); load() }
      else { const d = await res.json(); setMsg({ type: 'error', text: d.error || 'Error' }) }
    } catch { setMsg({ type: 'error', text: 'Error al eliminar usuario.' }) }
  }

  const roleBadge = (r) => {
    if (r === 'admin')      return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Admin' }
    if (r === 'trabajador') return { bg: '#f0fdf4', color: '#166534', border: '#86efac', label: 'Trabajador' }
    if (r === 'cliente')    return { bg: '#fffbeb', color: '#b45309', border: '#fcd34d', label: 'Cliente' }
    return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', label: r }
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900, fontFamily: 'inherit' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Equipo
            </h1>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>
              {users.length} {users.length === 1 ? 'usuario' : 'usuarios'} registrados
            </span>
          </div>
          <button onClick={() => { setShowForm(v => !v); clearMsg() }} style={{
            fontSize: 13, padding: '8px 22px', border: 'none', borderRadius: 9,
            background: showForm ? '#fff' : '#0a1628', color: showForm ? '#64748b' : '#fff',
            cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit',
            border: showForm ? '1px solid #e2e8f0' : 'none',
          }}>
            {showForm ? 'Cancelar' : '+ Nuevo usuario'}
          </button>
        </div>
      </div>

      {/* ── Mensaje ─────────────────────────────────────────────────────────── */}
      {msg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${msg.type === 'success' ? '#86efac' : '#fecaca'}`,
          borderRadius: 10, padding: '12px 18px', marginBottom: 24,
          fontSize: 13, color: msg.type === 'success' ? '#166534' : '#991b1b',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={msg.type === 'success' ? '#22c55e' : '#ef4444'} strokeWidth="2.5">
            {msg.type === 'success'
              ? <polyline points="20 6 9 17 4 12" />
              : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
            }
          </svg>
          <span>{msg.text}</span>
          <button onClick={clearMsg} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1, padding: 0 }}>✕</button>
        </div>
      )}

      {/* ── Formulario nuevo usuario ────────────────────────────────────────── */}
      {showForm && (
        <div style={{ marginBottom: 24 }}>
          <SectionCard title="Nuevo usuario">
            <form onSubmit={handleSubmit}>
              <EditGrid>
                <FieldWrap label="Nombre completo *">
                  <Inp value={form.name} onChange={v => set('name', v)} placeholder="Nombre completo" />
                </FieldWrap>
                <FieldWrap label="Correo electrónico *">
                  <Inp type="email" value={form.email} onChange={v => set('email', v)} placeholder="correo@empresa.com" />
                </FieldWrap>
                <FieldWrap label="Contraseña *">
                  <Inp type="password" value={form.password} onChange={v => set('password', v)} placeholder="Mínimo 8 caracteres" />
                </FieldWrap>
                <FieldWrap label="Rol">
                  <select value={form.role} onChange={e => set('role', e.target.value)} style={{
                    width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: 8,
                    padding: '8px 12px', fontSize: 13, color: '#1e293b', background: '#fff',
                    outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                  }}>
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </FieldWrap>
              </EditGrid>

              {/* Cliente asignado (solo visible si rol = cliente) */}
              {form.role === 'cliente' && (
                <div style={{ marginTop: 14 }}>
                  <FieldWrap label="Cliente asignado">
                    <select value={form.clienteId} onChange={e => set('clienteId', e.target.value)} style={{
                      width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: 8,
                      padding: '8px 12px', fontSize: 13, color: '#1e293b', background: '#fff',
                      outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                    }}>
                      <option value="">— Sin cliente asignado —</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.razonSocial} ({c.cedulaRif})</option>
                      ))}
                    </select>
                  </FieldWrap>
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <button type="submit" disabled={loading} style={{
                  fontSize: 13, padding: '8px 22px', border: 'none', borderRadius: 9,
                  background: '#0a1628', color: '#fff', cursor: 'pointer', fontWeight: 700,
                  fontFamily: 'inherit', opacity: loading ? .7 : 1,
                }}>
                  {loading ? 'Creando…' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}

      {/* ── Lista de usuarios ───────────────────────────────────────────────── */}
      <SectionCard title={`Usuarios (${users.length})`}>
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 14 }}>
            No hay usuarios registrados.
          </div>
        ) : (
          <div>
            {users.map((u, i) => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar src={u.avatarUrl} name={u.name} size={40} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{u.name}</span>
                      {u.cliente && (
                        <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', padding: '1px 8px', borderRadius: 10 }}>
                          {u.cliente.razonSocial}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: roleBadge(u.role).bg, color: roleBadge(u.role).color,
                    border: `1px solid ${roleBadge(u.role).border}`,
                  }}>
                    {roleBadge(u.role).label}
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    {new Date(u.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <button onClick={() => openEdit(u)} style={{
                    fontSize: 12, padding: '5px 14px', border: '1px solid #e2e8f0', borderRadius: 7,
                    background: '#fff', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(u.id, u.name)} style={{
                    fontSize: 12, padding: '5px 14px', border: '1px solid #fecaca', borderRadius: 7,
                    background: '#fff', color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── MODAL DE EDICIÓN ────────────────────────────────────────────────── */}
      {editUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
        }} onClick={closeEdit}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
            boxShadow: '0 20px 60px rgba(0,0,0,.15)', overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            {/* Header del modal */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
              background: '#fafbfc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar src={editUser.avatarUrl} name={editUser.name} size={32} />
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Editar usuario</h3>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>{editUser.email}</div>
                </div>
              </div>
              <button onClick={closeEdit} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                fontSize: 20, lineHeight: 1, padding: 0,
              }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Avatar preview + URL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
                  <Avatar src={editForm.avatarUrl} name={editForm.name} size={56} />
                  <div style={{ flex: 1 }}>
                    <FieldWrap label="URL del Avatar (opcional)">
                      <Inp value={editForm.avatarUrl} onChange={v => setEdit('avatarUrl', v)}
                        placeholder="https://… o deja vacío para inicial" />
                    </FieldWrap>
                  </div>
                </div>

                <EditGrid>
                  <FieldWrap label="Nombre completo">
                    <Inp value={editForm.name} onChange={v => setEdit('name', v)} placeholder="Nombre completo" />
                  </FieldWrap>
                  <FieldWrap label="Correo electrónico">
                    <Inp type="email" value={editForm.email} onChange={v => setEdit('email', v)} placeholder="correo@empresa.com" />
                  </FieldWrap>
                  <FieldWrap label="Rol">
                    <select value={editForm.role} onChange={e => setEdit('role', e.target.value)} style={{
                      width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: 8,
                      padding: '8px 12px', fontSize: 13, color: '#1e293b', background: '#fff',
                      outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                    }}>
                      {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                    </select>
                  </FieldWrap>
                </EditGrid>

                {/* Cliente asignado (solo si rol = cliente) */}
                {editForm.role === 'cliente' && (
                  <div style={{ marginTop: 14 }}>
                    <FieldWrap label="Cliente asignado">
                      <select value={editForm.clienteId} onChange={e => setEdit('clienteId', e.target.value)} style={{
                        width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: 8,
                        padding: '8px 12px', fontSize: 13, color: '#1e293b', background: '#fff',
                        outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                      }}>
                        <option value="">— Sin cliente asignado —</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.razonSocial} ({c.cedulaRif})</option>
                        ))}
                      </select>
                    </FieldWrap>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <FieldWrap label="Nueva contraseña (opcional)">
                    <Inp type="password" value={editForm.password} onChange={v => setEdit('password', v)}
                      placeholder="Dejar vacío para no cambiar" />
                  </FieldWrap>
                </EditGrid>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 8,
              padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc',
            }}>
              <button onClick={closeEdit} style={{
                fontSize: 13, padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 9,
                background: '#fff', color: '#64748b', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
              }}>
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={saving} style={{
                fontSize: 13, padding: '8px 22px', border: 'none', borderRadius: 9,
                background: '#0a1628', color: '#fff', cursor: 'pointer', fontWeight: 700,
                fontFamily: 'inherit', opacity: saving ? .7 : 1, display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
