-- =====================================================================
-- Vértice · Plataforma de Acompanhamento de Aprendizagem
-- Banco de dados no Supabase (PostgreSQL)
-- Equipe 7 · criado em 08/11/2026 para a entrega de 27/11 (T46, T49, T50)
--
-- Como usar: no painel do Supabase, abrir "SQL Editor", colar este
-- arquivo inteiro e executar. Ele pode ser executado de novo: apaga o
-- que criou antes (seção 0) e cria tudo outra vez.
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
  evento, atividade, conteudo, disciplina, membro, grupo cascade;
drop function if exists eh_membro(uuid), eh_organizador(uuid), membro_atual(uuid),
  grupo_da_disciplina(uuid), grupo_sem_membros(uuid), entrar_com_codigo(text, text),
  conferir_atividade(), conferir_membro(), conferir_remocao_membro(),
  conferir_evento(), registrar_progresso(), progresso_da_disciplina(uuid) cascade;


-- =====================================================================
-- 1. Tabelas
-- =====================================================================

-- grupo: raiz da estrutura (RF01, RF29)
create table grupo (
  id_grupo      uuid primary key default gen_random_uuid(),
  nome          varchar(80)  not null check (char_length(btrim(nome)) > 0),
  descricao     varchar(255),
  foto          text,                       -- caminho no Storage (RF29)
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
create table atividade (
  id_atividade    uuid primary key default gen_random_uuid(),
  id_disciplina   uuid not null references disciplina (id_disciplina) on delete cascade,
  id_conteudo     uuid references conteudo (id_conteudo) on delete set null,
  -- "no action" (e não "restrict"): a conferência fica para o fim do comando,
  -- e assim a exclusão do grupo inteiro, em cascata, não é barrada
  id_responsavel  uuid not null references membro (id_membro) on delete no action,
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
  check ((status = 'concluido') = (data_conclusao is not null))
);
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
  hora_inicio    time,
  hora_fim       time,
  local_evento   varchar(120),
  descricao      text,
  data_criacao   timestamptz  not null default now(),
  check (hora_fim is null or (hora_inicio is not null and hora_fim > hora_inicio))
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

-- membro_conquista: N:N; a chave composta impede a concessão duplicada (RN12)
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


-- =====================================================================
-- 3. Regras de negócio conferidas pelo banco (gatilhos)
-- As mensagens são as mesmas que o sistema mostra na tela.
-- =====================================================================

-- Atividade: RN13 (conteúdo da mesma disciplina), RN03 (responsável do mesmo
-- grupo), RN20 (só o responsável muda o status) e a data de conclusão.
create function conferir_atividade() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_grupo uuid := grupo_da_disciplina(new.id_disciplina);
begin
  if new.id_conteudo is not null and not exists (
       select 1 from conteudo where id_conteudo = new.id_conteudo and id_disciplina = new.id_disciplina) then
    raise exception 'Esse conteúdo é de outra disciplina.' using errcode = 'check_violation';
  end if;

  if not exists (select 1 from membro where id_membro = new.id_responsavel and id_grupo = v_grupo) then
    raise exception 'O responsável precisa ser membro do grupo.' using errcode = 'check_violation';
  end if;

  -- RN20: só o responsável muda o status. Na criação, só quem é o próprio
  -- responsável pode criar a atividade já fora de "a fazer". Quando não há
  -- conta logada (auth.uid() nulo: carga feita pelo próprio painel), não se aplica.
  if auth.uid() is not null then
    if tg_op = 'INSERT' and new.status <> 'a fazer'
       and membro_atual(v_grupo) is distinct from new.id_responsavel then
      raise exception 'Só o responsável muda o status da atividade.' using errcode = 'insufficient_privilege';
    end if;
    if tg_op = 'UPDATE' and new.status is distinct from old.status
       and membro_atual(v_grupo) is distinct from old.id_responsavel then
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

-- Entrar com código de convite (RF28). Se o organizador já tinha
-- cadastrado a pessoa com o mesmo e-mail, a conta é ligada a esse cadastro.
create function entrar_com_codigo(p_codigo text, p_nome text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_convite convite;
  v_email   text := (select email from auth.users where id = auth.uid());
  v_membro  uuid;
begin
  if auth.uid() is null then
    raise exception 'Entre com a sua conta para usar o convite.' using errcode = 'insufficient_privilege';
  end if;
  select * into v_convite from convite where codigo = upper(btrim(p_codigo));
  if not found or not v_convite.ativo or v_convite.expira_em < now() then
    raise exception 'Código de convite inválido ou vencido.' using errcode = 'no_data_found';
  end if;
  if eh_membro(v_convite.id_grupo) then
    return v_convite.id_grupo;
  end if;
  select id_membro into v_membro from membro
   where id_grupo = v_convite.id_grupo and id_usuario is null
     and v_email is not null and lower(email) = lower(v_email)
   limit 1;
  if v_membro is not null then
    perform set_config('vertice.ligando_conta', 'sim', true);
    update membro set id_usuario = auth.uid() where id_membro = v_membro;
    perform set_config('vertice.ligando_conta', '', true);
  else
    insert into membro (id_grupo, id_usuario, nome, email, perfil)
      values (v_convite.id_grupo, auth.uid(), btrim(p_nome), v_email, 'participante');
  end if;
  return v_convite.id_grupo;
end $$;

-- =====================================================================
-- 5. Acesso por linha: cada grupo só enxerga o que é dele (RN01)
-- =====================================================================
alter table grupo               enable row level security;
alter table membro              enable row level security;
alter table disciplina          enable row level security;
alter table conteudo            enable row level security;
alter table atividade           enable row level security;
alter table evento              enable row level security;
alter table convite             enable row level security;
alter table progresso_historico enable row level security;
alter table conquista           enable row level security;
alter table membro_conquista    enable row level security;

-- grupo: qualquer conta cria; vê quem é membro; edita e exclui o organizador
create policy grupo_criar   on grupo for insert to authenticated with check (auth.uid() is not null);
create policy grupo_ver     on grupo for select to authenticated using (eh_membro(id_grupo));
create policy grupo_editar  on grupo for update to authenticated using (eh_organizador(id_grupo));
create policy grupo_excluir on grupo for delete to authenticated using (eh_organizador(id_grupo));

-- membro: o organizador cadastra, edita e remove; cada um edita o próprio
-- cadastro. Num grupo recém-criado, quem cria entra como organizador (RN07).
-- Remover um membro com atividades exige passá-las antes a outro (RN02):
-- o sistema atualiza as atividades e depois exclui o membro.
create policy membro_ver       on membro for select to authenticated using (eh_membro(id_grupo));
create policy membro_cadastrar on membro for insert to authenticated
  with check (eh_organizador(id_grupo)
              or (grupo_sem_membros(id_grupo) and id_usuario = auth.uid() and perfil = 'organizador'));
create policy membro_editar    on membro for update to authenticated
  using (eh_organizador(id_grupo) or id_usuario = auth.uid());
create policy membro_excluir   on membro for delete to authenticated using (eh_organizador(id_grupo));

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
-- responsável (RN07); mudar o status, só o responsável (RN20, no gatilho)
create policy atividade_ver       on atividade for select to authenticated
  using (eh_membro(grupo_da_disciplina(id_disciplina)));
create policy atividade_cadastrar on atividade for insert to authenticated
  with check (eh_membro(grupo_da_disciplina(id_disciplina)));
create policy atividade_editar    on atividade for update to authenticated
  using (eh_organizador(grupo_da_disciplina(id_disciplina))
         or id_responsavel = membro_atual(grupo_da_disciplina(id_disciplina)))
  with check (eh_membro(grupo_da_disciplina(id_disciplina)));
create policy atividade_excluir   on atividade for delete to authenticated
  using (eh_organizador(grupo_da_disciplina(id_disciplina))
         or id_responsavel = membro_atual(grupo_da_disciplina(id_disciplina)));

-- evento: qualquer membro cadastra; editar e excluir, o autor ou o organizador (RN21)
create policy evento_ver       on evento for select to authenticated using (eh_membro(id_grupo));
create policy evento_cadastrar on evento for insert to authenticated with check (eh_membro(id_grupo));
create policy evento_editar    on evento for update to authenticated
  using (eh_organizador(id_grupo) or id_criador = membro_atual(id_grupo));
create policy evento_excluir   on evento for delete to authenticated
  using (eh_organizador(id_grupo) or id_criador = membro_atual(id_grupo));

-- convite: só o organizador vê e gera (a entrada é por entrar_com_codigo())
create policy convite_ver     on convite for select to authenticated using (eh_organizador(id_grupo));
create policy convite_criar   on convite for insert to authenticated with check (eh_organizador(id_grupo));
create policy convite_editar  on convite for update to authenticated using (eh_organizador(id_grupo));
create policy convite_excluir on convite for delete to authenticated using (eh_organizador(id_grupo));

-- histórico: só leitura (quem grava é o gatilho)
create policy progresso_ver on progresso_historico for select to authenticated
  using (eh_membro(grupo_da_disciplina(id_disciplina)));

-- conquistas: o catálogo é público para quem está logado; a conquista de um
-- membro é vista pelo grupo e gravada pela própria pessoa (quem conclui a
-- atividade é o responsável, que é quem ganha a conquista)
create policy conquista_ver on conquista for select to authenticated using (true);
create policy membro_conquista_ver on membro_conquista for select to authenticated
  using (eh_membro((select id_grupo from membro m where m.id_membro = membro_conquista.id_membro)));
create policy membro_conquista_gravar on membro_conquista for insert to authenticated
  with check (exists (select 1 from membro m
                      where m.id_membro = membro_conquista.id_membro and m.id_usuario = auth.uid()));

-- A entrada por convite fica disponível só para quem está logado
revoke execute on function entrar_com_codigo(text, text) from public, anon;
grant execute on function entrar_com_codigo(text, text) to authenticated;

-- =====================================================================
-- 6. Fotos (RF24, RF29): bucket "fotos" no Storage
-- =====================================================================
-- Leitura pública (a foto aparece pelo endereço). Gravar, só na pasta de um
-- grupo de que a conta é membro: fotos/<id do grupo>/<arquivo>.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 1048576, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg'];

drop policy if exists fotos_enviar on storage.objects;
create policy fotos_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and public.eh_membro(((storage.foldername(name))[1])::uuid));
