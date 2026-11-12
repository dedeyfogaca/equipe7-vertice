# 11 · Matriz de Rastreabilidade

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 2, atualizado em 12/11/2026

---

A matriz demonstra que os artefatos não foram produzidos separadamente. Cada linha conecta um requisito ao caso de uso que o realiza, às entidades de dados que o sustentam, à tela em que ele aparece e à sua situação no [MVP](14-mvp.md). A seção [Implementação e testes](#implementação-e-testes) completa a ligação até o código e os casos de teste.

---

## Requisitos funcionais

| Requisito | Caso de uso | Entidades envolvidas | Tela prevista | No MVP? |
|---|---|---|---|---|
| **RF01**: Criar, editar, selecionar e excluir grupos | UC01 · Gerenciar grupo de estudo | grupo, membro | Seletor de espaço (Criar grupo e Editar grupo) e Membros (excluir) | Sim |
| **RF02**: Gerenciar membros | UC02 · Gerenciar membros | grupo, membro | Membros | Sim |
| **RF03**: Cadastrar, editar e excluir atividades | UC05 · Cadastrar atividade | atividade, grupo, disciplina, conteudo (opcional), membro | Formulário de atividade | Sim |
| **RF04**: Listar atividades com busca, filtros e ordenação | UC06 · Consultar atividades / UC17 · Usar o espaço pessoal | atividade, conteudo, disciplina, membro, grupo | Atividades | Sim |
| **RF05**: Exibir detalhe e alterar status | UC06 · Consultar atividades / UC07 · Concluir atividade / UC19 · Assumir atividade | atividade, membro | Detalhe da atividade | Sim |
| **RF06**: Painel com totais, atrasadas e próximas entregas | UC08 · Acompanhar progresso | atividade | Painel | Sim |
| **RF07**: Sinalizar prazo em feriado nacional | UC06 · Consultar atividades / UC08 · Acompanhar progresso / UC13 · Consultar calendário | atividade *(atores externos: BrasilAPI e Nager.Date)* | Painel, Atividades e Calendário | Não |
| **RF08**: Alternar tema claro e escuro | UC10 · Alternar tema | *nenhuma; preferência local do dispositivo* | Barra do topo, menu das páginas públicas e tela de acesso | Sim |
| **RF09**: Voltar ao espaço pessoal e sair da conta | UC11 · Encerrar sessão / UC01 · Gerenciar grupo de estudo / UC15 · Entrar com conta | grupo, membro | Menu da conta, na barra do topo, em todas as telas | Sim |
| **RF10**: Calcular e exibir progresso do conteúdo | UC08 · Acompanhar progresso | conteudo, atividade | Disciplinas e Painel | Sim |
| **RF11**: Barra de progresso por disciplina | UC08 · Acompanhar progresso | disciplina, atividade | Painel | Sim |
| **RF12**: Registrar e exibir histórico de progresso | UC07 · Concluir atividade / UC08 · Acompanhar progresso | progresso_historico, disciplina, atividade | Detalhe da disciplina | Não |
| **RF13**: Gerenciar disciplinas | UC03 · Gerenciar disciplinas | grupo, disciplina | Disciplinas | Sim |
| **RF14**: Gerenciar conteúdos | UC04 · Gerenciar conteúdos | disciplina, conteudo | Disciplinas, seção de conteúdos | Sim |
| **RF15**: Atribuir experiência por atividade concluída | UC07 · Concluir atividade | atividade, membro | Detalhe da atividade e Conquistas | Sim |
| **RF16**: Calcular e exibir a ofensiva | UC07 · Concluir atividade / UC09 · Consultar painel de desempenho | atividade, membro | Painel e Conquistas | Não |
| **RF17**: Conceder, exibir e retirar conquistas | UC07 · Concluir atividade / UC09 · Consultar painel de desempenho | conquista, membro_conquista, membro | Painel e Conquistas | Não |
| **RF18**: Painel de desempenho do grupo | UC09 · Consultar painel de desempenho | membro, atividade, conquista, membro_conquista | Conquistas | Não |
| **RF19**: Gerar e sortear o avatar do membro | UC02 · Gerenciar membros | membro | Membros e Conquistas | Sim |
| **RF20**: Carregar dados de exemplo | UC12 · Carregar dados de exemplo | perfil, grupo, membro, disciplina, conteudo, atividade, evento | Acesso (nome na demonstração) e seletor de espaço | Sim |
| **RF21**: Relação dos próximos feriados nacionais | UC08 · Acompanhar progresso | *nenhuma; dado obtido de serviço externo* | Painel | Não |
| **RF22**: Sinalizar prazo em fim de semana | UC06 · Consultar atividades / UC08 · Acompanhar progresso | atividade | Formulário e detalhe da atividade | Não |
| **RF23**: Calendário com as entregas nas cores das disciplinas, os eventos e a barra de filtros | UC13 · Consultar calendário | atividade, disciplina, evento *(atores externos: BrasilAPI e Nager.Date)* | Calendário | Não |
| **RF24**: Foto de perfil | UC02 · Gerenciar membros / UC18 · Editar o perfil | membro, perfil | Meu perfil e Membros | Não |
| **RF25**: Paleta de cores das disciplinas | UC03 · Gerenciar disciplinas | disciplina | Disciplinas | Não |
| **RF26**: Páginas públicas de apresentação | UC01 · Gerenciar grupo de estudo | *nenhuma; conteúdo fixo de apresentação* | Início e Sobre nós | Não |
| **RF27**: Acesso com conta Google ou e-mail | UC15 · Entrar com conta / UC01 · Gerenciar grupo de estudo | membro (`id_usuario`), perfil, conta do Supabase Auth | Login e painel do espaço pessoal | Não |
| **RF28**: Convite para o grupo por link ou código | UC16 · Convidar para o grupo | convite, grupo, membro | Membros (Convidar), seletor de espaço (código) e link do convite | Não |
| **RF29**: Foto do grupo | UC01 · Gerenciar grupo de estudo | grupo | Seletor de espaço (Criar grupo e Editar grupo) | Não |
| **RF30**: Criar conteúdo a partir do formulário de atividade | UC05 · Cadastrar atividade | conteudo, disciplina | Formulário de atividade | Não |
| **RF31**: Eventos, de um ou de vários dias | UC14 · Gerenciar eventos / UC13 · Consultar calendário | evento, grupo, disciplina, membro | Eventos, Painel e Calendário | Não |
| **RF32**: Feedback dos usuários de teste, dentro do sistema | UC01 · Gerenciar grupo de estudo | `feedback`, `equipe` | Feedback (`/feedback`), Respostas do feedback (`/feedback/respostas`), início, rodapé das páginas públicas e menu da conta | Não |
| **RF33**: Tutorial opcional | UC12 · Carregar dados de exemplo | *nenhuma; a escolha de ter visto o tutorial é do dispositivo* | Painel (convite) e menu da conta | Não |
| **RF34**: Espaço pessoal | UC17 · Usar o espaço pessoal / UC01 · Gerenciar grupo de estudo | grupo (`pessoal`), membro, atividade, evento, perfil | Seletor de espaço e todas as telas internas no espaço pessoal | Não |
| **RF35**: Perfil da conta | UC18 · Editar o perfil | perfil, membro | Meu perfil | Não |
| **RF36**: Lembrete por e-mail | UC21 · Receber lembrete por e-mail / UC18 · Editar o perfil | perfil, atividade, membro *(ator externo: Brevo)* | Meu perfil (ligar e desligar) e o e-mail | Não |
| **RF37**: Atividades em lote | UC20 · Cadastrar e alterar em lote | atividade, disciplina, membro | Várias de uma vez e Atividades (seleção) | Não |
| **RF38**: Responsável "A definir" e Assumir | UC19 · Assumir atividade / UC05 · Cadastrar atividade | atividade, membro | Atividades, detalhe e formulário da atividade | Não |
| **RF39**: Sair do grupo | UC22 · Sair do grupo | membro (`data_saida`), atividade | Menu do grupo, no seletor de espaço, e pé da tela Membros | Não |
| **RF40**: Histórico do grupo | UC23 · Consultar o histórico do grupo | registro | Painel Histórico do grupo, aberto em Membros e no menu do grupo | Não |

Os quarenta requisitos funcionais possuem caso de uso e tela. Quatro não possuem entidade de dados, e nos quatro o motivo é o mesmo: o dado não pertence ao domínio. No RF08 a escolha do tema é preferência do dispositivo; no RF21 os feriados vêm de serviço externo e não são armazenados como dado do sistema, apenas reaproveitados enquanto o serviço estiver fora do ar (RN17); no RF26 as páginas têm conteúdo fixo; no RF33 o tutorial tem conteúdo fixo, e ter visto ou não é preferência do dispositivo. A conta do RF27 fica no serviço de autenticação do Supabase, e o membro e o perfil apontam para ela pelo `id_usuario`.

---

## Regras de negócio

| Regra | Onde é aplicada | Artefato que a representa |
|---|---|---|
| **RN01**: isolamento por grupo e espaço pessoal | Consultas de todas as telas privadas; UC17 | Modelo lógico: encadeamento das chaves estrangeiras até `grupo` e `atividade.id_grupo`; regras de acesso por linha no script do banco (funções `eh_membro` e `grupo_pessoal`) |
| **RN02**: exclusão em cascata e troca de responsável | UC01, UC02, UC03, UC14 | Modelo lógico: `ON DELETE CASCADE`, `ON DELETE SET NULL` em `atividade.id_conteudo` e `evento.id_disciplina`, e `ON DELETE RESTRICT` em `atividade.id_responsavel` |
| **RN03**: responsável do mesmo grupo | UC05, fluxos 5B e 1D; UC17, passo 4 | Validação na aplicação e gatilho `conferir_atividade` no banco |
| **RN04**: status válido e padrão | UC05, passos 2 e 7 | Modelo lógico: `CHECK` e valor padrão em `atividade.status` |
| **RN05**: atividade atrasada | UC08, passo 2 | Consulta de referência no script de criação |
| **RN06**: título, prazo e disciplina obrigatórios; responsável "A definir" | UC05, passo 6 e fluxo 5A; UC19 | Modelo lógico: `NOT NULL`, `CHECK` de comprimento e `ck_atividade_a_definir`; gatilho `conferir_atividade` (quem não é organizador só assume) |
| **RN07**: permissões do organizador e organizador do grupo | UC01, UC02, UC03, UC04, UC16; UC05, fluxos 4A e 1C | Modelo lógico: `CHECK` em `membro.perfil`; regras de acesso por linha (função `eh_organizador`) e gatilho `conferir_membro` (último organizador) |
| **RN08**: progresso do conteúdo | UC07, passo 5; UC08, passo 3 | Diagrama de atividades "Concluir atividade" e consulta de referência |
| **RN09**: faixa e padrão do peso | UC05, passos 2 e 7 | Modelo lógico: `CHECK (peso BETWEEN 1 AND 5)` |
| **RN10**: crédito e estorno da experiência | UC07, passo 4 e fluxo alternativo 2A | Diagrama de atividades "Concluir atividade", incluindo o fluxo de reversão |
| **RN11**: cálculo da ofensiva | UC07, passo 6 | Campo `atividade.data_conclusao` no dicionário de dados |
| **RN12**: conquista concedida uma única vez e retirada com a experiência | UC07, passo 7 e fluxo 2A | Modelo lógico: chave primária composta em `membro_conquista`; regra de acesso `membro_conquista_retirar` |
| **RN13**: atividade na disciplina, conteúdo opcional | UC05, passos 3 e 4; UC03, fluxo 3C | Diagrama de atividades "Cadastrar atividade", `atividade.id_disciplina` obrigatória nos grupos (gatilho `conferir_atividade`) e `atividade.id_conteudo` opcional |
| **RN14**: progresso da disciplina | UC08, passo 3 | Consulta de referência no script de criação |
| **RN15**: semente e reserva do avatar | UC02, passos 4 e 6; fluxo alternativo 4A | Campo `membro.avatar` no dicionário de dados |
| **RN16**: urgência do prazo | UC06; UC08, passo 6 | Campo `atividade.prazo` no dicionário de dados |
| **RN17**: cadeia de obtenção dos feriados | UC08, passo 4 e fluxos alternativos 4A e 4B | Diagrama de casos de uso: BrasilAPI e Nager.Date como atores secundários |
| **RN18**: cor da paleta | UC03, passo 4 | Campo `disciplina.cor` no dicionário de dados |
| **RN19**: formato, tamanho e enquadramento das fotos | UC01, passo 5 e fluxo 3C; UC02, passo 5 e fluxos 5B e 5C; UC18, passo 3 | Campos `membro.foto`, `perfil.foto` e `grupo.foto` no dicionário de dados |
| **RN21**: dados e permissões do evento | UC14, passo 6 e fluxos 5B e 3A | Modelo lógico: `NOT NULL` em `evento.titulo`, `evento.tipo` e `evento.data_evento`, `CHECK` em `evento.tipo`, `ck_evento_periodo` e `ck_evento_horas` (com `evento.data_fim`), e `evento.id_criador` |
| **RN20**: só o responsável muda o status | UC05, fluxo 5D; UC07, pré-condição e fluxo 1A | Diagramas de atividades "Concluir atividade" e "Cadastrar atividade"; método `Atividade.podeMudarStatus` no diagrama de classes; gatilho `conferir_atividade` no banco |
| **RN22**: convite | UC16, passos 2 e 7 e fluxos 7A a 7C | Tabela `convite` e função `entrar_com_codigo` no script do banco |
| **RN23**: registro diário do progresso | UC08, passo 9 | Tabela `progresso_historico` e gatilho `registrar_progresso` no script do banco |
| **RN24**: espaço pessoal | UC17; UC05, fluxo 1D; UC01, fluxos 3C e 3D | Coluna `grupo.pessoal`, função `garantir_espaco_pessoal`, gatilho `conferir_atividade` e regras de acesso que barram membros e convites no espaço pessoal |
| **RN25**: lembrete por e-mail | UC21 | Funções `lembretes_do_dia` e `enviar_lembretes`, colunas `perfil.lembrete_email` e `perfil.ultimo_lembrete` e o agendamento diário (pg_cron) |
| **RN26**: perfil da conta em todos os grupos | UC18, passo 5; UC02, fluxo 5D; UC16, passo 7 | Tabela `perfil`, gatilho `conferir_perfil` e a cópia do perfil em `entrar_com_codigo` |
| **RN28**: saída do grupo | UC22, passos 2 a 5 e fluxos 2A, 2B e 5A | Coluna `membro.data_saida`, função `sair_do_grupo`, as funções de acesso que só contam quem está no grupo e a volta em `entrar_com_codigo` |
| **RN29**: histórico do grupo só para leitura | UC23 | Tabela `registro`, gatilhos `registrar_mudanca` e regra de acesso só de leitura; na demonstração, `lib/registro.js` |
| **RN27**: feedback anônimo, lido só pela equipe | Telas Feedback e Respostas do feedback (RF32) | Tabelas `feedback` e `equipe`, função `eh_equipe`, gatilho `conferir_feedback` e regras de acesso por linha |

---

## Requisitos não funcionais

| Requisito | Onde é verificado |
|---|---|
| **RNF01**: responsividade | Todas as telas, em larguras de celular, tablet e computador |
| **RNF02**: persistência entre sessões | Recarregar a página após qualquer cadastro; com conta, abrir o grupo em outro navegador |
| **RNF03**: mensagem de erro por campo | UC01 fluxo 6A, UC03 fluxo 5A, UC05 fluxo 6A |
| **RNF04**: resposta em até 1 segundo na busca | UC06 |
| **RNF05**: compatibilidade entre navegadores | Chrome, Firefox e Edge |
| **RNF06**: padronização visual | Todas as telas; tokens de cor, tipografia e componentes |
| **RNF07**: mensagem em listagem vazia | UC01 fluxo 2A, UC03 fluxo 2A, UC08 fluxo 2A, UC09 fluxo 1A, UC13 fluxo 2A |
| **RNF08**: recálculo em até 1 segundo | UC07, pós-condições |
| **RNF09**: progresso legível sem depender da cor | UC08, passo 5: percentual exibido em número junto à barra |
| **RNF10**: degradação com serviço externo fora do ar | UC02 fluxo 4A (avatar vira iniciais), UC08 fluxos 4A e 4B (fonte reserva e reaproveitamento), UC15 fluxo 4C (sem conexão com o servidor) |
| **RNF11**: segurança no banco | UC15, pós-condições; UC16, fluxo 1A; UC19, fluxo 3A; verificações do banco (`banco-de-dados/05-verificacoes.sql`) |

---

## Implementação e testes

Atualizado em 11/11/2026, sobre a versão da entrega de 27/11 (tag `entrega-27-11-2026`). Os caminhos são relativos a `src/src/`. Os testes estão em [Casos de Teste](15-casos-de-teste.md) e os defeitos em [Defeitos e Pendências](16-defeitos-e-pendencias.md).

### Requisitos funcionais

| Requisito | Implementação | Teste | Estado atual |
|---|---|---|---|
| **RF01**: Criar, editar, selecionar e excluir grupos | `components/layout/AppShell.jsx`, `components/grupos/FormGrupo.jsx`, `pages/Membros.jsx`, `pages/publicas/Entrar.jsx`, `context/AuthContext.jsx`, `context/DataContext.jsx`, `lib/remoto.js` | CT01, CT02, CT38, CT40, CT53, CT58, CT71 | Implementado e testado |
| **RF02**: Gerenciar membros | `pages/Membros.jsx`, `components/membros/FormMembro.jsx`, `lib/validacao.js` | CT03, CT04, CT21, CT22, CT23, CT31, CT76 | Implementado e testado |
| **RF03**: Cadastrar, editar e excluir atividades | `pages/AtividadeForm.jsx`, `pages/AtividadeDetalhe.jsx`, `components/ui/campo-data.jsx`, `components/ui/selecao.jsx`, `components/opcoes.jsx`, `lib/validacao.js` | CT09, CT10, CT17, CT21, CT37, CT44, CT48, CT70 | Implementado e testado |
| **RF04**: Listar com busca, filtros e ordenação | `pages/Atividades.jsx`, `components/ui/selecao.jsx`, `components/opcoes.jsx`, `components/atividades/CartoesSituacao.jsx`, `components/atividades/LinhaAtividade.jsx`, `lib/situacoes.js` | CT13, CT70 | Implementado e testado |
| **RF05**: Detalhe e alteração de status | `pages/AtividadeDetalhe.jsx`, `components/atividades/LinhaAtividade.jsx`, `components/atividades/useAlternarConclusao.jsx`, `lib/permissoes.js` | CT11, CT12, CT42, CT75; `verificacoes/permissoes.js` | Implementado e testado |
| **RF06**: Painel com totais, atrasadas e próximas entregas | `pages/Painel.jsx`, `lib/situacoes.js` | CT14 | Implementado e testado |
| **RF07**: Sinalizar prazo em feriado nacional | `lib/feriados.js`, `hooks/useFeriados.js`, `pages/AtividadeForm.jsx`, `pages/AtividadeDetalhe.jsx`, `pages/Painel.jsx` | CT27, CT29 | Implementado e testado, com a BrasilAPI simulada |
| **RF08**: Alternar tema claro e escuro | `context/TemaContext.jsx`, `components/BotaoTema.jsx`, `components/layout/AppShell.jsx`, `components/layout/LayoutPublico.jsx`, `index.css` | CT25 | Implementado e testado |
| **RF09**: Voltar ao espaço pessoal e sair da conta | `components/layout/AppShell.jsx`, `routes/ProtectedRoute.jsx`, `context/AuthContext.jsx`, `context/ContaContext.jsx` | CT24, CT65 | Implementado e testado |
| **RF10**: Progresso do conteúdo | `lib/progresso.js`, `pages/DisciplinaDetalhe.jsx` | CT11, CT12, CT37, CT48; `verificacoes/progresso.js` | Implementado e testado |
| **RF11**: Progresso por disciplina | `lib/progresso.js`, `pages/Disciplinas.jsx`, `pages/Painel.jsx` | CT11, CT14, CT37, CT48, CT50; `verificacoes/progresso.js` | Implementado e testado |
| **RF12**: Histórico de progresso | `lib/historico.js`, `components/disciplinas/HistoricoProgresso.jsx`, `components/disciplinas/GraficoProgresso.jsx`; gatilho `registrar_progresso` no banco | CT59, CT68; `verificacoes/banco.js`, `05-verificacoes.sql` | Implementado e testado |
| **RF13**: Gerenciar disciplinas | `pages/Disciplinas.jsx`, `components/disciplinas/FormDisciplina.jsx`, `lib/validacao.js` | CT06, CT07, CT26 | Implementado e testado |
| **RF14**: Gerenciar conteúdos | `pages/DisciplinaDetalhe.jsx`, `components/disciplinas/FormConteudo.jsx`, `lib/validacao.js` | CT08, CT49 | Implementado e testado |
| **RF15**: Experiência por atividade concluída | `lib/gamificacao.js`, `components/atividades/RetornoConclusao.jsx` | CT11, CT12; `verificacoes/gamificacao.js` | Implementado e testado |
| **RF16**: Ofensiva | `lib/gamificacao.js`, `components/gamificacao/SeuRitmo.jsx`, `pages/Conquistas.jsx` | CT14, CT18; `verificacoes/ofensiva.js` | Implementado e testado |
| **RF17**: Conquistas | `lib/gamificacao.js`, `context/DataContext.jsx`, `pages/Conquistas.jsx`, `components/layout/AppShell.jsx` (avisos) | CT11, CT12, CT18, CT74; `verificacoes/conquistas.js` | Implementado e testado |
| **RF18**: Painel de desempenho do grupo | `pages/Conquistas.jsx` | CT18 | Implementado e testado |
| **RF19**: Avatar do membro | `lib/avatar.js`, `components/ui/avatar-membro.jsx`, `components/membros/FormMembro.jsx`, `components/membros/SeletorAvatar.jsx`, `lib/migracao.js` | CT05, CT27, CT47, CT50; `verificacoes/avatar.js` | Implementado e testado |
| **RF20**: Demonstração e dados de exemplo | `lib/seed.js`, `pages/publicas/Entrar.jsx`, `components/conta/PainelLogin.jsx`, `context/ContaContext.jsx`, `lib/migracao.js` | CT28, CT65, CT81, CT85 | Implementado e testado |
| **RF21**: Próximos feriados nacionais | `components/ProximosFeriados.jsx`, `pages/Painel.jsx`, `lib/feriados.js` | CT27, CT29 | Implementado e testado, com a BrasilAPI simulada |
| **RF22**: Sinalizar prazo em fim de semana | `lib/datas.js`, `pages/AtividadeForm.jsx`, `pages/AtividadeDetalhe.jsx` | CT30 | Implementado e testado |
| **RF23**: Calendário | `pages/Calendario.jsx`, `components/ui/campos.jsx`, `index.css` | CT15, CT16, CT17, CT29, CT43, CT52, CT82 | Implementado e testado |
| **RF24**: Foto de perfil | `lib/foto.js`, `lib/fotosRemotas.js`, `components/ui/editor-foto.jsx`, `pages/Perfil.jsx`, `components/membros/FormMembro.jsx`, `components/ui/avatar-membro.jsx` | CT04, CT05, CT19, CT39, CT66, CT76; `verificacoes/foto.js`, `verificacoes/banco.js` | Implementado e testado |
| **RF25**: Paleta de cores das disciplinas | `lib/constants.js`, `components/disciplinas/SeletorCor.jsx` | CT06, CT35 | Implementado e testado |
| **RF26**: Páginas públicas | `pages/publicas/Inicio.jsx`, `pages/publicas/Sobre.jsx`, `components/layout/LayoutPublico.jsx`, `components/publicas/movimento.jsx`, `index.css` | CT25, CT33, CT54 | Implementado e testado |
| **RF27**: Acesso com conta Google ou e-mail | `context/ContaContext.jsx`, `components/conta/PainelLogin.jsx`, `pages/publicas/Entrar.jsx`, `context/AuthContext.jsx`, `lib/supabase.js` | CT57, CT58, CT65, CT69 | Implementado e testado com e-mail e senha; o login com Google é conferido no sistema publicado |
| **RF28**: Convite para o grupo | `lib/convite.js`, `components/membros/DialogoConvite.jsx`, `components/conta/EntrarComCodigo.jsx`, `components/layout/AppShell.jsx`, `pages/publicas/Convite.jsx`; função `entrar_com_codigo` no banco | CT60, CT61, CT62, CT71, CT72; `05-verificacoes.sql` | Implementado e testado |
| **RF29**: Foto do grupo | `components/ui/avatar-grupo.jsx`, `components/ui/editor-foto.jsx`, `components/grupos/FormGrupo.jsx`, `components/layout/AppShell.jsx` | CT40 | Implementado e testado |
| **RF30**: Criar conteúdo a partir do formulário de atividade | `pages/AtividadeForm.jsx`, `components/disciplinas/FormConteudo.jsx` | CT41 | Implementado e testado |
| **RF31**: Eventos, de um ou de vários dias | `pages/Eventos.jsx`, `components/eventos/`, `pages/Calendario.jsx`, `pages/Painel.jsx`, `context/DataContext.jsx`, `lib/validacao.js`, `lib/permissoes.js` | CT51, CT52, CT77, CT83; `verificacoes/atividades.js`, `verificacoes/permissoes.js` | Implementado e testado |
| **RF32**: Feedback dentro do sistema | `lib/feedback.js`, `pages/publicas/Feedback.jsx`, `pages/FeedbackRespostas.jsx`, `components/feedback/`, `components/layout/LayoutPublico.jsx`, `components/layout/AppShell.jsx` | CT56, CT86 a CT88 | Implementado e testado |
| **RF33**: Tutorial opcional | `components/tutorial/Tutorial.jsx`, `pages/Painel.jsx`, `components/layout/AppShell.jsx` | CT67 | Implementado e testado |
| **RF34**: Espaço pessoal | `context/AuthContext.jsx`, `context/DataContext.jsx`, `components/layout/AppShell.jsx`, `pages/Painel.jsx`, `pages/Atividades.jsx`, `pages/Calendario.jsx`, `pages/Eventos.jsx`, `pages/Conquistas.jsx`, `hooks/usePermissoes.js`, `lib/remoto.js`, `lib/migracao.js`; função `garantir_espaco_pessoal` no banco | CT69, CT70, CT81, CT85; `verificacoes/migracao.js`, `05-verificacoes.sql` | Implementado e testado |
| **RF35**: Perfil da conta | `pages/Perfil.jsx`, `context/DataContext.jsx`, `lib/validacao.js`, `lib/fotosRemotas.js`; tabela `perfil` e gatilho `conferir_perfil` no banco | CT05, CT72, CT76; `05-verificacoes.sql` | Implementado e testado |
| **RF36**: Lembrete por e-mail | Funções `lembretes_do_dia` e `enviar_lembretes` no banco (`04-script-criacao.sql`, seção 7), `pages/Perfil.jsx` (ligar e desligar) | CT80; `05-verificacoes.sql` | Implementado e testado com o envio simulado; o envio real depende da chave do Brevo no Supabase |
| **RF37**: Atividades em lote | `pages/AtividadesEmLote.jsx`, `pages/Atividades.jsx`, `components/atividades/LinhaAtividade.jsx`, `context/DataContext.jsx` | CT78, CT79 | Implementado e testado |
| **RF38**: "A definir" e Assumir | `components/opcoes.jsx`, `components/atividades/LinhaAtividade.jsx`, `pages/AtividadeDetalhe.jsx`, `lib/permissoes.js`, `hooks/usePermissoes.js`; gatilho `conferir_atividade` no banco | CT09, CT73; `verificacoes/permissoes.js`, `05-verificacoes.sql` | Implementado e testado |
| **RF39**: Sair do grupo | `components/grupos/SairDoGrupo.jsx`, `pages/Membros.jsx`, `components/layout/AppShell.jsx`, `lib/registro.js`, `context/DataContext.jsx`; função `sair_do_grupo` no banco | CT89, CT90, CT92; `verificacoes/registro.js`, `05-verificacoes.sql` | Implementado e testado |
| **RF40**: Histórico do grupo | `components/grupos/HistoricoDoGrupo.jsx`, `components/ui/dialogo.jsx` (painel lateral), `lib/registro.js`, `context/DataContext.jsx`; tabela `registro` e gatilhos no banco | CT91, CT92; `verificacoes/registro.js`, `05-verificacoes.sql` | Implementado e testado |

**Resumo:** os 40 requisitos funcionais estão implementados e testados.

### Requisitos não funcionais verificados nesta entrega

| Requisito | Implementação | Teste | Estado atual |
|---|---|---|---|
| **RNF01**: responsividade | Classes responsivas em todas as telas; `components/layout/AppShell.jsx` | CT34, CT43, CT84 | Implementado e testado |
| **RNF02**: persistência entre sessões | `lib/remoto.js`, `context/DataContext.jsx`, `lib/storage.js`, `lib/migracao.js`; `07-atualizacao-11-11.sql` | CT19, CT32, CT35, CT36, CT50, CT59, CT63, CT64, CT85 | Implementado e testado |
| **RNF03**: mensagem de erro por campo | `lib/validacao.js`, `components/ui/campos.jsx` | CT01, CT03, CT05, CT07, CT09, CT44, CT51 | Implementado e testado |
| **RNF05**: compatibilidade entre navegadores | Ainda não | Executado no Chromium | Firefox e Edge pendentes (T51) |
| **RNF06**: padronização visual e menos movimento | `index.css`, `components/ui/`, `components/publicas/movimento.jsx` | CT45, CT46, CT54, CT55 | Implementado e testado |
| **RNF07**: mensagem em listagem vazia | `components/ui/basicos.jsx` | CT02 | Implementado e testado |
| **RNF09**: progresso legível sem depender da cor | `components/ui/progresso.jsx` | CT11, CT14 | Implementado e testado |
| **RNF10**: serviço externo fora do ar | `lib/feriados.js`, `components/ui/avatar-membro.jsx` | CT27 | Implementado e testado |
| **RNF11**: segurança no banco | `banco-de-dados/04-script-criacao.sql` (regras de acesso por linha e gatilhos) | CT64, CT66, CT73; 77 conferências em `05-verificacoes.sql` | Implementado e testado |

---

## Verificação cruzada

- Todo caso de uso tem origem em pelo menos um requisito funcional.
- Todo requisito funcional aparece em pelo menos um caso de uso e em pelo menos uma tela.
- Toda entidade do modelo de dados tem origem em um requisito: `grupo` (RF01), `membro` (RF02), `disciplina` (RF13), `conteudo` (RF14), `atividade` (RF03), `progresso_historico` (RF12), `conquista` e `membro_conquista` (RF17), `evento` (RF31), `convite` (RF28), `perfil` (RF35), `feedback` e `equipe` (RF32), `registro` (RF40).
- Todo serviço externo consumido pelo sistema está representado como ator secundário no diagrama de casos de uso e tem comportamento previsto para a sua indisponibilidade: BrasilAPI e Nager.Date (RN17), Supabase e Google (sem eles, o modo com conta fica indisponível e o de demonstração continua, RNF10) e Brevo (sem ele, o lembrete do dia não sai, e o sistema continua igual). A DiceBear deixou de ser serviço externo em 01/11/2026: os avatares passaram a ser desenhados pelo próprio sistema (RN15).
- Nenhuma tela apresenta funcionalidade que não esteja documentada como requisito. Esta verificação foi refeita em 17/09/2026, percorrendo o código tela a tela; as funcionalidades encontradas sem requisito correspondente originaram os requisitos RF19 a RF22 e as regras RN15 a RN17. Foi refeita de novo em 28/10/2026, na revisão pedida pela professora, que originou os requisitos RF23 a RF28 e as regras RN18 e RN19, em 29/10/2026, nos ajustes da versão 2, que originaram os requisitos RF29 e RF30 e a regra RN20, em 03/11/2026, que originou os requisitos RF31 e RF32 e a regra RN21, em 08/11/2026, com o banco e o acesso com conta, que originou o requisito RF33 e as regras RN22 e RN23, e em 11/11/2026, com as considerações da equipe e dos usuários de teste, que originou os requisitos RF34 a RF38 e as regras RN24 a RN26.
- Os nomes usados nos requisitos, nos casos de uso, nas classes, nas tabelas e nas telas são os mesmos: grupo, espaço pessoal, perfil, membro, disciplina, conteúdo, atividade, evento, progresso, conquista.
- Todo requisito marcado como **Sim** na coluna do MVP tem tela prototipada em [`prototipos/`](../prototipos/01-telas-e-navegacao.md). As telas da versão 2, que cobrem também os requisitos desejáveis, estão no mesmo documento.
- Toda tarefa de desenvolvimento do [backlog](12-backlog.md) cita o requisito que a origina; as que não citam são de organização do projeto: revisão da documentação, publicação e atualização das dependências. Não há requisito do MVP sem tarefa.

---

### Navegação

[⬅ Anterior: Casos de Uso](10-casos-de-uso.md) · [Índice](../README.md)
