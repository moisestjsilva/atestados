// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)

  const settings = await prisma.systemSettings.findFirst()
  if (!settings) {
    const created = await prisma.systemSettings.create({ data: { id: '1' } })
    return NextResponse.json(created)
  }
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (user.role !== 'SUPER_ADMIN') return apiError('Sem permissão', 403)

  const body = await req.json()
  const allowed = ['companyName', 'maxUploadMb', 'allowedExtensions', 'itemsPerPage']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key]
  }

  let settings = await prisma.systemSettings.findFirst()
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: { id: '1', ...data } })
  } else {
    settings = await prisma.systemSettings.update({ where: { id: settings.id }, data })
  }

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.CONFIGURACOES_ALTERADAS, resource: 'settings', details: data })

  return NextResponse.json(settings)
}
