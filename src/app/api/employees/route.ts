// src/app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { normalizeCpf, isValidCpf } from '@/lib/utils'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'employees:view')) return apiError('Sem permissão', 403)

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const departmentId = searchParams.get('departmentId') || ''
  const status = searchParams.get('status') || ''
  const all = searchParams.get('all') === 'true' // Para selects

  const where = {
    deletedAt: null,
    ...(status && { status: status as 'ATIVO' | 'INATIVO' }),
    ...(departmentId && { departmentId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { cpf: { contains: search.replace(/\D/g, '') } },
        { matricula: { contains: search, mode: 'insensitive' as const } },
        { cargo: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  if (all) {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null, status: 'ATIVO' },
      select: { id: true, name: true, cpf: true, matricula: true, cargo: true, department: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ employees })
  }

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { certificates: { where: { status: 'ATIVO' } } } },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.employee.count({ where }),
  ])

  return NextResponse.json({ employees, total, page, limit, pages: Math.ceil(total / limit) })
}

const createSchema = z.object({
  matricula: z.string().optional(),
  name: z.string().min(2, 'Nome inválido'),
  cpf: z.string(),
  birthDate: z.string().optional(),
  cargo: z.string().optional(),
  departmentId: z.string().min(1, 'Setor obrigatório'),
  admissionDate: z.string().optional(),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'employees:create')) return apiError('Sem permissão', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return apiError((parsed.error as any).issues?.[0]?.message || 'Dados inválidos')
  }

  const { matricula, name, cpf, birthDate, cargo, departmentId, admissionDate, status } = parsed.data

  const normalizedCpf = normalizeCpf(cpf)
  if (!isValidCpf(normalizedCpf)) return apiError('CPF inválido')

  // Verifica duplicidade de CPF
  const existing = await prisma.employee.findFirst({
    where: { cpf: normalizedCpf, deletedAt: null },
  })
  if (existing) return apiError('Já existe um funcionário ativo com este CPF')

  // Verifica duplicidade de matrícula
  if (matricula) {
    const existingMat = await prisma.employee.findFirst({
      where: { matricula, deletedAt: null },
    })
    if (existingMat) return apiError('Já existe um funcionário com esta matrícula')
  }

  const employee = await prisma.employee.create({
    data: {
      matricula: matricula || null,
      name: name.trim(),
      cpf: normalizedCpf,
      birthDate: birthDate ? new Date(birthDate) : null,
      cargo: cargo || null,
      departmentId,
      admissionDate: admissionDate ? new Date(admissionDate) : null,
      status: status || 'ATIVO',
    },
    include: { department: { select: { name: true } } },
  })

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.FUNCIONARIO_CRIADO, resource: 'employees', resourceId: employee.id, details: { name, cpf: normalizedCpf } })

  return NextResponse.json(employee, { status: 201 })
}
