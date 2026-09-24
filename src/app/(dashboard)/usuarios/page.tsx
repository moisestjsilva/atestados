// src/app/(dashboard)/usuarios/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { UserRole, UserStatus } from '@prisma/client'
import { formatDateTime, getInitials } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import { Plus, X, Loader2, CheckCircle, XCircle, Ban, UserCog, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLogin: string | null
}

const ROLE_LABELS: Record<string, string> = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', CONSULTOR: 'Consultor' }
const STATUS_CLASS: Record<string, string> = { ATIVO: 'badge-success', PENDENTE: 'badge-warning', BLOQUEADO: 'badge-danger', RECUSADO: 'badge-gray' }

export default function UsuariosPage() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'CONSULTOR' as UserRole })
  const [creating, setCreating] = useState(false)

  // Edit User Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'CONSULTOR' as UserRole,
    status: 'ATIVO' as UserStatus,
    password: '',
  })
  const [updating, setUpdating] = useState(false)

  // Delete User Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20', search, ...(filterStatus && { status: filterStatus }) })
    const res = await fetch(`/api/users?${params}`)
    const json = await res.json()
    setUsers(json.users || [])
    setTotal(json.total || 0)
    setPages(json.pages || 1)
    setLoading(false)
  }, [page, search, filterStatus])

  useEffect(() => { fetchData() }, [fetchData])

  async function updateUserStatusOrRole(id: string, data: Partial<{ status: UserStatus; role: UserRole }>) {
    setSaving(id)
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(null)
    if (res.ok) {
      toast('Usuário atualizado!', 'success')
      fetchData()
    } else {
      const d = await res.json()
      toast(d.error || 'Erro', 'error')
    }
  }

  function handleOpenEdit(user: User) {
    setEditingUser(user)
    setEditForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
    })
    setShowEditModal(true)
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast('Preencha os campos obrigatórios', 'error')
      return
    }
    setUpdating(true)
    try {
      const payload: any = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        status: editForm.status,
      }
      if (editForm.password.trim()) {
        payload.password = editForm.password.trim()
      }

      const res = await fetch(`/api/users/${editForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        toast('Usuário atualizado com sucesso!', 'success')
        setShowEditModal(false)
        setEditingUser(null)
        fetchData()
      } else {
        toast(data.error || 'Erro ao atualizar usuário', 'error')
      }
    } catch {
      toast('Erro de comunicação com o servidor', 'error')
    } finally {
      setUpdating(false)
    }
  }

  function handleOpenDelete(user: User) {
    setDeletingUser(user)
    setShowDeleteModal(true)
  }

  async function handleDeleteUser() {
    if (!deletingUser) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast('Usuário excluído com sucesso!', 'success')
        setShowDeleteModal(false)
        setDeletingUser(null)
        fetchData()
      } else {
        toast(data.error || 'Erro ao excluir usuário', 'error')
      }
    } catch {
      toast('Erro ao comunicar com o servidor', 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function handleCreate() {
    if (!createForm.name || !createForm.email || !createForm.password) { toast('Preencha todos os campos', 'error'); return }
    setCreating(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...createForm, status: 'ATIVO' }),
    })
    setCreating(false)
    if (res.ok) {
      toast('Usuário criado!', 'success')
      setShowCreateModal(false)
      setCreateForm({ name: '', email: '', password: '', role: 'CONSULTOR' })
      fetchData()
    } else {
      const d = await res.json()
      toast(d.error || 'Erro', 'error')
    }
  }

  const pendingUsers = users.filter(u => u.status === 'PENDENTE')

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">{total} usuário(s) cadastrado(s)</p>
        </div>
        {isSuperAdmin && (
          <button id="btn-novo-usuario" onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} />Novo Usuário
          </button>
        )}
      </div>

      {/* Pending alerts */}
      {pendingUsers.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          🔔 <strong>{pendingUsers.length} usuário(s)</strong> aguardando aprovação:
          {pendingUsers.map(u => (
            <span key={u.id} style={{ marginLeft: '0.5rem' }}>
              <strong>{u.name}</strong> ({u.email})
              {isSuperAdmin && (
                <span style={{ marginLeft: '0.5rem', display: 'inline-flex', gap: '0.25rem' }}>
                  <button onClick={() => updateUserStatusOrRole(u.id, { status: 'ATIVO' })} disabled={saving === u.id} className="btn btn-sm" style={{ background: 'hsl(142 71% 45%)', color: 'white', padding: '0.15rem 0.5rem' }}>Aprovar</button>
                  <button onClick={() => updateUserStatusOrRole(u.id, { status: 'RECUSADO' })} disabled={saving === u.id} className="btn btn-danger btn-sm" style={{ padding: '0.15rem 0.5rem' }}>Recusar</button>
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: '1 1 200px' }}>
          <label className="form-label">Buscar</label>
          <input type="text" placeholder="Nome ou e-mail..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" />
        </div>
        <div className="form-group" style={{ minWidth: 140 }}>
          <label className="form-label">Status</label>
          <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="ATIVO">Ativo</option>
            <option value="PENDENTE">Pendente</option>
            <option value="BLOQUEADO">Bloqueado</option>
            <option value="RECUSADO">Recusado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={28} className="animate-spin" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th>Último acesso</th>
                  {isSuperAdmin && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const isSelf = session?.user?.id === user.id
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{getInitials(user.name)}</div>
                          <span style={{ fontWeight: 500 }}>
                            {user.name}
                            {isSelf && <span className="badge badge-gray" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>Você</span>}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'SUPER_ADMIN' ? 'badge-danger' : user.role === 'ADMIN' ? 'badge-warning' : 'badge-info'}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td><span className={`badge ${STATUS_CLASS[user.status]}`}>{user.status}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{formatDateTime(user.createdAt)}</td>
                      <td style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{user.lastLogin ? formatDateTime(user.lastLogin) : '—'}</td>
                      {isSuperAdmin && (
                        <td>
                          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                            {/* Botão de Editar */}
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="btn btn-secondary btn-sm"
                              title="Editar Usuário"
                            >
                              <Edit size={14} /> Editar
                            </button>

                            {/* Ações rápidas de status (para outros usuários) */}
                            {!isSelf && (
                              <>
                                {user.status === 'PENDENTE' && (
                                  <>
                                    <button onClick={() => updateUserStatusOrRole(user.id, { status: 'ATIVO' })} disabled={saving === user.id} className="btn btn-sm" style={{ background: 'hsl(142 71% 45%)', color: 'white' }} title="Aprovar">
                                      <CheckCircle size={13} />
                                    </button>
                                    <button onClick={() => updateUserStatusOrRole(user.id, { status: 'RECUSADO' })} disabled={saving === user.id} className="btn btn-danger btn-sm" title="Recusar">
                                      <XCircle size={13} />
                                    </button>
                                  </>
                                )}
                                {user.status === 'ATIVO' && (
                                  <button onClick={() => updateUserStatusOrRole(user.id, { status: 'BLOQUEADO' })} disabled={saving === user.id} className="btn btn-secondary btn-sm" title="Bloquear Usuário">
                                    <Ban size={13} />
                                  </button>
                                )}
                                {user.status === 'BLOQUEADO' && (
                                  <button onClick={() => updateUserStatusOrRole(user.id, { status: 'ATIVO' })} disabled={saving === user.id} className="btn btn-sm" style={{ background: 'hsl(142 71% 45%)', color: 'white' }} title="Desbloquear Usuário">
                                    <CheckCircle size={13} />
                                  </button>
                                )}

                                {/* Excluir (somente se não for outro Super Admin ou se for permitido) */}
                                {user.role !== 'SUPER_ADMIN' && (
                                  <button
                                    onClick={() => handleOpenDelete(user)}
                                    className="btn btn-ghost btn-icon btn-sm"
                                    style={{ color: 'hsl(var(--destructive))' }}
                                    title="Excluir Usuário"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
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

      {/* Create Modal */}
      {showCreateModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>Novo Usuário</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} className="form-input" placeholder="Nome completo" />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail *</label>
                  <input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} className="form-input" placeholder="email@empresa.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Senha *</label>
                  <input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} className="form-input" placeholder="Mínimo 6 caracteres" />
                </div>
                <div className="form-group">
                  <label className="form-label">Perfil</label>
                  <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value as UserRole }))} className="form-input">
                    <option value="CONSULTOR">Consultor</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleCreate} disabled={creating} className="btn btn-primary">
                {creating ? <><Loader2 size={14} className="animate-spin" />Criando...</> : 'Criar usuário'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontWeight: 600 }}>Editar Usuário</h3>
                <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-icon">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
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
                      <label className="form-label">E-mail *</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Perfil de Acesso *</label>
                      <select
                        value={editForm.role}
                        onChange={e => setEditForm(f => ({ ...f, role: e.target.value as UserRole }))}
                        className="form-input"
                        disabled={editingUser.id === session?.user?.id}
                      >
                        <option value="CONSULTOR">Consultor</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                      {editingUser.id === session?.user?.id && (
                        <span className="form-hint">Você não pode alterar seu próprio perfil.</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Status *</label>
                      <select
                        value={editForm.status}
                        onChange={e => setEditForm(f => ({ ...f, status: e.target.value as UserStatus }))}
                        className="form-input"
                        disabled={editingUser.id === session?.user?.id}
                      >
                        <option value="ATIVO">Ativo</option>
                        <option value="PENDENTE">Pendente</option>
                        <option value="BLOQUEADO">Bloqueado</option>
                        <option value="RECUSADO">Recusado</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nova Senha (opcional)</label>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                        className="form-input"
                        placeholder="Deixe em branco para manter a senha atual"
                      />
                      <span className="form-hint">Preencha apenas se desejar redefinir a senha do usuário</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" disabled={updating} className="btn btn-primary">
                    {updating ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && deletingUser && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontWeight: 600, color: 'hsl(var(--destructive))' }}>⚠️ Excluir Usuário</h3>
                <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost btn-icon">
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p>Tem certeza que deseja excluir permanentemente o usuário <strong>{deletingUser.name}</strong> ({deletingUser.email})?</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                  Esta ação é irreversível e removerá a conta do sistema.
                </p>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button onClick={handleDeleteUser} disabled={deleting} className="btn btn-danger">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar Exclusão'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}

