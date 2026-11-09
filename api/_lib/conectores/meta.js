// Chamadas à Graph API da Meta (Instagram e Facebook), com tratamento dos erros que importam:
// token inválido/expirado (190), permissão faltando (10/200), limite de uso (4/17/32/613) e métrica inexistente (100).
import { config } from '../config.js';
import { buscar } from '../http.js';

export class ErroFonte extends Error {
  constructor(tipo, mensagem) {
    super(mensagem);
    this.tipo = tipo; // token | permissao | limite | metrica | fonte
  }
}

export async function graph(caminho, params, token) {
  const url = new URL(`https://graph.facebook.com/${config.meta.versao}/${caminho.replace(/^\//, '')}`);
  for (const [k, v] of Object.entries(params || {})) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  const r = await buscar(url, { headers: { Authorization: `Bearer ${token}` } });
  const dado = await r.json().catch(() => ({}));
  if (dado.error) {
    const c = dado.error.code;
    if (c === 190) throw new ErroFonte('token', 'O token de acesso expirou ou foi revogado. Reconecte a conta.');
    if (c === 10 || c === 200 || (c >= 200 && c < 300)) throw new ErroFonte('permissao', `A conta não concedeu a permissão necessária: ${dado.error.message}`);
    if ([4, 17, 32, 613, 80001, 80002].includes(c)) throw new ErroFonte('limite', 'Limite de requisições da Meta atingido; a próxima sincronização continua de onde parou.');
    if (c === 100) throw new ErroFonte('metrica', dado.error.message);
    throw new ErroFonte('fonte', dado.error.message || `Graph API ${r.status}`);
  }
  return dado;
}

/** Percorre a paginação (`paging.next`) até `limite` itens ou até `parar(item)` dizer chega. */
export async function paginar(caminho, params, token, { limite = 500, parar } = {}) {
  const out = [];
  let pagina = await graph(caminho, params, token);
  for (;;) {
    for (const item of pagina.data || []) {
      if (parar && parar(item)) return out;
      out.push(item);
      if (out.length >= limite) return out;
    }
    const prox = pagina.paging && pagina.paging.cursors && pagina.paging.next ? pagina.paging.cursors.after : null;
    if (!prox) return out;
    pagina = await graph(caminho, { ...params, after: prox }, token);
  }
}

/** Pede cada métrica separadamente: uma métrica descontinuada não derruba as outras. */
export async function insightsTolerante(caminho, metricas, params, token) {
  const ok = {};
  const indisponiveis = [];
  for (const m of metricas) {
    try {
      const r = await graph(caminho, { ...params, metric: m }, token);
      ok[m] = r.data || [];
    } catch (e) {
      if (e instanceof ErroFonte && e.tipo === 'metrica') indisponiveis.push(m);
      else throw e;
    }
  }
  return { ok, indisponiveis };
}

export const epoch = (dia, deslocDias = 0) => Math.floor(new Date(`${dia}T03:00:00Z`).getTime() / 1000) + deslocDias * 86400; // meia-noite em Brasília
export const diaDoEndTime = (endTime) => {
  // end_time da Meta marca o FIM do dia (meia-noite seguinte, horário do Pacífico); o dia medido é o anterior
  const d = new Date(endTime);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};
