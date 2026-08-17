'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const INCOTERMS       = ['FOB', 'CIF', 'EXW', 'FCA', 'DDP', 'OTHER'];
const PAYMENT_METHODS = ['T/T', 'Alibaba Trade Assurance', 'L/C', 'OTHER'];
const PRODUCTION_STARTS = ['DATE', 'RECEIPT OF ADVANCE PAYMENT', 'APPROVAL OF SPECIFICATIONS'];
const WARRANTY_STARTS   = ['DATE OF SHIPMENT', 'DATE OF ARRIVAL', 'DATE OF INSTALLATION'];
const DELAY_PERIODS     = ['per week', 'per day'];
const NC_TERRITORIES    = ['COUNTRY', 'REGION', 'WORLDWIDE'];
const ARB_LANGUAGES     = ['English', 'Chinese', 'OTHER'];
const EXECUTED_IN       = ['EN', 'CN', 'EN+CN'];
const CONTROLLING_LANG  = ['EN', 'CN'];
const INSPECTION_STANDARDS = ['AQL', '100% INSPECTION', 'TECHNICAL TEST', 'OTHER'];
const INSPECTION_CHECKLIST_OPTS = [
  'quantity', 'model', 'dimensions', 'materials', 'appearance', 'functionality',
  'performance', 'accessories', 'packaging', 'labels', 'documentation', 'other',
];
const ANNEX_D_DOCS = [
  'Commercial Invoice', 'Packing List', 'Bill of Lading/Sea Waybill',
  'Certificate of Origin', 'Certificate of Conformity', 'Test Report',
  'Warranty Certificate', 'Technical Datasheet', 'User Manual',
  'MSDS/SDS', 'UN38.3', 'Export Documentation', 'Inspection Certificate',
];
const FLETE_OPCIONES = [
  { value: 'porcentaje', label: 'Flete incluido en los porcentajes' },
  { value: 'final',      label: 'Flete pagado al finalizar' },
];

const now = new Date();
const HOY = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear())}`;

const defaultPartida = () => ({ producto: '', especificacion: '', cantidad: '', precioUnitario: '', total: '' });
const defaultPago    = () => ({ concepto: '', porcentaje: '', monto: '' });

// ─── PRIMITIVAS UI (patrón solicitudes/nueva) ─────────────────────────────────
function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>
      {children}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = 'text', rows }) {
  const base = {
    width: '100%', boxSizing: 'border-box',
    border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, color: '#1e293b',
    background: '#fff', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color .15s',
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

function Chips({ options, value, onChange, multi, values }) {
  if (multi) {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map(op => {
          const active = (values || []).includes(op);
          return (
            <button
              key={op}
              type="button"
              onClick={() => onChange(active ? (values || []).filter(v => v !== op) : [...(values || []), op])}
              style={{
                padding: '7px 16px',
                border: `1px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
                borderRadius: 8,
                background: active ? '#3b82f6' : '#fff',
                color: active ? '#fff' : '#64748b',
                cursor: 'pointer',
                fontSize: 12,
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

function SectionCard({ n, title, children, accent = '#3b82f6' }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    }}>
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
              fontSize: 11, fontWeight: 700, background: accent, color: '#fff',
              flexShrink: 0,
            }}>{n}</span>
          )}
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        </div>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

// Botones de fila dinámica (✕ y + Agregar)
function RowRemoveBtn({ onClick, label = '✕' }) {
  return (
    <button type="button" onClick={onClick} title="Eliminar fila" style={{
      width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca',
      background: '#fff', color: '#dc2626', cursor: 'pointer',
      fontSize: 13, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{label}</button>
  );
}

function AddRowBtn({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{
      marginTop: 10, padding: '7px 16px', border: '1px dashed #cbd5e1', borderRadius: 8,
      background: '#fff', color: '#2563eb', cursor: 'pointer',
      fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
    }}>{children}</button>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function ContratoForm({ contrato, reportes = [], clientes = [], siguienteNumero }) {
  const router = useRouter();
  const isEdit = Boolean(contrato);

  // Entidades vinculadas al contrato: prellenan Notices y Signatures al editar
  // contratos cuyos campos aún están vacíos.
  const clienteVinculado = clientes.find(c => c.id === contrato?.buyerClientId);
  const reporteVinculado = reportes.find(r => r.id === contrato?.verificacionId);

  const [form, setForm] = useState({
    fecha: contrato?.fecha ?? HOY,
    numero: contrato?.numero ?? '',

    buyerClientId: contrato?.buyerClientId ?? '',
    buyerLegalName: contrato?.buyerLegalName ?? '',
    buyerTradeName: contrato?.buyerTradeName ?? '',
    buyerAddress: contrato?.buyerAddress ?? '',
    buyerCountry: contrato?.buyerCountry ?? 'Venezuela',
    buyerTaxId: contrato?.buyerTaxId ?? '',
    buyerRepresentative: contrato?.buyerRepresentative ?? '',
    buyerPosition: contrato?.buyerPosition ?? '',
    buyerEmail: contrato?.buyerEmail ?? '',

    verificacionId: contrato?.verificacionId ?? '',
    supplierLegalName: contrato?.supplierLegalName ?? '',
    supplierTradeName: contrato?.supplierTradeName ?? '',
    supplierAddress: contrato?.supplierAddress ?? '',
    supplierCountry: contrato?.supplierCountry ?? "People's Republic of China",
    supplierUscc: contrato?.supplierUscc ?? '',
    supplierLegalRepresentative: contrato?.supplierLegalRepresentative ?? '',
    supplierPosition: contrato?.supplierPosition ?? '',
    supplierEmail: contrato?.supplierEmail ?? '',

    totalContractValue: contrato?.totalContractValue ?? '',
    currency: contrato?.currency ?? 'USD',
    incoterm: contrato?.incoterm ?? 'FOB',
    incotermOther: contrato?.incotermOther ?? '',
    namedPlace: contrato?.namedPlace ?? '',

    paymentMethod: contrato?.paymentMethod ?? 'T/T',
    paymentMethodOther: contrato?.paymentMethodOther ?? '',
    fletePago: contrato?.fletePago ?? 'porcentaje',

    productionDays: contrato?.productionDays ?? '',
    productionStart: contrato?.productionStart ?? 'RECEIPT OF ADVANCE PAYMENT',
    productionStartDate: contrato?.productionStartDate ?? '',
    estimatedReadyToShipDate: contrato?.estimatedReadyToShipDate ?? '',

    warrantyMonths: contrato?.warrantyMonths ?? '',
    warrantyStart: contrato?.warrantyStart ?? 'DATE OF SHIPMENT',
    warrantyResponseDays: contrato?.warrantyResponseDays ?? '',
    warrantyCorrectiveDays: contrato?.warrantyCorrectiveDays ?? '',

    delayPercent: contrato?.delayPercent ?? '',
    delayPeriod: contrato?.delayPeriod ?? 'per week',
    delayCapPercent: contrato?.delayCapPercent ?? '',
    delayTerminationDays: contrato?.delayTerminationDays ?? '',

    ncDurationYears: contrato?.ncDurationYears ?? '',
    ncTerritory: contrato?.ncTerritory ?? 'WORLDWIDE',

    governingLaw: contrato?.governingLaw ?? '',
    negotiationDays: contrato?.negotiationDays ?? '30',
    arbitrationInstitution: contrato?.arbitrationInstitution ?? '',
    arbitrationSeat: contrato?.arbitrationSeat ?? '',
    arbitrationLanguage: contrato?.arbitrationLanguage ?? 'English',
    arbitrationLanguageOther: contrato?.arbitrationLanguageOther ?? '',
    executedIn: contrato?.executedIn ?? 'EN',
    controllingLanguage: contrato?.controllingLanguage ?? 'EN',

    buyerNoticeName: contrato?.buyerNoticeName ?? clienteVinculado?.contactoNombre ?? clienteVinculado?.representanteLegal ?? '',
    buyerNoticeEmail: contrato?.buyerNoticeEmail ?? clienteVinculado?.contactoEmail ?? '',
    buyerNoticeAddress: contrato?.buyerNoticeAddress ?? clienteVinculado?.direccion ?? '',
    supplierNoticeName: contrato?.supplierNoticeName ?? reporteVinculado?.legalRepresentative ?? '',
    supplierNoticeEmail: contrato?.supplierNoticeEmail ?? '',
    supplierNoticeAddress: contrato?.supplierNoticeAddress ?? reporteVinculado?.domicile ?? '',

    buyerSigner: contrato?.buyerSigner ?? clienteVinculado?.representanteLegal ?? clienteVinculado?.contactoNombre ?? '',
    buyerSignerPosition: contrato?.buyerSignerPosition ?? clienteVinculado?.representanteCargo ?? clienteVinculado?.contactoCargo ?? '',
    buyerSignDate: contrato?.buyerSignDate ?? '',
    supplierSigner: contrato?.supplierSigner ?? reporteVinculado?.legalRepresentative ?? '',
    supplierSignerPosition: contrato?.supplierSignerPosition ?? '',
    supplierSignDate: contrato?.supplierSignDate ?? '',

    inspectionCompany: contrato?.inspectionCompany ?? '',
    inspectionLocation: contrato?.inspectionLocation ?? '',
    inspectionDate: contrato?.inspectionDate ?? '',
    inspectionChecklist: contrato?.inspectionChecklist ?? [],
    inspectionStandard: contrato?.inspectionStandard ?? 'AQL',
    inspectionStandardOther: contrato?.inspectionStandardOther ?? '',
    annexDDocs: contrato?.annexDDocs ?? [],
    annexDOther: contrato?.annexDOther ?? '',
  });

  // El flete vive como partida aparte (obligatoria, siempre al final de la lista)
  const fleteInicial = contrato?.partidas?.find(p => p.esFlete);
  const partidasIniciales = contrato?.partidas?.length
    ? contrato.partidas.filter(p => !p.esFlete).map(p => ({
        producto: p.producto, especificacion: p.especificacion ?? '',
        cantidad: p.cantidad, precioUnitario: p.precioUnitario, total: p.total ?? '',
      }))
    : null;

  const [partidas, setPartidas] = useState(partidasIniciales?.length ? partidasIniciales : [defaultPartida()]);
  const [flete, setFlete] = useState({
    producto: 'Flete',
    especificacion: fleteInicial?.especificacion ?? '',
    cantidad: '1',
    precioUnitario: fleteInicial?.precioUnitario ?? '',
    total: fleteInicial?.total ?? '',
  });

  const [pagos, setPagos] = useState(
    contrato?.pagos?.length ? contrato.pagos.map(pg => ({
      concepto: pg.concepto, porcentaje: pg.porcentaje, monto: pg.monto,
    })) : [
      { concepto: 'Advance', porcentaje: '', monto: '' },
      { concepto: 'Second', porcentaje: '', monto: '' },
      { concepto: 'Final', porcentaje: '', monto: '' },
    ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ── helpers generales ─────────────────────────────────────────────────────
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  // ── helpers de partidas / pagos ────────────────────────────────────────────
  const setPartida = (i, k, v) => setPartidas(p => { const a = [...p]; a[i] = { ...a[i], [k]: v }; return a; });
  const addPartida = () => setPartidas(p => [...p, defaultPartida()]);
  const removePartida = (i) => setPartidas(p => p.length > 1 ? [...p.slice(0, i), ...p.slice(i + 1)] : p);
  const setPago = (i, k, v) => setPagos(p => { const a = [...p]; a[i] = { ...a[i], [k]: v }; return a; });
  const addPago = () => setPagos(p => [...p, defaultPago()]);
  const removePago = (i) => setPagos(p => p.length > 1 ? [...p.slice(0, i), ...p.slice(i + 1)] : p);

  // ── autofill desde el Informe de Verificación ──────────────────────────────
  const handleReporteSelect = (verificacionId) => {
    const rep = reportes.find(r => r.id === verificacionId);
    setForm(p => ({
      ...p,
      verificacionId: verificacionId || null,
      ...(rep ? {
        supplierLegalName: rep.nombreEmpresa ?? '',
        supplierTradeName: rep.nombreEmpresaZh ?? '',
        supplierUscc: rep.codigoCreditoSocial ?? '',
        supplierLegalRepresentative: rep.legalRepresentative ?? '',
        supplierAddress: rep.domicile ?? '',
        supplierCountry: "People's Republic of China",
        // Notices y firmas del proveedor desde el informe de verificación
        // (conserva lo escrito a mano cuando el informe no tiene el dato)
        supplierNoticeName: rep.legalRepresentative || p.supplierNoticeName,
        supplierNoticeAddress: rep.domicile || p.supplierNoticeAddress,
        supplierSigner: rep.legalRepresentative || p.supplierSigner,
      } : {}),
    }));
  };

  // ── autofill del Buyer desde la Base de Clientes ────────────────────────────
  const fillFromCliente = (c) => setForm(p => ({
    ...p,
    buyerClientId: c.id ?? '',
    buyerLegalName: c.razonSocial ?? '',
    buyerTradeName: c.nombreComercial ?? '',
    buyerAddress: c.direccion ?? '',
    buyerCountry: c.pais || 'Venezuela',
    buyerTaxId: c.cedulaRif ?? '',
    buyerRepresentative: c.representanteLegal ?? c.contactoNombre ?? '',
    buyerPosition: c.representanteCargo ?? c.contactoCargo ?? '',
    buyerEmail: c.contactoEmail ?? '',
    // Notices y firmas del comprador desde la base de clientes
    // (conserva lo escrito a mano cuando la base no tiene el dato)
    buyerNoticeName: c.contactoNombre || c.representanteLegal || p.buyerNoticeName,
    buyerNoticeEmail: c.contactoEmail || p.buyerNoticeEmail,
    buyerNoticeAddress: c.direccion || p.buyerNoticeAddress,
    buyerSigner: c.representanteLegal || c.contactoNombre || p.buyerSigner,
    buyerSignerPosition: c.representanteCargo || c.contactoCargo || p.buyerSignerPosition,
  }));

  const handleClienteSelect = (id) => {
    const c = clientes.find(x => x.id === id);
    if (c) fillFromCliente(c);
  };

  // Coincidencia EXACTA de TAX ID contra la base de clientes (trim + mayúsculas)
  const clienteMatch = clientes.find(c =>
    String(c.cedulaRif ?? '').trim().toLowerCase() === String(form.buyerTaxId ?? '').trim().toLowerCase()
  );
  const handleBuyerTaxId = (v) => {
    const t = String(v).trim().toLowerCase();
    const c = t ? clientes.find(x => String(x.cedulaRif ?? '').trim().toLowerCase() === t) : null;
    if (c) fillFromCliente(c);
    else setForm(p => ({ ...p, buyerTaxId: v, buyerClientId: '' }));
  };

  // ── totales ────────────────────────────────────────────────────────────────
  const partidaTotal = (pt) => {
    const c = parseFloat(String(pt.cantidad).replace(',', '.'));
    const u = parseFloat(String(pt.precioUnitario).replace(/[^0-9.-]/g, ''));
    if (isNaN(c) || isNaN(u)) return '';
    return (c * u).toFixed(2);
  };
  const sumaTotal = partidas.reduce((acc, pt) => {
    const t = parseFloat(partidaTotal(pt));
    return acc + (isNaN(t) ? 0 : t);
  }, 0);
  // Flete: ítem adicional obligatorio (cantidad fija 1 → monto = precio unitario)
  const fleteMonto = (() => {
    const u = parseFloat(String(flete.precioUnitario).replace(/[^0-9.-]/g, ''));
    return isNaN(u) ? 0 : u;
  })();
  const totalConFlete = sumaTotal + fleteMonto;

  // Monto de cada pago = % × base (subtotal sin flete si el flete se paga al finalizar)
  // En modo 'final', la última cuota suma el flete automáticamente.
  const pagoMonto = (pg, i) => {
    const pct = parseFloat(String(pg.porcentaje).replace(',', '.'));
    if (isNaN(pct)) return '';
    const base = form.fletePago === 'final' ? sumaTotal : totalConFlete;
    let monto = (base * pct) / 100;
    if (form.fletePago === 'final' && i === pagos.length - 1) monto += fleteMonto;
    return monto.toFixed(2);
  };

  // ── acciones ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.fecha || !form.buyerLegalName || !form.supplierLegalName) {
      alert('Faltan campos requeridos: Fecha, Comprador (legal name) y Proveedor (legal name).');
      return;
    }
    if (fleteMonto <= 0) {
      alert('El flete es obligatorio: completa el precio unitario del flete en Products.');
      return;
    }
    setSaving(true); setError(null);
    try {
      const totalFinal = totalConFlete ? totalConFlete.toFixed(2) : form.totalContractValue;
      // El flete siempre va como última partida (ítem adicional obligatorio)
      const partidasPayload = partidas
        .filter(pt => pt.producto || pt.especificacion || pt.cantidad || pt.precioUnitario)
        .map((pt, i) => ({
          ...pt,
          total: pt.total || partidaTotal(pt),
          sortOrder: i,
        }));
      partidasPayload.push({
        producto: 'Flete',
        especificacion: flete.especificacion || null,
        cantidad: '1',
        precioUnitario: flete.precioUnitario,
        total: fleteMonto.toFixed(2),
        esFlete: true,
        sortOrder: partidasPayload.length,
      });
      const body = {
        ...form,
        totalContractValue: totalFinal,
        partidas: partidasPayload,
        pagos: pagos
          .filter(pg => pg.concepto || pg.porcentaje)
          .map((pg, i) => {
            // Monto recalculado con la regla de flete activa (fallback al guardado)
            return { ...pg, monto: pagoMonto(pg, i) || (pg.monto || ''), sortOrder: i };
          }),
      };
      const res = await fetch(
        isEdit ? `/api/admin/contratos/${contrato.id}` : '/api/admin/contratos',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || 'Error al guardar');
      }
      router.push('/admin/contratos');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleEmitir = async (action) => {
    if (action === 'emitir' && !confirm('¿Emitir el documento? El contrato pasará a estado Finalizado.')) return;
    if (action === 'reabrir' && !confirm('¿Reabrir el documento? El contrato volverá a estado Borrador.')) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/admin/contratos/${contrato.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Error al cambiar el estado');
      router.refresh();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const btnBase = {
    fontSize: 13, padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 9,
    color: '#475569', background: '#fff', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
  };
  const btnPrimary = {
    ...btnBase, border: 'none', background: '#0a1628', color: '#fff', fontWeight: 700, padding: '8px 22px',
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, fontFamily: 'inherit' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/admin/contratos" style={{
          fontSize: 12, color: '#94a3b8', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12,
        }}>
          ← Contratos de Compra
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {isEdit ? 'Editar Contrato de Compra' : 'Nuevo Contrato de Compra'}
            </h1>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>International Purchase Agreement · Proveedores de China</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {isEdit && (
              <a href={`/api/admin/contratos/${contrato.id}/pdf`} target="_blank" rel="noreferrer"
                style={{ ...btnBase, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                Ver PDF
              </a>
            )}
            {isEdit && contrato.status === 'borrador' && (
              <button type="button" onClick={() => handleEmitir('emitir')} disabled={saving} style={btnBase}>
                {saving ? '...' : 'Emitir documento'}
              </button>
            )}
            {isEdit && contrato.status === 'finalizado' && (
              <button type="button" onClick={() => handleEmitir('reabrir')} disabled={saving} style={btnBase}>
                {saving ? '...' : 'Reabrir'}
              </button>
            )}
            <button type="button" onClick={() => router.back()} style={btnBase}>
              Cancelar
            </button>
            <button type="button" onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? .7 : 1 }}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
        {isEdit && (
          <div style={{ marginTop: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
              background: contrato.status === 'finalizado' ? '#dcfce7' : '#f1f5f9',
              color: contrato.status === 'finalizado' ? '#166534' : '#64748b',
              border: `1px solid ${contrato.status === 'finalizado' ? '#86efac' : '#e2e8f0'}`,
            }}>
              {contrato.status === 'finalizado' ? 'Finalizado' : 'Borrador'}
            </span>
          </div>
        )}
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

      {/* ── FORM SECTIONS ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 1. INFORMACIÓN GENERAL */}
        <SectionCard n="1" title="Información General">
          <EditGrid>
            <FieldWrap label="Fecha (dd/mm/aaaa)">
              <Inp value={form.fecha} onChange={v => set('fecha', v)} placeholder="12/08/2026" />
            </FieldWrap>
            <FieldWrap label="Número de contrato (automático)">
              <input
                value={isEdit ? (form.numero || '—') : (siguienteNumero || 'Se asignará al guardar')}
                readOnly
                tabIndex={-1}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '8px 12px', fontSize: 13, color: '#64748b',
                  background: '#f8fafc', fontFamily: 'inherit', outline: 'none',
                }}
              />
            </FieldWrap>
          </EditGrid>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8' }}>
            El número se asigna automáticamente de forma secuencial (DGL-año-NNN) según los contratos almacenados en la base de datos y no se puede editar. El valor mostrado es una vista previa; el número definitivo se asigna al guardar.
          </p>
        </SectionCard>

        {/* 2. INFORME DE VERIFICACIÓN */}
        <SectionCard n="2" title="Proveedor del Informe de Verificación (autocompletar)">
          <EditGrid>
            <FieldWrap label="Seleccionar informe de verificación" span2>
              <select
                value={form.verificacionId ?? ''}
                onChange={e => handleReporteSelect(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '8px 12px', fontSize: 13, color: '#1e293b',
                  background: '#fff', outline: 'none', fontFamily: 'inherit',
                }}
              >
                <option value="">— Sin vínculo / datos manuales —</option>
                {reportes.map(r => (
                  <option key={r.id} value={r.id}>{r.nombreEmpresa}{r.nombreEmpresaZh ? ` · ${r.nombreEmpresaZh}` : ''}</option>
                ))}
              </select>
            </FieldWrap>
          </EditGrid>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8' }}>
            Al elegir un informe de verificación se rellenan automáticamente: legal name (nombre en inglés), trade name (nombre en chino), USCC, legal representative y dirección registrada. El email y la posición del representante deben completarse a mano.
          </p>
        </SectionCard>

        {/* 3. BUYER */}
        <SectionCard n="3" title="Parties — Buyer (Comprador)">
          <EditGrid>
            <FieldWrap label="Cliente de la Base de Clientes (autofill)" span2>
              <select
                value={form.buyerClientId ?? ''}
                onChange={e => handleClienteSelect(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '8px 12px', fontSize: 13, color: '#1e293b',
                  background: '#fff', outline: 'none', fontFamily: 'inherit',
                }}
              >
                <option value="">— Sin vínculo / datos manuales —</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.razonSocial} · {c.cedulaRif}</option>
                ))}
              </select>
            </FieldWrap>
            <FieldWrap label="Legal Name *">
              <Inp value={form.buyerLegalName} onChange={v => set('buyerLegalName', v)} placeholder="Razón social del comprador" />
            </FieldWrap>
            <FieldWrap label="Trade Name">
              <Inp value={form.buyerTradeName} onChange={v => set('buyerTradeName', v)} placeholder="Nombre comercial" />
            </FieldWrap>
            <FieldWrap label="Address">
              <Inp value={form.buyerAddress} onChange={v => set('buyerAddress', v)} placeholder="Dirección completa" />
            </FieldWrap>
            <FieldWrap label="Country">
              <Inp value={form.buyerCountry} onChange={v => set('buyerCountry', v)} placeholder="Venezuela" />
            </FieldWrap>
            <FieldWrap label="Registration / Tax ID">
              <Inp value={form.buyerTaxId} onChange={v => handleBuyerTaxId(v)} placeholder="RIF / Tax ID (coincidencia exacta con la base)" />
            </FieldWrap>
            <FieldWrap label="Representative">
              <Inp value={form.buyerRepresentative} onChange={v => set('buyerRepresentative', v)} placeholder="Nombre del representante" />
            </FieldWrap>
            <FieldWrap label="Position">
              <Inp value={form.buyerPosition} onChange={v => set('buyerPosition', v)} placeholder="Cargo" />
            </FieldWrap>
            <FieldWrap label="Email">
              <Inp value={form.buyerEmail} onChange={v => set('buyerEmail', v)} type="email" placeholder="correo@ejemplo.com" />
            </FieldWrap>
          </EditGrid>
          {String(form.buyerTaxId ?? '').trim() && (
            <p style={{
              margin: '12px 0 0', fontSize: 12, fontWeight: 600, padding: '8px 12px', borderRadius: 8,
              background: clienteMatch ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${clienteMatch ? '#86efac' : '#fde68a'}`,
              color: clienteMatch ? '#166534' : '#92400e',
            }}>
              {clienteMatch
                ? `✓ Coincidencia exacta de TAX ID: ${clienteMatch.razonSocial}. Datos del comprador completados desde la Base de Clientes.`
                : 'Sin coincidencia exacta en la Base de Clientes: los datos del comprador quedan manuales.'}
            </p>
          )}
        </SectionCard>

        {/* 4. SUPPLIER */}
        <SectionCard n="4" title="Parties — Supplier (Proveedor)">
          <EditGrid>
            <FieldWrap label="Legal Name *">
              <Inp value={form.supplierLegalName} onChange={v => set('supplierLegalName', v)} placeholder="Razón social del proveedor" />
            </FieldWrap>
            <FieldWrap label="Trade Name">
              <Inp value={form.supplierTradeName} onChange={v => set('supplierTradeName', v)} placeholder="Nombre comercial" />
            </FieldWrap>
            <FieldWrap label="Registered Address">
              <Inp value={form.supplierAddress} onChange={v => set('supplierAddress', v)} placeholder="Dirección registrada" />
            </FieldWrap>
            <FieldWrap label="Country">
              <Inp value={form.supplierCountry} onChange={v => set('supplierCountry', v)} />
            </FieldWrap>
            <FieldWrap label="Unified Social Credit Code (USCC)">
              <Inp value={form.supplierUscc} onChange={v => set('supplierUscc', v)} placeholder="Código de crédito social unificado" />
            </FieldWrap>
            <FieldWrap label="Legal Representative">
              <Inp value={form.supplierLegalRepresentative} onChange={v => set('supplierLegalRepresentative', v)} placeholder="Nombre del representante legal" />
            </FieldWrap>
            <FieldWrap label="Position">
              <Inp value={form.supplierPosition} onChange={v => set('supplierPosition', v)} placeholder="Cargo" />
            </FieldWrap>
            <FieldWrap label="Email">
              <Inp value={form.supplierEmail} onChange={v => set('supplierEmail', v)} type="email" placeholder="correo@ejemplo.com" />
            </FieldWrap>
          </EditGrid>
        </SectionCard>

        {/* 5. PRODUCTS */}
        <SectionCard n="5" title="Products (Productos)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 90px 130px 130px 32px', gap: 8,
              padding: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '.07em',
            }}>
              <span>Product / Model</span>
              <span>Specification</span>
              <span>Quantity</span>
              <span>Unit Price (USD)</span>
              <span>Total (USD)</span>
              <span />
            </div>
            {partidas.map((pt, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 90px 130px 130px 32px', gap: 8, alignItems: 'center',
              }}>
                <Inp value={pt.producto} onChange={v => setPartida(i, 'producto', v)} placeholder="Producto / Modelo" />
                <Inp value={pt.especificacion} onChange={v => setPartida(i, 'especificacion', v)} placeholder="Especificación" />
                <Inp value={pt.cantidad} onChange={v => setPartida(i, 'cantidad', v)} placeholder="Cant." />
                <Inp value={pt.precioUnitario} onChange={v => setPartida(i, 'precioUnitario', v)} placeholder="0.00" />
                <input
                  value={partidaTotal(pt)}
                  readOnly
                  tabIndex={-1}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: '1px solid #e2e8f0', borderRadius: 8,
                    padding: '8px 12px', fontSize: 13, color: '#64748b',
                    background: '#f8fafc', fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <RowRemoveBtn onClick={() => removePartida(i)} />
              </div>
            ))}

            {/* Flete: ítem adicional obligatorio, siempre al final de la lista */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 90px 130px 130px 32px', gap: 8, alignItems: 'center',
              background: '#eff6ff', border: '1px dashed #93c5fd', borderRadius: 8, padding: 6,
            }}>
              <input
                value="Flete"
                readOnly
                tabIndex={-1}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '8px 12px', fontSize: 13, fontWeight: 700, color: '#1d4ed8',
                  background: '#fff', fontFamily: 'inherit', outline: 'none',
                }}
              />
              <Inp value={flete.especificacion} onChange={v => setFlete(f => ({ ...f, especificacion: v }))} placeholder="Ej: FOB Shanghai – La Guaira" />
              <input
                value="1"
                readOnly
                tabIndex={-1}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '8px 12px', fontSize: 13, color: '#64748b',
                  background: '#f8fafc', fontFamily: 'inherit', outline: 'none',
                }}
              />
              <Inp value={flete.precioUnitario} onChange={v => setFlete(f => ({ ...f, precioUnitario: v }))} placeholder="0.00 *" />
              <input
                value={fleteMonto ? fleteMonto.toFixed(2) : ''}
                readOnly
                tabIndex={-1}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '8px 12px', fontSize: 13, color: '#64748b',
                  background: '#f8fafc', fontFamily: 'inherit', outline: 'none',
                }}
              />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', textAlign: 'center' }} title="Ítem obligatorio — no se puede eliminar">🔒</span>
            </div>
          </div>
          <AddRowBtn onClick={addPartida}>+ Agregar partida</AddRowBtn>
          <div style={{
            marginTop: 14, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8,
            padding: '10px 14px', background: '#f8fafc', borderRadius: 10,
          }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Subtotal productos: {sumaTotal ? `${sumaTotal.toFixed(2)} USD` : '—'} · Flete: {fleteMonto ? `${fleteMonto.toFixed(2)} USD` : '—'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Total Contract Value:</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#2563eb' }}>
              {totalConFlete ? `${totalConFlete.toFixed(2)} USD` : '—'}
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94a3b8' }}>
            El total se calcula automáticamente (Quantity × Unit Price) y se guarda en el contrato. El <b>Flete</b> es un ítem adicional
            obligatorio: va siempre al final de la lista y su precio unitario es requerido para guardar.
          </p>
        </SectionCard>

        {/* 6. PRICE */}
        <SectionCard n="6" title="Price (Precio)">
          <EditGrid>
            <FieldWrap label="Currency">
              <Inp value={form.currency} onChange={v => set('currency', v)} placeholder="USD" />
            </FieldWrap>
            <FieldWrap label="Named Place / Port">
              <Inp value={form.namedPlace} onChange={v => set('namedPlace', v)} placeholder="Ej: Puerto de Shanghai" />
            </FieldWrap>
            <FieldWrap label="Incoterm" span2>
              <Chips options={INCOTERMS} value={form.incoterm} onChange={v => set('incoterm', v)} />
            </FieldWrap>
            {form.incoterm === 'OTHER' && (
              <FieldWrap label="Incoterm (especificar)" span2>
                <Inp value={form.incotermOther} onChange={v => set('incotermOther', v)} placeholder="Otro Incoterm" />
              </FieldWrap>
            )}
          </EditGrid>
        </SectionCard>

        {/* 7. PAYMENT TERMS */}
        <SectionCard n="7" title="Payment Terms (Términos de Pago)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 1fr 32px', gap: 8,
              padding: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '.07em',
            }}>
              <span>Concepto</span>
              <span>%</span>
              <span>Monto (auto, USD)</span>
              <span />
            </div>
            {pagos.map((pg, i) => {
              const esUltima = form.fletePago === 'final' && i === pagos.length - 1;
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 1fr 32px', gap: 8, alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <Inp value={pg.concepto} onChange={v => setPago(i, 'concepto', v)} placeholder="Advance / Second / Final" />
                    {esUltima && fleteMonto > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#1d4ed8',
                        background: '#eff6ff', border: '1px solid #bfdbfe',
                        borderRadius: 6, padding: '3px 8px', alignSelf: 'flex-start',
                      }}>
                        + incluye flete ({fleteMonto.toFixed(2)} USD)
                      </span>
                    )}
                  </div>
                  <Inp value={pg.porcentaje} onChange={v => setPago(i, 'porcentaje', v)} placeholder="30" />
                  <input
                    value={pagoMonto(pg, i)}
                    readOnly
                    tabIndex={-1}
                    placeholder="0.00"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      border: '1px solid #e2e8f0', borderRadius: 8,
                      padding: '8px 12px', fontSize: 13, color: '#64748b',
                      background: '#f8fafc', fontFamily: 'inherit', outline: 'none',
                    }}
                  />
                  <RowRemoveBtn onClick={() => removePago(i)} />
                </div>
              );
            })}
          </div>
          <AddRowBtn onClick={addPago}>+ Agregar pago</AddRowBtn>
          <div style={{ marginTop: 14 }}>
            <FieldLabel>Flete — ¿cómo se paga? (flete: {fleteMonto ? `${fleteMonto.toFixed(2)} USD` : '—'})</FieldLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {FLETE_OPCIONES.map(op => {
                const active = form.fletePago === op.value;
                return (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => set('fletePago', op.value)}
                    style={{
                      padding: '7px 16px',
                      border: `1px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
                      borderRadius: 8,
                      background: active ? '#3b82f6' : '#fff',
                      color: active ? '#fff' : '#64748b',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                      transition: 'all .15s',
                    }}
                  >{op.label}</button>
                );
              })}
            </div>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94a3b8' }}>
            {form.fletePago === 'final'
              ? 'El flete se paga al finalizar: los porcentajes se aplican sobre el subtotal de productos y la última cuota suma el flete automáticamente.'
              : 'El flete está incluido dentro de los porcentajes: cada cuota se calcula como % × Total Contract Value (productos + flete).'}
          </p>
          <div style={{ marginTop: 14 }}>
            <FieldLabel>Method (Método)</FieldLabel>
            <Chips options={PAYMENT_METHODS} value={form.paymentMethod} onChange={v => set('paymentMethod', v)} />
          </div>
          {form.paymentMethod === 'OTHER' && (
            <div style={{ marginTop: 10 }}>
              <FieldLabel>Method (especificar)</FieldLabel>
              <Inp value={form.paymentMethodOther} onChange={v => set('paymentMethodOther', v)} placeholder="Otro método" />
            </div>
          )}
        </SectionCard>

        {/* 8. PRODUCTION AND DELIVERY */}
        <SectionCard n="8" title="Production and Delivery (Producción y Entrega)">
          <EditGrid>
            <FieldWrap label="Completion within (días calendario)">
              <Inp value={form.productionDays} onChange={v => set('productionDays', v)} placeholder="Ej: 45" />
            </FieldWrap>
            <FieldWrap label="Estimated Ready-to-Ship Date">
              <Inp value={form.estimatedReadyToShipDate} onChange={v => set('estimatedReadyToShipDate', v)} placeholder="Fecha estimada" />
            </FieldWrap>
            <FieldWrap label="Starting from (desde)" span2>
              <Chips options={PRODUCTION_STARTS} value={form.productionStart} onChange={v => set('productionStart', v)} />
            </FieldWrap>
            {form.productionStart === 'DATE' && (
              <FieldWrap label="Fecha de inicio" span2>
                <Inp value={form.productionStartDate} onChange={v => set('productionStartDate', v)} placeholder="Fecha" />
              </FieldWrap>
            )}
          </EditGrid>
        </SectionCard>

        {/* 9. WARRANTY */}
        <SectionCard n="9" title="Warranty (Garantía)">
          <EditGrid>
            <FieldWrap label="Warranty period (meses)">
              <Inp value={form.warrantyMonths} onChange={v => set('warrantyMonths', v)} placeholder="Ej: 12" />
            </FieldWrap>
            <FieldWrap label="Warranty starts from (desde)">
              <Chips options={WARRANTY_STARTS} value={form.warrantyStart} onChange={v => set('warrantyStart', v)} />
            </FieldWrap>
            <FieldWrap label="Claim: respuesta del proveedor (días hábiles)">
              <Inp value={form.warrantyResponseDays} onChange={v => set('warrantyResponseDays', v)} placeholder="Ej: 5" />
            </FieldWrap>
            <FieldWrap label="Claim: acción correctiva (días hábiles)">
              <Inp value={form.warrantyCorrectiveDays} onChange={v => set('warrantyCorrectiveDays', v)} placeholder="Ej: 15" />
            </FieldWrap>
          </EditGrid>
        </SectionCard>

        {/* 10. DELAY AND LIQUIDATED DAMAGES */}
        <SectionCard n="10" title="Delay and Liquidated Damages (Penalidades)">
          <EditGrid>
            <FieldWrap label="% sobre el valor de los bienes retrasados">
              <Inp value={form.delayPercent} onChange={v => set('delayPercent', v)} placeholder="Ej: 0.5" />
            </FieldWrap>
            <FieldWrap label="Por período">
              <Chips options={DELAY_PERIODS} value={form.delayPeriod} onChange={v => set('delayPeriod', v)} />
            </FieldWrap>
            <FieldWrap label="Tope (% del valor afectado)">
              <Inp value={form.delayCapPercent} onChange={v => set('delayCapPercent', v)} placeholder="Ej: 10" />
            </FieldWrap>
            <FieldWrap label="Terminación si el retraso supera (días)">
              <Inp value={form.delayTerminationDays} onChange={v => set('delayTerminationDays', v)} placeholder="Ej: 30" />
            </FieldWrap>
          </EditGrid>
        </SectionCard>

        {/* 11. NON-CIRCUMVENTION */}
        <SectionCard n="11" title="Non-Circumvention (No Evasión)">
          <EditGrid>
            <FieldWrap label="Duration (años)">
              <Inp value={form.ncDurationYears} onChange={v => set('ncDurationYears', v)} placeholder="Ej: 2" />
            </FieldWrap>
            <FieldWrap label="Territory">
              <Chips options={NC_TERRITORIES} value={form.ncTerritory} onChange={v => set('ncTerritory', v)} />
            </FieldWrap>
          </EditGrid>
        </SectionCard>

        {/* 12. GOVERNING LAW & DISPUTES */}
        <SectionCard n="12" title="Governing Law & Dispute Resolution (Ley y Resolución de Disputas)">
          <EditGrid>
            <FieldWrap label="Governing Law / Jurisdiction">
              <Inp value={form.governingLaw} onChange={v => set('governingLaw', v)} placeholder="Ej: Laws of the People's Republic of China" />
            </FieldWrap>
            <FieldWrap label="Negotiation days (días de negociación)">
              <Inp value={form.negotiationDays} onChange={v => set('negotiationDays', v)} placeholder="30" />
            </FieldWrap>
            <FieldWrap label="Arbitration Institution / Court">
              <Inp value={form.arbitrationInstitution} onChange={v => set('arbitrationInstitution', v)} placeholder="Ej: CIETAC" />
            </FieldWrap>
            <FieldWrap label="Seat (Sede)">
              <Inp value={form.arbitrationSeat} onChange={v => set('arbitrationSeat', v)} placeholder="Ej: Shanghai, China" />
            </FieldWrap>
            <FieldWrap label="Language" span2>
              <Chips options={ARB_LANGUAGES} value={form.arbitrationLanguage} onChange={v => set('arbitrationLanguage', v)} />
            </FieldWrap>
            {form.arbitrationLanguage === 'OTHER' && (
              <FieldWrap label="Language (especificar)" span2>
                <Inp value={form.arbitrationLanguageOther} onChange={v => set('arbitrationLanguageOther', v)} placeholder="Otro idioma" />
              </FieldWrap>
            )}
          </EditGrid>
        </SectionCard>

        {/* 13. LANGUAGE */}
        <SectionCard n="13" title="Language (Idioma del Contrato)">
          <EditGrid>
            <FieldWrap label="Executed in (Ejecutado en)">
              <Chips options={EXECUTED_IN} value={form.executedIn} onChange={v => set('executedIn', v)} />
            </FieldWrap>
            <FieldWrap label="Controlling language (Idioma de control)">
              <Chips options={CONTROLLING_LANG} value={form.controllingLanguage} onChange={v => set('controllingLanguage', v)} />
            </FieldWrap>
          </EditGrid>
        </SectionCard>

        {/* 14. NOTICES */}
        <SectionCard n="14" title="Notices (Notificaciones)">
          <EditGrid>
            <FieldWrap label="Buyer — Contact Name">
              <Inp value={form.buyerNoticeName} onChange={v => set('buyerNoticeName', v)} placeholder="Nombre" />
            </FieldWrap>
            <FieldWrap label="Supplier — Contact Name">
              <Inp value={form.supplierNoticeName} onChange={v => set('supplierNoticeName', v)} placeholder="Nombre" />
            </FieldWrap>
            <FieldWrap label="Buyer — Email">
              <Inp value={form.buyerNoticeEmail} onChange={v => set('buyerNoticeEmail', v)} type="email" placeholder="correo@ejemplo.com" />
            </FieldWrap>
            <FieldWrap label="Supplier — Email">
              <Inp value={form.supplierNoticeEmail} onChange={v => set('supplierNoticeEmail', v)} type="email" placeholder="correo@ejemplo.com" />
            </FieldWrap>
            <FieldWrap label="Buyer — Address">
              <Inp value={form.buyerNoticeAddress} onChange={v => set('buyerNoticeAddress', v)} placeholder="Dirección" />
            </FieldWrap>
            <FieldWrap label="Supplier — Address">
              <Inp value={form.supplierNoticeAddress} onChange={v => set('supplierNoticeAddress', v)} placeholder="Dirección" />
            </FieldWrap>
          </EditGrid>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8' }}>
            Los datos del comprador se autocompletan desde la Base de Clientes (contacto, email y dirección)
            y los del proveedor desde el Informe de Verificación seleccionado.
          </p>
        </SectionCard>

        {/* 15. SIGNATURES */}
        <SectionCard n="15" title="Signatures (Firmas)">
          <EditGrid>
            <FieldWrap label="Buyer — Signer">
              <Inp value={form.buyerSigner} onChange={v => set('buyerSigner', v)} placeholder="Nombre del firmante" />
            </FieldWrap>
            <FieldWrap label="Supplier — Signer">
              <Inp value={form.supplierSigner} onChange={v => set('supplierSigner', v)} placeholder="Nombre del firmante" />
            </FieldWrap>
            <FieldWrap label="Buyer — Position">
              <Inp value={form.buyerSignerPosition} onChange={v => set('buyerSignerPosition', v)} placeholder="Cargo" />
            </FieldWrap>
            <FieldWrap label="Supplier — Position">
              <Inp value={form.supplierSignerPosition} onChange={v => set('supplierSignerPosition', v)} placeholder="Cargo" />
            </FieldWrap>
            <FieldWrap label="Buyer — Date">
              <Inp value={form.buyerSignDate} onChange={v => set('buyerSignDate', v)} type="date" />
            </FieldWrap>
            <FieldWrap label="Supplier — Date">
              <Inp value={form.supplierSignDate} onChange={v => set('supplierSignDate', v)} type="date" />
            </FieldWrap>
          </EditGrid>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8' }}>
            El firmante se autocompleta con el representante legal de la Base de Clientes / Informe de Verificación.
            Al emitir el documento, las fechas de firma vacías se completan automáticamente con la fecha actual.
          </p>
        </SectionCard>

        {/* 16. ANNEX C (A y B se generan automáticamente en el PDF desde Partidas/Pagos) */}
        <SectionCard n="16" title="Annex C — Inspection and Acceptance Protocol (Protocolo de Inspección)">
          <EditGrid>
            <FieldWrap label="Inspection Company">
              <Inp value={form.inspectionCompany} onChange={v => set('inspectionCompany', v)} placeholder="Compañía de inspección" />
            </FieldWrap>
            <FieldWrap label="Location (Factory)">
              <Inp value={form.inspectionLocation} onChange={v => set('inspectionLocation', v)} placeholder="Fábrica" />
            </FieldWrap>
            <FieldWrap label="Date">
              <Inp value={form.inspectionDate} onChange={v => set('inspectionDate', v)} type="date" />
            </FieldWrap>
            <FieldWrap label="Acceptance Standard">
              <Chips options={INSPECTION_STANDARDS} value={form.inspectionStandard} onChange={v => set('inspectionStandard', v)} />
            </FieldWrap>
            {form.inspectionStandard === 'OTHER' && (
              <FieldWrap label="Acceptance Standard (especificar)">
                <Inp value={form.inspectionStandardOther} onChange={v => set('inspectionStandardOther', v)} placeholder="Otro estándar" />
              </FieldWrap>
            )}
            <FieldWrap label="Checklist (marcar los puntos a inspeccionar)" span2>
              <Chips multi options={INSPECTION_CHECKLIST_OPTS} values={form.inspectionChecklist} onChange={v => set('inspectionChecklist', v)} />
            </FieldWrap>
          </EditGrid>
        </SectionCard>

        {/* 17. ANNEX D */}
        <SectionCard n="17" title="Annex D — Shipping Documents (Documentos de Embarque)">
          <FieldWrap label="Documentos requeridos (marcar los que aplican)">
            <Chips multi options={ANNEX_D_DOCS} values={form.annexDDocs} onChange={v => set('annexDDocs', v)} />
          </FieldWrap>
          <div style={{ marginTop: 12 }}>
            <FieldLabel>Other (Otro documento)</FieldLabel>
            <Inp value={form.annexDOther} onChange={v => set('annexDOther', v)} placeholder="Especificar otro documento" />
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
