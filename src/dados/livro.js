/* Livro do painel — DADOS FICTÍCIOS de demonstração, gerados por scripts/gerar-dados.ts (semente "voo").
   O Clube Horizonte não existe; pessoas, equipes, lugares e números foram inventados. */
window.TORRE_LIVRO = {
 "meta": {
  "titulo": "Pré-Temporada — o livro dos dados",
  "organizacao": "Clube Horizonte · programa de indicação · demonstração com dados fictícios",
  "versao": 2,
  "medidoEm": "2026-11-14",
  "janela": "14h–17h (Brasília)",
  "periodo": {
   "inicio": "2026-10-12",
   "fim": "2026-11-14",
   "dias": 34
  },
  "diaIncompleto": "2026-11-14",
  "bancos": [
   {
    "id": "central",
    "nome": "Central Horizonte",
    "papel": "bot, pilotos, passageiros, chamados"
   },
   {
    "id": "operacao",
    "nome": "Torre",
    "papel": "material, estoque, refeição, visitas, atendimento"
   },
   {
    "id": "redes",
    "nome": "Redes",
    "papel": "seguidores, alcance, comentários"
   }
  ],
  "regras": [
   "Leitura somente, e somente de agregados: nenhum nome, telefone ou endereço de pessoa indicada foi aberto.",
   "Grupo com menos de 5 pessoas fica de fora. Nome de equipe aparece porque é equipe, não pessoa.",
   "Todo horário foi levado para Brasília antes da contagem por dia; os bancos gravam em UTC.",
   "O dia 14/11 ainda estava em andamento: aparece em azul claro em todos os gráficos diários."
  ],
  "diaD": "2026-12-06",
  "encerramento": "18h",
  "d7": "2026-11-29",
  "faltavamDiasNaMedicao": 22,
  "hojeDemo": "2026-11-15",
  "marcos": {
   "redistribuir": "2026-11-21",
   "kit": "2026-11-26",
   "simulado": [
    "2026-11-24",
    "2026-11-25"
   ],
   "simuladoAte": "2026-11-27",
   "d7": "2026-11-29"
  },
  "frase": "Nenhum número desta Torre mede resultado: todos medem prontidão. A temporada depende de duas respostas — em 29/11 existem de 700 a 1.300 pilotos com material na mão e canal aberto? E o sistema aguenta de 4,4 a 9 vezes o seu melhor dia, sete dias seguidos?",
  "capa": [
   {
    "v": 9846,
    "rotulo": "pessoas indicadas e cadastradas (passageiros)"
   },
   {
    "v": 291,
    "rotulo": "por dia, média dos últimos 7 dias completos"
   },
   {
    "v": 131,
    "rotulo": "pilotos prontos e vivos (funil aninhado)"
   },
   {
    "v": 1984,
    "rotulo": "pilotos ativos cadastrados"
   }
  ],
  "p": 1
 },
 "pares": [
  {
   "par": "Registrado · no mundo",
   "significado": "Registrado quer dizer que existe uma linha no banco — é só isso que a Torre enxerga. No mundo quer dizer que aconteceu com alguém. Indicação que ficou fora do sistema não ganha convite nem lembrete."
  },
  {
   "par": "Piloto · Passageiro · Controlador",
   "significado": "Piloto é o embaixador que indica pelo WhatsApp, sem login. Passageiro é a pessoa indicada e cadastrada por um piloto (no banco, \"Indicado\"). Controlador coordena um grupo de pilotos e entra no painel com login."
  },
  {
   "par": "Projetada · Real · Contabilizados",
   "significado": "Projetada é a soma dos planos dos pilotos ativos. Real é o que cada controlador lançou que os seus pilotos vão trazer (vale só com carimbo). Contabilizados são os passageiros já gravados no banco."
  }
 ],
 "coresDoLivro": "A série principal é azul e a referência é cinza. Vermelho aparece apenas onde há ação a tomar. Roxo sinaliza madrugada ou carga em lote; azul claro, o dia que ainda não terminou. Nenhuma cor vem sem uma palavra ao lado.",
 "glossario": [
  {
   "termo": "Clube Horizonte / Central Horizonte",
   "def": "Clube Horizonte é o nome que o público conhece; Central Horizonte é o sistema por trás dele (bot de WhatsApp, painel de pilotos e banco)."
  },
  {
   "termo": "Plano · Anel · Patente",
   "def": "Plano é quantos passageiros o piloto se propôs a trazer (20 ou 40; 100/200 nas embaixadas). Anel é o progresso da pessoa contra o próprio plano. Patente é a faixa por passageiros absolutos (40, 80, 120)."
  },
  {
   "termo": "Aspirante",
   "def": "Ficha de alguém que pode virar piloto, vinda de lista importada ou do formulário de visitas. Passar a piloto não dispara mensagem para ninguém."
  },
  {
   "termo": "Base pronta",
   "def": "Pilotos que atravessam o funil aninhado inteiro: dono real → canal aberto → já cadastrou alguém → vivo na semana. Não se confunde com o total de ativos."
  },
  {
   "termo": "Captura",
   "def": "A parte do que acontece no mundo que vira registro no sistema — e só o que é registrado recebe convite e lembrete."
  },
  {
   "termo": "Convite",
   "def": "Cartão ou mensagem com o código de adesão do Dia D, um por passageiro."
  },
  {
   "termo": "Baixa",
   "def": "Botão da Torre que encerra uma conversa com uma nota do motivo. O \"tempo de atendimento\" medido vai até esse clique, não até a primeira resposta."
  },
  {
   "termo": "Kit",
   "def": "Material físico do piloto, montado na base operacional. \"Recebeu kit\" é uma etiqueta marcada por decisão da coordenação e não guarda data."
  },
  {
   "termo": "Sessão do bot · etapa",
   "def": "Todo telefone em conversa tem uma sessão parada em alguma etapa; MENU é a etapa de descanso."
  },
  {
   "termo": "linha1…linha6, sac",
   "def": "Apelidos dos números de WhatsApp da Central. A linha6 trouxe 53% da entrada e está bloqueada por pagamento; a linha4 perdeu o selo de conta ativa (verificação de 11/11)."
  },
  {
   "termo": "Fila de triagem",
   "def": "Uma única controladora com 538 pilotos (a triagem da Rota 20), 3 deles com passageiro. Não é equipe: é fila parada."
  }
 ],
 "metodo": {
  "medido": [
   "Leituras diretas nos bancos de produção em 14/11/2026, 14h–17h (Brasília): Central Horizonte, Torre e Redes.",
   "Leitura somente, e somente de agregados. Nenhum nome, telefone ou endereço de pessoa indicada foi aberto. Grupo com menos de 5 pessoas fica de fora; nome de equipe aparece porque é equipe.",
   "Horários levados para Brasília antes de contar por dia: o banco grava em UTC, e sem a conversão o \"hoje\" começaria às 21h da véspera."
  ],
  "naoMedido": [
   "Limites de envio do provedor de WhatsApp (degrau de volume, nota de qualidade): não ficam no banco.",
   "Latência do bot: nenhuma mensagem tem carimbo de processamento.",
   "O ensaio de disparo de 26/10 em si: não ficou gravado.",
   "Conversão cadastro → adesão: parâmetro do gestor.",
   "Quem abre qual tela da Torre: não existe registro de leitura.",
   "Operação de rua formal: tabelas zeradas; as 58–104 pessoas por dia em campo trabalham fora do sistema.",
   "Captura: pede um denominador que não está no sistema."
  ],
  "p": 4
 },
 "tresNumeros": {
  "projetada": {
   "v": 84720,
   "def": "Soma dos planos dos pilotos ativos.",
   "leitura": "Conta fichas. Um piloto criado ontem numa carga entra com plano 40 e nenhum passageiro. Pela decomposição exclusiva, só 12.960 estão com quem já produz.",
   "naoE": "não é previsão: nenhum desses planos foi combinado um a um"
  },
  "real": {
   "v": 12874,
   "def": "O que os controladores lançaram na rodada de 10/11, só com carimbo.",
   "leitura": "Mede a aposta de quem convive com os pilotos. Fica 31% acima do contabilizado: ninguém está contando com um salto.",
   "detalhe": "1.197 de 1.940 linhas com carimbo",
   "naoE": "não é contabilizado: é expectativa de quem convive"
  },
  "contabilizados": {
   "v": 9846,
   "def": "Passageiros gravados no banco.",
   "leitura": "É o único dos três que é fato. Mas é cadastro feito pelo piloto, sem confirmação com a pessoa: 9.862 das 9.865 fichas não têm status de confirmação.",
   "naoE": "não é adesão: é cadastro gravado uma vez"
  },
  "metaDeclarada": {
   "v": 112000,
   "conta": "2.800 pilotos × 40 passageiros",
   "origem": "reunião de 02/09"
  },
  "metaDeQuemJaProduz": {
   "v": 12960,
   "pilotos": 274
  },
  "noRitmoAtualAteDiaD": 16239,
  "registradoSobreMetaPct": 8.8,
  "realSobreProjetadaPct": 15.2,
  "razaoProjetadaReal": 6.6,
  "decomposicao": [
   {
    "id": "orfaos",
    "grupo": "Órfãos (sem controlador)",
    "pilotos": 44,
    "comPassageiro": 4,
    "meta": 1920,
    "natureza": "ficha",
    "pct": 2.3
   },
   {
    "id": "deposito",
    "grupo": "Fila de triagem (1 controladora)",
    "pilotos": 538,
    "comPassageiro": 3,
    "meta": 18640,
    "natureza": "ficha",
    "pct": 22
   },
   {
    "id": "dobro",
    "grupo": "É passageiro de outro piloto",
    "pilotos": 602,
    "comPassageiro": 161,
    "meta": 27480,
    "natureza": "sinal",
    "pct": 32.4
   },
   {
    "id": "novos",
    "grupo": "Criado há <7 dias, sem passageiro",
    "pilotos": 523,
    "comPassageiro": 0,
    "meta": 23100,
    "natureza": "ficha",
    "pct": 27.3
   },
   {
    "id": "antigos",
    "grupo": "Antigo, sem passageiro",
    "pilotos": 171,
    "comPassageiro": 0,
    "meta": 8560,
    "natureza": "ficha",
    "pct": 10.1
   },
   {
    "id": "produz",
    "grupo": "Produz (demais)",
    "pilotos": 106,
    "comPassageiro": 106,
    "meta": 5020,
    "natureza": "sinal",
    "pct": 5.9
   }
  ],
  "pisoHonesto": 12960,
  "tetoHonesto": 32500,
  "soFicha": 52220,
  "leituraDecomposicao": "Só 12.960 de plano estão com quem já cadastrou alguém. Descontados órfãos, fila de triagem e fichas sem passageiro, restam 32.500 com dono e algum sinal. Os outros 52.220 são ficha. Piso honesto: 13 mil; teto honesto: 32,5 mil.",
  "p": [
   3,
   26
  ]
 },
 "premissa2080": {
  "texto": "Em temporadas anteriores, o gestor viu 20% do resultado acontecer até uma semana antes e 80% na última semana. Este livro não mede isso: é premissa dele, tirada de experiência real, e entra aqui como hipótese de peso alto.",
  "diaVale": 8.6,
  "pctPorDiaAntes": 1.3,
  "pctPorDiaUltimaSemana": 11.4,
  "horaDeAtraso": "Uma hora parada em 01/12, contando 12 horas úteis no dia do surto, custa 71% de um dia inteiro de agora.",
  "formula": "Resultado = base pronta em 29/11 × multiplicador (×5) × captura pelo sistema × conversão cadastro→adesão",
  "captura": "nunca foi medida: o sistema nunca rodou sob surto",
  "conversao": "parâmetro do gestor",
  "naoFaz": "Os dados deste livro não testam a premissa (33 dias completos de histórico, nenhuma semana de surto, nenhuma série de temporadas anteriores). Os cenários são contas com premissas declaradas, não intervalos estatísticos.",
  "p": 3
 },
 "fases": [
  {
   "id": "A",
   "nome": "Preparação",
   "inicio": "2026-11-15",
   "fim": "2026-11-29",
   "dias": 15,
   "objetivo": "Montar a base pronta e provar a capacidade. Cadastro nesta fase vale 20% do resultado.",
   "medir": [
    "pilotos prontos",
    "kits conferidos",
    "canal aberto com o bot",
    "sem dono = 0",
    "simulado de surto feito",
    "insumos da Fase B recebidos"
   ]
  },
  {
   "id": "B",
   "nome": "Surto",
   "inicio": "2026-11-30",
   "fim": "2026-12-05",
   "dias": 6,
   "objetivo": "Só capturar: nada se constrói nestes dias. Tudo medido por hora.",
   "medir": [
    "cadastros/hora",
    "pilotos vivos no dia",
    "fila do bot em minutos",
    "falhas",
    "% com convite",
    "chamados > 2 h"
   ]
  },
  {
   "id": "C",
   "nome": "Dia D",
   "inicio": "2026-12-06",
   "fim": "2026-12-06",
   "dias": 1,
   "objetivo": "Cadastro vira adesão.",
   "medir": [
    "% de lembretes entregues até 10h",
    "falhas por hora",
    "cadastro→convite em minutos"
   ],
   "nota": "adesões fecham 18h"
  }
 ],
 "pilotos": {
  "letra": "A",
  "titulo": "Pilotos: quem entra, por onde e quando",
  "pergunta": "Quantos pilotos existem de verdade, como foram criados e quais produzem.",
  "frase": "Piloto criado não é piloto que produz. Em 34 dias o sistema registrou 2.036 fichas de piloto; 1.571 delas (77,2%) nasceram em quatro dias de carga em massa. No mesmo recorte, 131 pilotos cadastraram alguém na última semana. A base que trabalha é de centenas; a base que existe é de milhares.",
  "kpis": [
   {
    "v": 1984,
    "rotulo": "pilotos ativos hoje"
   },
   {
    "v": 1158,
    "rotulo": "criados nos 7 dias completos (07–13/11)"
   },
   {
    "v": 2271,
    "rotulo": "aspirantes que ainda não viraram piloto"
   },
   {
    "v": 131,
    "rotulo": "cadastraram alguém na última semana"
   }
  ],
  "funil": [
   {
    "id": "ativos",
    "rotulo": "Pilotos ativos",
    "v": 1984,
    "pct": 100,
    "meta": 84720,
    "nucleo": "pilotos"
   },
   {
    "id": "dono",
    "rotulo": "com dono de verdade",
    "detalhe": "sem órfãos e sem a fila de triagem",
    "v": 1402,
    "pct": 70.7,
    "meta": 64380,
    "nucleo": "controladores"
   },
   {
    "id": "canal",
    "rotulo": "já trocaram mensagem com o bot",
    "v": 661,
    "pct": 33.3,
    "meta": 29870,
    "nucleo": "central"
   },
   {
    "id": "produziu",
    "rotulo": "já cadastraram ao menos 1 passageiro",
    "v": 247,
    "pct": 12.4,
    "meta": 12140,
    "nucleo": "passageiros"
   },
   {
    "id": "vivo",
    "rotulo": "cadastraram alguém na última semana",
    "v": 131,
    "pct": 6.6,
    "meta": 6610,
    "nucleo": "passageiros",
    "operacional": true
   },
   {
    "id": "kit",
    "rotulo": "com a tag de kit recebido",
    "v": 47,
    "pct": 2.4,
    "meta": 2410,
    "nucleo": "operacao"
   }
  ],
  "metaFaseA": [
   700,
   1300
  ],
  "funilLeitura": "Cada seta para baixo é uma peneira. O gargalo está entre \"tem dono\" e \"falou com o bot\": 741 pilotos têm controlador e nunca trocaram mensagem com o sistema. A base que responde a um comando hoje está entre 47 e 247 pilotos; a operacional é 131.",
  "semContatoComDono": 741,
  "totalFichas": 2036,
  "fichasDeCarga": 1571,
  "fichasDeCargaPct": 77.2,
  "diasDeCarga": [
   {
    "dia": "2026-10-30",
    "semana": "sex",
    "criados": 354,
    "convertidos": 352,
    "daFila": true
   },
   {
    "dia": "2026-11-05",
    "semana": "qui",
    "criados": 117,
    "convertidos": 7,
    "daFila": false
   },
   {
    "dia": "2026-11-10",
    "semana": "ter",
    "criados": 871,
    "convertidos": 871,
    "daFila": true
   },
   {
    "dia": "2026-11-12",
    "semana": "qui",
    "criados": 229,
    "convertidos": 228,
    "daFila": true
   }
  ],
  "horaLeitura": "Três horas concentram quase tudo — 14h (550), 15h (372) e 11h (358) — e mais uma à noite, 20h (284). Não é o horário em que as pessoas decidem virar piloto: é o horário em que alguém da equipe rodou a carga. Na madrugada inteira há 7 fichas em 34 dias.",
  "celulasDeCarga": {
   "fichas": 1378,
   "pct": 67.7,
   "detalhe": "sexta 11h (327) = carga de 30/10; terça 14h (512) e 15h (331) = 10/11; quinta 20h (208) = 12/11"
  },
  "fichasCriadasPeloBot": 297,
  "origemRegistradaPct": 14.6,
  "portas": [
   {
    "id": "pre_piloto",
    "porta": "Aspirante escreveu ao bot",
    "fichas": 27,
    "passageirosPorFicha": 34.9,
    "ativaramPct": 77.8,
    "passageiros": 941
   },
   {
    "id": "qr",
    "porta": "QR escaneado",
    "fichas": 118,
    "passageirosPorFicha": 24.7,
    "ativaramPct": 66.9,
    "passageiros": 2917
   },
   {
    "id": "lista",
    "porta": "Lista importada",
    "fichas": 131,
    "passageirosPorFicha": 5.8,
    "ativaramPct": 27.5,
    "passageiros": 764
   }
  ],
  "portasLeitura": "Quem se ofereceu produz. A lista importada rende quatro a seis vezes menos por ficha. Mas quem escaneia um QR já decidiu participar: isto mede seleção, não a qualidade do canal.",
  "importacoes": [
   {
    "dia": "2026-10-23",
    "planilhas": 48,
    "linhas": 1231,
    "fichas": 1134,
    "jaEramPiloto": 97
   },
   {
    "dia": "2026-10-27",
    "planilhas": 3,
    "linhas": 71,
    "fichas": 59,
    "jaEramPiloto": 12
   },
   {
    "dia": "2026-10-28",
    "planilhas": 9,
    "linhas": 2331,
    "fichas": 2313,
    "jaEramPiloto": 18
   },
   {
    "dia": "2026-10-29",
    "planilhas": 1,
    "linhas": 246,
    "fichas": 246,
    "jaEramPiloto": 0
   }
  ],
  "coortes": [
   {
    "semana": "2026-10-12",
    "pilotos": 89,
    "ativaram": 74,
    "ativaramPct": 83.1,
    "em1d": 58.4,
    "em7d": 73,
    "passageiros": 3711,
    "porFicha": 41.7,
    "carga": false
   },
   {
    "semana": "2026-10-19",
    "pilotos": 62,
    "ativaram": 46,
    "ativaramPct": 74.2,
    "em1d": 54.8,
    "em7d": 71,
    "passageiros": 2021,
    "porFicha": 32.6,
    "carga": false
   },
   {
    "semana": "2026-10-26",
    "pilotos": 548,
    "ativaram": 88,
    "ativaramPct": 16.1,
    "em1d": 10.2,
    "em7d": 14.6,
    "passageiros": 2398,
    "porFicha": 4.4,
    "carga": true
   },
   {
    "semana": "2026-11-02",
    "pilotos": 191,
    "ativaram": 31,
    "ativaramPct": 16.2,
    "em1d": 11,
    "em7d": 14.1,
    "passageiros": 933,
    "porFicha": 4.9,
    "carga": true
   },
   {
    "semana": "2026-11-09",
    "pilotos": 1146,
    "ativaram": 24,
    "ativaramPct": 2.1,
    "em1d": 0.9,
    "em7d": 2.1,
    "passageiros": 802,
    "porFicha": 0.7,
    "carga": true,
    "aberta": true
   }
  ],
  "coortesLeitura": "As duas semanas sem carga somam 151 pilotos e 5.732 passageiros; as três com carga somam 1.885 pilotos e 4.133 passageiros. A coorte diz em 24 horas o que vai render: quem não cadastra ninguém no primeiro dia quase nunca cadastra depois.",
  "metas": [
   {
    "meta": 20,
    "pilotos": 108,
    "pct": 5.4
   },
   {
    "meta": 40,
    "pilotos": 1774,
    "pct": 89.4
   },
   {
    "meta": 100,
    "pilotos": 88,
    "pct": 4.4
   },
   {
    "meta": 200,
    "pilotos": 14,
    "pct": 0.7
   }
  ],
  "ficha": [
   {
    "campo": "Passou pelo onboarding",
    "v": 312,
    "pct": 15.7
   },
   {
    "campo": "Tem foto",
    "v": 463,
    "pct": 23.3
   },
   {
    "campo": "Ligado a um lead do CRM",
    "v": 879,
    "pct": 44.3
   },
   {
    "campo": "Recebeu o mapa da região",
    "v": 171,
    "pct": 8.6
   }
  ],
  "ultimaMensagem": [
   {
    "faixa": "hoje",
    "v": 52
   },
   {
    "faixa": "1–3 d",
    "v": 61
   },
   {
    "faixa": "3–7 d",
    "v": 58
   },
   {
    "faixa": "7–14 d",
    "v": 93
   },
   {
    "faixa": ">14 d",
    "v": 87
   },
   {
    "faixa": "nunca",
    "v": 1633,
    "vazio": true
   }
  ],
  "ultimaMensagemLeitura": "Em 1.633 das 1.984 fichas ativas (82,3%) o campo está vazio; só 113 pilotos falaram nos últimos 3 dias. Pelo campo da ficha sobram 351 pilotos com alguma mensagem; pelas sessões do bot, 661.",
  "whatsappProducao": [
   {
    "numero": "linha6",
    "pilotos": 188,
    "passageiros": 5214,
    "pct": 52.9
   },
   {
    "numero": "linha5",
    "pilotos": 104,
    "passageiros": 3628,
    "pct": 36.8
   },
   {
    "numero": "linha2",
    "pilotos": 29,
    "passageiros": 423,
    "pct": 4.3
   },
   {
    "numero": "(nenhuma)",
    "pilotos": 1611,
    "passageiros": 287,
    "pct": 2.9
   },
   {
    "numero": "linha1",
    "pilotos": 36,
    "passageiros": 196,
    "pct": 2
   },
   {
    "numero": "linha4",
    "pilotos": 15,
    "passageiros": 117,
    "pct": 1.2
   },
   {
    "numero": "sac",
    "pilotos": 1,
    "passageiros": 0,
    "pct": 0
   }
  ],
  "prePilotos": {
   "total": 4012,
   "estados": [
    {
     "estado": "na fila",
     "v": 2148,
     "comControlador": 1866
    },
    {
     "estado": "virou piloto",
     "v": 1741,
     "comControlador": 1733
    },
    {
     "estado": "virou passageiro",
     "v": 123,
     "comControlador": 117
    }
   ],
   "fontes": [
    {
     "fonte": "Exportação do CRM — leads R20 (28/10)",
     "fichas": 2046,
     "viraramPiloto": 571,
     "faixa": "vermelho"
    },
    {
     "fonte": "Rota 20 (CRM)",
     "fichas": 246,
     "viraramPiloto": 2,
     "faixa": "vermelho"
    },
    {
     "fonte": "cadastro manual",
     "fichas": 96,
     "viraramPiloto": 41,
     "faixa": "laranja"
    },
    {
     "fonte": "Planilha 29 — Parceiros",
     "fichas": 79,
     "viraramPiloto": 78,
     "faixa": "azul"
    },
    {
     "fonte": "Planilha — cidades do litoral",
     "fichas": 57,
     "viraramPiloto": 0,
     "faixa": "vermelho"
    },
    {
     "fonte": "Planilha Embaixadas 2026 (carga do servidor)",
     "fichas": 51,
     "viraramPiloto": 33,
     "faixa": "laranja"
    },
    {
     "fonte": "Planilha 18 — Agência Aurora",
     "fichas": 41,
     "viraramPiloto": 41,
     "faixa": "azul"
    },
    {
     "fonte": "Planilha 22 — Feira de Turismo",
     "fichas": 40,
     "viraramPiloto": 37,
     "faixa": "azul"
    },
    {
     "fonte": "Planilha — Interior (38 linhas)",
     "fichas": 38,
     "viraramPiloto": 1,
     "faixa": "vermelho"
    },
    {
     "fonte": "Planilha — Metropolitana",
     "fichas": 36,
     "viraramPiloto": 9,
     "faixa": "vermelho"
    }
   ],
   "leitura": "A fila não é base: é agenda. São 2.148 aspirantes esperando, 1.866 deles com controlador já definido. Divididos pelos 72 controladores, dão 30 contatos por pessoa até 06/12. Tratar a fila como lista de ligações a fazer, não como base a converter em lote.",
   "contatosPorControlador": 30
  },
  "muda": [
   {
    "t": "Criar piloto em massa não rende — está medido, não é opinião.",
    "d": "1.571 das 2.036 fichas (77,2%) nasceram em quatro dias de carga. A coorte de 09/11, com 1.146 pilotos, tem 24 que já cadastraram alguém — 2,1% — e 0,7 passageiro por ficha. Continuar convertendo a fila em lote adiciona linhas, não adesões."
   },
   {
    "t": "Quem entra por vontade própria produz quatro a seis vezes mais.",
    "d": "Aspirante que escreveu ao bot rende 34,9 passageiros e o QR rende 24,7, contra 5,8 da lista importada. A porta boa é a mais estreita — e é a que menos recebe atenção."
   },
   {
    "t": "A base nunca foi acesa.",
    "d": "Em 1.633 das 1.984 fichas ativas (82,3%) o campo de última mensagem está vazio; pelas sessões do bot, 661 já falaram. 312 (15,7%) passaram pelo onboarding e 171 (8,6%) receberam o mapa. O problema não é reengajar: é fazer o primeiro contato, que nunca houve."
   },
   {
    "t": "O estoque real são 2.148 aspirantes na fila, sem contato.",
    "d": "Desses, 1.866 já têm controlador atribuído. Converter em lote já foi feito três vezes e não produziu. O que ainda não foi feito é falar com eles — e 22 dias dão para chamar 2.148 pessoas se houver escala humana."
   },
   {
    "t": "A produção depende de dois números de WhatsApp.",
    "d": "linha6 e linha5 concentram 89,6% dos 9.865 passageiros com ficha. Um bloqueio numa dessas contas derruba a maior parte do cadastro."
   }
  ],
  "naoMede": [
   "Origem só existe para 297 de 2.036 pilotos (14,6%) — as fichas criadas pelo bot.",
   "Não existe data de entrega do kit na ficha do piloto — só a marca de recebido. Sem a data, não dá para dizer que o kit causou produção.",
   "A data da ficha não é a data do compromisso — para as 1.741 fichas convertidas, o sistema registra o dia da conversão.",
   "O número de WhatsApp é o atual, não o histórico.",
   "14/11 está incompleto e a coorte de 09/11 ainda não completou 7 dias: os dois só podem subir."
  ],
  "regua": {
   "nota": "A faixa verde não é meta oficial: é o que as duas coortes sem carga em massa de fato entregaram. Serve para comparar, não para cobrar.",
   "linhas": [
    {
     "metrica": "Ativação da coorte em 7 dias",
     "verde": "≥ 70%",
     "amarelo": "30–70%",
     "vermelho": "< 30%",
     "hoje": "2,1%",
     "hojeNota": "coorte 09/11, aberta",
     "status": "vermelho"
    },
    {
     "metrica": "Passageiros por ficha da coorte",
     "verde": "≥ 30",
     "amarelo": "10–30",
     "vermelho": "< 10",
     "hoje": "0,7",
     "status": "vermelho"
    },
    {
     "metrica": "Pilotos que cadastraram alguém na última semana",
     "verde": "≥ 247",
     "amarelo": "131–247",
     "vermelho": "< 131",
     "hoje": "131",
     "hojeNota": "na borda",
     "status": "amarelo"
    },
    {
     "metrica": "Fichas ativas com \"última mensagem\" preenchida",
     "verde": "≥ 70%",
     "amarelo": "30–70%",
     "vermelho": "< 30%",
     "hoje": "17,7%",
     "status": "vermelho"
    },
    {
     "metrica": "Fichas de piloto com porta de entrada registrada",
     "verde": "≥ 50%",
     "amarelo": "15–50%",
     "vermelho": "< 15%",
     "hoje": "14,6%",
     "status": "vermelho"
    }
   ]
  },
  "p": [
   5,
   12
  ]
 },
 "passageiros": {
  "letra": "B",
  "titulo": "Passageiros: cada indicação registrada, dia após dia",
  "pergunta": "Quanto entra por dia, em que horas as pessoas se cadastram e até onde a linha chega no Dia D.",
  "frase": "A entrada estacionou: há um mês chegam perto de 291 indicações por dia, e cada piloto que cadastra no dia grava por volta de 9. Quem mexe no total não é a produtividade de quem já trabalha, é o número de pilotos diferentes cadastrando no mesmo dia — e esse número nunca passou de 49.",
  "kpis": [
   {
    "v": 9846,
    "rotulo": "passageiros registrados até 14/11"
   },
   {
    "v": 291,
    "rotulo": "por dia (média dos 7 dias completos, 07–13/11)"
   },
   {
    "v": 652,
    "rotulo": "melhor dia já registrado (22/10)"
   },
   {
    "v": 118,
    "rotulo": "pilotos que cadastraram alguém na última semana completa"
   }
  ],
  "origem": [
   {
    "evento": "Cadastro pelo bot de WhatsApp",
    "v": 9431
   },
   {
    "evento": "Cadastro à mão, no painel",
    "v": 722
   },
   {
    "evento": "Exclusões depois de criados",
    "v": -307
   }
  ],
  "pelotBotPct": 92.9,
  "buraco": [
   {
    "rotulo": "Registrado hoje",
    "v": 9846
   },
   {
    "rotulo": "No ritmo atual até 06/12",
    "v": 16239
   },
   {
    "rotulo": "Projetada do painel",
    "v": 84720
   },
   {
    "rotulo": "Meta declarada",
    "v": 112000
   }
  ],
  "quatroPalavras": [
   {
    "palavra": "Passageiro",
    "e": "pessoa indicada por um piloto e gravada uma única vez, com nome e telefone",
    "naoE": "não é adesão fechada nem interesse confirmado depois"
   },
   {
    "palavra": "Piloto",
    "e": "ficha de quem topou indicar passageiros para o clube",
    "naoE": "não é gente trabalhando: 1.710 fichas nunca cadastraram ninguém"
   },
   {
    "palavra": "Meta somada / Projetada",
    "e": "a soma das metas anotadas em cada ficha de piloto",
    "naoE": "não é previsão: nenhuma dessas metas foi combinada caso a caso"
   },
   {
    "palavra": "Captura",
    "e": "a parte das indicações feitas fora do sistema que chega a virar cadastro",
    "naoE": "ninguém mediu — falta o denominador"
   }
  ],
  "ritmoLeitura": "Desde 22/10 a média de 7 dias oscila entre 220 e 390 por dia, sem tendência de alta. O topo de 652 em 22/10 ficou isolado, puxado por um lote lançado à mão (a auditoria conta 655 no mesmo dia, com outro horário de corte). Considere ~291/dia o que a operação entrega sem ajuda; qualquer número acima disso precisa de uma intervenção com dono e data, não de esperança na curva.",
  "recordePilotosDia": {
   "v": 49,
   "dia": "2026-11-13",
   "pctAtivos": 2.5
  },
  "produtividade7d": 9.2,
  "semanas": [
   {
    "semana": "2026-10-12",
    "v": 1901
   },
   {
    "semana": "2026-10-19",
    "v": 2631
   },
   {
    "semana": "2026-10-26",
    "v": 1620
   },
   {
    "semana": "2026-11-02",
    "v": 1866
   },
   {
    "semana": "2026-11-09",
    "v": 1828,
    "aberta": true,
    "diasMedidos": 6
   }
  ],
  "cenarios": {
   "nota": "Base em 29/11 = registrado hoje + ritmo × 15 dias. Resultado no Dia D = base + base × 4 × captura: o ×4 sai do 20/80 (se a base é um quinto do total, o total é cinco bases). A última linha não é um cenário — é o teto da própria conta, com captura de 100%.",
   "registrado": 9846,
   "ritmoAtual": 290.57,
   "linhas": [
    {
     "id": "pessimista",
     "nome": "Pessimista",
     "ritmo": 220,
     "baseD7": 13146,
     "captura": 15,
     "regDiaSurto": 1127,
     "xMelhorDia": 1.7,
     "emDiaD": 21034,
     "pctMeta": 18.8
    },
    {
     "id": "medio",
     "nome": "Médio",
     "ritmo": 291,
     "baseD7": 14205,
     "captura": 35,
     "regDiaSurto": 2841,
     "xMelhorDia": 4.4,
     "emDiaD": 34091,
     "pctMeta": 30.4
    },
    {
     "id": "otimista",
     "nome": "Otimista",
     "ritmo": 490,
     "baseD7": 17196,
     "captura": 60,
     "regDiaSurto": 5896,
     "xMelhorDia": 9,
     "emDiaD": 58466,
     "pctMeta": 52.2
    },
    {
     "id": "pleno",
     "nome": "20/80 pleno",
     "ritmo": 490,
     "baseD7": 17196,
     "captura": 100,
     "regDiaSurto": 9826,
     "xMelhorDia": 15.1,
     "emDiaD": 85980,
     "pctMeta": 76.8,
     "limite": true
    }
   ],
   "linhaRetaDiaD": 16239,
   "leitura": "Nenhum cenário alcança os 112.000. Mesmo o teto, com captura de 100%, para em 85.980 (76,8% da meta): a meta não cabe na conta que a própria equipe faz, por mais esforço que se ponha. Escolher antes de 29/11 qual destes números vai a público — depois dessa data não sobra tempo para acertar a expectativa.",
   "cuidado": "Nada aqui é intervalo de confiança. São contas com premissas escolhidas pela equipe, e o 20/80 nunca foi posto à prova com dados do clube."
  },
  "relogio": {
   "totalCadastros30d": 8731,
   "madrugadaPct": 13.6,
   "picoHora": {
    "hora": 15,
    "v": 724
   },
   "segundaOnda": {
    "hora": 22,
    "v": 712
   },
   "diasSemana": [
    "seg",
    "ter",
    "qua",
    "qui",
    "sex",
    "sáb",
    "dom"
   ],
   "extremos": [
    {
     "dia": "seg",
     "hora": 22,
     "v": 356
    },
    {
     "dia": "sex",
     "hora": 15,
     "v": 145
    }
   ],
   "domingo30d": 507,
   "quarta30d": 1727,
   "metadeDoDia": "só na faixa das 15h",
   "ateMeioDiaPct": 25.6,
   "depoisDas18Pct": 28.9,
   "onda22hSegundaPct": 50,
   "leitura": "O bot cadastra a qualquer hora; o suporte humano, não. 13,6% dos cadastros — perto de um em cada 7 — chegam entre 22h e 8h, fora do horário com gente para socorrer quem trava: se o bot parar numa sexta à noite, ninguém percebe antes da manhã."
  },
  "ultimos14": [
   {
    "dia": "2026-11-01",
    "s": "dom",
    "f": [
     3,
     9,
     16,
     40,
     30,
     4
    ],
    "cheias": 0,
    "total": 102
   },
   {
    "dia": "2026-11-02",
    "s": "seg",
    "f": [
     13,
     38,
     35,
     76,
     43,
     63
    ],
    "cheias": 4,
    "total": 268
   },
   {
    "dia": "2026-11-03",
    "s": "ter",
    "f": [
     13,
     61,
     66,
     74,
     63,
     14
    ],
    "cheias": 8,
    "total": 291
   },
   {
    "dia": "2026-11-04",
    "s": "qua",
    "f": [
     19,
     75,
     89,
     117,
     96,
     24
    ],
    "cheias": 11,
    "total": 420
   },
   {
    "dia": "2026-11-05",
    "s": "qui",
    "f": [
     8,
     52,
     38,
     50,
     40,
     17
    ],
    "cheias": 1,
    "total": 205
   },
   {
    "dia": "2026-11-06",
    "s": "sex",
    "f": [
     11,
     68,
     48,
     76,
     54,
     18
    ],
    "cheias": 5,
    "total": 275
   },
   {
    "dia": "2026-11-07",
    "s": "sáb",
    "f": [
     9,
     50,
     51,
     58,
     50,
     23
    ],
    "cheias": 3,
    "total": 241
   },
   {
    "dia": "2026-11-08",
    "s": "dom",
    "f": [
     5,
     13,
     29,
     60,
     49,
     10
    ],
    "cheias": 2,
    "total": 166
   },
   {
    "dia": "2026-11-09",
    "s": "seg",
    "f": [
     5,
     18,
     26,
     31,
     25,
     61
    ],
    "cheias": 1,
    "total": 166
   },
   {
    "dia": "2026-11-10",
    "s": "ter",
    "f": [
     13,
     61,
     41,
     86,
     69,
     20
    ],
    "cheias": 6,
    "total": 290
   },
   {
    "dia": "2026-11-11",
    "s": "qua",
    "f": [
     21,
     112,
     73,
     108,
     85,
     22
    ],
    "cheias": 13,
    "total": 421
   },
   {
    "dia": "2026-11-12",
    "s": "qui",
    "f": [
     13,
     40,
     44,
     77,
     49,
     21
    ],
    "cheias": 3,
    "total": 244
   },
   {
    "dia": "2026-11-13",
    "s": "sex",
    "f": [
     22,
     92,
     101,
     170,
     81,
     40
    ],
    "cheias": 13,
    "total": 506
   },
   {
    "dia": "2026-11-14",
    "s": "sáb",
    "f": [
     15,
     106,
     80,
     38,
     0,
     0
    ],
    "cheias": 8,
    "total": 239,
    "parcial": true
   }
  ],
  "faixasDoDia": [
   "0–7h",
   "8–11h",
   "12–14h",
   "15–18h",
   "19–21h",
   "22–23h"
  ],
  "ultimos14Nota": "A leitura por hora saiu cerca de uma hora depois da série diária; por isso 14/11 soma 239 aqui e 201 no gráfico por dia.",
  "diaBomLeitura": "O que separa o dia forte do fraco é quantas horas ficam cheias. Em 13/11 foram 13 horas com 20 registros ou mais, e a mais movimentada teve 55; no domingo 08/11, 2, e nenhuma hora passou de 20. Para gravar 2.841 num dia — o que o cenário médio pede no surto — seriam precisas 49 horas iguais à mais cheia dos últimos 14 dias (58 registros, 09/11 às 22h). O dia tem 24.",
  "horaMaisCheia": {
   "v": 58,
   "quando": "09/11, 22h"
  },
  "times": [
   {
    "time": "R40_CAPITAL",
    "familia": "Rota 40",
    "pilotos": 1211,
    "passageiros": 4726,
    "produzem": 138,
    "produzemPct": 11.4,
    "mediaQuemProduz": 34.2,
    "bateram": 41,
    "ult7d": 598
   },
   {
    "time": "COMUNIDADE_NORTE",
    "familia": "Embaixadas",
    "pilotos": 42,
    "passageiros": 1454,
    "produzem": 27,
    "produzemPct": 64.3,
    "mediaQuemProduz": 53.9,
    "bateram": 4,
    "ult7d": 269
   },
   {
    "time": "(sem rótulo)",
    "familia": "Sem rótulo",
    "pilotos": 261,
    "passageiros": 1052,
    "produzem": 28,
    "produzemPct": 10.7,
    "mediaQuemProduz": 37.6,
    "bateram": 12,
    "ult7d": 458
   },
   {
    "time": "EMBAIXADA_200",
    "familia": "Embaixadas",
    "pilotos": 10,
    "passageiros": 842,
    "produzem": 6,
    "produzemPct": 60,
    "mediaQuemProduz": 140.3,
    "bateram": 1,
    "ult7d": 265
   },
   {
    "time": "EMBAIXADA_100",
    "familia": "Embaixadas",
    "pilotos": 28,
    "passageiros": 745,
    "produzem": 14,
    "produzemPct": 50,
    "mediaQuemProduz": 53.2,
    "bateram": 4,
    "ult7d": 186
   },
   {
    "time": "R40_INTERIOR",
    "familia": "Rota 40",
    "pilotos": 66,
    "passageiros": 490,
    "produzem": 28,
    "produzemPct": 42.4,
    "mediaQuemProduz": 17.5,
    "bateram": 8,
    "ult7d": 120
   },
   {
    "time": "R40_LITORAL",
    "familia": "Rota 40",
    "pilotos": 64,
    "passageiros": 248,
    "produzem": 19,
    "produzemPct": 29.7,
    "mediaQuemProduz": 13.1,
    "bateram": 7,
    "ult7d": 60
   },
   {
    "time": "EMBAIXADA_MAIS_100",
    "familia": "Embaixadas",
    "pilotos": 10,
    "passageiros": 177,
    "produzem": 3,
    "produzemPct": 30,
    "mediaQuemProduz": 59,
    "bateram": 0,
    "ult7d": 30
   },
   {
    "time": "COMUNIDADE_SUL",
    "familia": "Embaixadas",
    "pilotos": 12,
    "passageiros": 100,
    "produzem": 8,
    "produzemPct": 66.7,
    "mediaQuemProduz": 12.5,
    "bateram": 2,
    "ult7d": 8
   },
   {
    "time": "R20_CAPITAL",
    "familia": "Rota 20",
    "pilotos": 271,
    "passageiros": 8,
    "produzem": 1,
    "produzemPct": 0.4,
    "mediaQuemProduz": 8,
    "bateram": 0,
    "ult7d": 0
   },
   {
    "time": "R20_INTERIOR",
    "familia": "Rota 20",
    "pilotos": 6,
    "passageiros": 3,
    "produzem": 2,
    "produzemPct": 33.3,
    "mediaQuemProduz": 1.5,
    "bateram": 1,
    "ult7d": 0
   },
   {
    "time": "R20_LITORAL",
    "familia": "Rota 20",
    "pilotos": 3,
    "passageiros": 0,
    "produzem": 0,
    "produzemPct": 0,
    "mediaQuemProduz": null,
    "bateram": 0,
    "ult7d": 0
   }
  ],
  "timesSerie": [
   {
    "time": "R40_CAPITAL",
    "serie": 4758,
    "tabela": 4726
   },
   {
    "time": "COMUNIDADE_NORTE",
    "serie": 1439,
    "tabela": 1454
   }
  ],
  "familias": [
   {
    "familia": "Rota 40 — a rede grande",
    "pilotos": 1341,
    "redePct": 67.6,
    "passageiros": 5464,
    "registrosPct": 55.5,
    "produzem": 185
   },
   {
    "familia": "Embaixadas",
    "pilotos": 102,
    "redePct": 5.1,
    "passageiros": 3318,
    "registrosPct": 33.7,
    "produzem": 58
   },
   {
    "familia": "Sem rótulo",
    "pilotos": 261,
    "redePct": 13.2,
    "passageiros": 1052,
    "registrosPct": 10.7,
    "produzem": 28
   },
   {
    "familia": "Rota 20 — lista importada",
    "pilotos": 280,
    "redePct": 14.1,
    "passageiros": 11,
    "registrosPct": 0.1,
    "produzem": 3
   }
  ],
  "faixasProducao": [
   {
    "faixa": "0",
    "passageiros": 0,
    "pilotos": 1710
   },
   {
    "faixa": "1–4",
    "passageiros": 100,
    "pilotos": 42
   },
   {
    "faixa": "5–9",
    "passageiros": 230,
    "pilotos": 35
   },
   {
    "faixa": "10–19",
    "passageiros": 621,
    "pilotos": 43
   },
   {
    "faixa": "20–39",
    "passageiros": 1356,
    "pilotos": 49
   },
   {
    "faixa": "40–87",
    "passageiros": 4229,
    "pilotos": 72
   },
   {
    "faixa": "88+",
    "passageiros": 3309,
    "pilotos": 33
   }
  ],
  "tempoAtePrimeiro": [
   {
    "faixa": "≤1 h",
    "v": 111
   },
   {
    "faixa": "1–6 h",
    "v": 65
   },
   {
    "faixa": "6–24 h",
    "v": 13
   },
   {
    "faixa": "1–3 d",
    "v": 24
   },
   {
    "faixa": "3–7 d",
    "v": 35
   },
   {
    "faixa": ">7 d",
    "v": 26
   }
  ],
  "ativacao24hEntreQuemAtiva": 69,
  "ativacao24hSobreTodos": 9.6,
  "nuncaAtivamPct": 86,
  "parados": [
   {
    "faixa": "cadastrou hoje",
    "v": 28,
    "faltaMeta": 598
   },
   {
    "faixa": "parado há 1–3 d",
    "v": 69,
    "faltaMeta": 1675
   },
   {
    "faixa": "parado há 3–7 d",
    "v": 53,
    "faltaMeta": 1063
   },
   {
    "faixa": "parado há 7–14 d",
    "v": 59,
    "faltaMeta": 1213
   },
   {
    "faixa": "parado há >14 d",
    "v": 65,
    "faltaMeta": 1243
   }
  ],
  "parados7mais": {
   "v": 124,
   "devem": 2456
  },
  "pilotosPorSemana": [
   {
    "semana": "2026-10-12",
    "v": 71
   },
   {
    "semana": "2026-10-19",
    "v": 97
   },
   {
    "semana": "2026-10-26",
    "v": 111
   },
   {
    "semana": "2026-11-02",
    "v": 118
   },
   {
    "semana": "2026-11-09",
    "v": 136,
    "aberta": true
   }
  ],
  "kit": [
   {
    "grupo": "ficha 14+ dias · COM kit",
    "media": 38,
    "produzemPct": 81.4
   },
   {
    "grupo": "ficha 14+ dias · sem kit",
    "media": 14.1,
    "produzemPct": 45.4
   },
   {
    "grupo": "ficha nova · COM kit",
    "media": 3.6,
    "produzemPct": 10.2
   },
   {
    "grupo": "ficha nova · sem kit",
    "media": 1.4,
    "produzemPct": 3.2
   }
  ],
  "kitLeitura": "Associação, não causa: quem pede kit costuma ser quem já está indicando. Para saber se o kit faz produzir, é preciso sortear — kit para metade dos parados, nada para a outra metade, e comparar.",
  "dddBase": "41",
  "ddd": [
   {
    "ddd": "41",
    "v": 8029,
    "pct": 81.5
   },
   {
    "ddd": "43",
    "v": 620,
    "pct": 6.3
   },
   {
    "ddd": "42",
    "v": 297,
    "pct": 3
   },
   {
    "ddd": "44",
    "v": 199,
    "pct": 2
   },
   {
    "ddd": "45",
    "v": 123,
    "pct": 1.2
   },
   {
    "ddd": "47",
    "v": 88,
    "pct": 0.9
   },
   {
    "ddd": "11",
    "v": 72,
    "pct": 0.7
   },
   {
    "ddd": "99",
    "v": 48,
    "pct": 0.5
   }
  ],
  "dddForaDoEstado": 225,
  "confirmacao": [
   {
    "estado": "sem nenhuma resposta",
    "v": 9862
   },
   {
    "estado": "disse que vai aderir",
    "v": 2
   },
   {
    "estado": "disse que não vai",
    "v": 1
   }
  ],
  "fichaDupla": {
   "ativos": 1984,
   "tambemPassageiro": 602,
   "pct": 30.3,
   "produzem": 161,
   "metaDeles": 27480
  },
  "muda": [
   {
    "t": "Mede-se prontidão, não adesão.",
    "d": "Os 9.846 cadastros foram gravados uma vez e ninguém os confirmou depois: só 3 das 9.865 fichas têm alguma resposta, e nenhuma diz de que aeroporto a pessoa sai. O total cresce com o número de pilotos diferentes cadastrando no mesmo dia, cujo recorde é 49 (13/11), 2,5% dos ativos."
   },
   {
    "t": "Os 112.000 não cabem na conta que a própria equipe faz.",
    "d": "Mesmo com o 20/80 inteiro (captura de 100%) e 490 cadastros por dia até 29/11, a conta chega a 85.980 — perto da Projetada e 26 mil abaixo da meta. Escolher agora o número que vai a público sai mais barato que desmenti-lo depois de 29/11."
   },
   {
    "t": "34% dos cadastros vêm de 5% da rede.",
    "d": "As Embaixadas somam 102 pilotos e 3.318 registros; a Rota 20 tem 280 fichas e 11 cadastros. Tratar a Rota 20 como rede disponível incha todos os denominadores."
   },
   {
    "t": "Abrir ficha nova parou de dar retorno.",
    "d": "A safra de 12/10 rendeu 41,7 cadastros por ficha; a de 09/11, 0,7. Enquanto isso, 124 produtores estão parados há 7 dias ou mais e devem 2.456 de meta — basta uma mensagem, e eles já sabem usar o bot."
   },
   {
    "t": "A entrada depende de duas máquinas.",
    "d": "92,9% dos cadastros chegam pelo bot, e duas linhas de WhatsApp (linha6 e linha5) concentram 8.842 registros. 13,6% entra entre 22h e 8h, quando não há plantão."
   }
  ],
  "naoMede": [
   "De onde o passageiro embarca. A base guarda o telefone, não a cidade nem o aeroporto; o DDD só indica o chip.",
   "Se o cadastro vira adesão. 9.862 de 9.865 fichas não têm status; qualquer taxa de conversão seria chute.",
   "Captura. Não existe denominador no sistema; os 15%, 35% e 60% dos cenários são premissas.",
   "O 20/80. É hipótese do gestor, apoiada em 34 dias de histórico, sem a semana do surto e sem temporadas anteriores.",
   "Quem cadastrou de fato. A linha de WhatsApp gravada é a atual do piloto, e 14/11 está incompleto."
  ],
  "regua": {
   "linhas": [
    {
     "metrica": "Passageiros por dia",
     "significado": "média dos últimos 7 dias fechados",
     "verde": "≥ 420",
     "amarelo": "270–419",
     "vermelho": "< 270",
     "hoje": "291",
     "status": "amarelo"
    },
    {
     "metrica": "Pilotos vivos em 7 dias",
     "significado": "pilotos distintos que cadastraram na semana",
     "verde": "≥ 230",
     "amarelo": "140–229",
     "vermelho": "< 140",
     "hoje": "118",
     "status": "vermelho"
    },
    {
     "metrica": "Produtores parados 7+ dias",
     "significado": "já cadastraram alguém e pararam",
     "verde": "≤ 45",
     "amarelo": "46–90",
     "vermelho": "> 90",
     "hoje": "124",
     "status": "vermelho"
    }
   ],
   "nota": "Nenhuma das três métricas está no verde. A única que anda na direção certa é a de pilotos vivos — e mesmo ela ganhou 47 pessoas desde a semana de 12/10, com 3 semanas pela frente."
  },
  "p": [
   13,
   21
  ]
 },
 "controladores": {
  "letra": "C",
  "titulo": "Controladores e expectativa: quem sustenta a rede",
  "pergunta": "Quem produz, quem lança expectativa e o que cabe dentro da Projetada.",
  "frase": "A Projetada conta fichas: soma a meta de cada piloto ativo, com ou sem dono, conversa ou passageiro. A Real conta outra coisa — quanto a pessoa que coordena aquele piloto acredita que ele vai trazer. A primeira é 6,6 vezes a segunda, e essa distância não vem de otimismo: vem de cadastro que ninguém acompanha.",
  "kpis": [
   {
    "v": 72,
    "rotulo": "contas de controlador ativas (53 com ao menos um piloto)"
   },
   {
    "v": 84720,
    "rotulo": "Projetada — soma das metas dos 1.984 pilotos ativos"
   },
   {
    "v": 12874,
    "rotulo": "Real lançada — rodada de 10/11"
   },
   {
    "v": 9846,
    "rotulo": "Contabilizados — passageiros no banco desde 12/10"
   }
  ],
  "contasAtivas": 72,
  "comPiloto": 53,
  "comoLerLancou": "Só conta a linha com carimbo de envio (lancadoEm). Zero carimbado é resposta — \"este piloto não vai trazer ninguém\". Linha sem carimbo não vale zero: quer dizer que ninguém respondeu.",
  "carteiras": [
   {
    "faixa": "1 a 9 pilotos",
    "carteiras": 14,
    "passageiros": 1052
   },
   {
    "faixa": "10 a 29 pilotos",
    "carteiras": 6,
    "passageiros": 1286
   },
   {
    "faixa": "30 a 39 pilotos",
    "carteiras": 23,
    "passageiros": 4498
   },
   {
    "faixa": "40 a 99 pilotos",
    "carteiras": 9,
    "passageiros": 2831
   },
   {
    "faixa": "100 ou mais (triagem)",
    "carteiras": 1,
    "passageiros": 23,
    "triagem": true
   }
  ],
  "pilotosComControlador": 1940,
  "top20": [
   {
    "nome": "Ana V.",
    "pilotos": 43,
    "produzem": 16,
    "produzemPct": 37.2,
    "passageiros": 1320,
    "ult7d": 582,
    "lancaram": 45,
    "deHoje": 43
   },
   {
    "nome": "Bruno T.",
    "pilotos": 22,
    "produzem": 15,
    "produzemPct": 68.2,
    "passageiros": 846,
    "ult7d": 205,
    "lancaram": 22,
    "deHoje": 22
   },
   {
    "nome": "Celso M.",
    "pilotos": 36,
    "produzem": 12,
    "produzemPct": 33.3,
    "passageiros": 591,
    "ult7d": 46,
    "lancaram": 36,
    "deHoje": 36
   },
   {
    "nome": "Denise R.",
    "pilotos": 31,
    "produzem": 13,
    "produzemPct": 41.9,
    "passageiros": 525,
    "ult7d": 90,
    "lancaram": 31,
    "deHoje": 31
   },
   {
    "nome": "Edson S.",
    "pilotos": 7,
    "produzem": 5,
    "produzemPct": 71.4,
    "passageiros": 445,
    "ult7d": 4,
    "lancaram": 0,
    "deHoje": 7
   },
   {
    "nome": "Fátima N.",
    "pilotos": 46,
    "produzem": 11,
    "produzemPct": 23.9,
    "passageiros": 414,
    "ult7d": 85,
    "lancaram": 46,
    "deHoje": 46
   },
   {
    "nome": "Gustavo P.",
    "pilotos": 32,
    "produzem": 8,
    "produzemPct": 25,
    "passageiros": 362,
    "ult7d": 54,
    "lancaram": 32,
    "deHoje": 32
   },
   {
    "nome": "Hilda L.",
    "pilotos": 30,
    "produzem": 7,
    "produzemPct": 23.3,
    "passageiros": 342,
    "ult7d": 11,
    "lancaram": 30,
    "deHoje": 30
   },
   {
    "nome": "Igor C.",
    "pilotos": 44,
    "produzem": 10,
    "produzemPct": 22.7,
    "passageiros": 308,
    "ult7d": 50,
    "lancaram": 44,
    "deHoje": 44
   },
   {
    "nome": "Kleber A.",
    "pilotos": 37,
    "produzem": 6,
    "produzemPct": 16.2,
    "passageiros": 272,
    "ult7d": 41,
    "lancaram": 37,
    "deHoje": 37
   },
   {
    "nome": "Lívia E.",
    "pilotos": 31,
    "produzem": 8,
    "produzemPct": 25.8,
    "passageiros": 260,
    "ult7d": 30,
    "lancaram": 31,
    "deHoje": 31
   },
   {
    "nome": "Nelson G.",
    "pilotos": 38,
    "produzem": 7,
    "produzemPct": 18.4,
    "passageiros": 256,
    "ult7d": 92,
    "lancaram": 38,
    "deHoje": 38
   },
   {
    "nome": "Otávio H.",
    "pilotos": 30,
    "produzem": 6,
    "produzemPct": 20,
    "passageiros": 253,
    "ult7d": 26,
    "lancaram": 31,
    "deHoje": 30
   },
   {
    "nome": "Renata K.",
    "pilotos": 33,
    "produzem": 7,
    "produzemPct": 21.2,
    "passageiros": 231,
    "ult7d": 13,
    "lancaram": 34,
    "deHoje": 33
   },
   {
    "nome": "Sílvia J.",
    "pilotos": 30,
    "produzem": 4,
    "produzemPct": 13.3,
    "passageiros": 221,
    "ult7d": 5,
    "lancaram": 30,
    "deHoje": 30
   },
   {
    "nome": "Tiago O.",
    "pilotos": 40,
    "produzem": 7,
    "produzemPct": 17.5,
    "passageiros": 197,
    "ult7d": 7,
    "lancaram": 41,
    "deHoje": 40
   },
   {
    "nome": "Úrsula Q.",
    "pilotos": 31,
    "produzem": 4,
    "produzemPct": 12.9,
    "passageiros": 186,
    "ult7d": 15,
    "lancaram": 28,
    "deHoje": 31
   },
   {
    "nome": "Vítor W.",
    "pilotos": 26,
    "produzem": 5,
    "produzemPct": 19.2,
    "passageiros": 185,
    "ult7d": 21,
    "lancaram": 26,
    "deHoje": 26
   },
   {
    "nome": "Yara U.",
    "pilotos": 29,
    "produzem": 6,
    "produzemPct": 20.7,
    "passageiros": 179,
    "ult7d": 34,
    "lancaram": 27,
    "deHoje": 29
   },
   {
    "nome": "Luana B.",
    "pilotos": 30,
    "produzem": 12,
    "produzemPct": 40,
    "passageiros": 168,
    "ult7d": 41,
    "lancaram": 1,
    "deHoje": 30
   }
  ],
  "top10Soma": {
   "passageiros": 5425,
   "deTotalComControlador": 9690,
   "pct": 56
  },
  "semana": {
   "total": 1843,
   "top10": 1361,
   "top10Pct": 73.8,
   "lista": [
    {
     "nome": "Ana V.",
     "ult7d": 582,
     "total": 1320
    },
    {
     "nome": "Bruno T.",
     "ult7d": 205,
     "total": 846
    },
    {
     "nome": "Heloísa D.",
     "ult7d": 116,
     "total": 153
    },
    {
     "nome": "Nelson G.",
     "ult7d": 92,
     "total": 256
    },
    {
     "nome": "Denise R.",
     "ult7d": 90,
     "total": 525
    },
    {
     "nome": "Fátima N.",
     "ult7d": 85,
     "total": 414
    },
    {
     "nome": "Gustavo P.",
     "ult7d": 54,
     "total": 362
    },
    {
     "nome": "Igor C.",
     "ult7d": 50,
     "total": 308
    },
    {
     "nome": "Celso M.",
     "ult7d": 46,
     "total": 591
    },
    {
     "nome": "Kleber A.",
     "ult7d": 41,
     "total": 272
    }
   ],
   "leitura": "Estar ativo agora não é o mesmo que ser grande no acumulado: 8 dos 10 da semana também estão entre os 10 maiores no total, 2 só aparecem pelo recorte da semana, e uma única carteira fez 582 dos 1.843 cadastros. A cobrança deve seguir a coluna da semana."
  },
  "metades": [
   {
    "nome": "Ana V.",
    "a": 426,
    "b": 894,
    "tendencia": "subiu",
    "ult7d": 582
   },
   {
    "nome": "Bruno T.",
    "a": 94,
    "b": 752,
    "tendencia": "subiu",
    "ult7d": 205
   },
   {
    "nome": "Celso M.",
    "a": 300,
    "b": 291,
    "tendencia": "estavel",
    "ult7d": 46
   },
   {
    "nome": "Denise R.",
    "a": 222,
    "b": 303,
    "tendencia": "subiu",
    "ult7d": 90
   },
   {
    "nome": "Edson S.",
    "a": 390,
    "b": 55,
    "tendencia": "caiu",
    "ult7d": 4
   },
   {
    "nome": "Fátima N.",
    "a": 262,
    "b": 152,
    "tendencia": "caiu",
    "ult7d": 85
   },
   {
    "nome": "Gustavo P.",
    "a": 174,
    "b": 188,
    "tendencia": "estavel",
    "ult7d": 54
   },
   {
    "nome": "Hilda L.",
    "a": 179,
    "b": 163,
    "tendencia": "estavel",
    "ult7d": 11
   },
   {
    "nome": "Igor C.",
    "a": 190,
    "b": 118,
    "tendencia": "caiu",
    "ult7d": 50
   },
   {
    "nome": "Kleber A.",
    "a": 183,
    "b": 89,
    "tendencia": "caiu",
    "ult7d": 41
   }
  ],
  "metadesNota": "12/10 a 28/10 contra 29/10 a 14/11, 17 dias cada. Subiu = cresceu mais de 20%; caiu = recuou mais de 20%; estável = ficou no mesmo patamar. Carteira em queda há duas semanas não se recupera sozinha.",
  "feedbacks": {
   "total": 1047,
   "dias": 15,
   "maxPessoasDia": 9,
   "leitura": "Em nenhum dia mais de 9 pessoas diferentes escreveram: o hábito de dar retorno mora no mesmo pequeno grupo que produz."
  },
  "rodada": {
   "data": "2026-11-10",
   "linhas": 1940,
   "respondidas": 1197,
   "respondidasPct": 61.7,
   "responderamZero": 790,
   "zeroPct": 66,
   "real": 12874,
   "semFiltro": 23065,
   "diferencaSemCarimbo": 10191,
   "linhasQueFormamReal": 407,
   "mediaPorPiloto": 31.6,
   "semCarimbo": 743,
   "respostasPorDia": [
    {
     "dia": "2026-11-10",
     "v": 82
    },
    {
     "dia": "2026-11-11",
     "v": 115
    },
    {
     "dia": "2026-11-12",
     "v": 216
    },
    {
     "dia": "2026-11-13",
     "v": 670
    },
    {
     "dia": "2026-11-14",
     "v": 114,
     "parcial": true
    }
   ],
   "mutiraoPct": 56,
   "faixas": [
    {
     "faixa": "zero",
     "v": 790,
     "zero": true
    },
    {
     "faixa": "1–9",
     "v": 48
    },
    {
     "faixa": "10–19",
     "v": 132
    },
    {
     "faixa": "20–39",
     "v": 91
    },
    {
     "faixa": "40–99",
     "v": 122
    },
    {
     "faixa": "100+",
     "v": 14
    }
   ],
   "cobertura": [
    {
     "nome": "Joana F.",
     "papel": "conta de triagem da Rota 20",
     "resp": 1,
     "pilotos": 538,
     "pct": 0.2
    },
    {
     "nome": "Rogério Z.",
     "resp": 96,
     "pilotos": 96,
     "pct": 100
    },
    {
     "nome": "Zélia W.",
     "resp": 48,
     "pilotos": 58,
     "pct": 82.8
    },
    {
     "nome": "Wagner I.",
     "resp": 49,
     "pilotos": 48,
     "pct": 102.1
    },
    {
     "nome": "Fátima N.",
     "resp": 46,
     "pilotos": 46,
     "pct": 100
    },
    {
     "nome": "Igor C.",
     "resp": 44,
     "pilotos": 44,
     "pct": 100
    },
    {
     "nome": "Ana V.",
     "resp": 45,
     "pilotos": 43,
     "pct": 104.7
    },
    {
     "nome": "Ivone T.",
     "resp": 41,
     "pilotos": 41,
     "pct": 100
    },
    {
     "nome": "Tiago O.",
     "resp": 41,
     "pilotos": 40,
     "pct": 102.5
    },
    {
     "nome": "Priscila X.",
     "resp": 40,
     "pilotos": 40,
     "pct": 100
    },
    {
     "nome": "Nelson G.",
     "resp": 38,
     "pilotos": 38,
     "pct": 100
    },
    {
     "nome": "Kleber A.",
     "resp": 37,
     "pilotos": 37,
     "pct": 100
    },
    {
     "nome": "Celso M.",
     "resp": 36,
     "pilotos": 36,
     "pct": 100
    },
    {
     "nome": "Osmar Y.",
     "resp": 35,
     "pilotos": 35,
     "pct": 100
    },
    {
     "nome": "Gilberto M.",
     "resp": 34,
     "pilotos": 34,
     "pct": 100
    }
   ],
   "coberturaNota": "Linhas respondidas sobre os pilotos que cada pessoa tem hoje. A rodada retrata 10/11; piloto que mudou de controlador depois continua pesando na conta de quem respondeu — por isso há quem passe de 100%.",
   "leitura": "As carteiras de verdade responderam quase inteiras. Foge à regra justamente a maior conta: a da fila de triagem da Rota 20 tem 538 pilotos e respondeu 1 linha. Esses 538 carregam 18.640 de meta na Projetada sem ninguém cobrando."
  },
  "semDono": {
   "total": 582,
   "orfaos": 44,
   "triagem": 538,
   "meta": 20560,
   "pctProjetada": 24.3,
   "comPassageiro": 7
  },
  "naoLancaramMasProduzem": {
   "controladores": 13,
   "passageiros": 1303
  },
  "lancaramTudoSemPassageiro": {
   "controladores": 5,
   "pilotos": 143
  },
  "muda": [
   {
    "t": "582 pilotos estão sem dono de verdade — e ninguém cobra por eles.",
    "d": "São 44 órfãos e 538 parados na conta de triagem da Rota 20. Somam 20.560 de meta projetada (24,3% da Projetada) e só 7 deles têm algum passageiro. Na rodada de 10/11 essa conta respondeu 1 linha de 538."
   },
   {
    "t": "A rodada teve resposta — e a resposta mais comum foi zero.",
    "d": "1.197 das 1.940 linhas têm carimbo (61,7%); 790 delas vieram com zero, e a Real inteira sai de 407 linhas. O ponto cego são as 743 sem carimbo: ninguém sabe se valem zero ou se ninguém perguntou."
   },
   {
    "t": "Dez carteiras sustentam mais da metade da rede.",
    "d": "Os 10 maiores somam 5.425 dos 9.690 passageiros com controlador (56,0%). Na última semana, 10 carteiras fizeram 1.361 dos 1.843 cadastros; a maior delas, 582."
   },
   {
    "t": "Responder a rodada não é o mesmo que produzir.",
    "d": "13 controladores não lançaram linha nenhuma e ainda assim somam 1.303 passageiros. Outros 5, com 143 pilotos, responderam todas as linhas e não têm passageiro nenhum."
   },
   {
    "t": "Duas contas independentes param perto de 13 mil.",
    "d": "A Real (12.874) fica a 0,7% da soma das metas dos 274 pilotos que já cadastraram alguém (12.960). Podem coincidir por acaso — mas ambas estão a mais de 70 mil da Projetada. A logística se planeja pela Real, não pela Projetada."
   }
  ],
  "naoMede": [
   "A Real não traz data: informa tamanho, não prazo. Nenhuma rodada perguntou \"quantos entre 30/11 e 06/12\".",
   "Com uma rodada só não existe série: não há como dizer se a expectativa subiu ou caiu.",
   "O zero tem dois sentidos: \"não traz ninguém\" e \"não sei\" chegam ao banco do mesmo jeito.",
   "Cada piloto tem um único controlador: quando ele troca, o histórico sai do ranking de quem o cedeu.",
   "Não há medida de esforço: carteira parada tanto pode ser gente parada quanto gente trabalhando sem registrar.",
   "O carimbo não prova conversa: lancadoEm mostra que alguém respondeu no painel, não que falou com o piloto."
  ],
  "regua": {
   "nota": "Os limites verde/amarelo/vermelho são proposta deste capítulo para a pré-temporada, não medição. A coluna \"hoje\" é medida (14/11, dia incompleto).",
   "linhas": [
    {
     "metrica": "Pilotos sem dono real (órfãos + fila de triagem)",
     "verde": "até 40",
     "amarelo": "41 a 180",
     "vermelho": "mais de 180",
     "hoje": "582",
     "status": "vermelho"
    },
    {
     "metrica": "Linhas da rodada respondidas",
     "verde": "80% ou mais",
     "amarelo": "55% a 79%",
     "vermelho": "menos de 55%",
     "hoje": "61,7%",
     "status": "amarelo"
    },
    {
     "metrica": "Controladores que cadastraram alguém na semana",
     "verde": "38 ou mais",
     "amarelo": "22 a 37",
     "vermelho": "menos de 22",
     "hoje": "38 de 53",
     "status": "verde"
    },
    {
     "metrica": "Controladores com 10 ou mais cadastros na semana",
     "verde": "26 ou mais",
     "amarelo": "13 a 25",
     "vermelho": "menos de 13",
     "hoje": "31 de 53",
     "status": "verde"
    },
    {
     "metrica": "Pilotos com dono que nunca falaram com o bot",
     "verde": "até 250",
     "amarelo": "251 a 500",
     "vermelho": "mais de 500",
     "hoje": "741",
     "status": "vermelho"
    }
   ]
  },
  "p": [
   22,
   27
  ]
 },
 "central": {
  "letra": "D",
  "titulo": "Central Horizonte: bot, chamados e capacidade",
  "pergunta": "Até onde o sistema aguenta — e em que ponto ele já transborda.",
  "frase": "O gargalo não é o software: num único dia o bot recebeu 1.548 mensagens e não caiu. A Central esbarra em duas coisas que código nenhum resolve — gente para atender o que o bot não resolve e um número que responde por mais da metade dos passageiros e, pela verificação de 11/11, está bloqueado por pagamento (responde dentro da janela de 24 h, mas não abre conversa).",
  "kpis": [
   {
    "v": 4836,
    "rotulo": "mensagens recebidas nos 7 dias completos (07 a 13/11)"
   },
   {
    "v": 195,
    "rotulo": "conversas novas no bot nos mesmos 7 dias"
   },
   {
    "v": 29,
    "rotulo": "chamados humanos abertos agora, esperando alguém"
   },
   {
    "v": 5214,
    "rotulo": "passageiros ligados ao número linha6 (52,9% do total)"
   }
  ],
  "datasNota": "As mensagens recebidas só são guardadas desde 22/10; antes disso já havia conversa (sessões desde 12/10), mas nada ficava gravado. As falas só existem desde 07/11.",
  "pecas": [
   {
    "peca": "Mensagem recebida",
    "e": "cada mensagem que a Meta entrega à Central",
    "naoE": "não inclui as respostas do bot, que não são guardadas",
    "registrado": 17846,
    "desde": "22/10"
   },
   {
    "peca": "Conversa (sessão)",
    "e": "um telefone falando com um número, parado numa etapa do roteiro",
    "naoE": "não é uma pessoa: o mesmo telefone em outro número abre outra conversa",
    "registrado": 787,
    "desde": "12/10"
   },
   {
    "peca": "Fala",
    "e": "o texto escrito pela pessoa, junto da etapa em que ela estava",
    "naoE": "não existe antes de 07/11",
    "registrado": 2956,
    "desde": "07/11"
   },
   {
    "peca": "Chamado",
    "e": "pedido de ajuda humana feito ao controlador",
    "naoE": "não é o atendimento em si, que acontece fora do sistema",
    "registrado": 163,
    "desde": "12/10"
   }
  ],
  "pilotoFalouBot": [
   {
    "faixa": "falou hoje",
    "v": 52
   },
   {
    "faixa": "há 1 a 3 dias",
    "v": 61
   },
   {
    "faixa": "há 3 a 7 dias",
    "v": 58
   },
   {
    "faixa": "há 7 a 14 dias",
    "v": 93
   },
   {
    "faixa": "há mais de 14 dias",
    "v": 87
   },
   {
    "faixa": "nunca falou (sem registro)",
    "v": 1633,
    "vazio": true
   }
  ],
  "mensagens": {
   "mediana24dias": 714,
   "mediaUltimaSemana": 691,
   "pico": {
    "v": 1548,
    "dia": "2026-10-26"
   }
  },
  "conversasNovasPico": [
   {
    "dia": "2026-10-26",
    "v": 197
   },
   {
    "dia": "2026-10-27",
    "v": 94
   }
  ],
  "falas": {
   "total": 2956,
   "pico": {
    "dia": "2026-11-11",
    "v": 846,
    "telefones": 57
   },
   "diaRecordePilotos": {
    "v": 553,
    "telefones": 71
   }
  },
  "etapas": [
   {
    "etapa": "MENU — descanso",
    "grupo": "descanso",
    "v": 352,
    "ativas7d": 151
   },
   {
    "etapa": "LISTA — compromisso",
    "grupo": "lista",
    "v": 153,
    "ativas7d": 3
   },
   {
    "etapa": "LISTA — contatos",
    "grupo": "lista",
    "v": 91,
    "ativas7d": 2
   },
   {
    "etapa": "LISTA — formato",
    "grupo": "lista",
    "v": 54,
    "ativas7d": 4
   },
   {
    "etapa": "PASSAGEIRO — dados",
    "grupo": "passageiro",
    "v": 33,
    "ativas7d": 9
   },
   {
    "etapa": "CADASTRO — nome",
    "grupo": "cadastro",
    "v": 26,
    "ativas7d": 3
   },
   {
    "etapa": "CADASTRO — compromisso",
    "grupo": "cadastro",
    "v": 16,
    "ativas7d": 2
   },
   {
    "etapa": "CADASTRO — interesse",
    "grupo": "cadastro",
    "v": 9,
    "ativas7d": 1
   },
   {
    "etapa": "outras 6 etapas",
    "grupo": "outras",
    "v": 27,
    "ativas7d": 6
   }
  ],
  "etapasResumo": {
   "comEtapa": 761,
   "descanso": 352,
   "noMeio": 409,
   "naLista": 298,
   "ativas7d": 181
  },
  "falasPorEtapa": [
   {
    "etapa": "PASSAGEIRO — confirmação",
    "v": 1632
   },
   {
    "etapa": "MENU — descanso",
    "v": 875
   },
   {
    "etapa": "PASSAGEIRO — dados",
    "v": 195
   },
   {
    "etapa": "sem etapa registrada",
    "v": 41
   },
   {
    "etapa": "MATERIAL — para quem",
    "v": 27
   },
   {
    "etapa": "MATERIAL — kit",
    "v": 21
   },
   {
    "etapa": "outras 8 etapas",
    "v": 165
   }
  ],
  "falasConfirmacaoPct": 55.2,
  "numeros": [
   {
    "numero": "linha5",
    "conversas": 289,
    "ativas7d": 50,
    "passageiros": 3628
   },
   {
    "numero": "linha6",
    "conversas": 243,
    "ativas7d": 118,
    "passageiros": 5214,
    "alerta": "bloqueada por pagamento (verificação de 11/11, não conferida hoje)"
   },
   {
    "numero": "linha2",
    "conversas": 84,
    "ativas7d": 11,
    "passageiros": 423
   },
   {
    "numero": "linha1",
    "conversas": 76,
    "ativas7d": 7,
    "passageiros": 196
   },
   {
    "numero": "linha4",
    "conversas": 52,
    "ativas7d": 0,
    "passageiros": 117,
    "alerta": "perdeu o selo de conta ativa (verificação de 11/11)"
   },
   {
    "numero": "sem número registrado",
    "conversas": 43,
    "ativas7d": 0,
    "passageiros": 287
   },
   {
    "numero": "sac",
    "conversas": null,
    "ativas7d": null,
    "passageiros": 0
   }
  ],
  "conversasVivasSemana": 186,
  "numerosCuidado": "O número ao lado do piloto é o que ele usa hoje, não o canal por onde o cadastro entrou. A leitura segura é \"o linha6 concentra a base viva\"; \"o linha6 produziu esses 5.214 cadastros\" é leitura errada.",
  "chamados": {
   "abertos34d": 163,
   "fechados": 134,
   "abertosAgora": 29,
   "recordeDia": {
    "v": 23,
    "dia": "2026-10-26"
   },
   "limpezaFila": {
    "fechamentos": 41,
    "medianaH": 251
   },
   "tempoAteFechar": [
    {
     "faixa": "≤1 h",
     "v": 39
    },
    {
     "faixa": "1–4 h",
     "v": 17
    },
    {
     "faixa": "4–24 h",
     "v": 14
    },
    {
     "faixa": "1–3 d",
     "v": 21
    },
    {
     "faixa": ">3 d",
     "v": 43,
     "alerta": true
    }
   ],
   "tipos": [
    {
     "tipo": "Material",
     "estado": "fechado",
     "total": 75,
     "abertosHoje": null
    },
    {
     "tipo": "Controlador",
     "estado": "fechado",
     "total": 53,
     "abertosHoje": null
    },
    {
     "tipo": "Demanda",
     "estado": "aberto",
     "total": 13,
     "abertosHoje": 13
    },
    {
     "tipo": "Controlador",
     "estado": "aberto",
     "total": 11,
     "abertosHoje": 11
    },
    {
     "tipo": "Demanda",
     "estado": "fechado",
     "total": 6,
     "abertosHoje": null
    },
    {
     "tipo": "Endereço",
     "estado": "aberto",
     "total": 3,
     "abertosHoje": 3
    },
    {
     "tipo": "Material",
     "estado": "aberto",
     "total": 2,
     "abertosHoje": 2
    }
   ],
   "paradosMais48h": 25,
   "semDonoAutomatico": 24,
   "chatMensagens": 392,
   "leitura": "23 chamados num dia é o volume humano que já se viu; qualquer plano que gere mais do que isso precisa de gente antes, não depois."
  },
  "capacidade": {
   "premissa": "Exigência diária = resultado × 0,8 ÷ 7 dias: a última semana carregaria 80% do resultado. O 20/80 é hipótese do gestor, não medição. \"Teto provado\" é o maior dia já registrado — aconteceu uma vez, não virou rotina.",
   "cenarios": [
    "25 mil",
    "50 mil",
    "90 mil"
   ],
   "elos": [
    {
     "elo": "Passageiros registrados por dia",
     "teto": 655,
     "quando": "22/10",
     "exige": [
      2857,
      5714,
      10286
     ],
     "situacao": "4,4× abaixo do menor",
     "abaixo": true
    },
    {
     "elo": "Pilotos cadastrando no mesmo dia",
     "teto": 49,
     "quando": "13/11",
     "exige": [
      301,
      601,
      1083
     ],
     "situacao": "6,1× abaixo do menor",
     "abaixo": true
    },
    {
     "elo": "Mensagens recebidas por dia",
     "teto": 1548,
     "quando": "26/10",
     "exige": [
      4300,
      8600,
      15500
     ],
     "situacao": "2,8× abaixo do menor",
     "abaixo": true
    },
    {
     "elo": "Chamados humanos abertos no dia",
     "teto": 23,
     "quando": "26/10",
     "exige": [
      29,
      57,
      103
     ],
     "situacao": "1,3× abaixo do menor",
     "abaixo": true
    },
    {
     "elo": "Convites impressos em estoque (1 por cadastro)",
     "teto": 742310,
     "quando": "14/11",
     "exige": [
      25000,
      50000,
      90000
     ],
     "situacao": "aguenta os três",
     "abaixo": false
    }
   ],
   "leitura": "Dos cinco elos, quatro ficam abaixo do que o cenário mais baixo pede por dia. O único que aguenta é o estoque de convites — papel. Nenhum cenário de 25 mil se sustenta sem multiplicar por 4,4 a entrada diária de cadastros.",
   "numeroParaAMesa": "O número para levar à mesa é 655: o que a operação conseguiu uma vez, num único dia (22/10)."
  },
  "ensaioDisparo": {
   "medido": {
    "mensagens": 1548,
    "conversasNovas": 197,
    "chamados": 23
   },
   "memoria": "Foram disparadas entre 1,1 e 1,2 mil mensagens; 287 pessoas responderam; 93 viraram piloto em 3 dias; 41 cadastraram alguém; o grupo reuniu 861 passageiros em 3 semanas.",
   "cuidado": "Nada liga as 197 conversas novas do dia aos destinatários do disparo: a data coincide, mas a prova não existe."
  },
  "muda": [
   {
    "t": "O canal com mais da metade dos passageiros não consegue abrir conversa.",
    "d": "O linha6 está ligado a 52,9% dos passageiros e reúne 118 das 186 conversas vivas da semana. A última verificação (11/11, sem conferência hoje) aponta bloqueio por pagamento. Resolver leva horas, não semanas, e libera o canal de maior volume."
   },
   {
    "t": "A Central nunca foi testada sob surto.",
    "d": "O maior dia de mensagens (1.548, em 26/10) fica 2,8 vezes abaixo do que o cenário de 25 mil pede por dia. O simulado mede capacidade — captura, não."
   },
   {
    "t": "A desistência tem lugar certo: a lista de convidados.",
    "d": "Das 761 conversas com etapa registrada, 352 descansam no menu e 298 travaram no meio da lista. É roteiro, não servidor."
   },
   {
    "t": "Chamado humano ou fecha na hora ou fica esquecido.",
    "d": "39 chamados fecharam em até 1 hora; 43 passaram de 3 dias. Dos 29 abertos agora, pelo menos 25 já têm mais de 48 h."
   }
  ],
  "acoes": [
   {
    "ordem": 1,
    "acao": "Abrir hoje o painel da Meta e conferir a situação das contas linha6 e linha4.",
    "porque": "A informação disponível é da verificação de 11/11. Se o bloqueio for real, é o problema mais caro da lista e o mais barato de resolver."
   },
   {
    "ordem": 2,
    "acao": "Pôr um responsável nos 24 chamados abertos de demanda e de controlador.",
    "porque": "Nenhum deles tem fluxo automático, e ao menos 25 dos 29 abertos passaram de 48 h."
   },
   {
    "ordem": 3,
    "acao": "Encurtar a etapa da lista de convidados.",
    "porque": "298 conversas travaram ali — mais do que todas as outras etapas do meio do caminho somadas."
   },
   {
    "ordem": 4,
    "acao": "Ligar os carimbos da régua da Fase B antes de subir o volume.",
    "porque": "Para enxergar a Central engasgando antes do Dia D, e não durante."
   }
  ],
  "naoMede": [
   "Tempo de resposta do bot: existe o carimbo de chegada, mas não o de resposta.",
   "Limites da Meta: faixa de qualidade, teto diário de conversas iniciadas e taxa de falha ficam só no painel da Meta.",
   "O disparo de 26/10: nem os destinatários nem o envio ficaram gravados.",
   "O que o bot manda: só a mensagem recebida é guardada."
  ],
  "reguaFaseB": {
   "nota": "Proposta, não medição: os limites de fila e de falha ainda precisam ser combinados com o gestor.",
   "linhas": [
    {
     "metrica": "Registros por hora (pico)",
     "verde": "≥ 286/h",
     "amarelo": "143 a 286",
     "vermelho": "< 143",
     "hoje": "58/h",
     "hojeNota": "09/11, 22h — alvo 286/h = 2.857 ÷ 10 h úteis",
     "status": "vermelho"
    },
    {
     "metrica": "Fila do bot: minutos entre chegar e responder",
     "verde": "≤ 3 min",
     "amarelo": "3 a 10",
     "vermelho": "> 10",
     "hoje": null,
     "hojeNota": "não medido — falta o carimbo da resposta",
     "status": "nao-medido"
    },
    {
     "metrica": "Falhas de entrega da Meta",
     "verde": "< 1%",
     "amarelo": "1 a 2,5%",
     "vermelho": "> 2,5%",
     "hoje": null,
     "hojeNota": "não medido — o dado não chega ao banco",
     "status": "nao-medido"
    },
    {
     "metrica": "Chamados abertos há mais de 2 h",
     "verde": "0",
     "amarelo": "1 a 4",
     "vermelho": "> 4",
     "hoje": "≥ 25",
     "hojeNota": "dos 29 abertos, passaram de 48 h",
     "status": "vermelho"
    }
   ]
  },
  "p": [
   28,
   33
  ]
 },
 "operacao": {
  "letra": "E",
  "titulo": "Operação: material, campo, visitas e sistema",
  "pergunta": "Estoque, entregas, gente em campo, visitas, uso da Torre.",
  "frase": "O balcão é rápido; o que trava é insumo e registro. Metade das entregas sai em menos de 2 horas, mas 1 em cada 14 leva mais de três dias. O estoque de caixa kraft e de Manual Piloto acaba antes de 29/11. E mais da metade dos pedidos foi arquivada sem nunca receber o carimbo de entrega — a operação anda mais rápido do que consegue provar.",
  "kpis": [
   {
    "v": 524,
    "rotulo": "entregas de material em 7 dias (07/11–13/11)"
   },
   {
    "v": 30,
    "rotulo": "pedidos abertos hoje (nem entregues, nem arquivados)"
   },
   {
    "v": 97,
    "rotulo": "pessoas em campo ontem (13/11), pelo escaneio da refeição"
   },
   {
    "v": 0,
    "rotulo": "dias de estoque do item mais curto: Guia do Controlador (saldo 0)",
    "formato": "dias"
   }
  ],
  "pedidos": {
   "total": 1176,
   "entreguesComCarimbo": 537,
   "arquivadosSemCarimbo": 609,
   "abertos": 30,
   "arquivadosSemCarimboPct": 51.8,
   "entregasEntre": [
    537,
    1146
   ],
   "fluxoNovoDesde": "2026-10-28",
   "lotes": [
    {
     "dia": "2026-11-04",
     "v": 341
    },
    {
     "dia": "2026-11-12",
     "v": 358
    }
   ],
   "estados": [
    {
     "combinacao": "pedido · arquivado · sem carimbo",
     "v": 598,
     "alerta": true
    },
    {
     "combinacao": "entregue · aberto · com carimbo",
     "v": 530
    },
    {
     "combinacao": "pronto p/ entrega · aberto · sem carimbo",
     "v": 28
    },
    {
     "combinacao": "pronto p/ entrega · arquivado · sem carimbo",
     "v": 11,
     "alerta": true
    },
    {
     "combinacao": "entregue · arquivado · com carimbo",
     "v": 7
    },
    {
     "combinacao": "pedido · aberto · sem carimbo",
     "v": 2
    }
   ],
   "saida": [
    {
     "saida": "saída em branco",
     "v": 579,
     "comCarimbo": 3
    },
    {
     "saida": "retirada",
     "v": 425,
     "comCarimbo": 391
    },
    {
     "saida": "motoboy",
     "v": 172,
     "comCarimbo": 143
    }
   ],
   "saidaLeitura": "Quando a saída é preenchida, a entrega quase sempre é registrada. A saída em branco e o arquivamento sem entrega são a mesma população. Tornar a saída obrigatória fecha as duas lacunas de uma vez.",
   "caudaLonga": "A primeira versão do relatório comparava \"8,4 dias\" com \"1,2 h\" e concluía que a entrega tinha ficado quase instantânea. Eram 4 casos contra 533. Medido pela semana de entrega: mediana 1,6 h e p90 61 h.",
   "fontes": [
    {
     "mede": "Pedido de material",
     "tabela": "pedido_material",
     "naoDiz": "se a pessoa recebeu a caixa"
    },
    {
     "mede": "Itens do pedido",
     "tabela": "pedido_item",
     "naoDiz": "o que saiu de fato da prateleira"
    },
    {
     "mede": "Estoque e dias restantes",
     "tabela": "estoque_saldo · estoque_movimento",
     "naoDiz": "o que é lote e o que é balcão"
    },
    {
     "mede": "Etiqueta de kit",
     "tabela": "etiqueta_kit",
     "naoDiz": "se o kit chegou (1 conferência em 2.212)"
    },
    {
     "mede": "Gente em campo",
     "tabela": "refeicao",
     "naoDiz": "quem trabalha sem passar pela base operacional"
    },
    {
     "mede": "Visita a condomínios e comércios",
     "tabela": "formulario_visita",
     "naoDiz": "o nome do agente que visitou"
    },
    {
     "mede": "Uso do sistema",
     "tabela": "log_auditoria · conta_painel",
     "naoDiz": "quem só olhou a tela e não agiu"
    },
    {
     "mede": "Território dos leads",
     "tabela": "lead_regiao",
     "naoDiz": "onde o lead mora (96,7% sem região)"
    }
   ]
  },
  "itens": [
   {
    "item": "Kit Parceiro Agência Aurora",
    "un": 15840,
    "pedidos": 29
   },
   {
    "item": "Kit Feira de Turismo",
    "un": 11760,
    "pedidos": 11
   },
   {
    "item": "Carta de boas-vindas aos parceiros",
    "un": 2947,
    "pedidos": 1
   },
   {
    "item": "Kit Piloto",
    "un": 2896,
    "pedidos": 702,
    "diario": true
   },
   {
    "item": "Kit Evento Corporativo",
    "un": 2436,
    "pedidos": 8
   },
   {
    "item": "Kit Embaixada",
    "un": 562,
    "pedidos": 7
   },
   {
    "item": "Kit Viagem em Família",
    "un": 418,
    "pedidos": 21
   },
   {
    "item": "Kit Rota Interior",
    "un": 247,
    "pedidos": 214,
    "diario": true
   },
   {
    "item": "Kit Amigo Viajante",
    "un": 138,
    "pedidos": 26
   },
   {
    "item": "Kit Abertura da Temporada",
    "un": 96,
    "pedidos": 9
   },
   {
    "item": "Kit Aspirante",
    "un": 81,
    "pedidos": 79
   },
   {
    "item": "Kit Treinamento Piloto",
    "un": 46,
    "pedidos": 13
   },
   {
    "item": "Kit Adesivo Horizonte para carro",
    "un": 36,
    "pedidos": 5
   },
   {
    "item": "Kit Mochila Horizonte",
    "un": 29,
    "pedidos": 3
   },
   {
    "item": "Kit Guia de Bolso",
    "un": 9,
    "pedidos": 8
   }
  ],
  "itensLeitura": "Os três primeiros lugares são kits de parceiros e de feira e uma carta — 30.547 peças em 41 pedidos: encomendas grandes para eventos. O Kit Piloto é o oposto: 2.896 peças espalhadas em 702 pedidos, a operação de todo dia.",
  "tempoEntrega": {
   "faixas": [
    {
     "faixa": "≤1 h",
     "v": 229
    },
    {
     "faixa": "1–4 h",
     "v": 151
    },
    {
     "faixa": "4–24 h",
     "v": 88
    },
    {
     "faixa": "1–3 d",
     "v": 31
    },
    {
     "faixa": ">3 d",
     "v": 38,
     "alerta": true
    }
   ],
   "medianaH": 1.6,
   "p90H": 61,
   "maisDe3d": 38,
   "maisDe3dPct": 7.1
  },
  "regiaoPedido": {
   "semRegiao": 1131,
   "semRegiaoPct": 96.2,
   "preenchidas": 19
  },
  "autores": [
   {
    "autor": "admin-token (script)",
    "v": 583,
    "script": true
   },
   {
    "autor": "uma conta de pessoa",
    "v": 518
   },
   {
    "autor": "demais (6 contas, fluxo automático e sem autor gravado)",
    "v": 75
   }
  ],
  "autoresNota": "O livro lista os autores pelo começo do e-mail; aqui a conta de pessoa aparece sem o e-mail. 49,6% dos pedidos dos últimos 30 dias saíram do admin-token, ou seja, de script.",
  "scriptPct": 49.6,
  "estoque": {
   "itensMedidos": 34,
   "abaixoDe5d": 9,
   "abaixoDoD7": 14,
   "zerados": 3,
   "itens": [
    {
     "item": "Guia do Controlador",
     "dias": 0,
     "saldo": 0
    },
    {
     "item": "Convite de pré-estreia",
     "dias": 0,
     "saldo": 0
    },
    {
     "item": "Termo de adesão",
     "dias": 0,
     "saldo": 0
    },
    {
     "item": "Revista Destinos & Roteiros",
     "dias": 0.2,
     "saldo": 918
    },
    {
     "item": "Folheto Pacotes de Verão",
     "dias": 0.7,
     "saldo": 463
    },
    {
     "item": "Convite impresso — lote A",
     "dias": 1.3,
     "saldo": 21740,
     "lote": true
    },
    {
     "item": "Carta de boas-vindas aos parceiros",
     "dias": 2.4,
     "saldo": 5912
    },
    {
     "item": "Caixa kraft grande",
     "dias": 3.6,
     "saldo": 618,
     "critico": true
    },
    {
     "item": "Adesivo Horizonte para carro",
     "dias": 4.6,
     "saldo": 1627
    },
    {
     "item": "Convite impresso — lote B",
     "dias": 6.1,
     "saldo": 116930,
     "lote": true
    },
    {
     "item": "Manual Piloto",
     "dias": 7.8,
     "saldo": 1043,
     "critico": true
    },
    {
     "item": "Guia de Bolso Horizonte",
     "dias": 9.3,
     "saldo": 1348
    },
    {
     "item": "Folheto sanfona Roteiros do Sul",
     "dias": 10.2,
     "saldo": 4386
    },
    {
     "item": "Convite impresso — Temporada",
     "dias": 13.7,
     "saldo": 318460,
     "lote": true
    },
    {
     "item": "Adesivo Horizonte",
     "dias": 17.1,
     "saldo": 94
    },
    {
     "item": "Envelope plástico A4",
     "dias": 19.4,
     "saldo": 20870
    },
    {
     "item": "Chaveiro Horizonte",
     "dias": 24.8,
     "saldo": 312
    },
    {
     "item": "Cordão de crachá",
     "dias": 27.9,
     "saldo": 408
    }
   ],
   "leitura": "Dois pesam na operação diária: Caixa kraft grande — 618 peças, 3,6 dias — e Manual Piloto — 1.043 peças, 7,8 dias. Os convites impressos aparecem curtos por outro motivo: o saldo é enorme e o \"consumo de 23.245 por dia\" vem de cargas em lote, não do balcão. Comprar caixa kraft e reimprimir o Manual Piloto esta semana; para os convites, medir consumo sem os lotes antes de comprar.",
   "movimento": {
    "entradas": 4873216,
    "saidas": 1764905,
    "desde": "2026-10-23",
    "maiorEntrada": {
     "dia": "2026-11-10",
     "v": 1792604
    }
   }
  },
  "etiquetas": {
   "total": 2212,
   "desde": "2026-10-28",
   "conferenciaDesde": "2026-11-12",
   "canceladas": 3,
   "conferidas": 1,
   "picos": [
    {
     "dia": "2026-11-04",
     "v": 341
    },
    {
     "dia": "2026-11-11",
     "v": 894
    },
    {
     "dia": "2026-11-12",
     "v": 411
    }
   ],
   "filaImpressao": {
    "eventos": 4870,
    "erros": 68,
    "diasComErro": [
     {
      "dia": "2026-11-05",
      "v": 7
     },
     {
      "dia": "2026-11-06",
      "v": 29
     },
     {
      "dia": "2026-11-09",
      "v": 32
     }
    ]
   },
   "pontos": [
    {
     "ponto": "Ponto 11",
     "total": 880,
     "ult7d": 833
    },
    {
     "ponto": "Ponto 4",
     "total": 451,
     "ult7d": 425
    },
    {
     "ponto": "Ponto 2",
     "total": 325,
     "ult7d": 81
    },
    {
     "ponto": "Ponto 9",
     "total": 185,
     "ult7d": 172
    },
    {
     "ponto": "Ponto 15",
     "total": 150,
     "ult7d": 0
    },
    {
     "ponto": "Ponto 6",
     "total": 115,
     "ult7d": 76
    },
    {
     "ponto": "Ponto 12",
     "total": 62,
     "ult7d": 0
    },
    {
     "ponto": "Ponto 3",
     "total": 25,
     "ult7d": 0
    },
    {
     "ponto": "Ponto 10",
     "total": 16,
     "ult7d": 0
    },
    {
     "ponto": "Ponto 8",
     "total": 3,
     "ult7d": 0
    }
   ],
   "pontoLiderPct": 39.8,
   "duplaLider7dPct": 79,
   "ult7dTotal": 1587,
   "pontosParados": 5,
   "fluxoAntigo": {
    "etiquetaGerada": 7312,
    "prontoParado": 1409,
    "camposIncompletos": 41
   }
  },
  "campo": {
   "desde": "2026-10-18",
   "faixa14d": [
    58,
    104
   ],
   "mediana": 93,
   "ontem": 97,
   "faixas": {
    "verde": 90,
    "amarelo": 70
   },
   "refeicoes": {
    "servidas": 3465,
    "reservadas": 3659,
    "comparecimentoPct": 94.7
   },
   "areas": [
    {
     "area": "sem área preenchida",
     "pessoas": 79,
     "refeicoes": 1212,
     "vazio": true
    },
    {
     "area": "Rota 40",
     "pessoas": 9,
     "refeicoes": 45
    },
    {
     "area": "Controlador",
     "pessoas": 8,
     "refeicoes": 60
    },
    {
     "area": "Motorista",
     "pessoas": 6,
     "refeicoes": 136
    },
    {
     "area": "Equipe de rua",
     "pessoas": 6,
     "refeicoes": 109
    },
    {
     "area": "Central",
     "pessoas": 3,
     "refeicoes": 54
    },
    {
     "area": "Auxiliar de limpeza",
     "pessoas": 2,
     "refeicoes": 41
    },
    {
     "area": "Captação",
     "pessoas": 2,
     "refeicoes": 26
    },
    {
     "area": "Assistente financeiro",
     "pessoas": 1,
     "refeicoes": 26
    },
    {
     "area": "Administrativo",
     "pessoas": 1,
     "refeicoes": 12
    },
    {
     "area": "Apoio logístico",
     "pessoas": 1,
     "refeicoes": 8
    },
    {
     "area": "Comunicação",
     "pessoas": 1,
     "refeicoes": 7
    }
   ],
   "nota": "A operação de rua formal (rotas, ausências, liberações) tem zero linha no sistema. O proxy que sobrou é a refeição escaneada na base operacional. 02/11 não teve refeição (feriado, base fechada)."
  },
  "visitas": {
   "formulario": "visitas_r20",
   "semanas": [
    {
     "semana": "2026-10-19",
     "v": 128,
     "engajouPct": 41.4
    },
    {
     "semana": "2026-10-26",
     "v": 389,
     "engajouPct": 74.6
    },
    {
     "semana": "2026-11-02",
     "v": 403,
     "engajouPct": 24.3
    },
    {
     "semana": "2026-11-09",
     "v": 193,
     "engajouPct": 27.5
    }
   ],
   "formularioNovo": {
    "nome": "visita",
    "respostas": 304,
    "agentes": 6
   },
   "agentes": [
    {
     "agente": "Agente 1",
     "v": 338,
     "ult7d": 49
    },
    {
     "agente": "Agente 2",
     "v": 231,
     "ult7d": 47
    },
    {
     "agente": "Agente 3",
     "v": 209,
     "ult7d": 35
    },
    {
     "agente": "Agente 4",
     "v": 127,
     "ult7d": 41
    },
    {
     "agente": "Agente 5",
     "v": 118,
     "ult7d": 9
    },
    {
     "agente": "Agente 6",
     "v": 64,
     "ult7d": 21
    },
    {
     "agente": "Agente 7",
     "v": 15,
     "ult7d": 0
    },
    {
     "agente": "Agente 8",
     "v": 11,
     "ult7d": 0
    }
   ],
   "total": 1113,
   "top4Pct": 81.3,
   "picoHora": {
    "hora": 16,
    "v": 168
   },
   "respostas": [
    {
     "resposta": "pergunta em branco",
     "v": 423,
     "tipo": "branco"
    },
    {
     "resposta": "Rota 20",
     "v": 271,
     "tipo": "rota"
    },
    {
     "resposta": "Rota 40",
     "v": 218,
     "tipo": "rota"
    },
    {
     "resposta": "por enquanto sem interesse",
     "v": 196,
     "tipo": "nao"
    },
    {
     "resposta": "sem interesse + Rota 20",
     "v": 3,
     "tipo": "misto"
    },
    {
     "resposta": "Rota 40 + sem interesse",
     "v": 1,
     "tipo": "misto"
    },
    {
     "resposta": "Rota 40 + Rota 20",
     "v": 1,
     "tipo": "misto"
    }
   ],
   "emBrancoPct": 38,
   "leitura": "A queda de 75% para 24% pode ser recusa real ou pode ser o campo deixando de ser preenchido; as duas hipóteses cabem nos dados, e só quem estava na rua sabe qual é.",
   "alcance": "As visitas são a única frente que fala com quem não está na base: 1.113 visitas mais 304 do formulário novo, feitas por 8 pessoas em 8 horas úteis por dia, para 9 bairros e ≈140 mil moradores."
  },
  "torre": {
   "contasDiaFaixa": [
    26,
    98
   ],
   "contasDiaDesde": "2026-10-17",
   "mediaContas7d": 61.1,
   "acoes": 18128,
   "picoAcoes": {
    "dia": "2026-11-12",
    "v": 2874
   },
   "topAcoes": [
    {
     "acao": "auth.login_success",
     "v": 2318
    },
    {
     "acao": "sso_central.resgatado",
     "v": 1847
    },
    {
     "acao": "rotas.respostas.sync",
     "v": 1592
    },
    {
     "acao": "auth.login_failed",
     "v": 1350,
     "alerta": true
    },
    {
     "acao": "entrega-materiais.mover",
     "v": 1231
    },
    {
     "acao": "sso_central.emitido.painel",
     "v": 1108
    },
    {
     "acao": "sso_central.emitido",
     "v": 761
    },
    {
     "acao": "materiais.kits-em-lote",
     "v": 574
    },
    {
     "acao": "materiais.pedido.aprovado",
     "v": 519
    },
    {
     "acao": "entregas.marcarpronto.barrado",
     "v": 488
    },
    {
     "acao": "refeicao.elegibilidade",
     "v": 463
    },
    {
     "acao": "materiais.pedido.criado-no-painel",
     "v": 441
    },
    {
     "acao": "materiais.busca-pessoa",
     "v": 407
    },
    {
     "acao": "pedido-material.saida",
     "v": 396
    },
    {
     "acao": "auth.logout",
     "v": 281
    }
   ],
   "loginFalhaPct": 36.8,
   "contas": [
    {
     "papel": "comum",
     "v": 176,
     "ativas": 171
    },
    {
     "papel": "admin",
     "v": 25,
     "ativas": 25
    },
    {
     "papel": "supervisor",
     "v": 13,
     "ativas": 12
    }
   ],
   "chamadosInternos": [
    {
     "estado": "concluído",
     "v": 196,
     "idadeD": 11.6
    },
    {
     "estado": "em andamento",
     "v": 12,
     "idadeD": 7.4
    },
    {
     "estado": "aberto",
     "v": 9,
     "idadeD": 6.9
    },
    {
     "estado": "cancelado",
     "v": 6,
     "idadeD": 14.8
    },
    {
     "estado": "solicitado",
     "v": 5,
     "idadeD": 3.9
    },
    {
     "estado": "ideia",
     "v": 2,
     "idadeD": 9.2
    }
   ],
   "chamadosInternosPorSemana": [
    {
     "semana": "2026-10-12",
     "v": 3
    },
    {
     "semana": "2026-10-19",
     "v": 0
    },
    {
     "semana": "2026-10-26",
     "v": 121
    },
    {
     "semana": "2026-11-02",
     "v": 81
    },
    {
     "semana": "2026-11-09",
     "v": 25
    }
   ],
   "chamadosVivos": 28
  },
  "agenda": {
   "eventos": 21,
   "futuros": 8,
   "semanaDiaD": 0,
   "ligadosAEvento": 0,
   "porSemana": [
    {
     "semana": "2026-10-12",
     "v": 1
    },
    {
     "semana": "2026-10-19",
     "v": 3
    },
    {
     "semana": "2026-10-26",
     "v": 5
    },
    {
     "semana": "2026-11-02",
     "v": 3
    },
    {
     "semana": "2026-11-09",
     "v": 1
    },
    {
     "semana": "2026-11-16",
     "v": 5,
     "futura": true
    },
    {
     "semana": "2026-11-23",
     "v": 3,
     "futura": true
    },
    {
     "semana": "2026-11-30",
     "v": 0,
     "futura": true,
     "diaD": true
    },
    {
     "semana": "2026-12-07",
     "v": 0,
     "futura": true
    }
   ],
   "pedidos": [
    {
     "estado": "aprovado",
     "v": 31
    },
    {
     "estado": "pendente",
     "v": 6
    },
    {
     "estado": "rejeitado",
     "v": 3
    },
    {
     "estado": "cancelado",
     "v": 1
    }
   ],
   "leitura": "Nenhum dos 21 eventos do calendário está ligado a um pedido. Aprovar e marcar são dois sistemas que não se falam."
  },
  "territorio": {
   "leads": 91874,
   "semRegiaoPct": 96.7,
   "comCoordenadaPct": 3.1,
   "erratasSemNadaPct": 95.4,
   "regioes": [
    {
     "regiao": "Sul",
     "leads": 968,
     "entregues": 229,
     "coordenada": 802
    },
    {
     "regiao": "Leste",
     "leads": 734,
     "entregues": 188,
     "coordenada": 589
    },
    {
     "regiao": "Centro",
     "leads": 512,
     "entregues": 118,
     "coordenada": 463
    },
    {
     "regiao": "Norte",
     "leads": 341,
     "entregues": 97,
     "coordenada": 287
    },
    {
     "regiao": "Oeste",
     "leads": 296,
     "entregues": 64,
     "coordenada": 255
    },
    {
     "regiao": "Metropolitana",
     "leads": 183,
     "entregues": 51,
     "coordenada": 149
    },
    {
     "regiao": "Outras",
     "leads": 2,
     "entregues": 0,
     "coordenada": 2
    }
   ],
   "semRegiao": {
    "leads": 88838,
    "entregues": 42
   },
   "comRegiao": {
    "leads": 3036,
    "entregues": 747,
    "pct": 25
   },
   "leitura": "O território existe como lista, não como mapa. Qualquer plano de rota para os 22 dias vai depender de endereço digitado na hora, não da base."
  },
  "muda": [
   {
    "t": "A operação anda mais rápido do que consegue provar.",
    "d": "609 pedidos arquivados sem carimbo de entrega (51,8% de 1.176), 579 saíram sem dizer por onde e 1 kit foi conferido no recebimento em 2.212 etiquetas. O número de entregas está entre 537 e 1.146."
   },
   {
    "t": "Caixa kraft e Manual Piloto acabam antes de 29/11.",
    "d": "Caixa kraft grande: 618 peças e 3,6 dias; Manual Piloto: 1.043 peças e 7,8 dias. 3 itens já estão zerados e 9 dos 34 não chegam a 5 dias."
   },
   {
    "t": "A agenda da semana do Dia D está vazia.",
    "d": "Nenhum evento marcado entre 30/11 e 06/12, nem na semana seguinte. Há 8 eventos futuros, todos até 29/11. E os 31 pedidos de agenda aprovados não viraram evento nenhum."
   },
   {
    "t": "O campo está estável; o que caiu foi a conversão da visita.",
    "d": "De 58 a 104 pessoas por dia escaneiam refeição, mediana 93 — verde. As visitas mantiveram o volume e perderam o engajamento: 74,6% na semana de 26/10, 24,3% na de 02/11, com 423 das 1.113 visitas em branco."
   },
   {
    "t": "Quase metade dos pedidos é lote, não demanda.",
    "d": "49,6% dos pedidos dos últimos 30 dias foram criados pelo admin-token, isto é, por script."
   }
  ],
  "naoMede": [
   "A operação de rua formal: as tabelas de rota, ausência e liberação existem e estão vazias.",
   "Se o material chegou: a etiqueta prova impressão; a entrega prova um clique.",
   "Consumo real contra carga em lote: o cálculo de \"dias restantes\" soma os dois.",
   "Quem abre qual tela: a auditoria registra ação executada, não navegação.",
   "Quem é cada agente de visita: o formulário grava um identificador interno."
  ],
  "regua": {
   "nota": "Régua proposta para acompanhar até 06/12, não uma medição. A coluna \"hoje\" é medida.",
   "linhas": [
    {
     "metrica": "Entrega de material — p90",
     "verde": "≤ 24 h",
     "amarelo": "24 a 48 h",
     "vermelho": "mais de 48 h",
     "hoje": "61 h",
     "status": "vermelho"
    },
    {
     "metrica": "Entrega de material — mediana",
     "verde": "≤ 4 h",
     "amarelo": "4 a 24 h",
     "vermelho": "mais de 24 h",
     "hoje": "1,6 h",
     "status": "verde"
    },
    {
     "metrica": "Pedido arquivado sem carimbo de entrega",
     "verde": "nenhum",
     "amarelo": "até 5%",
     "vermelho": "mais de 5%",
     "hoje": "609 de 1.176 (51,8%)",
     "status": "vermelho"
    },
    {
     "metrica": "Kit conferido no recebimento",
     "verde": "mais de 50%",
     "amarelo": "10% a 50%",
     "vermelho": "menos de 10%",
     "hoje": "1 de 2.212",
     "status": "vermelho"
    },
    {
     "metrica": "Insumo do kit — dias de estoque (kraft / Manual)",
     "verde": "mais de 22 d",
     "amarelo": "15 a 22 d",
     "vermelho": "menos de 15 d",
     "hoje": "3,6 d e 7,8 d",
     "status": "vermelho"
    },
    {
     "metrica": "Pessoas em campo por dia",
     "verde": "90 ou mais",
     "amarelo": "70 a 89",
     "vermelho": "menos de 70",
     "hoje": "97 em 13/11",
     "status": "verde"
    },
    {
     "metrica": "Visita a condomínios e comércios — engajamento",
     "verde": "50% ou mais",
     "amarelo": "25% a 50%",
     "vermelho": "menos de 25%",
     "hoje": "27,5% na sem. 09/11",
     "status": "amarelo"
    },
    {
     "metrica": "Eventos na agenda da semana do Dia D",
     "verde": "5 ou mais",
     "amarelo": "1 a 4",
     "vermelho": "nenhum",
     "hoje": "0",
     "status": "vermelho"
    },
    {
     "metrica": "Lead com região no território",
     "verde": "50% ou mais",
     "amarelo": "20% a 50%",
     "vermelho": "menos de 20%",
     "hoje": "3,3%",
     "status": "vermelho"
    }
   ]
  },
  "p": [
   34,
   43
  ]
 },
 "atendimento": {
  "letra": "F",
  "titulo": "Atendimento: quem responde",
  "pergunta": "Tempo até a baixa, concentração, fila e assuntos.",
  "frase": "Uma pessoa responde por quase tudo: uma única conta deu 86,4% das 3.702 baixas dos últimos 30 dias, e só 5 das 214 contas da Torre já apertaram o botão.",
  "kpis": [
   {
    "v": 859,
    "rotulo": "baixas nos últimos 7 dias completos (07/11 a 13/11)"
   },
   {
    "v": 4.4,
    "rotulo": "mediana de espera até a baixa ontem (13/11)",
    "formato": "horas"
   },
   {
    "v": 61,
    "rotulo": "conversas abertas agora, sem baixa"
   },
   {
    "v": 86.4,
    "rotulo": "das baixas de 30 dias numa única conta",
    "formato": "pct"
   }
  ],
  "relogio": "O relógio começa quando a conversa abre e para quando alguém clica em baixa — não na primeira resposta. Onde a tela diz \"espera\", entenda \"tempo até o caso ser marcado como resolvido no sistema\".",
  "indoBem": "30,9% das baixas fecham em até 2 horas, e a fila de agora é curta: 61 conversas abertas.",
  "baixas30d": 3702,
  "faixas": [
   {
    "faixa": "≤5 min",
    "v": 217
   },
   {
    "faixa": "5–30 min",
    "v": 419
   },
   {
    "faixa": "30 min–2 h",
    "v": 632
   },
   {
    "faixa": "2–24 h",
    "v": 1708
   },
   {
    "faixa": ">24 h",
    "v": 1129,
    "alerta": true
   }
  ],
  "faixasTotal": 4105,
  "ate30minPct": 15.5,
  "mais24hPct": 27.5,
  "medianaDiaSemana": [
   {
    "dia": "seg",
    "h": 24.8
   },
   {
    "dia": "ter",
    "h": 11.7
   },
   {
    "dia": "qua",
    "h": 8.4
   },
   {
    "dia": "qui",
    "h": 3.9
   },
   {
    "dia": "sex",
    "h": 2.6
   },
   {
    "dia": "sáb",
    "h": 0.9
   },
   {
    "dia": "dom",
    "h": 5.3
   }
  ],
  "horaClique": {
   "entre": "9h e 21h",
   "madrugada": 0,
   "foraExpediente": 27,
   "foraExpedienteHora": "23h"
  },
  "pessoas": [
   {
    "nome": "Marta L.",
    "v": 3199,
    "pct": 86.4
   },
   {
    "nome": "Equipe Rua",
    "v": 261,
    "pct": 7.1
   },
   {
    "nome": "Joana F.",
    "v": 97,
    "pct": 2.6
   },
   {
    "nome": "Caio R.",
    "v": 83,
    "pct": 2.2
   },
   {
    "nome": "Luana B.",
    "v": 62,
    "pct": 1.7
   }
  ],
  "contasTorre": 214,
  "contasQueDeramBaixa": 5,
  "picoSemanaPrincipal": {
   "semana": "2026-10-19",
   "v": 1004
  },
  "piorDia": {
   "dia": "2026-10-19",
   "baixas": 517,
   "medianaH": 30.8,
   "leitura": "Foi a limpeza de uma fila acumulada, não atendimento rápido."
  },
  "assuntos": [
   {
    "assunto": "Outros",
    "v": 1412,
    "humano": 117
   },
   {
    "assunto": "Assistência em viagem",
    "v": 623,
    "humano": 518,
    "destaque": true
   },
   {
    "assunto": "Cadastro e dados",
    "v": 71,
    "humano": 46
   },
   {
    "assunto": "Pagamento e reembolso",
    "v": 58,
    "humano": 43
   },
   {
    "assunto": "Direitos do consumidor",
    "v": 42,
    "humano": 37
   },
   {
    "assunto": "Remarcação",
    "v": 36,
    "humano": 27
   },
   {
    "assunto": "Bagagem",
    "v": 26,
    "humano": 23
   },
   {
    "assunto": "Documentação de viagem",
    "v": 19,
    "humano": 15
   },
   {
    "assunto": "Hospedagem",
    "v": 8,
    "humano": 7
   },
   {
    "assunto": "Segurança da conta",
    "v": 6,
    "humano": 6
   },
   {
    "assunto": "Pontos e benefícios",
    "v": 3,
    "humano": 2
   }
  ],
  "classificadas": 2304,
  "saude": {
   "pctDoTotal": 27,
   "precisaHumanoPct": 83.1,
   "urgentes": 247,
   "urgentesTotal": 268,
   "urgentesPct": 92.2
  },
  "regioes": [
   {
    "regiao": "Sem região",
    "v": 1627,
    "vazio": true
   },
   {
    "regiao": "Sul",
    "v": 194
   },
   {
    "regiao": "Norte",
    "v": 150
   },
   {
    "regiao": "Centro",
    "v": 120
   },
   {
    "regiao": "Leste",
    "v": 94
   },
   {
    "regiao": "Oeste",
    "v": 71
   },
   {
    "regiao": "Metropolitana",
    "v": 48
   }
  ],
  "semRegiaoPct": 70.6,
  "urgencia": [
   {
    "urgencia": "Crítica",
    "baixas": 1188,
    "medianaH": 25.9
   },
   {
    "urgencia": "Alta",
    "baixas": 163,
    "medianaH": 16.2
   },
   {
    "urgencia": "Média",
    "baixas": 511,
    "medianaH": 10.9
   },
   {
    "urgencia": "Baixa",
    "baixas": 1392,
    "medianaH": 1.8
   },
   {
    "urgencia": "Sem etiqueta",
    "baixas": 448,
    "medianaH": 3.7
   }
  ],
  "etiquetaInvertida": 14.4,
  "esperandoAgora": [
   {
    "urgencia": "Crítica",
    "esperando": 3,
    "mediaH": 38,
    "maiorH": 71
   },
   {
    "urgencia": "Alta",
    "esperando": 7,
    "mediaH": 4,
    "maiorH": 6
   },
   {
    "urgencia": "Média",
    "esperando": 12,
    "mediaH": 3,
    "maiorH": 9
   },
   {
    "urgencia": "Baixa",
    "esperando": 39,
    "mediaH": 2,
    "maiorH": 13
   }
  ],
  "muda": [
   {
    "t": "Uma pessoa é 86,4% das baixas.",
    "d": "3.199 de 3.702 baixas em 30 dias saíram de uma única conta, e só 5 das 214 contas da Torre já usaram o botão. Não se trata de elogiar ou cobrar alguém: é um ponto único de falha. Bastam alguns dias de ausência para a fila ficar sem dono."
   },
   {
    "t": "Assistência em viagem é o assunto que pede pessoa — e é o que mais espera.",
    "d": "Das 2.304 conversas classificadas, 623 são de assistência em viagem: 83,1% delas marcadas como \"precisa de humano\", e o assunto reúne 92,2% de tudo o que foi marcado urgente. E a crítica é a que mais demora: mediana de 25,9 h contra 1,8 h da baixa."
   },
   {
    "t": "Segunda-feira paga o fim de semana.",
    "d": "A mediana de espera de uma baixa dada na segunda é 24,8 horas; no sábado, 0,9 hora. Entre meia-noite e 8h ninguém dá baixa. O bot atende 24 horas; a equipe, não."
   }
  ],
  "naoMede": [
   "A primeira resposta: o relógio só para no clique de baixa.",
   "O que se responde pelo celular: mensagem enviada do aparelho de alguém da equipe não passa pela Torre.",
   "A região da maior parte das conversas: 70,6% chegam sem região."
  ],
  "regua": {
   "nota": "Proposta de leitura do capítulo, não medição do sistema. Só a coluna \"hoje\" é medida.",
   "linhas": [
    {
     "metrica": "Concentração das baixas",
     "verde": "ninguém acima de 50%",
     "amarelo": "acima de 50%",
     "vermelho": "acima de 80%",
     "hoje": "86,4% numa conta",
     "status": "vermelho"
    },
    {
     "metrica": "Espera mediana até a baixa (ontem)",
     "verde": "até 2 h",
     "amarelo": "até 8 h",
     "vermelho": "acima de 8 h",
     "hoje": "4,4 h",
     "status": "amarelo"
    },
    {
     "metrica": "Conversas críticas esperando agora",
     "verde": "nenhuma",
     "amarelo": "até 2",
     "vermelho": "3 ou mais",
     "hoje": "3 (média de 38 h)",
     "status": "vermelho"
    },
    {
     "metrica": "Baixas entre 22h e 8h",
     "verde": "cobertura noturna",
     "amarelo": "parcial",
     "vermelho": "nenhuma",
     "hoje": "27, todas às 23h",
     "status": "vermelho"
    }
   ]
  },
  "p": [
   44,
   46,
   51
  ]
 },
 "alcance": {
  "letra": "F",
  "titulo": "Alcance: quem vê",
  "pergunta": "Redes, comentários, fotos — e o instrumento que parou.",
  "frase": "O clube chega à pré-temporada sem instrumento de alcance. A coleta que mede as redes rodou pela última vez em 05/11 e não voltou: há 9 dias ninguém sabe quantas pessoas viram uma peça.",
  "kpis": [
   {
    "v": 184320,
    "rotulo": "seguidores no Instagram — o número de 05/11, último coletado"
   },
   {
    "v": 171940,
    "rotulo": "alcance do Instagram na última semana completa (26/10 a 01/11)"
   },
   {
    "v": 9.4,
    "rotulo": "dias com a coleta das redes parada",
    "formato": "dias"
   },
   {
    "v": 8735,
    "rotulo": "fotos novas no acervo em 30 dias"
   }
  ],
  "coleta": [
   {
    "rotina": "Coleta diária da conta — seguidores, alcance, comentários",
    "ultima": "2026-11-05",
    "paradaDias": 9.4,
    "execucoes": 37475,
    "erro": "nenhum",
    "status": "ATRASADO"
   },
   {
    "rotina": "Rotinas de histórico (preenchimento de meses anteriores) — 22 rotinas",
    "ultima": "2026-10-02",
    "paradaDias": 43.4,
    "execucoes": 3945,
    "erro": "nenhum",
    "status": "ATRASADO"
   }
  ],
  "coletaLeitura": "São 23 rotinas de coleta e nenhuma está em dia. A que pesa é a diária: executou 37.475 vezes e parou em 05/11, há 9,4 dias, sem deixar um erro sequer no registro. Religá-la é o conserto mais barato do capítulo — e o que mais amplia o que dá para decidir nos 22 dias até o Dia D.",
  "instagram": {
   "de": {
    "dia": "2026-10-02",
    "v": 172997
   },
   "ate": {
    "dia": "2026-11-05",
    "v": 184320
   },
   "crescimentoPct": 6.5,
   "pico": {
    "dia": "2026-10-27",
    "v": 184499
   },
   "perdaDesdePico": 179
  },
  "facebook": {
   "de": {
    "dia": "2026-09-03",
    "v": 97781
   },
   "ate": {
    "dia": "2026-11-05",
    "v": 138745
   },
   "crescimentoPct": 41.9,
   "salto": {
    "de": "2026-10-01",
    "ate": "2026-10-08",
    "v": 17750
   }
  },
  "postSorteio": {
   "dia": "2026-10-07",
   "semana": "2026-10-05",
   "alcance": 1086791,
   "tema": "sorteio de passagens"
  },
  "alcanceSemanalLeitura": "Na semana do sorteio de passagens, 86 posts somaram 1.877.547 de alcance — e um só, o do próprio sorteio (07/10), respondeu por 1.086.791. Na semana de 26/10, com o maior número de posts (92), a soma ficou em 151.711. O alcance da conta foi de 1.678.714 para 171.940, o menor de todas as semanas completas desde 31/08. Não usar \"alcançamos milhões\" com o número da semana do sorteio.",
  "facebookEngajamento": {
   "pico": {
    "semana": "2026-10-05",
    "v": 392964
   },
   "ultimaCompleta": {
    "semana": "2026-10-26",
    "v": 39661
   },
   "quedaPct": 89.9
  },
  "instagramDiario": {
   "pico": {
    "dia": "2026-10-08",
    "v": 502969
   },
   "vale": {
    "dia": "2026-10-26",
    "v": 12213
   },
   "ultimo": {
    "dia": "2026-11-05",
    "v": 14861
   },
   "interacoesPico": 81799,
   "interacoesUltimo": 848,
   "contasPico": 28649,
   "contasUltimo": 276
  },
  "visitasPerfil": {
   "baixa": {
    "dia": "2026-10-26",
    "v": 336
   },
   "maior": {
    "dia": "2026-11-03",
    "v": 2537
   }
  },
  "postsSemana": [
   {
    "semana": "2026-08-31",
    "alcance": 1042507,
    "visualizacoes": 1600951,
    "curtidas": 134725,
    "comentarios": 8407,
    "compart": 36500,
    "salvos": 5278
   },
   {
    "semana": "2026-09-07",
    "alcance": 434630,
    "visualizacoes": 640346,
    "curtidas": 64202,
    "comentarios": 2735,
    "compart": 8757,
    "salvos": 2092
   },
   {
    "semana": "2026-09-14",
    "alcance": 489523,
    "visualizacoes": 754999,
    "curtidas": 39738,
    "comentarios": 4272,
    "compart": 15631,
    "salvos": 2580
   },
   {
    "semana": "2026-09-21",
    "alcance": 383024,
    "visualizacoes": 582513,
    "curtidas": 66876,
    "comentarios": 1543,
    "compart": 11310,
    "salvos": 1201
   },
   {
    "semana": "2026-09-28",
    "alcance": 314931,
    "visualizacoes": 499348,
    "curtidas": 63066,
    "comentarios": 1406,
    "compart": 11046,
    "salvos": 1580
   },
   {
    "semana": "2026-10-05",
    "alcance": 1877547,
    "visualizacoes": 2941448,
    "curtidas": 164886,
    "comentarios": 13778,
    "compart": 59397,
    "salvos": 8946
   },
   {
    "semana": "2026-10-12",
    "alcance": 563546,
    "visualizacoes": 902889,
    "curtidas": 50445,
    "comentarios": 2967,
    "compart": 14241,
    "salvos": 2806
   },
   {
    "semana": "2026-10-19",
    "alcance": 219319,
    "visualizacoes": 315198,
    "curtidas": 12613,
    "comentarios": 1064,
    "compart": 6915,
    "salvos": 1215
   },
   {
    "semana": "2026-10-26",
    "alcance": 151711,
    "visualizacoes": 223518,
    "curtidas": 11407,
    "comentarios": 832,
    "compart": 5026,
    "salvos": 884
   },
   {
    "semana": "2026-11-02",
    "alcance": 34444,
    "visualizacoes": 54735,
    "curtidas": 2439,
    "comentarios": 300,
    "compart": 1321,
    "salvos": 118,
    "parcial": true
   }
  ],
  "semanaMaisPosts": {
   "semana": "2026-10-26",
   "posts": 92,
   "stories": 87,
   "leitura": "A semana de 26/10 teve 92 posts, o recorde do período, e 87 stories — e foi a de menor alcance entre as semanas completas. Faltou alcance, não publicação."
  },
  "comentarios": {
   "total": 28406,
   "dias": 46,
   "pico": {
    "dia": "2026-10-07",
    "v": 2251
   },
   "facebook": 17919,
   "instagram": 10487,
   "respondidos": 0
  },
  "humor": {
   "positivoPct": 37.9,
   "negativoPct": 10.1,
   "pior": {
    "dia": "2026-10-07",
    "negativoPct": 23.8
   },
   "melhor": {
    "dia": "2026-10-31",
    "positivoPct": 76.5
   }
  },
  "robo": [
   {
    "decisao": "Ignorou",
    "v": 177,
    "pct": 60.8
   },
   {
    "decisao": "Respondeu",
    "v": 78,
    "pct": 26.8
   },
   {
    "decisao": "Mandou p/ humano",
    "v": 36,
    "pct": 12.4
   }
  ],
  "roboDias": 49,
  "roboLeitura": "Em 49 dias o robô de resposta tomou 291 decisões, enquanto os 46 dias de coleta trouxeram 28.406 comentários: ele olhou para 1,0% do que chegou. 36 casos ficaram como \"pendente de humano\" e nada registra que alguém os tenha aberto.",
  "autores": {
   "total": 1144,
   "antesDoCorte": 1132,
   "depois": 12,
   "corte": "2026-10-09"
  },
  "quemComenta": [
   {
    "rede": "Facebook",
    "autores": 51,
    "comentarios": 14454,
    "porAutor": 283.4,
    "noCrm": 0
   },
   {
    "rede": "Instagram",
    "autores": 1093,
    "comentarios": 2565,
    "porAutor": 2.3,
    "noCrm": 0
   }
  ],
  "semCategoria": 127094,
  "acervo": {
   "total": 16115,
   "pastas": [
    {
     "pasta": "HORIZONTE 2026",
     "total": 12632,
     "ult30d": 8712
    },
    {
     "pasta": "OUTROS MATERIAIS",
     "total": 3334,
     "ult30d": 20
    },
    {
     "pasta": "INSTITUCIONAL",
     "total": 149,
     "ult30d": 3
    }
   ],
   "semanaAtual": 2965,
   "semanaAnterior": 2813,
   "mural": {
    "maiorDia": "2026-11-08",
    "enviadas": 206,
    "impressas": 57,
    "totalEnviadas": 1143,
    "totalImpressas": 899,
    "duasSemanas": 558
   },
   "videos": {
    "trechos": 6907,
    "videos": 4966,
    "pico": {
     "semana": "2026-10-26",
     "trechos": 3468,
     "videos": 2549
    }
   }
  },
  "produziuXviu": [
   {
    "oque": "Fotos novas no acervo de imagens do clube",
    "quanto": "8.735",
    "quemViu": "nenhuma — o acervo não é publicado"
   },
   {
    "oque": "Fotos impressas no mural do telão dos eventos",
    "quanto": "899 de 1.143",
    "quemViu": "quem passou pelo evento; ninguém contou"
   },
   {
    "oque": "Trechos de vídeo transcritos (depoimentos de viajantes)",
    "quanto": "6.907",
    "quemViu": "material interno, não publicado"
   },
   {
    "oque": "Posts publicados no Instagram (semanas de 12, 19 e 26/10)",
    "quanto": "254",
    "quemViu": "alcance medido só até 05/11"
   },
   {
    "oque": "Comentários recebidos nas redes do clube",
    "quanto": "28.406 (até 05/11)",
    "quemViu": "0 marcados como respondidos"
   }
  ],
  "muda": [
   {
    "t": "O clube está cego de alcance há 9 dias.",
    "d": "A rotina diária das redes executou pela última vez em 05/11 e não acusou erro — parou em silêncio. A Fase B começa em 30/11, e é nela que o gestor espera 80% das adesões, sem saber se uma peça chega a 172 mil ou a 1,7 milhão de pessoas. Religar a coleta vem antes de qualquer decisão de conteúdo."
   }
  ],
  "naoMede": [
   "Quantas pessoas diferentes viram o clube na semana: a coleta guarda alcance dia a dia, e somar os dias conta a mesma pessoa mais de uma vez.",
   "Alcance de cada post no Facebook: dessa rede só se coleta engajamento.",
   "Se alguém respondeu o comentário: nenhum dos 28.406 tem marca de resposta, e nenhum autor está ligado a um lead do CRM."
  ],
  "regua": {
   "linhas": [
    {
     "metrica": "Coleta diária de redes",
     "verde": "rodou hoje",
     "amarelo": "até 2 dias",
     "vermelho": "mais de 2 dias",
     "hoje": "9 dias parada",
     "status": "vermelho"
    },
    {
     "metrica": "Alcance semanal no Instagram",
     "verde": "450 mil ou mais",
     "amarelo": "220 mil ou mais",
     "vermelho": "abaixo de 220 mil",
     "hoje": "171.940 (26/10, último completo)",
     "status": "vermelho"
    },
    {
     "metrica": "Comentários marcados como respondidos",
     "verde": "metade ou mais",
     "amarelo": "alguma resposta",
     "vermelho": "nenhuma",
     "hoje": "0 de 28.406",
     "status": "vermelho"
    }
   ]
  },
  "p": [
   44,
   51
  ]
 },
 "fechamento": {
  "sintese": [
   {
    "t": "A base pronta é de centenas, não de milhares.",
    "d": "Dos 1.984 pilotos ativos, 1.402 têm dono de verdade, 661 já falaram com o bot, 247 já cadastraram alguém e 131 cadastraram alguém na última semana. A meta da fase A é levar esse número para 700–1.300 até 29/11 — e o único caminho medido é ativar quem já está lá (os 124 que produziram e pararam, os 271 do R20_CAPITAL que nunca receberam disparo), não criar mais fichas."
   },
   {
    "t": "Criar piloto em massa nunca rendeu adesão.",
    "d": "Quatro dias de carga criaram 1.571 das 2.036 fichas (77,2%). A safra de 09/11 ativou 2,1% e rende 0,7 passageiro por ficha, contra 41,7 da safra de 12/10. A Projetada de 84,7 mil é soma de fichas: só 13,0 mil de meta pertencem a quem já produz, e 582 pilotos sem dono real carregam 20,6 mil dela sem ninguém cobrar."
   },
   {
    "t": "O ritmo é estável e o sistema nunca viu um surto.",
    "d": "~291 passageiros por dia há um mês; melhor dia 655 (22/10); recorde de pilotos no mesmo dia: 49 (13/11). A última semana pede 2.857/dia só para 25 mil; quatro dos cinco elos da Central ficam abaixo dessa exigência e só o papel aguenta. Mesmo com captura de 100%, a conta dá 85.980 — a meta de 112.000 não cabe na conta da própria equipe."
   },
   {
    "t": "A operação corre mais rápido do que consegue provar.",
    "d": "Entrega em 1,6 h de mediana (p90 61 h), mas 609 dos 1.176 pedidos foram arquivados sem carimbo, há 1 conferência de recebimento em 2.212 etiquetas e \"pilotos com kit\" dá 48, 286 ou 497 conforme a fonte. Caixa kraft (3,6 dias) e Manual do Piloto (7,8 dias) acabam antes de 29/11. A agenda da semana do Dia D (30/11–06/12) está vazia."
   },
   {
    "t": "Uma pessoa responde por 86,4% das baixas — e o clube entrou na pré-temporada sem instrumento de alcance.",
    "d": "A conversa marcada como crítica espera 25,9 h contra 1,8 h da marcada como baixa; segunda-feira paga o fim de semana (24,8 h). A coleta de seguidores e alcance parou em 05/11 sem erro."
   }
  ],
  "funcionando": [
   {
    "t": "O balcão de material",
    "d": "mediana de 1,6 h entre pedido e entrega"
   },
   {
    "t": "Os times de embaixada",
    "d": "102 pilotos, 5,1% da rede, 33,7% dos registros"
   },
   {
    "t": "Os 10 maiores controladores",
    "d": "56,0% do acumulado e 73,8% da última semana"
   },
   {
    "t": "O campo",
    "d": "58 a 104 pessoas por dia, verde pela régua"
   },
   {
    "t": "A rede orgânica está viva",
    "d": "13/11 teve o recorde de pilotos cadastrando no mesmo dia (49)"
   },
   {
    "t": "O acervo",
    "d": "8.735 fotos novas em 30 dias; Facebook +41,9% em 63 dias"
   }
  ],
  "acrescimos": "Na única rodada de expectativa (10/11), 1.197 das 1.940 linhas têm carimbo e 790 vieram com zero — a Real de 12.874 sai de 407 linhas; 13 controladores que nunca lançaram produziram 1.303 passageiros. A linha6 concentra 118 das 186 conversas vivas e consta como bloqueada por pagamento (verificação de 11/11). 298 das 761 conversas do bot pararam na lista de convidados. O DDD 41 domina a base: só 225 passageiros têm telefone de outro estado — e a temporada só vale para saídas do aeroporto-base. O Ponto 11 fez 39,8% das etiquetas e cinco pontos estão parados. Na Torre, 36,8% das tentativas de login falharam.",
  "metricasFaseA": [
   {
    "metrica": "Pilotos prontos (funil aninhado: dono, canal, produziu, vivo 7 d)",
    "hoje": "131",
    "hojeV": 131,
    "meta": "700–1.300",
    "regua": "● ≥700 · ▲ 350–699 · ■ <350",
    "status": "vermelho",
    "nucleo": "pilotos"
   },
   {
    "metrica": "Kits entregues com carimbo de recebimento",
    "hoje": "48",
    "hojeV": 48,
    "meta": "≥700",
    "regua": "● ≥700 · ▲ 260–699 · ■ <260",
    "status": "vermelho",
    "nucleo": "operacao"
   },
   {
    "metrica": "Pilotos que já falaram com a Central",
    "hoje": "661",
    "hojeV": 661,
    "meta": "≥1.300",
    "regua": "● ≥1.300 · ▲ 700–1.299 · ■ <700",
    "status": "vermelho",
    "nucleo": "central"
   },
   {
    "metrica": "Pilotos sem dono (órfãos + fila de triagem)",
    "hoje": "582",
    "hojeV": 582,
    "meta": "0",
    "regua": "● 0 · ▲ 1–40 · ■ >40",
    "status": "vermelho",
    "nucleo": "controladores"
   },
   {
    "metrica": "Criados nos últimos 7 dias que já têm ≥1 passageiro",
    "hoje": "2,1%",
    "hojeV": 2.1,
    "meta": "≥25%",
    "regua": "● ≥25% · ▲ 8–24% · ■ <8%",
    "status": "vermelho",
    "nucleo": "pilotos"
   },
   {
    "metrica": "Pilotos que já produziram e pararam há 7+ dias",
    "hoje": "124",
    "hojeV": 124,
    "meta": "≤45",
    "regua": "● ≤45 · ▲ 46–110 · ■ >110",
    "status": "vermelho",
    "nucleo": "passageiros"
   },
   {
    "metrica": "Dias de estoque do item mais curto (caixa, Manual)",
    "hoje": "3,6",
    "hojeV": 3.6,
    "meta": ">14",
    "regua": "● >10 · ▲ 5–10 · ■ <5",
    "status": "vermelho",
    "nucleo": "operacao"
   },
   {
    "metrica": "Capacidade provada no simulado (registros/hora)",
    "hoje": "—",
    "hojeV": null,
    "meta": "≥286/h",
    "regua": "● ≥286 · ▲ 140–285 · ■ <140",
    "status": "nao-medido",
    "nucleo": "central"
   },
   {
    "metrica": "Passageiros novos por dia (média 7 d)",
    "hoje": "~291",
    "hojeV": 291,
    "meta": "—",
    "regua": "● ≥400 · ▲ 260–399 · ■ <260",
    "status": "amarelo",
    "nucleo": "passageiros"
   }
  ],
  "metricasFaseB": [
   {
    "metrica": "Passageiros registrados por hora",
    "regua": "● >240 · ▲ 110–240 · ■ <110"
   },
   {
    "metrica": "Pilotos vivos no dia (≥1 cadastro nas últimas 24 h)",
    "regua": "● >440 · ▲ 180–440 · ■ <180"
   },
   {
    "metrica": "Mensagens sem resposta do bot e idade da mais velha",
    "regua": "régua em minutos; ■ acima de 12 min"
   },
   {
    "metrica": "Falhas do bot (erro, timeout, não entregue)",
    "regua": "■ qualquer coisa acima de 1%"
   },
   {
    "metrica": "% dos registrados que receberam o convite",
    "regua": "● ≥96% · ▲ 88–95% · ■ <88%"
   },
   {
    "metrica": "Chamados humanos abertos há mais de 2 h",
    "regua": "● 0 · ▲ 1–4 · ■ >4"
   }
  ],
  "metricasFaseC": [
   {
    "metrica": "% dos passageiros com lembrete e código entregues até 10h",
    "regua": "● ≥97% · ▲ 90–96% · ■ <90%"
   },
   {
    "metrica": "Falhas de entrega do lembrete, por hora",
    "regua": "■ qualquer uma"
   },
   {
    "metrica": "Tempo entre cadastro novo e envio do convite",
    "regua": "● <4 min · ■ >12 min"
   }
  ],
  "plano": [
   {
    "ate": "2026-11-21",
    "rotulo": "21/11",
    "diaSemana": "sábado",
    "oque": [
     "Órfãos e fila de triagem redistribuídos",
     "indicações em dobro marcadas",
     "disparo-teste nos 271 do R20_CAPITAL",
     "coleta das redes religada",
     "compra de caixa kraft e Manual do Piloto assinada",
     "3 pessoas treinadas no botão de baixa",
     "conta da linha6 regularizada"
    ],
    "prova": [
     "Consulta de sem-dono devolve 0",
     "≥20% do R20_CAPITAL respondem em 48 h (ou 5.420 de meta saem da conta por escrito)",
     "tabela de seguidores com linha de ontem",
     "ordem de compra com entrega ≤28/11",
     "≥3 nomes distintos na baixa no mesmo dia"
    ],
    "nucleos": [
     "controladores",
     "alcance",
     "operacao",
     "atendimento",
     "central"
    ]
   },
   {
    "ate": "2026-11-26",
    "rotulo": "26/11",
    "diaSemana": "quinta",
    "oque": [
     "Kit na mão de ≥700 pilotos, conferido",
     "rodada de expectativa refeita com a pergunta \"quanto entre 30/11 e 06/12\"",
     "plano de visitas para 30/11–02/12 no papel",
     "escala de plantão 22h–8h e fim de semana 05–06/12",
     "segundo ponto de impressão testado"
    ],
    "prova": [
     "Tabela de conferência com ≥700 linhas (hoje: 1)",
     "≥54 dos 72 controladores lançaram",
     "bairros nomeados por dia com responsável",
     "escala publicada"
    ],
    "nucleos": [
     "operacao",
     "controladores",
     "atendimento"
    ]
   },
   {
    "ate": "2026-11-27",
    "rotulo": "≤27/11",
    "diaSemana": "terça ou quarta (24 ou 25/11)",
    "simulado": true,
    "oque": [
     "Simulado de surto: 560 pilotos em dois grupos (370 que já falaram com o bot, 190 que nunca), às 18h30, pelas linhas linha1, linha2 e linha5, gravado no sistema"
    ],
    "prova": [
     "Os 5 números do dia seguinte, contra o teto provado: mensagens/dia (1.548) · passageiros registrados (655) · pilotos distintos (49) · chamados humanos abertos (23) · fatia 22h–8h (13,6%)"
    ],
    "nucleos": [
     "central",
     "passageiros",
     "atendimento"
    ]
   },
   {
    "ate": "2026-11-29",
    "rotulo": "29/11",
    "diaSemana": "domingo · D-7",
    "oque": [
     "Material pré-posicionado com os 10 maiores pilotos e os 72 controladores",
     "painel da fase B pronto (uma tela, atualização por hora)",
     "congelamento: nada entra em produção de 30/11 a 06/12, exceto correção de falha do surto"
    ],
    "prova": [
     "Recibo de cada um",
     "a tela abre e mostra número de hoje",
     "regra escrita e combinada"
    ],
    "nucleos": [
     "operacao",
     "controladores",
     "central"
    ]
   }
  ],
  "avisoSimulado": "O simulado gasta material de verdade, ocupa a atendente que faz 86% das baixas e consome crédito com pilotos que serão necessários de novo em 30/11. Por isso: uma vez só, com os 560 avisados de que é um ensaio, e nunca depois de 27/11. E ele mede capacidade (registros por hora), não captura.",
  "perguntas": [
   {
    "q": "Nas temporadas anteriores, o 80/20 era por pessoa ou por canal?",
    "porque": "Por pessoa = a mesma base decide tarde; a fase A é preparar quem já está lá e o kit é o gargalo. Por canal = a última semana traz gente nova; o gargalo vira o bot. Os dois planos são incompatíveis e o dinheiro da compra de material vai para lugares diferentes."
   },
   {
    "q": "Qual foi a conversão cadastro → adesão, e era diferente para quem se cadastrou cedo e tarde?",
    "porque": "É o termo da conta que não existe em nenhum banco. Se quem se cadastra tarde adere mais, perseguir cadastro agora é desperdício."
   },
   {
    "q": "Quantas adesões o clube teve na última temporada, e com quantos multiplicadores?",
    "porque": "Os 40 da meta nunca foram checados contra o histórico. Hoje quem produz faz 36 em média e a mediana da base inteira é zero."
   }
  ],
  "dadosAGuardar": [
   {
    "dado": "Data na tag \"kit recebido\"",
    "porque": "O kit anda junto com a produção, mas sem data não dá para saber se veio antes ou depois — correlação, não causa.",
    "como": "Carimbar a data ao marcar; sortear: kit para metade de 80 parados e comparar com a outra metade, 14 dias depois."
   },
   {
    "dado": "Carimbo de entrega obrigatório antes de arquivar",
    "porque": "609 pedidos (51,8% de 1.176) foram arquivados sem data de entrega. A taxa de entrega é ilegível.",
    "como": "Regra na tela: arquivar só depois de \"entregue\"."
   },
   {
    "dado": "Uma fonte só para \"kit entregue\"",
    "porque": "Dá 48, 286 ou 497 conforme a fonte. A pergunta mais básica da fase A não tem resposta.",
    "como": "Decidir a fonte (carimbo de conferência) e usar só ela."
   },
   {
    "dado": "Confirmação do passageiro",
    "porque": "Indicação nunca confirmada com a pessoa. É o único número que vira adesão.",
    "como": "Mensagem de confirmação ao passageiro, com cuidado de privacidade."
   },
   {
    "dado": "Origem do piloto para 100%",
    "porque": "Só 15% têm origem gravada (os criados pelo bot).",
    "como": "Gravar origem em toda criação (tela, importação, evento)."
   },
   {
    "dado": "Cidade/UF do passageiro",
    "porque": "A temporada só vale para saídas do aeroporto-base. Hoje a checagem é pelo DDD — e é fraca.",
    "como": "Perguntar a cidade no cadastro."
   },
   {
    "dado": "O que o bot envia e a primeira resposta humana",
    "porque": "O sistema não guarda o que o bot mandou nem a hora da primeira resposta humana. O SLA medido é \"até fechar\".",
    "como": "Gravar o envio do bot e carimbar a primeira resposta."
   },
   {
    "dado": "Coleta de seguidores e alcance",
    "porque": "Parada desde 05/11 sem erro.",
    "como": "Religar o coletor e alarmar quando parar."
   },
   {
    "dado": "Um denominador para a captura",
    "porque": "Sem ele, o simulado mede só capacidade e os cenários ficam sem chão.",
    "como": "Convites entregues × cadastros; pergunta aos controladores sobre indicações fora do sistema."
   }
  ],
  "errata": "Uma auditoria externa apontou erros verificáveis e rótulos imprecisos; tudo foi remedido em 14/11 e incorporado: a \"base pronta\" virou funil aninhado (131 vivos, 47 com kit; antes 139 e 48) · os 673 \"duplicados\" viraram 602 indicações em dobro, 161 produzem · a Projetada ganhou decomposição exclusiva (13,0 mil a 32,5 mil) · \"95% pelo bot\" virou 93% dos eventos, com 307 exclusões · a ativação em 24 h é 69% entre quem ativa e 9,6% sobre todos · a entrega em \"1,2 h\" tem p90 de 61 h · o 279.836 dos nove bairros era o dobro (≈140 mil moradores) · o simulado mede capacidade, não captura.",
  "p": [
   52,
   55
  ]
 },
 "conferencias": [
  {
   "id": "melhor-dia",
   "onde": "Cap. B p. 13–14 × Cap. D p. 32",
   "achado": "Melhor dia de passageiros aparece como 652 (série diária) e 655 (auditoria, janela de corte algumas horas diferente).",
   "efeito": "Diferença de três registros; a Torre usa 652 na série e 655 onde o livro usa o teto provado."
  },
  {
   "id": "total-passageiros",
   "onde": "Cap. A–C",
   "achado": "Total de passageiros aparece como 9.846 (eventos menos exclusões), 9.865 (fichas), 9.845 (tabela de times) e 9.862 sem status.",
   "efeito": "Janelas de medição diferentes; a Torre usa 9.846 como número de capa."
  },
  {
   "id": "kit-producao",
   "onde": "Cap. B p. 20 × Fechamento p. 55",
   "achado": "Média de quem tem kit: 38,0 contra 14,1 nas fichas de 14 dias ou mais; 3,6 contra 1,4 nas fichas novas.",
   "efeito": "Recortes diferentes; nenhum dos dois prova causa."
  },
  {
   "id": "pilotos-vivos",
   "onde": "Cap. A × Cap. B",
   "achado": "\"Pilotos vivos na semana\" aparece como 131 (funil aninhado, 7 dias até 14/11), 118 (última semana completa, 02/11) e 136 (semana de 09/11 com seis dias).",
   "efeito": "Três recortes legítimos; a Torre rotula cada um."
  },
  {
   "id": "pilotos-com-kit",
   "onde": "Fechamento p. 52",
   "achado": "\"Pilotos com kit\" dá 47 (funil), 48 (métrica da Fase A), 286 ou 497 conforme a fonte.",
   "efeito": "Não há fonte única — o próprio livro pede decidir uma."
  }
 ]
};
