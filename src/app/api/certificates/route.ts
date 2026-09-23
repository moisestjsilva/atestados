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
  const rawSearch = (searchParams.get('search') || searchParams.get('cpf') || searchParams.get('q') || '').trim()
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''
  const minDays = searchParams.get('minDays') ? parseInt(searchParams.get('minDays')!) : undefined
  const maxDays = searchParams.get('maxDays') ? parseInt(searchParams.get('maxDays')!) : undefined

  const where: any = {
    status: 'ATIVO',
    ...(employeeId && { employeeId }),
    ...(cidId && { cidId }),
    ...(minDays !== undefined && { daysOff: { gte: minDays } }),
    ...(maxDays !== undefined && { daysOff: { lte: maxDays } }),
  }

  if (departmentId) {
    where.employee = { ...(where.employee || {}), departmentId }
  }

  if (dateFrom && dateTo) {
    where.certificateDate = { gte: new Date(dateFrom), lte: new Date(dateTo) }
  } else if (dateFrom) {
    where.certificateDate = { gte: new Date(dateFrom) }
  } else if (dateTo) {
    where.certificateDate = { lte: new Date(dateTo) }
  }

  if (rawSearch) {
    const digitsOnly = rawSearch.replace(/\D/g, '')
    const searchConditions: any[] = [
      { employee: { name: { contains: rawSearch } } },
      { doctor: { contains: rawSearch } },
      { cidDescription: { contains: rawSearch } },
      { cid: { code: { contains: rawSearch } } },
      { cid: { description: { contains: rawSearch } } },
    ]
    if (digitsOnly.length >= 2) {
      searchConditions.push({ employee: { cpf: { contains: digitsOnly } } })
    }
    where.OR = searchConditions
  }

  const [certificates, total] = await Promise.all([
    prisma.medicalCertificate.findMany({
      where,
      include: {
        employee: { include: { department: { select: { name: true } } } },
        declarationType: { select: { id: true, name: true, code: true, legalBase: true, isPaid: true } },
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
  documentType: z.enum(['ATESTADO', 'DECLARACAO']).optional(),
  declarationTypeId: z.string().optional().nullable(),
  cidId: z.string().optional().nullable(),
  cidDescription: z.string().optional().nullable(),
  doctor: z.string().optional().nullable(),
  crm: z.string().optional().nullable(),
  certificateDate: z.string().min(1, 'Data do documento obrigatória'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  daysOff: z.number().min(1, 'Mínimo 1 dia').optional(),
  observations: z.string().optional().nullable(),
  fileId: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:create')) return apiError('Sem permissão', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const msg = (parsed.error as any).issues?.[0]?.message || 'Dados inválidos'
    return apiError(msg)
  }

  const { employeeId, documentType, declarationTypeId, cidId, cidDescription, doctor, crm, certificateDate, observations, fileId } = parsed.data
  let { startDate, endDate, daysOff } = parsed.data

  const employee = await prisma.employee.findFirst({ where: { id: employeeId, deletedAt: null } })
  if (!employee) return apiError('Funcionário não encontrado')

  // Se startDate não foi informada, usa a certificateDate
  if (!startDate) startDate = certificateDate

  // Se dias não foi informado, default 1
  const days = daysOff && daysOff > 0 ? daysOff : 1

  // Se endDate não foi informada, calcula a partir de startDate + (days - 1)
  if (!endDate) {
    const s = new Date(startDate)
    s.setDate(s.getDate() + (days - 1))
    endDate = s.toISOString().split('T')[0]
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (end < start) return apiError('Data final não pode ser anterior à data inicial')

  const calculatedDays = daysBetween(start, end)
  const finalDays = daysOff && daysOff > 0 ? daysOff : calculatedDays

  // Verifica duplicidade exata
  const dup = await prisma.medicalCertificate.findFirst({
    where: {
      employeeId,
      startDate: start,
      endDate: end,
      status: 'ATIVO',
    },
  })
  if (dup) return apiError('Já existe um registro ativo cadastrado para este funcionário no mesmo período.')

  const cert = await prisma.medicalCertificate.create({
    data: {
      employeeId,
      documentType: documentType || 'ATESTADO',
      declarationTypeId: declarationTypeId && declarationTypeId.trim() !== '' ? declarationTypeId : null,
      cidId: cidId && cidId.trim() !== '' ? cidId : null,
      cidDescription: cidDescription || null,
      doctor: doctor || null,
      crm: crm || null,
      certificateDate: new Date(certificateDate),
      startDate: start,
      endDate: end,
      daysOff: finalDays,
      observations: observations || null,
      registeredById: user.id,
      ...(fileId ? { files: { connect: { id: fileId } } } : {}),
    },
    include: {
      employee: { select: { name: true, cpf: true } },
      declarationType: { select: { id: true, name: true, legalBase: true } },
      cid: { select: { code: true, description: true } },
      files: true,
    },
  })

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.ATESTADO_CRIADO, resource: 'certificates', resourceId: cert.id, details: { employeeId, certificateDate } })

  return NextResponse.json(cert, { status: 201 })
}
