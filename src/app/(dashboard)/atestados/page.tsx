// src/app/(dashboard)/atestados/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { can } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { formatCpf, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import { Plus, Search, Filter, X, Eye, Edit, Trash2, Loader2, FileText, ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import Link from 'next/link'

interface Certificate {
  id: string
  certificateDate: string
  startDate: string
  endDate: string
  daysOff: number
  doctor: string | null
  status: string
  employee: { id: string; name: string; cpf: string; department: { name: string } }
  cid: { code: string; description: string } | null
  files: { id: string; originalName: string; mimeType: string }[]
}

interface Employee { id: string; name: string; cpf: string; department: { name: string } }
interface Department { id: string; name: string }
interface Cid { id: string; code: string; description: string }

export default function AtestadosPage() {
  const { data: session } = useSession()
  const role = (session?.user?.role || 'CONSULTOR') as UserRole
  const canCreate = can(role, 'certificates:create')
  const canEdit = can(role, 'certificates:edit')
  const canDelete = can(role, 'certificates:delete')
  const canImport = can(role, 'certificates:import')

  const [certs, setCerts] = useState<Certificate[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [cids, setCids] = useState<Cid[]>([])

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [cidSearch, setCidSearch] = useState('')

  const [form, setForm] = useState({
    employeeId: '', cidId: '', cidDescription: '', doctor: '', crm: '',
    certificateDate: '', startDate: '', endDate: '', daysOff: 1, observations: '',
  })

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [empSearch, setEmpSearch] = useState('')
  const [filteredEmps, setFilteredEmps] = useState<Employee[]>([])

  useEffect(() => {
    fetch('/api/departments?all=true').then(r => r.json()).then(d => setDepartments(d.departments || []))
    fetch('/api/employees?all=true').then(r => r.json()).then(d => setEmployees(d.employees || []))
  }, [])

  // Autocomplete funcionário
  useEffect(() => {
    if (empSearch.length >= 2) {
      setFilteredEmps(employees.filter(e =>
        e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
        e.cpf.includes(empSearch.replace(/\D/g, ''))
      ).slice(0, 10))
    } else {
      setFilteredEmps([])
    }
  }, [empSearch, employees])

  // Autocomplete CID
  useEffect(() => {
    if (cidSearch.length >= 2) {
      fetch(`/api/cid?all=true&search=${encodeURIComponent(cidSearch)}`).then(r => r.json()).then(d => setCids(d.cids || []))
    }
  }, [cidSearch])

  // Cálculo automático de dias
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate)
      const end = new Date(form.endDate)
      if (end >= start) {
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        setForm(f => ({ ...f, daysOff: diff }))
      }
    }
  }, [form.startDate, form.endDate])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page), limit: '20',
      ...(filterDept && { departmentId: filterDept }),
      ...(filterFrom && { dateFrom: filterFrom }),
      ...(filterTo && { dateTo: filterTo }),
      ...(search && { cpf: search }),
    })
    const res = await fetch(`/api/certificates?${params}`)
    const json = await res.json()
    setCerts(json.certificates || [])
    setTotal(json.total || 0)
    setPages(json.pages || 1)
    setLoading(false)
  }, [page, filterDept, filterFrom, filterTo, search])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, filterDept, filterFrom, filterTo])

  function selectEmployee(emp: Employee) {
    setSelectedEmployee(emp)
    setForm(f => ({ ...f, employeeId: emp.id }))
    setEmpSearch(emp.name)
    setFilteredEmps([])
  }

  function selectCid(cid: Cid) {
    setForm(f => ({ ...f, cidId: cid.id, cidDescription: cid.description }))
    setCidSearch(`${cid.code} - ${cid.description}`)
    setCids([])
  }

  async function handleSave() {
    if (!form.employeeId || !form.certificateDate) { toast('Selecione o funcionário e a data', 'error'); return }
    setSaving(true)
    const res = await fetch(editId ? `/api/certificates/${editId}` : '/api/certificates', {
      method: editId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      toast(editId ? 'Atestado atualizado!' : 'Atestado cadastrado!', 'success')
      setShowModal(false)
      setEditId(null)
      fetchData()
    } else {
      const data = await res.json()
      toast(data.error || 'Erro ao salvar', 'error')
    }
  }

  async function handleDelete(cert: Certificate) {
    setDeleting(true)
    const res = await fetch(`/api/certificates/${cert.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) {
      toast('Atestado excluído', 'success')
      setDeleteTarget(null)
      fetchData()
    } else {
      const data = await res.json()
      toast(data.error || 'Erro ao excluir', 'error')
    }
  }

  function openNew() {
    setEditId(null)
    setSelectedEmployee(null)
    setEmpSearch('')
    setCidSearch('')
    setForm({ employeeId: '', cidId: '', cidDescription: '', doctor: '', crm: '', certificateDate: '', startDate: '', endDate: '', daysOff: 1, observations: '' })
    setShowModal(true)
  }

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Atestados</h1>
          <p className="page-subtitle">{total.toLocaleString()} atestado(s) registrado(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canImport && <Link href="/importacao" className="btn btn-secondary"><Upload size={16} />Importação em Massa</Link>}
          {canCreate && <button id="btn-novo-atestado" onClick={openNew} className="btn btn-primary"><Plus size={16} />+ Novo Atestado</button>}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: '1 1 160px' }}>
          <label className="form-label">CPF do funcionário</label>
          <input type="text" placeholder="000.000.000-00" value={search} onChange={e => setSearch(e.target.value)} className="form-input" />
        </div>
        <div className="form-group" style={{ minWidth: 140 }}>
          <label className="form-label">Setor</label>
          <select className="form-input" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">Todos</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">De</label>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Até</label>
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="form-input" />
        </div>
        {(search || filterDept || filterFrom || filterTo) && (
          <button onClick={() => { setSearch(''); setFilterDept(''); setFilterFrom(''); setFilterTo('') }} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }}>
            <X size={14} />Limpar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={28} className="animate-spin" /></div>
        ) : certs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>Nenhum atestado encontrado</p>
            {canCreate && <button onClick={openNew} className="btn btn-primary" style={{ marginTop: '1rem' }}><Plus size={16} />Cadastrar atestado</button>}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Funcionário</th>
                  <th>CPF</th>
                  <th>Setor</th>
                  <th>CID</th>
                  <th>Dias</th>
                  <th>Médico</th>
                  <th>Doc.</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {certs.map(cert => (
                  <tr key={cert.id}>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDate(cert.certificateDate)}</td>
                    <td style={{ fontWeight: 500 }}>{cert.employee.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{formatCpf(cert.employee.cpf)}</td>
                    <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{cert.employee.department.name}</span></td>
                    <td>{cert.cid ? <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{cert.cid.code}</span> : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{cert.daysOff}d</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{cert.doctor || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {cert.files.length > 0 ? (
                        <a href={`/api/files/${cert.files[0].id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon btn-sm" title="Visualizar documento">
                          <FileText size={15} style={{ color: 'hsl(142 71% 45%)' }} />
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <Link href={`/atestados/${cert.id}`} className="btn btn-ghost btn-icon btn-sm" title="Visualizar"><Eye size={15} /></Link>
                        {canEdit && <button onClick={() => {}} className="btn btn-ghost btn-icon btn-sm" title="Editar"><Edit size={15} /></button>}
                        {canDelete && <button onClick={() => setDeleteTarget(cert)} className="btn btn-ghost btn-icon btn-sm" title="Excluir" style={{ color: 'hsl(var(--destructive))' }}><Trash2 size={15} /></button>}
                      </div>
                    </td>
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

      {/* Modal Novo Atestado */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>+ Novo Atestado</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Funcionário autocomplete */}
                <div className="form-group" style={{ gridColumn: '1 / -1', position: 'relative' }}>
                  <label className="form-label">Funcionário *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={empSearch}
                      onChange={e => { setEmpSearch(e.target.value); setSelectedEmployee(null); setForm(f => ({ ...f, employeeId: '' })) }}
                      placeholder="Digite o nome ou CPF..."
                      className="form-input"
                    />
                    {selectedEmployee && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className="badge badge-info">{formatCpf(selectedEmployee.cpf)}</span>
                        <span className="badge badge-gray">{selectedEmployee.department.name}</span>
                      </div>
                    )}
                  </div>
                  {filteredEmps.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, zIndex: 10, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                      {filteredEmps.map(emp => (
                        <div key={emp.id} onClick={() => selectEmployee(emp)} style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: '1px solid hsl(var(--border) / 0.5)', fontSize: '0.875rem' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--secondary))'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <strong>{emp.name}</strong> — {formatCpf(emp.cpf)} — {emp.department.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Data do atestado *</label>
                  <input type="date" value={form.certificateDate} onChange={e => setForm(f => ({ ...f, certificateDate: e.target.value, startDate: e.target.value }))} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Data inicial</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Data final</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Dias de afastamento</label>
                  <input type="number" min="1" value={form.daysOff} onChange={e => setForm(f => ({ ...f, daysOff: parseInt(e.target.value) }))} className="form-input" />
                  <span className="form-hint">Calculado automaticamente</span>
                </div>

                {/* CID autocomplete */}
                <div className="form-group" style={{ gridColumn: '1 / -1', position: 'relative' }}>
                  <label className="form-label">CID</label>
                  <input
                    type="text"
                    value={cidSearch}
                    onChange={e => setCidSearch(e.target.value)}
                    placeholder="Pesquisar CID por código ou descrição..."
                    className="form-input"
                  />
                  {cids.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, zIndex: 10, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                      {cids.map(cid => (
                        <div key={cid.id} onClick={() => selectCid(cid)} style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: '1px solid hsl(var(--border) / 0.5)', fontSize: '0.875rem' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--secondary))'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <strong>{cid.code}</strong> — {cid.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Médico</label>
                  <input type="text" value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} className="form-input" placeholder="Nome do médico" />
                </div>
                <div className="form-group">
                  <label className="form-label">CRM</label>
                  <input type="text" value={form.crm} onChange={e => setForm(f => ({ ...f, crm: e.target.value }))} className="form-input" placeholder="CRM" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Observações</label>
                  <textarea value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} className="form-input" rows={3} placeholder="Observações opcionais" style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
              <button id="btn-salvar-atestado" onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : 'Salvar atestado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600, color: 'hsl(var(--destructive))' }}>⚠️ Excluir atestado</h3>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir o atestado de <strong>{deleteTarget.employee.name}</strong> de {formatDate(deleteTarget.certificateDate)}?</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={() => handleDelete(deleteTarget)} disabled={deleting} className="btn btn-danger">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
