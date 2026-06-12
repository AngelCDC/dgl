// lib/schemas/solicitud-procura-simple.js
import { z } from 'zod';

const textoRequerido = z.string().trim().min(1, 'Requerido').max(500, 'Máximo 500 caracteres');
const textoOpcional  = z.string().trim().max(500, 'Máximo 500 caracteres').optional();
const textoLargo     = z.string().trim().max(2000, 'Máximo 2000 caracteres').optional();

const fechaSchema = z
  .object({
    dd: z.string().trim().regex(/^\d{2}$/, 'Día inválido'),
    mm: z.string().trim().regex(/^\d{2}$/, 'Mes inválido'),
    aaaa: z.string().trim().regex(/^\d{4}$/, 'Año inválido'),
  })
  .superRefine((data, ctx) => {
    const dd = Number(data.dd);
    const mm = Number(data.mm);
    const aaaa = Number(data.aaaa);

    if (dd < 1 || dd > 31) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dd'],
        message: 'Día inválido',
      });
    }

    if (mm < 1 || mm > 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mm'],
        message: 'Mes inválido',
      });
    }

    if (aaaa < 2000 || aaaa > 2100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['aaaa'],
        message: 'Año inválido',
      });
    }
  });

const contactoSchema = z.object({
  nombre: textoRequerido,
  cargo: textoOpcional,
  telefono: textoOpcional,
  email: z.union([
    z.string().trim().email('Email inválido').max(254, 'Máximo 254 caracteres'),
    z.literal(''),
    z.undefined(),
  ]),
}).strict();

const productoSchema = z.object({
  nombreProducto: textoRequerido,
  categoria: textoOpcional,
  // Campo unificado: descripción técnica + características + materiales + notas
  descripcion: textoLargo,
  dimensiones: textoOpcional,
  empaque: textoOpcional,
  marca: textoOpcional,
  referenciaModelo: textoOpcional,
  paisOrigen: textoOpcional,

  tipoNecesidad: z.enum([
    'materia_prima',
    'producto_terminado',
    'empaque',
    'repuesto',
    'equipo',
    'servicio',
    'otro',
  ]),
  tipoNecesidadOtro: textoOpcional,
  frecuenciaRequerida: textoOpcional,
  cantidadReferencial: textoOpcional,
  prioridad: z.enum(['alta', 'media', 'baja']).optional(),
}).strict();

export const solicitudProcuraSimpleSchema = z
  .object({
    // 1. Información general de la reunión
    fechaReunion: fechaSchema.strict(),

    cliente: z.object({
      cedulaRif: textoOpcional,
      razonSocial: textoRequerido,
      ciudad: textoOpcional,
      direccion: textoOpcional,
      sectorIndustria: textoOpcional,
      canalComercializacion: textoOpcional,
    }).strict(),

    // 2. Contactos
    contactos: z
      .array(contactoSchema)
      .min(1, 'Debe registrar al menos un contacto')
      .max(50, 'Máximo 50 contactos'),

    // 3. Productos + procura integrada
    productosCliente: z
      .array(productoSchema)
      .min(1, 'Debe registrar al menos un producto')
      .max(100, 'Máximo 100 productos'),

    // 4. Próximos pasos
    proximosPasos: z
      .array(z.string().trim().min(1, 'El paso no puede ir vacío').max(500))
      .min(1, 'Debe agregar al menos un próximo paso')
      .max(20, 'Máximo 20 pasos'),

    // 5. Registro interno
    elaboradoPor: z.object({
      nombre: textoRequerido,
      cargo: textoOpcional,
    }).strict(),
  })
  .strict()
  .superRefine((data, ctx) => {
    data.productosCliente.forEach((item, index) => {
      if (item.tipoNecesidad === 'otro' && !item.tipoNecesidadOtro?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['productosCliente', index, 'tipoNecesidadOtro'],
          message: 'Debe especificar el tipo de necesidad',
        });
      }
    });
  });

/**
 * @typedef {import('zod').infer<typeof solicitudProcuraSimpleSchema>} SolicitudProcuraSimpleFormData
 */