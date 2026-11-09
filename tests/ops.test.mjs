// Testes do OPS Intelligence: núcleo de cálculo, modo demonstração e API (com fetch simulado).
// Rodar: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { Readable } from 'node:stream';

process.env.SUPABASE_URL = 'https://teste.supabase.co';
process.env.SUPABASE_ANON_KEY = 'anon';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'servico';
process.env.OPS_CHAVE_CIFRA = crypto.randomBytes(32).toString('base64');
process.env.META_APP_SECRET = 'segredo-app';
process.env.WHATSAPP_VERIFY_TOKEN = 'verifica';
process.env.CRON_SECRET = 'cron';

const require = createRequire(import.meta.url);
const N = require('../src/ops/nucleo.js');
const D = require('../src/ops/demo.js');
const HOJE = '2026-11-09';
const filtro = (periodo = '30', extra = {}) => ({ plataforma: 'todas', campanha: 'todas', janela: N.janela(periodo, HOJE), ...extra });

// ---------------- núcleo ----------------
test('janela: anterior tem o mesmo tamanho e termina na véspera', () => {
  const j = N.janela('7', HOJE);
  assert.deepEqual([j.de, j.ate, j.dias], ['2026-11-03', '2026-11-09', 7]);
  assert.deepEqual(j.anterior, { de: '2026-10-27', ate: '2026-11-02' });
  const p = N.janela('personalizado', HOJE, '2026-10-10', '2026-10-01');
  assert.equal(p.de, '2026-10-01');
  assert.equal(p.ate, '2026-10-10');
});

test('sem integração ativa a métrica fica indisponível — nunca zero', () => {
  const vazio = { conectores: [{ canal: 'instagram', estado: 'nao_configurado' }], diario: [], leads: [], conteudos: [], campanhas: [] };
  const ind = N.indicadores(vazio, filtro());
  assert.match(ind.alcance.indisponivel, /Nenhuma integração ativa/);
  assert.equal(ind.alcance.atual, undefined);
  assert.ok(ind.leads_novos.indisponivel);
  assert.equal(N.insights(vazio, filtro()).length, 0, 'sem dados, sem insight');
});

test('integração ativa sem a métrica explica que a API não devolveu', () => {
  const c = { conectores: [{ canal: 'facebook', estado: 'ativo' }], diario: [{ d: HOJE, canal: 'facebook', metrica: 'alcance', v: 10 }], leads: [] };
  assert.match(N.indisponivel(c, 'visitas_perfil', 'facebook'), /ainda não devolveram/);
  assert.equal(N.indisponivel(c, 'alcance', 'facebook'), null);
  assert.match(N.indisponivel(c, 'contatos_unicos', 'facebook'), /não é uma métrica de Facebook/);
});

test('série: dias sem dado ficam null e a soma ignora nulls', () => {
  const c = { conectores: [{ canal: 'instagram', estado: 'ativo' }], diario: [{ d: '2026-11-08', canal: 'instagram', metrica: 'alcance', v: 5 }, { d: '2026-11-09', canal: 'instagram', metrica: 'alcance', v: 7 }] };
  const s = N.serie(c, 'alcance', 'todas', N.janela('7', HOJE));
  assert.equal(s.length, 7);
  assert.equal(s[0].v, null);
  assert.equal(N.totalDe(s), 12);
});

test('funil marca estimativas e o maior ponto de abandono', () => {
  const cj = D.gerar('demo-horizonte', HOJE);
  const fu = N.funil(cj, filtro());
  assert.equal(fu.etapas.length, 5);
  assert.ok(fu.etapas[0].estimado && !fu.etapas[4].estimado);
  assert.ok(fu.maiorAbandono && fu.maiorAbandono.abandono > 0);
  fu.etapas.slice(0, -1).forEach((e) => e.passagem !== undefined && assert.ok(e.passagem >= 0 && e.passagem <= 100));
});

test('origem dos leads soma 100% e traz taxa de conversão por canal', () => {
  const o = N.origemLeads(D.gerar('demo-aurora', HOJE), filtro());
  assert.ok(Math.abs(o.reduce((s, x) => s + x.pct, 0) - 100) < 1e-6);
  o.forEach((x) => assert.ok(x.taxaConversao === null || (x.taxaConversao >= 0 && x.taxaConversao <= 100)));
});

test('insights separam fato, hipótese e recomendação, com período e fonte', () => {
  const lista = N.insights(D.gerar('demo-horizonte', HOJE), filtro());
  assert.ok(lista.length >= 3);
  for (const i of lista) {
    assert.ok(i.fato && i.recomendacao && i.periodo && i.fontes.length, i.id);
    assert.ok(['positivo', 'alerta', 'neutro'].includes(i.tom));
  }
  assert.ok(lista.some((i) => i.id.startsWith('camp-')), 'campanha abaixo da meta aparece');
});

test('filtro de plataforma e de campanha recortam os leads', () => {
  const cj = D.gerar('demo-horizonte', HOJE);
  const camp = cj.campanhas.find((c) => c.inicio <= HOJE && c.fim >= HOJE);
  const so = N.leadsDoFiltro(cj, { plataforma: 'whatsapp', campanha: camp.id });
  assert.ok(so.length > 0);
  assert.ok(so.every((l) => l.origem === 'whatsapp' && l.campanhaId === camp.id));
});

test('melhores horários não repetem janelas sobrepostas', () => {
  const m = N.mapaAtividade(D.gerar('demo-vertice', HOJE), filtro());
  const top = N.melhoresHorarios(m, 3);
  for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++) assert.ok(!(top[i].dow === top[j].dow && Math.abs(top[i].hora - top[j].hora) < 2));
});

// ---------------- demonstração ----------------
test('demo é determinística e os clientes não compartilham dados', () => {
  const a1 = D.gerar('demo-horizonte', HOJE);
  const a2 = D.gerar('demo-horizonte', HOJE);
  assert.deepEqual(a1.leads.slice(0, 5), a2.leads.slice(0, 5));
  const b = D.gerar('demo-aurora', HOJE);
  assert.equal(a1.modo, 'simulacao');
  assert.ok(a1.leads.every((l) => l.id.startsWith('demo-horizonte')));
  assert.ok(b.leads.every((l) => l.id.startsWith('demo-aurora')));
  assert.ok(b.campanhas.every((c) => c.clienteId === 'demo-aurora'));
});

test('demo respeita integração desligada: sem métrica do canal', () => {
  const v = D.gerar('demo-vertice', HOJE); // Instagram com token expirado
  assert.ok(!v.diario.some((p) => p.canal === 'instagram'));
  assert.ok(N.indicadores(v, filtro('30', { plataforma: 'instagram' })).alcance.indisponivel);
});

// ---------------- API ----------------
const { default: handler } = await import('../api/ops.js');
const { cifrar, decifrar, assinaturaMetaValida } = await import('../api/_lib/cripto.js');
const { etapaDe, origemDe } = await import('../api/_lib/conectores/kommo.js');
const { temaDe } = await import('../api/_lib/conectores/instagram.js');
const { buscar } = await import('../api/_lib/http.js');

/** Supabase falso: guarda tabelas em memória e responde ao subconjunto de PostgREST que a API usa. */
function supabaseFalso({ usuarios = {}, tabelas = {} } = {}) {
  const t = { perfis: [], clientes: [], integracoes: [], leads: [], conversas: [], eventos: [], conteudos: [], ...tabelas };
  const chamadas = [];
  const filtrar = (linhas, params) => {
    let out = linhas;
    for (const [k, v] of params) {
      if (['select', 'order', 'limit', 'on_conflict'].includes(k)) continue;
      const [op, ...resto] = v.split('.');
      const val = decodeURIComponent(resto.join('.'));
      if (op === 'eq') out = out.filter((r) => String(r[k]) === val);
      else if (op === 'is' && val === 'null') out = out.filter((r) => r[k] === null || r[k] === undefined);
      else if (op === 'lte') out = out.filter((r) => String(r[k]) <= val);
      else if (op === 'in') out = out.filter((r) => val.replace(/[()]/g, '').split(',').includes(String(r[k])));
    }
    return out;
  };
  const fetchFalso = async (url, op = {}) => {
    const u = new URL(String(url));
    const metodo = op.method || 'GET';
    chamadas.push({ metodo, caminho: u.pathname + u.search, corpo: op.body });
    const resp = (status, corpo) => new Response(corpo === undefined ? '' : JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } });
    if (u.pathname === '/auth/v1/user') {
      const tok = String(op.headers.Authorization).slice(7);
      return usuarios[tok] ? resp(200, usuarios[tok]) : resp(401, { message: 'jwt' });
    }
    const tabela = u.pathname.replace('/rest/v1/', '');
    const linhas = t[tabela] || (t[tabela] = []);
    if (metodo === 'GET') return resp(200, filtrar(linhas, u.searchParams));
    if (metodo === 'POST') {
      const novos = JSON.parse(op.body).map((r) => ({ id: r.id || crypto.randomUUID(), ...r }));
      linhas.push(...novos);
      return resp(201, novos);
    }
    if (metodo === 'PATCH') {
      const alvo = filtrar(linhas, u.searchParams);
      alvo.forEach((r) => Object.assign(r, JSON.parse(op.body)));
      return resp(200, alvo);
    }
    return resp(200, []);
  };
  return { t, chamadas, fetchFalso };
}

function chamar({ metodo = 'GET', url, headers = {}, corpo }) {
  const req = Readable.from(corpo ? [Buffer.from(corpo)] : []);
  Object.assign(req, { method: metodo, url, headers });
  return new Promise((ok) => {
    const res = {
      cabecalhos: {},
      headersSent: false,
      setHeader(k, v) {
        this.cabecalhos[k.toLowerCase()] = v;
      },
      status(c) {
        this.codigo = c;
        return this;
      },
      send(b) {
        this.headersSent = true;
        ok({ status: this.codigo, corpo: b && String(b).startsWith('{') ? JSON.parse(b) : b, cabecalhos: this.cabecalhos });
      },
      end() {
        this.headersSent = true;
        ok({ status: this.codigo });
      },
    };
    handler(req, res);
  });
}

const CLI_A = '11111111-1111-4111-8111-111111111111';
const CLI_B = '22222222-2222-4222-8222-222222222222';

test('API: painel recusa cliente fora do acesso do usuário (403)', async () => {
  const sb = supabaseFalso({ usuarios: { tokA: { id: 'u-a', email: 'a@x' } }, tabelas: { perfis: [{ user_id: 'u-a', nome: 'A', papel: 'analista', ativo: true }], clientes: [{ id: CLI_A, nome: 'A', ativo: true }] } });
  globalThis.fetch = sb.fetchFalso;
  const r = await chamar({ url: `/api/ops?r=painel&cliente=${CLI_B}`, headers: { authorization: 'Bearer tokA' } });
  assert.equal(r.status, 403);
  assert.ok(!sb.chamadas.some((c) => c.caminho.includes(CLI_B) && c.caminho.includes('leads')), 'nem chega a consultar dados do outro cliente');
});

test('API: sem login devolve 401; rota inexistente 404', async () => {
  globalThis.fetch = supabaseFalso().fetchFalso;
  assert.equal((await chamar({ url: `/api/ops?r=painel&cliente=${CLI_A}` })).status, 401);
  assert.equal((await chamar({ url: '/api/ops?r=nada' })).status, 404);
});

test('API: analista não edita lead (403)', async () => {
  const sb = supabaseFalso({ usuarios: { tokA: { id: 'u-a' } }, tabelas: { perfis: [{ user_id: 'u-a', nome: 'A', papel: 'analista', ativo: true }], clientes: [{ id: CLI_A, nome: 'A', ativo: true }] } });
  globalThis.fetch = sb.fetchFalso;
  const r = await chamar({ metodo: 'POST', url: '/api/ops?r=leads', headers: { authorization: 'Bearer tokA', 'content-type': 'application/json' }, corpo: JSON.stringify({ cliente: CLI_A, nome: 'X' }) });
  assert.equal(r.status, 403);
});

test('API: sync exige o segredo do cron', async () => {
  globalThis.fetch = supabaseFalso().fetchFalso;
  assert.equal((await chamar({ url: '/api/ops?r=sync' })).status, 401);
});

test('webhook WhatsApp: verificação e assinatura', async () => {
  globalThis.fetch = supabaseFalso().fetchFalso;
  const ok = await chamar({ url: '/api/ops?r=webhooks/whatsapp&hub.mode=subscribe&hub.verify_token=verifica&hub.challenge=123' });
  assert.equal(ok.corpo, '123');
  const ruim = await chamar({ url: '/api/ops?r=webhooks/whatsapp&hub.mode=subscribe&hub.verify_token=errado&hub.challenge=1' });
  assert.equal(ruim.status, 403);
  const semAss = await chamar({ metodo: 'POST', url: '/api/ops?r=webhooks/whatsapp', corpo: '{}' });
  assert.equal(semAss.status, 401);
});

test('webhook WhatsApp: abre conversa, cria lead e mede 1ª resposta no cliente certo', async () => {
  const sb = supabaseFalso({
    tabelas: {
      integracoes: [
        { id: 'i-a', canal: 'whatsapp', conta_externa_id: 'PHONE_A', cliente_id: CLI_A, config: {}, estado: 'ativo' },
        { id: 'i-b', canal: 'whatsapp', conta_externa_id: 'PHONE_B', cliente_id: CLI_B, config: {}, estado: 'ativo' },
      ],
    },
  });
  globalThis.fetch = sb.fetchFalso;
  const t0 = Math.floor(Date.UTC(2026, 10, 9, 13, 0) / 1000);
  const enviar = async (payload) => {
    const corpo = JSON.stringify(payload);
    const ass = `sha256=${crypto.createHmac('sha256', 'segredo-app').update(corpo).digest('hex')}`;
    return chamar({ metodo: 'POST', url: '/api/ops?r=webhooks/whatsapp', headers: { 'x-hub-signature-256': ass, 'content-type': 'application/json' }, corpo });
  };
  const msg = (id, ts, from = '5512999990000') => ({ entry: [{ changes: [{ value: { metadata: { phone_number_id: 'PHONE_B' }, contacts: [{ wa_id: from, profile: { name: 'Lia' } }], messages: [{ id, from, timestamp: String(ts), type: 'text', referral: { source_url: 'https://www.instagram.com/p/abc', source_id: 'POST1', source_type: 'post' } }] } }] }] });
  let r = await enviar(msg('m1', t0));
  assert.equal(r.status, 200);
  assert.equal(r.corpo.conversasNovas, 1);
  await enviar(msg('m2', t0 + 600)); // mesma janela de 24 h: não abre outra
  await enviar({ entry: [{ changes: [{ value: { metadata: { phone_number_id: 'PHONE_B' }, statuses: [{ id: 's1', status: 'sent', timestamp: String(t0 + 900), recipient_id: '5512999990000' }] } }] }] });
  assert.equal(sb.t.conversas.length, 1);
  const conv = sb.t.conversas[0];
  assert.equal(conv.cliente_id, CLI_B);
  assert.ok(conv.primeira_resposta_em, 'resposta medida');
  assert.equal((new Date(conv.primeira_resposta_em) - new Date(conv.iniciada_em)) / 60000, 15);
  assert.equal(sb.t.leads.length, 1);
  assert.equal(sb.t.leads[0].cliente_id, CLI_B);
  assert.equal(sb.t.leads[0].origem, 'instagram', 'origem vem do referral');
  assert.ok(!JSON.stringify(sb.t.conversas).includes('5512999990000'), 'telefone não vai para conversas');
  assert.ok(sb.t.eventos.every((e) => e.cliente_id === CLI_B));
});

test('cripto: tokens cifrados voltam iguais e assinatura Meta confere', () => {
  const c = cifrar('EAAB-token');
  assert.notEqual(c, 'EAAB-token');
  assert.equal(decifrar(c), 'EAAB-token');
  const corpo = Buffer.from('{"a":1}');
  const ass = `sha256=${crypto.createHmac('sha256', 'k').update(corpo).digest('hex')}`;
  assert.ok(assinaturaMetaValida(corpo, ass, 'k'));
  assert.ok(!assinaturaMetaValida(corpo, ass, 'outro'));
});

test('Kommo: etapa por mapa, ganho/perdido e posição no funil; origem por tag', () => {
  const sts = [{ id: 1, sort: 10 }, { id: 2, sort: 20 }, { id: 3, sort: 30 }, { id: 4, sort: 40 }, { id: 142, sort: 10000 }, { id: 143, sort: 11000 }];
  const porId = new Map(sts.map((s) => [s.id, { ...s, irmaos: sts }]));
  assert.equal(etapaDe({ status_id: 1 }, porId), 'novo');
  assert.equal(etapaDe({ status_id: 4 }, porId), 'negociacao');
  assert.equal(etapaDe({ status_id: 142 }, porId), 'convertido');
  assert.equal(etapaDe({ status_id: 143 }, porId), 'perdido');
  assert.equal(etapaDe({ status_id: 2 }, porId, { 2: 'qualificado' }), 'qualificado');
  assert.equal(origemDe({ _embedded: { tags: [{ name: 'Instagram Ads' }] } }), 'instagram');
  assert.equal(origemDe({}), 'kommo');
});

test('Instagram: tema por hashtag mapeada ou primeira hashtag', () => {
  assert.equal(temaDe('Sorria! #Implante #promo', { '#implante': 'Implantes' }), 'Implantes');
  assert.equal(temaDe('Dica #prevenção hoje'), 'prevenção');
  assert.equal(temaDe('sem hashtag'), null);
});

test('buscar: tenta de novo em 429 respeitando Retry-After', async () => {
  let n = 0;
  globalThis.fetch = async () => (++n < 2 ? new Response('', { status: 429, headers: { 'retry-after': '0' } }) : new Response('{}', { status: 200 }));
  const r = await buscar('https://x.test', {}, { tentativas: 3 });
  assert.equal(r.status, 200);
  assert.equal(n, 2);
});
