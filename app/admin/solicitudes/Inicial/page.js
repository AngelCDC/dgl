'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TIPOS_NECESIDAD = [
  { value: 'materia_prima',     label: 'Materia Prima' },
  { value: 'producto_terminado', label: 'Producto Terminado' },
  { value: 'empaque',           label: 'Empaque' },
  { value: 'repuesto',          label: 'Repuesto' },
  { value: 'equipo',            label: 'Equipo' },
  { value: 'servicio',          label: 'Servicio' },
  { value: 'otro',              label: 'Otro' },
];

const PRIORIDADES = ['alta', 'media', 'baja'];

const now = new Date();
const HOY = {
  dd:   String(now.getDate()).padStart(2, '0'),
  mm:   String(now.getMonth() + 1).padStart(2, '0'),
  aaaa: String(now.getFullYear()),
};

const defaultContacto = () => ({ nombre: '', cargo: '', telefono: '', email: '' });

const defaultProducto = () => ({
  nombreProducto:    '',
  categoria:         '',
  descripcion:       '',   // fusión de descripcionTecnica + características + materiales + notas
  dimensiones:       '',
  empaque:           '',
  marca:             '',
  referenciaModelo:  '',
  paisOrigen:        '',
  tipoNecesidad:     '',
  tipoNecesidadOtro: '',
  frecuenciaRequerida:  '',
  cantidadReferencial:  '',
  prioridad:         '',
});

// ─── Validación ──────────────────────────────────────────────────────────────
function validateForm(form) {
  const errors = [];

  // Sección 1
  if (!form.cliente.razonSocial.trim())
    errors.push('Razón Social del cliente es requerida (Sección 1)');
  if (!form.cliente.ciudad.trim())
    errors.push('Ciudad es requerida (Sección 1)');

  // Sección 2 — al menos un contacto con nombre
  const contactosValidos = form.contactos.filter(c => c.nombre.trim());
  if (contactosValidos.length === 0)
    errors.push('Agrega al menos un contacto con nombre (Sección 2)');

  form.contactos.forEach((c, i) => {
    if (c.nombre.trim() && c.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))
      errors.push(`Email inválido en el Contacto #${i + 1} (Sección 2)`);
  });

  // Sección 3 — cada producto necesita nombre y tipo de necesidad
  form.productosCliente.forEach((p, i) => {
    const n = i + 1;
    if (!p.nombreProducto.trim())
      errors.push(`Nombre del Producto #${n} es requerido (Sección 3)`);
    if (!p.tipoNecesidad)
      errors.push(`Tipo de Necesidad del Producto #${n} es requerido (Sección 3)`);
    if (!p.prioridad)
      errors.push(`Prioridad del Producto #${n} es requerida (Sección 3)`);
    if (p.tipoNecesidad === 'otro' && !p.tipoNecesidadOtro.trim())
      errors.push(`Especifica el tipo de necesidad del Producto #${n} (Sección 3)`);
  });

  // Sección 5
  if (!form.elaboradoPor.nombre.trim())
    errors.push('Nombre del responsable es requerido (Sección 5)');

  return errors;
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────
function SectionTitle({ n, title }) {
  return (
    <div className="sol-section-header">
      <span className="sol-section-badge">{n}</span>
      <h2 className="sol-section-title">{title}</h2>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className="sol-field">
      <label className="sol-label">
        {label}
        {required && <span className="sol-req"> *</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
}

function Chips({ options, value, onChange, hasError }) {
  return (
    <div className="sol-chip-group" style={hasError ? { outline: '1px solid #dc2626', borderRadius: '6px', padding: '4px' } : {}}>
      {options.map((op) => {
        const label = typeof op === 'string' ? op : op.label;
        const val   = typeof op === 'string' ? op : op.value;
        return (
          <button
            key={val}
            type="button"
            className={`sol-chip${value === val ? ' sol-chip-active' : ''}`}
            onClick={() => onChange(val)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function ValidationBanner({ errors, onClose }) {
  if (!errors.length) return null;
  return (
    <div style={{
      background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #dc2626',
      borderRadius: '8px', padding: '16px 20px', marginBottom: '24px',
      position: 'sticky', top: '12px', zIndex: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: '600', fontSize: '13px', color: '#991b1b', marginBottom: '8px' }}>
            ⚠ Hay {errors.length} campo{errors.length > 1 ? 's' : ''} requerido{errors.length > 1 ? 's' : ''} sin completar
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            {errors.map((e, i) => (
              <li key={i} style={{ fontSize: '12px', color: '#b91c1c', marginBottom: '3px' }}>{e}</li>
            ))}
          </ul>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontSize: '16px', lineHeight: 1, marginLeft: '12px', flexShrink: 0 }}
        >✕</button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function NuevaSolicitudInicialPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fechaReunion: HOY,
    cliente: {
      razonSocial:           '',
      ciudad:                '',
      direccion:             '',
      sectorIndustria:       '',
      canalComercializacion: '',
    },
    contactos:        [defaultContacto()],
    productosCliente: [defaultProducto()],
    proximosPasos:    [''],
    elaboradoPor:     { nombre: 'Angel Dubois', cargo: 'FOUNDER - CEO' },
  });

  const [step,         setStep]         = useState(1);
  const [pdfUrl,       setPdfUrl]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState(null);
  const [saved,        setSaved]        = useState(false);
  const [validErrors,  setValidErrors]  = useState([]);
  // mapa de campos tocados para mostrar errores inline
  const [touched,      setTouched]      = useState({});

  // ── helpers de estado ──────────────────────────────────────────────────────
  const set         = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const setNested   = (f, k, v) => setForm(p => ({ ...p, [f]: { ...p[f], [k]: v } }));
  const setArr      = (f, idx, v) => setForm(p => { const c = [...p[f]]; c[idx] = v; return { ...p, [f]: c }; });
  const setArrNested = (f, idx, k, v) => setForm(p => {
    const c = [...p[f]]; c[idx] = { ...c[idx], [k]: v }; return { ...p, [f]: c };
  });

  const touch = (key) => setTouched(t => ({ ...t, [key]: true }));

  const addContacto  = () => set('contactos',        [...form.contactos, defaultContacto()]);
  const addProducto  = () => set('productosCliente', [...form.productosCliente, defaultProducto()]);
  const addPaso      = () => set('proximosPasos',    [...form.proximosPasos, '']);

  const removeContacto = (i) => {
    if (form.contactos.length === 1) return;
    set('contactos', form.contactos.filter((_, j) => j !== i));
  };
  const removeProducto = (i) => {
    if (form.productosCliente.length === 1) return;
    set('productosCliente', form.productosCliente.filter((_, j) => j !== i));
  };
  const removePaso = (i) => {
    if (form.proximosPasos.length === 1) return;
    set('proximosPasos', form.proximosPasos.filter((_, j) => j !== i));
  };

  const cleanFormData = () => ({
    ...form,
    contactos:        form.contactos.filter(c => c.nombre || c.email),
    proximosPasos:    form.proximosPasos.filter(x => x.trim()),
    productosCliente: form.productosCliente,
  });

  // ── acciones principales ───────────────────────────────────────────────────
  const handlePreview = async () => {
    const errors = validateForm(form);
    if (errors.length) { setValidErrors(errors); return; }
    setValidErrors([]);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/solicitudes/inicial/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanFormData()),
      });
      if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.error || 'Error al generar el PDF'); }
      const blob = await res.blob();
      setPdfUrl(URL.createObjectURL(blob));
      setStep(2);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `levantamiento-procura-${Date.now()}.pdf`;
    a.click();
  };

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch('/api/admin/solicitudes/inicial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanFormData()),
      });
      if (!res.ok) throw new Error('Error al guardar la solicitud');
      setSaved(true);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  // ── vista previa PDF ───────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="sol-preview-page">
        <div className="sol-preview-toolbar">
          <div className="sol-preview-left">
            <button className="sol-btn-back" onClick={() => setStep(1)}>← Editar</button>
            <span className="mono-sm">Vista previa — Ficha de Levantamiento de Procura</span>
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
  }

  // ── formulario ─────────────────────────────────────────────────────────────
  return (
    <div className="main-content">
      <div className="section-title-row" style={{ marginBottom: 28 }}>
        <span className="section-title-text">Nueva Ficha de Levantamiento de Procura</span>
        <span className="mono-sm">DUBOIS · Grupo Logístico</span>
      </div>

      {/* Banner de validación */}
      <ValidationBanner errors={validErrors} onClose={() => setValidErrors([])} />

      <div className="sol-form">

        {/* ── Sección 1: Información General ────────────────────────────── */}
        <div className="sol-section">
          <SectionTitle n="1" title="Información General de la Reunión" />

          <div className="sol-grid-3">
            <Field label="Fecha">
              <div className="sol-date-row">
                <input className="sol-input sol-input-xs" value={form.fechaReunion.dd} readOnly />
                <span className="sol-date-sep">/</span>
                <input className="sol-input sol-input-xs" value={form.fechaReunion.mm} readOnly />
                <span className="sol-date-sep">/</span>
                <input className="sol-input sol-input-sm" value={form.fechaReunion.aaaa} readOnly />
              </div>
              <span className="sol-date-hint">Fecha actual (automática)</span>
            </Field>

            <div style={{ gridColumn: 'span 2' }}>
              <Field
                label="Razón Social del Cliente" required
                error={touched['razonSocial'] && !form.cliente.razonSocial.trim() ? 'Campo requerido' : ''}
              >
                <input
                  className={`sol-input${touched['razonSocial'] && !form.cliente.razonSocial.trim() ? ' sol-input-error' : ''}`}
                  value={form.cliente.razonSocial}
                  onChange={e => setNested('cliente', 'razonSocial', e.target.value)}
                  onBlur={() => touch('razonSocial')}
                  placeholder="Nombre legal de la empresa"
                />
              </Field>
            </div>
          </div>

          <div className="sol-grid-3">
            <Field
              label="Ciudad" required
              error={touched['ciudad'] && !form.cliente.ciudad.trim() ? 'Campo requerido' : ''}
            >
              <input
                className={`sol-input${touched['ciudad'] && !form.cliente.ciudad.trim() ? ' sol-input-error' : ''}`}
                value={form.cliente.ciudad}
                onChange={e => setNested('cliente', 'ciudad', e.target.value)}
                onBlur={() => touch('ciudad')}
              />
            </Field>
            <Field label="Dirección">
              <input className="sol-input" value={form.cliente.direccion}
                onChange={e => setNested('cliente', 'direccion', e.target.value)} />
            </Field>
            <Field label="Sector / Industria">
              <input className="sol-input" value={form.cliente.sectorIndustria}
                onChange={e => setNested('cliente', 'sectorIndustria', e.target.value)} />
            </Field>
          </div>

          <div className="sol-grid-2">
            <Field label="Canal de Comercialización">
              <input className="sol-input" value={form.cliente.canalComercializacion}
                onChange={e => setNested('cliente', 'canalComercializacion', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* ── Sección 2: Contactos ───────────────────────────────────────── */}
        <div className="sol-section">
          <SectionTitle n="2" title="Contactos del Cliente" />

          {form.contactos.map((c, i) => (
            <div key={i} className="sol-card-block">
              <div className="sol-card-top">
                <span className="sol-card-title">{i === 0 ? 'Contacto principal' : `Contacto #${i + 1}`}</span>
                {form.contactos.length > 1 && (
                  <button type="button" className="sol-btn-remove" onClick={() => removeContacto(i)}>Eliminar</button>
                )}
              </div>
              <div className="sol-grid-4">
                <input
                  className={`sol-input${touched[`c${i}_nombre`] && !c.nombre.trim() ? ' sol-input-error' : ''}`}
                  placeholder="Nombre *"
                  value={c.nombre}
                  onChange={e => setArrNested('contactos', i, 'nombre', e.target.value)}
                  onBlur={() => touch(`c${i}_nombre`)}
                />
                <input className="sol-input" placeholder="Cargo" value={c.cargo}
                  onChange={e => setArrNested('contactos', i, 'cargo', e.target.value)} />
                <input className="sol-input" placeholder="Teléfono" value={c.telefono}
                  onChange={e => setArrNested('contactos', i, 'telefono', e.target.value)} />
                <input
                  className={`sol-input${touched[`c${i}_email`] && c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) ? ' sol-input-error' : ''}`}
                  placeholder="Email"
                  type="email"
                  value={c.email}
                  onChange={e => setArrNested('contactos', i, 'email', e.target.value)}
                  onBlur={() => touch(`c${i}_email`)}
                />
              </div>
              {touched[`c${i}_email`] && c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) && (
                <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                  Email inválido
                </span>
              )}
            </div>
          ))}
          <button type="button" className="sol-btn-add" onClick={addContacto}>+ Agregar contacto</button>
        </div>

        {/* ── Sección 3: Productos ───────────────────────────────────────── */}
        <div className="sol-section">
          <SectionTitle n="3" title="Productos del Cliente y Necesidad de Procura" />

          {form.productosCliente.map((p, i) => (
            <div key={i} className="sol-card-block">
              <div className="sol-card-top">
                <span className="sol-card-title">Producto #{i + 1}</span>
                {form.productosCliente.length > 1 && (
                  <button type="button" className="sol-btn-remove" onClick={() => removeProducto(i)}>Eliminar</button>
                )}
              </div>

              <div className="sol-grid-2">
                <Field
                  label="Nombre del Producto" required
                  error={touched[`p${i}_nombre`] && !p.nombreProducto.trim() ? 'Campo requerido' : ''}
                >
                  <input
                    className={`sol-input${touched[`p${i}_nombre`] && !p.nombreProducto.trim() ? ' sol-input-error' : ''}`}
                    value={p.nombreProducto}
                    onChange={e => setArrNested('productosCliente', i, 'nombreProducto', e.target.value)}
                    onBlur={() => touch(`p${i}_nombre`)}
                  />
                </Field>
                <Field label="Categoría">
                  <input className="sol-input" value={p.categoria}
                    onChange={e => setArrNested('productosCliente', i, 'categoria', e.target.value)} />
                </Field>
              </div>

              <Field label="Descripción del Producto">
                <textarea
                  className="sol-textarea"
                  rows={4}
                  placeholder="Incluye características técnicas, materiales, especificaciones relevantes y cualquier nota adicional…"
                  value={p.descripcion}
                  onChange={e => setArrNested('productosCliente', i, 'descripcion', e.target.value)}
                />
              </Field>

              <div className="sol-grid-3">
                <Field label="Marca">
                  <input className="sol-input" value={p.marca}
                    onChange={e => setArrNested('productosCliente', i, 'marca', e.target.value)} />
                </Field>
                <Field label="Referencia / Modelo">
                  <input className="sol-input" value={p.referenciaModelo}
                    onChange={e => setArrNested('productosCliente', i, 'referenciaModelo', e.target.value)} />
                </Field>
                <Field label="País de Origen">
                  <input className="sol-input" value={p.paisOrigen}
                    onChange={e => setArrNested('productosCliente', i, 'paisOrigen', e.target.value)} />
                </Field>
              </div>

              <div className="sol-grid-2">
                <Field label="Dimensiones">
                  <input className="sol-input" value={p.dimensiones}
                    onChange={e => setArrNested('productosCliente', i, 'dimensiones', e.target.value)} />
                </Field>
                <Field label="Empaque">
                  <input className="sol-input" value={p.empaque}
                    onChange={e => setArrNested('productosCliente', i, 'empaque', e.target.value)} />
                </Field>
              </div>

              <div className="sol-grid-2">
                <Field
                  label="Tipo de necesidad" required
                  error={touched[`p${i}_tipo`] && !p.tipoNecesidad ? 'Selecciona un tipo' : ''}
                >
                  <Chips
                    options={TIPOS_NECESIDAD}
                    value={p.tipoNecesidad}
                    hasError={touched[`p${i}_tipo`] && !p.tipoNecesidad}
                    onChange={val => { setArrNested('productosCliente', i, 'tipoNecesidad', val); touch(`p${i}_tipo`); }}
                  />
                  {p.tipoNecesidad === 'otro' && (
                    <input className="sol-input" style={{ marginTop: 8 }}
                      placeholder="Especifique…"
                      value={p.tipoNecesidadOtro}
                      onChange={e => setArrNested('productosCliente', i, 'tipoNecesidadOtro', e.target.value)} />
                  )}
                </Field>

                <Field
                  label="Prioridad" required
                  error={touched[`p${i}_prio`] && !p.prioridad ? 'Selecciona una prioridad' : ''}
                >
                  <Chips
                    options={PRIORIDADES.map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
                    value={p.prioridad}
                    hasError={touched[`p${i}_prio`] && !p.prioridad}
                    onChange={val => { setArrNested('productosCliente', i, 'prioridad', val); touch(`p${i}_prio`); }}
                  />
                </Field>
              </div>

              <div className="sol-grid-2">
                <Field label="Frecuencia requerida">
                  <input className="sol-input" value={p.frecuenciaRequerida}
                    onChange={e => setArrNested('productosCliente', i, 'frecuenciaRequerida', e.target.value)} />
                </Field>
                <Field label="Cantidad referencial">
                  <input className="sol-input" value={p.cantidadReferencial}
                    onChange={e => setArrNested('productosCliente', i, 'cantidadReferencial', e.target.value)} />
                </Field>
              </div>
            </div>
          ))}

          <button type="button" className="sol-btn-add" onClick={addProducto}>+ Agregar producto</button>
        </div>

        {/* ── Sección 4: Próximos Pasos ──────────────────────────────────── */}
        <div className="sol-section">
          <SectionTitle n="4" title="Próximos Pasos" />

          {form.proximosPasos.map((paso, i) => (
            <div key={i} className="sol-item-row">
              <input className="sol-input" placeholder={`Próximo paso ${i + 1}`}
                value={paso} onChange={e => setArr('proximosPasos', i, e.target.value)} />
              {form.proximosPasos.length > 1 && (
                <button type="button" className="sol-btn-remove-inline" onClick={() => removePaso(i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="sol-btn-add" onClick={addPaso}>+ Agregar paso</button>
        </div>

        {/* ── Sección 5: Registro Interno (solo lectura) ─────────────────── */}
        <div className="sol-section">
          <SectionTitle n="5" title="Registro Interno" />

          <div className="sol-firmas-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="sol-firma-card">
              <p className="sol-firma-role">Elaborado por</p>
              <div className="sol-grid-2">
                <Field label="Nombre">
                  <input className="sol-input" value={form.elaboradoPor.nombre} readOnly
                    style={{ background: '#f9f9f9', color: '#555', cursor: 'default' }} />
                </Field>
                <Field label="Cargo">
                  <input className="sol-input" value={form.elaboradoPor.cargo} readOnly
                    style={{ background: '#f9f9f9', color: '#555', cursor: 'default' }} />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="sol-error">{error}</div>}

        <div className="sol-form-footer">
          <button type="button" className="sol-btn-cancel" onClick={() => router.back()}>
            Cancelar
          </button>
          <button type="button" className="sol-btn-preview" onClick={handlePreview} disabled={loading}>
            {loading ? 'Generando...' : '👁 Vista Previa del PDF'}
          </button>
        </div>

      </div>
    </div>
  );
}
