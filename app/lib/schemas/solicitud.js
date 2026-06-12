// lib/schemas/solicitud.js
import { z } from 'zod';

const str     = (max = 500) => z.string().max(max);
const strReq  = (max = 500) => z.string().min(1, 'Requerido').max(max);
const strOpt  = (max = 500) => z.string().max(max).optional();

// Cada cotizante pertenece a un grupo de producto
const cotizanteSchema = z.object({
  productoNombre: strReq(300),
  nombre:         str(300),
  valor:          str(100),
}).strict();

export const solicitudSchema = z.object({
  // 1. Información General
  fecha: z.object({
    dd:   strReq(2),
    mm:   strReq(2),
    aaaa: strReq(4),
  }).strict(),
  tipoDocumento:      z.enum(['SC1', 'SCP', 'SDS', 'SDC', 'SCM', 'SDV', 'otro']).or(z.literal('')),
  tipoDocumentoOtro:  strOpt(200),
  solicitante:        strReq(200),
  ccNit:              strReq(50),
  telCel:             strReq(50),
  ext:                strOpt(20),
  email:              z.string().email('Email inválido').max(254),

  // 2. Justificación
  descripcionNecesidad: strReq(2000),
  pertinencia:          strReq(2000),

  // 3. Objeto
  descripcionObjeto:  strReq(2000),
  especificaciones:   strReq(2000),
  requierePermisos:   z.enum(['SI', 'NO']).optional(),

  // 4. Obligaciones
  obligaciones: z.array(str(1000)).min(1).max(20),

  // 5. Modalidad
  modalidad:              z.enum(['directa', 'publica']),
  justificacionModalidad: strReq(2000),

  // 6. Estudio de mercado — array de cotizantes con productoNombre
  cotizantes: z.array(cotizanteSchema).min(1).max(200),

  // 7. Valor estimado
  valorEstimado: strReq(200),

  // 8. Forma de pago
  formaPago:   z.enum(['unico', 'parciales']),
  detallePago: strOpt(2000),

  // 9. Criterios selección
  criterioMenorPrecio: z.boolean(),
  criterioOtro:        strOpt(2000),

  // 10. Contratista
  contratistaNombre:   strOpt(200),
  contratistaCcNit:    strOpt(50),
  contratistaEmail:    strOpt(254),
  contratistaCiudad:   strOpt(200),
  contratistaTelefono: strOpt(50),

  // 11. Riesgos
  riesgos: z.array(z.object({
    descripcion: str(1000),
    mitigacion:  str(1000),
    asignacion:  z.enum(['Contratante', 'Contratista']),
  }).strict()).max(4),

  // 12. Garantías
  garantias: z.array(str(500)).max(10).optional(),

  // 13. Plazo
  plazo: strReq(200),

  // 14. Comité evaluador
  comiteEvaluador: z.array(str(200)).max(3).optional(),

  // 16. Documentos soporte
  documentosSoporte: z.array(str(500)).max(20).optional(),

  // Firmas
  elaboradoPor: z.object({
    nombre: str(200),
    cargo:  str(200),
    fecha:  str(50),
  }).strict(),
  responsableContratacion: z.object({
    nombre: str(200),
    cargo:  str(200),
    fecha:  str(50),
  }).strict(),
}).strict();

/**
 * @typedef {import('zod').infer<typeof solicitudSchema>} SolicitudFormData
 */