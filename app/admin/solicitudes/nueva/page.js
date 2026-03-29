'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const TIPOS_DOC = ['SC1', 'SCP', 'SDS', 'SDC', 'SCM', 'SDV'];
const LETRAS    = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

const defaultRiesgo    = () => ({ descripcion: '', mitigacion: '', asignacion: 'Contratante' });
const defaultCotizante = () => ({ nombre: '', valor: '' });
const defaultFirma     = () => ({ nombre: '', cargo: '', fecha: '' });

// Fecha actual
const now  = new Date();
const HOY  = {
  dd:   String(now.getDate()).padStart(2, '0'),
  mm:   String(now.getMonth() + 1).padStart(2, '0'),
  aaaa: String(now.getFullYear()),
};

// ─── SUB-COMPONENTES (FUERA del componente principal — fix del bug de foco) ──
function SectionTitle({ n, title }) {
  return (
    <div className="sol-section-header">
      <span className="sol-section-badge">{n}</span>
      <h2 className="sol-section-title">{title}</h2>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="sol-field">
      <label className="sol-label">
        {label}{required && <span className="sol-req"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Chips({ options, value, onChange }) {
  return (
    <div className="sol-chip-group">
      {options.map(op => (
        <button
          key={op}
          type="button"
          className={`sol-chip${value === op ? ' sol-chip-active' : ''}`}
          onClick={() => onChange(op)}
        >
          {op}
        </button>
      ))}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function NuevaSolicitudPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fecha: HOY,                    // ← fecha de hoy precargada
    tipoDocumento: '',
    tipoDocumentoOtro: '',
    solicitante: '',
    ccNit: '',
    telCel: '',
    ext: '',
    email: '',
    centroGastos: '',
    descripcionNecesidad: '',
    pertinencia: '',
    descripcionObjeto: '',
    especificaciones: '',
    requierePermisos: '',
    obligaciones: ['', '', ''],
    modalidad: '',
    justificacionModalidad: '',
    cotizantes: [defaultCotizante(), defaultCotizante(), defaultCotizante()],
    valorEstimado: '',
    cdpNo: '',
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
    supervisorNombre: '',
    supervisorCorreo: '',
    supervisorCelular: '',
    supervisorCargo: '',
    elaboradoPor: defaultFirma(),
    ordenadorGasto: defaultFirma(),
    responsableContratacion: defaultFirma(),
  });

  const [step,    setStep]    = useState(1);
  const [pdfUrl,  setPdfUrl]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [saved,   setSaved]   = useState(false);

  // ── helpers ───────────────────────────────────────────────────────────────
  const set       = (f, v)        => setForm(p => ({ ...p, [f]: v }));
  const setNested = (f, k, v)     => setForm(p => ({ ...p, [f]: { ...p[f], [k]: v } }));
  const setArr    = (f, i, v)     => setForm(p => { const a = [...p[f]]; a[i] = v; return { ...p, [f]: a }; });
  const setArrN   = (f, i, k, v) => setForm(p => { const a = [...p[f]]; a[i] = { ...a[i], [k]: v }; return { ...p, [f]: a }; });

  const addObligacion = () => form.obligaciones.length < 7 && set('obligaciones', [...form.obligaciones, '']);
  const addRiesgo     = () => form.riesgos.length < 4      && set('riesgos', [...form.riesgos, defaultRiesgo()]);

  // ── acciones ──────────────────────────────────────────────────────────────
  const handlePreview = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/solicitudes/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      const res = await fetch('/api/admin/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error al guardar la solicitud');
      setSaved(true);
    } catch (e) { setError(e.message); }
    finally     { setSaving(false); }
  };

  // ── PREVIEW ───────────────────────────────────────────────────────────────
  if (step === 2) return (
    <div className="sol-preview-page">
      <div className="sol-preview-toolbar">
        <div className="sol-preview-left">
          <button className="sol-btn-back" onClick={() => setStep(1)}>← Editar</button>
          <span className="mono-sm">Vista previa — Solicitud de Adquisición</span>
        </div>
        <div className="sol-preview-actions">
          {saved
            ? <span className="sol-saved-badge">✓ Guardado</span>
            : <button className="sol-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar en DB'}
              </button>
          }
          <button className="sol-btn-download" onClick={handleDownload}>↓ Descargar PDF</button>
        </div>
      </div>
      {error && <div className="sol-error">{error}</div>}
      <iframe className="sol-pdf-frame" src={pdfUrl} title="Vista previa PDF" />
    </div>
  );

  // ── FORMULARIO ────────────────────────────────────────────────────────────
  return (
    <div className="main-content">

      <div className="section-title-row" style={{ marginBottom: 28 }}>
        <span className="section-title-text">Nueva Solicitud de Adquisición</span>
        <span className="mono-sm">DUBOIS · Grupo Logístico</span>
      </div>

      <div className="sol-form">

        {/* ── 1. INFORMACIÓN GENERAL ── */}
        <div className="sol-section">
          <SectionTitle n="1" title="Información General" />

          <div className="sol-grid-3">
            <Field label="Fecha de la Solicitud">
              <div className="sol-date-row">
                <input
                  className="sol-input sol-input-xs"
                  value={form.fecha.dd}
                  readOnly
                />
                <span className="sol-date-sep">/</span>
                <input
                  className="sol-input sol-input-xs"
                  value={form.fecha.mm}
                  readOnly
                />
                <span className="sol-date-sep">/</span>
                <input
                  className="sol-input sol-input-sm"
                  value={form.fecha.aaaa}
                  readOnly
                />
              </div>
              <span className="sol-date-hint">Fecha actual (automática)</span>
            </Field>

            <div style={{ gridColumn: 'span 2' }}>
              <Field label="Tipo de Documento">
                <Chips
                  options={[...TIPOS_DOC, 'Otro']}
                  value={form.tipoDocumento === 'otro' ? 'Otro' : form.tipoDocumento}
                  onChange={v => set('tipoDocumento', v === 'Otro' ? 'otro' : v)}
                />
                {form.tipoDocumento === 'otro' && (
                  <input
                    className="sol-input"
                    style={{ marginTop: 8 }}
                    placeholder="Especifique..."
                    value={form.tipoDocumentoOtro}
                    onChange={e => set('tipoDocumentoOtro', e.target.value)}
                  />
                )}
              </Field>
            </div>
          </div>

          <div className="sol-grid-2">
            <Field label="Solicitante" required>
              <input className="sol-input" value={form.solicitante} onChange={e => set('solicitante', e.target.value)} />
            </Field>
            <Field label="C.C. / NIT" required>
              <input className="sol-input" value={form.ccNit} onChange={e => set('ccNit', e.target.value)} />
            </Field>
          </div>

          <div className="sol-grid-4">
            <Field label="Tel / Cel">
              <input className="sol-input" value={form.telCel} onChange={e => set('telCel', e.target.value)} />
            </Field>
            <Field label="Ext.">
              <input className="sol-input" value={form.ext} onChange={e => set('ext', e.target.value)} />
            </Field>
            <Field label="E-mail" required>
              <input className="sol-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </Field>
            <Field label="Centro de Gastos">
              <input className="sol-input" value={form.centroGastos} onChange={e => set('centroGastos', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* ── 2. JUSTIFICACIÓN ── */}
        <div className="sol-section">
          <SectionTitle n="2" title="Justificación" />
          <Field label="2.1 Descripción de la Necesidad" required>
            <textarea className="sol-textarea" rows={4}
              value={form.descripcionNecesidad} onChange={e => set('descripcionNecesidad', e.target.value)} />
          </Field>
          <Field label="2.2 Pertinencia de la Adquisición">
            <textarea className="sol-textarea" rows={3}
              value={form.pertinencia} onChange={e => set('pertinencia', e.target.value)} />
          </Field>
        </div>

        {/* ── 3. OBJETO ── */}
        <div className="sol-section">
          <SectionTitle n="3" title="Objeto de la Adquisición" />
          <Field label="Descripción del Objeto / Bien / Servicio" required>
            <textarea className="sol-textarea" rows={3}
              value={form.descripcionObjeto} onChange={e => set('descripcionObjeto', e.target.value)} />
          </Field>
          <Field label="3.1 Especificaciones">
            <textarea className="sol-textarea" rows={3}
              value={form.especificaciones} onChange={e => set('especificaciones', e.target.value)} />
          </Field>
          <Field label="3.2 ¿Requiere permisos, autorizaciones o licencias?">
            <Chips options={['SI', 'NO']} value={form.requierePermisos} onChange={v => set('requierePermisos', v)} />
          </Field>
        </div>

        {/* ── 4. OBLIGACIONES ── */}
        <div className="sol-section">
          <SectionTitle n="4" title="Obligaciones del Contratista" />
          {form.obligaciones.map((ob, i) => (
            <div key={i} className="sol-item-row">
              <span className="sol-item-badge">{LETRAS[i]}</span>
              <input
                className="sol-input"
                placeholder={`Obligación ${LETRAS[i]}...`}
                value={ob}
                onChange={e => setArr('obligaciones', i, e.target.value)}
              />
            </div>
          ))}
          {form.obligaciones.length < 7 && (
            <button type="button" className="sol-btn-add" onClick={addObligacion}>+ Agregar obligación</button>
          )}
        </div>

        {/* ── 5. MODALIDAD ── */}
        <div className="sol-section">
          <SectionTitle n="5" title="Modalidad de Selección" />
          <Field label="Modalidad" required>
            <Chips
              options={['Contratación Directa', 'Convocatoria Pública']}
              value={form.modalidad === 'directa' ? 'Contratación Directa' : form.modalidad === 'publica' ? 'Convocatoria Pública' : ''}
              onChange={v => set('modalidad', v === 'Contratación Directa' ? 'directa' : 'publica')}
            />
          </Field>
          <Field label="Justificación" required>
            <textarea className="sol-textarea" rows={3}
              value={form.justificacionModalidad} onChange={e => set('justificacionModalidad', e.target.value)} />
          </Field>
        </div>

        {/* ── 6. ESTUDIO DE MERCADO ── */}
        <div className="sol-section">
          <SectionTitle n="6" title="Estudio de Mercado" />
          <div className="sol-table">
            <div className="sol-table-head">
              <span className="sol-col-num">#</span>
              <span className="sol-col-prov">Cotizante / Proveedor</span>
              <span className="sol-col-val">Valor ($)</span>
            </div>
            {form.cotizantes.map((c, i) => (
              <div key={i} className={`sol-table-row${i % 2 === 1 ? ' sol-table-row-alt' : ''}`}>
                <span className="sol-col-num mono-sm">{i + 1}</span>
                <input
                  className="sol-input sol-col-prov"
                  placeholder="Nombre del proveedor"
                  value={c.nombre}
                  onChange={e => setArrN('cotizantes', i, 'nombre', e.target.value)}
                />
                <input
                  className="sol-input sol-col-val"
                  placeholder="0"
                  value={c.valor}
                  onChange={e => setArrN('cotizantes', i, 'valor', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. VALOR ESTIMADO ── */}
        <div className="sol-section">
          <SectionTitle n="7" title="Valor Estimado del Contrato" />
          <div className="sol-grid-2">
            <Field label="Valor Estimado" required>
              <input className="sol-input" placeholder="$" value={form.valorEstimado} onChange={e => set('valorEstimado', e.target.value)} />
            </Field>
            <Field label="CDP No.">
              <input className="sol-input" value={form.cdpNo} onChange={e => set('cdpNo', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* ── 8. FORMA DE PAGO ── */}
        <div className="sol-section">
          <SectionTitle n="8" title="Forma de Pago" />
          <Field label="Modalidad de Pago">
            <Chips
              options={['Pago Único', 'Pagos Parciales']}
              value={form.formaPago === 'unico' ? 'Pago Único' : form.formaPago === 'parciales' ? 'Pagos Parciales' : ''}
              onChange={v => set('formaPago', v === 'Pago Único' ? 'unico' : 'parciales')}
            />
          </Field>
          <Field label="Detalle / Justificación">
            <textarea className="sol-textarea" rows={2}
              value={form.detallePago} onChange={e => set('detallePago', e.target.value)} />
          </Field>
        </div>

        {/* ── 9. CRITERIOS ── */}
        <div className="sol-section">
          <SectionTitle n="9" title="Criterios para Seleccionar la Oferta" />
          <Field label="Criterio Principal">
            <Chips
              options={['Menor Precio', 'Otro']}
              value={form.criterioMenorPrecio ? 'Menor Precio' : 'Otro'}
              onChange={v => set('criterioMenorPrecio', v === 'Menor Precio')}
            />
          </Field>
          {!form.criterioMenorPrecio && (
            <Field label="¿Cuál?">
              <input className="sol-input" value={form.criterioOtro} onChange={e => set('criterioOtro', e.target.value)} />
            </Field>
          )}
        </div>

        {/* ── 10. CONTRATISTA (solo directa) ── */}
        {form.modalidad === 'directa' && (
          <div className="sol-section">
            <SectionTitle n="10" title="Contratista" />
            <div className="sol-grid-2">
              <Field label="Nombre o Razón Social">
                <input className="sol-input" value={form.contratistaNombre} onChange={e => set('contratistaNombre', e.target.value)} />
              </Field>
              <Field label="C.C. o NIT">
                <input className="sol-input" value={form.contratistaCcNit} onChange={e => set('contratistaCcNit', e.target.value)} />
              </Field>
            </div>
            <div className="sol-grid-3">
              <Field label="E-mail">
                <input className="sol-input" type="email" value={form.contratistaEmail} onChange={e => set('contratistaEmail', e.target.value)} />
              </Field>
              <Field label="Ciudad">
                <input className="sol-input" value={form.contratistaCiudad} onChange={e => set('contratistaCiudad', e.target.value)} />
              </Field>
              <Field label="Teléfono">
                <input className="sol-input" value={form.contratistaTelefono} onChange={e => set('contratistaTelefono', e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {/* ── 11. RIESGOS ── */}
        <div className="sol-section">
          <SectionTitle n="11" title="Análisis del Riesgo" />
          <div className="sol-table">
            <div className="sol-table-head">
              <span className="sol-col-r1">Riesgo</span>
              <span className="sol-col-r2">Descripción</span>
              <span className="sol-col-r3">Mitigación</span>
              <span className="sol-col-r4">Asignación</span>
            </div>
            {form.riesgos.map((r, i) => (
              <div key={i} className={`sol-table-row${i % 2 === 1 ? ' sol-table-row-alt' : ''}`}>
                <span className="sol-col-r1 mono-sm">Riesgo {i + 1}</span>
                <input className="sol-input sol-col-r2" placeholder="Descripción..."
                  value={r.descripcion} onChange={e => setArrN('riesgos', i, 'descripcion', e.target.value)} />
                <input className="sol-input sol-col-r3" placeholder="Mitigación..."
                  value={r.mitigacion} onChange={e => setArrN('riesgos', i, 'mitigacion', e.target.value)} />
                <select className="sol-select sol-col-r4" value={r.asignacion}
                  onChange={e => setArrN('riesgos', i, 'asignacion', e.target.value)}>
                  <option value="Contratante">Contratante</option>
                  <option value="Contratista">Contratista</option>
                </select>
              </div>
            ))}
          </div>
          {form.riesgos.length < 4 && (
            <button type="button" className="sol-btn-add" onClick={addRiesgo}>+ Agregar riesgo</button>
          )}
        </div>

        {/* ── 13. PLAZO ── */}
        <div className="sol-section">
          <SectionTitle n="13" title="Plazo" />
          <Field label="Plazo de Ejecución" required>
            <input className="sol-input" placeholder="Ej: 3 meses"
              value={form.plazo} onChange={e => set('plazo', e.target.value)} />
          </Field>
        </div>

        {/* ── 14. COMITÉ (solo pública) ── */}
        {form.modalidad === 'publica' && (
          <div className="sol-section">
            <SectionTitle n="14" title="Comité Evaluador" />
            {form.comiteEvaluador.map((m, i) => (
              <div key={i} className="sol-item-row">
                <span className="sol-item-badge">{LETRAS[i]}</span>
                <input className="sol-input" placeholder={`Miembro ${i + 1}...`}
                  value={m} onChange={e => setArr('comiteEvaluador', i, e.target.value)} />
              </div>
            ))}
          </div>
        )}

        {/* ── 15. SUPERVISOR ── */}
        <div className="sol-section">
          <SectionTitle n="15" title="Supervisor / Interventoría" />
          <div className="sol-grid-2">
            <Field label="Nombre" required>
              <input className="sol-input" value={form.supervisorNombre} onChange={e => set('supervisorNombre', e.target.value)} />
            </Field>
            <Field label="Cargo">
              <input className="sol-input" value={form.supervisorCargo} onChange={e => set('supervisorCargo', e.target.value)} />
            </Field>
          </div>
          <div className="sol-grid-2">
            <Field label="Correo Electrónico">
              <input className="sol-input" type="email" value={form.supervisorCorreo} onChange={e => set('supervisorCorreo', e.target.value)} />
            </Field>
            <Field label="No. Celular">
              <input className="sol-input" value={form.supervisorCelular} onChange={e => set('supervisorCelular', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* ── FIRMAS ── */}
        <div className="sol-section">
          <SectionTitle n="✦" title="Firmas y Aprobaciones" />
          <div className="sol-firmas-grid">
            {[
              { label: 'Quien Elabora la Solicitud', field: 'elaboradoPor' },
              { label: 'Ordenador del Gasto',         field: 'ordenadorGasto' },
              { label: 'Responsable de Contratación', field: 'responsableContratacion' },
            ].map(({ label, field }) => (
              <div key={field} className="sol-firma-card">
                <p className="sol-firma-role">{label}</p>
                <Field label="Nombre">
                  <input className="sol-input" value={form[field].nombre} onChange={e => setNested(field, 'nombre', e.target.value)} />
                </Field>
                <Field label="Cargo">
                  <input className="sol-input" value={form[field].cargo} onChange={e => setNested(field, 'cargo', e.target.value)} />
                </Field>
                <Field label="Fecha">
                  <input className="sol-input" type="date" value={form[field].fecha} onChange={e => setNested(field, 'fecha', e.target.value)} />
                </Field>
              </div>
            ))}
          </div>
        </div>

        {/* ── ERROR & SUBMIT ── */}
        {error && <div className="sol-error">{error}</div>}

        <div className="sol-form-footer">
          <button type="button" className="sol-btn-cancel" onClick={() => router.back()}>Cancelar</button>
          <button type="button" className="sol-btn-preview" onClick={handlePreview} disabled={loading}>
            {loading ? 'Generando...' : '👁 Vista Previa del PDF'}
          </button>
        </div>

      </div>
    </div>
  );
}