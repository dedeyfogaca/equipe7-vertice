-- =====================================================================
-- Vértice · atualização do banco de 12/11/2026: sair do grupo e histórico
-- Para o banco que JÁ ESTÁ no ar: só acrescenta, não apaga dado nenhum.
-- Rode depois das atualizações de 11/11 e do feedback.
--
-- Como usar: no painel do Supabase, abrir "SQL Editor", colar este arquivo
-- inteiro e executar uma vez. Rodar de novo não estraga nada.
--
-- O que entra (RF39, RF40, RN28, RN29):
--   * membro.data_saida: quem sai do grupo continua no cadastro, para as
--     atividades concluídas e as conquistas seguirem no nome dela, mas
--     perde o acesso; volta pelo convite;
--   * a função sair_do_grupo, chamada pelo sistema;
--   * a tabela registro, o histórico do grupo, gravada pelo próprio banco,
--     e o histórico do que já aconteceu, montado com as datas guardadas.
-- O mesmo resultado sai do 04-script-criacao.sql num projeto novo.
-- =====================================================================

begin;

alter table membro add column if not exists data_saida timestamptz;

-- O membro que a conta logada é dentro do grupo (ou nulo). Quem saiu do
-- grupo (data_saida preenchida) não conta mais como membro (RN28).
create or replace function membro_atual(p_grupo uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select id_membro from membro where id_grupo = p_grupo and id_usuario = auth.uid() and data_saida is null
$$;

create or replace function eh_membro(p_grupo uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from membro where id_grupo = p_grupo and id_usuario = auth.uid() and data_saida is null)
$$;

create or replace function eh_organizador(p_grupo uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from membro
                 where id_grupo = p_grupo and id_usuario = auth.uid() and perfil = 'organizador'
                   and data_saida is null)
$$;

-- Atividade: o grupo e a disciplina combinam (RN24), RN13 (conteúdo da mesma
-- disciplina), RN03 (responsável do mesmo grupo), RN06 ("A definir": quem não
-- organiza o grupo só pode assumir), RN20 (só o responsável muda o status) e
-- a data de conclusão.
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
  -- Quem saiu do grupo não recebe atividade nova (as concluídas seguem com ele).
  if new.id_responsavel is not null
     and (tg_op = 'INSERT' or new.id_responsavel is distinct from old.id_responsavel)
     and exists (select 1 from membro where id_membro = new.id_responsavel and data_saida is not null) then
    raise exception 'Essa pessoa saiu do grupo.' using errcode = 'check_violation';
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

-- Membro: o grupo não fica sem organizador (RN07) e ninguém se promove
-- a organizador sozinho. A saída e a volta (data_saida) só mudam pelas
-- funções do próprio banco (sair_do_grupo e entrar_com_codigo, RN28).
create or replace function conferir_membro() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(current_setting('vertice.sistema', true), '') = 'sim' then
    return new;
  end if;
  new.data_saida := old.data_saida;
  if tg_op = 'UPDATE' and old.perfil = 'organizador' and new.perfil <> 'organizador'
     and not exists (select 1 from membro where id_grupo = old.id_grupo and perfil = 'organizador'
                     and data_saida is null and id_membro <> old.id_membro) then
    raise exception 'O grupo precisa de pelo menos um organizador.' using errcode = 'check_violation';
  end if;
  if tg_op = 'UPDATE' and new.perfil is distinct from old.perfil
     and auth.uid() is not null and not eh_organizador(old.id_grupo) then
    raise exception 'Só o organizador muda o perfil dos membros.' using errcode = 'insufficient_privilege';
  end if;
  if tg_op = 'UPDATE' and new.id_grupo <> old.id_grupo then
    raise exception 'O membro não muda de grupo.' using errcode = 'check_violation';
  end if;
  -- a conta ligada ao membro só muda pelo convite (entrar_com_codigo)
  if tg_op = 'UPDATE' and new.id_usuario is distinct from old.id_usuario and auth.uid() is not null
     and coalesce(current_setting('vertice.ligando_conta', true), '') <> 'sim' then
    raise exception 'A conta ligada ao membro não pode ser trocada.' using errcode = 'insufficient_privilege';
  end if;
  return new;
end $$;

create or replace function conferir_remocao_membro() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Quando o grupo inteiro está sendo excluído, não há o que conferir.
  if not exists (select 1 from grupo where id_grupo = old.id_grupo) then
    return old;
  end if;
  if old.perfil = 'organizador' and old.data_saida is null
     and not exists (select 1 from membro where id_grupo = old.id_grupo and perfil = 'organizador'
                     and data_saida is null and id_membro <> old.id_membro) then
    raise exception 'O grupo precisa de pelo menos um organizador.' using errcode = 'check_violation';
  end if;
  return old;
end $$;

-- Entrar com código de convite (RF28). Se o organizador já tinha
-- cadastrado a pessoa com o mesmo e-mail, a conta é ligada a esse cadastro.
-- Nos dois casos, o membro fica com o nome e a foto do perfil da conta (RF35).
-- Quem saiu do grupo e volta pelo convite reaparece no mesmo cadastro, como
-- participante, com as atividades concluídas e as conquistas de antes (RN28).
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
   where id_grupo = v_convite.id_grupo and id_usuario = auth.uid() and data_saida is not null;
  if v_membro is not null then
    perform set_config('vertice.sistema', 'sim', true);
    update membro set data_saida = null, perfil = 'participante',
                      nome = coalesce(v_perfil.nome, nome),
                      avatar = coalesce(v_perfil.avatar, avatar),
                      estilo_avatar = coalesce(v_perfil.estilo_avatar, estilo_avatar),
                      foto = case when v_perfil.id_usuario is null then foto else v_perfil.foto end
     where id_membro = v_membro;
    perform set_config('vertice.sistema', '', true);
    return v_convite.id_grupo;
  end if;
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

-- As atividades de cada conta que entram no lembrete do dia.
create or replace function lembretes_do_dia(p_hoje date default (now() at time zone 'America/Sao_Paulo')::date)
returns table (id_usuario uuid, email text, nome text, titulo text, prazo date, onde text, disciplina text)
language sql stable security definer set search_path = public as $$
  select p.id_usuario, u.email::text, p.nome::text, a.titulo::text, a.prazo,
         case when g.pessoal then 'Pessoal' else g.nome::text end, d.nome::text
    from perfil p
    join auth.users u on u.id = p.id_usuario
    join membro m     on m.id_usuario = p.id_usuario and m.data_saida is null
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

drop policy if exists membro_editar on membro;
create policy membro_editar    on membro for update to authenticated
  using (eh_organizador(id_grupo) or (id_usuario = auth.uid() and data_saida is null));

-- =====================================================================
-- 9. Sair do grupo e histórico do grupo (RF39, RF40, RN28, RN29)
-- =====================================================================
-- registro: o histórico do grupo. Uma linha por ação, gravada pelo próprio
-- banco (gatilhos), com o nome de quem fez e o do item como eram na hora:
-- o histórico continua legível mesmo depois que o item ou a pessoa saem.
-- Ninguém grava, altera nem apaga pela API (RN29). O espaço pessoal não
-- tem histórico.
create table if not exists registro (
  id_registro    uuid primary key default gen_random_uuid(),
  id_grupo       uuid not null references grupo (id_grupo) on delete cascade,
  data_registro  timestamptz not null default clock_timestamp(),  -- a hora de cada ação, mesmo dentro de um mesmo comando
  id_autor       uuid references membro (id_membro) on delete set null,
  autor          varchar(80),               -- nulo: sem autor conhecido (registro reconstruído)
  acao           varchar(12) not null check (acao in (
                   'criou', 'editou', 'excluiu', 'concluiu', 'reabriu', 'assumiu', 'passou',
                   'status', 'cadastrou', 'entrou', 'voltou', 'saiu', 'removeu', 'promoveu',
                   'gerou', 'ganhou', 'perdeu')),
  tipo           varchar(12) not null check (tipo in (
                   'grupo', 'membro', 'atividade', 'disciplina', 'conteudo', 'evento',
                   'convite', 'conquista')),
  alvo           varchar(160),              -- o título ou o nome do item, como era na hora
  detalhe        varchar(200)               -- o complemento: para quem passou, o novo perfil...
);
create index if not exists ix_registro_grupo on registro (id_grupo, data_registro desc);

-- Quem está fazendo a ação: o cadastro da conta logada no grupo (mesmo
-- que ela tenha acabado de sair).
create or replace function autor_no_grupo(p_grupo uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select id_membro from membro where id_grupo = p_grupo and id_usuario = auth.uid()
$$;

-- Grava uma linha do histórico. Não grava no espaço pessoal, num grupo que
-- está sendo excluído nem quando a própria função do banco já anota a ação
-- de outro jeito (vertice.sem_registro).
create or replace function anotar(p_grupo uuid, p_acao text, p_tipo text, p_alvo text,
                       p_detalhe text default null, p_autor uuid default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_autor uuid := coalesce(p_autor, autor_no_grupo(p_grupo));
begin
  if p_grupo is null or coalesce(current_setting('vertice.sem_registro', true), '') = 'sim'
     or not exists (select 1 from grupo where id_grupo = p_grupo and not pessoal) then
    return;
  end if;
  insert into registro (id_grupo, id_autor, autor, acao, tipo, alvo, detalhe)
  values (p_grupo, v_autor, (select nome from membro where id_membro = v_autor),
          p_acao, p_tipo, left(p_alvo, 160), left(p_detalhe, 200));
end $$;

-- O que cada mudança vira no histórico.
create or replace function registrar_mudanca() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_grupo uuid;
  v_novo  jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  v_velho jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_linha jsonb := coalesce(v_novo, v_velho);
begin
  if tg_table_name = 'atividade' then
    v_grupo := (v_linha ->> 'id_grupo')::uuid;
    if tg_op = 'INSERT' then
      perform anotar(v_grupo, 'criou', 'atividade', new.titulo);
    elsif tg_op = 'DELETE' then
      -- saiu junto com a disciplina: o que fica no histórico é a disciplina
      if old.id_disciplina is not null
         and not exists (select 1 from disciplina where id_disciplina = old.id_disciplina) then
        return null;
      end if;
      perform anotar(v_grupo, 'excluiu', 'atividade', old.titulo);
    elsif new.status = 'concluido' and old.status <> 'concluido' then
      perform anotar(v_grupo, 'concluiu', 'atividade', new.titulo);
    elsif old.status = 'concluido' and new.status <> 'concluido' then
      perform anotar(v_grupo, 'reabriu', 'atividade', new.titulo);
    elsif new.id_responsavel is distinct from old.id_responsavel then
      if old.id_responsavel is null and new.id_responsavel = autor_no_grupo(v_grupo) then
        perform anotar(v_grupo, 'assumiu', 'atividade', new.titulo);
      else
        perform anotar(v_grupo, 'passou', 'atividade', new.titulo,
          coalesce((select nome from membro where id_membro = new.id_responsavel), 'A definir'));
      end if;
    elsif new.status <> old.status then
      perform anotar(v_grupo, 'status', 'atividade', new.titulo, new.status);
    elsif (v_novo - 'data_conclusao') <> (v_velho - 'data_conclusao') then
      perform anotar(v_grupo, 'editou', 'atividade', new.titulo);
    end if;

  elsif tg_table_name = 'membro' then
    v_grupo := (v_linha ->> 'id_grupo')::uuid;
    if tg_op = 'INSERT' then
      if not exists (select 1 from membro where id_grupo = v_grupo and id_membro <> new.id_membro) then
        perform anotar(v_grupo, 'criou', 'grupo', (select nome from grupo where id_grupo = v_grupo), null, new.id_membro);
      elsif new.id_usuario is not null and new.id_usuario = auth.uid() then
        perform anotar(v_grupo, 'entrou', 'membro', new.nome, null, new.id_membro);
      else
        perform anotar(v_grupo, 'cadastrou', 'membro', new.nome);
      end if;
    elsif tg_op = 'DELETE' then
      perform anotar(v_grupo, 'removeu', 'membro', old.nome);
    elsif old.data_saida is not null and new.data_saida is null then
      perform anotar(v_grupo, 'voltou', 'membro', new.nome, null, new.id_membro);
    elsif old.data_saida is null and new.data_saida is not null then
      null;  -- sair_do_grupo anota, com quantas atividades ficaram "A definir"
    elsif old.id_usuario is null and new.id_usuario is not null then
      perform anotar(v_grupo, 'entrou', 'membro', new.nome, null, new.id_membro);
    elsif new.perfil <> old.perfil then
      perform anotar(v_grupo, 'promoveu', 'membro', new.nome, new.perfil);
    end if;

  elsif tg_table_name = 'membro_conquista' then
    v_grupo := (select id_grupo from membro where id_membro = (v_linha ->> 'id_membro')::uuid);
    if v_grupo is null then
      return null;  -- o membro saiu junto
    end if;
    perform anotar(v_grupo, case when tg_op = 'INSERT' then 'ganhou' else 'perdeu' end, 'conquista',
      (select nome from conquista where codigo = v_linha ->> 'codigo_conquista'), null,
      (v_linha ->> 'id_membro')::uuid);

  elsif tg_table_name = 'disciplina' then
    v_grupo := (v_linha ->> 'id_grupo')::uuid;
    if tg_op = 'INSERT' then
      perform anotar(v_grupo, 'criou', 'disciplina', new.nome);
    elsif tg_op = 'DELETE' then
      perform anotar(v_grupo, 'excluiu', 'disciplina', old.nome);
    elsif new.nome <> old.nome or new.cor <> old.cor then
      perform anotar(v_grupo, 'editou', 'disciplina', new.nome,
        case when new.nome <> old.nome then old.nome end);
    end if;

  elsif tg_table_name = 'conteudo' then
    v_grupo := grupo_da_disciplina((v_linha ->> 'id_disciplina')::uuid);
    if v_grupo is null then
      return null;  -- saiu junto com a disciplina
    end if;
    perform anotar(v_grupo,
      case tg_op when 'INSERT' then 'criou' when 'DELETE' then 'excluiu' else 'editou' end, 'conteudo',
      v_linha ->> 'nome',
      (select nome from disciplina where id_disciplina = (v_linha ->> 'id_disciplina')::uuid));

  elsif tg_table_name = 'evento' then
    v_grupo := (v_linha ->> 'id_grupo')::uuid;
    perform anotar(v_grupo,
      case tg_op when 'INSERT' then 'criou' when 'DELETE' then 'excluiu' else 'editou' end, 'evento',
      v_linha ->> 'titulo');

  elsif tg_table_name = 'convite' and tg_op = 'INSERT' then
    perform anotar(new.id_grupo, 'gerou', 'convite', null);

  elsif tg_table_name = 'grupo' and tg_op = 'UPDATE'
        and (new.nome, coalesce(new.descricao, ''), coalesce(new.foto, ''))
            is distinct from (old.nome, coalesce(old.descricao, ''), coalesce(old.foto, '')) then
    perform anotar(new.id_grupo, 'editou', 'grupo', new.nome);
  end if;
  return null;
end $$;

drop trigger if exists tg_registro_atividade on atividade;
create trigger tg_registro_atividade after insert or update or delete on atividade
  for each row execute function registrar_mudanca();
drop trigger if exists tg_registro_membro on membro;
create trigger tg_registro_membro after insert or update or delete on membro
  for each row execute function registrar_mudanca();
drop trigger if exists tg_registro_conquista on membro_conquista;
create trigger tg_registro_conquista after insert or delete on membro_conquista
  for each row execute function registrar_mudanca();
drop trigger if exists tg_registro_disciplina on disciplina;
create trigger tg_registro_disciplina after insert or update or delete on disciplina
  for each row execute function registrar_mudanca();
drop trigger if exists tg_registro_conteudo on conteudo;
create trigger tg_registro_conteudo after insert or update or delete on conteudo
  for each row execute function registrar_mudanca();
drop trigger if exists tg_registro_evento on evento;
create trigger tg_registro_evento after insert or update or delete on evento
  for each row execute function registrar_mudanca();
drop trigger if exists tg_registro_convite on convite;
create trigger tg_registro_convite after insert on convite
  for each row execute function registrar_mudanca();
drop trigger if exists tg_registro_grupo on grupo;
create trigger tg_registro_grupo after update on grupo
  for each row execute function registrar_mudanca();

alter table registro enable row level security;
-- todos os membros do grupo leem; ninguém grava pela API (RN29)
drop policy if exists registro_ver on registro;
create policy registro_ver on registro for select to authenticated using (eh_membro(id_grupo));

-- Sair do grupo (RF39, RN28). As atividades em aberto da pessoa ficam
-- "A definir"; as concluídas e as conquistas seguem no nome dela. O último
-- organizador não sai sem passar o cargo a alguém, e quem está sozinho no
-- grupo exclui o grupo em vez de sair. Devolve quantas atividades ficaram
-- "A definir".
create or replace function sair_do_grupo(p_grupo uuid) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_eu     membro;
  v_soltas integer;
begin
  if auth.uid() is null then
    raise exception 'Entre com a sua conta.' using errcode = 'insufficient_privilege';
  end if;
  if grupo_pessoal(p_grupo) then
    raise exception 'O espaço pessoal é seu: não dá para sair dele.' using errcode = 'check_violation';
  end if;
  select * into v_eu from membro
   where id_grupo = p_grupo and id_usuario = auth.uid() and data_saida is null;
  if not found then
    raise exception 'Você não faz parte deste grupo.' using errcode = 'insufficient_privilege';
  end if;
  if v_eu.perfil = 'organizador'
     and not exists (select 1 from membro where id_grupo = p_grupo and perfil = 'organizador'
                     and data_saida is null and id_membro <> v_eu.id_membro) then
    if exists (select 1 from membro where id_grupo = p_grupo and data_saida is null
               and id_membro <> v_eu.id_membro) then
      raise exception 'Antes de sair, torne outra pessoa organizadora do grupo.' using errcode = 'check_violation';
    end if;
    raise exception 'Você é a única pessoa do grupo. Para sair, exclua o grupo.' using errcode = 'check_violation';
  end if;

  perform set_config('vertice.sem_registro', 'sim', true);
  update atividade set id_responsavel = null, status = 'a fazer'
   where id_responsavel = v_eu.id_membro and status <> 'concluido';
  get diagnostics v_soltas = row_count;
  perform set_config('vertice.sistema', 'sim', true);
  update membro set data_saida = now(), perfil = 'participante' where id_membro = v_eu.id_membro;
  perform set_config('vertice.sistema', '', true);
  perform set_config('vertice.sem_registro', '', true);

  perform anotar(p_grupo, 'saiu', 'membro', v_eu.nome,
                 case when v_soltas > 0 then v_soltas::text end, v_eu.id_membro);
  return v_soltas;
end $$;

revoke execute on function sair_do_grupo(uuid) from public, anon;
grant execute on function sair_do_grupo(uuid) to authenticated;

grant select, insert, update, delete on registro to authenticated;
grant execute on function membro_atual(uuid), eh_membro(uuid), eh_organizador(uuid),
  entrar_com_codigo(text, text) to authenticated;
revoke execute on function sair_do_grupo(uuid) from public, anon;
grant execute on function sair_do_grupo(uuid) to authenticated;
-- O histórico só é gravado pelos gatilhos e por sair_do_grupo (RN29).
revoke execute on function anotar(uuid, text, text, text, text, uuid) from public, anon, authenticated;
revoke execute on function registrar_mudanca() from public, anon, authenticated;
revoke execute on function autor_no_grupo(uuid) from public, anon, authenticated;

-- O histórico do que já aconteceu antes desta atualização, montado com as
-- datas que o banco já guarda (criação, conclusão, conquista, entrada).
-- Edições e exclusões antigas não têm como voltar. Roda uma vez só: com o
-- histórico já preenchido, não faz nada.
do $rec$
begin
  if exists (select 1 from registro) then
    return;
  end if;
  insert into registro (id_grupo, data_registro, id_autor, autor, acao, tipo, alvo, detalhe)
  select g.id_grupo, g.data_criacao, p.id_membro, p.nome, 'criou', 'grupo', g.nome, null
    from grupo g
    left join lateral (select id_membro, nome from membro where id_grupo = g.id_grupo
                        order by data_criacao limit 1) p on true
   where not g.pessoal
  union all
  select m.id_grupo, m.data_criacao,
         case when m.id_usuario is null then null else m.id_membro end,
         case when m.id_usuario is null then null else m.nome end,
         case when m.id_usuario is null then 'cadastrou' else 'entrou' end, 'membro', m.nome, null
    from membro m join grupo g on g.id_grupo = m.id_grupo
   where not g.pessoal
     and m.id_membro <> (select id_membro from membro p where p.id_grupo = m.id_grupo order by data_criacao limit 1)
  union all
  select d.id_grupo, d.data_criacao, null, null, 'criou', 'disciplina', d.nome, null
    from disciplina d join grupo g on g.id_grupo = d.id_grupo where not g.pessoal
  union all
  select d.id_grupo, c.data_criacao, null, null, 'criou', 'conteudo', c.nome, d.nome
    from conteudo c join disciplina d on d.id_disciplina = c.id_disciplina
    join grupo g on g.id_grupo = d.id_grupo where not g.pessoal
  union all
  select a.id_grupo, a.data_criacao, null, null, 'criou', 'atividade', a.titulo, null
    from atividade a join grupo g on g.id_grupo = a.id_grupo where not g.pessoal
  union all
  select a.id_grupo, a.data_conclusao, m.id_membro, m.nome, 'concluiu', 'atividade', a.titulo, null
    from atividade a join grupo g on g.id_grupo = a.id_grupo
    left join membro m on m.id_membro = a.id_responsavel
   where not g.pessoal and a.status = 'concluido'
  union all
  select e.id_grupo, e.data_criacao, m.id_membro, m.nome, 'criou', 'evento', e.titulo, null
    from evento e join grupo g on g.id_grupo = e.id_grupo
    left join membro m on m.id_membro = e.id_criador where not g.pessoal
  union all
  select c.id_grupo, c.data_criacao, m.id_membro, m.nome, 'gerou', 'convite', null, null
    from convite c join grupo g on g.id_grupo = c.id_grupo
    left join membro m on m.id_membro = c.id_criador where not g.pessoal
  union all
  select m.id_grupo, mc.data_obtencao, m.id_membro, m.nome, 'ganhou', 'conquista', q.nome, null
    from membro_conquista mc join membro m on m.id_membro = mc.id_membro
    join conquista q on q.codigo = mc.codigo_conquista
    join grupo g on g.id_grupo = m.id_grupo where not g.pessoal;
end $rec$;

commit;
