(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const f = T.fmt;
  const G = T.graf;

  function hero() {
    const hoje = T.estado.hoje.iso;
    const faltam = T.diasEntre(hoje, L.meta.diaD);
    const palco = T.h('div', { class: 'vg-palco' });
    const canvas = T.h('canvas', { class: 'vg-poeira', 'aria-hidden': 'true' });
    const torreHost = T.h('div', { class: 'vg-torre' });
    palco.append(canvas, torreHost);

    const vivos = L.pilotos.funil.find((d) => d.id === 'vivo');
    const ativos = L.pilotos.funil.find((d) => d.id === 'ativos');
    const prontos = (L.fechamento.metricasFaseA || []).find((m) => /^Pilotos prontos/.test(m.metrica));
    const faixaMeta = prontos && prontos.meta ? String(prontos.meta).replace('–', ' a ') : '—';
    const alertas = T.alertas.filter((a) => a.nivel === 'agir');
    const decisao = T.h(
      'aside',
      { class: 'vg-decisao', 'aria-labelledby': 'vg-decisao-titulo' },
      T.h(
        'header',
        { class: 'vg-decisao-cab' },
        T.h('h2', { id: 'vg-decisao-titulo' }, 'Central de Decisão'),
        T.h('p', null, T.h('b', { class: 'tab' }, String(alertas.length)), ' para agir hoje · ', T.h('b', { class: 'tab' }, String(T.alertas.length - alertas.length)), ' em atenção')
      ),
      T.h('div', { class: 'vg-decisao-lista' }, alertas.slice(0, 6).map((a) => T.comp.alerta(a, { compacto: true }))),
      T.h('a', { class: 'link-seta vg-decisao-todas', href: '#/decisao' }, `Todas as ${T.alertas.length} decisões`, T.icone('seta'))
    );

    const funilMovel = T.h(
      'ol',
      { class: 'vg-funil-movel', 'aria-label': 'Funil de prontidão dos pilotos' },
      L.pilotos.funil.map((d) =>
        T.h(
          'li',
          { class: d.operacional ? 'operacional' : null },
          T.h('a', { href: '#/pilotos?alvo=funil' }, T.h('b', { class: 'num' }, f.n(d.v)), T.h('span', null, d.rotulo), T.h('small', { class: 'tab' }, f.pct(d.pct)))
        )
      )
    );
    const sec = T.h(
      'section',
      { class: 'vg-hero', id: 'cena' },
      T.h(
        'div',
        { class: 'vg-cabeca' },
        T.h('h1', { class: 'vg-titulo' }, 'A base existe. ', T.h('span', null, 'A base pronta, não.')),
        T.h(
          'p',
          { class: 'vg-lead' },
          vivos && ativos ? [T.h('b', null, f.n(vivos.v)), ` de ${f.n(ativos.v)} pilotos estão prontos — a meta para ${f.data(L.meta.d7)} é `] : `A meta para ${f.data(L.meta.d7)} é `,
          T.h('b', null, faixaMeta),
          `. Faltam ${faltam} dias para ${f.data(L.meta.diaD)}. Os números de hoje medem prontidão, não resultado.`
        )
      ),
      palco,
      funilMovel,
      decisao
    );
    const listaDecisao = T.$('.vg-decisao-lista', decisao);
    const ajustarDecisao = () => {
      const cartoes = Array.from(listaDecisao.children);
      cartoes.forEach((c) => (c.hidden = false));
      if (window.matchMedia('(max-width: 1200px)').matches) return;
      const limite = listaDecisao.getBoundingClientRect().bottom + 1;
      let cortou = false;
      cartoes.forEach((c, i) => {
        if (cortou || (i > 0 && c.getBoundingClientRect().bottom > limite)) {
          c.hidden = true;
          cortou = true;
        }
      });
    };
    const roDecisao = new ResizeObserver(() => requestAnimationFrame(ajustarDecisao));
    requestAnimationFrame(() => {
      const torre = T.cena.torre(torreHost);
      T.numerosNaLeitura(torreHost);
      const poeira = T.cena.particulas(canvas, { quantidade: 80 });
      roDecisao.observe(listaDecisao);
      if (document.fonts) document.fonts.ready.then(ajustarDecisao);
      T.aoSair(() => {
        torre.destruir();
        poeira.destruir();
        roDecisao.disconnect();
      });
    });
    return sec;
  }

  function pista() {
    const host = T.h('div', { class: 'pista-host' });
    const sec = T.h(
      'section',
      { class: 'vg-pista', id: 'pista', 'data-revela': '' },
      T.h(
        'div',
        { class: 'vg-pista-cab' },
        T.h('h2', null, 'Pista até o Dia D'),
        T.h('p', null, `Cada luz é um dia. O tamanho segue a premissa 20/80 do gestor${L.premissa2080 && typeof L.premissa2080.diaVale === 'number' ? ` — um dia da última semana vale ${f.nFlex(L.premissa2080.diaVale, 1)} dias de hoje` : ''}. É hipótese declarada, não medida.`),
        T.h('button', { class: 'link-seta', 'data-explica': 'premissa', type: 'button' }, 'o que é a premissa', T.icone('seta'))
      ),
      host
    );
    T.cena.pista(host);
    return sec;
  }

  function prontidao() {
    const corpo = T.h('div', { class: 'prontidao-corpo' });
    const desenhar = () => {
      T.limpar(corpo);
      const fase = T.estado.fase;
      const faseInfo = L.fases.find((x) => x.id === fase);
      if (fase === 'A') {
        const linhas = L.fechamento.metricasFaseA;
        const cont = T.dados.contagemRegua(linhas);
        corpo.append(
          T.h(
            'div',
            { class: 'prontidao-placar' },
            T.h('p', { class: 'prontidao-frase' }, 'Índice de prontidão sem fórmula inventada: é a própria régua do livro, contada.'),
            T.h(
              'div',
              { class: 'placar-celulas', role: 'img', 'aria-label': `${cont.verde} firmes, ${cont.amarelo} em atenção, ${cont.vermelho} para agir hoje, ${cont['nao-medido']} não medida` },
              linhas.map((l) => T.h('span', { class: 'placar-cel', 'data-s': l.status, title: l.metrica }))
            ),
            T.h(
              'div',
              { class: 'tally-linhas' },
              [['vermelho', 'agir hoje'], ['amarelo', 'atenção'], ['verde', 'firmes'], ['nao-medido', 'não medida']].map(([k, t]) =>
                T.h('span', { class: 'tally', 'data-s': k }, T.icone({ vermelho: 'agir', amarelo: 'atencao', verde: 'firme', 'nao-medido': 'nao-medido' }[k]), T.h('b', { class: 'tab' }, String(cont[k] || 0)), t)
              )
            )
          ),
          T.h(
            'ol',
            { class: 'prontidao-lista' },
            linhas.map((l) => {
              const n = T.nucleo(l.nucleo);
              return T.h(
                'li',
                { class: 'prontidao-item', 'data-s': l.status },
                T.h('span', { class: 'prontidao-metrica' }, l.metrica),
                T.h('span', { class: 'prontidao-hoje' }, T.h('small', { class: 'leitura' }, 'hoje'), T.h('b', { class: 'num' }, l.hoje)),
                T.h('span', { class: 'prontidao-meta' }, T.h('small', { class: 'leitura' }, `meta ${f.data(L.meta.d7)}`), T.h('b', { class: 'num' }, l.meta)),
                T.h('span', { class: 'prontidao-regua leitura' }, l.regua),
                T.carimbo(l.status, l.status === 'nao-medido' ? 'Não medido' : null, true),
                T.h('a', { class: 'prontidao-ir', href: `#/${l.nucleo}`, 'aria-label': `Abrir ${n ? n.nome : ''}` }, T.icone(n ? n.icone : 'seta'))
              );
            })
          )
        );
      } else {
        const linhas = fase === 'B' ? L.fechamento.metricasFaseB : L.fechamento.metricasFaseC;
        corpo.append(
          T.h(
            'div',
            { class: 'prontidao-placar' },
            T.h('p', { class: 'prontidao-frase' }, `Fase ${fase} · ${faseInfo.nome}: ${faseInfo.objetivo} Estas métricas ainda não existem no sistema — são o painel que precisa estar pronto antes de ${f.data(faseInfo.inicio)}.`),
            T.h('div', { class: 'placar-celulas' }, linhas.map((l) => T.h('span', { class: 'placar-cel', 'data-s': 'nao-medido', title: l.metrica })))
          ),
          T.h(
            'ol',
            { class: 'prontidao-lista fase-futura' },
            linhas.map((l) =>
              T.h(
                'li',
                { class: 'prontidao-item', 'data-s': 'nao-medido' },
                T.h('span', { class: 'prontidao-metrica' }, l.metrica),
                T.h('span', { class: 'prontidao-regua leitura' }, l.regua),
                T.carimbo('nao-medido', 'Instrumentar', true)
              )
            )
          )
        );
      }
    };
    desenhar();
    T.aoSair(T.on('fase', desenhar));
    const faseSel = T.h('div', { class: 'seletor-fase', role: 'group', 'aria-label': 'Escolher a fase do painel' });
    const atualizarSel = () => T.$$('button', faseSel).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fase === T.estado.fase)));
    L.fases.forEach((fz) =>
      faseSel.appendChild(
        T.h('button', { type: 'button', 'data-fase': fz.id, onclick: () => T.definir('fase', fz.id) }, T.h('b', null, `Fase ${fz.id}`), T.h('span', null, `${fz.nome} · ${f.data(fz.inicio)}${fz.inicio !== fz.fim ? `–${f.data(fz.fim)}` : ''}`))
      )
    );
    atualizarSel();
    T.aoSair(T.on('fase', atualizarSel));
    return T.comp.secao({ id: 'prontidao', titulo: 'Prontidão da fase', sub: 'As métricas que o livro manda olhar todo dia, com a régua de cada uma. A fase muda o que se prioriza.' }, faseSel, T.h('div', { 'data-revela': '' }, corpo));
  }

  function tresNumeros() {
    const tn = L.tresNumeros;
    const cartao = (id, destaque) => {
      const x = tn[id];
      const e = T.explicacoes[id];
      return T.h(
        'article',
        { class: ['numero-painel', destaque ? 'fato' : null], 'data-revela': '' },
        T.h('h3', null, e.titulo),
        T.h('button', { class: 'numero-grande num', type: 'button', 'data-explica': id }, T.mov.numero(x.v, f.n)),
        T.h('p', { class: 'numero-def' }, x.def),
        T.h('p', { class: 'numero-nao' }, T.icone('info'), x.naoE),
        T.h('p', { class: 'numero-leitura' }, x.leitura)
      );
    };
    const decomp = T.h('div', { class: 'decomposicao', 'data-revela': '' });
    const cores = { orfaos: 'var(--tinta-4)', deposito: 'var(--agir)', dobro: 'var(--eletrico)', novos: 'var(--tinta-4)', antigos: 'var(--tinta-4)', produz: 'var(--ciano)' };
    decomp.append(
      T.h('h3', { class: 'bloco-titulo' }, `De onde vêm os ${f.n(tn.projetada.v)} da Projetada`),
      T.h('p', { class: 'bloco-sub' }, 'Decomposição exclusiva: cada piloto em um grupo só. Hachura = ficha sem sinal nenhum; cor = ficha com dono e algum sinal.')
    );
    G.faixa(decomp, {
      nome: 'Decomposição da Projetada',
      alta: true,
      segmentos: tn.decomposicao.map((g) => ({ rotulo: `${g.grupo} — ${f.n(g.pilotos)} pilotos`, v: g.meta, cor: cores[g.id], textura: g.natureza === 'ficha', curto: f.compacto(g.meta) })),
    });
    decomp.append(
      T.h(
        'div',
        { class: 'decomposicao-marcos' },
        T.h('div', null, T.h('span', { class: 'leitura' }, 'piso honesto'), T.h('b', { class: 'num' }, f.n(tn.pisoHonesto)), T.h('small', null, `meta de quem já produziu (${f.n(tn.metaDeQuemJaProduz.pilotos)} pilotos)`)),
        T.h('div', null, T.h('span', { class: 'leitura' }, 'teto honesto'), T.h('b', { class: 'num' }, f.n(tn.tetoHonesto)), T.h('small', null, 'com dono e algum sinal')),
        T.h('div', null, T.h('span', { class: 'leitura' }, 'só ficha'), T.h('b', { class: 'num' }, f.n(tn.soFicha)), T.h('small', null, 'órfãos, triagem e fichas sem passageiro'))
      )
    );
    return T.comp.secao(
      { id: 'tres-numeros', titulo: 'Os três números — e por que nenhum deles é o resultado', sub: 'Projetada ≠ previsão. Real ≠ contabilizado. Contabilizados = o que já está registrado no sistema.' },
      T.h('div', { class: 'numeros-trio' }, cartao('projetada'), cartao('real'), cartao('contabilizados', true)),
      decomp
    );
  }

  function distancia() {
    const c = T.dados.cenarios();
    const equipe = c.linhas.filter((l) => !l.limite);
    const nenhumChega = equipe.every((l) => l.final < c.metaDeclarada);
    const corpo = T.h('div');
    const diaD = f.data(L.meta.diaD);
    const maiorY = Math.max(c.metaDeclarada, c.projetada, ...equipe.map((l) => l.final));
    const faixasFase = L.fases.filter((fz) => fz.inicio !== fz.fim).map((fz) => ({ de: fz.inicio, ate: fz.fim, classe: `fase-${fz.id.toLowerCase()}`, rotulo: `Fase ${fz.id}` }));
    G.linhas(corpo, {
      nome: `Acumulado e cenários até ${diaD}`,
      altura: 320,
      x0: L.meta.periodo.inicio,
      x1: L.meta.diaD,
      yMax: Math.ceil((maiorY * 1.08) / 10000) * 10000,
      formatoEixo: f.compacto,
      faixas: faixasFase,
      referencias: [
        { v: c.metaDeclarada, rotulo: `meta declarada ${f.n(c.metaDeclarada)}`, cor: 'var(--tinta-2)' },
        { v: c.projetada, rotulo: `Projetada do painel ${f.n(c.projetada)}`, cor: 'var(--referencia)' },
      ],
      marcadores: [{ d: T.estado.hoje.iso, rotulo: 'hoje', classe: 'hoje' }],
      series: [
        { nome: 'registrado', pontos: c.registrado, cor: 'var(--eletrico)', largura: 2.5, rotuloFim: false, pontoFim: true },
        { nome: 'linha reta no ritmo atual', pontos: c.reta, cor: 'var(--referencia)', tracejado: true, rotuloFim: true, pontoFim: false },
        ...c.linhas.filter((l) => !l.limite).map((l, i) => ({ nome: `${l.nome} (${l.captura}%)`, pontos: l.pontos, cor: `var(--cen-${i + 1})`, rotuloFim: true })),
      ],
    });
    return T.comp.secao(
      { id: 'distancia', titulo: 'A distância até a expectativa', sub: `O registrado, a linha reta e os ${equipe.length === 3 ? 'três' : f.n(equipe.length)} cenários da equipe${nenhumChega ? ` — nenhum chega à meta de ${f.n(c.metaDeclarada)}` : ''}.` },
      T.h(
        'div',
        { class: 'distancia-grade' },
        G.painel({
          titulo: 'Do primeiro dia da base até o Dia D',
          comoLer: `Violeta: registrado. Tracejado cinza: o ritmo atual até ${diaD}. Rampa de violeta a ciano: pessimista → médio → otimista, com o 20/80 e a captura de cada um.`,
          grafico: (el) => el.appendChild(corpo),
          leitura: L.passageiros.cenarios.leitura,
          p: 15,
          largura: 2,
          tabela: { colunas: ['Cenário', 'Ritmo/dia', `Base ${f.data(L.meta.d7)}`, 'Captura', 'Reg./dia no surto', '× melhor dia', `Em ${diaD}`, '% da meta'], linhas: L.passageiros.cenarios.linhas.map((l) => [l.nome, f.n(l.ritmo), f.n(l.baseD7), f.pct(l.captura, 0), f.n(l.regDiaSurto), f.x(l.xMelhorDia), f.n(l.emDiaD), f.pct(l.pctMeta)]) },
        }),
        T.h(
          'div',
          { class: 'distancia-lado', 'data-revela': '' },
          L.passageiros.cenarios.linhas.map((l, i) =>
            T.h(
              'div',
              { class: ['cenario-linha', l.limite ? 'limite' : null], style: { '--c': l.limite ? 'var(--tinta-3)' : `var(--cen-${i + 1})` } },
              T.h('span', { class: 'cenario-nome' }, l.nome, T.h('small', null, `captura ${l.captura}%`)),
              T.h('b', { class: 'num' }, f.n(l.emDiaD)),
              T.h('span', { class: 'cenario-meta' }, `${f.pct(l.pctMeta)} da meta`)
            )
          ),
          T.h('p', { class: 'distancia-nota' }, L.passageiros.cenarios.cuidado)
        )
      )
    );
  }

  function funcionando() {
    return T.comp.secao(
      { id: 'funciona', titulo: 'O que está funcionando', sub: 'O livro também diz onde a operação está firme — é onde não se mexe na pré-temporada.' },
      T.h(
        'ul',
        { class: 'funciona-lista', 'data-revela': '' },
        L.fechamento.funcionando.map((x) => T.h('li', null, T.carimbo('verde', null, true), T.h('b', null, x.t), T.h('span', null, x.d)))
      )
    );
  }

  function cegos() {
    return T.comp.secao(
      { id: 'integridade', titulo: 'Integridade dos dados e pontos cegos', sub: 'O que este painel sabe, até quando sabe — e o que nenhum sistema do clube mede.' },
      T.h(
        'div',
        { class: 'cegos-grade' },
        T.h('div', { 'data-revela': '' }, T.h('h3', { class: 'bloco-titulo' }, T.icone('sensor'), 'Sensores'), T.comp.sensores(T.dados.sensores())),
        T.h(
          'div',
          { class: 'perguntas', 'data-revela': '' },
          T.h('h3', { class: 'bloco-titulo' }, T.icone('pergunta'), `As ${L.fechamento.perguntas.length === 3 ? 'três' : f.n(L.fechamento.perguntas.length)} perguntas que só o gestor responde`),
          T.h('ol', null, L.fechamento.perguntas.map((q) => T.h('li', null, T.h('b', null, q.q), T.h('p', null, q.porque))))
        )
      )
    );
  }

  T.modulos['visao-geral'] = {
    titulo: 'Visão geral',
    render(main) {
      main.append(hero(), pista(), prontidao(), tresNumeros(), distancia(), funcionando(), cegos());
    },
  };
})();
