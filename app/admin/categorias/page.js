'use client'

import { useState, useEffect } from 'react'

const TIPOS = [
  { value: 'both',     label: 'Artículos y Proveedores' },
  { value: 'article',  label: 'Solo Artículos' },
  { value: 'supplier', label: 'Solo Proveedores' },
]

const COLORES = [
  '#378ADD', '#1D9E75', '#888780', '#BA7517',
  '#D85A30', '#7F77DD', '#EC4899', '#059669',
  '#2563EB', '#DC2626', '#16A34A', '#92400E',
]

const empty = { name: '', slug: '', type: 'both', color: '#378ADD' }

export default function CategoriasPage() {
  const [cats, setCats]       = useState([])
  const [form, setForm]       = useState(empty)
  const [editing, setEditing] = useState(null) // id being edited
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  async function load() {
    const res = await fetch('/api/admin/categorias')
    const data = await res.json()
    setCats(data)
  }

  useEffect(() => { load() }, [])

  function slugify(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleName(e) {
    const name = e.target.value
    setForm(f => ({ ...f, name, slug: editing ? f.slug : slugify(name) }))
  }

  function startEdit(cat) {
    setEditing(cat.id)
    setForm({ name: cat.name, slug: cat.slug, type: cat.type, color: cat.color || '#378ADD' })
    setMsg('')
  }

  function cancelEdit() {
    setEditing(null)
    setForm(empty)
    setMsg('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.slug) return
    setLoading(true)
    try {
      const url    = editing ? `/api/admin/categorias/${editing}` : '/api/admin/categorias'
      const method = editing ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Error') }
      setMsg(editing ? 'Categoría actualizada.' : 'Categoría creada.')
      cancelEdit()
      load()
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`¿Eliminar la categoría "${name}"? Esta acción no se puede deshacer.`)) return
    const res = await fetch(`/api/admin/categorias/${id}`, { method: 'DELETE' })
    if (res.ok) { setMsg('Categoría eliminada.'); load() }
    else { const d = await res.json(); setMsg(d.error || 'Error al eliminar') }
  }

  const tipoLabel = (t) => TIPOS.find(x => x.value === t)?.label ?? t

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Categorías</h1>

      {/* Formulario */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '24px', marginBottom: '28px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
          {editing ? 'Editar categoría' : 'Nueva categoría'}
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <Campo label="Nombre *">
              <input value={form.name} onChange={handleName} required placeholder="Ej: Electrónica"
                style={inputStyle} />
            </Campo>
            <Campo label="Slug *">
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required
                placeholder="electronica" style={inputStyle} />
            </Campo>
            <Campo label="Aplica a">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Campo>
            <Campo label="Color">
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {COLORES.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, border: form.color === c ? '3px solid #111' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
                ))}
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{ width: '28px', height: '28px', border: 'none', cursor: 'pointer', padding: 0, background: 'none' }} />
              </div>
            </Campo>
          </div>
          {msg && <div style={{ fontSize: '13px', color: msg.includes('Error') || msg.includes('error') ? '#dc2626' : '#16a34a', marginBottom: '12px' }}>{msg}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading}
              style={{ background: '#111', color: 'white', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
              {loading ? 'Guardando…' : editing ? 'Actualizar' : 'Crear categoría'}
            </button>
            {editing && (
              <button type="button" onClick={cancelEdit}
                style={{ background: 'transparent', color: '#888', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', border: '1px solid #eee', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listado */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
        {cats.length === 0
          ? <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>No hay categorías todavía.</div>
          : cats.map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color || '#ccc', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{cat.name}</div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>
                    {cat.slug} · {tipoLabel(cat.type)} · {(cat._count?.articles ?? 0) + (cat._count?.suppliers ?? 0)} usos
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => startEdit(cat)}
                  style={{ fontSize: '13px', color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleDelete(cat.id, cat.name)}
                  style={{ fontSize: '13px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar</button>
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
