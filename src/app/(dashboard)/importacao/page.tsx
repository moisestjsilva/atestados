// src/app/(dashboard)/importacao/page.tsx
'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet, FolderOpen, CheckCircle, AlertCircle, AlertTriangle, Loader2, Download, RotateCcw, Eye, ChevronRight, X, FileText } from 'lucide-react'
import { formatCpf, normalizeCpf, isValidCpf, extractCpfFromString, daysBetween } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'

type Step = 'upload-planilha' | 'validar' | 'upload-docs' | 'associar' | 'confirmar' | 'importando' | 'concluido'

interface SpreadsheetRow {
  index: number
  cpf: string
  normalizedCpf: string
  certificateDate: string
  startDate: string
  endDate: string
  daysOff: number
  cidCode: string
  cidDescription: string
  doctor: string
  crm: string
  observations: string
  status: 'OK' | 'ERRO' | 'AVISO'
  errors: string[]
  employeeId?: string
  employeeName?: string
  cidId?: string
}

interface FileMatch {
  fileName: string
  cpf: string | null
  valid: boolean
}

interface PreviewItem {
  rowIndex: number
  cpf: string
  employeeName: string
  certificateDate: string
  cidCode: string
  daysOff: number
  fileName: string | null
  status: 'OK' | 'ERRO' | 'SEM_DOCUMENTO' | 'PENDENTE' | 'DUPLICIDADE'
  errors: string[]
  employeeId?: string
  cidId?: string
  cidDescription?: string
  doctor?: string
  crm?: string
  observations?: string
  fileData?: string
  fileMime?: string
  fileOriginalName?: string
}

const STATUS_LABELS: Record<string, string> = {
  OK: '✅ OK',
  ERRO: '❌ Erro',
  SEM_DOCUMENTO: '⚠️ Sem documento',
  PENDENTE: '🔵 Pendente',
  DUPLICIDADE: '⚠️ Possível duplicidade',
}

const STATUS_CLASS: Record<string, string> = {
  OK: 'badge-success',
  ERRO: 'badge-danger',
  SEM_DOCUMENTO: 'badge-warning',
  PENDENTE: 'badge-info',
  DUPLICIDADE: 'badge-warning',
}

export default function ImportacaoPage() {
  const [step, setStep] = useState<Step>('upload-planilha')
  const [planilha, setPlanilha] = useState<File | null>(null)
  const [planilhaData, setPlanilhaData] = useState<SpreadsheetRow[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [fileMatches, setFileMatches] = useState<FileMatch[]>([])
  const [preview, setPreview] = useState<PreviewItem[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ imported: number; errors: number; pending: number; importId: string } | null>(null)
  const planilhaRef = useRef<HTMLInputElement>(null)
  const filesRef = useRef<HTMLInputElement>(null)

  const STEPS = [
    { key: 'upload-planilha', label: 'Planilha' },
    { key: 'validar', label: 'Validação' },
    { key: 'upload-docs', label: 'Documentos' },
    { key: 'confirmar', label: 'Confirmar' },
    { key: 'concluido', label: 'Concluído' },
  ]

  // ETAPA 1: Upload e validação da planilha
  async function handlePlanilha(file: File) {
    setPlanilha(file)
    setLoading(true)
    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/imports/validate-spreadsheet', { method: 'POST', body: form })
    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      toast(data.error || 'Erro ao ler planilha', 'error')
      return
    }

    const data = await res.json()
    setPlanilhaData(data.rows)
    setStep('validar')
  }

  // ETAPA 3: Upload e matching de documentos
  async function handleFiles(selectedFiles: File[]) {
    setFiles(selectedFiles)
    const matches: FileMatch[] = selectedFiles.map(f => {
      const cpf = extractCpfFromString(f.name)
      return { fileName: f.name, cpf: cpf && isValidCpf(cpf) ? normalizeCpf(cpf) : null, valid: !!cpf }
    })
    setFileMatches(matches)

    // Constrói preview de associação
    const fileMap = new Map<string, File[]>()
    for (let i = 0; i < selectedFiles.length; i++) {
      const match = matches[i]
      if (match.cpf) {
        const arr = fileMap.get(match.cpf) || []
        arr.push(selectedFiles[i])
        fileMap.set(match.cpf, arr)
      }
    }

    // Associa com planilha
    const previewItems: PreviewItem[] = []

    // Agrupa linhas da planilha por CPF
    const rowsByCpf = new Map<string, SpreadsheetRow[]>()
    for (const row of planilhaData) {
      if (row.status === 'OK' && row.normalizedCpf) {
        const arr = rowsByCpf.get(row.normalizedCpf) || []
        arr.push(row)
        rowsByCpf.set(row.normalizedCpf, arr)
      }
    }

    for (const [cpf, rows] of rowsByCpf.entries()) {
      const docFiles = fileMap.get(cpf) || []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const docFile = docFiles[i] || null

        let fileData: string | undefined
        let fileMime: string | undefined
        let fileOriginalName: string | undefined

        if (docFile) {
          const buffer = await docFile.arrayBuffer()
          fileData = btoa(String.fromCharCode(...new Uint8Array(buffer)))
          fileMime = docFile.type
          fileOriginalName = docFile.name
        }

        previewItems.push({
          rowIndex: row.index,
          cpf,
          employeeName: row.employeeName || '—',
          certificateDate: row.certificateDate,
          cidCode: row.cidCode,
          daysOff: row.daysOff,
          fileName: docFile?.name || null,
          status: docFile ? 'OK' : 'SEM_DOCUMENTO',
          errors: docFile ? [] : ['Documento não encontrado'],
          employeeId: row.employeeId,
          cidId: row.cidId,
          cidDescription: row.cidDescription,
          doctor: row.doctor,
          crm: row.crm,
          observations: row.observations,
          fileData,
          fileMime,
          fileOriginalName,
        })
      }
    }

    // Adiciona linhas com erro da planilha
    for (const row of planilhaData.filter(r => r.status === 'ERRO')) {
      previewItems.push({
        rowIndex: row.index,
        cpf: row.cpf,
        employeeName: row.employeeName || '—',
        certificateDate: row.certificateDate,
        cidCode: row.cidCode,
        daysOff: row.daysOff,
        fileName: null,
        status: 'ERRO',
        errors: row.errors,
      })
    }

    setPreview(previewItems)
    setStep('confirmar')
  }

  // ETAPA final: Importação
  async function executeImport() {
    const validRows = preview.filter(p => p.status === 'OK' || p.status === 'SEM_DOCUMENTO')
    if (validRows.length === 0) { toast('Nenhum registro válido para importar', 'error'); return }

    setStep('importando')
    setProgress(0)

    const rows = validRows.map(r => ({
      index: r.rowIndex,
      employeeId: r.employeeId!,
      cpf: r.cpf,
      cidId: r.cidId,
      cidDescription: r.cidDescription,
      doctor: r.doctor,
      crm: r.crm,
      certificateDate: r.certificateDate,
      startDate: r.certificateDate,
      endDate: r.certificateDate,
      daysOff: r.daysOff,
      observations: r.observations,
      fileName: r.fileName,
      fileData: r.fileData,
      fileMime: r.fileMime,
      fileOriginalName: r.fileOriginalName,
    }))

    // Progresso simulado
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 90))
    }, 300)

    const res = await fetch('/api/imports/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, spreadsheetName: planilha?.name || 'importacao' }),
    })

    clearInterval(progressInterval)
    setProgress(100)

    const data = await res.json()
    setResult(data)
    setStep('concluido')
  }

  function reset() {
    setStep('upload-planilha')
    setPlanilha(null)
    setPlanilhaData([])
    setFiles([])
    setFileMatches([])
    setPreview([])
    setProgress(0)
    setResult(null)
  }

  const filteredPreview = preview.filter(p =>
    filterStatus === 'all' || p.status === filterStatus
  )

  const okCount = preview.filter(p => p.status === 'OK').length
  const semDocCount = preview.filter(p => p.status === 'SEM_DOCUMENTO').length
  const errorCount = preview.filter(p => p.status === 'ERRO').length

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Importação em Massa de Atestados</h1>
          <p className="page-subtitle">Importe centenas de atestados com Excel + documentos automaticamente</p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => {
          const isDone = STEPS.findIndex(x => x.key === step) > i
          const isCurrent = s.key === step || (step === 'importando' && s.key === 'confirmar')
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 1rem', borderRadius: 20,
                background: isDone ? 'hsl(142 71% 45% / 0.15)' : isCurrent ? 'hsl(var(--primary) / 0.15)' : 'hsl(var(--secondary))',
                color: isDone ? 'hsl(142 71% 45%)' : isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                fontSize: '0.8125rem', fontWeight: isCurrent ? 600 : 400,
                border: isCurrent ? '1px solid hsl(var(--primary) / 0.4)' : '1px solid transparent',
              }}>
                {isDone ? <CheckCircle size={14} /> : <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'currentColor', opacity: 0.3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700 }}>{i + 1}</span>}
                {s.label}
              </div>
              {i < STEPS.length - 1 && <ChevronRight size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />}
            </div>
          )
        })}
      </div>

      {/* ETAPA 1: Upload planilha */}
      {step === 'upload-planilha' && (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📊 Passo 1 — Selecione a planilha Excel</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', fontSize: '0.875rem' }}>
            A planilha deve conter: CPF, DATA_ATESTADO, DATA_INICIO, DATA_FIM, DIAS_AFASTAMENTO, CID, MEDICO, CRM
          </p>

          <div className="dropzone" onClick={() => planilhaRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('active') }}
            onDragLeave={e => e.currentTarget.classList.remove('active')}
            onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('active'); const f = e.dataTransfer.files[0]; if (f) handlePlanilha(f) }}
          >
            {loading ? (
              <><Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'hsl(var(--primary))' }} /><p>Lendo planilha...</p></>
            ) : (
              <>
                <FileSpreadsheet size={48} style={{ margin: '0 auto 1rem', color: 'hsl(var(--primary))' }} />
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>ARRASTE A PLANILHA AQUI</p>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>ou clique para selecionar</p>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem', marginTop: '0.5rem' }}>Aceito: .xlsx, .xls, .csv</p>
              </>
            )}
          </div>
          <input ref={planilhaRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handlePlanilha(f) }} />

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <a href="/api/imports/template" className="btn btn-secondary btn-sm"><Download size={14} />Baixar modelo da planilha</a>
          </div>
        </div>
      )}

      {/* ETAPA 2: Validação */}
      {step === 'validar' && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div className="stat-card" style={{ flex: '1 1 140px' }}>
              <div className="stat-icon" style={{ background: 'hsl(var(--secondary))' }}><FileSpreadsheet size={20} /></div>
              <div className="stat-value">{planilhaData.length}</div>
              <div className="stat-label">Total de registros</div>
            </div>
            <div className="stat-card" style={{ flex: '1 1 140px' }}>
              <div className="stat-icon" style={{ background: 'hsl(142 71% 45% / 0.15)' }}><CheckCircle size={20} style={{ color: 'hsl(142 71% 45%)' }} /></div>
              <div className="stat-value" style={{ color: 'hsl(142 71% 45%)' }}>{planilhaData.filter(r => r.status === 'OK').length}</div>
              <div className="stat-label">Válidos</div>
            </div>
            <div className="stat-card" style={{ flex: '1 1 140px' }}>
              <div className="stat-icon" style={{ background: 'hsl(0 72% 51% / 0.15)' }}><AlertCircle size={20} style={{ color: 'hsl(0 72% 51%)' }} /></div>
              <div className="stat-value" style={{ color: 'hsl(0 72% 51%)' }}>{planilhaData.filter(r => r.status === 'ERRO').length}</div>
              <div className="stat-label">Com erro</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="table-wrapper" style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table>
                <thead><tr><th>#</th><th>CPF</th><th>Funcionário</th><th>Data</th><th>CID</th><th>Dias</th><th>Status</th></tr></thead>
                <tbody>
                  {planilhaData.slice(0, 50).map(row => (
                    <tr key={row.index}>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>{row.index}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{formatCpf(row.normalizedCpf)}</td>
                      <td style={{ fontSize: '0.875rem' }}>{row.employeeName || <span style={{ color: 'hsl(var(--destructive))' }}>Não encontrado</span>}</td>
                      <td style={{ fontSize: '0.8rem' }}>{row.certificateDate}</td>
                      <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{row.cidCode}</span></td>
                      <td style={{ textAlign: 'center' }}>{row.daysOff}</td>
                      <td>
                        <span className={`badge ${row.status === 'OK' ? 'badge-success' : row.status === 'AVISO' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                          {row.status === 'OK' ? '✅ OK' : row.errors[0] || row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setStep('upload-planilha')} className="btn btn-secondary">← Voltar</button>
            <button onClick={() => setStep('upload-docs')} className="btn btn-primary" disabled={planilhaData.filter(r => r.status === 'OK').length === 0}>
              Próximo: Selecionar documentos →
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: Upload documentos */}
      {step === 'upload-docs' && (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📁 Passo 3 — Selecione os documentos dos atestados</h2>
          <div className="alert alert-info" style={{ marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
            <div>
              <strong>Como nomear os arquivos:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                <li>12345678900.pdf</li>
                <li>ATESTADO_12345678900.jpg</li>
                <li>12345678900_01.pdf (múltiplos)</li>
              </ul>
              O sistema identifica automaticamente o CPF pelo nome do arquivo.
            </div>
          </div>

          <div className="dropzone" onClick={() => filesRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('active') }}
            onDragLeave={e => e.currentTarget.classList.remove('active')}
            onDrop={e => {
              e.preventDefault()
              e.currentTarget.classList.remove('active')
              const selected = Array.from(e.dataTransfer.files).filter(f => /\.(pdf|jpg|jpeg|png)$/i.test(f.name))
              if (selected.length) handleFiles(selected)
            }}
          >
            <FolderOpen size={48} style={{ margin: '0 auto 1rem', color: 'hsl(var(--primary))' }} />
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>SELECIONE A PASTA DOS ATESTADOS</p>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Arraste os arquivos ou clique para selecionar</p>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem', marginTop: '0.5rem' }}>PDF, JPG, JPEG, PNG</p>
          </div>
          <input ref={filesRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
            onChange={e => { const selected = Array.from(e.target.files || []); if (selected.length) handleFiles(selected) }} />

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button onClick={() => setStep('validar')} className="btn btn-secondary">← Voltar</button>
            <button onClick={() => handleFiles([])} className="btn btn-ghost btn-sm">Pular (sem documentos)</button>
          </div>
        </div>
      )}

      {/* ETAPA 4: Preview e confirmação */}
      {step === 'confirmar' && (
        <div>
          {/* Resumo */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div className="stat-card" style={{ flex: '1 1 120px', cursor: 'pointer', border: filterStatus === 'OK' ? '1px solid hsl(142 71% 45%)' : undefined }} onClick={() => setFilterStatus(filterStatus === 'OK' ? 'all' : 'OK')}>
              <div className="stat-value" style={{ color: 'hsl(142 71% 45%)' }}>{okCount}</div>
              <div className="stat-label">✅ Prontos</div>
            </div>
            <div className="stat-card" style={{ flex: '1 1 120px', cursor: 'pointer', border: filterStatus === 'SEM_DOCUMENTO' ? '1px solid hsl(38 92% 50%)' : undefined }} onClick={() => setFilterStatus(filterStatus === 'SEM_DOCUMENTO' ? 'all' : 'SEM_DOCUMENTO')}>
              <div className="stat-value" style={{ color: 'hsl(38 92% 50%)' }}>{semDocCount}</div>
              <div className="stat-label">⚠️ Sem documento</div>
            </div>
            <div className="stat-card" style={{ flex: '1 1 120px', cursor: 'pointer', border: filterStatus === 'ERRO' ? '1px solid hsl(0 72% 51%)' : undefined }} onClick={() => setFilterStatus(filterStatus === 'ERRO' ? 'all' : 'ERRO')}>
              <div className="stat-value" style={{ color: 'hsl(0 72% 51%)' }}>{errorCount}</div>
              <div className="stat-label">❌ Erros</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 600 }}>Prévia da Importação</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'OK', 'SEM_DOCUMENTO', 'ERRO'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}>
                    {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-wrapper" style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table>
                <thead><tr><th>CPF</th><th>Funcionário</th><th>Data</th><th>CID</th><th>Dias</th><th>Arquivo</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredPreview.map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{formatCpf(item.cpf)}</td>
                      <td style={{ fontSize: '0.875rem' }}>{item.employeeName}</td>
                      <td style={{ fontSize: '0.8rem' }}>{item.certificateDate}</td>
                      <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{item.cidCode || '—'}</span></td>
                      <td style={{ textAlign: 'center' }}>{item.daysOff}</td>
                      <td style={{ fontSize: '0.75rem', color: item.fileName ? 'hsl(142 71% 45%)' : 'hsl(var(--muted-foreground))' }}>
                        {item.fileName ? <><FileText size={12} style={{ display: 'inline', marginRight: 4 }} />{item.fileName.slice(-20)}</> : '—'}
                      </td>
                      <td><span className={`badge ${STATUS_CLASS[item.status]}`} style={{ fontSize: '0.7rem' }}>{STATUS_LABELS[item.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            Serão importados <strong>{okCount + semDocCount}</strong> atestado(s). Registros com erro ({errorCount}) serão ignorados.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('upload-docs')} className="btn btn-secondary">← Voltar</button>
            <button id="btn-importar" onClick={executeImport} className="btn btn-primary btn-lg" disabled={okCount + semDocCount === 0}>
              <Upload size={16} />IMPORTAR {okCount + semDocCount} ATESTADOS
            </button>
          </div>
        </div>
      )}

      {/* Importando */}
      {step === 'importando' && (
        <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 1.5rem', color: 'hsl(var(--primary))' }} />
          <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>IMPORTANDO...</h2>
          <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>{progress}% concluído</p>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', marginTop: '0.5rem' }}>Não feche esta janela</p>
        </div>
      )}

      {/* Concluído */}
      {step === 'concluido' && result && (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ width: 72, height: 72, background: 'hsl(142 71% 45% / 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={36} style={{ color: 'hsl(142 71% 45%)' }} />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '1rem' }}>IMPORTAÇÃO CONCLUÍDA</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div className="stat-card" style={{ minWidth: 130 }}>
              <div className="stat-value" style={{ color: 'hsl(142 71% 45%)' }}>✅ {result.imported}</div>
              <div className="stat-label">Atestados importados</div>
            </div>
            {result.errors > 0 && (
              <div className="stat-card" style={{ minWidth: 130 }}>
                <div className="stat-value" style={{ color: 'hsl(0 72% 51%)' }}>❌ {result.errors}</div>
                <div className="stat-label">Erros</div>
              </div>
            )}
            {result.pending > 0 && (
              <div className="stat-card" style={{ minWidth: 130 }}>
                <div className="stat-value" style={{ color: 'hsl(38 92% 50%)' }}>⚠️ {result.pending}</div>
                <div className="stat-label">Pendências</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} className="btn btn-secondary">
              <RotateCcw size={16} />Nova Importação
            </button>
            <a href="/atestados" className="btn btn-primary">
              <Eye size={16} />Ver Atestados
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
