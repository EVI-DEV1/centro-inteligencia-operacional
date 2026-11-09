/* OPS Intelligence · fonte de dados, sessão e filtros globais.
   Uma porta só para as telas: T.ops.carregar() devolve o conjunto do cliente selecionado,
   venha ele da API (modo real) ou da simulação (modo demonstração). As telas nunca sabem a diferença,
   a não ser pelo selo — e o selo "Simulação" aparece sempre que a fonte for a demonstração. */
(function () {
  'use strict';
  const T = window.T;
  const O = (T.ops = T.ops || {});
  const N = O.nucleo;
  const D = O.demo;

  const ler = (k, padrao) => {
    try {
      const v = localStorage.getItem(`ops:${k}`);
      return v === null ? padrao : JSON.parse(v);
    } catch (e) {
      return padrao;
    }
  };
  const gravar = (k, v) => {
    try {
      localStorage.setItem(`ops:${k}`, JSON.stringify(v));
    } catch (e) {}
  };

  // ---------- estado dos filtros ----------
  const salvo = ler('filtros', {});
  O.estado = {
    modo: salvo.modo === 'real' ? 'real' : 'demonstracao',
    cliente: salvo.cliente || D.CLIENTES[0].id,
    plataforma: salvo.plataforma || 'todas',
    periodo: N.PERIODOS.some((p) => p.id === salvo.periodo) ? salvo.periodo : '30',
    de: salvo.de || null,
    ate: salvo.ate || null,
    campanha: 'todas',
    indicador: salvo.indicador || 'visitas_perfil',
    comparar: salvo.comparar !== false,
  };
  const persistir = () => {
    const e = O.estado;
    gravar('filtros', { modo: e.modo, cliente: e.cliente, plataforma: e.plataforma, periodo: e.periodo, de: e.de, ate: e.ate, indicador: e.indicador, comparar: e.comparar });
  };

  O.hoje = () => N.hojeBrasil();
  /** Filtro pronto para o núcleo. */
  O.f = () => ({ plataforma: O.estado.plataforma, campanha: O.estado.campanha, janela: N.janela(O.estado.periodo, O.hoje(), O.estado.de, O.estado.ate) });

  O.definir = (mudancas) => {
    const antes = { ...O.estado };
    Object.assign(O.estado, mudancas);
    if ('cliente' in mudancas && mudancas.cliente !== antes.cliente) O.estado.campanha = 'todas';
    persistir();
    sincronizarFiltroAntigo();
    T.emit('ops:filtro', { antes, depois: { ...O.estado } });
  };

  /** Os gráficos antigos (relatório do programa) usam T.filtro: mantém os dois no mesmo período. */
  function sincronizarFiltroAntigo() {
    if (!T.filtro) return;
    const mapa = { hoje: '7', 7: '7', 30: '30', 90: 'tudo', personalizado: 'tudo' };
    const alvo = mapa[O.estado.periodo] || 'tudo';
    if (T.filtro.periodo !== alvo) {
      T.filtro.periodo = alvo;
      document.documentElement.dataset.periodo = alvo;
    }
    T.filtro.comparar = O.estado.comparar;
  }
  sincronizarFiltroAntigo();

  // ---------- API e sessão (modo real) ----------
  const API = (window.OPS_API_BASE || '/api').replace(/\/$/, '');
  O.api = { base: API, disponivel: null, config: null };
  O.sessao = ler('sessao', null);

  O.verificarApi = async () => {
    if (location.protocol === 'file:') {
      O.api.disponivel = false;
      O.api.motivo = 'Aberto como arquivo local: a API só funciona com o projeto publicado (Vercel).';
      return O.api;
    }
    try {
      const r = await fetch(`${API}/saude`, { headers: { Accept: 'application/json' } });
      const d = await r.json();
      O.api.config = d;
      O.api.disponivel = !!d.ok;
      O.api.motivo = d.ok ? null : `Backend sem configuração: ${(d.faltando || []).join(', ')}.`;
    } catch (e) {
      O.api.disponivel = false;
      O.api.motivo = 'A API não respondeu. Confira se o projeto está publicado com as funções da pasta /api.';
    }
    return O.api;
  };

  async function renovarSessao() {
    const s = O.sessao;
    if (!s || !s.refresh || !O.api.config) return false;
    const r = await fetch(`${O.api.config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: O.api.config.supabaseAnon, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh }) });
    if (!r.ok) return false;
    const d = await r.json();
    O.sessao = { ...s, token: d.access_token, refresh: d.refresh_token, expira: Date.now() + d.expires_in * 1000 };
    gravar('sessao', O.sessao);
    return true;
  }

  async function chamar(caminho, { metodo = 'GET', corpo } = {}) {
    if (O.sessao && O.sessao.expira && O.sessao.expira - Date.now() < 60000) await renovarSessao();
    const r = await fetch(`${API}/${caminho}`, {
      method: metodo,
      headers: { Accept: 'application/json', ...(corpo ? { 'Content-Type': 'application/json' } : {}), ...(O.sessao ? { Authorization: `Bearer ${O.sessao.token}` } : {}) },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    const d = await r.json().catch(() => ({}));
    if (r.status === 401) {
      O.sessao = null;
      gravar('sessao', null);
      T.emit('ops:sessao', null);
    }
    if (!r.ok) throw Object.assign(new Error(d.erro || `Erro ${r.status}`), { status: r.status });
    return d;
  }
  O.chamar = chamar;

  O.entrar = async (email, senha) => {
    if (!O.api.config) await O.verificarApi();
    if (!O.api.disponivel) throw new Error(O.api.motivo);
    const r = await fetch(`${O.api.config.supabaseUrl}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: O.api.config.supabaseAnon, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: senha }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error_description || d.msg || 'E-mail ou senha incorretos.');
    O.sessao = { token: d.access_token, refresh: d.refresh_token, expira: Date.now() + d.expires_in * 1000 };
    const info = await chamar('sessao');
    O.sessao = { ...O.sessao, usuario: info.usuario, perfil: info.perfil, clientes: info.clientes };
    gravar('sessao', O.sessao);
    if (!info.clientes.some((c) => c.id === O.estado.cliente) && info.clientes[0]) O.estado.cliente = info.clientes[0].id;
    O.definir({ modo: 'real' });
    T.emit('ops:sessao', O.sessao);
  };
  O.sair = () => {
    O.sessao = null;
    gravar('sessao', null);
    cache.clear();
    O.definir({ modo: 'demonstracao', cliente: D.CLIENTES[0].id });
    T.emit('ops:sessao', null);
  };

  // ---------- clientes e papéis ----------
  O.clientes = () => (O.estado.modo === 'real' ? (O.sessao && O.sessao.clientes) || [] : D.CLIENTES);
  O.clienteAtual = () => O.clientes().find((c) => c.id === O.estado.cliente) || O.clientes()[0] || null;
  O.ehDemo = () => O.estado.modo !== 'real';
  /** O relatório do programa (capítulos do livro) só existe para o Clube Horizonte de demonstração. */
  O.ehProgramaHorizonte = () => O.ehDemo() && O.estado.cliente === 'demo-horizonte';
  O.papel = () => (O.ehDemo() ? 'admin' : (O.sessao && O.sessao.perfil && O.sessao.perfil.papel) || 'cliente');
  O.ehAdmin = () => O.papel() === 'admin';
  O.podeEditar = () => ['admin', 'gestor', 'atendimento'].includes(O.papel());

  // ---------- carregamento com cache ----------
  const cache = new Map();
  const edicoesDemo = (cliente) => ler(`demo-edicoes:${cliente}`, []);

  function aplicarEdicoesDemo(cj) {
    for (const ed of edicoesDemo(cj.cliente.id)) {
      if (ed.tipo === 'lead') {
        const l = cj.leads.find((x) => x.id === ed.id);
        if (l) Object.assign(l, ed.campos);
      } else if (ed.tipo === 'lead-novo') cj.leads.unshift(ed.lead);
      else if (ed.tipo === 'campanha-nova') cj.campanhas.unshift(ed.campanha);
      else if (ed.tipo === 'fase') {
        const c = cj.campanhas.find((x) => x.id === ed.campanha);
        const fz = c && c.fases.find((x) => x.id === ed.id);
        if (fz) Object.assign(fz, ed.campos);
      } else if (ed.tipo === 'campanha-removida') cj.campanhas = cj.campanhas.filter((x) => x.id !== ed.id);
      else if (ed.tipo === 'pessoa-nova') cj.pessoas.push(ed.pessoa);
      else if (ed.tipo === 'pessoa') {
        const p = cj.pessoas.find((x) => x.id === ed.id);
        if (p) Object.assign(p, ed.campos);
      }
    }
    return cj;
  }

  O.carregar = async () => {
    const e = O.estado;
    const j = N.janela(e.periodo, O.hoje(), e.de, e.ate);
    if (e.modo !== 'real') {
      const k = `demo:${e.cliente}:${O.hoje()}`;
      if (!cache.has(k)) {
        if (!D.CLIENTES.some((c) => c.id === e.cliente)) e.cliente = D.CLIENTES[0].id;
        cache.set(k, aplicarEdicoesDemo(D.gerar(e.cliente, O.hoje())));
      }
      return cache.get(k);
    }
    if (!O.sessao) throw Object.assign(new Error('Entre com sua conta para ver dados reais.'), { status: 401 });
    const k = `real:${e.cliente}:${j.de}:${j.ate}`;
    const emCache = cache.get(k);
    if (emCache && Date.now() - emCache.em < 60000) return emCache.dado;
    const dado = await chamar(`painel?cliente=${encodeURIComponent(e.cliente)}&de=${j.de}&ate=${j.ate}`);
    cache.set(k, { em: Date.now(), dado });
    return dado;
  };
  O.invalidar = () => cache.clear();
  /** O conjunto já carregado (síncrono) — para telas que redesenham sem nova busca. */
  O.atual = () => {
    const e = O.estado;
    if (e.modo !== 'real') return cache.get(`demo:${e.cliente}:${O.hoje()}`) || null;
    const j = N.janela(e.periodo, O.hoje(), e.de, e.ate);
    const c = cache.get(`real:${e.cliente}:${j.de}:${j.ate}`);
    return c ? c.dado : null;
  };

  // ---------- ações (gravam na API ou, na demonstração, numa camada local identificada) ----------
  const registrarDemo = (ed) => {
    const k = `demo-edicoes:${O.estado.cliente}`;
    gravar(k, [...ler(k, []), ed]);
  };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  O.acoes = {
    async moverLead(lead, etapa) {
      const campos = { etapa, ultimaAtividadeEm: new Date().toISOString() };
      if (etapa === 'convertido') campos.convertidoEm = O.hoje();
      if (etapa === 'qualificado' || etapa === 'negociacao') campos.qualificadoEm = campos.qualificadoEm || new Date().toISOString();
      if (O.ehDemo()) registrarDemo({ tipo: 'lead', id: lead.id, campos });
      else await chamar(`leads?id=${lead.id}`, { metodo: 'PATCH', corpo: { etapa } });
      Object.assign(lead, campos);
      O.invalidarSeReal();
    },
    async atualizarLead(lead, campos) {
      if (O.ehDemo()) registrarDemo({ tipo: 'lead', id: lead.id, campos });
      else await chamar(`leads?id=${lead.id}`, { metodo: 'PATCH', corpo: campos });
      Object.assign(lead, campos);
      O.invalidarSeReal();
    },
    async criarLead(dados) {
      if (O.ehDemo()) {
        const lead = { id: `${O.estado.cliente}-novo-${uid()}`, fonte: 'Cadastro manual (simulação)', etapa: 'novo', entradaEm: new Date().toISOString(), ultimaAtividadeEm: new Date().toISOString(), ...dados };
        registrarDemo({ tipo: 'lead-novo', lead });
        O.atual().leads.unshift(lead);
        return lead;
      }
      const l = await chamar('leads', { metodo: 'POST', corpo: { cliente: O.estado.cliente, ...dados } });
      O.invalidar();
      return l;
    },
    async criarCampanha(dados) {
      if (O.ehDemo()) {
        const id = `${O.estado.cliente}-camp-${uid()}`;
        const campanha = { id, clienteId: O.estado.cliente, acoes: [], ...dados, fases: N.FASES_CAMPANHA.map((fz) => ({ id: `${id}-${fz.id}`, etapa: fz.id, nome: fz.nome, status: 'pendente', responsavel: null, inicio: null, fim: null, meta: null, ...((dados.fases || []).find((x) => x.etapa === fz.id) || {}) })) };
        registrarDemo({ tipo: 'campanha-nova', campanha });
        O.atual().campanhas.unshift(campanha);
        return campanha;
      }
      const c = await chamar('campanhas', { metodo: 'POST', corpo: { cliente: O.estado.cliente, ...dados } });
      O.invalidar();
      return c;
    },
    async atualizarFase(campanha, fase, campos) {
      if (O.ehDemo()) registrarDemo({ tipo: 'fase', campanha: campanha.id, id: fase.id, campos });
      else await chamar(`campanhas?fase=${fase.id}`, { metodo: 'PATCH', corpo: campos });
      Object.assign(fase, campos);
      O.invalidarSeReal();
    },
    async removerCampanha(campanha) {
      if (O.ehDemo()) registrarDemo({ tipo: 'campanha-removida', id: campanha.id });
      else await chamar(`campanhas?id=${campanha.id}`, { metodo: 'DELETE' });
      const cj = O.atual();
      if (cj) cj.campanhas = cj.campanhas.filter((x) => x.id !== campanha.id);
      O.invalidarSeReal();
    },
    async criarPessoa(dados) {
      if (O.ehDemo()) {
        const pessoa = { id: `${O.estado.cliente}-p-${uid()}`, clienteId: O.estado.cliente, ativo: true, ...dados };
        registrarDemo({ tipo: 'pessoa-nova', pessoa });
        O.atual().pessoas.push(pessoa);
        return pessoa;
      }
      const p = await chamar('pessoas', { metodo: 'POST', corpo: { cliente: O.estado.cliente, ...dados } });
      O.invalidar();
      return p;
    },
    async atualizarPessoa(pessoa, campos) {
      if (O.ehDemo()) registrarDemo({ tipo: 'pessoa', id: pessoa.id, campos });
      else await chamar(`pessoas?id=${pessoa.id}`, { metodo: 'PATCH', corpo: campos });
      Object.assign(pessoa, campos);
      O.invalidarSeReal();
    },
    descartarEdicoesDemo() {
      gravar(`demo-edicoes:${O.estado.cliente}`, []);
      cache.clear();
    },
  };
  O.invalidarSeReal = () => {
    if (!O.ehDemo()) cache.clear();
  };
})();
