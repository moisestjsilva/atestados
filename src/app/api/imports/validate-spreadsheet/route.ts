// src/app/api/imports/validate-spreadsheet/route.ts
// Etapa 1 + 2: Recebe planilha Excel e valida os dados
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { normalizeCpf, isValidCpf } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export interface SpreadsheetRow {
  index: number
  cpf: string
  normalizedCpf: string
  certificateDate: string
  startDate: string
  endDate: string
  daysOff: number
  cidCode: string
  cidDescription: string
  doctor: string
  crm: string
  observations: string
  status: 'OK' | 'ERRO' | 'AVISO'
  errors: string[]
  employeeId?: string
  employeeName?: string
  cidId?: string
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:import')) return apiError('Sem permissão', 403)

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return apiError('Nenhum arquivo enviado')

  const buffer = Buffer.from(await file.arrayBuffer())

  let workbook: XLSX.WorkBook
  try {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  } catch {
    return apiError('Não foi possível ler o arquivo. Verifique se é um arquivo Excel válido (.xlsx ou .xls).')
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  if (rawData.length === 0) {
    return apiError('A planilha está vazia.')
  }

  // Normaliza chaves (remove espaços, uppercase)
  const normalizeKey = (k: string) => k.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')

  const rows: SpreadsheetRow[] = []

  for (let i = 0; i < rawData.length; i++) {
    const rawRow = rawData[i]
    const row: Record<string, string> = {}
    for (const [k, v] of Object.entries(rawRow)) {
      row[normalizeKey(k)] = String(v ?? '').trim()
    }

    const errors: string[] = []

    // CPF
    const rawCpf = row['CPF'] || ''
    const normalizedCpf = normalizeCpf(rawCpf)
    if (!rawCpf) errors.push('CPF vazio')
    else if (!isValidCpf(normalizedCpf)) errors.push('CPF inválido')

    // Datas
    const certDate = row['DATA_ATESTADO'] || row['DATA'] || ''
    const startDate = row['DATA_INICIO'] || row['INICIO'] || certDate
    const endDate = row['DATA_FIM'] || row['FIM'] || ''

    if (!certDate) errors.push('Data do atestado vazia')
    if (!endDate) errors.push('Data final vazia')

    // Dias
    const daysRaw = row['DIAS_AFASTAMENTO'] || row['DIAS'] || ''
    const daysOff = parseInt(daysRaw) || 0
    if (!daysRaw && !endDate) errors.push('Dias de afastamento não informados')

    // CID
    const cidCode = (row['CID'] || '').toUpperCase().trim()

    rows.push({
      index: i + 1,
      cpf: rawCpf,
      normalizedCpf,
      certificateDate: certDate,
      startDate,
      endDate,
      daysOff,
      cidCode,
      cidDescription: row['DESCRICAO_CID'] || row['DESCRICAO'] || '',
      doctor: row['MEDICO'] || row['MÉDICO'] || '',
      crm: row['CRM'] || '',
      observations: row['OBSERVACAO'] || row['OBSERVACAO'] || '',
      status: errors.length > 0 ? 'ERRO' : 'OK',
      errors,
    })
  }

  // Busca funcionários e CIDs em lote
  const validCpfs = [...new Set(rows.filter(r => isValidCpf(r.normalizedCpf)).map(r => r.normalizedCpf))]
  const cidCodes = [...new Set(rows.filter(r => r.cidCode).map(r => r.cidCode))]

  const [employees, cids] = await Promise.all([
    prisma.employee.findMany({
      where: { cpf: { in: validCpfs }, deletedAt: null },
      select: { id: true, name: true, cpf: true },
    }),
    prisma.cidCode.findMany({
      where: { code: { in: cidCodes }, status: 'ATIVO' },
      select: { id: true, code: true, description: true },
    }),
  ])

  const empMap = new Map(employees.map(e => [e.cpf, e]))
  const cidMap = new Map(cids.map(c => [c.code, c]))

  // Enriquece com dados do banco
  for (const row of rows) {
    if (row.status === 'ERRO') continue

    const emp = empMap.get(row.normalizedCpf)
    if (!emp) {
      row.status = 'ERRO'
      row.errors.push('Funcionário não encontrado')
    } else {
      row.employeeId = emp.id
      row.employeeName = emp.name
    }

    if (row.cidCode) {
      const cid = cidMap.get(row.cidCode)
      if (cid) {
        row.cidId = cid.id
        if (!row.cidDescription) row.cidDescription = cid.description
      } else {
        row.errors.push(`CID ${row.cidCode} não encontrado no sistema`)
        row.status = 'AVISO'
      }
    }
  }

  const totalOk = rows.filter(r => r.status === 'OK').length
  const totalErrors = rows.filter(r => r.status === 'ERRO').length
  const totalWarnings = rows.filter(r => r.status === 'AVISO').length

  return NextResponse.json({
    total: rows.length,
    ok: totalOk,
    errors: totalErrors,
    warnings: totalWarnings,
    rows,
    filename: file.name,
  })
}
