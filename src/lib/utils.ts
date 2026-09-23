// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Normaliza CPF: remove tudo que não for dígito, retorna 11 chars */
export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, '').padStart(11, '0').slice(0, 11)
}

/** Valida se CPF é matematicamente válido */
export function isValidCpf(cpf: string): boolean {
  const cleaned = normalizeCpf(cpf)
  if (cleaned.length !== 11) return false
  if (/^(\d)\1+$/.test(cleaned)) return false // todos iguais

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(cleaned[10])
}

/** Formata CPF: 123.456.789-00 */
export function formatCpf(cpf: string): string {
  const c = normalizeCpf(cpf)
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`
}

/** Extrai CPF de uma string (nome de arquivo, etc.), tratando inclusive CPFs com '0' no início que perderam o zero */
export function extractCpfFromString(str: string): string | null {
  if (!str) return null

  // 1. Procura CPF com pontuação padrão: 000.000.000-00 ou 00.000.000-00 (sem 0 inicial)
  const formattedMatches = str.match(/\b\d{2,3}[\.\s]\d{3}[\.\s]\d{3}[-\.]\d{2}\b/g)
  if (formattedMatches) {
    for (const m of formattedMatches) {
      const cleaned = normalizeCpf(m)
      if (isValidCpf(cleaned)) return cleaned
    }
  }

  // 2. Divide a string por delimitadores comuns em nomes de arquivos (_, -, espaço, ., (, ), [ ], etc.)
  // Ex: "atestado_01_07234567890.pdf" -> ["atestado", "01", "07234567890", "pdf"]
  const parts = str.split(/[^0-9a-zA-Z]/).filter(Boolean)
  for (const part of parts) {
    const onlyDigits = part.replace(/\D/g, '')
    // Sequência de 11 dígitos exatos
    if (onlyDigits.length === 11 && isValidCpf(onlyDigits)) {
      return onlyDigits
    }
    // Sequência de 10 dígitos (caso o CPF comece com '0' e o sistema/usuário tenha salvo sem o 0)
    if (onlyDigits.length === 10) {
      const withZero = '0' + onlyDigits
      if (isValidCpf(withZero)) {
        return withZero
      }
    }
  }

  // 3. Procura sequências contínuas de 11 dígitos na string inteira
  const elevenDigitMatches = str.match(/\d{11}/g)
  if (elevenDigitMatches) {
    for (const m of elevenDigitMatches) {
      if (isValidCpf(m)) return m
    }
  }

  // 4. Procura sequências contínuas de 10 dígitos (com '0' inicial omitido)
  const tenDigitMatches = str.match(/\d{10}/g)
  if (tenDigitMatches) {
    for (const m of tenDigitMatches) {
      const withZero = '0' + m
      if (isValidCpf(withZero)) return withZero
    }
  }

  // 5. Se a string inteira conter apenas números entre 10 e 11 dígitos
  const allDigits = str.replace(/\D/g, '')
  if (allDigits.length === 11 && isValidCpf(allDigits)) return allDigits
  if (allDigits.length === 10) {
    const withZero = '0' + allDigits
    if (isValidCpf(withZero)) return withZero
  }

  return null
}

/** Formata data: DD/MM/AAAA */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

/** Formata data e hora */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleString('pt-BR')
}

/** Formata tamanho em bytes */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Retorna nome abreviado */
export function abbreviateName(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1]}`
}

/** Iniciais do nome (até 2 letras) */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Gera slug de arquivo seguro */
export function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase()
}

/** Calcula diferença em dias entre duas datas */
export function daysBetween(start: Date | string, end: Date | string): number {
  const s = new Date(start)
  const e = new Date(end)
  const diff = e.getTime() - s.getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1)
}

/** Meses em português */
export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
