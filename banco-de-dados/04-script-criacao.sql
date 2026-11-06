-- =====================================================================
-- Vértice · Plataforma de Acompanhamento de Aprendizagem
-- Script de criação do banco de dados
-- Entrega 2 · Modelagem do Banco de Dados · Equipe 7 · atualizado em 06/11/2026
--
-- Dialeto: MySQL 8. As restrições CHECK são suportadas a partir do 8.0.16.
-- A ordem de criação respeita as dependências de chave estrangeira.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS vertice
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE vertice;

-- ---------------------------------------------------------------------
-- grupo: raiz da estrutura (RF01)
-- ---------------------------------------------------------------------
CREATE TABLE grupo (
    id_grupo      INT           NOT NULL AUTO_INCREMENT,
    nome          VARCHAR(80)   NOT NULL,
    descricao     VARCHAR(255)  NULL,
    foto          VARCHAR(255)  NULL,      -- endereço da foto do grupo (RF29)
    data_criacao  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_grupo PRIMARY KEY (id_grupo)
);

-- ---------------------------------------------------------------------
-- membro: integrantes do grupo (RF02)
-- ON DELETE CASCADE atende à RN02
-- ---------------------------------------------------------------------
CREATE TABLE membro (
    id_membro  INT          NOT NULL AUTO_INCREMENT,
    id_grupo   INT          NOT NULL,
    nome       VARCHAR(80)  NOT NULL,
    funcao     VARCHAR(60)  NULL,
    email      VARCHAR(120) NULL,
    avatar     VARCHAR(60)  NULL,
    estilo_avatar VARCHAR(20) NOT NULL DEFAULT 'croodles-neutral',
    foto       VARCHAR(255) NULL,
    perfil     VARCHAR(15)  NOT NULL DEFAULT 'participante',
    CONSTRAINT pk_membro     PRIMARY KEY (id_membro),
    CONSTRAINT fk_membro_grupo FOREIGN KEY (id_grupo)
        REFERENCES grupo (id_grupo) ON DELETE CASCADE,
    CONSTRAINT ck_membro_perfil
        CHECK (perfil IN ('organizador', 'participante')),
    CONSTRAINT ck_membro_estilo_avatar
        CHECK (estilo_avatar IN ('croodles-neutral', 'adventurer', 'big-smile', 'fun-emoji', 'pixel-art'))
);

-- ---------------------------------------------------------------------
-- disciplina: agrupamento principal do estudo (RF13)
-- ---------------------------------------------------------------------
CREATE TABLE disciplina (
    id_disciplina INT         NOT NULL AUTO_INCREMENT,
    id_grupo      INT         NOT NULL,
    nome          VARCHAR(80) NOT NULL,
    cor           CHAR(7)     NOT NULL DEFAULT '#3b82f6',
    data_criacao  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_disciplina PRIMARY KEY (id_disciplina),
    CONSTRAINT fk_disciplina_grupo FOREIGN KEY (id_grupo)
        REFERENCES grupo (id_grupo) ON DELETE CASCADE,
    CONSTRAINT uk_disciplina_nome UNIQUE (id_grupo, nome)
);

-- ---------------------------------------------------------------------
-- conteudo: divisões opcionais da disciplina (RF14, RN13)
-- Base do progresso por assunto (RN08), quando o grupo usa conteúdos
-- ---------------------------------------------------------------------
CREATE TABLE conteudo (
    id_conteudo   INT          NOT NULL AUTO_INCREMENT,
    id_disciplina INT          NOT NULL,
    nome          VARCHAR(80)  NOT NULL,
    descricao     VARCHAR(255) NULL,
    ordem         INT          NOT NULL DEFAULT 1,
    CONSTRAINT pk_conteudo PRIMARY KEY (id_conteudo),
    CONSTRAINT fk_conteudo_disciplina FOREIGN KEY (id_disciplina)
        REFERENCES disciplina (id_disciplina) ON DELETE CASCADE,
    CONSTRAINT uk_conteudo_nome UNIQUE (id_disciplina, nome)
);

-- ---------------------------------------------------------------------
-- atividade: unidade de execução (RF03)
-- Alimenta progresso (RN08, RN14), experiência (RN10) e ofensiva (RN11)
-- Toda atividade tem disciplina e responsável (RN06, RN13); o conteúdo é
-- opcional e, se o conteúdo for excluído, a atividade fica na disciplina,
-- sem conteúdo (RN02). Que o conteúdo seja da mesma disciplina da
-- atividade é validado na aplicação.
-- O membro só pode ser excluído depois que as atividades dele passam
-- para outro membro (RN02)
-- ---------------------------------------------------------------------
CREATE TABLE atividade (
    id_atividade    INT          NOT NULL AUTO_INCREMENT,
    id_disciplina   INT          NOT NULL,
    id_conteudo     INT          NULL,
    id_responsavel  INT          NOT NULL,
    titulo          VARCHAR(120) NOT NULL,
    descricao       TEXT         NULL,
    prazo           DATE         NOT NULL,
    peso            INT          NOT NULL DEFAULT 1,
    prioridade      VARCHAR(10)  NULL,
    status          VARCHAR(12)  NOT NULL DEFAULT 'a fazer',
    data_criacao    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_conclusao  DATE         NULL,
    CONSTRAINT pk_atividade PRIMARY KEY (id_atividade),
    CONSTRAINT fk_atividade_disciplina FOREIGN KEY (id_disciplina)
        REFERENCES disciplina (id_disciplina) ON DELETE CASCADE,
    CONSTRAINT fk_atividade_conteudo FOREIGN KEY (id_conteudo)
        REFERENCES conteudo (id_conteudo) ON DELETE SET NULL,
    CONSTRAINT fk_atividade_responsavel FOREIGN KEY (id_responsavel)
        REFERENCES membro (id_membro) ON DELETE RESTRICT,
    CONSTRAINT ck_atividade_titulo     CHECK (CHAR_LENGTH(titulo) >= 3),
    CONSTRAINT ck_atividade_peso       CHECK (peso BETWEEN 1 AND 5),
    CONSTRAINT ck_atividade_prioridade CHECK (prioridade IN ('baixa', 'media', 'alta')),
    CONSTRAINT ck_atividade_status     CHECK (status IN ('a fazer', 'fazendo', 'concluido'))
);

CREATE INDEX ix_atividade_status      ON atividade (status);
CREATE INDEX ix_atividade_prazo       ON atividade (prazo);
CREATE INDEX ix_atividade_responsavel ON atividade (id_responsavel, data_conclusao);

-- ---------------------------------------------------------------------
-- evento: prova, apresentação, palestra, reunião (RF31, RN21)
-- Sem horário, vale o dia todo; o fim só existe com o início e vem
-- depois dele. Se a disciplina sai, o evento fica no grupo, sem
-- disciplina (RN02). id_criador é quem cadastrou, para a regra de edição
-- ---------------------------------------------------------------------
CREATE TABLE evento (
    id_evento      INT          NOT NULL AUTO_INCREMENT,
    id_grupo       INT          NOT NULL,
    id_disciplina  INT          NULL,
    id_criador     INT          NULL,
    titulo         VARCHAR(120) NOT NULL,
    tipo           VARCHAR(12)  NOT NULL,
    data_evento    DATE         NOT NULL,
    hora_inicio    TIME         NULL,
    hora_fim       TIME         NULL,
    local_evento   VARCHAR(120) NULL,
    descricao      TEXT         NULL,
    data_criacao   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_evento PRIMARY KEY (id_evento),
    CONSTRAINT fk_evento_grupo FOREIGN KEY (id_grupo)
        REFERENCES grupo (id_grupo) ON DELETE CASCADE,
    CONSTRAINT fk_evento_disciplina FOREIGN KEY (id_disciplina)
        REFERENCES disciplina (id_disciplina) ON DELETE SET NULL,
    CONSTRAINT fk_evento_criador FOREIGN KEY (id_criador)
        REFERENCES membro (id_membro) ON DELETE SET NULL,
    CONSTRAINT ck_evento_titulo  CHECK (CHAR_LENGTH(titulo) >= 1),
    CONSTRAINT ck_evento_tipo    CHECK (tipo IN ('prova', 'apresentacao', 'palestra', 'reuniao', 'outro')),
    CONSTRAINT ck_evento_horario CHECK (hora_fim IS NULL OR (hora_inicio IS NOT NULL AND hora_fim > hora_inicio))
);

CREATE INDEX ix_evento_data ON evento (id_grupo, data_evento);

-- ---------------------------------------------------------------------
-- progresso_historico: fotografia diária do progresso (RF12)
-- ---------------------------------------------------------------------
CREATE TABLE progresso_historico (
    id_progresso  INT           NOT NULL AUTO_INCREMENT,
    id_disciplina INT           NOT NULL,
    data_registro DATE          NOT NULL,
    percentual    DECIMAL(5,2)  NOT NULL,
    CONSTRAINT pk_progresso PRIMARY KEY (id_progresso),
    CONSTRAINT fk_progresso_disciplina FOREIGN KEY (id_disciplina)
        REFERENCES disciplina (id_disciplina) ON DELETE CASCADE,
    CONSTRAINT uk_progresso_dia UNIQUE (id_disciplina, data_registro),
    CONSTRAINT ck_progresso_percentual CHECK (percentual BETWEEN 0 AND 100)
);

-- ---------------------------------------------------------------------
-- conquista: catálogo de marcos (RF17)
-- ---------------------------------------------------------------------
CREATE TABLE conquista (
    id_conquista   INT          NOT NULL AUTO_INCREMENT,
    codigo         VARCHAR(30)  NOT NULL,
    nome           VARCHAR(60)  NOT NULL,
    descricao      VARCHAR(160) NOT NULL,
    icone          VARCHAR(10)  NULL,
    criterio_tipo  VARCHAR(30)  NOT NULL,
    criterio_valor INT          NOT NULL,
    CONSTRAINT pk_conquista PRIMARY KEY (id_conquista),
    CONSTRAINT uk_conquista_codigo UNIQUE (codigo),
    CONSTRAINT ck_conquista_criterio CHECK (criterio_tipo IN (
        'atividades_concluidas',
        'conteudo_completo',
        'disciplina_completa',
        'ofensiva_dias',
        'experiencia_total'
    ))
);

-- ---------------------------------------------------------------------
-- membro_conquista: tabela associativa do N:N (RN12)
-- A chave primária composta impede a concessão duplicada
-- ---------------------------------------------------------------------
CREATE TABLE membro_conquista (
    id_membro     INT      NOT NULL,
    id_conquista  INT      NOT NULL,
    data_obtencao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_membro_conquista PRIMARY KEY (id_membro, id_conquista),
    CONSTRAINT fk_mc_membro FOREIGN KEY (id_membro)
        REFERENCES membro (id_membro) ON DELETE CASCADE,
    CONSTRAINT fk_mc_conquista FOREIGN KEY (id_conquista)
        REFERENCES conquista (id_conquista) ON DELETE CASCADE
);

-- =====================================================================
-- Carga inicial do catálogo de conquistas
-- =====================================================================
INSERT INTO conquista (codigo, nome, descricao, icone, criterio_tipo, criterio_valor) VALUES
('PRIMEIRO_PASSO',    'Primeiro Passo',    'Conclua a sua primeira atividade',            '🌱', 'atividades_concluidas', 1),
('CONTEUDO_DOMINADO', 'Conteúdo Dominado', 'Leve um conteúdo a 100% de progresso',        '📗', 'conteudo_completo',     1),
('DISCIPLINA_FECHADA','Disciplina Fechada','Leve uma disciplina a 100% de progresso',     '🎓', 'disciplina_completa',   1),
('SEMANA_CHEIA',      'Semana Cheia',      'Conclua atividades por 7 dias seguidos',      '🔥', 'ofensiva_dias',         7),
('MES_CHEIO',         'Mês Cheio',         'Conclua atividades por 30 dias seguidos',     '🏔️', 'ofensiva_dias',        30),
('MEIO_MILHAR',       'Meio Milhar',       'Acumule 500 pontos de experiência',           '⭐', 'experiencia_total',   500);

-- =====================================================================
-- Consultas de referência: as fórmulas das regras de negócio
-- =====================================================================

-- RN08: progresso de cada conteúdo
-- SELECT c.id_conteudo,
--        c.nome,
--        ROUND(SUM(CASE WHEN a.status = 'concluido' THEN a.peso ELSE 0 END)
--              / NULLIF(SUM(a.peso), 0) * 100, 2) AS percentual
-- FROM conteudo c
-- JOIN atividade a ON a.id_conteudo = c.id_conteudo
-- GROUP BY c.id_conteudo, c.nome;

-- RN14: progresso de cada disciplina
-- SELECT d.id_disciplina,
--        d.nome,
--        ROUND(SUM(CASE WHEN a.status = 'concluido' THEN a.peso ELSE 0 END)
--              / NULLIF(SUM(a.peso), 0) * 100, 2) AS percentual
-- (todas as atividades da disciplina, com ou sem conteúdo)
-- FROM disciplina d
-- JOIN atividade a ON a.id_disciplina = d.id_disciplina
-- GROUP BY d.id_disciplina, d.nome;

-- RN10: experiência acumulada por membro
-- SELECT m.id_membro,
--        m.nome,
--        COALESCE(SUM(a.peso * 10), 0) AS experiencia
-- FROM membro m
-- LEFT JOIN atividade a
--        ON a.id_responsavel = m.id_membro
--       AND a.status = 'concluido'
-- GROUP BY m.id_membro, m.nome;

-- RN05: atividades atrasadas
-- SELECT * FROM atividade
-- WHERE prazo < CURRENT_DATE AND status <> 'concluido';

-- RN02: remover um membro: as atividades dele passam para quem assume
-- START TRANSACTION;
-- UPDATE atividade SET id_responsavel = :quem_assume
--  WHERE id_responsavel = :membro_removido;
-- DELETE FROM membro WHERE id_membro = :membro_removido;
-- COMMIT;

-- RN02: excluir um grupo. Primeiro as disciplinas, que levam em cascata
-- os conteúdos e as atividades; depois o grupo, que leva os membros, os
-- eventos e as conquistas dos membros. Nessa ordem, a restrição do responsável não barra a
-- exclusão.
-- START TRANSACTION;
-- DELETE FROM disciplina WHERE id_grupo = :grupo;
-- DELETE FROM grupo WHERE id_grupo = :grupo;
-- COMMIT;
