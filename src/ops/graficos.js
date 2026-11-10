/* OPS Intelligence · gráficos da Visão Executiva (SVG/HTML, sem biblioteca).
   Regras: uma escala por gráfico (nunca dois eixos), cor segue o canal e nunca a posição,
   traços finos, grade discreta, tooltip com todas as séries no ponto, legenda clicável,
   animação curta que respeita "reduzir movimento", e tabela gêmea para quem não vê o gráfico. */
(function () {
  'use strict';
  const T = window.T;
  const f = T.fmt;
  const O = (T.ops = T.ops || {});
  const reduzido = () => (T.mov && T.mov.reduzido) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const s = T.s;

  /** Monta e redesenha quando a largura muda (reaproveita o montador do painel). */
  const montar = (el, desenhar, opts) => T.graf.montar(el, desenhar, opts);

  function topo(max, div = 4) {
    if (!max || max <= 0) return { topo: 1, passo: 0.25 };
    return T.graf.topoRedondo(max * 1.05, div);
  }
  const dataCurta = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

  // ---------------------------------------------------------------------------
  // Linhas com crosshair, legenda clicável e lacunas onde não há dado
  // ---------------------------------------------------------------------------
  O.linhas = function (el, o) {
    const ocultas = new Set(o.ocultas || []);
    const legenda = T.h('div', { class: 'ops-legenda', role: 'group', 'aria-label': 'Séries (clique para mostrar ou esconder)' });
    const area = T.h('div', { class: 'ops-graf-area' });
    el.append(legenda, area);
    const pintarLegenda = () => {
      T.limpar(legenda);
      for (const sr of o.series) {
        legenda.appendChild(
          T.h(
            'button',
            {
              type: 'button',
              class: 'ops-legenda-item',
              'aria-pressed': String(!ocultas.has(sr.id)),
              onclick: () => {
                if (ocultas.has(sr.id)) ocultas.delete(sr.id);
                else if (o.series.length - ocultas.size > 1) ocultas.add(sr.id);
                pintarLegenda();
                desenhar(area, area.clientWidth, true);
              },
            },
            T.h('i', { class: 'ops-chave-linha', style: { '--c': sr.cor } }),
            sr.nome,
            sr.total !== undefined ? T.h('b', { class: 'tab' }, o.formato(sr.total)) : null
          )
        );
      }
    };
    const desenhar = (alvo, W, redesenho) => {
      T.limpar(alvo);
      const vis = o.series.filter((x) => !ocultas.has(x.id));
      const dias = o.series[0] ? o.series[0].pontos.map((p) => p.d) : [];
      if (!vis.length || dias.length < 1) return alvo.appendChild(T.h('p', { class: 'ops-vazio-graf' }, 'Sem dados no período.'));
      const H = o.altura || 240;
      const m = { t: 14, r: 14, b: 26, l: 46 };
      const larg = W - m.l - m.r;
      const n = Math.max(1, dias.length - 1);
      const x = (i) => m.l + (dias.length === 1 ? larg / 2 : (i / n) * larg);
      const max = Math.max(0, ...vis.flatMap((sr) => sr.pontos.map((p) => p.v ?? 0)));
      const { topo: tp, passo } = topo(max);
      const y = (v) => m.t + (1 - v / tp) * (H - m.t - m.b);
      const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'ops-svg', role: 'img', 'aria-label': o.nome || 'gráfico de linhas' });
      for (let v = 0; v <= tp + passo / 1e3; v += passo) {
        svg.appendChild(s('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: 'ops-grade' }));
        svg.appendChild(s('text', { x: m.l - 8, y: y(v) + 4, class: 'ops-eixo', 'text-anchor': 'end' }, f.compacto(v)));
      }
      const passoX = Math.max(1, Math.ceil(dias.length / Math.max(2, Math.floor(larg / 70))));
      dias.forEach((d, i) => {
        const ultimo = dias.length - 1;
        // o rótulo regular perto demais do último some, para as datas não se sobreporem
        if ((i % passoX === 0 && (i === ultimo || ultimo - i >= passoX / 2)) || i === ultimo) svg.appendChild(s('text', { x: x(i), y: H - 6, class: 'ops-eixo', 'text-anchor': i === 0 ? 'start' : i === dias.length - 1 ? 'end' : 'middle' }, dataCurta(d)));
      });
      for (const sr of vis) {
        // quebra o traço onde há null (dia sem dado ≠ zero)
        let d = '';
        let aberto = false;
        sr.pontos.forEach((p, i) => {
          if (p.v === null || p.v === undefined) {
            aberto = false;
            return;
          }
          d += `${aberto ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`;
          aberto = true;
        });
        if (o.area && vis.length === 1) {
          const pts = sr.pontos.map((p, i) => (p.v === null ? null : [x(i), y(p.v)])).filter(Boolean);
          if (pts.length > 1) {
            const id = T.uid('ga');
            svg.appendChild(s('defs', null, s('linearGradient', { id, x1: 0, x2: 0, y1: 0, y2: 1 }, s('stop', { offset: '0%', 'stop-color': sr.cor, 'stop-opacity': 0.22 }), s('stop', { offset: '100%', 'stop-color': sr.cor, 'stop-opacity': 0 }))));
            svg.appendChild(s('path', { d: `M${pts[0][0]},${y(0)}${pts.map((p) => `L${p[0]},${p[1]}`).join('')}L${pts[pts.length - 1][0]},${y(0)}Z`, fill: `url(#${id})` }));
          }
        }
        const caminho = s('path', { d, class: 'ops-linha', stroke: sr.cor });
        svg.appendChild(caminho);
        if (!redesenho && !reduzido()) {
          requestAnimationFrame(() => {
            const len = caminho.getTotalLength ? caminho.getTotalLength() : 0;
            if (!len) return;
            caminho.style.strokeDasharray = `${len}`;
            caminho.style.strokeDashoffset = `${len}`;
            caminho.getBoundingClientRect();
            caminho.style.transition = 'stroke-dashoffset 900ms cubic-bezier(.16,1,.3,1)';
            caminho.style.strokeDashoffset = '0';
          });
        }
        // último ponto marcado
        const ult = [...sr.pontos].reverse().findIndex((p) => p.v !== null && p.v !== undefined);
        if (ult >= 0) {
          const i = sr.pontos.length - 1 - ult;
          svg.appendChild(s('circle', { cx: x(i), cy: y(sr.pontos[i].v), r: 3.5, fill: sr.cor, class: 'ops-ponto-final' }));
        }
      }
      // crosshair
      const mira = s('line', { y1: m.t, y2: H - m.b, class: 'ops-mira', visibility: 'hidden' });
      const pontosMira = vis.map((sr) => s('circle', { r: 4, fill: sr.cor, class: 'ops-mira-ponto', visibility: 'hidden' }));
      svg.append(mira, ...pontosMira);
      const captura = s('rect', { x: m.l, y: m.t, width: larg, height: H - m.t - m.b, fill: 'transparent', tabindex: 0, 'aria-label': 'Explorar valores por dia (setas)' });
      svg.appendChild(captura);
      let atual = dias.length - 1;
      const mostrar = (i, cx, cy) => {
        atual = i;
        mira.setAttribute('x1', x(i));
        mira.setAttribute('x2', x(i));
        mira.setAttribute('visibility', 'visible');
        vis.forEach((sr, k) => {
          const p = sr.pontos[i];
          const c = pontosMira[k];
          if (p && p.v !== null && p.v !== undefined) {
            c.setAttribute('cx', x(i));
            c.setAttribute('cy', y(p.v));
            c.setAttribute('visibility', 'visible');
          } else c.setAttribute('visibility', 'hidden');
        });
        const linhas = vis.map((sr) => ({ cor: sr.cor, valor: sr.pontos[i] && sr.pontos[i].v !== null && sr.pontos[i].v !== undefined ? o.formato(sr.pontos[i].v) : 'sem dado', rotulo: sr.nome }));
        if (vis.length > 1) {
          const tot = vis.reduce((a, sr) => a + (sr.pontos[i] && sr.pontos[i].v ? sr.pontos[i].v : 0), 0);
          linhas.push({ valor: o.formato(tot), rotulo: 'Total' });
        }
        T.dica.mostrar(T.dica.bloco(linhas, `${f.diaSemana(dias[i])}, ${f.dataMes(dias[i])}`), cx, cy, captura);
      };
      const indice = (ev) => {
        const r = svg.getBoundingClientRect();
        const px = ((ev.clientX - r.left) / r.width) * W;
        return Math.round(T.clamp((px - m.l) / larg, 0, 1) * n);
      };
      captura.addEventListener('pointermove', (ev) => mostrar(indice(ev), ev.clientX, ev.clientY));
      captura.addEventListener('pointerleave', () => {
        mira.setAttribute('visibility', 'hidden');
        pontosMira.forEach((c) => c.setAttribute('visibility', 'hidden'));
        T.dica.esconder(captura);
      });
      captura.addEventListener('keydown', (ev) => {
        if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
        ev.preventDefault();
        const i = T.clamp(atual + (ev.key === 'ArrowRight' ? 1 : -1), 0, dias.length - 1);
        const r = svg.getBoundingClientRect();
        mostrar(i, r.left + (x(i) / W) * r.width, r.top + 20);
      });
      captura.addEventListener('blur', () => T.dica.esconder(captura));
      alvo.appendChild(svg);
    };
    pintarLegenda();
    montar(area, (alvo, W) => desenhar(alvo, W, false));
    return el;
  };

  // ---------------------------------------------------------------------------
  // Barras horizontais em HTML (origem dos leads): volume, participação e conversão
  // ---------------------------------------------------------------------------
  O.barrasH = function (el, itens, { formato = f.n, extra } = {}) {
    const max = Math.max(1, ...itens.map((i) => i.valor));
    const lista = T.h('ol', { class: 'ops-barrash' });
    itens.forEach((i, k) => {
      const li = T.h(
        'li',
        { tabindex: 0 },
        T.h('span', { class: 'ops-barrash-rotulo' }, T.h('i', { class: 'ops-chave-barra', style: { '--c': i.cor } }), i.rotulo),
        T.h('span', { class: 'ops-barrash-trilho' }, T.h('span', { class: 'ops-barrash-barra', style: { '--c': i.cor, '--w': `${(i.valor / max) * 100}%`, '--atraso': `${k * 60}ms` } })),
        T.h('span', { class: 'ops-barrash-valor tab' }, formato(i.valor)),
        extra ? T.h('span', { class: 'ops-barrash-extra tab' }, extra(i)) : null
      );
      if (i.dica) T.dica.ligar(li, () => i.dica);
      lista.appendChild(li);
    });
    el.appendChild(lista);
    return el;
  };

  // ---------------------------------------------------------------------------
  // Funil (HTML): largura em escala logarítmica, taxa de passagem e maior abandono
  // ---------------------------------------------------------------------------
  O.funil = function (el, fu) {
    const vals = fu.etapas.map((e) => e.v).filter((v) => v !== null && v > 0);
    const lmax = Math.log10(Math.max(...vals, 10));
    const lmin = Math.log10(Math.max(1, Math.min(...vals, 10)));
    const largura = (v) => (v === null ? 0 : 18 + 82 * ((Math.log10(Math.max(1, v)) - lmin) / Math.max(0.0001, lmax - lmin)));
    const lista = T.h('ol', { class: 'ops-funil' });
    fu.etapas.forEach((e, i) => {
      const li = T.h(
        'li',
        { class: ['ops-funil-etapa', e.v === null ? 'indisponivel' : null], tabindex: 0 },
        T.h('div', { class: 'ops-funil-barra', style: { '--w': `${largura(e.v)}%`, '--atraso': `${i * 90}ms` } }, T.h('b', { class: 'tab' }, e.v === null ? '—' : f.compacto(e.v))),
        T.h('div', { class: 'ops-funil-texto' }, T.h('span', null, e.nome), e.estimado && e.v !== null ? T.h('small', { class: 'ops-selo-est', title: 'Agregado de fontes diferentes: não identifica pessoas.' }, 'estimado') : null, e.v === null ? T.h('small', { class: 'ops-selo-indisp' }, 'indisponível') : null)
      );
      T.dica.ligar(li, () => T.dica.bloco([{ valor: e.v === null ? 'indisponível' : f.n(e.v), rotulo: e.nome }, ...(e.passagem !== undefined ? [{ valor: f.pct(e.passagem), rotulo: 'seguem para a próxima etapa' }] : []), { valor: '', rotulo: e.fonte }], 'Funil de captação'));
      lista.appendChild(li);
      const prox = fu.etapas[i + 1];
      if (prox) {
        const pior = fu.maiorAbandono && fu.maiorAbandono.de === e.id;
        lista.appendChild(
          T.h(
            'li',
            { class: ['ops-funil-passagem', pior ? 'pior' : null], 'aria-hidden': e.passagem === undefined ? 'true' : null },
            e.passagem === undefined ? T.h('span', null, '—') : [T.h('span', { class: 'tab' }, `${f.pct(e.passagem, e.passagem < 1 ? 2 : 1)} seguem`), pior ? T.h('em', null, T.icone('atencao'), `maior abandono: ${f.pct(e.abandono, 1)}`) : null]
          )
        );
      }
    });
    el.appendChild(lista);
    return el;
  };

  // ---------------------------------------------------------------------------
  // Pequenos múltiplos: uma métrica por bloco, cada um com sua própria escala
  // ---------------------------------------------------------------------------
  O.multiplos = function (el, blocos) {
    const grade = T.h('div', { class: 'ops-multiplos' });
    for (const b of blocos) {
      const max = Math.max(1, ...b.itens.map((i) => i.valor ?? 0));
      grade.appendChild(
        T.h(
          'div',
          { class: 'ops-multiplo' },
          T.h('h4', null, b.nome),
          b.itens.map((i) => {
            const linha = T.h(
              'div',
              { class: 'ops-multiplo-linha', tabindex: 0 },
              T.h('span', { class: 'ops-multiplo-canal' }, i.curto),
              T.h('span', { class: 'ops-multiplo-trilho' }, i.valor === null ? T.h('span', { class: 'ops-multiplo-na' }, 'n/d') : T.h('span', { class: 'ops-multiplo-barra', style: { '--c': i.cor, '--w': `${(i.valor / max) * 100}%` } })),
              T.h('span', { class: 'ops-multiplo-valor tab' }, i.valor === null ? '—' : b.formato(i.valor))
            );
            T.dica.ligar(linha, () => T.dica.bloco([{ cor: i.cor, forma: 'barra', valor: i.valor === null ? 'não informado pela API' : b.formato(i.valor), rotulo: i.nome }], b.nome));
            return linha;
          })
        )
      );
    }
    el.appendChild(grade);
    return el;
  };

  // ---------------------------------------------------------------------------
  // Mapa de calor 7 × 24 (um só matiz, claro → intenso), melhores janelas contornadas
  // ---------------------------------------------------------------------------
  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const ORDEM = [1, 2, 3, 4, 5, 6, 0];
  O.calor = function (el, mapa, melhores) {
    const max = Math.max(1, ...mapa.m.flat());
    const destaque = new Set((melhores || []).flatMap((b) => [`${b.dow}-${b.hora}`, `${b.dow}-${b.hora + 1}`]));
    const grade = T.h('div', { class: 'ops-calor', role: 'grid', 'aria-label': 'Atividade por dia da semana e hora' });
    grade.appendChild(T.h('span', { class: 'ops-calor-canto' }));
    for (let h = 0; h < 24; h++) grade.appendChild(T.h('span', { class: 'ops-calor-hora' }, h % 3 === 0 ? `${h}h` : ''));
    for (const d of ORDEM) {
      grade.appendChild(T.h('span', { class: 'ops-calor-dia' }, DIAS[d]));
      for (let h = 0; h < 24; h++) {
        const v = mapa.m[d][h];
        const c = T.h('span', { class: ['ops-calor-cel', destaque.has(`${d}-${h}`) ? 'melhor' : null], role: 'gridcell', tabindex: -1, style: { '--a': v ? (0.12 + 0.88 * (v / max)).toFixed(3) : 0 } });
        T.dica.ligar(c, () => T.dica.bloco([{ valor: f.n(v), rotulo: 'interações e mensagens' }], `${DIAS[d]} · ${h}h–${h + 1}h`));
        grade.appendChild(c);
      }
    }
    el.append(
      grade,
      T.h('div', { class: 'ops-calor-escala', 'aria-hidden': 'true' }, T.h('span', null, 'menos'), T.h('i'), T.h('span', null, 'mais'), melhores && melhores.length ? T.h('span', { class: 'ops-calor-chave-melhor' }, 'melhores janelas') : null)
    );
    return el;
  };

  // ---------------------------------------------------------------------------
  // Colunas empilhadas por canal (conversões ao longo do tempo), agregadas por semana se o período for longo
  // ---------------------------------------------------------------------------
  O.empilhadas = function (el, { dias, series, formato = f.n }) {
    const semanal = dias.length > 45;
    const grupos = [];
    if (semanal) for (let i = 0; i < dias.length; i += 7) grupos.push(dias.slice(i, i + 7));
    else dias.forEach((d) => grupos.push([d]));
    const valores = grupos.map((g) => series.map((sr) => g.reduce((s0, d) => s0 + (sr.porDia.get(d) || 0), 0)));
    const legenda = T.h('div', { class: 'ops-legenda' }, series.map((sr) => T.h('span', { class: 'ops-legenda-item estatico' }, T.h('i', { class: 'ops-chave-barra', style: { '--c': sr.cor } }), sr.nome)));
    const area = T.h('div', { class: 'ops-graf-area' });
    el.append(legenda, area);
    montar(area, (alvo, W) => {
      const H = 200;
      const m = { t: 10, r: 8, b: 24, l: 40 };
      const larg = W - m.l - m.r;
      const tot = valores.map((v) => v.reduce((a, b) => a + b, 0));
      const { topo: tp, passo } = topo(Math.max(1, ...tot));
      const y = (v) => m.t + (1 - v / tp) * (H - m.t - m.b);
      const bw = larg / grupos.length;
      const gap = Math.min(4, bw * 0.25);
      const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'ops-svg', role: 'img', 'aria-label': 'Conversões por canal ao longo do tempo' });
      for (let v = 0; v <= tp + passo / 1e3; v += passo) {
        svg.appendChild(s('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: 'ops-grade' }));
        svg.appendChild(s('text', { x: m.l - 8, y: y(v) + 4, class: 'ops-eixo', 'text-anchor': 'end' }, f.compacto(v)));
      }
      const passoX = Math.max(1, Math.ceil(grupos.length / Math.max(2, Math.floor(larg / 64))));
      grupos.forEach((g, i) => {
        const x0 = m.l + i * bw + gap / 2;
        let base = 0;
        const col = s('g', { class: 'ops-coluna', tabindex: 0 });
        series.forEach((sr, k) => {
          const v = valores[i][k];
          if (!v) return;
          const y1 = y(base + v);
          const y0 = y(base);
          // 2px de superfície entre segmentos
          col.appendChild(s('rect', { x: x0, y: y1 + (base ? 1 : 0), width: Math.max(1, bw - gap), height: Math.max(0.5, y0 - y1 - (base ? 2 : 0)), rx: base ? 0 : 0, fill: sr.cor }));
          base += v;
        });
        col.appendChild(s('rect', { x: m.l + i * bw, y: m.t, width: bw, height: H - m.t - m.b, fill: 'transparent' }));
        T.dica.ligar(col, () => T.dica.bloco([...series.map((sr, k) => ({ cor: sr.cor, forma: 'barra', valor: formato(valores[i][k]), rotulo: sr.nome })), { valor: formato(tot[i]), rotulo: 'Total' }], semanal ? `Semana de ${f.dataMes(g[0])}` : `${f.diaSemana(g[0])}, ${f.dataMes(g[0])}`));
        svg.appendChild(col);
        if (i % passoX === 0) svg.appendChild(s('text', { x: x0 + (bw - gap) / 2, y: H - 6, class: 'ops-eixo', 'text-anchor': 'middle' }, dataCurta(g[0])));
      });
      alvo.appendChild(svg);
    });
    return el;
  };

  // ---------------------------------------------------------------------------
  // Sparkline (cartões de KPI)
  // ---------------------------------------------------------------------------
  O.spark = function (pontos, cor) {
    const vs = pontos.map((p) => p.v);
    const validos = vs.filter((v) => v !== null && v !== undefined);
    if (validos.length < 2) return null;
    const w = 120;
    const h = 34;
    const max = Math.max(...validos);
    const min = Math.min(...validos, 0);
    const x = (i) => (i / Math.max(1, vs.length - 1)) * w;
    const y = (v) => h - 3 - ((v - min) / (max - min || 1)) * (h - 6);
    let d = '';
    let ab = false;
    vs.forEach((v, i) => {
      if (v === null || v === undefined) return (ab = false);
      d += `${ab ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      ab = true;
    });
    return s('svg', { class: 'ops-spark', viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' }, s('path', { d, fill: 'none', stroke: cor, 'stroke-width': 1.8, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' }));
  };

  /** Tabela gêmea (acessível) para qualquer gráfico. */
  O.tabela = function (colunas, linhas, legendaTxt) {
    return T.h(
      'details',
      { class: 'ops-tabela-gemea' },
      T.h('summary', null, T.icone('tabela'), 'Ver em tabela'),
      T.h('div', { class: 'ops-tabela-rola' }, T.h('table', null, legendaTxt ? T.h('caption', null, legendaTxt) : null, T.h('thead', null, T.h('tr', null, colunas.map((c) => T.h('th', { scope: 'col' }, c)))), T.h('tbody', null, linhas.map((l) => T.h('tr', null, l.map((c) => T.h('td', null, c)))))))
    );
  };

})();
