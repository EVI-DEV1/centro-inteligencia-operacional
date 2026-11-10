(function () {
  'use strict';
  const T = window.T;
  const G = (T.graf = T.graf || {});

  G.topoRedondo = function (max, divisoes = 4) {
    if (max <= 0) return { topo: 1, passo: 0.25 };
    const bruto = max / divisoes;
    const pot = Math.pow(10, Math.floor(Math.log10(bruto)));
    const n = bruto / pot;
    const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    const passo = m * pot;
    return { topo: Math.ceil(max / passo) * passo, passo };
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
})();
