/* Análise de Conteúdo · quais publicações geram interesse, interação e oportunidades de conversão. */
(function () {
  'use strict';
  const T = window.T;
  const f = T.fmt;
  const O = T.ops;
  const N = O.nucleo;
  const U = O.ui;

  const media = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  function resumo(cj, fl) {
    const atual = N.conteudosDoFiltro(cj, fl);
    const ant = N.conteudosDoFiltro(cj, fl, fl.janela.anterior);
    const linha = (lista) => ({ n: lista.length, taxa: media(lista.map(N.taxaConteudo).filter((x) => x !== null)), alcance: media(lista.map((c) => c.metricas.alcance || 0)), conversas: lista.reduce((s, c) => s + (c.conversas || 0), 0) });
    const a = linha(atual);
    const b = linha(ant);
    const k = (id, nome, va, vb, fmt) => ({ id, nome, atual: va, anterior: vb, variacao: N.variacao(va, vb), fontes: [{ nome: 'Métricas de publicações' }], fmt });
    const cartoes = [k('n', 'Publicações', a.n, b.n), k('taxa', 'Taxa média de engajamento', a.taxa, b.taxa), k('alcance', 'Alcance médio por post', a.alcance, b.alcance), k('conversas', 'Conversas rastreadas', a.conversas, b.conversas)];
    return T.h(
      'section',
      { class: 'ops-kpis-principais', 'aria-label': 'Resumo de conteúdo' },
      cartoes.map((c) => {
        const el = U.kpi({ ...c, id: c.id === 'taxa' ? 'taxa_engajamento' : c.id }, { destaque: true, janela: fl.janela });
        return el;
      })
    );
  }

  function formatos(cj, fl) {
    const lista = N.porFormato(cj, fl);
    const corpo = T.h('div');
    if (!lista.length) corpo.appendChild(U.indisponivel('Sem publicações no período.'));
    else {
      const max = Math.max(...lista.map((x) => x.taxaMedia || 0));
      corpo.appendChild(
        T.h(
          'table',
          { class: 'ops-tabela' },
          T.h('thead', null, T.h('tr', null, ['Formato', 'Posts', 'Engajamento médio', 'Alcance médio', 'Conversas', 'Leads'].map((c) => T.h('th', { scope: 'col' }, c)))),
          T.h(
            'tbody',
            null,
            lista.map((x) =>
              T.h(
                'tr',
                null,
                T.h('th', { scope: 'row' }, x.nome),
                T.h('td', { class: 'tab' }, f.n(x.n)),
                T.h('td', null, T.h('span', { class: 'ops-barra-celula' }, T.h('i', { style: { '--w': `${((x.taxaMedia || 0) / (max || 1)) * 100}%` } }), T.h('b', { class: 'tab' }, x.taxaMedia === null ? '—' : f.pct(x.taxaMedia)))),
                T.h('td', { class: 'tab' }, f.compacto(x.alcanceMedio)),
                T.h('td', { class: 'tab' }, f.n(x.conversas)),
                T.h('td', { class: 'tab' }, f.n(x.leads))
              )
            )
          )
        ),
        T.h('p', { class: 'ops-nota' }, 'Formatos com menos de 3 publicações não entram nos insights: a amostra é pequena demais para conclusões.')
      );
    }
    return U.cartao({ id: 'cont-formatos', titulo: 'Comparação entre formatos', sub: 'Reels, vídeos, imagens, carrosséis e outros', fontes: [{ nome: 'Métricas de publicações' }], janela: fl.janela }, corpo);
  }

  function temas(cj, fl) {
    const lista = N.porTema(cj, fl);
    const corpo = T.h('div');
    if (!lista.length) corpo.appendChild(U.indisponivel('Nenhuma publicação com tema identificado. Configure hashtags por tema na integração ou classifique os posts.'));
    else
      O.barrasH(
        corpo,
        lista.slice(0, 8).map((t) => ({ rotulo: t.tema, valor: t.alcanceMedio, cor: 'var(--eletrico)', t, dica: T.dica.bloco([{ valor: f.n(t.alcanceMedio), rotulo: 'alcance médio' }, { valor: f.n(t.n), rotulo: 'posts' }, { valor: f.n(t.conversas), rotulo: 'conversas rastreadas' }, { valor: f.n(t.leads), rotulo: 'leads rastreados' }], t.tema) })),
        { formato: f.compacto, extra: (i) => [T.h('span', null, `${i.t.n} posts`), T.h('span', { class: 'ops-conv' }, `${f.n(i.t.conversas)} conv.`)] }
      );
    return U.cartao({ id: 'cont-temas', titulo: 'Temas com maior alcance', sub: 'Alcance médio por publicação e conversas que os posts geraram', fontes: [{ nome: 'Métricas de publicações' }, { nome: 'Conversas rastreadas' }], janela: fl.janela }, corpo);
  }

  function evolucao(cj, fl) {
    const corpo = T.h('div', { class: 'ops-graf' });
    const dias = N.intervalo(fl.janela.de, fl.janela.ate);
    const conts = N.conteudosDoFiltro(cj, { ...fl, plataforma: 'todas' });
    const canais = N.CANAIS.filter((c) => conts.some((x) => x.canal === c.id) && (fl.plataforma === 'todas' || fl.plataforma === c.id));
    if (!canais.length) corpo.appendChild(U.indisponivel('Sem publicações no período.'));
    else {
      // média móvel de 7 dias da taxa de engajamento dos posts publicados
      const series = canais.map((c) => {
        const lista = conts.filter((x) => x.canal === c.id);
        return {
          id: c.id,
          nome: c.nome,
          cor: c.cor,
          pontos: dias.map((d) => {
            const ini = N.somarDias(d, -6);
            const tx = lista.filter((x) => x.publicadoEm.slice(0, 10) >= ini && x.publicadoEm.slice(0, 10) <= d).map(N.taxaConteudo).filter((v) => v !== null);
            return { d, v: tx.length ? tx.reduce((a, b) => a + b, 0) / tx.length : null };
          }),
        };
      });
      O.linhas(corpo, { series, formato: (v) => f.pct(v, 1), nome: 'Taxa de engajamento (média móvel de 7 dias)' });
    }
    return U.cartao({ id: 'cont-evolucao', titulo: 'Evolução do engajamento', sub: 'Média móvel de 7 dias da taxa de engajamento dos posts, por plataforma', classe: 'largo', fontes: canais.map((c) => ({ nome: c.nome })), janela: fl.janela }, corpo);
  }

  function biblioteca(cj, fl) {
    let formato = 'todos';
    let ordem = 'recentes';
    const grade = T.h('div', { class: 'ops-conteudos' });
    const todos = N.conteudosDoFiltro(cj, fl).map((c) => ({ ...c, taxa: N.taxaConteudo(c), interacoes: N.interacoesDe(c.metricas) }));
    const mediaTaxa = media(todos.map((c) => c.taxa).filter((x) => x !== null));
    const pintar = () => {
      T.limpar(grade);
      let lista = todos.filter((c) => formato === 'todos' || c.formato === formato);
      lista = lista.sort((a, b) => (ordem === 'recentes' ? b.publicadoEm.localeCompare(a.publicadoEm) : ordem === 'engajamento' ? (b.taxa ?? -1) - (a.taxa ?? -1) : ordem === 'conversas' ? (b.conversas || 0) - (a.conversas || 0) : (b.metricas.alcance || 0) - (a.metricas.alcance || 0)));
      if (!lista.length) return grade.appendChild(U.vazio('Nenhuma publicação', 'Ajuste o período, a plataforma ou o formato.'));
      lista.slice(0, 24).forEach((c) => {
        const canal = N.canal(c.canal);
        const acima = c.taxa !== null && mediaTaxa ? c.taxa >= mediaTaxa * 1.15 : false;
        const abaixo = c.taxa !== null && mediaTaxa ? c.taxa <= mediaTaxa * 0.85 : false;
        grade.appendChild(
          T.h(
            'article',
            { class: 'ops-conteudo-card' },
            T.h('div', { class: 'ops-conteudo-previa', style: { '--c': canal.cor } }, c.miniatura ? T.h('img', { src: c.miniatura, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' }) : T.h('span', null, N.FORMATOS[c.formato] || c.formato), T.h('span', { class: 'ops-conteudo-canal' }, canal.nome)),
            T.h('div', { class: 'ops-conteudo-texto' }, T.h('b', null, c.legenda || '(sem legenda)'), T.h('small', null, `${N.FORMATOS[c.formato] || c.formato} · ${c.tema || 'sem tema'} · ${f.data(c.publicadoEm.slice(0, 10))}`)),
            T.h(
              'dl',
              { class: 'ops-conteudo-metricas' },
              [['Alcance', c.metricas.alcance], ['Curtidas', c.metricas.curtidas], ['Coment.', c.metricas.comentarios], ['Compart.', c.metricas.compartilhamentos], ['Salvos', c.metricas.salvamentos], ['Conversas', c.conversas]].map(([r, v]) => T.h('div', null, T.h('dt', null, r), T.h('dd', { class: 'tab' }, v === null || v === undefined ? 'n/d' : f.compacto(v))))
            ),
            T.h('footer', null, T.h('span', { class: 'ops-estado', 'data-s': acima ? 'firme' : abaixo ? 'atencao' : 'nao-medido' }, acima ? 'Acima da média' : abaixo ? 'Abaixo da média' : 'Na média', c.taxa !== null ? ` · ${f.pct(c.taxa)}` : ''), c.link ? T.h('a', { class: 'link-seta', href: c.link, target: '_blank', rel: 'noopener' }, 'Abrir', T.icone('seta')) : null)
          )
        );
      });
    };
    const formatos = [...new Set(todos.map((c) => c.formato))];
    const controles = T.h(
      'div',
      { class: 'ops-controles' },
      T.h('select', { class: 'ops-select', 'aria-label': 'Formato', onchange: (e) => { formato = e.target.value; pintar(); } }, T.h('option', { value: 'todos' }, 'Todos os formatos'), formatos.map((x) => T.h('option', { value: x }, N.FORMATOS[x] || x))),
      T.h('select', { class: 'ops-select', 'aria-label': 'Ordenar', onchange: (e) => { ordem = e.target.value; pintar(); } }, [['recentes', 'Mais recentes'], ['engajamento', 'Maior engajamento'], ['alcance', 'Maior alcance'], ['conversas', 'Mais conversas']].map(([v, t]) => T.h('option', { value: v }, t)))
    );
    pintar();
    return U.cartao({ id: 'cont-biblioteca', titulo: 'Publicações', sub: `${todos.length} no período · média de engajamento ${mediaTaxa === null ? '—' : f.pct(mediaTaxa)}`, acao: controles, classe: 'largo', fontes: [{ nome: 'Métricas de publicações' }], janela: fl.janela }, grade);
  }

  function insightsConteudo(cj, fl) {
    const lista = N.insights(cj, fl).filter((i) => ['formato-destaque', 'tema-conversas', 'horarios'].includes(i.id) || i.id.startsWith('eng-'));
    if (!lista.length) return null;
    return U.cartao(
      { id: 'cont-insights', titulo: 'O que os dados de conteúdo mostram', sub: 'Só aparecem com volume suficiente', classe: 'largo', rodape: U.rodapeFonte(['Métricas de publicações'], fl.janela) },
      T.h('div', { class: 'ops-insights compacto' }, lista.map((i) => T.h('article', { class: 'ops-insight', 'data-tom': i.tom }, T.h('div', { class: 'ops-insight-bloco fato' }, T.h('span', null, 'Fato'), T.h('p', null, i.fato)), i.hipotese ? T.h('div', { class: 'ops-insight-bloco hipotese' }, T.h('span', null, 'Hipótese'), T.h('p', null, i.hipotese)) : null, T.h('div', { class: 'ops-insight-bloco recomendacao' }, T.h('span', null, 'Recomendação'), T.h('p', null, i.recomendacao)))))
    );
  }

  function engajamentoPlataforma(cj, fl) {
    const linhas = N.engajamentoPorCanal(cj, fl);
    const corpo = T.h('div');
    if (!linhas.length) corpo.appendChild(U.indisponivel('Sem métricas de conteúdo no período.'));
    else O.multiplos(corpo, [['Taxa de engajamento', 'taxa', (v) => f.pct(v, 1)], ['Alcance', 'alcance', f.compacto], ['Interações', null, f.compacto], ['Posts', 'conteudos', f.n]].map(([nome, campo, formato]) => ({ nome, formato, itens: linhas.map((l) => ({ curto: N.canal(l.canal).curto, nome: l.nome, cor: l.cor, valor: campo ? l[campo] : l.curtidas + l.comentarios + l.compartilhamentos + (l.salvamentos || 0) })) })));
    return U.cartao({ id: 'cont-plataformas', titulo: 'Desempenho por plataforma', sub: 'Cada métrica com sua própria escala', fontes: linhas.map((l) => ({ nome: l.nome })), janela: fl.janela }, corpo);
  }

  function montar(host, cj) {
    const fl = O.f();
    host.append(
      U.cabecalho({ sobretitulo: [T.icone('alcance'), `${cj.cliente.nome} · Inteligência de conteúdo`], titulo: 'Análise de Conteúdo', lead: `Quais publicações geram interesse, interação e oportunidades de conversão · ${U.periodoTexto(fl.janela)}.` }),
      resumo(cj, fl),
      insightsConteudo(cj, fl),
      T.h('div', { class: 'ops-linha l-1-1' }, formatos(cj, fl), engajamentoPlataforma(cj, fl)),
      T.h('div', { class: 'ops-linha l-2-1' }, evolucao(cj, fl), temas(cj, fl)),
      biblioteca(cj, fl)
    );
  }

  T.modulos.conteudo = { render: (raiz) => U.pagina(raiz, montar) };
})();
