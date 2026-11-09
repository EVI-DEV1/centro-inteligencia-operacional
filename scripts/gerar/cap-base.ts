// Capítulo base do livro fictício: capa, vocabulário, método, os três números, a premissa 20/80 e as fases.
// Não gera séries: tudo aqui sai das âncoras.
import type { Contexto, SaidaCapitulo } from './tipos.ts';


export function gerar({ A, U, capitulos = {} }: Contexto): SaidaCapitulo {
  const rc = (capitulos.controladores && capitulos.controladores.rodada) || {};
  const RODADA = { data: rc.data || '2026-11-10', linhas: rc.linhas, respondidas: rc.respondidas };
  const { fmt, arred, pct, somarDias, diasEntre } = U;
  const D = A.DATAS;
  const T3 = A.TRES;
  const P = A.PASSAGEIROS;
  const funil = A.PILOTOS.funil;
  const de = (id) => funil.find((d) => d.id === id);
  const ano = D.medidoEm.slice(0, 4);
  const medido = `${fmt.data(D.medidoEm)}/${ano}`;
  const flex = (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const mil = (v) => `${flex(v / 1000)} mil`;
  const medio = P.cenarios.find((c) => c.id === 'medio');
  const otimista = P.cenarios.find((c) => c.id === 'otimista');
  const [metaMin, metaMax] = A.PILOTOS.metaFaseA;
  const linha6 = A.CENTRAL.linhas.find((l) => l.numero === 'linha6');
  const linha4 = A.CENTRAL.linhas.find((l) => l.numero === 'linha4');
  const deposito = T3.decomposicao.find((g) => g.id === 'deposito');
  const eloMensagens = A.CENTRAL.capacidade.elos.find((e) => /^Mensagens recebidas por dia/.test(e.elo));
  const [campoMin, campoMax] = A.OPERACAO.campo.faixa14d;
  const nomesBancos = A.ORG.bancos.map((b) => b.nome);

  const diasFaseA = diasEntre(D.faseA.inicio, D.faseA.fim) + 1;
  const diasFaseB = diasEntre(D.faseB.inicio, D.faseB.fim) + 1;
  const diasUltimaSemana = diasFaseB + 1;
  const porDiaAntes = 20 / diasFaseA;
  const porDiaUltima = 80 / diasUltimaSemana;
  const horasUteisSurto = 12;
  const horaDoSurtoEmDiaDeAgora = arred(((porDiaUltima / horasUteisSurto) / porDiaAntes) * 100, 0);

  const meta = {
    titulo: A.ORG.relatorio,
    organizacao: 'Clube Horizonte · programa de indicação · demonstração com dados fictícios',
    versao: 2,
    medidoEm: D.medidoEm,
    janela: D.janela,
    periodo: { inicio: D.inicio, fim: D.fim, dias: D.dias },
    diaIncompleto: D.medidoEm,
    bancos: A.ORG.bancos.map((b) => ({ ...b })),
    regras: [
      'Leitura somente, e somente de agregados: nenhum nome, telefone ou endereço de pessoa indicada foi aberto.',
      'Grupo com menos de 5 pessoas fica de fora. Nome de equipe aparece porque é equipe, não pessoa.',
      'Todo horário foi levado para Brasília antes da contagem por dia; os bancos gravam em UTC.',
      `O dia ${fmt.data(D.medidoEm)} ainda estava em andamento: aparece em azul claro em todos os gráficos diários.`,
    ],
    diaD: D.diaD,
    encerramento: A.ORG.encerramento,
    d7: D.d7,
    faltavamDiasNaMedicao: D.faltavamDiasNaMedicao,
    hojeDemo: D.hojeDemo,
    marcos: { ...D.marcos, simulado: [...D.marcos.simulado] },
    frase: `Nenhum número desta Torre mede resultado: todos medem prontidão. A temporada depende de duas respostas — em ${fmt.data(D.d7)} existem de ${fmt.n(metaMin)} a ${fmt.n(metaMax)} pilotos com material na mão e canal aberto? E o sistema aguenta de ${flex(medio.xMelhorDia)} a ${flex(otimista.xMelhorDia)} vezes o seu melhor dia, sete dias seguidos?`,
    capa: [
      { v: P.contabilizados, rotulo: 'pessoas indicadas e cadastradas (passageiros)' },
      { v: P.ritmo, rotulo: 'por dia, média dos últimos 7 dias completos' },
      { v: de('vivo').v, rotulo: 'pilotos prontos e vivos (funil aninhado)' },
      { v: de('ativos').v, rotulo: 'pilotos ativos cadastrados' },
    ],
    p: 1,
  };

  const pares = [
    {
      par: 'Registrado · no mundo',
      significado: 'Registrado quer dizer que existe uma linha no banco — é só isso que a Torre enxerga. No mundo quer dizer que aconteceu com alguém. Indicação que ficou fora do sistema não ganha convite nem lembrete.',
    },
    {
      par: 'Piloto · Passageiro · Controlador',
      significado: 'Piloto é o embaixador que indica pelo WhatsApp, sem login. Passageiro é a pessoa indicada e cadastrada por um piloto (no banco, "Indicado"). Controlador coordena um grupo de pilotos e entra no painel com login.',
    },
    {
      par: 'Projetada · Real · Contabilizados',
      significado: 'Projetada é a soma dos planos dos pilotos ativos. Real é o que cada controlador lançou que os seus pilotos vão trazer (vale só com carimbo). Contabilizados são os passageiros já gravados no banco.',
    },
  ];

  const coresDoLivro = 'A série principal é azul e a referência é cinza. Vermelho aparece apenas onde há ação a tomar. Roxo sinaliza madrugada ou carga em lote; azul claro, o dia que ainda não terminou. Nenhuma cor vem sem uma palavra ao lado.';

  const glossario = [
    { termo: 'Clube Horizonte / Central Horizonte', def: 'Clube Horizonte é o nome que o público conhece; Central Horizonte é o sistema por trás dele (bot de WhatsApp, painel de pilotos e banco).' },
    { termo: 'Plano · Anel · Patente', def: `Plano é quantos passageiros o piloto se propôs a trazer (${A.VOCAB.planos.slice(0, 2).join(' ou ')}; ${A.VOCAB.planos.slice(2).join('/')} nas embaixadas). Anel é o progresso da pessoa contra o próprio plano. Patente é a faixa por passageiros absolutos (${A.VOCAB.patentes.join(', ')}).` },
    { termo: 'Aspirante', def: 'Ficha de alguém que pode virar piloto, vinda de lista importada ou do formulário de visitas. Passar a piloto não dispara mensagem para ninguém.' },
    { termo: 'Base pronta', def: 'Pilotos que atravessam o funil aninhado inteiro: dono real → canal aberto → já cadastrou alguém → vivo na semana. Não se confunde com o total de ativos.' },
    { termo: 'Captura', def: 'A parte do que acontece no mundo que vira registro no sistema — e só o que é registrado recebe convite e lembrete.' },
    { termo: 'Convite', def: 'Cartão ou mensagem com o código de adesão do Dia D, um por passageiro.' },
    { termo: 'Baixa', def: 'Botão da Torre que encerra uma conversa com uma nota do motivo. O "tempo de atendimento" medido vai até esse clique, não até a primeira resposta.' },
    { termo: 'Kit', def: 'Material físico do piloto, montado na base operacional. "Recebeu kit" é uma etiqueta marcada por decisão da coordenação e não guarda data.' },
    { termo: 'Sessão do bot · etapa', def: 'Todo telefone em conversa tem uma sessão parada em alguma etapa; MENU é a etapa de descanso.' },
    { termo: 'linha1…linha6, sac', def: `Apelidos dos números de WhatsApp da Central. A linha6 trouxe ${fmt.pct(linha6.pct, 0)} da entrada e está ${linha6.alerta.replace(/ \(.*$/, '')}; a linha4 ${linha4.alerta}.` },
    { termo: 'Fila de triagem', def: `Uma única controladora com ${fmt.n(deposito.pilotos)} pilotos (a triagem da ${A.VOCAB.familias.lista}), ${fmt.n(deposito.comPassageiro)} deles com passageiro. Não é equipe: é fila parada.` },
  ];

  const metodo = {
    medido: [
      `Leituras diretas nos bancos de produção em ${medido}, ${D.janela}: ${nomesBancos.slice(0, -1).join(', ')} e ${nomesBancos.at(-1)}.`,
      'Leitura somente, e somente de agregados. Nenhum nome, telefone ou endereço de pessoa indicada foi aberto. Grupo com menos de 5 pessoas fica de fora; nome de equipe aparece porque é equipe.',
      'Horários levados para Brasília antes de contar por dia: o banco grava em UTC, e sem a conversão o "hoje" começaria às 21h da véspera.',
    ],
    naoMedido: [
      'Limites de envio do provedor de WhatsApp (degrau de volume, nota de qualidade): não ficam no banco.',
      'Latência do bot: nenhuma mensagem tem carimbo de processamento.',
      `O ensaio de disparo de ${fmt.data(eloMensagens.quando)} em si: não ficou gravado.`,
      'Conversão cadastro → adesão: parâmetro do gestor.',
      'Quem abre qual tela da Torre: não existe registro de leitura.',
      `Operação de rua formal: tabelas zeradas; as ${fmt.n(campoMin)}–${fmt.n(campoMax)} pessoas por dia em campo trabalham fora do sistema.`,
      'Captura: pede um denominador que não está no sistema.',
    ],
    p: 4,
  };

  const soAcima = pct(T3.real - T3.contabilizados, T3.contabilizados, 0);
  const tresNumeros = {
    projetada: {
      v: T3.projetada,
      def: 'Soma dos planos dos pilotos ativos.',
      leitura: `Conta fichas. Um piloto criado ontem numa carga entra com plano ${A.VOCAB.planos[1]} e nenhum passageiro. Pela decomposição exclusiva, só ${fmt.n(T3.metaDeQuemJaProduz.v)} estão com quem já produz.`,
      naoE: 'não é previsão: nenhum desses planos foi combinado um a um',
    },
    real: {
      v: T3.real,
      def: `O que os controladores lançaram na rodada de ${fmt.data(RODADA.data)}, só com carimbo.`,
      leitura: `Mede a aposta de quem convive com os pilotos. Fica ${fmt.pct(soAcima, 0)} acima do contabilizado: ninguém está contando com um salto.`,
      detalhe: RODADA.linhas ? `${fmt.n(RODADA.respondidas)} de ${fmt.n(RODADA.linhas)} linhas com carimbo` : 'só as linhas com carimbo',
      naoE: 'não é contabilizado: é expectativa de quem convive',
    },
    contabilizados: {
      v: T3.contabilizados,
      def: 'Passageiros gravados no banco.',
      leitura: `É o único dos três que é fato. Mas é cadastro feito pelo piloto, sem confirmação com a pessoa: ${fmt.n(P.semStatus)} das ${fmt.n(P.fichas)} fichas não têm status de confirmação.`,
      naoE: 'não é adesão: é cadastro gravado uma vez',
    },
    metaDeclarada: { v: T3.metaDeclarada, conta: T3.metaConta, origem: T3.metaOrigem },
    metaDeQuemJaProduz: { v: T3.metaDeQuemJaProduz.v, pilotos: T3.metaDeQuemJaProduz.pilotos },
    noRitmoAtualAteDiaD: P.noRitmoAteDiaD,
    registradoSobreMetaPct: T3.registradoSobreMetaPct,
    realSobreProjetadaPct: T3.realSobreProjetadaPct,
    razaoProjetadaReal: T3.razaoProjetadaReal,
    decomposicao: T3.decomposicao.map((g) => ({ ...g })),
    pisoHonesto: T3.pisoHonesto,
    tetoHonesto: T3.tetoHonesto,
    soFicha: T3.soFicha,
    leituraDecomposicao: `Só ${fmt.n(T3.pisoHonesto)} de plano estão com quem já cadastrou alguém. Descontados órfãos, fila de triagem e fichas sem passageiro, restam ${fmt.n(T3.tetoHonesto)} com dono e algum sinal. Os outros ${fmt.n(T3.soFicha)} são ficha. Piso honesto: ${mil(T3.pisoHonesto)}; teto honesto: ${mil(T3.tetoHonesto)}.`,
    p: [3, 26],
  };

  const premissa2080 = {
    texto: 'Em temporadas anteriores, o gestor viu 20% do resultado acontecer até uma semana antes e 80% na última semana. Este livro não mede isso: é premissa dele, tirada de experiência real, e entra aqui como hipótese de peso alto.',
    diaVale: arred(porDiaUltima / porDiaAntes, 1),
    pctPorDiaAntes: arred(porDiaAntes, 1),
    pctPorDiaUltimaSemana: arred(porDiaUltima, 1),
    horaDeAtraso: `Uma hora parada em ${fmt.data(somarDias(D.faseB.inicio, 1))}, contando ${horasUteisSurto} horas úteis no dia do surto, custa ${fmt.pct(horaDoSurtoEmDiaDeAgora, 0)} de um dia inteiro de agora.`,
    formula: `Resultado = base pronta em ${fmt.data(D.d7)} × multiplicador (×5) × captura pelo sistema × conversão cadastro→adesão`,
    captura: 'nunca foi medida: o sistema nunca rodou sob surto',
    conversao: 'parâmetro do gestor',
    naoFaz: `Os dados deste livro não testam a premissa (${fmt.n(D.dias - 1)} dias completos de histórico, nenhuma semana de surto, nenhuma série de temporadas anteriores). Os cenários são contas com premissas declaradas, não intervalos estatísticos.`,
    p: 3,
  };

  const fases = [
    {
      id: 'A',
      nome: 'Preparação',
      inicio: D.faseA.inicio,
      fim: D.faseA.fim,
      dias: diasFaseA,
      objetivo: 'Montar a base pronta e provar a capacidade. Cadastro nesta fase vale 20% do resultado.',
      medir: ['pilotos prontos', 'kits conferidos', 'canal aberto com o bot', 'sem dono = 0', 'simulado de surto feito', 'insumos da Fase B recebidos'],
    },
    {
      id: 'B',
      nome: 'Surto',
      inicio: D.faseB.inicio,
      fim: D.faseB.fim,
      dias: diasFaseB,
      objetivo: 'Só capturar: nada se constrói nestes dias. Tudo medido por hora.',
      medir: ['cadastros/hora', 'pilotos vivos no dia', 'fila do bot em minutos', 'falhas', '% com convite', 'chamados > 2 h'],
    },
    {
      id: 'C',
      nome: 'Dia D',
      inicio: D.diaD,
      fim: D.diaD,
      dias: 1,
      objetivo: 'Cadastro vira adesão.',
      medir: ['% de lembretes entregues até 10h', 'falhas por hora', 'cadastro→convite em minutos'],
      nota: `adesões fecham ${A.ORG.encerramento}`,
    },
  ];

  return { livro: { meta, pares, coresDoLivro, glossario, metodo, tresNumeros, premissa2080, fases }, series: {} };
}

export function verificar(saida: SaidaCapitulo, { A, U }: Contexto): string[] {
  const erros = [];
  const { soma, pct, diasEntre, somarDias } = U;
  const L = saida.livro;
  const tn = L.tresNumeros;
  const D = A.DATAS;

  const somaMeta = soma(tn.decomposicao, (g) => g.meta);
  if (somaMeta !== tn.projetada.v) erros.push(`decomposição soma ${somaMeta}, Projetada é ${tn.projetada.v}`);
  const somaPilotos = soma(tn.decomposicao, (g) => g.pilotos);
  const ativos = A.PILOTOS.funil.find((d) => d.id === 'ativos').v;
  if (somaPilotos !== ativos) erros.push(`decomposição tem ${somaPilotos} pilotos, ativos são ${ativos}`);
  const comPassageiro = soma(tn.decomposicao, (g) => g.comPassageiro);
  if (comPassageiro !== tn.metaDeQuemJaProduz.pilotos) erros.push(`pilotos com passageiro na decomposição (${comPassageiro}) ≠ meta de quem já produz (${tn.metaDeQuemJaProduz.pilotos})`);
  for (const g of tn.decomposicao) if (g.pct !== pct(g.meta, tn.projetada.v)) erros.push(`pct do grupo ${g.id} não bate`);
  const sinal = soma(tn.decomposicao.filter((g) => g.natureza === 'sinal'), (g) => g.meta);
  const ficha = soma(tn.decomposicao.filter((g) => g.natureza === 'ficha'), (g) => g.meta);
  if (sinal !== tn.tetoHonesto) erros.push(`teto honesto ${tn.tetoHonesto} ≠ soma dos grupos com sinal ${sinal}`);
  if (ficha !== tn.soFicha) erros.push(`só ficha ${tn.soFicha} ≠ soma dos grupos de ficha ${ficha}`);
  if (tn.pisoHonesto !== tn.metaDeQuemJaProduz.v) erros.push('piso honesto ≠ meta de quem já produz');
  if (tn.realSobreProjetadaPct !== pct(tn.real.v, tn.projetada.v)) erros.push('real/projetada não bate');
  if (tn.registradoSobreMetaPct !== pct(tn.contabilizados.v, tn.metaDeclarada.v)) erros.push('registrado/meta não bate');
  if (Math.abs(tn.razaoProjetadaReal - tn.projetada.v / tn.real.v) > 0.05) erros.push('razão projetada/real não bate');
  const rodada = tn.real.detalhe.match(/^([\d.]+) de ([\d.]+) linhas/);
  if (!rodada || Number(rodada[1].replace(/\./g, '')) > Number(rodada[2].replace(/\./g, ''))) erros.push('detalhe da rodada inválido');

  const m = L.meta;
  if (diasEntre(m.medidoEm, m.diaD) !== m.faltavamDiasNaMedicao) erros.push('faltavamDiasNaMedicao não bate com medidoEm → diaD');
  if (diasEntre(m.periodo.inicio, m.periodo.fim) + 1 !== m.periodo.dias) erros.push('período: dias não batem');
  if (m.d7 !== somarDias(m.diaD, -7)) erros.push('D-7 não é sete dias antes do Dia D');
  if (m.hojeDemo !== somarDias(m.medidoEm, 1)) erros.push('hojeDemo deveria ser o dia seguinte à medição');
  if (m.capa.length !== 4) erros.push('capa precisa de 4 números');

  const [a, b, c] = L.fases;
  if (a.inicio !== somarDias(m.medidoEm, 1)) erros.push('Fase A não começa no dia seguinte à medição');
  if (b.inicio !== somarDias(a.fim, 1) || c.inicio !== somarDias(b.fim, 1)) erros.push('fases não são contíguas');
  if (a.fim !== m.d7 || c.inicio !== m.diaD) erros.push('Fase A deve terminar no D-7 e a C ser o Dia D');
  for (const fz of L.fases) if (diasEntre(fz.inicio, fz.fim) + 1 !== fz.dias) erros.push(`Fase ${fz.id}: dias não batem`);

  const pr = L.premissa2080;
  if (Math.abs(pr.pctPorDiaAntes * a.dias - 20) > 1) erros.push('premissa: % por dia da Fase A não soma 20%');
  if (Math.abs(pr.pctPorDiaUltimaSemana * (b.dias + c.dias) - 80) > 1) erros.push('premissa: % por dia da última semana não soma 80%');

  const textos = JSON.stringify(L);
  if (/\d{2}\/\d{2}\/20\d{2}/.test(textos.replace(`${U.fmt.data(D.medidoEm)}/${D.medidoEm.slice(0, 4)}`, ''))) erros.push('data com ano fora da medição');
  return erros;
}
