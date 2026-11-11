# 10 · Especificação dos Casos de Uso

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 2, atualizado em 11/11/2026

---

Estão especificados a seguir os dezessete casos de uso prioritários. O [diagrama de casos de uso](../diagramas/01-casos-de-uso.md) apresenta os vinte e um casos identificados e sua correspondência com os requisitos.

---

## UC01 · Gerenciar grupo de estudo

| | |
|---|---|
| **Ator principal** | Estudante Organizador |
| **Objetivo** | Criar, editar, abrir ou excluir um grupo de estudo, definindo onde a pessoa está trabalhando |
| **Pré-condições** | O estudante entrou com a conta (UC15) ou começou a demonstração (UC12) e está no espaço pessoal (UC17) ou num grupo |
| **Requisitos** | RF01, RF09, RF26, RF27, RF29, RF34 |
| **Regras** | RN01, RN02, RN07, RN19, RN24, RN26 |

**Fluxo principal**

1. O estudante abre o seletor de espaço, no topo da tela, à esquerda.
2. O sistema lista o espaço pessoal, os grupos de que a pessoa participa, com a quantidade de membros de cada um, e as ações "Criar grupo" e "Entrar com código de convite" (com conta) ou "Carregar grupo de exemplo" (na demonstração).
3. O estudante escolhe "Criar grupo".
4. O sistema apresenta o formulário com o nome do grupo, a descrição e a foto.
5. O estudante preenche o nome e, se quiser, a descrição e uma foto do grupo, que enquadra no editor (RF29, RN19). Depois, confirma.
6. O sistema valida os dados, cria o grupo, registra a data de criação e cadastra quem criou como o primeiro membro, vinculado à conta, com o nome e a foto do perfil e o perfil de organizador (RN07, RN26).
7. O sistema abre o grupo criado e direciona o estudante ao painel dele.

**Fluxos alternativos**

- **(3A) Abrir grupo existente:** o estudante escolhe um grupo da lista; o sistema o reconhece como o membro vinculado à conta e abre o painel do grupo. Escolher "Pessoal" volta ao espaço pessoal.
- **(3B) Entrar com código de convite:** o estudante segue o UC16, fluxo 4A, sem sair do sistema.
- **(3C) Editar grupo:** dentro de um grupo, o organizador escolhe "Editar grupo" no seletor; o sistema abre o formulário com nome, descrição e foto. O organizador altera os dados, troca a foto ou a remove, e confirma. Sem foto, o grupo volta a ser identificado pelas iniciais do nome (RF01, RF29, RN07). O participante não vê essa opção, e o espaço pessoal não a tem (RN24).
- **(3D) Excluir grupo:** no pé da tela de membros, o organizador escolhe excluir o grupo; o sistema pede confirmação, informando que membros, disciplinas, conteúdos e atividades serão removidos junto (RN02). Confirmada a exclusão, o sistema remove tudo em cascata, inclusive as conquistas, e volta ao espaço pessoal. O espaço pessoal não pode ser excluído (RN24).
- **(3E) Voltar ao espaço pessoal:** no menu da conta, o estudante escolhe "Voltar ao espaço pessoal", e o sistema abre o painel do espaço pessoal (RF09).
- **(3F) Grupo antigo da demonstração:** num grupo guardado no navegador antes desta versão, em que a pessoa ainda não está marcada, o sistema pergunta qual dos membros ela é antes de abrir o grupo.
- **(6A) Nome inválido:** se o nome do grupo estiver vazio, o sistema exibe a mensagem de erro no campo e mantém o formulário aberto (RNF03).
- **(2A) Nenhum grupo:** o seletor informa que a pessoa ainda não está em nenhum grupo e mantém as ações de criar e de entrar com código (RNF07).

**Pós-condições**

- O grupo existe, a pessoa é organizadora dele e o grupo aparece no seletor de espaço. Com conta, o grupo e o membro estão gravados no banco e aparecem para a mesma conta em qualquer aparelho.

---

## UC02 · Gerenciar membros

| | |
|---|---|
| **Ator principal** | Estudante Organizador |
| **Atores secundários** | Nenhum |
| **Objetivo** | Manter a relação de quem participa do grupo de estudo |
| **Pré-condições** | Existe um grupo ativo na sessão e o usuário atua como organizador |
| **Requisitos** | RF02, RF19, RF24, RF28 |
| **Regras** | RN02, RN03, RN07, RN15, RN19, RN26 |

**Fluxo principal**

1. O organizador acessa a tela de membros.
2. O sistema exibe os membros já cadastrados, cada um com sua foto ou avatar, nome, função, perfil, experiência e ofensiva.
3. O organizador solicita o cadastro de um novo membro.
4. O sistema abre o formulário com uma semente de avatar já sorteada e apresenta o avatar nos dois estilos de desenho, com o primeiro escolhido (RF19, RN15).
5. O organizador informa nome, função, e-mail e perfil e, se quiser, envia uma foto de perfil (RF24). O sistema abre o editor de foto, em que o organizador arrasta a imagem e ajusta o zoom até enquadrá-la na moldura; ao aplicar, a área enquadrada é reduzida antes de ser gravada (RN19).
6. O organizador pode escolher outro estilo e sortear outra semente quantas vezes quiser, até chegar a um avatar que lhe agrade; havendo foto, é ela que aparece, e o avatar escolhido fica guardado para quando a foto sair (RF19).
7. O organizador confirma o cadastro.
8. O sistema valida os dados, grava o membro e atualiza a relação.

**Fluxos alternativos**

- **(5A) Nome vazio ou e-mail inválido:** o sistema exibe a mensagem de erro no campo e mantém o formulário aberto (RNF03).
- **(5B) Arquivo que não é imagem, ou maior que 8 MB:** o sistema recusa o arquivo com mensagem e mantém o avatar (RN19).
- **(5C) Desistir do enquadramento:** o organizador fecha o editor sem aplicar; a foto anterior, ou o avatar, continua no cadastro.
- **(8A) Exclusão de membro responsável por atividades:** o sistema informa quantas atividades são dele e só confirma a exclusão depois de o organizador escolher outro membro do grupo para assumi-las; as atividades passam para o membro escolhido (RN02).
- **(5D) Membro com conta:** quando o membro já entrou com a própria conta, o nome, o avatar e a foto vêm do perfil dele (UC18) e não aparecem no formulário; o organizador altera só a função, o e-mail e o perfil (RN26).
- **(8B) Último organizador:** o sistema não permite remover nem rebaixar o último organizador do grupo (RN07).
- **(1A) Participante:** o participante vê a relação, mas não cadastra nem remove membros; ele edita apenas a função e o contato do próprio cadastro, sem poder mudar o próprio perfil (RN07). O nome e a foto ele muda em Meu perfil (UC18).
- **(1B) Espaço pessoal:** a tela de membros não existe no espaço pessoal, que só tem a própria pessoa (RN24).

**Pós-condições**

- O membro passa a estar disponível para ser responsável por atividades (RN03).

O convite por link ou por código de acesso, para a pessoa entrar no grupo com a própria conta, está no UC16.

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

- **(3A) Editar disciplina:** o organizador seleciona uma disciplina existente; o sistema abre o formulário preenchido e grava as alterações no passo 6.
- **(3B) Excluir disciplina:** o sistema pede confirmação informando quantas atividades e quantos conteúdos saem junto (RN02, RN13). Confirmada, remove em cascata; os eventos ligados à disciplina continuam no grupo, sem disciplina.
- **(3C) Excluir conteúdo:** no detalhe da disciplina, o organizador exclui um conteúdo; o sistema avisa que as atividades dele continuam na disciplina, sem conteúdo, e as mantém (RN02, RN13).
- **(5A) Nome vazio ou duplicado no grupo:** o sistema exibe a mensagem de erro no campo e mantém o formulário aberto (RNF03).
- **(2A) Nenhuma disciplina cadastrada:** o sistema exibe mensagem orientativa convidando ao primeiro cadastro (RNF07).
- **(1A) Usuário sem perfil de organizador:** o sistema não oferece as ações de cadastro, edição e exclusão (RN07).

**Pós-condições**

- A disciplina está disponível para receber atividades e, se o grupo quiser, conteúdos que a separem por assunto.

---

## UC05 · Cadastrar atividade

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Registrar uma atividade de estudo, ou uma tarefa do dia a dia, com prazo, peso e responsável, no espaço pessoal ou num grupo |
| **Pré-condições** | O estudante está no espaço pessoal ou num grupo; num grupo, há ao menos um membro e uma disciplina cadastrados |
| **Requisitos** | RF03, RF07, RF22, RF23, RF30, RF34, RF38 |
| **Regras** | RN03, RN04, RN06, RN07, RN09, RN13, RN20, RN24 |

**Fluxo principal**

1. O estudante aciona a criação de uma atividade.
2. O sistema apresenta o formulário com onde a atividade fica (já com o espaço aberto), título, descrição, disciplina, conteúdo, prazo, peso, prioridade, status e responsável, os demais sem valor escolhido: cada campo mostra só um exemplo do que preencher (RF03).
3. O estudante seleciona a disciplina, reconhecida na lista pela sua cor.
4. O sistema filtra a lista de conteúdos, exibindo apenas os da disciplina escolhida, e deixa "Sem conteúdo" como opção, porque o conteúdo é opcional (RN13).
5. O estudante preenche os demais campos (o prazo é escolhido no calendário do campo, que destaca hoje, os fins de semana e os feriados) e confirma.
6. O sistema valida os dados obrigatórios: título com no mínimo três caracteres, disciplina e prazo com data válida (RN06, RN13).
7. O sistema aplica os valores padrão: status "a fazer" quando não informado (RN04) e peso 1 quando não informado (RN09).
8. O sistema grava a atividade, registra a data de criação, confirma com um aviso que oferece abrir a atividade e volta para a tela de onde o estudante veio (a lista, o calendário, a disciplina).

**Fluxos alternativos**

- **(6A) Dados inválidos:** o sistema destaca cada campo com problema e exibe a mensagem específica, mantendo o que já foi preenchido (RNF03).
- **(5A) Responsável "A definir":** o estudante escolhe "A definir" no campo do responsável; o sistema grava a atividade em "a fazer", sem responsável, visível para todo o grupo, até alguém assumi-la (UC19, RN06).
- **(1D) No espaço pessoal:** o campo "Onde" já vem com o espaço pessoal, a disciplina é opcional ("Sem disciplina") e o responsável é a própria pessoa, sem campo para escolher (RN24). Trocando "Onde" para um dos grupos da pessoa, o formulário passa a oferecer as disciplinas e os membros desse grupo, e a disciplina volta a ser obrigatória.
- **(1E) Várias de uma vez:** o estudante escolhe "Várias de uma vez" na lista de atividades e segue o UC20.
- **(5B) Responsável fora do grupo:** o sistema não oferece essa opção na lista, que contém apenas os membros do grupo ativo (RN03).
- **(4A) Conteúdo ainda não cadastrado:** o organizador escolhe "Criar novo conteúdo" no fim da lista de conteúdos (ou o atalho da dica do campo, quando a disciplina ainda não tem nenhum). O sistema abre a janela de cadastro de conteúdo na disciplina escolhida; ao confirmar, grava o conteúdo, fecha a janela e deixa o conteúdo novo selecionado, sem perder nada do que já estava preenchido (RF30, RN13). O participante não vê essa opção (RN07).
- **(5D) Status de outra pessoa:** só quem é o responsável escolhe o status. Se o responsável escolhido for outra pessoa, o campo de status fica travado, com a explicação, e a atividade é gravada como "a fazer" (RN20).
- **(5C) Prazo em feriado nacional ou em fim de semana:** o sistema avisa abaixo do campo de prazo, grava a atividade normalmente e mantém a sinalização no detalhe dela (RF07, RF22).
- **(1A) Nenhuma disciplina cadastrada no grupo:** o sistema informa que é preciso cadastrar uma disciplina antes e oferece o atalho para essa tela. No espaço pessoal, isso não impede o cadastro (RN24). Disciplina sem conteúdo não impede o cadastro: a atividade fica direto na disciplina.
- **(1C) Editar atividade:** o responsável e o organizador editam a atividade pelo mesmo formulário; o participante não edita as atividades dos outros, nem pelo endereço da tela de edição (RN07). Quando quem edita não é o responsável, o status fica travado (RN20).
- **(1B) A partir de um dia do calendário:** o estudante escolhe um dia no calendário e aciona a criação; o formulário já vem com o prazo desse dia (RF23).

**Pós-condições**

- A atividade existe, aparece nas listagens, no painel e no calendário (e, se tiver responsável, no espaço pessoal dele), e passa a compor o peso total da sua disciplina e, se tiver conteúdo, do seu conteúdo, para efeito de cálculo de progresso (RN08, RN14).

---

## UC07 · Concluir atividade

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Marcar uma atividade como concluída e receber o retorno correspondente em progresso, experiência, ofensiva e conquistas |
| **Pré-condições** | A atividade está cadastrada com status diferente de "concluído" e o estudante é o responsável por ela |
| **Requisitos** | RF05, RF15, RF16, RF17 |
| **Regras** | RN04, RN08, RN10, RN11, RN12, RN14, RN20 |

**Fluxo principal**

1. O estudante usa a alteração rápida de status na listagem, que só aparece nas atividades sob a responsabilidade dele (RN20), ou abre o detalhe da atividade, onde a ação "Marcar como concluída" fica discreta, abaixo dos dados.
2. O estudante seleciona o status "concluído".
3. O sistema grava o novo status e registra a data de conclusão.
4. O sistema credita ao responsável a experiência equivalente ao peso multiplicado por 10 (RN10).
5. O sistema recalcula o progresso do conteúdo da atividade (RN08) e o progresso da disciplina correspondente (RN14).
6. O sistema recalcula a ofensiva do responsável a partir das datas de conclusão (RN11).
7. O sistema verifica os marcos de conquista e concede as que passaram a ser satisfeitas (RN12).
8. O sistema registra o progresso do dia no histórico da disciplina (RF12).
9. O sistema apresenta o retorno ao estudante: o progresso antes e depois, a experiência creditada e a opção de desfazer e, quando houver, o aviso da conquista obtida.

**Fluxos alternativos**

- **(1A) Atividade de outra pessoa:** o sistema não oferece a conclusão nem a mudança de status e informa, no detalhe, quem é o responsável que pode alterá-lo (RN20). O organizador continua podendo editar os dados e excluir a atividade, mas não o status.
- **(2A) Reverter conclusão:** o responsável aciona "Desfazer" no aviso, ou altera o status de "concluído" para outro. O sistema limpa a data de conclusão, estorna a experiência creditada, recalcula progresso e ofensiva e retira as conquistas que só valiam por causa dessa conclusão, avisando quais saíram (RN12).
- **(1B) Atividade "A definir":** a atividade não pode ser concluída enquanto não tiver responsável; quem quer concluí-la a assume antes (UC19).
- **(7A) Nenhum marco atingido:** o sistema segue para o passo 8 sem conceder conquista.
- **(3A) Falha ao gravar:** o sistema informa que a alteração não pôde ser salva no navegador e mantém o aviso no topo da tela até a gravação voltar a funcionar (RNF02).

**Pós-condições**

- A atividade está com status "concluído" e data de conclusão registrada.
- O progresso do conteúdo e da disciplina, a experiência e a ofensiva do responsável refletem a mudança em até 1 segundo (RNF08).
- As conquistas atingidas estão registradas e visíveis no perfil do estudante; as que deixaram de valer por uma reversão foram retiradas.

---

## UC08 · Acompanhar progresso

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Visualizar o quanto o grupo já avançou em cada disciplina e conteúdo, e o que está por vencer |
| **Pré-condições** | Existe um grupo ativo na sessão |
| **Requisitos** | RF06, RF07, RF10, RF11, RF12, RF21, RF22 |
| **Regras** | RN05, RN08, RN14, RN16, RN17, RN23 |
| **Atores secundários** | BrasilAPI e Nager.Date (feriados nacionais) |

**Fluxo principal**

1. O estudante acessa o painel.
2. O sistema calcula o total de atividades por status e a quantidade de atividades atrasadas (RN05).
3. O sistema calcula o progresso de cada conteúdo (RN08) e de cada disciplina (RN14).
4. O sistema consulta a BrasilAPI para obter os feriados nacionais dos anos presentes nos prazos e guarda a relação obtida para reutilização (RN17).
5. O sistema exibe os totais, as barras de progresso por disciplina com o percentual em número e a lista de próximas entregas.
6. O sistema destaca as atividades cujo prazo coincide com um feriado nacional (RF07) ou com um fim de semana (RF22).
7. O sistema exibe a relação dos próximos feriados nacionais a partir da data atual (RF21).
8. O estudante abre uma disciplina.
9. O sistema exibe a barra de progresso da disciplina e a linha da evolução dia a dia, a partir do histórico (RF12, RN23); passando o mouse ou o dedo sobre a linha, mostra o dia e o percentual.

**Fluxos alternativos**

- **(3A) Disciplina sem atividades:** a disciplina não entra no cálculo e é exibida com a indicação de que ainda não possui atividades (RN08, RN14).
- **(4A) BrasilAPI indisponível ou lenta:** decorrido o tempo limite de espera, o sistema consulta a fonte reserva, a Nager.Date, e segue o fluxo principal (RN17).
- **(4B) As duas fontes indisponíveis:** o sistema reutiliza a última relação de feriados obtida com sucesso; não havendo nenhuma, omite a sinalização de feriados e a relação dos próximos, informa que estão indisponíveis no momento e mantém o restante do painel funcional (RN17, RNF10).
- **(2A) Grupo sem atividades:** o sistema exibe mensagem orientativa e o atalho para cadastrar a primeira atividade (RNF07).
- **(9A) Histórico com menos de dois dias:** o sistema exibe a barra de progresso atual e informa que a linha da evolução aparece a partir do segundo dia de atividades na disciplina.

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
6. O sistema exibe as seis conquistas: as obtidas, com a data, e as que faltam, com o andamento rumo ao marco (por exemplo, "1 de 7 dias").
7. O sistema exibe o ranking do grupo, com avatar, nome, atividades concluídas, ofensiva, quantidade de conquistas e experiência de cada integrante. Empate em experiência mantém a ordem alfabética.

**Fluxos alternativos**

- **(2A) Membro sem atividades concluídas:** a linha do membro é exibida com experiência zero e ofensiva zero, sem mensagem de erro.
- **(1A) Grupo sem membros:** o sistema exibe mensagem orientativa e o atalho para a tela de membros (RNF07).

**Pós-condições**

- Nenhuma alteração nos dados. O caso de uso é apenas de consulta.

---

## UC13 · Consultar calendário

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Atores secundários** | BrasilAPI e Nager.Date (feriados nacionais) |
| **Objetivo** | Ver as entregas e os eventos distribuídos pelos dias, reconhecendo a disciplina de cada entrega pela cor |
| **Pré-condições** | O estudante está no espaço pessoal ou num grupo |
| **Requisitos** | RF07, RF23, RF31 |
| **Regras** | RN05, RN17, RN18, RN21 |

**Fluxo principal**

1. O estudante acessa o calendário.
2. O sistema exibe a barra de filtros e o mês atual, com as atividades no dia do prazo, cada uma na cor da sua disciplina, os eventos em cada dia em que acontecem e os feriados nacionais (RN17). No espaço pessoal, aparecem as atividades que estão com a pessoa e os eventos de todos os grupos dela, com o nome do grupo.
3. O estudante escolhe um dia.
4. O sistema exibe, ao lado, as entregas desse dia, com a situação de cada uma (atrasadas inclusive, RN05), os eventos do dia, com horário e local, o feriado, quando houver, e os próximos feriados.
5. O estudante navega entre os meses (pelos botões ou deslizando o dedo numa tela de toque) ou volta para hoje; a página do mês entra pelo lado para onde ele andou (RF23).

**Fluxos alternativos**

- **(2A) Mês sem entregas:** na visão em lista, o sistema exibe mensagem orientativa (RNF07).
- **(2B) Visões de semana e lista:** o estudante troca a visão; na semana, o sistema mostra as entregas dos sete dias; na lista, agrupa as entregas do mês por dia.
- **(2C) Filtrar:** na barra de filtros, o estudante liga ou desliga as atividades, os eventos e os feriados, escolhe uma disciplina e, no grupo, liga "Só as minhas atividades" ou, no espaço pessoal, escolhe um grupo. O sistema mostra só o que passou nos filtros e resume, na barra, o que está aparecendo; "Limpar filtros" volta a mostrar tudo.
- **(3A) Cadastrar a partir do dia:** o estudante aciona "Nova atividade neste dia", e o sistema segue para o UC05, com o prazo preenchido; ou aciona "Novo evento neste dia", e o sistema segue para o UC14, com o dia preenchido.
- **(2D) Serviços de feriados indisponíveis:** o sistema segue o mesmo comportamento do UC08, fluxos 4A e 4B (RN17, RNF10).

**Pós-condições**

- Nenhuma alteração nos dados. O caso de uso é apenas de consulta.

---

## UC12 · Carregar dados de exemplo

| | |
|---|---|
| **Ator principal** | Estudante Organizador |
| **Objetivo** | Conhecer o sistema em funcionamento sem precisar cadastrar nada |
| **Pré-condições** | Nenhuma. O caso de uso começa na tela de entrada |
| **Requisitos** | RF20, RF33, RF34 |
| **Regras** | RN01, RN24 |

**Fluxo principal**

1. Na tela de entrada, o usuário escolhe "Experimentar sem conta", e o sistema passa ao modo de demonstração, com os dados guardados só no navegador.
2. O sistema pede o nome da pessoa.
3. O usuário informa o nome e aciona "Começar com dados de exemplo".
4. O sistema cria o perfil e o espaço pessoal da pessoa, com algumas tarefas e um evento pessoais, e um grupo de demonstração já preenchido, com membros, disciplinas, conteúdos, atividades em diferentes status e prazos e eventos, em que a pessoa é um dos membros.
5. O sistema abre o espaço pessoal e apresenta o painel, com o convite para o tutorial (RF33).

**Fluxos alternativos**

- **(3A) Começar sem exemplos:** o usuário aciona "Começar"; o sistema cria só o perfil e o espaço pessoal, vazios.
- **(3B) Carregar depois:** já dentro do sistema, o usuário escolhe "Carregar grupo de exemplo" no seletor de espaço; o sistema cria um novo grupo de exemplo, sem alterar nem sobrescrever os grupos existentes (RN01).
- **(3C) Nome vazio:** o sistema exibe a mensagem no campo e mantém a tela (RNF03).
- **(1A) Voltar a usar conta:** no aviso do modo de demonstração, o usuário escolhe "Entrar com conta", e o sistema volta à tela de login (UC15).

**Pós-condições**

- O espaço pessoal e o grupo de demonstração passam a existir como no uso com conta: podem ser usados, editados e (o grupo) excluídos pelo usuário, e ficam só neste navegador.

---

## UC14 · Gerenciar eventos

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Registrar o que vai acontecer num dia ou num período (prova, apresentação, palestra, reunião, semana acadêmica), para a pessoa ou o grupo se programar |
| **Pré-condições** | O estudante está no espaço pessoal ou num grupo, identificado como um dos membros |
| **Requisitos** | RF23, RF31 |
| **Regras** | RN01, RN02, RN07, RN21 |

**Fluxo principal**

1. O estudante acessa a tela de eventos.
2. O sistema lista os próximos eventos, agrupados por mês, com tipo, dia ou período, horário, local e disciplina, e quanto falta para cada um. No espaço pessoal, aparecem os eventos da pessoa e os de todos os grupos dela, com o nome do grupo.
3. O estudante aciona "Novo evento".
4. O sistema apresenta o formulário com onde o evento fica (o espaço pessoal ou um grupo), nome, tipo, dia, a opção "Dura mais de um dia", início, fim, local, disciplina e descrição.
5. O estudante preenche os campos e confirma.
6. O sistema valida: nome, tipo e dia são obrigatórios; o fim só vale com o início e, no evento de um dia, precisa ser depois dele (RN21).
7. O sistema grava o evento onde foi escolhido, registrando quem cadastrou, e o mostra na lista, no painel e no calendário.

**Fluxos alternativos**

- **(6A) Dados inválidos:** o sistema exibe a mensagem no campo com problema e mantém o que já foi preenchido (RNF03).
- **(5A) Evento sem horário:** o sistema grava o evento como "dia todo".
- **(5B) Evento de vários dias:** o estudante liga "Dura mais de um dia" e informa o último dia; o sistema recusa um último dia antes do primeiro, mostra o período no cartão (por exemplo, "17/11 a 19/11 (3 dias)") e o evento aparece em cada dia do período no calendário. O horário de início vale para o primeiro dia, e o de fim, para o último (RN21).
- **(2A) Eventos passados:** o estudante troca para a aba "Passados", e o sistema lista os eventos cujo dia já terminou.
- **(2B) Filtrar por tipo ou disciplina:** o estudante escolhe um tipo ou uma disciplina, e a lista mostra só os eventos que combinam com a escolha.
- **(2C) Evento em feriado:** o sistema avisa no cartão do evento que o dia é feriado nacional (RN17).
- **(3A) Editar ou excluir:** quem cadastrou o evento, ou o organizador, abre o menu do evento e edita ou exclui; a exclusão pede confirmação. Os demais integrantes não veem essas ações (RN21).
- **(3B) A partir de um dia do calendário:** o estudante aciona "Novo evento neste dia" no UC13, e o formulário já vem com o dia escolhido.

**Pós-condições**

- O evento existe, aparece na página de eventos, no painel e no calendário. Se a disciplina dele for excluída, o evento continua no grupo, sem disciplina (RN02). O evento de vários dias passa para os passados no dia seguinte ao último dia.

---

## UC15 · Entrar com conta

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Entrar no sistema com a própria conta, para ver e alterar os grupos de que participa em qualquer aparelho |
| **Pré-condições** | Nenhuma |
| **Requisitos** | RF09, RF27, RF34, RF35 |
| **Regras** | RN01, RN07, RN24, RN26 |
| **Atores secundários** | Supabase (autenticação) e Google (login com a conta Google) |

**Fluxo principal**

1. O estudante escolhe entrar na página inicial.
2. O sistema exibe a tela de login, com a entrada por e-mail e senha, o botão "Continuar com o Google" e o atalho "Experimentar sem conta".
3. O estudante informa o e-mail e a senha e confirma.
4. O sistema valida o formato do e-mail e o tamanho mínimo da senha (6 caracteres) e confere os dados no serviço de autenticação.
5. O sistema carrega do banco o espaço pessoal e os grupos de que a conta participa, e só eles (RN01), e abre o painel do espaço pessoal (UC17). No primeiro acesso, inclusive de uma conta criada antes desta versão, o banco cria o espaço pessoal e o perfil, com o nome da conta (RN24, RN26).

**Fluxos alternativos**

- **(3A) Criar conta:** o estudante escolhe "Criar conta", informa nome, e-mail e senha; o sistema cria a conta e segue para o passo 5. Se já existe conta com o e-mail, o sistema avisa e pede para entrar com ela.
- **(3B) Conta Google:** o estudante escolhe "Continuar com o Google", escolhe a conta na tela do Google e autoriza; o sistema volta para o passo 5.
- **(4A) E-mail ou senha incorretos:** o sistema avisa "E-mail ou senha incorretos." e mantém o formulário preenchido.
- **(4B) Dados inválidos:** o sistema exibe a mensagem no campo com problema (RNF03).
- **(4C) Sem conexão com o servidor:** o sistema avisa que não há conexão e mantém o formulário.
- **(2A) Experimentar sem conta:** o estudante escolhe o modo de demonstração (UC12).
- **(5A) Sair da conta:** no menu da conta, o estudante escolhe "Sair da conta"; o sistema encerra a sessão da conta e volta à tela de login (RF09).
- **(5B) Banco sem a atualização de 11/11:** se o espaço pessoal não puder ser criado, o sistema avisa e oferece o acesso anterior: os grupos da conta, o código de convite e a criação de um grupo.

**Pós-condições**

- A conta está conectada, o espaço pessoal está aberto e o sistema exibe só os grupos dela. A senha não é guardada pelo sistema, só pelo serviço de autenticação (RNF11).

---

## UC16 · Convidar para o grupo

| | |
|---|---|
| **Ator principal** | Estudante Organizador |
| **Objetivo** | Chamar a turma para o grupo, sem precisar cadastrar cada pessoa |
| **Pré-condições** | O organizador está numa sessão com conta; quem recebe o convite tem ou cria uma conta |
| **Requisitos** | RF27, RF28 |
| **Regras** | RN07, RN22 |

**Fluxo principal**

1. Na tela de membros, o organizador aciona "Convidar".
2. O sistema gera um código de 8 caracteres, grava o convite com validade de 7 dias e exibe o código e o link do convite, com botões para copiar (RN22).
3. O organizador envia o link ou o código para a turma.
4. A pessoa convidada abre o link.
5. O sistema guarda o código e exibe a tela de login, informando que é para aceitar o convite.
6. A pessoa entra com a conta, ou cria uma (UC15).
7. O sistema confere o código, inclui a pessoa no grupo como participante, com o nome e a foto do perfil dela (RN26), e abre o painel do grupo.

**Fluxos alternativos**

- **(4A) Código digitado:** a pessoa, já dentro do sistema, escolhe "Entrar com código de convite" no seletor de espaço, digita o código e confirma; o sistema segue para o passo 7.
- **(7A) Código inválido ou vencido:** o sistema avisa "Código de convite inválido ou vencido." e mantém a janela do código aberta.
- **(7B) Pessoa já cadastrada pelo organizador:** se existe no grupo um membro com o mesmo e-mail da conta e ainda sem conta vinculada, o sistema vincula a conta a esse membro, mantendo o perfil e as atividades dele (RN22).
- **(7C) Pessoa que já é do grupo:** o sistema só abre a sessão no grupo, sem criar outro membro.
- **(2A) Gerar outro código:** o organizador aciona "Gerar outro código", e o sistema grava um convite novo. Os anteriores continuam valendo até vencer.
- **(1A) Participante:** o botão "Convidar" não aparece, e o banco recusa a gravação de convite por quem não é organizador (RN07, RNF11). O espaço pessoal não tem convite (RN24).

**Pós-condições**

- A pessoa convidada é membro do grupo, vinculada à própria conta, e vê os mesmos dados que o resto do grupo.

---

## UC17 · Usar o espaço pessoal

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Organizar, num lugar só, o que é só da pessoa e o que está com ela em todos os grupos, sem precisar entrar em cada grupo |
| **Pré-condições** | O estudante entrou com a conta (UC15) ou começou a demonstração (UC12) |
| **Requisitos** | RF04, RF06, RF18, RF23, RF31, RF34 |
| **Regras** | RN01, RN03, RN10, RN11, RN12, RN24 |

**Fluxo principal**

1. O estudante entra no sistema, ou escolhe "Pessoal" no seletor de espaço.
2. O sistema abre o painel do espaço pessoal, com os totais e as próximas entregas das atividades pessoais e das que estão com a pessoa nos grupos, os próximos eventos, a experiência e a ofensiva somadas de todos os grupos (RN24) e a lista dos grupos, com quantas atividades estão com a pessoa e quantas estão "A definir" em cada um.
3. O estudante cadastra uma tarefa só dele, com ou sem disciplina (UC05, fluxo 1D).
4. O sistema grava a tarefa no espaço pessoal, com a própria pessoa como responsável, e a mostra só para ela (RN01, RN03).
5. O estudante abre a lista de atividades.
6. O sistema lista as atividades pessoais e as dos grupos que estão com a pessoa, com o nome do grupo à frente de cada uma, com os mesmos filtros do grupo (RF04).
7. O estudante conclui uma atividade de um grupo direto da lista (UC07).
8. O sistema grava a conclusão no grupo da atividade, que os outros integrantes passam a ver lá.

**Fluxos alternativos**

- **(2A) Abrir um grupo:** o estudante aciona o atalho de um grupo na lista do painel, e o sistema abre o grupo (UC01, fluxo 3A).
- **(2B) Sem grupos:** a lista de grupos convida a criar um grupo ou a entrar com um código (UC01, UC16).
- **(3A) Evento pessoal:** o estudante cadastra um evento no espaço pessoal (UC14), visto só por ele.
- **(5A) Calendário e conquistas:** no calendário, aparecem as atividades da pessoa e os eventos de todos os grupos dela (UC13); na tela de conquistas, a experiência, a ofensiva e as conquistas somadas e a posição da pessoa em cada grupo.
- **(1A) Membros:** a tela de membros não aparece no espaço pessoal, que só tem a própria pessoa (RN24).

**Pós-condições**

- O que é pessoal fica só no espaço pessoal; o que é de um grupo continua no grupo, e o que mudou nele aparece para os demais integrantes.

---

## UC18 · Editar o perfil

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Definir uma vez o nome, o avatar e a foto que identificam a pessoa em todos os grupos |
| **Pré-condições** | O estudante entrou com a conta ou começou a demonstração |
| **Requisitos** | RF19, RF24, RF35, RF36 |
| **Regras** | RN15, RN19, RN26 |

**Fluxo principal**

1. No menu da conta, o estudante escolhe "Meu perfil".
2. O sistema exibe o nome, o avatar, a foto, em quantos grupos o perfil aparece e, com conta, o lembrete por e-mail.
3. O estudante altera o nome, troca o estilo ou sorteia outro avatar, ou envia uma foto e a enquadra no editor (RN19).
4. O estudante salva.
5. O sistema valida o nome, grava o perfil e atualiza o nome, o avatar e a foto da pessoa em todos os grupos de que ela participa (RN26).

**Fluxos alternativos**

- **(3A) Remover a foto:** o estudante remove a foto, e o avatar volta a aparecer em todos os grupos (RN15).
- **(3B) Lembrete por e-mail:** com conta, o estudante liga ou desliga o lembrete diário (UC21, RN25).
- **(5A) Nome vazio:** o sistema exibe a mensagem no campo e mantém o que foi preenchido (RNF03).

**Pós-condições**

- O perfil está gravado e todos os grupos da pessoa mostram o mesmo nome, avatar e foto.

---

## UC19 · Assumir atividade

| | |
|---|---|
| **Ator principal** | Estudante Participante |
| **Objetivo** | Tornar-se responsável por uma atividade do grupo que ainda não tem dono |
| **Pré-condições** | Existe no grupo uma atividade com o responsável "A definir" (UC05, fluxo 5A) |
| **Requisitos** | RF04, RF05, RF38 |
| **Regras** | RN06, RN20 |

**Fluxo principal**

1. O estudante vê a atividade na lista do grupo, com o círculo vazio no lugar do avatar e "A definir" no lugar do responsável.
2. O estudante aciona "Assumir", na linha ou no detalhe da atividade.
3. O sistema grava o estudante como responsável e confirma com um aviso.
4. A atividade passa a aparecer com o avatar do estudante e no espaço pessoal dele, e ele pode mudar o status e concluí-la (UC07).

**Fluxos alternativos**

- **(2A) Organizador:** além de assumir, o organizador pode editar a atividade e escolher qualquer membro como responsável (RN07).
- **(3A) Outra pessoa assumiu antes:** com conta, o banco recusa a gravação, o sistema avisa e recarrega a lista com o responsável atual (RNF11).
- **(1A) Encontrar as atividades sem dono:** o estudante filtra a lista por responsável "A definir".

**Pós-condições**

- A atividade tem responsável, e só ele muda o status dela (RN20).

---

## UC20 · Cadastrar e alterar em lote

| | |
|---|---|
| **Ator principal** | Estudante Participante (cadastro) e Estudante Organizador (troca de responsável) |
| **Objetivo** | Cadastrar várias atividades ou trocar o responsável de várias de uma vez, sem repetir o formulário |
| **Pré-condições** | O estudante está no espaço pessoal ou num grupo com ao menos uma disciplina |
| **Requisitos** | RF03, RF04, RF37 |
| **Regras** | RN03, RN06, RN09, RN10, RN13, RN24 |

**Fluxo principal**

1. Na lista de atividades, o estudante aciona "Várias de uma vez".
2. O sistema exibe uma tabela em que cada linha é uma atividade, com título, disciplina, prazo, peso e responsável, e a linha "Para todas as linhas".
3. O estudante aciona "Colar uma lista" e cola os títulos, um por linha.
4. O sistema cria uma linha para cada título.
5. Na linha "Para todas as linhas", o estudante escolhe a disciplina, o prazo, o peso ou o responsável, e o sistema aplica a escolha a todas as linhas; depois, ajusta o que for diferente em cada uma.
6. O estudante aciona "Criar atividades".
7. O sistema valida cada linha com as regras do cadastro (RN06, RN09, RN13), grava todas e volta para a lista, informando quantas foram criadas.

**Fluxos alternativos**

- **(7A) Linha inválida:** o sistema marca o campo com problema na linha e não grava nenhuma até a correção (RNF03).
- **(2A) No espaço pessoal:** a disciplina pode ficar "Sem disciplina" e não há coluna de responsável (RN24).
- **(1A) Trocar o responsável de várias:** num grupo, o organizador aciona "Selecionar" na lista, marca as atividades, escolhe o novo responsável (ou "A definir") na barra que aparece no pé da tela e aciona "Trocar responsável". O sistema troca nas atividades não concluídas e informa quantas mudaram; as concluídas ficam como estão, porque a experiência é de quem as concluiu (RN10), e "A definir" só vale para as que estão em "a fazer" (RN06).
- **(1B) Participante:** a seleção para trocar o responsável não aparece (RN07).

**Pós-condições**

- As atividades existem, ou trocaram de responsável, como se tivessem sido cadastradas ou editadas uma a uma.

---

## UC21 · Receber lembrete por e-mail

| | |
|---|---|
| **Ator principal** | Estudante Participante, que recebe o lembrete; o caso começa pelo agendamento diário do banco |
| **Atores secundários** | Brevo (envio do e-mail) |
| **Objetivo** | Avisar a pessoa, fora do sistema, das atividades dela perto do prazo ou atrasadas |
| **Pré-condições** | A pessoa tem conta, o lembrete está ligado em Meu perfil e o envio foi configurado no Supabase |
| **Requisitos** | RF36 |
| **Regras** | RN05, RN25 |

**Fluxo principal**

1. Todo dia, às 7h (horário de Brasília), o agendamento do banco inicia o envio.
2. O sistema seleciona, para cada conta com o lembrete ligado, as atividades sob a responsabilidade dela, não concluídas, com prazo entre hoje e os próximos 2 dias ou vencidas nos últimos 7 dias, em todos os grupos e no espaço pessoal (RN25).
3. O sistema monta um e-mail por pessoa, com cada atividade, a situação do prazo ("Vence hoje", "Vence amanhã", "Venceu em 08/11"), o grupo e a disciplina, e o botão para abrir as atividades no Vértice.
4. O sistema envia os e-mails pelo Brevo e registra o dia do envio em cada perfil.
5. A pessoa recebe o e-mail e abre o Vértice pelo botão.

**Fluxos alternativos**

- **(2A) Nada no intervalo:** a pessoa não recebe e-mail naquele dia.
- **(2B) Lembrete desligado:** a pessoa desligou o lembrete em Meu perfil (UC18), e o sistema não a inclui.
- **(4A) Envio repetido no mesmo dia:** se o envio rodar de novo no mesmo dia, ninguém recebe o e-mail duas vezes (RN25).
- **(4B) Chave do Brevo não configurada:** o envio para com a mensagem de que a chave precisa ser guardada no cofre do Supabase, e nenhum e-mail sai.

**Pós-condições**

- Cada pessoa com atividade no intervalo recebeu um e-mail naquele dia, e o perfil registra a data do último lembrete.

---

### Navegação

[⬅ Anterior: Histórico de Alterações](09-historico-de-alteracoes.md) · [Índice](../README.md) · [Próximo: Matriz de Rastreabilidade ➡](11-matriz-de-rastreabilidade.md)
