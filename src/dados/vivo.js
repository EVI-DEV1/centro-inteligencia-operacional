(function () {
  'use strict';
  const T = (window.T = window.T || {});

  const livroMeta = () => (window.TORRE_LIVRO && window.TORRE_LIVRO.meta) || {};
  const ddmm = (iso) => (iso ? `${String(iso).slice(8, 10)}/${String(iso).slice(5, 7)}` : '—');

  const vivo = (T.vivo = {
    api: null,
    ativo: false,
    medicao: null,
    proveniencia: {},
    revisoes: [],
    erro: null,
    pronto: Promise.resolve(false),
  });

  vivo.situacao = () => ({ estado: 'retrato' });
  vivo.atualizar = () => Promise.resolve(false);
  vivo.hora = () => '—';
  vivo.dataHora = () => '—';
  vivo.dataLivro = () => ddmm(livroMeta().medidoEm);
  vivo.prov = () => {
    const base = vivo.dataLivro();
    return { origem: 'retrato', rotulo: 'Do livro', detalhe: `${base} · retrato fixo`, medidoEm: base };
  };
  vivo.revisao = () => null;
  vivo.marcador = () => null;
  vivo.marcarRevisados = () => {};
  vivo.linhaProveniencia = function (chave) {
    const p = vivo.prov(chave);
    return T.h('div', { class: 'proveniencia', 'data-origem': p.origem }, T.icone('livro'), T.h('b', null, p.rotulo), ' ', T.h('span', { class: 'proveniencia-detalhe' }, p.detalhe));
  };
})();
