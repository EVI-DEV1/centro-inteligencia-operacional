(function () {
  'use strict';
  const T = window.T;
  const pag = (T.pag = {});
  T.modulos = T.modulos || {};

  let limpezas = [];
  T.aoSair = (fn) => {
    if (typeof fn === 'function') limpezas.push(fn);
    return fn;
  };
  T.sairDaPagina = () => {
    for (const fn of limpezas) {
      try {
        fn();
      } catch (e) {
        console.error('[torre] limpeza falhou', e);
      }
    }
    limpezas = [];
  };

  pag.abertura = function (cap, rota, icone, opts = {}) {
    const alertas = T.alertasDe(rota);
    return T.h(
      'div',
      { class: 'abertura' },
      T.comp.cabecalho(cap, { regua: opts.regua, rota, icone }),
      T.h('div', { class: 'abertura-canais', 'data-revela': '' }, T.comp.canais(cap.kpis.map((k, i) => ({ ...k, explica: opts.explicas ? opts.explicas[i] : null, chave: `${rota}.kpis[${i}].v` })), cap.letra)),
      alertas.length
        ? T.h(
            'div',
            { class: 'abertura-decisoes', 'data-revela': '' },
            T.h('h2', { class: 'bloco-titulo' }, T.icone('decisao'), `Decisões deste capítulo`, T.h('span', { class: 'contador tab' }, String(alertas.length))),
            T.h('div', { class: 'decisoes-faixa' }, alertas.map((a) => T.comp.alerta(a, { compacto: true })))
          )
        : null
    );
  };

  pag.fecho = function (cap, regua, opts = {}) {
    return T.comp.secao(
      { id: 'regua', titulo: opts.titulo || 'O que fazer com isto', sub: 'As decisões e os limites que o próprio capítulo declara — e a régua para os próximos dias.', classe: 'secao-fecho' },
      T.h('div', { class: 'fecho-grade' }, T.comp.muda(cap.muda), T.comp.naoMede(cap.naoMede)),
      regua ? T.comp.regua(regua.linhas, regua.nota, { significado: opts.significado }) : null
    );
  };

  pag.conferencia = function (id) {
    const c = T.dados.livro.conferencias.find((x) => x.id === id);
    if (!c) return null;
    return T.h('aside', { class: 'conferencia' }, T.icone('conferencia'), T.h('div', null, T.h('b', null, 'Conferência do livro · '), c.achado, ' ', T.h('span', { class: 'conferencia-efeito' }, c.efeito)));
  };

  pag.numeroTexto = (v, u) => T.h('span', { class: 'num-texto' }, T.h('b', { class: 'tab' }, v), u ? ` ${u}` : null);
})();
