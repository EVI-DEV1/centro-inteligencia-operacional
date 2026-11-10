/* Páginas do OPS Intelligence: Campanhas, Leads (lista + Kanban), Central, Pessoas e Admin. */
(function () {
  'use strict';
  const T = window.T;
  const f = T.fmt;
  const O = T.ops;
  const N = O.nucleo;
  const U = O.ui;

  /** Registra uma página do OPS: monta o conteúdo com o conjunto de dados do cliente atual. */
  function pagina(id, titulo, montar) {
    T.modulos[id] = { titulo, render: (raiz) => U.pagina(raiz, montar) };
  }

  const ETAPA_COR = { novo: 'var(--tinta-3)', em_contato: 'var(--ciano)', qualificado: 'var(--eletrico-claro)', negociacao: 'var(--violeta)', convertido: 'var(--firme)', perdido: 'var(--agir)' };
  const nomeEtapa = (cj, id) => ((cj.etapas || N.ETAPAS_PADRAO).find((e) => e.id === id) || { nome: id }).nome;
  const diasDesde = (iso) => (iso ? N.diasEntre(iso.slice(0, 10), O.hoje()) : null);
  const chipCanal = (id) => T.h('span', { class: 'ops-chip-canal', style: { '--c': N.canal(id).cor } }, N.canal(id).nome);
  const erroAviso = (e) => T.aviso && T.aviso(e.message || String(e), 'agir');

  // =====================================================================
  // LEADS
  // =====================================================================
  function leadsFiltrados(cj, fl, busca) {
    const q = (busca || '').trim().toLowerCase();
    return N.leadsDoFiltro(cj, fl)
      .filter((l) => N.dentro(l.entradaEm, fl.janela) || (l.convertidoEm && N.dentro(l.convertidoEm, fl.janela)))
      .filter((l) => !q || `${l.nome} ${l.contato || ''} ${l.responsavel || ''}`.toLowerCase().includes(q));
  }

  function detalheLead(cj, lead) {
    const camp = cj.campanhas.find((c) => c.id === lead.campanhaId);
    const historico = T.h('ol', { class: 'ops-historico' }, T.h('li', null, 'Carregando histórico…'));
    const dlg = U.dialogo(
      lead.nome,
      T.h(
        'div',
        { class: 'ops-lead-detalhe' },
        T.h(
          'dl',
          { class: 'ops-ficha' },
          [
            ['Contato', lead.contato || '—'],
            ['Origem', N.canal(lead.origem).nome],
            ['Fonte', lead.fonte || '—'],
            ['Entrada', U.dataHora(lead.entradaEm) || '—'],
            ['Campanha', camp ? camp.nome : '—'],
            ['Responsável', lead.responsavel || '—'],
            ['Etapa', nomeEtapa(cj, lead.etapa)],
            ['Última atividade', lead.ultimaAtividadeEm ? `${U.dataHora(lead.ultimaAtividadeEm) || f.data(lead.ultimaAtividadeEm)}` : '—'],
            ['Próxima ação', lead.proximaAcao || '—'],
            ['Conversão', lead.convertidoEm ? `Convertido em ${f.data(lead.convertidoEm)}${lead.valor ? ` · R$ ${f.n(lead.valor)}` : ''}` : lead.etapa === 'perdido' ? 'Perdido' : 'Em aberto'],
          ].map(([k, v]) => T.h('div', null, T.h('dt', null, k), T.h('dd', null, v)))
        ),
        lead.link ? T.h('a', { class: 'link-seta', href: lead.link, target: '_blank', rel: 'noopener' }, 'Abrir na Kommo', T.icone('seta')) : null,
        T.h('h3', null, 'Histórico de interações'),
        historico
      )
    );
    const pintar = (itens) => {
      T.limpar(historico);
      if (!itens.length) historico.appendChild(T.h('li', null, 'Sem interações registradas.'));
      itens.forEach((i) => historico.appendChild(T.h('li', null, T.h('time', null, U.dataHora(i.em) || f.data(i.em)), T.h('span', null, i.resumo || i.tipo), i.autor ? T.h('small', null, i.autor) : null)));
    };
    if (O.ehDemo()) {
      const itens = [{ em: lead.entradaEm, resumo: `Entrou pelo ${N.canal(lead.origem).nome}${camp ? ` · campanha ${camp.nome}` : ''}` }];
      if (lead.qualificadoEm) itens.push({ em: lead.qualificadoEm, resumo: 'Qualificado', autor: lead.responsavel });
      if (lead.convertidoEm) itens.push({ em: lead.convertidoEm, resumo: 'Convertido', autor: lead.responsavel });
      if (lead.etapa === 'perdido') itens.push({ em: lead.ultimaAtividadeEm, resumo: 'Marcado como perdido', autor: lead.responsavel });
      pintar(itens.reverse());
    } else O.chamar(`interacoes?lead=${lead.id}`).then(pintar).catch((e) => pintar([{ em: new Date().toISOString(), resumo: e.message }]));
    return dlg;
  }

  function novoLead(cj, aoSalvar) {
    const nome = T.h('input', { required: true, maxlength: 200 });
    const contato = T.h('input', { maxlength: 120, placeholder: 'Telefone ou e-mail' });
    const origem = T.h('select', null, N.CANAIS.map((c) => T.h('option', { value: c.id }, c.nome)));
    const camp = T.h('select', null, T.h('option', { value: '' }, 'Sem campanha'), cj.campanhas.map((c) => T.h('option', { value: c.id }, c.nome)));
    const resp = T.h('select', null, T.h('option', { value: '' }, 'Sem responsável'), (cj.pessoas || []).filter((p) => p.ativo !== false).map((p) => T.h('option', { value: p.nome }, p.nome)));
    const prox = T.h('input', { maxlength: 200, placeholder: 'Ex.: ligar amanhã às 10h' });
    const form = T.h('form', { class: 'ops-form' }, U.campo('Nome', nome), U.campo('Contato', contato), T.h('div', { class: 'ops-form-2' }, U.campo('Origem', origem), U.campo('Campanha', camp)), T.h('div', { class: 'ops-form-2' }, U.campo('Responsável', resp), U.campo('Próxima ação', prox)), T.h('div', { class: 'ops-acoes' }, T.h('button', { class: 'botao-primario', type: 'submit' }, 'Cadastrar lead')));
    const dlg = U.dialogo('Novo lead', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await O.acoes.criarLead({ nome: nome.value.trim(), contato: contato.value.trim() || null, origem: origem.value, campanhaId: camp.value || null, responsavel: resp.value || null, proximaAcao: prox.value.trim() || 'Primeiro contato' });
        dlg.fechar();
        T.aviso && T.aviso(O.ehDemo() ? 'Lead cadastrado (simulação, só neste navegador)' : 'Lead cadastrado', 'conferencia');
        aoSalvar();
      } catch (er) {
        erroAviso(er);
      }
    });
  }

  function kanban(cj, fl, leads, repintar) {
    const etapas = cj.etapas || N.ETAPAS_PADRAO;
    const quadro = T.h('div', { class: 'ops-kanban', role: 'list' });
    let arrastando = null;
    for (const et of etapas) {
      const col = leads.filter((l) => l.etapa === et.id);
      const lista = T.h('div', { class: 'ops-kanban-lista' });
      const coluna = T.h(
        'section',
        { class: 'ops-kanban-col', role: 'listitem', 'data-etapa': et.id, style: { '--c': ETAPA_COR[et.id] || 'var(--tinta-3)' }, 'aria-label': `${et.nome}: ${col.length} leads` },
        T.h('header', null, T.h('i'), T.h('b', null, et.nome), T.h('span', { class: 'tab' }, f.n(col.length))),
        lista
      );
      coluna.addEventListener('dragover', (e) => {
        if (!arrastando) return;
        e.preventDefault();
        coluna.classList.add('sobre');
      });
      coluna.addEventListener('dragleave', () => coluna.classList.remove('sobre'));
      coluna.addEventListener('drop', async (e) => {
        e.preventDefault();
        coluna.classList.remove('sobre');
        if (arrastando && arrastando.etapa !== et.id) await mover(arrastando, et.id);
      });
      col
        .sort((a, b) => (b.ultimaAtividadeEm || '').localeCompare(a.ultimaAtividadeEm || ''))
        .slice(0, 40)
        .forEach((l) => {
          const parado = diasDesde(l.ultimaAtividadeEm);
          const card = T.h(
            'article',
            { class: ['ops-kanban-card', l.somenteLeitura ? 'leitura' : null], draggable: !l.somenteLeitura && O.podeEditar(), tabindex: 0, 'aria-label': `${l.nome}, ${N.canal(l.origem).nome}` },
            T.h('div', { class: 'ops-kanban-card-topo' }, T.h('b', null, l.nome), chipCanal(l.origem)),
            l.campanhaId ? T.h('small', null, (cj.campanhas.find((c) => c.id === l.campanhaId) || {}).nome || '') : null,
            T.h('div', { class: 'ops-kanban-card-pe' }, T.h('span', null, l.responsavel || 'sem responsável'), parado !== null ? T.h('span', { class: parado > 3 && !['convertido', 'perdido'].includes(l.etapa) ? 'parado' : null, title: 'Dias desde a última atividade' }, `${parado} d`) : null),
            l.proximaAcao && !['convertido', 'perdido'].includes(l.etapa) ? T.h('p', { class: 'ops-kanban-prox' }, T.icone('seta'), l.proximaAcao) : null,
            !l.somenteLeitura && O.podeEditar()
              ? T.h(
                  'select',
                  { class: 'ops-kanban-mover', 'aria-label': `Mover ${l.nome} para`, onclick: (e) => e.stopPropagation(), onchange: (e) => e.target.value && mover(l, e.target.value) },
                  T.h('option', { value: '' }, 'Mover para…'),
                  etapas.filter((x) => x.id !== l.etapa).map((x) => T.h('option', { value: x.id }, x.nome))
                )
              : l.somenteLeitura
                ? T.h('small', { class: 'ops-kanban-leitura' }, 'Etapa gerida na Kommo')
                : null
          );
          card.addEventListener('dragstart', (e) => {
            arrastando = l;
            card.classList.add('arrastando');
            e.dataTransfer.effectAllowed = 'move';
          });
          card.addEventListener('dragend', () => {
            arrastando = null;
            card.classList.remove('arrastando');
          });
          card.addEventListener('click', () => detalheLead(cj, l));
          card.addEventListener('keydown', (e) => e.key === 'Enter' && e.target === card && detalheLead(cj, l));
          lista.appendChild(card);
        });
      if (col.length > 40) lista.appendChild(T.h('p', { class: 'ops-kanban-mais' }, `+${col.length - 40} leads nesta etapa (use a busca ou a lista)`));
      if (!col.length) lista.appendChild(T.h('p', { class: 'ops-kanban-vazio' }, 'Nenhum lead'));
      quadro.appendChild(coluna);
    }
    async function mover(lead, etapa) {
      try {
        await O.acoes.moverLead(lead, etapa);
        T.aviso && T.aviso(`${lead.nome} → ${nomeEtapa(cj, etapa)}${O.ehDemo() ? ' (simulação)' : ''}`, 'conferencia');
        repintar();
      } catch (e) {
        erroAviso(e);
      }
    }
    return quadro;
  }

  function listaLeads(cj, leads) {
    const linhas = leads.sort((a, b) => b.entradaEm.localeCompare(a.entradaEm)).slice(0, 200);
    return T.h(
      'div',
      { class: 'ops-tabela-rola' },
      T.h(
        'table',
        { class: 'ops-tabela' },
        T.h('thead', null, T.h('tr', null, ['Nome e contato', 'Origem', 'Entrada', 'Campanha', 'Responsável', 'Status', 'Última atividade', 'Próxima ação', 'Conversão'].map((c) => T.h('th', { scope: 'col' }, c)))),
        T.h(
          'tbody',
          null,
          linhas.map((l) => {
            const tr = T.h(
              'tr',
              { tabindex: 0, class: 'clicavel' },
              T.h('th', { scope: 'row' }, T.h('b', null, l.nome), T.h('small', null, l.contato || '')),
              T.h('td', null, chipCanal(l.origem)),
              T.h('td', { class: 'tab' }, f.data(l.entradaEm.slice(0, 10))),
              T.h('td', null, (cj.campanhas.find((c) => c.id === l.campanhaId) || {}).nome || '—'),
              T.h('td', null, l.responsavel || '—'),
              T.h('td', null, T.h('span', { class: 'ops-etapa', style: { '--c': ETAPA_COR[l.etapa] } }, nomeEtapa(cj, l.etapa))),
              T.h('td', { class: 'tab' }, l.ultimaAtividadeEm ? f.data(l.ultimaAtividadeEm.slice(0, 10)) : '—'),
              T.h('td', null, ['convertido', 'perdido'].includes(l.etapa) ? '—' : l.proximaAcao || '—'),
              T.h('td', null, l.convertidoEm ? `${f.data(l.convertidoEm)}${l.valor ? ` · R$ ${f.n(l.valor)}` : ''}` : l.etapa === 'perdido' ? 'Perdido' : 'Em aberto')
            );
            tr.addEventListener('click', () => detalheLead(cj, l));
            tr.addEventListener('keydown', (e) => e.key === 'Enter' && detalheLead(cj, l));
            return tr;
          })
        )
      ),
      leads.length > 200 ? T.h('p', { class: 'ops-nota' }, `Mostrando os 200 mais recentes de ${f.n(leads.length)}. Use a busca ou os filtros.`) : null
    );
  }

  let visaoLeads = 'kanban';
  pagina('passageiros', 'Leads', (host, cj) => {
    const fl = O.f();
    let busca = '';
    const area = T.h('div');
    const ind = N.indicadores(cj, fl);
    const funilLeads = N.contarLeads(N.leadsDoFiltro(cj, fl), fl.janela);
    const pintar = () => {
      T.limpar(area);
      const leads = leadsFiltrados(cj, fl, busca);
      area.appendChild(visaoLeads === 'kanban' ? kanban(cj, fl, leads, pintar) : listaLeads(cj, leads));
    };
    const campoBusca = T.h('input', { type: 'search', class: 'ops-busca', placeholder: 'Buscar por nome, contato ou responsável', 'aria-label': 'Buscar leads', oninput: (e) => { busca = e.target.value; pintar(); } });
    const alternar = T.h(
      'div',
      { class: 'segmentado', role: 'group', 'aria-label': 'Visualização' },
      [['kanban', 'Kanban'], ['lista', 'Lista']].map(([id, n]) => T.h('button', { type: 'button', 'aria-pressed': String(visaoLeads === id), onclick: (e) => { visaoLeads = id; T.$$('button', alternar).forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); pintar(); } }, n))
    );
    host.append(
      U.cabecalho({
        sobretitulo: [T.icone('passageiros'), `${cj.cliente.nome} · Gestão comercial`],
        titulo: 'Leads',
        lead: `Da entrada à conversão: origem, campanha, responsável, status e próxima ação · ${U.periodoTexto(fl.janela)}.`,
        acoes: O.podeEditar() ? T.h('button', { class: 'botao-primario', type: 'button', onclick: () => novoLead(cj, pintar) }, T.icone('mais'), 'Novo lead') : null,
      }),
      T.h('section', { class: 'ops-kpis-principais' }, U.kpi(ind.leads_novos, { destaque: true, janela: fl.janela, cor: '#7c6cff' }), U.kpi(ind.leads_atendimento, { destaque: true, janela: fl.janela }), U.kpi(ind.leads_convertidos, { destaque: true, janela: fl.janela, cor: '#c98500' }), U.kpi(ind.taxa_conversao, { destaque: true, janela: fl.janela })),
      U.cartao(
        { id: 'leads-quadro', titulo: visaoLeads === 'kanban' ? 'Funil de vendas' : 'Leads do período', sub: `${f.n(funilLeads.novos)} entraram · ${f.n(funilLeads.qualificados)} qualificados · ${f.n(funilLeads.convertidos)} convertidos · arraste os cartões entre etapas`, classe: 'largo', acao: T.h('div', { class: 'ops-controles' }, campoBusca, alternar), fontes: [...new Set(cj.leads.map((l) => l.fonte))].map((n) => ({ nome: n })), janela: fl.janela },
        area
      )
    );
    pintar();
  });

  // =====================================================================
  // CAMPANHAS
  // =====================================================================
  function formCampanha(cj, aoSalvar) {
    const hoje = O.hoje();
    const campos = {
      nome: T.h('input', { required: true, maxlength: 200 }),
      objetivo: T.h('textarea', { rows: 2, maxlength: 500 }),
      publico: T.h('input', { maxlength: 300, placeholder: 'Ex.: mulheres, 25–45 anos, até 10 km' }),
      inicio: T.h('input', { type: 'date', required: true, value: hoje }),
      fim: T.h('input', { type: 'date', required: true, value: N.somarDias(hoje, 29) }),
      meta: T.h('input', { type: 'number', min: 0, step: 1, placeholder: '0' }),
      orcamento: T.h('input', { type: 'number', min: 0, step: 50, placeholder: 'opcional' }),
      acoes: T.h('textarea', { rows: 3, placeholder: 'Uma ação ou conteúdo por linha' }),
    };
    const plataformas = T.h('div', { class: 'ops-checks' }, N.CANAIS.filter((c) => c.id !== 'outros').map((c) => T.h('label', null, T.h('input', { type: 'checkbox', value: c.id }), c.nome)));
    const pessoas = (cj.pessoas || []).filter((p) => p.ativo !== false);
    const fases = N.FASES_CAMPANHA.map((fz) => ({ fz, resp: T.h('select', null, T.h('option', { value: '' }, '—'), pessoas.map((p) => T.h('option', { value: p.nome }, p.nome))), meta: T.h('input', { maxlength: 120, placeholder: 'meta da fase' }) }));
    // dica de planejamento a partir do histórico
    const hist = N.historicoCampanhas(cj, hoje);
    const sugestao = hist.n
      ? T.h('p', { class: 'ops-sugestao' }, T.icone('raio'), T.h('span', null, `Nas ${hist.n} campanhas anteriores a conversão média foi ${hist.taxaMedia === null ? '—' : f.pct(hist.taxaMedia)}; o canal que mais trouxe leads foi `, T.h('b', null, (() => { const c = {}; hist.linhas.forEach((l) => l.melhorCanal && (c[l.melhorCanal] = (c[l.melhorCanal] || 0) + 1)); const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return top ? N.canal(top[0]).nome : '—'; })()), '.'))
      : null;
    const form = T.h(
      'form',
      { class: 'ops-form largo' },
      sugestao,
      U.campo('1. Nome da campanha', campos.nome),
      U.campo('2. Cliente responsável', T.h('input', { value: cj.cliente.nome, disabled: true })),
      U.campo('3. Objetivo', campos.objetivo),
      U.campo('4. Plataformas', plataformas),
      U.campo('5. Público-alvo', campos.publico),
      T.h('div', { class: 'ops-form-2' }, U.campo('6. Início', campos.inicio), U.campo('Encerramento', campos.fim)),
      T.h('div', { class: 'ops-form-2' }, U.campo('7. Meta de leads', campos.meta), U.campo('8. Orçamento (R$)', campos.orcamento)),
      U.campo('9. Conteúdos e ações planejadas', campos.acoes),
      T.h('fieldset', { class: 'ops-fases-form' }, T.h('legend', null, '10. Etapas de execução'), fases.map((x) => T.h('div', { class: 'ops-fase-linha' }, T.h('span', null, x.fz.nome), x.resp, x.meta))),
      T.h('div', { class: 'ops-acoes' }, T.h('button', { class: 'botao-primario', type: 'submit' }, 'Criar campanha'))
    );
    const dlg = U.dialogo('Nova campanha', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (campos.fim.value < campos.inicio.value) return erroAviso(new Error('O encerramento precisa ser depois do início.'));
      try {
        const ini = campos.inicio.value;
        const fim = campos.fim.value;
        const dur = N.diasEntre(ini, fim) + 1;
        const datasFase = (i) => (i === 0 ? [N.somarDias(ini, -10), N.somarDias(ini, -6)] : i === 1 ? [N.somarDias(ini, -5), N.somarDias(ini, -1)] : i === 2 ? [ini, N.somarDias(ini, 2)] : i === 6 ? [fim, N.somarDias(fim, 7)] : [N.somarDias(ini, Math.round((dur * (i - 3)) / 3)), N.somarDias(ini, Math.round((dur * (i - 2)) / 3) - 1)]);
        await O.acoes.criarCampanha({
          nome: campos.nome.value.trim(),
          objetivo: campos.objetivo.value.trim() || null,
          plataformas: T.$$('input:checked', plataformas).map((i) => i.value),
          publico: campos.publico.value.trim() || null,
          inicio: ini,
          fim,
          metaLeads: campos.meta.value ? Number(campos.meta.value) : null,
          orcamento: campos.orcamento.value ? Number(campos.orcamento.value) : null,
          acoes: campos.acoes.value.split('\n').map((x) => x.trim()).filter(Boolean).map((titulo) => ({ titulo, feito: false })),
          fases: fases.map((x, i) => ({ etapa: x.fz.id, responsavel: x.resp.value || null, meta: x.meta.value.trim() || null, inicio: datasFase(i)[0], fim: datasFase(i)[1] })),
        });
        dlg.fechar();
        T.aviso && T.aviso(O.ehDemo() ? 'Campanha criada (simulação, só neste navegador)' : 'Campanha criada', 'conferencia');
        aoSalvar();
      } catch (er) {
        erroAviso(er);
      }
    });
  }

  function cartaoCampanha(cj, c, hoje, repintar) {
    const p = N.progressoCampanha(c, cj, hoje);
    const ESTADO = { ativa: ['firme', 'Ativa'], agendada: ['nao-medido', 'Agendada'], encerrada: ['nao-medido', 'Encerrada'] };
    const RITMO = { no_ritmo: ['firme', 'No ritmo'], atencao: ['atencao', 'Atenção'], abaixo: ['agir', 'Abaixo da meta'] };
    const fases = T.h(
      'ol',
      { class: 'ops-fases' },
      p.fases.map((fz) => {
        const status = fz.atrasada && fz.status !== 'concluida' ? 'atrasada' : fz.status;
        const sel = O.podeEditar()
          ? T.h(
              'select',
              { class: 'ops-fase-status', 'aria-label': `Status de ${fz.nome}`, onchange: async (e) => { try { await O.acoes.atualizarFase(c, fz, { status: e.target.value }); repintar(); } catch (er) { erroAviso(er); } } },
              N.STATUS_FASE.map((s) => T.h('option', { value: s.id, selected: s.id === fz.status }, s.nome))
            )
          : T.h('span', null, N.STATUS_FASE.find((s) => s.id === fz.status).nome);
        return T.h(
          'li',
          { 'data-status': status },
          T.h('span', { class: 'ops-fase-ponto' }),
          T.h('b', null, fz.nome),
          T.h('small', null, fz.inicio ? `${f.data(fz.inicio)}–${f.data(fz.fim)}` : 'sem datas'),
          T.h('small', null, fz.responsavel || 'sem responsável'),
          fz.meta ? T.h('small', { class: 'ops-fase-meta' }, `Meta: ${fz.meta}`) : null,
          fz.atrasada && fz.status !== 'concluida' ? T.h('small', { class: 'ops-fase-atraso' }, T.icone('atencao'), 'atrasada') : null,
          sel
        );
      })
    );
    const [es, et] = ESTADO[p.estado];
    const r = RITMO[p.ritmo];
    return T.h(
      'article',
      { class: 'ops-campanha', id: `camp-${c.id}`, 'data-revela': '' },
      T.h(
        'header',
        null,
        T.h('div', null, T.h('h3', null, c.nome), T.h('p', null, c.objetivo || '')),
        T.h('div', { class: 'ops-campanha-estados' }, T.h('span', { class: 'ops-estado', 'data-s': es }, et), r ? T.h('span', { class: 'ops-estado', 'data-s': r[0] }, T.icone(r[0]), r[1]) : null, O.podeEditar() ? T.h('button', { class: 'botao-icone', type: 'button', title: 'Excluir campanha', 'aria-label': `Excluir ${c.nome}`, onclick: async () => { if (!confirmar(`Excluir a campanha "${c.nome}"?`)) return; try { await O.acoes.removerCampanha(c); repintar(); } catch (e) { erroAviso(e); } } }, T.icone('lixo')) : null)
      ),
      T.h(
        'dl',
        { class: 'ops-campanha-dados' },
        [
          ['Período', `${f.data(c.inicio)} a ${f.data(c.fim)}`],
          ['Plataformas', (c.plataformas || []).map((x) => N.canal(x).nome).join(', ') || '—'],
          ['Público', c.publico || '—'],
          ['Orçamento', c.orcamento ? `R$ ${f.n(c.orcamento)}` : '—'],
        ].map(([k, v]) => T.h('div', null, T.h('dt', null, k), T.h('dd', null, v)))
      ),
      T.h(
        'div',
        { class: 'ops-meta-resultado' },
        T.h('div', { class: 'ops-progresso grande' }, T.h('span', null, 'Leads captados × meta'), T.h('i', { style: { '--w': `${Math.min(100, (p.fracMeta || 0) * 100)}%` } }), T.h('b', { class: 'tab' }, `${f.n(p.captados)} de ${c.metaLeads ? f.n(c.metaLeads) : '—'}`)),
        T.h('div', { class: 'ops-progresso grande tempo' }, T.h('span', null, 'Prazo decorrido'), T.h('i', { style: { '--w': `${p.fracTempo * 100}%` } }), T.h('b', { class: 'tab' }, `${p.decorrido} de ${p.duracao} dias`)),
        T.h('p', null, `${f.n(p.convertidos)} conversões · taxa ${p.taxaConversao === null ? '—' : f.pct(p.taxaConversao)}${c.orcamento && p.captados ? ` · custo por lead R$ ${f.nFlex(c.orcamento / p.captados, 2)}` : ''}`)
      ),
      fases,
      c.acoes && c.acoes.length ? T.h('details', { class: 'ops-acoes-plan' }, T.h('summary', null, `Conteúdos e ações planejadas (${c.acoes.filter((a) => a.feito).length}/${c.acoes.length} feitas)`), T.h('ul', null, c.acoes.map((a) => T.h('li', { class: a.feito ? 'feito' : null }, a.titulo)))) : null
    );
  }
  const confirmar = (msg) => window.confirm(msg);

  function inteligenciaCampanhas(cj, fl) {
    const hoje = O.hoje();
    const hist = N.historicoCampanhas(cj, hoje);
    const origem = N.origemLeads(cj, { ...fl, campanha: 'todas', janela: N.janela('90', hoje) });
    const formatos = N.porFormato(cj, { ...fl, campanha: 'todas', janela: N.janela('90', hoje) }).filter((x) => x.n >= 3);
    const mapa = N.mapaAtividade(cj, { ...fl, janela: N.janela('90', hoje) });
    const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    const resp = (pergunta, resposta) => T.h('div', { class: 'ops-pergunta' }, T.h('dt', null, pergunta), T.h('dd', null, resposta));
    const melhorCanal = origem.slice().sort((a, b) => b.leads - a.leads)[0];
    const melhorConv = origem.filter((x) => x.leads >= 10).sort((a, b) => (b.taxaConversao || 0) - (a.taxaConversao || 0))[0];
    return U.cartao(
      { id: 'camp-inteligencia', titulo: 'Inteligência para a próxima campanha', sub: 'O que o histórico deste cliente ensina (últimos 90 dias e campanhas encerradas)', classe: 'largo', fontes: [{ nome: 'Leads' }, { nome: 'Publicações' }, { nome: 'Conversas' }, { nome: 'Campanhas' }], janela: N.janela('90', hoje) },
      T.h(
        'dl',
        { class: 'ops-perguntas' },
        resp('Quais canais trouxeram mais leads?', melhorCanal ? `${melhorCanal.nome} (${f.n(melhorCanal.leads)} leads, ${f.pct(melhorCanal.pct, 0)} do total)${melhorConv && melhorConv.canal !== melhorCanal.canal ? `; a melhor conversão foi de ${melhorConv.nome} (${f.pct(melhorConv.taxaConversao, 0)})` : ''}.` : 'Sem leads suficientes.'),
        resp('Quais formatos tiveram mais engajamento?', formatos.length ? `${formatos[0].nome} (${f.pct(formatos[0].taxaMedia)} em média, ${formatos[0].n} posts)${formatos[1] ? `, seguidos de ${formatos[1].nome} (${f.pct(formatos[1].taxaMedia)})` : ''}.` : 'Poucas publicações para comparar formatos.'),
        resp('Em quais horários houve mais conversas?', mapa.total >= 50 ? N.melhoresHorarios(mapa, 2).map((m) => `${DIAS[m.dow]} ${m.hora}h–${m.hora + 2}h`).join(' e ') + '.' : 'Poucos eventos com horário para concluir.'),
        resp('Qual foi a conversão das campanhas anteriores?', hist.n ? `${f.pct(hist.taxaMedia)} em média, em ${hist.n} campanha(s) encerrada(s).` : 'Nenhuma campanha encerrada ainda.'),
        resp('Quais estratégias funcionaram melhor?', hist.n ? (() => { const top = hist.linhas.filter((l) => l.atingimento !== null).sort((a, b) => b.atingimento - a.atingimento)[0]; return top ? `"${top.nome}" atingiu ${f.pct(top.atingimento, 0)} da meta${top.melhorCanal ? `, puxada por ${N.canal(top.melhorCanal).nome}` : ''}.` : '—'; })() : 'Ainda sem histórico.')
      ),
      hist.n
        ? T.h(
            'div',
            { class: 'ops-tabela-rola' },
            T.h(
              'table',
              { class: 'ops-tabela' },
              T.h('caption', null, 'Metas × resultados efetivos'),
              T.h('thead', null, T.h('tr', null, ['Campanha', 'Meta', 'Captados', 'Atingimento', 'Convertidos', 'Conversão', 'Melhor canal', 'Custo por lead'].map((c) => T.h('th', { scope: 'col' }, c)))),
              T.h('tbody', null, hist.linhas.map((l) => T.h('tr', null, T.h('th', { scope: 'row' }, l.nome), T.h('td', { class: 'tab' }, l.meta ? f.n(l.meta) : '—'), T.h('td', { class: 'tab' }, f.n(l.captados)), T.h('td', null, l.atingimento === null ? '—' : T.h('span', { class: 'ops-estado', 'data-s': l.atingimento >= 100 ? 'firme' : l.atingimento >= 70 ? 'atencao' : 'agir' }, f.pct(l.atingimento, 0))), T.h('td', { class: 'tab' }, f.n(l.convertidos)), T.h('td', { class: 'tab' }, l.taxaConversao === null ? '—' : f.pct(l.taxaConversao)), T.h('td', null, l.melhorCanal ? N.canal(l.melhorCanal).nome : '—'), T.h('td', { class: 'tab' }, l.custoPorLead ? `R$ ${f.nFlex(l.custoPorLead, 2)}` : '—'))))
            )
          )
        : null
    );
  }

  pagina('plano', 'Campanhas', (host, cj) => {
    const fl = O.f();
    const area = T.h('div', { class: 'ops-campanhas' });
    const hoje = O.hoje();
    const pintar = () => {
      T.limpar(area);
      const camps = cj.campanhas.filter((c) => fl.campanha === 'todas' || c.id === fl.campanha).filter((c) => fl.plataforma === 'todas' || (c.plataformas || []).includes(fl.plataforma));
      const grupos = [
        ['Ativas', camps.filter((c) => c.inicio <= hoje && c.fim >= hoje)],
        ['Agendadas', camps.filter((c) => c.inicio > hoje)],
        ['Encerradas', camps.filter((c) => c.fim < hoje)],
      ];
      if (!camps.length) area.appendChild(U.vazio('Nenhuma campanha', 'Crie a primeira campanha para planejar fases, metas e acompanhar resultados.'));
      for (const [nome, lista] of grupos) if (lista.length) area.append(T.h('h2', { class: 'ops-subtitulo' }, `${nome} · ${lista.length}`), ...lista.map((c) => cartaoCampanha(cj, c, hoje, pintar)));
    };
    host.append(
      U.cabecalho({
        sobretitulo: [T.icone('plano'), `${cj.cliente.nome} · Inteligência de campanhas`],
        titulo: 'Campanhas',
        lead: 'Planejamento → Preparação → Lançamento → Captação → Qualificação → Conversão → Análise de resultados. Cada fase com status, responsável, período e meta.',
        acoes: O.podeEditar() ? T.h('button', { class: 'botao-primario', type: 'button', onclick: () => formCampanha(cj, pintar) }, T.icone('mais'), 'Nova campanha') : null,
      }),
      inteligenciaCampanhas(cj, fl),
      area
    );
    pintar();
  });

  // =====================================================================
  // CENTRAL
  // =====================================================================
  pagina('central', 'Central', (host, cj) => {
    const fl = O.f();
    const hoje = O.hoje();
    const ind = N.indicadores(cj, fl);
    const ins = N.insights(cj, fl);
    const eventos = [];
    for (const l of cj.leads) {
      if (l.entradaEm && N.diasEntre(l.entradaEm.slice(0, 10), hoje) <= 2) eventos.push({ em: l.entradaEm, icone: 'passageiros', texto: `Novo lead: ${l.nome}`, sub: `${N.canal(l.origem).nome}${l.campanhaId ? ` · ${(cj.campanhas.find((c) => c.id === l.campanhaId) || {}).nome}` : ''}`, rota: 'passageiros' });
      if (l.convertidoEm && N.diasEntre(l.convertidoEm.slice(0, 10), hoje) <= 2) eventos.push({ em: `${l.convertidoEm.slice(0, 10)}T18:00:00-03:00`, icone: 'firme', texto: `Conversão: ${l.nome}`, sub: l.responsavel || '', rota: 'passageiros' });
    }
    for (const c of cj.campanhas)
      for (const fz of c.fases) {
        if (fz.inicio && N.diasEntre(fz.inicio, hoje) >= 0 && N.diasEntre(fz.inicio, hoje) <= 3) eventos.push({ em: `${fz.inicio}T09:00:00-03:00`, icone: 'plano', texto: `${c.nome}: começou ${fz.nome}`, sub: fz.responsavel || '', rota: 'plano', alvo: `camp-${c.id}` });
      }
    eventos.sort((a, b) => b.em.localeCompare(a.em));

    const alertas = [
      ...cj.conectores.filter((c) => ['erro', 'sem_permissao', 'atrasado'].includes(c.estado)).map((c) => ({ nivel: 'agir', titulo: `${N.canal(c.canal).nome}: integração com problema`, texto: c.mensagem || 'Confira a integração.', rota: 'controladores' })),
      ...ins.filter((i) => i.tom === 'alerta').map((i) => ({ nivel: 'atencao', titulo: i.fato, texto: i.recomendacao, rota: i.acao && i.acao.rota, alvo: i.acao && i.acao.alvo })),
    ];
    const abertos = cj.leads.filter((l) => !['convertido', 'perdido'].includes(l.etapa));
    const pendencias = [
      { n: abertos.filter((l) => l.etapa === 'novo' && diasDesde(l.entradaEm) >= 1).length, texto: 'leads novos sem primeiro contato há mais de 1 dia', rota: 'passageiros' },
      { n: abertos.filter((l) => diasDesde(l.ultimaAtividadeEm) > 3).length, texto: 'leads em aberto parados há mais de 3 dias', rota: 'passageiros' },
      { n: abertos.filter((l) => !l.responsavel).length, texto: 'leads sem responsável', rota: 'passageiros' },
      { n: cj.campanhas.reduce((s, c) => s + N.progressoCampanha(c, cj, hoje).fasesAtrasadas, 0), texto: 'fases de campanha atrasadas', rota: 'plano' },
    ];
    const atendimento = [ind.conversas_iniciadas, ind.tempo_primeira_resposta, ind.leads_atendimento, ind.contatos_unicos];
    const atalhos = [
      ['painel', 'painel', 'Visão Executiva'],
      ['passageiros', 'passageiros', 'Leads e Kanban'],
      ['plano', 'plano', 'Campanhas'],
      ['conteudo', 'alcance', 'Análise de conteúdo'],
      ['controladores', 'controladores', 'Admin e integrações'],
    ];
    const link = (rota, alvo) => `#/${rota === 'painel' ? '' : rota}${alvo ? `?alvo=${alvo}` : ''}`;
    host.append(
      U.cabecalho({ sobretitulo: [T.icone('central'), `${cj.cliente.nome} · Acompanhamento operacional`], titulo: 'Central', lead: 'O que aconteceu, o que precisa de atenção e o que está pendente — agora.' }),
      T.h('nav', { class: 'ops-atalhos', 'aria-label': 'Acesso rápido' }, atalhos.map(([r, ic, t]) => T.h('a', { href: link(r) }, T.icone(ic), t, T.icone('seta')))),
      T.h(
        'div',
        { class: 'ops-linha l-1-1' },
        U.cartao(
          { id: 'central-alertas', titulo: 'Alertas importantes', sub: `${alertas.length} pedem atenção`, rodape: U.rodapeFonte(['Integrações', 'Análise dos indicadores'], fl.janela) },
          alertas.length ? T.h('ul', { class: 'ops-alertas' }, alertas.slice(0, 8).map((a) => T.h('li', { 'data-s': a.nivel === 'agir' ? 'agir' : 'atencao' }, T.icone(a.nivel === 'agir' ? 'agir' : 'atencao'), T.h('div', null, T.h('b', null, a.titulo), T.h('p', null, a.texto)), a.rota ? T.h('a', { class: 'link-seta', href: link(a.rota, a.alvo) }, 'Abrir', T.icone('seta')) : null))) : U.vazio('Nenhum alerta', 'Integrações funcionando e indicadores sem quedas relevantes.')
        ),
        U.cartao(
          { id: 'central-pendencias', titulo: 'Pendências', sub: 'O que está esperando alguém', rodape: U.rodapeFonte(['Leads', 'Campanhas']) },
          T.h('ul', { class: 'ops-pendencias' }, pendencias.map((p) => T.h('li', { class: p.n ? 'tem' : null }, T.h('b', { class: 'tab' }, f.n(p.n)), T.h('span', null, p.texto), p.n ? T.h('a', { class: 'link-seta', href: link(p.rota) }, 'Ver', T.icone('seta')) : null)))
        )
      ),
      T.h(
        'div',
        { class: 'ops-linha l-2-1' },
        U.cartao(
          { id: 'central-atividades', titulo: 'Atividades recentes', sub: 'Últimos 3 dias: novos leads, conversões e campanhas', rodape: U.rodapeFonte(['Leads', 'Campanhas']) },
          eventos.length ? T.h('ol', { class: 'ops-feed' }, eventos.slice(0, 14).map((e) => T.h('li', null, T.h('span', { class: 'ops-feed-icone' }, T.icone(e.icone)), T.h('div', null, T.h('a', { href: link(e.rota, e.alvo) }, e.texto), T.h('small', null, [U.dataHora(e.em), e.sub].filter(Boolean).join(' · ')))))) : U.vazio('Sem atividades recentes')
        ),
        U.cartao(
          { id: 'central-atendimento', titulo: 'Atendimentos', sub: 'Conversas e tempo de resposta no período', fontes: (ind.conversas_iniciadas && ind.conversas_iniciadas.fontes) || [], janela: fl.janela },
          T.h('div', { class: 'ops-kpis-coluna' }, atendimento.map((k) => U.kpi(k, { cor: '#14a3b8' })))
        )
      ),
      U.cartao(
        { id: 'central-desempenho', titulo: 'Notificações de desempenho e campanhas', sub: 'Boas notícias e atualizações das campanhas ativas', classe: 'largo', rodape: U.rodapeFonte(['Análise dos indicadores', 'Campanhas'], fl.janela) },
        T.h(
          'ul',
          { class: 'ops-alertas positivo' },
          [
            ...ins.filter((i) => i.tom !== 'alerta').map((i) => ({ titulo: i.fato, texto: i.recomendacao, rota: i.acao && i.acao.rota, alvo: i.acao && i.acao.alvo })),
            ...cj.campanhas.filter((c) => c.inicio <= hoje && c.fim >= hoje).map((c) => { const p = N.progressoCampanha(c, cj, hoje); return { titulo: `${c.nome}: ${f.n(p.captados)} de ${f.n(c.metaLeads)} leads, ${p.decorrido} de ${p.duracao} dias`, texto: p.faseAtual ? `Fase atual: ${p.faseAtual.nome} (${p.faseAtual.responsavel || 'sem responsável'})` : '', rota: 'plano', alvo: `camp-${c.id}` }; }),
          ].map((a) => T.h('li', { 'data-s': 'firme' }, T.icone('info'), T.h('div', null, T.h('b', null, a.titulo), a.texto ? T.h('p', null, a.texto) : null), a.rota ? T.h('a', { class: 'link-seta', href: link(a.rota, a.alvo) }, 'Abrir', T.icone('seta')) : null))
        )
      )
    );
  });

  // =====================================================================
  // PESSOAS
  // =====================================================================
  const PAPEIS = { admin: 'Admin', gestor: 'Gestor', analista: 'Analista', atendimento: 'Atendimento', cliente: 'Cliente (leitura)' };
  function formPessoa(pessoa, aoSalvar) {
    const nome = T.h('input', { required: true, value: pessoa ? pessoa.nome : '', maxlength: 200 });
    const email = T.h('input', { type: 'email', value: pessoa ? pessoa.email || '' : '', maxlength: 200 });
    const papel = T.h('select', null, Object.entries(PAPEIS).filter(([id]) => id !== 'admin' || O.ehAdmin()).map(([id, n]) => T.h('option', { value: id, selected: pessoa ? pessoa.papel === id : id === 'atendimento' }, n)));
    const ativo = T.h('input', { type: 'checkbox', checked: pessoa ? pessoa.ativo !== false : true });
    const form = T.h('form', { class: 'ops-form' }, U.campo('Nome', nome), U.campo('E-mail', email, 'Opcional. Para dar login, um Admin cria o usuário e o vincula.'), U.campo('Papel', papel), T.h('label', { class: 'ops-check' }, ativo, 'Ativa na operação'), T.h('div', { class: 'ops-acoes' }, T.h('button', { class: 'botao-primario', type: 'submit' }, pessoa ? 'Salvar' : 'Cadastrar')));
    const dlg = U.dialogo(pessoa ? `Editar ${pessoa.nome}` : 'Nova pessoa', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dados = { nome: nome.value.trim(), email: email.value.trim() || null, papel: papel.value, ativo: ativo.checked };
      try {
        if (pessoa) await O.acoes.atualizarPessoa(pessoa, dados);
        else await O.acoes.criarPessoa(dados);
        dlg.fechar();
        aoSalvar();
      } catch (er) {
        erroAviso(er);
      }
    });
  }

  pagina('pilotos', 'Pessoas', (host, cj) => {
    const fl = O.f();
    const area = T.h('div');
    const pintar = () => {
      T.limpar(area);
      const pessoas = (cj.pessoas || []).slice().sort((a, b) => a.nome.localeCompare(b.nome));
      if (!pessoas.length) return area.appendChild(U.vazio('Nenhuma pessoa cadastrada', 'Cadastre quem atende, gere campanhas ou acompanha este cliente.'));
      const leadsJ = cj.leads.filter((l) => N.dentro(l.entradaEm, fl.janela));
      area.appendChild(
        T.h(
          'div',
          { class: 'ops-tabela-rola' },
          T.h(
            'table',
            { class: 'ops-tabela' },
            T.h('thead', null, T.h('tr', null, ['Pessoa', 'Papel', 'Situação', 'Leads no período', 'Em aberto', 'Convertidos', 'Conversão', ''].map((c) => T.h('th', { scope: 'col' }, c)))),
            T.h(
              'tbody',
              null,
              pessoas.map((p) => {
                const meus = leadsJ.filter((l) => l.responsavel === p.nome);
                const conv = cj.leads.filter((l) => l.responsavel === p.nome && l.convertidoEm && N.dentro(l.convertidoEm, fl.janela)).length;
                const abertos = cj.leads.filter((l) => l.responsavel === p.nome && !['convertido', 'perdido'].includes(l.etapa)).length;
                return T.h(
                  'tr',
                  { class: p.ativo === false ? 'inativo' : null },
                  T.h('th', { scope: 'row' }, T.h('span', { class: 'ops-avatar' }, p.nome.split(' ').map((x) => x[0]).join('').slice(0, 2)), T.h('span', null, T.h('b', null, p.nome), p.email ? T.h('small', null, p.email) : null)),
                  T.h('td', null, PAPEIS[p.papel] || p.papel),
                  T.h('td', null, T.h('span', { class: 'ops-estado', 'data-s': p.ativo === false ? 'nao-medido' : 'firme' }, p.ativo === false ? 'Inativa' : 'Ativa')),
                  T.h('td', { class: 'tab' }, f.n(meus.length)),
                  T.h('td', { class: 'tab' }, f.n(abertos)),
                  T.h('td', { class: 'tab' }, f.n(conv)),
                  T.h('td', { class: 'tab' }, meus.length ? f.pct((meus.filter((l) => l.convertidoEm).length / meus.length) * 100) : '—'),
                  T.h('td', null, O.podeEditar() ? T.h('button', { class: 'botao-fantasma', type: 'button', onclick: () => formPessoa(p, pintar) }, 'Editar') : null)
                );
              })
            )
          )
        )
      );
    };
    host.append(
      U.cabecalho({
        sobretitulo: [T.icone('pilotos'), `${cj.cliente.nome} · Equipe`],
        titulo: 'Pessoas',
        lead: 'Quem faz parte da operação deste cliente, com papel, permissões e resultados no período.',
        acoes: O.podeEditar() ? T.h('button', { class: 'botao-primario', type: 'button', onclick: () => formPessoa(null, pintar) }, T.icone('mais'), 'Nova pessoa') : null,
      }),
      U.cartao({ id: 'pessoas-lista', titulo: 'Equipe vinculada', sub: 'Leads atribuídos pelo campo "responsável"', classe: 'largo', rodape: U.rodapeFonte(['Cadastro de pessoas', 'Leads'], fl.janela) }, area),
      U.cartao(
        { id: 'pessoas-papeis', titulo: 'Papéis e permissões', sub: 'O que cada papel pode fazer', classe: 'largo', rodape: null },
        T.h(
          'div',
          { class: 'ops-tabela-rola' },
          T.h(
            'table',
            { class: 'ops-tabela compacta' },
            T.h('thead', null, T.h('tr', null, ['Papel', 'Vê dados', 'Edita leads e campanhas', 'Gerencia pessoas', 'Integrações e clientes', 'Compara clientes'].map((c) => T.h('th', { scope: 'col' }, c)))),
            T.h(
              'tbody',
              null,
              [
                ['Admin', 'Todos os clientes', 'Sim', 'Sim', 'Sim', 'Sim'],
                ['Gestor', 'Clientes liberados', 'Sim', 'Sim', 'Não', 'Não'],
                ['Atendimento', 'Clientes liberados', 'Sim', 'Não', 'Não', 'Não'],
                ['Analista', 'Clientes liberados', 'Não', 'Não', 'Não', 'Não'],
                ['Cliente', 'Só o próprio', 'Não', 'Não', 'Não', 'Não'],
              ].map((l) => T.h('tr', null, T.h('th', { scope: 'row' }, l[0]), l.slice(1).map((c) => T.h('td', null, c))))
            )
          )
        )
      )
    );
    pintar();
  });

  // =====================================================================
  // ADMIN
  // =====================================================================
  const AJUDA_CONEXAO = {
    instagram: { conta: 'ID da conta profissional do Instagram (ig-user-id)', token: 'Token de acesso com instagram_basic, instagram_manage_insights e pages_read_engagement' },
    facebook: { conta: 'ID da Página', token: 'Token de Página com pages_read_engagement e read_insights' },
    kommo: { conta: 'Subdomínio (o "minhaempresa" de minhaempresa.kommo.com)', token: 'Token de longa duração da integração privada' },
    whatsapp: { conta: 'Phone number ID (WhatsApp Business Cloud)', token: 'Token permanente de usuário do sistema' },
  };
  function conectar(canal, aoSalvar) {
    const conta = T.h('input', { required: true, maxlength: 120 });
    const token = T.h('input', { type: 'password', required: true, autocomplete: 'off' });
    const aviso = T.h('p', { class: 'ops-form-aviso', role: 'status' });
    const form = T.h('form', { class: 'ops-form' }, T.h('p', { class: 'ops-form-ajuda' }, 'A credencial é testada na plataforma, cifrada no servidor e nunca volta para o navegador.'), U.campo('Conta', conta, AJUDA_CONEXAO[canal].conta), U.campo('Token', token, AJUDA_CONEXAO[canal].token), aviso, T.h('div', { class: 'ops-acoes' }, T.h('button', { class: 'botao-primario', type: 'submit' }, 'Testar e conectar')));
    const dlg = U.dialogo(`Conectar ${N.canal(canal).nome}`, form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      aviso.textContent = 'Testando a credencial…';
      try {
        const r = await O.chamar('integracoes', { metodo: 'POST', corpo: { cliente: O.estado.cliente, canal, conta: conta.value.trim(), token: token.value.trim() } });
        aviso.textContent = `Conectado: ${r.conta}.${r.webhookKommo ? ` Configure o webhook da Kommo para ${location.origin}${r.webhookKommo}` : ''}`;
        O.invalidar();
        setTimeout(() => {
          dlg.fechar();
          aoSalvar();
        }, r.webhookKommo ? 6000 : 1200);
      } catch (er) {
        aviso.textContent = er.message;
        aviso.dataset.tom = 'ruim';
      }
    });
  }

  pagina('controladores', 'Admin', (host, cj) => {
    const ESTADO = { ativo: ['firme', 'Ativa'], atrasado: ['atencao', 'Atrasada'], erro: ['agir', 'Erro'], sem_permissao: ['agir', 'Sem permissão'], pendente: ['atencao', 'Pendente'], nao_configurado: ['nao-medido', 'Não configurada'] };
    const integracoes = T.h(
      'div',
      { class: 'ops-integracoes' },
      cj.conectores.map((c) => {
        const [s, t] = ESTADO[c.estado] || ESTADO.nao_configurado;
        const canal = N.canal(c.canal);
        const METR = { instagram: 'Alcance, visitas, visualizações, seguidores, interações e publicações', facebook: 'Alcance, visualizações, visitas à Página, seguidores e posts', kommo: 'Leads, etapas, responsáveis e conversas dos chats', whatsapp: 'Conversas, contatos únicos, tempo de 1ª resposta e leads (webhook)' };
        return T.h(
          'article',
          { class: 'ops-integracao', style: { '--c': canal.cor } },
          T.h('header', null, T.h('i'), T.h('b', null, canal.nome), T.h('span', { class: 'ops-estado', 'data-s': s }, t)),
          T.h('p', null, METR[c.canal]),
          T.h('small', null, c.ultimaSync ? `Última sincronização: ${U.dataHora(c.ultimaSync)}` : 'Ainda não sincronizou'),
          c.mensagem ? T.h('p', { class: 'ops-integracao-msg' }, c.mensagem) : null,
          O.ehDemo() ? T.h('small', { class: 'ops-fonte-sim' }, 'Estado simulado') : O.ehAdmin() ? T.h('button', { class: 'botao-secundario', type: 'button', onclick: () => conectar(c.canal, () => T.emit('ops:filtro', {})) }, c.estado === 'nao_configurado' ? 'Conectar' : 'Reconectar') : null
        );
      })
    );
    const acoesSync =
      !O.ehDemo() && O.ehAdmin()
        ? T.h(
            'button',
            {
              class: 'botao-secundario',
              type: 'button',
              onclick: async (e) => {
                e.currentTarget.disabled = true;
                try {
                  const r = await O.chamar(`sync?cliente=${O.estado.cliente}`, { metodo: 'POST' });
                  T.aviso && T.aviso(`Sincronização: ${r.rodadas.filter((x) => x.ok).length} de ${r.rodadas.length} integrações ok`, 'conferencia');
                  O.invalidar();
                  T.emit('ops:filtro', {});
                } catch (er) {
                  erroAviso(er);
                }
              },
            },
            T.icone('conferencia'),
            'Sincronizar agora'
          )
        : null;
    const clientes = O.clientes();
    host.append(
      U.cabecalho({ sobretitulo: [T.icone('controladores'), 'Administração'], titulo: 'Admin', lead: 'Clientes, integrações, pessoas, permissões e relatórios — conforme o seu papel.', acoes: [O.ehAdmin() ? T.h('a', { class: 'botao-secundario', href: '#/comparar' }, T.icone('tendencia'), 'Comparar clientes') : null, acoesSync] }),
      O.ehAdmin()
        ? U.cartao(
            { id: 'admin-clientes', titulo: 'Clientes', sub: `${clientes.length} cliente(s) · dados isolados por cliente no banco (RLS)`, classe: 'largo', rodape: null },
            T.h(
              'div',
              { class: 'ops-clientes' },
              clientes.map((c) => T.h('button', { type: 'button', class: ['ops-cliente', c.id === O.estado.cliente ? 'atual' : null], onclick: () => O.definir({ cliente: c.id }) }, T.h('span', { class: 'ops-avatar', style: { '--c': c.cor || 'var(--eletrico)' } }, c.nome.split(' ').map((x) => x[0]).join('').slice(0, 2)), T.h('span', null, T.h('b', null, c.nome), T.h('small', null, c.segmento || (c.simulacao ? 'Simulação' : ''))))),
              !O.ehDemo()
                ? T.h(
                    'button',
                    {
                      type: 'button',
                      class: 'ops-cliente novo',
                      onclick: () => {
                        const nome = T.h('input', { required: true });
                        const seg = T.h('input');
                        const form = T.h('form', { class: 'ops-form' }, U.campo('Nome', nome), U.campo('Segmento', seg), T.h('div', { class: 'ops-acoes' }, T.h('button', { class: 'botao-primario', type: 'submit' }, 'Criar cliente')));
                        const dlg = U.dialogo('Novo cliente', form);
                        form.addEventListener('submit', async (ev) => {
                          ev.preventDefault();
                          try {
                            const c = await O.chamar('clientes', { metodo: 'POST', corpo: { nome: nome.value.trim(), segmento: seg.value.trim() || null } });
                            const info = await O.chamar('sessao');
                            O.sessao.clientes = info.clientes;
                            dlg.fechar();
                            O.definir({ cliente: c.id });
                          } catch (er) {
                            erroAviso(er);
                          }
                        });
                      },
                    },
                    T.icone('mais'),
                    'Novo cliente'
                  )
                : null
            )
          )
        : null,
      U.cartao({ id: 'admin-integracoes', titulo: `Integrações de ${cj.cliente.nome}`, sub: 'APIs oficiais e webhooks · tokens cifrados no servidor', classe: 'largo', rodape: null }, integracoes, O.ehDemo() ? T.h('p', { class: 'ops-nota' }, T.icone('info'), 'Na demonstração os estados são simulados (inclusive um token expirado na Clínica Vértice, para mostrar como o painel reage). Entre com uma conta para conectar integrações reais.') : null),
      T.h(
        'div',
        { class: 'ops-linha l-1-1' },
        U.cartao({ id: 'admin-relatorios', titulo: 'Relatórios e exportações', sub: 'Leve os números para outro lugar', rodape: null }, T.h('div', { class: 'ops-atalhos coluna' }, T.h('button', { type: 'button', onclick: () => T.exportarRelatorio() }, T.icone('pdf'), 'Relatório em PDF da página atual'), T.h('button', { type: 'button', onclick: () => exportarLeads(cj) }, T.icone('planilha'), 'Leads do período (CSV)'), T.h('a', { href: '#/dados' }, T.icone('dados'), 'Dados, importação e contrato de dados'))),
        U.cartao({ id: 'admin-acesso', titulo: 'Acesso e privacidade', sub: 'Como o OPS protege os dados', rodape: null }, T.h('ul', { class: 'ops-lista-check' }, ['Cada linha do banco pertence a um cliente; a política de linha (RLS) só libera clientes que o usuário pode ver.', 'Tokens das plataformas ficam cifrados (AES-256-GCM) e só são abertos no servidor.', 'Conversas guardam um código do contato, não o número; o conteúdo das mensagens não é armazenado.', 'Eventos e conversas sem lead são apagados após 400 dias (LGPD: minimização).', 'Comparação entre clientes só para administradores, com indicadores normalizados.'].map((t) => T.h('li', null, T.icone('firme'), t))))
      )
    );
  });

  O.exportarLeads = () => O.atual() && exportarLeads(O.atual());
  O.exportarConjunto = () => {
    const cj = O.atual();
    if (!cj) return;
    T.planilha.baixar(JSON.stringify({ aviso: O.ehDemo() ? 'SIMULAÇÃO: dados de demonstração, não são reais.' : undefined, ...cj }, null, 2), `ops-${T.planilha.slug(cj.cliente.nome)}${O.ehDemo() ? '-simulacao' : ''}.json`, 'application/json');
  };
  function exportarLeads(cj) {
    const fl = O.f();
    const leads = N.leadsDoFiltro(cj, fl).filter((l) => N.dentro(l.entradaEm, fl.janela));
    const linhas = [['nome', 'contato', 'origem', 'entrada', 'campanha', 'responsavel', 'etapa', 'ultima_atividade', 'proxima_acao', 'convertido_em', 'fonte']].concat(leads.map((l) => [l.nome, l.contato || '', l.origem, l.entradaEm, (cj.campanhas.find((c) => c.id === l.campanhaId) || {}).nome || '', l.responsavel || '', l.etapa, l.ultimaAtividadeEm || '', l.proximaAcao || '', l.convertidoEm || '', l.fonte || '']));
    T.planilha.baixarCSV(linhas, `ops-leads-${T.planilha.slug(cj.cliente.nome)}-${fl.janela.de}-a-${fl.janela.ate}${O.ehDemo() ? '-simulacao' : ''}.csv`);
  }
})();
