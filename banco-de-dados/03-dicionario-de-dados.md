# Dicionário de Dados

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Entrega 2 · Modelagem do Banco de Dados · Equipe 7 · atualizado em 06/11/2026

---

Descrição campo a campo das nove tabelas definidas no [modelo lógico](02-modelo-logico.md). A coluna "Obrig." indica se o preenchimento é obrigatório.

---

## grupo

Guarda cada grupo de estudo cadastrado. É a raiz de toda a estrutura: membros, disciplinas, conteúdos e atividades pertencem sempre a um grupo.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_grupo | INT | | Sim | PK | Identificador único do grupo |
| nome | VARCHAR | 80 | Sim | | Nome do grupo de estudo exibido na tela de acesso |
| descricao | VARCHAR | 255 | Não | | Texto livre com a finalidade do grupo |
| foto | VARCHAR | 255 | Não | | Endereço da foto do grupo no armazenamento de arquivos. A pessoa enquadra a foto no editor, e a área enquadrada é reduzida para 256 × 256 antes do envio. Vazia, o grupo aparece com as iniciais do nome (RF29, RN19) |
| data_criacao | DATETIME | | Sim | | Data e hora em que o grupo foi criado |

---

## membro

Guarda os integrantes de um grupo. O perfil determina o que o integrante pode fazer sobre a estrutura do grupo.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_membro | INT | | Sim | PK | Identificador único do membro |
| id_grupo | INT | | Sim | FK | Grupo ao qual o membro pertence. Referencia `grupo.id_grupo` |
| nome | VARCHAR | 80 | Sim | | Nome do integrante |
| funcao | VARCHAR | 60 | Não | | Papel do integrante no grupo, ex.: "Revisão e slides" |
| email | VARCHAR | 120 | Não | | Endereço de e-mail para contato |
| avatar | VARCHAR | 60 | Não | | Semente usada para desenhar o avatar. A imagem não é armazenada; o que se guarda é a semente que, com o estilo, a reproduz (RF19, RN15) |
| estilo_avatar | VARCHAR | 20 | Sim | | Estilo de desenho do avatar, entre cinco: `croodles-neutral` (Rabisco, o padrão), `adventurer` (Aventura), `big-smile` (Sorriso), `fun-emoji` (Emoji) e `pixel-art` (Pixel) (RF19) |
| foto | VARCHAR | 255 | Não | | Endereço da foto de perfil enviada pelo membro, no armazenamento de arquivos. A pessoa enquadra a foto no editor, e a área enquadrada é reduzida para 256 × 256 antes do envio. Quando existe, aparece no lugar do avatar; vazia, vale o avatar (RF24, RN15, RN19) |
| perfil | VARCHAR | 15 | Sim | | Perfil de permissão: `organizador` ou `participante` |

---

## disciplina

Guarda as disciplinas acompanhadas pelo grupo. É o nível mais alto de agrupamento do conteúdo de estudo e a unidade da barra de progresso principal.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_disciplina | INT | | Sim | PK | Identificador único da disciplina |
| id_grupo | INT | | Sim | FK | Grupo dono da disciplina. Referencia `grupo.id_grupo` |
| nome | VARCHAR | 80 | Sim | | Nome da disciplina. Não pode se repetir dentro do mesmo grupo |
| cor | CHAR | 7 | Sim | | Cor de identificação, uma das 18 cores da paleta do sistema, em hexadecimal. Padrão: `#3b82f6` (RF25, RN18) |
| data_criacao | DATETIME | | Sim | | Data e hora do cadastro da disciplina |

---

## conteudo

Guarda as divisões internas de uma disciplina, para o grupo que quer acompanhar o progresso por assunto. É opcional: a disciplina pode ter atividades sem nenhum conteúdo cadastrado (RN13).

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_conteudo | INT | | Sim | PK | Identificador único do conteúdo |
| id_disciplina | INT | | Sim | FK | Disciplina à qual o conteúdo pertence. Referencia `disciplina.id_disciplina` |
| nome | VARCHAR | 80 | Sim | | Nome do conteúdo, ex.: "Normalização". Não pode se repetir na mesma disciplina |
| descricao | VARCHAR | 255 | Não | | Detalhamento do que o conteúdo abrange |
| ordem | INT | | Sim | | Posição do conteúdo na sequência de estudo da disciplina. Padrão: 1 |

---

## atividade

Guarda cada atividade de estudo. É a tabela que alimenta todos os cálculos do sistema: progresso, experiência, ofensiva e conquistas.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_atividade | INT | | Sim | PK | Identificador único da atividade |
| id_disciplina | INT | | Sim | FK | Disciplina da atividade. Referencia `disciplina.id_disciplina`. Excluída a disciplina, a atividade sai junto (RN02, RN13) |
| id_conteudo | INT | | Não | FK | Conteúdo da disciplina em que a atividade está, quando o grupo usa conteúdos. Referencia `conteudo.id_conteudo` e precisa ser da mesma disciplina. Excluído o conteúdo, fica vazio, e a atividade continua na disciplina (RN02, RN13) |
| id_responsavel | INT | | Sim | FK | Membro responsável pela execução, que recebe a experiência na conclusão. Referencia `membro.id_membro`. Antes de um membro ser excluído, as atividades dele passam para outro membro do grupo (RN02, RN06) |
| titulo | VARCHAR | 120 | Sim | | Título da atividade. Mínimo de 3 caracteres |
| descricao | TEXT | | Não | | Detalhamento do que precisa ser feito |
| prazo | DATE | | Sim | | Data limite para a conclusão |
| peso | INT | | Sim | | Esforço relativo da atividade, de 1 a 5. Base do cálculo de progresso e de experiência. Padrão: 1 |
| prioridade | VARCHAR | 10 | Não | | Urgência informada pelo usuário: `baixa`, `media` ou `alta` |
| status | VARCHAR | 12 | Sim | | Situação atual: `a fazer`, `fazendo` ou `concluido`. Padrão: `a fazer`. Só o responsável altera (RN20) |
| data_criacao | DATETIME | | Sim | | Data e hora do cadastro da atividade |
| data_conclusao | DATE | | Não | | Data em que a atividade passou para `concluido`. Base do cálculo da ofensiva. Fica vazia se a conclusão for revertida |

---

## evento

Guarda o que vai acontecer num dia para o grupo: uma prova, uma apresentação, uma palestra, uma reunião. Não tem responsável, peso nem status, e não entra no progresso (RF31, RN21).

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_evento | INT | | Sim | PK | Identificador único do evento |
| id_grupo | INT | | Sim | FK | Grupo do evento. Referencia `grupo.id_grupo`. Excluído o grupo, o evento sai junto (RN02) |
| id_disciplina | INT | | Não | FK | Disciplina do evento, quando houver (a prova de uma matéria, por exemplo). Referencia `disciplina.id_disciplina`. Excluída a disciplina, fica vazio (RN02) |
| id_criador | INT | | Não | FK | Membro que cadastrou o evento; ele e o organizador podem editar e excluir (RN21). Referencia `membro.id_membro`. Fica vazio nos eventos do exemplo e quando o membro sai do grupo |
| titulo | VARCHAR | 120 | Sim | | Nome do evento, ex.: "Prova de Banco de Dados" |
| tipo | VARCHAR | 12 | Sim | | `prova`, `apresentacao`, `palestra`, `reuniao` ou `outro` |
| data_evento | DATE | | Sim | | Dia do evento. Passa para a lista de passados no dia seguinte |
| hora_inicio | TIME | | Não | | Hora de início. Sem ela, o evento vale o dia todo |
| hora_fim | TIME | | Não | | Hora de término. Só existe com a hora de início e precisa ser depois dela (RN21) |
| local_evento | VARCHAR | 120 | Não | | Onde acontece, ex.: "Sala 204" ou "Google Meet" |
| descricao | TEXT | | Não | | Observações, ex.: o que cai na prova |
| data_criacao | DATETIME | | Sim | | Data e hora do cadastro do evento |

---

## progresso_historico

Guarda uma fotografia diária do percentual de progresso de cada disciplina. Existe porque a evolução ao longo do tempo não pode ser reconstruída a partir do estado atual das atividades.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_progresso | INT | | Sim | PK | Identificador único do registro |
| id_disciplina | INT | | Sim | FK | Disciplina medida. Referencia `disciplina.id_disciplina` |
| data_registro | DATE | | Sim | | Dia a que o percentual se refere. Há no máximo um registro por disciplina por dia |
| percentual | DECIMAL | 5,2 | Sim | | Percentual de progresso da disciplina naquele dia, de 0,00 a 100,00 |

---

## conquista

Catálogo dos marcos que o sistema reconhece. Não pertence a nenhum grupo: descreve a conquista e a condição que a desbloqueia.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_conquista | INT | | Sim | PK | Identificador único da conquista |
| codigo | VARCHAR | 30 | Sim | | Identificador textual usado pelo sistema, ex.: `SEMANA_CHEIA`. Único |
| nome | VARCHAR | 60 | Sim | | Nome exibido ao usuário, ex.: "Semana Cheia" |
| descricao | VARCHAR | 160 | Sim | | Explicação do marco, exibida também quando a conquista ainda está bloqueada |
| icone | VARCHAR | 10 | Não | | Símbolo exibido na medalha |
| criterio_tipo | VARCHAR | 30 | Sim | | Grandeza avaliada: `atividades_concluidas`, `conteudo_completo`, `disciplina_completa`, `ofensiva_dias` ou `experiencia_total` |
| criterio_valor | INT | | Sim | | Valor que precisa ser alcançado na grandeza do critério, ex.: 7 para ofensiva de sete dias |

---

## membro_conquista

Tabela associativa que resolve o relacionamento muitos-para-muitos entre membro e conquista, guardando quando cada conquista foi obtida.

| Campo | Tipo | Tam. | Obrig. | Chave | Descrição |
|---|---|---|---|---|---|
| id_membro | INT | | Sim | PK, FK | Membro que obteve a conquista. Referencia `membro.id_membro` |
| id_conquista | INT | | Sim | PK, FK | Conquista obtida. Referencia `conquista.id_conquista` |
| data_obtencao | DATETIME | | Sim | | Data e hora em que o marco foi atingido |

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
