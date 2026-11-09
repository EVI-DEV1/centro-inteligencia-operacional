-- OPS Intelligence · esquema do banco (Supabase / Postgres 15+)
-- Rode no SQL Editor do Supabase. É idempotente: pode rodar de novo depois de atualizar.
--
-- Isolamento entre clientes: TODA tabela de dados tem cliente_id e uma política RLS que só libera linhas
-- de clientes que o usuário pode ver (ops_pode_ver). A API usa o JWT do próprio usuário, então mesmo um bug
-- no backend não consegue devolver dados de outro cliente. Só jobs de sincronização e webhooks usam a
-- chave de serviço, e eles sempre gravam com o cliente_id da integração que recebeu o evento.

create extension if not exists pgcrypto;

-- ---------- pessoas com login e papéis ----------
create table if not exists perfis (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  papel text not null default 'analista' check (papel in ('admin', 'gestor', 'analista', 'atendimento', 'cliente')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  segmento text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- quais clientes cada usuário (não admin) enxerga
create table if not exists acessos (
  user_id uuid not null references auth.users (id) on delete cascade,
  cliente_id uuid not null references clientes (id) on delete cascade,
  primary key (user_id, cliente_id)
);

create or replace function ops_eh_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis where user_id = auth.uid() and papel = 'admin' and ativo);
$$;

create or replace function ops_pode_ver(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select ops_eh_admin() or exists (
    select 1 from acessos a join perfis p on p.user_id = a.user_id
    where a.user_id = auth.uid() and a.cliente_id = cid and p.ativo
  );
$$;

create or replace function ops_pode_editar(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select ops_pode_ver(cid) and exists (
    select 1 from perfis where user_id = auth.uid() and ativo and papel in ('admin', 'gestor', 'atendimento')
  );
$$;

-- ---------- equipe da operação (pessoas vinculadas ao cliente; podem ou não ter login) ----------
create table if not exists pessoas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id) on delete cascade,
  nome text not null,
  email text,
  papel text not null default 'atendimento',
  user_id uuid references auth.users (id) on delete set null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ---------- integrações (tokens cifrados com OPS_CHAVE_CIFRA; nunca saem da API) ----------
create table if not exists integracoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id) on delete cascade,
  canal text not null check (canal in ('instagram', 'facebook', 'kommo', 'whatsapp')),
  conta_externa_id text not null,            -- ig-user-id, page-id, subdomínio Kommo, phone_number_id
  token_cifrado text,
  config jsonb not null default '{}'::jsonb,  -- mapa de etapas Kommo, temas por hashtag, criar lead automático...
  estado text not null default 'pendente' check (estado in ('pendente', 'ativo', 'atrasado', 'erro', 'sem_permissao', 'nao_configurado')),
  mensagem text,
  ultima_sync timestamptz,
  cursor jsonb not null default '{}'::jsonb,  -- até onde a sincronização incremental já foi
  criado_em timestamptz not null default now(),
  unique (cliente_id, canal),
  unique (canal, conta_externa_id)
);

-- ---------- métricas diárias normalizadas ----------
create table if not exists metricas_diarias (
  cliente_id uuid not null references clientes (id) on delete cascade,
  canal text not null,
  metrica text not null,
  dia date not null,
  valor numeric not null,
  atualizado_em timestamptz not null default now(),
  primary key (cliente_id, canal, metrica, dia)
);

create table if not exists conteudos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id) on delete cascade,
  canal text not null,
  externo_id text not null,
  formato text,
  tema text,
  campanha_id uuid,
  publicado_em timestamptz not null,
  legenda text,
  link text,
  miniatura text,
  metricas jsonb not null default '{}'::jsonb,
  conversas integer not null default 0,
  leads integer not null default 0,
  atualizado_em timestamptz not null default now(),
  unique (cliente_id, canal, externo_id)
);

-- ---------- campanhas e fases ----------
create table if not exists campanhas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id) on delete cascade,
  nome text not null,
  objetivo text,
  plataformas text[] not null default '{}',
  publico text,
  inicio date not null,
  fim date not null,
  meta_leads integer,
  orcamento numeric,
  acoes jsonb not null default '[]'::jsonb,
  criado_por uuid references auth.users (id),
  criado_em timestamptz not null default now(),
  check (fim >= inicio)
);
alter table conteudos drop constraint if exists conteudos_campanha_fk;
alter table conteudos add constraint conteudos_campanha_fk foreign key (campanha_id) references campanhas (id) on delete set null;

create table if not exists fases_campanha (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid not null references campanhas (id) on delete cascade,
  cliente_id uuid not null references clientes (id) on delete cascade,
  etapa text not null check (etapa in ('planejamento', 'preparacao', 'lancamento', 'captacao', 'qualificacao', 'conversao', 'analise')),
  status text not null default 'pendente' check (status in ('pendente', 'andamento', 'concluida', 'atrasada', 'bloqueada')),
  responsavel text,
  inicio date,
  fim date,
  meta text,
  indicador text,
  unique (campanha_id, etapa)
);

-- ---------- leads ----------
create table if not exists etapas_lead (
  cliente_id uuid not null references clientes (id) on delete cascade,
  id text not null,
  nome text not null,
  ordem integer not null,
  final text check (final in ('ganho', 'perdido')),
  primary key (cliente_id, id)
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id) on delete cascade,
  externo_id text,                 -- id no Kommo, wa_id cifrado etc.
  fonte text not null default 'cadastro',
  nome text not null,
  contato text,
  origem text not null default 'outros',
  campanha_id uuid references campanhas (id) on delete set null,
  responsavel text,
  etapa text not null default 'novo',
  entrada_em timestamptz not null default now(),
  qualificado_em timestamptz,
  convertido_em timestamptz,
  ultima_atividade_em timestamptz,
  proxima_acao text,
  valor numeric,
  link text,
  atualizado_em timestamptz not null default now(),
  unique (cliente_id, fonte, externo_id)
);
create index if not exists leads_cliente_entrada on leads (cliente_id, entrada_em);

create table if not exists interacoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  canal text,
  tipo text not null,               -- mensagem, ligacao, etapa, nota
  em timestamptz not null default now(),
  resumo text,
  autor text
);

-- ---------- conversas e eventos (sem conteúdo das mensagens: só o necessário para métricas) ----------
create table if not exists conversas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes (id) on delete cascade,
  canal text not null,
  contato_hash text not null,       -- HMAC do telefone/ID; o número não é guardado aqui
  iniciada_em timestamptz not null,
  ultima_msg_em timestamptz not null,
  primeira_resposta_em timestamptz,
  origem_ref text,                  -- id de anúncio/post quando a plataforma informa (Click-to-WhatsApp)
  lead_id uuid references leads (id) on delete set null,
  unique (cliente_id, canal, contato_hash, iniciada_em)
);
create index if not exists conversas_cliente_ini on conversas (cliente_id, iniciada_em);
create index if not exists conversas_contato on conversas (cliente_id, canal, contato_hash, ultima_msg_em desc);

create table if not exists eventos (
  cliente_id uuid not null references clientes (id) on delete cascade,
  canal text not null,
  ref text not null,                -- id do evento na origem (evita contar duas vezes em sincronizações sobrepostas)
  tipo text not null,               -- mensagem_recebida, comentario
  em timestamptz not null,
  primary key (cliente_id, canal, ref)
);
create index if not exists eventos_cliente_em on eventos (cliente_id, em);

-- ---------- RLS ----------
alter table perfis enable row level security;
alter table clientes enable row level security;
alter table acessos enable row level security;
alter table pessoas enable row level security;
alter table integracoes enable row level security;
alter table metricas_diarias enable row level security;
alter table conteudos enable row level security;
alter table campanhas enable row level security;
alter table fases_campanha enable row level security;
alter table etapas_lead enable row level security;
alter table leads enable row level security;
alter table interacoes enable row level security;
alter table conversas enable row level security;
alter table eventos enable row level security;

drop policy if exists perfis_ler on perfis;
create policy perfis_ler on perfis for select using (user_id = auth.uid() or ops_eh_admin());
drop policy if exists perfis_admin on perfis;
create policy perfis_admin on perfis for all using (ops_eh_admin()) with check (ops_eh_admin());

drop policy if exists clientes_ler on clientes;
create policy clientes_ler on clientes for select using (ops_pode_ver(id));
drop policy if exists clientes_admin on clientes;
create policy clientes_admin on clientes for all using (ops_eh_admin()) with check (ops_eh_admin());

drop policy if exists acessos_ler on acessos;
create policy acessos_ler on acessos for select using (user_id = auth.uid() or ops_eh_admin());
drop policy if exists acessos_admin on acessos;
create policy acessos_admin on acessos for all using (ops_eh_admin()) with check (ops_eh_admin());

-- integrações: usuários veem o estado; só admin altera. O token cifrado não é exposto (a API nunca o seleciona).
drop policy if exists integracoes_ler on integracoes;
create policy integracoes_ler on integracoes for select using (ops_pode_ver(cliente_id));
drop policy if exists integracoes_admin on integracoes;
create policy integracoes_admin on integracoes for all using (ops_eh_admin()) with check (ops_eh_admin());

-- tabelas de dados: ver = ops_pode_ver; escrever = ops_pode_editar (métricas só via serviço)
do $$
declare t text;
begin
  foreach t in array array['pessoas', 'campanhas', 'fases_campanha', 'etapas_lead', 'leads', 'interacoes'] loop
    execute format('drop policy if exists %1$s_ler on %1$s', t);
    execute format('create policy %1$s_ler on %1$s for select using (ops_pode_ver(cliente_id))', t);
    execute format('drop policy if exists %1$s_editar on %1$s', t);
    execute format('create policy %1$s_editar on %1$s for all using (ops_pode_editar(cliente_id)) with check (ops_pode_editar(cliente_id))', t);
  end loop;
  foreach t in array array['metricas_diarias', 'conteudos', 'conversas', 'eventos'] loop
    execute format('drop policy if exists %1$s_ler on %1$s', t);
    execute format('create policy %1$s_ler on %1$s for select using (ops_pode_ver(cliente_id))', t);
  end loop;
end $$;

-- ---------- agregações (SECURITY INVOKER: a RLS do chamador vale aqui dentro) ----------
create or replace function ops_conversas_diario(p_cliente uuid, p_de date, p_ate date)
returns table (dia date, canal text, conversas bigint, contatos bigint, tmr_min numeric)
language sql stable security invoker set search_path = public as $$
  select (iniciada_em at time zone 'America/Sao_Paulo')::date as dia, canal,
         count(*) as conversas,
         count(distinct contato_hash) as contatos,
         round(avg(extract(epoch from (primeira_resposta_em - iniciada_em)) / 60.0) filter (where primeira_resposta_em is not null)::numeric, 1) as tmr_min
  from conversas
  where cliente_id = p_cliente
    and iniciada_em >= (p_de::timestamp at time zone 'America/Sao_Paulo')
    and iniciada_em < ((p_ate + 1)::timestamp at time zone 'America/Sao_Paulo')
  group by 1, 2;
$$;

create or replace function ops_atividade(p_cliente uuid, p_de date, p_ate date)
returns table (dia date, dow int, hora int, canal text, v bigint)
language sql stable security invoker set search_path = public as $$
  select (em at time zone 'America/Sao_Paulo')::date,
         extract(dow from em at time zone 'America/Sao_Paulo')::int,
         extract(hour from em at time zone 'America/Sao_Paulo')::int,
         canal, count(*)
  from eventos
  where cliente_id = p_cliente
    and em >= (p_de::timestamp at time zone 'America/Sao_Paulo')
    and em < ((p_ate + 1)::timestamp at time zone 'America/Sao_Paulo')
  group by 1, 2, 3, 4;
$$;

-- etapas padrão do Kanban para cada cliente novo
create or replace function ops_etapas_padrao() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into etapas_lead (cliente_id, id, nome, ordem, final) values
    (new.id, 'novo', 'Novo', 1, null),
    (new.id, 'em_contato', 'Em contato', 2, null),
    (new.id, 'qualificado', 'Qualificado', 3, null),
    (new.id, 'negociacao', 'Em negociação', 4, null),
    (new.id, 'convertido', 'Convertido', 5, 'ganho'),
    (new.id, 'perdido', 'Perdido', 6, 'perdido')
  on conflict do nothing;
  return new;
end $$;
drop trigger if exists clientes_etapas on clientes;
create trigger clientes_etapas after insert on clientes for each row execute function ops_etapas_padrao();

-- LGPD: eventos e conversas antigos não precisam ficar para sempre
create or replace function ops_limpar_antigos() returns void
language sql security definer set search_path = public as $$
  delete from eventos where em < now() - interval '400 days';
  delete from conversas where ultima_msg_em < now() - interval '400 days' and lead_id is null;
$$;

-- Primeiro administrador: depois de criar o usuário em Authentication → Users, rode:
--   insert into perfis (user_id, nome, papel) values ('<uuid do usuário>', 'Seu nome', 'admin');
