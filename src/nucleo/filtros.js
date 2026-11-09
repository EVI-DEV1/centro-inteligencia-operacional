/* Filtros globais: período e comparação.
   O recorte é aplicado na camada de gráficos (G.linhas, G.barrasDia, G.pequenos), então vale para
   todos os gráficos de série diária de todas as páginas sem que cada capítulo precise saber disso. */
(function () {
  'use strict';
  const T = window.T;
  const G = T.graf;

  const PERIODOS = [
    { id: '7', rotulo: '7 dias', dias: 7 },
    { id: '14', rotulo: '14 dias', dias: 14 },
    { id: '30', rotulo: '30 dias', dias: 30 },
    { id: 'tudo', rotulo: 'Tudo', dias: null },
  ];

  const ler = (k, padrao) => {
    try {
      return localStorage.getItem(`torre:filtro:${k}`) ?? padrao;
    } catch (e) {
      return padrao;
    }
  };
  const gravar = (k, v) => {
    try {
      localStorage.setItem(`torre:filtro:${k}`, v);
    } catch (e) {}
  };

  const F = (T.filtro = {
    PERIODOS,
    periodo: PERIODOS.some((p) => p.id === ler('periodo', 'tudo')) ? ler('periodo', 'tudo') : 'tudo',
    comparar: ler('comparar', '1') === '1',
  });

  F.ultimoDia = () => T.dados.diaMedido();
  F.dias = () => (PERIODOS.find((p) => p.id === F.periodo) || {}).dias || null;
  F.ativo = () => F.dias() !== null;
  F.corte = () => (F.ativo() ? T.isoSomar(F.ultimoDia(), -(F.dias() - 1)) : null);
  F.rotulo = () => (F.ativo() ? `Últimos ${F.dias()} dias` : 'Todo o período');

  const ultimoDe = (serie) => {
    for (let i = serie.length - 1; i >= 0; i--) if (serie[i] && serie[i].d) return serie[i].d;
    return null;
  };
  const corteDe = (fim) => (F.ativo() && fim ? T.isoSomar(fim, -(F.dias() - 1)) : null);

  /** Recorta uma série [{d, v}] aos últimos N dias dela mesma. Se sobrar menos de 2 pontos, devolve a série inteira. */
  F.recortar = (serie, corte) => {
    if (!Array.isArray(serie)) return serie;
    corte = corte || corteDe(ultimoDe(serie));
    if (!corte) return serie;
    const r = serie.filter((p) => !p.d || p.d >= corte);
    return r.length >= 2 ? r : serie;
  };

  /** Janela anterior do mesmo tamanho, para comparação; só vale se estiver quase completa. */
  F.janelaAnterior = (serie) => {
    const n = F.dias();
    if (!n || !Array.isArray(serie)) return null;
    const corte = corteDe(ultimoDe(serie));
    const inicio = T.isoSomar(corte, -n);
    const r = serie.filter((p) => p.d >= inicio && p.d < corte);
    return r.length >= Math.ceil(n * 0.8) ? r : null;
  };

  F.definir = (chave, valor) => {
    if (F[chave] === valor) return;
    F[chave] = valor;
    gravar(chave, chave === 'comparar' ? (valor ? '1' : '0') : valor);
    document.documentElement.dataset.periodo = F.periodo;
    T.emit('filtro', { chave, valor });
  };
  document.documentElement.dataset.periodo = F.periodo;

  // ---- recorte na camada de gráficos ----
  const linhasOriginal = G.linhas;
  G.linhas = function (el, o) {
    if (!o.series || !o.series.length || o.series.every((x) => !x.pontos || !x.pontos.length)) return vazio(el);
    const corte = corteDe(o.x1);
    if (!corte || !o.x0 || !o.x1 || corte <= o.x0 || corte >= o.x1) return linhasOriginal(el, o);
    const series = o.series.map((s) => ({ ...s, pontos: F.recortar(s.pontos, corte) }));
    if (series.some((s) => s.pontos.length < 2)) return linhasOriginal(el, o);
    const faixas = (o.faixas || []).filter((fx) => fx.ate >= corte).map((fx) => ({ ...fx, de: fx.de < corte ? corte : fx.de }));
    return linhasOriginal(el, { ...o, x0: corte, series, faixas });
  };

  const barrasOriginal = G.barrasDia;
  const vazio = (el) => {
    el.appendChild(T.h('p', { class: 'graf-vazio' }, 'Sem dados para este período ou para a planilha importada.'));
    return el;
  };
  G.barrasDia = function (el, o) {
    if (!o.serie || !o.serie.length) return vazio(el);
    if (!F.ativo()) return barrasOriginal(el, o);
    const serie = F.recortar(o.serie);
    if (serie === o.serie) return barrasOriginal(el, o);
    const linhas = (o.linhas || []).map((l) => ({ ...l, pontos: l.pontos.filter((p) => p.d >= serie[0].d) }));
    const faixas = (o.faixas || []).filter((fx) => fx.ate >= serie[0].d).map((fx) => ({ ...fx, de: fx.de < serie[0].d ? serie[0].d : fx.de }));
    return barrasOriginal(el, { ...o, serie, linhas, faixas });
  };

  // ---- cada painel com tabela ganha "exportar CSV" ----
  const painelOriginal = G.painel;
  G.painel = function (o) {
    const sec = painelOriginal(o);
    if (o.tabela && T.planilha) {
      const topo = sec.querySelector('.painel-topo');
      const nome = typeof o.titulo === 'string' ? o.titulo : 'grafico';
      topo &&
        topo.appendChild(
          T.h(
            'button',
            {
              class: 'painel-exportar',
              type: 'button',
              title: 'Exportar os números deste gráfico em CSV',
              onclick: () => T.planilha.baixarCSV([o.tabela.colunas, ...o.tabela.linhas], `torre-${T.planilha.slug(nome)}.csv`),
            },
            T.icone('download'),
            'CSV'
          )
        );
    }
    return sec;
  };
})();
