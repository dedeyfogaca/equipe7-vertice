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
  v_hoje      date := (now() at time zone 'America/Sao_Paulo')::date;
  v_site      text := rtrim(p_site, '/');
  v_semana    text[] := array['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  v_curta     text[] := array['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  v_meses     text[] := array['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  -- as fontes do sistema: Inter Tight no texto e JetBrains Mono nos números.
  -- Quem não carrega fonte da internet (o Gmail) usa as de reserva.
  v_fonte     text := '''Inter Tight'',Inter,''Segoe UI'',Roboto,Helvetica,Arial,sans-serif';
  v_mono      text := '''JetBrains Mono'',ui-monospace,Menlo,Consolas,monospace';
  v_chave     text;
  v_pessoa    record;
  v_item      record;
  v_cor       text;
  v_fundo     text;
  v_rotulo    text;
  v_cartao    text;
  v_atrasadas text;
  v_proximas  text;
  v_texto     text;
  v_resumo    text;
  v_chips     text;
  v_secoes    text;
  v_html      text;
  v_assunto   text;
  v_total     integer := 0;
begin
  select decrypted_secret into v_chave from vault.decrypted_secrets where name = 'brevo_api_key';
  if v_chave is null then
    raise exception 'Guarde a chave do Brevo no Vault com o nome brevo_api_key.';
  end if;

  for v_pessoa in
    select id_usuario, min(email) as email, min(nome) as nome, count(*) as total,
           count(*) filter (where prazo < v_hoje) as atrasadas,
           count(*) filter (where prazo = v_hoje) as hoje,
           count(*) filter (where prazo > v_hoje) as proximas
      from lembretes_do_dia(v_hoje)
     group by id_usuario
  loop
    v_atrasadas := ''; v_proximas := ''; v_texto := '';

    for v_item in
      select * from lembretes_do_dia(v_hoje) where id_usuario = v_pessoa.id_usuario order by prazo, titulo
    loop
      if v_item.prazo < v_hoje then
        v_cor := '#be123c'; v_fundo := '#fff1f2';
        v_rotulo := case when v_hoje - v_item.prazo = 1 then 'Venceu ontem'
                         else format('Venceu há %s dias', v_hoje - v_item.prazo) end;
      elsif v_item.prazo = v_hoje then
        v_cor := '#b45309'; v_fundo := '#fffbeb'; v_rotulo := 'Vence hoje';
      elsif v_item.prazo = v_hoje + 1 then
        v_cor := '#0e7490'; v_fundo := '#ecfeff'; v_rotulo := 'Vence amanhã';
      else
        v_cor := '#0e7490'; v_fundo := '#ecfeff'; v_rotulo := format('Em %s dias', v_item.prazo - v_hoje);
      end if;

      v_cartao := format(
        '<tr><td style="padding:0 0 10px">'
        '<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:#ffffff;border:1px solid #e2e8f0;border-left:4px solid %s;border-radius:12px">'
        '<tr><td style="padding:14px 16px">'
        '<div style="font-size:15px;line-height:1.35;font-weight:700;color:#0b1220">%s</div>'
        '<div style="font-size:13px;line-height:1.4;color:#64748b;padding-top:3px">%s</div>'
        '</td><td align="right" style="padding:14px 16px 14px 0;white-space:nowrap;vertical-align:top">'
        '<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:%s;color:%s;font-size:12px;font-weight:700">%s</span>'
        '<div style="font-family:%s;font-size:12px;color:#94a3b8;padding-top:6px">%s, %s</div>'
        '</td></tr></table></td></tr>',
        v_cor, escapar_html(v_item.titulo), escapar_html(concat_ws(' · ', v_item.onde, v_item.disciplina)),
        v_fundo, v_cor, v_rotulo, v_mono,
        v_curta[extract(dow from v_item.prazo)::int + 1], to_char(v_item.prazo, 'DD/MM'));

      if v_item.prazo < v_hoje then
        v_atrasadas := v_atrasadas || v_cartao;
      else
        v_proximas := v_proximas || v_cartao;
      end if;
      v_texto := v_texto || format(E'- %s: %s (%s)\n', v_rotulo, v_item.titulo,
                                   concat_ws(' · ', v_item.onde, v_item.disciplina));
    end loop;

    -- o resumo vira a frase de cima e o texto da prévia, na caixa de entrada
    v_resumo := case
      when v_pessoa.total = 1 and v_pessoa.atrasadas = 1 then 'Uma atividade sua está atrasada.'
      when v_pessoa.total = 1 and v_pessoa.hoje = 1 then 'Uma atividade sua vence hoje.'
      when v_pessoa.total = 1 then 'Uma atividade sua está chegando no prazo.'
      else format('%s atividades suas precisam de atenção.', v_pessoa.total) end;

    v_chips := '';
    if v_pessoa.atrasadas > 0 then
      v_chips := v_chips || format('<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 11px;border-radius:999px;background:#fff1f2;color:#be123c;font-size:13px;font-weight:700">%s %s</span>',
        v_pessoa.atrasadas, case when v_pessoa.atrasadas = 1 then 'atrasada' else 'atrasadas' end);
    end if;
    if v_pessoa.hoje > 0 then
      v_chips := v_chips || format('<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 11px;border-radius:999px;background:#fffbeb;color:#b45309;font-size:13px;font-weight:700">%s para hoje</span>', v_pessoa.hoje);
    end if;
    if v_pessoa.proximas > 0 then
      v_chips := v_chips || format('<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 11px;border-radius:999px;background:#ecfeff;color:#0e7490;font-size:13px;font-weight:700">%s nos próximos dias</span>', v_pessoa.proximas);
    end if;

    v_secoes := '';
    if v_atrasadas <> '' then
      v_secoes := v_secoes || '<tr><td style="padding:22px 0 10px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#be123c">Atrasadas</td></tr>' || v_atrasadas;
    end if;
    if v_proximas <> '' then
      v_secoes := v_secoes || '<tr><td style="padding:22px 0 10px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b">Hoje e próximos dias</td></tr>' || v_proximas;
    end if;

    v_html := format(
      '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light">'
      '<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet"></head>'
      '<body style="margin:0;padding:0;background:#eef2f7">'
      '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">%s</div>'
      '<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#eef2f7;font-family:%s">'
      '<tr><td align="center" style="padding:28px 12px">'
      '<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px;border-collapse:separate">'
      -- topo escuro, como o app
      '<tr><td style="background:#0b1220;border-radius:16px 16px 0 0;padding:20px 24px">'
      '<table role="presentation" width="100%%" cellpadding="0" cellspacing="0"><tr>'
      '<td style="vertical-align:middle"><img src="%s/email-marca.png" width="28" height="28" alt="" style="display:inline-block;vertical-align:middle;border:0">'
      '<span style="display:inline-block;vertical-align:middle;padding-left:10px;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.2px">Vértice</span></td>'
      '<td align="right" style="vertical-align:middle;font-family:%s;font-size:12px;color:#94a3b8;white-space:nowrap">%s, %s de %s</td>'
      '</tr></table>'
      '<div style="height:3px;margin-top:18px;border-radius:3px;background:#22d3ee;background-image:linear-gradient(90deg,#22d3ee,#0e7490)"></div>'
      '</td></tr>'
      -- corpo
      '<tr><td style="background:#ffffff;padding:28px 24px 8px">'
      '<div style="font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.4px;color:#0b1220">Oi, %s!</div>'
      '<div style="font-size:15px;line-height:1.5;color:#334155;padding:6px 0 14px">%s</div>'
      '<div>%s</div>'
      '<table role="presentation" width="100%%" cellpadding="0" cellspacing="0">%s</table>'
      '</td></tr>'
      '<tr><td style="background:#ffffff;padding:14px 24px 30px">'
      '<a href="%s/atividades" style="display:inline-block;background:#0e7490;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:10px;font-size:15px;font-weight:700">Abrir minhas atividades &rarr;</a>'
      '</td></tr>'
      -- rodapé
      '<tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;padding:16px 24px;font-size:12px;line-height:1.55;color:#64748b">'
      'Você recebe este lembrete porque ele está ligado no seu perfil. '
      '<a href="%s/perfil" style="color:#0e7490;text-decoration:underline">Desligar em Meu perfil</a>.'
      '</td></tr>'
      '<tr><td align="center" style="padding:16px 0 0;font-size:11px;color:#94a3b8">Vértice · Plataforma de Acompanhamento de Aprendizagem</td></tr>'
      '</table></td></tr></table></body></html>',
      v_resumo, v_fonte, v_site, v_mono,
      v_semana[extract(dow from v_hoje)::int + 1], extract(day from v_hoje)::int, v_meses[extract(month from v_hoje)::int],
      escapar_html(split_part(v_pessoa.nome, ' ', 1)), v_resumo, v_chips, v_secoes,
      v_site, v_site);

    v_assunto := case
      when v_pessoa.atrasadas > 0 and v_pessoa.atrasadas = v_pessoa.total then
        case when v_pessoa.total = 1 then 'Você tem 1 atividade atrasada' else format('Você tem %s atividades atrasadas', v_pessoa.total) end
      when v_pessoa.atrasadas > 0 then format('%s atrasada%s e %s perto do prazo', v_pessoa.atrasadas,
        case when v_pessoa.atrasadas = 1 then '' else 's' end, v_pessoa.total - v_pessoa.atrasadas)
      when v_pessoa.total = 1 and v_pessoa.hoje = 1 then '1 atividade vence hoje'
      when v_pessoa.total = 1 then '1 atividade perto do prazo'
      else format('%s atividades perto do prazo', v_pessoa.total) end;

    perform net.http_post(
      url     := 'https://api.brevo.com/v3/smtp/email',
      headers := jsonb_build_object('api-key', v_chave, 'Content-Type', 'application/json', 'Accept', 'application/json'),
      body    := jsonb_build_object(
        'sender', jsonb_build_object('name', p_nome_remetente, 'email', p_remetente),
        'to', jsonb_build_array(jsonb_build_object('email', v_pessoa.email, 'name', v_pessoa.nome)),
        'subject', v_assunto,
        'htmlContent', v_html,
        'textContent', format(E'Oi, %s!\n\n%s\n\n%s\nAbrir: %s/atividades\n\n'
                              'Para não receber mais, desligue o lembrete em Meu perfil: %s/perfil',
                              split_part(v_pessoa.nome, ' ', 1), v_resumo, v_texto, v_site, v_site)));
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
