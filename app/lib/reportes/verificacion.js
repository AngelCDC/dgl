// ─── Normalizador de informes de verificación de empresas ─────────────────────
// Convierte el JSON crudo (formato externo de due diligence chino) en una vista
// estable usada por la página web, el PDF y los previews del admin.
//
// Uso:
//   import { normalizeReporte, metricColor, isEmpty } from '@/app/lib/reportes/verificacion'
//   const n = normalizeReporte(reporte.data)

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Retorna el primer valor que exista entre las keys candidatas. */
export function pick(obj, keys) {
  if (!obj || typeof obj !== 'object') return undefined
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k]
  }
  return undefined
}

/** Retorna true si el array/objeto está vacío o no es array. */
export function isEmpty(list) {
  return !Array.isArray(list) || list.length === 0
}

// ─── Colores de riesgo ─────────────────────────────────────────────────────────

export const RISK = {
  clean: '#16a34a',
  steel: '#5a6478',
  warn: '#d97706',
  severe: '#dc2626',
}

/**
 * Color según valor de métrica individual.
 * Escala uniforme para todas las métricas: la cantidad de registros no determina
 * riesgo por sí sola — el color solo indica volumen, no un juicio.
 *
 *   0      → verde
 *   1 – 2  → steel
 *   3      → amber
 *   4+     → rojo
 *
 * @param {number} value — valor numérico de la métrica
 * @returns {string} color CSS
 */
export function metricColor(value) {
  if (value == null) return RISK.clean
  if (value >= 4) return RISK.severe
  if (value >= 3) return RISK.warn
  if (value >= 1) return RISK.steel
  return RISK.clean
}

/** Color según puntaje total (escala arbitraria, calibrar con datos reales). */
export function scoreColor(totalScore) {
  if (totalScore == null) return RISK.clean
  if (totalScore >= 20) return RISK.severe
  if (totalScore >= 5) return RISK.warn
  return RISK.clean
}

/** Etiqueta de riesgo según puntaje. */
export function scoreLabel(totalScore) {
  if (totalScore == null) return 'Sin datos'
  if (totalScore >= 20) return 'Riesgo Alto'
  if (totalScore >= 5) return 'Riesgo Medio'
  return 'Riesgo Bajo'
}

// ─── Métricas ──────────────────────────────────────────────────────────────────

const METRIC_KEYS = [
  { key: 'administrative_compliance', labelEs: 'Administración de cumplimiento', labelZh: '行政管理', descEs: 'Expedientes de cumplimiento administrativo (permisos)', descZh: '行政管理相关记录' },
  { key: 'honesty_and_trustworthiness', labelEs: 'Honestidad y confiabilidad', labelZh: '诚实守信', descEs: 'Registros de buena fe / cumplimiento honesto', descZh: '诚实守信记录' },
  { key: 'serious_violations', labelEs: 'Infracciones graves', labelZh: '严重失信', descEs: 'Lista negra de infracciones graves', descZh: '严重违法失信名单记录' },
  { key: 'operational_anomalies', labelEs: 'Anomalías operativas', labelZh: '经营异常', descEs: 'Historial de anomalías en la operación', descZh: '经营异常名录记录' },
  { key: 'credit_commitments', labelEs: 'Compromisos de crédito', labelZh: '信用承诺', descEs: 'Compromisos de crédito registrados', descZh: '信用承诺记录' },
  { key: 'credit_evaluation', labelEs: 'Evaluación de crédito', labelZh: '信用评价', descEs: 'Evaluaciones de crédito registradas', descZh: '信用评价记录' },
  { key: 'judicial_judgments', labelEs: 'Sentencias judiciales', labelZh: '司法判决', descEs: 'Sentencias o fallos judiciales', descZh: '司法判决记录' },
  { key: 'other', labelEs: 'Otros', labelZh: '其他', descEs: 'Otros registros', descZh: '其他相关记录' },
]

// ─── Normalizador principal ────────────────────────────────────────────────────

/**
 * Convierte el JSON crudo del sistema externo en una vista normalizada.
 * @param {object} raw — el JSON tal cual fue subido (data completa)
 * @returns {object} vista normalizada con secciones company, businessLicense, etc.
 */
export function normalizeReporte(raw) {
  if (!raw || typeof raw !== 'object') return emptyReport()

  const company = raw.company || {}
  const license = raw.business_license || {}
  const customs = raw.customs_registration || {}
  const metricsSummary = raw.credit_metrics_summary || {}
  const permits = raw.administrative_permits || {}
  const sanctions = raw.administrative_sanctions || {}
  const exceptions = raw.operational_exception_list || {}
  const blacklist = raw.serious_blacklist || {}
  const interp = raw.interpretation || {}

  // ── Company ──
  const c = {
    nombreEs: pick(company, ['name', 'nombre']) || 'Sin nombre',
    nombreZh: pick(company, ['name_zh', 'nombre_zh']) || null,
    estado: pick(company, ['status', 'estado']) || null,
    codigoCreditoSocial: pick(company, ['unified_social_credit_code', 'codigo_credito_social']) || null,
    representanteLegal: pick(company, ['legal_representative', 'representante_legal']) || null,
    representanteLegalZh: pick(company, ['legal_representative_zh', 'representante_legal_zh']) || null,
    autoridadRegistro: pick(company, ['registration_authority', 'autoridad_registro']) || null,
    autoridadRegistroZh: pick(company, ['registration_authority_zh', 'autoridad_registro_zh']) || null,
    fechaConstitucion: pick(company, ['establishment_date', 'fecha_constitucion']) || null,
    domicilio: pick(company, ['domicile', 'domicilio']) || null,
    domicilioZh: pick(company, ['domicile_zh', 'domicilio_zh']) || null,
  }

  // ── Business License ──
  const bl = {
    capitalRegistrado: pick(license, ['registered_capital', 'capital_registrado']) || null,
    tipoEntidad: pick(license, ['entity_type', 'tipo_entidad']) || null,
    tipoEntidadZh: pick(license, ['entity_type_zh', 'tipo_entidad_zh']) || null,
    fechaAprobacion: pick(license, ['approval_date', 'fecha_aprobacion']) || null,
    ambitoNegocio: license.business_scope_general || license.business_scope || [],
    avisoLegal: pick(license, ['notice', 'aviso']) || null,
  }

  // ── Customs ──
  const cu = {
    aduanaLocal: pick(customs, ['local_customs', 'aduana_local']) || null,
    aduanaLocalZh: pick(customs, ['local_customs_zh', 'aduana_local_zh']) || null,
    fechaRegistro: pick(customs, ['registration_date', 'fecha_registro']) || null,
    estado: pick(customs, ['cancellation_status', 'estado_cancelacion']) || null,
    estadoZh: pick(customs, ['cancellation_status_zh', 'estado_cancelacion_zh']) || null,
  }

  // ── Metrics ──
  const metrics = METRIC_KEYS.map(mk => {
    const src = metricsSummary[mk.key] || {}
    return {
      key: mk.key,
      value: src.value ?? 0,
      labelEs: pick(src, ['label_es']) || mk.labelEs,
      labelZh: pick(src, ['label_zh']) || mk.labelZh,
      descEs: pick(src, ['description_es']) || mk.descEs,
      descZh: pick(src, ['description_zh']) || mk.descZh,
    }
  })

  // El total_score viene del JSON externo (calculado por el sistema de due diligence),
  // NO se deriva de la suma de valores de métricas individuales.
  const totalScore = pick(metricsSummary, ['total_score']) ?? null
  const totalRecords = pick(metricsSummary, ['total_records']) ?? 0

  // ── Records ──
  function normalizeRecords(src) {
    const records = (src.records || []).map((r, i) => ({
      number: r.number ?? (i + 1),
      decisionDocumentNumber: pick(r, ['decision_document_number']) || null,
      decisionDocumentName: pick(r, ['decision_document_name']) || null,
      decisionDocumentNameZh: pick(r, ['decision_document_name_zh']) || null,
      permitCategory: pick(r, ['permit_category']) || null,
      permitCategoryZh: pick(r, ['permit_category_zh']) || null,
      permitContent: pick(r, ['permit_content']) || null,
      permitContentZh: pick(r, ['permit_content_zh']) || null,
      decisionDate: pick(r, ['decision_date']) || null,
      validFrom: pick(r, ['valid_from']) || null,
      validTo: pick(r, ['valid_to']) || null,
      issuingAuthority: pick(r, ['issuing_authority']) || null,
      issuingAuthorityZh: pick(r, ['issuing_authority_zh']) || null,
    }))
    return { records, total: src.total ?? records.length }
  }

  // ── Interpretation ──
  const interpretation = {
    positivos: interp.positive_indicators || [],
    neutrales: interp.neutral_indicators || [],
    negativos: interp.negative_indicators || [],
    resumenEs: pick(interp, ['summary_es']) || null,
    resumenZh: pick(interp, ['summary_zh']) || null,
  }

  return {
    company: c,
    businessLicense: bl,
    customsRegistration: cu,
    metrics,
    totalScore,
    totalRecords,
    permits: normalizeRecords(permits),
    sanctions: normalizeRecords(sanctions),
    exceptions: normalizeRecords(exceptions),
    blacklist: normalizeRecords(blacklist),
    interpretation,
  }
}

function emptyReport() {
  return {
    company: { nombreEs: '', nombreZh: null, estado: null, codigoCreditoSocial: null, representanteLegal: null, representanteLegalZh: null, autoridadRegistro: null, autoridadRegistroZh: null, fechaConstitucion: null, domicilio: null, domicilioZh: null },
    businessLicense: { capitalRegistrado: null, tipoEntidad: null, tipoEntidadZh: null, fechaAprobacion: null, ambitoNegocio: [], avisoLegal: null },
    customsRegistration: { aduanaLocal: null, aduanaLocalZh: null, fechaRegistro: null, estado: null, estadoZh: null },
    metrics: METRIC_KEYS.map(mk => ({ key: mk.key, value: 0, labelEs: mk.labelEs, labelZh: mk.labelZh, descEs: mk.descEs, descZh: mk.descZh })),
    totalScore: 0,
    totalRecords: 0,
    permits: { records: [], total: 0 },
    sanctions: { records: [], total: 0 },
    exceptions: { records: [], total: 0 },
    blacklist: { records: [], total: 0 },
    interpretation: { positivos: [], neutrales: [], negativos: [], resumenEs: null, resumenZh: null },
  }
}
