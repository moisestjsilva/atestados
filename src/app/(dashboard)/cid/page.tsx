// src/app/(dashboard)/cid/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { can } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { toast } from '@/components/ui/toaster'
import { Plus, Search, Edit, Trash2, Loader2, Stethoscope, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface CidCode { id: string; code: string; description: string; status: string }

export default function CidPage() {
  const { data: session } = useSession()
  const role = (session?.user?.role || 'CONSULTOR') as UserRole
  const canCreate = can(role, 'cid:create')
  const canEdit = can(role, 'cid:edit')
  const canDelete = can(role, 'cid:delete')

  const [cids, setCids] = useState<CidCode[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ code: '', description: '', status: 'ATIVO' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CidCode | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20', ...(search && { search }) })
    const res = await fetch(`/api/cid?${params}`)
    const json = await res.json()
    setCids(json.cids || [])
    setTotal(json.total || 0)
    setPages(json.pages || 1)
    setLoading(false)
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search])

  async function handleSave() {
    if (!form.code || !form.description) { toast('Preencha código e descrição', 'error'); return }
    setSaving(true)
    const res = await fetch(editId ? `/api/cid/${editId}` : '/api/cid', {
      method: editId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      toast(editId ? 'CID atualizado!' : 'CID cadastrado!', 'success')
      setShowModal(false)
      fetchData()
    } else {
      const d = await res.json()
      toast(d.error || 'Erro', 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/cid/${deleteTarget.id}`, { method: 'DELETE' })
    if (res.ok) {
      const d = await res.json()
      toast(d.inactivated ? 'CID inativado (possui atestados vinculados)' : 'CID excluído', 'success')
      setDeleteTarget(null)
      fetchData()
    } else {
      const d = await res.json()
      toast(d.error || 'Erro', 'error')
    }
  }

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">CID — Classificação Internacional de Doenças</h1>
          <p className="page-subtitle">{total} CID(s) cadastrado(s)</p>
        </div>
        {canCreate && (
          <button id="btn-novo-cid" onClick={() => { setEditId(null); setForm({ code: '', description: '', status: 'ATIVO' }); setShowModal(true) }} className="btn btn-primary">
            <Plus size={16} />Novo CID
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
          <input type="text" placeholder="Pesquisar por código ou descrição..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: '2.25rem' }} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={28} className="animate-spin" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Código</th><th>Descrição</th><th>Status</th>{(canEdit || canDelete) && <th>Ações</th>}</tr>
              </thead>
              <tbody>
                {cids.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                    <Stethoscope size={48} style={{ opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
                    Nenhum CID encontrado
                  </td></tr>
                ) : cids.map(cid => (
                  <tr key={cid.id}>
                    <td><span className="badge badge-info">{cid.code}</span></td>
                    <td style={{ fontSize: '0.875rem' }}>{cid.description}</td>
                    <td><span className={`badge ${cid.status === 'ATIVO' ? 'badge-success' : 'badge-gray'}`}>{cid.status}</span></td>
                    {(canEdit || canDelete) && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          {canEdit && <button onClick={() => { setEditId(cid.id); setForm({ code: cid.code, description: cid.description, status: cid.status }); setShowModal(true) }} className="btn btn-ghost btn-icon btn-sm"><Edit size={15} /></button>}
                          {canDelete && <button onClick={() => setDeleteTarget(cid)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'hsl(var(--destructive))' }}><Trash2 size={15} /></button>}
                        </div>
                      </td>
                    )}
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>{editId ? 'Editar CID' : 'Novo CID'}</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Código *</label>
                  <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="form-input" placeholder="Ex: J06.9" />
                </div>
                <div className="form-group">
                  <label className="form-label">Descrição *</label>
                  <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="form-input" placeholder="Descrição do CID" />
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
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>Excluir CID</h3>
              <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p>Excluir o CID <strong>{deleteTarget.code}</strong>?</p>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>Se houver atestados vinculados, o CID será inativado em vez de excluído.</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleDelete} className="btn btn-danger">Excluir / Inativar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
