# 12 · Backlog do Projeto

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Imersão Profissional: Projeto de Software · ADSIS4S · atualizado em 06/11/2026 para a entrega de 06/11/2026

---

O backlog reúne as tarefas de desenvolvimento, cada uma ligada ao requisito que a origina, com responsável, prioridade, prazo e situação. A ordem de execução segue a dependência entre elas: não é possível calcular progresso de conteúdo antes de existir conteúdo, nem creditar experiência antes de existir conclusão.

Situações usadas: **A fazer**, **Em andamento** e **Concluída**.

As tarefas T01 a T24 são do 1º bimestre e construíram o MVP. As tarefas a partir da T25 são do 2º bimestre. A T36 entrou depois da T35 por ter sido aberta a partir de um defeito encontrado nos testes, as tarefas T37 a T51 vieram da revisão de 28/10, com os pedidos da professora depois da entrega de 20/10, as tarefas T52 a T61, da revisão de 29/10, com os ajustes que a equipe pediu ao revisar a versão 2, as tarefas T62 a T65, da revisão de 01/11, e as tarefas T66 a T73, da revisão de 03/11; a numeração não indica ordem de execução.

---

## Situação geral

| Situação | 1º bimestre (T01–T24) | 2º bimestre (T25–T73) | Total |
|---|---|---|---|
| Concluída | 24 | 41 | 65 |
| Em andamento | 0 | 1 | 1 |
| A fazer | 0 | 7 | 7 |
| **Total** | **24** | **49** | **73** |

**O que estava previsto para 06/11 está implementado e testado.** As correções dos defeitos, a ofensiva, as conquistas, a tela de desempenho, a nova identidade visual, os pedidos da professora de 28/10 (responsável obrigatório, calendário, paleta de cores e foto de perfil), os ajustes de 29/10 (tema claro em todas as telas, listas e data com a identidade visual, editor de foto, foto do grupo, conteúdo criado na hora e conclusão só pelo responsável) e os da revisão de 03/11 (conteúdo opcional, eventos, avatares em dois estilos, página inicial com movimento, acesso em duas colunas e feedback dos usuários de teste) passaram nos 56 [casos de teste](15-casos-de-teste.md) desta entrega.

A **T34** continua em andamento: falta o teste no Firefox e no Edge (RNF05). Para 27/11 ficam o banco de dados, o acesso com conta, o convite para o grupo, as fotos no armazenamento de arquivos e o histórico de progresso.

---

## 1º bimestre: construção do MVP

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

A decisão da T14 foi revista em 28/10: a pedido da professora, o responsável voltou a ser obrigatório (T37).

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
| T24 | Aplicar a revisão visual: tipografia, cor da gamificação e layout de três colunas | RNF06 | Média | Andrey | 06/11/2026 | Concluída (absorvida pela T27) |

---

---

## 2º bimestre

### Entrega de 20/10/2026: revisão e testes

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T25 | Revisar a documentação do 1º bimestre e registrar as alterações | Organização | Alta | Andrey | 20/10/2026 | Concluída |
| T26 | Executar e registrar os casos de teste do recorte, com evidências e registro de defeitos | RF01–RF06, RF08–RF11, RF13–RF15, RF20, RF22, RNF02, RNF10 | Alta | Andrey | 20/10/2026 | Concluída |

### Entrega de 06/11/2026: correções, desejáveis e nova identidade visual

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T27 | Aplicar a nova identidade visual do Vértice a todas as telas, incluindo detalhe e acesso (absorve a T24 e os defeitos D03, D04 e D05) | RNF06 | Alta | Andrey | 06/11/2026 | Concluída |
| T28 | Impedir que o grupo fique sem organizador ao cadastrar o primeiro membro (defeito D01) | RN07 | Alta | Matheus | 30/10/2026 | Concluída |
| T29 | Avisar o usuário quando o navegador recusar a gravação (defeito D02) | RNF02 | Média | Andrey | 30/10/2026 | Concluída |
| T36 | Acrescentar o filtro por disciplina à lista de atividades (defeito D07) | RF04 | Alta | Andrey | 30/10/2026 | Concluída |
| T30 | Calcular e exibir a ofensiva de dias consecutivos | RF16, RN11 | Alta | Matheus | 06/11/2026 | Concluída |
| T31 | Conceder e exibir conquistas por marcos | RF17, RN12 | Alta | Matheus | 06/11/2026 | Concluída |
| T32 | Tela de desempenho do grupo com experiência, ofensiva e conquistas de cada integrante | RF18 | Média | Andrey | 06/11/2026 | Concluída |
| T33 | Avisar na migração quando uma atividade antiga não encontrar o seu grupo; ajustar a descrição do `package.json` (D06) | RN13 | Baixa | Matheus | 06/11/2026 | Concluída |
| T34 | Reexecutar os casos de teste e testar RF07, RF21, RNF01 e RNF05 | RF07, RF21, RNF01, RNF05 | Alta | Andrey e Matheus | 06/11/2026 | Em andamento (falta RNF05) |

### Entrega de 06/11/2026: pedidos da professora (revisão de 28/10)

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T37 | Tornar o responsável obrigatório na atividade e atribuir um responsável às atividades antigas na migração | RF03, RN06 | Alta | Matheus | 06/11/2026 | Concluída |
| T38 | Ao remover um membro, pedir quem assume as atividades dele | RF02, RN02 | Alta | Matheus | 06/11/2026 | Concluída |
| T39 | Calendário em tela própria, nas visões de mês, semana e lista, com as entregas nas cores das disciplinas | RF23 | Alta | Andrey | 06/11/2026 | Concluída |
| T40 | Paleta de 18 cores para as disciplinas, com sugestão de cor ainda não usada | RF25, RN18 | Média | Andrey | 06/11/2026 | Concluída |
| T41 | Foto de perfil no cadastro do membro, recortada e reduzida antes de gravar | RF24, RN19 | Média | Andrey | 06/11/2026 | Concluída |
| T42 | Quem cria o grupo informa o próprio nome e entra como organizador | RF01, RN07 | Alta | Matheus | 06/11/2026 | Concluída |
| T43 | Páginas públicas: início e Sobre nós | RF26 | Baixa | Andrey | 06/11/2026 | Concluída |
| T44 | Publicar o sistema na Vercel | Organização | Média | Andrey | 06/11/2026 | Concluída |
| T45 | Atualizar as dependências e eliminar as vulnerabilidades do `npm audit` (defeito D08) | Organização | Média | Matheus | 06/11/2026 | Concluída |

### Entrega de 06/11/2026: ajustes da revisão de 29/10

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T52 | Tema claro também nas páginas públicas, com a troca de tema no menu do site | RF08 | Média | Andrey | 06/11/2026 | Concluída |
| T53 | Listas de escolha com a identidade visual (cor da disciplina, foto do responsável, símbolos de ordenação) nos filtros e nos formulários | RF04 | Média | Andrey | 06/11/2026 | Concluída |
| T54 | Campo de data com o calendário do sistema, marcando hoje, fins de semana e feriados | RF03, RF07, RF22 | Média | Andrey | 06/11/2026 | Concluída |
| T55 | Editor de foto: arrastar e dar zoom antes de salvar, sem travar a tela | RF24, RN19 | Média | Andrey | 06/11/2026 | Concluída |
| T56 | Foto do grupo na criação e em "Editar grupo", com as iniciais quando não houver foto | RF01, RF29 | Baixa | Andrey | 06/11/2026 | Concluída |
| T57 | Formulário de atividade sem valores pré-escolhidos, com os padrões aplicados ao salvar | RF03, RN04, RN09 | Alta | Matheus | 06/11/2026 | Concluída |
| T58 | Criar o conteúdo a partir do formulário de atividade, sem perder o que foi preenchido | RF30, RN13 | Média | Matheus | 06/11/2026 | Concluída |
| T59 | Só o responsável muda o status; o participante edita só as próprias atividades | RN20, RN07 | Alta | Matheus | 06/11/2026 | Concluída |
| T60 | Transição animada entre meses e semanas do calendário, também deslizando o dedo | RF23 | Baixa | Andrey | 06/11/2026 | Concluída |
| T61 | Exclusão do grupo no pé da tela de Membros | RN07 | Baixa | Andrey | 06/11/2026 | Concluída |

### Entrega de 06/11/2026: ajustes da revisão de 01/11

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T62 | Marca nova do Vértice, que dá um terço de volta enquanto o grupo abre e uma volta ao passar o mouse | RNF06 | Baixa | Andrey | 06/11/2026 | Concluída |
| T63 | Seções numa barra no topo, no lugar da barra lateral; no celular, menu que desce do topo | RNF01, RNF06 | Média | Andrey | 06/11/2026 | Concluída |
| T64 | Avatares desenhados no próprio sistema, em cinco estilos para escolher, com sorteio | RF19, RN15 | Média | Matheus | 06/11/2026 | Concluída |
| T65 | Fotos da equipe nos círculos da página inicial enquadradas pela cabeça | RF26 | Baixa | Andrey | 06/11/2026 | Concluída |

### Entrega de 06/11/2026: ajustes da revisão de 03/11

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T66 | Avatares em dois estilos, Rabisco e Ilustrado; o estilo que saiu vira Rabisco na migração | RF19, RN15 | Baixa | Matheus | 06/11/2026 | Concluída |
| T67 | Conteúdo opcional: a atividade fica ligada direto à disciplina, excluir um conteúdo mantém as atividades dele, e a migração para a versão 3 dos dados ajusta o que já existe | RF03, RF10, RF11, RF14, RN13, RN14 | Alta | Matheus | 06/11/2026 | Concluída |
| T68 | Cadastro de eventos (prova, apresentação, palestra, reunião ou outro) e página Eventos, com próximos e passados | RF31, RN21 | Alta | Andrey | 06/11/2026 | Concluída |
| T69 | Eventos no calendário (mês, semana, lista e painel do dia) e no painel | RF23, RF31 | Média | Andrey | 06/11/2026 | Concluída |
| T70 | Página inicial com movimento: blocos que aparecem ao rolar, prévia que segue o mouse e demonstração em cada recurso | RF26, RNF06 | Média | Andrey | 06/11/2026 | Concluída |
| T71 | Tela de acesso em duas colunas: grupos existentes numa, criar grupo na outra | RF01 | Baixa | Andrey | 06/11/2026 | Concluída |
| T72 | Textos do sistema reescritos sem travessão | RNF06 | Baixa | Andrey e Matheus | 06/11/2026 | Concluída |
| T73 | Seção de feedback na página inicial e atalhos no rodapé e no menu da conta, com o formulário anônimo | RF32 | Baixa | Andrey | 06/11/2026 | Concluída |

### Até 27/11/2026: conclusão

| ID | Tarefa | Requisito | Prioridade | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| T35 | Registrar e exibir o histórico de progresso ao longo do tempo | RF12 | Média | Matheus | 27/11/2026 | A fazer |
| T46 | Criar o banco PostgreSQL no Supabase a partir do script do modelo lógico, com acesso restrito aos membros de cada grupo | RNF02, RN01 | Alta | Matheus | 20/11/2026 | A fazer |
| T47 | Trocar o armazenamento do navegador pelo banco, mantendo as regras de negócio em `lib/` | RNF02 | Alta | Matheus | 20/11/2026 | A fazer |
| T48 | Acesso com conta Google e com e-mail | RF27 | Alta | Andrey | 20/11/2026 | A fazer |
| T49 | Convite para o grupo por link e por código de acesso | RF28 | Alta | Andrey | 24/11/2026 | A fazer |
| T50 | Guardar as fotos de perfil e dos grupos no armazenamento de arquivos do Supabase | RF24, RF29 | Média | Andrey | 24/11/2026 | A fazer |
| T51 | Reexecutar os casos de teste na versão final, incluindo Firefox e Edge, e registrar os resultados | RNF05 | Alta | Andrey e Matheus | 26/11/2026 | A fazer |

---

## Critérios de conclusão das tarefas prioritárias

Uma tarefa só passa para **Concluída** quando todos os critérios abaixo forem verificados, e o caso de teste correspondente estiver registrado em [Casos de Teste](15-casos-de-teste.md).

| Tarefa | Está concluída quando |
|---|---|
| T27 | Todas as telas usam a nova paleta, tipografia e componentes nos temas claro e escuro; detalhe e acesso também; D03, D04 e D05 não se reproduzem; os protótipos e as capturas da documentação são atualizados |
| T28 | Cadastrar o primeiro membro de um grupo vazio nunca deixa o grupo sem organizador; o caso reprovado em 20/10 passa no novo teste (CT31); `npm run verificar` cobre o caso |
| T29 | Com o armazenamento cheio, o usuário vê um aviso de que o cadastro não foi salvo; o novo teste passa (CT32) |
| T36 | A lista tem um filtro com as disciplinas do grupo ativo, que funciona junto com os demais filtros; o novo teste passa (CT13) |
| T30 | Concluir atividades em dias seguidos aumenta a ofensiva; um dia sem conclusão a zera (RN11); reverter uma conclusão recalcula a ofensiva; há verificação automatizada da regra |
| T31 | Cada conquista é concedida uma vez só e não é retirada depois (RN12); as conquistas aparecem para o membro; há verificação automatizada da regra |
| T32 | A tela mostra experiência, ofensiva e conquistas de cada integrante do grupo, e só do grupo ativo (RN01) |
| T34 | Os casos de teste foram executados de novo sobre a versão da entrega de 06/11, com data e versão registradas, incluindo casos para RF07, RF21, RNF01 e RNF05 |
| T37 | Atividade sem responsável é recusada com mensagem no campo; as atividades antigas recebem um responsável na migração; há verificação automatizada das duas regras |
| T38 | A remoção de um membro com atividades só é confirmada depois de escolher quem assume; nenhuma atividade some nem fica sem responsável |
| T39 | O calendário mostra as entregas de cada dia na cor da disciplina, nas visões de mês, semana e lista; um dia do calendário abre a criação de atividade com o prazo preenchido |
| T44 | O sistema abre pelo endereço da Vercel, inclusive ao recarregar uma tela interna |
| T55 | O que fica dentro da moldura do editor é o que é gravado, conferido por cor (CT39); uma foto de celular abre no editor sem travar a tela; há verificação automatizada do enquadramento |
| T57 | O formulário novo abre sem responsável, status, peso nem prioridade escolhidos; o que é obrigatório é cobrado ao salvar; peso e status em branco viram 1 e "a fazer" (CT09 e CT10) |
| T58 | O conteúdo criado no formulário fica na disciplina escolhida e já selecionado, sem perder nenhum campo preenchido; o participante não vê a opção (CT41) |
| T64 | O avatar aparece sem internet e sem pedir imagem a outro endereço; os cinco estilos são oferecidos, sortear troca o desenho e o estilo escolhido é gravado (CT27 e CT47); há verificação automatizada dos avatares |
| T67 | Uma atividade é criada só com a disciplina, sem conteúdo, e conta no progresso da disciplina; excluir um conteúdo deixa as atividades dele na disciplina; dados da versão 2 são migrados sem perder atividade (CT48 a CT50); há verificação automatizada da migração |
| T68 | O evento sem nome, tipo ou dia é recusado com mensagem no campo; fim antes do início é recusado; só quem cadastrou e o organizador editam e excluem; o evento aparece na página Eventos, no painel e no calendário (CT51 e CT52) |
| T59 | Ninguém além do responsável conclui ou muda o status, nem pela lista, nem pelo detalhe, nem pelo formulário; o participante não edita as atividades dos outros nem pelo endereço; há verificação automatizada da regra (CT42) |
| T46 | As tabelas do modelo lógico existem no banco, e um membro só lê e altera os dados do próprio grupo |
| T48 | Uma pessoa entra com a conta Google ou com o e-mail e é reconhecida como o membro do grupo vinculado a ela |
| T49 | Quem recebe o link ou o código entra no grupo como participante |

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

As seis foram executadas nessa ordem, e foi ela que ditou o ritmo: a disciplina precisou existir como entidade antes de o conteúdo poder pertencer a alguma, o conteúdo antes de a atividade poder se vincular, e o peso antes de haver o que somar. A migração dos dados já gravados entrou junto com a T13, porque é a mesma mudança de formato vista do outro lado: quem já usava o sistema tinha atividades com a disciplina escrita como texto, e elas precisavam encontrar um conteúdo para morar.

---

## Divisão do trabalho

| Integrante | Frente | Tarefas |
|---|---|---|
| **Andrey Fogaça** | Interface, telas e experiência de uso | 1º bimestre: T01, T02, T03, T04, T05, T08, T09, T10, T11, T14, T15, T16, T17, T20, T22, T23, T24 · 2º bimestre: T25, T26, T27, T29, T32, T34, T36, T39, T40, T41, T43, T44, T48, T49, T50, T51, T52, T53, T54, T55, T56, T60, T61, T62, T63, T65, T68, T69, T70, T71, T72, T73 |
| **Matheus Saraiva Faustin** | Modelo de dados e regras de cálculo | 1º bimestre: T06, T07, T12, T13, T18, T19, T21 · 2º bimestre: T28, T30, T31, T33, T34, T35, T37, T38, T42, T45, T46, T47, T51, T57, T58, T59, T64, T66, T67, T72 |

A divisão indica quem conduz a tarefa, não quem é o único a conhecê-la. No 2º bimestre, as regras novas (ofensiva, conquistas, responsável obrigatório, quem muda o status) e o banco de dados seguem com o Matheus, e as telas que as exibem, o acesso com conta e a publicação, com o Andrey. As tarefas do Matheus concentram as regras que sustentam o progresso (RN08, RN09, RN13, RN14 e RN10); as do Andrey concentram a tradução dessas regras em tela.

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
