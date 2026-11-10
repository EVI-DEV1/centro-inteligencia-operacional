// Instagram (conta profissional ligada a uma Página, via Instagram Graph API com login do Facebook).
// Permissões: instagram_basic, instagram_manage_insights, pages_read_engagement (exigem App Review da Meta).
//
// Métricas atuais (a Meta descontinuou `impressions`, `plays` e `video_views` em 2025; `views` substitui):
//   reach (série diária) · follower_count (série diária, últimos 30 dias) ·
//   profile_views, views, total_interactions (metric_type=total_value, pedidas dia a dia).
// Quando a API não devolve uma métrica, ela simplesmente não é gravada — a interface mostra "indisponível".
import { graph, paginar, insightsTolerante, epoch, diaDoEndTime } from './meta.js';

const SERIE_DIARIA = { reach: 'alcance', follower_count: 'novos_seguidores' };
const TOTAL_DO_DIA = { profile_views: 'visitas_perfil', views: 'visualizacoes', total_interactions: 'interacoes' };

const formato = (m) => (m.media_product_type === 'REELS' ? 'reel' : m.media_product_type === 'STORY' ? 'story' : m.media_type === 'CAROUSEL_ALBUM' ? 'carrossel' : m.media_type === 'VIDEO' ? 'video' : 'imagem');

/** Tema do post: mapa de hashtags configurado por cliente (config.temas = {"#implante": "Implantes"}) ou a 1ª hashtag. */
export function temaDe(legenda, mapa = {}) {
  const tags = String(legenda || '').toLowerCase().match(/#[\p{L}\d_]+/gu) || [];
  for (const t of tags) if (mapa[t]) return mapa[t];
  return tags[0] ? tags[0].slice(1) : null;
}

export async function sincronizar({ integracao, token, desde, ate, somarDias }) {
  const id = integracao.conta_externa_id;
  const diario = [];
  const avisos = [];

  // 1) séries diárias (até 30 dias por chamada)
  for (let ini = desde; ini <= ate; ini = somarDias(ini, 30)) {
    const fim = somarDias(ini, 29) < ate ? somarDias(ini, 29) : ate;
    const { ok, indisponiveis } = await insightsTolerante(`${id}/insights`, Object.keys(SERIE_DIARIA), { period: 'day', since: epoch(ini), until: epoch(fim, 1) }, token);
    indisponiveis.forEach((m) => avisos.push(`Instagram não devolveu ${m}`));
    for (const [m, blocos] of Object.entries(ok))
      for (const b of blocos) for (const v of b.values || []) diario.push({ canal: 'instagram', metrica: SERIE_DIARIA[m], dia: diaDoEndTime(v.end_time), valor: Number(v.value) || 0 });
  }

  // 2) totais por dia (metric_type=total_value não tem quebra diária: um pedido por dia)
  for (let d = desde; d <= ate; d = somarDias(d, 1)) {
    const { ok, indisponiveis } = await insightsTolerante(`${id}/insights`, Object.keys(TOTAL_DO_DIA), { period: 'day', metric_type: 'total_value', since: epoch(d), until: epoch(d, 1) }, token);
    if (d === desde) indisponiveis.forEach((m) => avisos.push(`Instagram não devolveu ${m}`));
    for (const [m, blocos] of Object.entries(ok)) for (const b of blocos) if (b.total_value) diario.push({ canal: 'instagram', metrica: TOTAL_DO_DIA[m], dia: d, valor: Number(b.total_value.value) || 0 });
  }

  // 3) publicações dos últimos 30 dias (as métricas de um post continuam mudando por semanas)
  const limitePost = somarDias(ate, -30);
  const midias = await paginar(`${id}/media`, { fields: 'id,caption,media_type,media_product_type,permalink,timestamp,thumbnail_url,media_url', limit: 50 }, token, { parar: (m) => m.timestamp.slice(0, 10) < limitePost });
  const conteudos = [];
  for (const m of midias) {
    const met = { alcance: null, visualizacoes: null, curtidas: null, comentarios: null, compartilhamentos: null, salvamentos: null };
    const nomes = { reach: 'alcance', views: 'visualizacoes', likes: 'curtidas', comments: 'comentarios', shares: 'compartilhamentos', saved: 'salvamentos' };
    const { ok } = await insightsTolerante(`${m.id}/insights`, Object.keys(nomes), {}, token);
    for (const [k, blocos] of Object.entries(ok)) if (blocos[0]) met[nomes[k]] = Number((blocos[0].values && blocos[0].values[0] && blocos[0].values[0].value) ?? blocos[0].total_value?.value ?? 0);
    conteudos.push({
      canal: 'instagram',
      externo_id: m.id,
      formato: formato(m),
      tema: temaDe(m.caption, integracao.config && integracao.config.temas),
      publicado_em: m.timestamp,
      legenda: m.caption ? m.caption.slice(0, 280) : null,
      link: m.permalink,
      miniatura: m.thumbnail_url || (m.media_type === 'IMAGE' ? m.media_url : null),
      metricas: met,
    });
  }
  return { diario, conteudos, avisos };
}

/** Confere se o token funciona e qual conta é — usado ao salvar a integração. */
export async function testar(token, idConta) {
  const r = await graph(idConta, { fields: 'id,username,followers_count' }, token);
  return { conta: r.username, seguidores: r.followers_count };
}
