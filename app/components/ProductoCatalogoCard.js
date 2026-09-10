'use client'

import { useState } from 'react'
import LightboxImagenes from './LightboxImagenes'

// ─── Tarjeta pública de un producto del catálogo (ProductoCatalogo) ──────────
// Se usa en la sección "Catálogo" de la página del proveedor. La primera imagen
// es la principal; las miniaturas la cambian. Clic en la imagen principal o en
// una miniatura abre el visor grande (LightboxImagenes).
export default function ProductoCatalogoCard({ producto: pc }) {
  const imagenes = pc.imagenes ?? []
  const [idx, setIdx] = useState(0)
  const [lightboxIdx, setLightboxIdx] = useState(null)  // null = visor cerrado

  const principal = imagenes.length > 0 ? imagenes[Math.min(idx, imagenes.length - 1)] : null
  const precio = pc.variantes?.[0]?.precio

  return (
    <div style={{ border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      {/* Imagen principal: clic abre el visor en grande */}
      <div style={{ position: 'relative', background: 'var(--bg)', aspectRatio: '4/3', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
        {principal ? (
          <img
            src={principal.url}
            alt={pc.nombre}
            title="Ver en grande"
            onClick={() => setLightboxIdx(idx)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
          />
        ) : (
          <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '36px', color: 'var(--border)' }}>
            {pc.nombre.charAt(0)}
          </span>
        )}
        {principal && (
          <span
            title="Ver en grande"
            onClick={() => setLightboxIdx(idx)}
            style={{
              position: 'absolute', top: '8px', right: '8px',
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)', color: '#fff',
              fontSize: '14px', lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'zoom-in',
            }}
          >
            🔍
          </span>
        )}
      </div>

      {/* Miniaturas (solo si hay más de una) */}
      {imagenes.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {imagenes.map((img, i) => (
            <button
              key={img.id}
              onClick={() => { setIdx(i); setLightboxIdx(i) }}
              aria-label={`Ver imagen ${i + 1} en grande`}
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                border: i === idx ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: '4px',
                overflow: 'hidden',
                background: 'var(--bg)',
                cursor: 'pointer',
              }}
            >
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Nombre y clasificación */}
      <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '14px', color: 'var(--ink)', marginBottom: '6px', lineHeight: '1.4' }}>
        {pc.nombre}
      </div>
      {(pc.rubro || pc.categoria) && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {pc.rubro && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', border: '1px solid #dbeafe' }}>
              {pc.rubro}
            </span>
          )}
          {pc.categoria && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: 'var(--bg)', color: 'var(--steel)', padding: '2px 8px', border: '1px solid var(--border)' }}>
              {pc.categoria}
            </span>
          )}
        </div>
      )}

      {pc.descripcion && (
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--steel)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '10px' }}>
          {pc.descripcion}
        </p>
      )}

      {/* Meta: material / precio */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
        {pc.material && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: 'var(--bg)', color: 'var(--steel)', padding: '2px 8px', border: '1px solid var(--border)' }}>
            {pc.material}
          </span>
        )}
        {precio && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', border: '1px solid #bae6fd' }}>
            Desde {precio}
          </span>
        )}
      </div>

      {pc.archivoPdf && (
        <a href={pc.archivoPdf} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '500', color: 'var(--navy)', marginTop: '10px', textDecoration: 'underline' }}>
          Ver ficha PDF →
        </a>
      )}

      {lightboxIdx !== null && (
        <LightboxImagenes
          imagenes={imagenes}
          indiceInicial={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  )
}
