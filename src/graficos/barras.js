(function () {
  'use strict';
  const T = window.T;
  const G = T.graf;

  function caminhoBarra(x, y, w, h, raio = 4) {
    if (h <= 0.5) return `M${x},${y + h}h${w}`;
    const r = Math.min(raio, w / 2, h);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  G.caminhoBarra = caminhoBarra;

  G.barrasDia = function (el, o) {
    return G.montar(el, (alvo, W) => {
      const H = o.altura || 220;
      const m = { t: 18, r: o.margemDir || 12, b: 26, l: o.margemEsq || 44 };
      const serie = o.serie;
      const dias = serie.map((p) => p.d);
      const n = dias.length;
      const larg = W - m.l - m.r;
      const passo = larg / n;
      const bw = Math.max(2, Math.min(24, passo - 2));
      const xDe = (d) => m.l + dias.indexOf(d) * passo + passo / 2;
      const maxDado = Math.max(...serie.map((p) => p.v), ...(o.linhas || []).flatMap((l) => l.pontos.map((p) => p.v)), ...(o.referencias || []).map((r) => r.v));
      const { topo, passo: passoY } = G.topoRedondo(o.yMax || maxDado * 1.06, o.divisoes || 4);
      const y = G.linear(0, topo, H - m.b, m.t);
      const svg = G.svg(W, H, { 'aria-label': o.rotuloAcessivel || o.nome || 'gráfico de barras por dia' });
      const g = T.s('g');
      svg.appendChild(g);
      G.eixoY(g, y, G.marcas(topo, passoY), m.l, W - m.r, o.formatoEixo || T.fmt.compacto);

      for (const fx of o.faixas || []) {
        const i0 = dias.indexOf(fx.de);
        const i1 = dias.indexOf(fx.ate);
        if (i0 < 0 || i1 < 0) continue;
        g.appendChild(T.s('rect', { x: m.l + i0 * passo, y: m.t, width: (i1 - i0 + 1) * passo, height: H - m.b - m.t, class: `graf-faixa ${fx.classe || ''}` }));
      }

      const cor = o.cor || (() => 'var(--eletrico)');
      const barras = T.s('g', { class: 'graf-barras' });
      g.appendChild(barras);
      serie.forEach((p, i) => {
        const x = m.l + i * passo + (passo - bw) / 2;
        const h = Math.max(0, y(0) - y(p.v));
        const c = p.parcial ? 'var(--parcial)' : cor(p, i);
        barras.appendChild(T.s('path', { d: caminhoBarra(x, y(p.v), bw, h), fill: G.degrade(svg, c), class: ['graf-barra', p.parcial ? 'parcial' : null], style: { '--i': i } }));
        if (o.rotuloSe && o.rotuloSe(p, i)) {
          g.appendChild(T.s('text', { x: x + bw / 2, y: y(p.v) - 6, class: 'graf-valor', 'text-anchor': 'middle' }, (o.formatoRotulo || T.fmt.n)(p.v)));
        }
      });

      for (const ln of o.linhas || []) {
        const pts = ln.pontos.filter((p) => dias.includes(p.d));
        if (!pts.length) continue;
        const d = pts.map((p, i) => `${i ? 'L' : 'M'}${xDe(p.d).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
        g.appendChild(T.s('path', { d, class: 'graf-linha-sombra desenha', pathLength: 1 }));
        g.appendChild(T.s('path', { d, class: 'graf-linha desenha', stroke: ln.cor, 'stroke-width': ln.largura || 2, pathLength: 1 }));
      }

      for (const r of o.referencias || []) {
        const yy = Math.round(y(r.v)) + 0.5;
        g.appendChild(T.s('line', { x1: m.l, x2: W - m.r, y1: yy, y2: yy, class: 'graf-ref', stroke: r.cor || 'var(--referencia)', 'stroke-dasharray': r.tracejada === false ? null : '5 4' }));
        const esq = r.lado === 'esq';
        g.appendChild(T.s('text', { x: esq ? m.l + 6 : W - m.r, y: yy - 6, class: 'graf-ref-rotulo', 'text-anchor': esq ? 'start' : 'end' }, r.rotulo));
      }

      for (const ev of o.eventos || []) {
        if (!dias.includes(ev.d)) continue;
        const xx = Math.round(xDe(ev.d)) + 0.5;
        g.appendChild(T.s('line', { x1: xx, x2: xx, y1: m.t - 4, y2: H - m.b, class: 'graf-evento' }));
        g.appendChild(T.s('text', { x: xx + 5, y: m.t + 6, class: 'graf-evento-rotulo' }, ev.rotulo));
      }

      G.eixoDatas(g, dias, xDe, H - 8, larg, { passoMin: o.passoDatas || 44 });
      G.varredura(svg, g, m.l, m.t, larg, H - m.b - m.t);

      const toque = T.s('g', { class: 'graf-toque' });
      svg.appendChild(toque);
      const destaque = T.s('rect', { class: 'graf-coluna-ativa', x: 0, y: m.t, width: passo, height: H - m.b - m.t, opacity: 0 });
      g.insertBefore(destaque, barras);
      serie.forEach((p, i) => {
        const hit = T.s('rect', { x: m.l + i * passo, y: m.t, width: passo, height: H - m.b - m.t, fill: 'transparent', tabindex: o.focavel ? 0 : null });
        const conteudo = () => {
          const linhas = [{ valor: (o.formatoDica || T.fmt.n)(p.v), rotulo: o.nome || 'valor', cor: p.parcial ? 'var(--parcial)' : cor(p, i), forma: 'barra' }];
          for (const ln of o.linhas || []) {
            const q = ln.pontos.find((x) => x.d === p.d);
            if (q) linhas.push({ valor: (o.formatoDica || T.fmt.n)(q.v), rotulo: ln.nome, cor: ln.cor, forma: 'linha' });
          }
          const extra = o.dicaExtra ? o.dicaExtra(p, i) : null;
          if (extra) linhas.push(...extra);
          return T.dica.bloco(linhas, `${T.fmt.diaSemana(p.d)} ${T.fmt.data(p.d)}${p.parcial ? ' · dia incompleto' : ''}`);
        };
        hit.addEventListener('pointerenter', (e) => {
          destaque.setAttribute('x', m.l + i * passo);
          destaque.setAttribute('opacity', 1);
          T.dica.mostrar(conteudo(), e.clientX, e.clientY, hit);
        });
        hit.addEventListener('pointermove', (e) => T.dica.mover(e.clientX, e.clientY));
        hit.addEventListener('pointerleave', () => {
          destaque.setAttribute('opacity', 0);
          T.dica.esconder(hit);
        });
        toque.appendChild(hit);
      });
      alvo.appendChild(svg);
    });
  };

  G.colunas = function (el, o) {
    return G.montar(el, (alvo, W) => {
      const H = o.altura || 200;
      const m = { t: 20, r: 10, b: o.margemBase || 26, l: o.semEixo ? 10 : 42 };
      const itens = o.itens;
      const n = itens.length;
      const larg = W - m.l - m.r;
      const passo = larg / n;
      const bw = Math.max(3, Math.min(o.larguraMax || 24, passo - (o.ar || 4)));
      const max = o.yMax || Math.max(...itens.map((i) => i.v)) * 1.08;
      const { topo, passo: py } = G.topoRedondo(max, 4);
      const y = G.linear(0, topo, H - m.b, m.t);
      const svg = G.svg(W, H, { 'aria-label': o.nome || 'gráfico de colunas' });
      const g = T.s('g');
      svg.appendChild(g);
      if (!o.semEixo) G.eixoY(g, y, G.marcas(topo, py), m.l, W - m.r, o.formatoEixo || T.fmt.compacto);
      else g.appendChild(T.s('line', { x1: m.l, x2: W - m.r, y1: y(0) + 0.5, y2: y(0) + 0.5, class: 'graf-base' }));
      for (const r of o.referencias || []) {
        const yy = Math.round(y(r.v)) + 0.5;
        g.appendChild(T.s('line', { x1: m.l, x2: W - m.r, y1: yy, y2: yy, class: 'graf-ref', stroke: r.cor || 'var(--referencia)', 'stroke-dasharray': '5 4' }));
        g.appendChild(T.s('text', { x: W - m.r, y: yy - 6, class: 'graf-ref-rotulo', 'text-anchor': 'end' }, r.rotulo));
      }
      const cadaRotulo = Math.max(1, Math.ceil((o.passoRotulo || 30) / passo));
      itens.forEach((it, i) => {
        const x = m.l + i * passo + (passo - bw) / 2;
        const h = Math.max(0, y(0) - y(it.v));
        const grupo = T.s('g', { class: ['graf-coluna', it.destaque ? 'destaque' : null] });
        if (it.textura) grupo.appendChild(T.s('path', { d: caminhoBarra(x, y(it.v), bw, h), class: 'graf-textura', style: { '--i': i } }));
        grupo.appendChild(T.s('path', { d: caminhoBarra(x, y(it.v), bw, h), fill: it.textura ? 'transparent' : G.degrade(svg, it.cor || 'var(--eletrico)'), class: 'graf-barra', stroke: it.textura ? 'var(--tinta-3)' : null, style: { '--i': i } }));
        if (it.rotuloValor !== false && (o.todosValores || it.destaque || it.rotuloValor)) {
          grupo.appendChild(T.s('text', { x: x + bw / 2, y: y(it.v) - 6, class: 'graf-valor', 'text-anchor': 'middle' }, it.rotuloValor || (o.formato || T.fmt.n)(it.v)));
        }
        if (i % cadaRotulo === 0 || it.forcarRotulo) grupo.appendChild(T.s('text', { x: x + bw / 2, y: H - 8, class: 'graf-tick', 'text-anchor': 'middle' }, it.rotulo));
        const hit = T.s('rect', { x: m.l + i * passo, y: m.t, width: passo, height: H - m.t, fill: 'transparent' });
        T.dica.ligar(hit, () => T.dica.bloco([{ valor: (o.formatoDica || o.formato || T.fmt.n)(it.v), rotulo: o.unidade || '', cor: it.cor || 'var(--eletrico)', forma: 'barra' }, ...(it.extra || [])], it.rotuloLongo || it.rotulo));
        hit.addEventListener('pointerenter', () => grupo.classList.add('ativa'));
        hit.addEventListener('pointerleave', () => grupo.classList.remove('ativa'));
        grupo.appendChild(hit);
        g.appendChild(grupo);
      });
      alvo.appendChild(svg);
    });
  };
})();
