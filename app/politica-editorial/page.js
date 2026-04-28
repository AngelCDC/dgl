import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Política Editorial — DUBOIS Global Trade Intelligence',
  description: 'Conoce los estándares editoriales, criterios de verificación y principios éticos que rigen la producción de contenido en DUBOIS.',
}

const secciones = [
  {
    titulo: '1. Principios generales',
    contenido: `DUBOIS es una publicación especializada en comercio internacional, logística y supply chain orientada a profesionales y empresas latinoamericanas. Todo el contenido publicado bajo la marca DUBOIS se rige por los principios de veracidad, independencia editorial, relevancia práctica y transparencia sobre fuentes y conflictos de interés.

Nuestro compromiso es producir inteligencia de mercado que pueda ser utilizada con confianza por gerentes de importación, compradores y directivos de supply chain en la toma de decisiones reales de negocio.`,
  },
  {
    titulo: '2. Proceso de verificación',
    contenido: `Todo artículo publicado en DUBOIS pasa por un proceso de verificación de tres etapas:

— Verificación de fuentes: cada dato estadístico, cifra de comercio o referencia de mercado debe estar respaldado por una fuente primaria identificable (datos aduaneros, organismos internacionales como la OMC, CEPAL, Banco Mundial, o reportes oficiales de entidades gubernamentales).

— Revisión editorial: el texto es revisado por un editor senior antes de su publicación para verificar coherencia, precisión y claridad.

— Contraste con especialistas: en casos de análisis complejo, el contenido puede ser consultado con expertos del sector antes de su publicación.`,
  },
  {
    titulo: '3. Independencia editorial',
    contenido: `La cobertura editorial de DUBOIS es completamente independiente de las relaciones comerciales de la plataforma. Los proveedores que aparecen en nuestro directorio no obtienen cobertura editorial preferencial por su condición de clientes o partners.

Cuando un artículo hace referencia a una empresa o producto con el que DUBOIS tiene una relación comercial, se indica explícitamente mediante una nota de transparencia al inicio del artículo.

Ningún anunciante, proveedor del directorio ni entidad externa puede solicitar, condicionar o vetar el contenido editorial.`,
  },
  {
    titulo: '4. Correcciones y actualizaciones',
    contenido: `DUBOIS se compromete a corregir cualquier error factual en el menor tiempo posible. Las correcciones se publican de manera visible al final del artículo afectado, indicando la fecha de la corrección y la naturaleza del error.

Si detectas un error en alguno de nuestros artículos, puedes reportarlo a través de nuestra página de Contacto. Analizamos todos los reportes y respondemos en un plazo máximo de 48 horas hábiles.`,
  },
  {
    titulo: '5. Autoría y atribución',
    contenido: `Todos los artículos publicados en DUBOIS llevan la firma del autor responsable del contenido. En el caso de análisis que involucren a múltiples contribuyentes, se indica la autoría principal y los colaboradores.

No publicamos contenido anónimo en nuestra sección editorial. Los artículos institucionales o de opinión corporativa se identifican explícitamente como tal.`,
  },
  {
    titulo: '6. Uso de inteligencia artificial',
    contenido: `DUBOIS puede utilizar herramientas de inteligencia artificial como apoyo en la investigación, búsqueda de datos o estructuración inicial de contenidos. Sin embargo, todo el contenido publicado es revisado, completado y validado por redactores y editores humanos antes de su publicación.

No publicamos contenido generado íntegramente por IA sin revisión editorial. Cuando las herramientas de IA son parte del proceso de producción, el editor responsable asume la verificación completa del contenido final.`,
  },
  {
    titulo: '7. Proveedores en el directorio',
    contenido: `Los proveedores que aparecen en el Directorio Global de DUBOIS son evaluados previamente por nuestro equipo antes de su publicación. La verificación implica la existencia legal de la empresa, la coherencia entre sus servicios declarados y su presencia verificable en el mercado, y la ausencia de alertas de riesgo conocidas.

La verificación no implica un aval comercial ni una garantía de calidad de servicio. Los usuarios son responsables de realizar su propio proceso de due diligence antes de iniciar relaciones comerciales con cualquier proveedor del directorio.`,
  },
  {
    titulo: '8. Contacto editorial',
    contenido: `Para consultas relacionadas con esta política editorial, solicitudes de corrección, denuncias de error o colaboraciones editoriales, puedes contactarnos a través de nuestra página de Contacto o directamente por correo electrónico a la dirección editorial.

Esta política es revisada y actualizada periódicamente. La versión vigente se publica en esta página con su fecha de última actualización.`,
  },
]

export default function PoliticaEditorialPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px 80px' }}>

        {/* Encabezado */}
        <div style={{ paddingTop: '48px', paddingBottom: '40px', borderBottom: '1px solid var(--border)', marginBottom: '56px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>Empresa</span>
          <h1 style={{
            fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '36px',
            color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: '1.1',
            marginTop: '12px', marginBottom: '14px',
          }}>Política Editorial</h1>
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '15px',
            color: 'var(--steel)', maxWidth: '560px', lineHeight: '1.7',
          }}>
            Los estándares, criterios de verificación y principios éticos que rigen
            la producción y publicación de contenido en DUBOIS Global Trade Intelligence.
          </p>
          <div style={{
            marginTop: '20px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)',
          }}>
            Última actualización: enero 2026
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '64px', alignItems: 'start' }}>

          {/* Contenido */}
          <div>
            {secciones.map((s, i) => (
              <section key={i} id={`sec-${i}`} style={{ marginBottom: '44px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '18px',
                  color: 'var(--navy)', letterSpacing: '-0.01em', marginBottom: '16px',
                  paddingBottom: '12px', borderBottom: '1px solid var(--border)',
                }}>{s.titulo}</h2>
                {s.contenido.split('\n\n').map((parrafo, j) => (
                  <p key={j} style={{
                    fontFamily: 'var(--font-inter)', fontSize: '15px',
                    color: 'var(--ink)', lineHeight: '1.8',
                    marginBottom: '14px', whiteSpace: 'pre-line',
                  }}>{parrafo}</p>
                ))}
              </section>
            ))}

            {/* Bloque de contacto */}
            <div style={{
              background: 'var(--navy)', padding: '32px 36px', marginTop: '8px',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '16px',
                color: '#fff', marginBottom: '10px',
              }}>¿Tienes una denuncia o corrección?</div>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '14px',
                color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', marginBottom: '20px',
              }}>
                Si encontraste un error factual, un conflicto de interés no declarado,
                o cualquier situación que contravenga esta política, queremos saberlo.
              </p>
              <a href="/contacto" style={{
                fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600',
                padding: '11px 24px', background: 'var(--accent)', color: '#fff',
                letterSpacing: '0.04em',
              }}>Reportar un error</a>
            </div>
          </div>

          {/* Índice lateral */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{
              background: '#fff', border: '1px solid var(--border)', padding: '24px',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '700',
                color: 'var(--steel)', letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: '16px',
              }}>Contenido</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {secciones.map((s, i) => (
                  <a key={i} href={`#sec-${i}`} style={{
                    fontFamily: 'var(--font-inter)', fontSize: '13px',
                    color: 'var(--steel)', lineHeight: '1.5',
                    paddingLeft: '10px', borderLeft: '2px solid var(--border)',
                  }}>
                    {s.titulo}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
