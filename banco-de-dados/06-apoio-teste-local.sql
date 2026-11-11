-- Imitação mínima do Supabase (papéis, auth.users e auth.uid()), só para
-- rodar 04-script-criacao.sql e 05-verificacoes.sql num PostgreSQL local. No Supabase, não use.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
-- Igual ao Supabase: lê o "sub" do token (as duas formas que o PostgREST usa)
create or replace function auth.uid() returns uuid language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
  )::uuid $$;
grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;
-- Sem permissões padrão nas tabelas novas: o script de criação precisa dar
-- as permissões ele mesmo, como num projeto do Supabase que não as dá.
-- Storage: o mínimo para a regra do bucket de fotos
create schema if not exists storage;
create table if not exists storage.buckets (id text primary key, name text, public boolean,
  file_size_limit bigint, allowed_mime_types text[]);
create table if not exists storage.objects (id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id), name text, owner uuid);
alter table storage.objects enable row level security;
create or replace function storage.foldername(name text) returns text[] language sql immutable as $$
  select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
grant usage on schema storage to anon, authenticated;
grant all on storage.objects to authenticated;
grant select on storage.buckets to anon, authenticated;
-- Vault e pg_net: o mínimo para testar o lembrete por e-mail. Aqui o
-- "envio" só anota a chamada numa tabela.
create schema if not exists vault;
create table if not exists vault.decrypted_secrets (name text primary key, decrypted_secret text);
create schema if not exists net;
create table if not exists net.chamadas (id bigserial primary key, url text, headers jsonb, body jsonb);
create or replace function net.http_post(url text, body jsonb default '{}'::jsonb, params jsonb default '{}'::jsonb,
  headers jsonb default '{}'::jsonb, timeout_milliseconds integer default 5000) returns bigint
language sql as $$ insert into net.chamadas (url, headers, body) values (url, headers, body) returning id $$;
