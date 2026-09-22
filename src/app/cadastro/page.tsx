// src/app/cadastro/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus, Mail, Lock, User, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'

export default function CadastroPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Preencha todos os campos'); return }
    if (form.password !== form.confirm) { setError('As senhas não conferem'); return }
    if (form.password.length < 6) { setError('Senha deve ter ao menos 6 caracteres'); return }

    setLoading(true); setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })

    setLoading(false)
    if (res.ok) {
      setSuccess(true)
    } else {
      const data = await res.json()
      setError(data.error || 'Erro ao criar conta')
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card animate-fade-in" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: 64, height: 64, background: 'hsl(142 71% 45% / 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={32} style={{ color: 'hsl(142 71% 45%)' }} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Cadastro realizado!</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Sua conta foi criada e está <strong>aguardando aprovação</strong> de um administrador.
            Você receberá acesso assim que for aprovado.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
            Voltar ao Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'linear-gradient(135deg, hsl(217 91% 60%), #6366f1)', borderRadius: 16, marginBottom: '1rem' }}>
            <UserPlus size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Criar conta</h1>
          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Preencha os dados para solicitar acesso</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
              <input id="reg-name" type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Seu nome" className="form-input" style={{ paddingLeft: '2.5rem' }} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
              <input id="reg-email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="seu@email.com" className="form-input" style={{ paddingLeft: '2.5rem' }} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
              <input id="reg-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
              <input id="reg-confirm" type={showPassword ? 'text' : 'password'} value={form.confirm} onChange={e => update('confirm', e.target.value)} placeholder="••••••••" className="form-input" style={{ paddingLeft: '2.5rem' }} required />
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button id="btn-register" type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
            {loading ? <><Loader2 size={16} className="animate-spin" />Criando conta...</> : 'Criar conta'}
          </button>

          <Link href="/login" className="btn btn-ghost" style={{ justifyContent: 'center' }}>
            ← Voltar ao login
          </Link>
        </form>
      </div>
    </div>
  )
}
