'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return n?.toLocaleString('es-VE') ?? '—'; }
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Página ──────────────────────────────────────────────────────────────────
export default function ClientesPage() {
  const [q,         setQ]         = useState('');
  const [page,      setPage]      = useState(1);
  const [result,    setResult]    = useState({ clientes: [], total: 0, pages: 1 });
  const [loading,   setLoading]   = useState(true);
  const [detail,    setDetail]    = useState(null); // cliente seleccionado
  const [editMode,  setEditMode]  = useState(false);
  const [editForm,  setEditForm]  = useState({});
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [nuevo,     setNuevo]     = useState(false); // modal en modo creación
  const debounce    = useRef(null);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const load = async (query, pg) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 30 });
      if (query) params.set('q', query);
      const res  = await fetch(`/api/admin/clientes?${params}`);
      const data = await res.json();
      setResult(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); load(q, 1); }, 300);
  }, [q]);

  useEffect(() => { load(q, page); }, [page]);

  // ── cierre modal con Escape ───────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setDetail(null); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  // ── edición del cliente ────────────────────────────────────────────────────
  const abrirEdicion = () => {
    setEditForm({
      razonSocial: detail.razonSocial ?? '',
      nombreComercial: detail.nombreComercial ?? '',
      ciudad: detail.ciudad ?? '',
      direccion: detail.direccion ?? '',
      pais: detail.pais ?? '',
      sectorIndustria: detail.sectorIndustria ?? '',
      canalComercializacion: detail.canalComercializacion ?? '',
      contactoNombre: detail.contactoNombre ?? '',
      contactoCargo: detail.contactoCargo ?? '',
      contactoTelefono: detail.contactoTelefono ?? '',
      contactoEmail: detail.contactoEmail ?? '',
      representanteLegal: detail.representanteLegal ?? '',
      representanteCargo: detail.representanteCargo ?? '',
    });
    setSaveError(null);
    setEditMode(true);
  };

  // ── creación de cliente ────────────────────────────────────────────────────
  const abrirNuevo = () => {
    setEditForm({
      cedulaRif: '', razonSocial: '', nombreComercial: '', ciudad: '', direccion: '', pais: '',
      sectorIndustria: '', canalComercializacion: '',
      contactoNombre: '', contactoCargo: '', contactoTelefono: '', contactoEmail: '',
      representanteLegal: '', representanteCargo: '',
    });
    setSaveError(null);
    setNuevo(true);
    setDetail(null);
    setEditMode(true);
  };

  const cerrarModal = () => { setDetail(null); setEditMode(false); setNuevo(false); };

  const guardarEdicion = async () => {
    if (!editForm.razonSocial?.trim()) { setSaveError('La razón social es requerida'); return; }
    const rif = (nuevo ? editForm.cedulaRif : detail.cedulaRif)?.trim();
    if (!rif) { setSaveError('La cédula/RIF es requerida'); return; }
    setSaving(true);
    setSaveError(null);
    try {
      // Al crear: no sobrescribir un cliente existente con el mismo RIF
      if (nuevo) {
        const chk = await fetch(`/api/admin/clientes?cedula=${encodeURIComponent(rif)}`).then(r => r.json());
        if (chk.cliente) {
          setSaveError(`Ya existe un cliente con la cédula/RIF ${rif}. Ábrelo en la lista y usa "Editar".`);
          return;
        }
      }
      const res = await fetch('/api/admin/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedulaRif: rif, ...editForm }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Error al guardar');
      if (nuevo) {
        cerrarModal();
      } else {
        setDetail({ ...data.cliente, _count: detail._count ?? {} });
        setEditMode(false);
      }
      load(q, page); // refrescar la lista
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Campo de formulario (label + input)
  const F = ({ label, k, required, width }) => (
    <div style={{ width }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
        {label}{required ? <span style={{ color: '#dc2626' }}> *</span> : null}
      </div>
      <input
        className="sol-input"
        style={{ width: '100%', boxSizing: 'border-box' }}
        value={editForm[k] ?? ''}
        onChange={e => setEditForm(f => ({ ...f, [k]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="main-content">
      {/* ── Header ── */}
      <div className="section-title-row" style={{ marginBottom: 24 }}>
        <span className="section-title-text">Clientes</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="mono-sm">{fmt(result.total)} registros</span>
          <button className="sol-btn-preview" onClick={abrirNuevo}>✚ Nuevo Cliente</button>
        </div>
      </div>

      {/* ── Buscador ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          className="sol-input"
          style={{ maxWidth: 420 }}
          placeholder="Buscar por cédula/RIF, razón social, ciudad o email…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {q && (
          <button
            style={{ padding: '0 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
            onClick={() => setQ('')}
          >✕ Limpiar</button>
        )}
      </div>

      {/* ── Tabla ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Cédula / RIF', 'Razón Social', 'Ciudad', 'Sector', 'Solicitudes', 'Última actualización'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>Cargando…</td></tr>
            ) : result.clientes.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                {q ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados aún'}
              </td></tr>
            ) : result.clientes.map((c, idx) => (
              <tr
                key={c.id}
                onClick={() => setDetail(c)}
                style={{
                  borderBottom: idx < result.clientes.length - 1 ? '1px solid #f1f5f9' : 'none',
                  cursor: 'pointer',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>{c.cedulaRif}</td>
                <td style={{ padding: '10px 14px', color: '#1e293b', fontWeight: 500 }}>{c.razonSocial}</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>{c.ciudad || '—'}</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>{c.sectorIndustria || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600,
                    background: (c._count?.solicitudes || 0) > 0 ? '#dbeafe' : '#f1f5f9',
                    color:      (c._count?.solicitudes || 0) > 0 ? '#1d4ed8' : '#94a3b8',
                  }}>
                    {c._count?.solicitudes ?? 0}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 12 }}>{fmtDate(c.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ── */}
      {result.pages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', cursor: page === 1 ? 'default' : 'pointer', fontSize: 13 }}
          >← Anterior</button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: '#64748b' }}>
            Página {page} / {result.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(result.pages, p + 1))}
            disabled={page === result.pages}
            style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: page === result.pages ? '#f8fafc' : '#fff', cursor: page === result.pages ? 'default' : 'pointer', fontSize: 13 }}
          >Siguiente →</button>
        </div>
      )}

      {/* ── Modal de detalle / edición / creación ── */}
      {(detail || nuevo) && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) cerrarModal(); }}
        >
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            {/* header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
                  {nuevo ? 'Nuevo Cliente' : editMode ? 'Editar Cliente' : 'Ficha de Cliente'}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                  {nuevo ? (editForm.razonSocial?.trim() || 'Nuevo cliente') : detail.razonSocial}
                </div>
                {!nuevo && (
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#3b82f6', marginTop: 2 }}>{detail.cedulaRif}</div>
                )}
              </div>
              <button onClick={cerrarModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', lineHeight: 1 }}>✕</button>
            </div>

            {editMode ? (
              <>
                {/* body: formulario */}
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                  <F label="Razón Social" k="razonSocial" required />
                  <F label="Nombre Comercial" k="nombreComercial" />
                  {nuevo ? (
                    <F label="Cédula / RIF" k="cedulaRif" required />
                  ) : (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>Cédula / RIF</div>
                      <input className="sol-input" style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', color: '#64748b' }} value={detail.cedulaRif} disabled />
                    </div>
                  )}
                  <F label="Ciudad" k="ciudad" />
                  <F label="Dirección" k="direccion" />
                  <F label="País" k="pais" />
                  <F label="Sector / Industria" k="sectorIndustria" />
                  <F label="Canal de Comercialización" k="canalComercializacion" />
                  <F label="Contacto — Nombre" k="contactoNombre" />
                  <F label="Contacto — Cargo" k="contactoCargo" />
                  <F label="Contacto — Teléfono" k="contactoTelefono" />
                  <F label="Contacto — Email" k="contactoEmail" />
                  <F label="Representante Legal" k="representanteLegal" />
                  <F label="Cargo del Representante" k="representanteCargo" />
                </div>

                {/* footer: acciones */}
                {saveError && <div className="sol-error" style={{ margin: '0 24px 12px' }}>{saveError}</div>}
                <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button className="sol-btn-cancel" onClick={() => { setEditMode(false); setSaveError(null); if (nuevo) setNuevo(false); }}>Cancelar</button>
                  <button className="sol-btn-preview" onClick={guardarEdicion} disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* body: detalle */}
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                  {[
                    ['Nombre comercial', detail.nombreComercial],
                    ['Ciudad',       detail.ciudad],
                    ['Dirección',    detail.direccion],
                    ['País',         detail.pais],
                    ['Sector',       detail.sectorIndustria],
                    ['Canal comercialización', detail.canalComercializacion],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 13, color: val ? '#1e293b' : '#cbd5e1' }}>{val || '—'}</div>
                    </div>
                  ))}
                </div>

                {/* contacto principal */}
                {(detail.contactoNombre || detail.contactoEmail) && (
                  <div style={{ margin: '0 24px 16px', padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Contacto Principal</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: 13 }}>
                      {[
                        ['Nombre',   detail.contactoNombre],
                        ['Cargo',    detail.contactoCargo],
                        ['Teléfono', detail.contactoTelefono],
                        ['Email',    detail.contactoEmail],
                      ].map(([label, val]) => val ? (
                        <div key={label}>
                          <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>{label}</span>
                          <span style={{ color: '#1e293b' }}>{val}</span>
                        </div>
                      ) : null)}
                    </div>
                  </div>
                )}

                {/* representante legal (para contratos) */}
                {(detail.representanteLegal || detail.representanteCargo) && (
                  <div style={{ margin: '0 24px 20px', padding: '14px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #dbeafe' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Representante Legal (contratos)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: 13 }}>
                      {[
                        ['Nombre', detail.representanteLegal],
                        ['Cargo',  detail.representanteCargo],
                      ].map(([label, val]) => val ? (
                        <div key={label}>
                          <span style={{ color: '#94a3b8', fontSize: 11, display: 'block' }}>{label}</span>
                          <span style={{ color: '#1e293b' }}>{val}</span>
                        </div>
                      ) : null)}
                    </div>
                  </div>
                )}

                {/* footer */}
                <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94a3b8' }}>
                  <span>
                    {detail._count?.solicitudes ?? 0} solicitud(es) · {detail._count?.contratos ?? 0} contrato(s)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span>Registrado: {fmtDate(detail.createdAt)}</span>
                    <button className="sol-btn-preview" style={{ fontSize: 12, padding: '6px 16px' }} onClick={abrirEdicion}>Editar</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
