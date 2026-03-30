import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function AdquisicionDetallePage({ params }) {
  const { id } = await params
  const s = await prisma.solicitudAdquisicion.findUnique({
    where: { id },
    include: {
      cotizantes: { orderBy: { sortOrder: 'asc' } },
      riesgos: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!s) notFound()

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <Link href="/admin/adquisiciones" style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px' }}>← Volver</Link>
          <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '4px' }}>{s.solicitante}</h1>
          <p style={{ fontSize: '13px', color: '#888' }}>{s.fecha} · {s.tipoDocumento === 'otro' ? s.tipoDocumentoOtro : s.tipoDocumento}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/admin/solicitudes/nueva`} style={{ fontSize: '13px', padding: '8px 16px', border: '1px solid #eee', borderRadius: '8px', color: '#555' }}>
            Nueva solicitud
          </Link>
        </div>
      </div>

      <Section title="Información General">
        <Grid>
          <Field label="Solicitante" value={s.solicitante} />
          <Field label="C.C. / NIT" value={s.ccNit} />
          <Field label="Email" value={s.email} />
          <Field label="Tel / Cel" value={s.telCel} />
          <Field label="Tipo de Documento" value={s.tipoDocumento === 'otro' ? s.tipoDocumentoOtro : s.tipoDocumento} />
          <Field label="Fecha" value={s.fecha} />
        </Grid>
      </Section>

      <Section title="Justificación">
        <Field label="Descripción de la necesidad" value={s.descripcionNecesidad} full />
        {s.pertinencia && <Field label="Pertinencia" value={s.pertinencia} full />}
      </Section>

      <Section title="Objeto de la Adquisición">
        <Field label="Descripción" value={s.descripcionObjeto} full />
        {s.especificaciones && <Field label="Especificaciones" value={s.especificaciones} full />}
        {s.requierePermisos && <Field label="Requiere permisos" value={s.requierePermisos} />}
      </Section>

      {s.obligaciones.length > 0 && (
        <Section title="Obligaciones del Contratista">
          {s.obligaciones.map((ob, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#2563eb', minWidth: '20px' }}>{String.fromCharCode(97 + i)})</span>
              <span style={{ fontSize: '13px', color: '#444' }}>{ob}</span>
            </div>
          ))}
        </Section>
      )}

      <Section title="Modalidad de Selección">
        <Grid>
          <Field label="Modalidad" value={s.modalidad === 'directa' ? 'Contratación Directa' : 'Convocatoria Pública'} />
          <Field label="Plazo" value={s.plazo} />
        </Grid>
        <Field label="Justificación" value={s.justificacionModalidad} full />
      </Section>

      {s.cotizantes.length > 0 && (
        <Section title="Estudio de Mercado">
          <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px', background: '#f4f6f9', padding: '8px 16px', fontSize: '11px', fontWeight: '600', color: '#5a6478', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>#</span><span>Cotizante / Proveedor</span><span>Valor ($)</span>
            </div>
            {s.cotizantes.map((c, i) => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px', padding: '10px 16px', borderTop: '1px solid #eee', fontSize: '13px', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                <span style={{ fontFamily: 'monospace', color: '#888' }}>{i + 1}</span>
                <span style={{ fontWeight: '500' }}>{c.nombre}</span>
                <span style={{ fontFamily: 'monospace', color: '#2563eb' }}>{c.valor}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Valor y Forma de Pago">
        <Grid>
          <Field label="Valor Estimado" value={s.valorEstimado} />
          <Field label="Forma de Pago" value={s.formaPago === 'unico' ? 'Pago Único' : s.formaPago === 'parciales' ? 'Pagos Parciales' : s.formaPago} />
        </Grid>
        {s.detallePago && <Field label="Detalle de pago" value={s.detallePago} full />}
      </Section>

      <Section title="Criterios de Selección">
        <Field label="Criterio principal" value={s.criterioMenorPrecio ? 'Menor Precio' : s.criterioOtro} />
      </Section>

      {s.modalidad === 'directa' && s.contratistaNombre && (
        <Section title="Contratista">
          <Grid>
            <Field label="Nombre / Razón Social" value={s.contratistaNombre} />
            <Field label="C.C. / NIT" value={s.contratistaCcNit} />
            <Field label="Email" value={s.contratistaEmail} />
            <Field label="Ciudad" value={s.contratistaCiudad} />
            <Field label="Teléfono" value={s.contratistaTelefono} />
          </Grid>
        </Section>
      )}

      {s.riesgos.length > 0 && (
        <Section title="Análisis del Riesgo">
          <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 120px', background: '#f4f6f9', padding: '8px 16px', fontSize: '11px', fontWeight: '600', color: '#5a6478', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Riesgo</span><span>Descripción</span><span>Mitigación</span><span>Asignación</span>
            </div>
            {s.riesgos.map((r, i) => (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 120px', padding: '10px 16px', borderTop: '1px solid #eee', fontSize: '13px', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                <span style={{ fontFamily: 'monospace', color: '#888' }}>Riesgo {i + 1}</span>
                <span>{r.descripcion}</span>
                <span style={{ color: '#5a6478' }}>{r.mitigacion}</span>
                <span style={{ fontWeight: '500', color: r.asignacion === 'Contratante' ? '#2563eb' : '#d97706' }}>{r.asignacion}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {s.comiteEvaluador.length > 0 && (
        <Section title="Comité Evaluador">
          {s.comiteEvaluador.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#2563eb', minWidth: '20px' }}>{String.fromCharCode(97 + i)})</span>
              <span style={{ fontSize: '13px', color: '#444' }}>{m}</span>
            </div>
          ))}
        </Section>
      )}

      <Section title="Firmas y Aprobaciones">
        <Grid>
          <div style={{ background: '#f4f6f9', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Quien Elabora</div>
            <Field label="Nombre" value={s.elaboradoPorNombre} />
            <Field label="Cargo" value={s.elaboradoPorCargo} />
            <Field label="Fecha" value={s.elaboradoPorFecha} />
          </div>
          <div style={{ background: '#f4f6f9', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Contratante</div>
            <Field label="Nombre" value={s.contratanteNombre} />
            <Field label="Cargo" value={s.contratanteCargo} />
            <Field label="Fecha" value={s.contratanteFecha} />
          </div>
        </Grid>
      </Section>

    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontWeight: '600', fontSize: '13px', color: '#0a1628', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '2px solid #0a1628', paddingBottom: '8px', marginBottom: '16px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Grid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>{children}</div>
}

function Field({ label, value, full }) {
  if (!value) return null
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#111', lineHeight: '1.5' }}>{value}</div>
    </div>
  )
}