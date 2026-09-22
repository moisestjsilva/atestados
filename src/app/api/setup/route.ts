// src/app/api/setup/route.ts
// Rota para criar o primeiro Super Admin durante instalação
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  // Verifica se já existe algum Super Admin
  const existing = await prisma.user.count({ where: { role: 'SUPER_ADMIN', status: 'ATIVO' } })
  if (existing > 0) {
    return NextResponse.json({ error: 'Setup já realizado. Sistema já possui um Super Admin.' }, { status: 400 })
  }

  // Verifica chave de setup (opcional mas recomendado)
  const setupSecret = process.env.SETUP_SECRET
  if (setupSecret) {
    const authHeader = req.headers.get('x-setup-secret')
    if (authHeader !== setupSecret) {
      return NextResponse.json({ error: 'Chave de setup inválida' }, { status: 401 })
    }
  }

  const body = await req.json()
  const { name, email, password } = body

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Senha deve ter ao menos 8 caracteres' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      password: hashed,
      role: 'SUPER_ADMIN',
      status: 'ATIVO',
    },
    select: { id: true, name: true, email: true, role: true },
  })

  // Cria configurações iniciais do sistema
  await prisma.systemSettings.upsert({
    where: { id: '1' },
    create: { id: '1' },
    update: {},
  })

  return NextResponse.json({
    message: 'Super Admin criado com sucesso! Faça login para acessar o sistema.',
    user,
  }, { status: 201 })
}

// Verifica se o setup já foi realizado
export async function GET() {
  const count = await prisma.user.count({ where: { role: 'SUPER_ADMIN', status: 'ATIVO' } })
  return NextResponse.json({ setupRequired: count === 0 })
}
