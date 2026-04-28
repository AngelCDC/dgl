'use client'

import { useState, useEffect } from 'react'

const empty = { name: '', description: '', price: '', currency: 'USD', durationDays: 30, isFeatured: false, badgeLabel: '', maxProducts: 5, active: true }

export default function PlanesPage() {
  const [planes, setPlanes]   = useState([])
  const [form, setForm]       = useState(empty)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  async function load() {
    const res = await fetch('/api/admin/planes')
    const data = await res.json()
    setPlanes(data)
  }

  useEffect(() => { load() }, [])

  function startEdit(plan) {
    setEditing(plan.id)
    setForm({
      name: plan.name, description: plan.description || '', price: plan.price ?? '',
      currency: plan.currency, durationDays: plan.durationDays, isFeatured: plan.isFeatured,
      badgeLabel: plan.badgeLabel || '', maxProducts: plan.maxProducts, active: plan.active,
    })
    setMsg('')
  }

  function cancelEdit() { setEditing(null); setForm(empty); setMsg('') }

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name) return
    setLoading(true)
    try {
      const payload = { ...form, price: form.price === '' ? null : parseFloat(form.price), durationDays: parseInt(form.durationDays), maxProducts: parseInt(form.maxProducts) }
      const url    = editing ? `/api/admin/planes/${editing}` : '/api/admin/planes'
      const method = editing ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Error') }
      setMsg(editing ? 'Plan actualizado.' : 'Plan creado.')
      cancelEdit(); load()
    } catch (err) { setMsg(err.message) }
    finally { setLoading(false) }
  }

  async function handleDelete(id, name) {
    if (!confirm(`¿Eliminar el plan "${name}"?`)) return
    const res = await fetch(`/api/admin/planes/${id}`, { method: 'DELETE' })
    if (res.ok) { setMsg('Plan eliminado.'); load() }
    else { const d = await res.json(); setMsg(d.error || 'Error') }
  }

  async function toggleActive(plan) {
    await fetch(`/api/admin/planes/${plan.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...plan, active: !plan.active }),
    })
    load()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Planes de proveedores</h1>

      {/* Formulario */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '24px', marginBottom: '28px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>{editing ? 'Editar plan' : 'Nuevo plan'}</div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <Campo label="Nombre *">
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Ej: Premium" style={inputStyle} />
            </Campo>
            <Campo label="Etiqueta (badge)">
              <input value={form.badgeLabel} onChange={e => set('badgeLabel', e.target.value)} placeholder="Ej: Pro" style={inputStyle} />
            </Campo>
            <Campo label="Precio (dejar vacío = gratis)">
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" style={{ ...inputStyle, flex: 1 }} />
                <select value={form.currency} onChange={e => set('currency', e.target.value)} style={{ ...inputStyle, width: '80px' }}>
                  <option>USD</option><option>EUR</option><option>VES</option>
                </select>
              </div>
            </Campo>
            <Campo label="Duración (días)">
              <input type="number" min="1" value={form.durationDays} onChange={e => set('durationDays', e.target.value)} style={inputStyle} />
            </Campo>
            <Campo label="Máx. productos">
              <input type="number" min="1" value={form.maxProducts} onChange={e => set('maxProducts', e.target.value)} style={inputStyle} />
            </Campo>
            <Campo label="Descripción">
              <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción breve" style={inputStyle} />
            </Campo>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
              Plan destacado
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
              Activo
            </label>
          </div>
          {msg && <div style={{ fontSize: '13px', color: msg.includes('Error') ? '#dc2626' : '#16a34a', marginBottom: '12px' }}>{msg}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ background: '#111', color: 'white', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
              {loading ? 'Guardando…' : editing ? 'Actualizar' : 'Crear plan'}
            </button>
            {editing && <button type="button" onClick={cancelEdit} style={{ background: 'transparent', color: '#888', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', border: '1px solid #eee', cursor: 'pointer' }}>Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Listado */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
        {planes.length === 0
          ? <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>No hay planes todavía.</div>
          : planes.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f5f5f5' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{p.name}</span>
                  {p.badgeLabel && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb' }}>{p.badgeLabel}</span>}
                  {p.isFeatured && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#fef9c3', color: '#854d0e' }}>Destacado</span>}
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: p.active ? '#dcfce7' : '#f5f5f5', color: p.active ? '#16a34a' : '#888', cursor: 'pointer' }} onClick={() => toggleActive(p)}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '3px' }}>
                  {p.price ? `${p.price} ${p.currency}` : 'Gratis'} · {p.durationDays} días · {p.maxProducts} productos · {p._count?.suppliers ?? 0} proveedores
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => startEdit(p)} style={{ fontSize: '13px', color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleDelete(p.id, p.name)} style={{ fontSize: '13px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar</button>
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
