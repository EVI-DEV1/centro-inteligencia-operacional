(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const R = L.alcance;
  const f = T.fmt;
  const G = T.graf;

  const estadoColeta = (c, hoje) => (!c || !c.ultima ? 'sem-dados' : String(c.ultima).slice(0, 10) === hoje ? 'atualizado' : c.paradaDias <= 2 ? 'atencao' : 'atrasado');
  const dia = (iso) => (iso ? String(iso).slice(0, 10) : null);
  const janela = (s) => `${f.data(s[0].d)}–${f.data(s.at(-1).d)}`;
  const variacao = (v) => `${v > 0 ? '+' : ''}${f.pct(v)}`;
  const maxDe = (pontos) => Math.max(...pontos.filter((p) => !p.parcial && typeof p.v === 'number').map((p) => p.v));
  const ultimoDia = (...series) => series.map((s) => s.at(-1).d).sort().at(-1);
  const primeiroDia = (...series) => series.map((s) => s[0].d).sort()[0];

  function escalaJusta(pontos) {
    const vs = pontos.map((p) => p.v).filter((v) => typeof v === 'number');
    const min = Math.min(...vs);
    const amp = Math.max(...vs) - min;
    if (!vs.length || !(amp > 0)) return {};
    const pot = 10 ** Math.floor(Math.log10(amp / 10));
    const r = amp / 10 / pot;
    const passo = (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * pot;
    return { yMin: Math.floor((min - amp * 0.05) / passo) * passo, yMax: Math.ceil((min + amp * 1.05) / passo) * passo };
  }

  function sensor() {
    const hoje = T.dados.diaMedido();
    const diaria = R.coleta[0];
    const estadoDiaria = estadoColeta(diaria, hoje);
    const ultimaDiaria = diaria && diaria.ultima ? String(diaria.ultima).slice(0, 10) : null;
    const diasParada = diaria ? Math.floor(diaria.paradaDias) : 0;
    const estados = [
      { id: 'atualizado', rotulo: 'Atualizado', desc: 'rodou hoje' },
      { id: 'atencao', rotulo: 'Atenção', desc: 'até 2 dias' },
      { id: 'atrasado', rotulo: 'Atrasado', desc: 'mais de 2 dias' },
      { id: 'sem-dados', rotulo: 'Sem dados', desc: 'nunca coletado' },
    ];
    const painelSensor = T.h(
      'div',
      { class: 'sensor-grande' },
      T.h(
        'div',
        { class: 'sensor-legenda', role: 'list' },
        estados.map((e) => T.h('span', { role: 'listitem', class: ['sensor-estado', e.id === estadoDiaria ? 'ativo' : null], 'data-s': T.estadoNormal(e.id === 'atencao' ? 'amarelo' : e.id) }, T.h('i'), T.h('b', null, e.rotulo), T.h('small', null, e.desc)))
      ),
      T.h(
        'div',
        { class: 'sensor-rotinas' },
        R.coleta.map((c) =>
          T.h(
            'div',
            { class: 'sensor-rotina' },
            T.h('div', { class: 'sensor-rotina-cab' }, T.carimbo(estadoColeta(c, hoje), c.status), T.h('span', { class: 'sensor-rotina-nome' }, c.rotina)),
            T.h(
              'div',
              { class: 'sensor-rotina-dados' },
              T.h('div', null, T.h('span', { class: 'leitura' }, 'última execução'), T.h('b', { class: 'num' }, f.data(c.ultima))),
              T.h('div', null, T.h('span', { class: 'leitura' }, 'parada há'), T.h('b', { class: ['num', estadoColeta(c, hoje) === 'atrasado' ? 'alerta-texto' : null] }, `${f.nFlex(c.paradaDias)} dias`)),
              T.h('div', null, T.h('span', { class: 'leitura' }, 'execuções'), T.h('b', { class: 'num' }, f.n(c.execucoes))),
              T.h('div', null, T.h('span', { class: 'leitura' }, 'erro registrado'), T.h('b', { class: 'num' }, c.erro))
            )
          )
        )
      )
    );
    const sinalHost = T.h('div', { class: 'sinal-host' });
    const alcance = T.dados.serie('alcance_instagram_dia');
    const parada = ultimaDiaria && estadoDiaria !== 'atualizado' && ultimaDiaria < hoje;
    const silencio = parada ? T.intervalo(T.isoSomar(ultimaDiaria, 1), hoje).map((d) => ({ d, v: null })) : [];
    G.linhas(sinalHost, {
      nome: parada ? 'alcance diário do Instagram até a coleta parar' : 'alcance diário do Instagram',
      altura: 190,
      x0: alcance[0].d,
      x1: hoje,
      margemDir: 20,
      formatoEixo: f.compacto,
      faixas: parada ? [{ de: ultimaDiaria, ate: hoje, classe: 'silencio', rotulo: `sem sinal · ${diasParada} ${diasParada === 1 ? 'dia' : 'dias'}` }] : [],
      marcadores: ultimaDiaria ? [{ d: ultimaDiaria, rotulo: 'última coleta', classe: 'hoje' }] : [],
      series: [{ nome: 'contas alcançadas no dia', pontos: [...alcance, ...silencio], cor: 'var(--eletrico)', area: true, rotuloFim: false }],
    });
    const cor = { atualizado: 'verde', atencao: 'amarelo', atrasado: 'vermelho', 'sem-dados': 'nao-medido' }[estadoDiaria];
    const rotuloEstado = { atualizado: 'Atualizado', atencao: 'Atenção', atrasado: 'Atrasado', 'sem-dados': 'Sem dados' }[estadoDiaria];
    return G.painel({
      id: 'sensor',
      titulo: parada ? `Sensor de dados: o clube está cego de alcance há ${diasParada} ${diasParada === 1 ? 'dia' : 'dias'}` : 'Sensor de dados: a coleta diária de redes está rodando',
      comoLer: `As ${R.coleta.length > 1 ? 'rotinas' : 'rotina'} que buscam dado nas redes, com a última execução de cada uma. Embaixo, o alcance diário do Instagram${parada ? ` até ${f.data(ultimaDiaria)} e o silêncio até ${f.data(hoje)}` : ''}.`,
      largura: 3,
      estado: cor,
      estadoTexto: rotuloEstado,
      grafico: (el) => el.append(painelSensor, sinalHost),
      leitura: R.coletaLeitura,
      p: [47, 51],
    });
  }

  function seguidores() {
    const ig = T.dados.serie('seguidores_instagram_dia');
    const fb = T.dados.serie('seguidores_facebook_dia');
    const I = R.instagram;
    const F = R.facebook;
    const fbDias = F.de.dia && F.ate.dia ? ` em ${T.diasEntre(dia(F.de.dia), dia(F.ate.dia))} dias` : '';
    return G.painel({
      titulo: 'Seguidores: o Instagram deitou, o Facebook subiu',
      comoLer: `Cada rede no seu quadro e na sua escala (as janelas também são diferentes: Instagram ${janela(ig)}, Facebook ${janela(fb)}). Não compare a altura das duas.`,
      largura: 2,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-2' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        grade.append(a, b);
        a.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Instagram · ${f.n(I.de.v)} → ${f.n(I.ate.v)} (${variacao(I.crescimentoPct)})`));
        const a1 = T.h('div');
        a.appendChild(a1);
        G.linhas(a1, { nome: 'seguidores no Instagram', altura: 170, x0: ig[0].d, x1: ig.at(-1).d, ...escalaJusta(ig), margemDir: 14, formatoEixo: f.compacto, formatoDica: f.compacto, series: [{ nome: 'seguidores', pontos: ig, cor: 'var(--eletrico)' }] });
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Facebook · ${f.n(F.de.v)} → ${f.n(F.ate.v)} (${variacao(F.crescimentoPct)}${fbDias})`));
        const b1 = T.h('div');
        b.appendChild(b1);
        G.linhas(b1, { nome: 'seguidores no Facebook', altura: 170, x0: fb[0].d, x1: fb.at(-1).d, ...escalaJusta(fb), margemDir: 14, formatoEixo: f.compacto, formatoDica: f.compacto, series: [{ nome: 'seguidores', pontos: fb, cor: 'var(--rosa)' }] });
      },
      leitura: `No Instagram o pico foi ${f.n(I.pico.v)} em ${f.data(dia(I.pico.dia))}: a curva não caiu, deitou — o crescimento acabou antes de a coleta parar (${f.n(I.perdaDesdePico)} a menos no último dia coletado). No Facebook, o trecho mais íngreme vai de ${f.data(dia(F.salto.de))} a ${f.data(dia(F.salto.ate))} (+${f.n(F.salto.v)} numa semana): descobrir de onde veio antes de creditá-lo ao conteúdo orgânico.`,
      nota: 'Séries lidas do gráfico do livro; valores de dica arredondados para milhar.',
      p: 47,
    });
  }

  function alcanceSemanal() {
    const A = T.dados.serie('alcance_instagram_semana');
    const semana = ultimoDia(A.conta, A.posts);
    const diasSemana = T.diasEntre(semana, T.dados.serie('alcance_instagram_dia').at(-1).d) + 1;
    const aberta = diasSemana >= 1 && diasSemana < 7 ? ` A semana de ${f.data(semana)} tem só ${diasSemana} ${diasSemana === 1 ? 'dia' : 'dias'}.` : '';
    return G.painel({
      titulo: 'Alcance semanal: o patamar de hoje é outro',
      comoLer: `Azul = contas alcançadas pelo perfil na semana; rosa = soma do alcance dos posts. Mesma unidade, mesma escala.${aberta}`,
      largura: 1,
      grafico: (el) =>
        G.linhas(el, {
          nome: 'alcance semanal',
          altura: 220,
          x0: primeiroDia(A.conta, A.posts),
          x1: semana,
          margemDir: 96,
          formatoEixo: f.compacto,
          formato: f.compacto,
          formatoDica: f.compacto,
          series: [
            { nome: 'alcance da conta', pontos: A.conta, cor: 'var(--eletrico)', rotuloFim: true },
            { nome: 'soma dos posts', pontos: A.posts, cor: 'var(--rosa)', rotuloFim: true },
          ],
        }),
      leitura: R.alcanceSemanalLeitura,
      p: [47, 48],
    });
  }

  function instagramDia() {
    const inter = T.dados.serie('interacoes_instagram_dia');
    const contas = T.dados.serie('contas_interagiram_instagram_dia');
    const visitas = T.dados.serie('visitas_perfil_instagram_dia');
    const posts = T.dados.serie('posts_instagram_semana');
    const D = R.instagramDiario;
    const V = R.visitasPerfil;
    return G.painel({
      titulo: 'Instagram dia a dia: encolheu quem é alcançado, não quem curte',
      comoLer: 'Interações por dia (barras) e contas que interagiram (linha), mesma unidade; visitas ao perfil em quadro próprio; posts por semana.',
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-3' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        const c = T.h('div');
        grade.append(a, b, c);
        a.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Interações e contas que interagiram'));
        const a1 = T.h('div');
        a.appendChild(a1);
        G.barrasDia(a1, { serie: inter, altura: 170, nome: 'interações', formatoEixo: f.compacto, formatoDica: f.compacto, linhas: [{ nome: 'contas que interagiram', pontos: contas, cor: 'var(--rosa)' }], passoDatas: 60 });
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Visitas ao perfil por dia'));
        const b1 = T.h('div');
        b.appendChild(b1);
        G.linhas(b1, { nome: 'visitas ao perfil', altura: 170, x0: visitas[0].d, x1: visitas.at(-1).d, margemDir: 60, series: [{ nome: 'visitas', pontos: visitas, cor: 'var(--eletrico)', area: true, rotuloFim: true }] });
        c.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Posts publicados por semana'));
        const c1 = T.h('div');
        c.appendChild(c1);
        const maisPosts = maxDe(posts);
        G.colunas(c1, { altura: 170, todosValores: true, nome: 'posts por semana', itens: posts.map((p) => ({ rotulo: f.data(p.d), v: p.v, cor: p.parcial ? 'var(--parcial)' : p.v === maisPosts ? 'var(--ciano)' : 'var(--eletrico)' })), larguraMax: 20, passoRotulo: 40 });
      },
      leitura: `As interações caíram de ${f.n(D.interacoesPico)} em ${f.data(dia(D.pico.dia))} para ${f.n(D.interacoesUltimo)} em ${f.data(dia(D.ultimo.dia))}, e as contas que interagem foram junto (${f.n(D.contasPico)} → ${f.n(D.contasUltimo)}): encolheu a quantidade de gente alcançada, não a vontade de curtir de quem vê. As visitas ao perfil andaram no sentido contrário (${f.n(V.baixa.v)} em ${f.data(dia(V.baixa.dia))}, ${f.n(V.maior.v)} em ${f.data(dia(V.maior.dia))}). ${R.semanaMaisPosts.leitura}`,
      p: 48,
    });
  }

  function comentarios() {
    const com = T.dados.serie('comentarios_dia');
    const pos = T.dados.serie('humor_positivo_pct_dia');
    const neg = T.dados.serie('humor_negativo_pct_dia');
    const picoComentarios = maxDe(com);
    const decisoes = T.soma(R.robo);
    const C = R.comentarios;
    const H = R.humor;
    const sorteio = R.postSorteio;
    const rede = (nome) => R.quemComenta.find((x) => x.rede === nome);
    const qFb = rede('Facebook');
    const qIg = rede('Instagram');
    const noCrm = [qFb, qIg].filter(Boolean).map((x) => x.noCrm);
    const autores = [
      qFb ? `${f.n(qFb.autores)} no Facebook para ${f.n(qFb.comentarios)} comentários (o nome quase nunca é capturado)` : null,
      qIg ? `${f.n(qIg.autores)} no Instagram` : null,
    ].filter(Boolean);
    const nCrm = noCrm.length && noCrm.every((v) => typeof v === 'number') ? T.soma(noCrm) : null;
    const crm = nCrm === null ? '' : nCrm === 0 ? ' Nenhum ligado a um lead do CRM.' : ` ${f.n(nCrm)} ${nCrm === 1 ? 'ligado' : 'ligados'} a um lead do CRM.`;
    return G.painel({
      titulo: 'Comentários, humor e o robô que quase não responde',
      comoLer: 'Comentários coletados por dia (as duas redes); humor medido por IA em % do dia; as decisões do robô de resposta por regra.',
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-3' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        const c = T.h('div');
        grade.append(a, b, c);
        a.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Comentários por dia (${janela(com)})`));
        const a1 = T.h('div');
        a.appendChild(a1);
        G.barrasDia(a1, { serie: com, altura: 170, nome: 'comentários', rotuloSe: (p) => p.v === picoComentarios, passoDatas: 64 });
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Humor: % positivo e % negativo'));
        const b1 = T.h('div');
        b.appendChild(b1);
        G.linhas(b1, { nome: 'humor dos comentários', altura: 170, x0: primeiroDia(pos, neg), x1: ultimoDia(pos, neg), yMax: 100, margemDir: 70, formato: (v) => f.pct(v, 0), formatoEixo: (v) => `${v}%`, formatoDica: (v) => f.pct(v), series: [{ nome: 'positivo', pontos: pos, cor: 'var(--eletrico)', rotuloFim: true }, { nome: 'negativo', pontos: neg, cor: 'var(--rosa)', rotuloFim: true }], marcadores: sorteio ? [{ d: dia(sorteio.dia), rotulo: 'sorteio' }] : [] });
        c.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `O que o robô decidiu (${f.n(decisoes)} decisões${R.roboDias ? ` em ${f.n(R.roboDias)} dias` : ''})`));
        G.barrasH(c, { compacta: true, itens: R.robo.map((x) => ({ rotulo: x.decisao, v: x.v, texto: `${f.n(x.v)} · ${f.pct(x.pct)}`, cor: x.decisao === 'Mandou p/ humano' ? 'var(--atencao)' : x.decisao === 'Respondeu' ? 'var(--eletrico)' : 'var(--referencia)' })) });
        c.appendChild(T.h('div', { class: 'par-numeros' }, T.h('div', null, T.h('span', { class: 'leitura' }, 'comentários'), T.h('b', { class: 'num' }, f.n(C.total))), T.h('div', null, T.h('span', { class: 'leitura' }, 'marcados como respondidos'), T.h('b', { class: 'num alerta-texto' }, f.n(C.respondidos)))));
        if (autores.length || crm) c.appendChild(T.h('p', { class: 'nota-pequena' }, `${autores.length ? `Autores: ${autores.join(' e ')}.` : ''}${autores.length ? crm : crm.trim()}`));
      },
      leitura: `O pior dia de humor foi ${f.data(dia(H.pior.dia))}, com ${f.pct(H.pior.negativoPct)} de negativos${sorteio && dia(sorteio.dia) === dia(H.pior.dia) ? ' — o dia do post do sorteio de passagens, o de maior alcance do período' : ''}; no conjunto, ${f.pct(H.positivoPct)} positivo contra ${f.pct(H.negativoPct)} negativo. ${R.roboLeitura}`,
      p: 49,
    });
  }

  function producao() {
    const fotos = T.dados.serie('fotos_semana');
    const M = R.acervo.mural;
    const duasUltimas = T.soma(fotos.slice(-2));
    return G.painel({
      titulo: 'O clube registra muito mais do que mede',
      comoLer: 'O que foi produzido nos últimos 30 dias contra a medida que existe de quem viu.',
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-2' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        grade.append(a, b);
        a.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Fotos novas no acervo por semana'));
        const a1 = T.h('div');
        a.appendChild(a1);
        G.colunas(a1, { altura: 170, nome: 'fotos por semana', itens: fotos.map((p, i) => ({ rotulo: f.data(p.d), v: p.v, cor: p.parcial ? 'var(--parcial)' : 'var(--eletrico)', destaque: i >= fotos.length - 2 })), larguraMax: 26, passoRotulo: 40 });
        G.barrasH(a, { compacta: true, itens: R.acervo.pastas.map((x) => ({ rotulo: x.pasta, v: x.total, texto: `${f.n(x.total)} · ${f.n(x.ult30d)} em 30 d`, cor: 'var(--eletrico)' })) });
        b.appendChild(
          T.h(
            'table',
            { class: 'tabela-dados produziu' },
            T.h('thead', null, T.h('tr', null, ['O que o clube produziu', 'Quanto', 'Medida de quem viu'].map((x) => T.h('th', { scope: 'col' }, x)))),
            T.h('tbody', null, R.produziuXviu.map((x) => T.h('tr', null, T.h('th', { scope: 'row' }, x.oque), T.h('td', null, T.h('b', null, x.quanto)), T.h('td', { class: 'sem-medida' }, x.quemViu))))
          )
        );
      },
      leitura: `A produção subiu quando o alcance medido caiu — são coisas diferentes e uma não explica a outra. Nas duas últimas semanas entraram ${f.n(duasUltimas)} fotos no acervo e ${f.n(M.duasSemanas)} passaram pelo mural do telão; quantas pessoas isso alcançou, ninguém sabe.`,
      p: 50,
    });
  }

  function subQuemVe() {
    const ultima = dia(R.coleta[0] && R.coleta[0].ultima);
    if (!ultima) return null;
    return ultima === T.dados.diaMedido() ? `Tudo até ${f.data(ultima)} — a coleta diária rodou hoje.` : `Tudo até ${f.data(ultima)} — o último dia de coleta.`;
  }

  T.modulos.alcance = {
    titulo: 'Alcance',
    render(main) {
      main.append(
        T.pag.abertura(R, 'alcance', 'alcance', { regua: R.regua.linhas, explicas: [null, null, 'coleta', null] }),
        T.comp.secao({ id: 'instrumento', titulo: 'O instrumento que parou', sub: 'A falta de informação também é informação: aqui ela aparece como problema operacional.' }, T.comp.grade('', sensor())),
        T.comp.secao({ id: 'quem-ve', titulo: 'O que ainda se sabe sobre quem vê', sub: subQuemVe() }, T.comp.grade('', seguidores(), alcanceSemanal(), instagramDia(), comentarios(), producao())),
        T.pag.fecho(R, R.regua)
      );
    },
  };
})();
