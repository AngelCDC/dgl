import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ─── DUBOIS · Grupo Logístico — Brand System ────────────────────────────────
// Paleta oficial
const C = {
  navy:     '#0a1628', // Primario  — Azul marino profundo
  corp:     '#1a3a6b', // Secundario — Azul corporativo
  electric: '#2563eb', // Acento    — Azul eléctrico frío
  white:    '#ffffff', // Superficie
  bgSoft:   '#f4f6f9', // Fondo suave
  carbon:   '#0d0d0d', // Texto principal
  steel:    '#5a6478', // Texto secundario
  border:   '#dce3ed', // Bordes
  amber:    '#d97706', // Alerta / Tendencia
};

const HEADER_HEIGHT = 70;
const ACCENT_STRIPE_HEIGHT = 3;
const PAGE_TOP_GAP = 20;
const PAGE_TOP_OFFSET = HEADER_HEIGHT + ACCENT_STRIPE_HEIGHT + PAGE_TOP_GAP;

const styles = StyleSheet.create({

  // ── Página ──────────────────────────────────────────────────────────────────
  page: {
    backgroundColor: C.white,
    paddingTop: PAGE_TOP_OFFSET,
    paddingBottom: 48,
    paddingHorizontal: 0,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: C.carbon,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.navy,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    height: HEADER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  // Monograma DG (sello cuadrado de trazo fino)
  monogram: {
    width: 38,
    height: 38,
    border: '1.5pt solid #2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  monogramText: {
    color: C.white,
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },

  // Bloque de texto del header
  headerTextBlock: {
    flexDirection: 'column',
  },
  headerBrand: {
    color: C.white,
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
  },
  headerSlogan: {
    color: '#7a90b0',
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    letterSpacing: 2,
    marginTop: 2,
  },

  // Línea acento bajo el header
  accentStripe: {
    height: ACCENT_STRIPE_HEIGHT,
    backgroundColor: C.electric,
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
  },

  // ── Contenido principal ──────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 28,
    paddingTop: 0,
    paddingBottom: 40,
  },

  // Título del documento
  docTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
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

  // ── Sección ──────────────────────────────────────────────────────────────────
  section: {
    marginBottom: 14,
  },

  // Encabezado de sección: franja corp + texto blanco
  sectionHeader: {
    backgroundColor: C.corp,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  subtitle: {
    color: C.white,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Contenido de sección sobre fondo suave
  sectionBody: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeft: `2pt solid ${C.electric}`,
  },

  // Filas de datos (label + valor)
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  fieldLabel: {
    color: C.steel,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    width: 100,
    flexShrink: 0,
  },
  fieldValue: {
    color: C.carbon,
    fontSize: 8.5,
    flex: 1,
  },

  freeText: {
    color: C.carbon,
    fontSize: 8.5,
    lineHeight: 1.6,
  },

  // ── Items de lista (productos / necesidades) ────────────────────────────────
  itemCard: {
    marginBottom: 8,
    paddingTop: 7,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
  },
  itemCardFirst: {
    marginBottom: 8,
    paddingTop: 0,
  },
  itemTitle: {
    color: C.navy,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginBottom: 4,
    flex: 1,
  },
  itemBullet: {
    color: C.electric,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginRight: 4,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  subFieldRow: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 10,
  },
  subFieldLabel: {
    color: C.steel,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    width: 110,
    flexShrink: 0,
  },
  subFieldValue: {
    color: C.carbon,
    fontSize: 8,
    flex: 1,
  },

  // Badge de prioridad
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 3,
  },
  priorityText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
  },

  // ── Próximos pasos ──────────────────────────────────────────────────────────
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  stepNumber: {
    color: C.white,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    backgroundColor: C.electric,
    width: 16,
    height: 16,
    textAlign: 'center',
    paddingTop: 2,
    marginRight: 8,
    flexShrink: 0,
  },
  stepText: {
    color: C.carbon,
    fontSize: 8.5,
    flex: 1,
    lineHeight: 1.5,
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 28,
    right: 28,
    borderTop: `1pt solid ${C.border}`,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    color: C.steel,
    fontSize: 7,
    letterSpacing: 0.8,
  },
  footerRight: {
    color: C.steel,
    fontSize: 7,
  },
  footerAccent: {
    color: C.electric,
    fontFamily: 'Helvetica-Bold',
  },
});

// ─── Helpers de UI ───────────────────────────────────────────────────────────

function SectionBlock({ title, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader} wrap={false}>
        <Text style={styles.subtitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function displayValue(value) {
  if (value === undefined || value === null) return '—';
  const str = String(value).trim();
  return str ? str : '—';
}

function Field({ label, value }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{displayValue(value)}</Text>
    </View>
  );
}

function SubField({ label, value }) {
  return (
    <View style={styles.subFieldRow}>
      <Text style={styles.subFieldLabel}>{label}</Text>
      <Text style={styles.subFieldValue}>{displayValue(value)}</Text>
    </View>
  );
}

function PriorityBadge({ priority }) {
  const normalized = (priority || '').toLowerCase();
  const isHigh = normalized === 'alta' || normalized === 'high';
  const isMed = normalized === 'media' || normalized === 'medium';
  const bg = isHigh ? C.amber : isMed ? C.corp : C.steel;

  return (
    <View style={[styles.priorityBadge, { backgroundColor: bg }]}>
      <Text style={[styles.priorityText, { color: C.white }]}>
        {displayValue(priority).toUpperCase()}
      </Text>
    </View>
  );
}

function formatFecha(fecha) {
  if (!fecha) return 'DD/MM/AAAA';
  return `${fecha.dd || 'DD'}/${fecha.mm || 'MM'}/${fecha.aaaa || 'AAAA'}`;
}

function formatTipoNecesidad(tipo, otro) {
  if (!tipo) return '—';

  const labels = {
    materia_prima: 'Materia Prima',
    producto_terminado: 'Producto Terminado',
    empaque: 'Empaque',
    repuesto: 'Repuesto',
    equipo: 'Equipo',
    servicio: 'Servicio',
    otro: 'Otro',
  };

  if (tipo === 'otro') {
    return otro?.trim() ? `Otro: ${otro}` : 'Otro';
  }

  return labels[tipo] || tipo;
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SolicitudLevantamientoProcuraPDF({ data }) {
  const fechaStr = formatFecha(data?.fechaReunion);
  const cliente = data?.cliente || {};
  const contactos = data?.contactos || [];
  const contactoPrincipal = contactos[0];
  const productos = data?.productosCliente || [];
  const proximosPasos = data?.proximosPasos || [];

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* ── HEADER ── */}
        <View style={styles.header} fixed>
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>DG</Text>
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerBrand}>DUBOIS · Grupo Logístico</Text>
            <Text style={styles.headerSlogan}>GLOBAL TRADE INTELLIGENCE</Text>
          </View>
        </View>

        {/* Franja acento eléctrico */}
        <View style={styles.accentStripe} fixed />
        

        {/* ── CUERPO ── */}
        <View style={styles.body}>
          <Text style={styles.docTitle}>Ficha de Levantamiento de Procura</Text>
          <View style={styles.docTitleUnderline} />

          {/* 1. Información general */}
          <SectionBlock title="01 — Información General">
            <Field label="Razón social" value={cliente.razonSocial} />
            <Field label="Fecha" value={fechaStr} />
            <Field label="Ciudad" value={cliente.ciudad} />
            <Field label="Dirección" value={cliente.direccion} />
            <Field label="Sector" value={cliente.sectorIndustria} />
            <Field label="Canal comercial" value={cliente.canalComercializacion} />
          </SectionBlock>

          {/* 2. CONTACTOS */}
          <SectionBlock title="02 — Contactos">
            {contactos.length ? (
              contactos.map((contacto, index) => (
                <View
                  key={index}
                  style={index === 0 ? styles.itemCardFirst : styles.itemCard}
                  wrap
                >
                  <View style={styles.itemTitleRow} wrap={false}>
                    <Text style={styles.itemBullet}>▸</Text>
                    <Text style={styles.itemTitle}>
                      {displayValue(contacto.nombre)}
                      {index === 0 ? ' (Principal)' : ''}
                    </Text>
                  </View>
                  <SubField label="Cargo" value={contacto.cargo} />
                  <SubField label="Teléfono" value={contacto.telefono} />
                  <SubField label="Email" value={contacto.email} />
                </View>
              ))
            ) : (
              <>
                <Field label="Nombre" value={contactoPrincipal?.nombre} />
                <Field label="Cargo" value={contactoPrincipal?.cargo} />
                <Field label="Teléfono" value={contactoPrincipal?.telefono} />
                <Field label="Email" value={contactoPrincipal?.email} />
              </>
            )}
          </SectionBlock>

          {/* 3. Productos del cliente y necesidad de procura */}
          <SectionBlock title="03 — Productos del Cliente y Necesidad de Procura">
            {productos.length ? (
              productos.map((producto, index) => (
                <View
                  key={index}
                  style={index === 0 ? styles.itemCardFirst : styles.itemCard}
                  wrap
                >
                  <View style={styles.itemTitleRow} wrap={false}>
                    <Text style={styles.itemBullet}>▸</Text>
                    <Text style={styles.itemTitle}>
                      {displayValue(producto.nombreProducto)}
                    </Text>
                  </View>

                  <SubField label="Categoría" value={producto.categoria} />
                  <SubField label="Descripción" value={producto.descripcion} />
                  <SubField label="Dimensiones" value={producto.dimensiones} />
                  <SubField label="Empaque" value={producto.empaque} />
                  <SubField label="Marca" value={producto.marca} />
                  <SubField label="Modelo" value={producto.referenciaModelo} />
                  <SubField label="País de origen" value={producto.paisOrigen} />
                  <SubField
                    label="Tipo necesidad"
                    value={formatTipoNecesidad(producto.tipoNecesidad, producto.tipoNecesidadOtro)}
                  />
                  <SubField label="Frecuencia" value={producto.frecuenciaRequerida} />
                  <SubField label="Cantidad" value={producto.cantidadReferencial} />

                  <View style={styles.subFieldRow} wrap={false}>
                    <Text style={styles.subFieldLabel}>Prioridad</Text>
                    <PriorityBadge priority={producto.prioridad} />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.freeText}>—</Text>
            )}
          </SectionBlock>

          {/* 4. Próximos pasos */}
          <SectionBlock title="04 — Próximos Pasos">
            {proximosPasos.length ? (
              proximosPasos.map((paso, index) => (
                <View key={index} style={styles.stepRow} wrap={false}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{displayValue(paso)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.freeText}>—</Text>
            )}
          </SectionBlock>

          {/* 5. Registro interno */}
          <SectionBlock title="05 — Registro Interno">
            <Field label="Elaborado por" value={data?.elaboradoPor?.nombre} />
            <Field label="Cargo" value={data?.elaboradoPor?.cargo} />
          </SectionBlock>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            DUBOIS · Grupo Logístico{'\n'}
            <Text style={{ color: C.border }}>Global Trade Intelligence</Text>
          </Text>
          <Text style={styles.footerRight}>
            Documento confidencial — uso interno{' '}
            <Text style={styles.footerAccent}>·</Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
}