# 12 · Backlog do Projeto

> **Vértice** — Plataforma de Acompanhamento de Aprendizagem
> Imersão Profissional: Projeto de Software · ADSIS4S · atualizado em 19/10/2026 para a entrega de 20/10/2026

---

O backlog reúne as tarefas de desenvolvimento, cada uma ligada ao requisito que a origina, com responsável, prioridade, prazo e situação. A ordem de execução segue a dependência entre elas: não é possível calcular progresso de conteúdo antes de existir conteúdo, nem creditar experiência antes de existir conclusão.

Situações usadas: **A fazer**, **Em andamento** e **Concluída**.

As tarefas T01 a T24 são do 1º bimestre e construíram o MVP. As tarefas a partir da T25 são do 2º bimestre. A T36 entrou depois da T35 por ter sido aberta a partir de um defeito encontrado nos testes; a numeração não indica ordem de execução.

---

## Situação geral

| Situação | 1º bimestre (T01–T24) | 2º bimestre (T25–T36) | Total |
|---|---|---|---|
| Concluída | 23 | 2 | 25 |
| Em andamento | 1 | — | 1 |
| A fazer | — | 10 | 10 |
| **Total** | **24** | **12** | **36** |

**O MVP está construído.** As quinze funcionalidades classificadas como indispensáveis no [Produto Mínimo Viável](14-mvp.md) estão implementadas e foram testadas nesta entrega ([casos de teste](15-casos-de-teste.md)).

A **T24** continua parcial: faltam as telas de **detalhe** e **acesso** na revisão visual. Ela passa a ser feita dentro da **T27**, a nova identidade visual planejada para 06/11.

---

## 1º bimestre — construção do MVP

### Estrutura do grupo

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T01 | Tela de acesso com seleção e criação de grupo | RF01 | Alta | Andrey | 25/09/2026 | Concluída |
| T02 | Carga de dados de exemplo na tela de acesso | RF20 | Baixa | Andrey | 25/09/2026 | Concluída |
| T03 | Cadastro, edição e exclusão de membros | RF02 | Alta | Andrey | 25/09/2026 | Concluída |
| T04 | Avatar do membro com sorteio de semente | RF19 | Baixa | Andrey | 25/09/2026 | Concluída |
| T05 | Encerramento da sessão do grupo | RF09 | Média | Andrey | 25/09/2026 | Concluída |
| T06 | Entidade disciplina: modelo, tela e formulário | RF13 | Alta | Matheus | 25/09/2026 | Concluída |
| T07 | Entidade conteúdo vinculada à disciplina | RF14 | Alta | Matheus | 25/09/2026 | Concluída |
| T08 | Estado vazio orientando disciplina → conteúdo → atividade | RNF07 | Média | Andrey | 25/09/2026 | Concluída |

---

### Atividades

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T09 | Cadastro e edição de atividade | RF03 | Alta | Andrey | 25/09/2026 | Concluída |
| T10 | Listagem com busca, filtros e ordenação | RF04 | Alta | Andrey | 25/09/2026 | Concluída |
| T11 | Detalhe da atividade com alteração de status | RF05 | Alta | Andrey | 25/09/2026 | Concluída |
| T12 | Campo peso no formulário, com escala de 1 a 5 | RF03, RN09 | Alta | Matheus | 25/09/2026 | Concluída |
| T13 | Vínculo obrigatório atividade → conteúdo no formulário | RF03, RN13 | Alta | Matheus | 25/09/2026 | Concluída |
| T14 | Tornar o responsável opcional na validação | RN06, RN10 | Média | Andrey | 25/09/2026 | Concluída |
| T15 | Filtros como painel lateral fixo | RF04, RNF01 | Média | Andrey | 25/09/2026 | Concluída |
| T16 | Cartões de situação clicáveis, funcionando como filtro | RF06 | Média | Andrey | 25/09/2026 | Concluída |

---

### Progresso e desempenho

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T17 | Painel com totais por status e atividades atrasadas | RF06 | Alta | Andrey | 25/09/2026 | Concluída |
| T18 | Cálculo do progresso por conteúdo a partir do peso | RF10, RN08 | Alta | Matheus | 25/09/2026 | Concluída |
| T19 | Agregação do progresso por disciplina | RF11, RN14 | Alta | Matheus | 25/09/2026 | Concluída |
| T20 | Barras de progresso no painel e na tela de disciplinas | RF10, RF11 | Alta | Andrey | 25/09/2026 | Concluída |
| T21 | Crédito e estorno de experiência ao concluir e reverter | RF15, RN10 | Alta | Matheus | 25/09/2026 | Concluída |
| T22 | Retorno visual da conclusão: progresso antes e depois | RF15 | Média | Andrey | 25/09/2026 | Concluída |

---

### Interface e ajustes visuais

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T23 | Tema claro e escuro | RF08 | Baixa | Andrey | 25/09/2026 | Concluída |
| T24 | Aplicar a revisão visual: tipografia, cor da gamificação e layout de três colunas | RNF06 | Média | Andrey | 06/11/2026 | Em andamento |

---

---

## 2º bimestre

### Entrega de 20/10/2026 — revisão e testes

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T25 | Revisar a documentação do 1º bimestre e registrar as alterações | — | Alta | Andrey | 20/10/2026 | Concluída |
| T26 | Executar e registrar os casos de teste do recorte, com evidências e registro de defeitos | RF01–RF06, RF08–RF11, RF13–RF15, RF20, RF22, RNF02, RNF10 | Alta | Andrey | 20/10/2026 | Concluída |

### Até 06/11/2026 — correções, desejáveis e nova identidade visual

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T27 | Aplicar a nova identidade visual do Vértice a todas as telas, incluindo detalhe e acesso (absorve a T24 e os defeitos D03, D04 e D05) | RNF06 | Alta | Andrey | 06/11/2026 | A fazer |
| T28 | Impedir que o grupo fique sem organizador ao cadastrar o primeiro membro (defeito D01) | RN07 | Alta | Matheus | 30/10/2026 | A fazer |
| T29 | Avisar o usuário quando o navegador recusar a gravação (defeito D02) | RNF02 | Média | Andrey | 30/10/2026 | A fazer |
| T36 | Acrescentar o filtro por disciplina à lista de atividades (defeito D07) | RF04 | Alta | Andrey | 30/10/2026 | A fazer |
| T30 | Calcular e exibir a ofensiva de dias consecutivos | RF16, RN11 | Alta | Matheus | 06/11/2026 | A fazer |
| T31 | Conceder e exibir conquistas por marcos | RF17, RN12 | Alta | Matheus | 06/11/2026 | A fazer |
| T32 | Tela de desempenho do grupo com experiência, ofensiva e conquistas de cada integrante | RF18 | Média | Andrey | 06/11/2026 | A fazer |
| T33 | Avisar na migração quando uma atividade antiga não encontrar conteúdo; ajustar a descrição do `package.json` (D06) | RN13 | Baixa | Matheus | 06/11/2026 | A fazer |
| T34 | Reexecutar os casos de teste e testar RF07, RF21, RNF01 e RNF05 | RF07, RF21, RNF01, RNF05 | Alta | Andrey e Matheus | 06/11/2026 | A fazer |

### Até 27/11/2026 — conclusão

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T35 | Registrar e exibir o histórico de progresso ao longo do tempo | RF12 | Média | Matheus | 27/11/2026 | A fazer |

---

## Critérios de conclusão das tarefas prioritárias

Uma tarefa só passa para **Concluída** quando todos os critérios abaixo forem verificados, e o caso de teste correspondente estiver registrado em [Casos de Teste](15-casos-de-teste.md).

| Tarefa | Está concluída quando |
|---|---|
| T27 | Todas as telas usam a nova paleta, tipografia e componentes nos temas claro e escuro; detalhe e acesso também; D03, D04 e D05 não se reproduzem; os protótipos e as capturas da documentação são atualizados |
| T28 | Cadastrar o primeiro membro de um grupo vazio nunca deixa o grupo sem organizador; o CT26 passa; `npm run verificar` cobre o caso |
| T29 | Com o armazenamento cheio, o usuário vê um aviso de que o cadastro não foi salvo; o CT27 passa |
| T36 | A lista tem um filtro com as disciplinas do grupo ativo, que funciona junto com os demais filtros; o CT29 passa |
| T30 | Concluir atividades em dias seguidos aumenta a ofensiva; um dia sem conclusão a zera (RN11); reverter uma conclusão recalcula a ofensiva; há verificação automatizada da regra |
| T31 | Cada conquista é concedida uma vez só e não é retirada depois (RN12); as conquistas aparecem para o membro; há verificação automatizada da regra |
| T32 | A tela mostra experiência, ofensiva e conquistas de cada integrante do grupo, e só do grupo ativo (RN01) |
| T34 | Os 29 casos foram reexecutados sobre o commit da entrega de 06/11, com data e commit registrados, e os novos casos de RF07, RF21, RNF01 e RNF05 foram incluídos |

---

## Dependências entre as tarefas do MVP

Algumas tarefas não podem começar antes de outras terminarem. A ordem abaixo é a sequência mínima para chegar ao fluxo completo do MVP:

```
T06 disciplina  →  T07 conteúdo  →  T13 vínculo da atividade
                                         ↓
                                    T12 peso
                                         ↓
                        T18 progresso do conteúdo  →  T19 progresso da disciplina
                                         ↓                        ↓
                                    T21 experiência        T20 barras na tela
                                         ↓
                                    T22 retorno da conclusão
```

O caminho crítico é **T06 → T07 → T13 → T12 → T18 → T21**. Qualquer atraso nessas seis tarefas empurraria a data do MVP; as demais podiam ser feitas em paralelo.

As seis foram executadas nessa ordem, e foi ela que ditou o ritmo: a disciplina precisou existir como entidade antes de o conteúdo poder pertencer a alguma, o conteúdo antes de a atividade poder se vincular, e o peso antes de haver o que somar. A migração dos dados já gravados entrou junto com a T13, porque é a mesma mudança de formato vista do outro lado — quem já usava o sistema tinha atividades com a disciplina escrita como texto, e elas precisavam encontrar um conteúdo para morar.

---

## Divisão do trabalho

| Integrante | Frente | Tarefas |
|---|---|---|
| **Andrey Fogaça** | Interface, telas e experiência de uso | 1º bimestre: T01, T02, T03, T04, T05, T08, T09, T10, T11, T14, T15, T16, T17, T20, T22, T23, T24 · 2º bimestre: T25, T26, T27, T29, T32, T34, T36 |
| **Matheus Saraiva Faustin** | Modelo de dados e regras de cálculo | 1º bimestre: T06, T07, T12, T13, T18, T19, T21 · 2º bimestre: T28, T30, T31, T33, T34, T35 |

A divisão indica quem conduz a tarefa, não quem é o único a conhecê-la. No 2º bimestre, as regras novas (ofensiva e conquistas) seguem com o Matheus, e as telas que as exibem, com o Andrey. As tarefas do Matheus concentram as regras que sustentam o progresso (RN08, RN09, RN13, RN14 e RN10); as do Andrey concentram a tradução dessas regras em tela.

---

---

## Como as contribuições são integradas

- Todo código e documento entra no repositório da equipe, na branch `main`; nada é demonstrado a partir do computador de um só integrante.
- Cada integrante faz os commits do que produziu, com mensagem que explica a mudança.
- Antes de subir código, quem fez roda `npm run verificar` e `npm run build`; os dois precisam passar.
- O outro integrante revisa a mudança antes da entrega e reexecuta os casos de teste afetados.
- Cada entrega é marcada com uma tag no repositório (`entrega-20-10-2026`, `entrega-06-11-2026`, `entrega-27-11-2026`).

---

### Navegação

[⬅ Anterior: Matriz de Rastreabilidade](11-matriz-de-rastreabilidade.md) · [Índice](../README.md) · [Próximo: Arquitetura ➡](13-arquitetura.md)
