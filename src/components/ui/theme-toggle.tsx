'use client'

import { useTheme } from '@/components/theme-provider'
import { Sun, Moon, Laptop } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  variant?: 'nav' | 'icon' | 'badge'
  collapsed?: boolean
  className?: string
}

export function ThemeToggle({ variant = 'nav', collapsed = false, className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={variant === 'nav' ? 'nav-item' : 'btn btn-ghost btn-icon'}
        style={{ opacity: 0.5 }}
      >
        <span style={{ display: 'inline-block', width: 18, height: 18 }} />
        {variant === 'nav' && !collapsed && <span>Tema</span>}
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'
  const Icon = isDark ? Sun : Moon
  const label = isDark ? 'Modo Claro' : 'Modo Escuro'

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`btn btn-secondary btn-icon ${className}`}
        title={`Alternar para ${label}`}
        aria-label={`Alternar para ${label}`}
        style={{
          borderRadius: '50%',
          width: 38,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Icon size={18} style={{ color: isDark ? '#fbbf24' : '#6366f1', transition: 'transform 0.3s ease' }} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`nav-item ${className}`}
      title={collapsed ? label : undefined}
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 6,
          background: isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(99, 102, 241, 0.12)',
          color: isDark ? '#fbbf24' : '#4f46e5',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        <Icon size={16} />
      </span>
      {!collapsed && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.85rem' }}>{label}</span>
          <span
            style={{
              fontSize: '0.68rem',
              padding: '2px 6px',
              borderRadius: 4,
              background: 'hsl(var(--secondary))',
              color: 'hsl(var(--muted-foreground))',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {isDark ? 'Escuro' : 'Claro'}
          </span>
        </div>
      )}
    </button>
  )
}

export function ThemeSegmentedControl() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const options: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }> = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Automático (Sistema)', icon: Laptop },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
      {options.map(opt => {
        const IconComponent = opt.icon
        const isActive = theme === opt.value

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              padding: '1rem',
              borderRadius: '12px',
              border: isActive ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
              background: isActive
                ? 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))'
                : 'hsl(var(--secondary) / 0.4)',
              color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: isActive ? 600 : 500,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                color: isActive ? '#ffffff' : 'hsl(var(--muted-foreground))',
                transition: 'all 0.2s ease',
              }}
            >
              <IconComponent size={18} />
            </div>
            <span style={{ fontSize: '0.85rem' }}>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
