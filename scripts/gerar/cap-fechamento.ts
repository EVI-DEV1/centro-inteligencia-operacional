// Fechamento do livro fictício: síntese, métricas das três fases, plano até o D-7, perguntas, dados a guardar,
// errata e as conferências (divergências que a Torre mostra em vez de corrigir). Roda por último e lê os
// capítulos anteriores quando eles existem; sem eles, usa as âncoras e cala o que só o capítulo sabe.
import type { Contexto, SaidaCapitulo } from './tipos.ts';

const obj = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
const lista = (x) => (Array.isArray(x) ? x : []);
const num = (x) => typeof x === 'number' && Number.isFinite(x);
const EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
const DIA_CHEIO = { dom: 'domingo', seg: 'segunda', ter: 'terça', qua: 'quarta', qui: 'quinta', sex: 'sexta', 'sáb': 'sábado' };

const SIMULADO = { total: 560, jaFalaram: 370, nunca: 190 };
const ERRATA = { vivosAntes: 139, duplicadosAntes: 673, botAntesPct: 95, entregaAntesH: 1.2, bairrosAntes: 279836, bairros: 9, moradores: 140000 };
const PROVA_RODADA = 0.75;
const PROVA_R20_RESPOSTA = 20;

// régua em texto ("● ≥700 · ▲ 350–699 · ■ <350") → status de um valor
function lerFaixa(expr) {
  const limpo = expr.replace(/%|\/h|d\b/g, '').trim();
  const n = (s) => Number(String(s).replace(/\./g, '').replace(',', '.'));
  let m;
  if ((m = /^≥\s*([\d.,]+)$/.exec(limpo))) return (v) => v >= n(m[1]);
  if ((m = /^>\s*([\d.,]+)$/.exec(limpo))) return (v) => v > n(m[1]);
  if ((m = /^≤\s*([\d.,]+)$/.exec(limpo))) return (v) => v <= n(m[1]);
  if ((m = /^<\s*([\d.,]+)$/.exec(limpo))) return (v) => v < n(m[1]);
  if ((m = /^([\d.,]+)\s*–\s*([\d.,]+)$/.exec(limpo))) return (v) => v >= n(m[1]) && v <= n(m[2]);
  if ((m = /^([\d.,]+)$/.exec(limpo))) return (v) => v === n(m[1]);
  return null;
}
export function statusPelaRegua(regua, v) {
  if (!num(v)) return 'nao-medido';
  const cores = { '●': 'verde', '▲': 'amarelo', '■': 'vermelho' };
  for (const parte of regua.split('·')) {
    const t = parte.trim();
    const cor = cores[t[0]];
    const teste = cor ? lerFaixa(t.slice(1)) : null;
    if (teste && teste(v)) return cor;
  }
  return null;
}

export function gerar({ A, U, capitulos = {}, series = {} }: Contexto): SaidaCapitulo {
  const f = U.fmt;
  const { PILOTOS, TRES, PASSAGEIROS, CENTRAL, OPERACAO, ATENDIMENTO, ALCANCE, DATAS, VOCAB } = A;
  const cap = obj(capitulos);
  const P = obj(cap.pilotos);
  const PS = obj(cap.passageiros);
  const CT = obj(cap.controladores);
  const C = obj(cap.central);
  const O = obj(cap.operacao);
  const AL = obj(cap.alcance);
  const ext = (v) => (Number.isInteger(v) && v >= 0 && v < EXTENSO.length ? EXTENSO[v] : f.n(v));
  const dia = (iso) => f.data(iso);
  const plural = (v, um, varios) => (v === 1 ? um : varios);
  const inicial = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const funil = Object.fromEntries(PILOTOS.funil.map((d) => [d.id, d]));
  const elos = CENTRAL.capacidade.elos;
  const eloAbaixo = elos.filter((e) => e.teto < e.exige[0]);
  const piso = CENTRAL.capacidade.cenarios[0];
  const pleno = PASSAGEIROS.cenarios.find((c) => c.id === 'pleno');
  const cabe = pleno.emDiaD >= TRES.metaDeclarada;
  const kraft = OPERACAO.estoque.caixaKraft;
  const manual = OPERACAO.estoque.manualPiloto;
  const ateD7 = U.diasEntre(DATAS.medidoEm, DATAS.d7);
  const acabam = [kraft.dias < ateD7 ? `Caixa kraft (${f.dec(kraft.dias)} dias)` : null, manual.dias < ateD7 ? `Manual do Pessoa (${f.dec(manual.dias)} dias)` : null].filter(Boolean);
  const r20 = PILOTOS.linhaImportadaR20;
  const linha6 = CENTRAL.linhas.find((l) => l.numero === 'linha6');
  const faseB = DATAS.faseB;
  const sabadoAntes = U.somarDias(DATAS.diaD, -1);
  const metaPlanoR20 = r20.capital * VOCAB.planos[0];
  const kitVar = PILOTOS.kitVariantes;
  const fontesKit = `${f.n(kitVar.metricaFaseA)}, ${f.n(kitVar.outras[0])} ou ${f.n(kitVar.outras[1])}`;

  // ------------------------------------------------ síntese
  const sintese = [
    {
      t: 'A base pronta é de centenas, não de milhares.',
      d: `Das ${f.n(funil.ativos.v)} pessoas ativas, ${f.n(funil.dono.v)} têm dono de verdade, ${f.n(funil.canal.v)} já falaram com o bot, ${f.n(funil.produziu.v)} já cadastraram alguém e ${f.n(funil.vivo.v)} cadastraram alguém na última semana. A meta da fase A é levar esse número para ${f.n(PILOTOS.metaFaseA[0])}–${f.n(PILOTOS.metaFaseA[1])} até ${dia(DATAS.d7)} — e o único caminho medido é ativar quem já está lá (os ${f.n(PILOTOS.paradosSete.v)} que produziram e pararam, os ${f.n(r20.capital)} do R20_CAPITAL que nunca receberam disparo), não criar mais fichas.`,
    },
    {
      t: 'Criar pessoa em massa nunca rendeu adesão.',
      d: `${inicial(ext(PILOTOS.diasDeCarga))} ${plural(PILOTOS.diasDeCarga, 'dia', 'dias')} de carga criaram ${f.n(PILOTOS.fichasDeCarga)} das ${f.n(PILOTOS.totalFichas)} fichas (${f.pct(PILOTOS.fichasDeCargaPct)}). A safra de ${dia(PILOTOS.safra.ultima.semana)} ativou ${f.pct(PILOTOS.safra.ultima.ativacaoPct)} e rende ${f.dec(PILOTOS.safra.ultima.porFicha)} lead por ficha, contra ${f.dec(PILOTOS.safra.primeira.porFicha)} da safra de ${dia(PILOTOS.safra.primeira.semana)}. A Projetada de ${f.mil(TRES.projetada)} é soma de fichas: só ${f.mil(TRES.metaDeQuemJaProduz.v)} de meta pertencem a quem já produz, e ${f.n(PILOTOS.semDono.total)} pessoas sem dono real carregam ${f.mil(PILOTOS.semDono.meta)} dela sem ninguém cobrar.`,
    },
    {
      t: 'O ritmo é estável e o sistema nunca viu um surto.',
      d: `~${f.n(PASSAGEIROS.ritmo)} leads por dia há um mês; melhor dia ${f.n(PASSAGEIROS.melhorDiaAuditoria)} (${dia(PASSAGEIROS.melhorDia.dia)}); recorde de pessoas no mesmo dia: ${f.n(PASSAGEIROS.recordePilotosDia.v)} (${dia(PASSAGEIROS.recordePilotosDia.dia)}). A última semana pede ${f.n(elos[0].exige[0])}/dia só para ${piso}; ${ext(eloAbaixo.length)} dos ${ext(elos.length)} elos da Central ficam abaixo dessa exigência${elos.length - eloAbaixo.length === 1 ? ' e só o papel aguenta' : ''}. Mesmo com captura de 100%, a conta dá ${f.n(pleno.emDiaD)} — ${cabe ? `a meta de ${f.n(TRES.metaDeclarada)} cabe na conta da própria equipe` : `a meta de ${f.n(TRES.metaDeclarada)} não cabe na conta da própria equipe`}.`,
    },
    {
      t: 'A operação corre mais rápido do que consegue provar.',
      d: `Entrega em ${f.dec(OPERACAO.entrega.medianaH)} h de mediana (p90 ${f.n(OPERACAO.entrega.p90H)} h), mas ${f.n(OPERACAO.pedidos.arquivadosSemCarimbo)} dos ${f.n(OPERACAO.pedidos.total)} pedidos foram arquivados sem carimbo, há ${f.n(OPERACAO.etiquetas.conferidas)} ${plural(OPERACAO.etiquetas.conferidas, 'conferência', 'conferências')} de recebimento em ${f.n(OPERACAO.etiquetas.total)} etiquetas e "pessoas com kit" dá ${fontesKit} conforme a fonte.${acabam.length ? ` ${acabam.join(' e ')} ${plural(acabam.length, 'acaba', 'acabam')} antes de ${dia(DATAS.d7)}.` : ''}${OPERACAO.agendaSemanaDiaD === 0 ? ` A agenda da semana do Dia D (${dia(faseB.inicio)}–${dia(DATAS.diaD)}) está vazia.` : ''}`,
    },
    {
      t: `Uma pessoa responde por ${f.pct(ATENDIMENTO.umaConta.pct)} das baixas — e o clube entrou na pré-temporada sem instrumento de alcance.`,
      d: `A conversa marcada como crítica espera ${f.dec(ATENDIMENTO.medianaCriticaH)} h contra ${f.dec(ATENDIMENTO.medianaBaixaH)} h da marcada como baixa; segunda-feira paga o fim de semana (${f.dec(ATENDIMENTO.medianaSegundaH)} h). A coleta de seguidores e alcance parou em ${dia(ALCANCE.ultimaColeta)} sem erro.`,
    },
  ];

  // ------------------------------------------------ o que está funcionando
  const embaixadas = lista(PS.familias).find((x) => /embaixad/i.test(String(x.familia || '')));
  const emb = embaixadas && num(embaixadas.pilotos) && num(embaixadas.redePct) && num(embaixadas.registrosPct)
    ? embaixadas
    : { pilotos: PASSAGEIROS.lideranca.pilotos, redePct: U.pct(PASSAGEIROS.lideranca.pilotos, funil.ativos.v), registrosPct: U.pct(PASSAGEIROS.lideranca.registros, PASSAGEIROS.contabilizados) };
  const top10 = obj(CT.top10Soma);
  const semanaCT = obj(CT.semana);
  const fb = obj(AL.facebook);
  const fbDias = fb.de && fb.ate && fb.de.dia && fb.ate.dia ? U.diasEntre(fb.de.dia, fb.ate.dia) : null;
  const funcionando = [
    { t: 'O balcão de material', d: `mediana de ${f.dec(OPERACAO.entrega.medianaH)} h entre pedido e entrega` },
    { t: 'Os times de embaixada', d: `${f.n(emb.pilotos)} pessoas, ${f.pct(emb.redePct)} da rede, ${f.pct(emb.registrosPct)} dos registros` },
    { t: 'Os 10 maiores admins', d: num(top10.pct) && num(semanaCT.top10Pct) ? `${f.pct(top10.pct)} do acumulado e ${f.pct(semanaCT.top10Pct)} da última semana` : 'carregam a maior parte do acumulado e da última semana' },
    { t: 'O campo', d: `${f.n(OPERACAO.campo.faixa14d[0])} a ${f.n(OPERACAO.campo.faixa14d[1])} pessoas por dia, verde pela régua` },
    { t: 'A rede orgânica está viva', d: `${dia(PASSAGEIROS.recordePilotosDia.dia)} teve o recorde de pessoas cadastrando no mesmo dia (${f.n(PASSAGEIROS.recordePilotosDia.v)})` },
    { t: 'O acervo', d: `${f.n(ALCANCE.fotos30d)} fotos novas em 30 dias${num(fb.crescimentoPct) && fbDias ? `; Facebook +${f.pct(fb.crescimentoPct)} em ${f.n(fbDias)} dias` : ''}` },
  ];

  // ------------------------------------------------ acréscimos (números que só um capítulo tem)
  const rod = obj(CT.rodada);
  const nlmp = obj(CT.naoLancaramMasProduzem);
  const etq = obj(O.etiquetas);
  const pontos = lista(etq.pontos).filter((p) => p && num(p.total));
  const topPonto = pontos.reduce((m, p) => (!m || p.total > m.total ? p : m), null);
  const pontosParados = num(etq.pontosParados) ? etq.pontosParados : pontos.filter((p) => p.ult7d === 0).length;
  const naLista = num(obj(C.etapasResumo).naLista) ? C.etapasResumo.naLista : CENTRAL.paradasNaLista;
  const comEtapa = num(obj(C.etapasResumo).comEtapa) ? C.etapasResumo.comEtapa : CENTRAL.conversasComEtapa;
  const acrescimos = [
    num(rod.respondidas) && num(rod.linhas) && num(rod.responderamZero) && num(rod.linhasQueFormamReal) && rod.data
      ? `Na única rodada de expectativa (${dia(rod.data)}), ${f.n(rod.respondidas)} das ${f.n(rod.linhas)} linhas têm carimbo e ${f.n(rod.responderamZero)} vieram com zero — a Real de ${f.n(TRES.real)} sai de ${f.n(rod.linhasQueFormamReal)} linhas${num(nlmp.controladores) && num(nlmp.passageiros) ? `; ${f.n(nlmp.controladores)} admins que nunca lançaram produziram ${f.n(nlmp.passageiros)} leads` : ''}.`
      : null,
    `A linha6 concentra ${f.n(CENTRAL.conversasVivasLinha6)} das ${f.n(CENTRAL.conversasVivasSemana)} conversas vivas e consta como ${linha6.alerta.replace(/, não conferida hoje/, '')}.`,
    `${f.n(naLista)} das ${f.n(comEtapa)} conversas do bot pararam na lista de convidados.`,
    num(PS.dddForaDoEstado) ? `O DDD ${VOCAB.dddBase} domina a base: só ${f.n(PS.dddForaDoEstado)} leads têm telefone de outro estado — e a temporada só vale para saídas do aeroporto-base.` : null,
    topPonto && num(etq.total) && etq.total > 0 ? `O ${topPonto.ponto} fez ${f.pct(U.pct(topPonto.total, etq.total))} das etiquetas e ${ext(pontosParados)} ${plural(pontosParados, 'ponto está parado', 'pontos estão parados')}.` : null,
    `Na OPS Intelligence, ${f.pct(OPERACAO.loginFalhaPct)} das tentativas de login falharam.`,
  ].filter(Boolean).join(' ');

  // ------------------------------------------------ métricas das fases
  const regua = {
    prontos: `● ≥${f.n(PILOTOS.metaFaseA[0])} · ▲ 350–${f.n(PILOTOS.metaFaseA[0] - 1)} · ■ <350`,
    kits: `● ≥${f.n(PILOTOS.metaFaseA[0])} · ▲ 260–${f.n(PILOTOS.metaFaseA[0] - 1)} · ■ <260`,
    canal: `● ≥${f.n(PILOTOS.metaFaseA[1])} · ▲ ${f.n(PILOTOS.metaFaseA[0])}–${f.n(PILOTOS.metaFaseA[1] - 1)} · ■ <${f.n(PILOTOS.metaFaseA[0])}`,
    semDono: '● 0 · ▲ 1–40 · ■ >40',
    criados: '● ≥25% · ▲ 8–24% · ■ <8%',
    parados: '● ≤45 · ▲ 46–110 · ■ >110',
    estoque: '● >10 · ▲ 5–10 · ■ <5',
    simulado: `● ≥${f.n(Math.round(elos[0].exige[0] / 10))} · ▲ 140–${f.n(Math.round(elos[0].exige[0] / 10) - 1)} · ■ <140`,
    ritmo: '● ≥400 · ▲ 260–399 · ■ <260',
  };
  const diasMaisCurto = Math.min(kraft.dias, manual.dias);
  const linhaA = (metrica, hoje, hojeV, meta, r, nucleo) => ({ metrica, hoje, hojeV, meta, regua: r, status: statusPelaRegua(r, hojeV), nucleo });
  const metricasFaseA = [
    linhaA('Pessoas prontas (funil aninhado: dono, canal, produziu, vivo 7 d)', f.n(funil.vivo.v), funil.vivo.v, `${f.n(PILOTOS.metaFaseA[0])}–${f.n(PILOTOS.metaFaseA[1])}`, regua.prontos, 'pilotos'),
    linhaA('Kits entregues com carimbo de recebimento', f.n(kitVar.metricaFaseA), kitVar.metricaFaseA, `≥${f.n(PILOTOS.metaFaseA[0])}`, regua.kits, 'operacao'),
    linhaA('Pessoas que já falaram com a Central', f.n(funil.canal.v), funil.canal.v, `≥${f.n(PILOTOS.metaFaseA[1])}`, regua.canal, 'central'),
    linhaA('Pessoas sem dono (órfãos + fila de triagem)', f.n(PILOTOS.semDono.total), PILOTOS.semDono.total, '0', regua.semDono, 'controladores'),
    linhaA('Criados nos últimos 7 dias que já têm ≥1 lead', f.pct(PILOTOS.safra.ultima.ativacaoPct), PILOTOS.safra.ultima.ativacaoPct, '≥25%', regua.criados, 'pilotos'),
    linhaA('Pessoas que já produziram e pararam há 7+ dias', f.n(PILOTOS.paradosSete.v), PILOTOS.paradosSete.v, '≤45', regua.parados, 'passageiros'),
    linhaA('Dias de estoque do item mais curto (caixa, Manual)', f.dec(diasMaisCurto), diasMaisCurto, `>${f.n(ateD7 - 1)}`, regua.estoque, 'operacao'),
    { ...linhaA('Capacidade provada no simulado (registros/hora)', '—', null, `≥${f.n(Math.round(elos[0].exige[0] / 10))}/h`, regua.simulado, 'central'), status: 'nao-medido' },
    linhaA('Leads novos por dia (média 7 d)', `~${f.n(PASSAGEIROS.ritmo)}`, PASSAGEIROS.ritmo, '—', regua.ritmo, 'passageiros'),
  ];
  const metricasFaseB = [
    { metrica: 'Leads registrados por hora', regua: '● >240 · ▲ 110–240 · ■ <110' },
    { metrica: 'Pessoas vivas no dia (≥1 cadastro nas últimas 24 h)', regua: '● >440 · ▲ 180–440 · ■ <180' },
    { metrica: 'Mensagens sem resposta do bot e idade da mais velha', regua: 'régua em minutos; ■ acima de 12 min' },
    { metrica: 'Falhas do bot (erro, timeout, não entregue)', regua: '■ qualquer coisa acima de 1%' },
    { metrica: `% dos registrados que receberam o ${VOCAB.convite}`, regua: '● ≥96% · ▲ 88–95% · ■ <88%' },
    { metrica: 'Chamados humanos abertos há mais de 2 h', regua: '● 0 · ▲ 1–4 · ■ >4' },
  ];
  const metricasFaseC = [
    { metrica: '% dos leads com lembrete e código entregues até 10h', regua: '● ≥97% · ▲ 90–96% · ■ <90%' },
    { metrica: 'Falhas de entrega do lembrete, por hora', regua: '■ qualquer uma' },
    { metrica: `Tempo entre cadastro novo e envio do ${VOCAB.convite}`, regua: '● <4 min · ■ >12 min' },
  ];

  // ------------------------------------------------ plano até o D-7
  const M = DATAS.marcos;
  const [sim1, sim2] = M.simulado;
  const semana = (iso) => DIA_CHEIO[U.diaSemana(iso)];
  const lancaramMin = Math.ceil(PILOTOS.contasControlador * PROVA_RODADA);
  const plano = [
    {
      ate: M.redistribuir, rotulo: dia(M.redistribuir), diaSemana: semana(M.redistribuir),
      oque: ['Órfãos e fila de triagem redistribuídos', 'indicações em dobro marcadas', `disparo-teste nos ${f.n(r20.capital)} do R20_CAPITAL`, 'coleta das redes religada', 'compra de caixa kraft e Manual do Pessoa assinada', '3 pessoas treinadas no botão de baixa', 'conta da linha6 regularizada'],
      prova: ['Consulta de sem-dono devolve 0', `≥${PROVA_R20_RESPOSTA}% do R20_CAPITAL respondem em 48 h (ou ${f.n(metaPlanoR20)} de meta saem da conta por escrito)`, 'tabela de seguidores com linha de ontem', `ordem de compra com entrega ≤${dia(U.somarDias(DATAS.d7, -1))}`, '≥3 nomes distintos na baixa no mesmo dia'],
      nucleos: ['controladores', 'alcance', 'operacao', 'atendimento', 'central'],
    },
    {
      ate: M.kit, rotulo: dia(M.kit), diaSemana: semana(M.kit),
      oque: [`Kit na mão de ≥${f.n(PILOTOS.metaFaseA[0])} pessoas, conferido`, `rodada de expectativa refeita com a pergunta "quanto entre ${dia(faseB.inicio)} e ${dia(DATAS.diaD)}"`, `plano de visitas para ${dia(faseB.inicio)}–${dia(U.somarDias(faseB.inicio, 2))} no papel`, `escala de plantão 22h–8h e fim de semana ${sabadoAntes.slice(8, 10)}–${dia(DATAS.diaD)}`, 'segundo ponto de impressão testado'],
      prova: [`Tabela de conferência com ≥${f.n(PILOTOS.metaFaseA[0])} linhas (hoje: ${f.n(OPERACAO.etiquetas.conferidas)})`, `≥${f.n(lancaramMin)} dos ${f.n(PILOTOS.contasControlador)} admins lançaram`, 'bairros nomeados por dia com responsável', 'escala publicada'],
      nucleos: ['operacao', 'controladores', 'atendimento'],
    },
    {
      ate: M.simuladoAte, rotulo: `≤${dia(M.simuladoAte)}`, diaSemana: `${semana(sim1)} ou ${semana(sim2)} (${sim1.slice(8, 10)} ou ${dia(sim2)})`, simulado: true,
      oque: [`Simulado de surto: ${f.n(SIMULADO.total)} pessoas em dois grupos (${f.n(SIMULADO.jaFalaram)} que já falaram com o bot, ${f.n(SIMULADO.nunca)} que nunca), às 18h30, pelas linhas linha1, linha2 e linha5, gravado no sistema`],
      prova: [`Os 5 números do dia seguinte, contra o teto provado: mensagens/dia (${f.n(elos[2].teto)}) · leads registrados (${f.n(elos[0].teto)}) · pessoas distintas (${f.n(elos[1].teto)}) · chamados humanos abertos (${f.n(elos[3].teto)}) · fatia 22h–8h (${f.pct(PASSAGEIROS.madrugadaPct)})`],
      nucleos: ['central', 'passageiros', 'atendimento'],
    },
    {
      ate: M.d7, rotulo: dia(M.d7), diaSemana: `${semana(M.d7)} · D-7`,
      oque: [`Material pré-posicionado com as 10 maiores pessoas e os ${f.n(PILOTOS.contasControlador)} admins`, 'painel da fase B pronto (uma tela, atualização por hora)', `congelamento: nada entra em produção de ${dia(faseB.inicio)} a ${dia(DATAS.diaD)}, exceto correção de falha do surto`],
      prova: ['Recibo de cada um', 'a tela abre e mostra número de hoje', 'regra escrita e combinada'],
      nucleos: ['operacao', 'controladores', 'central'],
    },
  ];

  const avisoSimulado = `O simulado gasta material de verdade, ocupa a atendente que faz ${f.pct(ATENDIMENTO.umaConta.pct, 0)} das baixas e consome crédito com pessoas que serão necessários de novo em ${dia(faseB.inicio)}. Por isso: uma vez só, com os ${f.n(SIMULADO.total)} avisados de que é um ensaio, e nunca depois de ${dia(M.simuladoAte)}. E ele mede capacidade (registros por hora), não captura.`;

  const mediaQuemProduz = Math.round(TRES.contabilizados / TRES.metaDeQuemJaProduz.pilotos);
  const perguntas = [
    { q: 'Nas temporadas anteriores, o 80/20 era por pessoa ou por canal?', porque: 'Por pessoa = a mesma base decide tarde; a fase A é preparar quem já está lá e o kit é o gargalo. Por canal = a última semana traz gente nova; o gargalo vira o bot. Os dois planos são incompatíveis e o dinheiro da compra de material vai para lugares diferentes.' },
    { q: 'Qual foi a conversão cadastro → adesão, e era diferente para quem se cadastrou cedo e tarde?', porque: 'É o termo da conta que não existe em nenhum banco. Se quem se cadastra tarde adere mais, perseguir cadastro agora é desperdício.' },
    { q: 'Quantas adesões o clube teve na última temporada, e com quantos multiplicadores?', porque: `Os ${f.n(VOCAB.planos[1])} da meta nunca foram checados contra o histórico. Hoje quem produz faz ${f.n(mediaQuemProduz)} em média e a mediana da base inteira é zero.` },
  ];

  const origemPct = num(P.origemRegistradaPct) ? P.origemRegistradaPct : null;
  const dadosAGuardar = [
    { dado: 'Data na tag "kit recebido"', porque: 'O kit anda junto com a produção, mas sem data não dá para saber se veio antes ou depois — correlação, não causa.', como: 'Carimbar a data ao marcar; sortear: kit para metade de 80 parados e comparar com a outra metade, 14 dias depois.' },
    { dado: 'Carimbo de entrega obrigatório antes de arquivar', porque: `${f.n(OPERACAO.pedidos.arquivadosSemCarimbo)} pedidos (${f.pct(OPERACAO.pedidos.arquivadosSemCarimboPct)} de ${f.n(OPERACAO.pedidos.total)}) foram arquivados sem data de entrega. A taxa de entrega é ilegível.`, como: 'Regra na tela: arquivar só depois de "entregue".' },
    { dado: 'Uma fonte só para "kit entregue"', porque: `Dá ${fontesKit} conforme a fonte. A pergunta mais básica da fase A não tem resposta.`, como: 'Decidir a fonte (carimbo de conferência) e usar só ela.' },
    { dado: 'Confirmação do lead', porque: 'Indicação nunca confirmada com a pessoa. É o único número que vira adesão.', como: 'Mensagem de confirmação ao lead, com cuidado de privacidade.' },
    { dado: 'Origem da pessoa para 100%', porque: origemPct !== null ? `Só ${f.pct(origemPct, 0)} têm origem gravada (os criados pelo bot).` : 'Só as pessoas criadas pelo bot têm origem gravada.', como: 'Gravar origem em toda criação (tela, importação, evento).' },
    { dado: 'Cidade/UF do lead', porque: 'A temporada só vale para saídas do aeroporto-base. Hoje a checagem é pelo DDD — e é fraca.', como: 'Perguntar a cidade no cadastro.' },
    { dado: 'O que o bot envia e a primeira resposta humana', porque: 'O sistema não guarda o que o bot mandou nem a hora da primeira resposta humana. O SLA medido é "até fechar".', como: 'Gravar o envio do bot e carimbar a primeira resposta.' },
    { dado: 'Coleta de seguidores e alcance', porque: `Parada desde ${dia(ALCANCE.ultimaColeta)} sem erro.`, como: 'Religar o coletor e alarmar quando parar.' },
    { dado: 'Um denominador para a captura', porque: 'Sem ele, o simulado mede só capacidade e os cenários ficam sem chão.', como: `${VOCAB.convite[0].toUpperCase()}${VOCAB.convite.slice(1)}s entregues × cadastros; pergunta aos admins sobre indicações fora do sistema.` },
  ];

  const botPct = U.pct(PASSAGEIROS.origem.bot, PASSAGEIROS.origem.bot + PASSAGEIROS.origem.manual);
  const dobro = TRES.decomposicao.find((g) => g.id === 'dobro');
  const ativ = num(PS.ativacao24hEntreQuemAtiva) && num(PS.ativacao24hSobreTodos) ? `a ativação em 24 h é ${f.pct(PS.ativacao24hEntreQuemAtiva, 0)} entre quem ativa e ${f.pct(PS.ativacao24hSobreTodos)} sobre todos` : null;
  const itensErrata = [
    `a "base pronta" virou funil aninhado (${f.n(funil.vivo.v)} vivos, ${f.n(funil.kit.v)} com kit; antes ${f.n(ERRATA.vivosAntes)} e ${f.n(kitVar.metricaFaseA)})`,
    `os ${f.n(ERRATA.duplicadosAntes)} "duplicados" viraram ${f.n(dobro.pilotos)} indicações em dobro, ${f.n(dobro.comPassageiro)} produzem`,
    `a Projetada ganhou decomposição exclusiva (${f.mil(TRES.pisoHonesto)} a ${f.mil(TRES.tetoHonesto)})`,
    `"${ERRATA.botAntesPct}% pelo bot" virou ${f.pct(botPct, 0)} dos eventos, com ${f.n(-PASSAGEIROS.origem.exclusoes)} exclusões`,
    ativ,
    `a entrega em "${f.dec(ERRATA.entregaAntesH)} h" tem p90 de ${f.n(OPERACAO.entrega.p90H)} h`,
    `o ${f.n(ERRATA.bairrosAntes)} dos ${ext(ERRATA.bairros)} bairros era o dobro (≈${f.mil(ERRATA.moradores, 0)} moradores)`,
    'o simulado mede capacidade, não captura',
  ].filter(Boolean);
  const errata = `Uma auditoria externa apontou erros verificáveis e rótulos imprecisos; tudo foi remedido em ${dia(DATAS.medidoEm)} e incorporado: ${itensErrata.join(' · ')}.`;

  // ------------------------------------------------ conferências
  const conferencias = [
    { id: 'melhor-dia', onde: 'Cap. B p. 13–14 × Cap. D p. 32', achado: `Melhor dia de leads aparece como ${f.n(PASSAGEIROS.melhorDia.v)} (série diária) e ${f.n(PASSAGEIROS.melhorDiaAuditoria)} (auditoria, janela de corte algumas horas diferente).`, efeito: `Diferença de ${ext(PASSAGEIROS.melhorDiaAuditoria - PASSAGEIROS.melhorDia.v)} registros; o OPS Intelligence usa ${f.n(PASSAGEIROS.melhorDia.v)} na série e ${f.n(PASSAGEIROS.melhorDiaAuditoria)} onde o livro usa o teto provado.` },
    { id: 'total-passageiros', onde: 'Cap. A–C', achado: `Total de leads aparece como ${f.n(PASSAGEIROS.contabilizados)} (eventos menos exclusões), ${f.n(PASSAGEIROS.fichas)} (fichas), ${f.n(PASSAGEIROS.somaTabelaTimes)} (tabela de times) e ${f.n(PASSAGEIROS.semStatus)} sem status.`, efeito: `Janelas de medição diferentes; o OPS Intelligence usa ${f.n(PASSAGEIROS.contabilizados)} como número de capa.` },
  ];
  const kit = lista(PS.kit);
  const grupoKit = (re) => kit.find((k) => k && re.test(String(k.grupo || '')) && num(k.media));
  const kAntigoCom = grupoKit(/14\+.*COM/);
  const kAntigoSem = grupoKit(/14\+.*sem/);
  const kNovoCom = grupoKit(/nova.*COM/);
  const kNovoSem = grupoKit(/nova.*sem/);
  if (kAntigoCom && kAntigoSem && kNovoCom && kNovoSem) {
    conferencias.push({ id: 'kit-producao', onde: 'Cap. B p. 20 × Fechamento p. 55', achado: `Média de quem tem kit: ${f.dec(kAntigoCom.media)} contra ${f.dec(kAntigoSem.media)} nas fichas de 14 dias ou mais; ${f.dec(kNovoCom.media)} contra ${f.dec(kNovoSem.media)} nas fichas novas.`, efeito: 'Recortes diferentes; nenhum dos dois prova causa.' });
  }
  const timesDia = obj(obj(series).times_dia);
  const timesTabela = lista(PS.times);
  const divergentes = Object.keys(timesDia)
    .map((time) => {
      const linha = timesTabela.find((t) => t && t.time === time);
      const somaSerie = U.soma(lista(timesDia[time]), (p) => p.v);
      return linha && num(linha.passageiros) ? { time, serie: somaSerie, tabela: linha.passageiros } : null;
    })
    .filter((x) => x && x.serie !== x.tabela)
    .slice(0, 2);
  if (divergentes.length) {
    const partes = (k) => divergentes.map((x) => `${f.n(x[k])}${k === 'serie' ? ` para ${x.time}` : ''}`);
    conferencias.push({ id: 'times-serie', onde: 'Cap. B p. 18', achado: `A série diária por time soma ${partes('serie').join(' e ')}; a tabela dá ${partes('tabela').join(' e ')}.`, efeito: 'Os totais oficiais são os da tabela; a série vale para a forma da curva.' });
  }
  const vv = PILOTOS.vivosVariantes;
  const semanaCompleta = DATAS.semanas[DATAS.semanas.length - 2];
  const semanaAberta = DATAS.semanas[DATAS.semanas.length - 1];
  conferencias.push(
    { id: 'pilotos-vivos', onde: 'Cap. A × Cap. B', achado: `"Pessoas vivas na semana" aparece como ${f.n(vv.funil)} (funil aninhado, 7 dias até ${dia(DATAS.medidoEm)}), ${f.n(vv.ultimaSemanaCompleta)} (última semana completa, ${dia(semanaCompleta)}) e ${f.n(vv.semanaAberta)} (semana de ${dia(semanaAberta)} com ${ext(U.diasEntre(semanaAberta, DATAS.medidoEm) + 1)} dias).`, efeito: 'Três recortes legítimos; o OPS Intelligence rotula cada um.' },
    { id: 'pilotos-com-kit', onde: 'Fechamento p. 52', achado: `"Pessoas com kit" dá ${f.n(kitVar.funil)} (funil), ${f.n(kitVar.metricaFaseA)} (métrica da Fase A), ${f.n(kitVar.outras[0])} ou ${f.n(kitVar.outras[1])} conforme a fonte.`, efeito: 'Não há fonte única — o próprio livro pede decidir uma.' }
  );

  return {
    livro: {
      fechamento: { sintese, funcionando, acrescimos, metricasFaseA, metricasFaseB, metricasFaseC, plano, avisoSimulado, perguntas, dadosAGuardar, errata, p: [52, 55] },
      conferencias,
    },
    series: {},
  };
}

export function verificar(saida: SaidaCapitulo, { A, U, capitulos = {}, series = {} }: Contexto): string[] {
  const erros = [];
  const F = obj(obj(saida.livro).fechamento);
  const conf = lista(obj(saida.livro).conferencias);
  const { PILOTOS, PASSAGEIROS, CENTRAL, OPERACAO, DATAS, TRES } = A;
  const f = U.fmt;

  if (lista(F.sintese).length !== 5) erros.push(`síntese com ${lista(F.sintese).length} itens (esperado 5)`);

  const esperado = [PILOTOS.funil.find((d) => d.id === 'vivo').v, PILOTOS.kitVariantes.metricaFaseA, PILOTOS.funil.find((d) => d.id === 'canal').v, PILOTOS.semDono.total, PILOTOS.safra.ultima.ativacaoPct, PILOTOS.paradosSete.v, OPERACAO.estoque.caixaKraft.dias, null, PASSAGEIROS.ritmo];
  const mA = lista(F.metricasFaseA);
  if (mA.length !== esperado.length) erros.push(`metricasFaseA com ${mA.length} linhas (esperado ${esperado.length})`);
  if (!/^(?:Pilotos|Pessoas) pront[oa]s/.test(String(obj(mA[0]).metrica))) erros.push('a primeira métrica da Fase A precisa começar com "Pessoas prontas"');
  if (obj(mA[0]).meta !== '700–1.300') erros.push(`meta de pessoas prontas é "${obj(mA[0]).meta}" (esperado 700–1.300)`);
  mA.forEach((l, i) => {
    if (l.hojeV !== esperado[i]) erros.push(`metricasFaseA[${i}] hojeV ${l.hojeV} ≠ âncora ${esperado[i]}`);
    if (l.hojeV !== null) {
      const s = statusPelaRegua(l.regua, l.hojeV);
      if (s !== l.status) erros.push(`metricasFaseA[${i}] status ${l.status} ≠ régua (${s})`);
      const digitos = String(l.hoje).replace(/[^\d,]/g, '');
      if (digitos !== f.dec(l.hojeV, Number.isInteger(l.hojeV) ? 0 : 1).replace(/\./g, '')) erros.push(`metricasFaseA[${i}] hoje "${l.hoje}" não bate com ${l.hojeV}`);
    } else if (l.status !== 'nao-medido') erros.push(`metricasFaseA[${i}] sem valor precisa ser nao-medido`);
  });
  if (!lista(F.metricasFaseB).some((l) => /convite/.test(l.metrica))) erros.push('Fase B sem a métrica do convite');
  if (!lista(F.metricasFaseC).some((l) => /até 10h/.test(l.metrica))) erros.push('Fase C sem o lembrete até 10h');

  const datas = lista(F.plano).map((m) => m.ate);
  const datasEsperadas = [DATAS.marcos.redistribuir, DATAS.marcos.kit, DATAS.marcos.simuladoAte, DATAS.marcos.d7];
  if (datas.join() !== datasEsperadas.join()) erros.push(`plano com datas ${datas.join(', ')} (esperado ${datasEsperadas.join(', ')})`);
  const sim = lista(F.plano).find((m) => m.simulado);
  if (!sim || !/linha1, linha2 e linha5/.test(sim.oque[0]) || !/18h30/.test(sim.oque[0])) erros.push('simulado sem as linhas linha1, linha2, linha5 ou sem 18h30');
  if (sim && !/24 ou 25\/11/.test(sim.diaSemana)) erros.push(`simulado fora de 24 ou 25/11: "${sim && sim.diaSemana}"`);
  if (SIMULADO.jaFalaram + SIMULADO.nunca !== SIMULADO.total) erros.push('grupos do simulado não somam o total');
  if (SIMULADO.jaFalaram > PILOTOS.funil.find((d) => d.id === 'canal').v) erros.push('simulado chama mais pessoas que já falaram com o bot do que existem');
  if (SIMULADO.nunca > PILOTOS.semContatoComDono) erros.push('simulado chama mais pessoas que nunca falaram do que existem');
  const p0 = lista(obj(lista(F.plano)[0]).oque).join(' ');
  if (!/271 do R20_CAPITAL/.test(p0) || !/linha6/.test(p0)) erros.push('marco de 21/11 sem o disparo nos 271 do R20_CAPITAL ou sem a linha6');
  if (!/30\/11 a 06\/12/.test(lista(obj(lista(F.plano)[3]).oque).join(' '))) erros.push('marco do D-7 sem o congelamento 30/11–06/12');

  if (lista(F.perguntas).length !== 3) erros.push('perguntas: esperado 3');
  if (!lista(F.dadosAGuardar).some((d) => /Cidade\/UF do (?:passageiro|lead)/.test(d.dado) && /aeroporto-base/.test(d.porque))) erros.push('dadosAGuardar sem a cidade/UF do lead');

  const ids = conf.map((c) => c.id);
  for (const id of ['melhor-dia', 'total-passageiros', 'pilotos-vivos', 'pilotos-com-kit']) if (!ids.includes(id)) erros.push(`conferência ${id} faltando`);
  if (ids.includes('exigencia-100mil')) erros.push('a conferência da exigência de 100 mil saiu do livro');
  if (ids.includes('times-serie') && !obj(series).times_dia) erros.push('conferência times-serie sem a série times_dia');
  const kitCap = lista(obj(obj(capitulos).passageiros).kit);
  if (kitCap.length >= 4 && !ids.includes('kit-producao')) erros.push('capítulo B tem os recortes do kit e a conferência kit-producao sumiu');
  const textoConf = conf.map((c) => c.achado).join(' ');
  for (const v of [652, 655, 9846, 9865, 9845, 9862, 131, 118, 136, 47, 48, 286, 497]) if (!textoConf.includes(f.n(v))) erros.push(`conferências sem o valor ${f.n(v)}`);

  // o que outro capítulo já gerou tem de bater com as âncoras citadas aqui
  const cap = obj(capitulos);
  const P = obj(cap.pilotos);
  lista(P.funil).forEach((d) => {
    const ancora = PILOTOS.funil.find((x) => x.id === d.id);
    if (ancora && d.v !== ancora.v) erros.push(`pessoas.funil ${d.id} = ${d.v}, âncora ${ancora.v}`);
  });
  const checar = (rotulo, v, ancora) => {
    if (v !== undefined && v !== null && v !== ancora) erros.push(`${rotulo} = ${v}, mas o fechamento cita ${ancora}`);
  };
  checar('controladores.semDono.total', obj(obj(cap.controladores).semDono).total, PILOTOS.semDono.total);
  checar('passageiros.parados7mais.v', obj(obj(cap.passageiros).parados7mais).v, PILOTOS.paradosSete.v);
  checar('passageiros.recordePilotosDia.v', obj(obj(cap.passageiros).recordePilotosDia).v, PASSAGEIROS.recordePilotosDia.v);
  checar('tresNumeros.contabilizados.v', obj(obj(cap.tresNumeros).contabilizados).v, TRES.contabilizados);
  checar('central.conversasVivasSemana', obj(cap.central).conversasVivasSemana, CENTRAL.conversasVivasSemana);
  checar('operacao.pedidos.arquivadosSemCarimbo', obj(obj(cap.operacao).pedidos).arquivadosSemCarimbo, OPERACAO.pedidos.arquivadosSemCarimbo);
  checar('operacao.etiquetas.conferidas', obj(obj(cap.operacao).etiquetas).conferidas, OPERACAO.etiquetas.conferidas);
  const elo0 = obj(lista(obj(obj(cap.central).capacidade).elos)[0]);
  checar('central.capacidade.elos[0].teto', elo0.teto, CENTRAL.capacidade.elos[0].teto);
  const kraftCap = lista(obj(obj(cap.operacao).estoque).itens).find((i) => /caixa\s+kraft/i.test(String(i.item || '')));
  checar('operacao.estoque kraft dias', kraftCap && kraftCap.dias, OPERACAO.estoque.caixaKraft.dias);
  const coleta0 = obj(lista(obj(cap.alcance).coleta)[0]);
  if (coleta0.ultima) checar('alcance.coleta[0].ultima', String(coleta0.ultima).slice(0, 10), A.ALCANCE.ultimaColeta);
  const pessoa0 = obj(lista(obj(cap.atendimento).pessoas)[0]);
  checar('atendimento.pessoas[0].pct', pessoa0.pct, A.ATENDIMENTO.umaConta.pct);
  const rodCap = obj(obj(cap.controladores).rodada);
  const detalheReal = obj(obj(cap.tresNumeros).real).detalhe;
  if (detalheReal && num(rodCap.respondidas) && num(rodCap.linhas) && !(String(detalheReal).includes(f.n(rodCap.respondidas)) && String(detalheReal).includes(f.n(rodCap.linhas)))) {
    erros.push(`tresNumeros.real.detalhe ("${detalheReal}") não bate com admins.rodada (${f.n(rodCap.respondidas)} de ${f.n(rodCap.linhas)}), e os dois aparecem juntos na explicação da Real e nos acréscimos`);
  }
  const et = obj(obj(cap.operacao).etiquetas);
  if (lista(et.pontos).length && !String(F.acrescimos).includes('das etiquetas')) erros.push('operação tem pontos de impressão e os acréscimos não citam o maior');

  const todoTexto = JSON.stringify(F) + JSON.stringify(conf);
  const datasTexto = todoTexto.match(/\b\d{2}\/\d{2}\b/g) || [];
  for (const d of datasTexto) {
    const [dd, mm] = d.split('/').map(Number);
    const ok = mm > 12 || dd > 31 || (mm === 10 && dd >= 12) || mm === 11 || (mm === 12 && dd <= 6);
    if (!ok) erros.push(`data fora do calendário do livro: ${d}`);
  }
  return erros;
}
