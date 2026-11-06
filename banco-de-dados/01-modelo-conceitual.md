# Modelo Conceitual do Banco de Dados

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Entrega 2 · Modelagem do Banco de Dados · Equipe 7 · atualizado em 06/11/2026

---

O modelo conceitual identifica **o que** o sistema precisa guardar, sem decidir ainda como isso será implementado. As entidades foram extraídas dos substantivos que aparecem nos requisitos: grupo (RF01), membro (RF02), disciplina (RF13), conteúdo (RF14), atividade (RF03), evento (RF31), histórico de progresso (RF12) e conquista (RF17).

---

## Diagrama entidade-relacionamento

```mermaid
%%{init: {"theme": "base", "fontFamily": "Space Grotesk", "themeVariables": {"fontFamily": "Space Grotesk, Segoe UI, sans-serif", "fontSize": "14px", "primaryColor": "#E0F7FC", "primaryTextColor": "#0B1220", "primaryBorderColor": "#0891B2", "lineColor": "#5B6678", "attributeBackgroundColorOdd": "#FFFFFF", "attributeBackgroundColorEven": "#F5F7FC", "nodeBorder": "#0891B2", "mainBkg": "#E0F7FC", "textColor": "#0B1220", "titleColor": "#0E7490"}, "er": {"diagramPadding": 24, "entityPadding": 16, "minEntityWidth": 150}}}%%
erDiagram
    GRUPO ||--o{ MEMBRO : "possui"
    GRUPO ||--o{ DISCIPLINA : "organiza"
    DISCIPLINA ||--o{ CONTEUDO : "divide-se em"
    DISCIPLINA ||--o{ ATIVIDADE : "reune"
    CONTEUDO |o--o{ ATIVIDADE : "agrupa"
    MEMBRO ||--o{ ATIVIDADE : "e responsavel por"
    GRUPO ||--o{ EVENTO : "agenda"
    DISCIPLINA |o--o{ EVENTO : "e assunto de"
    MEMBRO |o--o{ EVENTO : "cadastra"
    DISCIPLINA ||--o{ PROGRESSO_HISTORICO : "registra"
    MEMBRO ||--o{ MEMBRO_CONQUISTA : "obtem"
    CONQUISTA ||--o{ MEMBRO_CONQUISTA : "e obtida em"

```

> Versão em imagem para inserir no documento: [`modelo-conceitual.png`](modelo-conceitual.png)

---

## Entidades e atributos

| Entidade | Atributos | Origem |
|---|---|---|
| **GRUPO** | identificador, nome, descrição, foto do grupo, data de criação | RF01, RF29 |
| **MEMBRO** | identificador, nome, função, e-mail, avatar e estilo do avatar, foto de perfil, perfil | RF02, RF19, RF24 |
| **DISCIPLINA** | identificador, nome, cor de identificação, data de criação | RF13 |
| **CONTEUDO** | identificador, nome, descrição, ordem de apresentação | RF14 |
| **ATIVIDADE** | identificador, título, descrição, prazo, peso, prioridade, status, data de criação, data de conclusão | RF03, RN09 |
| **EVENTO** | identificador, título, tipo, data, hora de início, hora de fim, local, descrição, data de criação | RF31, RN21 |
| **PROGRESSO_HISTORICO** | identificador, data do registro, percentual | RF12 |
| **CONQUISTA** | identificador, código, nome, descrição, ícone, tipo de critério, valor do critério | RF17 |
| **MEMBRO_CONQUISTA** | data de obtenção | RN12 |

---

## Relacionamentos e cardinalidades

| Relacionamento | Cardinalidade | Leitura |
|---|---|---|
| GRUPO **possui** MEMBRO | 1 : N | Um grupo possui zero ou muitos membros; cada membro pertence a exatamente um grupo |
| GRUPO **organiza** DISCIPLINA | 1 : N | Um grupo organiza zero ou muitas disciplinas; cada disciplina pertence a exatamente um grupo |
| DISCIPLINA **divide-se em** CONTEUDO | 1 : N | Uma disciplina divide-se em zero ou muitos conteúdos; cada conteúdo pertence a exatamente uma disciplina |
| DISCIPLINA **reúne** ATIVIDADE | 1 : N | Uma disciplina reúne zero ou muitas atividades; cada atividade pertence a exatamente uma disciplina (RN13) |
| CONTEUDO **agrupa** ATIVIDADE | 1 : N, opcional | Um conteúdo agrupa zero ou muitas atividades; cada atividade pertence a nenhum ou a um conteúdo, que precisa ser da mesma disciplina dela (RN13) |
| MEMBRO **é responsável por** ATIVIDADE | 1 : N | Um membro é responsável por zero ou muitas atividades; cada atividade tem exatamente um responsável (RN06) |
| DISCIPLINA **registra** PROGRESSO_HISTORICO | 1 : N | Uma disciplina acumula zero ou muitos registros de progresso; cada registro pertence a uma única disciplina |
| GRUPO **agenda** EVENTO | 1 : N | Um grupo agenda zero ou muitos eventos; cada evento pertence a exatamente um grupo |
| DISCIPLINA **é assunto de** EVENTO | 1 : N, opcional | Um evento pode ser de uma disciplina (uma prova, por exemplo) ou de nenhuma (uma reunião); se a disciplina sai, o evento fica sem disciplina (RN02) |
| MEMBRO **cadastra** EVENTO | 1 : N, opcional | Cada evento guarda quem o cadastrou, para a regra de edição (RN21); eventos do exemplo e de membros removidos ficam sem autor |
| MEMBRO **obtém** CONQUISTA | N : N | Um membro obtém várias conquistas e uma conquista é obtida por vários membros |

---

## Decisões do modelo

**Por que disciplina e conteúdo são entidades, e não campos da atividade.** Na versão anterior do sistema, "disciplina" era um texto digitado dentro da atividade. Com isso, "Banco de Dados" e "banco de dados" viravam duas disciplinas diferentes e não havia onde ancorar o progresso. Os requisitos RF10 e RF11 exigem um percentual por conteúdo e por disciplina, o que só é possível se ambos existirem como registros próprios com atividades vinculadas.

**Por que a atividade guarda a disciplina, e o conteúdo é opcional.** Até a revisão de 03/11, a atividade chegava à disciplina pelo conteúdo, e por isso todo grupo precisava criar ao menos um conteúdo antes da primeira atividade. Com o conteúdo opcional, a atividade passou a apontar direto para a disciplina; quando tem conteúdo, ele precisa ser da mesma disciplina (RN13), o que a aplicação valida e o banco reforça.

**Por que a atividade não guarda o grupo.** O grupo de uma atividade é alcançado pelo caminho ATIVIDADE → DISCIPLINA → GRUPO. Guardar o identificador do grupo diretamente na atividade criaria um caminho alternativo que poderia divergir do primeiro (uma atividade poderia apontar para o grupo A e, pela disciplina, para o grupo B).

**Por que o evento é separado da atividade.** A atividade é trabalho de alguém: tem responsável, peso, status e entra no progresso. O evento é algo que acontece num dia (uma prova, uma palestra) e não é concluído por ninguém. Juntar os dois obrigaria o evento a ter responsável e peso, e faria uma prova contar no progresso como se fosse tarefa.

**Por que existe MEMBRO_CONQUISTA.** O relacionamento entre membro e conquista é muitos-para-muitos e carrega um dado próprio: a data em que a conquista foi obtida. Esse dado não pertence nem ao membro nem à conquista, e sim ao encontro dos dois, o que exige a entidade associativa.

**Por que o progresso histórico é uma entidade.** O percentual atual de uma disciplina pode ser calculado a qualquer momento a partir das atividades. Já a evolução ao longo do tempo (RF12) não pode: não há como saber, olhando o estado de hoje, qual era o percentual há duas semanas. Por isso o valor diário precisa ser gravado.

**O que não virou entidade.** Experiência, ofensiva e percentual de progresso atual são valores derivados das atividades concluídas e das suas datas, calculados no momento da consulta. Não receberam entidade nem campo próprio para evitar uma segunda fonte de verdade, que precisaria ser corrigida a cada estorno previsto na RN10.

---

### Navegação

[⬅ Diagramas](../diagramas/04-atividade-cadastrar.md) · [Índice](../README.md) · [Próximo: Modelo Lógico ➡](02-modelo-logico.md)
