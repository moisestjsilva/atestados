// src/app/api/certificates/[id]/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { validateFile, saveFile } from '@/lib/upload'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'files:upload')) return apiError('Sem permissão', 403)

  const cert = await prisma.medicalCertificate.findFirst({
    where: { id, status: 'ATIVO' },
    include: { employee: { select: { cpf: true } } },
  })
  if (!cert) return apiError('Atestado não encontrado', 404)

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return apiError('Nenhum arquivo enviado')

  const buffer = Buffer.from(await file.arrayBuffer())
  const mimeType = file.type
  const originalName = file.name

  const validationError = validateFile(originalName, mimeType, buffer.length)
  if (validationError) return apiError(validationError)

  const saved = await saveFile(buffer, originalName, mimeType, cert.employee.cpf, cert.certificateDate)

  const certFile = await prisma.certificateFile.create({
    data: {
      certificateId: id,
      originalName: saved.originalName,
      storedName: saved.storedName,
      filePath: saved.filePath,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
      uploadedById: user.id,
    },
  })

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.DOCUMENTO_ENVIADO, resource: 'certificates', resourceId: id, details: { fileName: originalName } })

  return NextResponse.json(certFile, { status: 201 })
}
