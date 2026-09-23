// src/app/api/certificates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { z } from 'zod'

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:view')) return apiError('Sem permissão', 403)

  const cert = await prisma.medicalCertificate.findFirst({
    where: { id, status: 'ATIVO' },
    include: {
      employee: { include: { department: true } },
      cid: true,
      files: true,
      registeredBy: { select: { name: true } },
    },
  })

  if (!cert) return apiError('Atestado não encontrado', 404)
  return NextResponse.json(cert)
}

const updateSchema = z.object({
  cidId: z.string().optional().nullable(),
  cidDescription: z.string().optional().nullable(),
  doctor: z.string().optional().nullable(),
  crm: z.string().optional().nullable(),
  certificateDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  daysOff: z.number().min(1).optional(),
  observations: z.string().optional().nullable(),
})

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:edit')) return apiError('Sem permissão', 403)

  const cert = await prisma.medicalCertificate.findFirst({ where: { id, status: 'ATIVO' } })
  if (!cert) return apiError('Atestado não encontrado', 404)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    const msg = (parsed.error as any).issues?.[0]?.message || 'Dados inválidos'
    return apiError(msg)
  }

  const data: Record<string, unknown> = {}
  const p = parsed.data
  if (p.cidId !== undefined) data.cidId = p.cidId
  if (p.cidDescription !== undefined) data.cidDescription = p.cidDescription
  if (p.doctor !== undefined) data.doctor = p.doctor
  if (p.crm !== undefined) data.crm = p.crm
  if (p.certificateDate) data.certificateDate = new Date(p.certificateDate)
  if (p.startDate) data.startDate = new Date(p.startDate)
  if (p.endDate) data.endDate = new Date(p.endDate)
  if (p.daysOff) data.daysOff = p.daysOff
  if (p.observations !== undefined) data.observations = p.observations

  const updated = await prisma.medicalCertificate.update({
    where: { id },
    data,
    include: { employee: { select: { name: true } }, cid: { select: { code: true } } },
  })

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.ATESTADO_EDITADO, resource: 'certificates', resourceId: id, details: data })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:delete')) return apiError('Sem permissão', 403)

  const cert = await prisma.medicalCertificate.findFirst({ where: { id, status: 'ATIVO' } })
  if (!cert) return apiError('Atestado não encontrado', 404)

  // Exclusão lógica
  await prisma.medicalCertificate.update({
    where: { id },
    data: { status: 'EXCLUIDO', deletedAt: new Date() },
  })

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.ATESTADO_EXCLUIDO, resource: 'certificates', resourceId: id, details: { employeeId: cert.employeeId } })

  return NextResponse.json({ message: 'Atestado excluído' })
}
