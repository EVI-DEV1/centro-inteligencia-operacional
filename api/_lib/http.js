import { config } from './config.js';

export class ErroHttp extends Error {
  constructor(status, mensagem, detalhe) {
    super(mensagem);
    this.status = status;
    this.detalhe = detalhe;
  }
}

export function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', config.origemPermitida);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function json(res, status, corpo, { cache = 'no-store' } = {}) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.status(status).send(JSON.stringify(corpo));
}

/** Envolve um handler: CORS, erros padronizados e nunca vaza stack ou segredo para o cliente. */
export const executar = async (req, res, fn) => {
  if (cors(req, res)) return;
  try {
    await fn(req, res);
  } catch (e) {
    const status = e instanceof ErroHttp ? e.status : 500;
    if (status >= 500) console.error('[ops-api]', req.method, req.url, e);
    json(res, status, { erro: e instanceof ErroHttp ? e.message : 'Erro interno', detalhe: e instanceof ErroHttp ? e.detalhe : undefined });
  }
};

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * fetch com tempo limite e novas tentativas para 429/5xx, respeitando Retry-After.
 * As APIs das plataformas têm limites (Meta: uso por app/conta; Kommo: 7 req/s).
 */
export async function buscar(url, opcoes = {}, { tentativas = 3, limiteMs = 20000 } = {}) {
  let ultimo;
  for (let i = 0; i < tentativas; i++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), limiteMs);
    try {
      const r = await fetch(url, { ...opcoes, signal: ctl.signal });
      clearTimeout(t);
      if (r.status === 429 || r.status >= 500) {
        ultimo = new ErroHttp(r.status, `Fonte respondeu ${r.status}`);
        const ra = Number(r.headers.get('retry-after'));
        await esperar(Number.isFinite(ra) && ra > 0 ? ra * 1000 : 800 * 2 ** i);
        continue;
      }
      return r;
    } catch (e) {
      clearTimeout(t);
      ultimo = e;
      await esperar(600 * 2 ** i);
    }
  }
  throw ultimo;
}

/** Lê o corpo cru (Buffer) uma única vez — os webhooks precisam dele para conferir a assinatura. */
export async function corpoBruto(req, limite = 2 * 1024 * 1024) {
  if (req._corpoBruto) return req._corpoBruto;
  const partes = [];
  let total = 0;
  for await (const p of req) {
    total += p.length;
    if (total > limite) throw new ErroHttp(413, 'Corpo grande demais');
    partes.push(p);
  }
  return (req._corpoBruto = Buffer.concat(partes));
}

export async function lerCorpo(req) {
  const tipo = String(req.headers['content-type'] || '');
  const bruto = await corpoBruto(req);
  if (!bruto.length) return {};
  const texto = bruto.toString('utf8');
  if (tipo.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(texto));
  try {
    return JSON.parse(texto);
  } catch {
    throw new ErroHttp(400, 'JSON inválido');
  }
}

const DIA = /^\d{4}-\d{2}-\d{2}$/;
export const dia = (v, nome) => {
  if (!DIA.test(String(v || ''))) throw new ErroHttp(400, `Parâmetro ${nome} precisa ser uma data AAAA-MM-DD`);
  return v;
};
export const uuid = (v, nome) => {
  if (!/^[0-9a-f-]{36}$/i.test(String(v || ''))) throw new ErroHttp(400, `Parâmetro ${nome} inválido`);
  return v;
};
