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

const styles = StyleSheet.create({

  // ── Página ──────────────────────────────────────────────────────────────────
  page: {
    backgroundColor: C.white,
    paddingTop: 0,       // el header ocupa la franja superior
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
  },

  // Monograma DG (sello cuadrado de trazo fino)
  monogram: {
    width: 38,
    height: 38,
    border: '1.5pt solid #2563eb',   // trazo eléctrico fino
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
    height: 3,
    backgroundColor: C.electric,
  },

  // ── Contenido principal ──────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 28,
    paddingTop: 20,
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
    backgroundColor: C.bgSoft,
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

  // Texto libre (objetivo de reunión)
  freeText: {
    color: C.carbon,
    fontSize: 8.5,
    lineHeight: 1.6,
  },

  // ── Items de lista (productos / necesidades) ────────────────────────────────
  itemCard: {
    marginBottom: 8,
    borderTop: `0.5pt solid ${C.border}`,
    paddingTop: 7,
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
      <View style={styles.sectionHeader}>
        <Text style={styles.subtitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>
        {children}
      </View>
    </View>
  );
}

function Field({ label, value }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || '—'}</Text>
    </View>
  );
}

function SubField({ label, value }) {
  return (
    <View style={styles.subFieldRow}>
      <Text style={styles.subFieldLabel}>{label}</Text>
      <Text style={styles.subFieldValue}>{value || '—'}</Text>
    </View>
  );
}

function PriorityBadge({ priority }) {
  const isHigh = priority?.toLowerCase() === 'alta' || priority?.toLowerCase() === 'high';
  const isMed  = priority?.toLowerCase() === 'media' || priority?.toLowerCase() === 'medium';
  const bg     = isHigh ? C.amber : isMed ? C.corp : C.steel;
  return (
    <View style={[styles.priorityBadge, { backgroundColor: bg }]}>
      <Text style={[styles.priorityText, { color: C.white }]}>
        {(priority || '—').toUpperCase()}
      </Text>
    </View>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SolicitudLevantamientoProcuraPDF({ data }) {
  const fechaStr = `${data.fecha?.dd || 'DD'}/${data.fecha?.mm || 'MM'}/${data.fecha?.aaaa || 'AAAA'}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          {/* Monograma DG */}
          <View style={styles.monogram}>
            <Text style={styles.monogramText}>DG</Text>
          </View>
          {/* Nombre + Slogan */}
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerBrand}>DUBOIS · Grupo Logístico</Text>
            <Text style={styles.headerSlogan}>GLOBAL TRADE INTELLIGENCE</Text>
          </View>
        </View>

        {/* Franja acento eléctrico */}
        <View style={styles.accentStripe} />

        {/* ── CUERPO ── */}
        <View style={styles.body}>

          {/* Título documento */}
          <Text style={styles.docTitle}>Ficha de Levantamiento de Procura</Text>
          <View style={styles.docTitleUnderline} />

          {/* 1. Información general */}
          <SectionBlock title="01 — Información General">
            <Field label="Empresa"         value={data.empresaCliente} />
            <Field label="Nombre comercial" value={data.nombreComercial} />
            <Field label="Fecha"            value={fechaStr} />
            <Field label="Ciudad"           value={data.ciudad} />
            <Field label="Dirección"        value={data.direccion} />
          </SectionBlock>

          {/* 2. Contacto principal */}
          <SectionBlock title="02 — Contacto Principal">
            <Field label="Nombre"   value={data.contactoPrincipal?.nombre} />
            <Field label="Cargo"    value={data.contactoPrincipal?.cargo} />
            <Field label="Teléfono" value={data.contactoPrincipal?.telefono} />
            <Field label="Email"    value={data.contactoPrincipal?.email} />
          </SectionBlock>

          {/* 3. Objetivo de la reunión */}
          <SectionBlock title="03 — Objetivo de la Reunión">
            <Text style={styles.freeText}>{data.objetivoReunion}</Text>
          </SectionBlock>

          {/* 4. Productos del cliente */}
          <SectionBlock title="04 — Productos del Cliente">
            {data.productosCliente.map((producto, index) => (
              <View key={index} style={index === 0 ? styles.itemCardFirst : styles.itemCard}>
                {/* Nombre producto */}
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemBullet}>▸</Text>
                  <Text style={styles.itemTitle}>{producto.nombreProducto}</Text>
                </View>
                <SubField label="Categoría"       value={producto.categoria} />
                <SubField label="Descripción"      value={producto.descripcionGeneral} />
                <SubField
                  label="Características"
                  value={
                    producto.caracteristicasPrincipales?.length
                      ? producto.caracteristicasPrincipales.join(' · ')
                      : undefined
                  }
                />
              </View>
            ))}
          </SectionBlock>

          {/* 5. Necesidades de procura */}
          <SectionBlock title="05 — Necesidades de Procura">
            {data.necesidadesProcura.map((item, index) => (
              <View key={index} style={index === 0 ? styles.itemCardFirst : styles.itemCard}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemBullet}>▸</Text>
                  <Text style={styles.itemTitle}>{item.productoRelacionado}</Text>
                </View>
                <SubField label="Tipo"                   value={item.tipoNecesidad} />
                <SubField label="Descripción"             value={item.descripcion} />
                <SubField label="Especif. mínimas"        value={item.especificacionesMinimas} />
                {/* Badge de prioridad */}
                <View style={styles.subFieldRow}>
                  <Text style={styles.subFieldLabel}>Prioridad</Text>
                  <PriorityBadge priority={item.prioridad} />
                </View>
              </View>
            ))}
          </SectionBlock>

          {/* 6. Próximos pasos */}
          <SectionBlock title="06 — Próximos Pasos">
            {data.proximosPasos.map((paso, index) => (
              <View key={index} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{paso}</Text>
              </View>
            ))}
          </SectionBlock>

        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
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