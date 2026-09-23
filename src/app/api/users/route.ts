// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { UserRole, UserStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'users:view')) return apiError('Sem permissão', 403)

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') as UserStatus | null
  const search = searchParams.get('search') || ''

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, lastLogin: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ users, total, page, limit, pages: Math.ceil(total / limit) })
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus).optional(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'users:create')) return apiError('Sem permissão', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return apiError((parsed.error as any).issues?.[0]?.message || 'Dados inválidos')
  }

  const { name, email, password, role, status } = parsed.data

  // Apenas Super Admin pode criar Super Admin
  if (role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return apiError('Sem permissão para criar Super Admin', 403)
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return apiError('E-mail já cadastrado')

  const hashed = await bcrypt.hash(password, 12)
  const created = await prisma.user.create({
    data: { name, email: email.toLowerCase(), password: hashed, role, status: status || 'ATIVO' },
    select: { id: true, name: true, email: true, role: true, status: true },
  })

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.USUARIO_CRIADO, resource: 'users', resourceId: created.id, details: { name, email, role } })

  return NextResponse.json(created, { status: 201 })
}
