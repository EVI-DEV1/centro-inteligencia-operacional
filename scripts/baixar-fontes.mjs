// Baixa as fontes do OPS Intelligence (subset latin, woff2) para assets/fontes/ — roda uma vez.
// Archivo (variável: largura 62–125, peso 100–900) = títulos, números grandes e texto.
// B612 Mono = leituras de instrumento; foi desenhada pela Airbus para telas de cockpit.
// O build embute os arquivos em base64: o HTML final abre sem internet.
import fs from 'node:fs';
import path from 'node:path';

const destino = path.resolve(import.meta.dirname, '..', 'assets', 'fontes');
fs.mkdirSync(destino, { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=B612+Mono:wght@400;700&display=swap';

const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
const blocos = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)];
const saida = [];
for (const [, subset, corpo] of blocos) {
  if (subset !== 'latin') continue;
  const familia = corpo.match(/font-family:\s*'([^']+)'/)[1];
  const peso = corpo.match(/font-weight:\s*([^;]+);/)[1].trim();
  const largura = (corpo.match(/font-stretch:\s*([^;]+);/) || [])[1];
  const estilo = corpo.match(/font-style:\s*([^;]+);/)[1].trim();
  const src = corpo.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const nome = `${familia.replace(/\s+/g, '')}-${estilo}-${peso.replace(/\s+/g, '_')}.woff2`;
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
  fs.writeFileSync(path.join(destino, nome), buf);
  saida.push({ familia, peso, largura: largura ? largura.trim() : null, estilo, arquivo: nome, bytes: buf.length, range: (corpo.match(/unicode-range:\s*([^;]+);/) || [])[1] });
}
fs.writeFileSync(path.join(destino, 'fontes.json'), JSON.stringify(saida, null, 2));
console.log(saida.map((f) => `${f.arquivo} ${f.bytes}B ${f.largura || ''}`).join('\n'));
