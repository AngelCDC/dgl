'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return n?.toLocaleString('es-VE') ?? '—'; }
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Campo de formulario (label + input). Vive a nivel de módulo: si se definiera
// dentro del componente, cada pulsación de tecla crearía una referencia nueva,
// React remontaría el input y este perdería el foco.
function Campo({ label, k, required, form, setForm }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
        {label}{required ? <span style={{ color: '#dc2626' }}> *</span> : null}
      </div>
      <input
        className="sol-input"
        style={{ width: '100%', boxSizing: 'border-box' }}
        value={form[k] ?? ''}
        onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
      />
    </div>
  );
}

// ─── Modal de grupo empresarial para clientes (a nivel de módulo: evita perder
//     el foco al teclear). Mismo flujo que en reportes: 1) crear grupo nuevo
//     (este cliente como principal) o añadir a uno existente, 2) escoger otros
//     clientes para completar el grupo. ─────────────────────────────────────────
function ClienteGrupoModal({ cliente, grupos, clientesTodos, onClose, onDone }) {
  const [paso, setPaso] = useState('inicio') // inicio | completar
  const [modo, setModo] = useState('crear')   // crear | existente
  const [form, setForm] = useState({
    nombre: cliente.razonSocial,
    empresaPrincipal: cliente.razonSocial,
    descripcion: '',
  })
  const [grupoIdExistente, setGrupoIdExistente] = useState('')
  const [grupoCreado, setGrupoCreado] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [seleccionados, setSeleccionados] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Otros clientes disponibles: sin grupo y distintos al actual
  const disponibles = (clientesTodos || []).filter(c => !c.grupoId && c.cedulaRif !== cliente.cedulaRif)
  const listaFiltrada = disponibles.filter(c =>
    !filtro || (c.razonSocial + ' ' + (c.nombreComercial || '') + ' ' + c.cedulaRif).toLowerCase().includes(filtro.toLowerCase())
  )

  function toggle(id) {
    setSeleccionados(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  // Asignación vía POST upsert (requiere cédula/RIF + razón social)
  async function asignarCliente(grupoId, c) {
    const res = await fetch('/api/admin/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedulaRif: c.cedulaRif, razonSocial: c.razonSocial, grupoId }),
    })
    if (!res.ok) throw new Error('falló la asignación')
  }

  // ── Paso 1: definir el grupo y vincular este cliente ──
  async function continuar() {
    setSaving(true)
    setError(null)
    try {
      let grupoId = null
      if (modo === 'crear') {
        if (!form.nombre.trim() || !form.empresaPrincipal.trim()) {
          setError('El nombre del grupo y la empresa principal son obligatorios.')
          return
        }
        const res = await fetch('/api/admin/grupos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const json = await res.json()
        if (!res.ok) { setError(json.error || 'Error al crear el grupo'); return }
        grupoId = json.id
        setGrupoCreado(json)
      } else {
        if (!grupoIdExistente) { setError('Selecciona un grupo.'); return }
        grupoId = grupoIdExistente
      }
      await asignarCliente(grupoId, cliente)
      setPaso('completar')
    } catch {
      setError('Error de conexión al crear el grupo')
    } finally {
      setSaving(false)
    }
  }

  // ── Paso 2: añadir los clientes escogidos y cerrar ──
  async function finalizar() {
    setSaving(true)
    setError(null)
    try {
      const grupoId = grupoCreado?.id || grupoIdExistente
      for (const id of seleccionados) {
        const c = (clientesTodos || []).find(x => x.id === id)
        if (c) await asignarCliente(grupoId, c)
      }
      onDone(grupoId)
    } catch {
      setError('Error al añadir los clientes seleccionados')
      setSaving(false)
    }
  }

  return (
    <div style={grupoOverlayStyle}>
      <div style={grupoModalStyle}>
        {paso === 'inicio' ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>
              Grupo empresarial — {cliente.razonSocial}
            </div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
              Agrupa clientes vinculados (compradores de un mismo grupo empresarial) para ver su panorama completo.
            </p>

            {/* Selector de modo */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <button onClick={() => setModo('crear')} style={modo === 'crear' ? grupoModoOnStyle : grupoModoOffStyle}>
                ✚ Crear grupo nuevo
              </button>
              <button onClick={() => setModo('existente')} style={modo === 'existente' ? grupoModoOnStyle : grupoModoOffStyle}>
                Añadir a grupo existente
              </button>
            </div>

            {modo === 'crear' ? (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={grupoLblStyle}>Empresa principal (este cliente) *</div>
                  <input value={form.empresaPrincipal} onChange={e => set('empresaPrincipal', e.target.value)} style={grupoInputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={grupoLblStyle}>Nombre del grupo *</div>
                  <input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={grupoInputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={grupoLblStyle}>Notas internas</div>
                  <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                    rows={2} style={{ ...grupoInputStyle, resize: 'vertical', fontFamily: 'var(--font-inter)' }} />
                </div>
              </>
            ) : (
              <div style={{ marginBottom: 18 }}>
                <div style={grupoLblStyle}>Grupo existente</div>
                <select value={grupoIdExistente} onChange={e => setGrupoIdExistente(e.target.value)} style={grupoInputStyle}>
                  <option value="">Seleccionar grupo...</option>
                  {grupos.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.nombre} ({g._count?.reportes ?? 0} informe(s) · {g._count?.clientes ?? 0} cliente(s))
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && <div style={grupoErrStyle}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={onClose} disabled={saving} style={grupoSecStyle}>Cancelar</button>
              <button onClick={continuar} disabled={saving} style={grupoPriStyle}>
                {saving ? 'Guardando...' : 'Continuar'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>
              Añadir más clientes al grupo
            </div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
              {cliente.razonSocial} ya está en el grupo. Escoge otros clientes relacionados (opcional).
            </p>

            <input
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Buscar por razón social o cédula/RIF..."
              style={{ ...grupoInputStyle, marginBottom: 12 }}
            />

            <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
              {listaFiltrada.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', fontSize: 12.5 }}>
                  {disponibles.length === 0 ? 'No hay más clientes sin grupo disponibles.' : 'Sin coincidencias.'}
                </div>
              ) : (
                listaFiltrada.map(c => (
                  <label key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                    cursor: 'pointer', borderBottom: '1px solid #f5f5f5', fontSize: 13, color: '#333',
                    background: seleccionados.includes(c.id) ? '#eff6ff' : '#fff',
                  }}>
                    <input type="checkbox" checked={seleccionados.includes(c.id)} onChange={() => toggle(c.id)} />
                    <span style={{ flex: 1 }}>{c.razonSocial}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#aaa' }}>{c.cedulaRif}</span>
                  </label>
                ))
              )}
            </div>

            {error && <div style={grupoErrStyle}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 12, color: '#888' }}>{seleccionados.length} seleccionado(s)</span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={finalizar} disabled={saving} style={grupoSecStyle}>
                  {seleccionados.length === 0 ? 'Finalizar sin añadir' : 'Saltar este paso'}
                </button>
                <button onClick={finalizar} disabled={saving || seleccionados.length === 0} style={grupoPriStyle}>
                  {saving ? 'Añadiendo...' : `Añadir ${seleccionados.length || ''} al grupo`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Estilos del modal de grupo (zIndex 1100: por encima del modal de detalle, que usa 1000)
const grupoOverlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  padding: '80px 16px', zIndex: 1100, backdropFilter: 'blur(2px)',
}
const grupoModalStyle = {
  background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 520,
  boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
}
const grupoInputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8,
  fontSize: 13, color: '#111', fontFamily: 'var(--font-inter)', background: '#fff', boxSizing: 'border-box',
}
const grupoLblStyle = {
  fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: 5, fontFamily: 'var(--font-dm)',
}
const grupoErrStyle = {
  padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
  color: '#dc2626', fontSize: 12.5, borderRadius: 8, marginBottom: 14,
}
const grupoPriStyle = {
  padding: '9px 20px', background: '#2563eb', color: '#fff', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13, fontWeight: 500,
}
const grupoSecStyle = {
  padding: '9px 16px', background: '#fff', color: '#888', border: '1px solid #ddd',
  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 13,
}
const grupoModoOnStyle = {
  padding: '8px 14px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12.5, fontWeight: 600,
}
const grupoModoOffStyle = {
  padding: '8px 14px', background: '#fff', color: '#888', border: '1px solid #ddd',
  borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-dm)', fontSize: 12.5,
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
  const [userRole,      setUserRole] = useState(null); // grupos empresariales: solo admin
  const [grupos,        setGrupos]   = useState([]);
  const [clientesTodos, setClientesTodos] = useState([]); // para el paso 2 del modal de grupo
  const [grupoModal,    setGrupoModal] = useState(null); // cliente sobre el que se abre el modal
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

  // ── rol del usuario y datos de grupos (solo el admin puede agrupar clientes) ──
  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(s => setUserRole(s?.user?.role ?? null))
      .catch(() => setUserRole(null))
  }, []);

  useEffect(() => {
    if (userRole !== 'admin') return
    fetch('/api/admin/grupos')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setGrupos(d) })
      .catch(() => {})
    fetch('/api/admin/clientes?limit=100')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.clientes)) setClientesTodos(d.clientes) })
      .catch(() => {})
  }, [userRole]);

  // ── al cerrar el modal de grupo: refrescar lista y ficha ──
  const onGrupoDone = async () => {
    setGrupoModal(null)
    load(q, page)
    if (detail) {
      const chk = await fetch(`/api/admin/clientes?cedula=${encodeURIComponent(detail.cedulaRif)}`).then(r => r.json())
      if (chk.cliente) setDetail(chk.cliente)
    }
  };

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
                <td style={{ padding: '10px 14px', color: '#1e293b', fontWeight: 500 }}>
                  {c.razonSocial}
                  {userRole === 'admin' && c.grupo && (
                    <Link
                      href={`/admin/grupos/${c.grupo.id}`}
                      onClick={e => e.stopPropagation()}
                      style={{
                        marginLeft: 8, padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: '#eff6ff', color: '#1d4ed8', textDecoration: 'none', whiteSpace: 'nowrap',
                      }}
                    >🏢 {c.grupo.nombre}</Link>
                  )}
                </td>
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
                  <Campo form={editForm} setForm={setEditForm} label="Razón Social" k="razonSocial" required />
                  <Campo form={editForm} setForm={setEditForm} label="Nombre Comercial" k="nombreComercial" />
                  {nuevo ? (
                    <Campo form={editForm} setForm={setEditForm} label="Cédula / RIF" k="cedulaRif" required />
                  ) : (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>Cédula / RIF</div>
                      <input className="sol-input" style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', color: '#64748b' }} value={detail.cedulaRif} disabled />
                    </div>
                  )}
                  <Campo form={editForm} setForm={setEditForm} label="Ciudad" k="ciudad" />
                  <Campo form={editForm} setForm={setEditForm} label="Dirección" k="direccion" />
                  <Campo form={editForm} setForm={setEditForm} label="País" k="pais" />
                  <Campo form={editForm} setForm={setEditForm} label="Sector / Industria" k="sectorIndustria" />
                  <Campo form={editForm} setForm={setEditForm} label="Canal de Comercialización" k="canalComercializacion" />
                  <Campo form={editForm} setForm={setEditForm} label="Contacto — Nombre" k="contactoNombre" />
                  <Campo form={editForm} setForm={setEditForm} label="Contacto — Cargo" k="contactoCargo" />
                  <Campo form={editForm} setForm={setEditForm} label="Contacto — Teléfono" k="contactoTelefono" />
                  <Campo form={editForm} setForm={setEditForm} label="Contacto — Email" k="contactoEmail" />
                  <Campo form={editForm} setForm={setEditForm} label="Representante Legal" k="representanteLegal" />
                  <Campo form={editForm} setForm={setEditForm} label="Cargo del Representante" k="representanteCargo" />
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
                    {userRole === 'admin' && (detail.grupo ? (
                      <Link href={`/admin/grupos/${detail.grupo.id}`}
                        style={{
                          fontSize: 12, padding: '6px 14px', border: '1px solid #bfdbfe', borderRadius: 8,
                          background: '#eff6ff', color: '#1d4ed8', textDecoration: 'none', fontWeight: 600,
                        }}>
                        🏢 {detail.grupo.nombre}
                      </Link>
                    ) : (
                      <button
                        style={{ fontSize: 12, padding: '6px 16px', background: '#fff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer' }}
                        onClick={() => setGrupoModal(detail)}
                      >Grupo</button>
                    ))}
                    <button className="sol-btn-preview" style={{ fontSize: 12, padding: '6px 16px' }} onClick={abrirEdicion}>Editar</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal grupo empresarial (solo admin) ── */}
      {grupoModal && (
        <ClienteGrupoModal
          cliente={grupoModal}
          grupos={grupos}
          clientesTodos={clientesTodos}
          onClose={() => setGrupoModal(null)}
          onDone={onGrupoDone}
        />
      )}
    </div>
  );
}
