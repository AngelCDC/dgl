// lib/schemas/solicitud-procura-simple.js
import { z } from 'zod';

const textoRequerido = z.string().trim().min(1, 'Requerido');
const textoOpcional = z.string().trim().optional();

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
    z.string().trim().email('Email inválido'),
    z.literal(''),
    z.undefined(),
  ]),
});

const productoSchema = z.object({
  nombreProducto: textoRequerido,
  categoria: textoOpcional,
  // Campo unificado: descripción técnica + características + materiales + notas
  descripcion: textoOpcional,
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
});

export const solicitudProcuraSimpleSchema = z
  .object({
    // 1. Información general de la reunión
    fechaReunion: fechaSchema,

    cliente: z.object({
      cedulaRif: textoOpcional,          // ← Cédula / RIF (opcional en el schema, validado en UI)
      razonSocial: textoRequerido,
      ciudad: textoOpcional,
      direccion: textoOpcional,
      sectorIndustria: textoOpcional,
      canalComercializacion: textoOpcional,
    }),

    // 2. Contactos
    contactos: z
      .array(contactoSchema)
      .min(1, 'Debe registrar al menos un contacto'),

    // 3. Productos + procura integrada
    productosCliente: z
      .array(productoSchema)
      .min(1, 'Debe registrar al menos un producto'),

    // 4. Próximos pasos
    proximosPasos: z
      .array(z.string().trim().min(1, 'El paso no puede ir vacío'))
      .min(1, 'Debe agregar al menos un próximo paso'),

    // 5. Registro interno
    elaboradoPor: z.object({
      nombre: textoRequerido,
      cargo: textoOpcional,
    }),
  })
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