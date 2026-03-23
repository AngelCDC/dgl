import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function AdminDashboard() {
  const [articles, suppliers, contacts] = await Promise.all([
    prisma.article.count(),
    prisma.supplier.count(),
    prisma.contactRequest.count({ where: { status: 'new' } }),
  ])

  const recentArticles = await prisma.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  })

  const recentSuppliers = await prisma.supplier.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Artículos" value={articles} />
        <StatCard label="Proveedores" value={suppliers} />
        <StatCard label="Mensajes nuevos" value={contacts} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Section title="Últimos artículos">
          {recentArticles.length === 0 && <Empty text="No hay artículos aún" />}
          {recentArticles.map(a => (
            <Row key={a.id} title={a.title} sub={a.status} />
          ))}
        </Section>
        <Section title="Últimos proveedores">
          {recentSuppliers.length === 0 && <Empty text="No hay proveedores aún" />}
          {recentSuppliers.map(s => (
            <Row key={s.id} title={s.name} sub={s.country} />
          ))}
        </Section>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', padding: '20px' }}>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: '600' }}>{value}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #eee', fontSize: '14px', fontWeight: '500' }}>{title}</div>
      <div>{children}</div>
    </div>
  )
}

function Row({ title, sub }) {
  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid #f5f5f5', fontSize: '13px' }}>
      <div style={{ fontWeight: '500' }}>{title}</div>
      <div style={{ color: '#888', fontSize: '12px' }}>{sub}</div>
    </div>
  )
}

function Empty({ text }) {
  return <div style={{ padding: '16px', color: '#aaa', fontSize: '13px' }}>{text}</div>
}