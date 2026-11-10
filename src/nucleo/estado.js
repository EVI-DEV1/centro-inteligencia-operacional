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

  T.estado = { rota: 'painel', modo: 'explorar' };

  T.definir = (chave, valor) => {
    if (T.estado[chave] === valor) return;
    T.estado[chave] = valor;
    if (chave === 'modo') document.documentElement.dataset.modo = valor;
    T.emit(chave, valor);
  };

  document.documentElement.dataset.modo = T.estado.modo;
})();
