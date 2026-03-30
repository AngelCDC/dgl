import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function SolicitudDetallePage({ params }) {
  const { id } = await params;
  const s = await prisma.solicitudProcura.findUnique({
    where: { id },
    include: {
      contactos: { orderBy: { esPrincipal: "desc" } },
      productos: { orderBy: { sortOrder: "asc" } },
      necesidades: { orderBy: { sortOrder: "asc" } },
      adquisicion: { select: { id: true, status: true, fecha: true } }, // agregar esto
    },
  });

  if (!s) notFound();

  const prioridades = {
    alta: { label: "Alta", color: "#dc2626", bg: "#fef2f2" },
    media: { label: "Media", color: "#d97706", bg: "#fef3e2" },
    baja: { label: "Baja", color: "#1D9E75", bg: "#e6f7f1" },
  };

  return (
    <div style={{ padding: "32px", maxWidth: "900px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
        }}
      >
        <div>
          <Link
            href="/admin/solicitudes"
            style={{
              fontSize: "12px",
              color: "#888",
              display: "block",
              marginBottom: "8px",
            }}
          >
            ← Volver
          </Link>
          <h1
            style={{ fontSize: "22px", fontWeight: "600", marginBottom: "4px" }}
          >
            {s.empresaCliente}
          </h1>
          {s.nombreComercial && (
            <p style={{ fontSize: "13px", color: "#888" }}>
              {s.nombreComercial}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link
            href={`/admin/solicitudes/${id}/editar`}
            style={{
              fontSize: "13px",
              padding: "8px 16px",
              border: "1px solid #eee",
              borderRadius: "8px",
              color: "#555",
            }}
          >
            Editar
          </Link>
          <a
            href={`/api/solicitudes/inicial/pdf`}
            target="_blank"
            style={{
              fontSize: "13px",
              padding: "8px 16px",
              background: "#2563eb",
              color: "white",
              borderRadius: "8px",
            }}
          >
            Descargar PDF
          </a>
        </div>
      </div>

      {s.adquisicion && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderLeft: "4px solid #2563eb",
            padding: "16px 20px",
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-dm)",
                fontSize: "12px",
                fontWeight: "600",
                color: "#1d4ed8",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Estudio de Mercado vinculado
            </div>
            <div style={{ fontSize: "13px", color: "#1e40af" }}>
              Borrador creado el {s.adquisicion.fecha} · Estado:{" "}
              {s.adquisicion.status}
            </div>
          </div>
          <Link
            href={`/admin/adquisiciones/${s.adquisicion.id}`}
            style={{
              fontFamily: "var(--font-dm)",
              fontSize: "13px",
              fontWeight: "500",
              padding: "8px 16px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "6px",
            }}
          >
            Ver estudio de mercado →
          </Link>
        </div>
      )}

      {/* Info general */}
      <Section title="Información de la reunión">
        <Grid>
          <Field label="Fecha" value={s.fecha} />
          <Field label="Ciudad" value={s.ciudad} />
          <Field label="Dirección" value={s.direccion} />
          <Field label="Sector" value={s.sectorIndustria} />
          <Field label="Canal" value={s.canalComercializacion} />
          <Field label="Estado" value={s.status} />
        </Grid>
        <Field label="Objetivo de la reunión" value={s.objetivoReunion} full />
        {s.resumenCliente && (
          <Field label="Resumen del cliente" value={s.resumenCliente} full />
        )}
      </Section>

      {/* Contactos */}
      <Section title="Contactos">
        {s.contactos.map((c) => (
          <div
            key={c.id}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              padding: "12px",
              background: c.esPrincipal ? "#f4f6f9" : "#fff",
              border: "1px solid #eee",
              borderRadius: "6px",
              marginBottom: "8px",
            }}
          >
            <Field
              label={c.esPrincipal ? "Contacto principal" : "Contacto"}
              value={c.nombre}
            />
            <Field label="Cargo" value={c.cargo} />
            <Field label="Teléfono" value={c.telefono} />
            <Field label="Email" value={c.email} />
          </div>
        ))}
      </Section>

      {/* Productos */}
      <Section
        title={`Portafolio del cliente (${s.productos.length} productos)`}
      >
        {s.productos.map((p, i) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                fontSize: "14px",
                marginBottom: "12px",
                color: "#0a1628",
              }}
            >
              {i + 1}. {p.nombreProducto}{" "}
              {p.categoria && (
                <span
                  style={{ fontWeight: "400", color: "#888", fontSize: "12px" }}
                >
                  · {p.categoria}
                </span>
              )}
            </div>
            <Grid>
              <Field label="Descripción general" value={p.descripcionGeneral} />
              {p.marca && <Field label="Marca" value={p.marca} />}
              {p.referenciaModelo && (
                <Field label="Referencia" value={p.referenciaModelo} />
              )}
              {p.paisOrigen && (
                <Field label="País de origen" value={p.paisOrigen} />
              )}
              {p.dimensiones && (
                <Field label="Dimensiones" value={p.dimensiones} />
              )}
              {p.peso && <Field label="Peso" value={p.peso} />}
              {p.empaque && <Field label="Empaque" value={p.empaque} />}
            </Grid>
            {p.caracteristicasPrincipales.length > 0 && (
              <TagList
                label="Características"
                items={p.caracteristicasPrincipales}
              />
            )}
            {p.presentaciones?.length > 0 && (
              <TagList label="Presentaciones" items={p.presentaciones} />
            )}
            {p.materiales?.length > 0 && (
              <TagList label="Materiales" items={p.materiales} />
            )}
            {p.colores?.length > 0 && (
              <TagList label="Colores" items={p.colores} />
            )}
            {p.usosAplicaciones && (
              <Field
                label="Usos y aplicaciones"
                value={p.usosAplicaciones}
                full
              />
            )}
            {p.requerimientosEspeciales && (
              <Field
                label="Requerimientos especiales"
                value={p.requerimientosEspeciales}
                full
              />
            )}
            {p.observaciones && (
              <Field label="Observaciones" value={p.observaciones} full />
            )}
          </div>
        ))}
      </Section>

      {/* Necesidades */}
      <Section title={`Necesidades de procura (${s.necesidades.length})`}>
        {s.necesidades.map((n, i) => (
          <div
            key={n.id}
            style={{
              border: "1px solid #eee",
              borderLeft: "4px solid #2563eb",
              borderRadius: "0 8px 8px 0",
              padding: "16px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#0a1628",
                }}
              >
                {i + 1}. {n.productoRelacionado}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {n.prioridad && (
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      background: prioridades[n.prioridad]?.bg,
                      color: prioridades[n.prioridad]?.color,
                      fontWeight: "500",
                    }}
                  >
                    {prioridades[n.prioridad]?.label}
                  </span>
                )}
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    background: "#f4f6f9",
                    color: "#5a6478",
                    fontWeight: "500",
                  }}
                >
                  {n.tipoNecesidad === "otro"
                    ? n.tipoNecesidadOtro
                    : n.tipoNecesidad.replace("_", " ")}
                </span>
              </div>
            </div>
            <Grid>
              <Field label="Descripción" value={n.descripcion} />
              {n.cantidadReferencial && (
                <Field
                  label="Cantidad referencial"
                  value={n.cantidadReferencial}
                />
              )}
              {n.frecuenciaRequerida && (
                <Field label="Frecuencia" value={n.frecuenciaRequerida} />
              )}
            </Grid>
            {n.especificacionesMinimas && (
              <Field
                label="Especificaciones mínimas"
                value={n.especificacionesMinimas}
                full
              />
            )}
            {n.observaciones && (
              <Field label="Observaciones" value={n.observaciones} full />
            )}
          </div>
        ))}
      </Section>

      {/* Observaciones generales */}
      {(s.fortalezasDetectadas.length > 0 ||
        s.restriccionesDetectadas.length > 0 ||
        s.comentariosFinales) && (
        <Section title="Observaciones generales">
          {s.fortalezasDetectadas.length > 0 && (
            <TagList
              label="Fortalezas detectadas"
              items={s.fortalezasDetectadas}
              color="#1D9E75"
            />
          )}
          {s.restriccionesDetectadas.length > 0 && (
            <TagList
              label="Restricciones detectadas"
              items={s.restriccionesDetectadas}
              color="#dc2626"
            />
          )}
          {s.comentariosFinales && (
            <Field
              label="Comentarios finales"
              value={s.comentariosFinales}
              full
            />
          )}
        </Section>
      )}

      {/* Próximos pasos */}
      {s.proximosPasos.length > 0 && (
        <Section title="Próximos pasos">
          {s.proximosPasos.map((paso, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                padding: "8px 0",
                borderBottom: "1px solid #f5f5f5",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#2563eb",
                  minWidth: "24px",
                  fontWeight: "600",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: "13px", color: "#444" }}>{paso}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Elaborado por */}
      <Section title="Registro interno">
        <Grid>
          <Field label="Elaborado por" value={s.elaboradoPorNombre} />
          <Field label="Cargo" value={s.elaboradoPorCargo} />
          <Field label="Fecha de elaboración" value={s.elaboradoPorFecha} />
          <Field
            label="Creado en sistema"
            value={new Date(s.createdAt).toLocaleDateString("es-VE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
        </Grid>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div
        style={{
          fontWeight: "600",
          fontSize: "13px",
          color: "#0a1628",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          borderBottom: "2px solid #0a1628",
          paddingBottom: "8px",
          marginBottom: "16px",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px",
        marginBottom: "12px",
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, value, full }) {
  if (!value) return null;
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <div
        style={{
          fontSize: "10px",
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "3px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "#111", lineHeight: "1.5" }}>
        {value}
      </div>
    </div>
  );
}

function TagList({ label, items, color }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          fontSize: "10px",
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {items.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: "12px",
              padding: "3px 10px",
              background: color ? `${color}15` : "#f4f6f9",
              color: color ?? "#5a6478",
              borderRadius: "20px",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
