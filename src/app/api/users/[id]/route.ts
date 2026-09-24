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
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  email: z.string().email('E-mail inválido').optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  password: z.string().optional(),
})

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'users:edit')) return apiError('Sem permissão', 403)

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return apiError('Usuário não encontrado', 404)

  // Protege Super Admin de ser editado por não-Super Admin
  if (target.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return apiError('Sem permissão para editar Super Admin', 403)
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    const msg = (parsed.error as any).issues?.[0]?.message || 'Dados inválidos'
    return apiError(msg)
  }

  const { name, email, role, status, password } = parsed.data

  // Apenas Super Admin pode promover a Super Admin
  if (role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return apiError('Sem permissão para atribuir role Super Admin', 403)
  }

  // Se o e-mail mudou, verifica se já existe outro usuário com ele
  if (email && email.toLowerCase() !== target.email.toLowerCase()) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing && existing.id !== id) {
      return apiError('Este e-mail já está cadastrado por outro usuário', 400)
    }
  }

  const updateData: Record<string, unknown> = {}
  if (name) updateData.name = name
  if (email) updateData.email = email.toLowerCase()
  if (role) updateData.role = role
  if (status) updateData.status = status
  if (password && password.trim().length > 0) {
    if (password.trim().length < 6) {
      return apiError('A nova senha deve ter no mínimo 6 caracteres', 400)
    }
    updateData.password = await bcrypt.hash(password.trim(), 12)
  }

  const updated = await prisma.user.update({
    where: { id },
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

  await createAuditLog({ userId: user.id, userName: user.name, action, resource: 'users', resourceId: id, details: updateData })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (user.role !== 'SUPER_ADMIN') return apiError('Sem permissão', 403)
  if (user.id === id) return apiError('Você não pode excluir sua própria conta')

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return apiError('Usuário não encontrado', 404)
  if (target.role === 'SUPER_ADMIN' && user.id !== id) {
    return apiError('Não é possível excluir outro Super Admin')
  }

  await prisma.user.delete({ where: { id } })
  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.USUARIO_EXCLUIDO, resource: 'users', resourceId: id, details: { name: target.name } })

  return NextResponse.json({ message: 'Usuário excluído' })
}
