-- =====================================================================
-- Vértice · atualização do banco de 12/11/2026: feedback dentro do sistema
-- Para o banco que JÁ ESTÁ no ar: só acrescenta, não apaga dado nenhum.
-- Rode depois da atualização de 11/11.
--
-- Como usar: no painel do Supabase, abrir "SQL Editor", colar este arquivo
-- inteiro e executar uma vez. Rodar de novo não estraga nada.
--
-- O que entra (RF32, RN27): a tabela feedback, em que qualquer pessoa
-- grava a sua resposta, e a tabela equipe, com as contas que leem as
-- respostas na tela "Respostas do feedback". Depois de rodar, ponha as
-- contas da equipe (troque pelos e-mails das contas de vocês no Vértice):
--   insert into equipe (id_usuario)
--   select id from auth.users where email in ('email-1@exemplo.com', 'email-2@exemplo.com');
-- O mesmo resultado sai do 04-script-criacao.sql num projeto novo.
-- =====================================================================

begin;

create table if not exists equipe (
  id_usuario   uuid primary key references auth.users (id) on delete cascade,
  data_criacao timestamptz not null default now()
);

create table if not exists feedback (
  id_feedback uuid primary key default gen_random_uuid(),
  nota        smallint not null check (nota between 1 and 5),
  funcionou   varchar(1000),
  travou      varchar(1000),
  faltou      varchar(1000),
  contato     varchar(120),
  origem      varchar(12) not null default 'visitante'
              check (origem in ('visitante', 'demonstracao', 'conta')),
  lida        boolean not null default false,
  data_envio  timestamptz not null default now()
);
create index if not exists ix_feedback_data on feedback (data_envio desc);

create or replace function eh_equipe() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from equipe where id_usuario = auth.uid());
$$;

-- Quem envia não escolhe a data nem a marca de lida, e o texto em branco
-- vira vazio. Depois de enviada, a resposta não muda: a equipe só marca como
-- lida. Para conter envio em massa, o banco aceita até 20 respostas por
-- minuto, somando todo mundo.
create or replace function conferir_feedback() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from feedback where data_envio > now() - interval '1 minute') >= 20 then
      raise exception 'Muitas respostas agora. Tente de novo em um minuto.';
    end if;
    new.id_feedback := gen_random_uuid();
    new.data_envio := now();
    new.lida := false;
    new.funcionou := nullif(btrim(new.funcionou), '');
    new.travou := nullif(btrim(new.travou), '');
    new.faltou := nullif(btrim(new.faltou), '');
    new.contato := nullif(btrim(new.contato), '');
  else
    new.id_feedback := old.id_feedback; new.nota := old.nota;
    new.funcionou := old.funcionou; new.travou := old.travou; new.faltou := old.faltou;
    new.contato := old.contato; new.origem := old.origem; new.data_envio := old.data_envio;
  end if;
  return new;
end $$;
drop trigger if exists tg_conferir_feedback on feedback;
create trigger tg_conferir_feedback before insert or update on feedback
  for each row execute function conferir_feedback();

alter table equipe   enable row level security;
alter table feedback enable row level security;
drop policy if exists equipe_ver on equipe;
create policy equipe_ver on equipe for select to authenticated using (id_usuario = auth.uid());
drop policy if exists feedback_enviar on feedback;
create policy feedback_enviar on feedback for insert to anon, authenticated with check (true);
drop policy if exists feedback_ver on feedback;
create policy feedback_ver on feedback for select to authenticated using (eh_equipe());
drop policy if exists feedback_marcar on feedback;
create policy feedback_marcar on feedback for update to authenticated using (eh_equipe()) with check (eh_equipe());
drop policy if exists feedback_excluir on feedback;
create policy feedback_excluir on feedback for delete to authenticated using (eh_equipe());

grant insert on feedback to anon;
grant select, insert, update, delete on equipe, feedback to authenticated;
grant execute on function eh_equipe(), conferir_feedback() to authenticated;

commit;
