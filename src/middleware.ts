// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Rotas de setup (apenas sem usuários no sistema)
    if (path.startsWith('/api/setup')) return NextResponse.next()

    // Bloqueado ou pendente não acessa
    if (token?.status === 'BLOQUEADO' || token?.status === 'PENDENTE') {
      return NextResponse.redirect(new URL('/login?error=BLOQUEADO', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        // Rotas públicas
        if (
          path.startsWith('/login') ||
          path.startsWith('/cadastro') ||
          path.startsWith('/recuperar-senha') ||
          path.startsWith('/api/auth') ||
          path.startsWith('/api/setup') ||
          path === '/'
        ) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
