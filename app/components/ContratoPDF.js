// components/ContratoPDF.js — International Purchase Agreement (EN)
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const C = {
  navy:     "#0a1628",
  corp:     "#1a3a6b",
  electric: "#2563eb",
  white:    "#ffffff",
  bgSoft:   "#f4f6f9",
  carbon:   "#0d0d0d",
  steel:    "#5a6478",
  border:   "#dce3ed",
};

const HEADER_HEIGHT = 70;
const ACCENT_STRIPE_HEIGHT = 3;
const PAGE_TOP_GAP = 20;
const PAGE_TOP_OFFSET = HEADER_HEIGHT + ACCENT_STRIPE_HEIGHT + PAGE_TOP_GAP;

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    paddingTop: PAGE_TOP_OFFSET,
    paddingBottom: 60,
    paddingHorizontal: 0,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: C.carbon,
  },
  header: {
    backgroundColor: C.navy,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    height: HEADER_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  monogram: {
    width: 38,
    height: 38,
    border: "1.5pt solid #2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  monogramText: {
    color: C.white,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  headerTextBlock: { flexDirection: "column" },
  headerBrand: {
    color: C.white,
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
  },
  headerSlogan: {
    color: "#7a90b0",
    fontSize: 7.5,
    letterSpacing: 2,
    marginTop: 2,
  },
  accentStripe: {
    height: ACCENT_STRIPE_HEIGHT,
    backgroundColor: C.electric,
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
  },

  body: { paddingHorizontal: 32 },

  docTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  docTitleUnderline: {
    height: 2,
    width: 48,
    backgroundColor: C.electric,
    marginBottom: 8,
  },
  docDate: {
    fontSize: 9.5,
    color: C.steel,
    marginBottom: 14,
  },

  summaryBox: {
    border: `1pt solid ${C.border}`,
    borderLeft: `3pt solid ${C.electric}`,
    backgroundColor: C.bgSoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  summaryText: { fontSize: 9, color: C.carbon, lineHeight: 1.5 },

  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    backgroundColor: C.corp,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  clauseText: {
    fontSize: 9,
    color: C.carbon,
    lineHeight: 1.6,
    paddingHorizontal: 10,
    marginBottom: 4,
  },

  partiesRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 10,
  },
  partyBox: {
    flex: 1,
    border: `0.5pt solid ${C.border}`,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  partyTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    backgroundColor: C.bgSoft,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 150,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.steel,
    flexShrink: 0,
  },
  value: {
    flex: 1,
    fontSize: 8.5,
    color: C.carbon,
  },

  table: {
    marginTop: 6,
    marginBottom: 8,
    marginHorizontal: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.navy,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.white,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `0.5pt solid ${C.border}`,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: `0.5pt solid ${C.border}`,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: C.bgSoft,
  },
  tableCell: { fontSize: 8.5, color: C.carbon },

  // Cols tabla de partidas
  cProduct:   { width: 160 },
  cSpec:      { flex: 1 },
  cQty:       { width: 80 },
  cPrice:     { width: 100, textAlign: "right" },
  cTotal:     { width: 110, textAlign: "right" },

  // Cols tabla de pagos
  cConcepto:  { width: 180 },
  cPct:       { width: 90, textAlign: "right" },
  cMonto:     { flex: 1, textAlign: "right" },

  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
  },
  totalValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: C.electric,
    marginLeft: 8,
  },

  bulletList: { paddingHorizontal: 16, marginBottom: 4 },
  bullet: {
    fontSize: 9,
    color: C.carbon,
    lineHeight: 1.5,
  },

  checklistRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingHorizontal: 10,
  },
  checklistMark: { width: 20, fontSize: 8.5, color: C.electric },
  checklistItem: { flex: 1, fontSize: 8.5, color: C.carbon },

  signatureSection: {
    marginTop: 36,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "center",
    gap: 60,
  },
  signatureBox: {
    width: "38%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTop: `1pt solid ${C.border}`,
    marginTop: 30,
    marginBottom: 6,
  },
  signatureRole: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.electric,
    textAlign: "center",
  },
  signatureName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 4,
  },
  signatureMeta: {
    fontSize: 8,
    color: C.steel,
    textAlign: "center",
    marginTop: 2,
  },

  annexTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  annexStripe: {
    height: 2,
    width: 40,
    backgroundColor: C.electric,
    marginBottom: 12,
  },

  // Annex B landscape
  cB1: { width: 100 },
  cB2: { width: 120 },
  cB3: { width: 70, textAlign: "right" },
  cB4: { width: 90, textAlign: "right" },
  cB5: { width: 100, textAlign: "right" },
  cB6: { width: 80 },
  cB7: { width: 100 },
  cB8: { width: 100 },
  cB9: { width: 90 },
  cB10: { width: 120 },
  cB11: { width: 90 },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 28,
    right: 28,
    borderTop: `1pt solid ${C.border}`,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft:  { color: C.steel, fontSize: 7, letterSpacing: 0.8 },
  footerRight: { color: C.steel, fontSize: 7 },
  footerAccent: { color: C.electric, fontFamily: "Helvetica-Bold" },
});

// ─── Cláusulas fijas (texto del formato base — no se guardan en BD) ──────────
const FIXED_TEXT = {
  summary: 'This International Purchase Agreement ("Agreement") is entered into by and between Buyer and Supplier for manufacture and/or sale of products under agreed specifications, pricing, payment, production, inspection, warranty, and related commercial/legal terms.',
  purpose: 'Supplier agrees to manufacture and/or sell, and Buyer agrees to purchase, products described in the Agreement, applicable Proforma Invoice (PI), and Technical Specifications. Supplier shall supply strictly according to agreed specifications, quantities, quality, packaging, delivery terms, and annexes.',
  products: 'Detailed specifications in Annex A. Supplier shall not make material changes without Buyer\'s prior written approval.',
  quality: 'Products must comply with agreed specifications, be new, unused and free from defects, comply with technical standards/certifications, match approved samples/drawings/datasheets, and be suitable for intended commercial use. Deviations require prior written approval.',
  price: 'Price includes Supplier-responsibility costs under Incoterm unless otherwise stated. No post-confirmation price increase without consent.',
  payment: 'Final payment due after production completion, successful inspection, compliance confirmation, required documentation, and shipment readiness. Payments only to registered Supplier legal entity account unless approved in writing.',
  production: 'Supplier must promptly notify delays and shall not materially delay without prior written approval.',
  inspection: 'Buyer may inspect pre-shipment by Buyer, third-party inspector, authorized representative, or mutually agreed party. Scope may include quantity, dimensions, weight, appearance, materials, functionality, performance, packaging, labeling, accessories, documentation, and technical specifications. Supplier to provide reasonable access. Failed inspection is not acceptance. Details in Annex C.',
  nonConforming: 'Buyer remedies may include repair/rework, replacement, partial refund, rejection, full refund for material non-conformity, and Supplier bearing reasonable related costs. Supplier bears costs for correcting Supplier-caused defects, including rework/replacement/transportation where applicable.',
  packaging: 'Supplier must package per agreed specifications; suitable for international transport and protection against impact, moisture, corrosion, dust, compression, and normal handling. Packages must include required shipping marks and product/shipping information.',
  shipping: 'Supplier to provide required documents under transaction and Incoterm, including (as applicable): Commercial Invoice, Packing List, Bill of Lading/Sea Waybill, Certificate of Origin, Certificate of Conformity, Test Reports, Warranty Certificate, Technical Datasheet, User Manual, MSDS/SDS, UN38.3, export documentation, Inspection Certificate, and other reasonably required documents. Draft shipping documents to be provided for review when applicable. See Annex D.',
  warranty: 'Covers defects from manufacturing, materials, workmanship, components, and non-compliance with specifications. Excludes misuse, unauthorized modification, improper installation, or causes outside Supplier control unless agreed. Remedies: repair, replacement, or appropriate refund.',
  warrantyClaim: 'Buyer notifies Supplier with supporting evidence. Supplier response within {RESPONSE} business days and proposed corrective action within {CORRECTIVE} business days.',
  delay: 'Liquidated damages: {PCT}% of delayed goods value per {PERIOD}, capped at {CAP}% of affected goods value. If delay exceeds {DAYS} calendar days, Buyer may terminate affected portion and request refund for undelivered goods subject to dispute provisions.',
  changeLocation: 'No transfer to another factory/subcontractor/location without prior written approval. Unauthorized transfer is material breach.',
  subcontracting: 'Supplier remains responsible for quality/specifications/delivery/performance regardless of subcontracting and must obtain prior written approval for material subcontracting.',
  ip: 'Buyer-supplied/paid drawings, designs, specifications, artwork, molds, tooling, packaging designs, technical information remain Buyer property unless otherwise agreed. Supplier must not misuse, transfer, manufacture unauthorized products, or disclose related confidential information.',
  confidentiality: 'Each Party keeps non-public commercial/technical/financial/business information confidential; disclosure only with written authorization, legal requirement, or necessity to perform agreement.',
  nonCircumvention: 'Where Buyer is sourcing agent/intermediary/representative, Supplier shall not intentionally circumvent Buyer with introduced customers to avoid Buyer involvement. Duration: {YEARS} years. Territory: {TERRITORY}. Applies only to directly introduced opportunities.',
  compliance: 'Supplier states products comply with applicable agreed requirements and shall not knowingly infringe third-party IP. Supplier to provide valid certifications/test reports for actual supplied products and not provide falsified/altered/expired/misleading documentation.',
  forceMajeure: 'Neither Party liable for non-performance caused by events beyond reasonable control (e.g., natural disasters, war, government restrictions, embargoes). Affected Party must notify promptly and provide evidence. Does not automatically excuse prior obligations.',
  termination: 'Buyer may terminate for material breach, late delivery without extension, materially non-conforming products, false/fraudulent documentation, unauthorized manufacturing-location change, insolvency/cessation, or repeated non-compliance. Buyer may request refunds for undelivered/rejected goods subject to law and dispute provisions.',
  governingLaw: 'Governing law/jurisdiction: {LAW}. Choice does not prevent interim/protective measures where legally available.',
  dispute: 'Disputes first through good-faith negotiation. If unresolved within {DAYS} calendar days, submit to {INSTITUTION}. Seat: {SEAT}. Language: {LANG}. Decision/award final and binding as permitted by law.',
  language: 'Agreement may be executed in English / Chinese / English and Chinese. Controlling language on inconsistency: {CONTROLLING}.',
  electronic: 'Electronic signatures and digital records may be used as evidence as permitted by law. Platform order/payment/transaction records may be incorporated where expressly identified by Parties.',
  entire: 'Agreement plus PI, PO, Technical Specifications, Inspection Protocol, and expressly incorporated annexes constitute entire agreement. Amendments must be written and approved by authorized representatives. Order of precedence listed from signed amendments to other commercial communications.',
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

// ─── Sub-componentes ──────────────────────────────────────────────────────────
const SectionBlock = ({ number, title, children }) => (
  <View style={styles.section} wrap>
    <Text style={styles.sectionTitle} wrap={false}>
      {number}. {title}
    </Text>
    {children}
  </View>
);

const Clause = ({ text }) => (
  <Text style={styles.clauseText}>{text}</Text>
);

const Field = ({ label, value }) => (
  <View style={styles.row} wrap={false}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || "—"}</Text>
  </View>
);

const PartyBox = ({ title, items }) => (
  <View style={styles.partyBox}>
    <Text style={styles.partyTitle}>{title}</Text>
    {items.map(([label, value], i) => (
      <Field key={i} label={label} value={value} />
    ))}
  </View>
);

const BulletList = ({ items }) => (
  <View style={styles.bulletList}>
    {items.map((it, i) => (
      <Text key={i} style={styles.bullet}>• {it}</Text>
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

// ─── Componente principal ─────────────────────────────────────────────────────
export const ContratoPDF = ({ data }) => {
  const partidas = Array.isArray(data.partidas) ? data.partidas : [];
  const pagos    = Array.isArray(data.pagos)    ? data.pagos    : [];
  const annexA   = data.annexA && typeof data.annexA === "object" ? data.annexA : {};
  const annexB   = Array.isArray(data.annexB) ? data.annexB : [];
  const checklistC = Array.isArray(data.inspectionChecklist) ? data.inspectionChecklist : [];
  const docsD      = Array.isArray(data.annexDDocs) ? data.annexDDocs : [];

  const specsA    = Array.isArray(annexA.specs) ? annexA.specs.filter(Boolean) : [];
  const materialsA = Array.isArray(annexA.materials) ? annexA.materials.filter(Boolean) : [];
  const performanceA = Array.isArray(annexA.performance) ? annexA.performance.filter(Boolean) : [];
  const certificationsA = Array.isArray(annexA.certifications) ? annexA.certifications.filter(Boolean) : [];
  const accessoriesA = Array.isArray(annexA.accessories) ? annexA.accessories.filter(Boolean) : [];

  const totalValue = data.totalContractValue ||
    String(partidas.reduce((acc, p) => {
      const t = parseFloat(String(p.total).replace(/[^0-9.-]/g, ""));
      return acc + (isNaN(t) ? 0 : t);
    }, 0).toFixed(2));

  const method = data.paymentMethod === "OTHER"
    ? data.paymentMethodOther || "Other"
    : data.paymentMethod || "—";

  return (
    <Document>
      {/* ── Página principal (fluye a varias páginas) ── */}
      <Page size="A4" style={styles.page} wrap>

        <View style={styles.header} fixed>
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>DG</Text>
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerBrand}>DUBOIS · Grupo Logístico</Text>
            <Text style={styles.headerSlogan}>GLOBAL TRADE INTELLIGENCE</Text>
          </View>
        </View>
        <View style={styles.accentStripe} fixed />

        <View style={styles.body}>

          <Text style={styles.docTitle}>International Purchase Agreement</Text>
          <View style={styles.docTitleUnderline} />
          <Text style={styles.docDate}>Date: {data.fecha || "—"}</Text>

          {/* SUMMARY */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{FIXED_TEXT.summary}</Text>
          </View>

          {/* 1. PARTIES */}
          <SectionBlock number="1" title="PARTIES">
            <View style={styles.partiesRow}>
              <PartyBox title="BUYER" items={[
                ["Legal Name",           data.buyerLegalName],
                ["Trade Name",           data.buyerTradeName],
                ["Address",              data.buyerAddress],
                ["Country",              data.buyerCountry],
                ["Registration/Tax ID",  data.buyerTaxId],
                ["Representative",       data.buyerRepresentative],
                ["Position",             data.buyerPosition],
                ["Email",                data.buyerEmail],
              ]} />
              <PartyBox title="SUPPLIER" items={[
                ["Legal Name",                   data.supplierLegalName],
                ["Trade Name",                   data.supplierTradeName],
                ["Registered Address",           data.supplierAddress],
                ["Country",                      data.supplierCountry],
                ["Unified Social Credit Code",   data.supplierUscc],
                ["Legal Representative",         data.supplierLegalRepresentative],
                ["Position",                     data.supplierPosition],
                ["Email",                        data.supplierEmail],
              ]} />
            </View>
          </SectionBlock>

          {/* 2. PURPOSE */}
          <SectionBlock number="2" title="PURPOSE OF THE AGREEMENT">
            <Clause text={FIXED_TEXT.purpose} />
          </SectionBlock>

          {/* 3. PRODUCTS */}
          <SectionBlock number="3" title="PRODUCTS">
            <View style={styles.table}>
              <View style={styles.tableHeader} wrap={false}>
                <Text style={[styles.tableHeaderCell, styles.cProduct]}>PRODUCT / MODEL</Text>
                <Text style={[styles.tableHeaderCell, styles.cSpec]}>SPECIFICATION</Text>
                <Text style={[styles.tableHeaderCell, styles.cQty]}>QUANTITY</Text>
                <Text style={[styles.tableHeaderCell, styles.cPrice]}>UNIT PRICE</Text>
                <Text style={[styles.tableHeaderCell, styles.cTotal]}>TOTAL</Text>
              </View>
              {partidas.map((p, i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
                  <Text style={[styles.tableCell, styles.cProduct]}>{p.producto}</Text>
                  <Text style={[styles.tableCell, styles.cSpec]}>{p.especificacion || "—"}</Text>
                  <Text style={[styles.tableCell, styles.cQty]}>{p.cantidad}</Text>
                  <Text style={[styles.tableCell, styles.cPrice]}>{fmtUSD(p.precioUnitario)}</Text>
                  <Text style={[styles.tableCell, styles.cTotal]}>{fmtUSD(p.total)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Contract Value:</Text>
              <Text style={styles.totalValue}>{fmtUSD(totalValue)} {data.currency || "USD"}</Text>
            </View>
            <Clause text={FIXED_TEXT.products} />
          </SectionBlock>

          {/* 4. QUALITY */}
          <SectionBlock number="4" title="QUALITY AND SPECIFICATIONS">
            <Clause text={FIXED_TEXT.quality} />
          </SectionBlock>

          {/* 5. PRICE */}
          <SectionBlock number="5" title="PRICE">
            <Field label="Total Purchase Price" value={`${fmtUSD(totalValue)} ${data.currency || "USD"}`} />
            <Field label="Currency" value={data.currency || "USD"} />
            <Field label="Incoterm" value={data.incoterm === "OTHER" ? data.incotermOther : data.incoterm} />
            <Field label="Named Place/Port" value={data.namedPlace} />
            <Clause text={FIXED_TEXT.price} />
          </SectionBlock>

          {/* 6. PAYMENT TERMS */}
          <SectionBlock number="6" title="PAYMENT TERMS">
            <View style={styles.table}>
              <View style={styles.tableHeader} wrap={false}>
                <Text style={[styles.tableHeaderCell, styles.cConcepto]}>INSTALLMENT</Text>
                <Text style={[styles.tableHeaderCell, styles.cPct]}>PERCENT</Text>
                <Text style={[styles.tableHeaderCell, styles.cMonto]}>AMOUNT (USD)</Text>
              </View>
              {pagos.map((pg, i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
                  <Text style={[styles.tableCell, styles.cConcepto]}>{pg.concepto}</Text>
                  <Text style={[styles.tableCell, styles.cPct]}>{pg.porcentaje}%</Text>
                  <Text style={[styles.tableCell, styles.cMonto]}>{fmtUSD(pg.monto)}</Text>
                </View>
              ))}
            </View>
            <Field label="Method" value={method} />
            <Clause text={FIXED_TEXT.payment} />
          </SectionBlock>

          {/* 7. PRODUCTION AND DELIVERY */}
          <SectionBlock number="7" title="PRODUCTION AND DELIVERY">
            <Field
              label="Production completion within"
              value={data.productionDays ? `${data.productionDays} calendar days` : "—"}
            />
            <Field
              label="Starting from"
              value={data.productionStart === "DATE"
                ? (data.productionStartDate || "—")
                : (data.productionStart || "—")}
            />
            <Field label="Estimated Ready-to-Ship Date" value={data.estimatedReadyToShipDate} />
            <Clause text={FIXED_TEXT.production} />
          </SectionBlock>

          {/* 8. INSPECTION */}
          <SectionBlock number="8" title="INSPECTION">
            <Clause text={FIXED_TEXT.inspection} />
          </SectionBlock>

          {/* 9. NON-CONFORMING PRODUCTS */}
          <SectionBlock number="9" title="NON-CONFORMING PRODUCTS">
            <Clause text={FIXED_TEXT.nonConforming} />
          </SectionBlock>

          {/* 10. PACKAGING */}
          <SectionBlock number="10" title="PACKAGING">
            <Clause text={FIXED_TEXT.packaging} />
          </SectionBlock>

          {/* 11. SHIPPING AND DOCUMENTATION */}
          <SectionBlock number="11" title="SHIPPING AND DOCUMENTATION">
            <Clause text={FIXED_TEXT.shipping} />
          </SectionBlock>

          {/* 12. WARRANTY */}
          <SectionBlock number="12" title="WARRANTY">
            <Field label="Warranty period" value={data.warrantyMonths ? `${data.warrantyMonths} months` : "—"} />
            <Field label="Starting from" value={data.warrantyStart || "—"} />
            <Clause text={FIXED_TEXT.warranty} />
          </SectionBlock>

          {/* 13. WARRANTY CLAIM PROCEDURE */}
          <SectionBlock number="13" title="WARRANTY CLAIM PROCEDURE">
            <Clause text={fill(FIXED_TEXT.warrantyClaim, {
              RESPONSE: data.warrantyResponseDays,
              CORRECTIVE: data.warrantyCorrectiveDays,
            })} />
          </SectionBlock>

          {/* 14. DELAY AND LIQUIDATED DAMAGES */}
          <SectionBlock number="14" title="DELAY AND LIQUIDATED DAMAGES">
            <Clause text={fill(FIXED_TEXT.delay, {
              PCT:    data.delayPercent,
              PERIOD: data.delayPeriod,
              CAP:    data.delayCapPercent,
              DAYS:   data.delayTerminationDays,
            })} />
          </SectionBlock>

          {/* 15. CHANGE OF MANUFACTURING LOCATION */}
          <SectionBlock number="15" title="CHANGE OF MANUFACTURING LOCATION">
            <Clause text={FIXED_TEXT.changeLocation} />
          </SectionBlock>

          {/* 16. SUBCONTRACTING */}
          <SectionBlock number="16" title="SUBCONTRACTING">
            <Clause text={FIXED_TEXT.subcontracting} />
          </SectionBlock>

          {/* 17. INTELLECTUAL PROPERTY AND TOOLING */}
          <SectionBlock number="17" title="INTELLECTUAL PROPERTY AND TOOLING">
            <Clause text={FIXED_TEXT.ip} />
          </SectionBlock>

          {/* 18. CONFIDENTIALITY */}
          <SectionBlock number="18" title="CONFIDENTIALITY">
            <Clause text={FIXED_TEXT.confidentiality} />
          </SectionBlock>

          {/* 19. NON-CIRCUMVENTION */}
          <SectionBlock number="19" title="NON-CIRCUMVENTION">
            <Clause text={fill(FIXED_TEXT.nonCircumvention, {
              YEARS:     data.ncDurationYears,
              TERRITORY: data.ncTerritory,
            })} />
          </SectionBlock>

          {/* 20. COMPLIANCE AND PRODUCT SAFETY */}
          <SectionBlock number="20" title="COMPLIANCE AND PRODUCT SAFETY">
            <Clause text={FIXED_TEXT.compliance} />
          </SectionBlock>

          {/* 21. FORCE MAJEURE */}
          <SectionBlock number="21" title="FORCE MAJEURE">
            <Clause text={FIXED_TEXT.forceMajeure} />
          </SectionBlock>

          {/* 22. TERMINATION */}
          <SectionBlock number="22" title="TERMINATION">
            <Clause text={FIXED_TEXT.termination} />
          </SectionBlock>

          {/* 23. GOVERNING LAW */}
          <SectionBlock number="23" title="GOVERNING LAW">
            <Clause text={fill(FIXED_TEXT.governingLaw, { LAW: data.governingLaw })} />
          </SectionBlock>

          {/* 24. DISPUTE RESOLUTION */}
          <SectionBlock number="24" title="DISPUTE RESOLUTION">
            <Clause text={fill(FIXED_TEXT.dispute, {
              DAYS:       data.negotiationDays || "30",
              INSTITUTION: data.arbitrationInstitution,
              SEAT:       data.arbitrationSeat,
              LANG:       data.arbitrationLanguage === "OTHER"
                ? (data.arbitrationLanguageOther || "Other")
                : (data.arbitrationLanguage || "—"),
            })} />
          </SectionBlock>

          {/* 25. LANGUAGE */}
          <SectionBlock number="25" title="LANGUAGE">
            <Field label="Executed in" value={data.executedIn} />
            <Clause text={fill(FIXED_TEXT.language, { CONTROLLING: data.controllingLanguage })} />
          </SectionBlock>

          {/* 26. ELECTRONIC SIGNATURES */}
          <SectionBlock number="26" title="ELECTRONIC SIGNATURES AND DIGITAL RECORDS">
            <Clause text={FIXED_TEXT.electronic} />
          </SectionBlock>

          {/* 27. ENTIRE AGREEMENT */}
          <SectionBlock number="27" title="ENTIRE AGREEMENT">
            <Clause text={FIXED_TEXT.entire} />
          </SectionBlock>

          {/* 28. NOTICES */}
          <SectionBlock number="28" title="NOTICES">
            <View style={styles.partiesRow}>
              <PartyBox title="BUYER NOTICE CONTACT" items={[
                ["Name",    data.buyerNoticeName],
                ["Email",   data.buyerNoticeEmail],
                ["Address", data.buyerNoticeAddress],
              ]} />
              <PartyBox title="SUPPLIER NOTICE CONTACT" items={[
                ["Name",    data.supplierNoticeName],
                ["Email",   data.supplierNoticeEmail],
                ["Address", data.supplierNoticeAddress],
              ]} />
            </View>
          </SectionBlock>

          {/* 29. SIGNATURES */}
          <SectionBlock number="29" title="SIGNATURES">
            <View style={styles.signatureSection}>
              <View style={styles.signatureBox}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureRole}>BUYER</Text>
                <Text style={styles.signatureName}>{data.buyerLegalName || "—"}</Text>
                <Text style={styles.signatureMeta}>{data.buyerSigner || "—"}</Text>
                <Text style={styles.signatureMeta}>{data.buyerSignerPosition || ""}</Text>
                {data.buyerSignDate && (
                  <Text style={styles.signatureMeta}>Date: {data.buyerSignDate}</Text>
                )}
                <Text style={styles.signatureMeta}>Company stamp / seal</Text>
              </View>
              <View style={styles.signatureBox}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureRole}>SUPPLIER</Text>
                <Text style={styles.signatureName}>{data.supplierLegalName || "—"}</Text>
                <Text style={styles.signatureMeta}>{data.supplierSigner || "—"}</Text>
                <Text style={styles.signatureMeta}>{data.supplierSignerPosition || ""}</Text>
                {data.supplierSignDate && (
                  <Text style={styles.signatureMeta}>Date: {data.supplierSignDate}</Text>
                )}
                <Text style={styles.signatureMeta}>Company stamp / seal</Text>
              </View>
            </View>
          </SectionBlock>

          {/* ANNEX A */}
          <View style={styles.section} wrap>
            <Text style={styles.annexTitle}>ANNEX A — TECHNICAL SPECIFICATIONS</Text>
            <View style={styles.annexStripe} />
            <Field label="Product" value={annexA.product} />
            <Field label="Model"   value={annexA.model} />
            <Field label="Brand"   value={annexA.brand} />
            {specsA.map((s, i) => (
              <Field key={i} label={`Specification ${i + 1}`} value={s} />
            ))}
            {materialsA.length > 0 && (
              <>
                <Field label="Materials" value="" />
                <BulletList items={materialsA} />
              </>
            )}
            <Field label="Dimensions" value={annexA.dimensions} />
            {performanceA.length > 0 && (
              <>
                <Field label="Performance requirements" value="" />
                <BulletList items={performanceA} />
              </>
            )}
            {certificationsA.length > 0 && (
              <>
                <Field label="Required certifications" value="" />
                <BulletList items={certificationsA} />
              </>
            )}
            {accessoriesA.length > 0 && (
              <>
                <Field label="Accessories" value="" />
                <BulletList items={accessoriesA} />
              </>
            )}
          </View>

        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            DUBOIS · Grupo Logístico{"\n"}
            <Text style={{ color: C.border }}>Global Trade Intelligence</Text>
          </Text>
          <Text style={styles.footerRight}>
            International Purchase Agreement{" "}
            <Text style={styles.footerAccent}>·</Text> Confidential
          </Text>
        </View>

      </Page>

      {/* ── ANNEX B — landscape ── */}
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>DG</Text>
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerBrand}>DUBOIS · Grupo Logístico</Text>
            <Text style={styles.headerSlogan}>GLOBAL TRADE INTELLIGENCE</Text>
          </View>
        </View>
        <View style={styles.accentStripe} fixed />

        <View style={styles.body}>
          <Text style={styles.annexTitle}>ANNEX B — COMMERCIAL TERMS</Text>
          <View style={styles.annexStripe} />
          <View style={styles.table}>
            <View style={styles.tableHeader} wrap={false}>
              <Text style={[styles.tableHeaderCell, styles.cB1]}>PO NUMBER</Text>
              <Text style={[styles.tableHeaderCell, styles.cB2]}>PRODUCT</Text>
              <Text style={[styles.tableHeaderCell, styles.cB3]}>QTY</Text>
              <Text style={[styles.tableHeaderCell, styles.cB4]}>UNIT PRICE</Text>
              <Text style={[styles.tableHeaderCell, styles.cB5]}>TOTAL</Text>
              <Text style={[styles.tableHeaderCell, styles.cB6]}>INCOTERM</Text>
              <Text style={[styles.tableHeaderCell, styles.cB7]}>LOADING PORT</Text>
              <Text style={[styles.tableHeaderCell, styles.cB8]}>DESTINATION</Text>
              <Text style={[styles.tableHeaderCell, styles.cB9]}>LEAD TIME</Text>
              <Text style={[styles.tableHeaderCell, styles.cB10]}>PAYMENT TERMS</Text>
              <Text style={[styles.tableHeaderCell, styles.cB11]}>WARRANTY</Text>
            </View>
            {annexB.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
                <Text style={[styles.tableCell, styles.cB1]}>{row.poNumber || "—"}</Text>
                <Text style={[styles.tableCell, styles.cB2]}>{row.product || "—"}</Text>
                <Text style={[styles.tableCell, styles.cB3]}>{row.quantity || "—"}</Text>
                <Text style={[styles.tableCell, styles.cB4]}>{fmtUSD(row.unitPrice)}</Text>
                <Text style={[styles.tableCell, styles.cB5]}>{fmtUSD(row.total)}</Text>
                <Text style={[styles.tableCell, styles.cB6]}>{row.incoterm || "—"}</Text>
                <Text style={[styles.tableCell, styles.cB7]}>{row.loadingPort || "—"}</Text>
                <Text style={[styles.tableCell, styles.cB8]}>{row.destination || "—"}</Text>
                <Text style={[styles.tableCell, styles.cB9]}>{row.productionLeadTime || "—"}</Text>
                <Text style={[styles.tableCell, styles.cB10]}>{row.paymentTerms || "—"}</Text>
                <Text style={[styles.tableCell, styles.cB11]}>{row.warranty || "—"}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            DUBOIS · Grupo Logístico{"\n"}
            <Text style={{ color: C.border }}>Global Trade Intelligence</Text>
          </Text>
          <Text style={styles.footerRight}>
            Annex B — Commercial Terms{" "}
            <Text style={styles.footerAccent}>·</Text> Confidential
          </Text>
        </View>
      </Page>

      {/* ── ANNEX C + D ── */}
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>DG</Text>
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerBrand}>DUBOIS · Grupo Logístico</Text>
            <Text style={styles.headerSlogan}>GLOBAL TRADE INTELLIGENCE</Text>
          </View>
        </View>
        <View style={styles.accentStripe} fixed />

        <View style={styles.body}>

          {/* ANNEX C */}
          <Text style={styles.annexTitle}>ANNEX C — INSPECTION AND ACCEPTANCE PROTOCOL</Text>
          <View style={styles.annexStripe} />
          <Field label="Inspection Company" value={data.inspectionCompany} />
          <Field label="Location (Factory)"  value={data.inspectionLocation} />
          <Field label="Date"                value={data.inspectionDate} />
          <View style={{ marginBottom: 4 }}>
            <Field label="Checklist" value="" />
          </View>
          {checklistC.length > 0
            ? <BulletList items={checklistC} />
            : <Clause text="—" />}
          <Field
            label="Acceptance Standard"
            value={data.inspectionStandard === "OTHER"
              ? data.inspectionStandardOther
              : data.inspectionStandard}
          />

          {/* ANNEX D */}
          <View style={[styles.section, { marginTop: 18 }]} wrap>
            <Text style={styles.annexTitle}>ANNEX D — SHIPPING DOCUMENTS</Text>
            <View style={styles.annexStripe} />
            <CheckList options={ANNEX_D_DOCS} selected={docsD} />
            {data.annexDOther && (
              <View style={styles.checklistRow} wrap={false}>
                <Text style={styles.checklistMark}>[X]</Text>
                <Text style={styles.checklistItem}>Other: {data.annexDOther}</Text>
              </View>
            )}
          </View>

        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            DUBOIS · Grupo Logístico{"\n"}
            <Text style={{ color: C.border }}>Global Trade Intelligence</Text>
          </Text>
          <Text style={styles.footerRight}>
            Annexes C &amp; D{" "}
            <Text style={styles.footerAccent}>·</Text> Confidential
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ContratoPDF;
