import prisma from '../../../lib/prisma'
import { notFound } from "next/navigation";
import Link from "next/link";

// ─── PRIMITIVAS UI (desde adquisiciones/[id]) ──────────────────────────────────
function FieldLabel({ children, style: extra }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4, ...extra }}>
      {children}
    </div>
  );
}

function FieldValue({ children, mono }) {
  if (!children && children !== 0) return <div style={{ fontSize: 13, color: '#cbd5e1' }}>—</div>
  return (
    <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.55, fontFamily: mono ? 'monospace' : 'inherit' }}>
      {children}
    </div>
  );
}

function ReadField({ label, value, mono, span2 }) {
  return (
    <div style={span2 ? { gridColumn: 'span 2' } : {}}>
      <FieldLabel>{label}</FieldLabel>
      <FieldValue mono={mono}>{value}</FieldValue>
    </div>
  );
}

function ReadGrid({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px 24px' }}>
      {children}
    </div>
  );
}

// ─── SectionCard (modo solo lectura) ──────────────────────────────────────────
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

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, large }) {
  const map = {
    borrador:   { label: 'Borrador',   color: '#64748b', bg: '#f1f5f9' },
    finalizado: { label: 'Finalizado', color: '#166534', bg: '#dcfce7' },
    activo:     { label: 'Activo',     color: '#1d4ed8', bg: '#eff6ff' },
    completado: { label: 'Completado', color: '#166534', bg: '#dcfce7' },
    pendiente:  { label: 'Pendiente',  color: '#b45309', bg: '#fffbeb' },
  };
  const s = map[status] ?? { label: status || '—', color: '#64748b', bg: '#f1f5f9' };
  return (
    <span style={{
      fontSize: large ? 13 : 11, padding: large ? '5px 14px' : '3px 10px',
      borderRadius: 20, background: s.bg, color: s.color, fontWeight: 700,
      fontFamily: 'inherit',
    }}>{s.label}</span>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────
export default async function SolicitudDetallePage({ params }) {
  const { id } = await params;
  const s = await prisma.solicitudProcura.findUnique({
    where: { id },
    include: {
      contactos: { orderBy: { esPrincipal: "desc" } },
      productos: { orderBy: { sortOrder: "asc" } },
      necesidades: { orderBy: { sortOrder: "asc" } },
      adquisicion: { select: { id: true, status: true, fecha: true } },
    },
  });

  if (!s) notFound();

  const prioridades = {
    alta: { label: "Alta", color: "#dc2626", bg: "#fef2f2" },
    media: { label: "Media", color: "#d97706", bg: "#fffbeb" },
    baja: { label: "Baja", color: "#1D9E75", bg: "#f0fdf4" },
  };

  const totalProductos   = s.productos.length;
  const totalNecesidades = s.necesidades.length;
  const totalContactos   = s.contactos.length;
  const totalPasos       = s.proximosPasos.length;

  return (
    <div style={{ padding: '24px 32px', width: '100%', fontFamily: 'inherit' }}>

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
              {s.empresaCliente || 'Sin nombre'}
            </h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{s.fecha}</span>
              <StatusBadge status={s.status} />
              {s.nombreComercial && (
                <span style={{ fontSize: 12, color: '#64748b', padding: '2px 10px', borderRadius: 20, background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                  {s.nombreComercial}
                </span>
              )}
              {s.adquisicion && (
                <Link href={`/admin/adquisiciones/${s.adquisicion.id}`}
                  style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', padding: '2px 10px', borderRadius: 20, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  ↗ Ver estudio de mercado
                </Link>
              )}
            </div>
          </div>
          {/* Acciones */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a href={`/api/admin/solicitudes/inicial/pdf`} target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 9, color: '#475569', textDecoration: 'none', background: '#fff', fontWeight: 500 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Descargar PDF
            </a>
            <Link href={`/admin/solicitudes/${id}/editar`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: 9,
              color: '#475569', background: '#fff', textDecoration: 'none', fontWeight: 500,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* ── Banner Estudio de Mercado vinculado ──────────────────────────────── */}
      {s.adquisicion && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12,
          padding: '16px 20px', marginBottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>
              Estudio de Mercado vinculado
            </div>
            <div style={{ fontSize: 13, color: '#1e40af' }}>
              Creado el {s.adquisicion.fecha} · Estado: <StatusBadge status={s.adquisicion.status} />
            </div>
          </div>
          <Link href={`/admin/adquisiciones/${s.adquisicion.id}`} style={{
            fontSize: 13, fontWeight: 600, padding: '8px 20px',
            background: '#2563eb', color: '#fff', borderRadius: 9, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            Ver estudio de mercado →
          </Link>
        </div>
      )}

      {/* ── LAYOUT DOS COLUMNAS ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 272px', gap: 24, alignItems: 'start' }}>

        {/* ── COLUMNA PRINCIPAL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 1. INFORMACIÓN DE LA REUNIÓN */}
          <SectionCard n="1" title="Información de la Reunión">
            <ReadGrid>
              <ReadField label="Fecha" value={s.fecha} />
              <ReadField label="Ciudad" value={s.ciudad} />
              <ReadField label="Dirección" value={s.direccion} />
              <ReadField label="Sector / Industria" value={s.sectorIndustria} />
              <ReadField label="Canal de Comercialización" value={s.canalComercializacion} />
              <ReadField label="Estado" value={s.status} />
            </ReadGrid>
            {s.objetivoReunion && (
              <div style={{ marginTop: 16 }}>
                <ReadField label="Objetivo de la Reunión" value={s.objetivoReunion} span2 />
              </div>
            )}
            {s.resumenCliente && (
              <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #f1f5f9' }}>
                <ReadField label="Resumen del Cliente" value={s.resumenCliente} span2 />
              </div>
            )}
          </SectionCard>

          {/* 2. CONTACTOS */}
          <SectionCard n="2" title={`Contactos (${totalContactos})`}>
            {s.contactos.length === 0 ? (
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Sin contactos registrados.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {s.contactos.map((c) => (
                  <div key={c.id} style={{
                    background: c.esPrincipal ? '#f8fafc' : '#fff',
                    border: c.esPrincipal ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
                    borderRadius: 10, padding: '14px 16px',
                  }}>
                    {c.esPrincipal && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                        ★ Contacto Principal
                      </div>
                    )}
                    <ReadGrid cols={4}>
                      <ReadField label="Nombre" value={c.nombre} />
                      <ReadField label="Cargo" value={c.cargo} />
                      <ReadField label="Teléfono" value={c.telefono} />
                      <ReadField label="Email" value={c.email} />
                    </ReadGrid>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* 3. PORTAFOLIO DEL CLIENTE */}
          <SectionCard n="3" title={`Portafolio del Cliente (${totalProductos})`} accent="#0a1628">
            {s.productos.length === 0 ? (
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Sin productos registrados.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {s.productos.map((p, i) => (
                  <div key={p.id} style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px',
                    background: '#fff',
                  }}>
                    {/* Cabecera del producto */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, background: '#0a1628', color: '#fff', flexShrink: 0,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{p.nombreProducto}</span>
                      {p.categoria && (
                        <span style={{ fontSize: 12, color: '#94a3b8', background: '#f1f5f9', padding: '2px 10px', borderRadius: 20 }}>
                          {p.categoria}
                        </span>
                      )}
                    </div>
                    {/* Detalles */}
                    <ReadGrid>
                      <ReadField label="Descripción General" value={p.descripcionGeneral} />
                      {p.marca && <ReadField label="Marca" value={p.marca} />}
                      {p.referenciaModelo && <ReadField label="Referencia / Modelo" value={p.referenciaModelo} />}
                      {p.paisOrigen && <ReadField label="País de Origen" value={p.paisOrigen} />}
                      {p.dimensiones && <ReadField label="Dimensiones" value={p.dimensiones} />}
                      {p.peso && <ReadField label="Peso" value={p.peso} />}
                      {p.empaque && <ReadField label="Empaque" value={p.empaque} />}
                    </ReadGrid>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                      {p.caracteristicasPrincipales?.length > 0 && <TagList label="Características" items={p.caracteristicasPrincipales} color="#3b82f6" />}
                      {p.presentaciones?.length > 0 && <TagList label="Presentaciones" items={p.presentaciones} color="#8b5cf6" />}
                      {p.materiales?.length > 0 && <TagList label="Materiales" items={p.materiales} color="#10b981" />}
                      {p.colores?.length > 0 && <TagList label="Colores" items={p.colores} color="#f59e0b" />}
                    </div>

                    {(p.usosAplicaciones || p.requerimientosEspeciales || p.observaciones) && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                        {p.usosAplicaciones && <ReadField label="Usos y Aplicaciones" value={p.usosAplicaciones} span2 />}
                        {p.requerimientosEspeciales && (
                          <div style={{ marginTop: p.usosAplicaciones ? 12 : 0 }}>
                            <ReadField label="Requerimientos Especiales" value={p.requerimientosEspeciales} span2 />
                          </div>
                        )}
                        {p.observaciones && (
                          <div style={{ marginTop: 12 }}>
                            <ReadField label="Observaciones" value={p.observaciones} span2 />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* 4. NECESIDADES DE PROCURA */}
          <SectionCard n="4" title={`Necesidades de Procura (${totalNecesidades})`} accent="#d97706">
            {s.necesidades.length === 0 ? (
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Sin necesidades registradas.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {s.necesidades.map((n, i) => (
                  <div key={n.id} style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px',
                    background: '#fff',
                  }}>
                    {/* Cabecera */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, background: '#d97706', color: '#fff', flexShrink: 0,
                        }}>{i + 1}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{n.productoRelacionado}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {n.prioridad && (
                          <span style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 20,
                            background: prioridades[n.prioridad]?.bg, color: prioridades[n.prioridad]?.color, fontWeight: 700,
                          }}>{prioridades[n.prioridad]?.label}</span>
                        )}
                        <span style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 20,
                          background: '#f1f5f9', color: '#64748b', fontWeight: 600,
                        }}>
                          {n.tipoNecesidad === "otro" ? n.tipoNecesidadOtro : n.tipoNecesidad?.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    {/* Detalles */}
                    <ReadGrid>
                      <ReadField label="Descripción" value={n.descripcion} />
                      {n.cantidadReferencial && <ReadField label="Cantidad Referencial" value={n.cantidadReferencial} />}
                      {n.frecuenciaRequerida && <ReadField label="Frecuencia Requerida" value={n.frecuenciaRequerida} />}
                    </ReadGrid>
                    {(n.especificacionesMinimas || n.observaciones) && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                        {n.especificacionesMinimas && <ReadField label="Especificaciones Mínimas" value={n.especificacionesMinimas} span2 />}
                        {n.observaciones && (
                          <div style={{ marginTop: n.especificacionesMinimas ? 12 : 0 }}>
                            <ReadField label="Observaciones" value={n.observaciones} span2 />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* 5. OBSERVACIONES GENERALES */}
          {(s.fortalezasDetectadas?.length > 0 || s.restriccionesDetectadas?.length > 0 || s.comentariosFinales) && (
            <SectionCard n="5" title="Observaciones Generales">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {s.fortalezasDetectadas?.length > 0 && (
                  <TagList label="Fortalezas Detectadas" items={s.fortalezasDetectadas} color="#10b981" />
                )}
                {s.restriccionesDetectadas?.length > 0 && (
                  <TagList label="Restricciones Detectadas" items={s.restriccionesDetectadas} color="#ef4444" />
                )}
                {s.comentariosFinales && (
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #f1f5f9' }}>
                    <ReadField label="Comentarios Finales" value={s.comentariosFinales} span2 />
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* 6. PRÓXIMOS PASOS */}
          {s.proximosPasos?.length > 0 && (
            <SectionCard n="6" title={`Próximos Pasos (${totalPasos})`} accent="#10b981">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {s.proximosPasos.map((paso, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{
                      fontSize: 12, fontFamily: 'monospace', color: '#10b981', fontWeight: 700,
                      minWidth: 24, flexShrink: 0, paddingTop: 1,
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.55 }}>{paso}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* 7. REGISTRO INTERNO */}
          <SectionCard n="7" title="Registro Interno">
            <ReadGrid>
              <ReadField label="Elaborado por" value={s.elaboradoPorNombre} />
              <ReadField label="Cargo" value={s.elaboradoPorCargo} />
              <ReadField label="Fecha de Elaboración" value={s.elaboradoPorFecha} />
              <ReadField label="Creado en Sistema" value={new Date(s.createdAt).toLocaleDateString("es-VE", {
                day: "numeric", month: "long", year: "numeric",
              })} />
            </ReadGrid>
          </SectionCard>

        </div>{/* fin columna principal */}

        {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 }}>

          {/* Estado */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Estado
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <StatusBadge status={s.status} large />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.fecha}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href={`/api/admin/solicitudes/inicial/pdf`} target="_blank" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '9px', border: '1px solid #e2e8f0', borderRadius: 9,
                  color: '#475569', textDecoration: 'none', fontSize: 13, fontWeight: 500, background: '#fff',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Descargar PDF
                </a>
                <Link href={`/admin/solicitudes/${id}/editar`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '9px', border: '1px solid #e2e8f0', borderRadius: 9,
                  color: '#475569', textDecoration: 'none', fontSize: 13, fontWeight: 500,
                }}>
                  Editar solicitud
                </Link>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Resumen
            </div>
            <div style={{ padding: '6px 0' }}>
              {[
                { label: 'Productos',     value: totalProductos,    color: '#3b82f6' },
                { label: 'Necesidades',  value: totalNecesidades,  color: '#f59e0b' },
                { label: 'Contactos',    value: totalContactos,    color: '#8b5cf6' },
                { label: 'Próx. pasos',   value: totalPasos,       color: '#10b981' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 18px', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color, background: `${color}15`, padding: '2px 10px', borderRadius: 20 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estudio de Mercado vinculado (sidebar) */}
          {s.adquisicion && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                Estudio de Mercado
              </div>
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                  {s.empresaCliente}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{s.adquisicion.fecha}</div>
                <div style={{ marginBottom: 12 }}><StatusBadge status={s.adquisicion.status} /></div>
                <Link href={`/admin/adquisiciones/${s.adquisicion.id}`} style={{
                  display: 'block', textAlign: 'center', padding: '8px', borderRadius: 9,
                  border: '1px solid #e2e8f0', color: '#3b82f6', textDecoration: 'none',
                  fontSize: 12, fontWeight: 600,
                }}>Ver estudio de mercado →</Link>
              </div>
            </div>
          )}

          {/* Datos del cliente */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Datos del Cliente
            </div>
            <div style={{ padding: '14px 18px' }}>
              {s.cedulaRif && (
                <div style={{ marginBottom: 8 }}>
                  <FieldLabel>Cédula / RIF</FieldLabel>
                  <FieldValue mono>{s.cedulaRif}</FieldValue>
                </div>
              )}
              {s.ciudad && (
                <div style={{ marginBottom: 8 }}>
                  <FieldLabel>Ciudad</FieldLabel>
                  <FieldValue>{s.ciudad}</FieldValue>
                </div>
              )}
              {s.direccion && (
                <div style={{ marginBottom: 8 }}>
                  <FieldLabel>Dirección</FieldLabel>
                  <FieldValue>{s.direccion}</FieldValue>
                </div>
              )}
              {s.sectorIndustria && (
                <div style={{ marginBottom: 8 }}>
                  <FieldLabel>Sector</FieldLabel>
                  <FieldValue>{s.sectorIndustria}</FieldValue>
                </div>
              )}
              {s.canalComercializacion && (
                <div>
                  <FieldLabel>Canal</FieldLabel>
                  <FieldValue>{s.canalComercializacion}</FieldValue>
                </div>
              )}
            </div>
          </div>

        </div>{/* fin sidebar */}

      </div>{/* fin layout */}
    </div>
  );
}

// ─── TagList ──────────────────────────────────────────────────────────────────
function TagList({ label, items, color = '#3b82f6' }) {
  if (!items?.length) return null;
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontSize: 12, padding: '4px 12px',
            background: `${color}15`, color: color,
            borderRadius: 20, fontWeight: 500,
            border: `1px solid ${color}30`,
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
