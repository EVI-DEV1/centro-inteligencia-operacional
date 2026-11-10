/* Dados e integrações: estado das integrações do cliente, importação de CSV/Excel e exportações.
   A planilha importada vira métricas diárias do cliente (o mesmo formato que os conectores gravam),
   então a Visão Executiva e os demais gráficos passam a usá-la — marcada como "planilha" nas fontes. */
(function () {
  'use strict';
  const T = window.T;
  const f = T.fmt;
  const O = T.ops;
  const N = O.nucleo;
  const U = O.ui;

  // ---------- destinos possíveis de uma coluna: canal × métrica diária ----------
  const CANAIS_IMPORTAVEIS = ['instagram', 'facebook', 'kommo', 'whatsapp'];
  const ALVOS = CANAIS_IMPORTAVEIS.flatMap((canal) =>
    Object.entries(N.METRICAS)
      .filter(([, def]) => def.canais.includes(canal))
      .map(([metrica, def]) => ({ id: `${canal}:${metrica}`, canal, metrica, nome: `${N.canal(canal).nome} · ${def.nome}` }))
  );
  const PALAVRAS_CANAL = { instagram: ['instagram', 'insta', 'ig'], facebook: ['facebook', 'fb'], kommo: ['kommo', 'crm'], whatsapp: ['whatsapp', 'whats', 'zap', 'wa'] };
  const PALAVRAS_METRICA = {
    visitas_perfil: ['visita'],
    alcance: ['alcance', 'reach'],
    visualizacoes: ['visualiza', 'views', 'impress'],
    novos_seguidores: ['seguidor', 'follower'],
    interacoes: ['interac', 'engaj'],
    conversas_iniciadas: ['conversa', 'mensage'],
    contatos_unicos: ['contato'],
    tempo_primeira_resposta: ['resposta', 'tempo'],
  };

  function autoMapear(coluna) {
    const s = T.planilha.slug(coluna).replace(/-/g, '_');
    const exato = ALVOS.find((a) => s === `${a.canal}_${a.metrica}`);
    if (exato) return exato.id;
    const metrica = Object.keys(PALAVRAS_METRICA).find((m) => PALAVRAS_METRICA[m].some((p) => s.includes(p)));
    if (!metrica) return '';
    const canais = N.METRICAS[metrica].canais;
    const canal = canais.find((c) => PALAVRAS_CANAL[c].some((p) => s.split('_').includes(p) || s.includes(p.length > 3 ? p : `${p}_`))) || (canais.length === 1 ? canais[0] : null);
    return canal ? `${canal}:${metrica}` : '';
  }

  // ---------- importação (uma por cliente e modo, guardada no navegador) ----------
  const chave = () => `ops:importacao:${O.estado.modo}:${O.estado.cliente}`;
  const ler = () => {
    try {
      return JSON.parse(localStorage.getItem(chave()) || 'null');
    } catch (e) {
      return null;
    }
  };
  const recarregar = () => {
    O.invalidar();
    T.emit('dados-importados');
    T.emit('ops:filtro', {});
  };

  O.importacao = {
    atual: ler,
    ativa: () => !!ler(),
    aplicar(pacote) {
      try {
        localStorage.setItem(chave(), JSON.stringify(pacote));
      } catch (e) {
        T.aviso('Não foi possível guardar a planilha neste navegador.', 'agir');
        return;
      }
      T.aviso(`${pacote.arquivo}: ${f.n(pacote.linhas)} linhas aplicadas a ${O.clienteAtual().nome}`, 'firme');
      recarregar();
    },
    remover() {
      try {
        localStorage.removeItem(chave());
      } catch (e) {}
      T.aviso('Importação removida: o painel voltou aos dados das integrações', 'info');
      recarregar();
    },
    /** Sobrepõe as colunas mapeadas às métricas diárias do conjunto (chamado pela fonte ao carregar). */
    aplicarEm(cj) {
      const p = ler();
      if (!p || !cj) return cj;
      const destinos = Object.entries(p.mapa).filter(([, alvo]) => alvo);
      if (!destinos.length) return cj;
      const trocar = new Set();
      const novos = [];
      for (const [col, alvo] of destinos) {
        const [canal, metrica] = alvo.split(':');
        for (const r of p.registros) {
          trocar.add(`${r.d}|${canal}|${metrica}`);
          novos.push({ d: r.d, canal, metrica, v: r.valores[col], fonte: 'planilha' });
        }
        const con = (cj.conectores || []).find((c) => c.canal === canal);
        if (con) con.planilha = p.arquivo;
        else (cj.conectores = cj.conectores || []).push({ canal, estado: 'nao_configurado', planilha: p.arquivo, fornece: ['metricas'] });
      }
      cj.diario = (cj.diario || []).filter((x) => !trocar.has(`${x.d}|${x.canal}|${x.metrica}`)).concat(novos);
      return cj;
    },
  };

  // ---------- integrações ----------
  const ESTADO = { ativo: ['firme', 'Sincronizada'], atrasado: ['atencao', 'Atrasada'], erro: ['agir', 'Erro'], sem_permissao: ['agir', 'Sem permissão'], pendente: ['atencao', 'Pendente'], nao_configurado: ['nao-medido', 'Não configurada'] };
  const FORNECE = { metricas: 'métricas diárias', conteudos: 'publicações', leads: 'leads', conversas: 'conversas' };

  function integracoes(cj) {
    const p = ler();
    const cartoes = (cj.conectores || []).map((c) => {
      const [s, t] = ESTADO[c.estado] || ESTADO.nao_configurado;
      const canal = N.canal(c.canal);
      return T.h(
        'article',
        { class: 'ops-integracao', style: { '--c': canal.cor } },
        T.h('header', null, T.h('i'), T.h('b', null, canal.nome), T.h('span', { class: 'ops-estado', 'data-s': s }, t)),
        T.h('p', null, `Fornece ${(c.fornece || []).map((x) => FORNECE[x] || x).join(', ') || '—'}`),
        T.h('small', null, c.ultimaSync ? `Última sincronização: ${U.dataHora(c.ultimaSync)}` : 'Ainda não sincronizou'),
        c.mensagem ? T.h('p', { class: 'ops-integracao-msg' }, c.mensagem) : null,
        c.planilha ? T.h('small', null, `Complementada pela planilha ${c.planilha}`) : null
      );
    });
    cartoes.push(
      T.h(
        'article',
        { class: 'ops-integracao', style: { '--c': 'var(--violeta)' } },
        T.h('header', null, T.h('i'), T.h('b', null, 'Planilha CSV / Excel'), T.h('span', { class: 'ops-estado', 'data-s': p ? 'firme' : 'nao-medido' }, p ? 'Ativa' : 'Pronta')),
        T.h('p', null, p ? `${p.arquivo} · ${f.n(p.linhas)} linhas` : 'Traga métricas diárias que as integrações não cobrem.'),
        T.h('small', null, p ? `Importada em ${U.dataHora(p.em)}` : 'Use o importador logo abaixo')
      )
    );
    return U.cartao(
      { id: 'dados-integracoes', titulo: `Integrações de ${cj.cliente.nome}`, sub: 'De onde vêm os números deste cliente', classe: 'largo', rodape: null, acao: O.ehAdmin() ? T.h('a', { class: 'botao-secundario', href: '#/controladores?alvo=admin-integracoes' }, T.icone('conector'), O.ehDemo() ? 'Ver no Admin' : 'Conectar ou reconectar') : null },
      T.h('div', { class: 'ops-integracoes' }, cartoes),
      O.ehDemo() ? T.h('p', { class: 'ops-nota' }, T.icone('info'), 'Na demonstração os estados das integrações são simulados.') : null
    );
  }

  // ---------- importador ----------
  function importador(cj) {
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
    const erro = (msg) => T.limpar(resultado).appendChild(T.h('p', { class: 'importar-erro' }, T.icone('agir'), msg));

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
          T.h('select', { onchange: (e) => (mapa[c] = e.target.value) }, T.h('option', { value: '' }, 'Ignorar esta coluna'), ALVOS.map((a) => T.h('option', { value: a.id, selected: mapa[c] === a.id }, a.nome)))
        )
      );
      const previa = T.h(
        'div',
        { class: 'tabela-rolagem previa' },
        T.h(
          'table',
          null,
          T.h('thead', null, T.h('tr', null, T.h('th', null, est.colunaData), est.colunas.map((c) => T.h('th', null, c)))),
          T.h('tbody', null, est.registros.slice(0, 6).map((r) => T.h('tr', null, T.h('th', null, `${f.data(r.d)}/${r.d.slice(0, 4)}`), est.colunas.map((c) => T.h('td', { class: 'tab' }, f.nFlex(r.valores[c], 2))))))
        )
      );
      T.limpar(resultado).append(
        T.h('div', { class: 'importar-cab' }, T.icone('firme'), T.h('span', null, T.h('b', null, arquivo.name), ` · ${f.n(est.registros.length)} linhas · ${f.data(est.registros[0].d)} a ${f.data(est.registros.at(-1).d)} · ${est.colunas.length} ${est.colunas.length > 1 ? 'colunas numéricas' : 'coluna numérica'}`)),
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
                if (!Object.values(mapa).some(Boolean)) return erro('Escolha o destino de pelo menos uma coluna.');
                O.importacao.aplicar({ arquivo: arquivo.name, linhas: est.registros.length, colunaData: est.colunaData, colunas: est.colunas, registros: est.registros, mapa, em: new Date().toISOString() });
              },
            },
            T.icone('raio'),
            `Aplicar a ${cj.cliente.nome}`
          ),
          T.h('span', { class: 'importar-nota' }, 'Cada coluna substitui a métrica escolhida nos dias da planilha. Fica guardada só neste navegador e aparece como "planilha" nas fontes.')
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

    return U.cartao({ id: 'importar', titulo: 'Importar planilha', sub: 'O painel reconhece a coluna de data, detecta as numéricas e sugere o destino de cada uma.', classe: 'largo', rodape: null, acao: T.h('button', { class: 'botao-secundario', type: 'button', onclick: baixarModelo }, T.icone('download'), 'Baixar modelo') }, zona, resultado);
  }

  function baixarModelo() {
    const cols = ['instagram_alcance', 'instagram_visitas_perfil', 'facebook_alcance', 'whatsapp_conversas_iniciadas'];
    const hoje = O.hoje();
    const linhas = [['data', ...cols]];
    for (let i = 6; i >= 0; i--) linhas.push([N.somarDias(hoje, -i), ...cols.map(() => '')]);
    T.planilha.baixarCSV(linhas, 'ops-modelo-importacao.csv');
  }

  function importacaoAtiva() {
    const p = ler();
    if (!p) return null;
    const linhas = Object.entries(p.mapa)
      .filter(([, alvo]) => alvo)
      .map(([col, alvo]) => [col, (ALVOS.find((a) => a.id === alvo) || { nome: alvo }).nome, f.n(T.soma(p.registros, (r) => r.valores[col]))]);
    return U.cartao(
      { id: 'seus-dados', titulo: `Planilha ativa · ${p.arquivo}`, sub: `${f.n(p.linhas)} dias, de ${f.data(p.registros[0].d)} a ${f.data(p.registros.at(-1).d)}`, classe: 'largo', rodape: null, acao: T.h('button', { class: 'botao-perigo', type: 'button', onclick: () => O.importacao.remover() }, T.icone('lixo'), 'Remover importação') },
      T.h('div', { class: 'ops-tabela-rola' }, T.h('table', { class: 'ops-tabela' }, T.h('thead', null, T.h('tr', null, ['Coluna', 'Vira', 'Total importado'].map((c) => T.h('th', { scope: 'col' }, c)))), T.h('tbody', null, linhas.map((l) => T.h('tr', null, l.map((c) => T.h('td', null, c))))))),
      T.h('p', { class: 'ops-nota' }, T.icone('info'), 'Os números já estão na ', T.h('a', { href: '#/' }, 'Visão Executiva'), ' e nos demais gráficos, com a fonte marcada como planilha.')
    );
  }

  // ---------- exportações ----------
  function exportacoes() {
    const item = (icone, titulo, desc, fn) => T.h('button', { class: 'exportacao', type: 'button', onclick: fn }, T.h('span', { class: 'exportacao-icone' }, T.icone(icone)), T.h('span', null, T.h('b', null, titulo), T.h('small', null, desc)), T.icone('download'));
    return U.cartao(
      { id: 'exportar', titulo: 'Exportar', sub: `Respeita o filtro atual: ${U.periodoTexto(O.f().janela)}.`, rodape: null },
      T.h(
        'div',
        { class: 'exportacoes' },
        item('pdf', 'Relatório em PDF', 'a página atual, pronta para imprimir ou anexar', () => T.exportarRelatorio()),
        item('planilha', 'Leads do período (CSV)', 'origem, campanha, responsável, etapa e próxima ação', () => O.exportarLeads()),
        item('dados', 'Conjunto do cliente (JSON)', 'métricas, leads, conteúdos e campanhas, para outra ferramenta', () => O.exportarConjunto())
      )
    );
  }

  T.modulos.dados = {
    render: (raiz) =>
      U.pagina(raiz, (host, cj) => {
        host.append(
          ...[
            U.cabecalho({ sobretitulo: [T.icone('conector'), 'Workspace'], titulo: 'Dados e integrações', lead: `De onde vêm os números de ${cj.cliente.nome}, como trazer os seus e como levá-los para outro lugar.` }),
            integracoes(cj),
            importacaoAtiva(),
            T.h('div', { class: 'ops-linha l-2-1' }, importador(cj), exportacoes()),
          ].filter(Boolean)
        );
      }),
  };
})();
