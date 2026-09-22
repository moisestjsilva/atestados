// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:view')) return apiError('Sem permissão', 403)

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null
  const departmentId = searchParams.get('departmentId') || ''
  const employeeId = searchParams.get('employeeId') || ''
  const cidId = searchParams.get('cidId') || ''
  const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : null
  const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : null

  // Construção do filtro base
  const baseFilter: Record<string, unknown> = {
    status: 'ATIVO',
    ...(employeeId && { employeeId }),
    ...(cidId && { cidId }),
  }

  if (dateFrom && dateTo) {
    baseFilter.certificateDate = { gte: dateFrom, lte: dateTo }
  } else if (month) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)
    baseFilter.certificateDate = { gte: start, lte: end }
  } else {
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    baseFilter.certificateDate = { gte: start, lte: end }
  }

  if (departmentId) {
    baseFilter.employee = { departmentId }
  }

  // Cards principais
  const [
    totalEmployees,
    totalCertificates,
    certStats,
    monthCertificates,
  ] = await Promise.all([
    prisma.employee.count({ where: { deletedAt: null, status: 'ATIVO', ...(departmentId && { departmentId }) } }),
    prisma.medicalCertificate.count({ where: baseFilter }),
    prisma.medicalCertificate.aggregate({ where: baseFilter, _sum: { daysOff: true }, _count: true }),
    // Atestados do mês atual
    prisma.medicalCertificate.count({
      where: {
        status: 'ATIVO',
        certificateDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
        ...(departmentId && { employee: { departmentId } }),
      },
    }),
  ])

  // Funcionários com atestado no período
  const employeesWithCert = await prisma.medicalCertificate.groupBy({
    by: ['employeeId'],
    where: baseFilter,
    _count: true,
  })

  // Gráfico por mês
  const monthlyData = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const start = new Date(year, i, 1)
      const end = new Date(year, i + 1, 0)
      const filter = {
        ...baseFilter,
        certificateDate: { gte: start, lte: end },
      }
      const agg = await prisma.medicalCertificate.aggregate({
        where: filter,
        _count: true,
        _sum: { daysOff: true },
      })
      return { month: i + 1, count: agg._count, daysOff: agg._sum.daysOff || 0 }
    })
  )

  // Gráfico por setor
  const departments = await prisma.department.findMany({
    where: { status: 'ATIVO', ...(departmentId && { id: departmentId }) },
    select: { id: true, name: true },
  })

  const byDepartment = await Promise.all(
    departments.map(async (d) => {
      const filter = { ...baseFilter, employee: { departmentId: d.id } }
      const agg = await prisma.medicalCertificate.aggregate({ where: filter, _count: true, _sum: { daysOff: true } })
      return { department: d.name, departmentId: d.id, count: agg._count, daysOff: agg._sum.daysOff || 0 }
    })
  )

  // Top CID
  const topCids = await prisma.medicalCertificate.groupBy({
    by: ['cidId'],
    where: { ...baseFilter, cidId: { not: null } },
    _count: { _all: true },
    _sum: { daysOff: true },
    orderBy: { _count: { cidId: 'desc' } },
    take: 5,
  })

  const topCidsWithInfo = await Promise.all(
    topCids.map(async (tc) => {
      const cid = tc.cidId ? await prisma.cidCode.findUnique({ where: { id: tc.cidId }, select: { code: true, description: true } }) : null
      return { ...cid, count: tc._count._all, daysOff: tc._sum.daysOff || 0 }
    })
  )

  // Setor com mais atestados
  const topDept = byDepartment.sort((a, b) => b.count - a.count)[0]

  return NextResponse.json({
    cards: {
      totalEmployees,
      totalCertificates,
      totalDaysOff: certStats._sum.daysOff || 0,
      monthCertificates,
      employeesWithCertificate: employeesWithCert.length,
      topDepartment: topDept?.department || '—',
      topCid: topCidsWithInfo[0]?.code || '—',
    },
    monthly: monthlyData,
    byDepartment: byDepartment.filter(d => d.count > 0),
    topCids: topCidsWithInfo,
  })
}
