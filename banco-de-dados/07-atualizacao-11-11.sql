-- =====================================================================
-- Vértice · atualização do banco de 11/11/2026
-- Para o banco que JÁ ESTÁ no ar: só acrescenta, não apaga dado nenhum.
--
-- Como usar: no painel do Supabase, abrir "SQL Editor", colar este arquivo
-- inteiro e executar uma vez. Rodar de novo não estraga nada.
--
-- O que entra:
--   * grupo.pessoal e a tabela perfil (espaço pessoal, RF34, e perfil da
--     conta, RF35). Cada conta ganha o espaço e o perfil no próximo acesso,
--     pela função garantir_espaco_pessoal();
--   * atividade.id_grupo (preenchido a partir da disciplina), disciplina
--     opcional no espaço pessoal (RN24) e responsável opcional, "A definir"
--     (RN06);
--   * evento.data_fim (evento de vários dias, RF31);
--   * conquista retirada pela própria pessoa (RN12);
--   * lembrete diário por e-mail (RF36, RN25).
-- O mesmo resultado sai do 04-script-criacao.sql num projeto novo.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Colunas e tabelas novas
-- ---------------------------------------------------------------------
alter table grupo add column if not exists pessoal boolean not null default false;

create table if not exists perfil (
  id_usuario        uuid primary key references auth.users (id) on delete cascade,
  nome              varchar(80) not null check (char_length(btrim(nome)) > 0),
  avatar            varchar(60),
  estilo_avatar     varchar(20) not null default 'croodles-neutral'
                    check (estilo_avatar in ('croodles-neutral', 'notionists')),
  foto              text,                   -- caminho no Storage (RF35)
  lembrete_email    boolean     not null default true,
  id_grupo_pessoal  uuid unique references grupo (id_grupo) on delete set null,
  ultimo_lembrete   date,                   -- o lembrete sai no máximo uma vez por dia
  data_criacao      timestamptz not null default now()
);

alter table atividade add column if not exists id_grupo uuid references grupo (id_grupo) on delete cascade;
-- as atividades que já existem moram no grupo da disciplina delas
update atividade a set id_grupo = d.id_grupo
  from disciplina d where d.id_disciplina = a.id_disciplina and a.id_grupo is null;
alter table atividade alter column id_grupo set not null;
alter table atividade alter column id_disciplina drop not null;
alter table atividade alter column id_responsavel drop not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_atividade_a_definir') then
    alter table atividade add constraint ck_atividade_a_definir check (id_responsavel is not null or status = 'a fazer');
  end if;
end $$;
create index if not exists ix_atividade_grupo on atividade (id_grupo);

alter table evento add column if not exists data_fim date;
alter table evento drop constraint if exists evento_check;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'ck_evento_periodo') then
    alter table evento add constraint ck_evento_periodo check (data_fim is null or data_fim >= data_evento);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ck_evento_horas') then
    alter table evento add constraint ck_evento_horas check (hora_fim is null or (hora_inicio is not null
      and (hora_fim > hora_inicio or coalesce(data_fim, data_evento) > data_evento)));
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. Funções e gatilhos (os mesmos do 04-script-criacao.sql)
-- ---------------------------------------------------------------------
create or replace function grupo_pessoal(p_grupo uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select pessoal from grupo where id_grupo = p_grupo), false)
$$;

create or replace function conferir_atividade() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_pessoal boolean;
begin
  -- Com disciplina, o grupo é o dele. (Uma versão anterior do sistema não
  -- manda o grupo; nesse caso ele sai da disciplina.)
  if new.id_disciplina is not null then
    new.id_grupo := coalesce(new.id_grupo, grupo_da_disciplina(new.id_disciplina));
    if grupo_da_disciplina(new.id_disciplina) is distinct from new.id_grupo then
      raise exception 'A disciplina escolhida não pertence a este grupo.' using errcode = 'check_violation';
    end if;
  end if;
  if tg_op = 'UPDATE' and new.id_grupo is distinct from old.id_grupo then
    raise exception 'A atividade não muda de grupo.' using errcode = 'check_violation';
  end if;

  -- RN24: a disciplina só é opcional no espaço pessoal, e lá a atividade é
  -- sempre de quem é dono do espaço.
  v_pessoal := grupo_pessoal(new.id_grupo);
  if new.id_disciplina is null and not v_pessoal then
    raise exception 'Escolha a disciplina da atividade.' using errcode = 'check_violation';
  end if;
  if v_pessoal then
    new.id_responsavel := (select id_membro from membro where id_grupo = new.id_grupo
                            order by data_criacao limit 1);
  end if;

  if new.id_conteudo is not null and not exists (
       select 1 from conteudo where id_conteudo = new.id_conteudo and id_disciplina = new.id_disciplina) then
    raise exception 'Esse conteúdo é de outra disciplina.' using errcode = 'check_violation';
  end if;

  if new.id_responsavel is not null
     and not exists (select 1 from membro where id_membro = new.id_responsavel and id_grupo = new.id_grupo) then
    raise exception 'O responsável precisa ser membro do grupo.' using errcode = 'check_violation';
  end if;

  -- Quando não há conta logada (auth.uid() nulo: carga feita pelo próprio
  -- painel), as regras de quem pode o quê não se aplicam.
  if auth.uid() is not null then
    -- RN06: numa atividade "A definir", quem não é organizador só assume
    -- para si e não muda mais nada.
    if tg_op = 'UPDATE' and old.id_responsavel is null and not eh_organizador(new.id_grupo)
       and (new.id_responsavel is distinct from membro_atual(new.id_grupo)
            or (to_jsonb(new) - 'id_responsavel') <> (to_jsonb(old) - 'id_responsavel')) then
      raise exception 'Assuma a atividade antes de mudar outra coisa nela.' using errcode = 'insufficient_privilege';
    end if;

    -- RN20: só o responsável muda o status. Na criação, só quem é o próprio
    -- responsável pode criar a atividade já fora de "a fazer".
    if tg_op = 'INSERT' and new.status <> 'a fazer'
       and membro_atual(new.id_grupo) is distinct from new.id_responsavel then
      raise exception 'Só o responsável muda o status da atividade.' using errcode = 'insufficient_privilege';
    end if;
    if tg_op = 'UPDATE' and new.status is distinct from old.status
       and membro_atual(new.id_grupo) is distinct from old.id_responsavel then
      raise exception 'Só o responsável muda o status da atividade.' using errcode = 'insufficient_privilege';
    end if;
  end if;

  -- a data de conclusão acompanha o status
  if new.status = 'concluido' and (tg_op = 'INSERT' or old.status <> 'concluido') then
    new.data_conclusao := coalesce(new.data_conclusao, now());
  elsif new.status <> 'concluido' then
    new.data_conclusao := null;
  end if;
  return new;
end $$;

create or replace function conferir_grupo() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.pessoal := old.pessoal;
  return new;
end $$;

drop trigger if exists tg_conferir_grupo on grupo;
create trigger tg_conferir_grupo
  before update on grupo
  for each row execute function conferir_grupo();

create or replace function conferir_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and coalesce(current_setting('vertice.sistema', true), '') <> 'sim' then
    new.id_usuario := old.id_usuario;
    new.id_grupo_pessoal := old.id_grupo_pessoal;
    new.ultimo_lembrete := old.ultimo_lembrete;
  end if;
  return new;
end $$;

drop trigger if exists tg_conferir_perfil on perfil;
create trigger tg_conferir_perfil
  before update on perfil
  for each row execute function conferir_perfil();

create or replace function garantir_espaco_pessoal() returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_email  text;
  v_meta   jsonb;
  v_base   membro;
  v_perfil perfil;
  v_grupo  uuid;
begin
  if v_uid is null then
    raise exception 'Entre com a sua conta.' using errcode = 'insufficient_privilege';
  end if;

  select email, coalesce(raw_user_meta_data, '{}'::jsonb) into v_email, v_meta from auth.users where id = v_uid;
  select * into v_base from membro where id_usuario = v_uid
   order by (foto is not null) desc, data_criacao desc limit 1;

  insert into perfil (id_usuario, nome, avatar, estilo_avatar, foto)
  values (v_uid,
          left(coalesce(nullif(btrim(v_meta ->> 'nome'), ''), nullif(btrim(v_meta ->> 'full_name'), ''),
                        nullif(btrim(v_meta ->> 'name'), ''), v_base.nome,
                        nullif(split_part(coalesce(v_email, ''), '@', 1), ''), 'Você'), 80),
          coalesce(v_base.avatar, substr(md5(v_uid::text), 1, 8)),
          coalesce(v_base.estilo_avatar, 'croodles-neutral'),
          v_base.foto)
  on conflict (id_usuario) do nothing;

  -- "for update": duas abas abrindo juntas não criam dois espaços
  select * into v_perfil from perfil where id_usuario = v_uid for update;
  if v_perfil.id_grupo_pessoal is not null then
    return v_perfil.id_grupo_pessoal;
  end if;

  insert into grupo (nome, pessoal) values ('Pessoal', true) returning id_grupo into v_grupo;
  insert into membro (id_grupo, id_usuario, nome, email, avatar, estilo_avatar, foto, perfil)
  values (v_grupo, v_uid, v_perfil.nome, v_email, v_perfil.avatar, v_perfil.estilo_avatar, v_perfil.foto, 'organizador');
  perform set_config('vertice.sistema', 'sim', true);
  update perfil set id_grupo_pessoal = v_grupo where id_usuario = v_uid;
  perform set_config('vertice.sistema', '', true);

  -- o nome e a foto da conta passam a valer em todos os grupos
  update membro set nome = v_perfil.nome, avatar = v_perfil.avatar,
                    estilo_avatar = v_perfil.estilo_avatar, foto = v_perfil.foto
   where id_usuario = v_uid and id_grupo <> v_grupo;
  return v_grupo;
end $$;

create or replace function entrar_com_codigo(p_codigo text, p_nome text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_convite convite;
  v_email   text := (select email from auth.users where id = auth.uid());
  v_perfil  perfil;
  v_membro  uuid;
begin
  if auth.uid() is null then
    raise exception 'Entre com a sua conta para usar o convite.' using errcode = 'insufficient_privilege';
  end if;
  select * into v_convite from convite where codigo = upper(btrim(p_codigo));
  if not found or not v_convite.ativo or v_convite.expira_em < now() or grupo_pessoal(v_convite.id_grupo) then
    raise exception 'Código de convite inválido ou vencido.' using errcode = 'no_data_found';
  end if;
  if eh_membro(v_convite.id_grupo) then
    return v_convite.id_grupo;
  end if;
  select * into v_perfil from perfil where id_usuario = auth.uid();
  select id_membro into v_membro from membro
   where id_grupo = v_convite.id_grupo and id_usuario is null
     and v_email is not null and lower(email) = lower(v_email)
   limit 1;
  if v_membro is not null then
    perform set_config('vertice.ligando_conta', 'sim', true);
    update membro set id_usuario = auth.uid(),
                      nome = coalesce(v_perfil.nome, nome),
                      avatar = coalesce(v_perfil.avatar, avatar),
                      estilo_avatar = coalesce(v_perfil.estilo_avatar, estilo_avatar),
                      foto = case when v_perfil.id_usuario is null then foto else v_perfil.foto end
     where id_membro = v_membro;
    perform set_config('vertice.ligando_conta', '', true);
  else
    insert into membro (id_grupo, id_usuario, nome, email, avatar, estilo_avatar, foto, perfil)
      values (v_convite.id_grupo, auth.uid(), coalesce(v_perfil.nome, btrim(p_nome)), v_email,
              v_perfil.avatar, coalesce(v_perfil.estilo_avatar, 'croodles-neutral'), v_perfil.foto, 'participante');
  end if;
  return v_convite.id_grupo;
end $$;

create or replace function escapar_html(p_texto text) returns text
language sql immutable as $$
  select replace(replace(replace(replace(coalesce(p_texto, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;')
$$;

create or replace function lembretes_do_dia(p_hoje date default (now() at time zone 'America/Sao_Paulo')::date)
returns table (id_usuario uuid, email text, nome text, titulo text, prazo date, onde text, disciplina text)
language sql stable security definer set search_path = public as $$
  select p.id_usuario, u.email::text, p.nome::text, a.titulo::text, a.prazo,
         case when g.pessoal then 'Pessoal' else g.nome::text end, d.nome::text
    from perfil p
    join auth.users u on u.id = p.id_usuario
    join membro m     on m.id_usuario = p.id_usuario
    join atividade a  on a.id_responsavel = m.id_membro
    join grupo g      on g.id_grupo = a.id_grupo
    left join disciplina d on d.id_disciplina = a.id_disciplina
   where p.lembrete_email
     and u.email is not null
     and (p.ultimo_lembrete is null or p.ultimo_lembrete < p_hoje)
     and a.status <> 'concluido'
     and a.prazo between p_hoje - 7 and p_hoje + 2
   order by p.id_usuario, a.prazo, a.titulo
$$;

create or replace function enviar_lembretes(p_remetente text, p_nome_remetente text default 'Vértice',
                                 p_site text default 'https://equipe7-vertice.vercel.app')
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_hoje   date := (now() at time zone 'America/Sao_Paulo')::date;
  v_chave  text;
  v_pessoa record;
  v_html   text;
  v_texto  text;
  v_total  integer := 0;
begin
  select decrypted_secret into v_chave from vault.decrypted_secrets where name = 'brevo_api_key';
  if v_chave is null then
    raise exception 'Guarde a chave do Brevo no Vault com o nome brevo_api_key.';
  end if;

  for v_pessoa in
    with itens as (
      select l.*,
             case when l.prazo < v_hoje then 'Venceu em ' || to_char(l.prazo, 'DD/MM')
                  when l.prazo = v_hoje then 'Vence hoje'
                  when l.prazo = v_hoje + 1 then 'Vence amanhã'
                  else 'Vence em ' || to_char(l.prazo, 'DD/MM') end as situacao,
             concat_ws(' · ', l.onde, l.disciplina) as lugar
        from lembretes_do_dia(v_hoje) l
    )
    select id_usuario, min(email) as email, min(nome) as nome, count(*) as total,
           count(*) filter (where prazo < v_hoje) as atrasadas,
           string_agg(format(
             '<tr><td style="padding:10px 12px;border-top:1px solid #e2e8f0;white-space:nowrap;font-weight:600;color:%s">%s</td>'
             '<td style="padding:10px 12px;border-top:1px solid #e2e8f0"><div style="font-weight:600;color:#0f172a">%s</div>'
             '<div style="font-size:13px;color:#64748b">%s</div></td></tr>',
             case when prazo < v_hoje then '#dc2626' when prazo = v_hoje then '#d97706' else '#0e7490' end,
             situacao, escapar_html(titulo), escapar_html(lugar)), '' order by prazo, titulo) as linhas,
           string_agg(format('- %s: %s (%s)', situacao, titulo, lugar), E'\n' order by prazo, titulo) as linhas_texto
      from itens
     group by id_usuario
  loop
    v_html := format(
      '<div style="background:#f1f5f9;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">'
      '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">'
      '<div style="background:#0e7490;color:#ffffff;padding:18px 24px;font-size:18px;font-weight:700">Vértice</div>'
      '<div style="padding:24px">'
      '<p style="margin:0 0 6px;font-size:17px;color:#0f172a">Oi, %s!</p>'
      '<p style="margin:0 0 18px;font-size:15px;color:#334155">%s</p>'
      '<table style="width:100%%;border-collapse:collapse;font-size:14px">%s</table>'
      '<p style="margin:22px 0 0"><a href="%s/atividades" style="display:inline-block;background:#0e7490;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:10px;font-weight:600">Abrir as minhas atividades</a></p>'
      '</div>'
      '<div style="padding:14px 24px;background:#f8fafc;font-size:12px;color:#64748b">'
      'Você recebe este lembrete porque ele está ligado no seu perfil. Para não receber mais, desligue em Meu perfil, no Vértice.'
      '</div></div></div>',
      escapar_html(split_part(v_pessoa.nome, ' ', 1)),
      case when v_pessoa.total = 1 then 'Uma atividade sua está perto do prazo ou atrasada:'
           else format('%s atividades suas estão perto do prazo ou atrasadas:', v_pessoa.total) end,
      v_pessoa.linhas, rtrim(p_site, '/'));
    v_texto := format(E'Oi, %s!\n\nAtividades suas perto do prazo ou atrasadas:\n%s\n\nAbrir: %s/atividades\n\n'
                      'Para não receber mais, desligue o lembrete em Meu perfil, no Vértice.',
                      split_part(v_pessoa.nome, ' ', 1), v_pessoa.linhas_texto, rtrim(p_site, '/'));

    perform net.http_post(
      url     := 'https://api.brevo.com/v3/smtp/email',
      headers := jsonb_build_object('api-key', v_chave, 'Content-Type', 'application/json', 'Accept', 'application/json'),
      body    := jsonb_build_object(
        'sender', jsonb_build_object('name', p_nome_remetente, 'email', p_remetente),
        'to', jsonb_build_array(jsonb_build_object('email', v_pessoa.email, 'name', v_pessoa.nome)),
        'subject', case when v_pessoa.atrasadas > 0 then 'Vértice: atividades atrasadas ou perto do prazo'
                        when v_pessoa.total = 1 then 'Vértice: 1 atividade perto do prazo'
                        else format('Vértice: %s atividades perto do prazo', v_pessoa.total) end,
        'htmlContent', v_html,
        'textContent', v_texto));
    update perfil set ultimo_lembrete = v_hoje where id_usuario = v_pessoa.id_usuario;
    v_total := v_total + 1;
  end loop;
  return v_total;
end $$;

-- ---------------------------------------------------------------------
-- 3. Regras de acesso por linha
-- ---------------------------------------------------------------------
alter table perfil enable row level security;

drop policy if exists grupo_criar on grupo;
create policy grupo_criar   on grupo for insert to authenticated with check (auth.uid() is not null and not pessoal);
drop policy if exists grupo_excluir on grupo;
create policy grupo_excluir on grupo for delete to authenticated using (eh_organizador(id_grupo) and not pessoal);
drop policy if exists perfil_ver on perfil;
create policy perfil_ver    on perfil for select to authenticated using (id_usuario = auth.uid());
drop policy if exists perfil_editar on perfil;
create policy perfil_editar on perfil for update to authenticated using (id_usuario = auth.uid());
drop policy if exists membro_cadastrar on membro;
create policy membro_cadastrar on membro for insert to authenticated
  with check (not grupo_pessoal(id_grupo)
              and (eh_organizador(id_grupo)
                   or (grupo_sem_membros(id_grupo) and id_usuario = auth.uid() and perfil = 'organizador')));
drop policy if exists membro_excluir on membro;
create policy membro_excluir   on membro for delete to authenticated
  using (eh_organizador(id_grupo) and not grupo_pessoal(id_grupo));
drop policy if exists atividade_ver on atividade;
create policy atividade_ver       on atividade for select to authenticated using (eh_membro(id_grupo));
drop policy if exists atividade_cadastrar on atividade;
create policy atividade_cadastrar on atividade for insert to authenticated with check (eh_membro(id_grupo));
drop policy if exists atividade_editar on atividade;
create policy atividade_editar    on atividade for update to authenticated
  using (eh_organizador(id_grupo) or id_responsavel = membro_atual(id_grupo)
         or (id_responsavel is null and eh_membro(id_grupo)))
  with check (eh_membro(id_grupo));
drop policy if exists atividade_excluir on atividade;
create policy atividade_excluir   on atividade for delete to authenticated
  using (eh_organizador(id_grupo) or id_responsavel = membro_atual(id_grupo));
drop policy if exists convite_criar on convite;
create policy convite_criar   on convite for insert to authenticated
  with check (eh_organizador(id_grupo) and not grupo_pessoal(id_grupo));
drop policy if exists membro_conquista_retirar on membro_conquista;
create policy membro_conquista_retirar on membro_conquista for delete to authenticated
  using (exists (select 1 from membro m
                 where m.id_membro = membro_conquista.id_membro and m.id_usuario = auth.uid()));

-- ---------------------------------------------------------------------
-- 4. Acesso pela API (igual à seção 8 do 04-script-criacao.sql). Também resolve o D14
-- num banco criado antes da correção de 08/11.
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on conquista to anon;
grant execute on all functions in schema public to authenticated;
revoke execute on function garantir_espaco_pessoal() from public, anon;
revoke execute on function lembretes_do_dia(date) from public, anon, authenticated;
revoke execute on function enviar_lembretes(text, text, text) from public, anon, authenticated;

commit;
