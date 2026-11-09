// Capítulo B · Passageiros: série diária, relógio de cadastros, times, faixas de produção e as medidas frágeis.
import type { Contexto, SaidaCapitulo } from './tipos.ts';

const FAIXAS_DO_DIA: [string, number, number][] = [
  ['0–7h', 0, 7],
  ['8–11h', 8, 11],
  ['12–14h', 12, 14],
  ['15–18h', 15, 18],
  ['19–21h', 19, 21],
  ['22–23h', 22, 23],
];
const ORDEM_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
const FORMA_DIA = { seg: 0.86, ter: 1.04, qua: 1.28, qui: 1.0, sex: 0.9, 'sáb': 0.72, dom: 0.46 };
const FORMA_BLOCO = { 'sáb': 0.92, dom: 0.58, seg: 0.62, ter: 1.0, qua: 1.36, qui: 0.8, sex: 1.6 };
const DOMINGO_HORA = (h) => (h >= 14 && h <= 21 ? 1.7 : h >= 8 && h <= 12 ? 0.55 : 1);
const PERFIL_HORA = [0.35, 0.12, 0.08, 0.08, 0.06, 0.1, 0.35, 0.5, 1.3, 1.8, 2.2, 2.4, 2.4, 2.32, 2.5, 3.0, 2.4, 2.4, 2.8, 2.7, 2.8, 2.26, 1.55, 1.0];
const PESO_22H_SEGUNDA = 14;
const LIMIAR_CHEIA = 20;

const noite = (h) => h >= 22 || h < 8;

export function gerar({ rng, A, U }: Contexto): SaidaCapitulo {
  const { DATAS, PASSAGEIROS: PX, PILOTOS: PI, TRES, VOCAB, CENTRAL } = A;
  const { fmt, soma, pct, arred } = U;
  const dias = U.intervalo(DATAS.inicio, DATAS.fim);
  const hoje = DATAS.medidoEm;
  const bloco = U.intervalo(U.somarDias(hoje, -7), U.somarDias(hoje, -1));
  const blocoTotal = Math.round(PX.ritmoAtual * 7);
  const melhor = PX.melhorDia;
  const recorde = PX.recordePilotosDia;
  const diaForte = recorde.dia;
  const diaDomingo = bloco.find((d) => U.diaSemana(d) === 'dom');
  const diaComum = bloco.find((d) => U.diaSemana(d) === 'ter');
  const semanasDias = DATAS.semanas.map((s) => U.intervalo(s, U.somarDias(s, 6)).filter((d) => d <= hoje));
  const ativos = PI.funil.find((x) => x.id === 'ativos').v;

  // ---------------------------------------------------------------- passageiros por dia
  const quartaForte = semanasDias[3].find((d) => U.diaSemana(d) === 'qua');
  function tentarSerie() {
    const porDia = {};
    U.serieDiaria({ dias: bloco, total: blocoTotal, rng, forma: (d) => FORMA_BLOCO[U.diaSemana(d)], ruido: 0.08 }).forEach((p) => (porDia[p.d] = p.v));
    porDia[hoje] = rng.int(196, 229);
    const totais = [rng.int(1890, 1990), rng.int(2590, 2690), rng.int(1540, 1640)];
    const ultima = soma(semanasDias[4], (d) => porDia[d]);
    totais.push(PX.contabilizados - soma(totais) - ultima, ultima);
    for (let i = 0; i < 4; i++) {
      const fixos = {};
      for (const d of semanasDias[i]) if (d in porDia) fixos[d] = porDia[d];
      if (semanasDias[i].includes(melhor.dia)) fixos[melhor.dia] = melhor.v;
      U.serieDiaria({ dias: semanasDias[i], total: totais[i], rng, forma: (d) => FORMA_DIA[U.diaSemana(d)] * (d === quartaForte ? 1.55 : 1), ruido: 0.26, fixos }).forEach((p) => (porDia[p.d] = p.v));
    }
    const serie = dias.map((d) => ({ d, v: porDia[d], ...(d === hoje ? { parcial: true } : {}) }));
    const outros = serie.filter((p) => p.d !== melhor.dia);
    const semanas = semanasDias.map((ds) => soma(ds, (d) => porDia[d]));
    const mm = U.mediaMovel7(serie).filter((p) => p.d >= melhor.dia);
    const ok =
      outros.every((p) => p.v >= 70 && p.v < melhor.v - 40) &&
      semanas[1] > Math.max(semanas[0], semanas[2], semanas[3], semanas[4]) &&
      semanasDias[4].filter((d) => d !== diaForte && d !== hoje).every((d) => porDia[d] < porDia[diaForte]) &&
      porDia[diaDomingo] < porDia[diaComum] &&
      porDia[diaComum] < porDia[diaForte] &&
      mm[mm.length - 1].v < Math.max(...mm.map((p) => p.v)) - 40;
    return ok ? serie : null;
  }
  let passageirosDia = null;
  for (let i = 0; i < 400 && !passageirosDia; i++) passageirosDia = tentarSerie();
  if (!passageirosDia) throw new Error('não achei série diária que feche com as âncoras');
  const vDe = Object.fromEntries(passageirosDia.map((p) => [p.d, p.v]));
  const parcialV = vDe[hoje];

  // ---------------------------------------------------------------- pilotos distintos por dia
  const pilotosBloco = Math.round(blocoTotal / PX.produtividade7d);
  function tentarPilotos() {
    const out = {};
    const outrosBloco = bloco.filter((d) => d !== diaForte);
    const partes = U.distribuir(pilotosBloco - recorde.v, outrosBloco.map((d) => (vDe[d] / PX.produtividade7d) * rng.ruido(0.1)));
    outrosBloco.forEach((d, i) => (out[d] = partes[i]));
    out[diaForte] = recorde.v;
    for (const d of dias) {
      if (d in out) continue;
      const bruto = Math.round(vDe[d] / (9.5 * rng.ruido(0.14)));
      out[d] = Math.max(6, Math.min(bruto, rng.int(41, 46)));
    }
    out[hoje] = Math.round(parcialV / 9.3);
    const ok = dias.every((d) => d === diaForte || out[d] <= recorde.v - 1) && bloco.every((d) => vDe[d] / out[d] > 5.5 && vDe[d] / out[d] < 14);
    return ok ? dias.map((d) => ({ d, v: out[d], ...(d === hoje ? { parcial: true } : {}) })) : null;
  }
  let pilotosDia = null;
  for (let i = 0; i < 400 && !pilotosDia; i++) pilotosDia = tentarPilotos();
  if (!pilotosDia) throw new Error('não achei série de pilotos que feche com o recorde');
  const plDe = Object.fromEntries(pilotosDia.map((p) => [p.d, p.v]));

  // ---------------------------------------------------------------- hora a hora, todos os dias
  const horas = {};
  const sortearHoras = (d) => {
    const ds = U.diaSemana(d);
    const pesos = PERFIL_HORA.map((w, h) => (h === 22 && ds === 'seg' ? PESO_22H_SEGUNDA : w) * (ds === 'dom' ? DOMINGO_HORA(h) : 1) * rng.ruido(0.3));
    if (d === hoje) return [...U.distribuir(vDe[d], pesos.slice(0, 15)), ...Array(9).fill(0)];
    return U.distribuir(vDe[d], pesos);
  };
  for (const d of dias) horas[d] = sortearHoras(d);
  const cheiasDe = (d) => horas[d].filter((v) => v >= LIMIAR_CHEIA).length;
  for (let i = 0; i < 400; i++) {
    const c = [diaForte, diaComum, diaDomingo].map(cheiasDe);
    if (c[0] > c[1] && c[1] > c[2] && c[2] >= 2 && Math.max(...horas[diaForte]) >= Math.max(...horas[diaComum])) break;
    for (const d of [diaForte, diaComum, diaDomingo]) horas[d] = sortearHoras(d);
  }

  const janela = U.intervalo(U.somarDias(hoje, -29), hoje);
  const inicioUltimos14 = U.somarDias(hoje, -13);
  const ajustaveis = janela.filter((d) => d < inicioUltimos14);
  const colunas = () => Array.from({ length: 24 }, (_, h) => soma(janela, (d) => horas[d][h]));
  const mover = (d, de, para) => {
    horas[d][de]--;
    horas[d][para]++;
  };
  const diurnas = [9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21];
  const doadora = (d, lista) => lista.reduce((a, h) => (horas[d][h] > (a === null ? 0 : horas[d][a]) ? h : a), null);
  const totalJanela = soma(janela, (d) => vDe[d]);
  {
    let C = colunas();
    const outrosMax = Math.max(...C.filter((_, h) => h !== 15 && h !== 22));
    const vao = rng.int(9, 17);
    const alvo22 = Math.max(C[22], outrosMax + rng.int(16, 30), C[15] - vao);
    const alvo15 = alvo22 + vao;
    const segundas = ajustaveis.filter((d) => U.diaSemana(d) === 'seg');
    let k = 0;
    for (let n = alvo15 - C[15]; n > 0; n--, k++) {
      const d = ajustaveis[k % ajustaveis.length];
      const h = doadora(d, diurnas);
      if (h === null) continue;
      mover(d, h, 15);
    }
    for (let n = alvo22 - colunas()[22]; n > 0; n--, k++) {
      const pool = k % 3 === 2 ? ajustaveis : segundas;
      const d = pool[k % pool.length];
      const h = doadora(d, diurnas);
      if (h === null) continue;
      mover(d, h, 22);
    }
    const noturnas = [23, 0, 1, 2, 3, 4, 5, 6, 7];
    const alvoNoite = Math.round(totalJanela * (PX.madrugadaPct / 100));
    for (let guarda = 0; guarda < 5000; guarda++, k++) {
      C = colunas();
      const m = soma(C.filter((_, h) => noite(h)));
      if (m === alvoNoite) break;
      const d = ajustaveis[k % ajustaveis.length];
      if (m > alvoNoite) {
        const de = doadora(d, noturnas);
        if (de === null) continue;
        const para = [8, 9, 10, 11, 12, 13].reduce((a, h) => (C[h] < C[a] ? h : a), 8);
        mover(d, de, para);
      } else {
        const de = doadora(d, diurnas);
        if (de === null) continue;
        mover(d, de, k % 2 ? 23 : 0);
      }
    }
  }
  const horas30d = colunas();

  // matriz dia da semana × hora na janela de 30 dias
  const matriz = ORDEM_SEMANA.map((ds) => Array.from({ length: 24 }, (_, h) => soma(janela.filter((d) => U.diaSemana(d) === ds), (d) => horas[d][h])));
  const maxCel = Math.max(...matriz.flat());
  const niveis = matriz.map((l) => l.map((v) => (v === 0 ? 0 : Math.max(1, Math.round((v / maxCel) * 255)))));
  const celulas = matriz.flatMap((l, i) => l.map((v, h) => ({ i, h, v }))).sort((a, b) => b.v - a.v);
  const onda = matriz.map((l) => l[22]);
  const mediaDiaSemana = matriz.map((l) => Math.round(soma(l) / (30 / 7)));
  const madrugada = soma(horas30d.filter((_, h) => noite(h)));
  const acum = [];
  horas30d.reduce((a, v, h) => (acum[h] = a + v), 0);
  const metadeHora = acum.findIndex((v) => v >= totalJanela / 2);
  const picoOnda = onda.indexOf(Math.max(...onda));

  // ---------------------------------------------------------------- últimos 14 dias em faixas
  const ultimosDias = U.intervalo(inicioUltimos14, hoje);
  const extraParcial = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, rng.int(27, 41), rng.int(4, 11), 0, 0, 0, 0, 0, 0, 0];
  const ultimos14 = ultimosDias.map((d) => {
    const hs = d === hoje ? horas[d].map((v, h) => v + extraParcial[h]) : horas[d];
    const f = FAIXAS_DO_DIA.map(([, a, b]) => soma(hs.slice(a, b + 1)));
    return { dia: d, s: U.diaSemana(d), f, cheias: hs.filter((v) => v >= LIMIAR_CHEIA).length, total: soma(hs), ...(d === hoje ? { parcial: true } : {}) };
  });
  let horaMaisCheia = { v: -1, d: null, h: null };
  for (const d of ultimosDias) if (d !== hoje) horas[d].forEach((v, h) => v > horaMaisCheia.v && (horaMaisCheia = { v, d, h }));

  const tresDias = Object.fromEntries([diaForte, diaComum, diaDomingo].map((d) => [d, [...horas[d]]]));

  // ---------------------------------------------------------------- semanas
  const semanas = semanasDias.map((ds, i) => ({ semana: DATAS.semanas[i], v: soma(ds, (d) => vDe[d]), ...(i === semanasDias.length - 1 ? { aberta: true, diasMedidos: ds.length } : {}) }));
  const somaSemanaPilotos = semanasDias.map((ds) => soma(ds, (d) => plDe[d]));
  const maxSemanaPilotos = semanasDias.map((ds) => Math.max(...ds.map((d) => plDe[d])));
  const vivos = PI.vivosVariantes;
  const pilotosPorSemana = [rng.int(58, 72), rng.int(84, 98), rng.int(103, 113), vivos.ultimaSemanaCompleta, vivos.semanaAberta].map((v, i) => ({ semana: DATAS.semanas[i], v: Math.min(Math.max(v, maxSemanaPilotos[i]), somaSemanaPilotos[i]), ...(i === 4 ? { aberta: true } : {}) }));

  // ---------------------------------------------------------------- times e famílias
  const F = VOCAB.familias;
  const lid = PX.lideranca;
  const r20 = PI.linhaImportadaR20;
  const semRotuloPilotos = rng.int(248, 279);
  const semRotuloPass = rng.int(1040, 1160);
  const r40Pilotos = ativos - lid.pilotos - r20.pilotos - semRotuloPilotos;
  const r40Pass = PX.somaTabelaTimes - lid.registros - r20.passageiros - semRotuloPass;
  const produtoresTotal = TRES.metaDeQuemJaProduz.pilotos;
  const lidProduz = rng.int(52, 58);
  const r20Produz = 3;
  const semRotuloProduz = rng.int(27, 33);
  const r40Produz = produtoresTotal - lidProduz - r20Produz - semRotuloProduz;
  const ruidoPesos = (lista, r) => lista.map((w) => w * rng.ruido(r));
  const grupos = [
    { familia: F.grande, times: ['R40_CAPITAL', 'R40_INTERIOR', 'R40_LITORAL'], pilotos: U.distribuir(r40Pilotos, ruidoPesos([1209, 74, 56], 0.06)), pass: U.distribuir(r40Pass, ruidoPesos([4679, 489, 254], 0.07)), produzem: U.distribuir(r40Produz, ruidoPesos([141, 27, 18], 0.08)) },
    { familia: F.lideranca, times: ['COMUNIDADE_NORTE', 'EMBAIXADA_200', 'EMBAIXADA_100', 'EMBAIXADA_MAIS_100', 'COMUNIDADE_SUL'], pilotos: U.distribuir(lid.pilotos, ruidoPesos([43, 9, 27, 10, 13], 0.08)), pass: U.distribuir(lid.registros, ruidoPesos([1362, 874, 781, 188, 113], 0.07)), produzem: U.distribuir(lidProduz, ruidoPesos([29, 5, 12, 3, 7], 0.08), 1) },
    { familia: F.semRotulo, times: ['(sem rótulo)'], pilotos: [semRotuloPilotos], pass: [semRotuloPass], produzem: [semRotuloProduz] },
    { familia: F.lista, times: ['R20_CAPITAL', 'R20_INTERIOR', 'R20_LITORAL'], pilotos: [r20.capital, ...U.distribuir(r20.pilotos - r20.capital, [2, 1])], pass: [rng.int(6, 8), 0, 0], produzem: [1, 2, 0] },
  ];
  const r20g = grupos[3];
  r20g.pass[1] = r20.passageiros - r20g.pass[0];
  const ult7dTotal = soma(U.intervalo(U.somarDias(hoje, -6), hoje), (d) => vDe[d]);
  const linhasTimes = grupos.flatMap((g) => g.times.map((time, i) => ({ time, familia: g.familia, pilotos: g.pilotos[i], passageiros: g.pass[i], produzem: Math.min(g.produzem[i], g.pilotos[i], g.pass[i]) })));
  const faltaProduz = produtoresTotal - soma(linhasTimes, (t) => t.produzem);
  if (faltaProduz) linhasTimes[0].produzem += faltaProduz;
  const vivosTimes = linhasTimes.filter((t) => t.familia !== F.lista && t.passageiros > 0);
  const ult7d = U.distribuir(ult7dTotal, vivosTimes.map((t) => t.passageiros * rng.ruido(0.45)));
  const times = linhasTimes
    .map((t) => {
      const iv = vivosTimes.indexOf(t);
      const lideranca = t.familia === F.lideranca;
      return {
        ...t,
        produzemPct: pct(t.produzem, t.pilotos),
        mediaQuemProduz: t.produzem ? arred(t.passageiros / t.produzem, 1) : null,
        bateram: t.produzem ? Math.min(t.produzem, Math.round(t.produzem * rng.entre(lideranca ? 0.12 : 0.22, lideranca ? 0.32 : 0.42))) : 0,
        ult7d: iv >= 0 ? ult7d[iv] : 0,
      };
    })
    .sort((a, b) => b.passageiros - a.passageiros);
  const nomeFamilia = { [F.grande]: `${F.grande} — a rede grande`, [F.lideranca]: F.lideranca, [F.semRotulo]: F.semRotulo, [F.lista]: `${F.lista} — lista importada` };
  const familias = [F.grande, F.lideranca, F.semRotulo, F.lista].map((fam) => {
    const ts = times.filter((t) => t.familia === fam);
    const pil = soma(ts, (t) => t.pilotos);
    const pas = soma(ts, (t) => t.passageiros);
    return { familia: nomeFamilia[fam], pilotos: pil, redePct: pct(pil, ativos), passageiros: pas, registrosPct: pct(pas, PX.somaTabelaTimes), produzem: soma(ts, (t) => t.produzem) };
  });
  const famLid = familias[1];
  const famR20 = familias[3];
  const timeTopo = times[0];
  const timeLid = times.find((t) => t.familia === F.lideranca);
  const timesSerie = [
    { time: timeTopo.time, serie: timeTopo.passageiros + rng.int(19, 41), tabela: timeTopo.passageiros },
    { time: timeLid.time, serie: timeLid.passageiros - rng.int(9, 21), tabela: timeLid.passageiros },
  ];

  // ---------------------------------------------------------------- faixas de produção
  const bandas: [string, number, number, number, [number, number] | null][] = [
    ['1–4', 1, 4, 38, [2.0, 2.6]],
    ['5–9', 5, 9, 35, [6.4, 7.2]],
    ['10–19', 10, 19, 43, [13.6, 15.0]],
    ['20–39', 20, 39, 47, [27.5, 30.5]],
    ['40–87', 40, 87, 80, [53, 59]],
    ['88+', 88, Infinity, 31, null],
  ];
  const nBandas = U.distribuir(produtoresTotal, bandas.map((b) => b[3] * rng.ruido(0.08)), 5);
  const passBandas = bandas.map((b, i) => (b[4] ? Math.round(nBandas[i] * rng.entre(b[4][0], b[4][1])) : 0));
  passBandas[5] = PX.somaTabelaTimes - soma(passBandas);
  const faixasProducao = [{ faixa: '0', passageiros: 0, pilotos: ativos - produtoresTotal }, ...bandas.map((b, i) => ({ faixa: b[0], passageiros: passBandas[i], pilotos: nBandas[i] }))];
  const topo = faixasProducao[faixasProducao.length - 1];

  const nTempo = U.distribuir(produtoresTotal, [118, 57, 16, 26, 37, 29].map((w) => w * rng.ruido(0.12)));
  const tempoAtePrimeiro = ['≤1 h', '1–6 h', '6–24 h', '1–3 d', '3–7 d', '>7 d'].map((faixa, i) => ({ faixa, v: nTempo[i] }));
  const em24h = nTempo[0] + nTempo[1] + nTempo[2];
  const comDoisDias = ativos - rng.int(19, 31);

  const paradosSete = PI.paradosSete;
  const hojeProdutores = plDe[hoje] + rng.int(6, 13);
  const recentes = U.distribuir(produtoresTotal - paradosSete.v - hojeProdutores, [55, 52].map((w) => w * rng.ruido(0.1)));
  const velhos = U.distribuir(paradosSete.v, [59, 79].map((w) => w * rng.ruido(0.1)));
  const faltaVelhos = U.distribuir(paradosSete.devem, velhos.map((v) => v * rng.entre(18, 22)));
  const parados = [
    { faixa: 'cadastrou hoje', v: hojeProdutores, faltaMeta: Math.round(hojeProdutores * rng.entre(21, 25)) },
    { faixa: 'parado há 1–3 d', v: recentes[0], faltaMeta: Math.round(recentes[0] * rng.entre(22, 26)) },
    { faixa: 'parado há 3–7 d', v: recentes[1], faltaMeta: Math.round(recentes[1] * rng.entre(17, 21)) },
    { faixa: 'parado há 7–14 d', v: velhos[0], faltaMeta: faltaVelhos[0] },
    { faixa: 'parado há >14 d', v: velhos[1], faltaMeta: faltaVelhos[1] },
  ];

  // ---------------------------------------------------------------- medidas frágeis
  const kit = [
    { grupo: 'ficha 14+ dias · COM kit', media: arred(rng.entre(35.2, 38.4), 1), produzemPct: arred(rng.entre(80.5, 84.5), 1) },
    { grupo: 'ficha 14+ dias · sem kit', media: arred(rng.entre(13.8, 15.4), 1), produzemPct: arred(rng.entre(41.5, 45.5), 1) },
    { grupo: 'ficha nova · COM kit', media: arred(rng.entre(3.6, 4.1), 1), produzemPct: arred(rng.entre(9.1, 10.4), 1) },
    { grupo: 'ficha nova · sem kit', media: arred(rng.entre(1.2, 1.4), 1), produzemPct: arred(rng.entre(2.8, 3.3), 1) },
  ];

  const dddLista: [string, number][] = [
    [VOCAB.dddBase, 0.839],
    ['43', 0.0621],
    ['42', 0.0291],
    ['44', 0.0199],
    ['45', 0.0126],
    ['47', 0.0089],
    ['11', 0.0072],
    ['99', 0.005],
  ];
  const ddd = dddLista.map(([d, w]) => ({ ddd: d, v: Math.round(PX.contabilizados * w * rng.ruido(0.03)) })).map((x) => ({ ...x, pct: pct(x.v, PX.contabilizados) }));
  ddd.sort((a, b) => b.v - a.v);
  const dddForaDoEstado = soma(ddd.filter((x) => !/^4[1-6]$/.test(x.ddd)), (x) => x.v) + rng.int(13, 29);

  const conf = PX.confirmacao;
  const confirmacao = [
    { estado: 'sem nenhuma resposta', v: conf.semResposta },
    { estado: 'disse que vai aderir', v: conf.vaiAderir },
    { estado: 'disse que não vai', v: conf.naoVai },
  ];
  const dobro = TRES.decomposicao.find((g) => g.id === 'dobro');
  const fichaDupla = { ativos, tambemPassageiro: dobro.pilotos, pct: pct(dobro.pilotos, ativos), produzem: dobro.comPassageiro, metaDeles: dobro.meta };

  // ---------------------------------------------------------------- cenários
  const linhasCen = PX.cenarios.map(({ id, nome, ritmo, baseD7, captura, regDiaSurto, xMelhorDia, emDiaD, pctMeta, limite }) => ({ id, nome, ritmo, baseD7, captura, regDiaSurto, xMelhorDia, emDiaD, pctMeta, ...(limite ? { limite } : {}) }));
  const cen = Object.fromEntries(linhasCen.map((l) => [l.id, l]));
  const meta = TRES.metaDeclarada;
  const alcancam = linhasCen.filter((l) => !l.limite && l.emDiaD >= meta);
  const ritmoMostrado = PX.ritmo;
  const d7 = DATAS.d7;
  const diaD = DATAS.diaD;

  // ---------------------------------------------------------------- textos
  const mm = U.mediaMovel7(passageirosDia).filter((p) => p.d >= melhor.dia);
  const mmMin = Math.floor(Math.min(...mm.map((p) => p.v)) / 10) * 10;
  const mmMax = Math.ceil(Math.max(...mm.map((p) => p.v)) / 10) * 10;
  const botPct = pct(PX.origem.bot, PX.origem.bot + PX.origem.manual);
  const duasLinhas = CENTRAL.linhas.slice().sort((a, b) => b.passageiros - a.passageiros).slice(0, 2);
  const umEmCada = Math.round(100 / PX.madrugadaPct);
  const blocoIni = bloco[0];
  const blocoFim = bloco[bloco.length - 1];
  const horasPara = (v) => Math.ceil(cen.medio.regDiaSurto / v);
  const safra = PI.safra;
  const semanasAteDiaD = Math.round(U.diasEntre(DATAS.hojeDemo, diaD) / 7);

  const ritmoLeitura = `Desde ${fmt.data(melhor.dia)} a média de 7 dias oscila entre ${fmt.n(mmMin)} e ${fmt.n(mmMax)} por dia, sem tendência de alta. O topo de ${fmt.n(melhor.v)} em ${fmt.data(melhor.dia)} ficou isolado, puxado por um lote lançado à mão (a auditoria conta ${fmt.n(PX.melhorDiaAuditoria)} no mesmo dia, com outro horário de corte). Considere ~${fmt.n(ritmoMostrado)}/dia o que a operação entrega sem ajuda; qualquer número acima disso precisa de uma intervenção com dono e data, não de esperança na curva.`;

  const regras = [
    { metrica: 'Passageiros por dia', significado: 'média dos últimos 7 dias fechados', limites: [420, 270], hoje: ritmoMostrado, sentido: 'alto' },
    { metrica: 'Pilotos vivos em 7 dias', significado: 'pilotos distintos que cadastraram na semana', limites: [230, 140], hoje: vivos.ultimaSemanaCompleta, sentido: 'alto' },
    { metrica: 'Produtores parados 7+ dias', significado: 'já cadastraram alguém e pararam', limites: [45, 90], hoje: paradosSete.v, sentido: 'baixo' },
  ];
  const reguaLinhas = regras.map((r) => {
    const [a, b] = r.limites;
    const status = r.sentido === 'alto' ? (r.hoje >= a ? 'verde' : r.hoje >= b ? 'amarelo' : 'vermelho') : r.hoje <= a ? 'verde' : r.hoje <= b ? 'amarelo' : 'vermelho';
    const faixas = r.sentido === 'alto' ? { verde: `≥ ${fmt.n(a)}`, amarelo: `${fmt.n(b)}–${fmt.n(a - 1)}`, vermelho: `< ${fmt.n(b)}` } : { verde: `≤ ${fmt.n(a)}`, amarelo: `${fmt.n(a + 1)}–${fmt.n(b)}`, vermelho: `> ${fmt.n(b)}` };
    return { metrica: r.metrica, significado: r.significado, ...faixas, hoje: fmt.n(r.hoje), status };
  });
  const verdes = reguaLinhas.filter((l) => l.status === 'verde').length;
  const cresceu = vivos.ultimaSemanaCompleta - pilotosPorSemana[0].v;

  const livro = {
    letra: 'B',
    titulo: 'Passageiros: cada indicação registrada, dia após dia',
    pergunta: 'Quanto entra por dia, em que horas as pessoas se cadastram e até onde a linha chega no Dia D.',
    frase: `A entrada estacionou: há um mês chegam perto de ${fmt.n(ritmoMostrado)} indicações por dia, e cada piloto que cadastra no dia grava por volta de ${fmt.n(PX.produtividade7d)}. Quem mexe no total não é a produtividade de quem já trabalha, é o número de pilotos diferentes cadastrando no mesmo dia — e esse número nunca passou de ${fmt.n(recorde.v)}.`,
    kpis: [
      { v: PX.contabilizados, rotulo: `passageiros registrados até ${fmt.data(hoje)}` },
      { v: ritmoMostrado, rotulo: `por dia (média dos 7 dias completos, ${blocoIni.slice(8, 10)}–${fmt.data(blocoFim)})` },
      { v: melhor.v, rotulo: `melhor dia já registrado (${fmt.data(melhor.dia)})` },
      { v: vivos.ultimaSemanaCompleta, rotulo: 'pilotos que cadastraram alguém na última semana completa' },
    ],
    origem: [
      { evento: 'Cadastro pelo bot de WhatsApp', v: PX.origem.bot },
      { evento: 'Cadastro à mão, no painel', v: PX.origem.manual },
      { evento: 'Exclusões depois de criados', v: PX.origem.exclusoes },
    ],
    pelotBotPct: botPct,
    buraco: [
      { rotulo: 'Registrado hoje', v: PX.contabilizados },
      { rotulo: `No ritmo atual até ${fmt.data(diaD)}`, v: PX.noRitmoAteDiaD },
      { rotulo: 'Projetada do painel', v: TRES.projetada },
      { rotulo: 'Meta declarada', v: meta },
    ],
    quatroPalavras: [
      { palavra: 'Passageiro', e: 'pessoa indicada por um piloto e gravada uma única vez, com nome e telefone', naoE: 'não é adesão fechada nem interesse confirmado depois' },
      { palavra: 'Piloto', e: 'ficha de quem topou indicar passageiros para o clube', naoE: `não é gente trabalhando: ${fmt.n(faixasProducao[0].pilotos)} fichas nunca cadastraram ninguém` },
      { palavra: 'Meta somada / Projetada', e: 'a soma das metas anotadas em cada ficha de piloto', naoE: 'não é previsão: nenhuma dessas metas foi combinada caso a caso' },
      { palavra: 'Captura', e: 'a parte das indicações feitas fora do sistema que chega a virar cadastro', naoE: 'ninguém mediu — falta o denominador' },
    ],
    ritmoLeitura,
    recordePilotosDia: { v: recorde.v, dia: recorde.dia, pctAtivos: recorde.pctAtivos },
    produtividade7d: PX.produtividade7d,
    semanas,
    cenarios: {
      nota: `Base em ${fmt.data(d7)} = registrado hoje + ritmo × 15 dias. Resultado no Dia D = base + base × 4 × captura: o ×4 sai do 20/80 (se a base é um quinto do total, o total é cinco bases). A última linha não é um cenário — é o teto da própria conta, com captura de 100%.`,
      registrado: PX.contabilizados,
      ritmoAtual: PX.ritmoAtual,
      linhas: linhasCen,
      linhaRetaDiaD: PX.noRitmoAteDiaD,
      leitura: `${alcancam.length ? `Só ${alcancam.map((l) => l.nome).join(' e ')} chega aos ${fmt.n(meta)}.` : `Nenhum cenário alcança os ${fmt.n(meta)}.`} Mesmo o teto, com captura de 100%, para em ${fmt.n(cen.pleno.emDiaD)} (${fmt.pct(cen.pleno.pctMeta)} da meta): a meta não cabe na conta que a própria equipe faz, por mais esforço que se ponha. Escolher antes de ${fmt.data(d7)} qual destes números vai a público — depois dessa data não sobra tempo para acertar a expectativa.`,
      cuidado: 'Nada aqui é intervalo de confiança. São contas com premissas escolhidas pela equipe, e o 20/80 nunca foi posto à prova com dados do clube.',
    },
    relogio: {
      totalCadastros30d: totalJanela,
      madrugadaPct: pct(madrugada, totalJanela),
      picoHora: { hora: 15, v: horas30d[15] },
      segundaOnda: { hora: 22, v: horas30d[22] },
      diasSemana: ORDEM_SEMANA,
      extremos: celulas.slice(0, 2).map((c) => ({ dia: ORDEM_SEMANA[c.i], hora: c.h, v: c.v })),
      domingo30d: soma(matriz[6]),
      quarta30d: soma(matriz[2]),
      metadeDoDia: `só na faixa das ${metadeHora}h`,
      ateMeioDiaPct: pct(acum[11], totalJanela),
      depoisDas18Pct: arred(100 - pct(acum[18], totalJanela), 1),
      onda22hSegundaPct: pct(onda[0], soma(onda)),
      leitura: `O bot cadastra a qualquer hora; o suporte humano, não. ${fmt.pct(pct(madrugada, totalJanela))} dos cadastros — perto de um em cada ${fmt.n(umEmCada)} — chegam entre 22h e 8h, fora do horário com gente para socorrer quem trava: se o bot parar numa sexta à noite, ninguém percebe antes da manhã.`,
    },
    ultimos14,
    faixasDoDia: FAIXAS_DO_DIA.map((x) => x[0]),
    ultimos14Nota: `A leitura por hora saiu cerca de uma hora depois da série diária; por isso ${fmt.data(hoje)} soma ${fmt.n(ultimos14[ultimos14.length - 1].total)} aqui e ${fmt.n(parcialV)} no gráfico por dia.`,
    diaBomLeitura: `O que separa o dia forte do fraco é quantas horas ficam cheias. Em ${fmt.data(diaForte)} foram ${fmt.n(cheiasDe(diaForte))} horas com ${LIMIAR_CHEIA} registros ou mais, e a mais movimentada teve ${fmt.n(Math.max(...horas[diaForte]))}; no domingo ${fmt.data(diaDomingo)}, ${fmt.n(cheiasDe(diaDomingo))}, e nenhuma hora passou de ${fmt.n(Math.max(...horas[diaDomingo]))}. Para gravar ${fmt.n(cen.medio.regDiaSurto)} num dia — o que o cenário médio pede no surto — seriam precisas ${fmt.n(horasPara(horaMaisCheia.v))} horas iguais à mais cheia dos últimos 14 dias (${fmt.n(horaMaisCheia.v)} registros, ${fmt.data(horaMaisCheia.d)} às ${horaMaisCheia.h}h). O dia tem 24.`,
    horaMaisCheia: { v: horaMaisCheia.v, quando: `${fmt.data(horaMaisCheia.d)}, ${horaMaisCheia.h}h` },
    times,
    timesSerie,
    familias,
    faixasProducao,
    tempoAtePrimeiro,
    ativacao24hEntreQuemAtiva: pct(em24h, produtoresTotal),
    ativacao24hSobreTodos: pct(em24h, comDoisDias),
    nuncaAtivamPct: pct(comDoisDias - produtoresTotal, comDoisDias),
    parados,
    parados7mais: { v: paradosSete.v, devem: paradosSete.devem },
    pilotosPorSemana,
    kit,
    kitLeitura: 'Associação, não causa: quem pede kit costuma ser quem já está indicando. Para saber se o kit faz produzir, é preciso sortear — kit para metade dos parados, nada para a outra metade, e comparar.',
    dddBase: VOCAB.dddBase,
    ddd,
    dddForaDoEstado,
    confirmacao,
    fichaDupla,
    muda: [
      {
        t: 'Mede-se prontidão, não adesão.',
        d: `Os ${fmt.n(PX.contabilizados)} cadastros foram gravados uma vez e ninguém os confirmou depois: só ${fmt.n(conf.vaiAderir + conf.naoVai)} das ${fmt.n(PX.fichas)} fichas têm alguma resposta, e nenhuma diz de que aeroporto a pessoa sai. O total cresce com o número de pilotos diferentes cadastrando no mesmo dia, cujo recorde é ${fmt.n(recorde.v)} (${fmt.data(recorde.dia)}), ${fmt.pct(recorde.pctAtivos)} dos ativos.`,
      },
      {
        t: `Os ${fmt.n(meta)} não cabem na conta que a própria equipe faz.`,
        d: `Mesmo com o 20/80 inteiro (captura de 100%) e ${fmt.n(cen.pleno.ritmo)} cadastros por dia até ${fmt.data(d7)}, a conta chega a ${fmt.n(cen.pleno.emDiaD)} — perto da Projetada e ${fmt.mil(meta - cen.pleno.emDiaD, 0)} abaixo da meta. Escolher agora o número que vai a público sai mais barato que desmenti-lo depois de ${fmt.data(d7)}.`,
      },
      {
        t: `${fmt.pct(famLid.registrosPct, 0)} dos cadastros vêm de ${fmt.pct(famLid.redePct, 0)} da rede.`,
        d: `As ${F.lideranca} somam ${fmt.n(famLid.pilotos)} pilotos e ${fmt.n(famLid.passageiros)} registros; a ${F.lista} tem ${fmt.n(famR20.pilotos)} fichas e ${fmt.n(famR20.passageiros)} cadastros. Tratar a ${F.lista} como rede disponível incha todos os denominadores.`,
      },
      {
        t: 'Abrir ficha nova parou de dar retorno.',
        d: `A safra de ${fmt.data(safra.primeira.semana)} rendeu ${fmt.dec(safra.primeira.porFicha)} cadastros por ficha; a de ${fmt.data(safra.ultima.semana)}, ${fmt.dec(safra.ultima.porFicha)}. Enquanto isso, ${fmt.n(paradosSete.v)} produtores estão parados há 7 dias ou mais e devem ${fmt.n(paradosSete.devem)} de meta — basta uma mensagem, e eles já sabem usar o bot.`,
      },
      {
        t: 'A entrada depende de duas máquinas.',
        d: `${fmt.pct(botPct)} dos cadastros chegam pelo bot, e duas linhas de WhatsApp (${duasLinhas.map((l) => l.numero).join(' e ')}) concentram ${fmt.n(soma(duasLinhas, (l) => l.passageiros))} registros. ${fmt.pct(PX.madrugadaPct)} entra entre 22h e 8h, quando não há plantão.`,
      },
    ],
    naoMede: [
      'De onde o passageiro embarca. A base guarda o telefone, não a cidade nem o aeroporto; o DDD só indica o chip.',
      `Se o cadastro vira adesão. ${fmt.n(conf.semResposta)} de ${fmt.n(PX.fichas)} fichas não têm status; qualquer taxa de conversão seria chute.`,
      `Captura. Não existe denominador no sistema; os ${linhasCen.filter((l) => !l.limite).map((l) => fmt.pct(l.captura, 0)).join(', ').replace(/, ([^,]*)$/, ' e $1')} dos cenários são premissas.`,
      `O 20/80. É hipótese do gestor, apoiada em ${fmt.n(DATAS.dias)} dias de histórico, sem a semana do surto e sem temporadas anteriores.`,
      `Quem cadastrou de fato. A linha de WhatsApp gravada é a atual do piloto, e ${fmt.data(hoje)} está incompleto.`,
    ],
    regua: {
      linhas: reguaLinhas,
      nota: `${verdes ? `${fmt.n(verdes)} das três métricas está no verde.` : 'Nenhuma das três métricas está no verde.'} A única que anda na direção certa é a de pilotos vivos — e mesmo ela ganhou ${fmt.n(cresceu)} pessoas desde a semana de ${fmt.data(DATAS.semanas[0])}, com ${fmt.n(semanasAteDiaD)} semanas pela frente.`,
    },
    p: [13, 21],
  };

  return {
    livro: { passageiros: livro },
    series: {
      passageiros_dia: passageirosDia,
      pilotos_distintos_dia: pilotosDia,
      cadastros_hora_30d: horas30d,
      cadastros_dia_semana_media: mediaDiaSemana,
      onda_22h_dia_semana: onda,
      heatmap_cadastros_nivel: niveis,
      tres_dias_hora: tresDias,
    },
  };
}

export function verificar(saida: SaidaCapitulo, { A, U }: Contexto): string[] {
  const { PASSAGEIROS: PX, PILOTOS: PI, TRES, DATAS } = A;
  const { soma, pct, arred } = U;
  const B = saida.livro.passageiros;
  const S = saida.series;
  const erros = [];
  const exige = (cond, msg) => {
    if (!cond) erros.push(msg);
  };
  const ativos = PI.funil.find((x) => x.id === 'ativos').v;

  const pd = S.passageiros_dia;
  exige(pd.length === DATAS.dias, `passageiros_dia tem ${pd.length} dias`);
  exige(pd[pd.length - 1].parcial && pd[pd.length - 1].d === DATAS.medidoEm, 'último dia não é o parcial');
  exige(soma(pd, (p) => p.v) === PX.contabilizados, `série soma ${soma(pd, (p) => p.v)} ≠ ${PX.contabilizados}`);
  const maior = pd.reduce((a, p) => (p.v > a.v ? p : a));
  exige(maior.d === PX.melhorDia.dia && maior.v === PX.melhorDia.v && pd.filter((p) => p.v === maior.v).length === 1, 'pico da série não é o melhor dia');
  const bloco = pd.slice(-8, -1);
  exige(Math.abs(soma(bloco, (p) => p.v) / 7 - PX.ritmoAtual) < 0.01, `ritmo dos 7 dias = ${soma(bloco, (p) => p.v) / 7}`);
  const mm = U.mediaMovel7(pd);
  exige(mm[mm.length - 1].v === PX.ritmo, `média móvel final ${mm[mm.length - 1].v} ≠ ${PX.ritmo}`);
  exige(B.cenarios.linhas.find((l) => l.id === 'medio').ritmo === Math.round(B.cenarios.ritmoAtual), 'ritmo do médio');
  exige(soma(B.semanas, (s) => s.v) === PX.contabilizados, 'semanas não somam o total');
  const topo = B.semanas.reduce((a, s) => (s.v > a.v ? s : a));
  exige(topo.semana === DATAS.semanas[1] && B.semanas.filter((s) => s.v === topo.v).length === 1, 'a semana maior não é a de 19/10');

  const pl = S.pilotos_distintos_dia;
  const maxPl = Math.max(...pl.map((p) => p.v));
  exige(maxPl === PX.recordePilotosDia.v && pl.filter((p) => p.v === maxPl).length === 1 && pl.find((p) => p.v === maxPl).d === PX.recordePilotosDia.dia, 'recorde de pilotos fora do lugar');
  exige(arred(soma(bloco, (p) => p.v) / soma(pl.slice(-8, -1), (p) => p.v), 1) === PX.produtividade7d, 'produtividade dos 7 dias');
  exige(pct(B.recordePilotosDia.v, ativos) === B.recordePilotosDia.pctAtivos, 'pct do recorde');

  const pps = B.pilotosPorSemana;
  exige(pps[3].v === PI.vivosVariantes.ultimaSemanaCompleta && pps[4].v === PI.vivosVariantes.semanaAberta && pps[4].aberta, 'pilotos por semana ≠ variantes');

  const H = S.cadastros_hora_30d;
  const R = B.relogio;
  exige(soma(H) === R.totalCadastros30d, 'horas não somam o total de 30 dias');
  exige(R.madrugadaPct === PX.madrugadaPct, `madrugada ${R.madrugadaPct}`);
  exige(pct(soma(H.filter((_, h) => h >= 22 || h < 8)), soma(H)) === PX.madrugadaPct, 'madrugada não fecha com as horas');
  const ordem = H.map((v, h) => [v, h]).sort((a, b) => b[0] - a[0]);
  exige(ordem[0][1] === 15 && ordem[1][1] === 22 && ordem[0][0] > ordem[1][0] && ordem[1][0] > ordem[2][0], 'pico às 15h e segunda onda às 22h não se sustentam');
  exige(R.picoHora.v === H[15] && R.segundaOnda.v === H[22], 'pico/segunda onda ≠ série');
  const onda = S.onda_22h_dia_semana;
  exige(soma(onda) === H[22], 'onda das 22h ≠ coluna das 22h');
  exige(onda[0] === Math.max(...onda), 'a onda das 22h não é de segunda');
  const niv = S.heatmap_cadastros_nivel;
  exige(niv.length === 7 && niv.every((l) => l.length === 24) && Math.max(...niv.flat()) === 255, 'heatmap fora do formato');
  exige(R.extremos.length === 2 && niv[R.diasSemana.indexOf(R.extremos[0].dia)][R.extremos[0].hora] === 255, 'extremo do heatmap');
  exige(Math.abs(soma(S.cadastros_dia_semana_media) * (30 / 7) - R.totalCadastros30d) < 20, 'médias por dia da semana');

  const vDe = Object.fromEntries(pd.map((p) => [p.d, p.v]));
  for (const d of B.ultimos14) {
    exige(soma(d.f) === d.total, `faixas de ${d.dia} não somam`);
    if (!d.parcial) exige(d.total === vDe[d.dia], `últimos 14: ${d.dia} ${d.total} ≠ série ${vDe[d.dia]}`);
    else exige(d.total > vDe[d.dia], 'parcial dos 14 dias não é maior que a série');
  }
  const tres = S.tres_dias_hora;
  const chaves = Object.keys(tres);
  exige(chaves.length === 3 && chaves[0] === PX.recordePilotosDia.dia && U.diaSemana(chaves[2]) === 'dom', 'três dias fora dos papéis');
  for (const k of chaves) {
    exige(soma(tres[k]) === vDe[k], `três dias: ${k} não fecha com a série`);
    const u = B.ultimos14.find((d) => d.dia === k);
    exige(u && u.cheias === tres[k].filter((v) => v >= 20).length, `horas cheias de ${k}`);
  }
  const cheias = chaves.map((k) => tres[k].filter((v) => v >= 20).length);
  exige(cheias[0] > cheias[1] && cheias[1] > cheias[2], `horas cheias dos três dias fora de ordem: ${cheias}`);
  exige(B.horaMaisCheia.v < B.cenarios.linhas.find((l) => l.id === 'medio').regDiaSurto / 24, 'hora mais cheia grande demais para a frase das 24 horas');

  exige(soma(B.times, (t) => t.passageiros) === PX.somaTabelaTimes, 'tabela de times não soma 9.845');
  exige(soma(B.times, (t) => t.pilotos) === ativos, 'pilotos da tabela ≠ ativos');
  exige(soma(B.times, (t) => t.produzem) === TRES.metaDeQuemJaProduz.pilotos, 'produzem ≠ quem já produz');
  for (const t of B.times) {
    exige(t.produzem <= t.pilotos && t.produzem <= t.passageiros && t.bateram <= t.produzem, `time ${t.time} incoerente`);
    exige(t.produzemPct === pct(t.produzem, t.pilotos), `pct de ${t.time}`);
    exige(t.passageiros === 0 || t.produzem > 0, `${t.time} tem passageiro sem produtor`);
  }
  exige(B.times.find((t) => t.time === 'R20_CAPITAL').pilotos === PI.linhaImportadaR20.capital, 'R20_CAPITAL');
  exige(soma(B.familias, (f) => f.passageiros) === PX.somaTabelaTimes && soma(B.familias, (f) => f.pilotos) === ativos, 'famílias não somam');
  const lid = B.familias[1];
  exige(lid.pilotos === PX.lideranca.pilotos && lid.passageiros === PX.lideranca.registros, 'família das embaixadas ≠ âncora');
  exige(B.familias[3].pilotos === PI.linhaImportadaR20.pilotos && B.familias[3].passageiros === PI.linhaImportadaR20.passageiros, 'família Rota 20 ≠ âncora');

  exige(soma(B.faixasProducao, (x) => x.pilotos) === ativos && soma(B.faixasProducao, (x) => x.passageiros) === PX.somaTabelaTimes, 'faixas de produção não somam');
  for (const x of B.faixasProducao.slice(1)) {
    const [lo, hi] = x.faixa === '88+' ? [88, Infinity] : x.faixa.split('–').map(Number);
    exige(x.passageiros >= lo * x.pilotos && x.passageiros <= hi * x.pilotos, `faixa ${x.faixa} impossível`);
  }
  exige(soma(B.tempoAtePrimeiro, (x) => x.v) === TRES.metaDeQuemJaProduz.pilotos, 'tempo até o primeiro ≠ produtores');
  exige(soma(B.parados, (x) => x.v) === TRES.metaDeQuemJaProduz.pilotos, 'parados ≠ produtores');
  const sete = B.parados.filter((x) => /7\s*[–-]\s*14|>\s*14/.test(x.faixa));
  exige(soma(sete, (x) => x.v) === PI.paradosSete.v && soma(sete, (x) => x.faltaMeta) === PI.paradosSete.devem, 'parados 7+ não fecham');

  exige(B.ddd[0].ddd === A.VOCAB.dddBase && B.ddd.every((x) => x.pct === pct(x.v, PX.contabilizados)), 'DDD');
  exige(soma(B.confirmacao, (x) => x.v) === PX.fichas, 'confirmação ≠ fichas');
  exige(B.fichaDupla.pct === pct(B.fichaDupla.tambemPassageiro, B.fichaDupla.ativos), 'ficha dupla');
  exige(soma(B.origem, (x) => x.v) === PX.contabilizados, 'origem não soma o contabilizado');
  exige(B.cenarios.linhaRetaDiaD === PX.noRitmoAteDiaD && B.buraco[1].v === PX.noRitmoAteDiaD, 'linha reta');
  exige(B.cenarios.linhas.every((l) => l.limite || l.emDiaD < TRES.metaDeclarada) === /^Nenhum cenário/.test(B.cenarios.leitura), 'leitura dos cenários desmente a conta');
  exige(B.kpis[0].v === PX.contabilizados && B.kpis[1].v === PX.ritmo && B.kpis[2].v === PX.melhorDia.v, 'kpis');
  return erros;
}
