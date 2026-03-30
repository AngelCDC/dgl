// components/pdf/SolicitudPDF.jsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ─── DUBOIS · Grupo Logístico — Brand System ─────────────────────────────────
const C = {
  navy: "#0a1628", // Primario   — Azul marino profundo
  corp: "#1a3a6b", // Secundario — Azul corporativo
  electric: "#2563eb", // Acento     — Azul eléctrico frío
  white: "#ffffff", // Superficie
  bgSoft: "#f4f6f9", // Fondo suave
  carbon: "#0d0d0d", // Texto principal
  steel: "#5a6478", // Texto secundario
  border: "#dce3ed", // Bordes
  amber: "#d97706", // Alerta / Tendencia
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    paddingTop: 0,
    paddingBottom: 60,
    paddingHorizontal: 0,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: C.carbon,
  },

  header: {
    backgroundColor: C.navy,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  monogram: {
    width: 40,
    height: 40,
    border: "1.5pt solid #2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  monogramText: {
    color: C.white,
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  headerTextContainer: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    letterSpacing: 1.5,
  },
  documentTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#a0b8d8",
    marginTop: 2,
  },
  documentSubtitle: {
    fontSize: 11,
    color: "#7a90b0",
    marginTop: 2,
  },
  headerRight: {
    backgroundColor: C.corp,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeft: "2pt solid #2563eb",
    minWidth: 130,
  },
  headerRightLabel: {
    fontSize: 10,
    color: "#7a90b0",
    fontFamily: "Helvetica-Bold",
  },
  headerRightValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    marginBottom: 6,
  },

  accentStripe: {
    height: 3,
    backgroundColor: C.electric,
    marginBottom: 20,
  },

  body: {
    paddingHorizontal: 32,
  },

  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    backgroundColor: C.corp,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    marginBottom: 6,
    paddingHorizontal: 10,
    flexWrap: "wrap",
  },
  label: {
    width: 140,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.steel,
    flexShrink: 0,
  },
  value: {
    flex: 1,
    fontSize: 12,
    color: C.carbon,
  },

  // ── Tablas — anchos absolutos (react-pdf no soporta % confiablemente) ────────
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
    fontSize: 11,
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
  tableCell: {
    fontSize: 11,
    color: C.carbon,
  },
  // A4 body = 595 - 2×32 (body padding) - 2×10 (table margin) - 2×8 (cell padding) = 495pt
  col1: { width: 370 }, // proveedor (75%)
  col3: { width: 125, textAlign: "right" }, // valor (25%)
  colRisk: { width: 165 }, // 3 columnas × 165 = 495

  // ── Firmas ───────────────────────────────────────────────────────────────────
  signatureSection: {
    marginTop: 32,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
  },

  signatureBox: {
    width: "40%",
    alignItems: "center",
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
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.electric,
    textAlign: "center",
  },
  signatureName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  signatureMeta: {
    fontSize: 10,
    color: C.steel,
    textAlign: "center",
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    borderTop: `1pt solid ${C.border}`,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLeft: {
    fontSize: 10,
    color: C.steel,
  },
  footerRight: {
    fontSize: 10,
    color: C.steel,
  },
  footerAccent: {
    color: C.electric,
    fontFamily: "Helvetica-Bold",
  },
});

// ─── Utilidades ───────────────────────────────────────────────────────────────
const formatFecha = (fechaObj) => {
  if (!fechaObj) return "N/A";
  return `${fechaObj.dd}/${fechaObj.mm}/${fechaObj.aaaa}`;
};

const formatMoneda = (valor) => {
  if (!valor) return "N/A";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(parseFloat(valor));
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────
const SectionBlock = ({ number, title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>
      {number}. {title}
    </Text>
    {children}
  </View>
);

const Field = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || "—"}</Text>
  </View>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const SolicitudPDF = ({ data, logoUrl }) => {
  const fechaGeneracion = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const fechaDocumento = formatFecha(data.fecha);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          {/* Izquierda: monograma + nombre */}
          <View style={styles.headerLeft}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                style={{ width: 40, height: 40, marginRight: 14 }}
              />
            ) : (
              <View style={styles.monogram}>
                <Text style={styles.monogramText}>DG</Text>
              </View>
            )}
            <View style={styles.headerTextContainer}>
              <Text style={styles.companyName}>DUBOIS · Grupo Logístico</Text>
              <Text style={styles.documentTitle}>SOLICITUD DE PROCURA</Text>
              <Text style={styles.documentSubtitle}>
                GLOBAL TRADE INTELLIGENCE
              </Text>
            </View>
          </View>

          {/* Derecha: tipo + fecha */}
          <View style={styles.headerRight}>
            <Text style={styles.headerRightLabel}>TIPO</Text>
            <Text style={styles.headerRightValue}>
              {data.tipoDocumento || "N/A"}
            </Text>
            <Text style={styles.headerRightLabel}>FECHA</Text>
            <Text style={[styles.headerRightValue, { marginBottom: 0 }]}>
              {fechaDocumento}
            </Text>
          </View>
        </View>

        {/* Franja acento eléctrico */}
        <View style={styles.accentStripe} />

        {/* ── CUERPO ─────────────────────────────────────────────────────────── */}
        <View style={styles.body}>
          {/* 1. Información General */}
          <SectionBlock number="1" title="INFORMACIÓN GENERAL">
            <Field label="Solicitante" value={data.solicitante} />
            <Field label="CC / NIT" value={data.ccNit} />
            <Field
              label="Teléfono / Celular"
              value={
                data.ext ? `${data.telCel}  Ext: ${data.ext}` : data.telCel
              }
            />
            <Field label="Email" value={data.email} />
          </SectionBlock>

          {/* 2. Justificación */}
          <SectionBlock number="2" title="JUSTIFICACIÓN">
            <Field
              label="Descripción de la Necesidad"
              value={data.descripcionNecesidad}
            />
            <Field label="Pertinencia" value={data.pertinencia} />
          </SectionBlock>

          {/* 3. Objeto */}
          <SectionBlock number="3" title="OBJETO A CONTRATAR">
            <Field label="Descripción" value={data.descripcionObjeto} />
            <Field label="Especificaciones" value={data.especificaciones} />
            <Field label="Requiere Permisos" value={data.requierePermisos} />
          </SectionBlock>

          {/* 4. Obligaciones */}
          <SectionBlock number="4" title="OBLIGACIONES DEL CONTRATISTA">
            {data.obligaciones.map((obligacion, idx) => (
              <View
                key={idx}
                style={[styles.row, { alignItems: "flex-start" }]}
              >
                <Text
                  style={{
                    color: C.electric,
                    fontSize: 8.5,
                    marginRight: 6,
                    flexShrink: 0,
                  }}
                >
                  ▸
                </Text>
                <Text style={styles.value}>{obligacion}</Text>
              </View>
            ))}
          </SectionBlock>

          {/* 5. Modalidad */}
          <SectionBlock number="5" title="MODALIDAD DE SELECCIÓN">
            <Field
              label="Modalidad"
              value={
                data.modalidad === "directa"
                  ? "Contratación Directa"
                  : "Convocatoria Pública"
              }
            />
            <Field label="Justificación" value={data.justificacionModalidad} />
          </SectionBlock>

          {/* 6. Forma de Pago */}
          <SectionBlock number="6" title="FORMA DE PAGO">
            <Field
              label="Forma de Pago"
              value={
                data.formaPago === "unico" ? "Pago Único" : "Pagos Parciales"
              }
            />
            {data.detallePago && (
              <Field label="Detalle" value={data.detallePago} />
            )}
          </SectionBlock>

          <View break={true} style={{ marginTop: 8 }} />

          {/* 7. Criterios de Selección */}
          <SectionBlock number="7" title="CRITERIOS DE SELECCIÓN">
            <Field
              label="Menor Precio"
              value={data.criterioMenorPrecio ? "SÍ" : "NO"}
            />
            {data.criterioOtro && (
              <Field label="Otro Criterio" value={data.criterioOtro} />
            )}
          </SectionBlock>

          {/* 8. Estudio de Mercado */}
          <SectionBlock number="8" title="ESTUDIO DE MERCADO">
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: 370 }]}>
                  COTIZANTE / PROVEEDOR
                </Text>
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: 125, textAlign: "right" },
                  ]}
                >
                  VALOR
                </Text>
              </View>
              {data.cotizantes?.map((cotizante, idx) => (
                <View
                  key={idx}
                  style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={[styles.tableCell, styles.col1]}>
                    {cotizante.nombre}
                  </Text>
                  <Text style={[styles.tableCell, styles.col3]}>
                    {formatMoneda(cotizante.valor)}
                  </Text>
                </View>
              ))}
            </View>
            <Field
              label="Valor Estimado"
              value={formatMoneda(data.valorEstimado)}
            />
          </SectionBlock>

          {/* 9. Contratista (solo contratación directa) */}
          {data.modalidad === "directa" && data.contratistaNombre && (
            <SectionBlock number="9" title="CONTRATISTA PROPUESTO">
              <Field
                label="Nombre / Razón Social"
                value={data.contratistaNombre}
              />
              <Field label="CC / NIT" value={data.contratistaCcNit} />
              <Field label="Email" value={data.contratistaEmail} />
              <Field label="Ciudad" value={data.contratistaCiudad} />
              <Field label="Teléfono" value={data.contratistaTelefono} />
            </SectionBlock>
          )}

          {/* 10. Análisis de Riesgos */}
          {data.riesgos && data.riesgos.length > 0 && (
            <SectionBlock number="10" title="ANÁLISIS DE RIESGOS">
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.colRisk]}>
                    DESCRIPCIÓN
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colRisk]}>
                    MITIGACIÓN
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colRisk]}>
                    ASIGNACIÓN
                  </Text>
                </View>
                {data.riesgos.map((riesgo, idx) => (
                  <View
                    key={idx}
                    style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                  >
                    <Text style={[styles.tableCell, styles.colRisk]}>
                      {riesgo.descripcion}
                    </Text>
                    <Text style={[styles.tableCell, styles.colRisk]}>
                      {riesgo.mitigacion}
                    </Text>
                    <Text style={[styles.tableCell, styles.colRisk]}>
                      {riesgo.asignacion}
                    </Text>
                  </View>
                ))}
              </View>
            </SectionBlock>
          )}

          {/* 11. Garantías */}
          {data.garantias && data.garantias.length > 0 && (
            <SectionBlock number="11" title="GARANTÍAS">
              {data.garantias.map((garantia, idx) => (
                <View
                  key={idx}
                  style={[styles.row, { alignItems: "flex-start" }]}
                >
                  <Text
                    style={{
                      color: C.electric,
                      fontSize: 8.5,
                      marginRight: 6,
                      flexShrink: 0,
                    }}
                  >
                    ▸
                  </Text>
                  <Text style={styles.value}>{garantia}</Text>
                </View>
              ))}
            </SectionBlock>
          )}

          {/* 12. Plazo */}
          <SectionBlock number="12" title="PLAZO DE EJECUCIÓN">
            <View style={styles.row}>
              <Text style={styles.value}>{data.plazo}</Text>
            </View>
          </SectionBlock>

          {/* 13. Comité Evaluador (solo convocatoria pública) */}
          {data.modalidad === "publica" &&
            data.comiteEvaluador &&
            data.comiteEvaluador.length > 0 && (
              <SectionBlock number="13" title="COMITÉ EVALUADOR">
                {data.comiteEvaluador.map((miembro, idx) => (
                  <View key={idx} style={styles.row}>
                    <Text
                      style={[
                        styles.value,
                        { color: C.electric, marginRight: 4, flexShrink: 0 },
                      ]}
                    >
                      ▸
                    </Text>
                    <Text style={styles.value}>{miembro}</Text>
                  </View>
                ))}
              </SectionBlock>
            )}

          {/* 14. Supervisor 
          <SectionBlock number="14" title="SUPERVISOR DEL CONTRATO">
            <Field label="Nombre" value={data.supervisorNombre} />
            {data.supervisorCargo && (
              <Field label="Cargo" value={data.supervisorCargo} />
            )}
            {data.supervisorCorreo && (
              <Field label="Correo" value={data.supervisorCorreo} />
            )}
            {data.supervisorCelular && (
              <Field label="Celular" value={data.supervisorCelular} />
            )}
          </SectionBlock>*/}

          {/* 15. Documentos Soporte */}
          {data.documentosSoporte && data.documentosSoporte.length > 0 && (
            <SectionBlock number="15" title="DOCUMENTOS SOPORTE">
              {data.documentosSoporte.map((doc, idx) => (
                <View key={idx} style={styles.row}>
                  <Text
                    style={[
                      styles.value,
                      { color: C.electric, marginRight: 4, flexShrink: 0 },
                    ]}
                  >
                    ▸
                  </Text>
                  <Text style={styles.value}>{doc}</Text>
                </View>
              ))}
            </SectionBlock>
          )}
        </View>

        {/* ── FIRMAS ─────────────────────────────────────────────────────────── */}
        <View style={styles.signatureSection}>
          {[
            { role: "ELABORADO POR", person: data.elaboradoPor },
            {
              role: "CONTRATANTE",
              person: data.responsableContratacion,
            },
          ].map(({ role, person }, idx) => (
            <View key={idx} style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureRole}>{role}</Text>
              <Text style={styles.signatureName}>{person?.nombre}</Text>
              <Text style={styles.signatureMeta}>{person?.cargo}</Text>
              <Text style={styles.signatureMeta}>Fecha: {person?.fecha}</Text>
            </View>
          ))}
        </View>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerLeft}>
            DUBOIS · Grupo Logístico <Text style={styles.footerAccent}>·</Text>{" "}
            Documento confidencial — uso interno
          </Text>
          <Text style={styles.footerRight}>Generado el {fechaGeneracion}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SolicitudPDF;
