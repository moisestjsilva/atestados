const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const updates = [
  {
    "Nome": "RAFAEL SOUZA DO VALE",
    "CPF": "426.013.888-03",
    "Cargo": "Não informado",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "HEITOR BRUNO DA SILVA RIBEIRO",
    "CPF": "086.520.206-04",
    "Cargo": "Não informado",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "WELINGTON CRUZ DA ROCHA",
    "CPF": "169.449.636-80",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "VINICYUS AQUINO VICENTE",
    "CPF": "114.872.866-00",
    "Cargo": "ANALISTA DE CADASTRO",
    "Setor": "CADASTRO"
  },
  {
    "Nome": "THAYAN DA SILVA TAVARES PEREIRA",
    "CPF": "019.701.046-60",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "TALES DE SOUZA SILVA",
    "CPF": "123.081.366-77",
    "Cargo": "CONFERENTE",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "SAMIRA LEMOS TAVARES",
    "CPF": "115.409.216-03",
    "Cargo": "AUXILIAR DE FATURAMENTO",
    "Setor": "FATURAMENTO"
  },
  {
    "Nome": "RUDIERI TAVARES DA SILVA",
    "CPF": "125.059.766-86",
    "Cargo": "ANALISTA DE CADASTRO",
    "Setor": "CADASTRO"
  },
  {
    "Nome": "RIVELINO JOSE MIRANDA DE MORAES",
    "CPF": "028.832.926-04",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "REYNALDO GABRIEL DE OLIVEIRA SANTOS JUNIOR",
    "CPF": "148.187.507-86",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "RAYSSA PAULINO DOS SANTOS",
    "CPF": "152.848.027-99",
    "Cargo": "AUXILIAR DE SAC ECOMMERCE",
    "Setor": "SAC"
  },
  {
    "Nome": "RAMON DE PAULA MEDEIROS",
    "CPF": "104.773.536-90",
    "Cargo": "OPERADOR DE EMPILHADEIRA",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "RAFAEL TELLES CARNEIRO",
    "CPF": "111.036.496-20",
    "Cargo": "AUXILIAR DE CADASTRO",
    "Setor": "CADASTRO"
  },
  {
    "Nome": "RAFAEL JOSE DA SILVA",
    "CPF": "105.448.576-31",
    "Cargo": "CONFERENTE",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "PAULA DE FIGUEIREDO GONÇALVES MARQUES",
    "CPF": "105.063.026-28",
    "Cargo": "AUXILIAR DE SAC ECOMMERCE",
    "Setor": "SAC"
  },
  {
    "Nome": "MAYRA QUEIROZ LAMAS",
    "CPF": "121.051.086-36",
    "Cargo": "ANALISTA DE SAC E-COMMERCE",
    "Setor": "SAC"
  },
  {
    "Nome": "MARCIO DA SILVA",
    "CPF": "127.391.446-52",
    "Cargo": "CONFERENTE",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "MARCELA DE SOUZA LIMA",
    "CPF": "142.314.046-07",
    "Cargo": "AUXILIAR DE SAC ECOMMERCE",
    "Setor": "SAC"
  },
  {
    "Nome": "LUCAS SILVA DE SOUZA",
    "CPF": "130.957.436-70",
    "Cargo": "ASSISTENTE DE SAC E- COMMERCE",
    "Setor": "SAC"
  },
  {
    "Nome": "LUAN GERALDO DELMIRO DA SILVA",
    "CPF": "164.831.056-73",
    "Cargo": "AUXILIAR DE SAC ECOMMERCE",
    "Setor": "SAC"
  },
  {
    "Nome": "LEANDRO MILLE",
    "CPF": "110.703.007-21",
    "Cargo": "CONFERENTE",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "LAVÍNIA ANDRADE DE SOUZA",
    "CPF": "174.097.116-71",
    "Cargo": "ASSISTENTE DE LOGISTICA",
    "Setor": "LOGISTICA"
  },
  {
    "Nome": "KASSIA DE PAULA ROCHA",
    "CPF": "141.243.916-76",
    "Cargo": "AUXILIAR DE SAC ECOMMERCE",
    "Setor": "SAC"
  },
  {
    "Nome": "KAROLAYNE DAS NEVES LANES",
    "CPF": "129.837.796-02",
    "Cargo": "ASSISTENTE DE LOGISTICA",
    "Setor": "LOGISTICA"
  },
  {
    "Nome": "JULIANO DOS SANTOS REIS RAMIRO",
    "CPF": "128.156.736-14",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "JOZIELE PEREIRA SOARES MENDONCA",
    "CPF": "146.126.276-36",
    "Cargo": "AUXILIAR DE SAC ECOMMERCE",
    "Setor": "SAC"
  },
  {
    "Nome": "JOSE DOMINGOS DA SILVA FILHO",
    "CPF": "889.911.564-87",
    "Cargo": "ARRUMADOR DE CAMINHÕES",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "JOAO VICTOR LEANDRO MARTINS",
    "CPF": "181.167.966-82",
    "Cargo": "CONFERENTE",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "HELLEN CRISTINA DE SOUZA LOPES",
    "CPF": "132.507.886-78",
    "Cargo": "ANALISTA DE LOGISTICA",
    "Setor": "LOGISTICA"
  },
  {
    "Nome": "GRAZIELA ROCHA TEIXEIRA",
    "CPF": "172.031.486-10",
    "Cargo": "ASSISTENTE DE FATURAMENTO",
    "Setor": "FATURAMENTO"
  },
  {
    "Nome": "GIOVANNA CALIXTO LOPES",
    "CPF": "130.269.376-06",
    "Cargo": "AUXILIAR DE MARKETING",
    "Setor": "MARKETING MODERNA"
  },
  {
    "Nome": "GERSON DE SALES NOGUEIRA",
    "CPF": "062.749.886-88",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "FERNANDA SOUZA DAVID",
    "CPF": "189.916.236-46",
    "Cargo": "AUXILIAR DE SAC ECOMMERCE",
    "Setor": "SAC"
  },
  {
    "Nome": "FELIPE GONCALVES SILVA",
    "CPF": "107.886.446-29",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "EVENIZE APARECIDA MOTTA SILVA CANDIAN",
    "CPF": "058.461.676-75",
    "Cargo": "ASSISTENTE DE LOGISTICA",
    "Setor": "LOGISTICA"
  },
  {
    "Nome": "EVELYN CRISTINA PEIXOTO DO NASCIMENTO",
    "CPF": "141.710.456-22",
    "Cargo": "ASSISTENTE DE LOGISTICA",
    "Setor": "LOGISTICA"
  },
  {
    "Nome": "CLARA BRAGA DE ALMEIDA",
    "CPF": "151.897.446-55",
    "Cargo": "ASSISTENTE DE LOGISTICA",
    "Setor": "LOGISTICA"
  },
  {
    "Nome": "CARLOS EDUARDO TEIXEIRA",
    "CPF": "071.427.196-99",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "CARLOS CESAR PEREIRA MASSE",
    "CPF": "132.796.486-45",
    "Cargo": "PILOTO DE AVIAO",
    "Setor": "TRANSPORTE AEREO"
  },
  {
    "Nome": "ANDREIA CRISTINA RODRIGUES",
    "CPF": "006.577.406-08",
    "Cargo": "ANALISTA FINANCEIRO",
    "Setor": "ADMINISTRACAO"
  },
  {
    "Nome": "ANA LUIZA LAMOLHA SILVA",
    "CPF": "131.864.876-92",
    "Cargo": "AUXILIAR DE SAC ECOMMERCE",
    "Setor": "SAC"
  },
  {
    "Nome": "ADAO LUIZ ALMEIDA DIAS",
    "CPF": "046.363.426-82",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "WILLIAN SOARES",
    "CPF": "052.018.246-41",
    "Cargo": "MOTORISTA",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "WILLIAN GUILHERME LIMA DA SILVA",
    "CPF": "120.491.336-69",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "WILLIAM MARTINS DE SOUZA",
    "CPF": "061.463.346-00",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "WILLIAM DIAS COUTINHO",
    "CPF": "144.067.226-10",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "WESLEY VIANNA VIEIRA DOS SANTOS",
    "CPF": "139.701.096-71",
    "Cargo": "ALMOXARIFE",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "WESLEY NUNES PIRES DE CASTRO",
    "CPF": "075.387.436-93",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "WESLEY DE CASSIO MARTINS",
    "CPF": "071.995.496-79",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "WESLEY AMARAL DA SILVA",
    "CPF": "140.609.006-99",
    "Cargo": "ALMOXARIFE",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "WENDEL WAGNER DE JESUS FRAGOSO",
    "CPF": "064.336.667-95",
    "Cargo": "AUXILIAR DE PCP",
    "Setor": "PCP"
  },
  {
    "Nome": "WELLITON DA SILVA CARVALHO",
    "CPF": "093.390.366-97",
    "Cargo": "SUPERVISOR I",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "WELLINGTON RODRIGUES DA COSTA",
    "CPF": "031.807.426-58",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "WARLEY DA SILVA ALVES",
    "CPF": "181.695.746-17",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "WANDERLEY CARDOSO ROCHA",
    "CPF": "102.234.966-00",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "WALLACE GABRIEL MILAGRE OSCAR",
    "CPF": "189.628.776-00",
    "Cargo": "AUXILIAR DE MAQUINAS - FILETAC",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "WALLACE ANDRAY DE SOUZA E SILVA",
    "CPF": "020.183.716-14",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "VIVIANA DA SILVA ROCHA",
    "CPF": "092.111.546-69",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "VITORIA PIRES",
    "CPF": "149.170.476-41",
    "Cargo": "AUXILIAR FINANCEIRO/COBRANCA",
    "Setor": "FINANCEIRO"
  },
  {
    "Nome": "VITOR ARAUJO PIRES",
    "CPF": "136.536.006-77",
    "Cargo": "AUXILIAR DE PINTOR",
    "Setor": "PINTURA P.U."
  },
  {
    "Nome": "VINICIUS RIBEIRO DE ALMEIDA",
    "CPF": "096.969.366-48",
    "Cargo": "ANALISTA DE PCP",
    "Setor": "PCP"
  },
  {
    "Nome": "VINICIUS JOSE DA SILVA SANTOS MARQUEZINI",
    "CPF": "137.567.266-57",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "VINICIUS FURTADO DE REZENDE",
    "CPF": "129.674.236-96",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "VINICIUS DA SILVA PASCHOALINI",
    "CPF": "049.532.136-29",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "VICTOR YAN PEREIRA PIZIOLO DA SILVA",
    "CPF": "155.245.167-44",
    "Cargo": "AUXILIAR OPERADOR MAQUINA U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "VICTOR LUCAS DE SOUZA",
    "CPF": "164.668.716-73",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "VICTOR HUGO DA SILVA DIAS",
    "CPF": "169.452.016-19",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "VERA LUCIA MOREIRA PIMENTEL",
    "CPF": "054.556.036-55",
    "Cargo": "EMBALADOR(A) - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "VASCONCELOS QUEIROZ DE SOUZA",
    "CPF": "164.777.516-74",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "VANESSA CASTRO CARVALHO",
    "CPF": "129.102.746-75",
    "Cargo": "AUXILIAR DE MAQUINAS - FILETAC",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "VANDERLAN FERREIRA DE OLIVEIRA",
    "CPF": "025.320.906-42",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "VALERIA APARECIDA ALVES DA SILVA FERNANDES",
    "CPF": "008.468.066-06",
    "Cargo": "LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "VALDEIR AUGUSTO MEDEIROS",
    "CPF": "117.178.616-60",
    "Cargo": "LIDER DE SETOR - EXPEDICAO",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "UESLEI NASCIMENTO DE OLIVEIRA",
    "CPF": "132.393.996-28",
    "Cargo": "ARRUMADOR DE CAMINHOES",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "TONY CARLOS MARQUES DOS SANTOS",
    "CPF": "080.661.136-76",
    "Cargo": "ALMOXARIFE",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "TONY ARAEL ALMEIDA DA SILVA",
    "CPF": "146.355.906-23",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "TIAGO RODRIGUES MOREIRA",
    "CPF": "120.410.736-08",
    "Cargo": "CONFERENTE (UV)",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "TIAGO FERREIRA",
    "CPF": "015.611.196-95",
    "Cargo": "Nulo",
    "Setor": "Nulo"
  },
  {
    "Nome": "THYAGO DE SOUZA MARIANO DA SILVA",
    "CPF": "165.362.536-80",
    "Cargo": "AUXILIAR JURIDICO",
    "Setor": "JURIDICO"
  },
  {
    "Nome": "THIAGO POMPEO DA SILVA",
    "CPF": "058.970.996-85",
    "Cargo": "MOTORISTA",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "THIAGO MENDES DOS SANTOS",
    "CPF": "700.540.816-02",
    "Cargo": "AUXILIAR DE PINTOR",
    "Setor": "PINTURA P.U."
  },
  {
    "Nome": "THAYNARA PEREIRA",
    "CPF": "135.088.126-00",
    "Cargo": "OP DE MÁQUINAS - FILETAÇÃO MAN",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "THAYENE DO CARMO CARNEIRO",
    "CPF": "149.201.596-25",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "THAMIRES SILVERIO DE SOUZA",
    "CPF": "168.358.276-45",
    "Cargo": "TECNICO EM SEGURANCA TRABALHO",
    "Setor": "SESMT"
  },
  {
    "Nome": "THAIS APARECIDA LOPES TRINDADE",
    "CPF": "131.716.576-43",
    "Cargo": "APRENDIZ DE COST DE ESTOFADOS",
    "Setor": "SENAI"
  },
  {
    "Nome": "TATIANE DIAS RODRIGUES",
    "CPF": "128.990.676-99",
    "Cargo": "TECNICO EM SEGURANCA TRABALHO",
    "Setor": "SESMT"
  },
  {
    "Nome": "TATIANA DAS GRACAS LUCAS",
    "CPF": "084.970.436-77",
    "Cargo": "AUX DE MÁQUINAS - FILETAÇÃO MA",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "TATIANA APARECIDA DE SOUZA SILVA",
    "CPF": "102.250.226-30",
    "Cargo": "LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "TALIS DE SOUZA CAETANO",
    "CPF": "152.094.726-71",
    "Cargo": "SUPERVISOR- FURAÇÃO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "SUZANA CRISTINA NEVES SILVA",
    "CPF": "122.871.916-07",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "STEFANY GONCALVES DA SILVA",
    "CPF": "146.803.636-06",
    "Cargo": "CONFERENTE - EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "SIMONIA LEITE",
    "CPF": "064.236.006-51",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "SIMONE TEIXEIRA GUALBERTO",
    "CPF": "139.390.156-52",
    "Cargo": "AUXILIAR DE COZINHA",
    "Setor": "REFEITORIO"
  },
  {
    "Nome": "SIMONE ALANO TAVARES MARQUES",
    "CPF": "096.755.787-93",
    "Cargo": "AUX DE MÁQUINAS - FILETAÇÃO MA",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "SILVANIA ROCHA",
    "CPF": "071.794.606-13",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "SILVANI DE BARROS",
    "CPF": "001.786.316-39",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "SEBASTIAO DE OLIVEIRA",
    "CPF": "914.992.086-34",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "SARA LUIZA DAS NEVES COUTO",
    "CPF": "145.574.776-90",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "SANDRA APARECIDA PEREIRA DA COSTA",
    "CPF": "069.220.026-60",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "SAMUEL FERREIRA CARVALHO",
    "CPF": "191.725.156-43",
    "Cargo": "AUXILIAR DE CONFERENTE - AT",
    "Setor": "ASSISTENCIA TECNICA"
  },
  {
    "Nome": "SAMUEL DOS SANTOS TAVARES",
    "CPF": "066.661.176-97",
    "Cargo": "OPERADOR DE MAQUINA - FILETACA",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "SAMILLA CHAGAS NETO SILVA",
    "CPF": "151.676.496-09",
    "Cargo": "AUXILIAR DE COLADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "SAMARA FRANCISCO CARDOSO",
    "CPF": "143.073.876-60",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "ROSIMAR MASSARDI BRAGA",
    "CPF": "015.266.596-03",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "ROSILENE NARCIZO DE MENEZES",
    "CPF": "091.269.016-09",
    "Cargo": "COSTUREIRO(A)",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ROSILANE APARECIDA DA SILVA",
    "CPF": "067.332.526-19",
    "Cargo": "AUX DE MÁQUINAS - FILETAÇÃO MA",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "ROSANA APARECIDA DA SILVA",
    "CPF": "050.504.826-40",
    "Cargo": "AUXILIAR DE COZINHA",
    "Setor": "REFEITORIO"
  },
  {
    "Nome": "ROSALINA SOARES DOS REIS",
    "CPF": "078.299.886-09",
    "Cargo": "AUXILIAR DE LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "ROSALIA MORAES FERRAZ",
    "CPF": "083.170.666-06",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "RONDINELI ROCHA DO NASCIMENTO",
    "CPF": "070.297.686-55",
    "Cargo": "CONFERENTE - EXPEDICAO",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "RONALDO DA SILVA",
    "CPF": "067.499.436-16",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "RONALDO CORREA DOS SANTOS",
    "CPF": "819.979.576-04",
    "Cargo": "LIDER DE SETOR - EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "RONALDO ADRIANO DA SILVA",
    "CPF": "041.442.056-06",
    "Cargo": "Não informado",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "ROMULO GOMES DE SOUZA",
    "CPF": "178.167.436-10",
    "Cargo": "OPERADOR DE MAQUINA - FILETACA",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "ROMILSON CORDEIRO FOFANO",
    "CPF": "038.969.336-71",
    "Cargo": "AUXILIAR DE MAQUINAS - FILETAC",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "ROMARIO OLIVEIRA DE PAULA",
    "CPF": "066.867.096-70",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "ROMARIO LIMA MOTA",
    "CPF": "100.215.476-61",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ROMARIO DE QUEIROZ FURTUNATO",
    "CPF": "092.543.676-30",
    "Cargo": "MECANICO DE MANUTENCAO",
    "Setor": "MANUTENCAO DE MAQUINAS"
  },
  {
    "Nome": "ROGILSON RIBEIRO RUBIM",
    "CPF": "041.441.946-47",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "ROGERIO SILVA",
    "CPF": "771.153.686-00",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "ROGERIO BATISTA FERNANDES",
    "CPF": "030.263.796-62",
    "Cargo": "PINTOR",
    "Setor": "PINTURA P.U."
  },
  {
    "Nome": "RODRIGO SANTOS SILVEIRA MANA VALERIO",
    "CPF": "072.126.646-00",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "RODRIGO FRANCISCO OLIVEIRA",
    "CPF": "132.598.546-57",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ROBERTO GONCALVES SILVA",
    "CPF": "090.416.116-14",
    "Cargo": "CONFERENTE - EXPEDICAO",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "ROBERTO DE OLIVEIRA ALMEIDA",
    "CPF": "090.412.386-38",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "ROBERTH APARECIDO PASCHOALINO",
    "CPF": "140.832.966-23",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "RIVELINO TAVARES ORSINI",
    "CPF": "751.185.486-91",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "RIVELINO CAMILO CONDE",
    "CPF": "034.114.556-40",
    "Cargo": "CONFERENTE - EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "RICKELME TEIXEIRA AQUINO",
    "CPF": "132.717.226-76",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "RICARDO VAZ GONZAGA",
    "CPF": "926.274.396-34",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "RHERISSON VINICIUS MAGALHAES",
    "CPF": "082.649.076-01",
    "Cargo": "OP DE MÁQUINAS - FILETAÇÃO MAN",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "RENATO VICENTE MOREIRA",
    "CPF": "130.595.506-46",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "RENATO DA SILVA RAFAEL",
    "CPF": "142.079.556-23",
    "Cargo": "Não informado",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "REINILSON BENTENARIO VAZ",
    "CPF": "060.347.836-07",
    "Cargo": "ELETROMECANICO",
    "Setor": "MANUTENCAO DE MAQUINAS"
  },
  {
    "Nome": "REINALDO TAVARES ORSINI",
    "CPF": "751.186.886-04",
    "Cargo": "MOTORISTA",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "REINALDO DE LIMA COELHO",
    "CPF": "029.498.136-58",
    "Cargo": "MONTADOR - QUALIDADE",
    "Setor": "QUALIDADE"
  },
  {
    "Nome": "REGINALDO ROSA RANDOLFO",
    "CPF": "085.792.736-17",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "REGINA LIZARDO GOMES",
    "CPF": "041.631.456-21",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "RAYANE APARECIDA DE ARAUJO GERMANO",
    "CPF": "141.621.546-86",
    "Cargo": "RECEPCIONISTA",
    "Setor": "ADMINISTRACAO"
  },
  {
    "Nome": "RAVEL ELIAS ROCHA DOS REIS",
    "CPF": "166.771.636-01",
    "Cargo": "Não informado",
    "Setor": "CORTE"
  },
  {
    "Nome": "RAUL DA COSTA FAUSTINO",
    "CPF": "094.519.166-95",
    "Cargo": "Não informado",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "RAQUEL DE OLIVEIRA PEREIRA",
    "CPF": "104.764.696-00",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "RANILSON DOS SANTOS RUBIM",
    "CPF": "041.716.276-64",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "RALIELE GABRIEL CANDIDO",
    "CPF": "126.742.986-00",
    "Cargo": "SUPERVISOR - US/CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "RAFAELA ALVIM PINTO",
    "CPF": "099.684.636-04",
    "Cargo": "ANALISTA DE CREDITO",
    "Setor": "FINANCEIRO"
  },
  {
    "Nome": "RAFAEL AUGUSTO GUIMARAES AGUIAR",
    "CPF": "077.410.076-10",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "PRISCILA MORAIS FARIA",
    "CPF": "102.541.166-80",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "POLIANA DO NASCIMENTO GONCALVES",
    "CPF": "107.955.896-97",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "PEDRO LUCAS TEIXEIRA",
    "CPF": "139.504.186-52",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "PEDRO HENRIQUE SILVA SANTOS",
    "CPF": "177.533.886-06",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "PEDRO HENRIQUE DA SILVA",
    "CPF": "701.315.416-41",
    "Cargo": "Não informado",
    "Setor": "CORTE"
  },
  {
    "Nome": "PEDRO GOMES CORREA",
    "CPF": "383.741.886-34",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "PAULO RICARDO FERREIRA DE SOUZA",
    "CPF": "183.905.486-74",
    "Cargo": "Não informado",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "PAULO GIOVANE FERREIRA",
    "CPF": "063.581.126-00",
    "Cargo": "OPERADOR EMPILHADEIRA",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "PAULO GEOVANI GERALDO",
    "CPF": "050.985.506-70",
    "Cargo": "LIDER DE SETOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "PAULO CESAR OLIVEIRA SILVA",
    "CPF": "656.609.516-00",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "PAULO CESAR GOMES PEREIRA",
    "CPF": "062.067.836-42",
    "Cargo": "LIDER DE SETOR - EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "PALOMA DA SILVA ANTENOR",
    "CPF": "103.923.176-48",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "PABLO HENRIQUE SANTOS RANIEL",
    "CPF": "062.137.559-42",
    "Cargo": "AUXILIAR DE MAQUINAS - FILETAC",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "PABLO EDUARDO DE MOURA FERREIRA",
    "CPF": "034.213.086-24",
    "Cargo": "MECANICO DE MANUTENCAO",
    "Setor": "MANUTENCAO DE MAQUINAS"
  },
  {
    "Nome": "OLDAIR CLAUDIO RODRIGUES",
    "CPF": "077.928.436-45",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "OLAVIO DOS REIS MEIRELES",
    "CPF": "855.434.036-15",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "ODAIR HENRIQUE CONSTANCIO LUIZ",
    "CPF": "137.319.706-43",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "NORBERTO VIEIRA",
    "CPF": "173.939.928-50",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "NICOLLY APARECIDA DE SOUZA",
    "CPF": "164.668.646-26",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "NELSON PINTO DA SILVA",
    "CPF": "033.262.497-80",
    "Cargo": "OPERADOR DE MAQUINA - FILETACA",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "NEDSON DE JESUS REIS ALEXANDRE",
    "CPF": "155.140.656-00",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "NATHALY AMARAL CARIUS QUIRINO",
    "CPF": "159.775.197-96",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "NATHALIA DE OLIVEIRA XAVIER",
    "CPF": "125.688.596-79",
    "Cargo": "ASSISTENTE DE RH",
    "Setor": "RECURSOS HUMANOS"
  },
  {
    "Nome": "NATANAEL SOARES VIEIRA ROBERTO",
    "CPF": "171.264.196-43",
    "Cargo": "AUXILIAR DE MARKETING",
    "Setor": "MARKETING"
  },
  {
    "Nome": "NATALIA LOPES DOS SANTOS",
    "CPF": "090.763.576-84",
    "Cargo": "AUXILIAR DE LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "NATÁLIA CARDOSO DE OLIVEIRA",
    "CPF": "162.605.356-19",
    "Cargo": "AUXILIAR FISCAL",
    "Setor": "CONTABILIDADE"
  },
  {
    "Nome": "NATALIA APARECIDA PEREIRA COSTA",
    "CPF": "131.969.296-63",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MURILO ANASTACIO DE MOURA MARCIANO",
    "CPF": "195.795.486-84",
    "Cargo": "AUXILIAR OPERADOR MAQUINA U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "MOISES RODRIGUES PIMENTEL",
    "CPF": "030.538.196-27",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MOACIR DE MATOS BASILIO",
    "CPF": "254.062.778-12",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "MILTON CELIO PEREIRA",
    "CPF": "496.827.416-53",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "MICHELE DE AQUINO FREDERICO",
    "CPF": "187.258.636-81",
    "Cargo": "AUXILIAR DE LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "MICHELE CHAGAS DA SILVA REIS",
    "CPF": "122.648.246-54",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MELISSA SOARES PEREIRA",
    "CPF": "134.937.726-02",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "MAXWELL RUFINO PENA",
    "CPF": "086.563.536-67",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "MAURO BATISTA DA ROCHA",
    "CPF": "002.315.401-24",
    "Cargo": "MOTORISTA",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "MAURICIO ANTONIO DE SOUZA",
    "CPF": "406.590.896-53",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "MATHEUS FERREIRA CARNEIRO",
    "CPF": "164.368.546-57",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "MATHEUS DE ALMEIDA GUMIER RODRIGUES",
    "CPF": "116.655.416-36",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "MATEUS ROCHA DA SILVA",
    "CPF": "152.301.936-03",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MATEUS MIRANDA OLIVEIRA",
    "CPF": "174.673.526-03",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "MATEUS BETO DA SILVA ROSA",
    "CPF": "122.005.246-92",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "MATEUS ANTONIO DE OLIVEIRA",
    "CPF": "113.630.676-56",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MARTA CRISTIANO GONCALVES",
    "CPF": "127.119.056-75",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "MARLUS LEMOS RAMOS",
    "CPF": "100.609.846-19",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "MARLON ARAUJO DURAES",
    "CPF": "129.119.866-01",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MARLI DE FATIMA ALELUIA SANTOS",
    "CPF": "048.460.566-60",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARINA BATISTA",
    "CPF": "084.399.556-42",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARILENE FLORIANO MARLIERE COSTA",
    "CPF": "062.835.776-10",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MARILENE FIGUEIREDO DE PAULA FERNANDES",
    "CPF": "145.134.386-81",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARILENE APARECIDA ALELUIA SILVA",
    "CPF": "065.872.126-70",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MARIA MADALENA PINTO DE CASTRO",
    "CPF": "047.283.686-29",
    "Cargo": "COZINHEIRA(O)",
    "Setor": "REFEITORIO"
  },
  {
    "Nome": "MARIA LAURA ROMANHOLI SILVEIRA",
    "CPF": "159.186.836-07",
    "Cargo": "APRENDIZ DE MARCENEIRO DE MOVE",
    "Setor": "SENAI"
  },
  {
    "Nome": "MARIA HELENA LEITE VIEIRA",
    "CPF": "065.864.886-13",
    "Cargo": "COSTUREIRO(A)",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARIA FERNANDA TIMOTE OLIVEIRA",
    "CPF": "156.179.746-45",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARIA ELISA FONSECA HELENO",
    "CPF": "191.856.786-78",
    "Cargo": "APRENDIZ DE MARCENEIRO DE MOVE",
    "Setor": "SENAI"
  },
  {
    "Nome": "MARIA DO CARMO TELES MENEZES",
    "CPF": "958.048.546-15",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MARIA DO CARMO PEDRO",
    "CPF": "052.930.216-05",
    "Cargo": "AUXILIAR DE EMBALAGEM - ESTOFA",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARIA DE LOURDES VIEIRA DE MEDEIROS BENJAMIM",
    "CPF": "070.086.036-30",
    "Cargo": "AUXILIAR DE EMBALAGEM - ESTOFA",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARIA DE LOURDES QUEIROZ DA SILVA",
    "CPF": "055.366.306-28",
    "Cargo": "LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "MARIA DE LOURDES DO NASCIMENTO DE MELO",
    "CPF": "746.723.206-34",
    "Cargo": "LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "MARIA DE LOURDES DE OLIVEIRA BASILIO",
    "CPF": "052.859.946-16",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MARIA APARECIDA FLORENTINO",
    "CPF": "093.210.866-09",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARIA AMÉLIA PINTO DE CASTRO",
    "CPF": "052.520.826-77",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "MARCUS VINICIUS DE OLIVEIRA SANTOS MOREIRA",
    "CPF": "153.402.856-00",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "MARCOS TEIXEIRA DE OLIVEIRA",
    "CPF": "131.402.006-41",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARCOS RAFAEL CAIK BARROSO RIBEIRO",
    "CPF": "172.309.316-57",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "MARCOS PAULO DA SILVA MATHEUS",
    "CPF": "940.833.125-72",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "MARCOS ANTONIO PEIXOTO ANDRADE",
    "CPF": "019.484.276-21",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MARCONY LAGE FREITAS",
    "CPF": "116.003.936-40",
    "Cargo": "AUXILIAR DE TI",
    "Setor": "TI - TECNOLOGIA DA INFORMAÇÃO"
  },
  {
    "Nome": "MARCO TULIO VIEIRA MARTINS",
    "CPF": "111.215.146-00",
    "Cargo": "AUXILIAR OPERADOR MAQUINA U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "MARCO ANTÔNIO FRANCO HENRIQUES",
    "CPF": "915.388.746-87",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "MARCIO KAICK VITAL DOS SANTOS",
    "CPF": "145.221.326-70",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARCIO JOSE DE MOURA",
    "CPF": "061.376.356-43",
    "Cargo": "AUXILIAR DE MAQUINAS - FILETAC",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "MARCIO DIAS",
    "CPF": "773.856.406-72",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MARCELO OLIVEIRA GUMANELLI DO VALE",
    "CPF": "092.103.806-22",
    "Cargo": "CORTADOR(EIRA)",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARCELO MARTINS CIPRIANO",
    "CPF": "885.756.756-72",
    "Cargo": "OP DE MÁQUINAS - FILETAÇÃO MAN",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "MARCELO JULIO DA SILVA",
    "CPF": "030.084.336-42",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "MARCELO JORGE OLIVEIRA",
    "CPF": "024.416.896-22",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "MARCELO DA SILVA VICENTE",
    "CPF": "898.763.426-49",
    "Cargo": "CONFERENTE (UV)",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "MARCELO CAMPOS",
    "CPF": "054.460.496-24",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "MARCELO CACAO DA SILVA",
    "CPF": "051.138.806-39",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "MARCELE EMILIA OLIVEIRA DE JESUS",
    "CPF": "102.530.606-64",
    "Cargo": "LIDER DE SETOR - ESTOFAÇÃO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MARCELA DE PAIVA FARIA CORDEIRO",
    "CPF": "112.567.056-83",
    "Cargo": "ANALISTA COMERCIAL",
    "Setor": "COMERCIAL"
  },
  {
    "Nome": "MANISSON RIBEIRO PACHECO",
    "CPF": "096.582.966-96",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MAICON DOS REIS DA SILVA RUFINO",
    "CPF": "111.106.996-46",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "MAGNA DOS SANTOS",
    "CPF": "232.534.718-45",
    "Cargo": "Não informado",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "MACIEL BENTO DE QUEIROZ SILVA",
    "CPF": "123.621.546-02",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "LUZIE LUCILIO DOS SANTOS",
    "CPF": "519.950.006-63",
    "Cargo": "CONFERENTE - AT",
    "Setor": "ASSISTENCIA TECNICA"
  },
  {
    "Nome": "LUMARA DE OLIVEIRA RIBEIRO",
    "CPF": "137.683.626-20",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "LUIZ LANES DE PAULA",
    "CPF": "042.572.466-26",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "LUIZ CARLOS MARTINS JUNIOR",
    "CPF": "040.723.376-84",
    "Cargo": "SUPERVISOR - MANUTENCAO",
    "Setor": "MANUTENCAO DE MAQUINAS"
  },
  {
    "Nome": "LUIZ CARLOS DA CRUZ SILVA",
    "CPF": "090.968.426-00",
    "Cargo": "OPERADOR DE MAQUINA - FILETACA",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "LUIZ ANTONIO CARVALHO",
    "CPF": "002.672.076-03",
    "Cargo": "PINTOR",
    "Setor": "PINTURA P.U."
  },
  {
    "Nome": "LUISMAR DE OLIVEIRA JUNIOR",
    "CPF": "177.112.056-86",
    "Cargo": "AUXILIAR DE CONFERENTE - EMBAL",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "LUIS ERNESTO RAMIREZ GUERRA",
    "CPF": "052.998.536-53",
    "Cargo": "AUXILIAR OPERADOR MAQUINA U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "LUDMILA DA SILVA CRUZ ROCHA",
    "CPF": "122.590.956-23",
    "Cargo": "ANALISTA FINANCEIRO",
    "Setor": "FINANCEIRO"
  },
  {
    "Nome": "LUCILENE MENDES DA SILVA",
    "CPF": "107.294.126-01",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "LUCILENE EUGENIO REGAZI",
    "CPF": "039.287.356-75",
    "Cargo": "LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "LUCIANO DA SILVA AGUIAR",
    "CPF": "129.662.707-13",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "LUCIANA MARQUES PEREIRA DA SILVA",
    "CPF": "103.618.036-05",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "LUCIANA APARECIDA GARCIA",
    "CPF": "058.651.716-23",
    "Cargo": "SUPERVISOR - MANUTENCAO",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "LUCIA APARECIDA DE OLIVEIRA ROCHA",
    "CPF": "855.439.006-78",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "LUCAS VAZ DE OLIVEIRA",
    "CPF": "704.070.336-02",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "LUCAS SOARES SILVA",
    "CPF": "148.213.526-48",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "LUCAS RODRIGUES NARCIZO FERREIRA",
    "CPF": "125.103.716-06",
    "Cargo": "ELETROMECANICO",
    "Setor": "MANUTENCAO DE MAQUINAS"
  },
  {
    "Nome": "LUCAS MORAES FERREIRA",
    "CPF": "154.845.906-20",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "LUCAS MARTINS LOPES",
    "CPF": "155.169.496-45",
    "Cargo": "OPERADOR EMPILHADEIRA",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "LUCAS MARQUES DA SILVA",
    "CPF": "703.916.866-90",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "LUCAS MAGNO MORAIS MOREIRA",
    "CPF": "701.013.136-83",
    "Cargo": "ALMOXARIFE",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "LUCAS FIGUEIREDO DE PAULA",
    "CPF": "130.700.366-43",
    "Cargo": "SUPERVISOR - EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "LUCAS DIOGO DE QUEIROZ APOSTOLO",
    "CPF": "164.924.356-13",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "LUCAS DE OLIVEIRA MARTINS",
    "CPF": "121.821.946-73",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "LUCAS DA SILVA VICENTE",
    "CPF": "142.170.026-37",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "LUCAS CIRINO PINHEIRO",
    "CPF": "111.902.686-55",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "LUCAS CANDIDO MARTINS",
    "CPF": "185.441.796-73",
    "Cargo": "ASSISTENTE DE FATURAMENTO",
    "Setor": "FATURAMENTO"
  },
  {
    "Nome": "LUCAS ALVES SILVA",
    "CPF": "191.636.426-89",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "LUANA CRISTINA DA SILVA",
    "CPF": "122.811.396-38",
    "Cargo": "OPERADOR DE MAQUINA DE BORDAR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "LORRAYNI LUIZA DE OLIVEIRA FERNANDES",
    "CPF": "155.114.066-78",
    "Cargo": "AUXILIAR DE LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "LORRAN AFFONSO MIRANDA",
    "CPF": "144.954.246-88",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "LINDAURA CRISTINA TEIXEIRA",
    "CPF": "039.888.536-23",
    "Cargo": "COSTUREIRO(A)",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "LINA DOS SANTOS CARDOSO DA SILVA",
    "CPF": "027.360.797-95",
    "Cargo": "FAXINEIRO (A) - PRODUÇÃO",
    "Setor": "SERVICOS GERAIS"
  },
  {
    "Nome": "LETICIA MORAIS RUFINO",
    "CPF": "173.407.606-28",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "LEONIDAS GOMES PEREIRA",
    "CPF": "866.804.476-15",
    "Cargo": "PINTOR",
    "Setor": "PINTURA P.U."
  },
  {
    "Nome": "LEONARDO REIS RIBEIRO",
    "CPF": "116.159.996-71",
    "Cargo": "LIDER DE SETOR - FURAÇÃO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "LEONARDO PEREIRA",
    "CPF": "121.490.086-02",
    "Cargo": "OPERADOR DE MAQUINA - FILETACA",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "LEONARDO MENDES ALVES DE ALMEIDA",
    "CPF": "119.379.616-48",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "LEONARDO JUSTE DE SOUZA",
    "CPF": "135.058.866-02",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "LEONARDO DA SILVA PAULA",
    "CPF": "134.540.776-99",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "LEANDRO RIBEIRO SOARES",
    "CPF": "123.138.926-54",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "LEANDRO LUIZ ROSA",
    "CPF": "095.219.376-02",
    "Cargo": "LIDER DE SETOR - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "LEANDRO LIMA TAVARES",
    "CPF": "123.262.126-90",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "LEANDRO DE LIMA",
    "CPF": "105.064.496-45",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "LEANDRO DA SILVA MEGRES",
    "CPF": "043.611.096-21",
    "Cargo": "AUXILIAR DE MAQUINAS - FILETAC",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "LAVINYA MORAIS RUFINO",
    "CPF": "169.262.226-90",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "LARISSA RODRIGUES",
    "CPF": "122.106.906-33",
    "Cargo": "LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "LARA MARIA MARIANO DA SILVA",
    "CPF": "154.201.186-88",
    "Cargo": "APRENDIZ ESTOFADOR DE MOVEIS",
    "Setor": "SENAI"
  },
  {
    "Nome": "LAIS RUBINICH FERREIRA RUFATO",
    "CPF": "015.947.226-17",
    "Cargo": "ADMINISTRADOR",
    "Setor": "ADMINISTRACAO"
  },
  {
    "Nome": "KETHELYN DE OLIVEIRA SILVA",
    "CPF": "194.694.636-25",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "KESI JONHAT SOUZA CALIXTO",
    "CPF": "135.752.236-37",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "KAUE GONCALVES GOMES",
    "CPF": "153.512.616-77",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "KAUANE LADEIRA RAMOS",
    "CPF": "172.152.676-52",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "KATRINE CLARA LUIS COELHO COSTA",
    "CPF": "138.949.136-65",
    "Cargo": "APRENDIZ DE COST DE ESTOFADOS",
    "Setor": "SENAI"
  },
  {
    "Nome": "KATIA APARECIDA DA SILVA",
    "CPF": "050.001.916-92",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "KAROLAINE CRISTINA MAZZIOLLI DE JESUS",
    "CPF": "135.440.366-57",
    "Cargo": "AUXILIAR DE LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "KAROLAINE ANTONIA DO CARMO SILVA",
    "CPF": "134.755.486-66",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "KARINA SENOBIA GARCIA DE UBAN",
    "CPF": "713.580.172-55",
    "Cargo": "AUXILIAR DE COZINHA",
    "Setor": "REFEITORIO"
  },
  {
    "Nome": "KAIO RAMOS GONCALVES",
    "CPF": "146.121.106-92",
    "Cargo": "APRENDIZ DE COST DE ESTOFADOS",
    "Setor": "SENAI"
  },
  {
    "Nome": "JUSSARA DOS SANTOS",
    "CPF": "013.091.064-36",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "JULIO JOSE CRESCEMBENI DE PAULA",
    "CPF": "129.164.676-02",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "JULIO GLEISSON BRAGA DE OLIVEIRA",
    "CPF": "153.644.716-16",
    "Cargo": "AUX. DE OPERADOR DE MÁQUINAS",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "JULIO CEZAR GONCALVES SILVA",
    "CPF": "085.298.466-99",
    "Cargo": "CONFERENTE (UV)",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "JULIO CESAR LIMA",
    "CPF": "085.400.156-50",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "JULIO AFONSO PEREIRA",
    "CPF": "037.252.716-74",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "JULIANO DOS SANTOS CORDEIRO",
    "CPF": "040.224.096-06",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "JULIANA GOMES DE ARAUJO OLIVEIRA",
    "CPF": "061.431.586-73",
    "Cargo": "TECNICO EM SEGURANCA TRABALHO",
    "Setor": "SESMT"
  },
  {
    "Nome": "JUAN VIEIRA FERREIRA",
    "CPF": "142.610.896-61",
    "Cargo": "COMPRADOR I",
    "Setor": "COMPRAS"
  },
  {
    "Nome": "JOSE RAFAEL CORREIA SANTOS",
    "CPF": "073.541.145-02",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "JOSE MARIA HENRIQUES MARTINS",
    "CPF": "750.544.006-30",
    "Cargo": "OPERADOR DE MAQUINA - FILETACA",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "JOSE MANUEL DIAZ ACOSTA",
    "CPF": "053.945.626-87",
    "Cargo": "AUXILIAR OPERADOR MAQUINA U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "JOSE ISRAEL RODRIGUES",
    "CPF": "138.851.246-70",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "JOSE HENRIQUE DE OLIVEIRA GOMES",
    "CPF": "147.950.476-93",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "JOSE GUILHERME BATISTA",
    "CPF": "125.843.696-56",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "JOSE FRANCISCO PINTO",
    "CPF": "043.993.026-07",
    "Cargo": "FAXINEIRA(O)",
    "Setor": "SERVICOS GERAIS"
  },
  {
    "Nome": "JOSE EMILIO LORENZETTO",
    "CPF": "235.413.776-15",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "JOSE CARLOS PEREIRA",
    "CPF": "048.070.086-92",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "JOSE CARLOS LUIZ MOREIRA",
    "CPF": "099.516.426-67",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "JORGE FELISBINO DA SILVA",
    "CPF": "071.191.976-30",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "JORGE DAMIAO DE OLIVEIRA",
    "CPF": "100.295.108-99",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "JORDANA DE SOUZA TEIXEIRA JUSTE",
    "CPF": "122.819.616-80",
    "Cargo": "AUXI. DE ASSISTÊNCIA TÉCNICA",
    "Setor": "COMERCIAL"
  },
  {
    "Nome": "JONATHAN CRISTIAN MAGALHAES",
    "CPF": "119.935.146-60",
    "Cargo": "OP DE MÁQUINAS - FILETAÇÃO MAN",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "JOAO VITOR ROCHA",
    "CPF": "145.882.456-00",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "JOAO VITOR FERREIRA",
    "CPF": "125.937.316-99",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "JOAO VITOR DE OLIVEIRA SILVA",
    "CPF": "150.912.056-40",
    "Cargo": "ALMOXARIFE",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "JOAO VITOR DA SILVA RIBEIRO",
    "CPF": "167.926.096-09",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "JOAO VITOR ALVES DE OLIVEIRA",
    "CPF": "129.142.536-56",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "JOAO VICTOR TIMOTE OLIVEIRA",
    "CPF": "138.584.706-94",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "JOAO VICTOR COSTA DE CASTRO LEITE",
    "CPF": "178.802.026-09",
    "Cargo": "OPERADOR DE MAQUINA - FILETACA",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "JOAO VICENTE SIMOES",
    "CPF": "713.672.506-25",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "JOÃO PAULO RODRIGUES SANTOS",
    "CPF": "994.804.096-15",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "JOAO PAULO CLARO FARIA",
    "CPF": "125.090.536-20",
    "Cargo": "ANALISTA FINANCEIRO",
    "Setor": "FINANCEIRO"
  },
  {
    "Nome": "JOAO BATISTA TEIXEIRA DA SILVA",
    "CPF": "027.101.216-11",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "JOAO BATISTA LADEIRA",
    "CPF": "548.433.596-53",
    "Cargo": "Não informado",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "JESSICA MORAIS CABRAL",
    "CPF": "117.771.426-44",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "JEOVANE BATISTA DA SILVA",
    "CPF": "101.173.446-05",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "JEIEL TOBIAS AZEVEDO",
    "CPF": "074.508.166-52",
    "Cargo": "ALMOXARIFE",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "JEAN DE OLIVEIRA MORAIS LIMA",
    "CPF": "167.984.526-80",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "JANAINA CAROLINO DA CRUZ",
    "CPF": "133.766.346-88",
    "Cargo": "ANALISTA FISCAL I",
    "Setor": "CONTABILIDADE"
  },
  {
    "Nome": "JAIRO GONÇALVES DA SILVA",
    "CPF": "057.376.386-00",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "JACQUESON DE FREITAS REIS",
    "CPF": "145.070.476-09",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "JACIANA DOS SANTOS OLIVEIRA",
    "CPF": "075.699.626-05",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "IZABELLY DOS SANTOS AUGUSTO",
    "CPF": "156.288.166-39",
    "Cargo": "APRENDIZ DE MARCENEIRO DE MOVE",
    "Setor": "SENAI"
  },
  {
    "Nome": "IVONE DE ANDRADE GOUVEIA",
    "CPF": "041.159.306-40",
    "Cargo": "COZINHEIRA(O)",
    "Setor": "REFEITORIO"
  },
  {
    "Nome": "IVAIR MATTOS SILVA",
    "CPF": "043.098.706-43",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "IVAIR MARQUES GERALDO",
    "CPF": "137.516.436-80",
    "Cargo": "CONFERENTE - EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "IVAIR DA SILVA VILLAS BOAS",
    "CPF": "029.316.527-09",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "ITALO MEDICE MARTINS",
    "CPF": "131.817.316-76",
    "Cargo": "SUPERVISOR COMERCIAL",
    "Setor": "COMERCIAL"
  },
  {
    "Nome": "ITALO AUGUSTO BARROSO ALMEIDA",
    "CPF": "135.404.976-41",
    "Cargo": "ALMOXARIFE",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "ISAEL ANTONIO PEREIRA",
    "CPF": "074.983.076-00",
    "Cargo": "PINTOR",
    "Setor": "PINTURA P.U."
  },
  {
    "Nome": "ISABELLY VITORIA DOS SANTOS",
    "CPF": "187.262.556-85",
    "Cargo": "APRENDIZ DE COST DE ESTOFADOS",
    "Setor": "SENAI"
  },
  {
    "Nome": "INES NOGUEIRA DA SILVA",
    "CPF": "087.867.107-29",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "IGOR DOS SANTOS",
    "CPF": "164.210.646-12",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "IGOR COSTA MARTINS",
    "CPF": "145.013.116-65",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "IDNEIA RODRIGUES DE SOUZA",
    "CPF": "120.183.606-98",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "IAGO PEREIRA SILVA OLIVEIRA",
    "CPF": "123.894.456-67",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "IAGO ALEX SANTOS BARROSO",
    "CPF": "128.991.256-48",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "HEYTOR FERREIRA BATISTA",
    "CPF": "106.508.686-50",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "HENRIQUE BARROS CORREA CAETANO",
    "CPF": "127.969.946-94",
    "Cargo": "APRENDIZ MECANICO DE MANUT MAQ",
    "Setor": "SENAI"
  },
  {
    "Nome": "HELENICE APARECIDA DA SILVA",
    "CPF": "081.305.096-01",
    "Cargo": "AUX DE MÁQUINAS - FILETAÇÃO MA",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "HAROLDO JOSE PEREIRA CANDIDO",
    "CPF": "068.821.266-23",
    "Cargo": "OPERADOR DE MAQUINA DE BORDAR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "GUSTAVO VOIGT DE SOUZA",
    "CPF": "133.053.536-78",
    "Cargo": "AUXILIAR DE CONFERENTE - FILET",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "GUSTAVO LOMBA MACHADO DA SILVA",
    "CPF": "150.156.866-33",
    "Cargo": "CONFERENTE - EXPEDICAO",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "GUSTAVO CARDOSO TEIXEIRA",
    "CPF": "119.026.186-37",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "GRAZIELA GLICERIO ESTEVAM",
    "CPF": "077.047.846-84",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "GOLBERT LOPES REIFF",
    "CPF": "156.090.516-65",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "GLEICIANA TAVARES LUCAS",
    "CPF": "107.339.086-16",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "GLAUCIA PEREIRA LUCAS",
    "CPF": "133.894.536-01",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "GLAUBER DE SOUZA DA SILVA MATOS",
    "CPF": "119.604.606-92",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "GIVANILDO DA SILVA",
    "CPF": "043.370.026-26",
    "Cargo": "OPERADOR DE MAQUINA - FILETACA",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "GIOVANI GONCALVES TELES",
    "CPF": "994.810.146-49",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "GIOVANA TEIXEIRA SANTOS",
    "CPF": "151.189.236-62",
    "Cargo": "APRENDIZ DE COST DE ESTOFADOS",
    "Setor": "SENAI"
  },
  {
    "Nome": "GILMAX DE OLIVEIRA",
    "CPF": "099.403.046-09",
    "Cargo": "MONTADOR - MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "GILMAR MILAGRE DA SILVA",
    "CPF": "069.892.756-77",
    "Cargo": "LIDER DE SETOR - LINHA DE PINT",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "GILMAR LIMA CIRINO",
    "CPF": "111.393.136-14",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "GILMAR ALVES GUIMARAES",
    "CPF": "750.350.656-34",
    "Cargo": "FAXINEIRA(O)",
    "Setor": "SERVICOS GERAIS"
  },
  {
    "Nome": "GILIARD ALVES LIMA",
    "CPF": "139.490.056-25",
    "Cargo": "FAXINEIRO (A) - PRODUÇÃO",
    "Setor": "SERVICOS GERAIS"
  },
  {
    "Nome": "GILBERTO SIMOES",
    "CPF": "048.512.116-60",
    "Cargo": "MONTADOR - QUALIDADE",
    "Setor": "QUALIDADE"
  },
  {
    "Nome": "GILBERTO MARTINS SILVA",
    "CPF": "983.478.296-91",
    "Cargo": "CONFERENTE (UV)",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "GESSICA POLATI DA SILVA",
    "CPF": "172.881.387-55",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "GERALDO DE SOUZA RAMOS",
    "CPF": "053.741.186-09",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "GEOVANE MARTINS SILVA",
    "CPF": "003.285.596-60",
    "Cargo": "OPERADOR DE EMPILHADEIRA",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "GALDINO RODRIGUES",
    "CPF": "039.760.126-37",
    "Cargo": "OP DE MÁQUINAS - FILETAÇÃO MAN",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "GABRIELA ROBERTA MARAIA FRANCO",
    "CPF": "521.668.378-08",
    "Cargo": "Não informado",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "GABRIEL RUFINO DO NASCIMENTO",
    "CPF": "129.081.276-44",
    "Cargo": "OPERADOR DE MAQUINA - FILETACA",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "GABRIEL QUEIROZ LAMAS",
    "CPF": "121.051.066-92",
    "Cargo": "ANALISTA FISCAL I",
    "Setor": "CONTABILIDADE"
  },
  {
    "Nome": "GABRIEL MARTINS DA SILVA BEZERRA",
    "CPF": "136.783.056-79",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "GABRIEL DE SOUZA MARTINS",
    "CPF": "182.166.326-81",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "GABRIEL CARVALHO LOPES",
    "CPF": "109.232.386-46",
    "Cargo": "AUXILIAR DE MONTADOR - ESTOFA",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "GABRIEL BONFA SILVA",
    "CPF": "134.325.656-90",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "FREDERICO RUBINICH FERREIRA RUFATO",
    "CPF": "015.950.076-10",
    "Cargo": "ADMINISTRADOR",
    "Setor": "ADMINISTRACAO"
  },
  {
    "Nome": "FRED TEIXEIRA DE AQUINO",
    "CPF": "132.717.076-00",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "FRANKLYN DA SILVA NUNES",
    "CPF": "118.430.966-33",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "FRANCISMEY CORREA DE OLIVEIRA",
    "CPF": "710.916.706-25",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "FRANCISCO PEREIRA NETO",
    "CPF": "946.022.126-20",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "FRANCISCO DIOLINDO DA SILVA",
    "CPF": "051.384.146-66",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "FRANCIELE LUIZA DE SOUZA",
    "CPF": "136.048.296-23",
    "Cargo": "ANALISTA FINANCEIRO",
    "Setor": "FINANCEIRO"
  },
  {
    "Nome": "FRANCIEL MENDES DE QUEIROZ APOSTOLO",
    "CPF": "124.549.306-09",
    "Cargo": "LIDER DE SETOR - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "FLAVIO DIAS",
    "CPF": "031.839.386-77",
    "Cargo": "CONFERENTE - EXPEDICAO",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "FERNANDO VINICIUS XAVIER DIAS",
    "CPF": "388.045.138-96",
    "Cargo": "MECANICO DE MANUTENCAO",
    "Setor": "MANUTENCAO DE MAQUINAS"
  },
  {
    "Nome": "FERNANDO CARLOS DOS SANTOS",
    "CPF": "011.882.196-26",
    "Cargo": "GERENTE COMERCIAL",
    "Setor": "COMERCIAL"
  },
  {
    "Nome": "FELIPE NAGIB DE OLIVEIRA QUEIROZ",
    "CPF": "076.127.316-65",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "FELIPE MACIEL CORDEIRO",
    "CPF": "085.544.896-24",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "FELIPE DE OLIVEIRA SEVERO",
    "CPF": "103.380.616-14",
    "Cargo": "MECANICO DE MANUTENCAO",
    "Setor": "MANUTENCAO DE MAQUINAS"
  },
  {
    "Nome": "FELIPE CESAR RUBEM DA SILVA",
    "CPF": "107.884.206-07",
    "Cargo": "AUXILIAR DE EMBALAGEM - ESTOFA",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "FELIPE ANDRE ALVES CARNEIRO",
    "CPF": "123.390.966-50",
    "Cargo": "AUXILIAR DE TI",
    "Setor": "TI - TECNOLOGIA DA INFORMAÇÃO"
  },
  {
    "Nome": "FABRIZIO LUCAS DA SILVA",
    "CPF": "126.175.246-55",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "FABRICIO LUCAS LUIZ",
    "CPF": "138.321.486-71",
    "Cargo": "ANALISTA DE PCP",
    "Setor": "PCP"
  },
  {
    "Nome": "FABIO OLIVEIRA DA SILVA",
    "CPF": "072.265.457-05",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "FABIANA APARECIDA LIMA",
    "CPF": "090.323.266-94",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "EZEQUIEL ZULATO RODRIGUES",
    "CPF": "071.552.646-44",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "EWERTON PIERRE PEREIRA DA SILVA OLIVEIRA",
    "CPF": "142.746.976-81",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "EVANDRO DA SILVA DOS REIS",
    "CPF": "074.918.966-50",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "EVALDO BEGULO DA SILVA",
    "CPF": "036.344.486-60",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "EURIPEDES SOARES NETO",
    "CPF": "165.080.346-00",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ERNANDO DE OLIVEIRA PINTO",
    "CPF": "898.749.006-87",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "ENRIQUE VIEIRA DA SILVA",
    "CPF": "092.439.226-61",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ENRICO TAVARES SILVA",
    "CPF": "119.672.226-90",
    "Cargo": "APRENDIZ DE COST DE ESTOFADOS",
    "Setor": "SENAI"
  },
  {
    "Nome": "EMILY HANGEL DE CARVALHO",
    "CPF": "092.905.896-80",
    "Cargo": "AUXILIAR DE MONTADOR - ESTOFA",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "EMILLY VICTORIA DE SOUZA MACHADO",
    "CPF": "168.911.516-51",
    "Cargo": "APRENDIZ DE MARCENEIRO DE MOVE",
    "Setor": "SENAI"
  },
  {
    "Nome": "EMILIANE BRAGA DOS SANTOS",
    "CPF": "093.319.946-56",
    "Cargo": "OPERADOR DE MAQUINA DE BORDAR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "EMERSON MENDES DE OLIVEIRA",
    "CPF": "150.860.606-48",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "EMERSON HELIO OLIVEIRA BARBOSA",
    "CPF": "102.975.306-74",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "EMANUELLE CRISTINA LOPES",
    "CPF": "162.846.126-80",
    "Cargo": "AUX DE MÁQUINAS - FILETAÇÃO MA",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "EMANUEL DA SILVA MOTA",
    "CPF": "173.043.026-07",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "ELIZANGELA TEODORO DA SILVA",
    "CPF": "153.511.886-51",
    "Cargo": "OPERADOR DE MAQUINA DE BORDAR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ELISANDRA TEODORO DA SILVA",
    "CPF": "153.511.206-90",
    "Cargo": "LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "ELINEIA PATRIZ LIONEL",
    "CPF": "328.923.538-66",
    "Cargo": "LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "ELIBERTON CORREIA",
    "CPF": "111.792.256-19",
    "Cargo": "OPERADOR EMPILHADEIRA",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "ELIAS JOSE DA SILVA",
    "CPF": "094.954.136-21",
    "Cargo": "Não informado",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "ELIAS DA SILVA NEVES",
    "CPF": "016.602.726-02",
    "Cargo": "AUXILIAR DE EMBALAGEM - ESTOFA",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ELCIMAR RIBEIRO FERREIRA",
    "CPF": "832.466.736-91",
    "Cargo": "OP DE MÁQUINAS - FILETAÇÃO MAN",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "EDVALDO SOUZA MACHADO",
    "CPF": "632.866.375-72",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "EDSON LUIZ LEMOS VICENTE",
    "CPF": "073.069.396-10",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "EDSON LEOCADIO DA SILVA",
    "CPF": "064.236.016-23",
    "Cargo": "OPERADOR DE MAQUINA",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "EDSON CARLOS DE SOUZA",
    "CPF": "274.986.258-22",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "EDMILSON MARTINS RIBEIRO",
    "CPF": "757.996.506-20",
    "Cargo": "MOTORISTA DE CAMINHAO (ROTAS R",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "EDIVANDO DOS SANTOS",
    "CPF": "050.094.986-77",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "EDIMILSON DA SILVA RODRIGUES",
    "CPF": "070.711.827-10",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "EDIMAR MOTA NUNES",
    "CPF": "032.242.886-63",
    "Cargo": "OPERADOR DE EMPILHADEIRA",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "EDIMAR DE OLIVEIRA CARDOSO DO CARMO",
    "CPF": "160.773.126-65",
    "Cargo": "AUXILIAR DE MAQUINAS - FILETAC",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "EDICARLOS VIEIRA DA SILVA",
    "CPF": "107.237.336-00",
    "Cargo": "CONFERENTE (UV)",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "DOUGLAS TOSTES SILVA",
    "CPF": "130.034.446-62",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "DIEISON DE MOURA",
    "CPF": "140.881.116-21",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "DIEGO SANTOS COUTINHO",
    "CPF": "156.543.287-86",
    "Cargo": "Não informado",
    "Setor": "CORTE"
  },
  {
    "Nome": "DIEGO LUIZ JANDREY",
    "CPF": "006.289.060-30",
    "Cargo": "MOTORISTA",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "DIEGO LUIZ DA COSTA SILVA",
    "CPF": "016.111.726-08",
    "Cargo": "AUXILIAR OPERADOR MAQUINA U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "DIEGO JUNIO REZENDE DE BARROS",
    "CPF": "086.289.566-97",
    "Cargo": "SUPERVISOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "DIEGO DE SOUZA RIBEIRO DA SILVA",
    "CPF": "121.995.056-42",
    "Cargo": "AUXILIAR OPERADOR MAQUINA U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "DIANA NARCISO DE MENEZES",
    "CPF": "135.596.896-86",
    "Cargo": "COSTUREIRO(A)",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "DEMERSON DE SOUZA",
    "CPF": "133.238.476-52",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "DEILSON QUEIROZ DA SILVA",
    "CPF": "152.396.876-17",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "DAVID SILVA DE OLIVEIRA",
    "CPF": "158.643.776-35",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "DAVI NASCIMENTO MATHIAS",
    "CPF": "128.742.606-90",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "DARLAN SILVA CRUZ",
    "CPF": "143.086.526-18",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "DARIO JOSE MARTINS DE ALMEIDA",
    "CPF": "262.197.158-02",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "DARCILEIA APARECIDA SANTOS DA SILVA",
    "CPF": "083.824.236-71",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "DANIELE PEREIRA XAVIER",
    "CPF": "130.853.536-82",
    "Cargo": "AUXILIAR DE COZINHA",
    "Setor": "REFEITORIO"
  },
  {
    "Nome": "DANIELA ALTINA DE OLIVEIRA",
    "CPF": "139.152.596-59",
    "Cargo": "FAXINEIRO (A) - EXTERNO",
    "Setor": "SERVICOS GERAIS"
  },
  {
    "Nome": "DANIEL JUNIOR SEVERINO BRASILINO",
    "CPF": "128.498.666-79",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "DANIEL FERRAZ CARVALHO BATISTA",
    "CPF": "153.202.696-09",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "DAIANE NARCIZO DE MENEZES",
    "CPF": "134.659.186-57",
    "Cargo": "AUXILIAR DE PCP",
    "Setor": "PCP"
  },
  {
    "Nome": "DAIANA MARA DAL SASSO",
    "CPF": "082.090.366-37",
    "Cargo": "ANALISTA COMERCIAL",
    "Setor": "COMERCIAL"
  },
  {
    "Nome": "CRISTIANO MARCOS GOMES",
    "CPF": "002.614.286-40",
    "Cargo": "MOTORISTA",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "CLEVERSON CRISOSTOMO DE LANA AMANCIO",
    "CPF": "046.682.846-29",
    "Cargo": "MOTORISTA DE CAMINHAO",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "CLEIDIANE APARECIDA MAGALHAES",
    "CPF": "096.775.596-48",
    "Cargo": "COSTUREIRO(A)",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "CLAUDIO LUIS MOREIRA",
    "CPF": "138.448.046-33",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "CLAUDIO LIMA",
    "CPF": "089.160.358-13",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "CLAUDIANE DE ASSIS RAMOS",
    "CPF": "177.111.806-75",
    "Cargo": "AUXILIAR DE MONTADOR -MONTAGEM",
    "Setor": "MONTAGEM."
  },
  {
    "Nome": "CLAUDEMAX DA SILVA PEREIRA",
    "CPF": "052.097.586-30",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "CHISLANY DA SILVA ANDRADE",
    "CPF": "177.650.586-73",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "CELIA MARIA JOVITA GOMES BATISTA DA SILVA",
    "CPF": "042.316.686-71",
    "Cargo": "COSTUREIRO(A)",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "CAUA KENEDY ALVES PEREIRA",
    "CPF": "162.312.426-33",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "CATIA APARECIDA FURSTEMBERG",
    "CPF": "061.897.669-86",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "CARMEM RIBEIRO LOPES",
    "CPF": "077.765.266-81",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "CARLOS ROBERTO DO NASCIMENTO",
    "CPF": "037.654.216-00",
    "Cargo": "OPERADOR DE MAQUINA - FILETACA",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "CARLOS HENRIQUE DE SOUZA SANTANA",
    "CPF": "060.610.726-60",
    "Cargo": "OPERADOR EMPILHADEIRA",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "CARLOS FRANCISCO AMPARO",
    "CPF": "114.541.606-32",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "CARLOS AUGUSTO LIMA LOURENCO",
    "CPF": "161.082.326-50",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "CARLOS ALEXANDRE DE SOUZA",
    "CPF": "049.183.336-99",
    "Cargo": "CONFERENTE (UV)",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "CARLOS ALBERTO RIBEIRO",
    "CPF": "028.451.096-36",
    "Cargo": "AUXILIAR DE MAQUINAS - FILETAC",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "CARLOS ALBERTO DUQUE PORTES",
    "CPF": "136.874.627-65",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "CARLOS ALBERTO DE OLIVEIRA",
    "CPF": "031.065.936-10",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "CARLA MENDES PAULINO",
    "CPF": "173.797.786-92",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "CAMILO LELLES DE ALMEIDA DIAS",
    "CPF": "540.290.406-59",
    "Cargo": "MOTORISTA",
    "Setor": "TRANSPORTE IMOLA"
  },
  {
    "Nome": "BRUNO SANTOS SALGADO",
    "CPF": "096.415.186-31",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "BRUNO MEIRELES BADARO",
    "CPF": "015.034.886-08",
    "Cargo": "ANALISTA FISCAL II",
    "Setor": "CONTABILIDADE"
  },
  {
    "Nome": "BRUNO GONCALVES SILVA",
    "CPF": "132.573.656-24",
    "Cargo": "CONFERENTE - EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "BIANCA GONCALVES DE ASSIS",
    "CPF": "130.147.016-37",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "BIANCA FERREIRA DO NASCIMENTO",
    "CPF": "148.678.927-77",
    "Cargo": "Não informado",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "AUREA LUIZA LOPES DE FREITAS JORGE",
    "CPF": "038.143.986-02",
    "Cargo": "FAXINEIRO (A) - EXTERNO",
    "Setor": "SERVICOS GERAIS"
  },
  {
    "Nome": "ARNALDO GONCALVES FEIJO",
    "CPF": "674.179.656-87",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "ANTONIO FRANCISCO DOS ANJOS PARANHAS",
    "CPF": "045.273.866-03",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "ANTONIO DE SOUZA",
    "CPF": "038.035.936-70",
    "Cargo": "PINTOR",
    "Setor": "PINTURA P.U."
  },
  {
    "Nome": "ANTONIO CARLOS GOMES SILVA",
    "CPF": "061.662.666-50",
    "Cargo": "PINTOR",
    "Setor": "PINTURA P.U."
  },
  {
    "Nome": "ANTONIO ALVES DO NASCIMENTO",
    "CPF": "958.185.616-15",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "ANTHONY LIMA MARTINS",
    "CPF": "144.838.796-50",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ANGILENE RIBEIRO ALVES",
    "CPF": "035.686.256-95",
    "Cargo": "COSTUREIRO(A)",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ANGELI DE LOURDES SANTOS OLIVEIRA",
    "CPF": "129.995.626-24",
    "Cargo": "APRENDIZ DE COST DE ESTOFADOS",
    "Setor": "SENAI"
  },
  {
    "Nome": "ANDREIA ANDRADE DA SILVA",
    "CPF": "900.908.026-91",
    "Cargo": "Não informado",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "ANDRE GONCALVES DE OLIVEIRA",
    "CPF": "040.254.656-39",
    "Cargo": "SUPERVISOR II",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "ANDERSON PEREIRA DA SILVA",
    "CPF": "056.172.876-30",
    "Cargo": "AUXILIAR DE PINTOR",
    "Setor": "PINTURA P.U."
  },
  {
    "Nome": "ANA PAULA CARDOSO FERREIRA",
    "CPF": "090.980.834-12",
    "Cargo": "AUXILIAR DE COZINHA",
    "Setor": "REFEITORIO"
  },
  {
    "Nome": "ANA MARIA DA CONCEICAO",
    "CPF": "076.512.296-06",
    "Cargo": "OPERADOR DE MAQUINA - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "ANA MARA DE OLIVEIRA ALMEIDA",
    "CPF": "014.784.526-25",
    "Cargo": "ASSISTENTE DE DEPARTAMENTO PES",
    "Setor": "DEPARTAMENTO PESSOAL"
  },
  {
    "Nome": "ANA JULIA CEZARIO ELOI DIAS",
    "CPF": "145.290.866-40",
    "Cargo": "APRENDIZ DE COST DE ESTOFADOS",
    "Setor": "SENAI"
  },
  {
    "Nome": "ANA CRISTINA DA SILVA DIAS",
    "CPF": "113.658.556-78",
    "Cargo": "AUXILIAR DE EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "ANA CLAUDIA BARBOSA COSTA",
    "CPF": "116.104.206-75",
    "Cargo": "AUXILIAR DE LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "ANA CAROLINE LIMA AGUIAR",
    "CPF": "138.503.516-10",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ANA CAROLINE DO AMARAL DOS ANJOS",
    "CPF": "085.871.006-45",
    "Cargo": "AUXILIAR DE ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ANA CARLA SILVA DA CRUZ",
    "CPF": "066.714.376-96",
    "Cargo": "AUXILIAR DE MAQUINAS - FILETAC",
    "Setor": "FILETACAO"
  },
  {
    "Nome": "AMANDA MILAGRES OSCAR",
    "CPF": "095.483.186-10",
    "Cargo": "AUXILIAR DE LIXADOR",
    "Setor": "LIXAÇÃO"
  },
  {
    "Nome": "AMALIA BENTO",
    "CPF": "097.117.976-07",
    "Cargo": "AUXILIAR DE MAQUINAS  - US/COR",
    "Setor": "CORTE"
  },
  {
    "Nome": "ALVARO TOLEDO GERALDO",
    "CPF": "173.210.256-24",
    "Cargo": "CONFERENTE - EMBALAGEM",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "ALOAN LOUIS PINHEIRO DA SILVA",
    "CPF": "101.225.567-04",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "ALICE PIRES SIQUEIRA",
    "CPF": "149.170.836-05",
    "Cargo": "ESTOFADOR",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ALICE GABRIELA DA SILVA DE OLIVEIRA",
    "CPF": "161.605.396-80",
    "Cargo": "APRENDIZ DE COST DE ESTOFADOS",
    "Setor": "SENAI"
  },
  {
    "Nome": "ALEXANDRO FERREIRA",
    "CPF": "135.296.516-05",
    "Cargo": "AUXILIAR OPERADOR MAQUINA U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "ALEXANDRO DA COSTA RODRIGUES",
    "CPF": "043.005.166-26",
    "Cargo": "AUXILIAR OPERADOR MAQUINA U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "ALEXANDRE VIANA DA SILVA",
    "CPF": "046.132.216-17",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  },
  {
    "Nome": "ALEXANDRE PEREIRA LICAZALI",
    "CPF": "139.872.266-92",
    "Cargo": "ANALISTA COMERCIAL",
    "Setor": "COMERCIAL"
  },
  {
    "Nome": "ALEXANDRE ALVES DE ARAUJO",
    "CPF": "820.020.706-44",
    "Cargo": "ALMOXARIFE",
    "Setor": "ALMOXARIFADO"
  },
  {
    "Nome": "ALEXANDRA LIZARDO DOS SANTOS",
    "CPF": "044.537.796-82",
    "Cargo": "AUXILIAR DE MONTADOR - ESTOFA",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ALEXANDRA APARECIDA DE PAULA DIAS",
    "CPF": "062.340.146-07",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ALEX OTAVIANO DE SOUZA",
    "CPF": "126.078.376-69",
    "Cargo": "AUX. DE OPERADOR DE MÁQUINAS",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "ALEX NICOLAU DE SOUZA",
    "CPF": "130.551.206-55",
    "Cargo": "OPERADOR DE MÁQUINA - ESTOFAÇÃ",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "ALESSANDRO PINTO DE SOUZA",
    "CPF": "091.942.756-10",
    "Cargo": "OPERADOR DE MAQUINAS U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "AISLAN CARLOS DA SILVA",
    "CPF": "123.418.126-60",
    "Cargo": "AUXILIAR DE MAQUINAS - FURACAO",
    "Setor": "FURAÇÃO"
  },
  {
    "Nome": "ADRIANO NICOLAU DE SOUZA",
    "CPF": "072.150.896-06",
    "Cargo": "PINTOR",
    "Setor": "PINTURA P.U."
  },
  {
    "Nome": "ADRIANA PEREIRA DO VALLE SANTOS",
    "CPF": "356.534.478-46",
    "Cargo": "AUX DE MÁQUINAS - FILETAÇÃO MA",
    "Setor": "FILETAÇÃO MANUAL"
  },
  {
    "Nome": "ADAUTO GOMES LACERDA",
    "CPF": "122.025.126-75",
    "Cargo": "AUXILIAR OPERADOR MAQUINA U.V.",
    "Setor": "LINHA PINTURA U.V."
  },
  {
    "Nome": "ADAILTON DA NATIVIDADE DE SOUZA",
    "CPF": "079.350.505-46",
    "Cargo": "MONTADOR - ESTOFACAO",
    "Setor": "ESTOFACAO"
  },
  {
    "Nome": "CASSIANO DO NASCIMENTO",
    "CPF": "045.001.266-27",
    "Cargo": "EMBALADOR(A)",
    "Setor": "EMBALAGEM"
  },
  {
    "Nome": "KAIQUE NETO",
    "CPF": "157.846.856-60",
    "Cargo": "OPERADOR DE MAQUINA - CORTE",
    "Setor": "CORTE"
  },
  {
    "Nome": "JULIO CLEMENTE ORTIZ GINARTE",
    "CPF": "706.195.821-97",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO MODERNA"
  },
  {
    "Nome": "JOSE CLAUDIO LIMA",
    "CPF": "652.861.706-68",
    "Cargo": "CARREGADOR",
    "Setor": "EXPEDICAO"
  }
]

async function main() {
  console.log(`Iniciando atualização de setores para ${updates.length} funcionários...`)

  const deptMap = new Map()
  const existingDepts = await prisma.department.findMany()
  for (const dept of existingDepts) {
    deptMap.set(dept.name.trim().toUpperCase(), dept.id)
  }

  let updatedCount = 0
  let notFoundCount = 0
  let createdDeptCount = 0

  for (const item of updates) {
    const rawCpf = item.CPF ? item.CPF.replace(/\D/g, '') : ''
    if (!rawCpf) continue

    const sectorName = item.Setor ? item.Setor.trim() : ''
    if (!sectorName || sectorName === 'Nulo') continue

    const sectorKey = sectorName.toUpperCase()
    let deptId = deptMap.get(sectorKey)

    if (!deptId) {
      // Criar novo setor
      let baseCode = sectorKey.replace(/[^A-Z0-9]/g, '_').substring(0, 25)
      if (!baseCode) baseCode = 'SETOR'
      let code = baseCode
      let counter = 1
      while (await prisma.department.findUnique({ where: { code } })) {
        code = `${baseCode}_${counter}`
        counter++
      }

      const newDept = await prisma.department.create({
        data: {
          name: sectorName,
          code: code,
          status: 'ATIVO',
        }
      })
      deptId = newDept.id
      deptMap.set(sectorKey, deptId)
      createdDeptCount++
      console.log(`➕ Criado novo setor: "${sectorName}" (código: ${code})`)
    }

    // Buscar funcionário por CPF
    const emp = await prisma.employee.findFirst({
      where: {
        cpf: rawCpf
      }
    })

    if (emp) {
      await prisma.employee.update({
        where: { id: emp.id },
        data: {
          departmentId: deptId,
          ...(item.Cargo && item.Cargo !== 'Não informado' && item.Cargo !== 'Nulo' ? { cargo: item.Cargo.trim() } : {})
        }
      })
      updatedCount++
    } else {
      console.warn(`⚠️ Funcionário não encontrado no DB. CPF: ${item.CPF} (${rawCpf}) - ${item.Nome}`)
      notFoundCount++
    }
  }

  console.log(`\n✅ Processo finalizado com sucesso!`)
  console.log(`- Novos setores criados: ${createdDeptCount}`)
  console.log(`- Funcionários com setor atualizado: ${updatedCount}`)
  console.log(`- Funcionários não encontrados: ${notFoundCount}`)
}

main()
  .catch(e => {
    console.error('Erro na execução:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
