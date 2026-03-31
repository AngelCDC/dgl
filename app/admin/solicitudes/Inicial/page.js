'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  descripcionTecnica: '',
  caracteristicasPrincipales: [''],
  materiales: [''],
  dimensiones: '',
  empaque: '',
  marca: '',
  referenciaModelo: '',
  paisOrigen: '',
  notasProducto: '',
  tipoNecesidad: '',
  tipoNecesidadOtro: '',
  frecuenciaRequerida: '',
  cantidadReferencial: '',
  prioridad: '',
});

const defaultElaboradoPor = () => ({
  nombre: '',
  cargo: '',
});

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

export default function NuevaSolicitudInicialPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fechaReunion: HOY,

    cliente: {
      razonSocial: '',
      nombreComercial: '',
      ciudad: '',
      direccion: '',
      sectorIndustria: '',
      canalComercializacion: '',
    },

    contactos: [defaultContacto()],
    productosCliente: [defaultProducto()],
    proximosPasos: [''],
    elaboradoPor: defaultElaboradoPor(),
  });

  const [step, setStep] = useState(1);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

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

  const setDoubleNested = (parent, field, value) => {
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
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

  const addContacto = () => {
    set('contactos', [...form.contactos, defaultContacto()]);
  };

  const addProducto = () => {
    set('productosCliente', [...form.productosCliente, defaultProducto()]);
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

  const removeContacto = (index) => {
    if (form.contactos.length === 1) return;
    set('contactos', form.contactos.filter((_, i) => i !== index));
  };

  const removeProducto = (index) => {
    if (form.productosCliente.length === 1) return;
    set('productosCliente', form.productosCliente.filter((_, i) => i !== index));
  };

  const removeSimpleItem = (field, index) => {
    if (form[field].length === 1) return;
    set(field, form[field].filter((_, i) => i !== index));
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

  const cleanFormData = () => {
    return {
      ...form,
      contactos: form.contactos.filter(
        (c) => c.nombre || c.cargo || c.telefono || c.email
      ),
      proximosPasos: form.proximosPasos.filter((x) => x.trim()),
      productosCliente: form.productosCliente.map((p) => ({
        ...p,
        caracteristicasPrincipales: p.caracteristicasPrincipales.filter((x) => x.trim()),
        materiales: p.materiales.filter((x) => x.trim()),
      })),
    };
  };

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

  return (
    <div className="main-content">
      <div className="section-title-row" style={{ marginBottom: 28 }}>
        <span className="section-title-text">Nueva Ficha de Levantamiento de Procura</span>
        <span className="mono-sm">DUBOIS · Grupo Logístico</span>
      </div>

      <div className="sol-form">
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
              <Field label="Razón Social" required>
                <input
                  className="sol-input"
                  value={form.cliente.razonSocial}
                  onChange={(e) => setDoubleNested('cliente', 'razonSocial', e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="sol-grid-3">
            <Field label="Nombre Comercial">
              <input
                className="sol-input"
                value={form.cliente.nombreComercial}
                onChange={(e) => setDoubleNested('cliente', 'nombreComercial', e.target.value)}
              />
            </Field>
            <Field label="Ciudad">
              <input
                className="sol-input"
                value={form.cliente.ciudad}
                onChange={(e) => setDoubleNested('cliente', 'ciudad', e.target.value)}
              />
            </Field>
            <Field label="Dirección">
              <input
                className="sol-input"
                value={form.cliente.direccion}
                onChange={(e) => setDoubleNested('cliente', 'direccion', e.target.value)}
              />
            </Field>
          </div>

          <div className="sol-grid-2">
            <Field label="Sector / Industria">
              <input
                className="sol-input"
                value={form.cliente.sectorIndustria}
                onChange={(e) => setDoubleNested('cliente', 'sectorIndustria', e.target.value)}
              />
            </Field>
            <Field label="Canal de Comercialización">
              <input
                className="sol-input"
                value={form.cliente.canalComercializacion}
                onChange={(e) =>
                  setDoubleNested('cliente', 'canalComercializacion', e.target.value)
                }
              />
            </Field>
          </div>
        </div>

        <div className="sol-section">
          <SectionTitle n="2" title="Contactos del Cliente" />

          {form.contactos.map((contacto, i) => (
            <div key={i} className="sol-card-block">
              <div className="sol-card-top">
                <span className="sol-card-title">
                  {i === 0 ? 'Contacto principal' : `Contacto #${i + 1}`}
                </span>
                {form.contactos.length > 1 && (
                  <button
                    type="button"
                    className="sol-btn-remove"
                    onClick={() => removeContacto(i)}
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
                  onChange={(e) => setArrNested('contactos', i, 'nombre', e.target.value)}
                />
                <input
                  className="sol-input"
                  placeholder="Cargo"
                  value={contacto.cargo}
                  onChange={(e) => setArrNested('contactos', i, 'cargo', e.target.value)}
                />
                <input
                  className="sol-input"
                  placeholder="Teléfono"
                  value={contacto.telefono}
                  onChange={(e) => setArrNested('contactos', i, 'telefono', e.target.value)}
                />
                <input
                  className="sol-input"
                  placeholder="Email"
                  type="email"
                  value={contacto.email}
                  onChange={(e) => setArrNested('contactos', i, 'email', e.target.value)}
                />
              </div>
            </div>
          ))}

          <button type="button" className="sol-btn-add" onClick={addContacto}>
            + Agregar contacto
          </button>
        </div>

        <div className="sol-section">
          <SectionTitle n="3" title="Productos del Cliente y Necesidad de Procura" />

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

              <Field label="Descripción Técnica">
                <textarea
                  className="sol-textarea"
                  rows={3}
                  value={producto.descripcionTecnica}
                  onChange={(e) =>
                    setArrNested('productosCliente', i, 'descripcionTecnica', e.target.value)
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
                      onClick={() => removeProductoSubItem(i, 'caracteristicasPrincipales', j)}
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

              <div className="sol-subtitle" style={{ marginTop: 18 }}>
                Materiales
              </div>
              {producto.materiales.map((item, j) => (
                <div key={j} className="sol-item-row">
                  <input
                    className="sol-input"
                    placeholder={`Material ${j + 1}`}
                    value={item}
                    onChange={(e) =>
                      setDeepArr('productosCliente', i, 'materiales', j, e.target.value)
                    }
                  />
                  {producto.materiales.length > 1 && (
                    <button
                      type="button"
                      className="sol-btn-remove-inline"
                      onClick={() => removeProductoSubItem(i, 'materiales', j)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="sol-btn-add"
                onClick={() => addProductoSubItem(i, 'materiales')}
              >
                + Agregar material
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

                <Field label="Empaque">
                  <input
                    className="sol-input"
                    value={producto.empaque}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'empaque', e.target.value)
                    }
                  />
                </Field>
              </div>

              <div className="sol-grid-3">
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

                <Field label="País de Origen">
                  <input
                    className="sol-input"
                    value={producto.paisOrigen}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'paisOrigen', e.target.value)
                    }
                  />
                </Field>
              </div>

              <Field label="Notas del Producto">
                <textarea
                  className="sol-textarea"
                  rows={2}
                  value={producto.notasProducto}
                  onChange={(e) =>
                    setArrNested('productosCliente', i, 'notasProducto', e.target.value)
                  }
                />
              </Field>

              <div className="sol-grid-2">
                <Field label="Tipo de necesidad" required>
                  <Chips
                    options={TIPOS_NECESIDAD}
                    value={producto.tipoNecesidad}
                    onChange={(val) =>
                      setArrNested('productosCliente', i, 'tipoNecesidad', val)
                    }
                  />

                  {producto.tipoNecesidad === 'otro' && (
                    <input
                      className="sol-input"
                      style={{ marginTop: 8 }}
                      placeholder="Especifique el tipo de necesidad..."
                      value={producto.tipoNecesidadOtro}
                      onChange={(e) =>
                        setArrNested('productosCliente', i, 'tipoNecesidadOtro', e.target.value)
                      }
                    />
                  )}
                </Field>

                <Field label="Prioridad">
                  <Chips
                    options={PRIORIDADES.map((p) => ({
                      value: p,
                      label: p.charAt(0).toUpperCase() + p.slice(1),
                    }))}
                    value={producto.prioridad}
                    onChange={(val) => setArrNested('productosCliente', i, 'prioridad', val)}
                  />
                </Field>
              </div>

              <div className="sol-grid-2">
                <Field label="Frecuencia requerida">
                  <input
                    className="sol-input"
                    value={producto.frecuenciaRequerida}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'frecuenciaRequerida', e.target.value)
                    }
                  />
                </Field>

                <Field label="Cantidad referencial">
                  <input
                    className="sol-input"
                    value={producto.cantidadReferencial}
                    onChange={(e) =>
                      setArrNested('productosCliente', i, 'cantidadReferencial', e.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          ))}

          <button type="button" className="sol-btn-add" onClick={addProducto}>
            + Agregar producto
          </button>
        </div>

        <div className="sol-section">
          <SectionTitle n="4" title="Próximos Pasos" />

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

        <div className="sol-section">
          <SectionTitle n="5" title="Registro Interno" />

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
            </div>
          </div>
        </div>

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