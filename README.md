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

---

## Entrega de 20/10/2026

Versão avaliada: tag **`entrega-20-10-2026`**.

| O que o manual pede | Onde está |
|---|---|
| Identificação da equipe, projeto e repositório | [Equipe](#equipe) e [Identificação do Projeto](docs/01-identificacao-do-projeto.md) |
| Resumo da revisão e das alterações desde o 1º bimestre | [Histórico de Alterações — 2º bimestre](docs/09-historico-de-alteracoes.md#2º-bimestre--revisão-de-19102026) |
| Escopo priorizado e recorte desta entrega | [MVP — Recorte da entrega de 20/10](docs/14-mvp.md#recorte-da-entrega-de-20102026) |
| Tecnologias justificadas e arquitetura confirmada | [Arquitetura e Tecnologias](docs/13-arquitetura.md) |
| Backlog com prioridades, responsáveis, prazos e situação | [Backlog do Projeto](docs/12-backlog.md) |
| Código integrado e instruções para executar | [`src/`](src/) e [Como rodar](#como-rodar) |
| Casos de teste executados, resultados e evidências | [Casos de Teste](docs/15-casos-de-teste.md) e [`testes/`](testes/) |
| Defeitos e pendências para 06/11 | [Defeitos e Pendências](docs/16-defeitos-e-pendencias.md) |
| Rastreabilidade até o código e os testes | [Matriz de Rastreabilidade — Implementação e testes](docs/11-matriz-de-rastreabilidade.md#implementação-e-testes) |

**Resumo:** o MVP está construído e roda do início ao fim. Foram executados 29 casos de teste sobre o commit `c29279b`: 26 aprovados e 3 reprovados, que viraram os defeitos D01, D02 e D07, com correção prevista para 30/10.

---

## Funcionalidades disponíveis

- Criação e seleção de grupos de estudo, com cadastro de membros e perfis de permissão
- Cadastro de disciplinas e de conteúdos vinculados a elas
- Cadastro de atividades com conteúdo, prazo, peso, prioridade, status e responsável
- Listagem com busca, filtros por situação, responsável e prazo, e ordenação (o filtro por disciplina volta até 30/10)
- Painel com totais por situação, atividades atrasadas e próximas entregas
- Barra de progresso por conteúdo e por disciplina, calculada a partir do peso das atividades concluídas
- Experiência creditada ao responsável quando a atividade é concluída
- Sinalização de prazos em fim de semana e em feriado nacional, e calendário com os próximos feriados
- Avatar dos membros, dados de exemplo e tema claro e escuro

### Em desenvolvimento

- Ofensiva de dias consecutivos, conquistas por marcos e painel de desempenho do grupo — até 06/11
- Nova identidade visual em todas as telas — até 06/11
- Histórico de progresso ao longo do tempo — até 27/11

---

## Tecnologias

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Interface | React 18 com Vite | Stack que a equipe já domina; o Vite dá build rápido e configuração mínima |
| Roteamento | React Router | Rotas públicas, privadas e dinâmicas sem biblioteca adicional |
| Estilo | Styled Components | Permite manter um design system próprio com tema claro e escuro no mesmo código |
| Estado | Context API | Suficiente para o volume de dados do projeto, sem dependência externa |
| Persistência | Armazenamento do navegador, seguindo o modelo lógico relacional | Elimina a necessidade de servidor no prazo do bimestre; a migração para MySQL exige apenas trocar a camada de acesso |
| Integração | BrasilAPI | Fonte pública e gratuita para os feriados nacionais |
| Integração | Nager.Date | Fonte reserva de feriados, acionada quando a BrasilAPI falha ou demora |
| Integração | DiceBear | Geração das imagens de avatar a partir de uma semente, sem hospedar imagem |
| Tipografia | Google Fonts | Entrega das famílias Manrope e JetBrains Mono sem embutir arquivo de fonte no projeto |

---

## Estrutura do repositório

```
.
├── docs/               Documento de Visão e Requisitos, casos de uso e rastreabilidade
├── diagramas/          Casos de uso, classes e fluxos de processo
│   └── png/            Versões em imagem dos diagramas
├── banco-de-dados/     Modelo conceitual, modelo lógico, dicionário e script SQL
├── prototipos/         Mapa de navegação, telas e protótipo navegável
│   ├── telas/          As oito telas do MVP em imagem
│   └── navegavel/      Protótipo clicável: abra o index.html no navegador
├── testes/             Evidências e registros da execução dos testes
│   ├── evidencias/     Capturas de tela, uma por caso de teste
│   └── registros/      Saída do npm run verificar e do build
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
| 06 | [Requisitos Funcionais](docs/06-requisitos-funcionais.md) | RF01 a RF22 |
| 07 | [Requisitos Não Funcionais](docs/07-requisitos-nao-funcionais.md) | RNF01 a RNF10 |
| 08 | [Regras de Negócio](docs/08-regras-de-negocio.md) | RN01 a RN17 |
| 09 | [Histórico de Alterações](docs/09-historico-de-alteracoes.md) | Mudanças desde a Entrega 1, com data, motivo e impacto |
| 10 | [Especificação dos Casos de Uso](docs/10-casos-de-uso.md) | UC01, UC02, UC03, UC05, UC07, UC08, UC09 e UC12 detalhados |
| 11 | [Matriz de Rastreabilidade](docs/11-matriz-de-rastreabilidade.md) | Requisito → caso de uso → entidades → tela → MVP → código → teste |
| 12 | [Backlog do Projeto](docs/12-backlog.md) | 36 tarefas com requisito, prioridade, responsável, prazo, situação e critérios de conclusão |
| 13 | [Arquitetura e Tecnologias](docs/13-arquitetura.md) | Camadas, serviços externos, ambiente, organização das pastas e caminho até o banco relacional |
| 14 | [Produto Mínimo Viável](docs/14-mvp.md) | Classificação dos requisitos, o fluxo completo e o recorte de 20/10 |
| 15 | [Casos de Teste](docs/15-casos-de-teste.md) | 29 casos executados, com resultado e evidência |
| 16 | [Defeitos e Pendências](docs/16-defeitos-e-pendencias.md) | Defeitos encontrados nos testes e pendências até 27/11 |

### Modelagem do software

| Diagrama | Conteúdo |
|---|---|
| [Identidade visual](diagramas/00-identidade-visual.md) | Paleta, tipografia e vocabulário de formas usados nos diagramas |
| [Casos de uso](diagramas/01-casos-de-uso.md) | Atores, fronteira do sistema e os doze casos de uso |
| [Classes](diagramas/02-classes.md) | Oito classes com atributos, operações e cardinalidades |
| [Fluxo — Concluir atividade](diagramas/03-atividade-concluir.md) | Recálculo de progresso, experiência, ofensiva e conquistas |
| [Fluxo — Cadastrar atividade](diagramas/04-atividade-cadastrar.md) | Vínculo com disciplina e conteúdo, validações e padrões |
| [Arquitetura](diagramas/svg/arquitetura.svg) | Camadas da aplicação, persistência e serviços externos |
| [Mapa de navegação](diagramas/svg/mapa-navegacao.svg) | Como as oito telas do MVP se conectam |

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
| **Desejável** | RF07, RF12, RF16, RF17, RF18, RF21, RF22 | Ofensiva, conquistas, histórico e sinalização de datas |
| **Futura** | — | Banco relacional, notificações, exportação e app nativo |

A classificação completa, com justificativa item a item, está em [Produto Mínimo Viável](docs/14-mvp.md). O protótipo navegável em [`prototipos/navegavel/`](prototipos/navegavel/index.html) cobre exatamente as telas do MVP — nada além.

---

## Organização do projeto

| Onde | O que está lá |
|---|---|
| `docs/` | Documento de Visão e Requisitos completo: contexto, requisitos, regras, casos de uso, rastreabilidade, backlog, arquitetura e MVP |
| `diagramas/` | Casos de uso, classes, fluxos de atividade, arquitetura e mapa de navegação — em Mermaid dentro do `.md` ou em SVG na pasta `svg/` |
| `banco-de-dados/` | Modelo conceitual, modelo lógico, dicionário de dados e o script de criação em MySQL |
| `prototipos/` | Levantamento de telas, mapa de navegação, as oito telas em imagem e o protótipo clicável |
| `testes/` | Evidências da execução dos casos de teste e registros das verificações automatizadas |
| `src/` | Código-fonte da aplicação React |

---

## Como rodar

Requisitos: Node.js 18 ou superior e npm. Executado e testado com Node.js 22.22.0 e npm 10.9.4.

```bash
git clone https://github.com/dedeyfogaca/equipe-7_plataforma-acompanhamento-de-aprendizagem.git
cd equipe-7_plataforma-acompanhamento-de-aprendizagem/src
npm ci          # instala exatamente as versões do package-lock.json
npm run dev     # roda em desenvolvimento
```

O terminal exibirá o endereço local, normalmente `http://localhost:5173`. Na tela de acesso, use **"Carregar dados de exemplo"** para entrar com um grupo de dados fictícios já preenchido.

```bash
npm run verificar  # confere as regras de progresso, experiência, perfis e migração
npm run build      # gera a versão de produção
npm run preview    # pré-visualiza a versão de produção
```

Não há variáveis de ambiente nem banco a configurar: os dados ficam no armazenamento do navegador. Versões das bibliotecas e organização das pastas estão em [Arquitetura e Tecnologias](docs/13-arquitetura.md#ambiente-de-desenvolvimento).

---

## Pendências e próximos passos

| Até | O quê |
|---|---|
| 30/10/2026 | Corrigir os defeitos D01 (grupo sem organizador), D02 (falha de gravação sem aviso) e D07 (filtro por disciplina) |
| 06/11/2026 | Ofensiva, conquistas e painel de desempenho; nova identidade visual; reexecutar os testes e incluir feriados, responsividade e outros navegadores |
| 27/11/2026 | Histórico de progresso, documentação consolidada e apresentação final |

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
| Implementação, integração e testes | 06/11/2026 | Sistema parcialmente funcional |
| Conclusão e apresentação final | 27/11/2026 | Software funcionando e apresentação de todos os integrantes |
