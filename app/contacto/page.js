'use client'

import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const canales = [
  { label: 'LinkedIn', valor: '/in/dubois-global' },
  { label: 'X / Twitter', valor: '@duboisglobal' },
  { label: 'WhatsApp', valor: '+58 412 000 0000' },
  { label: 'Email', valor: 'contacto@dubois.com' },
]

export default function ContactoPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [estado, setEstado] = useState('idle') // idle | loading | ok | error

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setEstado('loading')
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'general' }),
      })
      if (!res.ok) throw new Error()
      setEstado('ok')
      setForm({ name: '', email: '', company: '', message: '' })
    } catch {
      setEstado('error')
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 80px' }}>

        {/* Encabezado */}
        <div style={{ paddingTop: '48px', paddingBottom: '40px', borderBottom: '1px solid var(--border)', marginBottom: '48px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>Empresa</span>
          <h1 style={{
            fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '36px',
            color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: '1.1',
            marginTop: '12px', marginBottom: '14px',
          }}>Contacto</h1>
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '15px',
            color: 'var(--steel)', maxWidth: '520px', lineHeight: '1.7',
          }}>
            Para consultas editoriales, alianzas con proveedores, o cualquier otro asunto.
            Respondemos en un plazo máximo de 48 horas hábiles.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px', alignItems: 'start' }}>

          {/* Formulario */}
          <div>
            {estado === 'ok' ? (
              <div style={{
                background: '#fff', border: '1px solid var(--border)',
                borderLeft: '3px solid #16a34a', padding: '40px 36px', textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '20px',
                  color: 'var(--navy)', marginBottom: '12px',
                }}>Mensaje enviado</div>
                <p style={{
                  fontFamily: 'var(--font-inter)', fontSize: '14px',
                  color: 'var(--steel)', lineHeight: '1.7', marginBottom: '24px',
                }}>
                  Gracias por escribirnos. Revisaremos tu mensaje y te contactaremos
                  a la brevedad posible.
                </p>
                <button
                  onClick={() => setEstado('idle')}
                  style={{
                    fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600',
                    padding: '10px 24px', border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--steel)', cursor: 'pointer',
                  }}
                >Enviar otro mensaje</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Campo
                    label="Nombre completo *"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    required
                  />
                  <Campo
                    label="Correo electrónico *"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tu@empresa.com"
                    required
                  />
                </div>
                <Campo
                  label="Empresa u organización"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Nombre de tu empresa (opcional)"
                />
                <div>
                  <label style={{
                    fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '600',
                    color: 'var(--navy)', letterSpacing: '0.04em', textTransform: 'uppercase',
                    display: 'block', marginBottom: '8px',
                  }}>Mensaje *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="¿En qué podemos ayudarte?"
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: '1px solid var(--border)', background: '#fff',
                      fontFamily: 'var(--font-inter)', fontSize: '14px',
                      color: 'var(--ink)', resize: 'vertical', outline: 'none',
                    }}
                  />
                </div>

                {estado === 'error' && (
                  <div style={{
                    fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#dc2626',
                    padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca',
                  }}>
                    Ocurrió un error al enviar el mensaje. Por favor intenta de nuevo.
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={estado === 'loading'}
                    style={{
                      fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600',
                      padding: '13px 32px', background: estado === 'loading' ? 'var(--steel)' : 'var(--navy)',
                      color: '#fff', border: 'none', cursor: estado === 'loading' ? 'default' : 'pointer',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {estado === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Panel lateral */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Canales */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '28px' }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '700',
                color: 'var(--steel)', letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: '20px',
              }}>Otros canales</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {canales.map(c => (
                  <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-dm)', fontSize: '13px',
                      fontWeight: '500', color: 'var(--navy)',
                    }}>{c.label}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--steel)',
                    }}>{c.valor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tiempos de respuesta */}
            <div style={{ background: 'var(--navy)', padding: '28px' }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '700',
                color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: '20px',
              }}>Tiempos de respuesta</div>
              {[
                { tipo: 'Consultas generales', tiempo: '48h hábiles' },
                { tipo: 'Proveedores / Alianzas', tiempo: '24h hábiles' },
                { tipo: 'Prensa / Editorial', tiempo: '12h hábiles' },
              ].map(r => (
                <div key={r.tipo} style={{
                  display: 'flex', justifyContent: 'space-between',
                  paddingBottom: '12px', marginBottom: '12px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-inter)', fontSize: '13px',
                    color: 'rgba(255,255,255,0.5)',
                  }}>{r.tipo}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '12px',
                    color: 'var(--accent)', fontWeight: '500',
                  }}>{r.tiempo}</span>
                </div>
              ))}
            </div>

            {/* ¿Eres proveedor? */}
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderLeft: '3px solid var(--accent)', padding: '24px',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '14px',
                color: 'var(--navy)', marginBottom: '8px',
              }}>¿Eres proveedor global?</div>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '13px',
                color: 'var(--steel)', lineHeight: '1.6', marginBottom: '16px',
              }}>
                Si deseas que tu empresa aparezca en nuestro directorio, envíanos tu información.
              </p>
              <a href="/proveedores" style={{
                fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '600',
                color: 'var(--accent)', letterSpacing: '0.04em',
              }}>Ver directorio →</a>
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}

function Campo({ label, name, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label style={{
        fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '600',
        color: 'var(--navy)', letterSpacing: '0.04em', textTransform: 'uppercase',
        display: 'block', marginBottom: '8px',
      }}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%', padding: '11px 16px',
          border: '1px solid var(--border)', background: '#fff',
          fontFamily: 'var(--font-inter)', fontSize: '14px',
          color: 'var(--ink)', outline: 'none',
        }}
      />
    </div>
  )
}
