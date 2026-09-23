// src/app/(dashboard)/declaracoes/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { can } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { toast } from '@/components/ui/toaster'
import {
  Plus, Search, Edit, Trash2, Loader2, FileText, CheckCircle,
  AlertCircle, Scale, ShieldCheck, HelpCircle, X, Info
} from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'

interface DeclarationType {
  id: string
  code: string
  name: string
  description: string
  documentRequired: string | null
  quantity: number | null
  unit: string | null
  isPaid: boolean
  legalBase: string | null
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export default function DeclaracoesPage() {
  const { data: session } = useSession()
  const role = (session?.user?.role || 'CONSULTOR') as UserRole
  const canManage = can(role, 'settings:edit') || can(role, 'certificates:create')

  const [types, setTypes] = useState<DeclarationType[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DeclarationType | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    documentRequired: '',
    quantity: '' as number | string,
    unit: '',
    isPaid: true,
    legalBase: '',
    status: 'ATIVO' as 'ATIVO' | 'INATIVO',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ ...(search && { search }) })
      const res = await fetch(`/api/declaration-types?${params}`)
      const data = await res.json()
      setTypes(data.declarationTypes || [])
      setTotal(data.total || 0)
    } catch {
      toast('Erro ao carregar tipos de declaração', 'error')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function openNew() {
    setEditId(null)
    setForm({
      code: '',
      name: '',
      description: '',
      documentRequired: '',
      quantity: '',
      unit: 'dias consecutivos',
      isPaid: true,
      legalBase: 'CLT - Art. 473',
      status: 'ATIVO',
    })
    setShowModal(true)
  }

  function openEdit(item: DeclarationType) {
    setEditId(item.id)
    setForm({
      code: item.code,
      name: item.name,
      description: item.description,
      documentRequired: item.documentRequired || '',
      quantity: item.quantity !== null ? item.quantity : '',
      unit: item.unit || '',
      isPaid: item.isPaid,
      legalBase: item.legalBase || '',
      status: item.status,
    })
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.description) {
      toast('Preencha nome e descrição', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        code: form.code || form.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        quantity: form.quantity !== '' ? Number(form.quantity) : null,
      }

      const res = await fetch(editId ? `/api/declaration-types/${editId}` : '/api/declaration-types', {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        toast(editId ? 'Tipo de declaração atualizado!' : 'Novo tipo de declaração cadastrado!', 'success')
        setShowModal(false)
        fetchData()
      } else {
        toast(data.error || 'Erro ao salvar', 'error')
      }
    } catch {
      toast('Erro de comunicação', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/declaration-types/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast(data.softDeleted ? 'Declaração inativada' : 'Declaração removida', 'success')
        setDeleteTarget(null)
        fetchData()
      } else {
        toast(data.error || 'Erro ao excluir', 'error')
      }
    } catch {
      toast('Erro de conexão', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page-content animate-fade-in">
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title">Tipos de Declaração / Licenças CLT</h1>
          <p className="page-subtitle">
            Gerencie os motivos legais e tipos de declaração com amparo na legislação trabalhista (Art. 473 CLT).
          </p>
        </div>
        {canManage && (
          <button onClick={openNew} className="btn btn-primary">
            <Plus size={16} /> Novo Tipo de Declaração
          </button>
        )}
      </div>

      {/* Filter Card */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: 450 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
          <input
            type="text"
            placeholder="Pesquisar por nome, base legal ou descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
            <p>Carregando declarações...</p>
          </div>
        ) : types.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'hsl(var(--muted-foreground))' }}>
            <FileText size={42} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 500 }}>Nenhum tipo de declaração encontrado.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tipo / Motivo</th>
                  <th>Base Legal</th>
                  <th>Duração Padrão</th>
                  <th>Comprovante Exigido</th>
                  <th>Abonada</th>
                  <th>Status</th>
                  {canManage && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {types.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(var(--foreground))' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.15rem' }}>
                          {item.description}
                        </div>
                      </div>
                    </td>
                    <td>
                      {item.legalBase ? (
                        <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                          <Scale size={12} /> {item.legalBase}
                        </span>
                      ) : (
                        <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {item.quantity ? `${item.quantity} ${item.unit || 'dias'}` : item.unit || 'Tempo necessário'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', maxWidth: '240px' }} title={item.documentRequired || ''}>
                        {item.documentRequired || 'Comprovante emitido'}
                      </div>
                    </td>
                    <td>
                      {item.isPaid ? (
                        <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Sim (Abonada)</span>
                      ) : (
                        <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Não abonada</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'ATIVO' ? 'badge-success' : 'badge-gray'}`}>
                        {item.status}
                      </span>
                    </td>
                    {canManage && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button onClick={() => openEdit(item)} className="btn btn-ghost btn-icon btn-sm" title="Editar">
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="btn btn-ghost btn-icon btn-sm"
                            title="Inativar / Excluir"
                            style={{ color: 'hsl(var(--destructive))' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontWeight: 600 }}>{editId ? 'Editar Tipo de Declaração' : 'Novo Tipo de Declaração'}</h3>
                <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Nome da Declaração / Motivo *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Ex: Falecimento de Familiar, Licença Paternidade..."
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Código Interno</label>
                      <input
                        type="text"
                        value={form.code}
                        onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                        placeholder="Ex: falecimento_familiar (gerado auto)"
                        className="form-input"
                        disabled={!!editId}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Descrição Detalhada *</label>
                      <textarea
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Descrição da situação prevista para a ausência..."
                        className="form-input"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Base Legal (Legislação / Artigo)</label>
                      <input
                        type="text"
                        value={form.legalBase}
                        onChange={e => setForm(f => ({ ...f, legalBase: e.target.value }))}
                        placeholder="Ex: CLT, Art. 473, I"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Comprovante Exigido</label>
                      <input
                        type="text"
                        value={form.documentRequired}
                        onChange={e => setForm(f => ({ ...f, documentRequired: e.target.value }))}
                        placeholder="Ex: Certidão de óbito, atestado de comparecimento..."
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantidade de Dias/Consultas Padrão</label>
                      <input
                        type="number"
                        min="1"
                        value={form.quantity}
                        onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                        placeholder="Ex: 2 (deixe em branco se for variável)"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Unidade / Período</label>
                      <input
                        type="text"
                        value={form.unit}
                        onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                        placeholder="Ex: dias consecutivos, dia a cada 12 meses, tempo necessário"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                        <input
                          type="checkbox"
                          checked={form.isPaid}
                          onChange={e => setForm(f => ({ ...f, isPaid: e.target.checked }))}
                          style={{ width: 18, height: 18, accentColor: 'hsl(var(--primary))' }}
                        />
                        <span>Ausência Abonada (Remunerada sem desconto)</span>
                      </label>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value as 'ATIVO' | 'INATIVO' }))}
                        className="form-input"
                      >
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar Tipo de Declaração'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal Inativação/Exclusão */}
      {deleteTarget && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontWeight: 600, color: 'hsl(var(--destructive))' }}>⚠️ Confirmar Ação</h3>
                <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-icon">
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p>Deseja inativar / remover o tipo de declaração <strong>{deleteTarget.name}</strong>?</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                  Caso existam declarações registradas sob este motivo, o tipo será inativado para manter a integridade dos dados.
                </p>
              </div>
              <div className="modal-footer">
                <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
