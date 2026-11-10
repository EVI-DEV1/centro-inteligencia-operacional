// Junta o OPS Intelligence num único HTML autônomo: CSS e JS embutidos, fontes em data URI.
// uso (na raiz do projeto):
//   node scripts/build.mjs   → dist/centro-inteligencia.html (modo demonstração: abre do disco)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = path.join(RAIZ, 'dist', 'centro-inteligencia.html');

const ler = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');
const dataUri = (rel, tipo) => `data:${tipo};base64,${fs.readFileSync(path.join(RAIZ, rel)).toString('base64')}`;

let html = ler('index.html');
const faltando = [];

// CSS: cada <link rel="stylesheet"> vira <style>; url() relativas das fontes viram data URI
html = html.replace(/<link rel="stylesheet" href="([^"]+)" \/>/g, (_, href) => {
  if (!fs.existsSync(path.join(RAIZ, href))) {
    faltando.push(href);
    return '';
  }
  let css = ler(href);
  css = css.replace(/url\('([^']+\.woff2)'\)/g, (m, rel) => {
    const abs = path.join(path.dirname(href), rel);
    return `url('${dataUri(abs, 'font/woff2')}')`;
  });
  return `<style data-origem="${href}">\n${css}\n</style>`;
});

// JS: cada <script src> vira script embutido
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => {
  if (!fs.existsSync(path.join(RAIZ, src))) {
    faltando.push(src);
    return '';
  }
  // um "</script" dentro de string fecharia o bloco antes da hora
  const js = ler(src).replace(/<\/script/gi, '<\\/script');
  return `<script data-origem="${src}">\n${js}\n</script>`;
});

if (faltando.length) {
  console.error('Arquivos referenciados que não existem:', faltando.join(', '));
  process.exit(1);
}

// provas mínimas antes de gravar
const provas = [
  ['nenhum <link> de CSS externo sobrou', !/<link rel="stylesheet"/.test(html)],
  ['nenhum <script src> sobrou', !/<script src=/.test(html)],
  ['nenhuma fonte por caminho relativo', !/url\('\.\.\//.test(html)],
  ['fontes embutidas', html.includes('data:font/woff2;base64,')],
  ['núcleo e demonstração embutidos', html.includes('data-origem="src/ops/nucleo.js"') && html.includes('data-origem="src/ops/demo.js"')],
  ['selo de simulação no modo demonstração', html.includes("'Simulação')")],
];
const falhas = provas.filter(([, ok]) => !ok);
fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
fs.writeFileSync(SAIDA, html);
const kb = (fs.statSync(SAIDA).size / 1024).toFixed(0);
provas.forEach(([nome, ok]) => console.log(`${ok ? 'ok ' : 'FALHOU'}  ${nome}`));
console.log(`\n${path.relative(RAIZ, SAIDA)} · ${kb} KB\n`);
if (falhas.length) process.exit(1);
