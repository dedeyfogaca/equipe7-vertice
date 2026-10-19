# 09 · Histórico de Alterações

> **Vértice** — Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · atualizado em 19/10/2026

---

Registro das mudanças aplicadas ao Documento de Visão e Requisitos ao longo do bimestre: da Entrega 1 (14/08/2026) para a Entrega 2 (08/09/2026), a revisão de 17/09/2026 feita a partir da conferência com o código, os acréscimos da Entrega 3 (25/09/2026) e a revisão do início do 2º bimestre (19/10/2026). A numeração dos requisitos existentes foi preservada; os itens novos foram acrescentados ao final de cada tabela.

---

## Composição da equipe

| Data | Item | Alteração | Motivo |
|---|---|---|---|
| 27/08/2026 | Doc. 01 e 05 | Equipe reduzida de três para dois integrantes: Andrey Fogaça e Matheus Saraiva Faustin | Brayan Gabriel Biscaia trancou o curso e deixou o projeto |

---

## Escopo

| Data | Item | Alteração | Motivo |
|---|---|---|---|
| 27/08/2026 | Doc. 05 — Escopo | "Sistema de conquistas e gamificação" saiu de *Não incluído* e passou a integrar o escopo da primeira versão | Orientação da professora, que solicitou barra de progresso das atividades e métricas de conquistas |
| 27/08/2026 | Doc. 05 — Escopo | Incluídos o cadastro de disciplinas e o cadastro de conteúdos como funcionalidades próprias | Progresso por conteúdo e por disciplina (RF10 e RF11) exige que ambos existam como cadastros, e não como texto livre dentro da atividade |
| 27/08/2026 | Doc. 05 — Escopo | Incluído "Ranking competitivo entre grupos ou entre instituições" em *Não incluído* | Delimitar a gamificação ao acompanhamento individual, evitando ampliação do escopo |
| 27/08/2026 | Doc. 05 — Restrições | Restrição de persistência passou a citar que a estrutura no navegador segue o modelo lógico do banco de dados | Manter coerência entre a Entrega 2 (modelagem de dados) e a implementação prevista |

---

## Requisitos funcionais

| Data | Item | Alteração | Motivo |
|---|---|---|---|
| 27/08/2026 | RF02 | Acrescentado o campo "perfil" ao cadastro de membros | O perfil do usuário era descrito no Doc. 04, mas não tinha origem em nenhum requisito nem lugar no modelo de dados |
| 27/08/2026 | RF03 | Campo "disciplina" removido e campo "peso" acrescentado; o vínculo passa a ser feito pelo conteúdo | A disciplina passa a ser alcançada pelo conteúdo (RN13), evitando informação duplicada; o peso é exigido pelo cálculo da RN08 |
| 27/08/2026 | RF04 | Acrescentado o filtro por disciplina | Consequência do cadastro de disciplinas (RF13) |
| 27/08/2026 | RF10 | Redação ajustada de "atividades concluídas" para "peso das atividades concluídas" | Alinhamento com a RN08, que já usava peso |
| 27/08/2026 | RF13 e RF14 | Requisitos novos: cadastro de disciplinas e cadastro de conteúdos | Sustentar RF10 e RF11 |
| 27/08/2026 | RF15, RF16 e RF17 | Requisitos novos: experiência por atividade concluída, ofensiva de dias consecutivos e conquistas por marcos | Atender à orientação da professora sobre métricas de conquistas |
| 27/08/2026 | RF18 | Requisito novo: painel de desempenho do grupo com experiência, ofensiva e conquistas por integrante | Dar uma tela de destino aos dados produzidos por RF15, RF16 e RF17 |

---

## Requisitos não funcionais

| Data | Item | Alteração | Motivo |
|---|---|---|---|
| 27/08/2026 | Tabela | Acrescentada a coluna "Categoria" | O guia da disciplina pede a indicação da categoria de cada requisito não funcional |
| 27/08/2026 | RNF08 | Requisito novo: recálculo de progresso, experiência e ofensiva em até 1 segundo | Tornar verificável o desempenho das funcionalidades novas |
| 27/08/2026 | RNF09 | Requisito novo: progresso e status legíveis sem depender apenas da cor | Acessibilidade; a interface passa a depender muito de cor com a introdução das barras de progresso |

---

## Regras de negócio

| Data | Item | Alteração | Motivo |
|---|---|---|---|
| 27/08/2026 | RN01 | Ampliada para citar disciplinas e conteúdos | Novas entidades do grupo |
| 27/08/2026 | RN02 | Cascata ampliada para disciplinas e conteúdos | Novas entidades do grupo |
| 27/08/2026 | RN07 | Ampliada para incluir a gestão de disciplinas e conteúdos entre as permissões exclusivas do organizador | Coerência com o Doc. 04 |
| 27/08/2026 | RN09 a RN14 | Regras novas: faixa e padrão do peso, cálculo e estorno da experiência, cálculo da ofensiva, unicidade da conquista, obrigatoriedade do vínculo atividade–conteúdo–disciplina e cálculo do progresso da disciplina | Sustentar os requisitos novos e eliminar ambiguidade no cálculo do progresso |

---

## Revisão de 17/09/2026 — conferência com o código implementado

O código da aplicação foi percorrido tela a tela e confrontado com os requisitos. A conferência encontrou funcionalidades já implementadas que a documentação não previa e uma descrição incorreta de comportamento. Os requisitos e regras existentes não foram renumerados; os novos foram acrescentados ao final de cada tabela.

| Data | Item | Alteração | Motivo |
|---|---|---|---|
| 17/09/2026 | RF02 | Acrescentado "avatar" à relação de campos do membro | O campo `membro.avatar` já constava no modelo lógico e no dicionário de dados, mas não no requisito que origina a entidade |
| 17/09/2026 | RF19 | Requisito novo: geração e sorteio do avatar do membro | A aplicação gera os avatares na **DiceBear**, serviço externo que não estava documentado em lugar nenhum |
| 17/09/2026 | RF20 | Requisito novo: carga de dados de exemplo | Funcionalidade presente na tela de entrada, sem requisito correspondente |
| 17/09/2026 | RF21 | Requisito novo: relação dos próximos feriados nacionais | O painel já exibia a relação; o RF07 cobria apenas a sinalização do prazo que coincide com feriado |
| 17/09/2026 | RF22 | Requisito novo: sinalização de prazo em fim de semana | Aviso já exibido em três telas, sem requisito correspondente |
| 17/09/2026 | RNF10 | Requisito novo: permanecer utilizável com serviço externo fora do ar | Os três serviços externos já tinham alternativa local implementada, sem requisito que a exigisse |
| 17/09/2026 | RN15 a RN17 | Regras novas: semente e reserva do avatar, classificação de urgência do prazo e cadeia de obtenção dos feriados | Dar regra explícita a comportamentos que estavam apenas no código |
| 17/09/2026 | Doc. 05 — Restrições | A restrição de integração passou a citar os três serviços externos e a origem da tipografia, no lugar de citar apenas a BrasilAPI | A documentação registrava uma dependência externa; existem quatro |
| 17/09/2026 | Doc. 10 — UC08, fluxo 4A | **Correção.** O fluxo descrevia a cadeia BrasilAPI → cache. A cadeia real é BrasilAPI → Nager.Date → reaproveitamento da última relação obtida | A fonte reserva existia no código desde a Entrega 1 e nunca foi documentada; o fluxo alternativo descrevia comportamento que o sistema não tem |
| 17/09/2026 | Doc. 10 | Especificados os casos de uso UC02 e UC12, que antes não tinham especificação | O UC02 passou a ter ator secundário e fluxo alternativo próprios; o UC12 é caso de uso novo |
| 17/09/2026 | Diagrama de casos de uso | Acrescentados o UC12 e os atores secundários DiceBear e Nager.Date | Todo serviço externo consumido passa a estar representado no diagrama |
| 17/09/2026 | Doc. 11 | Refeita a verificação cruzada, que afirmava não haver tela com funcionalidade sem requisito | A afirmação havia deixado de ser verdadeira |

---

## Pendências abertas pela revisão

Itens identificados na conferência que dependem de alteração no código, e não na documentação. Ficam registrados para a Entrega 3.

| Item | Situação |
|---|---|
| Responsável obrigatório no formulário de atividade | A validação da aplicação exige responsável para salvar a atividade. A documentação prevê o contrário em quatro pontos: RN06 lista como obrigatórios apenas título e prazo, RN10 trata explicitamente das atividades sem responsável, o fluxo alternativo 5A do UC05 descreve a atividade aceita sem responsável e o modelo lógico declara `id_responsavel` como opcional. **A documentação está correta; a correção cabe ao código.** |
| Rodapé com dados de contato de um único integrante | O rodapé exibe contatos pessoais em todas as telas, sem requisito correspondente. A definir entre remover a seção ou substituí-la pela identificação dos dois integrantes da equipe. |

> **Atualização de 19/10/2026:** as duas pendências foram resolvidas no código entregue em 21/09/2026. A atividade sem responsável foi verificada no CT10 e o rodapé passou a mostrar só a identificação da equipe. Detalhes em [Defeitos e Pendências](16-defeitos-e-pendencias.md).

---

## Entrega 3 — 25/09/2026

A terceira entrega não altera requisitos: acrescenta o planejamento do trabalho, a arquitetura, os protótipos e a definição do MVP. As correções abaixo são de coerência, não de escopo.

| Data | Item | Alteração | Motivo |
|---|---|---|---|
| 25/09/2026 | Doc. 12 | Documento novo: backlog com 24 tarefas, cada uma ligada ao requisito que a origina, com prioridade, responsável e situação | Exigência da Etapa 3 do manual |
| 25/09/2026 | Doc. 13 | Documento novo: arquitetura em camadas, tecnologias justificadas e o caminho previsto até o banco relacional | Exigência da Etapa 4 |
| 25/09/2026 | Doc. 14 | Documento novo: classificação dos 22 requisitos em indispensável, desejável e futura, e a definição do fluxo completo | Exigência das Etapas 6 e 8.1 |
| 25/09/2026 | Diagramas | Dois desenhos novos em SVG: arquitetura prevista e mapa de navegação das telas do MVP | Exigências das Etapas 4.1 e 7.2 |
| 25/09/2026 | Protótipos | A pasta `prototipos/`, até então vazia, recebeu o levantamento de telas, as oito telas do MVP em imagem e o protótipo navegável em HTML | Exigência da Etapa 7.3 |
| 25/09/2026 | Doc. 11 | A matriz ganhou a coluna "No MVP?", ligando cada requisito à sua situação na primeira versão | Exigência da Etapa 9 |
| 25/09/2026 | README | Seções de MVP e de organização do projeto, conforme o modelo do manual | Exigência da Etapa 4.3 |
| 25/09/2026 | README | **Correção.** Constava "RNF01 a RNF09" e a relação de casos de uso especificados estava desatualizada, sem o UC02 e o UC12 | Os requisitos foram acrescentados na revisão de 17/09 e o índice não acompanhou |

---

## Revisão visual proposta na Entrega 3

A conferência das telas apontou problemas de interface que não alteram requisito nenhum, mas mudam como o sistema é usado. Estão registrados como a tarefa **T24** do [backlog](12-backlog.md). Em 21/09/2026 a revisão foi aplicada a todas as telas, exceto detalhe da atividade e acesso.

| Item | Situação anterior | Proposta |
|---|---|---|
| Layout | Conteúdo centralizado, com as laterais vazias | Três colunas: navegação à esquerda, conteúdo no meio, contexto à direita |
| Situações da atividade | Quatro contadores sem função | Quatro filtros: clicar em "Atrasadas" mostra só as atrasadas |
| Próximos feriados | Bloco próprio no painel, ocupando espaço das atividades | Pontos no calendário, junto com prazos e atrasos |
| Peso da atividade | Selo "Peso 3" ao lado da prioridade, confundido com ela | Anel de cinco segmentos à esquerda, junto ao check, com o efeito no progresso ao passar o mouse |
| Cor da gamificação | Verde-limão, igual ao verde de "concluída" | Violeta `#7C3AED`, que não ocupa nenhum outro papel no sistema |
| Tipografia | Três famílias: serifada nos títulos, Space Grotesk no corpo, Space Mono em todos os rótulos | Manrope em pesos variados, com monoespaçada apenas em números |

---

## Construção do MVP — 21/09/2026

Rodada de implementação que levou o sistema do estado da Entrega 3 ao MVP construído. Nenhum requisito, regra ou caso de uso foi alterado: o que mudou foi o código passar a fazer o que os documentos já descreviam.

| Item | Alteração | Motivo |
|---|---|---|
| Doc. 12 — Backlog | 13 tarefas passaram de *A fazer* e *Em andamento* para *Concluída*, restando a T24 em andamento | Execução do caminho crítico T06 → T07 → T13 → T12 → T18 → T21 e das tarefas paralelas |
| Doc. 12 — Situação geral | Tabela corrigida de 9/3/12 para a contagem real das linhas, e depois atualizada para 23/1/— | A tabela resumo divergia das linhas da tabela de tarefas desde a Entrega 3 |
| Doc. 14 — MVP | A seção "O que falta construir" passou a "Situação da construção", com o que entrou em cada tarefa do caminho crítico e o registro da migração de dados | O documento descrevia um estado que deixou de valer |
| Pasta `src/` | Deixou de estar vazia: recebeu o código-fonte da aplicação | A pasta existia como reserva desde a Entrega 2 |

Quinze das dezessete regras de negócio ficaram implementadas. As duas de fora, RN11 (ofensiva) e RN12 (conquistas), pertencem a requisitos classificados como desejáveis e não entraram no MVP — sem bloquear caminho, já que a data de conclusão da atividade passou a ser gravada.

Os dados gravados no navegador por quem já usava o sistema foram convertidos ao formato novo, e não descartados: a disciplina que era texto livre dentro da atividade virou cadastro próprio, com um conteúdo "Geral" recebendo as atividades existentes.

---

## 2º bimestre — revisão de 19/10/2026

A equipe releu problema, objetivos, perfis, escopo, requisitos, regras, casos de uso, protótipos e modelo de dados, e comparou tudo com o código entregue. **Nenhum requisito, regra ou caso de uso foi removido ou renumerado.** A proposta continua coerente e a base do 1º bimestre foi mantida; as mudanças abaixo são correções de coerência e os registros novos que o 2º bimestre exige.

| Data | Item | Alteração e motivo | Impacto |
|---|---|---|---|
| 19/10/2026 | Doc. 13 — Arquitetura | A tipografia citada era Space Grotesk e Space Mono; o sistema usa Manrope e JetBrains Mono desde a revisão visual. A arquitetura passou de "prevista" a confirmada, ganhou a seção de ambiente e a organização das pastas | Atualizar documento e README |
| 19/10/2026 | Diagrama de arquitetura | Título mudou de "Arquitetura prevista" para "Arquitetura do Vértice". O MySQL saiu do desenho, porque o projeto não o usa nesta versão; continua citado no texto como evolução futura | Atualizar SVG e PNG |
| 19/10/2026 | README | Tecnologias passaram de "previstas" a usadas, com a tipografia corrigida; entraram versões do ambiente, `npm run verificar`, funcionalidades disponíveis, pendências, o índice da entrega e o GitHub do Matheus | Atualizar README |
| 19/10/2026 | Doc. 14 — MVP | Seção nova com o recorte da entrega de 20/10, o que fica para 06/11 e o que está em desenvolvimento | Orienta a demonstração |
| 19/10/2026 | Doc. 12 — Backlog | Acrescentada a coluna de prazo; tarefas T25 a T36 do 2º bimestre; critérios de conclusão das prioritárias; forma de integrar as contribuições | Planejamento até 27/11 |
| 19/10/2026 | Doc. 11 — Matriz | Seção nova ligando cada requisito ao arquivo que o implementa, ao caso de teste e ao estado atual | Rastreabilidade até o código |
| 19/10/2026 | Doc. 15 — Casos de teste | Documento novo: 29 casos executados sobre o commit `c29279b`, com evidências | Exigência do Passo 7 do manual |
| 19/10/2026 | Doc. 16 — Defeitos e pendências | Documento novo: 7 defeitos encontrados nos testes (D01 a D07) e as pendências até 27/11 | Gera as tarefas T28, T29, T33 e T36 |
| 19/10/2026 | Identidade visual | Decidido refazer o visual do Vértice para a entrega de 06/11 (T27), absorvendo a T24 | Atualizar protótipos e capturas na próxima entrega |

---

## Pendência registrada

| Item | Situação |
|---|---|
| Persistência em banco de dados relacional | A Entrega 2 apresenta o modelo conceitual, o modelo lógico e o dicionário de dados completos. A implementação da primeira versão mantém a persistência no navegador, replicando a estrutura definida no modelo lógico, conforme a restrição do Doc. 05. A migração para um servidor de banco de dados fica prevista para uma versão futura. |

---

### Navegação

[⬅ Anterior: Regras de Negócio](08-regras-de-negocio.md) · [Índice](../README.md) · [Próximo: Casos de Uso ➡](10-casos-de-uso.md)
