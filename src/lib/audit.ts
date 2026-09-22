// src/lib/audit.ts
import { prisma } from './prisma'

interface AuditParams {
  userId?: string
  userName?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

export async function createAuditLog(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    })
  } catch (err) {
    // Não deve travar a operação principal
    console.error('Erro ao registrar auditoria:', err)
  }
}

export const AUDIT_ACTIONS = {
  // Autenticação
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CADASTRO: 'CADASTRO',
  SENHA_ALTERADA: 'SENHA_ALTERADA',
  // Usuários
  USUARIO_APROVADO: 'USUARIO_APROVADO',
  USUARIO_RECUSADO: 'USUARIO_RECUSADO',
  USUARIO_BLOQUEADO: 'USUARIO_BLOQUEADO',
  USUARIO_CRIADO: 'USUARIO_CRIADO',
  USUARIO_EDITADO: 'USUARIO_EDITADO',
  USUARIO_EXCLUIDO: 'USUARIO_EXCLUIDO',
  // Funcionários
  FUNCIONARIO_CRIADO: 'FUNCIONARIO_CRIADO',
  FUNCIONARIO_EDITADO: 'FUNCIONARIO_EDITADO',
  FUNCIONARIO_INATIVADO: 'FUNCIONARIO_INATIVADO',
  FUNCIONARIO_EXCLUIDO: 'FUNCIONARIO_EXCLUIDO',
  FUNCIONARIOS_IMPORTADOS: 'FUNCIONARIOS_IMPORTADOS',
  // Setores
  SETOR_CRIADO: 'SETOR_CRIADO',
  SETOR_EDITADO: 'SETOR_EDITADO',
  SETOR_EXCLUIDO: 'SETOR_EXCLUIDO',
  // CID
  CID_CRIADO: 'CID_CRIADO',
  CID_EDITADO: 'CID_EDITADO',
  CID_EXCLUIDO: 'CID_EXCLUIDO',
  // Atestados
  ATESTADO_CRIADO: 'ATESTADO_CRIADO',
  ATESTADO_EDITADO: 'ATESTADO_EDITADO',
  ATESTADO_EXCLUIDO: 'ATESTADO_EXCLUIDO',
  ATESTADOS_IMPORTADOS: 'ATESTADOS_IMPORTADOS',
  // Documentos
  DOCUMENTO_ENVIADO: 'DOCUMENTO_ENVIADO',
  DOCUMENTO_BAIXADO: 'DOCUMENTO_BAIXADO',
  DOCUMENTO_VISUALIZADO: 'DOCUMENTO_VISUALIZADO',
  // Relatórios
  RELATORIO_EXPORTADO: 'RELATORIO_EXPORTADO',
  // Configurações
  CONFIGURACOES_ALTERADAS: 'CONFIGURACOES_ALTERADAS',
} as const
