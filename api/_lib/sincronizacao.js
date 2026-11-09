// Sincronização incremental: cada integração guarda em `cursor.ate` o último dia completo coletado.
// A próxima rodada recomeça 2 dias antes (as plataformas consolidam números com até 48 h de atraso)
// e grava com upsert, então repetir um dia nunca duplica nada.
import { createRequire } from 'node:module';
import { decifrar, hashContato } from './cripto.js';
import { eq } from './supabase.js';
import { ErroFonte } from './conectores/meta.js';
import * as instagram from './conectores/instagram.js';
import * as facebook from './conectores/facebook.js';
import * as kommo from './conectores/kommo.js';
import * as whatsapp from './conectores/whatsapp.js';

const require = createRequire(import.meta.url);
const N = require('../../src/ops/nucleo.js');

export const CONECTORES = { instagram, facebook, kommo, whatsapp };
const JANELA_INICIAL = { instagram: 29, facebook: 89, kommo: 89, whatsapp: 0 };

const lotes = (arr, n = 500) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

export async function sincronizarIntegracao(db, integ, { agora = new Date() } = {}) {
  const hoje = N.hojeBrasil(agora);
  const ontem = N.somarDias(hoje, -1);
  const cursor = integ.cursor || {};
  const desde = cursor.ate ? N.somarDias(cursor.ate, -2) : N.somarDias(ontem, -JANELA_INICIAL[integ.canal]);
  const con = CONECTORES[integ.canal];
  const cid = integ.cliente_id;
  try {
    if (!integ.token_cifrado) throw new ErroFonte('token', 'Integração sem credencial.');
    const token = decifrar(integ.token_cifrado);
    const r = await con.sincronizar({ integracao: integ, token, desde, ate: ontem, somarDias: N.somarDias, temaDe: instagram.temaDe, hashContato });

    for (const l of lotes((r.diario || []).map((p) => ({ cliente_id: cid, canal: p.canal, metrica: p.metrica, dia: p.dia, valor: p.valor, atualizado_em: new Date().toISOString() }))))
      await db.inserir('metricas_diarias', l, { upsert: true, conflito: 'cliente_id,canal,metrica,dia' });
    for (const l of lotes((r.conteudos || []).map((c) => ({ ...c, cliente_id: cid, atualizado_em: new Date().toISOString() }))))
      await db.inserir('conteudos', l, { upsert: true, conflito: 'cliente_id,canal,externo_id' });
    for (const l of lotes((r.leads || []).map((x) => ({ ...x, cliente_id: cid, atualizado_em: new Date().toISOString() }))))
      await db.inserir('leads', l, { upsert: true, conflito: 'cliente_id,fonte,externo_id' });
    for (const l of lotes((r.conversas || []).map((x) => ({ ...x, cliente_id: cid }))))
      await db.inserir('conversas', l, { upsert: true, conflito: 'cliente_id,canal,contato_hash,iniciada_em' });
    for (const l of lotes((r.eventos || []).map((x) => ({ ...x, cliente_id: cid }))))
      await db.inserir('eventos', l, { upsert: true, conflito: 'cliente_id,canal,ref' });

    await db.atualizar(`integracoes?id=${eq(integ.id)}`, {
      estado: 'ativo',
      mensagem: (r.avisos || []).length ? r.avisos.slice(0, 5).join(' · ') : null,
      ultima_sync: new Date().toISOString(),
      cursor: { ...cursor, ate: ontem },
    });
    return { ok: true, canal: integ.canal, desde, ate: ontem, metricas: (r.diario || []).length, conteudos: (r.conteudos || []).length, leads: (r.leads || []).length };
  } catch (e) {
    const tipo = e instanceof ErroFonte ? e.tipo : 'fonte';
    const estado = tipo === 'token' ? 'erro' : tipo === 'permissao' ? 'sem_permissao' : 'atrasado';
    await db.atualizar(`integracoes?id=${eq(integ.id)}`, { estado, mensagem: String(e.message || e).slice(0, 400) });
    return { ok: false, canal: integ.canal, erro: e.message, estado };
  }
}
