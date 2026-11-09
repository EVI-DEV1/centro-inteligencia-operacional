// Todas as rotas da API. Cada handler recebe (req, params) e devolve o corpo JSON.
import { createRequire } from 'node:module';
import { config, faltando } from './config.js';
import { ErroHttp, dia, uuid, lerCorpo, corpoBruto } from './http.js';
import { contexto, exigirCliente, exigirAdmin, exigirEdicao, PAPEIS } from './acesso.js';
import { comoServico, eq } from './supabase.js';
import { montarConjunto, mapaCampanha } from './conjunto.js';
import { sincronizarIntegracao, CONECTORES } from './sincronizacao.js';
import { cifrar, hashContato, assinaturaMetaValida } from './cripto.js';
import { processarWebhook } from './conectores/whatsapp.js';
import { resumoIA } from './ia.js';

const require = createRequire(import.meta.url);
const N = require('../../src/ops/nucleo.js');

// ---------- validação ----------
const texto = (v, nome, { max = 200, obrigatorio = false } = {}) => {
  if (v === undefined || v === null || v === '') {
    if (obrigatorio) throw new ErroHttp(400, `Campo obrigatório: ${nome}`);
    return null;
  }
  const s = String(v).trim();
  if (s.length > max) throw new ErroHttp(400, `${nome} passa de ${max} caracteres`);
  return s;
};
const inteiro = (v, nome) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new ErroHttp(400, `${nome} precisa ser um número positivo`);
  return n;
};
const umDe = (v, lista, nome) => {
  if (!lista.includes(v)) throw new ErroHttp(400, `${nome} inválido`);
  return v;
};
const CANAIS_LEAD = N.CANAIS.map((c) => c.id);
const ETAPAS = N.ETAPAS_PADRAO.map((e) => e.id);

const janelaDe = (p) => {
  const ate = dia(p.ate || N.hojeBrasil(), 'ate');
  const de = dia(p.de || N.somarDias(ate, -29), 'de');
  if (de > ate) throw new ErroHttp(400, 'de precisa ser antes de ate');
  if (N.diasEntre(de, ate) > 366) throw new ErroHttp(400, 'Período máximo de 1 ano');
  return { de, ate };
};

// ---------- rotas ----------
export const rotas = {
  saude: {
    GET: async () => ({ ok: faltando().length === 0, faltando: faltando(), supabaseUrl: config.supabaseUrl, supabaseAnon: config.supabaseAnon, ia: !!config.anthropic.chave, versao: 1 }),
  },

  sessao: {
    GET: async (req) => {
      const ctx = await contexto(req);
      return { usuario: ctx.usuario, perfil: ctx.perfil, clientes: ctx.clientes };
    },
  },

  painel: {
    GET: async (req, p, res) => {
      const ctx = await contexto(req);
      const cid = exigirCliente(ctx, p.cliente);
      const { de, ate } = janelaDe(p);
      res.setHeader('Cache-Control', 'private, max-age=60');
      return montarConjunto(ctx.db, ctx.clientes.find((c) => c.id === cid), de, ate);
    },
  },

  insights: {
    POST: async (req) => {
      const ctx = await contexto(req);
      const corpo = await lerCorpo(req);
      const cid = exigirCliente(ctx, corpo.cliente);
      const { de, ate } = janelaDe(corpo);
      const conjunto = await montarConjunto(ctx.db, ctx.clientes.find((c) => c.id === cid), de, ate);
      const f = { plataforma: corpo.plataforma || 'todas', campanha: corpo.campanha || 'todas', janela: N.janela('personalizado', ate, de, ate) };
      const lista = N.insights(conjunto, f);
      return { insights: lista, resumo: await resumoIA(lista, conjunto.cliente.nome) };
    },
  },

  // ----- leads -----
  leads: {
    POST: async (req) => {
      const ctx = await contexto(req);
      exigirEdicao(ctx);
      const b = await lerCorpo(req);
      const cid = exigirCliente(ctx, b.cliente);
      const [lead] = await ctx.db.inserir('leads', [
        {
          cliente_id: cid,
          fonte: 'cadastro',
          nome: texto(b.nome, 'nome', { obrigatorio: true }),
          contato: texto(b.contato, 'contato', { max: 120 }),
          origem: umDe(b.origem || 'outros', CANAIS_LEAD, 'origem'),
          campanha_id: b.campanhaId ? uuid(b.campanhaId, 'campanha') : null,
          responsavel: texto(b.responsavel, 'responsavel'),
          etapa: umDe(b.etapa || 'novo', ETAPAS, 'etapa'),
          proxima_acao: texto(b.proximaAcao, 'proximaAcao'),
          entrada_em: new Date().toISOString(),
          ultima_atividade_em: new Date().toISOString(),
        },
      ]);
      return lead;
    },
    PATCH: async (req, p) => {
      const ctx = await contexto(req);
      exigirEdicao(ctx);
      const id = uuid(p.id, 'id');
      const b = await lerCorpo(req);
      const [atual] = await ctx.db.ler(`leads?id=${eq(id)}&select=id,cliente_id,etapa,fonte`);
      if (!atual) throw new ErroHttp(404, 'Lead não encontrado');
      exigirCliente(ctx, atual.cliente_id);
      if (atual.fonte === 'kommo' && b.etapa) throw new ErroHttp(409, 'A etapa deste lead é gerida na Kommo. Mova o lead por lá.');
      const agora = new Date().toISOString();
      const campos = { atualizado_em: agora, ultima_atividade_em: agora };
      if (b.etapa) {
        campos.etapa = umDe(b.etapa, ETAPAS, 'etapa');
        if (b.etapa === 'convertido') campos.convertido_em = agora;
        if (['qualificado', 'negociacao'].includes(b.etapa)) campos.qualificado_em = agora;
      }
      if ('responsavel' in b) campos.responsavel = texto(b.responsavel, 'responsavel');
      if ('proximaAcao' in b) campos.proxima_acao = texto(b.proximaAcao, 'proximaAcao');
      if ('campanhaId' in b) campos.campanha_id = b.campanhaId ? uuid(b.campanhaId, 'campanha') : null;
      if ('valor' in b) campos.valor = inteiro(b.valor, 'valor');
      const [lead] = await ctx.db.atualizar(`leads?id=${eq(id)}`, campos);
      if (b.etapa && b.etapa !== atual.etapa) await ctx.db.inserir('interacoes', [{ cliente_id: atual.cliente_id, lead_id: id, tipo: 'etapa', resumo: `${atual.etapa} → ${b.etapa}`, autor: ctx.perfil.nome }]);
      return lead;
    },
  },

  interacoes: {
    GET: async (req, p) => {
      const ctx = await contexto(req);
      const id = uuid(p.lead, 'lead');
      return ctx.db.ler(`interacoes?lead_id=${eq(id)}&select=canal,tipo,em,resumo,autor&order=em.desc&limit=50`);
    },
  },

  // ----- campanhas e fases -----
  campanhas: {
    POST: async (req) => {
      const ctx = await contexto(req);
      exigirEdicao(ctx);
      const b = await lerCorpo(req);
      const cid = exigirCliente(ctx, b.cliente);
      const inicio = dia(b.inicio, 'inicio');
      const fim = dia(b.fim, 'fim');
      if (fim < inicio) throw new ErroHttp(400, 'O encerramento precisa ser depois do início');
      const [c] = await ctx.db.inserir('campanhas', [
        {
          cliente_id: cid,
          nome: texto(b.nome, 'nome', { obrigatorio: true }),
          objetivo: texto(b.objetivo, 'objetivo', { max: 500 }),
          plataformas: (b.plataformas || []).map((x) => umDe(x, CANAIS_LEAD, 'plataforma')),
          publico: texto(b.publico, 'publico', { max: 300 }),
          inicio,
          fim,
          meta_leads: inteiro(b.metaLeads, 'metaLeads'),
          orcamento: inteiro(b.orcamento, 'orcamento'),
          acoes: Array.isArray(b.acoes) ? b.acoes.slice(0, 30).map((a) => ({ titulo: texto(a.titulo, 'ação', { obrigatorio: true }), canal: a.canal || null, feito: !!a.feito })) : [],
          criado_por: ctx.usuario.id,
        },
      ]);
      const fases = N.FASES_CAMPANHA.map((fz) => {
        const v = (b.fases || []).find((x) => x.etapa === fz.id) || {};
        return { campanha_id: c.id, cliente_id: cid, etapa: fz.id, status: v.status ? umDe(v.status, N.STATUS_FASE.map((s) => s.id), 'status') : 'pendente', responsavel: texto(v.responsavel, 'responsavel'), inicio: v.inicio ? dia(v.inicio, 'inicio da fase') : null, fim: v.fim ? dia(v.fim, 'fim da fase') : null, meta: texto(v.meta, 'meta'), indicador: texto(v.indicador, 'indicador', { max: 40 }) };
      });
      const salvas = await ctx.db.inserir('fases_campanha', fases);
      return mapaCampanha(c, salvas);
    },
    PATCH: async (req, p) => {
      const ctx = await contexto(req);
      exigirEdicao(ctx);
      const b = await lerCorpo(req);
      if (p.fase) {
        const campos = {};
        if (b.status) campos.status = umDe(b.status, N.STATUS_FASE.map((s) => s.id), 'status');
        if ('responsavel' in b) campos.responsavel = texto(b.responsavel, 'responsavel');
        if ('inicio' in b) campos.inicio = b.inicio ? dia(b.inicio, 'inicio') : null;
        if ('fim' in b) campos.fim = b.fim ? dia(b.fim, 'fim') : null;
        if ('meta' in b) campos.meta = texto(b.meta, 'meta');
        const [f] = await ctx.db.atualizar(`fases_campanha?id=${eq(uuid(p.fase, 'fase'))}`, campos);
        if (!f) throw new ErroHttp(404, 'Fase não encontrada');
        return f;
      }
      const campos = {};
      for (const k of ['nome', 'objetivo', 'publico']) if (k in b) campos[k] = texto(b[k], k, { max: 500, obrigatorio: k === 'nome' });
      if ('inicio' in b) campos.inicio = dia(b.inicio, 'inicio');
      if ('fim' in b) campos.fim = dia(b.fim, 'fim');
      if ('metaLeads' in b) campos.meta_leads = inteiro(b.metaLeads, 'metaLeads');
      if ('orcamento' in b) campos.orcamento = inteiro(b.orcamento, 'orcamento');
      if ('plataformas' in b) campos.plataformas = (b.plataformas || []).map((x) => umDe(x, CANAIS_LEAD, 'plataforma'));
      if ('acoes' in b) campos.acoes = (b.acoes || []).slice(0, 30).map((a) => ({ titulo: texto(a.titulo, 'ação', { obrigatorio: true }), canal: a.canal || null, feito: !!a.feito }));
      const [c] = await ctx.db.atualizar(`campanhas?id=${eq(uuid(p.id, 'id'))}`, campos);
      if (!c) throw new ErroHttp(404, 'Campanha não encontrada');
      return c;
    },
    DELETE: async (req, p) => {
      const ctx = await contexto(req);
      exigirEdicao(ctx);
      const r = await ctx.db.apagar(`campanhas?id=${eq(uuid(p.id, 'id'))}`);
      if (!r.length) throw new ErroHttp(404, 'Campanha não encontrada');
      return { ok: true };
    },
  },

  // ----- pessoas da operação -----
  pessoas: {
    POST: async (req) => {
      const ctx = await contexto(req);
      exigirEdicao(ctx);
      const b = await lerCorpo(req);
      const cid = exigirCliente(ctx, b.cliente);
      const [x] = await ctx.db.inserir('pessoas', [{ cliente_id: cid, nome: texto(b.nome, 'nome', { obrigatorio: true }), email: texto(b.email, 'email'), papel: umDe(b.papel || 'atendimento', PAPEIS, 'papel') }]);
      return x;
    },
    PATCH: async (req, p) => {
      const ctx = await contexto(req);
      exigirEdicao(ctx);
      const b = await lerCorpo(req);
      const campos = {};
      if ('nome' in b) campos.nome = texto(b.nome, 'nome', { obrigatorio: true });
      if ('email' in b) campos.email = texto(b.email, 'email');
      if ('papel' in b) campos.papel = umDe(b.papel, PAPEIS, 'papel');
      if ('ativo' in b) campos.ativo = !!b.ativo;
      const [x] = await ctx.db.atualizar(`pessoas?id=${eq(uuid(p.id, 'id'))}`, campos);
      if (!x) throw new ErroHttp(404, 'Pessoa não encontrada');
      return x;
    },
  },

  // ----- administração -----
  clientes: {
    GET: async (req) => (await contexto(req)).clientes,
    POST: async (req) => {
      const ctx = await contexto(req);
      exigirAdmin(ctx);
      const b = await lerCorpo(req);
      const [c] = await ctx.db.inserir('clientes', [{ nome: texto(b.nome, 'nome', { obrigatorio: true }), segmento: texto(b.segmento, 'segmento') }]);
      return c;
    },
  },

  integracoes: {
    GET: async (req, p) => {
      const ctx = await contexto(req);
      const cid = exigirCliente(ctx, p.cliente);
      return ctx.db.ler(`integracoes?cliente_id=${eq(cid)}&select=id,canal,conta_externa_id,estado,mensagem,ultima_sync,config`);
    },
    POST: async (req) => {
      const ctx = await contexto(req);
      exigirAdmin(ctx);
      const b = await lerCorpo(req);
      const cid = exigirCliente(ctx, b.cliente);
      const canal = umDe(b.canal, Object.keys(CONECTORES), 'canal');
      const conta = texto(b.conta, 'conta', { obrigatorio: true, max: 120 });
      const token = texto(b.token, 'token', { obrigatorio: true, max: 4000 });
      let teste;
      try {
        teste = await CONECTORES[canal].testar(token, conta);
      } catch (e) {
        throw new ErroHttp(400, `Não foi possível validar a credencial: ${e.message}`);
      }
      const cfg = b.config && typeof b.config === 'object' ? b.config : {};
      if (canal === 'kommo' && !cfg.segredoWebhook) cfg.segredoWebhook = hashContato(`${cid}:${Date.now()}`);
      const [i] = await ctx.db.inserir('integracoes', [{ cliente_id: cid, canal, conta_externa_id: conta, token_cifrado: cifrar(token), config: cfg, estado: 'pendente', mensagem: `Conectado: ${teste.conta}. Primeira sincronização na próxima rodada.` }], { upsert: true, conflito: 'cliente_id,canal' });
      return { id: i.id, canal, estado: i.estado, conta: teste.conta, webhookKommo: canal === 'kommo' ? `/api/webhooks/kommo?segredo=${cfg.segredoWebhook}` : undefined };
    },
    DELETE: async (req, p) => {
      const ctx = await contexto(req);
      exigirAdmin(ctx);
      await ctx.db.apagar(`integracoes?id=${eq(uuid(p.id, 'id'))}`);
      return { ok: true };
    },
  },

  comparar: {
    GET: async (req, p) => {
      const ctx = await contexto(req);
      exigirAdmin(ctx);
      const { de, ate } = janelaDe(p);
      const f = { plataforma: 'todas', campanha: 'todas', janela: N.janela('personalizado', ate, de, ate) };
      const linhas = [];
      for (const c of ctx.clientes) linhas.push({ cliente: c, ...N.comparativo(await montarConjunto(ctx.db, c, de, ate), f) });
      return { de, ate, linhas };
    },
  },

  // ----- sincronização (cron diário da Vercel ou disparo manual de admin) -----
  sync: {
    GET: async (req) => {
      if (!config.cronSecret || req.headers.authorization !== `Bearer ${config.cronSecret}`) throw new ErroHttp(401, 'Só o agendador pode chamar esta rota.');
      const db = comoServico();
      const lista = await db.ler(`integracoes?estado=in.(ativo,pendente,atrasado)&select=*`);
      const out = [];
      for (const i of lista) out.push(await sincronizarIntegracao(db, i));
      await db.rpc('ops_limpar_antigos', {});
      return { rodadas: out };
    },
    POST: async (req, p) => {
      const ctx = await contexto(req);
      exigirAdmin(ctx);
      const cid = exigirCliente(ctx, p.cliente);
      const db = comoServico();
      const lista = await db.ler(`integracoes?cliente_id=${eq(cid)}&select=*`);
      const out = [];
      for (const i of lista) out.push(await sincronizarIntegracao(db, i));
      return { rodadas: out };
    },
  },

  // ----- webhooks -----
  'webhooks/whatsapp': {
    GET: async (req, p, res) => {
      if (p['hub.mode'] === 'subscribe' && config.meta.tokenVerificacao && p['hub.verify_token'] === config.meta.tokenVerificacao) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(String(p['hub.challenge'] || ''));
        return undefined;
      }
      throw new ErroHttp(403, 'Token de verificação inválido');
    },
    POST: async (req) => {
      const bruto = await corpoBruto(req);
      if (!assinaturaMetaValida(bruto, req.headers['x-hub-signature-256'], config.meta.appSecret)) throw new ErroHttp(401, 'Assinatura inválida');
      const payload = JSON.parse(bruto.toString('utf8'));
      return processarWebhook(payload, comoServico(), { hashContato });
    },
  },
  'webhooks/kommo': {
    POST: async (req, p) => {
      const segredo = texto(p.segredo, 'segredo', { obrigatorio: true, max: 64 });
      const db = comoServico();
      const [integ] = await db.ler(`integracoes?canal=eq.kommo&config->>segredoWebhook=${eq(segredo)}&select=*`);
      if (!integ) throw new ErroHttp(401, 'Webhook não reconhecido');
      // o payload da Kommo só avisa que algo mudou; buscamos o estado atual pela API (fonte da verdade)
      return sincronizarIntegracao(db, integ);
    },
  },
};
