// components/pdf/SolicitudPDF.jsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Estilos
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: "2px solid #1F2937",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTextContainer: {
    marginLeft: 10,
  },

  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },

  documentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 2,
  },

  documentSubtitle: {
    fontSize: 9,
    color: "#6B7280",
  },

  headerRight: {
    backgroundColor: "#1F2937",
    padding: 10,
    borderRadius: 6,
    minWidth: 120,
  },

  headerRightText: {
    fontSize: 8,
    color: "#FFFFFF",
    marginBottom: 2,
  },

  headerRightHighlight: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
  },
  folioBox: {
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 4,
    alignItems: "flex-end",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    backgroundColor: "#F3F4F6",
    padding: 6,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4B5563",
    marginTop: 8,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  label: {
    width: 140,
    fontSize: 9,
    fontWeight: "bold",
    color: "#4B5563",
  },
  value: {
    flex: 1,
    fontSize: 9,
    color: "#1F2937",
  },
  table: {
    marginTop: 8,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottom: "1px solid #E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #F3F4F6",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 8,
    color: "#1F2937",
  },
  col1: { width: "40%" },
  col2: { width: "35%" },
  col3: { width: "25%", textAlign: "right" },
  colRisk: { width: "33%" },
  signature: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  signatureBox: {
    width: "30%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTop: "1px solid #000000",
    marginTop: 20,
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 8,
    color: "#6B7280",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#9CA3AF",
    borderTop: "1px solid #E5E7EB",
    paddingTop: 8,
  },
  badge: {
    padding: 2,
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "bold",
  },
});

// Formatear fecha de objeto { dd, mm, aaaa } a string
const formatFecha = (fechaObj) => {
  if (!fechaObj) return "N/A";
  return `${fechaObj.dd}/${fechaObj.mm}/${fechaObj.aaaa}`;
};

// Formatear valor monetario
const formatMoneda = (valor) => {
  if (!valor) return "N/A";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(parseFloat(valor));
};

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
        {/* Header */}
        <View style={styles.header}>
          {/* IZQUIERDA */}
          <View style={styles.headerLeft}>
            {logoUrl && (
              <Image src={logoUrl} style={{ width: 50, height: 50 }} />
            )}

            <View style={styles.headerTextContainer}>
              <Text style={styles.companyName}>GRUPO DUBOIS</Text>
              <Text style={styles.documentTitle}>SOLICITUD DE PROFORA</Text>
              <Text style={styles.documentSubtitle}>
                Sistema de Gestión de Contratación
              </Text>
            </View>
          </View>

          {/* DERECHA (tipo tarjeta) */}
          <View style={styles.headerRight}>
            <Text style={styles.headerRightText}>TIPO</Text>
            <Text style={styles.headerRightHighlight}>
              {data.tipoDocumento || "N/A"}
            </Text>

            <Text style={styles.headerRightText}>FECHA</Text>
            <Text style={styles.headerRightHighlight}>{fechaDocumento}</Text>
          </View>
        </View>

        {/* 1. Información General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. INFORMACIÓN GENERAL</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Solicitante:</Text>
            <Text style={styles.value}>{data.solicitante}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CC/NIT:</Text>
            <Text style={styles.value}>{data.ccNit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono/Celular:</Text>
            <Text style={styles.value}>
              {data.telCel} {data.ext && `Ext: ${data.ext}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Centro de Gastos:</Text>
            <Text style={styles.value}>{data.centroGastos}</Text>
          </View>
        </View>

        {/* 2. Justificación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. JUSTIFICACIÓN</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Descripción de la Necesidad:</Text>
            <Text style={styles.value}>{data.descripcionNecesidad}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pertinencia:</Text>
            <Text style={styles.value}>{data.pertinencia}</Text>
          </View>
        </View>

        {/* 3. Objeto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. OBJETO A CONTRATAR</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Descripción:</Text>
            <Text style={styles.value}>{data.descripcionObjeto}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Especificaciones:</Text>
            <Text style={styles.value}>{data.especificaciones}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Requiere Permisos:</Text>
            <Text style={styles.value}>{data.requierePermisos}</Text>
          </View>
        </View>

        {/* 4. Obligaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. OBLIGACIONES DEL CONTRATISTA
          </Text>
          {data.obligaciones.map((obligacion, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.value}>• {obligacion}</Text>
            </View>
          ))}
        </View>

        {/* 5. Modalidad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. MODALIDAD DE SELECCIÓN</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Modalidad:</Text>
            <Text style={styles.value}>
              {data.modalidad === "directa"
                ? "Contratación Directa"
                : "Convocatoria Pública"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Justificación:</Text>
            <Text style={styles.value}>{data.justificacionModalidad}</Text>
          </View>
        </View>

        {/* 6. Estudio de Mercado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. ESTUDIO DE MERCADO</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>
                Cotizante
              </Text>
              <Text style={[styles.tableHeaderCell, styles.col3]}>Valor</Text>
            </View>
            {data.cotizantes.map((cotizante, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>
                  {cotizante.nombre}
                </Text>
                <Text style={[styles.tableCell, styles.col3]}>
                  {formatMoneda(cotizante.valor)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Valor Estimado:</Text>
            <Text style={styles.value}>{formatMoneda(data.valorEstimado)}</Text>
          </View>
          {data.cdpNo && (
            <View style={styles.row}>
              <Text style={styles.label}>CDP No.:</Text>
              <Text style={styles.value}>{data.cdpNo}</Text>
            </View>
          )}
        </View>

        {/* 7. Forma de Pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. FORMA DE PAGO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Forma de Pago:</Text>
            <Text style={styles.value}>
              {data.formaPago === "unico" ? "Pago Único" : "Pagos Parciales"}
            </Text>
          </View>
          {data.detallePago && (
            <View style={styles.row}>
              <Text style={styles.label}>Detalle:</Text>
              <Text style={styles.value}>{data.detallePago}</Text>
            </View>
          )}
        </View>

        {/* 8. Criterios de Selección */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. CRITERIOS DE SELECCIÓN</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Menor Precio:</Text>
            <Text style={styles.value}>
              {data.criterioMenorPrecio ? "SÍ" : "NO"}
            </Text>
          </View>
          {data.criterioOtro && (
            <View style={styles.row}>
              <Text style={styles.label}>Otro Criterio:</Text>
              <Text style={styles.value}>{data.criterioOtro}</Text>
            </View>
          )}
        </View>

        {/* 9. Contratista (solo para contratación directa) */}
        {data.modalidad === "directa" && data.contratistaNombre && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. CONTRATISTA PROPUESTO</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nombre/Razón Social:</Text>
              <Text style={styles.value}>{data.contratistaNombre}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>CC/NIT:</Text>
              <Text style={styles.value}>{data.contratistaCcNit}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{data.contratistaEmail}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ciudad:</Text>
              <Text style={styles.value}>{data.contratistaCiudad}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{data.contratistaTelefono}</Text>
            </View>
          </View>
        )}

        {/* 10. Riesgos */}
        {data.riesgos && data.riesgos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. ANÁLISIS DE RIESGOS</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colRisk]}>
                  Descripción
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colRisk]}>
                  Mitigación
                </Text>
                <Text style={[styles.tableHeaderCell, styles.colRisk]}>
                  Asignación
                </Text>
              </View>
              {data.riesgos.map((riesgo, idx) => (
                <View key={idx} style={styles.tableRow}>
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
          </View>
        )}

        {/* 11. Garantías */}
        {data.garantias && data.garantias.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. GARANTÍAS</Text>
            {data.garantias.map((garantia, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.value}>• {garantia}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 12. Plazo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. PLAZO DE EJECUCIÓN</Text>
          <View style={styles.row}>
            <Text style={styles.value}>{data.plazo}</Text>
          </View>
        </View>

        {/* 13. Comité Evaluador (solo convocatoria pública) */}
        {data.modalidad === "publica" &&
          data.comiteEvaluador &&
          data.comiteEvaluador.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>13. COMITÉ EVALUADOR</Text>
              {data.comiteEvaluador.map((miembro, idx) => (
                <View key={idx} style={styles.row}>
                  <Text style={styles.value}>• {miembro}</Text>
                </View>
              ))}
            </View>
          )}

        {/* 14. Supervisor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. SUPERVISOR DEL CONTRATO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{data.supervisorNombre}</Text>
          </View>
          {data.supervisorCargo && (
            <View style={styles.row}>
              <Text style={styles.label}>Cargo:</Text>
              <Text style={styles.value}>{data.supervisorCargo}</Text>
            </View>
          )}
          {data.supervisorCorreo && (
            <View style={styles.row}>
              <Text style={styles.label}>Correo:</Text>
              <Text style={styles.value}>{data.supervisorCorreo}</Text>
            </View>
          )}
          {data.supervisorCelular && (
            <View style={styles.row}>
              <Text style={styles.label}>Celular:</Text>
              <Text style={styles.value}>{data.supervisorCelular}</Text>
            </View>
          )}
        </View>

        {/* 15. Documentos Soporte */}
        {data.documentosSoporte && data.documentosSoporte.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>15. DOCUMENTOS SOPORTE</Text>
            {data.documentosSoporte.map((doc, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.value}>• {doc}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Firmas */}
        <View style={styles.signature}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>{data.elaboradoPor.nombre}</Text>
            <Text style={[styles.signatureText, { fontSize: 7 }]}>
              {data.elaboradoPor.cargo}
            </Text>
            <Text style={[styles.signatureText, { fontSize: 7 }]}>
              Fecha: {data.elaboradoPor.fecha}
            </Text>
            <Text
              style={[
                styles.signatureText,
                { fontWeight: "bold", marginTop: 4 },
              ]}
            >
              Elaborado por
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>
              {data.ordenadorGasto.nombre}
            </Text>
            <Text style={[styles.signatureText, { fontSize: 7 }]}>
              {data.ordenadorGasto.cargo}
            </Text>
            <Text style={[styles.signatureText, { fontSize: 7 }]}>
              Fecha: {data.ordenadorGasto.fecha}
            </Text>
            <Text
              style={[
                styles.signatureText,
                { fontWeight: "bold", marginTop: 4 },
              ]}
            >
              Ordenador del Gasto
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>
              {data.responsableContratacion.nombre}
            </Text>
            <Text style={[styles.signatureText, { fontSize: 7 }]}>
              {data.responsableContratacion.cargo}
            </Text>
            <Text style={[styles.signatureText, { fontSize: 7 }]}>
              Fecha: {data.responsableContratacion.fecha}
            </Text>
            <Text
              style={[
                styles.signatureText,
                { fontWeight: "bold", marginTop: 4 },
              ]}
            >
              Responsable Contratación
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Documento generado automáticamente - Solicitud de Compra</Text>
          <Text>Generado el {fechaGeneracion}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SolicitudPDF;
