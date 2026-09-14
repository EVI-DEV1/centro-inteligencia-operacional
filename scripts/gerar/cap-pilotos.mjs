const EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
const EXTENSO_F = ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
const DIA_LONGO = { seg: 'segunda', ter: 'terça', qua: 'quarta', qui: 'quinta', sex: 'sexta', 'sáb': 'sábado', dom: 'domingo' };

const PORTAS = [
  { id: 'pre_piloto', porta: 'Aspirante escreveu ao bot', fichas: 27, ativaram: 21, passageiros: 941 },
  { id: 'qr', porta: 'QR escaneado', fichas: 118, ativaram: 79, passageiros: 2917 },
  { id: 'lista', porta: 'Lista importada', fichas: 131, ativaram: 36, passageiros: 764 },
];

const COORTES = [
  { pilotos: 89, ativaram: 74, um: 52, sete: 65, passageiros: 3711 },
  { pilotos: 62, ativaram: 46, um: 34, sete: 44, passageiros: 2021 },
  { pilotos: 548, ativaram: 88, um: 56, sete: 80, passageiros: 2398 },
  { pilotos: 191, ativaram: 31, um: 21, sete: 27, passageiros: 933 },
  { pilotos: 1146, ativaram: 24, um: 10, sete: 24, passageiros: 802 },
];

const CARGAS = [
  { dia: '2026-10-30', criados: 354, convertidos: 352, daFila: true, hora: [[11, 327]] },
  { dia: '2026-11-05', criados: 117, convertidos: 7, daFila: false, hora: [] },
  { dia: '2026-11-10', criados: 871, convertidos: 871, daFila: true, hora: [[14, 512], [15, 331]] },
  { dia: '2026-11-12', criados: 229, convertidos: 228, daFila: true, hora: [[20, 208]] },
];

const IMPORTACOES = [
  { dia: '2026-10-23', planilhas: 48, linhas: 1231, jaEramPiloto: 97 },
  { dia: '2026-10-27', planilhas: 3, linhas: 71, jaEramPiloto: 12 },
  { dia: '2026-10-28', planilhas: 9, linhas: 2331, jaEramPiloto: 18 },
  { dia: '2026-10-29', planilhas: 1, linhas: 246, jaEramPiloto: 0 },
].map((i) => ({ ...i, fichas: i.linhas - i.jaEramPiloto }));

const FONTES = [
  { fonte: 'Exportação do CRM — leads R20 (28/10)', fichas: 2046, viraramPiloto: 571 },
  { fonte: 'Rota 20 (CRM)', fichas: 246, viraramPiloto: 2 },
  { fonte: 'cadastro manual', fichas: 96, viraramPiloto: 41 },
  { fonte: 'Planilha 29 — Parceiros', fichas: 79, viraramPiloto: 78 },
  { fonte: 'Planilha — cidades do litoral', fichas: 57, viraramPiloto: 0 },
  { fonte: 'Planilha Embaixadas 2026 (carga do servidor)', fichas: 51, viraramPiloto: 33 },
  { fonte: 'Planilha 18 — Agência Aurora', fichas: 41, viraramPiloto: 41 },
  { fonte: 'Planilha 22 — Feira de Turismo', fichas: 40, viraramPiloto: 37 },
  { fonte: 'Planilha — Interior (38 linhas)', fichas: 38, viraramPiloto: 1 },
  { fonte: 'Planilha — Metropolitana', fichas: 36, viraramPiloto: 9 },
];

const FICHA = [
  { campo: 'Passou pelo onboarding', v: 312 },
  { campo: 'Tem foto', v: 463 },
  { campo: 'Ligado a um lead do CRM', v: 879 },
  { campo: 'Recebeu o mapa da região', v: 171 },
];

const ULTIMA = [
  { faixa: 'hoje', v: 52 },
  { faixa: '1–3 d', v: 61 },
  { faixa: '3–7 d', v: 58 },
  { faixa: '7–14 d', v: 93 },
  { faixa: '>14 d', v: 87 },
];

const FICHAS_DO_BOT = 297;
const ESTADOS_COM_CONTROLADOR = { piloto: 1733, passageiro: 117 };

function repartirComTeto(total, tetos) {
  const out = tetos.map(() => 0);
  let resto = total;
  while (resto > 0) {
    const livres = tetos.map((t, i) => t - out[i]);
    const somaLivre = livres.reduce((s, v) => s + v, 0);
    if (somaLivre <= 0) throw new Error(`repartirComTeto: ${resto} sem espaço`);
    const partes = livres.map((l) => Math.floor((l / somaLivre) * resto));
    let dado = partes.reduce((s, v) => s + v, 0);
    partes.forEach((p, i) => (out[i] += p));
    resto -= dado;
    for (let i = 0; resto > 0 && i < tetos.length; i++) {
      if (out[i] < tetos[i]) {
        out[i]++;
        resto--;
      }
    }
  }
  return out;
}

export function gerar({ rng, A, U }) {
  const P = A.PILOTOS;
  const D = A.DATAS;
  const f = U.fmt;
  const dias = U.intervalo(D.inicio, D.fim);
  const ext = (n) => EXTENSO[n] || f.n(n);
  const extF = (n) => EXTENSO_F[n] || f.n(n);
  const degrau = (id) => P.funil.find((d) => d.id === id);
  const ativos = degrau('ativos').v;
  const vivo = degrau('vivo').v;
  const produziu = degrau('produziu').v;
  const kit = degrau('kit').v;
  const canal = degrau('canal').v;

  const carga = Object.fromEntries(CARGAS.map((c) => [c.dia, c]));
  const serieFichas = [];
  D.semanas.forEach((sem, i) => {
    const diasSem = dias.filter((d) => U.semanaDe(d) === sem);
    const fixos = {};
    const marcas = {};
    for (const d of diasSem) if (carga[d]) {
      fixos[d] = carga[d].criados;
      marcas[d] = { carga: true };
    }
    const forma = (d, k) => {
      const base = ({ dom: 0.5, 'sáb': 0.7 })[U.diaSemana(d)] || 1;
      if (d === D.inicio) return 5.5;
      if (i === 2) return base * Math.max(0.7, 2.6 - k * 0.45);
      if (d === D.medidoEm) return 0.45;
      return base;
    };
    serieFichas.push(...U.serieDiaria({ dias: diasSem, total: COORTES[i].pilotos, rng, forma, ruido: 0.3, fixos, marcas, parcial: diasSem.includes(D.medidoEm) ? D.medidoEm : null }));
  });
  const acumulado = U.acumular(serieFichas);
  const totalFichas = acumulado[acumulado.length - 1].v;
  const fichasDeCarga = U.soma(serieFichas.filter((p) => p.carga), (p) => p.v);

  const primeiraImport = IMPORTACOES[0].dia;
  const criadasFixos = Object.fromEntries(IMPORTACOES.map((i) => [i.dia, i.fichas]));
  for (const d of dias) if (d < primeiraImport) criadasFixos[d] = 0;
  const formaAsp = (d) => (d === D.medidoEm ? 0.35 : ({ dom: 0.5, 'sáb': 0.7 })[U.diaSemana(d)] || 1);
  const preCriadas = U.serieDiaria({ dias, total: P.aspirantes.total, rng, ruido: 0.6, forma: formaAsp, fixos: criadasFixos });

  const livresConv = serieFichas.filter((p) => p.d >= primeiraImport && !p.carga);
  const restoConv = P.aspirantes.viraramPiloto - U.soma(CARGAS, (c) => c.convertidos);
  const partesConv = repartirComTeto(restoConv, livresConv.map((p) => p.v));
  const convPorDia = Object.fromEntries(livresConv.map((p, i) => [p.d, partesConv[i]]));
  const preConvertidas = dias.map((d) => ({ d, v: carga[d] ? carga[d].convertidos : convPorDia[d] || 0 }));

  const celulas = CARGAS.flatMap((c) => c.hora.map(([h, v]) => ({ h, v, dia: c.dia })));
  const celulasSoma = U.soma(celulas, (c) => c.v);
  const pesosHora = [2, 1, 0, 0, 0, 1, 3, 8, 14, 19, 24, 27, 30, 26, 31, 35, 38, 44, 40, 52, 41, 33, 18, 5].map((p) => p * rng.ruido(0.15));
  const horas = U.distribuir(totalFichas - celulasSoma, pesosHora);
  for (const c of celulas) horas[c.h] += c.v;
  const madrugada = U.soma(horas.slice(0, 6));
  const horasCarga = celulas.map((c) => c.h);
  const diurnas = horasCarga.filter((h) => h < 18).sort((a, b) => horas[b] - horas[a]);
  const noturnas = horasCarga.filter((h) => h >= 18).sort((a, b) => horas[b] - horas[a]);
  const horaTxt = (h) => `${h}h (${f.n(horas[h])})`;
  const horaLeitura = `${ext(diurnas.length).replace(/^./, (c) => c.toUpperCase())} horas concentram quase tudo — ${diurnas.slice(0, -1).map(horaTxt).join(', ')} e ${horaTxt(diurnas[diurnas.length - 1])} — e mais uma à noite, ${noturnas.map(horaTxt).join(' e ')}. Não é o horário em que as pessoas decidem virar piloto: é o horário em que alguém da equipe rodou a carga. Na madrugada inteira há ${f.n(madrugada)} fichas em ${f.n(D.dias)} dias.`;
  const detalhe = CARGAS.filter((c) => c.hora.length)
    .map((c, i) => {
      const cel = c.hora.map(([h, v]) => `${h}h (${f.n(v)})`);
      const quando = `${DIA_LONGO[U.diaSemana(c.dia)]} ${cel.length > 1 ? `${cel.slice(0, -1).join(', ')} e ${cel[cel.length - 1]}` : cel[0]}`;
      return `${quando} = ${i === 0 ? 'carga de ' : ''}${f.data(c.dia)}`;
    })
    .join('; ');

  const portas = PORTAS.map((p) => ({ id: p.id, porta: p.porta, fichas: p.fichas, passageirosPorFicha: U.arred(p.passageiros / p.fichas, 1), ativaramPct: U.pct(p.ativaram, p.fichas), passageiros: p.passageiros }));
  const lista = portas.find((p) => p.id === 'lista');
  const razoes = portas.filter((p) => p.id !== 'lista').map((p) => p.passageirosPorFicha / lista.passageirosPorFicha);
  const vezes = `${ext(Math.round(Math.min(...razoes)))} a ${ext(Math.round(Math.max(...razoes)))}`;
  const pre = portas.find((p) => p.id === 'pre_piloto');
  const qr = portas.find((p) => p.id === 'qr');

  const coortes = D.semanas.map((semana, i) => {
    const c = COORTES[i];
    const temCarga = serieFichas.some((p) => p.carga && U.semanaDe(p.d) === semana);
    const aberta = i === D.semanas.length - 1;
    return { semana, pilotos: c.pilotos, ativaram: c.ativaram, ativaramPct: U.pct(c.ativaram, c.pilotos), em1d: U.pct(c.um, c.pilotos), em7d: U.pct(c.sete, c.pilotos), passageiros: c.passageiros, porFicha: U.arred(c.passageiros / c.pilotos, 1), carga: temCarga, ...(aberta ? { aberta: true } : {}) };
  });
  const semCarga = coortes.filter((c) => !c.carga);
  const comCarga = coortes.filter((c) => c.carga);
  const ult = coortes[coortes.length - 1];
  const coortesLeitura = `As ${extF(semCarga.length)} semanas sem carga somam ${f.n(U.soma(semCarga, (c) => c.pilotos))} pilotos e ${f.n(U.soma(semCarga, (c) => c.passageiros))} passageiros; as ${extF(comCarga.length)} com carga somam ${f.n(U.soma(comCarga, (c) => c.pilotos))} pilotos e ${f.n(U.soma(comCarga, (c) => c.passageiros))} passageiros. A coorte diz em 24 horas o que vai render: quem não cadastra ninguém no primeiro dia quase nunca cadastra depois.`;

  const planos = A.VOCAB.planos;
  const embaixadas = A.PASSAGEIROS.lideranca.pilotos;
  const metaTotal = degrau('ativos').meta;
  const d200 = 14;
  const d100 = embaixadas - d200;
  const d40 = (metaTotal - planos[0] * ativos - (planos[2] - planos[0]) * d100 - (planos[3] - planos[0]) * d200) / (planos[1] - planos[0]);
  const d20 = ativos - d40 - d100 - d200;
  const metas = [d20, d40, d100, d200].map((v, i) => ({ meta: planos[i], pilotos: v, pct: U.pct(v, ativos) }));

  const ficha = FICHA.map((c) => ({ ...c, pct: U.pct(c.v, ativos) }));
  const falaram = U.soma(ULTIMA, (u) => u.v);
  const nunca = ativos - falaram;
  const ultimaMensagem = [...ULTIMA, { faixa: 'nunca', v: nunca, vazio: true }];
  const tres = ULTIMA[0].v + ULTIMA[1].v;
  const ultimaMensagemLeitura = `Em ${f.n(nunca)} das ${f.n(ativos)} fichas ativas (${f.pct(U.pct(nunca, ativos))}) o campo está vazio; só ${f.n(tres)} pilotos falaram nos últimos 3 dias. Pelo campo da ficha sobram ${f.n(falaram)} pilotos com alguma mensagem; pelas sessões do bot, ${f.n(canal)}.`;

  const linhas = [...A.CENTRAL.linhas].sort((a, b) => b.passageiros - a.passageiros);
  const whatsappProducao = linhas.map((l) => ({ numero: l.numero, pilotos: l.pilotos, passageiros: l.passageiros, pct: l.pct }));
  const totalPass = U.soma(whatsappProducao, (w) => w.passageiros);
  const dois = whatsappProducao.slice(0, 2);
  const doisPct = U.pct(U.soma(dois, (w) => w.passageiros), totalPass);

  const asp = P.aspirantes;
  const contatosPorControlador = Math.round(asp.naFila / P.contasControlador);
  const prePilotos = {
    total: asp.total,
    estados: [
      { estado: 'na fila', v: asp.naFila, comControlador: asp.naFilaComControlador },
      { estado: 'virou piloto', v: asp.viraramPiloto, comControlador: ESTADOS_COM_CONTROLADOR.piloto },
      { estado: 'virou passageiro', v: asp.viraramPassageiro, comControlador: ESTADOS_COM_CONTROLADOR.passageiro },
    ],
    fontes: FONTES.map((fo) => {
      const taxa = fo.viraramPiloto / fo.fichas;
      return { ...fo, faixa: taxa >= 0.9 ? 'azul' : taxa >= 0.3 ? 'laranja' : 'vermelho' };
    }),
    leitura: `A fila não é base: é agenda. São ${f.n(asp.naFila)} aspirantes esperando, ${f.n(asp.naFilaComControlador)} deles com controlador já definido. Divididos pelos ${f.n(P.contasControlador)} controladores, dão ${f.n(contatosPorControlador)} contatos por pessoa até ${f.data(D.diaD)}. Tratar a fila como lista de ligações a fazer, não como base a converter em lote.`,
    contatosPorControlador,
  };

  const setesDias = U.intervalo(U.somarDias(D.medidoEm, -7), U.somarDias(D.medidoEm, -1));
  const criados7d = U.soma(serieFichas.filter((p) => setesDias.includes(p.d)), (p) => p.v);
  const diasDeCarga = CARGAS.map((c) => ({ dia: c.dia, semana: U.diaSemana(c.dia), criados: serieFichas.find((p) => p.d === c.dia).v, convertidos: c.convertidos, daFila: c.daFila }));
  const cargasFila = diasDeCarga.filter((c) => c.daFila).length;
  const origemRegistradaPct = U.pct(FICHAS_DO_BOT, totalFichas);
  const fichasDeCargaPct = U.pct(fichasDeCarga, totalFichas);
  const pctFalaram = U.pct(falaram, ativos);

  const piso10 = (v) => Math.floor(v / 10) * 10;
  const verdeAtiv = piso10(Math.min(...semCarga.map((c) => c.em7d)));
  const verdeFicha = piso10(Math.min(...semCarga.map((c) => c.porFicha)));
  const status = (v, verde, amarelo) => (v >= verde ? 'verde' : v >= amarelo ? 'amarelo' : 'vermelho');
  const regua = {
    nota: `A faixa verde não é meta oficial: é o que as ${extF(semCarga.length)} coortes sem carga em massa de fato entregaram. Serve para comparar, não para cobrar.`,
    linhas: [
      { metrica: 'Ativação da coorte em 7 dias', verde: `≥ ${verdeAtiv}%`, amarelo: `30–${verdeAtiv}%`, vermelho: '< 30%', hoje: f.pct(ult.em7d), hojeNota: `coorte ${f.data(ult.semana)}, aberta`, status: status(ult.em7d, verdeAtiv, 30) },
      { metrica: 'Passageiros por ficha da coorte', verde: `≥ ${verdeFicha}`, amarelo: `10–${verdeFicha}`, vermelho: '< 10', hoje: f.dec(ult.porFicha), status: status(ult.porFicha, verdeFicha, 10) },
      { metrica: 'Pilotos que cadastraram alguém na última semana', verde: `≥ ${f.n(produziu)}`, amarelo: `${f.n(vivo)}–${f.n(produziu)}`, vermelho: `< ${f.n(vivo)}`, hoje: f.n(vivo), hojeNota: 'na borda', status: status(vivo, produziu, vivo) },
      { metrica: 'Fichas ativas com "última mensagem" preenchida', verde: '≥ 70%', amarelo: '30–70%', vermelho: '< 30%', hoje: f.pct(pctFalaram), status: status(pctFalaram, 70, 30) },
      { metrica: 'Fichas de piloto com porta de entrada registrada', verde: '≥ 50%', amarelo: '15–50%', vermelho: '< 15%', hoje: f.pct(origemRegistradaPct), status: status(origemRegistradaPct, 50, 15) },
    ],
  };

  const onboarding = ficha.find((c) => /onboarding/.test(c.campo));
  const mapa = ficha.find((c) => /mapa/.test(c.campo));
  const frase = `Piloto criado não é piloto que produz. Em ${f.n(D.dias)} dias o sistema registrou ${f.n(totalFichas)} fichas de piloto; ${f.n(fichasDeCarga)} delas (${f.pct(fichasDeCargaPct)}) nasceram em ${ext(diasDeCarga.length)} dias de carga em massa. No mesmo recorte, ${f.n(vivo)} pilotos cadastraram alguém na última semana. A base que trabalha é de centenas; a base que existe é de milhares.`;

  const livro = {
    letra: 'A',
    titulo: 'Pilotos: quem entra, por onde e quando',
    pergunta: 'Quantos pilotos existem de verdade, como foram criados e quais produzem.',
    frase,
    kpis: [
      { v: ativos, rotulo: 'pilotos ativos hoje' },
      { v: criados7d, rotulo: `criados nos 7 dias completos (${setesDias[0].slice(8, 10)}–${f.data(setesDias[6])})` },
      { v: asp.total - asp.viraramPiloto, rotulo: 'aspirantes que ainda não viraram piloto' },
      { v: vivo, rotulo: 'cadastraram alguém na última semana' },
    ],
    funil: P.funil.map((d) => ({
      id: d.id,
      ...{
        ativos: { rotulo: 'Pilotos ativos' },
        dono: { rotulo: 'com dono de verdade', detalhe: 'sem órfãos e sem a fila de triagem' },
        canal: { rotulo: 'já trocaram mensagem com o bot' },
        produziu: { rotulo: 'já cadastraram ao menos 1 passageiro' },
        vivo: { rotulo: 'cadastraram alguém na última semana' },
        kit: { rotulo: 'com a tag de kit recebido' },
      }[d.id],
      v: d.v,
      pct: d.pct,
      meta: d.meta,
      nucleo: { ativos: 'pilotos', dono: 'controladores', canal: 'central', produziu: 'passageiros', vivo: 'passageiros', kit: 'operacao' }[d.id],
      ...(d.id === 'vivo' ? { operacional: true } : {}),
    })),
    metaFaseA: P.metaFaseA,
    funilLeitura: `Cada seta para baixo é uma peneira. O gargalo está entre "tem dono" e "falou com o bot": ${f.n(P.semContatoComDono)} pilotos têm controlador e nunca trocaram mensagem com o sistema. A base que responde a um comando hoje está entre ${f.n(kit)} e ${f.n(produziu)} pilotos; a operacional é ${f.n(vivo)}.`,
    semContatoComDono: P.semContatoComDono,
    totalFichas,
    fichasDeCarga,
    fichasDeCargaPct,
    diasDeCarga,
    horaLeitura,
    celulasDeCarga: { fichas: celulasSoma, pct: U.pct(celulasSoma, totalFichas), detalhe },
    fichasCriadasPeloBot: FICHAS_DO_BOT,
    origemRegistradaPct,
    portas,
    portasLeitura: `Quem se ofereceu produz. A lista importada rende ${vezes} vezes menos por ficha. Mas quem escaneia um QR já decidiu participar: isto mede seleção, não a qualidade do canal.`,
    importacoes: IMPORTACOES.map((i) => ({ dia: i.dia, planilhas: i.planilhas, linhas: i.linhas, fichas: i.fichas, jaEramPiloto: i.jaEramPiloto })),
    coortes,
    coortesLeitura,
    metas,
    ficha,
    ultimaMensagem,
    ultimaMensagemLeitura,
    whatsappProducao,
    prePilotos,
    muda: [
      { t: 'Criar piloto em massa não rende — está medido, não é opinião.', d: `${f.n(fichasDeCarga)} das ${f.n(totalFichas)} fichas (${f.pct(fichasDeCargaPct)}) nasceram em ${ext(diasDeCarga.length)} dias de carga. A coorte de ${f.data(ult.semana)}, com ${f.n(ult.pilotos)} pilotos, tem ${f.n(ult.ativaram)} que já cadastraram alguém — ${f.pct(ult.ativaramPct)} — e ${f.dec(ult.porFicha)} passageiro por ficha. Continuar convertendo a fila em lote adiciona linhas, não adesões.` },
      { t: `Quem entra por vontade própria produz ${vezes} vezes mais.`, d: `Aspirante que escreveu ao bot rende ${f.dec(pre.passageirosPorFicha)} passageiros e o QR rende ${f.dec(qr.passageirosPorFicha)}, contra ${f.dec(lista.passageirosPorFicha)} da lista importada. A porta boa é a mais estreita — e é a que menos recebe atenção.` },
      { t: 'A base nunca foi acesa.', d: `Em ${f.n(nunca)} das ${f.n(ativos)} fichas ativas (${f.pct(U.pct(nunca, ativos))}) o campo de última mensagem está vazio; pelas sessões do bot, ${f.n(canal)} já falaram. ${f.n(onboarding.v)} (${f.pct(onboarding.pct)}) passaram pelo onboarding e ${f.n(mapa.v)} (${f.pct(mapa.pct)}) receberam o mapa. O problema não é reengajar: é fazer o primeiro contato, que nunca houve.` },
      { t: `O estoque real são ${f.n(asp.naFila)} aspirantes na fila, sem contato.`, d: `Desses, ${f.n(asp.naFilaComControlador)} já têm controlador atribuído. Converter em lote já foi feito ${ext(cargasFila)} vezes e não produziu. O que ainda não foi feito é falar com eles — e ${f.n(D.faltavamDiasNaMedicao)} dias dão para chamar ${f.n(asp.naFila)} pessoas se houver escala humana.` },
      { t: `A produção depende de ${ext(dois.length)} números de WhatsApp.`, d: `${dois.map((w) => w.numero).join(' e ')} concentram ${f.pct(doisPct)} dos ${f.n(totalPass)} passageiros com ficha. Um bloqueio numa dessas contas derruba a maior parte do cadastro.` },
    ],
    naoMede: [
      `Origem só existe para ${f.n(FICHAS_DO_BOT)} de ${f.n(totalFichas)} pilotos (${f.pct(origemRegistradaPct)}) — as fichas criadas pelo bot.`,
      'Não existe data de entrega do kit na ficha do piloto — só a marca de recebido. Sem a data, não dá para dizer que o kit causou produção.',
      `A data da ficha não é a data do compromisso — para as ${f.n(asp.viraramPiloto)} fichas convertidas, o sistema registra o dia da conversão.`,
      'O número de WhatsApp é o atual, não o histórico.',
      `${f.data(D.medidoEm)} está incompleto e a coorte de ${f.data(ult.semana)} ainda não completou 7 dias: os dois só podem subir.`,
    ],
    regua,
    p: [5, 12],
  };

  return {
    livro: { pilotos: livro },
    series: {
      fichas_piloto_dia: serieFichas,
      pilotos_acumulado: acumulado,
      fichas_piloto_hora: horas,
      pre_piloto_criadas_dia: preCriadas,
      pre_piloto_convertidas_dia: preConvertidas,
    },
  };
}

export function verificar(saida, { A, U }) {
  const erros = [];
  const L = saida.livro.pilotos;
  const S = saida.series;
  const P = A.PILOTOS;
  const soma = U.soma;
  const eq = (a, b, o) => {
    if (a !== b) erros.push(`${o}: ${a} ≠ ${b}`);
  };

  const fichas = S.fichas_piloto_dia;
  eq(fichas.length, A.DATAS.dias, 'dias da série de fichas');
  eq(soma(fichas, (p) => p.v), P.totalFichas, 'soma de fichas_piloto_dia × totalFichas');
  eq(L.totalFichas, P.totalFichas, 'totalFichas');
  eq(S.pilotos_acumulado[S.pilotos_acumulado.length - 1].v, P.totalFichas, 'fim do acumulado');
  eq(soma(fichas.filter((p) => p.carga), (p) => p.v), P.fichasDeCarga, 'soma dos dias de carga');
  eq(L.fichasDeCarga, P.fichasDeCarga, 'fichasDeCarga');
  eq(L.fichasDeCargaPct, P.fichasDeCargaPct, 'fichasDeCargaPct');
  eq(L.semContatoComDono, P.semContatoComDono, 'semContatoComDono');
  eq(L.diasDeCarga.length, P.diasDeCarga, 'quantidade de dias de carga');
  eq(fichas.filter((p) => p.carga).map((p) => p.d).join(), L.diasDeCarga.map((c) => c.dia).join(), 'datas de carga série × lista');
  if (!fichas[fichas.length - 1].parcial || fichas[fichas.length - 1].d !== A.DATAS.medidoEm) erros.push('último dia da série não está parcial');
  const pico = fichas.reduce((m, p) => (p.v > m.v ? p : m));
  if (!pico.carga) erros.push(`pico da série (${pico.d}) não é dia de carga`);
  const menorCarga = Math.min(...fichas.filter((p) => p.carga).map((p) => p.v));
  if (fichas.some((p) => !p.carga && p.v >= menorCarga)) erros.push('dia comum maior que um dia de carga');
  for (const c of L.diasDeCarga) {
    if (c.daFila && Math.abs(c.criados - c.convertidos) > 5) erros.push(`${c.dia}: carga da fila com criados × convertidos distantes`);
    if (!c.daFila && c.convertidos > c.criados * 0.2) erros.push(`${c.dia}: outra porta com conversão alta`);
  }
  if (L.diasDeCarga.filter((c) => !c.daFila).length !== 1) erros.push('deve haver exatamente um dia de "outra porta"');
  for (const d of L.diasDeCarga) if (d.dia < A.DATAS.inicio || d.dia > A.DATAS.fim) erros.push(`dia de carga fora do período: ${d.dia}`);

  eq(L.coortes.map((c) => c.semana).join(), A.DATAS.semanas.join(), 'semanas das coortes');
  L.coortes.forEach((c) => {
    const s = soma(fichas.filter((p) => U.semanaDe(p.d) === c.semana), (p) => p.v);
    eq(c.pilotos, s, `pilotos da coorte ${c.semana} × série`);
    eq(c.ativaramPct, U.pct(c.ativaram, c.pilotos), `ativaramPct ${c.semana}`);
    eq(c.porFicha, U.arred(c.passageiros / c.pilotos, 1), `porFicha ${c.semana}`);
    if (c.em1d > c.em7d || c.em7d > c.ativaramPct) erros.push(`coorte ${c.semana}: em1d ≤ em7d ≤ ativaram quebrado`);
  });
  const pri = L.coortes[0];
  const ult = L.coortes[L.coortes.length - 1];
  eq(pri.porFicha, P.safra.primeira.porFicha, 'porFicha da primeira safra');
  eq(ult.pilotos, P.safra.ultima.pilotos, 'pilotos da última safra');
  eq(ult.ativaramPct, P.safra.ultima.ativacaoPct, 'ativação da última safra');
  eq(ult.porFicha, P.safra.ultima.porFicha, 'porFicha da última safra');
  if (!ult.aberta || !ult.carga) erros.push('última coorte precisa ser aberta e com carga');
  eq(soma(L.coortes, (c) => c.passageiros), soma(L.whatsappProducao, (w) => w.passageiros), 'passageiros das coortes × WhatsApp');

  const ativos = P.funil[0].v;
  eq(soma(L.metas, (m) => m.pilotos), ativos, 'pilotos por plano × ativos');
  eq(soma(L.metas, (m) => m.meta * m.pilotos), P.funil[0].meta, 'meta dos planos × meta dos ativos');
  if (L.metas.some((m) => m.pilotos <= 0 || !Number.isInteger(m.pilotos))) erros.push('plano com pilotos inválido');
  L.metas.forEach((m) => eq(m.pct, U.pct(m.pilotos, ativos), `pct plano ${m.meta}`));
  eq(soma(L.ultimaMensagem, (u) => u.v), ativos, 'última mensagem × ativos');
  eq(soma(L.whatsappProducao, (w) => w.pilotos), ativos, 'pilotos por linha × ativos');
  for (let i = 1; i < L.whatsappProducao.length; i++) if (L.whatsappProducao[i].passageiros > L.whatsappProducao[i - 1].passageiros) erros.push('whatsappProducao fora da ordem');
  eq(L.metaFaseA.join(), P.metaFaseA.join(), 'metaFaseA');
  eq(L.funil.find((d) => d.operacional).id, 'vivo', 'degrau operacional');
  L.funil.forEach((d, i) => {
    eq(d.v, P.funil[i].v, `funil ${d.id}`);
    eq(d.meta, P.funil[i].meta, `meta funil ${d.id}`);
  });

  const horas = S.fichas_piloto_hora;
  eq(horas.length, 24, 'horas');
  eq(soma(horas), P.totalFichas, 'soma das horas × totalFichas');
  const top = horas.map((v, h) => [v, h]).sort((a, b) => b[0] - a[0]).slice(0, 4).map((x) => x[1]).sort((a, b) => a - b).join();
  const horasCarga = [...new Set(CARGAS.flatMap((c) => c.hora.map(([h]) => h)))].sort((a, b) => a - b).join();
  eq(top, horasCarga, 'as 4 maiores horas × horas das cargas');
  eq(L.celulasDeCarga.pct, U.pct(L.celulasDeCarga.fichas, P.totalFichas), 'pct das células');

  const pp = L.prePilotos;
  const criadas = S.pre_piloto_criadas_dia;
  const conv = S.pre_piloto_convertidas_dia;
  eq(soma(pp.estados, (e) => e.v), pp.total, 'estados × total de aspirantes');
  eq(pp.total, P.aspirantes.total, 'total de aspirantes');
  eq(soma(criadas, (p) => p.v), P.aspirantes.total, 'aspirantes criados × total');
  eq(soma(conv, (p) => p.v), P.aspirantes.viraramPiloto, 'convertidos × viraram piloto');
  conv.forEach((c, i) => {
    if (c.v > fichas[i].v) erros.push(`${c.d}: ${c.v} convertidos > ${fichas[i].v} fichas de piloto`);
  });
  let ac = 0;
  let acC = 0;
  criadas.forEach((c, i) => {
    ac += c.v;
    acC += conv[i].v;
    if (acC > ac) erros.push(`${c.d}: mais convertidos que aspirantes criados até o dia`);
  });
  L.diasDeCarga.forEach((c) => eq(conv.find((p) => p.d === c.dia).v, c.convertidos, `convertidos em ${c.dia}`));
  L.importacoes.forEach((im) => {
    eq(criadas.find((p) => p.d === im.dia).v, im.fichas, `importação ${im.dia} × série`);
    eq(im.fichas + im.jaEramPiloto, im.linhas, `linhas da importação ${im.dia}`);
  });
  if (soma(pp.fontes, (x) => x.fichas) > pp.total) erros.push('fontes somam mais que o total');
  if (soma(pp.fontes, (x) => x.viraramPiloto) > P.aspirantes.viraramPiloto) erros.push('fontes convertem mais que o total');
  for (let i = 1; i < pp.fontes.length; i++) if (pp.fontes[i].fichas > pp.fontes[i - 1].fichas) erros.push('fontes fora da ordem');
  eq(pp.contatosPorControlador, Math.round(P.aspirantes.naFila / P.contasControlador), 'contatos por controlador');

  if (soma(L.portas, (p) => p.fichas) > L.fichasCriadasPeloBot) erros.push('portas somam mais que as fichas do bot');
  eq(L.origemRegistradaPct, U.pct(L.fichasCriadasPeloBot, P.totalFichas), 'origemRegistradaPct');

  const setes = U.intervalo(U.somarDias(A.DATAS.medidoEm, -7), U.somarDias(A.DATAS.medidoEm, -1));
  eq(L.kpis[1].v, soma(fichas.filter((p) => setes.includes(p.d)), (p) => p.v), 'kpi criados em 7 dias');
  eq(L.kpis[2].v, P.aspirantes.naFila + P.aspirantes.viraramPassageiro, 'kpi aspirantes que não viraram piloto');

  const hojeVivo = L.regua.linhas.find((l) => /última semana/.test(l.metrica));
  eq(hojeVivo.hoje, U.fmt.n(P.funil.find((d) => d.id === 'vivo').v), 'régua: vivos hoje');
  const hojeAtiv = L.regua.linhas.find((l) => /Ativação/.test(l.metrica));
  eq(hojeAtiv.hoje, U.fmt.pct(ult.em7d), 'régua: ativação hoje');
  return erros;
}
