// src/app/api/employees/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { normalizeCpf, isValidCpf } from '@/lib/utils'
import { z } from 'zod'

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'employees:view')) return apiError('Sem permissão', 403)

  const employee = await prisma.employee.findFirst({
    where: { id, deletedAt: null },
    include: {
      department: true,
      certificates: {
        where: { status: 'ATIVO' },
        include: { cid: true, files: true },
        orderBy: { certificateDate: 'desc' },
      },
    },
  })

  if (!employee) return apiError('Funcionário não encontrado', 404)
  return NextResponse.json(employee)
}

const updateSchema = z.object({
  matricula: z.string().optional(),
  name: z.string().min(2).optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional().nullable(),
  cargo: z.string().optional(),
  departmentId: z.string().optional(),
  admissionDate: z.string().optional().nullable(),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
})

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'employees:edit')) return apiError('Sem permissão', 403)

  const employee = await prisma.employee.findFirst({ where: { id, deletedAt: null } })
  if (!employee) return apiError('Funcionário não encontrado', 404)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    const msg = (parsed.error as any).issues?.[0]?.message || 'Dados inválidos'
    return apiError(msg)
  }

  const data = parsed.data
  if (data.cpf) {
    const normalized = normalizeCpf(data.cpf)
    if (!isValidCpf(normalized)) return apiError('CPF inválido')
    // Verifica duplicidade excluindo o atual
    const dup = await prisma.employee.findFirst({
      where: { cpf: normalized, deletedAt: null, NOT: { id } },
    })
    if (dup) return apiError('CPF já cadastrado para outro funcionário')
    data.cpf = normalized
  }

  const updateData: Record<string, unknown> = {}
  if (data.name) updateData.name = data.name.trim()
  if (data.cpf) updateData.cpf = data.cpf
  if (data.matricula !== undefined) updateData.matricula = data.matricula
  if (data.cargo !== undefined) updateData.cargo = data.cargo
  if (data.departmentId) updateData.departmentId = data.departmentId
  if (data.status) updateData.status = data.status
  if (data.birthDate !== undefined) updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null
  if (data.admissionDate !== undefined) updateData.admissionDate = data.admissionDate ? new Date(data.admissionDate) : null

  const updated = await prisma.employee.update({ where: { id }, data: updateData, include: { department: true } })
  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.FUNCIONARIO_EDITADO, resource: 'employees', resourceId: id, details: updateData })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'employees:delete')) return apiError('Sem permissão', 403)

  const employee = await prisma.employee.findFirst({ where: { id, deletedAt: null } })
  if (!employee) return apiError('Funcionário não encontrado', 404)

  // Verifica se o funcionário possui atestados cadastrados (qualquer status)
  const certCount = await prisma.medicalCertificate.count({ where: { employeeId: id } })

  if (certCount > 0) {
    // Exclusão lógica (soft delete) - inativa e oculta da lista
    await prisma.employee.update({
      where: { id },
      data: { status: 'INATIVO', deletedAt: new Date() },
    })
    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: AUDIT_ACTIONS.FUNCIONARIO_INATIVADO,
      resource: 'employees',
      resourceId: id,
      details: { name: employee.name, reason: 'possui histórico de atestados' },
    })
    return NextResponse.json({ message: 'Funcionário inativado e removido da lista (possui histórico de atestados)', softDeleted: true })
  }

  // Tenta exclusão física; se houver restrição de integridade em tabelas relativas, realiza soft delete
  try {
    await prisma.employee.delete({ where: { id } })
    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: AUDIT_ACTIONS.FUNCIONARIO_EXCLUIDO,
      resource: 'employees',
      resourceId: id,
      details: { name: employee.name },
    })
    return NextResponse.json({ message: 'Funcionário excluído com sucesso', softDeleted: false })
  } catch {
    await prisma.employee.update({
      where: { id },
      data: { status: 'INATIVO', deletedAt: new Date() },
    })
    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: AUDIT_ACTIONS.FUNCIONARIO_INATIVADO,
      resource: 'employees',
      resourceId: id,
      details: { name: employee.name, reason: 'restrição de integridade' },
    })
    return NextResponse.json({ message: 'Funcionário inativado e removido da lista', softDeleted: true })
  }
}
