/* OPS Intelligence · núcleo de cálculo.
   Funções puras, sem DOM e sem rede: recebem o conjunto normalizado (o mesmo formato que a API devolve
   e que o modo demonstração simula) e devolvem KPIs, séries, funil, rankings e insights.
   Roda no navegador (window.T.ops.nucleo) e no Node (require) — a API e os testes usam o mesmo código. */
(function (raiz, fabrica) {
  const N = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = N;
  else {
    raiz.T = raiz.T || {};
    raiz.T.ops = raiz.T.ops || {};
    raiz.T.ops.nucleo = N;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  // ---------- catálogo ----------
  // Ordem fixa dos canais: a cor segue o canal, nunca a posição no gráfico.
  // Paleta validada (scripts/validate_palette.js do skill de dataviz) contra a superfície #111116.
  const CANAIS = [
    { id: 'instagram', nome: 'Instagram', cor: '#d55181', curto: 'IG' },
    { id: 'facebook', nome: 'Facebook', cor: '#3d8fe0', curto: 'FB' },
    { id: 'kommo', nome: 'Kommo', cor: '#c98500', curto: 'KM' },
    { id: 'whatsapp', nome: 'WhatsApp', cor: '#14a3b8', curto: 'WA' },
    { id: 'outros', nome: 'Outras origens', cor: '#7c6cff', curto: 'OU' },
  ];
  const canal = (id) => CANAIS.find((c) => c.id === id) || CANAIS[CANAIS.length - 1];

  /** Métricas diárias que os conectores gravam. `canais` = quem pode fornecer; `agregar` = como somar no período. */
  const METRICAS = {
    visitas_perfil: { nome: 'Visitas aos perfis', canais: ['instagram', 'facebook'], agregar: 'soma', unidade: 'visitas' },
    alcance: { nome: 'Alcance', canais: ['instagram', 'facebook'], agregar: 'soma', unidade: 'contas', nota: 'Soma do alcance diário: a mesma conta pode ser contada em dias diferentes.' },
    visualizacoes: { nome: 'Visualizações', canais: ['instagram', 'facebook'], agregar: 'soma', unidade: 'visualizações' },
    novos_seguidores: { nome: 'Novos seguidores', canais: ['instagram', 'facebook'], agregar: 'soma', unidade: 'seguidores' },
    interacoes: { nome: 'Interações', canais: ['instagram', 'facebook'], agregar: 'soma', unidade: 'interações' },
    conversas_iniciadas: { nome: 'Conversas iniciadas', canais: ['whatsapp', 'kommo', 'instagram', 'facebook'], agregar: 'soma', unidade: 'conversas' },
    contatos_unicos: { nome: 'Contatos únicos', canais: ['whatsapp'], agregar: 'soma', unidade: 'contatos' },
    tempo_primeira_resposta: { nome: 'Tempo médio de 1ª resposta', canais: ['whatsapp', 'kommo'], agregar: 'media', unidade: 'min', menorMelhor: true },
  };

  /** Indicadores da Visão Executiva (o filtro "Indicador" escolhe um destes para o gráfico principal). */
  const INDICADORES = [
    { id: 'visitas_perfil', nome: 'Visitas aos perfis', fonte: 'diario' },
    { id: 'alcance', nome: 'Alcance', fonte: 'diario' },
    { id: 'visualizacoes', nome: 'Visualizações', fonte: 'diario' },
    { id: 'novos_seguidores', nome: 'Novos seguidores', fonte: 'diario' },
    { id: 'conversas_iniciadas', nome: 'Conversas iniciadas', fonte: 'diario' },
    { id: 'leads_novos', nome: 'Novos leads', fonte: 'leads' },
    { id: 'leads_convertidos', nome: 'Leads convertidos', fonte: 'leads' },
  ];

  const ETAPAS_PADRAO = [
    { id: 'novo', nome: 'Novo', ordem: 1 },
    { id: 'em_contato', nome: 'Em contato', ordem: 2 },
    { id: 'qualificado', nome: 'Qualificado', ordem: 3 },
    { id: 'negociacao', nome: 'Em negociação', ordem: 4 },
    { id: 'convertido', nome: 'Convertido', ordem: 5, final: 'ganho' },
    { id: 'perdido', nome: 'Perdido', ordem: 6, final: 'perdido' },
  ];
  const EM_ATENDIMENTO = new Set(['em_contato', 'qualificado', 'negociacao']);
  const QUALIFICADO_OU_ALEM = new Set(['qualificado', 'negociacao', 'convertido']);

  const FASES_CAMPANHA = [
    { id: 'planejamento', nome: 'Planejamento' },
    { id: 'preparacao', nome: 'Preparação' },
    { id: 'lancamento', nome: 'Lançamento' },
    { id: 'captacao', nome: 'Captação' },
    { id: 'qualificacao', nome: 'Qualificação' },
    { id: 'conversao', nome: 'Conversão' },
    { id: 'analise', nome: 'Análise de resultados' },
  ];
  const STATUS_FASE = [
    { id: 'pendente', nome: 'Não iniciada' },
    { id: 'andamento', nome: 'Em andamento' },
    { id: 'concluida', nome: 'Concluída' },
    { id: 'atrasada', nome: 'Atrasada' },
    { id: 'bloqueada', nome: 'Bloqueada' },
  ];
  const FORMATOS = { reel: 'Reels', video: 'Vídeos', imagem: 'Imagens', carrossel: 'Carrosséis', story: 'Stories', texto: 'Texto', link: 'Links' };

  // ---------- datas ----------
  const iso = (d) => d.toISOString().slice(0, 10);
  const somarDias = (dia, n) => {
    const d = new Date(`${dia}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return iso(d);
  };
  const diasEntre = (a, b) => Math.round((new Date(`${b}T12:00:00Z`) - new Date(`${a}T12:00:00Z`)) / 864e5);
  const intervalo = (de, ate) => {
    const out = [];
    for (let d = de; d <= ate; d = somarDias(d, 1)) out.push(d);
    return out;
  };
  /** "Hoje" no fuso de Brasília, como AAAA-MM-DD. */
  const hojeBrasil = (agora = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora);

  const PERIODOS = [
    { id: 'hoje', rotulo: 'Hoje', dias: 1 },
    { id: '7', rotulo: '7 dias', dias: 7 },
    { id: '30', rotulo: '30 dias', dias: 30 },
    { id: '90', rotulo: '90 dias', dias: 90 },
    { id: 'personalizado', rotulo: 'Personalizado', dias: null },
  ];

  /** Converte o filtro de período em janela atual + janela anterior do mesmo tamanho. */
  function janela(periodo, hoje, de, ate) {
    let fim = hoje;
    let ini;
    if (periodo === 'personalizado' && de && ate) {
      ini = de <= ate ? de : ate;
      fim = de <= ate ? ate : de;
    } else {
      const p = PERIODOS.find((x) => x.id === periodo) || PERIODOS[2];
      ini = somarDias(fim, -((p.dias || 30) - 1));
    }
    const n = diasEntre(ini, fim) + 1;
    return { de: ini, ate: fim, dias: n, anterior: { de: somarDias(ini, -n), ate: somarDias(ini, -1) } };
  }
  const dentro = (dia, j) => !!dia && dia.slice(0, 10) >= j.de && dia.slice(0, 10) <= j.ate;

  // ---------- disponibilidade ----------
  const canaisDoFiltro = (plataforma) => (plataforma && plataforma !== 'todas' ? [plataforma] : CANAIS.map((c) => c.id));

  /** Um canal só conta se a integração dele está ativa (ou se é simulação). */
  function canaisAtivos(conjunto, plataforma) {
    const est = new Map((conjunto.conectores || []).map((c) => [c.canal, c]));
    return canaisDoFiltro(plataforma).filter((id) => {
      const c = est.get(id);
      return c && (c.estado === 'ativo' || c.estado === 'atrasado' || !!c.planilha);
    });
  }

  /** Por que uma métrica não pode ser mostrada — ou null se pode. */
  function indisponivel(conjunto, metrica, plataforma) {
    const def = METRICAS[metrica];
    if (!def) return null;
    const pedidos = canaisDoFiltro(plataforma).filter((c) => def.canais.includes(c));
    if (!pedidos.length) return `${def.nome} não é uma métrica de ${canal(plataforma).nome}.`;
    const ativos = canaisAtivos(conjunto, plataforma).filter((c) => def.canais.includes(c));
    if (!ativos.length) return `Nenhuma integração ativa fornece ${def.nome.toLowerCase()} (${pedidos.map((c) => canal(c).nome).join(', ')}).`;
    const temDado = (conjunto.diario || []).some((p) => p.metrica === metrica && ativos.includes(p.canal));
    if (!temDado) return `As integrações ativas ainda não devolveram ${def.nome.toLowerCase()} — a API pode não oferecer essa métrica para esta conta.`;
    return null;
  }

  // ---------- séries diárias ----------
  /** Série diária de uma métrica, somando os canais pedidos. Dias sem nenhum dado ficam null (não zero). */
  function serie(conjunto, metrica, plataforma, j) {
    const def = METRICAS[metrica] || { agregar: 'soma' };
    const quer = new Set(canaisDoFiltro(plataforma));
    const porDia = new Map();
    for (const p of conjunto.diario || []) {
      if (p.metrica !== metrica || !quer.has(p.canal) || !dentro(p.d, j)) continue;
      const a = porDia.get(p.d) || { s: 0, n: 0 };
      a.s += p.v;
      a.n += 1;
      porDia.set(p.d, a);
    }
    return intervalo(j.de, j.ate).map((d) => {
      const a = porDia.get(d);
      return { d, v: a ? (def.agregar === 'media' ? a.s / a.n : a.s) : null };
    });
  }
  /** Série por canal (uma linha por canal), só canais com algum dado. */
  function seriesPorCanal(conjunto, metrica, plataforma, j) {
    return canaisDoFiltro(plataforma)
      .map((c) => ({ canal: c, pontos: serie(conjunto, metrica, c, j) }))
      .filter((s) => s.pontos.some((p) => p.v !== null));
  }
  function totalDe(pontos, agregar = 'soma') {
    const vs = pontos.map((p) => p.v).filter((v) => v !== null && v !== undefined);
    if (!vs.length) return null;
    const s = vs.reduce((a, b) => a + b, 0);
    return agregar === 'media' ? s / vs.length : s;
  }
  const variacao = (atual, anterior) => (atual === null || anterior === null || anterior === undefined || anterior === 0 ? null : ((atual - anterior) / Math.abs(anterior)) * 100);

  // ---------- leads ----------
  const leadsDoFiltro = (conjunto, f) =>
    (conjunto.leads || []).filter((l) => (!f.plataforma || f.plataforma === 'todas' || l.origem === f.plataforma) && (!f.campanha || f.campanha === 'todas' || l.campanhaId === f.campanha));

  function contarLeads(leads, j) {
    const novos = leads.filter((l) => dentro(l.entradaEm, j));
    const convertidos = leads.filter((l) => l.convertidoEm && dentro(l.convertidoEm, j));
    const atendimento = novos.filter((l) => EM_ATENDIMENTO.has(l.etapa));
    return { novos: novos.length, convertidos: convertidos.length, atendimento: atendimento.length, qualificados: novos.filter((l) => QUALIFICADO_OU_ALEM.has(l.etapa) || l.qualificadoEm).length };
  }
  function serieLeads(leads, campo, j) {
    const cont = new Map();
    for (const l of leads) {
      const d = l[campo] && l[campo].slice(0, 10);
      if (d && dentro(d, j)) cont.set(d, (cont.get(d) || 0) + 1);
    }
    return intervalo(j.de, j.ate).map((d) => ({ d, v: cont.get(d) || 0 }));
  }

  // ---------- KPIs ----------
  function kpi(id, nome, atual, anterior, historico, extra) {
    return { id, nome, atual, anterior, variacao: variacao(atual, anterior), historico, ...extra };
  }

  /** Todos os indicadores da seção 3.1, cada um com valor, variação, histórico, fonte e motivo de indisponibilidade. */
  function indicadores(conjunto, f) {
    const j = f.janela;
    const out = {};
    for (const [id, def] of Object.entries(METRICAS)) {
      const motivo = indisponivel(conjunto, id, f.plataforma);
      if (motivo) {
        out[id] = { id, nome: def.nome, indisponivel: motivo };
        continue;
      }
      const atualS = serie(conjunto, id, f.plataforma, j);
      const antS = serie(conjunto, id, f.plataforma, j.anterior);
      out[id] = kpi(id, def.nome, totalDe(atualS, def.agregar), totalDe(antS, def.agregar), atualS, {
        menorMelhor: !!def.menorMelhor,
        fontes: fontesDe(conjunto, def.canais, f.plataforma),
        nota: def.nota || null,
      });
    }
    const leads = leadsDoFiltro(conjunto, f);
    const temLeads = (conjunto.conectores || []).some((c) => c.fornece && c.fornece.includes('leads') && (c.estado === 'ativo' || c.estado === 'atrasado')) || (conjunto.leads || []).length > 0;
    const fontesLeads = [...new Set(leads.map((l) => l.fonte || 'cadastro'))];
    if (!temLeads) {
      ['leads_novos', 'leads_atendimento', 'leads_convertidos', 'taxa_conversao'].forEach((id) => (out[id] = { id, nome: id, indisponivel: 'Nenhuma fonte de leads conectada (Kommo, WhatsApp ou cadastro manual).' }));
    } else {
      const a = contarLeads(leads, j);
      const b = contarLeads(leads, j.anterior);
      out.leads_novos = kpi('leads_novos', 'Novos leads', a.novos, b.novos, serieLeads(leads, 'entradaEm', j), { fontes: fontesLeads });
      out.leads_atendimento = kpi('leads_atendimento', 'Leads em atendimento', a.atendimento, b.atendimento, null, { fontes: fontesLeads, nota: 'Leads que entraram no período e estão em contato, qualificados ou em negociação.' });
      out.leads_convertidos = kpi('leads_convertidos', 'Leads convertidos', a.convertidos, b.convertidos, serieLeads(leads, 'convertidoEm', j), { fontes: fontesLeads });
      const tx = a.novos ? (a.convertidos / a.novos) * 100 : null;
      const txAnt = b.novos ? (b.convertidos / b.novos) * 100 : null;
      out.taxa_conversao = kpi('taxa_conversao', 'Taxa de conversão', tx, txAnt, null, { unidade: '%', pontos: true, fontes: fontesLeads, nota: 'Convertidos no período ÷ leads que entraram no período.' });
    }
    // taxa de engajamento = interações ÷ alcance
    if (out.interacoes && !out.interacoes.indisponivel && out.alcance && !out.alcance.indisponivel && out.alcance.atual) {
      const tx = (out.interacoes.atual / out.alcance.atual) * 100;
      const txAnt = out.alcance.anterior ? (out.interacoes.anterior / out.alcance.anterior) * 100 : null;
      out.taxa_engajamento = kpi('taxa_engajamento', 'Taxa de engajamento', tx, txAnt, null, { unidade: '%', pontos: true, fontes: out.alcance.fontes, nota: 'Interações ÷ alcance, somados no período.' });
    } else out.taxa_engajamento = { id: 'taxa_engajamento', nome: 'Taxa de engajamento', indisponivel: 'Precisa de interações e alcance de Instagram ou Facebook.' };
    // crescimento de audiência = novos seguidores vs anterior
    out.crescimento = out.novos_seguidores && !out.novos_seguidores.indisponivel ? { ...out.novos_seguidores, id: 'crescimento', nome: 'Crescimento da audiência' } : { id: 'crescimento', nome: 'Crescimento da audiência', indisponivel: 'Sem dados de seguidores.' };
    out.campanhas_ativas = campanhasResumo(conjunto, f);
    return out;
  }

  function fontesDe(conjunto, canaisMetrica, plataforma) {
    const ativos = canaisAtivos(conjunto, plataforma).filter((c) => canaisMetrica.includes(c));
    return ativos.map((c) => {
      const con = (conjunto.conectores || []).find((x) => x.canal === c) || {};
      return { canal: c, nome: con.planilha ? `${canal(c).nome} (planilha)` : canal(c).nome, ultimaSync: con.ultimaSync || null };
    });
  }

  // ---------- origem dos leads ----------
  function origemLeads(conjunto, f) {
    const leads = leadsDoFiltro(conjunto, { ...f, plataforma: 'todas' }).filter((l) => dentro(l.entradaEm, f.janela));
    const conv = leadsDoFiltro(conjunto, { ...f, plataforma: 'todas' }).filter((l) => l.convertidoEm && dentro(l.convertidoEm, f.janela));
    const total = leads.length;
    return CANAIS.map((c) => {
      const n = leads.filter((l) => (CANAIS.some((x) => x.id === l.origem) ? l.origem : 'outros') === c.id).length;
      const nc = conv.filter((l) => (CANAIS.some((x) => x.id === l.origem) ? l.origem : 'outros') === c.id).length;
      return { canal: c.id, nome: c.nome, cor: c.cor, leads: n, pct: total ? (n / total) * 100 : 0, convertidos: nc, taxaConversao: n ? (nc / n) * 100 : null };
    }).filter((x) => x.leads > 0 || x.convertidos > 0);
  }

  // ---------- funil ----------
  function funil(conjunto, f) {
    const ind = indicadores(conjunto, f);
    const valor = (k) => (ind[k] && !ind[k].indisponivel ? ind[k].atual : null);
    const leads = leadsDoFiltro(conjunto, f);
    const c = contarLeads(leads, f.janela);
    const temLeads = !(ind.leads_novos && ind.leads_novos.indisponivel);
    const etapas = [
      { id: 'visitantes', nome: 'Visitantes', v: valor('alcance'), estimado: true, fonte: 'Contas alcançadas nas redes (soma diária, agregado — não identifica pessoas)' },
      { id: 'interacoes', nome: 'Interações', v: valor('interacoes'), estimado: true, fonte: 'Curtidas, comentários, compartilhamentos e salvamentos' },
      { id: 'conversas', nome: 'Conversas', v: valor('conversas_iniciadas'), estimado: true, fonte: 'Conversas iniciadas (WhatsApp, Kommo e mensagens)' },
      { id: 'qualificados', nome: 'Leads qualificados', v: temLeads ? c.qualificados : null, estimado: false, fonte: 'Leads do período que chegaram a Qualificado ou além' },
      { id: 'conversoes', nome: 'Conversões', v: temLeads ? c.convertidos : null, estimado: false, fonte: 'Leads convertidos no período' },
    ];
    let maiorAbandono = null;
    etapas.forEach((e, i) => {
      const prox = etapas[i + 1];
      if (!prox) return;
      if (e.v && prox.v !== null && e.v > 0) {
        e.passagem = Math.min(100, (prox.v / e.v) * 100);
        e.abandono = 100 - e.passagem;
        if (!maiorAbandono || e.abandono > maiorAbandono.abandono) maiorAbandono = { de: e.id, para: prox.id, abandono: e.abandono };
      }
    });
    return { etapas, maiorAbandono, temEstimativa: etapas.some((e) => e.estimado && e.v !== null) };
  }

  // ---------- conteúdos ----------
  const interacoesDe = (m) => (m.curtidas || 0) + (m.comentarios || 0) + (m.compartilhamentos || 0) + (m.salvamentos || 0);
  const taxaConteudo = (c) => {
    const base = c.metricas.alcance || c.metricas.visualizacoes;
    return base ? (interacoesDe(c.metricas) / base) * 100 : null;
  };
  const conteudosDoFiltro = (conjunto, f, j = f.janela) =>
    (conjunto.conteudos || []).filter((c) => dentro(c.publicadoEm, j) && (!f.plataforma || f.plataforma === 'todas' || c.canal === f.plataforma) && (!f.campanha || f.campanha === 'todas' || c.campanhaId === f.campanha));

  function rankingConteudos(conjunto, f, criterio = 'engajamento', n = 10) {
    const chave = {
      engajamento: (c) => taxaConteudo(c) ?? -1,
      interacoes: (c) => interacoesDe(c.metricas),
      alcance: (c) => c.metricas.alcance || 0,
      conversas: (c) => c.conversas || 0,
      leads: (c) => c.leads || 0,
    }[criterio];
    return conteudosDoFiltro(conjunto, f)
      .map((c) => ({ ...c, interacoes: interacoesDe(c.metricas), taxa: taxaConteudo(c) }))
      .sort((a, b) => chave(b) - chave(a))
      .slice(0, n);
  }

  function engajamentoPorCanal(conjunto, f) {
    const conts = conteudosDoFiltro(conjunto, { ...f, plataforma: 'todas' });
    const campos = ['curtidas', 'comentarios', 'compartilhamentos', 'salvamentos', 'visualizacoes'];
    return CANAIS.filter((c) => conts.some((x) => x.canal === c.id) && (!f.plataforma || f.plataforma === 'todas' || f.plataforma === c.id)).map((c) => {
      const lista = conts.filter((x) => x.canal === c.id);
      const tot = Object.fromEntries(campos.map((k) => [k, lista.reduce((s, x) => s + (x.metricas[k] || 0), 0)]));
      const alc = lista.reduce((s, x) => s + (x.metricas.alcance || 0), 0);
      return { canal: c.id, nome: c.nome, cor: c.cor, conteudos: lista.length, ...tot, alcance: alc, taxa: alc ? ((tot.curtidas + tot.comentarios + tot.compartilhamentos + tot.salvamentos) / alc) * 100 : null };
    });
  }

  function porFormato(conjunto, f) {
    const conts = conteudosDoFiltro(conjunto, f);
    const grupos = new Map();
    for (const c of conts) {
      const g = grupos.get(c.formato) || [];
      g.push(c);
      grupos.set(c.formato, g);
    }
    return [...grupos.entries()]
      .map(([formato, lista]) => {
        const taxas = lista.map(taxaConteudo).filter((x) => x !== null);
        return { formato, nome: FORMATOS[formato] || formato, n: lista.length, taxaMedia: taxas.length ? taxas.reduce((a, b) => a + b, 0) / taxas.length : null, alcanceMedio: lista.reduce((s, x) => s + (x.metricas.alcance || 0), 0) / lista.length, conversas: lista.reduce((s, x) => s + (x.conversas || 0), 0), leads: lista.reduce((s, x) => s + (x.leads || 0), 0) };
      })
      .sort((a, b) => (b.taxaMedia ?? -1) - (a.taxaMedia ?? -1));
  }

  function porTema(conjunto, f) {
    const conts = conteudosDoFiltro(conjunto, f).filter((c) => c.tema);
    const grupos = new Map();
    for (const c of conts) grupos.set(c.tema, [...(grupos.get(c.tema) || []), c]);
    return [...grupos.entries()]
      .map(([tema, lista]) => ({ tema, n: lista.length, alcance: lista.reduce((s, x) => s + (x.metricas.alcance || 0), 0), alcanceMedio: lista.reduce((s, x) => s + (x.metricas.alcance || 0), 0) / lista.length, conversas: lista.reduce((s, x) => s + (x.conversas || 0), 0), leads: lista.reduce((s, x) => s + (x.leads || 0), 0) }))
      .sort((a, b) => b.alcanceMedio - a.alcanceMedio);
  }

  // ---------- atividade (mapa de calor) ----------
  /** Matriz 7×24 (dia da semana × hora, horário de Brasília) somando os eventos do período. */
  function mapaAtividade(conjunto, f) {
    const m = Array.from({ length: 7 }, () => Array(24).fill(0));
    let total = 0;
    for (const a of conjunto.atividade || []) {
      if (!dentro(a.d, f.janela)) continue;
      if (f.plataforma && f.plataforma !== 'todas' && a.canal !== f.plataforma) continue;
      m[a.dow][a.hora] += a.v;
      total += a.v;
    }
    return { m, total };
  }
  /** Melhores janelas de 2 horas (contíguas no mesmo dia) por volume. */
  function melhoresHorarios(mapa, n = 3) {
    const cand = [];
    for (let d = 0; d < 7; d++) for (let h = 0; h < 23; h++) cand.push({ dow: d, hora: h, v: mapa.m[d][h] + mapa.m[d][h + 1] });
    const out = [];
    for (const c of cand.sort((a, b) => b.v - a.v)) {
      if (out.some((o) => o.dow === c.dow && Math.abs(o.hora - c.hora) < 2)) continue;
      out.push(c);
      if (out.length === n) break;
    }
    return out;
  }

  // ---------- campanhas ----------
  function progressoCampanha(camp, conjunto, hoje) {
    const leads = (conjunto.leads || []).filter((l) => l.campanhaId === camp.id);
    const captados = leads.length;
    const convertidos = leads.filter((l) => l.convertidoEm).length;
    const duracao = Math.max(1, diasEntre(camp.inicio, camp.fim) + 1);
    const decorrido = hoje < camp.inicio ? 0 : hoje > camp.fim ? duracao : diasEntre(camp.inicio, hoje) + 1;
    const fracTempo = decorrido / duracao;
    const fracMeta = camp.metaLeads ? captados / camp.metaLeads : null;
    const fases = (camp.fases || []).map((fz) => ({ ...fz, atrasada: fz.status !== 'concluida' && fz.fim && fz.fim < hoje }));
    const estado = hoje < camp.inicio ? 'agendada' : hoje > camp.fim ? 'encerrada' : 'ativa';
    let ritmo = null;
    if (fracMeta !== null && estado !== 'agendada' && fracTempo > 0.1) ritmo = fracMeta >= fracTempo * 0.95 ? 'no_ritmo' : fracMeta >= fracTempo * 0.7 ? 'atencao' : 'abaixo';
    return { estado, captados, convertidos, taxaConversao: captados ? (convertidos / captados) * 100 : null, fracTempo, fracMeta, ritmo, decorrido, duracao, fases, faseAtual: fases.find((fz) => fz.status === 'andamento') || fases.find((fz) => fz.status !== 'concluida') || null, fasesAtrasadas: fases.filter((fz) => fz.atrasada).length };
  }
  function campanhasResumo(conjunto, f) {
    const hoje = f.janela.ate;
    const camps = (conjunto.campanhas || []).filter((c) => !f.campanha || f.campanha === 'todas' || c.id === f.campanha);
    const ativas = camps.map((c) => ({ c, p: progressoCampanha(c, conjunto, hoje) })).filter((x) => x.p.estado === 'ativa');
    if (!camps.length) return { id: 'campanhas_ativas', nome: 'Campanhas ativas', indisponivel: 'Nenhuma campanha cadastrada para este cliente.' };
    const noRitmo = ativas.filter((x) => x.p.ritmo === 'no_ritmo').length;
    return { id: 'campanhas_ativas', nome: 'Campanhas ativas', atual: ativas.length, anterior: null, variacao: null, noRitmo, abaixo: ativas.filter((x) => x.p.ritmo === 'abaixo').length, fontes: [{ canal: 'cadastro', nome: 'Cadastro de campanhas' }] };
  }

  /** O que as campanhas anteriores ensinam (seção 6, inteligência de campanhas). */
  function historicoCampanhas(conjunto, hoje) {
    const encerradas = (conjunto.campanhas || []).filter((c) => c.fim < hoje);
    const linhas = encerradas.map((c) => {
      const p = progressoCampanha(c, conjunto, hoje);
      const leads = (conjunto.leads || []).filter((l) => l.campanhaId === c.id);
      const porCanal = {};
      leads.forEach((l) => (porCanal[l.origem] = (porCanal[l.origem] || 0) + 1));
      const melhorCanal = Object.entries(porCanal).sort((a, b) => b[1] - a[1])[0];
      return { id: c.id, nome: c.nome, meta: c.metaLeads, captados: p.captados, convertidos: p.convertidos, atingimento: c.metaLeads ? (p.captados / c.metaLeads) * 100 : null, taxaConversao: p.taxaConversao, melhorCanal: melhorCanal ? melhorCanal[0] : null, orcamento: c.orcamento || null, custoPorLead: c.orcamento && p.captados ? c.orcamento / p.captados : null };
    });
    const totLeads = linhas.reduce((s, l) => s + l.captados, 0);
    const totConv = linhas.reduce((s, l) => s + l.convertidos, 0);
    return { linhas, taxaMedia: totLeads ? (totConv / totLeads) * 100 : null, n: linhas.length };
  }

  // ---------- insights ----------
  const fmtPct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`;
  const fmtN = (v) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);
  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const faixaHora = (h) => `${String(h).padStart(2, '0')}h–${String(h + 2).padStart(2, '0')}h`;

  /**
   * Insights só nascem com dados suficientes. Cada um separa:
   *  fato (o que os números mostram), hipótese (leitura possível, não comprovada) e recomendação (o que fazer).
   * Sempre com números, período e fonte.
   */
  function insights(conjunto, f) {
    const j = f.janela;
    const per = `${j.de.split('-').reverse().slice(0, 2).join('/')} a ${j.ate.split('-').reverse().slice(0, 2).join('/')}`;
    const perAnt = `${j.anterior.de.split('-').reverse().slice(0, 2).join('/')} a ${j.anterior.ate.split('-').reverse().slice(0, 2).join('/')}`;
    const out = [];
    const ind = indicadores(conjunto, f);

    // 1. engajamento por plataforma vs período anterior
    for (const c of ['instagram', 'facebook']) {
      if (f.plataforma && f.plataforma !== 'todas' && f.plataforma !== c) continue;
      const fc = { ...f, plataforma: c };
      if (indisponivel(conjunto, 'interacoes', c) || indisponivel(conjunto, 'alcance', c)) continue;
      const ia = totalDe(serie(conjunto, 'interacoes', c, j));
      const ib = totalDe(serie(conjunto, 'interacoes', c, j.anterior));
      const aa = totalDe(serie(conjunto, 'alcance', c, j));
      const ab = totalDe(serie(conjunto, 'alcance', c, j.anterior));
      if (!ia || !ib || !aa || !ab || ia < 100 || ib < 100) continue;
      const ta = (ia / aa) * 100;
      const tb = (ib / ab) * 100;
      const v = variacao(ta, tb);
      if (Math.abs(v) < 10) continue;
      out.push({
        id: `eng-${c}`,
        tom: v > 0 ? 'positivo' : 'alerta',
        canal: c,
        fato: `A taxa de engajamento do ${canal(c).nome} ${v > 0 ? 'subiu' : 'caiu'} de ${fmtN(tb)}% para ${fmtN(ta)}% (${fmtPct(v)}) em relação ao período anterior.`,
        hipotese: v > 0 ? 'Os conteúdos do período podem estar mais alinhados ao interesse da audiência — confira o ranking de conteúdos.' : 'Pode haver queda de relevância dos formatos usados ou menos publicações com chamada para interação.',
        recomendacao: v > 0 ? 'Repita os formatos e temas que lideram o ranking deste período.' : 'Compare os 3 conteúdos de maior e menor engajamento e ajuste o próximo calendário.',
        numeros: [{ rotulo: 'Interações', valor: `${fmtN(ib)} → ${fmtN(ia)}` }, { rotulo: 'Alcance', valor: `${fmtN(ab)} → ${fmtN(aa)}` }],
        fontes: [`${canal(c).nome} Insights`],
        periodo: `${per} vs ${perAnt}`,
        acao: { rota: 'conteudo' },
      });
      void fc;
    }

    // 2. captação de leads subiu/caiu
    const ln = ind.leads_novos;
    if (ln && !ln.indisponivel && ln.anterior !== null && Math.max(ln.atual, ln.anterior) >= 20 && ln.variacao !== null && Math.abs(ln.variacao) >= 15) {
      const leads = leadsDoFiltro(conjunto, { ...f, plataforma: 'todas' });
      const porCanal = CANAIS.map((c) => ({ c: c.id, a: leads.filter((l) => l.origem === c.id && dentro(l.entradaEm, j)).length, b: leads.filter((l) => l.origem === c.id && dentro(l.entradaEm, j.anterior)).length })).map((x) => ({ ...x, delta: x.a - x.b }));
      const pior = porCanal.slice().sort((a, b) => a.delta - b.delta)[0];
      const melhor = porCanal.slice().sort((a, b) => b.delta - a.delta)[0];
      const caiu = ln.variacao < 0;
      out.push({
        id: 'leads-tendencia',
        tom: caiu ? 'alerta' : 'positivo',
        fato: `A captação de leads ${caiu ? 'caiu' : 'subiu'} ${fmtPct(ln.variacao)}: ${fmtN(ln.atual)} novos leads contra ${fmtN(ln.anterior)} no período anterior.`,
        hipotese: caiu && pior && pior.delta < 0 ? `A maior redução veio de ${canal(pior.c).nome} (${pior.b} → ${pior.a}).` : !caiu && melhor && melhor.delta > 0 ? `O maior ganho veio de ${canal(melhor.c).nome} (${melhor.b} → ${melhor.a}).` : null,
        recomendacao: caiu ? `Vale investigar ${pior ? canal(pior.c).nome : 'os canais com maior redução'}: publicações, campanhas ativas e tempo de resposta.` : 'Identifique o que mudou no canal que mais cresceu e replique nos demais.',
        numeros: porCanal.filter((x) => x.a || x.b).map((x) => ({ rotulo: canal(x.c).nome, valor: `${x.b} → ${x.a}` })),
        fontes: ln.fontes && ln.fontes.length ? ln.fontes : ['Leads'],
        periodo: `${per} vs ${perAnt}`,
        acao: { rota: 'passageiros' },
      });
    }

    // 3. canal que concentra as conversas
    if (!indisponivel(conjunto, 'conversas_iniciadas', 'todas')) {
      const porCanal = CANAIS.map((c) => ({ c: c.id, v: totalDe(serie(conjunto, 'conversas_iniciadas', c.id, j)) || 0 }));
      const total = porCanal.reduce((s, x) => s + x.v, 0);
      const top = porCanal.slice().sort((a, b) => b.v - a.v)[0];
      if (total >= 30 && top.v / total >= 0.5) {
        out.push({
          id: 'conversas-concentracao',
          tom: 'neutro',
          canal: top.c,
          fato: `O ${canal(top.c).nome} concentra ${fmtN((top.v / total) * 100)}% das novas conversas (${fmtN(top.v)} de ${fmtN(total)}).`,
          hipotese: null,
          recomendacao: `Garanta cobertura de atendimento no ${canal(top.c).nome} nos horários de pico (veja o mapa de calor).`,
          numeros: porCanal.filter((x) => x.v).map((x) => ({ rotulo: canal(x.c).nome, valor: fmtN(x.v) })),
          fontes: porCanal.filter((x) => x.v).map((x) => canal(x.c).nome),
          periodo: per,
          acao: { rota: 'painel', alvo: 'ops-calor' },
        });
      }
    }

    // 4. campanhas abaixo da meta (proporcional ao tempo decorrido)
    for (const camp of conjunto.campanhas || []) {
      if (f.campanha && f.campanha !== 'todas' && f.campanha !== camp.id) continue;
      const p = progressoCampanha(camp, conjunto, j.ate);
      if (p.estado !== 'ativa' || p.ritmo !== 'abaixo' || !camp.metaLeads) continue;
      const esperado = Math.round(camp.metaLeads * p.fracTempo);
      out.push({
        id: `camp-${camp.id}`,
        tom: 'alerta',
        fato: `A campanha "${camp.nome}" captou ${p.captados} de ${camp.metaLeads} leads com ${fmtN(p.fracTempo * 100)}% do prazo decorrido — o esperado até aqui seria cerca de ${esperado}.`,
        hipotese: p.fasesAtrasadas ? `${p.fasesAtrasadas} fase(s) da campanha estão atrasadas.` : null,
        recomendacao: 'Reveja canais e conteúdos da campanha ou ajuste a meta com o cliente.',
        numeros: [{ rotulo: 'Captados', valor: String(p.captados) }, { rotulo: 'Meta', valor: String(camp.metaLeads) }, { rotulo: 'Prazo decorrido', valor: `${p.decorrido} de ${p.duracao} dias` }],
        fontes: ['Cadastro de campanhas', 'Leads'],
        periodo: `${camp.inicio.split('-').reverse().join('/')} a ${camp.fim.split('-').reverse().join('/')}`,
        acao: { rota: 'plano', alvo: `camp-${camp.id}` },
      });
    }

    // 5. formato com resultado acima da média
    const formatos = porFormato(conjunto, f).filter((x) => x.taxaMedia !== null && x.n >= 3);
    const nConts = conteudosDoFiltro(conjunto, f).length;
    if (formatos.length >= 2 && nConts >= 8) {
      const media = formatos.reduce((s, x) => s + x.taxaMedia * x.n, 0) / formatos.reduce((s, x) => s + x.n, 0);
      const top = formatos[0];
      const dif = variacao(top.taxaMedia, media);
      if (dif !== null && dif >= 20) {
        out.push({
          id: 'formato-destaque',
          tom: 'positivo',
          fato: `${top.nome} tiveram taxa de engajamento média de ${fmtN(top.taxaMedia)}%, ${fmtPct(dif)} acima da média dos formatos (${fmtN(media)}%), em ${top.n} publicações.`,
          hipotese: 'O formato pode favorecer a distribuição na plataforma, mas tema e horário também influenciam — a amostra é pequena.',
          recomendacao: `Teste aumentar a proporção de ${top.nome.toLowerCase()} no próximo período e acompanhe se a diferença se mantém.`,
          numeros: formatos.map((x) => ({ rotulo: x.nome, valor: `${fmtN(x.taxaMedia)}% · ${x.n} posts` })),
          fontes: ['Métricas de publicações'],
          periodo: per,
          acao: { rota: 'conteudo' },
        });
      }
    }

    // 6. tema que gera conversas
    const temas = porTema(conjunto, f).filter((t) => t.n >= 2);
    const totalConv = temas.reduce((s, t) => s + t.conversas, 0);
    if (temas.length >= 2 && totalConv >= 15) {
      const top = temas.slice().sort((a, b) => b.conversas / b.n - a.conversas / a.n)[0];
      out.push({
        id: 'tema-conversas',
        tom: 'positivo',
        fato: `Publicações sobre "${top.tema}" geraram ${fmtN(top.conversas)} conversas rastreadas em ${top.n} posts (${fmtN(top.conversas / top.n)} por post).`,
        hipotese: 'Só contam conversas com origem rastreável (link, referência de anúncio ou palavra-chave); o efeito real pode ser maior.',
        recomendacao: `Inclua o tema "${top.tema}" no planejamento da próxima campanha.`,
        numeros: temas.slice(0, 4).map((t) => ({ rotulo: t.tema, valor: `${t.conversas} conversas · ${t.n} posts` })),
        fontes: ['Métricas de publicações', 'Conversas rastreadas'],
        periodo: per,
        acao: { rota: 'conteudo' },
      });
    }

    // 7. horários
    const mapa = mapaAtividade(conjunto, f);
    if (mapa.total >= 50) {
      const top = melhoresHorarios(mapa, 2);
      const media = mapa.total / (7 * 12);
      out.push({
        id: 'horarios',
        tom: 'neutro',
        fato: `O maior volume de interações e conversas aconteceu ${top.map((t) => `${DIAS[t.dow]} ${faixaHora(t.hora)} (${fmtN(t.v)})`).join(' e ')}.`,
        hipotese: `Nessas faixas o volume é ${fmtN(top[0].v / media)}× a média de uma janela de 2 horas.`,
        recomendacao: 'Concentre publicações e escala de atendimento nessas faixas; evite publicar sem cobertura de resposta.',
        numeros: top.map((t) => ({ rotulo: `${DIAS[t.dow]} ${faixaHora(t.hora)}`, valor: fmtN(t.v) })),
        fontes: ['Conversas e interações com horário'],
        periodo: per,
        acao: { rota: 'painel', alvo: 'ops-calor' },
      });
    }

    // 8. tempo de primeira resposta
    const tr = ind.tempo_primeira_resposta;
    if (tr && !tr.indisponivel && tr.atual !== null && tr.atual > 30) {
      out.push({
        id: 'tempo-resposta',
        tom: 'alerta',
        fato: `O tempo médio de primeira resposta foi de ${fmtN(tr.atual)} min${tr.variacao !== null ? ` (${fmtPct(tr.variacao)} vs anterior)` : ''}.`,
        hipotese: 'Respostas lentas costumam reduzir a passagem de conversa para lead qualificado.',
        recomendacao: 'Defina uma meta de resposta (ex.: 15 min no horário comercial) e use mensagens de boas-vindas automáticas.',
        numeros: [{ rotulo: 'Tempo médio', valor: `${fmtN(tr.atual)} min` }],
        fontes: (tr.fontes || []).map((x) => x.nome),
        periodo: per,
        acao: { rota: 'central' },
      });
    }
    return out;
  }

  // ---------- comparação entre clientes ----------
  /** Indicadores normalizados (por tamanho) para comparar clientes de portes diferentes. */
  function comparativo(conjunto, f) {
    const ind = indicadores(conjunto, f);
    const v = (k) => (ind[k] && !ind[k].indisponivel ? ind[k] : null);
    const alc = v('alcance');
    const leads = v('leads_novos');
    const seg = v('novos_seguidores');
    const camps = (conjunto.campanhas || []).map((c) => progressoCampanha(c, conjunto, f.janela.ate)).filter((p) => p.estado === 'ativa' && p.fracMeta !== null);
    return {
      leads: leads ? leads.atual : null,
      crescimentoLeads: leads ? leads.variacao : null,
      leadsPorMilAlcance: leads && alc && alc.atual ? (leads.atual / alc.atual) * 1000 : null,
      taxaEngajamento: v('taxa_engajamento') ? v('taxa_engajamento').atual : null,
      taxaConversao: v('taxa_conversao') ? v('taxa_conversao').atual : null,
      seguidoresNovos: seg ? seg.atual : null,
      crescimentoAudiencia: seg ? seg.variacao : null,
      metaCampanhas: camps.length ? (camps.reduce((s, p) => s + Math.min(1.5, p.fracMeta / Math.max(0.05, p.fracTempo)), 0) / camps.length) * 100 : null,
    };
  }

  return {
    CANAIS,
    canal,
    METRICAS,
    INDICADORES,
    ETAPAS_PADRAO,
    FASES_CAMPANHA,
    STATUS_FASE,
    FORMATOS,
    PERIODOS,
    somarDias,
    diasEntre,
    intervalo,
    hojeBrasil,
    janela,
    dentro,
    canaisDoFiltro,
    canaisAtivos,
    indisponivel,
    serie,
    seriesPorCanal,
    totalDe,
    variacao,
    leadsDoFiltro,
    contarLeads,
    serieLeads,
    indicadores,
    origemLeads,
    funil,
    interacoesDe,
    taxaConteudo,
    conteudosDoFiltro,
    rankingConteudos,
    engajamentoPorCanal,
    porFormato,
    porTema,
    mapaAtividade,
    melhoresHorarios,
    progressoCampanha,
    historicoCampanhas,
    insights,
    comparativo,
  };
});
