'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const TIPOS_DOC = ['SC1', 'SCP', 'SDS', 'SDC', 'SCM', 'SDV'];
const LETRAS    = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

const defaultRiesgo = () => ({ descripcion: '', mitigacion: '', asignacion: 'Contratante' });
const defaultFirma  = () => ({ nombre: '', cargo: '', fecha: '' });

const defaultGrupoProducto = (productoNombre = '') => ({
  productoNombre,
  cotizantes: [
    { nombre: '', valor: '' },
    { nombre: '', valor: '' },
    { nombre: '', valor: '' },
  ],
});

const now = new Date();
const HOY = {
  dd:   String(now.getDate()).padStart(2, '0'),
  mm:   String(now.getMonth() + 1).padStart(2, '0'),
  aaaa: String(now.getFullYear()),
};

// ─── PRIMITIVAS UI (desde adquisiciones/[id]) ──────────────────────────────────
function FieldLabel({ children, style: extra }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4, ...extra }}>
      {children}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = 'text', rows, style: extra }) {
  const base = {
    width: '100%', boxSizing: 'border-box',
    border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, color: '#1e293b',
    background: '#fff', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color .15s',
    ...extra,
  };
  if (rows) return (
    <textarea rows={rows} style={{ ...base, resize: 'vertical' }}
      value={value ?? ''} placeholder={placeholder}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      onChange={e => onChange(e.target.value)} />
  );
  return (
    <input type={type} style={base} value={value ?? ''} placeholder={placeholder}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      onChange={e => onChange(e.target.value)} />
  );
}

function FieldWrap({ label, children, span2 }) {
  return (
    <div style={span2 ? { gridColumn: 'span 2' } : {}}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function EditGrid({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px 16px' }}>
      {children}
    </div>
  );
}

function Chips({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(op => {
        const active = value === op;
        return (
          <button
            key={op}
            type="button"
            onClick={() => onChange(op)}
            style={{
              padding: '7px 22px',
              border: `1px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
              borderRadius: 8,
              background: active ? '#3b82f6' : '#fff',
              color: active ? '#fff' : '#64748b',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'all .15s',
            }}
          >{op}</button>
        );
      })}
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
function SectionCard({ n, title, children, accent = '#3b82f6' }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    }}>
      {/* header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid #f1f5f9',
        background: '#fafbfc',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {n && (
            <span style={{
              width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, background: '#e2e8f0', color: '#64748b',
              flexShrink: 0,
            }}>{n}</span>
          )}
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        </div>
      </div>
      {/* body */}
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function NuevaSolicitudPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fecha: HOY,
    tipoDocumento: '',
    tipoDocumentoOtro: '',
    solicitante: '',
    ccNit: '',
    telCel: '',
    ext: '',
    email: '',
    descripcionNecesidad: '',
    pertinencia: '',
    descripcionObjeto: '',
    especificaciones: '',
    requierePermisos: '',
    obligaciones: ['', '', ''],
    modalidad: '',
    justificacionModalidad: '',
    gruposCotizantes: [defaultGrupoProducto()],
    valorEstimado: '',
    formaPago: '',
    detallePago: '',
    criterioMenorPrecio: true,
    criterioOtro: '',
    contratistaNombre: '',
    contratistaCcNit: '',
    contratistaEmail: '',
    contratistaCiudad: '',
    contratistaTelefono: '',
    riesgos: [defaultRiesgo(), defaultRiesgo()],
    plazo: '',
    comiteEvaluador: ['', '', ''],
    elaboradoPor: defaultFirma(),
    responsableContratacion: defaultFirma(),
  });

  const [step,    setStep]    = useState(1);
  const [pdfUrl,  setPdfUrl]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [saved,   setSaved]   = useState(false);

  // ── helpers generales ─────────────────────────────────────────────────────
  const set       = (f, v)        => setForm(p => ({ ...p, [f]: v }));
  const setNested = (f, k, v)     => setForm(p => ({ ...p, [f]: { ...p[f], [k]: v } }));
  const setArr    = (f, i, v)     => setForm(p => { const a = [...p[f]]; a[i] = v; return { ...p, [f]: a }; });
  const setArrN   = (f, i, k, v) => setForm(p => { const a = [...p[f]]; a[i] = { ...a[i], [k]: v }; return { ...p, [f]: a }; });

  // ── helpers de gruposCotizantes ───────────────────────────────────────────
  const setGrupoProductoNombre = (gi, nombre) =>
    setForm(p => {
      const grupos = [...p.gruposCotizantes];
      grupos[gi] = { ...grupos[gi], productoNombre: nombre };
      return { ...p, gruposCotizantes: grupos };
    });

  const setGrupoCotizante = (gi, ci, key, value) =>
    setForm(p => {
      const grupos = [...p.gruposCotizantes];
      const cotizantes = [...grupos[gi].cotizantes];
      cotizantes[ci] = { ...cotizantes[ci], [key]: value };
      grupos[gi] = { ...grupos[gi], cotizantes };
      return { ...p, gruposCotizantes: grupos };
    });

  const addCotizanteAGrupo = (gi) =>
    setForm(p => {
      const grupos = [...p.gruposCotizantes];
      grupos[gi] = {
        ...grupos[gi],
        cotizantes: [...grupos[gi].cotizantes, { nombre: '', valor: '' }],
      };
      return { ...p, gruposCotizantes: grupos };
    });

  const removeCotizanteDeGrupo = (gi, ci) =>
    setForm(p => {
      const grupos = [...p.gruposCotizantes];
      const cotizantes = grupos[gi].cotizantes.filter((_, i) => i !== ci);
      grupos[gi] = { ...grupos[gi], cotizantes: cotizantes.length ? cotizantes : [{ nombre: '', valor: '' }] };
      return { ...p, gruposCotizantes: grupos };
    });

  const addGrupoProducto = () =>
    setForm(p => ({
      ...p,
      gruposCotizantes: [...p.gruposCotizantes, defaultGrupoProducto()],
    }));

  const removeGrupoProducto = (gi) =>
    setForm(p => ({
      ...p,
      gruposCotizantes: p.gruposCotizantes.length > 1
        ? p.gruposCotizantes.filter((_, i) => i !== gi)
        : p.gruposCotizantes,
    }));

  const flattenCotizantes = () =>
    form.gruposCotizantes.flatMap(grupo =>
      grupo.cotizantes.map(c => ({
        productoNombre: grupo.productoNombre,
        nombre:         c.nombre,
        valor:          c.valor,
      }))
    );

  const addObligacion = () => form.obligaciones.length < 7 && set('obligaciones', [...form.obligaciones, '']);
  const addRiesgo     = () => form.riesgos.length < 4      && set('riesgos', [...form.riesgos, defaultRiesgo()]);

  // ── acciones ──────────────────────────────────────────────────────────────
  const buildPayload = () => ({
    ...form,
    cotizantes: flattenCotizantes(),
    gruposCotizantes: undefined,
  });

  const handlePreview = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/solicitudes/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error('Error al generar el PDF');
      setPdfUrl(URL.createObjectURL(await res.blob()));
      setStep(2);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `solicitud-${Date.now()}.pdf`;
    a.click();
  };

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/admin/solicitudes/adquisicion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error('Error al guardar la solicitud');
      setSaved(true);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  // ── PREVIEW ───────────────────────────────────────────────────────────────
  if (step === 2) return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, fontFamily: 'inherit' }}>

      {/* Top bar */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => setStep(1)} style={{
          fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12, fontFamily: 'inherit', padding: 0,
        }}>
          ← Volver al formulario
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Vista Previa — Solicitud de Adquisición
            </h1>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>DUBOIS · Grupo Logístico</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {saved ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, padding: '8px 18px', border: '1px solid #86efac', borderRadius: 9,
                color: '#166534', background: '#f0fdf4', fontWeight: 600,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Guardado
              </span>
            ) : (
              <button onClick={handleSave} disabled={saving} style={{
                fontSize: 13, padding: '8px 22px', border: 'none', borderRadius: 9,
                background: '#0a1628', color: '#fff', cursor: 'pointer', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
                opacity: saving ? .7 : 1,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                {saving ? 'Guardando…' : 'Guardar en BD'}
              </button>
            )}
            <button onClick={handleDownload} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 9,
              color: '#475569', background: '#fff', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '12px 18px', marginBottom: 24, fontSize: 13, color: '#991b1b',
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
        overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)',
      }}>
        <iframe src={pdfUrl} title="Vista previa PDF" style={{ width: '100%', height: '80vh', border: 'none' }} />
      </div>
    </div>
  );

  // ── FORMULARIO ────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, fontFamily: 'inherit' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin/solicitudes" style={{
          fontSize: 12, color: '#94a3b8', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12,
        }}>
          ← Solicitudes de Adquisición
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Nueva Solicitud de Adquisición
            </h1>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>DUBOIS · Grupo Logístico</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button type="button" onClick={() => router.back()} style={{
              fontSize: 13, padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 9,
              color: '#475569', background: '#fff', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
            }}>
              Cancelar
            </button>
            <button type="button" onClick={handlePreview} disabled={loading} style={{
              fontSize: 13, padding: '8px 22px', border: 'none', borderRadius: 9,
              background: '#0a1628', color: '#fff', cursor: 'pointer', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
              opacity: loading ? .7 : 1,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              {loading ? 'Generando…' : 'Vista Previa del PDF'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '12px 18px', marginBottom: 24, fontSize: 13, color: '#991b1b',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* ── FORM SECTIONS ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 1. INFORMACIÓN GENERAL */}
        <SectionCard n="1" title="Información General">
          <EditGrid>
            <FieldWrap label="Solicitante">
              <Inp value={form.solicitante} onChange={v => set('solicitante', v)} placeholder="Nombre del solicitante" />
            </FieldWrap>
            <FieldWrap label="C.C. / NIT">
              <Inp value={form.ccNit} onChange={v => set('ccNit', v)} placeholder="Número de documento" />
            </FieldWrap>
            <FieldWrap label="Tel / Cel">
              <Inp value={form.telCel} onChange={v => set('telCel', v)} placeholder="Teléfono" />
            </FieldWrap>
            <FieldWrap label="Ext.">
              <Inp value={form.ext} onChange={v => set('ext', v)} placeholder="Ext." />
            </FieldWrap>
            <FieldWrap label="E-mail">
              <Inp value={form.email} onChange={v => set('email', v)} type="email" placeholder="correo@ejemplo.com" />
            </FieldWrap>
            <FieldWrap label="Fecha de la Solicitud">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Inp value={form.fecha.dd} style={{ width: 52, textAlign: 'center' }} />
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>/</span>
                <Inp value={form.fecha.mm} style={{ width: 52, textAlign: 'center' }} />
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>/</span>
                <Inp value={form.fecha.aaaa} style={{ width: 72, textAlign: 'center' }} />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Fecha actual (automática)</div>
            </FieldWrap>
          </EditGrid>
          <div style={{ marginTop: 14 }}>
            <FieldWrap label="Tipo de Documento">
              <Chips
                options={[...TIPOS_DOC, 'Otro']}
                value={form.tipoDocumento === 'otro' ? 'Otro' : form.tipoDocumento}
                onChange={v => set('tipoDocumento', v === 'Otro' ? 'otro' : v)}
              />
              {form.tipoDocumento === 'otro' && (
                <div style={{ marginTop: 10 }}>
                  <Inp value={form.tipoDocumentoOtro} onChange={v => set('tipoDocumentoOtro', v)} placeholder="Especifique el tipo de documento…" />
                </div>
              )}
            </FieldWrap>
          </div>
        </SectionCard>

        {/* 2. JUSTIFICACIÓN */}
        <SectionCard n="2" title="Justificación">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldWrap label="2.1 Descripción de la Necesidad">
              <Inp rows={4} value={form.descripcionNecesidad} onChange={v => set('descripcionNecesidad', v)} placeholder="Describa la necesidad de la adquisición…" />
            </FieldWrap>
            <FieldWrap label="2.2 Pertinencia de la Adquisición">
              <Inp rows={3} value={form.pertinencia} onChange={v => set('pertinencia', v)} placeholder="Explique por qué es pertinente esta adquisición…" />
            </FieldWrap>
          </div>
        </SectionCard>

        {/* 3. OBJETO DE LA ADQUISICIÓN */}
        <SectionCard n="3" title="Objeto de la Adquisición">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldWrap label="Descripción del Objeto / Bien / Servicio">
              <Inp rows={3} value={form.descripcionObjeto} onChange={v => set('descripcionObjeto', v)} placeholder="Describa el objeto, bien o servicio a adquirir…" />
            </FieldWrap>
            <FieldWrap label="3.1 Especificaciones">
              <Inp rows={3} value={form.especificaciones} onChange={v => set('especificaciones', v)} placeholder="Especificaciones técnicas, dimensiones, materiales…" />
            </FieldWrap>
            <div>
              <FieldLabel>3.2 ¿Requiere permisos, autorizaciones o licencias?</FieldLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                {['SI', 'NO'].map(op => (
                  <button key={op} type="button" onClick={() => set('requierePermisos', op)} style={{
                    padding: '7px 22px',
                    border: `1px solid ${form.requierePermisos === op ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: 8,
                    background: form.requierePermisos === op ? '#3b82f6' : '#fff',
                    color: form.requierePermisos === op ? '#fff' : '#64748b',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                  }}>{op}</button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 4. OBLIGACIONES DEL CONTRATISTA */}
        <SectionCard n="4" title="Obligaciones del Contratista">
          <div>
            {form.obligaciones.map((ob, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 700, width: 22, flexShrink: 0 }}>{LETRAS[i]})</span>
                <Inp value={ob} placeholder={`Obligación ${LETRAS[i]})…`}
                  onChange={v => setArr('obligaciones', i, v)} />
                {form.obligaciones.length > 1 && (
                  <button type="button" onClick={() => set('obligaciones', form.obligaciones.filter((_, j) => j !== i))}
                    style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, flexShrink: 0, lineHeight: 1 }}>✕</button>
                )}
              </div>
            ))}
            {form.obligaciones.length < 7 && (
              <button type="button" onClick={addObligacion}
                style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: 4, fontFamily: 'inherit' }}>
                + Agregar obligación
              </button>
            )}
          </div>
        </SectionCard>

        {/* 5. MODALIDAD DE SELECCIÓN */}
        <SectionCard n="5" title="Modalidad de Selección">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <FieldLabel>Modalidad</FieldLabel>
              <Chips
                options={['Contratación Directa', 'Convocatoria Pública']}
                value={form.modalidad === 'directa' ? 'Contratación Directa' : form.modalidad === 'publica' ? 'Convocatoria Pública' : ''}
                onChange={v => set('modalidad', v === 'Contratación Directa' ? 'directa' : 'publica')}
              />
            </div>
            <FieldWrap label="Justificación">
              <Inp rows={3} value={form.justificacionModalidad} onChange={v => set('justificacionModalidad', v)} placeholder="Justifique la modalidad seleccionada…" />
            </FieldWrap>
          </div>
        </SectionCard>

        {/* 6. ESTUDIO DE MERCADO */}
        <SectionCard n="6" title="Estudio de Mercado" accent="#0a1628">
          <div>
            {form.gruposCotizantes.map((grupo, gi) => (
              <div key={gi} style={{ border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
                {/* cabecera grupo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                  <input value={grupo.productoNombre} placeholder="Nombre del producto / ítem…"
                    onChange={e => setGrupoProductoNombre(gi, e.target.value)}
                    style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 11px', fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: 'inherit', outline: 'none' }}
                  />
                  {form.gruposCotizantes.length > 1 && (
                    <button type="button" onClick={() => removeGrupoProducto(gi)}
                      style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1 }}>✕</button>
                  )}
                </div>
                {/* filas cotizantes */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 36px', gap: '6px 10px', marginBottom: 8 }}>
                    <FieldLabel>Proveedor / Cotizante</FieldLabel>
                    <FieldLabel>Valor</FieldLabel>
                    <span />
                  </div>
                  {grupo.cotizantes.map((c, ci) => (
                    <div key={ci} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 36px', gap: '6px 10px', marginBottom: 8, alignItems: 'center' }}>
                      <Inp value={c.nombre} placeholder="Nombre del proveedor" onChange={v => setGrupoCotizante(gi, ci, 'nombre', v)} />
                      <Inp value={c.valor} placeholder="0.00" onChange={v => setGrupoCotizante(gi, ci, 'valor', v)} />
                      {grupo.cotizantes.length > 1 && (
                        <button type="button" onClick={() => removeCotizanteDeGrupo(gi, ci)}
                          style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1, padding: 0 }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addCotizanteAGrupo(gi)}
                    style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit' }}>
                    + Agregar cotizante
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addGrupoProducto} style={{
              width: '100%', padding: '10px', fontSize: 13, color: '#3b82f6',
              background: '#eff6ff', border: '1px dashed #93c5fd', borderRadius: 9,
              cursor: 'pointer', marginBottom: 16, fontWeight: 500, fontFamily: 'inherit',
            }}>+ Agregar producto</button>
          </div>
        </SectionCard>

        {/* 7. VALOR ESTIMADO */}
        <SectionCard n="7" title="Valor Estimado del Contrato">
          <div style={{ maxWidth: 300 }}>
            <FieldWrap label="Valor Estimado">
              <Inp value={form.valorEstimado} onChange={v => set('valorEstimado', v)} placeholder="$ 0.00" />
            </FieldWrap>
          </div>
        </SectionCard>

        {/* 8. FORMA DE PAGO */}
        <SectionCard n="8" title="Forma de Pago">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <FieldLabel>Modalidad de Pago</FieldLabel>
              <Chips
                options={['Pago Único', 'Pagos Parciales']}
                value={form.formaPago === 'unico' ? 'Pago Único' : form.formaPago === 'parciales' ? 'Pagos Parciales' : ''}
                onChange={v => set('formaPago', v === 'Pago Único' ? 'unico' : 'parciales')}
              />
            </div>
            <FieldWrap label="Detalle / Justificación">
              <Inp rows={2} value={form.detallePago} onChange={v => set('detallePago', v)} placeholder="Detalle de la forma de pago…" />
            </FieldWrap>
          </div>
        </SectionCard>

        {/* 9. CRITERIOS */}
        <SectionCard n="9" title="Criterios para Seleccionar la Oferta">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <FieldLabel>Criterio Principal</FieldLabel>
              <Chips
                options={['Menor Precio', 'Otro']}
                value={form.criterioMenorPrecio ? 'Menor Precio' : 'Otro'}
                onChange={v => set('criterioMenorPrecio', v === 'Menor Precio')}
              />
            </div>
            {!form.criterioMenorPrecio && (
              <div style={{ maxWidth: 400 }}>
                <FieldWrap label="¿Cuál?">
                  <Inp value={form.criterioOtro} onChange={v => set('criterioOtro', v)} placeholder="Especifique el criterio…" />
                </FieldWrap>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 10. CONTRATISTA (solo directa) */}
        {form.modalidad === 'directa' && (
          <SectionCard n="10" title="Contratista" accent="#8b5cf6">
            <EditGrid>
              <FieldWrap label="Nombre o Razón Social">
                <Inp value={form.contratistaNombre} onChange={v => set('contratistaNombre', v)} placeholder="Nombre del contratista" />
              </FieldWrap>
              <FieldWrap label="C.C. o NIT">
                <Inp value={form.contratistaCcNit} onChange={v => set('contratistaCcNit', v)} placeholder="Documento" />
              </FieldWrap>
              <FieldWrap label="E-mail">
                <Inp value={form.contratistaEmail} onChange={v => set('contratistaEmail', v)} type="email" placeholder="correo@ejemplo.com" />
              </FieldWrap>
              <FieldWrap label="Ciudad">
                <Inp value={form.contratistaCiudad} onChange={v => set('contratistaCiudad', v)} placeholder="Ciudad" />
              </FieldWrap>
              <FieldWrap label="Teléfono">
                <Inp value={form.contratistaTelefono} onChange={v => set('contratistaTelefono', v)} placeholder="Teléfono" />
              </FieldWrap>
            </EditGrid>
          </SectionCard>
        )}

        {/* 11. ANÁLISIS DEL RIESGO */}
        <SectionCard n="11" title="Análisis del Riesgo" accent="#d97706">
          <div>
            {form.riesgos.map((r, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '.06em' }}>Riesgo {i + 1}</span>
                  {form.riesgos.length > 1 && (
                    <button type="button" onClick={() => set('riesgos', form.riesgos.filter((_, j) => j !== i))}
                      style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1 }}>✕</button>
                  )}
                </div>
                <EditGrid>
                  <FieldWrap label="Descripción">
                    <Inp value={r.descripcion} onChange={v => setArrN('riesgos', i, 'descripcion', v)} placeholder="Describa el riesgo…" />
                  </FieldWrap>
                  <FieldWrap label="Mitigación">
                    <Inp value={r.mitigacion} onChange={v => setArrN('riesgos', i, 'mitigacion', v)} placeholder="Estrategia de mitigación…" />
                  </FieldWrap>
                </EditGrid>
                <div style={{ marginTop: 10 }}>
                  <FieldLabel>Asignación</FieldLabel>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {['Contratante', 'Contratista'].map(op => (
                      <button key={op} type="button"
                        onClick={() => setArrN('riesgos', i, 'asignacion', op)}
                        style={{
                          padding: '6px 16px',
                          border: `1px solid ${r.asignacion === op ? '#d97706' : '#e2e8f0'}`,
                          borderRadius: 7,
                          background: r.asignacion === op ? '#d97706' : '#fff',
                          color: r.asignacion === op ? '#fff' : '#64748b',
                          cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                        }}>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {form.riesgos.length < 4 && (
              <button type="button" onClick={addRiesgo}
                style={{ fontSize: 12, color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit' }}>
                + Agregar riesgo
              </button>
            )}
          </div>
        </SectionCard>

        {/* 12. PLAZO */}
        <SectionCard n="12" title="Plazo de Ejecución">
          <div style={{ maxWidth: 320 }}>
            <FieldWrap label="Plazo de Ejecución">
              <Inp value={form.plazo} onChange={v => set('plazo', v)} placeholder="Ej: 3 meses / 90 días" />
            </FieldWrap>
          </div>
        </SectionCard>

        {/* 13. COMITÉ EVALUADOR (solo pública) */}
        {form.modalidad === 'publica' && (
          <SectionCard n="13" title="Comité Evaluador" accent="#10b981">
            <div>
              {form.comiteEvaluador.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700, width: 22, flexShrink: 0 }}>{LETRAS[i]})</span>
                  <Inp value={m} placeholder={`Miembro ${i + 1}…`}
                    onChange={v => setArr('comiteEvaluador', i, v)} />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* 14. FIRMAS Y APROBACIONES */}
        <SectionCard n="14" title="Firmas y Aprobaciones">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Elaborado por */}
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Quien Elabora la Solicitud</div>
              <div style={{ marginBottom: 8 }}>
                <FieldWrap label="Nombre">
                  <Inp value={form.elaboradoPor.nombre} onChange={v => setNested('elaboradoPor', 'nombre', v)} placeholder="Nombre" />
                </FieldWrap>
              </div>
              <div style={{ marginBottom: 8 }}>
                <FieldWrap label="Cargo">
                  <Inp value={form.elaboradoPor.cargo} onChange={v => setNested('elaboradoPor', 'cargo', v)} placeholder="Cargo" />
                </FieldWrap>
              </div>
              <FieldWrap label="Fecha">
                <Inp value={form.elaboradoPor.fecha} onChange={v => setNested('elaboradoPor', 'fecha', v)} type="date" />
              </FieldWrap>
            </div>
            {/* Contratante */}
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Contratante</div>
              <div style={{ marginBottom: 8 }}>
                <FieldWrap label="Nombre">
                  <Inp value={form.responsableContratacion.nombre} onChange={v => setNested('responsableContratacion', 'nombre', v)} placeholder="Nombre" />
                </FieldWrap>
              </div>
              <div style={{ marginBottom: 8 }}>
                <FieldWrap label="Cargo">
                  <Inp value={form.responsableContratacion.cargo} onChange={v => setNested('responsableContratacion', 'cargo', v)} placeholder="Cargo" />
                </FieldWrap>
              </div>
              <FieldWrap label="Fecha">
                <Inp value={form.responsableContratacion.fecha} onChange={v => setNested('responsableContratacion', 'fecha', v)} type="date" />
              </FieldWrap>
            </div>
          </div>
        </SectionCard>

      </div>{/* fin form sections */}

    </div>
  );
}
