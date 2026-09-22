// src/app/api/rankings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'rankings:view')) return apiError('Sem permissão', 403)

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'cid' // cid | departments | employees
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
  const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : new Date(year, 0, 1)
  const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : new Date(year, 11, 31)
  const departmentId = searchParams.get('departmentId') || ''

  const baseFilter = {
    status: 'ATIVO' as const,
    certificateDate: { gte: dateFrom, lte: dateTo },
    ...(departmentId && { employee: { departmentId } }),
  }

  if (type === 'cid') {
    const grouped = await prisma.medicalCertificate.groupBy({
      by: ['cidId'],
      where: { ...baseFilter, cidId: { not: null } },
      _count: { _all: true },
      _sum: { daysOff: true },
      orderBy: { _count: { cidId: 'desc' } },
      take: 20,
    })

    const result = await Promise.all(
      grouped.map(async (g, i) => {
        const cid = g.cidId ? await prisma.cidCode.findUnique({ where: { id: g.cidId }, select: { code: true, description: true } }) : null
        return {
          position: i + 1,
          cidCode: cid?.code || '—',
          description: cid?.description || '—',
          count: g._count._all,
          daysOff: g._sum.daysOff || 0,
        }
      })
    )

    return NextResponse.json({ ranking: result, type })
  }

  if (type === 'departments') {
    const departments = await prisma.department.findMany({
      where: { status: 'ATIVO' },
      select: { id: true, name: true },
    })

    const result = await Promise.all(
      departments.map(async (d) => {
        const filter = { ...baseFilter, employee: { departmentId: d.id } }
        const [agg, empCount] = await Promise.all([
          prisma.medicalCertificate.aggregate({ where: filter, _count: true, _sum: { daysOff: true } }),
          prisma.employee.count({ where: { departmentId: d.id, deletedAt: null, status: 'ATIVO' } }),
        ])
        return {
          department: d.name,
          employeeCount: empCount,
          count: agg._count,
          daysOff: agg._sum.daysOff || 0,
          avgPerEmployee: empCount > 0 ? (agg._count / empCount).toFixed(2) : '0',
        }
      })
    )

    const sorted = result.sort((a, b) => b.count - a.count).map((r, i) => ({ ...r, position: i + 1 }))
    return NextResponse.json({ ranking: sorted, type })
  }

  if (type === 'employees') {
    const grouped = await prisma.medicalCertificate.groupBy({
      by: ['employeeId'],
      where: baseFilter,
      _count: { _all: true },
      _sum: { daysOff: true },
      orderBy: { _count: { employeeId: 'desc' } },
      take: 30,
    })

    const result = await Promise.all(
      grouped.map(async (g, i) => {
        const emp = await prisma.employee.findUnique({
          where: { id: g.employeeId },
          include: { department: { select: { name: true } } },
        })
        return {
          position: i + 1,
          employee: emp?.name || '—',
          department: emp?.department?.name || '—',
          count: g._count._all,
          daysOff: g._sum.daysOff || 0,
        }
      })
    )

    return NextResponse.json({ ranking: result, type })
  }

  return apiError('Tipo de ranking inválido')
}
