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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'cid:edit')) return apiError('Sem permissão', 403)

  const cid = await prisma.cidCode.findUnique({ where: { id: params.id } })
  if (!cid) return apiError('CID não encontrado', 404)

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.errors[0].message)

  const data: Record<string, unknown> = {}
  if (parsed.data.code) data.code = parsed.data.code.toUpperCase().trim()
  if (parsed.data.description) data.description = parsed.data.description.trim()
  if (parsed.data.status) data.status = parsed.data.status

  const updated = await prisma.cidCode.update({ where: { id: params.id }, data })
  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.CID_EDITADO, resource: 'cid', resourceId: params.id, details: data })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'cid:delete')) return apiError('Sem permissão', 403)

  const cid = await prisma.cidCode.findUnique({ where: { id: params.id } })
  if (!cid) return apiError('CID não encontrado', 404)

  const certCount = await prisma.medicalCertificate.count({ where: { cidId: params.id, status: 'ATIVO' } })
  if (certCount > 0) {
    // Inativa em vez de excluir
    await prisma.cidCode.update({ where: { id: params.id }, data: { status: 'INATIVO' } })
    return NextResponse.json({ message: 'CID inativado pois possui atestados vinculados', inactivated: true })
  }

  await prisma.cidCode.delete({ where: { id: params.id } })
  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.CID_EXCLUIDO, resource: 'cid', resourceId: params.id, details: { code: cid.code } })

  return NextResponse.json({ message: 'CID excluído' })
}
