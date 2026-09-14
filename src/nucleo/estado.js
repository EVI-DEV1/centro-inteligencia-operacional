(function () {
  'use strict';
  const T = window.T;
  const ouvintes = new Map();

  T.on = (evt, fn) => {
    if (!ouvintes.has(evt)) ouvintes.set(evt, new Set());
    ouvintes.get(evt).add(fn);
    return () => ouvintes.get(evt).delete(fn);
  };
  T.emit = (evt, dado) => (ouvintes.get(evt) || []).forEach((fn) => fn(dado));

  const guardado = (chave, padrao) => {
    try {
      const v = localStorage.getItem(`torre:${chave}`);
      return v === null ? padrao : v;
    } catch (e) {
      return padrao;
    }
  };
  const guardar = (chave, v) => {
    try {
      localStorage.setItem(`torre:${chave}`, v);
    } catch (e) {
    }
  };

  const hoje = T.hojeBrasilia();
  const faseDeHoje = () => {
    const fases = window.TORRE_LIVRO.fases;
    const f = fases.find((x) => hoje.iso >= x.inicio && hoje.iso <= x.fim);
    if (f) return f.id;
    return hoje.iso < fases[0].inicio ? 'A' : 'C';
  };

  T.estado = {
    rota: 'visao-geral',
    fase: faseDeHoje(),
    faseDeHoje: faseDeHoje(),
    modo: 'explorar',
    nomes: guardado('nomes', 'visiveis'),
    hoje,
  };

  T.definir = (chave, valor) => {
    if (T.estado[chave] === valor) return;
    T.estado[chave] = valor;
    const raiz = document.documentElement;
    if (chave === 'fase') raiz.dataset.fase = valor;
    if (chave === 'modo') raiz.dataset.modo = valor;
    if (chave === 'nomes') {
      raiz.dataset.nomes = valor;
      guardar('nomes', valor);
    }
    T.emit(chave, valor);
  };

  document.documentElement.dataset.fase = T.estado.fase;
  document.documentElement.dataset.modo = T.estado.modo;
  document.documentElement.dataset.nomes = T.estado.nomes;
})();
