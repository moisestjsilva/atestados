// src/app/(dashboard)/setores/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { can } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { toast } from '@/components/ui/toaster'
import { Plus, Edit, Trash2, Loader2, Building2, X } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'

interface Department {
  id: string; code: string; name: string; status: string
  employeeCount: number; certificateCount: number; totalDaysOff: number
}

export default function SetoresPage() {
  const { data: session } = useSession()
  const role = (session?.user?.role || 'CONSULTOR') as UserRole
  const canCreate = can(role, 'departments:create')
  const canEdit = can(role, 'departments:edit')
  const canDelete = can(role, 'departments:delete')

  const [depts, setDepts] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', name: '', status: 'ATIVO' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/departments')
    const json = await res.json()
    setDepts(json.departments || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSave() {
    if (!form.code || !form.name) { toast('Preencha código e nome', 'error'); return }
    setSaving(true)
    const res = await fetch(editId ? `/api/departments/${editId}` : '/api/departments', {
      method: editId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      toast(editId ? 'Setor atualizado!' : 'Setor cadastrado!', 'success')
      setShowModal(false)
      setEditId(null)
      setForm({ code: '', name: '', status: 'ATIVO' })
      fetchData()
    } else {
      const d = await res.json()
      toast(d.error || 'Erro', 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/departments/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) {
      toast('Setor excluído', 'success')
      setDeleteTarget(null)
      fetchData()
    } else {
      const d = await res.json()
      toast(d.error || 'Erro ao excluir', 'error')
    }
  }

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Setores</h1>
          <p className="page-subtitle">{depts.length} setor(es) cadastrado(s)</p>
        </div>
        {canCreate && (
          <button id="btn-novo-setor" onClick={() => { setEditId(null); setForm({ code: '', name: '', status: 'ATIVO' }); setShowModal(true) }} className="btn btn-primary">
            <Plus size={16} />Novo Setor
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={28} className="animate-spin" /></div>
        ) : depts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Building2 size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>Nenhum setor cadastrado</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Código</th><th>Setor</th><th style={{ textAlign: 'center' }}>Funcionários</th><th style={{ textAlign: 'center' }}>Atestados</th><th style={{ textAlign: 'center' }}>Dias afastados</th><th>Status</th>{(canEdit || canDelete) && <th>Ações</th>}</tr>
              </thead>
              <tbody>
                {depts.map(d => (
                  <tr key={d.id}>
                    <td><span className="badge badge-gray">{d.code}</span></td>
                    <td style={{ fontWeight: 500 }}>{d.name}</td>
                    <td style={{ textAlign: 'center' }}>{d.employeeCount}</td>
                    <td style={{ textAlign: 'center' }}>{d.certificateCount > 0 ? <span className="badge badge-warning">{d.certificateCount}</span> : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{d.totalDaysOff}d</td>
                    <td><span className={`badge ${d.status === 'ATIVO' ? 'badge-success' : 'badge-gray'}`}>{d.status}</span></td>
                    {(canEdit || canDelete) && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          {canEdit && <button onClick={() => { setEditId(d.id); setForm({ code: d.code, name: d.name, status: d.status }); setShowModal(true) }} className="btn btn-ghost btn-icon btn-sm"><Edit size={15} /></button>}
                          {canDelete && <button onClick={() => setDeleteTarget(d)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'hsl(var(--destructive))' }}><Trash2 size={15} /></button>}
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

      {showModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>{editId ? 'Editar Setor' : 'Novo Setor'}</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Código *</label>
                  <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="form-input" placeholder="Ex: TI, RH, ADM" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" placeholder="Nome do setor" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {deleteTarget && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600, color: 'hsl(var(--destructive))' }}>⚠️ Excluir Setor</h3>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir o setor <strong>{deleteTarget.name}</strong>?</p>
              {deleteTarget.employeeCount > 0 && (
                <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                  ❌ Este setor possui <strong>{deleteTarget.employeeCount}</strong> funcionário(s) vinculado(s) e não pode ser excluído. Transfira-os primeiro.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting || deleteTarget.employeeCount > 0} className="btn btn-danger">
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
