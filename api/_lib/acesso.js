// Quem é o usuário e o que ele pode ver.
// A RLS do Postgres é a garantia final do isolamento; estas checagens dão mensagens claras antes dela.
import { ErroHttp, uuid } from './http.js';
import { comoUsuario, usuarioDoToken, eq } from './supabase.js';

export const PAPEIS = ['admin', 'gestor', 'analista', 'atendimento', 'cliente'];

export async function contexto(req) {
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const usuario = await usuarioDoToken(token);
  const db = comoUsuario(token);
  const [perfil] = (await db.ler(`perfis?user_id=${eq(usuario.id)}&select=user_id,nome,papel,ativo`)) || [];
  if (!perfil || !perfil.ativo) throw new ErroHttp(403, 'Seu usuário ainda não foi liberado por um administrador.');
  // a RLS de `clientes` já devolve só os clientes que este usuário pode ver
  const clientes = await db.ler('clientes?select=id,nome,segmento,ativo&ativo=eq.true&order=nome');
  return { usuario, perfil, db, clientes, ehAdmin: perfil.papel === 'admin' };
}

export function exigirCliente(ctx, clienteId) {
  uuid(clienteId, 'cliente');
  if (!ctx.clientes.some((c) => c.id === clienteId)) throw new ErroHttp(403, 'Você não tem acesso a este cliente.');
  return clienteId;
}

export function exigirAdmin(ctx) {
  if (!ctx.ehAdmin) throw new ErroHttp(403, 'Disponível só para administradores.');
}

/** Papéis que podem editar leads, campanhas e pessoas. `cliente` e `analista` só leem. */
export function exigirEdicao(ctx) {
  if (!['admin', 'gestor', 'atendimento'].includes(ctx.perfil.papel)) throw new ErroHttp(403, 'Seu papel permite só leitura.');
}
