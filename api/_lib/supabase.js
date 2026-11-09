// Cliente mínimo do Supabase (PostgREST + Auth) com fetch — sem dependências.
// Duas formas de acesso:
//  · comoUsuario(token): usa a chave pública + o JWT do usuário → o Postgres aplica a RLS (isolamento por cliente).
//  · comoServico(): chave de serviço, só para jobs de sincronização e webhooks, que não têm usuário.
import { config } from './config.js';
import { ErroHttp, buscar } from './http.js';

function cliente(chave, token) {
  if (!config.supabaseUrl || !chave) throw new ErroHttp(503, 'Backend não configurado (Supabase).');
  const base = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1`;
  const cabecalhos = (extra = {}) => ({ apikey: chave, Authorization: `Bearer ${token || chave}`, 'Content-Type': 'application/json', ...extra });

  async function pedir(metodo, caminho, { corpo, prefer, contar } = {}) {
    const r = await buscar(`${base}/${caminho}`, {
      method: metodo,
      headers: cabecalhos({ ...(prefer ? { Prefer: prefer } : {}), ...(contar ? { Prefer: 'count=exact' } : {}) }),
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
    const texto = await r.text();
    const dado = texto ? JSON.parse(texto) : null;
    if (!r.ok) {
      const msg = (dado && (dado.message || dado.hint)) || `Supabase ${r.status}`;
      throw new ErroHttp(r.status === 401 || r.status === 403 ? 403 : r.status === 409 ? 409 : 400, r.status === 401 || r.status === 403 ? 'Sem permissão para este recurso' : msg);
    }
    return dado;
  }
  return {
    ler: (caminho) => pedir('GET', caminho),
    inserir: (tabela, linhas, { upsert = false, conflito } = {}) =>
      pedir('POST', `${tabela}${conflito ? `?on_conflict=${conflito}` : ''}`, { corpo: linhas, prefer: `return=representation${upsert ? ',resolution=merge-duplicates' : ''}` }),
    atualizar: (caminho, campos) => pedir('PATCH', caminho, { corpo: campos, prefer: 'return=representation' }),
    apagar: (caminho) => pedir('DELETE', caminho, { prefer: 'return=representation' }),
    rpc: (fn, args) => pedir('POST', `rpc/${fn}`, { corpo: args }),
  };
}

export const comoUsuario = (token) => cliente(config.supabaseAnon, token);
export const comoServico = () => cliente(config.supabaseServico, null);

/** Valida o JWT do usuário no Supabase Auth e devolve { id, email }. */
export async function usuarioDoToken(token) {
  if (!token) throw new ErroHttp(401, 'Faça login para acessar dados reais.');
  const r = await buscar(`${config.supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, { headers: { apikey: config.supabaseAnon, Authorization: `Bearer ${token}` } }, { tentativas: 2 });
  if (!r.ok) throw new ErroHttp(401, 'Sessão expirada. Entre novamente.');
  const u = await r.json();
  return { id: u.id, email: u.email };
}

/** Monta filtros PostgREST com valores escapados. */
export const eq = (v) => `eq.${encodeURIComponent(v)}`;
export const q = (obj) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${v}`)
    .join('&');
