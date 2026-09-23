// src/app/api/imports/template/route.ts
import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') || 'xlsx'

  if (format === 'csv') {
    const csvContent = [
      'CPF;NOME_FUNCIONARIO;DATA_ATESTADO;DATA_INICIO;DATA_FIM;DIAS_AFASTAMENTO;CID;DESCRICAO_CID;MEDICO;CRM;OBSERVACOES',
      '123.456.789-00;João da Silva;10/05/2024;10/05/2024;12/05/2024;3;J06.9;Infecção aguda das vias aéreas;Dr. Carlos Eduardo;12345-MG;Repouso médico domiciliar',
      '987.654.321-11;Maria Oliveira;15/05/2024;15/05/2024;16/05/2024;2;M54.5;Dor lombar baixa;Dra. Ana Paula;54321-MG;Reavaliação ortopédica',
    ].join('\r\n')

    return new NextResponse('\uFEFF' + csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="modelo-importacao-atestados.csv"',
      },
    })
  }

  // Criar planilha XLSX formatada
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Gestão de Atestados'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Atestados', {
    views: [{ showGridLines: true }],
  })

  sheet.columns = [
    { header: 'CPF', key: 'cpf', width: 18 },
    { header: 'NOME_FUNCIONARIO', key: 'name', width: 26 },
    { header: 'DATA_ATESTADO', key: 'certDate', width: 16 },
    { header: 'DATA_INICIO', key: 'startDate', width: 16 },
    { header: 'DATA_FIM', key: 'endDate', width: 16 },
    { header: 'DIAS_AFASTAMENTO', key: 'daysOff', width: 18 },
    { header: 'CID', key: 'cid', width: 12 },
    { header: 'DESCRICAO_CID', key: 'cidDesc', width: 32 },
    { header: 'MEDICO', key: 'doctor', width: 24 },
    { header: 'CRM', key: 'crm', width: 16 },
    { header: 'OBSERVACOES', key: 'observations', width: 32 },
  ]

  // Estilo do cabeçalho
  const headerRow = sheet.getRow(1)
  headerRow.height = 28
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }, // Azul Primário
    }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  // Exemplos de dados
  sheet.addRow({
    cpf: '123.456.789-00',
    name: 'João da Silva',
    certDate: '10/05/2024',
    startDate: '10/05/2024',
    endDate: '12/05/2024',
    daysOff: 3,
    cid: 'J06.9',
    cidDesc: 'Infecção aguda das vias aéreas',
    doctor: 'Dr. Carlos Eduardo',
    crm: '12345-MG',
    observations: 'Repouso médico domiciliar',
  })

  sheet.addRow({
    cpf: '987.654.321-11',
    name: 'Maria Oliveira',
    certDate: '15/05/2024',
    startDate: '15/05/2024',
    endDate: '16/05/2024',
    daysOff: 2,
    cid: 'M54.5',
    cidDesc: 'Dor lombar baixa',
    doctor: 'Dra. Ana Paula',
    crm: '54321-MG',
    observations: 'Reavaliação ortopédica',
  })

  sheet.addRow({
    cpf: '456.789.123-22',
    name: 'Carlos Ferreira',
    certDate: '20/05/2024',
    startDate: '20/05/2024',
    endDate: '20/05/2024',
    daysOff: 1,
    cid: 'K52.9',
    cidDesc: 'Gastroenterite e colite não infecciosa',
    doctor: 'Dr. Roberto Souza',
    crm: '33445-MG',
    observations: 'Consulta de emergência',
  })

  // Formatação das linhas de exemplo
  for (let i = 2; i <= 4; i++) {
    const row = sheet.getRow(i)
    row.height = 22
    row.eachCell((cell, colNumber) => {
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 1 || colNumber === 6 || colNumber === 7 ? 'center' : 'left',
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      }
    })
  }

  // Adicionar aba de instruções
  const instructionsSheet = workbook.addWorksheet('Instruções')
  instructionsSheet.columns = [
    { header: 'Coluna', key: 'col', width: 22 },
    { header: 'Obrigatório', key: 'req', width: 14 },
    { header: 'Formato / Descrição', key: 'desc', width: 60 },
  ]
  const instHeader = instructionsSheet.getRow(1)
  instHeader.height = 26
  instHeader.eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
    c.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  const instructions = [
    { col: 'CPF', req: 'SIM', desc: 'CPF do colaborador (com ou sem pontuação: 000.000.000-00 ou 00000000000)' },
    { col: 'NOME_FUNCIONARIO', req: 'NÃO', desc: 'Nome do funcionário (usado como referência ou cadastro automático)' },
    { col: 'DATA_ATESTADO', req: 'SIM', desc: 'Data da emissão do atestado (ex: 15/05/2024 ou 2024-05-15)' },
    { col: 'DATA_INICIO', req: 'NÃO', desc: 'Data de início do afastamento (se omitido, usa a DATA_ATESTADO)' },
    { col: 'DATA_FIM', req: 'NÃO', desc: 'Data final do afastamento (se omitido, calculada via DIAS_AFASTAMENTO)' },
    { col: 'DIAS_AFASTAMENTO', req: 'SIM', desc: 'Quantidade de dias de afastamento médico (número inteiro: 1, 2, 5...)' },
    { col: 'CID', req: 'NÃO', desc: 'Código CID-10 do diagnóstico (ex: J06.9, M54.5, A09)' },
    { col: 'DESCRICAO_CID', req: 'NÃO', desc: 'Descrição ou nome da patologia/diagnóstico' },
    { col: 'MEDICO', req: 'NÃO', desc: 'Nome do médico ou profissional de saúde emissor' },
    { col: 'CRM', req: 'NÃO', desc: 'Registro profissional do médico (ex: 12345-MG)' },
    { col: 'OBSERVACOES', req: 'NÃO', desc: 'Observações internas ou detalhes do atestado' },
  ]

  for (const item of instructions) {
    const r = instructionsSheet.addRow(item)
    r.height = 20
    r.getCell(2).alignment = { horizontal: 'center' }
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer as any, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="modelo-importacao-atestados.xlsx"',
    },
  })
}
