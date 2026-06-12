import prisma from './prisma'

/**
 * Devuelve un objeto `where` para filtrar solicitudes/adquisiciones según el rol.
 *
 * Reglas:
 *  - admin       → ve TODO (no filter)
 *  - trabajador  → ve lo creado por trabajadores y clientes (NO lo del admin)
 *  - cliente     → ve SOLO lo que él mismo creó (backoffice personal)
 *
 * @param {object} session - session de next-auth (con user.id y user.role)
 * @param {object} extra   - filtros adicionales (ej: { rubro: { in: [...] } })
 * @returns {object} where para Prisma
 */
export async function buildAccessWhere(session, extra = {}) {
  if (!session?.user?.id) return { ...extra }

  const role = session.user.role

  // Admin ve todo
  if (role === 'admin') return { ...extra }

  // Cliente: solo ve lo que él creó (backoffice personal)
  if (role === 'cliente') {
    return { createdById: session.user.id, ...extra }
  }

  // Trabajador: excluir lo creado por admins
  const adminIds = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true },
  })

  const where = {
    OR: [
      { createdById: null },                           // registros antiguos sin creador
      { createdById: { notIn: adminIds.map(a => a.id) } }, // no creados por admin
    ],
    ...extra,
  }

  return where
}
