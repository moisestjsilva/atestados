// src/app/(dashboard)/atestados/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { can } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { formatCpf, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import {
  Plus, Search, Filter, X, Eye, Edit, Trash2, Loader2,
  FileText, ChevronLeft, ChevronRight, Upload, Paperclip,
  CheckCircle, User, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { ModalPortal } from '@/components/ui/modal-portal'

interface Certificate {
  id: string
  certificateDate: string
  startDate: string
  endDate: string
  daysOff: number
  doctor: string | null
  crm?: string | null
  cidDescription?: string | null
  observations?: string | null
  status: string
  employee: { id: string; name: string; cpf: string; department: { name: string } }
  cid: { id: string; code: string; description: string } | null
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
    employeeId: '',
    cidId: '',
    cidDescription: '',
    doctor: '',
    crm: '',
    certificateDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysOff: 1,
    observations: '',
  })

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [empSearch, setEmpSearch] = useState('')
  const [filteredEmps, setFilteredEmps] = useState<Employee[]>([])

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  function handleDateChange(field: 'certificateDate' | 'startDate' | 'endDate', val: string) {
    if (field === 'certificateDate') {
      const start = form.startDate || val
      const s = new Date(start)
      s.setDate(s.getDate() + (form.daysOff - 1))
      setForm(f => ({
        ...f,
        certificateDate: val,
        startDate: f.startDate ? f.startDate : val,
        endDate: s.toISOString().split('T')[0],
      }))
    } else if (field === 'startDate') {
      const s = new Date(val)
      s.setDate(s.getDate() + (form.daysOff - 1))
      setForm(f => ({
        ...f,
        startDate: val,
        endDate: s.toISOString().split('T')[0],
      }))
    } else if (field === 'endDate') {
      const start = new Date(form.startDate || form.certificateDate)
      const end = new Date(val)
      if (end >= start) {
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        setForm(f => ({ ...f, endDate: val, daysOff: diff }))
      } else {
        setForm(f => ({ ...f, endDate: val }))
      }
    }
  }

  function handleDaysChange(days: number) {
    const d = days > 0 ? days : 1
    const start = new Date(form.startDate || form.certificateDate)
    start.setDate(start.getDate() + (d - 1))
    setForm(f => ({
      ...f,
      daysOff: d,
      endDate: start.toISOString().split('T')[0],
    }))
  }

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

  function openNew() {
    setEditId(null)
    setSelectedEmployee(null)
    setEmpSearch('')
    setCidSearch('')
    setSelectedFile(null)
    const today = new Date().toISOString().split('T')[0]
    setForm({
      employeeId: '',
      cidId: '',
      cidDescription: '',
      doctor: '',
      crm: '',
      certificateDate: today,
      startDate: today,
      endDate: today,
      daysOff: 1,
      observations: '',
    })
    setShowModal(true)
  }

  function openEdit(cert: Certificate) {
    setEditId(cert.id)
    setSelectedEmployee(cert.employee)
    setEmpSearch(cert.employee.name)
    setCidSearch(cert.cid ? `${cert.cid.code} - ${cert.cid.description}` : (cert.cidDescription || ''))
    setSelectedFile(null)

    const cDate = cert.certificateDate ? cert.certificateDate.split('T')[0] : ''
    const sDate = cert.startDate ? cert.startDate.split('T')[0] : cDate
    const eDate = cert.endDate ? cert.endDate.split('T')[0] : cDate

    setForm({
      employeeId: cert.employee.id,
      cidId: cert.cid ? cert.cid.id : '',
      cidDescription: cert.cid ? cert.cid.description : (cert.cidDescription || ''),
      doctor: cert.doctor || '',
      crm: cert.crm || '',
      certificateDate: cDate,
      startDate: sDate,
      endDate: eDate,
      daysOff: cert.daysOff || 1,
      observations: cert.observations || '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.employeeId) {
      toast('Selecione um funcionário', 'error')
      return
    }
    if (!form.certificateDate) {
      toast('Informe a data do atestado', 'error')
      return
    }

    setSaving(true)

    const payload = {
      ...form,
      startDate: form.startDate || form.certificateDate,
      endDate: form.endDate || form.certificateDate,
      daysOff: form.daysOff || 1,
      cidId: form.cidId && form.cidId.trim() !== '' ? form.cidId : null,
    }

    try {
      const res = await fetch(editId ? `/api/certificates/${editId}` : '/api/certificates', {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        const certId = editId || data.id

        // Upload de arquivo anexo se selecionado
        if (selectedFile && certId) {
          try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            await fetch(`/api/certificates/${certId}/upload`, {
              method: 'POST',
              body: formData,
            })
          } catch {
            toast('Atestado salvo, mas houve erro ao enviar o arquivo anexo', 'warning')
          }
        }

        toast(editId ? 'Atestado atualizado com sucesso!' : 'Atestado cadastrado com sucesso!', 'success')
        setShowModal(false)
        setEditId(null)
        setSelectedFile(null)
        fetchData()
      } else {
        toast(data.error || 'Erro ao salvar atestado', 'error')
      }
    } catch {
      toast('Erro de rede ao salvar atestado', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cert: Certificate) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/certificates/${cert.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast('Atestado excluído com sucesso', 'success')
        setDeleteTarget(null)
        fetchData()
      } else {
        const data = await res.json()
        toast(data.error || 'Erro ao excluir', 'error')
      }
    } catch {
      toast('Erro de rede ao excluir', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page-content animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Atestados Médicos</h1>
          <p className="page-subtitle">{total.toLocaleString()} atestado(s) registrado(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canImport && (
            <Link href="/importacao" className="btn btn-secondary">
              <Upload size={16} /> Importação em Massa
            </Link>
          )}
          {canCreate && (
            <button id="btn-novo-atestado" onClick={openNew} className="btn btn-primary">
              <Plus size={16} /> Novo Atestado
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: '1 1 200px' }}>
          <label className="form-label">Buscar por CPF</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
            <input type="text" placeholder="CPF do funcionário..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: '2.25rem' }} />
          </div>
        </div>
        <div className="form-group" style={{ minWidth: 160 }}>
          <label className="form-label">Setor</label>
          <select className="form-input" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">Todos os setores</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 140 }}>
          <label className="form-label">Data inicial</label>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="form-input" />
        </div>
        <div className="form-group" style={{ minWidth: 140 }}>
          <label className="form-label">Data final</label>
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="form-input" />
        </div>
        {(search || filterDept || filterFrom || filterTo) && (
          <button onClick={() => { setSearch(''); setFilterDept(''); setFilterFrom(''); setFilterTo('') }} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }}>
            <X size={14} /> Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
            <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'hsl(var(--primary))' }} />
            <p>Carregando atestados...</p>
          </div>
        ) : certs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>Nenhum atestado encontrado</p>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
              Utilize o botão acima para cadastrar um novo atestado ou importe em massa.
            </p>
            {canCreate && (
              <button onClick={openNew} className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
                <Plus size={16} /> Cadastrar primeiro atestado
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Data Emissão</th>
                  <th>Funcionário</th>
                  <th>CPF</th>
                  <th>Setor</th>
                  <th>CID</th>
                  <th>Dias</th>
                  <th>Médico</th>
                  <th>Documento</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {certs.map(cert => (
                  <tr key={cert.id}>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', fontWeight: 500 }}>{formatDate(cert.certificateDate)}</td>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={`/funcionarios/${cert.employee.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {cert.employee.name}
                      </Link>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{formatCpf(cert.employee.cpf)}</td>
                    <td><span className="badge badge-info">{cert.employee.department.name}</span></td>
                    <td>{cert.cid ? <span className="badge badge-gray" title={cert.cid.description}>{cert.cid.code}</span> : (cert.cidDescription || '—')}</td>
                    <td>
                      <span className="badge badge-warning">{cert.daysOff}d</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{cert.doctor || '—'}</td>
                    <td>
                      {cert.files && cert.files.length > 0 ? (
                        <a href={`/api/files/${cert.files[0].id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon btn-sm" title="Visualizar documento">
                          <FileText size={16} style={{ color: 'hsl(142 71% 45%)' }} />
                        </a>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                        <Link href={`/atestados/${cert.id}`} className="btn btn-ghost btn-icon btn-sm" title="Visualizar Detalhes">
                          <Eye size={15} />
                        </Link>
                        {canEdit && (
                          <button onClick={() => openEdit(cert)} className="btn btn-ghost btn-icon btn-sm" title="Editar Atestado">
                            <Edit size={15} />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setDeleteTarget(cert)} className="btn btn-ghost btn-icon btn-sm" title="Excluir" style={{ color: 'hsl(var(--destructive))' }}>
                            <Trash2 size={15} />
                          </button>
                        )}
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

      {/* Modal Cadastro/Edição de Atestado */}
      {showModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>{editId ? 'Editar Atestado' : 'Novo Atestado'}</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Seleção do Funcionário */}
                <div className="form-group" style={{ gridColumn: '1 / -1', position: 'relative' }}>
                  <label className="form-label">Funcionário *</label>

                  {selectedEmployee ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'hsl(var(--secondary) / 0.6)',
                        border: '1px solid hsl(var(--primary) / 0.4)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'hsl(var(--primary))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedEmployee.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                            CPF: {formatCpf(selectedEmployee.cpf)} • {selectedEmployee.department.name}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedEmployee(null); setForm(f => ({ ...f, employeeId: '' })); setEmpSearch('') }}
                        className="btn btn-secondary btn-sm"
                      >
                        Trocar funcionário
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            value={empSearch}
                            onChange={e => setEmpSearch(e.target.value)}
                            placeholder="Buscar por nome ou CPF..."
                            className="form-input"
                          />
                          {filteredEmps.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, zIndex: 20, maxHeight: 200, overflowY: 'auto', marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                              {filteredEmps.map(emp => (
                                <div
                                  key={emp.id}
                                  onClick={() => selectEmployee(emp)}
                                  style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: '1px solid hsl(var(--border) / 0.5)', fontSize: '0.85rem' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--secondary))'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <strong>{emp.name}</strong> — {formatCpf(emp.cpf)} ({emp.department.name})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <select
                          className="form-input"
                          value={form.employeeId}
                          onChange={e => {
                            const emp = employees.find(x => x.id === e.target.value)
                            if (emp) selectEmployee(emp)
                          }}
                        >
                          <option value="">Ou selecione da lista...</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({formatCpf(emp.cpf)})</option>
                          ))}
                        </select>
                      </div>
                      <span className="form-hint">Digite o nome/CPF ou escolha na lista</span>
                    </div>
                  )}
                </div>

                {/* Datas e Prazos */}
                <div className="form-group">
                  <label className="form-label">Data de Emissão do Atestado *</label>
                  <input
                    type="date"
                    value={form.certificateDate}
                    onChange={e => handleDateChange('certificateDate', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dias de Afastamento *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.daysOff}
                    onChange={e => handleDaysChange(parseInt(e.target.value) || 1)}
                    className="form-input"
                    required
                  />
                  <span className="form-hint">Calcula a data final automaticamente</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Data Inicial do Afastamento *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => handleDateChange('startDate', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data Final do Afastamento *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => handleDateChange('endDate', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                {/* CID Autocomplete */}
                <div className="form-group" style={{ gridColumn: '1 / -1', position: 'relative' }}>
                  <label className="form-label">CID (Código ou Diagnóstico)</label>
                  <input
                    type="text"
                    value={cidSearch}
                    onChange={e => { setCidSearch(e.target.value); setForm(f => ({ ...f, cidDescription: e.target.value })) }}
                    placeholder="Pesquisar por código (ex: M54.5) ou descrição..."
                    className="form-input"
                  />
                  {cids.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, zIndex: 20, maxHeight: 180, overflowY: 'auto', marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                      {cids.map(cid => (
                        <div
                          key={cid.id}
                          onClick={() => selectCid(cid)}
                          style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: '1px solid hsl(var(--border) / 0.5)', fontSize: '0.85rem' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--secondary))'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <strong style={{ color: 'hsl(var(--primary))' }}>{cid.code}</strong> — {cid.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Nome do Médico</label>
                  <input type="text" value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} className="form-input" placeholder="Dr(a). Nome Sobrenome" />
                </div>

                <div className="form-group">
                  <label className="form-label">CRM</label>
                  <input type="text" value={form.crm} onChange={e => setForm(f => ({ ...f, crm: e.target.value }))} className="form-input" placeholder="CRM/UF" />
                </div>

                {/* Upload de Arquivo Anexo */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Anexar Documento / Foto do Atestado</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '1px dashed hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: 'hsl(var(--secondary) / 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Paperclip size={18} style={{ color: 'hsl(var(--primary))' }} />
                      <span style={{ fontSize: '0.85rem', color: selectedFile ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
                        {selectedFile ? selectedFile.name : 'Clique para selecionar arquivo (PDF, Imagem)...'}
                      </span>
                    </div>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setSelectedFile(null) }}
                        className="btn btn-ghost btn-sm"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Observações</label>
                  <textarea value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} className="form-input" rows={2} placeholder="Observações opcionais" style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
              <button id="btn-salvar-atestado" onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : editId ? 'Salvar Alterações' : 'Salvar Atestado'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600, color: 'hsl(var(--destructive))' }}>⚠️ Excluir atestado</h3>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir o atestado de <strong>{deleteTarget.employee.name}</strong> de {formatDate(deleteTarget.certificateDate)} ({deleteTarget.daysOff} dias)?</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={() => handleDelete(deleteTarget)} disabled={deleting} className="btn btn-danger">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  )
}
