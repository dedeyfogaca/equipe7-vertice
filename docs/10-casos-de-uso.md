# 10 · Especificação dos Casos de Uso

> **Vértice** — Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 2, atualizado em 29/10/2026

---

Estão especificados a seguir os nove casos de uso prioritários. O [diagrama de casos de uso](../diagramas/01-casos-de-uso.md) apresenta os treze casos identificados e sua correspondência com os requisitos.

---

## UC01 · Gerenciar grupo de estudo

| | |
|---|---|
| **Ator principal** | Estudante Organizador |
| **Objetivo** | Criar, editar, selecionar ou excluir um grupo de estudo, definindo o contexto de trabalho da sessão |
| **Pré-condições** | Nenhuma. É o ponto de entrada do sistema |
| **Requisitos** | RF01, RF26, RF27, RF29 |
| **Regras** | RN01, RN02, RN07, RN19 |

**Fluxo principal**

1. O estudante abre a página inicial do Vértice e escolhe entrar (RF26).
2. O sistema exibe a tela de acesso, com os grupos já cadastrados no dispositivo.
3. O estudante escolhe criar um grupo novo.
4. O sistema apresenta o formulário com o nome do grupo, o nome de quem cria, a descrição e a foto do grupo.
5. O estudante preenche o nome do grupo e o próprio nome e, se quiser, envia uma foto do grupo e a enquadra no editor (RF29, RN19). Depois, confirma.
6. O sistema valida os dados, cria o grupo, registra a data de criação e cadastra quem criou como o primeiro membro, com perfil de organizador (RN07).
7. O sistema abre a sessão com o grupo criado e a pessoa identificada e direciona o estudante ao painel.

**Fluxos alternativos**

- **3A — Selecionar grupo existente:** o estudante escolhe um grupo da lista e, em seguida, o próprio nome entre os membros dele; o sistema abre a sessão e segue para o passo 7. Num grupo de versão anterior que ainda não tem membros, a sessão abre sem a escolha do nome, e o primeiro membro cadastrado entra como organizador (RN07).
- **3B — Excluir grupo:** no pé da tela de membros, o organizador escolhe excluir o grupo; o sistema pede confirmação, informando que membros, disciplinas, conteúdos e atividades serão removidos junto (RN02). Confirmada a exclusão, o sistema remove tudo em cascata, inclusive as conquistas, encerra a sessão e volta à tela de acesso.
- **3C — Editar grupo:** no seletor de grupos da barra do topo, o organizador escolhe "Editar grupo"; o sistema abre o formulário com nome, descrição e foto. O organizador altera os dados, troca a foto ou a remove, e confirma. Sem foto, o grupo volta a ser identificado pelas iniciais do nome (RF01, RF29, RN07). O participante não vê essa opção.
- **6A — Nome inválido:** se o nome do grupo ou o nome de quem cria estiver vazio, o sistema exibe a mensagem de erro em cada campo e mantém o formulário aberto (RNF03).
- **2A — Nenhum grupo cadastrado:** o sistema exibe mensagem orientativa e oferece a criação do primeiro grupo (RNF07).

**Pós-condições**

- Existe um grupo ativo na sessão, com a pessoa identificada, e o estudante tem acesso às telas privadas do sistema.

**Evolução prevista para 27/11 (RF27):** o acesso passa a começar pela conta Google ou pelo e-mail, e a pessoa é reconhecida como o membro vinculado à conta, sem precisar escolher o próprio nome. Este caso de uso será revisto quando a funcionalidade for implementada.

---

## UC02 · Gerenciar membros

| | |
|---|---|
| **Ator principal** | Estudante Organizador |
| **Atores secundários** | Nenhum |
| **Objetivo** | Manter a relação de quem participa do grupo de estudo |
| **Pré-condições** | Existe um grupo ativo na sessão e o usuário atua como organizador |
| **Requisitos** | RF02, RF19, RF24, RF28 |
| **Regras** | RN02, RN03, RN07, RN15, RN19 |

**Fluxo principal**

1. O organizador acessa a tela de membros.
2. O sistema exibe os membros já cadastrados, cada um com sua foto ou avatar, nome, função, perfil, experiência e ofensiva.
3. O organizador solicita o cadastro de um novo membro.
4. O sistema abre o formulário com uma semente de avatar já sorteada e apresenta o avatar nos cinco estilos de desenho, com o primeiro escolhido (RF19, RN15).
5. O organizador informa nome, função, e-mail e perfil e, se quiser, envia uma foto de perfil (RF24). O sistema abre o editor de foto, em que o organizador arrasta a imagem e ajusta o zoom até enquadrá-la na moldura; ao aplicar, a área enquadrada é reduzida antes de ser gravada (RN19).
6. O organizador pode escolher outro estilo e sortear outra semente quantas vezes quiser, até chegar a um avatar que lhe agrade; havendo foto, é ela que aparece, e o avatar escolhido fica guardado para quando a foto sair (RF19).
7. O organizador confirma o cadastro.
8. O sistema valida os dados, grava o membro e atualiza a relação.

**Fluxos alternativos**

- **5A — Nome vazio ou e-mail inválido:** o sistema exibe a mensagem de erro no campo e mantém o formulário aberto (RNF03).
- **5B — Arquivo que não é imagem, ou maior que 8 MB:** o sistema recusa o arquivo com mensagem e mantém o avatar (RN19).
- **5C — Desistir do enquadramento:** o organizador fecha o editor sem aplicar; a foto anterior, ou o avatar, continua no cadastro.
- **8A — Exclusão de membro responsável por atividades:** o sistema informa quantas atividades são dele e só confirma a exclusão depois de o organizador escolher outro membro do grupo para assumi-las; as atividades passam para o membro escolhido (RN02).
- **8B — Último organizador:** o sistema não permite remover nem rebaixar o último organizador do grupo (RN07).
- **1A — Participante:** o participante vê a relação, mas não cadastra nem remove membros; ele edita apenas o próprio cadastro, sem poder mudar o próprio perfil (RN07).

**Pós-condições**

- O membro passa a estar disponível para ser responsável por atividades (RN03).

**Evolução prevista para 27/11 (RF28):** o organizador convida a pessoa por um link ou por um código de acesso, e ela entra no grupo com a própria conta.

---

## UC03 · Gerenciar disciplinas

| | |
|---|---|
| **Ator principal** | Estudante Organizador |
| **Objetivo** | Manter a lista de disciplinas que o grupo acompanha, para que as atividades possam ser ancoradas nelas |
| **Pré-condições** | Existe um grupo ativo na sessão e o usuário possui perfil de organizador |
| **Requisitos** | RF13, RF25 |
| **Regras** | RN01, RN02, RN07, RN18 |

**Fluxo principal**

1. O organizador acessa a tela de disciplinas.
2. O sistema lista as disciplinas do grupo ativo com o respectivo percentual de progresso.
3. O organizador escolhe cadastrar uma disciplina.
4. O sistema apresenta o formulário com o nome e a paleta de 18 cores, já com uma cor ainda não usada pelo grupo selecionada (RF25, RN18).
5. O organizador preenche o nome, mantém ou troca a cor e confirma.
6. O sistema valida, grava a disciplina vinculada ao grupo ativo e atualiza a lista.

**Fluxos alternativos**

- **3A — Editar disciplina:** o organizador seleciona uma disciplina existente; o sistema abre o formulário preenchido e grava as alterações no passo 6.
- **3B — Excluir disciplina:** o sistema pede confirmação informando que os conteúdos e as atividades vinculadas serão removidos (RN02, RN13). Confirmada, remove em cascata.
- **5A — Nome vazio ou duplicado no grupo:** o sistema exibe a mensagem de erro no campo e mantém o formulário aberto (RNF03).
- **2A — Nenhuma disciplina cadastrada:** o sistema exibe mensagem orientativa convidando ao primeiro cadastro (RNF07).
- **1A — Usuário sem perfil de organizador:** o sistema não oferece as ações de cadastro, edição e exclusão (RN07).

**Pós-condições**

- A disciplina está disponível para receber conteúdos e, por meio deles, atividades.

---

## UC05 · Cadastrar atividade

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Registrar uma atividade de estudo vinculada a um conteúdo, com prazo, peso e responsável |
| **Pré-condições** | Existe um grupo ativo, com ao menos um membro e ao menos uma disciplina cadastrados; para o participante, também ao menos um conteúdo |
| **Requisitos** | RF03, RF07, RF22, RF23, RF30 |
| **Regras** | RN03, RN04, RN06, RN07, RN09, RN13, RN20 |

**Fluxo principal**

1. O estudante aciona a criação de uma atividade.
2. O sistema apresenta o formulário com título, descrição, disciplina, conteúdo, prazo, peso, prioridade, status e responsável, todos sem valor escolhido: cada campo mostra só um exemplo do que preencher (RF03).
3. O estudante seleciona a disciplina, reconhecida na lista pela sua cor.
4. O sistema filtra a lista de conteúdos, exibindo apenas os da disciplina escolhida (RN13).
5. O estudante preenche os demais campos — o prazo é escolhido no calendário do campo, que destaca hoje, os fins de semana e os feriados — e confirma.
6. O sistema valida os dados obrigatórios: título com no mínimo três caracteres, prazo com data válida, conteúdo selecionado e responsável (RN06, RN13).
7. O sistema aplica os valores padrão: status "a fazer" quando não informado (RN04) e peso 1 quando não informado (RN09).
8. O sistema grava a atividade, registra a data de criação e exibe o detalhe da atividade criada.

**Fluxos alternativos**

- **6A — Dados inválidos:** o sistema destaca cada campo com problema e exibe a mensagem específica, mantendo o que já foi preenchido (RNF03).
- **5A — Responsável não informado:** o sistema recusa a atividade e informa no campo que é preciso escolher o responsável (RN06).
- **5B — Responsável fora do grupo:** o sistema não oferece essa opção na lista, que contém apenas os membros do grupo ativo (RN03).
- **4A — Conteúdo ainda não cadastrado:** o organizador escolhe "Criar novo conteúdo" no fim da lista de conteúdos — ou o atalho da dica do campo, quando a disciplina ainda não tem nenhum. O sistema abre a janela de cadastro de conteúdo na disciplina escolhida; ao confirmar, grava o conteúdo, fecha a janela e deixa o conteúdo novo selecionado, sem perder nada do que já estava preenchido (RF30, RN13). O participante não vê essa opção (RN07).
- **5D — Status de outra pessoa:** só quem é o responsável escolhe o status. Se o responsável escolhido for outra pessoa, o campo de status fica travado, com a explicação, e a atividade é gravada como "a fazer" (RN20).
- **5C — Prazo em feriado nacional ou em fim de semana:** o sistema avisa abaixo do campo de prazo, grava a atividade normalmente e mantém a sinalização no detalhe dela (RF07, RF22).
- **1A — Nenhuma disciplina cadastrada:** o sistema informa que é preciso cadastrar uma disciplina antes e oferece o atalho para essa tela. Havendo disciplina sem conteúdo, o organizador segue o fluxo 4A, e o participante é orientado a pedir o conteúdo ao organizador.
- **1C — Editar atividade:** o responsável e o organizador editam a atividade pelo mesmo formulário; o participante não edita as atividades dos outros, nem pelo endereço da tela de edição (RN07). Quando quem edita não é o responsável, o status fica travado (RN20).
- **1B — A partir de um dia do calendário:** o estudante escolhe um dia no calendário e aciona a criação; o formulário já vem com o prazo desse dia (RF23).

**Pós-condições**

- A atividade existe, aparece nas listagens, no painel e no calendário, e passa a compor o peso total do seu conteúdo para efeito de cálculo de progresso (RN08).

---

## UC07 · Concluir atividade

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Marcar uma atividade como concluída e receber o retorno correspondente em progresso, experiência, ofensiva e conquistas |
| **Pré-condições** | Existe um grupo ativo, a atividade está cadastrada com status diferente de "concluído" e o estudante é o responsável por ela |
| **Requisitos** | RF05, RF15, RF16, RF17 |
| **Regras** | RN04, RN08, RN10, RN11, RN12, RN14, RN20 |

**Fluxo principal**

1. O estudante abre o detalhe da atividade ou usa a alteração rápida de status na listagem, que só aparece nas atividades sob a responsabilidade dele (RN20).
2. O estudante seleciona o status "concluído".
3. O sistema grava o novo status e registra a data de conclusão.
4. O sistema credita ao responsável a experiência equivalente ao peso multiplicado por 10 (RN10).
5. O sistema recalcula o progresso do conteúdo da atividade (RN08) e o progresso da disciplina correspondente (RN14).
6. O sistema recalcula a ofensiva do responsável a partir das datas de conclusão (RN11).
7. O sistema verifica os marcos de conquista e concede as que passaram a ser satisfeitas (RN12).
8. O sistema registra o progresso do dia no histórico da disciplina (RF12).
9. O sistema apresenta o retorno ao estudante: o progresso do conteúdo antes e depois, a experiência creditada e, quando houver, o aviso da conquista obtida.

**Fluxos alternativos**

- **1A — Atividade de outra pessoa:** o sistema não oferece a conclusão nem a mudança de status e informa, no detalhe, quem é o responsável que pode alterá-lo (RN20). O organizador continua podendo editar os dados e excluir a atividade, mas não o status.
- **2A — Reverter conclusão:** o responsável altera o status de "concluído" para outro. O sistema limpa a data de conclusão, estorna a experiência creditada, recalcula progresso e ofensiva, mas **não** revoga conquistas já concedidas (RN12).
- **7A — Nenhum marco atingido:** o sistema segue para o passo 8 sem conceder conquista.
- **3A — Falha ao gravar:** o sistema informa que a alteração não pôde ser salva no navegador e mantém o aviso no topo da tela até a gravação voltar a funcionar (RNF02).

**Pós-condições**

- A atividade está com status "concluído" e data de conclusão registrada.
- O progresso do conteúdo e da disciplina, a experiência e a ofensiva do responsável refletem a mudança em até 1 segundo (RNF08).
- As conquistas atingidas estão registradas e visíveis no perfil do estudante.

---

## UC08 · Acompanhar progresso

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Visualizar o quanto o grupo já avançou em cada disciplina e conteúdo, e o que está por vencer |
| **Pré-condições** | Existe um grupo ativo na sessão |
| **Requisitos** | RF06, RF07, RF10, RF11, RF12, RF21, RF22 |
| **Regras** | RN05, RN08, RN14, RN16, RN17 |
| **Atores secundários** | BrasilAPI e Nager.Date (feriados nacionais) |

**Fluxo principal**

1. O estudante acessa o painel.
2. O sistema calcula o total de atividades por status e a quantidade de atividades atrasadas (RN05).
3. O sistema calcula o progresso de cada conteúdo (RN08) e de cada disciplina (RN14).
4. O sistema consulta a BrasilAPI para obter os feriados nacionais dos anos presentes nos prazos e guarda a relação obtida para reutilização (RN17).
5. O sistema exibe os totais, as barras de progresso por disciplina com o percentual em número, a lista de próximas entregas e o gráfico de evolução do histórico de progresso.
6. O sistema destaca as atividades cujo prazo coincide com um feriado nacional (RF07) ou com um fim de semana (RF22).
7. O sistema exibe a relação dos próximos feriados nacionais a partir da data atual (RF21).

**Fluxos alternativos**

- **3A — Disciplina sem atividades:** a disciplina não entra no cálculo e é exibida com a indicação de que ainda não possui atividades (RN08, RN14).
- **4A — BrasilAPI indisponível ou lenta:** decorrido o tempo limite de espera, o sistema consulta a fonte reserva, a Nager.Date, e segue o fluxo principal (RN17).
- **4B — As duas fontes indisponíveis:** o sistema reutiliza a última relação de feriados obtida com sucesso; não havendo nenhuma, omite a sinalização de feriados e a relação dos próximos, informa que estão indisponíveis no momento e mantém o restante do painel funcional (RN17, RNF10).
- **2A — Grupo sem atividades:** o sistema exibe mensagem orientativa e o atalho para cadastrar a primeira atividade (RNF07).
- **5A — Histórico com menos de dois registros:** o sistema exibe a barra de progresso atual e informa que a evolução aparecerá conforme o uso.

**Pós-condições**

- Nenhuma alteração nos dados. O caso de uso é apenas de consulta.

---

## UC09 · Consultar painel de desempenho

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Acompanhar a própria experiência, ofensiva e conquistas e compará-las com as dos integrantes do grupo |
| **Pré-condições** | Existe um grupo ativo com ao menos um membro cadastrado |
| **Requisitos** | RF16, RF17, RF18 |
| **Regras** | RN10, RN11, RN12 |

**Fluxo principal**

1. O estudante acessa a tela de conquistas.
2. O sistema calcula, para cada membro do grupo, a experiência acumulada a partir das atividades concluídas sob sua responsabilidade (RN10).
3. O sistema calcula a ofensiva atual de cada membro (RN11).
4. O sistema recupera as conquistas obtidas por cada membro (RN12).
5. O sistema exibe os números de quem está usando: experiência, ofensiva, atividades concluídas e posição no grupo.
6. O sistema exibe as seis conquistas: as obtidas, com a data, e as que faltam, com o andamento rumo ao marco — por exemplo, "1 de 7 dias".
7. O sistema exibe o ranking do grupo, com avatar, nome, atividades concluídas, ofensiva, quantidade de conquistas e experiência de cada integrante. Empate em experiência mantém a ordem alfabética.

**Fluxos alternativos**

- **2A — Membro sem atividades concluídas:** a linha do membro é exibida com experiência zero e ofensiva zero, sem mensagem de erro.
- **1A — Grupo sem membros:** o sistema exibe mensagem orientativa e o atalho para a tela de membros (RNF07).

**Pós-condições**

- Nenhuma alteração nos dados. O caso de uso é apenas de consulta.

---

## UC13 · Consultar calendário

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Atores secundários** | BrasilAPI e Nager.Date (feriados nacionais) |
| **Objetivo** | Ver as entregas do grupo distribuídas pelos dias, reconhecendo a disciplina de cada uma pela cor |
| **Pré-condições** | Existe um grupo ativo na sessão |
| **Requisitos** | RF07, RF23 |
| **Regras** | RN05, RN17, RN18 |

**Fluxo principal**

1. O estudante acessa o calendário.
2. O sistema exibe o mês atual, com as atividades no dia do prazo, cada uma na cor da sua disciplina, e os feriados nacionais (RN17).
3. O estudante escolhe um dia.
4. O sistema exibe, ao lado, as entregas desse dia, com a situação de cada uma — atrasadas inclusive (RN05) —, o feriado, quando houver, e os próximos feriados.
5. O estudante navega entre os meses — pelos botões ou deslizando o dedo numa tela de toque — ou volta para hoje; a página do mês entra pelo lado para onde ele andou (RF23).

**Fluxos alternativos**

- **2A — Mês sem entregas:** na visão em lista, o sistema exibe mensagem orientativa (RNF07).
- **2B — Visões de semana e lista:** o estudante troca a visão; na semana, o sistema mostra as entregas dos sete dias; na lista, agrupa as entregas do mês por dia.
- **2C — Esconder disciplinas:** o estudante desmarca uma disciplina no filtro, e o calendário deixa de mostrar as entregas dela.
- **3A — Cadastrar a partir do dia:** o estudante aciona "Nova atividade neste dia", e o sistema segue para o UC05, com o prazo preenchido.
- **2D — Serviços de feriados indisponíveis:** o sistema segue o mesmo comportamento do UC08, fluxos 4A e 4B (RN17, RNF10).

**Pós-condições**

- Nenhuma alteração nos dados. O caso de uso é apenas de consulta.

---

## UC12 · Carregar dados de exemplo

| | |
|---|---|
| **Ator principal** | Estudante Organizador |
| **Objetivo** | Conhecer o sistema em funcionamento sem precisar cadastrar nada |
| **Pré-condições** | Nenhuma. O caso de uso ocorre na tela de entrada, antes de existir grupo ativo |
| **Requisitos** | RF20 |
| **Regras** | RN01 |

**Fluxo principal**

1. O usuário aciona a carga de dados de exemplo na tela de entrada.
2. O sistema cria um grupo de demonstração já preenchido, com membros, disciplinas, conteúdos e atividades em diferentes status e prazos.
3. O sistema inicia a sessão nesse grupo e pede que a pessoa escolha qual dos membros de exemplo ela é.
4. O sistema apresenta o painel.

**Fluxos alternativos**

- **2A — Já existe um grupo de demonstração:** o sistema cria um novo grupo, sem alterar nem sobrescrever os grupos existentes (RN01).

**Pós-condições**

- O grupo de demonstração passa a existir como qualquer outro grupo: pode ser usado, editado e excluído pelo usuário.

---

### Navegação

[⬅ Anterior: Histórico de Alterações](09-historico-de-alteracoes.md) · [Índice](../README.md) · [Próximo: Matriz de Rastreabilidade ➡](11-matriz-de-rastreabilidade.md)
