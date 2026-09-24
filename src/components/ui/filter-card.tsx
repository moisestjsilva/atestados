// src/components/ui/filter-card.tsx
'use client'
import { useState, useEffect } from 'react'
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react'

interface FilterCardProps {
  children: React.ReactNode
  title?: string
  activeCount?: number
  onClear?: () => void
  defaultOpenMobile?: boolean
  className?: string
  style?: React.CSSProperties
}

export function FilterCard({
  children,
  title = 'Filtros de Consulta',
  activeCount = 0,
  onClear,
  defaultOpenMobile = false,
  className = '',
  style,
}: FilterCardProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile && !defaultOpenMobile && activeCount === 0) {
        setIsOpen(false)
      } else if (!mobile) {
        setIsOpen(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [defaultOpenMobile, activeCount])

  return (
    <div className={`card filter-card ${className}`} style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', ...style }}>
      {/* Filter Header (Always visible) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: isMobile ? 'pointer' : 'default',
          userSelect: 'none',
          paddingBottom: isOpen ? '0.75rem' : '0',
          borderBottom: isOpen ? '1px solid hsl(var(--border) / 0.5)' : 'none',
          marginBottom: isOpen ? '0.875rem' : '0',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Filter size={16} style={{ color: 'hsl(var(--primary))' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(var(--foreground))' }}>{title}</span>
          {activeCount > 0 && (
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
              {activeCount} {activeCount === 1 ? 'filtro ativo' : 'filtros ativos'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeCount > 0 && onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', height: 'auto' }}
              title="Limpar todos os filtros"
            >
              <X size={13} /> Limpar
            </button>
          )}

          {/* Toggle Button for Mobile */}
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon mobile-filter-toggle"
            aria-label={isOpen ? 'Ocultar filtros' : 'Expandir filtros'}
            style={{ padding: '0.25rem' }}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Filter Body Content */}
      {isOpen && (
        <div className="filter-card-body animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}
