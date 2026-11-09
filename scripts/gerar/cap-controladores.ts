// Capítulo C · Controladores e expectativa.
// Monta a rede inteira (53 carteiras com piloto) e deriva dela tudo o que a tela mostra:
// top 20, semana, metades, faixas de carteira, rodada de expectativa, cobertura e régua.
import type { Contexto, SaidaCapitulo } from './tipos.ts';

/** Carteira de um controlador: os campos vão sendo preenchidos ao longo do capítulo. */
interface Carteira {
  nome?: string;
  tipo?: string;
  top?: number;
  triagem?: boolean;
  pilotos: number;
  passageiros?: number;
  produzem?: number;
  ult7d?: number;
  linhas?: number;
  resp?: number;
  peso?: number;
  drift?: number;
  falta?: [number, number];
}

interface FaixaCarteira {
  item: { faixa: string; carteiras: number; passageiros: number; triagem?: boolean };
  pilotos: number;
}


const DATA_RODADA = '2026-11-10';

// reparte um inteiro respeitando um teto por item (quem estoura fica no teto e o resto se redistribui)
function repartir(U, total, pesos, tetos) {
  const out = pesos.map(() => 0);
  let ativos = pesos.map((_, i) => i).filter((i) => pesos[i] > 0 && tetos[i] > 0);
  let resto = total;
  while (resto > 0) {
    if (!ativos.length) throw new Error(`repartir: ${resto} sem lugar`);
    const partes = U.distribuir(resto, ativos.map((i) => pesos[i]));
    const estourou = ativos.filter((i, k) => partes[k] > tetos[i]);
    if (!estourou.length) {
      ativos.forEach((i, k) => (out[i] = partes[k]));
      resto = 0;
      break;
    }
    for (const i of estourou) {
      out[i] = tetos[i];
      resto -= tetos[i];
    }
    ativos = ativos.filter((i) => !estourou.includes(i));
  }
  return out;
}

const tendenciaDe = (a, b) => (b > a * 1.2 ? 'subiu' : b < a * 0.8 ? 'caiu' : 'estavel');

export function gerar({ rng, A, U }: Contexto): SaidaCapitulo {
  const { fmt, pct, soma, arred, somarDias, intervalo } = U;
  const D = A.DATAS;
  const TR = A.TRES;
  const SD = A.PILOTOS.semDono;
  const PES = A.PESSOAS;
  const ativos = A.PILOTOS.funil.find((f) => f.id === 'ativos').v;
  const decomp = (id) => TR.decomposicao.find((g) => g.id === id);

  const dias = intervalo(D.inicio, D.fim);
  const meio = somarDias(D.inicio, Math.floor(dias.length / 2));
  const iniSemana = somarDias(D.fim, -6);
  const iMeio = dias.indexOf(meio);
  const iSemana = dias.indexOf(iniSemana);

  // ------------------------------------------------------------ top 20 (ordem de passageiros = ordem das âncoras)
  const basePass = [1318, 836, 587, 509, 446, 418, 366, 331, 306, 279, 263, 248, 241, 229, 216, 195, 189, 184, 176, 164];
  const pass = basePass.map((v) => Math.round(v * rng.ruido(0.025))).sort((a, b) => b - a);
  for (let i = 1; i < pass.length; i++) if (pass[i] >= pass[i - 1]) pass[i] = pass[i - 1] - 1;
  const pilTop = [43, 22, 36, 31, 7, 46, 32, 30, 44, 37, 31, 38, 30, 33, 30, 40, 31, 26, 29, 30];
  const prodTop = [16, 15, 12, 13, 5, 11, 8, 7, 10, 6, 8, 7, 6, 7, 4, 7, 4, 5, 6, 12];
  const semanaTop = [604, 197, 46, 88, 4, 81, 57, 11, 49, 38, 29, 94, 26, 13, 5, 7, 15, 21, 34, 43].map((v) => Math.max(2, Math.round(v * rng.ruido(0.05))));
  const driftTop = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, -3, 0, -2, 0];
  const razaoMetades = [2.1, 8.0, 0.97, 1.36, 0.14, 0.58, 1.08, 0.91, 0.62, 0.49];

  const carteiras: Carteira[] = PES.controladores.map((nome, i) => ({
    nome,
    top: i,
    pilotos: pilTop[i],
    passageiros: pass[i],
    produzem: prodTop[i],
    ult7d: semanaTop[i],
    linhas: pilTop[i] + driftTop[i],
    resp: i === 4 ? 0 : i === 19 ? 1 : pilTop[i] + driftTop[i],
  }));
  const menorTop = pass[pass.length - 1];

  // ------------------------------------------------------------ carteiras fora do top 20
  const [rogerio, zelia, wagner, ivone, priscila, osmar, gilberto, heloisa] = PES.outrosControladores;
  const nomeados: Carteira[] = [
    { nome: rogerio, pilotos: 96, peso: 1.3 },
    { nome: zelia, pilotos: 58, peso: 1.5, falta: [9, 14] as [number, number] },
    { nome: wagner, pilotos: 48, peso: 1.2, drift: 1 },
    { nome: ivone, pilotos: 41, peso: 1.0 },
    { nome: priscila, pilotos: 40, peso: 0.9 },
    { nome: osmar, pilotos: 35, peso: 1.1 },
    { nome: gilberto, pilotos: 34, peso: 0.8 },
  ].map((c): Carteira => ({ ...c, tipo: 'normal' }));
  const semNome: Carteira[] = [
    ...([
      ['semPassTudo', 33], ['naoLancou', 33], ['parcial', 33, [7, 11]], ['semPassTudo', 32],
      ['parcial', 32, [10, 14]], ['semPassTudo', 32], ['parcial', 31, [4, 8]], ['naoLancou', 31],
    ] as [string, number, [number, number]?][]).map(([tipo, pilotos, falta]) => ({ tipo, pilotos, falta, peso: 0.9, drift: rng.int(-1, 1) })),
    ...([['semPassTudo', 27], ['naoLancou', 23], ['semPassTudo', 19]] as [string, number][]).map(([tipo, pilotos]) => ({ tipo, pilotos, peso: 0.8, drift: rng.int(-1, 1) })),
    ...[6, 5, 5, 4, 4, 4, 3, 3, 3].map((pilotos) => ({ tipo: 'naoLancou', pilotos, peso: 0.7 })),
    ...[2, 2, 2, 2].map((pilotos) => ({ tipo: 'naoLancouSemPass', pilotos, peso: 0 })),
  ];
  const helo: Carteira = { nome: heloisa, tipo: 'normal', pilotos: 33, passageiros: menorTop - rng.int(8, 16), ult7d: rng.int(101, 117), produzem: 9 };
  const triagem: Carteira = { nome: PES.contaTriagem, tipo: 'triagem', triagem: true, pilotos: SD.triagem, passageiros: rng.int(22, 31), ult7d: rng.int(1, 3), produzem: decomp('deposito').comPassageiro };

  const demais = [...nomeados, ...semNome];
  const orfaosPass = rng.int(146, 188);
  const restoPass = TR.contabilizados - orfaosPass - soma(pass) - helo.passageiros - triagem.passageiros;
  const comPass = demais.map((c) => !/semPass/i.test(c.tipo));
  const passDemais = repartir(U, restoPass, demais.map((c, i) => (comPass[i] ? c.peso * rng.ruido(0.15) : 0)), demais.map((c, i) => (comPass[i] ? menorTop - 3 - i : 0)));
  demais.forEach((c, i) => (c.passageiros = passDemais[i]));

  // semana dos demais: parte fica em zero; ninguém chega perto do 10º da lista
  const r7 = rng.int(262, 318);
  let semanaDemais = null;
  for (let tentativa = 0; !semanaDemais; tentativa++) {
    const zera = demais.map(() => rng.float() < (tentativa < 20 ? 0.25 : 0));
    const pesos = demais.map((c, i) => (c.passageiros > 0 && !zera[i] ? Math.sqrt(c.passageiros) * rng.ruido(0.4) : 0));
    const tetos = demais.map((c, i) => Math.min(c.passageiros, 26 + (i % 5)));
    if (soma(pesos.map((p, i) => (p > 0 ? tetos[i] : 0))) >= r7 * 1.3) semanaDemais = repartir(U, r7, pesos, tetos);
  }
  demais.forEach((c, i) => (c.ult7d = semanaDemais[i]));

  // pilotos que produzem: fecham com a decomposição (com passageiro − órfãos − fila de triagem)
  const produzemComDono = TR.metaDeQuemJaProduz.pilotos - decomp('orfaos').comPassageiro - decomp('deposito').comPassageiro;
  const prodDemaisTotal = produzemComDono - soma(prodTop) - helo.produzem;
  const idxProd = demais.map((c, i) => i).filter((i) => demais[i].passageiros > 0);
  const extra = repartir(U, prodDemaisTotal - idxProd.length, idxProd.map((i) => Math.sqrt(demais[i].passageiros)), idxProd.map((i) => Math.min(demais[i].pilotos, demais[i].passageiros) - 1));
  demais.forEach((c) => (c.produzem = 0));
  idxProd.forEach((i, k) => (demais[i].produzem = 1 + extra[k]));

  // rodada: linhas de 10/11 e as respondidas com carimbo
  for (const c of [...demais, helo, triagem]) {
    c.linhas = c.pilotos + (c.drift || 0);
    if (c.tipo === 'triagem') c.resp = 1;
    else if (/naoLancou/.test(c.tipo)) c.resp = 0;
    else if (c.falta) c.resp = c.linhas - rng.int(c.falta[0], c.falta[1]);
    else c.resp = c.linhas;
  }

  const todas = [...carteiras, helo, ...demais, triagem];
  const regulares = todas.filter((c) => !c.triagem);

  // ------------------------------------------------------------ conferências internas do modelo
  const pilotosComControlador = ativos - SD.orfaos;
  if (soma(todas, (c) => c.pilotos) !== pilotosComControlador) throw new Error(`pilotos das carteiras ${soma(todas, (c) => c.pilotos)} ≠ ${pilotosComControlador}`);
  if (soma(todas, (c) => c.produzem) !== produzemComDono + triagem.produzem) throw new Error('produzem não fecha com a decomposição');
  if (todas.length !== A.PILOTOS.controladoresComPiloto) throw new Error(`carteiras ${todas.length} ≠ ${A.PILOTOS.controladoresComPiloto}`);
  if (Math.max(...[helo, ...demais].map((c) => c.passageiros)) >= menorTop) throw new Error('carteira de fora passou o 20º');

  // ------------------------------------------------------------ top 20, top 10, semana
  const top20 = carteiras.map((c) => ({ nome: c.nome, pilotos: c.pilotos, produzem: c.produzem, produzemPct: pct(c.produzem, c.pilotos), passageiros: c.passageiros, ult7d: c.ult7d, lancaram: c.resp, deHoje: c.pilotos }));
  const deTotalComControlador = soma(todas, (c) => c.passageiros);
  const top10Pass = soma(top20.slice(0, 10), (c) => c.passageiros);
  const top10Soma = { passageiros: top10Pass, deTotalComControlador, pct: pct(top10Pass, deTotalComControlador) };

  const porSemana = [...todas].sort((a, b) => b.ult7d - a.ult7d || (a.top ?? 99) - (b.top ?? 99));
  const lista = porSemana.slice(0, 10).map((c) => ({ nome: c.nome, ult7d: c.ult7d, total: c.passageiros }));
  const semanaTotal = soma(todas, (c) => c.ult7d);
  const semanaTop10 = soma(lista, (c) => c.ult7d);
  const nomesTop10 = new Set(top20.slice(0, 10).map((c) => c.nome));
  const tambemTop10 = lista.filter((c) => nomesTop10.has(c.nome)).length;
  const semana = {
    total: semanaTotal,
    top10: semanaTop10,
    top10Pct: pct(semanaTop10, semanaTotal),
    lista,
    leitura: `Estar ativo agora não é o mesmo que ser grande no acumulado: ${tambemTop10} dos 10 da semana também estão entre os 10 maiores no total, ${10 - tambemTop10} só aparecem pelo recorte da semana, e uma única carteira fez ${fmt.n(lista[0].ult7d)} dos ${fmt.n(semanaTotal)} cadastros. A cobrança deve seguir a coluna da semana.`,
  };

  // ------------------------------------------------------------ metades e séries acumuladas
  const metades = carteiras.slice(0, 10).map((c, i) => {
    const a = Math.round(c.passageiros / (1 + razaoMetades[i]));
    const b = c.passageiros - a;
    return { nome: c.nome, a, b, tendencia: tendenciaDe(a, b), ult7d: c.ult7d };
  });
  const nA = iMeio;
  const nB = dias.length - iMeio;
  const metadesNota = `${fmt.data(D.inicio)} a ${fmt.data(somarDias(meio, -1))} contra ${fmt.data(meio)} a ${fmt.data(D.fim)}, ${nA === nB ? `${nA} dias cada` : `${nA} e ${nB} dias`}. Subiu = cresceu mais de 20%; caiu = recuou mais de 20%; estável = ficou no mesmo patamar. Carteira em queda há duas semanas não se recupera sozinha.`;

  const parcialPeso = (d) => (d === D.fim ? 0.45 : 1);
  const formas = [
    [(d, i) => 0.55 + i / 16, () => 1, (d) => parcialPeso(d)],
    [(d, i) => (i < 9 ? 0 : i - 7), (d, i) => 1.4 - i * 0.06, (d) => parcialPeso(d)],
    [() => 1, () => 1, (d) => parcialPeso(d)],
    [(d, i) => 0.8 + i / 40, () => 1, (d) => parcialPeso(d)],
    [(d, i) => (i < 4 ? 3.2 : Math.max(0.2, 1.2 - i * 0.05)), (d, i) => Math.max(0.2, 1.1 - i * 0.08), (d) => parcialPeso(d)],
  ];
  const controladores_acumulado = {};
  carteiras.slice(0, 5).forEach((c, i) => {
    const m = metades[i];
    const trechos: [string[], number][] = [
      [dias.slice(0, iMeio), m.a],
      [dias.slice(iMeio, iSemana), m.b - c.ult7d],
      [dias.slice(iSemana), c.ult7d],
    ];
    const diaria = trechos.flatMap(([ds, total], k) => U.serieDiaria({ dias: ds, total, rng, forma: formas[i][k], ruido: 0.3, parcial: D.medidoEm }));
    controladores_acumulado[c.nome] = U.acumular(diaria);
  });

  // ------------------------------------------------------------ faixas de carteira
  const FAIXAS = [
    { faixa: '1 a 9 pilotos', de: 1, ate: 9 },
    { faixa: '10 a 29 pilotos', de: 10, ate: 29 },
    { faixa: '30 a 39 pilotos', de: 30, ate: 39 },
    { faixa: '40 a 99 pilotos', de: 40, ate: 99 },
  ];
  const faixasCart = FAIXAS.map((f): FaixaCarteira => {
    const cs = regulares.filter((c) => c.pilotos >= f.de && c.pilotos <= f.ate);
    return { item: { faixa: f.faixa, carteiras: cs.length, passageiros: soma(cs, (c) => c.passageiros) }, pilotos: soma(cs, (c) => c.pilotos) };
  });
  faixasCart.push({ item: { faixa: '100 ou mais (triagem)', carteiras: 1, passageiros: triagem.passageiros, triagem: true }, pilotos: triagem.pilotos });
  if (soma(faixasCart, (f) => f.item.carteiras) !== todas.length) throw new Error('carteira fora das faixas');

  // ------------------------------------------------------------ rodada de expectativa
  const linhas = soma(todas, (c) => c.linhas);
  const respondidas = soma(todas, (c) => c.resp);
  const semCarimbo = linhas - respondidas;
  const responderamZero = Math.round(respondidas * rng.entre(0.625, 0.66));
  const linhasQueFormamReal = respondidas - responderamZero;
  const nF = U.distribuir(linhasQueFormamReal, [0.13, 0.27, 0.22, 0.34, 0.03].map((w) => w * rng.ruido(0.12)), 1);
  const faixas = [{ faixa: 'zero', v: responderamZero, zero: true }, ...['1–9', '10–19', '20–39', '40–99', '100+'].map((faixa, i) => ({ faixa, v: nF[i] }))];
  const diasRodada = intervalo(DATA_RODADA, D.fim);
  const vMutirao = Math.round(respondidas * rng.entre(0.53, 0.58));
  const outrosDias = U.distribuir(respondidas - vMutirao, [0.16, 0.27, 0.33, 0.24].map((w) => w * rng.ruido(0.12)));
  const respostasPorDia = diasRodada.map((dia, i) => ({ dia, v: i === 3 ? vMutirao : outrosDias[i < 3 ? i : 3], ...(dia === D.medidoEm ? { parcial: true } : {}) }));
  const diferencaSemCarimbo = Math.round(semCarimbo * rng.entre(13, 15.5));

  const porPilotos = [...todas].sort((a, b) => b.pilotos - a.pilotos || (b.nome ? 1 : 0) - (a.nome ? 1 : 0));
  const cobertura = porPilotos.slice(0, 15).map((c) => ({ nome: c.nome, ...(c.triagem ? { papel: 'conta de triagem da Rota 20' } : {}), resp: c.resp, pilotos: c.pilotos, pct: pct(c.resp, c.pilotos) }));

  const naoLancaram = todas.filter((c) => c.resp === 0 && c.passageiros > 0);
  const tudoSemPass = todas.filter((c) => c.linhas > 0 && c.resp >= c.linhas && c.passageiros === 0);
  const naoLancaramMasProduzem = { controladores: naoLancaram.length, passageiros: soma(naoLancaram, (c) => c.passageiros) };
  const lancaramTudoSemPassageiro = { controladores: tudoSemPass.length, pilotos: soma(tudoSemPass, (c) => c.pilotos) };

  const rodada = {
    data: DATA_RODADA,
    linhas,
    respondidas,
    respondidasPct: pct(respondidas, linhas),
    responderamZero,
    zeroPct: pct(responderamZero, respondidas),
    real: TR.real,
    semFiltro: TR.real + diferencaSemCarimbo,
    diferencaSemCarimbo,
    linhasQueFormamReal,
    mediaPorPiloto: arred(TR.real / linhasQueFormamReal, 1),
    semCarimbo,
    respostasPorDia,
    mutiraoPct: pct(vMutirao, respondidas),
    faixas,
    cobertura,
    coberturaNota: `Linhas respondidas sobre os pilotos que cada pessoa tem hoje. A rodada retrata ${fmt.data(DATA_RODADA)}; piloto que mudou de controlador depois continua pesando na conta de quem respondeu — por isso há quem passe de 100%.`,
    leitura: `As carteiras de verdade responderam quase inteiras. Foge à regra justamente a maior conta: a da fila de triagem da Rota 20 tem ${fmt.n(triagem.pilotos)} pilotos e respondeu ${fmt.n(triagem.resp)} ${triagem.resp === 1 ? 'linha' : 'linhas'}. Esses ${fmt.n(triagem.pilotos)} carregam ${fmt.n(decomp('deposito').meta)} de meta na Projetada sem ninguém cobrando.`,
  };

  // ------------------------------------------------------------ régua
  const statusPor = (v, verdeAte, amareloAte, menorMelhor = true) => (menorMelhor ? (v <= verdeAte ? 'verde' : v <= amareloAte ? 'amarelo' : 'vermelho') : v >= verdeAte ? 'verde' : v >= amareloAte ? 'amarelo' : 'vermelho');
  const comCadastro = todas.filter((c) => c.ult7d > 0).length;
  const dezOuMais = todas.filter((c) => c.ult7d >= 10).length;
  const nCart = todas.length;
  const regua = {
    nota: `Os limites verde/amarelo/vermelho são proposta deste capítulo para a pré-temporada, não medição. A coluna "hoje" é medida (${fmt.data(D.medidoEm)}, dia incompleto).`,
    linhas: [
      { metrica: 'Pilotos sem dono real (órfãos + fila de triagem)', verde: 'até 40', amarelo: '41 a 180', vermelho: 'mais de 180', hoje: fmt.n(SD.total), status: statusPor(SD.total, 40, 180) },
      { metrica: 'Linhas da rodada respondidas', verde: '80% ou mais', amarelo: '55% a 79%', vermelho: 'menos de 55%', hoje: fmt.pct(rodada.respondidasPct), status: statusPor(rodada.respondidasPct, 80, 55, false) },
      { metrica: 'Controladores que cadastraram alguém na semana', verde: '38 ou mais', amarelo: '22 a 37', vermelho: 'menos de 22', hoje: `${comCadastro} de ${nCart}`, status: statusPor(comCadastro, 38, 22, false) },
      { metrica: 'Controladores com 10 ou mais cadastros na semana', verde: '26 ou mais', amarelo: '13 a 25', vermelho: 'menos de 13', hoje: `${dezOuMais} de ${nCart}`, status: statusPor(dezOuMais, 26, 13, false) },
      { metrica: 'Pilotos com dono que nunca falaram com o bot', verde: 'até 250', amarelo: '251 a 500', vermelho: 'mais de 500', hoje: fmt.n(A.PILOTOS.semContatoComDono), status: statusPor(A.PILOTOS.semContatoComDono, 250, 500) },
    ],
  };

  // ------------------------------------------------------------ textos
  const pertoReal = Math.abs(TR.metaDeQuemJaProduz.v - TR.real);
  const distanciaMil = Math.floor((TR.projetada - Math.max(TR.real, TR.metaDeQuemJaProduz.v)) / 10000) * 10;
  const pertoDeMil = Math.round((TR.real + TR.metaDeQuemJaProduz.v) / 2000);
  const feedbacksTotal = rng.int(962, 1108);
  const maxPessoasDia = rng.int(8, 9);

  const controladores = {
    letra: 'C',
    titulo: 'Controladores e expectativa: quem sustenta a rede',
    pergunta: 'Quem produz, quem lança expectativa e o que cabe dentro da Projetada.',
    frase: `A Projetada conta fichas: soma a meta de cada piloto ativo, com ou sem dono, conversa ou passageiro. A Real conta outra coisa — quanto a pessoa que coordena aquele piloto acredita que ele vai trazer. A primeira é ${fmt.dec(TR.razaoProjetadaReal)} vezes a segunda, e essa distância não vem de otimismo: vem de cadastro que ninguém acompanha.`,
    kpis: [
      { v: A.PILOTOS.contasControlador, rotulo: `contas de controlador ativas (${fmt.n(A.PILOTOS.controladoresComPiloto)} com ao menos um piloto)` },
      { v: TR.projetada, rotulo: `Projetada — soma das metas dos ${fmt.n(ativos)} pilotos ativos` },
      { v: TR.real, rotulo: `Real lançada — rodada de ${fmt.data(DATA_RODADA)}` },
      { v: TR.contabilizados, rotulo: `Contabilizados — passageiros no banco desde ${fmt.data(D.inicio)}` },
    ],
    contasAtivas: A.PILOTOS.contasControlador,
    comPiloto: A.PILOTOS.controladoresComPiloto,
    comoLerLancou: 'Só conta a linha com carimbo de envio (lancadoEm). Zero carimbado é resposta — "este piloto não vai trazer ninguém". Linha sem carimbo não vale zero: quer dizer que ninguém respondeu.',
    carteiras: faixasCart.map((f) => f.item),
    pilotosComControlador,
    top20,
    top10Soma,
    semana,
    metades,
    metadesNota,
    feedbacks: { total: feedbacksTotal, dias: 15, maxPessoasDia, leitura: `Em nenhum dia mais de ${maxPessoasDia} pessoas diferentes escreveram: o hábito de dar retorno mora no mesmo pequeno grupo que produz.` },
    rodada,
    semDono: { total: SD.total, orfaos: SD.orfaos, triagem: SD.triagem, meta: SD.meta, pctProjetada: SD.pctProjetada, comPassageiro: SD.comPassageiro },
    naoLancaramMasProduzem,
    lancaramTudoSemPassageiro,
    muda: [
      { t: `${fmt.n(SD.total)} pilotos estão sem dono de verdade — e ninguém cobra por eles.`, d: `São ${fmt.n(SD.orfaos)} órfãos e ${fmt.n(SD.triagem)} parados na conta de triagem da Rota 20. Somam ${fmt.n(SD.meta)} de meta projetada (${fmt.pct(SD.pctProjetada)} da Projetada) e só ${fmt.n(SD.comPassageiro)} deles têm algum passageiro. Na rodada de ${fmt.data(DATA_RODADA)} essa conta respondeu ${fmt.n(triagem.resp)} ${triagem.resp === 1 ? 'linha' : 'linhas'} de ${fmt.n(triagem.linhas)}.` },
      { t: 'A rodada teve resposta — e a resposta mais comum foi zero.', d: `${fmt.n(respondidas)} das ${fmt.n(linhas)} linhas têm carimbo (${fmt.pct(rodada.respondidasPct)}); ${fmt.n(responderamZero)} delas vieram com zero, e a Real inteira sai de ${fmt.n(linhasQueFormamReal)} linhas. O ponto cego são as ${fmt.n(semCarimbo)} sem carimbo: ninguém sabe se valem zero ou se ninguém perguntou.` },
      { t: top10Soma.pct > 50 ? 'Dez carteiras sustentam mais da metade da rede.' : 'Dez carteiras sustentam boa parte da rede.', d: `Os 10 maiores somam ${fmt.n(top10Pass)} dos ${fmt.n(deTotalComControlador)} passageiros com controlador (${fmt.pct(top10Soma.pct)}). Na última semana, 10 carteiras fizeram ${fmt.n(semanaTop10)} dos ${fmt.n(semanaTotal)} cadastros; a maior delas, ${fmt.n(lista[0].ult7d)}.` },
      { t: 'Responder a rodada não é o mesmo que produzir.', d: `${fmt.n(naoLancaramMasProduzem.controladores)} controladores não lançaram linha nenhuma e ainda assim somam ${fmt.n(naoLancaramMasProduzem.passageiros)} passageiros. Outros ${fmt.n(lancaramTudoSemPassageiro.controladores)}, com ${fmt.n(lancaramTudoSemPassageiro.pilotos)} pilotos, responderam todas as linhas e não têm passageiro nenhum.` },
      { t: `Duas contas independentes param perto de ${fmt.n(pertoDeMil)} mil.`, d: `A Real (${fmt.n(TR.real)}) fica a ${fmt.pct(pct(pertoReal, TR.metaDeQuemJaProduz.v))} da soma das metas dos ${fmt.n(TR.metaDeQuemJaProduz.pilotos)} pilotos que já cadastraram alguém (${fmt.n(TR.metaDeQuemJaProduz.v)}). Podem coincidir por acaso — mas ambas estão a mais de ${distanciaMil} mil da Projetada. A logística se planeja pela Real, não pela Projetada.` },
    ],
    naoMede: [
      `A Real não traz data: informa tamanho, não prazo. Nenhuma rodada perguntou "quantos entre ${fmt.data(D.faseB.inicio)} e ${fmt.data(D.diaD)}".`,
      'Com uma rodada só não existe série: não há como dizer se a expectativa subiu ou caiu.',
      'O zero tem dois sentidos: "não traz ninguém" e "não sei" chegam ao banco do mesmo jeito.',
      'Cada piloto tem um único controlador: quando ele troca, o histórico sai do ranking de quem o cedeu.',
      'Não há medida de esforço: carteira parada tanto pode ser gente parada quanto gente trabalhando sem registrar.',
      'O carimbo não prova conversa: lancadoEm mostra que alguém respondeu no painel, não que falou com o piloto.',
    ],
    regua,
    p: [22, 27],
  };

  return {
    livro: { controladores },
    series: { carteiras_pilotos: faixasCart.map((f) => f.pilotos), controladores_acumulado },
  };
}

export function verificar(saida: SaidaCapitulo, { A, U }: Contexto): string[] {
  const { soma, pct, arred, fmt } = U;
  const erros = [];
  const C = saida.livro.controladores;
  const S = saida.series;
  const SD = A.PILOTOS.semDono;
  const ativos = A.PILOTOS.funil.find((f) => f.id === 'ativos').v;
  const eq = (a, b, o) => {
    if (a !== b) erros.push(`${o}: ${a} ≠ ${b}`);
  };

  // pessoas
  const permitidos = new Set([...A.PESSOAS.controladores, ...A.PESSOAS.outrosControladores, A.PESSOAS.contaTriagem]);
  for (const n of [...C.top20, ...C.semana.lista, ...C.metades, ...C.rodada.cobertura].map((x) => x.nome)) if (!permitidos.has(n)) erros.push(`nome fora de PESSOAS: ${n}`);
  eq(C.top20.map((c) => c.nome).join('|'), A.PESSOAS.controladores.join('|'), 'ordem do top 20');

  // âncoras
  eq(C.contasAtivas, A.PILOTOS.contasControlador, 'contas ativas');
  eq(C.comPiloto, A.PILOTOS.controladoresComPiloto, 'com piloto');
  eq(C.pilotosComControlador, ativos - SD.orfaos, 'pilotos com controlador');
  for (const k of Object.keys(SD)) eq(C.semDono[k], SD[k], `semDono.${k}`);
  eq(C.rodada.real, A.TRES.real, 'Real');
  eq(C.kpis.map((k) => k.v).join('|'), [A.PILOTOS.contasControlador, A.TRES.projetada, A.TRES.real, A.TRES.contabilizados].join('|'), 'kpis');

  // carteiras
  eq(soma(C.carteiras, (c) => c.carteiras), C.comPiloto, 'soma das carteiras');
  eq(soma(S.carteiras_pilotos), C.pilotosComControlador, 'soma de carteiras_pilotos');
  eq(S.carteiras_pilotos.length, C.carteiras.length, 'tamanho de carteiras_pilotos');
  eq(soma(C.carteiras, (c) => c.passageiros), C.top10Soma.deTotalComControlador, 'passageiros das carteiras');
  const tri = C.carteiras.findIndex((c) => c.triagem);
  eq(S.carteiras_pilotos[tri], SD.triagem, 'pilotos da carteira de triagem');
  if (C.top10Soma.deTotalComControlador > A.TRES.contabilizados) erros.push('com controlador passa dos contabilizados');

  // top 20
  C.top20.forEach((c, i) => {
    if (i && c.passageiros >= C.top20[i - 1].passageiros) erros.push(`top20 fora de ordem em ${i}`);
    eq(c.produzemPct, pct(c.produzem, c.pilotos), `produzemPct ${i}`);
    if (c.produzem > c.pilotos || c.ult7d > c.passageiros) erros.push(`top20 ${i} incoerente`);
  });
  eq(C.top10Soma.passageiros, soma(C.top20.slice(0, 10), (c) => c.passageiros), 'top10Soma');
  eq(C.top10Soma.pct, pct(C.top10Soma.passageiros, C.top10Soma.deTotalComControlador), 'top10Soma.pct');
  const demaisPass = C.top10Soma.deTotalComControlador - soma(C.top20, (c) => c.passageiros) - C.carteiras[tri].passageiros;
  const demaisPil = C.pilotosComControlador - soma(C.top20, (c) => c.pilotos) - SD.triagem;
  if (demaisPass <= 0 || demaisPil <= 0) erros.push('carteiras menores sem sobra');

  // semana
  eq(C.semana.lista.length, 10, 'lista da semana');
  eq(soma(C.semana.lista, (c) => c.ult7d), C.semana.top10, 'semana.top10');
  eq(C.semana.top10Pct, pct(C.semana.top10, C.semana.total), 'semana.top10Pct');
  C.semana.lista.forEach((x, i) => {
    if (i && x.ult7d > C.semana.lista[i - 1].ult7d) erros.push('semana fora de ordem');
    const t = C.top20.find((c) => c.nome === x.nome);
    if (t && (t.ult7d !== x.ult7d || t.passageiros !== x.total)) erros.push(`semana × top20: ${x.nome}`);
  });
  const menorDaLista = C.semana.lista.at(-1).ult7d;
  for (const c of C.top20) if (!C.semana.lista.some((x) => x.nome === c.nome) && c.ult7d > menorDaLista) erros.push(`${c.nome} devia estar na semana`);

  // metades e acumulados
  for (const m of C.metades) {
    const t = C.top20.find((c) => c.nome === m.nome);
    eq(m.a + m.b, t.passageiros, `metades ${m.nome}`);
    eq(m.ult7d, t.ult7d, `metades ult7d ${m.nome}`);
    eq(m.tendencia, m.b > m.a * 1.2 ? 'subiu' : m.b < m.a * 0.8 ? 'caiu' : 'estavel', `tendência ${m.nome}`);
    if (m.b < m.ult7d) erros.push(`metade 2 menor que a semana: ${m.nome}`);
  }
  const chaves = Object.keys(S.controladores_acumulado);
  eq(chaves.join('|'), A.PESSOAS.controladores.slice(0, 5).join('|'), 'chaves de controladores_acumulado');
  for (const nome of chaves) {
    const s = S.controladores_acumulado[nome];
    const t = C.top20.find((c) => c.nome === nome);
    const m = C.metades.find((x) => x.nome === nome);
    eq(s.length, A.DATAS.dias, `dias do acumulado ${nome}`);
    eq(s.at(-1).v, t.passageiros, `fim do acumulado ${nome}`);
    eq(s[16].v, m.a, `1ª metade do acumulado ${nome}`);
    eq(s.at(-1).v - s.at(-8).v, t.ult7d, `7 dias do acumulado ${nome}`);
    if (s.some((p, i) => i && p.v < s[i - 1].v)) erros.push(`acumulado desce: ${nome}`);
  }
  if (!(C.metades as { tendencia: string; nome: string }[]).some((m) => m.tendencia === 'caiu' && m.nome === A.PESSOAS.controladores[4])) erros.push('a quinta carteira devia ter caído');

  // rodada
  const R = C.rodada;
  eq(R.respondidas + R.semCarimbo, R.linhas, 'linhas da rodada');
  eq(R.respondidasPct, pct(R.respondidas, R.linhas), 'respondidasPct');
  eq(soma(R.faixas, (f) => f.v), R.respondidas, 'faixas');
  eq(R.faixas.find((f) => f.zero).v, R.responderamZero, 'faixa zero');
  eq(R.zeroPct, pct(R.responderamZero, R.respondidas), 'zeroPct');
  eq(R.linhasQueFormamReal, R.respondidas - R.responderamZero, 'linhas que formam a Real');
  eq(R.mediaPorPiloto, arred(R.real / R.linhasQueFormamReal, 1), 'média por piloto');
  eq(R.semFiltro - R.real, R.diferencaSemCarimbo, 'sem filtro');
  eq(soma(R.respostasPorDia, (d) => d.v), R.respondidas, 'respostas por dia');
  const maxDia = Math.max(...R.respostasPorDia.map((d) => d.v));
  eq(R.mutiraoPct, pct(maxDia, R.respondidas), 'mutiraoPct');
  if (!R.respostasPorDia.at(-1).parcial) erros.push('último dia da rodada devia ser parcial');
  const LIM = { '1–9': [1, 9], '10–19': [10, 19], '20–39': [20, 39], '40–99': [40, 99], '100+': [100, 400] };
  const nz = R.faixas.filter((f) => !f.zero);
  const min = soma(nz, (f) => f.v * LIM[f.faixa][0]);
  const max = soma(nz, (f) => f.v * LIM[f.faixa][1]);
  if (R.real < min || R.real > max) erros.push(`Real ${R.real} não cabe nas faixas (${min}–${max})`);
  const triCob = R.cobertura.find((x) => /triagem/i.test(x.papel || ''));
  if (!triCob || triCob.pilotos !== SD.triagem || triCob.nome !== A.PESSOAS.contaTriagem) erros.push('cobertura sem a conta de triagem');
  R.cobertura.forEach((x, i) => {
    eq(x.pct, pct(x.resp, x.pilotos), `cobertura pct ${x.nome}`);
    if (i && x.pilotos > R.cobertura[i - 1].pilotos) erros.push('cobertura fora de ordem');
    const t = C.top20.find((c) => c.nome === x.nome);
    if (t && (t.lancaram !== x.resp || t.deHoje !== x.pilotos)) erros.push(`cobertura × top20: ${x.nome}`);
  });
  if (!R.cobertura.some((x) => x.pct > 100)) erros.push('cobertura sem ninguém acima de 100%');
  eq(R.cobertura.length, 15, 'cobertura');

  // régua
  const r = (re) => C.regua.linhas.find((l) => re.test(l.metrica));
  eq(r(/sem dono/i).hoje, fmt.n(SD.total), 'régua sem dono');
  eq(r(/nunca falaram/i).hoje, fmt.n(A.PILOTOS.semContatoComDono), 'régua nunca falaram');
  eq(r(/respondidas/i).hoje, fmt.pct(R.respondidasPct), 'régua respondidas');
  for (const l of C.regua.linhas.filter((x) => / de \d+$/.test(x.hoje))) if (!l.hoje.endsWith(` de ${C.comPiloto}`)) erros.push(`régua: ${l.hoje}`);
  return erros;
}
