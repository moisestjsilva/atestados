// src/components/layout/topbar.tsx
'use client'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'
import { Bell, Shield, User, FileText, ChevronRight } from 'lucide-react'

const ROUTE_TITLES: Record<string, { title: string; category?: string }> = {
  '/dashboard': { title: 'Dashboard Geral', category: 'Visão Geral' },
  '/atestados': { title: 'Gestão de Atestados', category: 'Atestados' },
  '/funcionarios': { title: 'Quadro de Funcionários', category: 'RH' },
  '/funcionarios/importar': { title: 'Importação em Massa de Funcionários', category: 'RH' },
  '/importacao': { title: 'Importação em Massa de Atestados', category: 'Atestados' },
  '/setores': { title: 'Departamentos e Setores', category: 'Configurações' },
  '/cid': { title: 'Catálogo de CID-10', category: 'Médico' },
  '/relatorios': { title: 'Relatórios e Análises', category: 'Estatísticas' },
  '/rankings': { title: 'Rankings de Absenteísmo', category: 'Estatísticas' },
  '/usuarios': { title: 'Gestão de Usuários', category: 'Administração' },
  '/logs': { title: 'Logs de Auditoria', category: 'Segurança' },
  '/configuracoes': { title: 'Configurações do Sistema', category: 'Administração' },
}

export function Topbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Match title
  let currentMeta = ROUTE_TITLES[pathname]
  if (!currentMeta) {
    if (pathname.startsWith('/atestados/')) {
      currentMeta = { title: 'Detalhes do Atestado', category: 'Atestados' }
    } else if (pathname.startsWith('/funcionarios/')) {
      currentMeta = { title: 'Prontuário do Funcionário', category: 'RH' }
    } else {
      currentMeta = { title: 'Painel', category: 'Sistema' }
    }
  }

  const role = session?.user?.role || 'CONSULTOR'

  return (
    <header className="topbar">
      {/* Breadcrumb / Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
        {currentMeta.category && (
          <>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
              {currentMeta.category}
            </span>
            <ChevronRight size={14} style={{ color: 'hsl(var(--muted-foreground))', opacity: 0.6 }} />
          </>
        )}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentMeta.title}
        </h2>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* Theme Toggle Button */}
        <ThemeToggle variant="icon" />

        {/* User Pill */}
        {session?.user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.3rem 0.6rem 0.3rem 0.4rem',
              borderRadius: '24px',
              background: 'hsl(var(--secondary) / 0.7)',
              border: '1px solid hsl(var(--border))',
            }}
          >
            <div
              className="avatar"
              style={{
                width: 28,
                height: 28,
                fontSize: 11,
                background: 'linear-gradient(135deg, hsl(var(--primary)), #6366f1)',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {getInitials(session.user.name || '')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'hsl(var(--foreground))', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session.user.name?.split(' ')[0]}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
                {role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
