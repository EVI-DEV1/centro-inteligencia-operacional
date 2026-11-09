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

  const ICONE_PAGINA = { painel: 'painel', 'visao-geral': 'visao', dados: 'dados' };

  function logo() {
    const s = T.s;
    const id = T.uid('lg');
    return s(
      'svg',
      { class: 'logo', viewBox: '0 0 32 32', width: 32, height: 32, 'aria-hidden': 'true' },
      s('defs', null, s('linearGradient', { id, x1: 0, y1: 0, x2: 1, y2: 1 }, s('stop', { offset: '0%', 'stop-color': '#7c6cff' }), s('stop', { offset: '100%', 'stop-color': '#22d3ee' }))),
      s('rect', { width: 32, height: 32, rx: 9, fill: `url(#${id})` }),
      s('path', { d: 'M16 6.5v19M11.5 25.5h9M12.5 12.5h7l-1 6h-5z', fill: 'none', stroke: '#0a0a0d', 'stroke-width': 2.1, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
      s('circle', { cx: 16, cy: 6.5, r: 2.2, fill: '#0a0a0d' })
    );
  }

  function faixaNav(p, i) {
    const leituras = leituraTrilho();
    const leitura = leituras[p.id];
    const regua = p.capitulo ? T.dados.regua(p.capitulo) : null;
    const estado = regua && regua.length ? { c: T.dados.contagemRegua(regua), pior: T.dados.piorEstado(regua) } : null;
    const agir = p.id === 'decisao' ? T.alertas.filter((a) => a.nivel === 'agir').length : null;
    return T.h(
      'a',
      { class: 'faixa', href: `#/${p.id === 'painel' ? '' : p.id}`, 'data-rota': p.id, title: leitura ? `${p.nome} · ${leitura.join(' ')}${i < 10 ? ` (tecla ${i})` : ''}` : p.nome },
      T.h('span', { class: 'faixa-icone' }, T.icone(ICONE_PAGINA[p.id] || p.icone)),
      T.h('span', { class: 'faixa-nome' }, p.nome, p.parte ? T.h('small', { class: 'faixa-parte' }, ` ${p.parte}`) : null),
      agir
        ? T.h('span', { class: 'faixa-badge', 'data-s': 'vermelho' }, String(agir))
        : estado && estado.c.vermelho
          ? T.h('span', { class: 'faixa-badge', 'data-s': estado.pior, title: `Régua: ${estado.c.vermelho} agir hoje · ${estado.c.amarelo} atenção · ${estado.c.verde} firmes` }, String(estado.c[estado.pior] || 0))
          : p.id === 'dados' && T.importacao && T.importacao.ativa()
            ? T.h('span', { class: 'faixa-badge', 'data-s': 'verde' }, 'CSV')
            : null
    );
  }

  function lateral() {
    const nav = T.h('nav', { class: 'trilho', 'aria-label': 'Navegação' });
    const grupos = { painel: 'Geral', pilotos: 'Capítulos', plano: 'Missão', dados: 'Workspace' };
    T.paginas.forEach((p, i) => {
      if (grupos[p.id]) nav.appendChild(T.h('span', { class: 'trilho-separador' }, grupos[p.id]));
      nav.appendChild(faixaNav(p, i));
    });
    return T.h(
      'aside',
      { class: 'lateral' },
      T.h('a', { class: 'marca', href: '#/', 'aria-label': 'Torre — painel executivo' }, logo(), T.h('span', { class: 'marca-texto' }, T.h('span', { class: 'marca-nome' }, 'Torre'), T.h('span', { class: 'marca-sub' }, 'Ops Intelligence'))),
      T.h(
        'div',
        { class: 'workspace', title: 'Demonstração: o Clube Horizonte não existe.' },
        T.h('span', { class: 'workspace-avatar' }, 'CH'),
        T.h('span', { class: 'workspace-texto' }, T.h('b', null, 'Clube Horizonte'), T.h('small', null, 'Workspace demo · dados fictícios'))
      ),
      nav,
      T.h(
        'div',
        { class: 'lateral-rodape' },
        T.h('a', { class: 'plano-card', href: 'produto.html' }, T.h('span', { class: 'plano-selo' }, 'PRO'), T.h('b', null, 'Conheça a Torre'), T.h('span', null, 'Planos, recursos e integrações'), T.icone('seta')),
        T.h('div', { class: 'usuario' }, T.h('span', { class: 'usuario-avatar' }, 'EV'), T.h('span', { class: 'usuario-texto' }, T.h('b', null, 'Eliane Vitoriano'), T.h('small', null, 'Admin · Front-end')), T.h('a', { class: 'usuario-git', href: 'https://github.com/EVI-DEV1/centro-inteligencia-operacional', target: '_blank', rel: 'noopener', title: 'Código no GitHub', 'aria-label': 'Código no GitHub' }, T.icone('conector')))
      )
    );
  }

  // ---------- menu de exportação ----------
  function menuExportar() {
    const lista = T.h('div', { class: 'menu', role: 'menu', hidden: true });
    const botao = T.h('button', { class: 'botao-secundario', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false' }, T.icone('download'), T.h('span', { class: 'rotulo-opcional' }, 'Exportar'));
    const item = (icone, texto, fn) =>
      T.h('button', { type: 'button', role: 'menuitem', onclick: () => { fechar(); fn(); } }, T.icone(icone), texto);
    lista.append(
      item('pdf', 'Relatório em PDF', () => T.exportarRelatorio()),
      item('planilha', 'Séries do período (CSV)', () => T.exportar.series()),
      item('decisao', 'Decisões (CSV)', () => T.exportar.decisoes()),
      item('dados', 'Livro de dados (JSON)', () => T.exportar.livro())
    );
    const fechar = () => {
      lista.hidden = true;
      botao.setAttribute('aria-expanded', 'false');
    };
    botao.addEventListener('click', (e) => {
      e.stopPropagation();
      lista.hidden = !lista.hidden;
      botao.setAttribute('aria-expanded', String(!lista.hidden));
    });
    document.addEventListener('click', (e) => !lista.contains(e.target) && fechar());
    return T.h('div', { class: 'menu-ancora' }, botao, lista);
  }

  let migalha = null;
  function topo() {
    const hoje = T.estado.hoje.iso;
    const faltam = T.diasEntre(hoje, L.meta.diaD);
    const paradas = T.dados.fontesParadas();
    integridadeBtn = T.h(
      'button',
      { class: 'botao-icone', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'painel-integridade', title: paradas ? `Integridade: ${paradas} fonte parada` : 'Integridade: fontes ok', 'data-paradas': String(paradas) },
      T.icone('sensor'),
      paradas ? T.h('i', { class: 'ponto-alerta' }) : null
    );
    painelIntegridade = T.h('div', { class: 'painel-integridade', id: 'painel-integridade', hidden: true }, conteudoIntegridade());
    integridadeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      abrirIntegridade(painelIntegridade.hidden);
    });

    const nomesBtn = T.h('button', {
      class: 'botao-icone',
      type: 'button',
      'data-ocultavel': '',
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
      modos.appendChild(T.h('button', { type: 'button', 'data-modo': id, 'aria-pressed': String(T.estado.modo === id), title: `${rotulo}${id === 'apresentar' ? ' (P)' : id === 'telao' ? ' (T)' : ''}`, onclick: () => T.modo(id) }, T.icone(icone), T.h('span', null, rotulo)));
    });
    T.on('modo', (v) => T.$$('button', modos).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === v))));

    const agir = T.alertas.filter((a) => a.nivel === 'agir').length;
    migalha = T.h('span', { class: 'migalha-atual' }, 'Visão executiva');

    return T.h(
      'header',
      { class: 'topo' },
      T.h('nav', { class: 'migalha', 'aria-label': 'Você está em' }, T.h('span', null, 'Clube Horizonte'), T.h('i', null, '/'), migalha),
      T.h('button', { class: 'busca', type: 'button', onclick: () => T.paleta.abrir() }, T.icone('busca'), T.h('span', null, 'Buscar páginas e ações…'), T.h('kbd', null, 'Ctrl K')),
      T.h(
        'div',
        { class: 'comandos' },
        T.h('span', { class: 'contagem-pilula', role: 'timer', title: `Faltam ${faltam} dias para o Dia D, ${f.data(L.meta.diaD)} · adesões fecham ${L.meta.encerramento}` }, T.h('b', null, `D-${Math.max(0, faltam)}`), T.h('span', null, `Dia D ${f.data(L.meta.diaD)}`)),
        T.h('span', { class: 'integridade-ancora' }, integridadeBtn, painelIntegridade),
        nomesBtn,
        T.h('a', { class: 'botao-icone sino', href: '#/decisao', title: `${agir} decisões para agir hoje`, 'aria-label': `${agir} decisões para agir hoje` }, T.icone('sino'), agir ? T.h('i', { class: 'sino-badge' }, String(agir)) : null),
        modos,
        T.h('a', { class: 'botao-secundario', href: '#/dados?alvo=importar' }, T.icone('upload'), T.h('span', { class: 'rotulo-opcional' }, 'Importar')),
        menuExportar()
      )
    );
  }

  function barraFiltros() {
    const periodo = T.h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Período' });
    T.filtro.PERIODOS.forEach((p) =>
      periodo.appendChild(T.h('button', { type: 'button', 'data-periodo': p.id, 'aria-pressed': String(T.filtro.periodo === p.id), onclick: () => T.filtro.definir('periodo', p.id) }, p.rotulo))
    );
    const fases = T.h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Fase do painel' });
    L.fases.forEach((fz) =>
      fases.appendChild(
        T.h(
          'button',
          { type: 'button', 'data-fase': fz.id, 'aria-pressed': String(fz.id === T.estado.fase), title: `${fz.nome} · ${f.data(fz.inicio)}${fz.inicio !== fz.fim ? `–${f.data(fz.fim)}` : ''}`, onclick: () => T.definir('fase', fz.id) },
          fz.nome.replace(/^Fase\s+\w\s*·?\s*/i, ''),
          fz.id === T.estado.faseDeHoje ? T.h('i', { class: 'fase-hoje', title: 'fase de hoje' }) : null
        )
      )
    );
    T.on('fase', (v) => T.$$('button', fases).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fase === v))));

    const comparar = T.h('input', { type: 'checkbox', role: 'switch', checked: T.filtro.comparar, onchange: (e) => T.filtro.definir('comparar', e.target.checked) });
    const resumo = T.h('span', { class: 'filtro-resumo' });
    const pintar = () => {
      T.$$('button', periodo).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.periodo === T.filtro.periodo)));
      const imp = T.importacao && T.importacao.ativa();
      T.limpar(resumo);
      [
        T.icone('filtro'),
        T.h('span', null, T.filtro.ativo() ? `${T.filtro.rotulo()} · até ${f.data(T.filtro.ultimoDia())}` : `Todo o período · ${f.data(L.meta.periodo.inicio)} a ${f.data(L.meta.periodo.fim)}`),
        imp ? T.h('span', { class: 'filtro-fonte' }, T.icone('planilha'), imp.arquivo) : null,
        T.filtro.ativo() ? T.h('button', { class: 'filtro-limpar', type: 'button', onclick: () => T.filtro.definir('periodo', 'tudo') }, 'Limpar') : null,
        T.h('span', { class: 'selo-demo', title: 'Demonstração: o Clube Horizonte não existe. Pessoas, equipes, lugares e números foram inventados.' }, T.icone('etiqueta'), 'Dados fictícios'),
      ]
        .filter(Boolean)
        .forEach((el) => resumo.appendChild(el));
    };
    pintar();
    T.on('filtro', pintar);
    T.on('dados-importados', pintar);

    return T.h(
      'div',
      { class: 'barra-filtros', role: 'region', 'aria-label': 'Filtros globais' },
      T.h('label', { class: 'filtro-grupo' }, T.h('span', { class: 'filtro-rotulo' }, 'Período'), periodo),
      T.h('label', { class: 'filtro-grupo' }, T.h('span', { class: 'filtro-rotulo' }, 'Fase'), fases),
      T.h('label', { class: 'filtro-interruptor' }, comparar, T.h('span', { class: 'interruptor' }), 'Comparar com anterior'),
      resumo
    );
  }

  // ---------- avisos (toasts) ----------
  const avisos = T.h('div', { class: 'avisos', role: 'status', 'aria-live': 'polite' });
  T.aviso = (texto, icone = 'info') => {
    const el = T.h('div', { class: 'aviso' }, T.icone(icone), T.h('span', null, texto));
    avisos.appendChild(el);
    setTimeout(() => el.classList.add('saindo'), 3200);
    setTimeout(() => el.remove(), 3700);
  };

  T.exportarRelatorio = () => {
    T.aviso('Abrindo a impressão: escolha "Salvar como PDF"', 'pdf');
    document.documentElement.classList.add('imprimindo');
    setTimeout(() => {
      window.print();
      document.documentElement.classList.remove('imprimindo');
    }, 350);
  };

  // ---------- paleta de comandos (Ctrl K) ----------
  T.paleta = (() => {
    const campo = T.h('input', { type: 'search', class: 'paleta-campo', placeholder: 'Ir para uma página ou executar uma ação…', 'aria-label': 'Buscar', autocomplete: 'off' });
    const lista = T.h('ul', { class: 'paleta-lista', role: 'listbox' });
    const caixa = T.h('div', { class: 'paleta', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Paleta de comandos', hidden: true }, T.h('div', { class: 'paleta-caixa' }, T.h('div', { class: 'paleta-topo' }, T.icone('busca'), campo, T.h('kbd', null, 'Esc')), lista));
    let itens = [];
    let sel = 0;
    const acoes = () => [
      ...T.paginas.map((p) => ({ grupo: 'Páginas', icone: ICONE_PAGINA[p.id] || p.icone, texto: p.nome, fazer: () => T.irPara(p.id) })),
      ...T.filtro.PERIODOS.map((p) => ({ grupo: 'Filtros', icone: 'filtro', texto: `Período: ${p.rotulo}`, fazer: () => T.filtro.definir('periodo', p.id) })),
      { grupo: 'Ações', icone: 'upload', texto: 'Importar planilha CSV/Excel', fazer: () => T.irPara('dados', 'importar') },
      { grupo: 'Ações', icone: 'pdf', texto: 'Exportar relatório em PDF', fazer: () => T.exportarRelatorio() },
      { grupo: 'Ações', icone: 'planilha', texto: 'Exportar séries em CSV', fazer: () => T.exportar.series() },
      { grupo: 'Ações', icone: 'decisao', texto: 'Exportar decisões em CSV', fazer: () => T.exportar.decisoes() },
      { grupo: 'Ações', icone: 'apresentar', texto: 'Modo apresentação', fazer: () => T.modo('apresentar') },
      { grupo: 'Ações', icone: 'telao', texto: 'Modo telão', fazer: () => T.modo('telao') },
      { grupo: 'Ações', icone: 'olho-fechado', texto: 'Ocultar ou mostrar nomes', fazer: () => T.definir('nomes', T.estado.nomes === 'ocultos' ? 'visiveis' : 'ocultos') },
      ...T.alertas.filter((a) => a.nivel === 'agir').map((a) => ({ grupo: 'Decisões', icone: 'agir', texto: a.titulo, fazer: () => T.irPara(a.rota, a.alvo) })),
    ];
    const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    function pintar() {
      const q = norm(campo.value.trim());
      itens = acoes().filter((a) => !q || norm(`${a.grupo} ${a.texto}`).includes(q)).slice(0, 14);
      sel = Math.min(sel, Math.max(0, itens.length - 1));
      T.limpar(lista);
      let grupo = '';
      itens.forEach((a, i) => {
        if (a.grupo !== grupo) {
          grupo = a.grupo;
          lista.appendChild(T.h('li', { class: 'paleta-grupo', role: 'presentation' }, grupo));
        }
        lista.appendChild(T.h('li', { class: 'paleta-item', role: 'option', 'aria-selected': String(i === sel), onclick: () => executar(i), onpointermove: () => { if (sel !== i) { sel = i; pintar(); } } }, T.icone(a.icone), T.h('span', null, a.texto), T.icone('seta')));
      });
      if (!itens.length) lista.appendChild(T.h('li', { class: 'paleta-vazio' }, 'Nada encontrado'));
    }
    function executar(i) {
      const a = itens[i];
      if (!a) return;
      fechar();
      a.fazer();
    }
    function abrir() {
      caixa.hidden = false;
      campo.value = '';
      sel = 0;
      pintar();
      requestAnimationFrame(() => campo.focus());
    }
    function fechar() {
      caixa.hidden = true;
    }
    campo.addEventListener('input', () => {
      sel = 0;
      pintar();
    });
    campo.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        sel = Math.min(itens.length - 1, sel + 1);
        pintar();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        sel = Math.max(0, sel - 1);
        pintar();
      } else if (e.key === 'Enter') executar(sel);
      else if (e.key === 'Escape') fechar();
    });
    caixa.addEventListener('click', (e) => e.target === caixa && fechar());
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        caixa.hidden ? abrir() : fechar();
      }
    });
    return { el: caixa, abrir, fechar };
  })();


  const palco = T.h('main', { class: 'palco', id: 'conteudo', tabindex: '-1' });
  let rotaAtual = null;

  function lerHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [rota, qs] = h.split('?');
    const params = new URLSearchParams(qs || '');
    const id = rota && T.modulos[rota] ? rota : 'painel';
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
    document.title = `${p ? p.nome : 'Visão executiva'} · Torre Ops Intelligence · demo com dados fictícios`;
    if (migalha) migalha.textContent = p ? p.nome : 'Visão executiva';
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
    const novo = `#/${rota === 'painel' ? '' : rota}${alvoQs}`;
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

  function remontar() {
    rotaAtual = null;
    render();
  }

  function iniciar() {
    const raiz = document.getElementById('app');
    T.limpar(raiz);
    let lateralEl = lateral();
    const topoEl = topo();
    const filtrosEl = barraFiltros();
    [topoEl, lateralEl].forEach((el) => T.numerosNaLeitura(el));
    raiz.append(T.h('a', { class: 'pular', href: '#conteudo' }, 'Pular para o conteúdo'), lateralEl, T.h('div', { class: 'principal' }, topoEl, filtrosEl, palco));
    document.body.append(holofote, legenda, avisos, T.paleta.el);
    window.addEventListener('hashchange', render);
    window.addEventListener('resize', () => T.estado.modo !== 'explorar' && posicionarHolofote());
    T.on('filtro', remontar);
    T.on('dados-importados', () => {
      const nova = lateral();
      lateralEl.replaceWith(nova);
      lateralEl = nova;
      remontar();
      T.$$('.faixa', document).forEach((a) => (a.dataset.rota === T.estado.rota ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    });
    render();
    document.documentElement.classList.add('pronto');
    if (lerHash().params.get('integridade') === '1') abrirIntegridade(true);
    T.emit('montado');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
