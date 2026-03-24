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
      .replace(/[\u0300-\u036f]/g, "")
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

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block",
    fontSize: "13px",
    color: "#555",
    marginBottom: "6px",
  };
  const gridTwo = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  };

  return (
    <div style={{ padding: "32px", maxWidth: "860px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: "600" }}>
          {proveedor ? "Editar proveedor" : "Nuevo proveedor"}
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => router.push("/admin/proveedores")}
            style={{
              padding: "8px 16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              background: "white",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 16px",
              background: "#111",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        <SectionTitle>Información básica</SectionTitle>
        <div>
          <label style={labelStyle}>Nombre del proveedor</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            style={inputStyle}
            placeholder="Ej: TechParts Co."
          />
        </div>
        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="¿Qué ofrece este proveedor?"
          />
        </div>
        <div style={gridTwo}>
          <div>
            <label style={labelStyle}>País</label>
            <input
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              style={inputStyle}
              placeholder="China"
            />
          </div>
          <div>
            <label style={labelStyle}>Ciudad</label>
            <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              style={inputStyle}
              placeholder="Guangzhou"
            />
          </div>
        </div>

        <SectionTitle>Imágenes</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <ImageUpload
            label="Logo"
            value={logoUrl}
            onChange={setLogoUrl}
            aspectRatio="1/1"
          />
          <ImageUpload
            label="Imagen de portada"
            value={coverUrl}
            onChange={setCoverUrl}
            aspectRatio="16/9"
          />
        </div>

        <SectionTitle>Contacto</SectionTitle>
        <div style={gridTwo}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              style={inputStyle}
              placeholder="contacto@proveedor.com"
            />
          </div>
          <div>
            <label style={labelStyle}>Sitio web</label>
            <input
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              style={inputStyle}
              placeholder="https://..."
            />
          </div>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              style={inputStyle}
              placeholder="+86 ..."
            />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              style={inputStyle}
              placeholder="+58 ..."
            />
          </div>
        </div>

        <SectionTitle>Clasificación y plan</SectionTitle>
        <div style={gridTwo}>
          <div>
            <label style={labelStyle}>Categoría</label>
            <select
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              style={inputStyle}
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Plan</label>
            <select
              value={form.planId}
              onChange={(e) => set("planId", e.target.value)}
              style={inputStyle}
            >
              <option value="">Sin plan</option>
              {planes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.price > 0 ? `— $${p.price}` : "— Gratis"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Estado</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              style={inputStyle}
            >
              <option value="pending">Pendiente</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) => set("verified", e.target.checked)}
            />
            Proveedor verificado
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            Destacado en directorio
          </label>
        </div>

        <SectionTitle>Notas internas</SectionTitle>
        <div>
          <textarea
            value={form.internalNotes}
            onChange={(e) => set("internalNotes", e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Notas privadas, no visibles al público..."
          />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: "13px",
        fontWeight: "600",
        color: "#444",
        paddingBottom: "8px",
        borderBottom: "1px solid #eee",
        marginTop: "8px",
      }}
    >
      {children}
    </div>
  );
}
