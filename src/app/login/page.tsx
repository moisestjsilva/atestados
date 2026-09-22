// src/app/login/page.tsx
'use client'
import { Suspense, useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, FileText, Lock, Mail, Loader2, Shield } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  PENDENTE: '⏳ Sua conta está aguardando aprovação de um administrador.',
  BLOQUEADO: '🔒 Sua conta foi bloqueada. Entre em contato com o administrador.',
  RECUSADO: '❌ Seu cadastro foi recusado. Entre em contato com o administrador.',
  CredentialsSignin: '❌ E-mail ou senha incorretos.',
  default: '❌ Ocorreu um erro. Tente novamente.',
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const { status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard')
    const errParam = params.get('error')
    if (errParam) setError(ERROR_MESSAGES[errParam] || ERROR_MESSAGES.default)
  }, [status, params, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Preencha e-mail e senha'); return }
    setLoading(true); setError('')

    const res = await signIn('credentials', {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    })

    setLoading(false)
    if (res?.ok) {
      router.replace('/dashboard')
    } else {
      const errMsg = res?.error || 'default'
      setError(ERROR_MESSAGES[errMsg] || ERROR_MESSAGES.default)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'linear-gradient(135deg, hsl(217 91% 60%), #6366f1)', borderRadius: 16, marginBottom: '1rem' }}>
            <FileText size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Gestão de Atestados</h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Acesse com suas credenciais</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <span>{error}</span>
            </div>
          )}

          <button id="btn-login" type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
            {loading ? <><Loader2 size={16} className="animate-spin" />Entrando...</> : 'Entrar'}
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <Link href="/cadastro" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
              Criar conta
            </Link>
          </div>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '0.875rem', background: 'hsl(var(--secondary))', borderRadius: 10, fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Shield size={14} />
            <strong>Dados de demonstração</strong>
          </div>
          <div>superadmin@demo.com / Demo@123</div>
          <div>admin@demo.com / Demo@123</div>
          <div>consultor@demo.com / Demo@123</div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page"><div className="auth-card" style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
