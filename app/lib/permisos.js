// ─── Matriz de permisos por rol ────────────────────────────────────────────────
//
//  admin       → acceso total
//  trabajador  → operativo: gestiona solicitudes, proveedores, catálogo, clientes
//                artículos solo lectura, sin acceso a Sistema
//  cliente     → vista limitada: solo sus solicitudes/adquisiciones,
//                catálogo y proveedores filtrados por rubros

const PERMISOS = {
  admin: {
    solicitudes:   'write',
    adquisiciones: 'write',
    contratos:     'write',
    catalogo:      'write',
    proveedores:   'write',
    clientes:      'write',
    articulos:     'write',
    mensajes:      'write',
    reportes:      'write',
    sistema:       'write',
    inteligencia:  'read',      // dashboard BI (solo lectura)
    perfil:        'write',
  },
  trabajador: {
    solicitudes:   'write',
    adquisiciones: 'write',
    contratos:     'write',
    catalogo:      'write',
    proveedores:   'write',
    clientes:      'write',
    articulos:     'read',
    mensajes:      'write',
    reportes:      null,       // sin acceso
    sistema:       null,       // sin acceso
    inteligencia:  null,       // sin acceso — solo administrador
    perfil:        'write',
  },
  cliente: {
    solicitudes:   'write',    // solo las propias (filtradas por clienteId)
    adquisiciones: 'read',     // solo las propias (filtradas por clienteId)
    contratos:     null,       // sin acceso
    catalogo:      'filtered', // filtrado por rubros del cliente
    proveedores:   'filtered', // filtrado por rubros del cliente
    clientes:      null,       // sin acceso
    articulos:     null,       // sin acceso
    mensajes:      'write',
    reportes:      null,       // sin acceso
    sistema:       null,       // sin acceso
    inteligencia:  null,       // sin acceso
    perfil:        'write',
  },
}

// ─── Módulo → rutas ────────────────────────────────────────────────────────────
const RUTA_A_MODULO = [
  { modulo: 'solicitudes',   pattern: /^\/admin\/solicitudes/ },
  { modulo: 'adquisiciones', pattern: /^\/admin\/adquisiciones/ },
  { modulo: 'contratos',     pattern: /^\/admin\/contratos/ },
  { modulo: 'catalogo',      pattern: /^\/admin\/catalogo/ },
  { modulo: 'proveedores',   pattern: /^\/admin\/proveedores/ },
  { modulo: 'clientes',      pattern: /^\/admin\/clientes/ },
  { modulo: 'articulos',     pattern: /^\/admin\/(articulos|categorias)/ },
  { modulo: 'mensajes',      pattern: /^\/admin\/contactos/ },
  { modulo: 'reportes',      pattern: /^\/admin\/reportes/ },
  { modulo: 'inteligencia',  pattern: /^\/admin\/inteligencia/ },
  { modulo: 'sistema',       pattern: /^\/admin\/(equipo|planes|configuracion|roles)/ },
  { modulo: 'perfil',        pattern: /^\/admin\/equipo\/perfil/ },
]

/**
 * Determina a qué módulo pertenece una ruta.
 * @param {string} pathname
 * @returns {string|null} nombre del módulo o null
 */
export function getModulo(pathname) {
  for (const { modulo, pattern } of RUTA_A_MODULO) {
    if (pattern.test(pathname)) return modulo
  }
  return null
}

/**
 * Devuelve el nivel de acceso para un rol en un módulo.
 * @param {string} role - "admin" | "trabajador" | "cliente"
 * @param {string} modulo
 * @returns {'write'|'read'|'filtered'|null}
 */
export function getAcceso(role, modulo) {
  const rolePerms = PERMISOS[role] ?? PERMISOS.cliente
  return rolePerms[modulo] ?? null
}

/**
 * Verifica si un rol puede acceder a una ruta.
 * @returns {boolean}
 */
export function puedeAcceder(role, pathname) {
  // /admin siempre accesible (dashboard)
  if (pathname === '/admin') return true

  const modulo = getModulo(pathname)
  if (!modulo) return true // rutas no mapeadas: acceso permitido por defecto

  const acceso = getAcceso(role, modulo)
  return acceso !== null
}

// ─── Navegación del sidebar por rol ────────────────────────────────────────────
export function getNavForRole(role) {
  const links = {
    solicitudes:   { href: '/admin/solicitudes',   label: 'Solicitud de Adquisición', icon: 'solicitudes' },
    adquisiciones: { href: '/admin/adquisiciones', label: 'Estudio de Mercado',       icon: 'adquisicion' },
    contratos:     { href: '/admin/contratos',     label: 'Contratos de Compra',      icon: 'contratos' },
    catalogo:      { href: '/admin/catalogo',      label: 'Catálogo',                 icon: 'catalogo' },
    proveedores:   { href: '/admin/proveedores',   label: 'Directorio',               icon: 'proveedores' },
    clientes:      { href: '/admin/clientes',      label: 'Base de Clientes',         icon: 'clientes' },
    articulos:     { href: '/admin/articulos',     label: 'Artículos',                icon: 'articulos' },
    mensajes:      { href: '/admin/contactos',     label: 'Mensajes',                 icon: 'mensajes' },
    inteligencia:  { href: '/admin/inteligencia',  label: 'Inteligencia de Proveedores', icon: 'inteligencia' },
  }

  const nav = []

  if (role === 'cliente') {
    // Vista limitada para clientes
    nav.push({
      title: 'Documentos',
      items: [
        { ...links.solicitudes, label: 'Mis Solicitudes' },
        { ...links.adquisiciones, label: 'Mis Adquisiciones' },
      ],
    })
    nav.push({
      title: 'Proveedores',
      items: [
        { ...links.catalogo, label: 'Catálogo', hint: 'filtrado' },
        { ...links.proveedores, label: 'Directorio', hint: 'filtrado' },
      ],
    })
    nav.push({
      title: 'Comunicación',
      items: [links.mensajes],
    })
  } else if (role === 'trabajador') {
    // Vista operativa
    nav.push({
      items: [{ href: '/admin', label: 'Dashboard', icon: 'dashboard' }],
    })
    nav.push({
      title: 'Documentos',
      items: [links.solicitudes, links.adquisiciones, links.contratos],
    })
    nav.push({
      title: 'Contenido',
      items: [{ ...links.articulos, hint: 'lectura' }],
    })
    nav.push({
      title: 'Proveedores',
      items: [links.proveedores, links.catalogo],
    })
    nav.push({
      title: 'Clientes',
      items: [links.clientes],
    })
    nav.push({
      title: 'Comunicación',
      items: [links.mensajes],
    })
  } else {
    // Admin: acceso total
    nav.push({
      items: [{ href: '/admin', label: 'Dashboard', icon: 'dashboard' }],
    })
    nav.push({
      title: 'Documentos',
      items: [links.solicitudes, links.adquisiciones, links.contratos],
    })
    nav.push({
      title: 'Contenido',
      items: [links.articulos, { href: '/admin/categorias', label: 'Categorías', icon: 'categorias' }],
    })
    nav.push({
      title: 'Proveedores',
      items: [links.proveedores, { href: '/admin/planes', label: 'Planes', icon: 'planes' }, links.catalogo],
    })
    nav.push({
      title: 'Clientes',
      items: [links.clientes],
    })
    nav.push({
      title: 'Verificación',
      items: [{ href: '/admin/reportes', label: 'Informes de Verificación', icon: 'reportes' }],
    })
    nav.push({
      title: 'Inteligencia',
      items: [links.inteligencia],
    })
    nav.push({
      title: 'Sistema',
      items: [
        { href: '/admin/equipo', label: 'Equipo', icon: 'equipo' },
        links.mensajes,
      ],
    })
  }

  return nav
}

export { PERMISOS }
