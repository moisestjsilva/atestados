// src/app/(dashboard)/rankings/page.tsx
'use client'
import { FilterCard } from '@/components/ui/filter-card'

import { useState, useEffect, useCallback } from 'react'
import { Trophy, Medal, Loader2, Filter, X } from 'lucide-react'
import { MONTHS } from '@/lib/utils'

type RankingType = 'cid' | 'departments' | 'employees'

interface CidRanking { position: number; cidCode: string; description: string; count: number; daysOff: number }
interface DeptRanking { position: number; department: string; employeeCount: number; count: number; daysOff: number; avgPerEmployee: string }
interface EmpRanking { position: number; employee: string; department: string; count: number; daysOff: number }

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

export default function RankingsPage() {
  const [type, setType] = useState<RankingType>('cid')
  const [ranking, setRanking] = useState<(CidRanking | DeptRanking | EmpRanking)[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [filterDept, setFilterDept] = useState('')

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    fetch('/api/departments?all=true').then(r => r.json()).then(d => setDepartments(d.departments || []))
  }, [])

  const fetchRanking = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ type, year: String(year), ...(filterDept && { departmentId: filterDept }) })
    const res = await fetch(`/api/rankings?${params}`)
    const data = await res.json()
    setRanking(data.ranking || [])
    setLoading(false)
  }, [type, year, filterDept])

  useEffect(() => { fetchRanking() }, [fetchRanking])

  const renderMedal = (pos: number) => {
    if (pos <= 3) return <Medal size={18} style={{ color: MEDAL_COLORS[pos - 1] }} />
    return <span style={{ width: 18, textAlign: 'center', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{pos}</span>
  }

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rankings</h1>
          <p className="page-subtitle">Estatísticas comparativas — apenas informativo, sem julgamento qualitativo</p>
        </div>
      </div>

      {/* Tipo de ranking */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'cid', label: '🏥 Por CID' },
          { key: 'departments', label: '🏢 Por Setor' },
          { key: 'employees', label: '👤 Por Funcionário' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setType(t.key as RankingType)}
            className={`btn ${type === t.key ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <FilterCard
        activeCount={filterDept ? 1 : 0}
        onClear={() => setFilterDept('')}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">Ano</label>
            <select className="form-input" value={year} onChange={e => setYear(parseInt(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {type === 'employees' && (
            <div className="form-group">
              <label className="form-label">Setor</label>
              <select className="form-input" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                <option value="">Todos</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}
        </div>
      </FilterCard>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={28} className="animate-spin" /></div>
        ) : ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
            <Trophy size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p>Nenhum dado encontrado para o período selecionado</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              {/* CID */}
              {type === 'cid' && (
                <>
                  <thead><tr><th>Pos.</th><th>CID</th><th>Descrição</th><th style={{ textAlign: 'center' }}>Atestados</th><th style={{ textAlign: 'center' }}>Dias afastados</th></tr></thead>
                  <tbody>
                    {(ranking as CidRanking[]).map(r => (
                      <tr key={r.position}>
                        <td style={{ width: 60 }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{renderMedal(r.position)}</div></td>
                        <td><span className="badge badge-info">{r.cidCode}</span></td>
                        <td style={{ fontSize: '0.875rem' }}>{r.description}</td>
                        <td style={{ textAlign: 'center' }}><span className="badge badge-warning">{r.count}</span></td>
                        <td style={{ textAlign: 'center' }}><span className="badge badge-gray">{r.daysOff}d</span></td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* Departments */}
              {type === 'departments' && (
                <>
                  <thead><tr><th>Pos.</th><th>Setor</th><th style={{ textAlign: 'center' }}>Funcionários</th><th style={{ textAlign: 'center' }}>Atestados</th><th style={{ textAlign: 'center' }}>Dias afastados</th><th style={{ textAlign: 'center' }}>Média/funcionário</th></tr></thead>
                  <tbody>
                    {(ranking as DeptRanking[]).filter(r => r.count > 0).map(r => (
                      <tr key={r.position}>
                        <td style={{ width: 60 }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{renderMedal(r.position)}</div></td>
                        <td style={{ fontWeight: 500 }}>{r.department}</td>
                        <td style={{ textAlign: 'center' }}>{r.employeeCount}</td>
                        <td style={{ textAlign: 'center' }}><span className="badge badge-warning">{r.count}</span></td>
                        <td style={{ textAlign: 'center' }}>{r.daysOff}d</td>
                        <td style={{ textAlign: 'center' }}><span className="badge badge-info">{r.avgPerEmployee}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {/* Employees */}
              {type === 'employees' && (
                <>
                  <thead>
                    <tr>
                      <th>Pos.</th>
                      <th>Funcionário</th>
                      <th>Setor</th>
                      <th style={{ textAlign: 'center' }}>Atestados</th>
                      <th style={{ textAlign: 'center' }}>Dias afastados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ranking as EmpRanking[]).map(r => (
                      <tr key={r.position}>
                        <td style={{ width: 60 }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{renderMedal(r.position)}</div></td>
                        <td style={{ fontWeight: 500 }}>{r.employee}</td>
                        <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{r.department}</span></td>
                        <td style={{ textAlign: 'center' }}><span className="badge badge-warning">{r.count}</span></td>
                        <td style={{ textAlign: 'center' }}>{r.daysOff}d</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        )}
      </div>

      {type === 'employees' && (
        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
          ℹ️ O ranking de funcionários é exclusivamente estatístico e não representa qualquer julgamento ou avaliação qualitativa sobre os funcionários listados.
        </div>
      )}
    </div>
  )
}
