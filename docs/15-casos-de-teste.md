# 15 · Casos de Teste

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Imersão Profissional: Projeto de Software · ADSIS4S · 2º bimestre · Entrega de 27/11/2026, atualizado em 11/11/2026

---

Este documento registra os testes executados sobre a versão da entrega de 27/11, com o banco de dados, o acesso com conta e o convite, e com a revisão de 11/11: o espaço pessoal, o perfil da conta, o lembrete por e-mail e os pedidos dos usuários de teste. Cada caso informa o requisito ou a regra que verifica, os passos, a entrada, o resultado esperado e o resultado observado na execução real. As evidências da execução de 11/11 estão em [`testes/evidencias-11-11/`](../testes/evidencias-11-11/), com o nome do caso no arquivo, e as observações de cada caso, em [`casos-de-teste-11-11.json`](../testes/registros/casos-de-teste-11-11.json).

Os casos CT01 a CT68 vêm das execuções anteriores e foram executados de novo sobre esta versão. Nos que tiveram os passos ajustados à revisão de 11/11 (a demonstração que começa pelo nome, o seletor de espaço, a volta à tela anterior depois de criar, o botão "Marcar como concluída", a conquista retirada, a barra de filtros do calendário e a foto em Meu perfil), a descrição abaixo é a da execução de 11/11, com as evidências de [`testes/evidencias-11-11/`](../testes/evidencias-11-11/). Os demais mantêm a descrição e as evidências da execução em que foram descritos ([`evidencias-06-11/`](../testes/evidencias-06-11/) ou [`evidencias-27-11/`](../testes/evidencias-27-11/)), e o resultado de 11/11 está na visão geral e no registro. Os casos CT69 a CT85 são novos e cobrem a revisão de 11/11.

Os ciclos anteriores (08/11, 06/11, a rodada de 01/11 e 20/10) estão resumidos no [fim deste documento](#ciclo-de-0811). Defeitos encontrados estão no [Registro de Defeitos e Pendências](16-defeitos-e-pendencias.md).

---

## Condições de execução

| Item | Valor |
|---|---|
| Data da execução | 11/11/2026, das 13h34 às 13h41 |
| Versão testada | O código de `src/` desta entrega (Vértice 2.0.0 com o banco de dados e a revisão de 11/11) |
| Como a aplicação foi executada | `npm ci` e `npm run build` dentro de `src/`, duas vezes: sem as variáveis do banco, para o modo de demonstração (CT01 a CT56, CT67, CT68 e CT81 a CT85), e com elas, para o modo com conta (CT57 a CT66 e CT69 a CT80). As duas versões foram servidas com `npm run preview` |
| Banco de dados | PostgreSQL 16 local, com `06-apoio-teste-local.sql` e `04-script-criacao.sql`, zerado antes de cada roteiro com conta. O sistema falou com ele por um servidor de teste que responde como o Supabase nas chamadas que o sistema usa (login por e-mail, consulta, inclusão, alteração e exclusão de linhas, a função do convite e o envio de arquivos), executando cada consulta no banco como a conta conectada, com as regras de acesso por linha valendo. O envio do lembrete (CT80) foi simulado: a chamada ao Brevo fica gravada numa tabela do apoio local, em vez de sair para a internet |
| Ambiente | Node.js 22.23, npm 10.9, Chromium 153, tela de 1440 × 1000; do CT81 ao CT84, 1920 × 1080. No CT34, no CT53 e em parte do CT43, do CT46, do CT54 e do CT56, 390 × 844, tamanho de celular (no CT43, no CT46 e no CT54, também com tela de toque); no CT46, também 1024 × 900 |
| Forma de execução | Roteiro automatizado no navegador (Playwright), seguindo os passos de cada caso; as capturas de tela são da própria execução. Do CT61 ao CT64 e do CT72 ao CT80, dois navegadores ao mesmo tempo, um para cada conta |
| Dados | Fictícios, cadastrados durante o próprio teste. CT28 a CT30, CT34, CT37 a CT39, CT41 a CT46, CT48, CT49, CT51 a CT56, CT67 e CT68 usam os dados de exemplo do sistema; CT31, CT35, CT36, CT50 e CT85 partem de dados gravados no formato das versões anteriores. As fotos são uma imagem PNG de 640 × 480, uma imagem de 400 × 300 dividida em cores, para conferir o recorte, e uma foto de celular de 4000 × 3000, com 4,9 MB |
| Rede | O ambiente de teste não acessa a internet. As respostas da BrasilAPI foram simuladas com a relação de feriados nacionais de 2026 e 2027, no formato do serviço; a Nager.Date ficou indisponível o tempo todo. O CT27 derruba também a BrasilAPI, para verificar as alternativas locais. O login com o Google e o projeto real do Supabase não foram usados (ver [o que não foi testado](#o-que-não-foi-testado-nesta-entrega)) |

Os casos CT01 a CT26 formam **um único cenário em sequência**: cada um parte do estado deixado pelo anterior. CT28 a CT30 seguem um segundo cenário, com os dados de exemplo, CT37 e CT38 um terceiro, CT57 a CT66 um quarto, com o banco, CT67 e CT68 um quinto, CT69 a CT80 um sexto, com o banco zerado de novo, e CT81 a CT84 um sétimo. Os demais começam com o navegador limpo. Em todos os cenários, o roteiro também conferiu que o console do navegador não registrou nenhum erro, com exceção do CT27, que derruba os serviços externos de propósito. As datas de prazo dos casos são contadas a partir do dia da execução, 11/11/2026.

---

## Resumo

| Situação | Casos |
|---|---|
| Aprovado | 85 |
| Reprovado | 0 |
| **Total executado** | **85** |

Além dos casos de teste, foram executadas as verificações automatizadas do projeto:

| Verificação | Comando | Resultado | Registro |
|---|---|---|---|
| Regras de migração, progresso, experiência, perfis, atividades e eventos, ofensiva, conquistas, permissões, recorte da foto, avatares, gravação no banco, evolução do progresso, espaço pessoal, "A definir" e retirada das conquistas | `npm run verificar` | 280 verificações, todas passaram | [`verificar.txt`](../testes/registros/verificar.txt) |
| Regras do banco: acesso por grupo e por perfil, último organizador, status só pelo responsável, eventos, convite, histórico, exclusões em cascata, pasta das fotos, espaço pessoal, perfil, "A definir", evento de vários dias e lembrete | `05-verificacoes.sql` num PostgreSQL local | 77 conferências, todas passaram | [`verificacoes-banco.txt`](../testes/registros/verificacoes-banco.txt) |
| Instalação e geração da versão de produção | `npm ci` e `npm run build` | Concluído sem erro, sem vulnerabilidades nas dependências | [`build.txt`](../testes/registros/build.txt) |
| Atualização de um banco com os dados da versão anterior | `07-atualizacao-11-11.sql` sobre um banco criado com o script de 08/11 (antes e depois da correção do D14) e preenchido | Nenhum registro perdido, cada atividade com o grupo da sua disciplina, estrutura igual à de um banco novo e a mesma atualização rodada duas vezes sem erro | Conferido durante o desenvolvimento |
| Registro da execução dos casos | roteiro no navegador | Observações de cada caso, na ordem em que foram conferidas | [`casos-de-teste-11-11.json`](../testes/registros/casos-de-teste-11-11.json) |

Os defeitos D15 a D18, encontrados nas primeiras execuções de 11/11, foram corrigidos antes da execução registrada aqui; a relação de cada defeito com o seu teste está no [registro de defeitos](16-defeitos-e-pendencias.md).

---

## Visão geral

| Caso | Requisito / regra | O que verifica | Situação |
|---|---|---|---|
| CT01 | RF01, RF20, RNF03 | Criar grupo sem nome do grupo e sem o nome de quem cria | Aprovado |
| CT02 | RF01, RN07 | Criar grupo: quem cria entra como organizador | Aprovado |
| CT03 | RF02, RNF03 | Cadastrar membro sem nome e com e-mail inválido | Aprovado |
| CT04 | RF02, RF24, RN19 | Cadastrar membro com foto de perfil | Aprovado |
| CT05 | RF24, RF35, RN19, RNF03 | Foto de perfil com arquivo que não é imagem | Aprovado |
| CT06 | RF13, RF25, RN18 | Cadastrar disciplinas escolhendo a cor na paleta | Aprovado |
| CT07 | RF13, RNF03 | Disciplina sem nome e com nome repetido | Aprovado |
| CT08 | RF14, RN13 | Cadastrar conteúdos (opcionais) e recusar nome repetido | Aprovado |
| CT09 | RF03, RN06, RN13, RN20, RNF03 | Atividade: o formulário começa vazio e cobra só o que é obrigatório | Aprovado |
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
| CT28 | RF20, RF34 | Carregar dados de exemplo | Aprovado |
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
| CT47 | RF19, RN15 | Avatar: dois estilos (Rabisco e Ilustrado) para escolher e sortear | Aprovado |
| CT48 | RF03, RF11, RN06, RN13, RN14 | Atividade sem conteúdo: só a disciplina é obrigatória, e ela conta no progresso da disciplina | Aprovado |
| CT49 | RF14, RN02, RN13 | Excluir um conteúdo não apaga as atividades: elas ficam na disciplina, sem conteúdo | Aprovado |
| CT50 | RNF02, RN13, RN15 | Migração para a versão 3: disciplina na atividade, "Geral" automático sai, estilo antigo de avatar vira o padrão | Aprovado |
| CT51 | RF31, RN21, RNF03 | Evento: cadastro com validação, página de eventos, painel, edição e exclusão | Aprovado |
| CT52 | RF23, RF31 | Eventos no calendário: no dia, no painel do dia e cadastrados a partir do dia escolhido | Aprovado |
| CT53 | RF01, RF34, RNF01 | Seletor de espaço: o pessoal, os grupos, criar grupo e grupo de exemplo | Aprovado |
| CT54 | RF26, RNF06 | Página inicial com movimento: aparece ao rolar, segue o mouse, demonstra no hover e respeita "reduzir movimento" | Aprovado |
| CT55 | RNF06 | Textos sem travessão em nenhuma tela | Aprovado |
| CT56 | RF32 | Feedback: seção na página inicial, link no topo e no rodapé, e item no menu da conta | Aprovado |
| CT57 | RF27, RF20, RNF03 | Sem conta: a tela de acesso pede login ou demonstração | Aprovado |
| CT58 | RF27, RF01, RF34, RN07 | Criar conta e criar grupo: o grupo e o organizador vão para o banco | Aprovado |
| CT59 | RNF02, RF12, RF17, RN23 | Disciplina, atividade e conclusão vão para o banco e voltam depois de recarregar | Aprovado |
| CT60 | RF28, RN22 | Convite: o organizador gera código e link | Aprovado |
| CT61 | RF28, RF27, RN22 | Convite pelo link: quem não tem conta cria e cai direto no grupo | Aprovado |
| CT62 | RF28, RN22, RNF03 | Código digitado e código inválido | Aprovado |
| CT63 | RNF02, RN01 | O que um faz, o outro vê ao voltar para a aba | Aprovado |
| CT64 | RNF02, RNF11, RN20 | Recusa do banco: alteração em algo que já não existe avisa e recarrega | Aprovado |
| CT65 | RF09, RF20, RF27 | Sair da conta e demonstração | Aprovado |
| CT66 | RF24, RF35, RN19, RN26, RNF11 | Foto de perfil vai para o Storage e o banco guarda o endereço | Aprovado |
| CT67 | RF33 | Tutorial opcional: convite no painel, passos, atalho para a tela e menu da conta | Aprovado |
| CT68 | RF12, RNF09 | Evolução do progresso na tela da disciplina, com a demonstração | Aprovado |
| CT69 | RF34, RF35, RF27, RN24 | Conta nova cai no espaço pessoal, criado pelo banco com o perfil | Aprovado |
| CT70 | RF03, RF34, RN24 | Atividade pessoal sem disciplina e volta para a lista depois de criar | Aprovado |
| CT71 | RF01, RF28, RF34, RN07, RN26 | Criar grupo e convidar sem sair do sistema | Aprovado |
| CT72 | RF28, RF27, RN22, RN26 | Outra conta entra com o código pelo seletor e aparece com o nome do perfil | Aprovado |
| CT73 | RF38, RN06, RN20 | Atividade "A definir": todos veem, alguém assume, e só então conclui | Aprovado |
| CT74 | RF17, RN10, RN12 | Concluir por engano e desfazer: a conquista sai junto com a experiência | Aprovado |
| CT75 | RF05 | Detalhe da atividade: "Marcar como concluída" discreto e com Desfazer | Aprovado |
| CT76 | RF35, RF24, RN19, RN26 | Perfil da conta: nome e foto mudam em todos os grupos | Aprovado |
| CT77 | RF31, RF23, RN21 | Evento de vários dias aparece em cada dia do calendário | Aprovado |
| CT78 | RF37, RN06 | Várias atividades de uma vez, com a lista colada e "Para todas" | Aprovado |
| CT79 | RF37, RN07 | Trocar o responsável de várias atividades de uma vez | Aprovado |
| CT80 | RF36, RN25 | Lembrete por e-mail: sai para quem tem atividade perto do prazo e respeita quem desligou | Aprovado |
| CT81 | RF20, RF34, RNF03 | Demonstração: o nome cria o espaço pessoal; com exemplos, entra o grupo pronto | Aprovado |
| CT82 | RF23 | Calendário: barra de filtros com o que aparece, disciplina e "só as minhas" | Aprovado |
| CT83 | RF31, RN21 | Eventos: filtro por disciplina e evento de vários dias | Aprovado |
| CT84 | RNF01 | Telas mais largas no computador, sem rolagem lateral no celular | Aprovado |
| CT85 | RNF02, RF34, RN24 | Dados antigos da demonstração continuam, com o grupo na atividade e a pessoa marcada | Aprovado |

---

## Casos de teste

### CT01: Criar grupo sem nome do grupo e sem o nome de quem cria

- **Requisito:** RF01, RF20, RNF03
- **Pré-condição:** navegador sem dados; tela de acesso, no modo de demonstração
- **Passos:** clicar em **Começar** sem preencher o nome; depois, informar o nome e começar; no seletor de espaço, escolher **Criar grupo** e clicar em **Criar grupo** com o nome vazio
- **Entrada:** nome vazio; depois, "Lucas Prado"; nome do grupo vazio
- **Esperado:** sem nome, a demonstração não começa e o campo informa o erro; sem nome do grupo, o grupo não é criado e o campo informa o erro
- **Observado:** sem nome, continuou em `/entrar` com "Informe o seu nome." abaixo do campo. Com o nome, abriu o espaço pessoal; na janela do grupo novo, sem nome, "Dê um nome ao grupo." e nenhum grupo criado
- **Situação:** Aprovado
- **Evidência:** [CT01a.png](../testes/evidencias-11-11/CT01a.png) (nome vazio), [CT01b.png](../testes/evidencias-11-11/CT01b.png) (grupo sem nome)
### CT02: Criar grupo: quem cria entra como organizador

- **Requisito:** RF01, RN07
- **Pré-condição:** CT01, com a janela Criar grupo aberta
- **Passos:** preencher o nome e a descrição e clicar em **Criar grupo**; abrir Membros
- **Entrada:** grupo "Turma de ADS"; descrição "Grupo de estudos do 4º semestre"; sem foto do grupo
- **Esperado:** o grupo é criado e aberto, e quem criou vira o primeiro membro, com o nome informado ao começar e o perfil de organizador
- **Observado:** o seletor de espaço passou a mostrar "Turma de ADS", e o painel saudou Lucas; em Membros, Lucas Prado é o único membro, com perfil Organizador
- **Situação:** Aprovado
- **Evidência:** [CT02a.png](../testes/evidencias-11-11/CT02a.png) (painel do grupo), [CT02b.png](../testes/evidencias-11-11/CT02b.png) (membros)
### CT03: Cadastrar membro sem nome e com e-mail inválido

- **Requisito:** RF02, RNF03
- **Pré-condição:** CT02; tela Membros
- **Passos:** clicar em **Adicionar membro**, deixar o nome vazio, preencher o e-mail e clicar em **Adicionar**
- **Entrada:** nome vazio; e-mail "marina@"
- **Esperado:** o membro não é cadastrado e os dois campos informam o erro
- **Observado:** "O nome do membro é obrigatório." e "E-mail inválido."; o formulário continuou aberto
- **Situação:** Aprovado
- **Evidência:** [CT03.png](../testes/evidencias-06-11/CT03.png)

### CT04: Cadastrar membro com foto de perfil

- **Requisito:** RF02, RF24, RN19
- **Pré-condição:** CT03, com o formulário aberto
- **Passos:** preencher os dados, clicar em **Enviar foto** e escolher a imagem; no editor, aumentar o zoom e clicar em **Aplicar**; clicar em **Adicionar**
- **Entrada:** "Marina Alves"; função "Front-end"; e-mail "marina@exemplo.com"; foto PNG de 640 × 480; zoom 1,5
- **Esperado:** o editor abre com a foto escolhida; o membro é cadastrado com a foto enquadrada, recortada em quadrado e reduzida antes de ser gravada
- **Observado:** o editor "Ajustar foto" abriu com a foto, sem zoom; depois de aplicar, o formulário mostrou a foto enquadrada. Marina entrou como Participante, com a foto no cartão, gravada em JPEG, com 256 × 256 pixels e 7 KB
- **Situação:** Aprovado
- **Evidência:** [CT04a.png](../testes/evidencias-06-11/CT04a.png) (editor), [CT04b.png](../testes/evidencias-06-11/CT04b.png) (formulário com a foto), [CT04c.png](../testes/evidencias-06-11/CT04c.png) (membros)

### CT05: Foto de perfil com arquivo que não é imagem

- **Requisito:** RF24, RF35, RN19, RNF03
- **Pré-condição:** CT04
- **Passos:** abrir **Meu perfil** no menu da conta, clicar em **Enviar foto** e escolher um arquivo de texto
- **Entrada:** arquivo `documento.txt`
- **Esperado:** o arquivo é recusado com mensagem, o editor não abre e nenhuma foto é gravada
- **Observado:** "Escolha uma imagem JPG, PNG ou WebP."; o editor não abriu, e o perfil continuou com o avatar sorteado e o botão **Enviar foto**
- **Situação:** Aprovado
- **Evidência:** [CT05.png](../testes/evidencias-11-11/CT05.png)
### CT06: Cadastrar disciplinas escolhendo a cor na paleta

- **Requisito:** RF13, RF25, RN18
- **Pré-condição:** CT05; tela Disciplinas
- **Passos:** abrir **Nova disciplina**, conferir a paleta e cadastrar com a cor sugerida; abrir de novo, escolher outra cor e cadastrar
- **Entrada:** "Banco de Dados" com a cor sugerida; "Engenharia de Software" com a cor Laranja
- **Esperado:** a paleta oferece as 18 cores, cada disciplina nova vem com uma cor ainda não usada, e a cor escolhida é gravada
- **Observado:** paleta com 18 cores; a primeira veio com Azul e a segunda com outra cor sugerida; gravadas Azul (`#3b82f6`) e Laranja (`#f97316`); a tela mostra "2 disciplinas" (sem conteúdo cadastrado, o subtítulo não fala de conteúdos)
- **Situação:** Aprovado
- **Evidência:** [CT06a.png](../testes/evidencias-06-11/CT06a.png) (paleta), [CT06b.png](../testes/evidencias-06-11/CT06b.png) (disciplinas)

### CT07: Disciplina sem nome e com nome repetido

- **Requisito:** RF13, RNF03
- **Pré-condição:** CT06
- **Passos:** abrir **Nova disciplina** e clicar em **Cadastrar** sem nome; depois, informar um nome que já existe com letras minúsculas
- **Entrada:** nome vazio; "banco de dados"
- **Esperado:** as duas tentativas são recusadas com mensagem no campo
- **Observado:** "Informe o nome da disciplina." e "Este grupo já tem uma disciplina com esse nome."; continuaram 2 disciplinas
- **Situação:** Aprovado
- **Evidência:** [CT07.png](../testes/evidencias-06-11/CT07.png)

### CT08: Cadastrar conteúdos (opcionais) e recusar nome repetido

- **Requisito:** RF14, RN13
- **Pré-condição:** CT07
- **Passos:** abrir Banco de Dados, cadastrar dois conteúdos e tentar um terceiro com nome repetido; em Engenharia de Software, cadastrar o conteúdo usado no CT17
- **Entrada:** "Modelagem" (descrição "Diagrama ER e normalização"), "SQL" e "modelagem"; "Testes" em Engenharia de Software
- **Esperado:** a disciplina sem conteúdo avisa que eles são opcionais; os dois primeiros são gravados na ordem de cadastro e o repetido é recusado
- **Observado:** antes do primeiro cadastro, a disciplina mostrou a seção "Conteúdos (opcional)"; o repetido foi recusado com "Esta disciplina já tem um conteúdo com esse nome."; a disciplina ficou com Modelagem e SQL, nessa ordem
- **Situação:** Aprovado
- **Evidência:** [CT08a.png](../testes/evidencias-06-11/CT08a.png) (recusa), [CT08b.png](../testes/evidencias-06-11/CT08b.png) (conteúdos)

### CT09: Atividade: o formulário começa vazio e cobra só o que é obrigatório

- **Requisito:** RF03, RN06, RN13, RN20, RNF03
- **Pré-condição:** CT08; tela Nova atividade, no grupo
- **Passos:** conferir os campos ao abrir; clicar em **Criar atividade** com tudo vazio; depois, tentar com um título curto
- **Entrada:** campos vazios; título "ER"
- **Esperado:** nenhum campo vem escolhido, e o responsável começa em "A definir"; a atividade não é salva, e cada campo obrigatório (título, disciplina e prazo) informa o erro; responsável, conteúdo, peso, status e prioridade não são cobrados
- **Observado:** disciplina, prazo, status e prioridade abriram só com o texto de exemplo ("Selecione a disciplina", "Selecione a data" e assim por diante), o conteúdo em "Sem conteúdo", o responsável em "A definir", sem nenhum peso marcado, e o status travado até o responsável escolhido ser quem está cadastrando. Com os campos vazios: "Informe um título para a atividade.", "Escolha a disciplina da atividade." e "Defina um prazo de entrega.", e nenhuma mensagem no responsável, no conteúdo, no peso, no status ou na prioridade. Com "ER": "O título precisa ter pelo menos 3 caracteres.". Nenhuma atividade foi gravada
- **Situação:** Aprovado
- **Evidência:** [CT09a.png](../testes/evidencias-11-11/CT09a.png) (formulário vazio), [CT09b.png](../testes/evidencias-11-11/CT09b.png) (campos obrigatórios), [CT09c.png](../testes/evidencias-11-11/CT09c.png) (título curto)
### CT10: Cadastrar atividades válidas com peso e responsável

- **Requisito:** RF03, RN03, RN04, RN09
- **Pré-condição:** CT09
- **Passos:** cadastrar três atividades em Banco de Dados, escolhendo o prazo no calendário do campo e sem escolher o status
- **Entrada:** "Modelar o diagrama ER" (Banco de Dados › Modelagem, peso 3, prazo 08/11, Lucas Prado); "Normalizar as tabelas até a 3FN" (Banco de Dados › Modelagem, sem escolher o peso, prazo 04/11, Marina Alves); "Resolver a lista de SELECT" (Banco de Dados › SQL, peso 2, prazo 13/11, Marina Alves)
- **Esperado:** as três são gravadas, cada uma com o seu responsável; sem peso escolhido, a atividade vale 1; sem status escolhido, começa em "a fazer"
- **Observado:** a lista mostra "3 atividades encontradas", todas com responsável e com a disciplina gravada; "Normalizar as tabelas até a 3FN" foi gravada com peso 1, e as três com status "a fazer"
- **Situação:** Aprovado
- **Evidência:** [CT10a.png](../testes/evidencias-06-11/CT10a.png) (detalhe da última), [CT10b.png](../testes/evidencias-06-11/CT10b.png) (lista)

### CT11: Concluir atividade: progresso, experiência e conquista

- **Requisito:** RF05, RF10, RF11, RF15, RF17, RN08, RN10, RN12, RN14
- **Pré-condição:** CT10
- **Passos:** conferir o progresso de Banco de Dados e a experiência de Lucas; abrir "Modelar o diagrama ER", da qual Lucas é o responsável, e clicar em **Marcar como concluída**
- **Entrada:** nenhuma
- **Esperado:** Modelagem vai a 75% (3 de 4 de peso), Banco de Dados a 50% (3 de 6), Lucas recebe 30 de experiência (peso 3 × 10) e a conquista Primeiro Passo
- **Observado:** o retorno da conclusão mostrou "Modelagem foi de 0% para 75%." e "+30 XP"; apareceu o aviso "Você conquistou: Primeiro Passo"; Banco de Dados foi de 0% para 50% e Lucas de 0 para 30 XP
- **Situação:** Aprovado
- **Evidência:** [CT11a.png](../testes/evidencias-11-11/CT11a.png) (retorno da conclusão), [CT11b.png](../testes/evidencias-11-11/CT11b.png) (disciplinas)

### CT12: Reverter a conclusão e concluir de novo

- **Requisito:** RN10, RN12
- **Pré-condição:** CT11
- **Passos:** no detalhe, mudar o status para "A fazer"; conferir experiência, progresso e conquistas; concluir de novo pela lista
- **Entrada:** nenhuma
- **Esperado:** a experiência é estornada, o progresso volta e a conquista sai junto; ao concluir de novo, a experiência é creditada uma vez só, e a conquista volta, uma vez só
- **Observado:** Lucas voltou a 0 XP, Banco de Dados a 0%, e Primeiro Passo saiu das conquistas. Concluída de novo, Lucas ficou com 30 XP, e não 60, e há uma única conquista gravada
- **Situação:** Aprovado
- **Evidência:** [CT12.png](../testes/evidencias-11-11/CT12.png)
### CT13: Busca e filtros por responsável, disciplina e situação, com a identidade visual

- **Requisito:** RF04, RN05
- **Pré-condição:** CT12; tela Atividades
- **Passos:** buscar por texto; abrir o filtro de responsável e escolher um membro; abrir o filtro de disciplina e escolher cada disciplina; abrir **Ordenar por** e escolher "Maior peso"; filtrar pela situação Atrasadas
- **Entrada:** busca "select"; responsável Marina Alves; disciplinas Engenharia de Software e Banco de Dados; ordem "Maior peso"; situação Atrasadas
- **Esperado:** cada filtro mostra só as atividades que correspondem a ele; as opções mostram a foto ou o avatar de cada responsável, a cor de cada disciplina e um símbolo para cada ordem, e o campo repete a marca da opção escolhida
- **Observado:** "select" → 1 atividade. No filtro de responsável, Marina aparece com a foto dela e Lucas como "Lucas Prado (você)"; Marina → 2, com a foto dela no campo. No filtro de disciplina, Engenharia de Software aparece com a sua cor laranja; Engenharia de Software → 0; Banco de Dados → 3, com o filtro gravado no endereço da página e a cor azul no campo. As quatro ordens têm símbolo, e "Maior peso" pôs "Modelar o diagrama ER" em primeiro. Atrasadas → 1, "Normalizar as tabelas até a 3FN"
- **Situação:** Aprovado
- **Evidência:** [CT13a.png](../testes/evidencias-06-11/CT13a.png) (responsável), [CT13b.png](../testes/evidencias-06-11/CT13b.png) (disciplina), [CT13c.png](../testes/evidencias-06-11/CT13c.png) (ordenar por), [CT13d.png](../testes/evidencias-06-11/CT13d.png) (atrasadas)

### CT14: Totais do painel e progresso por disciplina

- **Requisito:** RF06, RF11, RN05
- **Pré-condição:** CT13; Painel
- **Passos:** conferir os totais, a barra de Banco de Dados e o quadro "Seu ritmo"; clicar em Concluídas
- **Entrada:** nenhuma
- **Esperado:** totais por situação corretos, progresso por disciplina e a lista do painel filtrada pela situação escolhida
- **Observado:** A fazer 2, Fazendo 0, Concluídas 1, Atrasadas 1; Banco de Dados em 50%; "Seu ritmo" com ofensiva de 1 dia e 30 XP; ao clicar em Concluídas, a lista do painel passou a mostrar as concluídas
- **Situação:** Aprovado
- **Evidência:** [CT14.png](../testes/evidencias-06-11/CT14.png)

### CT15: Calendário do mês com as cores das disciplinas

- **Requisito:** RF23, RF25
- **Pré-condição:** CT14; tela Calendário
- **Passos:** conferir o mês; conferir o dia da entrega atrasada e o painel do dia; na barra de filtros, escolher outra disciplina; clicar em **Limpar filtros**
- **Entrada:** disciplina Engenharia de Software no filtro
- **Esperado:** cada entrega aparece no seu dia, na cor da disciplina; filtrar outra disciplina tira as entregas desta; limpar os filtros traz de volta
- **Observado:** título "Novembro de 2026"; o dia da entrega mostra "Normalizar as tabelas até a 3FN" com a marca azul de Banco de Dados, e o painel do dia a indica como atrasada; com Engenharia de Software no filtro, a entrega saiu do dia, e **Limpar filtros** a trouxe de volta
- **Situação:** Aprovado
- **Evidência:** [CT15a.png](../testes/evidencias-11-11/CT15a.png) (mês), [CT15b.png](../testes/evidencias-11-11/CT15b.png) (filtro de disciplina)
### CT16: Calendário nas visões semana e lista

- **Requisito:** RF23
- **Pré-condição:** CT15
- **Passos:** trocar para a visão **Semana** e depois para **Lista**
- **Entrada:** nenhuma
- **Esperado:** a semana mostra as entregas dos seus dias e a lista agrupa as entregas do mês por dia
- **Observado:** semana de 01/11 a 07/11 com a atividade dela; a lista agrupou as entregas do mês em Qua, 04/11, Dom, 08/11 e Sex, 13/11
- **Situação:** Aprovado
- **Evidência:** [CT16a.png](../testes/evidencias-06-11/CT16a.png) (semana), [CT16b.png](../testes/evidencias-06-11/CT16b.png) (lista)

### CT17: Nova atividade a partir de um dia do calendário

- **Requisito:** RF23, RF03
- **Pré-condição:** CT16
- **Passos:** avançar para o mês seguinte (dezembro), escolher o dia 6, clicar em **Nova atividade neste dia**, preencher e criar
- **Entrada:** "Escrever os casos de teste"; Engenharia de Software › Testes; peso 2; responsável Lucas Prado
- **Esperado:** o prazo já vem preenchido com o dia escolhido; depois de criar, o sistema volta ao calendário, e a atividade aparece nesse dia na cor da disciplina
- **Observado:** o prazo veio preenchido com o dia escolhido; depois de criar, o sistema voltou a `/calendario`; a atividade foi gravada em 06/12/2026 e aparece no dia 6, com a marca laranja de Engenharia de Software
- **Situação:** Aprovado
- **Evidência:** [CT17a.png](../testes/evidencias-11-11/CT17a.png) (formulário), [CT17b.png](../testes/evidencias-11-11/CT17b.png) (calendário)
### CT18: Painel de desempenho: experiência, ofensiva, conquistas e ranking

- **Requisito:** RF16, RF17, RF18, RN11
- **Pré-condição:** CT17; tela Conquistas, como Lucas
- **Passos:** conferir os números do topo, as conquistas e o ranking
- **Entrada:** nenhuma
- **Esperado:** experiência, ofensiva e posição de quem está usando, as seis conquistas com o andamento das que faltam, e o ranking do grupo
- **Observado:** 30 XP, ofensiva de 1 dia, 1º de 2 no grupo, 1 de 6 conquistas; Semana Cheia com "1 de 7 dias"; ranking com Lucas Prado em 1º e Marina Alves em 2º
- **Situação:** Aprovado
- **Evidência:** [CT18.png](../testes/evidencias-06-11/CT18.png)

### CT19: Dados recuperados ao reabrir o navegador

- **Requisito:** RNF02
- **Pré-condição:** CT18
- **Passos:** recarregar a página; fechar o navegador e abri-lo de novo no sistema
- **Entrada:** nenhuma
- **Esperado:** nada se perde, e a sessão continua aberta
- **Observado:** depois de recarregar, continuou na tela Conquistas; reaberto, o navegador entrou direto no painel, com os totais preservados (A fazer 3, Concluídas 1, Atrasadas 1) e a foto da Marina gravada
- **Situação:** Aprovado
- **Evidência:** [CT19.png](../testes/evidencias-06-11/CT19.png)

### CT20: Participante não vê a gestão do grupo

- **Requisito:** RN07
- **Pré-condição:** CT19
- **Passos:** em "Turma de ADS", passar a usar a demonstração como Marina Alves (sem conta, quem usa o navegador diz quem é no grupo); abrir Disciplinas e Membros
- **Entrada:** nenhuma
- **Esperado:** sem cadastro, edição ou remoção de disciplinas; sem adicionar membro; sem excluir o grupo
- **Observado:** Disciplinas sem "Nova disciplina" e sem menu de ações, com o aviso "Só o organizador do grupo cadastra e edita disciplinas"; Membros sem "Adicionar membro" e sem "Excluir o grupo", e só o cartão da própria Marina tem ações
- **Situação:** Aprovado
- **Evidência:** [CT20a.png](../testes/evidencias-11-11/CT20a.png) (disciplinas), [CT20b.png](../testes/evidencias-11-11/CT20b.png) (membros)

### CT21: Participante cadastra atividade, altera só as próprias e edita o próprio perfil

- **Requisito:** RF02, RF03, RN07, RN20 (novo teste do defeito [D10](16-defeitos-e-pendencias.md#d10))
- **Pré-condição:** CT20, como Marina
- **Passos:** cadastrar uma atividade, escolhendo a si mesma como responsável; abrir uma atividade de Lucas; em Membros, abrir **Editar meu perfil** e trocar a função
- **Entrada:** "Criar as tabelas no banco" (Banco de Dados › SQL, peso 2, prazo 05/11, responsável Marina Alves); função "Front-end e protótipos"
- **Esperado:** a participante cadastra a atividade e mexe só nas atividades das quais é responsável; nas dos outros, não edita, não exclui e não muda o status; edita o próprio cadastro, mas não o perfil de acesso
- **Observado:** atividade criada com Marina como responsável, com o botão **Excluir**; na atividade "Modelar o diagrama ER", de Lucas, não há **Editar**, **Excluir** nem a troca de status; o formulário do próprio perfil não tem o campo de perfil; a função foi atualizada no cartão
- **Situação:** Aprovado
- **Evidência:** [CT21a.png](../testes/evidencias-06-11/CT21a.png) (atividade dela), [CT21b.png](../testes/evidencias-06-11/CT21b.png) (atividade de outro membro), [CT21c.png](../testes/evidencias-06-11/CT21c.png) (próprio perfil)

### CT22: Grupo não fica sem o último organizador

- **Requisito:** RN07
- **Pré-condição:** CT21; a demonstração volta a ser usada como Lucas Prado, o único organizador
- **Passos:** abrir o menu de ações do próprio cartão; tentar remover; editar e trocar o perfil para Participante
- **Entrada:** perfil Participante
- **Esperado:** o sistema não permite remover nem rebaixar o último organizador
- **Observado:** "Remover" aparece desabilitado; ao salvar como Participante: "O grupo precisa de pelo menos um organizador."
- **Situação:** Aprovado
- **Evidência:** [CT22.png](../testes/evidencias-11-11/CT22.png) (recusa)

### CT23: Remover membro: as atividades passam para quem assume

- **Requisito:** RF02, RN02
- **Pré-condição:** CT22; Marina é responsável por 3 atividades
- **Passos:** remover Marina Alves; tentar confirmar sem escolher; escolher quem assume e confirmar
- **Entrada:** quem assume: Lucas Prado
- **Esperado:** a remoção só é confirmada depois de escolher quem assume; nenhuma atividade some nem fica sem responsável
- **Observado:** o botão **Remover** ficou desabilitado até a escolha; aviso "Membro removido", com "3 atividades de Marina passaram para Lucas."; as 5 atividades do grupo continuam, todas com Lucas como responsável, e nenhuma sem responsável
- **Situação:** Aprovado
- **Evidência:** [CT23a.png](../testes/evidencias-06-11/CT23a.png) (confirmação), [CT23b.png](../testes/evidencias-06-11/CT23b.png) (atividades)

### CT24: Encerrar sessão e acesso a rota privada

- **Requisito:** RF09
- **Pré-condição:** CT23
- **Passos:** abrir o menu da conta, na barra do topo, e clicar em **Voltar ao espaço pessoal**; num navegador limpo, abrir `/painel` direto e o endereço antigo `/login`
- **Entrada:** nenhuma
- **Esperado:** sair do grupo volta ao espaço pessoal; sem sessão, as rotas privadas levam à tela de acesso. Sem o banco configurado, não há "Sair da demonstração" (D16)
- **Observado:** **Voltar ao espaço pessoal** abriu o painel com "Pessoal" no seletor; no navegador limpo, `/painel` foi para `/entrar`, e `/login` também
- **Situação:** Aprovado
- **Evidência:** [CT24.png](../testes/evidencias-11-11/CT24.png)
### CT25: Tema claro e escuro em todas as telas, mantido após recarregar

- **Requisito:** RF08
- **Pré-condição:** CT24
- **Passos:** abrir a página Sobre nós e mudar para o tema claro; abrir o grupo e recarregar; abrir a página inicial, Sobre nós e um endereço inexistente; voltar ao tema escuro pelo botão da página inicial e abrir o painel
- **Entrada:** endereço `/endereco-que-nao-existe`
- **Esperado:** a escolha do tema vale para todas as telas, públicas e do sistema, e é mantida ao recarregar
- **Observado:** a página Sobre nós começou escura e ficou clara, com o fundo `#f5f7fb`; o grupo abriu claro e continuou claro depois de recarregar; a página inicial, Sobre nós e a página "Página não encontrada" também abriram claras. O botão da página inicial voltou ao escuro, com o fundo `#07090f`, e o sistema acompanhou
- **Situação:** Aprovado
- **Evidência:** [CT25a.png](../testes/evidencias-11-11/CT25a.png) (página pública), [CT25b.png](../testes/evidencias-11-11/CT25b.png) (sistema)
### CT26: Remover disciplina em cascata

- **Requisito:** RF13, RN02
- **Pré-condição:** CT25; tela Disciplinas
- **Passos:** remover Banco de Dados e confirmar
- **Entrada:** nenhuma
- **Esperado:** a confirmação informa o que sai junto, e conteúdos e atividades da disciplina são removidos
- **Observado:** "Banco de Dados será removida do grupo, junto com 4 atividades e 2 conteúdos. Não dá para desfazer."; ficou só Engenharia de Software, com 1 conteúdo e 1 atividade
- **Situação:** Aprovado
- **Evidência:** [CT26a.png](../testes/evidencias-06-11/CT26a.png) (confirmação), [CT26b.png](../testes/evidencias-06-11/CT26b.png) (depois)

### CT27: Serviços externos indisponíveis

- **Requisito:** RNF10, RN15, RN17
- **Pré-condição:** navegador limpo
- **Passos:** (a) com BrasilAPI, Nager.Date e DiceBear fora do ar e nenhuma relação de feriados salva, criar um grupo e abrir o painel, observando os pedidos que a página faz; (b) em outro navegador, abrir o painel com os serviços no ar, derrubar a BrasilAPI e recarregar
- **Entrada:** grupos "Grupo Offline" e "Grupo Online", criados por Lucas Prado
- **Esperado:** o sistema continua utilizável; o avatar aparece normalmente, porque é desenhado pelo próprio sistema; os feriados mostram aviso ou reaproveitam a última relação obtida
- **Observado:** (a) o quadro de feriados mostrou "Não foi possível carregar os feriados agora."; a página não fez nenhum pedido à DiceBear, e o avatar de Lucas apareceu na barra do topo, como imagem gerada no próprio navegador; (b) os feriados salvos antes continuaram aparecendo
- **Situação:** Aprovado
- **Evidência:** [CT27a.png](../testes/evidencias-06-11/CT27a.png) (sem serviços), [CT27b.png](../testes/evidencias-06-11/CT27b.png) (relação salva)

### CT28: Carregar dados de exemplo

- **Requisito:** RF20, RF34
- **Pré-condição:** navegador limpo; tela de acesso, no modo de demonstração
- **Passos:** informar o nome e clicar em **Começar com dados de exemplo**; abrir o grupo de exemplo pelo seletor de espaço
- **Entrada:** Ana Souza
- **Esperado:** o sistema pede o nome; um grupo preenchido é criado, a pessoa entra nele como um dos membros, e a carga não dispara aviso de conquista
- **Observado:** "Como podemos te chamar?"; grupo "Trio do TCC" com 5 disciplinas, 8 conteúdos, 15 atividades (três delas direto na disciplina, sem conteúdo, e uma "A definir"), 6 eventos e 3 membros; Ana entrou como a organizadora do grupo, sem aviso de conquista
- **Situação:** Aprovado
- **Evidência:** [CT28a.png](../testes/evidencias-11-11/CT28a.png) (nome), [CT28b.png](../testes/evidencias-11-11/CT28b.png) (painel)
### CT29: Feriado no prazo e próximos feriados

- **Requisito:** RF03, RF07, RF21, RF23
- **Pré-condição:** CT28
- **Passos:** em Nova atividade, escolher TCC › Referencial teórico, abrir o calendário do prazo e escolher o dia 15; criar a atividade e abri-la pelo aviso; abrir o painel e o calendário de novembro
- **Entrada:** prazo 15/11/2026; "Revisar o capítulo 2" (TCC › Referencial teórico, responsável Ana Souza)
- **Esperado:** o calendário do campo, o formulário, o detalhe, o painel e o calendário sinalizam o feriado, e o painel lista os próximos feriados
- **Observado:** o calendário do campo já marcava o dia 15 como feriado da Proclamação da República; dica "Esse prazo cai no feriado: Proclamação da República."; o detalhe mostra o feriado; painel com "Revisar o capítulo 2 vence em 15/11/2026, feriado de Proclamação da República." e os próximos feriados Proclamação da República (15/11), Dia da consciência negra (20/11) e Natal (25/12); calendário com o dia 15 de novembro marcado como feriado
- **Situação:** Aprovado
- **Evidência:** [CT29a.png](../testes/evidencias-11-11/CT29a.png) (formulário), [CT29b.png](../testes/evidencias-11-11/CT29b.png) (painel), [CT29c.png](../testes/evidencias-11-11/CT29c.png) (calendário)

### CT30: Aviso de prazo em fim de semana

- **Requisito:** RF22
- **Pré-condição:** CT29; tela Nova atividade
- **Passos:** escolher no calendário do prazo um sábado, um domingo e uma segunda-feira
- **Entrada:** 07/11/2026, 08/11/2026 e 09/11/2026 (o sábado, o domingo e a segunda-feira seguintes à execução)
- **Esperado:** o aviso aparece só nos prazos de sábado ou domingo
- **Observado:** "Esse prazo cai num fim de semana." no sábado e no domingo; nenhum aviso na segunda-feira
- **Situação:** Aprovado
- **Evidência:** [CT30.png](../testes/evidencias-06-11/CT30.png)

### CT31: Grupo antigo sem membros: as telas funcionam e o primeiro membro é o organizador

- **Requisito:** RF02, RF18, RN07 (novo teste dos defeitos [D01](16-defeitos-e-pendencias.md#d01), [D03](16-defeitos-e-pendencias.md#d03) e [D09](16-defeitos-e-pendencias.md#d09))
- **Pré-condição:** navegador com um grupo gravado sem nenhum membro, como as versões anteriores permitiam, e uma atividade antiga sem responsável (sem membro no grupo, a migração não tem a quem atribuí-la; dados já na versão 3)
- **Passos:** começar a demonstração com o nome e abrir o grupo pelo seletor de espaço; abrir Atividades, Conquistas e Nova atividade; em Membros, abrir **Adicionar membro**, cadastrar e conferir o perfil
- **Entrada:** "Rafael Costa"
- **Esperado:** as telas abrem sem erro e orientam a cadastrar o primeiro membro; a atividade sem responsável não aparece com avatar, como se houvesse um membro; o primeiro membro do grupo é cadastrado como organizador
- **Observado:** a atividade antiga aparece com um círculo vazio indicando "Responsável a definir", sem avatar. Conquistas mostra "O grupo ainda não tem membros", com o atalho para Membros, e o campo de responsável da nova atividade explica que o grupo ainda não tem membros. O campo de perfil veio travado em Organizador, com a explicação "O primeiro membro do grupo é o organizador."; Rafael Costa entrou como Organizador, já identificado como quem está usando, e continua podendo gerenciar o grupo. Nenhum erro no console do navegador
- **Situação:** Aprovado
- **Evidência:** [CT31a.png](../testes/evidencias-11-11/CT31a.png) (atividade antiga), [CT31b.png](../testes/evidencias-11-11/CT31b.png) (conquistas), [CT31c.png](../testes/evidencias-11-11/CT31c.png) (formulário), [CT31d.png](../testes/evidencias-11-11/CT31d.png) (membros)

### CT32: Falha de gravação no armazenamento do navegador

- **Requisito:** RNF02 (novo teste do defeito [D02](16-defeitos-e-pendencias.md#d02))
- **Pré-condição:** navegador limpo; grupo "Grupo Cheio" criado
- **Passos:** simular o armazenamento do navegador cheio e cadastrar uma disciplina; restaurar o armazenamento, cadastrar outra e recarregar a página
- **Entrada:** "Estatística" com o armazenamento cheio; "Cálculo" depois de restaurado
- **Esperado:** o usuário é avisado de que o cadastro não foi salvo, e o aviso some quando a gravação volta
- **Observado:** apareceram o aviso no canto e a faixa "Não foi possível salvar no navegador." no topo; restaurado o armazenamento, a faixa sumiu na gravação seguinte; depois de recarregar, as duas disciplinas estavam gravadas
- **Situação:** Aprovado
- **Evidência:** [CT32a.png](../testes/evidencias-06-11/CT32a.png) (aviso), [CT32b.png](../testes/evidencias-06-11/CT32b.png) (depois de recarregar)

### CT33: Páginas públicas: início, sobre nós e endereço inexistente

- **Requisito:** RF26
- **Pré-condição:** navegador limpo
- **Passos:** abrir a página inicial e conferir as fotos da equipe e o rodapé; abrir **Sobre nós**; abrir um endereço que não existe; clicar em **Começar agora**
- **Entrada:** endereço `/pagina-que-nao-existe`
- **Esperado:** as páginas públicas abrem sem sessão, com as fotos da equipe mostrando a cabeça inteira e o Instagram da equipe no rodapé, e o endereço inexistente mostra a página 404
- **Observado:** página inicial com "Veja o quanto você já avançou em cada matéria." e o grupo por convite marcado como "Em breve"; as fotos de Andrey e Matheus aparecem nos círculos a partir do topo, com a cabeça inteira; o rodapé traz "Instagram @go.vertice", com o link para `instagram.com/go.vertice`, que abre em outra aba; Sobre nós com as frases e os avatares de Andrey e Matheus; endereço inexistente com "Página não encontrada"; **Começar agora** levou à tela de acesso
- **Situação:** Aprovado
- **Evidência:** [CT33a.png](../testes/evidencias-06-11/CT33a.png) (início), [CT33b.png](../testes/evidencias-06-11/CT33b.png) (sobre nós), [CT33c.png](../testes/evidencias-06-11/CT33c.png) (404), [CT33d.png](../testes/evidencias-06-11/CT33d.png) (rodapé)

### CT34: Uso no celular

- **Requisito:** RNF01
- **Pré-condição:** navegador limpo, com tela de 390 × 844
- **Passos:** abrir a página inicial; carregar os dados de exemplo; abrir o menu e cada tela do sistema
- **Entrada:** nenhuma
- **Esperado:** nenhuma tela rola para os lados, e a barra de seções vira menu
- **Observado:** sem rolagem lateral no início, no painel, no calendário, em Eventos, Atividades, Disciplinas, Membros, Conquistas, Nova atividade e Sobre nós; o menu do sistema desce do topo pelo botão de menu
- **Situação:** Aprovado
- **Evidência:** [CT34a.png](../testes/evidencias-06-11/CT34a.png) (painel), [CT34b.png](../testes/evidencias-06-11/CT34b.png) (menu), [CT34c.png](../testes/evidencias-06-11/CT34c.png) (calendário)

### CT35: Dados da versão de 20/10 são migrados

- **Requisito:** RN06, RN18
- **Pré-condição:** navegador com dados da versão de 20/10: uma atividade sem responsável e uma disciplina com a cor `#78716c`, que não existe na paleta nova
- **Passos:** abrir o sistema; começar a demonstração com o nome; abrir o grupo pelo seletor de espaço e escolher Lucas Prado; abrir a atividade
- **Entrada:** nenhuma
- **Esperado:** a atividade sem responsável passa para o organizador, a outra não muda, as duas ganham a disciplina do seu conteúdo, e a cor vira a equivalente da paleta
- **Observado:** dados na versão 4; a atividade sem responsável passou para Lucas Prado, o organizador, e a de Marina continuou com ela; as duas ficaram com a disciplina Cálculo gravada; a cor virou `#a8a29e` (Pedra); o detalhe mostra o responsável
- **Situação:** Aprovado
- **Evidência:** [CT35.png](../testes/evidencias-11-11/CT35.png)

### CT36: Dados da primeira versão (tarefas) com atividade sem grupo

- **Requisito:** RNF02, RN07
- **Pré-condição:** navegador com dados da primeira versão do sistema: duas tarefas, uma delas de um grupo que não existe mais
- **Passos:** abrir o sistema; recarregar a página
- **Entrada:** nenhuma
- **Esperado:** a tarefa do grupo vira atividade, direto na disciplina; a que não tem grupo não é apagada, e a pessoa é avisada uma vez
- **Observado:** aviso "Uma atividade antiga ficou sem grupo"; dados na versão 4; "Lista de exercícios" virou atividade, na disciplina "Física", sem conteúdo (o conteúdo "Geral", que a versão 2 criava, não fica mais); o primeiro membro virou organizador; a tarefa sem grupo continua guardada; depois de recarregar, o aviso não apareceu de novo
- **Situação:** Aprovado
- **Evidência:** [CT36.png](../testes/evidencias-11-11/CT36.png)

### CT37: Editar e excluir atividade

- **Requisito:** RF03, RN08, RN14
- **Pré-condição:** navegador limpo; dados de exemplo carregados, como Ana Souza, a organizadora
- **Passos:** conferir o progresso de Banco de Dados; abrir "Resolver a lista de SELECT", clicar em **Editar**, trocar título e peso e salvar; depois, clicar em **Excluir** e confirmar
- **Entrada:** título "Resolver a lista de SELECT e JOIN"; peso 4
- **Esperado:** a edição é gravada e o progresso da disciplina acompanha o peso novo; a exclusão pede confirmação, tira a atividade da lista e recalcula o progresso
- **Observado:** Banco de Dados começou em 43% (3 de 7 de peso). Editada, a atividade mostrou o título novo, com peso 4 gravado, e Banco de Dados foi a 33% (3 de 9). Na exclusão apareceu "Excluir atividade?"; confirmada, a atividade saiu da lista ("14 atividades encontradas") e do armazenamento, e Banco de Dados foi a 60% (3 de 5)
- **Situação:** Aprovado
- **Evidência:** [CT37a.png](../testes/evidencias-11-11/CT37a.png) (editada), [CT37b.png](../testes/evidencias-11-11/CT37b.png) (excluída)

### CT38: Excluir o grupo

- **Requisito:** RF01, RN02
- **Pré-condição:** CT37, como Ana Souza, a organizadora
- **Passos:** em Membros, conferir a posição da seção **Excluir o grupo**; clicar em **Excluir grupo** e confirmar; abrir `/painel`
- **Entrada:** nenhuma
- **Esperado:** a exclusão fica no pé da página; a confirmação é pedida; o grupo sai com membros, disciplinas, conteúdos, atividades, eventos e conquistas; o sistema volta ao espaço pessoal
- **Observado:** com 3 membros, a seção terminou a 937 px do topo, numa tela de 1000 px, no pé da página. Apareceu "Excluir o grupo?"; confirmada, o sistema voltou ao espaço pessoal. Grupo, membros, disciplinas, conteúdos, atividades, eventos e as 2 conquistas do grupo foram removidos, e a sessão do grupo foi encerrada: `/painel` abriu o espaço pessoal, sem o grupo no seletor
- **Situação:** Aprovado
- **Evidência:** [CT38a.png](../testes/evidencias-11-11/CT38a.png) (confirmação), [CT38b.png](../testes/evidencias-11-11/CT38b.png) (espaço pessoal)
### CT39: Editor de foto: o que é enquadrado é o que fica gravado

- **Requisito:** RF24, RN19
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza, a organizadora; em Membros, **Editar** no cartão de Bruno Lima (a foto da própria Ana fica em Meu perfil)
- **Passos:** (1) escolher a imagem de 400 × 300 e aplicar sem mexer; (2) escolhê-la de novo, mover a foto para a direita pelo teclado (Shift + seta para a direita, 6 vezes) e aplicar; (3) escolhê-la de novo, pôr o zoom em 2 e aplicar; (4) escolher outra imagem e clicar em **Cancelar**; (5) escolher a foto de celular, pôr o zoom em 2,5, aplicar e salvar
- **Entrada:** imagem de 400 × 300 com a metade esquerda vermelha, a metade direita azul e um retângulo verde no canto de cima, à esquerda; foto de celular de 4000 × 3000, com 4,9 MB
- **Esperado:** o editor abre com o foco na foto; a foto gravada é exatamente o que estava dentro da moldura; cancelar mantém a foto anterior; a foto grande abre sem travar a tela e é gravada reduzida
- **Observado:** o foco começou na área "Enquadramento da foto". Sem mexer, ficou gravado o quadrado do meio: verde no canto, vermelho à esquerda e azul à direita. Movida para a direita, a foto passou a mostrar a borda esquerda da imagem, e o vermelho, a ocupar dois terços. Com zoom 2, ficou só o miolo, sem o canto verde. Cancelar manteve a foto anterior. A foto de celular apareceu no editor em 227 ms, e o **Aplicar** levou 586 ms; nesse intervalo, a página teve uma única tarefa acima de 50 ms, de 116 ms. A foto foi gravada em JPEG, com 256 × 256 pixels e 9 KB. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT39a.png](../testes/evidencias-11-11/CT39a.png) (editor), [CT39b.png](../testes/evidencias-11-11/CT39b.png) (foto movida), [CT39c.png](../testes/evidencias-11-11/CT39c.png) (zoom 2), [CT39d.png](../testes/evidencias-11-11/CT39d.png) (membros)

### CT40: Foto do grupo: na criação e na edição, e as iniciais quando não há foto

- **Requisito:** RF29, RN19
- **Pré-condição:** navegador limpo; demonstração começada com o nome
- **Passos:** no seletor de espaço, escolher **Criar grupo**, preencher, escolher a foto do grupo, aplicar e criar; no seletor, abrir **Editar grupo**, trocar nome e descrição, remover a foto e salvar; pôr a foto de novo; cadastrar uma participante e abrir o seletor; entrar como a participante e abrir o seletor
- **Entrada:** grupo "Grupo de Física", com a foto PNG de 640 × 480; depois, nome "Física II" e descrição "Turma da noite"; participante "Marina Alves"
- **Esperado:** a foto do grupo é ajustada numa moldura quadrada e aparece na barra do topo e no seletor de espaço; sem foto, voltam as iniciais do nome; só o organizador edita o grupo
- **Observado:** o editor usou a moldura quadrada de cantos arredondados; a prévia do formulário e a barra do topo mostraram a foto. Sem a foto, a barra do topo voltou a mostrar "FI", as iniciais de "Física II", e foram gravados o nome, a descrição e a foto vazia. Com a foto de volta, o seletor de espaço mostrou a foto ao lado do grupo. Marina, participante, não vê **Editar grupo**. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT40a.png](../testes/evidencias-11-11/CT40a.png) (editor), [CT40b.png](../testes/evidencias-11-11/CT40b.png) (barra do topo), [CT40c.png](../testes/evidencias-11-11/CT40c.png) (editar grupo, sem foto), [CT40d.png](../testes/evidencias-11-11/CT40d.png) (seletor de espaço)
### CT41: Criar conteúdo sem sair do cadastro de atividade

- **Requisito:** RF30, RN07, RN13
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza, a organizadora; tela Nova atividade
- **Passos:** preencher título, descrição, disciplina e peso; abrir **Conteúdo** e escolher **Criar novo conteúdo**; cadastrar o conteúdo na janela; escolher prazo e responsável, criar a atividade e abri-la pelo aviso. Depois, cadastrar uma disciplina sem conteúdos, escolhê-la no formulário e usar o atalho **Criar um** da dica do campo. Por fim, entrar como Bruno Lima, participante, e abrir a lista de conteúdos
- **Entrada:** "Exercícios de JOIN"; "Lista 3 do professor."; Banco de Dados; peso 3; conteúdo "Joins"; prazo 15/11; responsável Carla Dias. Disciplina "Física", com o conteúdo "Cinemática"
- **Esperado:** a lista começa em "Sem conteúdo"; a janela já abre na disciplina escolhida; ao cadastrar, o conteúdo novo fica escolhido e nada do que foi preenchido se perde; o participante não vê a opção de criar
- **Observado:** a lista começou em "Sem conteúdo" e terminou com **Criar novo conteúdo**, depois de Modelagem e SQL, e a janela abriu já em Banco de Dados. Cadastrado o conteúdo, o formulário continuou com o título, a descrição, Banco de Dados e o peso 3, com "Joins" escolhido e nenhuma mensagem de erro. A atividade foi gravada em "Joins", que entrou como o último conteúdo da disciplina. Em Física, a dica do campo mostrou "Opcional. Física ainda não tem conteúdos. Criar um", e "Cinemática" ficou escolhido depois do cadastro. Para Bruno, a lista mostrou só "Sem conteúdo", Modelagem, SQL e Joins. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT41a.png](../testes/evidencias-11-11/CT41a.png) (lista de conteúdos), [CT41b.png](../testes/evidencias-11-11/CT41b.png) (janela do conteúdo), [CT41c.png](../testes/evidencias-11-11/CT41c.png) (formulário preservado)

### CT42: Só o responsável muda o status da atividade

- **Requisito:** RF05, RN07, RN20
- **Pré-condição:** navegador limpo; dados de exemplo, como Bruno Lima, participante
- **Passos:** abrir Atividades; abrir uma atividade de Ana e, depois, o endereço de edição dela; concluir pela lista uma atividade de Bruno. Entrar como Ana, abrir uma atividade de Bruno, editar o título e salvar. Em Nova atividade, escolher a si mesma como responsável e o status Concluído, trocar o responsável para Carla Dias e criar
- **Entrada:** atividade de Ana "Escrever a introdução do TCC"; atividade de Bruno "Montar protótipo das telas"; atividade de Bruno "Componentes do formulário", com o título novo "Componentes do formulário de cadastro"; nova atividade "Revisar a conclusão" (TCC › Apresentação, prazo 17/11)
- **Esperado:** cada pessoa muda o status só das atividades das quais é responsável, o organizador também; o organizador edita e exclui as atividades dos outros; atividade cadastrada para outra pessoa começa em "a fazer"
- **Observado:** Bruno tem o botão de concluir só nas 5 atividades dele; nas outras 9, o círculo só mostra a situação. Na atividade de Ana, não há **Marcar como concluída**, troca de status, **Editar** nem **Excluir**, e o detalhe informa "Só Ana muda o status."; pelo endereço de edição, apareceu "Você não pode editar esta atividade". Bruno concluiu a própria atividade, com o aviso "+40 XP para você". Como Ana, na atividade de Bruno: **Editar** e **Excluir**, sem **Concluir** e sem troca de status; no formulário, o status ficou travado, com "Só Bruno, que é responsável, muda o status.", e depois de salvar o título o status continuou "fazendo". Na nova atividade, o status abriu para ela mesma; ao passar a atividade para Carla, travou e voltou ao vazio, e a atividade foi gravada como "a fazer". Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT42a.png](../testes/evidencias-11-11/CT42a.png) (lista como Bruno), [CT42b.png](../testes/evidencias-11-11/CT42b.png) (atividade de outra pessoa), [CT42c.png](../testes/evidencias-11-11/CT42c.png) (organizadora editando)

### CT43: Calendário: troca de mês com animação, também deslizando o dedo

- **Requisito:** RF23, RNF01
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza; tela Calendário
- **Passos:** avançar e voltar um mês pelos botões; na visão Semana, avançar uma semana. Em tela de celular com toque, deslizar o dedo para a esquerda, para a direita e dar um toque curto. Num navegador com a opção "reduzir movimento", avançar um mês
- **Entrada:** nenhuma
- **Esperado:** o mês novo entra deslizando pelo lado do movimento; deslizar o dedo troca de mês, e um toque curto não; com "reduzir movimento", a troca é imediata
- **Observado:** ao avançar, o mês novo entrou pela direita; ao voltar, pela esquerda, e o título voltou a "Novembro de 2026"; a semana também desliza. No celular, deslizar para a esquerda levou a "Dezembro de 2026", deslizar para a direita voltou a "Novembro de 2026", e o toque curto não trocou de mês. Com "reduzir movimento", a animação durou menos de 1 ms. Nenhum erro no console dos três navegadores
- **Situação:** Aprovado
- **Evidência:** [CT43a.png](../testes/evidencias-06-11/CT43a.png) (mês seguinte), [CT43b.png](../testes/evidencias-06-11/CT43b.png) (celular, depois de deslizar)

### CT44: Campo de data com o calendário do sistema

- **Requisito:** RF03, RN06
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza; tela Nova atividade
- **Passos:** abrir o campo **Prazo**; pressionar seta para a direita, seta para baixo, Page Down, Page Up e Enter; abrir o campo de novo e clicar em **Limpar**; clicar em **Criar atividade**
- **Entrada:** nenhuma
- **Esperado:** o calendário abre no mês atual, com o foco no dia de hoje; o teclado anda por dias, semanas e meses, e Enter escolhe o dia; Limpar esvazia o campo, e o prazo continua obrigatório
- **Observado:** abriu em novembro de 2026, com o foco em 06/11, marcado como hoje. As setas levaram a 14/11; Page Down, a 14/12; Page Up voltou, e Enter escolheu "Sábado, 14 de novembro de 2026". **Limpar** voltou o campo a "Selecione a data", e ao criar apareceu "Defina um prazo de entrega.". Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT44a.png](../testes/evidencias-06-11/CT44a.png) (calendário aberto), [CT44b.png](../testes/evidencias-06-11/CT44b.png) (dia escolhido)

### CT45: Marca do Vértice: dá um terço de volta enquanto o grupo abre e uma volta ao passar o mouse

- **Requisito:** RNF06
- **Pré-condição:** navegador limpo; tela de acesso, no modo de demonstração
- **Passos:** informar o nome e começar com os dados de exemplo; acompanhar a passagem para o painel, conferindo as animações da marca e o endereço da página durante a passagem; no painel, passar o mouse sobre a marca da barra do topo. Num navegador com a opção "reduzir movimento", entrar de novo
- **Entrada:** nenhuma
- **Esperado:** ao entrar, uma cortina com a marca cobre a tela de acesso, que não muda enquanto isso; com a tela coberta, o painel abre por baixo; a marca dá um terço de volta, em menos de 1 s, animando só posição e transparência, e a cortina se dissolve no painel, com a passagem inteira em menos de 1,5 s; no painel, a marca fica parada e dá uma volta só, rápida, quando o mouse passa por cima; com "reduzir movimento", a marca não gira, e a cortina só esmaece
- **Observado:** a cortina mostrou "Abrindo seu espaço…", e o endereço continuou em /entrar até a tela ficar coberta; depois, já era /painel. A marca animou só transform e opacity, terminou em 120° em menos de 1 s. A passagem inteira levou 1,44 s, e ficou o painel. Parada, a marca não tinha animação; com o mouse em cima, deu uma volta inteira, de 0,6 s. Com "reduzir movimento", a marca não girou, e a cortina sumiu em menos de 1 s. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT45a.png](../testes/evidencias-11-11/CT45a.png) (a marca começa a puxar a cortina), [CT45b.png](../testes/evidencias-11-11/CT45b.png) (painel)

### CT46: Barra de seções no topo, também no celular

- **Requisito:** RNF01, RNF06
- **Pré-condição:** navegador limpo; dados de exemplo, como Bruno Lima
- **Passos:** conferir a barra do topo; abrir Calendário por ela; abrir o menu da conta; abrir Painel, Atividades, Calendário e Eventos numa tela de 1024 px; numa tela de celular, abrir o menu e escolher Atividades
- **Entrada:** nenhuma
- **Esperado:** as sete seções ficam na barra do topo, sem barra lateral, e a seção aberta fica marcada; o menu da conta mostra quem está usando; nenhuma tela rola para os lados; no celular, o menu desce do topo e leva à seção
- **Observado:** nenhuma barra lateral; a barra do topo trouxe Painel, Calendário, Eventos, Disciplinas, Atividades, Membros e Conquistas, e Calendário ficou marcado depois de aberto. O menu da conta mostrou Bruno Lima, Participante, e "Voltar ao espaço pessoal". Em 1024 px, nenhuma das quatro telas rolou para os lados. No celular, o menu abriu colado ao topo, com os 390 px de largura, e levou a Atividades. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT46a.png](../testes/evidencias-11-11/CT46a.png) (menu da conta), [CT46b.png](../testes/evidencias-11-11/CT46b.png) (1024 px), [CT46c.png](../testes/evidencias-11-11/CT46c.png) (celular)

### CT47: Avatar: dois estilos (Rabisco e Ilustrado) para escolher e sortear

- **Requisito:** RF19, RN15
- **Pré-condição:** navegador limpo, com a DiceBear observada; grupo "Grupo de Química" criado por Lucas Prado; tela Membros
- **Passos:** abrir **Adicionar membro**; conferir os estilos; clicar em **Sortear outro**; trocar o estilo pelo teclado (seta para a direita); preencher o nome e adicionar. Depois, editar o membro, escolher uma foto, aplicar e removê-la
- **Entrada:** "Marina Alves"; estilo Ilustrado; foto PNG de 640 × 480
- **Esperado:** os dois estilos aparecem com o primeiro marcado; sortear e trocar o estilo mudam a prévia; o estilo e a semente são gravados; com foto, a foto aparece no lugar do avatar, e sem ela o avatar volta; nenhuma imagem vem de fora
- **Observado:** estilos Rabisco e Ilustrado, com Rabisco marcado. Sortear trocou o avatar da prévia; a seta para a direita passou a Ilustrado e trocou de novo a prévia. Foi gravado o estilo `notionists` (Ilustrado), com a semente sorteada, e o cartão mostrou o avatar gerado no próprio navegador. Com a foto, a dica avisou "Enquanto houver foto, ela aparece no lugar do avatar."; sem ela, o avatar voltou. Nenhum pedido à DiceBear e nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT47a.png](../testes/evidencias-06-11/CT47a.png) (estilos), [CT47b.png](../testes/evidencias-06-11/CT47b.png) (sem a foto, o avatar volta)


### CT48: Atividade sem conteúdo: só a disciplina é obrigatória, e ela conta no progresso da disciplina

- **Requisito:** RF03, RF11, RN06, RN13, RN14
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza; tela Nova atividade
- **Passos:** clicar em **Criar atividade** com tudo vazio; preencher título, disciplina, peso, prazo e responsável, sem escolher conteúdo, e criar; abrir a atividade pelo aviso e clicar em **Marcar como concluída**; abrir a disciplina
- **Entrada:** "Lista de regressão linear"; Estatística, que não tem conteúdos; peso 3; prazo 16/11; responsável Ana Souza
- **Esperado:** o erro aparece na disciplina, e não no conteúdo; a atividade é gravada só com a disciplina; ao concluir, o progresso da disciplina sobe, e a disciplina lista as atividades sem conteúdo
- **Observado:** com tudo vazio, "Escolha a disciplina da atividade." e nenhuma mensagem no conteúdo, que mostrava "Sem conteúdo". A atividade foi gravada com a disciplina e o conteúdo vazio, e o detalhe mostrou "Progresso de Estatística". Concluída, o retorno mostrou "Estatística foi de 33% para 83%." (2 de 6 pontos antes, 5 de 6 depois). Em Estatística, a seção "Atividades" lista as três atividades da disciplina, com "5 de 6 pontos de peso". Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT48a.png](../testes/evidencias-11-11/CT48a.png) (formulário), [CT48b.png](../testes/evidencias-11-11/CT48b.png) (retorno da conclusão), [CT48c.png](../testes/evidencias-11-11/CT48c.png) (disciplina)

### CT49: Excluir um conteúdo não apaga as atividades: elas ficam na disciplina, sem conteúdo

- **Requisito:** RF14, RN02, RN13
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza, a organizadora
- **Passos:** abrir Banco de Dados; no menu do conteúdo SQL, escolher **Remover** e confirmar
- **Entrada:** conteúdo SQL, com a atividade "Resolver a lista de SELECT"
- **Esperado:** a confirmação avisa que a atividade continua; o conteúdo sai, e a atividade fica na disciplina, sem conteúdo
- **Observado:** a confirmação disse "A atividade dele continua na disciplina, sem conteúdo."; confirmada, "Resolver a lista de SELECT" continuou gravada, com o conteúdo vazio, e apareceu na seção "Sem conteúdo" da disciplina. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT49.png](../testes/evidencias-06-11/CT49.png)

### CT50: Migração para a versão 3: disciplina na atividade, "Geral" automático sai, estilo antigo de avatar vira o padrão

- **Requisito:** RNF02, RN13, RN15
- **Pré-condição:** navegador com dados da versão 2: o conteúdo "Geral" criado pela migração anterior, com uma atividade; o conteúdo "Limites", com uma atividade concluída; um membro com o estilo de avatar Pixel, que saiu
- **Passos:** abrir o sistema; começar a demonstração com o nome; abrir o grupo pelo seletor de espaço e escolher Lucas; abrir Disciplinas
- **Entrada:** nenhuma
- **Esperado:** as atividades ganham a disciplina; a do "Geral" fica direto na disciplina e o "Geral" automático sai; a de Limites continua no conteúdo; o estilo que saiu vira Rabisco; nenhuma atividade some, e o progresso da disciplina conta as duas
- **Observado:** as duas atividades ficaram com a disciplina Cálculo; a do "Geral" ficou sem conteúdo, e a lista de conteúdos ficou só com Limites; o estilo Pixel virou `croodles-neutral` (Rabisco); dados na versão 4. Em Disciplinas, Cálculo aparece com 60% (3 de 5 pontos de peso). Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT50.png](../testes/evidencias-11-11/CT50.png)

### CT51: Evento: cadastro com validação, página de eventos, painel, edição e exclusão

- **Requisito:** RF31, RN21, RNF03
- **Pré-condição:** navegador limpo; dados de exemplo, como Carla Dias, participante; tela Eventos
- **Passos:** conferir a aba Próximos; abrir **Novo evento** e clicar em **Cadastrar evento** com tudo vazio; preencher, com o fim antes do início, e tentar de novo; corrigir e cadastrar; conferir quais eventos Carla pode editar; editar o local do evento novo; abrir o painel; voltar a Eventos, excluir o evento novo e abrir a aba Passados
- **Entrada:** "Prova de Metodologia"; tipo Prova; dia 14/11; das 19:00 às 18:00, depois às 20:40; local "Sala 12", depois "Laboratório 3"; disciplina Metodologia
- **Esperado:** nome, tipo e dia são cobrados; fim antes do início é recusado; o evento entra na lista com horário, local, disciplina e quanto falta, gravado com quem cadastrou; a participante edita o que cadastrou, mas não o dos outros; o evento aparece no painel; excluído, sai da lista; o que já passou fica em Passados
- **Observado:** Próximos com os cinco eventos futuros do exemplo, e o aviso de feriado no que cai em 15/11 (D17). Com tudo vazio: "Dê um nome ao evento.", "Escolha o tipo do evento." e "Escolha o dia do evento.". Com 19:00 às 18:00: "O fim precisa ser depois do início.". Cadastrado, o cartão mostrou "19:00 às 20:40", "Sala 12", Metodologia e "Em 3 dias", e o evento foi gravado com Carla como autora. Carla tem o menu de ações na reunião que ela cadastrou e não tem na palestra cadastrada pela Ana. O local editado apareceu no cartão; o painel listou a reunião e a prova nova em "Próximos eventos". Excluído, o evento saiu da lista, e a "Prova de Estatística", de seis dias antes, apareceu em Passados. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT51a.png](../testes/evidencias-11-11/CT51a.png) (formulário), [CT51b.png](../testes/evidencias-11-11/CT51b.png) (eventos)

### CT52: Eventos no calendário: no dia, no painel do dia e cadastrados a partir do dia escolhido

- **Requisito:** RF23, RF31
- **Pré-condição:** navegador limpo; dados de exemplo, como Ana Souza; tela Calendário
- **Passos:** conferir o dia da palestra do exemplo; escolher esse dia e conferir o painel do dia; clicar em **Novo evento neste dia**, preencher nome e tipo e cadastrar; esconder e mostrar os eventos pela legenda; abrir as visões Semana e Lista
- **Entrada:** "Plantão de dúvidas", tipo Outro, sem horário
- **Esperado:** o evento aparece na célula do dia e no painel do dia, com horário e local; o cadastro já vem com o dia escolhido; sem horário, o evento vale o dia todo; a legenda esconde os eventos; a semana mostra a hora, e a lista do mês também traz os eventos
- **Observado:** a célula de 10/11 mostrou "Palestra" e anunciou "1 evento" para o leitor de tela; o painel do dia trouxe "Palestra: carreira em dados", às 19:30, no Auditório. O formulário abriu com o dia preenchido, e "Plantão de dúvidas" entrou no mesmo dia, como "O dia todo", gravado em 10/11/2026. O botão Eventos da legenda escondeu os eventos do calendário. Na semana, apareceu "19:30 Palestra"; na lista do mês, o evento ficou no grupo do seu dia. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT52a.png](../testes/evidencias-06-11/CT52a.png) (painel do dia), [CT52b.png](../testes/evidencias-06-11/CT52b.png) (semana)

### CT53: Seletor de espaço: o pessoal, os grupos, criar grupo e grupo de exemplo

- **Requisito:** RF01, RF34, RNF01
- **Pré-condição:** navegador limpo; demonstração começada com o nome, sem exemplos
- **Passos:** abrir o seletor de espaço; escolher **Carregar grupo de exemplo**; abrir o seletor de novo; numa tela de celular, abrir o menu do topo e o seletor
- **Entrada:** nenhuma
- **Esperado:** o espaço pessoal vem primeiro; sem grupo, o seletor explica e oferece criar grupo e carregar o exemplo; o exemplo abre com a pessoa no grupo, e o grupo passa a aparecer na lista; no celular, o seletor fica no menu do topo
- **Observado:** o seletor abriu com "Pessoal" em primeiro, "Você ainda não está em nenhum grupo." e os itens **Criar grupo** e **Carregar grupo de exemplo**. O exemplo abriu "Trio do TCC", que passou a aparecer na lista. No celular, o seletor ficou no menu do topo, com o grupo. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT53a.png](../testes/evidencias-11-11/CT53a.png) (computador), [CT53b.png](../testes/evidencias-11-11/CT53b.png) (celular)
### CT54: Página inicial com movimento: aparece ao rolar, segue o mouse, demonstra no hover e respeita "reduzir movimento"

- **Requisito:** RF26, RNF06
- **Pré-condição:** navegador limpo; página inicial
- **Passos:** esperar a entrada do topo; conferir a prévia do sistema; passar o mouse sobre a prévia; rolar até o cartão "Progresso por peso" e passar o mouse sobre ele. Num navegador com "reduzir movimento", abrir a página. Numa tela de celular com toque, rolar até o mesmo cartão
- **Entrada:** nenhuma
- **Esperado:** o topo entra animado; as barras da prévia enchem e os números contam até o valor; a prévia inclina acompanhando o mouse; os blocos aparecem ao rolar; o cartão demonstra o recurso com o mouse em cima (no celular, quando aparece na tela); com "reduzir movimento", nada se mexe e nada fica deslocado
- **Observado:** o título entrou animado; as três barras da prévia chegaram ao fim, com 50%, 72% e 35%; com o mouse à direita, a prévia inclinou para a direita. O cartão "Progresso por peso" estava escondido antes da rolagem e apareceu ao rolar; a barra da demonstração estava vazia e encheu com o mouse em cima. Com "reduzir movimento", o título não teve animação, a prévia não inclinou e os blocos de baixo não ficaram deslocados. No celular, a demonstração ligou quando o cartão apareceu na tela. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT54a.png](../testes/evidencias-06-11/CT54a.png)

### CT55: Textos sem travessão em nenhuma tela

- **Requisito:** RNF06
- **Pré-condição:** navegador limpo
- **Passos:** abrir, rolando até o fim, a página inicial, Sobre nós, a tela de acesso e um endereço inexistente; carregar os dados de exemplo e abrir Painel, Calendário, Eventos, Disciplinas, Atividades, Nova atividade, Membros, Conquistas, o detalhe de uma atividade e o de uma disciplina
- **Entrada:** nenhuma
- **Esperado:** nenhum texto da tela, título da página, rótulo para leitor de tela, dica ou exemplo de campo usa o travessão "—"
- **Observado:** nenhuma das catorze telas teve "—" no texto, no título, nos rótulos, nas dicas ou nos exemplos dos campos. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** registro da execução, em [`casos-de-teste-06-11.json`](../testes/registros/casos-de-teste-06-11.json)

### CT56: Feedback: seção na página inicial, link no topo e no rodapé, e item no menu da conta

- **Requisito:** RF32
- **Pré-condição:** navegador limpo; página inicial
- **Passos:** clicar em **Feedback** no menu do topo; conferir a seção, o botão e o rodapé; carregar os dados de exemplo e abrir o menu da conta; numa tela de celular, abrir o menu do sistema
- **Entrada:** nenhuma
- **Esperado:** o link do topo leva à seção, que explica o formulário e as perguntas; o botão, o rodapé, o menu da conta e o menu do celular abrem o formulário anônimo em outra aba
- **Observado:** o link levou à seção "Testou o Vértice? Conta pra gente.", com as três perguntas. O botão **Responder o formulário**, o link **Enviar feedback** do rodapé, o item **Enviar feedback** do menu da conta e o do menu do celular apontam para `https://forms.gle/QpAtRSGux4XKd67T6`, abrindo em outra aba; nenhum botão ficou como "em breve". Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT56a.png](../testes/evidencias-06-11/CT56a.png) (seção na página inicial), [CT56b.png](../testes/evidencias-06-11/CT56b.png) (menu da conta)


### CT57: Sem conta: a tela de acesso pede login ou demonstração

- **Requisito:** RF27, RF20, RNF03
- **Pré-condição:** navegador limpo; sistema com o banco configurado
- **Passos:** abrir a página inicial; abrir **Entrar**; clicar em **Entrar** sem preencher; entrar com um e-mail que não tem conta; abrir `/painel` direto pelo endereço
- **Entrada:** e-mail `ninguem@teste.com`, senha `errada1`
- **Esperado:** a página inicial mostra "Grupo por convite" sem o aviso "Em breve"; o acesso mostra o login, o botão do Google e o atalho da demonstração; o e-mail vazio é recusado no campo; a conta inexistente é recusada; a rota privada leva ao acesso
- **Observado:** a página inicial mostrou o cartão do convite sem "Em breve" e a pergunta "Dá para testar sem criar conta?". O acesso abriu com o título "Entre no Vértice", o botão **Continuar com o Google** e **Experimentar sem conta**. Sem e-mail, o campo mostrou "E-mail inválido."; com a conta inexistente, "E-mail ou senha incorretos.". O endereço `/painel` levou de volta a `/entrar`
- **Situação:** Aprovado
- **Evidência:** [CT57.png](../testes/evidencias-27-11/CT57.png)

### CT58: Criar conta e criar grupo: o grupo e o organizador vão para o banco

- **Requisito:** RF27, RF01, RF34, RN07
- **Pré-condição:** CT57
- **Passos:** escolher **Criar conta**, informar nome, e-mail e senha; no seletor de espaço, conferir as opções e criar o grupo; conferir as tabelas `grupo` e `membro` e o armazenamento do navegador
- **Entrada:** Ana Souza, `ana@teste.com`, senha `segredo1`; grupo "Turma da Conta"
- **Esperado:** depois de criar a conta, o sistema abre o espaço pessoal; o seletor oferece o código de convite e não oferece o grupo de exemplo; o grupo e a Ana, como organizadora ligada à conta, estão no banco; nada é gravado no navegador
- **Observado:** o painel abriu com "Pessoal" no seletor, que mostrou **Entrar com código de convite** e não mostrou **Carregar grupo de exemplo**. No banco: o grupo "Turma da Conta" e o membro Ana Souza, organizadora, ligado à conta `ana@teste.com`. A coleção `grupos` não existia no armazenamento do navegador
- **Situação:** Aprovado
- **Evidência:** [CT58a.png](../testes/evidencias-11-11/CT58a.png)
### CT59: Disciplina, atividade e conclusão vão para o banco e voltam depois de recarregar

- **Requisito:** RNF02, RF03, RF12, RF13, RF17, RN12, RN23
- **Pré-condição:** CT58
- **Passos:** cadastrar a disciplina Banco de Dados; cadastrar a atividade "Modelar o diagrama ER", com prazo em 3 dias e a Ana como responsável; abri-la pela lista e clicar em **Marcar como concluída**; conferir as tabelas; recarregar a lista de atividades; abrir a disciplina; acrescentar no banco um registro de progresso de 3 dias antes e recarregar
- **Entrada:** os dados acima
- **Esperado:** depois de criar, o sistema volta para a lista; a atividade fica concluída no banco, com a data de conclusão; o banco grava o progresso do dia (100%); a conquista "Primeiro Passo" fica gravada; depois de recarregar, a atividade continua lá; com um dia só, a evolução explica que a linha aparece depois; com dois dias, a linha aparece
- **Observado:** depois de criar, a lista de atividades. No banco, a atividade com status `concluido` e data de conclusão preenchida, o registro de progresso de 100% do dia e a conquista em `membro_conquista`. Depois de recarregar, a atividade apareceu na lista. A evolução mostrou "A linha da evolução aparece a partir do segundo dia de atividades nesta disciplina."; com o registro de 3 dias antes, mostrou a linha "de 0% para 100%"
- **Situação:** Aprovado
- **Evidência:** [CT59.png](../testes/evidencias-11-11/CT59.png)
### CT60: Convite: o organizador gera código e link

- **Requisito:** RF28, RN22
- **Pré-condição:** CT59
- **Passos:** em Membros, clicar em **Convidar**; conferir o código, o link e a tabela `convite`
- **Entrada:** nenhuma
- **Esperado:** código de 8 letras e números, sem I, O, 0 e 1; link `/convite/CODIGO`; convite gravado com validade de 7 dias
- **Observado:** a janela mostrou um código de 8 caracteres do alfabeto do sistema e o link com o mesmo código. No banco, o convite com o código e vencimento 7 dias depois
- **Situação:** Aprovado
- **Evidência:** [CT60.png](../testes/evidencias-27-11/CT60.png)

### CT61: Convite pelo link: quem não tem conta cria e cai direto no grupo

- **Requisito:** RF28, RF27, RN22, RN07
- **Pré-condição:** CT60; um segundo navegador, limpo
- **Passos:** abrir o link do convite; criar a conta do Bruno; conferir os membros no banco, a lista de atividades e a tela de membros
- **Entrada:** Bruno Lima, `bruno@teste.com`
- **Esperado:** o link leva ao login, com o aviso do convite; depois de criar a conta, o Bruno cai no painel do grupo, como participante; ele vê a atividade da Ana e não vê o botão **Convidar**
- **Observado:** o endereço virou `/entrar`, com "Entre para aceitar o convite do seu grupo.". Depois de criar a conta, o Bruno chegou ao painel do grupo. No banco, Ana Souza (organizadora) e Bruno Lima (participante). A lista mostrou "Modelar o diagrama ER", e Membros não mostrou **Convidar**
- **Situação:** Aprovado
- **Evidência:** [CT61.png](../testes/evidencias-11-11/CT61.png)

### CT62: Código digitado e código inválido

- **Requisito:** RF28, RN22, RNF03
- **Pré-condição:** CT61
- **Passos:** no seletor de espaço, **Entrar com código de convite**; digitar um código que não existe e confirmar; digitar o código válido em minúsculas e confirmar
- **Entrada:** `ABCD2345`; o código do CT60 em minúsculas
- **Esperado:** o código inexistente é recusado no campo; o válido abre o grupo sem criar outro membro
- **Observado:** "Código de convite inválido ou vencido." no campo. Com o código válido, a janela fechou com o Bruno no grupo, e o grupo continuou com 2 membros
- **Situação:** Aprovado
- **Evidência:** registro da execução, em [`casos-de-teste-11-11.json`](../testes/registros/casos-de-teste-11-11.json)
### CT63: O que um faz, o outro vê ao voltar para a aba

- **Requisito:** RNF02, RN01
- **Pré-condição:** CT62; a Ana e o Bruno com o sistema aberto, cada um no seu navegador
- **Passos:** o Bruno abre Disciplinas; a Ana cadastra a disciplina Engenharia de Software; a aba do Bruno volta a ficar visível
- **Entrada:** nenhuma
- **Esperado:** a disciplina nova aparece para o Bruno sem recarregar a página
- **Observado:** "Engenharia de Software" apareceu na lista do Bruno
- **Situação:** Aprovado
- **Evidência:** registro da execução

### CT64: Recusa do banco: alteração em algo que já não existe avisa e recarrega

- **Requisito:** RNF02, RNF11, RN20
- **Pré-condição:** CT63; a atividade passada para o Bruno e reaberta
- **Passos:** o Bruno abre a atividade; ela é excluída no banco; o Bruno, com a tela antiga, clica em **Marcar como concluída**
- **Entrada:** nenhuma
- **Esperado:** o banco não acha a linha, e a tela avisa e volta ao que está gravado
- **Observado:** o aviso "Não foi possível salvar" com "Você não tem permissão para essa alteração."; em seguida, a tela recarregou do banco, que não tinha mais a atividade
- **Situação:** Aprovado
- **Evidência:** [CT64.png](../testes/evidencias-11-11/CT64.png)

### CT65: Sair da conta e demonstração

- **Requisito:** RF09, RF20, RF27
- **Pré-condição:** CT64, no navegador da Ana
- **Passos:** abrir o menu da conta e **Sair da conta**; escolher **Experimentar sem conta**; clicar em **Entrar com conta** no aviso da demonstração; entrar com o e-mail e a senha da Ana; abrir o seletor de espaço
- **Entrada:** `ana@teste.com`, `segredo1`
- **Esperado:** o menu mostra o e-mail; sair volta ao login; a demonstração mostra o aviso e a opção dos dados de exemplo; entrar de novo abre o espaço pessoal, com o grupo da conta no seletor
- **Observado:** o menu mostrou `ana@teste.com`. Depois de sair, o login. Na demonstração, "Modo de demonstração." e **Começar com dados de exemplo**. Depois de entrar de novo, o painel, com "Turma da Conta" no seletor
- **Situação:** Aprovado
- **Evidência:** [CT65.png](../testes/evidencias-11-11/CT65.png)
### CT66: Foto de perfil vai para o Storage e o banco guarda o endereço

- **Requisito:** RF24, RF35, RN19, RN26, RNF11
- **Pré-condição:** CT65
- **Passos:** abrir **Meu perfil**, enviar uma foto, aplicar o enquadramento e salvar; conferir o banco e o armazenamento de arquivos; abrir o grupo e recarregar
- **Entrada:** imagem PNG de 640 × 480
- **Esperado:** a foto vai para o bucket `fotos`, na pasta do espaço pessoal, e o banco guarda só o endereço, o mesmo em todos os membros da Ana; a foto aparece pelo endereço depois de recarregar
- **Observado:** os membros da Ana nos dois espaços ficaram com o mesmo endereço, `.../storage/v1/object/public/fotos/<id do espaço pessoal>/perfil-<id da conta>-<data>.jpg`, com um arquivo no bucket, e a imagem de 256 pixels de largura carregada pelo endereço. Nenhum erro de página em todo o roteiro com conta (CT57 a CT66)
- **Situação:** Aprovado
- **Evidência:** [CT66.png](../testes/evidencias-11-11/CT66.png)
### CT67: Tutorial opcional: convite no painel, passos, atalho para a tela e menu da conta

- **Requisito:** RF33
- **Pré-condição:** navegador limpo; demonstração com os dados de exemplo
- **Passos:** no painel, clicar em **Ver tutorial**; avançar pelos sete passos; voltar um; clicar em **Abrir esta tela**; voltar ao painel; abrir **Tutorial** no menu da conta; em outro navegador, dispensar o convite
- **Entrada:** nenhuma
- **Esperado:** o convite aparece na primeira visita; os sete passos são Seu espaço e seus grupos, Painel, Disciplinas e conteúdos, Atividades, Calendário e eventos, Membros e Conquistas; o atalho leva à tela do passo; aberto ou dispensado, o convite não volta; o menu abre o tutorial de novo
- **Observado:** como esperado: o passo de Membros levou a `/membros`, e o convite não voltou nem depois de aberto, nem depois de dispensado. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT67a.png](../testes/evidencias-11-11/CT67a.png) (convite no painel), [CT67b.png](../testes/evidencias-11-11/CT67b.png) (último passo)
### CT68: Evolução do progresso na tela da disciplina, com a demonstração

- **Requisito:** RF12, RNF09
- **Pré-condição:** CT67
- **Passos:** abrir a disciplina Estatística; conferir a linha, a tabela para leitor de tela e o valor ao passar o mouse
- **Entrada:** nenhuma
- **Esperado:** a linha vai de 0% ao progresso atual, com um ponto por dia desde o cadastro das atividades; o valor aparece em número ao passar o mouse
- **Observado:** a linha "de 0% para 67%", 15 dias na tabela para leitor de tela e "67%" ao passar o mouse no fim da linha. Nenhum erro no console
- **Situação:** Aprovado
- **Evidência:** [CT68.png](../testes/evidencias-27-11/CT68.png)


### CT69: Conta nova cai no espaço pessoal, criado pelo banco com o perfil

- **Requisito:** RF34, RF35, RF27, RN24
- **Pré-condição:** navegador limpo; sistema com o banco configurado, zerado
- **Passos:** escolher **Criar conta**, informar nome, e-mail e senha; conferir o painel, o seletor de espaço e as seções; conferir as tabelas `perfil`, `grupo` e `membro`
- **Entrada:** Ana Souza, `ana@teste.com`, senha `segredo1`
- **Esperado:** depois de criar a conta, o sistema abre direto o painel do espaço pessoal, sem tela de escolha de grupo; o seletor mostra "Pessoal"; a seção Membros não aparece; o banco cria o espaço pessoal e o perfil, com o lembrete ligado e a pessoa como única integrante
- **Observado:** o endereço foi direto para `/painel`, com "Pessoal" no seletor e o convite "Seu espaço está pronto"; a barra de seções não trouxe Membros. No banco: o grupo com `pessoal` verdadeiro, o perfil "Ana Souza" com `lembrete_email` ligado e a Ana como organizadora do próprio espaço
- **Situação:** Aprovado
- **Evidência:** [CT69.png](../testes/evidencias-11-11/CT69.png)

### CT70: Atividade pessoal sem disciplina e volta para a lista depois de criar

- **Requisito:** RF03, RF34, RN24
- **Pré-condição:** CT69; lista de atividades do espaço pessoal
- **Passos:** clicar em **Nova atividade**; conferir os campos; preencher só o título e o prazo e criar
- **Entrada:** "Pagar a fatura do cartão"; prazo amanhã
- **Esperado:** no espaço pessoal, não há campo de responsável e a disciplina é opcional; a atividade é criada sem disciplina, com a dona do espaço como responsável; depois de criar, o sistema volta para a lista, com o aviso, e não abre o detalhe
- **Observado:** o formulário não teve o campo de responsável, e a disciplina mostrou "Opcional. Para separar por matéria, cadastre em Disciplinas.". Criada, a atividade levou de volta a `/atividades`, com o aviso "Atividade criada". No banco: sem disciplina, no espaço pessoal, com Ana Souza como responsável
- **Situação:** Aprovado
- **Evidência:** [CT70.png](../testes/evidencias-11-11/CT70.png)

### CT71: Criar grupo e convidar sem sair do sistema

- **Requisito:** RF01, RF28, RF34, RN07, RN26
- **Pré-condição:** CT70
- **Passos:** no seletor de espaço, **Criar grupo**; informar o nome e criar; cadastrar a disciplina Requisitos; em Membros, **Convidar**
- **Entrada:** grupo "Projeto de Software"
- **Esperado:** o grupo é criado e aberto sem passar por outra tela; quem cria entra como organizador, com o nome do perfil; o convite gera o código
- **Observado:** o seletor passou a mostrar "Projeto de Software"; no banco, a Ana Souza como única integrante, organizadora. O convite gerou um código de 8 letras e números
- **Situação:** Aprovado
- **Evidência:** [CT71.png](../testes/evidencias-11-11/CT71.png)

### CT72: Outra conta entra com o código pelo seletor e aparece com o nome do perfil

- **Requisito:** RF28, RF27, RN22, RN26
- **Pré-condição:** CT71; um segundo navegador, limpo
- **Passos:** criar a conta do Bruno; no seletor de espaço, **Entrar com código de convite**; digitar o código do CT71 e confirmar
- **Entrada:** Bruno Lima, `bruno@teste.com`; o código gerado no CT71
- **Esperado:** o Bruno entra no grupo sem sair do sistema, como participante, com o nome do perfil dele
- **Observado:** o painel abriu com "Projeto de Software" no seletor; no banco, o membro Bruno Lima, participante, ligado à conta `bruno@teste.com`
- **Situação:** Aprovado
- **Evidência:** [CT72.png](../testes/evidencias-11-11/CT72.png)

### CT73: Atividade "A definir": todos veem, alguém assume, e só então conclui

- **Requisito:** RF38, RN06, RN20
- **Pré-condição:** CT72, com a Ana e o Bruno no grupo
- **Passos:** como Ana, em Nova atividade, conferir o responsável e criar a atividade sem escolhê-lo; como Bruno, abrir a lista do grupo, conferir a linha e clicar em **Assumir**; abrir a lista do espaço pessoal do Bruno
- **Entrada:** "Levantar os requisitos"; Requisitos; prazo em 2 dias
- **Esperado:** o responsável começa em "A definir"; a atividade é gravada sem responsável e em "a fazer"; o participante vê **Assumir** e não consegue concluir antes; depois de assumir, ele é o responsável, pode concluir, e a atividade aparece no espaço pessoal dele, com o nome do grupo
- **Observado:** o campo do responsável abriu em "A definir"; no banco, `id_responsavel` vazio e status "a fazer". Na lista do Bruno, a linha mostrou **Assumir** e nenhum botão de concluir; depois de assumir, o banco gravou o Bruno como responsável e o círculo de concluir apareceu. No espaço pessoal do Bruno, a atividade apareceu como "Projeto de Software · Requisitos"
- **Situação:** Aprovado
- **Evidência:** [CT73a.png](../testes/evidencias-11-11/CT73a.png) (lista do Bruno, antes de assumir), [CT73b.png](../testes/evidencias-11-11/CT73b.png) (espaço pessoal do Bruno)

### CT74: Concluir por engano e desfazer: a conquista sai junto com a experiência

- **Requisito:** RF17, RN10, RN12
- **Pré-condição:** CT73, no espaço pessoal do Bruno
- **Passos:** concluir "Levantar os requisitos" pela lista; conferir as conquistas no banco; clicar em **Desfazer** no aviso
- **Entrada:** nenhuma
- **Esperado:** a conclusão concede as conquistas (Primeiro Passo e, como a disciplina só tem essa atividade, Disciplina Fechada); desfazer volta o status, retira as duas conquistas do banco e avisa a retirada de cada uma
- **Observado:** o banco gravou DISCIPLINA_FECHADA e PRIMEIRO_PASSO. Com **Desfazer**, o status voltou a "a fazer", `membro_conquista` ficou vazia, e apareceram os dois avisos de retirada, entre eles "Conquista retirada: Primeiro Passo"
- **Situação:** Aprovado
- **Evidência:** [CT74.png](../testes/evidencias-11-11/CT74.png)

### CT75: Detalhe da atividade: "Marcar como concluída" discreto e com Desfazer

- **Requisito:** RF05
- **Pré-condição:** CT74
- **Passos:** abrir o detalhe de "Levantar os requisitos" e conferir a ação de concluir
- **Entrada:** nenhuma
- **Esperado:** o botão diz o que faz ("Marcar como concluída") e tem a aparência de botão secundário; o antigo botão **Concluir** em destaque não existe mais
- **Observado:** o detalhe mostrou **Marcar como concluída**, com a aparência de botão secundário, e nenhum botão **Concluir**
- **Situação:** Aprovado
- **Evidência:** [CT75.png](../testes/evidencias-11-11/CT75.png)

### CT76: Perfil da conta: nome e foto mudam em todos os grupos

- **Requisito:** RF35, RF24, RN19, RN26
- **Pré-condição:** CT75
- **Passos:** como Ana, abrir **Meu perfil**, trocar o nome, enviar uma foto, aplicar e salvar; conferir o banco; como Bruno, abrir Membros do grupo
- **Entrada:** nome "Ana Souza Lima"; imagem PNG de 640 × 480
- **Esperado:** o perfil é gravado com o nome novo e a foto vai para a pasta do espaço pessoal; os dois membros da Ana (espaço pessoal e grupo) ficam com o mesmo nome e a mesma foto; o colega vê o nome novo
- **Observado:** o perfil ficou "Ana Souza Lima", com a foto em `.../fotos/<id do espaço pessoal>/perfil-...`. Os dois membros da Ana ficaram com o nome novo e o mesmo endereço de foto, e o Bruno viu "Ana Souza Lima" em Membros
- **Situação:** Aprovado
- **Evidência:** [CT76a.png](../testes/evidencias-11-11/CT76a.png) (Meu perfil), [CT76b.png](../testes/evidencias-11-11/CT76b.png) (membros, como Bruno)

### CT77: Evento de vários dias aparece em cada dia do calendário

- **Requisito:** RF31, RF23, RN21
- **Pré-condição:** CT76, no grupo
- **Passos:** em Eventos, **Novo evento**; ligar **Dura mais de um dia**; informar o último dia e os horários; cadastrar; abrir o calendário na visão de lista
- **Entrada:** "Semana de provas"; tipo Prova; do dia daqui a 3 dias ao dia daqui a 5; das 19:00 (no primeiro dia) às 10:00 (no último)
- **Esperado:** o evento é gravado com o último dia, e o fim antes do horário de início é aceito, porque vale para o último dia; o cartão mostra o período; o evento aparece em cada dia do período
- **Observado:** no banco, 2 dias entre o primeiro e o último e `hora_fim` 10:00. O cartão mostrou o período com "(3 dias)", e a lista do calendário mostrou o evento nos três dias
- **Situação:** Aprovado
- **Evidência:** [CT77.png](../testes/evidencias-11-11/CT77.png)

### CT78: Várias atividades de uma vez, com a lista colada e "Para todas"

- **Requisito:** RF37, RN06
- **Pré-condição:** CT77, no grupo
- **Passos:** abrir **Várias de uma vez**; **Colar uma lista** com três títulos e criar as linhas; na linha "Para todas as linhas", escolher a disciplina e o prazo; clicar em **Criar 3 atividades**
- **Entrada:** "- Diagrama de casos de uso", "- Protótipo das telas" e "- Plano de testes", um por linha; Requisitos; prazo daqui a 6 dias
- **Esperado:** cada título vira uma linha, sem o marcador; a escolha "Para todas" vale para as três; as três são criadas de uma vez, com o responsável "A definir", e o sistema volta para a lista
- **Observado:** as três linhas apareceram com os títulos limpos e receberam a disciplina e o prazo. Depois de criar, a lista; no banco, as três atividades, sem responsável e com o mesmo prazo
- **Situação:** Aprovado
- **Evidência:** [CT78a.png](../testes/evidencias-11-11/CT78a.png) (tabela preenchida)

### CT79: Trocar o responsável de várias atividades de uma vez

- **Requisito:** RF37, RN07
- **Pré-condição:** CT78, como Ana, a organizadora
- **Passos:** na lista, clicar em **Selecionar**; marcar duas das três atividades do CT78; escolher Bruno Lima na barra do pé da tela e clicar em **Trocar responsável**
- **Entrada:** Diagrama de casos de uso e Plano de testes; Bruno Lima
- **Esperado:** só as atividades marcadas passam para o Bruno; a outra continua "A definir"
- **Observado:** no banco, Diagrama de casos de uso e Plano de testes com Bruno Lima, e Protótipo das telas sem responsável
- **Situação:** Aprovado
- **Evidência:** [CT79a.png](../testes/evidencias-11-11/CT79a.png) (seleção e barra do pé)

### CT80: Lembrete por e-mail: sai para quem tem atividade perto do prazo e respeita quem desligou

- **Requisito:** RF36, RN25
- **Pré-condição:** CT79; envio do Brevo simulado no banco local (a chamada é gravada, e não enviada)
- **Passos:** como Bruno, desligar o lembrete em **Meu perfil** e salvar; rodar o envio do dia (`enviar_lembretes`); conferir os e-mails montados; rodar o envio de novo
- **Entrada:** remetente `vertice@exemplo.com`
- **Esperado:** o Bruno, que desligou, não recebe; a Ana, que tem atividade pessoal vencendo amanhã, recebe um e-mail; o assunto diz quantas atividades; no mesmo dia, o envio não repete
- **Observado:** o perfil do Bruno ficou com o lembrete desligado. O envio montou 1 e-mail, para `ana@teste.com`, com o assunto "Vértice: 1 atividade perto do prazo". Rodado de novo, montou 0
- **Situação:** Aprovado
- **Evidência:** registro da execução, em [`casos-de-teste-11-11.json`](../testes/registros/casos-de-teste-11-11.json)

### CT81: Demonstração: o nome cria o espaço pessoal; com exemplos, entra o grupo pronto

- **Requisito:** RF20, RF34, RNF03
- **Pré-condição:** navegador limpo; sistema sem o banco configurado; tela de largura 1920
- **Passos:** abrir o acesso; clicar em **Começar** sem nome; informar o nome e clicar em **Começar com dados de exemplo**; conferir o painel e os dados do navegador
- **Entrada:** Carla Dias
- **Esperado:** o acesso pergunta o nome e o cobra; com os exemplos, a pessoa ganha o espaço pessoal e o grupo de exemplo, em que entra como organizadora; o painel pessoal mostra os grupos
- **Observado:** "Como podemos te chamar?"; sem nome, "Informe o seu nome.". Com o nome, o painel saudou Carla; no navegador, os grupos "Pessoal" (pessoal) e "Trio do TCC", com Carla Dias como organizadora dos dois; o painel trouxe a seção "Seus grupos"
- **Situação:** Aprovado
- **Evidência:** [CT81a.png](../testes/evidencias-11-11/CT81a.png) (nome), [CT81b.png](../testes/evidencias-11-11/CT81b.png) (painel pessoal)

### CT82: Calendário: barra de filtros com o que aparece, disciplina e "só as minhas"

- **Requisito:** RF23
- **Pré-condição:** CT81, no grupo de exemplo; calendário na visão de lista
- **Passos:** desligar **Atividades**; ligar de novo; escolher a disciplina TCC; **Limpar filtros**; ligar **Só as minhas atividades**; **Limpar filtros**
- **Entrada:** disciplina TCC
- **Esperado:** sem atividades, ficam só os eventos; a disciplina escolhida deixa só as entregas dela; "Só as minhas" reduz a lista; a barra resume o que aparece; limpar volta tudo
- **Observado:** com tudo ligado, 15 entregas, e o resumo "15 entregas e 5 eventos em novembro". Sem Atividades, só os eventos; com TCC, só entregas de TCC; com "Só as minhas", menos entregas; **Limpar filtros** voltou às 15
- **Situação:** Aprovado
- **Evidência:** [CT82.png](../testes/evidencias-11-11/CT82.png)

### CT83: Eventos: filtro por disciplina e evento de vários dias

- **Requisito:** RF31, RN21
- **Pré-condição:** CT82; tela Eventos
- **Passos:** escolher a disciplina Banco de Dados no filtro; voltar a todas; conferir o cartão da "Semana acadêmica"
- **Entrada:** disciplina Banco de Dados
- **Esperado:** o filtro deixa só os eventos da disciplina; "Todas as disciplinas" traz todos de volta; o evento de vários dias mostra o período
- **Observado:** com Banco de Dados, só "Prova de Banco de Dados"; com todas, os 5 eventos de novo; a "Semana acadêmica" mostrou o período com "(3 dias)"
- **Situação:** Aprovado
- **Evidência:** [CT83.png](../testes/evidencias-11-11/CT83.png)

### CT84: Telas mais largas no computador, sem rolagem lateral no celular

- **Requisito:** RNF01
- **Pré-condição:** CT83; tela de 1920 × 1080
- **Passos:** abrir Atividades e medir a largura do conteúdo; numa tela de celular, abrir Painel, Atividades, Calendário, Várias de uma vez e Meu perfil
- **Entrada:** nenhuma
- **Esperado:** no computador, o conteúdo ocupa mais da tela (até 1680 px); no celular, nenhuma tela rola para os lados
- **Observado:** o conteúdo ficou com 1680 px, contra 1240 px antes da revisão; no celular, nenhuma das cinco telas rolou para os lados
- **Situação:** Aprovado
- **Evidência:** [CT84a.png](../testes/evidencias-11-11/CT84a.png) (computador), [CT84b.png](../testes/evidencias-11-11/CT84b.png) (celular)

### CT85: Dados antigos da demonstração continuam, com o grupo na atividade e a pessoa marcada

- **Requisito:** RNF02, RF34, RN24
- **Pré-condição:** navegador com dados da demonstração da versão anterior (versão 3): um grupo com Davi e Eva, uma atividade do Davi e a sessão aberta como Davi
- **Passos:** abrir o sistema; conferir os dados do navegador; confirmar o nome; abrir o painel pessoal
- **Entrada:** nenhuma
- **Esperado:** os dados passam para a versão 4: a atividade ganha o grupo, e o Davi fica marcado como a pessoa da demonstração; o sistema pede o nome, já preenchido, e cria o espaço pessoal; a atividade antiga do Davi aparece no espaço pessoal, com o nome do grupo (D15)
- **Observado:** versão 4, com o grupo na atividade e o Davi marcado. O campo do nome veio com "Davi"; ao começar, o painel pessoal mostrou "Lista 1", com "Grupo antigo"
- **Situação:** Aprovado
- **Evidência:** [CT85.png](../testes/evidencias-11-11/CT85.png)
---

## O que não foi testado nesta entrega

| Item | Motivo |
|---|---|
| Login com a conta Google | Depende do Google e do projeto real do Supabase, que o ambiente de teste não acessa. A conferência é feita no sistema publicado |
| Envio real do lembrete pelo Brevo | O CT80 conferiu quem recebe, o assunto e a não repetição com a chamada ao Brevo simulada. O envio de verdade depende da conta no Brevo e da chave no Supabase, e a conferência de um e-mail recebido está nas [pendências](16-defeitos-e-pendencias.md#pendências) |
| Projeto real do Supabase | Os casos com conta usaram o PostgreSQL local, com o mesmo script de criação, e um servidor de teste no lugar das chamadas do Supabase. A conferência no sistema publicado (criar conta, convite entre duas contas e foto) está nas [pendências](16-defeitos-e-pendencias.md#pendências) |
| BrasilAPI e Nager.Date reais | O ambiente de teste não acessa a internet; as respostas foram simuladas no formato de cada serviço. A conferência com os serviços reais é feita na versão publicada na Vercel |
| RNF05: Firefox e Edge | Executado apenas no Chromium; a execução no Firefox e no Edge é a tarefa T51, até 26/11 |
| Arrastar a foto com o mouse ou o dedo e o gesto de pinça no editor de foto | O roteiro moveu a foto pelo teclado e mudou o zoom pelo controle deslizante, que usam o mesmo cálculo de enquadramento. O arraste com o mouse foi conferido só durante o desenvolvimento, e a pinça precisa de um celular de verdade |

---

## Ciclo de 08/11

Os casos CT01 a CT68 foram executados em 08/11/2026, das 13h56 às 14h02, sobre a versão com o banco de dados, antes da revisão de 11/11, e os 68 foram aprovados. As evidências estão em [`testes/evidencias-27-11/`](../testes/evidencias-27-11/) e o registro em [`casos-de-teste-27-11.json`](../testes/registros/casos-de-teste-27-11.json).

| Situação | Casos |
|---|---|
| Aprovado | 68 |
| Reprovado | 0 |
| **Total executado** | **68** |

---

## Ciclo de 06/11

Os casos CT01 a CT56 foram executados em 06/11/2026, das 14h41 às 14h46, sobre a versão marcada pela tag `entrega-06-11-2026`, e os 56 foram aprovados. As evidências estão em [`testes/evidencias-06-11/`](../testes/evidencias-06-11/) e o registro em [`casos-de-teste-06-11.json`](../testes/registros/casos-de-teste-06-11.json).

| Situação | Casos |
|---|---|
| Aprovado | 56 |
| Reprovado | 0 |
| **Total executado** | **56** |

---

## Rodada de 01/11

Antes da revisão de 03/11, os casos CT01 a CT47 foram executados em 01/11/2026, das 22h59 às 23h03, sobre a versão anterior do código (a que a tag `entrega-06-11-2026` marcava até então, no commit `3770bf7`), e os 47 foram aprovados. O registro daquela rodada está no histórico do repositório; os casos foram executados de novo em 06/11, e as evidências e o registro foram substituídos pelos daquela data.

| Situação | Casos |
|---|---|
| Aprovado | 47 |
| Reprovado | 0 |
| **Total executado** | **47** |

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
| CT26: Primeiro membro do grupo cadastrado como participante | [D01](16-defeitos-e-pendencias.md#d01) | CT31 (aprovado) |
| CT27: Falha de gravação no armazenamento do navegador | [D02](16-defeitos-e-pendencias.md#d02) | CT32 (aprovado) |
| CT29: Filtro por disciplina na lista de atividades | [D07](16-defeitos-e-pendencias.md#d07) | CT13 (aprovado) |

---

### Navegação

[⬅ Anterior: Produto Mínimo Viável](14-mvp.md) · [Índice](../README.md) · [Próximo: Defeitos e Pendências ➡](16-defeitos-e-pendencias.md)
