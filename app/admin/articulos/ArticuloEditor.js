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
      .replace(/[̀-ͯ]/g, "")
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

  return (
    <div className="ae-root">
      <style jsx>{`
        .ae-root {
          background: #f5f6f8;
          min-height: 100vh;
          font-family: inherit;
        }

        /* ── Sticky top bar ── */
        .ae-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: white;
          border-bottom: 1px solid #e8e8e8;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .ae-topbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .ae-topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }
        .ae-back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #888;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.15s;
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
        }
        .ae-back-link:hover { color: #111; }
        .ae-topbar-divider {
          width: 1px;
          height: 20px;
          background: #e0e0e0;
          flex-shrink: 0;
        }
        .ae-topbar-title {
          font-size: 15px;
          font-weight: 600;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ae-topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .ae-btn-cancel {
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
        .ae-btn-cancel:hover { border-color: #bbb; color: #111; }
        .ae-btn-save {
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
        .ae-btn-save:hover:not(:disabled) { background: #333; }
        .ae-btn-save:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Page body ── */
        .ae-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 32px;
        }

        /* ── Two-column grid ── */
        .ae-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }

        /* ── Cards ── */
        .ae-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ae-card + .ae-card {
          margin-top: 16px;
        }

        /* ── Section group header ── */
        .ae-section-header {
          font-size: 10px;
          font-weight: 600;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        /* ── Form fields ── */
        .ae-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ae-label {
          font-size: 11px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .ae-title-input {
          width: 100%;
          padding: 10px 0;
          border: none;
          border-bottom: 2px solid transparent;
          border-radius: 0;
          font-size: 22px;
          font-weight: 700;
          color: #111;
          font-family: inherit;
          outline: none;
          background: transparent;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .ae-title-input::placeholder { color: #ccc; }
        .ae-title-input:focus { border-bottom-color: #2563eb; }
        .ae-input {
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
        .ae-input:focus { border-color: #2563eb; }
        .ae-textarea {
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
        .ae-textarea:focus { border-color: #2563eb; }
        .ae-select {
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
        .ae-select:focus { border-color: #2563eb; }

        /* ── Content editor wrapper ── */
        .ae-editor-wrap {
          min-height: 500px;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }

        /* ── Right column ── */
        .ae-right-col {
          position: sticky;
          top: 72px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ae-right-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ae-right-card-header {
          font-size: 11px;
          font-weight: 700;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .ae-grid {
            grid-template-columns: 1fr;
          }
          .ae-right-col {
            position: static;
          }
          .ae-topbar-inner {
            padding: 0 16px;
          }
          .ae-body {
            padding: 20px 16px;
          }
        }
      `}</style>

      {/* ── Sticky top bar ── */}
      <div className="ae-topbar">
        <div className="ae-topbar-inner">
          <div className="ae-topbar-left">
            <button
              className="ae-back-link"
              onClick={() => router.push("/admin/articulos")}
            >
              ← Artículos
            </button>
            <div className="ae-topbar-divider" />
            <span className="ae-topbar-title">
              {articulo ? "Editar artículo" : "Nuevo artículo"}
            </span>
          </div>
          <div className="ae-topbar-actions">
            <button
              className="ae-btn-cancel"
              onClick={() => router.push("/admin/articulos")}
            >
              Cancelar
            </button>
            <button
              className="ae-btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="ae-body">
        <div className="ae-grid">

          {/* ── LEFT column ── */}
          <div className="ae-card">
            {/* Title */}
            <div className="ae-field">
              <input
                className="ae-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del artículo…"
              />
            </div>

            {/* Excerpt */}
            <div className="ae-field">
              <label className="ae-label">Resumen</label>
              <textarea
                className="ae-textarea"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Breve descripción para listados y SEO"
                rows={3}
              />
            </div>

            {/* Content */}
            <div className="ae-field">
              <label className="ae-label">Contenido</label>
              <div className="ae-editor-wrap">
                <BlockNoteEditorComponent
                  initialContent={content}
                  onChange={setContent}
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT column ── */}
          <div className="ae-right-col">

            {/* Card: Publicación */}
            <div className="ae-right-card">
              <div className="ae-right-card-header">Publicación</div>
              <div className="ae-field">
                <label className="ae-label">Estado</label>
                <select
                  className="ae-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
              <div className="ae-field">
                <label className="ae-label">Categoría</label>
                <select
                  className="ae-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Card: Imagen de portada */}
            <div className="ae-right-card">
              <div className="ae-right-card-header">Imagen de portada</div>
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
  );
}
