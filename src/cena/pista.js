(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const f = T.fmt;
  const cena = (T.cena = T.cena || {});

  const kitMinimo = () => {
    const m = L.pilotos && L.pilotos.metaFaseA;
    if (Array.isArray(m) && m.length) return m[0];
    if (m && typeof m === 'object' && typeof m.min === 'number') return m.min;
    return 700;
  };

  function marcos() {
    const M = L.meta.marcos || {};
    const sim = Array.isArray(M.simulado) && M.simulado.length ? M.simulado : [];
    const simAte = sim[sim.length - 1];
    const lista = [
      M.redistribuir ? { d: M.redistribuir, rotulo: f.data(M.redistribuir), curto: f.data(M.redistribuir), nome: 'sem dono = 0 · coleta · compra', idx: 0, linha: 0, linhaCompacta: 0 } : null,
      sim.length
        ? { d: sim[0], ate: simAte, rotulo: sim.length > 1 ? `${sim[0].slice(8, 10)}–${f.data(simAte)}` : f.data(sim[0]), curto: sim.length > 1 ? `${sim[0].slice(8, 10)}–${simAte.slice(8, 10)}` : f.data(sim[0]), nome: 'simulado de surto', idx: 2, janela: sim.length > 1, linha: 1, linhaCompacta: 1 }
        : null,
      M.kit ? { d: M.kit, rotulo: f.data(M.kit), curto: f.data(M.kit), nome: `kit ≥${f.n(kitMinimo())} · rodada com prazo`, idx: 1, linha: 0, linhaCompacta: 2 } : null,
      { d: L.meta.d7, rotulo: `${f.data(L.meta.d7)} · D-7`, curto: 'D-7', nome: 'material posicionado', idx: 3, forte: true, linha: 1, linhaCompacta: 0 },
      { d: L.meta.diaD, rotulo: `${f.data(L.meta.diaD)} · Dia D`, curto: 'Dia D', nome: `adesões fecham ${L.meta.encerramento}`, dia: true, linha: 0, linhaCompacta: 1 },
    ];
    return lista.filter(Boolean);
  }

  cena.pista = function (host, opts = {}) {
    return T.graf.montar(host, (alvo, W) => {
      const compacta = W < 720;
      const H = compacta ? 160 : 176;
      const m = { l: compacta ? 12 : 24, r: compacta ? 12 : 36 };
      const inicio = T.dados.diaMedido();
      const fim = L.meta.diaD;
      const dias = T.intervalo(inicio, fim);
      const larg = W - m.l - m.r;
      const passo = larg / (dias.length - 1);
      const x = (d) => m.l + T.diasEntre(inicio, d) * passo;
      const yLuz = compacta ? 102 : 104;
      const hoje = T.estado.hoje.iso;
      const fase = (d) => L.fases.find((fz) => d >= fz.inicio && d <= fz.fim);
      const MARCOS = marcos();
      const nomesMarcos = MARCOS.map((mk) => (mk.ate && mk.ate !== mk.d ? `${f.data(mk.d)} a ${f.data(mk.ate)}` : f.data(mk.d)));
      const svg = T.s('svg', {
        width: W,
        height: H,
        viewBox: `0 0 ${W} ${H}`,
        class: 'pista',
        role: 'img',
        'aria-label': `Pista até o Dia D: ${T.diasEntre(hoje, fim)} dias a partir de hoje; marcos em ${nomesMarcos.slice(0, -1).join(', ')} e ${nomesMarcos[nomesMarcos.length - 1]}.`,
      });

      for (const fz of L.fases) {
        const xa = x(fz.inicio) - passo / 2;
        const xb = x(fz.fim) + passo / 2;
        svg.appendChild(T.s('rect', { x: xa, y: yLuz - 22, width: xb - xa, height: 44, rx: 4, class: `pista-fase f${fz.id}` }));
        if (fz.id === 'C') {
          if (!compacta) svg.appendChild(T.s('text', { x: (xa + xb) / 2, y: yLuz + 38, class: 'pista-fase-rotulo', 'text-anchor': 'middle' }, 'Dia D'));
        }
        else svg.appendChild(T.s('text', { x: xa + 8, y: yLuz + 38, class: 'pista-fase-rotulo' }, compacta ? `Fase ${fz.id}` : `Fase ${fz.id} · ${fz.nome}${fz.id === 'A' ? ' · 20% do resultado' : ' · 80% com o Dia D'}`));
      }
      const faseB = L.fases.find((fz) => fz.id === 'B');
      const xc0 = x(faseB ? faseB.inicio : T.isoSomar(fim, -6)) - passo / 2;
      const xc1 = x(fim) + passo / 2;
      svg.appendChild(T.s('rect', { x: xc0, y: yLuz + 46, width: xc1 - xc0, height: 8, class: 'pista-congelamento' }));
      if (!compacta) svg.appendChild(T.s('text', { x: xc1, y: yLuz + 68, class: 'pista-congelamento-rotulo', 'text-anchor': 'end' }, 'congelamento: nada entra em produção'));

      svg.appendChild(T.s('line', { x1: m.l - 6, x2: W - m.r + 6, y1: yLuz, y2: yLuz, class: 'pista-eixo' }));

      const pr = L.premissa2080 || {};
      const areaA = typeof pr.pctPorDiaAntes === 'number' ? pr.pctPorDiaAntes : 20 / 15;
      const areaUltima = typeof pr.pctPorDiaUltimaSemana === 'number' ? pr.pctPorDiaUltimaSemana : 80 / 7;
      const rBase = compacta ? 2.4 : 3.2;
      dias.forEach((d) => {
        const fz = fase(d);
        const peso = fz ? (fz.id === 'A' ? areaA : areaUltima) : 0;
        const r = fz ? rBase * Math.sqrt(peso / areaA) : 2;
        const passado = d < hoje;
        const c = T.s('circle', {
          cx: x(d),
          cy: yLuz,
          r,
          class: ['pista-luz', fz ? `f${fz.id}` : 'retrato', passado ? 'passado' : null, d === hoje ? 'hoje' : null],
          tabindex: opts.focavel ? 0 : null,
        });
        T.dica.ligar(c, () =>
          T.dica.bloco(
            [
              fz ? { valor: `${f.nFlex(peso, 1)}%`, rotulo: 'do resultado por dia (premissa 20/80)', cor: 'var(--eletrico)', forma: 'ponto' } : { valor: 'retrato', rotulo: 'dia em que o livro foi medido (incompleto)', cor: 'var(--parcial)', forma: 'ponto' },
              { valor: d === hoje ? 'hoje' : d < hoje ? `há ${T.diasEntre(d, hoje)} d` : `em ${T.diasEntre(hoje, d)} d`, rotulo: fz ? `Fase ${fz.id} · ${fz.nome}` : 'antes da Fase A', cor: 'var(--tinta-3)', forma: 'ponto' },
            ],
            `${f.diaSemana(d)} ${f.data(d)}`
          )
        );
        svg.appendChild(c);
      });

      const yBandeira = compacta ? 16 : 22;
      MARCOS.forEach((mk) => {
        const xa = x(mk.d);
        const g = T.s('g', { class: ['pista-marco', mk.forte ? 'forte' : null, mk.dia ? 'dia-d' : null, mk.janela ? 'janela' : null], tabindex: 0, role: 'button', 'aria-label': `${mk.rotulo}: ${mk.nome}` });
        if (mk.janela) {
          const xb = x(mk.ate);
          g.appendChild(T.s('rect', { x: xa - 3, y: yLuz - 30, width: xb - xa + 6, height: 60, rx: 5, class: 'pista-janela' }));
        }
        const yTexto = compacta ? yBandeira + mk.linhaCompacta * 15 : yBandeira + (mk.linha === 1 ? 34 : 0);
        g.appendChild(T.s('line', { x1: xa, x2: xa, y1: yTexto + (compacta ? 5 : 20), y2: yLuz - 12, class: 'pista-haste' }));
        const ancora = mk.dia ? 'end' : compacta ? 'middle' : 'start';
        const tx = mk.dia ? xa + 6 : compacta ? xa : xa - 4;
        g.appendChild(T.s('text', { x: tx, y: yTexto, class: 'pista-marco-data', 'text-anchor': ancora }, compacta ? mk.curto : mk.rotulo));
        if (!compacta) g.appendChild(T.s('text', { x: tx, y: yTexto + 14, class: 'pista-marco-nome', 'text-anchor': ancora }, mk.nome));
        const plano = mk.idx !== undefined && L.fechamento && L.fechamento.plano ? L.fechamento.plano[mk.idx] : null;
        T.dica.ligar(g, () =>
          T.dica.bloco(
            plano
              ? plano.oque.slice(0, 5).map((o) => ({ valor: '·', rotulo: o, cor: 'var(--ciano)', forma: 'ponto' }))
              : [{ valor: `${T.diasEntre(hoje, mk.d)} d`, rotulo: 'a partir de hoje', cor: 'var(--ciano)', forma: 'ponto' }],
            `${mk.rotulo} · ${mk.nome}`
          )
        );
        g.addEventListener('click', () => (location.hash = '#/plano?alvo=pista'));
        svg.appendChild(g);
      });

      if (hoje >= inicio && hoje <= fim) {
        const xh = x(hoje);
        svg.appendChild(T.s('line', { x1: xh, x2: xh, y1: yLuz - 34, y2: yLuz + 26, class: 'pista-hoje' }));
        svg.appendChild(T.s('text', { x: xh, y: yLuz - 38, class: 'pista-hoje-rotulo', 'text-anchor': 'middle' }, `hoje ${f.data(hoje)}`));
      }
      alvo.appendChild(svg);
    });
  };
})();
