// src/app/api/files/[id]/route.ts
// Serve arquivos de atestado com autenticação obrigatória
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { readFile } from '@/lib/upload'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'files:view')) return apiError('Sem permissão', 403)

  const file = await prisma.certificateFile.findUnique({ where: { id: params.id } })
  if (!file) return apiError('Arquivo não encontrado', 404)

  const buffer = readFile(file.filePath)
  if (!buffer) return apiError('Arquivo não encontrado no disco', 404)

  const download = req.nextUrl.searchParams.get('download') === 'true'

  if (download) {
    await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.DOCUMENTO_BAIXADO, resource: 'files', resourceId: params.id, details: { fileName: file.originalName } })
  } else {
    await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.DOCUMENTO_VISUALIZADO, resource: 'files', resourceId: params.id, details: { fileName: file.originalName } })
  }

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': String(buffer.length),
      'Content-Disposition': download
        ? `attachment; filename="${encodeURIComponent(file.originalName)}"`
        : `inline; filename="${encodeURIComponent(file.originalName)}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'files:upload')) return apiError('Sem permissão', 403)

  const file = await prisma.certificateFile.findUnique({ where: { id: params.id } })
  if (!file) return apiError('Arquivo não encontrado', 404)

  await prisma.certificateFile.delete({ where: { id: params.id } })

  return NextResponse.json({ message: 'Arquivo removido' })
}
