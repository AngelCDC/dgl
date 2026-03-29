// lib/schemas/solicitud-procura-simple.js
import { z } from 'zod';

const textoRequerido = z.string().trim().min(1, 'Requerido');
const textoOpcional = z.string().trim().optional();

const fechaSchema = z.object({
  dd: z.string().trim().regex(/^\d{2}$/, 'Día inválido'),
  mm: z.string().trim().regex(/^\d{2}$/, 'Mes inválido'),
  aaaa: z.string().trim().regex(/^\d{4}$/, 'Año inválido'),
});

const productoSchema = z.object({
  nombreProducto: textoRequerido,
  categoria: textoOpcional,
  descripcionGeneral: textoRequerido,
  caracteristicasPrincipales: z
    .array(z.string().trim().min(1, 'La característica no puede ir vacía'))
    .min(1, 'Debe agregar al menos una característica'),

  presentaciones: z.array(z.string().trim().min(1)).optional(),
  materiales: z.array(z.string().trim().min(1)).optional(),
  colores: z.array(z.string().trim().min(1)).optional(),
  dimensiones: textoOpcional,
  peso: textoOpcional,
  empaque: textoOpcional,
  marca: textoOpcional,
  referenciaModelo: textoOpcional,
  paisOrigen: textoOpcional,
  usosAplicaciones: textoOpcional,
  requerimientosEspeciales: textoOpcional,
  observaciones: textoOpcional,
});

const necesidadProcuraSchema = z.object({
  productoRelacionado: textoRequerido,
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
  descripcion: textoRequerido,
  especificacionesMinimas: textoOpcional,
  frecuenciaRequerida: textoOpcional,
  cantidadReferencial: textoOpcional,
  prioridad: z.enum(['alta', 'media', 'baja']).optional(),
  observaciones: textoOpcional,
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

export const solicitudProcuraSimpleSchema = z
  .object({
    // 1. Información de la reunión
    fecha: fechaSchema,
    empresaCliente: textoRequerido,
    nombreComercial: textoOpcional,
    ciudad: textoOpcional,
    direccion: textoOpcional,

    // 2. Contactos
    contactoPrincipal: contactoSchema,
    otrosContactos: z.array(contactoSchema).optional(),

    // 3. Contexto de la reunión
    objetivoReunion: textoRequerido,
    resumenCliente: textoOpcional,
    sectorIndustria: textoOpcional,
    canalComercializacion: textoOpcional,

    // 4. Portafolio del cliente
    productosCliente: z
      .array(productoSchema)
      .min(1, 'Debe registrar al menos un producto'),

    // 5. Necesidades de procura detectadas
    necesidadesProcura: z
      .array(necesidadProcuraSchema)
      .min(1, 'Debe registrar al menos una necesidad de procura'),

    // 6. Observaciones generales
    fortalezasDetectadas: z.array(z.string().trim().min(1)).optional(),
    restriccionesDetectadas: z.array(z.string().trim().min(1)).optional(),
    comentariosFinales: textoOpcional,

    // 7. Próximos pasos
    proximosPasos: z
      .array(z.string().trim().min(1, 'El paso no puede ir vacío'))
      .min(1, 'Debe agregar al menos un próximo paso'),

    // 8. Registro interno
    elaboradoPor: z.object({
      nombre: textoRequerido,
      cargo: textoOpcional,
      fecha: textoRequerido,
    }),
  })
  .superRefine((data, ctx) => {
    const dd = Number(data.fecha.dd);
    const mm = Number(data.fecha.mm);
    const aaaa = Number(data.fecha.aaaa);

    if (dd < 1 || dd > 31) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fecha', 'dd'],
        message: 'Día inválido',
      });
    }

    if (mm < 1 || mm > 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fecha', 'mm'],
        message: 'Mes inválido',
      });
    }

    if (aaaa < 2000 || aaaa > 2100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fecha', 'aaaa'],
        message: 'Año inválido',
      });
    }

    data.necesidadesProcura.forEach((item, index) => {
      if (
        item.tipoNecesidad === 'otro' &&
        !item.tipoNecesidadOtro?.trim()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['necesidadesProcura', index, 'tipoNecesidadOtro'],
          message: 'Debe especificar el tipo de necesidad',
        });
      }
    });
  });

/**
 * @typedef {import('zod').infer<typeof solicitudProcuraSimpleSchema>} SolicitudProcuraSimpleFormData
 */