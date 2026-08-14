// app/lib/contratos.js — utilidades del módulo Contratos de Compra

// Siguiente número secuencial de contrato: DGL-<año>-NNN según lo almacenado en BD.
// Se toma el mayor sufijo numérico existente para el prefijo del año y se le suma 1.
// El número es inmutable una vez creado (el PUT no lo actualiza).
export async function proximoNumeroContrato(prisma, year = new Date().getFullYear()) {
  const prefix = `DGL-${year}-`
  const rows = await prisma.contratoCompra.findMany({
    where: { numero: { startsWith: prefix } },
    select: { numero: true },
  })
  const max = rows.reduce((acc, r) => {
    const n = parseInt(String(r.numero).slice(prefix.length), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

// Extrae el año de una fecha dd/mm/aaaa; null si no es válida
export function yearFromFecha(fecha) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(fecha || '').trim())
  return m ? parseInt(m[3], 10) : null
}
