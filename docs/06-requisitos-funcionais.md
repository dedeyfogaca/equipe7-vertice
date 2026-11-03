# 06 · Requisitos Funcionais

> **Vértice** — Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 2 (revisão da Entrega 1), atualizado em 29/10/2026

---

| ID | Descrição | Prioridade | Dependência |
|---|---|---|---|
| **RF01** | O sistema deve permitir criar, editar, selecionar e excluir grupos de estudo. Quem cria o grupo informa o próprio nome e entra nele como o primeiro membro. | Alta | — |
| **RF02** | O sistema deve permitir cadastrar, editar e excluir os membros do grupo, informando nome, função, e-mail, perfil e foto de perfil ou avatar. Ao excluir um membro responsável por atividades, o sistema deve pedir quem passa a ser o responsável por elas. | Alta | RF01 |
| **RF03** | O sistema deve permitir cadastrar, editar e excluir atividades, informando título, descrição, conteúdo, prazo, peso, prioridade, status e responsável. Toda atividade deve ter um responsável. O formulário de cadastro começa sem valores escolhidos, e o prazo é escolhido num calendário que destaca a data atual, os fins de semana e os feriados. | Alta | RF01, RF02, RF14 |
| **RF04** | O sistema deve exibir a lista de atividades do grupo com busca por texto, filtros por status, responsável, disciplina e prazo, e ordenação, identificando cada disciplina pela sua cor e cada responsável pela sua foto ou avatar. | Alta | RF03 |
| **RF05** | O sistema deve exibir o detalhe de uma atividade e permitir que o responsável por ela altere o seu status. | Alta | RF03 |
| **RF06** | O sistema deve exibir um painel com o total de atividades por status, a quantidade de atividades atrasadas e as próximas entregas. | Alta | RF03 |
| **RF07** | O sistema deve sinalizar quando o prazo de uma atividade coincidir com um feriado nacional. | Baixa | RF03 |
| **RF08** | O sistema deve permitir alternar entre tema claro e escuro em todas as telas, inclusive as páginas públicas, mantendo a escolha entre sessões. | Baixa | — |
| **RF09** | O sistema deve encerrar a sessão do grupo mediante ação do usuário. | Média | RF01 |
| **RF10** | O sistema deve calcular e exibir o percentual de progresso de cada conteúdo a partir do peso das atividades concluídas. | Alta | RF03 |
| **RF11** | O sistema deve exibir uma barra de progresso por disciplina, agregando o progresso dos conteúdos vinculados. | Alta | RF10 |
| **RF12** | O sistema deve registrar o histórico de progresso ao longo do tempo e apresentá-lo no painel de desempenho. | Média | RF10 |
| **RF13** | O sistema deve permitir cadastrar, editar e excluir disciplinas do grupo. | Alta | RF01 |
| **RF14** | O sistema deve permitir cadastrar, editar e excluir conteúdos vinculados a uma disciplina. | Alta | RF13 |
| **RF15** | O sistema deve atribuir pontos de experiência ao responsável quando uma atividade for concluída, proporcionalmente ao peso da atividade. | Média | RF03 |
| **RF16** | O sistema deve calcular e exibir a ofensiva do estudante, correspondente ao número de dias consecutivos com pelo menos uma atividade concluída. | Média | RF15 |
| **RF17** | O sistema deve conceder conquistas ao estudante quando ele atingir os marcos previstos e exibi-las no seu perfil. | Média | RF15 |
| **RF18** | O sistema deve exibir um painel de desempenho com a experiência acumulada, a ofensiva atual e as conquistas de cada integrante do grupo. | Média | RF15, RF16, RF17 |
| **RF19** | O sistema deve gerar o avatar de cada membro a partir de uma semente registrada no cadastro, no estilo de desenho escolhido entre cinco, e permitir sortear uma semente nova a qualquer momento. | Baixa | RF02 |
| **RF20** | O sistema deve permitir carregar um conjunto de dados de exemplo, criando um grupo de demonstração já preenchido e iniciando a sessão nele. | Baixa | RF01 |
| **RF21** | O sistema deve exibir no painel a relação dos próximos feriados nacionais a partir da data atual. | Baixa | RF06, RF07 |
| **RF22** | O sistema deve sinalizar quando o prazo de uma atividade coincidir com sábado ou domingo. | Baixa | RF03 |
| **RF23** | O sistema deve exibir um calendário com as entregas de cada dia nas cores das disciplinas e os feriados nacionais, nas visões de mês, semana e lista, com transição animada ao trocar de mês ou de semana — também pelo gesto de deslizar em telas de toque —, e permitir iniciar o cadastro de uma atividade a partir de um dia. | Alta | RF03, RF07, RF25 |
| **RF24** | O sistema deve permitir enviar uma foto de perfil para o membro, ajustando o enquadramento (posição e zoom) antes de salvar, exibida no lugar do avatar enquanto estiver cadastrada. | Média | RF02, RF19 |
| **RF25** | O sistema deve permitir escolher a cor de cada disciplina numa paleta de cores legíveis nos temas claro e escuro. | Média | RF13 |
| **RF26** | O sistema deve oferecer páginas públicas de apresentação: a página inicial do produto e a página Sobre nós, com a equipe. | Baixa | — |
| **RF27** | O sistema deve permitir o acesso com conta Google ou com e-mail, vinculando o membro do grupo à conta de quem entrou. | Alta | RF01, RF02 |
| **RF28** | O sistema deve permitir convidar uma pessoa para o grupo por um link ou por um código de acesso. | Alta | RF27 |
| **RF29** | O sistema deve permitir definir uma foto para o grupo, na criação ou na edição, ajustando o enquadramento antes de salvar; sem foto, o grupo é identificado pelas iniciais do seu nome. | Baixa | RF01 |
| **RF30** | O sistema deve permitir cadastrar um conteúdo a partir do formulário de atividade, na disciplina escolhida, sem perder os dados já preenchidos, e deixar o conteúdo novo selecionado. | Média | RF03, RF14 |

---

### Navegação

[⬅ Anterior: Escopo](05-escopo.md) · [Índice](../README.md) · [Próximo: Requisitos Não Funcionais ➡](07-requisitos-nao-funcionais.md)
