// scripts/import-declaration-types.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const defaultDeclarations = [
  {
    code: 'falecimento_familiar',
    name: 'Falecimento de Familiar',
    description: 'Falecimento de cônjuge, ascendente, descendente, irmão ou pessoa declarada na CTPS que viva sob dependência econômica do empregado',
    documentRequired: 'Certidão de óbito e documento que comprove o vínculo, quando necessário',
    quantity: 2,
    unit: 'dias consecutivos',
    isPaid: true,
    legalBase: 'CLT, Art. 473, I',
  },
  {
    code: 'casamento',
    name: 'Casamento / Licença Gala',
    description: 'Casamento do empregado',
    documentRequired: 'Certidão de casamento',
    quantity: 3,
    unit: 'dias consecutivos',
    isPaid: true,
    legalBase: 'CLT, Art. 473, II',
  },
  {
    code: 'nascimento_adocao_guarda',
    name: 'Nascimento de Filho / Licença Paternidade',
    description: 'Nascimento de filho, adoção ou guarda compartilhada',
    documentRequired: 'Certidão de nascimento ou documento judicial de adoção/guarda',
    quantity: 5,
    unit: 'dias consecutivos',
    isPaid: true,
    legalBase: 'CLT, Art. 473, III',
  },
  {
    code: 'doacao_sangue',
    name: 'Doação Voluntária de Sangue',
    description: 'Doação voluntária de sangue devidamente comprovada',
    documentRequired: 'Comprovante de doação',
    quantity: 1,
    unit: 'dia a cada 12 meses',
    isPaid: true,
    legalBase: 'CLT, Art. 473, IV',
  },
  {
    code: 'alistamento_eleitoral',
    name: 'Alistamento ou Transferência Eleitoral',
    description: 'Alistamento ou transferência eleitoral',
    documentRequired: 'Comprovante de atendimento da Justiça Eleitoral',
    quantity: 2,
    unit: 'dias consecutivos ou não',
    isPaid: true,
    legalBase: 'CLT, Art. 473, V',
  },
  {
    code: 'servico_militar',
    name: 'Serviço Militar',
    description: 'Cumprimento das exigências do Serviço Militar',
    documentRequired: 'Comprovante ou convocação oficial',
    quantity: null,
    unit: 'tempo necessário',
    isPaid: true,
    legalBase: 'CLT, Art. 473, VI',
  },
  {
    code: 'vestibular',
    name: 'Prestação de Vestibular',
    description: 'Realização de provas para ingresso em estabelecimento de ensino superior',
    documentRequired: 'Comprovante de inscrição e realização da prova',
    quantity: null,
    unit: 'dias das provas',
    isPaid: true,
    legalBase: 'CLT, Art. 473, VII',
  },
  {
    code: 'comparecimento_justica',
    name: 'Comparecimento em Juízo',
    description: 'Comparecimento a juízo',
    documentRequired: 'Declaração ou certidão de comparecimento emitida pelo órgão judicial',
    quantity: null,
    unit: 'tempo necessário',
    isPaid: true,
    legalBase: 'CLT, Art. 473, VIII',
  },
  {
    code: 'atividade_sindical_internacional',
    name: 'Representação Sindical Internacional',
    description: 'Participação como representante de entidade sindical em organismo internacional do qual o Brasil seja membro',
    documentRequired: 'Convocação ou comprovante oficial',
    quantity: null,
    unit: 'tempo necessário',
    isPaid: true,
    legalBase: 'CLT, Art. 473, IX',
  },
  {
    code: 'acompanhamento_gestante',
    name: 'Acompanhamento de Esposa / Companheira Grávida',
    description: 'Acompanhamento da esposa ou companheira grávida em consultas médicas e exames complementares',
    documentRequired: 'Declaração ou comprovante de acompanhamento',
    quantity: 6,
    unit: 'consultas/exames durante a gravidez',
    isPaid: true,
    legalBase: 'CLT, Art. 473, X',
  },
  {
    code: 'acompanhamento_filho',
    name: 'Acompanhamento de Filho (até 6 anos)',
    description: 'Acompanhamento de filho de até 6 anos em consulta médica',
    documentRequired: 'Declaração ou atestado de acompanhamento',
    quantity: 1,
    unit: 'dia por ano',
    isPaid: true,
    legalBase: 'CLT, Art. 473, XI',
  },
  {
    code: 'exame_preventivo_cancer',
    name: 'Exames Preventivos de Câncer',
    description: 'Realização de exames preventivos de câncer',
    documentRequired: 'Comprovante ou declaração médica',
    quantity: 3,
    unit: 'dias a cada 12 meses',
    isPaid: true,
    legalBase: 'CLT, Art. 473, XII',
  },
]

async function main() {
  console.log('🌱 Inicializando tipos de declarações CLT Art. 473...')
  let count = 0

  for (const item of defaultDeclarations) {
    await prisma.declarationType.upsert({
      where: { code: item.code },
      create: {
        code: item.code,
        name: item.name,
        description: item.description,
        documentRequired: item.documentRequired,
        quantity: item.quantity,
        unit: item.unit,
        isPaid: item.isPaid,
        legalBase: item.legalBase,
        status: 'ATIVO',
      },
      update: {
        name: item.name,
        description: item.description,
        documentRequired: item.documentRequired,
        quantity: item.quantity,
        unit: item.unit,
        isPaid: item.isPaid,
        legalBase: item.legalBase,
      },
    })
    count++
  }

  console.log(`✅ ${count} tipos de declaração cadastrados/atualizados com sucesso!`)
}

main()
  .catch(err => {
    console.error('Erro ao importar tipos de declaração:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
