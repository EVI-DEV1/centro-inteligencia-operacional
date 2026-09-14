// Capítulo E · Operação: material, campo, visitas e o uso da Torre no Clube Horizonte.
export function gerar({ rng, A, U }) {
  const { fmt, pct, soma, somarDias, intervalo, diasEntre } = U;
  const D = A.DATAS;
  const O = A.OPERACAO;
  const dias = U.intervalo(D.inicio, D.fim);
  const ontem = somarDias(D.medidoEm, -1);
  const ultimos7 = intervalo(somarDias(D.medidoEm, -7), ontem);
  const valorEm = (serie, d) => (serie.find((p) => p.d === d) || { v: 0 }).v;
  const somaEntre = (serie, lista) => soma(lista, (d) => valorEm(serie, d));
  const diasAteD7 = diasEntre(D.medidoEm, D.d7);
  const diasAteDiaD = diasEntre(D.medidoEm, D.diaD);
  const zeros = (lista) => Object.fromEntries(lista.map((d) => [d, 0]));

  // ---------------------------------------------------------------- pedidos
  const fluxoNovoDesde = '2026-10-28';
  const feriado = '2026-11-02';
  const lotes = [
    { dia: '2026-11-04', v: 341 },
    { dia: '2026-11-12', v: 358 },
  ];
  const pesoPedido = { '2026-10-28': 0.03, '2026-10-29': 0.3, '2026-10-30': 0.12, '2026-11-03': 0.06, '2026-11-05': 3.2, '2026-11-06': 0.8, '2026-11-07': 0.4, '2026-11-08': 0.15, '2026-11-09': 0.25, '2026-11-10': 1.6, '2026-11-11': 1.15, '2026-11-13': 0.6 };
  const pedidos_dia = U.serieDiaria({
    dias,
    total: O.pedidos.total,
    rng,
    ruido: 0.15,
    forma: (d) => pesoPedido[d] || 0.01,
    fixos: {
      ...zeros(dias.filter((d) => d < fluxoNovoDesde)),
      ...zeros(['2026-10-31', '2026-11-01', feriado]),
      ...Object.fromEntries(lotes.map((l) => [l.dia, l.v])),
      [D.medidoEm]: 9,
    },
    marcas: Object.fromEntries(lotes.map((l) => [l.dia, { lote: true }])),
    parcial: D.medidoEm,
  });

  const P = O.pedidos;
  const estados = [
    { combinacao: 'pedido · arquivado · sem carimbo', v: P.arquivadosSemCarimbo - 11, alerta: true },
    { combinacao: 'entregue · aberto · com carimbo', v: P.entreguesComCarimbo - 7 },
    { combinacao: 'pronto p/ entrega · aberto · sem carimbo', v: P.abertos - 2 },
    { combinacao: 'pronto p/ entrega · arquivado · sem carimbo', v: 11, alerta: true },
    { combinacao: 'entregue · arquivado · com carimbo', v: 7 },
    { combinacao: 'pedido · aberto · sem carimbo', v: 2 },
  ];
  const saidaVazia = 579;
  const saida = [
    { saida: 'saída em branco', v: saidaVazia, comCarimbo: 3 },
    { saida: 'retirada', v: 425, comCarimbo: 391 },
    { saida: 'motoboy', v: P.total - saidaVazia - 425, comCarimbo: P.entreguesComCarimbo - 3 - 391 },
  ];
  const entregasEntre = [P.entreguesComCarimbo, P.entreguesComCarimbo + P.arquivadosSemCarimbo];

  // entregas registradas: quase nada até o carimbo existir, depois um dia em que alguém fecha tudo de uma vez
  const diaFechamento = lotes[1].dia;
  const inicioCarimbo = '2026-11-06';
  const pesoEntrega = { '2026-11-06': 0.05, '2026-11-07': 0.03, '2026-11-08': 0.04, '2026-11-09': 0.8, '2026-11-10': 1.2, '2026-11-11': 1.0, '2026-11-13': 0.9 };
  const entregas_dia = U.serieDiaria({
    dias,
    total: P.entreguesComCarimbo,
    rng,
    ruido: 0.12,
    forma: (d) => pesoEntrega[d] || 0.01,
    fixos: { ...zeros(dias.filter((d) => d < inicioCarimbo)), [diaFechamento]: 391, [D.medidoEm]: 11 },
    parcial: D.medidoEm,
  });
  const entregas7d = somaEntre(entregas_dia, ultimos7);

  const faixas = [
    { faixa: '≤1 h', v: 229 },
    { faixa: '1–4 h', v: 151 },
    { faixa: '4–24 h', v: 88 },
    { faixa: '1–3 d', v: 31 },
    { faixa: '>3 d', v: P.entreguesComCarimbo - 229 - 151 - 88 - 31, alerta: true },
  ];
  const maisDe3d = faixas[4].v;
  const umEmCada = Math.round(P.entreguesComCarimbo / maisDe3d);
  const casosAntigos = 4;

  // itens dos últimos 30 dias
  const itens = [
    { item: 'Kit Parceiro Agência Aurora', un: 15840, pedidos: 29 },
    { item: 'Kit Feira de Turismo', un: 11760, pedidos: 11 },
    { item: 'Carta de boas-vindas aos parceiros', un: 2947, pedidos: 1 },
    { item: 'Kit Piloto', un: 2896, pedidos: 702 },
    { item: 'Kit Evento Corporativo', un: 2436, pedidos: 8 },
    { item: 'Kit Embaixada', un: 562, pedidos: 7 },
    { item: 'Kit Viagem em Família', un: 418, pedidos: 21 },
    { item: 'Kit Rota Interior', un: 247, pedidos: 214 },
    { item: 'Kit Amigo Viajante', un: 138, pedidos: 26 },
    { item: 'Kit Abertura da Temporada', un: 96, pedidos: 9 },
    { item: 'Kit Aspirante', un: 81, pedidos: 79 },
    { item: 'Kit Treinamento Piloto', un: 46, pedidos: 13 },
    { item: 'Kit Adesivo Horizonte para carro', un: 36, pedidos: 5 },
    { item: 'Kit Mochila Horizonte', un: 29, pedidos: 3 },
    { item: 'Kit Guia de Bolso', un: 9, pedidos: 8 },
  ].map((it) => ({ ...it, ...(it.pedidos >= 200 ? { diario: true } : {}) }));
  const tres = itens.slice(0, 3);
  const kitPiloto = itens.find((it) => it.item === 'Kit Piloto');

  const autores = [
    { autor: 'admin-token (script)', v: 583, script: true },
    { autor: 'uma conta de pessoa', v: 518 },
    { autor: 'demais (6 contas, fluxo automático e sem autor gravado)', v: P.total - 583 - 518 },
  ];
  const scriptPct = pct(autores[0].v, soma(autores, (a) => a.v));

  const regiaoPedido = { semRegiao: 1131, semRegiaoPct: pct(1131, P.total), preenchidas: 19 };

  // ---------------------------------------------------------------- estoque
  const S = O.estoque;
  const estoqueItens = [
    { item: 'Guia do Controlador', dias: 0, saldo: 0 },
    { item: 'Convite de pré-estreia', dias: 0, saldo: 0 },
    { item: 'Termo de adesão', dias: 0, saldo: 0 },
    { item: 'Revista Destinos & Roteiros', dias: 0.2, saldo: 918 },
    { item: 'Folheto Pacotes de Verão', dias: 0.7, saldo: 463 },
    { item: 'Convite impresso — lote A', dias: 1.3, saldo: 21740, lote: true },
    { item: 'Carta de boas-vindas aos parceiros', dias: 2.4, saldo: 5912 },
    { item: 'Caixa kraft grande', dias: S.caixaKraft.dias, saldo: S.caixaKraft.saldo, critico: true },
    { item: 'Adesivo Horizonte para carro', dias: 4.6, saldo: 1627 },
    { item: 'Convite impresso — lote B', dias: 6.1, saldo: 116930, lote: true },
    { item: 'Manual Piloto', dias: S.manualPiloto.dias, saldo: S.manualPiloto.saldo, critico: true },
    { item: 'Guia de Bolso Horizonte', dias: 9.3, saldo: 1348 },
    { item: 'Folheto sanfona Roteiros do Sul', dias: 10.2, saldo: 4386 },
    { item: 'Convite impresso — Temporada', dias: 13.7, saldo: 318460, lote: true },
    { item: 'Adesivo Horizonte', dias: 17.1, saldo: 94 },
    { item: 'Envelope plástico A4', dias: 19.4, saldo: 20870 },
    { item: 'Chaveiro Horizonte', dias: 24.8, saldo: 312 },
    { item: 'Cordão de crachá', dias: 27.9, saldo: 408 },
  ];
  const maiorLote = estoqueItens.filter((it) => it.lote).reduce((m, it) => (it.saldo > m.saldo ? it : m));
  const consumoLote = Math.round(maiorLote.saldo / maiorLote.dias);
  const maisCurto = estoqueItens[0];
  const fmtDias = (v) => fmt.dec(v, 1);
  const estoque = {
    itensMedidos: S.itensMedidos,
    abaixoDe5d: S.abaixoDe5d,
    abaixoDoD7: estoqueItens.filter((it) => it.dias < diasAteD7).length,
    zerados: S.zerados,
    itens: estoqueItens,
    leitura: `Dois pesam na operação diária: Caixa kraft grande — ${fmt.n(S.caixaKraft.saldo)} peças, ${fmtDias(S.caixaKraft.dias)} dias — e Manual Piloto — ${fmt.n(S.manualPiloto.saldo)} peças, ${fmtDias(S.manualPiloto.dias)} dias. Os convites impressos aparecem curtos por outro motivo: o saldo é enorme e o "consumo de ${fmt.n(consumoLote)} por dia" vem de cargas em lote, não do balcão. Comprar caixa kraft e reimprimir o Manual Piloto esta semana; para os convites, medir consumo sem os lotes antes de comprar.`,
    movimento: { entradas: 4873216, saidas: 1764905, desde: '2026-10-23', maiorEntrada: { dia: '2026-11-10', v: 1792604 } },
  };

  // ---------------------------------------------------------------- etiquetas
  const Et = O.etiquetas;
  const diaMaiorEtiqueta = '2026-11-11';
  const pesoEtiqueta = { '2026-10-28': 0.01, '2026-10-29': 0.03, '2026-11-02': 0.05, '2026-11-05': 0.75, '2026-11-06': 0.25, '2026-11-07': 0.13, '2026-11-08': 0.02, '2026-11-09': 0.28, '2026-11-10': 0.85, '2026-11-13': 0.18 };
  const etiquetas_dia = U.serieDiaria({
    dias,
    total: Et.total,
    rng,
    ruido: 0.12,
    forma: (d) => pesoEtiqueta[d] || 0.005,
    fixos: {
      ...zeros(dias.filter((d) => d < fluxoNovoDesde)),
      ...zeros(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-03']),
      [lotes[0].dia]: lotes[0].v,
      [diaMaiorEtiqueta]: 894,
      [diaFechamento]: 411,
      [D.medidoEm]: 8,
    },
    parcial: D.medidoEm,
  });
  const ult7dTotal = somaEntre(etiquetas_dia, ultimos7);
  const nomesPontos = ['Ponto 11', 'Ponto 4', 'Ponto 2', 'Ponto 9', 'Ponto 15', 'Ponto 6', 'Ponto 12', 'Ponto 3', 'Ponto 10', 'Ponto 8'];
  const ult7d = U.distribuir(ult7dTotal, [0.525, 0.268, 0.051, 0.108, 0, 0.048, 0, 0, 0, 0]);
  const antigas = U.distribuir(Et.total - ult7dTotal, [0.075, 0.042, 0.39, 0.02, 0.24, 0.063, 0.1, 0.04, 0.025, 0.005]);
  const pontos = nomesPontos.map((ponto, i) => ({ ponto, total: ult7d[i] + antigas[i], ult7d: ult7d[i] })).sort((a, b) => b.total - a.total);
  const lider7d = [...pontos].sort((a, b) => b.ult7d - a.ult7d);
  const etiquetas = {
    total: Et.total,
    desde: fluxoNovoDesde,
    conferenciaDesde: '2026-11-12',
    canceladas: 3,
    conferidas: Et.conferidas,
    picos: [lotes[0].dia, diaMaiorEtiqueta, diaFechamento].map((dia) => ({ dia, v: valorEm(etiquetas_dia, dia) })),
    filaImpressao: {
      eventos: 4870,
      erros: 7 + 29 + 32,
      diasComErro: [
        { dia: '2026-11-05', v: 7 },
        { dia: '2026-11-06', v: 29 },
        { dia: '2026-11-09', v: 32 },
      ],
    },
    pontos,
    pontoLiderPct: pct(pontos[0].total, Et.total),
    duplaLider7dPct: Math.round((100 * (lider7d[0].ult7d + lider7d[1].ult7d)) / ult7dTotal),
    ult7dTotal,
    pontosParados: pontos.filter((p) => p.ult7d === 0).length,
    fluxoAntigo: { etiquetaGerada: 7312, prontoParado: 1409, camposIncompletos: 41 },
  };

  // ---------------------------------------------------------------- campo (refeição escaneada na base operacional)
  const inicioRefeicao = '2026-10-18';
  const diasRefeicao = intervalo(inicioRefeicao, D.fim);
  const janela14 = intervalo(somarDias(ontem, -13), ontem);
  const fixosCampo = {
    [inicioRefeicao]: 27,
    '2026-10-31': 84, '2026-11-01': 58, [feriado]: 0, '2026-11-03': 96, '2026-11-04': 91, '2026-11-05': 102, '2026-11-06': 104,
    '2026-11-07': 88, '2026-11-08': 63, '2026-11-09': 93, '2026-11-10': 99, '2026-11-11': 101, '2026-11-12': 90, [ontem]: O.campo.ontem,
    [D.medidoEm]: 76,
  };
  const refeicao_pessoas_dia = diasRefeicao.map((d) => {
    if (d in fixosCampo) return { d, v: fixosCampo[d], ...(d === D.medidoEm ? { parcial: true } : {}) };
    const ajuste = { 'sáb': -8, dom: -12 }[U.diaSemana(d)] || 0;
    return { d, v: Math.min(99, Math.max(62, Math.round(87 + ajuste + rng.normal() * 6))) };
  });
  const refeicao_almoco_dia = [];
  const refeicao_janta_dia = [];
  for (const p of refeicao_pessoas_dia) {
    if (p.d === inicioRefeicao) {
      refeicao_almoco_dia.push({ d: p.d, v: 3 });
      refeicao_janta_dia.push({ d: p.d, v: p.v - 2 });
    } else if (p.v === 0) {
      refeicao_almoco_dia.push({ d: p.d, v: 0 });
      refeicao_janta_dia.push({ d: p.d, v: 0 });
    } else if (p.parcial) {
      refeicao_almoco_dia.push({ d: p.d, v: p.v, parcial: true });
    } else {
      const a = Math.round(p.v * rng.entre(0.76, 0.93));
      const j = Math.max(p.v - a, Math.round(p.v * rng.entre(0.58, 0.8)));
      refeicao_almoco_dia.push({ d: p.d, v: a });
      refeicao_janta_dia.push({ d: p.d, v: j });
    }
  }
  const valores14 = janela14.map((d) => valorEm(refeicao_pessoas_dia, d)).filter((v) => v > 0).sort((a, b) => a - b);
  const mediana14 = valores14.length % 2 ? valores14[(valores14.length - 1) / 2] : Math.round((valores14[valores14.length / 2 - 1] + valores14[valores14.length / 2]) / 2);
  const servidas = soma(refeicao_almoco_dia, (p) => p.v) + soma(refeicao_janta_dia, (p) => p.v);
  const reservadas = Math.round(servidas / 0.947);
  const janelaAreas = intervalo(somarDias(D.medidoEm, -13), D.medidoEm);
  const refeicoesAreas = somaEntre(refeicao_almoco_dia, janelaAreas) + somaEntre(refeicao_janta_dia, janelaAreas);
  const areasBase = [
    { area: 'sem área preenchida', pessoas: 79, peso: 11.2, vazio: true },
    { area: 'Motorista', pessoas: 6, peso: 16.5 },
    { area: 'Equipe de rua', pessoas: 6, peso: 13.1 },
    { area: 'Controlador', pessoas: 8, peso: 5.4 },
    { area: 'Rota 40', pessoas: 9, peso: 3.6 },
    { area: 'Central', pessoas: 3, peso: 12.8 },
    { area: 'Auxiliar de limpeza', pessoas: 2, peso: 14.5 },
    { area: 'Captação', pessoas: 2, peso: 9.1 },
    { area: 'Assistente financeiro', pessoas: 1, peso: 18.2 },
    { area: 'Administrativo', pessoas: 1, peso: 8.4 },
    { area: 'Apoio logístico', pessoas: 1, peso: 5.2 },
    { area: 'Comunicação', pessoas: 1, peso: 4.6 },
  ];
  const refAreas = U.distribuir(refeicoesAreas, areasBase.map((a) => a.pessoas * a.peso), 1);
  const areas = areasBase.map((a, i) => ({ area: a.area, pessoas: a.pessoas, refeicoes: refAreas[i], ...(a.vazio ? { vazio: true } : {}) })).sort((a, b) => (b.vazio ? 1 : 0) - (a.vazio ? 1 : 0) || b.pessoas - a.pessoas || b.refeicoes - a.refeicoes);
  const faixasCampo = { verde: 90, amarelo: 70 };
  const statusCampo = O.campo.ontem >= faixasCampo.verde ? 'verde' : O.campo.ontem >= faixasCampo.amarelo ? 'amarelo' : 'vermelho';
  const campo = {
    desde: inicioRefeicao,
    faixa14d: [valores14[0], valores14.at(-1)],
    mediana: mediana14,
    ontem: valorEm(refeicao_pessoas_dia, ontem),
    faixas: faixasCampo,
    refeicoes: { servidas, reservadas, comparecimentoPct: pct(servidas, reservadas) },
    areas,
    nota: `A operação de rua formal (rotas, ausências, liberações) tem zero linha no sistema. O proxy que sobrou é a refeição escaneada na base operacional. ${fmt.data(feriado)} não teve refeição (feriado, base fechada).`,
  };

  // ---------------------------------------------------------------- visitas a condomínios e comércios
  const semanasVisita = [
    { semana: '2026-10-19', v: 128, engajou: 53 },
    { semana: '2026-10-26', v: 389, engajou: 290 },
    { semana: '2026-11-02', v: 403, engajou: 98 },
    { semana: '2026-11-09', v: 193, engajou: 53 },
  ];
  const totalVisitas = soma(semanasVisita, (s) => s.v);
  const engajouTotal = soma(semanasVisita, (s) => s.engajou);
  const mistos = [3, 1, 1];
  const rota20 = 271;
  const rota40 = engajouTotal - rota20 - soma(mistos);
  const recusa = 196;
  const branco = totalVisitas - engajouTotal - recusa;
  const respostas = [
    { resposta: 'pergunta em branco', v: branco, tipo: 'branco' },
    { resposta: 'Rota 20', v: rota20, tipo: 'rota' },
    { resposta: 'Rota 40', v: rota40, tipo: 'rota' },
    { resposta: 'por enquanto sem interesse', v: recusa, tipo: 'nao' },
    { resposta: 'sem interesse + Rota 20', v: mistos[0], tipo: 'misto' },
    { resposta: 'Rota 40 + sem interesse', v: mistos[1], tipo: 'misto' },
    { resposta: 'Rota 40 + Rota 20', v: mistos[2], tipo: 'misto' },
  ];
  const agentesV = [338, 231, 209, 127, 118, 64, 15];
  const agentes = [...agentesV, totalVisitas - soma(agentesV)].map((v, i) => ({ agente: `Agente ${i + 1}`, v, ult7d: [49, 47, 35, 41, 9, 21, 0, 0][i] }));
  const formularioNovo = { nome: 'visita', respostas: 304, agentes: 6 };
  const semanasAntes = semanasVisita.map((s) => ({ semana: s.semana, v: s.v, engajouPct: pct(s.engajou, s.v) }));
  const semAntes = semanasAntes.find((s) => s.semana === '2026-10-26');
  const semDepois = semanasAntes.find((s) => s.semana === '2026-11-02');
  const visitas = {
    formulario: 'visitas_r20',
    semanas: semanasAntes,
    formularioNovo,
    agentes,
    total: totalVisitas,
    top4Pct: pct(soma(agentes.slice(0, 4), (a) => a.v), totalVisitas),
    picoHora: { hora: 16, v: 168 },
    respostas,
    emBrancoPct: pct(branco, totalVisitas),
    leitura: `A queda de ${fmt.n(semAntes.engajouPct)}% para ${fmt.n(semDepois.engajouPct)}% pode ser recusa real ou pode ser o campo deixando de ser preenchido; as duas hipóteses cabem nos dados, e só quem estava na rua sabe qual é.`,
    alcance: `As visitas são a única frente que fala com quem não está na base: ${fmt.n(totalVisitas)} visitas mais ${fmt.n(formularioNovo.respostas)} do formulário novo, feitas por ${fmt.n(agentes.length)} pessoas em 8 horas úteis por dia, para 9 bairros e ≈140 mil moradores.`,
  };
  const semanasForm = D.semanas;
  const porSemana = (mapa) => semanasForm.map((d) => ({ d, v: mapa[d] || 0 }));
  const formularios_semana = {
    visitas_r20: porSemana(Object.fromEntries(semanasVisita.map((s) => [s.semana, s.v]))),
    visita: porSemana({ '2026-11-09': formularioNovo.respostas }),
    rota_norte: porSemana({ '2026-10-12': 131, '2026-10-19': 104 }),
    rota_leste: porSemana({ '2026-10-19': 173 }),
  };

  // ---------------------------------------------------------------- Torre em uso
  const diaPicoContas = '2026-11-03';
  const inicioFaixa = somarDias(ontem, -27);
  const fixosContas = { '2026-10-12': 7, '2026-10-13': 13, '2026-10-14': 22, '2026-10-15': 27, '2026-10-16': 24, [feriado]: 26, [diaPicoContas]: 98, [diaFechamento]: 64, [D.medidoEm]: 39 };
  const torre_contas_dia = dias.map((d) => {
    if (d in fixosContas) return { d, v: fixosContas[d], ...(d === D.medidoEm ? { parcial: true } : {}) };
    const ajuste = { 'sáb': 0.88, dom: 0.62 }[U.diaSemana(d)] || 1;
    return { d, v: Math.min(92, Math.max(33, Math.round(66 * ajuste * rng.ruido(0.14)))) };
  });
  const fixosAcoes = { '2026-10-12': 214, '2026-10-13': 139, '2026-10-14': 158, [feriado]: 231, [diaFechamento]: 2874, [D.medidoEm]: 372 };
  const torre_acoes_dia = torre_contas_dia.map((p) => {
    if (p.d in fixosAcoes) return { d: p.d, v: fixosAcoes[p.d], ...(p.parcial ? { parcial: true } : {}) };
    return { d: p.d, v: Math.min(1180, Math.round(p.v * rng.entre(6.4, 10.2))) };
  });
  const faixaContas = torre_contas_dia.filter((p) => p.d >= inicioFaixa && p.d <= ontem).map((p) => p.v);
  const loginSucesso = 2318;
  const loginFalha = Math.round((loginSucesso * O.loginFalhaPct) / (100 - O.loginFalhaPct));
  const topAcoes = [
    { acao: 'auth.login_success', v: loginSucesso },
    { acao: 'sso_central.resgatado', v: 1847 },
    { acao: 'rotas.respostas.sync', v: 1592 },
    { acao: 'auth.login_failed', v: loginFalha, alerta: true },
    { acao: 'entrega-materiais.mover', v: 1231 },
    { acao: 'sso_central.emitido.painel', v: 1108 },
    { acao: 'sso_central.emitido', v: 761 },
    { acao: 'materiais.kits-em-lote', v: 574 },
    { acao: 'materiais.pedido.aprovado', v: 519 },
    { acao: 'entregas.marcarpronto.barrado', v: 488 },
    { acao: 'refeicao.elegibilidade', v: 463 },
    { acao: 'materiais.pedido.criado-no-painel', v: 441 },
    { acao: 'materiais.busca-pessoa', v: 407 },
    { acao: 'pedido-material.saida', v: 396 },
    { acao: 'auth.logout', v: 281 },
  ];
  const chamadosInternos = [
    { estado: 'concluído', v: 196, idadeD: 11.6 },
    { estado: 'em andamento', v: 12, idadeD: 7.4 },
    { estado: 'aberto', v: 9, idadeD: 6.9 },
    { estado: 'cancelado', v: 6, idadeD: 14.8 },
    { estado: 'solicitado', v: 5, idadeD: 3.9 },
    { estado: 'ideia', v: 2, idadeD: 9.2 },
  ];
  const picoAcoes = torre_acoes_dia.reduce((m, p) => (p.v > m.v ? p : m));
  const torre = {
    contasDiaFaixa: [Math.min(...faixaContas), Math.max(...faixaContas)],
    contasDiaDesde: inicioFaixa,
    mediaContas7d: U.arred(somaEntre(torre_contas_dia, ultimos7) / 7, 1),
    acoes: soma(torre_acoes_dia, (p) => p.v),
    picoAcoes: { dia: picoAcoes.d, v: picoAcoes.v },
    topAcoes,
    loginFalhaPct: pct(loginFalha, loginFalha + loginSucesso),
    contas: [
      { papel: 'comum', v: A.ATENDIMENTO.contasTorre - 25 - 13, ativas: A.ATENDIMENTO.contasTorre - 25 - 13 - 5 },
      { papel: 'admin', v: 25, ativas: 25 },
      { papel: 'supervisor', v: 13, ativas: 12 },
    ],
    chamadosInternos,
    chamadosInternosPorSemana: [
      { semana: '2026-10-12', v: 3 },
      { semana: '2026-10-19', v: 0 },
      { semana: '2026-10-26', v: 121 },
      { semana: '2026-11-02', v: 81 },
      { semana: '2026-11-09', v: 25 },
    ],
    chamadosVivos: soma(chamadosInternos.filter((c) => !['concluído', 'cancelado'].includes(c.estado)), (c) => c.v),
  };

  // ---------------------------------------------------------------- agenda e território
  const semanaDoDiaD = U.semanaDe(D.diaD);
  const porSemanaAgenda = [
    { semana: '2026-10-12', v: 1 },
    { semana: '2026-10-19', v: 3 },
    { semana: '2026-10-26', v: 5 },
    { semana: '2026-11-02', v: 3 },
    { semana: '2026-11-09', v: 1 },
    { semana: '2026-11-16', v: 5, futura: true },
    { semana: '2026-11-23', v: 3, futura: true },
    { semana: semanaDoDiaD, v: O.agendaSemanaDiaD, futura: true, diaD: true },
    { semana: somarDias(semanaDoDiaD, 7), v: 0, futura: true },
  ];
  const eventos = soma(porSemanaAgenda, (s) => s.v);
  const futuros = soma(porSemanaAgenda.filter((s) => s.futura), (s) => s.v);
  const agendaPedidos = [
    { estado: 'aprovado', v: 31 },
    { estado: 'pendente', v: 6 },
    { estado: 'rejeitado', v: 3 },
    { estado: 'cancelado', v: 1 },
  ];
  const agenda = {
    eventos,
    futuros,
    semanaDiaD: porSemanaAgenda.find((s) => s.diaD).v,
    ligadosAEvento: 0,
    porSemana: porSemanaAgenda,
    pedidos: agendaPedidos,
    leitura: `Nenhum dos ${fmt.n(eventos)} eventos do calendário está ligado a um pedido. Aprovar e marcar são dois sistemas que não se falam.`,
  };
  const ultimaSemanaComEvento = porSemanaAgenda.filter((s) => s.futura && s.v > 0).at(-1).semana;
  const eventosAte = somarDias(ultimaSemanaComEvento, 6);

  const regioes = [
    { regiao: 'Sul', leads: 968, entregues: 229, coordenada: 802 },
    { regiao: 'Leste', leads: 734, entregues: 188, coordenada: 589 },
    { regiao: 'Centro', leads: 512, entregues: 118, coordenada: 463 },
    { regiao: 'Norte', leads: 341, entregues: 97, coordenada: 287 },
    { regiao: 'Oeste', leads: 296, entregues: 64, coordenada: 255 },
    { regiao: 'Metropolitana', leads: 183, entregues: 51, coordenada: 149 },
    { regiao: 'Outras', leads: 2, entregues: 0, coordenada: 2 },
  ];
  const leads = 91874;
  const comRegiaoLeads = soma(regioes, (r) => r.leads);
  const comRegiaoEntregues = soma(regioes, (r) => r.entregues);
  const coordSemRegiao = 318;
  const territorio = {
    leads,
    semRegiaoPct: pct(leads - comRegiaoLeads, leads),
    comCoordenadaPct: pct(soma(regioes, (r) => r.coordenada) + coordSemRegiao, leads),
    erratasSemNadaPct: 95.4,
    regioes,
    semRegiao: { leads: leads - comRegiaoLeads, entregues: 42 },
    comRegiao: { leads: comRegiaoLeads, entregues: comRegiaoEntregues, pct: Math.round((100 * comRegiaoEntregues) / comRegiaoLeads) },
    leitura: `O território existe como lista, não como mapa. Qualquer plano de rota para os ${fmt.n(D.faltavamDiasNaMedicao)} dias vai depender de endereço digitado na hora, não da base.`,
  };
  const comRegiaoPct = pct(comRegiaoLeads, leads);

  // ---------------------------------------------------------------- régua
  const conferidasPct = pct(Et.conferidas, Et.total);
  const statusPor = (v, verde, amarelo, maiorMelhor = false) => (maiorMelhor ? (v >= verde ? 'verde' : v >= amarelo ? 'amarelo' : 'vermelho') : v <= verde ? 'verde' : v <= amarelo ? 'amarelo' : 'vermelho');
  const semanaAtualVisita = semanasAntes.at(-1);
  const insumoMin = Math.min(S.caixaKraft.dias, S.manualPiloto.dias);
  const regua = {
    nota: `Régua proposta para acompanhar até ${fmt.data(D.diaD)}, não uma medição. A coluna "hoje" é medida.`,
    linhas: [
      { metrica: 'Entrega de material — p90', verde: '≤ 24 h', amarelo: '24 a 48 h', vermelho: 'mais de 48 h', hoje: `${fmt.n(O.entrega.p90H)} h`, status: statusPor(O.entrega.p90H, 24, 48) },
      { metrica: 'Entrega de material — mediana', verde: '≤ 4 h', amarelo: '4 a 24 h', vermelho: 'mais de 24 h', hoje: `${fmtDias(O.entrega.medianaH)} h`, status: statusPor(O.entrega.medianaH, 4, 24) },
      { metrica: 'Pedido arquivado sem carimbo de entrega', verde: 'nenhum', amarelo: 'até 5%', vermelho: 'mais de 5%', hoje: `${fmt.n(P.arquivadosSemCarimbo)} de ${fmt.n(P.total)} (${fmt.pct(P.arquivadosSemCarimboPct)})`, status: P.arquivadosSemCarimbo === 0 ? 'verde' : P.arquivadosSemCarimboPct <= 5 ? 'amarelo' : 'vermelho' },
      { metrica: 'Kit conferido no recebimento', verde: 'mais de 50%', amarelo: '10% a 50%', vermelho: 'menos de 10%', hoje: `${fmt.n(Et.conferidas)} de ${fmt.n(Et.total)}`, status: conferidasPct > 50 ? 'verde' : conferidasPct >= 10 ? 'amarelo' : 'vermelho' },
      { metrica: 'Insumo do kit — dias de estoque (kraft / Manual)', verde: `mais de ${diasAteDiaD} d`, amarelo: `${diasAteD7} a ${diasAteDiaD} d`, vermelho: `menos de ${diasAteD7} d`, hoje: `${fmtDias(S.caixaKraft.dias)} d e ${fmtDias(S.manualPiloto.dias)} d`, status: insumoMin > diasAteDiaD ? 'verde' : insumoMin >= diasAteD7 ? 'amarelo' : 'vermelho' },
      { metrica: 'Pessoas em campo por dia', verde: `${faixasCampo.verde} ou mais`, amarelo: `${faixasCampo.amarelo} a ${faixasCampo.verde - 1}`, vermelho: `menos de ${faixasCampo.amarelo}`, hoje: `${fmt.n(campo.ontem)} em ${fmt.data(ontem)}`, status: statusCampo },
      { metrica: 'Visita a condomínios e comércios — engajamento', verde: '50% ou mais', amarelo: '25% a 50%', vermelho: 'menos de 25%', hoje: `${fmt.pct(semanaAtualVisita.engajouPct)} na sem. ${fmt.data(semanaAtualVisita.semana)}`, status: statusPor(semanaAtualVisita.engajouPct, 50, 25, true) },
      { metrica: 'Eventos na agenda da semana do Dia D', verde: '5 ou mais', amarelo: '1 a 4', vermelho: 'nenhum', hoje: fmt.n(agenda.semanaDiaD), status: statusPor(agenda.semanaDiaD, 5, 1, true) },
      { metrica: 'Lead com região no território', verde: '50% ou mais', amarelo: '20% a 50%', vermelho: 'menos de 20%', hoje: fmt.pct(comRegiaoPct), status: statusPor(comRegiaoPct, 50, 20, true) },
    ],
  };

  // ---------------------------------------------------------------- textos do capítulo
  const acabamAntes = [S.caixaKraft.dias < diasAteD7, S.manualPiloto.dias < diasAteD7].every(Boolean);
  const metadeHoras = Math.ceil(O.entrega.medianaH);
  const operacao = {
    letra: 'E',
    titulo: 'Operação: material, campo, visitas e sistema',
    pergunta: 'Estoque, entregas, gente em campo, visitas, uso da Torre.',
    frase: `O balcão é rápido; o que trava é insumo e registro. Metade das entregas sai em menos de ${fmt.n(metadeHoras)} horas, mas 1 em cada ${fmt.n(umEmCada)} leva mais de três dias. O estoque de caixa kraft e de Manual Piloto ${acabamAntes ? 'acaba' : 'aperta'} antes de ${fmt.data(D.d7)}. E mais da metade dos pedidos foi arquivada sem nunca receber o carimbo de entrega — a operação anda mais rápido do que consegue provar.`,
    kpis: [
      { v: entregas7d, rotulo: `entregas de material em 7 dias (${fmt.data(ultimos7[0])}–${fmt.data(ultimos7.at(-1))})` },
      { v: P.abertos, rotulo: 'pedidos abertos hoje (nem entregues, nem arquivados)' },
      { v: campo.ontem, rotulo: `pessoas em campo ontem (${fmt.data(ontem)}), pelo escaneio da refeição` },
      { v: maisCurto.dias, rotulo: `dias de estoque do item mais curto: ${maisCurto.item} (saldo ${fmt.n(maisCurto.saldo)})`, formato: 'dias' },
    ],
    pedidos: {
      total: P.total,
      entreguesComCarimbo: P.entreguesComCarimbo,
      arquivadosSemCarimbo: P.arquivadosSemCarimbo,
      abertos: P.abertos,
      arquivadosSemCarimboPct: P.arquivadosSemCarimboPct,
      entregasEntre,
      fluxoNovoDesde,
      lotes,
      estados,
      saida,
      saidaLeitura: 'Quando a saída é preenchida, a entrega quase sempre é registrada. A saída em branco e o arquivamento sem entrega são a mesma população. Tornar a saída obrigatória fecha as duas lacunas de uma vez.',
      caudaLonga: `A primeira versão do relatório comparava "8,4 dias" com "1,2 h" e concluía que a entrega tinha ficado quase instantânea. Eram ${fmt.n(casosAntigos)} casos contra ${fmt.n(P.entreguesComCarimbo - casosAntigos)}. Medido pela semana de entrega: mediana ${fmtDias(O.entrega.medianaH)} h e p90 ${fmt.n(O.entrega.p90H)} h.`,
      fontes: [
        { mede: 'Pedido de material', tabela: 'pedido_material', naoDiz: 'se a pessoa recebeu a caixa' },
        { mede: 'Itens do pedido', tabela: 'pedido_item', naoDiz: 'o que saiu de fato da prateleira' },
        { mede: 'Estoque e dias restantes', tabela: 'estoque_saldo · estoque_movimento', naoDiz: 'o que é lote e o que é balcão' },
        { mede: 'Etiqueta de kit', tabela: 'etiqueta_kit', naoDiz: `se o kit chegou (${fmt.n(Et.conferidas)} conferência em ${fmt.n(Et.total)})` },
        { mede: 'Gente em campo', tabela: 'refeicao', naoDiz: 'quem trabalha sem passar pela base operacional' },
        { mede: 'Visita a condomínios e comércios', tabela: 'formulario_visita', naoDiz: 'o nome do agente que visitou' },
        { mede: 'Uso do sistema', tabela: 'log_auditoria · conta_painel', naoDiz: 'quem só olhou a tela e não agiu' },
        { mede: 'Território dos leads', tabela: 'lead_regiao', naoDiz: `onde o lead mora (${fmt.pct(territorio.semRegiaoPct)} sem região)` },
      ],
    },
    itens,
    itensLeitura: `Os três primeiros lugares são kits de parceiros e de feira e uma carta — ${fmt.n(soma(tres, (t) => t.un))} peças em ${fmt.n(soma(tres, (t) => t.pedidos))} pedidos: encomendas grandes para eventos. O Kit Piloto é o oposto: ${fmt.n(kitPiloto.un)} peças espalhadas em ${fmt.n(kitPiloto.pedidos)} pedidos, a operação de todo dia.`,
    tempoEntrega: {
      faixas,
      medianaH: O.entrega.medianaH,
      p90H: O.entrega.p90H,
      maisDe3d,
      maisDe3dPct: pct(maisDe3d, P.entreguesComCarimbo),
    },
    regiaoPedido,
    autores,
    autoresNota: `O livro lista os autores pelo começo do e-mail; aqui a conta de pessoa aparece sem o e-mail. ${fmt.pct(scriptPct)} dos pedidos dos últimos 30 dias saíram do admin-token, ou seja, de script.`,
    scriptPct,
    estoque,
    etiquetas,
    campo,
    visitas,
    torre,
    agenda,
    territorio,
    muda: [
      { t: 'A operação anda mais rápido do que consegue provar.', d: `${fmt.n(P.arquivadosSemCarimbo)} pedidos arquivados sem carimbo de entrega (${fmt.pct(P.arquivadosSemCarimboPct)} de ${fmt.n(P.total)}), ${fmt.n(saidaVazia)} saíram sem dizer por onde e ${fmt.n(Et.conferidas)} kit foi conferido no recebimento em ${fmt.n(Et.total)} etiquetas. O número de entregas está entre ${fmt.n(entregasEntre[0])} e ${fmt.n(entregasEntre[1])}.` },
      { t: `Caixa kraft e Manual Piloto acabam antes de ${fmt.data(D.d7)}.`, d: `Caixa kraft grande: ${fmt.n(S.caixaKraft.saldo)} peças e ${fmtDias(S.caixaKraft.dias)} dias; Manual Piloto: ${fmt.n(S.manualPiloto.saldo)} peças e ${fmtDias(S.manualPiloto.dias)} dias. ${fmt.n(S.zerados)} itens já estão zerados e ${fmt.n(S.abaixoDe5d)} dos ${fmt.n(S.itensMedidos)} não chegam a 5 dias.` },
      { t: 'A agenda da semana do Dia D está vazia.', d: `Nenhum evento marcado entre ${fmt.data(semanaDoDiaD)} e ${fmt.data(D.diaD)}, nem na semana seguinte. Há ${fmt.n(futuros)} eventos futuros, todos até ${fmt.data(eventosAte)}. E os ${fmt.n(agendaPedidos[0].v)} pedidos de agenda aprovados não viraram evento nenhum.` },
      { t: 'O campo está estável; o que caiu foi a conversão da visita.', d: `De ${fmt.n(campo.faixa14d[0])} a ${fmt.n(campo.faixa14d[1])} pessoas por dia escaneiam refeição, mediana ${fmt.n(campo.mediana)} — ${statusCampo}. As visitas mantiveram o volume e perderam o engajamento: ${fmt.pct(semAntes.engajouPct)} na semana de ${fmt.data(semAntes.semana)}, ${fmt.pct(semDepois.engajouPct)} na de ${fmt.data(semDepois.semana)}, com ${fmt.n(branco)} das ${fmt.n(totalVisitas)} visitas em branco.` },
      { t: 'Quase metade dos pedidos é lote, não demanda.', d: `${fmt.pct(scriptPct)} dos pedidos dos últimos 30 dias foram criados pelo admin-token, isto é, por script.` },
    ],
    naoMede: [
      'A operação de rua formal: as tabelas de rota, ausência e liberação existem e estão vazias.',
      'Se o material chegou: a etiqueta prova impressão; a entrega prova um clique.',
      'Consumo real contra carga em lote: o cálculo de "dias restantes" soma os dois.',
      'Quem abre qual tela: a auditoria registra ação executada, não navegação.',
      'Quem é cada agente de visita: o formulário grava um identificador interno.',
    ],
    regua,
    p: [34, 43],
  };

  return {
    livro: { operacao },
    series: { pedidos_dia, entregas_dia, etiquetas_dia, refeicao_pessoas_dia, refeicao_almoco_dia, refeicao_janta_dia, torre_contas_dia, torre_acoes_dia, formularios_semana },
  };
}

export function verificar(saida, { A, U }) {
  const erros = [];
  const { soma, pct, somarDias, intervalo, diasEntre } = U;
  const E = saida.livro.operacao;
  const S = saida.series;
  const O = A.OPERACAO;
  const D = A.DATAS;
  const ontem = somarDias(D.medidoEm, -1);
  const ultimos7 = intervalo(somarDias(D.medidoEm, -7), ontem);
  const v = (serie, d) => (serie.find((p) => p.d === d) || { v: 0 }).v;
  const igual = (rotulo, a, b) => {
    if (a !== b) erros.push(`${rotulo}: ${a} ≠ ${b}`);
  };
  const P = E.pedidos;

  // pedidos
  igual('pedidos: total âncora', P.total, O.pedidos.total);
  igual('pedidos: entregues âncora', P.entreguesComCarimbo, O.pedidos.entreguesComCarimbo);
  igual('pedidos: arquivados âncora', P.arquivadosSemCarimbo, O.pedidos.arquivadosSemCarimbo);
  igual('pedidos: abertos âncora', P.abertos, O.pedidos.abertos);
  igual('pedidos: pct âncora', P.arquivadosSemCarimboPct, 51.8);
  igual('pedidos: partes somam total', P.entreguesComCarimbo + P.arquivadosSemCarimbo + P.abertos, P.total);
  igual('pedidos: série soma total', soma(S.pedidos_dia, (p) => p.v), P.total);
  igual('pedidos: série tem 34 dias', S.pedidos_dia.length, D.dias);
  igual('pedidos: estados somam total', soma(P.estados, (x) => x.v), P.total);
  igual('pedidos: estados arquivados sem carimbo', soma(P.estados.filter((x) => /arquivado · sem carimbo/.test(x.combinacao)), (x) => x.v), P.arquivadosSemCarimbo);
  igual('pedidos: estados com carimbo', soma(P.estados.filter((x) => /com carimbo/.test(x.combinacao)), (x) => x.v), P.entreguesComCarimbo);
  igual('pedidos: estados abertos sem carimbo', soma(P.estados.filter((x) => /aberto · sem carimbo/.test(x.combinacao)), (x) => x.v), P.abertos);
  igual('saída: soma total', soma(P.saida, (x) => x.v), P.total);
  igual('saída: com carimbo soma entregues', soma(P.saida, (x) => x.comCarimbo), P.entreguesComCarimbo);
  if (!P.saida.some((x) => x.saida === 'saída em branco')) erros.push('saída: falta "saída em branco"');
  igual('entregas entre', P.entregasEntre[1], P.entreguesComCarimbo + P.arquivadosSemCarimbo);
  for (const l of P.lotes) {
    const p = S.pedidos_dia.find((x) => x.d === l.dia);
    if (!p || p.v !== l.v || !p.lote) erros.push(`lote ${l.dia} não bate com a série`);
  }
  if (S.pedidos_dia.some((p) => !p.lote && p.v >= 300)) erros.push('pedidos: dia sem lote com 300 ou mais');
  if (S.pedidos_dia.some((p) => p.d < P.fluxoNovoDesde && p.v)) erros.push('pedidos antes do fluxo novo');
  if (!S.pedidos_dia.at(-1).parcial) erros.push('pedidos: último dia sem parcial');
  igual('entregas: série soma entregues', soma(S.entregas_dia, (p) => p.v), P.entreguesComCarimbo);
  igual('kpi entregas 7d', E.kpis[0].v, soma(ultimos7, (d) => v(S.entregas_dia, d)));
  igual('kpi abertos', E.kpis[1].v, P.abertos);
  const maiorEntrega = S.entregas_dia.reduce((m, p) => (p.v > m.v ? p : m));
  igual('entregas: dia de fechamento = segundo lote', maiorEntrega.d, P.lotes[1].dia);

  // tempo de entrega
  const T = E.tempoEntrega;
  igual('tempo: mediana âncora', T.medianaH, O.entrega.medianaH);
  igual('tempo: p90 âncora', T.p90H, O.entrega.p90H);
  igual('tempo: faixas somam entregues', soma(T.faixas, (x) => x.v), P.entreguesComCarimbo);
  const acum = [];
  T.faixas.reduce((a, x) => (acum.push(a + x.v), a + x.v), 0);
  const posMed = P.entreguesComCarimbo / 2;
  const posP90 = P.entreguesComCarimbo * 0.9;
  if (!(acum[0] < posMed && acum[1] >= posMed)) erros.push('tempo: mediana fora da faixa 1–4 h');
  if (!(acum[2] < posP90 && acum[3] >= posP90)) erros.push('tempo: p90 fora da faixa 1–3 d');
  igual('tempo: >3 d', T.maisDe3d, T.faixas.at(-1).v);
  igual('tempo: >3 d pct', T.maisDe3dPct, pct(T.maisDe3d, P.entreguesComCarimbo));
  igual('autores: soma total', soma(E.autores, (a) => a.v), P.total);
  igual('script: âncora', E.scriptPct, O.scriptPct);
  igual('script: pct', E.scriptPct, pct(E.autores[0].v, P.total));
  for (let i = 1; i < E.itens.length; i++) if (E.itens[i].un > E.itens[i - 1].un) erros.push(`itens fora de ordem em ${E.itens[i].item}`);

  // estoque
  const Es = E.estoque;
  const kraft = Es.itens.filter((i) => /caixa\s+kraft/i.test(i.item));
  const manual = Es.itens.filter((i) => /^manual\s+(do\s+)?piloto/i.test(i.item));
  if (kraft.length !== 1 || kraft[0].item !== 'Caixa kraft grande' || kraft[0].dias !== O.estoque.caixaKraft.dias || kraft[0].saldo !== O.estoque.caixaKraft.saldo) erros.push('estoque: Caixa kraft grande não bate com a âncora');
  if (manual.length !== 1 || manual[0].item !== 'Manual Piloto' || manual[0].dias !== O.estoque.manualPiloto.dias || manual[0].saldo !== O.estoque.manualPiloto.saldo) erros.push('estoque: Manual Piloto não bate com a âncora');
  igual('estoque: medidos', Es.itensMedidos, O.estoque.itensMedidos);
  igual('estoque: abaixo de 5 d (lista)', Es.itens.filter((i) => i.dias < 5).length, O.estoque.abaixoDe5d);
  igual('estoque: abaixo de 5 d', Es.abaixoDe5d, O.estoque.abaixoDe5d);
  igual('estoque: zerados (lista)', Es.itens.filter((i) => i.saldo === 0).length, O.estoque.zerados);
  igual('estoque: zerados', Es.zerados, O.estoque.zerados);
  igual('estoque: abaixo do D-7', Es.abaixoDoD7, Es.itens.filter((i) => i.dias < diasEntre(D.medidoEm, D.d7)).length);
  for (let i = 1; i < Es.itens.length; i++) if (Es.itens[i].dias < Es.itens[i - 1].dias) erros.push(`estoque fora de ordem em ${Es.itens[i].item}`);
  igual('kpi estoque mais curto', E.kpis[3].v, Math.min(...Es.itens.map((i) => i.dias)));

  // etiquetas
  const Et = E.etiquetas;
  igual('etiquetas: total âncora', Et.total, O.etiquetas.total);
  igual('etiquetas: conferidas âncora', Et.conferidas, O.etiquetas.conferidas);
  igual('etiquetas: série soma total', soma(S.etiquetas_dia, (p) => p.v), Et.total);
  igual('etiquetas: pontos somam total', soma(Et.pontos, (p) => p.total), Et.total);
  igual('etiquetas: 7 d da série', Et.ult7dTotal, soma(ultimos7, (d) => v(S.etiquetas_dia, d)));
  igual('etiquetas: pontos 7 d', soma(Et.pontos, (p) => p.ult7d), Et.ult7dTotal);
  if (Et.pontos.some((p) => p.ult7d > p.total)) erros.push('etiquetas: ponto com 7 d maior que o total');
  igual('etiquetas: parados', Et.pontosParados, Et.pontos.filter((p) => p.ult7d === 0).length);
  igual('etiquetas: fila de erros', Et.filaImpressao.erros, soma(Et.filaImpressao.diasComErro, (x) => x.v));
  for (const pk of Et.picos) igual(`etiquetas: pico ${pk.dia}`, pk.v, v(S.etiquetas_dia, pk.dia));
  const semPico = S.etiquetas_dia.filter((p) => !Et.picos.some((k) => k.dia === p.d));
  if (Math.max(...semPico.map((p) => p.v)) >= Math.min(...Et.picos.map((k) => k.v))) erros.push('etiquetas: dia fora dos picos maior que um pico');
  const lider7 = [...Et.pontos].sort((a, b) => b.ult7d - a.ult7d);
  igual('etiquetas: dupla 7 d', Et.duplaLider7dPct, Math.round((100 * (lider7[0].ult7d + lider7[1].ult7d)) / Et.ult7dTotal));
  if (lider7[0].ponto !== Et.pontos[0].ponto) erros.push('etiquetas: líder do total ≠ líder dos 7 dias');

  // campo
  const C = E.campo;
  igual('campo: faixa mínima', C.faixa14d[0], O.campo.faixa14d[0]);
  igual('campo: faixa máxima', C.faixa14d[1], O.campo.faixa14d[1]);
  igual('campo: mediana', C.mediana, O.campo.mediana);
  igual('campo: ontem', C.ontem, O.campo.ontem);
  igual('kpi campo', E.kpis[2].v, C.ontem);
  const zerosCampo = S.refeicao_pessoas_dia.filter((p) => p.v === 0);
  igual('campo: um dia sem refeição', zerosCampo.length, 1);
  for (const p of S.refeicao_pessoas_dia) {
    const a = v(S.refeicao_almoco_dia, p.d);
    const j = v(S.refeicao_janta_dia, p.d);
    if (a > p.v || j > p.v || a + j < p.v) erros.push(`campo: almoço/janta incoerente em ${p.d}`);
  }
  igual('campo: servidas', C.refeicoes.servidas, soma(S.refeicao_almoco_dia, (p) => p.v) + soma(S.refeicao_janta_dia, (p) => p.v));
  igual('campo: comparecimento', C.refeicoes.comparecimentoPct, pct(C.refeicoes.servidas, C.refeicoes.reservadas));
  const janela = intervalo(somarDias(D.medidoEm, -13), D.medidoEm);
  igual('campo: refeições das áreas', soma(C.areas, (a) => a.refeicoes), soma(janela, (d) => v(S.refeicao_almoco_dia, d) + v(S.refeicao_janta_dia, d)));
  if (soma(C.areas, (a) => a.pessoas) < C.faixa14d[1]) erros.push('campo: pessoas das áreas abaixo do máximo diário');
  const linhaCampo = E.regua.linhas[5];
  igual('régua campo', linhaCampo.status, C.ontem >= C.faixas.verde ? 'verde' : C.ontem >= C.faixas.amarelo ? 'amarelo' : 'vermelho');

  // visitas
  const V = E.visitas;
  igual('visitas: semanas somam total', soma(V.semanas, (s) => s.v), V.total);
  igual('visitas: respostas somam total', soma(V.respostas, (r) => r.v), V.total);
  igual('visitas: agentes somam total', soma(V.agentes, (a) => a.v), V.total);
  igual('visitas: engajou soma rotas + mistos', Math.round(soma(V.semanas, (s) => (s.v * s.engajouPct) / 100)), soma(V.respostas.filter((r) => r.tipo === 'rota' || r.tipo === 'misto'), (r) => r.v));
  const s26 = V.semanas.find((s) => s.semana === '2026-10-26');
  const s02 = V.semanas.find((s) => s.semana === '2026-11-02');
  igual('visitas: engajamento de', s26 && s26.engajouPct, O.portaAPorta.engajamentoDe);
  igual('visitas: engajamento para', s02 && s02.engajouPct, O.portaAPorta.engajamentoPara);
  igual('visitas: em branco pct', V.emBrancoPct, pct(V.respostas.find((r) => r.tipo === 'branco').v, V.total));
  igual('visitas: top4', V.top4Pct, pct(soma(V.agentes.slice(0, 4), (a) => a.v), V.total));
  igual('formulários: visitas_r20', soma(S.formularios_semana.visitas_r20, (p) => p.v), V.total);
  igual('formulários: novo', soma(S.formularios_semana[V.formularioNovo.nome], (p) => p.v), V.formularioNovo.respostas);

  // Torre
  const Tr = E.torre;
  igual('torre: login falha âncora', Tr.loginFalhaPct, O.loginFalhaPct);
  const falha = Tr.topAcoes.find((x) => x.acao === 'auth.login_failed').v;
  const sucesso = Tr.topAcoes.find((x) => x.acao === 'auth.login_success').v;
  igual('torre: login pct', Tr.loginFalhaPct, pct(falha, falha + sucesso));
  for (let i = 1; i < Tr.topAcoes.length; i++) if (Tr.topAcoes[i].v > Tr.topAcoes[i - 1].v) erros.push('torre: ações fora de ordem');
  igual('torre: contas somam contas da Torre', soma(Tr.contas, (c) => c.v), A.ATENDIMENTO.contasTorre);
  igual('torre: ações somam série', Tr.acoes, soma(S.torre_acoes_dia, (p) => p.v));
  const acoes30 = soma(S.torre_acoes_dia.slice(-30), (p) => p.v);
  if (acoes30 < soma(Tr.topAcoes, (x) => x.v)) erros.push('torre: top 15 maior que as ações de 30 dias');
  const pico = S.torre_acoes_dia.reduce((m, p) => (p.v > m.v ? p : m));
  igual('torre: pico', `${pico.d}:${pico.v}`, `${Tr.picoAcoes.dia}:${Tr.picoAcoes.v}`);
  if (S.torre_acoes_dia.filter((p) => p.v === pico.v).length !== 1) erros.push('torre: pico repetido');
  igual('torre: pico no dia de fechamento', Tr.picoAcoes.dia, maiorEntrega.d);
  igual('torre: média 7 d', Tr.mediaContas7d, U.arred(soma(ultimos7, (d) => v(S.torre_contas_dia, d)) / 7, 1));
  const faixa = S.torre_contas_dia.filter((p) => p.d >= Tr.contasDiaDesde && p.d <= ontem).map((p) => p.v);
  igual('torre: faixa de contas', `${Math.min(...faixa)}–${Math.max(...faixa)}`, `${Tr.contasDiaFaixa[0]}–${Tr.contasDiaFaixa[1]}`);
  igual('torre: chamados vivos', Tr.chamadosVivos, soma(Tr.chamadosInternos.filter((c) => !['concluído', 'cancelado'].includes(c.estado)), (c) => c.v));
  igual('torre: chamados por semana', soma(Tr.chamadosInternosPorSemana, (x) => x.v), soma(Tr.chamadosInternos, (c) => c.v));

  // agenda e território
  const Ag = E.agenda;
  igual('agenda: semana do Dia D âncora', Ag.semanaDiaD, O.agendaSemanaDiaD);
  const sDiaD = Ag.porSemana.find((s) => s.semana === U.semanaDe(D.diaD));
  if (!sDiaD || !sDiaD.diaD || sDiaD.v !== 0) erros.push('agenda: semana de 30/11 sem diaD ou com evento');
  igual('agenda: eventos', Ag.eventos, soma(Ag.porSemana, (s) => s.v));
  igual('agenda: futuros', Ag.futuros, soma(Ag.porSemana.filter((s) => s.futura), (s) => s.v));
  if (!Ag.pedidos.some((p) => p.estado === 'aprovado')) erros.push('agenda: falta estado aprovado');
  const Te = E.territorio;
  igual('território: com região', Te.comRegiao.leads, soma(Te.regioes, (r) => r.leads));
  igual('território: com + sem região', Te.comRegiao.leads + Te.semRegiao.leads, Te.leads);
  igual('território: sem região pct', Te.semRegiaoPct, pct(Te.semRegiao.leads, Te.leads));
  for (const r of Te.regioes) if (r.regiao !== 'Outras' && !A.VOCAB.regioes.includes(r.regiao)) erros.push(`território: região fora do vocabulário (${r.regiao})`);
  for (const r of Te.regioes) if (r.entregues > r.leads || r.coordenada > r.leads) erros.push(`território: ${r.regiao} incoerente`);

  // régua
  const nomesRegua = E.regua.linhas.map((l) => l.metrica);
  if (!nomesRegua.some((m) => /dias de estoque/i.test(m))) erros.push('régua: falta "dias de estoque"');
  if (!nomesRegua.some((m) => /sem carimbo/i.test(m))) erros.push('régua: falta "sem carimbo"');
  if (!nomesRegua.some((m) => /semana do Dia D/i.test(m))) erros.push('régua: falta "semana do Dia D"');
  igual('régua: 9 linhas', E.regua.linhas.length, 9);
  return erros;
}
