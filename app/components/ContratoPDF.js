// components/ContratoPDF.js — International Purchase Agreement (EN / 中文 bilingual)
// Formato legal tradicional: Times, texto justificado, sin branding corporativo.
// Cada cláusula fija del cuerpo principal se presenta en inglés y, debajo,
// su traducción al chino, para dar al documento validez formal ante la
// contraparte china (供方). Los campos de datos libres (nombres, direcciones,
// leyes aplicables, etc.) se muestran tal como el usuario los capturó — ver
// nota sobre alcance de la traducción al final del archivo.
import fs from "fs";
import path from "path";
import {
  Document,
  Font,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const INK = "#000000";

// ─── Fuente para caracteres chinos ────────────────────────────────────────────
// Times-Roman/Times-Bold no incluyen glifos CJK; se registra SimHei (chino
// simplificado) y se usa para cualquier bloque que contenga texto chino
// (incluidas ahora las traducciones fijas de cada cláusula).
//
// NOTA (ver observaciones): SimHei es una fuente propiedad de Microsoft.
// Para un documento legal que se distribuye a un tercero, se recomienda
// sustituirla por una fuente CJK de licencia libre (p.ej. Noto Serif SC,
// SIL OFL) para evitar cualquier duda de licenciamiento al incrustarla en
// el PDF generado. El código queda preparado para el cambio: basta con
// apuntar `fontPath` al archivo .ttf de la fuente elegida.
const CN_FONT = "SimHei";
let CN_FONT_READY = false;
try {
  // 1) Filesystem (funciona en local; en Vercel serverless normalmente NO
  //    porque archivos sueltos fuera del tracing de Next no se empaquetan).
  const fontPath = path.join(process.cwd(), "fonts", "simhei.ttf");
  if (fs.existsSync(fontPath)) {
    Font.register({
      family: CN_FONT,
      fonts: [
        { src: fontPath, fontWeight: "normal" },
        { src: fontPath, fontWeight: "bold" },
      ],
    });
    CN_FONT_READY = true;
  } else if (process.env.SIMHEI_FONT_URL) {
    // 2) Fallback para serverless: sirve el .ttf desde /public y registra
    //    por URL absoluta (react-pdf lo descarga en tiempo de render).
    //    Define SIMHEI_FONT_URL, p.ej. https://dgl-henna.vercel.app/fonts/simhei.ttf
    Font.register({
      family: CN_FONT,
      fonts: [
        { src: process.env.SIMHEI_FONT_URL, fontWeight: "normal" },
        { src: process.env.SIMHEI_FONT_URL, fontWeight: "bold" },
      ],
    });
    CN_FONT_READY = true;
  } else {
    console.error(
      `SimHei font not found at ${fontPath} and no SIMHEI_FONT_URL env var set — Chinese text will be rendered with a font lacking CJK glyphs, which crashes react-pdf's layout engine (Yoga) with "unsupported number".`
    );
  }
} catch (e) {
  console.error("SimHei font not registered (Chinese text may not render):", e.message);
}

// Detecta ideogramas CJK / caracteres de ancho completo (chino simplificado)
const CJK_RE = /[　-〿぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/;
const pickFont = (texto, fallback) =>
  texto && CJK_RE.test(String(texto)) ? CN_FONT : fallback;

// ─── Ajuste de línea para CJK ─────────────────────────────────────────────────
// React-pdf solo rompe líneas en espacios en blanco. El chino no usa espacios
// entre caracteres, así que un párrafo chino entero se trata como "una sola
// palabra": no puede envolver y se sale del margen derecho de la página.
//
// Primer intento: insertar un espacio de ancho cero (U+200B) entre cada
// carácter CJK. Se revirtió — SimHei (y muchas fuentes CJK) no traen glifo
// para U+200B, así que al medir su ancho el motor de layout (Yoga) obtiene
// NaN/Infinity y falla con "unsupported number: -9.4...e+21".
//
// Fix correcto: un hyphenationCallback global. Esto le dice a react-pdf en
// qué puntos puede partir una "palabra" SIN insertar ningún carácter nuevo
// en el texto — para CJK, parte en cada carácter; para todo lo demás, se
// comporta igual que antes (la palabra no se toca). `zws()` se deja como
// función identidad para no tener que revertir cada punto de llamada.
// Defensivo: si la versión de @react-pdf/renderer instalada en el entorno
// de despliegue no expone registerHyphenationCallback (o cambia de firma),
// esto NO debe tumbar todo el endpoint de generación de PDF — solo se pierde
// el ajuste de línea óptimo para CJK, el documento se sigue generando.
try {
  if (typeof Font.registerHyphenationCallback === "function") {
    Font.registerHyphenationCallback((word) => {
      if (CJK_RE.test(word)) {
        return word.split("");
      }
      return [word];
    });
  } else {
    console.error(
      "Font.registerHyphenationCallback no está disponible en esta versión de @react-pdf/renderer — el ajuste de línea para chino puede salirse del margen."
    );
  }
} catch (e) {
  console.error("No se pudo registrar el hyphenationCallback para CJK:", e.message);
}
const zws = (texto) => texto;

// Texto que cambia automáticamente a la fuente china si contiene caracteres
// CJK, y en ese caso también inserta los espacios de ancho cero necesarios
// para que la línea pueda partirse dentro del contenedor.
const CNText = ({ children, fallback = "Times-Roman", style }) => {
  const isCJK = children && CJK_RE.test(String(children));
  return (
    <Text style={[{ fontFamily: isCJK ? CN_FONT : fallback }, style]}>
      {isCJK ? zws(children) : children}
    </Text>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: INK,
    // NO lineHeight aquí — ver nota junto a `para`/`zhPara` más abajo.
  },
  pageLandscape: {
    backgroundColor: "#ffffff",
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: INK,
    // NO lineHeight aquí — ver nota junto a `para`/`zhPara` más abajo.
  },

  // ── Cabecera del documento ──
  docTitle: {
    fontSize: 15,
    fontFamily: "Times-Bold",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 2,
  },
  docTitleZh: {
    fontSize: 12,
    fontFamily: CN_FONT,
    textAlign: "center",
    marginBottom: 6,
  },
  docMeta: {
    fontSize: 9.5,
    textAlign: "center",
    marginBottom: 8,
  },
  titleRule: {
    borderBottom: `0.75pt solid ${INK}`,
    marginBottom: 14,
  },

  // ── Párrafos ──
  // `lineHeight` se pone AQUÍ (en el nodo de texto), no en <Page> — un bug
  // abierto en @react-pdf/renderer (issue #3452) hace que, en documentos de
  // 10+ páginas con un pie de página `fixed` + `render(pageNumber/totalPages)`
  // (como el nuestro), el lineHeight puesto a nivel de Page se multiplique
  // sobre sí mismo en cada pasada de paginación hasta desbordar el rango
  // numérico válido de PDF — eso es lo que producía "unsupported number:
  // -9.44...e+21". Sin lineHeight en Page, ese camino de recálculo no se
  // dispara.
  para: {
    textAlign: "justify",
    marginBottom: 8,
    lineHeight: 1.6,
  },
  paraIndent: {
    textAlign: "justify",
    marginBottom: 8,
    marginLeft: 28,
    lineHeight: 1.6,
  },
  // Bloque bilingüe: párrafo EN seguido del párrafo ZH, con un filete
  // izquierdo delgado que marca visualmente "esto es la traducción".
  zhBlock: {
    borderLeft: `0.75pt solid ${INK}`,
    paddingLeft: 8,
    marginLeft: 1,
    marginBottom: 8,
  },
  zhBlockIndent: {
    borderLeft: `0.75pt solid ${INK}`,
    paddingLeft: 8,
    marginLeft: 29,
    marginBottom: 8,
  },
  zhPara: {
    fontFamily: CN_FONT,
    fontSize: 9.5,
    // "left" en vez de "justify": con un punto de ruptura después de cada
    // carácter (ver zws), justificar distribuiría espacio extra entre cada
    // ideograma y se vería desigual — no es así como se justifica el chino.
    textAlign: "left",
    lineHeight: 1.6,
  },
  whereHeading: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    textAlign: "center",
    letterSpacing: 3,
    marginTop: 10,
    marginBottom: 2,
  },
  whereHeadingZh: {
    fontSize: 10,
    fontFamily: CN_FONT,
    textAlign: "center",
    marginBottom: 8,
  },
  leadIn: { textAlign: "justify", marginBottom: 4, lineHeight: 1.6 },

  // ── Artículos ──
  article: { marginTop: 12, marginBottom: 4 },
  articleTitle: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  articleTitleZh: {
    fontSize: 10,
    fontFamily: CN_FONT,
    textAlign: "center",
    marginBottom: 6,
  },

  // ── Fields inline ──
  labeled: { textAlign: "justify", marginBottom: 2, lineHeight: 1.6 },
  labeledZh: { textAlign: "justify", marginBottom: 8, fontFamily: CN_FONT, fontSize: 9.5, lineHeight: 1.6 },

  // ── Tablas ──
  table: {
    border: `0.5pt solid ${INK}`,
    marginTop: 6,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#efefef",
    borderBottom: `0.5pt solid ${INK}`,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Times-Bold",
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  tableHeaderCellZh: {
    fontSize: 8,
    fontFamily: CN_FONT,
    textAlign: "center",
    paddingHorizontal: 5,
    paddingBottom: 3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `0.5pt solid ${INK}`,
  },
  tableRowLast: { flexDirection: "row" },
  tableCell: {
    fontSize: 9,
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderRight: `0.5pt solid ${INK}`,
  },
  tableCellLast: {
    fontSize: 9,
    paddingVertical: 4,
    paddingHorizontal: 5,
  },

  // Cols tabla de productos (portrait, ancho útil ~483)
  cProduct: { width: 128 },
  cSpec:    { flex: 1 },
  cQty:     { width: 52, textAlign: "center" },
  cPrice:   { width: 78, textAlign: "right" },
  cTotal:   { width: 88, textAlign: "right" },

  // Cols tabla de pagos
  cConcepto: { flex: 1 },
  cPct:      { width: 64, textAlign: "center" },
  cMonto:    { width: 92, textAlign: "right" },

  totalLine: {
    textAlign: "right",
    fontSize: 10,
    fontFamily: "Times-Bold",
    marginBottom: 8,
  },

  // ── Notices ──
  noticesRow: { flexDirection: "row", gap: 16, marginBottom: 8 },
  noticeBox: {
    flex: 1,
    border: `0.5pt solid ${INK}`,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  noticeTitle: {
    fontSize: 9.5,
    fontFamily: "Times-Bold",
    textAlign: "center",
    marginBottom: 1,
  },
  noticeTitleZh: {
    fontSize: 9,
    fontFamily: CN_FONT,
    textAlign: "center",
    marginBottom: 4,
  },
  noticeLine: { fontSize: 9, marginBottom: 2, lineHeight: 1.4 },

  // ── Firmas ──
  witness: { textAlign: "justify", marginTop: 14, marginBottom: 2, lineHeight: 1.6 },
  witnessZh: { textAlign: "justify", fontFamily: CN_FONT, fontSize: 9.5, marginBottom: 10, lineHeight: 1.6 },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingHorizontal: 10,
  },
  signatureBox: { width: "42%", textAlign: "center" },
  signatureFor: { fontSize: 9, fontFamily: "Times-Bold", textAlign: "center", marginBottom: 1 },
  signatureForZh: { fontSize: 8.5, fontFamily: CN_FONT, textAlign: "center", marginBottom: 24 },
  signatureLine: { borderBottom: `0.5pt solid ${INK}`, marginBottom: 4, marginTop: 8 },
  signatureParty: { fontSize: 9.5, fontFamily: "Times-Bold", textAlign: "center", marginBottom: 2 },
  signatureMeta: { fontSize: 9, textAlign: "center", marginTop: 2 },
  signatureMetaZh: { fontSize: 8, fontFamily: CN_FONT, textAlign: "center", marginTop: 1, color: "#333333" },

  // ── Anexos ──
  annexTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  annexTitleZh: {
    fontSize: 10.5,
    fontFamily: CN_FONT,
    textAlign: "center",
    marginBottom: 4,
  },
  annexSub: {
    fontSize: 9,
    textAlign: "center",
    marginBottom: 12,
  },

  bulletList: { marginLeft: 20, marginBottom: 6 },
  bullet: { fontSize: 9.5, marginBottom: 2, textAlign: "justify", lineHeight: 1.4 },

  checklistRow: { flexDirection: "row", marginBottom: 2 },
  checklistMark: { width: 24, fontSize: 9.5, fontFamily: "Times-Bold" },
  checklistItem: { flex: 1, fontSize: 9.5, lineHeight: 1.4 },

  // Cols Annex B (landscape, ancho útil ~762)
  cB1:  { width: 68 },
  cB2:  { width: 108 },
  cB3:  { width: 44, textAlign: "center" },
  cB4:  { width: 62, textAlign: "right" },
  cB5:  { width: 72, textAlign: "right" },
  cB6:  { width: 52, textAlign: "center" },
  cB7:  { width: 74 },
  cB8:  { width: 74 },
  cB9:  { width: 52, textAlign: "center" },
  cB10: { width: 78 },
  cB11: { width: 48, textAlign: "center" },

  // ── Pie de página ──
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `0.5pt solid ${INK}`,
    paddingTop: 4,
  },
  footerText: { fontSize: 8, fontFamily: "Times-Roman" },
});

// ─── Textos fijos EN (cláusulas del formato base — no se guardan en BD) ──────
const FIXED_TEXT_EN = {
  summary: 'This Agreement is entered into by and between the Buyer and the Supplier for the manufacture and/or sale of products under agreed specifications, pricing, payment, production, inspection, warranty, and related commercial and legal terms.',
  recital1: 'the Buyer wishes to purchase certain products manufactured and/or supplied by the Supplier, in accordance with the technical specifications, commercial terms and other conditions set forth in this Agreement and its Annexes; and',
  recital2: 'the Supplier has agreed to manufacture and/or supply such products to the Buyer, subject to the terms and conditions hereinafter set forth.',
  therefore: 'NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:',
  parties: 'Each Party represents and warrants that it has the legal capacity and full corporate power and authority to enter into this Agreement and to perform its obligations hereunder, and that the person(s) executing this Agreement on its behalf are duly authorized to do so.',
  purpose: 'The Supplier agrees to manufacture and/or sell, and the Buyer agrees to purchase, the products described in this Agreement, the applicable Proforma Invoice (PI), and the Technical Specifications. The Supplier shall supply strictly in accordance with the agreed specifications, quantities, quality, packaging, delivery terms, and Annexes.',
  products: 'Detailed specifications are set forth in Annex A. The Supplier shall not make material changes to the specifications, materials, components or production processes without the Buyer’s prior written approval.',
  quality: 'The Products must comply with the agreed specifications, be new, unused and free from defects, comply with the applicable technical standards and certifications, match the approved samples, drawings and datasheets, and be suitable for the intended commercial use. Any deviation requires the prior written approval of the Buyer.',
  price: 'The Price includes all costs to be borne by the Supplier under the agreed Incoterm, unless otherwise stated. No price increase shall be made after confirmation of the order without the Buyer’s prior written consent.',
  payment: 'Final payment shall become due after completion of production, successful inspection, confirmation of compliance, receipt of the required documentation, and readiness for shipment. Payments shall be made only to the bank account of the registered Supplier legal entity, unless otherwise approved in writing by the Buyer.',
  production: 'The Supplier shall promptly notify the Buyer of any anticipated delay and shall not materially delay production or delivery without the Buyer’s prior written approval.',
  inspection: 'The Buyer may conduct a pre-shipment inspection by the Buyer, a third-party inspector, an authorized representative, or a mutually agreed party. The scope may include quantity, dimensions, weight, appearance, materials, functionality, performance, packaging, labeling, accessories, documentation, and compliance with technical specifications. The Supplier shall provide reasonable access for inspection. A failed inspection shall not constitute acceptance. Details are set forth in Annex C.',
  nonConforming: 'In the event of non-conforming Products, the Buyer may, at its option: require repair or rework, require replacement, require a partial refund, reject the Products, or require a full refund in the case of material non-conformity. The Supplier shall bear the reasonable related costs, including rework, replacement and transportation costs, for defects attributable to the Supplier.',
  packaging: 'The Supplier shall package the Products in accordance with the agreed specifications, suitable for international transport and protected against impact, moisture, corrosion, dust, compression, and normal handling. Packages shall include the required shipping marks and product and shipping information.',
  shipping: 'The Supplier shall provide the documents required under the transaction and the agreed Incoterm, including, as applicable: Commercial Invoice, Packing List, Bill of Lading/Sea Waybill, Certificate of Origin, Certificate of Conformity, Test Reports, Warranty Certificate, Technical Datasheet, User Manual, MSDS/SDS, UN38.3, export documentation, Inspection Certificate, and other reasonably required documents. Draft shipping documents shall be provided for review when applicable. See Annex D.',
  warranty: 'The warranty covers defects arising from manufacturing, materials, workmanship, components, and non-compliance with specifications. It excludes misuse, unauthorized modification, improper installation, or causes outside the Supplier’s control, unless otherwise agreed. Remedies: repair, replacement, or appropriate refund.',
  warrantyClaim: 'The Buyer shall notify the Supplier of a warranty claim with supporting evidence. The Supplier shall respond within {RESPONSE} business days and shall propose corrective action within {CORRECTIVE} business days.',
  delay: 'In the event of delay, the Supplier shall pay liquidated damages at the rate of {PCT}% of the value of the delayed goods per {PERIOD}, up to a maximum of {CAP}% of the value of the affected goods. If the delay exceeds {DAYS} calendar days, the Buyer may terminate the affected portion of this Agreement and request a refund for undelivered goods, subject to the dispute provisions hereof.',
  changeLocation: 'The Supplier shall not transfer production to another factory, subcontractor or location without the Buyer’s prior written approval. Any unauthorized transfer shall constitute a material breach of this Agreement.',
  subcontracting: 'The Supplier shall remain responsible for quality, specifications, delivery and performance regardless of any subcontracting, and shall obtain the Buyer’s prior written approval for any material subcontracting.',
  ip: 'Drawings, designs, specifications, artwork, molds, tooling, packaging designs and technical information supplied or paid for by the Buyer shall remain the property of the Buyer unless otherwise agreed. The Supplier shall not misuse, transfer, use for unauthorized manufacturing, or disclose related confidential information.',
  confidentiality: 'Each Party shall keep confidential all non-public commercial, technical, financial and business information of the other Party. Disclosure shall only be permitted with written authorization, under legal requirement, or to the extent necessary to perform this Agreement.',
  nonCircumvention: 'Where the Buyer acts as sourcing agent, intermediary or representative, the Supplier shall not intentionally circumvent the Buyer with respect to customers introduced by the Buyer in order to avoid the Buyer’s involvement. Duration: {YEARS} years. Territory: {TERRITORY}. This provision applies only to directly introduced opportunities.',
  compliance: 'The Supplier states that the Products comply with the applicable agreed requirements and shall not knowingly infringe third-party intellectual property rights. The Supplier shall provide valid certifications and test reports for the actual supplied Products and shall not provide falsified, altered, expired or misleading documentation.',
  forceMajeure: 'Neither Party shall be liable for non-performance caused by events beyond its reasonable control, including natural disasters, war, government restrictions, and embargoes. The affected Party shall notify the other Party promptly and provide evidence. Force majeure shall not automatically excuse obligations arising prior to the event.',
  termination: 'The Buyer may terminate this Agreement for material breach, late delivery without agreed extension, materially non-conforming Products, false or fraudulent documentation, unauthorized change of manufacturing location, insolvency or cessation of business, or repeated non-compliance. The Buyer may request refunds for undelivered or rejected goods, subject to applicable law and the dispute provisions hereof.',
  governingLaw: 'This Agreement shall be governed by and construed in accordance with: {LAW}. The choice of governing law shall not prevent either Party from seeking interim or protective measures where legally available.',
  dispute: 'Disputes shall first be resolved through good-faith negotiation. If a dispute remains unresolved within {DAYS} calendar days, it shall be submitted to {INSTITUTION}. Seat of proceedings: {SEAT}. Language: {LANG}. The decision or award shall be final and binding to the extent permitted by law.',
  language: 'This Agreement may be executed in English, Chinese, or English and Chinese. In the event of any inconsistency, the controlling language shall be: {CONTROLLING}.',
  electronic: 'Electronic signatures and digital records may be used as evidence to the extent permitted by law. Platform order, payment and transaction records may be incorporated by express reference.',
  entire: 'This Agreement, together with the PI, PO, Technical Specifications, Inspection Protocol and the Annexes expressly incorporated herein, constitutes the entire agreement between the Parties. Amendments shall be made in writing and approved by the authorized representatives of both Parties.',
  annexes: 'The Annexes listed below are attached hereto and form an integral part of this Agreement: Annex A — Technical Specifications; Annex B — Commercial Terms; Annex C — Inspection and Acceptance Protocol; Annex D — Shipping Documents. In the event of any conflict between the main body of this Agreement and any Annex, the main body shall prevail, unless otherwise expressly stated.',
  noticesBoilerplate: 'All notices, requests, demands and other communications required or permitted under this Agreement shall be made in writing and delivered personally, by email, or by internationally recognized courier service to the addresses set forth above, or to such other address as a Party may designate in writing. Notices shall be deemed effective upon receipt if delivered personally or by email, or upon signature of receipt if sent by courier.',
};

// ─── Textos fijos ZH — traducción de cada cláusula anterior ──────────────────
// IMPORTANTE: esta traducción busca fidelidad de sentido jurídico general.
// Para un contrato que se firmará y podrá exigirse ante autoridades o
// tribunales chinos, se recomienda que un abogado bilingüe o traductor
// jurado revise el texto final antes de su firma (ver observaciones).
const FIXED_TEXT_ZH = {
  summary: '本协议由买方与供方就双方约定规格项下产品的生产及/或销售事宜订立，内容涵盖规格、价格、付款、生产、检验、保证及其他相关商业与法律条款。',
  recital1: '买方希望根据本协议及其附件所载技术规格、商业条款及其他条件，购买由供方生产及/或供应的特定产品；及',
  recital2: '供方同意按照本协议下文所载条款及条件，向买方生产及/或供应该等产品。',
  therefore: '因此，双方兹以本协议所载相互约定及对价（其收讫及充分性于此确认）为约因，约定如下：',
  parties: '各方陈述并保证其具备签署本协议并履行本协议项下义务的合法资格及完整的公司权力与授权，且代表其签署本协议的人员已获正式授权。',
  purpose: '供方同意生产及/或销售，买方同意购买本协议、相应形式发票（PI）及技术规格中所述的产品。供方应严格按照约定的规格、数量、质量、包装、交付条件及附件供货。',
  products: '详细规格载于附件A。未经买方事先书面批准，供方不得对规格、材料、部件或生产工艺作出实质性变更。',
  quality: '产品必须符合约定规格，为全新、未使用且无缺陷，符合适用技术标准及认证要求，与经批准的样品、图纸及数据表相符，并适合预期的商业用途。任何偏差均须经买方事先书面批准。',
  price: '除另有约定外，价格包含供方在约定贸易术语项下应承担的全部费用。订单确认后，未经买方事先书面同意，不得提高价格。',
  payment: '尾款应在生产完成、检验合格、确认符合要求、收到所需单证并具备装运条件后支付。除买方另行书面批准外，付款仅可支付至已登记供方法律实体的银行账户。',
  production: '供方应及时将任何预计延误通知买方，未经买方事先书面批准，不得实质性延误生产或交付。',
  inspection: '买方可自行、委托第三方检验机构、授权代表或双方共同认可的机构进行装运前检验。检验范围可包括数量、尺寸、重量、外观、材料、功能、性能、包装、标签、附件、单证及是否符合技术规格。供方应为检验提供合理便利。检验未通过不构成验收。详情见附件C。',
  nonConforming: '如产品不符合约定，买方可自行选择：要求修理或返工、要求更换、要求部分退款、拒收产品，或在实质性不符合的情形下要求全额退款。对可归责于供方的缺陷，供方应承担相关合理费用，包括返工、更换及运输费用。',
  packaging: '供方应按约定规格包装产品，包装应适合国际运输，并能防止冲击、潮湿、腐蚀、粉尘、挤压及正常搬运造成的损坏。包装上应标注所需的运输唛头及产品与运输信息。',
  shipping: '供方应根据交易性质及约定贸易术语提供所需单证，适用时包括：商业发票、装箱单、提单/海运单、原产地证书、合格证明、测试报告、保修证书、技术数据表、用户手册、MSDS/SDS、UN38.3、出口单证、检验证书及其他合理要求的单证。适用时应提供草拟运输单证以供审核。见附件D。',
  warranty: '保修范围涵盖因制造、材料、工艺、部件及不符合规格所引起的缺陷；不包括误用、未经授权的改动、安装不当或供方无法控制之原因所致的缺陷，另有约定的除外。补救方式为：修理、更换或适当退款。',
  warrantyClaim: '买方应将保修索赔连同支持证据通知供方。供方应在{RESPONSE}个工作日内予以回应，并在{CORRECTIVE}个工作日内提出纠正措施方案。',
  delay: '如发生延误，供方应按每{PERIOD}延误货物价值的{PCT}%支付违约金，最高不超过受影响货物价值的{CAP}%。若延误超过{DAYS}个日历日，买方可在符合本协议争议解决条款的前提下，终止受影响部分的协议并要求退还未交付货物的款项。',
  changeLocation: '未经买方事先书面批准，供方不得将生产转移至其他工厂、分包商或地点。任何未经授权的转移均构成对本协议的实质性违约。',
  subcontracting: '无论是否存在分包，供方均应对质量、规格、交付及履约承担责任，并应就任何实质性分包事先获得买方书面批准。',
  ip: '由买方提供或出资的图纸、设计、规格、美术作品、模具、工装、包装设计及技术信息，除另有约定外，归买方所有。供方不得滥用、转让、用于未经授权的生产，或披露相关保密信息。',
  confidentiality: '各方应对另一方的非公开商业、技术、财务及业务信息予以保密。仅在获得书面授权、依法律要求，或为履行本协议所必需的范围内，方可披露。',
  nonCircumvention: '凡买方作为采购代理、中介或代表行事的情形，供方不得为规避买方参与而故意绕开买方引荐的客户直接进行交易。期限：{YEARS}年。适用地域：{TERRITORY}。本条款仅适用于经直接引荐产生的商业机会。',
  compliance: '供方声明产品符合适用的约定要求，并不得故意侵犯第三方知识产权。供方应就实际供应的产品提供有效的认证及测试报告，不得提供虚假、篡改、过期或误导性的单证。',
  forceMajeure: '任何一方均不对因超出其合理控制范围的事件（包括自然灾害、战争、政府限制及禁运）所致的不履行承担责任。受影响方应及时通知另一方并提供证据。不可抗力不应自动免除该事件发生前已产生的义务。',
  termination: '如发生实质性违约、无约定延期的逾期交付、产品实质性不符、虚假或欺诈性单证、未经授权变更生产地点、破产或停业，或屡次不合规，买方可终止本协议。买方可在符合适用法律及本协议争议解决条款的前提下，就未交付或被拒收的货物要求退款。',
  governingLaw: '本协议受下列法律管辖并据其解释：{LAW}。选择适用法律不影响任何一方在法律允许的情况下寻求临时或保全措施的权利。',
  dispute: '争议应首先通过友好协商解决。若争议在{DAYS}个日历日内未能解决，应提交{INSTITUTION}处理。仲裁地：{SEAT}。语言：{LANG}。在法律允许的范围内，裁决或裁定应为终局且具有约束力。',
  language: '本协议可以英文、中文，或英文和中文两种文本签署。如两种文本存在不一致，以{CONTROLLING}文本为准。',
  electronic: '在法律允许的范围内，电子签名及电子记录可作为证据使用。平台订单、付款及交易记录可通过明确引用并入本协议。',
  entire: '本协议连同形式发票（PI）、采购订单（PO）、技术规格、检验协议及本协议明确并入的各附件，构成双方之间的完整协议。修改须以书面形式作出，并经双方授权代表批准。',
  annexes: '下列附件附于本协议之后，构成本协议不可分割的一部分：附件A——技术规格；附件B——商业条款；附件C——检验及验收协议；附件D——运输单证。如本协议正文与任何附件存在冲突，除另有明确约定外，以正文为准。',
  noticesBoilerplate: '本协议项下要求或允许发出的一切通知、请求、要求及其他通信，均应以书面形式作出，并以专人递送、电子邮件或国际公认快递服务方式送达上述地址，或送达一方书面指定的其他地址。以专人递送或电子邮件方式送达的，于收悉时视为生效；以快递方式送达的，于签收回执时视为生效。',
};

// Títulos de artículo EN / ZH
const ARTICLE_TITLES_ZH = {
  1: '当事人', 2: '协议目的', 3: '产品', 4: '质量与规格', 5: '价格',
  6: '付款条件', 7: '生产与交付', 8: '检验', 9: '不合格产品', 10: '包装',
  11: '装运及单证', 12: '保修', 13: '保修索赔程序', 14: '延误与违约金',
  15: '生产地点变更', 16: '分包', 17: '知识产权与工装', 18: '保密',
  19: '不规避', 20: '合规与产品安全', 21: '不可抗力', 22: '终止',
  23: '适用法律', 24: '争议解决', 25: '语言', 26: '电子签名及电子记录',
  27: '完整协议', 28: '通知', 29: '附件', 30: '签署',
};

const ANNEX_D_DOCS = [
  'Commercial Invoice', 'Packing List', 'Bill of Lading/Sea Waybill',
  'Certificate of Origin', 'Certificate of Conformity', 'Test Report',
  'Warranty Certificate', 'Technical Datasheet', 'User Manual',
  'MSDS/SDS', 'UN38.3', 'Export Documentation', 'Inspection Certificate',
];
const ANNEX_D_DOCS_ZH = {
  'Commercial Invoice': '商业发票',
  'Packing List': '装箱单',
  'Bill of Lading/Sea Waybill': '提单/海运单',
  'Certificate of Origin': '原产地证书',
  'Certificate of Conformity': '合格证明',
  'Test Report': '测试报告',
  'Warranty Certificate': '保修证书',
  'Technical Datasheet': '技术数据表',
  'User Manual': '用户手册',
  'MSDS/SDS': '化学品安全数据表',
  'UN38.3': 'UN38.3认证',
  'Export Documentation': '出口单证',
  'Inspection Certificate': '检验证书',
};

// ─── Utilidades ───────────────────────────────────────────────────────────────
const fmtUSD = (valor) => {
  if (!valor || valor === "0") return "—";
  const n = parseFloat(String(valor).replace(/[^0-9.-]/g, ""));
  if (isNaN(n)) return valor;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
};

const fill = (texto, vars) =>
  Object.entries(vars).reduce(
    (acc, [k, v]) => acc.split(`{${k}}`).join(v || "—"),
    texto
  );

const nbsp = (s) => (s ? s : "—");

// ─── Sub-componentes ──────────────────────────────────────────────────────────
const Article = ({ number, title, children }) => (
  <View style={styles.article} wrap={false}>
    <Text style={styles.articleTitle}>ARTICLE {number} — {title}</Text>
    <Text style={styles.articleTitleZh}>{zws(`第${number}条 — ${ARTICLE_TITLES_ZH[number] || ''}`)}</Text>
    {children}
  </View>
);

const Para = ({ children }) => <Text style={styles.para}>{children}</Text>;

// Párrafo bilingüe: EN normal, ZH debajo con filete izquierdo distintivo.
// `k` es la clave dentro de FIXED_TEXT_EN / FIXED_TEXT_ZH; `vars` son las
// variables para fill() cuando la cláusula tiene placeholders {X}.
const BiPara = ({ k, vars, indent }) => {
  const en = vars ? fill(FIXED_TEXT_EN[k], vars) : FIXED_TEXT_EN[k];
  const zh = vars ? fill(FIXED_TEXT_ZH[k], vars) : FIXED_TEXT_ZH[k];
  return (
    <View wrap>
      <Text style={indent ? styles.paraIndent : styles.para}>{en}</Text>
      <View style={indent ? styles.zhBlockIndent : styles.zhBlock}>
        <Text style={styles.zhPara}>{zws(zh)}</Text>
      </View>
    </View>
  );
};

// Párrafo bilingüe de texto libre (no proviene de FIXED_TEXT, p.ej. recitales
// y cláusula de partes que combinan texto fijo con datos capturados).
// `en` puede ser un string o JSX (usar JSX cuando el párrafo en inglés puede
// contener un campo de datos en chino, para envolverlo en <CNText> — ver
// Artículo de PARTIES). `zh` se trata siempre como string y se le aplica
// zws() automáticamente aquí, así el llamador no tiene que acordarse de
// hacerlo en cada sitio.
const BiParaRaw = ({ en, zh, indent }) => (
  <View wrap>
    <Text style={indent ? styles.paraIndent : styles.para}>{en}</Text>
    <View style={indent ? styles.zhBlockIndent : styles.zhBlock}>
      <Text style={styles.zhPara}>{zws(zh)}</Text>
    </View>
  </View>
);

// Etiqueta bilingüe ("Label / 标签: value.") para campos de datos.
const BiLabeled = ({ labelEn, labelZh, children }) => (
  <View wrap={false}>
    <Text style={styles.labeled}>
      <Text style={{ fontFamily: "Times-Bold" }}>{labelEn}:</Text> <CNText>{children}</CNText>
    </Text>
    <Text style={styles.labeledZh}>
      <Text style={{ fontFamily: CN_FONT }}>{zws(labelZh)}：</Text>
      <CNText>{children}</CNText>
    </Text>
  </View>
);

// Encabezado de tabla bilingüe: dos líneas, EN arriba (Times) y ZH abajo (CN_FONT)
const BiHeaderCell = ({ en, zh, style }) => (
  <View style={[{ paddingVertical: 3 }, style]}>
    <Text style={styles.tableHeaderCell}>{en}</Text>
    <Text style={styles.tableHeaderCellZh}>{zws(zh)}</Text>
  </View>
);

// Tabla clásica con bordes — encabezados bilingües
const LegalTable = ({ header, rows, widths }) => (
  <View style={styles.table}>
    <View style={styles.tableHeader} wrap={false}>
      {header.map((h, i) => (
        <BiHeaderCell
          key={i}
          en={h.en}
          zh={h.zh}
          style={[widths[i], i !== header.length - 1 && { borderRight: `0.5pt solid ${INK}` }]}
        />
      ))}
    </View>
    {rows.map((row, ri) => (
      <View key={ri} style={ri === rows.length - 1 ? styles.tableRowLast : styles.tableRow} wrap={false}>
        {row.map((cell, ci) => (
          <Text
            key={ci}
            style={[
              ci === row.length - 1 ? styles.tableCellLast : styles.tableCell,
              widths[ci],
              pickFont(cell?.text) ? { fontFamily: CN_FONT } : null,
              cell?.bold ? { fontFamily: "Times-Bold" } : null,
            ]}
          >
            {pickFont(cell?.text) ? zws(cell?.text) : (cell?.text ?? "—")}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

const CheckList = ({ options, selected }) => (
  <View>
    {options.map((opt, i) => {
      const on = (selected || []).includes(opt);
      return (
        <View key={i} style={styles.checklistRow} wrap={false}>
          <Text style={styles.checklistMark}>{on ? "[X]" : "[ ]"}</Text>
          <Text style={styles.checklistItem}>{opt} / {zws(ANNEX_D_DOCS_ZH[opt] || '')}</Text>
        </View>
      );
    })}
  </View>
);

const BulletList = ({ items }) => (
  <View style={styles.bulletList}>
    {items.map((it, i) => (
      <Text key={i} style={styles.bullet}>- {it}</Text>
    ))}
  </View>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const ContratoPDF = ({ data }) => {
  // Falla rápido y con un mensaje legible en vez de dejar que Yoga truene
  // con "unsupported number" cuando intenta medir texto chino sin una
  // fuente CJK cargada — este documento SIEMPRE lleva chino (cláusulas
  // fijas), así que sin fuente lista no tiene sentido seguir.
  if (!CN_FONT_READY) {
    throw new Error(
      "ContratoPDF: la fuente SimHei no se pudo cargar (ni por filesystem ni por SIMHEI_FONT_URL). El documento requiere texto en chino para ser válido — revisa el registro de la fuente antes de generar el PDF."
    );
  }
  const partidas = Array.isArray(data.partidas) ? data.partidas : [];
  const pagos    = Array.isArray(data.pagos)    ? data.pagos    : [];
  const checklistC = Array.isArray(data.inspectionChecklist) ? data.inspectionChecklist : [];
  const docsD      = Array.isArray(data.annexDDocs) ? data.annexDDocs : [];

  const totalValue = data.totalContractValue ||
    String(partidas.reduce((acc, p) => {
      const t = parseFloat(String(p.total).replace(/[^0-9.-]/g, ""));
      return acc + (isNaN(t) ? 0 : t);
    }, 0).toFixed(2));

  const method = data.paymentMethod === "OTHER"
    ? data.paymentMethodOther || "Other"
    : data.paymentMethod || "—";

  // Resumen de condiciones de pago para el Annex B (derivado de los pagos del Artículo 6)
  const paymentTermsSummary = [
    method,
    pagos
      .filter(pg => pg.concepto || pg.porcentaje)
      .map(pg => `${pg.concepto || "—"}${pg.porcentaje ? ` ${pg.porcentaje}%` : ""}`)
      .join(" / "),
  ].filter(Boolean).join(" — ");

  const incoterm = data.incoterm === "OTHER"
    ? data.incotermOther || "Other"
    : data.incoterm || "—";

  const productionStart = data.productionStart === "DATE"
    ? data.productionStartDate || "—"
    : data.productionStart || "—";

  const arbLang = data.arbitrationLanguage === "OTHER"
    ? data.arbitrationLanguageOther || "Other"
    : data.arbitrationLanguage || "—";

  const inspectionStandard = data.inspectionStandard === "OTHER"
    ? data.inspectionStandardOther
    : data.inspectionStandard;

  return (
    <Document title="International Purchase Agreement">
      {/* ══ CUERPO PRINCIPAL ══ */}
      <Page size="A4" style={styles.page} wrap>

        {/* Título */}
        <Text style={styles.docTitle}>INTERNATIONAL PURCHASE AGREEMENT</Text>
        <Text style={styles.docTitleZh}>{zws('国际采购协议')}</Text>
        <Text style={styles.docMeta}>
          Date: {nbsp(data.fecha)}{data.numero ? `     ·     Contract No.: ${data.numero}` : ""}
        </Text>
        <View style={styles.titleRule} />

        {/* Partes */}
        <BiParaRaw
          en={`THIS INTERNATIONAL PURCHASE AGREEMENT (this "Agreement") is made and entered into as of the date first written above, by and between:`}
          zh={`本《国际采购协议》（"本协议"）于文首所载日期由以下各方订立：`}
        />
        <BiParaRaw
          indent
          en={
            `(1)  ${nbsp(data.buyerLegalName)}` +
            (data.buyerTradeName ? `, trading as ${data.buyerTradeName},` : ",") +
            ` a company duly organized and validly existing under the laws of ${nbsp(data.buyerCountry)}, with its registered address at ${nbsp(data.buyerAddress)}, registration number ${nbsp(data.buyerTaxId)}, represented by ${nbsp(data.buyerRepresentative)}, ${nbsp(data.buyerPosition)} (hereinafter referred to as the "Buyer"); and`
          }
          zh={
            `（一）${nbsp(data.buyerLegalName)}` +
            (data.buyerTradeName ? `（商业名称：${data.buyerTradeName}）` : "") +
            `，一家根据${nbsp(data.buyerCountry)}法律正式注册并有效存续的公司，注册地址为${nbsp(data.buyerAddress)}，注册号为${nbsp(data.buyerTaxId)}，由${nbsp(data.buyerRepresentative)}（职务：${nbsp(data.buyerPosition)}）代表（以下简称"买方"）；及`
          }
        />
        {/* Cláusula del Proveedor: el párrafo EN envuelve cada campo libre en
            <CNText> porque el nombre/dirección/representante chino puede venir
            en caracteres CJK — sin ese envoltorio, ese fragmento se dibujaría
            con la fuente Times (sin glifos CJK) y saldría corrupto. El párrafo
            ZH se arma como string plano; BiParaRaw le aplica zws() al vuelo. */}
        <View wrap>
          <Text style={styles.paraIndent}>
            (2)  <CNText>{nbsp(data.supplierLegalName)}</CNText>
            {data.supplierTradeName ? <> (<CNText>{data.supplierTradeName}</CNText>),</> : ","} a company
            duly organized and validly existing under the laws of the People's Republic of China, holding
            Unified Social Credit Code No. {nbsp(data.supplierUscc)}, with its registered address at{" "}
            <CNText>{nbsp(data.supplierAddress)}</CNText>, represented by{" "}
            <CNText>{nbsp(data.supplierLegalRepresentative)}</CNText>,{" "}
            <CNText>{nbsp(data.supplierPosition)}</CNText> (hereinafter referred to as the "Supplier").
          </Text>
          <View style={styles.zhBlockIndent}>
            <Text style={styles.zhPara}>
              {zws(
                `（二）${nbsp(data.supplierLegalName)}` +
                (data.supplierTradeName ? `（${data.supplierTradeName}）` : "") +
                `，一家根据中华人民共和国法律正式注册并有效存续的公司，统一社会信用代码为${nbsp(data.supplierUscc)}，注册地址为${nbsp(data.supplierAddress)}，由${nbsp(data.supplierLegalRepresentative)}（职务：${nbsp(data.supplierPosition)}）代表（以下简称"供方"）。`
              )}
            </Text>
          </View>
        </View>
        <Text style={styles.para}>
          The Buyer and the Supplier are hereinafter referred to individually as a "Party"
          and collectively as the "Parties".
        </Text>
        <View style={styles.zhBlock}>
          <Text style={styles.zhPara}>买方与供方以下单独称为"一方"，合称"双方"。</Text>
        </View>

        {/* Recitales */}
        <Text style={styles.whereHeading}>RECITALS</Text>
        <Text style={styles.whereHeadingZh}>{zws('鉴于条款')}</Text>
        <BiParaRaw indent en={`WHEREAS, ${FIXED_TEXT_EN.recital1}`} zh={`鉴于，${FIXED_TEXT_ZH.recital1}`} />
        <BiParaRaw indent en={`WHEREAS, ${FIXED_TEXT_EN.recital2}`} zh={`鉴于，${FIXED_TEXT_ZH.recital2}`} />
        <BiPara k="therefore" />

        {/* 1. PARTIES */}
        <Article number="1" title="PARTIES">
          <BiPara k="parties" />
        </Article>

        {/* 2. PURPOSE */}
        <Article number="2" title="PURPOSE OF THE AGREEMENT">
          <BiPara k="summary" />
          <BiPara k="purpose" />
        </Article>

        {/* 3. PRODUCTS */}
        <Article number="3" title="PRODUCTS">
          <LegalTable
            header={[
              { en: "PRODUCT / MODEL", zh: "产品/型号" },
              { en: "SPECIFICATION", zh: "规格" },
              { en: "QUANTITY", zh: "数量" },
              { en: "UNIT PRICE (USD)", zh: "单价（美元）" },
              { en: "TOTAL (USD)", zh: "总价（美元）" },
            ]}
            widths={[styles.cProduct, styles.cSpec, styles.cQty, styles.cPrice, styles.cTotal]}
            rows={partidas.map(p => [
              { text: p.producto, bold: p.esFlete },
              { text: p.especificacion, bold: p.esFlete },
              { text: p.cantidad, bold: p.esFlete },
              { text: fmtUSD(p.precioUnitario), bold: p.esFlete },
              { text: fmtUSD(p.total), bold: p.esFlete },
            ])}
          />
          <Text style={styles.totalLine}>
            Total Contract Value / 合同总价: {fmtUSD(totalValue)} {data.currency || "USD"}
          </Text>
          <BiPara k="products" />
        </Article>

        {/* 4. QUALITY */}
        <Article number="4" title="QUALITY AND SPECIFICATIONS">
          <BiPara k="quality" />
        </Article>

        {/* 5. PRICE */}
        <Article number="5" title="PRICE">
          <BiLabeled labelEn="Total Purchase Price" labelZh="总价款">
            {fmtUSD(totalValue)} {data.currency || "USD"}.
          </BiLabeled>
          <BiLabeled labelEn="Currency" labelZh="币种">{nbsp(data.currency)}.</BiLabeled>
          <BiLabeled labelEn="Incoterm" labelZh="贸易术语">
            {incoterm}{data.namedPlace ? `, ${data.namedPlace}` : ""}.
          </BiLabeled>
          <BiPara k="price" />
        </Article>

        {/* 6. PAYMENT TERMS */}
        <Article number="6" title="PAYMENT TERMS">
          <LegalTable
            header={[
              { en: "INSTALLMENT", zh: "分期" },
              { en: "PERCENT", zh: "比例" },
              { en: "AMOUNT (USD)", zh: "金额（美元）" },
            ]}
            widths={[styles.cConcepto, styles.cPct, styles.cMonto]}
            rows={pagos.map(pg => [
              { text: pg.concepto },
              { text: pg.porcentaje ? `${pg.porcentaje}%` : "—" },
              { text: fmtUSD(pg.monto) },
            ])}
          />
          <BiLabeled labelEn="Method" labelZh="付款方式">{method}.</BiLabeled>
          <BiLabeled labelEn="Freight" labelZh="运费">
            {data.fletePago === "final"
              ? "The freight amount is payable upon completion and is included in the final installment above."
              : "The freight amount is included within the installment percentages above."}
          </BiLabeled>
          <BiPara k="payment" />
        </Article>

        {/* 7. PRODUCTION AND DELIVERY */}
        <Article number="7" title="PRODUCTION AND DELIVERY">
          <BiLabeled labelEn="Production completion within" labelZh="生产完成期限">
            {data.productionDays ? `${data.productionDays} calendar days` : "—"}.
          </BiLabeled>
          <BiLabeled labelEn="Starting from" labelZh="起算日">{productionStart}.</BiLabeled>
          <BiLabeled labelEn="Estimated Ready-to-Ship Date" labelZh="预计备货完成日期">
            {nbsp(data.estimatedReadyToShipDate)}.
          </BiLabeled>
          <BiPara k="production" />
        </Article>

        {/* 8. INSPECTION */}
        <Article number="8" title="INSPECTION">
          <BiPara k="inspection" />
        </Article>

        {/* 9. NON-CONFORMING PRODUCTS */}
        <Article number="9" title="NON-CONFORMING PRODUCTS">
          <BiPara k="nonConforming" />
        </Article>

        {/* 10. PACKAGING */}
        <Article number="10" title="PACKAGING">
          <BiPara k="packaging" />
        </Article>

        {/* 11. SHIPPING AND DOCUMENTATION */}
        <Article number="11" title="SHIPPING AND DOCUMENTATION">
          <BiPara k="shipping" />
        </Article>

        {/* 12. WARRANTY */}
        <Article number="12" title="WARRANTY">
          <BiLabeled labelEn="Warranty period" labelZh="保修期">
            {data.warrantyMonths ? `${data.warrantyMonths} months` : "—"}.
          </BiLabeled>
          <BiLabeled labelEn="Starting from" labelZh="起算日">{nbsp(data.warrantyStart)}.</BiLabeled>
          <BiPara k="warranty" />
        </Article>

        {/* 13. WARRANTY CLAIM PROCEDURE */}
        <Article number="13" title="WARRANTY CLAIM PROCEDURE">
          <BiPara k="warrantyClaim" vars={{
            RESPONSE: data.warrantyResponseDays,
            CORRECTIVE: data.warrantyCorrectiveDays,
          }} />
        </Article>

        {/* 14. DELAY AND LIQUIDATED DAMAGES */}
        <Article number="14" title="DELAY AND LIQUIDATED DAMAGES">
          <BiPara k="delay" vars={{
            PCT:    data.delayPercent,
            PERIOD: data.delayPeriod,
            CAP:    data.delayCapPercent,
            DAYS:   data.delayTerminationDays,
          }} />
        </Article>

        {/* 15. CHANGE OF MANUFACTURING LOCATION */}
        <Article number="15" title="CHANGE OF MANUFACTURING LOCATION">
          <BiPara k="changeLocation" />
        </Article>

        {/* 16. SUBCONTRACTING */}
        <Article number="16" title="SUBCONTRACTING">
          <BiPara k="subcontracting" />
        </Article>

        {/* 17. INTELLECTUAL PROPERTY AND TOOLING */}
        <Article number="17" title="INTELLECTUAL PROPERTY AND TOOLING">
          <BiPara k="ip" />
        </Article>

        {/* 18. CONFIDENTIALITY */}
        <Article number="18" title="CONFIDENTIALITY">
          <BiPara k="confidentiality" />
        </Article>

        {/* 19. NON-CIRCUMVENTION */}
        <Article number="19" title="NON-CIRCUMVENTION">
          <BiPara k="nonCircumvention" vars={{
            YEARS:     data.ncDurationYears,
            TERRITORY: data.ncTerritory,
          }} />
        </Article>

        {/* 20. COMPLIANCE AND PRODUCT SAFETY */}
        <Article number="20" title="COMPLIANCE AND PRODUCT SAFETY">
          <BiPara k="compliance" />
        </Article>

        {/* 21. FORCE MAJEURE */}
        <Article number="21" title="FORCE MAJEURE">
          <BiPara k="forceMajeure" />
        </Article>

        {/* 22. TERMINATION */}
        <Article number="22" title="TERMINATION">
          <BiPara k="termination" />
        </Article>

        {/* 23. GOVERNING LAW */}
        <Article number="23" title="GOVERNING LAW">
          <BiPara k="governingLaw" vars={{ LAW: data.governingLaw }} />
        </Article>

        {/* 24. DISPUTE RESOLUTION */}
        <Article number="24" title="DISPUTE RESOLUTION">
          <BiPara k="dispute" vars={{
            DAYS:        data.negotiationDays || "30",
            INSTITUTION: data.arbitrationInstitution,
            SEAT:        data.arbitrationSeat,
            LANG:        arbLang,
          }} />
        </Article>

        {/* 25. LANGUAGE */}
        <Article number="25" title="LANGUAGE">
          <BiLabeled labelEn="Executed in" labelZh="签署地">{nbsp(data.executedIn)}.</BiLabeled>
          <BiPara k="language" vars={{ CONTROLLING: data.controllingLanguage }} />
        </Article>

        {/* 26. ELECTRONIC SIGNATURES */}
        <Article number="26" title="ELECTRONIC SIGNATURES AND DIGITAL RECORDS">
          <BiPara k="electronic" />
        </Article>

        {/* 27. ENTIRE AGREEMENT */}
        <Article number="27" title="ENTIRE AGREEMENT">
          <BiPara k="entire" />
        </Article>

        {/* 28. NOTICES */}
        <Article number="28" title="NOTICES">
          <View style={styles.noticesRow}>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>THE BUYER</Text>
              <Text style={styles.noticeTitleZh}>{zws('买方')}</Text>
              <Text style={styles.noticeLine}>Name / 姓名: {nbsp(data.buyerNoticeName)}</Text>
              <Text style={styles.noticeLine}>Email / 电子邮箱: {nbsp(data.buyerNoticeEmail)}</Text>
              <Text style={styles.noticeLine}>Address / 地址: {nbsp(data.buyerNoticeAddress)}</Text>
            </View>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>THE SUPPLIER</Text>
              <Text style={styles.noticeTitleZh}>{zws('供方')}</Text>
              <Text style={styles.noticeLine}>Name / 姓名: <CNText>{nbsp(data.supplierNoticeName)}</CNText></Text>
              <Text style={styles.noticeLine}>Email / 电子邮箱: {nbsp(data.supplierNoticeEmail)}</Text>
              <Text style={styles.noticeLine}>Address / 地址: <CNText>{nbsp(data.supplierNoticeAddress)}</CNText></Text>
            </View>
          </View>
          <BiPara k="noticesBoilerplate" />
        </Article>

        {/* 29. ANNEXES */}
        <Article number="29" title="ANNEXES">
          <BiPara k="annexes" />
        </Article>

        {/* 30. SIGNATURES */}
        <Article number="30" title="SIGNATURES">
          <Text style={styles.witness}>
            IN WITNESS WHEREOF, the Parties have caused this Agreement to be executed by their duly
            authorized representatives as of the date first written above.
          </Text>
          <Text style={styles.witnessZh}>
            {zws('兹证明，双方已促使其正式授权代表于文首所载日期签署本协议，以昭信守。')}
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureFor}>For and on behalf of{"\n"}THE BUYER:</Text>
              <Text style={styles.signatureForZh}>{zws('谨代表买方：')}</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureParty}>{nbsp(data.buyerLegalName)}</Text>
              <Text style={styles.signatureMeta}>Name: {nbsp(data.buyerSigner)}</Text>
              <Text style={styles.signatureMetaZh}>姓名</Text>
              <Text style={styles.signatureMeta}>Title: {nbsp(data.buyerSignerPosition)}</Text>
              <Text style={styles.signatureMetaZh}>职务</Text>
              <Text style={styles.signatureMeta}>Date: {nbsp(data.buyerSignDate)}</Text>
              <Text style={styles.signatureMeta}>(Company stamp / seal)</Text>
              <Text style={styles.signatureMetaZh}>{zws('（公司印章）')}</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureFor}>For and on behalf of{"\n"}THE SUPPLIER:</Text>
              <Text style={styles.signatureForZh}>{zws('谨代表供方：')}</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureParty}><CNText fallback="Times-Bold">{nbsp(data.supplierLegalName)}</CNText></Text>
              <Text style={styles.signatureMeta}>Name: <CNText>{nbsp(data.supplierSigner)}</CNText></Text>
              <Text style={styles.signatureMetaZh}>姓名</Text>
              <Text style={styles.signatureMeta}>Title: <CNText>{nbsp(data.supplierSignerPosition)}</CNText></Text>
              <Text style={styles.signatureMetaZh}>职务</Text>
              <Text style={styles.signatureMeta}>Date: {nbsp(data.supplierSignDate)}</Text>
              <Text style={styles.signatureMeta}>(Company stamp / seal)</Text>
              <Text style={styles.signatureMetaZh}>{'（公司印章 / ' + zws('公章）')}</Text>
            </View>
          </View>
        </Article>

        {/* Pie */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{'International Purchase Agreement / ' + zws('国际采购协议')}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* ══ ANNEX A ══ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.annexTitle}>ANNEX A — TECHNICAL SPECIFICATIONS</Text>
        <Text style={styles.annexTitleZh}>{zws('附件A——技术规格')}</Text>
        <Text style={styles.annexSub}>International Purchase Agreement {data.numero ? `· Contract No. ${data.numero}` : ""}</Text>
        <View style={styles.titleRule} />

        <BiParaRaw
          en="The technical specifications of the Products are those set forth in Article 3 (Products) of this Agreement, reproduced below for convenience:"
          zh="产品的技术规格如本协议第3条（产品）所载，为方便查阅，转录如下："
        />

        {partidas.length > 0 ? (
          <>
            <LegalTable
              header={[
                { en: "PRODUCT / MODEL", zh: "产品/型号" },
                { en: "SPECIFICATION", zh: "规格" },
                { en: "QUANTITY", zh: "数量" },
                { en: "UNIT PRICE (USD)", zh: "单价（美元）" },
                { en: "TOTAL (USD)", zh: "总价（美元）" },
              ]}
              widths={[styles.cProduct, styles.cSpec, styles.cQty, styles.cPrice, styles.cTotal]}
              rows={partidas.map(p => [
                { text: p.producto },
                { text: p.especificacion },
                { text: p.cantidad },
                { text: fmtUSD(p.precioUnitario) },
                { text: fmtUSD(p.total) },
              ])}
            />
            <Text style={styles.totalLine}>
              Total Contract Value / 合同总价: {fmtUSD(totalValue)} {data.currency || "USD"}
            </Text>
          </>
        ) : (
          <Para>{'—'}</Para>
        )}

        <BiParaRaw
          en="The Products shall comply with the quality requirements, standards and specifications set forth in Article 4 (Quality and Specifications) of this Agreement. The Supplier shall not make material changes to the specifications, materials, components or production processes without the Buyer's prior written approval."
          zh="产品应符合本协议第4条（质量与规格）所载的质量要求、标准及规格。未经买方事先书面批准，供方不得对规格、材料、部件或生产工艺作出实质性变更。"
        />

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{'Annex A — Technical Specifications / ' + zws('附件A——技术规格')}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* ══ ANNEX B (landscape) ══ */}
      <Page size="A4" orientation="landscape" style={styles.pageLandscape} wrap>
        <Text style={styles.annexTitle}>ANNEX B — COMMERCIAL TERMS</Text>
        <Text style={styles.annexTitleZh}>{zws('附件B——商业条款')}</Text>
        <Text style={styles.annexSub}>International Purchase Agreement {data.numero ? `· Contract No. ${data.numero}` : ""}</Text>
        <View style={styles.titleRule} />

        <BiParaRaw
          en="The following commercial terms are those set forth in the main body of this Agreement (Articles 3, 5, 6, 7 and 12), summarized by Product:"
          zh="下列商业条款为本协议正文（第3条、第5条、第6条、第7条及第12条）所载内容，按产品汇总如下："
        />

        <LegalTable
          header={[
            { en: "PO NUMBER", zh: "订单号" },
            { en: "PRODUCT", zh: "产品" },
            { en: "QTY", zh: "数量" },
            { en: "UNIT PRICE", zh: "单价" },
            { en: "TOTAL", zh: "总价" },
            { en: "INCOTERM", zh: "贸易术语" },
            { en: "LOADING PORT", zh: "装运港" },
            { en: "DESTINATION", zh: "目的地" },
            { en: "LEAD TIME", zh: "交货周期" },
            { en: "PAYMENT TERMS", zh: "付款条件" },
            { en: "WARRANTY", zh: "保修" },
          ]}
          widths={[styles.cB1, styles.cB2, styles.cB3, styles.cB4, styles.cB5, styles.cB6, styles.cB7, styles.cB8, styles.cB9, styles.cB10, styles.cB11]}
          rows={partidas.map(p => [
            { text: data.numero },
            { text: p.producto },
            { text: p.cantidad },
            { text: fmtUSD(p.precioUnitario) },
            { text: fmtUSD(p.total) },
            { text: incoterm },
            { text: data.namedPlace },
            { text: data.buyerCountry },
            { text: data.productionDays ? `${data.productionDays} days` : "—" },
            { text: paymentTermsSummary },
            { text: data.warrantyMonths ? `${data.warrantyMonths} months` : "—" },
          ])}
        />

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{'Annex B — Commercial Terms / ' + zws('附件B——商业条款')}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* ══ ANNEX C + D ══ */}
      <Page size="A4" style={styles.page} wrap>

        {/* ANNEX C */}
        <Text style={styles.annexTitle}>ANNEX C — INSPECTION AND ACCEPTANCE PROTOCOL</Text>
        <Text style={styles.annexTitleZh}>{zws('附件C——检验及验收协议')}</Text>
        <Text style={styles.annexSub}>International Purchase Agreement {data.numero ? `· Contract No. ${data.numero}` : ""}</Text>
        <View style={styles.titleRule} />

        <BiLabeled labelEn="Inspection Company" labelZh="检验机构">{nbsp(data.inspectionCompany)}.</BiLabeled>
        <BiLabeled labelEn="Location (Factory)" labelZh="地点（工厂）">{nbsp(data.inspectionLocation)}.</BiLabeled>
        <BiLabeled labelEn="Date" labelZh="日期">{nbsp(data.inspectionDate)}.</BiLabeled>
        <Text style={styles.labeled}><Text style={{ fontFamily: "Times-Bold" }}>Checklist:</Text></Text>
        <Text style={styles.labeledZh}><Text style={{ fontFamily: CN_FONT }}>检查清单：</Text></Text>
        {checklistC.length > 0
          ? <BulletList items={checklistC} />
          : <Para>{'—'}</Para>}
        <BiLabeled labelEn="Acceptance Standard" labelZh="验收标准">
          {nbsp(inspectionStandard)}.
        </BiLabeled>

        {/* ANNEX D */}
        <View style={{ marginTop: 24 }} wrap={false}>
          <Text style={styles.annexTitle}>ANNEX D — SHIPPING DOCUMENTS</Text>
          <Text style={styles.annexTitleZh}>{zws('附件D——运输单证')}</Text>
          <View style={styles.titleRule} />
          <Text style={styles.para}>
            The Supplier shall provide the following documents as required under this Agreement:
          </Text>
          <View style={styles.zhBlock}>
            <Text style={styles.zhPara}>供方应按本协议要求提供下列单证：</Text>
          </View>
          <CheckList options={ANNEX_D_DOCS} selected={docsD} />
          {data.annexDOther && (
            <View style={styles.checklistRow} wrap={false}>
              <Text style={styles.checklistMark}>[X]</Text>
              <Text style={styles.checklistItem}>Other / 其他: {data.annexDOther}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{'Annexes C & D / ' + zws('附件C及D')}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default ContratoPDF;