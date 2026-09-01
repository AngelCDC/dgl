// RUTA TEMPORAL de diagnóstico: corre SOLO el layout (sin render) y reporta
// qué nodos del árbol tienen coordenadas de box corruptas. Se elimina al final.
import { NextResponse } from 'next/server'
import { createElement } from 'react'
import FontStore from '@react-pdf/font'
import layoutDocument from '@react-pdf/layout'
import fs from 'fs'
import path from 'path'
import { ContratoPDF } from '../../components/ContratoPDF'
import { testData } from '../pdf-data'

const CN_FONT = 'SimHei'
const CJK_RE = /[　-〿぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/
const CJK_RUN_RE = /[　-〿㐀-䶿一-鿿豈-﫿＀-￯]|[^　-〿㐀-䶿一-鿿豈-﫿＀-￯]+/g

const CORRUPT_LIMIT = 1e21

function summarize(node) {
  return {
    type: node.type,
    box: node.box,
    borders: Object.keys(node.style || {}).filter((k) => k.startsWith('border') || k.includes('radius')),
    styleKeys: Object.keys(node.style || {}).length,
    fixed: !!node.style?.fixed,
    position: node.style?.position,
  }
}

function findCorrupt(node, pathArr, out) {
  if (!node || typeof node !== 'object') return
  const box = node.box
  if (box && typeof box === 'object') {
    const bad = []
    for (const k of ['top', 'left', 'width', 'height']) {
      const v = box[k]
      if (typeof v === 'number' && (!Number.isFinite(v) || Math.abs(v) >= CORRUPT_LIMIT)) {
        bad.push(`${k}=${v}`)
      }
    }
    if (bad.length > 0) {
      out.push({ path: [...pathArr, node.type].join(' > '), bad, ...summarize(node) })
    }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) findCorrupt(child, [...pathArr, node.type], out)
  }
}

export async function GET() {
  try {
    const fontStore = new FontStore()
    const fontPath = path.join(process.cwd(), 'fonts', 'simhei.ttf')
    if (fs.existsSync(fontPath)) {
      fontStore.register({
        family: CN_FONT,
        fonts: [
          { src: fontPath, fontWeight: 'normal' },
          { src: fontPath, fontWeight: 'bold' },
        ],
      })
    }
    fontStore.registerHyphenationCallback((word, fallback) => {
      if (!word || typeof word !== 'string') return [word]
      if (!CJK_RE.test(word)) return (fallback || ((w) => [w]))(word)
      return word.match(CJK_RUN_RE) || [word]
    })

    const element = createElement(ContratoPDF, { data: testData })
    const layout = await layoutDocument(element, fontStore)

    const corrupt = []
    findCorrupt(layout, [], corrupt)

    // Estadística general del árbol
    let nodes = 0
    let withBox = 0
    const countNodes = (n) => {
      if (!n || typeof n !== 'object') return
      nodes++
      if (n.box && typeof n.box === 'object') withBox++
      if (Array.isArray(n.children)) n.children.forEach(countNodes)
    }
    countNodes(layout)

    return NextResponse.json({ ok: true, nodes, withBox, corruptCount: corrupt.length, corrupt }, { status: 200 })
  } catch (error) {
    console.error('Error PDF diag:', error)
    return NextResponse.json({ ok: false, error: String(error && error.message), stack: String(error && error.stack).split('\n').slice(0, 30) }, { status: 500 })
  }
}
