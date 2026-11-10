// Monta, para UM cliente, o conjunto normalizado que a interface consome (o mesmo formato do modo demonstração).
// Todas as leituras usam o cliente do usuário (RLS), e todas filtram por cliente_id explicitamente.
import { createRequire } from 'node:module';
import { eq } from './supabase.js';

const require = createRequire(import.meta.url);
const N = require('../../src/ops/nucleo.js');

const mapaLead = (l) => ({
  id: l.id,
  nome: l.nome,
  contato: l.contato,
  origem: l.origem,
  fonte: l.fonte === 'kommo' ? 'Kommo' : l.fonte === 'whatsapp' ? 'WhatsApp Business' : 'Cadastro manual',
  somenteLeitura: l.fonte === 'kommo', // etapa de lead da Kommo é gerida na Kommo
  campanhaId: l.campanha_id,
  responsavel: l.responsavel,
  etapa: l.etapa,
  entradaEm: l.entrada_em,
  qualificadoEm: l.qualificado_em,
  convertidoEm: l.convertido_em ? l.convertido_em.slice(0, 10) : null,
  ultimaAtividadeEm: l.ultima_atividade_em,
  proximaAcao: l.proxima_acao,
  valor: l.valor,
  link: l.link,
});

export const mapaCampanha = (c, fases) => ({
  id: c.id,
  nome: c.nome,
  clienteId: c.cliente_id,
  objetivo: c.objetivo,
  plataformas: c.plataformas || [],
  publico: c.publico,
  inicio: c.inicio,
  fim: c.fim,
  metaLeads: c.meta_leads,
  orcamento: c.orcamento,
  acoes: c.acoes || [],
  fases: N.FASES_CAMPANHA.map((fz) => {
    const f = fases.find((x) => x.campanha_id === c.id && x.etapa === fz.id);
    return { id: f ? f.id : `${c.id}-${fz.id}`, etapa: fz.id, nome: fz.nome, status: f ? f.status : 'pendente', responsavel: f ? f.responsavel : null, inicio: f ? f.inicio : null, fim: f ? f.fim : null, meta: f ? f.meta : null, indicador: f ? f.indicador : null };
  }),
});

/** `de`/`ate` = janela pedida; a função já traz também a janela anterior (para as variações). */
export async function montarConjunto(db, cliente, de, ate) {
  const n = N.diasEntre(de, ate) + 1;
  const ini = N.somarDias(de, -n);
  const iniLeads = N.somarDias(ini, -120); // leads antigos ainda contam para campanhas e conversões do período
  const c = eq(cliente.id);
  const [metricas, convDia, ativ, leads, conteudos, campanhas, fases, integracoes, etapas, pessoas] = await Promise.all([
    db.ler(`metricas_diarias?cliente_id=${c}&dia=gte.${ini}&dia=lte.${ate}&select=canal,metrica,dia,valor&limit=100000`),
    db.rpc('ops_conversas_diario', { p_cliente: cliente.id, p_de: ini, p_ate: ate }),
    db.rpc('ops_atividade', { p_cliente: cliente.id, p_de: ini, p_ate: ate }),
    db.ler(`leads?cliente_id=${c}&or=(entrada_em.gte.${iniLeads},convertido_em.gte.${ini})&select=*&order=entrada_em.desc&limit=20000`),
    db.ler(`conteudos?cliente_id=${c}&publicado_em=gte.${ini}&select=*&order=publicado_em.desc&limit=2000`),
    db.ler(`campanhas?cliente_id=${c}&select=*&order=inicio.desc`),
    db.ler(`fases_campanha?cliente_id=${c}&select=*`),
    db.ler(`integracoes?cliente_id=${c}&select=canal,estado,mensagem,ultima_sync`), // nunca o token
    db.ler(`etapas_lead?cliente_id=${c}&select=id,nome,ordem,final&order=ordem`),
    db.ler(`pessoas?cliente_id=${c}&select=id,nome,email,papel,ativo&order=nome`),
  ]);

  const diario = metricas.map((m) => ({ d: m.dia, canal: m.canal, metrica: m.metrica, v: Number(m.valor) }));
  for (const r of convDia || []) {
    diario.push({ d: r.dia, canal: r.canal, metrica: 'conversas_iniciadas', v: Number(r.conversas) });
    if (r.canal === 'whatsapp') diario.push({ d: r.dia, canal: r.canal, metrica: 'contatos_unicos', v: Number(r.contatos) });
    if (r.tmr_min !== null) diario.push({ d: r.dia, canal: r.canal, metrica: 'tempo_primeira_resposta', v: Number(r.tmr_min) });
  }
  const conectores = ['instagram', 'facebook', 'kommo', 'whatsapp'].map((canal) => {
    const i = integracoes.find((x) => x.canal === canal);
    return { canal, estado: i ? i.estado : 'nao_configurado', ultimaSync: i ? i.ultima_sync : null, mensagem: i ? i.mensagem : 'Integração não configurada para este cliente.', fornece: canal === 'kommo' || canal === 'whatsapp' ? ['leads', 'conversas'] : ['metricas', 'conteudos'] };
  });

  return {
    versao: 1,
    modo: 'real',
    cliente: { id: cliente.id, nome: cliente.nome, segmento: cliente.segmento },
    geradoEm: new Date().toISOString(),
    historico: { de: ini, ate },
    conectores,
    etapas: etapas.length ? etapas : N.ETAPAS_PADRAO,
    diario,
    atividade: (ativ || []).map((a) => ({ d: a.dia, dow: a.dow, hora: a.hora, canal: a.canal, v: Number(a.v) })),
    leads: leads.map(mapaLead),
    conteudos: conteudos.map((x) => ({ id: x.id, canal: x.canal, formato: x.formato, tema: x.tema, campanhaId: x.campanha_id, publicadoEm: x.publicado_em, legenda: x.legenda, link: x.link, miniatura: x.miniatura, metricas: x.metricas || {}, conversas: x.conversas, leads: x.leads })),
    campanhas: campanhas.map((x) => mapaCampanha(x, fases)),
    pessoas,
  };
}
