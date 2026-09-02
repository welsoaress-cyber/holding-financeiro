-- =============================================================================
-- ERP Financeiro Pessoal — Migration 0001: FUNDAÇÃO
-- Escopo: entidades, membros, auditoria, RLS, criação automática no signup.
-- Nenhuma tabela financeira é criada aqui (Etapas 3+).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Tabelas
-- -----------------------------------------------------------------------------

-- Entidade = "pessoa financeira" dona dos dados. Chave de escopo de todo o sistema.
create table public.entidades (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null check (char_length(btrim(nome)) between 1 and 120),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
comment on table public.entidades is 'Escopo de dados: cada registro financeiro pertence a exatamente uma entidade.';

create type public.papel_membro as enum ('proprietario', 'membro');

create table public.entidade_membros (
  entidade_id uuid not null references public.entidades (id) on delete cascade,
  usuario_id  uuid not null references auth.users (id) on delete cascade,
  papel       public.papel_membro not null default 'membro',
  criado_em   timestamptz not null default now(),
  primary key (entidade_id, usuario_id)
);
create index entidade_membros_usuario_idx on public.entidade_membros (usuario_id);
comment on table public.entidade_membros is 'Vínculo usuário (auth.users) × entidade, com papel.';

-- Auditoria: trilha imutável. Sem FK para entidades de propósito: o histórico
-- precisa sobreviver a qualquer remoção futura.
create table public.auditoria (
  id           bigint generated always as identity primary key,
  entidade_id  uuid,
  tabela       text not null,
  registro_id  text not null,
  acao         text not null check (acao in ('INSERT', 'UPDATE', 'DELETE')),
  dados_antes  jsonb,
  dados_depois jsonb,
  usuario_id   uuid,
  quando       timestamptz not null default now()
);
create index auditoria_entidade_idx on public.auditoria (entidade_id, quando desc);
create index auditoria_registro_idx on public.auditoria (tabela, registro_id);
comment on table public.auditoria is 'Trilha de auditoria preenchida exclusivamente por trigger. Somente leitura para clientes.';

-- -----------------------------------------------------------------------------
-- 2. Funções de infraestrutura
-- -----------------------------------------------------------------------------

-- Mantém atualizado_em.
create or replace function public.tg_atualizado_em()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- Trigger genérico de auditoria. SECURITY DEFINER porque auditoria não possui
-- policy de escrita: só este caminho consegue gravar nela.
create or replace function public.tg_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_antes  jsonb;
  v_depois jsonb;
  v_ref    jsonb;
  v_ent    uuid;
begin
  if tg_op <> 'INSERT' then v_antes  := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then v_depois := to_jsonb(new); end if;
  v_ref := coalesce(v_depois, v_antes);

  v_ent := case
    when tg_table_name = 'entidades' then (v_ref ->> 'id')::uuid
    else (v_ref ->> 'entidade_id')::uuid
  end;

  insert into public.auditoria (entidade_id, tabela, registro_id, acao, dados_antes, dados_depois, usuario_id)
  values (
    v_ent,
    tg_table_name,
    coalesce(v_ref ->> 'id', concat_ws(':', v_ref ->> 'entidade_id', v_ref ->> 'usuario_id')),
    tg_op,
    v_antes,
    v_depois,
    auth.uid()
  );

  return coalesce(new, old);
end;
$$;

-- Entidades às quais o usuário autenticado pertence. SECURITY DEFINER para que
-- as policies possam consultá-la sem recursão de RLS.
create or replace function public.minhas_entidades()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select entidade_id from public.entidade_membros where usuario_id = auth.uid();
$$;

create or replace function public.sou_proprietario(p_entidade uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entidade_membros
    where entidade_id = p_entidade and usuario_id = auth.uid() and papel = 'proprietario'
  );
$$;

-- Ao criar usuário no Auth, cria a entidade dele e o torna proprietário.
create or replace function public.tg_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id   uuid;
  v_nome text;
begin
  v_nome := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'Minha entidade'
  );
  if char_length(v_nome) = 0 then v_nome := 'Minha entidade'; end if;

  insert into public.entidades (nome) values (left(v_nome, 120)) returning id into v_id;
  insert into public.entidade_membros (entidade_id, usuario_id, papel)
  values (v_id, new.id, 'proprietario');

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3. Triggers
-- -----------------------------------------------------------------------------
create trigger entidades_atualizado_em
  before update on public.entidades
  for each row execute function public.tg_atualizado_em();

create trigger entidades_auditoria
  after insert or update or delete on public.entidades
  for each row execute function public.tg_auditoria();

create trigger entidade_membros_auditoria
  after insert or update or delete on public.entidade_membros
  for each row execute function public.tg_auditoria();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_novo_usuario();

-- -----------------------------------------------------------------------------
-- 4. Privilégios (defesa em profundidade, além do RLS)
-- -----------------------------------------------------------------------------
revoke all on public.entidades        from anon, authenticated;
revoke all on public.entidade_membros from anon, authenticated;
revoke all on public.auditoria        from anon, authenticated;

grant select, update on public.entidades        to authenticated;
grant select         on public.entidade_membros to authenticated;
grant select         on public.auditoria        to authenticated;

revoke all on function public.tg_atualizado_em()   from public, anon, authenticated;
revoke all on function public.tg_auditoria()       from public, anon, authenticated;
revoke all on function public.tg_novo_usuario()    from public, anon, authenticated;
revoke all on function public.minhas_entidades()   from public, anon;
revoke all on function public.sou_proprietario(uuid) from public, anon;
grant execute on function public.minhas_entidades()     to authenticated;
grant execute on function public.sou_proprietario(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. RLS
-- -----------------------------------------------------------------------------
alter table public.entidades        enable row level security;
alter table public.entidade_membros enable row level security;
alter table public.auditoria        enable row level security;

-- entidades: membro lê; proprietário edita. Sem insert/delete via cliente
-- (criação só pelo trigger de signup; exclusão não existe nesta etapa).
create policy entidades_select on public.entidades
  for select to authenticated
  using (id in (select public.minhas_entidades()));

create policy entidades_update on public.entidades
  for update to authenticated
  using (public.sou_proprietario(id))
  with check (public.sou_proprietario(id));

-- entidade_membros: membro vê os membros da sua entidade. Sem escrita via cliente.
create policy entidade_membros_select on public.entidade_membros
  for select to authenticated
  using (entidade_id in (select public.minhas_entidades()));

-- auditoria: membro lê a trilha da sua entidade. Sem escrita via cliente.
create policy auditoria_select on public.auditoria
  for select to authenticated
  using (entidade_id in (select public.minhas_entidades()));
