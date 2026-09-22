// src/app/api/imports/match-files/route.ts
// Etapa 3-7: Recebe múltiplos arquivos, extrai CPFs e associa com planilha
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, apiError } from '@/lib/api'
import { can } from '@/lib/permissions'
import { extractCpfFromString, isValidCpf, normalizeCpf } from '@/lib/utils'

export interface FileMatch {
  fileName: string
  cpf: string | null
  valid: boolean
  source: 'filename' | 'unidentified'
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return apiError('Não autenticado', 401)
  if (!can(user.role, 'certificates:import')) return apiError('Sem permissão', 403)

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  if (!files || files.length === 0) {
    return apiError('Nenhum arquivo enviado')
  }

  const matches: FileMatch[] = []

  for (const file of files) {
    const name = file.name
    const cpf = extractCpfFromString(name)

    if (cpf && isValidCpf(cpf)) {
      matches.push({ fileName: name, cpf: normalizeCpf(cpf), valid: true, source: 'filename' })
    } else {
      // TODO: OCR - arquitetura preparada para Tesseract.js
      // const buffer = Buffer.from(await file.arrayBuffer())
      // const cpfFromOcr = await extractCpfWithOcr(buffer, file.type)
      matches.push({ fileName: name, cpf: null, valid: false, source: 'unidentified' })
    }
  }

  const identified = matches.filter(m => m.cpf)
  const unidentified = matches.filter(m => !m.cpf)

  // Detecta múltiplos arquivos para o mesmo CPF
  const cpfCounts: Record<string, number> = {}
  for (const m of identified) {
    if (m.cpf) cpfCounts[m.cpf] = (cpfCounts[m.cpf] || 0) + 1
  }

  return NextResponse.json({
    total: matches.length,
    identified: identified.length,
    unidentified: unidentified.length,
    duplicateCpfs: Object.entries(cpfCounts).filter(([, c]) => c > 1).map(([cpf]) => cpf),
    matches,
  })
}
