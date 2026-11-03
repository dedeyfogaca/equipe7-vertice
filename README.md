<div align="center">

# VÉRTICE

### Plataforma de Acompanhamento de Aprendizagem

`Imersão Profissional: Projeto de Software` · `ADSIS4S` · `Equipe 7`

</div>

---

## Sobre o projeto

O Vértice é uma plataforma web para grupos de estudo organizarem suas disciplinas, conteúdos e atividades em um único ambiente e acompanharem, de forma visual, o quanto já avançaram.

**O problema.** Estudantes acompanham várias disciplinas ao mesmo tempo e organizam esse trabalho de forma dispersa: conversas, cadernos, planilhas improvisadas. Isso custa prazos e responsabilidades perdidas, mas o problema maior é outro — o estudante vê o que falta fazer e não vê o quanto já avançou. Uma lista de tarefas informa que restam cinco itens; ela não informa que ele já cobriu 70% de uma disciplina e quase nada de outra.

**O objetivo.** Desenvolver uma plataforma web que permita a grupos de estudo organizarem suas atividades acadêmicas e acompanharem visualmente a evolução do progresso em cada disciplina e conteúdo.

**A solução.** Cada atividade é ancorada em um conteúdo, que pertence a uma disciplina. Concluir uma atividade alimenta o percentual de progresso do conteúdo, que compõe o da disciplina, credita experiência ao responsável, alimenta a ofensiva de dias consecutivos e pode desbloquear conquistas. O registro de execução vira medida de aprendizagem.

---

## Equipe

| Integrante | GitHub |
|---|---|
| Andrey Fogaça | [@dedeyfogaca](https://github.com/dedeyfogaca) |
| Matheus Saraiva Faustin | [@MatheusSaraiv-a](https://github.com/MatheusSaraiv-a) |

Repositório: [github.com/dedeyfogaca/equipe-7_plataforma-acompanhamento-de-aprendizagem](https://github.com/dedeyfogaca/equipe-7_plataforma-acompanhamento-de-aprendizagem)

Sistema publicado: **[vertice-equipe-7.vercel.app](https://vertice-equipe-7.vercel.app)**

Instagram: [@go.vertice](https://www.instagram.com/go.vertice/)

---

## Entrega de 06/11/2026

Versão avaliada: tag **`entrega-06-11-2026`**.

| O que o manual pede | Onde está |
|---|---|
| Identificação da equipe, projeto e repositório | [Equipe](#equipe) e [Identificação do Projeto](docs/01-identificacao-do-projeto.md) |
| Revisão e alterações desde a entrega de 20/10 | Histórico de Alterações — revisões de [28/10](docs/09-historico-de-alteracoes.md#2º-bimestre--revisão-de-28102026) de [29/10](docs/09-historico-de-alteracoes.md#2º-bimestre--revisão-de-29102026) e de [01/11](docs/09-historico-de-alteracoes.md#2º-bimestre--revisão-de-01112026) |
| Escopo e recorte desta entrega | [MVP — Recorte da entrega de 06/11](docs/14-mvp.md#recorte-da-entrega-de-06112026) |
| Tecnologias e arquitetura atualizadas | [Arquitetura e Tecnologias](docs/13-arquitetura.md) |
| Backlog com prioridades, responsáveis, prazos e situação | [Backlog do Projeto](docs/12-backlog.md) |
| Código integrado, instruções para executar e sistema publicado | [`src/`](src/), [Como rodar](#como-rodar) e [vertice-equipe-7.vercel.app](https://vertice-equipe-7.vercel.app) |
| Casos de teste executados, resultados e evidências | [Casos de Teste](docs/15-casos-de-teste.md) e [`testes/evidencias-06-11/`](testes/evidencias-06-11/) |
| Defeitos corrigidos e pendências para 27/11 | [Defeitos e Pendências](docs/16-defeitos-e-pendencias.md) |
| Rastreabilidade até o código e os testes | [Matriz de Rastreabilidade — Implementação e testes](docs/11-matriz-de-rastreabilidade.md#implementação-e-testes) |
| Telas da versão 2 e mapa de navegação | [Telas e Navegação](prototipos/01-telas-e-navegacao.md) |

**Resumo:** o sistema roda do início ao fim no navegador, com tudo o que não depende do banco de dados, e está publicado na Vercel. Entraram a ofensiva, as conquistas, o painel de desempenho, a nova identidade visual, os pedidos da professora depois de 20/10 — responsável obrigatório, calendário nas cores das disciplinas, paleta de cores e foto de perfil — e os ajustes que a equipe pediu ao revisar a versão: tema claro em todas as telas, editor de foto, foto do grupo, conteúdo criado sem sair da atividade, só o responsável concluindo a atividade, a marca nova, as seções no topo e avatares em cinco estilos. Foram executados 47 casos de teste em 01/11/2026, todos aprovados, e os defeitos encontrados — D01 a D07 em 20/10, D08 a D10 neste ciclo — estão corrigidos. Para 27/11 ficam o banco de dados, o acesso com conta Google ou e-mail, o convite para o grupo e o histórico de progresso.

### Entrega de 20/10/2026

Versão avaliada: tag **`entrega-20-10-2026`**. O MVP construído, com 29 casos de teste executados sobre o commit `c29279b`: 26 aprovados e 3 reprovados, que viraram os defeitos D01, D02 e D07. O registro completo está na própria tag, e o resumo, no [documento de testes](docs/15-casos-de-teste.md#ciclo-de-2010).

---

## Funcionalidades disponíveis

- Página inicial e página Sobre nós, com a história da equipe
- Seções do sistema numa barra no topo, que no celular vira um menu que desce do topo
- Criação e seleção de grupos de estudo, com foto do grupo opcional: quem cria entra como organizador, e cada pessoa escolhe quem é dentro do grupo
- Cadastro de membros com perfis de permissão e foto de perfil, enquadrada num editor, ou avatar sorteado, em cinco estilos para escolher; ao remover um membro, o organizador escolhe quem assume as atividades dele
- Cadastro de disciplinas, com cor escolhida numa paleta de 18 cores, e de conteúdos vinculados a elas
- Cadastro de atividades com conteúdo, prazo, peso, prioridade, status e responsável obrigatório; o conteúdo pode ser criado sem sair do formulário, e só o responsável muda o status da atividade
- Lista com busca, filtros por situação, disciplina, responsável e prazo, e ordenação, com a cor de cada disciplina e a foto de cada responsável
- Painel com totais por situação, atividades atrasadas, próximas entregas, progresso por disciplina e próximos feriados
- Calendário do mês, da semana ou em lista, com as entregas nas cores das disciplinas, troca de mês animada — também deslizando o dedo — e criação de atividade a partir de um dia
- Barra de progresso por conteúdo e por disciplina, calculada a partir do peso das atividades concluídas
- Experiência, ofensiva de dias seguidos, seis conquistas e ranking do grupo
- Sinalização de prazos em fim de semana e em feriado nacional
- Tema claro e escuro em todas as telas, dados de exemplo e uso no celular

### Em desenvolvimento

- Banco de dados, acesso com conta Google ou e-mail, convite para o grupo por link ou código e fotos no armazenamento de arquivos — até 27/11. Na página inicial, o grupo por convite aparece como "Em breve"
- Histórico de progresso ao longo do tempo — até 27/11

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
| Persistência | Armazenamento do navegador, seguindo o modelo lógico relacional | Elimina a necessidade de servidor nesta etapa; a troca pelo banco exige apenas mudar a camada de acesso |
| Banco de dados (27/11) | PostgreSQL no Supabase | Banco relacional, login com Google e e-mail e armazenamento das fotos, sem servidor próprio |
| Hospedagem | Vercel | Publicação gratuita do site, refeita a cada atualização no GitHub |
| Integração | BrasilAPI | Fonte pública e gratuita para os feriados nacionais |
| Integração | Nager.Date | Fonte reserva de feriados, acionada quando a BrasilAPI falha ou demora |
| Avatares | DiceBear, como biblioteca | Avatares em cinco estilos, desenhados no próprio navegador a partir de uma semente, sem depender de serviço externo |

---

## Estrutura do repositório

```
.
├── docs/               Documento de Visão e Requisitos, casos de uso e rastreabilidade
├── diagramas/          Casos de uso, classes e fluxos de processo
│   └── png/            Versões em imagem dos diagramas
├── banco-de-dados/     Modelo conceitual, modelo lógico, dicionário e script SQL
├── prototipos/         Mapa de navegação, telas e protótipo navegável
│   ├── telas-v2/       As telas da versão 2, nos dois temas e no celular
│   ├── telas/          As oito telas do protótipo do MVP em imagem
│   └── navegavel/      Protótipo clicável do MVP: abra o index.html no navegador
├── testes/             Evidências e registros da execução dos testes
│   ├── evidencias-06-11/  Capturas de tela do ciclo de 06/11, por caso de teste
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
| 06 | [Requisitos Funcionais](docs/06-requisitos-funcionais.md) | RF01 a RF30 |
| 07 | [Requisitos Não Funcionais](docs/07-requisitos-nao-funcionais.md) | RNF01 a RNF10 |
| 08 | [Regras de Negócio](docs/08-regras-de-negocio.md) | RN01 a RN20 |
| 09 | [Histórico de Alterações](docs/09-historico-de-alteracoes.md) | Mudanças desde a Entrega 1, com data, motivo e impacto |
| 10 | [Especificação dos Casos de Uso](docs/10-casos-de-uso.md) | UC01, UC02, UC03, UC05, UC07, UC08, UC09, UC12 e UC13 detalhados |
| 11 | [Matriz de Rastreabilidade](docs/11-matriz-de-rastreabilidade.md) | Requisito → caso de uso → entidades → tela → MVP → código → teste |
| 12 | [Backlog do Projeto](docs/12-backlog.md) | 65 tarefas com requisito, prioridade, responsável, prazo, situação e critérios de conclusão |
| 13 | [Arquitetura e Tecnologias](docs/13-arquitetura.md) | Camadas, serviços externos, ambiente, organização das pastas e caminho até o banco de dados |
| 14 | [Produto Mínimo Viável](docs/14-mvp.md) | Classificação dos requisitos, o fluxo completo e os recortes de 20/10 e de 06/11 |
| 15 | [Casos de Teste](docs/15-casos-de-teste.md) | 47 casos executados em 01/11, com resultado e evidência, e o resumo do ciclo de 20/10 |
| 16 | [Defeitos e Pendências](docs/16-defeitos-e-pendencias.md) | Defeitos encontrados nos testes e pendências até 27/11 |

### Modelagem do software

| Diagrama | Conteúdo |
|---|---|
| [Identidade visual](diagramas/00-identidade-visual.md) | Paleta, tipografia e vocabulário de formas usados nos diagramas |
| [Casos de uso](diagramas/01-casos-de-uso.md) | Atores, fronteira do sistema e os treze casos de uso |
| [Classes](diagramas/02-classes.md) | Oito classes com atributos, operações e cardinalidades |
| [Fluxo — Concluir atividade](diagramas/03-atividade-concluir.md) | Recálculo de progresso, experiência, ofensiva e conquistas |
| [Fluxo — Cadastrar atividade](diagramas/04-atividade-cadastrar.md) | Vínculo com disciplina e conteúdo, validações e padrões |
| [Arquitetura](diagramas/svg/arquitetura.svg) | Camadas da aplicação, persistência e serviços externos |
| [Mapa de navegação da versão 2](diagramas/svg/mapa-navegacao-v2.svg) | Como as telas da versão 2 se conectam |
| [Mapa de navegação do MVP](diagramas/svg/mapa-navegacao.svg) | Como as oito telas do protótipo do MVP se conectam |

### Modelagem do banco de dados

| Documento | Conteúdo |
|---|---|
| [Modelo conceitual](banco-de-dados/01-modelo-conceitual.md) | Entidades, atributos, relacionamentos e cardinalidades |
| [Modelo lógico](banco-de-dados/02-modelo-logico.md) | Tabelas, chaves primárias e estrangeiras, tipos e restrições |
| [Dicionário de dados](banco-de-dados/03-dicionario-de-dados.md) | Descrição campo a campo das oito tabelas |
| [Script de criação](banco-de-dados/04-script-criacao.sql) | DDL em MySQL 8, carga inicial e consultas de referência |

---

## MVP

A primeira versão funcional entrega o ciclo completo de medição de aprendizagem: **entrar no grupo, montar a estrutura de disciplinas e conteúdos, cadastrar atividades com peso, concluí-las e ver o progresso subir** — com a experiência creditada a quem concluiu.

| | Requisitos | O que entrega |
|---|---|---|
| **No MVP** | RF01 a RF06, RF08, RF09, RF10, RF11, RF13, RF14, RF15, RF19, RF20 | O ciclo fechado, do cadastro à medida, nos temas claro e escuro |
| **Desejável** | RF07, RF12, RF16 a RF18, RF21 a RF30 e o banco de dados | Ofensiva, conquistas, histórico, sinalização de datas, calendário, fotos de perfil e do grupo, paleta, páginas públicas, acesso com conta, convite e conteúdo criado pela atividade |
| **Futura** | — | Notificações, exportação e app nativo |

A classificação completa, com justificativa item a item, está em [Produto Mínimo Viável](docs/14-mvp.md). O protótipo navegável em [`prototipos/navegavel/`](prototipos/navegavel/index.html) cobre exatamente as telas do MVP; as telas da versão 2 estão em [Telas e Navegação](prototipos/01-telas-e-navegacao.md).

---

## Organização do projeto

| Onde | O que está lá |
|---|---|
| `docs/` | Documento de Visão e Requisitos completo: contexto, requisitos, regras, casos de uso, rastreabilidade, backlog, arquitetura e MVP |
| `diagramas/` | Casos de uso, classes, fluxos de atividade, arquitetura e mapa de navegação — em Mermaid dentro do `.md` ou em SVG na pasta `svg/` |
| `banco-de-dados/` | Modelo conceitual, modelo lógico, dicionário de dados e o script de criação em MySQL |
| `prototipos/` | Levantamento de telas, mapas de navegação, as telas da versão 2, as oito telas do MVP e o protótipo clicável |
| `testes/` | Evidências da execução dos casos de teste e registros das verificações automatizadas |
| `src/` | Código-fonte da aplicação React |

---

## Como rodar

Para usar sem instalar nada, abra a versão publicada: **[vertice-equipe-7.vercel.app](https://vertice-equipe-7.vercel.app)**.

Para rodar na própria máquina: Node.js 20 ou superior e npm. Executado e testado com Node.js 22.22.0 e npm 10.9.4.

```bash
git clone https://github.com/dedeyfogaca/equipe-7_plataforma-acompanhamento-de-aprendizagem.git
cd equipe-7_plataforma-acompanhamento-de-aprendizagem/src
npm ci          # instala exatamente as versões do package-lock.json
npm run dev     # roda em desenvolvimento
```

O terminal exibirá o endereço local, normalmente `http://localhost:5173`. Na tela de acesso, use **"Carregar dados de exemplo"** para entrar com um grupo de dados fictícios já preenchido.

```bash
npm run verificar  # confere as regras de progresso, experiência, ofensiva, conquistas, perfis, atividades, permissões, recorte da foto e migração
npm run build      # gera a versão de produção
npm run preview    # pré-visualiza a versão de produção
```

Não há variáveis de ambiente nem banco a configurar nesta entrega: os dados ficam no armazenamento do navegador. Versões das bibliotecas e organização das pastas estão em [Arquitetura e Tecnologias](docs/13-arquitetura.md#ambiente-de-desenvolvimento), e os detalhes do código no [README de `src/`](src/README.md).

---

## Pendências e próximos passos

| Até | O quê |
|---|---|
| 06/11/2026 | Conferir, na versão publicada, os feriados reais da BrasilAPI |
| 06/11/2026 | Conferir num celular de verdade o arraste e o gesto de pinça do editor de foto |
| 27/11/2026 | Banco de dados no Supabase, acesso com conta Google ou e-mail, convite para o grupo e fotos no armazenamento de arquivos |
| 27/11/2026 | Histórico de progresso, testes da versão final no Chrome, Firefox e Edge, documentação consolidada e apresentação final |

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
| Implementação, integração e testes | 06/11/2026 | Sistema funcionando no navegador e publicado, pedidos da professora, nova identidade visual, 47 testes aprovados e defeitos corrigidos |
| Conclusão e apresentação final | 27/11/2026 | Software funcionando e apresentação de todos os integrantes |
