'use client'

import { useState, useEffect } from 'react'

const FILTROS = ['todos', 'new', 'read', 'attended']
const labelFiltro = { todos: 'Todos', new: 'Nuevos', read: 'Leídos', attended: 'Atendidos' }
const statusMap = {
  new:      { label: 'Nuevo',    color: '#2563eb', bg: '#eff6ff' },
  read:     { label: 'Leído',    color: '#888',    bg: '#f5f5f5' },
  attended: { label: 'Atendido', color: '#16a34a', bg: '#dcfce7' },
}

export default function ContactosPage() {
  const [items, setItems]   = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [open, setOpen]     = useState(null) // id del mensaje expandido
  const [msg, setMsg]       = useState('')

  async function load() {
    const res = await fetch('/api/admin/contactos')
    const data = await res.json()
    setItems(data)
  }

  useEffect(() => { load() }, [])

  async function setStatus(id, status) {
    const res = await fetch(`/api/admin/contactos/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { setMsg(''); load() }
    else setMsg('Error al actualizar')
  }

  function toggleOpen(id) {
    setOpen(prev => prev === id ? null : id)
    const item = items.find(i => i.id === id)
    if (item && item.status === 'new') setStatus(id, 'read')
  }

  const visible = filtro === 'todos' ? items : items.filter(i => i.status === filtro)
  const counts  = FILTROS.reduce((acc, f) => ({ ...acc, [f]: f === 'todos' ? items.length : items.filter(i => i.status === f).length }), {})

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '4px' }}>Mensajes de contacto</h1>
        <p style={{ fontSize: '13px', color: '#888' }}>Solicitudes recibidas a través del formulario público.</p>
      </div>

      {msg && <div style={{ fontSize: '13px', color: '#dc2626', marginBottom: '12px' }}>{msg}</div>}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {FILTROS.map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontWeight: filtro === f ? '600' : '400', background: filtro === f ? '#111' : 'white', color: filtro === f ? 'white' : '#555', borderColor: filtro === f ? '#111' : '#e5e5e5' }}>
            {labelFiltro[f]} {counts[f] > 0 && `(${counts[f]})`}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
        {visible.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>No hay mensajes en este filtro.</div>
        ) : visible.map(item => {
          const s = statusMap[item.status] ?? statusMap.new
          const isOpen = open === item.id
          return (
            <div key={item.id} style={{ borderBottom: '1px solid #f5f5f5', background: item.status === 'new' ? '#fafbff' : 'white' }}>
              {/* Fila resumen */}
              <div onClick={() => toggleOpen(item.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>{item.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: item.status === 'new' ? '600' : '500' }}>{item.name}</span>
                      {item.company && <span style={{ fontSize: '12px', color: '#888' }}>· {item.company}</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.message}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: '#aaa' }}>
                    {new Date(item.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500', background: s.bg, color: s.color }}>{s.label}</span>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Detalle expandido */}
              {isOpen && (
                <div style={{ padding: '0 20px 20px 70px', borderTop: '1px solid #f5f5f5' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', marginTop: '16px' }}>
                    <InfoField label="Email"><a href={`mailto:${item.email}`} style={{ color: '#2563eb' }}>{item.email}</a></InfoField>
                    {item.company && <InfoField label="Empresa">{item.company}</InfoField>}
                    <InfoField label="Tipo">{item.type}</InfoField>
                    <InfoField label="Fecha">{new Date(item.createdAt).toLocaleString('es-VE')}</InfoField>
                  </div>
                  <InfoField label="Mensaje">
                    <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.message}</p>
                  </InfoField>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    {item.status !== 'attended' && (
                      <button onClick={() => setStatus(item.id, 'attended')}
                        style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid #16a34a', color: '#16a34a', background: 'white', cursor: 'pointer', fontWeight: '500' }}>
                        Marcar como atendido
                      </button>
                    )}
                    {item.status === 'attended' && (
                      <button onClick={() => setStatus(item.id, 'new')}
                        style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid #e5e5e5', color: '#888', background: 'white', cursor: 'pointer' }}>
                        Marcar como nuevo
                      </button>
                    )}
                    <a href={`mailto:${item.email}?subject=Re: Tu mensaje en DUBOIS`}
                      style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: '1px solid #2563eb', color: '#2563eb', background: 'white', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' }}>
                      Responder por email
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#333' }}>{children}</div>
    </div>
  )
}
