/* OPS Intelligence · peças de interface compartilhadas pelas páginas novas:
   barra de filtros global, cartões, KPI, estados (carregando, vazio, indisponível), rodapé de fonte e login. */
(function () {
  'use strict';
  const T = window.T;
  const f = T.fmt;
  const O = T.ops;
  const N = O.nucleo;
  const U = (O.ui = {});

  const dataHora = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
  };
  U.dataHora = dataHora;
  U.periodoTexto = (j) => (j.de === j.ate ? f.data(j.de) : `${f.data(j.de)} a ${f.data(j.ate)}`);

  U.formatar = (id, v) => {
    if (v === null || v === undefined) return '—';
    if (id === 'taxa_conversao' || id === 'taxa_engajamento') return f.pct(v, 1);
    if (id === 'tempo_primeira_resposta') return `${f.nFlex(v, 1)} min`;
    return v >= 10000 ? f.compacto(v) : f.n(v);
  };

  // ---------- estrutura ----------
  U.cabecalho = ({ sobretitulo, titulo, lead, acoes }) =>
    T.h(
      'header',
      { class: 'painel-cabeca ops-cabeca', 'data-revela': '' },
      T.h('div', null, T.h('p', { class: 'sobretitulo' }, sobretitulo), T.h('h1', { class: 'painel-h1' }, titulo), lead ? T.h('p', { class: 'painel-lead' }, lead) : null),
      acoes ? T.h('div', { class: 'painel-cabeca-acoes' }, acoes) : null
    );

  U.selo = () =>
    O.ehDemo()
      ? T.h('span', { class: 'ops-selo-sim', title: 'Modo demonstração: clientes, pessoas e números são simulados para apresentar o produto. Não são dados reais.' }, T.icone('etiqueta'), 'Simulação')
      : T.h('span', { class: 'ops-selo-real', title: 'Dados lidos das integrações deste cliente.' }, T.h('i', { class: 'pulso' }), 'Dados reais');

  /** Rodapé obrigatório de cada indicador: fonte, período e última atualização. */
  U.rodapeFonte = (fontes, janela, extra) => {
    const lista = (fontes || []).map((x) => (typeof x === 'string' ? { nome: x } : x));
    const ult = lista.map((x) => x.ultimaSync).filter(Boolean).sort().pop();
    return T.h(
      'footer',
      { class: 'ops-fonte' },
      T.h('span', null, T.icone('conector'), lista.length ? lista.map((x) => x.nome).join(', ') : 'Sem fonte'),
      janela ? T.h('span', null, T.icone('relogio'), U.periodoTexto(janela)) : null,
      ult ? T.h('span', null, `atualizado ${dataHora(ult)}`) : null,
      O.ehDemo() ? T.h('span', { class: 'ops-fonte-sim' }, 'simulação') : null,
      extra || null
    );
  };

  U.cartao = ({ id, titulo, sub, acao, classe, fontes, janela, rodape }, ...corpo) =>
    T.h(
      'section',
      { class: ['ops-cartao', classe], id, 'data-revela': '' },
      T.h('header', { class: 'ops-cartao-cab' }, T.h('div', null, T.h('h2', null, titulo), sub ? T.h('p', null, sub) : null), acao || null),
      T.h('div', { class: 'ops-cartao-corpo' }, ...corpo),
      rodape !== undefined ? rodape : fontes ? U.rodapeFonte(fontes, janela) : null
    );

  U.indisponivel = (motivo, { compacto } = {}) =>
    T.h('div', { class: ['ops-indisponivel', compacto ? 'compacto' : null], role: 'note' }, T.icone('info'), T.h('div', null, T.h('b', null, 'Indisponível'), T.h('p', null, motivo)));

  U.vazio = (titulo, texto, acao) => T.h('div', { class: 'ops-vazio' }, T.h('div', { class: 'ops-vazio-icone' }, T.icone('dados')), T.h('b', null, titulo), texto ? T.h('p', null, texto) : null, acao || null);

  U.esqueleto = () =>
    T.h(
      'div',
      { class: 'ops-esqueleto', 'aria-busy': 'true', 'aria-label': 'Carregando' },
      T.h('div', { class: 'ops-esq-linha l1' }),
      T.h('div', { class: 'ops-esq-grade4' }, [1, 2, 3, 4].map(() => T.h('div', { class: 'ops-esq-bloco' }))),
      T.h('div', { class: 'ops-esq-grade2' }, [1, 2].map(() => T.h('div', { class: 'ops-esq-bloco alto' })))
    );

  // ---------- KPI ----------
  const deltaEl = (k) => {
    if (!O.estado.comparar || k.variacao === null || k.variacao === undefined) return null;
    const neutro = Math.abs(k.variacao) < 0.5;
    const bom = k.menorMelhor ? k.variacao < 0 : k.variacao > 0;
    return T.h(
      'span',
      { class: 'kpi-delta', 'data-tom': neutro ? 'neutro' : bom ? 'bom' : 'ruim', title: `Anterior: ${U.formatar(k.id, k.anterior)}` },
      T.icone(neutro ? 'seta' : k.variacao > 0 ? 'tendencia' : 'tendencia'),
      `${k.variacao > 0 ? '+' : ''}${f.nFlex(k.variacao, 1)}%`
    );
  };
  U.kpi = (k, { cor = 'var(--eletrico)', destaque, janela } = {}) => {
    if (!k) return null;
    if (k.indisponivel)
      return T.h('article', { class: ['ops-kpi', 'indisponivel', destaque ? 'destaque' : null], 'data-revela': '' }, T.h('h3', { class: 'ops-kpi-nome' }, k.nome && !k.nome.includes('_') ? k.nome : NOMES[k.id] || k.id), T.h('div', { class: 'ops-kpi-valor' }, '—'), T.h('p', { class: 'ops-kpi-motivo' }, k.indisponivel));
    const sp = k.historico ? O.spark(k.historico, cor) : null;
    const el = T.h(
      'article',
      { class: ['ops-kpi', destaque ? 'destaque' : null], 'data-revela': '', tabindex: 0 },
      T.h('h3', { class: 'ops-kpi-nome' }, k.nome),
      T.h('div', { class: 'ops-kpi-linha' }, T.h('span', { class: 'ops-kpi-valor tab' }, U.formatar(k.id, k.atual)), deltaEl(k)),
      O.estado.comparar && k.anterior !== null && k.anterior !== undefined ? T.h('p', { class: 'ops-kpi-ant' }, `antes: ${U.formatar(k.id, k.anterior)}`) : null,
      sp,
      destaque ? U.rodapeFonte(k.fontes, janela) : T.h('p', { class: 'ops-kpi-fonte' }, (k.fontes || []).map((x) => x.nome || x).join(', '))
    );
    T.dica.ligar(el, () =>
      T.dica.bloco(
        [
          { valor: U.formatar(k.id, k.atual), rotulo: 'no período' },
          ...(k.anterior !== null && k.anterior !== undefined ? [{ valor: U.formatar(k.id, k.anterior), rotulo: 'período anterior' }] : []),
          ...(k.nota ? [{ valor: '', rotulo: k.nota }] : []),
          { valor: '', rotulo: `Fonte: ${(k.fontes || []).map((x) => x.nome || x).join(', ') || '—'}` },
        ],
        k.nome
      )
    );
    return el;
  };
  const NOMES = { leads_novos: 'Novos leads', leads_atendimento: 'Leads em atendimento', leads_convertidos: 'Leads convertidos', taxa_conversao: 'Taxa de conversão' };

  // ---------- página assíncrona ----------
  /** Mostra esqueleto, carrega o conjunto e chama montar(raiz, conjunto). Trata login e erro com estados claros. */
  U.pagina = (raiz, montar) => {
    const anterior = raiz.querySelector('.ops-conteudo');
    const host = T.h('div', { class: 'ops-conteudo' });
    if (anterior) anterior.classList.add('recarregando');
    else raiz.appendChild(U.esqueleto());
    O.carregar()
      .then((cj) => {
        T.limpar(raiz);
        raiz.appendChild(host);
        montar(host, cj);
        T.emit('ops:dados', cj);
        T.numerosNaLeitura(host);
        T.mov && T.mov.revelar && T.mov.revelar(host);
      })
      .catch((e) => {
        T.limpar(raiz);
        raiz.appendChild(
          e.status === 401
            ? U.vazio('Entre para ver os dados reais', 'O modo real lê as integrações dos seus clientes. Sem login, use o modo demonstração.', T.h('div', { class: 'ops-acoes' }, T.h('button', { class: 'botao-primario', type: 'button', onclick: () => U.login() }, 'Entrar'), T.h('button', { class: 'botao-secundario', type: 'button', onclick: () => O.definir({ modo: 'demonstracao', cliente: O.demo.CLIENTES[0].id }) }, 'Ver demonstração')))
            : U.vazio('Não foi possível carregar os dados', e.message, T.h('button', { class: 'botao-secundario', type: 'button', onclick: () => T.emit('ops:filtro', {}) }, 'Tentar de novo'))
        );
      });
  };

  // ---------- barra de filtros global ----------
  const opcao = (valor, texto, sel) => T.h('option', { value: valor, selected: valor === sel }, texto);

  U.barraFiltros = () => {
    const barra = T.h('div', { class: 'barra-filtros ops-barra', role: 'region', 'aria-label': 'Filtros globais' });
    const pintar = () => {
      T.limpar(barra);
      const e = O.estado;
      const cj = O.atual();
      const clientes = O.clientes();
      const campanhas = cj ? cj.campanhas : [];

      const selCliente = T.h('select', { class: 'ops-select', 'aria-label': 'Cliente', onchange: (ev) => O.definir({ cliente: ev.target.value }) }, clientes.length ? clientes.map((c) => opcao(c.id, c.nome, e.cliente)) : T.h('option', null, 'Nenhum cliente'));
      const selPlat = T.h('select', { class: 'ops-select', 'aria-label': 'Plataforma', onchange: (ev) => O.definir({ plataforma: ev.target.value }) }, opcao('todas', 'Todas as plataformas', e.plataforma), N.CANAIS.filter((c) => c.id !== 'outros').map((c) => opcao(c.id, c.nome, e.plataforma)));
      const periodo = T.h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Período' }, N.PERIODOS.map((p) => T.h('button', { type: 'button', 'aria-pressed': String(e.periodo === p.id), onclick: () => (p.id === 'personalizado' ? O.definir({ periodo: 'personalizado', de: e.de || N.somarDias(O.hoje(), -13), ate: e.ate || O.hoje() }) : O.definir({ periodo: p.id })) }, p.rotulo)));
      const datas =
        e.periodo === 'personalizado'
          ? T.h(
              'span',
              { class: 'ops-datas' },
              T.h('input', { type: 'date', value: e.de, max: O.hoje(), 'aria-label': 'De', onchange: (ev) => ev.target.value && O.definir({ de: ev.target.value }) }),
              T.h('span', null, 'a'),
              T.h('input', { type: 'date', value: e.ate, max: O.hoje(), 'aria-label': 'Até', onchange: (ev) => ev.target.value && O.definir({ ate: ev.target.value }) })
            )
          : null;
      const selCamp = T.h('select', { class: 'ops-select', 'aria-label': 'Campanha', onchange: (ev) => O.definir({ campanha: ev.target.value }) }, opcao('todas', 'Todas as campanhas', e.campanha), campanhas.map((c) => opcao(c.id, c.nome, e.campanha)));
      const selInd = T.h('select', { class: 'ops-select', 'aria-label': 'Indicador', onchange: (ev) => O.definir({ indicador: ev.target.value }) }, N.INDICADORES.map((i) => opcao(i.id, i.nome, e.indicador)));
      const comparar = T.h('input', { type: 'checkbox', role: 'switch', checked: e.comparar, onchange: (ev) => O.definir({ comparar: ev.target.checked }) });

      const grupo = (rotulo, ...c) => T.h('label', { class: 'filtro-grupo' }, T.h('span', { class: 'filtro-rotulo' }, rotulo), ...c);
      barra.append(
        grupo('Cliente', selCliente),
        grupo('Plataforma', selPlat),
        grupo('Período', periodo, datas),
        grupo('Campanha', selCamp),
        grupo('Indicador', selInd),
        T.h('label', { class: 'filtro-interruptor' }, comparar, T.h('span', { class: 'interruptor' }), 'Comparar com anterior'),
        T.h('span', { class: 'filtro-resumo' }, U.selo(), modoBotao())
      );
    };
    T.on('ops:filtro', pintar);
    T.on('ops:sessao', pintar);
    T.on('ops:dados', pintar);
    pintar();
    return barra;
  };

  function modoBotao() {
    if (O.ehDemo()) return T.h('button', { class: 'filtro-limpar', type: 'button', onclick: () => (O.sessao ? O.definir({ modo: 'real', cliente: (O.sessao.clientes[0] || {}).id }) : U.login()), title: 'Entrar para ver dados reais' }, 'Usar dados reais');
    return T.h('button', { class: 'filtro-limpar', type: 'button', onclick: () => O.definir({ modo: 'demonstracao', cliente: O.demo.CLIENTES[0].id }), title: 'Voltar para a demonstração (dados simulados)' }, 'Ver demonstração');
  }

  // ---------- diálogo genérico e login ----------
  U.dialogo = (titulo, corpo, { aoFechar } = {}) => {
    const fechar = () => {
      d.remove();
      aoFechar && aoFechar();
    };
    const d = T.h(
      'div',
      { class: 'ops-dialogo-fundo', onclick: (e) => e.target === d && fechar() },
      T.h('div', { class: 'ops-dialogo', role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo }, T.h('header', null, T.h('h2', null, titulo), T.h('button', { class: 'botao-icone', type: 'button', 'aria-label': 'Fechar', onclick: fechar }, T.icone('fechar'))), corpo)
    );
    d.addEventListener('keydown', (e) => e.key === 'Escape' && fechar());
    document.body.appendChild(d);
    requestAnimationFrame(() => {
      const foco = d.querySelector('input, select, textarea, button.botao-primario');
      foco && foco.focus();
    });
    return { fechar, el: d };
  };

  U.login = async () => {
    const aviso = T.h('p', { class: 'ops-form-aviso', role: 'status' });
    const email = T.h('input', { type: 'email', required: true, autocomplete: 'username', placeholder: 'voce@empresa.com' });
    const senha = T.h('input', { type: 'password', required: true, autocomplete: 'current-password' });
    const form = T.h(
      'form',
      { class: 'ops-form' },
      T.h('p', { class: 'ops-form-ajuda' }, 'O modo real lê as integrações (Instagram, Facebook, Kommo e WhatsApp) dos clientes que você pode acessar.'),
      T.h('label', null, 'E-mail', email),
      T.h('label', null, 'Senha', senha),
      aviso,
      T.h('div', { class: 'ops-acoes' }, T.h('button', { class: 'botao-primario', type: 'submit' }, 'Entrar'))
    );
    const dlg = U.dialogo('Entrar no OPS Intelligence', form);
    await O.verificarApi();
    if (!O.api.disponivel) {
      aviso.textContent = O.api.motivo;
      aviso.dataset.tom = 'ruim';
    }
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      aviso.textContent = 'Entrando…';
      aviso.dataset.tom = '';
      try {
        await O.entrar(email.value.trim(), senha.value);
        dlg.fechar();
        T.aviso && T.aviso('Sessão iniciada: mostrando dados reais', 'conferencia');
      } catch (e) {
        aviso.textContent = e.message;
        aviso.dataset.tom = 'ruim';
      }
    });
  };

  /** Campo de formulário com rótulo. */
  U.campo = (rotulo, el, ajuda) => T.h('label', { class: 'ops-campo' }, T.h('span', null, rotulo), el, ajuda ? T.h('small', null, ajuda) : null);
})();
