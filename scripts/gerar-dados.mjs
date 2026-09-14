// Gera os dados fictícios do painel: src/dados/livro.js e src/dados/series.js.
//
//   node scripts/gerar-dados.mjs                  semente padrão
//   node scripts/gerar-dados.mjs 12345            outra semente (os números-âncora ficam; o resto muda)
//   node scripts/gerar-dados.mjs --so pilotos     roda e confere só um capítulo, sem gravar nada
//
// Cada capítulo mora em scripts/gerar/cap-<nome>.mjs e exporta:
//   gerar(ctx)            → { livro: { chave: valor, … }, series: { nome: série, … } }
//   verificar(saida, ctx) → lista de problemas (texto); vazia = tudo fecha
// ctx = { rng, A (âncoras), U (util), capitulos (o que os capítulos anteriores já geraram) }.
// Nada é gravado se algum capítulo falhar na conferência.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as A from './gerar/ancoras.mjs';
import * as U from './gerar/util.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CAPITULOS = ['pilotos', 'passageiros', 'controladores', 'central', 'operacao', 'atendimento', 'alcance', 'base', 'fechamento'];
const ORDEM_LIVRO = ['meta', 'pares', 'coresDoLivro', 'glossario', 'metodo', 'tresNumeros', 'premissa2080', 'fases', 'pilotos', 'passageiros', 'controladores', 'central', 'operacao', 'atendimento', 'alcance', 'fechamento', 'conferencias'];

const args = process.argv.slice(2);
const so = args.includes('--so') ? args[args.indexOf('--so') + 1] : null;
const semente = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--so') || 'voo';

// valores que não podem ir para a tela: undefined, NaN, Infinity
function vazamentos(valor, caminho = '', out = []) {
  if (valor === undefined) out.push(`${caminho} é undefined`);
  else if (typeof valor === 'number' && !Number.isFinite(valor)) out.push(`${caminho} é ${valor}`);
  else if (typeof valor === 'string' && /undefined|NaN|\[object Object\]/.test(valor)) out.push(`${caminho} tem texto quebrado: "${valor.slice(0, 80)}"`);
  else if (Array.isArray(valor)) valor.forEach((v, i) => vazamentos(v, `${caminho}[${i}]`, out));
  else if (valor && typeof valor === 'object') for (const [k, v] of Object.entries(valor)) vazamentos(v, caminho ? `${caminho}.${k}` : k, out);
  return out;
}

const livro = {};
const series = {};
const problemas = [];
const alvos = so ? CAPITULOS.slice(0, CAPITULOS.indexOf(so) + 1) : CAPITULOS;
if (so && !CAPITULOS.includes(so)) throw new Error(`capítulo desconhecido: ${so} (${CAPITULOS.join(', ')})`);

for (const nome of alvos) {
  const arquivo = path.join(RAIZ, 'scripts', 'gerar', `cap-${nome}.mjs`);
  if (!fs.existsSync(arquivo)) {
    if (nome === so || !so) problemas.push(`${nome}: falta scripts/gerar/cap-${nome}.mjs`);
    continue;
  }
  let saida;
  const ctx = { rng: U.criarRng(`${semente}:${nome}`), A, U, capitulos: livro, series };
  try {
    const mod = await import(pathToFileURL(arquivo).href);
    saida = mod.gerar(ctx);
    const erros = [...(mod.verificar ? mod.verificar(saida, ctx) : []), ...vazamentos(saida.livro, nome), ...vazamentos(saida.series, `${nome}:series`)];
    for (const k of Object.keys(saida.series || {})) if (k in series) erros.push(`série repetida: ${k}`);
    if (erros.length) {
      // capítulos anteriores ao pedido em --so só servem de contexto: não travam a conferência dele
      if (!so || nome === so) problemas.push(...erros.map((e) => `${nome}: ${e}`));
      else console.warn(`(contexto) ${nome}: ${erros.length} problema(s) — rode --so ${nome}`);
    }
  } catch (e) {
    if (!so || nome === so) problemas.push(`${nome}: quebrou — ${e.stack || e.message}`);
    else console.warn(`(contexto) ${nome}: quebrou — ${e.message}`);
    continue;
  }
  Object.assign(livro, saida.livro || {});
  Object.assign(series, saida.series || {});
  if (nome === so) {
    console.log(`${nome}: ${Object.keys(saida.livro || {}).join(', ')} · ${Object.keys(saida.series || {}).length} séries`);
  }
}

if (problemas.length) {
  console.error(`\n${problemas.length} problema(s):\n- ${problemas.join('\n- ')}`);
  process.exit(1);
}
if (so) {
  console.log(`\n${so}: conferência ok (nada gravado)`);
  process.exit(0);
}

const faltando = ORDEM_LIVRO.filter((k) => !(k in livro));
if (faltando.length) {
  console.error(`Chaves do livro que nenhum capítulo gerou: ${faltando.join(', ')}`);
  process.exit(1);
}
const ordenado = Object.fromEntries(ORDEM_LIVRO.map((k) => [k, livro[k]]));
const cabecalho = (o) => `/* ${o} — DADOS FICTÍCIOS de demonstração, gerados por scripts/gerar-dados.mjs (semente "${semente}").\n   O Clube Horizonte não existe; pessoas, equipes, lugares e números foram inventados. */\n`;
fs.writeFileSync(path.join(RAIZ, 'src', 'dados', 'livro.js'), `${cabecalho('Livro do painel')}window.TORRE_LIVRO = ${JSON.stringify(ordenado, null, 1)};\n`);
fs.writeFileSync(path.join(RAIZ, 'src', 'dados', 'series.js'), `${cabecalho('Séries diárias e semanais')}window.TORRE_SERIES = ${JSON.stringify(series)};\n`);
console.log(`gravado: src/dados/livro.js · src/dados/series.js (${Object.keys(series).length} séries, semente "${semente}")`);
