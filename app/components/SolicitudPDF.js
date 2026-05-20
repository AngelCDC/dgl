// components/pdf/SolicitudPDF.jsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
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
  amber:    "#d97706",
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
    fontSize: 12,
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
    fontFamily: "Helvetica",
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
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  docTitleUnderline: {
    height: 2,
    width: 48,
    backgroundColor: C.electric,
    marginBottom: 18,
  },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    backgroundColor: C.corp,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    letterSpacing: 1.2,
  },

  row: {
    flexDirection: "row",
    marginBottom: 6,
    paddingHorizontal: 10,
    flexWrap: "wrap",
  },
  label: {
    width: 140,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.steel,
    flexShrink: 0,
  },
  value: {
    flex: 1,
    fontSize: 9,
    color: C.carbon,
  },

  // ── Tabla de cotizantes / cronograma ─────────────────────────────────────────
  table: {
    marginTop: 6,
    marginBottom: 8,
    marginHorizontal: 10,
  },
  // cronograma China
  cronCol1: { width: 180 },
  cronCol2: { width: 110 },
  cronCol3: { flex: 1 },
  productoTableTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    backgroundColor: C.bgSoft,
    borderLeft: `3pt solid ${C.electric}`,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 0,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.navy,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.white,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `0.5pt solid ${C.border}`,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: `0.5pt solid ${C.border}`,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: C.bgSoft,
  },
  tableCell: { fontSize: 9, color: C.carbon },
  col1:    { width: 370 },
  col3:    { width: 125, textAlign: "right" },
  colRisk: { width: 165 },

  signatureSection: {
    marginTop: 32,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
  },
  signatureBox: {
    width: "30%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTop: `1pt solid ${C.border}`,
    marginTop: 28,
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
  },
  signatureMeta: {
    fontSize: 8,
    color: C.steel,
    textAlign: "center",
  },

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
  footerLeft:   { color: C.steel, fontSize: 7, letterSpacing: 0.8 },
  footerRight:  { color: C.steel, fontSize: 7 },
  footerAccent: { color: C.electric, fontFamily: "Helvetica-Bold" },
});

// ─── Utilidades ───────────────────────────────────────────────────────────────
const formatFecha = (fechaObj) => {
  if (!fechaObj) return "N/A";
  return `${fechaObj.dd}/${fechaObj.mm}/${fechaObj.aaaa}`;
};

const formatMoneda = (valor) => {
  if (!valor || valor === "0") return "—";
  const n = parseFloat(valor);
  if (isNaN(n)) return valor;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const SectionBlock = ({ number, title, children }) => (
  <View style={styles.section} wrap>
    <Text style={styles.sectionTitle} wrap={false}>
      {number}. {title}
    </Text>
    {children}
  </View>
);

const Field = ({ label, value }) => (
  <View style={styles.row} wrap={false}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || "—"}</Text>
  </View>
);

// Agrupa cotizantes por productoNombre
const groupCotizantesByProducto = (cotizantes = []) => {
  return cotizantes.reduce((acc, c) => {
    const key = c.productoNombre || "Sin producto";
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});
};

// ─── Componente principal ─────────────────────────────────────────────────────
export const SolicitudPDF = ({ data, logoUrl }) => {
  const cotizantesPorProducto  = groupCotizantesByProducto(data.cotizantes);
  const productosConCotizantes = Object.entries(cotizantesPorProducto);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>

        {/* ── HEADER fijo ── */}
        <View style={styles.header} fixed>
          <View style={styles.monogram}>
            {logoUrl
              ? <Image src={logoUrl} style={{ width: 38, height: 38 }} />
              : <Text style={styles.monogramText}>DG</Text>
            }
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerBrand}>DUBOIS · Grupo Logístico</Text>
            <Text style={styles.headerSlogan}>GLOBAL TRADE INTELLIGENCE</Text>
          </View>
        </View>
        <View style={styles.accentStripe} fixed />

        {/* ── CUERPO ── */}
        <View style={styles.body}>

          <Text style={styles.docTitle}>Estudio de Mercado</Text>
          <View style={styles.docTitleUnderline} />

          {/* 1. Información General */}
          <SectionBlock number="1" title="INFORMACIÓN GENERAL">
            <Field label="Solicitante"   value={data.solicitante} />
            <Field label="Cédula / RIF"  value={data.cedulaRif} />
            <Field
              label="Teléfono / Celular"
              value={data.ext ? `${data.telCel}  Ext: ${data.ext}` : data.telCel}
            />
            <Field label="Email" value={data.email} />
            <Field label="Fecha" value={formatFecha(data.fecha)} />
          </SectionBlock>

          {/* 2. Justificación */}
          <SectionBlock number="2" title="JUSTIFICACIÓN">
            <View style={[styles.row, { alignItems: "flex-start" }]}>
              <Text style={styles.value}>{data.justificacion || "—"}</Text>
            </View>
          </SectionBlock>

          {/* 3. Objeto a Contratar */}
          <SectionBlock number="3" title="OBJETO A CONTRATAR">
            <Field label="Descripción" value={data.descripcionObjeto} />
            {data.requierePermisos && (
              <Field label="Requiere Permisos" value={data.requierePermisos} />
            )}

            {/* Especificaciones de la Solicitud de Procura vinculada */}
            {data.productosVinculados?.length > 0 && (
              <View style={{ marginTop: 6 }}>
                <Text style={[styles.label, { paddingHorizontal: 10, marginBottom: 6 }]}>
                  Especificaciones:
                </Text>
                {data.productosVinculados.map((p, i) => (
                  <View
                    key={i}
                    style={{
                      marginHorizontal: 10,
                      marginBottom: 6,
                      paddingLeft: 8,
                      paddingVertical: 4,
                      borderLeft: `2pt solid ${C.electric}`,
                    }}
                    wrap={false}
                  >
                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 2 }}>
                      {p.nombreProducto}
                    </Text>
                    {(p.descripcionGeneral || p.descripcion) && (
                      <Text style={{ fontSize: 8.5, color: C.steel, lineHeight: 1.5 }}>
                        {p.descripcionGeneral || p.descripcion}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </SectionBlock>

          {/* 4. Obligaciones del Contratista */}
          {data.obligaciones?.length > 0 && (
            <SectionBlock number="4" title="OBLIGACIONES DEL CONTRATISTA">
              {data.obligaciones.map((obligacion, idx) => (
                <View key={idx} style={[styles.row, { alignItems: "flex-start" }]} wrap={false}>
                  <Text style={{ color: C.electric, fontSize: 8.5, marginRight: 6, flexShrink: 0 }}>▸</Text>
                  <Text style={styles.value}>{obligacion}</Text>
                </View>
              ))}
            </SectionBlock>
          )}

          {/* 5. Plazo de Ejecución */}
          <SectionBlock number="5" title="PLAZO DE EJECUCIÓN">
            {data.plazo ? (
              <View style={[styles.row, { alignItems: "flex-start" }]} wrap={false}>
                <Text style={[styles.label, { width: 140 }]}>Plazo estimado:</Text>
                <Text style={styles.value}>{data.plazo}</Text>
              </View>
            ) : null}

            {/* Cronograma de compra en China */}
            {data.cronogramaChina?.length > 0 && (
              <View style={{ marginTop: data.plazo ? 10 : 0 }}>
                <Text style={[styles.label, { paddingHorizontal: 10, marginBottom: 6, fontSize: 9 }]}>
                  Cronograma estimado de compra en China:
                </Text>
                <View style={styles.table}>
                  {/* thead */}
                  <View style={[styles.tableHeader, { flexDirection: "row" }]} wrap={false}>
                    <Text style={[styles.tableHeaderCell, styles.cronCol1]}>ETAPA / ACTIVIDAD</Text>
                    <Text style={[styles.tableHeaderCell, styles.cronCol2]}>TIEMPO EST.</Text>
                    <Text style={[styles.tableHeaderCell, styles.cronCol3]}>OBSERVACIONES</Text>
                  </View>
                  {/* rows */}
                  {data.cronogramaChina.map((row, idx) => (
                    <View
                      key={idx}
                      style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                      wrap={false}
                    >
                      <Text style={[styles.tableCell, styles.cronCol1]}>{row.etapa || "—"}</Text>
                      <Text style={[styles.tableCell, styles.cronCol2, { textAlign: "center" }]}>{row.tiempo || "—"}</Text>
                      <Text style={[styles.tableCell, styles.cronCol3, { color: C.steel }]}>{row.observaciones || ""}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </SectionBlock>

          {/* 6. Estudio de Mercado — una tabla por producto */}
          <SectionBlock number="6" title="ESTUDIO DE MERCADO">
            {productosConCotizantes.length > 0 ? (
              productosConCotizantes.map(([productoNombre, cotizantes], pIdx) => (
                <View key={pIdx} wrap>
                  <Text style={styles.productoTableTitle} wrap={false}>
                    {productoNombre}
                  </Text>
                  <View style={styles.table}>
                    <View style={styles.tableHeader} wrap={false}>
                      <Text style={[styles.tableHeaderCell, { width: 370 }]}>COTIZANTE / PROVEEDOR</Text>
                      <Text style={[styles.tableHeaderCell, { width: 125, textAlign: "right" }]}>VALOR</Text>
                    </View>
                    {cotizantes.map((cotizante, cIdx) => (
                      <View
                        key={cIdx}
                        style={cIdx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                        wrap={false}
                      >
                        <Text style={[styles.tableCell, styles.col1]}>{cotizante.nombre || "—"}</Text>
                        <Text style={[styles.tableCell, styles.col3]}>{formatMoneda(cotizante.valor)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <Field label="Sin cotizantes registrados" value="—" />
            )}
            <Field label="Valor Estimado Total" value={formatMoneda(data.valorEstimado)} />
          </SectionBlock>

          {/* 7. Análisis de Riesgos */}
          {data.riesgos?.length > 0 && (
            <SectionBlock number="7" title="ANÁLISIS DE RIESGOS">
              <View style={styles.table}>
                <View style={styles.tableHeader} wrap={false}>
                  <Text style={[styles.tableHeaderCell, styles.colRisk]}>DESCRIPCIÓN</Text>
                  <Text style={[styles.tableHeaderCell, styles.colRisk]}>MITIGACIÓN</Text>
                  <Text style={[styles.tableHeaderCell, styles.colRisk]}>ASIGNACIÓN</Text>
                </View>
                {data.riesgos.map((riesgo, idx) => (
                  <View
                    key={idx}
                    style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                    wrap={false}
                  >
                    <Text style={[styles.tableCell, styles.colRisk]}>{riesgo.descripcion}</Text>
                    <Text style={[styles.tableCell, styles.colRisk]}>{riesgo.mitigacion || "—"}</Text>
                    <Text style={[styles.tableCell, styles.colRisk]}>{riesgo.asignacion}</Text>
                  </View>
                ))}
              </View>
            </SectionBlock>
          )}

        </View>

        {/* ── FIRMAS ── */}
        <View style={styles.signatureSection} wrap={false}>
          {[
            { role: "ELABORADO POR", person: data.elaboradoPor },
            { role: "CONTRATANTE",   person: data.responsableContratacion },
          ].map(({ role, person }, idx) => (
            <View key={idx} style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureRole}>{role}</Text>
              <Text style={styles.signatureName}>{person?.nombre || "—"}</Text>
              <Text style={styles.signatureMeta}>{person?.cargo || ""}</Text>
              {person?.fecha && (
                <Text style={styles.signatureMeta}>Fecha: {person.fecha}</Text>
              )}
            </View>
          ))}
        </View>

        {/* ── FOOTER fijo ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            DUBOIS · Grupo Logístico{"\n"}
            <Text style={{ color: C.border }}>Global Trade Intelligence</Text>
          </Text>
          <Text style={styles.footerRight}>
            Documento confidencial — uso interno{" "}
            <Text style={styles.footerAccent}>·</Text>
          </Text>
        </View>

      </Page>
    </Document>
  );
};

export default SolicitudPDF;
