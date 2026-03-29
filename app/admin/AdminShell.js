"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminShell({ children, userName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        background: "#f9f9f9",
      }}
    >
      {/* Header móvil */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "white",
          borderBottom: "1px solid #eee",
        }}
        className="admin-mobile-header"
      >
        <div>
          <div style={{ fontWeight: "600", fontSize: "15px" }}>DGL</div>
          <div style={{ fontSize: "12px", color: "#888" }}>Back Office</div>
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          style={{
            border: "1px solid #ddd",
            background: "white",
            borderRadius: "8px",
            padding: "8px 10px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Menú
        </button>
      </div>

      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 59px)",
        }}
      >
        {/* Sidebar desktop */}
        <aside
          className="admin-sidebar-desktop"
          style={{
            width: "220px",
            background: "white",
            borderRight: "1px solid #eee",
            flexShrink: 0,
            display: "none",
            flexDirection: "column",
          }}
        >
          <SidebarContent pathname={pathname} userName={userName} />
        </aside>

        {/* Contenido */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            background: "#f9f9f9",
          }}
        >
          {children}
        </main>
      </div>

      {/* Overlay móvil */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 80,
          }}
        />
      )}

      {/* Drawer móvil */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: menuOpen ? 0 : "-280px",
          width: "260px",
          height: "100vh",
          background: "white",
          borderRight: "1px solid #eee",
          zIndex: 90,
          transition: "left 0.25s ease",
          display: "flex",
          flexDirection: "column",
        }}
        className="admin-sidebar-mobile"
      >
        <div
          style={{
            padding: "20px 16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: "600", fontSize: "15px" }}>DGL</div>
            <div style={{ fontSize: "12px", color: "#888" }}>Back Office</div>
          </div>

          <button
            onClick={() => setMenuOpen(false)}
            style={{
              border: "1px solid #ddd",
              background: "white",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <SidebarNav
            pathname={pathname}
            onNavigate={() => setMenuOpen(false)}
          />
        </div>

        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #eee",
            fontSize: "13px",
            color: "#888",
          }}
        >
          {userName || "Usuario"}
        </div>
      </aside>

      <style jsx>{`
        .admin-sidebar-desktop {
          display: none;
        }

        @media (min-width: 768px) {
          .admin-mobile-header {
            display: none !important;
          }

          .admin-sidebar-desktop {
            display: flex;
            min-height: 100vh;
            position: sticky;
            top: 0;
          }

          .admin-sidebar-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function SidebarContent({ pathname, userName }) {
  return (
    <>
      <div style={{ padding: "20px 16px", borderBottom: "1px solid #eee" }}>
        <div style={{ fontWeight: "600", fontSize: "15px" }}>DGL</div>
        <div style={{ fontSize: "12px", color: "#888" }}>Back Office</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <SidebarNav pathname={pathname} />
      </div>

      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #eee",
          fontSize: "13px",
          color: "#888",
        }}
      >
        {userName || "Usuario"}
      </div>
    </>
  );
}

function SidebarNav({ pathname, onNavigate }) {
  return (
    <nav style={{ padding: "12px 8px" }}>
      <NavLink href="/admin" pathname={pathname} onNavigate={onNavigate}>
        Dashboard
      </NavLink>

      <SectionTitle>Cotizaciones</SectionTitle>
      <NavLink
        href="/admin/solicitudes/nueva"
        pathname={pathname}
        onNavigate={onNavigate}
      >
        Generar Solicitud de procura
      </NavLink>

      <SectionTitle>Contenido</SectionTitle>
      <NavLink
        href="/admin/articulos"
        pathname={pathname}
        onNavigate={onNavigate}
      >
        Artículos
      </NavLink>
      <NavLink
        href="/admin/categorias"
        pathname={pathname}
        onNavigate={onNavigate}
      >
        Categorías
      </NavLink>

      <SectionTitle>Proveedores</SectionTitle>
      <NavLink
        href="/admin/proveedores"
        pathname={pathname}
        onNavigate={onNavigate}
      >
        Directorio
      </NavLink>
      <NavLink href="/admin/planes" pathname={pathname} onNavigate={onNavigate}>
        Planes
      </NavLink>

      <SectionTitle>Sistema</SectionTitle>
      <NavLink
        href="/admin/solicitudes"
        pathname={pathname}
        onNavigate={onNavigate}
      >
        Solicitudes
      </NavLink>
      <NavLink href="/admin/equipo" pathname={pathname} onNavigate={onNavigate}>
        Equipo
      </NavLink>
    </nav>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: "10px",
        color: "#aaa",
        padding: "12px 8px 4px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {children}
    </div>
  );
}

function NavLink({ href, children, pathname, onNavigate }) {
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onNavigate}
      style={{
        display: "block",
        padding: "10px 12px",
        fontSize: "13px",
        color: active ? "#111" : "#444",
        background: active ? "#f3f3f3" : "transparent",
        textDecoration: "none",
        borderRadius: "8px",
        marginBottom: "4px",
        fontWeight: active ? "600" : "400",
        wordBreak: "break-word",
      }}
    >
      {children}
    </Link>
  );
}
