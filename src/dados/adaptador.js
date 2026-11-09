(function () {
  'use strict';
  const T = window.T;
  const L = window.TORRE_LIVRO;
  const S = window.TORRE_SERIES;

  const dados = (T.dados = {
    fonte: {
      tipo: 'retrato-pdf',
      arquivo: 'livro-dos-dados-demonstracao.pdf',
      get medidoEm() {
        return L.meta.medidoEm;
      },
      get janela() {
        return L.meta.janela;
      },
    },
    livro: L,
    diaMedido: () => String(L.meta.medidoEm || '').slice(0, 10),
    serie: (nome) => {
      const s = S[nome];
      if (!s) throw new Error(`[torre] série inexistente: ${nome}`);
      return s;
    },
  });

  dados.mm7 = function () {
    const s = dados.serie('passageiros_dia');
    const out = [];
    for (let i = 6; i < s.length; i++) {
      if (s[i].parcial) continue;
      const janela = s.slice(i - 6, i + 1);
      out.push({ d: s[i].d, v: Math.round(T.soma(janela) / 7) });
    }
    return out;
  };

  dados.acumulado = function (nome) {
    let a = 0;
    return dados.serie(nome).map((p) => ({ d: p.d, v: (a += p.v), parcial: p.parcial }));
  };

  dados.produtividadeDia = function () {
    const px = dados.serie('passageiros_dia');
    const pl = dados.serie('pilotos_distintos_dia');
    const porDia = new Map(pl.map((p) => [p.d, p.v]));
    return px.map((p) => ({ d: p.d, v: porDia.get(p.d) ? p.v / porDia.get(p.d) : null, parcial: p.parcial })).filter((p) => p.v !== null);
  };

  dados.cenarios = function () {
    const C = L.passageiros.cenarios;
    const inicio = dados.diaMedido();
    const fimBase = L.meta.d7;
    const diaD = L.meta.diaD;
    const registrado = dados.acumulado('passageiros_dia');
    const curva = (ritmo, captura) => {
      const out = [{ d: inicio, v: C.registrado }];
      let v = C.registrado;
      for (let d = T.isoSomar(inicio, 1); d <= fimBase; d = T.isoSomar(d, 1)) out.push({ d, v: (v += ritmo) });
      const base = v;
      const porDia = (base * 4 * captura) / 7;
      for (let d = T.isoSomar(fimBase, 1); d <= diaD; d = T.isoSomar(d, 1)) out.push({ d, v: (v += porDia) });
      return { pontos: out, base, porDia, final: v };
    };
    const ritmoDe = (linha) => (linha.id === 'medio' ? C.ritmoAtual : linha.ritmo);
    const linhas = C.linhas.map((l) => ({ ...l, ...curva(ritmoDe(l), l.captura / 100) }));
    const reta = [];
    let v = C.registrado;
    for (let d = inicio; d <= diaD; d = T.isoSomar(d, 1)) {
      reta.push({ d, v });
      v += C.ritmoAtual;
    }
    return { registrado, linhas, reta, metaDeclarada: L.tresNumeros.metaDeclarada.v, projetada: L.tresNumeros.projetada.v };
  };

  dados.exigenciaDiaria = (resultado) => (resultado * 0.8) / 7;

  dados.contagemRegua = function (linhas) {
    const c = { verde: 0, amarelo: 0, vermelho: 0, 'nao-medido': 0 };
    for (const l of linhas || []) c[l.status] = (c[l.status] || 0) + 1;
    return c;
  };
  dados.piorEstado = function (linhas) {
    const c = dados.contagemRegua(linhas);
    if (c.vermelho) return 'vermelho';
    if (c.amarelo) return 'amarelo';
    if (c.verde) return 'verde';
    return 'nao-medido';
  };

  dados.regua = function (nucleo) {
    switch (nucleo) {
      case 'pilotos':
        return L.pilotos.regua.linhas;
      case 'passageiros':
        return L.passageiros.regua.linhas;
      case 'controladores':
        return L.controladores.regua.linhas;
      case 'central':
        return L.central.reguaFaseB.linhas;
      case 'operacao':
        return L.operacao.regua.linhas;
      case 'atendimento':
        return L.atendimento.regua.linhas;
      case 'alcance':
        return L.alcance.regua.linhas;
      default:
        return [];
    }
  };

  const coletaRedes = () => {
    const c = (L.alcance && Array.isArray(L.alcance.coleta) && L.alcance.coleta[0]) || {};
    const ultima = c.ultima ? String(c.ultima).slice(0, 10) : '2026-11-05';
    const dias = typeof c.paradaDias === 'number' ? c.paradaDias : 9.4;
    const semErro = c.erro === undefined || c.erro === null || c.erro === 'nenhum' || c.erro === 0;
    return { ultima, dias, semErro, erro: c.erro };
  };
  const desdePeca = (nome, reserva) => {
    const pecas = (L.central && Array.isArray(L.central.pecas) && L.central.pecas) || [];
    const p = pecas.find((x) => x.peca === nome);
    return p && p.desde ? p.desde : reserva;
  };
  const primeiroDia = (nome, reserva) => {
    const s = S[nome];
    return Array.isArray(s) && s.length ? T.fmt.data(s[0].d) : reserva;
  };

  dados.sensores = function (opts = {}) {
    const f = T.fmt;
    const estruturais = [
      { id: 'mensagens', nome: 'Mensagens recebidas', estado: 'atencao', detalhe: `só existem desde ${desdePeca('Mensagem recebida', primeiroDia('mensagens_dia', '22/10'))}; antes havia conversa, não havia guarda` },
      { id: 'falas', nome: 'Falas (texto escrito)', estado: 'atencao', detalhe: `só existem desde ${desdePeca('Fala', '07/11')}` },
      { id: 'rua', nome: 'Operação de rua formal', estado: 'sem-dados', detalhe: 'tabelas de rota, ausência e liberação vazias' },
      { id: 'captura', nome: 'Captura (mundo → registro)', estado: 'sem-dados', detalhe: 'nunca medida: falta denominador fora do sistema' },
    ];
    const bancos = Array.isArray(L.meta.bancos) ? L.meta.bancos : [];
    const lido = `lido em ${f.data(L.meta.medidoEm)}, ${L.meta.janela}`;
    const redes = coletaRedes();
    const fontes = bancos.map((b) =>
      b.id === 'redes'
        ? { id: b.id, nome: `${b.nome} (${b.id})`, estado: 'atrasado', detalhe: `coleta diária parada desde ${f.data(redes.ultima)} — ${f.nFlex(redes.dias, 1)} ${redes.dias === 1 ? 'dia' : 'dias'}, ${redes.semErro ? 'sem erro' : `com erro: ${redes.erro}`}` }
        : { id: b.id, nome: `${b.nome} (${b.id})`, estado: 'atualizado', detalhe: lido }
    );
    if (opts.soFontes) return fontes;
    return [...fontes, ...estruturais, { id: 'hoje', nome: `Dia ${f.data(L.meta.medidoEm)}`, estado: 'atencao', detalhe: 'incompleto em todas as séries diárias (lilás claro)' }];
  };
  dados.fontesParadas = () => dados.sensores({ soFontes: true }).filter((s) => s.estado === 'atrasado').length;
})();
