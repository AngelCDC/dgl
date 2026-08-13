// components/ContratoPDF.js — International Purchase Agreement (EN)
// Formato legal tradicional: Times, texto justificado, sin branding corporativo.
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const INK = "#000000";

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
    fontSize: 8.5,
    fontFamily: "Times-Bold",
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
    marginBottom: 4,
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
  footerText: { fontSize: 8, fontFamily: "Times-Roman" },
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
  language: 'This Agreement may be executed in English, Chinese, or English and Chinese. In the event of any inconsistency, the controlling language shall be: {CONTROLLING}.',
  electronic: 'Electronic signatures and digital records may be used as evidence to the extent permitted by law. Platform order, payment and transaction records may be incorporated by express reference.',
  entire: 'This Agreement, together with the PI, PO, Technical Specifications, Inspection Protocol and the Annexes expressly incorporated herein, constitutes the entire agreement between the Parties. Amendments shall be made in writing and approved by the authorized representatives of both Parties.',
  annexes: 'The Annexes listed below are attached hereto and form an integral part of this Agreement: Annex A — Technical Specifications; Annex B — Commercial Terms; Annex C — Inspection and Acceptance Protocol; Annex D — Shipping Documents. In the event of any conflict between the main body of this Agreement and any Annex, the main body shall prevail, unless otherwise expressly stated.',
  noticesBoilerplate: 'All notices, requests, demands and other communications required or permitted under this Agreement shall be made in writing and delivered personally, by email, or by internationally recognized courier service to the addresses set forth above, or to such other address as a Party may designate in writing. Notices shall be deemed effective upon receipt if delivered personally or by email, or upon signature of receipt if sent by courier.',
};

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
const Article = ({ number, title, children }) => (
  <View style={styles.article} wrap={false}>
    <Text style={styles.articleTitle}>ARTICLE {number} — {title}</Text>
    {children}
  </View>
);

const Para = ({ children }) => <Text style={styles.para}>{children}</Text>;

// Párrafo con etiqueta en negrita ("Label: value.")
const Labeled = ({ label, children }) => (
  <Text style={styles.labeled}>
    <Text style={{ fontFamily: "Times-Bold" }}>{label}:</Text> {children}
  </Text>
);

// Tabla clásica con bordes
const LegalTable = ({ header, rows, widths }) => (
  <View style={styles.table}>
    <View style={styles.tableHeader} wrap={false}>
      {header.map((h, i) => (
        <Text
          key={i}
          style={[styles.tableHeaderCell, widths[i], i === header.length - 1 && { borderRight: "none" }]}
        >
          {h}
        </Text>
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
            ]}
          >
            {cell?.text ?? "—"}
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
          <Text style={styles.checklistItem}>{opt}</Text>
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
        <Text style={styles.docMeta}>
          Date: {nbsp(data.fecha)}{data.numero ? `     ·     Contract No.: ${data.numero}` : ""}
        </Text>
        <View style={styles.titleRule} />

        {/* Partes */}
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
          <Text style={{ fontFamily: "Times-Bold" }}>{nbsp(data.supplierLegalName)}</Text>
          {data.supplierTradeName ? ` (${data.supplierTradeName}),` : ","} a company duly organized and
          validly existing under the laws of the People’s Republic of China, holding Unified Social
          Credit Code No. {nbsp(data.supplierUscc)}, with its registered address at{" "}
          {nbsp(data.supplierAddress)}, represented by {nbsp(data.supplierLegalRepresentative)},{" "}
          {nbsp(data.supplierPosition)} (hereinafter referred to as the
          “<Text style={{ fontFamily: "Times-Bold" }}>Supplier</Text>”).
        </Text>
        <Text style={styles.para}>
          The Buyer and the Supplier are hereinafter referred to individually as a “Party”
          and collectively as the “Parties”.
        </Text>

        {/* Recitales */}
        <Text style={styles.whereHeading}>RECITALS</Text>
        <Text style={styles.paraIndent}>WHEREAS, {FIXED_TEXT.recital1}</Text>
        <Text style={styles.paraIndent}>WHEREAS, {FIXED_TEXT.recital2}</Text>
        <Text style={styles.leadIn}>{FIXED_TEXT.therefore}</Text>

        {/* 1. PARTIES */}
        <Article number="1" title="PARTIES">
          <Para>{FIXED_TEXT.parties}</Para>
        </Article>

        {/* 2. PURPOSE */}
        <Article number="2" title="PURPOSE OF THE AGREEMENT">
          <Para>{FIXED_TEXT.summary}</Para>
          <Para>{FIXED_TEXT.purpose}</Para>
        </Article>

        {/* 3. PRODUCTS */}
        <Article number="3" title="PRODUCTS">
          <LegalTable
            header={["PRODUCT / MODEL", "SPECIFICATION", "QUANTITY", "UNIT PRICE (USD)", "TOTAL (USD)"]}
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
            Total Contract Value: {fmtUSD(totalValue)} {data.currency || "USD"}
          </Text>
          <Para>{FIXED_TEXT.products}</Para>
        </Article>

        {/* 4. QUALITY */}
        <Article number="4" title="QUALITY AND SPECIFICATIONS">
          <Para>{FIXED_TEXT.quality}</Para>
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
        </Article>

        {/* 6. PAYMENT TERMS */}
        <Article number="6" title="PAYMENT TERMS">
          <LegalTable
            header={["INSTALLMENT", "PERCENT", "AMOUNT (USD)"]}
            widths={[styles.cConcepto, styles.cPct, styles.cMonto]}
            rows={pagos.map(pg => [
              { text: pg.concepto },
              { text: pg.porcentaje ? `${pg.porcentaje}%` : "—" },
              { text: fmtUSD(pg.monto) },
            ])}
          />
          <Labeled label="Method">{method}.</Labeled>
          <Para>{FIXED_TEXT.payment}</Para>
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
        </Article>

        {/* 8. INSPECTION */}
        <Article number="8" title="INSPECTION">
          <Para>{FIXED_TEXT.inspection}</Para>
        </Article>

        {/* 9. NON-CONFORMING PRODUCTS */}
        <Article number="9" title="NON-CONFORMING PRODUCTS">
          <Para>{FIXED_TEXT.nonConforming}</Para>
        </Article>

        {/* 10. PACKAGING */}
        <Article number="10" title="PACKAGING">
          <Para>{FIXED_TEXT.packaging}</Para>
        </Article>

        {/* 11. SHIPPING AND DOCUMENTATION */}
        <Article number="11" title="SHIPPING AND DOCUMENTATION">
          <Para>{FIXED_TEXT.shipping}</Para>
        </Article>

        {/* 12. WARRANTY */}
        <Article number="12" title="WARRANTY">
          <Labeled label="Warranty period">
            {data.warrantyMonths ? `${data.warrantyMonths} months` : "—"}.
          </Labeled>
          <Labeled label="Starting from">{nbsp(data.warrantyStart)}.</Labeled>
          <Para>{FIXED_TEXT.warranty}</Para>
        </Article>

        {/* 13. WARRANTY CLAIM PROCEDURE */}
        <Article number="13" title="WARRANTY CLAIM PROCEDURE">
          <Para>{fill(FIXED_TEXT.warrantyClaim, {
            RESPONSE: data.warrantyResponseDays,
            CORRECTIVE: data.warrantyCorrectiveDays,
          })}</Para>
        </Article>

        {/* 14. DELAY AND LIQUIDATED DAMAGES */}
        <Article number="14" title="DELAY AND LIQUIDATED DAMAGES">
          <Para>{fill(FIXED_TEXT.delay, {
            PCT:    data.delayPercent,
            PERIOD: data.delayPeriod,
            CAP:    data.delayCapPercent,
            DAYS:   data.delayTerminationDays,
          })}</Para>
        </Article>

        {/* 15. CHANGE OF MANUFACTURING LOCATION */}
        <Article number="15" title="CHANGE OF MANUFACTURING LOCATION">
          <Para>{FIXED_TEXT.changeLocation}</Para>
        </Article>

        {/* 16. SUBCONTRACTING */}
        <Article number="16" title="SUBCONTRACTING">
          <Para>{FIXED_TEXT.subcontracting}</Para>
        </Article>

        {/* 17. INTELLECTUAL PROPERTY AND TOOLING */}
        <Article number="17" title="INTELLECTUAL PROPERTY AND TOOLING">
          <Para>{FIXED_TEXT.ip}</Para>
        </Article>

        {/* 18. CONFIDENTIALITY */}
        <Article number="18" title="CONFIDENTIALITY">
          <Para>{FIXED_TEXT.confidentiality}</Para>
        </Article>

        {/* 19. NON-CIRCUMVENTION */}
        <Article number="19" title="NON-CIRCUMVENTION">
          <Para>{fill(FIXED_TEXT.nonCircumvention, {
            YEARS:     data.ncDurationYears,
            TERRITORY: data.ncTerritory,
          })}</Para>
        </Article>

        {/* 20. COMPLIANCE AND PRODUCT SAFETY */}
        <Article number="20" title="COMPLIANCE AND PRODUCT SAFETY">
          <Para>{FIXED_TEXT.compliance}</Para>
        </Article>

        {/* 21. FORCE MAJEURE */}
        <Article number="21" title="FORCE MAJEURE">
          <Para>{FIXED_TEXT.forceMajeure}</Para>
        </Article>

        {/* 22. TERMINATION */}
        <Article number="22" title="TERMINATION">
          <Para>{FIXED_TEXT.termination}</Para>
        </Article>

        {/* 23. GOVERNING LAW */}
        <Article number="23" title="GOVERNING LAW">
          <Para>{fill(FIXED_TEXT.governingLaw, { LAW: data.governingLaw })}</Para>
        </Article>

        {/* 24. DISPUTE RESOLUTION */}
        <Article number="24" title="DISPUTE RESOLUTION">
          <Para>{fill(FIXED_TEXT.dispute, {
            DAYS:        data.negotiationDays || "30",
            INSTITUTION: data.arbitrationInstitution,
            SEAT:        data.arbitrationSeat,
            LANG:        arbLang,
          })}</Para>
        </Article>

        {/* 25. LANGUAGE */}
        <Article number="25" title="LANGUAGE">
          <Labeled label="Executed in">{nbsp(data.executedIn)}.</Labeled>
          <Para>{fill(FIXED_TEXT.language, { CONTROLLING: data.controllingLanguage })}</Para>
        </Article>

        {/* 26. ELECTRONIC SIGNATURES */}
        <Article number="26" title="ELECTRONIC SIGNATURES AND DIGITAL RECORDS">
          <Para>{FIXED_TEXT.electronic}</Para>
        </Article>

        {/* 27. ENTIRE AGREEMENT */}
        <Article number="27" title="ENTIRE AGREEMENT">
          <Para>{FIXED_TEXT.entire}</Para>
        </Article>

        {/* 28. NOTICES */}
        <Article number="28" title="NOTICES">
          <View style={styles.noticesRow}>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>THE BUYER</Text>
              <Text style={styles.noticeLine}>Name: {nbsp(data.buyerNoticeName)}</Text>
              <Text style={styles.noticeLine}>Email: {nbsp(data.buyerNoticeEmail)}</Text>
              <Text style={styles.noticeLine}>Address: {nbsp(data.buyerNoticeAddress)}</Text>
            </View>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>THE SUPPLIER</Text>
              <Text style={styles.noticeLine}>Name: {nbsp(data.supplierNoticeName)}</Text>
              <Text style={styles.noticeLine}>Email: {nbsp(data.supplierNoticeEmail)}</Text>
              <Text style={styles.noticeLine}>Address: {nbsp(data.supplierNoticeAddress)}</Text>
            </View>
          </View>
          <Para>{FIXED_TEXT.noticesBoilerplate}</Para>
        </Article>

        {/* 29. ANNEXES */}
        <Article number="29" title="ANNEXES">
          <Para>{FIXED_TEXT.annexes}</Para>
        </Article>

        {/* 30. SIGNATURES */}
        <Article number="30" title="SIGNATURES">
          <Text style={styles.witness}>
            IN WITNESS WHEREOF, the Parties have caused this Agreement to be executed by their duly
            authorized representatives as of the date first written above.
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureFor}>For and on behalf of{"\n"}THE BUYER:</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureParty}>{nbsp(data.buyerLegalName)}</Text>
              <Text style={styles.signatureMeta}>Name: {nbsp(data.buyerSigner)}</Text>
              <Text style={styles.signatureMeta}>Title: {nbsp(data.buyerSignerPosition)}</Text>
              <Text style={styles.signatureMeta}>Date: {nbsp(data.buyerSignDate)}</Text>
              <Text style={styles.signatureMeta}>(Company stamp / seal)</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureFor}>For and on behalf of{"\n"}THE SUPPLIER:</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureParty}>{nbsp(data.supplierLegalName)}</Text>
              <Text style={styles.signatureMeta}>Name: {nbsp(data.supplierSigner)}</Text>
              <Text style={styles.signatureMeta}>Title: {nbsp(data.supplierSignerPosition)}</Text>
              <Text style={styles.signatureMeta}>Date: {nbsp(data.supplierSignDate)}</Text>
              <Text style={styles.signatureMeta}>(Company stamp / seal)</Text>
            </View>
          </View>
        </Article>

        {/* Pie */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>International Purchase Agreement</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* ══ ANNEX A ══ */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.annexTitle}>ANNEX A — TECHNICAL SPECIFICATIONS</Text>
        <Text style={styles.annexSub}>International Purchase Agreement {data.numero ? `· Contract No. ${data.numero}` : ""}</Text>
        <View style={styles.titleRule} />

        <Para>
          The technical specifications of the Products are those set forth in Article 3
          (Products) of this Agreement, reproduced below for convenience:
        </Para>

        {partidas.length > 0 ? (
          <>
            <LegalTable
              header={["PRODUCT / MODEL", "SPECIFICATION", "QUANTITY", "UNIT PRICE (USD)", "TOTAL (USD)"]}
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

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Annex A — Technical Specifications</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>

      {/* ══ ANNEX B (landscape) ══ */}
      <Page size="A4" orientation="landscape" style={styles.pageLandscape} wrap>
        <Text style={styles.annexTitle}>ANNEX B — COMMERCIAL TERMS</Text>
        <Text style={styles.annexSub}>International Purchase Agreement {data.numero ? `· Contract No. ${data.numero}` : ""}</Text>
        <View style={styles.titleRule} />

        <Para>
          The following commercial terms are those set forth in the main body of this
          Agreement (Articles 3, 5, 6, 7 and 12), summarized by Product:
        </Para>

        <LegalTable
          header={["PO NUMBER", "PRODUCT", "QTY", "UNIT PRICE", "TOTAL", "INCOTERM", "LOADING PORT", "DESTINATION", "LEAD TIME", "PAYMENT TERMS", "WARRANTY"]}
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
          <Text style={styles.footerText}>Annex B — Commercial Terms</Text>
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
        <Text style={styles.annexSub}>International Purchase Agreement {data.numero ? `· Contract No. ${data.numero}` : ""}</Text>
        <View style={styles.titleRule} />

        <Labeled label="Inspection Company">{nbsp(data.inspectionCompany)}.</Labeled>
        <Labeled label="Location (Factory)">{nbsp(data.inspectionLocation)}.</Labeled>
        <Labeled label="Date">{nbsp(data.inspectionDate)}.</Labeled>
        <Text style={styles.labeled}><Text style={{ fontFamily: "Times-Bold" }}>Checklist:</Text></Text>
        {checklistC.length > 0
          ? <BulletList items={checklistC} />
          : <Para>{'—'}</Para>}
        <Labeled label="Acceptance Standard">
          {nbsp(inspectionStandard)}.
        </Labeled>

        {/* ANNEX D */}
        <View style={{ marginTop: 24 }} wrap={false}>
          <Text style={styles.annexTitle}>ANNEX D — SHIPPING DOCUMENTS</Text>
          <View style={styles.titleRule} />
          <Text style={styles.para}>
            The Supplier shall provide the following documents as required under this Agreement:
          </Text>
          <CheckList options={ANNEX_D_DOCS} selected={docsD} />
          {data.annexDOther && (
            <View style={styles.checklistRow} wrap={false}>
              <Text style={styles.checklistMark}>[X]</Text>
              <Text style={styles.checklistItem}>Other: {data.annexDOther}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Annexes C &amp; D</Text>
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
