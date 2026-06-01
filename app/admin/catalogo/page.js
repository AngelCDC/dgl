'use client'

import { useState, useEffect, useRef } from 'react'

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
      params.set('facets', '1')
      const r = await fetch(`/api/admin/catalogo?${params}`)
      const d = await r.json()
      setResult(d)

      // Actualizar opciones de filtros desde facets
      if (d.facets) {
        setRubros(mergeWithCurrent(d.facets.rubros.map(f => f.rubro).filter(Boolean), rubro))
        setProveedores(mergeWithCurrent(d.facets.proveedores.map(f => f.proveedor), proveedor))
        setCategorias(mergeWithCurrent(d.facets.categorias.map(f => f.categoria).filter(Boolean), categoria))
        setSubcategorias(mergeWithCurrent(d.facets.subcategorias.map(f => f.subcategoria).filter(Boolean), subcategoria))
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  // Combina las opciones del facet con el valor actualmente seleccionado
  function mergeWithCurrent(opts, current) {
    if (!current) return opts
    return opts.includes(current) ? opts : [current, ...opts]
  }

  function reset() {
    setQuery(''); setRubro(''); setProveedor(''); setCategoria(''); setSubcategoria(''); setPage(1)
  }

  const hayFiltros = query || rubro || proveedor || categoria || subcategoria

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '28px 32px' }}>

      {/* ── Cabecera ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111', marginBottom: '4px', letterSpacing: '-0.01em' }}>
            Catálogo de Productos
          </h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            {stats
              ? `${stats.total.toLocaleString()} productos · ${(stats.totalVariantes ?? 0).toLocaleString()} variantes · ${stats.porProveedor.length} proveedores · ${stats.porRubro.length} rubros`
              : 'Base de datos de productos ofertados por proveedores con sus variantes'}
          </p>
        </div>
        <button
          onClick={() => setImportUI(v => !v)}
          style={{
            height: '36px',
            padding: '0 16px',
            background: importUI ? '#f4f4f5' : '#111',
            color: importUI ? '#555' : 'white',
            border: importUI ? '1px solid #e0e0e0' : 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          {importUI ? '✕ Cerrar importador' : '⬆ Importar Excel'}
        </button>
      </div>

      {/* ── Importador ── */}
      {importUI && (
        <ImportPanel onDone={() => { setImportUI(false); fetchStats(); search() }} />
      )}

      {/* ── Stats ── */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <StatCard
            label="Productos"
            value={stats.total.toLocaleString()}
            color="#0d9488"
            icon="📦"
          />
          <StatCard
            label="Variantes"
            value={(stats.totalVariantes ?? 0).toLocaleString()}
            color="#f59e0b"
            icon="🔀"
          />
          <StatCard
            label="Rubros"
            value={stats.porRubro.length}
            color="#7c3aed"
            icon="🏷"
          />
          <StatCard
            label="Categorías"
            value={stats.porCategoria.length}
            color="#2563eb"
            icon="📂"
          />
          <StatCard
            label="Proveedores"
            value={stats.porProveedor.length}
            color="#0891b2"
            icon="🏢"
          />
          {stats.porProveedor[0] && (
            <StatCard
              label="Mayor catálogo"
              value={stats.porProveedor[0]._count.id}
              sub={stats.porProveedor[0].proveedor.split(' ').slice(0, 2).join(' ')}
              color="#64748b"
              icon="⭐"
            />
          )}
        </div>
      )}

      {/* ── Búsqueda + filtros ── */}
      <div style={{
        background: 'white',
        border: '1px solid #e8e8e8',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        {/* Search input row */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none', color: '#aaa',
            }}>🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre, código de variante, material, descripción…"
              style={{
                width: '100%',
                height: '42px',
                padding: '0 40px 0 42px',
                fontSize: '14px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = 'white'; }}
              onBlur={e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.background = '#fafafa'; }}
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', color: '#aaa', padding: '0',
                }}
              >✕</button>
            )}
          </div>
        </div>

        {/* Filter selects row */}
        <div style={{ padding: '14px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', background: '#fafbfc' }}>
          {rubros.length > 0 && (
            <FilterSelect
              label="Rubro"
              value={rubro}
              onChange={e => setRubro(e.target.value)}
              options={rubros.map(r => ({ value: r, label: r }))}
              placeholder="Todos los rubros"
            />
          )}
          {categorias.length > 0 && (
            <FilterSelect
              label="Categoría"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              options={categorias.map(c => ({ value: c, label: c }))}
              placeholder="Todas"
            />
          )}
          {subcategorias.length > 0 && (
            <FilterSelect
              label="Subcategoría"
              value={subcategoria}
              onChange={e => setSubcategoria(e.target.value)}
              options={subcategorias.map(s => ({ value: s, label: s }))}
              placeholder="Todas"
            />
          )}
          {proveedores.length > 0 && (
            <FilterSelect
              label="Proveedor"
              value={proveedor}
              onChange={e => setProveedor(e.target.value)}
              options={proveedores.map(p => ({ value: p, label: p }))}
              placeholder="Todos"
              minWidth="190px"
            />
          )}
          {hayFiltros && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'transparent', letterSpacing: '0.06em', userSelect: 'none' }}>_</span>
              <button
                onClick={reset}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  background: 'white',
                  fontSize: '12px',
                  color: '#888',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ✕ Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Results counter */}
        {result && (
          <div style={{
            padding: '10px 20px',
            fontSize: '12px',
            color: '#888',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            {loading ? (
              <span style={{ color: '#aaa' }}>Buscando…</span>
            ) : result.total === 0 ? (
              <span style={{ color: '#ef4444', fontWeight: '600' }}>Sin resultados para los criterios aplicados</span>
            ) : (
              <>
                <strong style={{ color: '#111', fontSize: '13px' }}>{result.total.toLocaleString()}</strong>
                <span>producto{result.total !== 1 ? 's' : ''}</span>
                {hayFiltros && <span style={{ color: '#ccc' }}>— filtrado</span>}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Tabla de resultados ── */}
      {result && result.productos.length > 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0',
              fontSize: '13px',
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <Th>Producto</Th>
                  <Th>Rubro · Categoría</Th>
                  <Th>Material</Th>
                  <Th>Variantes</Th>
                  <Th>Proveedor</Th>
                </tr>
              </thead>
              <tbody>
                {result.productos.map(p => (
                  <ProductRow
                    key={p.id}
                    producto={p}
                    onDetail={() => setDetail(p)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {result.pages > 1 && (
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
              <PaginBtn
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ← Anterior
              </PaginBtn>
              {Array.from({ length: Math.min(result.pages, 7) }, (_, i) => {
                const pg = result.pages <= 7
                  ? i + 1
                  : page <= 4
                    ? i + 1
                    : page >= result.pages - 3
                      ? result.pages - 6 + i
                      : page - 3 + i
                return (
                  <PaginBtn
                    key={pg}
                    onClick={() => setPage(pg)}
                    active={pg === page}
                  >
                    {pg}
                  </PaginBtn>
                )
              })}
              <PaginBtn
                onClick={() => setPage(p => Math.min(result.pages, p + 1))}
                disabled={page >= result.pages}
              >
                Siguiente →
              </PaginBtn>
            </div>
          )}
        </div>
      )}

      {/* ── Sin resultados ── */}
      {result && result.productos.length === 0 && !loading && (
        <div style={{
          background: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '12px',
          padding: '64px 32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.4 }}>🔍</div>
          <div style={{ fontWeight: '600', fontSize: '16px', color: '#111', marginBottom: '8px' }}>
            Sin resultados
          </div>
          <p style={{ fontSize: '13px', color: '#9ca3af', maxWidth: '360px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            No hay productos que coincidan con{' '}
            <strong style={{ color: '#555' }}>"{query || 'los filtros aplicados'}"</strong>.
            Prueba con otro nombre, código o rubro.
          </p>
          {hayFiltros && (
            <button
              onClick={reset}
              style={{
                height: '36px',
                padding: '0 18px',
                background: '#111',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Limpiar filtros y ver todo
            </button>
          )}
        </div>
      )}

      {/* ── Catálogo vacío ── */}
      {!result && !loading && stats?.total === 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #e8e8e8',
          borderRadius: '12px',
          padding: '64px 32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.4 }}>📦</div>
          <div style={{ fontWeight: '600', fontSize: '16px', color: '#111', marginBottom: '8px' }}>
            El catálogo está vacío
          </div>
          <p style={{ fontSize: '13px', color: '#9ca3af', maxWidth: '320px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            Importa tu primer archivo Excel con hojas "Productos" y "Variantes" para empezar.
          </p>
          <button
            onClick={() => setImportUI(true)}
            style={{
              height: '36px',
              padding: '0 18px',
              background: '#111',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ⬆ Importar Excel
          </button>
        </div>
      )}

      {/* ── Modal detalle ── */}
      {detail && <DetailModal producto={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

// ─── Fila de producto (clic → abre card de detalle) ──────────────────────────
function ProductRow({ producto: p, onDetail }) {
  const numVariantes = p.variantes?.length ?? 0

  return (
    <tr
      onClick={onDetail}
      style={{
        borderBottom: '1px solid #f3f4f6',
        cursor: 'pointer',
        background: 'white',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
    >
      {/* Nombre + descripción */}
      <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
        <div style={{ fontWeight: '500', color: '#111', marginBottom: '2px' }}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '280px', verticalAlign: 'middle' }}>
            {p.nombre}
          </span>
        </div>
        {p.descripcion && (
          <div style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
            {p.descripcion}
          </div>
        )}
      </td>

      {/* Rubro · Categoría */}
      <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
        {p.rubro && (
          <span style={{
            display: 'inline-block',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '20px',
            background: '#eff6ff',
            color: '#1d4ed8',
            fontWeight: '600',
            letterSpacing: '0.02em',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
          }}>
            {p.rubro}
          </span>
        )}
        {p.categoria && (
          <div style={{ fontSize: '12px', color: '#555', marginBottom: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.categoria}</div>
        )}
        {p.subcategoria && (
          <div style={{ fontSize: '11px', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.subcategoria}</div>
        )}
      </td>

      {/* Material */}
      <td style={{ padding: '12px 16px', maxWidth: '140px' }}>
        {p.material
          ? <span style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{p.material}</span>
          : <span style={{ color: '#ddd' }}>—</span>}
      </td>

      {/* Variantes badge */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        {numVariantes > 0 ? (
          <span
            onClick={e => { e.stopPropagation(); onDetail() }}
            title="Ver detalle completo"
            style={{
              display: 'inline-block',
              fontSize: '12px',
              padding: '3px 10px',
              borderRadius: '20px',
              background: '#fef3c7',
              color: '#92400e',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fde68a'}
            onMouseLeave={e => e.currentTarget.style.background = '#fef3c7'}
          >
            +{numVariantes} variante{numVariantes !== 1 ? 's' : ''}
          </span>
        ) : (
          <span style={{ color: '#ddd', fontSize: '12px' }}>Sin variantes</span>
        )}
      </td>

      {/* Proveedor */}
      <td style={{ padding: '12px 16px', maxWidth: '180px' }}>
        <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.proveedor}
        </div>
      </td>
    </tr>
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
      setStatus({ ok: true, msg: `✅ ${d.totalProductos.toLocaleString()} productos y ${d.totalVariantes.toLocaleString()} variantes importados (modo: ${d.modo}).` })
      setTimeout(onDone, 2500)
    } catch (e) {
      setStatus({ ok: false, msg: e.message })
    }
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e8e8e8',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Dark header bar */}
      <div style={{
        background: '#0b1628',
        color: 'white',
        padding: '14px 20px',
        borderRadius: '10px 10px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ fontSize: '16px' }}>📥</span>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>Importar archivo Excel</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            El archivo debe tener 2 hojas: <strong>Productos</strong> (Proveedor · Nombre_Producto · Rubro · Categoría · Subcategoría · Descripción · Material) y <strong>Variantes</strong> (ID_Producto · Código · Medidas · Unidad · Precio)
          </div>
        </div>
      </div>

      {/* Form body */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Archivo (.xlsx)
            </div>
            <button
              onClick={() => fileRef.current.click()}
              style={{
                height: '36px',
                padding: '0 14px',
                border: `1px solid ${file ? '#86efac' : '#e0e0e0'}`,
                borderRadius: '8px',
                background: file ? '#f0fdf4' : 'white',
                color: file ? '#166534' : '#555',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {file ? `📄 ${file.name}` : 'Seleccionar archivo…'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={e => setFile(e.target.files[0] || null)}
            />
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Modo
            </div>
            <select
              value={modo}
              onChange={e => setModo(e.target.value)}
              style={{
                height: '36px',
                padding: '0 12px',
                fontSize: '13px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontFamily: 'inherit',
                background: 'white',
                color: '#111',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="agregar">Agregar (mantiene existentes)</option>
              <option value="reemplazar">Reemplazar (borra todo primero)</option>
            </select>
          </div>

          <button
            onClick={handleImport}
            disabled={!file || status === 'loading'}
            style={{
              height: '36px',
              padding: '0 18px',
              background: '#111',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: !file || status === 'loading' ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: !file || status === 'loading' ? 0.5 : 1,
            }}
          >
            {status === 'loading' ? 'Importando…' : 'Importar ahora'}
          </button>
        </div>

        {status && status !== 'loading' && (
          <div style={{
            marginTop: '14px',
            fontSize: '13px',
            color: status.ok ? '#166534' : '#dc2626',
            background: status.ok ? '#f0fdf4' : '#fef2f2',
            padding: '10px 14px',
            borderRadius: '8px',
            border: `1px solid ${status.ok ? '#86efac' : '#fca5a5'}`,
          }}>
            {status.msg}
          </div>
        )}
      </div>
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

  const numVariantes = p.variantes?.length ?? 0

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
        }}
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

        {/* Campos del producto */}
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: '1px solid #f5f5f5' }}>
          <Field label="Material" value={p.material} />
          {p.archivoPdf && <Field label="Archivo PDF" value={p.archivoPdf} />}
        </div>

        {p.descripcion && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Descripción</div>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.65', margin: 0 }}>{p.descripcion}</p>
          </div>
        )}

        {/* Variantes */}
        <div style={{ padding: '16px 24px' }}>
          <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
            Variantes ({numVariantes})
          </div>
          {numVariantes > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={detailThStyle}>#</th>
                    <th style={detailThStyle}>Código</th>
                    <th style={detailThStyle}>Medidas</th>
                    <th style={detailThStyle}>Unidad</th>
                    <th style={detailThStyle}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {p.variantes.map((v, i) => (
                    <tr key={v.id} style={{ borderBottom: i < numVariantes - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '8px 12px', color: '#aaa', fontSize: '11px' }}>{i + 1}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '12px', color: '#111' }}>{v.codigo || '—'}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#555', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.medidas || '—'}</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: '#555' }}>{v.unidad || '—'}</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: '#111', fontWeight: '500' }}>{v.precio || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Este producto no tiene variantes registradas.</p>
          )}
        </div>

        <div style={{ padding: '12px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              height: '34px',
              padding: '0 18px',
              background: '#111',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

const detailThStyle = {
  padding: '7px 12px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: '600',
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #e5e7eb',
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function Th({ children }) {
  return (
    <th style={{
      padding: '10px 16px',
      textAlign: 'left',
      fontSize: '11px',
      fontWeight: '600',
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      whiteSpace: 'nowrap',
      borderBottom: '1px solid #e5e7eb',
      background: '#f8f9fa',
    }}>
      {children}
    </th>
  )
}

function StatCard({ label, value, sub, color, icon }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        border: '1px solid #e8e8e8',
        borderRadius: '10px',
        padding: '16px 18px',
        borderTop: hovered ? `3px solid ${color}` : '3px solid transparent',
        transition: 'border-top-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.07)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#111',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: '6px',
          }}>
            {value}
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>{label}</div>
          {sub && <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
        </div>
        <span style={{
          fontSize: '20px',
          opacity: hovered ? 1 : 0.4,
          transition: 'opacity 0.2s',
          flexShrink: 0,
        }}>{icon}</span>
      </div>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options, placeholder, minWidth = '150px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{
        fontSize: '10px',
        fontWeight: '700',
        color: '#aaa',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        style={{
          height: '34px',
          padding: '0 10px',
          fontSize: '13px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          fontFamily: 'inherit',
          background: 'white',
          color: '#111',
          minWidth,
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function PaginBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: '32px',
        minWidth: '32px',
        padding: '0 10px',
        border: active ? '1.5px solid #2563eb' : '1px solid #e0e0e0',
        borderRadius: '8px',
        background: active ? '#eff6ff' : 'white',
        color: active ? '#2563eb' : disabled ? '#ccc' : '#555',
        fontSize: '13px',
        fontWeight: active ? '600' : '400',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        transition: 'border-color 0.15s, background 0.15s, color 0.15s',
      }}
    >
      {children}
    </button>
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
