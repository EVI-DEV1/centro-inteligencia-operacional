# Torre de Controle · Centro de Inteligência Operacional

Painel executivo em HTML, CSS e JavaScript puros, com o gerador de dados em TypeScript — sem framework, sem
dependências de execução. Transforma
um relatório de dados operacionais num centro de comando navegável: uma torre que é o próprio funil de
prontidão, dez capítulos com gráficos, uma régua de cores por métrica, a central de decisões e três modos
de uso (explorar, apresentar e telão).

> **Demonstração com dados fictícios.** O "Clube Horizonte" não existe. Pessoas, equipes, lugares, datas e
> números foram inventados e gerados por `scripts/gerar-dados.ts`. Os controladores aparecem só com primeiro
> nome e inicial. Qualquer semelhança com pessoas, organizações ou situações reais é coincidência.

## Como abrir

Baixe o repositório e abra `index.html` no Chrome, Edge ou Firefox. Não precisa de servidor nem de internet.

Para gerar um arquivo único, com CSS, JavaScript e fontes embutidos:

```bash
node scripts/build.mjs
```

O resultado sai em `dist/centro-inteligencia.html`.

## A história que o painel conta

O Clube Horizonte, um programa de indicação de um clube de viagens, prepara o **Dia D · abertura da
temporada**. *Pilotos* (embaixadores) indicam e cadastram *passageiros* pelo WhatsApp; *controladores*
coordenam os pilotos. O livro de dados foi medido 22 dias antes do Dia D, e a tese do painel é que os números
de hoje medem **prontidão, não resultado**: a base existe, a base pronta ainda não.

| Página | O que responde |
|---|---|
| Visão geral | A torre-funil, os três números (projetada, real, contabilizados), os cenários e a pista até o Dia D |
| Pilotos | Quantos existem de verdade, como foram criados e quais produzem |
| Passageiros | Ritmo diário, relógio dos cadastros, cenários e times |
| Controladores | Quem carrega a rede, a rodada de expectativa e os pilotos sem dono |
| Central Horizonte | Bot, chamados e a capacidade provada contra a exigida |
| Operação | Material, estoque, entregas, campo, visitas e uso do sistema |
| Atendimento | Tempo até a baixa, concentração, fila e assuntos |
| Alcance | Redes, comentários, acervo — e a coleta que parou |
| Caminho para o Dia D | Fases, marcos, provas e perguntas em aberto |
| Central de Decisão | 21 decisões (agir hoje × atenção), cada uma ligada ao dado que a sustenta |

Detalhes que valem a pena explorar:

- **Cada número abre um explicador**: o que é, por que importa, o que os dados mostram, o que ele *não* é e
  a página do livro de onde saiu.
- **Divergências não são escondidas**: quando o próprio livro traz dois valores para a mesma coisa, o painel
  mostra os dois e sinaliza a conferência em vez de escolher um calado.
- **Estado sempre com ícone e palavra** (agir, atenção, firme, não medido), nunca só cor.
- **Modo apresentação** (tecla `P`) com roteiro e holofote; **telão** (tecla `T`) avança sozinho.
- Atalhos: `0`–`9` capítulos · `N` oculta nomes · `Esc` sai dos modos.

## Os dados

Os dados ficam em `src/dados/livro.js` e `src/dados/series.js` e são gerados, não digitados:

```bash
node scripts/gerar-dados.ts              # semente padrão
node scripts/gerar-dados.ts outra-seed   # outro conjunto fictício com as mesmas âncoras
node scripts/gerar-dados.ts --so central # confere um capítulo sem gravar
node scripts/gerar-dados.ts --conferir   # confere todos os capítulos sem gravar
```

O gerador é escrito em **TypeScript** e roda direto no Node 22.18 ou mais novo, sem etapa de compilação: o Node
remove os tipos ao executar e o `tsc` confere tudo antes (`npm install` e depois `npm run typecheck`).

- `scripts/gerar/ancoras.ts` guarda, uma vez só, os números que aparecem em mais de um capítulo.
- Cada capítulo (`scripts/gerar/cap-*.ts`) gera primeiro as séries e deriva delas os números do texto.
- Cada capítulo tem um `verificar()`: somas, percentuais, picos e médias precisam fechar com o que a tela diz.
  **Se alguma conta não fechar, nada é gravado.**

### TypeScript

- `scripts/gerar/tipos.ts` é o contrato do gerador: `Ponto` e `Serie` (séries diárias), `Rng` (sorteio com
  semente), `StatusRegua` (só `verde`, `amarelo`, `vermelho` ou `nao-medido`) e a forma de cada capítulo
  (`gerar(ctx: Contexto): SaidaCapitulo` e `verificar(...)`).
- O núcleo (`gerar-dados.ts`, `util.ts`, `ancoras.ts`, `tipos.ts`) está em modo `strict` completo
  (`tsconfig.json`).
- Os capítulos estão em **tipagem gradual** (`tsconfig.capitulos.json`): o contrato de entrada e saída é
  conferido, e o formato interno do livro de cada capítulo ainda aceita `any`. O próximo passo é tipar o livro
  capítulo a capítulo e ligar `noImplicitAny` e `strictNullChecks` também ali.
- A migração não mudou nenhum número: o gerador produz exatamente os mesmos `livro.js` e `series.js` de antes.

A cada push, o GitHub Actions (`.github/workflows/conferencia.yml`) confere os tipos, confere que todas as contas
fecham, confere que os dados publicados são exatamente os que o gerador produz e monta o arquivo único.

## Estrutura

```
index.html              página que carrega os módulos
src/dados/              livro e séries gerados, adaptador (a única porta entre dados e telas), relações
src/nucleo/             utilitários, estado, movimento, ícones, dicas
src/graficos/           barras, linhas, barras horizontais e escalas em SVG, sem biblioteca
src/componentes/        régua, medidores, seções
src/cena/               a torre, a pista até o Dia D e as partículas
src/modulos/            as dez páginas
src/estilo/             tokens e folhas de estilo
scripts/                gerador de dados (TypeScript) e build do arquivo único
assets/fontes/          Archivo e B612 Mono (woff2)
```

## Vocabulário do clube fictício

| Termo | O que é |
|---|---|
| Piloto | Embaixador que indica e cadastra passageiros pelo WhatsApp |
| Passageiro | Pessoa indicada e cadastrada por um piloto |
| Controlador | Coordena um grupo de pilotos; tem login no painel |
| Aspirante | Quem ainda pode virar piloto |
| Plano | Meta do piloto (20, 40; 100 e 200 nas embaixadas) |
| Projetada · Real · Contabilizados | Soma das metas · expectativa lançada pelos controladores · cadastros no banco |
| Base pronta | Pilotos com dono, canal aberto, produção e atividade na semana |
| Convite | Código de adesão enviado a cada passageiro para o Dia D |

## Créditos

Fontes [Archivo](https://fonts.google.com/specimen/Archivo) e [B612 Mono](https://fonts.google.com/specimen/B612+Mono),
ambas sob a SIL Open Font License.
