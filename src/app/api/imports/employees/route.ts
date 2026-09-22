// src/app/api/imports/employees/route.ts
// Importação em massa de funcionários
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { normalizeCpf, isValidCpf } from '@/lib/utils'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'employees:import')) return apiError('Sem permissão', 403)

  const formData = await req.formData()
  const file = formData.get('file') as File
  const action = (formData.get('action') as string) || 'preview' // preview | import

  if (!file) return apiError('Nenhum arquivo enviado')

  const buffer = Buffer.from(await file.arrayBuffer())
  let workbook: XLSX.WorkBook
  try {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  } catch {
    return apiError('Arquivo inválido. Use .xlsx, .xls ou .csv')
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  const normalizeKey = (k: string) => k.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')

  const rows = rawData.map((rawRow, i) => {
    const row: Record<string, string> = {}
    for (const [k, v] of Object.entries(rawRow)) row[normalizeKey(k)] = String(v ?? '').trim()

    const cpf = row['CPF'] || ''
    const normalizedCpf = normalizeCpf(cpf)
    const errors: string[] = []

    if (!cpf) errors.push('CPF vazio')
    else if (!isValidCpf(normalizedCpf)) errors.push('CPF inválido')
    if (!row['NOME'] && !row['NAME']) errors.push('Nome vazio')

    return {
      index: i + 1,
      matricula: row['MATRICULA'] || '',
      name: row['NOME'] || row['NAME'] || '',
      cpf,
      normalizedCpf,
      cargo: row['CARGO'] || '',
      department: row['SETOR'] || row['DEPARTAMENTO'] || '',
      admissionDate: row['DATA_ADMISSAO'] || row['ADMISSAO'] || '',
      status: (row['STATUS'] || 'ATIVO') as 'ATIVO' | 'INATIVO',
      errors,
      importStatus: errors.length > 0 ? 'ERRO' : 'OK',
    }
  })

  if (action === 'preview') {
    // Verifica existência de CPFs
    const validCpfs = rows.filter(r => r.importStatus === 'OK').map(r => r.normalizedCpf)
    const existing = await prisma.employee.findMany({
      where: { cpf: { in: validCpfs }, deletedAt: null },
      select: { cpf: true, name: true },
    })
    const existingMap = new Map(existing.map(e => [e.cpf, e.name]))

    // Busca setores
    const allDepts = await prisma.department.findMany({ select: { name: true, code: true, id: true } })

    const preview = rows.map(r => {
      const alreadyExists = existingMap.has(r.normalizedCpf)
      const dept = allDepts.find(d =>
        d.name.toLowerCase() === r.department.toLowerCase() ||
        d.code.toLowerCase() === r.department.toLowerCase()
      )
      return {
        ...r,
        alreadyExists,
        existingName: alreadyExists ? existingMap.get(r.normalizedCpf) : null,
        departmentId: dept?.id || null,
        departmentFound: !!dept,
      }
    })

    return NextResponse.json({ total: rows.length, preview })
  }

  // Importa
  const body = await req.json().catch(() => ({})) as {
    rows: Array<{
      normalizedCpf: string
      name: string
      matricula: string
      cargo: string
      departmentId: string
      admissionDate: string
      status: string
      overwrite: boolean
    }>
  }

  let imported = 0, updated = 0, errors = 0

  for (const r of body.rows || []) {
    try {
      const existing = await prisma.employee.findFirst({ where: { cpf: r.normalizedCpf, deletedAt: null } })
      if (existing) {
        if (r.overwrite) {
          await prisma.employee.update({ where: { id: existing.id }, data: { name: r.name, cargo: r.cargo, departmentId: r.departmentId, status: r.status as 'ATIVO' | 'INATIVO' } })
          updated++
        }
      } else {
        await prisma.employee.create({
          data: {
            cpf: r.normalizedCpf,
            name: r.name,
            matricula: r.matricula || null,
            cargo: r.cargo || null,
            departmentId: r.departmentId,
            admissionDate: r.admissionDate ? new Date(r.admissionDate) : null,
            status: r.status as 'ATIVO' | 'INATIVO',
          },
        })
        imported++
      }
    } catch (err) {
      console.error('Erro ao importar funcionário:', err)
      errors++
    }
  }

  await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.FUNCIONARIOS_IMPORTADOS, resource: 'employees', details: { imported, updated, errors } })

  return NextResponse.json({ imported, updated, errors })
}
