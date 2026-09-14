(function () {
  'use strict';
  const T = window.T;
  const G = T.graf;

  G.linhas = function (el, o) {
    const larguraMin = o.larguraMin ?? ((o.margemDir ?? 118) >= 100 ? 620 : 0);
    return G.montar(el, (alvo, W) => {
      const H = o.altura || 260;
      const m = { t: o.margemTopo || 22, r: o.margemDir ?? 118, b: 28, l: o.margemEsq || 50 };
      const x0 = o.x0;
      const x1 = o.x1;
      const nDias = T.diasEntre(x0, x1);
      const larg = W - m.l - m.r;
      const x = (d) => m.l + (T.diasEntre(x0, d) / nDias) * larg;
      const maxDado = Math.max(...o.series.flatMap((s) => s.pontos.map((p) => p.v)), ...(o.referencias || []).map((r) => r.v));
      let topo;
      let passo;
      let yMin = 0;
      if (o.yMin) {
        const alto = o.yMax || maxDado * 1.02;
        ({ passo } = G.topoRedondo(alto - o.yMin, o.divisoes || 4));
        yMin = Math.floor(o.yMin / passo) * passo;
        topo = yMin + Math.ceil((alto - yMin) / passo) * passo;
      } else ({ topo, passo } = G.topoRedondo(o.yMax || maxDado * 1.04, o.divisoes || 4));
      const y = G.linear(yMin, topo, H - m.b, m.t);
      const svg = G.svg(W, H, { 'aria-label': o.nome || 'gráfico de linhas' });
      const g = T.s('g');
      svg.appendChild(g);

      for (const fx of o.faixas || []) {
        const xa = x(fx.de);
        const xb = x(fx.ate);
        g.appendChild(T.s('rect', { x: xa, y: m.t, width: Math.max(1, xb - xa), height: H - m.b - m.t, class: `graf-faixa ${fx.classe || ''}` }));
        if (fx.rotulo) g.appendChild(T.s('text', { x: xa + 6, y: fx.rotuloTopo ? m.t + 20 : H - m.b - 8, class: 'graf-faixa-rotulo' }, fx.rotulo));
      }

      const marcas = [];
      for (let v = yMin; v <= topo + passo / 1000; v += passo) marcas.push(+v.toFixed(6));
      G.eixoY(g, y, marcas, m.l, W - m.r, o.formatoEixo || T.fmt.compacto);

      const dias = T.intervalo(x0, x1);
      G.eixoDatas(g, dias, x, H - 8, larg, { passoMin: o.passoDatas || 54 });

      for (const r of o.referencias || []) {
        const yy = Math.round(y(r.v)) + 0.5;
        g.appendChild(T.s('line', { x1: m.l, x2: W - m.r, y1: yy, y2: yy, class: 'graf-ref', stroke: r.cor || 'var(--referencia)', 'stroke-dasharray': '6 5' }));
        g.appendChild(T.s('text', { x: m.l + 6, y: yy - 6, class: 'graf-ref-rotulo' }, r.rotulo));
      }

      for (const mk of o.marcadores || []) {
        if (mk.d < x0 || mk.d > x1) continue;
        const xx = Math.round(x(mk.d)) + 0.5;
        g.appendChild(T.s('line', { x1: xx, x2: xx, y1: m.t - 6, y2: H - m.b, class: ['graf-evento', mk.classe] }));
        g.appendChild(T.s('text', { x: xx + 5, y: m.t + 4, class: ['graf-evento-rotulo', mk.classe] }, mk.rotulo));
      }

      const camada = T.s('g', { class: 'graf-series' });
      g.appendChild(camada);
      const fins = [];
      for (const s of o.series) {
        const pts = s.pontos.filter((p) => p.d >= x0 && p.d <= x1 && p.v !== null && p.v !== undefined);
        if (!pts.length) continue;
        const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.d).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
        if (s.area || (o.series.length === 1 && !s.tracejado && s.area !== false)) {
          const base = y(yMin);
          camada.appendChild(T.s('path', { d: `${d}L${x(pts.at(-1).d).toFixed(1)},${base}L${x(pts[0].d).toFixed(1)},${base}Z`, fill: G.degrade(svg, s.cor, { de: 0.3, ate: 0 }), class: 'graf-area' }));
        }
        if (!s.tracejado && !s.fino) camada.appendChild(T.s('path', { d, class: 'graf-linha-sombra desenha', pathLength: 1 }));
        camada.appendChild(
          T.s('path', {
            d,
            class: ['graf-linha', s.classe, s.tracejado ? null : 'desenha'],
            pathLength: s.tracejado ? null : 1,
            stroke: s.cor,
            'stroke-width': s.largura || 2,
            'stroke-dasharray': s.tracejado ? '6 5' : null,
            opacity: s.opacidade || null,
          })
        );
        if (s.pontoFim !== false) {
          const u = pts.at(-1);
          if (!s.tracejado) camada.appendChild(T.s('circle', { cx: x(u.d), cy: y(u.v), r: 4, class: 'graf-pulso', style: { '--c': s.cor } }));
          camada.appendChild(T.s('circle', { cx: x(u.d), cy: y(u.v), r: 4, fill: s.cor, class: 'graf-ponto' }));
        }
        if (s.rotuloFim) fins.push({ y: y(pts.at(-1).v), x: x(pts.at(-1).d), s });
      }

      fins.sort((a, b) => a.y - b.y);
      const minGap = 30;
      const yTopo = m.t + 8;
      const yPe = H - m.b - 14;
      fins.forEach((fim, i) => {
        fim.yRot = Math.max(fim.y, yTopo, i ? fins[i - 1].yRot + minGap : -Infinity);
      });
      for (let i = fins.length - 1; i >= 0; i--) {
        const limite = i === fins.length - 1 ? yPe : fins[i + 1].yRot - minGap;
        if (fins[i].yRot > limite) fins[i].yRot = limite;
      }
      for (const fim of fins) {
        const yr = fim.yRot;
        if (Math.abs(yr - fim.y) > 2) g.appendChild(T.s('path', { d: `M${fim.x + 6},${fim.y}L${fim.x + 14},${yr}`, class: 'graf-guia' }));
        const t = T.s('text', { x: fim.x + 16, y: yr - 2, class: 'graf-fim' });
        t.appendChild(T.s('tspan', { class: 'graf-fim-valor', x: fim.x + 16 }, fim.s.valorFim || (o.formato || T.fmt.n)(fim.s.pontos.at(-1).v)));
        t.appendChild(T.s('tspan', { class: 'graf-fim-nome', x: fim.x + 16, dy: 13 }, fim.s.nome));
        g.appendChild(t);
      }

      G.varredura(svg, g, m.l, m.t, larg, H - m.b - m.t);

      const cursor = T.s('line', { class: 'graf-cursor', y1: m.t, y2: H - m.b, x1: -10, x2: -10 });
      g.appendChild(cursor);
      const toque = T.s('rect', { x: m.l, y: m.t, width: larg, height: H - m.b - m.t, fill: 'transparent', class: 'graf-toque-area' });
      svg.appendChild(toque);
      const achar = (e) => {
        const r = svg.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * W;
        const k = T.clamp(Math.round(((px - m.l) / larg) * nDias), 0, nDias);
        return T.isoSomar(x0, k);
      };
      const mostrar = (e) => {
        const d = achar(e);
        const xx = Math.round(x(d)) + 0.5;
        cursor.setAttribute('x1', xx);
        cursor.setAttribute('x2', xx);
        const linhas = [];
        for (const s of o.series) {
          const p = s.pontos.find((q) => q.d === d);
          if (p && p.v !== null && p.v !== undefined) linhas.push({ valor: (o.formatoDica || o.formato || T.fmt.n)(p.v), rotulo: s.nome, cor: s.cor, forma: 'linha' });
        }
        if (!linhas.length) {
          T.dica.esconder();
          return;
        }
        T.dica.mostrar(T.dica.bloco(linhas, `${T.fmt.diaSemana(d)} ${T.fmt.data(d)}`), e.clientX, e.clientY, toque);
      };
      toque.addEventListener('pointerenter', mostrar);
      toque.addEventListener('pointermove', mostrar);
      toque.addEventListener('pointerleave', () => {
        cursor.setAttribute('x1', -10);
        cursor.setAttribute('x2', -10);
        T.dica.esconder(toque);
      });
      alvo.appendChild(svg);
    }, { larguraMin });
  };

  G.pequenos = function (el, o) {
    const grade = T.h('div', { class: 'pequenos', style: { '--colunas': o.colunas || 3 } });
    const yMax = o.yMax || Math.max(...o.quadros.flatMap((q) => q.pontos.map((p) => p.v))) * 1.05;
    for (const q of o.quadros) {
      const corpo = T.h('div', { class: 'pequeno-corpo' });
      grade.appendChild(
        T.h(
          'figure',
          { class: 'pequeno' },
          T.h('figcaption', null, T.h('span', { class: 'pequeno-nome' }, q.titulo), q.resumo ? T.h('b', { class: 'pequeno-resumo' }, q.resumo) : null),
          corpo
        )
      );
      if (o.tipo === 'barras') {
        G.barrasDia(corpo, { serie: q.pontos, altura: o.altura || 120, yMax, cor: () => q.cor || 'var(--eletrico)', nome: q.titulo, margemEsq: 34, divisoes: 2, passoDatas: 60, referencias: q.referencias });
      } else {
        G.linhas(corpo, {
          series: [{ nome: q.titulo, pontos: q.pontos, cor: q.cor || 'var(--eletrico)', area: true }],
          x0: q.pontos[0].d,
          x1: q.pontos.at(-1).d,
          yMax,
          altura: o.altura || 120,
          margemDir: 12,
          margemEsq: 38,
          divisoes: 2,
          passoDatas: 70,
          nome: q.titulo,
        });
      }
    }
    el.appendChild(grade);
    return grade;
  };
})();
