// src/app/api/declaration-types/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog } from '@/lib/audit'
import { z } from 'zod'

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)

  const item = await prisma.declarationType.findUnique({ where: { id } })
  if (!item) return apiError('Tipo de declaração não encontrado', 404)

  return NextResponse.json(item)
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(3).optional(),
  documentRequired: z.string().optional().nullable(),
  quantity: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  isPaid: z.boolean().optional(),
  legalBase: z.string().optional().nullable(),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
})

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'settings:edit') && !can(user.role, 'certificates:edit')) {
    return apiError('Sem permissão', 403)
  }

  const existing = await prisma.declarationType.findUnique({ where: { id } })
  if (!existing) return apiError('Tipo de declaração não encontrado', 404)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    const msg = (parsed.error as any).issues?.[0]?.message || 'Dados inválidos'
    return apiError(msg)
  }

  const updated = await prisma.declarationType.update({
    where: { id },
    data: parsed.data,
  })

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    action: 'EDITAR_TIPO_DECLARACAO',
    resource: 'declaration_types',
    resourceId: id,
    details: parsed.data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'settings:edit') && !can(user.role, 'certificates:delete')) {
    return apiError('Sem permissão', 403)
  }

  const existing = await prisma.declarationType.findUnique({ where: { id } })
  if (!existing) return apiError('Tipo de declaração não encontrado', 404)

  const certCount = await prisma.medicalCertificate.count({ where: { declarationTypeId: id } })

  if (certCount > 0) {
    // Inativa se tiver atestados vinculados
    await prisma.declarationType.update({
      where: { id },
      data: { status: 'INATIVO' },
    })
    return NextResponse.json({ message: 'Tipo de declaração inativado', softDeleted: true })
  }

  try {
    await prisma.declarationType.delete({ where: { id } })
    return NextResponse.json({ message: 'Tipo de declaração excluído', softDeleted: false })
  } catch {
    await prisma.declarationType.update({
      where: { id },
      data: { status: 'INATIVO' },
    })
    return NextResponse.json({ message: 'Tipo de declaração inativado', softDeleted: true })
  }
}
