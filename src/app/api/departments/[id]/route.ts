// src/app/api/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { z } from 'zod'

const updateSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'departments:edit')) return apiError('Sem permissão', 403)

  const dept = await prisma.department.findUnique({ where: { id: params.id } })
  if (!dept) return apiError('Setor não encontrado', 404)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  if (parsed.data.code && parsed.data.code !== dept.code) {
    const dup = await prisma.department.findUnique({ where: { code: parsed.data.code.toUpperCase() } })
    if (dup) return apiError('Código já em uso por outro setor')
    parsed.data.code = parsed.data.code.toUpperCase()
  }

  const updated = await prisma.department.update({ where: { id: params.id }, data: parsed.data })
  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.SETOR_EDITADO, resource: 'departments', resourceId: params.id, details: parsed.data })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'departments:delete')) return apiError('Sem permissão', 403)

  const dept = await prisma.department.findUnique({ where: { id: params.id } })
  if (!dept) return apiError('Setor não encontrado', 404)

  const employeeCount = await prisma.employee.count({ where: { departmentId: params.id, deletedAt: null } })
  if (employeeCount > 0) {
    return apiError(`Setor possui ${employeeCount} funcionário(s) vinculado(s). Transfira-os antes de excluir.`, 400)
  }

  await prisma.department.delete({ where: { id: params.id } })
  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.SETOR_EXCLUIDO, resource: 'departments', resourceId: params.id, details: { name: dept.name } })

  return NextResponse.json({ message: 'Setor excluído' })
}
