"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ImageUpload from "../../components/ImageUpload";

const BlockNoteEditorComponent = dynamic(() => import("./BlockNoteEditor"), {
  ssr: false,
});

export default function ArticuloEditor({ articulo, categorias, userId }) {
  const [coverUrl, setCoverUrl] = useState(articulo?.coverUrl ?? "");
  const router = useRouter();
  const [title, setTitle] = useState(articulo?.title ?? "");
  const [excerpt, setExcerpt] = useState(articulo?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(articulo?.categoryId ?? "");
  const [status, setStatus] = useState(articulo?.status ?? "draft");
  const [content, setContent] = useState(articulo?.content ?? null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const body = {
      title,
      slug,
      excerpt,
      categoryId: categoryId || null,
      status,
      content,
      authorId: userId,
      coverUrl,
    };

    const res = await fetch(
      articulo ? `/api/admin/articulos/${articulo.id}` : "/api/admin/articulos",
      {
        method: articulo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    setSaving(false);
    if (res.ok) router.push("/admin/articulos");
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
          {articulo ? "Editar artículo" : "Nuevo artículo"}
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => router.push("/admin/articulos")}
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
        <div>
          <label style={labelStyle}>Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del artículo"
            style={{ ...inputStyle, fontSize: "18px", fontWeight: "500" }}
          />
        </div>

        <div>
          <label style={labelStyle}>Resumen (excerpt)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Breve descripción para listados y SEO"
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <div>
          <ImageUpload
            label="Imagen de portada"
            value={coverUrl}
            onChange={setCoverUrl}
            aspectRatio="16/9"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div>
            <label style={labelStyle}>Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
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
            <label style={labelStyle}>Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={inputStyle}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Contenido</label>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              minHeight: "400px",
              background: "white",
              overflow: "hidden",
            }}
          >
            <BlockNoteEditorComponent
              initialContent={content}
              onChange={setContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
