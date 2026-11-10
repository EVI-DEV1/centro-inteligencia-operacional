(function () {
  'use strict';
  const T = (window.T = window.T || {});
  T.modulos = {};
  const SVGNS = 'http://www.w3.org/2000/svg';

  function aplicar(el, attrs, svg) {
    if (!attrs) return;
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.setAttribute('class', Array.isArray(v) ? v.filter(Boolean).join(' ') : v);
      else if (k === 'style' && typeof v === 'object') {
        for (const [p, pv] of Object.entries(v)) {
          if (pv === null || pv === undefined) continue;
          if (p.startsWith('--')) el.style.setProperty(p, pv);
          else el.style[p] = pv;
        }
      } else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'text') el.textContent = v;
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(svg && k === 'viewBox' ? 'viewBox' : k, String(v));
    }
  }

  function anexar(el, filhos) {
    for (const f of filhos) {
      if (f === null || f === undefined || f === false) continue;
      if (Array.isArray(f)) anexar(el, f);
      else if (f instanceof Node) el.appendChild(f);
      else el.appendChild(document.createTextNode(String(f)));
    }
  }

  T.h = function (tag, attrs, ...filhos) {
    const el = document.createElement(tag);
    if (attrs && (attrs instanceof Node || Array.isArray(attrs) || typeof attrs !== 'object')) {
      filhos.unshift(attrs);
      attrs = null;
    }
    aplicar(el, attrs, false);
    anexar(el, filhos);
    return el;
  };

  T.s = function (tag, attrs, ...filhos) {
    const el = document.createElementNS(SVGNS, tag);
    if (attrs && (attrs instanceof Node || Array.isArray(attrs) || typeof attrs !== 'object')) {
      filhos.unshift(attrs);
      attrs = null;
    }
    aplicar(el, attrs, true);
    anexar(el, filhos);
    return el;
  };

  T.limpar = function (el) {
    while (el.firstChild) el.removeChild(el.firstChild);
    return el;
  };

  T.$ = (sel, raiz) => (raiz || document).querySelector(sel);
  T.$$ = (sel, raiz) => Array.from((raiz || document).querySelectorAll(sel));
  T.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  T.soma = (arr, f) => arr.reduce((a, x) => a + (f ? f(x) : typeof x === 'number' ? x : x.v), 0);
  T.uid = (() => {
    let n = 0;
    return (p) => `${p || 'u'}-${++n}`;
  })();

  const nf = {};
  const formatador = (min, max) => (nf[`${min}-${max}`] ||= new Intl.NumberFormat('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max }));
  const fmt = (T.fmt = {});
  fmt.n = (v, casas = 0) => (v === null || v === undefined || Number.isNaN(v) ? '—' : formatador(casas, casas).format(v));
  fmt.nFlex = (v, max = 1) => (v === null || v === undefined ? '—' : formatador(0, max).format(v));
  fmt.pct = (v, casas = 1) => (v === null || v === undefined ? '—' : `${formatador(casas === 'auto' ? 0 : casas, casas === 'auto' ? 1 : casas).format(v)}%`);
  fmt.h = (v, casas = 1) => (v === null || v === undefined ? '—' : `${formatador(casas, casas).format(v)} h`);
  fmt.d = (v, casas = 1) => (v === null || v === undefined ? '—' : `${formatador(casas, casas).format(v)} d`);
  fmt.x = (v, casas = 1) => `${formatador(casas, casas).format(v)}×`;
  fmt.compacto = (v) => {
    if (v === null || v === undefined) return '—';
    const a = Math.abs(v);
    if (a >= 1e6) return `${formatador(0, 2).format(v / 1e6)} mi`;
    if (a >= 1e4) return `${formatador(0, 0).format(v / 1e3)} mil`;
    if (a >= 1e3) return `${formatador(0, 1).format(v / 1e3)} mil`;
    return formatador(0, 0).format(v);
  };
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  fmt.data = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '—');
  fmt.dataMes = (iso) => `${Number(iso.slice(8, 10))} ${MESES[Number(iso.slice(5, 7)) - 1]}`;
  fmt.diaSemana = (iso) => DIAS[new Date(`${iso}T12:00:00Z`).getUTCDay()];

  T.diasEntre = (a, b) => Math.round((new Date(`${b}T12:00:00Z`) - new Date(`${a}T12:00:00Z`)) / 864e5);

  const NUM_SEP = /\d[\d.,]*[.,]\d+/g;
  T.numerosNaLeitura = function (raiz) {
    if (!raiz || !/\d[.,]\d/.test(raiz.textContent)) return;
    const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (/\d[.,]\d/.test(n.nodeValue) && n.parentElement && !n.parentElement.closest('.n-prop, style, script') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const alvos = [];
    while (walker.nextNode()) alvos.push(walker.currentNode);
    const mono = new Map();
    for (const no of alvos) {
      const pai = no.parentElement;
      if (!mono.has(pai)) mono.set(pai, getComputedStyle(pai).fontFamily.includes('B612 Mono'));
      if (!mono.get(pai)) continue;
      const noSvg = pai instanceof SVGElement;
      const txt = no.nodeValue;
      const frag = document.createDocumentFragment();
      let ultimo = 0;
      for (const m of txt.matchAll(NUM_SEP)) {
        frag.append(txt.slice(ultimo, m.index), noSvg ? T.s('tspan', { class: 'n-prop' }, m[0]) : T.h('span', { class: 'n-prop' }, m[0]));
        ultimo = m.index + m[0].length;
      }
      frag.append(txt.slice(ultimo));
      no.replaceWith(frag);
    }
  };

})();
