(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const A = L.atendimento;
  const f = T.fmt;
  const G = T.graf;

  const corRegua = (i) => (A.regua.linhas[i] && A.regua.linhas[i].status) || 'nao-medido';
  const ehCritica = (u) => typeof u === 'string' && /^cr[ií]tica$/i.test(u);
  const plural = (n, um, varios) => `${f.n(n)} ${n === 1 ? um : varios}`;
  const horas = (v) => `${f.nFlex(v)} ${v < 2 ? 'hora' : 'horas'}`;
  const maiorPor = (lista, pegar) => (lista || []).reduce((m, x) => (!m || pegar(x) > pegar(m) ? x : m), null);
  const menorPor = (lista, pegar) => (lista || []).reduce((m, x) => (!m || pegar(x) < pegar(m) ? x : m), null);
  const NA_DIA = { seg: 'na segunda', ter: 'na terça', qua: 'na quarta', qui: 'na quinta', sex: 'na sexta', 'sáb': 'no sábado', dom: 'no domingo' };

  function notaHoras(horasDia) {
    if (!Array.isArray(horasDia) || horasDia.length !== 24) return null;
    const madrugada = T.soma(horasDia.slice(0, 8));
    const h22 = horasDia[22];
    const h23 = horasDia[23];
    if (!madrugada && !h22 && h23) return `Entre meia-noite e 8h não há uma única baixa, e às 22h também não — as ${f.n(h23)} fora do expediente são todas às 23h.`;
    return `Entre 22h e 8h: ${plural(madrugada + h22 + h23, 'baixa', 'baixas')} — ${f.n(madrugada)} entre meia-noite e 8h, ${f.n(h22)} às 22h e ${f.n(h23)} às 23h.`;
  }

  function emDias(h) {
    const d = h / 24;
    if (d >= 3) return 'mais de três dias';
    if (d >= 2.5) return 'quase três dias';
    if (d >= 2) return 'mais de dois dias';
    if (d >= 1) return 'mais de um dia';
    return null;
  }

  function fila() {
    const faixas = A.esperandoAgora || [];
    const maiorEspera = Math.max(0, ...faixas.map((x) => x.maiorH || 0));
    const maxH = Math.max(10, Math.ceil(maiorEspera / 10) * 10);
    const total = T.soma(faixas, (x) => x.esperando);
    const critica = faixas.find((x) => ehCritica(x.urgencia));
    const nCriticas = critica ? critica.esperando : 0;
    const baixa = faixas.find((x) => /^baixa$/i.test(String(x.urgencia || '')));
    const corDe = { Crítica: 'var(--agir)', Alta: 'var(--atencao)', Média: 'var(--eletrico-claro)', Baixa: 'var(--eletrico)' };
    const lista = T.h(
      'div',
      { class: 'fila-viva', role: 'list' },
      faixas.map((x) =>
        T.h(
          'div',
          { class: ['fila-faixa', ehCritica(x.urgencia) ? 'critica' : null], role: 'listitem', style: { '--c': corDe[x.urgencia] } },
          T.h('div', { class: 'fila-cab' }, T.h('b', null, x.urgencia), T.h('span', { class: 'tab' }, `${f.n(x.esperando)} esperando`)),
          T.h('div', { class: 'fila-slots', 'aria-hidden': 'true' }, Array.from({ length: x.esperando }, (_, i) => T.h('i', { style: { '--i': i } }))),
          T.h(
            'div',
            { class: 'fila-espera' },
            T.h('span', { class: 'fila-espera-trilho' }, T.h('span', { class: 'fila-espera-media', style: { '--p': `${(x.mediaH / maxH) * 100}%` } }), T.h('span', { class: 'fila-espera-maior', style: { '--p': `${(x.maiorH / maxH) * 100}%` } }), T.h('span', { class: 'fila-regua', style: { '--p': `${(2 / maxH) * 100}%` } })),
            T.h('span', { class: 'fila-espera-rotulo tab' }, `média ${f.nFlex(x.mediaH)} h · maior ${f.nFlex(x.maiorH)} h`)
          )
        )
      )
    );

    const maisAntigas = !!critica && faixas.every((x) => (x.maiorH || 0) <= critica.maiorH);
    const fraseBaixa = baixa ? ` As de urgência baixa esperam ${horas(baixa.mediaH)}.` : '';
    let leitura;
    if (!nCriticas) {
      leitura = `Nenhuma conversa marcada como crítica espera agora.${fraseBaixa}`;
    } else {
      const dias = emDias(critica.maiorH);
      const abre = nCriticas === 1 ? `A única marcada como crítica espera ${horas(critica.mediaH)}` : `As ${f.n(nCriticas)} marcadas como críticas esperam em média ${horas(critica.mediaH)}`;
      leitura = `${abre}, e a mais antiga está há ${horas(critica.maiorH)} na fila${dias ? ` — ${dias}` : ''}.${fraseBaixa} Começar o dia pelas críticas${maisAntigas ? ', que são poucas e são as mais antigas' : ''}.`;
    }

    return G.painel({
      id: 'fila',
      titulo: `Fila viva: ${f.n(total)} conversas esperando baixa agora`,
      comoLer: `Cada ponto é uma conversa aberta sem baixa. A barra é a espera: preenchida até a média, traço até a maior espera (régua de 0 a ${maxH} h). O traço fino no começo marca 2 h.`,
      largura: 2,
      estado: corRegua(2),
      estadoTexto: nCriticas ? `${plural(nCriticas, 'crítica', 'críticas')} · média ${f.nFlex(critica.mediaH)} h` : 'nenhuma crítica',
      grafico: (el) => el.appendChild(lista),
      leitura,
      p: 46,
    });
  }

  function concentracao() {
    const p = A.pessoas;
    const topo = p[0] || {};
    const estado = corRegua(0);
    const at = T.dados.serie('atendentes_semana');
    const segunda = p[1] && at[p[1].nome];
    const iEntrada = segunda ? segunda.findIndex((x) => x.v > 0) : -1;
    const entrada = iEntrada > 0 ? segunda[iEntrada] : null;
    const pontoUnico = estado === 'vermelho' ? 'Não é elogio nem crítica a ninguém: é ponto único de falha. Uma semana de ausência e a fila fica sem dono.' : 'A concentração caiu abaixo da linha vermelha da régua; o risco de a fila ficar sem dono diminui, mas não some.';
    return G.painel({
      id: 'concentracao',
      titulo: `Uma pessoa dá ${f.pct(topo.pct)} das baixas`,
      comoLer: `Quem apertou o botão de baixa nos últimos 30 dias (${f.n(A.baixas30d)} baixas).`,
      largura: 1,
      estado,
      estadoTexto: estado === 'vermelho' ? 'ponto único de falha' : A.regua.linhas[0] && A.regua.linhas[0].hoje,
      grafico: (el) => {
        el.appendChild(
          T.h(
            'div',
            { class: 'concentracao-numero' },
            T.h('b', { class: 'num' }, f.pct(topo.pct)),
            T.h('span', null, `numa única conta — e só ${f.n(A.contasQueDeramBaixa)} de ${f.n(A.contasTorre)} contas do OPS Intelligence já usaram o botão`)
          )
        );
        G.faixa(el, { nome: 'baixas por pessoa', alta: true, segmentos: p.map((x, i) => ({ rotulo: T.nomeTexto(x.nome), v: x.v, cor: i === 0 ? 'var(--eletrico)' : 'var(--referencia)', curto: i === 0 ? f.n(x.v) : '' })), legenda: false });
        G.barrasH(el, { compacta: true, itens: p.map((x, i) => ({ rotulo: T.nome(x.nome), v: x.v, texto: `${f.n(x.v)} · ${f.pct(x.pct)}`, cor: i === 0 ? 'var(--eletrico)' : 'var(--referencia)' })) });
      },
      leitura: `${pontoUnico}${entrada ? ` A entrada de uma segunda conta na semana de ${f.data(entrada.d)} mostra que dá para dividir; a questão é manter.` : ''}`,
      p: 45,
    });
  }

  function baixasDia() {
    const baixas = T.dados.serie('baixas_dia');
    const med = T.dados.serie('baixas_mediana_h_dia');
    const pico = maiorPor(baixas, (p) => p.v);
    const medPico = pico ? med.find((m) => m.d === pico.d) : null;
    const piorMed = maiorPor(med, (m) => m.h);
    const mesmoDia = !!medPico && !!piorMed && medPico.d === piorMed.d;
    const pior = A.piorDia;
    let leitura = '';
    if (pico) {
      leitura = `O dia de mais baixas foi ${f.data(pico.d)}, com ${f.n(pico.v)}`;
      if (medPico) leitura += mesmoDia ? ` — e é justamente o de pior espera mediana do período, ${f.h(medPico.h)}.` : ` — com espera mediana de ${f.h(medPico.h)}.`;
      else leitura += '.';
      if (pior && pior.dia === pico.d && pior.leitura) leitura += ` ${pior.leitura}`;
      leitura += ' Tratar pico de baixa como mutirão, não como produtividade.';
    }
    return G.painel({
      titulo: 'Baixas por dia e a espera mediana',
      comoLer: 'Em cima, conversas dadas por resolvidas no dia. Embaixo, com régua própria em horas: a espera mediana das baixas daquele dia.',
      largura: 2,
      grafico: (el) => {
        const a = T.h('div');
        const b = T.h('div');
        el.append(a, T.h('p', { class: 'sub-titulo leitura' }, 'Espera mediana até a baixa (horas)'), b);
        G.barrasDia(a, { serie: baixas, altura: 190, nome: 'baixas', rotuloSe: (p) => !!pico && p.d === pico.d, cor: (p) => (pico && p.d === pico.d ? 'var(--violeta)' : 'var(--eletrico)') });
        G.colunas(b, { altura: 130, nome: 'espera mediana', formato: (v) => f.h(v, 0), formatoDica: (v) => f.h(v), unidade: 'mediana até a baixa', itens: med.map((m) => ({ rotulo: f.data(m.d), v: m.h, cor: m.h > 8 ? 'var(--agir)' : m.h > 2 ? 'var(--atencao)' : 'var(--firme)' })), larguraMax: 12, ar: 3, passoRotulo: 56, referencias: [{ v: 8, rotulo: '8 h', cor: 'var(--tinta-3)' }] });
      },
      leitura,
      p: 45,
    });
  }

  function espera() {
    const maior = maiorPor(A.faixas, (x) => x.v);
    const faixaMaior = maior && /^2\s*[–-]\s*24\s*h$/.test(maior.faixa) ? ' A faixa de 2 a 24 h é a maior — é ali que uma régua de "fechar no mesmo dia" mudaria mais casos.' : '';
    const dias = (A.medianaDiaSemana || []).filter((d) => typeof d.h === 'number');
    const seg = dias.find((d) => d.dia === 'seg');
    const menor = menorPor(dias, (d) => d.h);
    const segMaior = !!seg && dias.every((d) => d.h <= seg.h);
    const madrugada = A.horaClique ? A.horaClique.madrugada : null;
    const leitura = [
      seg && menor ? `A mediana de uma baixa dada na segunda é ${horas(seg.h)}; ${NA_DIA[menor.dia] || menor.dia}, ${horas(menor.h)}.` : null,
      segMaior ? 'O que chega no fim de semana espera a segunda.' : null,
      madrugada === 0 ? 'O sistema está no ar 24 horas; o atendimento não — e isso é escolha de escala, não falha do sistema.' : null,
    ]
      .filter(Boolean)
      .join(' ');
    const titulo = segMaior ? `Segunda-feira paga o fim de semana${madrugada === 0 ? ' — e a madrugada fica sem ninguém' : ''}` : 'Quanto se espera até a baixa, por dia e por hora';
    return G.painel({
      id: 'semana',
      titulo,
      comoLer: `Faixas de tempo até a baixa (${f.n(A.faixasTotal)} baixas), mediana por dia da semana (vermelho = acima de 12 h) e a hora em que o botão foi clicado.`,
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-3' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        const c = T.h('div');
        grade.append(a, b, c);
        a.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Tempo até a baixa, em faixas'));
        const a1 = T.h('div');
        a.appendChild(a1);
        G.colunas(a1, { altura: 180, todosValores: true, nome: 'faixas de espera', itens: A.faixas.map((x) => ({ rotulo: x.faixa, v: x.v, cor: x.alerta ? 'var(--agir)' : 'var(--eletrico)' })), larguraMax: 34 });
        a.appendChild(T.h('p', { class: 'nota-pequena' }, `${f.pct(A.mais24hPct, 'auto')} levaram mais de 24 h; só ${f.pct(A.ate30minPct, 'auto')} fecharam em até 30 minutos.${faixaMaior}`));
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Mediana da espera por dia da semana'));
        const b1 = T.h('div');
        b.appendChild(b1);
        G.colunas(b1, { altura: 180, todosValores: true, nome: 'mediana por dia da semana', formato: (v) => f.nFlex(v), formatoDica: (v) => f.h(v), itens: A.medianaDiaSemana.map((x) => ({ rotulo: x.dia, v: x.h, cor: x.h > 12 ? 'var(--agir)' : 'var(--eletrico)' })), larguraMax: 26 });
        b.appendChild(T.h('p', { class: 'nota-pequena' }, 'Um turno curto de sábado ou domingo derruba a mediana de segunda sem contratar ninguém.'));
        c.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Hora do clique de baixa (${f.n(A.baixas30d)} em 30 dias)`));
        const c1 = T.h('div');
        c.appendChild(c1);
        const horasDia = T.dados.serie('baixas_hora_clique');
        G.colunas(c1, { altura: 180, nome: 'baixas por hora', unidade: 'baixas clicadas nesta hora', itens: horasDia.map((v, h) => ({ rotulo: `${h}h`, v, cor: h < 8 || h >= 22 ? 'var(--violeta)' : 'var(--eletrico)' })), larguraMax: 14, passoRotulo: 36 });
        const nota = notaHoras(horasDia);
        if (nota) c.appendChild(T.h('p', { class: 'nota-pequena' }, nota));
      },
      leitura,
      p: 45,
    });
  }

  function assuntos() {
    const lista = A.assuntos || [];
    const dest = lista.find((x) => x.destaque);
    const S = A.saude || {};
    const outros = lista.find((x) => x.assunto === 'Outros');
    const maior = maiorPor(lista, (x) => x.v);
    const menosHumano = menorPor(lista.filter((x) => x.v > 0), (x) => x.humano / x.v);
    const emDez = typeof A.semRegiaoPct === 'number' ? Math.round(A.semRegiaoPct / 10) : null;
    const leitura = [
      dest ? `${dest.assunto} é ${f.n(dest.v)} de ${f.n(A.classificadas)} conversas (${f.pct(S.pctDoTotal)}), mas ${f.pct(S.precisaHumanoPct)} delas foram marcadas como "precisa de humano" e concentram ${f.n(S.urgentes)} das ${f.n(S.urgentesTotal)} urgentes (${f.pct(S.urgentesPct)}).` : null,
      outros && maior === outros && menosHumano === outros ? 'A maior categoria, "Outros", é a que menos pede gente.' : null,
      emDez !== null && emDez >= 5 ? `Com ${emDez === 10 ? 'quase todas as' : `${['', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'][emDez]} em cada dez`} conversas sem região, o desenho por região ainda não serve para decidir rota.` : null,
    ]
      .filter(Boolean)
      .join(' ');
    return G.painel({
      titulo: dest ? `${dest.assunto} é o assunto que pede pessoa — e é o que mais espera` : 'O assunto que pede pessoa',
      comoLer: `Classificação por IA de ${f.n(A.classificadas)} conversas (cobertura parcial). Barra = conversas; o traço marca quantas o modelo disse que "precisam de humano".`,
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-2' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        grade.append(a, b);
        G.barrasH(a, { compacta: true, itens: lista.map((x) => ({ rotulo: x.assunto, v: x.v, texto: `${f.n(x.v)} · ${f.n(x.humano)} p/ humano`, cor: x.destaque ? 'var(--agir)' : x.assunto === 'Outros' ? 'var(--referencia)' : 'var(--eletrico)', marcas: [{ v: x.humano, cor: 'var(--tinta-1)', rotulo: 'precisa de humano' }] })) });
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Mediana até a baixa, pela urgência marcada'));
        const b1 = T.h('div');
        b.appendChild(b1);
        G.colunas(b1, { altura: 170, todosValores: true, nome: 'mediana por urgência', formato: (v) => f.nFlex(v), formatoDica: (v) => f.h(v), itens: A.urgencia.map((u) => ({ rotulo: u.urgencia, v: u.medianaH, cor: u.urgencia === 'Crítica' ? 'var(--agir)' : 'var(--eletrico)', extra: [{ valor: f.n(u.baixas), rotulo: 'baixas com esta etiqueta', cor: 'var(--tinta-3)', forma: 'ponto' }] })), larguraMax: 34 });
        const inv = A.etiquetaInvertida;
        if (typeof inv === 'number' && inv > 1) b.appendChild(T.h('p', { class: 'nota-pequena' }, `A crítica espera ${f.n(inv, 1)} vezes mais que a baixa: a etiqueta está invertida na prática. Ou a etiqueta muda, ou a fila passa a obedecer a ela.`));
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Região da conversa (${f.pct(A.semRegiaoPct)} sem região)`));
        G.barrasH(b, { compacta: true, itens: A.regioes.map((r) => ({ rotulo: r.regiao, v: r.v, texto: f.n(r.v), cor: r.vazio ? 'var(--referencia)' : 'var(--eletrico)', textura: r.vazio })) });
      },
      leitura,
      p: 46,
    });
  }

  function semanas() {
    const at = T.dados.serie('atendentes_semana');
    const semanasSerie = Object.values(at).flatMap((pontos) => pontos.map((p) => p.d)).sort();
    const periodo = (L.meta && L.meta.periodo) || {};
    const x0 = semanasSerie[0] || periodo.inicio;
    const x1 = semanasSerie.at(-1) || periodo.fim;
    const incompleta = semanasSerie.length > 0 && T.dados.diaMedido() < T.isoSomar(x1, 7);
    const lider = A.pessoas[0] ? A.pessoas[0].nome : null;
    const destaque = (nome, i) => (lider ? T.mesmoNome(nome, lider) : i === 0);
    const pontosLider = lider ? Object.entries(at).find(([nome]) => T.mesmoNome(nome, lider)) : null;
    const semanasDoLider = pontosLider ? pontosLider[1].map((p) => p.d) : [];
    const lideraTodas = semanasDoLider.length > 0 && semanasDoLider.every((d, i) => Object.values(at).every((pts) => !pts[i] || pts[i].v <= pontosLider[1][i].v));
    const pico = A.picoSemanaPrincipal;
    const leitura = [
      lideraTodas ? 'A linha em destaque é a mesma pessoa em todas as semanas' : 'A linha em destaque é a conta que lidera as baixas de 30 dias',
      pico ? `, com pico de ${f.n(pico.v)} baixas na de ${f.data(pico.semana)}.` : '.',
      lideraTodas ? ' As demais quase não saem do chão.' : '',
    ].join('');
    return G.painel({
      titulo: 'Cada atendente, semana a semana',
      comoLer: `Baixas por semana. Em destaque a conta que faz quase tudo; as demais em cinza.${incompleta ? ` A semana de ${f.data(x1)} está incompleta.` : ''}`,
      largura: 1,
      grafico: (el) =>
        G.linhas(el, {
          nome: 'baixas por atendente por semana',
          altura: 230,
          x0,
          x1,
          margemDir: 120,
          series: Object.entries(at).map(([nome, pontos], i) => {
            const d = destaque(nome, i);
            return { nome: T.nomeTexto(nome), pontos, cor: d ? 'var(--eletrico)' : 'var(--referencia)', largura: d ? 2.6 : 1.3, rotuloFim: d, pontoFim: d };
          }),
        }),
      leitura,
      p: 45,
    });
  }

  T.modulos.atendimento = {
    titulo: 'Atendimento',
    render(main) {
      main.append(
        T.pag.abertura(A, 'atendimento', 'atendimento', { regua: A.regua.linhas }),
        T.h('p', { class: 'relogio-aviso', 'data-revela': '' }, T.icone('relogio'), T.h('span', null, T.h('b', null, 'Como ler o relógio deste capítulo. '), A.relogio)),
        T.comp.secao({ id: 'agora', titulo: 'Quem espera e quem responde', sub: A.indoBem }, T.comp.grade('', fila(), concentracao(), baixasDia(), semanas())),
        T.comp.secao({ id: 'espera', titulo: 'Quanto se espera e sobre o quê', sub: 'O fim de semana, a madrugada e o assunto que mais pede gente.' }, T.comp.grade('', espera(), assuntos())),
        T.pag.fecho(A, A.regua)
      );
    },
  };
})();
