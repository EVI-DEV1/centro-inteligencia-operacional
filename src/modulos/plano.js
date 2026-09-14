(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const F = L.fechamento;
  const f = T.fmt;
  const EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
  const extenso = (v) => (Number.isInteger(v) && v >= 0 && v < EXTENSO.length ? EXTENSO[v] : f.n(v));
  const faseB = () => L.fases.find((x) => x.id === 'B') || { inicio: L.meta.diaD };

  function pista() {
    const hoje = T.estado.hoje.iso;
    const host = T.h('div', { class: 'pista-host grande' });
    T.cena.pista(host, { focavel: true });
    const faltam = T.diasEntre(hoje, L.meta.diaD);
    return T.h(
      'section',
      { class: 'painel painel-3 plano-pista', id: 'pista', 'data-revela': '' },
      T.h(
        'header',
        { class: 'plano-pista-cab' },
        T.h('div', null, T.h('h3', { class: 'painel-titulo' }, 'Pista até o Dia D'), T.h('p', { class: 'painel-como' }, 'Cada luz é um dia; o tamanho segue a premissa 20/80 (hipótese do gestor). Passe o ponteiro nos marcos para ver o que cada data exige.')),
        T.h(
          'div',
          { class: 'plano-contagem' },
          T.h('div', null, T.h('span', { class: 'leitura' }, 'hoje'), T.h('b', { class: 'num' }, f.data(hoje))),
          T.h('div', null, T.h('span', { class: 'leitura' }, 'até o D-7'), T.h('b', { class: 'num' }, `${Math.max(0, T.diasEntre(hoje, L.meta.d7))} d`)),
          T.h('div', null, T.h('span', { class: 'leitura' }, 'até o Dia D'), T.h('b', { class: 'num destaque' }, `${Math.max(0, faltam)} d`))
        )
      ),
      host
    );
  }

  function marcos() {
    const hoje = T.estado.hoje.iso;
    return T.h(
      'ol',
      { class: 'marcos', role: 'list' },
      F.plano.map((m, i) => {
        const dias = T.diasEntre(hoje, m.ate);
        const status = dias < 0 ? 'vencido' : dias <= 2 ? 'iminente' : 'a-provar';
        return T.h(
          'li',
          { class: ['marco', m.simulado ? 'simulado' : null, `m-${status}`], 'data-revela': '', style: { '--i': i } },
          T.h(
            'div',
            { class: 'marco-data' },
            T.h('span', { class: 'leitura' }, 'até'),
            T.h('b', { class: 'num' }, m.rotulo),
            T.h('small', null, m.diaSemana),
            T.h('span', { class: 'marco-faltam' }, dias < 0 ? `venceu há ${-dias} d` : dias === 0 ? 'é hoje' : `em ${dias} d`),
            T.h('span', { class: 'marco-nucleos' }, m.nucleos.map((n) => T.h('span', { class: 'marco-nucleo', title: T.nucleo(n).nome }, T.icone(T.nucleo(n).icone))))
          ),
          T.h(
            'div',
            { class: 'marco-oque' },
            T.h('h3', null, m.simulado ? 'Simulado de surto' : 'O que precisa estar feito'),
            T.h('ul', { class: 'marco-lista' }, m.oque.map((o) => T.h('li', null, T.h('span', { class: 'caixa-marcar', 'aria-hidden': 'true' }), o)))
          ),
          T.h(
            'div',
            { class: 'marco-prova' },
            T.h('h3', null, T.icone('conferencia'), 'Prova de que ficou pronto'),
            T.h('ul', null, m.prova.map((p) => T.h('li', null, p))),
            T.carimbo(status === 'vencido' ? 'vermelho' : 'nao-medido', status === 'vencido' ? 'Venceu' : 'A provar', true)
          )
        );
      })
    );
  }

  function avisos() {
    const inicio = faseB().inicio;
    const dias = T.diasEntre(inicio, L.meta.diaD) + 1;
    return T.h(
      'div',
      { class: 'plano-avisos' },
      T.h('aside', { class: 'aviso-simulado', 'data-revela': '' }, T.icone('atencao'), T.h('div', null, T.h('b', null, 'Aviso, sem economia de palavras. '), F.avisoSimulado)),
      T.h(
        'aside',
        { class: 'aviso-congelamento', 'data-revela': '' },
        T.icone('congelado'),
        T.h('div', null, T.h('b', null, `Congelamento de ${f.data(inicio)} a ${f.data(L.meta.diaD)}. `), `Nada entra em produção nesses ${extenso(dias)} dias, exceto correção de falha do surto. A prova é a regra escrita e combinada antes de ${f.data(L.meta.d7)}.`)
      )
    );
  }

  function fases() {
    const bloco = (fz, linhas, comHoje) =>
      T.h(
        'article',
        { class: ['fase-cartao', `fase-${fz.id}`], id: `fase-${fz.id.toLowerCase()}`, 'data-revela': '' },
        T.h(
          'header',
          null,
          T.h('span', { class: 'fase-letra' }, fz.id),
          T.h('div', null, T.h('h3', null, `Fase ${fz.id} · ${fz.nome}`), T.h('p', null, `${f.data(fz.inicio)}${fz.inicio !== fz.fim ? ` a ${f.data(fz.fim)}` : ''} · ${fz.objetivo}`))
        ),
        T.h(
          'ul',
          { class: 'fase-metricas' },
          linhas.map((l) =>
            T.h(
              'li',
              { 'data-s': comHoje ? l.status : 'nao-medido' },
              T.h('span', { class: 'fase-metrica' }, l.metrica),
              comHoje ? T.h('b', { class: 'num' }, l.hoje) : null,
              T.h('span', { class: 'fase-regua leitura' }, l.regua),
              T.carimbo(comHoje ? l.status : 'nao-medido', comHoje ? null : 'Instrumentar', true)
            )
          )
        )
      );
    return T.comp.secao(
      { id: 'fases', titulo: 'Três fases, três painéis', sub: 'O que medir em cada fase. A B e a C ainda não existem no sistema: são o painel que precisa estar pronto antes de começarem.' },
      T.h('div', { class: 'fases-grade' }, bloco(L.fases[0], F.metricasFaseA, true), bloco(L.fases[1], F.metricasFaseB, false), bloco(L.fases[2], F.metricasFaseC, false))
    );
  }

  function guardar() {
    return T.comp.secao(
      { id: 'guardar', titulo: 'Os dados que o sistema precisa passar a guardar', sub: 'Sem eles, a Fase A não tem resposta para a pergunta mais básica e os cenários ficam sem chão.' },
      T.h(
        'div',
        { class: 'ficha-ensaio', 'data-revela': '' },
        T.h(
          'div',
          { class: 'tabela-rolagem' },
          T.h(
            'table',
            { class: 'regua guardar' },
            T.h('thead', null, T.h('tr', null, ['O dado', 'Por que importa', 'Como resolver'].map((x) => T.h('th', { scope: 'col' }, x)))),
            T.h('tbody', null, F.dadosAGuardar.map((d) => T.h('tr', null, T.h('th', { scope: 'row' }, d.dado), T.h('td', null, d.porque), T.h('td', { class: 'como' }, d.como))))
          )
        )
      ),
      T.h('div', { class: 'perguntas', 'data-revela': '' }, T.h('h3', { class: 'bloco-titulo' }, T.icone('pergunta'), `As ${extenso(F.perguntas.length)} perguntas que só o gestor responde`), T.h('ol', null, F.perguntas.map((q) => T.h('li', null, T.h('b', null, q.q), T.h('p', null, q.porque)))))
    );
  }

  T.modulos.plano = {
    titulo: 'Caminho para o Dia D',
    render(main) {
      main.append(
        T.h(
          'header',
          { class: 'capitulo-cab', 'data-revela': '' },
          T.h('div', { class: 'capitulo-placa so-icone', 'aria-hidden': 'true' }, T.h('span', { class: 'capitulo-letra' }, T.icone('seta'))),
          T.h(
            'div',
            { class: 'capitulo-textos' },
            T.h('h1', { class: 'capitulo-titulo' }, 'Caminho para o Dia D'),
            T.h('p', { class: 'capitulo-pergunta' }, 'O que precisa acontecer em cada data — e como provar que aconteceu.'),
            T.h('p', { class: 'capitulo-frase' }, L.meta.frase)
          )
        ),
        T.comp.grade('', pista()),
        T.comp.secao({ id: 'marcos', titulo: `Os ${extenso(F.plano.length)} marcos até o D-7`, sub: 'Cada marco com a lista do que precisa estar feito e a prova objetiva. O livro não registra nenhum como concluído: todos começam "a provar".' }, marcos(), avisos()),
        fases(),
        guardar()
      );
    },
  };
})();
