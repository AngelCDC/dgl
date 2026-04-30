'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ apiPath, confirmMsg, onDeleted }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const msg = confirmMsg || '¿Eliminar este registro? Esta acción no se puede deshacer.'
    if (!confirm(msg)) return
    setLoading(true)
    try {
      const res = await fetch(apiPath, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        throw new Error(d?.error || 'Error al eliminar')
      }
      if (onDeleted) onDeleted()
      else router.refresh()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        fontSize: '13px',
        padding: '6px 12px',
        border: '1px solid',
        borderColor: loading ? '#eee' : '#fecaca',
        borderRadius: '6px',
        background: 'white',
        color: loading ? '#ccc' : '#dc2626',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? '...' : 'Eliminar'}
    </button>
  )
}
