'use client'

import { useState, useEffect, useRef } from 'react'

// ─── Constantes de estilo ─────────────────────────────────────────────────────
const S = {
  page:    { padding: '32px' },
  title:   { fontSize: '22px', fontWeight: '600', marginBottom: '4px' },
  sub:     { fontSize: '13px', color: '#888', marginBottom: '24px' },
  card:    { background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' },
  label:   { fontSize: '11px', color: '#888', marginBottom: '4px' },
  stat:    { fontSize: '28px', fontWeight: '700', color: '#111', letterSpacing: '-0.02em' },
  statSub: { fontSize: '12px', color: '#888', marginTop: '2px' },
  btn: (color = '#111', bg = 'white') => ({
    padding: '7px 14px', fontSize: '13px',
    border: `1px solid ${bg !== 'white' ? color : (color === 'white' ? '#ddd' : color)}`,
    borderRadius: '8px',
    background: bg !== 'white' ? color : 'white',
    color: bg !== 'white' ? 'white' : color,
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  }),
  tag: (bg = '#eee', color = '#555') => ({
    display: 'inline-block', fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
    background: bg, color, fontWeight: '500', whiteSpace: 'nowrap',
  }),
  select: {
    padding: '10px 12px', fontSize: '13px', border: '1px solid #ddd',
    borderRadius: '8px', fontFamily: 'inherit', background: 'white', minWidth: '150px',
  },
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function CatalogoPage() {
  const [query,        setQuery]        = useState('')
  const [rubro,        setRubro]        = useState('')
  const [proveedor,    setProveedor]    = useState('')
  const [categoria,    setCategoria]    = useState('')
  const [subcategoria, setSubcategoria] = useState('')
  const [page,         setPage]         = useState(1)

  const [result,   setResult]   = useState(null)
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [importUI, setImportUI] = useState(false)
  const [detail,   setDetail]   = useState(null)

  // Listas para selects — cascada: rubro → categoría → subcategoría
  const [rubros,        setRubros]        = useState([])
  const [proveedores,   setProveedores]   = useState([])
  const [categorias,    setCategorias]    = useState([])
  const [subcategorias, setSubcategorias] = useState([])

  const debounceRef = useRef(null)

  // ── Stats iniciales ─────────────────────────────────────────────────────────
  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    try {
      const r = await fetch('/api/admin/catalogo/importar')
      if (!r.ok) return
      const d = await r.json()
      setStats(d)
      setRubros(d.porRubro.map(r => r.rubro).filter(Boolean))
      setProveedores(d.porProveedor.map(p => p.proveedor))
      setCategorias(d.porCategoria.map(c => c.categoria).filter(Boolean))
    } catch { /* ignore */ }
  }

  // ── Debounce de búsqueda ────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(), 300)
  }, [query, rubro, proveedor, categoria, subcategoria, page])

  // Reset page cuando cambia cualquier filtro salvo page
  useEffect(() => { setPage(1) }, [query, rubro, proveedor, categoria, subcategoria])

  // Cascada rubro → categorías disponibles
  useEffect(() => {
    if (!rubro) { setCategorias(stats?.porCategoria.map(c => c.categoria).filter(Boolean) ?? []); return }
    fetch(`/api/admin/catalogo?rubro=${encodeURIComponent(rubro)}&limit=2000`)
      .then(r => r.json())
      .then(d => {
        const cats = [...new Set(d.productos.map(p => p.categoria).filter(Boolean))].sort()
        setCategorias(cats)
        setCategoria('')
        setSubcategoria('')
      })
      .catch(() => {})
  }, [rubro])

  // Cascada categoria → subcategorías disponibles
  useEffect(() => {
    if (!categoria) { setSubcategorias([]); setSubcategoria(''); return }
    const params = new URLSearchParams()
    if (rubro) params.set('rubro', rubro)
    params.set('categoria', categoria)
    params.set('limit', '2000')
    fetch(`/api/admin/catalogo?${params}`)
      .then(r => r.json())
      .then(d => {
        const subs = [...new Set(d.productos.map(p => p.subcategoria).filter(Boolean))].sort()
        setSubcategorias(subs)
        setSubcategoria('')
      })
      .catch(() => {})
  }, [categoria, rubro])

  async function search() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query)        params.set('q',            query)
      if (rubro)        params.set('rubro',        rubro)
      if (proveedor)    params.set('proveedor',    proveedor)
      if (categoria)    params.set('categoria',    categoria)
      if (subcategoria) params.set('subcategoria', subcategoria)
      params.set('page',  String(page))
      params.set('limit', '30')
      const r = await fetch(`/api/admin/catalogo?${params}`)
      const d = await r.json()
      setResult(d)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  function reset() {
    setQuery(''); setRubro(''); setProveedor(''); setCategoria(''); setSubcategoria(''); setPage(1)
  }

  const hayFiltros = query || rubro || proveedor || categoria || subcategoria

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>

      {/* Cabecera ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={S.title}>Catálogo de Productos</h1>
          <p style={S.sub}>
            {stats
              ? `${stats.total.toLocaleString()} productos · ${stats.porProveedor.length} proveedores · ${stats.porRubro.length} rubros · ${stats.porCategoria.length} categorías`
              : 'Base de datos personal de productos ofertados por proveedores'}
          </p>
        </div>
        <button style={S.btn('#111', '#111')} onClick={() => setImportUI(v => !v)}>
          {importUI ? '✕ Cerrar importador' : '⬆ Importar Excel'}
        </button>
      </div>

      {/* Importador ───────────────────────────────────────────────────────── */}
      {importUI && (
        <ImportPanel onDone={() => { setImportUI(false); fetchStats(); search() }} />
      )}

      {/* Stats ────────────────────────────────────────────────────────────── */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <StatCard label="Productos totales"  value={stats.total.toLocaleString()} />
          <StatCard label="Rubros"             value={stats.porRubro.length} />
          <StatCard label="Categorías"         value={stats.porCategoria.length} />
          <StatCard label="Proveedores"        value={stats.porProveedor.length} />
          {stats.porProveedor[0] && (
            <StatCard
              label="Mayor catálogo"
              value={stats.porProveedor[0]._count.id}
              sub={stats.porProveedor[0].proveedor.split(' ').slice(0, 2).join(' ')}
            />
          )}
        </div>
      )}

      {/* Búsqueda + filtros ───────────────────────────────────────────────── */}
      <div style={{ ...S.card, marginBottom: '20px', padding: '20px' }}>

        {/* Fila 1: input libre */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, código, material, descripción…"
            style={{ width: '100%', padding: '11px 40px 11px 40px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'inherit', outline: 'none' }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#aaa' }}
            >✕</button>
          )}
        </div>

        {/* Fila 2: filtros en cascada — Rubro → Categoría → Subcategoría + Proveedor */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Rubro (nivel 1) */}
          {rubros.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Rubro</span>
              <select value={rubro} onChange={e => setRubro(e.target.value)} style={S.select}>
                <option value="">Todos los rubros</option>
                {rubros.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          {/* Categoría (nivel 2) */}
          {categorias.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Categoría</span>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} style={S.select}>
                <option value="">Todas</option>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Subcategoría (nivel 3) — solo si hay categoría seleccionada */}
          {subcategorias.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Subcategoría</span>
              <select value={subcategoria} onChange={e => setSubcategoria(e.target.value)} style={S.select}>
                <option value="">Todas</option>
                {subcategorias.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Proveedor */}
          {proveedores.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Proveedor</span>
              <select value={proveedor} onChange={e => setProveedor(e.target.value)} style={{ ...S.select, minWidth: '190px' }}>
                <option value="">Todos</option>
                {proveedores.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}

          {hayFiltros && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: 'transparent', letterSpacing: '0.06em' }}>_</span>
              <button onClick={reset} style={S.btn('#888')}>✕ Limpiar</button>
            </div>
          )}
        </div>

        {/* Contador de resultados */}
        {result && (
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#888', borderTop: '1px solid #f5f5f5', paddingTop: '12px' }}>
            {loading ? '⏳ Buscando…' : (
              result.total === 0
                ? <span style={{ color: '#ef4444', fontWeight: '600' }}>⚠ No se encontraron productos con esos criterios</span>
                : <>
                    <strong style={{ color: '#111', fontSize: '14px' }}>{result.total.toLocaleString()}</strong>
                    {' '}resultado{result.total !== 1 ? 's' : ''}
                    {hayFiltros && <span style={{ color: '#aaa' }}> — filtrado</span>}
                  </>
            )}
          </div>
        )}
      </div>

      {/* Tabla de resultados ──────────────────────────────────────────────── */}
      {result && result.productos.length > 0 && (
        <div style={S.card}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
                <Th>Producto</Th>
                <Th>Código</Th>
                <Th>Rubro · Categoría</Th>
                <Th>Material / Medidas</Th>
                <Th>Precio</Th>
                <Th>Proveedor</Th>
              </tr>
            </thead>
            <tbody>
              {result.productos.map(p => (
                <tr
                  key={p.id}
                  onClick={() => setDetail(p)}
                  style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  {/* Nombre + descripción */}
                  <td style={{ padding: '12px 16px', maxWidth: '260px' }}>
                    <div style={{ fontWeight: '500', color: '#111', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.nombre}
                    </div>
                    {p.descripcion && (
                      <div style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                        {p.descripcion}
                      </div>
                    )}
                  </td>

                  {/* Código */}
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    {p.codigo
                      ? <span style={S.tag('#f4f4f5', '#555')}>{p.codigo}</span>
                      : <span style={{ color: '#ddd' }}>—</span>}
                  </td>

                  {/* Rubro · Categoría · Subcategoría */}
                  <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                    {p.rubro && (
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {p.rubro}
                      </div>
                    )}
                    {p.categoria && (
                      <div style={{ fontSize: '12px', color: '#555', marginBottom: '1px' }}>{p.categoria}</div>
                    )}
                    {p.subcategoria && (
                      <div style={{ fontSize: '11px', color: '#aaa' }}>{p.subcategoria}</div>
                    )}
                  </td>

                  {/* Material / Medidas */}
                  <td style={{ padding: '12px 16px', maxWidth: '150px' }}>
                    {p.material && (
                      <div style={{ fontSize: '12px', color: '#555', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.material}</div>
                    )}
                    {p.medidas && (
                      <div style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace' }}>{p.medidas}</div>
                    )}
                  </td>

                  {/* Precio */}
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    {p.precio
                      ? <span style={S.tag('#f0fdf4', '#166534')}>{p.precio}</span>
                      : <span style={{ color: '#ddd' }}>—</span>}
                  </td>

                  {/* Proveedor */}
                  <td style={{ padding: '12px 16px', maxWidth: '160px' }}>
                    <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.proveedor}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {result.pages > 1 && (
            <div style={{ padding: '14px 20px', borderTop: '1px solid #eee', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={S.btn('#888')}>← Anterior</button>
              <span style={{ fontSize: '13px', color: '#888' }}>Pág. {page} de {result.pages}</span>
              <button onClick={() => setPage(p => Math.min(result.pages, p + 1))} disabled={page >= result.pages} style={S.btn('#888')}>Siguiente →</button>
            </div>
          )}
        </div>
      )}

      {/* Sin resultados ───────────────────────────────────────────────────── */}
      {result && result.productos.length === 0 && !loading && (
        <div style={{ ...S.card, padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px', color: '#ef4444' }}>
            Producto no encontrado en el catálogo
          </div>
          <p style={{ fontSize: '13px', color: '#888', maxWidth: '380px', margin: '0 auto' }}>
            No hay ningún producto que coincida con{' '}
            <strong>"{query || 'los filtros aplicados'}"</strong>.
            Prueba con otro nombre, código o rubro.
          </p>
          {hayFiltros && (
            <button onClick={reset} style={{ ...S.btn('#111', '#111'), marginTop: '16px' }}>
              Limpiar filtros y ver todo
            </button>
          )}
        </div>
      )}

      {/* Catálogo vacío ───────────────────────────────────────────────────── */}
      {!result && !loading && stats?.total === 0 && (
        <div style={{ ...S.card, padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
          <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>El catálogo está vacío</div>
          <p style={{ fontSize: '13px', color: '#888', maxWidth: '340px', margin: '0 auto 20px' }}>
            Importa tu primer archivo Excel para empezar a consultar productos.
          </p>
          <button onClick={() => setImportUI(true)} style={S.btn('#111', '#111')}>
            ⬆ Importar Excel
          </button>
        </div>
      )}

      {/* Modal detalle ────────────────────────────────────────────────────── */}
      {detail && <DetailModal producto={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

// ─── Panel de importación ─────────────────────────────────────────────────────
function ImportPanel({ onDone }) {
  const [file,   setFile]   = useState(null)
  const [modo,   setModo]   = useState('agregar')
  const [status, setStatus] = useState(null)
  const fileRef = useRef()

  async function handleImport() {
    if (!file) return
    setStatus('loading')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch(`/api/admin/catalogo/importar?modo=${modo}`, { method: 'POST', body: fd })
      const d = await r.json()
      if (!r.ok) { setStatus({ ok: false, msg: d.error ?? 'Error al importar' }); return }
      const ruboAviso = !d.tieneRubro ? ' · Este archivo no tenía columna Rubro — puedes añadirla para mejores filtros.' : ''
      setStatus({ ok: true, msg: `✅ ${d.insertados.toLocaleString()} productos importados (modo: ${d.modo}).${ruboAviso}` })
      setTimeout(onDone, 2200)
    } catch (e) {
      setStatus({ ok: false, msg: e.message })
    }
  }

  return (
    <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
      <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>📥 Importar archivo Excel</div>
      <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '14px' }}>
        Columnas reconocidas: <strong>Proveedor · Nombre_Producto · Rubro · Categoría · Subcategoría · Descripción · Código · Unidad · Precio · Material · Medidas</strong>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <div style={S.label}>Archivo (.xlsx)</div>
          <button
            onClick={() => fileRef.current.click()}
            style={{ ...S.btn('#111'), background: file ? '#f0fdf4' : 'white', borderColor: file ? '#86efac' : '#ddd' }}
          >
            {file ? `📄 ${file.name}` : 'Seleccionar archivo…'}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] || null)} />
        </div>

        <div>
          <div style={S.label}>Modo</div>
          <select
            value={modo}
            onChange={e => setModo(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '13px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'inherit', background: 'white' }}
          >
            <option value="agregar">Agregar (mantiene existentes)</option>
            <option value="reemplazar">Reemplazar (borra todo primero)</option>
          </select>
        </div>

        <button
          onClick={handleImport}
          disabled={!file || status === 'loading'}
          style={{ ...S.btn('white', '#111'), opacity: !file || status === 'loading' ? 0.5 : 1 }}
        >
          {status === 'loading' ? 'Importando…' : 'Importar ahora'}
        </button>
      </div>

      {status && status !== 'loading' && (
        <div style={{
          marginTop: '12px', fontSize: '13px',
          color: status.ok ? '#166534' : '#dc2626',
          background: status.ok ? '#f0fdf4' : '#fef2f2',
          padding: '10px 14px', borderRadius: '8px',
          border: `1px solid ${status.ok ? '#86efac' : '#fca5a5'}`,
        }}>
          {status.msg}
        </div>
      )}
    </div>
  )
}

// ─── Modal de detalle ─────────────────────────────────────────────────────────
function DetailModal({ producto: p, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '580px', maxHeight: '82vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#111', marginBottom: '4px' }}>{p.nombre}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{p.proveedor}</div>
          </div>
          <button onClick={onClose} style={{ border: '1px solid #eee', borderRadius: '6px', background: 'white', padding: '6px 10px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>✕</button>
        </div>

        {/* Jerarquía de clasificación */}
        {(p.rubro || p.categoria || p.subcategoria) && (
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {p.rubro && (
              <span style={{ fontSize: '11px', fontWeight: '700', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {p.rubro}
              </span>
            )}
            {p.rubro && p.categoria && <span style={{ color: '#ccc', fontSize: '12px' }}>›</span>}
            {p.categoria && (
              <span style={{ fontSize: '12px', color: '#555', fontWeight: '500' }}>{p.categoria}</span>
            )}
            {p.categoria && p.subcategoria && <span style={{ color: '#ccc', fontSize: '12px' }}>›</span>}
            {p.subcategoria && (
              <span style={{ fontSize: '12px', color: '#888' }}>{p.subcategoria}</span>
            )}
          </div>
        )}

        {/* Campos */}
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Código"      value={p.codigo}  mono />
          <Field label="Unidad"      value={p.unidad} />
          <Field label="Precio"      value={p.precio} />
          <Field label="Material"    value={p.material} />
          <Field label="Medidas"     value={p.medidas}  mono />
          {p.archivoPdf && <Field label="Archivo PDF" value={p.archivoPdf} />}
        </div>

        {p.descripcion && (
          <div style={{ padding: '0 24px 20px' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Descripción</div>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.65' }}>{p.descripcion}</p>
          </div>
        )}

        <div style={{ padding: '12px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={S.btn('#111', '#111')}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function Th({ children }) {
  return (
    <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '16px 20px' }}>
      <div style={S.label}>{label}</div>
      <div style={S.stat}>{value}</div>
      {sub && <div style={S.statSub}>{sub}</div>}
    </div>
  )
}

function Field({ label, value, mono }) {
  if (!value) return null
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#111', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-word' }}>{value}</div>
    </div>
  )
}
