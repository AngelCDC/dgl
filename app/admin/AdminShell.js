"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { getNavForRole } from "../lib/permisos";

// ─── Iconos SVG inline ────────────────────────────────────────────────────────
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const ICONS = {
  dashboard:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  solicitudes:  "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  adquisicion:  "M9 17H7A5 5 0 017 7h2 M15 7h2a5 5 0 010 10h-2 M8 12h8",
  contratos:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M9 15l2 2 4-4",
  articulos:    "M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  categorias:   "M4 6h16M4 12h16M4 18h7",
  proveedores:  "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  planes:       "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z",
  catalogo:     "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16",
  clientes:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z M16 11c1.66 0 3 .9 3 2",
  equipo:       "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  mensajes:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  reportes:     "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4",
  inteligencia: "M3 3v18h18 M8 17v-3 M13 17V5 M18 17V9",
  logout:       "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  menu:         "M3 12h18 M3 6h18 M3 18h18",
  close:        "M18 6L6 18 M6 6l12 12",
  chevron:      "M9 18l6-6-6-6",
}

// ─── Navegación dinámica según rol ────────────────────────────────────────────
// (la NAV estática se reemplaza por getNavForRole(role) en SidebarInner)

// ─── Shell principal ──────────────────────────────────────────────────────────
export default function AdminShell({ children, userName, userRole }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const role = userRole || 'trabajador';

  const initials = userName
    ? userName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="ash-root">

      {/* ── Topbar móvil ──────────────────────────────────────────────────── */}
      <header className="ash-mobile-header">
        <div className="ash-brand">
          <span className="ash-brand-logo">DGL</span>
          <span className="ash-brand-sub">Back Office</span>
        </div>
        <button className="ash-icon-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
          <Icon d={ICONS.menu} size={20} />
        </button>
      </header>

      <div className="ash-body">

        {/* ── Sidebar desktop ───────────────────────────────────────────────── */}
        <aside className="ash-sidebar ash-sidebar-desktop">
          <SidebarInner
            pathname={pathname}
            userName={userName}
            initials={initials}
            role={role}
            onNavigate={null}
          />
        </aside>

        {/* ── Área de contenido ─────────────────────────────────────────────── */}
        <div className="ash-main">

          {/* Topbar desktop (breadcrumb + usuario) */}
          <div className="ash-topbar-desktop">
            <PageTitle pathname={pathname} />
            <div className="ash-topbar-right">
              <div className="ash-user-chip">
                <div className="ash-avatar ash-avatar-sm">{initials}</div>
                <span className="ash-user-name-sm">{userName || "Usuario"}</span>
              </div>
            </div>
          </div>

          {/* Contenido de la página */}
          <main className="ash-content">
            {children}
          </main>
        </div>
      </div>

      {/* ── Overlay móvil ─────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="ash-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* ── Drawer móvil ──────────────────────────────────────────────────── */}
      <aside className={`ash-sidebar ash-drawer ${menuOpen ? "ash-drawer-open" : ""}`}>
        <div className="ash-drawer-header">
          <div className="ash-brand">
            <span className="ash-brand-logo">DGL</span>
            <span className="ash-brand-sub">Back Office</span>
          </div>
          <button className="ash-icon-btn" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
            <Icon d={ICONS.close} size={18} />
          </button>
        </div>
        <SidebarInner
          pathname={pathname}
          userName={userName}
          initials={initials}
          role={role}
          onNavigate={() => setMenuOpen(false)}
        />
      </aside>

      <style jsx global>{`
        /* ── Variables ───────────────────────────────────────────────────── */
        :root {
          --ash-bg:       #0b1628;
          --ash-bg2:      #111f36;
          --ash-border:   rgba(255,255,255,0.07);
          --ash-text:     rgba(255,255,255,0.55);
          --ash-text-hi:  rgba(255,255,255,0.92);
          --ash-accent:   #2563eb;
          --ash-accent-bg:rgba(37,99,235,0.12);
          --ash-w:        248px;
          --ash-content-max: 1440px;
        }

        /* ── Root layout ─────────────────────────────────────────────────── */
        .ash-root {
          min-height: 100vh;
          font-family: system-ui, "Inter", sans-serif;
          background: #f4f6f9;
        }
        .ash-body {
          display: flex;
          min-height: 100vh;
        }

        /* ── Sidebar ─────────────────────────────────────────────────────── */
        .ash-sidebar {
          width: var(--ash-w);
          background: var(--ash-bg);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .ash-sidebar-desktop {
          display: none;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .ash-sidebar-desktop::-webkit-scrollbar { width: 0; }

        /* ── Topbar desktop ──────────────────────────────────────────────── */
        .ash-topbar-desktop {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 56px;
          background: white;
          border-bottom: 1px solid #eee;
          position: sticky;
          top: 0;
          z-index: 20;
          flex-shrink: 0;
        }
        .ash-page-title {
          font-size: 14px;
          font-weight: 600;
          color: #111;
        }
        .ash-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ash-user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 10px 5px 5px;
          border: 1px solid #eee;
          border-radius: 40px;
          background: #fafafa;
        }
        .ash-user-name-sm {
          font-size: 13px;
          color: #444;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Main content ────────────────────────────────────────────────── */
        .ash-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: #f4f6f9;
        }
        .ash-content {
          flex: 1;
          min-height: 0;
        }

        /* ── Mobile header ───────────────────────────────────────────────── */
        .ash-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: var(--ash-bg);
          border-bottom: 1px solid var(--ash-border);
          position: sticky;
          top: 0;
          z-index: 40;
        }

        /* ── Brand ───────────────────────────────────────────────────────── */
        .ash-brand {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .ash-brand-logo {
          font-size: 16px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
        }
        .ash-brand-sub {
          font-size: 11px;
          color: var(--ash-text);
          letter-spacing: 0.02em;
        }

        /* ── Icon button ─────────────────────────────────────────────────── */
        .ash-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--ash-border);
          border-radius: 8px;
          background: transparent;
          color: var(--ash-text);
          cursor: pointer;
          transition: all 0.15s;
        }
        .ash-icon-btn:hover {
          background: var(--ash-bg2);
          color: var(--ash-text-hi);
        }

        /* ── Sidebar header ──────────────────────────────────────────────── */
        .ash-sidebar-header {
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--ash-border);
        }

        /* ── Nav ─────────────────────────────────────────────────────────── */
        .ash-nav {
          flex: 1;
          padding: 8px 12px;
          overflow-y: auto;
        }
        .ash-nav::-webkit-scrollbar { width: 0; }

        .ash-section-title {
          font-size: 9.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 16px 8px 6px;
        }

        .ash-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 7px;
          font-size: 13px;
          color: var(--ash-text);
          text-decoration: none;
          margin-bottom: 1px;
          transition: background 0.12s, color 0.12s;
          position: relative;
          overflow: hidden;
        }
        .ash-nav-link:hover {
          background: var(--ash-bg2);
          color: var(--ash-text-hi);
        }
        .ash-nav-link-active {
          background: var(--ash-accent-bg);
          color: var(--ash-text-hi);
          font-weight: 500;
        }
        .ash-nav-link-active::before {
          content: "";
          position: absolute;
          left: 0; top: 4px; bottom: 4px;
          width: 3px;
          background: var(--ash-accent);
          border-radius: 0 3px 3px 0;
        }
        .ash-nav-icon {
          flex-shrink: 0;
          opacity: 0.7;
        }
        .ash-nav-link-active .ash-nav-icon,
        .ash-nav-link:hover .ash-nav-icon {
          opacity: 1;
        }

        /* ── Sidebar footer ──────────────────────────────────────────────── */
        .ash-sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid var(--ash-border);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ash-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--ash-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        .ash-avatar-sm {
          width: 26px;
          height: 26px;
          font-size: 10px;
        }
        .ash-user-info {
          flex: 1;
          min-width: 0;
        }
        .ash-user-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--ash-text-hi);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ash-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border: 1px solid var(--ash-border);
          border-radius: 7px;
          background: transparent;
          color: var(--ash-text);
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .ash-logout-btn:hover {
          background: rgba(220,38,38,0.1);
          border-color: rgba(220,38,38,0.3);
          color: #f87171;
        }

        /* ── Drawer (móvil) ──────────────────────────────────────────────── */
        .ash-drawer {
          position: fixed;
          top: 0;
          left: -280px;
          width: 260px;
          height: 100vh;
          z-index: 90;
          transition: left 0.24s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }
        .ash-drawer-open {
          left: 0;
        }
        .ash-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 16px;
          border-bottom: 1px solid var(--ash-border);
        }
        .ash-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 80;
          backdrop-filter: blur(2px);
        }

        /* ── Responsive ──────────────────────────────────────────────────── */
        @media (min-width: 768px) {
          .ash-mobile-header  { display: none !important; }
          .ash-drawer         { display: none !important; }
          .ash-sidebar-desktop{ display: flex !important; }
          .ash-topbar-desktop { display: flex !important; }
        }

        @media (max-width: 767px) {
          .ash-sidebar-desktop{ display: none !important; }
          .ash-topbar-desktop { display: none !important; }
        }

        /* Pantallas grandes: más ancho de sidebar */
        @media (min-width: 1400px) {
          :root { --ash-w: 260px; }
        }
      `}</style>
    </div>
  );
}

// ─── Contenido del sidebar (usado tanto en desktop como en drawer) ─────────────
function SidebarInner({ pathname, userName, initials, role, onNavigate }) {
  const nav = getNavForRole(role);

  const roleBadge = {
    admin:      { label: 'Admin',      color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    trabajador: { label: 'Trabajador', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    cliente:    { label: 'Cliente',    color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  }[role] || { label: role, color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };

  return (
    <>
      {/* Header del sidebar — solo en desktop */}
      <div className="ash-sidebar-header">
        <div className="ash-brand">
          <span className="ash-brand-logo">DGL</span>
          <span className="ash-brand-sub">Back Office</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="ash-nav">
        {nav.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <div className="ash-section-title">{group.title}</div>
            )}
            {group.items.map(item => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                pathname={pathname}
                onNavigate={onNavigate}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.label}
                  {item.hint && (
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)',
                      letterSpacing: '0.04em',
                    }}>{item.hint}</span>
                  )}
                </span>
              </NavLink>
            ))}
          </div>
        ))}

        {/* Separador + Mi Perfil (siempre visible) */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <NavLink
            href="/admin/equipo/perfil"
            icon="equipo"
            pathname={pathname}
            onNavigate={onNavigate}
          >
            Mi Perfil
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="ash-sidebar-footer">
        <div className="ash-avatar">{initials}</div>
        <div className="ash-user-info">
          <div className="ash-user-name">{userName || "Usuario"}</div>
          <div style={{
            fontSize: 10, fontWeight: 600,
            color: roleBadge.color, marginTop: 1,
          }}>
            {roleBadge.label}
          </div>
        </div>
        <button
          className="ash-logout-btn"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Cerrar sesión"
        >
          <Icon d={ICONS.logout} size={14} />
        </button>
      </div>
    </>
  );
}

// ─── NavLink ──────────────────────────────────────────────────────────────────
function NavLink({ href, icon, children, pathname, onNavigate }) {
  const exact  = href === "/admin";
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`ash-nav-link ${active ? "ash-nav-link-active" : ""}`}
    >
      <span className="ash-nav-icon">
        <Icon d={ICONS[icon]} size={15} />
      </span>
      {children}
    </Link>
  );
}

// ─── Título de página en el topbar desktop ────────────────────────────────────
const PAGE_TITLES = {
  "/admin":            "Dashboard",
  "/admin/solicitudes":"Solicitudes de Adquisición",
  "/admin/adquisiciones":"Estudio de Mercado",
  "/admin/contratos":  "Contratos de Compra",
  "/admin/articulos":  "Artículos",
  "/admin/categorias": "Categorías",
  "/admin/proveedores":"Proveedores",
  "/admin/planes":     "Planes",
  "/admin/catalogo":   "Catálogo de Productos",
  "/admin/clientes":   "Base de Clientes",
  "/admin/equipo":     "Equipo",
  "/admin/contactos":  "Mensajes",
  "/admin/reportes":  "Informes de Verificación",
  "/admin/grupos":    "Grupos Empresariales",
  "/admin/inteligencia": "Inteligencia de Proveedores",
  "/admin/equipo/perfil": "Mi Perfil",
  "/admin/configuracion": "Configuración",
  "/admin/roles":      "Roles y Permisos",
};

function PageTitle({ pathname }) {
  // Buscar la ruta más específica que coincida
  const key = Object.keys(PAGE_TITLES)
    .filter(k => pathname === k || pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="ash-page-title">
      {PAGE_TITLES[key] ?? "Back Office"}
    </div>
  );
}
