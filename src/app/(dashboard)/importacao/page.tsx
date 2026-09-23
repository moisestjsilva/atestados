// src/app/(dashboard)/importacao/page.tsx
'use client'
import { useState, useRef } from 'react'
import {
  Upload, FileSpreadsheet, FolderOpen, CheckCircle, AlertCircle, AlertTriangle,
  Loader2, Download, RotateCcw, Eye, ChevronRight, X, FileText
} from 'lucide-react'
import { formatCpf, normalizeCpf, isValidCpf, extractCpfFromString } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'

type Step = 'upload-planilha' | 'validar' | 'upload-docs' | 'confirmar' | 'importando' | 'concluido'

interface SpreadsheetRow {
  index: number
  cpf: string
  normalizedCpf: string
  employeeName?: string
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
  cidId?: string
  autoCreateEmployee?: boolean
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
  startDate?: string
  endDate?: string
  cidCode: string
  daysOff: number
  fileName: string | null
  status: 'OK' | 'ERRO' | 'SEM_DOCUMENTO' | 'PENDENTE' | 'DUPLICIDADE' | 'AVISO'
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
  AVISO: '⚠️ Aviso',
  ERRO: '❌ Erro',
  SEM_DOCUMENTO: '⚠️ Sem documento',
  PENDENTE: '🔵 Pendente',
  DUPLICIDADE: '⚠️ Possível duplicidade',
}

const STATUS_CLASS: Record<string, string> = {
  OK: 'badge-success',
  AVISO: 'badge-warning',
  ERRO: 'badge-danger',
  SEM_DOCUMENTO: 'badge-warning',
  PENDENTE: 'badge-info',
  DUPLICIDADE: 'badge-warning',
}

// Converte arquivo para Base64 de forma segura sem estourar pilha de memória
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
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

    try {
      const res = await fetch('/api/imports/validate-spreadsheet', { method: 'POST', body: form })
      setLoading(false)

      if (!res.ok) {
        const data = await res.json()
        toast(data.error || 'Erro ao processar planilha', 'error')
        return
      }

      const data = await res.json()
      setPlanilhaData(data.rows || [])
      setStep('validar')
      toast(`Planilha carregada: ${data.total} registro(s) encontrados`, 'success')
    } catch (err: any) {
      setLoading(false)
      toast('Erro de conexão ao enviar a planilha', 'error')
    }
  }

  // ETAPA 3: Upload e matching de documentos
  async function handleFiles(selectedFiles: File[]) {
    setFiles(selectedFiles)
    const matches: FileMatch[] = selectedFiles.map(f => {
      const cpf = extractCpfFromString(f.name)
      return { fileName: f.name, cpf: cpf && isValidCpf(cpf) ? normalizeCpf(cpf) : null, valid: !!cpf }
    })
    setFileMatches(matches)

    // Agrupa arquivos por CPF
    const fileMap = new Map<string, File[]>()
    for (let i = 0; i < selectedFiles.length; i++) {
      const match = matches[i]
      if (match.cpf) {
        const arr = fileMap.get(match.cpf) || []
        arr.push(selectedFiles[i])
        fileMap.set(match.cpf, arr)
      }
    }

    // Associa com os registros da planilha
    const previewItems: PreviewItem[] = []

    // Agrupa linhas válidas da planilha por CPF
    const rowsByCpf = new Map<string, SpreadsheetRow[]>()
    for (const row of planilhaData) {
      if (row.status !== 'ERRO' && row.normalizedCpf) {
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
          try {
            fileData = await fileToBase64(docFile)
            fileMime = docFile.type
            fileOriginalName = docFile.name
          } catch (err) {
            console.error('Erro ao ler arquivo:', err)
          }
        }

        const isDocMatched = !!docFile
        const itemStatus: PreviewItem['status'] = !isDocMatched
          ? 'SEM_DOCUMENTO'
          : row.status === 'AVISO'
          ? 'AVISO'
          : 'OK'

        previewItems.push({
          rowIndex: row.index,
          cpf,
          employeeName: row.employeeName || '—',
          certificateDate: row.certificateDate,
          startDate: row.startDate,
          endDate: row.endDate,
          cidCode: row.cidCode,
          daysOff: row.daysOff,
          fileName: docFile?.name || null,
          status: itemStatus,
          errors: isDocMatched ? (row.errors || []) : ['Documento não anexado', ...(row.errors || [])],
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

    // Adiciona linhas que tinham erro na planilha
    for (const row of planilhaData.filter(r => r.status === 'ERRO')) {
      previewItems.push({
        rowIndex: row.index,
        cpf: row.cpf,
        employeeName: row.employeeName || '—',
        certificateDate: row.certificateDate,
        startDate: row.startDate,
        endDate: row.endDate,
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

  // ETAPA final: Execução da importação
  async function executeImport() {
    const validRows = preview.filter(p => p.status === 'OK' || p.status === 'SEM_DOCUMENTO' || p.status === 'AVISO')
    if (validRows.length === 0) {
      toast('Nenhum registro apto para importação', 'error')
      return
    }

    setStep('importando')
    setProgress(0)

    const rows = validRows.map(r => ({
      index: r.rowIndex,
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      cpf: r.cpf,
      cidId: r.cidId,
      cidDescription: r.cidDescription,
      doctor: r.doctor,
      crm: r.crm,
      certificateDate: r.certificateDate,
      startDate: r.startDate || r.certificateDate,
      endDate: r.endDate || r.certificateDate,
      daysOff: r.daysOff,
      observations: r.observations,
      fileName: r.fileName,
      fileData: r.fileData,
      fileMime: r.fileMime,
      fileOriginalName: r.fileOriginalName,
    }))

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 3, 90))
    }, 250)

    try {
      const res = await fetch('/api/imports/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, spreadsheetName: planilha?.name || 'importacao' }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setStep('concluido')
        toast('Importação concluída com sucesso!', 'success')
      } else {
        const data = await res.json()
        toast(data.error || 'Erro ao processar importação', 'error')
        setStep('confirmar')
      }
    } catch {
      clearInterval(progressInterval)
      toast('Erro de comunicação com o servidor', 'error')
      setStep('confirmar')
    }
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
    if (planilhaRef.current) planilhaRef.current.value = ''
    if (filesRef.current) filesRef.current.value = ''
  }

  const filteredPreview = preview.filter(p =>
    filterStatus === 'all' || p.status === filterStatus
  )

  const okCount = preview.filter(p => p.status === 'OK' || p.status === 'AVISO').length
  const semDocCount = preview.filter(p => p.status === 'SEM_DOCUMENTO').length
  const errorCount = preview.filter(p => p.status === 'ERRO').length
  const totalReady = okCount + semDocCount

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Importação em Massa de Atestados</h1>
          <p className="page-subtitle">Importe centenas de atestados com Excel + documentos automaticamente</p>
        </div>
      </div>

      {/* Indicador de passos */}
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

      {/* PASSO 1: Upload da Planilha */}
      {step === 'upload-planilha' && (
        <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📊 Passo 1 — Selecione a planilha Excel</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            A planilha deve conter os cabeçalhos: <code>CPF</code>, <code>DATA_ATESTADO</code>, <code>DIAS_AFASTAMENTO</code>, <code>CID</code>, <code>MEDICO</code>, etc.
          </p>

          <div
            className="dropzone"
            onClick={() => planilhaRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('active') }}
            onDragLeave={e => e.currentTarget.classList.remove('active')}
            onDrop={e => {
              e.preventDefault()
              e.currentTarget.classList.remove('active')
              const f = e.dataTransfer.files[0]
              if (f) handlePlanilha(f)
            }}
          >
            {loading ? (
              <>
                <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'hsl(var(--primary))' }} />
                <p style={{ fontWeight: 600 }}>Lendo e validando planilha...</p>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', marginTop: '0.25rem' }}>Aguarde um instante</p>
              </>
            ) : (
              <>
                <FileSpreadsheet size={48} style={{ margin: '0 auto 1rem', color: 'hsl(var(--primary))' }} />
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>ARRASTE A PLANILHA AQUI</p>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>ou clique para selecionar</p>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem', marginTop: '0.5rem' }}>Aceito: .xlsx, .xls, .csv</p>
              </>
            )}
          </div>
          <input
            ref={planilhaRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handlePlanilha(f)
            }}
          />

          {/* Botões de Download do Modelo */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid hsl(var(--border) / 0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Precisa do modelo padrão para preencher?</span>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a
                href="/api/imports/template"
                download="modelo-importacao-atestados.xlsx"
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={15} />
                <span>Baixar Modelo Excel (.xlsx)</span>
              </a>
              <a
                href="/api/imports/template?format=csv"
                download="modelo-importacao-atestados.csv"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FileSpreadsheet size={15} />
                <span>Baixar Modelo CSV</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* PASSO 2: Validação da Planilha */}
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
              <div className="stat-icon" style={{ background: 'hsl(38 92% 50% / 0.15)' }}><AlertTriangle size={20} style={{ color: 'hsl(38 92% 50%)' }} /></div>
              <div className="stat-value" style={{ color: 'hsl(38 92% 50%)' }}>{planilhaData.filter(r => r.status === 'AVISO').length}</div>
              <div className="stat-label">Avisos</div>
            </div>
            <div className="stat-card" style={{ flex: '1 1 140px' }}>
              <div className="stat-icon" style={{ background: 'hsl(0 72% 51% / 0.15)' }}><AlertCircle size={20} style={{ color: 'hsl(0 72% 51%)' }} /></div>
              <div className="stat-value" style={{ color: 'hsl(0 72% 51%)' }}>{planilhaData.filter(r => r.status === 'ERRO').length}</div>
              <div className="stat-label">Com erro</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="table-wrapper" style={{ maxHeight: 420, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>CPF</th>
                    <th>Funcionário</th>
                    <th>Data Atestado</th>
                    <th>Período</th>
                    <th>CID</th>
                    <th>Dias</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {planilhaData.slice(0, 100).map(row => (
                    <tr key={row.index}>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>{row.index}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{formatCpf(row.normalizedCpf || row.cpf)}</td>
                      <td style={{ fontSize: '0.875rem' }}>
                        {row.employeeName ? (
                          <span>{row.employeeName}</span>
                        ) : (
                          <span style={{ color: 'hsl(var(--destructive))', fontSize: '0.8rem' }}>Não cadastrado</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{row.certificateDate || '—'}</td>
                      <td style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                        {row.startDate} até {row.endDate}
                      </td>
                      <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{row.cidCode || '—'}</span></td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.daysOff}</td>
                      <td>
                        <span className={`badge ${STATUS_CLASS[row.status]}`} style={{ fontSize: '0.7rem' }}>
                          {row.status === 'OK' ? '✅ OK' : row.errors[0] || row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setStep('upload-planilha')} className="btn btn-secondary">← Voltar</button>
            <button
              onClick={() => setStep('upload-docs')}
              className="btn btn-primary"
              disabled={planilhaData.filter(r => r.status !== 'ERRO').length === 0}
            >
              Próximo: Selecionar documentos →
            </button>
          </div>
        </div>
      )}

      {/* PASSO 3: Upload de Documentos */}
      {step === 'upload-docs' && (
        <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📁 Passo 3 — Selecione os documentos dos atestados</h2>
          <div className="alert alert-info" style={{ marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
            <div>
              <strong>Como nomear os arquivos para associação automática:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                <li><code>12345678900.pdf</code> ou <code>123.456.789-00.pdf</code></li>
                <li><code>ATESTADO_12345678900.jpg</code></li>
                <li><code>12345678900_01.png</code></li>
              </ul>
              O sistema detecta automaticamente o CPF no nome do arquivo.
            </div>
          </div>

          <div
            className="dropzone"
            onClick={() => filesRef.current?.click()}
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
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>SELECIONE OU ARRASTE OS ATESTADOS</p>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>PDF, JPG, JPEG ou PNG</p>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem', marginTop: '0.5rem' }}>Você pode selecionar múltiplos arquivos de uma vez</p>
          </div>
          <input
            ref={filesRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={e => {
              const selected = Array.from(e.target.files || [])
              if (selected.length) handleFiles(selected)
            }}
          />

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '1.25rem' }}>
            <button onClick={() => setStep('validar')} className="btn btn-secondary">← Voltar</button>
            <button onClick={() => handleFiles([])} className="btn btn-ghost btn-sm">
              Pular etapa de documentos (importar apenas dados) →
            </button>
          </div>
        </div>
      )}

      {/* PASSO 4: Prévia e Confirmação */}
      {step === 'confirmar' && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div
              className="stat-card"
              style={{ flex: '1 1 120px', cursor: 'pointer', border: filterStatus === 'OK' ? '1px solid hsl(142 71% 45%)' : undefined }}
              onClick={() => setFilterStatus(filterStatus === 'OK' ? 'all' : 'OK')}
            >
              <div className="stat-value" style={{ color: 'hsl(142 71% 45%)' }}>{okCount}</div>
              <div className="stat-label">✅ Com documento</div>
            </div>
            <div
              className="stat-card"
              style={{ flex: '1 1 120px', cursor: 'pointer', border: filterStatus === 'SEM_DOCUMENTO' ? '1px solid hsl(38 92% 50%)' : undefined }}
              onClick={() => setFilterStatus(filterStatus === 'SEM_DOCUMENTO' ? 'all' : 'SEM_DOCUMENTO')}
            >
              <div className="stat-value" style={{ color: 'hsl(38 92% 50%)' }}>{semDocCount}</div>
              <div className="stat-label">⚠️ Sem documento</div>
            </div>
            <div
              className="stat-card"
              style={{ flex: '1 1 120px', cursor: 'pointer', border: filterStatus === 'ERRO' ? '1px solid hsl(0 72% 51%)' : undefined }}
              onClick={() => setFilterStatus(filterStatus === 'ERRO' ? 'all' : 'ERRO')}
            >
              <div className="stat-value" style={{ color: 'hsl(0 72% 51%)' }}>{errorCount}</div>
              <div className="stat-label">❌ Inválidos</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontWeight: 600 }}>Prévia da Importação</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'OK', 'SEM_DOCUMENTO', 'ERRO'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-wrapper" style={{ maxHeight: 420, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>CPF</th>
                    <th>Funcionário</th>
                    <th>Data Atestado</th>
                    <th>CID</th>
                    <th>Dias</th>
                    <th>Arquivo Anexo</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPreview.map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{formatCpf(item.cpf)}</td>
                      <td style={{ fontSize: '0.875rem' }}>{item.employeeName}</td>
                      <td style={{ fontSize: '0.8rem' }}>{item.certificateDate}</td>
                      <td><span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{item.cidCode || '—'}</span></td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.daysOff}</td>
                      <td style={{ fontSize: '0.75rem', color: item.fileName ? 'hsl(142 71% 45%)' : 'hsl(var(--muted-foreground))' }}>
                        {item.fileName ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FileText size={13} /> {item.fileName}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_CLASS[item.status]}`} style={{ fontSize: '0.7rem' }}>
                          {STATUS_LABELS[item.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
            Pronto para importar <strong>{totalReady}</strong> atestado(s). Registros com erro ({errorCount}) serão desconsiderados.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setStep('upload-docs')} className="btn btn-secondary">← Voltar</button>
            <button
              id="btn-importar"
              onClick={executeImport}
              className="btn btn-primary"
              style={{ padding: '0.625rem 1.5rem', fontWeight: 600 }}
              disabled={totalReady === 0}
            >
              <Upload size={16} /> IMPORTAR {totalReady} ATESTADO(S)
            </button>
          </div>
        </div>
      )}

      {/* Processando importação */}
      {step === 'importando' && (
        <div className="card" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
          <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 1.5rem', color: 'hsl(var(--primary))' }} />
          <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>PROCESSANDO IMPORTAÇÃO...</h2>
          <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>{progress}% concluído</p>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', marginTop: '0.5rem' }}>Gravando registros e salvando anexos no banco de dados</p>
        </div>
      )}

      {/* Concluído */}
      {step === 'concluido' && result && (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ width: 68, height: 68, background: 'hsl(142 71% 45% / 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle size={36} style={{ color: 'hsl(142 71% 45%)' }} />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.75rem' }}>IMPORTAÇÃO CONCLUÍDA!</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div className="stat-card" style={{ minWidth: 140 }}>
              <div className="stat-value" style={{ color: 'hsl(142 71% 45%)' }}>✅ {result.imported}</div>
              <div className="stat-label">Atestados cadastrados</div>
            </div>
            {result.errors > 0 && (
              <div className="stat-card" style={{ minWidth: 140 }}>
                <div className="stat-value" style={{ color: 'hsl(0 72% 51%)' }}>❌ {result.errors}</div>
                <div className="stat-label">Erros ignorados</div>
              </div>
            )}
            {result.pending > 0 && (
              <div className="stat-card" style={{ minWidth: 140 }}>
                <div className="stat-value" style={{ color: 'hsl(38 92% 50%)' }}>⚠️ {result.pending}</div>
                <div className="stat-label">Duplicidades</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} className="btn btn-secondary">
              <RotateCcw size={16} /> Nova Importação
            </button>
            <a href="/atestados" className="btn btn-primary">
              <Eye size={16} /> Ver Atestados Cadastrados
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
