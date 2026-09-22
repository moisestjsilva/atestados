// src/app/(dashboard)/relatorios/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { can } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { BarChart3, Download, FileSpreadsheet, Filter, X, Loader2 } from 'lucide-react'
import { MONTHS } from '@/lib/utils'

export default function RelatoriosPage() {
  const { data: session } = useSession()
  const role = (session?.user?.role || 'CONSULTOR') as UserRole
  const canExport = can(role, 'reports:export')

  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', departmentId: '', format: 'json' })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<{ total: number } | null>(null)

  useEffect(() => {
    fetch('/api/departments?all=true').then(r => r.json()).then(d => setDepartments(d.departments || []))
    // Set default period to current year
    const now = new Date()
    setFilters(f => ({
      ...f,
      dateFrom: `${now.getFullYear()}-01-01`,
      dateTo: `${now.getFullYear()}-12-31`,
    }))
  }, [])

  async function loadStats() {
    setLoading(true)
    const params = new URLSearchParams({ format: 'json', ...Object.fromEntries(Object.entries(filters).filter(([k, v]) => v && k !== 'format')) })
    const res = await fetch(`/api/reports?${params}`)
    const json = await res.json()
    setStats({ total: json.total })
    setLoading(false)
  }

  async function exportReport(format: 'xlsx' | 'csv') {
    setLoading(true)
    const params = new URLSearchParams({ format, ...Object.fromEntries(Object.entries(filters).filter(([k, v]) => v && k !== 'format')) })
    const res = await fetch(`/api/reports?${params}`)
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-atestados.${format}`
      a.click()
      URL.revokeObjectURL(url)
    }
    setLoading(false)
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Exporte relatórios de atestados em diferentes formatos</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Filters panel */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Filter size={16} style={{ color: 'hsl(var(--primary))' }} />
            <span style={{ fontWeight: 600 }}>Filtros</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">Data inicial</label>
              <input type="date" className="form-input" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Data final</label>
              <input type="date" className="form-input" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Setor</label>
              <select className="form-input" value={filters.departmentId} onChange={e => setFilters(f => ({ ...f, departmentId: e.target.value }))}>
                <option value="">Todos os setores</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <button onClick={loadStats} disabled={loading} className="btn btn-primary">
              {loading ? <><Loader2 size={14} className="animate-spin" />Carregando...</> : <><Filter size={14} />Aplicar filtros</>}
            </button>
            <button onClick={() => setFilters({ dateFrom: `${new Date().getFullYear()}-01-01`, dateTo: `${new Date().getFullYear()}-12-31`, departmentId: '', format: 'json' })} className="btn btn-ghost btn-sm">
              <X size={14} />Limpar filtros
            </button>
          </div>
        </div>

        {/* Report area */}
        <div>
          {stats && (
            <div className="stat-card" style={{ marginBottom: '1.5rem' }}>
              <div className="stat-value">{stats.total.toLocaleString()}</div>
              <div className="stat-label">Atestados encontrados com os filtros aplicados</div>
            </div>
          )}

          {/* Export options */}
          {canExport && (
            <div className="card">
              <h2 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Exportar Relatório</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => exportReport('xlsx')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: 'hsl(142 71% 45% / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileSpreadsheet size={24} style={{ color: 'hsl(142 71% 45%)' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Excel (XLSX)</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Planilha formatada</div>
                    </div>
                    <Download size={16} style={{ marginLeft: 'auto', color: 'hsl(var(--muted-foreground))' }} />
                  </div>
                </div>

                <div className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => exportReport('csv')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: 'hsl(var(--primary) / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BarChart3 size={24} style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>CSV</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Dados separados por vírgula</div>
                    </div>
                    <Download size={16} style={{ marginLeft: 'auto', color: 'hsl(var(--muted-foreground))' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!canExport && (
            <div className="alert alert-warning">
              ℹ️ Seu perfil permite visualizar relatórios mas não exportá-los. Entre em contato com um administrador para solicitar permissão de exportação.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
