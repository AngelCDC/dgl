'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, LabelList, PieChart, Pie, ScatterChart, Scatter,
} from 'recharts'

/* ─── Paleta de series (orden fijo, validada) ──────────────────────────────── */
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948']
const LS_KEY = 'inteligencia-proveedores-json'

/* ─── Utilidades ────────────────────────────────────────────────────────────── */
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null }
const fmtUSD = (v) => { const n = num(v); return n == null ? 'N/D' : '$' + Math.round(n).toLocaleString('en-US') }
const fmtNum = (v) => { const n = num(v); return n == null ? 'N/D' : Math.round(n).toLocaleString('en-US') }
const fmtPct = (v) => (v == null ? 'N/D' : Math.round(v) + '%')
const shortNombre = (s) => String(s || '').trim().split(/\s+/).slice(0, 2).join(' ')
const primerTermino = (t) => String(t || '').trim().split(/\s+/)[0] || '—'

const esTinta = (tipo) => /tinta|ink/i.test(String(tipo || ''))
const esImpresora = (tipo) => /impresora|printer|plotter/i.test(String(tipo || ''))

/* Clasifica cualquier producto en un bucket estable de tipo */
function bucketTipo(tipo, caracteristicas = []) {
  const t = String(tipo || '').toLowerCase()
  const c = (Array.isArray(caracteristicas) ? caracteristicas : []).map(x => String(x).toLowerCase()).join(' ')
  if (esTinta(t)) return 'Tintas'
  if (t.includes('dtf') || c.includes('dtf')) return 'DTF'
  if (t.includes('sublim')) return 'Sublimación'
  if (t.includes('cabezal')) return 'Cabezales'
  if (t.includes('eco') && (t.includes('solvent') || t.includes('solvente'))) return 'Eco-solvent'
  if (t.includes('uv')) return 'UV'
  if (t.includes('plotter')) return 'Plotter'
  if (esImpresora(t)) return 'Impresoras'
  return 'Otros'
}

/* ─── Pipeline de procesamiento (todo deriva del JSON en runtime) ──────────── */
function processData(data) {
  const proveedores = Array.isArray(data?.proveedores) ? data.proveedores : []
  const metadata = data?.metadata ?? {}
  const stats = data?.estadisticas ?? {}
  const comparativas = data?.comparativas ?? {}
  const fecha = data?.fecha_actualizacion ?? null
  const version = data?.version ?? null
  const sectores = Array.isArray(metadata.sectores_cubiertos) ? metadata.sectores_cubiertos : []

  // 1. Productos de impresora y de tinta con precio + distribuciones
  const impresorasConPrecio = []
  const tintasConPrecio = []
  const tiposDist = {}
  const cabezalesDist = {}

  for (const prov of proveedores) {
    const nombre = prov.nombre || 'Proveedor sin nombre'
    for (const p of Array.isArray(prov.productos) ? prov.productos : []) {
      const tipo = String(p.tipo ?? '')
      const bucket = bucketTipo(tipo, p.caracteristicas)
      tiposDist[bucket] = (tiposDist[bucket] || 0) + 1

      if (p.modelo_cabezal) {
        const key = String(p.modelo_cabezal).trim().toLowerCase().replace(/\s+/g, '')
        if (key) {
          if (!cabezalesDist[key]) cabezalesDist[key] = { label: String(p.modelo_cabezal).trim(), count: 0 }
          cabezalesDist[key].count++
        }
      }

      const precios = Array.isArray(p.precios) ? p.precios.filter(o => num(o.valor) != null) : []
      if (!precios.length) continue

      if (esImpresora(tipo)) {
        impresorasConPrecio.push({ proveedor: nombre, tipoBucket: bucket, producto: p, ofertas: precios })
      }
      if (esTinta(tipo)) {
        for (const o of precios) {
          tintasConPrecio.push({
            proveedor: nombre,
            tipoTinta: tipo,
            precio: num(o.valor),
            unidad: p.presentacion ?? p.unidad ?? null,
            termino: o.termino ?? null,
            nota: [o.tipo, p.modelo].filter(Boolean).join(' · '),
          })
        }
      }
    }
  }
  tintasConPrecio.sort((a, b) => a.precio - b.precio)

  // Ofertas planas de impresoras (fallbacks, resumen ejecutivo)
  const ofertasImp = impresorasConPrecio.flatMap(e =>
    e.ofertas.map(o => ({
      proveedor: e.proveedor,
      tipoBucket: e.tipoBucket,
      precio: num(o.valor),
      termino: o.termino ?? null,
      oferta: o.tipo ?? null,
    }))
  )

  // 2. KPIs: preferir valores de estadisticas; si faltan, calcular en runtime
  const totalProv = num(metadata.total_proveedores) ?? proveedores.length
  const totalMensajes = num(metadata.total_mensajes)
  const totalProdConPrecio = num(metadata.total_productos_con_precio) ?? (impresorasConPrecio.length + tintasConPrecio.length)
  const conPrecio = num(stats.proveedores_con_precio)
    ?? new Set([...impresorasConPrecio.map(e => e.proveedor), ...tintasConPrecio.map(e => e.proveedor)]).size
  const pctConPrecio = totalProv ? (conPrecio / totalProv) * 100 : null

  const minOferta = ofertasImp.length ? ofertasImp.reduce((a, b) => (b.precio < a.precio ? b : a)) : null
  const maxOferta = ofertasImp.length ? ofertasImp.reduce((a, b) => (b.precio > a.precio ? b : a)) : null
  const minImp = num(stats.precio_minimo_impresora) ?? minOferta?.precio ?? null
  const maxImp = num(stats.precio_maximo_impresora) ?? maxOferta?.precio ?? null

  const promKey = Object.keys(stats).find(k => k.startsWith('precio_promedio'))
  const promVal = promKey ? num(stats[promKey]) : (minImp != null && maxImp != null ? (minImp + maxImp) / 2 : null)
  const promLabel = promKey ? promKey.replace('precio_promedio_', '').replace(/_/g, ' ') : 'promedio'

  const minTinta = num(stats.precio_minimo_tinta) ?? (tintasConPrecio.length ? tintasConPrecio[0].precio : null)
  const maxTinta = num(stats.precio_maximo_tinta) ?? (tintasConPrecio.length ? tintasConPrecio[tintasConPrecio.length - 1].precio : null)

  const agenteKey = Object.keys(stats).find(k => k.startsWith('proveedores_con_agente_en_'))
  const agentes = agenteKey && Array.isArray(stats[agenteKey]) ? stats[agenteKey].map(String) : []
  const paisAgente = agenteKey ? agenteKey.replace('proveedores_con_agente_en_', '') : null

  // 3. Comparativa de precios: preferir comparativas.*; si no, construirla
  const compKey = Object.keys(comparativas).find(k => k !== 'tintas')
  const compBase = compKey && Array.isArray(comparativas[compKey])
    ? comparativas[compKey]
        .filter(c => num(c.precio) != null)
        .map(c => ({
          proveedor: String(c.proveedor ?? ''),
          nombre: `${shortNombre(c.proveedor)} — ${primerTermino(c.termino)}`,
          precio: num(c.precio),
          termino: c.termino ?? null,
          tipo: bucketTipo(c.tipo),
          oferta: null,
        }))
    : null

  // Ofertas adicionales desde productos (PROMO + ORIGINAL) de proveedores
  // que no aparecen en la comparativa, para mostrarlas también
  const compShorts = new Set((compBase ?? []).map(r => shortNombre(r.proveedor).toLowerCase()))
  const ofertasExtra = ofertasImp
    .filter(r => !compShorts.has(shortNombre(r.proveedor).toLowerCase()))
    .map(r => ({
      proveedor: r.proveedor,
      nombre: `${shortNombre(r.proveedor)} — ${primerTermino(r.termino)}${r.oferta && r.oferta !== 'ESTANDAR' ? ' · ' + r.oferta : ''}`,
      precio: r.precio,
      termino: r.termino,
      tipo: r.tipoBucket,
      oferta: r.oferta,
    }))

  const compRows = (compBase
    ? [...compBase, ...ofertasExtra]
    : ofertasImp.map(r => ({
        proveedor: r.proveedor,
        nombre: `${shortNombre(r.proveedor)} — ${primerTermino(r.termino)}`,
        precio: r.precio,
        termino: r.termino,
        tipo: r.tipoBucket,
        oferta: r.oferta,
      }))
  ).sort((a, b) => a.precio - b.precio)

  // 4. Scatter: precio vs número de cabezales (mejor oferta por producto)
  const scatterRows = []
  for (const e of impresorasConPrecio) {
    const cab = num(e.producto.cabezales)
    const mejor = e.ofertas.reduce((a, b) => (num(b.valor) < num(a.valor) ? b : a))
    if (cab == null || num(mejor.valor) == null) continue
    scatterRows.push({
      proveedor: e.proveedor,
      nombre: shortNombre(e.proveedor),
      modelo: e.producto.modelo ?? null,
      cabezales: cab,
      precio: num(mejor.valor),
      termino: mejor.termino ?? null,
      tipo: e.tipoBucket,
    })
  }

  // Jitter determinístico solo para puntos superpuestos (misma X, precios casi iguales)
  const clusters = {}
  for (const r of scatterRows) {
    const key = r.cabezales + '|' + Math.round(r.precio / 160)
    ;(clusters[key] = clusters[key] || []).push(r)
  }
  const OFFSETS = [0, -0.15, 0.15, -0.08, 0.08, -0.22, 0.22]
  for (const key in clusters) {
    const g = clusters[key]
    if (g.length > 1) g.forEach((r, i) => { r.x = r.cabezales + OFFSETS[i % OFFSETS.length] })
    else g[0].x = g[0].cabezales
  }

  // 5. Colores fijos por bucket (sigue a la entidad, no al orden de render)
  const buckets = [...new Set(['Eco-solvent', 'UV', ...Object.keys(tiposDist).sort()])]
  const colorMap = {}
  buckets.forEach((b, i) => { colorMap[b] = SERIES[i % SERIES.length] })
  const colorOf = (b) => colorMap[b] ?? SERIES[SERIES.length - 1]

  const totalProductos = Object.values(tiposDist).reduce((a, b) => a + b, 0)
  const pieData = Object.entries(tiposDist)
    .sort((a, b) => SERIES.indexOf(colorOf(a[0])) - SERIES.indexOf(colorOf(b[0])))
    .map(([name, value]) => ({
      name, value,
      pct: totalProductos ? Math.round((value / totalProductos) * 100) : 0,
      color: colorOf(name),
    }))

  const cabData = Object.values(cabezalesDist).sort((a, b) => b.count - a.count)

  // 6. Tabla de estado por proveedor
  const agenteL = agentes.map(a => a.toLowerCase())
  const statusRows = proveedores.map(prov => {
    const productos = Array.isArray(prov.productos) ? prov.productos : []
    const nombreL = String(prov.nombre ?? '').toLowerCase()
    const agente = agenteL.some(a => a && (nombreL.includes(a) || a.includes(nombreL)))
    return {
      nombre: prov.nombre || 'Proveedor sin nombre',
      tienePrecio: productos.some(p => Array.isArray(p.precios) && p.precios.length > 0),
      vendeImpresoras: productos.some(p => esImpresora(String(p.tipo ?? ''))),
      agente,
      ubicacion: prov.ubicacion ?? null,
      contacto: prov.contacto ?? null,
    }
  }).sort((a, b) => (b.agente - a.agente) || (b.tienePrecio - a.tienePrecio) || a.nombre.localeCompare(b.nombre))

  // 7. Resumen ejecutivo
  const mejorAbs = [...ofertasImp].sort((a, b) => a.precio - b.precio)[0] ?? null
  const mejorFob = [...ofertasImp.filter(r => /fob/i.test(String(r.termino ?? '')))].sort((a, b) => a.precio - b.precio)[0] ?? null
  const brecha = minImp != null && maxImp != null && minImp > 0 ? ((maxImp - minImp) / minImp) * 100 : null
  const topRelacion = [...scatterRows]
    .map(r => ({ ...r, ratio: r.precio / r.cabezales }))
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 3)

  return {
    proveedores, fecha, version, sectores,
    kpis: [
      { label: 'Proveedores contactados', value: fmtNum(totalProv), sub: `${proveedores.length} con ficha en el JSON`, icon: '📊', color: '#2563eb' },
      { label: 'Mensajes intercambiados', value: fmtNum(totalMensajes), sub: 'comunicaciones registradas', icon: '💬', color: '#0891b2' },
      { label: 'Productos con precio', value: fmtNum(totalProdConPrecio), sub: `${impresorasConPrecio.length} impresoras · ${tintasConPrecio.length} ofertas de tinta`, icon: '🏷️', color: '#0d9488' },
      { label: 'Proveedores con precio', value: fmtNum(conPrecio), sub: `${fmtPct(pctConPrecio)} del total contactado`, icon: '💵', color: '#7c3aed' },
      { label: 'Precio mín. impresora', value: fmtUSD(minImp), sub: minOferta ? `${shortNombre(minOferta.proveedor)} · ${minOferta.termino ?? '—'}` : '—', icon: '📉', color: '#16a34a' },
      { label: `Precio prom. (${promLabel})`, value: fmtUSD(promVal), sub: 'según estadísticas del JSON', icon: '📈', color: '#d97706' },
      { label: 'Precio máx. impresora', value: fmtUSD(maxImp), sub: maxOferta ? `${shortNombre(maxOferta.proveedor)} · ${maxOferta.termino ?? '—'}` : '—', icon: '🔺', color: '#dc2626' },
      { label: 'Tintas (rango)', value: minTinta != null && maxTinta != null ? `${fmtUSD(minTinta)} – ${fmtUSD(maxTinta)}` : 'N/D', sub: 'precio mínimo y máximo por litro', icon: '🧪', color: '#0ea5e9' },
    ],
    compKey, compRows,
    compLegend: [...new Set(compRows.map(r => r.tipo))].map(t => ({ name: t, color: colorOf(t) })),
    pieData, totalProductos,
    cabData,
    tintasConPrecio,
    statusRows, agentes, paisAgente,
    scatterRows,
    scatterLegend: [...new Set(scatterRows.map(r => r.tipo))].map(t => ({ name: t, color: colorOf(t) })),
    resumen: { mejorAbs, mejorFob, brecha, conPrecio, totalProv, pctConPrecio, agentes, paisAgente, topRelacion },
  }
}

/* ─── Piezas de UI ─────────────────────────────────────────────────────────── */
function BiCardHead({ n, title, sub }) {
  return (
    <div className="bi-card-header">
      <span className="bi-card-num">{n}</span>
      <div style={{ minWidth: 0 }}>
        <div className="bi-card-title">{title}</div>
        {sub ? <div style={{ fontSize: 12, color: 'var(--steel)', marginBottom: 16 }}>{sub}</div> : null}
      </div>
    </div>
  )
}

function BiLegend({ items }) {
  if (!items.length) return null
  return (
    <div className="bi-legend">
      {items.map(it => (
        <span key={it.name} className="bi-legend-item">
          <span className="bi-legend-swatch" style={{ background: it.color }} />
          {it.name}{it.value != null ? ' · ' + it.value : ''}
        </span>
      ))}
    </div>
  )
}

/* Tooltips por gráfico */
function TipBar({ active, payload }) {
  if (!active || !payload?.length) return null
  const r = payload[0].payload
  return (
    <div className="bi-tip">
      <div className="bi-tip-title">{r.proveedor}</div>
      <div className="bi-tip-row"><span>Precio</span><b>{fmtUSD(r.precio)}</b></div>
      <div className="bi-tip-row"><span>Incoterm</span><b>{r.termino || '—'}</b></div>
      <div className="bi-tip-row"><span>Tipo</span><b>{r.tipo}</b></div>
      {r.oferta ? <div className="bi-tip-row"><span>Oferta</span><b>{r.oferta}</b></div> : null}
    </div>
  )
}

function TipPie({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bi-tip">
      <div className="bi-tip-title">{d.name}</div>
      <div className="bi-tip-row"><span>Productos</span><b>{d.value}</b></div>
      <div className="bi-tip-row"><span>Participación</span><b>{d.pct}%</b></div>
    </div>
  )
}

function TipCab({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bi-tip">
      <div className="bi-tip-title">{payload[0].payload.label}</div>
      <div className="bi-tip-row"><span>Productos</span><b>{payload[0].value}</b></div>
    </div>
  )
}

function TipScatter({ active, payload }) {
  if (!active || !payload?.length) return null
  const r = payload[0].payload
  return (
    <div className="bi-tip">
      <div className="bi-tip-title">{r.proveedor}</div>
      <div className="bi-tip-row"><span>Modelo</span><b>{r.modelo || '—'}</b></div>
      <div className="bi-tip-row"><span>Cabezales</span><b>{r.cabezales}</b></div>
      <div className="bi-tip-row"><span>Precio</span><b>{fmtUSD(r.precio)}</b></div>
      <div className="bi-tip-row"><span>Incoterm</span><b>{r.termino || '—'}</b></div>
      <div className="bi-tip-row"><span>Tipo</span><b>{r.tipo}</b></div>
    </div>
  )
}

const BarLabel = ({ x, y, width, height, value }) => (
  <text x={x + width + 6} y={y + height / 2} dominantBaseline="middle" fill="#0a1628" fontSize={11} fontWeight={600}>
    {fmtUSD(value)}
  </text>
)

const DotShape = ({ cx, cy, payload }) => (
  <circle cx={cx} cy={cy} r={5} fill={payload.color} stroke="#fff" strokeWidth={2} />
)

/* ─── Pantalla de carga del JSON ───────────────────────────────────────────── */
function LoadScreen({ raw, setRaw, error, onProcess, onFile, onClear }) {
  return (
    <div className="dash-page">
      <div className="dash-welcome">
        <div>
          <h1 className="dash-welcome-title">Inteligencia de Proveedores</h1>
          <p className="dash-welcome-sub">Dashboard analítico de equipos de impresión de gran formato</p>
        </div>
      </div>

      <div className="bi-load-card">
        <div className="bi-load-title">Cargar JSON de inteligencia</div>
        <p className="bi-load-sub">
          Adjunta o pega el JSON de inteligencia de proveedores (Alibaba y otras plataformas B2B chinas).
          La página lo procesa y genera el dashboard automáticamente. El JSON se guarda en este navegador.
        </p>

        <label className="bi-drop-zone">
          <input type="file" accept=".json,application/json" onChange={onFile} />
          📄 Clic para seleccionar el archivo .json
        </label>

        <textarea
          className="bi-textarea"
          placeholder={'{\n  "version": "1.0",\n  "fecha_actualizacion": "2026-08-14",\n  "metadata": { ... },\n  "proveedores": [ ... ],\n  "comparativas": { ... },\n  "estadisticas": { ... }\n}'}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          spellCheck={false}
        />

        {error ? <div className="sol-error" style={{ marginTop: 12 }}>{error}</div> : null}

        <div className="bi-actions">
          <button className="sol-btn-preview" onClick={onProcess}>Procesar JSON</button>
          <button className="sol-btn-cancel" onClick={onClear}>Limpiar</button>
        </div>

        <p className="bi-hint">
          Estructura esperada: version · fecha_actualizacion · metadata · proveedores[] · comparativas · estadisticas
        </p>
      </div>
    </div>
  )
}

/* ─── Vista del dashboard ──────────────────────────────────────────────────── */
function DashboardView({ data, fileName, onReload }) {
  const model = useMemo(() => processData(data), [data])
  const { kpis, compRows, compLegend, pieData, totalProductos, cabData, tintasConPrecio, statusRows, scatterRows, scatterLegend, resumen } = model
  const hayMinMaxTinta = tintasConPrecio.length > 1

  return (
    <div className="dash-page">

      {/* Encabezado */}
      <div className="dash-welcome">
        <div>
          <h1 className="dash-welcome-title">Inteligencia de Proveedores</h1>
          <p className="dash-welcome-sub">Análisis generado a partir del JSON cargado</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="bi-chip bi-chip-navy">Actualizado: {model.fecha || 'N/D'}</span>
          {model.sectores.map(s => <span key={s} className="bi-chip">{s}</span>)}
          {fileName ? <span className="bi-chip">📄 {fileName}</span> : null}
          <button className="sol-btn-cancel" onClick={onReload}>Cargar otro JSON</button>
        </div>
      </div>

      {/* 1 ── KPIs */}
      <div className="dash-stats">
        {kpis.map(k => (
          <div key={k.label} className="dash-stat-card" style={{ '--stat-color': k.color }}>
            <div className="dash-stat-top">
              <span className="dash-stat-icon">{k.icon}</span>
            </div>
            <div className="dash-stat-value">{k.value}</div>
            <div className="dash-stat-label">{k.label}</div>
            {k.sub ? <div className="bi-stat-sub">{k.sub}</div> : null}
          </div>
        ))}
      </div>

      {/* 2 + 3 ── Comparativa y donut */}
      <div className="bi-grid">
        <div className="bi-card">
          <BiCardHead
            n={2}
            title="Comparativa de precios por proveedor"
            sub={`${model.compKey ? model.compKey.replace(/_/g, ' ') + ' · ' : ''}ofertas ordenadas de menor a mayor (incluye PROMO y ORIGINAL cuando existen)`}
          />
          <div style={{ height: Math.max(220, compRows.length * 30 + 50) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compRows} layout="vertical" margin={{ top: 4, right: 92, bottom: 4, left: 0 }}>
                <CartesianGrid horizontal={false} stroke="#eee" strokeWidth={1} />
                <XAxis
                  type="number"
                  domain={[0, (dataMax) => Math.ceil(dataMax * 1.15 / 500) * 500]}
                  tickFormatter={fmtUSD}
                  tickLine={false}
                  axisLine={{ stroke: '#eee' }}
                  tick={{ fontSize: 11, fill: '#aaa' }}
                />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={192}
                  tickLine={false}
                  axisLine={{ stroke: '#eee' }}
                  tick={{ fontSize: 11, fill: '#888' }}
                />
                <Tooltip content={<TipBar />} cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }} />
                <Bar dataKey="precio" barSize={16} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {compRows.map(r => <Cell key={r.nombre + r.precio} fill={compLegend.find(l => l.name === r.tipo)?.color ?? '#2a78d6'} />)}
                  <LabelList dataKey="precio" content={<BarLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <BiLegend items={compLegend} />
        </div>

        <div className="bi-card">
          <BiCardHead n={3} title="Distribución por tipo" sub="Todos los productos catalogados" />
          <div style={{ position: 'relative', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData} dataKey="value" nameKey="name"
                  innerRadius="60%" outerRadius="86%" paddingAngle={2}
                  stroke="#fff" strokeWidth={2} isAnimationActive={false}
                >
                  {pieData.map(d => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip content={<TipPie />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111', lineHeight: 1 }}>{totalProductos}</div>
              <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-dm)' }}>productos</div>
            </div>
          </div>
          <BiLegend items={pieData.map(d => ({ name: d.name, color: d.color, value: `${d.value} · ${d.pct}%` }))} />
        </div>
      </div>

      {/* 4 + 5 ── Cabezales y tabla de tintas */}
      <div className="bi-grid-rev">
        <div className="bi-card">
          <BiCardHead n={4} title="Distribución por cabezal" sub="Productos por modelo de cabezal (se ignoran nulos)" />
          <div style={{ height: Math.max(200, cabData.length * 34 + 30) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cabData} layout="vertical" margin={{ top: 4, right: 34, bottom: 4, left: 0 }}>
                <CartesianGrid horizontal={false} stroke="#eee" strokeWidth={1} />
                <XAxis
                  type="number" allowDecimals={false}
                  tickLine={false} axisLine={{ stroke: '#eee' }}
                  tick={{ fontSize: 11, fill: '#aaa' }}
                />
                <YAxis
                  type="category" dataKey="label" width={116}
                  tickLine={false} axisLine={{ stroke: '#eee' }}
                  tick={{ fontSize: 11, fill: '#888' }}
                />
                <Tooltip content={<TipCab />} cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }} />
                <Bar dataKey="count" fill="#2a78d6" barSize={14} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  <LabelList dataKey="count" position="right" fill="#0a1628" fontSize={11} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bi-card">
          <BiCardHead
            n={5}
            title="Comparativa de precios de tinta"
            sub="Ofertas de tinta/ink ordenadas de menor a mayor · fila verde = mínimo · fila roja = máximo"
          />
          <div className="bi-table-wrap">
            <table className="bi-table">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Tipo</th>
                  <th>Precio (USD)</th>
                  <th>Unidad</th>
                  <th>Incoterm</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {tintasConPrecio.map((r, i) => {
                  const esMin = hayMinMaxTinta && i === 0
                  const esMax = hayMinMaxTinta && i === tintasConPrecio.length - 1
                  return (
                    <tr key={r.proveedor + r.nota + i}
                        className={esMin ? 'bi-row-min' : esMax ? 'bi-row-max' : undefined}
                        title={`${r.proveedor} — ${r.nota || r.tipoTinta}`}>
                      <td className="bi-prov">
                        {r.proveedor}
                        {esMin ? <span className="bi-chip bi-badge-min" style={{ marginLeft: 8 }}>Mín</span> : null}
                        {esMax ? <span className="bi-chip bi-badge-max" style={{ marginLeft: 8 }}>Máx</span> : null}
                      </td>
                      <td>{r.tipoTinta}</td>
                      <td className="bi-num" style={{ fontWeight: 600 }}>{fmtUSD(r.precio)}</td>
                      <td style={{ color: 'var(--steel)' }}>{r.unidad || 'N/D'}</td>
                      <td>{r.termino || 'N/D'}</td>
                      <td style={{ color: 'var(--steel)' }}>{r.nota || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6 ── Estado de proveedores */}
      <div className="bi-stack">
        <div className="bi-card">
          <BiCardHead n={6} title="Estado de proveedores" sub="Fila verde = proveedor con agente local · ✅ = sí · ❌ = no" />
          <div className="bi-table-wrap">
            <table className="bi-table">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th className="bi-th-center">Precio confirmado</th>
                  <th className="bi-th-center">Vende impresoras</th>
                  <th className="bi-th-center">Agente local</th>
                  <th>Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {statusRows.map(r => (
                  <tr key={r.nombre} className={r.agente ? 'bi-row-agente' : undefined}
                      title={`${r.nombre}${r.contacto ? ' · Contacto: ' + r.contacto : ''}${r.agente && model.paisAgente ? ' · Agente en ' + model.paisAgente : ''}`}>
                    <td className="bi-prov">{r.nombre}</td>
                    <td style={{ textAlign: 'center' }}>{r.tienePrecio ? '✅' : '❌'}</td>
                    <td style={{ textAlign: 'center' }}>{r.vendeImpresoras ? '✅' : '❌'}</td>
                    <td style={{ textAlign: 'center' }}>{r.agente ? '✅' : '❌'}</td>
                    <td style={{ color: 'var(--steel)' }}>{r.ubicacion || 'N/D'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 7 ── Scatter precio vs cabezales */}
      <div className="bi-stack">
        <div className="bi-card">
          <BiCardHead
            n={7}
            title="Precio vs número de cabezales"
            sub="Cada punto es una impresora con precio · X = cabezales · Y = precio (USD) · pasar el cursor para detalles"
          />
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 28, bottom: 12, left: 8 }}>
                <CartesianGrid stroke="#eee" strokeWidth={1} />
                <XAxis
                  type="number" dataKey="x" name="Cabezales"
                  domain={[1.4, 4.6]} ticks={[2, 3, 4]}
                  tickLine={false} axisLine={{ stroke: '#eee' }}
                  tick={{ fontSize: 11, fill: '#aaa' }}
                />
                <YAxis
                  type="number" dataKey="precio" name="Precio"
                  domain={['dataMin - 400', 'dataMax + 400']}
                  tickFormatter={fmtUSD} width={72}
                  tickLine={false} axisLine={{ stroke: '#eee' }}
                  tick={{ fontSize: 11, fill: '#aaa' }}
                />
                <Tooltip content={<TipScatter />} cursor={{ stroke: '#aaa', strokeDasharray: '3 3' }} />
                <Scatter data={scatterRows} shape={<DotShape />} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <BiLegend items={scatterLegend} />
        </div>
      </div>

      {/* 8 ── Resumen ejecutivo */}
      <div className="bi-stack">
        <div className="bi-summary">
          <div className="bi-summary-title">8 · Resumen ejecutivo</div>
          <div className="bi-summary-grid">
            <div className="bi-summary-item">
              <span>▸</span>
              <span>Mejor precio absoluto: <span className="bi-acc">{resumen.mejorAbs ? `${fmtUSD(resumen.mejorAbs.precio)} ofrecido por ${resumen.mejorAbs.proveedor} (${resumen.mejorAbs.termino || '—'})` : 'N/D'}</span></span>
            </div>
            <div className="bi-summary-item">
              <span>▸</span>
              <span>Mejor precio FOB: <span className="bi-acc">{resumen.mejorFob ? `${fmtUSD(resumen.mejorFob.precio)} de ${resumen.mejorFob.proveedor}` : 'N/D — ningún proveedor ofreció precio FOB'}</span></span>
            </div>
            <div className="bi-summary-item">
              <span>▸</span>
              <span>Brecha entre precio mínimo y máximo: <span className="bi-acc">{fmtPct(resumen.brecha)}</span></span>
            </div>
            <div className="bi-summary-item">
              <span>▸</span>
              <span>Proveedores con precio confirmado: <span className="bi-acc">{resumen.conPrecio} de {resumen.totalProv} ({fmtPct(resumen.pctConPrecio)})</span></span>
            </div>
            <div className="bi-summary-item">
              <span>▸</span>
              <span>Presencia local: <span className="bi-acc">{resumen.agentes.length
                ? `${resumen.agentes.length} proveedor(es) con agente en ${resumen.paisAgente || 'el país'}: ${resumen.agentes.join(', ')}`
                : 'N/D — sin confirmar'}</span></span>
            </div>
            <div className="bi-summary-item">
              <span>▸</span>
              <span>Mejor relación precio/cabezal: <span className="bi-acc">{resumen.topRelacion.length
                ? resumen.topRelacion.map(r => `${r.nombre} (${fmtUSD(r.precio)} ÷ ${r.cabezales} cab. = ${fmtUSD(r.ratio)}/cabezal)`).join(' · ')
                : 'N/D'}</span></span>
            </div>
          </div>
          <div className="bi-summary-foot">
            Datos actualizados al {model.fecha || 'N/D'}{model.version ? ' · v' + model.version : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Componente principal ─────────────────────────────────────────────────── */
export default function SupplierDashboard() {
  const [raw, setRaw] = useState('')
  const [data, setData] = useState(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState(null)

  // Restaurar el último JSON procesado (guardado en este navegador)
  useEffect(() => {
    try {
      const s = localStorage.getItem(LS_KEY)
      if (!s) return
      const d = JSON.parse(s)
      if (d && Array.isArray(d.proveedores) && d.proveedores.length) {
        setData(d)
        setRaw(s)
      }
    } catch { /* silencioso */ }
  }, [])

  const procesar = (texto, nombre) => {
    try {
      const d = JSON.parse(texto)
      if (!d || !Array.isArray(d.proveedores) || !d.proveedores.length) {
        setError('El JSON debe contener un arreglo "proveedores" con al menos un elemento. Revisa la estructura y vuelve a intentar.')
        return
      }
      setData(d)
      setError(null)
      if (nombre) setFileName(nombre)
      try { localStorage.setItem(LS_KEY, texto) } catch { /* silencioso */ }
    } catch (e) {
      setError('JSON inválido: ' + e.message)
    }
  }

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const texto = String(reader.result || '')
      setRaw(texto)
      procesar(texto, f.name)
    }
    reader.readAsText(f)
  }

  const cargarOtro = () => {
    setData(null)
    setError(null)
  }

  if (!data) {
    return (
      <LoadScreen
        raw={raw}
        setRaw={setRaw}
        error={error}
        onProcess={() => procesar(raw)}
        onFile={onFile}
        onClear={() => { setRaw(''); setError(null) }}
      />
    )
  }

  return <DashboardView data={data} fileName={fileName} onReload={cargarOtro} />
}
