(function () {
  'use strict';
  const T = window.T;
  const L = T.dados.livro;
  const P = L.pilotos;
  const f = T.fmt;
  const G = T.graf;

  const degrau = (id) => P.funil.find((d) => d.id === id) || null;
  const EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
  const extenso = (n) => EXTENSO[n] || f.n(n);
  const faixaFaseA = () => (Array.isArray(P.metaFaseA) && P.metaFaseA.length === 2 ? P.metaFaseA : null);
  const juntar = (itens) => (itens.length > 1 ? `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}` : itens[0] || '');

  function funil() {
    const max = P.funil[0].v;
    const maiorPerda = Math.max(...P.funil.slice(1).map((d, i) => P.funil[i].v - d.v));
    const vivo = degrau('vivo');
    const prontos = ((L.fechamento && L.fechamento.metricasFaseA) || []).find((m) => /^Pilotos prontos/.test(m.metrica));
    const faixa = faixaFaseA();
    const d7 = L.meta && L.meta.d7;
    const cargas = P.diasDeCarga.length;
    const lista = T.h('ol', { class: 'funil-grande', role: 'list' });
    P.funil.forEach((d, i) => {
      const prox = P.funil[i + 1];
      const perda = prox ? d.v - prox.v : null;
      const n = T.nucleo(d.nucleo);
      const li = T.h(
        'li',
        { class: ['funil-degrau', d.operacional ? 'operacional' : null], style: { '--p': `${(d.v / max) * 100}%` }, 'data-explica': `funil-${d.id}`, tabindex: 0, role: 'button', 'aria-label': `${d.rotulo}: ${f.n(d.v)}. Ver explicação.` },
        T.h('span', { class: 'funil-rotulo' }, T.h('b', null, d.rotulo), d.detalhe ? T.h('small', null, d.detalhe) : null),
        T.h(
          'span',
          { class: 'funil-trilho' },
          T.h('span', { class: 'funil-barra' }),
          d.operacional && faixa
            ? T.h('span', { class: 'funil-alvo', style: { '--a0': `${(Math.min(faixa[0], max) / max) * 100}%`, '--a1': `${(Math.min(faixa[1], max) / max) * 100}%` } }, T.h('span', null, `meta${d7 ? ` ${f.data(d7)}` : ''} · ${f.n(faixa[0])}–${f.n(faixa[1])}`))
            : null
        ),
        T.h('span', { class: 'funil-valor' }, T.h('b', { class: 'num' }, f.n(d.v)), T.h('small', { class: 'tab' }, `${f.pct(d.pct)} · meta ${f.compacto(d.meta)}`)),
        T.h('span', { class: 'funil-nucleo' }, T.icone(n.icone), n.nome)
      );
      lista.appendChild(li);
      if (perda !== null) {
        const donoCanal = d.id === 'dono' && prox.id === 'canal';
        const gargalo = donoCanal && perda === maiorPerda;
        lista.appendChild(
          T.h('li', { class: ['funil-perda', gargalo ? 'gargalo' : null], 'aria-hidden': 'true' }, T.h('span', { class: 'tab' }, `−${f.n(perda)}`), donoCanal ? ` com dono e nunca falaram com o bot${gargalo ? ' — o gargalo' : ''}` : '')
        );
      }
    });
    return T.h(
      'section',
      { class: 'painel painel-3 funil-painel', id: 'funil', 'data-revela': '' },
      T.h('header', { class: 'painel-topo' }, T.h('h3', { class: 'painel-titulo' }, 'Da ficha ao piloto que trabalha'), vivo ? T.carimbo(prontos ? prontos.status : 'nao-medido', faixa ? `${f.n(vivo.v)} de ${f.n(faixa[0])} no mínimo` : f.n(vivo.v)) : null),
      T.h('p', { class: 'painel-como' }, `Funil aninhado: cada degrau está contido no anterior. A barra é proporcional aos ${f.n(max)} ativos; a faixa tracejada é a meta da Fase A. Clique num degrau para a explicação.`),
      lista,
      T.h(
        'div',
        { class: 'alerta-forte' },
        T.icone('agir'),
        T.h('div', null, T.h('b', null, 'Base criada não é base produtiva.'), ` Em ${f.n(L.meta.periodo.dias)} dias o sistema registrou ${f.n(P.totalFichas)} fichas; ${f.n(P.fichasDeCarga)} (${f.pct(P.fichasDeCargaPct)}) nasceram em ${extenso(cargas)} ${cargas === 1 ? 'dia' : 'dias'} de carga. A base que trabalha é de centenas; a base que existe é de milhares.`)
      ),
      T.h('p', { class: 'painel-leitura' }, T.h('b', null, G.rotuloLeitura()), P.funilLeitura),
      T.h('footer', { class: 'painel-rodape' }, T.h('span', { class: 'leitura painel-pagina' }, T.icone('livro'), 'p. 5, 26'))
    );
  }

  function leituraCrescimento(serie, acum, produziu) {
    const iCarga = serie.findIndex((p) => p.carga);
    const maior = serie.filter((p) => p.carga).reduce((m, p) => (!m || p.v > m.v ? p : m), null);
    const partes = [];
    if (iCarga > 0) partes.push(`Entre ${f.data(serie[0].d)} e ${f.data(serie[iCarga - 1].d)} a base levou ${f.n(iCarga)} dias para chegar a ${f.n(acum[iCarga - 1].v)} fichas`);
    if (maior) partes.push(`em ${f.data(maior.d)} ganhou ${f.n(maior.v)} num dia só`);
    const inicio = partes.length ? `${partes.join('; ')}.` : '';
    return `${inicio}${produziu ? ` A distância entre a curva e a linha dos ${f.n(produziu.v)} é o que foi criado e não produziu.` : ''}`.trim();
  }

  function crescimento() {
    const serie = T.dados.serie('fichas_piloto_dia');
    const acum = T.dados.serie('pilotos_acumulado');
    const parcial = serie.find((p) => p.parcial);
    const produziu = degrau('produziu');
    const cargas = extenso(P.diasDeCarga.length);
    return G.painel({
      id: 'cargas',
      titulo: `Como a base cresceu: ${cargas} degraus, ${cargas} cargas`,
      comoLer: `Fichas de piloto criadas por dia. Roxo = dia de carga em lote (conversão de fila).${parcial ? ` Azul claro = ${f.data(parcial.d)}, incompleto.` : ''}`,
      largura: 2,
      grafico: (el) => {
        const topo = T.h('div');
        const baixo = T.h('div', { class: 'sub-grafico' });
        el.append(topo, T.h('p', { class: 'sub-titulo leitura' }, `Total acumulado de fichas${produziu ? ` × os ${f.n(produziu.v)} que já produziram alguma vez` : ''}`), baixo);
        G.barrasDia(topo, {
          serie,
          altura: 230,
          nome: 'fichas criadas',
          cor: (p) => (p.carga ? 'var(--violeta)' : 'var(--eletrico)'),
          rotuloSe: (p) => p.carga,
        });
        G.linhas(baixo, {
          nome: 'acumulado de pilotos',
          altura: 170,
          x0: serie.length ? serie[0].d : L.meta.periodo.inicio,
          x1: acum.length ? acum[acum.length - 1].d : T.dados.diaMedido(),
          margemDir: 96,
          referencias: produziu ? [{ v: produziu.v, rotulo: `${f.n(produziu.v)} já produziram alguma vez`, cor: 'var(--tinta-2)' }] : [],
          series: [{ nome: 'fichas acumuladas', pontos: acum, cor: 'var(--eletrico)', area: true, rotuloFim: true }],
        });
      },
      legenda: [
        { rotulo: 'dia comum', cor: 'var(--eletrico)' },
        { rotulo: 'carga em lote', cor: 'var(--violeta)' },
        { rotulo: 'dia incompleto', cor: 'var(--parcial)' },
      ],
      leitura: leituraCrescimento(serie, acum, produziu),
      p: 6,
      tabela: { colunas: ['Dia', 'Fichas criadas', 'Acumulado'], linhas: serie.map((p, i) => [f.data(p.d), f.n(p.v), f.n(acum[i].v)]) },
    });
  }

  function diasDeCarga() {
    const outras = P.diasDeCarga.filter((c) => !c.daFila);
    const excecao = outras.length
      ? `${outras.length === 1 ? `O dia ${f.data(outras[0].dia)} é a exceção` : `Os dias ${juntar(outras.map((c) => f.data(c.dia)))} são a exceção`} — ${juntar(outras.map((c) => `${f.n(c.criados)} criados contra ${f.n(c.convertidos)} ${c.convertidos === 1 ? 'conversão' : 'conversões'}`))}. `
      : '';
    return G.painel({
      titulo: `Os ${extenso(P.diasDeCarga.length)} dias de carga: conversão de fila, não recrutamento`,
      comoLer: 'Quando pilotos criados e aspirantes convertidos no mesmo dia batem, a carga foi conversão de fila.',
      largura: 1,
      grafico: (el) => {
        el.appendChild(
          T.h(
            'ul',
            { class: 'cargas-lista' },
            P.diasDeCarga.map((c) =>
              T.h(
                'li',
                { class: c.daFila ? 'fila' : 'outra' },
                T.h('span', { class: 'cargas-dia' }, T.h('b', null, f.data(c.dia)), T.h('small', null, c.semana)),
                T.h('span', { class: 'cargas-num' }, T.h('b', { class: 'num' }, f.n(c.criados)), T.h('small', null, 'criados')),
                T.h('span', { class: 'cargas-num' }, T.h('b', { class: 'num' }, f.n(c.convertidos)), T.h('small', null, 'convertidos')),
                T.h('span', { class: 'cargas-veredito' }, T.icone(c.daFila ? 'lote' : 'info'), c.daFila ? 'da fila' : 'outra porta')
              )
            )
          )
        );
      },
      leitura: `${excecao}A data da ficha é o dia da conversão, não o dia em que a pessoa aceitou ser piloto.`,
      p: 6,
    });
  }

  function portas() {
    return G.painel({
      titulo: 'Por onde entram: quem se ofereceu produz',
      comoLer: `Só para as ${f.n(T.soma(P.portas, (p) => p.fichas))} fichas com origem gravada e mais de 7 dias de casa. Barra = passageiros por ficha; à direita, a fatia que já ativou.`,
      largura: 1,
      grafico: (el) =>
        G.barrasH(el, {
          itens: P.portas.map((p) => ({ rotulo: p.porta, sub: `${f.n(p.fichas)} fichas · ${f.n(p.passageiros)} passageiros`, v: p.passageirosPorFicha, texto: `${f.nFlex(p.passageirosPorFicha)} · ${f.pct(p.ativaramPct)} ativaram`, cor: p.id === 'lista' ? 'var(--referencia)' : 'var(--eletrico)' })),
          dica: (it) => T.dica.bloco([{ valor: it.texto, rotulo: it.sub, cor: it.cor, forma: 'barra' }], it.rotulo),
        }),
      leitura: P.portasLeitura,
      p: [8, 20],
    });
  }

  function coortes() {
    return G.painel({
      titulo: 'Coortes: a primeira hora diz o que a semana vai render',
      comoLer: 'Cada linha é uma semana de entrada. Ponto claro = ativou em 1 dia; ponto cheio = em 7 dias. Roxo = semana com carga em lote.',
      largura: 3,
      grafico: (el) => {
        const maxFicha = Math.max(1, ...P.coortes.map((c) => c.porFicha));
        const tabela = T.h(
          'div',
          { class: 'coortes' },
          T.h('div', { class: 'coortes-cab leitura' }, T.h('span', null, 'Semana'), T.h('span', null, 'Pilotos'), T.h('span', null, 'Ativação em 1 e 7 dias (0–100%)'), T.h('span', null, 'Passageiros por ficha')),
          P.coortes.map((c) =>
            T.h(
              'div',
              { class: ['coorte', c.carga ? 'carga' : null], tabindex: 0 },
              T.h('span', { class: 'coorte-semana' }, f.data(c.semana), c.aberta ? T.h('small', null, 'aberta') : null),
              T.h('span', { class: 'coorte-pilotos tab' }, f.n(c.pilotos)),
              T.h(
                'span',
                { class: 'coorte-trilho' },
                T.h('i', { class: 'coorte-faixa', style: { '--a': `${c.em1d}%`, '--b': `${c.em7d}%` } }),
                T.h('i', { class: 'coorte-p1', style: { '--x': `${c.em1d}%` } }),
                T.h('i', { class: 'coorte-p7', style: { '--x': `${c.em7d}%` } }),
                T.h('span', { class: 'coorte-rot tab', style: { '--x': `${c.em7d}%` } }, f.pct(c.em7d))
              ),
              T.h('span', { class: 'coorte-ficha' }, T.h('i', { style: { '--p': `${(c.porFicha / maxFicha) * 100}%` } }), T.h('b', { class: 'tab' }, f.nFlex(c.porFicha)))
            )
          )
        );
        el.appendChild(tabela);
        T.$$('.coorte', tabela).forEach((row, i) => {
          const c = P.coortes[i];
          T.dica.ligar(row, () =>
            T.dica.bloco(
              [
                { valor: f.pct(c.em1d), rotulo: 'ativaram em 1 dia', cor: 'var(--eletrico-claro)', forma: 'ponto' },
                { valor: f.pct(c.em7d), rotulo: 'ativaram em 7 dias', cor: 'var(--eletrico)', forma: 'ponto' },
                { valor: `${f.n(c.ativaram)} (${f.pct(c.ativaramPct)})`, rotulo: 'ativaram a qualquer momento', cor: 'var(--tinta-3)', forma: 'ponto' },
                { valor: f.n(c.passageiros), rotulo: 'passageiros da coorte', cor: 'var(--tinta-3)', forma: 'ponto' },
              ],
              `Semana de ${f.data(c.semana)}${c.carga ? ' · com carga' : ''}`
            )
          );
        });
      },
      leitura: P.coortesLeitura,
      p: 9,
      tabela: { colunas: ['Semana', 'Pilotos', 'Ativaram', 'Em 1 d', 'Em 7 d', 'Passageiros', 'Por ficha'], linhas: P.coortes.map((c) => [f.data(c.semana), f.n(c.pilotos), `${f.n(c.ativaram)} (${f.pct(c.ativaramPct)})`, f.pct(c.em1d), f.pct(c.em7d), f.n(c.passageiros), f.nFlex(c.porFicha)]) },
    });
  }

  function hora() {
    const horas = T.dados.serie('fichas_piloto_hora');
    const destaques = horas
      .map((v, h) => [v, h])
      .sort((a, b) => b[0] - a[0])
      .slice(0, 4)
      .map((x) => x[1]);
    return G.painel({
      titulo: 'A hora da ficha é o expediente de quem roda a carga',
      comoLer: `As ${f.n(T.soma(horas))} fichas pela hora de Brasília. Roxo = madrugada (0h às 5h).`,
      largura: 2,
      grafico: (el) =>
        G.colunas(el, {
          altura: 190,
          nome: 'fichas por hora',
          unidade: 'fichas criadas nesta hora',
          itens: horas.map((v, h) => ({ rotulo: `${h}h`, v, cor: h <= 5 ? 'var(--violeta)' : 'var(--eletrico)', destaque: destaques.includes(h) })),
          larguraMax: 16,
          passoRotulo: 34,
        }),
      leitura: P.horaLeitura,
      p: 7,
      nota: `As células de dia × hora das cargas respondem por ${f.pct(P.celulasDeCarga.pct)} das fichas: ${P.celulasDeCarga.detalhe}.`,
    });
  }

  function ficha() {
    const ativos = degrau('ativos');
    const maxFicha = Math.max(ativos ? ativos.v : 0, ...P.ficha.map((c) => c.v));
    const maxMetas = Math.max(ativos ? ativos.v : 0, ...P.metas.map((m) => m.pilotos));
    const dominante = P.metas.reduce((m, x) => (!m || x.pilotos > m.pilotos ? x : m), null);
    const mapa = P.ficha.find((c) => /mapa/i.test(c.campo));
    const leitura = [
      dominante && ativos ? `${f.n(dominante.pilotos)} dos ${f.n(ativos.v)} ativos (${f.pct(dominante.pct)}) estão no plano ${dominante.meta} — o valor padrão de quem entra por carga, não uma negociação.` : null,
      mapa ? `Só ${f.n(mapa.v)} (${f.pct(mapa.pct)}) receberam o mapa da região que deveriam trabalhar.` : null,
    ]
      .filter(Boolean)
      .join(' ');
    return G.painel({
      titulo: 'A ficha do piloto: quem falou com essa pessoa?',
      comoLer: ativos ? `Sobre os ${f.n(ativos.v)} pilotos ativos.` : null,
      largura: 1,
      grafico: (el) => {
        el.appendChild(T.h('div', { class: 'medidores' }, P.ficha.map((c) => T.comp.medidor({ v: c.v, max: maxFicha, rotulo: c.campo, formato: (v) => `${f.n(v)} · ${f.pct(c.pct)}`, cor: 'var(--eletrico)' }))));
        el.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Plano combinado na ficha'));
        G.barrasH(el, { compacta: true, max: maxMetas, itens: P.metas.map((m) => ({ rotulo: `plano ${m.meta}`, v: m.pilotos, texto: `${f.n(m.pilotos)} · ${f.pct(m.pct)}`, cor: dominante && m.meta === dominante.meta ? 'var(--eletrico)' : 'var(--eletrico-claro)' })) });
      },
      leitura,
      p: 10,
    });
  }

  function ultimaMensagem() {
    return G.painel({
      titulo: 'A base nunca foi acesa',
      comoLer: 'Tempo desde a última mensagem gravada na ficha. Hachura = campo vazio.',
      largura: 1,
      grafico: (el) =>
        G.colunas(el, {
          altura: 200,
          todosValores: true,
          nome: 'última mensagem',
          itens: P.ultimaMensagem.map((u) => ({ rotulo: u.faixa, v: u.v, cor: u.vazio ? 'var(--agir)' : 'var(--eletrico)', textura: u.vazio })),
          larguraMax: 34,
        }),
      leitura: P.ultimaMensagemLeitura,
      p: 10,
    });
  }

  function whatsapp() {
    const numeros = (L.central && L.central.numeros) || [];
    const alertaDe = (numero) => numeros.find((n) => n.numero === numero && /bloquead/i.test(n.alerta || ''));
    const bloqueado = (numero) => !!alertaDe(numero);
    const ordem = [...P.whatsappProducao].sort((a, b) => b.passageiros - a.passageiros);
    const total = T.soma(ordem, (w) => w.passageiros);
    const dois = ordem.slice(0, 2);
    const pctDois = total ? (T.soma(dois, (w) => w.passageiros) / total) * 100 : 0;
    const bloq = dois.map((w) => alertaDe(w.numero)).find(Boolean);
    const leitura = dois.length
      ? `${dois.map((w) => w.numero).join(' e ')} concentram ${f.pct(pctDois)} dos passageiros. Um bloqueio numa dessas contas derruba a maior parte do cadastro${bloq ? ` — e a ${bloq.numero} consta como ${bloq.alerta}` : ''}.`
      : '';
    return G.painel({
      titulo: `A produção passa por ${extenso(dois.length)} números de WhatsApp`,
      comoLer: 'Passageiros agrupados pelo número atual do piloto — não pelo número de cada mensagem.',
      largura: 1,
      grafico: (el) =>
        G.barrasH(el, {
          itens: P.whatsappProducao.map((w) => ({ rotulo: w.numero, sub: `${f.n(w.pilotos)} pilotos`, v: w.passageiros, texto: `${f.n(w.passageiros)} · ${f.pct(w.pct)}`, cor: bloqueado(w.numero) ? 'var(--agir)' : 'var(--eletrico)', palavra: bloqueado(w.numero) ? { estado: 'vermelho', texto: 'bloqueada?' } : null })),
        }),
      leitura,
      p: [10, 12],
    });
  }

  function fila() {
    const pp = P.prePilotos;
    const criadas = T.dados.serie('pre_piloto_criadas_dia');
    const convertidas = T.dados.serie('pre_piloto_convertidas_dia');
    const maiorDia = Math.max(1, ...criadas.map((p) => p.v), ...convertidas.map((p) => p.v));
    const passo = 10 ** Math.floor(Math.log10(maiorDia));
    const yMax = Math.ceil((maiorDia * 1.1) / passo) * passo;
    const limiarCor = yMax * 0.07;
    const limiarRotulo = yMax * 0.35;
    return G.painel({
      id: 'fila',
      titulo: 'A fila de aspirantes não é base: é agenda de ligações',
      comoLer: `Estado das ${f.n(pp.total)} fichas de aspirante e as ${f.n(pp.fontes.length)} maiores fontes. Cor da taxa de conversão: azul = 9 em 10; laranja = entre 3 e 9; vermelho = menos de 3 em 10.`,
      largura: 3,
      grafico: (el) => {
        const grade = T.h('div', { class: 'fila-grade' });
        const esq = T.h('div');
        const dir = T.h('div');
        grade.append(esq, dir);
        el.appendChild(grade);
        G.faixa(esq, {
          nome: 'estado das fichas de aspirante',
          segmentos: pp.estados.map((e) => ({ rotulo: `${e.estado} · ${f.n(e.comControlador)} com controlador`, v: e.v, cor: e.estado === 'na fila' ? 'var(--atencao)' : e.estado === 'virou piloto' ? 'var(--eletrico)' : 'var(--rosa)' })),
        });
        esq.appendChild(T.h('p', { class: 'sub-titulo leitura' }, 'Criadas (barras) e convertidas por dia — em gráficos separados, na mesma escala'));
        const a = T.h('div');
        const b = T.h('div');
        esq.append(a, b);
        G.barrasDia(a, { serie: criadas, altura: 130, nome: 'criadas', yMax, cor: (p) => (p.v > limiarCor ? 'var(--atencao)' : 'var(--referencia)'), rotuloSe: (p) => p.v > limiarRotulo, divisoes: 2 });
        G.barrasDia(b, { serie: convertidas, altura: 130, nome: 'convertidas em piloto', yMax, cor: () => 'var(--violeta)', rotuloSe: (p) => p.v > limiarCor, divisoes: 2 });
        G.barrasH(dir, {
          itens: pp.fontes.map((fo) => {
            const taxa = fo.viraramPiloto / fo.fichas;
            return {
              rotulo: fo.fonte,
              v: fo.fichas,
              texto: `${f.n(fo.fichas)} · ${f.n(fo.viraramPiloto)} viraram`,
              cor: 'var(--referencia)',
              marcas: [{ v: fo.viraramPiloto, cor: taxa >= 0.9 ? 'var(--eletrico)' : taxa >= 0.3 ? 'var(--atencao)' : 'var(--agir)', rotulo: 'viraram piloto' }],
              palavra: { estado: taxa >= 0.9 ? 'verde' : taxa >= 0.3 ? 'amarelo' : 'vermelho', texto: f.pct(taxa * 100, 0) },
            };
          }),
          max: Math.max(1, ...pp.fontes.map((fo) => fo.fichas)),
        });
      },
      leitura: pp.leitura,
      p: 11,
    });
  }

  T.modulos.pilotos = {
    titulo: 'Pilotos',
    render(main) {
      main.append(
        T.pag.abertura(P, 'pilotos', 'pilotos', { regua: P.regua.linhas, explicas: ['funil-ativos', null, null, 'funil-vivo'] }),
        T.comp.secao({ id: 'base', titulo: 'Base existente × base pronta', sub: 'O funil que decide a Fase A e a evolução que explica por que ele é fino no topo.' }, T.comp.grade('', funil(), crescimento(), diasDeCarga())),
        T.comp.secao({ id: 'portas', titulo: 'Por onde entram e o que produzem', sub: 'Portas de entrada, coortes semanais e o relógio das fichas.' }, T.comp.grade('', coortes(), portas(), hora())),
        T.comp.secao({ id: 'contato', titulo: 'Quem já foi contatado', sub: 'A ficha, a última mensagem, o número de WhatsApp e a fila que espera ligação.' }, T.comp.grade('', ficha(), ultimaMensagem(), whatsapp(), fila())),
        T.pag.fecho(P, P.regua)
      );
    },
  };
})();
