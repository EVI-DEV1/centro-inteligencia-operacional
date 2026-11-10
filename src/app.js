(function () {
  'use strict';
  const T = window.T;
  const O = T.ops;

  // Navegação. `so: 'admin'` = só administradores. Os ids de rota antigos (pilotos, passageiros,
  // controladores, plano) foram mantidos para não quebrar links e atalhos já usados.
  T.paginas = [
    { id: 'painel', nome: 'Visão Executiva', icone: 'painel', grupo: 'Inteligência' },
    { id: 'central', nome: 'Central', icone: 'central', grupo: 'Inteligência' },
    { id: 'conteudo', nome: 'Análise de Conteúdo', icone: 'alcance', grupo: 'Inteligência' },
    { id: 'plano', nome: 'Campanhas', icone: 'plano', grupo: 'Comercial' },
    { id: 'passageiros', nome: 'Leads', icone: 'passageiros', grupo: 'Comercial' },
    { id: 'pilotos', nome: 'Pessoas', icone: 'pilotos', grupo: 'Gestão' },
    { id: 'controladores', nome: 'Admin', icone: 'controladores', grupo: 'Gestão' },
    { id: 'comparar', nome: 'Comparar clientes', icone: 'tendencia', grupo: 'Gestão', so: 'admin' },
    { id: 'dados', nome: 'Dados e integrações', icone: 'dados', grupo: 'Workspace' },
  ];

  /** Páginas visíveis para o papel atual. */
  T.paginasVisiveis = () => T.paginas.filter((p) => p.so !== 'admin' || O.ehAdmin());

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
    return T.h(
      'a',
      { class: 'faixa', href: `#/${p.id === 'painel' ? '' : p.id}`, 'data-rota': p.id, title: `${p.nome}${i < 10 ? ` (tecla ${i})` : ''}` },
      T.h('span', { class: 'faixa-icone' }, T.icone(p.icone)),
      T.h('span', { class: 'faixa-nome' }, p.nome),
      p.id === 'dados' && O.importacao && O.importacao.ativa() ? T.h('span', { class: 'faixa-badge', 'data-s': 'verde' }, 'CSV') : null
    );
  }

  function lateral() {
    const nav = T.h('nav', { class: 'trilho', 'aria-label': 'Navegação' });
    let grupo = null;
    T.paginasVisiveis().forEach((p, i) => {
      if (p.grupo !== grupo) {
        grupo = p.grupo;
        nav.appendChild(T.h('span', { class: 'trilho-separador' }, grupo));
      }
      nav.appendChild(faixaNav(p, i));
    });
    const cli = O.clienteAtual();
    const iniciais = (nome) => String(nome || '?').split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase();
    const usuarioNome = O.ehDemo() ? 'Eliane Vitoriano' : (O.sessao && O.sessao.perfil && O.sessao.perfil.nome) || 'Usuário';
    const papelNome = { admin: 'Admin', gestor: 'Gestor', analista: 'Analista', atendimento: 'Atendimento', cliente: 'Cliente' }[O.papel()] || O.papel();
    return T.h(
      'aside',
      { class: 'lateral' },
      T.h('a', { class: 'marca', href: '#/', 'aria-label': 'OPS Intelligence — Visão Executiva' }, logo(), T.h('span', { class: 'marca-texto' }, T.h('span', { class: 'marca-nome' }, 'OPS'), T.h('span', { class: 'marca-sub' }, 'Intelligence'))),
      T.h(
        'label',
        { class: 'workspace', title: O.ehDemo() ? 'Modo demonstração: clientes e números simulados.' : 'Cliente analisado' },
        T.h('span', { class: 'workspace-avatar', style: cli && cli.cor ? { background: cli.cor } : null }, iniciais(cli && cli.nome)),
        T.h(
          'span',
          { class: 'workspace-texto' },
          T.h('select', { class: 'workspace-select', 'aria-label': 'Cliente', onchange: (e) => O.definir({ cliente: e.target.value }) }, O.clientes().map((c) => T.h('option', { value: c.id, selected: cli && c.id === cli.id }, c.nome))),
          T.h('small', null, O.ehDemo() ? 'Simulação · dados de demonstração' : (cli && cli.segmento) || 'Dados reais')
        )
      ),
      nav,
      T.h(
        'div',
        { class: 'lateral-rodape' },
        T.h('a', { class: 'plano-card', href: 'produto.html' }, T.h('span', { class: 'plano-selo' }, 'PRO'), T.h('b', null, 'Conheça o OPS Intelligence'), T.h('span', null, 'Planos, recursos e integrações'), T.icone('seta')),
        T.h(
          'div',
          { class: 'usuario' },
          T.h('span', { class: 'usuario-avatar' }, iniciais(usuarioNome)),
          T.h('span', { class: 'usuario-texto' }, T.h('b', null, usuarioNome), T.h('small', null, O.ehDemo() ? `${papelNome} · demonstração` : papelNome)),
          O.ehDemo()
            ? T.h('button', { class: 'usuario-git', type: 'button', title: 'Entrar para ver dados reais', 'aria-label': 'Entrar', onclick: () => O.ui.login() }, T.icone('cadeado'))
            : T.h('button', { class: 'usuario-git', type: 'button', title: 'Sair', 'aria-label': 'Sair', onclick: () => O.sair() }, T.icone('voltar')), T.h('a', { class: 'usuario-git', href: 'https://github.com/EVI-DEV1/centro-inteligencia-operacional', target: '_blank', rel: 'noopener', title: 'Código no GitHub', 'aria-label': 'Código no GitHub' }, T.icone('conector')))
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
      item('planilha', 'Leads do período (CSV)', () => O.exportarLeads && O.exportarLeads()),
      item('dados', 'Conjunto de dados do cliente (JSON)', () => O.exportarConjunto && O.exportarConjunto())
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
    const modos = T.h('div', { class: 'modos', role: 'group', 'aria-label': 'Modo de uso' });
    [
      ['explorar', 'explorar', 'Explorar'],
      ['apresentar', 'apresentar', 'Apresentar'],
      ['telao', 'telao', 'Telão'],
    ].forEach(([id, icone, rotulo]) => {
      modos.appendChild(T.h('button', { type: 'button', 'data-modo': id, 'aria-pressed': String(T.estado.modo === id), title: `${rotulo}${id === 'apresentar' ? ' (P)' : id === 'telao' ? ' (T)' : ''}`, onclick: () => T.modo(id) }, T.icone(icone), T.h('span', null, rotulo)));
    });
    T.on('modo', (v) => T.$$('button', modos).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === v))));

    migalha = T.h('span', { class: 'migalha-atual' }, 'Visão Executiva');
    const cli = O.clienteAtual();

    return T.h(
      'header',
      { class: 'topo' },
      T.h('nav', { class: 'migalha', 'aria-label': 'Você está em' }, T.h('span', null, cli ? cli.nome : 'OPS Intelligence'), T.h('i', null, '/'), migalha),
      T.h('button', { class: 'busca', type: 'button', onclick: () => T.paleta.abrir() }, T.icone('busca'), T.h('span', null, 'Buscar páginas e ações…'), T.h('kbd', null, 'Ctrl K')),
      T.h(
        'div',
        { class: 'comandos' },
        T.h('a', { class: 'botao-icone sino', href: '#/central', title: 'Alertas e pendências na Central', 'aria-label': 'Alertas e pendências na Central' }, T.icone('sino')),
        modos,
        T.h('a', { class: 'botao-secundario', href: '#/dados?alvo=importar' }, T.icone('upload'), T.h('span', { class: 'rotulo-opcional' }, 'Importar')),
        menuExportar()
      )
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
      ...T.paginasVisiveis().map((p) => ({ grupo: 'Páginas', icone: p.icone, texto: p.nome, fazer: () => T.irPara(p.id) })),
      ...O.clientes().map((c) => ({ grupo: 'Clientes', icone: 'painel', texto: `Cliente: ${c.nome}`, fazer: () => O.definir({ cliente: c.id }) })),
      ...O.nucleo.PERIODOS.filter((p) => p.id !== 'personalizado').map((p) => ({ grupo: 'Filtros', icone: 'filtro', texto: `Período: ${p.rotulo}`, fazer: () => O.definir({ periodo: p.id }) })),
      ...O.nucleo.CANAIS.filter((c) => c.id !== 'outros').map((c) => ({ grupo: 'Filtros', icone: 'filtro', texto: `Plataforma: ${c.nome}`, fazer: () => O.definir({ plataforma: c.id }) })),
      { grupo: 'Ações', icone: 'passageiros', texto: 'Ver leads em Kanban', fazer: () => T.irPara('passageiros') },
      { grupo: 'Ações', icone: 'plano', texto: 'Criar campanha', fazer: () => T.irPara('plano') },
      O.ehDemo() ? { grupo: 'Ações', icone: 'cadeado', texto: 'Entrar para ver dados reais', fazer: () => O.ui.login() } : { grupo: 'Ações', icone: 'voltar', texto: 'Sair', fazer: () => O.sair() },
      { grupo: 'Ações', icone: 'upload', texto: 'Importar planilha CSV/Excel', fazer: () => T.irPara('dados', 'importar') },
      { grupo: 'Ações', icone: 'pdf', texto: 'Exportar relatório em PDF', fazer: () => T.exportarRelatorio() },
      { grupo: 'Ações', icone: 'planilha', texto: 'Exportar leads do período em CSV', fazer: () => O.exportarLeads && O.exportarLeads() },
      { grupo: 'Ações', icone: 'apresentar', texto: 'Modo apresentação', fazer: () => T.modo('apresentar') },
      { grupo: 'Ações', icone: 'telao', texto: 'Modo telão', fazer: () => T.modo('telao') },
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
    const { id, alvo } = lerHash();
    if (id === rotaAtual) {
      destacar(alvo);
      return;
    }
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
      console.error('[ops] falha ao montar a página', id, e);
      pagina.appendChild(T.h('p', { class: 'erro-pagina' }, 'Esta página não conseguiu montar. Recarregue o OPS Intelligence.'));
    }
    T.$$('.faixa', document).forEach((a) => (a.dataset.rota === id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    const p = T.paginas.find((x) => x.id === id);
    document.title = `${p ? p.nome : 'Visão Executiva'} · OPS Intelligence${O.ehDemo() ? ' · simulação' : ''}`;
    if (migalha) migalha.textContent = p ? p.nome : 'Visão Executiva';
    T.mov.revelar(pagina);
    if (alvo) setTimeout(() => destacar(alvo), 120);
    else window.scrollTo({ top: 0, behavior: 'auto' });
    const faixa = T.$(`.faixa[data-rota="${id}"]`);
    if (faixa && window.matchMedia('(max-width: 1100px)').matches) faixa.scrollIntoView({ inline: 'center', block: 'nearest' });
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

  const textoLegendaFonte = () => `Telão · ${O.clienteAtual() ? O.clienteAtual().nome : ''} · ${O.ehDemo() ? 'simulação' : 'dados reais'}`;

  const ROTEIRO_OPS = [
    { rota: 'painel', alvo: 'ops-kpis', legenda: 'Os quatro números do período: visitas, novos leads, conversas e conversões — cada um com a variação contra o período anterior e a fonte.' },
    { rota: 'painel', alvo: 'ops-audiencia', legenda: 'Evolução da audiência por plataforma. A cor segue a plataforma; dia sem dado aparece como lacuna, não como zero.' },
    { rota: 'painel', alvo: 'ops-origem', legenda: 'De onde vêm os leads e quanto cada canal converte.' },
    { rota: 'painel', alvo: 'ops-funil', legenda: 'O fluxo de captação, com as etapas estimadas sinalizadas e o maior ponto de abandono em destaque.' },
    { rota: 'painel', alvo: 'ops-calor', legenda: 'Quando a audiência conversa: o mapa de calor sugere horários de publicação e de atendimento.' },
    { rota: 'painel', alvo: 'ops-campanhas', legenda: 'Campanhas ativas: meta, prazo e fases no mesmo cartão.' },
    { rota: 'painel', alvo: 'ops-insights', legenda: 'Insights que separam fato, hipótese e recomendação — e só aparecem com dados suficientes.' },
    { rota: 'passageiros', alvo: 'leads-quadro', legenda: 'O Kanban de leads: arraste entre etapas, abra o histórico e veja a próxima ação.' },
    { rota: 'plano', alvo: 'camp-inteligencia', legenda: 'A inteligência de campanhas: o histórico do cliente responde o que funcionou antes de planejar a próxima.' },
  ];
  const roteiro = () => ROTEIRO_OPS;

  function pintarLegenda() {
    const q = roteiro()[quadro];
    T.limpar(legenda);
    const modo = T.estado.modo;
    legenda.append(
      T.h(
        'div',
        { class: 'legenda-topo' },
        T.h('span', { class: 'leitura legenda-fonte' }, modo === 'telao' ? textoLegendaFonte() : 'Apresentação'),
        T.h('span', { class: 'legenda-contador tab' }, `${quadro + 1} / ${roteiro().length}`),
        T.h('span', { class: 'legenda-pontos' }, roteiro().map((_, i) => T.h('i', { class: i === quadro ? 'atual' : i < quadro ? 'feito' : null })))
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
    const n = roteiro().length;
    quadro = ((i % n) + n) % n;
    const q = roteiro()[quadro];
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
      const p = T.paginasVisiveis()[Number(e.key)];
      if (p) T.irPara(p.id);
    } else if ((e.key === 'p' || e.key === 'P') && modo === 'explorar') T.modo('apresentar');
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
    const filtrosEl = O.ui.barraFiltros();
    [topoEl, lateralEl].forEach((el) => T.numerosNaLeitura(el));
    raiz.append(T.h('a', { class: 'pular', href: '#conteudo' }, 'Pular para o conteúdo'), lateralEl, T.h('div', { class: 'principal' }, topoEl, filtrosEl, palco));
    document.body.append(holofote, legenda, avisos, T.paleta.el);
    window.addEventListener('hashchange', render);
    window.addEventListener('resize', () => T.estado.modo !== 'explorar' && posicionarHolofote());
    let topoAtual = topoEl;
    const reconstruirMoldura = () => {
      const nova = lateral();
      lateralEl.replaceWith(nova);
      lateralEl = nova;
      const novoTopo = topo();
      topoAtual.replaceWith(novoTopo);
      topoAtual = novoTopo;
      T.$$('.faixa', document).forEach((a) => (a.dataset.rota === T.estado.rota ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    };
    T.on('ops:filtro', (m) => {
      const mudouContexto = !m || !m.antes || m.antes.cliente !== m.depois.cliente || m.antes.modo !== m.depois.modo;
      if (mudouContexto) reconstruirMoldura();
      const p = T.paginas.find((x) => x.id === T.estado.rota);
      if (p && p.so === 'admin' && !O.ehAdmin()) return T.irPara('painel');
      remontar();
    });
    T.on('ops:sessao', reconstruirMoldura);
    T.on('dados-importados', () => {
      const nova = lateral();
      lateralEl.replaceWith(nova);
      lateralEl = nova;
      remontar();
      T.$$('.faixa', document).forEach((a) => (a.dataset.rota === T.estado.rota ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    });
    render();
    document.documentElement.classList.add('pronto');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
