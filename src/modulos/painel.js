/* Painel executivo: a primeira tela do produto. KPIs com tendência, gráfico principal, funil,
   projeção por cenário, relógio de cadastros, decisões e saúde das fontes — tudo respeitando o
   período escolhido na barra de filtros. */
(function () {
  'use strict';
  const T = window.T;
  const G = T.graf;
  const f = T.fmt;
  const L = T.dados.livro;

  const media = (arr) => (arr.length ? T.soma(arr) / arr.length : 0);
  const completos = (s) => s.filter((p) => !p.parcial);

  function sparkline(pontos, cor) {
    const w = 120;
    const h = 36;
    const vs = pontos.map((p) => p.v);
    const max = Math.max(...vs, 1);
    const min = Math.min(...vs, 0);
    const x = (i) => (i / Math.max(1, vs.length - 1)) * w;
    const y = (v) => h - 3 - ((v - min) / (max - min || 1)) * (h - 6);
    const d = vs.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    const id = T.uid('sp');
    return T.s(
      'svg',
      { class: 'kpi-spark', viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' },
      T.s('defs', null, T.s('linearGradient', { id, x1: 0, x2: 0, y1: 0, y2: 1 }, T.s('stop', { offset: '0%', 'stop-color': cor, 'stop-opacity': 0.35 }), T.s('stop', { offset: '100%', 'stop-color': cor, 'stop-opacity': 0 }))),
      T.s('path', { d: `${d}L${w},${h}L0,${h}Z`, fill: `url(#${id})` }),
      T.s('path', { d, fill: 'none', stroke: cor, 'stroke-width': 1.8, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })
    );
  }

  function delta(atual, anterior, { inverso = false } = {}) {
    if (!T.filtro.comparar || anterior === null || anterior === undefined || !anterior) return null;
    const pct = ((atual - anterior) / Math.abs(anterior)) * 100;
    const bom = inverso ? pct < 0 : pct > 0;
    const neutro = Math.abs(pct) < 0.5;
    return T.h(
      'span',
      { class: 'kpi-delta', 'data-tom': neutro ? 'neutro' : bom ? 'bom' : 'ruim', title: `vs. ${T.filtro.dias()} dias anteriores` },
      neutro ? '=' : pct > 0 ? '▲' : '▼',
      ` ${f.n(Math.abs(pct), 1)}%`
    );
  }

  function kpi(o) {
    return T.h(
      'article',
      { class: 'kpi', 'data-revela': '', style: { '--kpi-cor': o.cor } },
      T.h('header', { class: 'kpi-topo' }, T.h('span', { class: 'kpi-icone' }, T.icone(o.icone)), T.h('span', { class: 'kpi-rotulo' }, o.rotulo), o.rota ? T.h('a', { class: 'kpi-link', href: `#/${o.rota}`, 'aria-label': `Abrir ${o.rotulo}` }, T.icone('seta')) : null),
      T.h('div', { class: 'kpi-linha' }, T.h('b', { class: 'kpi-valor tab' }, o.valor), delta(o.atual, o.anterior, o)),
      T.h('p', { class: 'kpi-sub' }, o.sub),
      sparkline(o.serie, o.cor)
    );
  }

  /** Soma ou média de uma série no período e na janela anterior. */
  function medir(nome, modo = 'soma') {
    const bruta = T.dados.serie(nome);
    const s = T.filtro.recortar(bruta);
    const ant = T.filtro.janelaAnterior(bruta);
    const calc = (x) => (modo === 'media' ? media(completos(x)) : T.soma(x));
    return { serie: s, atual: calc(s), anterior: ant ? calc(ant) : null };
  }

  function kpis() {
    const px = medir('passageiros_dia');
    const ritmo = medir('passageiros_dia', 'media');
    const pl = medir('pilotos_distintos_dia', 'media');
    const conv = medir('conversas_novas_dia');
    const ent = medir('entregas_dia');
    const ab = medir('chamados_abertos_dia');
    const fe = medir('chamados_fechados_dia');
    const saldo = ab.atual - fe.atual;
    return T.h(
      'div',
      { class: 'kpis', id: 'kpis' },
      kpi({ rotulo: 'Leads no período', icone: 'passageiros', valor: f.n(px.atual), atual: px.atual, anterior: px.anterior, sub: `${f.n(L.passageiros.cenarios.registrado)} registrados no total`, serie: px.serie, cor: 'var(--eletrico)', rota: 'passageiros' }),
      kpi({ rotulo: 'Ritmo diário', icone: 'tendencia', valor: f.n(ritmo.atual), atual: ritmo.atual, anterior: ritmo.anterior, sub: 'média de cadastros por dia completo', serie: completos(ritmo.serie), cor: 'var(--ciano)', rota: 'passageiros' }),
      kpi({ rotulo: 'Pessoas produzindo', icone: 'pilotos', valor: f.n(pl.atual, 0), atual: pl.atual, anterior: pl.anterior, sub: 'pessoas distintas cadastrando por dia', serie: completos(pl.serie), cor: 'var(--violeta)', rota: 'pilotos' }),
      kpi({ rotulo: 'Conversas novas', icone: 'central', valor: f.n(conv.atual), atual: conv.atual, anterior: conv.anterior, sub: 'iniciadas com o bot no WhatsApp', serie: conv.serie, cor: 'var(--rosa)', rota: 'central' }),
      kpi({ rotulo: 'Chamados fechados', icone: 'atendimento', valor: f.n(fe.atual), atual: fe.atual, anterior: fe.anterior, sub: `${f.n(ab.atual)} abertos no período · fila ${saldo > 0 ? `cresceu ${f.n(saldo)}` : saldo < 0 ? `diminuiu ${f.n(-saldo)}` : 'estável'}`, serie: fe.serie, cor: 'var(--firme)', rota: 'central' }),
      kpi({ rotulo: 'Entregas de kit', icone: 'operacao', valor: f.n(ent.atual), atual: ent.atual, anterior: ent.anterior, sub: 'kits entregues no período', serie: ent.serie, cor: 'var(--atencao)', rota: 'operacao' })
    );
  }

  function cartao(o, ...corpo) {
    return T.h(
      'section',
      { class: ['cartao', o.classe], id: o.id, 'data-revela': '' },
      T.h('header', { class: 'cartao-topo' }, T.h('div', null, T.h('h2', { class: 'cartao-titulo' }, o.titulo), o.sub ? T.h('p', { class: 'cartao-sub' }, o.sub) : null), o.acao || null),
      ...corpo
    );
  }

  function graficoPrincipal() {
    const corpo = T.h('div', { class: 'cartao-grafico' });
    const serie = T.dados.serie('passageiros_dia');
    const mm7 = T.dados.mm7();
    G.barrasDia(corpo, {
      serie,
      altura: 380,
      nome: 'leads',
      linhas: [{ nome: 'média de 7 dias', pontos: mm7, cor: 'var(--ciano)', largura: 2.4 }],
      cor: () => 'var(--eletrico)',
      margemEsq: 46,
      passoDatas: 56,
    });
    const exportar = T.h(
      'button',
      { class: 'botao-fantasma', type: 'button', onclick: () => T.planilha.baixarCSV([['data', 'leads', 'media_7_dias'], ...T.filtro.recortar(serie).map((p) => [p.d, p.v, (mm7.find((m) => m.d === p.d) || {}).v ?? ''])], 'ops-leads-por-dia.csv') },
      T.icone('download'),
      'CSV'
    );
    return cartao(
      { id: 'principal', classe: 'cartao-largo', titulo: 'Leads cadastrados por dia', sub: `${T.filtro.rotulo()} · barras = cadastros, linha = média móvel de 7 dias`, acao: exportar },
      corpo,
      G.legenda([
        { rotulo: 'cadastros no dia', cor: 'var(--eletrico)' },
        { rotulo: 'média de 7 dias', cor: 'var(--ciano)', forma: 'linha' },
        { rotulo: 'dia incompleto', cor: 'var(--parcial)' },
      ])
    );
  }

  function funil() {
    const etapas = L.pilotos.funil;
    const topo = etapas[0].v;
    const lista = T.h(
      'ol',
      { class: 'funil-lista' },
      etapas.map((e, i) => {
        const pct = (e.v / topo) * 100;
        const conv = i ? (e.v / etapas[i - 1].v) * 100 : 100;
        return T.h(
          'li',
          { class: 'funil-etapa', style: { '--p': `${Math.max(2, pct)}%`, '--i': i } },
          T.h('div', { class: 'funil-cab' }, T.h('span', { class: 'funil-nome' }, e.rotulo), T.h('b', { class: 'tab' }, f.n(e.v))),
          T.h('div', { class: 'funil-barra' }, T.h('i')),
          T.h('div', { class: 'funil-pe' }, T.h('span', null, `${f.pct(pct)} do topo`), i ? T.h('span', { 'data-tom': conv < 50 ? 'ruim' : 'ok' }, `${f.pct(conv, 0)} da etapa anterior`) : null)
        );
      })
    );
    return cartao({ id: 'funil', titulo: 'Funil de prontidão das pessoas', sub: 'de quem existe a quem produziu na última semana', acao: T.h('a', { class: 'botao-fantasma', href: '#/pilotos?alvo=funil' }, 'Ver o funil', T.icone('seta')) }, lista);
  }

  function cenarios() {
    const C = T.dados.cenarios();
    const meta = C.metaDeclarada;
    const itens = C.linhas.map((l) => ({ ...l, pct: Math.min(100, (l.final / meta) * 100) }));
    const corpo = T.h(
      'div',
      { class: 'cenarios-lista' },
      itens.map((l) =>
        T.h(
          'div',
          { class: 'cenario', 'data-id': l.id },
          T.h('div', { class: 'cenario-cab' }, T.h('span', null, l.nome), T.h('b', { class: 'tab' }, f.compacto(Math.round(l.final)))),
          T.h('div', { class: 'cenario-trilho' }, T.h('i', { style: { '--p': `${l.pct}%` } })),
          T.h('span', { class: 'cenario-pe' }, `${f.pct((l.final / meta) * 100, 0)} da meta · captura ${f.n(l.captura)}%`)
        )
      )
    );
    return cartao({ id: 'cenarios', titulo: 'Projeção para o Dia D', sub: `meta declarada: ${f.n(meta)} leads em ${f.data(L.meta.diaD)}`, acao: T.h('a', { class: 'botao-fantasma', href: '#/passageiros?alvo=cenarios' }, 'Detalhar', T.icone('seta')) }, corpo);
  }

  function relogio() {
    const horas = T.dados.serie('cadastros_hora_30d');
    const corpo = T.h('div', { class: 'cartao-grafico' });
    G.colunas(corpo, {
      itens: horas.map((v, h) => ({ v, rotulo: `${String(h).padStart(2, '0')}h`, rotuloLongo: `${String(h).padStart(2, '0')}h–${String((h + 1) % 24).padStart(2, '0')}h`, cor: h >= 22 || h < 8 ? 'var(--violeta)' : 'var(--eletrico)', rotuloValor: false })),
      unidade: 'cadastros',
      altura: 190,
      nome: 'cadastros por hora',
      passoRotulo: 34,
      larguraMax: 18,
    });
    const total = T.soma(horas);
    const madrugada = T.soma(horas.filter((_, h) => h >= 22 || h < 8));
    return cartao({ id: 'relogio', titulo: 'Relógio dos cadastros', sub: `30 dias · ${f.pct((madrugada / total) * 100)} entre 22h e 8h (lilás), sem plantão` }, corpo);
  }

  function decisoes() {
    const agir = T.alertas.filter((a) => a.nivel === 'agir');
    const lista = T.h(
      'ul',
      { class: 'feed' },
      agir.slice(0, 6).map((a) =>
        T.h(
          'li',
          null,
          T.h(
            'a',
            { class: 'feed-item', href: `#/${a.rota}?alvo=${a.alvo}` },
            T.h('span', { class: 'feed-ponto', 'data-nivel': a.nivel }),
            T.h('span', { class: 'feed-corpo' }, T.h('b', null, a.titulo), T.h('span', { class: 'feed-meta' }, `${a.metrica.v} ${a.metrica.u}`)),
            T.icone('seta')
          )
        )
      )
    );
    return cartao({ id: 'decisoes', titulo: 'Decisões para hoje', sub: `${agir.length} pedem ação · ${T.alertas.length - agir.length} em atenção`, acao: T.h('a', { class: 'botao-fantasma', href: '#/decisao' }, 'Todas', T.icone('seta')) }, lista);
  }

  function fontes() {
    const ROT = { atualizado: 'Sincronizado', atrasado: 'Parado', atencao: 'Parcial', 'sem-dados': 'Sem dados' };
    const s = T.dados.sensores();
    const importada = T.importacao && T.importacao.ativa();
    const lista = T.h(
      'ul',
      { class: 'fontes-lista' },
      importada ? T.h('li', { class: 'fonte', 'data-estado': 'atualizado' }, T.h('i'), T.h('span', null, T.h('b', null, `Planilha: ${importada.arquivo}`), T.h('small', null, `${f.n(importada.linhas)} linhas importadas`)), T.h('em', null, 'Importado')) : null,
      s.slice(0, 6).map((x) => T.h('li', { class: 'fonte', 'data-estado': x.estado }, T.h('i'), T.h('span', null, T.h('b', null, x.nome), T.h('small', null, x.detalhe)), T.h('em', null, ROT[x.estado] || x.estado)))
    );
    return cartao({ id: 'fontes', classe: 'cartao-inteiro', titulo: 'Saúde das fontes', sub: 'bancos conectados e lacunas conhecidas', acao: T.h('a', { class: 'botao-fantasma', href: '#/dados' }, 'Integrações', T.icone('seta')) }, lista);
  }

  T.modulos.painel = {
    render(raiz) {
      const n = T.numerosChave();
      const faltam = T.diasEntre(T.estado.hoje.iso, L.meta.diaD);
      raiz.append(
        T.h(
          'header',
          { class: 'painel-cabeca', 'data-revela': '' },
          T.h(
            'div',
            null,
            T.h('p', { class: 'sobretitulo' }, T.h('span', { class: 'pulso' }), 'Clube Horizonte · Temporada 2026'),
            T.h('h1', { class: 'painel-h1' }, 'Visão executiva'),
            T.h('p', { class: 'painel-lead' }, T.h('b', null, f.n(n.vivos)), ` de ${f.n(n.ativos)} pessoas estão prontas e faltam `, T.h('b', null, `${Math.max(0, faltam)} dias`), ` para o Dia D. ${T.alertas.filter((a) => a.nivel === 'agir').length} decisões pedem ação hoje.`)
          ),
          T.h(
            'div',
            { class: 'painel-cabeca-acoes' },
            T.h('button', { class: 'botao-secundario', type: 'button', onclick: () => T.modo('apresentar') }, T.icone('apresentar'), 'Apresentar'),
            T.h('button', { class: 'botao-primario', type: 'button', onclick: () => T.exportarRelatorio() }, T.icone('pdf'), 'Gerar relatório')
          )
        ),
        kpis(),
        T.h('div', { class: 'painel-grade' }, graficoPrincipal(), decisoes(), funil(), cenarios(), relogio(), fontes())
      );
    },
  };
})();
