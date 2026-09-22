// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  password: z.string().min(6).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'users:edit')) return apiError('Sem permissão', 403)

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return apiError('Usuário não encontrado', 404)

  // Protege Super Admin de ser editado por não-Super Admin
  if (target.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return apiError('Sem permissão para editar Super Admin', 403)
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const { name, role, status, password } = parsed.data

  // Apenas Super Admin pode promover a Super Admin
  if (role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return apiError('Sem permissão para atribuir role Super Admin', 403)
  }

  const updateData: Record<string, unknown> = {}
  if (name) updateData.name = name
  if (role) updateData.role = role
  if (status) updateData.status = status
  if (password) updateData.password = await bcrypt.hash(password, 12)

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, status: true },
  })

  const action = status === 'ATIVO' && target.status === 'PENDENTE'
    ? AUDIT_ACTIONS.USUARIO_APROVADO
    : status === 'BLOQUEADO'
    ? AUDIT_ACTIONS.USUARIO_BLOQUEADO
    : status === 'RECUSADO'
    ? AUDIT_ACTIONS.USUARIO_RECUSADO
    : AUDIT_ACTIONS.USUARIO_EDITADO

  await createAuditLog({ userId: user.id, userName: user.name, action, resource: 'users', resourceId: params.id, details: updateData })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (user.role !== 'SUPER_ADMIN') return apiError('Sem permissão', 403)
  if (user.id === params.id) return apiError('Você não pode excluir sua própria conta')

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return apiError('Usuário não encontrado', 404)
  if (target.role === 'SUPER_ADMIN' && user.id !== params.id) {
    return apiError('Não é possível excluir outro Super Admin')
  }

  await prisma.user.delete({ where: { id: params.id } })
  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.USUARIO_EXCLUIDO, resource: 'users', resourceId: params.id, details: { name: target.name } })

  return NextResponse.json({ message: 'Usuário excluído' })
}
