// scripts/import-cids.js
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(__dirname, '..', 'prisma', 'cid10.json')
  console.log(`Lendo arquivo: ${filePath}`)

  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo ${filePath} não encontrado!`)
    process.exit(1)
  }

  const rawData = fs.readFileSync(filePath, 'utf8')
  const jsonList = JSON.parse(rawData)

  console.log(`Total de CIDs no arquivo JSON: ${jsonList.length}`)

  // Deduplicar e normalizar
  const seenCodes = new Set()
  const records = []

  for (const item of jsonList) {
    if (!item.codigo || !item.nome) continue
    const code = item.codigo.trim().toUpperCase()
    if (seenCodes.has(code)) continue
    seenCodes.add(code)

    records.push({
      id: `cid_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      code,
      description: item.nome.trim(),
      status: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  console.log(`Total de CIDs únicos para importar: ${records.length}`)

  // Inserir em lotes de 1000 com skipDuplicates
  const BATCH_SIZE = 1000
  let totalInserted = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const chunk = records.slice(i, i + BATCH_SIZE)
    const result = await prisma.cidCode.createMany({
      data: chunk,
      skipDuplicates: true,
    })
    totalInserted += result.count
    const currentProgress = Math.min(i + BATCH_SIZE, records.length)
    console.log(`Processado: ${currentProgress}/${records.length} (novos inseridos neste lote: ${result.count})`)
  }

  const finalCount = await prisma.cidCode.count()
  console.log(`\nImportação concluída com sucesso!`)
  console.log(`Novos registros inseridos: ${totalInserted}`)
  console.log(`Total de CIDs no banco de dados agora: ${finalCount}`)
}

main()
  .catch(err => {
    console.error('Erro na importação:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
