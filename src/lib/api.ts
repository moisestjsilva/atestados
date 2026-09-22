// src/lib/api.ts
// Funções auxiliares para as API Routes (validação de sessão e permissões)
import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'
import { can, Permission } from './permissions'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
}

/** Retorna o usuário da sessão atual ou null */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return session.user as SessionUser
}

/** Verifica se o usuário tem permissão ou retorna 403 */
export async function requirePermission(
  permission: Permission
): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!can(user.role, permission)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  return user
}

/** Obtém IP da requisição */
export function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/** Resposta padronizada de erro */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/** Resposta padronizada de sucesso */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}
