'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Visor de imágenes (lightbox convencional) ────────────────────────────────
// Vista grande a pantalla completa con: navegación ‹ › (botones y flechas del
// teclado), contador, zoom al hacer clic sobre la imagen y cierre con ✕, clic
// en el fondo o tecla Escape. zIndex 1200 para quedar por encima del
// DetailModal del admin (1000) y del carrito flotante (998).
//
// El keydown se registra en fase de captura y detiene la propagación, para que
// el handler de Escape del DetailModal (registrado en bubbling) no cierre el
// modal por debajo del visor.
export default function LightboxImagenes({ imagenes, indiceInicial = 0, onClose }) {
  const total = imagenes?.length ?? 0
  const [idx,  setIdx]  = useState(Math.min(indiceInicial, Math.max(0, total - 1)))
  const [zoom, setZoom] = useState(false)

  const cerrar = useCallback(() => { onClose?.() }, [onClose])
  const irA    = useCallback(i => { setZoom(false); setIdx(i) }, [])

  const prev = useCallback(() => { if (total > 1) irA((idx - 1 + total) % total) }, [total, idx, irA])
  const next = useCallback(() => { if (total > 1) irA((idx + 1) % total) }, [total, idx, irA])

  // Teclado + bloqueo del scroll de fondo mientras el visor está abierto
  useEffect(() => {
    const h = e => {
      if (e.key === 'Escape')      { e.stopPropagation(); cerrar() }
      else if (e.key === 'ArrowLeft')  { e.stopPropagation(); prev() }
      else if (e.key === 'ArrowRight') { e.stopPropagation(); next() }
    }
    document.addEventListener('keydown', h, { capture: true })
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', h, { capture: true })
      document.body.style.overflow = prevOverflow
    }
  }, [cerrar, prev, next])

  if (total === 0) return null
  // Clamp defensivo: si la galería cambia con el visor abierto (p. ej. borrado),
  // nunca quedarnos con un índice fuera de rango.
  const img = imagenes[Math.min(idx, total - 1)]

  return (
    <div
      onClick={cerrar}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Cerrar */}
      <button
        onClick={cerrar}
        aria-label="Cerrar visor"
        style={{
          position: 'absolute', top: '16px', right: '16px', zIndex: 2,
          width: '44px', height: '44px',
          background: 'rgba(255,255,255,0.12)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%',
          fontSize: '20px', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ✕
      </button>

      {/* Anterior */}
      {total > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev() }}
          aria-label="Imagen anterior"
          style={{ ...arrowStyle, left: '16px' }}
        >
          ‹
        </button>
      )}

      {/* Imagen: clic alterna entre ajustada y tamaño natural (con pan) */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          flex: 1, maxWidth: '100%', maxHeight: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'auto',
        }}
      >
        <img
          src={img.url}
          alt={`Imagen ${idx + 1}`}
          onClick={() => setZoom(z => !z)}
          style={zoom
            ? { width: 'auto', height: 'auto', maxWidth: 'none', maxHeight: 'none', cursor: 'zoom-out', display: 'block' }
            : { maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', cursor: 'zoom-in', display: 'block' }}
        />
      </div>

      {/* Siguiente */}
      {total > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next() }}
          aria-label="Imagen siguiente"
          style={{ ...arrowStyle, right: '16px' }}
        >
          ›
        </button>
      )}

      {/* Contador + pista */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.9)', fontSize: '13px',
          display: 'flex', alignItems: 'center', gap: '12px',
          fontFamily: 'system-ui, sans-serif', whiteSpace: 'nowrap',
        }}
      >
        {total > 1 && <span>{idx + 1} / {total}</span>}
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>
          {total > 1 ? '← → navegar · ' : ''}clic para ampliar · Esc cerrar
        </span>
      </div>
    </div>
  )
}

const arrowStyle = {
  position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2,
  width: '48px', height: '48px',
  background: 'rgba(255,255,255,0.12)', color: '#fff',
  border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%',
  fontSize: '26px', lineHeight: '1', cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0,
}
