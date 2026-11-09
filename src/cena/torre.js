(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const f = T.fmt;
  const cena = (T.cena = T.cena || {});

  const W = 1100;
  const H = 830;
  const XC = 574;
  const DECK_Y = [568, 492, 416, 340, 264, 188];
  const ANDAR_H = 76;
  const CHAO_Y = DECK_Y[0] + ANDAR_H / 2;
  const RX_MAX = 250;
  const BUS_Y = 700;
  const NO_X = [202, 322, 442, 562, 682, 802, 922];
  const ORDEM = ['controladores', 'pilotos', 'central', 'passageiros', 'operacao', 'atendimento', 'alcance'];
  const COL_ROTULO = 852;
  const PIL = { base: 606, x: [14, 110, 206], w: 36, alturaMeta: 370 };

  const s = T.s;

  const LETREIRO = { 0: 'HORIZONTE', 1: 'CENTRAL' };
  const FONTE = {
    H: ['101', '101', '111', '101', '101'],
    O: ['111', '101', '101', '101', '111'],
    I: ['111', '010', '010', '010', '111'],
    Z: ['111', '001', '010', '100', '111'],
    C: ['111', '100', '100', '100', '111'],
    E: ['111', '100', '110', '100', '111'],
    N: ['1001', '1101', '1011', '1001', '1001'],
    T: ['111', '010', '010', '010', '010'],
    R: ['110', '101', '110', '101', '101'],
    A: ['010', '101', '111', '101', '101'],
    L: ['100', '100', '100', '100', '111'],
  };
  const metaFaseA = () => {
    const m = L.pilotos && L.pilotos.metaFaseA;
    if (Array.isArray(m) && m.length >= 2) return [m[0], m[1]];
    if (m && typeof m === 'object' && typeof m.min === 'number' && typeof m.max === 'number') return [m.min, m.max];
    return [700, 1300];
  };
  const mapaLetreiro = (texto) => [0, 1, 2, 3, 4].map((r) => [...texto].map((ch) => FONTE[ch][r]).join('0'));

  cena.torre = function (host) {
    const funil = L.pilotos.funil;
    const vivos = funil.find((d) => d.id === 'vivo');
    const max = funil[0].v;
    const rx = funil.map((d) => (d.v / max) * RX_MAX);
    const [metaMin, metaMax] = metaFaseA();
    const faixaMeta = `${f.n(metaMin)}–${f.n(metaMax)}`;
    const d7 = f.data(L.meta.d7);

    const remontada = !!host.closest('.pagina.remontada');
    const svg = s('svg', {
      viewBox: `0 132 ${W} ${H - 132}`,
      class: ['torre', remontada ? null : 'montando'],
      role: 'group',
      'aria-label': `Torre de prontidão: ${funil.map((d) => `${d.rotulo} ${f.n(d.v)}`).join('; ')}. Meta de ${d7}: ${f.n(metaMin)} a ${f.n(metaMax)} pilotos prontos.`,
    });

    const defs = s('defs');
    defs.innerHTML = `
      <linearGradient id="tg-vidro" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#221d3d"/>
        <stop offset="1" stop-color="#14121f"/>
      </linearGradient>
      <linearGradient id="tg-vidro-lado" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".07"/>
        <stop offset=".45" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity=".18"/>
      </linearGradient>
      <linearGradient id="tg-reflexo" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#e4e1ff" stop-opacity="0"/>
        <stop offset=".5" stop-color="#e4e1ff" stop-opacity=".16"/>
        <stop offset="1" stop-color="#e4e1ff" stop-opacity="0"/>
      </linearGradient>
      <pattern id="tg-hachura" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="#84848f" stroke-opacity=".45" stroke-width="1"/>
      </pattern>`;
    svg.appendChild(defs);

    const registro = s('g', { class: 'registro', 'aria-hidden': 'true' });
    [[16, 148], [W - 16, 148], [16, H - 16], [W - 16, H - 16]].forEach(([x, y]) => {
      registro.appendChild(s('path', { d: `M${x - 7},${y}H${x + 7}M${x},${y - 7}V${y + 7}`, class: 'registro-cruz' }));
      registro.appendChild(s('circle', { cx: x, cy: y, r: 3.5, class: 'registro-cruz' }));
    });
    svg.appendChild(registro);

    const chao = s('g', { class: 'chao', 'aria-hidden': 'true' });
    chao.appendChild(s('line', { x1: XC - 290, x2: XC + 270, y1: CHAO_Y + 0.5, y2: CHAO_Y + 0.5, class: 'chao-linha' }));
    const marcasChao = [];
    for (let v = 500; v <= max; v += 500) marcasChao.push(v);
    marcasChao.forEach((v) => {
      const dx = (v / max) * RX_MAX;
      for (const lado of [-1, 1]) chao.appendChild(s('line', { x1: XC + lado * dx, x2: XC + lado * dx, y1: CHAO_Y + 3, y2: CHAO_Y + 9, class: 'chao-marca' }));
      chao.appendChild(s('text', { x: XC + dx, y: CHAO_Y + 22, class: 'chao-rotulo', 'text-anchor': 'middle' }, f.n(v)));
    });
    chao.appendChild(s('text', { x: XC - RX_MAX, y: CHAO_Y + 22, class: 'chao-rotulo', 'text-anchor': 'middle' }, 'largura = pilotos'));
    svg.appendChild(chao);

    const fios = s('g', { class: 'fios' });
    svg.appendChild(fios);
    const noIdx = (id) => ORDEM.indexOf(id);
    funil.forEach((d, i) => {
      if (d.id === 'produziu') return;
      const k = noIdx(d.nucleo);
      const xn = NO_X[k];
      let caminho;
      if (d.id === 'vivo') caminho = `M${XC},${CHAO_Y}V${BUS_Y - 24}`;
      else if (xn < XC) caminho = `M${XC - rx[i]},${DECK_Y[i]}H${xn}V${BUS_Y - 24}`;
      else caminho = `M${XC + rx[i]},${DECK_Y[i]}H${xn}V${BUS_Y - 24}`;
      const nucleos = d.id === 'vivo' ? 'passageiros' : d.nucleo;
      const decks = d.id === 'vivo' ? 'produziu vivo' : d.id;
      fios.appendChild(s('path', { d: caminho, class: 'fio', 'data-nucleo': nucleos, 'data-deck': decks, pathLength: 1, style: { '--i': i } }));
      fios.appendChild(s('rect', { x: (d.id === 'vivo' ? XC : xn) - 2.5, y: BUS_Y - 26.5, width: 5, height: 5, class: 'terminal', 'data-nucleo': nucleos, 'data-deck': decks }));
    });

    const conveses = s('g', { class: 'conveses' });
    svg.appendChild(conveses);
    const janelas = [];
    const recorte = s('clipPath', { id: 'tg-predio' });
    defs.appendChild(recorte);
    funil.forEach((d, i) => {
      const vivo = d.id === 'vivo';
      const hw = Math.max(rx[i], 4.5);
      const topo = -ANDAR_H / 2;
      recorte.appendChild(s('rect', { x: XC - hw, y: DECK_Y[i] + topo, width: hw * 2, height: ANDAR_H }));
      const g = s('g', {
        class: ['conves', vivo ? 'operacional' : null, d.id === 'kit' ? 'farol' : null],
        transform: `translate(${XC},${DECK_Y[i]})`,
        'data-deck': d.id,
        'data-nucleo': d.nucleo,
        tabindex: 0,
        role: 'button',
        'aria-label': `${d.rotulo}: ${f.n(d.v)} pilotos, ${f.pct(d.pct)} dos ativos. Ver explicação.`,
        style: { '--i': i },
      });
      const escala = s('g', { class: 'conves-escala' });
      escala.appendChild(s('rect', { x: -hw, y: topo, width: hw * 2, height: ANDAR_H, fill: 'url(#tg-vidro)', class: 'andar-fachada' }));
      const cols = Math.floor((hw * 2 - 8) / 12);
      const letreiro = LETREIRO[i] && mapaLetreiro(LETREIRO[i]);
      const passoLetreiro = letreiro ? Math.min(12, (hw * 2 - 4) / letreiro[0].length) : 0;
      if (letreiro && passoLetreiro >= 8) {
        const larg = letreiro[0].length;
        const passo = passoLetreiro;
        const colsL = passo === 12 ? Math.max(cols, larg) : larg;
        const jw = (passo * 2) / 3;
        const desloc = Math.floor((colsL - larg) / 2);
        const x0 = -((colsL - 1) * passo + jw) / 2;
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < colsL; c++) {
            const k = c - desloc;
            const aceso = k >= 0 && k < larg && letreiro[r][k] === '1';
            escala.appendChild(s('rect', { x: x0 + c * passo, y: topo + 9 + r * 12, width: jw, height: 9, class: aceso ? 'janela letreiro' : 'janela fundo-letreiro' }));
          }
        }
      } else if (cols >= 1) {
        const x0 = -(cols * 12 - 6) / 2;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < cols; c++) {
            const jan = s('rect', { x: x0 + c * 12, y: topo + 11 + r * 20, width: 6, height: 11, class: Math.random() < 0.34 ? 'janela acesa' : 'janela' });
            escala.appendChild(jan);
            janelas.push(jan);
          }
        }
      } else {
        escala.appendChild(s('line', { x1: 0, x2: 0, y1: topo + 8, y2: -topo - 8, class: 'andar-montante' }));
      }
      escala.appendChild(s('rect', { x: -hw, y: topo, width: hw * 2, height: ANDAR_H, fill: 'url(#tg-vidro-lado)', class: 'andar-luz' }));
      escala.appendChild(s('rect', { x: -hw, y: topo, width: hw * 2, height: ANDAR_H, class: 'andar-contorno' }));
      escala.appendChild(s('line', { x1: -hw - 3, x2: hw + 3, y1: topo, y2: topo, class: 'andar-laje' }));
      g.appendChild(escala);
      g.appendChild(s('rect', { x: -Math.max(hw, 26), y: topo, width: Math.max(hw, 26) * 2, height: ANDAR_H, class: 'conves-toque' }));
      conveses.appendChild(g);
    });

    {
      const meia = funil.map((_, i) => Math.max(rx[i], 4.5));
      const topoDe = (i) => DECK_Y[i] - ANDAR_H / 2;
      let d = `M${XC - meia[0]},${CHAO_Y}`;
      for (let i = 0; i < funil.length; i++) {
        d += `V${topoDe(i)}`;
        if (i < funil.length - 1) d += `H${XC - meia[i + 1]}`;
      }
      d += `H${XC + meia[funil.length - 1]}`;
      for (let i = funil.length - 1; i > 0; i--) d += `V${topoDe(i - 1)}H${XC + meia[i - 1]}`;
      d += `V${CHAO_Y}Z`;
      const contorno = s('g', { class: 'contorno-vivo', 'aria-hidden': 'true' });
      contorno.appendChild(s('path', { d, class: 'contorno-trilho' }));
      contorno.appendChild(s('path', { d, pathLength: 1, class: 'contorno-luz' }));
      contorno.appendChild(s('path', { d, pathLength: 1, class: 'contorno-luz segunda' }));
      svg.appendChild(contorno);
    }

    const reflexo = s('g', { 'clip-path': 'url(#tg-predio)', 'aria-hidden': 'true' });
    const yTopo = DECK_Y[5] - ANDAR_H / 2;
    reflexo.appendChild(s('path', { d: `M${XC - 400},${yTopo}h110l-160,${CHAO_Y - yTopo}h-90Z`, fill: 'url(#tg-reflexo)', class: 'predio-reflexo' }));
    svg.appendChild(reflexo);

    const rMin = (metaMin / max) * RX_MAX;
    const rMax = (metaMax / max) * RX_MAX;
    const alvo = s('g', { class: 'anel-alvo', tabindex: 0, role: 'button', 'aria-label': `Meta de ${d7}: ${f.n(metaMin)} a ${f.n(metaMax)} pilotos prontos. Ver explicação.`, 'data-nucleo': 'pilotos passageiros' });
    alvo.appendChild(s('rect', { x: XC + rMin, y: CHAO_Y + 28, width: rMax - rMin, height: 4, rx: 2, class: 'meta-faixa' }));
    alvo.appendChild(s('line', { x1: XC + rMin, x2: XC + rMin, y1: CHAO_Y + 24, y2: CHAO_Y + 36, class: 'meta-limite' }));
    alvo.appendChild(s('line', { x1: XC + rMax, x2: XC + rMax, y1: CHAO_Y + 24, y2: CHAO_Y + 36, class: 'meta-limite' }));
    alvo.appendChild(s('text', { x: XC + rMin - 8, y: CHAO_Y + 34, class: 'anel-alvo-num', 'text-anchor': 'end' }, `meta ${vivos ? `dos ${f.n(vivos.v)} ` : ''}em ${d7}: ${faixaMeta}`));
    alvo.appendChild(s('rect', { x: XC - 30, y: CHAO_Y + 18, width: rMax + 40, height: 24, fill: 'transparent' }));
    svg.appendChild(alvo);

    let ultimoT = null;
    let proximaJanela = 0;
    const animarCena = (t) => {
      ultimoT = t;
      if (t >= proximaJanela && janelas.length) {
        janelas[Math.floor(Math.random() * janelas.length)].classList.toggle('acesa');
        proximaJanela = t + 280 + Math.random() * 520;
      }
    };

    const perdas = s('g', { class: 'perdas' });
    svg.appendChild(perdas);
    const textosPerda = ['sem dono', 'nunca falaram com o bot', 'nunca cadastraram', 'pararam', 'sem kit'];
    const maiorPerda = Math.max(...funil.slice(1).map((d, i) => funil[i].v - d.v));
    for (let i = 0; i < funil.length - 1; i++) {
      const dif = funil[i].v - funil[i + 1].v;
      const y = (DECK_Y[i] + DECK_Y[i + 1]) / 2 + 4;
      const x = XC - Math.max(rx[i], rx[i + 1]) - 18;
      const destaque = dif === maiorPerda;
      const t = s('text', { x, y, class: ['perda', destaque ? 'destaque' : null], 'text-anchor': 'end', style: { '--i': i } });
      t.appendChild(s('tspan', { class: 'perda-num' }, `−${f.n(dif)}`));
      t.appendChild(s('tspan', { dx: 6 }, textosPerda[i]));
      perdas.appendChild(t);
    }

    const rotulos = s('g', { class: 'rotulos-conves' });
    svg.appendChild(rotulos);
    funil.forEach((d, i) => {
      const y = DECK_Y[i];
      const g = s('g', { class: ['rotulo-conves', d.id === 'vivo' ? 'operacional' : null], 'data-deck': d.id, 'data-nucleo': d.nucleo, style: { '--i': i } });
      g.appendChild(s('path', { d: `M${XC + rx[i] + 7},${y}H${COL_ROTULO - 10}`, class: 'guia' }));
      g.appendChild(s('text', { x: COL_ROTULO, y: y + 1 }, s('tspan', { class: 'rotulo-valor' }, f.n(d.v)), s('tspan', { class: 'rotulo-pct', dx: 10 }, f.pct(d.pct))));
      g.appendChild(s('text', { x: COL_ROTULO, y: y + 20, class: 'rotulo-texto' }, d.id === 'vivo' ? 'vivos na semana · a base pronta' : d.rotulo));
      if (d.id === 'vivo') g.appendChild(s('text', { x: COL_ROTULO, y: y + 37, class: 'rotulo-meta' }, `meta ${d7}: ${faixaMeta} (régua)`));
      else g.appendChild(s('text', { x: COL_ROTULO, y: y + 36, class: 'rotulo-sub' }, `meta somada ${f.n(d.meta)}`));
      rotulos.appendChild(g);
    });

    const tn = L.tresNumeros;
    const escalaP = (v) => (v / tn.metaDeclarada.v) * PIL.alturaMeta;
    const pilares = s('g', { class: 'pilares' });
    svg.appendChild(pilares);
    const yMeta = PIL.base - PIL.alturaMeta;
    const meta = s('g', { class: 'pilar-meta', tabindex: 0, role: 'button', 'aria-label': `Meta declarada: ${f.n(tn.metaDeclarada.v)}. Ver explicação.`, 'data-explica-svg': 'meta' });
    meta.appendChild(s('line', { x1: PIL.x[0] - 6, x2: PIL.x[2] + PIL.w + 10, y1: yMeta, y2: yMeta, class: 'pilar-meta-linha' }));
    meta.appendChild(s('text', { x: PIL.x[0] - 6, y: yMeta - 8, class: 'pilar-meta-rotulo' }, `meta declarada ${f.n(tn.metaDeclarada.v)}`));
    pilares.appendChild(meta);
    const decomp = tn.decomposicao;
    const sinal = T.soma(decomp.filter((g) => g.natureza === 'sinal'), (g) => g.meta);
    const mil = (v) => `${f.nFlex(v / 1000, 1)} mil`;
    const defs3 = [
      { id: 'projetada', nome: 'Projetada', v: tn.projetada.v, x: PIL.x[0] },
      { id: 'real', nome: 'Real', v: tn.real.v, x: PIL.x[1] },
      { id: 'contabilizados', nome: 'Contabilizados', v: tn.contabilizados.v, x: PIL.x[2] },
    ];
    defs3.forEach((p, i) => {
      const h = escalaP(p.v);
      const g = s('g', { class: ['pilar', `pilar-${p.id}`], tabindex: 0, role: 'button', 'aria-label': `${p.nome}: ${f.n(p.v)}. Ver explicação.`, 'data-explica-svg': p.id, style: { '--i': i } });
      const corpo = s('g', { class: 'pilar-corpo' });
      if (p.id === 'projetada') {
        const hs = escalaP(sinal);
        corpo.appendChild(s('rect', { x: p.x, y: PIL.base - h, width: PIL.w, height: h - hs, class: 'pilar-ficha', fill: 'url(#tg-hachura)' }));
        corpo.appendChild(s('rect', { x: p.x, y: PIL.base - h, width: PIL.w, height: h - hs, class: 'pilar-ficha-borda' }));
        corpo.appendChild(s('rect', { x: p.x, y: PIL.base - hs, width: PIL.w, height: hs, class: 'pilar-sinal' }));
        corpo.appendChild(s('line', { x1: p.x + PIL.w + 4, x2: p.x + PIL.w + 12, y1: PIL.base - hs, y2: PIL.base - hs, class: 'pilar-marca' }));
        corpo.appendChild(s('text', { x: p.x + PIL.w + 15, y: PIL.base - hs + 4, class: 'pilar-nota' }, `${mil(tn.tetoHonesto)} com sinal`));
        corpo.appendChild(s('text', { x: p.x + PIL.w + 15, y: PIL.base - h + 14, class: 'pilar-nota' }, `${mil(tn.soFicha)} só ficha`));
      } else {
        corpo.appendChild(s('rect', { x: p.x, y: PIL.base - h, width: PIL.w, height: h, class: 'pilar-cheio' }));
      }
      g.appendChild(corpo);
      g.appendChild(s('text', { x: p.x + PIL.w / 2, y: PIL.base - h - 10, class: 'pilar-valor', 'text-anchor': 'middle' }, f.n(p.v)));
      g.appendChild(s('text', { x: p.x + PIL.w / 2, y: PIL.base + 18, class: 'pilar-nome', 'text-anchor': 'middle' }, p.nome));
      pilares.appendChild(g);
    });
    pilares.appendChild(s('line', { x1: PIL.x[0] - 6, x2: PIL.x[2] + PIL.w + 10, y1: PIL.base + 0.5, y2: PIL.base + 0.5, class: 'pilar-base' }));

    const barramento = s('g', { class: 'barramento' });
    svg.appendChild(barramento);
    const pacotes = [];
    const dicaColeta = () => {
      const c = L.alcance.coleta[0] || {};
      const ultima = c.ultima ? String(c.ultima).slice(0, 10) : null;
      const rodouHoje = ultima && ultima === T.dados.diaMedido();
      const erro = c.erro === 'nenhum' || c.erro === 0 ? ' sem erro' : typeof c.erro === 'number' ? ` com ${f.n(c.erro)} ${c.erro === 1 ? 'erro' : 'erros'}` : c.erro ? ` com erro: ${c.erro}` : '';
      const dias = typeof c.paradaDias === 'number' ? `parada há ${f.nFlex(c.paradaDias)} ${c.paradaDias === 1 ? 'dia' : 'dias'}` : 'parada';
      const rotulo = !ultima ? 'coleta de redes sem registro de execução' : rodouHoje ? 'última coleta de redes; rodou hoje' : `última coleta de redes; ${dias}${erro}`;
      return T.dica.bloco([{ valor: ultima ? f.data(ultima) : '—', rotulo, cor: rodouHoje ? 'var(--firme)' : 'var(--agir)', forma: 'linha' }], rodouHoje ? 'Alcance · coleta rodou hoje' : 'Alcance · sem sinal');
    };
    for (let k = 0; k < ORDEM.length - 1; k++) {
      const a = ORDEM[k];
      const b = ORDEM[k + 1];
      const fio = T.fios.find((x) => (x.de === a && x.para === b) || (x.de === b && x.para === a));
      const x0 = NO_X[k] + 30;
      const x1 = NO_X[k + 1] - 30;
      const nucleos = `${a} ${b}`;
      if (fio && fio.quebrado) {
        const meio = (x0 + x1) / 2;
        barramento.appendChild(s('path', { d: `M${x0},${BUS_Y}H${meio - 10}M${meio + 10},${BUS_Y}H${x1}`, class: 'barra-fio quebrado', 'data-nucleo': nucleos }));
        barramento.appendChild(s('path', { d: `M${meio - 10},${BUS_Y - 6}v12M${meio + 10},${BUS_Y - 6}v12`, class: 'barra-quebra' }));
        const toqueQ = s('rect', { x: x0, y: BUS_Y - 16, width: x1 - x0, height: 26, class: 'barra-toque', 'aria-label': fio.rotulo });
        T.dica.ligar(toqueQ, dicaColeta);
        barramento.appendChild(toqueQ);
      } else {
        barramento.appendChild(s('path', { d: `M${x0},${BUS_Y}H${x1}`, class: ['barra-fio', fio && fio.medido ? 'medido' : 'conceitual'], 'data-nucleo': nucleos, pathLength: 1, style: { '--i': k } }));
        if (fio && fio.medido) {
          const rot = s('text', { x: (x0 + x1) / 2, y: BUS_Y - 9, class: 'barra-rotulo', 'text-anchor': 'middle', 'data-nucleo': nucleos }, f.n(fio.v));
          barramento.appendChild(rot);
          const toque = s('rect', { x: x0, y: BUS_Y - 16, width: x1 - x0, height: 26, class: 'barra-toque', 'data-nucleo': nucleos, 'aria-label': `${f.n(fio.v)} ${fio.rotulo}` });
          T.dica.ligar(toque, () => T.dica.bloco([{ valor: f.n(fio.v), rotulo: fio.rotulo, cor: 'var(--ciano)', forma: 'linha' }], `${T.nucleo(fio.de).nome} → ${T.nucleo(fio.para).nome} · p. ${fio.p}`));
          barramento.appendChild(toque);
          for (let j = 0; j < 2; j++) {
            const c = s('rect', { width: 9, height: 3, rx: 1.5, y: BUS_Y - 1.5, class: 'pacote', 'data-nucleo': nucleos });
            barramento.appendChild(c);
            pacotes.push({ el: c, x0, len: x1 - x0 - 9, fase: j / 2 });
          }
        }
      }
    }

    const nos = s('g', { class: 'nos' });
    svg.appendChild(nos);
    ORDEM.forEach((id, k) => {
      const n = T.nucleo(id);
      const regua = T.dados.regua(id);
      const cont = T.dados.contagemRegua(regua);
      const pior = T.dados.piorEstado(regua);
      const x = NO_X[k];
      const g = s('g', {
        class: 'no',
        'data-no': id,
        'data-nucleo': id,
        'data-s': pior,
        transform: `translate(${x},${BUS_Y})`,
        tabindex: 0,
        role: 'link',
        'aria-label': `${n.nome}: ${n.leitura.fmt(n.leitura.v)} ${n.leitura.texto}. Régua: ${cont.vermelho} agir hoje, ${cont.amarelo} atenção, ${cont.verde} firmes. Abrir capítulo.`,
        style: { '--i': k },
      });
      g.appendChild(s('circle', { r: 29, class: 'no-anel' }));
      g.appendChild(s('circle', { r: 22, class: 'no-disco' }));
      const ic = s('svg', { x: -11, y: -11, width: 22, height: 22, viewBox: '0 0 24 24', class: 'no-icone', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      ic.innerHTML = T.iconePath(n.icone);
      g.appendChild(ic);
      g.appendChild(s('text', { y: 50, class: 'no-nome', 'text-anchor': 'middle' }, n.nome));
      g.appendChild(s('text', { y: 72, class: 'no-valor', 'text-anchor': 'middle' }, n.leitura.fmt(n.leitura.v)));
      g.appendChild(s('text', { y: 88, class: 'no-texto', 'text-anchor': 'middle' }, n.leitura.texto));
      const PALAVRA = { vermelho: ['agir', 'agir'], amarelo: ['atencao', 'atenção'], verde: ['firme', 'firme'], 'nao-medido': ['nao-medido', 'não medido'] };
      const [iconeEstado, palavra] = PALAVRA[pior] || PALAVRA['nao-medido'];
      const qtd = pior && cont[pior] ? cont[pior] : 0;
      const est = s('g', { class: 'no-estado', 'data-s': pior || 'nao-medido', transform: 'translate(0,108)' });
      const icE = s('svg', { x: 0, y: -10, width: 12, height: 12, viewBox: '0 0 24 24', class: 'no-estado-icone', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      icE.innerHTML = T.iconePath(iconeEstado);
      est.append(icE, s('text', { x: 16, y: 0, class: 'no-estado-texto' }, qtd && pior !== 'verde' ? `${palavra} ${qtd}` : palavra));
      g.appendChild(est);
      g.appendChild(s('rect', { x: -56, y: -34, width: 112, height: 150, class: 'no-toque' }));
      nos.appendChild(g);
    });

    host.appendChild(svg);
    T.$$('.no-estado', svg).forEach((est) => {
      const t = est.querySelector('text');
      const w = 16 + (t.getComputedTextLength ? t.getComputedTextLength() : 40);
      est.setAttribute('transform', `translate(${(-w / 2).toFixed(1)},108)`);
    });

    const focar = (nucleo, deck) => {
      if (nucleo) svg.dataset.foco = nucleo;
      else delete svg.dataset.foco;
      if (deck) svg.dataset.deck = deck;
      else delete svg.dataset.deck;
      T.$$('[data-nucleo]', svg).forEach((el) => {
        const lista = (el.getAttribute('data-nucleo') || '').split(' ');
        const decks = (el.getAttribute('data-deck') || '').split(' ');
        const ativo = !nucleo || lista.includes(nucleo) || (deck && decks.includes(deck));
        el.classList.toggle('apagado', !ativo);
        el.classList.toggle('aceso', Boolean(nucleo) && ativo);
      });
    };

    T.$$('.conves', svg).forEach((g) => {
      const d = funil.find((x) => x.id === g.dataset.deck);
      const conteudo = () =>
        T.dica.bloco(
          [
            { valor: f.n(d.v), rotulo: `pilotos · ${f.pct(d.pct)} dos ativos`, cor: d.id === 'vivo' ? 'var(--ciano)' : 'var(--eletrico)', forma: 'barra' },
            { valor: f.n(d.meta), rotulo: 'meta somada deste degrau', cor: 'var(--referencia)', forma: 'linha' },
            { valor: T.nucleo(d.nucleo).nome, rotulo: 'núcleo responsável', cor: 'var(--tinta-3)', forma: 'ponto' },
          ],
          d.rotulo
        );
      g.addEventListener('pointerenter', (e) => {
        focar(d.nucleo, d.id);
        T.dica.mostrar(conteudo(), e.clientX, e.clientY, g);
      });
      g.addEventListener('pointermove', (e) => T.dica.mover(e.clientX, e.clientY));
      g.addEventListener('pointerleave', () => {
        focar(null);
        T.dica.esconder(g);
      });
      g.addEventListener('focus', () => focar(d.nucleo, d.id));
      g.addEventListener('blur', () => focar(null));
      const abrir = () => T.explicar(`funil-${d.id}`);
      g.addEventListener('click', abrir);
      g.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), abrir()));
    });

    T.$$('.no', svg).forEach((g) => {
      const id = g.dataset.no;
      const n = T.nucleo(id);
      const regua = T.dados.regua(id);
      const cont = T.dados.contagemRegua(regua);
      const conteudo = () =>
        T.dica.bloco(
          [
            { valor: n.leitura.fmt(n.leitura.v), rotulo: n.leitura.texto, cor: 'var(--eletrico)', forma: 'barra' },
            { valor: String(cont.vermelho), rotulo: 'métricas para agir hoje', cor: 'var(--agir)', forma: 'ponto' },
            { valor: String(cont.amarelo), rotulo: 'em atenção', cor: 'var(--atencao)', forma: 'ponto' },
            { valor: String(cont.verde), rotulo: 'firmes', cor: 'var(--firme)', forma: 'ponto' },
            cont['nao-medido'] ? { valor: String(cont['nao-medido']), rotulo: 'não medidas', cor: 'var(--nao-medido)', forma: 'ponto' } : null,
          ].filter(Boolean),
          `${n.nome} · abrir capítulo`
        );
      g.addEventListener('pointerenter', (e) => {
        focar(id);
        T.dica.mostrar(conteudo(), e.clientX, e.clientY, g);
      });
      g.addEventListener('pointermove', (e) => T.dica.mover(e.clientX, e.clientY));
      g.addEventListener('pointerleave', () => {
        focar(null);
        T.dica.esconder(g);
      });
      g.addEventListener('focus', () => focar(id));
      g.addEventListener('blur', () => focar(null));
      const ir = () => (location.hash = `#/${id}`);
      g.addEventListener('click', ir);
      g.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), ir()));
    });

    T.$$('[data-explica-svg]', svg).forEach((g) => {
      const chave = g.dataset.explicaSvg;
      const item = T.explicacoes[chave];
      T.dica.ligar(g, () => T.dica.bloco([{ valor: item.valor, rotulo: item.oque, cor: 'var(--eletrico)', forma: 'barra' }], item.titulo));
      g.addEventListener('click', () => T.explicar(chave));
      g.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), T.explicar(chave)));
    });
    alvo.addEventListener('click', () => T.explicar('alvo'));
    alvo.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), T.explicar('alvo')));
    T.dica.ligar(alvo, () => T.dica.bloco([{ valor: faixaMeta, rotulo: `pilotos prontos em ${d7}${vivos ? ` · hoje: ${f.n(vivos.v)}` : ''}`, cor: 'var(--ciano)', forma: 'linha' }], 'Meta da Fase A'));

    const montado = () => svg.classList.remove('montando');
    if (T.mov.reduzido || remontada) montado();
    else setTimeout(montado, 2600);

    let parar = null;
    const velocidade = 46;
    const iniciarPacotes = () => {
      if (T.mov.reduzido || parar) return;
      ultimoT = null;
      parar = T.mov.laco((t) => {
        for (const p of pacotes) {
          const x = p.x0 + (((t / 1000) * velocidade + p.fase * p.len) % p.len);
          p.el.setAttribute('x', x.toFixed(1));
        }
        animarCena(t);
      });
    };
    if (!T.mov.reduzido) setTimeout(iniciarPacotes, remontada ? 0 : 1900);
    else pacotes.forEach((p, i) => p.el.setAttribute('x', p.x0 + p.len * (i % 2 ? 0.66 : 0.25)));

    const io = new IntersectionObserver((ent) => {
      for (const e of ent) {
        if (!e.isIntersecting && parar) {
          parar();
          parar = null;
        } else if (e.isIntersecting && !parar && !svg.classList.contains('montando')) iniciarPacotes();
      }
    });
    io.observe(svg);
    return { svg, focar, destruir: () => (parar && parar(), io.disconnect()) };
  };
})();
