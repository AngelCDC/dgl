'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

// ─── Helper: convierte producto del catálogo en descripción para la solicitud ──
function buildDescFromCatalog(p) {
  const parts = []
  if (p.descripcion) parts.push(p.descripcion)
  if (p.material) parts.push(`Material: ${p.material}`)
  if (p.variantes?.length) {
    parts.push(`Variantes (${p.variantes.length}): ` +
      p.variantes.map(v =>
        [v.codigo, v.medidas, v.unidad, v.precio].filter(Boolean).join(' ')
      ).join('; '))
  }
  return parts.join('\n')
}

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

// ─── ProductoRow — fila de producto con búsqueda en catálogo ─────────────────
function ProductoRow({ index, p, onField, onRemove, canRemove, touched, touch }) {
  const [selectedProduct, setSelectedProduct] = useState(null); // producto del catálogo seleccionado (con variantes)
  const [selectedVariant, setSelectedVariant] = useState(null); // variante seleccionada
  const [searching, setSearching] = useState(false);            // spinner mientras busca
  const debRef   = useRef(null);
  const wrapRef  = useRef(null);

  const handleNombreChange = (val) => {
    onField('nombreProducto', val);
    // Si el usuario edita manualmente, desvincula del catálogo
    if (selectedProduct) {
      setSelectedProduct(null);
      setSelectedVariant(null);
    }
    clearTimeout(debRef.current);
    if (!val.trim()) { setSearching(false); return; }
    setSearching(true);
    debRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/admin/catalogo?q=${encodeURIComponent(val)}&limit=1`);
        const data = await res.json();
        setSearching(false);
        // Solo auto-selecciona si hay coincidencia exacta al inicio del nombre
        if (data.productos && data.productos.length > 0) {
          const prod = data.productos[0];
          // Verificar que el nombre del producto comienza con lo que el usuario escribió
          if (prod.nombre.toLowerCase().startsWith(val.toLowerCase().trim())) {
            applyProduct(prod);
          }
        }
      } catch {
        setSearching(false);
      }
    }, 400);
  };

  // Aplicar producto del catálogo → auto-filla campos + muestra card
  const applyProduct = (prod) => {
    onField('nombreProducto', prod.nombre);
    onField('categoria',       prod.subcategoria || prod.categoria || '');
    const desc = [prod.descripcion, prod.material].filter(Boolean).join(' · ');
    onField('descripcion',     desc);
    onField('marca',           prod.proveedor || '');
    onField('referenciaModelo', '');
    onField('dimensiones',     '');
    setSelectedProduct(prod);
    setSelectedVariant(null);
  };

  // Seleccionar variante → auto-filla campos de variante
  const selectVariant = (variante) => {
    onField('referenciaModelo', variante.codigo  || '');
    onField('dimensiones',      variante.medidas || '');
    setSelectedVariant(variante);
  };

  const i = index;
  return (
    <div className="sol-card-block">
      <div className="sol-card-top">
        <span className="sol-card-title">Producto #{i + 1}</span>
        {canRemove && (
          <button type="button" className="sol-btn-remove" onClick={onRemove}>Eliminar</button>
        )}
      </div>

      <div className="sol-grid-2">
        {/* Nombre con búsqueda silenciosa en catálogo */}
        <Field
          label="Nombre del Producto" required
          error={touched[`p${i}_nombre`] && !p.nombreProducto.trim() ? 'Campo requerido' : ''}
        >
          <div ref={wrapRef} style={{ position: 'relative' }}>
            <input
              className={`sol-input${touched[`p${i}_nombre`] && !p.nombreProducto.trim() ? ' sol-input-error' : ''}`}
              value={p.nombreProducto}
              placeholder="Escribe para buscar en catálogo…"
              onChange={e => handleNombreChange(e.target.value)}
              onBlur={() => touch(`p${i}_nombre`)}
              autoComplete="off"
            />

            {/* Spinner de búsqueda */}
            {searching && (
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8' }}>
                ⏳
              </span>
            )}
          </div>

          {/* Tarjeta de detalles del producto seleccionado del catálogo */}
          {selectedProduct && (
            <div style={{
              marginTop: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '24px', flexShrink: 0, marginTop: '0px' }}>📦</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#111', marginBottom: '4px' }}>
                  {selectedProduct.nombre}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.55' }}>
                  <span style={{ fontWeight: '500', color: '#334155' }}>{selectedProduct.proveedor}</span>
                  {selectedProduct.rubro && (
                    <>
                      <span style={{ color: '#cbd5e1', margin: '0 4px' }}>·</span>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontWeight: '600',
                        verticalAlign: 'middle',
                      }}>
                        {selectedProduct.rubro}
                      </span>
                    </>
                  )}
                  {selectedProduct.categoria && (
                    <>
                      <span style={{ color: '#cbd5e1', margin: '0 4px' }}>·</span>
                      {selectedProduct.categoria}
                    </>
                  )}
                  {selectedProduct.subcategoria && (
                    <>
                      <span style={{ color: '#cbd5e1', margin: '0 4px' }}>·</span>
                      {selectedProduct.subcategoria}
                    </>
                  )}
                </div>
                {selectedProduct.material && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Material: {selectedProduct.material}
                  </div>
                )}
                {selectedProduct.descripcion && (
                  <div style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    marginTop: '4px',
                    lineHeight: '1.45',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {selectedProduct.descripcion}
                  </div>
                )}

                {/* Selector de variantes dentro de la card */}
                {selectedProduct.variantes && selectedProduct.variantes.length > 0 && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }}>
                      Seleccionar variante ({selectedProduct.variantes.length} disponible{selectedProduct.variantes.length !== 1 ? 's' : ''})
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {selectedProduct.variantes.map(v => {
                        const isActive = selectedVariant?.id === v.id
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => selectVariant(v)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontFamily: 'inherit',
                              border: isActive ? '2px solid #2563eb' : '1px solid #e0e0e0',
                              borderRadius: '8px',
                              background: isActive ? '#eff6ff' : 'white',
                              color: isActive ? '#2563eb' : '#555',
                              cursor: 'pointer',
                              fontWeight: isActive ? '600' : '400',
                              transition: 'border-color 0.15s, background 0.15s',
                              textAlign: 'left',
                            }}
                          >
                            <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>{v.codigo || 'Sin código'}</div>
                            {v.medidas && <div style={{ fontSize: '10px', color: '#888', marginTop: '2px', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.medidas}</div>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {(!selectedProduct.variantes || selectedProduct.variantes.length === 0) && (
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', fontWeight: '500' }}>
                      Sin variantes — datos manuales
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null)
                  setSelectedVariant(null)
                  onField('nombreProducto', '')
                  onField('categoria', '')
                  onField('descripcion', '')
                  onField('marca', '')
                  onField('referenciaModelo', '')
                  onField('dimensiones', '')
                }}
                title="Quitar producto del catálogo"
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#94a3b8',
                  padding: '2px 4px',
                  flexShrink: 0,
                  borderRadius: '6px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                ✕
              </button>
            </div>
          )}
        </Field>

        <Field label="Categoría">
          <input className="sol-input" value={p.categoria}
            onChange={e => onField('categoria', e.target.value)} />
        </Field>
      </div>

      <Field label="Descripción del Producto">
        <textarea
          className="sol-textarea"
          rows={4}
          placeholder="Incluye características técnicas, materiales, especificaciones relevantes…"
          value={p.descripcion}
          onChange={e => onField('descripcion', e.target.value)}
        />
      </Field>

      <div className="sol-grid-3">
        <Field label="Marca / Proveedor">
          <input className="sol-input" value={p.marca}
            onChange={e => onField('marca', e.target.value)} />
        </Field>
        <Field label="Referencia / Modelo">
          <input className="sol-input" value={p.referenciaModelo}
            onChange={e => onField('referenciaModelo', e.target.value)} />
        </Field>
        <Field label="País de Origen">
          <input className="sol-input" value={p.paisOrigen}
            onChange={e => onField('paisOrigen', e.target.value)} />
        </Field>
      </div>

      <div className="sol-grid-2">
        <Field label="Dimensiones / Medidas">
          <input className="sol-input" value={p.dimensiones}
            onChange={e => onField('dimensiones', e.target.value)} />
        </Field>
        <Field label="Empaque">
          <input className="sol-input" value={p.empaque}
            onChange={e => onField('empaque', e.target.value)} />
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
            onChange={val => { onField('tipoNecesidad', val); touch(`p${i}_tipo`); }}
          />
          {p.tipoNecesidad === 'otro' && (
            <input className="sol-input" style={{ marginTop: 8 }}
              placeholder="Especifique…"
              value={p.tipoNecesidadOtro}
              onChange={e => onField('tipoNecesidadOtro', e.target.value)} />
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
            onChange={val => { onField('prioridad', val); touch(`p${i}_prio`); }}
          />
        </Field>
      </div>

      <div className="sol-grid-2">
        <Field label="Frecuencia requerida">
          <input className="sol-input" value={p.frecuenciaRequerida}
            onChange={e => onField('frecuenciaRequerida', e.target.value)} />
        </Field>
        <Field label="Cantidad referencial">
          <input className="sol-input" value={p.cantidadReferencial}
            onChange={e => onField('cantidadReferencial', e.target.value)} />
        </Field>
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
      cedulaRif:             '',
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
  // lookup de cédula/RIF
  // null | 'loading' | { found: true, cliente: {...} } | { found: false }
  const [clienteLookup, setClienteLookup] = useState(null);
  const lookupTimer = useRef(null);

  const searchParams = useSearchParams();

  // ── Carga de productos desde el catálogo ────────────────────────────────────
  useEffect(() => {
    const fromCatalog = searchParams.get('fromCatalog')
    if (fromCatalog !== 'true') return

    const raw = sessionStorage.getItem('catalogProducts')
    if (!raw) return

    try {
      const products = JSON.parse(raw)
      const mapped = products.map(p => ({
        nombreProducto:    p.nombre ?? '',
        categoria:         p.categoria ?? p.rubro ?? '',
        descripcion:       buildDescFromCatalog(p),
        dimensiones:       p.variantes?.[0]?.medidas ?? '',
        empaque:           '',
        marca:             p.proveedor ?? '',
        referenciaModelo:  p.variantes?.[0]?.codigo ?? '',
        paisOrigen:        p.supplier?.country ?? '',
        tipoNecesidad:     '',
        tipoNecesidadOtro: '',
        frecuenciaRequerida:  '',
        cantidadReferencial:  '',
        prioridad:         '',
      }))
      setForm(prev => ({ ...prev, productosCliente: mapped }))
      sessionStorage.removeItem('catalogProducts')
    } catch { /* ignore */ }
  }, [])

  // ── Lookup de Cédula/RIF con debounce ─────────────────────────────────────
  useEffect(() => {
    const raw = form.cliente.cedulaRif?.trim() ?? '';
    if (!raw) { setClienteLookup(null); return; }

    clearTimeout(lookupTimer.current);
    setClienteLookup('loading');

    lookupTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/clientes?cedula=${encodeURIComponent(raw)}`);
        if (!res.ok) { setClienteLookup({ found: false }); return; }
        const data = await res.json();

        if (data.cliente) {
          const c = data.cliente;
          // Auto-fill campos del cliente
          setForm(prev => ({
            ...prev,
            cliente: {
              ...prev.cliente,
              razonSocial:           c.razonSocial           || prev.cliente.razonSocial,
              ciudad:                c.ciudad                || prev.cliente.ciudad,
              direccion:             c.direccion             || prev.cliente.direccion,
              sectorIndustria:       c.sectorIndustria       || prev.cliente.sectorIndustria,
              canalComercializacion: c.canalComercializacion || prev.cliente.canalComercializacion,
            },
            // Auto-fill contacto principal desde la DB del cliente
            contactos: prev.contactos.map((ct, i) => {
              if (i !== 0) return ct;
              return {
                ...ct,
                nombre:   c.contactoNombre   || ct.nombre,
                cargo:    c.contactoCargo    || ct.cargo,
                telefono: c.contactoTelefono || ct.telefono,
                email:    c.contactoEmail    || ct.email,
              };
            }),
          }));
          setClienteLookup({ found: true, cliente: data.cliente });
        } else {
          setClienteLookup({ found: false });
        }
      } catch {
        setClienteLookup({ found: false });
      }
    }, 400);

    return () => clearTimeout(lookupTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cliente.cedulaRif]);

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

          {/* Cédula / RIF + Razón Social en la misma fila */}
          <div className="sol-grid-3">
            <Field label="Cédula / RIF del Cliente">
              <div style={{ position: 'relative' }}>
                <input
                  className="sol-input"
                  placeholder="V-12345678 · J-123456789"
                  value={form.cliente.cedulaRif}
                  onChange={e => {
                    setNested('cliente', 'cedulaRif', e.target.value);
                    setClienteLookup(null);
                  }}
                  style={{ paddingRight: clienteLookup === 'loading' ? '32px' : undefined }}
                />
                {clienteLookup === 'loading' && (
                  <span style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '13px', color: '#94a3b8',
                  }}>⏳</span>
                )}
              </div>
              {clienteLookup?.found === true && (
                <div style={{
                  marginTop: '6px', padding: '6px 10px', borderRadius: '6px',
                  background: '#f0fdf4', border: '1px solid #86efac',
                  fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span>✓</span>
                  <span>
                    Cliente registrado ·{' '}
                    {clienteLookup.cliente._count?.solicitudes ?? 0} solicitud(es) previa(s) — campos completados
                  </span>
                </div>
              )}
              {clienteLookup?.found === false && form.cliente.cedulaRif.trim() && (
                <div style={{
                  marginTop: '6px', padding: '6px 10px', borderRadius: '6px',
                  background: '#eff6ff', border: '1px solid #93c5fd',
                  fontSize: '12px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span>🆕</span>
                  <span>Cliente nuevo — se registrará automáticamente al guardar</span>
                </div>
              )}
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

          {/* Segunda fila: Fecha */}
          <div className="sol-grid-3">
            <Field label="Fecha de la Reunión">
              <div className="sol-date-row">
                <input className="sol-input sol-input-xs" value={form.fechaReunion.dd} readOnly />
                <span className="sol-date-sep">/</span>
                <input className="sol-input sol-input-xs" value={form.fechaReunion.mm} readOnly />
                <span className="sol-date-sep">/</span>
                <input className="sol-input sol-input-sm" value={form.fechaReunion.aaaa} readOnly />
              </div>
              <span className="sol-date-hint">Fecha actual (automática)</span>
            </Field>
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
            <ProductoRow
              key={i}
              index={i}
              p={p}
              onField={(k, v) => setArrNested('productosCliente', i, k, v)}
              onRemove={() => removeProducto(i)}
              canRemove={form.productosCliente.length > 1}
              touched={touched}
              touch={touch}
            />
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
