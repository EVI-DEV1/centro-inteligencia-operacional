/* Visão Executiva · OPS Intelligence
   Seis linhas (seção 14.4 do prompt): KPIs principais · audiência e origem dos leads · funil e engajamento
   por plataforma · ranking de conteúdos e mapa de calor · campanhas e conversões · insights.
   Tudo responde à barra de filtros global (cliente, plataforma, período, campanha, indicador). */
(function () {
  'use strict';
  const T = window.T;
  const f = T.fmt;
  const O = T.ops;
  const N = O.nucleo;
  const U = O.ui;

  const COR_KPI = { visitas_perfil: '#d55181', leads_novos: '#7c6cff', conversas_iniciadas: '#14a3b8', leads_convertidos: '#c98500' };

  function kpisPrincipais(ind, j) {
    const ids = ['visitas_perfil', 'leads_novos', 'conversas_iniciadas', 'leads_convertidos'];
    const nomes = { conversas_iniciadas: 'Novas conversas', leads_convertidos: 'Conversões' };
    return T.h(
      'section',
      { class: 'ops-kpis-principais', id: 'ops-kpis', 'aria-label': 'Indicadores principais' },
      ids.map((id) => U.kpi(ind[id] && !ind[id].indisponivel && nomes[id] ? { ...ind[id], nome: nomes[id] } : ind[id], { cor: COR_KPI[id], destaque: true, janela: j }))
    );
  }

  function kpisSecundarios(ind) {
    const ids = ['alcance', 'visualizacoes', 'novos_seguidores', 'interacoes', 'taxa_engajamento', 'leads_atendimento', 'taxa_conversao', 'contatos_unicos', 'tempo_primeira_resposta', 'campanhas_ativas'];
    return T.h(
      'details',
      { class: 'ops-mais-kpis', open: true },
      T.h('summary', null, 'Todos os indicadores', T.h('small', null, 'valor atual · variação · fonte')),
      T.h(
        'div',
        { class: 'ops-kpis-secundarios' },
        ids.map((id) => {
          const k = ind[id];
          if (id === 'campanhas_ativas' && k && !k.indisponivel)
            return T.h('article', { class: 'ops-kpi', 'data-revela': '' }, T.h('h3', { class: 'ops-kpi-nome' }, 'Campanhas ativas'), T.h('div', { class: 'ops-kpi-linha' }, T.h('span', { class: 'ops-kpi-valor tab' }, String(k.atual))), T.h('p', { class: 'ops-kpi-ant' }, `${k.noRitmo} no ritmo · ${k.abaixo} abaixo da meta`), T.h('p', { class: 'ops-kpi-fonte' }, 'Cadastro de campanhas'));
          return U.kpi(k, { cor: 'var(--eletrico-claro)' });
        })
      )
    );
  }

  // ---------- linha 2 ----------
  const METRICAS_AUDIENCIA = [
    { id: 'visitas_perfil', nome: 'Visitas' },
    { id: 'alcance', nome: 'Alcance' },
    { id: 'novos_seguidores', nome: 'Seguidores' },
    { id: 'visualizacoes', nome: 'Visualizações' },
    { id: 'conversas_iniciadas', nome: 'Conversas' },
  ];
  function audiencia(cj, fl) {
    const e = O.estado;
    const ehLead = e.indicador === 'leads_novos' || e.indicador === 'leads_convertidos';
    const metrica = METRICAS_AUDIENCIA.some((m) => m.id === e.indicador) ? e.indicador : 'visitas_perfil';
    const abas = T.h(
      'div',
      { class: 'segmentado pequeno', role: 'group', 'aria-label': 'Métrica do gráfico' },
      METRICAS_AUDIENCIA.map((m) => T.h('button', { type: 'button', 'aria-pressed': String(!ehLead && m.id === metrica), onclick: () => O.definir({ indicador: m.id }) }, m.nome))
    );
    const corpo = T.h('div', { class: 'ops-graf' });
    let fontes = [];
    if (ehLead) {
      const leads = N.leadsDoFiltro(cj, fl);
      const campo = e.indicador === 'leads_novos' ? 'entradaEm' : 'convertidoEm';
      const series = N.CANAIS.map((c) => ({ id: c.id, nome: c.nome, cor: c.cor, pontos: N.serieLeads(leads.filter((l) => l.origem === c.id), campo, fl.janela) })).filter((s) => s.pontos.some((p) => p.v));
      series.forEach((s) => (s.total = N.totalDe(s.pontos)));
      if (!series.length) corpo.appendChild(U.indisponivel('Sem leads no período para os filtros escolhidos.'));
      else O.linhas(corpo, { series, formato: f.n, nome: `${N.INDICADORES.find((i) => i.id === e.indicador).nome} por origem` });
      fontes = [...new Set(leads.map((l) => l.fonte))].map((n) => ({ nome: n }));
    } else {
      const motivo = N.indisponivel(cj, metrica, fl.plataforma);
      if (motivo) corpo.appendChild(U.indisponivel(motivo));
      else {
        const series = N.seriesPorCanal(cj, metrica, fl.plataforma, fl.janela).map((s) => {
          const c = N.canal(s.canal);
          return { id: c.id, nome: c.nome, cor: c.cor, pontos: s.pontos, total: N.totalDe(s.pontos, N.METRICAS[metrica].agregar) };
        });
        O.linhas(corpo, { series, formato: f.n, area: series.length === 1, nome: `${N.METRICAS[metrica].nome} por plataforma` });
        corpo.appendChild(O.tabela(['Dia', ...series.map((s) => s.nome)], series[0].pontos.map((p, i) => [f.data(p.d), ...series.map((s) => (s.pontos[i].v === null ? '—' : f.n(s.pontos[i].v)))])));
        fontes = N.canaisAtivos(cj, fl.plataforma)
          .filter((c) => N.METRICAS[metrica].canais.includes(c))
          .map((c) => ({ nome: N.canal(c).nome, ultimaSync: (cj.conectores.find((x) => x.canal === c) || {}).ultimaSync }));
      }
    }
    const nota = !ehLead && N.METRICAS[metrica] && N.METRICAS[metrica].nota ? T.h('p', { class: 'ops-nota' }, N.METRICAS[metrica].nota) : null;
    return U.cartao({ id: 'ops-audiencia', titulo: 'Evolução da audiência', sub: 'Uma linha por plataforma · passe o mouse para ver cada dia · clique na legenda para esconder', acao: abas, classe: 'largo', fontes, janela: fl.janela }, corpo, nota);
  }

  function origem(cj, fl) {
    const o = N.origemLeads(cj, fl);
    const corpo = T.h('div');
    if (!o.length) corpo.appendChild(U.indisponivel('Nenhum lead entrou no período com os filtros escolhidos.'));
    else {
      O.barrasH(
        corpo,
        o.map((x) => ({ rotulo: x.nome, valor: x.leads, cor: x.cor, conv: x.taxaConversao, pct: x.pct, dica: T.dica.bloco([{ cor: x.cor, forma: 'barra', valor: f.n(x.leads), rotulo: 'leads no período' }, { valor: f.pct(x.pct), rotulo: 'do total' }, { valor: f.n(x.convertidos), rotulo: 'convertidos no período' }, { valor: x.taxaConversao === null ? '—' : f.pct(x.taxaConversao), rotulo: 'taxa de conversão' }], x.nome) })),
        { extra: (i) => [T.h('span', null, f.pct(i.pct, 0)), T.h('span', { class: 'ops-conv' }, i.conv === null ? '—' : `${f.pct(i.conv, 0)} conv.`)] }
      );
      corpo.appendChild(O.tabela(['Origem', 'Leads', 'Participação', 'Convertidos', 'Taxa de conversão'], o.map((x) => [x.nome, f.n(x.leads), f.pct(x.pct), f.n(x.convertidos), x.taxaConversao === null ? '—' : f.pct(x.taxaConversao)])));
    }
    const fontes = [...new Set(N.leadsDoFiltro(cj, fl).map((l) => l.fonte))].map((n) => ({ nome: n }));
    return U.cartao({ id: 'ops-origem', titulo: 'Origem dos leads', sub: 'Volume, participação e conversão por canal', fontes, janela: fl.janela }, corpo);
  }

  // ---------- linha 3 ----------
  function funil(cj, fl) {
    const fu = N.funil(cj, fl);
    const corpo = T.h('div');
    O.funil(corpo, fu);
    const nota = T.h('p', { class: 'ops-nota' }, T.icone('info'), 'As três primeiras etapas são agregados de fontes diferentes (as plataformas não identificam visitantes individualmente) e por isso aparecem como estimativa. Largura em escala logarítmica.');
    return U.cartao({ id: 'ops-funil', titulo: 'Fluxo de captação', sub: 'Visitantes → interações → conversas → leads qualificados → conversões', rodape: U.rodapeFonte([{ nome: 'Redes (agregado)' }, { nome: 'Conversas' }, { nome: 'Leads' }], fl.janela) }, corpo, nota);
  }

  function engajamento(cj, fl) {
    const linhas = N.engajamentoPorCanal(cj, fl);
    const corpo = T.h('div');
    if (!linhas.length) corpo.appendChild(U.indisponivel('Nenhuma plataforma com métricas de conteúdo no período (Instagram e Facebook fornecem).'));
    else {
      const bloco = (nome, campo, formato = f.compacto) => ({ nome, formato, itens: linhas.map((l) => ({ curto: N.canal(l.canal).curto, nome: l.nome, cor: l.cor, valor: campo === 'salvamentos' && l.canal === 'facebook' ? null : l[campo] })) });
      O.multiplos(corpo, [bloco('Taxa de engajamento', 'taxa', (v) => f.pct(v, 1)), bloco('Curtidas', 'curtidas'), bloco('Comentários', 'comentarios'), bloco('Compartilhamentos', 'compartilhamentos'), bloco('Salvamentos', 'salvamentos'), bloco('Visualizações', 'visualizacoes')]);
      corpo.appendChild(O.tabela(['Plataforma', 'Posts', 'Curtidas', 'Comentários', 'Compart.', 'Salvos', 'Visualizações', 'Taxa'], linhas.map((l) => [l.nome, l.conteudos, f.n(l.curtidas), f.n(l.comentarios), f.n(l.compartilhamentos), l.canal === 'facebook' ? 'n/d' : f.n(l.salvamentos), f.n(l.visualizacoes), l.taxa === null ? '—' : f.pct(l.taxa)])));
    }
    return U.cartao({ id: 'ops-engajamento', titulo: 'Engajamento por plataforma', sub: 'Publicações do período · cada métrica com a própria escala', fontes: linhas.map((l) => ({ nome: l.nome })), janela: fl.janela }, corpo);
  }

  // ---------- linha 4 ----------
  function ranking(cj, fl) {
    let criterio = 'engajamento';
    const lista = T.h('ol', { class: 'ops-ranking' });
    const pintar = () => {
      T.limpar(lista);
      const itens = N.rankingConteudos(cj, fl, criterio, 6);
      if (!itens.length) return lista.appendChild(T.h('li', { class: 'ops-ranking-vazio' }, U.indisponivel('Sem publicações no período.', { compacto: true })));
      itens.forEach((c, i) =>
        lista.appendChild(
          T.h(
            'li',
            null,
            T.h('span', { class: 'ops-ranking-pos tab' }, String(i + 1)),
            T.h('span', { class: 'ops-ranking-canal', style: { '--c': N.canal(c.canal).cor }, title: N.canal(c.canal).nome }, N.canal(c.canal).curto),
            T.h('span', { class: 'ops-ranking-texto' }, T.h('b', null, c.legenda || '(sem legenda)'), T.h('small', null, `${N.FORMATOS[c.formato] || c.formato} · ${c.tema || 'sem tema'} · ${f.data(c.publicadoEm.slice(0, 10))}`)),
            T.h('span', { class: 'ops-ranking-num tab' }, criterio === 'engajamento' ? (c.taxa === null ? '—' : f.pct(c.taxa)) : criterio === 'alcance' ? f.compacto(c.metricas.alcance) : f.n(c.conversas || 0))
          )
        )
      );
    };
    const abas = T.h(
      'div',
      { class: 'segmentado pequeno', role: 'group', 'aria-label': 'Ordenar por' },
      [['engajamento', 'Engajamento'], ['alcance', 'Alcance'], ['conversas', 'Conversas']].map(([id, n]) =>
        T.h('button', { type: 'button', 'aria-pressed': String(criterio === id), onclick: (e) => { criterio = id; T.$$('button', abas).forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); pintar(); } }, n)
      )
    );
    pintar();
    return U.cartao({ id: 'ops-ranking', titulo: 'Conteúdos com melhor desempenho', sub: 'Top 6 do período', acao: abas, fontes: [{ nome: 'Métricas de publicações' }], janela: fl.janela }, lista, T.h('a', { class: 'link-seta', href: '#/conteudo' }, 'Análise de conteúdo completa', T.icone('seta')));
  }

  function calor(cj, fl) {
    const mapa = N.mapaAtividade(cj, fl);
    const corpo = T.h('div');
    if (mapa.total < 20) corpo.appendChild(U.indisponivel('Poucos eventos com horário no período para montar o mapa (mínimo de 20). Conversas do WhatsApp e da Kommo alimentam este gráfico.'));
    else {
      const melhores = N.melhoresHorarios(mapa, 3);
      O.calor(corpo, mapa, melhores);
      const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
      corpo.appendChild(T.h('p', { class: 'ops-sugestao' }, T.icone('alvo'), T.h('span', null, 'Horários promissores para publicar e reforçar o atendimento: ', melhores.map((m, i) => [i ? ', ' : '', T.h('b', null, `${DIAS[m.dow]} ${m.hora}h–${m.hora + 2}h`)]))));
    }
    const fontes = [...new Set((cj.atividade || []).map((a) => a.canal))].map((c) => ({ nome: N.canal(c).nome }));
    return U.cartao({ id: 'ops-calor', titulo: 'Horários de maior atividade', sub: 'Mensagens recebidas e interações com horário · horário de Brasília', fontes, janela: fl.janela }, corpo);
  }

  // ---------- linha 5 ----------
  function campanhas(cj, fl) {
    const hoje = fl.janela.ate;
    const lista = (cj.campanhas || []).filter((c) => fl.campanha === 'todas' || c.id === fl.campanha).map((c) => ({ c, p: N.progressoCampanha(c, cj, hoje) })).filter((x) => x.p.estado !== 'encerrada' || fl.campanha !== 'todas' ? true : false);
    const ativas = lista.filter((x) => x.p.estado === 'ativa' || fl.campanha !== 'todas');
    const corpo = T.h('div', { class: 'ops-campanhas-lista' });
    if (!ativas.length) corpo.appendChild(U.vazio('Nenhuma campanha ativa', 'Crie uma campanha para acompanhar fases, metas e resultados.', T.h('a', { class: 'botao-secundario', href: '#/plano' }, T.icone('mais'), 'Nova campanha')));
    for (const { c, p } of ativas) {
      const RITMO = { no_ritmo: ['firme', 'No ritmo da meta'], atencao: ['atencao', 'Atenção ao ritmo'], abaixo: ['agir', 'Abaixo da meta'] };
      const r = RITMO[p.ritmo];
      corpo.appendChild(
        T.h(
          'a',
          { class: 'ops-camp', href: `#/plano?alvo=camp-${c.id}` },
          T.h('div', { class: 'ops-camp-topo' }, T.h('b', null, c.nome), r ? T.h('span', { class: 'ops-estado', 'data-s': r[0] }, T.icone(r[0]), r[1]) : T.h('span', { class: 'ops-estado' }, p.estado)),
          T.h(
            'div',
            { class: 'ops-camp-barras' },
            T.h('div', { class: 'ops-progresso', title: 'Meta de leads' }, T.h('span', null, 'Leads'), T.h('i', { style: { '--w': `${Math.min(100, (p.fracMeta || 0) * 100)}%` } }), T.h('b', { class: 'tab' }, `${f.n(p.captados)} / ${f.n(c.metaLeads)}`)),
            T.h('div', { class: 'ops-progresso tempo', title: 'Prazo decorrido' }, T.h('span', null, 'Prazo'), T.h('i', { style: { '--w': `${p.fracTempo * 100}%` } }), T.h('b', { class: 'tab' }, `${p.decorrido} / ${p.duracao} d`))
          ),
          T.h('ol', { class: 'ops-fases-mini', 'aria-label': 'Fases' }, p.fases.map((fz) => T.h('li', { 'data-status': fz.atrasada && fz.status !== 'concluida' ? 'atrasada' : fz.status, title: `${fz.nome}: ${N.STATUS_FASE.find((s) => s.id === fz.status).nome}` }))),
          T.h('small', null, p.faseAtual ? `Fase atual: ${p.faseAtual.nome}` : 'Todas as fases concluídas', p.fasesAtrasadas ? ` · ${p.fasesAtrasadas} atrasada(s)` : '', ` · ${f.n(p.convertidos)} conversões`)
        )
      );
    }
    return U.cartao({ id: 'ops-campanhas', titulo: 'Campanhas ativas', sub: 'Fases, metas e resultados', acao: T.h('a', { class: 'link-seta', href: '#/plano' }, 'Todas', T.icone('seta')), fontes: [{ nome: 'Cadastro de campanhas' }, { nome: 'Leads' }], janela: fl.janela }, corpo);
  }

  function conversoes(cj, fl) {
    const leads = N.leadsDoFiltro(cj, fl).filter((l) => l.convertidoEm && N.dentro(l.convertidoEm, fl.janela));
    const dias = N.intervalo(fl.janela.de, fl.janela.ate);
    const corpo = T.h('div');
    if (!leads.length) corpo.appendChild(U.indisponivel('Nenhuma conversão registrada no período.'));
    else {
      const series = N.CANAIS.map((c) => {
        const porDia = new Map();
        leads.filter((l) => l.origem === c.id).forEach((l) => porDia.set(l.convertidoEm.slice(0, 10), (porDia.get(l.convertidoEm.slice(0, 10)) || 0) + 1));
        return { id: c.id, nome: c.nome, cor: c.cor, porDia };
      }).filter((s) => s.porDia.size);
      O.empilhadas(corpo, { dias, series });
      corpo.appendChild(O.tabela(['Canal', 'Conversões', 'Participação'], series.map((s) => { const n = [...s.porDia.values()].reduce((a, b) => a + b, 0); return [s.nome, f.n(n), f.pct((n / leads.length) * 100)]; })));
    }
    return U.cartao({ id: 'ops-conversoes', titulo: 'Evolução das conversões', sub: `Leads convertidos ${dias.length > 45 ? 'por semana' : 'por dia'}, empilhados pelo canal de origem`, fontes: [...new Set(leads.map((l) => l.fonte))].map((n) => ({ nome: n })), janela: fl.janela }, corpo);
  }

  // ---------- linha 6 ----------
  const TOM = { positivo: ['firme', 'Oportunidade'], alerta: ['agir', 'Atenção'], neutro: ['info', 'Leitura'] };
  function insightCartao(i) {
    const [icone, rotulo] = TOM[i.tom];
    return T.h(
      'article',
      { class: 'ops-insight', 'data-tom': i.tom },
      T.h('header', null, T.h('span', { class: 'ops-insight-tom' }, T.icone(icone === 'info' ? 'info' : icone), rotulo), T.h('small', null, i.periodo)),
      T.h('div', { class: 'ops-insight-bloco fato' }, T.h('span', null, 'Fato observado'), T.h('p', null, i.fato)),
      i.hipotese ? T.h('div', { class: 'ops-insight-bloco hipotese' }, T.h('span', null, 'Hipótese'), T.h('p', null, i.hipotese)) : null,
      T.h('div', { class: 'ops-insight-bloco recomendacao' }, T.h('span', null, 'Recomendação'), T.h('p', null, i.recomendacao)),
      i.numeros && i.numeros.length ? T.h('dl', { class: 'ops-insight-numeros' }, i.numeros.slice(0, 5).map((n) => T.h('div', null, T.h('dt', null, n.rotulo), T.h('dd', { class: 'tab' }, n.valor)))) : null,
      T.h('footer', null, T.h('span', null, T.icone('conector'), (i.fontes || []).join(', ')), i.acao ? T.h('a', { class: 'link-seta', href: `#/${i.acao.rota === 'painel' ? '' : i.acao.rota}${i.acao.alvo ? `?alvo=${i.acao.alvo}` : ''}` }, 'Ver dados', T.icone('seta')) : null)
    );
  }
  function insights(cj, fl) {
    const lista = N.insights(cj, fl);
    const corpo = T.h('div', { class: 'ops-insights' });
    if (!lista.length) corpo.appendChild(U.vazio('Ainda sem dados suficientes', 'Os insights só aparecem quando há volume para sustentá-los (por exemplo, 20 leads ou 100 interações por período).'));
    lista.forEach((i) => corpo.appendChild(insightCartao(i)));
    const ia = T.h('div', { class: 'ops-ia' });
    if (!O.ehDemo() && O.api.config && O.api.config.ia) {
      const botao = T.h('button', { class: 'botao-secundario', type: 'button' }, T.icone('raio'), 'Resumo executivo com IA');
      botao.addEventListener('click', async () => {
        botao.disabled = true;
        botao.textContent = 'Gerando resumo…';
        try {
          const r = await O.chamar('insights', { metodo: 'POST', corpo: { cliente: O.estado.cliente, de: fl.janela.de, ate: fl.janela.ate, plataforma: fl.plataforma, campanha: fl.campanha } });
          T.limpar(ia).appendChild(r.resumo ? T.h('div', { class: 'ops-ia-texto' }, T.h('span', { class: 'ops-selo-ia' }, T.icone('raio'), `Gerado por IA (${r.resumo.modelo}) a partir dos insights acima — confira os números nos cartões.`), r.resumo.texto.split('\n').filter(Boolean).map((p) => T.h('p', null, p))) : U.indisponivel('A IA não retornou um resumo agora.'));
        } catch (e) {
          T.limpar(ia).appendChild(U.indisponivel(e.message));
        }
      });
      ia.appendChild(botao);
    }
    return U.cartao({ id: 'ops-insights', titulo: 'Insights inteligentes', sub: 'Gerados a partir dos dados do período · separam fato, hipótese e recomendação', classe: 'largo', acao: ia, rodape: U.rodapeFonte(['Análise dos indicadores'], fl.janela, T.h('span', null, `${lista.length} insight(s)`)) }, corpo);
  }

  // ---------- integridade das fontes ----------
  function fontes(cj) {
    const ESTADO = { ativo: ['firme', 'Ativa'], atrasado: ['atencao', 'Atrasada'], erro: ['agir', 'Erro'], sem_permissao: ['agir', 'Sem permissão'], pendente: ['atencao', 'Pendente'], nao_configurado: ['nao-medido', 'Não configurada'] };
    return T.h(
      'div',
      { class: 'ops-conectores', role: 'list', 'aria-label': 'Integrações deste cliente' },
      cj.conectores.map((c) => {
        const [s, t] = ESTADO[c.estado] || ESTADO.nao_configurado;
        const el = T.h('span', { class: 'ops-conector', 'data-s': s, role: 'listitem', tabindex: 0 }, T.h('i', { style: { '--c': N.canal(c.canal).cor } }), N.canal(c.canal).nome, T.h('small', null, t));
        T.dica.ligar(el, () => T.dica.bloco([{ valor: t, rotulo: N.canal(c.canal).nome }, ...(c.ultimaSync ? [{ valor: U.dataHora(c.ultimaSync), rotulo: 'última sincronização' }] : []), ...(c.mensagem ? [{ valor: '', rotulo: c.mensagem }] : [])], 'Integração'));
        return el;
      })
    );
  }

  function montar(host, cj) {
    const fl = O.f();
    const ind = N.indicadores(cj, fl);
    const cli = O.clienteAtual();
    host.append(
      U.cabecalho({
        sobretitulo: [T.h('span', { class: 'pulso' }), `${cli ? cli.nome : cj.cliente.nome}${cj.cliente.segmento ? ` · ${cj.cliente.segmento}` : ''}`],
        titulo: 'OPS Intelligence — Visão Executiva',
        lead: [`${U.periodoTexto(fl.janela)}${O.estado.comparar ? ` comparado a ${U.periodoTexto(fl.janela.anterior)}` : ''}. `, fl.plataforma !== 'todas' ? `Plataforma: ${N.canal(fl.plataforma).nome}. ` : '', fl.campanha !== 'todas' ? `Campanha: ${(cj.campanhas.find((c) => c.id === fl.campanha) || {}).nome}. ` : ''],
        acoes: [fontes(cj), T.h('button', { class: 'botao-secundario', type: 'button', onclick: () => T.exportarRelatorio() }, T.icone('pdf'), 'Relatório PDF')],
      }),
      kpisPrincipais(ind, fl.janela),
      kpisSecundarios(ind),
      T.h('div', { class: 'ops-linha l-2-1' }, audiencia(cj, fl), origem(cj, fl)),
      T.h('div', { class: 'ops-linha l-1-1' }, funil(cj, fl), engajamento(cj, fl)),
      T.h('div', { class: 'ops-linha l-1-1' }, ranking(cj, fl), calor(cj, fl)),
      T.h('div', { class: 'ops-linha l-1-1' }, campanhas(cj, fl), conversoes(cj, fl)),
      insights(cj, fl)
    );
  }

  T.modulos.painel = {
    render(raiz) {
      U.pagina(raiz, montar);
    },
  };
})();
