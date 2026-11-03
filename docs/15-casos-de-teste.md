# 15 · Casos de Teste

> **Vértice** — Plataforma de Acompanhamento de Aprendizagem
> Imersão Profissional: Projeto de Software · ADSIS4S · 2º bimestre · Entrega de 06/11/2026

---

Este documento registra os testes executados sobre a versão da entrega de 06/11. Cada caso informa o requisito ou a regra que verifica, os passos, a entrada, o resultado esperado e o resultado observado na execução real. As evidências estão em [`testes/evidencias-06-11/`](../testes/evidencias-06-11/), com o nome do caso no arquivo.

O ciclo de testes da entrega de 20/10 está resumido no [fim deste documento](#ciclo-de-2010). Defeitos encontrados estão no [Registro de Defeitos e Pendências](16-defeitos-e-pendencias.md).

---

## Condições de execução

| Item | Valor |
|---|---|
| Data da execução | 01/11/2026, das 22h59 às 23h03 |
| Versão testada | Vértice 2.0.0 — o código de `src/` na versão marcada pela tag `entrega-06-11-2026` |
| Como a aplicação foi executada | `npm ci`, `npm run build` e `npm run preview`, dentro de `src/` |
| Ambiente | Node.js 22.22.0, npm 10.9.4, Chromium 141, tela de 1440 × 1000; no CT34 e em parte do CT43 e do CT46, 390 × 844, tamanho de celular — no CT43, também com tela de toque; no CT46, também 1024 × 800 |
| Forma de execução | Roteiro automatizado no navegador (Playwright), seguindo os passos de cada caso; as capturas de tela são da própria execução |
| Dados | Fictícios, cadastrados durante o próprio teste. CT28 a CT30, CT34, CT37 a CT39 e CT41 a CT46 usam os dados de exemplo do sistema; CT31, CT35 e CT36 partem de dados gravados no formato das versões anteriores. As fotos são uma imagem PNG de 640 × 480, uma imagem de 400 × 300 dividida em cores, para conferir o recorte, e uma foto de celular de 4000 × 3000, com 4,9 MB |
| Rede | O ambiente de teste não acessa a internet. As respostas da BrasilAPI foram simuladas com a relação de feriados nacionais de 2026 e 2027, no formato do serviço; a Nager.Date ficou indisponível o tempo todo. Os avatares não usam rede: são desenhados pelo próprio sistema. O CT27 derruba também a BrasilAPI, para verificar as alternativas locais, e bloqueia a DiceBear, para conferir que os avatares não dependem dela |

Os casos CT01 a CT26 formam **um único cenário em sequência**: cada um parte do estado deixado pelo anterior. CT28 a CT30 seguem um segundo cenário, com os dados de exemplo, e CT37 e CT38 um terceiro. Os demais começam com o navegador limpo; o CT43 usa ainda um navegador com tela de celular e toque e outro com a opção "reduzir movimento" do sistema operacional, e o CT45 também usa um com essa opção. Em todos os cenários, o roteiro também conferiu que o console do navegador não registrou nenhum erro, com exceção do CT27, que derruba os serviços externos de propósito.

Durante o desenvolvimento o roteiro foi executado outras vezes. As falhas do próprio roteiro foram corrigidas nele; as falhas do sistema encontradas nessas execuções e na revisão dos documentos estão registradas como [D08](16-defeitos-e-pendencias.md#d08), [D09](16-defeitos-e-pendencias.md#d09) e [D10](16-defeitos-e-pendencias.md#d10). O resultado abaixo é o da execução completa, depois das correções e dos ajustes de 29/10 e de 01/11. As datas de prazo dos casos são contadas a partir do dia da execução.

---

## Resumo

| Situação | Casos |
|---|---|
| Aprovado | 47 |
| Reprovado | 0 |
| **Total executado** | **47** |

Além dos casos de teste, foram executadas as verificações automatizadas do projeto:

| Verificação | Comando | Resultado | Registro |
|---|---|---|---|
| Regras de migração, progresso, experiência, perfis, atividades, ofensiva, conquistas, permissões, recorte da foto e avatares | `npm run verificar` | 189 verificações, todas passaram | [`verificar.txt`](../testes/registros/verificar.txt) |
| Instalação e geração da versão de produção | `npm ci` e `npm run build` | Concluído sem erro, sem vulnerabilidades nas dependências | [`build.txt`](../testes/registros/build.txt) |
| Registro da execução dos casos | roteiro no navegador | Observações de cada caso, na ordem em que foram conferidas | [`casos-de-teste-06-11.json`](../testes/registros/casos-de-teste-06-11.json) |

Os defeitos do ciclo de 20/10 foram corrigidos e testados de novo neste ciclo; a relação de cada defeito com o seu novo teste está no [registro de defeitos](16-defeitos-e-pendencias.md).

---

## Visão geral

| Caso | Requisito / regra | O que verifica | Situação |
|---|---|---|---|
| CT01 | RF01, RNF03 | Criar grupo sem nome do grupo e sem o nome de quem cria | Aprovado |
| CT02 | RF01, RN07 | Criar grupo: quem cria entra como organizador | Aprovado |
| CT03 | RF02, RNF03 | Cadastrar membro sem nome e com e-mail inválido | Aprovado |
| CT04 | RF02, RF24, RN19 | Cadastrar membro com foto de perfil | Aprovado |
| CT05 | RF24, RN19, RNF03 | Foto de perfil com arquivo que não é imagem | Aprovado |
| CT06 | RF13, RF25, RN18 | Cadastrar disciplinas escolhendo a cor na paleta | Aprovado |
| CT07 | RF13, RNF03 | Disciplina sem nome e com nome repetido | Aprovado |
| CT08 | RF14, RN13 | Cadastrar conteúdos e recusar nome repetido | Aprovado |
| CT09 | RF03, RN06, RN13, RN20, RNF03 | Atividade: o formulário começa vazio e cobra os campos obrigatórios | Aprovado |
| CT10 | RF03, RN03, RN04, RN09 | Cadastrar atividades válidas com peso e responsável | Aprovado |
| CT11 | RF05, RF10, RF11, RF15, RF17, RN08, RN10, RN12, RN14 | Concluir atividade: progresso, experiência e conquista | Aprovado |
| CT12 | RN10, RN12 | Reverter a conclusão e concluir de novo | Aprovado |
| CT13 | RF04, RN05 | Busca e filtros por responsável, disciplina e situação, com a identidade visual | Aprovado |
| CT14 | RF06, RF11, RN05 | Totais do painel e progresso por disciplina | Aprovado |
| CT15 | RF23, RF25 | Calendário do mês com as cores das disciplinas | Aprovado |
| CT16 | RF23 | Calendário nas visões semana e lista | Aprovado |
| CT17 | RF03, RF23 | Nova atividade a partir de um dia do calendário | Aprovado |
| CT18 | RF16, RF17, RF18, RN11 | Painel de desempenho: experiência, ofensiva, conquistas e ranking | Aprovado |
| CT19 | RNF02 | Dados recuperados ao reabrir o navegador | Aprovado |
| CT20 | RN07 | Participante não vê a gestão do grupo | Aprovado |
| CT21 | RF02, RF03, RN07, RN20 | Participante cadastra atividade, altera só as próprias e edita o próprio perfil | Aprovado |
| CT22 | RN07 | Grupo não fica sem o último organizador | Aprovado |
| CT23 | RF02, RN02 | Remover membro: as atividades passam para quem assume | Aprovado |
| CT24 | RF09 | Encerrar sessão e acesso a rota privada | Aprovado |
| CT25 | RF08, RF26 | Tema claro e escuro em todas as telas, mantido após recarregar | Aprovado |
| CT26 | RF13, RN02 | Remover disciplina em cascata | Aprovado |
| CT27 | RNF10, RN15, RN17 | Serviços externos indisponíveis | Aprovado |
| CT28 | RF20 | Carregar dados de exemplo | Aprovado |
| CT29 | RF03, RF07, RF21, RF23 | Feriado no prazo e próximos feriados | Aprovado |
| CT30 | RF22 | Aviso de prazo em fim de semana | Aprovado |
| CT31 | RF02, RF18, RN07 | Grupo antigo sem membros: as telas funcionam e o primeiro membro é o organizador | Aprovado |
| CT32 | RNF02 | Falha de gravação no armazenamento do navegador | Aprovado |
| CT33 | RF26 | Páginas públicas: início, sobre nós e endereço inexistente | Aprovado |
| CT34 | RNF01 | Uso no celular | Aprovado |
| CT35 | RN06, RN18 | Dados da versão de 20/10 são migrados | Aprovado |
| CT36 | RNF02, RN07 | Dados da primeira versão (tarefas) com atividade sem grupo | Aprovado |
| CT37 | RF03, RN08, RN14 | Editar e excluir atividade | Aprovado |
| CT38 | RF01, RN02 | Excluir o grupo | Aprovado |
| CT39 | RF24, RN19 | Editor de foto: o que é enquadrado é o que fica gravado | Aprovado |
| CT40 | RF01, RF29, RN07, RN19 | Foto do grupo: na criação e na edição, e as iniciais quando não há foto | Aprovado |
| CT41 | RF30, RN07, RN13 | Criar conteúdo sem sair do cadastro de atividade | Aprovado |
| CT42 | RF05, RN07, RN20 | Só o responsável muda o status da atividade | Aprovado |
| CT43 | RF23, RNF01 | Calendário: troca de mês com animação, também deslizando o dedo | Aprovado |
| CT44 | RF03, RN06 | Campo de data com o calendário do sistema | Aprovado |
| CT45 | RNF06 | Marca do Vértice: dá um terço de volta enquanto o grupo abre e uma volta ao passar o mouse | Aprovado |
| CT46 | RNF01, RNF06 | Barra de seções no topo, também no celular | Aprovado |
| CT47 | RF19, RN15 | Avatar: cinco estilos para escolher e sortear | Aprovado |

---

## Casos de teste

### CT01 — Criar grupo sem nome do grupo e sem o nome de quem cria

- **Requisito:** RF01, RNF03
- **Pré-condição:** navegador sem dados; tela de acesso aberta
- **Passos:** deixar "Nome do grupo" e "Seu nome" vazios e clicar em **Criar grupo e entrar**
- **Entrada:** os dois nomes vazios
- **Esperado:** o grupo não é criado e cada campo informa o erro
- **Observado:** permaneceu na tela de acesso e exibiu "Dê um nome ao grupo." e "Informe o seu nome." abaixo dos campos
- **Situação:** Aprovado
- **Evidência:** [CT01.png](../testes/evidencias-06-11/CT01.png)

### CT02 — Criar grupo: quem cria entra como organizador

- **Requisito:** RF01, RN07
- **Pré-condição:** CT01
- **Passos:** preencher os campos e clicar em **Criar grupo e entrar**; abrir Membros
- **Entrada:** grupo "Turma de ADS"; seu nome "Lucas Prado"; descrição "Grupo de estudos do 4º semestre"; sem foto do grupo
- **Esperado:** o grupo é criado, quem criou vira o primeiro membro, com perfil de organizador, e o sistema abre o painel
- **Observado:** abriu o painel com a saudação para Lucas; em Membros, Lucas Prado é o único membro, com perfil Organizador
- **Situação:** Aprovado
- **Evidência:** [CT02a.png](../testes/evidencias-06-11/CT02a.png) (painel), [CT02b.png](../testes/evidencias-06-11/CT02b.png) (membros)

### CT03 — Cadastrar membro sem nome e com e-mail inválido

- **Requisito:** RF02, RNF03
- **Pré-condição:** CT02; tela Membros
- **Passos:** clicar em **Adicionar membro**, deixar o nome vazio, preencher o e-mail e clicar em **Adicionar**
- **Entrada:** nome vazio; e-mail "marina@"
- **Esperado:** o membro não é cadastrado e os dois campos informam o erro
- **Observado:** "O nome do membro é obrigatório." e "E-mail inválido."; o formulário continuou aberto
- **Situação:** Aprovado
- **Evidência:** [CT03.png](../testes/evidencias-06-11/CT03.png)

### CT04 — Cadastrar membro com foto de perfil

- **Requisito:** RF02, RF24, RN19
- **Pré-condição:** CT03, com o formulário aberto
- **Passos:** preencher os dados, clicar em **Enviar foto** e escolher a imagem; no editor, aumentar o zoom e clicar em **Aplicar**; clicar em **Adicionar**
- **Entrada:** "Marina Alves"; função "Front-end"; e-mail "marina@exemplo.com"; foto PNG de 640 × 480; zoom 1,5
- **Esperado:** o editor abre com a foto escolhida; o membro é cadastrado com a foto enquadrada, recortada em quadrado e reduzida antes de ser gravada
- **Observado:** o editor "Ajustar foto" abriu com a foto, sem zoom; depois de aplicar, o formulário mostrou a foto enquadrada. Marina entrou como Participante, com a foto no cartão, gravada em JPEG, com 256 × 256 pixels e 7 KB
- **Situação:** Aprovado
- **Evidência:** [CT04a.png](../testes/evidencias-06-11/CT04a.png) (editor), [CT04b.png](../testes/evidencias-06-11/CT04b.png) (formulário com a foto), [CT04c.png](../testes/evidencias-06-11/CT04c.png) (membros)

### CT05 — Foto de perfil com arquivo que não é imagem

- **Requisito:** RF24, RN19, RNF03
- **Pré-condição:** CT04
- **Passos:** abrir **Editar** no cartão de Lucas Prado, clicar em **Enviar foto** e escolher um arquivo de texto
- **Entrada:** arquivo `documento.txt`
- **Esperado:** o arquivo é recusado com mensagem, o editor não abre e nenhuma foto é gravada
- **Observado:** "Escolha uma imagem JPG, PNG ou WebP."; o editor não abriu, e o cadastro continuou com o avatar sorteado
- **Situação:** Aprovado
- **Evidência:** [CT05.png](../testes/evidencias-06-11/CT05.png)

### CT06 — Cadastrar disciplinas escolhendo a cor na paleta

- **Requisito:** RF13, RF25, RN18
- **Pré-condição:** CT05; tela Disciplinas
- **Passos:** abrir **Nova disciplina**, conferir a paleta e cadastrar com a cor sugerida; abrir de novo, escolher outra cor e cadastrar
- **Entrada:** "Banco de Dados" com a cor sugerida; "Engenharia de Software" com a cor Laranja
- **Esperado:** a paleta oferece as 18 cores, cada disciplina nova vem com uma cor ainda não usada, e a cor escolhida é gravada
- **Observado:** paleta com 18 cores; a primeira veio com Azul e a segunda com outra cor sugerida; gravadas Azul (`#3b82f6`) e Laranja (`#f97316`); a tela mostra "2 disciplinas · 0 conteúdos"
- **Situação:** Aprovado
- **Evidência:** [CT06a.png](../testes/evidencias-06-11/CT06a.png) (paleta), [CT06b.png](../testes/evidencias-06-11/CT06b.png) (disciplinas)

### CT07 — Disciplina sem nome e com nome repetido

- **Requisito:** RF13, RNF03
- **Pré-condição:** CT06
- **Passos:** abrir **Nova disciplina** e clicar em **Cadastrar** sem nome; depois, informar um nome que já existe com letras minúsculas
- **Entrada:** nome vazio; "banco de dados"
- **Esperado:** as duas tentativas são recusadas com mensagem no campo
- **Observado:** "Informe o nome da disciplina." e "Este grupo já tem uma disciplina com esse nome."; continuaram 2 disciplinas
- **Situação:** Aprovado
- **Evidência:** [CT07.png](../testes/evidencias-06-11/CT07.png)

### CT08 — Cadastrar conteúdos e recusar nome repetido

- **Requisito:** RF14, RN13
- **Pré-condição:** CT07
- **Passos:** abrir Banco de Dados, cadastrar dois conteúdos e tentar um terceiro com nome repetido; em Engenharia de Software, cadastrar o conteúdo usado no CT17
- **Entrada:** "Modelagem" (descrição "Diagrama ER e normalização"), "SQL" e "modelagem"; "Testes" em Engenharia de Software
- **Esperado:** os dois primeiros são gravados na ordem de cadastro e o repetido é recusado
- **Observado:** "Esta disciplina já tem um conteúdo com esse nome."; a disciplina ficou com Modelagem e SQL, nessa ordem
- **Situação:** Aprovado
- **Evidência:** [CT08a.png](../testes/evidencias-06-11/CT08a.png) (recusa), [CT08b.png](../testes/evidencias-06-11/CT08b.png) (conteúdos)

### CT09 — Atividade: o formulário começa vazio e cobra os campos obrigatórios

- **Requisito:** RF03, RN06, RN13, RN20, RNF03
- **Pré-condição:** CT08; tela Nova atividade
- **Passos:** conferir os campos ao abrir; clicar em **Criar atividade** com tudo vazio; depois, tentar com um título curto
- **Entrada:** campos vazios; título "ER"
- **Esperado:** nenhum campo vem escolhido; a atividade não é salva, e cada campo obrigatório informa o erro — o responsável inclusive; peso, status e prioridade, que são opcionais, não são cobrados
- **Observado:** disciplina, conteúdo, prazo, responsável, status e prioridade abriram só com o texto de exemplo ("Selecione a disciplina", "Selecione a data" e assim por diante), sem nenhum peso marcado, e o status travado até o responsável escolhido ser quem está cadastrando. Com os campos vazios: "Informe um título para a atividade.", "Escolha o conteúdo a que a atividade pertence.", "Defina um prazo de entrega." e "Escolha o responsável pela atividade.", e nenhuma mensagem em peso, status ou prioridade. Com "ER": "O título precisa ter pelo menos 3 caracteres.". Nenhuma atividade foi gravada
- **Situação:** Aprovado
- **Evidência:** [CT09a.png](../testes/evidencias-06-11/CT09a.png) (formulário vazio), [CT09b.png](../testes/evidencias-06-11/CT09b.png) (campos obrigatórios), [CT09c.png](../testes/evidencias-06-11/CT09c.png) (título curto)

### CT10 — Cadastrar atividades válidas com peso e responsável

- **Requisito:** RF03, RN03, RN04, RN09
- **Pré-condição:** CT09
- **Passos:** cadastrar três atividades em Banco de Dados, escolhendo o prazo no calendário do campo e sem escolher o status
- **Entrada:** "Modelar o diagrama ER" (Modelagem, peso 3, prazo 03/11, Lucas Prado); "Normalizar as tabelas até a 3FN" (Modelagem, sem escolher o peso, prazo 30/10, Marina Alves); "Resolver a lista de SELECT" (SQL, peso 2, prazo 08/11, Marina Alves)
- **Esperado:** as três são gravadas, cada uma com o seu responsável; sem peso escolhido, a atividade vale 1; sem status escolhido, começa em "a fazer"
- **Observado:** a lista mostra "3 atividades encontradas", todas com responsável; "Normalizar as tabelas até a 3FN" foi gravada com peso 1, e as três com status "a fazer"
- **Situação:** Aprovado
- **Evidência:** [CT10a.png](../testes/evidencias-06-11/CT10a.png) (detalhe da última), [CT10b.png](../testes/evidencias-06-11/CT10b.png) (lista)

### CT11 — Concluir atividade: progresso, experiência e conquista

- **Requisito:** RF05, RF10, RF11, RF15, RF17, RN08, RN10, RN12, RN14
- **Pré-condição:** CT10
- **Passos:** conferir o progresso de Banco de Dados e a experiência de Lucas; abrir "Modelar o diagrama ER", da qual Lucas é o responsável, e clicar em **Concluir**
- **Entrada:** —
- **Esperado:** Modelagem vai a 75% (3 de 4 de peso), Banco de Dados a 50% (3 de 6), Lucas recebe 30 de experiência (peso 3 × 10) e a conquista Primeiro Passo
- **Observado:** o retorno da conclusão mostrou "Modelagem foi de 0% para 75%." e "+30 XP"; apareceu o aviso "Você conquistou: Primeiro Passo"; Banco de Dados foi de 0% para 50% e Lucas de 0 para 30 XP
- **Situação:** Aprovado
- **Evidência:** [CT11a.png](../testes/evidencias-06-11/CT11a.png) (retorno da conclusão), [CT11b.png](../testes/evidencias-06-11/CT11b.png) (disciplinas)

### CT12 — Reverter a conclusão e concluir de novo

- **Requisito:** RN10, RN12
- **Pré-condição:** CT11
- **Passos:** no detalhe, mudar o status para "A fazer"; conferir experiência, progresso e conquistas; concluir de novo pela lista
- **Entrada:** —
- **Esperado:** a experiência é estornada e o progresso volta, mas a conquista continua; ao concluir de novo, a experiência é creditada uma vez só
- **Observado:** Lucas voltou a 0 XP e Banco de Dados a 0%; Primeiro Passo continuou como conquistada. Concluída de novo, Lucas ficou com 30 XP, e não 60, e há uma única conquista gravada
- **Situação:** Aprovado
- **Evidência:** [CT12.png](../testes/evidencias-06-11/CT12.png)

### CT13 — Busca e filtros por responsável, disciplina e situação, com a identidade visual

- **Requisito:** RF04, RN05
- **Pré-condição:** CT12; tela Atividades
- **Passos:** buscar por texto; abrir o filtro de responsável e escolher um membro; abrir o filtro de disciplina e escolher cada disciplina; abrir **Ordenar por** e escolher "Maior peso"; filtrar pela situação Atrasadas
- **Entrada:** busca "select"; responsável Marina Alves; disciplinas Engenharia de Software e Banco de Dados; ordem "Maior peso"; situação Atrasadas
- **Esperado:** cada filtro mostra só as atividades que correspondem a ele; as opções mostram a foto ou o avatar de cada responsável, a cor de cada disciplina e um símbolo para cada ordem, e o campo repete a marca da opção escolhida
- **Observado:** "select" → 1 atividade. No filtro de responsável, Marina aparece com a foto dela e Lucas como "Lucas Prado (você)"; Marina → 2, com a foto dela no campo. No filtro de disciplina, Engenharia de Software aparece com a sua cor laranja; Engenharia de Software → 0; Banco de Dados → 3, com o filtro gravado no endereço da página e a cor azul no campo. As quatro ordens têm símbolo, e "Maior peso" pôs "Modelar o diagrama ER" em primeiro. Atrasadas → 1, "Normalizar as tabelas até a 3FN"
- **Situação:** Aprovado
- **Evidência:** [CT13a.png](../testes/evidencias-06-11/CT13a.png) (responsável), [CT13b.png](../testes/evidencias-06-11/CT13b.png) (disciplina), [CT13c.png](../testes/evidencias-06-11/CT13c.png) (ordenar por), [CT13d.png](../testes/evidencias-06-11/CT13d.png) (atrasadas)

### CT14 — Totais do painel e progresso por disciplina

- **Requisito:** RF06, RF11, RN05
- **Pré-condição:** CT13; Painel
- **Passos:** conferir os totais, a barra de Banco de Dados e o quadro "Seu ritmo"; clicar em Concluídas
- **Entrada:** —
- **Esperado:** totais por situação corretos, progresso por disciplina e a lista do painel filtrada pela situação escolhida
- **Observado:** A fazer 2, Fazendo 0, Concluídas 1, Atrasadas 1; Banco de Dados em 50%; "Seu ritmo" com ofensiva de 1 dia e 30 XP; ao clicar em Concluídas, a lista do painel passou a mostrar as concluídas
- **Situação:** Aprovado
- **Evidência:** [CT14.png](../testes/evidencias-06-11/CT14.png)

### CT15 — Calendário do mês com as cores das disciplinas

- **Requisito:** RF23, RF25
- **Pré-condição:** CT14; tela Calendário
- **Passos:** conferir o mês; voltar a outubro e conferir o dia 30 e o painel do dia; ocultar Banco de Dados no filtro de disciplinas
- **Entrada:** —
- **Esperado:** cada entrega aparece no seu dia, na cor da disciplina; ocultar uma disciplina tira as entregas dela
- **Observado:** título "Novembro de 2026"; em outubro, o dia 30 mostra "Normalizar as tabelas até a 3FN" com a marca azul de Banco de Dados, e o painel do dia a indica como atrasada; ocultando Banco de Dados, a entrega sai do dia
- **Situação:** Aprovado
- **Evidência:** [CT15a.png](../testes/evidencias-06-11/CT15a.png) (mês), [CT15b.png](../testes/evidencias-06-11/CT15b.png) (disciplina oculta)

### CT16 — Calendário nas visões semana e lista

- **Requisito:** RF23
- **Pré-condição:** CT15
- **Passos:** trocar para a visão **Semana** e depois para **Lista**
- **Entrada:** —
- **Esperado:** a semana mostra as entregas dos seus dias e a lista agrupa as entregas do mês por dia
- **Observado:** semana de 01/11 a 07/11 com as atividades dela; a lista agrupou as entregas do mês em Ter, 03/11 e Dom, 08/11
- **Situação:** Aprovado
- **Evidência:** [CT16a.png](../testes/evidencias-06-11/CT16a.png) (semana), [CT16b.png](../testes/evidencias-06-11/CT16b.png) (lista)

### CT17 — Nova atividade a partir de um dia do calendário

- **Requisito:** RF03, RF23
- **Pré-condição:** CT16
- **Passos:** avançar para o mês seguinte (dezembro), escolher o dia 6, clicar em **Nova atividade neste dia**, preencher e criar; voltar ao calendário
- **Entrada:** "Escrever os casos de teste"; Engenharia de Software › Testes; peso 2; responsável Lucas Prado
- **Esperado:** o prazo já vem preenchido com o dia escolhido, e a atividade aparece nesse dia na cor da disciplina
- **Observado:** o prazo veio como "Domingo, 06 de dezembro de 2026"; a atividade aparece no dia 6, com a marca laranja de Engenharia de Software
- **Situação:** Aprovado
- **Evidência:** [CT17a.png](../testes/evidencias-06-11/CT17a.png) (formulário), [CT17b.png](../testes/evidencias-06-11/CT17b.png) (calendário)

### CT18 — Painel de desempenho: experiência, ofensiva, conquistas e ranking

- **Requisito:** RF16, RF17, RF18, RN11
- **Pré-condição:** CT17; tela Conquistas, como Lucas
- **Passos:** conferir os números do topo, as conquistas e o ranking
- **Entrada:** —
- **Esperado:** experiência, ofensiva e posição de quem está usando, as seis conquistas com o andamento das que faltam, e o ranking do grupo
- **Observado:** 30 XP, ofensiva de 1 dia, 1º de 2 no grupo, 1 de 6 conquistas; Semana Cheia com "1 de 7 dias"; ranking com Lucas Prado em 1º e Marina Alves em 2º
- **Situação:** Aprovado
- **Evidência:** [CT18.png](../testes/evidencias-06-11/CT18.png)

### CT19 — Dados recuperados ao reabrir o navegador

- **Requisito:** RNF02
- **Pré-condição:** CT18
- **Passos:** recarregar a página; fechar o navegador e abri-lo de novo no sistema
- **Entrada:** —
- **Esperado:** nada se perde, e a sessão continua aberta
- **Observado:** depois de recarregar, continuou na tela Conquistas; reaberto, o navegador entrou direto no painel, com os totais preservados (A fazer 3, Concluídas 1, Atrasadas 1) e a foto da Marina gravada
- **Situação:** Aprovado
- **Evidência:** [CT19.png](../testes/evidencias-06-11/CT19.png)

### CT20 — Participante não vê a gestão do grupo

- **Requisito:** RN07
- **Pré-condição:** CT19
- **Passos:** **Sair do grupo**, pelo menu da conta; entrar em "Turma de ADS" como Marina Alves; abrir Disciplinas e Membros
- **Entrada:** —
- **Esperado:** sem cadastro, edição ou remoção de disciplinas; sem adicionar membro; sem excluir o grupo
- **Observado:** Disciplinas sem "Nova disciplina" e sem menu de ações, com o aviso "Só o organizador do grupo cadastra e edita disciplinas"; Membros sem "Adicionar membro" e sem "Excluir o grupo", e só o cartão da própria Marina tem ações
- **Situação:** Aprovado
- **Evidência:** [CT20a.png](../testes/evidencias-06-11/CT20a.png) (disciplinas), [CT20b.png](../testes/evidencias-06-11/CT20b.png) (membros)

### CT21 — Participante cadastra atividade, altera só as próprias e edita o próprio perfil

- **Requisito:** RF02, RF03, RN07, RN20 — novo teste do defeito [D10](16-defeitos-e-pendencias.md#d10)
- **Pré-condição:** CT20, como Marina
- **Passos:** cadastrar uma atividade, escolhendo a si mesma como responsável; abrir uma atividade de Lucas; em Membros, abrir **Editar meu perfil** e trocar a função
- **Entrada:** "Criar as tabelas no banco" (Banco de Dados › SQL, peso 2, prazo 05/11, responsável Marina Alves); função "Front-end e protótipos"
- **Esperado:** a participante cadastra a atividade e mexe só nas atividades das quais é responsável; nas dos outros, não edita, não exclui e não muda o status; edita o próprio cadastro, mas não o perfil de acesso
- **Observado:** atividade criada com Marina como responsável, com o botão **Excluir**; na atividade "Modelar o diagrama ER", de Lucas, não há **Editar**, **Excluir** nem a troca de status; o formulário do próprio perfil não tem o campo de perfil; a função foi atualizada no cartão
- **Situação:** Aprovado
- **Evidência:** [CT21a.png](../testes/evidencias-06-11/CT21a.png) (atividade dela), [CT21b.png](../testes/evidencias-06-11/CT21b.png) (atividade de outro membro), [CT21c.png](../testes/evidencias-06-11/CT21c.png) (próprio perfil)

### CT22 — Grupo não fica sem o último organizador

- **Requisito:** RN07
- **Pré-condição:** CT21; sair e entrar como Lucas Prado, o único organizador
- **Passos:** abrir o menu de ações do próprio cartão; tentar remover; editar e trocar o perfil para Participante
- **Entrada:** perfil Participante
- **Esperado:** o sistema não permite remover nem rebaixar o último organizador
- **Observado:** "Remover" aparece desabilitado; ao salvar como Participante: "O grupo precisa de pelo menos um organizador."
- **Situação:** Aprovado
- **Evidência:** [CT22a.png](../testes/evidencias-06-11/CT22a.png) (menu), [CT22b.png](../testes/evidencias-06-11/CT22b.png) (recusa)

### CT23 — Remover membro: as atividades passam para quem assume

- **Requisito:** RF02, RN02
- **Pré-condição:** CT22; Marina é responsável por 3 atividades
- **Passos:** remover Marina Alves; tentar confirmar sem escolher; escolher quem assume e confirmar
- **Entrada:** quem assume: Lucas Prado
- **Esperado:** a remoção só é confirmada depois de escolher quem assume; nenhuma atividade some nem fica sem responsável
- **Observado:** o botão **Remover** ficou desabilitado até a escolha; aviso "3 atividades de Marina passaram para Lucas."; as 5 atividades do grupo continuam, todas com Lucas como responsável, e nenhuma sem responsável
- **Situação:** Aprovado
- **Evidência:** [CT23a.png](../testes/evidencias-06-11/CT23a.png) (confirmação), [CT23b.png](../testes/evidencias-06-11/CT23b.png) (atividades)

### CT24 — Encerrar sessão e acesso a rota privada

- **Requisito:** RF09
- **Pré-condição:** CT23
- **Passos:** abrir o menu da conta, na barra do topo, e clicar em **Sair do grupo**; abrir `/painel` direto; abrir o endereço antigo `/login`
- **Entrada:** —
- **Esperado:** a sessão é encerrada e as rotas privadas levam à tela de acesso
- **Observado:** **Sair do grupo** levou a `/entrar`; `/painel` sem sessão foi para `/entrar`; `/login` também
- **Situação:** Aprovado
- **Evidência:** [CT24.png](../testes/evidencias-06-11/CT24.png)

### CT25 — Tema claro e escuro em todas as telas, mantido após recarregar

- **Requisito:** RF08, RF26
- **Pré-condição:** CT24; tela de acesso
- **Passos:** mudar para o tema claro na tela de acesso; entrar como Lucas e recarregar; abrir a página inicial, Sobre nós e um endereço inexistente; voltar ao tema escuro pelo botão da página inicial e abrir o painel
- **Entrada:** endereço `/endereco-que-nao-existe`
- **Esperado:** a escolha do tema vale para todas as telas, públicas e do sistema, e é mantida ao recarregar
- **Observado:** a tela de acesso começou escura e ficou clara, com o fundo `#f5f7fb`; o painel abriu claro e continuou claro depois de recarregar; a página inicial, Sobre nós e a página "Página não encontrada" também abriram claras. O botão da página inicial voltou ao escuro, com o fundo `#07090f`, e o painel acompanhou
- **Situação:** Aprovado
- **Evidência:** [CT25a.png](../testes/evidencias-06-11/CT25a.png) (tela de acesso), [CT25b.png](../testes/evidencias-06-11/CT25b.png) (painel), [CT25c.png](../testes/evidencias-06-11/CT25c.png) (página inicial)

### CT26 — Remover disciplina em cascata

- **Requisito:** RF13, RN02
- **Pré-condição:** CT25; tela Disciplinas
- **Passos:** remover Banco de Dados e confirmar
- **Entrada:** —
- **Esperado:** a confirmação informa o que sai junto, e conteúdos e atividades da disciplina são removidos
- **Observado:** "Banco de Dados será removida do grupo, junto com 2 conteúdos e 4 atividades. Não dá para desfazer."; ficou só Engenharia de Software, com 1 conteúdo e 1 atividade
- **Situação:** Aprovado
- **Evidência:** [CT26a.png](../testes/evidencias-06-11/CT26a.png) (confirmação), [CT26b.png](../testes/evidencias-06-11/CT26b.png) (depois)

### CT27 — Serviços externos indisponíveis

- **Requisito:** RNF10, RN15, RN17
- **Pré-condição:** navegador limpo
- **Passos:** (a) com BrasilAPI, Nager.Date e DiceBear fora do ar e nenhuma relação de feriados salva, criar um grupo e abrir o painel, observando os pedidos que a página faz; (b) em outro navegador, abrir o painel com os serviços no ar, derrubar a BrasilAPI e recarregar
- **Entrada:** grupos "Grupo Offline" e "Grupo Online", criados por Lucas Prado
- **Esperado:** o sistema continua utilizável; o avatar aparece normalmente, porque é desenhado pelo próprio sistema; os feriados mostram aviso ou reaproveitam a última relação obtida
- **Observado:** (a) o quadro de feriados mostrou "Não foi possível carregar os feriados agora."; a página não fez nenhum pedido à DiceBear, e o avatar de Lucas apareceu na barra do topo, como imagem gerada no próprio navegador; (b) os feriados salvos antes continuaram aparecendo
- **Situação:** Aprovado
- **Evidência:** [CT27a.png](../testes/evidencias-06-11/CT27a.png) (sem serviços), [CT27b.png](../testes/evidencias-06-11/CT27b.png) (relação salva)

### CT28 — Carregar dados de exemplo

- **Requisito:** RF20
- **Pré-condição:** navegador limpo; tela de acesso
- **Passos:** clicar em **Carregar dados de exemplo** e escolher quem é
- **Entrada:** Ana Souza
- **Esperado:** um grupo preenchido é criado e o sistema entra nele, sem avisos de conquista pela carga
- **Observado:** "Quem é você?" com os três membros; grupo "Trio do TCC" com 5 disciplinas, 9 conteúdos, 14 atividades e 3 membros; entrou no painel como Ana, sem aviso de conquista
- **Situação:** Aprovado
- **Evidência:** [CT28a.png](../testes/evidencias-06-11/CT28a.png) (quem é você), [CT28b.png](../testes/evidencias-06-11/CT28b.png) (painel)

### CT29 — Feriado no prazo e próximos feriados

- **Requisito:** RF03, RF07, RF21, RF23
- **Pré-condição:** CT28
- **Passos:** em Nova atividade, abrir o calendário do prazo, ir a novembro e escolher o dia 2; criar a atividade; abrir o painel e o calendário de novembro
- **Entrada:** prazo 02/11/2026; "Revisar o capítulo 2" (TCC › Referencial teórico, responsável Ana Souza)
- **Esperado:** o calendário do campo, o formulário, o detalhe, o painel e o calendário sinalizam o feriado, e o painel lista os próximos feriados
- **Observado:** o calendário do campo já marcava o dia 2 como feriado de Finados; dica "Esse prazo cai no feriado: Finados."; detalhe com "Feriado: Finados"; painel com "Revisar o capítulo 2 vence em 02/11/2026, feriado de Finados." e os próximos feriados Finados (02/11), Proclamação da República (15/11) e Dia da consciência negra (20/11); calendário com o dia 2 de novembro marcado como feriado
- **Situação:** Aprovado
- **Evidência:** [CT29a.png](../testes/evidencias-06-11/CT29a.png) (formulário), [CT29b.png](../testes/evidencias-06-11/CT29b.png) (painel), [CT29c.png](../testes/evidencias-06-11/CT29c.png) (calendário)

### CT30 — Aviso de prazo em fim de semana

- **Requisito:** RF22
- **Pré-condição:** CT29; tela Nova atividade
- **Passos:** escolher no calendário do prazo um sábado, um domingo e uma segunda-feira
- **Entrada:** 07/11/2026, 08/11/2026 e 09/11/2026
- **Esperado:** o aviso aparece só nos prazos de sábado ou domingo
- **Observado:** "Esse prazo cai num fim de semana." no sábado e no domingo; nenhum aviso na segunda-feira
- **Situação:** Aprovado
- **Evidência:** [CT30.png](../testes/evidencias-06-11/CT30.png)

### CT31 — Grupo antigo sem membros: as telas funcionam e o primeiro membro é o organizador

- **Requisito:** RF02, RF18, RN07 — novo teste dos defeitos [D01](16-defeitos-e-pendencias.md#d01), [D03](16-defeitos-e-pendencias.md#d03) e [D09](16-defeitos-e-pendencias.md#d09)
- **Pré-condição:** navegador com um grupo gravado sem nenhum membro, como as versões anteriores permitiam, e uma atividade antiga sem responsável — sem membro no grupo, a migração não tem a quem atribuí-la
- **Passos:** entrar no grupo; abrir Atividades, Conquistas e Nova atividade; em Membros, abrir **Adicionar membro**, cadastrar e conferir o perfil
- **Entrada:** "Rafael Costa"
- **Esperado:** as telas abrem sem erro e orientam a cadastrar o primeiro membro; a atividade sem responsável não aparece com avatar, como se houvesse um membro; o primeiro membro do grupo é cadastrado como organizador
- **Observado:** a atividade antiga aparece com um círculo vazio indicando "Sem responsável", sem avatar. Conquistas mostra "O grupo ainda não tem membros", com o atalho para Membros, e o campo de responsável da nova atividade explica que o grupo ainda não tem membros. O campo de perfil veio travado em Organizador, com a explicação "O primeiro membro do grupo é o organizador."; Rafael Costa entrou como Organizador, já identificado como quem está usando, e continua podendo gerenciar o grupo. Nenhum erro no console do navegador
- **Situação:** Aprovado
- **Evidência:** [CT31a.png](../testes/evidencias-06-11/CT31a.png) (atividade antiga), [CT31b.png](../testes/evidencias-06-11/CT31b.png) (conquistas), [CT31c.png](../testes/evidencias-06-11/CT31c.png) (formulário), [CT31d.png](../testes/evidencias-06-11/CT31d.png) (membros)

### CT32 — Falha de gravação no armazenamento do navegador

- **Requisito:** RNF02 — novo teste do defeito [D02](16-defeitos-e-pendencias.md#d02)
- **Pré-condição:** navegador limpo; grupo "Grupo Cheio" criado
- **Passos:** simular o armazenamento do navegador cheio e cadastrar uma disciplina; restaurar o armazenamento, cadastrar outra e recarregar a página
- **Entrada:** "Estatística" com o armazenamento cheio; "Cálculo" depois de restaurado
- **Esperado:** o usuário é avisado de que o cadastro não foi salvo, e o aviso some quando a gravação volta
- **Observado:** apareceram o aviso no canto e a faixa "Não foi possível salvar no navegador." no topo; restaurado o armazenamento, a faixa sumiu na gravação seguinte; depois de recarregar, as duas disciplinas estavam gravadas
- **Situação:** Aprovado
- **Evidência:** [CT32a.png](../testes/evidencias-06-11/CT32a.png) (aviso), [CT32b.png](../testes/evidencias-06-11/CT32b.png) (depois de recarregar)

### CT33 — Páginas públicas: início, sobre nós e endereço inexistente

- **Requisito:** RF26
- **Pré-condição:** navegador limpo
- **Passos:** abrir a página inicial e conferir as fotos da equipe e o rodapé; abrir **Sobre nós**; abrir um endereço que não existe; clicar em **Começar agora**
- **Entrada:** endereço `/pagina-que-nao-existe`
- **Esperado:** as páginas públicas abrem sem sessão, com as fotos da equipe mostrando a cabeça inteira e o Instagram da equipe no rodapé, e o endereço inexistente mostra a página 404
- **Observado:** página inicial com "Veja o quanto você já avançou em cada matéria." e o grupo por convite marcado como "Em breve"; as fotos de Andrey e Matheus aparecem nos círculos a partir do topo, com a cabeça inteira; o rodapé traz "Instagram @go.vertice", com o link para `instagram.com/go.vertice`, que abre em outra aba; Sobre nós com as frases e os avatares de Andrey e Matheus; endereço inexistente com "Página não encontrada"; **Começar agora** levou à tela de acesso
- **Situação:** Aprovado
- **Evidência:** [CT33a.png](../testes/evidencias-06-11/CT33a.png) (início), [CT33b.png](../testes/evidencias-06-11/CT33b.png) (sobre nós), [CT33c.png](../testes/evidencias-06-11/CT33c.png) (404), [CT33d.png](../testes/evidencias-06-11/CT33d.png) (rodapé)

### CT34 — Uso no celular

- **Requisito:** RNF01
- **Pré-condição:** navegador limpo, com tela de 390 × 844
- **Passos:** abrir a página inicial; carregar os dados de exemplo; abrir o menu e cada tela do sistema
- **Entrada:** —
- **Esperado:** nenhuma tela rola para os lados, e a barra de seções vira menu
- **Observado:** sem rolagem lateral no início, no painel, no calendário, em Atividades, Disciplinas, Membros, Conquistas, Nova atividade e Sobre nós; o menu do sistema desce do topo pelo botão de menu
- **Situação:** Aprovado
- **Evidência:** [CT34a.png](../testes/evidencias-06-11/CT34a.png) (painel), [CT34b.png](../testes/evidencias-06-11/CT34b.png) (menu), [CT34c.png](../testes/evidencias-06-11/CT34c.png) (calendário)

### CT35 — Dados da versão de 20/10 são migrados

- **Requisito:** RN06, RN18
- **Pré-condição:** navegador com dados da versão de 20/10: uma atividade sem responsável e uma disciplina com a cor `#78716c`, que não existe na paleta nova
- **Passos:** abrir o sistema; entrar como Lucas Prado; abrir a atividade
- **Entrada:** —
- **Esperado:** a atividade sem responsável passa para o organizador, a outra não muda, e a cor vira a equivalente da paleta
- **Observado:** dados na versão 2; a atividade sem responsável passou para Lucas Prado, o organizador, e a de Marina continuou com ela; a cor virou `#a8a29e` (Pedra); o detalhe mostra o responsável
- **Situação:** Aprovado
- **Evidência:** [CT35.png](../testes/evidencias-06-11/CT35.png)

### CT36 — Dados da primeira versão (tarefas) com atividade sem grupo

- **Requisito:** RNF02, RN07
- **Pré-condição:** navegador com dados da primeira versão do sistema: duas tarefas, uma delas de um grupo que não existe mais
- **Passos:** abrir o sistema; recarregar a página
- **Entrada:** —
- **Esperado:** a tarefa do grupo vira atividade; a que não tem grupo não é apagada, e a pessoa é avisada uma vez
- **Observado:** aviso "Uma atividade antiga ficou sem grupo"; dados na versão 2; "Lista de exercícios" virou atividade, na disciplina "Física", com o conteúdo "Geral"; o primeiro membro virou organizador; a tarefa sem grupo continua guardada; depois de recarregar, o aviso não apareceu de novo
- **Situação:** Aprovado
- **Evidência:** [CT36.png](../testes/evidencias-06-11/CT36.png)

### CT37 — Editar e excluir atividade

- **Requisito:** RF03, RN08, RN14
- **Pré-condição:** navegador limpo; dados de exemplo carregados, como Ana Souza, a organizadora
- **Passos:** conferir o progresso de Banco de Dados; abrir "Resolver a lista de SELECT", clicar em **Editar**, trocar título e peso e salvar; depois, clicar em **Excluir** e confirmar
- **Entrada:** título "Resolver a lista de SELECT e JOIN"; peso 4
- **Esperado:** a edição é gravada e o progresso da disciplina acompanha o peso novo; a exclusão pede confirmação, tira a atividade da lista e recalcula o progresso
- **Observado:** Banco de Dados começou em 43% (3 de 7 de peso). Editada, a atividade mostrou o título novo, com peso 4 gravado, e Banco de Dados foi a 33% (3 de 9). Na exclusão apareceu "Excluir atividade?"; confirmada, a atividade saiu da lista ("13 atividades encontradas") e do armazenamento, e Banco de Dados foi a 60% (3 de 5)
- **Situação:** Aprovado
- **Evidência:** [CT37a.png](../testes/evidencias-06-11/CT37a.png) (editada), [CT37b.png](../testes/evidencias-06-11/CT37b.png) (excluída)

### CT38 — Excluir o grupo

- **Requisito:** RF01, RN02
- **Pré-condição:** CT37, como Ana Souza, a organizadora
- **Passos:** em Membros, conferir a posição da seção **Excluir o grupo**; clicar em **Excluir grupo** e confirmar; abrir `/painel`
- **Entrada:** —
- **Esperado:** a exclusão fica no pé da página; a confirmação é pedida; o grupo sai com membros, disciplinas, conteúdos, atividades e conquistas; a sessão é encerrada
- **Observado:** com 3 membros, a seção terminou a 937 px do topo, numa tela de 1000 px — no pé da página. Apareceu "Excluir o grupo?"; confirmada, o sistema voltou à tela de acesso. Grupo, membros, disciplinas, conteúdos, atividades e as 2 conquistas do grupo foram removidos, e a sessão foi encerrada: `/painel` levou de volta a `/entrar`
- **Situação:** Aprovado
- **Evidência:** [CT38a.png](../testes/evidencias-06-11/CT38a.png) (confirmação), [CT38b.png](../testes/evidencias-06-11/CT38b.png) (tela de acesso)

### CT39 — Editor de foto: o que é enquadrado é o que fica gravado

- **Requisito:** RF24, RN19
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza; em Membros, **Editar** no próprio cartão
- **Passos:** (1) escolher a imagem de 400 × 300 e aplicar sem mexer; (2) escolhê-la de novo, mover a foto para a direita pelo teclado (Shift + seta para a direita, 6 vezes) e aplicar; (3) escolhê-la de novo, pôr o zoom em 2 e aplicar; (4) escolher outra imagem e clicar em **Cancelar**; (5) escolher a foto de celular, pôr o zoom em 2,5, aplicar e salvar
- **Entrada:** imagem de 400 × 300 com a metade esquerda vermelha, a metade direita azul e um retângulo verde no canto de cima, à esquerda; foto de celular de 4000 × 3000, com 4,9 MB
- **Esperado:** o editor abre com o foco na foto; a foto gravada é exatamente o que estava dentro da moldura; cancelar mantém a foto anterior; a foto grande abre sem travar a tela e é gravada reduzida
- **Observado:** o foco começou na área "Enquadramento da foto". Sem mexer, ficou gravado o quadrado do meio: verde no canto, vermelho à esquerda e azul à direita. Movida para a direita, a foto passou a mostrar a borda esquerda da imagem, e o vermelho, a ocupar dois terços. Com zoom 2, ficou só o miolo, sem o canto verde. Cancelar manteve a foto anterior. A foto de celular apareceu no editor em 230 ms, e o **Aplicar** levou 739 ms; nesse intervalo, a página teve uma única tarefa acima de 50 ms, de 117 ms. A foto foi gravada em JPEG, com 256 × 256 pixels e 5 KB. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT39a.png](../testes/evidencias-06-11/CT39a.png) (editor), [CT39b.png](../testes/evidencias-06-11/CT39b.png) (foto movida), [CT39c.png](../testes/evidencias-06-11/CT39c.png) (zoom 2), [CT39d.png](../testes/evidencias-06-11/CT39d.png) (membros)

### CT40 — Foto do grupo: na criação e na edição, e as iniciais quando não há foto

- **Requisito:** RF01, RF29, RN07, RN19
- **Pré-condição:** navegador limpo; tela de acesso
- **Passos:** preencher o novo grupo, escolher a foto do grupo, aplicar e criar; no seletor de grupos da barra do topo, abrir **Editar grupo**, trocar nome e descrição, remover a foto e salvar; pôr a foto de novo; cadastrar uma participante, sair e conferir a tela de acesso; entrar como a participante e abrir o seletor de grupos
- **Entrada:** grupo "Grupo de Física", criado por Lucas Prado, com a foto PNG de 640 × 480; depois, nome "Física II" e descrição "Turma da noite"; participante "Marina Alves"
- **Esperado:** a foto do grupo é ajustada numa moldura quadrada e aparece na barra do topo e na tela de acesso; sem foto, voltam as iniciais do nome; só o organizador edita o grupo
- **Observado:** o editor usou a moldura quadrada de cantos arredondados; a prévia do formulário e a barra do topo mostraram a foto. Sem a foto, a barra do topo voltou a mostrar "FI", as iniciais de "Física II", e foram gravados o nome, a descrição e a foto vazia. Com a foto de volta, a tela de acesso mostrou a foto ao lado do grupo. Marina, participante, não vê **Editar grupo**. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT40a.png](../testes/evidencias-06-11/CT40a.png) (editor), [CT40b.png](../testes/evidencias-06-11/CT40b.png) (barra do topo), [CT40c.png](../testes/evidencias-06-11/CT40c.png) (editar grupo, sem foto), [CT40d.png](../testes/evidencias-06-11/CT40d.png) (tela de acesso)

### CT41 — Criar conteúdo sem sair do cadastro de atividade

- **Requisito:** RF30, RN07, RN13
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza, a organizadora; tela Nova atividade
- **Passos:** preencher título, descrição, disciplina e peso; abrir **Conteúdo** e escolher **Criar novo conteúdo**; cadastrar o conteúdo na janela; escolher prazo e responsável e criar a atividade. Depois, cadastrar uma disciplina sem conteúdos, escolhê-la no formulário e usar o atalho **Criar o primeiro**. Por fim, entrar como Bruno Lima, participante, e abrir a lista de conteúdos
- **Entrada:** "Exercícios de JOIN"; "Lista 3 do professor."; Banco de Dados; peso 3; conteúdo "Joins"; prazo 10/11; responsável Carla Dias. Disciplina "Física", com o conteúdo "Cinemática"
- **Esperado:** a janela já abre na disciplina escolhida; ao cadastrar, o conteúdo novo fica escolhido e nada do que foi preenchido se perde; o participante não vê a opção
- **Observado:** a lista terminou com **Criar novo conteúdo**, depois de Modelagem e SQL, e a janela abriu com "Um assunto de Banco de Dados". Cadastrado o conteúdo, o formulário continuou com o título, a descrição, Banco de Dados e o peso 3, com "Joins" escolhido e nenhuma mensagem de erro. A atividade foi gravada em "Joins", que entrou como o último conteúdo da disciplina. Em Física, a dica do campo mostrou "Física ainda não tem conteúdos. Criar o primeiro", e "Cinemática" ficou escolhido depois do cadastro. Para Bruno, a lista mostrou só Modelagem, SQL e Joins. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT41a.png](../testes/evidencias-06-11/CT41a.png) (lista de conteúdos), [CT41b.png](../testes/evidencias-06-11/CT41b.png) (janela do conteúdo), [CT41c.png](../testes/evidencias-06-11/CT41c.png) (formulário preservado)

### CT42 — Só o responsável muda o status da atividade

- **Requisito:** RF05, RN07, RN20
- **Pré-condição:** navegador limpo; dados de exemplo, como Bruno Lima, participante
- **Passos:** abrir Atividades; abrir uma atividade de Ana e, depois, o endereço de edição dela; concluir pela lista uma atividade de Bruno. Entrar como Ana, abrir uma atividade de Bruno, editar o título e salvar. Em Nova atividade, escolher a si mesma como responsável e o status Concluído, trocar o responsável para Carla Dias e criar
- **Entrada:** atividade de Ana "Escrever a introdução do TCC"; atividade de Bruno "Montar protótipo das telas"; atividade de Bruno "Componentes do formulário", com o título novo "Componentes do formulário de cadastro"; nova atividade "Revisar a conclusão" (TCC › Apresentação, prazo 12/11)
- **Esperado:** cada pessoa muda o status só das atividades das quais é responsável — o organizador também; o organizador edita e exclui as atividades dos outros; atividade cadastrada para outra pessoa começa em "a fazer"
- **Observado:** Bruno tem o botão de concluir só nas 5 atividades dele; nas outras 9, o círculo só mostra a situação. Na atividade de Ana, não há **Concluir**, troca de status, **Editar** nem **Excluir**, e o detalhe informa "Só Ana muda o status."; pelo endereço de edição, apareceu "Você não pode editar esta atividade". Bruno concluiu a própria atividade, com o aviso "+40 XP para você". Como Ana, na atividade de Bruno: **Editar** e **Excluir**, sem **Concluir** e sem troca de status; no formulário, o status ficou travado, com "Só Bruno, que é responsável, muda o status.", e depois de salvar o título o status continuou "fazendo". Na nova atividade, o status abriu para ela mesma; ao passar a atividade para Carla, travou e voltou ao vazio, e a atividade foi gravada como "a fazer". Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT42a.png](../testes/evidencias-06-11/CT42a.png) (lista como Bruno), [CT42b.png](../testes/evidencias-06-11/CT42b.png) (atividade de outra pessoa), [CT42c.png](../testes/evidencias-06-11/CT42c.png) (organizadora editando)

### CT43 — Calendário: troca de mês com animação, também deslizando o dedo

- **Requisito:** RF23, RNF01
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza; tela Calendário
- **Passos:** avançar e voltar um mês pelos botões; na visão Semana, avançar uma semana. Em tela de celular com toque, deslizar o dedo para a esquerda, para a direita e dar um toque curto. Num navegador com a opção "reduzir movimento", avançar um mês
- **Entrada:** —
- **Esperado:** o mês novo entra deslizando pelo lado do movimento; deslizar o dedo troca de mês, e um toque curto não; com "reduzir movimento", a troca é imediata
- **Observado:** ao avançar, o mês novo entrou pela direita; ao voltar, pela esquerda, e o título voltou a "Outubro de 2026"; a semana também desliza. No celular, deslizar para a esquerda levou a "Novembro de 2026", deslizar para a direita voltou a "Outubro de 2026", e o toque curto não trocou de mês. Com "reduzir movimento", a animação durou menos de 1 ms. Nenhum erro no console dos três navegadores
- **Situação:** Aprovado
- **Evidência:** [CT43a.png](../testes/evidencias-06-11/CT43a.png) (mês seguinte), [CT43b.png](../testes/evidencias-06-11/CT43b.png) (celular, depois de deslizar)

### CT44 — Campo de data com o calendário do sistema

- **Requisito:** RF03, RN06
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza; tela Nova atividade
- **Passos:** abrir o campo **Prazo**; pressionar seta para a direita, seta para baixo, Page Down, Page Up e Enter; abrir o campo de novo e clicar em **Limpar**; clicar em **Criar atividade**
- **Entrada:** —
- **Esperado:** o calendário abre no mês atual, com o foco no dia de hoje; o teclado anda por dias, semanas e meses, e Enter escolhe o dia; Limpar esvazia o campo, e o prazo continua obrigatório
- **Observado:** abriu em novembro de 2026, com o foco em 01/11, marcado como hoje. As setas levaram a 09/11; Page Down, a 09/12; Page Up voltou, e Enter escolheu "Segunda-feira, 09 de novembro de 2026". **Limpar** voltou o campo a "Selecione a data", e ao criar apareceu "Defina um prazo de entrega.". Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT44a.png](../testes/evidencias-06-11/CT44a.png) (calendário aberto), [CT44b.png](../testes/evidencias-06-11/CT44b.png) (dia escolhido)

### CT45 — Marca do Vértice: dá um terço de volta enquanto o grupo abre e uma volta ao passar o mouse

- **Requisito:** RNF06
- **Pré-condição:** navegador limpo; tela de acesso
- **Passos:** carregar os dados de exemplo e entrar como Ana Souza; acompanhar a passagem para o painel, conferindo as animações da marca e o endereço da página durante a passagem; no painel, passar o mouse sobre a marca da barra do topo. Num navegador com a opção "reduzir movimento", entrar de novo
- **Entrada:** —
- **Esperado:** ao entrar, uma cortina com a marca e o nome do grupo cobre a tela de acesso, que não muda enquanto isso; com a tela coberta, o painel abre por baixo; a marca dá um terço de volta, em menos de 1 s, animando só posição e transparência, e a cortina se dissolve no painel — a passagem inteira em menos de 1,5 s; no painel, a marca fica parada e dá uma volta só, rápida, quando o mouse passa por cima; com "reduzir movimento", a marca não gira, e a cortina só esmaece
- **Observado:** a cortina mostrou "Abrindo Trio do TCC…", e o endereço continuou em /entrar até a tela ficar coberta; depois, já era /painel. A marca animou só transform e opacity, terminou em 120° e levou 0,82 s. A cortina saiu, e ficou o painel. Parada, a marca não tinha animação; com o mouse em cima, deu uma volta inteira, de 0,6 s. Com "reduzir movimento", a marca não girou, e a cortina sumiu em menos de 1 s. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT45a.png](../testes/evidencias-06-11/CT45a.png) (a marca começa a puxar a cortina), [CT45b.png](../testes/evidencias-06-11/CT45b.png) (painel)

### CT46 — Barra de seções no topo, também no celular

- **Requisito:** RNF01, RNF06
- **Pré-condição:** navegador limpo; dados de exemplo, como Bruno Lima
- **Passos:** conferir a barra do topo; abrir Calendário por ela; abrir o menu da conta; abrir Painel, Atividades e Calendário numa tela de 1024 px; numa tela de celular, abrir o menu e escolher Atividades
- **Entrada:** —
- **Esperado:** as seis seções ficam na barra do topo, sem barra lateral, e a seção aberta fica marcada; o menu da conta mostra quem está usando; nenhuma tela rola para os lados; no celular, o menu desce do topo e leva à seção
- **Observado:** nenhuma barra lateral; a barra do topo trouxe Painel, Calendário, Disciplinas, Atividades, Membros e Conquistas, e Calendário ficou marcado depois de aberto. O menu da conta mostrou Bruno Lima, Participante, e a saída do grupo. Em 1024 px, nenhuma das três telas rolou para os lados. No celular, o menu abriu colado ao topo, com os 390 px de largura, e levou a Atividades. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT46a.png](../testes/evidencias-06-11/CT46a.png) (menu da conta), [CT46b.png](../testes/evidencias-06-11/CT46b.png) (1024 px), [CT46c.png](../testes/evidencias-06-11/CT46c.png) (celular)

### CT47 — Avatar: cinco estilos para escolher e sortear

- **Requisito:** RF19, RN15
- **Pré-condição:** navegador limpo, com a DiceBear observada; grupo "Grupo de Química" criado por Lucas Prado; tela Membros
- **Passos:** abrir **Adicionar membro**; conferir os estilos; clicar em **Sortear outro**; trocar o estilo pelo teclado e depois clicar em Pixel; preencher o nome e adicionar. Depois, editar o membro, escolher uma foto e removê-la
- **Entrada:** "Marina Alves"; estilo Pixel; foto PNG de 640 × 480
- **Esperado:** os cinco estilos aparecem com o primeiro marcado; sortear e trocar o estilo mudam a prévia; o estilo e a semente são gravados; com foto, a foto aparece no lugar do avatar, e sem ela o avatar volta; nenhuma imagem vem de fora
- **Observado:** estilos Rabisco, Aventura, Sorriso, Emoji e Pixel, com Rabisco marcado. Sortear trocou o avatar da prévia; a seta para a direita passou a Aventura, e Pixel trocou de novo a prévia. Foi gravado o estilo `pixel-art`, com a semente sorteada, e o cartão mostrou o avatar gerado no próprio navegador. Com a foto, a dica avisou "Enquanto houver foto, ela aparece no lugar do avatar."; sem ela, o avatar voltou. Nenhum pedido à DiceBear e nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT47a.png](../testes/evidencias-06-11/CT47a.png) (estilos), [CT47b.png](../testes/evidencias-06-11/CT47b.png) (sem a foto, o avatar volta)

---

## O que não foi testado nesta entrega

| Item | Motivo |
|---|---|
| RF12 — histórico de progresso | Ainda não implementado; previsto para 27/11 no [backlog](12-backlog.md) |
| RF27 e RF28 — acesso com conta Google ou e-mail e convite para o grupo | Previstos para 27/11, junto com o banco de dados |
| BrasilAPI e Nager.Date reais | O ambiente de teste não acessa a internet; as respostas foram simuladas no formato de cada serviço. A conferência com os serviços reais é feita na versão publicada na Vercel |
| RNF05 — Firefox e Edge | Executado apenas no Chromium |
| Arrastar a foto com o mouse ou o dedo e o gesto de pinça no editor de foto | O roteiro moveu a foto pelo teclado e mudou o zoom pelo controle deslizante, que usam o mesmo cálculo de enquadramento. O arraste com o mouse foi conferido só durante o desenvolvimento, e a pinça precisa de um celular de verdade |

---

## Ciclo de 20/10

O primeiro ciclo de testes foi executado em 19/10/2026 sobre o recorte da entrega de 20/10 (commit `c29279b`). O registro completo, com os passos de cada caso, está na versão marcada pela tag `entrega-20-10-2026`; as evidências continuam em [`testes/evidencias/`](../testes/evidencias/).

| Situação | Casos |
|---|---|
| Aprovado | 26 |
| Reprovado | 3 |
| **Total executado** | **29** |

| Caso reprovado em 20/10 | Defeito | Novo teste neste ciclo |
|---|---|---|
| CT26 — Primeiro membro do grupo cadastrado como participante | [D01](16-defeitos-e-pendencias.md#d01) | CT31 — Aprovado |
| CT27 — Falha de gravação no armazenamento do navegador | [D02](16-defeitos-e-pendencias.md#d02) | CT32 — Aprovado |
| CT29 — Filtro por disciplina na lista de atividades | [D07](16-defeitos-e-pendencias.md#d07) | CT13 — Aprovado |

---

### Navegação

[⬅ Anterior: Produto Mínimo Viável](14-mvp.md) · [Índice](../README.md) · [Próximo: Defeitos e Pendências ➡](16-defeitos-e-pendencias.md)
