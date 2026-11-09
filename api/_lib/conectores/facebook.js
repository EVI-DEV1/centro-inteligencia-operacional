// Página do Facebook (token de Página). Permissões: pages_read_engagement, read_insights.
// Desde 15/11/2025 a Meta descontinuou page_impressions* e page_fans; usamos as substitutas:
//   page_total_media_view_unique (alcance) · page_media_view (visualizações) · page_views_total (visitas)
//   page_daily_follows_unique (novos seguidores) · page_post_engagements (interações)
// Os nomes ficam num mapa para trocar sem mexer no resto se a Meta mudar de novo.
import { graph, paginar, insightsTolerante, epoch, diaDoEndTime } from './meta.js';

export const METRICAS_PAGINA = {
  page_total_media_view_unique: 'alcance',
  page_media_view: 'visualizacoes',
  page_views_total: 'visitas_perfil',
  page_daily_follows_unique: 'novos_seguidores',
  page_post_engagements: 'interacoes',
};

const formato = (p) => {
  const t = p.attachments && p.attachments.data && p.attachments.data[0] && p.attachments.data[0].media_type;
  return t === 'video' ? 'video' : t === 'album' ? 'carrossel' : t === 'link' || p.status_type === 'shared_story' ? 'link' : t === 'photo' ? 'imagem' : 'texto';
};

export async function sincronizar({ integracao, token, desde, ate, somarDias, temaDe }) {
  const id = integracao.conta_externa_id;
  const diario = [];
  const avisos = [];
  for (let ini = desde; ini <= ate; ini = somarDias(ini, 90)) {
    const fim = somarDias(ini, 89) < ate ? somarDias(ini, 89) : ate;
    const { ok, indisponiveis } = await insightsTolerante(`${id}/insights`, Object.keys(METRICAS_PAGINA), { period: 'day', since: epoch(ini), until: epoch(fim, 1) }, token);
    indisponiveis.forEach((m) => avisos.push(`Facebook não devolveu ${m}`));
    for (const [m, blocos] of Object.entries(ok)) for (const b of blocos) for (const v of b.values || []) diario.push({ canal: 'facebook', metrica: METRICAS_PAGINA[m], dia: diaDoEndTime(v.end_time), valor: Number(v.value) || 0 });
  }

  const limitePost = somarDias(ate, -30);
  const posts = await paginar(
    `${id}/posts`,
    { fields: 'id,message,created_time,permalink_url,full_picture,status_type,attachments{media_type},reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0),shares', since: epoch(limitePost), limit: 50 },
    token
  );
  const conteudos = [];
  for (const p of posts) {
    const { ok } = await insightsTolerante(`${p.id}/insights`, ['post_total_media_view_unique', 'post_media_view'], {}, token);
    const val = (k) => (ok[k] && ok[k][0] && ok[k][0].values && ok[k][0].values[0] ? Number(ok[k][0].values[0].value) || 0 : null);
    conteudos.push({
      canal: 'facebook',
      externo_id: p.id,
      formato: formato(p),
      tema: temaDe(p.message, integracao.config && integracao.config.temas),
      publicado_em: p.created_time,
      legenda: p.message ? p.message.slice(0, 280) : null,
      link: p.permalink_url,
      miniatura: p.full_picture || null,
      // a Graph API não informa salvamentos de posts de Página: fica null (indisponível), não zero
      metricas: { alcance: val('post_total_media_view_unique'), visualizacoes: val('post_media_view'), curtidas: p.reactions?.summary?.total_count ?? null, comentarios: p.comments?.summary?.total_count ?? null, compartilhamentos: p.shares ? p.shares.count : 0, salvamentos: null },
    });
  }
  return { diario, conteudos, avisos };
}

export async function testar(token, idPagina) {
  const r = await graph(idPagina, { fields: 'id,name,followers_count' }, token);
  return { conta: r.name, seguidores: r.followers_count };
}
