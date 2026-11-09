(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const B = L.passageiros;
  const f = T.fmt;
  const G = T.graf;

  const DIA_LONGO = { dom: 'domingo', seg: 'segunda', ter: 'terça', qua: 'quarta', qui: 'quinta', sex: 'sexta', 'sáb': 'sábado' };
  const FAMILIA_FRIA = 'Rota 20';
  const FAMILIA_LIDERANCA = 'Embaixadas';
  const ativosPilotos = () => {
    const d = L.pilotos.funil.find((x) => x.id === 'ativos');
    return d ? d.v : null;
  };
  const melhorDia = () => T.dados.serie('passageiros_dia').reduce((a, p) => (!a || p.v > a.v ? p : a), null);
  const faixaSemana = (iso) => `${iso.slice(8, 10)}–${f.data(T.isoSomar(iso, 6))}`;
  const nomeCurto = (familia) => String(familia || '').split(' — ')[0];

  function cenarios() {
    const c = T.dados.cenarios();
    const meta = c.metaDeclarada;
    const d7 = L.meta.d7;
    const diaD = L.meta.diaD;
    const cabe = B.cenarios.linhas.some((l) => l.emDiaD >= meta);
    const conta = String((L.tresNumeros.metaDeclarada || {}).conta || '')
      .replace(/[^\d.,×\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const topoY = Math.ceil((Math.max(meta, c.projetada, ...B.cenarios.linhas.map((l) => l.emDiaD)) * 1.05) / 10000) * 10000;
    const corpo = T.h('div');
    G.linhas(corpo, {
      nome: 'Do primeiro dia da base até o Dia D',
      altura: 400,
      x0: T.dados.serie('passageiros_dia')[0].d,
      x1: diaD,
      yMax: topoY,
      margemDir: 150,
      formatoEixo: f.compacto,
      faixas: [
        { de: T.isoSomar(T.dados.diaMedido(), 1), ate: d7, classe: 'fase-a', rotulo: 'Fase A · preparação', rotuloTopo: true },
        { de: T.isoSomar(d7, 1), ate: diaD, classe: 'fase-b', rotulo: 'Surto + Dia D', rotuloTopo: true },
      ],
      referencias: [
        { v: meta, rotulo: `meta declarada ${f.n(meta)}${conta ? ` (${conta})` : ''}`, cor: 'var(--tinta-2)' },
        { v: c.projetada, rotulo: `Projetada do painel ${f.n(c.projetada)} — soma de fichas`, cor: 'var(--referencia)' },
      ],
      marcadores: [
        { d: T.estado.hoje.iso, rotulo: 'hoje', classe: 'hoje' },
        { d: d7, rotulo: 'D-7' },
      ],
      series: [
        { nome: 'registrado', pontos: c.registrado, cor: 'var(--eletrico)', largura: 2.6, rotuloFim: true, valorFim: f.n(B.cenarios.registrado) },
        { nome: 'linha reta no ritmo atual', pontos: c.reta, cor: 'var(--referencia)', tracejado: true, rotuloFim: true, pontoFim: false },
        ...c.linhas.map((l, i) => ({ nome: l.limite ? `${l.nome} (teto da conta)` : `${l.nome} · captura ${l.captura}%`, pontos: l.pontos, cor: l.limite ? 'var(--tinta-3)' : `var(--cen-${i + 1})`, tracejado: l.limite, rotuloFim: true, largura: l.limite ? 1.2 : 2 })),
      ],
    });
    return G.painel({
      id: 'cenarios',
      titulo: cabe ? `A meta de ${f.n(meta)} diante da conta da própria equipe` : `A meta de ${f.n(meta)} não cabe na conta da própria equipe`,
      comoLer: `Violeta: o registrado, somado dia a dia. Tracejado: o ritmo atual esticado até ${f.data(diaD)}. Tons de violeta a ciano: os três cenários da equipe com o 20/80; cinza tracejado: o teto da conta, com captura de 100%. As linhas horizontais são referências, não previsões.`,
      largura: 3,
      grafico: (el) => {
        el.appendChild(corpo);
        el.appendChild(
          T.h(
            'div',
            { class: 'conta-aberta' },
            T.h('p', { class: 'leitura' }, 'A conta de cada cenário, aberta'),
            T.h('p', { class: 'conta-formula' }, B.cenarios.nota),
            T.h(
              'div',
              { class: 'tabela-rolagem' },
              T.h(
                'table',
                { class: 'tabela-dados' },
                T.h('thead', null, T.h('tr', null, ['Cenário', 'Ritmo/dia', `Base ${f.data(d7)}`, 'Captura', 'Reg./dia no surto', '× melhor dia', `Em ${f.data(diaD)}`, '% meta'].map((x) => T.h('th', { scope: 'col' }, x)))),
                T.h(
                  'tbody',
                  null,
                  B.cenarios.linhas.map((l, i) =>
                    T.h(
                      'tr',
                      { class: l.limite ? 'limite' : null },
                      T.h('th', { scope: 'row' }, T.h('i', { class: 'chave-linha', style: { '--c': l.limite ? 'var(--tinta-3)' : `var(--cen-${i + 1})` } }), l.nome),
                      T.h('td', null, f.n(l.ritmo)),
                      T.h('td', null, f.n(l.baseD7)),
                      T.h('td', null, f.pct(l.captura, 0)),
                      T.h('td', null, f.n(l.regDiaSurto)),
                      T.h('td', null, f.x(l.xMelhorDia)),
                      T.h('td', null, T.h('b', null, f.n(l.emDiaD))),
                      T.h('td', null, f.pct(l.pctMeta))
                    )
                  )
                )
              )
            )
          )
        );
      },
      leitura: B.cenarios.leitura,
      nota: B.cenarios.cuidado,
      p: 15,
    });
  }

  function ritmo() {
    const serie = T.dados.serie('passageiros_dia');
    const parcial = serie.find((p) => p.parcial);
    const melhor = melhorDia();
    const limiar = Math.max(50, Math.floor((melhor.v * 0.7) / 50) * 50);
    return G.painel({
      id: 'ritmo',
      titulo: `O ritmo não sobe: ~${f.n(B.cenarios.ritmoAtual)} por dia há um mês`,
      comoLer: `Leads cadastrados por dia; a linha é a média dos 7 dias. Só os dias com ${f.n(limiar)} ou mais levam número.${parcial ? ` Lilás claro: ${f.data(parcial.d)}, incompleto.` : ''}`,
      largura: 3,
      grafico: (el) =>
        G.barrasDia(el, {
          serie,
          altura: 250,
          nome: 'passageiros',
          rotuloSe: (p) => p.v >= limiar && !p.parcial,
          linhas: [{ nome: 'média de 7 dias', pontos: T.dados.mm7(), cor: 'var(--atencao)', largura: 2 }],
        }),
      legenda: [
        { rotulo: 'leads no dia', cor: 'var(--eletrico)' },
        { rotulo: 'média de 7 dias', cor: 'var(--atencao)', forma: 'linha' },
        { rotulo: 'dia incompleto', cor: 'var(--parcial)' },
      ],
      leitura: B.ritmoLeitura,
      p: 14,
      tabela: { colunas: ['Dia', 'Leads'], linhas: serie.map((p) => [f.data(p.d), f.n(p.v)]) },
    });
  }

  function pilotosDia() {
    const serie = T.dados.serie('pilotos_distintos_dia');
    const prod = T.dados.produtividadeDia();
    const ativos = ativosPilotos();
    const rec = B.recordePilotosDia || { v: Math.max(...serie.map((p) => p.v)) };
    const recorde = rec.v;
    return G.painel({
      titulo: 'O termômetro: quantas pessoas cadastram no mesmo dia',
      comoLer: `Pessoas distintas que gravaram ao menos um nome no dia${ativos === null ? '' : ` (de ${f.n(ativos)} ativos)`}. Embaixo, em gráfico separado: registros por pessoa que cadastrou.`,
      largura: 1,
      grafico: (el) => {
        const a = T.h('div');
        const b = T.h('div', { class: 'sub-grafico' });
        el.append(a, T.h('p', { class: 'sub-titulo leitura' }, 'Registros por pessoa que cadastrou no dia'), b);
        G.barrasDia(a, { serie, altura: 170, nome: 'pessoas distintas', cor: (p) => (p.v === recorde ? 'var(--ciano)' : 'var(--eletrico)'), referencias: [{ v: recorde, rotulo: `recorde ${f.n(recorde)}`, cor: 'var(--ciano)' }], divisoes: 3 });
        G.barrasDia(b, { serie: prod, altura: 120, nome: 'registros por pessoa', formatoDica: (v) => f.n(v, 1), cor: () => 'var(--referencia)', divisoes: 2 });
      },
      leitura: rec.dia
        ? `O recorde é recente — ${f.n(recorde)} pessoas em ${f.data(rec.dia)} — e não passa de ${f.pct(rec.pctAtivos)} dos ativos. Quem cadastra grava quase sempre perto de ${f.n(B.produtividade7d)} nomes por dia (${f.nFlex(B.produtividade7d)} nos últimos 7): o total cresce com mais pessoas no mesmo dia, não com mais produtividade de cada um.`
        : null,
      p: 14,
    });
  }

  function semanas() {
    const topo = B.semanas.reduce((a, s) => (!a || s.v > a.v ? s : a), null);
    const ultima = B.semanas[B.semanas.length - 1];
    const fechadas = B.semanas.filter((s) => !s.aberta);
    const ultimaFechada = fechadas[fechadas.length - 1];
    const titulo = !topo ? 'Por semana' : topo === ultima ? `Por semana: a de ${f.data(topo.semana)} é a maior até agora` : `Por semana: nenhuma superou a de ${f.data(topo.semana)}`;
    const aberta = B.semanas.find((s) => s.aberta);
    const n = aberta ? aberta.diasMedidos : null;
    return G.painel({
      titulo,
      comoLer: `Soma dos dias de cada semana (segunda a domingo).${aberta && typeof n === 'number' ? ` A semana de ${f.data(aberta.semana)} tem ${f.n(n)} ${n === 1 ? 'dia medido' : 'dias medidos'}.` : ''}`,
      largura: 1,
      grafico: (el) => G.colunas(el, { altura: 190, todosValores: true, nome: 'leads por semana', itens: B.semanas.map((s) => ({ rotulo: f.data(s.semana), v: s.v, cor: s.aberta ? 'var(--parcial)' : 'var(--eletrico)' })), larguraMax: 44 }),
      leitura:
        topo && ultimaFechada && topo !== ultimaFechada
          ? `Nenhuma semana voltou aos ${f.n(topo.v)} cadastros de ${faixaSemana(topo.semana)}; a última fechada somou ${f.n(ultimaFechada.v)}. Em ${f.n(B.semanas.length)} semanas o volume semanal não encontrou um degrau novo.`
          : null,
      p: 14,
    });
  }

  function exigencia() {
    const linhas = B.cenarios.linhas.filter((l) => !l.limite);
    const melhor = melhorDia();
    const oti = linhas.find((l) => l.id === 'otimista');
    const med = linhas.find((l) => l.id === 'medio');
    const hm = B.horaMaisCheia;
    const d7 = L.meta.d7;
    return G.painel({
      titulo: 'O que cada cenário exige por dia na última semana',
      comoLer: `A parte do resultado que cai entre ${f.data(T.isoSomar(d7, 1))} e ${f.data(L.meta.diaD)}, dividida por 7 dias. A barra cinza é o melhor dia que a operação já registrou.`,
      largura: 1,
      grafico: (el) =>
        G.barrasH(el, {
          max: Math.max(...linhas.map((l) => l.regDiaSurto), melhor ? melhor.v : 0),
          itens: [
            ...linhas
              .slice()
              .reverse()
              .map((l) => ({ rotulo: `${l.nome} (${l.captura}%)`, v: l.regDiaSurto, texto: `${f.n(l.regDiaSurto)}/dia · ${f.x(l.xMelhorDia)}`, cor: l.id === 'otimista' ? 'var(--cen-3)' : l.id === 'medio' ? 'var(--cen-2)' : 'var(--cen-1)' })),
            melhor ? { rotulo: 'Melhor dia já registrado', sub: f.data(melhor.d), v: melhor.v, texto: f.n(melhor.v), cor: 'var(--referencia)' } : null,
          ].filter(Boolean),
        }),
      leitura:
        oti && med && hm
          ? `O otimista pede ${f.n(oti.regDiaSurto)} registros por dia, sete dias seguidos — ${f.x(oti.xMelhorDia)} o melhor dia que a base já viu. Um único dia de ${f.n(med.regDiaSurto)}, o do cenário médio, precisaria de ${f.n(Math.ceil(med.regDiaSurto / hm.v))} horas iguais à mais cheia dos últimos 14 dias (${f.n(hm.v)}, ${hm.quando}); o dia tem 24.`
          : null,
      p: [15, 17],
    });
  }

  function relogio() {
    const R = B.relogio;
    const horas = T.dados.serie('cadastros_hora_30d');
    const dias = R.diasSemana;
    const niveis = T.dados.serie('heatmap_cadastros_nivel');
    const onda = T.dados.serie('onda_22h_dia_semana');
    const picoOnda = onda.indexOf(Math.max(...onda));
    const diaOnda = DIA_LONGO[dias[picoOnda]] || dias[picoOnda];
    const somaOnda = T.soma(onda);
    const rotulos = Object.fromEntries((R.extremos || []).map((e) => [`${dias.indexOf(e.dia)}-${e.hora}`, f.n(e.v)]));
    return G.painel({
      id: 'relogio',
      titulo: `Quando as pessoas se cadastram — e a onda das 22h de ${diaOnda}`,
      comoLer: `Mapa: dia da semana × hora nos últimos 30 dias (${f.n(R.totalCadastros30d)} cadastros). A cor é intensidade relativa e só os dois quadrados mais escuros levam número; os totais exatos estão nas barras.`,
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'relogio-grade' });
        const mapa = T.h('div');
        const lado = T.h('div', { class: 'relogio-lado' });
        grade.append(mapa, lado);
        el.appendChild(grade);
        G.calor(mapa, { nome: 'cadastros por dia da semana e hora', linhas: dias, colunas: horas.map((_, h) => `${h}h`), niveis, rotulos });
        const cHora = T.h('div');
        mapa.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Por hora do relógio (30 dias) · roxo = 22h às 8h'));
        mapa.appendChild(cHora);
        G.colunas(cHora, { altura: 150, nome: 'cadastros por hora', unidade: 'cadastros em 30 dias', itens: horas.map((v, h) => ({ rotulo: `${h}h`, v, cor: h >= 22 || h < 8 ? 'var(--violeta)' : 'var(--eletrico)', destaque: h === R.picoHora.hora || h === R.segundaOnda.hora })), larguraMax: 18, passoRotulo: 40 });
        const cDia = T.h('div');
        const cOnda = T.h('div');
        lado.append(T.h('p', { class: 'sub-titulo leitura' }, 'Média por dia da semana'), cDia, T.h('p', { class: 'sub-titulo leitura' }, `Os ${f.n(somaOnda)} cadastros das 22h, por dia`), cOnda);
        const media = T.dados.serie('cadastros_dia_semana_media');
        G.colunas(cDia, { altura: 150, todosValores: true, nome: 'média por dia da semana', itens: media.map((v, i) => ({ rotulo: dias[i], v, cor: i >= 5 ? 'var(--referencia)' : 'var(--eletrico)' })), larguraMax: 26 });
        G.colunas(cOnda, { altura: 150, todosValores: true, nome: 'cadastros das 22h por dia da semana', itens: onda.map((v, i) => ({ rotulo: dias[i], v, cor: i === picoOnda ? 'var(--violeta)' : 'var(--referencia)' })), larguraMax: 26 });
      },
      leitura: `O pico cai às ${R.picoHora.hora}h (${f.n(R.picoHora.v)}) e uma segunda onda, quase do mesmo tamanho, chega às ${R.segundaOnda.hora}h (${f.n(R.segundaOnda.v)}) — ${f.n(onda[picoOnda])} desses ${f.n(somaOnda)} (${f.pct(somaOnda ? (onda[picoOnda] / somaOnda) * 100 : 0)}) numa ${diaOnda}. ${R.leitura}`,
      p: 16,
      tabela: { colunas: ['Hora', 'Cadastros em 30 dias'], linhas: horas.map((v, h) => [`${h}h`, f.n(v)]) },
    });
  }

  function ultimos14() {
    const max = Math.max(...B.ultimos14.flatMap((d) => d.f));
    const maxCheias = Math.max(1, ...B.ultimos14.map((d) => d.cheias));
    return G.painel({
      titulo: 'Os últimos 14 dias em seis faixas: o dia bom tem mais horas cheias',
      comoLer: 'Números exatos do livro. A intensidade da célula compara faixas entre todos os dias. "Horas cheias" = horas com 20 ou mais registros.',
      largura: 2,
      grafico: (el) => {
        el.appendChild(
          T.h(
            'div',
            { class: 'tabela-rolagem' },
            T.h(
              'table',
              { class: 'tabela-faixas' },
              T.h('thead', null, T.h('tr', null, T.h('th', { scope: 'col' }, 'Dia'), B.faixasDoDia.map((x) => T.h('th', { scope: 'col' }, x)), T.h('th', { scope: 'col' }, 'Cheias'), T.h('th', { scope: 'col' }, 'Total'))),
              T.h(
                'tbody',
                null,
                B.ultimos14.map((d) =>
                  T.h(
                    'tr',
                    { class: d.parcial ? 'parcial' : null },
                    T.h('th', { scope: 'row' }, `${f.data(d.dia)} `, T.h('small', null, d.s)),
                    d.f.map((v, i) => T.h('td', { class: i === 0 || i === 5 ? 'noturna' : null, style: { '--k': (v / max).toFixed(3) } }, f.n(v))),
                    T.h('td', { class: 'cheias' }, T.h('span', { class: 'cheias-barra', style: { '--p': `${(d.cheias / maxCheias) * 100}%` } }), f.n(d.cheias)),
                    T.h('td', null, T.h('b', null, f.n(d.total)))
                  )
                )
              )
            )
          )
        );
      },
      leitura: B.diaBomLeitura,
      nota: B.ultimos14Nota,
      p: 17,
    });
  }

  function tresDias() {
    const tres = T.dados.serie('tres_dias_hora');
    const chaves = Object.keys(tres).map((k) => [k, `${f.data(k)}, ${DIA_LONGO[f.diaSemana(k)]} — ${f.n(T.soma(tres[k]))}`]);
    const topo = Math.ceil(Math.max(20, ...Object.values(tres).flat()) / 10) * 10;
    return G.painel({
      titulo: 'Três dias, hora a hora',
      comoLer: 'Um dia forte, um comum e um domingo, na mesma escala. A linha tracejada marca 20 registros por hora.',
      largura: 1,
      grafico: (el) => {
        const grade = T.h('div', { class: 'pequenos', style: { '--colunas': 1 } });
        el.appendChild(grade);
        chaves.forEach(([k, titulo]) => {
          const corpo = T.h('div');
          const cheias = tres[k].filter((v) => v >= 20).length;
          grade.appendChild(T.h('figure', { class: 'pequeno' }, T.h('figcaption', null, T.h('span', { class: 'pequeno-nome' }, titulo), T.h('b', { class: 'pequeno-resumo' }, `${f.n(cheias)} ${cheias === 1 ? 'hora cheia' : 'horas cheias'}`)), corpo));
          G.colunas(corpo, { altura: 92, semEixo: true, yMax: topo, nome: titulo, unidade: 'registros na hora', itens: tres[k].map((v, h) => ({ rotulo: h % 6 === 0 ? `${h}h` : '', rotuloLongo: `${h}h`, v, cor: v >= 20 ? 'var(--eletrico)' : 'var(--referencia)' })), referencias: [{ v: 20, rotulo: '', cor: 'var(--tinta-3)' }], larguraMax: 10, ar: 2, passoRotulo: 1, margemBase: 18 });
        });
      },
      leitura: 'Um dia bom rende mais porque mantém muitas horas acima da linha, não porque uma única hora dispara.',
      p: 17,
    });
  }

  function times() {
    const lid = B.familias.find((x) => x.familia === FAMILIA_LIDERANCA);
    const fria = B.familias.find((x) => nomeCurto(x.familia) === FAMILIA_FRIA);
    const titulo = lid ? `${f.pct(lid.redePct, 0)} da rede faz ${f.pct(lid.registrosPct, 0)} dos cadastros` : 'Fatia da rede × fatia dos cadastros';
    const maxPct = Math.ceil(Math.max(10, ...B.familias.flatMap((x) => [x.redePct, x.registrosPct])) / 10) * 10;
    return G.painel({
      id: 'times',
      titulo,
      comoLer: 'Para cada família: fatia da rede (pessoas) contra fatia dos registros. Ponto vazio = % da rede; ponto cheio = % dos registros.',
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'times-grade' });
        const fam = T.h('div');
        grade.appendChild(fam);
        el.appendChild(grade);
        G.halteres(fam, {
          nome: 'fatia da rede × fatia dos registros',
          max: maxPct,
          margemEsq: 160,
          rotuloA: '% da rede',
          rotuloB: '% dos registros',
          itens: B.familias.map((x) => ({ rotulo: x.familia, a: x.redePct, b: x.registrosPct, tendencia: x.registrosPct > x.redePct ? 'subiu' : 'caiu' })),
          textoFim: (it) => `${f.pct(it.a)} → ${f.pct(it.b)}`,
        });
        const tabela = T.h(
          'div',
          { class: 'tabela-rolagem' },
          T.h(
            'table',
            { class: 'tabela-dados' },
            T.h('thead', null, T.h('tr', null, ['Time', 'Pessoas', 'Leads', 'Produzem', 'Média de quem produz', 'Bateram', '7 dias'].map((x) => T.h('th', { scope: 'col' }, x)))),
            T.h(
              'tbody',
              null,
              B.times.map((t) =>
                T.h(
                  'tr',
                  { class: t.familia === FAMILIA_FRIA ? 'fria' : t.familia === FAMILIA_LIDERANCA ? 'lideranca' : null },
                  T.h('th', { scope: 'row' }, t.time, T.h('small', null, t.familia)),
                  T.h('td', null, f.n(t.pilotos)),
                  T.h('td', null, T.h('b', null, f.n(t.passageiros))),
                  T.h('td', null, `${f.n(t.produzem)} (${f.pct(t.produzemPct)})`),
                  T.h('td', null, t.mediaQuemProduz === null ? '—' : f.nFlex(t.mediaQuemProduz)),
                  T.h('td', null, f.n(t.bateram)),
                  T.h('td', null, f.n(t.ult7d))
                )
              )
            )
          )
        );
        grade.appendChild(tabela);
      },
      leitura:
        lid && fria
          ? `As ${FAMILIA_LIDERANCA} são ${f.n(lid.pilotos)} pessoas (${f.pct(lid.redePct)} da rede) e fizeram ${f.pct(lid.registrosPct)} dos registros. A ${FAMILIA_FRIA}, com ${f.n(fria.pilotos)} pessoas, produziu ${f.n(fria.passageiros)} — é lista fria, para ativar ou tirar do denominador, não rede disponível.`
          : null,
      p: 18,
    });
  }

  function quemProduz() {
    const zero = B.faixasProducao.find((x) => x.faixa === '0');
    const topo = B.faixasProducao.find((x) => x.faixa === '88+');
    const totalPilotos = T.soma(B.faixasProducao, (x) => x.pilotos);
    const totalPass = T.soma(B.faixasProducao, (x) => x.passageiros);
    return G.painel({
      id: 'quem-produz',
      titulo: 'Quem produz — e quem já produziu e parou',
      comoLer: 'Faixas de produção por pessoa, tempo até o primeiro lead e há quanto tempo cada produtor não cadastra.',
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-3' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        const c = T.h('div', { id: 'parados' });
        grade.append(a, b, c);
        a.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Leads entregues por faixa (e quantas pessoas há nela)'));
        G.barrasH(a, { compacta: true, itens: B.faixasProducao.map((x) => ({ rotulo: `${x.faixa} leads`, sub: `${f.n(x.pilotos)} pessoas`, v: x.passageiros, texto: f.n(x.passageiros), cor: x.faixa === '88+' ? 'var(--ciano)' : 'var(--eletrico)' })) });
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Tempo até o primeiro lead (${f.n(T.soma(B.tempoAtePrimeiro, (x) => x.v))} que ativaram)`));
        const cb = T.h('div');
        b.appendChild(cb);
        G.colunas(cb, { altura: 170, todosValores: true, nome: 'tempo até o primeiro lead', itens: B.tempoAtePrimeiro.map((x, i) => ({ rotulo: x.faixa, v: x.v, cor: i < 3 ? 'var(--eletrico)' : 'var(--referencia)' })), larguraMax: 30 });
        b.appendChild(T.h('p', { class: 'nota-pequena' }, `${f.pct(B.ativacao24hEntreQuemAtiva)} de quem ativa faz isso em 24 h — mas, entre todas as pessoas com 2+ dias de ficha, só ${f.pct(B.ativacao24hSobreTodos)} ativam em 24 h e ${f.pct(B.nuncaAtivamPct, 'auto')} nunca ativaram.`));
        const produtores = T.soma(B.parados, (x) => x.v);
        c.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Os ${f.n(produtores)} produtores, pelo tempo desde o último registro`));
        const parado7 = (x) => /7\s*[–-]\s*14|>\s*14/.test(x.faixa || '');
        G.barrasH(c, { compacta: true, itens: B.parados.map((x) => ({ rotulo: x.faixa, v: x.v, texto: `${f.n(x.v)} · falta ${f.n(x.faltaMeta)}`, cor: parado7(x) ? 'var(--agir)' : 'var(--eletrico)', palavra: parado7(x) ? { estado: 'vermelho', texto: '7+ d' } : null })) });
        c.appendChild(T.h('p', { class: 'nota-pequena' }, `${f.n(B.parados7mais.v)} dos ${f.n(produtores)} estão parados há 7 dias ou mais e devem ${f.n(B.parados7mais.devem)} cadastros de meta. Já mostraram que sabem usar o bot.`));
      },
      leitura:
        zero && topo
          ? `${f.n(zero.pilotos)} das ${f.n(totalPilotos)} pessoas ativas nunca cadastraram ninguém. Os ${f.n(topo.pilotos)} do topo (88 ou mais cada) fizeram ${f.n(topo.passageiros)} — ${f.pct(totalPass ? (topo.passageiros / totalPass) * 100 : 0, 0)} de tudo.`
          : null,
      p: 19,
    });
  }

  function medidas() {
    return G.painel({
      titulo: 'Medidas que dizem menos do que parecem',
      comoLer: 'Kit, DDD, confirmação e ficha dupla: cada uma mede um rastro guardado pelo sistema, não o fato que importa.',
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-4' });
        el.appendChild(grade);
        const k = T.h('div');
        const d = T.h('div');
        const c = T.h('div', { class: 'confirmacao' });
        const du = T.h('div');
        grade.append(k, d, c, du);
        k.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Kit × produção (média por pessoa)'));
        G.barrasH(k, { compacta: true, itens: B.kit.map((x) => ({ rotulo: x.grupo, v: x.media, texto: `${f.nFlex(x.media)} · ${f.pct(x.produzemPct)}`, cor: x.grupo.includes('COM') ? 'var(--eletrico)' : 'var(--referencia)' })) });
        k.appendChild(T.h('p', { class: 'nota-pequena' }, B.kitLeitura));
        d.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'DDD do telefone do lead'));
        G.barrasH(d, { compacta: true, max: Math.max(...B.ddd.map((x) => x.v)), itens: B.ddd.map((x) => ({ rotulo: `DDD ${x.ddd}`, v: x.v, texto: `${f.n(x.v)} · ${f.pct(x.pct)}`, cor: x.ddd === B.dddBase ? 'var(--eletrico)' : 'var(--referencia)' })) });
        const fora = B.dddForaDoEstado;
        d.appendChild(T.h('p', { class: 'nota-pequena' }, `O DDD é do chip, não diz de onde a pessoa embarca. ${f.n(fora)} ${fora === 1 ? 'lead tem' : 'leads têm'} DDD de fora do estado-base.`));
        const conf = (estado) => B.confirmacao.find((x) => x.estado === estado) || null;
        const semResposta = conf('sem nenhuma resposta');
        const vai = conf('disse que vai aderir');
        const nao = conf('disse que não vai');
        const comStatus = vai && nao ? vai.v + nao.v : null;
        c.append(
          T.h('p', { class: 'sub-titulo leitura' }, 'Confirmação da adesão'),
          T.h('b', { class: 'num confirmacao-num' }, f.n(semResposta ? semResposta.v : null)),
          T.h('p', null, `fichas sem nenhuma resposta.${comStatus === null ? '' : ` Só ${f.n(comStatus)} ${comStatus === 1 ? 'pessoa tem' : 'pessoas têm'} status gravado (${f.n(vai.v)} ${vai.v === 1 ? 'vai' : 'vão'} aderir, ${f.n(nao.v)} não).`}`),
          T.h('p', { class: 'nota-pequena' }, 'O sistema guarda uma intenção dita uma única vez, não a adesão.')
        );
        const fd = B.fichaDupla;
        du.append(
          T.h('p', { class: 'sub-titulo leitura' }, 'Pessoa e lead ao mesmo tempo'),
          T.comp.medidor({ v: fd.tambemPassageiro, max: Math.max(fd.ativos, fd.tambemPassageiro), rotulo: 'pessoas que também são leads', formato: (v) => `${f.n(v)} · ${f.pct(fd.pct)}`, cor: 'var(--rosa)' }),
          T.comp.medidor({ v: fd.produzem, max: Math.max(fd.tambemPassageiro, fd.produzem), rotulo: 'desses, já cadastraram alguém', formato: (v) => f.n(v), cor: 'var(--eletrico)' }),
          T.h('p', { class: 'nota-pequena' }, `Ser as duas coisas é legítimo; o problema é a meta desses ${f.n(fd.tambemPassageiro)} (${f.n(fd.metaDeles)}) entrar na Projetada por cima da indicação que eles mesmos já são.`)
        );
      },
      p: 20,
    });
  }

  T.modulos.passageiros = {
    titulo: 'Leads',
    render(main) {
      main.append(
        T.pag.abertura(B, 'passageiros', 'passageiros', { regua: B.regua.linhas, explicas: ['contabilizados', 'ritmo', null, 'funil-vivo'] }),
        T.comp.secao({ id: 'expectativa', titulo: 'Realidade × expectativa até o Dia D', sub: 'O tamanho da distância, com a conta da própria equipe à vista.' }, T.comp.grade('', cenarios(), exigencia(), semanas(), pilotosDia())),
        T.comp.secao({ id: 'ritmo-secao', titulo: 'O ritmo e o relógio', sub: 'Quanto entra por dia, em que horas e em que dias da semana.' }, T.comp.grade('', ritmo(), relogio(), ultimos14(), tresDias())),
        T.comp.secao({ id: 'rede', titulo: 'De que lado da rede vêm os cadastros', sub: 'Famílias, times, faixas de produção e quem parou.' }, T.comp.grade('', times(), quemProduz(), medidas())),
        T.pag.fecho(B, B.regua, { significado: true })
      );
    },
  };
})();
