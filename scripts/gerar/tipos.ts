// Contratos do gerador de dados fictícios: o que cada capítulo recebe e o que precisa devolver.
// Os tipos não geram código: o Node só os remove ao rodar (type stripping) e o `tsc` confere tudo antes.
import type * as Ancoras from './ancoras.ts';
import type * as Util from './util.ts';

/** Um ponto de série diária ou semanal: dia em ISO (AAAA-MM-DD) e valor. */
export interface Ponto {
  d: string;
  v: number;
  /** O dia da medição ainda estava em andamento: o painel desenha em azul claro. */
  parcial?: boolean;
  /** Dia de carga em massa (importação de planilha), marcado no gráfico. */
  carga?: boolean;
  /** Dia em que chegou um lote de material. */
  lote?: boolean;
}

export type Serie = Ponto[];

/** Marcas copiadas para o ponto do dia (ex.: { carga: true }). */
export type Marcas = Record<string, Omit<Partial<Ponto>, 'd' | 'v'>>;

/** Sorteio reproduzível: a mesma semente gera sempre os mesmos números. */
export interface Rng {
  float(): number;
  entre(min: number, max: number): number;
  int(min: number, max: number): number;
  escolher<T>(lista: readonly T[]): T;
  normal(): number;
  embaralhar<T>(lista: readonly T[]): T[];
  /** Variação multiplicativa em torno de 1 (nunca abaixo de 0,05). */
  ruido(intensidade: number): number;
}

/** Cor da régua de cada métrica. Qualquer outro texto é erro de digitação. */
export type StatusRegua = 'verde' | 'amarelo' | 'vermelho' | 'nao-medido';

export interface LinhaRegua {
  metrica: string;
  verde: string;
  amarelo: string;
  vermelho: string;
  hoje: string;
  hojeNota?: string;
  status: StatusRegua;
}

/**
 * Livro do painel: cada capítulo acrescenta as próprias chaves.
 * Tipagem gradual: o formato interno de cada capítulo ainda é livre (`any`);
 * o que é compartilhado (séries, régua, contexto) já tem contrato.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Livro = Record<string, any>;

/**
 * Séries do painel. As diárias seguem `Serie`; outras têm formato próprio
 * (horas do dia, faixas, mapas por conta) e ainda estão em tipagem gradual.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Series = Record<string, any>;

export interface Contexto {
  rng: Rng;
  A: typeof Ancoras;
  U: typeof Util;
  /** O que os capítulos anteriores já geraram. */
  capitulos: Livro;
  series: Series;
}

export interface SaidaCapitulo {
  livro: Livro;
  series?: Series;
}

/** Forma de cada arquivo scripts/gerar/cap-<nome>.ts. */
export interface ModuloCapitulo {
  gerar(ctx: Contexto): SaidaCapitulo;
  /** Lista de problemas em texto; vazia quando tudo fecha. */
  verificar?(saida: SaidaCapitulo, ctx: Contexto): string[];
}
