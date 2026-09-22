// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password } = parsed.data
    const emailLower = email.toLowerCase().trim()

    const existing = await prisma.user.findUnique({ where: { email: emailLower } })
    if (existing) {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailLower,
        password: hashed,
        status: 'PENDENTE',
        role: 'CONSULTOR',
      },
    })

    return NextResponse.json({ message: 'Cadastro realizado! Aguarde a aprovação de um administrador.' }, { status: 201 })
  } catch (err) {
    console.error('Erro ao registrar:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
