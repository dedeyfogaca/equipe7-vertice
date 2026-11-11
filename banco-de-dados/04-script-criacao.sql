-- =====================================================================
-- Vértice · Plataforma de Acompanhamento de Aprendizagem
-- Banco de dados no Supabase (PostgreSQL)
-- Equipe 7 · criado em 08/11/2026 para a entrega de 27/11 (T46, T49, T50)
-- Revisado em 11/11/2026: espaço pessoal, perfil da conta, atividade "A definir",
-- evento de vários dias, conquista que sai junto com a experiência e lembrete
-- por e-mail.
--
-- Como usar num projeto NOVO: no painel do Supabase, abrir "SQL Editor",
-- colar este arquivo inteiro e executar.
--
-- ATENÇÃO: este arquivo apaga tudo antes de criar (seção 0). Num banco que já
-- tem dados, não rode este arquivo: rode o script de atualização
-- (07-atualizacao-11-11.sql), que só acrescenta.
--
-- O que muda em relação ao script MySQL da Entrega 2
--   * chaves em UUID, geradas pelo próprio banco;
--   * membro.id_usuario liga o membro à conta de login (auth.users);
--   * convite (RF28) entra como tabela nova;
--   * conquista usa o código como chave, que é o que o sistema já usa;
--   * as regras que o MySQL deixava para a aplicação (RN07, RN13, RN20,
--     RN21) também são conferidas aqui, por gatilhos;
--   * cada grupo só enxerga os próprios dados (RN01) por meio das
--     políticas de acesso por linha (Row Level Security) do PostgreSQL.
-- =====================================================================


-- =====================================================================
-- 0. Limpeza (permite executar o arquivo de novo)
-- =====================================================================
drop table if exists membro_conquista, conquista, progresso_historico, convite,
  evento, atividade, conteudo, disciplina, perfil, membro, grupo cascade;
drop function if exists eh_membro(uuid), eh_organizador(uuid), membro_atual(uuid),
  grupo_da_disciplina(uuid), grupo_sem_membros(uuid), grupo_pessoal(uuid),
  entrar_com_codigo(text, text), garantir_espaco_pessoal(),
  conferir_grupo(), conferir_perfil(), conferir_atividade(), conferir_membro(),
  conferir_remocao_membro(), conferir_evento(), registrar_progresso(),
  progresso_da_disciplina(uuid), escapar_html(text), lembretes_do_dia(date),
  enviar_lembretes(text, text, text) cascade;


-- =====================================================================
-- 1. Tabelas
-- =====================================================================

-- grupo: raiz da estrutura (RF01, RF29)
-- pessoal = o espaço pessoal da conta (RF34): um grupo de uma pessoa só,
-- criado pelo próprio banco (garantir_espaco_pessoal), sem convite e sem
-- outros membros.
create table grupo (
  id_grupo      uuid primary key default gen_random_uuid(),
  nome          varchar(80)  not null check (char_length(btrim(nome)) > 0),
  descricao     varchar(255),
  foto          text,                       -- caminho no Storage (RF29)
  pessoal       boolean      not null default false,
  data_criacao  timestamptz  not null default now()
);

-- membro: integrantes do grupo (RF02, RF19, RF24)
-- id_usuario fica vazio enquanto a pessoa foi só cadastrada pelo
-- organizador e ainda não entrou com a própria conta.
create table membro (
  id_membro      uuid primary key default gen_random_uuid(),
  id_grupo       uuid not null references grupo (id_grupo) on delete cascade,
  id_usuario     uuid references auth.users (id) on delete set null,
  nome           varchar(80)  not null check (char_length(btrim(nome)) > 0),
  funcao         varchar(60),
  email          varchar(120) check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  avatar         varchar(60),
  estilo_avatar  varchar(20)  not null default 'croodles-neutral'
                 check (estilo_avatar in ('croodles-neutral', 'notionists')),
  foto           text,                      -- caminho no Storage (RF24)
  perfil         varchar(15)  not null default 'participante'
                 check (perfil in ('organizador', 'participante')),
  data_criacao   timestamptz  not null default now(),
  unique (id_grupo, id_usuario)             -- a mesma conta entra uma vez em cada grupo
);
create index ix_membro_usuario on membro (id_usuario);

-- perfil: nome e foto da conta, que valem em todos os grupos (RF35), e a
-- escolha do lembrete por e-mail (RF36). Uma linha por conta, criada por
-- garantir_espaco_pessoal() no primeiro acesso.
create table perfil (
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

-- disciplina (RF13, RF25)
create table disciplina (
  id_disciplina uuid primary key default gen_random_uuid(),
  id_grupo      uuid not null references grupo (id_grupo) on delete cascade,
  nome          varchar(80) not null check (char_length(btrim(nome)) > 0),
  cor           char(7)     not null default '#3b82f6' check (cor ~ '^#[0-9a-f]{6}$'),
  data_criacao  timestamptz not null default now()
);
-- nome único por grupo, sem diferenciar maiúsculas (RF13)
create unique index uk_disciplina_nome on disciplina (id_grupo, lower(btrim(nome)));

-- conteudo: divisões opcionais da disciplina (RF14, RN13)
create table conteudo (
  id_conteudo   uuid primary key default gen_random_uuid(),
  id_disciplina uuid not null references disciplina (id_disciplina) on delete cascade,
  nome          varchar(80)  not null check (char_length(btrim(nome)) > 0),
  descricao     varchar(255),
  ordem         integer      not null default 0,
  data_criacao  timestamptz  not null default now()
);
create unique index uk_conteudo_nome on conteudo (id_disciplina, lower(btrim(nome)));

-- atividade (RF03, RN06, RN09, RN13, RN20)
-- id_grupo: onde a atividade mora. A disciplina é obrigatória nos grupos e
-- opcional no espaço pessoal (RN24); sem responsável, a atividade fica
-- "A definir" (RN06) e não sai de "a fazer" enquanto ninguém a assume.
create table atividade (
  id_atividade    uuid primary key default gen_random_uuid(),
  id_grupo        uuid not null references grupo (id_grupo) on delete cascade,
  id_disciplina   uuid references disciplina (id_disciplina) on delete cascade,
  id_conteudo     uuid references conteudo (id_conteudo) on delete set null,
  -- "no action" (e não "restrict"): a conferência fica para o fim do comando,
  -- e assim a exclusão do grupo inteiro, em cascata, não é barrada
  id_responsavel  uuid references membro (id_membro) on delete no action,
  titulo          varchar(120) not null check (char_length(btrim(titulo)) >= 3),
  descricao       text,
  prazo           date         not null,
  peso            smallint     not null default 1 check (peso between 1 and 5),
  prioridade      varchar(10)  check (prioridade in ('baixa', 'media', 'alta')),
  status          varchar(12)  not null default 'a fazer'
                  check (status in ('a fazer', 'fazendo', 'concluido')),
  data_criacao    timestamptz  not null default now(),
  data_conclusao  timestamptz,
  -- a data de conclusão acompanha o status
  check ((status = 'concluido') = (data_conclusao is not null)),
  -- "A definir": ninguém começa nem conclui antes de alguém assumir
  constraint ck_atividade_a_definir check (id_responsavel is not null or status = 'a fazer')
);
create index ix_atividade_grupo       on atividade (id_grupo);
create index ix_atividade_disciplina  on atividade (id_disciplina);
create index ix_atividade_responsavel on atividade (id_responsavel, data_conclusao);
create index ix_atividade_prazo       on atividade (prazo);

-- evento (RF31, RN21)
create table evento (
  id_evento      uuid primary key default gen_random_uuid(),
  id_grupo       uuid not null references grupo (id_grupo) on delete cascade,
  id_disciplina  uuid references disciplina (id_disciplina) on delete set null,
  id_criador     uuid references membro (id_membro) on delete set null,
  titulo         varchar(120) not null check (char_length(btrim(titulo)) > 0),
  tipo           varchar(12)  not null
                 check (tipo in ('prova', 'apresentacao', 'palestra', 'reuniao', 'outro')),
  data_evento    date         not null,
  data_fim       date,                      -- evento de vários dias (RF31)
  hora_inicio    time,
  hora_fim       time,
  local_evento   varchar(120),
  descricao      text,
  data_criacao   timestamptz  not null default now(),
  constraint ck_evento_periodo check (data_fim is null or data_fim >= data_evento),
  -- no mesmo dia, o fim vem depois do início; em vários dias, vale qualquer hora
  constraint ck_evento_horas check (hora_fim is null or (hora_inicio is not null
    and (hora_fim > hora_inicio or coalesce(data_fim, data_evento) > data_evento)))
);
create index ix_evento_data on evento (id_grupo, data_evento);

-- convite: entrada no grupo por código ou por link (RF28, RN22)
create table convite (
  id_convite    uuid primary key default gen_random_uuid(),
  id_grupo      uuid not null references grupo (id_grupo) on delete cascade,
  codigo        char(8) not null unique check (codigo ~ '^[A-Z2-9]{8}$'),
  id_criador    uuid references membro (id_membro) on delete set null,
  data_criacao  timestamptz not null default now(),
  expira_em     timestamptz not null default now() + interval '7 days',
  ativo         boolean not null default true
);

-- progresso_historico: fotografia diária do progresso de cada disciplina (RF12, RN23)
-- Preenchida pelo próprio banco (gatilho na atividade), nunca pelo sistema.
create table progresso_historico (
  id_progresso  uuid primary key default gen_random_uuid(),
  id_disciplina uuid not null references disciplina (id_disciplina) on delete cascade,
  data_registro date not null default (now() at time zone 'America/Sao_Paulo')::date,
  percentual    numeric(5,2) not null check (percentual between 0 and 100),
  unique (id_disciplina, data_registro)
);

-- conquista: catálogo de marcos (RF17)
create table conquista (
  codigo         varchar(30)  primary key,
  nome           varchar(60)  not null,
  descricao      varchar(160) not null,
  icone          varchar(10),
  criterio_tipo  varchar(30)  not null check (criterio_tipo in (
                   'atividades_concluidas', 'conteudo_completo', 'disciplina_completa',
                   'ofensiva_dias', 'experiencia_total')),
  criterio_valor integer      not null check (criterio_valor > 0)
);

-- membro_conquista: N:N; a chave composta impede a concessão duplicada (RN12).
-- Quando a pessoa desfaz a conclusão e a regra deixa de valer, o próprio
-- sistema apaga a linha (RN12 revisada).
create table membro_conquista (
  id_membro        uuid        not null references membro (id_membro) on delete cascade,
  codigo_conquista varchar(30) not null references conquista (codigo) on delete cascade,
  data_obtencao    timestamptz not null default now(),
  primary key (id_membro, codigo_conquista)
);

insert into conquista (codigo, nome, descricao, icone, criterio_tipo, criterio_valor) values
  ('PRIMEIRO_PASSO',     'Primeiro Passo',     'Conclua a sua primeira atividade',        '🌱', 'atividades_concluidas', 1),
  ('CONTEUDO_DOMINADO',  'Conteúdo Dominado',  'Leve um conteúdo a 100% de progresso',    '📗', 'conteudo_completo',     1),
  ('DISCIPLINA_FECHADA', 'Disciplina Fechada', 'Leve uma disciplina a 100% de progresso', '🎓', 'disciplina_completa',   1),
  ('SEMANA_CHEIA',       'Semana Cheia',       'Conclua atividades por 7 dias seguidos',  '🔥', 'ofensiva_dias',         7),
  ('MES_CHEIO',          'Mês Cheio',          'Conclua atividades por 30 dias seguidos', '🏔️', 'ofensiva_dias',        30),
  ('MEIO_MILHAR',        'Meio Milhar',        'Acumule 500 pontos de experiência',       '⭐', 'experiencia_total',   500);


-- =====================================================================
-- 2. Funções de apoio às políticas de acesso
-- "security definer" faz a função consultar membro sem cair na própria
-- política de membro (o que daria recursão infinita).
-- =====================================================================

-- O membro que a conta logada é dentro do grupo (ou nulo)
create function membro_atual(p_grupo uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select id_membro from membro where id_grupo = p_grupo and id_usuario = auth.uid()
$$;

create function eh_membro(p_grupo uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from membro where id_grupo = p_grupo and id_usuario = auth.uid())
$$;

create function eh_organizador(p_grupo uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from membro
                 where id_grupo = p_grupo and id_usuario = auth.uid() and perfil = 'organizador')
$$;

-- Grupo recém-criado, ainda sem ninguém: quem cria entra como o primeiro membro
create function grupo_sem_membros(p_grupo uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from membro where id_grupo = p_grupo)
$$;

create function grupo_da_disciplina(p_disciplina uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select id_grupo from disciplina where id_disciplina = p_disciplina
$$;

create function grupo_pessoal(p_grupo uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select pessoal from grupo where id_grupo = p_grupo), false)
$$;


-- =====================================================================
-- 3. Regras de negócio conferidas pelo banco (gatilhos)
-- As mensagens são as mesmas que o sistema mostra na tela.
-- =====================================================================

-- Atividade: o grupo e a disciplina combinam (RN24), RN13 (conteúdo da mesma
-- disciplina), RN03 (responsável do mesmo grupo), RN06 ("A definir": quem não
-- organiza o grupo só pode assumir), RN20 (só o responsável muda o status) e
-- a data de conclusão.
create function conferir_atividade() returns trigger
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

create trigger tg_conferir_atividade
  before insert or update on atividade
  for each row execute function conferir_atividade();

-- Grupo: o espaço pessoal continua pessoal (e o grupo comum não vira pessoal)
create function conferir_grupo() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.pessoal := old.pessoal;
  return new;
end $$;

create trigger tg_conferir_grupo
  before update on grupo
  for each row execute function conferir_grupo();

-- Perfil: a ligação com o espaço pessoal e o dia do último lembrete são do
-- próprio banco; a pessoa muda o nome, a foto, o avatar e o lembrete.
create function conferir_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and coalesce(current_setting('vertice.sistema', true), '') <> 'sim' then
    new.id_usuario := old.id_usuario;
    new.id_grupo_pessoal := old.id_grupo_pessoal;
    new.ultimo_lembrete := old.ultimo_lembrete;
  end if;
  return new;
end $$;

create trigger tg_conferir_perfil
  before update on perfil
  for each row execute function conferir_perfil();

-- Membro: o grupo não fica sem organizador (RN07) e ninguém se promove
-- a organizador sozinho.
create function conferir_membro() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and old.perfil = 'organizador' and new.perfil <> 'organizador'
     and not exists (select 1 from membro where id_grupo = old.id_grupo and perfil = 'organizador'
                     and id_membro <> old.id_membro) then
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

create trigger tg_conferir_membro
  before update on membro
  for each row execute function conferir_membro();

create function conferir_remocao_membro() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Quando o grupo inteiro está sendo excluído, não há o que conferir.
  if not exists (select 1 from grupo where id_grupo = old.id_grupo) then
    return old;
  end if;
  if old.perfil = 'organizador'
     and not exists (select 1 from membro where id_grupo = old.id_grupo and perfil = 'organizador'
                     and id_membro <> old.id_membro) then
    raise exception 'O grupo precisa de pelo menos um organizador.' using errcode = 'check_violation';
  end if;
  return old;
end $$;

create trigger tg_conferir_remocao_membro
  before delete on membro
  for each row execute function conferir_remocao_membro();

-- Evento: a disciplina e o autor têm de ser do mesmo grupo do evento
create function conferir_evento() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.id_disciplina is not null and grupo_da_disciplina(new.id_disciplina) <> new.id_grupo then
    raise exception 'A disciplina escolhida não pertence a este grupo.' using errcode = 'check_violation';
  end if;
  if tg_op = 'INSERT' and auth.uid() is not null then
    new.id_criador := membro_atual(new.id_grupo);   -- o autor é sempre quem está logado
  elsif tg_op = 'UPDATE' then
    new.id_criador := old.id_criador;               -- e não muda depois
  end if;
  return new;
end $$;

create trigger tg_conferir_evento
  before insert or update on evento
  for each row execute function conferir_evento();

-- Histórico de progresso (RF12): a cada mudança nas atividades de uma
-- disciplina, grava (ou atualiza) a fotografia do dia.
create function progresso_da_disciplina(p_disciplina uuid) returns numeric
language sql stable security definer set search_path = public as $$
  select coalesce(round(100.0 * sum(peso) filter (where status = 'concluido') / nullif(sum(peso), 0), 2), 0)
  from atividade where id_disciplina = p_disciplina
$$;

create function registrar_progresso() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_disciplina uuid;
begin
  foreach v_disciplina in array array_remove(array[
      case when tg_op <> 'DELETE' then new.id_disciplina end,
      case when tg_op <> 'INSERT' then old.id_disciplina end], null)
  loop
    if exists (select 1 from disciplina where id_disciplina = v_disciplina) then
      insert into progresso_historico (id_disciplina, data_registro, percentual)
      values (v_disciplina, (now() at time zone 'America/Sao_Paulo')::date, progresso_da_disciplina(v_disciplina))
      on conflict (id_disciplina, data_registro) do update set percentual = excluded.percentual;
    end if;
  end loop;
  return null;
end $$;

create trigger tg_registrar_progresso
  after insert or update of status, peso, id_disciplina or delete on atividade
  for each row execute function registrar_progresso();


-- =====================================================================
-- 4. Entrada por convite (chamada pelo sistema)
-- =====================================================================

-- Espaço pessoal (RF34) e perfil da conta (RF35). O sistema chama esta
-- função toda vez que a conta entra; ela só cria o que ainda não existe e
-- devolve o id do espaço pessoal. Quem já tinha conta antes da revisão de
-- 11/11 ganha o espaço e o perfil no primeiro acesso, sem perder nada: o
-- perfil nasce do cadastro da conta e do cadastro mais recente nos grupos
-- (o que tiver foto), e a partir daí o nome e a foto valem em todos os grupos.
create function garantir_espaco_pessoal() returns uuid
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

-- Entrar com código de convite (RF28). Se o organizador já tinha
-- cadastrado a pessoa com o mesmo e-mail, a conta é ligada a esse cadastro.
-- Nos dois casos, o membro fica com o nome e a foto do perfil da conta (RF35).
create function entrar_com_codigo(p_codigo text, p_nome text)
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

-- =====================================================================
-- 5. Acesso por linha: cada grupo só enxerga o que é dele (RN01)
-- =====================================================================
alter table grupo               enable row level security;
alter table membro              enable row level security;
alter table perfil              enable row level security;
alter table disciplina          enable row level security;
alter table conteudo            enable row level security;
alter table atividade           enable row level security;
alter table evento              enable row level security;
alter table convite             enable row level security;
alter table progresso_historico enable row level security;
alter table conquista           enable row level security;
alter table membro_conquista    enable row level security;

-- grupo: qualquer conta cria; vê quem é membro; edita e exclui o organizador.
-- O espaço pessoal só o banco cria (garantir_espaco_pessoal) e não é excluído.
create policy grupo_criar   on grupo for insert to authenticated with check (auth.uid() is not null and not pessoal);
create policy grupo_ver     on grupo for select to authenticated using (eh_membro(id_grupo));
create policy grupo_editar  on grupo for update to authenticated using (eh_organizador(id_grupo));
create policy grupo_excluir on grupo for delete to authenticated using (eh_organizador(id_grupo) and not pessoal);

-- perfil: cada conta vê e edita só o próprio (quem cria é garantir_espaco_pessoal)
create policy perfil_ver    on perfil for select to authenticated using (id_usuario = auth.uid());
create policy perfil_editar on perfil for update to authenticated using (id_usuario = auth.uid());

-- membro: o organizador cadastra, edita e remove; cada um edita o próprio
-- cadastro. Num grupo recém-criado, quem cria entra como organizador (RN07).
-- Remover um membro com atividades exige passá-las antes a outro (RN02):
-- o sistema atualiza as atividades e depois exclui o membro.
create policy membro_ver       on membro for select to authenticated using (eh_membro(id_grupo));
-- O espaço pessoal não recebe ninguém além do dono.
create policy membro_cadastrar on membro for insert to authenticated
  with check (not grupo_pessoal(id_grupo)
              and (eh_organizador(id_grupo)
                   or (grupo_sem_membros(id_grupo) and id_usuario = auth.uid() and perfil = 'organizador')));
create policy membro_editar    on membro for update to authenticated
  using (eh_organizador(id_grupo) or id_usuario = auth.uid());
create policy membro_excluir   on membro for delete to authenticated
  using (eh_organizador(id_grupo) and not grupo_pessoal(id_grupo));

-- disciplina e conteúdo: estrutura do grupo, gerida pelo organizador (RN07)
create policy disciplina_ver     on disciplina for select to authenticated using (eh_membro(id_grupo));
create policy disciplina_gerir   on disciplina for insert to authenticated with check (eh_organizador(id_grupo));
create policy disciplina_editar  on disciplina for update to authenticated using (eh_organizador(id_grupo));
create policy disciplina_excluir on disciplina for delete to authenticated using (eh_organizador(id_grupo));

create policy conteudo_ver     on conteudo for select to authenticated
  using (eh_membro(grupo_da_disciplina(id_disciplina)));
create policy conteudo_gerir   on conteudo for insert to authenticated
  with check (eh_organizador(grupo_da_disciplina(id_disciplina)));
create policy conteudo_editar  on conteudo for update to authenticated
  using (eh_organizador(grupo_da_disciplina(id_disciplina)));
create policy conteudo_excluir on conteudo for delete to authenticated
  using (eh_organizador(grupo_da_disciplina(id_disciplina)));

-- atividade: qualquer membro cadastra; editar e excluir, o organizador ou o
-- responsável (RN07); mudar o status, só o responsável (RN20, no gatilho).
-- A atividade "A definir" qualquer membro pode assumir (RN06, no gatilho).
create policy atividade_ver       on atividade for select to authenticated using (eh_membro(id_grupo));
create policy atividade_cadastrar on atividade for insert to authenticated with check (eh_membro(id_grupo));
create policy atividade_editar    on atividade for update to authenticated
  using (eh_organizador(id_grupo) or id_responsavel = membro_atual(id_grupo)
         or (id_responsavel is null and eh_membro(id_grupo)))
  with check (eh_membro(id_grupo));
create policy atividade_excluir   on atividade for delete to authenticated
  using (eh_organizador(id_grupo) or id_responsavel = membro_atual(id_grupo));

-- evento: qualquer membro cadastra; editar e excluir, o autor ou o organizador (RN21)
create policy evento_ver       on evento for select to authenticated using (eh_membro(id_grupo));
create policy evento_cadastrar on evento for insert to authenticated with check (eh_membro(id_grupo));
create policy evento_editar    on evento for update to authenticated
  using (eh_organizador(id_grupo) or id_criador = membro_atual(id_grupo));
create policy evento_excluir   on evento for delete to authenticated
  using (eh_organizador(id_grupo) or id_criador = membro_atual(id_grupo));

-- convite: só o organizador vê e gera (a entrada é por entrar_com_codigo());
-- o espaço pessoal não tem convite
create policy convite_ver     on convite for select to authenticated using (eh_organizador(id_grupo));
create policy convite_criar   on convite for insert to authenticated
  with check (eh_organizador(id_grupo) and not grupo_pessoal(id_grupo));
create policy convite_editar  on convite for update to authenticated using (eh_organizador(id_grupo));
create policy convite_excluir on convite for delete to authenticated using (eh_organizador(id_grupo));

-- histórico: só leitura (quem grava é o gatilho)
create policy progresso_ver on progresso_historico for select to authenticated
  using (eh_membro(grupo_da_disciplina(id_disciplina)));

-- conquistas: o catálogo é público para quem está logado; a conquista de um
-- membro é vista pelo grupo e gravada (ou retirada, RN12) pela própria pessoa
-- (quem conclui a atividade é o responsável, que é quem ganha a conquista)
create policy conquista_ver on conquista for select to authenticated using (true);
create policy membro_conquista_ver on membro_conquista for select to authenticated
  using (eh_membro((select id_grupo from membro m where m.id_membro = membro_conquista.id_membro)));
create policy membro_conquista_gravar on membro_conquista for insert to authenticated
  with check (exists (select 1 from membro m
                      where m.id_membro = membro_conquista.id_membro and m.id_usuario = auth.uid()));
create policy membro_conquista_retirar on membro_conquista for delete to authenticated
  using (exists (select 1 from membro m
                 where m.id_membro = membro_conquista.id_membro and m.id_usuario = auth.uid()));

-- A entrada por convite e o espaço pessoal ficam disponíveis só para quem está logado
revoke execute on function entrar_com_codigo(text, text) from public, anon;
revoke execute on function garantir_espaco_pessoal() from public, anon;
grant execute on function entrar_com_codigo(text, text) to authenticated;
grant execute on function garantir_espaco_pessoal() to authenticated;

-- =====================================================================
-- 6. Fotos (RF24, RF29): bucket "fotos" no Storage
-- =====================================================================
-- Leitura pública (a foto aparece pelo endereço). Gravar, só na pasta de um
-- grupo de que a conta é membro: fotos/<id do grupo>/<arquivo>.jpg. A foto
-- do perfil fica na pasta do espaço pessoal.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 1048576, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];

drop policy if exists fotos_enviar on storage.objects;
create policy fotos_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and public.eh_membro(((storage.foldername(name))[1])::uuid));

-- =====================================================================
-- 7. Lembrete diário por e-mail (RF36, RN25)
-- =====================================================================
-- Uma vez por dia, cada conta que não desligou o lembrete recebe um e-mail
-- com as atividades sob a responsabilidade dela que vencem hoje ou nos
-- próximos 2 dias, ou que venceram nos últimos 7 dias, e ainda não foram
-- concluídas. Quem não tem nada nesse intervalo não recebe e-mail.
--
-- Quem envia é o Brevo (api.brevo.com), chamado pelo próprio banco com a
-- extensão pg_net; quem dispara todo dia é a extensão pg_cron. A chave do
-- Brevo fica guardada no Vault do Supabase com o nome "brevo_api_key" e não
-- aparece em nenhum arquivo do projeto. O passo a passo está no README,
-- na seção "Lembrete por e-mail".

create function escapar_html(p_texto text) returns text
language sql immutable as $$
  select replace(replace(replace(replace(coalesce(p_texto, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;')
$$;

-- As atividades de cada conta que entram no lembrete do dia.
create function lembretes_do_dia(p_hoje date default (now() at time zone 'America/Sao_Paulo')::date)
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

-- Monta e envia os e-mails do dia. Devolve quantos foram enviados. Rodar de
-- novo no mesmo dia não manda nada repetido (perfil.ultimo_lembrete).
-- O e-mail segue a identidade do Vértice: topo escuro com a marca (a imagem
-- vem do próprio site, em /email-marca.png), as atrasadas separadas das que
-- vencem nos próximos dias e cada atividade num cartão com a situação.
create function enviar_lembretes(p_remetente text, p_nome_remetente text default 'Vértice',
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

-- =====================================================================
-- 8. Acesso pela API do Supabase
-- =====================================================================
-- O Supabase pode criar as tabelas novas sem acesso pela API (depende da
-- configuração do projeto). As permissões ficam explícitas aqui; quem limita
-- o que cada conta vê e altera continuam sendo as regras de acesso por linha.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on conquista to anon;
grant execute on all functions in schema public to authenticated;

-- Só o agendamento (pg_cron, que roda como dono do banco) chama o envio.
revoke execute on function lembretes_do_dia(date) from public, anon, authenticated;
revoke execute on function enviar_lembretes(text, text, text) from public, anon, authenticated;
