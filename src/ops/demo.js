/* OPS Intelligence · modo demonstração.
   Gera, com semente fixa, um conjunto no MESMO formato da API para cada cliente fictício.
   Tudo aqui é simulação: a interface mostra o selo "Simulação" sempre que este módulo é a fonte.
   Os clientes, pessoas, campanhas e números são inventados. */
(function (raiz, fabrica) {
  const getNucleo = () => (typeof module === 'object' && module.exports ? require('./nucleo.js') : raiz.T.ops.nucleo);
  const D = fabrica(getNucleo);
  if (typeof module === 'object' && module.exports) module.exports = D;
  else raiz.T.ops.demo = D;
})(typeof window !== 'undefined' ? window : globalThis, function (getNucleo) {
  'use strict';

  const CLIENTES = [
    {
      id: 'demo-horizonte',
      nome: 'Clube Horizonte',
      segmento: 'Clube de viagens',
      cor: '#7c6cff',
      escala: 1.6,
      conectores: { instagram: 'ativo', facebook: 'ativo', kommo: 'ativo', whatsapp: 'ativo' },
      temas: ['Destinos nacionais', 'Pacotes de temporada', 'Dicas de viagem', 'Depoimentos', 'Bastidores'],
      equipe: ['Ana R.', 'Bruno M.', 'Carla S.', 'Diego T.'],
      campanhas: [
        { nome: 'Temporada de verão', objetivo: 'Captar interessados em pacotes de dezembro a fevereiro', inicioRel: -150, dur: 45, meta: 520, orc: 9000, plataformas: ['instagram', 'facebook', 'whatsapp'], publico: 'Famílias, 30–55 anos, Sudeste' },
        { nome: 'Feriados prolongados', objetivo: 'Vender roteiros curtos de feriado', inicioRel: -95, dur: 30, meta: 300, orc: 4500, plataformas: ['instagram', 'whatsapp'], publico: 'Casais, 25–40 anos' },
        { nome: 'Indique um amigo', objetivo: 'Gerar leads por indicação de associados', inicioRel: -24, dur: 45, meta: 420, orc: 3000, plataformas: ['whatsapp', 'kommo'], publico: 'Associados ativos e indicados' },
        { nome: 'Abertura da temporada', objetivo: 'Lançar o calendário do próximo ano', inicioRel: 12, dur: 30, meta: 600, orc: 12000, plataformas: ['instagram', 'facebook', 'whatsapp', 'kommo'], publico: 'Base de leads e seguidores' },
      ],
    },
    {
      id: 'demo-aurora',
      nome: 'Studio Aurora',
      segmento: 'Estúdio de pilates e bem-estar',
      cor: '#d55181',
      escala: 0.55,
      conectores: { instagram: 'ativo', facebook: 'nao_configurado', kommo: 'ativo', whatsapp: 'ativo' },
      temas: ['Exercícios rápidos', 'Antes e depois', 'Rotina saudável', 'Aula experimental', 'Equipe'],
      equipe: ['Júlia P.', 'Marcos V.'],
      campanhas: [
        { nome: 'Aula experimental grátis', objetivo: 'Trazer novas alunas para a aula experimental', inicioRel: -120, dur: 30, meta: 140, orc: 1500, plataformas: ['instagram', 'whatsapp'], publico: 'Mulheres, 25–50 anos, até 5 km' },
        { nome: 'Plano semestral', objetivo: 'Converter alunas avulsas em plano semestral', inicioRel: -40, dur: 30, meta: 90, orc: 1200, plataformas: ['instagram', 'kommo'], publico: 'Alunas avulsas e ex-alunas' },
        { nome: 'Desafio 21 dias', objetivo: 'Engajar a audiência e captar leads para turmas novas', inicioRel: -18, dur: 28, meta: 105, orc: 2000, plataformas: ['instagram', 'whatsapp'], publico: 'Seguidoras e lista de espera' },
      ],
    },
    {
      id: 'demo-vertice',
      nome: 'Clínica Vértice',
      segmento: 'Odontologia',
      cor: '#3d8fe0',
      escala: 0.8,
      conectores: { instagram: 'erro', facebook: 'ativo', kommo: 'nao_configurado', whatsapp: 'ativo' },
      erro: { instagram: 'Token expirado em 02/11 — reconecte a conta para retomar a coleta.' },
      temas: ['Prevenção', 'Implantes', 'Clareamento', 'Dúvidas frequentes', 'Convênios'],
      equipe: ['Renata L.', 'Paulo A.', 'Sílvia C.'],
      campanhas: [
        { nome: 'Check-up de volta às aulas', objetivo: 'Agendar avaliações de crianças e adolescentes', inicioRel: -100, dur: 35, meta: 180, orc: 2500, plataformas: ['facebook', 'whatsapp'], publico: 'Pais e mães, 30–50 anos' },
        { nome: 'Clareamento de fim de ano', objetivo: 'Captar pacientes para clareamento', inicioRel: -20, dur: 40, meta: 220, orc: 3500, plataformas: ['facebook', 'whatsapp'], publico: 'Adultos, 20–45 anos' },
      ],
    },
  ];

  // PRNG com semente (mulberry32)
  function rng(semente) {
    let h = 1779033703 ^ semente.length;
    for (let i = 0; i < semente.length; i++) {
      h = Math.imul(h ^ semente.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    let a = h >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const poisson = (r, lambda) => {
    if (lambda <= 0) return 0;
    if (lambda > 30) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * normal(r)));
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= r();
    } while (p > L);
    return k - 1;
  };
  const normal = (r) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
  const escolher = (r, arr) => arr[Math.floor(r() * arr.length)];
  const PRIMEIROS = ['Larissa', 'Rafael', 'Camila', 'Thiago', 'Beatriz', 'Gustavo', 'Mariana', 'Felipe', 'Aline', 'Rodrigo', 'Patrícia', 'Leonardo', 'Fernanda', 'Vinícius', 'Juliana', 'André', 'Natália', 'Eduardo', 'Bianca', 'Lucas', 'Tatiane', 'Murilo', 'Priscila', 'Caio', 'Renata', 'Otávio', 'Débora', 'Igor', 'Helena', 'Sérgio'];
  const INICIAIS = 'ABCDEFGHJLMNOPRSTV';
  // perfil de horário (0–23) e de dia da semana (dom..sáb) da atividade
  const HORAS = [0.2, 0.1, 0.05, 0.05, 0.05, 0.1, 0.3, 0.6, 1, 1.3, 1.4, 1.3, 1.5, 1.4, 1.2, 1.1, 1.1, 1.2, 1.5, 1.9, 2.2, 2.1, 1.4, 0.7];
  const SEMANA = [0.75, 1.05, 1.1, 1.05, 1.15, 1, 0.8];

  function gerar(clienteId, hoje) {
    const N = getNucleo();
    const cli = CLIENTES.find((c) => c.id === clienteId);
    if (!cli) throw new Error(`cliente de demonstração inexistente: ${clienteId}`);
    const r = rng(`${clienteId}:${hoje}`);
    const DIAS = 180;
    const inicio = N.somarDias(hoje, -(DIAS - 1));
    const dias = N.intervalo(inicio, hoje);
    const ativo = (c) => cli.conectores[c] === 'ativo';
    const k = cli.escala;

    // campanhas com datas absolutas
    const campanhas = cli.campanhas.map((c, i) => {
      const ini = N.somarDias(hoje, c.inicioRel);
      const fim = N.somarDias(ini, c.dur - 1);
      const id = `${clienteId}-camp-${i + 1}`;
      const marcos = [-14, -7, 0, 0, Math.round(c.dur * 0.35), Math.round(c.dur * 0.6), c.dur];
      const fases = N.FASES_CAMPANHA.map((fz, n) => {
        const fi = N.somarDias(ini, n < 2 ? marcos[n] : n === 2 ? 0 : n === 6 ? c.dur : Math.round((c.dur * (n - 3)) / 3));
        const ff = N.somarDias(ini, n === 0 ? -8 : n === 1 ? -1 : n === 2 ? 2 : n === 6 ? c.dur + 7 : Math.round((c.dur * (n - 2)) / 3) - 1);
        let status = hoje > ff ? 'concluida' : hoje >= fi ? 'andamento' : 'pendente';
        // uma fase atrasada na campanha ativa do primeiro cliente, para mostrar o estado
        if (status === 'concluida' && clienteId === 'demo-horizonte' && i === 2 && fz.id === 'preparacao') status = 'atrasada';
        return { id: `${id}-${fz.id}`, etapa: fz.id, nome: fz.nome, status, responsavel: cli.equipe[n % cli.equipe.length], inicio: fi, fim: ff, meta: fz.id === 'captacao' ? `${c.meta} leads` : fz.id === 'conversao' ? `${Math.round(c.meta * 0.18)} conversões` : null, indicador: fz.id === 'captacao' ? 'leads_novos' : fz.id === 'conversao' ? 'leads_convertidos' : fz.id === 'lancamento' ? 'alcance' : null };
      });
      return {
        id,
        nome: c.nome,
        clienteId,
        objetivo: c.objetivo,
        plataformas: c.plataformas,
        publico: c.publico,
        inicio: ini,
        fim,
        metaLeads: c.meta,
        orcamento: c.orc,
        acoes: [
          { titulo: 'Série de reels com o tema principal', canal: c.plataformas[0], feito: hoje > N.somarDias(ini, 7) },
          { titulo: 'Mensagem de boas-vindas no WhatsApp', canal: 'whatsapp', feito: hoje > ini },
          { titulo: 'Remarketing para quem interagiu', canal: c.plataformas[0], feito: hoje > N.somarDias(ini, Math.round(c.dur / 2)) },
        ],
        fases,
      };
    });
    const campanhaNoDia = (d) => campanhas.filter((c) => d >= c.inicio && d <= c.fim);
    // a campanha de índice "fraco" fica abaixo da meta, para o insight aparecer
    const forca = (c) => (c.id.endsWith('-3') && clienteId === 'demo-horizonte' ? 0.55 : c.id.endsWith('-2') && clienteId === 'demo-vertice' ? 0.6 : 1.1);

    const diario = [];
    const atividade = [];
    const leads = [];
    const conteudos = [];
    let seqLead = 0;

    dias.forEach((d, idx) => {
      const dow = new Date(`${d}T12:00:00Z`).getUTCDay();
      const tendencia = 1 + (idx / DIAS) * 0.35;
      const camp = campanhaNoDia(d);
      const boost = 1 + camp.reduce((s, c) => s + 0.45 * forca(c), 0);
      const saz = SEMANA[dow] * tendencia * boost * (0.88 + r() * 0.24);
      const push = (canal, metrica, v) => ativo(canal) && diario.push({ d, canal, metrica, v: Math.max(0, Math.round(v)) });
      const pushF = (canal, metrica, v) => ativo(canal) && diario.push({ d, canal, metrica, v: Math.max(0, Math.round(v * 10) / 10) });

      // redes
      const igAlc = 2400 * k * saz;
      push('instagram', 'alcance', igAlc);
      push('instagram', 'visualizacoes', igAlc * (2.1 + r() * 0.5));
      push('instagram', 'visitas_perfil', igAlc * (0.052 + r() * 0.012));
      push('instagram', 'novos_seguidores', igAlc * (0.0065 + r() * 0.003));
      push('instagram', 'interacoes', igAlc * (0.048 + r() * 0.012) * (idx > DIAS - 30 ? 1.18 : 1));
      push('instagram', 'conversas_iniciadas', igAlc * 0.0022);
      const fbAlc = 1300 * k * saz * 0.9;
      push('facebook', 'alcance', fbAlc);
      push('facebook', 'visualizacoes', fbAlc * (1.6 + r() * 0.3));
      push('facebook', 'visitas_perfil', fbAlc * (0.03 + r() * 0.01));
      push('facebook', 'novos_seguidores', fbAlc * (0.003 + r() * 0.002));
      push('facebook', 'interacoes', fbAlc * (0.022 + r() * 0.008) * (idx > DIAS - 30 ? 0.86 : 1));
      push('facebook', 'conversas_iniciadas', fbAlc * 0.0012);

      // conversas
      const waConv = 34 * k * saz;
      push('whatsapp', 'conversas_iniciadas', waConv);
      push('whatsapp', 'contatos_unicos', waConv * 0.86);
      pushF('whatsapp', 'tempo_primeira_resposta', (dow === 0 || dow === 6 ? 48 : 19) * (0.7 + r() * 0.6) * (clienteId === 'demo-vertice' ? 2.1 : 1));
      const kmConv = 14 * k * saz;
      push('kommo', 'conversas_iniciadas', kmConv);
      pushF('kommo', 'tempo_primeira_resposta', 24 * (0.7 + r() * 0.6));

      // atividade por hora (interações + conversas), agregada por dia/hora/canal
      for (const [canal, vol] of [['instagram', igAlc * 0.05], ['facebook', fbAlc * 0.024], ['whatsapp', waConv], ['kommo', kmConv]]) {
        if (!ativo(canal)) continue;
        const tot = Math.round(vol);
        const pesos = HORAS.map((h, hora) => h * (canal === 'whatsapp' && hora >= 18 && hora <= 21 ? 1.25 : 1));
        const soma = pesos.reduce((a, b) => a + b, 0);
        pesos.forEach((p, hora) => {
          const v = poisson(r, (tot * p) / soma);
          if (v) atividade.push({ d, dow, hora, canal, v });
        });
      }

      // leads do dia
      const origens = [
        ['whatsapp', 9 * k],
        ['instagram', 6 * k],
        ['facebook', 3.2 * k],
        ['kommo', 2.4 * k],
        ['outros', 1.2 * k],
      ];
      for (const [origem, base] of origens) {
        if (origem !== 'outros' && !ativo(origem) && !(origem === 'instagram' && cli.conectores.instagram === 'erro')) continue;
        const n = poisson(r, base * saz * 0.55);
        for (let i = 0; i < n; i++) {
          seqLead++;
          const idade = DIAS - 1 - idx;
          const candidata = camp.length ? escolher(r, camp) : null;
          const campDia = candidata && r() < 0.36 * forca(candidata) ? candidata : null;
          const qualidade = (campDia ? forca(campDia) : 1) * (origem === 'whatsapp' ? 1.15 : origem === 'kommo' ? 1.25 : origem === 'facebook' ? 0.85 : 1);
          const pQual = Math.min(0.9, 0.42 * qualidade);
          const pConv = Math.min(0.6, 0.2 * qualidade);
          let etapa = 'novo';
          let qualificadoEm = null;
          let convertidoEm = null;
          const sorte = r();
          if (idade >= 1) etapa = 'em_contato';
          if (idade >= 3 && sorte < pQual) {
            etapa = 'qualificado';
            qualificadoEm = N.somarDias(d, 2 + Math.floor(r() * 3));
          }
          if (etapa === 'qualificado' && idade >= 6 && r() < 0.6) etapa = 'negociacao';
          if (etapa !== 'novo' && etapa !== 'em_contato' && idade >= 7 && sorte < pConv) {
            etapa = 'convertido';
            convertidoEm = N.somarDias(d, Math.min(idade, 5 + Math.floor(r() * 12)));
          } else if (idade >= 14 && etapa === 'em_contato' && r() < 0.55) etapa = 'perdido';
          if (convertidoEm && convertidoEm > hoje) convertidoEm = hoje;
          const nome = `${escolher(r, PRIMEIROS)} ${INICIAIS[Math.floor(r() * INICIAIS.length)]}.`;
          const hora = Math.min(23, Math.max(7, Math.round(13 + normal(r) * 4)));
          const entradaEm = `${d}T${String(hora).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}:00-03:00`;
          const ult = convertidoEm || (etapa === 'perdido' ? N.somarDias(d, 14) : N.somarDias(d, Math.min(idade, Math.floor(r() * 6))));
          leads.push({
            id: `${clienteId}-lead-${seqLead}`,
            nome,
            contato: `(12) 9${String(1000 + Math.floor(r() * 8999))}-${String(1000 + Math.floor(r() * 8999))}`,
            origem,
            fonte: origem === 'kommo' ? 'Kommo' : origem === 'whatsapp' ? 'WhatsApp Business' : origem === 'outros' ? 'Cadastro manual' : `${origem === 'instagram' ? 'Instagram' : 'Facebook'} (via formulário)`,
            campanhaId: campDia ? campDia.id : null,
            responsavel: escolher(r, cli.equipe),
            etapa,
            entradaEm,
            qualificadoEm,
            convertidoEm,
            ultimaAtividadeEm: ult,
            proximaAcao: etapa === 'novo' ? 'Primeiro contato' : etapa === 'em_contato' ? 'Retomar conversa' : etapa === 'qualificado' ? 'Enviar proposta' : etapa === 'negociacao' ? 'Confirmar fechamento' : null,
            valor: etapa === 'convertido' ? Math.round((600 + r() * 2400) / 10) * 10 : null,
          });
        }
      }

      // conteúdos publicados
      for (const canal of ['instagram', 'facebook']) {
        if (!ativo(canal)) continue;
        const chance = canal === 'instagram' ? 0.62 : 0.38;
        if (r() > chance) continue;
        const formatos = canal === 'instagram' ? ['reel', 'reel', 'carrossel', 'imagem', 'carrossel', 'reel', 'imagem'] : ['imagem', 'video', 'link', 'imagem', 'video'];
        const formato = escolher(r, formatos);
        const tema = escolher(r, cli.temas);
        const fator = { reel: 1.7, video: 1.3, carrossel: 1.15, imagem: 0.8, link: 0.55 }[formato] || 1;
        const temaFator = tema === cli.temas[0] ? 1.35 : tema === cli.temas[3] ? 1.2 : 1;
        const alcance = Math.round((canal === 'instagram' ? igAlc : fbAlc) * (0.6 + r() * 0.9) * fator * temaFator);
        const engaj = (canal === 'instagram' ? 0.055 : 0.028) * (formato === 'reel' ? 1.45 : formato === 'carrossel' ? 1.2 : 1) * (0.7 + r() * 0.6);
        const inter = alcance * engaj;
        const hora = escolher(r, [9, 12, 12, 18, 19, 19, 20, 21]);
        const camp1 = camp.length && r() < 0.6 ? escolher(r, camp) : null;
        conteudos.push({
          id: `${clienteId}-${canal}-${conteudos.length + 1}`,
          canal,
          formato,
          tema,
          campanhaId: camp1 ? camp1.id : null,
          publicadoEm: `${d}T${String(hora).padStart(2, '0')}:00:00-03:00`,
          legenda: `${tema}: ${escolher(r, ['o que ninguém te conta', 'guia rápido', 'perguntas da semana', 'por trás das câmeras', 'resultado real', 'passo a passo'])}`,
          link: null,
          metricas: {
            alcance,
            visualizacoes: Math.round(alcance * (formato === 'reel' || formato === 'video' ? 2.4 : 1.3)),
            curtidas: Math.round(inter * 0.72),
            comentarios: Math.round(inter * 0.07),
            compartilhamentos: Math.round(inter * 0.09),
            salvamentos: Math.round(inter * (formato === 'carrossel' ? 0.2 : 0.12)),
          },
          conversas: Math.round(inter * 0.025 * temaFator * (tema === cli.temas[3] ? 1.6 : 1)),
          leads: Math.round(inter * 0.009 * temaFator),
        });
      }
    });

    const agora = `${hoje}T${String(new Date().getHours()).padStart(2, '0')}:00:00-03:00`;
    const conectores = ['instagram', 'facebook', 'kommo', 'whatsapp'].map((c) => ({
      canal: c,
      estado: cli.conectores[c],
      ultimaSync: cli.conectores[c] === 'ativo' ? agora : cli.conectores[c] === 'erro' ? '2026-11-02T08:00:00-03:00' : null,
      mensagem: (cli.erro && cli.erro[c]) || (cli.conectores[c] === 'nao_configurado' ? 'Integração não configurada para este cliente.' : null),
      fornece: c === 'kommo' || c === 'whatsapp' ? ['leads', 'conversas'] : ['metricas', 'conteudos'],
    }));

    return {
      versao: 1,
      modo: 'simulacao',
      cliente: { id: cli.id, nome: cli.nome, segmento: cli.segmento },
      geradoEm: agora,
      historico: { de: inicio, ate: hoje },
      conectores,
      etapas: N.ETAPAS_PADRAO,
      diario,
      atividade,
      leads,
      conteudos,
      campanhas,
      pessoas: cli.equipe.map((nome, i) => ({ id: `${clienteId}-p-${i + 1}`, nome, papel: i === 0 ? 'gestor' : 'atendimento', clienteId, ativo: true })),
    };
  }

  return { CLIENTES: CLIENTES.map(({ id, nome, segmento, cor }) => ({ id, nome, segmento, cor, simulacao: true })), gerar };
});
