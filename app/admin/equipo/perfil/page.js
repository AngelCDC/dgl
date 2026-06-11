'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

// ─── PRIMITIVAS UI ──────────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>
      {children}
    </div>
  )
}

function Inp({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={{
      width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: 8,
      padding: '8px 12px', fontSize: 13, color: '#1e293b', background: '#fff',
      outline: 'none', fontFamily: 'inherit', transition: 'border-color .15s',
    }} onFocus={e => e.target.style.borderColor = '#3b82f6'}
       onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
  )
}

function FieldWrap({ label, children }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc',
      }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function Avatar({ src, name, size = 56 }) {
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f97316']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  const bg = colors[idx]

  if (src) return (
    <img src={src} alt={name} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
      border: '2px solid #e2e8f0',
    }} />
  )
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, color: '#fff', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
      fontFamily: 'inherit',
    }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────
export default function PerfilPage() {
  const { data: session } = useSession()
  const user = session?.user

  const roleLabels = {
    admin:      'Administrador',
    trabajador: 'Trabajador',
    cliente:    'Cliente',
  }

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [avatarMsg, setAvatarMsg] = useState(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState(null)
  const [pwLoading, setPwLoading] = useState(false)

  async function handleAvatarSave() {
    setAvatarMsg(null)
    try {
      const res = await fetch(`/api/admin/equipo/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Error')
      setAvatarMsg({ type: 'success', text: 'Avatar actualizado.' })
    } catch (err) { setAvatarMsg({ type: 'error', text: err.message }) }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' })
      return
    }
    setPwLoading(true); setPwMsg(null)
    try {
      const res = await fetch('/api/admin/equipo/perfil', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Error')
      setPwMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) { setPwMsg({ type: 'error', text: err.message }) }
    finally { setPwLoading(false) }
  }

  if (!user) return (
    <div style={{ padding: '32px', color: '#94a3b8', fontSize: 14 }}>Cargando…</div>
  )

  return (
    <div style={{ padding: '24px 32px', maxWidth: 640, fontFamily: 'inherit' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
          Mi Perfil
        </h1>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>Gestiona tu información personal y seguridad</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Información del usuario ──────────────────────────────────────── */}
        <SectionCard title="Información Personal">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <Avatar src={avatarUrl || user.avatarUrl} name={user.name} size={64} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{user.email}</div>
              <span style={{
                display: 'inline-block', marginTop: 6,
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
              }}>
                {roleLabels[user.role] || user.role}
              </span>
            </div>
          </div>

          {/* Avatar URL */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <FieldWrap label="URL del Avatar">
                <Inp value={avatarUrl} onChange={setAvatarUrl} placeholder="https://… o deja vacío para inicial" />
              </FieldWrap>
            </div>
            <button onClick={handleAvatarSave} style={{
              fontSize: 12, padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8,
              background: '#fff', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit',
              flexShrink: 0, marginBottom: 0,
            }}>
              Actualizar
            </button>
          </div>
          {avatarMsg && (
            <div style={{
              marginTop: 10, fontSize: 12,
              color: avatarMsg.type === 'success' ? '#166534' : '#991b1b',
            }}>
              {avatarMsg.text}
            </div>
          )}
        </SectionCard>

        {/* ── Cambiar contraseña ────────────────────────────────────────────── */}
        <SectionCard title="Cambiar Contraseña">
          <form onSubmit={handlePasswordChange}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FieldWrap label="Contraseña actual">
                <Inp type="password" value={currentPassword} onChange={setCurrentPassword}
                  placeholder="Ingresa tu contraseña actual" />
              </FieldWrap>
              <FieldWrap label="Nueva contraseña">
                <Inp type="password" value={newPassword} onChange={setNewPassword}
                  placeholder="Mínimo 8 caracteres" />
              </FieldWrap>
              <FieldWrap label="Confirmar nueva contraseña">
                <Inp type="password" value={confirmPassword} onChange={setConfirmPassword}
                  placeholder="Repite la nueva contraseña" />
              </FieldWrap>
            </div>

            {pwMsg && (
              <div style={{
                marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                color: pwMsg.type === 'success' ? '#166534' : '#991b1b',
                background: pwMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                borderRadius: 8, padding: '10px 14px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke={pwMsg.type === 'success' ? '#22c55e' : '#ef4444'} strokeWidth="2.5">
                  {pwMsg.type === 'success'
                    ? <polyline points="20 6 9 17 4 12" />
                    : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                  }
                </svg>
                {pwMsg.text}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <button type="submit" disabled={pwLoading} style={{
                fontSize: 13, padding: '8px 22px', border: 'none', borderRadius: 9,
                background: '#0a1628', color: '#fff', cursor: 'pointer', fontWeight: 700,
                fontFamily: 'inherit', opacity: pwLoading ? .7 : 1,
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {pwLoading ? 'Actualizando…' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </SectionCard>

      </div>
    </div>
  )
}
