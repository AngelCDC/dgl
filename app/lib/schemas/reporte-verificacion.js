// lib/schemas/reporte-verificacion.js
// Schema permisivo para validar el "envelope" del JSON externo de due diligence.
// No es estricto con campos individuales — el normalizador (reportes/verificacion.js)
// se encarga de la tolerancia a keys faltantes.
import { z } from 'zod'

const obj = z.record(z.string(), z.unknown())

export const reporteVerificacionSchema = z.object({
  company: z.object({}).passthrough().optional(),
  business_license: obj.optional(),
  customs_registration: obj.optional(),
  credit_metrics_summary: obj.optional(),
  risk_score: obj.optional(),
  tax_credit: obj.optional(),
  administrative_permits: obj.optional(),
  administrative_sanctions: obj.optional(),
  operational_exception_list: obj.optional(),
  serious_blacklist: obj.optional(),
  interpretation: obj.optional(),
}).passthrough()

/**
 * Parsea y valida el envelope del JSON externo.
 * @param {unknown} raw — el objeto JSON a validar
 * @returns {{ ok: true, data: object } | { ok: false, errors: Array<{path: string, message: string}> }}
 */
export function parseReporte(raw) {
  const result = reporteVerificacionSchema.safeParse(raw)
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    }
  }
  return { ok: true, data: result.data }
}
