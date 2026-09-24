// src/components/layout/sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { can } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { getInitials } from '@/lib/utils'
import {
  LayoutDashboard, FileText, Upload, Users, Building2,
  Stethoscope, BarChart3, Trophy, UserCog, ScrollText,
  Settings, LogOut, ChevronLeft, Menu, FileCheck
} from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  permission?: Parameters<typeof can>[1]
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/atestados', label: 'Atestados & Declarações', icon: <FileText size={18} />, permission: 'certificates:view' },
  { href: '/importacao', label: 'Importação em Massa', icon: <Upload size={18} />, permission: 'certificates:import' },
  { href: '/funcionarios', label: 'Funcionários', icon: <Users size={18} />, permission: 'employees:view' },
  { href: '/setores', label: 'Setores', icon: <Building2 size={18} />, permission: 'departments:view' },
  { href: '/cid', label: 'CID', icon: <Stethoscope size={18} />, permission: 'cid:view' },
  { href: '/declaracoes', label: 'Tipos de Declaração', icon: <FileCheck size={18} />, permission: 'certificates:view' },
  { href: '/relatorios', label: 'Relatórios', icon: <BarChart3 size={18} />, permission: 'reports:view' },
  { href: '/rankings', label: 'Rankings', icon: <Trophy size={18} />, permission: 'rankings:view' },
]

const ADMIN_ITEMS: NavItem[] = [
  { href: '/usuarios', label: 'Usuários', icon: <UserCog size={18} />, permission: 'users:view' },
  { href: '/logs', label: 'Logs de Auditoria', icon: <ScrollText size={18} />, permission: 'logs:view' },
  { href: '/configuracoes', label: 'Configurações', icon: <Settings size={18} />, permission: 'settings:view' },
]

export function Sidebar({ pendingUsers = 0 }: { pendingUsers?: number }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const role = (session?.user?.role || 'CONSULTOR') as UserRole

  const renderItem = (item: NavItem) => {
    if (item.permission && !can(role, item.permission)) return null
    const isActive = pathname.startsWith(item.href)
    return (
      <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`} title={collapsed ? item.label : undefined}>
        <span style={{ flexShrink: 0 }}>{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
        {!collapsed && item.badge && item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
      </Link>
    )
  }

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: 'hsl(var(--secondary) / 0.5)', padding: '2px', flexShrink: 0 }}>
          <img src="/favicon.svg" alt="AtestApp Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>AtestApp</div>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>Gestão de Atestados</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-ghost btn-icon"
          style={{ marginLeft: 'auto', display: 'none' }}
        >
          <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {!collapsed && <div className="nav-section-label">Principal</div>}
          {NAV_ITEMS.map(renderItem)}
        </div>

        <div className="nav-section">
          {!collapsed && <div className="nav-section-label">Administração</div>}
          {ADMIN_ITEMS.map(item => {
            if (item.href === '/usuarios') {
              return can(role, 'users:view') ? (
                <Link key={item.href} href={item.href} className={`nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`} title={collapsed ? item.label : undefined}>
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && pendingUsers > 0 && <span className="nav-badge">{pendingUsers}</span>}
                </Link>
              ) : null
            }
            return renderItem(item)
          })}
        </div>
      </nav>

      <div style={{ padding: '0.75rem', borderTop: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <ThemeToggle variant="nav" collapsed={collapsed} />

        {!collapsed && session?.user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.25rem', margin: '0.25rem 0' }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{getInitials(session.user.name || '')}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>{role.replace('_', ' ')}</div>
            </div>
          </div>
        )}
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="nav-item" style={{ width: '100%', color: 'hsl(0 72% 60%)' }}>
          <LogOut size={16} />
          {!collapsed && 'Sair'}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        {sidebarContent}
      </aside>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn btn-ghost btn-icon" style={{ display: 'none' }}>
      <Menu size={20} />
    </button>
  )
}
