(function () {
  'use strict';
  const T = window.T;
  const C = (T.comp = {});

  const ESTADOS = {
    vermelho: { icone: 'agir', texto: 'Agir hoje' },
    agir: { icone: 'agir', texto: 'Agir hoje' },
    amarelo: { icone: 'atencao', texto: 'Atenção' },
    atencao: { icone: 'atencao', texto: 'Atenção' },
    verde: { icone: 'firme', texto: 'Firme' },
    firme: { icone: 'firme', texto: 'Firme' },
    'nao-medido': { icone: 'nao-medido', texto: 'Não medido' },
    atualizado: { icone: 'firme', texto: 'Atualizado' },
    atrasado: { icone: 'agir', texto: 'Atrasado' },
    'sem-dados': { icone: 'nao-medido', texto: 'Sem dados' },
  };
  const normal = (s) => ({ agir: 'vermelho', atencao: 'amarelo', firme: 'verde', atualizado: 'verde', atrasado: 'vermelho', 'sem-dados': 'nao-medido' }[s] || s);

  T.carimbo = function (estado, texto, compacto) {
    const e = ESTADOS[estado] || ESTADOS['nao-medido'];
    return T.h('span', { class: ['carimbo', compacto ? 'compacto' : null], 'data-s': normal(estado) }, T.icone(e.icone), T.h('span', null, texto || e.texto));
  };
  T.estadoNormal = normal;

  C.canais = function (kpis, prefixo) {
    return T.h(
      'div',
      { class: 'canais', role: 'list' },
      kpis.map((k, i) => {
        const formato = k.formato === 'pct' ? (v) => T.fmt.pct(v) : k.formato === 'horas' ? (v) => T.fmt.h(v) : k.formato === 'dias' ? (v) => T.fmt.d(v) : (v) => T.fmt.n(v);
        const revisado = k.chave && T.vivo ? T.vivo.marcador(k.chave) : null;
        return T.h(
          k.explica ? 'button' : 'div',
          { class: 'canal', role: 'listitem', 'data-explica': k.explica || null, 'data-chave': k.chave || null, type: k.explica ? 'button' : null },
          T.h('span', { class: 'canal-valor num' }, T.mov.numero(k.v, formato), revisado),
          T.h('span', { class: 'canal-rotulo' }, k.rotulo),
          k.estado ? T.carimbo(k.estado, null, true) : null
        );
      })
    );
  };

  C.cabecalho = function (cap, opts = {}) {
    const regua = opts.regua || [];
    const cont = T.dados.contagemRegua(regua);
    const pagina = T.paginas.find((p) => p.id === opts.rota);
    const parte = pagina && pagina.parte;
    return T.h(
      'header',
      { class: 'capitulo-cab', 'data-revela': '' },
      T.h('div', { class: 'capitulo-placa', 'aria-hidden': 'true' }, T.h('span', { class: 'capitulo-letra' }, cap.letra), parte ? T.h('span', { class: 'capitulo-parte' }, `parte ${parte}`) : null, T.icone(opts.icone || 'visao')),
      T.h(
        'div',
        { class: 'capitulo-textos' },
        T.h('h1', { class: 'capitulo-titulo' }, cap.titulo),
        T.h('p', { class: 'capitulo-pergunta' }, cap.pergunta),
        T.h('p', { class: 'capitulo-frase' }, cap.frase)
      ),
      regua.length
        ? T.h(
            'div',
            { class: 'capitulo-tally' },
            T.h('h2', { class: 'tally-titulo' }, 'Régua do capítulo'),
            T.h(
              'div',
              { class: 'tally-linhas' },
              [['vermelho', 'agir hoje'], ['amarelo', 'atenção'], ['verde', 'firmes'], ['nao-medido', 'não medidas']]
                .filter(([k]) => cont[k])
                .map(([k, t]) => T.h('span', { class: 'tally', 'data-s': k }, T.icone(ESTADOS[k].icone), T.h('b', { class: 'tab' }, String(cont[k])), t))
            ),
            T.h('a', { class: 'link-seta', href: `#/${opts.rota}?alvo=regua` }, 'ver a régua', T.icone('seta'))
          )
        : null
    );
  };

  C.secao = function ({ id, titulo, sub, classe }, ...conteudo) {
    return T.h(
      'section',
      { class: ['secao', classe], id: id || null },
      T.h('div', { class: 'secao-cab', 'data-revela': '' }, T.h('h2', { class: 'secao-titulo' }, titulo), sub ? T.h('p', { class: 'secao-sub' }, sub) : null),
      conteudo
    );
  };

  C.regua = function (linhas, nota, opts = {}) {
    return T.h(
      'div',
      { class: 'ficha-ensaio', id: opts.id || null, 'data-revela': '' },
      T.h(
        'div',
        { class: 'tabela-rolagem' },
        T.h(
          'table',
          { class: 'regua' },
          T.h(
            'thead',
            null,
            T.h(
              'tr',
              null,
              T.h('th', { scope: 'col' }, 'Métrica'),
              opts.significado ? T.h('th', { scope: 'col' }, 'O que significa') : null,
              T.h('th', { scope: 'col', class: 'col-faixa' }, T.h('span', { class: 'faixa-cor', 'data-s': 'verde' }), 'Firme'),
              T.h('th', { scope: 'col', class: 'col-faixa' }, T.h('span', { class: 'faixa-cor', 'data-s': 'amarelo' }), 'Atenção'),
              T.h('th', { scope: 'col', class: 'col-faixa' }, T.h('span', { class: 'faixa-cor', 'data-s': 'vermelho' }), 'Agir'),
              T.h('th', { scope: 'col' }, 'Hoje'),
              T.h('th', { scope: 'col' }, 'Estado')
            )
          ),
          T.h(
            'tbody',
            null,
            linhas.map((l) =>
              T.h(
                'tr',
                { 'data-s': l.status },
                T.h('th', { scope: 'row' }, l.metrica),
                opts.significado ? T.h('td', { class: 'regua-sig' }, l.significado || '') : null,
                T.h('td', { class: 'regua-faixa' }, l.verde),
                T.h('td', { class: 'regua-faixa' }, l.amarelo),
                T.h('td', { class: 'regua-faixa' }, l.vermelho),
                T.h('td', { class: 'regua-hoje' }, T.h('b', { class: 'tab' }, l.hoje ?? '—'), l.hojeNota ? T.h('small', null, l.hojeNota) : null),
                T.h('td', null, T.carimbo(l.status, null, true))
              )
            )
          )
        )
      ),
      nota ? T.h('p', { class: 'ficha-nota' }, T.icone('info'), nota) : null
    );
  };

  C.alerta = function (a, opts = {}) {
    const nucleo = T.nucleo(a.area);
    const cartao = T.h(
      'article',
      { class: ['decisao', `decisao-${a.nivel}`, opts.compacto ? 'compacta' : null], 'data-area': a.area, id: opts.comId ? `alerta-${a.id}` : null },
      T.h(
        'div',
        { class: 'decisao-topo' },
        T.carimbo(a.nivel, null, true),
        T.h('span', { class: 'decisao-area' }, T.icone(nucleo ? nucleo.icone : 'info'), nucleo ? nucleo.nome : a.area)
      ),
      T.h('h3', { class: 'decisao-titulo' }, a.titulo),
      T.h('div', { class: 'decisao-metrica' }, T.h('b', { class: 'num' }, a.metrica.v), T.h('span', null, a.metrica.u)),
      opts.compacto ? null : T.h('p', { class: 'decisao-impacto' }, a.impacto),
      opts.compacto ? null : T.h('p', { class: 'decisao-acao', 'aria-label': `Ação recomendada pelo livro: ${a.acao}` }, T.icone('seta'), T.h('span', null, a.acao)),
      opts.compacto || !a.nota ? null : T.h('p', { class: 'decisao-nota' }, T.icone('info'), a.nota),
      T.h(
        'div',
        { class: 'decisao-rodape' },
        T.h('span', { class: 'leitura' }, `p. ${[].concat(a.p).join(', ')}`),
        T.h('a', { class: 'link-seta', href: `#/${a.rota}?alvo=${a.alvo}` }, opts.compacto ? 'ver' : 'ver o dado', T.icone('seta'))
      )
    );
    return cartao;
  };

  C.sensores = function (lista, opts = {}) {
    return T.h(
      'ul',
      { class: ['sensores', opts.compacto ? 'compacto' : null], role: 'list' },
      lista.map((s) =>
        T.h(
          'li',
          { class: 'sensor', 'data-s': T.estadoNormal(s.estado === 'atencao' ? 'amarelo' : s.estado) },
          T.h('span', { class: 'sensor-luz', 'aria-hidden': 'true' }),
          T.h('span', { class: 'sensor-nome' }, s.nome),
          T.carimbo(s.estado === 'atencao' ? 'amarelo' : s.estado, s.estado === 'atencao' ? 'Atenção' : null, true),
          T.h('span', { class: 'sensor-detalhe' }, s.detalhe)
        )
      )
    );
  };

  C.muda = function (lista, titulo) {
    return T.h(
      'div',
      { class: 'muda', 'data-revela': '' },
      T.h('h3', { class: 'bloco-titulo' }, titulo || 'O que este capítulo muda'),
      T.h(
        'ol',
        { class: 'muda-lista' },
        lista.map((m) => T.h('li', null, T.h('h4', null, m.t), T.h('p', null, m.d)))
      )
    );
  };

  C.naoMede = function (lista, titulo) {
    return T.h(
      'div',
      { class: 'nao-mede', 'data-revela': '' },
      T.h('h3', { class: 'bloco-titulo' }, T.icone('ponto_cego'), titulo || 'O que não dá para medir aqui'),
      T.h(
        'ul',
        null,
        lista.map((t) => {
          const [cabeca, ...resto] = t.split(/:\s/);
          return T.h('li', null, resto.length ? [T.h('b', null, `${cabeca}: `), resto.join(': ')] : t);
        })
      )
    );
  };

  C.medidor = function ({ v, max, rotulo, formato, cor, alvo }) {
    const pct = T.clamp((v / max) * 100, 0, 100);
    return T.h(
      'div',
      { class: 'medidor', style: { '--p': `${pct}%`, '--c': cor || 'var(--eletrico)' } },
      T.h('div', { class: 'medidor-cab' }, T.h('span', null, rotulo), T.h('b', { class: 'tab' }, (formato || T.fmt.n)(v))),
      T.h(
        'div',
        { class: 'medidor-trilho' },
        T.h('span', { class: 'medidor-barra' }),
        alvo ? T.h('span', { class: 'medidor-alvo', style: { '--a': `${T.clamp((alvo.v / max) * 100, 0, 100)}%` }, title: alvo.rotulo }) : null
      )
    );
  };

  C.grade = (classe, ...filhos) => T.h('div', { class: ['grade-paineis', classe] }, filhos);
})();
