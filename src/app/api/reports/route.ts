// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import ExcelJS from 'exceljs'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { formatDate, formatCpf } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'reports:view')) return apiError('Sem permissão', 403)

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'geral'
  const format = searchParams.get('format') || 'json'
  const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : new Date(new Date().getFullYear(), 0, 1)
  const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : new Date()
  const departmentId = searchParams.get('departmentId') || ''
  const employeeId = searchParams.get('employeeId') || ''

  const baseFilter = {
    status: 'ATIVO' as const,
    certificateDate: { gte: dateFrom, lte: dateTo },
    ...(departmentId && { employee: { departmentId } }),
    ...(employeeId && { employeeId }),
  }

  const certificates = await prisma.medicalCertificate.findMany({
    where: baseFilter,
    include: {
      employee: { include: { department: { select: { name: true } } } },
      cid: { select: { code: true, description: true } },
    },
    orderBy: { certificateDate: 'asc' },
  })

  if (format === 'json') {
    return NextResponse.json({ certificates, total: certificates.length })
  }

  // Excel export
  if (format === 'xlsx') {
    if (!can(user.role, 'reports:export')) return apiError('Sem permissão para exportar', 403)

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Atestados')

    sheet.columns = [
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Funcionário', key: 'employee', width: 30 },
      { header: 'CPF', key: 'cpf', width: 16 },
      { header: 'Setor', key: 'department', width: 20 },
      { header: 'CID', key: 'cid', width: 10 },
      { header: 'Descrição CID', key: 'cidDesc', width: 40 },
      { header: 'Início', key: 'startDate', width: 12 },
      { header: 'Fim', key: 'endDate', width: 12 },
      { header: 'Dias', key: 'days', width: 8 },
      { header: 'Médico', key: 'doctor', width: 25 },
      { header: 'CRM', key: 'crm', width: 12 },
    ]

    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } }
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    for (const cert of certificates) {
      sheet.addRow({
        date: formatDate(cert.certificateDate),
        employee: cert.employee.name,
        cpf: formatCpf(cert.employee.cpf),
        department: cert.employee.department.name,
        cid: cert.cid?.code || '',
        cidDesc: cert.cid?.description || cert.cidDescription || '',
        startDate: formatDate(cert.startDate),
        endDate: formatDate(cert.endDate),
        days: cert.daysOff,
        doctor: cert.doctor || '',
        crm: cert.crm || '',
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()

    await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.RELATORIO_EXPORTADO, resource: 'reports', details: { type, format, total: certificates.length } })

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="relatorio-atestados-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    })
  }

  // CSV
  if (format === 'csv') {
    if (!can(user.role, 'reports:export')) return apiError('Sem permissão para exportar', 403)

    const header = 'Data,Funcionário,CPF,Setor,CID,Descrição CID,Início,Fim,Dias,Médico,CRM\n'
    const rows = certificates.map(cert => [
      formatDate(cert.certificateDate),
      `"${cert.employee.name}"`,
      formatCpf(cert.employee.cpf),
      `"${cert.employee.department.name}"`,
      cert.cid?.code || '',
      `"${cert.cid?.description || cert.cidDescription || ''}"`,
      formatDate(cert.startDate),
      formatDate(cert.endDate),
      cert.daysOff,
      `"${cert.doctor || ''}"`,
      cert.crm || '',
    ].join(','))

    const csv = header + rows.join('\n')

    await createAuditLog({ userId: user.id, userName: user.name, action: AUDIT_ACTIONS.RELATORIO_EXPORTADO, resource: 'reports', details: { type, format, total: certificates.length } })

    return new NextResponse('\uFEFF' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="relatorio-atestados-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  }

  return apiError('Formato inválido')
}
