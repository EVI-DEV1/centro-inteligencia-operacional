// Números-âncora do livro fictício: tudo o que aparece em mais de um capítulo mora aqui, uma vez só.
// Cada capítulo (cap-*.ts) lê daqui e inventa o resto em volta, sem contradizer estes valores.
import { arred, pct, somarDias } from './util.ts';

export const ORG = {
  nome: 'Clube Horizonte',
  descricao: 'programa de indicação de um clube de viagens fictício',
  sistema: 'Central Horizonte', // bot de WhatsApp, painel de pilotos e cadastro
  operacao: 'Torre', // painel da operação: material, estoque, refeição, visitas, atendimento
  redes: 'Redes',
  relatorio: 'Pré-Temporada — o livro dos dados',
  diaD: 'Dia D · abertura da temporada',
  encerramento: '18h', // as adesões do Dia D fecham às 18h
  bancos: [
    { id: 'central', nome: 'Central Horizonte', papel: 'bot, pilotos, passageiros, chamados' },
    { id: 'operacao', nome: 'Torre', papel: 'material, estoque, refeição, visitas, atendimento' },
    { id: 'redes', nome: 'Redes', papel: 'seguidores, alcance, comentários' },
  ],
};

export const DATAS = {
  inicio: '2026-10-12',
  fim: '2026-11-14',
  dias: 34,
  medidoEm: '2026-11-14', // dia incompleto em todas as séries diárias
  janela: '14h–17h (Brasília)',
  hojeDemo: '2026-11-15', // "hoje" fixo da demonstração: primeiro dia da Fase A
  semanas: ['2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09'], // a de 09/11 está aberta (6 dias)
  faseA: { inicio: '2026-11-15', fim: '2026-11-29' },
  faseB: { inicio: '2026-11-30', fim: '2026-12-05' },
  diaD: '2026-12-06',
  d7: '2026-11-29',
  marcos: { redistribuir: '2026-11-21', kit: '2026-11-26', simulado: ['2026-11-24', '2026-11-25'], simuladoAte: '2026-11-27', d7: '2026-11-29' },
  faltavamDiasNaMedicao: 22,
};

// ---------------------------------------------------------------- pilotos (cap. A) — usados por B, C, D, E, fechamento
const funil = [
  { id: 'ativos', v: 1984, meta: 84720 },
  { id: 'dono', v: 1402, meta: 64380 },
  { id: 'canal', v: 661, meta: 29870 },
  { id: 'produziu', v: 247, meta: 12140 },
  { id: 'vivo', v: 131, meta: 6610 },
  { id: 'kit', v: 47, meta: 2410 },
].map((d) => ({ ...d, pct: pct(d.v, 1984) }));

export const PILOTOS = {
  funil, // ativos → dono → canal → produziu → vivo → kit
  semContatoComDono: 1402 - 661, // 741: o gargalo do funil
  metaFaseA: [700, 1300], // pilotos prontos em 29/11
  totalFichas: 2036,
  fichasDeCarga: 1571,
  fichasDeCargaPct: pct(1571, 2036),
  diasDeCarga: 4,
  semDono: { total: 582, orfaos: 44, triagem: 538, meta: 20560, pctProjetada: pct(20560, 84720), comPassageiro: 7 },
  contasControlador: 72,
  controladoresComPiloto: 53,
  vivosVariantes: { funil: 131, ultimaSemanaCompleta: 118, semanaAberta: 136 }, // 7 d até 14/11 · semana de 02/11 · semana de 09/11 (6 dias)
  kitVariantes: { funil: 47, metricaFaseA: 48, outras: [286, 497] },
  paradosSete: { v: 124, devem: 2456 }, // já produziram e pararam há 7 dias ou mais
  safra: { primeira: { semana: '2026-10-12', porFicha: 41.7 }, ultima: { semana: '2026-11-09', ativacaoPct: 2.1, porFicha: 0.7, pilotos: 1146 } },
  aspirantes: { total: 4012, naFila: 2148, naFilaComControlador: 1866, viraramPiloto: 1741, viraramPassageiro: 123 },
  linhaImportadaR20: { pilotos: 280, capital: 271, passageiros: 11 }, // família Rota 20 (lista importada); 271 no time R20_CAPITAL
};

// ---------------------------------------------------------------- os três números
export const TRES = {
  projetada: 84720,
  real: 12874,
  contabilizados: 9846,
  metaDeclarada: 112000, // 2.800 pilotos × 40
  metaConta: '2.800 pilotos × 40 passageiros',
  metaOrigem: 'reunião de 02/09',
  razaoProjetadaReal: arred(84720 / 12874, 1),
  realSobreProjetadaPct: pct(12874, 84720),
  registradoSobreMetaPct: pct(9846, 112000),
  decomposicao: [
    { id: 'orfaos', grupo: 'Órfãos (sem controlador)', pilotos: 44, comPassageiro: 4, meta: 1920, natureza: 'ficha' },
    { id: 'deposito', grupo: 'Fila de triagem (1 controladora)', pilotos: 538, comPassageiro: 3, meta: 18640, natureza: 'ficha' },
    { id: 'dobro', grupo: 'É passageiro de outro piloto', pilotos: 602, comPassageiro: 161, meta: 27480, natureza: 'sinal' },
    { id: 'novos', grupo: 'Criado há <7 dias, sem passageiro', pilotos: 523, comPassageiro: 0, meta: 23100, natureza: 'ficha' },
    { id: 'antigos', grupo: 'Antigo, sem passageiro', pilotos: 171, comPassageiro: 0, meta: 8560, natureza: 'ficha' },
    { id: 'produz', grupo: 'Produz (demais)', pilotos: 106, comPassageiro: 106, meta: 5020, natureza: 'sinal' },
  ].map((g) => ({ ...g, pct: pct(g.meta, 84720) })),
  metaDeQuemJaProduz: { v: 12960, pilotos: 274 },
  pisoHonesto: 12960,
  tetoHonesto: 27480 + 5020, // 32.500
  soFicha: 1920 + 18640 + 23100 + 8560, // 52.220
};

// ---------------------------------------------------------------- passageiros (cap. B) — usados por A, C, D, fechamento
const RITMO = 290.57; // média dos 7 dias completos (07/11 a 13/11), mostrada como 291
const cenario = (id: string, nome: string, ritmo: number, captura: number, extra: { limite?: boolean } = {}) => {
  const base = TRES.contabilizados + ritmo * 15;
  const regDiaSurto = (base * 4 * (captura / 100)) / 7;
  const final = base + base * 4 * (captura / 100);
  return { id, nome, ritmo: id === 'medio' ? Math.round(ritmo) : ritmo, baseD7: Math.round(base), captura, regDiaSurto: Math.round(regDiaSurto), xMelhorDia: arred(regDiaSurto / 652, 1), emDiaD: Math.round(final), pctMeta: pct(final, TRES.metaDeclarada), ...extra };
};
export const PASSAGEIROS = {
  contabilizados: 9846, // capa: eventos menos exclusões
  fichas: 9865,
  somaTabelaTimes: 9845,
  semStatus: 9862,
  confirmacao: { semResposta: 9862, vaiAderir: 2, naoVai: 1 },
  origem: { bot: 9431, manual: 722, exclusoes: -307 },
  ritmo: 291,
  ritmoAtual: RITMO,
  melhorDia: { v: 652, dia: '2026-10-22' }, // série diária
  melhorDiaAuditoria: 655, // mesmo dia, janela de corte algumas horas diferente
  recordePilotosDia: { v: 49, dia: '2026-11-13', pctAtivos: pct(49, 1984) },
  produtividade7d: 9.2,
  madrugadaPct: 13.6, // cadastros entre 22h e 8h
  noRitmoAteDiaD: Math.round(9846 + RITMO * 22), // 16.239
  cenarios: [
    cenario('pessimista', 'Pessimista', 220, 15),
    cenario('medio', 'Médio', RITMO, 35),
    cenario('otimista', 'Otimista', 490, 60),
    cenario('pleno', '20/80 pleno', 490, 100, { limite: true }),
  ],
  lideranca: { pilotos: 102, registros: 3318 }, // família das embaixadas: ~5% da rede, ~1/3 dos registros
};

// ---------------------------------------------------------------- Central (cap. D) — usada por A, fechamento
export const CENTRAL = {
  // passageiros pelo número ATUAL do piloto; denominador = 9.865 fichas
  linhas: [
    { numero: 'linha6', pilotos: 188, passageiros: 5214, alerta: 'bloqueada por pagamento (verificação de 11/11, não conferida hoje)' },
    { numero: 'linha5', pilotos: 104, passageiros: 3628 },
    { numero: 'linha2', pilotos: 29, passageiros: 423 },
    { numero: '(nenhuma)', pilotos: 1611, passageiros: 287 },
    { numero: 'linha1', pilotos: 36, passageiros: 196 },
    { numero: 'linha4', pilotos: 15, passageiros: 117, alerta: 'perdeu o selo de conta ativa (verificação de 11/11)' },
    { numero: 'sac', pilotos: 1, passageiros: 0 },
  ].map((l) => ({ ...l, pct: pct(l.passageiros, 9865) })),
  conversasVivasSemana: 186,
  conversasVivasLinha6: 118,
  chamadosAbertosAgora: 29,
  chamadosParados48h: 25,
  conversasComEtapa: 761,
  paradasNaLista: 298, // conversas paradas no meio da lista de convidados
  capacidade: {
    cenarios: ['25 mil', '50 mil', '90 mil'], // exigência diária da última semana = resultado × 0,8 ÷ 7
    elos: [
      { elo: 'Passageiros registrados por dia', teto: 655, quando: '2026-10-22', exige: [2857, 5714, 10286] },
      { elo: 'Pilotos cadastrando no mesmo dia', teto: 49, quando: '2026-11-13', exige: [301, 601, 1083] },
      { elo: 'Mensagens recebidas por dia', teto: 1548, quando: '2026-10-26', exige: [4300, 8600, 15500] },
      { elo: 'Chamados humanos abertos no dia', teto: 23, quando: '2026-10-26', exige: [29, 57, 103] },
      { elo: 'Convites impressos em estoque (1 por cadastro)', teto: 742310, quando: '2026-11-14', exige: [25000, 50000, 90000] },
    ],
  },
};

// ---------------------------------------------------------------- operação (cap. E) — usada por fechamento
export const OPERACAO = {
  pedidos: { total: 1176, entreguesComCarimbo: 537, arquivadosSemCarimbo: 609, abertos: 30, arquivadosSemCarimboPct: pct(609, 1176) },
  entrega: { medianaH: 1.6, p90H: 61 },
  etiquetas: { total: 2212, conferidas: 1 },
  estoque: { caixaKraft: { dias: 3.6, saldo: 618 }, manualPiloto: { dias: 7.8, saldo: 1043 }, itensMedidos: 34, abaixoDe5d: 9, zerados: 3 },
  campo: { faixa14d: [58, 104], mediana: 93, ontem: 97 },
  portaAPorta: { engajamentoDe: 74.6, engajamentoPara: 24.3 },
  loginFalhaPct: 36.8,
  scriptPct: 49.6,
  agendaSemanaDiaD: 0,
};

// ---------------------------------------------------------------- atendimento e alcance (cap. F)
export const ATENDIMENTO = {
  baixas30d: 3702,
  umaConta: { nome: 'Marta L.', v: 3199, pct: pct(3199, 3702) },
  contasTorre: 214,
  contasQueDeramBaixa: 5,
  criticasAgora: { esperando: 3, mediaH: 38, maiorH: 71 },
  medianaSegundaH: 24.8,
  medianaCriticaH: 25.9,
  medianaBaixaH: 1.8,
  assuntoDestaque: 'Assistência em viagem',
};
export const ALCANCE = {
  ultimaColeta: '2026-11-05',
  coletaParadaDias: 9.4,
  seguidoresInstagram: 184320,
  alcanceSemanaInstagram: 171940,
  fotos30d: 8735,
  comentarios: 28406,
  comentariosRespondidos: 0,
};

// ---------------------------------------------------------------- pessoas (todas fictícias: primeiro nome + inicial)
export const PESSOAS = {
  // controladores em ordem de passageiros acumulados (cap. C); os 10 primeiros formam o "top 10"
  controladores: ['Ana V.', 'Bruno T.', 'Celso M.', 'Denise R.', 'Edson S.', 'Fátima N.', 'Gustavo P.', 'Hilda L.', 'Igor C.', 'Kleber A.', 'Lívia E.', 'Nelson G.', 'Otávio H.', 'Renata K.', 'Sílvia J.', 'Tiago O.', 'Úrsula Q.', 'Vítor W.', 'Yara U.', 'Luana B.'],
  // aparecem na lista da semana ou na cobertura da rodada sem estar no top 20
  outrosControladores: ['Rogério Z.', 'Zélia W.', 'Wagner I.', 'Ivone T.', 'Priscila X.', 'Osmar Y.', 'Gilberto M.', 'Heloísa D.'],
  contaTriagem: 'Joana F.', // a controladora da fila de triagem do R20; também dá baixas no atendimento
  atendentes: ['Marta L.', 'Equipe Rua', 'Joana F.', 'Caio R.', 'Luana B.'],
};

// ---------------------------------------------------------------- vocabulário
export const VOCAB = {
  planos: [20, 40, 100, 200], // metas do piloto; 100 e 200 são das embaixadas (lideranças)
  patentes: [40, 80, 120],
  familias: { grande: 'Rota 40', lista: 'Rota 20', lideranca: 'Embaixadas', semRotulo: 'Sem rótulo' },
  times: ['R40_CAPITAL', 'COMUNIDADE_NORTE', '(sem rótulo)', 'EMBAIXADA_200', 'EMBAIXADA_100', 'R40_INTERIOR', 'R40_LITORAL', 'EMBAIXADA_MAIS_100', 'COMUNIDADE_SUL', 'R20_CAPITAL', 'R20_INTERIOR', 'R20_LITORAL'],
  regioes: ['Norte', 'Sul', 'Leste', 'Oeste', 'Centro', 'Metropolitana'],
  dddBase: '41',
  convite: 'convite', // cartão ou mensagem com o código de adesão para o Dia D (1 por passageiro)
};

export const fimDaBase = DATAS.d7;
export const diaAntes = (iso: string): string => somarDias(iso, -1);
