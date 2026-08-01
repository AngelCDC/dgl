import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import prisma from '../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { scoreColor, scoreLabel } from '../lib/reportes/verificacion'

export const metadata = {
  title: 'Auditorías de Proveedores — DUBOIS Global Trade Intelligence',
  description: 'Servicio de auditorías internacionales de proveedores. Verificación en origen, evaluación de calidad y cumplimiento para importadores en Latinoamérica.',
}

const SERVICIOS = [
  {
    icono: '🔍',
    titulo: 'Auditoría de Fábrica',
    descripcion: 'Evaluación presencial o virtual de instalaciones productivas. Verificamos capacidad, equipamiento, procesos de calidad y condiciones laborales antes de comprometer una orden.',
    detalle: ['Inspección de planta y maquinaria', 'Evaluación del sistema de calidad', 'Capacidad de producción real', 'Certificaciones y cumplimiento legal'],
  },
  {
    icono: '📋',
    titulo: 'Inspección de Producto',
    descripcion: 'Control de calidad durante producción y antes de embarque. Muestra estadística, verificación de especificaciones y reporte fotográfico detallado.',
    detalle: ['Pre-embarque (PSI)', 'Durante producción (DUPRO)', 'Muestreo estadístico AQL', 'Informe con evidencia fotográfica'],
  },
  {
    icono: '📄',
    titulo: 'Verificación Documental',
    descripcion: 'Revisión de licencias comerciales, certificados de origen, registros sanitarios, homologaciones y toda la documentación exigida por aduanas.',
    detalle: ['Licencias de exportación', 'Certificados de origen', 'Registros sanitarios (FDA, CE, etc.)', 'Conformidad regulatoria por país'],
  },
  {
    icono: '🌐',
    titulo: 'Auditoría de Cumplimiento ESG',
    descripcion: 'Evaluación de prácticas ambientales, sociales y de gobernanza del proveedor. Fundamental para importadores con requisitos de responsabilidad de cadena de suministro.',
    detalle: ['Condiciones laborales y RRHH', 'Gestión ambiental y residuos', 'Huella de carbono y eficiencia energética', 'Código de conducta del proveedor'],
  },
  {
    icono: '🔒',
    titulo: 'Due Diligence Comercial',
    descripcion: 'Investigación profunda sobre la solidez financiera, reputación y trayectoria del proveedor. Identifica riesgos antes de firmar un contrato.',
    detalle: ['Historial comercial verificado', 'Referencias de clientes anteriores', 'Situación financiera básica', 'Litigios y antecedentes legales'],
  },
  {
    icono: '📦',
    titulo: 'Seguimiento de Producción',
    descripcion: 'Monitoreo continuo del ciclo productivo para garantizar plazos, especificaciones y condiciones pactadas. Reportes periódicos con fotos y datos en tiempo real.',
    detalle: ['Cronograma de producción', 'Hitos de avance validados', 'Alertas tempranas de desviación', 'Reportes periódicos al importador'],
  },
]

const DESTINOS = [
  { region: 'China', pais: 'CN', mercados: ['Guangzhou', 'Shenzhen', 'Yiwu', 'Ningbo'] },
  { region: 'India', pais: 'IN', mercados: ['Mumbai', 'Surat', 'Delhi', 'Chennai'] },
  { region: 'Turquía', pais: 'TR', mercados: ['Estambul', 'Bursa', 'Gaziantep'] },
  { region: 'Vietnam', pais: 'VN', mercados: ['Ho Chi Minh', 'Hanói', 'Haiphong'] },
  { region: 'México', pais: 'MX', mercados: ['CDMX', 'Monterrey', 'Guadalajara'] },
  { region: 'EE.UU.', pais: 'US', mercados: ['Miami', 'Los Ángeles', 'Houston'] },
]

const PASOS = [
  { num: '01', titulo: 'Solicitud', desc: 'Completa el formulario con el proveedor a auditar, el tipo de auditoría y el plazo requerido.' },
  { num: '02', titulo: 'Propuesta', desc: 'Te enviamos un presupuesto detallado y asignamos un auditor certificado en la región.' },
  { num: '03', titulo: 'Ejecución', desc: 'Nuestro equipo realiza la auditoría según el protocolo acordado, con o sin aviso al proveedor.' },
  { num: '04', titulo: 'Informe', desc: 'Recibes un reporte ejecutivo completo con hallazgos, puntuación de riesgo y recomendaciones.' },
]

export default async function AuditoriasPage() {
  // Detectar sesión para mostrar informes de verificación
  const session = await getServerSession(authOptions)

  let reportes = []
  if (session) {
    try {
      reportes = await prisma.reporteVerificacion.findMany({
        where: { visible: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, nombreEmpresa: true, nombreEmpresaZh: true, estadoEmpresa: true, puntajeTotal: true, createdAt: true },
      })
    } catch { /* mantener compatible con build sin migración */ }
  }

  return (
    <>
      <Navbar />
      <main className="main-content" style={{ paddingTop: '32px', paddingBottom: '80px' }}>

        {/* Hero */}
        <div className="hero-block" style={{ marginBottom: '32px' }}>
          <div className="hero-watermark">AUDIT</div>
          <span className="category-pill-accent" style={{ marginBottom: '16px' }}>Auditorías Internacionales</span>
          <h1 className="hero-title">Verifica tu proveedor antes de importar</h1>
          <p className="hero-excerpt">
            Minimiza el riesgo en tus operaciones de comercio exterior con auditorías de fábrica, inspecciones de producto y due diligence comercial realizados por nuestro equipo en origen.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/contacto" style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', padding: '10px 24px', fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Solicitar auditoría
            </Link>
            <a href="#servicios" style={{ display: 'inline-block', background: 'transparent', color: 'rgba(255,255,255,0.7)', padding: '10px 24px', fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '500', letterSpacing: '0.06em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.2)' }}>
              Ver servicios ↓
            </a>
          </div>
        </div>

        <div className="articulos-layout">
          <div style={{ minWidth: 0 }}>

            {/* Indicadores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '40px' }}>
              {[
                { valor: '+200', label: 'Auditorías completadas' },
                { valor: '18', label: 'Países cubiertos' },
                { valor: '100%', label: 'Informes con evidencia' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#fff', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '32px', color: 'var(--navy)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
                    {stat.valor}
                  </div>
                  <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Servicios */}
            <div id="servicios" className="section-block">
              <div className="section-title-row">
                <span className="section-title-text">Tipos de Auditoría</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {SERVICIOS.map(s => (
                  <div key={s.titulo} style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '28px', lineHeight: '1' }}>{s.icono}</div>
                    <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '16px', color: 'var(--navy)' }}>
                      {s.titulo}
                    </div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)', lineHeight: '1.6', flex: 1 }}>
                      {s.descripcion}
                    </p>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {s.detalle.map(d => (
                        <li key={d} style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--steel)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}>✓</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Cómo funciona */}
            <div className="section-block">
              <div className="section-title-row">
                <span className="section-title-text">Cómo funciona</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }}>
                {PASOS.map(paso => (
                  <div key={paso.num} style={{ background: '#fff', padding: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '500', fontSize: '28px', color: 'var(--border)', marginBottom: '12px', lineHeight: '1' }}>
                      {paso.num}
                    </div>
                    <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '14px', color: 'var(--navy)', marginBottom: '8px' }}>
                      {paso.titulo}
                    </div>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--steel)', lineHeight: '1.6' }}>
                      {paso.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Informes de verificación recientes (solo usuarios autenticados) */}
            {session ? (
              reportes.length > 0 ? (
                <div className="section-block">
                  <div className="section-title-row">
                    <span className="section-title-text">Informes de Verificación Recientes</span>
                    <Link href="/admin/reportes" className="section-title-link">Gestionar informes →</Link>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {reportes.map(r => (
                      <Link key={r.id} href={`/auditorias/reporte/${r.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: '#fff', border: '1px solid var(--border)',
                          borderLeft: '4px solid var(--accent)', padding: '20px',
                          transition: 'transform 0.15s, box-shadow 0.15s',
                          height: '100%',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                              <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '15px', color: 'var(--navy)', marginBottom: '4px' }}>
                                {r.nombreEmpresa}
                              </div>
                              {r.nombreEmpresaZh && (
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--border)' }}>
                                  {r.nombreEmpresaZh}
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: '16px' }}>
                              <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '24px', color: scoreColor(r.puntajeTotal), letterSpacing: '-0.02em', lineHeight: '1' }}>
                                {r.puntajeTotal ?? '—'}
                              </div>
                              <div style={{ fontFamily: 'var(--font-dm)', fontSize: '9px', fontWeight: '600', color: 'var(--steel)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>
                                {scoreLabel(r.puntajeTotal)}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 8px',
                              background: (r.estadoEmpresa || '').toLowerCase().includes('existente') ? '#dcfce7' : '#fef3c7',
                              color: (r.estadoEmpresa || '').toLowerCase().includes('existente') ? '#15803d' : '#92400e',
                              fontFamily: 'var(--font-dm)', fontSize: '10px', fontWeight: '500',
                            }}>
                              {r.estadoEmpresa || 'Sin estado'}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--border)' }}>
                              {new Date(r.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="section-block">
                  <div className="section-title-row">
                    <span className="section-title-text">Informes de Verificación</span>
                  </div>
                  <div style={{
                    background: '#fff', border: '1px solid var(--border)',
                    borderLeft: '4px solid var(--accent)', padding: '24px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '16px',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '15px', color: 'var(--navy)', marginBottom: '4px' }}>
                        ¿Eres administrador?
                      </div>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)', lineHeight: '1.6', maxWidth: '480px' }}>
                        Sube archivos JSON de due diligence de proveedores para generar informes de verificación formateados.
                      </p>
                    </div>
                    <Link href="/admin/reportes" style={{
                      display: 'inline-block', background: 'var(--accent)', color: '#fff',
                      padding: '10px 24px', fontFamily: 'var(--font-dm)', fontSize: '13px',
                      fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase',
                      textDecoration: 'none', whiteSpace: 'nowrap',
                    }}>
                      Ir al panel →
                    </Link>
                  </div>
                </div>
              )
            ) : (
              <div className="section-block">
                <div className="section-title-row">
                  <span className="section-title-text">Informes de Verificación</span>
                </div>
                <div style={{
                  background: '#fff', border: '1px solid var(--border)',
                  borderLeft: '4px solid var(--accent)', padding: '24px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '15px', color: 'var(--navy)', marginBottom: '4px' }}>
                    Accede para ver informes de verificación
                  </div>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)', lineHeight: '1.6', marginBottom: '16px' }}>
                    Los informes de due diligence y verificación de empresas están disponibles para usuarios registrados.
                  </p>
                  <Link href="/login" style={{
                    display: 'inline-block', background: 'var(--accent)', color: '#fff',
                    padding: '10px 24px', fontFamily: 'var(--font-dm)', fontSize: '13px',
                    fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}>
                    Iniciar sesión →
                  </Link>
                </div>
              </div>
            )}

            {/* Cobertura geográfica */}
            <div className="section-block">
              <div className="section-title-row">
                <span className="section-title-text">Cobertura Geográfica</span>
                <Link href="/proveedores" className="section-title-link">Ver proveedores →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
                {DESTINOS.map(d => (
                  <div key={d.region} style={{ background: '#fff', border: '1px solid var(--border)', padding: '16px 20px' }}>
                    <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '15px', color: 'var(--navy)', marginBottom: '8px' }}>
                      {d.region}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {d.mercados.map(m => (
                        <span key={m} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>
                          · {m}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA final */}
            <div style={{ background: 'var(--navy)', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '24px', color: '#fff', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                ¿Listo para auditar tu proveedor?
              </div>
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 24px' }}>
                Cuéntanos el país, el tipo de producto y el proveedor. Nuestro equipo te envía una propuesta en menos de 24 horas hábiles.
              </p>
              <Link href="/contacto" style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', padding: '12px 32px', fontFamily: 'var(--font-dm)', fontSize: '14px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Solicitar auditoría →
              </Link>
            </div>

          </div>

          <Sidebar />
        </div>
      </main>
      <Footer />
    </>
  )
}
