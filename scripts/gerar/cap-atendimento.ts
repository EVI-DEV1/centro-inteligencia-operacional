// Capítulo F (parte 1) · Atendimento: baixas por pessoa, por dia, por hora; fila viva; assuntos e urgência.
// As séries são geradas primeiro (baixa por pessoa e por dia) e os números do texto saem delas.
import type { Contexto, SaidaCapitulo } from './tipos.ts';

const PIOR_DIA = '2026-10-19';
const PIOR_DIA_H = 30.8;
const MEDIANA_ONTEM_H = 4.4;

const ANTES_DA_JANELA = { 'Marta L.': 391, 'Equipe Rua': 0, 'Joana F.': 7, 'Caio R.': 5, 'Luana B.': 0 };
const DEMAIS_30D = { 'Equipe Rua': 261, 'Joana F.': 97, 'Caio R.': 83, 'Luana B.': 62 };

const MEDIANA_DIA_SEMANA = { seg: null, ter: 11.7, qua: 8.4, qui: 3.9, sex: 2.6, 'sáb': 0.9, dom: 5.3 };

const ASSUNTOS = [
  { assunto: 'Outros', v: 1412, humano: 117 },
  { assunto: 'Assistência em viagem', v: 623, humano: 518, destaque: true },
  { assunto: 'Cadastro e dados', v: 71, humano: 46 },
  { assunto: 'Pagamento e reembolso', v: 58, humano: 43 },
  { assunto: 'Direitos do consumidor', v: 42, humano: 37 },
  { assunto: 'Remarcação', v: 36, humano: 27 },
  { assunto: 'Bagagem', v: 26, humano: 23 },
  { assunto: 'Documentação de viagem', v: 19, humano: 15 },
  { assunto: 'Hospedagem', v: 8, humano: 7 },
  { assunto: 'Segurança da conta', v: 6, humano: 6 },
  { assunto: 'Pontos e benefícios', v: 3, humano: 2 },
];
const URGENTES = { dele: 247, total: 268 };

const ESPERANDO = [
  { urgencia: 'Alta', esperando: 7, mediaH: 4, maiorH: 6 },
  { urgencia: 'Média', esperando: 12, mediaH: 3, maiorH: 9 },
  { urgencia: 'Baixa', esperando: 39, mediaH: 2, maiorH: 13 },
];

const mediana = (valores) => {
  const s = [...valores].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round(((s[m - 1] + s[m]) / 2) * 10) / 10;
};

export function gerar({ rng, A, U }: Contexto): SaidaCapitulo {
  const { ATENDIMENTO: AT, DATAS, PESSOAS, VOCAB } = A;
  const { fmt } = U;
  const dias = U.intervalo(DATAS.inicio, DATAS.fim);
  const janela = dias.slice(-30);
  const antes = dias.slice(0, dias.length - 30);
  const ontem = U.somarDias(DATAS.medidoEm, -1);
  const principal = AT.umaConta.nome;

  const fdia = (d) => ({ seg: 1.3, ter: 1.05, qua: 1, qui: 0.95, sex: 0.9, 'sáb': 0.7, dom: 0.12 })[U.diaSemana(d)] * (d === DATAS.medidoEm ? 0.6 : 1);

  const repartir = (lista, total, peso, fixos = {}) => {
    const livres = lista.filter((d) => !(d in fixos));
    let pesos = livres.map(peso);
    if (!U.soma(pesos)) pesos = livres.map(fdia);
    const partes = U.distribuir(total - U.soma(Object.values(fixos)), pesos);
    return { ...Object.fromEntries(livres.map((d, i) => [d, partes[i]])), ...fixos };
  };

  // ---------------------------------------------------------------- baixas por pessoa e por dia
  const totais30 = { [principal]: AT.umaConta.v, ...DEMAIS_30D };
  const pesoDe = {
    'Marta L.': (d) => fdia(d) * rng.ruido(0.3),
    'Equipe Rua': (d) => (d >= '2026-11-03' && U.diaSemana(d) !== 'dom' ? fdia(d) * rng.ruido(0.4) : 0),
    'Joana F.': (d) => (rng.float() < 0.5 ? 0 : fdia(d) * rng.ruido(0.5)),
    'Caio R.': (d) => (rng.float() < 0.55 ? 0 : fdia(d) * rng.ruido(0.5)),
    'Luana B.': (d) => (d >= '2026-10-21' && rng.float() >= 0.5 ? fdia(d) * rng.ruido(0.5) : 0),
  };
  const porPessoa = {};
  for (const nome of PESSOAS.atendentes) {
    const pre = ANTES_DA_JANELA[nome] ? repartir(antes, ANTES_DA_JANELA[nome], pesoDe[nome]) : Object.fromEntries(antes.map((d) => [d, 0]));
    const fixos = nome === principal ? { [PIOR_DIA]: 517 } : {};
    const jan = repartir(janela, totais30[nome], pesoDe[nome], fixos);
    porPessoa[nome] = { ...pre, ...jan };
  }
  const baixasDia = dias.map((d) => ({ d, v: U.soma(PESSOAS.atendentes, (n) => porPessoa[n][d]), ...(d === DATAS.medidoEm ? { parcial: true } : {}) }));
  const valorDia = Object.fromEntries(baixasDia.map((p) => [p.d, p.v]));

  const atendentesSemana = Object.fromEntries(
    PESSOAS.atendentes.map((nome) => [nome, DATAS.semanas.map((s) => ({ d: s, v: U.soma(U.intervalo(s, U.somarDias(s, 6)).filter((d) => d in porPessoa[nome]), (d) => porPessoa[nome][d]) }))])
  );
  const semanasPrincipal = atendentesSemana[principal];
  const pico = semanasPrincipal.reduce((m, p) => (!m || p.v > m.v ? p : m), null);

  const pessoas = PESSOAS.atendentes.map((nome) => ({ nome, v: totais30[nome], pct: U.pct(totais30[nome], AT.baixas30d) })).sort((a, b) => b.v - a.v);

  // ---------------------------------------------------------------- espera mediana por dia
  const bases = { ...MEDIANA_DIA_SEMANA, seg: AT.medianaSegundaH };
  const teto = PIOR_DIA_H - 1;
  const fixosH = { [PIOR_DIA]: PIOR_DIA_H, [ontem]: MEDIANA_ONTEM_H };
  const medianaPorDia = {};
  for (const dia of Object.keys(bases)) {
    const base = bases[dia];
    const grupo = dias.filter((d) => U.diaSemana(d) === dia);
    const n = grupo.length;
    const k = Math.floor(n / 2);
    const meio = n % 2 ? [base] : [U.arred(base - base * 0.08, 1), U.arred(base + base * 0.08, 1)];
    const baixos = Array.from({ length: k - (n % 2 ? 0 : 1) }, () => Math.max(0.1, U.arred(base * rng.entre(0.25, 0.9), 1)));
    const altos = Array.from({ length: n - baixos.length - meio.length }, () => Math.min(teto, Math.max(base, U.arred(base * rng.entre(1.1, 1.8), 1))));
    const fixosGrupo = grupo.filter((d) => d in fixosH);
    fixosGrupo.forEach((d, i) => {
      altos[i] = fixosH[d];
      medianaPorDia[d] = fixosH[d];
    });
    const livres = rng.embaralhar(grupo.filter((d) => !(d in fixosH)));
    const valores = rng.embaralhar([...baixos, ...meio, ...altos.slice(fixosGrupo.length)]);
    livres.forEach((d, i) => (medianaPorDia[d] = valores[i]));
  }
  const medianaDia = dias.map((d) => ({ d, h: medianaPorDia[d] }));
  const medianaDiaSemana = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((dia) => ({ dia, h: bases[dia] }));

  // ---------------------------------------------------------------- hora do clique (30 dias)
  const fora23 = 27;
  const formaHora = { 9: 0.62, 10: 1, 11: 0.83, 12: 0.41, 13: 0.55, 14: 1.02, 15: 0.88, 16: 0.93, 17: 0.84, 18: 0.66, 19: 0.43, 20: 0.36, 21: 0.27 };
  const horasExpediente = Object.keys(formaHora).map(Number);
  const partesHora = U.distribuir(AT.baixas30d - fora23, horasExpediente.map((h) => formaHora[h] * rng.ruido(0.12)));
  const horaClique = Array.from({ length: 24 }, (_, h) => (h === 23 ? fora23 : h in formaHora ? partesHora[horasExpediente.indexOf(h)] : 0));
  const madrugada = U.soma(horaClique.slice(0, 8));
  const foraExpediente = madrugada + horaClique[22] + horaClique[23];
  const comBaixa = horaClique.map((v, h) => (v > 0 && h < 22 ? h : null)).filter((h) => h !== null);

  // ---------------------------------------------------------------- faixas de espera (todas as baixas do período)
  const faixasTotal = U.soma(baixasDia, (p) => p.v);
  const rotulosFaixa = ['≤5 min', '5–30 min', '30 min–2 h', '2–24 h', '>24 h'];
  const partesFaixa = U.distribuir(faixasTotal, [5.3, 10.2, 15.4, 41.6, 27.5]);
  const faixas = rotulosFaixa.map((faixa, i) => ({ faixa, v: partesFaixa[i], ...(faixa === '>24 h' ? { alerta: true } : {}) }));
  const ate30minPct = U.pct(partesFaixa[0] + partesFaixa[1], faixasTotal);
  const ate2hPct = U.pct(partesFaixa[0] + partesFaixa[1] + partesFaixa[2], faixasTotal);
  const mais24hPct = U.pct(partesFaixa[4], faixasTotal);

  // ---------------------------------------------------------------- assuntos, regiões, urgência
  const classificadas = U.soma(ASSUNTOS, (x) => x.v);
  const destaque = ASSUNTOS.find((x) => x.destaque);
  const saude = {
    pctDoTotal: U.pct(destaque.v, classificadas),
    precisaHumanoPct: U.pct(destaque.humano, destaque.v),
    urgentes: URGENTES.dele,
    urgentesTotal: URGENTES.total,
    urgentesPct: U.pct(URGENTES.dele, URGENTES.total),
  };
  const nomesRegiao = ['Sem região', 'Sul', 'Norte', 'Centro', 'Leste', 'Oeste', 'Metropolitana'];
  const partesRegiao = U.distribuir(classificadas, [70.6, 8.4, 6.5, 5.2, 4.1, 3.1, 2.1]);
  const regioes = nomesRegiao.map((regiao, i) => ({ regiao, v: partesRegiao[i], ...(i === 0 ? { vazio: true } : {}) }));
  const semRegiaoPct = U.pct(partesRegiao[0], classificadas);

  const partesUrg = U.distribuir(AT.baixas30d, [32.1, 4.4, 13.8, 37.6, 12.1]);
  const urgencia = [
    { urgencia: 'Crítica', medianaH: AT.medianaCriticaH },
    { urgencia: 'Alta', medianaH: 16.2 },
    { urgencia: 'Média', medianaH: 10.9 },
    { urgencia: 'Baixa', medianaH: AT.medianaBaixaH },
    { urgencia: 'Sem etiqueta', medianaH: 3.7 },
  ].map((u, i) => ({ urgencia: u.urgencia, baixas: partesUrg[i], medianaH: u.medianaH }));
  const etiquetaInvertida = U.arred(AT.medianaCriticaH / AT.medianaBaixaH, 1);

  const esperandoAgora = [{ urgencia: 'Crítica', ...AT.criticasAgora }, ...ESPERANDO];
  const abertasAgora = U.soma(esperandoAgora, (x) => x.esperando);

  // ---------------------------------------------------------------- kpis e textos
  const ini7 = U.somarDias(ontem, -6);
  const baixas7d = U.soma(baixasDia.filter((p) => p.d >= ini7 && p.d <= ontem), (p) => p.v);
  const top = pessoas[0];
  const seg = medianaDiaSemana.find((x) => x.dia === 'seg');
  const menorDia = medianaDiaSemana.reduce((m, x) => (!m || x.h < m.h ? x : m), null);
  const nomeDia = { seg: 'na segunda', ter: 'na terça', qua: 'na quarta', qui: 'na quinta', sex: 'na sexta', 'sáb': 'no sábado', dom: 'no domingo' };
  const horas = (v) => `${fmt.dec(v)} ${v < 2 ? 'hora' : 'horas'}`;
  const status = (v, amarelo, vermelho) => (v > vermelho ? 'vermelho' : v > amarelo ? 'amarelo' : 'verde');
  const criticas = AT.criticasAgora;

  const atendimento = {
    letra: 'F',
    titulo: 'Atendimento: quem responde',
    pergunta: 'Tempo até a baixa, concentração, fila e assuntos.',
    frase: `Uma pessoa responde por quase tudo: uma única conta deu ${fmt.pct(top.pct)} das ${fmt.n(AT.baixas30d)} baixas dos últimos 30 dias, e só ${fmt.n(AT.contasQueDeramBaixa)} das ${fmt.n(AT.contasTorre)} contas da Torre já apertaram o botão.`,
    kpis: [
      { v: baixas7d, rotulo: `baixas nos últimos 7 dias completos (${fmt.data(ini7)} a ${fmt.data(ontem)})` },
      { v: MEDIANA_ONTEM_H, rotulo: `mediana de espera até a baixa ontem (${fmt.data(ontem)})`, formato: 'horas' },
      { v: abertasAgora, rotulo: 'conversas abertas agora, sem baixa' },
      { v: top.pct, rotulo: 'das baixas de 30 dias numa única conta', formato: 'pct' },
    ],
    relogio: 'O relógio começa quando a conversa abre e para quando alguém clica em baixa — não na primeira resposta. Onde a tela diz "espera", entenda "tempo até o caso ser marcado como resolvido no sistema".',
    indoBem: `${fmt.pct(ate2hPct)} das baixas fecham em até 2 horas, e a fila de agora é curta: ${fmt.n(abertasAgora)} conversas abertas.`,
    baixas30d: AT.baixas30d,
    faixas,
    faixasTotal,
    ate30minPct,
    mais24hPct,
    medianaDiaSemana,
    horaClique: { entre: `${comBaixa[0]}h e ${comBaixa.at(-1)}h`, madrugada, foraExpediente, foraExpedienteHora: '23h' },
    pessoas,
    contasTorre: AT.contasTorre,
    contasQueDeramBaixa: AT.contasQueDeramBaixa,
    picoSemanaPrincipal: { semana: pico.d, v: pico.v },
    piorDia: { dia: PIOR_DIA, baixas: valorDia[PIOR_DIA], medianaH: PIOR_DIA_H, leitura: 'Foi a limpeza de uma fila acumulada, não atendimento rápido.' },
    assuntos: ASSUNTOS.map((x) => ({ ...x })),
    classificadas,
    saude,
    regioes,
    semRegiaoPct,
    urgencia,
    etiquetaInvertida,
    esperandoAgora,
    muda: [
      {
        t: `Uma pessoa é ${fmt.pct(top.pct)} das baixas.`,
        d: `${fmt.n(top.v)} de ${fmt.n(AT.baixas30d)} baixas em 30 dias saíram de uma única conta, e só ${fmt.n(AT.contasQueDeramBaixa)} das ${fmt.n(AT.contasTorre)} contas da Torre já usaram o botão. Não se trata de elogiar ou cobrar alguém: é um ponto único de falha. Bastam alguns dias de ausência para a fila ficar sem dono.`,
      },
      {
        t: `${destaque.assunto} é o assunto que pede pessoa — e é o que mais espera.`,
        d: `Das ${fmt.n(classificadas)} conversas classificadas, ${fmt.n(destaque.v)} são de assistência em viagem: ${fmt.pct(saude.precisaHumanoPct)} delas marcadas como "precisa de humano", e o assunto reúne ${fmt.pct(saude.urgentesPct)} de tudo o que foi marcado urgente. E a crítica é a que mais demora: mediana de ${fmt.dec(AT.medianaCriticaH)} h contra ${fmt.dec(AT.medianaBaixaH)} h da baixa.`,
      },
      {
        t: 'Segunda-feira paga o fim de semana.',
        d: `A mediana de espera de uma baixa dada na segunda é ${horas(seg.h)}; ${nomeDia[menorDia.dia]}, ${horas(menorDia.h)}. Entre meia-noite e 8h ninguém dá baixa. O bot atende 24 horas; a equipe, não.`,
      },
    ],
    naoMede: [
      'A primeira resposta: o relógio só para no clique de baixa.',
      'O que se responde pelo celular: mensagem enviada do aparelho de alguém da equipe não passa pela Torre.',
      `A região da maior parte das conversas: ${fmt.pct(semRegiaoPct)} chegam sem região.`,
    ],
    regua: {
      nota: 'Proposta de leitura do capítulo, não medição do sistema. Só a coluna "hoje" é medida.',
      linhas: [
        { metrica: 'Concentração das baixas', verde: 'ninguém acima de 50%', amarelo: 'acima de 50%', vermelho: 'acima de 80%', hoje: `${fmt.pct(top.pct)} numa conta`, status: status(top.pct, 50, 80) },
        { metrica: 'Espera mediana até a baixa (ontem)', verde: 'até 2 h', amarelo: 'até 8 h', vermelho: 'acima de 8 h', hoje: `${fmt.dec(MEDIANA_ONTEM_H)} h`, status: status(MEDIANA_ONTEM_H, 2, 8) },
        { metrica: 'Conversas críticas esperando agora', verde: 'nenhuma', amarelo: 'até 2', vermelho: '3 ou mais', hoje: `${fmt.n(criticas.esperando)} (média de ${fmt.n(criticas.mediaH)} h)`, status: criticas.esperando >= 3 ? 'vermelho' : criticas.esperando > 0 ? 'amarelo' : 'verde' },
        {
          metrica: 'Baixas entre 22h e 8h',
          verde: 'cobertura noturna',
          amarelo: 'parcial',
          vermelho: 'nenhuma',
          hoje: madrugada === 0 && horaClique[22] === 0 ? `${fmt.n(foraExpediente)}, todas às 23h` : `${fmt.n(foraExpediente)}`,
          status: madrugada === 0 ? 'vermelho' : 'amarelo',
        },
      ],
    },
    p: [44, 46, 51],
  };

  return {
    livro: { atendimento },
    series: {
      baixas_dia: baixasDia,
      baixas_mediana_h_dia: medianaDia,
      baixas_hora_clique: horaClique,
      atendentes_semana: atendentesSemana,
    },
  };
}

export function verificar(saida: SaidaCapitulo, { A, U }: Contexto): string[] {
  const erros = [];
  const { ATENDIMENTO: AT, DATAS, PESSOAS, VOCAB } = A;
  const F = saida.livro.atendimento;
  const S = saida.series;
  const eq = (a, b, texto) => {
    if (a !== b) erros.push(`${texto}: ${a} ≠ ${b}`);
  };
  const dias = U.intervalo(DATAS.inicio, DATAS.fim);
  const ontem = U.somarDias(DATAS.medidoEm, -1);

  // série diária
  eq(S.baixas_dia.length, dias.length, 'baixas_dia: dias');
  eq(U.soma(S.baixas_dia.slice(-30), (p) => p.v), AT.baixas30d, 'baixas_dia: últimos 30 dias × baixas30d');
  eq(F.baixas30d, AT.baixas30d, 'baixas30d');
  S.baixas_dia.forEach((p, i) => eq(p.d, dias[i], 'baixas_dia: calendário'));
  if (!S.baixas_dia.at(-1).parcial) erros.push('baixas_dia: último dia sem parcial');
  eq(F.faixasTotal, U.soma(S.baixas_dia, (p) => p.v), 'faixasTotal × soma de baixas_dia');

  // pessoas
  eq(U.soma(F.pessoas, (p) => p.v), AT.baixas30d, 'pessoas somam baixas30d');
  eq(F.pessoas.length, PESSOAS.atendentes.length, 'pessoas: quantidade');
  eq(F.pessoas[0].nome, AT.umaConta.nome, 'pessoas[0].nome');
  eq(F.pessoas[0].v, AT.umaConta.v, 'pessoas[0].v');
  eq(F.pessoas[0].pct, AT.umaConta.pct, 'pessoas[0].pct');
  F.pessoas.forEach((p) => {
    eq(p.pct, U.pct(p.v, AT.baixas30d), `pct de ${p.nome}`);
    if (!PESSOAS.atendentes.includes(p.nome)) erros.push(`pessoa fora da lista: ${p.nome}`);
  });
  eq(F.kpis[3].v, F.pessoas[0].pct, 'kpi concentração');
  eq(F.contasTorre, AT.contasTorre, 'contasTorre');
  eq(F.contasQueDeramBaixa, AT.contasQueDeramBaixa, 'contasQueDeramBaixa');
  eq(F.contasQueDeramBaixa, F.pessoas.length, 'contas que deram baixa × pessoas');

  // semanas por atendente
  const at = S.atendentes_semana;
  eq(Object.keys(at).join('|'), PESSOAS.atendentes.join('|'), 'atendentes_semana: chaves');
  DATAS.semanas.forEach((s, i) => {
    const doDia = U.soma(S.baixas_dia.filter((p) => U.semanaDe(p.d) === s), (p) => p.v);
    eq(U.soma(Object.values(at), (pts) => pts[i].v), doDia, `atendentes_semana ${s} × baixas_dia`);
    Object.values(at).forEach((pts) => eq(pts[i].d, s, 'atendentes_semana: semana'));
    const lider = Object.entries(at).reduce((m, [nome, pts]) => (!m || pts[i].v > m[1] ? [nome, pts[i].v] : m), null);
    eq(lider[0], AT.umaConta.nome, `líder da semana ${s}`);
  });
  const pts = at[AT.umaConta.nome];
  const pico = pts.reduce((m, p) => (!m || p.v > m.v ? p : m), null);
  eq(F.picoSemanaPrincipal.semana, pico.d, 'picoSemanaPrincipal.semana');
  eq(F.picoSemanaPrincipal.v, pico.v, 'picoSemanaPrincipal.v');
  F.pessoas.forEach((p) => {
    if (U.soma(at[p.nome], (x) => x.v) < p.v) erros.push(`atendentes_semana de ${p.nome} soma menos que os 30 dias`);
  });
  const segunda = at[F.pessoas[1].nome];
  if (segunda[0].v !== 0 || !segunda.some((x) => x.v > 0)) erros.push('a segunda conta deveria entrar depois da primeira semana');

  // pior dia
  const maxBaixa = S.baixas_dia.reduce((m, p) => (!m || p.v > m.v ? p : m), null);
  eq(F.piorDia.dia, maxBaixa.d, 'piorDia é o pico de baixas_dia');
  eq(F.piorDia.baixas, maxBaixa.v, 'piorDia.baixas');
  if (F.piorDia.dia < S.baixas_dia.at(-30).d) erros.push('piorDia fora dos 30 dias');
  const maxMed = S.baixas_mediana_h_dia.reduce((m, p) => (!m || p.h > m.h ? p : m), null);
  eq(maxMed.d, F.piorDia.dia, 'piorDia é a pior mediana');
  eq(maxMed.h, F.piorDia.medianaH, 'piorDia.medianaH');
  if (S.baixas_mediana_h_dia.filter((p) => p.h === maxMed.h).length > 1) erros.push('pior mediana repetida');

  // mediana por dia
  eq(S.baixas_mediana_h_dia.length, dias.length, 'baixas_mediana_h_dia: dias');
  const medOntem = S.baixas_mediana_h_dia.find((p) => p.d === ontem);
  eq(F.kpis[1].v, medOntem.h, 'kpi mediana de ontem');
  eq(F.kpis[0].v, U.soma(S.baixas_dia.filter((p) => p.d >= U.somarDias(ontem, -6) && p.d <= ontem), (p) => p.v), 'kpi baixas de 7 dias');
  const seg = F.medianaDiaSemana.find((x) => x.dia === 'seg');
  eq(seg.h, AT.medianaSegundaH, 'mediana da segunda');
  if (F.medianaDiaSemana.some((x) => x.h > seg.h)) erros.push('segunda não é a maior mediana');
  F.medianaDiaSemana.forEach((x) => {
    const vals = S.baixas_mediana_h_dia.filter((p) => U.diaSemana(p.d) === x.dia).map((p) => p.h);
    eq(mediana(vals), x.h, `mediana das medianas diárias de ${x.dia}`);
  });
  if (S.baixas_mediana_h_dia.some((p) => !(typeof p.h === 'number' && p.h > 0))) erros.push('mediana diária inválida');

  // hora do clique
  const h = S.baixas_hora_clique;
  eq(h.length, 24, 'baixas_hora_clique: 24 horas');
  eq(U.soma(h), AT.baixas30d, 'baixas_hora_clique soma baixas30d');
  if (U.soma(h.slice(0, 9))) erros.push('há baixa entre 0h e 8h');
  eq(F.horaClique.madrugada, U.soma(h.slice(0, 8)), 'horaClique.madrugada');
  eq(F.horaClique.foraExpediente, U.soma(h.slice(0, 8)) + h[22] + h[23], 'horaClique.foraExpediente');

  // faixas
  eq(U.soma(F.faixas, (x) => x.v), F.faixasTotal, 'faixas somam faixasTotal');
  eq(F.ate30minPct, U.pct(F.faixas[0].v + F.faixas[1].v, F.faixasTotal), 'ate30minPct');
  eq(F.mais24hPct, U.pct(F.faixas[4].v, F.faixasTotal), 'mais24hPct');
  const maiorFaixa = F.faixas.reduce((m, x) => (!m || x.v > m.v ? x : m), null);
  eq(maiorFaixa.faixa, '2–24 h', 'maior faixa');

  // urgência
  eq(U.soma(F.urgencia, (u) => u.baixas), AT.baixas30d, 'urgência soma baixas30d');
  eq(F.urgencia.map((u) => u.urgencia).join('|'), 'Crítica|Alta|Média|Baixa|Sem etiqueta', 'rótulos de urgência');
  eq(F.urgencia[0].medianaH, AT.medianaCriticaH, 'mediana da crítica');
  eq(F.urgencia[3].medianaH, AT.medianaBaixaH, 'mediana da baixa');
  eq(F.etiquetaInvertida, U.arred(AT.medianaCriticaH / AT.medianaBaixaH, 1), 'etiquetaInvertida');

  // fila viva
  const crit = F.esperandoAgora.find((x) => x.urgencia === 'Crítica');
  eq(crit.esperando, AT.criticasAgora.esperando, 'críticas esperando');
  eq(crit.mediaH, AT.criticasAgora.mediaH, 'média das críticas');
  eq(crit.maiorH, AT.criticasAgora.maiorH, 'maior espera crítica');
  if (F.esperandoAgora.some((x) => x.maiorH > crit.maiorH || x.mediaH > crit.mediaH)) erros.push('a crítica não é a que mais espera');
  eq(F.kpis[2].v, U.soma(F.esperandoAgora, (x) => x.esperando), 'kpi conversas abertas');

  // assuntos e regiões
  eq(U.soma(F.assuntos, (x) => x.v), F.classificadas, 'assuntos somam classificadas');
  const dest = F.assuntos.filter((x) => x.destaque);
  eq(dest.length, 1, 'um assunto em destaque');
  eq(dest[0].assunto, AT.assuntoDestaque, 'assunto em destaque');
  if (!F.assuntos.some((x) => x.assunto === 'Outros')) erros.push('falta "Outros"');
  if (F.assuntos.some((x) => x.humano > x.v)) erros.push('humano maior que o total do assunto');
  eq(F.saude.pctDoTotal, U.pct(dest[0].v, F.classificadas), 'saude.pctDoTotal');
  eq(F.saude.precisaHumanoPct, U.pct(dest[0].humano, dest[0].v), 'saude.precisaHumanoPct');
  eq(F.saude.urgentesPct, U.pct(F.saude.urgentes, F.saude.urgentesTotal), 'saude.urgentesPct');
  eq(U.soma(F.regioes, (r) => r.v), F.classificadas, 'regiões somam classificadas');
  eq(F.regioes[0].regiao, 'Sem região', 'Sem região primeiro');
  if (F.regioes.slice(1).some((r) => r.v >= F.regioes[0].v)) erros.push('Sem região não domina');
  F.regioes.slice(1).forEach((r, i, l) => {
    if (!VOCAB.regioes.includes(r.regiao)) erros.push(`região fora do vocabulário: ${r.regiao}`);
    if (i && r.v > l[i - 1].v) erros.push('regiões fora de ordem');
  });
  eq(F.regioes.length - 1, VOCAB.regioes.length, 'todas as regiões');
  eq(F.semRegiaoPct, U.pct(F.regioes[0].v, F.classificadas), 'semRegiaoPct');

  // régua
  eq(F.regua.linhas.length, 4, 'linhas da régua');
  return erros;
}
