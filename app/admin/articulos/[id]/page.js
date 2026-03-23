import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import ArticuloEditor from '../ArticuloEditor'

const prisma = new PrismaClient()

export default async function EditarArticuloPage({ params }) {
  const session = await getServerSession(authOptions)
  const [articulo, categorias] = await Promise.all([
    prisma.article.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  return <ArticuloEditor articulo={articulo} categorias={categorias} userId={session.user.id} />
}