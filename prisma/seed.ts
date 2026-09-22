// prisma/seed.ts
import { PrismaClient, UserRole, UserStatus, EmployeeStatus, DepartmentStatus, CidStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de demonstração...')

  // ─── Configurações do sistema ───
  await prisma.systemSettings.upsert({
    where: { id: '1' },
    create: { id: '1', companyName: 'Empresa Demo LTDA' },
    update: { companyName: 'Empresa Demo LTDA' },
  })

  // ─── Setores ───
  const setores = [
    { code: 'ADM', name: 'Administrativo' },
    { code: 'FIN', name: 'Financeiro' },
    { code: 'TI', name: 'Tecnologia da Informação' },
    { code: 'RH', name: 'Recursos Humanos' },
    { code: 'OP', name: 'Operacional' },
    { code: 'COM', name: 'Comercial' },
    { code: 'LOG', name: 'Logística' },
    { code: 'PROD', name: 'Produção' },
  ]

  const departamentos: Record<string, string> = {}
  for (const s of setores) {
    const dept = await prisma.department.upsert({
      where: { code: s.code },
      create: { ...s, status: DepartmentStatus.ATIVO },
      update: {},
    })
    departamentos[s.code] = dept.id
  }

  // ─── CIDs ───
  const cids = [
    { code: 'J06.9', description: 'Infecção aguda das vias aéreas superiores não especificada' },
    { code: 'M54.5', description: 'Dor lombar baixa' },
    { code: 'J10', description: 'Influenza devida a vírus identificado' },
    { code: 'F41.1', description: 'Transtorno de ansiedade generalizada' },
    { code: 'J18.9', description: 'Pneumonia não especificada' },
    { code: 'K29.5', description: 'Gastrite crônica não especificada' },
    { code: 'M79.3', description: 'Paniculite' },
    { code: 'R51', description: 'Cefaleia' },
    { code: 'A09', description: 'Diarreia e gastroenterite de origem infecciosa presumível' },
    { code: 'Z96.6', description: 'Presença de implantes osteoarticulares' },
    { code: 'N39.0', description: 'Infecção do trato urinário sem localização especificada' },
    { code: 'J03.9', description: 'Amigdalite aguda não especificada' },
    { code: 'F32.0', description: 'Episódio depressivo leve' },
    { code: 'M75.1', description: 'Síndrome do manguito rotador' },
    { code: 'G43.9', description: 'Enxaqueca não especificada' },
  ]

  const cidMap: Record<string, string> = {}
  for (const c of cids) {
    const cid = await prisma.cidCode.upsert({
      where: { code: c.code },
      create: { ...c, status: CidStatus.ATIVO },
      update: {},
    })
    cidMap[c.code] = cid.id
  }

  // ─── Funcionários de demonstração ───
  const funcionarios = [
    { matricula: 'F001', name: '[DEMO] João da Silva', cpf: '11111111111', cargo: 'Analista', deptCode: 'TI' },
    { matricula: 'F002', name: '[DEMO] Maria Oliveira', cpf: '22222222222', cargo: 'Gerente', deptCode: 'RH' },
    { matricula: 'F003', name: '[DEMO] Pedro Santos', cpf: '33333333333', cargo: 'Operador', deptCode: 'OP' },
    { matricula: 'F004', name: '[DEMO] Ana Costa', cpf: '44444444444', cargo: 'Assistente', deptCode: 'ADM' },
    { matricula: 'F005', name: '[DEMO] Carlos Ferreira', cpf: '55555555555', cargo: 'Técnico', deptCode: 'PROD' },
    { matricula: 'F006', name: '[DEMO] Mariana Lima', cpf: '66666666666', cargo: 'Consultora', deptCode: 'COM' },
    { matricula: 'F007', name: '[DEMO] Roberto Souza', cpf: '77777777777', cargo: 'Supervisor', deptCode: 'LOG' },
    { matricula: 'F008', name: '[DEMO] Juliana Alves', cpf: '88888888888', cargo: 'Coordenadora', deptCode: 'FIN' },
    { matricula: 'F009', name: '[DEMO] Marcos Pereira', cpf: '99999999999', cargo: 'Analista Jr', deptCode: 'TI' },
    { matricula: 'F010', name: '[DEMO] Fernanda Castro', cpf: '10101010101', cargo: 'Atendente', deptCode: 'ADM' },
  ]

  const funcMap: Record<string, string> = {}
  for (const f of funcionarios) {
    const func = await prisma.employee.upsert({
      where: { cpf: f.cpf },
      create: {
        matricula: f.matricula,
        name: f.name,
        cpf: f.cpf,
        cargo: f.cargo,
        departmentId: departamentos[f.deptCode],
        status: EmployeeStatus.ATIVO,
        admissionDate: new Date('2020-01-01'),
      },
      update: {},
    })
    funcMap[f.cpf] = func.id
  }

  // ─── Atestados de demonstração ───
  const now = new Date()
  const atestados = [
    { cpf: '11111111111', cidCode: 'J06.9', days: 3, month: 1 },
    { cpf: '22222222222', cidCode: 'M54.5', days: 5, month: 2 },
    { cpf: '33333333333', cidCode: 'J10', days: 2, month: 2 },
    { cpf: '44444444444', cidCode: 'F41.1', days: 7, month: 3 },
    { cpf: '55555555555', cidCode: 'J06.9', days: 1, month: 3 },
    { cpf: '11111111111', cidCode: 'R51', days: 1, month: 4 },
    { cpf: '66666666666', cidCode: 'K29.5', days: 2, month: 4 },
    { cpf: '77777777777', cidCode: 'M54.5', days: 3, month: 5 },
    { cpf: '88888888888', cidCode: 'J18.9', days: 10, month: 5 },
    { cpf: '99999999999', cidCode: 'A09', days: 2, month: 6 },
    { cpf: '10101010101', cidCode: 'J06.9', days: 3, month: 6 },
    { cpf: '33333333333', cidCode: 'M79.3', days: 4, month: 7 },
    { cpf: '22222222222', cidCode: 'F32.0', days: 15, month: 7 },
    { cpf: '44444444444', cidCode: 'N39.0', days: 3, month: 8 },
    { cpf: '55555555555', cidCode: 'J03.9', days: 2, month: 8 },
    { cpf: '11111111111', cidCode: 'G43.9', days: 1, month: 9 },
    { cpf: '77777777777', cidCode: 'M75.1', days: 14, month: 9 },
    { cpf: '66666666666', cidCode: 'J06.9', days: 3, month: 10 },
    { cpf: '88888888888', cidCode: 'F41.1', days: 5, month: 10 },
    { cpf: '99999999999', cidCode: 'M54.5', days: 2, month: 11 },
  ]

  const year = now.getFullYear()
  for (const a of atestados) {
    const start = new Date(year, a.month - 1, 5)
    const end = new Date(year, a.month - 1, 5 + a.days - 1)
    await prisma.medicalCertificate.create({
      data: {
        employeeId: funcMap[a.cpf],
        cidId: cidMap[a.cidCode],
        cidDescription: cids.find(c => c.code === a.cidCode)?.description,
        doctor: '[DEMO] Dr. Exemplo',
        certificateDate: start,
        startDate: start,
        endDate: end,
        daysOff: a.days,
      },
    })
  }

  // ─── Usuários de demonstração ───
  const hashSenha = await bcrypt.hash('Demo@123', 12)

  await prisma.user.upsert({
    where: { email: 'superadmin@demo.com' },
    create: {
      name: '[DEMO] Super Admin',
      email: 'superadmin@demo.com',
      password: hashSenha,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ATIVO,
    },
    update: {},
  })

  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    create: {
      name: '[DEMO] Admin',
      email: 'admin@demo.com',
      password: hashSenha,
      role: UserRole.ADMIN,
      status: UserStatus.ATIVO,
    },
    update: {},
  })

  await prisma.user.upsert({
    where: { email: 'consultor@demo.com' },
    create: {
      name: '[DEMO] Consultor',
      email: 'consultor@demo.com',
      password: hashSenha,
      role: UserRole.CONSULTOR,
      status: UserStatus.ATIVO,
    },
    update: {},
  })

  await prisma.systemSettings.upsert({
    where: { id: '1' },
    update: {},
    create: { id: '1', companyName: 'Empresa Demo LTDA' },
  })

  console.log('✅ Seed concluído!')
  console.log('')
  console.log('📋 Usuários de demonstração criados:')
  console.log('   Super Admin: superadmin@demo.com | Senha: Demo@123')
  console.log('   Admin:       admin@demo.com       | Senha: Demo@123')
  console.log('   Consultor:   consultor@demo.com   | Senha: Demo@123')
  console.log('')
  console.log('⚠️  ATENÇÃO: Estes são dados de demonstração. Altere as senhas em produção!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
