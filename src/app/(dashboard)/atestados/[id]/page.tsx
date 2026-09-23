// src/app/(dashboard)/atestados/[id]/page.tsx
'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Calendar, Clock, User, Building2,
  Stethoscope, Shield, Edit, Trash2, Printer, Download,
  CheckCircle, AlertCircle, Loader2, X, ExternalLink,
  ZoomIn, Maximize2, Eye
} from 'lucide-react'
import { formatCpf, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import { useSession } from 'next-auth/react'
import { can } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { ModalPortal } from '@/components/ui/modal-portal'
import { CidAutocomplete } from '@/components/ui/cid-autocomplete'

interface CertificateDetails {
  id: string
  certificateDate: string
  startDate: string
  endDate: string
  daysOff: number
  doctor: string | null
  crm: string | null
  cidDescription: string | null
  observations: string | null
  status: string
  createdAt: string
  updatedAt: string
  employee: {
    id: string
    name: string
    cpf: string
    matricula: string | null
    cargo: string | null
    department: {
      id: string
      name: string
      code: string
    }
  }
  cid: {
    id: string
    code: string
    description: string
  } | null
  files: Array<{
    id: string
    originalName: string
    mimeType: string
    sizeBytes: number
    uploadedAt: string
  }>
  registeredBy: {
    name: string
  } | null
}

export default function CertificateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const role = (session?.user?.role || 'CONSULTOR') as UserRole

  const canEdit = can(role, 'certificates:edit')
  const canDelete = can(role, 'certificates:delete')

  const [cert, setCert] = useState<CertificateDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    doctor: '',
    crm: '',
    certificateDate: '',
    startDate: '',
    endDate: '',
    daysOff: 1,
    observations: '',
    cidId: '',
    cidDescription: '',
  })

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Document Preview / Lightbox State
  const [previewFile, setPreviewFile] = useState<{ id: string; originalName: string; mimeType: string } | null>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setPreviewFile(null)
    }
    if (previewFile) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [previewFile])

  useEffect(() => {
    async function fetchCert() {
      try {
        setLoading(true)
        const res = await fetch(`/api/certificates/${id}`)
        if (!res.ok) {
          throw new Error('Atestado não encontrado')
        }
        const data = await res.json()
        setCert(data)
        setEditForm({
          doctor: data.doctor || '',
          crm: data.crm || '',
          certificateDate: data.certificateDate ? data.certificateDate.split('T')[0] : '',
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          endDate: data.endDate ? data.endDate.split('T')[0] : '',
          daysOff: data.daysOff || 1,
          observations: data.observations || '',
          cidId: data.cid?.id || '',
          cidDescription: data.cid ? `${data.cid.code} - ${data.cid.description}` : (data.cidDescription || ''),
        })
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar atestado')
      } finally {
        setLoading(false)
      }
    }
    fetchCert()
  }, [id])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (res.ok) {
        toast('Atestado atualizado com sucesso!', 'success')
        setShowEditModal(false)
        // Refresh data
        setCert(prev => prev ? { ...prev, ...editForm } : prev)
      } else {
        toast(data.error || 'Erro ao atualizar', 'error')
      }
    } catch {
      toast('Erro de conexão ao atualizar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/certificates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast('Atestado excluído com sucesso', 'success')
        router.push('/atestados')
      } else {
        const data = await res.json()
        toast(data.error || 'Erro ao excluir', 'error')
      }
    } catch {
      toast('Erro ao comunicar com o servidor', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'hsl(var(--primary))', margin: '0 auto 1rem' }} />
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Carregando detalhes do atestado...</p>
        </div>
      </div>
    )
  }

  if (error || !cert) {
    return (
      <div className="page-content">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: 500, margin: '2rem auto' }}>
          <AlertCircle size={44} style={{ color: 'hsl(var(--destructive))', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{error || 'Não encontrado'}</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>
            O atestado solicitado não foi encontrado ou você não possui permissão para acessá-lo.
          </p>
          <Link href="/atestados" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Voltar para lista de atestados
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
            <Link href="/atestados" style={{ color: 'inherit', textDecoration: 'none' }}>Atestados</Link>
            <span>/</span>
            <span style={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}>Detalhes #{cert.id.slice(-6).toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Atestado Médico</h1>
            <span className={`badge ${cert.status === 'ATIVO' ? 'badge-success' : 'badge-danger'}`}>
              {cert.status === 'ATIVO' ? 'Ativo' : 'Excluído'}
            </span>
            <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
              {cert.daysOff} {cert.daysOff === 1 ? 'dia de afastamento' : 'dias de afastamento'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/atestados" className="btn btn-secondary">
            <ArrowLeft size={16} /> Voltar
          </Link>
          <button onClick={() => window.print()} className="btn btn-secondary" title="Imprimir registro">
            <Printer size={16} /> Imprimir
          </button>
          {canEdit && (
            <button onClick={() => setShowEditModal(true)} className="btn btn-primary">
              <Edit size={16} /> Editar
            </button>
          )}
          {canDelete && (
            <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger">
              <Trash2 size={16} /> Excluir
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Card 1: Funcionário */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid hsl(var(--border) / 0.6)', paddingBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Dados do Funcionário</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Informações do colaborador</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <span className="form-label" style={{ fontSize: '0.75rem' }}>Nome Completo</span>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'hsl(var(--foreground))' }}>
                <Link href={`/funcionarios/${cert.employee.id}`} style={{ color: 'hsl(var(--primary))', textDecoration: 'none' }}>
                  {cert.employee.name}
                </Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>CPF</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 500 }}>
                  {formatCpf(cert.employee.cpf)}
                </div>
              </div>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Matrícula</span>
                <div style={{ fontSize: '0.9rem' }}>{cert.employee.matricula || '—'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Setor</span>
                <div>
                  <span className="badge badge-info">{cert.employee.department.name}</span>
                </div>
              </div>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Cargo</span>
                <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
                  {cert.employee.cargo || '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Período e Prazos */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid hsl(var(--border) / 0.6)', paddingBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'hsl(38 92% 50% / 0.12)', color: 'hsl(38 92% 45%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Período de Afastamento</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Datas e duração</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Data de Emissão</span>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{formatDate(cert.certificateDate)}</div>
              </div>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Total Afastado</span>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'hsl(38 92% 45%)' }}>
                  {cert.daysOff} {cert.daysOff === 1 ? 'dia' : 'dias'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'hsl(var(--secondary) / 0.5)', padding: '0.875rem', borderRadius: '8px' }}>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Início do Afastamento</span>
                <div style={{ fontWeight: 600 }}>{formatDate(cert.startDate)}</div>
              </div>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Término do Afastamento</span>
                <div style={{ fontWeight: 600 }}>{formatDate(cert.endDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Informações Médicas */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid hsl(var(--border) / 0.6)', paddingBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'hsl(142 71% 45% / 0.12)', color: 'hsl(142 71% 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Dados Médicos e CID</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Diagnóstico e profissional</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <span className="form-label" style={{ fontSize: '0.75rem' }}>CID Registrado</span>
              {cert.cid ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cert.cid.code}</span>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground))' }}>{cert.cid.description}</span>
                </div>
              ) : cert.cidDescription ? (
                <div style={{ fontSize: '0.9rem' }}>{cert.cidDescription}</div>
              ) : (
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>Não especificado</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>Médico Responsável</span>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{cert.doctor || '—'}</div>
              </div>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem' }}>CRM</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{cert.crm || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Documentos Anexos */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid hsl(var(--border) / 0.6)', paddingBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'hsl(260 91% 60% / 0.12)', color: 'hsl(260 91% 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Documentos & Arquivos</h2>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Comprovantes digitalizados</span>
            </div>
          </div>

          {cert.files && cert.files.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cert.files.map(f => {
                const isImage = f.mimeType.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(f.originalName)
                const isPdf = f.mimeType === 'application/pdf' || /\.pdf$/i.test(f.originalName)

                return (
                  <div
                    key={f.id}
                    style={{
                      borderRadius: '10px',
                      border: '1px solid hsl(var(--border))',
                      background: 'hsl(var(--secondary) / 0.25)',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    {/* Header info */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0.875rem',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
                        <FileText size={18} style={{ color: 'hsl(var(--primary))', flexShrink: 0 }} />
                        <div style={{ overflow: 'hidden' }}>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              maxWidth: '180px',
                            }}
                            title={f.originalName}
                          >
                            {f.originalName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                            {(f.sizeBytes / 1024).toFixed(1)} KB • {formatDate(f.uploadedAt)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => setPreviewFile(f)}
                          className="btn btn-secondary btn-sm"
                          title="Visualizar ampliado"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        >
                          <Eye size={13} /> Abrir
                        </button>
                        <a
                          href={`/api/files/${f.id}?download=true`}
                          className="btn btn-secondary btn-sm"
                          title="Baixar arquivo"
                          style={{ display: 'inline-flex', alignItems: 'center', padding: '0.35rem 0.5rem' }}
                        >
                          <Download size={13} />
                        </a>
                      </div>
                    </div>

                    {/* Visual Thumbnail Area */}
                    {isImage ? (
                      <div
                        onClick={() => setPreviewFile(f)}
                        style={{
                          position: 'relative',
                          borderTop: '1px solid hsl(var(--border) / 0.6)',
                          background: 'hsl(var(--card))',
                          height: '220px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          overflow: 'hidden',
                        }}
                        title="Clique para ampliar o atestado"
                      >
                        <img
                          src={`/api/files/${f.id}`}
                          alt={f.originalName}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            display: 'block',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                        {/* Hover Overlay */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.45)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            color: '#ffffff',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                        >
                          <ZoomIn size={26} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.02em' }}>Clique para ampliar</span>
                        </div>
                      </div>
                    ) : isPdf ? (
                      <div
                        style={{
                          position: 'relative',
                          borderTop: '1px solid hsl(var(--border) / 0.6)',
                          background: 'hsl(var(--card))',
                          height: '240px',
                          overflow: 'hidden',
                        }}
                      >
                        <iframe
                          src={`/api/files/${f.id}#toolbar=0&navpanes=0&scrollbar=0`}
                          style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                          title={f.originalName}
                        />
                        <div
                          onClick={() => setPreviewFile(f)}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.45)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)')}
                          title="Clique para visualizar PDF completo"
                        >
                          <span
                            className="btn btn-primary btn-sm"
                            style={{ pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                          >
                            <Maximize2 size={14} /> Ver PDF em tela cheia
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
              Nenhum documento anexado a este atestado.
            </div>
          )}
        </div>

        {/* Card 5: Observações e Registro */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Observações</h2>
          <div
            style={{
              padding: '0.875rem',
              borderRadius: '8px',
              background: 'hsl(var(--secondary) / 0.3)',
              border: '1px solid hsl(var(--border) / 0.6)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: cert.observations ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              minHeight: '60px',
            }}
          >
            {cert.observations || 'Nenhuma observação informada.'}
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid hsl(var(--border) / 0.5)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
            <span>Registrado por: <strong>{cert.registeredBy?.name || 'Sistema'}</strong></span>
            <span>Data de cadastro: <strong>{new Date(cert.createdAt).toLocaleString('pt-BR')}</strong></span>
            <span>Última atualização: <strong>{new Date(cert.updatedAt).toLocaleString('pt-BR')}</strong></span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>Editar Atestado</h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Data do Atestado *</label>
                    <input
                      type="date"
                      value={editForm.certificateDate}
                      onChange={e => setEditForm(f => ({ ...f, certificateDate: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dias de Afastamento *</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.daysOff}
                      onChange={e => setEditForm(f => ({ ...f, daysOff: parseInt(e.target.value) || 1 }))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data Inicial</label>
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data Final</label>
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">CID (Código ou Diagnóstico)</label>
                    <CidAutocomplete
                      key={cert.id}
                      initialCidId={editForm.cidId}
                      initialCode={cert.cid?.code}
                      initialDescription={editForm.cidDescription}
                      onSelect={(cid, text) => {
                        setEditForm(f => ({
                          ...f,
                          cidId: cid ? cid.id : '',
                          cidDescription: cid ? cid.description : text,
                        }))
                      }}
                    />
                    <span className="form-hint">Digite o código ou nome para alterar o CID deste atestado</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Médico</label>
                    <input
                      type="text"
                      value={editForm.doctor}
                      onChange={e => setEditForm(f => ({ ...f, doctor: e.target.value }))}
                      className="form-input"
                      placeholder="Nome do médico"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CRM</label>
                    <input
                      type="text"
                      value={editForm.crm}
                      onChange={e => setEditForm(f => ({ ...f, crm: e.target.value }))}
                      className="form-input"
                      placeholder="CRM"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Observações</label>
                    <textarea
                      value={editForm.observations}
                      onChange={e => setEditForm(f => ({ ...f, observations: e.target.value }))}
                      className="form-input"
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600, color: 'hsl(var(--destructive))' }}>⚠️ Excluir Atestado</h3>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir o atestado de <strong>{cert.employee.name}</strong> referente a {formatDate(cert.certificateDate)} ({cert.daysOff} dias)?</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                Esta ação realizará uma exclusão lógica preservando a auditoria.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Lightbox / Document Viewer Modal */}
      {previewFile && (
        <ModalPortal>
          <div
            className="modal-overlay"
            style={{ zIndex: 9999, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)' }}
            onClick={() => setPreviewFile(null)}
          >
            <div
              className="modal"
              style={{
                maxWidth: '94vw',
                width: '1050px',
                maxHeight: '94vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
                border: '1px solid hsl(var(--border) / 0.8)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1.25rem',
                  borderBottom: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <FileText size={20} style={{ color: 'hsl(var(--primary))', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {previewFile.originalName}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                      Comprovante digitalizado do atestado #{cert.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <a
                    href={`/api/files/${previewFile.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="Abrir em nova aba"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <ExternalLink size={14} /> Nova Aba
                  </a>
                  <a
                    href={`/api/files/${previewFile.id}?download=true`}
                    className="btn btn-secondary btn-sm"
                    title="Baixar arquivo original"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Download size={14} /> Baixar
                  </a>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="btn btn-ghost btn-icon"
                    title="Fechar (Esc)"
                    style={{ width: 32, height: 32, padding: 0 }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Viewer Content */}
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'hsl(var(--background) / 0.98)',
                  minHeight: '450px',
                  maxHeight: 'calc(94vh - 65px)',
                  padding: '1.25rem',
                }}
              >
                {previewFile.mimeType.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(previewFile.originalName) ? (
                  <img
                    src={`/api/files/${previewFile.id}`}
                    alt={previewFile.originalName}
                    style={{
                      maxWidth: '100%',
                      maxHeight: 'calc(94vh - 100px)',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                    }}
                  />
                ) : (
                  <iframe
                    src={`/api/files/${previewFile.id}`}
                    style={{
                      width: '100%',
                      height: 'calc(94vh - 100px)',
                      border: 'none',
                      borderRadius: '6px',
                    }}
                    title={previewFile.originalName}
                  />
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  )
}
