// Sorteio reproduzível e ferramentas para montar séries que fecham com os totais do livro fictício.
import type { Marcas, Ponto, Rng, Serie } from './tipos.ts';

// ---------------------------------------------------------------- sorteio com semente
function hash(texto: string): () => number {
  let h = 1779033703 ^ texto.length;
  for (let i = 0; i < texto.length; i++) {
    h = Math.imul(h ^ texto.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export function criarRng(semente: string | number): Rng {
  let a = hash(String(semente))();
  const float = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng: Rng = {
    float,
    entre: (min: number, max: number) => min + float() * (max - min),
    int: (min: number, max: number) => Math.floor(min + float() * (max - min + 1)),
    escolher: <T,>(lista: readonly T[]): T => lista[Math.floor(float() * lista.length)],
    normal: () => {
      const u = Math.max(float(), 1e-9);
      const v = float();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    embaralhar: <T,>(lista: readonly T[]): T[] => {
      const out = [...lista];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(float() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    // variação multiplicativa em torno de 1: ruido 0,2 → quase sempre entre 0,6 e 1,4
    ruido: (intensidade: number) => Math.max(0.05, 1 + rng.normal() * intensidade),
  };
  return rng;
}

// ---------------------------------------------------------------- contas
export const arred = (v: number, casas = 1): number => {
  const m = 10 ** casas;
  return Math.round(v * m) / m;
};
export const pct = (parte: number, todo: number, casas = 1): number => (todo ? arred((parte / todo) * 100, casas) : 0);
export const soma = <T = any,>(lista: readonly T[], pegar: (x: T) => unknown = (x) => x): number =>
  lista.reduce((s, x) => s + (Number(pegar(x)) || 0), 0);

// reparte um inteiro em partes inteiras proporcionais aos pesos (maior resto), respeitando um mínimo
export function distribuir(total: number, pesos: readonly number[], minimo = 0): number[] {
  const n = pesos.length;
  const livre = total - minimo * n;
  if (livre < 0) throw new Error(`distribuir: total ${total} menor que o mínimo × ${n}`);
  const somaPesos = soma(pesos);
  const brutos = pesos.map((p) => (somaPesos ? (p / somaPesos) * livre : livre / n));
  const partes = brutos.map((b) => Math.floor(b));
  let resto = livre - soma(partes);
  const ordem = brutos.map((b, i) => [b - Math.floor(b), i]).sort((x, y) => y[0] - x[0]);
  for (let k = 0; resto > 0; k = (k + 1) % n, resto--) partes[ordem[k][1]]++;
  return partes.map((p) => p + minimo);
}

// ---------------------------------------------------------------- calendário
const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const somarDias = (iso: string, n: number): string => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const diasEntre = (a: string, b: string): number =>
  Math.round((new Date(`${b}T12:00:00Z`).getTime() - new Date(`${a}T12:00:00Z`).getTime()) / 864e5);
export const intervalo = (inicio: string, fim: string): string[] => {
  const out: string[] = [];
  for (let d = inicio; d <= fim; d = somarDias(d, 1)) out.push(d);
  return out;
};
export const diaSemana = (iso: string): string => DIAS_SEMANA[new Date(`${iso}T12:00:00Z`).getUTCDay()];
// segunda-feira da semana do dia
export const semanaDe = (iso: string): string => somarDias(iso, -((new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7));

// ---------------------------------------------------------------- séries
// Série diária [{ d, v }] que soma exatamente `total`.
// forma(dia, i) devolve o peso relativo do dia (padrão: seg–sex 1, sáb 0,75, dom 0,55);
// fixos = { 'AAAA-MM-DD': valor } entram exatamente como estão (picos, dias de carga, zeros);
// marcas = { 'AAAA-MM-DD': { carga: true } } são copiadas para o ponto.
export interface OpcoesSerieDiaria {
  dias: readonly string[];
  total: number;
  rng?: Rng | null;
  /** Peso relativo do dia; padrão: seg–sex 1, sáb 0,75, dom 0,55. */
  forma?: ((dia: string, i: number) => number) | null;
  ruido?: number;
  /** Dias com valor exato (picos, dias de carga, zeros). */
  fixos?: Record<string, number>;
  marcas?: Marcas;
  /** Dia ainda em andamento, marcado como parcial. */
  parcial?: string | null;
}

export function serieDiaria({ dias, total, rng, forma, ruido = 0.25, fixos = {}, marcas = {}, parcial = null }: OpcoesSerieDiaria): Serie {
  const pesoPadrao = (d: string): number => ({ dom: 0.55, 'sáb': 0.75 } as Record<string, number>)[diaSemana(d)] || 1;
  const fixosSoma = soma(Object.values(fixos));
  const livres = dias.filter((d) => !(d in fixos));
  const pesos = livres.map((d, i) => (forma ? forma(d, i) : pesoPadrao(d)) * (rng ? rng.ruido(ruido) : 1));
  const partes = distribuir(total - fixosSoma, pesos);
  const porDia: Record<string, number> = Object.fromEntries(livres.map((d, i) => [d, partes[i]]));
  return dias.map((d): Ponto => ({ d, v: d in fixos ? fixos[d] : porDia[d], ...(marcas[d] || {}), ...(d === parcial ? { parcial: true } : {}) }));
}

export const acumular = (serie: Serie): Serie => {
  let a = 0;
  return serie.map((p) => ({ d: p.d, v: (a += p.v), ...(p.parcial ? { parcial: true } : {}) }));
};

// média móvel de 7 dias como o painel desenha (inclui o próprio dia; ignora o dia parcial)
export const mediaMovel7 = (serie: Serie): Serie => {
  const out: Serie = [];
  for (let i = 6; i < serie.length; i++) {
    if (serie[i].parcial) continue;
    out.push({ d: serie[i].d, v: Math.round(soma(serie.slice(i - 6, i + 1), (p) => p.v) / 7) });
  }
  return out;
};

// ---------------------------------------------------------------- texto em pt-BR
export const fmt = {
  n: (v: number) => Math.round(v).toLocaleString('pt-BR'),
  dec: (v: number, casas = 1) => v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }),
  pct: (v: number, casas = 1) => `${v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`,
  data: (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`,
  mil: (v: number, casas = 1) => `${(v / 1000).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })} mil`,
};
