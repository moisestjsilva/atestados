// src/app/(dashboard)/dashboard/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Users, FileText, Calendar, Clock, TrendingUp,
  Building2, Stethoscope, Filter, X, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts'
import { MONTHS } from '@/lib/utils'

interface DashboardData {
  cards: {
    totalEmployees: number
    totalCertificates: number
    totalDaysOff: number
    monthCertificates: number
    employeesWithCertificate: number
    topDepartment: string
    topCid: string
  }
  monthly: Array<{ month: number; count: number; daysOff: number }>
  byDepartment: Array<{ department: string; count: number; daysOff: number }>
  topCids: Array<{ code: string; description: string; count: number; daysOff: number }>
}

interface Filters {
  year: number
  month: string
  departmentId: string
  dateFrom: string
  dateTo: string
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899']

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card" style={{ padding: '0.75rem', minWidth: 150 }}>
        <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: '0.8rem' }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [filters, setFilters] = useState<Filters>({
    year: new Date().getFullYear(),
    month: '',
    departmentId: '',
    dateFrom: '',
    dateTo: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('year', String(filters.year))
    if (filters.month) params.set('month', filters.month)
    if (filters.departmentId) params.set('departmentId', filters.departmentId)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)

    const res = await fetch(`/api/dashboard?${params}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    fetch('/api/departments?all=true').then(r => r.json()).then(d => setDepartments(d.departments || []))
  }, [])

  function clearFilters() {
    setFilters({ year: new Date().getFullYear(), month: '', departmentId: '', dateFrom: '', dateTo: '' })
  }

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="page-content animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral dos atestados médicos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Filter size={16} style={{ color: 'hsl(var(--primary))' }} />
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Filtros</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">Ano</label>
            <select className="form-input" value={filters.year} onChange={e => setFilters(f => ({ ...f, year: parseInt(e.target.value) }))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Mês</label>
            <select className="form-input" value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))}>
              <option value="">Todos</option>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Setor</label>
            <select className="form-input" value={filters.departmentId} onChange={e => setFilters(f => ({ ...f, departmentId: e.target.value }))}>
              <option value="">Todos</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Data inicial</label>
            <input type="date" className="form-input" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Data final</label>
            <input type="date" className="form-input" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
          </div>
          <button onClick={clearFilters} className="btn btn-secondary" style={{ alignSelf: 'flex-end' }}>
            <X size={14} />Limpar filtros
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'hsl(var(--muted-foreground))' }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'hsl(217 91% 60% / 0.15)' }}>
                <Users size={22} style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <div className="stat-value">{data.cards.totalEmployees.toLocaleString()}</div>
              <div className="stat-label">Funcionários ativos</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'hsl(142 71% 45% / 0.15)' }}>
                <FileText size={22} style={{ color: 'hsl(142 71% 45%)' }} />
              </div>
              <div className="stat-value">{data.cards.totalCertificates.toLocaleString()}</div>
              <div className="stat-label">Total de atestados</div>
              <div className="stat-sub">🗓️ {data.cards.monthCertificates} no mês atual</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'hsl(38 92% 50% / 0.15)' }}>
                <Clock size={22} style={{ color: 'hsl(38 92% 50%)' }} />
              </div>
              <div className="stat-value">{data.cards.totalDaysOff.toLocaleString()}</div>
              <div className="stat-label">Dias de afastamento</div>
              <div className="stat-sub">👤 {data.cards.employeesWithCertificate} funcionários</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'hsl(260 91% 60% / 0.15)' }}>
                <TrendingUp size={22} style={{ color: '#8b5cf6' }} />
              </div>
              <div className="stat-value" style={{ fontSize: '1.1rem' }}>{data.cards.topDepartment}</div>
              <div className="stat-label">Setor com mais atestados</div>
              <div className="stat-sub">🏥 CID: {data.cards.topCid}</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-grid" style={{ marginBottom: '1.5rem' }}>
            {/* Monthly Chart */}
            <div className="card">
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontWeight: 600, fontSize: '1rem' }}>Atestados por Mês — {filters.year}</h2>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Quantidade e dias de afastamento</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.monthly.map(m => ({ ...m, name: MONTHS[m.month - 1].slice(0, 3) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" name="Atestados" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="daysOff" name="Dias afastados" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* By Department */}
            <div className="card">
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontWeight: 600, fontSize: '1rem' }}>Atestados por Setor</h2>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Quantidade de atestados por setor</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.byDepartment} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="department" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" name="Atestados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top CIDs */}
          {data.topCids.length > 0 && (
            <div className="card">
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontWeight: 600, fontSize: '1rem' }}>CIDs Mais Frequentes</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {data.topCids.map((cid, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${COLORS[i] || '#gray'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: COLORS[i] || 'hsl(var(--muted-foreground))', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ minWidth: 60, flexShrink: 0 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: COLORS[i] || 'hsl(var(--foreground))' }}>{cid.code}</span>
                    </div>
                    <div style={{ flex: '1 1 120px', fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                      {cid.description}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, marginLeft: 'auto' }}>
                      <span className="badge badge-info">{cid.count} atestados</span>
                      <span className="badge badge-warning">{cid.daysOff} d</span>
                    </div>
                    <div className="cid-progress-bar" style={{ width: 80, background: 'hsl(var(--secondary))', borderRadius: 4, height: 6, flexShrink: 0 }}>
                      <div style={{ width: `${(cid.count / (data.topCids[0]?.count || 1)) * 100}%`, background: COLORS[i] || 'hsl(var(--primary))', height: '100%', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
