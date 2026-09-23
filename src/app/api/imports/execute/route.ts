// src/app/api/imports/execute/route.ts
// Etapa 9-10: Executa a importação em lote
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { validateFile, saveFile } from '@/lib/upload'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { normalizeCpf, isValidCpf, daysBetween } from '@/lib/utils'

export const maxDuration = 300 // 5 minutos

interface ImportRow {
  index: number
  employeeId?: string
  employeeName?: string
  cpf: string
  cidId?: string
  cidDescription?: string
  doctor?: string
  crm?: string
  certificateDate: string
  startDate: string
  endDate: string
  daysOff: number
  observations?: string
  fileName?: string
  fileData?: string // base64
  fileMime?: string
  fileOriginalName?: string
  skipDuplicate?: boolean
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:import')) return apiError('Sem permissão', 403)

  const body = await req.json()
  const { rows, spreadsheetName } = body as { rows: ImportRow[], spreadsheetName: string }

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return apiError('Nenhum registro para importar')
  }

  // Cria registro de importação
  const bulkImport = await prisma.bulkImport.create({
    data: {
      userId: user.id,
      spreadsheetName: spreadsheetName || 'importacao',
      totalRows: rows.length,
      status: 'PROCESSANDO',
    },
  })

  let imported = 0
  let errors = 0
  let pending = 0
  const errorReport: Array<{
    row: number, cpf: string, employee: string, problem: string, status: string
  }> = []

  // Processa em lotes de 50
  const BATCH_SIZE = 50
  for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
    const batch = rows.slice(batchStart, batchStart + BATCH_SIZE)

    for (const row of batch) {
      try {
        const normCpf = normalizeCpf(row.cpf)

        // Valida funcionário
        let employee = row.employeeId ? await prisma.employee.findFirst({
          where: { id: row.employeeId, deletedAt: null },
          select: { id: true, name: true, cpf: true },
        }) : null

        if (!employee && normCpf) {
          employee = await prisma.employee.findFirst({
            where: { cpf: normCpf, deletedAt: null },
            select: { id: true, name: true, cpf: true },
          })
        }

        // Auto-criação de funcionário se não existir mas houver nome
        if (!employee && row.employeeName && isValidCpf(normCpf)) {
          let defaultDept = await prisma.department.findFirst({ where: { status: 'ATIVO' } })
          if (!defaultDept) {
            defaultDept = await prisma.department.create({
              data: { code: 'GERAL', name: 'Geral', status: 'ATIVO' },
            })
          }
          employee = await prisma.employee.create({
            data: {
              name: row.employeeName,
              cpf: normCpf,
              departmentId: defaultDept.id,
              status: 'ATIVO',
            },
            select: { id: true, name: true, cpf: true },
          })
        }

        if (!employee) {
          errors++
          errorReport.push({ row: row.index, cpf: row.cpf, employee: row.employeeName || '—', problem: 'Funcionário não encontrado', status: 'ERRO' })
          continue
        }

        const certDate = row.certificateDate ? new Date(row.certificateDate) : new Date()
        const startDate = row.startDate ? new Date(row.startDate) : certDate
        const endDate = row.endDate ? new Date(row.endDate) : startDate

        // Verifica duplicidade
        if (!row.skipDuplicate) {
          const dup = await prisma.medicalCertificate.findFirst({
            where: {
              employeeId: employee.id,
              startDate,
              endDate,
              status: 'ATIVO',
            },
          })
          if (dup) {
            pending++
            errorReport.push({ row: row.index, cpf: row.cpf, employee: employee.name, problem: 'Possível duplicidade detectada', status: 'PENDENTE' })
            await prisma.bulkImportItem.create({
              data: {
                bulkImportId: bulkImport.id,
                rowIndex: row.index,
                cpf: row.cpf,
                employeeName: employee.name,
                certificateDate: row.certificateDate,
                cidCode: row.cidId || '',
                daysOff: row.daysOff,
                fileName: row.fileName,
                status: 'DUPLICIDADE',
                errorMessage: 'Possível duplicidade',
              },
            })
            continue
          }
        }

        // Cria o atestado
        const cert = await prisma.medicalCertificate.create({
          data: {
            employeeId: employee.id,
            cidId: row.cidId || null,
            cidDescription: row.cidDescription || null,
            doctor: row.doctor || null,
            crm: row.crm || null,
            certificateDate: certDate,
            startDate,
            endDate,
            daysOff: row.daysOff || daysBetween(startDate, endDate),
            observations: row.observations || null,
            registeredById: user.id,
          },
        })

        // Salva arquivo se fornecido
        if (row.fileData && row.fileMime && row.fileOriginalName) {
          try {
            const buffer = Buffer.from(row.fileData, 'base64')
            const validErr = validateFile(row.fileOriginalName, row.fileMime, buffer.length)
            if (!validErr) {
              const saved = await saveFile(buffer, row.fileOriginalName, row.fileMime, employee.cpf, certDate)
              await prisma.certificateFile.create({
                data: {
                  certificateId: cert.id,
                  originalName: saved.originalName,
                  storedName: saved.storedName,
                  filePath: saved.filePath,
                  mimeType: saved.mimeType,
                  sizeBytes: saved.sizeBytes,
                  uploadedById: user.id,
                },
              })
            }
          } catch (fileErr) {
            console.error('Erro ao salvar arquivo:', fileErr)
          }
        }

        // Registra item de importação
        await prisma.bulkImportItem.create({
          data: {
            bulkImportId: bulkImport.id,
            rowIndex: row.index,
            cpf: row.cpf,
            employeeName: employee.name,
            certificateDate: row.certificateDate,
            cidCode: row.cidId || '',
            daysOff: row.daysOff,
            fileName: row.fileName,
            status: 'OK',
            certificateId: cert.id,
          },
        })

        imported++
      } catch (err) {
        console.error(`Erro ao importar linha ${row.index}:`, err)
        errors++
        errorReport.push({
          row: row.index,
          cpf: row.cpf,
          employee: '—',
          problem: 'Erro interno ao processar',
          status: 'ERRO',
        })
      }
    }
  }

  // Atualiza registro de importação
  const finalStatus = errors > 0 || pending > 0 ? 'CONCLUIDO_COM_ERROS' : 'CONCLUIDO'
  await prisma.bulkImport.update({
    where: { id: bulkImport.id },
    data: {
      imported,
      errors,
      pending,
      status: finalStatus,
      errorReport,
    },
  })

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    action: AUDIT_ACTIONS.ATESTADOS_IMPORTADOS,
    resource: 'imports',
    resourceId: bulkImport.id,
    details: { total: rows.length, imported, errors, pending },
  })

  return NextResponse.json({
    importId: bulkImport.id,
    total: rows.length,
    imported,
    errors,
    pending,
    status: finalStatus,
    errorReport,
  })
}
