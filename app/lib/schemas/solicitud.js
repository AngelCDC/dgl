// lib/schemas/solicitud.js
import { z } from 'zod';

// Cada cotizante pertenece a un grupo de producto
const cotizanteSchema = z.object({
  productoNombre: z.string().min(1, 'Requerido'),
  nombre:         z.string(),
  valor:          z.string(),
});

export const solicitudSchema = z.object({
  // 1. Información General
  fecha: z.object({
    dd:   z.string().length(2),
    mm:   z.string().length(2),
    aaaa: z.string().length(4),
  }),
  tipoDocumento:      z.enum(['SC1', 'SCP', 'SDS', 'SDC', 'SCM', 'SDV', 'otro']).or(z.literal('')),
  tipoDocumentoOtro:  z.string().optional(),
  solicitante:        z.string().min(1, 'Requerido'),
  ccNit:              z.string().min(1, 'Requerido'),
  telCel:             z.string().min(1, 'Requerido'),
  ext:                z.string().optional(),
  email:              z.string().email('Email inválido'),

  // 2. Justificación
  descripcionNecesidad: z.string().min(1, 'Requerido'),
  pertinencia:          z.string().min(1, 'Requerido'),

  // 3. Objeto
  descripcionObjeto:  z.string().min(1, 'Requerido'),
  especificaciones:   z.string().min(1, 'Requerido'),
  requierePermisos:   z.enum(['SI', 'NO']).optional(),

  // 4. Obligaciones
  obligaciones: z.array(z.string()).min(1),

  // 5. Modalidad
  modalidad:              z.enum(['directa', 'publica']),
  justificacionModalidad: z.string().optional(),

  // 6. Estudio de mercado — array de cotizantes con productoNombre
  // Cada grupo de producto tiene sus propios cotizantes
  cotizantes: z.array(cotizanteSchema).min(1, 'Debe agregar al menos un cotizante'),

  // 7. Valor estimado
  valorEstimado: z.string().min(1, 'Requerido'),

  // 8. Forma de pago
  formaPago:   z.enum(['unico', 'parciales']),
  detallePago: z.string().optional(),

  // 9. Criterios selección
  criterioMenorPrecio: z.boolean(),
  criterioOtro:        z.string().optional(),

  // 10. Contratista
  contratistaNombre:   z.string().optional(),
  contratistaCcNit:    z.string().optional(),
  contratistaEmail:    z.string().optional(),
  contratistaCiudad:   z.string().optional(),
  contratistaTelefono: z.string().optional(),

  // 11. Riesgos
  riesgos: z.array(z.object({
    descripcion: z.string(),
    mitigacion:  z.string(),
    asignacion:  z.enum(['Contratante', 'Contratista']),
  })).max(4),

  // 12. Garantías
  garantias: z.array(z.string()).optional(),

  // 13. Plazo
  plazo: z.string().min(1, 'Requerido'),

  // 14. Comité evaluador
  comiteEvaluador: z.array(z.string()).max(3).optional(),

  // 16. Documentos soporte
  documentosSoporte: z.array(z.string()).optional(),

  // Firmas
  elaboradoPor: z.object({
    nombre: z.string(),
    cargo:  z.string(),
    fecha:  z.string(),
  }),
  responsableContratacion: z.object({
    nombre: z.string(),
    cargo:  z.string(),
    fecha:  z.string(),
  }),
});

/**
 * @typedef {import('zod').infer<typeof solicitudSchema>} SolicitudFormData
 */