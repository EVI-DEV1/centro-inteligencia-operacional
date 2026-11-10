(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const D = L.central;
  const f = T.fmt;
  const G = T.graf;
  const s = T.s;

  const EXTENSO = ['nenhuma', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
  const extenso = (n) => EXTENSO[n] || f.n(n);
  const maxDe = (serie) => (serie.length ? Math.max(...serie.map((p) => p.v)) : 0);
  const linhaBloqueada = () => D.numeros.find((n) => n.alerta && /bloquead/i.test(n.alerta)) || null;

  function fluxo() {
    const W = 1200;
    const H = 470;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'fluxo', role: 'group', 'aria-label': 'Fluxo da Central: mensagens entram pelos números de WhatsApp, viram conversas no bot, param em etapas, viram cadastro ou chamado humano.' });
    const numeros = D.numeros.filter((n) => n.conversas !== null);
    const maxConv = Math.max(...numeros.map((n) => n.conversas));
    const maxAtivas = Math.max(1, ...numeros.map((n) => n.ativas7d || 0));
    const colNumX = 24;
    const caixaW = 256;
    const botX = 430;
    const botY = 70;
    const botH = 330;

    svg.appendChild(s('text', { x: colNumX, y: 34, class: 'fluxo-titulo' }, 'Números de WhatsApp · conversas (ativas em 7 d)'));
    const pacotes = [];
    const yTop = 64;
    const passo = 62;
    numeros.forEach((n, i) => {
      const y = yTop + i * passo;
      const esp = 2 + (n.conversas / maxConv) * 16;
      const alvoY = botY + 40 + (i / (numeros.length - 1)) * (botH - 80);
      const risco = Boolean(n.alerta);
      const d = `M${colNumX + caixaW},${y}C${botX - 70},${y} ${botX - 60},${alvoY} ${botX},${alvoY}`;
      svg.appendChild(s('path', { d, class: ['fluxo-faixa', risco ? 'risco' : null], 'stroke-width': esp.toFixed(1) }));
      const g = s('g', { class: ['fluxo-numero', risco ? 'risco' : null], tabindex: 0 });
      g.appendChild(s('rect', { x: colNumX, y: y - 22, width: caixaW, height: 44, rx: 6, class: 'fluxo-caixa' }));
      g.appendChild(s('text', { x: colNumX + 12, y: y - 3, class: 'fluxo-nome' }, n.numero));
      g.appendChild(s('text', { x: colNumX + 12, y: y + 13, class: 'fluxo-sub' }, `${f.n(n.conversas)} conv. · ${f.n(n.ativas7d)} ativas · ${f.compacto(n.passageiros)} pass.`));
      if (risco) {
        const ic = s('svg', { x: colNumX + caixaW - 26, y: y - 16, width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'fluxo-cadeado' });
        ic.innerHTML = T.iconePath('cadeado');
        g.appendChild(ic);
      }
      T.dica.ligar(g, () =>
        T.dica.bloco(
          [
            { valor: f.n(n.conversas), rotulo: 'conversas nascidas neste número', cor: risco ? 'var(--agir)' : 'var(--eletrico)', forma: 'barra' },
            { valor: f.n(n.ativas7d), rotulo: 'com movimento nos últimos 7 dias', cor: 'var(--ciano)', forma: 'ponto' },
            { valor: f.n(n.passageiros), rotulo: 'leads pelo número atual da pessoa', cor: 'var(--tinta-3)', forma: 'ponto' },
            n.alerta ? { valor: '!', rotulo: n.alerta, cor: 'var(--agir)', forma: 'ponto' } : null,
          ].filter(Boolean),
          n.numero
        )
      );
      svg.appendChild(g);
      const npac = Math.round(((n.ativas7d || 0) / maxAtivas) * 5);
      for (let k = 0; k < npac; k++) {
        const c = s('circle', { r: 2.2, class: 'fluxo-pacote' });
        svg.appendChild(c);
        pacotes.push({ el: c, d, fase: k / Math.max(1, npac), vel: 0.12 });
      }
    });

    const estagio = (x, y, w, h, titulo, linhas, classe) => {
      const g = s('g', { class: ['fluxo-estagio', classe] });
      g.appendChild(s('rect', { x, y, width: w, height: h, rx: 10, class: 'fluxo-estagio-caixa' }));
      g.appendChild(s('text', { x: x + 16, y: y + 26, class: 'fluxo-estagio-titulo' }, titulo));
      linhas.forEach((l, i) => {
        const t = s('text', { x: x + 16, y: y + 62 + i * 34, class: 'fluxo-linha' });
        t.appendChild(s('tspan', { class: 'fluxo-linha-valor' }, l[0]));
        t.appendChild(s('tspan', { dx: 8, class: 'fluxo-linha-rotulo' }, l[1]));
        g.appendChild(t);
      });
      svg.appendChild(g);
      return g;
    };
    const pecaDe = (nome) => D.pecas.find((p) => p.peca === nome);
    const pMsg = pecaDe('Mensagem recebida');
    const pConv = pecaDe('Conversa (sessão)');
    const pico = D.mensagens.pico;
    const diaPico = (T.dados.serie('mensagens_dia').find((p) => !p.parcial && p.v === pico.v) || {}).d || pico.dia;
    const linhasBot = [
      pMsg ? [f.n(pMsg.registrado), `mensagens desde ${pMsg.desde}`] : null,
      D.kpis[0] ? [f.n(D.kpis[0].v), 'nos 7 dias completos'] : null,
      pConv ? [f.n(pConv.registrado), 'conversas'] : null,
      D.kpis[1] ? [f.n(D.kpis[1].v), 'novas em 7 dias'] : null,
      [f.n(D.conversasVivasSemana), 'vivas na semana'],
      [f.n(pico.v), diaPico ? `maior dia (${f.data(diaPico)})` : 'maior dia'],
      ['0', 'quedas registradas'],
    ];
    estagio(botX, botY, 190, botH, 'Bot · sessões', linhasBot.filter(Boolean), 'bot');

    const etX = botX + 250;
    const etW = 230;
    svg.appendChild(s('path', { d: `M${botX + 190},${botY + botH / 2}H${etX}`, class: 'fluxo-seta' }));
    const et = s('g', { class: 'fluxo-estagio etapas' });
    et.appendChild(s('rect', { x: etX, y: botY, width: etW, height: botH, rx: 10, class: 'fluxo-estagio-caixa' }));
    et.appendChild(s('text', { x: etX + 16, y: botY + 26, class: 'fluxo-estagio-titulo' }, `Onde as ${f.n(D.etapasResumo.comEtapa)} conversas pararam`));
    const outras = D.etapas.filter((e) => e.grupo === 'outras');
    const grupos = [
      { grupo: 'descanso', rotulo: 'descanso (MENU)', classe: 'descanso' },
      { grupo: 'lista', rotulo: 'lista de convidados', classe: 'gargalo' },
      { grupo: 'cadastro', rotulo: 'cadastro', classe: 'meio' },
      { grupo: 'lead', rotulo: 'lead — dados', classe: 'meio' },
      { grupo: 'outras', rotulo: outras.length === 1 ? outras[0].etapa : 'outras etapas', classe: 'meio' },
    ]
      .map((g2) => {
        const linhas = D.etapas.filter((e) => e.grupo === g2.grupo);
        return linhas.length ? { ...g2, v: T.soma(linhas) } : null;
      })
      .filter(Boolean);
    const totalEtapas = T.soma(grupos) || 1;
    let yy = botY + 44;
    const altUtil = botH - 76;
    let yRotulo = -Infinity;
    grupos.forEach((g2) => {
      const h = (g2.v / totalEtapas) * altUtil;
      const seg = s('rect', { x: etX + 16, y: yy, width: 18, height: Math.max(2, h - 2), rx: 2, class: ['fluxo-seg', g2.classe] });
      et.appendChild(seg);
      yRotulo = Math.max(yy + Math.max(12, h / 2 + 4), yRotulo + 17);
      if (yRotulo - (yy + h / 2) > 6) et.appendChild(s('path', { d: `M${etX + 36},${(yy + h / 2).toFixed(1)}L${etX + 42},${(yRotulo - 4).toFixed(1)}`, class: 'graf-guia' }));
      et.appendChild(s('text', { x: etX + 46, y: yRotulo, class: ['fluxo-seg-rotulo', g2.classe] }, `${f.n(g2.v)} ${g2.rotulo}`));
      yy += h;
    });
    svg.appendChild(et);

    const cadX = etX + etW + 60;
    svg.appendChild(s('path', { d: `M${etX + etW},${botY + 110}H${cadX}`, class: 'fluxo-seta' }));
    const comSinal = (v) => (v < 0 ? `−${f.n(-v)}` : f.n(v));
    const linhasCadastro = [
      ['Cadastro pelo bot de WhatsApp', 'pelo bot'],
      ['Cadastro à mão, no painel', 'à mão, no painel'],
      ['Exclusões depois de criados', 'exclusões'],
    ].map(([evento, rotulo]) => {
      const o = ((L.passageiros && L.passageiros.origem) || []).find((x) => x.evento === evento);
      return o ? [comSinal(o.v), rotulo] : null;
    });
    estagio(cadX, botY, 200, 150, 'Cadastro', linhasCadastro.filter(Boolean), 'cadastro');
    svg.appendChild(s('path', { d: `M${etX + etW},${botY + 250}H${cadX}`, class: 'fluxo-seta alerta' }));
    const ch = D.chamados;
    const abertosDia = T.dados.serie('chamados_abertos_dia');
    const janela = abertosDia.length && T.soma(abertosDia) === ch.abertos34d ? T.diasEntre(abertosDia[0].d, abertosDia[abertosDia.length - 1].d) + 1 : null;
    estagio(cadX, botY + 180, 200, 150, 'Suporte humano', [[f.n(ch.abertos34d), janela ? `chamados em ${f.n(janela)} dias` : 'chamados no total'], [f.n(ch.abertosAgora), 'abertos agora'], [`≥ ${f.n(ch.paradosMais48h)}`, 'há mais de 48 h']], 'humano');

    const marca = (x, y, texto) => {
      const g = s('g', { class: 'fluxo-gargalo', transform: `translate(${x},${y})` });
      g.appendChild(s('circle', { r: 11, class: 'fluxo-gargalo-disco' }));
      g.appendChild(s('text', { y: 4, 'text-anchor': 'middle', class: 'fluxo-gargalo-ex' }, '!'));
      g.appendChild(s('text', { x: 18, y: 4, class: 'fluxo-gargalo-texto' }, texto));
      svg.appendChild(g);
    };
    marca(etX + 18, botY + botH + 32, 'é na lista que mais se desiste');
    marca(cadX + 18, botY + botH + 32, 'o que não tem dono automático fica parado');

    if (!T.mov.reduzido && pacotes.length) {
      const caminhos = pacotes.map((p) => {
        const tmp = s('path', { d: p.d });
        svg.appendChild(tmp);
        const len = tmp.getTotalLength ? null : 0;
        return { ...p, tmp, len };
      });
      const parar = T.mov.laco((t) => {
        for (const p of caminhos) {
          if (p.len === null) p.len = p.tmp.getTotalLength();
          const k = ((t / 1000) * p.vel + p.fase) % 1;
          const pt = p.tmp.getPointAtLength(k * p.len);
          p.el.setAttribute('cx', pt.x.toFixed(1));
          p.el.setAttribute('cy', pt.y.toFixed(1));
        }
      });
      caminhos.forEach((p) => p.tmp.setAttribute('class', 'fluxo-oculto'));
      T.aoSair(parar);
    } else pacotes.forEach((p) => p.el.remove());

    return G.painel({
      id: 'fluxo',
      titulo: 'O gargalo não é o software',
      comoLer: 'Da esquerda para a direita: números de WhatsApp (espessura = conversas; pulsos = conversas ativas na semana), o bot, as etapas onde as conversas estão paradas, o cadastro e o suporte humano. Cada caixa tem a sua unidade — só as faixas dos números são proporcionais entre si.',
      largura: 3,
      grafico: (el) => el.appendChild(T.h('div', { class: 'fluxo-host' }, svg)),
      leitura: D.frase,
      nota: D.numerosCuidado,
      p: [28, 29, 30, 31, 33],
    });
  }

  function capacidade() {
    const cap = D.capacidade;
    const cenarios = cap.cenarios.map((c) => c.replace(/\s*mil$/, ''));
    const listaCenarios = cenarios.length > 1 ? `${cenarios.slice(0, -1).join(', ')} e ${cenarios[cenarios.length - 1]} mil` : `${cenarios[0] || ''} mil`;
    return G.painel({
      id: 'capacidade',
      titulo: 'Capacidade provada × capacidade exigida',
      comoLer: `Barra = o maior dia que cada elo já registrou (um dia, não uma rotina). Traços vermelhos = o que a última semana exigiria por dia para ${listaCenarios} cadastros. Cada elo tem a sua própria régua.`,
      largura: 2,
      grafico: (el) => G.capacidade(el, { elos: cap.elos, cenarios: cap.cenarios }),
      leitura: `${cap.leitura} ${cap.numeroParaAMesa}`,
      nota: cap.premissa,
      p: 32,
    });
  }

  function ensaio() {
    const e = D.ensaioDisparo;
    const dia = D.mensagens.pico.dia;
    const recordes = [
      [e.medido.mensagens, 'mensagens_dia'],
      [e.medido.conversasNovas, 'conversas_novas_dia'],
      [e.medido.chamados, 'chamados_abertos_dia'],
    ].filter(([v, nome]) => v >= maxDe(T.dados.serie(nome))).length;
    const recordeTexto = recordes === 3 ? ' · recorde nos três' : recordes > 0 ? ` · recorde em ${recordes === 1 ? 'um' : 'dois'} dos três` : '';
    return G.painel({
      titulo: `O disparo de ${f.data(dia)} — o único dia em que a rede fria foi posta à prova`,
      comoLer: 'O que o banco confirma hoje, separado do que é memória (o disparo em si não foi gravado).',
      largura: 1,
      grafico: (el) =>
        el.append(
          T.h(
            'div',
            { class: 'ensaio' },
            T.h('p', { class: 'sub-titulo leitura' }, `Medido no banco em ${f.data(T.dados.diaMedido())}${recordeTexto}`),
            T.h(
              'div',
              { class: 'ensaio-medido' },
              [[f.n(e.medido.mensagens), 'mensagens'], [f.n(e.medido.conversasNovas), 'conversas novas'], [f.n(e.medido.chamados), 'chamados']].map(([v, r]) => T.h('div', null, T.h('b', { class: 'num' }, v), T.h('small', null, r)))
            ),
            T.h('p', { class: 'sub-titulo leitura ensaio-memoria-rotulo' }, T.icone('info'), 'Memória, não medido'),
            T.h('p', { class: 'ensaio-memoria' }, e.memoria),
            T.h('p', { class: 'nota-pequena' }, e.cuidado)
          )
        ),
      p: 32,
    });
  }

  function mensagens() {
    const serie = T.dados.serie('mensagens_dia');
    const maxDia = maxDe(serie);
    const cap = D.capacidade;
    const eloMsg = cap.elos.find((x) => x.elo === 'Mensagens recebidas por dia');
    const ref = eloMsg && eloMsg.exige.length ? { v: eloMsg.exige[0], rotulo: `${f.n(eloMsg.exige[0])}/dia — exigido no cenário de ${cap.cenarios[0]}`, cor: 'var(--agir)' } : null;
    const completos = serie.filter((p) => !p.parcial).length;
    const inicio = serie.length ? f.data(serie[0].d) : '—';
    const vezes = ref && maxDia ? ref.v / maxDia : null;
    return G.painel({
      titulo: 'Mensagens recebidas por dia, na régua da última semana',
      comoLer: `Toda mensagem que a Meta entrega ao sistema. O registro começa em ${inicio}.${ref ? ` A linha vermelha é o que o cenário de ${cap.cenarios[0]} exigiria por dia.` : ''}`,
      largura: 2,
      grafico: (el) =>
        G.barrasDia(el, {
          serie,
          altura: 250,
          yMax: Math.max(maxDia, ref ? ref.v : 0) * 1.08,
          nome: 'mensagens',
          rotuloSe: (p) => p.v === maxDia || p.parcial,
          referencias: ref ? [ref] : [],
          cor: (p) => (p.v === maxDia ? 'var(--ciano)' : 'var(--eletrico)'),
        }),
      leitura: `Nos ${f.n(completos)} dias completos a mediana é ${f.n(D.mensagens.mediana24dias)}, e a última semana completa ficou em ${f.n(D.mensagens.mediaUltimaSemana)} por dia. O maior dia já processado (${f.n(maxDia)}) é ${vezes ? `${f.n(vezes, 1)} vezes menor que` : 'comparado a'} o que o cenário mais modesto pediria. Se o volume triplicar, o primeiro a quebrar não é o bot — é a fila de chamados que ele gera.`,
      p: [29, 32],
      tabela: { colunas: ['Dia', 'Mensagens'], linhas: serie.map((p) => [f.data(p.d), f.n(p.v)]) },
    });
  }

  function conversas() {
    const novas = T.dados.serie('conversas_novas_dia');
    const falas = T.dados.serie('falas_dia');
    const picos = D.conversasNovasPico;
    const totalConv = T.soma(novas);
    const somaPicos = T.soma(picos);
    const diasPicos = picos.map((p) => f.data(p.dia));
    const inicioFalas = falas.length ? f.data(falas[0].d) : '—';
    const fp = D.falas.pico;
    const limiarRotulo = picos.length ? Math.min(...picos.map((p) => p.v)) * 0.9 : maxDe(novas);
    return G.painel({
      titulo: 'Conversas novas e falas',
      comoLer: `Conversas novas por dia (telefones que apareceram pela primeira vez num número) e, embaixo, as falas — o texto escrito, guardado só desde ${inicioFalas}.`,
      largura: 1,
      grafico: (el) => {
        const a = T.h('div');
        const b = T.h('div');
        el.append(a, T.h('p', { class: 'sub-titulo leitura' }, `Falas por dia (desde ${inicioFalas} — antes não existe registro)`), b);
        G.barrasDia(a, { serie: novas, altura: 160, nome: 'conversas novas', rotuloSe: (p) => p.v >= limiarRotulo, divisoes: 3 });
        G.colunas(b, { altura: 140, todosValores: true, nome: 'falas por dia', itens: falas.map((p) => ({ rotulo: f.data(p.d), v: p.v, cor: p.parcial ? 'var(--parcial)' : 'var(--eletrico)' })), larguraMax: 26 });
      },
      leitura: `${diasPicos.join(' e ')} abrem ${f.n(somaPicos)} das ${f.n(totalConv)} conversas da série inteira. As falas mostram poucas dezenas de pessoas escrevendo muito (${f.n(fp.v)} falas de ${f.n(fp.telefones)} telefones em ${f.data(fp.dia)}), não milhares escrevendo pouco.`,
      p: 29,
    });
  }

  function etapas() {
    const er = D.etapasResumo;
    const maiorBolso = er.naLista > er.noMeio - er.naLista;
    const confirmacao = D.falasPorEtapa.find((e) => /^(LEAD|PASSAGEIRO) — conf/.test(e.etapa));
    return G.painel({
      id: 'etapas',
      titulo: 'A perda tem endereço: a montagem da lista',
      comoLer: 'Onde cada conversa está parada. Cinza = descanso (não é perda). Vermelho = etapas da lista de convidados. À direita, as que tiveram movimento em 7 dias.',
      largura: 1,
      grafico: (el) => {
        G.barrasH(el, {
          compacta: true,
          itens: D.etapas.map((e) => ({ rotulo: e.etapa, v: e.v, texto: `${f.n(e.v)} · ${f.n(e.ativas7d)} ativas`, cor: e.grupo === 'descanso' ? 'var(--referencia)' : e.grupo === 'lista' ? 'var(--agir)' : 'var(--eletrico)' })),
        });
        el.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Sobre o que as pessoas escrevem (falas por etapa)'));
        G.barrasH(el, { compacta: true, itens: D.falasPorEtapa.map((e) => ({ rotulo: e.etapa, v: e.v, texto: f.n(e.v), cor: /^(LEAD|PASSAGEIRO) — conf/.test(e.etapa) ? 'var(--ciano)' : 'var(--eletrico)' })) });
      },
      leitura: `${f.n(er.naLista)} das ${f.n(er.comEtapa)} conversas pararam no meio da lista de convidados${maiorBolso ? ' — mais do que todas as outras etapas fora do descanso somadas' : ''}.${confirmacao ? ` E ${f.pct(D.falasConfirmacaoPct)} de tudo o que se escreve acontece na confirmação de lead: é ali que uma resposta automática errada custa um cadastro.` : ''}`,
      p: 30,
    });
  }

  function numeros() {
    const bloq = linhaBloqueada();
    const pctBloq = bloq && L.pilotos && Array.isArray(L.pilotos.whatsappProducao) ? (L.pilotos.whatsappProducao.find((x) => x.numero === bloq.numero) || {}).pct : null;
    const totalPass = T.soma(D.numeros, (n) => n.passageiros || 0);
    const pct = pctBloq !== null && pctBloq !== undefined ? pctBloq : bloq && totalPass ? (bloq.passageiros / totalPass) * 100 : null;
    const dataVerif = bloq ? (bloq.alerta.match(/\d{2}\/\d{2}/) || [])[0] : null;
    return G.painel({
      id: 'numeros',
      titulo: 'Dois números carregam a entrada — e um deles não inicia conversa',
      comoLer: 'Conversas nascidas em cada número, as vivas na semana e os leads pelo número atual da pessoa.',
      largura: 1,
      grafico: (el) =>
        el.appendChild(
          T.h(
            'div',
            { class: 'tabela-rolagem' },
            T.h(
              'table',
              { class: 'tabela-dados' },
              T.h('thead', null, T.h('tr', null, ['Número', 'Conversas', 'Ativas 7 d', 'Leads'].map((x) => T.h('th', { scope: 'col' }, x)))),
              T.h(
                'tbody',
                null,
                D.numeros.map((n) =>
                  T.h(
                    'tr',
                    { class: n.alerta ? 'risco' : null },
                    T.h('th', { scope: 'row' }, n.numero, n.alerta ? T.h('small', null, T.icone('cadeado'), n.alerta) : null),
                    T.h('td', null, n.conversas === null ? '—' : f.n(n.conversas)),
                    T.h('td', null, n.ativas7d === null ? '—' : f.n(n.ativas7d)),
                    T.h('td', null, T.h('b', null, f.n(n.passageiros)))
                  )
                )
              )
            )
          )
        ),
      leitura: bloq
        ? `O ${bloq.numero} aparece em ${f.pct(pct)} dos leads e reúne ${f.n(bloq.ativas7d)} das ${f.n(D.conversasVivasSemana)} conversas vivas. Regularizar o pagamento e confirmar o estado real da conta leva horas e destrava o canal de maior volume.`
        : `As ${f.n(D.conversasVivasSemana)} conversas vivas da semana se repartem entre os números da tabela.`,
      nota: bloq ? `O bloqueio vem da verificação${dataVerif ? ` de ${dataVerif}` : ''}, não conferida no livro.` : null,
      p: [30, 33],
    });
  }

  function chamados() {
    const abertos = T.dados.serie('chamados_abertos_dia');
    const fechados = T.dados.serie('chamados_fechados_dia');
    const med = T.dados.serie('chamados_mediana_h_dia');
    const ch = D.chamados;
    const maxAbertos = maxDe(abertos);
    const maxFechados = maxDe(fechados);
    const yMaxDia = Math.max(maxAbertos, maxFechados) * 1.08;
    const diaLimpeza = (fechados.find((p) => p.v === ch.limpezaFila.fechamentos) || {}).d;
    const ult2 = abertos.slice(-2);
    let notaParados = null;
    if (ult2.length === 2) {
      const [d1, d2] = [ult2[0].d, ult2[1].d];
      const dias = d1.slice(5, 7) === d2.slice(5, 7) ? `${d1.slice(8, 10)} e ${f.data(d2)}` : `${f.data(d1)} e ${f.data(d2)}`;
      const n2 = T.soma(ult2);
      notaParados = `Só ${f.n(n2)} ${n2 === 1 ? 'chamado foi aberto' : 'chamados foram abertos'} em ${dias}: pelo menos ${f.n(ch.paradosMais48h)} dos ${f.n(ch.abertosAgora)} abertos estão parados há mais de 48 h.`;
    }
    const janela = abertos.length ? T.diasEntre(abertos[0].d, abertos[abertos.length - 1].d) + 1 : null;
    const faixas = ch.tempoAteFechar;
    const rapido = faixas[0];
    const lento = faixas[faixas.length - 1];
    const pctDe = (v) => (ch.fechados ? (v / ch.fechados) * 100 : null);
    return G.painel({
      id: 'chamados',
      titulo: 'Quando o bot não basta: o atendimento humano fecha rápido ou não fecha',
      comoLer: 'Abertos e fechados por dia em gráficos separados (mesma escala); a mediana de horas até fechar tem régua própria, embaixo.',
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-3' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        const c = T.h('div');
        grade.append(a, b, c);
        a.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Chamados abertos por dia'));
        const a1 = T.h('div');
        a.appendChild(a1);
        G.barrasDia(a1, { serie: abertos, altura: 130, yMax: yMaxDia, nome: 'abertos', cor: (p) => (p.v === maxAbertos ? 'var(--ciano)' : 'var(--eletrico)'), rotuloSe: (p) => p.v === maxAbertos, divisoes: 2 });
        a.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Fechados por dia (${f.n(ch.limpezaFila.fechamentos)}${diaLimpeza ? ` em ${f.data(diaLimpeza)}` : ''} = limpeza de fila)`));
        const a2 = T.h('div');
        a.appendChild(a2);
        G.barrasDia(a2, { serie: fechados, altura: 130, yMax: yMaxDia, nome: 'fechados', cor: (p) => (p.v === maxFechados ? 'var(--violeta)' : 'var(--referencia)'), rotuloSe: (p) => p.v === maxFechados, divisoes: 2 });
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Tempo até fechar (${f.n(ch.fechados)} fechados)`));
        const b1 = T.h('div');
        b.appendChild(b1);
        G.colunas(b1, { altura: 170, todosValores: true, nome: 'tempo até fechar', itens: faixas.map((x) => ({ rotulo: x.faixa, v: x.v, cor: x.alerta ? 'var(--agir)' : 'var(--eletrico)' })), larguraMax: 30 });
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Mediana de horas até fechar, nos dias com fechamento'));
        const b2 = T.h('div');
        b.appendChild(b2);
        G.colunas(b2, { altura: 120, nome: 'mediana de horas', formato: (v) => f.h(v, 0), formatoDica: (v) => f.h(v), unidade: 'mediana até fechar', itens: med.map((m) => ({ rotulo: f.data(m.d), v: m.h, cor: m.h > 72 ? 'var(--agir)' : 'var(--referencia)', destaque: m.h > 200 })), larguraMax: 10, ar: 3, passoRotulo: 46 });
        c.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Por tipo e estado'));
        c.appendChild(
          T.h(
            'table',
            { class: 'tabela-dados' },
            T.h('thead', null, T.h('tr', null, ['Tipo', 'Estado', 'Total', 'Abertos hoje'].map((x) => T.h('th', { scope: 'col' }, x)))),
            T.h('tbody', null, ch.tipos.map((t) => T.h('tr', { class: t.estado === 'aberto' ? 'aberto' : null }, T.h('th', { scope: 'row' }, t.tipo), T.h('td', null, t.estado), T.h('td', null, f.n(t.total)), T.h('td', null, t.abertosHoje === null ? '—' : T.h('b', null, f.n(t.abertosHoje))))))
          )
        );
        if (notaParados) c.appendChild(T.h('p', { class: 'nota-pequena' }, notaParados));
      },
      leitura: `${f.n(ch.abertos34d)} abertos${janela ? ` em ${f.n(janela)} dias` : ''} e ${f.n(ch.fechados)} fechados. ${f.n(rapido.v)} (${f.pct(pctDe(rapido.v))}) fecham em até 1 hora e ${f.n(lento.v)} (${f.pct(pctDe(lento.v))}) levam mais de 3 dias: duas populações, o que se resolve na hora e o que fica esquecido. ${ch.leitura}`,
      p: 31,
    });
  }

  function chat() {
    const autores = T.dados.serie('chat_chamado_autor_dia');
    const nomes = { piloto: 'pessoa', controlador: 'admin', administrador: 'administrador', bot: 'bot (automático)' };
    const todos = Object.values(autores).flat();
    const total = T.soma(todos);
    const pontosBot = autores.bot || [];
    const maxBot = maxDe(pontosBot);
    const diaBot = (pontosBot.find((p) => p.v === maxBot) || {}).d;
    const fechadosNoDia = diaBot ? (T.dados.serie('chamados_fechados_dia').find((p) => p.d === diaBot) || {}).v : null;
    const primeiro = pontosBot[0] || todos[0];
    const ultimo = pontosBot[pontosBot.length - 1] || todos[todos.length - 1];
    const janela = primeiro && ultimo ? T.diasEntre(primeiro.d, ultimo.d) + 1 : null;
    const fraseBot = diaBot
      ? fechadosNoDia === maxBot
        ? ` O pico do bot em ${f.data(diaBot)} (${f.n(maxBot)}) cai exatamente sobre os ${f.n(fechadosNoDia)} fechamentos do mesmo dia — aviso automático de fechamento em lote.`
        : ` O pico do bot é em ${f.data(diaBot)} (${f.n(maxBot)}).`
      : '';
    return G.painel({
      titulo: 'O chat dentro do chamado quase não vira conversa',
      comoLer: 'Mensagens por dia dentro dos chamados, por quem escreveu. Mesma escala nos quatro.',
      largura: 3,
      grafico: (el) => G.pequenos(el, { tipo: 'barras', colunas: 4, altura: 110, yMax: Math.max(1, ...todos.map((p) => p.v)) * 1.08, quadros: Object.entries(autores).map(([k, pontos]) => ({ titulo: nomes[k] || k, resumo: f.n(T.soma(pontos)), pontos, cor: k === 'bot' ? 'var(--violeta)' : 'var(--eletrico)' })) }),
      leitura: `${f.n(total)} mensagens${janela ? ` em ${f.n(janela)} dias` : ''}.${fraseBot} O combinado de verdade acontece no WhatsApp pessoal.`,
      p: 31,
    });
  }

  function pilotosBot() {
    const ativos = L.pilotos.funil.find((d) => d.id === 'ativos');
    const canal = L.pilotos.funil.find((d) => d.id === 'canal');
    const nunca = D.pilotoFalouBot.find((x) => x.vazio);
    const hoje = D.pilotoFalouBot[0];
    const inicioGuarda = T.dados.serie('mensagens_dia')[0];
    const partes = [
      nunca && ativos ? `${f.n(nunca.v)} das ${f.n(ativos.v)} pessoas ativas não têm mensagem guardada${hoje && !hoje.vazio ? ` e só ${f.n(hoje.v)} falaram hoje` : ''}.` : null,
      inicioGuarda ? `A guarda começou em ${f.data(inicioGuarda.d)}${canal ? `; o funil conta ${f.n(canal.v)} por outro caminho (sessão aberta alguma vez)` : ''}.` : null,
    ];
    return G.painel({
      titulo: 'Há quanto tempo cada pessoa falou com o bot',
      comoLer: `Os ${ativos ? `${f.n(ativos.v)} ` : ''}pessoas ativas pela última mensagem guardada. Hachura = nunca falou (nada guardado).`,
      largura: 1,
      grafico: (el) => G.colunas(el, { altura: 190, todosValores: true, nome: 'última fala com o bot', itens: D.pilotoFalouBot.map((x) => ({ rotulo: x.faixa.replace('há ', '').replace(' dias', ' d').replace('nunca falou (sem registro)', 'nunca').replace('falou hoje', 'hoje').replace('mais de 14 d', '>14 d'), rotuloLongo: x.faixa, v: x.v, cor: x.vazio ? 'var(--agir)' : 'var(--eletrico)', textura: x.vazio })), larguraMax: 32 }),
      leitura: partes.filter(Boolean).join(' '),
      p: 28,
    });
  }

  function acoes() {
    return T.h(
      'div',
      { class: 'muda acoes-ordem', 'data-revela': '' },
      T.h('h3', { class: 'bloco-titulo' }, T.icone('agir'), `As ${extenso(D.acoes.length)} coisas que este capítulo manda fazer, em ordem de urgência`),
      T.h('ol', { class: 'muda-lista' }, D.acoes.map((a) => T.h('li', null, T.h('h4', null, a.acao), T.h('p', null, a.porque))))
    );
  }

  T.modulos.central = {
    titulo: 'Central',
    render(main) {
      main.append(
        T.pag.abertura(D, 'central', 'central', { regua: D.reguaFaseB.linhas, explicas: D.kpis.map(() => null) }),
        T.comp.secao({ id: 'sistema', titulo: 'O sistema por dentro', sub: 'Por onde entra, onde para, o que aguenta.' }, T.comp.grade('', fluxo(), capacidade(), ensaio())),
        T.comp.secao({ id: 'volume', titulo: 'Quanto a Central conversa', sub: 'Mensagens, conversas, falas, etapas e números.' }, T.comp.grade('', mensagens(), conversas(), etapas(), numeros(), pilotosBot())),
        T.comp.secao({ id: 'humano', titulo: 'O atendimento humano', sub: 'Chamados abertos, tempo até fechar e o chat dentro deles.' }, T.comp.grade('', chamados(), chat())),
        T.comp.secao(
          { id: 'regua', titulo: 'Fase B: o que instrumentar antes de apertar o acelerador', sub: 'Carimbos de tempo e uma leitura do painel da Meta. Sem eles, "o bot aguenta" é opinião.', classe: 'secao-fecho' },
          T.h('div', { class: 'fecho-grade' }, acoes(), T.comp.naoMede(D.naoMede)),
          T.comp.regua(D.reguaFaseB.linhas, D.reguaFaseB.nota),
          T.comp.muda(D.muda)
        )
      );
    },
  };
})();
