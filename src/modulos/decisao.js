(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const f = T.fmt;

  T.modulos.decisao = {
    titulo: 'Central de Decisão',
    render(main) {
      let filtroNivel = 'todos';
      let filtroArea = 'todas';
      const lista = T.h('div', { class: 'decisao-lista', id: 'lista', role: 'list' });
      const contador = T.h('span', { class: 'filtro-contador tab' });
      const desenhar = () => {
        T.limpar(lista);
        const itens = T.alertas.filter((a) => (filtroNivel === 'todos' || a.nivel === filtroNivel) && (filtroArea === 'todas' || a.area === filtroArea));
        itens.forEach((a) => lista.appendChild(T.h('div', { role: 'listitem' }, T.comp.alerta(a, { comId: true }))));
        contador.textContent = `${itens.length} de ${T.alertas.length}`;
        if (!itens.length) lista.appendChild(T.h('p', { class: 'vazio' }, 'Nenhuma decisão com esse filtro.'));
        if (lista.isConnected) T.numerosNaLeitura(lista);
      };
      const botaoFiltro = (grupo, valor, rotulo, qtd, ativo) =>
        T.h(
          'button',
          {
            type: 'button',
            class: 'filtro',
            'aria-pressed': String(ativo),
            'data-grupo': grupo,
            'data-valor': valor,
            onclick: (e) => {
              if (grupo === 'nivel') filtroNivel = valor;
              else filtroArea = valor;
              T.$$(`.filtro[data-grupo="${grupo}"]`, main).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.valor === valor)));
              desenhar();
            },
          },
          rotulo,
          qtd !== null ? T.h('span', { class: 'tab' }, String(qtd)) : null
        );
      const agir = T.alertas.filter((a) => a.nivel === 'agir').length;
      const filtros = T.h(
        'div',
        { class: 'filtros', role: 'toolbar', 'aria-label': 'Filtrar decisões' },
        T.h('div', { class: 'filtro-grupo' }, botaoFiltro('nivel', 'todos', 'Todas', T.alertas.length, true), botaoFiltro('nivel', 'agir', 'Agir hoje', agir, false), botaoFiltro('nivel', 'atencao', 'Atenção', T.alertas.length - agir, false)),
        T.h('div', { class: 'filtro-grupo' }, botaoFiltro('area', 'todas', 'Todas as áreas', null, true), T.nucleos.map((n) => botaoFiltro('area', n.id, n.nome, T.alertasDe(n.id).length, false))),
        contador
      );
      desenhar();

      main.append(
        T.h(
          'header',
          { class: 'capitulo-cab', 'data-revela': '' },
          T.h('div', { class: 'capitulo-placa so-icone', 'aria-hidden': 'true' }, T.h('span', { class: 'capitulo-letra' }, T.icone('decisao'))),
          T.h(
            'div',
            { class: 'capitulo-textos' },
            T.h('h1', { class: 'capitulo-titulo' }, 'Central de Decisão'),
            T.h('p', { class: 'capitulo-pergunta' }, 'O que decidir nesta semana — e só o que o livro sustenta.'),
            T.h('p', { class: 'capitulo-frase' }, 'Cada decisão traz o nível, a área, o problema, o impacto, a métrica e a ação recomendada pelo próprio relatório, com a página. Nada aqui é recomendação nova.')
          )
        ),
        T.h('div', { class: 'decisao-bloco' }, T.h('div', { class: 'decisao-topo-filtros' }, filtros), lista),
        T.comp.secao(
          { id: 'funciona', titulo: 'O que está funcionando', sub: 'Onde a operação está firme — é onde não se mexe na pré-temporada.' },
          T.h('ul', { class: 'funciona-lista', 'data-revela': '' }, L.fechamento.funcionando.map((x) => T.h('li', null, T.carimbo('verde', null, true), T.h('b', null, x.t), T.h('span', null, x.d))))
        ),
        T.comp.secao(
          { id: 'conferencias', titulo: 'Conferências do próprio livro', sub: 'Divergências encontradas ao cruzar os números do PDF. A Torre mostra o número do livro e sinaliza; não corrige em silêncio.' },
          T.h(
            'div',
            { class: 'conferencias', 'data-revela': '' },
            L.conferencias.map((c) => T.h('article', { class: 'conferencia-cartao' }, T.h('header', null, T.icone('conferencia'), T.h('span', { class: 'leitura' }, c.onde)), T.h('p', null, c.achado), T.h('p', { class: 'conferencia-efeito' }, c.efeito)))
          ),
          T.h('p', { class: 'errata' }, T.h('b', null, `Errata de ${f.data(T.dados.diaMedido())} incorporada pelo livro. `), L.fechamento.errata)
        ),
        T.comp.secao(
          { id: 'cegos', titulo: 'Pontos cegos da operação', sub: 'O que nenhum sistema do clube mede hoje, reunido dos seis capítulos.' },
          T.h(
            'div',
            { class: 'cegos-colunas', 'data-revela': '' },
            [
              ['Pilotos', L.pilotos.naoMede],
              ['Passageiros', L.passageiros.naoMede],
              ['Controladores', L.controladores.naoMede],
              ['Central Horizonte', L.central.naoMede],
              ['Operação', L.operacao.naoMede],
              ['Atendimento e alcance', [...L.atendimento.naoMede, ...L.alcance.naoMede]],
            ].map(([t, lista2]) => T.comp.naoMede(lista2, t))
          )
        )
      );
      T.aoSair(T.on('rota-mesma', ({ alvo }) => alvo && filtroNivel !== 'todos' && desenhar()));
    },
  };
})();
