/* Comparar clientes · só administradores. Indicadores normalizados para não punir quem é menor:
   leads por mil de alcance, taxas (%) e crescimento (%) em vez de volumes brutos. */
(function () {
  'use strict';
  const T = window.T;
  const f = T.fmt;
  const O = T.ops;
  const N = O.nucleo;
  const U = O.ui;

  const COLUNAS = [
    { id: 'crescimentoLeads', nome: 'Crescimento de leads', fmt: (v) => `${v > 0 ? '+' : ''}${f.nFlex(v, 1)}%`, normalizado: true },
    { id: 'leadsPorMilAlcance', nome: 'Leads por mil de alcance', fmt: (v) => f.nFlex(v, 2), normalizado: true },
    { id: 'taxaEngajamento', nome: 'Engajamento', fmt: (v) => f.pct(v, 1), normalizado: true },
    { id: 'taxaConversao', nome: 'Conversão', fmt: (v) => f.pct(v, 1), normalizado: true },
    { id: 'crescimentoAudiencia', nome: 'Crescimento de seguidores', fmt: (v) => `${v > 0 ? '+' : ''}${f.nFlex(v, 1)}%`, normalizado: true },
    { id: 'metaCampanhas', nome: 'Ritmo das campanhas', fmt: (v) => f.pct(v, 0), normalizado: true, ajuda: 'Leads captados ÷ esperado pelo tempo decorrido (100% = no ritmo).' },
    { id: 'leads', nome: 'Leads (volume)', fmt: f.n, normalizado: false },
  ];

  async function linhas(fl) {
    if (O.ehDemo()) return O.demo.CLIENTES.map((c) => ({ cliente: c, ...N.comparativo(O.demo.gerar(c.id, O.hoje()), { ...fl, plataforma: 'todas', campanha: 'todas' }) }));
    const r = await O.chamar(`comparar?de=${fl.janela.de}&ate=${fl.janela.ate}`);
    return r.linhas;
  }

  function tabela(dados) {
    const melhor = {};
    COLUNAS.forEach((c) => {
      const vs = dados.map((d) => d[c.id]).filter((v) => v !== null && v !== undefined);
      melhor[c.id] = vs.length ? Math.max(...vs) : null;
    });
    return T.h(
      'div',
      { class: 'ops-tabela-rola' },
      T.h(
        'table',
        { class: 'ops-tabela ops-comparar' },
        T.h('thead', null, T.h('tr', null, T.h('th', { scope: 'col' }, 'Cliente'), COLUNAS.map((c) => T.h('th', { scope: 'col', title: c.ajuda || null }, c.nome, c.normalizado ? null : T.h('small', null, ' (bruto)'))))),
        T.h(
          'tbody',
          null,
          dados.map((d) =>
            T.h(
              'tr',
              null,
              T.h('th', { scope: 'row' }, T.h('button', { class: 'botao-fantasma', type: 'button', onclick: () => { O.definir({ cliente: d.cliente.id }); T.irPara('painel'); } }, d.cliente.nome)),
              COLUNAS.map((c) => {
                const v = d[c.id];
                if (v === null || v === undefined) return T.h('td', { class: 'na' }, T.h('span', { title: 'Sem dados ou integração para este indicador' }, 'n/d'));
                const frac = melhor[c.id] ? Math.max(0, v) / Math.max(0.0001, melhor[c.id]) : 0;
                return T.h('td', { class: ['tab', v === melhor[c.id] && dados.length > 1 ? 'melhor' : null] }, T.h('span', { class: 'ops-barra-celula' }, T.h('i', { style: { '--w': `${Math.min(100, frac * 100)}%` } }), T.h('b', null, c.fmt(v))));
              })
            )
          )
        )
      )
    );
  }

  T.modulos.comparar = {
    render(raiz) {
      const fl = O.f();
      if (!O.ehAdmin()) {
        raiz.appendChild(U.vazio('Disponível só para administradores', 'A comparação entre clientes reúne dados de vários clientes e por isso é restrita.'));
        return;
      }
      raiz.append(
        U.cabecalho({ sobretitulo: [T.icone('tendencia'), 'Administração · todos os clientes'], titulo: 'Comparar clientes', lead: `Crescimento, leads, engajamento, conversão e campanhas, normalizados para clientes de tamanhos diferentes · ${U.periodoTexto(fl.janela)}.` })
      );
      const corpo = T.h('div', null, U.esqueleto());
      raiz.appendChild(U.cartao({ id: 'comparar-tabela', titulo: 'Indicadores normalizados', sub: 'A melhor marca de cada coluna fica destacada · clique no nome para abrir a Visão Executiva do cliente', classe: 'largo', rodape: U.rodapeFonte(['Indicadores de cada cliente'], fl.janela, T.h('span', null, 'Volumes brutos só como referência')) }, corpo));
      linhas(fl)
        .then((d) => {
          T.limpar(corpo).appendChild(d.length ? tabela(d) : U.vazio('Nenhum cliente para comparar'));
          T.numerosNaLeitura(corpo);
        })
        .catch((e) => T.limpar(corpo).appendChild(U.indisponivel(e.message)));
    },
  };
})();
