// WhatsApp Business Cloud API · as métricas nascem dos webhooks (não há API de histórico de conversas).
// Configuração na Meta: assinar o campo `messages` do webhook apontando para /api/webhooks/whatsapp.
//
// O que é medido:
//  · nova conversa = 1ª mensagem recebida de um contato depois de 24 h sem mensagens dele;
//  · tempo de 1ª resposta = da abertura até o 1º status "sent" de uma mensagem nossa para o contato.
//    Só conta respostas enviadas pela Cloud API (ou por ferramenta que use o mesmo número via API).
//  · origem: se a mensagem veio de anúncio/post "Clique para WhatsApp", a Meta manda `referral`
//    com o id da publicação — aí a conversa e o lead são atribuídos ao conteúdo e à rede de origem.
import { graph } from './meta.js';
import { eq } from '../supabase.js';

const JANELA_MS = 24 * 3600 * 1000;
const ts = (s) => new Date(Number(s) * 1000).toISOString();

function origemDoReferral(ref) {
  if (!ref) return { origem: 'whatsapp', conteudo: null };
  const url = String(ref.source_url || '');
  const origem = /instagram\.com/.test(url) ? 'instagram' : /facebook\.com|fb\.me/.test(url) ? 'facebook' : 'whatsapp';
  return { origem, conteudo: ref.source_id || null };
}

/** Processa um POST de webhook já validado. `db` é o cliente com chave de serviço. */
export async function processarWebhook(payload, db, { hashContato }) {
  const resumo = { mensagens: 0, conversasNovas: 0, respostas: 0, ignorados: 0 };
  for (const entrada of payload.entry || []) {
    for (const mudanca of entrada.changes || []) {
      const v = mudanca.value || {};
      const phoneId = v.metadata && v.metadata.phone_number_id;
      if (!phoneId) continue;
      const [integ] = await db.ler(`integracoes?canal=eq.whatsapp&conta_externa_id=${eq(phoneId)}&select=id,cliente_id,config,estado`);
      if (!integ) {
        resumo.ignorados++;
        continue;
      }
      const cid = integ.cliente_id;
      const cfg = integ.config || {};
      const nomes = new Map((v.contacts || []).map((c) => [c.wa_id, c.profile && c.profile.name]));

      for (const m of v.messages || []) {
        resumo.mensagens++;
        const em = ts(m.timestamp);
        const hash = hashContato(`wa:${m.from}`);
        await db.inserir('eventos', [{ cliente_id: cid, canal: 'whatsapp', ref: m.id, tipo: 'mensagem_recebida', em }], { upsert: true, conflito: 'cliente_id,canal,ref' });
        const [aberta] = await db.ler(`conversas?cliente_id=${eq(cid)}&canal=eq.whatsapp&contato_hash=${eq(hash)}&order=ultima_msg_em.desc&limit=1&select=id,ultima_msg_em,lead_id`);
        if (aberta && new Date(em) - new Date(aberta.ultima_msg_em) < JANELA_MS) {
          if (em > aberta.ultima_msg_em) await db.atualizar(`conversas?id=${eq(aberta.id)}`, { ultima_msg_em: em });
          continue;
        }
        resumo.conversasNovas++;
        const { origem, conteudo } = origemDoReferral(m.referral);
        let leadId = aberta ? aberta.lead_id : null;
        if (!leadId && cfg.criarLead !== false) {
          const [existente] = await db.ler(`leads?cliente_id=${eq(cid)}&fonte=eq.whatsapp&externo_id=${eq(hash)}&select=id`);
          if (existente) leadId = existente.id;
          else {
            const [novo] = await db.inserir('leads', [
              { cliente_id: cid, fonte: 'whatsapp', externo_id: hash, nome: nomes.get(m.from) || 'Contato do WhatsApp', contato: cfg.guardarTelefone === false ? null : `+${m.from}`, origem, etapa: 'novo', entrada_em: em, ultima_atividade_em: em, proxima_acao: 'Primeiro contato' },
            ]);
            leadId = novo && novo.id;
          }
        }
        await db.inserir('conversas', [{ cliente_id: cid, canal: 'whatsapp', contato_hash: hash, iniciada_em: em, ultima_msg_em: em, origem_ref: conteudo, lead_id: leadId }], { upsert: true, conflito: 'cliente_id,canal,contato_hash,iniciada_em' });
        if (conteudo) {
          const [c] = await db.ler(`conteudos?cliente_id=${eq(cid)}&externo_id=${eq(conteudo)}&select=id,conversas,leads`);
          if (c) await db.atualizar(`conteudos?id=${eq(c.id)}`, { conversas: (c.conversas || 0) + 1, leads: (c.leads || 0) + (leadId && !aberta ? 1 : 0) });
        }
      }

      for (const s of v.statuses || []) {
        if (s.status !== 'sent') continue;
        const em = ts(s.timestamp);
        const hash = hashContato(`wa:${s.recipient_id}`);
        const [conv] = await db.ler(`conversas?cliente_id=${eq(cid)}&canal=eq.whatsapp&contato_hash=${eq(hash)}&primeira_resposta_em=is.null&iniciada_em=lte.${encodeURIComponent(em)}&order=iniciada_em.desc&limit=1&select=id`);
        if (conv) {
          await db.atualizar(`conversas?id=${eq(conv.id)}`, { primeira_resposta_em: em, ultima_msg_em: em });
          resumo.respostas++;
        }
      }
      if (integ.estado !== 'ativo') await db.atualizar(`integracoes?id=${eq(integ.id)}`, { estado: 'ativo', mensagem: null });
      await db.atualizar(`integracoes?id=${eq(integ.id)}`, { ultima_sync: new Date().toISOString() });
    }
  }
  return resumo;
}

/** WhatsApp não tem histórico para puxar: a sincronização só confere se o número segue acessível. */
export async function sincronizar({ integracao, token }) {
  await graph(integracao.conta_externa_id, { fields: 'id' }, token);
  return { diario: [], conteudos: [], avisos: [] };
}

export async function testar(token, phoneNumberId) {
  const r = await graph(phoneNumberId, { fields: 'display_phone_number,verified_name' }, token);
  return { conta: `${r.verified_name || ''} ${r.display_phone_number || ''}`.trim(), seguidores: null };
}
