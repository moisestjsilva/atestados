// src/components/ui/modal-portal.tsx
'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Evita rolagem da página quando o modal estiver aberto
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  if (!mounted) return null
  return createPortal(children, document.body)
}
