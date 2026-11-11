-- =====================================================================
-- Vértice · verificações do banco (T46)
-- Roda num PostgreSQL local (nunca no Supabase de produção), nesta ordem:
--   psql -d vertice -f 06-apoio-teste-local.sql   (imita o que o Supabase já tem)
--   psql -d vertice -f 04-script-criacao.sql
--   psql -d vertice -f 05-verificacoes.sql
-- No repositório de trabalho os mesmos arquivos estão em supabase/:
-- stub-supabase.sql, schema.sql e testes.sql.
-- Cada conferência imprime "ok" ou "FALHOU"; no fim, o total.
-- As conferências do fim (espaço pessoal, "A definir", evento de vários dias,
-- conquista retirada e lembrete) entraram na revisão de 11/11/2026.
-- =====================================================================
\set ON_ERROR_STOP 1
\o /dev/null
set client_min_messages = notice;

create schema if not exists teste;
create table if not exists teste.resultado (n serial, nome text, ok boolean);
truncate teste.resultado;
grant usage on schema teste to authenticated;
grant all on all tables in schema teste to authenticated;
grant all on all sequences in schema teste to authenticated;

-- confere um valor
create or replace function teste.confere(p_nome text, p_real anyelement, p_esperado anyelement) returns void
language plpgsql as $$
begin
  insert into teste.resultado (nome, ok) values (p_nome, p_real is not distinct from p_esperado);
  raise notice '% %: % (esperado %)', case when p_real is not distinct from p_esperado then 'ok    ' else 'FALHOU' end,
    p_nome, p_real, p_esperado;
end $$;

-- confere que um comando é recusado com a mensagem certa
create or replace function teste.recusa(p_nome text, p_sql text, p_mensagem text) returns void
language plpgsql as $$
declare v_msg text := '(não deu erro)';
begin
  begin
    execute p_sql;
  exception when others then v_msg := sqlerrm;
  end;
  perform teste.confere(p_nome, v_msg, p_mensagem);
end $$;

-- "entra" como uma conta
create or replace function teste.como(p_usuario uuid) returns void language sql as $$
  select set_config('request.jwt.claim.sub', coalesce(p_usuario::text, ''), false) $$;

grant execute on all functions in schema teste to authenticated;

-- Contas de teste
delete from auth.users;
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'ana@exemplo.com'),
  ('00000000-0000-0000-0000-00000000000b', 'bruno@exemplo.com'),
  ('00000000-0000-0000-0000-00000000000c', 'carla@exemplo.com'),
  ('00000000-0000-0000-0000-00000000000d', 'intrusa@exemplo.com');

set role authenticated;

-- ---------------------------------------------------------------------
-- Criar grupo e convite (RF01, RF28, RN07)
-- ---------------------------------------------------------------------
select teste.como(null);
select teste.recusa('sem conta não cria grupo',
  $$ insert into grupo (nome) values ('Grupo') $$, 'new row violates row-level security policy for table "grupo"');

select teste.como('00000000-0000-0000-0000-00000000000a');
reset role;
create temp table ids as select gen_random_uuid() as grupo;
grant all on ids to authenticated;
set role authenticated;
insert into grupo (id_grupo, nome, descricao) select grupo, 'Trio do TCC', 'Grupo de teste' from ids;
insert into membro (id_grupo, id_usuario, nome, email, perfil)
  select grupo, auth.uid(), 'Ana Souza', 'ana@exemplo.com', 'organizador' from ids;
select teste.confere('quem cria entra como organizador',
  (select perfil from membro where id_usuario = auth.uid()), 'organizador'::varchar);

-- a organizadora cadastra a Carla (sem conta ainda) e gera um convite
insert into membro (id_grupo, nome, email) select grupo, 'Carla Dias', 'carla@exemplo.com' from ids;
insert into convite (id_grupo, codigo) select grupo, 'ABCD2345' from ids;

select teste.como('00000000-0000-0000-0000-00000000000b');
select teste.recusa('código errado é recusado',
  $$ select entrar_com_codigo('ZZZZ9999', 'Bruno') $$, 'Código de convite inválido ou vencido.');
select teste.confere('antes do convite, Bruno não vê o grupo', (select count(*) from grupo), 0::bigint);
select teste.confere('com o código, Bruno entra no grupo',
  entrar_com_codigo('abcd2345', 'Bruno Lima'), (select grupo from ids));
select teste.confere('e entra como participante',
  (select perfil from membro where id_usuario = auth.uid()), 'participante'::varchar);

select teste.como('00000000-0000-0000-0000-00000000000c');
select entrar_com_codigo('ABCD2345', 'Carla');
select teste.confere('Carla, já cadastrada pelo e-mail, é ligada ao cadastro existente',
  (select count(*) from membro where nome = 'Carla Dias' and id_usuario = auth.uid()), 1::bigint);
select teste.confere('sem criar um membro repetido', (select count(*) from membro), 3::bigint);

-- ---------------------------------------------------------------------
-- RN01: um grupo não enxerga o outro
-- ---------------------------------------------------------------------
select teste.como('00000000-0000-0000-0000-00000000000d');
reset role;
create temp table ids2 as select gen_random_uuid() as grupo;
grant all on ids2 to authenticated;
set role authenticated;
insert into grupo (id_grupo, nome) select grupo, 'Grupo da Intrusa' from ids2;
insert into membro (id_grupo, id_usuario, nome, perfil) select grupo, auth.uid(), 'Intrusa', 'organizador' from ids2;
select teste.recusa('ninguém entra sozinho num grupo que já tem membros',
  format($$ insert into membro (id_grupo, id_usuario, nome, perfil) values (%L, auth.uid(), 'Intrusa', 'organizador') $$, (select grupo from ids)),
  'new row violates row-level security policy for table "membro"');
select teste.confere('a intrusa só vê o próprio grupo', (select count(*) from grupo), 1::bigint);
select teste.confere('e nenhum membro do Trio', (select count(*) from membro where nome = 'Ana Souza'), 0::bigint);

-- ---------------------------------------------------------------------
-- Disciplina e conteúdo: só o organizador (RN07)
-- ---------------------------------------------------------------------
select teste.como('00000000-0000-0000-0000-00000000000b');
select teste.recusa('participante não cadastra disciplina',
  format($$ insert into disciplina (id_grupo, nome) values (%L, 'Física') $$, (select grupo from ids)),
  'new row violates row-level security policy for table "disciplina"');

select teste.como('00000000-0000-0000-0000-00000000000a');
insert into disciplina (id_grupo, nome, cor) select grupo, 'Banco de Dados', '#3b82f6' from ids;
insert into disciplina (id_grupo, nome, cor) select grupo, 'TCC', '#f59e0b' from ids;
select teste.recusa('nome de disciplina repetido (RN03)',
  format($$ insert into disciplina (id_grupo, nome) values (%L, ' banco de dados ') $$, (select grupo from ids)),
  'duplicate key value violates unique constraint "uk_disciplina_nome"');
insert into conteudo (id_disciplina, nome)
  select id_disciplina, 'Modelagem' from disciplina where nome = 'Banco de Dados';
insert into conteudo (id_disciplina, nome)
  select id_disciplina, 'Referencial' from disciplina where nome = 'TCC';

-- ---------------------------------------------------------------------
-- Atividade: RN13, RN20, RN06
-- ---------------------------------------------------------------------
select teste.recusa('conteúdo de outra disciplina é recusado (RN13)',
  $$ insert into atividade (id_disciplina, id_conteudo, id_responsavel, titulo, prazo)
     select (select id_disciplina from disciplina where nome = 'Banco de Dados'),
            (select id_conteudo from conteudo where nome = 'Referencial'),
            (select id_membro from membro where nome = 'Bruno Lima'), 'Modelar o ER', current_date $$,
  'Esse conteúdo é de outra disciplina.');

select teste.recusa('título com menos de 3 letras (RN06)',
  $$ insert into atividade (id_disciplina, id_responsavel, titulo, prazo)
     select (select id_disciplina from disciplina where nome = 'Banco de Dados'),
            (select id_membro from membro where nome = 'Bruno Lima'), 'ER', current_date $$,
  'new row for relation "atividade" violates check constraint "atividade_titulo_check"');

-- a organizadora cria uma atividade para o Bruno (sem conteúdo: é opcional)
insert into atividade (id_disciplina, id_responsavel, titulo, prazo, peso)
  select (select id_disciplina from disciplina where nome = 'Banco de Dados'),
         (select id_membro from membro where nome = 'Bruno Lima'), 'Modelar o diagrama ER', current_date + 3, 3;
insert into atividade (id_disciplina, id_conteudo, id_responsavel, titulo, prazo, peso)
  select (select id_disciplina from disciplina where nome = 'Banco de Dados'),
         (select id_conteudo from conteudo where nome = 'Modelagem'),
         (select id_membro from membro where nome = 'Ana Souza'), 'Normalizar as tabelas', current_date + 5, 1;

select teste.recusa('a organizadora não conclui a atividade do Bruno (RN20)',
  $$ update atividade set status = 'concluido' where titulo = 'Modelar o diagrama ER' $$,
  'Só o responsável muda o status da atividade.');
update atividade set titulo = 'Modelar o diagrama ER completo' where titulo = 'Modelar o diagrama ER';
select teste.confere('mas edita o título dela (RN07)',
  (select count(*) from atividade where titulo = 'Modelar o diagrama ER completo'), 1::bigint);

select teste.como('00000000-0000-0000-0000-00000000000c');
update atividade set titulo = 'Tentativa da Carla' where titulo = 'Modelar o diagrama ER completo';
select teste.confere('outra participante não edita a atividade do Bruno (nada muda)',
  (select count(*) from atividade where titulo = 'Tentativa da Carla'), 0::bigint);

select teste.como('00000000-0000-0000-0000-00000000000b');
update atividade set status = 'concluido' where titulo = 'Modelar o diagrama ER completo';
select teste.confere('Bruno conclui a dele, e a data de conclusão é gravada',
  (select data_conclusao is not null from atividade where titulo = 'Modelar o diagrama ER completo'), true);
select teste.confere('o histórico registra 3 de 4 pontos de peso (RF12)',
  (select percentual from progresso_historico p join disciplina d using (id_disciplina)
    where d.nome = 'Banco de Dados' and data_registro = (now() at time zone 'America/Sao_Paulo')::date), 75.00::numeric);
update atividade set status = 'a fazer' where titulo = 'Modelar o diagrama ER completo';
select teste.confere('reabrir apaga a data de conclusão',
  (select data_conclusao from atividade where titulo = 'Modelar o diagrama ER completo'), null::timestamptz);
select teste.confere('e o histórico do dia é atualizado, sem linha nova',
  (select string_agg(percentual::text, ',') from progresso_historico p join disciplina d using (id_disciplina)
    where d.nome = 'Banco de Dados'), '0.00');

-- ---------------------------------------------------------------------
-- Evento: autor e permissão (RN21)
-- ---------------------------------------------------------------------
select teste.como('00000000-0000-0000-0000-00000000000c');
insert into evento (id_grupo, titulo, tipo, data_evento, hora_inicio, hora_fim)
  select grupo, 'Reunião do grupo', 'reuniao', current_date + 2, '19:00', '20:00' from ids;
select teste.confere('o autor do evento é quem está logado',
  (select m.nome from evento e join membro m on m.id_membro = e.id_criador where e.titulo = 'Reunião do grupo'),
  'Carla Dias'::varchar);
select teste.recusa('fim antes do início é recusado',
  format($$ insert into evento (id_grupo, titulo, tipo, data_evento, hora_inicio, hora_fim)
            values (%L, 'Prova', 'prova', current_date, '20:00', '19:00') $$, (select grupo from ids)),
  'new row for relation "evento" violates check constraint "ck_evento_horas"');

select teste.como('00000000-0000-0000-0000-00000000000b');
update evento set local_evento = 'Sala do Bruno' where titulo = 'Reunião do grupo';
select teste.confere('outro participante não edita o evento da Carla',
  (select local_evento from evento where titulo = 'Reunião do grupo'), null::varchar);

select teste.como('00000000-0000-0000-0000-00000000000a');
update evento set local_evento = 'Biblioteca' where titulo = 'Reunião do grupo';
select teste.confere('a organizadora edita qualquer evento',
  (select local_evento from evento where titulo = 'Reunião do grupo'), 'Biblioteca'::varchar);

-- ---------------------------------------------------------------------
-- Membros: RN02 e RN07
-- ---------------------------------------------------------------------
select teste.recusa('a única organizadora não vira participante',
  $$ update membro set perfil = 'participante' where nome = 'Ana Souza' $$,
  'O grupo precisa de pelo menos um organizador.');

select teste.como('00000000-0000-0000-0000-00000000000b');
select teste.recusa('participante não se promove a organizador',
  $$ update membro set perfil = 'organizador' where nome = 'Bruno Lima' $$,
  'Só o organizador muda o perfil dos membros.');
update membro set funcao = 'Back-end' where nome = 'Bruno Lima';
select teste.confere('mas edita o próprio cadastro', (select funcao from membro where nome = 'Bruno Lima'), 'Back-end'::varchar);
delete from membro where nome = 'Carla Dias';
select teste.confere('participante não remove membro (nada muda)',
  (select count(*) from membro where nome = 'Carla Dias'), 1::bigint);

select teste.como('00000000-0000-0000-0000-00000000000a');
select teste.recusa('remover o Bruno com atividades, sem passá-las a alguém, é recusado (RN02)',
  $$ delete from membro where nome = 'Bruno Lima' $$,
  'update or delete on table "membro" violates foreign key constraint "atividade_id_responsavel_fkey" on table "atividade"');
update atividade set id_responsavel = (select id_membro from membro where nome = 'Carla Dias')
 where id_responsavel = (select id_membro from membro where nome = 'Bruno Lima');
delete from membro where nome = 'Bruno Lima';
select teste.confere('a atividade do Bruno passou para a Carla',
  (select m.nome from atividade a join membro m on m.id_membro = a.id_responsavel
    where a.titulo = 'Modelar o diagrama ER completo'), 'Carla Dias'::varchar);
select teste.confere('e o Bruno saiu do grupo', (select count(*) from membro where nome = 'Bruno Lima'), 0::bigint);

-- ---------------------------------------------------------------------
-- Fotos no Storage (RF24, RF29)
-- ---------------------------------------------------------------------
select teste.como('00000000-0000-0000-0000-00000000000a');
select teste.recusa('membro grava foto na pasta do grupo',
  format($$ insert into storage.objects (bucket_id, name) values ('fotos', '%s/membro-ana.jpg') $$, (select grupo from ids)),
  '(não deu erro)');
select teste.como('00000000-0000-0000-0000-00000000000d');
select teste.recusa('quem é de fora não grava na pasta do grupo',
  format($$ insert into storage.objects (bucket_id, name) values ('fotos', '%s/intrusa.jpg') $$, (select grupo from ids)),
  'new row violates row-level security policy for table "objects"');
select teste.como('00000000-0000-0000-0000-00000000000a');

-- ---------------------------------------------------------------------
-- Exclusões em cascata (RN02)
-- ---------------------------------------------------------------------
delete from conteudo where nome = 'Modelagem';
select teste.confere('excluir o conteúdo mantém a atividade na disciplina, sem conteúdo',
  (select id_conteudo from atividade where titulo = 'Normalizar as tabelas'), null::uuid);
delete from disciplina where nome = 'Banco de Dados';
select teste.confere('excluir a disciplina leva as atividades junto', (select count(*) from atividade), 0::bigint);
insert into evento (id_grupo, id_disciplina, titulo, tipo, data_evento)
  select grupo, (select id_disciplina from disciplina where nome = 'TCC'), 'Banca', 'apresentacao', current_date + 20 from ids;
delete from disciplina where nome = 'TCC';
select teste.confere('o evento da disciplina excluída fica no grupo, sem disciplina',
  (select id_disciplina from evento where titulo = 'Banca'), null::uuid);
delete from grupo;
select teste.confere('excluir o grupo leva membros, eventos e convites',
  (select count(*) from membro) + (select count(*) from evento) + (select count(*) from convite), 0::bigint);

reset role;
select teste.como(null);
select teste.confere('a intrusa continua com o grupo dela', (select count(*) from grupo), 1::bigint);

-- =====================================================================
-- Revisão de 11/11/2026
-- =====================================================================
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000e', 'eva@exemplo.com', '{"nome": "Eva Melo"}'),
  ('00000000-0000-0000-0000-00000000000f', 'fabio@exemplo.com', '{}'),
  ('00000000-0000-0000-0000-000000000010', 'gil@exemplo.com', '{"full_name": "Gil Prado"}');
set role authenticated;

-- ---------------------------------------------------------------------
-- Espaço pessoal e perfil da conta (RF34, RF35, RN24)
-- ---------------------------------------------------------------------
select teste.como('00000000-0000-0000-0000-00000000000e');
reset role;
create temp table ids4 (pessoal uuid);
grant all on ids4 to authenticated;
set role authenticated;
insert into ids4 select garantir_espaco_pessoal();
select teste.confere('o primeiro acesso cria o espaço pessoal',
  (select pessoal from grupo where id_grupo = (select pessoal from ids4)), true);
select garantir_espaco_pessoal();
select teste.confere('e o segundo acesso devolve o mesmo espaço, sem criar outro',
  (select count(*) from grupo where pessoal), 1::bigint);
select teste.confere('o perfil nasce com o nome do cadastro da conta',
  (select nome from perfil), 'Eva Melo'::varchar);
select teste.confere('e a pessoa é a organizadora do próprio espaço',
  (select perfil from membro where id_grupo = (select pessoal from ids4)), 'organizador'::varchar);
select teste.recusa('ninguém cria um espaço pessoal por fora',
  $$ insert into grupo (nome, pessoal) values ('Outro pessoal', true) $$,
  'new row violates row-level security policy for table "grupo"');
update grupo set pessoal = false where pessoal;
select teste.confere('o espaço pessoal não deixa de ser pessoal', (select count(*) from grupo where pessoal), 1::bigint);
delete from grupo where pessoal;
select teste.confere('e não é excluído', (select count(*) from grupo where pessoal), 1::bigint);
select teste.recusa('o espaço pessoal não tem convite',
  $$ insert into convite (id_grupo, codigo) values (garantir_espaco_pessoal(), 'PESS2345') $$,
  'new row violates row-level security policy for table "convite"');
select teste.recusa('nem recebe outro membro',
  $$ insert into membro (id_grupo, nome) values (garantir_espaco_pessoal(), 'Visita') $$,
  'new row violates row-level security policy for table "membro"');

insert into atividade (id_grupo, titulo, prazo) values (garantir_espaco_pessoal(), 'Pagar a conta de luz', current_date + 1);
select teste.confere('atividade pessoal sem disciplina fica com a dona do espaço (RN24)',
  (select m.nome from atividade a join membro m on m.id_membro = a.id_responsavel where a.titulo = 'Pagar a conta de luz'),
  'Eva Melo'::varchar);

update perfil set nome = 'Eva M. Melo', id_grupo_pessoal = null, ultimo_lembrete = current_date;
select teste.confere('o perfil muda o nome, mas não a ligação com o espaço nem o lembrete',
  (select nome = 'Eva M. Melo' and id_grupo_pessoal is not null and ultimo_lembrete is null from perfil), true);
update perfil set nome = 'Eva Melo';

-- grupo comum da Eva, com disciplina e convite
reset role;
create temp table ids3 as select gen_random_uuid() as grupo;
grant all on ids3 to authenticated;
set role authenticated;
insert into grupo (id_grupo, nome) select grupo, 'Turma de Redes' from ids3;
insert into membro (id_grupo, id_usuario, nome, email, perfil) select grupo, auth.uid(), 'Eva Melo', 'eva@exemplo.com', 'organizador' from ids3;
insert into disciplina (id_grupo, nome) select grupo, 'Redes' from ids3;
insert into convite (id_grupo, codigo) select grupo, 'REDE2345' from ids3;
insert into membro (id_grupo, nome, email) select grupo, 'Gil (cadastrado)', 'gil@exemplo.com' from ids3;

select teste.recusa('no grupo, a atividade precisa de disciplina (RN24)',
  format($$ insert into atividade (id_grupo, titulo, prazo) values (%L, 'Sem disciplina', current_date) $$, (select grupo from ids3)),
  'Escolha a disciplina da atividade.');

select teste.como('00000000-0000-0000-0000-00000000000f');
select garantir_espaco_pessoal();
select teste.confere('sem nome no cadastro, o perfil usa o começo do e-mail', (select nome from perfil), 'fabio'::varchar);
update perfil set nome = 'Fábio Reis', avatar = 'fabio1';
select teste.confere('outra conta não vê o espaço pessoal da Eva',
  (select count(*) from grupo where pessoal), 1::bigint);
select entrar_com_codigo('REDE2345', 'qualquer nome');
select teste.confere('quem entra por convite fica com o nome e o avatar do perfil (RF35)',
  (select nome || '/' || avatar from membro where id_usuario = auth.uid() and id_grupo = (select grupo from ids3)),
  'Fábio Reis/fabio1');

-- Gil já estava cadastrado pela Eva; entra e muda a foto no grupo antes da revisão
select teste.como('00000000-0000-0000-0000-000000000010');
reset role;
-- (o membro dele é ligado como se fosse antes da revisão, sem perfil)
set vertice.ligando_conta = 'sim';
update membro set id_usuario = '00000000-0000-0000-0000-000000000010', foto = 'https://exemplo.com/gil.jpg'
 where nome = 'Gil (cadastrado)';
reset vertice.ligando_conta;
set role authenticated;
select garantir_espaco_pessoal();
select teste.confere('quem já tinha conta ganha o perfil com o nome da conta e a foto do grupo',
  (select nome || ' ' || foto from perfil), 'Gil Prado https://exemplo.com/gil.jpg');
select teste.confere('e o nome e a foto passam a valer em todos os grupos',
  (select count(*) from membro where id_usuario = auth.uid() and nome = 'Gil Prado' and foto = 'https://exemplo.com/gil.jpg'),
  2::bigint);

-- ---------------------------------------------------------------------
-- Atividade "A definir" (RN06 revisada)
-- ---------------------------------------------------------------------
select teste.como('00000000-0000-0000-0000-00000000000e');
insert into atividade (id_grupo, id_disciplina, titulo, prazo)
  select grupo, (select id_disciplina from disciplina where nome = 'Redes'), 'Montar a topologia', current_date + 2 from ids3;
select teste.confere('a atividade pode ficar sem responsável',
  (select id_responsavel from atividade where titulo = 'Montar a topologia'), null::uuid);
select teste.recusa('mas não é concluída sem alguém assumir',
  $$ insert into atividade (id_grupo, id_disciplina, titulo, prazo, status)
     select id_grupo, id_disciplina, 'Já pronta', current_date, 'concluido' from disciplina where nome = 'Redes' $$,
  'Só o responsável muda o status da atividade.');
reset role;
select teste.como(null);
select teste.recusa('nem mesmo pela carga direta do painel',
  $$ insert into atividade (id_grupo, id_disciplina, titulo, prazo, status, data_conclusao)
     select id_grupo, id_disciplina, 'Já pronta', current_date, 'concluido', now() from disciplina where nome = 'Redes' $$,
  'new row for relation "atividade" violates check constraint "ck_atividade_a_definir"');
set role authenticated;

select teste.como('00000000-0000-0000-0000-00000000000f');
select teste.confere('qualquer membro vê a atividade "A definir"',
  (select count(*) from atividade where titulo = 'Montar a topologia'), 1::bigint);
select teste.recusa('o participante não muda o título sem assumir',
  $$ update atividade set titulo = 'Outro título' where titulo = 'Montar a topologia' $$,
  'Assuma a atividade antes de mudar outra coisa nela.');
select teste.recusa('nem passa a atividade para outra pessoa',
  $$ update atividade set id_responsavel = (select id_membro from membro where nome = 'Gil Prado')
     where titulo = 'Montar a topologia' $$,
  'Assuma a atividade antes de mudar outra coisa nela.');
update atividade set id_responsavel = membro_atual(id_grupo) where titulo = 'Montar a topologia';
select teste.confere('mas assume para si',
  (select m.nome from atividade a join membro m on m.id_membro = a.id_responsavel where a.titulo = 'Montar a topologia'),
  'Fábio Reis'::varchar);
update atividade set status = 'concluido' where titulo = 'Montar a topologia';
select teste.confere('e, depois de assumir, conclui',
  (select status from atividade where titulo = 'Montar a topologia'), 'concluido'::varchar);
select teste.recusa('a atividade não muda de grupo',
  $$ update atividade set id_grupo = garantir_espaco_pessoal() where titulo = 'Montar a topologia' $$,
  'A disciplina escolhida não pertence a este grupo.');

-- ---------------------------------------------------------------------
-- Conquista retirada junto com a experiência (RN12 revisada)
-- ---------------------------------------------------------------------
insert into membro_conquista (id_membro, codigo_conquista)
  select membro_atual(grupo), 'PRIMEIRO_PASSO' from ids3;
select teste.como('00000000-0000-0000-0000-00000000000e');
delete from membro_conquista;
select teste.confere('ninguém retira a conquista de outra pessoa', (select count(*) from membro_conquista), 1::bigint);
select teste.como('00000000-0000-0000-0000-00000000000f');
delete from membro_conquista;
select teste.confere('a própria pessoa retira a dela', (select count(*) from membro_conquista), 0::bigint);

-- ---------------------------------------------------------------------
-- Evento de vários dias (RF31)
-- ---------------------------------------------------------------------
select teste.recusa('o fim do evento não vem antes do começo',
  format($$ insert into evento (id_grupo, titulo, tipo, data_evento, data_fim) values (%L, 'Semana acadêmica', 'palestra', current_date + 5, current_date + 1) $$,
         (select grupo from ids3)),
  'new row for relation "evento" violates check constraint "ck_evento_periodo"');
insert into evento (id_grupo, titulo, tipo, data_evento, data_fim, hora_inicio, hora_fim)
  select grupo, 'Semana acadêmica', 'palestra', current_date + 1, current_date + 3, '19:00', '10:00' from ids3;
select teste.confere('em vários dias, a hora do fim pode ser menor que a do começo',
  (select data_fim - data_evento from evento where titulo = 'Semana acadêmica'), 2);

-- ---------------------------------------------------------------------
-- Lembrete por e-mail (RF36, RN25)
-- ---------------------------------------------------------------------
select teste.recusa('uma conta não dispara o lembrete',
  $$ select enviar_lembretes('vertice@exemplo.com') $$, 'permission denied for function enviar_lembretes');

select teste.como('00000000-0000-0000-0000-00000000000e');
insert into atividade (id_grupo, titulo, prazo) values
  (garantir_espaco_pessoal(), 'Renovar a matrícula', current_date - 3),
  (garantir_espaco_pessoal(), 'Comprar o <livro> & caderno', current_date),
  (garantir_espaco_pessoal(), 'Viagem de fim de ano', current_date + 20);
select teste.como(null);
reset role;
insert into vault.decrypted_secrets values ('brevo_api_key', 'chave-de-teste');
select teste.confere('o lembrete sai só para quem tem atividade perto do prazo',
  enviar_lembretes('vertice@exemplo.com'), 1);
select teste.confere('para a Eva, com as 3 atividades do intervalo e o assunto de atraso',
  (select body -> 'to' -> 0 ->> 'email' || ' ' || (length(body ->> 'htmlContent') - length(replace(body ->> 'htmlContent', '<tr>', ''))) / 4
          || ' ' || (body ->> 'subject') from net.chamadas),
  'eva@exemplo.com 3 Vértice: atividades atrasadas ou perto do prazo');
select teste.confere('com a chave do Brevo no cabeçalho, vinda do Vault',
  (select headers ->> 'api-key' from net.chamadas), 'chave-de-teste');
select teste.confere('e o título com < e & não quebra o e-mail',
  (select position('Comprar o &lt;livro&gt; &amp; caderno' in body ->> 'htmlContent') > 0 from net.chamadas), true);
select teste.confere('rodar de novo no mesmo dia não manda nada repetido',
  enviar_lembretes('vertice@exemplo.com'), 0);
update perfil set ultimo_lembrete = null, lembrete_email = false where nome = 'Eva Melo';
select teste.confere('quem desligou o lembrete não recebe', enviar_lembretes('vertice@exemplo.com'), 0);

\o
-- ---------------------------------------------------------------------
select format('%s de %s conferências passaram', count(*) filter (where ok), count(*)) as resultado
from teste.resultado;
select nome as falhou from teste.resultado where not ok;
