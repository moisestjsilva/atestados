// src/app/(dashboard)/funcionarios/importar/page.tsx
'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Upload, FileSpreadsheet, Download, CheckCircle,
  AlertCircle, AlertTriangle, Loader2, X, RefreshCw
} from 'lucide-react'
import { formatCpf, normalizeCpf, isValidCpf } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import Papa from 'papaparse'

interface RowData {
  matricula: string
  name: string
  cpf: string
  normalizedCpf: string
  cargo: string
  setor: string
  status: 'OK' | 'ERRO'
  error?: string
}

export default function ImportarFuncionariosPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [rows, setRows] = useState<RowData[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [fileName, setFileName] = useState('')
  const [importedCount, setImportedCount] = useState<number | null>(null)

  function downloadTemplate() {
    const csvContent =
      'matricula;nome;cpf;cargo;setor\n' +
      '1001;João Silva;123.456.789-00;Analista Administrativo;Administrativo\n' +
      '1002;Maria Oliveira;987.654.321-11;Operadora de Máquinas;Produção\n' +
      '1003;Carlos Santos;111.222.333-44;Auxiliar de Logística;Logística\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'modelo_importacao_funcionarios.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setLoading(true)
    setImportedCount(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedRows: RowData[] = (results.data as any[]).map((r, i) => {
          // Normaliza chaves para minúsculo
          const row: Record<string, string> = {}
          Object.keys(r).forEach(k => {
            row[k.trim().toLowerCase()] = String(r[k] || '').trim()
          })

          const matricula = row['matricula'] || row['matrícula'] || ''
          const name = row['nome'] || row['name'] || row['funcionario'] || ''
          const rawCpf = row['cpf'] || ''
          const cargo = row['cargo'] || row['funcao'] || row['função'] || ''
          const setor = row['setor'] || row['departamento'] || ''

          const normalized = normalizeCpf(rawCpf)
          let status: 'OK' | 'ERRO' = 'OK'
          let error = ''

          if (!name) {
            status = 'ERRO'
            error = 'Nome é obrigatório'
          } else if (!normalized) {
            status = 'ERRO'
            error = 'CPF é obrigatório'
          } else if (!isValidCpf(normalized)) {
            status = 'ERRO'
            error = 'CPF inválido'
          }

          return {
            matricula,
            name,
            cpf: rawCpf,
            normalizedCpf: normalized,
            cargo,
            setor,
            status,
            error,
          }
        })

        setRows(parsedRows)
        setLoading(false)
      },
      error: () => {
        toast('Erro ao processar o arquivo CSV', 'error')
        setLoading(false)
      },
    })
  }

  async function handleImport() {
    const validRows = rows.filter(r => r.status === 'OK')
    if (validRows.length === 0) {
      toast('Não há linhas válidas para importar', 'error')
      return
    }

    setImporting(true)
    let successCount = 0
    let errorCount = 0

    // Busca setores existentes para mapear
    const deptRes = await fetch('/api/departments?all=true')
    const deptJson = await deptRes.json()
    const depts: Array<{ id: string; name: string }> = deptJson.departments || []

    for (const r of validRows) {
      try {
        // Encontra ou usa o primeiro setor
        let matchedDept = depts.find(d =>
          d.name.toLowerCase().includes(r.setor.toLowerCase()) ||
          r.setor.toLowerCase().includes(d.name.toLowerCase())
        )

        // Se não encontrar setor, atribui ao primeiro disponível
        const deptId = matchedDept ? matchedDept.id : (depts[0]?.id || '')

        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: r.name,
            cpf: r.normalizedCpf,
            matricula: r.matricula || undefined,
            cargo: r.cargo || undefined,
            departmentId: deptId,
            status: 'ATIVO',
          }),
        })

        if (res.ok) {
          successCount++
        } else {
          errorCount++
        }
      } catch {
        errorCount++
      }
    }

    setImporting(false)
    setImportedCount(successCount)

    if (successCount > 0) {
      toast(`${successCount} funcionário(s) importado(s) com sucesso!`, 'success')
    }
    if (errorCount > 0) {
      toast(`${errorCount} funcionário(s) não puderam ser importados (possível CPF já cadastrado)`, 'warning')
    }
  }

  const validCount = rows.filter(r => r.status === 'OK').length
  const errorCount = rows.filter(r => r.status === 'ERRO').length

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
            <Link href="/funcionarios" style={{ color: 'inherit', textDecoration: 'none' }}>Funcionários</Link>
            <span>/</span>
            <span style={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}>Importação em Massa</span>
          </div>
          <h1 className="page-title" style={{ margin: 0 }}>Importar Funcionários</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/funcionarios" className="btn btn-secondary">
            <ArrowLeft size={16} /> Voltar
          </Link>
          <button onClick={downloadTemplate} className="btn btn-secondary">
            <Download size={16} /> Baixar Modelo CSV
          </button>
        </div>
      </div>

      {importedCount === null ? (
        <>
          {/* Upload Dropzone */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              style={{ display: 'none' }}
            />
            <div
              className="dropzone"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}
            >
              <FileSpreadsheet size={44} style={{ color: 'hsl(var(--primary))', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                {fileName ? fileName : 'Clique para selecionar a planilha de funcionários'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                Suporta arquivo CSV separado por vírgula ou ponto-e-vírgula com cabeçalho: <code>matricula, nome, cpf, cargo, setor</code>
              </p>
            </div>
          </div>

          {/* Preview Table */}
          {rows.length > 0 && (
            <div className="card animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Pré-visualização dos Dados</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'hsl(142 71% 45%)' }}>✅ {validCount} válidos</span>
                    {errorCount > 0 && <span style={{ color: 'hsl(var(--destructive))' }}>❌ {errorCount} com erros</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setRows([]); setFileName('') }} className="btn btn-secondary btn-sm">
                    <X size={14} /> Limpar
                  </button>
                  <button onClick={handleImport} disabled={importing || validCount === 0} className="btn btn-primary">
                    {importing ? <><Loader2 size={16} className="animate-spin" /> Importando...</> : `Confirmar Importação (${validCount})`}
                  </button>
                </div>
              </div>

              <div className="table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Nome</th>
                      <th>CPF</th>
                      <th>Matrícula</th>
                      <th>Cargo</th>
                      <th>Setor</th>
                      <th>Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} style={{ opacity: r.status === 'ERRO' ? 0.6 : 1 }}>
                        <td>
                          <span className={`badge ${r.status === 'OK' ? 'badge-success' : 'badge-danger'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{r.name || '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.cpf || '—'}</td>
                        <td>{r.matricula || '—'}</td>
                        <td>{r.cargo || '—'}</td>
                        <td>{r.setor || '—'}</td>
                        <td style={{ fontSize: '0.8rem', color: r.status === 'ERRO' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))' }}>
                          {r.error || 'Pronto para importar'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Success Screen */
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', maxWidth: 520, margin: '2rem auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'hsl(142 71% 45% / 0.15)', color: 'hsl(142 71% 45%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Importação Finalizada!</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', lineHeight: 1.6 }}>
            Foram cadastrados com sucesso <strong>{importedCount} funcionários</strong> no sistema.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link href="/funcionarios" className="btn btn-primary btn-lg">
              Ver Funcionários
            </Link>
            <button onClick={() => { setImportedCount(null); setRows([]); setFileName('') }} className="btn btn-secondary btn-lg">
              Importar Nova Planilha
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
