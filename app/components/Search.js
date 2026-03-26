'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ articulos: [], proveedores: [] })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults({ articulos: [], proveedores: [] }); setOpen(false); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setOpen(true)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const total = results.articulos.length + results.proveedores.length

  function handleSelect(href) {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="navbar-search" style={{ cursor: 'text', minWidth: '200px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a6478" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar..."
          style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-dm)', fontSize: '13px', color: 'var(--ink)', width: '100%' }}
        />
        {loading && (
          <div style={{ width: '12px', height: '12px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
        )}
      </div>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '380px', background: '#fff', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', zIndex: 1000 }}>

          {total === 0 && !loading && (
            <div style={{ padding: '20px', fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)', textAlign: 'center' }}>
              Sin resultados para "{query}"
            </div>
          )}

          {results.articulos.length > 0 && (
            <div>
              <div style={{ padding: '10px 16px 6px', fontFamily: 'var(--font-dm)', fontSize: '10px', fontWeight: '500', color: 'var(--steel)', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid var(--bg)' }}>
                Artículos
              </div>
              {results.articulos.map(a => (
                <button key={a.slug} onClick={() => handleSelect(`/articulos/${a.slug}`)} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--bg)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ width: '32px', height: '32px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '10px', color: '#fff' }}>ART</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600', color: 'var(--ink)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                    {a.category && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: a.category.color ?? 'var(--accent)' }}>{a.category.name}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.proveedores.length > 0 && (
            <div>
              <div style={{ padding: '10px 16px 6px', fontFamily: 'var(--font-dm)', fontSize: '10px', fontWeight: '500', color: 'var(--steel)', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid var(--bg)' }}>
                Proveedores
              </div>
              {results.proveedores.map(p => (
                <button key={p.slug} onClick={() => handleSelect(`/proveedores/${p.slug}`)} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--bg)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ width: '32px', height: '32px', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {p.logoUrl
                      ? <img src={p.logoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '12px', color: '#fff' }}>{p.name.charAt(0)}</span>
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      {p.verified && <span style={{ fontFamily: 'var(--font-dm)', fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', flexShrink: 0 }}>✓</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>
                      {p.country}{p.city ? `, ${p.city}` : ''}{p.category ? ` · ${p.category.name}` : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {total > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => handleSelect(`/articulos?q=${query}`)} style={{ fontFamily: 'var(--font-dm)', fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Ver todos los resultados →
              </button>
            </div>
          )}

        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}