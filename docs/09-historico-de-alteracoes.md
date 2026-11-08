# 09 · Histórico de Alterações

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · atualizado em 08/11/2026

---

Registro das mudanças aplicadas ao Documento de Visão e Requisitos ao longo do bimestre: da Entrega 1 (14/08/2026) para a Entrega 2 (08/09/2026), a revisão de 17/09/2026 feita a partir da conferência com o código, os acréscimos da Entrega 3 (25/09/2026), a revisão do início do 2º bimestre (19/10/2026), a revisão de 28/10/2026, com os pedidos da professora depois da entrega de 20/10, as de 29/10 e 01/11/2026, com os ajustes que a equipe pediu ao revisar a versão 2, a de 03/11/2026, com os pedidos da equipe para a entrega de 06/11, e a de 08/11/2026, com o banco de dados e o acesso com conta para a entrega de 27/11. A numeração dos requisitos existentes foi preservada; os itens novos foram acrescentados ao final de cada tabela.

---

## Composição da equipe

| Data | Item | Alteração | Motivo |
|---|---|---|---|
| 27/08/2026 | Doc. 01 e 05 | Equipe reduzida de três para dois integrantes: Andrey Fogaça e Matheus Saraiva Faustin | Brayan Gabriel Biscaia trancou o curso e deixou o projeto |

---

## Escopo

| Data | Item | Alteração | Motivo |
|---|---|---|---|
| 27/08/2026 | Doc. 05: Escopo | "Sistema de conquistas e gamificação" saiu de *Não incluído* e passou a integrar o escopo da primeira versão | Orientação da professora, que solicitou barra de progresso das atividades e métricas de conquistas |
| 27/08/2026 | Doc. 05: Escopo | Incluídos o cadastro de disciplinas e o cadastro de conteúdos como funcionalidades próprias | Progresso por conteúdo e por disciplina (RF10 e RF11) exige que ambos existam como cadastros, e não como texto livre dentro da atividade |
| 27/08/2026 | Doc. 05: Escopo | Incluído "Ranking competitivo entre grupos ou entre instituições" em *Não incluído* | Delimitar a gamificação ao acompanhamento individual, evitando ampliação do escopo |
| 27/08/2026 | Doc. 05: Restrições | Restrição de persistência passou a citar que a estrutura no navegador segue o modelo lógico do banco de dados | Manter coerência entre a Entrega 2 (modelagem de dados) e a implementação prevista |

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

## Revisão de 17/09/2026: conferência com o código implementado

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
| 17/09/2026 | Doc. 05: Restrições | A restrição de integração passou a citar os três serviços externos e a origem da tipografia, no lugar de citar apenas a BrasilAPI | A documentação registrava uma dependência externa; existem quatro |
| 17/09/2026 | Doc. 10: UC08, fluxo 4A | **Correção.** O fluxo descrevia a cadeia BrasilAPI → cache. A cadeia real é BrasilAPI → Nager.Date → reaproveitamento da última relação obtida | A fonte reserva existia no código desde a Entrega 1 e nunca foi documentada; o fluxo alternativo descrevia comportamento que o sistema não tem |
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

## Entrega 3: 25/09/2026

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

## Construção do MVP: 21/09/2026

Rodada de implementação que levou o sistema do estado da Entrega 3 ao MVP construído. Nenhum requisito, regra ou caso de uso foi alterado: o que mudou foi o código passar a fazer o que os documentos já descreviam.

| Item | Alteração | Motivo |
|---|---|---|
| Doc. 12: Backlog | 13 tarefas passaram de *A fazer* e *Em andamento* para *Concluída*, restando a T24 em andamento | Execução do caminho crítico T06 → T07 → T13 → T12 → T18 → T21 e das tarefas paralelas |
| Doc. 12: Situação geral | Tabela corrigida de 9/3/12 para a contagem real das linhas, e depois atualizada para 23/1/0 | A tabela resumo divergia das linhas da tabela de tarefas desde a Entrega 3 |
| Doc. 14: MVP | A seção "O que falta construir" passou a "Situação da construção", com o que entrou em cada tarefa do caminho crítico e o registro da migração de dados | O documento descrevia um estado que deixou de valer |
| Pasta `src/` | Deixou de estar vazia: recebeu o código-fonte da aplicação | A pasta existia como reserva desde a Entrega 2 |

Quinze das dezessete regras de negócio ficaram implementadas. As duas de fora, RN11 (ofensiva) e RN12 (conquistas), pertencem a requisitos classificados como desejáveis e não entraram no MVP, sem bloquear caminho, já que a data de conclusão da atividade passou a ser gravada.

Os dados gravados no navegador por quem já usava o sistema foram convertidos ao formato novo, e não descartados: a disciplina que era texto livre dentro da atividade virou cadastro próprio, com um conteúdo "Geral" recebendo as atividades existentes.

---

## 2º bimestre: revisão de 19/10/2026

A equipe releu problema, objetivos, perfis, escopo, requisitos, regras, casos de uso, protótipos e modelo de dados, e comparou tudo com o código entregue. **Nenhum requisito, regra ou caso de uso foi removido ou renumerado.** A proposta continua coerente e a base do 1º bimestre foi mantida; as mudanças abaixo são correções de coerência e os registros novos que o 2º bimestre exige.

| Data | Item | Alteração e motivo | Impacto |
|---|---|---|---|
| 19/10/2026 | Doc. 13: Arquitetura | A tipografia citada era Space Grotesk e Space Mono; o sistema usa Manrope e JetBrains Mono desde a revisão visual. A arquitetura passou de "prevista" a confirmada, ganhou a seção de ambiente e a organização das pastas | Atualizar documento e README |
| 19/10/2026 | Diagrama de arquitetura | Título mudou de "Arquitetura prevista" para "Arquitetura do Vértice". O MySQL saiu do desenho, porque o projeto não o usa nesta versão; continua citado no texto como evolução futura | Atualizar SVG e PNG |
| 19/10/2026 | README | Tecnologias passaram de "previstas" a usadas, com a tipografia corrigida; entraram versões do ambiente, `npm run verificar`, funcionalidades disponíveis, pendências, o índice da entrega e o GitHub do Matheus | Atualizar README |
| 19/10/2026 | Doc. 14: MVP | Seção nova com o recorte da entrega de 20/10, o que fica para 06/11 e o que está em desenvolvimento | Orienta a demonstração |
| 19/10/2026 | Doc. 12: Backlog | Acrescentada a coluna de prazo; tarefas T25 a T36 do 2º bimestre; critérios de conclusão das prioritárias; forma de integrar as contribuições | Planejamento até 27/11 |
| 19/10/2026 | Doc. 11: Matriz | Seção nova ligando cada requisito ao arquivo que o implementa, ao caso de teste e ao estado atual | Rastreabilidade até o código |
| 19/10/2026 | Doc. 15: Casos de teste | Documento novo: 29 casos executados sobre o commit `c29279b`, com evidências | Exigência do Passo 7 do manual |
| 19/10/2026 | Doc. 16: Defeitos e pendências | Documento novo: 7 defeitos encontrados nos testes (D01 a D07) e as pendências até 27/11 | Gera as tarefas T28, T29, T33 e T36 |
| 19/10/2026 | Identidade visual | Decidido refazer o visual do Vértice para a entrega de 06/11 (T27), absorvendo a T24 | Atualizar protótipos e capturas na próxima entrega |

---

## 2º bimestre: revisão de 28/10/2026

Depois da entrega de 20/10, a professora pediu que toda atividade tivesse um responsável, um calendário com as entregas nas cores das disciplinas, mais cores para as disciplinas, um visual mais profissional mantendo as cores atuais, foto de perfil no cadastro, banco de dados, hospedagem e login com conta Google. A equipe incluiu esses pedidos no escopo e revisou os documentos afetados. **Nenhum requisito ou regra foi removido ou renumerado**; os novos foram acrescentados ao final de cada tabela.

| Data | Item | Alteração e motivo | Impacto |
|---|---|---|---|
| 28/10/2026 | RF03, RN06, RN10 | O responsável passou a ser obrigatório na atividade, a pedido da professora. O RN10 deixou de tratar a atividade sem responsável, que não existe mais | Casos de uso UC05 e UC07, fluxos de atividade, modelo de dados, migração dos dados e testes |
| 28/10/2026 | RF02, RN02 | Ao remover um membro com atividades, o organizador escolhe quem as assume. Antes, as atividades ficavam sem responsável, o que a nova RN06 não permite | UC02, modelo lógico (`ON DELETE RESTRICT`) e testes |
| 28/10/2026 | RF01, RN07 | Quem cria o grupo informa o próprio nome e entra como organizador; o primeiro membro de um grupo sem membros é sempre organizador; o último organizador não pode ser rebaixado nem removido. Corrige o defeito D01 e escreve uma regra que o código já aplicava. A RN07 também passou a dizer que o participante exclui só as atividades sob sua responsabilidade, como o Doc. 04 já previa (defeito D10) | UC01, UC02 e Doc. 04 |
| 28/10/2026 | RF23 | Requisito novo: calendário com as entregas de cada dia nas cores das disciplinas, a pedido da professora | Caso de uso novo UC13, tela e testes |
| 28/10/2026 | RF24, RN19 | Requisito e regra novos: foto de perfil enviada pelo membro, a pedido da professora | UC02, classes, modelo de dados (`membro.foto`) e testes |
| 28/10/2026 | RF25, RN18 | Requisito e regra novos: paleta de 18 cores para as disciplinas, a pedido da professora por mais cores e variações | UC03, dicionário de dados e migração das cores que saíram da paleta |
| 28/10/2026 | RF26 | Requisito novo: páginas públicas de apresentação, com a página inicial e a página Sobre nós | UC01, protótipos e mapa de navegação |
| 28/10/2026 | RF27, RF28 | Requisitos novos: acesso com conta Google ou e-mail e convite para o grupo por link ou código, a pedido da professora por banco de dados e login com Google | Planejados para 27/11 (T46 a T49) |
| 28/10/2026 | RN11 | Redação completada: o dia atual fica em aberto até terminar. Descreve o comportamento implementado, em que a ofensiva não zera de manhã só porque ainda não houve conclusão no dia | Regra |
| 28/10/2026 | Doc. 05: Escopo e restrições | Entraram foto de perfil, paleta, calendário, páginas públicas, acesso com conta e convite; o acesso por senha saiu de "não incluído"; as restrições ganharam os prazos do 2º bimestre, o banco e a hospedagem, e o Google Fonts deixou de ser dependência | Escopo |
| 28/10/2026 | Doc. 13: Arquitetura | O estilo passou de Styled Components para Tailwind CSS e Radix UI, na nova identidade visual; a tipografia passou a Inter Tight e JetBrains Mono, servidas junto com o sistema; a hospedagem passou a ser a Vercel; o banco escolhido para 27/11 é o PostgreSQL do Supabase; Vite e React Router foram atualizados para eliminar as vulnerabilidades apontadas pelo `npm audit` | Diagrama de arquitetura e README |
| 28/10/2026 | Diagramas e modelo de dados | Diagrama de casos de uso com o UC13; classes e modelos com `membro.foto` e o responsável obrigatório; fluxos de atividade sem a decisão "a atividade tem responsável?"; script de criação com as restrições novas | Imagens regeneradas |
| 28/10/2026 | Protótipos | Acrescentadas as telas da versão 2 e o mapa de navegação com as telas novas | Nenhum |
| 28/10/2026 | Docs. 11, 12, 14, 15 e 16 | Matriz, backlog, recorte, casos de teste e defeitos da entrega de 06/11 | Exigência do manual |

---

## 2º bimestre: revisão de 29/10/2026

Ao revisar a versão 2, a equipe pediu ajustes de uso: o tema claro também nas páginas públicas, listas de escolha e campo de data com a identidade visual, um editor para enquadrar a foto, foto do grupo, criar o conteúdo sem sair do cadastro de atividade, o formulário de atividade sem valores pré-escolhidos, animação no calendário, a exclusão do grupo no pé da tela de Membros e cada pessoa concluindo só as próprias atividades. **Nenhum requisito ou regra foi removido ou renumerado**; os novos foram acrescentados ao final de cada tabela.

| Data | Item | Alteração e motivo | Impacto |
|---|---|---|---|
| 29/10/2026 | RN20, RF05 | Regra nova: só o responsável altera o status da atividade, inclusive para concluí-la; nem o organizador conclui pelos outros. A experiência e a ofensiva são de quem fez a atividade (RN10, RN11), e concluir pelo colega dava a ele um crédito que não era dele | UC05 e UC07, Doc. 04, fluxo "concluir atividade" e testes (CT42) |
| 29/10/2026 | RN07 | O participante passou a editar só as atividades sob sua responsabilidade, como já acontecia com a exclusão; o organizador edita e exclui qualquer uma, e passa a editar o grupo | UC01, UC05 e Doc. 04 |
| 29/10/2026 | RF01, RF29, RN19 | Requisito novo: foto do grupo, na criação ou em "Editar grupo"; sem foto, ficam as iniciais. A RN19 passou a valer também para ela | UC01, classes, modelo de dados (`grupo.foto`) e testes (CT40) |
| 29/10/2026 | RF24, RN19 | A foto de perfil passa por um editor em que a pessoa arrasta e dá zoom antes de salvar, no lugar do recorte automático do centro | UC02 e testes (CT04 e CT39) |
| 29/10/2026 | RF30 | Requisito novo: criar o conteúdo a partir do formulário de atividade, sem perder o que já foi preenchido | UC05, fluxo "cadastrar atividade" e testes (CT41) |
| 29/10/2026 | RF03 | O formulário de atividade começa vazio (antes, responsável, status e peso vinham escolhidos) e o prazo é escolhido no calendário do próprio sistema. O que fica em branco assume o padrão das RN04 e RN09 | UC05 e testes (CT09, CT10 e CT44) |
| 29/10/2026 | RF04 | Os filtros mostram a cor da disciplina, a foto do responsável e o símbolo de cada ordem | Testes (CT13) |
| 29/10/2026 | RF08 | O tema claro passou a valer também nas páginas públicas, que antes eram sempre escuras | Testes (CT25) |
| 29/10/2026 | RF23 | A troca de mês e de semana do calendário ganhou transição animada, também pelo gesto de deslizar no celular, respeitando quem pede menos movimento no sistema | UC13 e testes (CT43) |
| 29/10/2026 | Tela de Membros | A exclusão do grupo passou para o pé da tela, longe das ações do dia a dia | Testes (CT38) |
| 29/10/2026 | Páginas públicas | O rodapé ganhou o Instagram do projeto, @go.vertice | Doc. 01 e testes (CT33) |
| 29/10/2026 | Diagramas, modelo de dados e protótipos | Classes e modelos com `grupo.foto`; fluxos de concluir e de cadastrar atividade com as decisões novas; telas da versão 2 capturadas de novo | Imagens regeneradas |
| 29/10/2026 | Docs. 11, 12, 13, 14, 15 e 16 | Matriz com RF29, RF30 e RN20; tarefas T52 a T61 no backlog; componentes novos na arquitetura; recorte de 06/11 e casos de teste CT39 a CT44 | Exigência do manual |

---

## 2º bimestre: revisão de 01/11/2026

Na revisão seguinte, a equipe pediu a marca nova do Vértice, as seções no topo da tela, avatares que funcionem em qualquer lugar e com estilos para escolher, e as fotos dos integrantes sem a cabeça cortada na página inicial. **Nenhum requisito ou regra foi removido ou renumerado.**

| Data | Item | Alteração e motivo | Impacto |
|---|---|---|---|
| 01/11/2026 | RF19, RN15 | O avatar passou a ser desenhado pelo próprio sistema, com a biblioteca da DiceBear, em um entre cinco estilos escolhido pelo membro. Antes ele vinha do serviço da DiceBear pela internet, e onde a imagem externa era bloqueada (como na versão de demonstração) o sorteio não mudava nada na tela | UC02 sem ator secundário e sem o fluxo 4A; DiceBear fora dos diagramas de casos de uso e de arquitetura; `membro.estilo_avatar` no modelo de dados; testes (CT27 e CT47) |
| 01/11/2026 | RNF10 | Deixa de depender do RF19: os avatares não usam mais serviço externo | Doc. 05 e Doc. 13 |
| 01/11/2026 | Interface do sistema | As seções saíram da barra lateral e foram para uma barra no topo, com a marca, o grupo, o tema e a conta; no celular, o menu desce do topo | Matriz, casos de uso, protótipos e testes (CT46) |
| 01/11/2026 | Marca | Marca nova do Vértice, a partir da arte da equipe. Ao abrir o grupo, aparece no centro com o nome dele e dá um terço de volta, e a tela se dissolve no painel; dá uma volta ao passar o mouse | Protótipos e testes (CT45) |
| 01/11/2026 | Página inicial | As fotos dos integrantes aparecem nos círculos enquadradas pela cabeça | Testes (CT33) |
| 01/11/2026 | Docs. 11 a 16 | Matriz, tarefas T62 a T65, arquitetura sem a DiceBear como serviço, recorte de 06/11 e casos de teste CT45 a CT47 | Exigência do manual |

---

## 2º bimestre: revisão de 03/11/2026

Ao usar a versão 2 no dia a dia, a equipe pediu: só dois estilos de avatar, o conteúdo deixando de ser obrigatório, um cadastro de eventos (prova, palestra) que também apareça no calendário, uma página inicial com mais movimento, a tela de acesso em duas colunas e os textos sem travessão. Na mesma revisão entrou o formulário de feedback dos usuários de teste. **Nenhum requisito ou regra foi removido ou renumerado**; os novos foram acrescentados ao final de cada tabela.

| Data | Item | Alteração e motivo | Impacto |
|---|---|---|---|
| 03/11/2026 | RF03, RF14, RN06, RN13 | O conteúdo passou a ser opcional: a atividade fica ligada direto à disciplina, que virou obrigatória, e o conteúdo serve só para quem quer separar a disciplina por assunto. Exigir disciplina, conteúdo e atividade deixava o cadastro pesado para quem só quer anotar uma tarefa da matéria | UC05, classes, modelo de dados (`atividade.disciplina_id` obrigatória e `atividade.conteudo_id` opcional), migração para a versão 3 dos dados e testes (CT09, CT48 e CT50) |
| 03/11/2026 | RN02, RN13 | Excluir um conteúdo não exclui mais as atividades dele: elas continuam na disciplina, sem conteúdo. Excluir a disciplina continua levando as atividades junto | UC04 e testes (CT26 e CT49) |
| 03/11/2026 | RF10, RF11, RN14 | O progresso da disciplina soma todas as atividades dela, com ou sem conteúdo; o progresso por conteúdo continua para os conteúdos cadastrados | Testes (CT11 e CT48) |
| 03/11/2026 | RF31, RN21 | Requisito e regra novos: eventos do grupo (prova, apresentação, palestra, reunião ou outro), com página própria. Qualquer integrante cadastra; quem cadastrou e o organizador editam e excluem | UC14 novo, classes, modelo de dados (tabela `evento`) e testes (CT51) |
| 03/11/2026 | RF23 | O calendário mostra os eventos junto com as entregas, e o painel do dia cadastra um evento já com a data escolhida | UC13 e testes (CT52) |
| 03/11/2026 | RF19, RN15 | Os estilos de avatar caíram de cinco para dois: Rabisco (Croodles Neutral) e Ilustrado (Notionists). Quem usava um estilo que saiu passa para o Rabisco na migração | Testes (CT47 e CT50) |
| 03/11/2026 | RF26, RNF06 | A página inicial ganhou movimento: o topo entra animado, os blocos aparecem ao rolar, a prévia do sistema acompanha o mouse e cada recurso demonstra o que faz ao passar o mouse (no celular, quando aparece na tela). Quem pede menos movimento no sistema vê tudo parado | Testes (CT54) |
| 03/11/2026 | RF01 | A tela de acesso separa os grupos que já existem, numa coluna, da criação de um grupo novo, na outra | Testes (CT53) |
| 03/11/2026 | Textos do sistema | Os textos das telas foram reescritos sem travessão, com dois-pontos, parênteses ou frases separadas | Testes (CT55) |
| 03/11/2026 | RF32 | Requisito novo: formulário anônimo de feedback para os usuários de teste, aberto pela página inicial, pelo rodapé e pelo menu da conta | Testes (CT56) |
| 03/11/2026 | Docs. 05, 06, 07, 08, 10 a 16, diagramas, modelo de dados e protótipos | Escopo, requisitos e regras novos; caso de uso de eventos; matriz com RF31, RF32 e RN21; tarefas T66 a T73; arquitetura com eventos e a versão 3 dos dados; casos de teste CT48 a CT56 e nova execução completa; telas recapturadas | Exigência do manual |

---

## 2º bimestre: revisão de 08/11/2026

Com o banco de dados, o acesso com conta e o convite implementados para a entrega de 27/11, a equipe revisou os documentos para descrever o sistema como ele ficou. A equipe pediu que o sistema continuasse podendo ser conhecido sem conta e ganhasse um tutorial opcional. **Nenhum requisito ou regra foi removido ou renumerado**; os novos foram acrescentados ao final de cada tabela.

| Data | Item | Alteração e motivo | Impacto |
|---|---|---|---|
| 08/11/2026 | RF27, RF09 | O acesso com conta foi detalhado: e-mail e senha ou conta Google, os grupos da conta na tela de acesso e quem entrou reconhecido como o membro vinculado à conta. Sair da conta entrou junto com o encerramento da sessão do grupo | UC15 novo, UC01, classes, modelo de dados (`membro.id_usuario`) e testes (CC01, CC02 e CC09) |
| 08/11/2026 | RF28, RN22 | O convite foi detalhado: só o organizador gera; código de 8 caracteres e link, válidos por 7 dias; quem entra fica como participante, e o cadastro feito antes pelo organizador com o mesmo e-mail é vinculado à conta | UC16 novo, modelo de dados (tabela `convite`) e testes (CC04 a CC06) |
| 08/11/2026 | RF12, RN23 | O histórico de progresso é mostrado na tela de cada disciplina, e não no painel: uma linha por disciplina é legível, e cinco linhas juntas no painel não seriam. A regra nova define quando o banco grava o registro do dia | UC08, modelo de dados (tabela `progresso_historico`) e testes (CC03) |
| 08/11/2026 | RF20 | A carga de dados de exemplo passou a fazer parte do modo de demonstração, em que o sistema é usado sem conta, com os dados no navegador | UC12 e testes (CC09 e a execução completa no modo de demonstração) |
| 08/11/2026 | RF33 | Requisito novo, pedido da equipe: tutorial opcional que apresenta as telas principais, sugerido no painel e disponível no menu da conta | Testes |
| 08/11/2026 | RNF02, RNF11 | Com conta, os dados do grupo aparecem iguais em qualquer aparelho. O requisito novo de segurança registra que as regras de acesso valem no banco, e não só nas telas | Arquitetura, script do banco e verificações do banco (`05-verificacoes.sql`) |
| 08/11/2026 | Doc. 05 | As restrições de persistência, acesso e integração descrevem o sistema com o banco e o modo de demonstração | Nenhum |
| 08/11/2026 | Modelo de dados | O script de criação passou a ser o do PostgreSQL do Supabase, com identificadores UUID, regras de acesso por linha, gatilhos para as regras que dependem de quem está conectado, a tabela `convite` e o espaço das fotos | Docs. do banco, diagrama de classes e arquitetura |
| 08/11/2026 | Docs. 05 a 16, diagramas, modelo de dados e protótipos | Requisitos, regras e casos de uso novos; matriz com RF27, RF28, RF33, RN22 e RN23; tarefas T74 a T77; arquitetura com o Supabase; casos de teste do modo com conta; telas de acesso, convite, evolução e tutorial | Exigência do manual |

---

## Pendência registrada

| Item | Situação |
|---|---|
| Persistência em banco de dados relacional | Resolvida para 27/11. A Entrega 2 apresentou o modelo conceitual, o modelo lógico e o dicionário de dados; até 06/11 a implementação guardava os dados no navegador, replicando a estrutura do modelo lógico. Com a T46 e a T47, os dados com conta passaram para o PostgreSQL do Supabase, e o navegador ficou só para o modo de demonstração. |

---

### Navegação

[⬅ Anterior: Regras de Negócio](08-regras-de-negocio.md) · [Índice](../README.md) · [Próximo: Casos de Uso ➡](10-casos-de-uso.md)
