// Kommo CRM (antigo amoCRM) · API v4 com token de longa duração de uma integração privada.
// Limite da Kommo: 7 requisições por segundo por conta — o espaçamento abaixo respeita isso.
//
// O que vem daqui: leads (com etapa mapeada para o Kanban do OPS), responsáveis, e conversas
// (eventos de mensagem recebida/enviada nos chats integrados — WhatsApp, Instagram etc. via Kommo).
import { buscar } from '../http.js';
import { ErroFonte } from './meta.js';

const pausa = () => new Promise((r) => setTimeout(r, 160));
const GANHO = 142; // ids padrão da Kommo para "venda ganha" e "venda perdida"
const PERDIDO = 143;

function api(integracao, token) {
  const sub = String(integracao.conta_externa_id).replace(/[^a-z0-9-]/gi, '');
  const base = `https://${sub}.kommo.com/api/v4`;
  return async (caminho, params = {}) => {
    const url = new URL(`${base}/${caminho}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
    await pausa();
    const r = await buscar(url, { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 204) return null; // a Kommo responde 204 quando a página está vazia
    if (r.status === 401) throw new ErroFonte('token', 'Token da Kommo inválido ou expirado. Gere um novo na integração privada.');
    if (r.status === 403) throw new ErroFonte('permissao', 'A integração da Kommo não tem acesso a este recurso.');
    if (!r.ok) throw new ErroFonte('fonte', `Kommo respondeu ${r.status}`);
    return r.json();
  };
}

async function todasPaginas(get, caminho, params, chave, limite = 5000) {
  const out = [];
  for (let page = 1; out.length < limite; page++) {
    const r = await get(caminho, { ...params, page, limit: 250 });
    const itens = r && r._embedded ? r._embedded[chave] || [] : [];
    out.push(...itens);
    if (itens.length < 250) break;
  }
  return out;
}

/**
 * Etapa do OPS a partir do status da Kommo. Prioridade: mapa configurado pelo admin
 * (config.mapaEtapas = {"<status_id>": "qualificado"}) → ganho/perdido padrão → posição no funil.
 */
export function etapaDe(lead, statusPorId, mapa = {}) {
  if (mapa[lead.status_id]) return mapa[lead.status_id];
  if (lead.status_id === GANHO) return 'convertido';
  if (lead.status_id === PERDIDO) return 'perdido';
  const st = statusPorId.get(lead.status_id);
  if (!st) return 'em_contato';
  const abertos = st.irmaos.filter((s) => s.id !== GANHO && s.id !== PERDIDO).sort((a, b) => a.sort - b.sort);
  const pos = abertos.findIndex((s) => s.id === lead.status_id);
  if (pos <= 0) return 'novo';
  const frac = pos / Math.max(1, abertos.length - 1);
  return frac < 0.4 ? 'em_contato' : frac < 0.75 ? 'qualificado' : 'negociacao';
}

/** Origem do lead: tag ou fonte mapeadas (config.origemPorTag = {"instagram": "instagram"}); senão "kommo". */
export function origemDe(lead, mapa = {}) {
  const tags = (lead._embedded && lead._embedded.tags) || [];
  for (const t of tags) {
    const k = String(t.name || '').toLowerCase();
    if (mapa[k]) return mapa[k];
    if (/insta/.test(k)) return 'instagram';
    if (/face|fb/.test(k)) return 'facebook';
    if (/whats|wpp|zap/.test(k)) return 'whatsapp';
  }
  return 'kommo';
}

const iso = (seg) => (seg ? new Date(seg * 1000).toISOString() : null);

export async function sincronizar({ integracao, token, desde, hashContato }) {
  const get = api(integracao, token);
  const cfg = integracao.config || {};
  const desdeSeg = Math.floor(new Date(`${desde}T03:00:00Z`).getTime() / 1000);

  const pipelines = await todasPaginas(get, 'leads/pipelines', {}, 'pipelines', 50);
  const statusPorId = new Map();
  for (const p of pipelines) {
    const sts = (p._embedded && p._embedded.statuses) || [];
    for (const s of sts) statusPorId.set(s.id, { ...s, irmaos: sts });
  }
  const usuarios = await todasPaginas(get, 'users', {}, 'users', 500);
  const nomeUsuario = new Map(usuarios.map((u) => [u.id, u.name]));

  const brutos = await todasPaginas(get, 'leads', { 'filter[updated_at][from]': desdeSeg, with: 'contacts', order: 'updated_at' }, 'leads');
  const leads = brutos.map((l) => {
    const etapa = etapaDe(l, statusPorId, cfg.mapaEtapas);
    return {
      externo_id: String(l.id),
      fonte: 'kommo',
      nome: l.name || `Lead ${l.id}`,
      origem: origemDe(l, cfg.origemPorTag),
      responsavel: nomeUsuario.get(l.responsible_user_id) || null,
      etapa,
      entrada_em: iso(l.created_at),
      convertido_em: etapa === 'convertido' ? iso(l.closed_at || l.updated_at) : null,
      ultima_atividade_em: iso(l.updated_at),
      valor: l.price || null,
      link: `https://${integracao.conta_externa_id}.kommo.com/leads/detail/${l.id}`,
    };
  });

  // conversas: 1ª mensagem recebida de um contato abre uma conversa (janela de 24 h); 1ª enviada depois dela é a resposta
  const eventos = await todasPaginas(get, 'events', { 'filter[type][]': 'incoming_chat_message', 'filter[created_at][from]': desdeSeg }, 'events', 20000);
  const enviados = await todasPaginas(get, 'events', { 'filter[type][]': 'outgoing_chat_message', 'filter[created_at][from]': desdeSeg }, 'events', 20000);
  const conversas = [];
  const abertas = new Map();
  for (const e of eventos.sort((a, b) => a.created_at - b.created_at)) {
    const contato = `${e.entity_type}:${e.entity_id}`;
    const ab = abertas.get(contato);
    if (ab && e.created_at - ab.ultima < 86400) {
      ab.ultima = e.created_at;
      continue;
    }
    const c = { contato, iniciada: e.created_at, ultima: e.created_at };
    abertas.set(contato, c);
    conversas.push(c);
  }
  const respostas = enviados.sort((a, b) => a.created_at - b.created_at);
  for (const c of conversas) {
    const r = respostas.find((x) => `${x.entity_type}:${x.entity_id}` === c.contato && x.created_at >= c.iniciada);
    c.resposta = r ? r.created_at : null;
  }
  return {
    leads,
    conversas: conversas.map((c) => ({ canal: 'kommo', contato_hash: hashContato(`kommo:${integracao.conta_externa_id}:${c.contato}`), iniciada_em: iso(c.iniciada), ultima_msg_em: iso(c.ultima), primeira_resposta_em: iso(c.resposta) })),
    eventos: eventos.map((e) => ({ canal: 'kommo', ref: String(e.id), tipo: 'mensagem_recebida', em: iso(e.created_at) })),
    avisos: [],
  };
}

export async function testar(token, subdominio) {
  const r = await api({ conta_externa_id: subdominio }, token)('account', {});
  return { conta: r.name, seguidores: null };
}
