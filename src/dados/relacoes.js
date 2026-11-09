(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const f = T.fmt;

  const aoVivo = () => T.dados.fonte.tipo === 'ao-vivo';
  const num = (x) => typeof x === 'number' && Number.isFinite(x);
  const obj = (x) => (x && typeof x === 'object' ? x : {});
  const lista = (x) => (Array.isArray(x) ? x : []);
  const achar = (arr, teste) => lista(arr).find((x) => x && teste(x)) || null;
  const plural = (v, um, varios) => (v === 1 ? um : varios);
  const EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
  const extenso = (v) => (Number.isInteger(v) && v >= 0 && v < EXTENSO.length ? EXTENSO[v] : f.n(v));
  const inicial = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const minuscula = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const juntar = (itens) => (itens.length > 1 ? `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}` : itens[0] || '');
  const repor = (arr, novo) => arr.splice(0, arr.length, ...novo);
  const numeroEm = (texto, re) => {
    const m = re.exec(String(texto || ''));
    return m ? Number(m[1].replace(/\./g, '').replace(',', '.')) : null;
  };

  const coletaDiaria = () => {
    const c = obj(lista(obj(L.alcance).coleta)[0]);
    const estado = !c.ultima ? 'sem-dados' : String(c.ultima).slice(0, 10) === T.dados.diaMedido() ? 'atualizado' : !num(c.paradaDias) ? 'sem-dados' : c.paradaDias <= 2 ? 'atencao' : 'atrasado';
    const dias = num(c.paradaDias) ? Math.floor(c.paradaDias) : null;
    return { c, estado, dias, texto: dias >= 1 ? `${f.n(dias)} ${plural(dias, 'dia', 'dias')}` : `${f.nFlex(c.paradaDias, 1)} dia` };
  };
  const PALAVRA_COLETA = { atualizado: 'ATUALIZADO', atencao: 'ATENÇÃO', atrasado: 'ATRASADO' };

  const RE_KRAFT = /caixa\s+kraft/i;
  const RE_MANUAL = /^manual\s+(d[oa]\s+)?(piloto|pessoa)/i;
  const diasItem = (re) => {
    const d = lista(obj(obj(L.operacao).estoque).itens).filter((i) => i && re.test(String(i.item || '')) && num(i.dias)).map((i) => i.dias);
    return d.length ? Math.min(...d) : null;
  };

  const leituraCenarios = () => {
    const C = obj(obj(L.passageiros).cenarios);
    const meta = obj(obj(L.tresNumeros).metaDeclarada).v;
    const pleno = achar(C.linhas, (l) => l.id === 'pleno') || {};
    const alcancam = lista(C.linhas).filter((l) => !l.limite && num(l.emDiaD) && num(meta) && l.emDiaD >= meta).map((l) => l.nome);
    return { meta, pleno, alcancam, cabe: num(pleno.emDiaD) && num(meta) ? pleno.emDiaD >= meta : null };
  };

  const planoL = () => lista(obj(L.fechamento).plano);
  const faseB = () => obj(achar(L.fases, (x) => x.id === 'B'));
  const provaDe = (re) => {
    for (const m of planoL()) {
      const p = lista(m.prova).find((x) => re.test(String(x)));
      if (p) return `Prova até ${f.data(m.ate)}: ${minuscula(String(p))}.`;
    }
    return '';
  };
  const textoPlano = (re) => {
    for (const m of planoL()) {
      const o = lista(m.oque).find((x) => re.test(String(x)));
      if (o) return String(o);
    }
    return '';
  };
  const metricaFaseA = (re) => achar(obj(L.fechamento).metricasFaseA, (l) => re.test(String(l.metrica || '')));

  const statusRegua = (regua, re) => (achar(obj(regua).linhas, (l) => re.test(String(l.metrica || ''))) || {}).status || null;
  const nivelPela = (livro, status) => (livro === 'agir' && (status === 'amarelo' || status === 'verde') ? 'atencao' : livro);

  const registrarNomes = () =>
    T.registrarNomes([
      ...lista(obj(L.controladores).top20).map((c) => c.nome),
      ...lista(obj(obj(L.controladores).semana).lista).map((c) => c.nome),
      ...lista(obj(obj(L.controladores).rodada).cobertura).map((c) => c.nome),
      ...lista(obj(L.atendimento).pessoas).map((p) => p.nome),
    ]);
  registrarNomes();

  T.numerosChave = function () {
    const funil = L.pilotos.funil;
    const iDe = (id) => funil.findIndex((d) => d.id === id);
    const de = (id) => (funil[iDe(id)] || {}).v ?? null;
    const elo = (L.central.capacidade.elos || [])[0] || { teto: null, exige: [null] };
    const iKraft = L.operacao.estoque.itens.findIndex((i) => /kraft/i.test(i.item));
    const kraft = L.operacao.estoque.itens[iKraft] || { dias: null };
    const marcos = L.fechamento.plano.filter((m) => m.ate <= L.meta.d7).length;
    return {
      ativos: de('ativos'),
      dono: de('dono'),
      canal: de('canal'),
      produziu: de('produziu'),
      vivos: de('vivo'),
      kit: de('kit'),
      nuncaFalaram: de('dono') !== null && de('canal') !== null ? de('dono') - de('canal') : null,
      ritmo: Math.round(L.passageiros.cenarios.ritmoAtual),
      registrados: L.passageiros.cenarios.registrado,
      semDono: L.controladores.semDono.total,
      teto: elo.teto,
      exige: elo.exige[0],
      kraftDias: kraft.dias,
      concentracao: L.atendimento.pessoas[0].pct,
      coletaParada: L.alcance.coleta[0].paradaDias,
      marcos,
      chave: {
        ativos: `pilotos.funil[${iDe('ativos')}].v`,
        dono: `pilotos.funil[${iDe('dono')}].v`,
        canal: `pilotos.funil[${iDe('canal')}].v`,
        produziu: `pilotos.funil[${iDe('produziu')}].v`,
        vivos: `pilotos.funil[${iDe('vivo')}].v`,
        kit: `pilotos.funil[${iDe('kit')}].v`,
        ritmo: 'passageiros.cenarios.ritmoAtual',
        registrados: 'passageiros.cenarios.registrado',
        semDono: 'controladores.semDono.total',
        teto: 'central.capacidade.elos[0].teto',
        exige: 'central.capacidade.elos[0].exige[0]',
        kraftDias: `operacao.estoque.itens[${iKraft}].dias`,
        concentracao: 'atendimento.pessoas[0].pct',
        coletaParada: 'alcance.coleta[0].paradaDias',
        projetada: 'tresNumeros.projetada.v',
        real: 'tresNumeros.real.v',
        contabilizados: 'tresNumeros.contabilizados.v',
        meta: 'tresNumeros.metaDeclarada.v',
      },
    };
  };

  // Navegação do OPS Intelligence. `so`: 'horizonte' = só no cliente de demonstração Clube Horizonte
  // (capítulos do livro do programa); 'admin' = só administradores. Os ids de rota antigos foram mantidos
  // (pilotos, passageiros, controladores, plano) para não quebrar links e atalhos já usados.
  T.paginas = [
    { id: 'painel', codigo: null, nome: 'Visão Executiva', icone: 'painel', grupo: 'Inteligência' },
    { id: 'central', codigo: null, nome: 'Central', icone: 'central', grupo: 'Inteligência' },
    { id: 'conteudo', codigo: null, nome: 'Análise de Conteúdo', icone: 'alcance', grupo: 'Inteligência' },
    { id: 'plano', codigo: null, nome: 'Campanhas', icone: 'plano', grupo: 'Comercial' },
    { id: 'passageiros', codigo: null, nome: 'Leads', icone: 'passageiros', grupo: 'Comercial', capitulo: 'passageiros' },
    { id: 'pilotos', codigo: null, nome: 'Pessoas', icone: 'pilotos', grupo: 'Gestão', capitulo: 'pilotos' },
    { id: 'controladores', codigo: null, nome: 'Admin', icone: 'controladores', grupo: 'Gestão', capitulo: 'controladores' },
    { id: 'comparar', codigo: null, nome: 'Comparar clientes', icone: 'tendencia', grupo: 'Gestão', so: 'admin' },
    { id: 'relatorio', codigo: null, nome: 'Resumo do programa', icone: 'visao', grupo: 'Programa Horizonte', so: 'horizonte' },
    { id: 'operacao', codigo: 'E', nome: 'Operação', icone: 'operacao', capitulo: 'operacao', grupo: 'Programa Horizonte', so: 'horizonte' },
    { id: 'atendimento', codigo: 'F', parte: '1/2', nome: 'Atendimento', icone: 'atendimento', capitulo: 'atendimento', grupo: 'Programa Horizonte', so: 'horizonte' },
    { id: 'alcance', codigo: 'F', parte: '2/2', nome: 'Alcance', icone: 'alcance', capitulo: 'alcance', grupo: 'Programa Horizonte', so: 'horizonte' },
    { id: 'decisao', codigo: null, codigoIcone: 'decisao', nome: 'Central de Decisão', icone: 'decisao', grupo: 'Programa Horizonte', so: 'horizonte' },
    { id: 'dados', codigo: null, nome: 'Dados e integrações', icone: 'dados', grupo: 'Workspace' },
  ];

  const montarNucleos = () => {
    const n = T.numerosChave();
    return [
      { id: 'controladores', nome: 'Admin', icone: 'controladores', leitura: { v: n.semDono, texto: 'sem dono real', fmt: f.n, chave: n.chave.semDono }, curta: `${f.n(n.semDono)} sem dono` },
      { id: 'pilotos', nome: 'Pessoas', icone: 'pilotos', leitura: { v: n.vivos, texto: `vivas de ${f.n(n.ativos)}`, fmt: f.n, chave: n.chave.vivos }, curta: `${f.n(n.vivos)} vivas` },
      { id: 'central', nome: 'Central', icone: 'central', leitura: { v: n.teto, texto: `teto × ${f.n(n.exige)}/dia`, fmt: f.n, chave: n.chave.teto }, curta: `${f.n(n.teto)} × ${f.n(n.exige)}` },
      { id: 'passageiros', nome: 'Leads', icone: 'passageiros', leitura: { v: n.registrados, texto: `~${f.n(n.ritmo)} por dia`, fmt: f.n, chave: n.chave.registrados }, curta: `${f.n(n.ritmo)}/dia` },
      { id: 'operacao', nome: 'Operação', icone: 'operacao', leitura: { v: n.kraftDias, texto: 'de caixa kraft', fmt: (v) => f.d(v), chave: n.chave.kraftDias }, curta: `kraft ${f.d(n.kraftDias)}` },
      { id: 'atendimento', nome: 'Atendimento', icone: 'atendimento', leitura: { v: n.concentracao, texto: 'numa só conta', fmt: (v) => f.pct(v), chave: n.chave.concentracao }, curta: `${f.pct(n.concentracao)} numa conta` },
      { id: 'alcance', nome: 'Alcance', icone: 'alcance', leitura: { v: n.coletaParada, texto: 'sem coleta', fmt: (v) => f.d(v), chave: n.chave.coletaParada }, curta: `coleta parada ${f.d(n.coletaParada, 0)}` },
    ];
  };
  T.nucleos = montarNucleos();
  T.nucleo = (id) => T.nucleos.find((n) => n.id === id);

  const montarFios = () => {
    const n = T.numerosChave();
    const bot = achar(obj(L.passageiros).origem, (o) => /bot/i.test(String(o.evento || '')));
    const col = coletaDiaria();
    return [
      { de: 'controladores', para: 'pilotos', medido: true, v: n.dono, rotulo: 'com dono', p: 26 },
      { de: 'pilotos', para: 'central', medido: true, v: n.canal, rotulo: 'falaram com o bot', p: 26 },
      { de: 'central', para: 'passageiros', medido: true, v: bot ? bot.v : null, rotulo: 'cadastros pelo bot', p: 13 },
      { de: 'operacao', para: 'pilotos', medido: true, v: n.kit, rotulo: 'com kit', p: 26 },
      { de: 'passageiros', para: 'operacao', medido: false },
      { de: 'operacao', para: 'atendimento', medido: false },
      { de: 'atendimento', para: 'alcance', medido: false, quebrado: col.estado !== 'atualizado', rotulo: col.estado === 'atualizado' ? 'coleta rodou hoje' : col.c.ultima ? `sem sinal desde ${f.data(String(col.c.ultima).slice(0, 10))}` : 'sem sinal registrado' },
    ];
  };
  T.fios = montarFios();

  const montarAlertas = () => {
    const n = T.numerosChave();
    const P = obj(L.pilotos);
    const PS = obj(L.passageiros);
    const CT = obj(L.controladores);
    const C = obj(L.central);
    const O = obj(L.operacao);
    const A = obj(L.atendimento);
    const d7 = L.meta.d7;
    const diaD = L.meta.diaD;
    const fB = faseB();
    const ateD7 = T.diasEntre(T.dados.diaMedido(), d7);

    const l6 = obj(achar(C.numeros, (x) => x.numero === 'linha6'));
    const l6prod = obj(achar(P.whatsappProducao, (x) => x.numero === 'linha6'));
    const contasComAlerta = ['linha6', ...lista(C.numeros).filter((x) => x.alerta && x.numero !== 'linha6').map((x) => x.numero)];

    const col = coletaDiaria();
    const semErro = col.c.erro === 'nenhum' || col.c.erro === 0;
    const tituloColeta = col.estado === 'atualizado' ? 'A coleta de redes rodou hoje' : col.estado === 'sem-dados' ? 'A coleta de redes não tem execução registrada' : `A coleta de redes está parada há ${col.texto}${semErro ? ', sem nenhum erro' : ''}`;

    const sd = obj(CT.semDono);
    const triagem = achar(obj(CT.rodada).cobertura, (x) => /triagem/i.test(String(x.papel || '')));

    const nsc = P.semContatoComDono;
    const perdeMetade = num(n.dono) && n.dono > 0 && num(n.canal) && (n.dono - n.canal) / n.dono > 0.5;
    const centenas = num(nsc) && nsc >= 100 && nsc < 1000;

    const E = obj(O.estoque);
    const kraftDias = diasItem(RE_KRAFT);
    const manualDias = diasItem(RE_MANUAL);
    const acabam = [num(kraftDias) && kraftDias < ateD7 ? 'Caixa kraft' : null, num(manualDias) && manualDias < ateD7 ? 'Manual do Pessoa' : null].filter(Boolean);
    const fraseEstoque = [
      !num(E.zerados) ? null : E.zerados === 0 ? 'nenhum item está zerado' : `${extenso(E.zerados)} ${plural(E.zerados, 'item já está zerado', 'itens já estão zerados')}`,
      !num(E.abaixoDe5d) ? null : E.abaixoDe5d === 0 ? `nenhum dos ${f.n(E.itensMedidos)} fica abaixo de 5 dias` : `${extenso(E.abaixoDe5d)} dos ${f.n(E.itensMedidos)} ${plural(E.abaixoDe5d, 'não chega', 'não chegam')} a 5 dias`,
    ].filter(Boolean);
    const kitMeta = numeroEm(obj(metricaFaseA(/^kits entregues/i)).meta, /([\d.]+)/);

    const cen = leituraCenarios();
    const captura = f.pct(cen.pleno.captura, 'auto');

    const ag = obj(O.agenda);
    const semDiaD = ag.semanaDiaD;
    const aprovados = obj(achar(ag.pedidos, (p) => p.estado === 'aprovado')).v;
    const semanasComEvento = lista(ag.porSemana).filter((s) => s.futura && num(s.v) && s.v > 0 && s.semana).map((s) => String(s.semana)).sort();
    const ateDia = semanasComEvento.length ? T.isoSomar(semanasComEvento[semanasComEvento.length - 1], 6) : null;
    const fut = ag.futuros;
    const fraseAgenda = [
      !num(fut) ? null : fut === 0 ? 'não há eventos futuros no calendário' : `${fut === 1 ? 'o único evento futuro' : `os ${f.n(fut)} eventos futuros`}${ateDia ? ` ${plural(fut, 'vai', 'vão')} até ${f.data(ateDia)}` : ''}`,
      !num(aprovados) ? null : `os ${f.n(aprovados)} pedidos de agenda aprovados não viraram evento nenhum no calendário`,
    ].filter(Boolean);

    const top = lista(A.pessoas).reduce((m, p) => (p && num(p.pct) && (!m || p.pct > m.pct) ? p : m), null) || {};
    const treinar = numeroEm(textoPlano(/treinadas/i), /(\d+) pessoas/);

    const eCritica = (l) => /^cr[ií]tica$/i.test(String(l.urgencia || ''));
    const esperas = lista(A.esperandoAgora);
    const crit = achar(esperas, eCritica);
    const nCrit = crit && num(crit.esperando) ? crit.esperando : 0;
    const maisAntiga = !!crit && num(crit.maiorH) && esperas.every((l) => !num(l.maiorH) || l.maiorH <= crit.maiorH);
    const medCrit = obj(achar(A.urgencia, eCritica)).medianaH;
    const medBaixa = obj(achar(A.urgencia, (l) => /^baixa$/i.test(String(l.urgencia || '')))).medianaH;
    const invertida = num(medCrit) && num(medBaixa) && medCrit > medBaixa;
    const tituloCriticas = !Array.isArray(A.esperandoAgora) ? 'Conversas críticas esperando agora' : nCrit === 0 ? 'Nenhuma conversa crítica está esperando agora' : nCrit === 1 ? `A única conversa crítica espera há ${f.n(crit.mediaH)} ${plural(crit.mediaH, 'hora', 'horas')}` : `As ${f.n(nCrit)} conversas críticas esperam, em média, ${f.n(crit.mediaH)} horas`;
    const assuntoDestaque = achar(A.assuntos, (x) => x.destaque);
    const blocoDestaque = [A.assistencia, A.assistenciaViagem, A.destaque, A.saude].find((x) => x && num(x.urgentesPct));
    const fraseDestaque = assuntoDestaque && blocoDestaque ? ` ${assuntoDestaque.assunto} concentra ${f.pct(blocoDestaque.urgentesPct)} das urgentes.` : '';

    const cap = obj(C.capacidade);
    const elos = lista(cap.elos);
    const abaixo = elos.filter((e) => e.abaixo === true).length;
    const aguentam = elos.filter((e) => e.abaixo === false);
    const piso = lista(cap.cenarios)[0] || '—';
    const vezes = num(n.teto) && n.teto > 0 && num(n.exige) ? n.exige / n.teto : null;
    const fraseSurto = [
      vezes === null ? null : vezes > 1 ? `O melhor dia da base é ${f.n(vezes, 1)} vezes menor que o piso do cenário de ${piso}.` : `O melhor dia da base alcança o piso do cenário de ${piso}.`,
      aguentam.length === 1 && /convite/i.test(String(aguentam[0].elo || '')) ? 'Só o estoque de convites aguenta.' : elos.length && !aguentam.length ? 'Nenhum elo aguenta.' : null,
    ].filter(Boolean);
    const sim = achar(planoL(), (m) => m.simulado);
    const simTexto = sim ? String(lista(sim.oque)[0] || '') : '';
    const simJanela = sim ? (/\(([^)]+)\)/.exec(String(sim.diaSemana || '')) || [])[1] : null;
    const simPilotos = numeroEm(simTexto, /([\d.]+) (?:pilotos|pessoas)/);
    const simHora = (/(\d{1,2}h\d{2})/.exec(simTexto) || [])[1];
    const simDetalhe = [simPilotos ? `${f.n(simPilotos)} pessoas` : null, simHora].filter(Boolean).join(', ');
    const acaoSurto = sim ? `Simulado de surto${simJanela ? ` em ${simJanela}` : ''}${simDetalhe ? ` (${simDetalhe})` : ''} com os carimbos de tempo ligados antes. Nunca depois de ${f.data(sim.ate)}.` : 'Simulado de surto antes do D-7, com os carimbos de tempo ligados antes.';

    const ch = obj(C.chamados);
    const abertoDe = (re) => obj(achar(ch.tipos, (t) => t.estado === 'aberto' && re.test(String(t.tipo || '')))).abertosHoje;
    const demandas = abertoDe(/^demanda$/i);
    const deControlador = abertoDe(/^controlador$/i);

    const ped = obj(O.pedidos);
    const et = obj(O.etiquetas);
    const pctSemCarimbo = num(ped.arquivadosSemCarimbo) && num(ped.total) && ped.total > 0 ? (ped.arquivadosSemCarimbo / ped.total) * 100 : ped.arquivadosSemCarimboPct;
    const saidaEmBranco = obj(achar(ped.saida, (s) => /em branco/i.test(String(s.saida || '')))).v;
    const entre = lista(ped.entregasEntre);

    const er = obj(C.etapasResumo);
    const maiorBolso = num(er.naLista) && num(er.noMeio) && er.naLista > er.noMeio - er.naLista;

    const coortes = lista(P.coortes);
    const ult = obj([...coortes].reverse().find((c) => c && c.carga === true) || coortes[coortes.length - 1]);
    const semCarga = coortes.filter((c) => c && c.carga === false && num(c.ativaramPct)).map((c) => f.pct(c.ativaramPct));
    const pp = obj(P.prePilotos);
    const naFila = obj(achar(pp.estados, (e) => /fila/i.test(String(e.estado || '')))).v;

    const par = obj(PS.parados7mais);
    const rod = obj(CT.rodada);
    const rel = obj(PS.relogio);
    const umEmCada = num(rel.madrugadaPct) && rel.madrugadaPct > 0 ? Math.round(100 / rel.madrugadaPct) : null;
    const vespera = T.isoSomar(diaD, -1);

    const diasSemana = lista(A.medianaDiaSemana).filter((d) => num(d.h));
    const seg = achar(diasSemana, (d) => d.dia === 'seg');
    const segMaior = !!seg && diasSemana.every((d) => d.h <= seg.h);
    const madr = obj(A.horaClique).madrugada;
    const fraseMadr = madr === 0 ? 'ninguém dá baixa entre 0h e 8h' : num(madr) ? `${f.n(madr)} ${plural(madr, 'baixa', 'baixas')} entre 0h e 8h` : null;
    const provaEscala = provaDe(/escala publicada/i);

    const r20 = obj(achar(PS.familias, (x) => /^(R20|Rota 20)/i.test(String(x.familia || ''))));
    const r20cap = obj(achar(PS.times, (x) => x.time === 'R20_CAPITAL'));

    const vis = obj(O.visitas);
    const semanasVis = lista(vis.semanas).filter((s) => s && s.semana && num(s.engajouPct));
    let queda = null;
    for (let i = 1; i < semanasVis.length; i++) {
      const d = semanasVis[i - 1].engajouPct - semanasVis[i].engajouPct;
      if (!queda || d > queda.d) queda = { d, antes: semanasVis[i - 1], depois: semanasVis[i] };
    }
    const semAntes = queda ? queda.antes : {};
    const semDepois = queda ? queda.depois : {};
    const emBranco = obj(achar(vis.respostas, (r) => r.tipo === 'branco')).v;

    const tr = obj(O.torre);
    const acaoTorre = (id) => obj(achar(tr.topAcoes, (x) => x.acao === id)).v;

    return [
      { id: 'linha6', nivel: 'agir', area: 'central', titulo: `A linha com ${f.pct(l6prod.pct)} dos leads não consegue iniciar conversa`, metrica: { v: f.n(l6.passageiros), u: 'leads na linha6' }, impacto: `Concentra ${f.n(l6.ativas7d)} das ${f.n(C.conversasVivasSemana)} conversas vivas da semana. Toda reativação que dependa de o sistema mandar a primeira mensagem conta com um canal que não pode mandá-la.`, acao: `Conferir hoje, no painel do WhatsApp Business, o estado das contas ${juntar(contasComAlerta)} e regularizar o pagamento — tarefa de horas, não de semanas.`, nota: l6.alerta ? `${inicial(String(l6.alerta))}.` : null, p: [30, 33], rota: 'central', alvo: 'numeros' },
      { id: 'coleta', nivel: nivelPela('agir', statusRegua(obj(L.alcance).regua, /^coleta diária/i)), area: 'alcance', titulo: tituloColeta, metrica: { v: f.n(col.c.paradaDias, 1), u: 'dias sem alcance medido' }, impacto: 'Entramos nas semanas em que o gestor espera 80% das adesões sem saber se uma peça alcançou 90 mil ou 1,5 milhão de pessoas.', acao: `Religar a rotina diária e alarmar quando ela parar. ${provaDe(/seguidores/i)}`.trim(), p: [47, 51, 54], rota: 'alcance', alvo: 'sensor' },
      { id: 'sem-dono', nivel: nivelPela('agir', statusRegua(CT.regua, /sem dono/i)), area: 'controladores', titulo: sd.total === 0 ? 'Nenhuma pessoa está sem dono de verdade' : `${f.n(sd.total)} pessoas não têm dono de verdade — e ninguém os cobra`, metrica: { v: f.n(sd.total), u: `pessoas · ${f.n(sd.meta)} de meta` }, impacto: `${f.n(sd.orfaos)} ${plural(sd.orfaos, 'órfão', 'órfãos')} e ${f.n(sd.triagem)} numa única conta de triagem da Rota 20${triagem ? `, que respondeu ${f.n(triagem.resp)} ${plural(triagem.resp, 'linha', 'linhas')} de ${f.n(triagem.pilotos)} na rodada` : ''}. Carregam ${f.pct(sd.pctProjetada)} da Projetada.`, acao: `Redistribuir órfãos e fila de triagem entre admins. ${provaDe(/sem-dono/i)}`.trim(), p: [27, 54], rota: 'controladores', alvo: 'rede' },
      { id: 'sem-contato', nivel: nivelPela('agir', statusRegua(CT.regua, /nunca falaram/i)), area: 'pilotos', titulo: `${f.n(nsc)} pessoas com dono nunca falaram com o bot`, metrica: { v: f.n(nsc), u: 'com admin, sem conversa' }, impacto: `${perdeMetade ? 'É onde o funil perde mais da metade: entre "tem dono" e "falou com o bot". ' : ''}A base nunca foi acesa.`, acao: `Fazer o primeiro contato, que nunca houve — a fila da pré-temporada tem nome e tamanho${centenas ? ': são centenas, não milhares' : ''}.`, p: [5, 12, 26], rota: 'pilotos', alvo: 'funil' },
      { id: 'estoque', nivel: nivelPela('agir', statusRegua(O.regua, /dias de estoque/i)), area: 'operacao', titulo: acabam.length ? `${acabam.join(' e ')} ${plural(acabam.length, 'acaba', 'acabam')} antes de ${f.data(d7)}` : 'Caixa kraft e Manual do Pessoa: dias de estoque', metrica: { v: `${f.n(kraftDias, 1)} e ${f.n(manualDias, 1)}`, u: 'dias de estoque' }, impacto: `${fraseEstoque.length ? `${inicial(fraseEstoque.join(' e '))}. ` : ''}Sem caixa e sem manual não há kit na mão de ${kitMeta ? `${f.n(kitMeta)} pessoas` : 'quem precisa'}.`, acao: `Comprar caixa kraft e reimprimir o Manual do Pessoa esta semana. ${provaDe(/ordem de compra/i)}`.trim(), p: [37, 43, 54], rota: 'operacao', alvo: 'estoque' },
      { id: 'meta', nivel: 'agir', area: 'passageiros', titulo: cen.cabe === false ? `A meta de ${f.n(cen.meta)} não cabe na conta da própria equipe` : cen.cabe ? `A meta de ${f.n(cen.meta)} cabe na conta da própria equipe` : `A meta de ${f.n(cen.meta)} e a conta da própria equipe`, metrica: { v: f.n(cen.pleno.emDiaD), u: `teto da conta, com captura de ${captura}` }, impacto: `${cen.alcancam.length ? `${plural(cen.alcancam.length, 'O cenário', 'Os cenários')} ${juntar(cen.alcancam)} ${plural(cen.alcancam.length, 'alcança', 'alcançam')} a meta` : 'Nenhum cenário alcança a meta'}${cen.cabe === false ? `: para chegar lá a captura teria de passar de ${captura}. Não depende de esforço.` : '.'}`, acao: `Escolher antes de ${f.data(d7)} qual número vira a promessa pública; depois não há tempo de corrigir a expectativa.`, p: [15, 21], rota: 'passageiros', alvo: 'cenarios' },
      { id: 'agenda', nivel: nivelPela('agir', statusRegua(O.regua, /semana do dia d/i)), area: 'operacao', titulo: !num(semDiaD) ? 'A agenda da semana do Dia D' : semDiaD === 0 ? 'A agenda da semana do Dia D está vazia' : `A agenda da semana do Dia D tem ${f.n(semDiaD)} ${plural(semDiaD, 'evento', 'eventos')}`, metrica: { v: f.n(semDiaD), u: `eventos de ${f.data(fB.inicio)} a ${f.data(diaD)}` }, impacto: fraseAgenda.length ? `${inicial(fraseAgenda.join(', e '))}.` : '', acao: 'Localizar onde está a agenda da pré-temporada — ou fazê-la. As duas respostas exigem ação hoje.', p: [42, 43], rota: 'operacao', alvo: 'agenda' },
      { id: 'baixas', nivel: nivelPela('agir', statusRegua(A.regua, /concentração das baixas/i)), area: 'atendimento', titulo: `Uma pessoa dá ${f.pct(top.pct)} das baixas`, metrica: { v: f.pct(top.pct), u: `${f.n(top.v)} de ${f.n(A.baixas30d)} em 30 dias` }, impacto: `Só ${f.n(A.contasQueDeramBaixa)} das ${f.n(A.contasTorre)} contas do OPS Intelligence já usaram o botão. Não é elogio nem crítica: é ponto único de falha — uma semana de ausência e a fila fica sem dono.`, acao: `Treinar ${treinar ? `${f.n(treinar)} pessoas` : 'mais gente'} no botão de baixa. ${provaDe(/nomes distintos/i)}`.trim(), p: [45, 51, 54], rota: 'atendimento', alvo: 'concentracao' },
      { id: 'criticas', nivel: nivelPela('agir', statusRegua(A.regua, /críticas esperando/i)), area: 'atendimento', titulo: tituloCriticas, metrica: { v: nCrit ? f.h(crit.maiorH, 0) : '—', u: maisAntiga ? 'a espera mais antiga da fila' : 'a espera crítica mais antiga' }, impacto: `${invertida ? 'A etiqueta está invertida na prática: a' : 'A'} crítica tem mediana de ${f.h(medCrit)} até a baixa; a baixa, ${f.h(medBaixa)}.${fraseDestaque}`, acao: 'Começar o dia pelas críticas, que são poucas e as mais antigas.', p: [46, 51], rota: 'atendimento', alvo: 'fila' },
      { id: 'surto', nivel: 'agir', area: 'central', titulo: `A Central nunca operou sob surto: ${abaixo ? `${f.n(abaixo)} de ${f.n(elos.length)} elos ${plural(abaixo, 'fica', 'ficam')}` : `nenhum dos ${f.n(elos.length)} elos fica`} abaixo do menor cenário`, metrica: { v: `${f.n(n.teto)} × ${f.n(n.exige)}`, u: `melhor dia × exigência diária para ${piso}` }, impacto: fraseSurto.join(' '), acao: acaoSurto, p: [32, 33, 54], rota: 'central', alvo: 'capacidade' },
      { id: 'chamados', nivel: nivelPela('agir', statusRegua(C.reguaFaseB, /chamados abertos/i)), area: 'central', titulo: `${f.n(ch.paradosMais48h)} dos ${f.n(ch.abertosAgora)} chamados abertos ${plural(ch.paradosMais48h, 'passou', 'passaram')} de 48 horas`, metrica: { v: f.n(ch.semDonoAutomatico), u: 'chamados sem fluxo automático' }, impacto: `O que está aberto — ${f.n(demandas)} ${plural(demandas, 'demanda', 'demandas')} e ${f.n(deControlador)} ${plural(deControlador, 'pedido', 'pedidos')} de admin — é justamente o que não tem dono automático.`, acao: `Dar dono aos ${f.n(ch.semDonoAutomatico)} chamados abertos de demanda e de admin.`, p: [31, 33], rota: 'central', alvo: 'chamados' },
      { id: 'carimbo', nivel: nivelPela('agir', statusRegua(O.regua, /sem carimbo/i)), area: 'operacao', titulo: 'A operação não consegue provar que entregou', metrica: { v: f.pct(pctSemCarimbo), u: 'pedidos arquivados sem carimbo' }, impacto: `${f.n(ped.arquivadosSemCarimbo)} de ${f.n(ped.total)} pedidos arquivados sem data de entrega, ${f.n(saidaEmBranco)} sem saída preenchida e ${f.n(et.conferidas)} ${plural(et.conferidas, 'kit conferido', 'kits conferidos')} em ${f.n(et.total)} etiquetas. As entregas estão entre ${f.n(entre[0])} e ${f.n(entre[1])}.`, acao: 'Arquivar só depois de "entregue" e tornar a saída obrigatória — fecha as duas lacunas de uma vez.', p: [35, 38, 43, 55], rota: 'operacao', alvo: 'esteira' },
      { id: 'lista', nivel: 'atencao', area: 'central', titulo: `${f.n(er.naLista)} conversas travaram na montagem da lista de convidados`, metrica: { v: f.n(er.naLista), u: `de ${f.n(er.comEtapa)} conversas com etapa` }, impacto: `${maiorBolso ? 'É o maior bolso de conversas travadas do bot — mais que todas as outras etapas juntas. ' : ''}Problema de roteiro, não de infraestrutura.`, acao: 'Encurtar a etapa da lista de convidados.', p: [30, 33], rota: 'central', alvo: 'etapas' },
      { id: 'lote', nivel: 'atencao', area: 'pilotos', titulo: 'Converter a fila em lote não produz lead', metrica: { v: f.pct(ult.ativaramPct), u: `da safra de ${f.data(ult.semana)} ativou` }, impacto: `A coorte de ${f.data(ult.semana)} tem ${f.n(ult.pilotos)} pessoas e rende ${f.n(ult.porFicha, 1)} ${num(ult.porFicha) && ult.porFicha >= 2 ? 'leads' : 'lead'} por ficha${semCarga.length ? `; ${plural(semCarga.length, 'a semana sem carga ativou', 'as semanas sem carga ativaram')} ${juntar(semCarga)}` : ''}.`, acao: `Tratar as ${f.n(naFila)} fichas na fila como lista de ligações (cerca de ${f.n(pp.contatosPorControlador)} por admin até ${f.data(diaD)}), não como base a converter.`, p: [9, 11, 12], rota: 'pilotos', alvo: 'cargas' },
      { id: 'parados', nivel: 'atencao', area: 'passageiros', titulo: `${f.n(par.v)} produtores estão parados há 7 dias ou mais`, metrica: { v: f.n(par.devem), u: 'leads de meta que eles devem' }, impacto: 'Já provaram que sabem usar o bot. Custam uma mensagem.', acao: 'Chamar primeiro quem já produziu e parou — antes de abrir qualquer ficha nova.', p: [19, 21, 52], rota: 'passageiros', alvo: 'parados' },
      { id: 'rodada', nivel: 'atencao', area: 'controladores', titulo: `A rodada de expectativa não tem prazo e ${f.n(rod.semCarimbo)} linhas ficaram sem resposta`, metrica: { v: f.pct(rod.zeroPct), u: 'das respostas vieram com zero' }, impacto: 'A Real diz um tamanho, não um prazo — e é com prazo que se decide logística de véspera.', acao: `Refazer a rodada com a pergunta "quanto entre ${f.data(fB.inicio)} e ${f.data(diaD)}". ${provaDe(/(?:controladores|admins) lançaram/i)}`.trim(), p: [25, 27, 54], rota: 'controladores', alvo: 'rodada' },
      { id: 'segunda', nivel: 'atencao', area: 'atendimento', titulo: segMaior ? `Segunda-feira paga o fim de semana${fraseMadr ? ` — e ${fraseMadr}` : ''}` : fraseMadr ? inicial(fraseMadr) : 'Espera até a baixa por dia da semana', metrica: { v: f.h(obj(seg).h), u: 'mediana de espera na segunda' }, impacto: [segMaior ? 'O que chega no sábado e no domingo espera a segunda.' : null, madr === 0 ? 'O sistema está no ar 24 horas; o atendimento não.' : null].filter(Boolean).join(' '), acao: `Turno curto de sábado ou domingo e escala de plantão 22h–8h${provaEscala ? ` (${minuscula(provaEscala.replace(/\.$/, ''))})` : ''}.`, p: [45, 51, 54], rota: 'atendimento', alvo: 'semana' },
      { id: 'madrugada', nivel: 'atencao', area: 'passageiros', titulo: umEmCada && !aoVivo() ? `Uma em cada ${extenso(umEmCada)} indicações entra entre 22h e 8h, sem plantão` : `${f.pct(rel.madrugadaPct)} das indicações entram entre 22h e 8h, sem plantão`, metrica: { v: f.pct(rel.madrugadaPct), u: 'dos cadastros de 30 dias' }, impacto: 'Se o bot falhar às 22h numa sexta, ninguém vê antes da manhã seguinte.', acao: `Plantão 22h–8h e cobertura do fim de semana ${vespera.slice(8, 10)}–${f.data(diaD)}.`, p: [16, 54], rota: 'passageiros', alvo: 'relogio' },
      { id: 'r20', nivel: 'atencao', area: 'passageiros', titulo: `A lista da Rota 20 tem ${f.n(r20.pilotos)} pessoas e produziu ${f.n(r20.passageiros)} ${plural(r20.passageiros, 'registro', 'registros')}`, metrica: { v: f.n(r20.passageiros), u: `leads de ${f.n(r20.pilotos)} fichas` }, impacto: 'Contar a Rota 20 como rede disponível infla o denominador de tudo — da Projetada à taxa de ativação.', acao: `Disparo-teste nos ${f.n(r20cap.pilotos)} do R20_CAPITAL. ${provaDe(/R20_CAPITAL respondem/)}`.trim(), p: [18, 21, 54], rota: 'passageiros', alvo: 'times' },
      { id: 'visitas', nivel: 'atencao', area: 'operacao', titulo: 'As visitas mantiveram o volume e perderam o engajamento', metrica: { v: `${f.pct(semAntes.engajouPct)} → ${f.pct(semDepois.engajouPct)}`, u: queda ? `semana de ${f.data(semAntes.semana)} → ${f.data(semDepois.semana)}` : 'engajamento por semana' }, impacto: `Em ${f.n(emBranco)} das ${f.n(vis.total)} visitas a pergunta ficou em branco: a queda pode ser recusa real ou campo não preenchido.`, acao: queda ? `Descobrir o que mudou na semana de ${f.data(semDepois.semana)} — roteiro, agente ou bairro — com quem estava na rua.` : 'Descobrir com quem estava na rua o que mudou nas visitas.', p: [40, 43], rota: 'operacao', alvo: 'visitas' },
      { id: 'login', nivel: 'atencao', area: 'operacao', titulo: `${f.pct(tr.loginFalhaPct)} das tentativas de login no OPS Intelligence falham`, metrica: { v: f.n(acaoTorre('auth.login_failed')), u: `falhas contra ${f.n(acaoTorre('auth.login_success'))} acessos` }, impacto: 'Senha esquecida ou conta bloqueada viram suporte no surto, quando ninguém tem tempo de pedir.', acao: `Olhar os logins que falham antes de ${f.data(fB.inicio)}.`, p: [41], rota: 'operacao', alvo: 'torre' },
    ];
  };
  T.alertas = montarAlertas();
  T.alertasDe = (area) => T.alertas.filter((a) => a.area === area);

  const montarExplicacoes = () => {
    const tn = L.tresNumeros;
    const n = T.numerosChave();
    const P = obj(L.pilotos);
    const PS = obj(L.passageiros);
    const CT = obj(L.controladores);
    const funil = (id) => L.pilotos.funil.find((d) => d.id === id) || { v: null, pct: null };
    const degrau = (id) => `${f.n(funil(id).v)} · ${f.pct(funil(id).pct)}`;
    const coleta = coletaDiaria();
    const historico = obj(lista(obj(L.alcance).coleta)[1]);
    const d7 = L.meta.d7;
    const dias = obj(L.meta.periodo).dias;
    const rod = obj(CT.rodada);
    const sd = obj(CT.semDono);
    const cen = leituraCenarios();
    const prontos = obj(metricaFaseA(/^(?:pilotos|pessoas) pront[oa]s/i));
    const kitMeta = numeroEm(obj(metricaFaseA(/^kits entregues/i)).meta, /([\d.]+)/);
    const confKit = achar(L.conferencias, (c) => c.id === 'pilotos-com-kit');
    const et = obj(obj(L.operacao).etiquetas);
    const faixas = lista(PS.faixasProducao);
    const zero = achar(faixas, (x) => String(x.faixa) === '0');
    const topo = faixas[faixas.length - 1];
    const somaFaixas = faixas.reduce((s, x) => s + (num(x.passageiros) ? x.passageiros : 0), 0);
    const pctTopo = topo && somaFaixas ? (topo.passageiros / somaFaixas) * 100 : null;
    const rec = obj(PS.recordePilotosDia);
    const par = obj(PS.parados7mais);
    const r20cap = obj(achar(PS.times, (x) => x.time === 'R20_CAPITAL'));
    const origem = lista(PS.origem);
    const bot = obj(achar(origem, (o) => /bot/i.test(String(o.evento || ''))));
    const manual = obj(achar(origem, (o) => /mão|manual|painel/i.test(String(o.evento || ''))));
    const pctBot = num(PS.pelotBotPct) ? PS.pelotBotPct : num(bot.v) && num(manual.v) ? (bot.v / (bot.v + manual.v)) * 100 : null;
    const maiorPerda = L.pilotos.funil.slice(1).reduce((m, d, i) => {
      const perda = L.pilotos.funil[i].v - d.v;
      return !m || perda > m.perda ? { id: d.id, perda } : m;
    }, null);
    const elos = lista(obj(obj(L.central).capacidade).elos);
    const abaixo = elos.filter((e) => e.abaixo === true).length;
    const piso = lista(obj(obj(L.central).capacidade).cenarios)[0] || '—';
    const vezes = num(n.teto) && n.teto > 0 && num(n.exige) ? n.exige / n.teto : null;
    const capturas = lista(obj(PS.cenarios).linhas).filter((l) => !l.limite && num(l.captura)).map((l) => f.pct(l.captura, 0));
    const premissa = obj(L.premissa2080);
    let faixaRitmo = null;
    try {
      const serie = T.dados.serie('passageiros_dia').filter((p) => !p.parcial);
      const pico = serie.reduce((m, p) => (!m || p.v > m.v ? p : m), null);
      const mm = T.dados.mm7().filter((p) => pico && p.d >= pico.d);
      if (pico && mm.length) faixaRitmo = { desde: pico.d, min: Math.floor(Math.min(...mm.map((p) => p.v)) / 10) * 10, max: Math.ceil(Math.max(...mm.map((p) => p.v)) / 10) * 10 };
    } catch (e) {
      faixaRitmo = null;
    }
    return {
      projetada: { onde: 'Os três números', titulo: 'Projetada', valor: f.n(tn.projetada.v), chave: n.chave.projetada, oque: tn.projetada.def, porque: 'É o maior número do painel e o mais fácil de confundir com previsão.', mostra: `${tn.projetada.leitura} Tirando órfãos, fila de triagem e fichas sem lead, sobram ${f.n(tn.tetoHonesto)} com dono e algum sinal; ${f.n(tn.soFicha)} são só ficha.`, naoE: tn.projetada.naoE, p: [3, 26], rota: 'controladores', alvo: 'tres-numeros' },
      real: { onde: 'Os três números', titulo: 'Real lançada', valor: f.n(tn.real.v), chave: n.chave.real, oque: tn.real.def, porque: 'Mede o que quem convive com as pessoas acredita que eles trazem — a melhor base para planejar logística.', mostra: `${tn.real.leitura} ${tn.real.detalhe}${num(rod.responderamZero) && num(rod.linhasQueFormamReal) ? `; ${f.n(rod.responderamZero)} das respondidas vieram com zero e a Real inteira sai de ${f.n(rod.linhasQueFormamReal)} linhas` : ''}.`, naoE: tn.real.naoE, p: [3, 25, 26], rota: 'controladores', alvo: 'rodada' },
      contabilizados: { onde: 'Os três números', titulo: 'Contabilizados', valor: f.n(tn.contabilizados.v), chave: n.chave.contabilizados, oque: tn.contabilizados.def, porque: 'É o único dos três que é fato registrado.', mostra: `${tn.contabilizados.leitura}${num(pctBot) ? ` ${f.pct(pctBot)} entrou pelo bot.` : ''}`, naoE: tn.contabilizados.naoE, p: [3, 13, 20], rota: 'passageiros', alvo: 'ritmo' },
      meta: { onde: 'Referência', titulo: 'Meta declarada', valor: f.n(tn.metaDeclarada.v), chave: n.chave.meta, oque: `${tn.metaDeclarada.conta}, declarada na ${tn.metaDeclarada.origem}.`, porque: 'É o número contra o qual o clube vai ser cobrado.', mostra: `O registrado é ${f.pct(tn.registradoSobreMetaPct)} da meta. Com o 20/80 cumprido integralmente, a conta da equipe chega a ${f.n(cen.pleno.emDiaD)} — ${cen.cabe ? 'a meta cabe nela' : 'a meta não cabe nela'}.`, p: [15, 26], rota: 'passageiros', alvo: 'cenarios' },
      'funil-ativos': { onde: 'Funil de prontidão', titulo: 'Pessoas ativas', valor: f.n(n.ativos), chave: n.chave.ativos, oque: 'Fichas de pessoa ativas no sistema. A pessoa indica pessoas pelo WhatsApp e não tem login.', porque: 'É a base que existe — a largura da torre.', mostra: `Em ${f.n(dias)} dias o sistema registrou ${f.n(P.totalFichas)} fichas; ${f.n(P.fichasDeCarga)} (${f.pct(P.fichasDeCargaPct)}) nasceram em ${extenso(lista(P.diasDeCarga).length)} ${plural(lista(P.diasDeCarga).length, 'dia', 'dias')} de carga em massa.`, p: [5, 6], rota: 'pilotos', alvo: 'funil' },
      'funil-dono': { onde: 'Funil de prontidão', titulo: 'Com dono de verdade', valor: degrau('dono'), chave: n.chave.dono, oque: `Pessoas com um admin que responde por eles — sem os ${f.n(sd.orfaos)} órfãos e sem os ${f.n(sd.triagem)} da fila de triagem.`, porque: 'Pessoa sem dono não é cobrado por ninguém.', mostra: `${f.n(sd.total)} pessoas não têm dono real e carregam ${f.n(sd.meta)} de meta projetada.`, p: [5, 26, 27], rota: 'controladores', alvo: 'rede' },
      'funil-canal': { onde: 'Funil de prontidão', titulo: 'Já trocaram mensagem com o bot', valor: degrau('canal'), chave: n.chave.canal, oque: 'Pessoas com sessão aberta no bot da Central — o canal por onde o cadastro acontece.', porque: 'Sem canal aberto, a pessoa não recebe comando nem cadastra.', mostra: `${maiorPerda && maiorPerda.id === 'canal' ? 'É o maior degrau de perda: ' : ''}${f.n(n.nuncaFalaram)} pessoas têm admin e nunca trocaram mensagem com o sistema.`, p: [5, 26], rota: 'central', alvo: 'fluxo' },
      'funil-produziu': { onde: 'Funil de prontidão', titulo: 'Já cadastraram ao menos 1 lead', valor: degrau('produziu'), chave: n.chave.produziu, oque: 'Pessoas que já gravaram pelo menos uma indicação.', porque: 'Quem cadastra no primeiro dia quase sempre é quem produz depois.', mostra: [zero ? `${f.n(zero.pilotos)} das ${f.n(n.ativos)} pessoas ativas nunca cadastraram ninguém` : null, topo && num(pctTopo) ? `os ${f.n(topo.pilotos)} do topo fizeram ${f.pct(pctTopo, 0)} de tudo` : null].filter(Boolean).join('; ').replace(/^./, (c) => c.toUpperCase()).concat('.'), p: [5, 19], rota: 'passageiros', alvo: 'quem-produz' },
      'funil-vivo': { onde: 'Funil de prontidão', titulo: 'Cadastraram alguém na última semana', valor: degrau('vivo'), chave: n.chave.vivos, oque: 'A base operacional: pessoas vivas nos últimos 7 dias. É o número "pessoas prontas" da Fase A.', porque: `A meta da Fase A é ter ${String(prontos.meta || '').replace('–', ' a ')} deles em ${f.data(d7)}.`, mostra: `Carregam ${f.n(funil('vivo').meta)} de meta. O recorde de pessoas cadastrando no mesmo dia é ${f.n(rec.v)} (${f.data(rec.dia)}).`, p: [5, 26, 53], rota: 'pilotos', alvo: 'funil' },
      'funil-kit': { onde: 'Funil de prontidão', titulo: 'Com a tag de kit recebido', valor: degrau('kit'), chave: n.chave.kit, oque: 'Pessoas com a tag KitRecebido — decisão do dono; a tag não tem data.', porque: `A Fase A pede kit na mão de ${kitMeta ? `${f.n(kitMeta)} ou mais` : 'centenas de'} pessoas, conferido.`, mostra: `${confKit ? `${confKit.achado} ` : ''}Só ${f.n(et.conferidas)} ${plural(et.conferidas, 'etiqueta', 'etiquetas')} em ${f.n(et.total)} ${plural(et.conferidas, 'foi conferida', 'foram conferidas')} no recebimento.`, p: [5, 38, 52, 55], rota: 'operacao', alvo: 'esteira' },
      alvo: { onde: 'Meta da Fase A', titulo: `Pessoas prontas em ${f.data(d7)}`, valor: prontos.meta || '—', oque: 'Pessoas que atravessam o funil inteiro: dono real → canal aberto → já produziu → vivo na semana.', porque: `Pelo padrão 20/80 do gestor, o que decide a temporada é se essa base existe em ${f.data(d7)}, com material na mão e canal aberto.`, mostra: `Hoje são ${f.n(n.vivos)}. O único caminho medido é ativar quem já está lá — os ${f.n(par.v)} que produziram e pararam, os ${f.n(r20cap.pilotos)} do R20_CAPITAL — não criar mais fichas.`, p: [1, 52, 53], rota: 'plano', alvo: 'fase-a' },
      ritmo: { onde: 'Leads', titulo: 'Ritmo de cadastro', valor: `${f.n(n.ritmo)}/dia`, chave: n.chave.ritmo, oque: 'Média dos 7 dias completos de leads registrados.', porque: 'É o piso do que a operação atual entrega sozinha.', mostra: `${faixaRitmo ? `Desde ${f.data(faixaRitmo.desde)} a média móvel anda entre ${f.n(faixaRitmo.min)} e ${f.n(faixaRitmo.max)} por dia e não sobe. ` : ''}Qualquer número maior é intervenção, não tendência.`, p: [13, 14], rota: 'passageiros', alvo: 'ritmo' },
      teto: { onde: 'Central', titulo: 'Teto provado × exigência', valor: `${f.n(n.teto)} × ${f.n(n.exige)}`, chave: n.chave.teto, oque: `O maior dia de leads já registrado contra o que a última semana pede por dia para ${piso} adesões (resultado × 0,8 ÷ 7).`, porque: 'Máximo histórico não é capacidade sustentada: foi um dia, não uma rotina.', mostra: `${num(vezes) ? `O melhor dia é ${f.n(vezes, 1)} vezes menor que o piso do cenário de ${piso}. ` : ''}${inicial(extenso(abaixo))} dos ${extenso(elos.length)} elos ${plural(abaixo, 'fica', 'ficam')} abaixo da exigência do menor cenário.`, p: [32], rota: 'central', alvo: 'capacidade' },
      captura: { onde: 'Ponto cego', titulo: 'Captura', valor: 'não medida', naoMedido: true, oque: 'Fração do que acontece no mundo que vira registro no sistema — e, com isso, recebe convite e lembrete.', porque: `Os cenários dependem dela: ${juntar(capturas)} são premissas da equipe.`, mostra: 'Nunca foi medida: o sistema nunca operou sob surto e falta um denominador de fora (convites entregues × cadastros, ou os admins dizendo quantas indicações ficaram sem registro).', p: [3, 4, 54, 55], rota: 'plano', alvo: 'guardar' },
      premissa: { onde: 'Premissa do gestor', titulo: 'O padrão 20/80', valor: num(premissa.diaVale) ? `1 dia = ${f.nFlex(premissa.diaVale, 1)} dias` : '20/80', oque: 'Observação do gestor em temporadas anteriores: 20% do resultado acontece até uma semana antes e 80% na última semana.', porque: `Reorganiza a leitura: os números de hoje medem prontidão, não resultado.${premissa.horaDeAtraso ? ` ${premissa.horaDeAtraso}` : ''}`, mostra: `Não foi testada pelos dados do livro (${f.n(dias)} dias de histórico, sem temporadas anteriores). Os cenários são contas com premissas, não intervalos estatísticos.`, p: [3], rota: 'plano', alvo: 'pista' },
      coleta: { onde: 'Alcance', titulo: 'Coleta diária de redes', valor: coleta.estado === 'sem-dados' ? 'SEM DADOS' : `${PALAVRA_COLETA[coleta.estado]} · ${f.d(n.coletaParada)}`, chave: n.chave.coletaParada, oque: 'Rotina que busca seguidores, alcance e comentários nas redes todo dia.', porque: 'Sem ela o clube não sabe quantas pessoas viram uma peça na pré-temporada.', mostra: `Rodou ${f.n(coleta.c.execucoes)} vezes e parou em ${f.data(String(coleta.c.ultima || '').slice(0, 10))} sem registrar um único erro.${num(historico.paradaDias) ? ` As rotinas de histórico estão paradas há ${f.n(Math.floor(historico.paradaDias))} dias.` : ''}`, p: [47, 51], rota: 'alcance', alvo: 'sensor' },
    };
  };
  T.explicacoes = montarExplicacoes();

  const montarRoteiro = () => {
    const n = T.numerosChave();
    const P = obj(L.pilotos);
    const A = obj(L.atendimento);
    const d7 = L.meta.d7;
    const fase = lista(obj(L.fechamento).metricasFaseA);
    const cont = T.dados.contagemRegua(fase);
    const prontos = achar(fase, (l) => /(?:pilotos|pessoas) pront[oa]s/i.test(String(l.metrica || '')));
    const coortes = lista(P.coortes);
    const ult = obj([...coortes].reverse().find((c) => c && c.carga === true) || coortes[coortes.length - 1]);
    const diasCarga = lista(P.diasDeCarga).length;
    const cen = leituraCenarios();
    const top10 = obj(obj(L.controladores).top10Soma);
    const semDono = obj(obj(L.controladores).semDono).total;
    const elos = lista(obj(obj(L.central).capacidade).elos);
    const abaixo = elos.filter((e) => e.abaixo === true).length;
    const kraftDias = diasItem(RE_KRAFT);
    const esperas = lista(A.esperandoAgora);
    const crit = achar(esperas, (l) => /^cr[ií]tica$/i.test(String(l.urgencia || '')));
    const criticasMaisEsperam = !!crit && num(crit.mediaH) && esperas.every((l) => !num(l.mediaH) || l.mediaH <= crit.mediaH);
    const top = lista(A.pessoas).reduce((m, p) => (p && num(p.pct) && (!m || p.pct > m.pct) ? p : m), null) || {};
    const col = coletaDiaria();
    return [
      { rota: 'pilotos', alvo: 'funil', legenda: `Base criada não é base produtiva: ${f.n(P.semContatoComDono)} pessoas têm dono e nunca falaram com o bot.` },
      { rota: 'pilotos', alvo: 'cargas', legenda: `${f.pct(P.fichasDeCargaPct)} das fichas nasceram em ${extenso(diasCarga)} ${plural(diasCarga, 'dia', 'dias')} de carga — e a safra de ${f.data(ult.semana)} ativou ${f.pct(ult.ativaramPct)}.` },
      { rota: 'passageiros', alvo: 'cenarios', legenda: `${cen.alcancam.length ? `${plural(cen.alcancam.length, 'O cenário', 'Os cenários')} ${juntar(cen.alcancam)} ${plural(cen.alcancam.length, 'chega', 'chegam')} a` : 'Nenhum cenário da própria equipe chega a'} ${f.n(cen.meta)}. O teto da conta é ${f.n(cen.pleno.emDiaD)}.` },
      { rota: 'controladores', alvo: 'rede', legenda: inicial(`${num(top10.pct) ? `Dez pessoas fazem ${f.pct(top10.pct, 0)} da rede; ` : ''}${semDono === 0 ? 'nenhuma pessoa está sem dono de verdade' : `${f.n(semDono)} pessoas não têm dono de verdade`}.`) },
      { rota: 'central', alvo: 'capacidade', legenda: `Capacidade provada × exigida: ${abaixo ? `${extenso(abaixo)} de ${extenso(elos.length)} elos ${plural(abaixo, 'fica', 'ficam')}` : `nenhum dos ${extenso(elos.length)} elos fica`} abaixo do menor cenário.` },
      { rota: 'central', alvo: 'fluxo', legenda: 'O gargalo não é o software: é gente para atender e a linha6.' },
      { rota: 'operacao', alvo: 'esteira', legenda: `A operação corre mais rápido do que consegue provar${num(kraftDias) && kraftDias < T.diasEntre(T.dados.diaMedido(), d7) ? ` — e o estoque de kraft acaba antes de ${f.data(d7)}` : ''}.` },
      { rota: 'atendimento', alvo: 'fila', legenda: `Fila viva: ${criticasMaisEsperam ? 'as críticas são as que mais esperam, e ' : ''}uma pessoa dá ${f.pct(top.pct)} das baixas.` },
      { rota: 'alcance', alvo: 'sensor', legenda: col.estado === 'atualizado' ? 'O instrumento de alcance: a coleta diária rodou hoje.' : col.estado === 'sem-dados' ? 'O instrumento de alcance: nenhuma execução registrada.' : `O instrumento que parou: ${col.texto} sem medir alcance.` },
      { rota: 'plano', alvo: 'pista', legenda: `Caminho para o Dia D: ${extenso(n.marcos)} ${plural(n.marcos, 'marco', 'marcos')} até ${f.data(d7)}, cada um com a prova de que ficou pronto.` },
      { rota: 'decisao', alvo: 'lista', legenda: 'O que decidir nesta semana — cada item com a ação que o próprio livro manda fazer.' },
    ];
  };
  T.roteiro = montarRoteiro();

  T.on('dados', () => {
    registrarNomes();
    T.nucleos = montarNucleos();
    T.explicacoes = montarExplicacoes();
    repor(T.fios, montarFios());
    repor(T.alertas, montarAlertas());
    repor(T.roteiro, montarRoteiro());
  });
})();
