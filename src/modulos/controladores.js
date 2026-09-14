(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const C = L.controladores;
  const f = T.fmt;
  const G = T.graf;
  const s = T.s;

  const nomeSvg = (nome, attrs) => s('text', attrs, s('tspan', { class: 'nome-real' }, nome), s('tspan', { class: 'nome-codigo' }, T.nomeTexto === undefined ? nome : codigoDe(nome)));
  const codigoDe = (nome) => {
    const el = T.nome(nome);
    return el.querySelector('.nome-codigo').textContent;
  };

  const ROTULO_TRIAGEM = 'Fila de triagem da Rota 20';
  const maiorSemana = () => Math.max(0, ...C.semana.lista.map((x) => x.ult7d), ...C.top20.map((c) => c.ult7d));
  const dataRodada = () => f.data(C.rodada.data);

  function rede() {
    const W = 1200;
    const H = 720;
    const HUB = { x: 600, y: 318 };
    const metades = new Map(C.metades.map((m) => [m.nome, m]));
    const maxPass = Math.max(...C.top20.map((c) => c.passageiros));
    const max7 = Math.max(1, maiorSemana());
    const decomp = (id) => L.tresNumeros.decomposicao.find((g) => g.id === id);
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'rede', role: 'group', 'aria-label': 'Mapa da rede de controladores: os 20 maiores, as carteiras sem detalhe, a fila de triagem e os órfãos.' });
    const camFios = s('g', { class: 'rede-fios' });
    const camNos = s('g', { class: 'rede-nos' });
    svg.append(camFios, camNos);

    [175, 285].forEach((r) => camFios.appendChild(s('circle', { cx: HUB.x, cy: HUB.y, r, class: 'rede-anel' })));

    const pacotes = [];
    const raio = (p) => 5 + Math.sqrt(p) * 2.1;
    C.top20.forEach((c, i) => {
      const interno = i < 10;
      const n = 10;
      const k = interno ? i : i - 10;
      const ang = -Math.PI / 2 + (k / n) * Math.PI * 2 + (interno ? 0 : Math.PI / 10);
      const R = interno ? 175 : 285;
      const x = HUB.x + Math.cos(ang) * R * 1.35;
      const y = HUB.y + Math.sin(ang) * R * 0.82;
      const r = raio(c.pilotos);
      const met = metades.get(c.nome) || C.metades.find((m) => T.mesmoNome(m.nome, c.nome));
      const tendencia = met ? met.tendencia : 'sem-serie';
      const larguraFio = 0.6 + (c.ult7d / max7) * 3.4;
      const fio = s('line', { x1: HUB.x, y1: HUB.y, x2: x, y2: y, class: ['rede-fio', c.ult7d >= 10 ? 'ativo' : 'parado'], 'stroke-width': larguraFio.toFixed(2), 'data-c': i });
      camFios.appendChild(fio);
      if (c.ult7d >= 10) pacotes.push({ x0: HUB.x, y0: HUB.y, x1: x, y1: y, fase: Math.random(), vel: 0.08 + (c.ult7d / max7) * 0.35 });

      const g = s('g', { class: ['rede-no', `t-${tendencia}`], transform: `translate(${x.toFixed(1)},${y.toFixed(1)})`, tabindex: 0, role: 'button', 'data-c': i, 'aria-label': `${c.nome}: ${c.pilotos} pilotos, ${c.produzem} produzem, ${f.n(c.passageiros)} passageiros, ${c.ult7d} na última semana.` });
      const rs = r + 7;
      for (let p = 0; p < c.pilotos; p++) {
        const a = (p / c.pilotos) * Math.PI * 2 - Math.PI / 2;
        g.appendChild(s('circle', { cx: (Math.cos(a) * rs).toFixed(1), cy: (Math.sin(a) * rs).toFixed(1), r: 1.5, class: p < c.produzem ? 'sat aceso' : 'sat' }));
      }
      g.appendChild(s('circle', { r, class: 'rede-disco', style: { '--k': (0.25 + 0.75 * (c.passageiros / maxPass)).toFixed(3) } }));
      g.appendChild(s('circle', { r: r + 2.5, class: 'rede-anel-tendencia' }));
      const noEixo = Math.abs(Math.cos(ang)) < 0.2;
      const fora = Math.cos(ang) >= 0 ? 1 : -1;
      const numTexto = `${f.n(c.passageiros)} · ${c.ult7d} em 7 d`;
      if (noEixo) {
        const acima = Math.sin(ang) < 0;
        const y1 = acima ? -(rs + 24) : rs + 18;
        g.appendChild(nomeSvg(c.nome, { x: 0, y: y1, class: 'rede-nome', 'text-anchor': 'middle' }));
        g.appendChild(s('text', { x: 0, y: y1 + 14, class: 'rede-num', 'text-anchor': 'middle' }, numTexto));
      } else {
        const lx = fora * (rs + 8);
        g.appendChild(nomeSvg(c.nome, { x: lx, y: -2, class: 'rede-nome', 'text-anchor': fora > 0 ? 'start' : 'end' }));
        g.appendChild(s('text', { x: lx, y: 12, class: 'rede-num', 'text-anchor': fora > 0 ? 'start' : 'end' }, numTexto));
      }
      camNos.appendChild(g);
      T.dica.ligar(g, () =>
        T.dica.bloco(
          [
            { valor: f.n(c.passageiros), rotulo: 'passageiros no total', cor: 'var(--eletrico)', forma: 'barra' },
            { valor: f.n(c.ult7d), rotulo: 'nos últimos 7 dias', cor: 'var(--ciano)', forma: 'linha' },
            { valor: `${c.produzem} de ${c.pilotos}`, rotulo: `pilotos produzem (${f.pct(c.produzemPct)})`, cor: 'var(--ciano)', forma: 'ponto' },
            { valor: `${c.lancaram}/${c.deHoje}`, rotulo: 'linhas lançadas na rodada', cor: 'var(--tinta-3)', forma: 'ponto' },
            { valor: met ? `${f.n(met.a)} → ${f.n(met.b)}` : '—', rotulo: met ? `1ª × 2ª metade · ${met.tendencia === 'subiu' ? 'acelerou' : met.tendencia === 'caiu' ? 'desacelerou' : 'estável'}` : 'sem série de metades no livro', cor: 'var(--tinta-3)', forma: 'ponto' },
          ],
          T.nomeTexto(c.nome)
        )
      );
      const acender = (on) => {
        fio.classList.toggle('realce', on);
        svg.classList.toggle('focando', on);
        g.classList.toggle('realce', on);
      };
      g.addEventListener('pointerenter', () => acender(true));
      g.addEventListener('pointerleave', () => acender(false));
      g.addEventListener('focus', () => acender(true));
      g.addEventListener('blur', () => acender(false));
    });

    const depD = decomp('deposito');
    const cartTriagem = C.carteiras.find((c) => c.triagem);
    const cobTriagem = C.rodada.cobertura.find((x) => x.papel && /triagem/i.test(x.papel));
    if (depD) {
      const dep = { x: 940, y: 630 };
      const respTexto = cobTriagem ? `, ${f.n(cobTriagem.resp)} ${cobTriagem.resp === 1 ? 'linha respondida' : 'linhas respondidas'} na rodada` : '';
      const depG = s('g', { class: 'rede-deposito', transform: `translate(${dep.x},${dep.y})`, tabindex: 0, role: 'button', 'aria-label': `${ROTULO_TRIAGEM}: ${f.n(depD.pilotos)} pilotos, ${f.n(depD.comPassageiro)} com passageiro${respTexto}.` });
      camFios.appendChild(s('line', { x1: HUB.x, y1: HUB.y, x2: dep.x - 70, y2: dep.y - 30, class: 'rede-fio triagem' }));
      const colunas = 42;
      const fileiras = 15;
      const nPontos = Math.min(depD.pilotos, colunas * fileiras);
      for (let p = 0; p < nPontos; p++) {
        const cx = -118 + (p % colunas) * 5.4;
        const cy = -34 + Math.floor(p / colunas) * 5.4;
        depG.appendChild(s('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: 1.5, class: p < depD.comPassageiro ? 'sat aceso' : 'sat fila' }));
      }
      depG.appendChild(s('rect', { x: -126, y: -42, width: colunas * 5.4 + 10, height: fileiras * 5.4 + 10, rx: 6, class: 'rede-risco' }));
      depG.appendChild(s('text', { x: -126, y: 62, class: 'rede-nome risco' }, ROTULO_TRIAGEM));
      const depNum = [`${f.n(depD.pilotos)} pilotos`, cartTriagem ? `${f.n(cartTriagem.passageiros)} passageiros` : null, cobTriagem ? `${f.n(cobTriagem.resp)} de ${f.n(cobTriagem.pilotos)} linhas respondidas` : null];
      depG.appendChild(s('text', { x: -126, y: 77, class: 'rede-num' }, depNum.filter(Boolean).join(' · ')));
      camNos.appendChild(depG);
      T.dica.ligar(depG, () =>
        T.dica.bloco(
          [
            { valor: f.n(depD.pilotos), rotulo: 'pilotos numa única conta', cor: 'var(--agir)', forma: 'ponto' },
            { valor: f.n(depD.comPassageiro), rotulo: 'com passageiro', cor: 'var(--ciano)', forma: 'ponto' },
            { valor: f.n(depD.meta), rotulo: `de meta na Projetada (${f.pct(depD.pct)})`, cor: 'var(--referencia)', forma: 'barra' },
            cobTriagem ? { valor: `${f.n(cobTriagem.resp)}/${f.n(cobTriagem.pilotos)}`, rotulo: 'linhas respondidas na rodada', cor: 'var(--tinta-3)', forma: 'ponto' } : null,
          ].filter(Boolean),
          'Uma fila parada, não uma equipe'
        )
      );
    }

    const orfD = decomp('orfaos');
    if (orfD) {
      const orf = { x: 170, y: 630 };
      const orfG = s('g', { class: 'rede-orfaos', transform: `translate(${orf.x},${orf.y})`, tabindex: 0, role: 'button', 'aria-label': `Órfãos: ${f.n(orfD.pilotos)} pilotos sem controlador, ${f.n(orfD.comPassageiro)} com passageiro.` });
      const nPontos = Math.min(orfD.pilotos, 80);
      for (let p = 0; p < nPontos; p++) {
        const a = p * 2.39996;
        const rr = 5 + Math.sqrt(p) * 5.2;
        orfG.appendChild(s('circle', { cx: (Math.cos(a) * rr).toFixed(1), cy: (Math.sin(a) * rr * 0.7).toFixed(1), r: 1.7, class: p < orfD.comPassageiro ? 'sat aceso' : 'sat solto' }));
      }
      orfG.appendChild(s('text', { x: -46, y: 50, class: 'rede-nome risco' }, 'Órfãos · sem controlador'));
      orfG.appendChild(s('text', { x: -46, y: 65, class: 'rede-num' }, `${f.n(orfD.pilotos)} pilotos · ${f.n(orfD.comPassageiro)} com passageiro · nenhum fio`));
      camNos.appendChild(orfG);
      T.dica.ligar(orfG, () => T.dica.bloco([{ valor: f.n(orfD.pilotos), rotulo: 'pilotos sem controlador nenhum', cor: 'var(--agir)', forma: 'ponto' }, { valor: f.n(orfD.meta), rotulo: 'de meta que ninguém cobra', cor: 'var(--referencia)', forma: 'barra' }], 'Órfãos'));
    }

    const demais = { x: 96, y: 44 };
    const pilotosTriagem = cartTriagem ? T.dados.serie('carteiras_pilotos')[C.carteiras.indexOf(cartTriagem)] : undefined;
    const nDemais = cartTriagem ? C.comPiloto - C.top20.length - cartTriagem.carteiras : null;
    const demaisPilotos = typeof pilotosTriagem === 'number' ? C.pilotosComControlador - T.soma(C.top20, (c) => c.pilotos) - pilotosTriagem : null;
    const demaisPass = cartTriagem ? C.top10Soma.deTotalComControlador - T.soma(C.top20, (c) => c.passageiros) - cartTriagem.passageiros : null;
    camFios.appendChild(s('line', { x1: HUB.x, y1: HUB.y, x2: demais.x + 30, y2: demais.y + 18, class: 'rede-fio agregado' }));
    const demaisG = s('g', { class: 'rede-demais', transform: `translate(${demais.x},${demais.y})` });
    const nAnel = Math.min(Math.max(nDemais || 0, 0), 60);
    for (let q = 0; q < nAnel; q++) {
      const a = (q / nAnel) * Math.PI * 2;
      demaisG.appendChild(s('circle', { cx: (Math.cos(a) * 34).toFixed(1), cy: (Math.sin(a) * 22).toFixed(1), r: 3, class: 'rede-demais-no' }));
    }
    demaisG.appendChild(s('text', { x: 52, y: -6, class: 'rede-nome' }, nDemais === null ? 'carteiras menores' : `${f.n(nDemais)} ${nDemais === 1 ? 'carteira menor' : 'carteiras menores'}`));
    if (demaisPilotos !== null && demaisPass !== null) demaisG.appendChild(s('text', { x: 52, y: 9, class: 'rede-num' }, `${f.n(demaisPilotos)} pilotos · ${f.n(demaisPass)} passageiros`));
    demaisG.appendChild(s('text', { x: 52, y: 23, class: 'rede-num fraco' }, 'calculado do livro · sem detalhe por pessoa'));
    camNos.appendChild(demaisG);

    const hub = s('g', { class: 'rede-hub', transform: `translate(${HUB.x},${HUB.y})` });
    hub.appendChild(s('circle', { r: 30, class: 'rede-hub-disco' }));
    const ic = s('svg', { x: -14, y: -14, width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'rede-hub-icone' });
    ic.innerHTML = T.iconePath('controladores');
    hub.appendChild(ic);
    hub.appendChild(s('text', { y: 50, class: 'rede-nome', 'text-anchor': 'middle' }, 'Torre'));
    camNos.appendChild(hub);

    const pac = pacotes.map((p) => {
      const c = s('circle', { r: 2, class: 'rede-pacote' });
      camFios.appendChild(c);
      return { ...p, el: c };
    });
    if (!T.mov.reduzido) {
      const parar = T.mov.laco((t) => {
        for (const p of pac) {
          const k = ((t / 1000) * p.vel + p.fase) % 1;
          p.el.setAttribute('cx', (p.x1 + (p.x0 - p.x1) * k).toFixed(1));
          p.el.setAttribute('cy', (p.y1 + (p.y0 - p.y1) * k).toFixed(1));
        }
      });
      T.aoSair(parar);
    } else pac.forEach((p) => p.el.remove());

    return G.painel({
      id: 'rede',
      titulo: 'Mapa da rede de controladores',
      comoLer: 'Tamanho do disco = pilotos na carteira (área). Brilho = passageiros no total. Pontos em volta = um por piloto; aceso = já cadastrou alguém. Anel = tendência (azul acelerou, rosa desacelerou, cinza estável, tracejado sem série). Espessura do fio = cadastros na última semana; o pulso só corre com 10 ou mais.',
      largura: 3,
      grafico: (el) => {
        const host = T.h('div', { class: 'rede-host' }, svg);
        el.appendChild(host);
        requestAnimationFrame(() => {
          if (host.scrollWidth > host.clientWidth) host.scrollLeft = (host.scrollWidth - host.clientWidth) / 2;
        });
      },
      legenda: [
        { rotulo: 'acelerou (2ª metade > 1ª em 20%+)', cor: 'var(--eletrico)', forma: 'linha' },
        { rotulo: 'desacelerou', cor: 'var(--rosa)', forma: 'linha' },
        { rotulo: 'estável', cor: 'var(--referencia)', forma: 'linha' },
        { rotulo: 'piloto que já produziu', cor: 'var(--ciano)', forma: 'ponto' },
        { rotulo: 'risco: sem dono ou fila parada', cor: 'var(--agir)', forma: 'tracejada' },
      ],
      leitura: `Quem decide a pré-temporada são estas ${f.n(C.top20.length)} pessoas, não as ${f.n(C.contasAtivas)} contas. Os 10 maiores concentram ${f.pct(C.top10Soma.pct)} dos passageiros com controlador; na última semana, 10 carteiras fizeram ${f.pct(C.semana.top10Pct)} dos cadastros — e a maior delas, sozinha, ${f.n(C.semana.lista[0].ult7d)}. Enquanto isso, ${f.n(C.semDono.total)} pilotos seguem sem dono de verdade.`,
      p: [23, 24, 26, 27],
    });
  }

  const mediana = (arr) => {
    const v = [...arr].sort((a, b) => a - b);
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2);
  };

  function top20() {
    const colunas = [
      { k: 'nome', t: 'Controlador' },
      { k: 'pilotos', t: 'Pilotos' },
      { k: 'produzemPct', t: 'Produzem' },
      { k: 'passageiros', t: 'Passageiros' },
      { k: 'ult7d', t: 'Últimos 7 dias' },
      { k: 'lancaram', t: 'Lançaram' },
    ];
    let ordem = { k: 'passageiros', dir: -1 };
    const corpo = T.h('tbody');
    const cab = T.h('tr');
    const desenhar = () => {
      T.limpar(corpo);
      const linhas = [...C.top20].sort((a, b) => (ordem.k === 'nome' ? a.nome.localeCompare(b.nome) * -ordem.dir : (a[ordem.k] - b[ordem.k]) * ordem.dir));
      const max7 = Math.max(1, ...C.top20.map((c) => c.ult7d));
      for (const c of linhas) {
        corpo.appendChild(
          T.h(
            'tr',
            null,
            T.h('th', { scope: 'row' }, T.nome(c.nome)),
            T.h('td', null, f.n(c.pilotos)),
            T.h('td', null, `${c.produzem} `, T.h('small', null, `(${f.pct(c.produzemPct)})`)),
            T.h('td', null, T.h('b', null, f.n(c.passageiros))),
            T.h('td', { class: 'celula-barra' }, T.h('span', { class: 'mini-barra', style: { '--p': `${(c.ult7d / max7) * 100}%` } }), f.n(c.ult7d)),
            T.h('td', { class: c.lancaram === 0 || c.lancaram === 1 ? 'alerta-texto' : null }, `${c.lancaram}/${c.deHoje}`)
          )
        );
      }
      T.$$('th button', cab).forEach((b) => b.setAttribute('aria-sort', b.dataset.k === ordem.k ? (ordem.dir < 0 ? 'descending' : 'ascending') : 'none'));
    };
    colunas.forEach((c) =>
      cab.appendChild(
        T.h(
          'th',
          { scope: 'col' },
          T.h(
            'button',
            {
              type: 'button',
              class: 'ordenar',
              'data-k': c.k,
              onclick: () => {
                ordem = { k: c.k, dir: ordem.k === c.k ? -ordem.dir : -1 };
                desenhar();
              },
            },
            c.t
          )
        )
      )
    );
    desenhar();
    const medPilotos = mediana(C.top20.map((c) => c.pilotos));
    const medProduzem = mediana(C.top20.map((c) => c.produzem));
    return G.painel({
      titulo: 'Os 20 controladores com mais passageiros',
      comoLer: `"Produzem" = pilotos que já cadastraram alguém. "Lançaram" = linhas respondidas na rodada de ${dataRodada()} sobre os pilotos de hoje (pode passar do total). Clique no cabeçalho para ordenar.`,
      largura: 2,
      grafico: (el) => el.appendChild(T.h('div', { class: 'tabela-rolagem' }, T.h('table', { class: 'tabela-dados ordenavel' }, T.h('thead', null, cab), corpo))),
      leitura: `Os 10 primeiros reúnem ${f.n(C.top10Soma.passageiros)} dos ${f.n(C.top10Soma.deTotalComControlador)} passageiros que têm controlador — ${f.pct(C.top10Soma.pct)}. A concentração se repete dentro das carteiras: a do meio da lista tem ${f.n(medPilotos)} pilotos e só ${f.n(medProduzem)} deles produzem.`,
      p: 23,
    });
  }

  function semana() {
    return G.painel({
      titulo: 'Quem cadastrou na última semana',
      comoLer: 'Barra = passageiros dos últimos 7 dias; o traço marca o total acumulado da carteira, na mesma régua.',
      largura: 1,
      grafico: (el) =>
        G.barrasH(el, {
          max: Math.max(1, ...C.semana.lista.map((x) => Math.max(x.ult7d, x.total))),
          itens: C.semana.lista.map((x) => ({ rotulo: T.nome(x.nome), v: x.ult7d, texto: `${f.n(x.ult7d)} · ${f.n(x.total)} total`, cor: 'var(--ciano)', marcas: [{ v: x.total, cor: 'var(--tinta-3)', rotulo: 'total' }] })),
        }),
      leitura: C.semana.leitura,
      p: 23,
    });
  }

  function metadesDaJanela() {
    const serie = Object.values(T.dados.serie('controladores_acumulado')).find((p) => p.length);
    const ini = serie ? serie[0].d : T.dados.diaMedido();
    const fim = T.dados.diaMedido();
    const dias = T.diasEntre(ini, fim) + 1;
    const meio = T.isoSomar(ini, Math.floor(dias / 2));
    const rot = (a, b) => (a.slice(5, 7) === b.slice(5, 7) ? `${a.slice(8, 10)}–${f.data(b)}` : `${f.data(a)}–${f.data(b)}`);
    const nA = T.diasEntre(ini, meio);
    const nB = dias - nA;
    return { rotuloA: `${f.data(ini)}–${f.data(T.isoSomar(meio, -1))}`, rotuloB: `${f.data(meio)}–${f.data(fim)}`, curtoA: rot(ini, T.isoSomar(meio, -1)), curtoB: rot(meio, fim), nA, nB };
  }

  function aceleracao() {
    const acum = T.dados.serie('controladores_acumulado');
    const jan = metadesDaJanela();
    const tendenciaDe = (nome) => (C.metades.find((m) => T.mesmoNome(m.nome, nome)) || {}).tendencia;
    const cairam = C.metades.filter((m) => m.tendencia === 'caiu').length;
    const subiram = C.metades.filter((m) => m.tendencia === 'subiu').length;
    const estaveis = C.metades.length - cairam - subiram;
    const fortes = C.metades.filter((m) => m.b >= m.a * 2).length;
    const plural = (n, um, varios) => (n === 1 ? um : varios);
    const porque = fortes > 0 && fortes < C.metades.length ? ` A rede ainda sobe porque ${f.n(fortes)} ${plural(fortes, 'carteira mais que dobrou', 'carteiras mais que dobraram')}, não porque todas aceleraram.` : '';
    return G.painel({
      titulo: 'Quem acelerou, quem parou',
      comoLer: `Em cima: acumulado dos 5 maiores (mesma escala; linha que deita é carteira parada; rosa = caiu ou ficou estável na 2ª metade). Embaixo: 1ª metade (${jan.curtoA}) contra 2ª (${jan.curtoB}), ${jan.nA === jan.nB ? `${jan.nA} dias cada` : `${jan.nA} e ${jan.nB} dias`}.`,
      largura: 2,
      grafico: (el) => {
        const a = T.h('div');
        const b = T.h('div', { class: 'sub-grafico' });
        el.append(a, b);
        const yMax = Math.max(1, ...Object.values(acum).map((p) => (p.length ? p[p.length - 1].v : 0)));
        G.pequenos(a, { colunas: 5, altura: 120, yMax: Math.ceil(yMax / 100) * 100, quadros: Object.entries(acum).filter(([, pontos]) => pontos.length).sort((x, y) => y[1].at(-1).v - x[1].at(-1).v).map(([nome, pontos]) => ({ titulo: T.nomeTexto(nome), resumo: f.n(pontos.at(-1).v), pontos, cor: ['caiu', 'estavel'].includes(tendenciaDe(nome)) ? 'var(--rosa)' : 'var(--eletrico)' })) });
        G.halteres(b, {
          nome: 'primeira e segunda metade da janela',
          margemEsq: 150,
          rotuloA: jan.rotuloA,
          rotuloB: jan.rotuloB,
          itens: C.metades.map((m) => ({ rotulo: m.nome, rotuloTexto: T.nomeTexto(m.nome), a: m.a, b: m.b, tendencia: m.tendencia })),
          textoFim: (it) => `${it.tendencia === 'subiu' ? '↑' : it.tendencia === 'caiu' ? '↓' : '→'} ${f.n(it.b)}`,
        });
      },
      leitura: `${f.n(cairam)} dos ${f.n(C.metades.length)} caíram na segunda metade, ${f.n(subiram)} ${plural(subiram, 'cresceu', 'cresceram')} e ${f.n(estaveis)} ${plural(estaveis, 'ficou', 'ficaram')} no mesmo patamar.${porque} Carteira em queda há duas semanas não se recupera sozinha.`,
      nota: 'A curva de cada controlador mede a posse de hoje: piloto transferido leva o histórico junto.',
      p: 24,
    });
  }

  function carteiras() {
    const pilotos = T.dados.serie('carteiras_pilotos');
    const tri = C.carteiras.findIndex((c) => c.triagem);
    const menor = C.carteiras.find((c) => !c.triagem);
    const leituraTriagem = tri >= 0 ? `A maior carteira da rede é a fila de triagem da Rota 20: ${f.n(pilotos[tri])} pilotos numa conta só e ${f.n(C.carteiras[tri].passageiros)} passageiros.` : '';
    const leituraMenor = menor ? ` Na outra ponta, as ${f.n(menor.carteiras)} carteiras de ${menor.faixa.replace(/ pilotos$/, '')} pilotos produziram ${f.n(menor.passageiros)}.` : '';
    return G.painel({
      titulo: 'Tamanho de carteira não é tamanho de resultado',
      comoLer: `Os ${f.n(C.pilotosComControlador)} pilotos com controlador, pela faixa de tamanho da carteira. Barra = pilotos da faixa.`,
      largura: 1,
      grafico: (el) =>
        G.barrasH(el, {
          itens: C.carteiras.map((c, i) => ({ rotulo: c.faixa, sub: `${c.carteiras} ${c.carteiras === 1 ? 'carteira' : 'carteiras'}`, v: pilotos[i], texto: `${f.n(pilotos[i])} pilotos · ${f.n(c.passageiros)} pass.`, cor: c.triagem ? 'var(--agir)' : 'var(--eletrico)' })),
        }),
      leitura: `${leituraTriagem}${leituraMenor}`,
      p: 22,
    });
  }

  const EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];

  function rodada() {
    const R = C.rodada;
    const diaMax = R.respostasPorDia.reduce((a, d) => (!a || d.v > a.v ? d : a), null);
    let notaMutirao = null;
    if (diaMax) {
      const n = T.diasEntre(R.data, diaMax.dia);
      const quando = n === 0 ? 'no dia da abertura' : n === 1 ? 'um dia depois da abertura' : `${EXTENSO[n] || f.n(n)} dias depois da abertura`;
      notaMutirao = `${f.pct(R.mutiraoPct)} das respostas chegaram em ${f.data(diaMax.dia)}, ${quando}: esforço concentrado, não rotina.`;
    }
    return G.painel({
      id: 'rodada',
      titulo: 'A rodada de expectativa: houve resposta — e foi zero',
      comoLer: `A única rodada que existe (${dataRodada()}). Só conta a linha com carimbo; zero carimbado é resposta, linha sem carimbo é "ninguém respondeu".`,
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-3' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        const c = T.h('div');
        grade.append(a, b, c);
        a.append(
          T.h('p', { class: 'sub-titulo leitura' }, 'Linhas da rodada'),
          T.h('div', { class: 'rodada-numeros' }, T.h('div', null, T.h('b', { class: 'num' }, f.n(R.linhas)), T.h('small', null, 'linhas')), T.h('div', null, T.h('b', { class: 'num' }, f.n(R.respondidas)), T.h('small', null, `com carimbo · ${f.pct(R.respondidasPct)}`)), T.h('div', null, T.h('b', { class: 'num alerta-texto' }, f.n(R.semCarimbo)), T.h('small', null, 'sem carimbo'))),
          T.h('p', { class: 'sub-titulo leitura' }, 'Respostas por dia'),
          T.h('div', { class: 'grafico-r1' })
        );
        G.colunas(T.$('.grafico-r1', a), { altura: 150, todosValores: true, nome: 'respostas por dia', itens: R.respostasPorDia.map((d) => ({ rotulo: f.data(d.dia), v: d.v, cor: d.parcial ? 'var(--parcial)' : d === diaMax ? 'var(--violeta)' : 'var(--eletrico)' })), larguraMax: 34 });
        if (notaMutirao) a.appendChild(T.h('p', { class: 'nota-pequena' }, notaMutirao));
        b.append(T.h('p', { class: 'sub-titulo leitura' }, `O que foi respondido (${f.n(R.respondidas)} linhas com carimbo)`), T.h('div', { class: 'grafico-r2' }));
        G.colunas(T.$('.grafico-r2', b), { altura: 190, todosValores: true, nome: 'faixas de valor lançado', itens: R.faixas.map((x) => ({ rotulo: x.faixa, v: x.v, cor: x.zero ? 'var(--referencia)' : 'var(--eletrico)' })), larguraMax: 34 });
        b.appendChild(T.h('p', { class: 'nota-pequena' }, `${f.n(R.responderamZero)} linhas (${f.pct(R.zeroPct)}) vieram com zero. Os ${f.n(R.real)} da Real saem de ${f.n(R.linhasQueFormamReal)} linhas, média de ${f.n(R.mediaPorPiloto, 1)} por piloto. Sem o filtro do carimbo, a rodada somaria ${f.n(R.semFiltro)}.`));
        c.append(T.h('p', { class: 'sub-titulo leitura' }, `Cobertura: os ${f.n(R.cobertura.length)} com mais pilotos`));
        G.barrasH(c, {
          compacta: true,
          max: 110,
          itens: R.cobertura.map((x) => ({ rotulo: T.nome(x.nome), sub: x.papel || null, v: Math.min(x.pct, 110), texto: `${f.pct(x.pct)} · ${x.resp}/${x.pilotos}`, cor: x.pct < 50 ? 'var(--agir)' : 'var(--eletrico)', marcas: [{ v: 100, cor: 'var(--tinta-3)', rotulo: '100%' }] })),
        });
      },
      leitura: `${R.leitura} Com uma rodada só não há evolução para medir — é a segunda, com recorte de data, que transforma isto em série.`,
      nota: R.coberturaNota,
      p: 25,
    });
  }

  function tresNumeros() {
    const tn = L.tresNumeros;
    const md = tn.metaDeclarada || {};
    const quemProduz = tn.metaDeQuemJaProduz.v;
    const realPct = typeof tn.realSobreProjetadaPct === 'number' ? tn.realSobreProjetadaPct : (tn.real.v / tn.projetada.v) * 100;
    const distanciaMil = Math.floor((tn.projetada.v - Math.max(tn.real.v, quemProduz)) / 10000) * 10;
    return G.painel({
      id: 'tres-numeros',
      titulo: 'Projetada, Real e o que sobra — na mesma régua',
      comoLer: `Barras na mesma escala. O traço é a meta declarada${md.origem ? ` na ${md.origem}` : ''}${md.conta ? ` (${md.conta})` : ''}.`,
      largura: 3,
      grafico: (el) => {
        G.barrasH(el, {
          max: Math.max(md.v || 0, tn.projetada.v, tn.real.v, quemProduz, tn.contabilizados.v),
          itens: [
            { rotulo: 'Projetada', sub: 'metas das fichas ativas', v: tn.projetada.v, texto: f.n(tn.projetada.v), cor: 'var(--referencia)', marcas: md.v ? [{ v: md.v, cor: 'var(--tinta-1)', rotulo: 'meta' }] : [] },
            { rotulo: 'Real lançada', sub: `rodada de ${dataRodada()}`, v: tn.real.v, texto: f.n(tn.real.v), cor: 'var(--eletrico)' },
            { rotulo: 'Meta de quem já produz', sub: `${f.n(tn.metaDeQuemJaProduz.pilotos)} pilotos`, v: quemProduz, texto: f.n(quemProduz), cor: 'var(--atencao)' },
            { rotulo: 'Contabilizados', sub: 'passageiros no banco', v: tn.contabilizados.v, texto: f.n(tn.contabilizados.v), cor: 'var(--tinta-1)' },
          ],
        });
        el.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `De onde vêm os ${f.n(tn.projetada.v)}: decomposição exclusiva`));
        const cores = { orfaos: 'var(--tinta-4)', deposito: 'var(--agir)', dobro: 'var(--eletrico)', novos: 'var(--tinta-4)', antigos: 'var(--tinta-4)', produz: 'var(--ciano)' };
        G.faixa(el, { nome: 'decomposição da Projetada', alta: true, segmentos: tn.decomposicao.map((g) => ({ rotulo: `${g.grupo} · ${f.n(g.pilotos)} pilotos, ${f.n(g.comPassageiro)} com passageiro`, v: g.meta, cor: cores[g.id], textura: g.natureza === 'ficha', curto: f.pct(g.pct) })) });
        el.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'O funil aninhado com a meta que cada degrau carrega'));
        G.barrasH(el, { compacta: true, max: Math.max(1, ...L.pilotos.funil.map((d) => d.meta)), itens: L.pilotos.funil.map((d) => ({ rotulo: d.rotulo, v: d.meta, texto: `${f.n(d.v)} pilotos · meta ${f.n(d.meta)}`, cor: d.operacional ? 'var(--ciano)' : 'var(--eletrico)' })) });
      },
      leitura: `A Real é ${f.pct(realPct)} da Projetada e fica quase colada na meta de quem já produz (${f.n(tn.real.v)} contra ${f.n(quemProduz)}) — contas independentes, que podem coincidir por acaso, mas ambas a mais de ${f.n(distanciaMil)} mil da Projetada. ${tn.leituraDecomposicao || ''} A logística se planeja pela Real, não pela Projetada.`,
      p: 26,
    });
  }

  T.modulos.controladores = {
    titulo: 'Controladores',
    render(main) {
      main.append(
        T.pag.abertura(C, 'controladores', 'controladores', { regua: C.regua.linhas, explicas: [null, 'projetada', 'real', 'contabilizados'] }),
        T.comp.secao({ id: 'mapa', titulo: 'Quem carrega a rede', sub: `${f.n(C.top20.length)} pessoas, uma fila parada e ${f.n(C.semDono.orfaos)} pilotos sem fio nenhum.` }, T.comp.grade('', rede(), top20(), semana(), aceleracao(), carteiras())),
        T.comp.secao({ id: 'expectativa', titulo: 'A expectativa e o que a Projetada contém', sub: `A rodada de ${dataRodada()}, os três números na mesma régua e a decomposição exclusiva.` }, T.comp.grade('', rodada(), tresNumeros())),
        T.pag.fecho(C, C.regua)
      );
    },
  };
})();
