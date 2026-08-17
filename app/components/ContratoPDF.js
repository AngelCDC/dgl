// components/ContratoPDF.js — International Purchase Agreement (bilingüe EN/中文)
// Formato legal tradicional: Times, texto justificado, sin branding corporativo.
// Cada cláusula aparece en inglés seguida de su traducción completa al chino
// (formato secuencial), requisito de validez en China.
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
// simplificado) y se usa solo cuando el texto contiene caracteres chinos.
const CN_FONT = "SimHei";
try {
  const fontPath = path.join(process.cwd(), "fonts", "simhei.ttf");
  if (fs.existsSync(fontPath)) {
    Font.register({
      family: CN_FONT,
      fonts: [
        { src: fontPath, fontWeight: "normal" },
        { src: fontPath, fontWeight: "bold" },
      ],
    });
  } else {
    console.error(`SimHei font not found at ${fontPath} (Chinese text may not render)`);
  }
} catch (e) {
  console.error("SimHei font not registered (Chinese text may not render):", e.message);
}

// Detecta ideogramas CJK / caracteres de ancho completo (chino simplificado)
const CJK_RE = /[　-〿぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/;
const pickFont = (texto, fallback) =>
  texto && CJK_RE.test(String(texto)) ? CN_FONT : fallback;

// Texto que cambia automáticamente a la fuente china si contiene caracteres CJK
const CNText = ({ children, fallback = "Times-Roman" }) => (
  <Text style={{ fontFamily: pickFont(children, fallback) }}>{children}</Text>
);

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: INK,
    lineHeight: 1.6,
  },
  pageLandscape: {
    backgroundColor: "#ffffff",
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: INK,
    lineHeight: 1.5,
  },

  // ── Cabecera del documento ──
  docTitle: {
    fontSize: 15,
    fontFamily: "Times-Bold",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 4,
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
  para: {
    textAlign: "justify",
    marginBottom: 8,
  },
  paraIndent: {
    textAlign: "justify",
    marginBottom: 8,
    marginLeft: 28,
  },
  whereHeading: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    textAlign: "center",
    letterSpacing: 3,
    marginTop: 10,
    marginBottom: 8,
  },
  leadIn: { textAlign: "justify", marginBottom: 8 },

  // ── Artículos ──
  article: { marginTop: 12, marginBottom: 4 },
  articleTitle: {
    fontSize: 10.5,
    fontFamily: "Times-Bold",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  articleTitleCN: {
    fontSize: 10.5,
    fontFamily: CN_FONT,
    textAlign: "center",
    marginBottom: 6,
  },

  // ── Fields inline ──
  labeled: { textAlign: "justify", marginBottom: 8 },

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
    fontFamily: CN_FONT,
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 5,
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
    marginBottom: 4,
  },
  noticeLine: { fontSize: 9, marginBottom: 2 },

  // ── Firmas ──
  witness: { textAlign: "justify", marginTop: 14, marginBottom: 10 },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingHorizontal: 10,
  },
  signatureBox: { width: "42%", textAlign: "center" },
  signatureFor: { fontSize: 9, fontFamily: "Times-Bold", textAlign: "center", marginBottom: 26 },
  signatureLine: { borderBottom: `0.5pt solid ${INK}`, marginBottom: 4, marginTop: 8 },
  signatureParty: { fontSize: 9.5, fontFamily: "Times-Bold", textAlign: "center", marginBottom: 2 },
  signatureMeta: { fontSize: 9, textAlign: "center", marginTop: 2 },

  // ── Anexos ──
  annexTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  annexSub: {
    fontSize: 9,
    textAlign: "center",
    marginBottom: 12,
  },

  bulletList: { marginLeft: 20, marginBottom: 6 },
  bullet: { fontSize: 9.5, marginBottom: 2, textAlign: "justify" },

  checklistRow: { flexDirection: "row", marginBottom: 2 },
  checklistMark: { width: 24, fontSize: 9.5, fontFamily: "Times-Bold" },
  checklistItem: { flex: 1, fontSize: 9.5 },

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
  footerText: { fontSize: 8, fontFamily: CN_FONT },
});

// ─── Textos fijos (cláusulas del formato base — no se guardan en BD) ──────────
const FIXED_TEXT = {
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
  language: 'This Agreement is executed in both English and Chinese. In the event of any inconsistency between the two versions, the {CONTROLLING} version shall prevail.',
  electronic: 'Electronic signatures and digital records may be used as evidence to the extent permitted by law. Platform order, payment and transaction records may be incorporated by express reference.',
  entire: 'This Agreement, together with the PI, PO, Technical Specifications, Inspection Protocol and the Annexes expressly incorporated herein, constitutes the entire agreement between the Parties. Amendments shall be made in writing and approved by the authorized representatives of both Parties.',
  annexes: 'The Annexes listed below are attached hereto and form an integral part of this Agreement: Annex A — Technical Specifications; Annex B — Commercial Terms; Annex C — Inspection and Acceptance Protocol; Annex D — Shipping Documents. In the event of any conflict between the main body of this Agreement and any Annex, the main body shall prevail, unless otherwise expressly stated.',
  noticesBoilerplate: 'All notices, requests, demands and other communications required or permitted under this Agreement shall be made in writing and delivered personally, by email, or by internationally recognized courier service to the addresses set forth above, or to such other address as a Party may designate in writing. Notices shall be deemed effective upon receipt if delivered personally or by email, or upon signature of receipt if sent by courier.',
};

// ─── Traducciones al chino (mismas keys y placeholders que FIXED_TEXT) ─────────
const FIXED_TEXT_CN = {
  summary: '本协议由买方与供应商签订，旨在按照约定的规格、价格、付款、生产、检验、质保及相关的商业与法律条款制造和/或销售产品。',
  recital1: '买方希望购买由供应商制造和/或供应的某些产品，并遵守本协议及其附件中规定的技术规格、商业条款和其他条件；并且',
  recital2: '供应商已同意按照下文规定的条款和条件，向买方制造和/或供应此类产品。',
  therefore: '因此，考虑到本协议所包含的相互承诺与约定，以及其他有效且有价值的对价（双方在此确认已收到且充分），双方达成如下协议：',
  parties: '各方声明并保证，其具有签订本协议并履行本协议项下义务的法律资格和充分的公司权力与授权，且代表其签署本协议的人员已获得正式授权。',
  purpose: '供应商同意制造和/或销售，买方同意购买本协议、适用的形式发票（PI）及技术规格中所述的产品。供应商应严格按照约定的规格、数量、质量、包装、交付条款和附件进行供应。',
  products: '详细规格载于附件A。未经买方事先书面批准，供应商不得对规格、材料、零部件或生产工艺进行重大变更。',
  quality: '产品必须符合约定规格，全新、未经使用且无缺陷，符合适用的技术标准和认证，与经批准的样品、图纸和规格书一致，并适用于预期的商业用途。任何偏差均须事先取得买方的书面批准。',
  price: '除非另有约定，价格包括供应商在约定的国际贸易术语项下应承担的所有费用。未经买方事先书面同意，订单确认后不得提价。',
  payment: '尾款应在生产完成、检验合格、合规性确认、收到所需单据并具备发货条件后到期支付。除非买方另行书面批准，款项应仅支付至已登记的供应商法人实体的银行账户。',
  production: '供应商如预计可能发生迟延，应立即通知买方；未经买方事先书面批准，不得实质性延迟生产或交付。',
  inspection: '买方可通过买方自身、第三方检验机构、授权代表或双方约定的机构进行装运前检验。检验范围可包括数量、尺寸、重量、外观、材料、功能、性能、包装、标签、配件、文件以及是否符合技术规格。供应商应为检验提供合理便利。检验未通过不构成验收。具体内容载于附件C。',
  nonConforming: '如产品不符合要求，买方可自行选择：要求修理或返工、要求更换、要求部分退款、拒收产品，或在实质性不符的情况下要求全额退款。对于可归因于供应商的缺陷，供应商应承担相关合理费用，包括返工、更换和运输费用。',
  packaging: '供应商应按照约定规格对产品进行包装，包装应适于国际运输，并能防护冲击、潮湿、腐蚀、灰尘、挤压及正常装卸。包装上应包含所需的运输唛头以及产品和运输信息。',
  shipping: '供应商应提供交易及约定国际贸易术语项下所需的单据，包括（视情况而定）：商业发票、装箱单、提单/海运单、原产地证书、合格证书、检测报告、质保证书、技术规格书、用户手册、MSDS/SDS、UN38.3、出口单证、检验证书以及其他合理要求的单据。如适用，应提供运输单据草稿以供审核。见附件D。',
  warranty: '质保涵盖因制造、材料、工艺、零部件及不符合规格而产生的缺陷。除非另有约定，质保不包括误用、擅自改装、安装不当或供应商无法控制的原因。补救措施：修理、更换或适当退款。',
  warrantyClaim: '买方应附上支持性证据向供应商提出质保索赔。供应商应在{RESPONSE}个工作日内作出答复，并应在{CORRECTIVE}个工作日内提出纠正措施。',
  delay: '发生迟延时，供应商应按每{PERIOD}支付迟延货物价值的{PCT}%作为违约金，最高不超过受影响货物价值的{CAP}%。如迟延超过{DAYS}个日历日，买方可终止本协议受影响的部分，并依本协议争议条款要求退还未交付货物的款项。',
  changeLocation: '未经买方事先书面批准，供应商不得将生产转移至其他工厂、分包商或地点。任何未经授权的转移均构成对本协议的重大违约。',
  subcontracting: '无论是否分包，供应商均应对质量、规格、交付和履约承担责任；任何重大分包均须事先取得买方的书面批准。',
  ip: '由买方提供或出资的图纸、设计、规格、图稿、模具、工装、包装设计和技术信息，除非另有约定，应始终为买方的财产。供应商不得滥用、转让、用于未经授权的生产或披露相关保密信息。',
  confidentiality: '各方应对另一方的所有非公开的商业、技术、财务和业务信息予以保密。仅经书面授权、因法律要求或为履行本协议所必需的范围内方可披露。',
  nonCircumvention: '如买方作为采购代理、中间人或代表行事，供应商不得为了规避买方的参与而故意绕过买方与买方介绍的客户直接交易。期限：{YEARS}年。地域范围：{TERRITORY}。本条款仅适用于买方直接介绍的机会。',
  compliance: '供应商声明产品符合适用的约定要求，且不会故意侵犯第三方知识产权。供应商应就实际供应的产品提供有效的认证和检测报告，不得提供伪造、篡改、过期或误导性的文件。',
  forceMajeure: '任何一方均不对因其合理控制范围之外的事件（包括自然灾害、战争、政府限制和禁运）造成的未能履约承担责任。受影响一方应立即通知另一方并提供证据。不可抗力不免除事件发生前已产生的义务。',
  termination: '发生重大违约、未经约定展期的迟延交付、产品实质性不符、提供虚假或欺诈性文件、未经授权变更生产地点、破产或停业、或屡次不合规时，买方可终止本协议。买方可根据适用法律及本协议争议条款要求退还未交付或已拒收货物的款项。',
  governingLaw: '本协议受以下法律管辖并依其解释：{LAW}。选择适用法律并不妨碍任何一方在法律允许的范围内寻求临时或保护性措施。',
  dispute: '争议应首先通过善意协商解决。如争议在{DAYS}个日历日内未能解决，应提交{INSTITUTION}。仲裁地：{SEAT}。语言：{LANG}。在法律允许的范围内，裁决或决定为终局且对双方具有约束力。',
  language: '本协议以中文和英文两种文字签署。两种文本如有任何不一致，以{CONTROLLING}文本为准。',
  electronic: '在法律允许的范围内，电子签名和数字记录可作为证据使用。平台订单、付款和交易记录可通过明示引用纳入本协议。',
  entire: '本协议连同形式发票、采购订单、技术规格、检验协议及明示纳入的附件，构成双方之间的完整协议。任何修订均须以书面形式作出并经双方授权代表批准。',
  annexes: '下列附件附于本协议并构成其不可分割的一部分：附件A——技术规格；附件B——商业条款；附件C——检验与验收协议；附件D——运输单据。如本协议正文与任何附件之间发生冲突，除非另有明确约定，以正文为准。',
  noticesBoilerplate: '本协议项下要求或允许的所有通知、请求、要求及其他通信，均应以书面形式亲自送达、通过电子邮件或国际公认的快递服务寄送至上述地址，或一方书面指定的其他地址。亲自送达或电子邮件送达的，通知在收到时视为有效；快递寄送的，在签收时视为有效。',
};

// ─── Traducciones de títulos, etiquetas y textos misceláneos ──────────────────
const T_ARTICLES = {
  1: '当事方', 2: '协议目的', 3: '产品', 4: '质量与规格', 5: '价格', 6: '付款条款',
  7: '生产与交付', 8: '检验', 9: '不符合要求的产品', 10: '包装', 11: '运输与单据',
  12: '质保', 13: '质保索赔程序', 14: '迟延与违约金', 15: '变更生产地点', 16: '分包',
  17: '知识产权与工装', 18: '保密', 19: '禁止绕行', 20: '合规与产品安全', 21: '不可抗力',
  22: '终止', 23: '适用法律', 24: '争议解决', 25: '语言', 26: '电子签名与数字记录',
  27: '完整协议', 28: '通知', 29: '附件', 30: '签署',
};

const T_LABELS = {
  'Total Purchase Price': '采购总价',
  'Currency': '货币',
  'Incoterm': '国际贸易术语',
  'Method': '付款方式',
  'Freight': '运费',
  'Production completion within': '生产完成期限',
  'Starting from': '起算时间',
  'Estimated Ready-to-Ship Date': '预计发货日期',
  'Warranty period': '质保期',
  'Executed in': '签署语言',
  'Inspection Company': '检验公司',
  'Location (Factory)': '检验地点（工厂）',
  'Date': '日期',
  'Acceptance Standard': '验收标准',
  'Checklist': '检验清单',
};

const T_FREIGHT = {
  final: '运费金额于完成时支付，并计入上述最后一期款项。',
  porcentaje: '运费金额已计入上述各期付款的百分比。',
};

const T_DOCS = {
  'Commercial Invoice': '商业发票',
  'Packing List': '装箱单',
  'Bill of Lading/Sea Waybill': '提单/海运单',
  'Certificate of Origin': '原产地证书',
  'Certificate of Conformity': '合格证书',
  'Test Report': '检测报告',
  'Warranty Certificate': '质保证书',
  'Technical Datasheet': '技术规格书',
  'User Manual': '用户手册',
  'MSDS/SDS': 'MSDS/SDS',
  'UN38.3': 'UN38.3',
  'Export Documentation': '出口单证',
  'Inspection Certificate': '检验证书',
};

const T_CHECKLIST = {
  quantity: '数量', model: '型号', dimensions: '尺寸', materials: '材料',
  appearance: '外观', functionality: '功能', performance: '性能',
  accessories: '配件', packaging: '包装', labels: '标签',
  documentation: '文件', other: '其他',
};

const T_EXECUTED = { EN: 'English', CN: 'Chinese', 'EN+CN': 'English and Chinese' };
const T_EXECUTED_CN = { EN: '英文', CN: '中文', 'EN+CN': '中英文' };

const ANNEX_D_DOCS = [
  'Commercial Invoice', 'Packing List', 'Bill of Lading/Sea Waybill',
  'Certificate of Origin', 'Certificate of Conformity', 'Test Report',
  'Warranty Certificate', 'Technical Datasheet', 'User Manual',
  'MSDS/SDS', 'UN38.3', 'Export Documentation', 'Inspection Certificate',
];

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
// Título de artículo bilingüe: línea EN (Times) + línea CN (SimHei)
const Article = ({ number, title, children }) => (
  <View style={styles.article} wrap={false}>
    <Text style={styles.articleTitle}>ARTICLE {number} — {title}</Text>
    <Text style={styles.articleTitleCN}>第{number}条 {T_ARTICLES[number]}</Text>
    {children}
  </View>
);

const Para = ({ children }) => <Text style={styles.para}>{children}</Text>;

// Párrafo en chino (la fuente conmuta sola si se intercalan valores latinos)
const ParaCN = ({ children }) => (
  <Text style={styles.para}><CNText>{children}</CNText></Text>
);

// Párrafo con etiqueta en negrita ("Label: value.")
const Labeled = ({ label, children }) => (
  <Text style={styles.labeled}>
    <Text style={{ fontFamily: "Times-Bold" }}>{label}:</Text> <CNText>{children}</CNText>
  </Text>
);

// Versión china del Labeled ("标签：值。")
const LabeledCN = ({ label, children }) => (
  <Text style={styles.labeled}>
    <Text style={{ fontFamily: CN_FONT }}>{label}：</Text> <CNText>{children}</CNText>
  </Text>
);

// Tabla clásica con bordes; encabezados bilingües (chino arriba, inglés abajo)
const LegalTable = ({ header, rows, widths }) => (
  <View style={styles.table}>
    <View style={styles.tableHeader} wrap={false}>
      {header.map((h, i) => {
        const [cn, en] = Array.isArray(h) ? h : [null, h];
        return (
          <Text
            key={i}
            style={[styles.tableHeaderCell, widths[i], i === header.length - 1 && { borderRight: "none" }]}
          >
            {cn ? `${cn}\n${en}` : en}
          </Text>
        );
      })}
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
            {cell?.text ?? "—"}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

// Checklist bilingüe: options = pares [chino, inglés]; selected = valores EN
const CheckList = ({ options, selected }) => (
  <View>
    {options.map((opt, i) => {
      const [cn, en] = opt;
      const on = (selected || []).includes(en);
      return (
        <View key={i} style={styles.checklistRow} wrap={false}>
          <Text style={styles.checklistMark}>{on ? "[X]" : "[ ]"}</Text>
          <Text style={styles.checklistItem}>
            <Text style={{ fontFamily: CN_FONT }}>{cn}</Text> {en}
          </Text>
        </View>
      );
    })}
  </View>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const ContratoPDF = ({ data }) => {
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

  const executedEn = T_EXECUTED[data.executedIn] || data.executedIn || '—';
  const executedCn = T_EXECUTED_CN[data.executedIn] || data.executedIn || '—';
  const controllingEn = data.controllingLanguage === 'CN' ? 'Chinese' : 'English';
  const controllingCn = data.controllingLanguage === 'CN' ? '中文' : '英文';

  const freightEN = data.fletePago === "final"
    ? "The freight amount is payable upon completion and is included in the final installment above."
    : "The freight amount is included within the installment percentages above.";

  return (
    <Document title="International Purchase Agreement">
      {/* ══ CUERPO PRINCIPAL ══ */}
      <Page size="A4" style={styles.page} wrap>

        {/* Título bilingüe */}
        <Text style={[styles.docTitle, { fontFamily: CN_FONT, letterSpacing: 4 }]}>国际采购协议</Text>
        <Text style={styles.docTitle}>INTERNATIONAL PURCHASE AGREEMENT</Text>
        <Text style={[styles.docMeta, { fontFamily: CN_FONT }]}>
          日期 Date: {nbsp(data.fecha)}{data.numero ? `     ·     合同编号 Contract No.: ${data.numero}` : ""}
        </Text>
        <View style={styles.titleRule} />

        {/* Partes — EN */}
        <Text style={styles.para}>
          THIS INTERNATIONAL PURCHASE AGREEMENT (this “Agreement”) is made and entered
          into as of the date first written above, by and between:
        </Text>
        <Text style={styles.paraIndent}>
          (1)&nbsp;&nbsp;
          <Text style={{ fontFamily: "Times-Bold" }}>{nbsp(data.buyerLegalName)}</Text>
          {data.buyerTradeName ? `, trading as ${data.buyerTradeName},` : ","} a company duly organized
          and validly existing under the laws of {nbsp(data.buyerCountry)}, with its registered address at{" "}
          {nbsp(data.buyerAddress)}, registration number {nbsp(data.buyerTaxId)}, represented by{" "}
          {nbsp(data.buyerRepresentative)}, {nbsp(data.buyerPosition)} (hereinafter referred to as the
          “<Text style={{ fontFamily: "Times-Bold" }}>Buyer</Text>”); and
        </Text>
        <Text style={styles.paraIndent}>
          (2)&nbsp;&nbsp;
          <CNText fallback="Times-Bold">{nbsp(data.supplierLegalName)}</CNText>
          {data.supplierTradeName ? <> (<CNText>{data.supplierTradeName}</CNText>),</> : ","} a company duly organized and
          validly existing under the laws of the People’s Republic of China, holding Unified Social
          Credit Code No. {nbsp(data.supplierUscc)}, with its registered address at{" "}
          <CNText>{nbsp(data.supplierAddress)}</CNText>, represented by{" "}
          <CNText>{nbsp(data.supplierLegalRepresentative)}</CNText>,{" "}
          <CNText>{nbsp(data.supplierPosition)}</CNText> (hereinafter referred to as the
          “<Text style={{ fontFamily: "Times-Bold" }}>Supplier</Text>”).
        </Text>
        <Text style={styles.para}>
          The Buyer and the Supplier are hereinafter referred to individually as a “Party”
          and collectively as the “Parties”.
        </Text>

        {/* Partes — CN */}
        <ParaCN>
          本国际采购协议（下称“本协议”）于文首所载日期由以下双方订立：
        </ParaCN>
        <Text style={styles.paraIndent}>
          <CNText>
            （1）买方：<CNText fallback="Times-Bold">{nbsp(data.buyerLegalName)}</CNText>
            {data.buyerTradeName ? `（以${data.buyerTradeName}名义经营）` : ''}，一家依照{nbsp(data.buyerCountry)}法律合法设立并有效存续的公司，注册地址为{nbsp(data.buyerAddress)}，注册号为{nbsp(data.buyerTaxId)}，由{nbsp(data.buyerRepresentative)}（{nbsp(data.buyerPosition)}）代表（下称“买方”）；并且
          </CNText>
        </Text>
        <Text style={styles.paraIndent}>
          <CNText>
            （2）供应商：<CNText fallback="Times-Bold">{nbsp(data.supplierLegalName)}</CNText>
            {data.supplierTradeName ? `（${data.supplierTradeName}）` : ''}，一家依照中华人民共和国法律合法设立并有效存续的公司，统一社会信用代码为{nbsp(data.supplierUscc)}，注册地址为{nbsp(data.supplierAddress)}，由{nbsp(data.supplierLegalRepresentative)}（{nbsp(data.supplierPosition)}）代表（下称“供应商”）。
          </CNText>
        </Text>
        <ParaCN>买方与供应商在本协议中单称“一方”，合称“双方”。</ParaCN>

        {/* Recitales */}
        <Text style={styles.whereHeading}>RECITALS</Text>
        <Text style={[styles.whereHeading, { fontFamily: CN_FONT, marginTop: 0 }]}>鉴于条款</Text>
        <Text style={styles.paraIndent}>WHEREAS, {FIXED_TEXT.recital1}</Text>
        <Text style={styles.paraIndent}>WHEREAS, {FIXED_TEXT.recital2}</Text>
        <Text style={styles.leadIn}>{FIXED_TEXT.therefore}</Text>
        <ParaCN>鉴于，{FIXED_TEXT_CN.recital1}</ParaCN>
        <ParaCN>鉴于，{FIXED_TEXT_CN.recital2}</ParaCN>
        <ParaCN>{FIXED_TEXT_CN.therefore}</ParaCN>

        {/* 1. PARTIES */}
        <Article number="1" title="PARTIES">
          <Para>{FIXED_TEXT.parties}</Para>
          <ParaCN>{FIXED_TEXT_CN.parties}</ParaCN>
        </Article>

        {/* 2. PURPOSE */}
        <Article number="2" title="PURPOSE OF THE AGREEMENT">
          <Para>{FIXED_TEXT.summary}</Para>
          <Para>{FIXED_TEXT.purpose}</Para>
          <ParaCN>{FIXED_TEXT_CN.summary}</ParaCN>
          <ParaCN>{FIXED_TEXT_CN.purpose}</ParaCN>
        </Article>

        {/* 3. PRODUCTS */}
        <Article number="3" title="PRODUCTS">
          <LegalTable
            header={[
              ['产品/型号', 'PRODUCT / MODEL'],
              ['规格', 'SPECIFICATION'],
              ['数量', 'QUANTITY'],
              ['单价（美元）', 'UNIT PRICE (USD)'],
              ['总额（美元）', 'TOTAL (USD)'],
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
            <Text style={{ fontFamily: CN_FONT }}>合同总价 </Text>
            Total Contract Value: {fmtUSD(totalValue)} {data.currency || "USD"}
          </Text>
          <Para>{FIXED_TEXT.products}</Para>
          <ParaCN>{FIXED_TEXT_CN.products}</ParaCN>
        </Article>

        {/* 4. QUALITY */}
        <Article number="4" title="QUALITY AND SPECIFICATIONS">
          <Para>{FIXED_TEXT.quality}</Para>
          <ParaCN>{FIXED_TEXT_CN.quality}</ParaCN>
        </Article>

        {/* 5. PRICE */}
        <Article number="5" title="PRICE">
          <Labeled label="Total Purchase Price">
            {fmtUSD(totalValue)} {data.currency || "USD"}.
          </Labeled>
          <Labeled label="Currency">{nbsp(data.currency)}.</Labeled>
          <Labeled label="Incoterm">
            {incoterm}{data.namedPlace ? `, ${data.namedPlace}` : ""}.
          </Labeled>
          <Para>{FIXED_TEXT.price}</Para>
          <LabeledCN label={T_LABELS['Total Purchase Price']}>
            {fmtUSD(totalValue)} {data.currency || "USD"}。
          </LabeledCN>
          <LabeledCN label={T_LABELS['Currency']}>{nbsp(data.currency)}。</LabeledCN>
          <LabeledCN label={T_LABELS['Incoterm']}>
            {incoterm}{data.namedPlace ? `，${data.namedPlace}` : ''}。
          </LabeledCN>
          <ParaCN>{FIXED_TEXT_CN.price}</ParaCN>
        </Article>

        {/* 6. PAYMENT TERMS */}
        <Article number="6" title="PAYMENT TERMS">
          <LegalTable
            header={[
              ['分期款项', 'INSTALLMENT'],
              ['百分比', 'PERCENT'],
              ['金额（美元）', 'AMOUNT (USD)'],
            ]}
            widths={[styles.cConcepto, styles.cPct, styles.cMonto]}
            rows={pagos.map(pg => [
              { text: pg.concepto },
              { text: pg.porcentaje ? `${pg.porcentaje}%` : "—" },
              { text: fmtUSD(pg.monto) },
            ])}
          />
          <Labeled label="Method">{method}.</Labeled>
          <Labeled label="Freight">{freightEN}</Labeled>
          <Para>{FIXED_TEXT.payment}</Para>
          <LabeledCN label={T_LABELS['Method']}>{method}。</LabeledCN>
          <LabeledCN label={T_LABELS['Freight']}>
            {data.fletePago === "final" ? T_FREIGHT.final : T_FREIGHT.porcentaje}
          </LabeledCN>
          <ParaCN>{FIXED_TEXT_CN.payment}</ParaCN>
        </Article>

        {/* 7. PRODUCTION AND DELIVERY */}
        <Article number="7" title="PRODUCTION AND DELIVERY">
          <Labeled label="Production completion within">
            {data.productionDays ? `${data.productionDays} calendar days` : "—"}.
          </Labeled>
          <Labeled label="Starting from">{productionStart}.</Labeled>
          <Labeled label="Estimated Ready-to-Ship Date">
            {nbsp(data.estimatedReadyToShipDate)}.
          </Labeled>
          <Para>{FIXED_TEXT.production}</Para>
          <LabeledCN label={T_LABELS['Production completion within']}>
            {data.productionDays ? `${data.productionDays} 个日历日` : "—"}。
          </LabeledCN>
          <LabeledCN label={T_LABELS['Starting from']}>{productionStart}。</LabeledCN>
          <LabeledCN label={T_LABELS['Estimated Ready-to-Ship Date']}>
            {nbsp(data.estimatedReadyToShipDate)}。
          </LabeledCN>
          <ParaCN>{FIXED_TEXT_CN.production}</ParaCN>
        </Article>

        {/* 8. INSPECTION */}
        <Article number="8" title="INSPECTION">
          <Para>{FIXED_TEXT.inspection}</Para>
          <ParaCN>{FIXED_TEXT_CN.inspection}</ParaCN>
        </Article>

        {/* 9. NON-CONFORMING PRODUCTS */}
        <Article number="9" title="NON-CONFORMING PRODUCTS">
          <Para>{FIXED_TEXT.nonConforming}</Para>
          <ParaCN>{FIXED_TEXT_CN.nonConforming}</ParaCN>
        </Article>

        {/* 10. PACKAGING */}
        <Article number="10" title="PACKAGING">
          <Para>{FIXED_TEXT.packaging}</Para>
          <ParaCN>{FIXED_TEXT_CN.packaging}</ParaCN>
        </Article>

        {/* 11. SHIPPING AND DOCUMENTATION */}
        <Article number="11" title="SHIPPING AND DOCUMENTATION">
          <Para>{FIXED_TEXT.shipping}</Para>
          <ParaCN>{FIXED_TEXT_CN.shipping}</ParaCN>
        </Article>

        {/* 12. WARRANTY */}
        <Article number="12" title="WARRANTY">
          <Labeled label="Warranty period">
            {data.warrantyMonths ? `${data.warrantyMonths} months` : "—"}.
          </Labeled>
          <Labeled label="Starting from">{nbsp(data.warrantyStart)}.</Labeled>
          <Para>{FIXED_TEXT.warranty}</Para>
          <LabeledCN label={T_LABELS['Warranty period']}>
            {data.warrantyMonths ? `${data.warrantyMonths} 个月` : "—"}。
          </LabeledCN>
          <LabeledCN label={T_LABELS['Starting from']}>{nbsp(data.warrantyStart)}。</LabeledCN>
          <ParaCN>{FIXED_TEXT_CN.warranty}</ParaCN>
        </Article>

        {/* 13. WARRANTY CLAIM PROCEDURE */}
        <Article number="13" title="WARRANTY CLAIM PROCEDURE">
          <Para>{fill(FIXED_TEXT.warrantyClaim, {
            RESPONSE: data.warrantyResponseDays,
            CORRECTIVE: data.warrantyCorrectiveDays,
          })}</Para>
          <ParaCN>{fill(FIXED_TEXT_CN.warrantyClaim, {
            RESPONSE: data.warrantyResponseDays,
            CORRECTIVE: data.warrantyCorrectiveDays,
          })}</ParaCN>
        </Article>

        {/* 14. DELAY AND LIQUIDATED DAMAGES */}
        <Article number="14" title="DELAY AND LIQUIDATED DAMAGES">
          <Para>{fill(FIXED_TEXT.delay, {
            PCT:    data.delayPercent,
            PERIOD: data.delayPeriod,
            CAP:    data.delayCapPercent,
            DAYS:   data.delayTerminationDays,
          })}</Para>
          <ParaCN>{fill(FIXED_TEXT_CN.delay, {
            PCT:    data.delayPercent,
            PERIOD: data.delayPeriod,
            CAP:    data.delayCapPercent,
            DAYS:   data.delayTerminationDays,
          })}</ParaCN>
        </Article>

        {/* 15. CHANGE OF MANUFACTURING LOCATION */}
        <Article number="15" title="CHANGE OF MANUFACTURING LOCATION">
          <Para>{FIXED_TEXT.changeLocation}</Para>
          <ParaCN>{FIXED_TEXT_CN.changeLocation}</ParaCN>
        </Article>

        {/* 16. SUBCONTRACTING */}
        <Article number="16" title="SUBCONTRACTING">
          <Para>{FIXED_TEXT.subcontracting}</Para>
          <ParaCN>{FIXED_TEXT_CN.subcontracting}</ParaCN>
        </Article>

        {/* 17. INTELLECTUAL PROPERTY AND TOOLING */}
        <Article number="17" title="INTELLECTUAL PROPERTY AND TOOLING">
          <Para>{FIXED_TEXT.ip}</Para>
          <ParaCN>{FIXED_TEXT_CN.ip}</ParaCN>
        </Article>

        {/* 18. CONFIDENTIALITY */}
        <Article number="18" title="CONFIDENTIALITY">
          <Para>{FIXED_TEXT.confidentiality}</Para>
          <ParaCN>{FIXED_TEXT_CN.confidentiality}</ParaCN>
        </Article>

        {/* 19. NON-CIRCUMVENTION */}
        <Article number="19" title="NON-CIRCUMVENTION">
          <Para>{fill(FIXED_TEXT.nonCircumvention, {
            YEARS:     data.ncDurationYears,
            TERRITORY: data.ncTerritory,
          })}</Para>
          <ParaCN>{fill(FIXED_TEXT_CN.nonCircumvention, {
            YEARS:     data.ncDurationYears,
            TERRITORY: data.ncTerritory,
          })}</ParaCN>
        </Article>

        {/* 20. COMPLIANCE AND PRODUCT SAFETY */}
        <Article number="20" title="COMPLIANCE AND PRODUCT SAFETY">
          <Para>{FIXED_TEXT.compliance}</Para>
          <ParaCN>{FIXED_TEXT_CN.compliance}</ParaCN>
        </Article>

        {/* 21. FORCE MAJEURE */}
        <Article number="21" title="FORCE MAJEURE">
          <Para>{FIXED_TEXT.forceMajeure}</Para>
          <ParaCN>{FIXED_TEXT_CN.forceMajeure}</ParaCN>
        </Article>

        {/* 22. TERMINATION */}
        <Article number="22" title="TERMINATION">
          <Para>{FIXED_TEXT.termination}</Para>
          <ParaCN>{FIXED_TEXT_CN.termination}</ParaCN>
        </Article>

        {/* 23. GOVERNING LAW */}
        <Article number="23" title="GOVERNING LAW">
          <Para>{fill(FIXED_TEXT.governingLaw, { LAW: data.governingLaw })}</Para>
          <ParaCN>{fill(FIXED_TEXT_CN.governingLaw, { LAW: data.governingLaw })}</ParaCN>
        </Article>

        {/* 24. DISPUTE RESOLUTION */}
        <Article number="24" title="DISPUTE RESOLUTION">
          <Para>{fill(FIXED_TEXT.dispute, {
            DAYS:        data.negotiationDays || "30",
            INSTITUTION: data.arbitrationInstitution,
            SEAT:        data.arbitrationSeat,
            LANG:        arbLang,
          })}</Para>
          <ParaCN>{fill(FIXED_TEXT_CN.dispute, {
            DAYS:        data.negotiationDays || "30",
            INSTITUTION: data.arbitrationInstitution,
            SEAT:        data.arbitrationSeat,
            LANG:        arbLang,
          })}</ParaCN>
        </Article>

        {/* 25. LANGUAGE */}
        <Article number="25" title="LANGUAGE">
          <Labeled label="Executed in">{executedEn}.</Labeled>
          <Para>{fill(FIXED_TEXT.language, { CONTROLLING: controllingEn })}</Para>
          <LabeledCN label={T_LABELS['Executed in']}>{executedCn}。</LabeledCN>
          <ParaCN>{fill(FIXED_TEXT_CN.language, { CONTROLLING: controllingCn })}</ParaCN>
        </Article>

        {/* 26. ELECTRONIC SIGNATURES */}
        <Article number="26" title="ELECTRONIC SIGNATURES AND DIGITAL RECORDS">
          <Para>{FIXED_TEXT.electronic}</Para>
          <ParaCN>{FIXED_TEXT_CN.electronic}</ParaCN>
        </Article>

        {/* 27. ENTIRE AGREEMENT */}
        <Article number="27" title="ENTIRE AGREEMENT">
          <Para>{FIXED_TEXT.entire}</Para>
          <ParaCN>{FIXED_TEXT_CN.entire}</ParaCN>
        </Article>

        {/* 28. NOTICES */}
        <Article number="28" title="NOTICES">
          <View style={styles.noticesRow}>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>
                <Text style={{ fontFamily: CN_FONT }}>买方 </Text>THE BUYER
              </Text>
              <Text style={styles.noticeLine}><Text style={{ fontFamily: CN_FONT }}>姓名 Name: </Text><CNText>{nbsp(data.buyerNoticeName)}</CNText></Text>
              <Text style={styles.noticeLine}><Text style={{ fontFamily: CN_FONT }}>邮箱 Email: </Text>{nbsp(data.buyerNoticeEmail)}</Text>
              <Text style={styles.noticeLine}><Text style={{ fontFamily: CN_FONT }}>地址 Address: </Text><CNText>{nbsp(data.buyerNoticeAddress)}</CNText></Text>
            </View>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>
                <Text style={{ fontFamily: CN_FONT }}>供应商 </Text>THE SUPPLIER
              </Text>
              <Text style={styles.noticeLine}><Text style={{ fontFamily: CN_FONT }}>姓名 Name: </Text><CNText>{nbsp(data.supplierNoticeName)}</CNText></Text>
              <Text style={styles.noticeLine}><Text style={{ fontFamily: CN_FONT }}>邮箱 Email: </Text>{nbsp(data.supplierNoticeEmail)}</Text>
              <Text style={styles.noticeLine}><Text style={{ fontFamily: CN_FONT }}>地址 Address: </Text><CNText>{nbsp(data.supplierNoticeAddress)}</CNText></Text>
            </View>
          </View>
          <Para>{FIXED_TEXT.noticesBoilerplate}</Para>
          <ParaCN>{FIXED_TEXT_CN.noticesBoilerplate}</ParaCN>
        </Article>

        {/* 29. ANNEXES */}
        <Article number="29" title="ANNEXES">
          <Para>{FIXED_TEXT.annexes}</Para>
          <ParaCN>{FIXED_TEXT_CN.annexes}</ParaCN>
        </Article>

        {/* 30. SIGNATURES */}
        <Article number="30" title="SIGNATURES">
          <Text style={styles.witness}>
            IN WITNESS WHEREOF, the Parties have caused this Agreement to be executed by their duly
            authorized representatives as of the date first written above.
          </Text>
          <Text style={styles.witness}>
            <CNText>兹证明，双方已促使其正式授权代表于文首所载日期签署本协议。</CNText>
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureFor}>For and on behalf of{"\n"}THE BUYER:</Text>
              <Text style={[styles.signatureFor, { fontFamily: CN_FONT }]}>代表买方签署：</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureParty}>{nbsp(data.buyerLegalName)}</Text>
              <Text style={styles.signatureMeta}><Text style={{ fontFamily: CN_FONT }}>姓名 Name: </Text>{nbsp(data.buyerSigner)}</Text>
              <Text style={styles.signatureMeta}><Text style={{ fontFamily: CN_FONT }}>职务 Title: </Text>{nbsp(data.buyerSignerPosition)}</Text>
              <Text style={styles.signatureMeta}><Text style={{ fontFamily: CN_FONT }}>日期 Date: </Text>{nbsp(data.buyerSignDate)}</Text>
              <Text style={styles.signatureMeta}><Text style={{ fontFamily: CN_FONT }}>（公司盖章/印鉴 Company stamp / seal）</Text></Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureFor}>For and on behalf of{"\n"}THE SUPPLIER:</Text>
              <Text style={[styles.signatureFor, { fontFamily: CN_FONT }]}>代表供应商签署：</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureParty}><CNText fallback="Times-Bold">{nbsp(data.supplierLegalName)}</CNText></Text>
              <Text style={styles.signatureMeta}><Text style={{ fontFamily: CN_FONT }}>姓名 Name: </Text><CNText>{nbsp(data.supplierSigner)}</CNText></Text>
              <Text style={styles.signatureMeta}><Text style={{ fontFamily: CN_FONT }}>职务 Title: </Text><CNText>{nbsp(data.supplierSignerPosition)}</CNText></Text>
              <Text style={styles.signatureMeta}><Text style={{ fontFamily: CN_FONT }}>日期 Date: </Text>{nbsp(data.supplierSignDate)}</Text>
              <Text style={styles.signatureMeta}><Text style={{ fontFamily: CN_FONT }}>（公司盖章/印鉴 Company stamp / seal）</Text></Text>
            </View>
          </View>
        </Article>

        {/* Pie */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>国际采购协议 International Purchase Agreement</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `第 ${pageNumber} 页 / 共 ${totalPages} 页  Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* ══ ANNEX A ══ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={[styles.annexTitle, { fontFamily: CN_FONT }]}>附件A——技术规格</Text>
        <Text style={styles.annexTitle}>ANNEX A — TECHNICAL SPECIFICATIONS</Text>
        <Text style={[styles.annexSub, { fontFamily: CN_FONT }]}>
          国际采购协议 International Purchase Agreement{data.numero ? ` · 合同编号 Contract No. ${data.numero}` : ""}
        </Text>
        <View style={styles.titleRule} />

        <Para>
          The technical specifications of the Products are those set forth in Article 3
          (Products) of this Agreement, reproduced below for convenience:
        </Para>
        <ParaCN>
          产品的技术规格为本协议第3条（产品）所述规格，为方便起见转载如下：
        </ParaCN>

        {partidas.length > 0 ? (
          <>
            <LegalTable
              header={[
                ['产品/型号', 'PRODUCT / MODEL'],
                ['规格', 'SPECIFICATION'],
                ['数量', 'QUANTITY'],
                ['单价（美元）', 'UNIT PRICE (USD)'],
                ['总额（美元）', 'TOTAL (USD)'],
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
              <Text style={{ fontFamily: CN_FONT }}>合同总价 </Text>
              Total Contract Value: {fmtUSD(totalValue)} {data.currency || "USD"}
            </Text>
          </>
        ) : (
          <Para>{'—'}</Para>
        )}

        <Para>
          The Products shall comply with the quality requirements, standards and
          specifications set forth in Article 4 (Quality and Specifications) of this
          Agreement. The Supplier shall not make material changes to the specifications,
          materials, components or production processes without the Buyer’s prior written
          approval.
        </Para>
        <ParaCN>
          产品应符合本协议第4条（质量与规格）所述的质量要求、标准和规格。未经买方事先书面批准，
          供应商不得对规格、材料、零部件或生产工艺进行重大变更。
        </ParaCN>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>附件A——技术规格 Annex A — Technical Specifications</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `第 ${pageNumber} 页 / 共 ${totalPages} 页  Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* ══ ANNEX B (landscape) ══ */}
      <Page size="A4" orientation="landscape" style={styles.pageLandscape} wrap>
        <Text style={[styles.annexTitle, { fontFamily: CN_FONT }]}>附件B——商业条款</Text>
        <Text style={styles.annexTitle}>ANNEX B — COMMERCIAL TERMS</Text>
        <Text style={[styles.annexSub, { fontFamily: CN_FONT }]}>
          国际采购协议 International Purchase Agreement{data.numero ? ` · 合同编号 Contract No. ${data.numero}` : ""}
        </Text>
        <View style={styles.titleRule} />

        <Para>
          The following commercial terms are those set forth in the main body of this
          Agreement (Articles 3, 5, 6, 7 and 12), summarized by Product:
        </Para>
        <ParaCN>
          以下商业条款为本协议正文（第3、5、6、7和12条）所述条款，按产品汇总如下：
        </ParaCN>

        <LegalTable
          header={[
            ['采购订单号', 'PO NUMBER'],
            ['产品', 'PRODUCT'],
            ['数量', 'QTY'],
            ['单价', 'UNIT PRICE'],
            ['总额', 'TOTAL'],
            ['贸易术语', 'INCOTERM'],
            ['装运港', 'LOADING PORT'],
            ['目的地', 'DESTINATION'],
            ['交货期', 'LEAD TIME'],
            ['付款条款', 'PAYMENT TERMS'],
            ['质保', 'WARRANTY'],
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
          <Text style={styles.footerText}>附件B——商业条款 Annex B — Commercial Terms</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `第 ${pageNumber} 页 / 共 ${totalPages} 页  Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* ══ ANNEX C + D ══ */}
      <Page size="A4" style={styles.page} wrap>

        {/* ANNEX C */}
        <Text style={[styles.annexTitle, { fontFamily: CN_FONT }]}>附件C——检验与验收协议</Text>
        <Text style={styles.annexTitle}>ANNEX C — INSPECTION AND ACCEPTANCE PROTOCOL</Text>
        <Text style={[styles.annexSub, { fontFamily: CN_FONT }]}>
          国际采购协议 International Purchase Agreement{data.numero ? ` · 合同编号 Contract No. ${data.numero}` : ""}
        </Text>
        <View style={styles.titleRule} />

        <Text style={styles.labeled}>
          <Text style={{ fontFamily: CN_FONT }}>{T_LABELS['Inspection Company']} Inspection Company: </Text>
          <CNText>{nbsp(data.inspectionCompany)}.</CNText>
        </Text>
        <Text style={styles.labeled}>
          <Text style={{ fontFamily: CN_FONT }}>{T_LABELS['Location (Factory)']} Location (Factory): </Text>
          <CNText>{nbsp(data.inspectionLocation)}.</CNText>
        </Text>
        <Text style={styles.labeled}>
          <Text style={{ fontFamily: CN_FONT }}>{T_LABELS['Date']} Date: </Text>
          <CNText>{nbsp(data.inspectionDate)}.</CNText>
        </Text>
        <Text style={styles.labeled}>
          <Text style={{ fontFamily: CN_FONT }}>{T_LABELS['Checklist']} Checklist:</Text>
        </Text>
        {checklistC.length > 0
          ? (
            <View style={styles.bulletList}>
              {checklistC.map((it, i) => (
                <Text key={i} style={styles.bullet}>
                  - <Text style={{ fontFamily: CN_FONT }}>{T_CHECKLIST[it] || it}</Text> {it}
                </Text>
              ))}
            </View>
          )
          : <Para>{'—'}</Para>}
        <Text style={styles.labeled}>
          <Text style={{ fontFamily: CN_FONT }}>{T_LABELS['Acceptance Standard']} Acceptance Standard: </Text>
          <CNText>{nbsp(inspectionStandard)}.</CNText>
        </Text>

        {/* ANNEX D */}
        <View style={{ marginTop: 24 }} wrap={false}>
          <Text style={[styles.annexTitle, { fontFamily: CN_FONT }]}>附件D——运输单据</Text>
          <Text style={styles.annexTitle}>ANNEX D — SHIPPING DOCUMENTS</Text>
          <View style={styles.titleRule} />
          <Text style={styles.para}>
            The Supplier shall provide the following documents as required under this Agreement:
          </Text>
          <ParaCN>供应商应按本协议要求提供下列单据：</ParaCN>
          <CheckList options={ANNEX_D_DOCS.map(d => [T_DOCS[d] || d, d])} selected={docsD} />
          {data.annexDOther && (
            <View style={styles.checklistRow} wrap={false}>
              <Text style={styles.checklistMark}>[X]</Text>
              <Text style={styles.checklistItem}>
                <Text style={{ fontFamily: CN_FONT }}>其他 Other</Text>: {data.annexDOther}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>附件C/D Annexes C &amp; D</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `第 ${pageNumber} 页 / 共 ${totalPages} 页  Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default ContratoPDF;
