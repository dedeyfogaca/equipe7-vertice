# Telas e Navegação

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Entrega 3 · Protótipos e MVP · Equipe 7 · atualizado em 08/11/2026

---

Este documento reúne as telas do Vértice em três momentos: as telas que entraram para a **entrega final de 27/11**, com o banco de dados, o acesso com conta e o convite; as da **versão 2**, implementadas para a entrega de 06/11 com a nova identidade visual, que continuam valendo; e o **protótipo do MVP**, feito na Entrega 3, que orientou a primeira versão do código.

---

## Entrega final: 27/11/2026

As telas da versão 2, mais abaixo, continuam as mesmas. Para 27/11 entraram as telas do acesso com conta e do convite, a evolução do progresso na tela da disciplina e o tutorial. Em tamanho original, estão em [`telas-v2/`](telas-v2/).

| Requisito | Funcionalidade | Tela | Endereço | Perfil que utiliza |
|---|---|---|---|---|
| RF27, RF20 | Entrar com e-mail e senha ou com o Google, criar conta, ou experimentar sem conta | Login | `/entrar` | Qualquer visitante |
| RF01, RF28 | Os grupos da conta, o código de convite e a criação de grupo | Acesso com conta | `/entrar` | Qualquer estudante com conta |
| RF28 | Gerar o código e o link do convite | Convidar | janela, em Membros | Organizador |
| RF28 | Aceitar o convite pelo link | Login com convite | `/convite/:codigo` | Quem recebeu o convite |
| RF12 | Evolução do progresso dia a dia | Disciplina | `/disciplina/:id` | Ambos |
| RF33 | Tutorial em seis passos | Conheça o Vértice | janela, no Painel e no menu da conta | Ambos |

#### Login

![Tela de login](telas-v2/login.png)

Entrar ou criar conta, com o e-mail e a senha ou com a conta Google. Ao lado, "Experimentar sem conta" abre o modo de demonstração, com os dados só no navegador e o grupo de exemplo a um clique.

#### Acesso com conta

![Tela de acesso com conta](telas-v2/acesso-conta.png)

As mesmas duas colunas da versão 2. À esquerda, os grupos da conta e o campo do código de convite; à direita, a criação de um grupo, com o nome de quem cria já preenchido pelo nome da conta. No topo, o e-mail da conta e "Sair da conta". Não há mais "Quem é você": a conta já diz quem é a pessoa.

#### Convidar

![Janela do convite, com o código e o link](telas-v2/convite.png)

Em Membros, o organizador aciona "Convidar". O código e o link aparecem com botões para copiar e valem por 7 dias, para quantas pessoas o usarem (RN22). O participante não vê o botão.

#### Login com convite

![Tela de login aberta pelo link do convite](telas-v2/convite-link.png)

Quem abre o link vê o login com o aviso do convite. Depois de entrar ou criar a conta, cai direto no painel do grupo.

#### Evolução do progresso

![Tela da disciplina com a linha da evolução](telas-v2/evolucao.png)

Abaixo da barra de progresso da disciplina, a linha mostra o percentual dia a dia, em degraus, porque o progresso muda quando uma atividade é concluída. Passar o mouse ou o dedo mostra o dia e o valor. Com menos de dois dias de atividades, a tela explica que a linha aparece depois (RF12, RN23).

#### Tutorial

![Tutorial, no segundo passo](telas-v2/tutorial.png)

O painel convida na primeira visita, com um aviso que some ao abrir ou dispensar. São seis passos, um por seção, cada um com o atalho "Abrir esta tela". O menu da conta abre o tutorial de novo quando a pessoa quiser (RF33).

---

## Versão 2: entrega de 06/11/2026

As telas abaixo são capturas do próprio sistema, carregado com os dados de exemplo. Em tamanho original, estão em [`telas-v2/`](telas-v2/): no tema escuro, que é o padrão, em [`telas-v2/claro/`](telas-v2/claro/) no tema claro e em [`telas-v2/celular/`](telas-v2/celular/) na tela de celular.

### Levantamento das telas

| Requisito | Funcionalidade | Tela | Endereço | Perfil que utiliza |
|---|---|---|---|---|
| RF26 | Apresentação do produto | Início | `/` | Qualquer visitante |
| RF26 | História da equipe | Sobre nós | `/sobre` | Qualquer visitante |
| RF32 | Feedback dos usuários de teste | Início, seção Feedback | `/#feedback` | Qualquer visitante |
| RF01, RF20, RF29 | Escolher um grupo existente, numa coluna, ou criar um, com foto, na outra, e carregar os dados de exemplo | Acesso | `/entrar` | Qualquer estudante |
| RF01, RN07 | Dizer quem é dentro do grupo | Quem é você | `/entrar` | Qualquer estudante |
| RF06, RF16, RF21 | Painel do grupo | Painel | `/painel` | Ambos |
| RF07, RF23, RF31 | Calendário das entregas e dos eventos | Calendário | `/calendario` | Ambos |
| RF31 | Eventos do grupo, próximos e passados | Eventos | `/eventos` | Ambos cadastram; quem cadastrou e o organizador editam |
| RF31 | Cadastro e edição de evento | Novo evento | janela, em Eventos e no Calendário | Ambos |
| RF13, RF25 | Disciplinas e paleta de cores | Disciplinas | `/disciplinas` | Organizador gerencia; participante consulta |
| RF10, RF14 | Atividades, conteúdos (opcionais) e progresso | Disciplina | `/disciplina/:id` | Organizador gerencia; participante consulta |
| RF04 | Lista com busca e filtros | Atividades | `/atividades` | Ambos |
| RF03, RF07, RF22, RF30 | Cadastro e edição de atividade, com o calendário do prazo | Nova atividade | `/atividade/nova` | Ambos |
| RF05, RF15, RF17 | Detalhe e conclusão | Detalhe da atividade | `/atividade/:id` | Ambos |
| RF02, RF19, RF24 | Membros, foto de perfil e avatar em dois estilos | Membros | `/membros` | Organizador gerencia; participante edita o próprio perfil |
| RF16, RF17, RF18 | Experiência, ofensiva, conquistas e ranking | Conquistas | `/conquistas` | Ambos |
| RF24, RF29 | Enquadrar a foto de perfil ou do grupo | Ajustar foto | janela, em Membros e no Acesso | Ambos |
| RF01, RF29 | Nome, descrição e foto do grupo | Editar grupo | janela, no seletor de grupo | Organizador |
| RF30 | Cadastrar o conteúdo sem sair da atividade | Novo conteúdo | janela, em Nova atividade | Organizador |

### Mapa de navegação

![Mapa de navegação](../diagramas/png/mapa-navegacao-v2.png)

> Desenho-fonte: [`../diagramas/svg/mapa-navegacao-v2.svg`](../diagramas/svg/mapa-navegacao-v2.svg)

As páginas públicas levam ao acesso, e o acesso leva ao Painel. O mapa já mostra a versão final: o Entrar começa pelo login ou pela demonstração, e o link do convite também leva a ele. Dentro da sessão, a barra do topo liga o Painel às outras seis seções, e cada seção abre as telas que dependem dela. A linha violeta de volta ao Painel é a mesma do mapa do MVP: concluir uma atividade muda o progresso, a experiência, a ofensiva e as conquistas que o Painel mostra.

### As telas

#### Início

![Página inicial](telas-v2/inicio.png)

A página de apresentação: o que o Vértice mede, como funciona e o acesso. O topo entra animado, a prévia do sistema acompanha o mouse, os blocos aparecem ao rolar, e cada recurso demonstra o que faz quando o mouse passa por cima (no celular, quando aparece na tela). Quem pede menos movimento no sistema vê tudo parado. O botão do topo troca o tema.

![Seção de feedback na página inicial](telas-v2/feedback.png)

Perto do fim, a seção de feedback convida quem testou a responder um formulário anônimo, com as três perguntas que importam. O mesmo formulário abre pelo rodapé e pelo menu da conta, dentro do sistema (RF32).

#### Sobre nós

![Página Sobre nós](telas-v2/sobre.png)

A história da equipe, com os avatares em pixel art feitos pelo Andrey.

#### Acesso

![Tela de acesso](telas-v2/acesso.png)

Duas colunas: à esquerda, os grupos que já existem neste navegador e os dados de exemplo, a um clique; à direita, a criação de um grupo novo, em que quem cria informa o próprio nome e entra como organizador. A foto do grupo é opcional; sem ela, o grupo aparece com as iniciais do nome. No celular, os grupos vêm primeiro e a criação embaixo.

#### Quem é você

![Escolha de quem é a pessoa no grupo](telas-v2/quem-e-voce.png)

Num grupo com membros, a pessoa escolhe quem é. É essa escolha que decide o que ela pode gerenciar (RN07).

#### Abrindo o grupo

![A marca do Vértice no centro da tela, com o nome do grupo e o fio de progresso, enquanto o grupo abre](telas-v2/abrindo.png)

Depois da escolha, a tela escurece e a marca do Vértice aparece no centro, com o nome do grupo e um fio de progresso. A marca dá um terço de volta (o desenho tem três pontas, então para exatamente como começou) enquanto o fio se completa, e a tela se dissolve no painel. A passagem inteira leva pouco mais de um segundo: o bastante para perceber que o grupo abriu, sem fazer ninguém esperar. Fora daqui, a marca só dá uma volta rápida quando o mouse passa por cima dela; quem pede menos movimento no sistema vê só um esmaecer curto.

#### Painel

![Painel](telas-v2/painel.png)

No topo, a barra do sistema: a marca, o grupo, as sete seções, o tema e a conta de quem está usando. Embaixo, a saudação, as quatro situações como filtro, o aviso de entrega em feriado, as próximas entregas, os próximos eventos, o progresso por disciplina, o ritmo de quem está usando e os próximos feriados.

#### Calendário

![Calendário](telas-v2/calendario.png)

O mês com as entregas nas cores das disciplinas e os eventos do grupo, o filtro por disciplina e por eventos, e o painel do dia escolhido, com os atalhos para criar uma atividade ou um evento nele. As visões de semana e de lista ficam no topo.

#### Eventos

![Página de eventos](telas-v2/eventos.png)

Provas, apresentações, palestras e reuniões do grupo, separadas em próximos e passados e agrupadas por mês. Cada cartão mostra o dia, o horário, o local, a disciplina e quanto falta; se o dia é feriado, o cartão avisa. Quem cadastrou o evento, e o organizador, tem o menu para editar e excluir (RN21).

![Janela de novo evento](telas-v2/novo-evento.png)

Nome, tipo e dia são obrigatórios. Sem horário, o evento vale o dia todo; o fim precisa ser depois do início. A disciplina é opcional e dá a cor do evento no calendário.

#### Disciplinas

![Disciplinas](telas-v2/disciplinas.png)

Cada disciplina com a sua cor da paleta, o progresso e, quando o grupo usa, os conteúdos.

#### Disciplina

![Conteúdos de uma disciplina](telas-v2/disciplina.png)

As atividades da disciplina e, quando houver, os conteúdos em ordem, com o progresso de cada um. Atividades sem conteúdo aparecem na própria disciplina, e excluir um conteúdo não apaga as atividades dele.

#### Atividades

![Lista de atividades](telas-v2/atividades.png)

As situações como filtro, a busca, os filtros por disciplina, responsável e prazo, e a lista com peso, prazo e responsável de cada atividade. O círculo de concluir só aparece nas atividades de quem está usando (RN20).

![Filtro de disciplina aberto](telas-v2/atividades-filtro.png)

Os filtros seguem a identidade do sistema: cada disciplina aparece com a sua cor, cada responsável com a foto ou o avatar, e cada ordem com um símbolo. O campo repete a marca da opção escolhida.

#### Nova atividade

![Formulário de nova atividade](telas-v2/nova-atividade.png)

O formulário começa vazio e cobra só o que é obrigatório: título, disciplina, prazo e responsável. O conteúdo é opcional e começa em "Sem conteúdo". O peso tem cinco níveis, o prazo mostra o aviso de feriado, e o status só abre quando o responsável é quem está cadastrando (RN20).

![Calendário do campo de prazo](telas-v2/campo-data.png)

O prazo é escolhido num calendário com a identidade do sistema, que marca hoje, os feriados e o dia escolhido, e também funciona pelo teclado.

![Janela de novo conteúdo, aberta pelo formulário de atividade](telas-v2/novo-conteudo.png)

Para separar a atividade num conteúdo que ainda não existe, o organizador escolhe "Criar novo conteúdo" no fim da lista. A janela já vem na disciplina escolhida; ao cadastrar, o conteúdo fica selecionado, e nada do que foi preenchido se perde (RF30).

#### Detalhe e conclusão

![Detalhe da atividade logo depois de concluída](telas-v2/detalhe.png)

Logo depois de concluir: o progresso do conteúdo (ou da disciplina, se a atividade não tiver conteúdo) antes e depois, a experiência creditada e o aviso da conquista obtida.

#### Membros

![Membros](telas-v2/membros.png)

Cada membro com foto ou avatar, perfil, experiência, atividades e ofensiva. A exclusão do grupo fica no pé da tela, separada das ações do dia a dia, só para o organizador.

![Editor de foto](telas-v2/editor-foto.png)

![Formulário de membro com os dois estilos de avatar](telas-v2/membro-avatar.png)

Sem foto, vale o avatar: os dois estilos, Rabisco e Ilustrado, aparecem lado a lado com a mesma semente, e "Sortear outro" troca o desenho. O avatar é desenhado pelo próprio sistema, então aparece mesmo sem internet (RF19, RN15).

Ao escolher uma foto, abre o editor: arrastar posiciona a foto, o zoom vai até 4 vezes, e o sistema grava só o que está dentro da moldura, reduzido a 256 × 256 (RN19). Pelo teclado, as setas movem a foto e + e − mudam o zoom.

#### Editar grupo

![Janela de edição do grupo](telas-v2/editar-grupo.png)

No seletor de grupo da barra do topo, o organizador edita o nome, a descrição e a foto do grupo. A foto passa pelo mesmo editor, com moldura quadrada (RF29).

#### Conquistas

![Conquistas](telas-v2/conquistas.png)

Os números de quem está usando, as seis conquistas com o andamento das que faltam e o ranking do grupo.

### Tema claro

| Escuro | Claro |
|---|---|
| ![Painel no tema escuro](telas-v2/painel.png) | ![Painel no tema claro](telas-v2/claro/painel.png) |
| ![Início no tema escuro](telas-v2/inicio.png) | ![Início no tema claro](telas-v2/claro/inicio.png) |

A escolha do tema vale para todas as telas (as do sistema, as páginas públicas e a de acesso) e fica gravada no navegador (RF08). Os dois temas saem dos mesmos tokens de cor, definidos em `src/index.css`.

### No celular

| Início | Painel | Menu | Calendário | Eventos |
|---|---|---|---|---|
| ![Início no celular](telas-v2/celular/inicio.png) | ![Painel no celular](telas-v2/celular/painel.png) | ![Menu no celular](telas-v2/celular/menu.png) | ![Calendário no celular](telas-v2/celular/calendario.png) | ![Eventos no celular](telas-v2/celular/eventos.png) |

Na tela de celular, a barra do topo vira um menu que desce do topo, e os filtros da lista de atividades ficam recolhidos. No calendário, deslizar o dedo troca de mês. Nenhuma tela rola para os lados (RNF01).

### Decisões de interface da versão 2

| Decisão | Por quê |
|---|---|
| Seções numa barra no topo | Pedido da equipe: a barra lateral confundia. No topo ficam a marca, o grupo, as seis seções, o tema e a conta, e o conteúdo ganha a largura toda. No celular, o mesmo menu desce do topo. A barra lateral já tinha substituído o layout de três colunas, cuja coluna da direita terminava no meio da tela (D05) |
| Marca nova do Vértice | Arte da equipe, redesenhada com o traço mais grosso para continuar legível em 24 px. Ao abrir o grupo, aparece no centro e dá um terço de volta enquanto a tela se dissolve no painel; dá uma volta rápida quando o mouse passa por cima; fica parada para quem pede menos movimento no sistema |
| Avatares desenhados no próprio sistema, em dois estilos | O sorteio não mudava nada onde a imagem externa era bloqueada, como na versão de demonstração. Desenhado no navegador, o avatar sempre aparece, e a pessoa escolhe entre dois estilos (eram cinco até 03/11) |
| Fotos da equipe enquadradas pela cabeça | Na página inicial, o círculo cortava a cabeça; agora mostra a cabeça inteira e os ombros |
| Cores mantidas | Pedido da professora: o ciano da marca e o violeta da gamificação continuam os mesmos |
| Calendário como tela própria | Pedido da professora. O mês inteiro, com as entregas nas cores das disciplinas, no lugar do calendário pequeno do painel |
| Paleta de 18 cores | Pedido da professora por mais cores. As cores foram escolhidas para continuar legíveis nos dois temas, e o violeta da gamificação ficou fora da paleta |
| Foto enquadrada num editor e reduzida no navegador | Pedido da professora e da equipe. A pessoa ajusta a posição e o zoom, e o sistema grava só o que está na moldura: uma foto de celular de vários megabytes vira um arquivo de poucos KB, em 256 × 256 |
| Tema claro e escuro em todas as telas | Pedido da equipe. A escolha vale para o sistema inteiro, inclusive as páginas públicas e a tela de acesso (RF08) |
| Inter Tight no texto e JetBrains Mono nos números, servidas pelo próprio sistema | Visual mais profissional, e a tela não depende do Google Fonts para desenhar o texto |
| Diálogos, menus e dicas acessíveis | Componentes Radix: teclado, foco e leitor de tela já resolvidos |
| Situações como filtro e peso em anel | Decisões da Entrega 3 mantidas: as quatro situações filtram a lista, e o peso aparece como anel de cinco segmentos |
| Listas de escolha com a marca de cada opção | Pedido da equipe. Filtros e campos mostram a cor da disciplina, a foto do responsável e um símbolo para status, prioridade, perfil e ordem, como no resto do sistema |
| Calendário próprio no campo de prazo | O calendário do navegador muda de um navegador para outro e não conhece os feriados. O do sistema segue a identidade visual, marca hoje e os feriados e funciona pelo teclado |
| Formulário de atividade começa vazio | Pedido da equipe. Nada vem escolhido sem a pessoa decidir; só os campos obrigatórios são cobrados, e o que fica em branco recebe o padrão da regra: peso 1 e status "a fazer" |
| Conteúdo criado numa janela, sem sair da atividade | Pedido da equipe. Quem esquece de cadastrar o conteúdo antes não perde o que já preencheu |
| Mês que desliza no calendário | Pedido da equipe. A página nova entra pelo lado do movimento, e no celular basta deslizar o dedo; com "reduzir movimento" ativado no sistema operacional, a troca é imediata |
| Exclusão do grupo no pé da tela de Membros | Pedido da equipe. A ação que apaga tudo fica separada das ações do dia a dia |
| Só o responsável conclui a atividade | Pedido da equipe. A experiência e a ofensiva são de quem fez; quem não é o responsável vê a situação da atividade, mas não a altera (RN20) |

---

## Protótipo do MVP: Entrega 3

As oito telas abaixo são exatamente as necessárias para executar o [fluxo completo do MVP](../docs/14-mvp.md). Nenhuma tela de funcionalidade desejável foi prototipada: o protótipo mostra a primeira versão, não o sistema inteiro.

---

### Levantamento das telas

| Requisito | Funcionalidade | Tela | Perfil que utiliza |
|---|---|---|---|
| RF01, RF20 | Selecionar, criar grupo e carregar exemplo | Acesso | Qualquer estudante |
| RF13, RF14 | Primeiro acesso, com o grupo ainda vazio | Primeiro acesso | Estudante organizador |
| RF06, RF10, RF11 | Painel do grupo | Painel | Ambos |
| RF13, RF14 | Disciplinas e seus conteúdos | Disciplinas | Estudante organizador |
| RF03 | Cadastro de atividade | Nova atividade | Ambos |
| RF04, RF05 | Listagem com busca e filtros | Atividades | Ambos |
| RF05, RF15 | Detalhe e conclusão | Detalhe da atividade | Ambos |
| RF02, RF19 | Membros e avatar | Membros | Estudante organizador |

---

### Mapa de navegação

![Mapa de navegação do Vértice](../diagramas/png/mapa-navegacao.png)

> Desenho-fonte: [`../diagramas/svg/mapa-navegacao.svg`](../diagramas/svg/mapa-navegacao.svg)

O mapa tem duas regiões. Fora da sessão só existem duas telas, e nenhuma delas pede senha: o acesso é a escolha do grupo. Dentro da sessão, o Painel é a porta de entrada e a barra lateral liga qualquer tela a qualquer outra; a árvore do desenho mostra o caminho natural, não o único.

A linha violeta de volta ao Painel é o que fecha o ciclo do produto: concluir uma atividade altera o progresso que o Painel exibe. É por isso que ela existe no mapa, mesmo não sendo um clique do usuário.

---

### As telas

Todas exportadas do protótipo navegável. Os arquivos em alta resolução estão em [`telas/`](telas/).

#### Acesso

![Tela de acesso](telas/acesso.png)

Grupos salvos neste dispositivo, criação de grupo novo e a carga de dados de exemplo. Não há senha: o acesso é a escolha do grupo.

#### Primeiro acesso

![Tela de primeiro acesso](telas/vazio.png)

Grupo recém-criado. Em vez de um painel zerado, a tela ensina a ordem: disciplina, depois conteúdo, depois atividade.

#### Painel

![Tela de painel](telas/painel.png)

Progresso por disciplina no topo, as quatro situações como filtro e a lista já filtrada. À direita, o calendário com prazos, atrasos e feriados.

#### Disciplinas

![Tela de disciplinas](telas/disciplinas.png)

A disciplina abre e mostra o progresso de cada conteúdo. É onde se vê em que ponto da matéria o grupo está travado.

#### Nova atividade

![Tela de nova atividade](telas/nova-atividade.png)

Erro de validação no título, escala de peso de 1 a 5 e aviso de prazo em véspera de feriado. À direita, onde a atividade se encaixa e quanto a barra vai andar.

#### Atividades

![Tela de atividades](telas/atividades.png)

Busca, filtro por situação e painel lateral de filtros. Embaixo, o resultado: quantas atividades e o peso somado.

#### Detalhe e conclusão

![Tela de detalhe e conclusão](telas/detalhe.png)

O progresso antes e depois lado a lado, a experiência creditada e a conquista desbloqueada. É a tela onde executar uma atividade vira medida de aprendizagem.

#### Membros

![Tela de membros](telas/membros.png)

Cartões dos integrantes com experiência e dias seguidos, e o cadastro com sorteio de avatar. À direita, o que cada perfil pode fazer.

---

### Tema claro e escuro

O RF08 está no MVP e o protótipo demonstra os dois temas. O botão fica no rodapé da barra lateral, em todas as telas, e a escolha vale para a sessão inteira.

| Claro | Escuro |
|---|---|
| ![Painel no tema claro](telas/painel.png) | ![Painel no tema escuro](telas/escuro/painel.png) |

As duas versões saem dos **mesmos tokens**. Não há folha de estilo duplicada: o tema escuro só redefine as variáveis de cor, e todo componente acompanha. É por isso que trocar o tema não exige revisar tela por tela.

A gamificação muda de `#7C3AED` para `#A78BFA`: é a mesma cor, clareada para manter o contraste sobre o fundo escuro. O mesmo vale para o ciano, que sobe de `#0891B2` para `#22D3EE`.

Todas as oito telas estão nos dois temas em [`telas/`](telas/) e [`telas/escuro/`](telas/escuro/).

---

### Protótipo navegável

O arquivo [`navegavel/index.html`](navegavel/index.html) abre no navegador, sem instalar nada. As telas estão ligadas entre si: a barra lateral navega, os cartões abrem o detalhe, e os botões levam aos formulários.

```
prototipos/navegavel/
├── index.html          índice, com o caminho sugerido para a demonstração
├── acesso.html
├── vazio.html
├── painel.html
├── disciplinas.html
├── nova-atividade.html
├── atividades.html
├── detalhe.html
├── membros.html
├── base.css            tokens do design system, claro e escuro
├── ui.js               componentes compartilhados
└── fontes/             Manrope e JetBrains Mono, para abrir sem internet
```

O protótipo foi escrito com os mesmos tokens de cor e tipografia do `theme.js` da aplicação, e não numa ferramenta de desenho. A vantagem é que o que está no protótipo pode ser levado para o código como decisão já tomada: o peso é um anel de cinco segmentos, o violeta é `#7C3AED`, a coluna de navegação tem 232 pixels.

---

### Decisões de interface tomadas nesta entrega

| Decisão | Por quê |
|---|---|
| Layout de três colunas | A versão anterior centralizava o conteúdo e deixava as laterais vazias. Agora a coluna esquerda navega e a direita dá contexto: calendário no Painel, filtros nas Atividades |
| Situações viraram filtro | "A fazer", "Fazendo", "Concluídas" e "Atrasadas" eram apenas contadores. Clicar neles filtra a lista, que é o que o usuário já esperava que acontecesse |
| Feriados saíram da lista e foram para o calendário | Como bloco separado, ocupavam espaço das atividades. Como ponto no dia, informam sem competir |
| Peso à esquerda, em anel de cinco segmentos | Ao lado da prioridade, o peso era confundido com ela. O anel mostra "3 de 5" sem precisar de rótulo, e ao passar o mouse explica o efeito no progresso |
| Cor própria para a gamificação | Experiência e conquistas usavam o mesmo verde de "concluída". Violeta `#7C3AED` não ocupa nenhum outro papel no sistema |
| Tipografia em uma família | Havia três fontes simultâneas: serifada nos títulos, Space Grotesk no corpo e Space Mono em todos os rótulos. Manrope em peso variado carrega a mesma hierarquia com menos ruído |

Todas essas decisões foram registradas como a tarefa **T24** do [backlog](../docs/12-backlog.md) e aplicadas na construção do MVP. Na versão 2, parte delas foi revista: veja as [decisões da versão 2](#decisões-de-interface-da-versão-2).

---

### Navegação

[⬅ Anterior: Produto Mínimo Viável](../docs/14-mvp.md) · [Índice](../README.md)
