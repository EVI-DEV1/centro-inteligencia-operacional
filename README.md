# OPS Intelligence

Plataforma **multicliente** de inteligência de marketing, leads e campanhas. Junta Instagram, Facebook, Kommo e
WhatsApp Business de cada cliente numa Visão Executiva com filtros sincronizados, análise de conteúdo, funil de
captação, Kanban de leads, campanhas em fases e insights que separam fato, hipótese e recomendação.

Interface em HTML, CSS e JavaScript puros (sem framework); backend em uma função serverless na Vercel com banco
Supabase (PostgreSQL com Row Level Security).

- **Demo:** `index.html` (abre direto do disco, em modo demonstração) · **Página do produto:** `produto.html`

> Evolução do antigo *Torre de Controle / Centro de Inteligência Operacional*. As rotas antigas
> (`#/pilotos`, `#/passageiros`, `#/controladores`, `#/plano`) continuam as mesmas para não quebrar links salvos.

## Páginas

| Página | Rota | O que responde |
|---|---|---|
| Visão Executiva | `#/` | 4 cards principais + todos os indicadores, evolução da audiência, origem dos leads, funil de captação, engajamento por plataforma, ranking de conteúdos, mapa de calor, campanhas ativas, evolução das conversões e insights |
| Central | `#/central` | Atividades recentes, alertas, pendências, atendimentos e atalhos |
| Análise de Conteúdo | `#/conteudo` | Ranking, formatos, temas, evolução do engajamento e conteúdos que geraram conversas ou leads |
| Campanhas | `#/plano` | Criar campanha (objetivo, plataformas, público, datas, meta, orçamento, ações) e acompanhar as 7 fases; inteligência com o histórico do cliente e metas × resultados |
| Leads | `#/passageiros` | Kanban (Novo, Em contato, Qualificado, Em negociação, Convertido, Perdido) e lista, com origem, campanha, responsável, histórico e próxima ação |
| Pessoas | `#/pilotos` | Equipe do cliente, papéis, permissões e resultados |
| Admin | `#/controladores` | Clientes, integrações, pessoas, permissões e relatórios |
| Comparar clientes | `#/comparar` | Só para Admin: crescimento, leads, engajamento e conversão normalizados |
| Dados e integrações | `#/dados` | Estado das integrações do cliente, importação de métricas por CSV/Excel e exportações |

**Filtros globais** (topo de todas as páginas): cliente, plataforma, período (hoje, 7, 30, 90 dias ou
personalizado), campanha e indicador. Tudo se atualiza sem recarregar a página.

## Regras de dados

- Cada número mostra **fonte, período e última atualização**.
- Métrica que a API não fornece aparece como **indisponível**, nunca como zero.
- O funil sinaliza as etapas **estimadas** (as redes só dão números agregados, não pessoas).
- Insights só aparecem com dados suficientes e trazem os números que os sustentam.
- **Modo demonstração** separado e marcado como *Simulação* em toda a tela. Os clientes da demo (Clube
  Horizonte, Studio Aurora e Clínica Vértice) não existem.
- **Planilha importada** (CSV ou .xlsx) vira métricas diárias do cliente, fica só no navegador e aparece como
  "planilha" na fonte de cada número.
- Os dados de um cliente nunca se misturam com os de outro: `cliente_id` em toda tabela, RLS no banco e
  conferência de acesso em cada rota da API.

## Modo real: o que precisa para ligar

O código das integrações está pronto; para funcionar com dados reais faltam contas e credenciais que só a
dona do projeto pode criar:

| O que | Onde | Para quê |
|---|---|---|
| Projeto Supabase | supabase.com → rode `supabase/schema.sql` no SQL Editor | Banco, login e isolamento por cliente |
| Projeto na Vercel | importe este repositório | Hospeda a interface e a API (`api/ops.js`) |
| App na Meta (Business) | developers.facebook.com, com revisão de permissões | Instagram e Facebook (`instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`, `read_insights`) e WhatsApp |
| Número no WhatsApp Business Cloud API | Meta Business → WhatsApp | Webhook de mensagens: novas conversas, 1ª resposta, leads do canal |
| Integração privada na Kommo | Kommo → Configurações → Integrações | Token de longa duração para leads, etapas e conversas |
| Chave da Anthropic (opcional) | console.anthropic.com | Texto dos insights; sem ela os insights continuam, gerados por regras |

Variáveis de ambiente na Vercel (Settings → Environment Variables):

```
SUPABASE_URL                 SUPABASE_ANON_KEY            SUPABASE_SERVICE_ROLE_KEY
OPS_CHAVE_CIFRA              # 32 bytes em base64: node -e "console.log(crypto.randomBytes(32).toString('base64'))"
CRON_SECRET                  # protege a sincronização diária (vercel.json → crons)
META_APP_SECRET              WHATSAPP_VERIFY_TOKEN        META_GRAPH_VERSION (padrão v23.0)
ANTHROPIC_API_KEY            # opcional
OPS_ORIGEM                   # opcional: domínio permitido no CORS
```

Depois: crie o primeiro usuário no Supabase Auth, dê a ele `papel = 'admin'` na tabela `perfis`, entre pelo
botão **Usar dados reais** e cadastre clientes e integrações na página Admin. O webhook do WhatsApp fica em
`/api/webhooks/whatsapp`. `GET /api/saude` diz o que ainda falta configurar.

Limitações das plataformas, já tratadas no código: a Meta descontinuou parte das métricas de página e de perfil,
então só as atuais são lidas; a Kommo limita 7 requisições por segundo; respostas 429 são repetidas respeitando
`Retry-After`; tokens ficam cifrados (AES-256-GCM) e nunca vão para o navegador.

## Arquitetura

```
index.html · produto.html      interface (abre do disco no modo demonstração)
src/ops/nucleo.js              cálculo único de indicadores, funil, origem, calor e insights (interface, API e testes)
src/ops/demo.js                gerador do modo demonstração (determinístico, por cliente)
src/ops/fonte.js               de onde vêm os dados: demo local ou API, com cache e estados de carregamento
src/ops/graficos.js · ui.js    gráficos SVG interativos, barra de filtros, login, diálogos
src/modulos/                   páginas (executiva, conteúdo, ops-paginas: campanhas/leads/central/pessoas/admin, comparar, dados)
src/nucleo/ · src/graficos/    utilitários da interface: DOM, eventos, ícones, tooltip, animação, leitura de CSV/.xlsx
api/ops.js · api/_lib/         API serverless: rotas, acesso por papel, conectores, sincronização incremental, webhooks
supabase/schema.sql            tabelas por cliente, RLS em todas, papéis (admin, gestor, analista, atendimento, cliente)
tests/ops.test.mjs             núcleo, demonstração, isolamento, permissões, webhooks e conectores
scripts/                       build do arquivo único e download das fontes
```

## Desenvolvimento

Sem dependências para instalar: basta Node 20 ou mais novo.

```bash
npm test                 # núcleo, demonstração, isolamento, permissões, webhooks e conectores
npm run check            # testes + arquivo único
node scripts/build.mjs   # arquivo único em dist/centro-inteligencia.html
```

A cada push, o GitHub Actions roda os testes e monta o arquivo único.

## Créditos

Fontes [Archivo](https://fonts.google.com/specimen/Archivo) e [B612 Mono](https://fonts.google.com/specimen/B612+Mono),
ambas sob a SIL Open Font License.
