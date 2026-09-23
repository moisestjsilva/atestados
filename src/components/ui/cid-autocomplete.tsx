// src/components/ui/cid-autocomplete.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2, Stethoscope, Check } from 'lucide-react'

export interface CidItem {
  id: string
  code: string
  description: string
}

interface CidAutocompleteProps {
  initialCidId?: string | null
  initialCode?: string | null
  initialDescription?: string | null
  onSelect: (cid: CidItem | null, textValue: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function CidAutocomplete({
  initialCidId,
  initialCode,
  initialDescription,
  onSelect,
  placeholder = 'Buscar por código (ex: M54.5, J06) ou diagnóstico...',
  required = false,
  disabled = false,
}: CidAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCid, setSelectedCid] = useState<CidItem | null>(null)
  const [results, setResults] = useState<CidItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Inicializar estado se valores forem passados
  useEffect(() => {
    if (initialCidId && initialCode) {
      setSelectedCid({
        id: initialCidId,
        code: initialCode,
        description: initialDescription || '',
      })
      setSearchTerm(`${initialCode} - ${initialDescription || ''}`)
    } else if (initialDescription) {
      setSearchTerm(initialDescription)
    }
  }, [initialCidId, initialCode, initialDescription])

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Busca debounced
  useEffect(() => {
    // Se o termo for exatamente o CID selecionado, não busca
    if (selectedCid && searchTerm === `${selectedCid.code} - ${selectedCid.description}`) {
      return
    }

    const trimmed = searchTerm.trim()
    if (trimmed.length < 1) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/cid?all=true&search=${encodeURIComponent(trimmed)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.cids || [])
          setIsOpen(true)
          setHighlightIndex(-1)
        }
      } catch (err) {
        console.error('Erro ao buscar CIDs:', err)
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [searchTerm, selectedCid])

  function handleSelect(cid: CidItem) {
    setSelectedCid(cid)
    setSearchTerm(`${cid.code} - ${cid.description}`)
    setIsOpen(false)
    setResults([])
    onSelect(cid, cid.description)
  }

  function handleClear() {
    setSelectedCid(null)
    setSearchTerm('')
    setResults([])
    setIsOpen(false)
    onSelect(null, '')
    inputRef.current?.focus()
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearchTerm(val)
    if (selectedCid) {
      setSelectedCid(null)
    }
    onSelect(null, val)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < results.length) {
        handleSelect(results[highlightIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            position: 'absolute',
            left: '0.75rem',
            color: selectedCid ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Stethoscope size={16} />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0 && !selectedCid) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="form-input"
          style={{
            paddingLeft: '2.4rem',
            paddingRight: searchTerm ? '2.4rem' : '1rem',
            borderColor: selectedCid ? 'hsl(var(--primary))' : undefined,
          }}
        />

        {searchTerm && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-ghost btn-icon btn-sm"
            style={{
              position: 'absolute',
              right: '0.4rem',
              width: 24,
              height: 24,
              padding: 0,
              color: 'hsl(var(--muted-foreground))',
            }}
            title="Limpar CID"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selected Indicator Pill */}
      {selectedCid && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.35rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            background: 'hsl(var(--primary) / 0.1)',
            border: '1px solid hsl(var(--primary) / 0.25)',
            fontSize: '0.75rem',
            color: 'hsl(var(--primary))',
          }}
        >
          <Check size={13} />
          <span>CID Selecionado: <strong>{selectedCid.code}</strong> — {selectedCid.description}</span>
        </div>
      )}

      {/* Dropdown de Resultados */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {results.length > 0 ? (
            <div style={{ padding: '0.25rem' }}>
              <div
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'hsl(var(--muted-foreground))',
                  borderBottom: '1px solid hsl(var(--border) / 0.5)',
                  letterSpacing: '0.04em',
                }}
              >
                CIDs Encontrados ({results.length})
              </div>

              {results.map((cid, index) => {
                const isHighlighted = index === highlightIndex
                return (
                  <div
                    key={cid.id}
                    onClick={() => handleSelect(cid)}
                    onMouseEnter={() => setHighlightIndex(index)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: isHighlighted ? 'hsl(var(--secondary))' : 'transparent',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        background: isHighlighted ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.15)',
                        color: isHighlighted ? 'hsl(var(--primary-foreground))' : 'hsl(var(--primary))',
                        flexShrink: 0,
                      }}
                    >
                      {cid.code}
                    </span>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        color: 'hsl(var(--foreground))',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={cid.description}
                    >
                      {cid.description}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '1rem',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              Nenhum CID específico encontrado para &quot;<strong>{searchTerm}</strong>&quot;.
              <div style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
                Você pode manter este texto como diagnóstico livre no atestado.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
