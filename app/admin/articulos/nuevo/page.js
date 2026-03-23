import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import ArticuloEditor from '../ArticuloEditor'

const prisma = new PrismaClient()

export default async function NuevoArticuloPage() {
  const session = await getServerSession(authOptions)
  const categorias = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  return <ArticuloEditor categorias={categorias} userId={session.user.id} />
}