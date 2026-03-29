// lib/schemas/solicitud.js
import { z } from 'zod';

export const solicitudSchema = z.object({
  // 1. Información General
  fecha: z.object({
    dd: z.string().length(2),
    mm: z.string().length(2),
    aaaa: z.string().length(4),
  }),
  tipoDocumento: z.enum(['SC1', 'SCP', 'SDS', 'SDC', 'SCM', 'SDV', 'otro']).or(z.literal('')),
  tipoDocumentoOtro: z.string().optional(),
  solicitante: z.string().min(1, 'Requerido'),
  ccNit: z.string().min(1, 'Requerido'),
  telCel: z.string().min(1, 'Requerido'),
  ext: z.string().optional(),
  email: z.string().email('Email inválido'),
  centroGastos: z.string().optional(),

  // 2. Justificación
  descripcionNecesidad: z.string().min(1, 'Requerido'),
  pertinencia: z.string().min(1, 'Requerido'),

  // 3. Objeto
  descripcionObjeto: z.string().min(1, 'Requerido'),
  especificaciones: z.string().min(1, 'Requerido'),
  requierePermisos: z.enum(['SI', 'NO']).optional(),

  // 4. Obligaciones
  obligaciones: z.array(z.string()).min(1),

  // 5. Modalidad
  modalidad: z.enum(['directa', 'publica']),
  justificacionModalidad: z.string().optional(),

  // 6. Estudio de mercado
  cotizantes: z.array(z.object({
    nombre: z.string(),
    valor: z.string(),
  })).length(3),

  // 7. Valor estimado
  valorEstimado: z.string().min(1, 'Requerido'),
  cdpNo: z.string().optional(),

  // 8. Forma de pago
  formaPago: z.enum(['unico', 'parciales']),
  detallePago: z.string().optional(),

  // 9. Criterios selección
  criterioMenorPrecio: z.boolean(),
  criterioOtro: z.string().optional(),

  // 10. Contratista (solo contratación directa)
  contratistaNombre: z.string().optional(),
  contratistaCcNit: z.string().optional(),
  contratistaEmail: z.string().optional(),
  contratistaCiudad: z.string().optional(),
  contratistaTelefono: z.string().optional(),

  // 11. Riesgos
  riesgos: z.array(z.object({
    descripcion: z.string(),
    mitigacion: z.string(),
    asignacion: z.enum(['Contratante', 'Contratista']),
  })).max(4),

  // 12. Garantías
  garantias: z.array(z.string()).optional(),

  // 13. Plazo
  plazo: z.string().min(1, 'Requerido'),

  // 14. Comité evaluador (solo convocatoria pública)
  comiteEvaluador: z.array(z.string()).max(3).optional(),

  // 15. Supervisor
  supervisorNombre: z.string().min(1, 'Requerido'),
  supervisorCorreo: z.string().email().optional().or(z.literal('')),
  supervisorCelular: z.string().optional(),
  supervisorCargo: z.string().optional(),

  // 16. Documentos soporte
  documentosSoporte: z.array(z.string()).optional(),

  // Firmas
  elaboradoPor: z.object({ 
    nombre: z.string(), 
    cargo: z.string(), 
    fecha: z.string() 
  }),
  ordenadorGasto: z.object({ 
    nombre: z.string(), 
    cargo: z.string(), 
    fecha: z.string() 
  }),
  responsableContratacion: z.object({ 
    nombre: z.string(), 
    cargo: z.string(), 
    fecha: z.string() 
  }),
});

// Nota: El tipo TypeScript se elimina en JS
// Si necesitas validación de tipos en JSDoc, puedes agregar:
/**
 * @typedef {import('zod').infer<typeof solicitudSchema>} SolicitudFormData
 */