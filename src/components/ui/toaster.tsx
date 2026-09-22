// src/components/ui/toaster.tsx
'use client'
import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside Toaster')
  return ctx
}

const icons = {
  success: <CheckCircle size={16} />,
  error: <AlertCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
}

const styles = {
  success: { bg: 'hsl(142 71% 45%)', text: 'white' },
  error: { bg: 'hsl(0 72% 51%)', text: 'white' },
  warning: { bg: 'hsl(38 92% 50%)', text: 'white' },
  info: { bg: 'hsl(217 91% 60%)', text: 'white' },
}

let externalToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null

export function toast(message: string, type: ToastType = 'info', duration = 4000) {
  externalToast?.(message, type, duration)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type, duration }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  useEffect(() => { externalToast = addToast }, [addToast])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '380px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            background: styles[t.type].bg, color: styles[t.type].text,
            padding: '0.75rem 1rem', borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease',
            fontSize: '0.875rem', fontWeight: 500,
          }}>
            {icons[t.type]}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7, padding: '0 0 0 0.25rem' }}><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
