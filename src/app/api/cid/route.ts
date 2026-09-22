// src/app/api/cid/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'cid:view')) return apiError('Sem permissão', 403)

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const all = searchParams.get('all') === 'true'

  const where = {
    ...(search && {
      OR: [
        { code: { contains: search.toUpperCase() } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  if (all) {
    const cids = await prisma.cidCode.findMany({
      where: { ...where, status: 'ATIVO' },
      select: { id: true, code: true, description: true },
      orderBy: { code: 'asc' },
      take: 50,
    })
    return NextResponse.json({ cids })
  }

  const [cids, total] = await Promise.all([
    prisma.cidCode.findMany({
      where,
      orderBy: { code: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.cidCode.count({ where }),
  ])

  return NextResponse.json({ cids, total, page, limit, pages: Math.ceil(total / limit) })
}

const schema = z.object({
  code: z.string().min(1, 'Código obrigatório').max(10),
  description: z.string().min(3, 'Descrição obrigatória'),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'cid:create')) return apiError('Sem permissão', 403)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const { code, description, status } = parsed.data
  const codeNorm = code.toUpperCase().trim()

  const existing = await prisma.cidCode.findUnique({ where: { code: codeNorm } })
  if (existing) return apiError('CID já cadastrado')

  const cid = await prisma.cidCode.create({
    data: { code: codeNorm, description: description.trim(), status: status || 'ATIVO' },
  })

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.CID_CRIADO, resource: 'cid', resourceId: cid.id, details: { code, description } })

  return NextResponse.json(cid, { status: 201 })
}
