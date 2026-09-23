// src/app/api/cid/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { z } from 'zod'

const updateSchema = z.object({
  code: z.string().min(1).optional(),
  description: z.string().min(3).optional(),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
})

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'cid:edit')) return apiError('Sem permissão', 403)

  const cid = await prisma.cidCode.findUnique({ where: { id } })
  if (!cid) return apiError('CID não encontrado', 404)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    const msg = (parsed.error as any).issues?.[0]?.message || 'Dados inválidos'
    return apiError(msg)
  }

  const data: Record<string, unknown> = {}
  if (parsed.data.code) data.code = parsed.data.code.toUpperCase().trim()
  if (parsed.data.description) data.description = parsed.data.description.trim()
  if (parsed.data.status) data.status = parsed.data.status

  const updated = await prisma.cidCode.update({ where: { id }, data })
  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.CID_EDITADO, resource: 'cid', resourceId: id, details: data })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'cid:delete')) return apiError('Sem permissão', 403)

  const cid = await prisma.cidCode.findUnique({ where: { id } })
  if (!cid) return apiError('CID não encontrado', 404)

  const certCount = await prisma.medicalCertificate.count({ where: { cidId: id, status: 'ATIVO' } })
  if (certCount > 0) {
    // Inativa em vez de excluir
    await prisma.cidCode.update({ where: { id }, data: { status: 'INATIVO' } })
    return NextResponse.json({ message: 'CID inativado pois possui atestados vinculados', inactivated: true })
  }

  await prisma.cidCode.delete({ where: { id } })
  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.CID_EXCLUIDO, resource: 'cid', resourceId: id, details: { code: cid.code } })

  return NextResponse.json({ message: 'CID excluído' })
}
