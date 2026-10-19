# 15 · Casos de Teste

> **Vértice** — Plataforma de Acompanhamento de Aprendizagem
> Imersão Profissional: Projeto de Software · ADSIS4S · 2º bimestre · Entrega de 20/10/2026

---

Este documento registra os testes executados sobre o recorte da entrega de 20/10. Cada caso informa o requisito ou a regra que verifica, os passos, a entrada, o resultado esperado e o resultado observado na execução real. As evidências estão em [`testes/evidencias/`](../testes/evidencias/), com o nome do caso no arquivo.

Defeitos encontrados estão no [Registro de Defeitos e Pendências](16-defeitos-e-pendencias.md).

---

## Condições de execução

| Item | Valor |
|---|---|
| Data da execução | 19/10/2026 |
| Versão testada | commit `c29279b` da branch `main` |
| Como a aplicação foi executada | `npm ci`, `npm run build` e `npm run preview`, dentro de `src/` |
| Ambiente | Node.js 22.22.0, npm 10.9.4, Chromium 141, tela de 1440 × 1000 |
| Forma de execução | Roteiro automatizado no navegador (Playwright), seguindo os passos de cada caso; as capturas de tela são da própria execução |
| Dados | Fictícios, cadastrados durante o próprio teste. CT25, CT28 e CT29 usam os dados de exemplo do sistema |
| Rede | Sem acesso aos serviços externos (BrasilAPI, Nager.Date, DiceBear e Google Fonts). Isso é o que o CT24 verifica; as fontes foram carregadas a partir dos mesmos arquivos usados no protótipo |

Os casos CT01 a CT24 formam **um único cenário em sequência**: cada um parte do estado deixado pelo anterior. Os casos CT25 a CT29 começam com o navegador limpo.

---

## Resumo

| Situação | Casos |
|---|---|
| Aprovado | 26 |
| Reprovado | 3 — CT26, CT27 e CT29 |
| **Total executado** | **29** |

Além dos casos manuais, foram executadas as verificações automatizadas do projeto:

| Verificação | Comando | Resultado | Registro |
|---|---|---|---|
| Regras de migração, progresso, experiência e perfis | `npm run verificar` | 76 verificações, todas passaram | [`verificar.txt`](../testes/registros/verificar.txt) |
| Instalação e geração da versão de produção | `npm ci` e `npm run build` | Concluído sem erro | [`build.txt`](../testes/registros/build.txt) |

---

## Visão geral

| Caso | Requisito / regra | O que verifica | Situação |
|---|---|---|---|
| CT01 | RF01, RNF03 | Criar grupo sem nome | Aprovado |
| CT02 | RF01 | Criar grupo com dados válidos | Aprovado |
| CT03 | RF02, RNF03 | Cadastrar membro sem nome e com e-mail inválido | Aprovado |
| CT04 | RF02, RN07 | Cadastrar membros com perfis diferentes | Aprovado |
| CT05 | RF13 | Cadastrar disciplinas | Aprovado |
| CT06 | RF13, RN01 | Disciplina sem nome e com nome repetido | Aprovado |
| CT07 | RF14, RN13 | Cadastrar conteúdos e recusar nome repetido | Aprovado |
| CT08 | RF03, RN06, RN13 | Salvar atividade com campos obrigatórios vazios | Aprovado |
| CT09 | RF03, RN09 | Cadastrar atividades válidas com peso | Aprovado |
| CT10 | RF03, RN06, RN10 | Cadastrar atividade sem responsável | Aprovado |
| CT11 | RF05, RF10, RF11, RF15, RN08, RN10, RN14 | Concluir atividade: progresso e experiência | Aprovado |
| CT12 | RN10 | Reverter a conclusão e concluir de novo | Aprovado |
| CT13 | RN10, RN14 | Concluir atividade sem responsável | Aprovado |
| CT14 | RF04, RN05 | Busca, filtro por responsável e situação | Aprovado |
| CT15 | RF06, RN05 | Totais do painel | Aprovado |
| CT16 | RNF02 | Dados recuperados ao reabrir o navegador | Aprovado |
| CT17 | RN07 | Participante não vê a gestão do grupo | Aprovado |
| CT18 | RN07 | Participante cadastra atividade | Aprovado |
| CT19 | RN07 | Grupo não fica sem o último organizador | Aprovado |
| CT20 | RF02, RN02 | Remover membro mantém as atividades | Aprovado |
| CT21 | RF09 | Encerrar sessão e acesso a rota privada | Aprovado |
| CT22 | RF08 | Tema mantido após recarregar | Aprovado |
| CT23 | RF13, RN02 | Remover disciplina em cascata | Aprovado |
| CT24 | RNF10, RN15, RN17 | Serviços externos indisponíveis | Aprovado |
| CT25 | RF20 | Carregar dados de exemplo | Aprovado |
| CT26 | RF02, RN07 | Primeiro membro do grupo cadastrado como participante | **Reprovado** |
| CT27 | RNF02 | Falha de gravação no armazenamento do navegador | **Reprovado** |
| CT28 | RF22 | Aviso de prazo em fim de semana | Aprovado |
| CT29 | RF04 | Filtro por disciplina na lista de atividades | **Reprovado** |

---

## Casos de teste

### CT01 — Criar grupo sem nome

- **Requisito:** RF01, RNF03
- **Pré-condição:** navegador sem dados; tela de acesso aberta
- **Passos:** deixar "Nome do grupo" vazio e clicar em **Criar e entrar**
- **Entrada:** nome vazio
- **Esperado:** o grupo não é criado e o campo informa o erro
- **Observado:** permaneceu na tela de acesso e exibiu "Dê um nome ao grupo." abaixo do campo
- **Situação:** Aprovado
- **Evidência:** [CT01.png](../testes/evidencias/CT01.png)

### CT02 — Criar grupo com dados válidos

- **Requisito:** RF01
- **Pré-condição:** CT01
- **Passos:** preencher nome e descrição e clicar em **Criar e entrar**
- **Entrada:** nome "Turma de ADS"; descrição "Grupo de estudos do 4º semestre"
- **Esperado:** o grupo é criado e o sistema abre o painel dele
- **Observado:** abriu o painel do grupo "Turma de ADS", com 0 atividades e a mensagem orientando a criar a primeira
- **Situação:** Aprovado
- **Evidência:** [CT02.png](../testes/evidencias/CT02.png)

### CT03 — Cadastrar membro sem nome e com e-mail inválido

- **Requisito:** RF02, RNF03
- **Pré-condição:** CT02; tela Membros
- **Passos:** deixar o nome vazio, preencher o e-mail e clicar em **Adicionar**
- **Entrada:** nome vazio; e-mail "lucas@"
- **Esperado:** o membro não é cadastrado e cada campo mostra o seu erro
- **Observado:** cadastro recusado, com "O nome do membro é obrigatório." e "E-mail inválido."
- **Situação:** Aprovado
- **Evidência:** [CT03.png](../testes/evidencias/CT03.png)

### CT04 — Cadastrar membros com perfis diferentes

- **Requisito:** RF02, RN07
- **Pré-condição:** CT03
- **Passos:** cadastrar o primeiro membro como organizador, identificar-se como ele e cadastrar o segundo como participante
- **Entrada:** "Lucas Prado", função "Banco de dados", e-mail "lucas@exemplo.com", perfil Organizador; "Marina Alves", função "Front-end", perfil Participante
- **Esperado:** os dois aparecem na lista com o perfil escolhido
- **Observado:** a tela mostrou "2 pessoas no grupo", com Lucas como organizador e Marina como participante
- **Situação:** Aprovado
- **Evidência:** [CT04.png](../testes/evidencias/CT04.png)

### CT05 — Cadastrar disciplinas

- **Requisito:** RF13
- **Pré-condição:** CT04, identificado como Lucas (organizador); tela Disciplinas
- **Passos:** cadastrar duas disciplinas
- **Entrada:** "Banco de Dados"; "Engenharia de Software"
- **Esperado:** as duas aparecem na lista
- **Observado:** as duas aparecem, cada uma com "0 conteúdos · 0 atividades"; o contador mostrou 2 disciplinas
- **Situação:** Aprovado
- **Evidência:** [CT05.png](../testes/evidencias/CT05.png)

### CT06 — Disciplina sem nome e com nome repetido

- **Requisito:** RF13, RN01
- **Pré-condição:** CT05
- **Passos:** clicar em **Cadastrar** com o nome vazio; depois tentar cadastrar um nome já existente com letras minúsculas
- **Entrada:** nome vazio; "banco de dados"
- **Esperado:** as duas tentativas são recusadas, cada uma com sua mensagem
- **Observado:** nome vazio: "Informe o nome da disciplina."; "banco de dados": "Este grupo já tem uma disciplina com esse nome."; a lista continuou com 2 disciplinas
- **Situação:** Aprovado
- **Evidência:** [CT06.png](../testes/evidencias/CT06.png)

### CT07 — Cadastrar conteúdos e recusar nome repetido

- **Requisito:** RF14, RN13
- **Pré-condição:** CT06; abrir **Conteúdos** de "Banco de Dados"
- **Passos:** cadastrar dois conteúdos; depois tentar repetir o primeiro em minúsculas
- **Entrada:** "Modelagem" (descrição "Diagrama ER e normalização"); "SQL"; "modelagem"
- **Esperado:** os dois primeiros são cadastrados; o repetido é recusado
- **Observado:** "Modelagem" e "SQL" cadastrados; "modelagem" recusado com "Esta disciplina já tem um conteúdo com esse nome."
- **Situação:** Aprovado
- **Evidência:** [CT07.png](../testes/evidencias/CT07.png)

### CT08 — Salvar atividade com campos obrigatórios vazios

- **Requisito:** RF03, RN06, RN13
- **Pré-condição:** CT07; tela Nova atividade
- **Passos:** clicar em **Criar atividade** sem preencher nada; depois preencher só um título curto e tentar de novo
- **Entrada:** formulário vazio; título "ER"
- **Esperado:** nada é salvo; título, prazo e conteúdo indicam erro; título com menos de 3 caracteres é recusado
- **Observado:** nada foi salvo. Mensagens: "Informe um título para a atividade.", "Defina um prazo de entrega." e "Escolha o conteúdo a que a atividade pertence."; com "ER": "O título precisa ter pelo menos 3 caracteres."
- **Situação:** Aprovado
- **Evidência:** [CT08.png](../testes/evidencias/CT08.png)

### CT09 — Cadastrar atividades válidas com peso

- **Requisito:** RF03, RN09
- **Pré-condição:** CT08
- **Passos:** cadastrar duas atividades em Banco de Dados › Modelagem e abrir a lista de atividades
- **Entrada:** "Modelar o diagrama ER", peso 3, prazo 26/10/2026, responsável Lucas Prado; "Normalizar as tabelas até a 3FN", peso 1, prazo 16/10/2026, responsável Marina Alves
- **Esperado:** as duas são salvas e aparecem na lista com disciplina › conteúdo, prazo e responsável
- **Observado:** ao salvar, o sistema abriu o detalhe da atividade criada; a lista mostrou "2 atividades encontradas", ambas com "Banco de Dados › Modelagem"
- **Situação:** Aprovado
- **Evidência:** [CT09.png](../testes/evidencias/CT09.png)

### CT10 — Cadastrar atividade sem responsável

- **Requisito:** RF03, RN06, RN10
- **Pré-condição:** CT09
- **Passos:** cadastrar uma atividade deixando "Sem responsável"
- **Entrada:** "Resolver a lista de SELECT", Banco de Dados › SQL, peso 2, prazo 23/10/2026, sem responsável
- **Esperado:** a atividade é salva, porque o responsável é opcional
- **Observado:** salva e aberta no detalhe, com "Sem responsável — não gera experiência."
- **Situação:** Aprovado
- **Evidência:** [CT10.png](../testes/evidencias/CT10.png)

### CT11 — Concluir atividade: progresso e experiência

- **Requisito:** RF05, RF10, RF11, RF15, RN08, RN10, RN14
- **Pré-condição:** CT10. Banco de Dados tem 6 pontos de peso: Modelagem 4 (3 + 1) e SQL 2
- **Passos:** abrir "Modelar o diagrama ER" e mudar o status para **Concluído**; conferir Disciplinas e Membros
- **Entrada:** status Concluído
- **Esperado:** Modelagem = 3 ÷ 4 = 75%; Banco de Dados = 3 ÷ 6 = 50% (razão de pesos, não a média 37,5% dos conteúdos); Lucas recebe 3 × 10 = 30 de experiência
- **Observado:** antes: Modelagem 0%, Banco de Dados 0%, Lucas 0 XP. Depois: Modelagem 75%, SQL 0%, Banco de Dados 50%, Lucas 30 XP. O detalhe mostrou o retorno "Atividade concluída", com a barra de 0% para 75% e "+30 XP"
- **Situação:** Aprovado
- **Evidência:** [CT11a.png](../testes/evidencias/CT11a.png) (retorno da conclusão), [CT11b.png](../testes/evidencias/CT11b.png) (progresso nas disciplinas)

### CT12 — Reverter a conclusão e concluir de novo

- **Requisito:** RN10
- **Pré-condição:** CT11
- **Passos:** voltar o status de "Modelar o diagrama ER" para **A fazer**; depois concluí-la de novo pelo check do cartão, na lista
- **Entrada:** status A fazer; clique no check
- **Esperado:** ao reverter, a experiência é estornada e o progresso volta; ao concluir de novo, o crédito acontece uma única vez
- **Observado:** ao reverter: Modelagem 0%, Lucas 0 XP. Ao concluir de novo: Modelagem 75%, Lucas 30 XP (não dobrou)
- **Situação:** Aprovado
- **Evidência:** [CT12.png](../testes/evidencias/CT12.png)

### CT13 — Concluir atividade sem responsável

- **Requisito:** RN10, RN14
- **Pré-condição:** CT12
- **Passos:** concluir "Resolver a lista de SELECT" pelo check do cartão
- **Entrada:** clique no check
- **Esperado:** o progresso sobe (SQL 100%; Banco de Dados 5 ÷ 6 = 83%) e ninguém recebe experiência
- **Observado:** SQL 100%, Banco de Dados 83%; experiência total do grupo continuou 30
- **Situação:** Aprovado
- **Evidência:** [CT13.png](../testes/evidencias/CT13.png)

### CT14 — Busca, filtro por responsável e situação

- **Requisito:** RF04, RN05
- **Pré-condição:** CT13; tela Atividades
- **Passos:** buscar um termo; limpar e filtrar por responsável; limpar e clicar na situação **Atrasadas**
- **Entrada:** busca "select"; responsável Marina Alves; situação Atrasadas
- **Esperado:** 1 resultado em cada caso; a atrasada é a de prazo 16/10, ainda não concluída
- **Observado:** busca: 1 resultado; Marina: 1; Atrasadas: 1 ("Normalizar as tabelas até a 3FN")
- **Situação:** Aprovado
- **Evidência:** [CT14.png](../testes/evidencias/CT14.png)

### CT15 — Totais do painel

- **Requisito:** RF06, RN05
- **Pré-condição:** CT14
- **Passos:** abrir o Painel
- **Entrada:** —
- **Esperado:** 1 a fazer, 0 fazendo, 2 concluídas e 1 atrasada, conforme as 3 atividades cadastradas
- **Observado:** 1 a fazer, 0 fazendo, 2 concluídas, 1 atrasada
- **Situação:** Aprovado
- **Evidência:** [CT15.png](../testes/evidencias/CT15.png)

### CT16 — Dados recuperados ao reabrir o navegador

- **Requisito:** RNF02
- **Pré-condição:** CT15
- **Passos:** recarregar a página; fechar o navegador; abrir de novo com os mesmos dados do navegador
- **Entrada:** —
- **Esperado:** grupo, cadastros, progresso e sessão continuam lá
- **Observado:** o grupo, as 3 atividades e o progresso de Banco de Dados (83%) foram recuperados, já dentro da sessão
- **Situação:** Aprovado
- **Evidência:** [CT16.png](../testes/evidencias/CT16.png)

### CT17 — Participante não vê a gestão do grupo

- **Requisito:** RN07
- **Pré-condição:** CT16
- **Passos:** sair, entrar em "Turma de ADS" como Marina Alves e abrir Disciplinas e Membros
- **Entrada:** identificação como participante
- **Esperado:** sem cadastro, edição ou remoção de disciplinas; sem adicionar membro; sem excluir o grupo
- **Observado:** Disciplinas sem formulário e sem Editar/Remover; Membros sem "Adicionar membro" e sem "Excluir o grupo"
- **Situação:** Aprovado
- **Evidência:** [CT17.png](../testes/evidencias/CT17.png), [CT17b.png](../testes/evidencias/CT17b.png)

### CT18 — Participante cadastra atividade

- **Requisito:** RN07
- **Pré-condição:** CT17, ainda como Marina
- **Passos:** cadastrar uma atividade
- **Entrada:** "Criar as tabelas no MySQL", Banco de Dados › SQL, peso 2, prazo 29/10/2026, responsável Marina Alves
- **Esperado:** o participante consegue cadastrar atividade
- **Observado:** cadastro feito normalmente e detalhe aberto
- **Situação:** Aprovado
- **Evidência:** [CT18.png](../testes/evidencias/CT18.png)

### CT19 — Grupo não fica sem o último organizador

- **Requisito:** RN07
- **Pré-condição:** CT18; sair e entrar como Lucas Prado
- **Passos:** em Membros, editar Lucas e mudar o perfil para Participante
- **Entrada:** perfil Participante
- **Esperado:** a alteração é recusada, porque Lucas é o único organizador
- **Observado:** recusada com "O grupo precisa de pelo menos um organizador."
- **Situação:** Aprovado
- **Evidência:** [CT19.png](../testes/evidencias/CT19.png)

### CT20 — Remover membro mantém as atividades

- **Requisito:** RF02, RN02
- **Pré-condição:** CT19
- **Passos:** remover Marina Alves e confirmar; abrir Atividades
- **Entrada:** confirmação da remoção
- **Esperado:** as atividades dela continuam no grupo, sem responsável
- **Observado:** as 4 atividades continuam; as duas que eram de Marina ficaram sem responsável
- **Situação:** Aprovado
- **Evidência:** [CT20a.png](../testes/evidencias/CT20a.png) (confirmação), [CT20b.png](../testes/evidencias/CT20b.png) (lista depois)

### CT21 — Encerrar sessão e acesso a rota privada

- **Requisito:** RF09
- **Pré-condição:** CT20
- **Passos:** clicar em **Sair**; depois digitar `/painel` no endereço
- **Entrada:** —
- **Esperado:** volta para a tela de acesso; a rota privada não abre sem sessão
- **Observado:** Sair levou a `/login`; `/painel` redirecionou para `/login`
- **Situação:** Aprovado
- **Evidência:** [CT21.png](../testes/evidencias/CT21.png)

### CT22 — Tema mantido após recarregar

- **Requisito:** RF08
- **Pré-condição:** CT21; entrar de novo como Lucas
- **Passos:** trocar o tema e recarregar a página
- **Entrada:** clique no botão de tema
- **Esperado:** o tema escolhido continua depois de recarregar
- **Observado:** o tema passou de escuro para claro e continuou claro depois de recarregar
- **Situação:** Aprovado
- **Evidência:** [CT22.png](../testes/evidencias/CT22.png)

### CT23 — Remover disciplina em cascata

- **Requisito:** RF13, RN02
- **Pré-condição:** CT22; tela Disciplinas
- **Passos:** remover "Banco de Dados" e confirmar; abrir Atividades
- **Entrada:** confirmação da remoção
- **Esperado:** a confirmação avisa o que sai junto; a disciplina, seus conteúdos e suas atividades são removidos
- **Observado:** a confirmação avisou "Banco de Dados será removida do grupo, junto com 2 conteúdos e as atividades deles."; depois, a disciplina saiu da lista e as 4 atividades saíram junto; a tela de atividades mostrou "Comece pelas disciplinas"
- **Situação:** Aprovado
- **Evidência:** [CT23a.png](../testes/evidencias/CT23a.png) (confirmação), [CT23b.png](../testes/evidencias/CT23b.png) (lista vazia)

### CT24 — Serviços externos indisponíveis

- **Requisito:** RNF10, RN15, RN17
- **Pré-condição:** CT23, executado sem acesso a BrasilAPI, Nager.Date e DiceBear
- **Passos:** abrir o Painel
- **Entrada:** —
- **Esperado:** a tela funciona; o avatar mostra as iniciais; o usuário é avisado de que os feriados não carregaram
- **Observado:** o painel abriu normalmente; o avatar mostrou "LP"; o calendário avisou "Não foi possível carregar os feriados agora."
- **Situação:** Aprovado
- **Evidência:** [CT24.png](../testes/evidencias/CT24.png)

### CT25 — Carregar dados de exemplo

- **Requisito:** RF20
- **Pré-condição:** navegador sem dados
- **Passos:** na tela de acesso, clicar em **Carregar dados de exemplo** e escolher Ana Souza
- **Entrada:** —
- **Esperado:** um grupo preenchido é criado e o sistema entra nele
- **Observado:** grupo "Trio do TCC" com 3 disciplinas, 6 atividades e 3 membros; entrou no painel como Ana Souza (organizadora)
- **Situação:** Aprovado
- **Evidência:** [CT25.png](../testes/evidencias/CT25.png)

### CT26 — Primeiro membro do grupo cadastrado como participante

- **Requisito:** RF02, RN07
- **Pré-condição:** navegador sem dados
- **Passos:** criar o grupo; em Membros, cadastrar o primeiro membro com perfil Participante; identificar-se como ele
- **Entrada:** grupo "Grupo Novo"; membro "Rafael Costa", perfil Participante
- **Esperado:** o sistema não deixa o grupo sem organizador — recusa o cadastro ou torna esse primeiro membro organizador
- **Observado:** o cadastro foi aceito. O grupo ficou só com um participante e sem organizador; ninguém consegue mais adicionar membros, cadastrar disciplina ou conteúdo
- **Situação:** **Reprovado** — defeito [D01](16-defeitos-e-pendencias.md#d01)
- **Evidência:** [CT26.png](../testes/evidencias/CT26.png)

### CT27 — Falha de gravação no armazenamento do navegador

- **Requisito:** RNF02
- **Pré-condição:** navegador sem dados; grupo "Grupo Cheio" criado
- **Passos:** simular o armazenamento do navegador cheio (a gravação passa a ser recusada pelo navegador); cadastrar uma disciplina; restaurar o armazenamento e recarregar a página
- **Entrada:** disciplina "Estatística"
- **Esperado:** o usuário é avisado de que o cadastro não foi salvo
- **Observado:** a disciplina apareceu na tela como se tivesse sido salva, sem nenhum aviso; depois de recarregar, ela sumiu
- **Situação:** **Reprovado** — defeito [D02](16-defeitos-e-pendencias.md#d02)
- **Evidência:** [CT27a.png](../testes/evidencias/CT27a.png) (aparente sucesso), [CT27b.png](../testes/evidencias/CT27b.png) (depois de recarregar)

### CT28 — Aviso de prazo em fim de semana

- **Requisito:** RF22
- **Pré-condição:** dados de exemplo carregados (CT25); tela Atividades
- **Passos:** comparar o aviso de cada cartão com o dia da semana do prazo
- **Entrada:** —
- **Esperado:** o aviso aparece só nos prazos de sábado ou domingo
- **Observado:** 3 das 6 atividades mostraram "Esse prazo cai num fim de semana" (17/10, 24/10 e 31/10/2026, todos sábados); as de dia útil não mostraram
- **Situação:** Aprovado
- **Evidência:** [CT28.png](../testes/evidencias/CT28.png)

### CT29 — Filtro por disciplina na lista de atividades

- **Requisito:** RF04
- **Pré-condição:** dados de exemplo carregados; tela Atividades
- **Passos:** procurar no painel de filtros a opção de filtrar por disciplina; em seguida, buscar o nome de uma disciplina no campo de busca
- **Entrada:** busca "Metodologia"
- **Esperado:** um filtro próprio por disciplina, como o RF04 descreve
- **Observado:** o painel tem Buscar, Responsável, Prazo e Ordenar por, mas não tem filtro por disciplina. A busca por "Metodologia" retornou 1 atividade, mas a busca também procura no título e no conteúdo, e por isso não substitui o filtro
- **Situação:** **Reprovado** — defeito [D07](16-defeitos-e-pendencias.md#d07)
- **Evidência:** [CT29.png](../testes/evidencias/CT29.png)

---

## O que não foi testado nesta entrega

| Item | Motivo |
|---|---|
| RF07 e RF21 — feriados no prazo e no calendário | Dependem da BrasilAPI ou da Nager.Date, inacessíveis no ambiente de teste. Ficam para o ciclo de 06/11, executados com acesso à internet |
| RNF01 — responsividade | Fora do recorte desta entrega |
| RNF05 — Firefox e Edge | Executado apenas no Chromium |
| RF12, RF16, RF17 e RF18 | Ainda não implementados; previstos no [backlog](12-backlog.md) |

---

### Navegação

[⬅ Anterior: Produto Mínimo Viável](14-mvp.md) · [Índice](../README.md) · [Próximo: Defeitos e Pendências ➡](16-defeitos-e-pendencias.md)
