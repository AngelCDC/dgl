import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Nosotros — DUBOIS Global Trade Intelligence',
  description: 'Conoce al equipo detrás de DUBOIS, la plataforma de inteligencia de comercio internacional para Latinoamérica.',
}

const valores = [
  {
    label: 'Rigor Analítico',
    desc: 'Cada publicación pasa por verificación de fuentes primarias, datos aduaneros y contraste con especialistas del sector.',
  },
  {
    label: 'Independencia Editorial',
    desc: 'Nuestras coberturas no están condicionadas por relaciones comerciales. La veracidad es no negociable.',
  },
  {
    label: 'Relevancia Práctica',
    desc: 'Producimos inteligencia accionable: información que un gerente de compras puede aplicar el mismo día que la lee.',
  },
  {
    label: 'Alcance Regional',
    desc: 'Cubrimos los corredores logísticos y mercados de mayor interés para empresas latinoamericanas que importan o exportan.',
  },
]

const equipo = [
  {
    nombre: 'Ángel Dubois',
    cargo: 'Director General',
    area: 'Estrategia & Liderazgo',
    inicial: 'AD',
  },
  {
    nombre: 'Dirección Editorial',
    cargo: 'Editor en Jefe',
    area: 'Contenido & Análisis',
    inicial: 'DE',
  },
  {
    nombre: 'Operaciones',
    cargo: 'Gerencia de Procura',
    area: 'Supply Chain & Logística',
    inicial: 'OP',
  },
  {
    nombre: 'Relaciones Comerciales',
    cargo: 'Directora de Cuentas',
    area: 'Proveedores & Alianzas',
    inicial: 'RC',
  },
]

export default function NosotrosPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 80px' }}>

        {/* Hero */}
        <div style={{
          background: 'var(--navy)',
          padding: '64px 56px',
          marginBottom: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '180px',
            color: 'rgba(255,255,255,0.03)', letterSpacing: '-0.05em', lineHeight: '1',
            pointerEvents: 'none', userSelect: 'none',
          }}>DG</div>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '500',
              color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>Empresa</span>
            <h1 style={{
              fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '42px',
              color: '#fff', letterSpacing: '-0.03em', lineHeight: '1.1',
              marginTop: '16px', marginBottom: '20px',
            }}>
              Inteligencia comercial para quienes mueven el mundo
            </h1>
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '15px',
              color: 'rgba(255,255,255,0.55)', lineHeight: '1.75',
            }}>
              DUBOIS es una plataforma de análisis e inteligencia de comercio internacional
              especializada en los mercados de mayor relevancia para empresas latinoamericanas.
              Nacimos para cerrar la brecha entre la información dispersa del mercado global
              y las decisiones concretas de importación, exportación y supply chain.
            </p>
          </div>
        </div>

        {/* Misión y Visión */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '56px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '36px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px',
            }}>Misión</div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: 'var(--ink)', lineHeight: '1.75' }}>
              Proveer a gerentes de importación, compradores y directivos de supply chain en
              Latinoamérica con inteligencia de mercado verificada, análisis de proveedores
              globales y herramientas de gestión de procura que aceleren sus decisiones de negocio.
            </p>
          </div>
          <div style={{ background: 'var(--navy)', padding: '36px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px',
            }}>Visión</div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.75' }}>
              Ser la referencia obligatoria de inteligencia comercial para empresas
              latinoamericanas que operan en mercados internacionales, consolidando un
              ecosistema de datos, análisis y conexión con proveedores globales verificados.
            </p>
          </div>
        </div>

        {/* Valores */}
        <section style={{ marginBottom: '56px' }}>
          <div style={{
            fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '11px',
            color: 'var(--steel)', letterSpacing: '0.1em', textTransform: 'uppercase',
            borderBottom: '2px solid var(--navy)', paddingBottom: '10px', marginBottom: '28px',
          }}>Nuestros principios</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {valores.map((v, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid var(--border)',
                padding: '28px 32px', borderLeft: '3px solid var(--accent)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '15px',
                  color: 'var(--navy)', marginBottom: '10px',
                }}>{v.label}</div>
                <p style={{
                  fontFamily: 'var(--font-inter)', fontSize: '14px',
                  color: 'var(--steel)', lineHeight: '1.7',
                }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Equipo */}
        <section style={{ marginBottom: '56px' }}>
          <div style={{
            fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '11px',
            color: 'var(--steel)', letterSpacing: '0.1em', textTransform: 'uppercase',
            borderBottom: '2px solid var(--navy)', paddingBottom: '10px', marginBottom: '28px',
          }}>Equipo directivo</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {equipo.map((m, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', padding: '28px 24px', textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', background: 'var(--navy)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '14px', color: '#fff',
                  }}>{m.inicial}</span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '14px',
                  color: 'var(--navy)', marginBottom: '4px',
                }}>{m.nombre}</div>
                <div style={{
                  fontFamily: 'var(--font-inter)', fontSize: '13px',
                  color: 'var(--steel)', marginBottom: '8px',
                }}>{m.cargo}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>{m.area}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          padding: '40px 48px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '18px',
              color: 'var(--navy)', marginBottom: '8px',
            }}>¿Quieres trabajar con nosotros?</div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'var(--steel)' }}>
              Estamos siempre abiertos a conversaciones con analistas, periodistas especializados y proveedores globales.
            </p>
          </div>
          <a href="/contacto" style={{
            fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600',
            padding: '12px 28px', background: 'var(--navy)', color: '#fff',
            letterSpacing: '0.04em', whiteSpace: 'nowrap', flexShrink: 0,
          }}>Escríbenos</a>
        </div>

      </main>
      <Footer />
    </>
  )
}
