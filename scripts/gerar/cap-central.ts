import type { Contexto, SaidaCapitulo, Serie } from './tipos.ts';
const EXTENSO = ['nenhum', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];

const LONGO = {
  hoje: 'falou hoje',
  '1–3 d': 'há 1 a 3 dias',
  '3–7 d': 'há 3 a 7 dias',
  '7–14 d': 'há 7 a 14 dias',
  '>14 d': 'há mais de 14 dias',
  nunca: 'nunca falou (sem registro)',
};

function tentar(rng, vezes, gerar, aceitar) {
  let ultimo = null;
  for (let i = 0; i < vezes; i++) {
    ultimo = gerar(i);
    if (aceitar(ultimo)) return ultimo;
  }
  return ultimo;
}

export function gerar({ rng, A, U, capitulos = {} }: Contexto): SaidaCapitulo {
  const { DATAS, CENTRAL, PILOTOS } = A;
  const { fmt, pct, soma, arred, intervalo, somarDias, distribuir, serieDiaria, diaSemana, diasEntre } = U;
  const extenso = (n) => EXTENSO[n] ?? fmt.n(n);

  const FIM = DATAS.fim;
  const INICIO = DATAS.inicio;
  const elosAncora = CENTRAL.capacidade.elos;
  const eloReg = elosAncora[0];
  const eloMsg = elosAncora.find((e) => e.elo === 'Mensagens recebidas por dia');
  const eloCham = elosAncora.find((e) => e.elo === 'Chamados humanos abertos no dia');
  const DIA_DISPARO = eloMsg.quando;
  const DIA_ECO = somarDias(DIA_DISPARO, 1);
  const INICIO_MSG = '2026-10-22';
  const INICIO_FALAS = '2026-11-07';
  const DIA_FALAS_PICO = '2026-11-11';
  const DIA_RECORDE_PILOTOS = A.PASSAGEIROS.recordePilotosDia.dia;
  const DIA_LIMPEZA = '2026-11-10';
  const semana7 = intervalo(somarDias(FIM, -7), somarDias(FIM, -1));
  const somaDias = (serie, dias) => soma(serie.filter((p) => dias.includes(p.d)), (p) => p.v);

  // ------------------------------------------------------------ mensagens recebidas por dia (desde 22/10)
  const diasMsg = intervalo(INICIO_MSG, FIM);
  const totalMsg = 17846;
  const fixosMsg = { [DIA_DISPARO]: eloMsg.teto, [DIA_FALAS_PICO]: 1187, [FIM]: 371 };
  const mensagensDia = tentar(
    rng,
    60,
    () =>
      serieDiaria({
        dias: diasMsg,
        total: totalMsg,
        rng,
        ruido: 0.16,
        fixos: fixosMsg,
        parcial: FIM,
        forma: (d) => {
          const base = { dom: 0.62, 'sáb': 0.78 }[diaSemana(d)] || 1;
          const tendencia = 1.22 - 0.5 * (diasEntre(INICIO_MSG, d) / 23);
          const eco = d === DIA_ECO ? 1.22 : d === '2026-10-23' ? 1.12 : 1;
          return base * tendencia * eco;
        },
      }),
    (s) => Math.max(...s.filter((p) => !(p.d in fixosMsg)).map((p) => p.v)) < fixosMsg[DIA_FALAS_PICO] - 60
  );

  // ------------------------------------------------------------ conversas novas por dia (sessões desde 12/10)
  const diasConv = intervalo(INICIO, FIM);
  const totalConv = 787;
  const fixosConv = { [INICIO]: 12, [DIA_DISPARO]: 197, [DIA_ECO]: 94, '2026-10-31': 68, '2026-11-01': 41, [FIM]: 33 };
  const conversasNovasDia = tentar(
    rng,
    60,
    () =>
      serieDiaria({
        dias: diasConv,
        total: totalConv,
        rng,
        ruido: 0.3,
        fixos: fixosConv,
        parcial: FIM,
        forma: (d) => {
          if (d < DIA_DISPARO) return rng.float() < 0.4 ? 0.001 : 0.09 + (diasEntre(INICIO, d) / 14) * 0.25;
          return 0.8 + (diasEntre(DIA_DISPARO, d) / 19) * 1.1;
        },
      }),
    (s) => Math.max(...s.filter((p) => !(p.d in fixosConv)).map((p) => p.v)) < 56
  );

  // ------------------------------------------------------------ falas por dia (desde 07/11)
  const diasFalas = intervalo(INICIO_FALAS, FIM);
  const fixosFalas = { [DIA_FALAS_PICO]: 846, [DIA_RECORDE_PILOTOS]: 553, [FIM]: 193 };
  const pesoFalas = { '2026-11-07': 0.3, '2026-11-08': 0.85, '2026-11-09': 1.35, '2026-11-10': 1.2, '2026-11-12': 1.05 };
  const falasDia = tentar(
    rng,
    60,
    () => serieDiaria({ dias: diasFalas, total: 2956, rng, ruido: 0.12, fixos: fixosFalas, parcial: FIM, forma: (d) => pesoFalas[d] || 1 }),
    (s) => Math.max(...s.filter((p) => !(p.d in fixosFalas)).map((p) => p.v)) < fixosFalas[DIA_RECORDE_PILOTOS] - 40
  );
  const totalFalas = soma(falasDia, (p) => p.v);

  // ------------------------------------------------------------ chamados humanos
  const diasCh = intervalo(INICIO, FIM);
  const abertos34d = 163;
  const fechadosTotal = abertos34d - CENTRAL.chamadosAbertosAgora; // 134
  const ult2 = { [somarDias(FIM, -1)]: 3, [FIM]: 1 }; // 4 abertos nos dois últimos dias → ≥ 25 parados há mais de 48 h
  const fixosAb = { [DIA_DISPARO]: eloCham.teto, [DIA_ECO]: 19, ...ult2 };
  const formaAb = (d) => {
    if (d < '2026-10-20') return rng.float() < 0.45 ? 0.001 : 0.7;
    if (d <= '2026-10-21') return 2.1;
    if (d < DIA_DISPARO) return 1.1;
    if (d === '2026-10-28') return 3.2;
    if (d <= '2026-10-31') return 1.7;
    if (d <= '2026-11-06') return 1.1;
    return 0.45;
  };
  const abertosDia = tentar(
    rng,
    80,
    () => serieDiaria({ dias: diasCh, total: abertos34d, rng, ruido: 0.45, fixos: fixosAb, parcial: FIM, forma: formaAb }),
    (s) => Math.max(...s.filter((p) => !(p.d in fixosAb)).map((p) => p.v)) <= 16
  );
  const abertoEm = Object.fromEntries(abertosDia.map((p) => [p.d, p.v]));

  const fixosFe = { [DIA_LIMPEZA]: 41, [FIM]: 0 };
  const fechadosDia = tentar(
    rng,
    200,
    () =>
      serieDiaria({
        dias: diasCh,
        total: fechadosTotal,
        rng,
        ruido: 0.55,
        fixos: fixosFe,
        parcial: FIM,
        forma: (d) => {
          const ontem = abertoEm[somarDias(d, -1)] || 0;
          const depois = d > DIA_LIMPEZA ? 0.25 : 1;
          return (0.35 * (abertoEm[d] || 0) + 0.65 * ontem + 0.15) * depois;
        },
      }),
    (s) => {
      let a = 0;
      let f = 0;
      for (const p of s) {
        a += abertoEm[p.d];
        f += p.v;
        if (f > a) return false;
      }
      return Math.max(...s.filter((p) => !(p.d in fixosFe)).map((p) => p.v)) < 20;
    }
  );
  const fechadoEm = Object.fromEntries(fechadosDia.map((p) => [p.d, p.v]));

  const medianaHDia = fechadosDia
    .filter((p) => p.v > 0)
    .map((p) => {
      if (p.d === DIA_LIMPEZA) return { d: p.d, h: 251.4 };
      if (p.d < '2026-10-28') return { d: p.d, h: arred(Math.exp(rng.entre(-2.2, 2.5)), 1) };
      if (p.d < '2026-11-03') return { d: p.d, h: arred(rng.entre(16, 74), 1) };
      return { d: p.d, h: arred(rng.entre(48, 186), 1) };
    });

  // chat dentro dos chamados, por autor
  const chatPiloto = diasCh.map((d) => ({ d, v: abertoEm[d] + Math.round(abertoEm[d] * rng.entre(0.05, 0.55)) + (rng.float() < 0.22 ? rng.int(1, 3) : 0) }));
  const faixaControlador: Record<string, [number, number]> = { '2026-10-21': [1, 2], '2026-10-25': [5, 9], [DIA_DISPARO]: [5, 8], [DIA_ECO]: [15, 19], '2026-10-28': [2, 4], '2026-10-29': [1, 3] };
  const chatControlador = diasCh.map((d) => ({ d, v: faixaControlador[d] ? rng.int(...faixaControlador[d]) : 0 }));
  const chatAdministrador = diasCh.map((d) => ({
    d,
    v: d === DIA_DISPARO ? rng.int(7, 10) : d < '2026-11-01' && abertoEm[d] >= 3 ? Math.round(abertoEm[d] * rng.entre(0.3, 0.8)) : d === somarDias(FIM, -1) ? 1 : 0,
  }));
  const chatBot = diasCh.map((d) => ({
    d,
    v: d >= '2026-11-07' && d <= DIA_FALAS_PICO ? fechadoEm[d] : d < '2026-11-01' && rng.float() < 0.3 ? rng.int(1, 3) : 0,
  }));
  const marcarParcial = (serie) => serie.map((p) => (p.d === FIM ? { ...p, parcial: true } : p));
  const chatAutor = { piloto: marcarParcial(chatPiloto), controlador: marcarParcial(chatControlador), administrador: marcarParcial(chatAdministrador), bot: marcarParcial(chatBot) };
  const chatMensagens = soma(Object.values(chatAutor).flat(), (p) => p.v);

  // ------------------------------------------------------------ números de WhatsApp
  const conversasPorLinha = { linha5: 289, linha6: 243, linha2: 84, linha1: 76, linha4: 52, '(nenhuma)': 43 };
  const ativasPorLinha = { linha6: CENTRAL.conversasVivasLinha6, linha5: 50, linha2: 11, linha1: 7, linha4: 0, '(nenhuma)': 0 };
  const numeros = CENTRAL.linhas
    .map((l) => ({
      numero: l.numero === '(nenhuma)' ? 'sem número registrado' : l.numero,
      conversas: l.numero in conversasPorLinha ? conversasPorLinha[l.numero] : null,
      ativas7d: l.numero in ativasPorLinha ? ativasPorLinha[l.numero] : null,
      passageiros: l.passageiros,
      ...(l.alerta ? { alerta: l.alerta } : {}),
    }))
    .sort((a, b) => (b.conversas ?? -1) - (a.conversas ?? -1));
  const linhaBloqueada = CENTRAL.linhas.find((l) => /bloquead/i.test(l.alerta || ''));
  const linhaSelo = CENTRAL.linhas.find((l) => l.alerta && l !== linhaBloqueada);
  const dataVerificacao = (linhaBloqueada.alerta.match(/\d{2}\/\d{2}/) || ['11/11'])[0];

  // ------------------------------------------------------------ etapas
  const etapas = [
    { etapa: 'MENU — descanso', grupo: 'descanso', v: 352, ativas7d: 151 },
    { etapa: 'LISTA — compromisso', grupo: 'lista', v: 153, ativas7d: 3 },
    { etapa: 'LISTA — contatos', grupo: 'lista', v: 91, ativas7d: 2 },
    { etapa: 'LISTA — formato', grupo: 'lista', v: 54, ativas7d: 4 },
    { etapa: 'LEAD — dados', grupo: 'lead', v: 33, ativas7d: 9 },
    { etapa: 'CADASTRO — nome', grupo: 'cadastro', v: 26, ativas7d: 3 },
    { etapa: 'CADASTRO — compromisso', grupo: 'cadastro', v: 16, ativas7d: 2 },
    { etapa: 'CADASTRO — interesse', grupo: 'cadastro', v: 9, ativas7d: 1 },
    { etapa: 'outras 6 etapas', grupo: 'outras', v: 27, ativas7d: 6 },
  ];
  const somaGrupo = (g) => soma(etapas.filter((e) => e.grupo === g), (e) => e.v);
  const comEtapa = soma(etapas, (e) => e.v);
  const descanso = somaGrupo('descanso');
  const etapasResumo = { comEtapa, descanso, noMeio: comEtapa - descanso, naLista: somaGrupo('lista'), ativas7d: soma(etapas, (e) => e.ativas7d) };

  const nomesFalas = ['LEAD — confirmação', 'MENU — descanso', 'LEAD — dados', 'sem etapa registrada', 'MATERIAL — para quem', 'MATERIAL — kit', 'outras 8 etapas'];
  const partesFalas = distribuir(totalFalas, [55.2, 29.6, 6.6, 1.4, 0.9, 0.7, 5.6]);
  const falasPorEtapa = nomesFalas.map((etapa, i) => ({ etapa, v: partesFalas[i] }));
  const falasConfirmacaoPct = pct(partesFalas[0], totalFalas);

  // ------------------------------------------------------------ pilotos × última fala com o bot
  const ativos = PILOTOS.funil.find((d) => d.id === 'ativos').v;
  const um = capitulos.pilotos && Array.isArray(capitulos.pilotos.ultimaMensagem) ? capitulos.pilotos.ultimaMensagem : null;
  let pilotoFalouBot;
  if (um && um.length) {
    pilotoFalouBot = um.map((x) => ({ faixa: LONGO[x.faixa] || x.faixa, v: x.v, ...(x.vazio ? { vazio: true } : {}) }));
  } else {
    const falaram = [43, 61, 58, 92, 87];
    pilotoFalouBot = [
      ...['falou hoje', 'há 1 a 3 dias', 'há 3 a 7 dias', 'há 7 a 14 dias', 'há mais de 14 dias'].map((faixa, i) => ({ faixa, v: falaram[i] })),
      { faixa: 'nunca falou (sem registro)', v: ativos - soma(falaram), vazio: true },
    ];
  }

  // ------------------------------------------------------------ totais derivados
  const totalMensagens = soma(mensagensDia, (p) => p.v);
  const totalConversas = soma(conversasNovasDia, (p) => p.v);
  const msg7 = somaDias(mensagensDia, semana7);
  const conv7 = somaDias(conversasNovasDia, semana7);
  const completosMsg = mensagensDia.filter((p) => !p.parcial).map((p) => p.v).sort((a, b) => a - b);
  const meio = Math.floor(completosMsg.length / 2);
  const medianaMsg = completosMsg.length % 2 ? completosMsg[meio] : Math.round((completosMsg[meio - 1] + completosMsg[meio]) / 2);
  const convDisparo = conversasNovasDia.find((p) => p.d === DIA_DISPARO).v;
  const convEco = conversasNovasDia.find((p) => p.d === DIA_ECO).v;
  const falasPico = { dia: DIA_FALAS_PICO, v: fixosFalas[DIA_FALAS_PICO], telefones: 57 };
  const falasRecorde = { v: fixosFalas[DIA_RECORDE_PILOTOS], telefones: 71 };

  const tempoAteFechar = [
    { faixa: '≤1 h', v: 39 },
    { faixa: '1–4 h', v: 17 },
    { faixa: '4–24 h', v: 14 },
    { faixa: '1–3 d', v: 21 },
    { faixa: '>3 d', v: 43, alerta: true },
  ];
  const tipos = [
    { tipo: 'Material', estado: 'fechado', total: 75, abertosHoje: null },
    { tipo: 'Admin', estado: 'fechado', total: 53, abertosHoje: null },
    { tipo: 'Demanda', estado: 'aberto', total: 13, abertosHoje: 13 },
    { tipo: 'Admin', estado: 'aberto', total: 11, abertosHoje: 11 },
    { tipo: 'Demanda', estado: 'fechado', total: 6, abertosHoje: null },
    { tipo: 'Endereço', estado: 'aberto', total: 3, abertosHoje: 3 },
    { tipo: 'Material', estado: 'aberto', total: 2, abertosHoje: 2 },
  ];
  const semDonoAutomatico = soma(tipos.filter((t) => t.estado === 'aberto' && /^(demanda|controlador|admin)$/i.test(t.tipo)), (t) => t.total);
  const abertosAgora = CENTRAL.chamadosAbertosAgora;
  const parados = CENTRAL.chamadosParados48h;

  // ------------------------------------------------------------ capacidade
  const cenarios = [...CENTRAL.capacidade.cenarios];
  const elos = elosAncora.map((e) => {
    const abaixo = e.teto < e.exige[0];
    return {
      elo: e.elo,
      teto: e.teto,
      quando: fmt.data(e.quando),
      exige: [...e.exige],
      situacao: abaixo ? `${fmt.dec(e.exige[0] / e.teto, 1)}× abaixo do menor` : e.teto >= e.exige[e.exige.length - 1] ? 'aguenta os três' : 'aguenta o menor',
      abaixo,
    };
  });
  const abaixoN = elos.filter((e) => e.abaixo).length;
  const verdes = elos.filter((e) => !e.abaixo);
  const xReg = eloReg.exige[0] / eloReg.teto;
  const xMsg = eloMsg.exige[0] / eloMsg.teto;
  const capacidade = {
    premissa: `Exigência diária = resultado × 0,8 ÷ 7 dias: a última semana carregaria 80% do resultado. O 20/80 é hipótese do gestor, não medição. "Teto provado" é o maior dia já registrado — aconteceu uma vez, não virou rotina.`,
    cenarios,
    elos,
    leitura: `Dos ${extenso(elos.length)} elos, ${extenso(abaixoN)} ficam abaixo do que o cenário mais baixo pede por dia.${verdes.length === 1 ? ` O único que aguenta é o estoque de convites — papel.` : ''} Nenhum cenário de ${cenarios[0]} se sustenta sem multiplicar por ${fmt.dec(xReg, 1)} a entrada diária de cadastros.`,
    numeroParaAMesa: `O número para levar à mesa é ${fmt.n(eloReg.teto)}: o que a operação conseguiu uma vez, num único dia (${fmt.data(eloReg.quando)}).`,
  };

  // ------------------------------------------------------------ régua da Fase B
  const alvoHora = Math.round(eloReg.exige[0] / 10);
  const metadeHora = Math.round(alvoHora / 2);
  const hora = (capitulos.passageiros && capitulos.passageiros.horaMaisCheia) || { v: 104, quando: '04/11, 15h' };
  const statusHora = hora.v >= alvoHora ? 'verde' : hora.v >= metadeHora ? 'amarelo' : 'vermelho';
  const reguaFaseB = {
    nota: 'Proposta, não medição: os limites de fila e de falha ainda precisam ser combinados com o gestor.',
    linhas: [
      { metrica: 'Registros por hora (pico)', verde: `≥ ${fmt.n(alvoHora)}/h`, amarelo: `${fmt.n(metadeHora)} a ${fmt.n(alvoHora)}`, vermelho: `< ${fmt.n(metadeHora)}`, hoje: `${fmt.n(hora.v)}/h`, hojeNota: `${hora.quando} — alvo ${fmt.n(alvoHora)}/h = ${fmt.n(eloReg.exige[0])} ÷ 10 h úteis`, status: statusHora },
      { metrica: 'Fila do bot: minutos entre chegar e responder', verde: '≤ 3 min', amarelo: '3 a 10', vermelho: '> 10', hoje: null, hojeNota: 'não medido — falta o carimbo da resposta', status: 'nao-medido' },
      { metrica: 'Falhas de entrega da Meta', verde: '< 1%', amarelo: '1 a 2,5%', vermelho: '> 2,5%', hoje: null, hojeNota: 'não medido — o dado não chega ao banco', status: 'nao-medido' },
      { metrica: 'Chamados abertos há mais de 2 h', verde: '0', amarelo: '1 a 4', vermelho: '> 4', hoje: `≥ ${fmt.n(parados)}`, hojeNota: `dos ${fmt.n(abertosAgora)} abertos, passaram de 48 h`, status: parados > 4 ? 'vermelho' : parados > 0 ? 'amarelo' : 'verde' },
    ],
  };

  // ------------------------------------------------------------ textos
  const pctLinha6 = linhaBloqueada.pct;
  const tf1 = tempoAteFechar[0].v;
  const tf3 = tempoAteFechar[tempoAteFechar.length - 1].v;
  const livro = {
    central: {
      letra: 'D',
      titulo: 'Central: bot, chamados e capacidade',
      pergunta: 'Até onde o sistema aguenta — e em que ponto ele já transborda.',
      frase: `O gargalo não é o software: num único dia o bot recebeu ${fmt.n(eloMsg.teto)} mensagens e não caiu. A Central esbarra em duas coisas que código nenhum resolve — gente para atender o que o bot não resolve e um número que responde por mais da metade dos leads e, pela verificação de ${dataVerificacao}, está bloqueado por pagamento (responde dentro da janela de 24 h, mas não abre conversa).`,
      kpis: [
        { v: msg7, rotulo: `mensagens recebidas nos 7 dias completos (${fmt.data(semana7[0]).slice(0, 2)} a ${fmt.data(semana7[6])})` },
        { v: conv7, rotulo: 'conversas novas no bot nos mesmos 7 dias' },
        { v: abertosAgora, rotulo: 'chamados humanos abertos agora, esperando alguém' },
        { v: linhaBloqueada.passageiros, rotulo: `leads ligados ao número ${linhaBloqueada.numero} (${fmt.pct(pctLinha6)} do total)` },
      ],
      datasNota: `As mensagens recebidas só são guardadas desde ${fmt.data(INICIO_MSG)}; antes disso já havia conversa (sessões desde ${fmt.data(INICIO)}), mas nada ficava gravado. As falas só existem desde ${fmt.data(INICIO_FALAS)}.`,
      pecas: [
        { peca: 'Mensagem recebida', e: 'cada mensagem que a Meta entrega à Central', naoE: 'não inclui as respostas do bot, que não são guardadas', registrado: totalMensagens, desde: fmt.data(INICIO_MSG) },
        { peca: 'Conversa (sessão)', e: 'um telefone falando com um número, parado numa etapa do roteiro', naoE: 'não é uma pessoa: o mesmo telefone em outro número abre outra conversa', registrado: totalConversas, desde: fmt.data(INICIO) },
        { peca: 'Fala', e: 'o texto escrito pela pessoa, junto da etapa em que ela estava', naoE: `não existe antes de ${fmt.data(INICIO_FALAS)}`, registrado: totalFalas, desde: fmt.data(INICIO_FALAS) },
        { peca: 'Chamado', e: 'pedido de ajuda humana feito ao admin', naoE: 'não é o atendimento em si, que acontece fora do sistema', registrado: abertos34d, desde: fmt.data(INICIO) },
      ],
      pilotoFalouBot,
      mensagens: { mediana24dias: medianaMsg, mediaUltimaSemana: Math.round(msg7 / 7), pico: { v: eloMsg.teto, dia: DIA_DISPARO } },
      conversasNovasPico: [
        { dia: DIA_DISPARO, v: convDisparo },
        { dia: DIA_ECO, v: convEco },
      ],
      falas: { total: totalFalas, pico: falasPico, diaRecordePilotos: falasRecorde },
      etapas,
      etapasResumo,
      falasPorEtapa,
      falasConfirmacaoPct,
      numeros,
      conversasVivasSemana: CENTRAL.conversasVivasSemana,
      numerosCuidado: `O número ao lado da pessoa é o que ele usa hoje, não o canal por onde o cadastro entrou. A leitura segura é "o ${linhaBloqueada.numero} concentra a base viva"; "o ${linhaBloqueada.numero} produziu esses ${fmt.n(linhaBloqueada.passageiros)} cadastros" é leitura errada.`,
      chamados: {
        abertos34d,
        fechados: fechadosTotal,
        abertosAgora,
        recordeDia: { v: eloCham.teto, dia: eloCham.quando },
        limpezaFila: { fechamentos: fixosFe[DIA_LIMPEZA], medianaH: Math.round(medianaHDia.find((m) => m.d === DIA_LIMPEZA).h) },
        tempoAteFechar,
        tipos,
        paradosMais48h: parados,
        semDonoAutomatico,
        chatMensagens,
        leitura: `${fmt.n(eloCham.teto)} chamados num dia é o volume humano que já se viu; qualquer plano que gere mais do que isso precisa de gente antes, não depois.`,
      },
      capacidade,
      ensaioDisparo: {
        medido: { mensagens: eloMsg.teto, conversasNovas: convDisparo, chamados: eloCham.teto },
        memoria: 'Foram disparadas entre 1,1 e 1,2 mil mensagens; 287 pessoas responderam; 93 viraram pessoa em 3 dias; 41 cadastraram alguém; o grupo reuniu 861 leads em 3 semanas.',
        cuidado: `Nada liga as ${fmt.n(convDisparo)} conversas novas do dia aos destinatários do disparo: a data coincide, mas a prova não existe.`,
      },
      muda: [
        {
          t: 'O canal com mais da metade dos leads não consegue abrir conversa.',
          d: `O ${linhaBloqueada.numero} está ligado a ${fmt.pct(pctLinha6)} dos leads e reúne ${fmt.n(CENTRAL.conversasVivasLinha6)} das ${fmt.n(CENTRAL.conversasVivasSemana)} conversas vivas da semana. A última verificação (${dataVerificacao}, sem conferência hoje) aponta bloqueio por pagamento. Resolver leva horas, não semanas, e libera o canal de maior volume.`,
        },
        {
          t: 'A Central nunca foi testada sob surto.',
          d: `O maior dia de mensagens (${fmt.n(eloMsg.teto)}, em ${fmt.data(DIA_DISPARO)}) fica ${fmt.dec(xMsg, 1)} vezes abaixo do que o cenário de ${cenarios[0]} pede por dia. O simulado mede capacidade — captura, não.`,
        },
        {
          t: 'A desistência tem lugar certo: a lista de convidados.',
          d: `Das ${fmt.n(comEtapa)} conversas com etapa registrada, ${fmt.n(descanso)} descansam no menu e ${fmt.n(etapasResumo.naLista)} travaram no meio da lista. É roteiro, não servidor.`,
        },
        {
          t: 'Chamado humano ou fecha na hora ou fica esquecido.',
          d: `${fmt.n(tf1)} chamados fecharam em até 1 hora; ${fmt.n(tf3)} passaram de 3 dias. Dos ${fmt.n(abertosAgora)} abertos agora, pelo menos ${fmt.n(parados)} já têm mais de 48 h.`,
        },
      ],
      acoes: [
        { ordem: 1, acao: `Abrir hoje o painel da Meta e conferir a situação das contas ${linhaBloqueada.numero} e ${linhaSelo.numero}.`, porque: `A informação disponível é da verificação de ${dataVerificacao}. Se o bloqueio for real, é o problema mais caro da lista e o mais barato de resolver.` },
        { ordem: 2, acao: `Pôr um responsável nos ${fmt.n(semDonoAutomatico)} chamados abertos de demanda e de admin.`, porque: `Nenhum deles tem fluxo automático, e ao menos ${fmt.n(parados)} dos ${fmt.n(abertosAgora)} abertos passaram de 48 h.` },
        { ordem: 3, acao: 'Encurtar a etapa da lista de convidados.', porque: `${fmt.n(etapasResumo.naLista)} conversas travaram ali — mais do que todas as outras etapas do meio do caminho somadas.` },
        { ordem: 4, acao: 'Ligar os carimbos da régua da Fase B antes de subir o volume.', porque: 'Para enxergar a Central engasgando antes do Dia D, e não durante.' },
      ],
      naoMede: [
        'Tempo de resposta do bot: existe o carimbo de chegada, mas não o de resposta.',
        'Limites da Meta: faixa de qualidade, teto diário de conversas iniciadas e taxa de falha ficam só no painel da Meta.',
        `O disparo de ${fmt.data(DIA_DISPARO)}: nem os destinatários nem o envio ficaram gravados.`,
        'O que o bot manda: só a mensagem recebida é guardada.',
      ],
      reguaFaseB,
      p: [28, 33],
    },
  };

  return {
    livro,
    series: {
      mensagens_dia: mensagensDia,
      conversas_novas_dia: conversasNovasDia,
      falas_dia: falasDia,
      chamados_abertos_dia: abertosDia,
      chamados_fechados_dia: fechadosDia,
      chamados_mediana_h_dia: medianaHDia,
      chat_chamado_autor_dia: chatAutor,
    },
  };
}

export function verificar(saida: SaidaCapitulo, { A, U, capitulos = {} }: Contexto): string[] {
  const erros = [];
  const { soma, pct, fmt, somarDias, intervalo } = U;
  const { CENTRAL, DATAS, PILOTOS } = A;
  const C = saida.livro.central;
  const S = saida.series;
  const tot = (s) => soma(s, (p) => p.v);
  const checar = (ok, texto) => {
    if (!ok) erros.push(texto);
  };
  const picoUnico = (serie, dia, v, nome) => {
    const p = serie.find((x) => x.d === dia);
    checar(p && p.v === v, `${nome}: ${dia} deveria valer ${v} (vale ${p && p.v})`);
    checar(serie.every((x) => x.d === dia || x.v < v), `${nome}: há dia que empata ou passa o pico de ${dia}`);
  };
  const elos = CENTRAL.capacidade.elos;
  const eloMsg = elos.find((e) => e.elo === 'Mensagens recebidas por dia');
  const eloCham = elos.find((e) => e.elo === 'Chamados humanos abertos no dia');

  // séries e datas
  checar(S.mensagens_dia[0].d === '2026-10-22', 'mensagens_dia deveria começar em 22/10');
  checar(S.falas_dia[0].d === '2026-11-07', 'falas_dia deveria começar em 07/11');
  checar(S.conversas_novas_dia[0].d === DATAS.inicio && S.chamados_abertos_dia[0].d === DATAS.inicio, 'conversas e chamados deveriam começar em 12/10');
  for (const [nome, s] of Object.entries(S)) {
    const lista: Serie[] = Array.isArray(s) ? [s] : (Object.values(s) as Serie[]);
    for (const serie of lista) {
      if (nome === 'chamados_mediana_h_dia') continue;
      checar(serie[serie.length - 1].d === DATAS.fim, `${nome}: deveria terminar em ${DATAS.fim}`);
      checar(serie.every((p) => (p.d === DATAS.fim) === Boolean(p.parcial)), `${nome}: só o dia ${DATAS.fim} é parcial`);
    }
  }
  picoUnico(S.mensagens_dia, eloMsg.quando, eloMsg.teto, 'mensagens_dia');
  picoUnico(S.conversas_novas_dia, eloMsg.quando, C.conversasNovasPico[0].v, 'conversas_novas_dia');
  picoUnico(S.chamados_abertos_dia, eloCham.quando, eloCham.teto, 'chamados_abertos_dia');
  picoUnico(S.falas_dia, C.falas.pico.dia, C.falas.pico.v, 'falas_dia');

  // peças
  const peca = (nome) => C.pecas.find((p) => p.peca === nome);
  checar(peca('Mensagem recebida').registrado === tot(S.mensagens_dia), 'peça mensagem ≠ soma de mensagens_dia');
  checar(peca('Conversa (sessão)').registrado === tot(S.conversas_novas_dia), 'peça conversa ≠ soma de conversas_novas_dia');
  checar(peca('Fala').registrado === tot(S.falas_dia) && C.falas.total === tot(S.falas_dia), 'falas: total ≠ soma da série');
  checar(peca('Chamado').registrado === C.chamados.abertos34d, 'peça chamado ≠ abertos34d');
  checar(soma(C.falasPorEtapa, (e) => e.v) === C.falas.total, 'falasPorEtapa não soma o total de falas');
  checar(C.falasConfirmacaoPct === pct(C.falasPorEtapa[0].v, C.falas.total), 'falasConfirmacaoPct não bate');
  const pRec = S.falas_dia.find((p) => p.d === A.PASSAGEIROS.recordePilotosDia.dia);
  checar(pRec && pRec.v === C.falas.diaRecordePilotos.v, 'diaRecordePilotos ≠ falas do dia do recorde de pessoas');

  // KPIs
  const semana7 = intervalo(somarDias(DATAS.fim, -7), somarDias(DATAS.fim, -1));
  const noPeriodo = (s) => soma(s.filter((p) => semana7.includes(p.d)), (p) => p.v);
  checar(C.kpis[0].v === noPeriodo(S.mensagens_dia), 'kpi de mensagens em 7 dias não bate');
  checar(C.kpis[1].v === noPeriodo(S.conversas_novas_dia), 'kpi de conversas em 7 dias não bate');
  checar(C.kpis[2].v === CENTRAL.chamadosAbertosAgora, 'kpi de chamados abertos ≠ âncora');
  const l6 = CENTRAL.linhas.find((l) => /bloquead/i.test(l.alerta || ''));
  checar(C.kpis[3].v === l6.passageiros, 'kpi do número bloqueado ≠ âncora');
  checar(C.mensagens.mediaUltimaSemana === Math.round(C.kpis[0].v / 7), 'média da última semana ≠ kpi ÷ 7');
  checar(C.mensagens.pico.v === eloMsg.teto && C.mensagens.pico.dia === eloMsg.quando, 'pico de mensagens ≠ âncora');

  // números de WhatsApp
  checar(soma(C.numeros, (n) => n.conversas || 0) === tot(S.conversas_novas_dia), 'conversas por número não somam a série');
  checar(soma(C.numeros, (n) => n.ativas7d || 0) === CENTRAL.conversasVivasSemana && C.conversasVivasSemana === CENTRAL.conversasVivasSemana, 'ativas7d não soma as conversas vivas da semana');
  const n6 = C.numeros.find((n) => n.numero === l6.numero);
  checar(n6 && n6.ativas7d === CENTRAL.conversasVivasLinha6 && n6.alerta === l6.alerta, 'linha6: ativas ou alerta ≠ âncora');
  for (const l of CENTRAL.linhas) {
    const n = C.numeros.find((x) => x.numero === (l.numero === '(nenhuma)' ? 'sem número registrado' : l.numero));
    checar(n && n.passageiros === l.passageiros && (n.alerta || null) === (l.alerta || null), `número ${l.numero}: leads ou alerta ≠ âncora`);
  }

  // etapas
  const er = C.etapasResumo;
  checar(er.comEtapa === CENTRAL.conversasComEtapa && soma(C.etapas, (e) => e.v) === er.comEtapa, 'etapas não somam 761');
  checar(er.naLista === CENTRAL.paradasNaLista && soma(C.etapas.filter((e) => e.grupo === 'lista'), (e) => e.v) === er.naLista, 'lista de convidados ≠ 298');
  checar(er.noMeio === er.comEtapa - er.descanso, 'noMeio ≠ comEtapa − descanso');
  checar(er.ativas7d === soma(C.etapas, (e) => e.ativas7d), 'ativas7d das etapas não somam o resumo');
  checar(er.naLista > er.noMeio - er.naLista, 'a lista deveria ser maior que as outras etapas do meio juntas');
  checar(C.etapasResumo.comEtapa < tot(S.conversas_novas_dia), 'conversas com etapa deveriam ser menos que as conversas');

  // chamados
  const ch = C.chamados;
  checar(tot(S.chamados_abertos_dia) === ch.abertos34d, 'chamados_abertos_dia não soma abertos34d');
  checar(tot(S.chamados_fechados_dia) === ch.fechados, 'chamados_fechados_dia não soma fechados');
  checar(ch.abertos34d - ch.fechados === ch.abertosAgora && ch.abertosAgora === CENTRAL.chamadosAbertosAgora, 'abertos − fechados ≠ abertos agora');
  checar(ch.paradosMais48h === CENTRAL.chamadosParados48h, 'parados há 48 h ≠ âncora');
  checar(ch.abertosAgora - tot(S.chamados_abertos_dia.slice(-2)) === ch.paradosMais48h, 'abertos agora − abertos nos 2 últimos dias ≠ parados há 48 h');
  checar(ch.recordeDia.v === eloCham.teto && ch.recordeDia.dia === eloCham.quando, 'recorde de chamados ≠ âncora');
  checar(soma(ch.tempoAteFechar, (x) => x.v) === ch.fechados, 'tempoAteFechar não soma os fechados');
  checar(soma(ch.tipos, (t) => t.total) === ch.abertos34d, 'tipos não somam abertos34d');
  checar(soma(ch.tipos.filter((t) => t.estado === 'aberto'), (t) => t.abertosHoje) === ch.abertosAgora, 'tipos abertos não somam abertos agora');
  checar(soma(ch.tipos.filter((t) => t.estado === 'aberto' && /^(demanda|controlador|admin)$/i.test(t.tipo)), (t) => t.total) === ch.semDonoAutomatico, 'semDonoAutomatico não bate');
  let acA = 0;
  let acF = 0;
  S.chamados_abertos_dia.forEach((p, i) => {
    acA += p.v;
    acF += S.chamados_fechados_dia[i].v;
    if (acF > acA) erros.push(`em ${p.d} há mais chamados fechados que abertos no acumulado`);
  });
  const maxFe = Math.max(...S.chamados_fechados_dia.map((p) => p.v));
  const diaLimpeza = S.chamados_fechados_dia.find((p) => p.v === maxFe).d;
  checar(maxFe === ch.limpezaFila.fechamentos, 'limpezaFila ≠ maior dia de fechados');
  const med = S.chamados_mediana_h_dia.find((m) => m.d === diaLimpeza);
  checar(med && Math.round(med.h) === ch.limpezaFila.medianaH, 'mediana da limpeza ≠ série');
  checar(S.chamados_mediana_h_dia.every((m) => S.chamados_fechados_dia.find((p) => p.d === m.d).v > 0), 'mediana em dia sem fechamento');
  const autores = S.chat_chamado_autor_dia;
  checar(soma((Object.values(autores) as Serie[]).flat(), (p) => p.v) === ch.chatMensagens, 'chatMensagens ≠ soma do chat');
  const maxBot = Math.max(...autores.bot.map((p) => p.v));
  checar(autores.bot.find((p) => p.v === maxBot).d === diaLimpeza && maxBot === maxFe, 'pico do bot no chat deveria cair no dia da limpeza, com o mesmo valor');

  // disparo
  const e = C.ensaioDisparo.medido;
  checar(e.mensagens === eloMsg.teto && e.chamados === eloCham.teto && e.conversasNovas === S.conversas_novas_dia.find((p) => p.d === eloMsg.quando).v, 'ensaioDisparo.medido ≠ séries');

  // capacidade
  checar(JSON.stringify(C.capacidade.cenarios) === JSON.stringify(CENTRAL.capacidade.cenarios), 'cenários ≠ âncora');
  elos.forEach((a, i) => {
    const b = C.capacidade.elos[i];
    checar(b && b.elo === a.elo && b.teto === a.teto && b.quando === fmt.data(a.quando) && JSON.stringify(b.exige) === JSON.stringify(a.exige), `elo ${a.elo} ≠ âncora`);
    checar(b && b.abaixo === a.teto < a.exige[0], `elo ${a.elo}: abaixo errado`);
  });
  [25000, 50000, 90000].forEach((r, i) => checar(elos[0].exige[i] === Math.round((r * 0.8) / 7), `exigência de leads do cenário ${i} ≠ resultado × 0,8 ÷ 7`));
  checar(!/100 mil|100\.000/.test(JSON.stringify(C)), 'texto ainda fala de 100 mil');
  const r0 = C.reguaFaseB.linhas[0];
  checar(r0.metrica === 'Registros por hora (pico)' && r0.verde === `≥ ${fmt.n(Math.round(elos[0].exige[0] / 10))}/h`, 'régua: alvo por hora ≠ 2.857 ÷ 10');

  // pilotos × bot
  const ativos = PILOTOS.funil.find((d) => d.id === 'ativos').v;
  checar(soma(C.pilotoFalouBot, (x) => x.v) === ativos, 'pilotoFalouBot não soma as pessoas ativas');
  const um = capitulos.pilotos && capitulos.pilotos.ultimaMensagem;
  if (Array.isArray(um) && um.length) {
    checar(um.length === C.pilotoFalouBot.length && um.every((x, i) => x.v === C.pilotoFalouBot[i].v), 'pilotoFalouBot ≠ pessoas.ultimaMensagem');
  }
  return erros;
}
