<div align="center">

# VÉRTICE

### Plataforma de Acompanhamento de Aprendizagem

`Imersão Profissional: Projeto de Software` · `ADSIS4S` · `Equipe 7`

</div>

---

## Sobre o projeto

O Vértice é uma plataforma web para grupos de estudo organizarem suas disciplinas, conteúdos e atividades em um único ambiente e acompanharem, de forma visual, o quanto já avançaram.

**O problema.** Estudantes acompanham várias disciplinas ao mesmo tempo e organizam esse trabalho de forma dispersa: conversas, cadernos, planilhas improvisadas. Isso custa prazos e responsabilidades perdidas, mas o problema maior é outro: o estudante vê o que falta fazer e não vê o quanto já avançou. Uma lista de tarefas informa que restam cinco itens; ela não informa que ele já cobriu 70% de uma disciplina e quase nada de outra.

**O objetivo.** Desenvolver uma plataforma web que permita a grupos de estudo organizarem suas atividades acadêmicas e acompanharem visualmente a evolução do progresso em cada disciplina e conteúdo.

**A solução.** Cada atividade pertence a uma disciplina e, se o grupo quiser separar a disciplina por assunto, a um conteúdo dela. Concluir uma atividade alimenta o percentual de progresso da disciplina (e do conteúdo, quando houver), credita experiência ao responsável, alimenta a ofensiva de dias consecutivos e pode desbloquear conquistas. O registro de execução vira medida de aprendizagem.

---

## Equipe

| Integrante | GitHub |
|---|---|
| Andrey Fogaça | [@dedeyfogaca](https://github.com/dedeyfogaca) |
| Matheus Saraiva Faustin | [@MatheusSaraiv-a](https://github.com/MatheusSaraiv-a) |

Repositório: [github.com/dedeyfogaca/equipe7-vertice](https://github.com/dedeyfogaca/equipe7-vertice)

Sistema publicado: **[equipe7-vertice.vercel.app](https://equipe7-vertice.vercel.app/)**

Instagram: [@go.vertice](https://www.instagram.com/go.vertice/)

---

## Entrega de 27/11/2026

Versão avaliada: tag **`entrega-27-11-2026`**.

| O que o manual pede | Onde está |
|---|---|
| Software funcionando | [equipe7-vertice.vercel.app](https://equipe7-vertice.vercel.app/), o código em [`src/`](src/) e [Como rodar](#como-rodar) |
| Revisão e alterações desde a entrega de 06/11 | [Histórico de Alterações, revisão de 08/11](docs/09-historico-de-alteracoes.md#2º-bimestre-revisão-de-08112026) |
| O que entrou e o que será demonstrado | [MVP: recorte da entrega de 27/11](docs/14-mvp.md#recorte-da-entrega-de-27112026) |
| Banco de dados | [Modelo lógico](banco-de-dados/02-modelo-logico.md), [script de criação](banco-de-dados/04-script-criacao.sql) e [verificações do banco](banco-de-dados/05-verificacoes.sql) |
| Arquitetura com o banco e o login | [Arquitetura e Tecnologias](docs/13-arquitetura.md) |
| Backlog com a situação final das tarefas | [Backlog do Projeto](docs/12-backlog.md) |
| Testes executados, resultados e evidências | [Casos de Teste](docs/15-casos-de-teste.md) e [`testes/evidencias-27-11/`](testes/evidencias-27-11/) |
| Defeitos e pendências | [Defeitos e Pendências](docs/16-defeitos-e-pendencias.md) |
| Rastreabilidade até o código e os testes | [Matriz de Rastreabilidade](docs/11-matriz-de-rastreabilidade.md#implementação-e-testes) |
| Telas novas e mapa de navegação | [Telas e Navegação](prototipos/01-telas-e-navegacao.md#entrega-final-27112026) |

**Resumo:** o Vértice ficou completo. Os dados do grupo passaram do navegador para um banco PostgreSQL no Supabase, em que as próprias regras do banco garantem que cada conta só veja os grupos de que participa e só altere o que o perfil permite. A pessoa entra com e-mail e senha ou com a conta Google, o organizador chama a turma por um link ou um código de convite, as fotos vão para o armazenamento de arquivos e a tela da disciplina mostra a evolução do progresso dia a dia. Quem só quer conhecer o sistema usa o modo de demonstração, sem conta, que ganhou um tutorial opcional. Os 33 requisitos funcionais estão implementados. Foram executados 68 casos de teste em 08/11/2026, todos aprovados, além de 240 verificações das regras em JavaScript e 40 verificações do banco em SQL; os três defeitos encontrados (D11 a D13) foram corrigidos antes da execução final.

### Entrega de 06/11/2026

Versão avaliada: tag **`entrega-06-11-2026`**. O sistema funcionando no navegador, com tudo o que não dependia do banco de dados.

| O que o manual pedia | Onde está |
|---|---|
| Identificação da equipe, projeto e repositório | [Equipe](#equipe) e [Identificação do Projeto](docs/01-identificacao-do-projeto.md) |
| Revisão e alterações desde a entrega de 20/10 | Histórico de Alterações, revisões de [28/10](docs/09-historico-de-alteracoes.md#2º-bimestre-revisão-de-28102026) de [29/10](docs/09-historico-de-alteracoes.md#2º-bimestre-revisão-de-29102026), de [01/11](docs/09-historico-de-alteracoes.md#2º-bimestre-revisão-de-01112026) e de [03/11](docs/09-historico-de-alteracoes.md#2º-bimestre-revisão-de-03112026) |
| Escopo e recorte desta entrega | [MVP: recorte da entrega de 06/11](docs/14-mvp.md#recorte-da-entrega-de-06112026) |
| Tecnologias e arquitetura atualizadas | [Arquitetura e Tecnologias](docs/13-arquitetura.md) |
| Backlog com prioridades, responsáveis, prazos e situação | [Backlog do Projeto](docs/12-backlog.md) |
| Código integrado, instruções para executar e sistema publicado | [`src/`](src/), [Como rodar](#como-rodar) e [equipe7-vertice.vercel.app](https://equipe7-vertice.vercel.app/) |
| Casos de teste executados, resultados e evidências | [Casos de Teste](docs/15-casos-de-teste.md) e [`testes/evidencias-06-11/`](testes/evidencias-06-11/) |
| Defeitos corrigidos e pendências para 27/11 | [Defeitos e Pendências](docs/16-defeitos-e-pendencias.md) |
| Rastreabilidade até o código e os testes | [Matriz de Rastreabilidade: implementação e testes](docs/11-matriz-de-rastreabilidade.md#implementação-e-testes) |
| Telas da versão 2 e mapa de navegação | [Telas e Navegação](prototipos/01-telas-e-navegacao.md) |

**Resumo:** o sistema roda do início ao fim no navegador, com tudo o que não depende do banco de dados, e está publicado na Vercel. Entraram a ofensiva, as conquistas, o painel de desempenho, a nova identidade visual, os pedidos da professora depois de 20/10 (responsável obrigatório, calendário nas cores das disciplinas, paleta de cores e foto de perfil) e os ajustes que a equipe pediu ao revisar a versão: tema claro em todas as telas, editor de foto, foto do grupo, conteúdo criado sem sair da atividade, só o responsável concluindo a atividade, a marca nova e as seções no topo. Na revisão de 03/11 entraram os eventos do grupo (provas, palestras, reuniões) também no calendário, o conteúdo opcional, os avatares em dois estilos, a página inicial com movimento, a tela de acesso em duas colunas, os textos sem travessão e o formulário de feedback dos usuários de teste. Foram executados 56 casos de teste em 06/11/2026, todos aprovados, e os defeitos encontrados (D01 a D07 em 20/10, D08 a D10 neste ciclo) estão corrigidos. Para 27/11 ficam o banco de dados, o acesso com conta Google ou e-mail, o convite para o grupo e o histórico de progresso.

### Entrega de 20/10/2026

Versão avaliada: tag **`entrega-20-10-2026`**. O MVP construído, com 29 casos de teste executados sobre o commit `c29279b`: 26 aprovados e 3 reprovados, que viraram os defeitos D01, D02 e D07. O registro completo está na própria tag, e o resumo, no [documento de testes](docs/15-casos-de-teste.md#ciclo-de-2010).

---

## Funcionalidades disponíveis

- Página inicial com movimento ao rolar e ao passar o mouse, seção de feedback dos usuários de teste e página Sobre nós, com a história da equipe
- Seções do sistema numa barra no topo, que no celular vira um menu que desce do topo
- Login com e-mail e senha ou com a conta Google, e um modo de demonstração sem conta, com tutorial opcional
- Dados do grupo num banco PostgreSQL no Supabase, iguais para todos os integrantes e em qualquer aparelho, com as regras de acesso garantidas pelo próprio banco
- Convite para o grupo por link ou por código, gerado pelo organizador
- Criação e seleção de grupos de estudo, numa tela de acesso em duas colunas, com foto do grupo opcional: quem cria entra como organizador
- Cadastro de membros com perfis de permissão e foto de perfil, enquadrada num editor, ou avatar sorteado, em dois estilos para escolher; ao remover um membro, o organizador escolhe quem assume as atividades dele
- Cadastro de disciplinas, com cor escolhida numa paleta de 18 cores, e, se o grupo quiser, de conteúdos que separam a disciplina por assunto
- Cadastro de atividades com disciplina, conteúdo opcional, prazo, peso, prioridade, status e responsável obrigatório; o conteúdo pode ser criado sem sair do formulário, e só o responsável muda o status da atividade
- Eventos do grupo (prova, apresentação, palestra, reunião), com página própria de próximos e passados, no painel e no calendário
- Lista com busca, filtros por situação, disciplina, responsável e prazo, e ordenação, com a cor de cada disciplina e a foto de cada responsável
- Painel com totais por situação, atividades atrasadas, próximas entregas, próximos eventos, progresso por disciplina e próximos feriados
- Calendário do mês, da semana ou em lista, com as entregas nas cores das disciplinas e os eventos, troca de mês animada (também deslizando o dedo) e criação de atividade ou de evento a partir de um dia
- Barra de progresso por conteúdo e por disciplina, calculada a partir do peso das atividades concluídas, e a evolução do progresso dia a dia na tela da disciplina
- Experiência, ofensiva de dias seguidos, seis conquistas e ranking do grupo
- Sinalização de prazos em fim de semana e em feriado nacional
- Tema claro e escuro em todas as telas, dados de exemplo e uso no celular

---

## Tecnologias

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Interface | React 18 com Vite | Stack que a equipe já domina; o Vite dá build rápido e configuração mínima |
| Roteamento | React Router 7 | Rotas públicas, privadas e dinâmicas sem biblioteca adicional |
| Estilo | Tailwind CSS 4 | Classes no próprio componente e os tokens de cor dos temas claro e escuro num arquivo só |
| Componentes | Radix UI, Lucide e Sonner | Diálogos, menus e dicas acessíveis por teclado e leitor de tela; ícones e avisos com o mesmo desenho em todas as telas |
| Tipografia | Inter Tight e JetBrains Mono, servidas junto com o sistema | Visual mais profissional, sem depender do Google Fonts |
| Estado | Context API | Suficiente para o volume de dados do projeto, sem dependência externa |
| Banco de dados | PostgreSQL no Supabase | Recebe o modelo lógico como está e garante as regras de acesso no próprio banco |
| Login e fotos | Supabase Auth e Storage | E-mail e senha ou conta Google, e as fotos num armazenamento de arquivos, sem servidor próprio |
| Demonstração | Armazenamento do navegador, com a mesma estrutura do banco | Permite conhecer o sistema sem criar conta |
| Hospedagem | Vercel | Publicação gratuita do site, refeita a cada atualização no GitHub |
| Integração | BrasilAPI | Fonte pública e gratuita para os feriados nacionais |
| Integração | Nager.Date | Fonte reserva de feriados, acionada quando a BrasilAPI falha ou demora |
| Avatares | DiceBear, como biblioteca | Avatares em dois estilos (Croodles Neutral e Notionists), desenhados no próprio navegador a partir de uma semente, sem depender de serviço externo |

---

## Estrutura do repositório

```
.
├── docs/               Documento de Visão e Requisitos, casos de uso e rastreabilidade
├── diagramas/          Casos de uso, classes e fluxos de processo
│   └── png/            Versões em imagem dos diagramas
├── banco-de-dados/     Modelos, dicionário, script do banco (PostgreSQL) e verificações
├── prototipos/         Mapa de navegação, telas e protótipo navegável
│   ├── telas-v2/       As telas da versão 2, nos dois temas e no celular
│   ├── telas/          As oito telas do protótipo do MVP em imagem
│   └── navegavel/      Protótipo clicável do MVP: abra o index.html no navegador
├── testes/             Evidências e registros da execução dos testes
│   ├── evidencias-27-11/  Capturas de tela do ciclo de 27/11, por caso de teste
│   ├── evidencias-06-11/  Capturas de tela do ciclo de 06/11
│   ├── evidencias/     Capturas de tela do ciclo de 20/10
│   └── registros/      Saída do npm run verificar, do build e da execução dos casos
└── src/                Código-fonte da aplicação
```

---

## Documentação

### Documento de Visão e Requisitos

| # | Documento | Conteúdo |
|---|---|---|
| 01 | [Identificação do Projeto](docs/01-identificacao-do-projeto.md) | Dados da equipe e descrição geral do sistema |
| 02 | [Contexto e Problema](docs/02-contexto-e-problema.md) | Situação atual, problema, quem enfrenta e justificativa |
| 03 | [Objetivos](docs/03-objetivos.md) | Objetivo geral e objetivos específicos |
| 04 | [Público-Alvo e Perfis do Usuário](docs/04-publico-alvo-e-perfis-do-usuario.md) | Estudante organizador e estudante participante |
| 05 | [Escopo](docs/05-escopo.md) | Incluído, não incluído e restrições |
| 06 | [Requisitos Funcionais](docs/06-requisitos-funcionais.md) | RF01 a RF33 |
| 07 | [Requisitos Não Funcionais](docs/07-requisitos-nao-funcionais.md) | RNF01 a RNF11 |
| 08 | [Regras de Negócio](docs/08-regras-de-negocio.md) | RN01 a RN23 |
| 09 | [Histórico de Alterações](docs/09-historico-de-alteracoes.md) | Mudanças desde a Entrega 1, com data, motivo e impacto |
| 10 | [Especificação dos Casos de Uso](docs/10-casos-de-uso.md) | UC01, UC02, UC03, UC05, UC07, UC08, UC09, UC12, UC13, UC14, UC15 e UC16 detalhados |
| 11 | [Matriz de Rastreabilidade](docs/11-matriz-de-rastreabilidade.md) | Requisito → caso de uso → entidades → tela → MVP → código → teste |
| 12 | [Backlog do Projeto](docs/12-backlog.md) | 77 tarefas com requisito, prioridade, responsável, prazo, situação e critérios de conclusão |
| 13 | [Arquitetura e Tecnologias](docs/13-arquitetura.md) | Camadas, banco e login no Supabase, serviços externos, ambiente e organização das pastas |
| 14 | [Produto Mínimo Viável](docs/14-mvp.md) | Classificação dos requisitos, o fluxo completo e os recortes de 20/10, 06/11 e 27/11 |
| 15 | [Casos de Teste](docs/15-casos-de-teste.md) | 68 casos executados em 08/11, com resultado e evidência, e o resumo dos ciclos anteriores |
| 16 | [Defeitos e Pendências](docs/16-defeitos-e-pendencias.md) | Defeitos encontrados nos testes e pendências |

### Modelagem do software

| Diagrama | Conteúdo |
|---|---|
| [Identidade visual](diagramas/00-identidade-visual.md) | Paleta, tipografia e vocabulário de formas usados nos diagramas |
| [Casos de uso](diagramas/01-casos-de-uso.md) | Atores, fronteira do sistema e os dezesseis casos de uso |
| [Classes](diagramas/02-classes.md) | Dez classes com atributos, operações e cardinalidades |
| [Fluxo: Concluir atividade](diagramas/03-atividade-concluir.md) | Recálculo de progresso, experiência, ofensiva e conquistas |
| [Fluxo: Cadastrar atividade](diagramas/04-atividade-cadastrar.md) | Disciplina obrigatória, conteúdo opcional, validações e padrões |
| [Arquitetura](diagramas/svg/arquitetura.svg) | Camadas da aplicação, Supabase, demonstração e serviços externos |
| [Mapa de navegação](diagramas/svg/mapa-navegacao-v2.svg) | Como as telas da versão final se conectam |
| [Mapa de navegação do MVP](diagramas/svg/mapa-navegacao.svg) | Como as oito telas do protótipo do MVP se conectam |

### Modelagem do banco de dados

| Documento | Conteúdo |
|---|---|
| [Modelo conceitual](banco-de-dados/01-modelo-conceitual.md) | Entidades, atributos, relacionamentos e cardinalidades |
| [Modelo lógico](banco-de-dados/02-modelo-logico.md) | Tabelas, chaves primárias e estrangeiras, tipos e restrições |
| [Dicionário de dados](banco-de-dados/03-dicionario-de-dados.md) | Descrição campo a campo das dez tabelas |
| [Script de criação](banco-de-dados/04-script-criacao.sql) | PostgreSQL do Supabase: tabelas, regras de acesso por linha, gatilhos, convite, conquistas e o espaço das fotos |
| [Verificações do banco](banco-de-dados/05-verificacoes.sql) | 40 conferências das regras do banco, tentando o acesso como contas diferentes |
| [Apoio para teste local](banco-de-dados/06-apoio-teste-local.sql) | Imita o que o Supabase já tem, para rodar as verificações num PostgreSQL local |

---

## MVP

A primeira versão funcional entrega o ciclo completo de medição de aprendizagem: **entrar no grupo, montar a estrutura de disciplinas e conteúdos, cadastrar atividades com peso, concluí-las e ver o progresso subir**, com a experiência creditada a quem concluiu.

| | Requisitos | O que entrega |
|---|---|---|
| **No MVP** | RF01 a RF06, RF08, RF09, RF10, RF11, RF13, RF14, RF15, RF19, RF20 | O ciclo fechado, do cadastro à medida, nos temas claro e escuro |
| **Desejável** | RF07, RF12, RF16 a RF18, RF21 a RF32 e o banco de dados | Ofensiva, conquistas, histórico, sinalização de datas, calendário, fotos de perfil e do grupo, paleta, páginas públicas, acesso com conta, convite, conteúdo criado pela atividade, eventos e feedback |
| **Futura** | Nenhum | Notificações, exportação e app nativo |

A classificação completa, com justificativa item a item, está em [Produto Mínimo Viável](docs/14-mvp.md). O protótipo navegável em [`prototipos/navegavel/`](prototipos/navegavel/index.html) cobre exatamente as telas do MVP; as telas da versão 2 estão em [Telas e Navegação](prototipos/01-telas-e-navegacao.md).

---

## Organização do projeto

| Onde | O que está lá |
|---|---|
| `docs/` | Documento de Visão e Requisitos completo: contexto, requisitos, regras, casos de uso, rastreabilidade, backlog, arquitetura e MVP |
| `diagramas/` | Casos de uso, classes, fluxos de atividade, arquitetura e mapa de navegação, em Mermaid dentro do `.md` ou em SVG na pasta `svg/` |
| `banco-de-dados/` | Modelo conceitual, modelo lógico, dicionário de dados, o script de criação no PostgreSQL e as verificações do banco |
| `prototipos/` | Levantamento de telas, mapas de navegação, as telas da versão final e da versão 2, as oito telas do MVP e o protótipo clicável |
| `testes/` | Evidências da execução dos casos de teste e registros das verificações automatizadas |
| `src/` | Código-fonte da aplicação React |

---

## Como rodar

Para usar sem instalar nada, abra a versão publicada: **[equipe7-vertice.vercel.app](https://equipe7-vertice.vercel.app/)**.

Para rodar na própria máquina: Node.js 20 ou superior e npm. Executado e testado com Node.js 22.23 e npm 10.9.

```bash
git clone https://github.com/dedeyfogaca/equipe7-vertice.git
cd equipe7-vertice/src
npm ci          # instala exatamente as versões do package-lock.json
npm run dev     # roda em desenvolvimento
```

O terminal exibirá o endereço local, normalmente `http://localhost:5173`. Sem o banco configurado, o sistema abre no modo de demonstração: use **"Carregar dados de exemplo"** para entrar com um grupo de dados fictícios já preenchido.

```bash
npm run verificar  # confere as regras de progresso, experiência, ofensiva, conquistas, perfis, atividades, permissões, recorte da foto e migração
npm run build      # gera a versão de produção
npm run preview    # pré-visualiza a versão de produção
```

Para usar com conta, crie um projeto no Supabase, rode [`banco-de-dados/04-script-criacao.sql`](banco-de-dados/04-script-criacao.sql) no SQL Editor e preencha `src/.env` a partir de `src/.env.example`, com a URL e a chave pública do projeto. O passo a passo, com o login do Google, está no [README de `src/`](src/README.md#ligar-o-banco-supabase). Versões das bibliotecas e organização das pastas estão em [Arquitetura e Tecnologias](docs/13-arquitetura.md#ambiente-de-desenvolvimento), e os detalhes do código no [README de `src/`](src/README.md).

---

## Pendências e próximos passos

| Até | O quê |
|---|---|
| 20/11/2026 | Ler as respostas do formulário de feedback dos usuários de teste |
| 24/11/2026 | Conferir no sistema publicado o login com o Google, o convite entre duas contas, uma foto enviada e os feriados reais da BrasilAPI |
| 24/11/2026 | Conferir num celular de verdade o arraste e o gesto de pinça do editor de foto |
| 26/11/2026 | Executar os casos de teste no Firefox e no Edge (RNF05) |
| 27/11/2026 | Apresentação final, com todos os integrantes |

Lista completa em [Defeitos e Pendências](docs/16-defeitos-e-pendencias.md) e no [Backlog](docs/12-backlog.md).

---

## Entregas

| Entrega do 1º bimestre | Data | Conteúdo |
|---|---|---|
| 1 | 14/08/2026 | Documento de Visão e Requisitos |
| 2 | 08/09/2026 | Documento revisado, modelagem do software e modelagem do banco de dados |
| 3 | 25/09/2026 | Repositório organizado, backlog, arquitetura, mapa de navegação, protótipos e definição do MVP |

| Entrega do 2º bimestre | Data | Conteúdo |
|---|---|---|
| Planejamento técnico e implementação inicial | 20/10/2026 | Revisão da base, recorte, arquitetura confirmada, backlog com prazos, testes executados e defeitos |
| Implementação, integração e testes | 06/11/2026 | Sistema funcionando no navegador e publicado, pedidos da professora, nova identidade visual, eventos, conteúdo opcional, 56 testes aprovados e defeitos corrigidos |
| Conclusão e apresentação final | 27/11/2026 | Software completo, com banco de dados, login, convite e evolução do progresso, 68 testes aprovados e apresentação de todos os integrantes |
