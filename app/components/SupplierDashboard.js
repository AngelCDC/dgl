'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, LabelList, PieChart, Pie, ScatterChart, Scatter,
} from 'recharts'

/* ─── Paleta de series (orden fijo, validada: 8 slots) ─────────────────────── */
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948']
const COLOR_OTROS = '#98a2b3'
const LS_KEY = 'inteligencia-proveedores-json'
const FILTRO_VACIO = { q: '', proveedor: '', sectores: [], categorias: [], incoterms: [], ofertas: [] }

/* ─── Utilidades ────────────────────────────────────────────────────────────── */
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null }
const fmtUSD = (v) => { const n = num(v); return n == null ? 'N/D' : '$' + Math.round(n).toLocaleString('en-US') }
const fmtPrecio = (v, moneda) => {
  const n = num(v)
  if (n == null) return 'N/D'
  return (moneda && moneda !== 'USD' ? moneda + ' ' : '$') + Math.round(n).toLocaleString('en-US')
}
const fmtNum = (v) => { const n = num(v); return n == null ? 'N/D' : Math.round(n).toLocaleString('en-US') }
const fmtPct = (v) => (v == null ? 'N/D' : Math.round(v) + '%')
const shortNombre = (s) => String(s || '').trim().split(/\s+/).slice(0, 2).join(' ')
const primerTermino = (t) => String(t || '').trim().split(/\s+/)[0] || '—'

/* Normaliza cualquier texto de clasificación (tipo, sector, valor de atributo) */
const normCat = (s) => {
  const t = String(s ?? '').trim().replace(/\s+/g, ' ')
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : null
}

/* Normaliza el filtro de la barra */
function normalizarFiltro(filter) {
  if (!filter) return null
  return {
    q: String(filter.q ?? '').trim().toLowerCase(),
    proveedor: filter.proveedor ?? '',
    sectores: Array.isArray(filter.sectores) ? filter.sectores : [],
    categorias: Array.isArray(filter.categorias) ? filter.categorias : [],
    incoterms: Array.isArray(filter.incoterms) ? filter.incoterms : [],
    ofertas: Array.isArray(filter.ofertas) ? filter.ofertas : [],
  }
}
const filtroActivo = (f) => !!f && !!(f.q || f.proveedor || f.sectores.length || f.categorias.length || f.incoterms.length || f.ofertas.length)

/* Pasa los filtros base (proveedor + categoría + búsqueda) sobre un producto */
function pasaBase(f, nombre, categoria, texto) {
  if (!f) return true
  if (f.proveedor && nombre !== f.proveedor) return false
  if (f.categorias.length && !f.categorias.includes(categoria)) return false
  if (f.q && !texto.includes(f.q)) return false
  return true
}

/* Pasa los filtros de oferta (incoterm + tipo de oferta) */
function pasaOferta(f, termino, oferta) {
  if (!f) return true
  if (f.incoterms.length && !f.incoterms.includes(termino)) return false
  if (f.ofertas.length && !f.ofertas.includes(oferta)) return false
  return true
}

/* Texto de búsqueda de un producto: todos los valores de texto del proveedor y del producto */
function textoProducto(prov, p) {
  const partes = [prov.nombre, prov.sector, prov.ubicacion, prov.contacto]
  for (const [k, v] of Object.entries(p)) {
    if (k === 'precios') continue
    if (typeof v === 'string') partes.push(v)
    else if (Array.isArray(v) && v.every(x => typeof x === 'string')) partes.push(...v)
  }
  return partes.filter(Boolean).join(' ').toLowerCase()
}

/* ─── Opciones de la barra de filtros (siempre sobre el JSON completo) ─────── */
function getOpciones(data) {
  const proveedores = Array.isArray(data?.proveedores) ? data.proveedores : []
  const provSet = new Set()
  const sectorCount = {}
  const catCount = {}
  const incoCount = {}
  const oferCount = {}
  for (const prov of proveedores) {
    provSet.add(prov.nombre || 'Proveedor sin nombre')
    const sec = normCat(prov.sector)
    if (sec) sectorCount[sec] = (sectorCount[sec] || 0) + 1
    for (const p of Array.isArray(prov.productos) ? prov.productos : []) {
      const c = normCat(p.tipo)
      if (c) catCount[c] = (catCount[c] || 0) + 1
      for (const o of Array.isArray(p.precios) ? p.precios : []) {
        if (o.termino) incoCount[o.termino] = (incoCount[o.termino] || 0) + 1
        if (o.tipo) oferCount[o.tipo] = (oferCount[o.tipo] || 0) + 1
      }
    }
  }
  const porConteo = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
  return {
    proveedores: [...provSet].sort((a, b) => a.localeCompare(b)),
    sectores: porConteo(sectorCount),
    categorias: porConteo(catCount),
    incoterms: porConteo(incoCount),
    ofertas: porConteo(oferCount),
  }
}

/* ─── Dimensiones descubiertas de los productos (atributos de texto y numéricos) ── */
function getDims(data) {
  const proveedores = Array.isArray(data?.proveedores) ? data.proveedores : []
  const strDims = new Map()
  const numDims = new Map()
  let hasCaract = false
  for (const prov of proveedores) {
    for (const p of Array.isArray(prov.productos) ? prov.productos : []) {
      for (const [k, v] of Object.entries(p)) {
        if (k === 'id' || k === 'precios') continue
        if (k === 'caracteristicas') { if (Array.isArray(v) && v.length) hasCaract = true; continue }
        if (typeof v === 'string' && v.trim()) strDims.set(k, (strDims.get(k) || 0) + 1)
        else if (typeof v === 'number' && Number.isFinite(v)) numDims.set(k, (numDims.get(k) || 0) + 1)
      }
    }
  }
  return {
    atributos: [...strDims.keys()].sort().map(k => ({ key: k, label: k.replace(/_/g, ' '), count: strDims.get(k) })),
    hasCaract,
    numDims: [...numDims.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ key: k, label: k.replace(/_/g, ' '), count: n })),
  }
}

/* ─── Pipeline de procesamiento (todo deriva del JSON en runtime) ──────────── */
function processData(data, opts = {}) {
  const proveedores = Array.isArray(data?.proveedores) ? data.proveedores : []
  const metadata = data?.metadata ?? {}
  const stats = data?.estadisticas ?? {}
  const comparativas = data?.comparativas ?? {}
  const fecha = data?.fecha_actualizacion ?? null
  const version = data?.version ?? null
  const sectoresMeta = Array.isArray(metadata.sectores_cubiertos) ? metadata.sectores_cubiertos : []

  const f = normalizarFiltro(opts.filter)
  const activo = filtroActivo(f)
  const compSel = opts.compSel ?? ''
  const numDim = opts.numDim ?? null

  // ── Banderas del formato (presencia de campos opcionales en el JSON)
  let hasOferta = false, hasIncoterm = false, hasEnvio = false, hasDestino = false
  const monedas = new Set()
  let totalProdsConOferta = 0
  for (const prov of proveedores) {
    for (const p of Array.isArray(prov.productos) ? prov.productos : []) {
      const ofs = Array.isArray(p.precios) ? p.precios : []
      if (ofs.some(o => num(o.valor) != null)) totalProdsConOferta++
      for (const o of ofs) {
        if (o.tipo) hasOferta = true
        if (o.termino) hasIncoterm = true
        if (o.incluye_envio != null) hasEnvio = true
        if (o.destino || o.destino_envio) hasDestino = true
        if (o.moneda) monedas.add(o.moneda)
      }
    }
  }
  const hasMonedaMultiple = monedas.size > 1

  // ── Colores fijos por categoría (nombre ordenado → paleta; las demás se funden en "Otros")
  const catsTodas = [...new Set(proveedores.flatMap(prov =>
    (Array.isArray(prov.productos) ? prov.productos : []).map(p => normCat(p.tipo))
  ))].filter(Boolean).sort((a, b) => a.localeCompare(b))
  const colorMap = {}
  catsTodas.forEach((c, i) => { colorMap[c] = i < SERIES.length ? SERIES[i] : COLOR_OTROS })
  const colorOf = (c) => (c && colorMap[c]) ? colorMap[c] : COLOR_OTROS

  // ── Unidad de análisis: filas de oferta (producto × oferta con precio)
  const ofertaRows = []
  const productosFiltrados = []
  const provsVisibles = new Set()
  for (const prov of proveedores) {
    const nombre = prov.nombre || 'Proveedor sin nombre'
    const sectorNorm = normCat(prov.sector)
    if (f?.sectores.length && !f.sectores.includes(sectorNorm)) continue
    const productos = Array.isArray(prov.productos) ? prov.productos : []
    if (!productos.length && !f?.q) provsVisibles.add(nombre)
    for (const p of productos) {
      const categoria = normCat(p.tipo)
      const texto = textoProducto(prov, p)
      if (!pasaBase(f, nombre, categoria, texto)) continue
      provsVisibles.add(nombre)
      productosFiltrados.push({ proveedor: nombre, producto: p, categoria, texto })
      for (const o of Array.isArray(p.precios) ? p.precios : []) {
        const precio = num(o.valor)
        if (precio == null) continue
        if (!pasaOferta(f, o.termino ?? null, o.tipo ?? null)) continue
        ofertaRows.push({
          proveedor: nombre,
          sector: sectorNorm,
          producto: p,
          categoria,
          nombreProd: p.nombre ?? p.modelo ?? p.especificaciones ?? (categoria ?? 'Producto'),
          moneda: o.moneda ?? null,
          precio,
          termino: o.termino ?? null,
          oferta: o.tipo ?? null,
          incluye_envio: o.incluye_envio ?? null,
          destino: o.destino ?? o.destino_envio ?? null,
          numVal: numDim && typeof p[numDim] === 'number' && Number.isFinite(p[numDim]) ? p[numDim] : null,
        })
      }
    }
  }
  if (!activo) proveedores.forEach(p => provsVisibles.add(p.nombre || 'Proveedor sin nombre'))

  // ── Distribución por categoría (productos, con o sin precio)
  const categoriasDist = {}
  let totalProductosFilt = 0
  for (const { categoria } of productosFiltrados) {
    if (!categoria) continue
    categoriasDist[categoria] = (categoriasDist[categoria] || 0) + 1
    totalProductosFilt++
  }

  // ── KPIs: base desde metadata; precios desde estadisticas por convención de prefijos
  const totalProv = num(metadata.total_proveedores) ?? proveedores.length
  const totalMensajes = num(metadata.total_mensajes)
  const provsConDatos = new Set(ofertaRows.map(r => r.proveedor)).size
  const conPrecio = activo ? provsConDatos : (num(stats.proveedores_con_precio) ?? provsConDatos)
  const sinPrecio = activo ? null : num(stats.proveedores_sin_precio)
  const basePct = activo ? provsVisibles.size : totalProv
  const pctConPrecio = basePct ? (conPrecio / basePct) * 100 : null

  const sufijoDe = (k, prefijo) => {
    const m = String(k).match(new RegExp('^' + prefijo + '_(.+)$'))
    return m ? m[1] : null
  }
  const sufijosPrecio = [...new Set(
    Object.keys(stats).map(k => sufijoDe(k, 'precio_minimo')).filter(s => s && num(stats['precio_maximo_' + s]) != null)
  )].sort()
  const promSufijos = Object.keys(stats).map(k => sufijoDe(k, 'precio_promedio')).filter(Boolean).sort()

  const minSel = ofertaRows.length ? ofertaRows.reduce((a, b) => (b.precio < a.precio ? b : a)) : null
  const maxSel = ofertaRows.length ? ofertaRows.reduce((a, b) => (b.precio > a.precio ? b : a)) : null
  const promSel = ofertaRows.length ? ofertaRows.reduce((s, r) => s + r.precio, 0) / ofertaRows.length : null
  const etiquetaSel = activo ? 'selección' : 'general'

  const kpis = [
    { label: 'Proveedores contactados', value: fmtNum(totalProv), sub: activo ? `${provsVisibles.size} con datos en la selección` : `${proveedores.length} con ficha en el JSON`, icon: '📊', color: '#2563eb' },
  ]
  if (totalMensajes != null) {
    kpis.push({ label: 'Mensajes intercambiados', value: fmtNum(totalMensajes), sub: 'dato global del JSON', icon: '💬', color: '#0891b2' })
  }
  kpis.push({ label: activo ? 'Ofertas en la selección' : 'Productos con precio', value: fmtNum(activo ? ofertaRows.length : (num(metadata.total_productos_con_precio) ?? totalProdsConOferta)), sub: activo ? `${provsConDatos} proveedores · ${new Set(ofertaRows.map(r => r.producto)).size} productos` : `${provsConDatos} proveedores con precio`, icon: '🏷️', color: '#0d9488' })
  kpis.push({ label: 'Proveedores con precio', value: fmtNum(conPrecio), sub: `${fmtPct(pctConPrecio)} ${activo ? 'de la selección' : 'del total contactado'}${sinPrecio != null ? ' · ' + sinPrecio + ' sin precio' : ''}`, icon: '💵', color: '#7c3aed' })

  if (activo || !sufijosPrecio.length) {
    // Recalculado de la selección (o de todos los datos si no hay estadísticas)
    if (minSel) kpis.push({ label: `Precio mín. (${etiquetaSel})`, value: fmtPrecio(minSel.precio, minSel.moneda), sub: `${shortNombre(minSel.proveedor)} · ${minSel.termino ?? '—'}`, icon: '📉', color: '#16a34a' })
    if (promSel != null) kpis.push({ label: `Precio prom. (${etiquetaSel})`, value: fmtPrecio(promSel, null), sub: 'promedio de las ofertas', icon: '📈', color: '#d97706' })
    if (maxSel) kpis.push({ label: `Precio máx. (${etiquetaSel})`, value: fmtPrecio(maxSel.precio, maxSel.moneda), sub: `${shortNombre(maxSel.proveedor)} · ${maxSel.termino ?? '—'}`, icon: '🔺', color: '#dc2626' })
  } else {
    // Tarjetas dinámicas desde estadisticas: precio_minimo_X / precio_maximo_X (hasta 2 pares)
    for (const s of sufijosPrecio.slice(0, 2)) {
      const et = s.replace(/_/g, ' ')
      kpis.push({ label: `Precio mín. ${et}`, value: fmtUSD(num(stats['precio_minimo_' + s])), sub: 'según estadísticas del JSON', icon: '📉', color: '#16a34a' })
      kpis.push({ label: `Precio máx. ${et}`, value: fmtUSD(num(stats['precio_maximo_' + s])), sub: 'según estadísticas del JSON', icon: '🔺', color: '#dc2626' })
    }
    if (promSufijos.length && kpis.length < 8) {
      const s = promSufijos[0]
      kpis.push({ label: `Precio prom. ${s.replace(/_/g, ' ')}`, value: fmtUSD(num(stats['precio_promedio_' + s])), sub: 'según estadísticas del JSON', icon: '📈', color: '#d97706' })
    }
  }

  // ── Comparativa de precios (todas las comparativas del JSON, seleccionables)
  const compKeys = Object.keys(comparativas)
  let compRows = []
  if (compSel && Array.isArray(comparativas[compSel])) {
    compRows = comparativas[compSel]
      .filter(c => num(c.precio) != null)
      .map(c => ({
        proveedor: String(c.proveedor ?? ''),
        nombre: `${shortNombre(c.proveedor)} — ${c.producto ? shortNombre(c.producto) : primerTermino(c.termino)}`,
        precio: num(c.precio),
        termino: c.termino ?? null,
        categoria: normCat(c.tipo) ?? null,
        oferta: null,
        nota: c.nota ?? c.unidad ?? null,
      }))
      .filter(r => (!f || ((!f.proveedor || r.proveedor.toLowerCase().includes(f.proveedor.toLowerCase()) || f.proveedor.toLowerCase().includes(r.proveedor.toLowerCase())) && (!f.q || r.proveedor.toLowerCase().includes(f.q)) && pasaOferta(f, r.termino, r.oferta))))
      .sort((a, b) => a.precio - b.precio)
  } else {
    compRows = ofertaRows
      .map(r => ({
        proveedor: r.proveedor,
        nombre: `${shortNombre(r.proveedor)} — ${primerTermino(r.termino)}${hasOferta && r.oferta ? ' · ' + r.oferta : ''}`,
        precio: r.precio,
        termino: r.termino,
        categoria: r.categoria,
        oferta: r.oferta,
        nota: null,
      }))
      .sort((a, b) => a.precio - b.precio)
  }

  // ── Scatter: precio vs atributo numérico (mejor oferta por producto)
  const byProd = new Map()
  for (const r of ofertaRows) {
    if (r.numVal == null) continue
    const prev = byProd.get(r.producto)
    if (!prev || r.precio < prev.precio) byProd.set(r.producto, r)
  }
  const scatterRows = [...byProd.values()].map(r => ({
    proveedor: r.proveedor,
    nombre: shortNombre(r.proveedor),
    producto: r.nombreProd,
    categoria: r.categoria,
    dimVal: r.numVal,
    precio: r.precio,
    termino: r.termino,
  }))

  // Jitter determinístico solo para puntos superpuestos (misma X, precios casi iguales)
  const clusters = {}
  for (const r of scatterRows) {
    const key = r.dimVal + '|' + Math.round(r.precio / 160)
    ;(clusters[key] = clusters[key] || []).push(r)
  }
  const OFFSETS = [0, -0.15, 0.15, -0.08, 0.08, -0.22, 0.22]
  for (const key in clusters) {
    const g = clusters[key]
    if (g.length > 1) g.forEach((r, i) => { r.x = r.dimVal + OFFSETS[i % OFFSETS.length] })
    else g[0].x = g[0].dimVal
  }

  // ── Donut por categoría (más de 8 categorías se funden en "Otros")
  const pieData = Object.entries(categoriasDist)
    .map(([name, value]) => ({ name, value, color: colorOf(name), fusion: colorOf(name) === COLOR_OTROS }))
    .sort((a, b) => (SERIES.indexOf(a.color) - SERIES.indexOf(b.color)) || a.name.localeCompare(b.name))
  const pieDataFinal = []
  for (const d of pieData) {
    if (d.fusion) {
      const otros = pieDataFinal.find(x => x.name === 'Otros')
      if (otros) otros.value += d.value
      else pieDataFinal.push({ name: 'Otros', value: d.value, color: COLOR_OTROS })
    } else {
      pieDataFinal.push(d)
    }
  }
  const totalProductos = Object.values(categoriasDist).reduce((a, b) => a + b, 0)
  for (const d of pieDataFinal) d.pct = totalProductos ? Math.round((d.value / totalProductos) * 100) : 0

  // ── Ofertas agrupadas por categoría (tabla del módulo 5)
  const catOfertas = {}
  for (const r of ofertaRows) {
    const c = r.categoria ?? 'Sin tipo'
    ;(catOfertas[c] = catOfertas[c] || []).push(r)
  }
  const catOpciones = Object.entries(catOfertas)
    .map(([name, rows]) => ({ name, count: rows.length }))
    .sort((a, b) => b.count - a.count)

  // ── Estado de proveedores (nivel proveedor)
  const agenteKey = Object.keys(stats).find(k => k.startsWith('proveedores_con_agente_en_'))
  const agentes = agenteKey && Array.isArray(stats[agenteKey]) ? stats[agenteKey].map(String) : []
  const paisAgente = agenteKey ? agenteKey.replace('proveedores_con_agente_en_', '') : null
  const agenteL = agentes.map(a => a.toLowerCase())
  const statusRows = proveedores
    .filter(prov => provsVisibles.has(prov.nombre || 'Proveedor sin nombre'))
    .map(prov => {
      const productos = Array.isArray(prov.productos) ? prov.productos : []
      const nombreL = String(prov.nombre ?? '').toLowerCase()
      const agente = agenteL.some(a => a && (nombreL.includes(a) || a.includes(nombreL)))
      const cats = [...new Set(productos.map(p => normCat(p.tipo)).filter(Boolean))]
      return {
        nombre: prov.nombre || 'Proveedor sin nombre',
        productos: productos.length,
        tienePrecio: productos.some(p => Array.isArray(p.precios) && p.precios.some(o => num(o.valor) != null)),
        categorias: cats.slice(0, 2).join(', ') + (cats.length > 2 ? `, +${cats.length - 2}` : ''),
        agente,
        ubicacion: prov.ubicacion ?? null,
        contacto: prov.contacto ?? null,
      }
    })
    .sort((a, b) => (b.agente - a.agente) || (b.tienePrecio - a.tienePrecio) || a.nombre.localeCompare(b.nombre))

  // ── Explorador: ofertas agrupadas por proveedor
  const porProveedor = {}
  for (const r of ofertaRows) {
    ;(porProveedor[r.proveedor] = porProveedor[r.proveedor] || []).push(r)
  }
  const explorer = {}
  for (const nombre in porProveedor) {
    const filas = porProveedor[nombre].sort((a, b) => a.precio - b.precio)
    const prov = proveedores.find(p => (p.nombre || 'Proveedor sin nombre') === nombre)
    const sinPrecioProv = prov ? (Array.isArray(prov.productos) ? prov.productos : []).length - new Set(filas.map(r => r.producto)).size : 0
    explorer[nombre] = {
      nombre,
      filas,
      productos: new Set(filas.map(r => r.producto)).size,
      sinPrecio: sinPrecioProv,
      min: filas[0]?.precio ?? null,
      max: filas[filas.length - 1]?.precio ?? null,
      incoterms: [...new Set(filas.map(r => r.termino).filter(Boolean))],
      destinos: [...new Set(filas.map(r => r.destino).filter(Boolean))],
      envio: filas.filter(r => r.incluye_envio).length,
    }
  }

  // ── Resumen ejecutivo (ítems condicionales según el formato y la selección)
  const mejorAbs = [...ofertaRows].sort((a, b) => a.precio - b.precio)[0] ?? null
  const brecha = minSel && maxSel && minSel.precio > 0 && maxSel.precio > minSel.precio ? ((maxSel.precio - minSel.precio) / minSel.precio) * 100 : null
  const porIncoterm = {}
  for (const r of ofertaRows) {
    if (!r.termino) continue
    if (porIncoterm[r.termino] == null || r.precio < porIncoterm[r.termino]) porIncoterm[r.termino] = r.precio
  }
  const topIncoterms = Object.entries(porIncoterm).sort((a, b) => a[1] - b[1]).slice(0, 3)
  const topCategorias = [...catOpciones].slice(0, 3)
  const topRelacion = numDim ? [...scatterRows]
    .filter(r => r.dimVal > 0)
    .map(r => ({ ...r, ratio: r.precio / r.dimVal }))
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 3) : []

  const resumenItems = []
  resumenItems.push({
    t: 'Mejor precio absoluto',
    v: mejorAbs ? `${fmtPrecio(mejorAbs.precio, mejorAbs.moneda)} ofrecido por ${mejorAbs.proveedor} (${mejorAbs.termino || '—'})` : 'N/D',
  })
  if (hasIncoterm && topIncoterms.length) {
    resumenItems.push({ t: 'Mejores precios por incoterm', v: topIncoterms.map(([t, p]) => `${t}: ${fmtUSD(p)}`).join(' · ') })
  }
  if (brecha != null) resumenItems.push({ t: 'Brecha entre precio mínimo y máximo', v: fmtPct(brecha) })
  resumenItems.push({ t: 'Proveedores con precio confirmado', v: `${conPrecio} de ${basePct} (${fmtPct(pctConPrecio)})` })
  if (topCategorias.length) {
    resumenItems.push({ t: 'Categorías con más ofertas', v: topCategorias.map(c => `${c.name}: ${c.count}`).join(' · ') })
  }
  if (agentes.length) {
    resumenItems.push({
      t: 'Presencia local',
      v: `${agentes.length} proveedor(es) con agente en ${paisAgente || 'el país'}: ${agentes.join(', ')}`,
    })
  }
  if (numDim && topRelacion.length) {
    resumenItems.push({
      t: `Mejor relación precio/${numDim.replace(/_/g, ' ')}`,
      v: topRelacion.map(r => `${r.nombre} (${fmtUSD(r.precio)} ÷ ${r.dimVal} = ${fmtUSD(r.ratio)})`).join(' · '),
    })
  }

  return {
    proveedores, fecha, version, sectoresMeta, activo,
    kpis, colores: colorMap, colorOf,
    nResultados: { provs: provsVisibles.size, productos: totalProductosFilt, ofertas: ofertaRows.length },
    compKeys, compRows,
    compLegend: [...new Set(compRows.map(r => r.categoria).filter(Boolean))].map(c => ({ name: c, color: colorOf(c) })),
    pieData: pieDataFinal, totalProductos,
    productosFiltrados,
    catOfertas, catOpciones,
    statusRows, agentes, paisAgente,
    scatterRows,
    scatterLegend: [...new Set(scatterRows.map(r => r.categoria).filter(Boolean))].map(c => ({ name: c, color: colorOf(c) })),
    explorer,
    hasOferta, hasIncoterm, hasEnvio, hasDestino, hasMonedaMultiple,
    resumenItems,
  }
}

/* ─── Piezas de UI ─────────────────────────────────────────────────────────── */
function BiCardHead({ n, title, sub }) {
  return (
    <div className="bi-card-header">
      <span className="bi-card-num">{n}</span>
      <div style={{ minWidth: 0 }}>
        <div className="bi-card-title">{title}</div>
        {sub ? <div className="bi-card-sub">{sub}</div> : null}
      </div>
    </div>
  )
}

function BiEmpty({ text = 'Sin datos con los filtros actuales' }) {
  return <div className="dash-empty">{text}</div>
}

function BiLegend({ items, onToggle, activos }) {
  if (!items.length) return null
  return (
    <div className="bi-legend">
      {items.map(it => {
        const toggleable = it.toggleable !== false && it.name !== 'Otros'
        const off = onToggle && toggleable && activos && activos.length > 0 && !activos.includes(it.name)
        const cls = 'bi-legend-item' + (onToggle && toggleable ? ' bi-legend-item-click' : '') + (off ? ' off' : '')
        return (
          <span
            key={it.name}
            className={cls}
            onClick={onToggle && toggleable ? () => onToggle(it.name) : undefined}
            title={onToggle && toggleable ? 'Clic para filtrar por esta categoría' : undefined}
          >
            <span className="bi-legend-swatch" style={{ background: off ? '#cbd5e1' : it.color }} />
            {it.name}{it.value != null ? ' · ' + it.value : ''}
          </span>
        )
      })}
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
      {r.categoria ? <div className="bi-tip-row"><span>Categoría</span><b>{r.categoria}</b></div> : null}
      {r.oferta ? <div className="bi-tip-row"><span>Oferta</span><b>{r.oferta}</b></div> : null}
      {r.nota ? <div className="bi-tip-row"><span>Nota</span><b>{r.nota}</b></div> : null}
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

function TipAtributo({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bi-tip">
      <div className="bi-tip-title">{payload[0].payload.label}</div>
      <div className="bi-tip-row"><span>Productos</span><b>{payload[0].value}</b></div>
    </div>
  )
}

function TipScatter({ active, payload, dimLabel }) {
  if (!active || !payload?.length) return null
  const r = payload[0].payload
  return (
    <div className="bi-tip">
      <div className="bi-tip-title">{r.proveedor}</div>
      <div className="bi-tip-row"><span>Producto</span><b>{r.producto || '—'}</b></div>
      <div className="bi-tip-row"><span>{dimLabel}</span><b>{r.dimVal}</b></div>
      <div className="bi-tip-row"><span>Precio</span><b>{fmtUSD(r.precio)}</b></div>
      <div className="bi-tip-row"><span>Incoterm</span><b>{r.termino || '—'}</b></div>
      {r.categoria ? <div className="bi-tip-row"><span>Categoría</span><b>{r.categoria}</b></div> : null}
    </div>
  )
}

const BarLabel = ({ x, y, width, height, value }) => (
  <text x={x + width + 6} y={y + height / 2} dominantBaseline="middle" fill="#0a1628" fontSize={11} fontWeight={600}>
    {fmtUSD(value)}
  </text>
)

const DotShape = ({ cx, cy, payload }) => (
  <circle cx={cx} cy={cy} r={5} fill={payload.color} stroke="#fff" strokeWidth={2} style={{ cursor: 'pointer' }} />
)

const ThSort = ({ label, k, sort, onSort }) => (
  <th className="bi-sort-th" onClick={() => onSort(k)}>
    {label}{sort.key === k ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
  </th>
)

/* ─── Barra de filtros ─────────────────────────────────────────────────────── */
function FilterBar({ filters, setFilters, opciones, model }) {
  const toggleList = (key, val) =>
    setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }))
  const colorOf = (b) => model.colores[b] ?? COLOR_OTROS
  const n = model.nResultados

  const ChipGroup = ({ label, items, keyF, conSwatch }) => (
    <div className="bi-filter-row">
      <span className="bi-filter-label">{label}</span>
      {items.map(it => (
        <button
          key={it.name}
          className={'bi-chip bi-chip-toggle' + (filters[keyF].includes(it.name) ? ' on' : '')}
          onClick={() => toggleList(keyF, it.name)}
          title={`Clic para filtrar: ${it.name}`}
        >
          {conSwatch ? <span className="bi-legend-swatch" style={{ background: filters[keyF].includes(it.name) ? '#fff' : colorOf(it.name) }} /> : null}
          {it.name} · {it.count}
        </button>
      ))}
    </div>
  )

  return (
    <div className="bi-filters">
      <div className="bi-filter-row">
        <span className="bi-filter-label">Buscar</span>
        <input
          className="bi-input"
          placeholder="proveedor, producto, atributo…"
          value={filters.q}
          onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
        />
        <span className="bi-filter-label">Proveedor</span>
        <select
          className="bi-select"
          value={filters.proveedor}
          onChange={(e) => setFilters(f => ({ ...f, proveedor: e.target.value }))}
        >
          <option value="">Todos</option>
          {opciones.proveedores.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="bi-filter-results">
          <span><b>{n.provs}</b> proveedores · <b>{n.productos}</b> productos · <b>{n.ofertas}</b> ofertas</span>
          {filters.proveedor ? (
            <button className="bi-fixed-chip" onClick={() => setFilters(f => ({ ...f, proveedor: '' }))} title="Quitar filtro de proveedor">
              ✕ Fijado: {shortNombre(filters.proveedor)}
            </button>
          ) : null}
          <button className="sol-btn-cancel" onClick={() => setFilters(FILTRO_VACIO)}>Limpiar filtros</button>
        </div>
      </div>
      {opciones.sectores.length ? <ChipGroup label="Sector" items={opciones.sectores} keyF="sectores" /> : null}
      <ChipGroup label="Categoría" items={opciones.categorias} keyF="categorias" conSwatch />
      {opciones.incoterms.length ? <ChipGroup label="Incoterm" items={opciones.incoterms} keyF="incoterms" /> : null}
      {opciones.ofertas.length ? <ChipGroup label="Oferta" items={opciones.ofertas} keyF="ofertas" /> : null}
    </div>
  )
}

/* ─── Pantalla de carga del JSON ───────────────────────────────────────────── */
function LoadScreen({ raw, setRaw, error, onProcess, onFile, onClear }) {
  return (
    <div className="dash-page">
      <div className="dash-welcome">
        <div>
          <h1 className="dash-welcome-title">Inteligencia de Proveedores</h1>
          <p className="dash-welcome-sub">Dashboard analítico de inteligencia de proveedores</p>
        </div>
      </div>

      <div className="bi-load-card">
        <div className="bi-load-title">Cargar JSON de inteligencia</div>
        <p className="bi-load-sub">
          Adjunta o pega el JSON de inteligencia de proveedores. La página lo procesa y genera el dashboard
          automáticamente, sea cual sea el rubro. El JSON se guarda en este navegador.
        </p>

        <label className="bi-drop-zone">
          <input type="file" accept=".json,application/json" onChange={onFile} />
          📄 Clic para seleccionar el archivo .json
        </label>

        <textarea
          className="bi-textarea"
          placeholder={'{\n  "version": "1.0",\n  "fecha_actualizacion": "2026-08-14",\n  "metadata": { ... },\n  "proveedores": [\n    {\n      "nombre": "...", "sector": "...",\n      "productos": [\n        { "tipo": "...", "precios": [ { "tipo": "ESTANDAR", "valor": 100, "moneda": "USD", "termino": "FOB" } ] }\n      ]\n    }\n  ],\n  "comparativas": { "nombre": [ { "proveedor": "...", "precio": 100, "termino": "FOB", "tipo": "..." } ] },\n  "estadisticas": { "precio_minimo_x": ..., "precio_maximo_x": ... }\n}'}
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
          Formato general: proveedores[] con productos[] y precios[] · comparativas opcionales · estadisticas opcionales.
          El dashboard descubre categorías, atributos y métricas a partir del propio JSON.
        </p>
      </div>
    </div>
  )
}

/* ─── Vista del dashboard ──────────────────────────────────────────────────── */
function DashboardView({ data, fileName, onReload }) {
  const [filters, setFilters] = useState(FILTRO_VACIO)
  const [compSel, setCompSel] = useState('')
  const [dimSel, setDimSel] = useState('')
  const [numDimSel, setNumDimSel] = useState('')
  const [catSel, setCatSel] = useState('')
  const [sortCat, setSortCat] = useState({ key: 'precio', dir: 1 })

  const opciones = useMemo(() => getOpciones(data), [data])
  const dims = useMemo(() => getDims(data), [data])

  const numDim = numDimSel || dims.numDims[0]?.key || null
  const opts = useMemo(() => ({ filter: filters, compSel, numDim }), [filters, compSel, numDim])
  const model = useMemo(() => processData(data, opts), [data, opts])
  // Modelo para el explorador: ignora el filtro de proveedor para poder navegar entre todos
  const modelExpl = useMemo(
    () => (filters.proveedor ? processData(data, { ...opts, filter: { ...filters, proveedor: '' } }) : model),
    [data, opts, filters, model]
  )

  const colorOf = model.colorOf
  const { kpis, compRows, compLegend, pieData, totalProductos, catOfertas, catOpciones, statusRows, scatterRows, scatterLegend, explorer, resumenItems } = model

  const toggleList = (key, val) =>
    setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }))

  /* Resuelve el nombre completo del proveedor (las comparativas usan nombres cortos) */
  const buscarProveedor = (nombre) => {
    if (!nombre) return ''
    const exact = opciones.proveedores.find(p => p === nombre)
    if (exact) return exact
    const nl = nombre.toLowerCase()
    const pref = opciones.proveedores.find(p => p.toLowerCase().startsWith(nl))
    if (pref) return pref
    return opciones.proveedores.find(p => p.toLowerCase().includes(nl) || nl.includes(p.toLowerCase())) ?? ''
  }
  /* Clic en un proveedor (barra, fila o punto): lo fija o lo suelta */
  const clicProveedor = (nombre) => {
    const full = buscarProveedor(nombre)
    if (!full) return
    setFilters(f => ({ ...f, proveedor: f.proveedor === full ? '' : full }))
  }

  // ── Módulo 4: distribución por atributo
  const dimOpciones = [
    ...dims.atributos,
    ...(dims.hasCaract ? [{ key: 'caracteristicas', label: 'Características', count: 0 }] : []),
  ]
  const dim = dimOpciones.find(d => d.key === dimSel)?.key ?? (dimOpciones.find(d => d.key === 'tipo')?.key ?? dimOpciones[0]?.key ?? '')
  const distAtributo = useMemo(() => {
    if (!dim) return []
    const counts = {}
    for (const { producto } of model.productosFiltrados) {
      let vals = []
      if (dim === 'caracteristicas') vals = Array.isArray(producto.caracteristicas) ? producto.caracteristicas : []
      else {
        const v = producto[dim]
        if (typeof v === 'string') vals = [v]
      }
      for (const v of vals) {
        const nv = normCat(v)
        if (nv) counts[nv] = (counts[nv] || 0) + 1
      }
    }
    return Object.entries(counts).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 15)
  }, [model.productosFiltrados, dim])

  // ── Módulo 5: ofertas por categoría (ordenable)
  const catSelEff = catOpciones.find(o => o.name === catSel) ? catSel : (catOpciones[0]?.name ?? '')
  const catRows = useMemo(() => {
    const rows = catOfertas[catSelEff] ?? []
    const { key, dir } = sortCat
    return [...rows].sort((a, b) => {
      const va = key === 'precio' ? a.precio : (key === 'nombreProd' ? a.nombreProd : a.proveedor)
      const vb = key === 'precio' ? b.precio : (key === 'nombreProd' ? b.nombreProd : b.proveedor)
      const r = (typeof va === 'number' && typeof vb === 'number') ? va - vb : String(va ?? '').localeCompare(String(vb ?? ''))
      return r * dir
    })
  }, [catOfertas, catSelEff, sortCat])
  const catMin = catRows.length ? Math.min(...catRows.map(r => r.precio)) : null
  const catMax = catRows.length ? Math.max(...catRows.map(r => r.precio)) : null

  // ── Explorador
  const expOpciones = Object.keys(modelExpl.explorer).sort((a, b) => a.localeCompare(b))
  const expOpcionesFull = (filters.proveedor && !expOpciones.includes(filters.proveedor)) ? [filters.proveedor, ...expOpciones] : expOpciones
  const provSel = filters.proveedor || expOpciones[0] || ''
  const exp = provSel ? modelExpl.explorer[provSel] : null

  // ── Scatter: ejes
  const scatterPrecios = scatterRows.map(r => r.precio)
  const scatterMin = Math.min(...scatterPrecios), scatterMax = Math.max(...scatterPrecios)
  const padY = Math.max(1, (scatterMax - scatterMin) * 0.1)
  const dimVals = [...new Set(scatterRows.map(r => r.dimVal))].sort((a, b) => a - b)
  const dimLabel = numDim ? numDim.replace(/_/g, ' ') : ''

  return (
    <div className="dash-page">

      {/* Encabezado */}
      <div className="dash-welcome">
        <div>
          <h1 className="dash-welcome-title">Inteligencia de Proveedores</h1>
          <p className="dash-welcome-sub">Análisis generado a partir del JSON cargado · interactivo: clic en barras, sectores, puntos y filas para filtrar</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="bi-chip bi-chip-navy">Actualizado: {model.fecha || 'N/D'}</span>
          {model.sectoresMeta.map(s => <span key={s} className="bi-chip">{s}</span>)}
          {fileName ? <span className="bi-chip">📄 {fileName}</span> : null}
          <button className="sol-btn-cancel" onClick={onReload}>Cargar otro JSON</button>
        </div>
      </div>

      {/* Barra de filtros */}
      <FilterBar filters={filters} setFilters={setFilters} opciones={opciones} model={model} />

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

      {/* 2 ── Comparativa de precios */}
      <div className="bi-card" style={{ marginBottom: 20 }}>
        <BiCardHead
          n={2}
          title="Comparativa de precios"
          sub="Selecciona una comparativa del JSON o todas las ofertas · ordenadas de menor a mayor · clic en una barra para fijar el proveedor"
        />
        <div className="bi-exp-panel" style={{ marginTop: 6, marginBottom: 8 }}>
          <span className="bi-filter-label">Comparativa</span>
          <select className="bi-select" value={compSel} onChange={(e) => setCompSel(e.target.value)}>
            <option value="">Auto: todas las ofertas</option>
            {model.compKeys.map(k => <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        {compRows.length ? (
          <>
            <div style={{ height: Math.max(220, compRows.length * 30 + 50) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compRows} layout="vertical" margin={{ top: 4, right: 92, bottom: 4, left: 0 }}>
                  <CartesianGrid horizontal={false} stroke="#eee" strokeWidth={1} />
                  <XAxis
                    type="number"
                    domain={[0, (dataMax) => dataMax * 1.15]}
                    tickFormatter={fmtUSD}
                    tickLine={false}
                    axisLine={{ stroke: '#eee' }}
                    tick={{ fontSize: 11, fill: '#aaa' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    width={200}
                    tickLine={false}
                    axisLine={{ stroke: '#eee' }}
                    tick={{ fontSize: 11, fill: '#888' }}
                  />
                  <Tooltip content={<TipBar />} cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }} />
                  <Bar
                    dataKey="precio" barSize={16} radius={[0, 4, 4, 0]}
                    animationDuration={400}
                    onClick={(d) => clicProveedor(d?.payload?.proveedor ?? d?.proveedor)}
                  >
                    {compRows.map(r => <Cell key={r.nombre + r.precio} fill={colorOf(r.categoria)} cursor="pointer" />)}
                    <LabelList dataKey="precio" content={<BarLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <BiLegend items={compLegend} onToggle={(t) => toggleList('categorias', t)} activos={filters.categorias} />
          </>
        ) : <BiEmpty />}
      </div>

      {/* 3 ── Donut por categoría */}
      <div className="bi-grid">
        <div className="bi-card">
          <BiCardHead n={3} title="Distribución por categoría" sub="Productos catalogados por tipo · clic en un sector o en la leyenda para filtrar" />
          {pieData.length ? (
            <>
              <div style={{ position: 'relative', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData} dataKey="value" nameKey="name"
                      innerRadius="60%" outerRadius="86%" paddingAngle={2}
                      stroke="#fff" strokeWidth={2}
                      animationDuration={400}
                      onClick={(d) => toggleList('categorias', d?.name ?? d?.payload?.name)}
                    >
                      {pieData.map(d => <Cell key={d.name} fill={d.color} cursor="pointer" />)}
                    </Pie>
                    <Tooltip content={<TipPie />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#111', lineHeight: 1 }}>{totalProductos}</div>
                  <div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-dm)' }}>productos</div>
                </div>
              </div>
              <BiLegend items={pieData.map(d => ({ name: d.name, color: d.color, value: `${d.value} · ${d.pct}%` }))} onToggle={(t) => toggleList('categorias', t)} activos={filters.categorias} />
            </>
          ) : <BiEmpty />}
        </div>

        {/* 4 ── Distribución por atributo */}
        <div className="bi-card">
          <BiCardHead n={4} title="Distribución por atributo" sub="Agrupa los productos por cualquier atributo del JSON (se ignoran valores vacíos) · clic en una barra para buscarlo" />
          <div className="bi-exp-panel" style={{ marginTop: 6, marginBottom: 8 }}>
            <span className="bi-filter-label">Atributo</span>
            <select className="bi-select" value={dim} onChange={(e) => setDimSel(e.target.value)}>
              {dimOpciones.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
          </div>
          {distAtributo.length ? (
            <div style={{ height: Math.max(200, distAtributo.length * 32 + 30) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distAtributo} layout="vertical" margin={{ top: 4, right: 34, bottom: 4, left: 0 }}>
                  <CartesianGrid horizontal={false} stroke="#eee" strokeWidth={1} />
                  <XAxis
                    type="number" allowDecimals={false}
                    tickLine={false} axisLine={{ stroke: '#eee' }}
                    tick={{ fontSize: 11, fill: '#aaa' }}
                  />
                  <YAxis
                    type="category" dataKey="label" width={140}
                    tickLine={false} axisLine={{ stroke: '#eee' }}
                    tick={{ fontSize: 11, fill: '#888' }}
                  />
                  <Tooltip content={<TipAtributo />} cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }} />
                  <Bar
                    dataKey="count" fill="#2a78d6" barSize={14} radius={[0, 4, 4, 0]}
                    animationDuration={400} cursor="pointer"
                    onClick={(d) => {
                      const l = d?.payload?.label ?? d?.label
                      if (l) setFilters(f => ({ ...f, q: f.q === l ? '' : l }))
                    }}
                  >
                    <LabelList dataKey="count" position="right" fill="#0a1628" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <BiEmpty text="Este atributo no tiene valores en los datos actuales" />}
        </div>
      </div>

      {/* 5 ── Ofertas por categoría */}
      <div className="bi-stack">
        <div className="bi-card">
          <BiCardHead
            n={5}
            title="Ofertas por categoría"
            sub="Elige una categoría y estudia sus ofertas · encabezados clicables para ordenar · fila verde = mínimo · fila roja = máximo"
          />
          <div className="bi-exp-panel" style={{ marginTop: 6, marginBottom: 8 }}>
            <span className="bi-filter-label">Categoría</span>
            <select className="bi-select" value={catSelEff} onChange={(e) => setCatSel(e.target.value)}>
              {catOpciones.map(o => <option key={o.name} value={o.name}>{o.name} · {o.count}</option>)}
            </select>
          </div>
          {catRows.length ? (
            <div className="bi-table-wrap">
              <table className="bi-table">
                <thead>
                  <tr>
                    <ThSort label="Proveedor" k="proveedor" sort={sortCat} onSort={(k) => setSortCat(s => (s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 }))} />
                    <ThSort label="Producto" k="nombreProd" sort={sortCat} onSort={(k) => setSortCat(s => (s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 }))} />
                    {model.hasOferta ? <th>Oferta</th> : null}
                    <ThSort label="Precio" k="precio" sort={sortCat} onSort={(k) => setSortCat(s => (s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 }))} />
                    {model.hasIncoterm ? <th>Incoterm</th> : null}
                    {model.hasEnvio ? <th className="bi-th-center">Envío incluido</th> : null}
                    {model.hasDestino ? <th>Destino</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {catRows.map((r, i) => {
                    const esMinF = catRows.length > 1 && catMin !== catMax && r.precio === catMin
                    const esMaxF = catRows.length > 1 && catMin !== catMax && r.precio === catMax
                    return (
                      <tr key={r.proveedor + r.nombreProd + r.oferta + r.termino + i}
                          className={(esMinF ? 'bi-row-min' : esMaxF ? 'bi-row-max' : '') + ' bi-row-click'}
                          onClick={() => clicProveedor(r.proveedor)}
                          title={`${r.proveedor} · ${r.nombreProd}${r.oferta ? ' · ' + r.oferta : ''} · clic para fijar`}>
                        <td className="bi-prov">
                          {r.proveedor}
                          {esMinF ? <span className="bi-chip bi-badge-min" style={{ marginLeft: 8 }}>Mín</span> : null}
                          {esMaxF ? <span className="bi-chip bi-badge-max" style={{ marginLeft: 8 }}>Máx</span> : null}
                        </td>
                        <td>{r.nombreProd}</td>
                        {model.hasOferta ? <td>{r.oferta || '—'}</td> : null}
                        <td className="bi-num" style={{ fontWeight: 600 }}>{fmtPrecio(r.precio, model.hasMonedaMultiple ? r.moneda : null)}</td>
                        {model.hasIncoterm ? <td>{r.termino || 'N/D'}</td> : null}
                        {model.hasEnvio ? <td style={{ textAlign: 'center' }}>{r.incluye_envio ? '✅' : '—'}</td> : null}
                        {model.hasDestino ? <td style={{ color: 'var(--steel)' }}>{r.destino || 'N/D'}</td> : null}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : <BiEmpty />}
        </div>
      </div>

      {/* 6 ── Estado de proveedores */}
      <div className="bi-stack">
        <div className="bi-card">
          <BiCardHead n={6} title="Estado de proveedores" sub="Fila verde = proveedor con agente local · ✅ = sí · ❌ = no · clic en una fila para fijar el proveedor" />
          {statusRows.length ? (
            <div className="bi-table-wrap">
              <table className="bi-table">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th className="bi-th-center">Productos</th>
                    <th className="bi-th-center">Con precio</th>
                    <th>Categorías</th>
                    {agentesPresentes(model) ? <th className="bi-th-center">Agente local</th> : null}
                    <th>Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  {statusRows.map(r => (
                    <tr key={r.nombre} className={(r.agente ? 'bi-row-agente' : '') + ' bi-row-click'}
                        onClick={() => clicProveedor(r.nombre)}
                        title={`${r.nombre}${r.contacto ? ' · Contacto: ' + r.contacto : ''}${r.agente && model.paisAgente ? ' · Agente en ' + model.paisAgente : ''} · clic para fijar`}>
                      <td className="bi-prov">{r.nombre}</td>
                      <td style={{ textAlign: 'center' }}>{r.productos}</td>
                      <td style={{ textAlign: 'center' }}>{r.tienePrecio ? '✅' : '❌'}</td>
                      <td style={{ color: 'var(--steel)' }}>{r.categorias || '—'}</td>
                      {agentesPresentes(model) ? <td style={{ textAlign: 'center' }}>{r.agente ? '✅' : '❌'}</td> : null}
                      <td style={{ color: 'var(--steel)' }}>{r.ubicacion || 'N/D'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <BiEmpty />}
        </div>
      </div>

      {/* 7 ── Ofertas por proveedor (explorador) */}
      <div className="bi-stack">
        <div className="bi-card">
          <BiCardHead
            n={7}
            title="Ofertas por proveedor"
            sub="Estudia en detalle las ofertas de un proveedor: cambia el fijado desde aquí o con clic en cualquier gráfico, tabla o punto del dashboard"
          />
          <div className="bi-exp-panel">
            <span className="bi-filter-label">Proveedor destacado</span>
            <select
              className="bi-select"
              value={provSel}
              onChange={(e) => setFilters(f => ({ ...f, proveedor: e.target.value }))}
            >
              <option value="">— elige un proveedor —</option>
              {expOpcionesFull.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {filters.proveedor ? (
              <button className="bi-fixed-chip" onClick={() => setFilters(f => ({ ...f, proveedor: '' }))} title="Soltar el proveedor fijado">
                ✕ Soltar fijado
              </button>
            ) : null}
            {exp ? (
              <div className="bi-exp-stats">
                <span className="bi-exp-stat"><b>{exp.filas.length}</b> ofertas con precio</span>
                <span className="bi-exp-stat"><b>{exp.productos}</b> productos con precio{exp.sinPrecio > 0 ? ` · ${exp.sinPrecio} sin precio` : ''}</span>
                <span className="bi-exp-stat">rango <b>{fmtUSD(exp.min)} – {fmtUSD(exp.max)}</b></span>
                {model.hasEnvio ? <span className="bi-exp-stat">envío incluido en <b>{exp.envio}</b> ofertas</span> : null}
                {model.hasIncoterm && exp.incoterms.length ? <span className="bi-exp-stat">incoterms: <b>{exp.incoterms.join(', ')}</b></span> : null}
                {model.hasDestino && exp.destinos.length ? <span className="bi-exp-stat">destinos: <b>{exp.destinos.join(', ')}</b></span> : null}
              </div>
            ) : null}
          </div>

          {exp ? (
            <div className="bi-table-wrap">
              <table className="bi-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    {model.hasOferta ? <th>Oferta</th> : null}
                    <th>Precio</th>
                    {model.hasIncoterm ? <th>Incoterm</th> : null}
                    {model.hasEnvio ? <th className="bi-th-center">Envío incluido</th> : null}
                    {model.hasDestino ? <th>Destino</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {exp.filas.map((r, i) => {
                    const esMinF = exp.filas.length > 1 && r.precio === exp.min
                    const esMaxF = exp.filas.length > 1 && r.precio === exp.max
                    return (
                      <tr key={r.nombreProd + r.oferta + r.termino + i}
                          className={esMinF ? 'bi-row-min' : esMaxF ? 'bi-row-max' : undefined}
                          title={`${r.proveedor} · ${r.nombreProd}${r.oferta ? ' · ' + r.oferta : ''}`}>
                        <td className="bi-prov">{r.nombreProd}</td>
                        <td>{r.categoria || '—'}</td>
                        {model.hasOferta ? <td>{r.oferta || '—'}</td> : null}
                        <td className="bi-num" style={{ fontWeight: 600 }}>{fmtPrecio(r.precio, model.hasMonedaMultiple ? r.moneda : null)}</td>
                        {model.hasIncoterm ? <td>{r.termino || 'N/D'}</td> : null}
                        {model.hasEnvio ? <td style={{ textAlign: 'center' }}>{r.incluye_envio ? '✅' : '—'}</td> : null}
                        {model.hasDestino ? <td style={{ color: 'var(--steel)' }}>{r.destino || 'N/D'}</td> : null}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : <BiEmpty text="No hay ofertas con los filtros actuales" />}
        </div>
      </div>

      {/* 8 ── Scatter precio vs atributo numérico */}
      <div className="bi-stack">
        <div className="bi-card">
          <BiCardHead
            n={8}
            title="Precio vs atributo numérico"
            sub="Cada punto es un producto con precio · clic en un punto para fijar el proveedor · pasar el cursor para detalles"
          />
          {dims.numDims.length ? (
            <>
              <div className="bi-exp-panel" style={{ marginTop: 6, marginBottom: 8 }}>
                <span className="bi-filter-label">Atributo numérico (eje X)</span>
                <select className="bi-select" value={numDim || ''} onChange={(e) => setNumDimSel(e.target.value)}>
                  {dims.numDims.map(d => <option key={d.key} value={d.key}>{d.label} · {d.count}</option>)}
                </select>
              </div>
              {scatterRows.length ? (
                <>
                  <div style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 8, right: 28, bottom: 12, left: 8 }}>
                        <CartesianGrid stroke="#eee" strokeWidth={1} />
                        <XAxis
                          type="number" dataKey="x" name={dimLabel}
                          domain={[Math.min(...dimVals) - 0.5, Math.max(...dimVals) + 0.5]}
                          ticks={dimVals.length <= 8 ? dimVals : undefined}
                          tickLine={false} axisLine={{ stroke: '#eee' }}
                          tick={{ fontSize: 11, fill: '#aaa' }}
                        />
                        <YAxis
                          type="number" dataKey="precio" name="Precio"
                          domain={[scatterMin - padY, scatterMax + padY]}
                          tickFormatter={fmtUSD} width={72}
                          tickLine={false} axisLine={{ stroke: '#eee' }}
                          tick={{ fontSize: 11, fill: '#aaa' }}
                        />
                        <Tooltip content={<TipScatter dimLabel={dimLabel} />} cursor={{ stroke: '#aaa', strokeDasharray: '3 3' }} />
                        <Scatter
                          data={scatterRows} shape={<DotShape />}
                          animationDuration={400}
                          onClick={(d) => clicProveedor(d?.payload?.proveedor ?? d?.proveedor)}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <BiLegend items={scatterLegend} onToggle={(t) => toggleList('categorias', t)} activos={filters.categorias} />
                </>
              ) : <BiEmpty text="Sin productos con precio y valor en este atributo" />}
            </>
          ) : <BiEmpty text="El JSON no tiene atributos numéricos en los productos" />}
        </div>
      </div>

      {/* 9 ── Resumen ejecutivo */}
      <div className="bi-stack">
        <div className="bi-summary">
          <div className="bi-summary-title">9 · Resumen ejecutivo{model.activo ? ' — sobre la selección actual' : ''}</div>
          <div className="bi-summary-grid">
            {resumenItems.map(it => (
              <div key={it.t} className="bi-summary-item">
                <span>▸</span>
                <span>{it.t}: <span className="bi-acc">{it.v}</span></span>
              </div>
            ))}
          </div>
          <div className="bi-summary-foot">
            Datos actualizados al {model.fecha || 'N/D'}{model.version ? ' · v' + model.version : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

function agentesPresentes(model) {
  return model.agentes.length > 0
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
