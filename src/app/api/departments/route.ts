// src/app/api/departments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'departments:view')) return apiError('Sem permissão', 403)

  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'

  if (all) {
    const departments = await prisma.department.findMany({
      where: { status: 'ATIVO' },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ departments })
  }

  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: {
          employees: { where: { deletedAt: null, status: 'ATIVO' } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Adiciona contagem de atestados e dias
  const result = await Promise.all(
    departments.map(async (d) => {
      const certStats = await prisma.medicalCertificate.aggregate({
        where: { employee: { departmentId: d.id }, status: 'ATIVO' },
        _count: true,
        _sum: { daysOff: true },
      })
      return {
        ...d,
        employeeCount: d._count.employees,
        certificateCount: certStats._count,
        totalDaysOff: certStats._sum.daysOff || 0,
      }
    })
  )

  return NextResponse.json({ departments: result })
}

const createSchema = z.object({
  code: z.string().min(1, 'Código obrigatório'),
  name: z.string().min(2, 'Nome inválido'),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'departments:create')) return apiError('Sem permissão', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return apiError((parsed.error as any).issues?.[0]?.message || 'Dados inválidos')
  }

  const { code, name, status } = parsed.data
  const existing = await prisma.department.findUnique({ where: { code: code.toUpperCase() } })
  if (existing) return apiError('Código de setor já cadastrado')

  const dept = await prisma.department.create({
    data: { code: code.toUpperCase(), name: name.trim(), status: status || 'ATIVO' },
  })

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.SETOR_CRIADO, resource: 'departments', resourceId: dept.id, details: { code, name } })

  return NextResponse.json(dept, { status: 201 })
}
