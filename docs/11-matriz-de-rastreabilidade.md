# 11 · Matriz de Rastreabilidade

> **Vértice** — Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 2, atualizado em 19/10/2026

---

A matriz demonstra que os artefatos não foram produzidos separadamente. Cada linha conecta um requisito ao caso de uso que o realiza, às entidades de dados que o sustentam, à tela em que ele aparece e à sua situação no [MVP](14-mvp.md). A seção [Implementação e testes](#implementação-e-testes) completa a ligação até o código e os casos de teste.

---

## Requisitos funcionais

| Requisito | Caso de uso | Entidades envolvidas | Tela prevista | No MVP? |
|---|---|---|---|---|
| **RF01** — Criar, selecionar e excluir grupos | UC01 · Gerenciar grupo de estudo | grupo | Acesso | Sim |
| **RF02** — Gerenciar membros | UC02 · Gerenciar membros | grupo, membro | Membros | Sim |
| **RF03** — Cadastrar, editar e excluir atividades | UC05 · Cadastrar atividade | atividade, conteudo, disciplina, membro | Formulário de atividade | Sim |
| **RF04** — Listar atividades com busca, filtros e ordenação | UC06 · Consultar atividades | atividade, conteudo, disciplina, membro | Atividades | Sim |
| **RF05** — Exibir detalhe e alterar status | UC06 · Consultar atividades / UC07 · Concluir atividade | atividade, membro | Detalhe da atividade | Sim |
| **RF06** — Painel com totais, atrasadas e próximas entregas | UC08 · Acompanhar progresso | atividade | Painel | Sim |
| **RF07** — Sinalizar prazo em feriado nacional | UC06 · Consultar atividades / UC08 · Acompanhar progresso | atividade *(atores externos: BrasilAPI e Nager.Date)* | Painel e Atividades | Não |
| **RF08** — Alternar tema claro e escuro | UC10 · Alternar tema | *nenhuma; preferência local do dispositivo* | Barra lateral, em todas as telas | Sim |
| **RF09** — Encerrar a sessão do grupo | UC11 · Encerrar sessão | grupo | Cabeçalho, em todas as telas | Sim |
| **RF10** — Calcular e exibir progresso do conteúdo | UC08 · Acompanhar progresso | conteudo, atividade | Disciplinas e Painel | Sim |
| **RF11** — Barra de progresso por disciplina | UC08 · Acompanhar progresso | disciplina, conteudo, atividade | Painel | Sim |
| **RF12** — Registrar e exibir histórico de progresso | UC07 · Concluir atividade / UC08 · Acompanhar progresso | progresso_historico, disciplina | Painel | Não |
| **RF13** — Gerenciar disciplinas | UC03 · Gerenciar disciplinas | grupo, disciplina | Disciplinas | Sim |
| **RF14** — Gerenciar conteúdos | UC04 · Gerenciar conteúdos | disciplina, conteudo | Disciplinas, seção de conteúdos | Sim |
| **RF15** — Atribuir experiência por atividade concluída | UC07 · Concluir atividade | atividade, membro | Detalhe da atividade e Desempenho | Sim |
| **RF16** — Calcular e exibir a ofensiva | UC07 · Concluir atividade / UC09 · Consultar painel de desempenho | atividade, membro | Desempenho | Não |
| **RF17** — Conceder e exibir conquistas | UC07 · Concluir atividade / UC09 · Consultar painel de desempenho | conquista, membro_conquista, membro | Desempenho | Não |
| **RF18** — Painel de desempenho do grupo | UC09 · Consultar painel de desempenho | membro, atividade, conquista, membro_conquista | Desempenho | Não |
| **RF19** — Gerar e sortear o avatar do membro | UC02 · Gerenciar membros | membro *(ator externo: DiceBear)* | Membros e Desempenho | Sim |
| **RF20** — Carregar dados de exemplo | UC12 · Carregar dados de exemplo | grupo, membro, disciplina, conteudo, atividade | Acesso | Sim |
| **RF21** — Relação dos próximos feriados nacionais | UC08 · Acompanhar progresso | *nenhuma; dado obtido de serviço externo* | Painel | Não |
| **RF22** — Sinalizar prazo em fim de semana | UC06 · Consultar atividades / UC08 · Acompanhar progresso | atividade | Painel, Atividades e Formulário de atividade | Não |

Os vinte e dois requisitos funcionais possuem caso de uso e tela. Dois não possuem entidade de dados, e em ambos o motivo é o mesmo: o dado não pertence ao domínio. No RF08 a escolha do tema é preferência do dispositivo; no RF21 os feriados vêm de serviço externo e não são armazenados como dado do sistema, apenas reaproveitados enquanto o serviço estiver fora do ar (RN17).

---

## Regras de negócio

| Regra | Onde é aplicada | Artefato que a representa |
|---|---|---|
| **RN01** — isolamento por grupo | Consultas de todas as telas privadas | Modelo lógico: encadeamento das chaves estrangeiras até `grupo` |
| **RN02** — exclusão em cascata | UC01, UC02, UC03 | Modelo lógico: `ON DELETE CASCADE` e `ON DELETE SET NULL` |
| **RN03** — responsável do mesmo grupo | UC05, passo 5B | Validação na aplicação, registrada no modelo lógico |
| **RN04** — status válido e padrão | UC05, passo 7 | Modelo lógico: `CHECK` e valor padrão em `atividade.status` |
| **RN05** — atividade atrasada | UC08, passo 2 | Consulta de referência no script de criação |
| **RN06** — título e prazo obrigatórios | UC05, passo 6 | Modelo lógico: `NOT NULL` e `CHECK` de comprimento |
| **RN07** — permissões do organizador | UC01, UC02, UC03, UC04 | Modelo lógico: `CHECK` em `membro.perfil` |
| **RN08** — progresso do conteúdo | UC07, passo 5; UC08, passo 3 | Diagrama de atividades "Concluir atividade" e consulta de referência |
| **RN09** — faixa e padrão do peso | UC05, passo 7 | Modelo lógico: `CHECK (peso BETWEEN 1 AND 5)` |
| **RN10** — crédito e estorno da experiência | UC07, passo 4 e fluxo alternativo 2A | Diagrama de atividades "Concluir atividade", incluindo o fluxo de reversão |
| **RN11** — cálculo da ofensiva | UC07, passo 6 | Campo `atividade.data_conclusao` no dicionário de dados |
| **RN12** — conquista concedida uma única vez | UC07, passo 7 | Modelo lógico: chave primária composta em `membro_conquista` |
| **RN13** — vínculo atividade–conteúdo–disciplina | UC05, passos 3 e 4 | Diagrama de atividades "Cadastrar atividade" e `id_conteudo NOT NULL` |
| **RN14** — progresso da disciplina | UC08, passo 3 | Consulta de referência no script de criação |
| **RN15** — semente e reserva do avatar | UC02, passos 4 e 6; fluxo alternativo 4A | Campo `membro.avatar` no dicionário de dados |
| **RN16** — urgência do prazo | UC06; UC08, passo 6 | Campo `atividade.prazo` no dicionário de dados |
| **RN17** — cadeia de obtenção dos feriados | UC08, passo 4 e fluxos alternativos 4A e 4B | Diagrama de casos de uso: BrasilAPI e Nager.Date como atores secundários |

---

## Requisitos não funcionais

| Requisito | Onde é verificado |
|---|---|
| **RNF01** — responsividade | Todas as telas, em larguras de celular, tablet e computador |
| **RNF02** — persistência entre sessões | Recarregar a página após qualquer cadastro |
| **RNF03** — mensagem de erro por campo | UC01 fluxo 6A, UC03 fluxo 5A, UC05 fluxo 6A |
| **RNF04** — resposta em até 1 segundo na busca | UC06 |
| **RNF05** — compatibilidade entre navegadores | Chrome, Firefox e Edge |
| **RNF06** — padronização visual | Todas as telas; tokens de cor, tipografia e componentes |
| **RNF07** — mensagem em listagem vazia | UC01 fluxo 2A, UC03 fluxo 2A, UC08 fluxo 2A, UC09 fluxo 1A |
| **RNF08** — recálculo em até 1 segundo | UC07, pós-condições |
| **RNF09** — progresso legível sem depender da cor | UC08, passo 5: percentual exibido em número junto à barra |
| **RNF10** — degradação com serviço externo fora do ar | UC02 fluxo 4A (avatar vira iniciais), UC08 fluxos 4A e 4B (fonte reserva e reaproveitamento) |

---

## Implementação e testes

Atualizado em 19/10/2026, sobre o commit `c29279b`. Os caminhos são relativos a `src/src/`. Os testes estão em [Casos de Teste](15-casos-de-teste.md) e os defeitos em [Defeitos e Pendências](16-defeitos-e-pendencias.md).

### Requisitos funcionais

| Requisito | Implementação | Teste | Estado atual |
|---|---|---|---|
| **RF01** — Criar, selecionar e excluir grupos | `pages/Login.jsx`, `context/AuthContext.jsx`, `context/DataContext.jsx` | CT01, CT02 | Implementado e testado |
| **RF02** — Gerenciar membros | `pages/Membros.jsx`, `lib/validacao.js` | CT03, CT04, CT20, CT26 | Implementado; defeito D01 aberto |
| **RF03** — Cadastrar, editar e excluir atividades | `pages/AtividadeForm.jsx`, `lib/validacao.js` | CT08, CT09, CT10, CT18 | Implementado e testado |
| **RF04** — Listar com busca, filtros e ordenação | `pages/Atividades.jsx`, `components/FiltrosSituacao.jsx`, `lib/situacoes.js` | CT14, CT29 | Implementado parcialmente: falta o filtro por disciplina (D07) |
| **RF05** — Detalhe e alteração de status | `pages/AtividadeDetalhe.jsx`, `components/AtividadeCard.jsx` | CT11, CT12 | Implementado e testado; tela de detalhe em revisão visual (T27) |
| **RF06** — Painel com totais, atrasadas e próximas entregas | `pages/Painel.jsx`, `lib/situacoes.js` | CT15 | Implementado e testado |
| **RF07** — Sinalizar prazo em feriado nacional | `lib/feriados.js`, `hooks/useFeriados.js`, `components/AtividadeCard.jsx` | — | Implementado; não testado (T34) |
| **RF08** — Alternar tema claro e escuro | `context/TemaContext.jsx`, `components/BotaoTema.jsx`, `styles/theme.js` | CT22 | Implementado e testado |
| **RF09** — Encerrar a sessão do grupo | `components/layout/PrivateLayout.jsx`, `routes/ProtectedRoute.jsx` | CT21 | Implementado e testado |
| **RF10** — Progresso do conteúdo | `lib/progresso.js`, `pages/DisciplinaDetalhe.jsx` | CT11, CT12, CT13; `verificacoes/progresso.js` | Implementado e testado |
| **RF11** — Progresso por disciplina | `lib/progresso.js`, `pages/Disciplinas.jsx`, `pages/Painel.jsx` | CT11, CT13; `verificacoes/progresso.js` | Implementado e testado |
| **RF12** — Histórico de progresso | — | — | Não implementado (T35) |
| **RF13** — Gerenciar disciplinas | `pages/Disciplinas.jsx`, `lib/validacao.js` | CT05, CT06, CT23 | Implementado e testado |
| **RF14** — Gerenciar conteúdos | `pages/DisciplinaDetalhe.jsx`, `lib/validacao.js` | CT07 | Implementado e testado |
| **RF15** — Experiência por atividade concluída | `lib/gamificacao.js`, `components/RetornoConclusao.jsx`, `components/SeloXp.jsx` | CT11, CT12, CT13; `verificacoes/gamificacao.js` | Implementado e testado |
| **RF16** — Ofensiva | — | — | Não implementado (T30) |
| **RF17** — Conquistas | — | — | Não implementado (T31) |
| **RF18** — Painel de desempenho do grupo | — | — | Não implementado (T32) |
| **RF19** — Avatar do membro | `lib/avatar.js`, `components/ui/Avatar.jsx`, `pages/Membros.jsx` | CT24 (alternativa local) | Implementado; imagem da DiceBear não testada (T34) |
| **RF20** — Carregar dados de exemplo | `lib/seed.js`, `pages/Login.jsx` | CT25 | Implementado e testado |
| **RF21** — Próximos feriados nacionais | `pages/Painel.jsx`, `components/CalendarioMes.jsx`, `lib/feriados.js` | — | Implementado; não testado (T34) |
| **RF22** — Sinalizar prazo em fim de semana | `lib/datas.js`, `components/AtividadeCard.jsx` | CT28 | Implementado e testado |

**Resumo:** 18 requisitos funcionais implementados — 15 testados (o RF04 com defeito aberto) e 3 com teste pendente (RF07, RF19 na imagem da DiceBear, RF21) — e 4 ainda não implementados (RF12, RF16, RF17, RF18).

### Requisitos não funcionais verificados nesta entrega

| Requisito | Implementação | Teste | Estado atual |
|---|---|---|---|
| **RNF02** — persistência entre sessões | `lib/storage.js`, `context/DataContext.jsx` | CT16, CT27 | Implementado; defeito D02 aberto |
| **RNF03** — mensagem de erro por campo | `lib/validacao.js`, `components/ui/Form.jsx` | CT01, CT03, CT06, CT08 | Implementado e testado |
| **RNF07** — mensagem em listagem vazia | `components/ui/EmptyState.jsx` | CT02, CT23 | Implementado e testado |
| **RNF10** — serviço externo fora do ar | `lib/feriados.js`, `components/ui/Avatar.jsx` | CT24 | Implementado e testado |

---

## Verificação cruzada

- Todo caso de uso tem origem em pelo menos um requisito funcional.
- Todo requisito funcional aparece em pelo menos um caso de uso e em pelo menos uma tela.
- Toda entidade do modelo de dados tem origem em um requisito: `grupo` (RF01), `membro` (RF02), `disciplina` (RF13), `conteudo` (RF14), `atividade` (RF03), `progresso_historico` (RF12), `conquista` e `membro_conquista` (RF17).
- Todo serviço externo consumido pelo sistema está representado como ator secundário no diagrama de casos de uso e tem comportamento previsto para a sua indisponibilidade: BrasilAPI e Nager.Date (RN17), DiceBear (RN15).
- Nenhuma tela apresenta funcionalidade que não esteja documentada como requisito. Esta verificação foi refeita em 17/09/2026, percorrendo o código tela a tela; as funcionalidades encontradas sem requisito correspondente originaram os requisitos RF19 a RF22 e as regras RN15 a RN17.
- Os nomes usados nos requisitos, nos casos de uso, nas classes, nas tabelas e nas telas são os mesmos: grupo, membro, disciplina, conteúdo, atividade, progresso, conquista.
- Todo requisito marcado como **Sim** na coluna do MVP tem tela prototipada em [`prototipos/`](../prototipos/01-telas-e-navegacao.md), e todo requisito marcado como **Não** não tem — o protótipo cobre o MVP e nada além dele.
- Toda tarefa do [backlog](12-backlog.md) cita o requisito que a origina; não há tarefa sem requisito nem requisito do MVP sem tarefa.

---

### Navegação

[⬅ Anterior: Casos de Uso](10-casos-de-uso.md) · [Índice](../README.md)
