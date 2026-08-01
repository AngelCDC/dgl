// components/pdf/ReporteVerificacionPDF.js
// Template @react-pdf/renderer para informes de verificación de empresas.
// Sin texto en chino (sin fuente CJK) — solo español.
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const C = {
  navy: "#0a1628",
  corp: "#1a3a6b",
  electric: "#2563eb",
  white: "#ffffff",
  bgSoft: "#f4f6f9",
  carbon: "#0d0d0d",
  steel: "#5a6478",
  border: "#dce3ed",
  amber: "#d97706",
  green: "#16a34a",
  red: "#dc2626",
};

const HEADER_HEIGHT = 62;
const ACCENT_STRIPE_HEIGHT = 3;
const PAGE_TOP_GAP = 16;
const PAGE_TOP_OFFSET = HEADER_HEIGHT + ACCENT_STRIPE_HEIGHT + PAGE_TOP_GAP;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dv(v) {
  return v || "—";
}

function metricColor(value) {
  // Escala uniforme: el color indica volumen, no un juicio de riesgo
  if (value == null) return C.green;
  if (value >= 4) return C.red;
  if (value >= 3) return C.amber;
  if (value >= 1) return C.steel;
  return C.green;
}

import Image1 from "";

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    paddingTop: PAGE_TOP_OFFSET,
    paddingBottom: 55,
    paddingHorizontal: 0,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: C.carbon,
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.navy,
    paddingVertical: 14,
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
    width: 34,
    height: 34,
    border: "1.5pt solid #2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoImg: {
    width: 44,
    height: 34,
    marginRight: 12,
    objectFit: "contain",
  },
  monogramText: {
    color: C.white,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  headerBrand: {
    color: C.white,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
  },
  headerSlogan: {
    color: "#7a90b0",
    fontSize: 6.5,
    fontFamily: "Helvetica",
    letterSpacing: 2,
    marginTop: 2,
  },
  accentStripe: {
    backgroundColor: C.electric,
    height: ACCENT_STRIPE_HEIGHT,
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    borderTop: "0.5pt solid #dce3ed",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 6.5, color: C.steel, fontFamily: "Helvetica" },
  footerBrand: {
    fontSize: 6.5,
    color: C.navy,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },

  // ── Body ─────────────────────────────────────────────────────────────────
  body: { paddingHorizontal: 28 },

  // ── Doc title ────────────────────────────────────────────────────────────
  docTitle: {
    color: C.navy,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  docSubtitle: {
    color: C.steel,
    fontSize: 8,
    fontFamily: "Helvetica",
    marginBottom: 6,
  },
  docTitleUnderline: {
    height: "2pt",
    backgroundColor: C.electric,
    width: 48,
    marginBottom: 16,
  },

  // ── Record header card ───────────────────────────────────────────────────
  recordHeader: {
    backgroundColor: C.bgSoft,
    border: "0.5pt solid #dce3ed",
    padding: 12,
    marginBottom: 10,
  },
  recordTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.navy,
    marginBottom: 4,
  },
  recordCode: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: C.steel,
    marginBottom: 2,
  },
  recordMeta: { fontSize: 8, fontFamily: "Helvetica", color: C.steel },

  // ── Section ──────────────────────────────────────────────────────────────
  sectionTitleBar: {
    backgroundColor: C.corp,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
    marginTop: 12,
  },
  sectionTitleText: {
    color: C.white,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // ── Field rows ───────────────────────────────────────────────────────────
  fieldRow: { flexDirection: "row", marginBottom: 4, paddingHorizontal: 2 },
  fieldLabel: {
    width: 130,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.steel,
    flexShrink: 0,
  },
  fieldValue: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: C.carbon,
  },

  // ── Cards ────────────────────────────────────────────────────────────────
  card: {
    border: "0.5pt solid #dce3ed",
    padding: 10,
    marginBottom: 8,
  },

  // ── Tables ───────────────────────────────────────────────────────────────
  table: { marginBottom: 8 },
  tableHeader: {
    backgroundColor: C.navy,
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    color: C.white,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #dce3ed",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: C.white,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #dce3ed",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: C.bgSoft,
  },
  tableCell: { fontSize: 7.5, fontFamily: "Helvetica", color: C.carbon },

  // ── Chips ────────────────────────────────────────────────────────────────
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 3, marginTop: 4 },
  chip: {
    border: "0.5pt solid #dce3ed",
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: 7,
    fontFamily: "Helvetica",
    color: C.steel,
  },

  // ── Green banner ─────────────────────────────────────────────────────────
  cleanBanner: {
    backgroundColor: "#ecfdf5",
    border: "0.5pt solid #a7f3d0",
    padding: 8,
    marginBottom: 6,
  },
  cleanBannerText: { fontSize: 8, fontFamily: "Helvetica", color: "#065f46" },

  // ── Bullet lists ─────────────────────────────────────────────────────────
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  bulletDot: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginRight: 6,
    width: 10,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: C.carbon,
    flex: 1,
  },

  // ── Quote block ──────────────────────────────────────────────────────────
  quoteBlock: {
    backgroundColor: C.navy,
    borderLeft: "3pt solid #2563eb",
    padding: 10,
    marginTop: 6,
  },
  quoteText: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#d1d5db",
    lineHeight: 1.5,
  },

  // ── Score badge ──────────────────────────────────────────────────────────
  scoreLarge: { fontSize: 22, fontFamily: "Helvetica-Bold" },
});

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ReporteVerificacionPDF({ data }) {
  const n = data || {};
  const c = n.company || {};
  const bl = n.businessLicense || {};
  const cu = n.customsRegistration || {};
  const interp = n.interpretation || {};

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header} fixed>
          <Image
            src={require(Image1)}
            style={styles.logoImg}
          />
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.headerBrand}>DUBOIS GRUPO LOGISTICO</Text>
            <Text style={styles.headerSlogan}>
              INTELIGENCIA DE COMERCIO INTERNACIONAL
            </Text>
          </View>
        </View>
        <View style={styles.accentStripe} fixed />

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>
            DUBOIS — Global Trade Intelligence
          </Text>
          <Text style={styles.footerText}>
            Documento confidencial — uso interno · Página{" "}
            <Text
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
            />
          </Text>
        </View>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <View style={styles.body}>
          {/* Doc title */}
          <Text style={styles.docTitle}>
            Informe de Verificación de Empresa
          </Text>
          <Text style={styles.docSubtitle}>
            Due Diligence & Compliance Check
          </Text>
          <View style={styles.docTitleUnderline} />

          {/* Record header */}
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>
              {c.nombreEs || "Empresa sin nombre"}
            </Text>
            {c.nombreZh && <Text style={styles.recordCode}>{c.nombreZh}</Text>}
            <Text style={styles.recordMeta}>
              {c.codigoCreditoSocial
                ? `USCC: ${c.codigoCreditoSocial}  ·  `
                : ""}
              {c.estado ? `Estado: ${c.estado}  ·  ` : ""}
              {c.fechaConstitucion || ""}
            </Text>
          </View>

          {/* ── Sección 1: Información General ────────────────────────── */}
          <SectionTitle title="1. Información General de la Empresa" />
          <View style={styles.card}>
            <Field label="Representante legal" value={c.representanteLegal} />
            <Field label="Autoridad de registro" value={c.autoridadRegistro} />
            <Field label="Domicilio" value={c.domicilio} />
            <Field label="Fecha de constitución" value={c.fechaConstitucion} />
          </View>

          {/* ── Sección 2: Licencia Comercial ─────────────────────────── */}
          <SectionTitle title="2. Licencia Comercial" />
          <View style={styles.card}>
            <Field label="Capital registrado" value={bl.capitalRegistrado} />
            <Field label="Tipo de entidad" value={bl.tipoEntidad} />
            <Field label="Fecha aprobación" value={bl.fechaAprobacion} />

            {(bl.ambitoNegocio || []).length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 7.5,
                    fontFamily: "Helvetica-Bold",
                    color: C.steel,
                    marginTop: 6,
                    marginBottom: 4,
                  }}
                >
                  Alcance comercial ({bl.ambitoNegocio.length} actividades)
                </Text>
                <View style={styles.chipRow}>
                  {(bl.ambitoNegocio || []).slice(0, 30).map((item, i) => (
                    <View key={i} style={styles.chip}>
                      <Text>
                        {typeof item === "string"
                          ? item
                          : item?.label_es || item?.name || String(item)}
                      </Text>
                    </View>
                  ))}
                  {(bl.ambitoNegocio || []).length > 30 && (
                    <Text style={{ fontSize: 7, color: C.steel }}>
                      +{bl.ambitoNegocio.length - 30} más
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>

          {/* ── Sección 3: Registro Aduanero ──────────────────────────── */}
          <SectionTitle title="3. Registro Aduanero" />
          <View style={styles.card}>
            <Field label="Aduana local" value={cu.aduanaLocal} />
            <Field label="Fecha de registro" value={cu.fechaRegistro} />
            <Field label="Estado cancelación" value={cu.estado} />
          </View>

          {/* ── Sección 4: Indicadores de Crédito ─────────────────────── */}
          <SectionTitle title="4. Resumen de Indicadores de Crédito" />
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 3.5 }]}>
                Indicador
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { flex: 1, textAlign: "center" },
                ]}
              >
                Valor
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 3 }]}>
                Interpretación
              </Text>
            </View>
            {(n.metrics || []).map((m, i) => (
              <View
                key={m.key}
                style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                wrap={false}
              >
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 3.5, fontFamily: "Helvetica-Bold" },
                  ]}
                >
                  {m.labelEs}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      flex: 1,
                      textAlign: "center",
                      color: metricColor(m.value),
                    },
                  ]}
                >
                  {m.value}
                </Text>
                <Text style={[styles.tableCell, { flex: 3, color: C.steel }]}>
                  {m.descEs}
                </Text>
              </View>
            ))}
            <View
              style={[styles.tableRowAlt, { backgroundColor: C.bgSoft }]}
              wrap={false}
            >
              <Text
                style={[
                  styles.tableCell,
                  { flex: 3.5, fontFamily: "Helvetica-Bold", color: C.navy },
                ]}
              >
                Total
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1,
                    textAlign: "center",
                    fontFamily: "Helvetica-Bold",
                  },
                ]}
              >
                {n.totalRecords}
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                Score de riesgo:{" "}
                <Text
                  style={{ fontFamily: "Helvetica-Bold", color: C.electric }}
                >
                  {n.totalScore}
                </Text>
              </Text>
            </View>
          </View>

          {/* ── Sección 5: Permisos Administrativos ───────────────────── */}
          <SectionTitle
            title={`5. Permisos Administrativos (${n.permits?.total ?? 0} registros)`}
          />
          {(n.permits?.records || []).length === 0 ? (
            <View style={styles.cleanBanner}>
              <Text style={styles.cleanBannerText}>
                ✓ No se registran permisos administrativos.
              </Text>
            </View>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>#</Text>
                <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>
                  Documento
                </Text>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>
                  Categoría
                </Text>
                <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>
                  Autoridad
                </Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.8 }]}>
                  Desde
                </Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.8 }]}>
                  Hasta
                </Text>
              </View>
              {(n.permits.records || []).map((r, i) => (
                <View
                  key={i}
                  style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                  wrap={false}
                >
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {r.number}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2.5 }]}>
                    {r.decisionDocumentNumber || dv()}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {r.permitCategory || dv()}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2.5 }]}>
                    {r.issuingAuthority || dv()}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.8 }]}>
                    {r.validFrom || dv()}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.8 }]}>
                    {r.validTo || dv()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Sección 6: Riesgos ────────────────────────────────────── */}
          <SectionTitle title="6. Riesgos y Antecedentes" />

          {/* Sanciones administrativas */}
          <View style={styles.card}>
            <Text
              style={{
                fontSize: 8.5,
                fontFamily: "Helvetica-Bold",
                color: C.navy,
                marginBottom: 4,
              }}
            >
              Sanciones Administrativas ({n.sanctions?.total ?? 0})
            </Text>
            {(n.sanctions?.records || []).length === 0 ? (
              <View style={styles.cleanBanner}>
                <Text style={styles.cleanBannerText}>
                  ✓ Sin sanciones administrativas — empresa limpia.
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 7.5, color: C.red }}>
                ⚠ Se encontraron {n.sanctions.total} sanciones administrativas.
              </Text>
            )}
          </View>

          {/* Excepciones operativas */}
          <View style={styles.card}>
            <Text
              style={{
                fontSize: 8.5,
                fontFamily: "Helvetica-Bold",
                color: C.navy,
                marginBottom: 4,
              }}
            >
              Excepciones Operativas ({n.exceptions?.total ?? 0})
            </Text>
            {(n.exceptions?.records || []).length === 0 ? (
              <View style={styles.cleanBanner}>
                <Text style={styles.cleanBannerText}>
                  ✓ Sin anomalías operativas registradas.
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 7.5, color: C.red }}>
                ⚠ Se encontraron {n.exceptions.total} excepciones operativas.
              </Text>
            )}
          </View>

          {/* Lista negra */}
          <View style={styles.card}>
            <Text
              style={{
                fontSize: 8.5,
                fontFamily: "Helvetica-Bold",
                color: C.navy,
                marginBottom: 4,
              }}
            >
              Lista Negra de Infracciones Graves ({n.blacklist?.total ?? 0})
            </Text>
            {(n.blacklist?.records || []).length === 0 ? (
              <View style={styles.cleanBanner}>
                <Text style={styles.cleanBannerText}>
                  ✓ Sin registros en lista negra de infracciones graves.
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 7.5, color: C.red }}>
                ⚠ Se encontraron {n.blacklist.total} registros en lista negra.
              </Text>
            )}
          </View>

          {/* ── Sección 7: Interpretación ─────────────────────────────── */}
          <SectionTitle title="7. Interpretación y Conclusión" />

          {(interp.positivos || []).length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 8,
                  fontFamily: "Helvetica-Bold",
                  color: C.green,
                  marginBottom: 4,
                }}
              >
                Indicadores positivos:
              </Text>
              {(interp.positivos || []).map((item, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={[styles.bulletDot, { color: C.green }]}>✓</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </>
          )}

          {(interp.neutrales || []).length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 8,
                  fontFamily: "Helvetica-Bold",
                  color: C.steel,
                  marginBottom: 4,
                  marginTop: 8,
                }}
              >
                Indicadores neutrales:
              </Text>
              {(interp.neutrales || []).map((item, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={[styles.bulletDot, { color: C.steel }]}>·</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </>
          )}

          {(interp.negativos || []).length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 8,
                  fontFamily: "Helvetica-Bold",
                  color: C.red,
                  marginBottom: 4,
                  marginTop: 8,
                }}
              >
                Indicadores negativos:
              </Text>
              {(interp.negativos || []).map((item, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={[styles.bulletDot, { color: C.red }]}>✗</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </>
          )}

          {interp.resumenEs && (
            <View style={styles.quoteBlock}>
              <Text style={styles.quoteText}>{interp.resumenEs}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

// ─── Sub-componentes ────────────────────────────────────────────────────────────

function SectionTitle({ title }) {
  return (
    <View style={styles.sectionTitleBar}>
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function Field({ label, value }) {
  return (
    <View style={styles.fieldRow} wrap={false}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{dv(value)}</Text>
    </View>
  );
}
