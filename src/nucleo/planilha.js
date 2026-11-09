/* Importação e exportação de planilhas sem dependências.
   CSV: separador detectado (; , ou tab), aspas, números no formato brasileiro.
   XLSX: o arquivo é um ZIP; lemos o diretório central e descomprimimos com DecompressionStream('deflate-raw'). */
(function () {
  'use strict';
  const T = window.T;

  const P = (T.planilha = {});

  P.slug = (s) =>
    String(s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'dados';

  // ---------- CSV ----------
  P.lerCSV = function (texto) {
    texto = texto.replace(/^﻿/, '');
    const primeira = texto.split(/\r?\n/, 1)[0] || '';
    const contar = (c) => primeira.split(c).length - 1;
    const sep = [';', '\t', ','].sort((a, b) => contar(b) - contar(a))[0];
    const linhas = [];
    let linha = [];
    let campo = '';
    let aspas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (aspas) {
        if (c === '"' && texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else if (c === '"') aspas = false;
        else campo += c;
      } else if (c === '"') aspas = true;
      else if (c === sep) {
        linha.push(campo);
        campo = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && texto[i + 1] === '\n') i++;
        linha.push(campo);
        if (linha.some((x) => x.trim() !== '')) linhas.push(linha);
        linha = [];
        campo = '';
      } else campo += c;
    }
    linha.push(campo);
    if (linha.some((x) => x.trim() !== '')) linhas.push(linha);
    return linhas;
  };

  const celulaTexto = (c) => {
    if (c === null || c === undefined) return '';
    if (c instanceof Node) return c.textContent;
    return String(c);
  };
  P.paraCSV = (linhas) =>
    '﻿' +
    linhas
      .map((l) =>
        l
          .map((c) => {
            const t = celulaTexto(c);
            return /[;"\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
          })
          .join(';')
      )
      .join('\r\n');

  P.baixar = function (conteudo, nome, tipo) {
    const blob = conteudo instanceof Blob ? conteudo : new Blob([conteudo], { type: tipo || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = T.h('a', { href: url, download: nome, style: { display: 'none' } });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 500);
    T.aviso && T.aviso(`Baixando ${nome}`, 'download');
  };
  P.baixarCSV = (linhas, nome) => P.baixar(P.paraCSV(linhas), nome, 'text/csv;charset=utf-8');

  // ---------- XLSX ----------
  async function inflar(bytes) {
    if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador não abre .xlsx; salve como CSV.');
    const ds = new DecompressionStream('deflate-raw');
    const saida = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(saida).arrayBuffer());
  }

  async function lerZip(buffer) {
    const dv = new DataView(buffer);
    const u8 = new Uint8Array(buffer);
    let fim = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) {
        fim = i;
        break;
      }
    }
    if (fim < 0) throw new Error('Arquivo .xlsx inválido (não é um ZIP).');
    const total = dv.getUint16(fim + 10, true);
    let p = dv.getUint32(fim + 16, true);
    const arquivos = {};
    const dec = new TextDecoder();
    for (let k = 0; k < total; k++) {
      const metodo = dv.getUint16(p + 10, true);
      const tamComp = dv.getUint32(p + 20, true);
      const nLen = dv.getUint16(p + 28, true);
      const xLen = dv.getUint16(p + 30, true);
      const cLen = dv.getUint16(p + 32, true);
      const local = dv.getUint32(p + 42, true);
      const nome = dec.decode(u8.subarray(p + 46, p + 46 + nLen));
      arquivos[nome] = { metodo, tamComp, local };
      p += 46 + nLen + xLen + cLen;
    }
    return async (nome) => {
      const a = arquivos[nome];
      if (!a) return null;
      const ln = dv.getUint16(a.local + 26, true);
      const lx = dv.getUint16(a.local + 28, true);
      const ini = a.local + 30 + ln + lx;
      const dados = u8.subarray(ini, ini + a.tamComp);
      const bytes = a.metodo === 0 ? dados : await inflar(dados);
      return dec.decode(bytes);
    };
  }

  const colunaIndice = (ref) => {
    const letras = ref.replace(/[0-9]/g, '');
    let n = 0;
    for (const ch of letras) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n - 1;
  };

  P.lerXLSX = async function (buffer) {
    const abrir = await lerZip(buffer);
    const xml = (t) => new DOMParser().parseFromString(t, 'application/xml');
    const compartilhadas = [];
    const ss = await abrir('xl/sharedStrings.xml');
    if (ss) for (const si of xml(ss).getElementsByTagName('si')) compartilhadas.push(Array.from(si.getElementsByTagName('t')).map((t) => t.textContent).join(''));

    let caminho = 'xl/worksheets/sheet1.xml';
    const wb = await abrir('xl/workbook.xml');
    const rels = await abrir('xl/_rels/workbook.xml.rels');
    if (wb && rels) {
      const primeira = xml(wb).getElementsByTagName('sheet')[0];
      const rid = primeira && (primeira.getAttribute('r:id') || primeira.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'));
      const rel = Array.from(xml(rels).getElementsByTagName('Relationship')).find((r) => r.getAttribute('Id') === rid);
      if (rel) caminho = 'xl/' + rel.getAttribute('Target').replace(/^\/?xl\//, '');
    }
    const folha = await abrir(caminho);
    if (!folha) throw new Error('Não encontrei a primeira aba da planilha.');
    const linhas = [];
    for (const row of xml(folha).getElementsByTagName('row')) {
      const l = [];
      for (const c of row.getElementsByTagName('c')) {
        const i = colunaIndice(c.getAttribute('r') || 'A');
        const t = c.getAttribute('t');
        const v = c.getElementsByTagName('v')[0];
        let valor = v ? v.textContent : '';
        if (t === 's') valor = compartilhadas[Number(valor)] ?? '';
        else if (t === 'inlineStr') valor = Array.from(c.getElementsByTagName('t')).map((x) => x.textContent).join('');
        l[i] = valor;
      }
      for (let i = 0; i < l.length; i++) if (l[i] === undefined) l[i] = '';
      if (l.some((x) => String(x).trim() !== '')) linhas.push(l);
    }
    return linhas;
  };

  P.lerArquivo = async function (arquivo) {
    const nome = arquivo.name.toLowerCase();
    if (nome.endsWith('.xlsx')) return P.lerXLSX(await arquivo.arrayBuffer());
    if (nome.endsWith('.xls')) throw new Error('O formato .xls antigo não é suportado. Salve como .xlsx ou CSV.');
    return P.lerCSV(await arquivo.text());
  };

  // ---------- normalização ----------
  P.data = function (bruto) {
    const s = String(bruto ?? '').trim();
    let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    if ((m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/))) {
      const ano = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${ano}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    if (/^\d{5}(\.\d+)?$/.test(s)) {
      const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(Number(s)) * 864e5);
      return d.toISOString().slice(0, 10);
    }
    return null;
  };

  P.numero = function (bruto) {
    let s = String(bruto ?? '').trim().replace(/\s|R\$|%/g, '');
    if (s === '') return null;
    if (/^-?[\d.]+,\d+$/.test(s) || /^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  /** Converte linhas cruas em { colunas, registros } com a coluna de data e as numéricas detectadas. */
  P.estruturar = function (linhas) {
    if (!linhas || linhas.length < 2) throw new Error('A planilha precisa de um cabeçalho e pelo menos uma linha.');
    const cab = linhas[0].map((c, i) => String(c || '').trim() || `coluna_${i + 1}`);
    const corpo = linhas.slice(1);
    const iData = cab.findIndex((_, i) => corpo.filter((l) => P.data(l[i])).length >= corpo.length * 0.8);
    if (iData < 0) throw new Error('Não achei uma coluna de datas (use AAAA-MM-DD ou DD/MM/AAAA).');
    const numericas = cab
      .map((nome, i) => ({ nome, i }))
      .filter(({ i }) => i !== iData && corpo.filter((l) => P.numero(l[i]) !== null).length >= corpo.length * 0.8);
    if (!numericas.length) throw new Error('Não achei nenhuma coluna numérica além da data.');
    const registros = corpo
      .map((l) => ({ d: P.data(l[iData]), valores: Object.fromEntries(numericas.map(({ nome, i }) => [nome, P.numero(l[i]) ?? 0])) }))
      .filter((r) => r.d)
      .sort((a, b) => (a.d < b.d ? -1 : 1));
    return { colunaData: cab[iData], colunas: numericas.map((n) => n.nome), registros };
  };
})();
