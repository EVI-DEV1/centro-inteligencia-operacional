(function () {
  'use strict';
  const T = window.T;
  const G = T.graf;

  G.barrasH = function (el, o) {
    const max = o.max || Math.max(...o.itens.map((i) => i.v));
    const lista = T.h('ol', { class: ['barrash', o.compacta ? 'compacta' : null], role: 'list' });
    for (const it of o.itens) {
      const pct = max ? T.clamp((it.v / max) * 100, 0, 100) : 0;
      const trilho = T.h(
        'span',
        { class: 'barrash-trilho' },
        T.h('span', {
          class: ['barrash-barra', it.textura ? 'hachura' : null, it.destaque ? 'destaque' : null],
          style: { '--p': `${pct}%`, '--c': it.cor || 'var(--eletrico)', '--i': o.itens.indexOf(it) },
        }),
        (it.marcas || []).map((mk) => T.h('span', { class: 'barrash-marca', style: { '--p': `${T.clamp((mk.v / max) * 100, 0, 100)}%`, '--c': mk.cor || 'var(--ciano)' }, title: mk.rotulo }))
      );
      const li = T.h(
        'li',
        { class: ['barrash-item', it.classe], tabindex: o.dica ? 0 : null },
        T.h('span', { class: 'barrash-rotulo' }, it.rotulo, it.sub ? T.h('small', null, it.sub) : null),
        trilho,
        T.h('span', { class: 'barrash-valor tab' }, it.texto ?? (o.formato || T.fmt.n)(it.v), it.palavra ? T.carimbo(it.palavra.estado, it.palavra.texto, true) : null)
      );
      if (o.dica) T.dica.ligar(li, () => o.dica(it));
      lista.appendChild(li);
    }
    el.appendChild(lista);
    G.vida(lista);
    return lista;
  };

  G.faixa = function (el, o) {
    const total = o.total || T.soma(o.segmentos);
    const barra = T.h('div', { class: ['faixa-empilhada', o.alta ? 'alta' : null], role: 'img', 'aria-label': o.nome || 'composição' });
    for (const sgm of o.segmentos) {
      const pct = (sgm.v / total) * 100;
      const peca = T.h(
        'span',
        {
          class: ['faixa-seg', sgm.textura ? 'hachura' : null],
          style: { '--p': `${pct}%`, '--c': sgm.cor || 'var(--eletrico)' },
          tabindex: 0,
        },
        pct > (o.minRotulo ?? 9) ? T.h('span', { class: 'faixa-seg-rotulo' }, sgm.curto || (o.formato || T.fmt.n)(sgm.v)) : null
      );
      T.dica.ligar(peca, () => T.dica.bloco([{ valor: (o.formato || T.fmt.n)(sgm.v), rotulo: `${sgm.rotulo} · ${T.fmt.pct(pct)}`, cor: sgm.cor, forma: 'barra' }]));
      barra.appendChild(peca);
    }
    el.appendChild(barra);
    if (o.legenda !== false) {
      el.appendChild(
        T.h(
          'ul',
          { class: 'faixa-legenda' },
          o.segmentos.map((sgm) =>
            T.h(
              'li',
              null,
              T.h('i', { class: ['graf-legenda-chave', sgm.textura ? 'hachura' : null], 'data-forma': 'barra', style: { '--c': sgm.cor } }),
              T.h('b', { class: 'tab' }, (o.formato || T.fmt.n)(sgm.v)),
              T.h('span', null, sgm.rotulo)
            )
          )
        )
      );
    }
    return barra;
  };

  G.halteres = function (el, o) {
    return G.montar(el, (alvo, W) => {
      const linhaH = o.linha || 30;
      const H = o.itens.length * linhaH + 34;
      const m = { t: 24, r: o.margemDir || 124, b: 10, l: o.margemEsq || 150 };
      const max = o.max || Math.max(...o.itens.flatMap((i) => [i.a, i.b])) * 1.05;
      const x = G.linear(0, max, m.l, W - m.r);
      const svg = G.svg(W, H, { 'aria-label': o.nome || 'comparação entre dois períodos' });
      const { topo, passo } = G.topoRedondo(max, 4);
      for (const v of G.marcas(topo, passo)) {
        if (v > max) break;
        const xx = Math.round(x(v)) + 0.5;
        svg.appendChild(T.s('line', { x1: xx, x2: xx, y1: m.t - 6, y2: H - m.b, class: 'graf-grade' }));
        svg.appendChild(T.s('text', { x: xx, y: 12, class: 'graf-tick', 'text-anchor': 'middle' }, T.fmt.compacto(v)));
      }
      o.itens.forEach((it, i) => {
        const yy = m.t + i * linhaH + linhaH / 2;
        const cor = it.tendencia === 'subiu' ? 'var(--eletrico)' : it.tendencia === 'caiu' ? 'var(--rosa)' : 'var(--referencia)';
        const g = T.s('g', { class: 'haltere', tabindex: 0, style: { '--i': i } });
        g.appendChild(T.s('text', { x: m.l - 12, y: yy + 4, class: 'graf-rotulo-linha', 'text-anchor': 'end' }, it.rotuloTexto || it.rotulo));
        g.appendChild(T.s('line', { x1: x(it.a), x2: x(it.b), y1: yy, y2: yy, stroke: cor, 'stroke-width': 2, class: 'haltere-haste' }));
        g.appendChild(T.s('circle', { cx: x(it.a), cy: yy, r: 4.5, class: 'haltere-a' }));
        g.appendChild(T.s('circle', { cx: x(it.b), cy: yy, r: 5, fill: cor, class: 'haltere-b' }));
        g.appendChild(T.s('text', { x: Math.max(x(it.a), x(it.b)) + 12, y: yy + 4, class: 'graf-valor-linha' }, o.textoFim ? o.textoFim(it) : ''));
        T.dica.ligar(g, () =>
          T.dica.bloco(
            [
              { valor: T.fmt.n(it.a), rotulo: o.rotuloA || 'antes', cor: 'var(--tinta-3)', forma: 'ponto' },
              { valor: T.fmt.n(it.b), rotulo: o.rotuloB || 'depois', cor, forma: 'ponto' },
            ],
            T.nomeTexto(it.rotulo)
          )
        );
        svg.appendChild(g);
      });
      alvo.appendChild(svg);
    });
  };

  G.calor = function (el, o) {
    return G.montar(el, (alvo, W) => {
      const nl = o.linhas.length;
      const nc = o.colunas.length;
      const m = { t: 20, r: 6, b: 6, l: 38 };
      const cw = (W - m.l - m.r) / nc;
      const ch = Math.min(26, Math.max(14, cw * 0.82));
      const H = m.t + nl * ch + m.b;
      const svg = G.svg(W, H, { 'aria-label': o.nome || 'mapa de calor' });
      const maxNivel = Math.max(...o.niveis.flat());
      o.colunas.forEach((c, j) => {
        if (j % (cw < 22 ? 3 : 2) !== 0) return;
        svg.appendChild(T.s('text', { x: m.l + j * cw + cw / 2, y: 12, class: 'graf-tick', 'text-anchor': 'middle' }, c));
      });
      o.linhas.forEach((l, i) => {
        svg.appendChild(T.s('text', { x: m.l - 8, y: m.t + i * ch + ch / 2 + 4, class: 'graf-tick', 'text-anchor': 'end' }, l));
        o.colunas.forEach((c, j) => {
          const nivel = o.niveis[i][j];
          const k = nivel / maxNivel;
          const cel = T.s('rect', {
            x: m.l + j * cw + 1,
            y: m.t + i * ch + 1,
            width: cw - 2,
            height: ch - 2,
            rx: 2,
            class: ['calor-cel', nivel === 0 ? 'vazia' : null, o.madrugada && o.madrugada(j) ? 'madrugada' : null],
            style: { '--k': k.toFixed(3), '--j': j },
          });
          const rotulo = o.rotulos && o.rotulos[`${i}-${j}`];
          T.dica.ligar(cel, () =>
            T.dica.bloco(
              [
                rotulo ? { valor: rotulo, rotulo: 'cadastros (número impresso no livro)', cor: 'var(--eletrico)', forma: 'barra' } : null,
                { valor: nivel === 0 ? 'nenhum' : `${Math.round(k * 100)}%`, rotulo: nivel === 0 ? 'nenhum cadastro' : 'intensidade relativa ao quadrado mais escuro', cor: 'var(--eletrico)', forma: 'barra' },
              ].filter(Boolean),
              `${l} · ${c}`
            )
          );
          svg.appendChild(cel);
          if (rotulo) svg.appendChild(T.s('text', { x: m.l + j * cw + cw / 2, y: m.t + i * ch + ch / 2 + 4, class: 'calor-rotulo', 'text-anchor': 'middle' }, rotulo));
        });
      });
      alvo.appendChild(svg);
    });
  };

  G.capacidade = function (el, o) {
    const lista = T.h('div', { class: 'capacidade' });
    for (const elo of o.elos) {
      const max = Math.max(elo.teto, ...elo.exige) * 1.04;
      const pctN = (v) => T.clamp((v / max) * 100, 0, 100);
      const pct = (v) => `${pctN(v)}%`;
      const multiplicador = elo.abaixo ? elo.exige[0] / elo.teto : null;
      const grupos = [];
      elo.exige.forEach((v, i) => {
        const ultimo = grupos.at(-1);
        if (ultimo && pctN(v) - pctN(elo.exige[ultimo.at(-1)]) < 14) ultimo.push(i);
        else grupos.push([i]);
      });
      const linha = T.h(
        'div',
        { class: ['capacidade-elo', elo.abaixo ? 'abaixo' : 'folga'], tabindex: 0 },
        T.h(
          'div',
          { class: 'capacidade-cab' },
          T.h('span', { class: 'capacidade-nome' }, elo.elo),
          T.h(
            'span',
            { class: 'capacidade-situacao' },
            T.carimbo(elo.abaixo ? 'vermelho' : 'verde', elo.abaixo ? `${T.fmt.x(multiplicador)} abaixo do menor cenário` : 'aguenta os três', true)
          )
        ),
        T.h('p', { class: 'capacidade-teto-rotulo' }, T.h('b', { class: 'tab' }, T.fmt.n(elo.teto)), ` teto provado · ${elo.quando}`),
        T.h(
          'div',
          { class: 'capacidade-trilho' },
          T.h('span', { class: 'capacidade-teto', style: { '--p': pct(elo.teto) } }),
          elo.exige.map((v, i) => T.h('span', { class: ['capacidade-exige', elo.conferencia && i === 2 ? 'conferir' : null], style: { '--p': pct(v) } }))
        ),
        T.h(
          'div',
          { class: 'capacidade-rotulos', 'aria-hidden': 'true' },
          grupos.map((g) => {
            const p = pctN(elo.exige[g[0]]);
            const lado = p < 10 ? 'esq' : p > 86 ? 'dir' : 'meio';
            return T.h(
              'span',
              { class: ['capacidade-exige-rotulo', `lado-${lado}`], style: { '--p': `${p}%` } },
              T.h('b', { class: 'tab' }, g.map((i) => T.fmt.compacto(elo.exige[i])).join(' · ')),
              T.h('small', null, g.length > 1 ? `cenários ${g.map((i) => o.cenarios[i]).join(' · ')}` : `cenário ${o.cenarios[g[0]]}`)
            );
          })
        )
      );
      T.dica.ligar(linha, () =>
        T.dica.bloco(
          [
            { valor: T.fmt.n(elo.teto), rotulo: `teto provado (${elo.quando})`, cor: 'var(--eletrico)', forma: 'barra' },
            ...elo.exige.map((v, i) => ({ valor: T.fmt.n(v), rotulo: `exigido/dia · ${o.cenarios[i]}`, cor: 'var(--agir)', forma: 'linha' })),
          ],
          elo.elo
        )
      );
      lista.appendChild(linha);
    }
    el.appendChild(lista);
    return lista;
  };
})();
