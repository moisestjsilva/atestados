// src/lib/permissions.ts
import { UserRole } from '@prisma/client'

export type Permission =
  // Usuários
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'users:approve'
  | 'users:block'
  // Funcionários
  | 'employees:view'
  | 'employees:create'
  | 'employees:edit'
  | 'employees:delete'
  | 'employees:import'
  // Setores
  | 'departments:view'
  | 'departments:create'
  | 'departments:edit'
  | 'departments:delete'
  // CID
  | 'cid:view'
  | 'cid:create'
  | 'cid:edit'
  | 'cid:delete'
  // Atestados
  | 'certificates:view'
  | 'certificates:create'
  | 'certificates:edit'
  | 'certificates:delete'
  | 'certificates:import'
  // Documentos
  | 'files:view'
  | 'files:upload'
  | 'files:download'
  // Relatórios
  | 'reports:view'
  | 'reports:export'
  // Rankings
  | 'rankings:view'
  // Logs
  | 'logs:view'
  // Configurações
  | 'settings:view'
  | 'settings:edit'

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  'users:view', 'users:create', 'users:edit', 'users:delete', 'users:approve', 'users:block',
  'employees:view', 'employees:create', 'employees:edit', 'employees:delete', 'employees:import',
  'departments:view', 'departments:create', 'departments:edit', 'departments:delete',
  'cid:view', 'cid:create', 'cid:edit', 'cid:delete',
  'certificates:view', 'certificates:create', 'certificates:edit', 'certificates:delete', 'certificates:import',
  'files:view', 'files:upload', 'files:download',
  'reports:view', 'reports:export',
  'rankings:view',
  'logs:view',
  'settings:view', 'settings:edit',
]

const ADMIN_PERMISSIONS: Permission[] = [
  'employees:view', 'employees:create', 'employees:edit', 'employees:delete', 'employees:import',
  'departments:view', 'departments:create', 'departments:edit', 'departments:delete',
  'cid:view', 'cid:create', 'cid:edit',
  'certificates:view', 'certificates:create', 'certificates:edit', 'certificates:delete', 'certificates:import',
  'files:view', 'files:upload', 'files:download',
  'reports:view', 'reports:export',
  'rankings:view',
]

const CONSULTOR_PERMISSIONS: Permission[] = [
  'employees:view',
  'departments:view',
  'cid:view',
  'certificates:view',
  'files:view', 'files:download',
  'reports:view',
  'rankings:view',
]

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  CONSULTOR: CONSULTOR_PERMISSIONS,
}

export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}
