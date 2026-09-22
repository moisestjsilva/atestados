// src/app/api/certificates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { normalizeCpf, daysBetween } from '@/lib/utils'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:view')) return apiError('Sem permissão', 403)

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const employeeId = searchParams.get('employeeId') || ''
  const departmentId = searchParams.get('departmentId') || ''
  const cidId = searchParams.get('cidId') || ''
  const cpf = searchParams.get('cpf') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''
  const minDays = searchParams.get('minDays') ? parseInt(searchParams.get('minDays')!) : undefined
  const maxDays = searchParams.get('maxDays') ? parseInt(searchParams.get('maxDays')!) : undefined

  const where: Record<string, unknown> = {
    status: 'ATIVO',
    ...(employeeId && { employeeId }),
    ...(cidId && { cidId }),
    ...(dateFrom && { certificateDate: { gte: new Date(dateFrom) } }),
    ...(dateTo && { certificateDate: { lte: new Date(dateTo) } }),
    ...(minDays !== undefined && { daysOff: { gte: minDays } }),
    ...(maxDays !== undefined && { daysOff: { lte: maxDays } }),
  }

  if (cpf) {
    where.employee = { cpf: normalizeCpf(cpf) }
  }
  if (departmentId) {
    where.employee = { ...(where.employee as object || {}), departmentId }
  }

  if (dateFrom && dateTo) {
    where.certificateDate = { gte: new Date(dateFrom), lte: new Date(dateTo) }
  }

  const [certificates, total] = await Promise.all([
    prisma.medicalCertificate.findMany({
      where,
      include: {
        employee: { include: { department: { select: { name: true } } } },
        cid: { select: { code: true, description: true } },
        files: { select: { id: true, originalName: true, mimeType: true } },
      },
      orderBy: { certificateDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.medicalCertificate.count({ where }),
  ])

  return NextResponse.json({ certificates, total, page, limit, pages: Math.ceil(total / limit) })
}

const createSchema = z.object({
  employeeId: z.string().min(1, 'Funcionário obrigatório'),
  cidId: z.string().optional(),
  cidDescription: z.string().optional(),
  doctor: z.string().optional(),
  crm: z.string().optional(),
  certificateDate: z.string().min(1, 'Data do atestado obrigatória'),
  startDate: z.string().min(1, 'Data inicial obrigatória'),
  endDate: z.string().min(1, 'Data final obrigatória'),
  daysOff: z.number().min(1, 'Mínimo 1 dia'),
  observations: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:create')) return apiError('Sem permissão', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const { employeeId, cidId, cidDescription, doctor, crm, certificateDate, startDate, endDate, daysOff, observations } = parsed.data

  const employee = await prisma.employee.findFirst({ where: { id: employeeId, deletedAt: null } })
  if (!employee) return apiError('Funcionário não encontrado')

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (end < start) return apiError('Data final não pode ser anterior à data inicial')

  const calculatedDays = daysBetween(start, end)

  // Verifica duplicidade
  const dup = await prisma.medicalCertificate.findFirst({
    where: {
      employeeId,
      startDate: start,
      endDate: end,
      status: 'ATIVO',
      ...(cidId && { cidId }),
    },
  })
  if (dup) return apiError('Possível atestado duplicado detectado. Verifique o histórico do funcionário.')

  const cert = await prisma.medicalCertificate.create({
    data: {
      employeeId,
      cidId: cidId || null,
      cidDescription: cidDescription || null,
      doctor: doctor || null,
      crm: crm || null,
      certificateDate: new Date(certificateDate),
      startDate: start,
      endDate: end,
      daysOff: daysOff || calculatedDays,
      observations: observations || null,
      registeredById: user.id,
    },
    include: {
      employee: { select: { name: true, cpf: true } },
      cid: { select: { code: true, description: true } },
    },
  })

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.ATESTADO_CRIADO, resource: 'certificates', resourceId: cert.id, details: { employeeId, certificateDate } })

  return NextResponse.json(cert, { status: 201 })
}
