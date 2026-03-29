'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const TIPOS_NECESIDAD = [
  { value: 'materia_prima', label: 'Materia Prima' },
  { value: 'producto_terminado', label: 'Producto Terminado' },
  { value: 'empaque', label: 'Empaque' },
  { value: 'repuesto', label: 'Repuesto' },
  { value: 'equipo', label: 'Equipo' },
  { value: 'servicio', label: 'Servicio' },
  { value: 'otro', label: 'Otro' },
];

const PRIORIDADES = ['alta', 'media', 'baja'];

// Fecha actual
const now = new Date();
const HOY = {
  dd: String(now.getDate()).padStart(2, '0'),
  mm: String(now.getMonth() + 1).padStart(2, '0'),
  aaaa: String(now.getFullYear()),
};

const defaultContacto = () => ({
  nombre: '',
  cargo: '',
  telefono: '',
  email: '',
});

const defaultProducto = () => ({
  nombreProducto: '',
  categoria: '',
  descripcionGeneral: '',
  caracteristicasPrincipales: [''],
  presentaciones: [''],
  materiales: [''],
  colores: [''],
  dimensiones: '',
  peso: '',
  empaque: '',
  marca: '',
  referenciaModelo: '',
  paisOrigen: '',
  usosAplicaciones: '',
  requerimientosEspeciales: '',
  observaciones: '',
});

const defaultNecesidad = () => ({
  productoRelacionado: '',
  tipoNecesidad: '',
  tipoNecesidadOtro: '',
  descripcion: '',
  especificacionesMinimas: '',
  frecuenciaRequerida: '',
  cantidadReferencial: '',
  prioridad: '',
  observaciones: '',
});

const defaultFirma = () => ({
  nombre: '',
  cargo: '',
  fecha: '',
});

// ─── SUBCOMPONENTES ───────────────────────────────────────────────────────────
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
        {label}
        {required && <span className="sol-req"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Chips({ options, value, onChange }) {
  return (
    <div className="sol-chip-group">
      {options.map((op) => {
        const label = typeof op === 'string' ? op : op.label;
        const val = typeof op === 'string' ? op : op.value;

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

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function NuevaSolicitudInicialPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fecha: HOY,
    empresaCliente: '',
    nombreComercial: '',
    ciudad: '',
    direccion: '',

    contactoPrincipal: defaultContacto(),
    otrosContactos: [defaultContacto()],

    objetivoReunion: '',
    resumenCliente: '',
    sectorIndustria: '',
    canalComercializacion: '',

    productosCliente: [defaultProducto()],
    necesidadesProcura: [defaultNecesidad()],

    fortalezasDetectadas: [''],
    restriccionesDetectadas: [''],
    comentariosFinales: '',

    proximosPasos: [''],

    elaboradoPor: defaultFirma(),
  });

  const [step, setStep] = useState(1);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  // ─── helpers generales ─────────────────────────────────────────────────────
  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setNested = (field, key, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value,
      },
    }));
  };

  const setArr = (field, index, value) => {
    setForm((prev) => {
      const copy = [...prev[field]];
      copy[index] = value;
      return { ...prev, [field]: copy };
    });
  };

  const setArrNested = (field, index, key, value) => {
    setForm((prev) => {
      const copy = [...prev[field]];
      copy[index] = {
        ...copy[index],
        [key]: value,
      };
      return { ...prev, [field]: copy };
    });
  };

  const setDeepArr = (parentField, parentIndex, childField, childIndex, value) => {
    setForm((prev) => {
      const parentCopy = [...prev[parentField]];
      const childCopy = [...parentCopy[parentIndex][childField]];
      childCopy[childIndex] = value;

      parentCopy[parentIndex] = {
        ...parentCopy[parentIndex],
        [childField]: childCopy,
      };

      return {
        ...prev,
        [parentField]: parentCopy,
      };
    });
  };

  // ─── agregadores ───────────────────────────────────────────────────────────
  const addOtroContacto = () => {
    set('otrosContactos', [...form.otrosContactos, defaultContacto()]);
  };

  const addProducto = () => {
    set('productosCliente', [...form.productosCliente, defaultProducto()]);
  };

  const addNecesidad = () => {
    set('necesidadesProcura', [...form.necesidadesProcura, defaultNecesidad()]);
  };

  const addFortaleza = () => {
    set('fortalezasDetectadas', [...form.fortalezasDetectadas, '']);
  };

  const addRestriccion = () => {
    set('restriccionesDetectadas', [...form.restriccionesDetectadas, '']);
  };

  const addProximoPaso = () => {
    set('proximosPasos', [...form.proximosPasos, '']);
  };

  const addProductoSubItem = (productoIndex, field) => {
    setForm((prev) => {
      const productos = [...prev.productosCliente];
      productos[productoIndex] = {
        ...productos[productoIndex],
        [field]: [...productos[productoIndex][field], ''],
      };
      return { ...prev, productosCliente: productos };
    });
  };

  // ─── removedores ───────────────────────────────────────────────────────────
  const removeOtroContacto = (index) => {
    set('otrosContactos', form.otrosContactos.filter((_, i) => i !== index));
  };

  const removeProducto = (index) => {
    if (form.productosCliente.length === 1) return;
    set('productosCliente', form.productosCliente.filter((_, i) => i !== index));
  };

  const removeNecesidad = (index) => {
    if (form.necesidadesProcura.length === 1) return;
    set('necesidadesProcura', form.necesidadesProcura.filter((_, i) => i !== index));
  };

  const removeSimpleItem = (field, index) => {
    if (form[field].length === 1) return;
    set(
      field,
      form[field].filter((_, i) => i !== index)
    );
  };

  const removeProductoSubItem = (productoIndex, field, itemIndex) => {
    setForm((prev) => {
      const productos = [...prev.productosCliente];
      const arr = productos[productoIndex][field];

      if (arr.length === 1) return prev;

      productos[productoIndex] = {
        ...productos[productoIndex],
        [field]: arr.filter((_, i) => i !== itemIndex),
      };

      return { ...prev, productosCliente: productos };
    });
  };

  // ─── sanitizador básico antes de enviar ───────────────────────────────────
  const cleanFormData = () => {
    return {
      ...form,
      otrosContactos: form.otrosContactos.filter(
        (c) => c.nombre || c.cargo || c.telefono || c.email
      ),
      fortalezasDetectadas: form.fortalezasDetectadas.filter((x) => x.trim()),
      restriccionesDetectadas: form.restriccionesDetectadas.filter((x) => x.trim()),
      proximosPasos: form.proximosPasos.filter((x) => x.trim()),
      productosCliente: form.productosCliente.map((p) => ({
        ...p,
        caracteristicasPrincipales: p.caracteristicasPrincipales.filter((x) => x.trim()),
        presentaciones: p.presentaciones.filter((x) => x.trim()),
        materiales: p.materiales.filter((x) => x.trim()),
        colores: p.colores.filter((x) => x.trim()),
      })),
    };
  };

  // ─── acciones ──────────────────────────────────────────────────────────────
  const handlePreview = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = cleanFormData();

      const res = await fetch('/api/admin/solicitudes/inicial/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Error al generar el PDF');
      }

      const blob = await res.blob();
      setPdfUrl(URL.createObjectURL(blob));
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `levantamiento-procura-${Date.now()}.pdf`;
    a.click();
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = cleanFormData();

      const res = await fetch('/api/admin/solicitudes/inicial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al guardar la solicitud inicial');
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── PREVIEW ───────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="sol-preview-page">
        <div className="sol-preview-toolbar">
          <div className="sol-preview-left">
            <button className="sol-btn-back" onClick={() => setStep(1)}>
              ← Editar
            </button>
            <span className="mono-sm">Vista previa — Ficha de Levantamiento de Procura</span>
          </div>

          <div className="sol-preview-actions">
            {saved ? (
              <span className="sol-saved-badge">✓ Guardado</span>
            ) : (
              <button className="sol-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar en DB'}
              </button>
            )}

            <button className="sol-btn-download" onClick={handleDownload}>
              ↓ Descargar PDF
            </button>
          </div>
        </div>

        {error && <div className="sol-error">{error}</div>}

        <iframe className="sol-pdf-frame" src={pdfUrl} title="Vista previa PDF" />
      </div>
    );
  }

  // ─── FORMULARIO ────────────────────────────────────────────────────────────
  return (
    <div className="main-content">
      <div className="section-title-row" style={{ marginBottom: 28 }}>
        <span className="section-title-text">Nueva Ficha de Levantamiento de Procura</span>
        <span className="mono-sm">DUBOIS · Grupo Logístico</span>
      </div>

      <div className="sol-form">
        {/* ── 1. INFORMACIÓN GENERAL ── */}
        <div className="sol-section">
          <SectionTitle n="1" title="Información General de la Reunión" />

          <div className="sol-grid-3">
            <Field label="Fecha">
              <div className="sol-date-row">
                <input className="sol-input sol-input-xs" value={form.fecha.dd} readOnly />
                <span className="sol-date-sep">/</span>
                <input className="sol-input sol-input-xs" value={form.fecha.mm} readOnly />
                <span className="sol-date-sep">/</span>
                <input className="sol-input sol-input-sm" value={form.fecha.aaaa} readOnly />
              </div>
              <span className="sol-date-hint">Fecha actual (automática)</span>
            </Field>

            <div style={{ gridColumn: 'span 2' }}>
              <Field label="Empresa Cliente" required>
                <input
                  className="sol-input"
                  value={form.empresaCliente}
                  onChange={(e) => set('empresaCliente', e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="sol-grid-3">
            <Field label="Nombre Comercial">
              <input
                className="sol-input"
                value={form.nombreComercial}
                onChange={(e) => set('nombreComercial', e.target.value)}
              />
            </Field>
            <Field label="Ciudad">
              <input
                className="sol-input"
                value={form.ciudad}
                onChange={(e) => set('ciudad', e.target.value)}
              />
            </Field>
            <Field label="Dirección">
              <input
                className="sol-input"
                value={form.direccion}
                onChange={(e) => set('direccion', e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* ── 2. CONTACTOS ── */}
        <div className="sol-section">
          <SectionTitle n="2" title="Contactos del Cliente" />

          <Field label="Contacto Principal" required>
            <div className="sol-grid-4">
              <input
                className="sol-input"
                placeholder="Nombre"
                value={form.contactoPrincipal.nombre}
                onChange={(e) => setNested('contactoPrincipal', 'nombre', e.target.value)}
              />
              <input
                className="sol-input"
                placeholder="Cargo"
                value={form.contactoPrincipal.cargo}
                onChange={(e) => setNested('contactoPrincipal', 'cargo', e.target.value)}
              />
              <input
                className="sol-input"
                placeholder="Teléfono"
                value={form.contactoPrincipal.telefono}
                onChange={(e) => setNested('contactoPrincipal', 'telefono', e.target.value)}
              />
              <input
                className="sol-input"
                placeholder="Email"
                type="email"
                value={form.contactoPrincipal.email}
                onChange={(e) => setNested('contactoPrincipal', 'email', e.target.value)}
              />
            </div>
          </Field>

          <div style={{ marginTop: 18 }}>
            <div className="sol-subtitle">Otros contactos</div>

            {form.otrosContactos.map((contacto, i) => (
              <div key={i} className="sol-card-block">
                <div className="sol-card-top">
                  <span className="sol-card-title">Contacto adicional #{i + 1}</span>
                  {form.otrosContactos.length > 1 && (
                    <button
                      type="button"
                      className="sol-btn-remove"
                      onClick={() => removeOtroContacto(i)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="sol-grid-4">
                  <input
                    className="sol-input"
                    placeholder="Nombre"
                    value={contacto.nombre}
                    onChange={(e) => setArrNested('otrosContactos', i, 'nombre', e.target.value)}
                  />
                  <input
                    className="sol-input"
                    placeholder="Cargo"
                    value={contacto.cargo}
                    onChange={(e) => setArrNested('otrosContactos', i, 'cargo', e.target.value)}
                  />
                  <input
                    className="sol-input"
                    placeholder="Teléfono"
                    value={contacto.telefono}
                    onChange={(e) => setArrNested('otrosContactos', i, 'telefono', e.target.value)}
                  />
                  <input
                    className="sol-input"
                    placeholder="Email"
                    type="email"
                    value={contacto.email}
                    onChange={(e) => setArrNested('otrosContactos', i, 'email', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button type="button" className="sol-btn-add" onClick={addOtroContacto}>
              + Agregar contacto
            </button>
          </div>
        </div>

        {/* ── 3. CONTEXTO ── */}
        <div className="sol-section">
          <SectionTitle n="3" title="Contexto de la Reunión" />

          <Field label="Objetivo de la Reunión" required>
            <textarea
              className="sol-textarea"
              rows={3}
              value={form.objetivoReunion}
              onChange={(e) => set('objetivoReunion', e.target.value)}
            />
          </Field>

          <Field label="Resumen del Cliente">
            <textarea
              className="sol-textarea"
              rows={3}
              value={form.resumenCliente}
              onChange={(e) => set('resumenCliente', e.target.value)}
            />
          </Field>

          <div className="sol-grid-2">
            <Field label="Sector / Industria">
              <input
                className="sol-input"
                value={form.sectorIndustria}
                onChange={(e) => set('sectorIndustria', e.target.value)}
              />
            </Field>
            <Field label="Canal de Comercialización">
              <input
                className="sol-input"
                value={form.canalComercializacion}
                onChange={(e) => set('canalComercializacion', e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* ── 4. PRODUCTOS ── */}
        <div className="sol-section">
          <SectionTitle n="4" title="Productos del Cliente" />

          {form.productosCliente.map((producto, i) => (
            <div key={i} className="sol-card-block">
              <div className="sol-card-top">
                <span className="sol-card-title">Producto #{i + 1}</span>
                {form.productosCliente.length > 1 && (
                  <button
                    type="button"
                    className="sol-btn-remove"
                    onClick={() => removeProducto(i)}
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="sol-grid-2">
                <Field label="Nombre del Producto" required>
                  <input
                    className="sol-input"
                    value={producto.nombreProducto}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'nombreProducto', e.target.value)
                    }
                  />
                </Field>

                <Field label="Categoría">
                  <input
                    className="sol-input"
                    value={producto.categoria}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'categoria', e.target.value)
                    }
                  />
                </Field>
              </div>

              <Field label="Descripción General" required>
                <textarea
                  className="sol-textarea"
                  rows={3}
                  value={producto.descripcionGeneral}
                  onChange={(e) =>
                    setArrNested('productosCliente', i, 'descripcionGeneral', e.target.value)
                  }
                />
              </Field>

              <div className="sol-subtitle">Características principales</div>
              {producto.caracteristicasPrincipales.map((item, j) => (
                <div key={j} className="sol-item-row">
                  <input
                    className="sol-input"
                    placeholder={`Característica ${j + 1}`}
                    value={item}
                    onChange={(e) =>
                      setDeepArr(
                        'productosCliente',
                        i,
                        'caracteristicasPrincipales',
                        j,
                        e.target.value
                      )
                    }
                  />
                  {producto.caracteristicasPrincipales.length > 1 && (
                    <button
                      type="button"
                      className="sol-btn-remove-inline"
                      onClick={() =>
                        removeProductoSubItem(i, 'caracteristicasPrincipales', j)
                      }
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="sol-btn-add"
                onClick={() => addProductoSubItem(i, 'caracteristicasPrincipales')}
              >
                + Agregar característica
              </button>

              <div className="sol-grid-2" style={{ marginTop: 16 }}>
                <Field label="Dimensiones">
                  <input
                    className="sol-input"
                    value={producto.dimensiones}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'dimensiones', e.target.value)
                    }
                  />
                </Field>

                <Field label="Peso">
                  <input
                    className="sol-input"
                    value={producto.peso}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'peso', e.target.value)
                    }
                  />
                </Field>
              </div>

              <div className="sol-grid-3">
                <Field label="Empaque">
                  <input
                    className="sol-input"
                    value={producto.empaque}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'empaque', e.target.value)
                    }
                  />
                </Field>

                <Field label="Marca">
                  <input
                    className="sol-input"
                    value={producto.marca}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'marca', e.target.value)
                    }
                  />
                </Field>

                <Field label="Referencia / Modelo">
                  <input
                    className="sol-input"
                    value={producto.referenciaModelo}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'referenciaModelo', e.target.value)
                    }
                  />
                </Field>
              </div>

              <div className="sol-grid-2">
                <Field label="País de Origen">
                  <input
                    className="sol-input"
                    value={producto.paisOrigen}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'paisOrigen', e.target.value)
                    }
                  />
                </Field>

                <Field label="Usos / Aplicaciones">
                  <input
                    className="sol-input"
                    value={producto.usosAplicaciones}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'usosAplicaciones', e.target.value)
                    }
                  />
                </Field>
              </div>

              <Field label="Requerimientos Especiales">
                <textarea
                  className="sol-textarea"
                  rows={2}
                  value={producto.requerimientosEspeciales}
                  onChange={(e) =>
                    setArrNested(
                      'productosCliente',
                      i,
                      'requerimientosEspeciales',
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Observaciones">
                <textarea
                  className="sol-textarea"
                  rows={2}
                  value={producto.observaciones}
                  onChange={(e) =>
                    setArrNested('productosCliente', i, 'observaciones', e.target.value)
                  }
                />
              </Field>
            </div>
          ))}

          <button type="button" className="sol-btn-add" onClick={addProducto}>
            + Agregar producto
          </button>
        </div>

        {/* ── 5. NECESIDADES DE PROCURA ── */}
        <div className="sol-section">
          <SectionTitle n="5" title="Necesidades de Procura Detectadas" />

          {form.necesidadesProcura.map((item, i) => (
            <div key={i} className="sol-card-block">
              <div className="sol-card-top">
                <span className="sol-card-title">Necesidad #{i + 1}</span>
                {form.necesidadesProcura.length > 1 && (
                  <button
                    type="button"
                    className="sol-btn-remove"
                    onClick={() => removeNecesidad(i)}
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="sol-grid-2">
                <Field label="Producto Relacionado" required>
                  <input
                    className="sol-input"
                    value={item.productoRelacionado}
                    onChange={(e) =>
                      setArrNested('necesidadesProcura', i, 'productoRelacionado', e.target.value)
                    }
                  />
                </Field>

                <Field label="Prioridad">
                  <Chips
                    options={PRIORIDADES.map((p) => ({
                      value: p,
                      label: p.charAt(0).toUpperCase() + p.slice(1),
                    }))}
                    value={item.prioridad}
                    onChange={(val) =>
                      setArrNested('necesidadesProcura', i, 'prioridad', val)
                    }
                  />
                </Field>
              </div>

              <Field label="Tipo de Necesidad" required>
                <Chips
                  options={TIPOS_NECESIDAD}
                  value={item.tipoNecesidad}
                  onChange={(val) =>
                    setArrNested('necesidadesProcura', i, 'tipoNecesidad', val)
                  }
                />

                {item.tipoNecesidad === 'otro' && (
                  <input
                    className="sol-input"
                    style={{ marginTop: 8 }}
                    placeholder="Especifique el tipo de necesidad..."
                    value={item.tipoNecesidadOtro}
                    onChange={(e) =>
                      setArrNested('necesidadesProcura', i, 'tipoNecesidadOtro', e.target.value)
                    }
                  />
                )}
              </Field>

              <Field label="Descripción" required>
                <textarea
                  className="sol-textarea"
                  rows={3}
                  value={item.descripcion}
                  onChange={(e) =>
                    setArrNested('necesidadesProcura', i, 'descripcion', e.target.value)
                  }
                />
              </Field>

              <div className="sol-grid-3">
                <Field label="Especificaciones Mínimas">
                  <input
                    className="sol-input"
                    value={item.especificacionesMinimas}
                    onChange={(e) =>
                      setArrNested(
                        'necesidadesProcura',
                        i,
                        'especificacionesMinimas',
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field label="Frecuencia Requerida">
                  <input
                    className="sol-input"
                    value={item.frecuenciaRequerida}
                    onChange={(e) =>
                      setArrNested('necesidadesProcura', i, 'frecuenciaRequerida', e.target.value)
                    }
                  />
                </Field>

                <Field label="Cantidad Referencial">
                  <input
                    className="sol-input"
                    value={item.cantidadReferencial}
                    onChange={(e) =>
                      setArrNested('necesidadesProcura', i, 'cantidadReferencial', e.target.value)
                    }
                  />
                </Field>
              </div>

              <Field label="Observaciones">
                <textarea
                  className="sol-textarea"
                  rows={2}
                  value={item.observaciones}
                  onChange={(e) =>
                    setArrNested('necesidadesProcura', i, 'observaciones', e.target.value)
                  }
                />
              </Field>
            </div>
          ))}

          <button type="button" className="sol-btn-add" onClick={addNecesidad}>
            + Agregar necesidad de procura
          </button>
        </div>

        {/* ── 6. HALLAZGOS ── */}
        <div className="sol-section">
          <SectionTitle n="6" title="Hallazgos y Observaciones" />

          <div className="sol-subtitle">Fortalezas detectadas</div>
          {form.fortalezasDetectadas.map((item, i) => (
            <div key={i} className="sol-item-row">
              <input
                className="sol-input"
                placeholder={`Fortaleza ${i + 1}`}
                value={item}
                onChange={(e) => setArr('fortalezasDetectadas', i, e.target.value)}
              />
              {form.fortalezasDetectadas.length > 1 && (
                <button
                  type="button"
                  className="sol-btn-remove-inline"
                  onClick={() => removeSimpleItem('fortalezasDetectadas', i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="sol-btn-add" onClick={addFortaleza}>
            + Agregar fortaleza
          </button>

          <div className="sol-subtitle" style={{ marginTop: 18 }}>
            Restricciones detectadas
          </div>
          {form.restriccionesDetectadas.map((item, i) => (
            <div key={i} className="sol-item-row">
              <input
                className="sol-input"
                placeholder={`Restricción ${i + 1}`}
                value={item}
                onChange={(e) => setArr('restriccionesDetectadas', i, e.target.value)}
              />
              {form.restriccionesDetectadas.length > 1 && (
                <button
                  type="button"
                  className="sol-btn-remove-inline"
                  onClick={() => removeSimpleItem('restriccionesDetectadas', i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="sol-btn-add" onClick={addRestriccion}>
            + Agregar restricción
          </button>

          <Field label="Comentarios Finales">
            <textarea
              className="sol-textarea"
              rows={3}
              value={form.comentariosFinales}
              onChange={(e) => set('comentariosFinales', e.target.value)}
            />
          </Field>
        </div>

        {/* ── 7. PRÓXIMOS PASOS ── */}
        <div className="sol-section">
          <SectionTitle n="7" title="Próximos Pasos" />

          {form.proximosPasos.map((paso, i) => (
            <div key={i} className="sol-item-row">
              <input
                className="sol-input"
                placeholder={`Próximo paso ${i + 1}`}
                value={paso}
                onChange={(e) => setArr('proximosPasos', i, e.target.value)}
              />
              {form.proximosPasos.length > 1 && (
                <button
                  type="button"
                  className="sol-btn-remove-inline"
                  onClick={() => removeSimpleItem('proximosPasos', i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" className="sol-btn-add" onClick={addProximoPaso}>
            + Agregar paso
          </button>
        </div>

        {/* ── 8. REGISTRO INTERNO ── */}
        <div className="sol-section">
          <SectionTitle n="8" title="Registro Interno" />

          <div className="sol-firmas-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="sol-firma-card">
              <p className="sol-firma-role">Elaborado por</p>

              <Field label="Nombre" required>
                <input
                  className="sol-input"
                  value={form.elaboradoPor.nombre}
                  onChange={(e) => setNested('elaboradoPor', 'nombre', e.target.value)}
                />
              </Field>

              <Field label="Cargo">
                <input
                  className="sol-input"
                  value={form.elaboradoPor.cargo}
                  onChange={(e) => setNested('elaboradoPor', 'cargo', e.target.value)}
                />
              </Field>

              <Field label="Fecha" required>
                <input
                  className="sol-input"
                  type="date"
                  value={form.elaboradoPor.fecha}
                  onChange={(e) => setNested('elaboradoPor', 'fecha', e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── ERROR & SUBMIT ── */}
        {error && <div className="sol-error">{error}</div>}

        <div className="sol-form-footer">
          <button
            type="button"
            className="sol-btn-cancel"
            onClick={() => router.back()}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="sol-btn-preview"
            onClick={handlePreview}
            disabled={loading}
          >
            {loading ? 'Generando...' : '👁 Vista Previa del PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}