// src/app/(dashboard)/configuracoes/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Settings, Save, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/toaster'

interface SystemSettings {
  companyName: string
  maxUploadMb: number
  allowedExtensions: string
  itemsPerPage: number
}

export default function ConfiguracoesPage() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  const [settings, setSettings] = useState<SystemSettings>({ companyName: '', maxUploadMb: 10, allowedExtensions: 'pdf,jpg,jpeg,png', itemsPerPage: 20 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { setSettings(d); setLoading(false) })
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    if (res.ok) toast('Configurações salvas!', 'success')
    else toast('Erro ao salvar', 'error')
  }

  if (!isSuperAdmin) {
    return (
      <div className="page-content">
        <div className="alert alert-warning">⚠️ Acesso restrito ao Super Admin</div>
      </div>
    )
  }

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações do Sistema</h1>
          <p className="page-subtitle">Configurações gerais da aplicação</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={28} className="animate-spin" /></div>
      ) : (
        <div style={{ maxWidth: 600 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} style={{ color: 'hsl(var(--primary))' }} />
              <h2 style={{ fontWeight: 600 }}>Configurações Gerais</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Nome da empresa</label>
                <input type="text" className="form-input" value={settings.companyName} onChange={e => setSettings(s => ({ ...s, companyName: e.target.value }))} placeholder="Nome da empresa" />
              </div>
              <div className="form-group">
                <label className="form-label">Limite de upload (MB)</label>
                <input type="number" min="1" max="100" className="form-input" value={settings.maxUploadMb} onChange={e => setSettings(s => ({ ...s, maxUploadMb: parseInt(e.target.value) }))} />
                <span className="form-hint">Tamanho máximo por arquivo enviado</span>
              </div>
              <div className="form-group">
                <label className="form-label">Extensões permitidas</label>
                <input type="text" className="form-input" value={settings.allowedExtensions} onChange={e => setSettings(s => ({ ...s, allowedExtensions: e.target.value }))} placeholder="pdf,jpg,jpeg,png" />
                <span className="form-hint">Separadas por vírgula, sem espaços</span>
              </div>
              <div className="form-group">
                <label className="form-label">Itens por página</label>
                <select className="form-input" value={settings.itemsPerPage} onChange={e => setSettings(s => ({ ...s, itemsPerPage: parseInt(e.target.value) }))}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                {saving ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : <><Save size={14} />Salvar configurações</>}
              </button>
            </div>
          </div>

          {/* Info box */}
          <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
            <div>
              <strong>Informações do sistema</strong>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span>📂 Armazenamento: <code>./uploads/atestados/</code></span>
                <span>🔐 Autenticação: JWT com expiração de 8h</span>
                <span>🗄️ Banco de dados: PostgreSQL + Prisma</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
