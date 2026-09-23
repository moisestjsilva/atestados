// src/app/(dashboard)/funcionarios/[id]/page.tsx
'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User, Building2, Calendar, FileText, Plus,
  Edit, Trash2, AlertCircle, Loader2, X, Clock, Eye,
  CheckCircle, Briefcase, Hash, Phone, Mail
} from 'lucide-react'
import { formatCpf, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import { useSession } from 'next-auth/react'
import { can } from '@/lib/permissions'
import { UserRole } from '@prisma/client'

interface EmployeeDetails {
  id: string
  name: string
  cpf: string
  matricula: string | null
  cargo: string | null
  admissionDate: string | null
  birthDate: string | null
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
  department: {
    id: string
    name: string
    code: string
  }
  certificates: Array<{
    id: string
    certificateDate: string
    startDate: string
    endDate: string
    daysOff: number
    doctor: string | null
    crm: string | null
    status: string
    cid: {
      code: string
      description: string
    } | null
    files: Array<{
      id: string
      originalName: string
    }>
  }>
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const role = (session?.user?.role || 'CONSULTOR') as UserRole

  const canEdit = can(role, 'employees:edit')
  const canDelete = can(role, 'employees:delete')
  const canCreateCert = can(role, 'certificates:create')

  const [employee, setEmployee] = useState<EmployeeDetails | null>(null)
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit Employee Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [savingEmp, setSavingEmp] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    cpf: '',
    matricula: '',
    cargo: '',
    departmentId: '',
    admissionDate: '',
    status: 'ATIVO' as 'ATIVO' | 'INATIVO',
  })

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // New Certificate Modal
  const [showCertModal, setShowCertModal] = useState(false)
  const [savingCert, setSavingCert] = useState(false)
  const [certForm, setCertForm] = useState({
    certificateDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysOff: 1,
    doctor: '',
    crm: '',
    cidDescription: '',
    observations: '',
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [resEmp, resDept] = await Promise.all([
        fetch(`/api/employees/${id}`),
        fetch('/api/departments?all=true'),
      ])
      if (!resEmp.ok) throw new Error('Funcionário não encontrado')
      const empData = await resEmp.json()
      const deptData = await resDept.json()

      setEmployee(empData)
      setDepartments(deptData.departments || [])

      setEditForm({
        name: empData.name || '',
        cpf: formatCpf(empData.cpf || ''),
        matricula: empData.matricula || '',
        cargo: empData.cargo || '',
        departmentId: empData.department?.id || '',
        admissionDate: empData.admissionDate ? empData.admissionDate.split('T')[0] : '',
        status: empData.status || 'ATIVO',
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Recalcula dias ao mudar datas no modal de atestado
  useEffect(() => {
    if (certForm.startDate && certForm.endDate) {
      const start = new Date(certForm.startDate)
      const end = new Date(certForm.endDate)
      if (end >= start) {
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        setCertForm(f => ({ ...f, daysOff: diff }))
      }
    }
  }, [certForm.startDate, certForm.endDate])

  async function handleUpdateEmployee(e: React.FormEvent) {
    e.preventDefault()
    setSavingEmp(true)
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (res.ok) {
        toast('Funcionário atualizado com sucesso!', 'success')
        setShowEditModal(false)
        loadData()
      } else {
        toast(data.error || 'Erro ao atualizar funcionário', 'error')
      }
    } catch {
      toast('Erro de rede ao atualizar', 'error')
    } finally {
      setSavingEmp(false)
    }
  }

  async function handleDeleteEmployee() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast(data.softDeleted ? 'Funcionário inativado (possui atestados)' : 'Funcionário excluído', data.softDeleted ? 'warning' : 'success')
        router.push('/funcionarios')
      } else {
        toast(data.error || 'Erro ao excluir', 'error')
      }
    } catch {
      toast('Erro de conexão ao excluir', 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function handleCreateCert(e: React.FormEvent) {
    e.preventDefault()
    setSavingCert(true)
    try {
      const payload = {
        ...certForm,
        employeeId: id,
      }
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast('Atestado cadastrado com sucesso!', 'success')
        setShowCertModal(false)
        setCertForm({
          certificateDate: new Date().toISOString().split('T')[0],
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          daysOff: 1,
          doctor: '',
          crm: '',
          cidDescription: '',
          observations: '',
        })
        loadData()
      } else {
        toast(data.error || 'Erro ao cadastrar atestado', 'error')
      }
    } catch {
      toast('Erro de conexão', 'error')
    } finally {
      setSavingCert(false)
    }
  }

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'hsl(var(--primary))', margin: '0 auto 1rem' }} />
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Carregando perfil do funcionário...</p>
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="page-content">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: 500, margin: '2rem auto' }}>
          <AlertCircle size={44} style={{ color: 'hsl(var(--destructive))', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{error || 'Não encontrado'}</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>
            O colaborador solicitado não foi encontrado ou foi excluído.
          </p>
          <Link href="/funcionarios" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Voltar para lista de funcionários
          </Link>
        </div>
      </div>
    )
  }

  const certs = employee.certificates || []
  const totalDays = certs.reduce((acc, c) => acc + (c.daysOff || 0), 0)
  const avgDays = certs.length > 0 ? (totalDays / certs.length).toFixed(1) : '0'

  return (
    <div className="page-content animate-fade-in">
      {/* Header & Breadcrumb */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
            <Link href="/funcionarios" style={{ color: 'inherit', textDecoration: 'none' }}>Funcionários</Link>
            <span>/</span>
            <span style={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}>{employee.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{employee.name}</h1>
            <span className={`badge ${employee.status === 'ATIVO' ? 'badge-success' : 'badge-gray'}`}>
              {employee.status}
            </span>
            <span className="badge badge-info">{employee.department.name}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/funcionarios" className="btn btn-secondary">
            <ArrowLeft size={16} /> Voltar
          </Link>
          {canCreateCert && (
            <button onClick={() => setShowCertModal(true)} className="btn btn-primary">
              <Plus size={16} /> Novo Atestado
            </button>
          )}
          {canEdit && (
            <button onClick={() => setShowEditModal(true)} className="btn btn-secondary">
              <Edit size={16} /> Editar
            </button>
          )}
          {canDelete && (
            <button onClick={() => setShowDeleteModal(true)} className="btn btn-ghost" style={{ color: 'hsl(var(--destructive))' }}>
              <Trash2 size={16} /> {certs.length > 0 ? 'Inativar' : 'Excluir'}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))' }}>
            <FileText size={22} />
          </div>
          <div className="stat-value">{certs.length}</div>
          <div className="stat-label">Total de Atestados</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(38 92% 50% / 0.12)', color: 'hsl(38 92% 45%)' }}>
            <Calendar size={22} />
          </div>
          <div className="stat-value">{totalDays}</div>
          <div className="stat-label">Dias de Afastamento Acumulados</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(142 71% 45% / 0.12)', color: 'hsl(142 71% 40%)' }}>
            <Clock size={22} />
          </div>
          <div className="stat-value">{avgDays}d</div>
          <div className="stat-label">Média de Dias por Atestado</div>
        </div>
      </div>

      {/* Employee Data Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid hsl(var(--border) / 0.6)', paddingBottom: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Informações Cadastrais</h2>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Dados pessoais e corporativos</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span className="form-label" style={{ fontSize: '0.75rem' }}>CPF</span>
            <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 600 }}>{formatCpf(employee.cpf)}</div>
          </div>

          <div>
            <span className="form-label" style={{ fontSize: '0.75rem' }}>Matrícula</span>
            <div style={{ fontSize: '0.95rem' }}>{employee.matricula || '—'}</div>
          </div>

          <div>
            <span className="form-label" style={{ fontSize: '0.75rem' }}>Cargo</span>
            <div style={{ fontSize: '0.95rem' }}>{employee.cargo || '—'}</div>
          </div>

          <div>
            <span className="form-label" style={{ fontSize: '0.75rem' }}>Setor</span>
            <div style={{ fontSize: '0.95rem' }}>
              <span className="badge badge-info">{employee.department.name} ({employee.department.code})</span>
            </div>
          </div>

          <div>
            <span className="form-label" style={{ fontSize: '0.75rem' }}>Data de Admissão</span>
            <div style={{ fontSize: '0.95rem' }}>{employee.admissionDate ? formatDate(employee.admissionDate) : '—'}</div>
          </div>

          <div>
            <span className="form-label" style={{ fontSize: '0.75rem' }}>Cadastrado no Sistema em</span>
            <div style={{ fontSize: '0.95rem' }}>{formatDate(employee.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Certificates History Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'hsl(38 92% 50% / 0.12)', color: 'hsl(38 92% 45%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Histórico de Atestados</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Registros médicos deste colaborador</span>
            </div>
          </div>

          {canCreateCert && (
            <button onClick={() => setShowCertModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Registrar Atestado
            </button>
          )}
        </div>

        {certs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(var(--muted-foreground))' }}>
            <FileText size={40} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 500 }}>Nenhum atestado registrado para este colaborador</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Clique em "Registrar Atestado" para incluir o primeiro.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Data do Atestado</th>
                  <th>Período</th>
                  <th>Dias</th>
                  <th>CID</th>
                  <th>Médico</th>
                  <th>Documento</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {certs.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{formatDate(c.certificateDate)}</td>
                    <td style={{ fontSize: '0.85rem' }}>{formatDate(c.startDate)} até {formatDate(c.endDate)}</td>
                    <td>
                      <span className="badge badge-warning">{c.daysOff}d</span>
                    </td>
                    <td>
                      {c.cid ? (
                        <span className="badge badge-info" title={c.cid.description}>{c.cid.code}</span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                      {c.doctor ? `${c.doctor}${c.crm ? ` (${c.crm})` : ''}` : '—'}
                    </td>
                    <td>
                      {c.files && c.files.length > 0 ? (
                        <a
                          href={`/api/files/${c.files[0].id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Visualizar documento"
                        >
                          <FileText size={15} style={{ color: 'hsl(142 71% 45%)' }} />
                        </a>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/atestados/${c.id}`} className="btn btn-secondary btn-sm" title="Ver detalhes">
                        <Eye size={14} /> Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>Editar Funcionário</h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateEmployee}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Nome Completo *</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CPF *</label>
                    <input
                      type="text"
                      value={editForm.cpf}
                      onChange={e => setEditForm(f => ({ ...f, cpf: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Matrícula</label>
                    <input
                      type="text"
                      value={editForm.matricula}
                      onChange={e => setEditForm(f => ({ ...f, matricula: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cargo</label>
                    <input
                      type="text"
                      value={editForm.cargo}
                      onChange={e => setEditForm(f => ({ ...f, cargo: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Setor *</label>
                    <select
                      value={editForm.departmentId}
                      onChange={e => setEditForm(f => ({ ...f, departmentId: e.target.value }))}
                      className="form-input"
                      required
                    >
                      <option value="">Selecione o setor...</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Data de Admissão</label>
                    <input
                      type="date"
                      value={editForm.admissionDate}
                      onChange={e => setEditForm(f => ({ ...f, admissionDate: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm(f => ({ ...f, status: e.target.value as 'ATIVO' | 'INATIVO' }))}
                      className="form-input"
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={savingEmp} className="btn btn-primary">
                  {savingEmp ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete/Deactivate Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600, color: 'hsl(var(--destructive))' }}>
                {certs.length > 0 ? '⚠️ Inativar Funcionário' : '⚠️ Excluir Funcionário'}
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja prosseguir com a exclusão de <strong>{employee.name}</strong>?</p>
              {certs.length > 0 ? (
                <div className="alert alert-warning" style={{ marginTop: '0.75rem' }}>
                  Este colaborador possui <strong>{certs.length} atestado(s)</strong> vinculados. Para segurança e auditoria, ele será <strong>inativado</strong> mantendo o histórico intacto.
                </div>
              ) : (
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                  O cadastro será removido permanentemente pois não possui histórico de atestados.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleDeleteEmployee} disabled={deleting} className="btn btn-danger">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : certs.length > 0 ? 'Inativar Colaborador' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fast Register Certificate Modal for this employee */}
      {showCertModal && (
        <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>Novo Atestado para {employee.name}</h3>
              <button onClick={() => setShowCertModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCert}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Data do Atestado *</label>
                    <input
                      type="date"
                      value={certForm.certificateDate}
                      onChange={e => setCertForm(f => ({ ...f, certificateDate: e.target.value, startDate: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dias de Afastamento *</label>
                    <input
                      type="number"
                      min="1"
                      value={certForm.daysOff}
                      onChange={e => {
                        const days = parseInt(e.target.value) || 1
                        const start = new Date(certForm.startDate || certForm.certificateDate)
                        start.setDate(start.getDate() + (days - 1))
                        setCertForm(f => ({ ...f, daysOff: days, endDate: start.toISOString().split('T')[0] }))
                      }}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Data Inicial</label>
                    <input
                      type="date"
                      value={certForm.startDate}
                      onChange={e => setCertForm(f => ({ ...f, startDate: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Data Final</label>
                    <input
                      type="date"
                      value={certForm.endDate}
                      onChange={e => setCertForm(f => ({ ...f, endDate: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Médico</label>
                    <input
                      type="text"
                      value={certForm.doctor}
                      onChange={e => setCertForm(f => ({ ...f, doctor: e.target.value }))}
                      className="form-input"
                      placeholder="Nome do médico"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CRM</label>
                    <input
                      type="text"
                      value={certForm.crm}
                      onChange={e => setCertForm(f => ({ ...f, crm: e.target.value }))}
                      className="form-input"
                      placeholder="CRM/UF"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Diagnóstico / CID Resumo</label>
                    <input
                      type="text"
                      value={certForm.cidDescription}
                      onChange={e => setCertForm(f => ({ ...f, cidDescription: e.target.value }))}
                      className="form-input"
                      placeholder="Ex: J06.9 ou Infecção das vias aéreas"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Observações</label>
                    <textarea
                      value={certForm.observations}
                      onChange={e => setCertForm(f => ({ ...f, observations: e.target.value }))}
                      className="form-input"
                      rows={2}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCertModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={savingCert} className="btn btn-primary">
                  {savingCert ? <><Loader2 size={14} className="animate-spin" /> Registrando...</> : 'Registrar Atestado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
