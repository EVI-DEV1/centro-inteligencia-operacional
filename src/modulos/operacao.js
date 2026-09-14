(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const E = L.operacao;
  const f = T.fmt;
  const G = T.graf;

  const corRegua = (i) => (E.regua.linhas[i] && E.regua.linhas[i].status) || 'nao-medido';
  const horas = (v) => (typeof v === 'number' ? `${f.nFlex(v)} h` : '—');
  const listaDatas = (isos) => (isos.length > 1 ? `${isos.slice(0, -1).map((d) => f.data(d)).join(', ')} e ${f.data(isos.at(-1))}` : isos.map((d) => f.data(d)).join(''));
  const segundaDe = (iso) => T.isoSomar(iso, -((new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7));
  const tetoDe = (valores, passo, folga = 1) => Math.ceil((Math.max(0, ...valores) * folga) / passo) * passo;
  const maiorDia = (serie) => serie.reduce((m, p) => (!m || p.v > m.v ? p : m), null);
  const diasItem = (re) => {
    const achados = (E.estoque.itens || []).filter((it) => typeof it.item === 'string' && re.test(it.item) && typeof it.dias === 'number');
    return achados.length ? Math.min(...achados.map((it) => it.dias)) : null;
  };
  const serieOu = (nome) => {
    try {
      return T.dados.serie(nome);
    } catch (e) {
      return null;
    }
  };

  function esteira() {
    const P = E.pedidos;
    const S = E.estoque;
    const Et = E.etiquetas;
    const kraft = diasItem(/caixa\s+kraft/i);
    const manual = diasItem(/^manual\s+(do\s+)?piloto/i);
    const insumo = [kraft !== null ? `caixa kraft ${f.d(kraft)}` : null, manual !== null ? `Manual ${f.d(manual)}` : null].filter(Boolean).join(' · ');
    const lotes = (P.lotes || []).map((l) => l.dia);
    const saidas = P.saida || [];
    const branco = saidas.find((x) => x.saida === 'saída em branco');
    const outrasSaidas = saidas.filter((x) => x !== branco).map((x) => `${f.n(x.v)} ${x.saida}`).join(' · ');
    const entre = Array.isArray(P.entregasEntre) && P.entregasEntre.length === 2 ? P.entregasEntre : null;
    const semConferencia = typeof Et.total === 'number' && typeof Et.conferidas === 'number' ? Et.total - Et.conferidas : null;
    const etapas = [
      { id: 'estoque', icone: 'lote', titulo: 'Estoque', valor: `${f.n(S.zerados)} zerados`, linhas: [`${f.n(S.itensMedidos)} itens medidos`, insumo], prova: 'saldo e movimento', falha: 'o que é lote e o que é balcão', estado: corRegua(4) },
      { id: 'pedido', icone: 'operacao', titulo: 'Pedido', valor: f.n(P.total), linhas: [`${f.pct(E.scriptPct)} criados por script`, lotes.length ? `${lotes.length > 1 ? 'lotes' : 'lote'} em ${listaDatas(lotes)}` : null], prova: 'que alguém pediu', falha: 'se é demanda da rua', estado: 'amarelo' },
      { id: 'saida', icone: 'seta', titulo: 'Saída do balcão', valor: `${f.n(branco ? branco.v : null)} em branco`, linhas: [outrasSaidas, `mediana ${horas(E.tempoEntrega.medianaH)} · p90 ${horas(E.tempoEntrega.p90H)}`], prova: 'por onde saiu (quando preenchido)', falha: 'nada, quando fica em branco', estado: corRegua(0) },
      { id: 'entrega', icone: 'firme', titulo: 'Entrega', valor: `${f.n(P.entreguesComCarimbo)} com carimbo`, linhas: [`${f.n(P.arquivadosSemCarimbo)} arquivados sem carimbo`, entre ? `entregas entre ${f.n(entre[0])} e ${f.n(entre[1])}` : null], prova: 'um clique', falha: 'que a caixa chegou', estado: corRegua(2) },
      { id: 'recebimento', icone: 'alvo', titulo: 'Recebimento', valor: `${f.n(Et.conferidas)} ${Et.conferidas === 1 ? 'conferido' : 'conferidos'}`, linhas: [`em ${f.n(Et.total)} etiquetas`, Et.conferenciaDesde ? `conferência existe desde ${f.data(Et.conferenciaDesde)}` : null], prova: 'que o kit chegou', falha: `${f.n(semConferencia)} etiquetas sem conferência`, estado: corRegua(3) },
    ];
    const trilho = T.h('ol', { class: 'esteira', role: 'list' });
    etapas.forEach((e, i) => {
      trilho.appendChild(
        T.h(
          'li',
          { class: 'esteira-etapa', 'data-s': e.estado, style: { '--i': i } },
          T.h('span', { class: 'esteira-icone' }, T.icone(e.icone)),
          T.h('h4', null, e.titulo),
          T.h('b', { class: 'num esteira-valor' }, e.valor),
          T.h('ul', null, e.linhas.filter(Boolean).map((l) => T.h('li', null, l))),
          T.h('p', { class: 'esteira-prova' }, T.h('span', { class: 'leitura' }, 'prova'), e.prova),
          T.h('p', { class: 'esteira-falha' }, T.h('span', { class: 'leitura' }, 'não prova'), e.falha)
        )
      );
    });
    return G.painel({
      id: 'esteira',
      titulo: 'A operação corre mais rápido do que consegue provar',
      comoLer: 'O caminho físico do material, da prateleira à mão do piloto. Em cada etapa: o número do livro, o que o registro prova e o que não prova. O trilho fica mais fino onde a prova se perde.',
      largura: 3,
      grafico: (el) => {
        el.appendChild(trilho);
        el.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Os ${f.n(P.total)} pedidos de material, em uma barra`));
        G.faixa(el, {
          nome: `estado dos ${f.n(P.total)} pedidos`,
          alta: true,
          segmentos: [
            { rotulo: 'entregues, com carimbo', v: P.entreguesComCarimbo, cor: 'var(--eletrico)' },
            { rotulo: 'arquivados sem carimbo de entrega', v: P.arquivadosSemCarimbo, cor: 'var(--agir)' },
            { rotulo: 'ainda abertos', v: P.abertos, cor: 'var(--atencao)' },
          ],
        });
      },
      leitura: `Nenhum desses números diz que o material não chegou — dizem que, se alguém perguntar, não há resposta no sistema.${entre ? ` O número de entregas é no mínimo ${f.n(entre[0])} e no máximo ${f.n(entre[1])}, e isso vira problema de reposição, não de relatório.` : ''}`,
      p: [34, 35, 38, 43],
    });
  }

  function estoque() {
    const S = E.estoque;
    const dia = T.dados.diaMedido();
    const aD7 = T.diasEntre(dia, L.meta.d7);
    const aDiaD = T.diasEntre(dia, L.meta.diaD);
    const piso = Math.max(5, aD7);
    const cor = (d) => (d < 5 ? 'var(--agir)' : d < aD7 ? 'var(--atencao)' : d < aDiaD ? 'var(--eletrico-claro)' : 'var(--firme)');
    const marcas = [aD7 > 0 ? { v: aD7, cor: 'var(--atencao)', rotulo: 'D-7' } : null, aDiaD > 0 ? { v: aDiaD, cor: 'var(--agir)', rotulo: 'Dia D' } : null].filter(Boolean);
    return G.painel({
      id: 'estoque',
      titulo: 'Estoque: quantos dias faltam para acabar',
      comoLer: `Dias = saldo ÷ consumo médio dos últimos 14 dias (barra cortada em 30).${aD7 > 0 ? ` Traço amarelo = ${aD7} dias (D-7, ${f.data(L.meta.d7)}).` : ''}${aDiaD > 0 ? ` Traço vermelho = ${aDiaD} dias (Dia D, ${f.data(L.meta.diaD)}).` : ''} Hachura = consumo inflado por carga em lote.`,
      largura: 2,
      grafico: (el) =>
        G.barrasH(el, {
          max: 30,
          compacta: true,
          itens: S.itens.map((it) => ({
            rotulo: it.item,
            sub: `saldo ${f.n(it.saldo)}`,
            v: Math.max(it.dias, 0.15),
            texto: f.d(it.dias),
            cor: cor(it.dias),
            textura: it.lote,
            classe: it.critico ? 'critico' : null,
            marcas,
            palavra: it.critico ? { estado: 'vermelho', texto: 'comprar' } : it.lote ? { estado: 'nao-medido', texto: 'lote' } : null,
          })),
        }),
      legenda: [
        { rotulo: 'menos de 5 dias', cor: 'var(--agir)' },
        aD7 > 5 ? { rotulo: `5 a ${aD7} dias`, cor: 'var(--atencao)' } : null,
        aDiaD > piso ? { rotulo: `${piso} a ${aDiaD} dias`, cor: 'var(--eletrico-claro)' } : null,
        { rotulo: 'passa do Dia D', cor: 'var(--firme)' },
      ].filter(Boolean),
      leitura: S.leitura,
      p: 37,
      tabela: { colunas: ['Item', 'Dias', 'Saldo'], linhas: S.itens.map((it) => [it.item, f.d(it.dias), f.n(it.saldo)]) },
    });
  }

  function pedidosDia() {
    const P = E.pedidos;
    const desde = segundaDe(P.fluxoNovoDesde);
    const pedidos = T.dados.serie('pedidos_dia').filter((p) => p.d >= desde);
    const entregues = T.dados.serie('entregas_dia').filter((p) => p.d >= desde);
    const yMax = tetoDe([...pedidos.map((p) => p.v), ...entregues.map((p) => p.v)], 50, 1.1);
    const fechamento = maiorDia(entregues.filter((p) => !p.parcial));
    const lotes = P.lotes || [];
    return G.painel({
      titulo: 'Pedidos por dia: lote e balcão são coisas diferentes',
      comoLer: 'Barras = pedidos criados (roxo = dia de lote, carga feita de uma vez). Embaixo, em gráfico separado e mesma escala: entregas registradas.',
      largura: 1,
      grafico: (el) => {
        const a = T.h('div');
        const b = T.h('div');
        el.append(a, T.h('p', { class: 'sub-titulo leitura' }, 'Entregas registradas por dia'), b);
        G.barrasDia(a, { serie: pedidos, altura: 150, yMax, nome: 'pedidos', cor: (p) => (p.lote ? 'var(--violeta)' : 'var(--eletrico)'), rotuloSe: (p) => p.lote, divisoes: 3 });
        G.barrasDia(b, { serie: entregues, altura: 130, yMax, nome: 'entregas', cor: (p) => (fechamento && p.d === fechamento.d ? 'var(--violeta)' : 'var(--referencia)'), rotuloSe: (p) => !!fechamento && p.d === fechamento.d, divisoes: 3 });
      },
      leitura: `O fluxo novo começou em ${f.data(P.fluxoNovoDesde)}. ${lotes.map((l) => `${f.data(l.dia)} (${f.n(l.v)})`).join(' e ')} ${lotes.length > 1 ? 'são' : 'é'} carga em lote${fechamento ? `; as ${f.n(fechamento.v)} entregas de ${f.data(fechamento.d)} são alguém fechando de uma vez o que estava aberto` : ''}. A média por dia mistura os dois e não descreve nenhum.`,
      p: 35,
    });
  }

  function itensEntrega() {
    return G.painel({
      titulo: 'O que sai do balcão e em quanto tempo',
      comoLer: 'Itens dos últimos 30 dias (barra = peças; à direita, quantos pedidos). Verde = presente em 200 pedidos ou mais, consumo de todo dia.',
      largura: 2,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-2' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        grade.append(a, b);
        G.barrasH(a, { compacta: true, itens: E.itens.map((it) => ({ rotulo: it.item, v: it.un, texto: `${f.n(it.un)} un · ${f.n(it.pedidos)} ped.`, cor: it.diario ? 'var(--firme)' : 'var(--eletrico)' })) });
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `Tempo entre pedido e entrega (${f.n(E.pedidos.entreguesComCarimbo)} com carimbo)`));
        const b1 = T.h('div');
        b.appendChild(b1);
        G.colunas(b1, { altura: 180, todosValores: true, nome: 'tempo até a entrega', itens: E.tempoEntrega.faixas.map((x) => ({ rotulo: x.faixa, v: x.v, cor: x.alerta ? 'var(--agir)' : 'var(--eletrico)' })), larguraMax: 30 });
        b.appendChild(
          T.h(
            'div',
            { class: 'par-numeros' },
            T.h('div', null, T.h('span', { class: 'leitura' }, 'mediana'), T.h('b', { class: 'num' }, horas(E.tempoEntrega.medianaH)), T.carimbo(corRegua(1), null, true)),
            T.h('div', null, T.h('span', { class: 'leitura' }, 'p90'), T.h('b', { class: 'num' }, horas(E.tempoEntrega.p90H)), T.carimbo(corRegua(0), null, true))
          )
        );
        b.appendChild(T.h('p', { class: 'nota-pequena' }, E.pedidos.caudaLonga));
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Por onde o pedido saiu'));
        G.barrasH(b, { compacta: true, itens: E.pedidos.saida.map((x) => ({ rotulo: x.saida, v: x.v, texto: `${f.n(x.v)} · ${f.n(x.comCarimbo)} com carimbo`, cor: x.saida === 'saída em branco' ? 'var(--agir)' : 'var(--eletrico)', textura: x.saida === 'saída em branco' })) });
      },
      leitura: `${E.itensLeitura} Cobrar o p90, não a mediana. ${E.pedidos.saidaLeitura}`,
      nota: E.autoresNota,
      p: [35, 36],
    });
  }

  function etiquetas() {
    const Et = E.etiquetas;
    const serie = T.dados.serie('etiquetas_dia').filter((p) => p.d >= segundaDe(Et.desde || E.pedidos.fluxoNovoDesde));
    const picos = (Et.picos || []).map((x) => x.dia);
    const ordem7d = [...(Et.pontos || [])].sort((a, b) => b.ult7d - a.ult7d);
    const lider = Et.pontos[0];
    const dupla = ordem7d.slice(0, 2).map((p) => p.ponto);
    return G.painel({
      titulo: 'Etiqueta impressa não é kit recebido',
      comoLer: 'Etiquetas de kit por dia e de que ponto de impressão saíram (à direita, quantas nos últimos 7 dias; cinza = ponto parado).',
      largura: 1,
      grafico: (el) => {
        const a = T.h('div');
        el.appendChild(a);
        G.barrasDia(a, { serie, altura: 140, nome: 'etiquetas', rotuloSe: (p) => picos.includes(p.d), divisoes: 3 });
        el.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Pontos de impressão'));
        G.barrasH(el, { compacta: true, itens: Et.pontos.map((p) => ({ rotulo: p.ponto, v: p.total, texto: `${f.n(p.total)} · ${f.n(p.ult7d)} em 7 d`, cor: p.ult7d ? 'var(--eletrico)' : 'var(--referencia)' })) });
        el.appendChild(
          T.h(
            'div',
            { class: 'par-numeros tres' },
            T.h('div', null, T.h('span', { class: 'leitura' }, 'impressas'), T.h('b', { class: 'num' }, f.n(Et.total))),
            T.h('div', null, T.h('span', { class: 'leitura' }, 'conferidas'), T.h('b', { class: 'num alerta-texto' }, f.n(Et.conferidas))),
            T.h('div', null, T.h('span', { class: 'leitura' }, 'fluxo antigo parado'), T.h('b', { class: 'num' }, f.n(Et.fluxoAntigo ? Et.fluxoAntigo.prontoParado : null)))
          )
        );
      },
      leitura: `O ${lider.ponto} fez ${f.pct(Et.pontoLiderPct)} das etiquetas e, nos últimos 7 dias, ${dupla.join(' e ')} fizeram ${f.pct(Et.duplaLider7dPct, 0)}. A operação depende de duas máquinas: se uma parar, a fila inteira para.${Et.fluxoAntigo ? ` E ${f.n(Et.fluxoAntigo.prontoParado)} pedidos seguem em "pronto para etiqueta" num fluxo antigo que ninguém mais abre.` : ''}`,
      p: 38,
    });
  }

  function campo() {
    const C = E.campo;
    const pessoas = T.dados.serie('refeicao_pessoas_dia');
    const almoco = T.dados.serie('refeicao_almoco_dia');
    const janta = T.dados.serie('refeicao_janta_dia');
    const ontem = T.isoSomar(T.dados.diaMedido(), -1);
    const verde = C.faixas.verde;
    const amarelo = C.faixas.amarelo;
    const estado = corRegua(5);
    const palavraEstado = { verde: 'verde', amarelo: 'amarelo', vermelho: 'vermelho' }[estado];
    const R = C.refeicoes;
    return G.painel({
      id: 'campo',
      titulo: 'Quem está em campo — medido pelo prato de comida',
      comoLer: `A operação de rua formal tem zero linha no sistema; o proxy é a refeição escaneada na base operacional. Cores da régua do capítulo: verde = ${verde} ou mais pessoas; amarelo = ${amarelo} a ${verde - 1}; vermelho = menos de ${amarelo}.`,
      largura: 2,
      grafico: (el) => {
        const a = T.h('div');
        el.appendChild(a);
        G.barrasDia(a, {
          serie: pessoas,
          altura: 190,
          yMax: tetoDe([verde, ...pessoas.map((p) => p.v)], 10, 1.3),
          nome: 'pessoas distintas',
          cor: (p) => (p.v >= verde ? 'var(--firme)' : p.v >= amarelo ? 'var(--atencao)' : 'var(--agir)'),
          referencias: [{ v: verde, rotulo: `${verde} pessoas`, cor: 'var(--tinta-3)', lado: 'esq' }],
          rotuloSe: (p) => p.d === ontem,
          divisoes: 3,
        });
        el.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Almoço e janta (pessoas que chegaram), em quadros separados'));
        const b = T.h('div');
        el.appendChild(b);
        G.pequenos(b, { colunas: 2, altura: 110, yMax: tetoDe([...almoco.map((p) => p.v), ...janta.map((p) => p.v)], 10, 1.2), quadros: [{ titulo: 'almoço', resumo: '', pontos: almoco, cor: 'var(--eletrico)' }, { titulo: 'janta', resumo: '', pontos: janta, cor: 'var(--rosa)' }] });
        el.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Área declarada na ficha (últimos 14 dias)'));
        G.barrasH(el, { compacta: true, itens: C.areas.map((a2) => ({ rotulo: a2.area, v: a2.refeicoes, texto: `${f.n(a2.pessoas)} pess. · ${f.n(a2.refeicoes)} ref.`, cor: a2.vazio ? 'var(--referencia)' : 'var(--eletrico)', textura: a2.vazio })) });
      },
      leitura: `Nas últimas duas semanas o campo andou entre ${f.n(C.faixa14d[0])} e ${f.n(C.faixa14d[1])} pessoas por dia, mediana ${f.n(C.mediana)}; ontem, ${f.n(C.ontem)}. ${estado === 'verde' ? 'Pela régua o campo está verde: o risco não é gente, é insumo.' : palavraEstado ? `Pela régua o campo está ${palavraEstado}.` : ''} ${f.n(R.servidas)} refeições servidas de ${f.n(R.reservadas)} reservadas (${f.pct(R.comparecimentoPct)}) — a reserva do dia seguinte prevê bem a presença.`,
      nota: C.nota,
      p: 39,
    });
  }

  function visitas() {
    const V = E.visitas;
    const agentes = V.agentes || [];
    const parados = agentes.filter((a) => a.ult7d === 0).length;
    const novo = V.formularioNovo || {};
    const formularios = serieOu('formularios_semana');
    const estreia = formularios && novo.nome && Array.isArray(formularios[novo.nome]) ? formularios[novo.nome].find((p) => p.v > 0) : null;
    return G.painel({
      id: 'visitas',
      titulo: 'Visitas porta a porta: o volume ficou, a conversão caiu',
      comoLer: `Formulário ${V.formulario} por semana (condomínios e comércios), com a fração que escolheu Rota 20 ou Rota 40. As respostas cruas mostram por que a queda é ambígua.`,
      largura: 1,
      grafico: (el) => {
        const a = T.h('div');
        el.appendChild(a);
        G.colunas(a, { altura: 170, nome: 'visitas por semana', unidade: 'visitas', itens: V.semanas.map((x) => ({ rotulo: f.data(x.semana), v: x.v, rotuloValor: `${f.n(x.v)} · ${f.pct(x.engajouPct)}`, cor: x.engajouPct >= 50 ? 'var(--firme)' : 'var(--eletrico)' })), larguraMax: 36 });
        el.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'O que a pessoa respondeu'));
        G.barrasH(el, { compacta: true, itens: V.respostas.map((r) => ({ rotulo: r.resposta, v: r.v, texto: f.n(r.v), cor: r.tipo === 'branco' ? 'var(--referencia)' : r.tipo === 'nao' ? 'var(--rosa)' : 'var(--eletrico)', textura: r.tipo === 'branco' })) });
        el.appendChild(
          T.h(
            'p',
            { class: 'nota-pequena' },
            `${f.n(agentes.length)} agentes, ${f.n(V.total)} visitas; os 4 primeiros fazem ${f.pct(V.top4Pct)}${parados ? ` e ${parados} ${parados === 1 ? 'parou' : 'pararam'}` : ''}.${estreia ? ` Na semana de ${f.data(estreia.d)} surgiu um formulário novo ("${novo.nome}", ${f.n(novo.respostas)} respostas, ${f.n(novo.agentes)} agentes): o trabalho se partiu em dois formulários.` : ''}`
          )
        );
      },
      leitura: V.leitura,
      p: 40,
    });
  }

  function agendaTerritorio() {
    const Ag = E.agenda;
    const Te = E.territorio;
    const aprovados = (Ag.pedidos || []).find((x) => x.estado === 'aprovado');
    const naSemana = Ag.semanaDiaD;
    const semanaD = (Ag.porSemana || []).find((x) => x.diaD);
    const comEvento = (Ag.porSemana || []).filter((x) => x.futura && x.v > 0);
    const ateDia = comEvento.length ? T.isoSomar(comEvento.at(-1).semana, 6) : null;
    const leituraAgenda =
      naSemana === 0 && semanaD
        ? `Nenhum evento marcado entre ${f.data(semanaD.semana)} e ${f.data(L.meta.diaD)}, nem na semana seguinte; ${Ag.futuros === 0 ? 'não há eventos futuros' : `os ${f.n(Ag.futuros)} eventos futuros vão até ${f.data(ateDia)}`}. Ou a agenda da semana do Dia D está em outro lugar, ou ainda não foi feita — as duas respostas exigem ação hoje.`
        : `A semana do Dia D tem ${f.n(naSemana)} ${naSemana === 1 ? 'evento marcado' : 'eventos marcados'}; ${f.n(Ag.futuros)} eventos futuros no total.`;
    return G.painel({
      id: 'agenda',
      titulo: `A agenda da semana do Dia D ${naSemana === 0 ? 'está vazia' : `tem ${f.n(naSemana)} ${naSemana === 1 ? 'evento' : 'eventos'}`} — e o território é lista, não mapa`,
      comoLer: 'Eventos do calendário da Torre por semana (hachura = semanas futuras, com o que já está marcado). Ao lado, a base de endereços por região.',
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-2' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        grade.append(a, b);
        G.colunas(a, {
          altura: 200,
          todosValores: true,
          nome: 'eventos por semana',
          itens: Ag.porSemana.map((x) => ({ rotulo: f.data(x.semana), v: x.v, rotuloValor: x.diaD ? `${x.v} · Dia D` : String(x.v), cor: 'var(--eletrico)', textura: x.futura, destaque: x.diaD })),
          larguraMax: 30,
          yMax: Math.max(6, ...Ag.porSemana.map((x) => x.v)),
        });
        a.appendChild(
          T.h(
            'div',
            { class: 'par-numeros tres' },
            T.h('div', null, T.h('span', { class: 'leitura' }, 'eventos'), T.h('b', { class: 'num' }, f.n(Ag.eventos))),
            T.h('div', null, T.h('span', { class: 'leitura' }, 'pedidos aprovados'), T.h('b', { class: 'num' }, f.n(aprovados ? aprovados.v : null))),
            T.h('div', null, T.h('span', { class: 'leitura' }, 'ligados a evento'), T.h('b', { class: 'num alerta-texto' }, f.n(Ag.ligadosAEvento)))
          )
        );
        a.appendChild(T.h('p', { class: 'nota-pequena' }, Ag.leitura));
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `${f.n(Te.leads)} leads do CRM · ${f.pct(Te.semRegiaoPct)} sem região · ${f.pct(Te.comCoordenadaPct)} com coordenada`));
        G.faixa(b, { nome: 'leads com e sem região', segmentos: [{ rotulo: 'sem região', v: Te.semRegiao.leads, cor: 'var(--referencia)', textura: true }, { rotulo: 'com região', v: Te.comRegiao.leads, cor: 'var(--eletrico)' }], minRotulo: 12 });
        G.barrasH(b, { compacta: true, itens: Te.regioes.map((r) => ({ rotulo: r.regiao, v: r.leads, texto: `${f.n(r.leads)} · ${f.n(r.entregues)} entregues`, cor: 'var(--eletrico)', marcas: [{ v: r.coordenada, cor: 'var(--ciano)', rotulo: 'com coordenada' }] })) });
        b.appendChild(T.h('p', { class: 'nota-pequena' }, Te.leitura));
      },
      leitura: leituraAgenda,
      p: [42, 43],
    });
  }

  function torreEmUso() {
    const Tr = E.torre;
    const contas = T.dados.serie('torre_contas_dia');
    const acoes = T.dados.serie('torre_acoes_dia');
    const pico = maiorDia(acoes);
    const entregasPico = pico ? (T.dados.serie('entregas_dia').find((p) => p.d === pico.d) || {}).v : null;
    const etiquetasPico = pico ? (T.dados.serie('etiquetas_dia').find((p) => p.d === pico.d) || {}).v : null;
    return G.painel({
      id: 'torre',
      titulo: 'A Torre em uso: quem entra e o que faz',
      comoLer: 'Contas diferentes que agiram por dia e ações registradas por dia — grandezas diferentes, gráficos diferentes. Vermelho = tentativa de login que falhou.',
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'grade-3' });
        el.appendChild(grade);
        const a = T.h('div');
        const b = T.h('div');
        const c = T.h('div');
        grade.append(a, b, c);
        a.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Contas que agiram por dia'));
        const a1 = T.h('div');
        a.appendChild(a1);
        G.barrasDia(a1, { serie: contas, altura: 140, nome: 'contas', divisoes: 2 });
        a.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Ações registradas por dia'));
        const a2 = T.h('div');
        a.appendChild(a2);
        G.barrasDia(a2, { serie: acoes, altura: 140, nome: 'ações', rotuloSe: (p) => !!pico && p.d === pico.d, divisoes: 2, cor: () => 'var(--referencia)' });
        b.appendChild(T.h('p', { class: 'sub-titulo leitura' }, `As ${f.n(Tr.topAcoes.length)} ações mais registradas (30 dias)`));
        G.barrasH(b, { compacta: true, itens: Tr.topAcoes.map((x) => ({ rotulo: x.acao, v: x.v, texto: f.n(x.v), cor: x.alerta ? 'var(--agir)' : 'var(--eletrico)' })) });
        c.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Contas por papel'));
        G.barrasH(c, { compacta: true, itens: Tr.contas.map((x) => ({ rotulo: x.papel, v: x.v, texto: `${f.n(x.v)} · ${f.n(x.ativas)} ativas`, cor: 'var(--eletrico)' })) });
        c.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Chamados internos por estado (idade média)'));
        G.barrasH(c, { compacta: true, itens: Tr.chamadosInternos.map((x) => ({ rotulo: x.estado, v: x.v, texto: `${f.n(x.v)} · ${f.d(x.idadeD)}`, cor: x.estado === 'concluído' ? 'var(--firme)' : 'var(--eletrico)' })) });
        c.appendChild(T.h('div', { class: 'par-numeros' }, T.h('div', null, T.h('span', { class: 'leitura' }, 'logins que falham'), T.h('b', { class: 'num alerta-texto' }, f.pct(Tr.loginFalhaPct))), T.h('div', null, T.h('span', { class: 'leitura' }, 'chamados internos vivos'), T.h('b', { class: 'num' }, f.n(Tr.chamadosVivos)))));
      },
      leitura: `Entre ${f.n(Tr.contasDiaFaixa[0])} e ${f.n(Tr.contasDiaFaixa[1])} contas por dia desde ${f.data(Tr.contasDiaDesde)} (média de ${f.nFlex(Tr.mediaContas7d, 1)} nos últimos 7): a Torre é usada por dezenas de pessoas, não por dois administradores.${pico ? ` O pico de ${f.n(pico.v)} ações em ${f.data(pico.d)} é o mesmo dia das ${f.n(entregasPico)} entregas e das ${f.n(etiquetasPico)} etiquetas — muita ação por pessoa, não mais gente.` : ''} ${f.pct(Tr.loginFalhaPct)} das tentativas de login falham: vale olhar antes do Dia D.`,
      p: [41, 42],
    });
  }

  T.modulos.operacao = {
    titulo: 'Operação',
    render(main) {
      main.append(
        T.pag.abertura(E, 'operacao', 'operacao', { regua: E.regua.linhas }),
        T.comp.secao({ id: 'material', titulo: 'Material: da prateleira à mão do piloto', sub: `Onde a prova se perde e o que acaba antes de ${f.data(L.meta.d7)}.` }, T.comp.grade('', esteira(), estoque(), pedidosDia(), itensEntrega(), etiquetas())),
        T.comp.secao({ id: 'rua', titulo: 'Gente, rua e agenda', sub: 'Campo, visitas, calendário e território.' }, T.comp.grade('', campo(), visitas(), agendaTerritorio(), torreEmUso())),
        T.pag.fecho(E, E.regua)
      );
    },
  };
})();
