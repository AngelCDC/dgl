import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import { redirect, notFound } from 'next/navigation'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { normalizeReporte, metricColor, scoreColor, scoreLabel, isEmpty } from '../../../lib/reportes/verificacion'

export async function generateMetadata({ params }) {
  const { id } = await params
  const reporte = await prisma.reporteVerificacion.findUnique({
    where: { id },
    select: { nombreEmpresa: true, data: true },
  })
  if (!reporte) return { title: 'Informe no encontrado -- DUBOIS' }

  const n = normalizeReporte(reporte.data)
  const desc = n.interpretation?.resumenEs?.slice(0, 160) || 'Informe de verificacion y due diligence de empresa.'

  return {
    title: `Informe de Verificacion -- ${reporte.nombreEmpresa} | DUBOIS`,
    description: desc,
  }
}

export default async function ReporteVerificacionPage({ params }) {
  // Auth check
  const session = await getServerSession(authOptions)
  if (!session) {
    const { id } = await params
    redirect(`/login?callbackUrl=/auditorias/reporte/${id}`)
  }

  const { id } = await params
  const reporte = await prisma.reporteVerificacion.findUnique({ where: { id } })
  if (!reporte) notFound()

  const n = normalizeReporte(reporte.data)
  const c = n.company
  const bl = n.businessLicense
  const cu = n.customsRegistration
  const interp = n.interpretation
  const risk = n.riskScore

  // Dynamic section numbering
  let sec = 0
  const S = () => { sec++; return String(sec).padStart(2, '0') }

  return (
    <>
      <Navbar />
      <main className="main-content" style={{ paddingBottom: '80px' }}>

        {/* ================================================================
            HERO HEADER
            ================================================================ */}
        <div className="hero-block" style={{ marginBottom: '32px' }}>
          <div className="hero-watermark">DUE DILIGENCE</div>
          <span className="category-pill-accent" style={{ marginBottom: '14px' }}>
            Informe de Verificacion de Empresa
          </span>
          <h1 className="hero-title" style={{ marginBottom: '8px' }}>
            {c.nombreEs}
          </h1>
          {c.nombreZh && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '14px',
              color: 'rgba(255,255,255,0.45)', marginBottom: '14px',
            }}>
              {c.nombreZh}
            </div>
          )}

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center', marginTop: '16px' }}>
            {/* Status badge */}
            <div>
              <div className="meta-label" style={{ color: 'rgba(255,255,255,0.4)' }}>Estado</div>
              <span style={{
                display: 'inline-block', padding: '4px 14px',
                background: (c.estado || '').toLowerCase().includes('existente') || (c.estado || '').includes('存续')
                  ? 'rgba(22,163,74,0.15)' : 'rgba(217,119,6,0.15)',
                color: (c.estado || '').toLowerCase().includes('existente') || (c.estado || '').includes('存续')
                  ? '#4ade80' : '#fbbf24',
                fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '600',
                letterSpacing: '0.04em',
              }}>
                {c.estado || 'Sin datos'}
              </span>
            </div>

            {/* USCC */}
            <div>
              <div className="meta-label" style={{ color: 'rgba(255,255,255,0.4)' }}>Codigo USCC</div>
              <span className="mono-sm" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                {c.codigoCreditoSocial || '--'}
              </span>
            </div>

            {/* Fecha constitucion */}
            <div>
              <div className="meta-label" style={{ color: 'rgba(255,255,255,0.4)' }}>Constitucion</div>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                {c.fechaConstitucion || '--'}
              </span>
            </div>
          </div>

          {/* Risk score highlight (right side) */}
          {risk?.level && (
            <div style={{
              position: 'absolute', right: '48px', top: '50%', transform: 'translateY(-50%)',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '48px',
                color: scoreColor(risk.level), letterSpacing: '-0.04em', lineHeight: '1',
                textTransform: 'uppercase',
              }}>
                {risk.level}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600',
                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase',
                marginTop: '4px',
              }}>
                Riesgo {risk.level.toLowerCase()}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.3)',
                marginTop: '2px',
              }}>
                Score: {risk.numericScore ?? '--'} . {n.totalRecords} registros
              </div>
            </div>
          )}
          {!risk?.level && (
            <div style={{
              position: 'absolute', right: '48px', top: '50%', transform: 'translateY(-50%)',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '56px',
                color: scoreColor(n.totalScore), letterSpacing: '-0.04em', lineHeight: '1',
              }}>
                {n.totalScore}
              </div>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600',
                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase',
                marginTop: '4px',
              }}>
                {scoreLabel(n.totalScore)}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.3)',
                marginTop: '2px',
              }}>
                {n.totalRecords} registros
              </div>
            </div>
          )}
        </div>

        {/* -- PDF Download ---------------------------------------------------- */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <a href={`/api/admin/reportes/${id}/pdf`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--accent)', color: '#fff',
              padding: '10px 24px',
              fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
            <span>v</span> Descargar PDF
          </a>
        </div>

        {/* ================================================================
            1. INFORMACION GENERAL
            ================================================================ */}
        <section className="section-block">
          <div className="section-title-row">
            <span className="section-title-text">{S()} -- Informacion General de la Empresa</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }}>
            <InfoCard label="Representante Legal" value={c.representanteLegal} zh={c.representanteLegalZh} />
            <InfoCard label="Autoridad de Registro" value={c.autoridadRegistro} zh={c.autoridadRegistroZh} />
            <InfoCard label="Domicilio" value={c.domicilio} zh={c.domicilioZh} />
            <InfoCard label="Fecha de Constitucion" value={c.fechaConstitucion} />
          </div>
        </section>

        {/* ================================================================
            2. LICENCIA COMERCIAL
            ================================================================ */}
        <section className="section-block">
          <div className="section-title-row">
            <span className="section-title-text">{S()} -- Licencia Comercial</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', marginBottom: '16px' }}>
            <InfoCard label="Capital Registrado" value={bl.capitalRegistrado} />
            <InfoCard label="Tipo de Entidad" value={bl.tipoEntidad} zh={bl.tipoEntidadZh} />
            <InfoCard label="Fecha de Aprobacion" value={bl.fechaAprobacion} />
          </div>

          {/* Alcance comercial */}
          {!isEmpty(bl.ambitoNegocio) && (
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px' }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600',
                color: 'var(--navy)', letterSpacing: '0.06em', textTransform: 'uppercase',
                marginBottom: '14px',
              }}>
                Alcance Comercial ({bl.ambitoNegocio.length} actividades)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {bl.ambitoNegocio.map((item, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)',
                    padding: '5px 12px', border: '1px solid var(--border)',
                    background: 'var(--bg)',
                  }}>
                    {typeof item === 'string' ? item : (item.label_es || item.name || String(item))}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ================================================================
            3. CREDITO FISCAL (opcional)
            ================================================================ */}
        {n.taxCredit?.classification && (
          <section className="section-block">
            <div className="section-title-row">
              <span className="section-title-text">{S()} -- Credito Fiscal</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }}>
              <InfoCard label="Contribuyente" value={n.taxCredit.taxpayerName} zh={n.taxCredit.taxpayerNameZh} />
              <InfoCard label="ID Fiscal" value={n.taxCredit.taxpayerId} mono />
              <InfoCard label="Ano de Evaluacion" value={n.taxCredit.evaluationYear} />
              <InfoCard label="Clasificacion">
                <span style={{
                  display: 'inline-block', padding: '4px 14px',
                  background: (n.taxCredit.classification || '').includes('A') || (n.taxCredit.classification || '').includes('A级')
                    ? '#dcfce7' : '#fef3c7',
                  color: (n.taxCredit.classification || '').includes('A') || (n.taxCredit.classification || '').includes('A级')
                    ? '#15803d' : '#92400e',
                  fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600',
                }}>
                  {n.taxCredit.classification}
                  {n.taxCredit.classificationZh ? ` (${n.taxCredit.classificationZh})` : ''}
                </span>
              </InfoCard>
            </div>
          </section>
        )}

        {/* ================================================================
            4. REGISTRO ADUANERO (opcional)
            ================================================================ */}
        {cu.aduanaLocal && (
          <section className="section-block">
            <div className="section-title-row">
              <span className="section-title-text">{S()} -- Registro Aduanero</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }}>
              <InfoCard label="Aduana Local" value={cu.aduanaLocal} zh={cu.aduanaLocalZh} />
              <InfoCard label="Fecha de Registro" value={cu.fechaRegistro} />
              <InfoCard label="Estado">
                <span style={{
                  display: 'inline-block', padding: '3px 12px',
                  background: (cu.estado || '').toLowerCase() === 'normal' || cu.estado === '正常'
                    ? '#dcfce7' : '#fef3c7',
                  color: (cu.estado || '').toLowerCase() === 'normal' || cu.estado === '正常'
                    ? '#15803d' : '#92400e',
                  fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600',
                }}>
                  {cu.estado || '--'}
                  {cu.estadoZh ? ` / ${cu.estadoZh}` : ''}
                </span>
              </InfoCard>
            </div>
          </section>
        )}

        {/* ================================================================
            5. EVALUACION DE RIESGO (nuevo - desde el sistema externo)
            ================================================================ */}
        {risk?.level && (
          <section className="section-block">
            <div className="section-title-row">
              <span className="section-title-text">{S()} -- Evaluacion de Riesgo</span>
              <span style={{ fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600', color: scoreColor(risk.level) }}>
                Nivel: {risk.level} . Score: {risk.numericScore ?? '--'}
              </span>
            </div>

            {/* Scoring criteria */}
            {risk.scoringCriteria.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600',
                  color: 'var(--navy)', letterSpacing: '0.04em', textTransform: 'uppercase',
                  marginBottom: '12px',
                }}>
                  Criterios de Evaluacion
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: 'var(--navy)' }}>
                        <th style={thStyle}>Criterio</th>
                        <th style={thStyle}>Valor</th>
                        <th style={{ ...thStyle, textAlign: 'center', width: '60px' }}>Score</th>
                        <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Peso</th>
                        <th style={thStyle}>Comentario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {risk.scoringCriteria.map((sc, i) => (
                        <tr key={sc.key} style={{
                          background: i % 2 === 0 ? '#fff' : 'var(--bg)',
                          borderBottom: '1px solid var(--border)',
                        }}>
                          <td style={{ ...tdStyle, fontWeight: '500', color: 'var(--navy)', textTransform: 'capitalize' }}>
                            {sc.key.replace(/_/g, ' ')}
                          </td>
                          <td style={tdStyle}>{sc.value || '--'}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
                              background: sc.score >= 3 ? '#fef2f2' : sc.score >= 2 ? '#fef3c7' : '#ecfdf5',
                              color: sc.score >= 3 ? '#dc2626' : sc.score >= 2 ? '#92400e' : '#15803d',
                              fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: '13px',
                            }}>
                              {sc.score}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center', fontSize: '11px', color: 'var(--steel)' }}>
                            {sc.weight || '--'}
                          </td>
                          <td style={{ ...tdStyle, fontSize: '11px', color: 'var(--steel)' }}>
                            {sc.comment || '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Risk factors */}
            {risk.riskFactors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600',
                  color: 'var(--navy)', letterSpacing: '0.04em', textTransform: 'uppercase',
                  marginBottom: '12px',
                }}>
                  Factores de Riesgo Identificados
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {risk.riskFactors.map((rf, i) => (
                    <div key={i} style={{
                      background: '#fff', border: '1px solid var(--border)', padding: '16px 20px',
                      borderLeft: `4px solid ${rf.impact?.toLowerCase() === 'alto' ? '#dc2626' : rf.impact?.toLowerCase() === 'medio' ? '#d97706' : '#16a34a'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                          {rf.factor}
                        </span>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: '10px',
                          fontSize: '10px', fontWeight: '600', fontFamily: 'var(--font-dm)',
                          background: rf.impact?.toLowerCase() === 'alto' ? '#fef2f2' : rf.impact?.toLowerCase() === 'medio' ? '#fef3c7' : '#ecfdf5',
                          color: rf.impact?.toLowerCase() === 'alto' ? '#dc2626' : rf.impact?.toLowerCase() === 'medio' ? '#92400e' : '#15803d',
                        }}>
                          Impacto: {rf.impact || '--'}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--steel)', lineHeight: '1.5', margin: 0 }}>
                        Mitigacion: {rf.mitigation || '--'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {risk.recommendation && (
              <div style={{
                background: 'var(--navy)', borderLeft: '4px solid var(--accent)',
                padding: '24px 28px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600',
                  color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase',
                  marginBottom: '10px',
                }}>
                  Recomendacion
                </div>
                <p style={{
                  fontFamily: 'var(--font-inter)', fontSize: '14px', color: 'rgba(255,255,255,0.75)',
                  lineHeight: '1.8',
                }}>
                  {risk.recommendation}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ================================================================
            6. INDICADORES DE CREDITO
            ================================================================ */}
        <section className="section-block">
          <div className="section-title-row">
            <span className="section-title-text">{S()} -- Indicadores de Credito</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>
              {n.totalRecords} registros totales
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {n.metrics.map(m => {
              const color = metricColor(m.value)
              return (
                <div key={m.key} style={{
                  background: '#fff', border: '1px solid var(--border)',
                  borderTop: `3px solid ${color}`, padding: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{
                      fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '600',
                      color: 'var(--navy)', lineHeight: '1.3',
                    }}>
                      {m.labelEs}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm)', fontWeight: '800', fontSize: '28px',
                      color: color, letterSpacing: '-0.03em', lineHeight: '1',
                      marginLeft: '12px', flexShrink: 0,
                    }}>
                      {m.value}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--border)',
                    marginBottom: '6px',
                  }}>
                    {m.labelZh}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-inter)', fontSize: '12px', color: 'var(--steel)',
                    lineHeight: '1.5',
                  }}>
                    {m.descEs}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ================================================================
            7. PERMISOS ADMINISTRATIVOS
            ================================================================ */}
        <section className="section-block">
          <div className="section-title-row">
            <span className="section-title-text">
              {S()} -- Permisos Administrativos ({n.permits.total} registros)
            </span>
          </div>

          {isEmpty(n.permits.records) ? (
            <CleanBanner message="No se registran permisos administrativos." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <RecordsTable records={n.permits.records} type="permits" />
            </div>
          )}
        </section>

        {/* ================================================================
            8. RIESGOS Y ANTECEDENTES
            ================================================================ */}
        <section className="section-block">
          <div className="section-title-row">
            <span className="section-title-text">{S()} -- Riesgos y Antecedentes</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Sanciones */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px' }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '700',
                color: 'var(--navy)', marginBottom: '12px',
              }}>
                Sanciones Administrativas ({n.sanctions.total})
              </div>
              {isEmpty(n.sanctions.records) ? (
                <CleanBanner message="Sin sanciones administrativas -- empresa limpia." compact />
              ) : (
                <RecordsTable records={n.sanctions.records} type="sanctions" />
              )}
            </div>

            {/* Excepciones operativas */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px' }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '700',
                color: 'var(--navy)', marginBottom: '12px',
              }}>
                Excepciones Operativas ({n.exceptions.total})
              </div>
              {isEmpty(n.exceptions.records) ? (
                <CleanBanner message="Sin anomalias operativas registradas." compact />
              ) : (
                <RecordsTable records={n.exceptions.records} type="exceptions" />
              )}
            </div>

            {/* Lista Negra */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px' }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '700',
                color: 'var(--navy)', marginBottom: '12px',
              }}>
                Lista Negra de Infracciones Graves ({n.blacklist.total})
              </div>
              {isEmpty(n.blacklist.records) ? (
                <CleanBanner message="Sin registros en lista negra de infracciones graves." compact />
              ) : (
                <RecordsTable records={n.blacklist.records} type="blacklist" />
              )}
            </div>
          </div>
        </section>

        {/* ================================================================
            9. INTERPRETACION Y CONCLUSION
            ================================================================ */}
        <section className="section-block">
          <div className="section-title-row">
            <span className="section-title-text">{S()} -- Interpretacion y Conclusion</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Indicadores positivos */}
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              borderTop: '3px solid #16a34a', padding: '24px',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '700',
                color: '#16a34a', letterSpacing: '0.06em', textTransform: 'uppercase',
                marginBottom: '14px',
              }}>
                ✓ Indicadores Positivos ({interp.positivos.length})
              </div>
              {interp.positivos.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)' }}>
                  Sin indicadores positivos registrados.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {interp.positivos.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }}>✓</span>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--ink)', lineHeight: '1.5' }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Indicadores neutrales */}
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              borderTop: '3px solid var(--steel)', padding: '24px',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '700',
                color: 'var(--steel)', letterSpacing: '0.06em', textTransform: 'uppercase',
                marginBottom: '14px',
              }}>
                . Indicadores Neutrales ({interp.neutrales.length})
              </div>
              {interp.neutrales.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--steel)' }}>
                  Sin indicadores neutrales registrados.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {interp.neutrales.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--steel)', flexShrink: 0, marginTop: '2px' }}>.</span>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--ink)', lineHeight: '1.5' }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Indicadores negativos */}
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              borderTop: '3px solid #dc2626', padding: '24px',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '12px', fontWeight: '700',
                color: '#dc2626', letterSpacing: '0.06em', textTransform: 'uppercase',
                marginBottom: '14px',
              }}>
                ✗ Indicadores Negativos ({interp.negativos.length})
              </div>
              {interp.negativos.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#16a34a', fontWeight: '500' }}>
                  ✓ No se detectaron indicadores negativos.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {interp.negativos.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }}>✗</span>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'var(--ink)', lineHeight: '1.5' }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Resumen ejecutivo */}
          {interp.resumenEs && (
            <div style={{
              background: 'var(--navy)', borderLeft: '4px solid var(--accent)',
              padding: '28px 32px',
            }}>
              <div style={{
                fontFamily: 'var(--font-dm)', fontSize: '11px', fontWeight: '600',
                color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                Resumen Ejecutivo
              </div>
              <p style={{
                fontFamily: 'var(--font-inter)', fontSize: '15px', color: 'rgba(255,255,255,0.75)',
                lineHeight: '1.8', fontStyle: 'italic',
              }}>
                {interp.resumenEs}
              </p>
            </div>
          )}
        </section>

        {/* -- Volver -------------------------------------------------------- */}
        <div style={{ textAlign: 'center', paddingTop: '24px' }}>
          <a href="/auditorias" style={{
            fontFamily: 'var(--font-dm)', fontSize: '13px', fontWeight: '500',
            color: 'var(--steel)', letterSpacing: '0.04em', textTransform: 'uppercase',
            padding: '10px 24px', border: '1px solid var(--border)',
            textDecoration: 'none', display: 'inline-block',
          }}>
            -- Volver a Auditorias
          </a>
        </div>

      </main>
      <Footer />
    </>
  )
}

// --- Sub-componentes ------------------------------------------------------------

function InfoCard({ label, value, zh, mono }) {
  return (
    <div style={{ background: '#fff', padding: '20px 24px' }}>
      <div className="meta-label" style={{ marginBottom: '6px' }}>{label}</div>
      <div style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-inter)',
        fontSize: '14px', color: 'var(--ink)',
        lineHeight: '1.5', wordBreak: 'break-word',
      }}>
        {value || '--'}
      </div>
      {zh && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--border)',
          marginTop: '4px',
        }}>
          {zh}
        </div>
      )}
    </div>
  )
}

function CleanBanner({ message, compact }) {
  return (
    <div style={{
      background: '#ecfdf5', border: '1px solid #a7f3d0',
      padding: compact ? '14px 16px' : '20px 24px',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <span style={{ color: '#16a34a', fontSize: '18px', flexShrink: 0 }}>✓</span>
      <span style={{
        fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#065f46',
        fontWeight: '500',
      }}>
        {message}
      </span>
    </div>
  )
}

function RecordsTable({ records, type }) {
  if (!records || records.length === 0) return null

  return (
    <table style={{
      width: '100%', borderCollapse: 'collapse',
      fontFamily: 'var(--font-inter)', fontSize: '12px',
    }}>
      <thead>
        <tr style={{ background: 'var(--navy)' }}>
          <th style={{ ...thStyle, width: '36px' }}>#</th>
          <th style={thStyle}>Documento</th>
          <th style={thStyle}>Categoria</th>
          <th style={thStyle}>Contenido</th>
          <th style={thStyle}>Autoridad</th>
          <th style={thStyle}>Desde</th>
          <th style={thStyle}>Hasta</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r, i) => (
          <tr key={i} style={{
            background: i % 2 === 0 ? '#fff' : 'var(--bg)',
            borderBottom: '1px solid var(--border)',
          }}>
            <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--steel)' }}>
              {r.number}
            </td>
            <td style={tdStyle}>
              <div style={{ fontWeight: '500', color: 'var(--ink)' }}>
                {r.decisionDocumentNumber || '--'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--steel)', marginTop: '2px' }}>
                {r.decisionDocumentName || ''}
              </div>
            </td>
            <td style={tdStyle}>
              <span style={{
                display: 'inline-block', padding: '2px 8px',
                background: 'var(--bg)', fontFamily: 'var(--font-dm)',
                fontSize: '10px', fontWeight: '500', color: 'var(--steel)',
              }}>
                {r.permitCategory || '--'}
              </span>
            </td>
            <td style={tdStyle}>{r.permitContent || '--'}</td>
            <td style={{ ...tdStyle, fontSize: '11px', color: 'var(--steel)' }}>
              {r.issuingAuthority || '--'}
            </td>
            <td style={{ ...tdStyle, fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>
              {r.validFrom || '--'}
            </td>
            <td style={{ ...tdStyle, fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--steel)' }}>
              {r.validTo || '--'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const thStyle = {
  padding: '9px 12px',
  textAlign: 'left',
  fontFamily: 'var(--font-dm)',
  fontSize: '10px',
  fontWeight: '600',
  color: '#fff',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '10px 12px',
  fontSize: '12px',
  color: 'var(--ink)',
  verticalAlign: 'top',
}
