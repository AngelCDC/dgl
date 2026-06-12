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
 * Obtiene una clave de rate limit basada en IP + ruta.
 * @param {Request} req
 * @param {string}  route - ej: 'contacto', 'search', 'auth'
 * @returns {string}
 */
export function getRateLimitKey(req, route = 'global') {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1'
  return `rl:${route}:${ip}`
}
