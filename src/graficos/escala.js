(function () {
  'use strict';
  const T = window.T;
  const G = (T.graf = T.graf || {});

  G.linear = function (d0, d1, r0, r1) {
    const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
    const f = (v) => r0 + (v - d0) * k;
    f.inv = (p) => d0 + (p - r0) / (k || 1);
    f.dominio = [d0, d1];
    return f;
  };

  G.topoRedondo = function (max, divisoes = 4) {
    if (max <= 0) return { topo: 1, passo: 0.25 };
    const bruto = max / divisoes;
    const pot = Math.pow(10, Math.floor(Math.log10(bruto)));
    const n = bruto / pot;
    const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    const passo = m * pot;
    return { topo: Math.ceil(max / passo) * passo, passo };
  };
  G.marcas = function (topo, passo) {
    const out = [];
    for (let v = 0; v <= topo + passo / 1000; v += passo) out.push(+v.toFixed(6));
    return out;
  };

  G.montar = function (el, desenhar, opts = {}) {
    let ultimaLargura = 0;
    let pendente = false;
    const larguraMin = opts.larguraMin || 0;
    let primeira = true;
    G.vida(el);
    const render = () => {
      pendente = false;
      const disponivel = Math.floor(el.clientWidth);
      if (!disponivel) return;
      const w = Math.max(disponivel, larguraMin);
      if (Math.abs(w - ultimaLargura) < 4) return;
      ultimaLargura = w;
      el.classList.toggle('graf-rola', w > disponivel);
      el.classList.toggle('graf-primeira', primeira && !el.closest('.pagina.remontada'));
      primeira = false;
      T.limpar(el);
      desenhar(el, w);
      T.numerosNaLeitura(el);
    };
    const ro = new ResizeObserver(() => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(render);
    });
    ro.observe(el);
    requestAnimationFrame(render);
    return el;
  };

  let obsVida = null;
  G.vida = function (el) {
    if (T.mov.reduzido || !('IntersectionObserver' in window)) return el;
    obsVida = obsVida || new IntersectionObserver((ents) => ents.forEach((e) => e.target.classList.toggle('graf-visivel', e.isIntersecting)), { rootMargin: '80px' });
    obsVida.observe(el);
    return el;
  };
  G.pararVida = () => obsVida && obsVida.disconnect();

  G.defsDe = function (svg) {
    let d = svg.querySelector(':scope > defs');
    if (!d) {
      d = T.s('defs');
      svg.insertBefore(d, svg.firstChild);
    }
    return d;
  };
  G.degrade = function (svg, cor, opts = {}) {
    svg._degrades = svg._degrades || new Map();
    const de = opts.de ?? 1;
    const ate = opts.ate ?? 0.42;
    const chave = `${cor}|${de}|${ate}`;
    if (svg._degrades.has(chave)) return svg._degrades.get(chave);
    const id = T.uid('gd');
    G.defsDe(svg).appendChild(
      T.s(
        'linearGradient',
        { id, x1: 0, y1: 0, x2: 0, y2: 1 },
        T.s('stop', { offset: 0, style: { stopColor: cor, stopOpacity: de } }),
        T.s('stop', { offset: 1, style: { stopColor: cor, stopOpacity: ate } })
      )
    );
    const url = `url(#${id})`;
    svg._degrades.set(chave, url);
    return url;
  };
  G.varredura = function (svg, g, x0, y0, largura, altura) {
    const id = T.uid('gv');
    G.defsDe(svg).appendChild(
      T.s(
        'linearGradient',
        { id, x1: 0, y1: 0, x2: 1, y2: 0 },
        T.s('stop', { offset: 0, style: { stopColor: '#7db0ff', stopOpacity: 0 } }),
        T.s('stop', { offset: 0.7, style: { stopColor: '#7db0ff', stopOpacity: 0.1 } }),
        T.s('stop', { offset: 1, style: { stopColor: '#bcd6ff', stopOpacity: 0.22 } })
      )
    );
    g.appendChild(T.s('rect', { x: x0 - 70, y: y0, width: 70, height: altura, fill: `url(#${id})`, class: 'graf-varredura', style: { '--dist': `${largura + 70}px` } }));
  };

  G.svg = (w, h, attrs = {}) => T.s('svg', { width: w, height: h, viewBox: `0 0 ${w} ${h}`, class: 'graf-svg', role: 'img', ...attrs });

  G.eixoY = function (g, esc, marcas, x0, x1, formato, lado = 'esq') {
    for (const v of marcas) {
      const y = Math.round(esc(v)) + 0.5;
      g.appendChild(T.s('line', { x1: x0, x2: x1, y1: y, y2: y, class: v === 0 ? 'graf-base' : 'graf-grade' }));
      g.appendChild(
        T.s('text', { x: lado === 'esq' ? x0 - 8 : x1 + 8, y: y + 4, class: 'graf-tick', 'text-anchor': lado === 'esq' ? 'end' : 'start' }, formato(v))
      );
    }
  };

  G.eixoDatas = function (g, dias, xDe, y, larguraUtil, opts = {}) {
    const passoMin = opts.passoMin || 46;
    const n = dias.length;
    const cada = Math.max(1, Math.ceil(passoMin / (larguraUtil / Math.max(1, n))));
    const xUltimo = xDe(dias[n - 1]);
    dias.forEach((d, i) => {
      const ultimo = i === n - 1;
      if (!ultimo && (i % cada !== 0 || xUltimo - xDe(d) < passoMin * 0.92)) return;
      g.appendChild(T.s('text', { x: xDe(d), y, class: 'graf-tick', 'text-anchor': 'middle' }, T.fmt.data(d)));
    });
  };

  G.rotuloLeitura = (viva) => (T.vivo && T.vivo.ativo && !viva ? `Leitura do livro (${T.vivo.dataLivro()}): ` : 'Leitura: ');

  G.painel = function (o) {
    const corpo = T.h('div', { class: 'painel-grafico' });
    const sec = T.h(
      'section',
      { class: ['painel', o.classe, o.largura ? `painel-${o.largura}` : null], id: o.id || null, 'data-revela': '' },
      T.h(
        'header',
        { class: 'painel-topo' },
        T.h('h3', { class: 'painel-titulo' }, o.titulo),
        o.estado ? T.carimbo(o.estado, o.estadoTexto) : null
      ),
      o.comoLer ? T.h('p', { class: 'painel-como' }, o.comoLer) : null,
      corpo,
      o.legenda ? G.legenda(o.legenda) : null,
      o.leitura ? T.h('p', { class: 'painel-leitura', 'data-leitura': T.vivo && T.vivo.ativo && !o.leituraViva ? 'livro' : null }, T.h('b', null, G.rotuloLeitura(o.leituraViva)), o.leitura) : null,
      T.h(
        'footer',
        { class: 'painel-rodape' },
        o.p ? T.h('span', { class: 'leitura painel-pagina' }, T.icone('livro'), `p. ${[].concat(o.p).join(', ')}`) : null,
        o.nota ? T.h('span', { class: 'painel-nota' }, o.nota) : null,
        o.tabela ? G.tabelaGemea(o.tabela) : null
      )
    );
    if (o.grafico) o.grafico(corpo);
    return sec;
  };

  G.legenda = function (itens) {
    return T.h(
      'ul',
      { class: 'graf-legenda' },
      itens.map((i) =>
        T.h(
          'li',
          null,
          T.h('i', { class: 'graf-legenda-chave', 'data-forma': i.forma || 'barra', style: { '--c': i.cor } }),
          i.rotulo
        )
      )
    );
  };

  G.tabelaGemea = function (t) {
    const d = T.h('details', { class: 'tabela-gemea' });
    d.append(
      T.h('summary', null, T.icone('tabela'), 'Ver os números'),
      T.h(
        'div',
        { class: 'tabela-rolagem' },
        T.h(
          'table',
          null,
          T.h('thead', null, T.h('tr', null, t.colunas.map((c) => T.h('th', { scope: 'col' }, c)))),
          T.h('tbody', null, t.linhas.map((l) => T.h('tr', null, l.map((c, i) => (i === 0 ? T.h('th', { scope: 'row' }, c) : T.h('td', null, c))))))
        )
      )
    );
    return d;
  };
})();
