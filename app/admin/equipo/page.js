'use client'

import { useState, useEffect } from 'react'

const ROLES = ['admin', 'editor']
const empty = { name: '', email: '', password: '', role: 'editor' }

export default function EquipoPage() {
  const [users, setUsers]     = useState([])
  const [form, setForm]       = useState(empty)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  async function load() {
    const res = await fetch('/api/admin/equipo')
    const data = await res.json()
    setUsers(data)
  }

  useEffect(() => { load() }, [])

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/equipo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Error') }
      setMsg('Usuario creado correctamente.')
      setForm(empty); setShowForm(false); load()
    } catch (err) { setMsg(err.message) }
    finally { setLoading(false) }
  }

  async function handleDelete(id, name) {
    if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción es irreversible.`)) return
    const res = await fetch(`/api/admin/equipo/${id}`, { method: 'DELETE' })
    if (res.ok) { setMsg('Usuario eliminado.'); load() }
    else { const d = await res.json(); setMsg(d.error || 'Error') }
  }

  const roleColor = (r) => r === 'admin' ? { bg: '#eff6ff', color: '#2563eb' } : { bg: '#f5f5f5', color: '#555' }

  return (
    <div style={{ padding: '32px', maxWidth: '780px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600' }}>Equipo</h1>
        <button onClick={() => { setShowForm(v => !v); setMsg('') }}
          style={{ background: '#111', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
          {showForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {msg && <div style={{ fontSize: '13px', color: msg.includes('Error') || msg.includes('error') ? '#dc2626' : '#16a34a', marginBottom: '16px', padding: '10px 14px', background: '#f9f9f9', borderRadius: '6px' }}>{msg}</div>}

      {/* Formulario nuevo usuario */}
      {showForm && (
        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Nuevo usuario</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <Campo label="Nombre completo *">
                <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Nombre" style={inputStyle} />
              </Campo>
              <Campo label="Correo electrónico *">
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="correo@empresa.com" style={inputStyle} />
              </Campo>
              <Campo label="Contraseña *">
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Mínimo 8 caracteres" minLength={8} style={inputStyle} />
              </Campo>
              <Campo label="Rol">
                <select value={form.role} onChange={e => set('role', e.target.value)} style={inputStyle}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </Campo>
            </div>
            <button type="submit" disabled={loading}
              style={{ background: '#111', color: 'white', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
              {loading ? 'Creando…' : 'Crear usuario'}
            </button>
          </form>
        </div>
      )}

      {/* Lista */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
        {users.length === 0
          ? <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>No hay usuarios registrados.</div>
          : users.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{u.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{u.name}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{u.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500', ...roleColor(u.role) }}>
                  {u.role}
                </span>
                <span style={{ fontSize: '12px', color: '#aaa' }}>
                  {new Date(u.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <button onClick={() => handleDelete(u.id, u.name)}
                  style={{ fontSize: '13px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', color: '#555', marginBottom: '6px', fontWeight: '500' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '13px', outline: 'none' }
