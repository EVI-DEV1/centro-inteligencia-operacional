// Capítulo F (parte 2) · Alcance: redes do clube, comentários, acervo e a coleta que parou.
// Séries geradas primeiro; todo número de texto sai delas ou das âncoras.
import type { Contexto, SaidaCapitulo } from './tipos.ts';

function forcarPico(valores, chave) {
  const chaves = Object.keys(valores);
  const maior = chaves.reduce((a, k) => (valores[k] > valores[a] ? k : a), chaves[0]);
  if (maior !== chave) [valores[maior], valores[chave]] = [valores[chave], valores[maior]];
  return valores;
}

const maxPor = (serie, pegar = (p) => p.v) => serie.reduce((a, p) => (pegar(p) > pegar(a) ? p : a), serie[0]);
const minPor = (serie, pegar = (p) => p.v) => serie.reduce((a, p) => (pegar(p) < pegar(a) ? p : a), serie[0]);

export function gerar({ rng, A, U }: Contexto): SaidaCapitulo {
  const { fmt, pct, arred, soma, somarDias, diasEntre, intervalo, distribuir, semanaDe } = U;
  const AL = A.ALCANCE;
  const FIM = AL.ultimaColeta;
  const diasParada = Math.floor(AL.coletaParadaDias);

  // ---------------------------------------------------------------- calendário das redes
  const semanaFim = semanaDe(FIM);
  const semanas = Array.from({ length: 10 }, (_, i) => somarDias(semanaFim, 7 * (i - 9)));
  const SEM_SORTEIO = semanas[5];
  const DIA_SORTEIO = somarDias(SEM_SORTEIO, 2);
  const DIA_PICO = somarDias(DIA_SORTEIO, 1);
  const SEM_MAIS_POSTS = semanas[8];
  const ULTIMA_COMPLETA = semanas[8];

  // ---------------------------------------------------------------- seguidores no Instagram (35 dias)
  const igDias = intervalo(somarDias(FIM, -34), FIM);
  const igPicoDia = somarDias(FIM, -9);
  const perda = rng.int(151, 198);
  const igPicoV = AL.seguidoresInstagram + perda;
  const igIni = igPicoV - rng.int(11350, 12450);
  const ateOPico = igDias.filter((d) => d <= igPicoDia);
  const pesoCresc = (d) => (d >= DIA_SORTEIO && d <= somarDias(DIA_SORTEIO, 3) ? 3.2 : d > somarDias(DIA_SORTEIO, 3) && d <= somarDias(DIA_SORTEIO, 13) ? 1.5 : d > somarDias(DIA_SORTEIO, 13) ? 0.55 : 1);
  const incs = distribuir(igPicoV - igIni, ateOPico.slice(1).map((d) => pesoCresc(d) * rng.ruido(0.3)), 1);
  const igValores = [igIni];
  incs.forEach((x) => igValores.push(igValores.at(-1) + x));
  const depoisDoPico = igDias.filter((d) => d > igPicoDia);
  const quedas = distribuir(perda, depoisDoPico.map(() => rng.ruido(0.6)), 0);
  let atual = igPicoV;
  depoisDoPico.forEach((d, i) => {
    atual -= quedas[i];
    const ultimo = i === depoisDoPico.length - 1;
    igValores.push(ultimo ? AL.seguidoresInstagram : Math.min(igPicoV - 1, atual + rng.int(-6, 6)));
  });
  const seguidoresInstagram = igDias.map((d, i) => ({ d, v: igValores[i] }));

  // ---------------------------------------------------------------- seguidores no Facebook (64 dias, com um salto numa semana)
  const fbDias = intervalo(somarDias(FIM, -63), FIM);
  const saltoDe = somarDias(DIA_SORTEIO, -6);
  const saltoAte = somarDias(saltoDe, 7);
  const fbIni = rng.int(95200, 98800);
  const fbInc = rng.int(40600, 43900);
  const saltoV = rng.int(17700, 20300);
  const noSalto = (d) => d > saltoDe && d <= saltoAte;
  const diasSalto = fbDias.slice(1).filter(noSalto);
  const diasFora = fbDias.slice(1).filter((d) => !noSalto(d));
  const incSalto = distribuir(saltoV, diasSalto.map((_, i) => [0.8, 1.3, 1.6, 1.4, 1.1, 0.9, 0.9][i] * rng.ruido(0.15)), 1);
  const incFora = distribuir(
    fbInc - saltoV,
    diasFora.map((d) => {
      if (d <= saltoDe) return (0.75 + (0.35 * diasEntre(fbDias[0], d)) / 27) * rng.ruido(0.3);
      return Math.max(0.8, 1.9 - diasEntre(saltoAte, d) / 25) * rng.ruido(0.3);
    }),
    0
  );
  const incFb = Object.fromEntries([...diasSalto.map((d, i) => [d, incSalto[i]]), ...diasFora.map((d, i) => [d, incFora[i]])]);
  let fbAtual = fbIni;
  const seguidoresFacebook = fbDias.map((d, i) => ({ d, v: i === 0 ? fbIni : (fbAtual += incFb[d]) }));

  // ---------------------------------------------------------------- alcance semanal (conta) e diário
  const faixasConta: [number, number][] = [[1318000, 1452000], [574000, 646000], [642000, 718000], [491000, 543000], [387000, 426000], [1583000, 1687000], [783000, 857000], [263000, 304000]];
  const conta: Record<string, number> = {};
  semanas.slice(0, 8).forEach((s, i) => (conta[s] = rng.int(...faixasConta[i])));
  conta[ULTIMA_COMPLETA] = AL.alcanceSemanaInstagram;

  const formas = [
    [1.9, 1.0, 1.05, 1.2, 0.95, 0.9],
    [0.45, 0.75, 2.1, 3.3, 2.5, 0.9, 0.6],
    [1.25, 1.55, 1.05, 0.7, 0.8, 1.3, 1.2],
    [1.9, 1.35, 1.15, 0.8, 0.55, 0.5, 0.5],
    [0.6, 0.85, 1.0, 1.1, 0.8, 1.45, 2.2],
    [1.4, 2.0, 1.2, 1.0],
  ];
  const alc = {};
  const totalAberta = rng.int(86200, 98700);
  const blocos = [
    { semana: semanas[4], dias: intervalo(somarDias(semanas[4], 1), somarDias(semanas[4], 6)), total: conta[semanas[4]] - Math.round(conta[semanas[4]] * rng.entre(0.13, 0.16)), forma: formas[0] },
    { semana: semanas[5], dias: intervalo(semanas[5], somarDias(semanas[5], 6)), total: conta[semanas[5]], forma: formas[1], pico: DIA_PICO },
    { semana: semanas[6], dias: intervalo(semanas[6], somarDias(semanas[6], 6)), total: conta[semanas[6]], forma: formas[2] },
    { semana: semanas[7], dias: intervalo(semanas[7], somarDias(semanas[7], 6)), total: conta[semanas[7]], forma: formas[3] },
    { semana: semanas[8], dias: intervalo(semanas[8], somarDias(semanas[8], 6)), total: conta[semanas[8]], forma: formas[4] },
    { semana: semanas[9], dias: intervalo(semanas[9], FIM), total: totalAberta, forma: formas[5], pico: somarDias(semanas[9], 1) },
  ];
  for (const b of blocos) {
    const partes = distribuir(b.total, b.dias.map((_, i) => b.forma[i] * rng.ruido(0.1)), 1);
    const vals = Object.fromEntries(b.dias.map((d, i) => [d, partes[i]]));
    if (b.pico) forcarPico(vals, b.pico);
    Object.assign(alc, vals);
  }
  conta[semanas[9]] = totalAberta;
  const alcDias = Object.keys(alc).sort();
  const alcanceDia = alcDias.map((d) => ({ d, v: alc[d] }));

  // soma do alcance dos posts por semana e o post do sorteio
  const postsAlc = {};
  semanas.slice(0, 8).forEach((s, i) => (postsAlc[s] = Math.round(conta[s] * (i === 5 ? rng.entre(1.1, 1.17) : rng.entre(0.66, 0.8)))));
  postsAlc[semanas[8]] = Math.round(conta[semanas[8]] * rng.entre(0.84, 0.9));
  postsAlc[semanas[9]] = Math.round(conta[semanas[9]] * rng.entre(0.3, 0.42));
  const postSorteioV = Math.round(postsAlc[SEM_SORTEIO] * rng.entre(0.54, 0.58));

  const nPosts = [rng.int(68, 79), rng.int(60, 72), rng.int(66, 77), rng.int(63, 74), rng.int(64, 75), rng.int(80, 86), rng.int(74, 81), rng.int(75, 83)];
  nPosts.push(Math.max(...nPosts) + rng.int(4, 9));
  nPosts.push(rng.int(33, 41));
  const storiesMaisPosts = rng.int(84, 93);

  // ---------------------------------------------------------------- Instagram dia a dia
  const n = alcDias.length;
  const interV = Object.fromEntries(alcDias.map((d, i) => [d, Math.round(alc[d] * (0.21 - (0.15 * i) / (n - 1)) * rng.ruido(0.15))]));
  forcarPico(interV, DIA_PICO);
  const contasV = Object.fromEntries(alcDias.map((d) => [d, Math.round(interV[d] * rng.entre(0.3, 0.41))]));
  forcarPico(contasV, DIA_PICO);
  const reforcoVisitas = { [somarDias(FIM, -5)]: 1.5, [somarDias(FIM, -4)]: 2.6, [somarDias(FIM, -3)]: 3.4, [somarDias(FIM, -1)]: 2.0, [FIM]: 1.6 };
  const visV = Object.fromEntries(alcDias.map((d) => [d, Math.round((rng.int(270, 420) + alc[d] * 0.0032) * rng.ruido(0.12) * (reforcoVisitas[d] || 1))]));
  const diaMaiorVisita = somarDias(FIM, -2);
  visV[diaMaiorVisita] = Math.round(Math.max(...Object.values(visV)) * rng.entre(1.07, 1.15));
  const interacoesDia = alcDias.map((d) => ({ d, v: interV[d] }));
  const contasDia = alcDias.map((d) => ({ d, v: contasV[d] }));
  const visitasDia = alcDias.map((d) => ({ d, v: visV[d] }));
  const postsSemanaSerie = semanas.map((d, i) => ({ d, v: nPosts[i], ...(i === 9 ? { parcial: true } : {}) }));

  // ---------------------------------------------------------------- comentários e humor
  const comDias = intervalo(somarDias(FIM, -45), FIM);
  const formaCom = (d) => {
    if (d === DIA_SORTEIO) return 3.1;
    if (d === DIA_PICO) return 1.9;
    if (d < DIA_SORTEIO) return 1.2;
    if (d <= somarDias(DIA_SORTEIO, 11)) return 1.1;
    return 0.42;
  };
  const comentariosDia = U.serieDiaria({ dias: comDias, total: AL.comentarios, rng, forma: formaCom, ruido: 0.27, fixos: { [DIA_SORTEIO]: rng.int(2236, 2394), [FIM]: rng.int(31, 58) } });
  {
    const livres = comentariosDia.filter((p) => p.d !== FIM);
    const maior = maxPor(livres);
    const alvo = comentariosDia.find((p) => p.d === DIA_SORTEIO);
    if (maior !== alvo && maior.v >= alvo.v) [maior.v, alvo.v] = [alvo.v, maior.v];
    for (const outro of livres) if (outro !== alvo && outro.v === alvo.v) { outro.v -= 1; alvo.v += 1; }
  }
  const comPorDia = Object.fromEntries(comentariosDia.map((p) => [p.d, p.v]));
  const comInstagram = Math.round(AL.comentarios * rng.entre(0.36, 0.4));
  const comFacebook = AL.comentarios - comInstagram;

  const humorDias = intervalo(somarDias(FIM, -43), somarDias(FIM, -1));
  const DIA_MELHOR_HUMOR = somarDias(FIM, -5);
  const hN = humorDias.length;
  const positivo = humorDias.map((d, i) => {
    let v = 29 + 30 * (i / (hN - 1)) ** 1.3 + rng.normal() * 7;
    if (d === DIA_SORTEIO) v = rng.entre(19, 25);
    v = d === DIA_MELHOR_HUMOR ? rng.entre(76.2, 79.4) : Math.min(70, Math.max(14, v));
    return { d, v: arred(v, 2) };
  });
  const negativo = humorDias.map((d, i) => {
    let v = 13 - (10 * i) / (hN - 1) + rng.normal() * 3;
    v = d === DIA_SORTEIO ? rng.entre(22.1, 24.9) : Math.min(19.5, Math.max(1.2, v));
    return { d, v: arred(v, 2) };
  });
  const pesoHumor = soma(humorDias.map((d) => comPorDia[d]));
  const positivoPct = arred(soma(positivo.map((p) => p.v * comPorDia[p.d])) / pesoHumor, 1);
  const negativoPct = arred(soma(negativo.map((p) => p.v * comPorDia[p.d])) / pesoHumor, 1);
  const piorHumor = maxPor(negativo);
  const melhorHumor = maxPor(positivo);

  // ---------------------------------------------------------------- robô de resposta e autores
  const roboTotal = rng.int(281, 314);
  const roboDias = 49;
  const roboPartes = distribuir(roboTotal, [0.64 * rng.ruido(0.05), 0.25 * rng.ruido(0.08), 0.11 * rng.ruido(0.1)]);
  const robo = ['Ignorou', 'Respondeu', 'Mandou p/ humano'].map((decisao, i) => ({ decisao, v: roboPartes[i], pct: pct(roboPartes[i], roboTotal) }));
  const fbAutores = rng.int(38, 56);
  const igAutores = rng.int(1080, 1190);
  const fbComAutor = Math.round(comFacebook * rng.entre(0.76, 0.84));
  const igComAutor = Math.round(comInstagram * rng.entre(0.2, 0.26));
  const quemComenta = [
    { rede: 'Facebook', autores: fbAutores, comentarios: fbComAutor, porAutor: arred(fbComAutor / fbAutores, 1), noCrm: 0 },
    { rede: 'Instagram', autores: igAutores, comentarios: igComAutor, porAutor: arred(igComAutor / igAutores, 1), noCrm: 0 },
  ];
  const autoresTotal = fbAutores + igAutores;
  const autoresDepois = rng.int(9, 19);
  const corteAutores = somarDias(DIA_SORTEIO, 2);

  // ---------------------------------------------------------------- acervo de fotos e vídeos
  const fotosSemanas = [...semanas, somarDias(semanaFim, 7)];
  const fotos = [rng.int(41, 88), rng.int(120, 210), rng.int(590, 820), rng.int(1080, 1290), rng.int(430, 560), rng.int(380, 520), rng.int(540, 690), rng.int(1320, 1530), rng.int(1263, 1449), rng.int(2580, 2860)];
  const dias30 = intervalo(somarDias(A.DATAS.medidoEm, -29), A.DATAS.medidoEm);
  const diasDaSemanaNo30 = dias30.filter((d) => semanaDe(d) === fotosSemanas[6]).length;
  const somaUltimas4 = AL.fotos30d - Math.round((fotos[6] * diasDaSemanaNo30) / 7);
  fotos.push(somaUltimas4 - fotos[7] - fotos[8] - fotos[9]);
  const fotosSemana = fotosSemanas.map((d, i) => ({ d, v: fotos[i], ...(i === 10 ? { parcial: true } : {}) }));
  const outros30 = rng.int(18, 41);
  const inst30 = rng.int(1, 4);
  const pastas = [
    { pasta: 'HORIZONTE 2026', total: soma(fotos) + rng.int(380, 560), ult30d: AL.fotos30d - outros30 - inst30 },
    { pasta: 'OUTROS MATERIAIS', total: rng.int(2890, 3340), ult30d: outros30 },
    { pasta: 'INSTITUCIONAL', total: rng.int(140, 205), ult30d: inst30 },
  ];
  const muralTotalEnviadas = rng.int(962, 1241);
  const mural = {
    maiorDia: somarDias(FIM, 3),
    enviadas: rng.int(193, 257),
    impressas: rng.int(48, 75),
    totalEnviadas: muralTotalEnviadas,
    totalImpressas: Math.round(muralTotalEnviadas * rng.entre(0.72, 0.81)),
    duasSemanas: rng.int(541, 698),
  };
  const trechos = rng.int(6310, 7090);
  const videosN = rng.int(4910, 5480);
  const videos = { trechos, videos: videosN, pico: { semana: semanas[8], trechos: Math.round(trechos * rng.entre(0.49, 0.55)), videos: Math.round(videosN * rng.entre(0.47, 0.53)) } };

  // ---------------------------------------------------------------- tabela de posts por semana
  const postsSemana = semanas.map((s, i) => {
    const alcance = postsAlc[s];
    const tardia = i >= 7;
    return {
      semana: s,
      alcance,
      visualizacoes: Math.round(alcance * rng.entre(1.42, 1.62)),
      curtidas: Math.round(alcance * (tardia ? rng.entre(0.05, 0.08) : rng.entre(0.08, 0.21))),
      comentarios: Math.round(alcance * rng.entre(0.004, 0.011)),
      compart: Math.round(alcance * rng.entre(0.02, 0.043)),
      salvos: Math.round(alcance * rng.entre(0.003, 0.006)),
      ...(i === 9 ? { parcial: true } : {}),
    };
  });

  const fbEngPico = rng.int(352000, 398000);
  const fbEngUlt = rng.int(39000, 46000);

  // ---------------------------------------------------------------- números derivados para o texto
  const I = {
    de: { dia: igDias[0], v: igIni },
    ate: { dia: FIM, v: AL.seguidoresInstagram },
    crescimentoPct: pct(AL.seguidoresInstagram - igIni, igIni),
    pico: { dia: igPicoDia, v: igPicoV },
    perdaDesdePico: perda,
  };
  const fbFim = seguidoresFacebook.at(-1).v;
  const F = {
    de: { dia: fbDias[0], v: fbIni },
    ate: { dia: FIM, v: fbFim },
    crescimentoPct: pct(fbFim - fbIni, fbIni),
    salto: { de: saltoDe, ate: saltoAte, v: saltoV },
  };
  const picoAlc = maxPor(alcanceDia);
  const valeAlc = minPor(alcanceDia.slice(0, -1));
  const instagramDiario = {
    pico: { dia: picoAlc.d, v: picoAlc.v },
    vale: { dia: valeAlc.d, v: valeAlc.v },
    ultimo: { dia: FIM, v: alc[FIM] },
    interacoesPico: interV[DIA_PICO],
    interacoesUltimo: interV[FIM],
    contasPico: contasV[DIA_PICO],
    contasUltimo: contasV[FIM],
  };
  const visBaixa = minPor(visitasDia.filter((x) => x.d > DIA_PICO && x.d < diaMaiorVisita));
  const picoCom = maxPor(comentariosDia);
  const humanos = robo[2].v;
  const execucoes = rng.int(36140, 39780);
  const rotinasHistorico = 22;
  const ultimaHistorico = somarDias(FIM, -34);
  const fimUltimaCompleta = somarDias(ULTIMA_COMPLETA, 6);
  const postsTres = nPosts[6] + nPosts[7] + nPosts[8];
  const milhao = (v) => `${fmt.dec(v / 1e6, 1)} milhão`;

  const statusAlcance = AL.alcanceSemanaInstagram >= 450000 ? 'verde' : AL.alcanceSemanaInstagram >= 220000 ? 'amarelo' : 'vermelho';

  const alcance = {
    letra: 'F',
    titulo: 'Alcance: quem vê',
    pergunta: 'Redes, comentários, fotos — e o instrumento que parou.',
    frase: `O clube chega à pré-temporada sem instrumento de alcance. A coleta que mede as redes rodou pela última vez em ${fmt.data(FIM)} e não voltou: há ${diasParada} dias ninguém sabe quantas pessoas viram uma peça.`,
    kpis: [
      { v: AL.seguidoresInstagram, rotulo: `seguidores no Instagram — o número de ${fmt.data(FIM)}, último coletado` },
      { v: AL.alcanceSemanaInstagram, rotulo: `alcance do Instagram na última semana completa (${fmt.data(ULTIMA_COMPLETA)} a ${fmt.data(fimUltimaCompleta)})` },
      { v: AL.coletaParadaDias, rotulo: 'dias com a coleta das redes parada', formato: 'dias' },
      { v: AL.fotos30d, rotulo: 'fotos novas no acervo em 30 dias' },
    ],
    coleta: [
      { rotina: 'Coleta diária da conta — seguidores, alcance, comentários', ultima: FIM, paradaDias: AL.coletaParadaDias, execucoes, erro: 'nenhum', status: 'ATRASADO' },
      { rotina: `Rotinas de histórico (preenchimento de meses anteriores) — ${rotinasHistorico} rotinas`, ultima: ultimaHistorico, paradaDias: arred(AL.coletaParadaDias + diasEntre(ultimaHistorico, FIM), 1), execucoes: rng.int(3710, 4180), erro: 'nenhum', status: 'ATRASADO' },
    ],
    coletaLeitura: `São ${rotinasHistorico + 1} rotinas de coleta e nenhuma está em dia. A que pesa é a diária: executou ${fmt.n(execucoes)} vezes e parou em ${fmt.data(FIM)}, há ${fmt.dec(AL.coletaParadaDias)} dias, sem deixar um erro sequer no registro. Religá-la é o conserto mais barato do capítulo — e o que mais amplia o que dá para decidir nos ${A.DATAS.faltavamDiasNaMedicao} dias até o Dia D.`,
    instagram: I,
    facebook: F,
    postSorteio: { dia: DIA_SORTEIO, semana: SEM_SORTEIO, alcance: postSorteioV, tema: 'sorteio de passagens' },
    alcanceSemanalLeitura: `Na semana do sorteio de passagens, ${nPosts[5]} posts somaram ${fmt.n(postsAlc[SEM_SORTEIO])} de alcance — e um só, o do próprio sorteio (${fmt.data(DIA_SORTEIO)}), respondeu por ${fmt.n(postSorteioV)}. Na semana de ${fmt.data(SEM_MAIS_POSTS)}, com o maior número de posts (${nPosts[8]}), a soma ficou em ${fmt.n(postsAlc[SEM_MAIS_POSTS])}. O alcance da conta foi de ${fmt.n(conta[SEM_SORTEIO])} para ${fmt.n(AL.alcanceSemanaInstagram)}, o menor de todas as semanas completas desde ${fmt.data(semanas[0])}. Não usar "alcançamos milhões" com o número da semana do sorteio.`,
    facebookEngajamento: { pico: { semana: SEM_SORTEIO, v: fbEngPico }, ultimaCompleta: { semana: ULTIMA_COMPLETA, v: fbEngUlt }, quedaPct: pct(fbEngPico - fbEngUlt, fbEngPico) },
    instagramDiario,
    visitasPerfil: { baixa: { dia: visBaixa.d, v: visBaixa.v }, maior: { dia: diaMaiorVisita, v: visV[diaMaiorVisita] } },
    postsSemana,
    semanaMaisPosts: {
      semana: SEM_MAIS_POSTS,
      posts: nPosts[8],
      stories: storiesMaisPosts,
      leitura: `A semana de ${fmt.data(SEM_MAIS_POSTS)} teve ${nPosts[8]} posts, o recorde do período, e ${storiesMaisPosts} stories — e foi a de menor alcance entre as semanas completas. Faltou alcance, não publicação.`,
    },
    comentarios: { total: AL.comentarios, dias: comDias.length, pico: { dia: picoCom.d, v: picoCom.v }, facebook: comFacebook, instagram: comInstagram, respondidos: AL.comentariosRespondidos },
    humor: { positivoPct, negativoPct, pior: { dia: piorHumor.d, negativoPct: arred(piorHumor.v, 1) }, melhor: { dia: melhorHumor.d, positivoPct: arred(melhorHumor.v, 1) } },
    robo,
    roboDias,
    roboLeitura: `Em ${roboDias} dias o robô de resposta tomou ${fmt.n(roboTotal)} decisões, enquanto os ${comDias.length} dias de coleta trouxeram ${fmt.n(AL.comentarios)} comentários: ele olhou para ${fmt.pct(pct(roboTotal, AL.comentarios))} do que chegou. ${fmt.n(humanos)} casos ficaram como "pendente de humano" e nada registra que alguém os tenha aberto.`,
    autores: { total: autoresTotal, antesDoCorte: autoresTotal - autoresDepois, depois: autoresDepois, corte: corteAutores },
    quemComenta,
    semCategoria: rng.int(118300, 130900),
    acervo: {
      total: soma(pastas, (p) => p.total),
      pastas,
      semanaAtual: fotos[10],
      semanaAnterior: fotos[9],
      mural,
      videos,
    },
    produziuXviu: [
      { oque: 'Fotos novas no acervo de imagens do clube', quanto: fmt.n(AL.fotos30d), quemViu: 'nenhuma — o acervo não é publicado' },
      { oque: 'Fotos impressas no mural do telão dos eventos', quanto: `${fmt.n(mural.totalImpressas)} de ${fmt.n(mural.totalEnviadas)}`, quemViu: 'quem passou pelo evento; ninguém contou' },
      { oque: 'Trechos de vídeo transcritos (depoimentos de viajantes)', quanto: fmt.n(trechos), quemViu: 'material interno, não publicado' },
      { oque: `Posts publicados no Instagram (semanas de ${semanas[6].slice(8, 10)}, ${semanas[7].slice(8, 10)} e ${fmt.data(semanas[8])})`, quanto: fmt.n(postsTres), quemViu: `alcance medido só até ${fmt.data(FIM)}` },
      { oque: 'Comentários recebidos nas redes do clube', quanto: `${fmt.n(AL.comentarios)} (até ${fmt.data(FIM)})`, quemViu: `${fmt.n(AL.comentariosRespondidos)} marcados como respondidos` },
    ],
    muda: [
      {
        t: `O clube está cego de alcance há ${diasParada} dias.`,
        d: `A rotina diária das redes executou pela última vez em ${fmt.data(FIM)} e não acusou erro — parou em silêncio. A Fase B começa em ${fmt.data(A.DATAS.faseB.inicio)}, e é nela que o gestor espera 80% das adesões, sem saber se uma peça chega a ${fmt.mil(AL.alcanceSemanaInstagram, 0)} ou a ${milhao(conta[SEM_SORTEIO])} de pessoas. Religar a coleta vem antes de qualquer decisão de conteúdo.`,
      },
    ],
    naoMede: [
      'Quantas pessoas diferentes viram o clube na semana: a coleta guarda alcance dia a dia, e somar os dias conta a mesma pessoa mais de uma vez.',
      'Alcance de cada post no Facebook: dessa rede só se coleta engajamento.',
      `Se alguém respondeu o comentário: nenhum dos ${fmt.n(AL.comentarios)} tem marca de resposta, e nenhum autor está ligado a um lead do CRM.`,
    ],
    regua: {
      linhas: [
        { metrica: 'Coleta diária de redes', verde: 'rodou hoje', amarelo: 'até 2 dias', vermelho: 'mais de 2 dias', hoje: `${diasParada} dias parada`, status: 'vermelho' },
        { metrica: 'Alcance semanal no Instagram', verde: '450 mil ou mais', amarelo: '220 mil ou mais', vermelho: 'abaixo de 220 mil', hoje: `${fmt.n(AL.alcanceSemanaInstagram)} (${fmt.data(ULTIMA_COMPLETA)}, último completo)`, status: statusAlcance },
        { metrica: 'Comentários marcados como respondidos', verde: 'metade ou mais', amarelo: 'alguma resposta', vermelho: 'nenhuma', hoje: `${fmt.n(AL.comentariosRespondidos)} de ${fmt.n(AL.comentarios)}`, status: AL.comentariosRespondidos === 0 ? 'vermelho' : AL.comentariosRespondidos * 2 >= AL.comentarios ? 'verde' : 'amarelo' },
      ],
    },
    p: [44, 51],
  };

  return {
    livro: { alcance },
    series: {
      seguidores_instagram_dia: seguidoresInstagram,
      seguidores_facebook_dia: seguidoresFacebook,
      alcance_instagram_semana: { conta: semanas.map((d) => ({ d, v: conta[d] })), posts: semanas.map((d) => ({ d, v: postsAlc[d] })) },
      alcance_instagram_dia: alcanceDia,
      interacoes_instagram_dia: interacoesDia,
      contas_interagiram_instagram_dia: contasDia,
      visitas_perfil_instagram_dia: visitasDia,
      posts_instagram_semana: postsSemanaSerie,
      comentarios_dia: comentariosDia,
      humor_positivo_pct_dia: positivo,
      humor_negativo_pct_dia: negativo,
      fotos_semana: fotosSemana,
    },
  };
}

export function verificar(saida: SaidaCapitulo, { A, U }: Contexto): string[] {
  const { soma, pct, arred, somarDias, semanaDe, intervalo, fmt } = U;
  const p = [];
  const AL = A.ALCANCE;
  const R = saida.livro.alcance;
  const S = saida.series;
  const FIM = AL.ultimaColeta;
  const ok = (cond, msg) => { if (!cond) p.push(msg); };
  const unico = (serie, dia, rotulo) => {
    const alvo = serie.find((x) => x.d === dia);
    ok(alvo && serie.every((x) => x.d === dia || x.v < alvo.v), `${rotulo}: pico não é único em ${dia}`);
  };

  // âncoras
  ok(R.kpis[0].v === AL.seguidoresInstagram && R.kpis[1].v === AL.alcanceSemanaInstagram && R.kpis[2].v === AL.coletaParadaDias && R.kpis[3].v === AL.fotos30d, 'kpis fora das âncoras');
  ok(R.coleta[0].ultima === FIM && R.coleta[0].paradaDias === AL.coletaParadaDias && R.coleta[0].erro === 'nenhum', 'coleta diária fora das âncoras');
  ok(R.comentarios.total === AL.comentarios && R.comentarios.respondidos === AL.comentariosRespondidos, 'comentários fora das âncoras');

  // todas as séries de redes terminam onde a coleta parou
  for (const k of ['seguidores_instagram_dia', 'seguidores_facebook_dia', 'alcance_instagram_dia', 'interacoes_instagram_dia', 'contas_interagiram_instagram_dia', 'visitas_perfil_instagram_dia', 'comentarios_dia']) ok(S[k].at(-1).d === FIM, `${k} não termina em ${FIM}`);
  ok(S.humor_negativo_pct_dia.at(-1).d < FIM && S.humor_positivo_pct_dia.at(-1).d < FIM, 'humor passa da coleta');

  // seguidores
  const ig = S.seguidores_instagram_dia;
  ok(ig.at(-1).v === AL.seguidoresInstagram, 'seguidores do Instagram não terminam na âncora');
  unico(ig, R.instagram.pico.dia, 'seguidores Instagram');
  ok(ig.find((x) => x.d === R.instagram.pico.dia).v === R.instagram.pico.v, 'pico do Instagram difere da série');
  ok(R.instagram.pico.dia < FIM && R.instagram.pico.dia > ig[Math.floor(ig.length / 2)].d, 'pico do Instagram fora do lugar');
  ok(R.instagram.perdaDesdePico === R.instagram.pico.v - ig.at(-1).v, 'perda desde o pico não fecha');
  ok(R.instagram.de.v === ig[0].v && R.instagram.crescimentoPct === pct(ig.at(-1).v - ig[0].v, ig[0].v), 'crescimento do Instagram não fecha');
  const fb = S.seguidores_facebook_dia;
  ok(R.facebook.de.v === fb[0].v && R.facebook.ate.v === fb.at(-1).v && R.facebook.crescimentoPct === pct(fb.at(-1).v - fb[0].v, fb[0].v), 'crescimento do Facebook não fecha');
  const fbV = Object.fromEntries(fb.map((x) => [x.d, x.v]));
  ok(fbV[R.facebook.salto.ate] - fbV[R.facebook.salto.de] === R.facebook.salto.v, 'salto do Facebook não fecha com a série');
  for (let i = 7; i < fb.length; i++) {
    if (fb[i].d === R.facebook.salto.ate) continue;
    if (fb[i].v - fb[i - 7].v >= R.facebook.salto.v) p.push(`Facebook: janela até ${fb[i].d} sobe mais que o salto`);
  }
  ok(fb.every((x, i) => i === 0 || x.v >= fb[i - 1].v), 'Facebook desce em algum dia');

  // alcance semanal × diário
  const { conta, posts } = S.alcance_instagram_semana;
  const contaV = Object.fromEntries(conta.map((x) => [x.d, x.v]));
  const mp = R.semanaMaisPosts.semana;
  ok(contaV[mp] === AL.alcanceSemanaInstagram, 'semana de mais posts não é a da âncora de alcance');
  ok(somarDias(semanaDe(FIM), -7) === mp, 'semana de mais posts não é a última completa');
  const completas = conta.slice(0, -1);
  ok(completas.every((x) => x.d === mp || x.v > contaV[mp]), 'semana de mais posts não é a de menor alcance da conta');
  const postsV = Object.fromEntries(posts.map((x) => [x.d, x.v]));
  ok(posts.slice(0, -1).every((x) => x.d === mp || x.v > postsV[mp]), 'semana de mais posts não é a de menor soma dos posts');
  const nposts = S.posts_instagram_semana;
  ok(nposts.filter((x) => !x.parcial).every((x) => x.d === mp || x.v < R.semanaMaisPosts.posts) && nposts.find((x) => x.d === mp).v === R.semanaMaisPosts.posts, 'semana de mais posts não tem o máximo de posts');
  const alcD = S.alcance_instagram_dia;
  for (const s of conta) {
    const dias = alcD.filter((x) => semanaDe(x.d) === s.d);
    if (dias.length === 7 || s.d === semanaDe(FIM)) ok(soma(dias, (x) => x.v) === s.v, `alcance da semana ${s.d} não soma com o diário`);
  }
  ok(R.postSorteio.semana === conta.reduce((a, x) => (x.v > a.v ? x : a)).d, 'semana do sorteio não é a de maior alcance');
  ok(R.postSorteio.alcance < postsV[R.postSorteio.semana] && R.postSorteio.alcance > postsV[R.postSorteio.semana] / 2, 'post do sorteio não domina a semana');
  unico(alcD, R.instagramDiario.pico.dia, 'alcance diário');
  ok(semanaDe(R.instagramDiario.pico.dia) === R.postSorteio.semana, 'pico diário fora da semana do sorteio');
  unico(S.interacoes_instagram_dia, R.instagramDiario.pico.dia, 'interações');
  unico(S.contas_interagiram_instagram_dia, R.instagramDiario.pico.dia, 'contas que interagiram');
  const pegar = (k, d) => S[k].find((x) => x.d === d).v;
  ok(R.instagramDiario.interacoesPico === pegar('interacoes_instagram_dia', R.instagramDiario.pico.dia) && R.instagramDiario.interacoesUltimo === pegar('interacoes_instagram_dia', FIM), 'interações do texto diferem da série');
  ok(R.instagramDiario.contasPico === pegar('contas_interagiram_instagram_dia', R.instagramDiario.pico.dia) && R.instagramDiario.contasUltimo === pegar('contas_interagiram_instagram_dia', FIM), 'contas do texto diferem da série');
  ok(R.instagramDiario.vale.v === Math.min(...alcD.slice(0, -1).map((x) => x.v)) && R.instagramDiario.ultimo.v === alcD.at(-1).v, 'vale/último do alcance diferem');
  ok(R.instagramDiario.vale.dia < R.instagramDiario.ultimo.dia, 'vale não fica antes do último dia');
  const vis = S.visitas_perfil_instagram_dia;
  unico(vis, R.visitasPerfil.maior.dia, 'visitas ao perfil');
  ok(R.visitasPerfil.maior.v === pegar('visitas_perfil_instagram_dia', R.visitasPerfil.maior.dia) && R.visitasPerfil.baixa.v === Math.min(...vis.filter((x) => x.d > R.instagramDiario.pico.dia && x.d < R.visitasPerfil.maior.dia).map((x) => x.v)), 'visitas do texto diferem da série');
  ok(R.visitasPerfil.baixa.dia < R.visitasPerfil.maior.dia, 'visitas não fazem o caminho contrário');
  ok(R.postsSemana.every((x) => x.alcance === postsV[x.semana]), 'tabela de posts difere da série');

  // comentários e humor
  const com = S.comentarios_dia;
  ok(soma(com, (x) => x.v) === AL.comentarios, 'comentários diários não somam a âncora');
  ok(com.length === R.comentarios.dias, 'dias de comentários não fecham');
  unico(com, R.comentarios.pico.dia, 'comentários');
  ok(R.comentarios.pico.dia === R.postSorteio.dia, 'pico de comentários não é o dia do sorteio');
  ok(R.comentarios.facebook + R.comentarios.instagram === R.comentarios.total, 'Facebook + Instagram ≠ total de comentários');
  const pos = S.humor_positivo_pct_dia;
  const neg = S.humor_negativo_pct_dia;
  unico(neg, R.humor.pior.dia, 'humor negativo');
  unico(pos, R.humor.melhor.dia, 'humor positivo');
  ok(R.humor.pior.dia === R.postSorteio.dia, 'pior humor não é o dia do sorteio');
  ok(pos.every((x, i) => x.v + neg[i].v < 100 && x.d === neg[i].d), 'humor passa de 100% ou desalinha');
  const comV = Object.fromEntries(com.map((x) => [x.d, x.v]));
  const peso = soma(pos, (x) => comV[x.d]);
  ok(R.humor.positivoPct === arred(soma(pos, (x) => x.v * comV[x.d]) / peso, 1) && R.humor.negativoPct === arred(soma(neg, (x) => x.v * comV[x.d]) / peso, 1), 'humor do conjunto não fecha');
  const decisoes = soma(R.robo, (x) => x.v);
  ok(R.robo.every((x) => x.pct === pct(x.v, decisoes)), 'pct do robô não fecha');
  ok(R.roboLeitura.includes(fmt.n(decisoes)) && R.roboLeitura.includes(fmt.n(R.robo[2].v)), 'leitura do robô difere da tabela');
  ok(R.quemComenta.every((q) => q.porAutor === arred(q.comentarios / q.autores, 1) && q.noCrm === 0), 'quem comenta não fecha');
  ok(R.quemComenta[0].comentarios <= R.comentarios.facebook && R.quemComenta[1].comentarios <= R.comentarios.instagram, 'comentários com autor passam do total da rede');
  ok(R.autores.total === soma(R.quemComenta, (q) => q.autores) && R.autores.antesDoCorte + R.autores.depois === R.autores.total, 'autores não fecham');

  // acervo
  const fotos = S.fotos_semana;
  const ac = R.acervo;
  ok(ac.total === soma(ac.pastas, (x) => x.total), 'acervo não soma as pastas');
  ok(soma(ac.pastas, (x) => x.ult30d) === AL.fotos30d, 'fotos em 30 dias das pastas ≠ âncora');
  ok(ac.pastas.map((x) => x.pasta).join('|') === 'HORIZONTE 2026|OUTROS MATERIAIS|INSTITUCIONAL', 'pastas do acervo erradas');
  ok(ac.pastas[0].total >= soma(fotos, (x) => x.v), 'pasta principal menor que a série de fotos');
  ok(fotos.at(-1).parcial && ac.semanaAtual === fotos.at(-1).v && ac.semanaAnterior === fotos.at(-2).v, 'semana atual/anterior diferem da série');
  const ult4 = soma(fotos.slice(-4), (x) => x.v);
  ok(ult4 <= AL.fotos30d && AL.fotos30d <= ult4 + fotos.at(-5).v, 'fotos em 30 dias fora da janela das semanas');
  ok(fotos.every((x) => x.v > 0), 'semana de fotos com valor não positivo');
  ok(ac.mural.impressas <= ac.mural.enviadas && ac.mural.totalImpressas <= ac.mural.totalEnviadas && ac.mural.enviadas <= ac.mural.duasSemanas && ac.mural.duasSemanas <= ac.mural.totalEnviadas, 'mural não fecha');
  ok(ac.videos.pico.trechos <= ac.videos.trechos && ac.videos.pico.videos <= ac.videos.videos, 'vídeos não fecham');
  const tres = soma(nposts.slice(6, 9), (x) => x.v);
  ok(R.produziuXviu[3].quanto === fmt.n(tres), 'posts de três semanas não fecham');
  ok(intervalo(nposts[6].d, nposts[8].d).every((d) => d.slice(5, 7) === nposts[8].d.slice(5, 7)), 'rótulo das três semanas cruza mês');

  // nenhuma data fora da janela das redes
  const texto = JSON.stringify(saida);
  const datas = texto.match(/\d{4}-\d{2}-\d{2}/g) || [];
  ok(datas.every((d) => d >= '2026-08-31' && d <= A.DATAS.medidoEm), 'data fora da janela das redes');
  return p;
}
