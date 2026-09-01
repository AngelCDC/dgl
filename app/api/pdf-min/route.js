// RUTA TEMPORAL de bisectado: PDF mínimo con texto CJK. Se elimina al final.
import { NextResponse } from 'next/server'
import { Document, Font, Page, Text, renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import fs from 'fs'
import path from 'path'

const fontPath = path.join(process.cwd(), 'fonts', 'simhei.ttf')
if (fs.existsSync(fontPath)) {
  Font.register({ family: 'SimHei', fonts: [
    { src: fontPath, fontWeight: 'normal' },
    { src: fontPath, fontWeight: 'bold' },
  ] })
}

const CJK_RE = /[　-〿぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/
const CJK_RUN_RE = /[　-〿㐀-䶿一-鿿豈-﫿＀-￯]|[^　-〿㐀-䶿一-鿿豈-﫿＀-￯]+/g
Font.registerHyphenationCallback((word, fallback) => {
  if (!word || typeof word !== 'string') return [word]
  if (!CJK_RE.test(word)) return (fallback || ((w) => [w]))(word)
  return word.match(CJK_RUN_RE) || [word]
})

export async function GET() {
  try {
    const doc = createElement(
      Document,
      null,
      createElement(
        Page,
        { size: 'A4' },
        createElement(Text, { style: { fontFamily: 'SimHei', fontSize: 10 } }, '本协议由买方与供方就双方约定规格项下产品的生产及/或销售事宜订立，内容涵盖规格、价格、付款、生产、检验、保证及其他相关商业与法律条款。'),
        createElement(Text, { style: { fontSize: 10 } }, 'This Agreement is entered into by and between the Buyer and the Supplier for the manufacture and/or sale of products.'),
      ),
    )
    const buffer = await renderToBuffer(doc)
    return new NextResponse(buffer, { status: 200, headers: { 'Content-Type': 'application/pdf' } })
  } catch (error) {
    console.error('Error PDF min:', error)
    return NextResponse.json({ error: String(error && error.message), stack: String(error && error.stack).split('\n').slice(0, 30) }, { status: 500 })
  }
}
