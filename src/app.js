(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const f = T.fmt;

  const janelaCurta = () => String(L.meta.janela || '').replace(/\s*\(.*\)\s*$/, '');

  const leituraTrilho = () => {
    const n = T.numerosChave();
    return {
      'visao-geral': [f.n(n.vivos), `de ${f.n(n.ativos)} prontos`],
      pilotos: [f.n(n.nuncaFalaram), 'nunca falaram'],
      passageiros: [f.n(n.ritmo), 'por dia, parado'],
      controladores: [f.n(n.semDono), 'sem dono real'],
      central: [f.n(n.teto), `× ${f.n(n.exige)} exigido`],
      operacao: [f.d(n.kraftDias), 'de caixa'],
      atendimento: [f.pct(n.concentracao), 'uma conta'],
      alcance: [f.d(n.coletaParada, 0), 'sem coleta'],
      plano: [String(n.marcos), `marcos até ${f.data(L.meta.d7)}`],
      decisao: [String(T.alertas.filter((a) => a.nivel === 'agir').length), 'para agir hoje'],
    };
  };

  let painelIntegridade = null;
  let integridadeBtn = null;

  function selo() {
    const s = T.s;
    return s(
      'svg',
      { class: 'marca-selo', viewBox: '0 0 48 48', width: 46, height: 46, role: 'img', 'aria-label': 'Clube Horizonte' },
      s('title', null, 'Clube Horizonte'),
      s('circle', { cx: 24, cy: 24, r: 22.6, class: 'selo-fundo' }),
      s('path', { d: 'M14.2 25.5a9.8 9.8 0 0 1 19.6 0', class: 'selo-sol' }),
      s('path', { d: 'M18.6 19.4l-1.6-2.2M24 17.4v-2.8M29.4 19.4l1.6-2.2', class: 'selo-raio' }),
      s('path', { d: 'M5.5 25.5h37', class: 'selo-horizonte' }),
      s('path', { d: 'M13.5 44.2L22.4 25.5M34.5 44.2L25.6 25.5', class: 'selo-estrada' }),
      s('path', { d: 'M24 43.4V27.4', class: 'selo-faixa' })
    );
  }

  function chipFonte() {
    return T.h(
      'span',
      { class: 'chip chip-fonte', 'data-s': 'retrato', title: 'Retrato fixo: os números não atualizam sozinhos' },
      T.icone('relogio'),
      T.h('span', { class: 'chip-rotulo' }, 'Retrato fixo '),
      T.h('b', null, `${f.data(L.meta.medidoEm)} · ${janelaCurta()}`)
    );
  }

  function chipDemo() {
    return T.h(
      'span',
      { class: 'chip chip-demo', title: 'Demonstração: o Clube Horizonte não existe. Pessoas, equipes, lugares e números foram inventados.' },
      T.icone('etiqueta'),
      T.h('b', null, 'Dados fictícios')
    );
  }

  function conteudoIntegridade() {
    return [
      T.h('h2', null, 'Integridade dos dados'),
      T.h('p', null, `Retrato fixo de ${f.data(L.meta.medidoEm)}, ${L.meta.janela}. Não atualiza sozinho.`),
      T.h('p', { class: 'integridade-demo' }, T.icone('etiqueta'), 'Demonstração com dados fictícios: o Clube Horizonte, as pessoas, as equipes e os números foram inventados.'),
      T.comp.sensores(T.dados.sensores(), { compacto: true }),
    ];
  }
  function abrirIntegridade(aberto) {
    if (!painelIntegridade) return;
    painelIntegridade.hidden = !aberto;
    integridadeBtn.setAttribute('aria-expanded', String(aberto));
  }
  document.addEventListener('click', (e) => {
    if (painelIntegridade && !painelIntegridade.hidden && !painelIntegridade.contains(e.target)) abrirIntegridade(false);
  });

  function marcosDoTopo() {
    const M = L.meta.marcos || {};
    const faseB = L.fases.find((x) => x.id === 'B');
    const simulado = Array.isArray(M.simulado) && M.simulado.length ? M.simulado : null;
    return [
      M.redistribuir ? { d: M.redistribuir, t: f.data(M.redistribuir) } : null,
      simulado ? { d: simulado[0], t: `simulado ${simulado.length > 1 ? `${simulado[0].slice(8, 10)}–${f.data(simulado[simulado.length - 1])}` : f.data(simulado[0])}` } : null,
      M.kit ? { d: M.kit, t: f.data(M.kit) } : null,
      { d: L.meta.d7, t: `D-7 · ${f.data(L.meta.d7)}` },
      faseB ? { d: faseB.inicio, t: `surto · ${f.data(faseB.inicio)}` } : null,
      { d: L.meta.diaD, t: `Dia D · ${f.data(L.meta.diaD)}` },
    ]
      .filter(Boolean)
      .sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  }

  function topo() {
    const hoje = T.estado.hoje.iso;
    const faltam = T.diasEntre(hoje, L.meta.diaD);
    const proximo = marcosDoTopo().find((m) => m.d >= hoje);

    const paradas = T.dados.fontesParadas();
    integridadeBtn = T.h(
      'button',
      { class: 'chip chip-integridade', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'painel-integridade', title: 'Integridade dos dados', 'data-paradas': String(paradas) },
      T.icone('sensor'),
      T.h('span', { class: 'chip-rotulo' }, 'Integridade '),
      T.h('b', null, paradas ? `${paradas} fonte${paradas > 1 ? 's' : ''} parada${paradas > 1 ? 's' : ''}` : 'fontes ok')
    );
    painelIntegridade = T.h('div', { class: 'painel-integridade', id: 'painel-integridade', hidden: true }, conteudoIntegridade());
    integridadeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirIntegridade(painelIntegridade.hidden);
    });

    const fases = T.h('div', { class: 'fases', role: 'group', 'aria-label': 'Fase do painel' }, T.h('span', { class: 'fases-rotulo' }, 'Fase'));
    L.fases.forEach((fz) => {
      const b = T.h(
        'button',
        { type: 'button', 'data-fase': fz.id, 'aria-pressed': String(fz.id === T.estado.fase), title: `${fz.nome} · ${f.data(fz.inicio)}${fz.inicio !== fz.fim ? `–${f.data(fz.fim)}` : ''}`, onclick: () => T.definir('fase', fz.id) },
        fz.id,
        T.h('span', { class: 'fase-nome' }, fz.nome),
        fz.id === T.estado.faseDeHoje ? T.h('i', { class: 'fase-hoje', title: 'fase de hoje' }) : null
      );
      fases.appendChild(b);
    });
    T.on('fase', (v) => T.$$('button', fases).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fase === v))));

    const nomesBtn = T.h('button', {
      class: 'botao-icone',
      type: 'button',
      'aria-pressed': String(T.estado.nomes === 'ocultos'),
      'aria-label': 'Ocultar nomes da equipe (N)',
      title: 'Ocultar nomes da equipe (N)',
      onclick: () => T.definir('nomes', T.estado.nomes === 'ocultos' ? 'visiveis' : 'ocultos'),
    });
    const pintarNomes = () => {
      T.limpar(nomesBtn).appendChild(T.icone(T.estado.nomes === 'ocultos' ? 'olho-fechado' : 'olho'));
      nomesBtn.setAttribute('aria-pressed', String(T.estado.nomes === 'ocultos'));
    };
    pintarNomes();
    T.on('nomes', pintarNomes);

    const modos = T.h('div', { class: 'modos', role: 'group', 'aria-label': 'Modo de uso' });
    [
      ['explorar', 'explorar', 'Explorar'],
      ['apresentar', 'apresentar', 'Apresentar'],
      ['telao', 'telao', 'Telão'],
    ].forEach(([id, icone, rotulo]) => {
      modos.appendChild(T.h('button', { type: 'button', 'data-modo': id, 'aria-pressed': String(T.estado.modo === id), onclick: () => T.modo(id) }, T.icone(icone), T.h('span', null, rotulo)));
    });
    T.on('modo', (v) => T.$$('button', modos).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === v))));

    return T.h(
      'header',
      { class: 'topo' },
      T.h(
        'a',
        { class: 'marca', href: '#/', 'aria-label': 'Torre de Controle — visão geral' },
        selo(),
        T.h('span', { class: 'marca-texto' }, T.h('span', { class: 'marca-nome' }, 'Torre de Controle'), T.h('span', { class: 'marca-sub' }, 'Centro de Inteligência Operacional'))
      ),
      T.h(
        'div',
        { class: 'telemetria' },
        chipFonte(),
        fases,
        T.h('span', { class: 'integridade-ancora' }, integridadeBtn, painelIntegridade),
        T.h('span', { class: 'chip', 'data-opcional': '' }, T.icone('livro'), 'Período ', T.h('b', null, `${f.data(L.meta.periodo.inicio)}–${f.data(L.meta.periodo.fim)}`))
      ),
      T.h(
        'div',
        { class: 'contagem', role: 'timer', 'aria-label': `Faltam ${faltam} dias para o Dia D, ${f.data(L.meta.diaD)}` },
        T.h('span', { class: 'contagem-d' }, T.h('small', null, 'D-'), String(Math.max(0, faltam))),
        T.h('span', { class: 'contagem-alvo' }, `até ${f.data(L.meta.diaD)} · adesões fecham ${L.meta.encerramento}`),
        T.h('span', { class: 'contagem-marco' }, proximo ? ['próximo marco ', T.h('b', null, proximo.t), ` · ${proximo.d === hoje ? 'hoje' : `em ${T.diasEntre(hoje, proximo.d)} d`}`] : 'temporada aberta')
      ),
      T.h('div', { class: 'comandos' }, chipDemo(), nomesBtn, modos)
    );
  }

  function rodapeFonte() {
    const m = L.meta;
    return T.h('p', null, 'Fonte: ', T.h('i', null, m.titulo), ` (fictício), v${m.versao}, medido em ${f.data(m.medidoEm)}/${String(m.medidoEm).slice(0, 4)}. Toda cifra traz a página.`);
  }

  function trilho() {
    const nav = T.h('nav', { class: 'trilho', 'aria-label': 'Capítulos da Torre' });
    const leituras = leituraTrilho();
    T.paginas.forEach((p, i) => {
      if (p.id === 'plano') nav.appendChild(T.h('span', { class: 'trilho-separador' }, 'Missão'));
      if (p.id === 'pilotos') nav.appendChild(T.h('span', { class: 'trilho-separador' }, 'Capítulos do livro'));
      const leitura = leituras[p.id];
      const regua = p.capitulo ? T.dados.regua(p.capitulo) : null;
      const estado = regua && regua.length ? { c: T.dados.contagemRegua(regua), pior: T.dados.piorEstado(regua) } : null;
      nav.appendChild(
        T.h(
          'a',
          { class: 'faixa', href: `#/${p.id === 'visao-geral' ? '' : p.id}`, 'data-rota': p.id, title: `${p.nome} (tecla ${i})` },
          T.h('span', { class: 'faixa-codigo', title: p.parte ? `Capítulo F do livro (Atendimento e alcance), parte ${p.parte}` : null }, p.codigoIcone ? T.icone(p.codigoIcone) : p.codigo, p.parte ? T.h('small', { class: 'faixa-parte' }, p.parte) : null),
          T.h(
            'span',
            { class: 'faixa-corpo' },
            T.h('span', { class: 'faixa-nome' }, p.nome),
            T.h(
              'span',
              { class: 'faixa-leitura' },
              T.h('b', null, leitura[0]),
              T.h('span', { class: 'faixa-leitura-texto' }, leitura[1]),
              estado ? T.h('span', { class: 'faixa-estado', 'data-s': estado.pior, title: `Régua: ${estado.c.vermelho} agir hoje · ${estado.c.amarelo} atenção · ${estado.c.verde} firmes` }, T.icone({ vermelho: 'agir', amarelo: 'atencao', verde: 'firme' }[estado.pior] || 'nao-medido'), T.h('b', { class: 'tab' }, String(estado.c[estado.pior] || 0))) : null
            )
          )
        )
      );
    });
    nav.appendChild(
      T.h(
        'div',
        { class: 'trilho-rodape' },
        rodapeFonte(),
        T.h('p', null, T.h('kbd', null, '0'), '–', T.h('kbd', null, '9'), ' capítulos · ', T.h('kbd', null, 'N'), ' nomes · ', T.h('kbd', null, 'P'), ' apresentar · ', T.h('kbd', null, 'T'), ' telão')
      )
    );
    return nav;
  }

  const palco = T.h('main', { class: 'palco', id: 'conteudo', tabindex: '-1' });
  let rotaAtual = null;

  function lerHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [rota, qs] = h.split('?');
    const params = new URLSearchParams(qs || '');
    const id = rota && T.modulos[rota] ? rota : 'visao-geral';
    return { id, alvo: params.get('alvo'), params };
  }
  T.lerHash = lerHash;

  function destacar(alvoId, rolar = true) {
    const el = alvoId ? document.getElementById(alvoId) : null;
    if (!el) return null;
    if (rolar) el.scrollIntoView({ behavior: T.mov.reduzido ? 'auto' : 'smooth', block: T.estado.modo === 'explorar' ? 'start' : 'center' });
    if (T.estado.modo === 'explorar') {
      el.classList.remove('alvo-destacado');
      void el.offsetWidth;
      el.classList.add('alvo-destacado');
      setTimeout(() => el.classList.remove('alvo-destacado'), 2600);
    }
    return el;
  }

  function render() {
    const { id, alvo, params } = lerHash();
    if (id === rotaAtual) {
      destacar(alvo);
      T.emit('rota-mesma', { id, alvo });
      return;
    }
    T.sairDaPagina();
    T.graf.pararVida();
    T.dica.esconder();
    rotaAtual = id;
    T.estado.rota = id;
    const pagina = T.h('div', { class: 'pagina', 'data-pagina': id });
    T.limpar(palco).appendChild(pagina);
    try {
      T.modulos[id].render(pagina);
      T.numerosNaLeitura(pagina);
    } catch (e) {
      console.error('[torre] falha ao montar a página', id, e);
      pagina.appendChild(T.h('p', { class: 'erro-pagina' }, 'Esta página não conseguiu montar. Os dados continuam no livro; recarregue a Torre.'));
    }
    T.$$('.faixa', document).forEach((a) => (a.dataset.rota === id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    const p = T.paginas.find((x) => x.id === id);
    document.title = `Torre de Controle · ${p ? p.nome : 'Visão geral'} · Clube Horizonte (dados fictícios)`;
    T.mov.revelar(pagina);
    if (alvo) setTimeout(() => destacar(alvo), 120);
    else window.scrollTo({ top: 0, behavior: 'auto' });
    const faixa = T.$(`.faixa[data-rota="${id}"]`);
    if (faixa && window.matchMedia('(max-width: 1100px)').matches) faixa.scrollIntoView({ inline: 'center', block: 'nearest' });
    const explica = params.get('explica');
    if (explica) setTimeout(() => T.explicar(explica), 450);
    T.emit('rota', { id, alvo });
  }
  T.irPara = (rota, alvo) => {
    const alvoQs = alvo ? `?alvo=${alvo}` : '';
    const novo = `#/${rota === 'visao-geral' ? '' : rota}${alvoQs}`;
    if (location.hash === novo) render();
    else location.hash = novo;
  };

  const TELAO_MS = 15000;
  const holofote = T.h('div', { class: 'holofote', 'aria-hidden': 'true' });
  const legenda = T.h('div', { class: 'legenda-apresentacao', role: 'region', 'aria-label': 'Roteiro de apresentação', 'aria-live': 'polite' });
  let quadro = 0;
  let timer = null;
  let holofoteAlvo = null;
  let paradaHolofote = null;

  function posicionarHolofote() {
    if (!holofoteAlvo || !document.contains(holofoteAlvo)) {
      holofote.classList.remove('ativo');
      return;
    }
    const r = holofoteAlvo.getBoundingClientRect();
    const pad = 10;
    Object.assign(holofote.style, { top: `${r.top - pad}px`, left: `${r.left - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    holofote.classList.add('ativo');
  }

  const textoLegendaFonte = () => `Telão · retrato de ${f.data(L.meta.medidoEm)} · dados fictícios`;

  function pintarLegenda() {
    const q = T.roteiro[quadro];
    T.limpar(legenda);
    const modo = T.estado.modo;
    legenda.append(
      T.h(
        'div',
        { class: 'legenda-topo' },
        T.h('span', { class: 'leitura legenda-fonte' }, modo === 'telao' ? textoLegendaFonte() : 'Apresentação'),
        T.h('span', { class: 'legenda-contador tab' }, `${quadro + 1} / ${T.roteiro.length}`),
        T.h('span', { class: 'legenda-pontos' }, T.roteiro.map((_, i) => T.h('i', { class: i === quadro ? 'atual' : i < quadro ? 'feito' : null })))
      ),
      T.h('p', { class: 'legenda-texto' }, q.legenda),
      T.h(
        'div',
        { class: 'legenda-comandos' },
        T.h('button', { class: 'botao-icone', type: 'button', 'aria-label': 'Quadro anterior (←)', onclick: () => irQuadro(quadro - 1) }, T.icone('anterior')),
        modo === 'telao'
          ? T.h('button', { class: 'botao-icone', type: 'button', 'aria-label': timer ? 'Pausar telão' : 'Retomar telão', onclick: alternarPausa }, T.icone(timer ? 'pausa' : 'tocar'))
          : null,
        T.h('button', { class: 'botao-icone', type: 'button', 'aria-label': 'Próximo quadro (→)', onclick: () => irQuadro(quadro + 1) }, T.icone('proximo')),
        T.h('button', { class: 'legenda-sair', type: 'button', onclick: () => T.modo('explorar') }, 'Sair', T.h('kbd', null, 'Esc'))
      ),
      ...(modo === 'telao' ? [T.h('span', { class: ['legenda-progresso', timer ? 'correndo' : null], style: { '--dur': `${TELAO_MS}ms` } })] : [])
    );
  }

  function agendar() {
    clearTimeout(timer);
    timer = null;
    if (T.estado.modo !== 'telao') return;
    timer = setTimeout(() => irQuadro(quadro + 1), TELAO_MS);
  }
  function alternarPausa() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    } else agendar();
    pintarLegenda();
  }

  function irQuadro(i) {
    const n = T.roteiro.length;
    quadro = ((i % n) + n) % n;
    const q = T.roteiro[quadro];
    const mostrar = () => {
      holofoteAlvo = document.getElementById(q.alvo);
      if (holofoteAlvo) holofoteAlvo.scrollIntoView({ behavior: T.mov.reduzido ? 'auto' : 'smooth', block: 'center' });
      setTimeout(posicionarHolofote, 30);
    };
    if (rotaAtual !== q.rota) {
      holofote.classList.remove('ativo');
      T.irPara(q.rota);
      setTimeout(mostrar, 520);
    } else mostrar();
    agendar();
    pintarLegenda();
  }

  T.modo = function (modo) {
    const anterior = T.estado.modo;
    T.definir('modo', modo);
    if (modo === 'explorar') {
      clearTimeout(timer);
      timer = null;
      holofoteAlvo = null;
      holofote.classList.remove('ativo');
      legenda.classList.remove('visivel');
      paradaHolofote && paradaHolofote();
      paradaHolofote = null;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      return;
    }
    legenda.classList.add('visivel');
    if (!paradaHolofote) {
      let ultimo = '';
      paradaHolofote = T.mov.laco(() => {
        if (!holofoteAlvo) return;
        const r = holofoteAlvo.getBoundingClientRect();
        const chave = `${r.top | 0}:${r.left | 0}:${r.width | 0}:${r.height | 0}`;
        if (chave !== ultimo) {
          ultimo = chave;
          posicionarHolofote();
        }
      });
    }
    if (modo === 'telao' && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    irQuadro(anterior === 'explorar' ? 0 : quadro);
  };

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
    const modo = T.estado.modo;
    if (modo !== 'explorar') {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        irQuadro(quadro + 1);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        irQuadro(quadro - 1);
        return;
      }
      if (e.key === 'Escape') {
        T.modo('explorar');
        return;
      }
    }
    if (/^[0-9]$/.test(e.key)) {
      const p = T.paginas[Number(e.key)];
      if (p) T.irPara(p.id);
    } else if (e.key === 'n' || e.key === 'N') T.definir('nomes', T.estado.nomes === 'ocultos' ? 'visiveis' : 'ocultos');
    else if ((e.key === 'p' || e.key === 'P') && modo === 'explorar') T.modo('apresentar');
    else if ((e.key === 't' || e.key === 'T') && modo === 'explorar') T.modo('telao');
  });

  let ociosidade = null;
  document.addEventListener('pointermove', () => {
    document.documentElement.classList.remove('ponteiro-oculto');
    clearTimeout(ociosidade);
    if (T.estado.modo === 'telao') ociosidade = setTimeout(() => document.documentElement.classList.add('ponteiro-oculto'), 2500);
  });

  function iniciar() {
    const raiz = document.getElementById('app');
    T.limpar(raiz);
    const topoEl = topo();
    const trilhoEl = trilho();
    [topoEl, trilhoEl].forEach((el) => T.numerosNaLeitura(el));
    raiz.append(T.h('a', { class: 'pular', href: '#conteudo' }, 'Pular para o conteúdo'), topoEl, trilhoEl, palco);
    document.body.append(holofote, legenda);
    window.addEventListener('hashchange', render);
    window.addEventListener('resize', () => T.estado.modo !== 'explorar' && posicionarHolofote());
    render();
    document.documentElement.classList.add('pronto');
    if (lerHash().params.get('integridade') === '1') abrirIntegridade(true);
    T.emit('montado');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
