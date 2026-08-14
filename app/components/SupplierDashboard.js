'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, LabelList, PieChart, Pie, ScatterChart, Scatter,
} from 'recharts'

/* ─── Paleta de series (orden fijo, validada) ──────────────────────────────── */
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948']

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
      { label: 'Proveedores contactados', value: fmtNum(totalProv), sub: `${proveedores.length} con ficha en este dataset` },
      { label: 'Mensajes intercambiados', value: fmtNum(totalMensajes), sub: 'comunicaciones registradas' },
      { label: 'Productos con precio', value: fmtNum(totalProdConPrecio), sub: `${impresorasConPrecio.length} impresoras · ${tintasConPrecio.length} ofertas de tinta` },
      { label: 'Proveedores con precio', value: fmtNum(conPrecio), sub: `${fmtPct(pctConPrecio)} del total contactado` },
      { label: 'Precio mín. impresora', value: fmtUSD(minImp), sub: minOferta ? `${shortNombre(minOferta.proveedor)} · ${minOferta.termino ?? '—'}` : '—' },
      { label: `Precio prom. (${promLabel})`, value: fmtUSD(promVal), sub: 'según estadísticas del dataset' },
      { label: 'Precio máx. impresora', value: fmtUSD(maxImp), sub: maxOferta ? `${shortNombre(maxOferta.proveedor)} · ${maxOferta.termino ?? '—'}` : '—' },
      { label: 'Tintas (rango)', value: minTinta != null && maxTinta != null ? `${fmtUSD(minTinta)} – ${fmtUSD(maxTinta)}` : 'N/D', sub: 'precio mínimo y máximo por litro' },
    ],
    compKey, compRows,
    compLegend: [...new Set(compRows.map(r => r.tipo))].map(t => ({ name: t, color: colorOf(t) })),
    pieData, totalProductos,
    cabData,
    tintasConPrecio, minTinta, maxTinta,
    statusRows, agentes, paisAgente,
    scatterRows,
    scatterLegend: [...new Set(scatterRows.map(r => r.tipo))].map(t => ({ name: t, color: colorOf(t) })),
    resumen: { mejorAbs, mejorFob, brecha, conPrecio, totalProv, pctConPrecio, agentes, paisAgente, topRelacion },
  }
}

/* ─── Piezas de UI ─────────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, title }) {
  return (
    <div className="di-card p-4" title={title || label}>
      <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--di-steel)', fontWeight: 700 }}>{label}</div>
      <div className="di-kpi-value font-bold text-[22px] mt-1 leading-tight">{value}</div>
      {sub ? <div className="text-[11px] mt-1" style={{ color: 'var(--di-steel)' }}>{sub}</div> : null}
    </div>
  )
}

function CardHead({ n, title, sub }) {
  return (
    <div className="mb-4">
      <h2 className="di-title font-bold text-[15px] flex items-center gap-2">
        <span className="di-chip" style={{ background: 'var(--di-navy)', color: '#fff' }}>{n}</span>
        {title}
      </h2>
      {sub ? <p className="text-[12px] mt-1" style={{ color: 'var(--di-steel)' }}>{sub}</p> : null}
    </div>
  )
}

function ChartLegend({ items }) {
  if (!items.length) return null
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-3">
      {items.map(it => (
        <span key={it.name} className="di-chip" style={{ background: '#fff', border: '1px solid var(--di-border)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: it.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: 'var(--di-ink)' }}>{it.name}{it.value != null ? ' · ' + it.value : ''}</span>
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
    <div className="di-tooltip">
      <div className="di-tt-title">{r.proveedor}</div>
      <div className="di-tt-row"><span>Precio</span><b>{fmtUSD(r.precio)}</b></div>
      <div className="di-tt-row"><span>Incoterm</span><b>{r.termino || '—'}</b></div>
      <div className="di-tt-row"><span>Tipo</span><b>{r.tipo}</b></div>
      {r.oferta ? <div className="di-tt-row"><span>Oferta</span><b>{r.oferta}</b></div> : null}
    </div>
  )
}

function TipPie({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="di-tooltip">
      <div className="di-tt-title">{d.name}</div>
      <div className="di-tt-row"><span>Productos</span><b>{d.value}</b></div>
      <div className="di-tt-row"><span>Participación</span><b>{d.pct}%</b></div>
    </div>
  )
}

function TipCab({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="di-tooltip">
      <div className="di-tt-title">{payload[0].payload.label}</div>
      <div className="di-tt-row"><span>Productos</span><b>{payload[0].value}</b></div>
    </div>
  )
}

function TipScatter({ active, payload }) {
  if (!active || !payload?.length) return null
  const r = payload[0].payload
  return (
    <div className="di-tooltip">
      <div className="di-tt-title">{r.proveedor}</div>
      <div className="di-tt-row"><span>Modelo</span><b>{r.modelo || '—'}</b></div>
      <div className="di-tt-row"><span>Cabezales</span><b>{r.cabezales}</b></div>
      <div className="di-tt-row"><span>Precio</span><b>{fmtUSD(r.precio)}</b></div>
      <div className="di-tt-row"><span>Incoterm</span><b>{r.termino || '—'}</b></div>
      <div className="di-tt-row"><span>Tipo</span><b>{r.tipo}</b></div>
    </div>
  )
}

const BarLabel = ({ x, y, width, height, value }) => (
  <text x={x + width + 6} y={y + height / 2} dominantBaseline="middle" fill="#1B3A6B" fontSize={11} fontWeight={600}>
    {fmtUSD(value)}
  </text>
)

const DotShape = ({ cx, cy, payload }) => (
  <circle cx={cx} cy={cy} r={5} fill={payload.color} stroke="#fff" strokeWidth={2} />
)

/* ─── Componente principal ─────────────────────────────────────────────────── */
export default function SupplierDashboard({ data, error }) {
  const model = useMemo(() => (data ? processData(data) : null), [data])

  if (error || !model || !model.proveedores.length) {
    return (
      <div className="di-root min-h-[60vh] p-6">
        <div className="di-card max-w-xl mx-auto p-8 text-center">
          <div className="di-title font-bold text-[15px] mb-2">Inteligencia de Proveedores</div>
          <div className="text-[13px]" style={{ color: 'var(--di-steel)' }}>
            {error || 'No se pudieron procesar los datos (JSON vacío o inválido). Verifica data/inteligencia-proveedores.json.'}
          </div>
        </div>
      </div>
    )
  }

  const { kpis, compRows, compLegend, pieData, totalProductos, cabData, tintasConPrecio, statusRows, scatterRows, scatterLegend, resumen } = model
  const hayMinMaxTinta = tintasConPrecio.length > 1

  return (
    <div className="di-root min-h-full p-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="di-title font-bold text-[20px]">Inteligencia de Proveedores</h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--di-steel)' }}>
            Equipos de impresión de gran formato · Fuentes B2B chinas (Alibaba y plataformas similares)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="di-chip" style={{ background: 'var(--di-navy)', color: '#fff' }}>
            Actualizado: {model.fecha || 'N/D'}
          </span>
          {model.sectores.map(s => (
            <span key={s} className="di-chip" style={{ background: '#fff', border: '1px solid var(--di-border)' }}>{s}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1 ── KPIs */}
        <section className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map(k => <KpiCard key={k.label} {...k} />)}
          </div>
        </section>

        {/* 2 ── Comparativa de precios por proveedor */}
        <section className="di-card p-5 lg:col-span-2">
          <CardHead
            n={2}
            title="Comparativa de precios por proveedor"
            sub={`${model.compKey ? model.compKey.replace(/_/g, ' ') + ' · ' : ''}ofertas ordenadas de menor a mayor (incluye PROMO y ORIGINAL cuando existen)`}
          />
          <div style={{ height: Math.max(220, compRows.length * 30 + 50) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compRows} layout="vertical" margin={{ top: 4, right: 92, bottom: 4, left: 0 }}>
                <CartesianGrid horizontal={false} stroke="#e1e0d9" strokeWidth={1} />
                <XAxis
                  type="number"
                  domain={[0, (dataMax) => Math.ceil(dataMax * 1.15 / 500) * 500]}
                  tickFormatter={fmtUSD}
                  tickLine={false}
                  axisLine={{ stroke: '#c3c2b7' }}
                  tick={{ fontSize: 11, fill: '#898781' }}
                />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={192}
                  tickLine={false}
                  axisLine={{ stroke: '#c3c2b7' }}
                  tick={{ fontSize: 11, fill: '#52514e' }}
                />
                <Tooltip content={<TipBar />} cursor={{ fill: 'rgba(27, 58, 107, 0.04)' }} />
                <Bar dataKey="precio" barSize={16} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {compRows.map(r => <Cell key={r.nombre + r.precio} fill={compLegend.find(l => l.name === r.tipo)?.color ?? '#2a78d6'} />)}
                  <LabelList dataKey="precio" content={<BarLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend items={compLegend} />
        </section>

        {/* 3 ── Donut por tipo */}
        <section className="di-card p-5 lg:col-span-1">
          <CardHead n={3} title="Distribución por tipo" sub="Todos los productos catalogados" />
          <div className="relative h-64">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="di-kpi-value font-bold text-[26px] leading-none">{totalProductos}</div>
              <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--di-steel)' }}>productos</div>
            </div>
          </div>
          <ChartLegend items={pieData.map(d => ({ name: d.name, color: d.color, value: `${d.value} · ${d.pct}%` }))} />
        </section>

        {/* 4 ── Distribución por cabezal */}
        <section className="di-card p-5 lg:col-span-1">
          <CardHead n={4} title="Distribución por cabezal" sub="Productos por modelo de cabezal (se ignoran nulos)" />
          <div style={{ height: Math.max(200, cabData.length * 34 + 30) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cabData} layout="vertical" margin={{ top: 4, right: 34, bottom: 4, left: 0 }}>
                <CartesianGrid horizontal={false} stroke="#e1e0d9" strokeWidth={1} />
                <XAxis
                  type="number" allowDecimals={false}
                  tickLine={false} axisLine={{ stroke: '#c3c2b7' }}
                  tick={{ fontSize: 11, fill: '#898781' }}
                />
                <YAxis
                  type="category" dataKey="label" width={116}
                  tickLine={false} axisLine={{ stroke: '#c3c2b7' }}
                  tick={{ fontSize: 11, fill: '#52514e' }}
                />
                <Tooltip content={<TipCab />} cursor={{ fill: 'rgba(27, 58, 107, 0.04)' }} />
                <Bar dataKey="count" fill="#2a78d6" barSize={14} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  <LabelList dataKey="count" position="right" fill="#1B3A6B" fontSize={11} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 5 ── Tabla comparativa de tintas */}
        <section className="di-card p-5 lg:col-span-2">
          <CardHead
            n={5}
            title="Comparativa de precios de tinta"
            sub="Ofertas de tinta/ink ordenadas de menor a mayor · fila verde = mínimo · fila roja = máximo"
          />
          <div className="overflow-x-auto">
            <table className="di-table min-w-[560px]">
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
                    <tr key={r.proveedor + r.nota + i} style={esMin ? { background: '#EAF7F0' } : esMax ? { background: '#FDECEC' } : undefined}
                        title={`${r.proveedor} — ${r.nota || r.tipoTinta}`}>
                      <td className="font-medium" style={{ color: 'var(--di-navy)' }}>
                        {r.proveedor}
                        {esMin ? <span className="di-chip di-badge-min ml-2">Mín</span> : null}
                        {esMax ? <span className="di-chip di-badge-max ml-2">Máx</span> : null}
                      </td>
                      <td>{r.tipoTinta}</td>
                      <td className="di-num font-semibold">{fmtUSD(r.precio)}</td>
                      <td style={{ color: 'var(--di-steel)' }}>{r.unidad || 'N/D'}</td>
                      <td>{r.termino || 'N/D'}</td>
                      <td style={{ color: 'var(--di-steel)' }}>{r.nota || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6 ── Estado de proveedores */}
        <section className="di-card p-5 lg:col-span-3">
          <CardHead
            n={6}
            title="Estado de proveedores"
            sub="Fila verde = proveedor con agente local · ✅ = sí · ❌ = no"
          />
          <div className="overflow-x-auto">
            <table className="di-table min-w-[640px]">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th className="text-center">Precio confirmado</th>
                  <th className="text-center">Vende impresoras</th>
                  <th className="text-center">Agente local</th>
                  <th>Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {statusRows.map(r => (
                  <tr key={r.nombre} style={r.agente ? { background: '#EAF7F0' } : undefined}
                      title={`${r.nombre}${r.contacto ? ' · Contacto: ' + r.contacto : ''}${r.agente && model.paisAgente ? ' · Agente en ' + model.paisAgente : ''}`}>
                    <td className="font-medium" style={{ color: 'var(--di-navy)' }}>{r.nombre}</td>
                    <td className="text-center">{r.tienePrecio ? '✅' : '❌'}</td>
                    <td className="text-center">{r.vendeImpresoras ? '✅' : '❌'}</td>
                    <td className="text-center">{r.agente ? '✅' : '❌'}</td>
                    <td style={{ color: 'var(--di-steel)' }}>{r.ubicacion || 'N/D'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7 ── Scatter precio vs cabezales */}
        <section className="di-card p-5 lg:col-span-3">
          <CardHead
            n={7}
            title="Precio vs número de cabezales"
            sub="Cada punto es una impresora con precio · X = cabezales · Y = precio (USD) · pasar el cursor para detalles"
          />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 28, bottom: 12, left: 8 }}>
                <CartesianGrid stroke="#e1e0d9" strokeWidth={1} />
                <XAxis
                  type="number" dataKey="x" name="Cabezales"
                  domain={[1.4, 4.6]} ticks={[2, 3, 4]}
                  tickLine={false} axisLine={{ stroke: '#c3c2b7' }}
                  tick={{ fontSize: 11, fill: '#898781' }}
                />
                <YAxis
                  type="number" dataKey="precio" name="Precio"
                  domain={['dataMin - 400', 'dataMax + 400']}
                  tickFormatter={fmtUSD} width={72}
                  tickLine={false} axisLine={{ stroke: '#c3c2b7' }}
                  tick={{ fontSize: 11, fill: '#898781' }}
                />
                <Tooltip content={<TipScatter />} cursor={{ stroke: '#898781', strokeDasharray: '3 3' }} />
                <Scatter data={scatterRows} shape={<DotShape />} isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend items={scatterLegend} />
        </section>

        {/* 8 ── Resumen ejecutivo */}
        <section className="lg:col-span-3">
          <div className="di-summary p-6">
            <h2 className="font-bold text-[15px] mb-4 flex items-center gap-2">
              <span className="di-chip" style={{ background: '#4A90D9', color: '#fff' }}>8</span>
              Resumen ejecutivo
            </h2>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-3 text-[13px] leading-relaxed">
              <div className="flex gap-2">
                <span style={{ color: '#7FB3E8' }}>▸</span>
                <span>Mejor precio absoluto:{' '}
                  <span className="di-acc">{resumen.mejorAbs ? `${fmtUSD(resumen.mejorAbs.precio)} ofrecido por ${resumen.mejorAbs.proveedor} (${resumen.mejorAbs.termino || '—'})` : 'N/D'}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span style={{ color: '#7FB3E8' }}>▸</span>
                <span>Mejor precio FOB:{' '}
                  <span className="di-acc">{resumen.mejorFob ? `${fmtUSD(resumen.mejorFob.precio)} de ${resumen.mejorFob.proveedor}` : 'N/D — ningún proveedor ofreció precio FOB'}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span style={{ color: '#7FB3E8' }}>▸</span>
                <span>Brecha entre precio mínimo y máximo:{' '}
                  <span className="di-acc">{fmtPct(resumen.brecha)}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span style={{ color: '#7FB3E8' }}>▸</span>
                <span>Proveedores con precio confirmado:{' '}
                  <span className="di-acc">{resumen.conPrecio} de {resumen.totalProv} ({fmtPct(resumen.pctConPrecio)})</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span style={{ color: '#7FB3E8' }}>▸</span>
                <span>Presencia local:{' '}
                  <span className="di-acc">{resumen.agentes.length
                    ? `${resumen.agentes.length} proveedor(es) con agente en ${resumen.paisAgente || 'el país'}: ${resumen.agentes.join(', ')}`
                    : 'N/D — sin confirmar'}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <span style={{ color: '#7FB3E8' }}>▸</span>
                <span>Mejor relación precio/cabezal:{' '}
                  <span className="di-acc">{resumen.topRelacion.length
                    ? resumen.topRelacion.map(r => `${r.nombre} (${fmtUSD(r.precio)} ÷ ${r.cabezales} cab. = ${fmtUSD(r.ratio)}/cabezal)`).join(' · ')
                    : 'N/D'}</span>
                </span>
              </div>
            </div>
            <div className="text-[11px] mt-5" style={{ color: '#9DB8DC' }}>
              Datos actualizados al {model.fecha || 'N/D'}{model.version ? ' · v' + model.version : ''}
            </div>
          </div>
        </section>
      </div>

      <p className="text-[11px] mt-4 text-center" style={{ color: 'var(--di-steel)' }}>
        Los datos se cargan dinámicamente desde data/inteligencia-proveedores.json en cada carga de página — nada está hardcodeado.
      </p>
    </div>
  )
}
