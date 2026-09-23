// src/app/api/imports/validate-spreadsheet/route.ts
// Etapa 1 + 2: Recebe planilha Excel/CSV e valida os dados de forma resiliente
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { normalizeCpf, isValidCpf, daysBetween } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export interface SpreadsheetRow {
  index: number
  cpf: string
  normalizedCpf: string
  employeeName?: string
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
  cidId?: string
  autoCreateEmployee?: boolean
}

// Utilitário para interpretar datas em formatos variados (DD/MM/AAAA, AAAA-MM-DD, Serial Excel, Date)
function parseDateFlexible(val: unknown): string | null {
  if (!val) return null
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10)
  }
  if (typeof val === 'number') {
    // Serial date do Excel
    const utcDays = Math.floor(val - 25569)
    const utcValue = utcDays * 86400
    const dateInfo = new Date(utcValue * 1000)
    if (!isNaN(dateInfo.getTime())) {
      return dateInfo.toISOString().slice(0, 10)
    }
  }

  const s = String(val).trim()
  if (!s) return null

  // Formato brasileiro DD/MM/AAAA ou DD-MM-AAAA
  const brMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (brMatch) {
    const day = brMatch[1].padStart(2, '0')
    const month = brMatch[2].padStart(2, '0')
    let year = brMatch[3]
    if (year.length === 2) year = '20' + year
    return `${year}-${month}-${day}`
  }

  // Formato ISO AAAA-MM-DD
  const isoMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
  if (isoMatch) {
    const year = isoMatch[1]
    const month = isoMatch[2].padStart(2, '0')
    const day = isoMatch[3].padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const d = new Date(s)
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10)
  }

  return null
}

function addDaysToDate(dateStr: string, days: number): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  } catch {
    return dateStr
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:import')) return apiError('Sem permissão', 403)

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return apiError('Nenhum arquivo enviado')

  const fileName = file.name.toLowerCase()
  let rawData: Record<string, unknown>[] = []

  try {
    if (fileName.endsWith('.csv')) {
      const text = await file.text()
      const parsedCsv = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: h => h.trim(),
      })
      rawData = parsedCsv.data
    } else {
      const buffer = Buffer.from(await file.arrayBuffer())
      const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
    }
  } catch (err: any) {
    return apiError(`Não foi possível processar a planilha: ${err.message || 'Formato inválido'}`)
  }

  if (!rawData || rawData.length === 0) {
    return apiError('A planilha enviada está vazia ou não contém dados válidos.')
  }

  // Normaliza chaves dos cabeçalhos
  const normalizeKey = (k: string) =>
    k.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')

  const getCol = (row: Record<string, unknown>, keys: string[]): unknown => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
        return row[key]
      }
    }
    return ''
  }

  const rows: SpreadsheetRow[] = []

  for (let i = 0; i < rawData.length; i++) {
    const rawRow = rawData[i]
    const rowNormalized: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(rawRow)) {
      rowNormalized[normalizeKey(k)] = v
    }

    const errors: string[] = []

    // 1. CPF
    const rawCpf = String(getCol(rowNormalized, ['CPF', 'CPF_FUNCIONARIO', 'COLABORADOR_CPF', 'DOCUMENTO'])).trim()
    const normalizedCpf = normalizeCpf(rawCpf)
    if (!rawCpf) {
      errors.push('CPF vazio')
    } else if (!isValidCpf(normalizedCpf)) {
      errors.push('CPF inválido')
    }

    // Nome
    const empName = String(getCol(rowNormalized, ['NOME_FUNCIONARIO', 'NOME', 'FUNCIONARIO', 'COLABORADOR'])).trim()

    // 2. Datas e Afastamento
    const rawCertDate = getCol(rowNormalized, ['DATA_ATESTADO', 'DATA', 'DATA_DO_ATESTADO', 'EMISSAO', 'DATA_EMISSAO'])
    const rawStartDate = getCol(rowNormalized, ['DATA_INICIO', 'INICIO', 'DATA_INICIAL', 'DATA_DE_INICIO'])
    const rawEndDate = getCol(rowNormalized, ['DATA_FIM', 'FIM', 'DATA_FINAL', 'DATA_DE_TERMINO', 'TERMINO'])
    const rawDays = getCol(rowNormalized, ['DIAS_AFASTAMENTO', 'DIAS', 'QTD_DIAS', 'QUANTIDADE_DIAS', 'DIAS_DE_AFASTAMENTO', 'DURACAO'])

    let certDate = parseDateFlexible(rawCertDate)
    let startDate = parseDateFlexible(rawStartDate)
    let endDate = parseDateFlexible(rawEndDate)
    let daysOff = parseInt(String(rawDays)) || 0

    // Sincronização inteligente de datas
    if (!startDate && certDate) startDate = certDate
    if (!certDate && startDate) certDate = startDate

    if (startDate && daysOff > 0 && !endDate) {
      endDate = addDaysToDate(startDate, daysOff - 1)
    } else if (startDate && endDate && daysOff <= 0) {
      daysOff = Math.max(1, daysBetween(startDate, endDate))
    } else if (!endDate && !daysOff) {
      daysOff = 1
      if (startDate) endDate = startDate
    }

    if (!certDate) errors.push('Data do atestado inválida ou não informada')
    if (!startDate) errors.push('Data inicial inválida')
    if (!endDate) errors.push('Data final inválida')
    if (daysOff <= 0) daysOff = 1

    // 3. CID
    const cidCode = String(getCol(rowNormalized, ['CID', 'CID10', 'CODIGO_CID', 'CID_10'])).toUpperCase().trim()
    const cidDesc = String(getCol(rowNormalized, ['DESCRICAO_CID', 'DESCRICAO', 'DIAGNOSTICO', 'CID_DESCRICAO'])).trim()

    // 4. Médico e CRM
    const doctor = String(getCol(rowNormalized, ['MEDICO', 'MÉDICO', 'NOME_MEDICO', 'DOUTOR'])).trim()
    const crm = String(getCol(rowNormalized, ['CRM', 'CRM_MEDICO', 'REGISTRO_MEDICO'])).trim()
    const observations = String(getCol(rowNormalized, ['OBSERVACOES', 'OBSERVACAO', 'OBSERVAÇÃO', 'OBS'])).trim()

    rows.push({
      index: i + 1,
      cpf: rawCpf,
      normalizedCpf,
      employeeName: empName || undefined,
      certificateDate: certDate || '',
      startDate: startDate || '',
      endDate: endDate || '',
      daysOff,
      cidCode,
      cidDescription: cidDesc,
      doctor,
      crm,
      observations,
      status: errors.length > 0 ? 'ERRO' : 'OK',
      errors,
    })
  }

  // Busca em lote no banco de dados para vincular colaboradores e CIDs
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

  for (const row of rows) {
    if (row.status === 'ERRO') continue

    const emp = empMap.get(row.normalizedCpf)
    if (!emp) {
      if (row.employeeName) {
        // Colaborador tem nome na planilha: podemos cadastrá-lo automaticamente no momento da importação!
        row.autoCreateEmployee = true
        row.status = 'AVISO'
        row.errors.push(`Novo funcionário: ${row.employeeName} será cadastrado automaticamente`)
      } else {
        row.status = 'ERRO'
        row.errors.push(`Funcionário não cadastrado (CPF ${row.cpf})`)
      }
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
        // CID informado não está no catálogo, mas não impede a importação
        if (row.status === 'OK') row.status = 'AVISO'
        row.errors.push(`CID ${row.cidCode} não cadastrado no catálogo (será importado como texto)`)
      }
    }
  }

  const totalOk = rows.filter(r => r.status === 'OK').length
  const totalWarnings = rows.filter(r => r.status === 'AVISO').length
  const totalErrors = rows.filter(r => r.status === 'ERRO').length

  return NextResponse.json({
    total: rows.length,
    ok: totalOk,
    warnings: totalWarnings,
    errors: totalErrors,
    rows,
    filename: file.name,
  })
}
