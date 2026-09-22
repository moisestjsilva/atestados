// src/app/(dashboard)/logs/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { formatDateTime } from '@/lib/utils'
import { ScrollText, Search, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { redirect } from 'next/navigation'

interface AuditLog {
  id: string
  userName: string | null
  action: string
  resource: string
  resourceId: string | null
  ipAddress: string | null
  createdAt: string
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'badge-info',
  LOGOUT: 'badge-gray',
  USUARIO_APROVADO: 'badge-success',
  USUARIO_BLOQUEADO: 'badge-danger',
  FUNCIONARIO_CRIADO: 'badge-success',
  FUNCIONARIO_EDITADO: 'badge-warning',
  FUNCIONARIO_EXCLUIDO: 'badge-danger',
  ATESTADO_CRIADO: 'badge-success',
  ATESTADO_EDITADO: 'badge-warning',
  ATESTADO_EXCLUIDO: 'badge-danger',
  ATESTADOS_IMPORTADOS: 'badge-info',
  RELATORIO_EXPORTADO: 'badge-info',
  DOCUMENTO_BAIXADO: 'badge-gray',
}

export default function LogsPage() {
  const { data: session } = useSession()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="page-content">
        <div className="alert alert-danger">❌ Acesso restrito ao Super Admin</div>
      </div>
    )
  }

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '50', search, ...(action && { action }), ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }) })
    const res = await fetch(`/api/audit?${params}`)
    const json = await res.json()
    setLogs(json.logs || [])
    setTotal(json.total || 0)
    setPages(json.pages || 1)
    setLoading(false)
  }, [page, search, action, dateFrom, dateTo])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Log de Auditoria</h1>
          <p className="page-subtitle">{total.toLocaleString()} registro(s) de atividade</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: '1 1 200px' }}>
          <label className="form-label">Buscar</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
            <input type="text" placeholder="Usuário, ação, recurso..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: '2.25rem' }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">De</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Até</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-input" />
        </div>
        {(search || action || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(''); setAction(''); setDateFrom(''); setDateTo('') }} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }}>
            <X size={14} />Limpar
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={28} className="animate-spin" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Data/Hora</th><th>Usuário</th><th>Ação</th><th>Recurso</th><th>ID</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))' }}>
                    <ScrollText size={32} style={{ opacity: 0.3, margin: '0 auto 0.75rem', display: 'block' }} />
                    Nenhum log encontrado
                  </td></tr>
                ) : logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', color: 'hsl(var(--muted-foreground))' }}>{formatDateTime(log.createdAt)}</td>
                    <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{log.userName || '—'}</td>
                    <td><span className={`badge ${ACTION_COLORS[log.action] || 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>{log.action}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{log.resource}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>{log.resourceId?.slice(-8) || '—'}</td>
                    <td style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{log.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="pagination" style={{ marginTop: '1rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm"><ChevronLeft size={16} /></button>
            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Página {page} de {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn btn-ghost btn-sm"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  )
}
