"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "../../components/ImageUpload";

export default function ProveedorForm({ proveedor, categorias, planes }) {
  const [logoUrl, setLogoUrl] = useState(proveedor?.logoUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(proveedor?.coverUrl ?? "");
  const router = useRouter();
  const [form, setForm] = useState({
    name: proveedor?.name ?? "",
    country: proveedor?.country ?? "",
    city: proveedor?.city ?? "",
    description: proveedor?.description ?? "",
    website: proveedor?.website ?? "",
    email: proveedor?.email ?? "",
    phone: proveedor?.phone ?? "",
    whatsapp: proveedor?.whatsapp ?? "",
    categoryId: proveedor?.categoryId ?? "",
    planId: proveedor?.planId ?? "",
    status: proveedor?.status ?? "pending",
    verified: proveedor?.verified ?? false,
    featured: proveedor?.featured ?? false,
    internalNotes: proveedor?.internalNotes ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    const slug = form.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const body = {
      ...form,
      slug,
      categoryId: form.categoryId || null,
      planId: form.planId || null,
      logoUrl,
      coverUrl,
    };

    const res = await fetch(
      proveedor
        ? `/api/admin/proveedores/${proveedor.id}`
        : "/api/admin/proveedores",
      {
        method: proveedor ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    setSaving(false);
    if (res.ok) router.push("/admin/proveedores");
    else alert("Error al guardar");
  }

  return (
    <div className="pf-root">
      <style jsx>{`
        .pf-root {
          background: #f5f6f8;
          min-height: 100vh;
          font-family: inherit;
        }

        /* ── Sticky top bar ── */
        .pf-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: white;
          border-bottom: 1px solid #e8e8e8;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .pf-topbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .pf-topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }
        .pf-back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #888;
          cursor: pointer;
          white-space: nowrap;
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
          transition: color 0.15s;
        }
        .pf-back-link:hover { color: #111; }
        .pf-topbar-divider {
          width: 1px;
          height: 20px;
          background: #e0e0e0;
          flex-shrink: 0;
        }
        .pf-topbar-title {
          font-size: 15px;
          font-weight: 600;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pf-topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .pf-btn-cancel {
          height: 34px;
          padding: 0 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          font-size: 13px;
          color: #555;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s, color 0.15s;
        }
        .pf-btn-cancel:hover { border-color: #bbb; color: #111; }
        .pf-btn-save {
          height: 34px;
          padding: 0 18px;
          border: none;
          border-radius: 8px;
          background: #111;
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .pf-btn-save:hover:not(:disabled) { background: #333; }
        .pf-btn-save:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Page body ── */
        .pf-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 32px;
        }

        /* ── Two-column grid ── */
        .pf-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          align-items: start;
        }

        /* ── Left column ── */
        .pf-left-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── Section group header above cards ── */
        .pf-section-label {
          font-size: 10px;
          font-weight: 700;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        /* ── Cards ── */
        .pf-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pf-card-header {
          font-size: 12px;
          font-weight: 700;
          color: #555;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        /* ── Right column ── */
        .pf-right-col {
          position: sticky;
          top: 72px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pf-right-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pf-right-card-header {
          font-size: 11px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        /* ── Form fields ── */
        .pf-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .pf-label {
          font-size: 11px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .pf-input {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          color: #111;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          background: white;
          transition: border-color 0.15s;
        }
        .pf-input:focus { border-color: #2563eb; }
        .pf-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          color: #111;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          resize: vertical;
          background: white;
          transition: border-color 0.15s;
          line-height: 1.5;
        }
        .pf-textarea:focus { border-color: #2563eb; }
        .pf-select {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          color: #111;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          background: white;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .pf-select:focus { border-color: #2563eb; }

        /* ── Grid two columns inside card ── */
        .pf-grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        /* ── Toggle switch ── */
        .pf-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .pf-toggle-label {
          font-size: 13px;
          color: #333;
          font-weight: 500;
        }
        .pf-toggle-sub {
          font-size: 11px;
          color: #aaa;
          margin-top: 1px;
        }
        .pf-toggle {
          position: relative;
          width: 40px;
          height: 22px;
          flex-shrink: 0;
          cursor: pointer;
        }
        .pf-toggle input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }
        .pf-toggle-track {
          position: absolute;
          inset: 0;
          border-radius: 11px;
          transition: background 0.2s;
        }
        .pf-toggle-track.on  { background: #2563eb; }
        .pf-toggle-track.off { background: #d1d5db; }
        .pf-toggle-thumb {
          position: absolute;
          top: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: left 0.2s;
        }
        .pf-toggle-thumb.on  { left: 21px; }
        .pf-toggle-thumb.off { left: 3px; }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .pf-grid {
            grid-template-columns: 1fr;
          }
          .pf-right-col {
            position: static;
          }
          .pf-topbar-inner {
            padding: 0 16px;
          }
          .pf-body {
            padding: 20px 16px;
          }
        }
      `}</style>

      {/* ── Sticky top bar ── */}
      <div className="pf-topbar">
        <div className="pf-topbar-inner">
          <div className="pf-topbar-left">
            <button
              className="pf-back-link"
              onClick={() => router.push("/admin/proveedores")}
            >
              ← Proveedores
            </button>
            <div className="pf-topbar-divider" />
            <span className="pf-topbar-title">
              {proveedor ? "Editar proveedor" : "Nuevo proveedor"}
            </span>
          </div>
          <div className="pf-topbar-actions">
            <button
              className="pf-btn-cancel"
              onClick={() => router.push("/admin/proveedores")}
            >
              Cancelar
            </button>
            <button
              className="pf-btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="pf-body">
        <div className="pf-grid">

          {/* ── LEFT column ── */}
          <div className="pf-left-col">

            {/* Card: Información básica */}
            <div className="pf-card">
              <div className="pf-card-header">Información básica</div>
              <div className="pf-field">
                <label className="pf-label">Nombre del proveedor</label>
                <input
                  className="pf-input"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ej: TechParts Co."
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">Descripción</label>
                <textarea
                  className="pf-textarea"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  placeholder="¿Qué ofrece este proveedor?"
                />
              </div>
              <div className="pf-grid2">
                <div className="pf-field">
                  <label className="pf-label">País</label>
                  <input
                    className="pf-input"
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    placeholder="China"
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">Ciudad</label>
                  <input
                    className="pf-input"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="Guangzhou"
                  />
                </div>
              </div>
            </div>

            {/* Card: Contacto */}
            <div className="pf-card">
              <div className="pf-card-header">Contacto</div>
              <div className="pf-grid2">
                <div className="pf-field">
                  <label className="pf-label">Email</label>
                  <input
                    className="pf-input"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="contacto@proveedor.com"
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">Sitio web</label>
                  <input
                    className="pf-input"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">Teléfono</label>
                  <input
                    className="pf-input"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+86 …"
                  />
                </div>
                <div className="pf-field">
                  <label className="pf-label">WhatsApp</label>
                  <input
                    className="pf-input"
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="+58 …"
                  />
                </div>
              </div>
            </div>

            {/* Card: Notas internas */}
            <div className="pf-card">
              <div className="pf-card-header">Notas internas</div>
              <div className="pf-field">
                <textarea
                  className="pf-textarea"
                  value={form.internalNotes}
                  onChange={(e) => set("internalNotes", e.target.value)}
                  rows={3}
                  placeholder="Notas privadas, no visibles al público…"
                  style={{ fontStyle: "italic" }}
                />
              </div>
            </div>

          </div>

          {/* ── RIGHT column ── */}
          <div className="pf-right-col">

            {/* Card: Clasificación */}
            <div className="pf-right-card">
              <div className="pf-right-card-header">Clasificación</div>
              <div className="pf-field">
                <label className="pf-label">Categoría</label>
                <select
                  className="pf-select"
                  value={form.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pf-field">
                <label className="pf-label">Plan</label>
                <select
                  className="pf-select"
                  value={form.planId}
                  onChange={(e) => set("planId", e.target.value)}
                >
                  <option value="">Sin plan</option>
                  {planes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.price > 0 ? `— $${p.price}` : "— Gratis"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pf-field">
                <label className="pf-label">Estado</label>
                <select
                  className="pf-select"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option value="pending">Pendiente</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>
            </div>

            {/* Card: Visibilidad */}
            <div className="pf-right-card">
              <div className="pf-right-card-header">Visibilidad</div>

              {/* Toggle: Verificado */}
              <div className="pf-toggle-row">
                <div>
                  <div className="pf-toggle-label">Proveedor verificado</div>
                  <div className="pf-toggle-sub">Muestra insignia verificado</div>
                </div>
                <label className="pf-toggle">
                  <input
                    type="checkbox"
                    checked={form.verified}
                    onChange={(e) => set("verified", e.target.checked)}
                  />
                  <div className={`pf-toggle-track ${form.verified ? "on" : "off"}`} />
                  <div className={`pf-toggle-thumb ${form.verified ? "on" : "off"}`} />
                </label>
              </div>

              {/* Toggle: Destacado */}
              <div className="pf-toggle-row">
                <div>
                  <div className="pf-toggle-label">Destacado en directorio</div>
                  <div className="pf-toggle-sub">Aparece en sección destacados</div>
                </div>
                <label className="pf-toggle">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                  />
                  <div className={`pf-toggle-track ${form.featured ? "on" : "off"}`} />
                  <div className={`pf-toggle-thumb ${form.featured ? "on" : "off"}`} />
                </label>
              </div>
            </div>

            {/* Card: Imágenes */}
            <div className="pf-right-card">
              <div className="pf-right-card-header">Imágenes</div>
              <div className="pf-field">
                <label className="pf-label">Logo</label>
                <ImageUpload
                  label=""
                  value={logoUrl}
                  onChange={setLogoUrl}
                  aspectRatio="1/1"
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">Portada</label>
                <ImageUpload
                  label=""
                  value={coverUrl}
                  onChange={setCoverUrl}
                  aspectRatio="16/9"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
