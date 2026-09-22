// src/lib/upload.ts
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { sanitizeFilename } from './utils'

const UPLOAD_BASE = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
const MAX_SIZE_BYTES = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024
const ALLOWED_EXTENSIONS = (process.env.ALLOWED_EXTENSIONS || 'pdf,jpg,jpeg,png').split(',')
const ALLOWED_MIMES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

export interface UploadedFile {
  originalName: string
  storedName: string
  filePath: string
  mimeType: string
  sizeBytes: number
}

/** Garante que o diretório existe */
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/** Valida extensão e MIME type */
export function validateFile(originalName: string, mimeType: string, sizeBytes: number): string | null {
  const ext = originalName.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Extensão .${ext} não permitida. Extensões aceitas: ${ALLOWED_EXTENSIONS.join(', ')}`
  }
  const expectedMime = ALLOWED_MIMES[ext]
  if (expectedMime && mimeType !== expectedMime) {
    return `Tipo de arquivo inválido para extensão .${ext}`
  }
  if (sizeBytes > MAX_SIZE_BYTES) {
    return `Arquivo muito grande. Máximo: ${process.env.MAX_FILE_SIZE_MB || 10}MB`
  }
  return null
}

/** 
 * Salva um arquivo no disco organizando por ano/mes/cpf
 * Retorna os metadados do arquivo salvo
 */
export async function saveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  cpf: string,
  date: Date
): Promise<UploadedFile> {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const dirPath = path.join(UPLOAD_BASE, 'atestados', String(year), month, cpf)
  ensureDir(dirPath)

  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin'
  const uniqueName = `${uuidv4()}.${ext}`
  const fullPath = path.join(dirPath, uniqueName)

  fs.writeFileSync(fullPath, buffer)

  return {
    originalName,
    storedName: uniqueName,
    filePath: fullPath,
    mimeType,
    sizeBytes: buffer.length,
  }
}

/** Lê um arquivo do disco (para servir autenticado) */
export function readFile(filePath: string): Buffer | null {
  try {
    if (!fs.existsSync(filePath)) return null
    // Segurança: impede path traversal
    const resolved = path.resolve(filePath)
    const uploadBase = path.resolve(UPLOAD_BASE)
    if (!resolved.startsWith(uploadBase)) return null
    return fs.readFileSync(resolved)
  } catch {
    return null
  }
}

/** Remove um arquivo do disco */
export function deleteFile(filePath: string): boolean {
  try {
    const resolved = path.resolve(filePath)
    const uploadBase = path.resolve(UPLOAD_BASE)
    if (!resolved.startsWith(uploadBase)) return false
    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved)
    }
    return true
  } catch {
    return false
  }
}
