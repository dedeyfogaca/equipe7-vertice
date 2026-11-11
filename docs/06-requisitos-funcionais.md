# 06 · Requisitos Funcionais

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 2 (revisão da Entrega 1), atualizado em 11/11/2026

---

| ID | Descrição | Prioridade | Dependência |
|---|---|---|---|
| **RF01** | O sistema deve permitir criar, editar, selecionar e excluir grupos de estudo sem sair do sistema: o seletor de espaço, no topo, lista o espaço pessoal e os grupos da pessoa e oferece criar um grupo e entrar com um código de convite. Quem cria o grupo entra nele como o primeiro membro, com o nome do seu perfil. | Alta | RF34 |
| **RF02** | O sistema deve permitir cadastrar, editar e excluir os membros do grupo, informando nome, função, e-mail, perfil e foto de perfil ou avatar. Ao excluir um membro responsável por atividades, o sistema deve pedir quem passa a ser o responsável por elas. | Alta | RF01 |
| **RF03** | O sistema deve permitir cadastrar, editar e excluir atividades, informando onde a atividade fica (o espaço pessoal ou um dos grupos), título, descrição, disciplina, conteúdo (opcional), prazo, peso, prioridade, status e responsável. Nos grupos, toda atividade tem uma disciplina; no espaço pessoal, a disciplina é opcional e a responsável é a própria pessoa. O responsável pode ficar "A definir" (RF38). O formulário de cadastro começa sem valores escolhidos, o prazo é escolhido num calendário que destaca a data atual, os fins de semana e os feriados, e, depois de cadastrar, o sistema volta para a tela de onde a pessoa veio. | Alta | RF01, RF02, RF13, RF34 |
| **RF04** | O sistema deve exibir a lista de atividades do grupo com busca por texto, filtros por status, responsável (inclusive "A definir"), disciplina e prazo, e ordenação, identificando cada disciplina pela sua cor e cada responsável pela sua foto ou avatar. No espaço pessoal, a lista reúne as atividades pessoais e as dos grupos que estão com a pessoa, com o nome do grupo de cada uma. | Alta | RF03, RF34 |
| **RF05** | O sistema deve exibir o detalhe de uma atividade e permitir que o responsável por ela altere o seu status. A conclusão pelo detalhe é uma ação discreta, e o aviso que a confirma oferece desfazê-la. | Alta | RF03 |
| **RF06** | O sistema deve exibir um painel com o total de atividades por status, a quantidade de atividades atrasadas e as próximas entregas. | Alta | RF03 |
| **RF07** | O sistema deve sinalizar quando o prazo de uma atividade coincidir com um feriado nacional. | Baixa | RF03 |
| **RF08** | O sistema deve permitir alternar entre tema claro e escuro em todas as telas, inclusive as páginas públicas, mantendo a escolha entre sessões. | Baixa | Nenhuma |
| **RF09** | O sistema deve permitir voltar do grupo para o espaço pessoal e, mediante ação do usuário, sair da conta ou da demonstração. | Média | RF01, RF27, RF34 |
| **RF10** | O sistema deve calcular e exibir o percentual de progresso de cada conteúdo cadastrado a partir do peso das atividades concluídas. | Alta | RF03 |
| **RF11** | O sistema deve exibir uma barra de progresso por disciplina, agregando todas as atividades da disciplina, estejam elas num conteúdo ou não. | Alta | RF10 |
| **RF12** | O sistema deve registrar o histórico do progresso de cada disciplina ao longo do tempo e apresentá-lo na tela da disciplina como uma linha da evolução dia a dia. | Média | RF11 |
| **RF13** | O sistema deve permitir cadastrar, editar e excluir disciplinas do grupo. | Alta | RF01 |
| **RF14** | O sistema deve permitir cadastrar, editar e excluir conteúdos vinculados a uma disciplina. O conteúdo é opcional: serve para o grupo que quer separar a disciplina por assunto. | Alta | RF13 |
| **RF15** | O sistema deve atribuir pontos de experiência ao responsável quando uma atividade for concluída, proporcionalmente ao peso da atividade. | Média | RF03 |
| **RF16** | O sistema deve calcular e exibir a ofensiva do estudante, correspondente ao número de dias consecutivos com pelo menos uma atividade concluída. | Média | RF15 |
| **RF17** | O sistema deve conceder conquistas ao estudante quando ele atingir os marcos previstos, exibi-las no seu perfil e retirá-las quando a conclusão que as sustentava for desfeita, avisando a pessoa nos dois casos. | Média | RF15 |
| **RF18** | O sistema deve exibir um painel de desempenho com a experiência acumulada, a ofensiva atual e as conquistas de cada integrante do grupo. | Média | RF15, RF16, RF17 |
| **RF19** | O sistema deve gerar o avatar de cada membro a partir de uma semente registrada no cadastro, no estilo de desenho escolhido entre dois (Rabisco e Ilustrado), e permitir sortear uma semente nova a qualquer momento. | Baixa | RF02 |
| **RF20** | O sistema deve permitir conhecê-lo sem conta, num modo de demonstração com os dados guardados no navegador, em que a pessoa informa só o nome e ganha um espaço pessoal, e carregar nele um conjunto de dados de exemplo: tarefas no espaço pessoal e um grupo já preenchido, em que a pessoa entra como um dos membros. | Baixa | RF01, RF34 |
| **RF21** | O sistema deve exibir no painel a relação dos próximos feriados nacionais a partir da data atual. | Baixa | RF06, RF07 |
| **RF22** | O sistema deve sinalizar quando o prazo de uma atividade coincidir com sábado ou domingo. | Baixa | RF03 |
| **RF23** | O sistema deve exibir um calendário com as entregas de cada dia nas cores das disciplinas, os eventos do grupo e os feriados nacionais, nas visões de mês, semana e lista, com transição animada ao trocar de mês ou de semana (também pelo gesto de deslizar em telas de toque), e permitir iniciar o cadastro de uma atividade ou de um evento a partir de um dia. Uma barra de filtros permite mostrar ou esconder atividades, eventos e feriados, escolher a disciplina, o grupo (no espaço pessoal) ou só as atividades da pessoa (no grupo), resume o que está sendo mostrado e limpa os filtros de uma vez. | Alta | RF03, RF07, RF25, RF31 |
| **RF24** | O sistema deve permitir enviar uma foto de perfil, ajustando o enquadramento (posição e zoom) antes de salvar, exibida no lugar do avatar enquanto estiver cadastrada. A foto de quem entrou com conta é a do perfil (RF35); o organizador define a foto só do membro que ainda não tem conta vinculada. | Média | RF02, RF19, RF35 |
| **RF25** | O sistema deve permitir escolher a cor de cada disciplina numa paleta de cores legíveis nos temas claro e escuro. | Média | RF13 |
| **RF26** | O sistema deve oferecer páginas públicas de apresentação: a página inicial do produto, com elementos que reagem à rolagem e ao mouse, e a página Sobre nós, com a equipe. | Baixa | Nenhuma |
| **RF27** | O sistema deve permitir criar uma conta e entrar com e-mail e senha ou com a conta Google, levar quem entrou ao seu espaço pessoal, mostrar os grupos de que a conta participa e reconhecer a pessoa, em cada grupo, como o membro vinculado a ela. | Alta | RF01, RF02, RF34 |
| **RF28** | O sistema deve permitir que o organizador gere um convite para o grupo, com um código de acesso e um link, e que quem o recebe entre no grupo com a própria conta, pelo link ou digitando o código. | Alta | RF27 |
| **RF29** | O sistema deve permitir definir uma foto para o grupo, na criação ou na edição, ajustando o enquadramento antes de salvar; sem foto, o grupo é identificado pelas iniciais do seu nome. | Baixa | RF01 |
| **RF30** | O sistema deve permitir cadastrar um conteúdo a partir do formulário de atividade, na disciplina escolhida, sem perder os dados já preenchidos, e deixar o conteúdo novo selecionado. | Média | RF03, RF14 |
| **RF31** | O sistema deve permitir cadastrar, editar e excluir eventos (prova, apresentação, palestra, reunião ou outro), no espaço pessoal ou num grupo, com nome, tipo, dia, ou período de vários dias (do dia X ao dia Y), horário de início e fim opcionais, local, disciplina opcional e descrição, e exibi-los numa página própria, separada em próximos e passados e filtrável por disciplina, no painel e no calendário, em cada dia do período. | Alta | RF01, RF13, RF23, RF34 |
| **RF32** | O sistema deve oferecer, na página inicial e no menu da conta, o acesso a um formulário anônimo de feedback para os usuários de teste. | Baixa | RF26 |
| **RF33** | O sistema deve oferecer um tutorial opcional que apresente as telas principais em passos, sugerido no painel na primeira visita e disponível a qualquer momento no menu da conta. | Baixa | RF06 |
| **RF34** | O sistema deve oferecer a cada pessoa um espaço pessoal, aberto ao entrar, onde ela cadastra atividades e eventos só dela e vê, num lugar só, o que está com ela em todos os grupos: as atividades sob sua responsabilidade, os eventos dos grupos, a experiência, a ofensiva e as conquistas somadas e o atalho para cada grupo. O espaço pessoal é criado no primeiro acesso, inclusive para as contas que já existiam, sem alterar os dados dos grupos. | Alta | RF01, RF27 |
| **RF35** | O sistema deve oferecer a tela Meu perfil, onde a pessoa define o nome, o avatar e a foto que a identificam em todos os grupos de que participa, de uma vez. | Alta | RF19, RF24, RF34 |
| **RF36** | O sistema deve enviar, uma vez por dia, um e-mail de lembrete a quem entrou com conta, com as atividades sob sua responsabilidade que vencem nos próximos dias ou estão atrasadas, e permitir desligar o lembrete em Meu perfil. | Média | RF03, RF27, RF35 |
| **RF37** | O sistema deve permitir cadastrar várias atividades de uma vez, numa tabela em que cada linha é uma atividade, com a lista de títulos colada de uma vez e uma linha "Para todas" que aplica a mesma disciplina, prazo, peso ou responsável a todas; e permitir que o organizador selecione várias atividades na lista e troque o responsável de todas de uma vez. | Média | RF03, RF04 |
| **RF38** | O sistema deve permitir cadastrar uma atividade do grupo com o responsável "A definir", visível para todos os integrantes, e oferecer a cada um o botão Assumir, que torna a pessoa responsável por ela. | Média | RF03, RF05 |

---

### Navegação

[⬅ Anterior: Escopo](05-escopo.md) · [Índice](../README.md) · [Próximo: Requisitos Não Funcionais ➡](07-requisitos-nao-funcionais.md)
