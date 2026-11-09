// Configuração lida das variáveis de ambiente (Vercel → Settings → Environment Variables).
// Nada de segredo vai para o navegador: só SUPABASE_URL e SUPABASE_ANON_KEY são públicos.
const env = (k, padrao = null) => {
  const v = process.env[k];
  return v === undefined || v === '' ? padrao : v;
};

export const config = {
  supabaseUrl: env('SUPABASE_URL'),
  supabaseAnon: env('SUPABASE_ANON_KEY'),
  supabaseServico: env('SUPABASE_SERVICE_ROLE_KEY'),
  chaveCifra: env('OPS_CHAVE_CIFRA'), // 32 bytes em base64 — cifra os tokens das integrações
  cronSecret: env('CRON_SECRET'),
  origemPermitida: env('OPS_ORIGEM', '*'),
  meta: {
    versao: env('META_GRAPH_VERSION', 'v23.0'),
    appSecret: env('META_APP_SECRET'),
    tokenVerificacao: env('WHATSAPP_VERIFY_TOKEN'),
  },
  anthropic: { chave: env('ANTHROPIC_API_KEY'), modelo: env('ANTHROPIC_MODEL', 'claude-sonnet-5-5') },
  fuso: 'America/Sao_Paulo',
};

/** Diz o que falta para a API funcionar — usado por /api/saude para um estado claro na interface. */
export function faltando() {
  const f = [];
  if (!config.supabaseUrl) f.push('SUPABASE_URL');
  if (!config.supabaseAnon) f.push('SUPABASE_ANON_KEY');
  if (!config.supabaseServico) f.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!config.chaveCifra) f.push('OPS_CHAVE_CIFRA');
  return f;
}
