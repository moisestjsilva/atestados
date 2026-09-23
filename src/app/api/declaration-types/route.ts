// src/app/api/declaration-types/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)

  const { searchParams } = new URL(req.url)
  const search = (searchParams.get('search') || '').trim()
  const all = searchParams.get('all') === 'true'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: any = {
    ...(search && {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
        { legalBase: { contains: search } },
        { code: { contains: search } },
      ],
    }),
  }

  if (all) {
    const declarationTypes = await prisma.declarationType.findMany({
      where: { ...where, status: 'ATIVO' },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ declarationTypes })
  }

  const [declarationTypes, total] = await Promise.all([
    prisma.declarationType.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.declarationType.count({ where }),
  ])

  return NextResponse.json({
    declarationTypes,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  })
}

const createSchema = z.object({
  code: z.string().min(2, 'Código obrigatório'),
  name: z.string().min(2, 'Nome obrigatório'),
  description: z.string().min(3, 'Descrição obrigatória'),
  documentRequired: z.string().optional().nullable(),
  quantity: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  isPaid: z.boolean().optional(),
  legalBase: z.string().optional().nullable(),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'settings:edit') && !can(user.role, 'certificates:create')) {
    return apiError('Sem permissão para cadastrar tipos de declaração', 403)
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const msg = (parsed.error as any).issues?.[0]?.message || 'Dados inválidos'
    return apiError(msg)
  }

  const { code, name, description, documentRequired, quantity, unit, isPaid, legalBase, status } = parsed.data
  const codeNorm = code.trim().toLowerCase().replace(/\s+/g, '_')

  const existing = await prisma.declarationType.findUnique({ where: { code: codeNorm } })
  if (existing) {
    return apiError('Já existe um tipo de declaração cadastrado com este código')
  }

  const declarationType = await prisma.declarationType.create({
    data: {
      code: codeNorm,
      name: name.trim(),
      description: description.trim(),
      documentRequired: documentRequired ? documentRequired.trim() : null,
      quantity: quantity !== undefined ? quantity : null,
      unit: unit ? unit.trim() : null,
      isPaid: isPaid ?? true,
      legalBase: legalBase ? legalBase.trim() : null,
      status: status || 'ATIVO',
    },
  })

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    action: 'CRIAR_TIPO_DECLARACAO',
    resource: 'declaration_types',
    resourceId: declarationType.id,
    details: { name: declarationType.name, code: declarationType.code },
  })

  return NextResponse.json(declarationType, { status: 201 })
}
