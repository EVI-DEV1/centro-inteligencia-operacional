/* Dados e integrações: conectores, importação de CSV/Excel, contrato de dados e exportações. */
(function () {
  'use strict';
  const T = window.T;
  const G = T.graf;
  const f = T.fmt;
  const L = T.dados.livro;
  const S = window.TORRE_SERIES;

  // Séries que uma planilha pode substituir, com palavras que ajudam no mapeamento automático.
  const ALVOS = [
    { id: 'passageiros_dia', nome: 'Passageiros por dia', chaves: ['passageiro', 'cadastro', 'indicac', 'lead'] },
    { id: 'pilotos_distintos_dia', nome: 'Pilotos distintos por dia', chaves: ['piloto', 'embaixador', 'vendedor'] },
    { id: 'conversas_novas_dia', nome: 'Conversas novas por dia', chaves: ['conversa', 'whatsapp', 'mensage'] },
    { id: 'chamados_abertos_dia', nome: 'Chamados abertos por dia', chaves: ['aberto', 'ticket', 'chamado'] },
    { id: 'chamados_fechados_dia', nome: 'Chamados fechados por dia', chaves: ['fechado', 'resolvido'] },
    { id: 'entregas_dia', nome: 'Entregas por dia', chaves: ['entrega', 'kit'] },
    { id: 'pedidos_dia', nome: 'Pedidos por dia', chaves: ['pedido', 'venda', 'order'] },
    { id: 'baixas_dia', nome: 'Baixas de atendimento por dia', chaves: ['baixa', 'atendiment'] },
  ];
  const CHAVE = 'torre:importacao';
  const originais = {};

  const autoMapear = (coluna) => {
    const s = T.planilha.slug(coluna).replace(/-/g, '_');
    const exato = ALVOS.find((a) => a.id === s);
    if (exato) return exato.id;
    const por = ALVOS.find((a) => a.chaves.some((k) => s.includes(k)));
    return por ? por.id : '';
  };

  // ---------- estado da importação ----------
  const imp = (T.importacao = {
    atual: null,
    ativa: () => imp.atual,
    aplicar(pacote, { silencioso = false } = {}) {
      imp.restaurar({ silencioso: true });
      for (const [col, alvo] of Object.entries(pacote.mapa)) {
        if (!alvo) continue;
        if (!(alvo in originais)) originais[alvo] = S[alvo];
        S[alvo] = pacote.registros.map((r) => ({ d: r.d, v: r.valores[col] }));
      }
      imp.atual = pacote;
      try {
        localStorage.setItem(CHAVE, JSON.stringify(pacote));
      } catch (e) {}
      if (!silencioso) T.aviso(`${pacote.arquivo}: ${f.n(pacote.linhas)} linhas aplicadas ao painel`, 'firme');
      T.emit('dados-importados', pacote);
    },
    restaurar({ silencioso = false } = {}) {
      for (const [k, v] of Object.entries(originais)) {
        S[k] = v;
        delete originais[k];
      }
      const tinha = !!imp.atual;
      imp.atual = null;
      try {
        localStorage.removeItem(CHAVE);
      } catch (e) {}
      if (tinha && !silencioso) {
        T.aviso('Importação removida: o painel voltou aos dados de demonstração', 'info');
        T.emit('dados-importados', null);
      }
    },
  });

  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    if (salvo && salvo.registros) imp.aplicar(salvo, { silencioso: true });
  } catch (e) {}

  // Com uma planilha ativa, "hoje" para o filtro de período é o último dia da planilha.
  const ultimoOriginal = T.filtro.ultimoDia;
  T.filtro.ultimoDia = () => (imp.atual && imp.atual.registros.length ? imp.atual.registros.at(-1).d : ultimoOriginal());

  // ---------- exportações ----------
  T.exportar = {
    series() {
      const linhas = [['serie', 'data', 'valor', 'observacao']];
      for (const [nome, s] of Object.entries(S)) {
        if (!Array.isArray(s) || !s.length || typeof s[0] !== 'object' || !('d' in s[0])) continue;
        for (const p of T.filtro.recortar(s)) linhas.push([nome, p.d, p.v ?? p.h, p.parcial ? 'dia incompleto' : p.carga ? 'carga em lote' : '']);
      }
      T.planilha.baixarCSV(linhas, `torre-series-${T.filtro.periodo}.csv`);
    },
    decisoes() {
      const linhas = [['nivel', 'area', 'decisao', 'metrica', 'unidade', 'acao', 'paginas_do_livro']];
      for (const a of T.alertas) linhas.push([a.nivel === 'agir' ? 'agir hoje' : 'atenção', a.area, a.titulo, a.metrica.v, a.metrica.u, a.acao, [].concat(a.p || []).join(', ')]);
      T.planilha.baixarCSV(linhas, 'torre-decisoes.csv');
    },
    livro() {
      T.planilha.baixar(JSON.stringify({ livro: L, series: S }, null, 2), 'torre-livro-de-dados.json', 'application/json');
    },
    modelo() {
      const cols = ['passageiros_dia', 'pilotos_distintos_dia', 'conversas_novas_dia', 'entregas_dia'];
      const base = S.passageiros_dia;
      const linhas = [['data', ...cols], ...base.map((p) => [p.d, ...cols.map((c) => ((S[c].find((q) => q.d === p.d) || {}).v ?? 0))])];
      T.planilha.baixarCSV(linhas, 'torre-modelo-importacao.csv');
    },
  };

  // ---------- página ----------
  function conectores() {
    const sens = Object.fromEntries(T.dados.sensores({ soFontes: true }).map((s) => [s.id, s]));
    const EST = { atualizado: ['ok', 'Sincronizado'], atrasado: ['parado', 'Coleta parada'] };
    const est = (id, padrao) => (sens[id] ? EST[sens[id].estado] || ['ok', 'Conectado'] : padrao);
    const lista = [
      { nome: 'PostgreSQL · Central Horizonte', tipo: 'Banco de dados', icone: 'dados', e: est('central', ['ok', 'Conectado']), det: 'bot, pilotos, passageiros e chamados · leitura de agregados' },
      { nome: 'WhatsApp Business Cloud API', tipo: 'Mensageria', icone: 'central', e: ['ok', 'Webhook ativo'], det: 'conversas, etapas do bot e status das linhas' },
      { nome: 'Torre · operação', tipo: 'Banco de dados', icone: 'operacao', e: est('operacao', ['ok', 'Conectado']), det: 'material, estoque, refeição, visitas e atendimento' },
      { nome: 'Instagram e Facebook Graph', tipo: 'Redes sociais', icone: 'alcance', e: est('redes', ['parado', 'Coleta parada']), det: sens.redes ? sens.redes.detalhe : 'seguidores, alcance e comentários' },
      { nome: 'Planilha CSV / Excel', tipo: 'Arquivo', icone: 'planilha', e: imp.atual ? ['ok', 'Planilha ativa'] : ['livre', 'Pronto para importar'], det: imp.atual ? `${imp.atual.arquivo} · ${f.n(imp.atual.linhas)} linhas` : 'arraste um .csv ou .xlsx logo abaixo', acao: '#importar' },
      { nome: 'API REST / JSON', tipo: 'Integração', icone: 'conector', e: ['livre', 'Contrato publicado'], det: 'qualquer sistema que entregue o formato de série abaixo', acao: '#contrato' },
    ];
    return T.h(
      'div',
      { class: 'conectores' },
      lista.map((c) =>
        T.h(
          c.acao ? 'a' : 'article',
          { class: 'conector', href: c.acao || null, 'data-estado': c.e[0], 'data-revela': '' },
          T.h('span', { class: 'conector-icone' }, T.icone(c.icone)),
          T.h('span', { class: 'conector-corpo' }, T.h('small', null, c.tipo), T.h('b', null, c.nome), T.h('span', { class: 'conector-det' }, c.det)),
          T.h('span', { class: 'conector-estado' }, T.h('i'), c.e[1])
        )
      )
    );
  }

  function importador() {
    const resultado = T.h('div', { class: 'importar-resultado', 'aria-live': 'polite' });
    const entrada = T.h('input', { type: 'file', accept: '.csv,.txt,.tsv,.xlsx', class: 'visualmente-oculto', id: 'arquivo-importar' });
    const zona = T.h(
      'label',
      { class: 'zona-soltar', for: 'arquivo-importar' },
      T.h('span', { class: 'zona-icone' }, T.icone('upload')),
      T.h('b', null, 'Arraste sua planilha aqui ou clique para escolher'),
      T.h('span', null, 'CSV (vírgula, ponto e vírgula ou tab) ou Excel .xlsx · uma coluna de data e colunas numéricas'),
      entrada
    );

    const erro = (msg) => {
      T.limpar(resultado).appendChild(T.h('p', { class: 'importar-erro' }, T.icone('agir'), msg));
    };

    async function processar(arquivo) {
      if (!arquivo) return;
      T.limpar(resultado).appendChild(T.h('p', { class: 'importar-lendo' }, 'Lendo ', T.h('b', null, arquivo.name), '…'));
      let est;
      try {
        est = T.planilha.estruturar(await T.planilha.lerArquivo(arquivo));
      } catch (e) {
        erro(e.message || String(e));
        return;
      }
      const mapa = Object.fromEntries(est.colunas.map((c) => [c, autoMapear(c)]));
      const seletores = est.colunas.map((c) =>
        T.h(
          'label',
          { class: 'mapa-linha' },
          T.h('span', null, T.h('b', null, c), T.h('small', null, `total ${f.n(T.soma(est.registros, (r) => r.valores[c]))}`)),
          T.h(
            'select',
            { onchange: (e) => (mapa[c] = e.target.value) },
            T.h('option', { value: '' }, 'Só analisar (não substituir)'),
            ALVOS.map((a) => T.h('option', { value: a.id, selected: mapa[c] === a.id }, `Substituir: ${a.nome}`))
          )
        )
      );
      const previa = T.h(
        'div',
        { class: 'tabela-rolagem previa' },
        T.h(
          'table',
          null,
          T.h('thead', null, T.h('tr', null, T.h('th', null, est.colunaData), est.colunas.map((c) => T.h('th', null, c)))),
          T.h('tbody', null, est.registros.slice(0, 6).map((r) => T.h('tr', null, T.h('th', null, f.data(r.d) + '/' + r.d.slice(0, 4)), est.colunas.map((c) => T.h('td', { class: 'tab' }, f.nFlex(r.valores[c], 2))))))
        )
      );
      T.limpar(resultado).append(
        T.h(
          'div',
          { class: 'importar-cab' },
          T.icone('firme'),
          T.h('span', null, T.h('b', null, arquivo.name), ` · ${f.n(est.registros.length)} linhas · ${f.data(est.registros[0].d)} a ${f.data(est.registros.at(-1).d)} · ${est.colunas.length} ${est.colunas.length > 1 ? 'colunas numéricas' : 'coluna numérica'}`)
        ),
        previa,
        T.h('h3', { class: 'mapa-titulo' }, 'Para onde vai cada coluna'),
        T.h('div', { class: 'mapa' }, seletores),
        T.h(
          'div',
          { class: 'importar-acoes' },
          T.h(
            'button',
            {
              class: 'botao-primario',
              type: 'button',
              onclick: () => {
                imp.aplicar({ arquivo: arquivo.name, linhas: est.registros.length, colunaData: est.colunaData, colunas: est.colunas, registros: est.registros, mapa });
              },
            },
            T.icone('raio'),
            'Aplicar ao painel'
          ),
          T.h('span', { class: 'importar-nota' }, 'As séries mapeadas passam a alimentar todos os gráficos e o filtro de período. Os números consolidados do livro continuam do retrato.')
        )
      );
    }

    entrada.addEventListener('change', () => processar(entrada.files[0]));
    ['dragenter', 'dragover'].forEach((ev) =>
      zona.addEventListener(ev, (e) => {
        e.preventDefault();
        zona.classList.add('sobre');
      })
    );
    ['dragleave', 'drop'].forEach((ev) => zona.addEventListener(ev, () => zona.classList.remove('sobre')));
    zona.addEventListener('drop', (e) => {
      e.preventDefault();
      processar(e.dataTransfer.files[0]);
    });

    return T.h(
      'section',
      { class: 'cartao cartao-largo', id: 'importar', 'data-revela': '' },
      T.h(
        'header',
        { class: 'cartao-topo' },
        T.h('div', null, T.h('h2', { class: 'cartao-titulo' }, 'Importar planilha'), T.h('p', { class: 'cartao-sub' }, 'Traga seus próprios números: o painel reconhece a coluna de data, detecta as numéricas e sugere o mapeamento.')),
        T.h('button', { class: 'botao-fantasma', type: 'button', onclick: T.exportar.modelo }, T.icone('download'), 'Baixar modelo')
      ),
      zona,
      resultado
    );
  }

  function seusDados() {
    const p = imp.atual;
    if (!p) return null;
    const cores = ['var(--eletrico)', 'var(--ciano)', 'var(--violeta)', 'var(--rosa)', 'var(--atencao)', 'var(--firme)'];
    const regs = T.filtro.recortar(p.registros);
    const cards = p.colunas.slice(0, 6).map((c, i) => {
      const tot = T.soma(regs, (r) => r.valores[c]);
      return T.h(
        'article',
        { class: 'kpi', style: { '--kpi-cor': cores[i % cores.length] } },
        T.h('header', { class: 'kpi-topo' }, T.h('span', { class: 'kpi-icone' }, T.icone('planilha')), T.h('span', { class: 'kpi-rotulo' }, c), p.mapa[c] ? T.h('span', { class: 'kpi-tag' }, 'no painel') : null),
        T.h('div', { class: 'kpi-linha' }, T.h('b', { class: 'kpi-valor tab' }, f.compacto(tot))),
        T.h('p', { class: 'kpi-sub' }, `média ${f.nFlex(tot / regs.length, 1)} por dia · pico ${f.nFlex(Math.max(...regs.map((r) => r.valores[c])), 1)}`)
      );
    });
    const corpo = T.h('div', { class: 'cartao-grafico' });
    const series = p.colunas.slice(0, 6).map((c, i) => ({ nome: c, pontos: p.registros.map((r) => ({ d: r.d, v: r.valores[c] })), cor: cores[i % cores.length], rotuloFim: true }));
    G.linhas(corpo, { nome: 'seus dados', altura: 280, x0: p.registros[0].d, x1: p.registros.at(-1).d, series, margemDir: 110, formatoEixo: f.compacto, formatoDica: (v) => f.nFlex(v, 2) });
    return T.h(
      'section',
      { class: 'cartao cartao-largo', id: 'seus-dados', 'data-revela': '' },
      T.h(
        'header',
        { class: 'cartao-topo' },
        T.h('div', null, T.h('h2', { class: 'cartao-titulo' }, `Seus dados · ${p.arquivo}`), T.h('p', { class: 'cartao-sub' }, `${T.filtro.rotulo()} · ${f.n(p.linhas)} linhas importadas`)),
        T.h('button', { class: 'botao-perigo', type: 'button', onclick: () => imp.restaurar() }, T.icone('lixo'), 'Remover importação')
      ),
      T.h('div', { class: 'kpis kpis-compactos' }, cards),
      corpo
    );
  }

  function contrato() {
    const exemplo = `GET /api/v1/series/passageiros_dia?de=2026-10-12&ate=2026-11-14

{
  "serie": "passageiros_dia",
  "unidade": "cadastros",
  "fuso": "America/Sao_Paulo",
  "pontos": [
    { "d": "2026-11-12", "v": 298 },
    { "d": "2026-11-13", "v": 301 },
    { "d": "2026-11-14", "v": 114, "parcial": true }
  ]
}`;
    return T.h(
      'section',
      { class: 'cartao cartao-inteiro', id: 'contrato', 'data-revela': '' },
      T.h('header', { class: 'cartao-topo' }, T.h('div', null, T.h('h2', { class: 'cartao-titulo' }, 'Contrato de dados'), T.h('p', { class: 'cartao-sub' }, 'O mesmo formato que o gerador TypeScript produz — tipado em scripts/gerar/tipos.ts.'))),
      T.h('div', { class: 'contrato-corpo' }, T.h('pre', { class: 'codigo' }, T.h('code', null, exemplo)),
      T.h('ul', { class: 'contrato-regras' }, T.h('li', null, T.h('b', null, 'd'), ' data ISO no fuso de Brasília'), T.h('li', null, T.h('b', null, 'v'), ' valor numérico do dia'), T.h('li', null, T.h('b', null, 'parcial'), ' dia ainda aberto (desenhado em lilás claro)'), T.h('li', null, T.h('b', null, 'carga'), ' entrada em lote, separada do ritmo orgânico'), T.h('li', null, 'CSV e Excel seguem a mesma ideia: uma coluna de data e uma coluna por série.')))
    );
  }

  function exportacoes() {
    const item = (icone, titulo, desc, fn) => T.h('button', { class: 'exportacao', type: 'button', onclick: fn }, T.h('span', { class: 'exportacao-icone' }, T.icone(icone)), T.h('span', null, T.h('b', null, titulo), T.h('small', null, desc)), T.icone('download'));
    return T.h(
      'section',
      { class: 'cartao', id: 'exportar', 'data-revela': '' },
      T.h('header', { class: 'cartao-topo' }, T.h('div', null, T.h('h2', { class: 'cartao-titulo' }, 'Exportar'), T.h('p', { class: 'cartao-sub' }, `Respeita o filtro atual: ${T.filtro.rotulo().toLowerCase()}.`))),
      T.h(
        'div',
        { class: 'exportacoes' },
        item('pdf', 'Relatório em PDF', 'a página atual, pronta para imprimir ou anexar', () => T.exportarRelatorio()),
        item('planilha', 'Todas as séries (CSV)', `${Object.keys(S).length} séries diárias em formato longo`, T.exportar.series),
        item('decisao', 'Decisões (CSV)', `${T.alertas.length} decisões com métrica, ação e página`, T.exportar.decisoes),
        item('dados', 'Livro de dados (JSON)', 'livro e séries completos, para outra ferramenta', T.exportar.livro)
      )
    );
  }

  T.modulos.dados = {
    render(raiz) {
      raiz.append(
        T.h(
          'header',
          { class: 'painel-cabeca', 'data-revela': '' },
          T.h(
            'div',
            null,
            T.h('p', { class: 'sobretitulo' }, T.icone('conector'), 'Workspace'),
            T.h('h1', { class: 'painel-h1' }, 'Dados e integrações'),
            T.h('p', { class: 'painel-lead' }, 'De onde vêm os números, como trazer os seus e como levá-los para outro lugar.')
          )
        ),
        conectores(),
        T.h('div', { class: 'painel-grade' }, seusDados(), importador(), exportacoes(), contrato())
      );
    },
  };
})();
