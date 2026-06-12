/**
 * Rate limiter simple en memoria.
 * Limpia entradas expiradas cada 60 segundos.
 */

const store = new Map()

// Limpieza periódica cada 60s
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 60_000)
}

/**
 * @param {Object} opts
 * @param {number} opts.windowMs - Ventana de tiempo en ms (default: 60_000)
 * @param {number} opts.max       - Máximo de requests en la ventana (default: 30)
 * @param {string}  opts.id       - Identificador (IP, email, etc.)
 * @returns {{ ok: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit({ windowMs = 60_000, max = 30, id = 'global' } = {}) {
  const now = Date.now()
  const key = id
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    // Nueva ventana
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: max - 1, resetAt: now + windowMs }
  }

  entry.count++

  if (entry.count > max) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { ok: true, remaining: max - entry.count, resetAt: entry.resetAt }
}

/**
 * Obtiene el valor de un header, soportando tanto Headers nativo como objeto plano.
 * @param {Headers|Object} headers
 * @param {string} name
 * @returns {string|undefined}
 */
function getHeader(headers, name) {
  if (!headers) return undefined
  // Native Headers object (Web API Request)
  if (typeof headers.get === 'function') return headers.get(name)
  // Plain object (NextAuth internal, or Express-style)
  if (typeof headers === 'object') return headers[name] ?? headers[name.toLowerCase()]
  return undefined
}

/**
 * Obtiene una clave de rate limit basada en IP + ruta.
 * Acepta tanto un Request nativo como el objeto { headers } que pasa NextAuth a authorize().
 * @param {Request|{headers: Headers|Object}} req
 * @param {string}  route - ej: 'contacto', 'search', 'auth'
 * @returns {string}
 */
export function getRateLimitKey(req, route = 'global') {
  const headers = req?.headers
  const forwarded = getHeader(headers, 'x-forwarded-for')
  const realIp = getHeader(headers, 'x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1'
  return `rl:${route}:${ip}`
}
