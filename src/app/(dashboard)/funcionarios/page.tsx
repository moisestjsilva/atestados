// src/app/(dashboard)/funcionarios/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { can } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { formatCpf, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import {
  Plus, Search, Filter, ChevronLeft, ChevronRight, Eye,
  Edit, Trash2, Loader2, Users, Upload, Download, X
} from 'lucide-react'
import Link from 'next/link'
import { ModalPortal } from '@/components/ui/modal-portal'

interface Employee {
  id: string
  matricula: string | null
  name: string
  cpf: string
  cargo: string | null
  status: string
  department: { id: string; name: string }
  _count: { certificates: number }
}

export default function FuncionariosPage() {
  const { data: session } = useSession()
  const role = (session?.user?.role || 'CONSULTOR') as UserRole
  const canCreate = can(role, 'employees:create')
  const canEdit = can(role, 'employees:edit')
  const canDelete = can(role, 'employees:delete')
  const canImport = can(role, 'employees:import')

  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ matricula: '', name: '', cpf: '', cargo: '', departmentId: '', admissionDate: '', status: 'ATIVO' })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/departments?all=true').then(r => r.json()).then(d => setDepartments(d.departments || []))
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20', search, ...(filterStatus && { status: filterStatus }), ...(filterDept && { departmentId: filterDept }) })
    const res = await fetch(`/api/employees?${params}`)
    const json = await res.json()
    setEmployees(json.employees || [])
    setTotal(json.total || 0)
    setPages(json.pages || 1)
    setLoading(false)
  }, [page, search, filterStatus, filterDept])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, filterStatus, filterDept])

  async function handleSave() {
    if (!form.name || !form.cpf || !form.departmentId) { toast('Preencha nome, CPF e setor', 'error'); return }
    setSaving(true)
    const res = await fetch(editId ? `/api/employees/${editId}` : '/api/employees', {
      method: editId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      toast(editId ? 'Funcionário atualizado!' : 'Funcionário cadastrado!', 'success')
      setShowModal(false)
      setEditId(null)
      setForm({ matricula: '', name: '', cpf: '', cargo: '', departmentId: '', admissionDate: '', status: 'ATIVO' })
      fetchData()
    } else {
      const data = await res.json()
      toast(data.error || 'Erro ao salvar', 'error')
    }
  }

  async function handleDelete(emp: Employee) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast(data.softDeleted ? 'Funcionário inativado e removido da lista' : 'Funcionário excluído com sucesso', 'success')
        setDeleteTarget(null)
        fetchData()
      } else {
        toast(data.error || 'Erro ao excluir funcionário', 'error')
      }
    } catch {
      toast('Erro de conexão ao excluir funcionário', 'error')
    } finally {
      setDeleting(false)
    }
  }

  function openEdit(emp: Employee) {
    setEditId(emp.id)
    setForm({ matricula: emp.matricula || '', name: emp.name, cpf: formatCpf(emp.cpf), cargo: emp.cargo || '', departmentId: emp.department.id, admissionDate: '', status: emp.status })
    setShowModal(true)
  }

  return (
    <div className="page-content animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Funcionários</h1>
          <p className="page-subtitle">{total.toLocaleString()} funcionário(s) cadastrado(s)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {canImport && (
            <Link href="/funcionarios/importar" className="btn btn-secondary">
              <Upload size={16} />Importar
            </Link>
          )}
          {canCreate && (
            <button id="btn-novo-funcionario" onClick={() => { setEditId(null); setForm({ matricula: '', name: '', cpf: '', cargo: '', departmentId: '', admissionDate: '', status: 'ATIVO' }); setShowModal(true) }} className="btn btn-primary">
              <Plus size={16} />Novo Funcionário
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: '1 1 200px' }}>
          <label className="form-label">Buscar</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
            <input type="text" placeholder="Nome, CPF, matrícula..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: '2.25rem' }} />
          </div>
        </div>
        <div className="form-group" style={{ minWidth: 140 }}>
          <label className="form-label">Status</label>
          <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 160 }}>
          <label className="form-label">Setor</label>
          <select className="form-input" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">Todos</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        {(search || filterStatus || filterDept) && (
          <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterDept('') }} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }}>
            <X size={14} />Limpar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}><Loader2 size={28} className="animate-spin" /></div>
        ) : employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Users size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>Nenhum funcionário encontrado</p>
            {canCreate && <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}><Plus size={16} />Cadastrar primeiro funcionário</button>}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Cargo</th>
                  <th>Setor</th>
                  <th>Status</th>
                  <th>Atestados</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem' }}>{emp.matricula || '—'}</td>
                    <td style={{ fontWeight: 500 }}>{emp.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{formatCpf(emp.cpf)}</td>
                    <td style={{ color: 'hsl(var(--muted-foreground))' }}>{emp.cargo || '—'}</td>
                    <td><span className="badge badge-info">{emp.department.name}</span></td>
                    <td>
                      <span className={`badge ${emp.status === 'ATIVO' ? 'badge-success' : 'badge-gray'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {emp._count.certificates > 0 ? <span className="badge badge-warning">{emp._count.certificates}</span> : <span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <Link href={`/funcionarios/${emp.id}`} className="btn btn-ghost btn-icon btn-sm" title="Visualizar"><Eye size={15} /></Link>
                        {canEdit && <button onClick={() => openEdit(emp)} className="btn btn-ghost btn-icon btn-sm" title="Editar"><Edit size={15} /></button>}
                        {canDelete && <button onClick={() => setDeleteTarget(emp)} className="btn btn-ghost btn-icon btn-sm" title="Excluir" style={{ color: 'hsl(var(--destructive))' }}><Trash2 size={15} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination" style={{ marginTop: '1rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm"><ChevronLeft size={16} /></button>
            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Página {page} de {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn btn-ghost btn-sm"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>{editId ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Matrícula</label>
                  <input type="text" value={form.matricula} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} className="form-input" placeholder="Opcional" />
                </div>
                <div className="form-group">
                  <label className="form-label">CPF *</label>
                  <input type="text" value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} className="form-input" placeholder="000.000.000-00" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Nome completo *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" placeholder="Nome do funcionário" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cargo</label>
                  <input type="text" value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} className="form-input" placeholder="Ex: Analista" />
                </div>
                <div className="form-group">
                  <label className="form-label">Setor *</label>
                  <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} className="form-input">
                    <option value="">Selecione o setor</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Data de admissão</label>
                  <input type="date" value={form.admissionDate} onChange={e => setForm(f => ({ ...f, admissionDate: e.target.value }))} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="form-input">
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
              <button id="btn-salvar-funcionario" onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600, color: 'hsl(var(--destructive))' }}>⚠️ Confirmar exclusão</h3>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir o funcionário <strong>{deleteTarget.name}</strong>?</p>
              {deleteTarget._count.certificates > 0 && (
                <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                  ⚠️ Este funcionário possui <strong>{deleteTarget._count.certificates} atestado(s)</strong>. O sistema irá inativar o cadastro em vez de excluir para preservar o histórico.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={() => handleDelete(deleteTarget)} disabled={deleting} className="btn btn-danger">
                {deleting ? <><Loader2 size={14} className="animate-spin" />Excluindo...</> : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  )
}
