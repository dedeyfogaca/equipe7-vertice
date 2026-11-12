# Dicionário de Dados

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Entrega 2 · Modelagem do Banco de Dados · Equipe 7 · atualizado em 12/11/2026

---

Descrição campo a campo das treze tabelas definidas no [modelo lógico](02-modelo-logico.md), no PostgreSQL do Supabase. Os identificadores são UUID: um código de 128 bits gerado sem consultar o banco, o que deixa a tela mostrar o cadastro na hora. A coluna "Obrig." indica se o preenchimento é obrigatório.

---

## grupo

Guarda cada grupo de estudo cadastrado e o espaço pessoal de cada conta. É a raiz de toda a estrutura: membros, disciplinas, conteúdos, atividades e eventos pertencem sempre a um grupo.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_grupo | UUID | | Sim | PK | Identificador único do grupo |
| nome | VARCHAR | 80 | Sim | | Nome do grupo de estudo exibido no seletor de espaço. No espaço pessoal, a tela mostra "Pessoal" |
| descricao | VARCHAR | 255 | Não | | Texto livre com a finalidade do grupo |
| foto | TEXT | | Não | | Endereço da foto do grupo no armazenamento de arquivos. A pessoa enquadra a foto no editor, e a área enquadrada é reduzida para 256 × 256 antes do envio. Vazia, o grupo aparece com as iniciais do nome (RF29, RN19) |
| pessoal | BOOLEAN | | Sim | | Verdadeiro no espaço pessoal de uma conta: um grupo de uma pessoa só, criado pelo sistema no primeiro acesso, sem convite e sem outros membros, que não pode ser excluído. Padrão: falso (RF34, RN24) |
| data_criacao | TIMESTAMPTZ | | Sim | | Data e hora em que o grupo foi criado |

---

## perfil

Guarda o nome, o avatar e a foto de cada conta, que valem em todos os grupos de que ela participa, e a escolha do lembrete por e-mail. Uma linha por conta, criada pelo sistema no primeiro acesso (RF35, RF36, RN26).

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_usuario | UUID | | Sim | PK, FK | Conta dona do perfil, no serviço de autenticação do Supabase (`auth.users`) |
| nome | VARCHAR | 80 | Sim | | Nome da pessoa, levado aos membros dela em todos os grupos |
| avatar | VARCHAR | 60 | Não | | Semente do avatar (RN15) |
| estilo_avatar | VARCHAR | 20 | Sim | | `croodles-neutral` (Rabisco, o padrão) ou `notionists` (Ilustrado) |
| foto | TEXT | | Não | | Endereço da foto no armazenamento de arquivos, na pasta do espaço pessoal. Quando existe, aparece no lugar do avatar em todos os grupos (RN19) |
| lembrete_email | BOOLEAN | | Sim | | Se a pessoa recebe o lembrete diário por e-mail. Padrão: verdadeiro (RF36, RN25) |
| id_grupo_pessoal | UUID | | Não | FK | Espaço pessoal da conta. Referencia `grupo.id_grupo`; um espaço por perfil |
| ultimo_lembrete | DATE | | Não | | Dia em que o último lembrete foi enviado, para não repetir no mesmo dia. Gravado só pelo envio |
| data_criacao | TIMESTAMPTZ | | Sim | | Data e hora em que o perfil foi criado |

---

## membro

Guarda os integrantes de um grupo. O perfil determina o que o integrante pode fazer sobre a estrutura do grupo.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_membro | UUID | | Sim | PK | Identificador único do membro |
| id_grupo | UUID | | Sim | FK | Grupo ao qual o membro pertence. Referencia `grupo.id_grupo` |
| id_usuario | UUID | | Não | FK | Conta de acesso ligada ao membro, no serviço de autenticação do Supabase (`auth.users`). Vazia enquanto a pessoa foi só cadastrada pelo organizador e ainda não entrou com a própria conta. A mesma conta aparece no máximo uma vez em cada grupo (RF27, RN22) |
| nome | VARCHAR | 80 | Sim | | Nome do integrante. Com conta, é o nome do perfil (RN26) |
| funcao | VARCHAR | 60 | Não | | Papel do integrante no grupo, ex.: "Revisão e slides" |
| email | VARCHAR | 120 | Não | | Endereço de e-mail para contato |
| avatar | VARCHAR | 60 | Não | | Semente usada para desenhar o avatar. A imagem não é armazenada; o que se guarda é a semente que, com o estilo, a reproduz (RF19, RN15) |
| estilo_avatar | VARCHAR | 20 | Sim | | Estilo de desenho do avatar, entre dois: `croodles-neutral` (Rabisco, o padrão) e `notionists` (Ilustrado) (RF19) |
| foto | TEXT | | Não | | Endereço da foto de perfil enviada pelo membro, no armazenamento de arquivos. A pessoa enquadra a foto no editor, e a área enquadrada é reduzida para 256 × 256 antes do envio. Quando existe, aparece no lugar do avatar; vazia, vale o avatar. Com conta, é a foto do perfil (RF24, RN15, RN19, RN26) |
| perfil | VARCHAR | 15 | Sim | | Perfil de permissão: `organizador` ou `participante`. Padrão: `participante` |
| data_criacao | TIMESTAMPTZ | | Sim | | Data e hora do cadastro do membro |

---

## disciplina

Guarda as disciplinas acompanhadas pelo grupo. É o nível mais alto de agrupamento do conteúdo de estudo e a unidade da barra de progresso principal.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_disciplina | UUID | | Sim | PK | Identificador único da disciplina |
| id_grupo | UUID | | Sim | FK | Grupo dono da disciplina. Referencia `grupo.id_grupo` |
| nome | VARCHAR | 80 | Sim | | Nome da disciplina. Não pode se repetir dentro do mesmo grupo, nem com outras maiúsculas |
| cor | CHAR | 7 | Sim | | Cor de identificação, uma das 18 cores da paleta do sistema, em hexadecimal. Padrão: `#3b82f6` (RF25, RN18) |
| data_criacao | TIMESTAMPTZ | | Sim | | Data e hora do cadastro da disciplina |

---

## conteudo

Guarda as divisões internas de uma disciplina, para o grupo que quer acompanhar o progresso por assunto. É opcional: a disciplina pode ter atividades sem nenhum conteúdo cadastrado (RN13).

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_conteudo | UUID | | Sim | PK | Identificador único do conteúdo |
| id_disciplina | UUID | | Sim | FK | Disciplina à qual o conteúdo pertence. Referencia `disciplina.id_disciplina` |
| nome | VARCHAR | 80 | Sim | | Nome do conteúdo, ex.: "Normalização". Não pode se repetir na mesma disciplina |
| descricao | VARCHAR | 255 | Não | | Detalhamento do que o conteúdo abrange |
| ordem | INTEGER | | Sim | | Posição do conteúdo na sequência de estudo da disciplina, contada do zero. Padrão: 0 |
| data_criacao | TIMESTAMPTZ | | Sim | | Data e hora do cadastro do conteúdo |

---

## atividade

Guarda cada atividade de estudo e cada tarefa do espaço pessoal. É a tabela que alimenta todos os cálculos do sistema: progresso, experiência, ofensiva e conquistas.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_atividade | UUID | | Sim | PK | Identificador único da atividade |
| id_grupo | UUID | | Sim | FK | Grupo da atividade, ou o espaço pessoal. Referencia `grupo.id_grupo`. Não muda depois de criada; excluído o grupo, a atividade sai junto (RN02, RF34) |
| id_disciplina | UUID | | Não | FK | Disciplina da atividade, do mesmo grupo. Referencia `disciplina.id_disciplina`. Obrigatória nos grupos e opcional no espaço pessoal. Excluída a disciplina, a atividade sai junto (RN02, RN13, RN24) |
| id_conteudo | UUID | | Não | FK | Conteúdo da disciplina em que a atividade está, quando o grupo usa conteúdos. Referencia `conteudo.id_conteudo` e precisa ser da mesma disciplina. Excluído o conteúdo, fica vazio, e a atividade continua na disciplina (RN02, RN13) |
| id_responsavel | UUID | | Não | FK | Membro responsável pela execução, que recebe a experiência na conclusão. Referencia `membro.id_membro`. Vazio, a atividade fica "A definir" e em `a fazer` até alguém assumir; no espaço pessoal, é sempre o dono. Antes de um membro ser excluído, as atividades dele passam para outro membro do grupo (RN02, RN06, RN24) |
| titulo | VARCHAR | 120 | Sim | | Título da atividade. Mínimo de 3 caracteres |
| descricao | TEXT | | Não | | Detalhamento do que precisa ser feito |
| prazo | DATE | | Sim | | Data limite para a conclusão |
| peso | SMALLINT | | Sim | | Esforço relativo da atividade, de 1 a 5. Base do cálculo de progresso e de experiência. Padrão: 1 |
| prioridade | VARCHAR | 10 | Não | | Urgência informada pelo usuário: `baixa`, `media` ou `alta` |
| status | VARCHAR | 12 | Sim | | Situação atual: `a fazer`, `fazendo` ou `concluido`. Padrão: `a fazer`. Só o responsável altera, e a atividade "A definir" fica em `a fazer` (RN06, RN20) |
| data_criacao | TIMESTAMPTZ | | Sim | | Data e hora do cadastro da atividade |
| data_conclusao | TIMESTAMPTZ | | Não | | Data e hora em que a atividade passou para `concluido`. Base do cálculo da ofensiva. Preenchida exatamente quando o status é `concluido`, e fica vazia se a conclusão for revertida |

---

## evento

Guarda o que vai acontecer num dia, ou num período de vários dias, para o grupo ou só para a pessoa, no espaço pessoal: uma prova, uma apresentação, uma palestra, uma reunião, uma semana acadêmica. Não tem responsável, peso nem status, e não entra no progresso (RF31, RN21).

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_evento | UUID | | Sim | PK | Identificador único do evento |
| id_grupo | UUID | | Sim | FK | Grupo do evento. Referencia `grupo.id_grupo`. Excluído o grupo, o evento sai junto (RN02) |
| id_disciplina | UUID | | Não | FK | Disciplina do evento, quando houver (a prova de uma matéria, por exemplo). Referencia `disciplina.id_disciplina`. Excluída a disciplina, fica vazio (RN02) |
| id_criador | UUID | | Não | FK | Membro que cadastrou o evento; ele e o organizador podem editar e excluir (RN21). Referencia `membro.id_membro`. Com conta, é preenchido pelo banco com o membro de quem está conectado. Fica vazio quando o membro sai do grupo |
| titulo | VARCHAR | 120 | Sim | | Nome do evento, ex.: "Prova de Banco de Dados" |
| tipo | VARCHAR | 12 | Sim | | `prova`, `apresentacao`, `palestra`, `reuniao` ou `outro` |
| data_evento | DATE | | Sim | | Dia do evento, ou o primeiro dia do período |
| data_fim | DATE | | Não | | Último dia do evento de vários dias; não pode ser antes de `data_evento`. Vazio, o evento é de um dia. O evento passa para a lista de passados no dia seguinte ao último dia (RF31, RN21) |
| hora_inicio | TIME | | Não | | Hora de início. Sem ela, o evento vale o dia todo |
| hora_fim | TIME | | Não | | Hora de término. Só existe com a hora de início; no evento de um dia, precisa ser depois dela, e no de vários dias, é a hora de término do último dia (RN21) |
| local_evento | VARCHAR | 120 | Não | | Onde acontece, ex.: "Sala 204" ou "Google Meet" |
| descricao | TEXT | | Não | | Observações, ex.: o que cai na prova |
| data_criacao | TIMESTAMPTZ | | Sim | | Data e hora do cadastro do evento |

---

## progresso_historico

Guarda uma fotografia diária do percentual de progresso de cada disciplina. Existe porque a evolução ao longo do tempo não pode ser reconstruída a partir do estado atual das atividades.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_progresso | UUID | | Sim | PK | Identificador único do registro |
| id_disciplina | UUID | | Sim | FK | Disciplina medida. Referencia `disciplina.id_disciplina` |
| data_registro | DATE | | Sim | | Dia a que o percentual se refere, no horário de Brasília. Há no máximo um registro por disciplina por dia |
| percentual | NUMERIC | 5,2 | Sim | | Percentual de progresso da disciplina no fim daquele dia, de 0,00 a 100,00. Gravado pelo próprio banco a cada mudança nas atividades da disciplina (RN23) |

---

## conquista

Catálogo dos marcos que o sistema reconhece. Não pertence a nenhum grupo: descreve a conquista e a condição que a desbloqueia.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| codigo | VARCHAR | 30 | Sim | PK | Identificador da conquista usado pelo sistema, ex.: `SEMANA_CHEIA` |
| nome | VARCHAR | 60 | Sim | | Nome exibido ao usuário, ex.: "Semana Cheia" |
| descricao | VARCHAR | 160 | Sim | | Explicação do marco, exibida também quando a conquista ainda está bloqueada |
| icone | VARCHAR | 10 | Não | | Símbolo exibido na medalha |
| criterio_tipo | VARCHAR | 30 | Sim | | Grandeza avaliada: `atividades_concluidas`, `conteudo_completo`, `disciplina_completa`, `ofensiva_dias` ou `experiencia_total` |
| criterio_valor | INTEGER | | Sim | | Valor que precisa ser alcançado na grandeza do critério, ex.: 7 para ofensiva de sete dias |

---

## membro_conquista

Tabela associativa que resolve o relacionamento muitos-para-muitos entre membro e conquista, guardando quando cada conquista foi obtida.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_membro | UUID | | Sim | PK, FK | Membro que obteve a conquista. Referencia `membro.id_membro` |
| codigo_conquista | VARCHAR | 30 | Sim | PK, FK | Conquista obtida. Referencia `conquista.codigo` |
| data_obtencao | TIMESTAMPTZ | | Sim | | Data e hora em que o marco foi atingido. Se a conclusão que sustentava a conquista for desfeita, a linha é excluída (RN12) |

---

## convite

Guarda os convites gerados pelo organizador para chamar a turma ao grupo (RF28, RN22).

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_convite | UUID | | Sim | PK | Identificador único do convite |
| id_grupo | UUID | | Sim | FK | Grupo para o qual o convite leva. Referencia `grupo.id_grupo`. Excluído o grupo, o convite sai junto |
| codigo | CHAR | 8 | Sim | | Código do convite, também usado no link `/convite/CODIGO`. Letras maiúsculas e números, sem I, O, 0 e 1. Único |
| id_criador | UUID | | Não | FK | Organizador que gerou o convite. Referencia `membro.id_membro` |
| data_criacao | TIMESTAMPTZ | | Sim | | Data e hora em que o convite foi gerado |
| expira_em | TIMESTAMPTZ | | Sim | | Fim da validade. Padrão: 7 dias depois da criação |
| ativo | BOOLEAN | | Sim | | Se o convite ainda pode ser usado. Padrão: verdadeiro |

---

## equipe

Guarda as contas de quem faz o Vértice, as únicas que leem as respostas de feedback (RF32, RN27). A equipe cadastra as próprias contas direto no banco.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_usuario | UUID | | Sim | PK, FK | Conta de um integrante da equipe, no serviço de autenticação do Supabase (`auth.users`) |
| data_criacao | TIMESTAMPTZ | | Sim | | Data e hora em que a conta entrou na equipe |

---

## feedback

Guarda as respostas de feedback dos usuários de teste, sem identificar quem respondeu (RF32, RN27).

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_feedback | UUID | | Sim | PK | Identificador único da resposta, gerado pelo banco |
| nota | SMALLINT | | Sim | | De 1 (Muito ruim) a 5 (Ótimo) |
| funcionou | VARCHAR | 1000 | Não | | Resposta a "O que funcionou bem?" |
| travou | VARCHAR | 1000 | Não | | Resposta a "O que travou ou confundiu?" |
| faltou | VARCHAR | 1000 | Não | | Resposta a "O que faltou?" |
| contato | VARCHAR | 120 | Não | | E-mail ou @ deixado por quem quer retorno |
| origem | VARCHAR | 12 | Sim | | De onde veio: `visitante`, `demonstracao` ou `conta`. Padrão: `visitante` |
| lida | BOOLEAN | | Sim | | Se a equipe já leu. Padrão: falso; é o único campo que muda depois do envio |
| data_envio | TIMESTAMPTZ | | Sim | | Data e hora do envio, gravadas pelo banco |

---

## Carga inicial da tabela conquista

| codigo | nome | descricao | icone | criterio_tipo | criterio_valor |
|---|---|---|---|---|---|
| `PRIMEIRO_PASSO` | Primeiro Passo | Conclua a sua primeira atividade | 🌱 | atividades_concluidas | 1 |
| `CONTEUDO_DOMINADO` | Conteúdo Dominado | Leve um conteúdo a 100% de progresso | 📗 | conteudo_completo | 1 |
| `DISCIPLINA_FECHADA` | Disciplina Fechada | Leve uma disciplina a 100% de progresso | 🎓 | disciplina_completa | 1 |
| `SEMANA_CHEIA` | Semana Cheia | Conclua atividades por 7 dias seguidos | 🔥 | ofensiva_dias | 7 |
| `MES_CHEIO` | Mês Cheio | Conclua atividades por 30 dias seguidos | 🏔️ | ofensiva_dias | 30 |
| `MEIO_MILHAR` | Meio Milhar | Acumule 500 pontos de experiência | ⭐ | experiencia_total | 500 |

---

### Navegação

[⬅ Anterior: Modelo Lógico](02-modelo-logico.md) · [Índice](../README.md) · [Próximo: Script de Criação ➡](04-script-criacao.sql)
